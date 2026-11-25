import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../public/journey.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
class El {
  constructor(dataset={}) { this.dataset=dataset; this.handlers={}; this.attrs={}; this.hidden=false; this.disabled=false; }
  addEventListener(event,fn) { (this.handlers[event] ||= []).push(fn); }
  fire(event='click') { for(const fn of this.handlers[event] || []) fn(); }
  click() { if(!this.disabled) this.fire(); }
  setAttribute(key,value) { this.attrs[key]=value; }
  focus() { this.focused=true; }
}
function simulate(admitted=true) {
  const ids=Object.fromEntries(['littleSteps','stepStatus','doneStep','skipStep','journeyClear','gate','agree','crisisNotice','petSpeech','resetChat'].map(id=>[id,new El()]));
  const buttons=['view','window','door','downstairs','public','water','constructor'].map(journey=>new El({journey}));
  const rest=new El();
  ids.littleSteps.querySelectorAll=()=>buttons;
  ids.gate.hidden=admitted; ids.agree.checked=admitted; ids.crisisNotice.hidden=true;
  let observer;
  class MutationObserver { constructor(fn){observer=fn;} observe(){} }
  const requests=[];
  vm.runInNewContext(source,{document:{getElementById:id=>ids[id]||null,querySelectorAll:()=>[rest]},MutationObserver,fetch:(...args)=>{requests.push(args);throw Error('Unexpected network');}});
  return {e:ids,buttons,rest,requests,update:()=>observer()};
}
test('all five scenes plus indoor water are offered with no prerequisite',()=>{const s=simulate();for(const i of [4,0,3,1,2,5]){s.buttons[i].click();assert.equal(s.buttons[i].attrs['aria-pressed'],'true');assert.equal(s.e.doneStep.disabled,false);}assert.equal(s.buttons[4].attrs['aria-pressed'],'false');assert.match(s.e.stepStatus.textContent,/室內飲水/);});
test('initial choice is optional and nothing is preselected',()=>{const s=simulate();assert.equal(s.e.doneStep.disabled,true);assert.equal(s.e.journeyClear.disabled,true);assert.ok(s.buttons.every(b=>b.attrs['aria-pressed']==='false'));});
test('adult gate prevents direct simulated selection before admission',()=>{const s=simulate(false);assert.equal(s.e.littleSteps.hidden,true);s.buttons[4].fire();assert.equal(s.e.doneStep.disabled,true);s.e.agree.checked=true;s.update();assert.equal(s.e.littleSteps.hidden,true);s.e.gate.hidden=true;s.update();assert.equal(s.e.littleSteps.hidden,false);s.buttons[4].click();assert.equal(s.e.doneStep.disabled,false);});
test('repeated rest cancels pending selection without penalty or network',()=>{const s=simulate();s.buttons[4].click();for(let i=0;i<4;i++)s.e.skipStep.click();assert.equal(s.e.doneStep.disabled,true);assert.match(s.e.stepStatus.textContent,/一樣陪住你/);assert.ok(s.buttons.every(b=>b.attrs['aria-pressed']==='false'));assert.equal(s.requests.length,0);});
test('existing quick rest also clears pending selection',()=>{const s=simulate();s.buttons[3].click();s.rest.click();assert.equal(s.e.doneStep.disabled,true);assert.match(s.e.stepStatus.textContent,/唔出去完全可以/);});
test('confirmation is fictional, never auto-advances or unlocks anything',()=>{const s=simulate();s.buttons[4].click();s.e.doneStep.click();assert.match(s.e.stepStatus.textContent,/唔代表真實出門/);assert.equal(s.e.doneStep.disabled,true);assert.equal(s.e.skipStep.focused,true);assert.ok(s.buttons.every(b=>b.attrs['aria-pressed']==='false'&&!b.disabled));s.buttons[0].click();assert.match(s.e.stepStatus.textContent,/望一望窗外/);});
test('clear and reopening gate erase selection and reset status',()=>{const s=simulate();s.buttons[4].click();s.e.journeyClear.click();assert.equal(s.e.doneStep.disabled,true);assert.equal(s.e.skipStep.focused,true);s.buttons[3].click();s.e.gate.hidden=false;s.e.agree.checked=false;s.update();assert.equal(s.e.littleSteps.hidden,true);s.e.agree.checked=true;s.e.gate.hidden=true;s.update();assert.equal(s.e.doneStep.disabled,true);assert.doesNotMatch(s.e.stepStatus.textContent,/樓下/);});
test('crisis pauses all scene choices, cancels pending action and preserves rest',()=>{const s=simulate();s.buttons[4].click();s.e.crisisNotice.hidden=false;s.update();assert.ok(s.buttons.every(b=>b.disabled));assert.equal(s.e.doneStep.disabled,true);s.buttons[0].fire();assert.match(s.e.stepStatus.textContent,/唔需要做任何微行動/);s.e.skipStep.click();assert.match(s.e.stepStatus.textContent,/仍然喺度陪你/);assert.equal(s.e.crisisNotice.hidden,false);});
test('invalid inherited scene key is ignored',()=>{const s=simulate();s.buttons[6].click();assert.equal(s.e.doneStep.disabled,true);});
test('new journey module has no network, persistent storage, GPS or dynamic HTML',()=>{assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|navigator\.geolocation|innerHTML/);assert.match(html,/id="littleSteps" tabindex="-1" hidden/);assert.match(html,/src="\/journey\.js" defer/);for(const key of ['view','window','door','downstairs','public','water'])assert.match(html,new RegExp('data-journey="'+key+'"'));});
