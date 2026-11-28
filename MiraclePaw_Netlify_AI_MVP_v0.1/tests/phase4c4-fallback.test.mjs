import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateSandboxTurn,LOCAL_COMPANION,FIXED_CRISIS} from '../scripts/phase4c4-fallback.mjs';
const msg='今日想傾下卡通。';
const allow=async()=> 'allow';
function never(){throw Error('should not be called');}
test('no independent reviewers: fail closed without a model call',async()=>{
 const r=await evaluateSandboxTurn({message:msg,requestModel:never});
 assert.equal(r.kind,'local_fallback');assert.equal(r.showModelText,false);assert.equal(r.text,LOCAL_COMPANION);
});
test('API timeout/error: keep local companion and hide model content',async()=>{
 for(const error of [new Error('timeout'),new Error('HTTP 503')]){
  const r=await evaluateSandboxTurn({message:msg,reviewInput:allow,reviewOutput:allow,requestModel:async()=>{throw error;}});
  assert.equal(r.kind,'local_fallback');assert.equal(r.localCompanionAvailable,true);assert.equal(r.showModelText,false);
 }
});
test('unsafe output rule: do not show text or send it for independent approval',async()=>{
 const r=await evaluateSandboxTurn({message:msg,reviewInput:allow,reviewOutput:never,requestModel:async()=> '你唔出門就冇獎勵。'});
 assert.equal(r.kind,'local_fallback');assert.equal(r.reason,'output_rule_block');assert.equal(r.showModelText,false);
});
test('independent output review unavailable or reject: fail closed',async()=>{
 for(const reviewOutput of [async()=>{throw Error('review down');},async()=> 'block']){
  const r=await evaluateSandboxTurn({message:msg,reviewInput:allow,reviewOutput,requestModel:async()=> '爪爪喺度陪你。'});
  assert.equal(r.kind,'local_fallback');assert.equal(r.showModelText,false);
 }
});
test('input review reject: never call model',async()=>{
 const r=await evaluateSandboxTurn({message:msg,reviewInput:async()=> 'block',reviewOutput:allow,requestModel:never});
 assert.equal(r.kind,'local_fallback');
});
test('recognized fictional crisis phrase: fixed hotline without model call',async()=>{
 const r=await evaluateSandboxTurn({message:'我唔想再醒返嚟。',requestModel:never});
 assert.equal(r.kind,'fixed_crisis');assert.equal(r.text,FIXED_CRISIS);
 assert.match(r.text,/2389 2222/);assert.match(r.text,/2382 0000/);
 assert.match(r.text,/唔會暗中通知/);
});
test('reviewed response only with BOTH explicit allow decisions',async()=>{
 const r=await evaluateSandboxTurn({message:msg,reviewInput:allow,reviewOutput:allow,requestModel:async()=> '爪爪陪你傾卡通。'});
 assert.equal(r.kind,'reviewed_model');assert.equal(r.showModelText,true);
});
