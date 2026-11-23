import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import {
  PREPARATION_STATUS, REVIEW_DOMAINS, RISK_ITEMS, DATA_FLOW, PERMISSION_PROPOSAL,
  PILOT_OPTIONS, WORKSHOP_AGENDA, LAUNCH_BLOCKERS, GOVERNANCE_SOURCES
} from '../public/pilot-data.js';

const read = (file) => readFile(new URL('../public/' + file, import.meta.url), 'utf8');
const [html, css, js, previewGuard, home, pitch, showcase, review, mood, app, backend] = await Promise.all([
  read('pilot.html'), read('pilot.css'), read('pilot.js'), read('pilot-preview.js'),
  read('index.html'), read('pitch.html'), read('showcase.html'), read('review.html'),
  read('mood.js'), read('app.js'),
  readFile(new URL('../netlify/functions/chat.mjs', import.meta.url), 'utf8')
]);

const requiredIds = [
  'pilotGate','pilotAdult','enterPilot','pilotMain','reviewCount','resetPilot',
  'readinessList','riskCategory','riskList','riskCount','dataFlow',
  'permissionList','phaseList','blockerList','agendaList','sourceList',
  'printPilot','statusTitle'
];

class FakeNode {
  constructor() {
    this.children=[];
    this.listeners={};
    this.attributes={};
    this.dataset={};
    this.textContent='';
    this.value='';
    this.type='';
    this.href='';
    this.rel='';
    this.target='';
    this.checked=false;
    this.hidden=false;
    this.disabled=false;
    this.focused=false;
  }
  append(...items){this.children.push(...items);}
  appendChild(item){this.children.push(item);}
  replaceChildren(...items){this.children=[...items];}
  addEventListener(type,fn){this.listeners[type]=fn;}
  fire(type){this.listeners[type]?.({});}
  setAttribute(k,v){this.attributes[k]=String(v);}
  focus(){this.focused=true;}
}
function simulate() {
  const els = Object.fromEntries(requiredIds.map(id => [id,new FakeNode()]));
  els.pilotMain.hidden=true;
  els.enterPilot.disabled=true;
  els.riskCategory.value='all';
  let printCount=0;
  const document={
    getElementById:id=>els[id]||null,
    createElement:()=>new FakeNode(),
    createTextNode:value=>({textContent:value})
  };
  const text = js.slice(js.indexOf("} from './pilot-data.js';") + "} from './pilot-data.js';".length);
  vm.runInNewContext(text,{
    REVIEW_DOMAINS,RISK_ITEMS,DATA_FLOW,PERMISSION_PROPOSAL,
    PILOT_OPTIONS,WORKSHOP_AGENDA,LAUNCH_BLOCKERS,GOVERNANCE_SOURCES,
    document,window:{print:()=>{printCount++;}}
  });
  const collect=(root,predicate)=>{
    const results=[];
    const walk=(node)=>{
      if(predicate(node))results.push(node);
      for(const child of node.children||[])if(child && typeof child==='object')walk(child);
    };
    walk(root);
    return results;
  };
  return {e:els, collect, get prints(){return printCount;}, enter(){
    els.pilotAdult.checked=true;
    els.pilotAdult.fire('change');
    els.enterPilot.fire('click');
  }};
}

test('v1.0 has six never-authorizing readiness gates and eight provisional risks',()=>{
  assert.equal(REVIEW_DOMAINS.length,6);
  assert.equal(new Set(REVIEW_DOMAINS.map(x=>x.id)).size,6);
  assert.equal(RISK_ITEMS.length,8);
  assert.equal(new Set(RISK_ITEMS.map(x=>x.id)).size,8);
  assert.ok(REVIEW_DOMAINS.every(x=>x.discussion.length>=2 && x.owner.includes('待') && x.evidence && x.stop));
  assert.ok(RISK_ITEMS.every(x=>x.owner && x.proposedMitigation && x.immediateAction && /待獨立覆核/.test(x.severity)));
  assert.match(PREPARATION_STATUS.decision,/NO-GO/);
  assert.match(html,/NO-GO（不可啟動真實服務試點）/);
  assert.match(html,/全部剔選/);
  assert.match(html,/唔會改變/);
  assert.match(html,/冇倫理、安全、私隱及兒童保障批准/);
});

test('privacy diagram matches actually inspected application data flow, with limits',()=>{
  assert.equal(DATA_FLOW.length,5);
  assert.equal(PERMISSION_PROPOSAL.length,4);
  assert.match(mood,/const entries = \[\]/);
  assert.match(mood,/const maxEntries = 10/);
  assert.match(app,/fetch\('\/api\/chat'/);
  assert.match(app,/history: history\.slice\(-12\)/);
  assert.match(backend,/omni-moderation-latest/);
  assert.match(backend,/store: false/);
  assert.match(backend,/https:\/\/api\.openai\.com\/v1\//);
  const chat=DATA_FLOW.find(x=>x.id==='chat');
  assert.ok(chat);
  assert.match(chat.currently,/Netlify|api\/chat/);
  assert.match(chat.destination,/OpenAI/);
  assert.match(chat.knownBoundary,/日誌/);
  assert.match(chat.knownBoundary,/未經獨立核實/);
  const permissions=JSON.stringify(PERMISSION_PROPOSAL);
  assert.match(permissions,/對話原文/);
  assert.match(permissions,/未實作|未實現|需另行設計/);
  assert.doesNotMatch(JSON.stringify(DATA_FLOW),/全部資料永不離開裝置/);
});

test('three-phase preparation never claims to have participants, partners or clinical results',()=>{
  assert.equal(PILOT_OPTIONS.length,3);
  assert.equal(WORKSHOP_AGENDA.length,5);
  assert.equal(LAUNCH_BLOCKERS.length,6);
  assert.ok(WORKSHOP_AGENDA.map(x=>x.minute).join(',').includes('35–45'));
  assert.match(PILOT_OPTIONS[0].target,/虛構/);
  assert.match(PILOT_OPTIONS[2].boundary,/冇招募/);
  assert.match(html,/沒有|冇|未有/);
  assert.match(html,/非|唔係|尚未/);
  assert.match(html,/只顯示預先編寫資料/);
  assert.ok(GOVERNANCE_SOURCES.length>=2);
  assert.ok(GOVERNANCE_SOURCES.every(x=>x.url.startsWith('https://www.pcpd.org.hk/')));
});

test('NGO prep stays behind adult acknowledgement, renders safely, discusses not approves',()=>{
  const s=simulate(),e=s.e;
  assert.equal(e.pilotMain.hidden,true);
  e.enterPilot.fire('click');
  assert.equal(e.pilotMain.hidden,true,'Cannot bypass gate');
  s.enter();
  assert.equal(e.enterPilot.disabled,false);
  assert.equal(e.pilotGate.hidden,true);
  assert.equal(e.pilotMain.hidden,false);
  assert.equal(e.statusTitle.focused,true);
  assert.equal(e.readinessList.children.length,6);
  assert.equal(e.riskList.children.length,8);
  assert.equal(e.dataFlow.children.length,5);
  assert.equal(e.permissionList.children.length,4);
  assert.equal(e.phaseList.children.length,3);
  assert.equal(e.blockerList.children.length,6);
  assert.equal(e.agendaList.children.length,5);
  assert.equal(e.sourceList.children.length,GOVERNANCE_SOURCES.length);
  assert.match(e.reviewCount.textContent,/已討論 0／6/);
  const checks=s.collect(e.readinessList, el=>el?.type==='checkbox');
  assert.equal(checks.length,6);
  for(const c of checks){c.checked=true;c.fire('change');}
  assert.match(e.reviewCount.textContent,/已討論 6／6/);
  assert.match(e.reviewCount.textContent,/非批准/);
  assert.match(html,/NO-GO/);
  e.resetPilot.fire('click');
  assert.match(e.reviewCount.textContent,/已討論 0／6/);
  const resetChecks=s.collect(e.readinessList, el=>el?.type==='checkbox');
  assert.ok(resetChecks.every(x=>!x.checked));
  e.printPilot.fire('click');
  assert.equal(s.prints,1);
});

test('risk category filter works and never changes content maturity',()=>{
  const s=simulate(),e=s.e;
  s.enter();
  assert.equal(e.riskCategory.children.length, new Set(RISK_ITEMS.map(r=>r.category)).size);
  e.riskCategory.value='安全';
  e.riskCategory.fire('change');
  assert.equal(e.riskList.children.length,RISK_ITEMS.filter(r=>r.category==='安全').length);
  assert.match(e.riskCount.textContent,/待專業覆核/);
  e.riskCategory.value='all';
  e.riskCategory.fire('change');
  assert.equal(e.riskList.children.length,8);
  assert.match(e.statusTitle.textContent,/NO-GO/);
});

test('pilot is responsive, CSP-safe, nontracking and linked from existing navigation',()=>{
  for(const id of requiredIds)assert.ok(html.includes('id="'+id+'"'),id+' not in HTML');
  assert.match(html,/<main id="pilotMain" hidden>/);
  assert.match(html,/role="dialog" aria-modal="true"/);
  assert.match(html,/<script src="\/pilot-preview\.js"><\/script>/);
  assert.match(html,/<script type="module" src="\/pilot\.js"><\/script>/);
  assert.doesNotMatch(html,/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/);
  assert.match(css,/@media\(max-width:630px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/@media print/);
  for(const source of [js,previewGuard]){
    assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|localStorage|sessionStorage|indexedDB|document\.cookie|geolocation|\.innerHTML\s*=/);
  }
  for(const source of [home,pitch,showcase,review])assert.match(source,/href="\/pilot\.html"/);
});

test('external preview guard removes drawer only on Netlify Deploy Preview, not Production',()=>{
  function run(hostname,search='',hash=''){
    const redirects=[];
    vm.runInNewContext(previewGuard,{
      location:{
        hostname,search,hash,pathname:'/pilot.html',
        replace:(path)=>redirects.push(path)
      },URLSearchParams
    });
    return redirects;
  }
  assert.deepEqual(run('deploy-preview-9--magenta-churros-99ffc3.netlify.app'),
    ['/pilot.html?ntl-drawer-state=hidden']);
  assert.deepEqual(run('deploy-preview-9--magenta-churros-99ffc3.netlify.app','?utm_source=chatgpt.com','#readiness'),
    ['/pilot.html?utm_source=chatgpt.com&ntl-drawer-state=hidden#readiness']);
  assert.deepEqual(run('deploy-preview-9--magenta-churros-99ffc3.netlify.app','?ntl-drawer-state=hidden'),[]);
  assert.deepEqual(run('magenta-churros-99ffc3.netlify.app'),[]);
  assert.deepEqual(run('example.org'),[]);
});
