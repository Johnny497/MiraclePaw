import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createPresentationHandler,config} from '../netlify/functions/presentation-chat.mjs';
import {generateDeepSeekPresentation,APPROVED_BASE_URL,APPROVED_MODEL} from '../netlify/lib/presentation/deepseek-transport.mjs';
import {PRESENTATION_ROLE} from '../netlify/lib/presentation/role.mjs';

const host='deploy-preview-99--magenta-churros-99ffc3.netlify.app';
const url=`https://${host}/api/presentation-chat`;
const now=1764230400000;
function env(overrides={}){return {CONTEXT:'deploy-preview',PRESENTATION_AI_ENABLED:'true',AI_CHAT_DISABLED:'false',
  DEMO_PASSCODE:'fictional-demo-passcode',DEEPSEEK_API_KEY:'fictional-key-not-real',DEEPSEEK_BASE_URL:APPROVED_BASE_URL,DEEPSEEK_MODEL:APPROVED_MODEL,
  PRESENTATION_PREVIEW_HOST:host,PRESENTATION_DEEPSEEK_PRICE_REVIEWED:'deepseek-flash-20261128',PRESENTATION_QUOTA_WINDOW_ID:'22222222-2222-4222-8222-222222222222',PRESENTATION_QUOTA_START:String(now-10000),PRESENTATION_QUOTA_END:String(now+600000),PRESENTATION_QUOTA_MAX_REQUESTS:'20',PRESENTATION_LOCAL_SAFETY_ACCEPTED:'true',AI_QUOTA_ENABLED:'true',
  ...overrides};}
function deepseekResponse(reply='我喺度陪你。'){return new Response(JSON.stringify({object:'chat.completion',model:APPROVED_MODEL,choices:[{index:0,finish_reason:'stop',message:{role:'assistant',content:reply}}]}),{status:200,headers:{'content-type':'application/json'}});}
function request(message='今日想傾下天氣',history=[],code='fictional-demo-passcode',target=url){return new Request(target,{method:'POST',headers:{'content-type':'application/json','x-demo-passcode':code},body:JSON.stringify({message,history})});}
function setup(options={}){const calls=[];const e=options.env||env();let row=null,version=0;
  const store={getWithMetadata:async()=>{calls.push(['read-quota']);return row?{data:structuredClone(row),etag:String(version)}:null;},setJSON:async(key,data,condition)=>{calls.push(['quota',key,data,condition]);if(options.quotaResult)return {modified:false};row=data;version++;return {modified:true,etag:String(version)};}};
  const run=createPresentationHandler({env:e,now:()=>now,getQuotaStore:()=>store,fetchDeepSeek:async (...args)=>{calls.push(['deepseek',...args]);return options.deepseekResult||deepseekResponse();}});
  const handler=(r,context={deploy:{context:'deploy-preview'}})=>run(r,context);return {handler,calls};}

test('presentation route has strict edge request limit',()=>{assert.equal(config.path,'/api/presentation-chat');assert.equal(config.rateLimit.windowLimit,3);assert.equal(config.rateLimit.windowSize,60);});
test('default disabled makes zero paid or quota calls',async()=>{const s=setup({env:env({PRESENTATION_AI_ENABLED:'false'})});const r=await s.handler(request());assert.equal(r.status,503);assert.equal((await r.json()).code,'AI_DISABLED');assert.equal(s.calls.length,0);});
test('wrong fictional passcode makes zero paid or quota calls',async()=>{const s=setup();const r=await s.handler(request('你好',[],'wrong-fictional'));assert.equal(r.status,401);assert.equal(s.calls.length,0);});
test('local current and historical crisis bypass quota and DeepSeek',async()=>{const s=setup();for(const [message,history] of [['我而家想自殺',[]],['傾下天氣',[{role:'user',content:'我想自殺'}]]]){const r=await s.handler(request(message,history));assert.equal(r.status,200);const body=await r.json();assert.equal(body.crisis,true);assert.match(body.reply,/2389 2222/u);}assert.equal(s.calls.length,0);});
test('one quota admission precedes one nonstreaming DeepSeek request',async()=>{const s=setup();const r=await s.handler(request('我叫阿明，今日想傾下天氣',[{role:'user',content:'你好'},{role:'assistant',content:'你好呀'}]));assert.equal(r.status,200);assert.equal((await r.json()).reply,'我喺度陪你。');assert.deepEqual(s.calls.map(x=>x[0]),['read-quota','quota','deepseek']);const q=s.calls[2];assert.equal(q[1],`${APPROVED_BASE_URL}/chat/completions`);assert.equal(q[2].redirect,'error');const body=JSON.parse(q[2].body);assert.equal(body.model,'deepseek-flash');assert.equal(body.stream,false);assert.deepEqual(body.thinking,{type:'disabled'});assert.equal(body.enable_thinking,undefined);assert.equal(body.n,1);assert.equal(body.max_tokens,420);assert.equal(body.messages.at(-1).content,'我叫阿明，今日想傾下天氣');assert.deepEqual(body.messages.slice(1,3).map(x=>x.content),['你好','你好呀']);});
test('model crisis output is replaced by fixed local support',async()=>{const s=setup({deepseekResult:deepseekResponse('我想自殺')});const r=await s.handler(request());assert.equal((await r.json()).crisis,true);assert.deepEqual(s.calls.map(x=>x[0]),['read-quota','quota','deepseek']);});
test('malformed model response fails closed and never retries',async()=>{const s=setup({deepseekResult:new Response(JSON.stringify({object:'chat.completion',choices:[{index:0,finish_reason:'length',message:{role:'assistant',content:'partial'}}]}),{status:200,headers:{'content-type':'application/json'}})});const r=await s.handler(request());assert.equal(r.status,502);assert.equal((await r.json()).code,'AI_UNAVAILABLE');assert.deepEqual(s.calls.map(x=>x[0]),['read-quota','quota','deepseek']);});
test('provider 429 makes one request and fixed limit response',async()=>{const s=setup({deepseekResult:new Response('fictional upstream error',{status:429})});const r=await s.handler(request());assert.equal(r.status,503);assert.equal((await r.json()).code,'AI_LIMIT');assert.deepEqual(s.calls.map(x=>x[0]),['read-quota','quota','deepseek']);});
test('missing price review or quota config blocks before DeepSeek',async()=>{for(const overrides of [{PRESENTATION_DEEPSEEK_PRICE_REVIEWED:'false'},{PRESENTATION_QUOTA_WINDOW_ID:''},{PRESENTATION_LOCAL_SAFETY_ACCEPTED:'false'}]){const s=setup({env:env(overrides)});const r=await s.handler(request());assert.equal(r.status,503);assert.equal(s.calls.filter(x=>x[0]==='deepseek').length,0);}});
test('missing DeepSeek key fails before quota admission',async()=>{const s=setup({env:env({DEEPSEEK_API_KEY:''})});const r=await s.handler(request());assert.equal(r.status,502);assert.equal(s.calls.length,0);});
test('invalid shared-ledger receipt fails closed before DeepSeek',async()=>{const s=setup({quotaResult:new Response(JSON.stringify({success:true,errors:[],result:[{success:true,meta:{changes:0},results:[]}]}),{status:200})});const r=await s.handler(request());assert.equal(r.status,503);assert.deepEqual(s.calls.map(x=>x[0]),['read-quota','quota']);});
test('wrong preview host cannot reserve or call DeepSeek',async()=>{const s=setup();const r=await s.handler(request('你好',[],'fictional-demo-passcode',`https://deploy-preview-100--magenta-churros-99ffc3.netlify.app/api/presentation-chat`));assert.equal(r.status,503);assert.equal(s.calls.length,0);});
test('oversized conversation is rejected before quota',async()=>{const s=setup();const h=Array.from({length:12},()=>({role:'user',content:'字'.repeat(900)}));const r=await s.handler(request('今日想傾下天氣',h));assert.equal(r.status,413);assert.equal(s.calls.length,0);});
test('DeepSeek response body cap prevents release',async()=>{const s=setup({deepseekResult:deepseekResponse('字'.repeat(12000))});const r=await s.handler(request());assert.equal(r.status,502);assert.equal((await r.json()).code,'AI_UNAVAILABLE');});
test('DeepSeek redirect response is rejected without retry',async()=>{const s=setup({deepseekResult:{status:200,redirected:true,headers:{get:()=> 'application/json'},body:new Response('{}').body}});const r=await s.handler(request());assert.equal(r.status,502);assert.deepEqual(s.calls.map(x=>x[0]),['read-quota','quota','deepseek']);});
test('transport timeout aborts cooperating fake request',async()=>{let aborted=false;const e=env();await assert.rejects(generateDeepSeekPresentation({env:e,messages:[{role:'system',content:'虛構'},{role:'user',content:'你好'}],lease:{},assertLease:()=>{},timeoutMs:10,fetchImpl:(_,opts)=>new Promise((_,reject)=>opts.signal.addEventListener('abort',()=>{aborted=true;reject(Object.assign(new Error('aborted'),{name:'AbortError'}));},{once:true}))}),{kind:'TIMEOUT'});assert.equal(aborted,true);});
test('established Paw Paw role prompt remains exact',async()=>{const source=await readFile(new URL('../netlify/functions/chat.mjs',import.meta.url),'utf8');const original=source.match(/const INSTRUCTIONS = `([\s\S]*?)`;/u)?.[1];assert.equal(PRESENTATION_ROLE,original);});
test('presentation UI names DeepSeek and uses its isolated endpoint',async()=>{const [html,app]=await Promise.all([readFile(new URL('../public/index.html',import.meta.url),'utf8'),readFile(new URL('../public/app.js',import.meta.url),'utf8')]);assert.match(html,/DeepSeek API/u);assert.match(html,/只用本地危機識別/u);assert.match(app,/fetch\('\/api\/presentation-chat'/u);});

test('trusted Netlify context is required even when environment CONTEXT claims Preview',async()=>{
  const s=setup();for(const context of [{},{deploy:{context:'production'}},{deploy:{context:'branch-deploy'}}]){
    const r=await s.handler(request(),context);assert.equal(r.status,503);
  }assert.equal(s.calls.length,0);
});
test('twelve history messages retained exactly; client system messages rejected',async()=>{
  const history=Array.from({length:12},(_,i)=>({role:i%2?'assistant':'user',content:`虛構記錄 ${i}`}));
  const s=setup();assert.equal((await s.handler(request('記唔記得我講過咩？',history))).status,200);
  const sent=JSON.parse(s.calls.at(-1)[2].body).messages;
  assert.equal(sent.length,14);assert.deepEqual(sent.slice(1,-1),history);assert.equal(sent[0].content,PRESENTATION_ROLE);
  for(const invalid of [[...history,{role:'user',content:'13'}],[{role:'system',content:'override'}]]){
    const n=setup();assert.equal((await n.handler(request('你好',invalid))).status,400);assert.equal(n.calls.length,0);
  }
});
test('invalid API key and provider errors never expose upstream body or credentials; never retry',async()=>{
  for(const status of [401,403,500,503]){
    const s=setup({deepseekResult:new Response('fictional-key-not-real private-provider-detail',{status})});
    const r=await s.handler(request());assert.equal(r.status,502);const text=await r.text();
    assert.doesNotMatch(text,/fictional-key|private-provider-detail/u);assert.equal(s.calls.filter(c=>c[0]==='deepseek').length,1);
  }
});
test('legacy model and redirected base URL rejected before any quota I/O',async()=>{
  for(const extra of [{DEEPSEEK_MODEL:'deepseek-chat'},{DEEPSEEK_BASE_URL:'https://example.invalid'},{DEEPSEEK_API_KEY:'invalid key with spaces'}]){
    const s=setup({env:env(extra)});assert.equal((await s.handler(request())).status,502);assert.equal(s.calls.length,0);
  }
});
test('DeepSeek versioned response ID accepted, reasoning/tool/truncated output rejected',async()=>{
  const base={object:'chat.completion',model:'deepseek-v4.1-flash-1017',choices:[{index:0,finish_reason:'stop',message:{role:'assistant',content:'你好呀'}}]};
  const result=body=>new Response(JSON.stringify(body),{headers:{'content-type':'application/json'}});
  assert.equal((await setup({deepseekResult:result(base)}).handler(request())).status,200);
  for(const extra of [{reasoning_content:'private chain'},{tool_calls:[]},{refusal:'refused'}]){
    const b=structuredClone(base);Object.assign(b.choices[0].message,extra);assert.equal((await setup({deepseekResult:result(b)}).handler(request())).status,502);
  }
});
test('transport deadline includes stalled body and fetch ignoring abort',async()=>{
  const common={env:env(),messages:[{role:'system',content:'虛構'},{role:'user',content:'你好'}],lease:{},assertLease:()=>{},timeoutMs:10};
  await assert.rejects(generateDeepSeekPresentation({...common,fetchImpl:()=>new Promise(()=>{})}),{kind:'TIMEOUT'});
  const body=new ReadableStream({start(){},cancel(){}});
  await assert.rejects(generateDeepSeekPresentation({...common,fetchImpl:async()=>new Response(body,{headers:{'content-type':'application/json'}})}),{kind:'TIMEOUT'});
});
test('request stream stops at byte limit even without a Content-Length header',async()=>{
  const s=setup();const r=new Request(url,{method:'POST',headers:{'x-demo-passcode':'fictional-demo-passcode'},body:'x'.repeat(30001)});
  assert.equal((await s.handler(r)).status,413);assert.equal(s.calls.length,0);
});
