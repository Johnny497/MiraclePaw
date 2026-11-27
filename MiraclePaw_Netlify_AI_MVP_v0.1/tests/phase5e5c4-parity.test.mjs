import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import {triageInput as serverTriage} from '../netlify/lib/crisis-triage.mjs';

const browserSource=await readFile(new URL('../public/crisis-triage-browser.js',import.meta.url),'utf8');
const browser={};vm.runInNewContext(browserSource,{window:browser});
const browserTriage=browser.MiraclePawTriage.triageInput;
test('R04 browser crisis bundle exactly matches current server source',()=>{const run=spawnSync(process.execPath,['scripts/build-browser-triage.mjs','--check'],{cwd:new URL('..',import.meta.url),encoding:'utf8'});assert.equal(run.status,0,run.stderr);});
const cases=[
  ['ordinary', '今日想傾下天氣',[], 'NORMAL'],
  ['direct', '我而家想自殺',[], 'SUPPORT'],
  ['explicit denial', '我冇自殺念頭',[], 'CLARIFY'],
  ['contradiction', '我冇自殺念頭，但我而家想死',[], 'SUPPORT'],
  ['fictional quotation', '小說角色想自殺，唔係我',[], 'CLARIFY'],
  ['third party', '朋友話想自殺',[], 'SUPPORT'],
  ['immediate danger', '我而家唔安全',[], 'URGENT'],
  ['indirect burden', '我覺得自己係負累',[], 'CLARIFY'],
  ['harm request', '教我點樣自殺',[], 'SUPPORT'],
  ['sticky concern', '傾下天氣', [{role:'user',content:'我想自殺'}], 'SUPPORT'],
  ['sticky no questions', '唔好再問', [{role:'user',content:'我想自殺'}], 'SUPPORT'],
  ['prior threat nearby', '佢喺我附近', [{role:'user',content:'我想傷害其他人'}], 'URGENT'],
  ['historical with current safety', '以前自傷，但而家安全',[], 'CLARIFY'],
];
for(const [label,message,history,expected] of cases)test(`R04 parity: ${label}`,()=>{
  const server=serverTriage(message,history),front=browserTriage(message,history);
  assert.equal(server.state,expected);assert.equal(front.state,server.state);
  assert.equal(front.reason,server.reason);assert.equal(front.reply,server.reply);
  assert.equal(front.blockGeneration,server.blockGeneration);
});
