import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import {
  PARTNERSHIP_STATUS, OUTREACH_TEMPLATES, ONE_PAGER,
  PRE_OUTREACH_CHECKS, PARTNER_FIT, MEETING_AGENDA, RESPONSIBILITIES,
  DISCUSSION_TERMS, NEXT_STEPS
} from '../public/partners-data.js';

const read = (file) => readFile(new URL('../public/' + file, import.meta.url), 'utf8');
const [html, css, js, guard, home, pilot, pitch, review, showcase, app, backend] = await Promise.all([
  read('partners.html'), read('partners.css'), read('partners.js'), read('pilot-preview.js'),
  read('index.html'), read('pilot.html'), read('pitch.html'), read('review.html'), read('showcase.html'),
  read('app.js'), readFile(new URL('../netlify/functions/chat.mjs', import.meta.url),'utf8')
]);

const required = [
  'partnersMain','partnersGate','partnersAdult','enterPartners','partnerStatus',
  'draftLanguage','draftType','draftSubject','draftBody','copyDraft',
  'selectDraft','draftStatus','outreachChecks','outreachCount','resetOutreach',
  'briefEyebrow','briefCardTitle','briefSummary','briefContent','briefFooter',
  'printBrief','fitQuestions','partnerAgenda','responsibilityList','termList','nextSteps'
];
class FakeNode {
  constructor(tag='div'){
    this.tag=tag;
    this.children=[];
    this.listeners={};
    this.attributes={};
    this.dataset={};
    this.textContent='';
    this.value='';
    this.type='';
    this.checked=false;
    this.hidden=false;
    this.disabled=false;
    this.focused=false;
    this.selected=false;
    this.className='';
  }
  addEventListener(event,fn){this.listeners[event]=fn;}
  fire(event){return this.listeners[event]?.();}
  setAttribute(k,v){this.attributes[k]=String(v);}
  append(...items){this.children.push(...items);}
  appendChild(item){this.children.push(item);}
  replaceChildren(...items){this.children=[...items];}
  focus(){this.focused=true;}
  select(){this.selected=true;}
}
function simulate(clipboard=true){
  const e=Object.fromEntries(required.map(id=>[id,new FakeNode()]));
  e.partnersMain.hidden=true;
  e.enterPartners.disabled=true;
  e.draftLanguage.value='zh';
  e.draftType.value='initial';
  const copied=[];
  let printed=0;
  const doc={
    getElementById:id=>e[id]??null,
    createElement:tag=>new FakeNode(tag),
    createTextNode:s=>({textContent:s})
  };
  const src=js.replace(/^import\s*\{[\s\S]*?\}\s*from '\.\/partners-data\.js';/m,'');
  vm.runInNewContext(src,{
    PARTNERSHIP_STATUS,OUTREACH_TEMPLATES,ONE_PAGER,PRE_OUTREACH_CHECKS,
    PARTNER_FIT,MEETING_AGENDA,RESPONSIBILITIES,DISCUSSION_TERMS,NEXT_STEPS,
    document:doc,
    navigator:clipboard?{clipboard:{writeText:async text=>{copied.push(text);}}}:{},
    window:{print:()=>{printed++;}}
  });
  function collect(root,fn){
    const out=[];
    function scan(x){if(fn(x))out.push(x);for(const child of x.children||[])if(child&&typeof child==='object')scan(child);}
    scan(root);
    return out;
  }
  return{
    e,copied,collect,get printed(){return printed;},
    enter(){e.partnersAdult.checked=true;e.partnersAdult.fire('change');e.enterPartners.fire('click');}
  };
}

test('outreach includes bilingual initial, follow-up and post-meeting drafts, with no fictitious partners',()=>{
  assert.deepEqual(Object.keys(OUTREACH_TEMPLATES),['zh','en']);
  for(const lang of ['zh','en']){
    for(const type of ['initial','followup','thanks']){
      const item=OUTREACH_TEMPLATES[lang][type];
      assert.ok(item.subject.length>20 && item.body.length>150,lang+':'+type);
      assert.match(item.body,/\[NGO|\[聯絡人|\[team contact|\[團隊聯絡人/i);
    }
    assert.ok(ONE_PAGER[lang].summary.length>80);
    assert.ok(ONE_PAGER[lang].exclusions.length>80);
  }
  assert.match(PARTNERSHIP_STATUS.goNoGo,/NO-GO/);
  assert.match(PARTNERSHIP_STATUS.outbound,/不會寄送|不會建立/);
  assert.match(html,/合作邀請 ≠ 服務試點批准/);
  assert.match(html,/唔會連接 Gmail、寄信|唔會連接 Gmail/);
  assert.match(OUTREACH_TEMPLATES.zh.initial.body,/未有真人試點/);
  assert.match(OUTREACH_TEMPLATES.en.initial.body,/do not yet have an approved service pilot/);
  assert.match(OUTREACH_TEMPLATES.en.thanks.body,/not agreed outcomes/);
});

test('concept note accurately distinguishes in-memory mood, external AI chat and unsupported results',()=>{
  assert.match(app,/fetch\('\/api\/presentation-chat'/);
  assert.match(app,/history: history\.slice\(-12\)/);
  assert.match(backend,/store: false/);
  for(const lang of ['zh','en']){
    const brief=ONE_PAGER[lang];
    assert.match(brief.privacy,/Netlify|OpenAI/);
    assert.match(brief.safety,/2389 2222/);
    assert.match(brief.safety,/2382 0000/);
    assert.match(brief.safety,/999/);
    assert.match(brief.exclusions,/NO-GO/);
    assert.match(brief.ask,/30/);
  }
  assert.match(ONE_PAGER.zh.values,/永久免費/);
  assert.match(ONE_PAGER.zh.values,/GPS/);
  assert.match(ONE_PAGER.zh.privacy,/第三方不可查看聊天原文/);
  assert.match(ONE_PAGER.en.privacy,/Third parties must never see raw chats/);
});

test('outreach checklist does not imply approval or message sending',()=>{
  assert.equal(PRE_OUTREACH_CHECKS.length,6);
  assert.equal(PARTNER_FIT.length,5);
  assert.equal(MEETING_AGENDA.length,4);
  assert.equal(RESPONSIBILITIES.length,5);
  assert.equal(DISCUSSION_TERMS.length,7);
  assert.equal(NEXT_STEPS.length,5);
  assert.equal(new Set(PRE_OUTREACH_CHECKS.map(x=>x.id)).size,6);
  assert.equal(new Set(DISCUSSION_TERMS.map(x=>x.id)).size,7);
  assert.match(DISCUSSION_TERMS[1].boundary,/正式條款/);
  assert.match(JSON.stringify(RESPONSIBILITIES),/未確認|未指派|NO-GO/);
  assert.match(JSON.stringify(PARTNER_FIT),/無承諾|無壓力/);
  assert.match(JSON.stringify(DISCUSSION_TERMS),/不構成|非約束性|另議/);
});

test('adult gate blocks entry; render drafts, brief, checklist, meeting and roles after acknowledgement',()=>{
  const s=simulate(),e=s.e;
  assert.equal(e.partnersMain.hidden,true);
  e.enterPartners.fire('click');
  assert.equal(e.partnersMain.hidden,true);
  s.enter();
  assert.equal(e.partnersMain.hidden,false);
  assert.equal(e.partnersGate.hidden,true);
  assert.equal(e.partnerStatus.focused,true);
  assert.equal(e.draftSubject.value,OUTREACH_TEMPLATES.zh.initial.subject);
  assert.equal(e.draftBody.value,OUTREACH_TEMPLATES.zh.initial.body);
  assert.equal(e.outreachChecks.children.length,6);
  assert.equal(e.briefContent.children.length,6);
  assert.equal(e.fitQuestions.children.length,5);
  assert.equal(e.partnerAgenda.children.length,4);
  assert.equal(e.responsibilityList.children.length,5);
  assert.equal(e.termList.children.length,7);
  assert.equal(e.nextSteps.children.length,5);
  assert.match(e.outreachCount.textContent,/0／6/);
  assert.match(e.outreachCount.textContent,/未寄出/);
});

test('language and template switching also re-renders the one-pager without saving inputs',()=>{
  const s=simulate(),e=s.e;s.enter();
  e.draftLanguage.value='en';e.draftLanguage.fire('change');
  assert.equal(e.draftBody.value,OUTREACH_TEMPLATES.en.initial.body);
  assert.equal(e.briefCardTitle.textContent,ONE_PAGER.en.title);
  assert.match(e.briefContent.children[0].children[0].textContent,/What exists/);
  e.draftType.value='thanks';e.draftType.fire('change');
  assert.equal(e.draftSubject.value,OUTREACH_TEMPLATES.en.thanks.subject);
  e.draftLanguage.value='zh';e.draftLanguage.fire('change');
  assert.equal(e.briefCardTitle.textContent,ONE_PAGER.zh.title);
  assert.equal(e.draftSubject.value,OUTREACH_TEMPLATES.zh.thanks.subject);
  assert.match(e.draftStatus.textContent,/尚未寄出|未寄出/);
});

test('copy is explicit, has manual fallback, prints only on click; checkbox state never authorizes anything',async()=>{
  const s=simulate(),e=s.e;s.enter();
  await e.copyDraft.fire('click');
  assert.equal(s.copied.length,1);
  assert.match(s.copied[0],/主旨 \/ Subject:/);
  assert.match(s.copied[0],/星爪 MiraclePaw/);
  assert.match(e.draftStatus.textContent,/已複製/);
  assert.match(e.draftStatus.textContent,/並非已發送/);
  const checkboxes=s.collect(e.outreachChecks,n=>n.type==='checkbox');
  assert.equal(checkboxes.length,6);
  for(const box of checkboxes){box.checked=true;box.fire('change');}
  assert.match(e.outreachCount.textContent,/6／6/);
  assert.match(e.outreachCount.textContent,/未寄出 · 非審批/);
  e.resetOutreach.fire('click');
  assert.match(e.outreachCount.textContent,/0／6/);
  assert.ok(s.collect(e.outreachChecks,n=>n.type==='checkbox').every(box=>!box.checked));
  e.printBrief.fire('click');assert.equal(s.printed,1);
  const f=simulate(false);f.enter();await f.e.copyDraft.fire('click');
  assert.equal(f.e.draftBody.selected,true);
  assert.match(f.e.draftStatus.textContent,/手動複製/);
  assert.equal(f.copied.length,0);
});

test('v1.1 page is responsive, print-oriented, CSP-safe and does not transmit, track or store outreach data',()=>{
  for(const id of required)assert.ok(html.includes('id="'+id+'"'),id+' missing in page');
  assert.match(html,/<main id="partnersMain" hidden>/);
  assert.match(html,/id="partnersGate" class="adult-gate" role="dialog" aria-modal="true"/);
  assert.match(html,/<script src="\/pilot-preview\.js"><\/script>/);
  assert.match(html,/<script type="module" src="\/partners\.js"><\/script>/);
  assert.doesNotMatch(html,/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/);
  assert.match(html,/id="draftBody" readonly/);
  assert.match(html,/id="draftSubject" type="text" readonly/);
  assert.match(css,/@media\(max-width:630px\)/);
  assert.match(css,/@media print/);
  assert.match(css, /partner-section:not\(#brief\)/);
  assert.match(guard,/ntl-drawer-state/);
  assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|localStorage|sessionStorage|indexedDB|document\.cookie|geolocation|\.innerHTML\s*=/);
  assert.doesNotMatch(js,/\bmailto:|\.submit\s*\(|\bEmail\.send|\/api\//);
  assert.match(js,/navigator\.clipboard\.writeText/);
  assert.match(js,/document\.createTextNode/);
});

test('outreach linked to prior stakeholder guides without touching their core logic',()=>{
  for(const page of [home,pilot,pitch,review,showcase])assert.match(page,/href="\/partners\.html"/);
  assert.match(home,/src="\/app\.js"/);
  assert.match(home,/src="\/pet\.js"/);
  assert.match(home,/src="\/mood\.js"/);
  assert.match(pilot,/id="pilotMain" hidden/);
  assert.match(pitch,/id="pitchMain" hidden/);
  assert.match(showcase,/href="\/demo\.html"/);
});
