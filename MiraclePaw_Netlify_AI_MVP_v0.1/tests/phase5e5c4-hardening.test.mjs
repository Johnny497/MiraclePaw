import test from 'node:test';
import assert from 'node:assert/strict';
import {checkLease,withDeadline} from '../netlify/lib/providers/contracts.mjs';
import {createOfflineMockTransport,postMock} from '../netlify/lib/providers/mock-transport.mjs';
import {createOfflineTrustedConfig,createOfflineQuotaAdapter} from '../netlify/lib/providers/offline-runtime.mjs';
import {createQwenHongKongCandidate} from '../netlify/lib/providers/qwen-hk.mjs';
import {createAzureContentSafetyCandidate} from '../netlify/lib/providers/azure-content-safety.mjs';
import {createOfflineCandidateOrchestrator} from '../netlify/lib/providers/orchestrator.mjs';
import {triageInput} from '../netlify/lib/crisis-triage.mjs';

const qUrl='https://fictional-workspace.cn-hongkong.maas.aliyuncs.com/compatible-mode/v1/chat/completions';
const aUrl='https://fictional-resource.cognitiveservices.azure.com/contentsafety/text:analyze?api-version=2024-09-01';
const requestUrl='https://deploy-preview-16--magenta-churros-99ffc3.netlify.app/api/chat';
const lease=()=>({route:'chat',windowId:'fictional',expiresAt:Date.now()+60000});
const azureBody=()=>({categoriesAnalysis:['Hate','SelfHarm','Sexual','Violence'].map(category=>({category,severity:0})),blocklistsMatch:[]});
const qwenBody=text=>({object:'chat.completion',choices:[{index:0,finish_reason:'stop',message:{role:'assistant',content:text}}]});
function setup({authorize=()=>true,respondQ=()=>({status:200,body:qwenBody('我陪你傾下。')}),respondA=()=>({status:200,body:azureBody()}),guard=()=>{}}={}){
  const events=[];const assertLease=(value,timeout)=>{events.push(['lease',timeout]);return guard(value,timeout);};
  const generation=createQwenHongKongCandidate({enabled:true,endpoint:qUrl,model:'qwen-test',credential:'fictional-only',approval:{mode:'offline-fixture',endpoint:qUrl,model:'qwen-test',account:'fictional',pricePolicy:'fictional-only'},assertLease,transport:createOfflineMockTransport((req,opts)=>{events.push(['generate',req,opts]);return respondQ(req,opts);})});
  const moderation=createAzureContentSafetyCandidate({enabled:true,endpoint:aUrl,credential:'fictional-only',approval:{mode:'offline-fixture',endpoint:aUrl,account:'fictional',pricePolicy:'fictional-only'},assertLease,transport:createOfflineMockTransport((req,opts)=>{events.push(['moderate',req,opts]);return respondA(req,opts);})});
  const quota=createOfflineQuotaAdapter({reserveQuota:async(route,url)=>{events.push(['reserve',route,url]);return lease();},assertQuotaActive:assertLease});
  const trusted=createOfflineTrustedConfig({system:'虛構測試',route:'chat',requestUrl,authorize,offlinePriceAttestation:'fictional-test-only'});
  return {orchestrator:createOfflineCandidateOrchestrator({enabled:true,generation,moderation,quota,trusted}),events};
}
test('C3-01 transport timeout aborts cooperating mock',async()=>{
  let aborted=false;const mock=createOfflineMockTransport((_,{signal})=>new Promise(resolve=>signal.addEventListener('abort',()=>{aborted=true;resolve({status:200,body:{}});},{once:true})));
  await assert.rejects(postMock(mock,{url:qUrl},10),{code:'TRANSPORT_TIMEOUT'});assert.equal(aborted,true);
});
test('C3-01 parent cancellation reaches mock and prevents late response',async()=>{
  let aborted=false;const controller=new AbortController();const mock=createOfflineMockTransport((_,{signal})=>new Promise(resolve=>signal.addEventListener('abort',()=>{aborted=true;resolve({status:200,body:{}});},{once:true})));
  const pending=postMock(mock,{url:qUrl},5000,controller.signal);setImmediate(()=>controller.abort());
  await assert.rejects(pending,{code:'STAGE_CANCELLED'});assert.equal(aborted,true);
});
test('C3-01 chunked response stops at byte cap before later chunks',async()=>{
  let produced=0;const mock=createOfflineMockTransport(()=>({status:200,bodyChunks:(async function*(){produced++;yield 'x'.repeat(20000);produced++;yield 'x'.repeat(20000);produced++;yield 'late';})()}));
  await assert.rejects(postMock(mock,{url:qUrl},100),{code:'INVALID_TRANSPORT_RESPONSE'});assert.equal(produced,2);
});
test('C3-01 valid chunked JSON is accepted',async()=>{const mock=createOfflineMockTransport(()=>({status:200,bodyChunks:(async function*(){yield '{"ok":';yield 'true}';})()}));assert.deepEqual((await postMock(mock,{url:qUrl},100)).body,{ok:true});});
test('C3-02 false guard and expired lease are denied',()=>{assert.throws(()=>checkLease(()=>false,lease(),5000),{code:'INVALID_LEASE_GUARD_RESULT'});assert.throws(()=>checkLease(()=>{}, {...lease(),expiresAt:Date.now()+1000},5000),{code:'INVALID_LEASE'});});
test('C3-02 final release checks lease after output moderation',async()=>{const p=setup({guard:(_,timeout)=>{if(timeout===1)throw Error('expired before release');}});const result=await p.orchestrator.run({message:'今日天氣好'});assert.equal(result.kind,'unavailable');assert.equal(p.events.filter(x=>x[0]==='moderate').length,2);});
test('C3-03 plain no-op providers cannot compose',async()=>{const trusted=createOfflineTrustedConfig({system:'虛構',route:'chat',requestUrl,authorize:()=>true,offlinePriceAttestation:'fictional-test-only'});let reserves=0;const quota=createOfflineQuotaAdapter({reserveQuota:async()=>{reserves++;return lease();},assertQuotaActive:()=>{}});const p=createOfflineCandidateOrchestrator({enabled:true,trusted,quota,generation:{generate:async()=>''},moderation:{analyze:async()=> 'pass'}});assert.equal((await p.run({message:'你好'})).kind,'unavailable');assert.equal(reserves,0);});
test('C3-04 history mutation during async authorization cannot change snapshot',async()=>{let allow;const pendingAuth=new Promise(resolve=>{allow=resolve;});const p=setup({authorize:()=>pendingAuth});const history=[{role:'user',content:'昨日好攰'}];const resultPromise=p.orchestrator.run({message:'今日天氣好',history});history[0].content='我而家想自殺';history.push({role:'user',content:'又有念頭'});allow(true);const result=await resultPromise;assert.equal(result.kind,'reply');const moderated=p.events.find(x=>x[0]==='moderate')[1].body.text;assert.match(moderated,/昨日好攰/u);assert.doesNotMatch(moderated,/我而家想自殺/u);});
test('C3-05 valid crisis severity survives malformed blocklist',async()=>{const p=setup({respondA:()=>{const body=azureBody();body.categoriesAnalysis[1].severity=2;body.blocklistsMatch=[{}];return {status:200,body};}});assert.equal((await p.orchestrator.run({message:'今日天氣好'})).kind,'local_crisis');assert.equal(p.events.some(x=>x[0]==='generate'),false);});
test('C3-05 malformed blocklist without crisis remains fail-closed',async()=>{const p=setup({respondA:()=>{const body=azureBody();body.blocklistsMatch=[{}];return {status:200,body};}});assert.equal((await p.orchestrator.run({message:'今日天氣好'})).kind,'unavailable');});
test('C3-06 supplementary Unicode beyond legacy UTF-16 output cap returns generic fallback',async()=>{const p=setup({respondQ:()=>({status:200,body:qwenBody('😀'.repeat(801))})});const result=await p.orchestrator.run({message:'今日天氣好'});assert.equal(result.kind,'unavailable');assert.equal(p.events.filter(x=>x[0]==='moderate').length,1);});
test('R01 route allowlist rejects wrong path/query/host',()=>{for(const bad of [requestUrl+'?x=1',requestUrl.replace('/api/chat','/api/other'),requestUrl.replace('deploy-preview-16','deploy-preview-17')])assert.throws(()=>createOfflineTrustedConfig({system:'虛構',route:'chat',requestUrl:bad,authorize:()=>true,offlinePriceAttestation:'fictional-test-only'}),{code:'TRUSTED_CONFIG_REQUIRED'});});
test('R03 prior crisis remains local on ordinary next turn',async()=>{const p=setup();const result=await p.orchestrator.run({message:'轉個話題，講天氣',history:[{role:'user',content:'我想自殺'}]});assert.equal(result.kind,'local_crisis');assert.equal(p.events.some(x=>x[0]==='reserve'),false);});
test('R03 fixed hotline and no secret third-party notification remain in local support',()=>{const result=triageInput('我而家想自殺');assert.match(result.reply,/2389 2222/u);assert.match(result.reply,/2382 0000/u);assert.match(result.reply,/唔會暗中通知第三方/u);});
test('stage cancellation is signaled and fail-closed',async()=>{let observed=false;const controller=new AbortController();const pending=withDeadline(signal=>new Promise(resolve=>signal.addEventListener('abort',()=>{observed=true;resolve('late');},{once:true})),5000,controller.signal);setImmediate(()=>controller.abort());await assert.rejects(pending,{code:'STAGE_CANCELLED'});assert.equal(observed,true);});
