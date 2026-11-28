import test from 'node:test';
import assert from 'node:assert/strict';
import {createPresentationQuota,QUOTA_STORE} from '../netlify/lib/presentation/blob-quota.mjs';
import {deploymentApproved} from '../scripts/presentation-deploy-guard.mjs';

const start=1795867200000;
const host='deploy-preview-99--magenta-churros-99ffc3.netlify.app';
const url=`https://${host}/api/presentation-chat`;
const windowId='22222222-2222-4222-8222-222222222222';
function env(extra={}){return {CONTEXT:'deploy-preview',PRESENTATION_AI_ENABLED:'true',AI_CHAT_DISABLED:'false',AI_QUOTA_ENABLED:'true',
  PRESENTATION_PREVIEW_HOST:host,PRESENTATION_DEEPSEEK_PRICE_REVIEWED:'deepseek-flash-20261128',PRESENTATION_LOCAL_SAFETY_ACCEPTED:'true',
  PRESENTATION_QUOTA_START:String(start),PRESENTATION_QUOTA_END:String(start+600000),PRESENTATION_QUOTA_MAX_REQUESTS:'2',PRESENTATION_QUOTA_WINDOW_ID:windowId,...extra};}
// Models server-side ETag preconditions, including simultaneous callers seeing the same version.
function ledger(){let row=null,version=0;const calls=[];return {calls,get row(){return structuredClone(row);},store:{
  async getWithMetadata(key,options){calls.push(['get',key,options]);return row?{data:structuredClone(row),etag:String(version)}:null;},
  async setJSON(key,data,condition){calls.push(['set',key,structuredClone(data),condition]);
    if(condition.onlyIfNew?row!==null:condition.onlyIfMatch!==String(version))return {modified:false};
    row=structuredClone(data);version++;return {modified:true,etag:String(version)};},
}};}
function quota(l,e=env(),clock=()=>start+1000){return createPresentationQuota({env:e,now:clock,getStore:options=>{assert.deepEqual(options,{name:QUOTA_STORE,consistency:'strong'});return l.store;}});}

test('two requests admitted; third denied across separate handler instances and redeploys',async()=>{
  const l=ledger();await quota(l).reserve(url);await quota(l).reserve(url);await assert.rejects(quota(l).reserve(url));
  assert.equal(l.row.admissions,2);assert.equal(l.row.reservedHkdCents,200);
  assert.equal(l.calls.filter(c=>c[0]==='set').length,2);
  assert.deepEqual(l.calls[0][2],{type:'json',consistency:'strong'});
  assert.deepEqual(l.calls.filter(c=>c[0]==='set').map(c=>c[3]),[{onlyIfNew:true},{onlyIfMatch:'1'}]);
});
test('simultaneous first requests cannot exceed a one-request budget',async()=>{
  const l=ledger();const e=env({PRESENTATION_QUOTA_MAX_REQUESTS:'1'});
  const results=await Promise.allSettled(Array.from({length:25},()=>quota(l,e).reserve(url)));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(l.row.admissions,1);
});
test('simultaneous updates cannot spend the same ETag twice',async()=>{
  const l=ledger();await quota(l).reserve(url);
  const results=await Promise.allSettled(Array.from({length:25},()=>quota(l).reserve(url)));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(l.row.admissions,2);
});
test('quota rows contain only counters and window metadata',async()=>{
  const l=ledger();await quota(l).reserve(url);
  assert.deepEqual(Object.keys(l.row).sort(),['policy','windowId','start','end','max','admissions','reservedHkdCents'].sort());
});
test('changing policy/window bounds on the same ID cannot reset counters',async()=>{
  const l=ledger();await quota(l).reserve(url);
  for(const extra of [{PRESENTATION_QUOTA_END:String(start+700000)},{PRESENTATION_QUOTA_MAX_REQUESTS:'20'}])await assert.rejects(quota(l,env(extra)).reserve(url));
  assert.equal(l.row.admissions,1);
});
test('invalid/expired/unstarted/overlong windows and oversized limits do no storage I/O',async()=>{
  for(const extra of [{PRESENTATION_QUOTA_WINDOW_ID:''},{PRESENTATION_QUOTA_MAX_REQUESTS:'21'}, {PRESENTATION_QUOTA_MAX_REQUESTS:'0'},
    {PRESENTATION_QUOTA_START:String(start+2000)},{PRESENTATION_QUOTA_END:String(start+19000)},
    {PRESENTATION_QUOTA_END:String(start+1800001)},{PRESENTATION_QUOTA_START:'NaN'}, {AI_QUOTA_ENABLED:'false'}]){
    const l=ledger();await assert.rejects(quota(l,env(extra)).reserve(url));assert.equal(l.calls.length,0);
  }
});
test('production, public URL, alternate path/query and other previews cannot use ledger',async()=>{
  const l=ledger();for(const target of [url+'?x=1',url.replace('/api/','/.netlify/functions/'),url.replace('preview-99','preview-100'),url.replace('https:','http:'),`https://magenta-churros-99ffc3.netlify.app/api/presentation-chat`])await assert.rejects(quota(l).reserve(target));
  await assert.rejects(quota(l,env({CONTEXT:'production'})).reserve(url));assert.equal(l.calls.length,0);
});
test('ambiguous successful write with lost reply burns admission and fails closed',async()=>{
  const l=ledger(),original=l.store.setJSON;l.store.setJSON=async(...args)=>{await original(...args);throw new Error('lost receipt');};
  await assert.rejects(quota(l).reserve(url));assert.equal(l.row.admissions,1);assert.equal(l.calls.filter(c=>c[0]==='set').length,1);
});
test('quota service outage or missing runtime credentials fails closed',async()=>{
  const l=ledger();l.store.getWithMetadata=async()=>{throw new Error('storage offline');};await assert.rejects(quota(l).reserve(url));assert.equal(l.row,null);
  await assert.rejects(createPresentationQuota({env:env(),now:()=>start+1000,getStore:()=>{throw new Error('missing runtime context');}}).reserve(url));
});
test('expired lease never releases model output',async()=>{
  const l=ledger();let time=start+1000;const q=quota(l,env(),()=>time);const lease=await q.reserve(url);time=start+601000;assert.throws(()=>q.assertActive(lease,0));
});
test('deployment guard requires explicit approval, correct source branch and Preview context',()=>{
  const good={PRESENTATION_DEPLOY_APPROVED:'true',CONTEXT:'deploy-preview',HEAD:'presentation/deepseek-flash-demo',BRANCH:'main'};
  assert.equal(deploymentApproved(good),true);assert.equal(deploymentApproved({}),false);
  for(const override of [{PRESENTATION_DEPLOY_APPROVED:'false'},{CONTEXT:'production'},{CONTEXT:'branch-deploy'},{HEAD:'dev/phase5e5c'}])assert.equal(deploymentApproved({...good,...override}),false);
});
