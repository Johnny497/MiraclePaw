import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const petSource=await readFile(new URL('../public/pet.js',import.meta.url),'utf8');
const socialSource=await readFile(new URL('../public/pet-social.js',import.meta.url),'utf8');
class El {
  constructor(dataset={}) { this.dataset=dataset; this.handlers={}; this.attrs={}; this.hidden=false; this.disabled=false; this.children=[]; this.classList={add(){},remove(){}}; this.style={setProperty(){}}; }
  addEventListener(k,fn){(this.handlers[k] ||= []).push(fn);}
  fire(k='click',arg={}){for(const fn of this.handlers[k]||[])fn(arg);}
  click(){if(!this.disabled)this.fire();}
  setAttribute(k,v){this.attrs[k]=v;}
  removeAttribute(k){delete this.attrs[k];if(k==='data-animation')delete this.dataset.animation;if(k==='data-smooth-action')delete this.dataset.smoothAction;}
  appendChild(el){this.children.push(el);}
  replaceChildren(){this.children=[];}
  focus(){this.focused=true;}
}
function setup(admitted=true,reduced=false){
  const ids=['petTouch','petSpeech','petActionStatus','petHearts','catMoodLabel','gate','agree','crisisNotice','resetChat','petSocial','petHello','petHelloMessage','petSocialChoices','petSocialInfo','petSocialLeave','petSocialBoundary'];
  const e=Object.fromEntries(ids.map(id=>[id,new El()]));e.gate.hidden=admitted;e.agree.checked=admitted;e.crisisNotice.hidden=true;
  const actions=['pet','hug','feed','wave','rest','blink'].map(petAction=>new El({petAction}));
  const moods=['calm','happy','sleepy','constructor'].map(petMood=>new El({petMood}));
  const replies=['wave','quiet','constructor'].map(socialReply=>new El({socialReply}));
  const anim=[];const art={animate(frames,options){const a={frames,options,cancelled:false,cancel(){this.cancelled=true;}};anim.push(a);return a;}};
  e.petTouch.querySelector=()=>art;e.petSocialChoices.querySelectorAll=()=>replies;
  const doc=new El();doc.getElementById=id=>e[id];doc.querySelectorAll=s=>s==='[data-pet-action]'?actions:moods;doc.createElement=()=>new El();
  const motion=new El();motion.matches=reduced;
  const timers=new Map();let seq=0;const observers=[];
  class MutationObserver{constructor(fn){observers.push(fn);}observe(){}}
  const win={matchMedia:()=>motion,getComputedStyle:()=>({transform:'matrix(1, 0, 0, 1, 0, 3)'}),setTimeout(fn,ms){timers.set(++seq,{fn,ms});return seq;},clearTimeout(id){timers.delete(id);}};
  const context={document:doc,window:win,MutationObserver};vm.runInNewContext(petSource,context);vm.runInNewContext(socialSource,context);
  return {e,actions,moods,replies,anim,doc,motion,open:()=>win.MiraclePawPetSocial.open(),sync:()=>observers.forEach(fn=>fn()),timers,expire(ms){for(const [id,t] of [...timers])if(t.ms===ms&&timers.has(id)){timers.delete(id);t.fn();}}};
}
test('rapid actions replace rather than stack body animations and particles',()=>{const s=setup();for(let i=0;i<30;i++)s.actions[i%2].click();assert.equal(s.e.petHearts.children.length,5);assert.equal(s.anim.filter(a=>!a.cancelled).length,1);assert.equal(s.anim.at(-1).frames[0].transform,'matrix(1, 0, 0, 1, 0, 3)');s.expire(1300);assert.equal(s.e.petHearts.children.length,0);});
test('temporary action restores chosen expression, not always calm',()=>{const s=setup();s.moods[2].click();s.actions[0].click();assert.equal(s.e.petTouch.dataset.mood,'happy');s.expire(2900);assert.equal(s.e.petTouch.dataset.mood,'sleepy');});
test('mood check-in restores preferred expression',()=>{const s=setup();s.moods[1].click();s.doc.fire('miraclepaw:mood-checkin',{detail:{petMood:'sleepy'}});s.expire(3500);assert.equal(s.e.petTouch.dataset.mood,'happy');});
test('reduced motion avoids body animation and particles, and changing preference clears active animation',()=>{const s=setup(true,true);s.actions[0].click();assert.equal(s.anim.length,0);assert.equal(s.e.petHearts.children.length,0);s.motion.matches=false;s.motion.fire('change');s.actions[0].click();s.motion.matches=true;s.motion.fire('change');assert.equal(s.anim.at(-1).cancelled,true);assert.equal(s.e.petHearts.children.length,0);});
test('hidden document clears transient animation',()=>{const s=setup();s.actions[1].click();s.doc.hidden=true;s.doc.fire('visibilitychange');assert.equal(s.anim.at(-1).cancelled,true);assert.equal(s.e.petHearts.children.length,0);});
test('adult acknowledgment gates new social and pet actions',()=>{const s=setup(false);s.open();s.actions[0].click();assert.equal(s.e.petSocial.hidden,true);assert.equal(s.anim.length,0);s.e.agree.checked=true;s.e.gate.hidden=true;s.sync();s.open();assert.match(s.e.petHelloMessage.textContent,/豆豆/);});
test('fictional greeting has no outing prerequisite and no automatic human interaction',()=>{const s=setup();s.open();assert.equal(s.e.petSocialChoices.hidden,false);assert.equal(s.e.petSocialInfo.hidden,true);assert.equal(s.replies[0].focused,true);s.replies[0].click();assert.match(s.e.petHelloMessage.textContent,/唔使再做任何嘢/);assert.equal(s.e.petSocialBoundary.hidden,true);s.e.petSocialInfo.click();assert.match(s.e.petSocialBoundary.hidden.toString(),/false/);});
test('quiet reply and leave preserve companionship without follow-up',()=>{const s=setup();s.open();s.replies[1].click();assert.match(s.e.petHelloMessage.textContent,/唔講嘢/);s.e.petSocialLeave.click();assert.match(s.e.petHelloMessage.textContent,/一樣陪住你/);assert.equal(s.e.petSocialChoices.hidden,true);assert.equal(s.e.petHello.focused,true);s.open();assert.equal(s.e.petSocialInfo.hidden,true);});
test('crisis cancels social and transient actions while preserving calm companion',()=>{const s=setup();s.open();s.actions[0].click();s.e.crisisNotice.hidden=false;s.sync();assert.equal(s.e.petSocialChoices.hidden,true);assert.equal(s.e.petHello.disabled,true);assert.equal(s.anim.at(-1).cancelled,true);s.actions[1].click();assert.match(s.e.petSpeech.textContent,/我喺度陪你/);s.open();assert.equal(s.e.petSocialChoices.hidden,true);});
test('reset clears social choices, animation, and preferred expression',()=>{const s=setup();s.open();s.replies[0].click();s.moods[2].click();s.actions[0].click();s.e.gate.hidden=false;s.e.agree.checked=false;s.e.resetChat.click();s.sync();assert.equal(s.e.petSocial.hidden,true);assert.equal(s.e.petHelloMessage.textContent,'');assert.equal(s.e.petTouch.dataset.mood,'calm');assert.equal(s.e.petHearts.children.length,0);});
test('unknown reply or expression keys ignored; no network or persistent data APIs',()=>{const s=setup();s.open();s.replies[2].click();s.moods[3].click();assert.equal(s.e.petSocialInfo.hidden,true);assert.equal(s.e.petTouch.dataset.mood,'calm');assert.doesNotMatch(petSource+socialSource,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|navigator\.geolocation|innerHTML/);});
test('main page loads local modules and delegates the existing greeting once',async()=>{const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');const app=await readFile(new URL('../public/app.js',import.meta.url),'utf8');assert.match(html,/src="\/pet-social\.js" defer/);assert.match(html,/id="petSocial" hidden/);assert.match(html,/id="petSocialInfo" hidden/);assert.match(app,/window\.MiraclePawPetSocial\?\.open\(\)/);assert.equal((app.match(/\$\('petHello'\)\.addEventListener/g)||[]).length,1);});
