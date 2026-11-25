import test from 'node:test';
import assert from 'node:assert/strict';
import chat from '../netlify/functions/chat.mjs';
import sandbox from '../netlify/functions/deepseek-test.mjs';
import { reserveQuota, assertQuotaActive, RESERVE_SQL, QuotaDenied } from '../netlify/lib/quota.mjs';
import { preview, windowId, quotaEnv, quotaResult, setEnv } from './fixtures/quota.mjs';
import { moderation, verdict } from './fixtures/moderation.mjs';

const pass = 'fictional-private-test-passcode';
const env = { ...quotaEnv, AI_CHAT_ENABLED: 'true', AI_CHAT_DISABLED: 'false', DEEPSEEK_TEST_ENABLED: 'true',
  OPENAI_MODEL: 'gpt-5.4-mini', OPENAI_API_KEY: 'mock-only', DEEPSEEK_API_KEY: 'mock-only',
  DEMO_PASSCODE: pass, DEEPSEEK_TEST_PASSCODE: pass };
const handlers = { chat, sandbox };
const paths = { chat: '/api/chat', sandbox: '/api/deepseek-test' };
const replyText = '爪爪會陪你休息。';
const request = (route, { url = preview + paths[route], auth = pass, message = '虛構測試', history = [], method = 'POST' } = {}) =>
  new Request(url, { method, ...(method === 'POST' ? { headers: { 'x-demo-passcode': auth },
    body: JSON.stringify({ message, history }) } : {}) });
const approved = (n = 1, overrides = {}) => Response.json(quotaResult(n, overrides));
async function scenario(fn, options = {}) {
  const restore = setEnv({ ...env, ...options.env });
  const oldFetch = globalThis.fetch, oldNow = Date.now;
  const calls = [];
  let used = 0;
  globalThis.fetch = async (url, init) => {
    const entry = { url: String(url), body: JSON.parse(init.body), redirect: init.redirect, signal: init.signal };
    calls.push(entry);
    assert.equal(init.redirect, 'error');
    if (entry.url.startsWith('https://api.cloudflare.com/')) {
      assert.equal(entry.body.sql, RESERVE_SQL);
      assert.equal(entry.body.params[0], windowId);
      assert.ok(['65', '41'].includes(entry.body.params[1]));
      if (options.quota) return options.quota(entry);
      // Mock the atomic ledger response. Actual SQL write concurrency is independently tested in Python.
      if (used >= 20) return Response.json({ success: true, errors: [], result: [{success:true,meta:{changes:0},results:[]}] });
      return approved(++used);
    }
    if (options.provider) return options.provider(entry);
    if (entry.url.endsWith('/moderations')) return Response.json(moderation(Array.isArray(entry.body.input) ? entry.body.input.length : 1));
    if (entry.url.endsWith('/responses')) return Response.json({ output_text: replyText });
    if (entry.url.endsWith('/completions')) return Response.json({ choices: [{ message: { content: replyText } }] });
    throw Error('unexpected offline destination');
  };
  try {
    const result = await fn({calls, used: () => used});
    return { result, calls, used };
  } finally { globalThis.fetch = oldFetch; Date.now = oldNow; restore(); }
}
const quotaCalls = calls => calls.filter(c => c.url.startsWith('https://api.cloudflare.com/'));
const providerCalls = calls => calls.filter(c => !c.url.startsWith('https://api.cloudflare.com/'));
async function denyRoute(response, route) {
  assert.equal(response.status, 503);
  const data = await response.json();
  assert.equal(data.code, route === 'chat' ? 'AI_LIMIT' : 'SANDBOX_LIMIT');
  assert.equal(data.reply, undefined);
  assert.match(response.headers.get('cache-control'), /no-store/);
}
for (const route of Object.keys(handlers)) {
  test(`${route}: quota reservation precedes every normal pipeline; ledger sees no personal content`, async () => {
    const {result,calls,used} = await scenario(() => handlers[route](request(route, {message:'fictional-private-content'})));
    assert.equal(result.status, 200); assert.equal((await result.json()).reply, replyText);
    assert.equal(used, 1); assert.equal(calls.length, 4);
    assert.equal(quotaCalls(calls).length, 1); assert.equal(calls[0], quotaCalls(calls)[0]);
    assert.deepEqual(Object.keys(calls[0].body).sort(), ['params','sql']);
    assert.doesNotMatch(JSON.stringify(calls[0].body), /fictional-private-content|fictional-private-test-passcode|mock-only/);
    assert.deepEqual(providerCalls(calls).map(c => c.url.split('/').pop()), ['moderations', route==='chat'?'responses':'completions', 'moderations']);
  });
  test(`${route}: missing quota config or price approval fails closed with zero network`, async () => {
    for (const key of Object.keys(quotaEnv)) {
      const {result,calls} = await scenario(() => handlers[route](request(route)), {env:{[key]:undefined}});
      await denyRoute(result,route); assert.equal(calls.length,0,key);
    }
  });
  test(`${route}: production context, alternate URL and invalid config cannot reserve`, async () => {
    for (const overrides of [{CONTEXT:'production'}, {AI_QUOTA_ENABLED:'TRUE'}, {AI_QUOTA_D1_ACCOUNT_ID:'bad'}, {AI_QUOTA_WINDOW_ID:'bad'}]) {
      const {result,calls} = await scenario(() => handlers[route](request(route)), {env:overrides});
      await denyRoute(result,route); assert.equal(calls.length,0);
    }
    const {result,calls} = await scenario(() => handlers[route](request(route,{url:'https://example.test'+paths[route]})));
    await denyRoute(result,route); assert.equal(calls.length,0);
  });
  test(`${route}: kill switch, wrong passcode, invalid input and local crisis do not consume quota`, async () => {
    for (const [req, overrides, code] of [
      [request(route), {AI_CHAT_DISABLED:'true'}, 503], [request(route,{auth:'wrong'}),{},401],
      [request(route,{message:''}),{},400], [request(route,{message:'我想死'}),{},200], [request(route,{method:'GET'}),{},405]]) {
      const {result,calls}=await scenario(()=>handlers[route](req),{env:overrides});
      assert.equal(result.status,code); assert.equal(calls.length,0);
      if(code===200)assert.match((await result.json()).reply,/2389 2222.*2382 0000/);
    }
  });
  test(`${route}: quota service outage, ambiguous response or exhausted row blocks all AI calls without retry`, async () => {
    for (const quota of [() => {throw Error('offline secret');}, () => new Response('internal details',{status:503}),
      () => Response.json({success:true,errors:[],result:[{success:true,meta:{changes:0},results:[]}]}),
      () => Response.json({success:false}), () => new Response('not JSON'),
      () => Response.json({...quotaResult(),errors:[{code:1000}]}), () => approved(21),
      () => approved(1,{reserved_hkd_cents:0}), () => approved(1,{window_id:'different'}),
      () => approved(1,{expires_at:Math.floor(Date.now()/1000)}), () => approved(1,{expires_at:Math.floor(Date.now()/1000)+3600})]) {
      const {result,calls} = await scenario(()=>handlers[route](request(route)),{quota});
      await denyRoute(result,route); assert.equal(calls.length,1); assert.equal(providerCalls(calls).length,0);
    }
  });
  test(`${route}: provider failure and safety filtering consume one irrevocable admission`, async () => {
    for (const provider of [() => new Response('down',{status:429}), () => Response.json({results:[verdict({harassment:true})]})]) {
      const {result,calls,used} = await scenario(()=>handlers[route](request(route)),{provider});
      assert.ok([200,503].includes(result.status)); assert.equal(used,1);
      assert.equal(quotaCalls(calls).length,1); assert.equal(providerCalls(calls).length,1);
    }
  });
  test(`${route}: expiry during moderation prevents generation and never refunds`, async () => {
    const now=Date.now();
    const {result,calls,used} = await scenario(()=>handlers[route](request(route)),{
      provider:()=>{Date.now=()=>now+1600000;return Response.json(moderation());}
    });
    await denyRoute(result,route); assert.equal(used,1); assert.equal(providerCalls(calls).length,1);
  });
  test(`${route}: kill switch change during moderation prevents generation`, async () => {
    const {result,calls,used} = await scenario(()=>handlers[route](request(route)),{
      provider:()=>{process.env.AI_CHAT_DISABLED='true';return Response.json(moderation());}
    });
    await denyRoute(result,route); assert.equal(used,1); assert.equal(providerCalls(calls).length,1);
  });
}
test('mixed chat and sandbox concurrent flow shares one quota, permits at most 20 and no more than 60 provider calls', async()=>{
  const {result,calls,used}=await scenario(()=>Promise.all(Array.from({length:50},(_,i)=>{
    const route=i%2?'chat':'sandbox';return handlers[route](request(route));
  })));
  assert.equal(used,20); assert.equal(result.filter(r=>r.status===200).length,20);
  assert.equal(result.filter(r=>r.status===503).length,30); assert.equal(quotaCalls(calls).length,50);
  assert.equal(providerCalls(calls).length,60);
  assert.equal(providerCalls(calls).filter(c=>c.url.endsWith('/moderations')).length,40);
});
test('chat: non-reviewed model override cannot reserve or generate',async()=>{
  const {result,calls}=await scenario(()=>chat(request('chat')),{env:{OPENAI_MODEL:'unreviewed-model'}});
  await denyRoute(result,'chat'); assert.equal(calls.length,0);
});
test('chat: oversized untrusted output fails closed before output moderation',async()=>{
  const {result,calls,used}=await scenario(()=>chat(request('chat')),{provider:c=>c.url.endsWith('/moderations')?Response.json(moderation()):Response.json({output_text:'x'.repeat(1601)})});
  assert.equal(result.status,502); assert.equal((await result.json()).reply,undefined); assert.equal(used,1);assert.equal(providerCalls(calls).length,2);
});
test('lease requires approved route, window and remaining call time',async()=>{
  await scenario(async()=>{
    const lease=await reserveQuota('chat',preview+paths.chat);
    assert.doesNotThrow(()=>assertQuotaActive(lease,20000));
    assert.throws(()=>assertQuotaActive({...lease,expiresAt:Date.now()+1000},20000),QuotaDenied);
    process.env.AI_QUOTA_WINDOW_ID='changed';
    assert.throws(()=>assertQuotaActive(lease,20000),QuotaDenied);
  });
});
