import test from 'node:test';
import assert from 'node:assert/strict';
import { createQwenHongKongCandidate } from '../netlify/lib/providers/qwen-hk.mjs';
import { createAzureContentSafetyCandidate } from '../netlify/lib/providers/azure-content-safety.mjs';
import { buildCompleteContext, createOfflineCandidateOrchestrator } from '../netlify/lib/providers/orchestrator.mjs';
import { createOfflineMockTransport } from '../netlify/lib/providers/mock-transport.mjs';

const qwenEndpoint='https://fictional-workspace.cn-hongkong.maas.aliyuncs.com/compatible-mode/v1/chat/completions';
const azureEndpoint='https://fictional-resource.cognitiveservices.azure.com/contentsafety/text:analyze?api-version=2024-09-01';
const qwenResponse={status:200,body:{object:'chat.completion',choices:[{index:0,finish_reason:'stop',message:{role:'assistant',content:'我陪你傾下。'}}]}};
const azureResponse={status:200,body:{categoriesAnalysis:['Hate','SelfHarm','Sexual','Violence'].map(category=>({category,severity:0})),blocklistsMatch:[]}};
function qwen(body=qwenResponse, calls=[]) {return createQwenHongKongCandidate({enabled:true,endpoint:qwenEndpoint,model:'qwen-test',credential:'fictional-only',transport:createOfflineMockTransport(async request=>{calls.push(request);return body;}),assertLease:lease=>{if(lease!=='lease')throw Error('lease');},approval:{mode:'offline-fixture',endpoint:qwenEndpoint,model:'qwen-test',account:'fictional',pricePolicy:'fictional-only'}});}
function azure(body=azureResponse,calls=[]) {return createAzureContentSafetyCandidate({enabled:true,endpoint:azureEndpoint,credential:'fictional-only',transport:createOfflineMockTransport(async request=>{calls.push(request);return body;}),assertLease:lease=>{if(lease!=='lease')throw Error('lease');},approval:{mode:'offline-fixture',endpoint:azureEndpoint,account:'fictional',pricePolicy:'fictional-only'}});}
const messages=[{role:'system',content:'虛構測試系統'},{role:'user',content:'你好'}];

test('providers default disabled and make no transport call',async()=>{
  let calls=0;const transport=createOfflineMockTransport(async()=>{calls++;return qwenResponse;});
  await assert.rejects(createQwenHongKongCandidate({transport,endpoint:qwenEndpoint,model:'qwen-test',credential:'fictional-only'}).generate(messages,{lease:'lease'}),{code:'CANDIDATE_DISABLED'});
  await assert.rejects(createAzureContentSafetyCandidate({transport,endpoint:azureEndpoint,credential:'fictional-only'}).analyze('你好',{lease:'lease'}),{code:'CANDIDATE_DISABLED'});
  assert.equal(calls,0);
});
test('Qwen request is one nonstreaming completion with bounded output',async()=>{
  const calls=[];assert.equal(await qwen(qwenResponse,calls).generate(messages,{lease:'lease'}),'我陪你傾下。');
  assert.equal(calls.length,1);assert.equal(calls[0].body.stream,false);assert.equal(calls[0].body.n,1);assert.equal(calls[0].body.max_tokens,420);
  assert.deepEqual(calls[0].body.messages,messages);
});
for(const [label,change] of [
  ['missing choices',b=>{delete b.choices;}],['multiple choices',b=>{b.choices.push(b.choices[0]);}],
  ['truncated finish',b=>{b.choices[0].finish_reason='length';}],['wrong role',b=>{b.choices[0].message.role='user';}],
  ['empty content',b=>{b.choices[0].message.content=' ';}],['tool call',b=>{b.choices[0].message.tool_calls=[];}],
  ['stream chunk',b=>{b.object='chat.completion.chunk';}],['oversized reply',b=>{b.choices[0].message.content='字'.repeat(1601);}]
]) test(`Qwen fails closed: ${label}`,async()=>{const body=structuredClone(qwenResponse);change(body.body);await assert.rejects(qwen(body).generate(messages,{lease:'lease'}),{code:'INVALID_GENERATION_RESPONSE'});});
test('Qwen rejects non Hong Kong endpoint before transport',async()=>{let count=0;const provider=createQwenHongKongCandidate({enabled:true,endpoint:'https://example.com/chat',model:'qwen-test',credential:'fictional-only',transport:createOfflineMockTransport(async()=>{count++;return qwenResponse;}),assertLease:()=>{},approval:{mode:'offline-fixture',endpoint:'https://example.com/chat',model:'qwen-test',account:'fictional',pricePolicy:'fictional-only'}});await assert.rejects(provider.generate(messages,{lease:'lease'}),{code:'ENDPOINT_UNAPPROVED'});assert.equal(count,0);});
test('Azure requests all four categories and four severity levels',async()=>{const calls=[];assert.equal(await azure(azureResponse,calls).analyze('虛構測試文字',{lease:'lease'}),'pass');assert.equal(calls.length,1);assert.deepEqual(calls[0].body.categories,['Hate','SelfHarm','Sexual','Violence']);assert.equal(calls[0].body.outputType,'FourSeverityLevels');});
for(const [category,expected] of [['SelfHarm','crisis'],['Violence','crisis'],['Hate','filtered'],['Sexual','filtered']]) test(`Azure ${category} nonzero is ${expected}`,async()=>{const body=structuredClone(azureResponse);body.body.categoriesAnalysis.find(x=>x.category===category).severity=2;assert.equal(await azure(body).analyze('虛構文字',{lease:'lease'}),expected);});
for(const [label,change] of [
  ['missing category',b=>{b.categoriesAnalysis.pop();}],['duplicate category',b=>{b.categoriesAnalysis[3].category='Hate';}],
  ['unknown category',b=>{b.categoriesAnalysis[3].category='Other';}],['missing severity',b=>{delete b.categoriesAnalysis[0].severity;}],
  ['invalid severity',b=>{b.categoriesAnalysis[0].severity=1;}],['missing blocklist field',b=>{delete b.blocklistsMatch;}]
]) test(`Azure fails closed: ${label}`,async()=>{const body=structuredClone(azureResponse);change(body.body);await assert.rejects(azure(body).analyze('虛構文字',{lease:'lease'}),{code:'INVALID_MODERATION_RESPONSE'});});
test('Azure blocklist match filters',async()=>{const body=structuredClone(azureResponse);body.body.blocklistsMatch=[{blocklistName:'fictional'}];assert.equal(await azure(body).analyze('虛構文字',{lease:'lease'}),'filtered');});

function pipeline({moderationVerdicts=['pass','pass'],generationReply='我陪你傾下。',reserveError=false,expireAt=0}={}){
  const events=[];let checks=0,moderations=0;
  const generation={generate:async msgs=>{events.push(['generate',msgs]);return generationReply;}};
  const moderation={analyze:async value=>{events.push(['moderate',value]);return moderationVerdicts[moderations++];}};
  const reserve=async (route,requestUrl)=>{events.push(['reserve',route,requestUrl]);if(reserveError)throw Error('quota');return 'lease';};
  const assertActive=(lease,timeoutMs)=>{assert.equal(lease,'lease');assert.equal(timeoutMs,5000);checks++;if(expireAt===checks)throw Error('expired');};
  const orchestrator=createOfflineCandidateOrchestrator({enabled:true,generation,moderation,quota:{reserve,assertActive},trusted:{system:'只用虛構測試資料',route:'chat',requestUrl:'https://deploy-preview-16--magenta-churros-99ffc3.netlify.app/api/chat',authorize:async()=>true,offlinePriceAttestation:'fictional-test-only'}});
  return {orchestrator,events};
}
const benign={history:[],message:'今日想傾下天氣'};
test('orchestrator defaults disabled without quota or provider calls',async()=>{assert.equal((await createOfflineCandidateOrchestrator().run(benign)).kind,'disabled');});
test('local crisis bypasses quota and providers',async()=>{const p=pipeline();const result=await p.orchestrator.run({...benign,message:'我而家想自殺'});assert.equal(result.kind,'local_crisis');assert.deepEqual(p.events,[]);});
test('full context is moderated before generation and output is separately moderated',async()=>{
  const p=pipeline();const input={...benign,history:[{role:'user',content:'昨日有啲攰'},{role:'assistant',content:'我聽緊'}]};
  const result=await p.orchestrator.run(input);const full=buildCompleteContext('只用虛構測試資料',input.history,input.message);
  assert.equal(result.kind,'reply');assert.deepEqual(p.events.map(x=>x[0]),['reserve','moderate','generate','moderate']);
  assert.equal(p.events[1][1],full.transcript);assert.deepEqual(p.events[2][1],full.messages);assert.equal(p.events[3][1],result.reply);
});
test('8,000 Unicode code point budget counts emoji and never truncates',async()=>{
  const base=buildCompleteContext('s',[],'😀');assert.equal([...base.transcript].length,base.transcript.length-1);
  assert.throws(()=>buildCompleteContext('s',[],'😀'.repeat(8000)),{code:'CONTEXT_BUDGET_EXCEEDED'});
  const overhead=[...buildCompleteContext('s',[],'x').transcript].length-1;
  const exact=buildCompleteContext('s',[],'x'.repeat(8000-overhead));assert.equal([...exact.transcript].length,8000);
});
test('input moderation crisis prevents generation',async()=>{const p=pipeline({moderationVerdicts:['crisis']});assert.equal((await p.orchestrator.run(benign)).kind,'local_crisis');assert.deepEqual(p.events.map(x=>x[0]),['reserve','moderate']);});
test('input moderation failure prevents generation',async()=>{const p=pipeline({moderationVerdicts:['unknown']});assert.equal((await p.orchestrator.run(benign)).kind,'unavailable');assert.deepEqual(p.events.map(x=>x[0]),['reserve','moderate']);});
test('output moderation failure hides generated text',async()=>{const p=pipeline({moderationVerdicts:['pass','unknown'],generationReply:'虛構私密輸出'});const result=await p.orchestrator.run(benign);assert.equal(result.kind,'unavailable');assert.doesNotMatch(result.reply,/虛構私密輸出/u);});
test('quota failure prevents provider calls',async()=>{const p=pipeline({reserveError:true});assert.equal((await p.orchestrator.run(benign)).kind,'unavailable');assert.deepEqual(p.events.map(x=>x[0]),['reserve']);});
for(const [stage,at,expected] of [['input',1,['reserve']],['generation',2,['reserve','moderate']],['output',3,['reserve','moderate','generate']]])test(`expired quota before ${stage} stops later calls`,async()=>{const p=pipeline({expireAt:at});assert.equal((await p.orchestrator.run(benign)).kind,'unavailable');assert.deepEqual(p.events.map(x=>x[0]),expected);});
