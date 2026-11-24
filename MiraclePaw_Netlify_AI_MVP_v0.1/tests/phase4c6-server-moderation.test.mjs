import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/chat.mjs';

const saved={...process.env};
const oldFetch=globalThis.fetch;
const request=()=>new Request('https://example.test/api/chat',{method:'POST',headers:{'x-demo-passcode':'fictional-demo-passcode-123','content-type':'application/json'},body:JSON.stringify({message:'今日想傾下卡通。',history:[]})});
async function scenario(responses){
 process.env.AI_CHAT_DISABLED='false';process.env.OPENAI_API_KEY='test-only-key';process.env.DEMO_PASSCODE='fictional-demo-passcode-123';
 const calls=[];
 globalThis.fetch=async(url)=>{calls.push(String(url));const next=responses.shift();if(next instanceof Error)throw next;if(!next)throw Error('unexpected call');return new Response(JSON.stringify(next),{status:200,headers:{'content-type':'application/json'}});};
 try{const r=await handler(request());return {status:r.status,data:await r.json(),calls};}
 finally{globalThis.fetch=oldFetch;for(const k of ['AI_CHAT_DISABLED','OPENAI_API_KEY','DEMO_PASSCODE']){if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k];}}
}
const ok={results:[{flagged:false,categories:{'self-harm':false,violence:false}}]};
const model={output_text:'爪爪陪你傾卡通。'};
test('two independent moderation calls bracket model response',async()=>{
 const r=await scenario([ok,model,ok]);
 assert.equal(r.status,200);assert.equal(r.data.reply,model.output_text);
 assert.deepEqual(r.calls.map(x=>x.split('/').pop()),['moderations','responses','moderations']);
});
test('output moderation flagged: never return model text',async()=>{
 const r=await scenario([ok,model,{results:[{flagged:true,categories:{violence:true}}]}]);
 assert.equal(r.status,200);assert.notEqual(r.data.reply,model.output_text);assert.equal(r.data.crisis,true);
});
test('missing output moderation verdict: fail closed',async()=>{
 const r=await scenario([ok,model,{results:[]}]);
 assert.equal(r.status,502);assert.equal(r.data.code,'AI_UNAVAILABLE');assert.equal(r.data.reply,undefined);
});
test('output moderation transport failure: fail closed',async()=>{
 const r=await scenario([ok,model,new Error('offline')]);
 assert.equal(r.status,502);assert.equal(r.data.reply,undefined);
});
test('input moderation flagged: no model call',async()=>{
 const r=await scenario([{results:[{flagged:true,categories:{'self-harm':true}}]}]);
 assert.equal(r.data.crisis,true);assert.equal(r.calls.length,1);
});
test('operator kill switch blocks all upstream calls',async()=>{
 process.env.AI_CHAT_DISABLED='true';let count=0;globalThis.fetch=async()=>{count++;throw Error('should not call');};
 try{const r=await handler(request());assert.equal(r.status,503);assert.equal(count,0);}
 finally{globalThis.fetch=oldFetch;if(saved.AI_CHAT_DISABLED===undefined)delete process.env.AI_CHAT_DISABLED;else process.env.AI_CHAT_DISABLED=saved.AI_CHAT_DISABLED;}
});
