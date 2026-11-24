import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {classify}=require('../public/ai-fallback.js');
test('429 rate limit returns local fallback without model content',()=>{
 const r=classify(429,{reply:'unsafe'});assert.equal(r.showModelText,false);assert.equal(r.reason,'rate_limit');
});
test('503 disabled or moderation unavailable returns local fallback',()=>{
 const r=classify(503,{reply:'unsafe'});assert.equal(r.showModelText,false);
});
test('network error returns local fallback',()=>{
 const r=classify(0,null,true);assert.equal(r.showModelText,false);
});
test('malformed 200 response returns local fallback',()=>{
 for(const v of [null,{}, {reply:''},{reply:123},{reply:'x'.repeat(1601)}]){
  assert.equal(classify(200,v).showModelText,false);
 }
});
test('valid 200 is displayed only as server response, not client moderation',()=>{
 const r=classify(200,{reply:'爪爪陪你。'});assert.equal(r.kind,'server_response');assert.equal(r.showModelText,true);
});
