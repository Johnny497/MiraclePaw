import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../public/local-companion.js', import.meta.url), 'utf8');
class El {
  constructor(dataset = {}) { this.dataset = dataset; this.handlers = {}; this.attrs = {}; this.textContent = ''; }
  addEventListener(event, fn) { this.handlers[event] = fn; }
  click() { if (!this.disabled) this.handlers.click?.(); }
  setAttribute(key, value) { this.attrs[key] = value; }
  focus() { this.focused = true; }
}
function simulate(admission = true) {
  const names = ['ming', 'yan', 'constructor'].map(fictionalName => new El({fictionalName}));
  const moods = ['tired', 'worried', 'calm', '__proto__'].map(fictionalMood => new El({fictionalMood}));
  const panel = new El();
  panel.querySelectorAll = selector => selector === '[data-fictional-name]' ? names : moods;
  const ids = {localCompanion:panel, localCompanionReply:new El(), localCompanionClear:new El(), resetChat:new El(), localCompanionFollow:new El(), localCompanionStay:new El()};
  ids.gate = new El(); ids.gate.hidden = admission;
  ids.agree = new El(); ids.agree.checked = admission;
  let observer;
  class MutationObserver { constructor(fn) { observer = fn; } observe() {} }
  vm.runInNewContext(source, {document:{getElementById:id=>ids[id] || null}, MutationObserver});
  return {panel, gate:ids.gate, agree:ids.agree, updateGate:()=>observer(), names,moods,reply:ids.localCompanionReply,clear:ids.localCompanionClear,reset:ids.resetChat,follow:ids.localCompanionFollow,stay:ids.localCompanionStay};
}
test('fictional name and latest mood are remembered across preset turns',()=>{const s=simulate();s.names[0].click();s.moods[0].click();s.follow.click();assert.match(s.reply.textContent,/阿明.*有啲攰/);s.moods[1].click();s.follow.click();assert.match(s.reply.textContent,/阿明.*有啲擔心/);assert.equal(s.moods[0].attrs['aria-pressed'],'false');});
test('name and mood are optional and refusal never withdraws companionship',()=>{const s=simulate();s.follow.click();assert.match(s.reply.textContent,/未揀心情/);for(let i=0;i<4;i++)s.stay.click();assert.match(s.reply.textContent,/冇扣分.*一樣陪住你/);s.clear.click();assert.match(s.reply.textContent,/Hi～/);});
test('clear and main chat reset erase fictional state',()=>{const s=simulate();s.names[1].click();s.moods[2].click();s.clear.click();assert.equal(s.clear.disabled,true);s.follow.click();assert.doesNotMatch(s.reply.textContent,/阿欣|幾平靜/);s.names[1].click();s.moods[2].click();s.reset.click();s.follow.click();assert.doesNotMatch(s.reply.textContent,/阿欣|幾平靜/);});
test('unknown or inherited choice IDs cannot enter the conversation',()=>{const s=simulate();s.names[2].click();s.moods[3].click();assert.equal(s.clear.disabled,true);s.follow.click();assert.match(s.reply.textContent,/未揀心情/);});
test('new instance starts empty; no network, persistence, or dynamic HTML',()=>{const s=simulate();s.names[0].click();const fresh=simulate();fresh.follow.click();assert.doesNotMatch(fresh.reply.textContent,/阿明/);assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|navigator\.geolocation|innerHTML/);});

test('panel and choices remain unavailable until adult acknowledgment and gate admission',()=>{const s=simulate(false);assert.equal(s.panel.hidden,true);s.names[0].click();s.follow.click();assert.equal(s.clear.disabled,true);s.agree.checked=true;s.updateGate();assert.equal(s.panel.hidden,true);s.gate.hidden=true;s.updateGate();assert.equal(s.panel.hidden,false);s.names[0].click();s.follow.click();assert.match(s.reply.textContent,/阿明/);});
test('reopening the existing gate hides the panel and erases its fictional state',()=>{const s=simulate();s.names[0].click();s.moods[1].click();s.gate.hidden=false;s.agree.checked=false;s.updateGate();assert.equal(s.panel.hidden,true);assert.equal(s.clear.disabled,true);s.agree.checked=true;s.gate.hidden=true;s.updateGate();s.follow.click();assert.doesNotMatch(s.reply.textContent,/阿明|有啲擔心/);});
