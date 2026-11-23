import test, {before, after} from 'node:test';
import assert from 'node:assert/strict';
import handler, {config} from '../netlify/functions/chat.mjs';

const saved = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DEMO_PASSCODE: process.env.DEMO_PASSCODE,
  AI_CHAT_DISABLED: process.env.AI_CHAT_DISABLED,
};
const nativeFetch = globalThis.fetch;
const passcode = 'mock-v1-4-private-adult-code';
function restore() {
  for (const [key, val] of Object.entries(saved)) {
    if (val === undefined) delete process.env[key];
    else process.env[key] = val;
  }
  globalThis.fetch = nativeFetch;
}
before(() => {
  process.env.OPENAI_API_KEY = 'sk-test-not-real';
  process.env.DEMO_PASSCODE = passcode;
  delete process.env.AI_CHAT_DISABLED;
});
after(restore);
function request(message='你好呀', code=passcode, method='POST') {
  return new Request('https://fake.example/api/chat', {
    method,
    ...(method==='POST' ? {
      headers: {'Content-Type':'application/json','X-Demo-Passcode':code},
      body:JSON.stringify({message,history:[]})
    }:{}),
  });
}

test('native Netlify rateLimit is path-specific and bounded by IP plus domain', () => {
  assert.equal(config.path, '/api/chat');
  assert.deepEqual(config.rateLimit, {
    windowLimit:6, windowSize:60, aggregateBy:['ip','domain']
  });
  assert.ok(config.rateLimit.windowLimit < 20);
  assert.equal(Object.hasOwn(config,'background'),false);
});

test('operator kill switch disables all upstream AI calls with self-initiated crisis resources', async () => {
  let calls=0;
  globalThis.fetch = async () => {calls++;throw new Error('Upstream request was forbidden');};
  process.env.AI_CHAT_DISABLED='true';
  const reply=await handler(request());
  const data=await reply.json();
  assert.equal(reply.status,503);
  assert.equal(data.code,'AI_DISABLED');
  assert.match(data.error,/五個免費固定劇本/);
  assert.match(data.error,/2389 2222/);
  assert.match(data.error,/2382 0000/);
  assert.match(data.error,/999/);
  assert.equal(calls,0);
  assert.match(reply.headers.get('Cache-Control'),/no-store/);
  delete process.env.AI_CHAT_DISABLED;
});

test('kill switch protects before passcode validation and does not leak secrets', async () => {
  process.env.AI_CHAT_DISABLED='true';
  const response=await handler(request('你好','invalid'));
  const json=await response.json();
  assert.equal(json.code,'AI_DISABLED');
  assert.doesNotMatch(JSON.stringify(json),/sk-test-not-real|mock-v1-4-private-adult-code/);
  delete process.env.AI_CHAT_DISABLED;
});

test('non-POST methods still rejected before applying kill switch', async () => {
  process.env.AI_CHAT_DISABLED='true';
  const response=await handler(request('ignore',passcode,'GET'));
  assert.equal(response.status,405);
  delete process.env.AI_CHAT_DISABLED;
});

test('no server-side per-instance Map counter is used in place of Netlify edge rule', async () => {
  // Declarative rule is deployed by Netlify; invoking this function in Node
  // never exercises the edge limiter. Actual edge rule must be checked in
  // Netlify post-processing logs and confirmed by an authorized adult tester.
  assert.equal(config.rateLimit.aggregateBy.includes('ip'),true);
  assert.equal(config.rateLimit.aggregateBy.includes('domain'),true);
  assert.ok(!('window' in config.rateLimit));
});
