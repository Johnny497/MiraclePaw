import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const read = name => readFile(new URL('../public/'+name, import.meta.url), 'utf8');
const [source, html, css, tour, mood] = await Promise.all(['mobile-shell.js','index.html','mobile-shell.css','tour.js','mood.js'].map(read));
class El {
  constructor(tag='div') { this.tag=tag; this.children=[]; this.dataset={}; this.attrs={}; this.handlers={}; this.hidden=false; this.disabled=false; this.classList={toggle(){}}; }
  append(...nodes) { for(const node of nodes){ if(node.parent)node.parent.children=node.parent.children.filter(n=>n!==node); node.parent=this; this.children.push(node); } }
  appendChild(node){this.append(node);}
  replaceChildren(...nodes){this.children=[];this.append(...nodes);}
  after(node){const p=this.parent; if(node.parent)node.parent.children=node.parent.children.filter(n=>n!==node);node.parent=p;p.children.splice(p.children.indexOf(this)+1,0,node);}
  addEventListener(k,fn){(this.handlers[k] ||= []).push(fn);}
  click(){if(!this.disabled)for(const fn of this.handlers.click||[])fn();}
  setAttribute(k,v){this.attrs[k]=v;}
  removeAttribute(k){delete this.attrs[k];}
  focus(){this.focused=true;}
  scrollIntoView(){this.scrolled=true;}
}
function setup(admitted=false, ai=false, confirm=true){
  const e=Object.fromEntries(['gate','agree','userInput','resetChat','crisisNotice','aiFallback','tourNext','tourStop','tourStart','tourStatus','localCompanion','moodCheckin','littleSteps','petSocial','petTouch','petHello'].map(id=>[id,new El()]));
  const shell=new El(),header=new El(),story=new El(),chat=new El(),tourPanel=new El();
  const home=Object.fromEntries(['.eyebrow','h1','.story-intro','.pet-stage','.pet-action-status','.cat-moods','.pet-care-note','.footnote'].map(s=>[s,new El()]));
  const links=Array.from({length:7},()=>new El('a'));story.querySelector=s=>home[s];story.querySelectorAll=()=>links;
  shell.append(header,story,chat);story.append(...Object.values(home),tourPanel,...links,e.localCompanion,e.moodCheckin,e.littleSteps,e.petSocial);chat.append(e.crisisNotice,e.aiFallback,e.resetChat,e.userInput);tourPanel.append(e.tourStart,e.tourNext,e.tourStop,e.tourStatus);
  e.gate.hidden=admitted;e.agree.checked=admitted;e.userInput.disabled=!ai;e.crisisNotice.hidden=true;e.aiFallback.hidden=true;e.tourNext.hidden=true;e.tourStop.hidden=true;
  let observer,resetCount=0;class MutationObserver{constructor(fn){observer=fn;}observe(){}}
  e.resetChat.addEventListener('click',()=>{resetCount++;e.gate.hidden=false;e.agree.checked=false;e.crisisNotice.hidden=true;e.aiFallback.hidden=true;e.userInput.disabled=true;});
  const doc={getElementById:id=>e[id],querySelector:s=>({'.app-shell':shell,'.site-header':header,'.story-panel':story,'.chat-panel':chat,'.tour-panel':tourPanel})[s],createElement:tag=>new El(tag)};
  const win={scrollTo(){},confirm:()=>confirm};const ctx={document:doc,window:win,MutationObserver};vm.runInNewContext(tour,ctx);vm.runInNewContext(source,ctx);
  const panels=Object.fromEntries(story.children.filter(n=>n.dataset.shellView).map(n=>[n.dataset.shellView,n]));const nav=shell.children.find(n=>n.tag==='nav');const buttons=Object.fromEntries(nav.children.map(n=>[n.dataset.shellNav,n]));const controls=header.children.find(n=>n.className==='shell-header-actions');
  return {e,shell,header,story,chat,tourPanel,home,links,panels,buttons,controls,win,sync:()=>observer(),resetCount:()=>resetCount,active:()=>Object.keys(panels).filter(k=>!panels[k].hidden)};
}
test('adult gate makes entire app shell inert until acknowledgment and admission',()=>{const s=setup();assert.equal(s.shell.inert,true);s.buttons.social.click();assert.deepEqual(s.active(),['home']);s.e.agree.checked=true;s.sync();assert.equal(s.shell.inert,true);s.e.gate.hidden=true;s.sync();assert.equal(s.shell.inert,false);assert.equal(s.panels.home.focused,true);});
test('free entry defaults to pet home, AI composer remains disabled and collapsed',()=>{const s=setup(true);assert.deepEqual(s.active(),['home']);assert.equal(s.e.userInput.disabled,true);assert.equal(s.chat.parent.open,false);});
test('each of five tabs reveals one existing view and updates aria-current',()=>{const s=setup(true);for(const k of ['chat','mood','journey','social','home']){s.buttons[k].click();assert.deepEqual(s.active(),[k]);assert.equal(s.buttons[k].attrs['aria-current'],'page');assert.equal(s.panels[k].focused,true);assert.equal(Object.values(s.buttons).filter(b=>b.attrs['aria-current']).length,1);}});
test('switching views preserves original feature node identity and state',()=>{const s=setup(true);s.e.localCompanion.dataset.example='fictional';s.buttons.chat.click();s.buttons.mood.click();s.buttons.chat.click();assert.equal(s.panels.chat.children[0],s.e.localCompanion);assert.equal(s.e.localCompanion.dataset.example,'fictional');assert.equal(s.panels.mood.children[0],s.e.moodCheckin);assert.equal(s.panels.journey.children[0],s.e.littleSteps);assert.equal(s.panels.social.children[0],s.e.petSocial);});
test('all stakeholder links are moved to info without cloning or losing the tour',()=>{const s=setup(true);s.controls.children[0].click();assert.deepEqual(s.active(),['info']);assert.ok(s.links.every(l=>l.parent===s.panels.info));assert.equal(s.tourPanel.hidden,false);assert.equal(s.controls.children[1].href,'/demo.html?scene=safety');});
test('four-stage tour opens matching views and keeps next/stop visible',()=>{const s=setup(true);s.controls.children[0].click();s.e.tourStart.click();assert.deepEqual(s.active(),['home']);for(const k of ['mood','journey','social']){s.e.tourNext.click();assert.deepEqual(s.active(),[k]);assert.equal(s.tourPanel.hidden,false);}s.e.tourNext.click();assert.deepEqual(s.active(),['info']);assert.equal(s.e.tourNext.hidden,true);});
test('crisis and fallback notices stay outside every view; crisis stops tour without forced navigation',()=>{const s=setup(true);s.controls.children[0].click();s.e.tourStart.click();s.e.tourNext.click();s.e.crisisNotice.hidden=false;s.sync();assert.deepEqual(s.active(),['mood']);assert.equal(s.e.tourNext.hidden,true);assert.equal(s.tourPanel.hidden,true);assert.equal(s.e.crisisNotice.parent.className,'shell-safety');assert.equal(s.e.crisisNotice.parent.hidden,false);s.buttons.social.click();assert.equal(s.e.crisisNotice.parent.hidden,false);s.e.crisisNotice.hidden=true;s.e.aiFallback.hidden=false;s.sync();assert.equal(s.e.aiFallback.parent.hidden,false);});
test('confirmed restart delegates once, returns to gate, and clears navigation/tour',()=>{const s=setup(true);s.controls.children[0].click();s.e.tourStart.click();s.e.tourNext.click();s.controls.children[2].click();s.sync();assert.equal(s.resetCount(),1);assert.equal(s.shell.inert,true);assert.deepEqual(s.active(),['home']);assert.equal(s.e.tourNext.hidden,true);});
test('cancelled restart changes nothing',()=>{const s=setup(true,false,false);s.buttons.mood.click();s.controls.children[2].click();assert.equal(s.resetCount(),0);assert.deepEqual(s.active(),['mood']);});
test('layout respects existing AI admission state without changing input',()=>{const s=setup(true,true);assert.deepEqual(s.active(),['chat']);assert.equal(s.chat.parent.open,true);assert.equal(s.e.userInput.disabled,false);});
test('shared restart clears actual mood module entries and selection',()=>{const e=Object.fromEntries(['moodHistory','moodEmpty','moodFeedback','moodClear','moodSkip','petSpeech','resetChat'].map(id=>[id,new El()]));const b=new El();b.dataset.feeling='happy';const doc={getElementById:id=>e[id],querySelectorAll:()=>[b],createElement:t=>new El(t),dispatchEvent(){}};class CustomEvent{constructor(type,options){this.type=type;this.detail=options.detail;}}vm.runInNewContext(mood,{document:doc,window:{confirm:()=>true},CustomEvent});b.click();assert.equal(e.moodHistory.children.length,1);e.resetChat.click();assert.equal(e.moodHistory.children.length,0);assert.equal(b.attrs['aria-pressed'],'false');assert.equal(e.moodClear.disabled,true);});
test('new shell uses no API, storage, GPS, dynamic HTML, or duplicate IDs',()=>{assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|navigator\.geolocation|innerHTML|\.cloneNode\(/);assert.match(html,/src="\/mobile-shell\.js" defer/);assert.match(css,/env\(safe-area-inset-bottom/);assert.match(css,/min-height: 44px/);});
