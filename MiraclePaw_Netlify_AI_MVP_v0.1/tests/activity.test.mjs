import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {ACTIVITY_STATUS,TOPICS,SLIDE_BLUEPRINT,FOUR_QUESTIONS,PPT_WORKFLOW,slidesFor} from '../public/activity-data.js';
import {DEMO_SCENARIOS} from '../public/demo-data.js';

const read=p=>readFile(new URL('../public/'+p,import.meta.url),'utf8');
const [html,css,js,guard,home,partners,pilot,pitch,review,showcase]=await Promise.all([
 read('activity.html'),read('activity.css'),read('activity.js'),read('pilot-preview.js'),
 read('index.html'),read('partners.html'),read('pilot.html'),read('pitch.html'),
 read('review.html'),read('showcase.html')
]);
const required=[
 'activityGate','activityAdult','enterActivity','activityMain','activityStatus',
 'themeCommunity','themeEmployment','themeHealth','topicEnglish','topicTitle',
 'topicTagline','slideList','copyOutline','printOutline','resetTheme',
 'outlineStatus','questionList','workflowList','topicSafety','topicResource',
 'topicSample','topicDemo'
];
class Element{
 constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.attrs={};this.dataset={};this.textContent='';this.value='';this.href='';this.checked=false;this.hidden=false;this.disabled=false;this.focused=false;this.className='';}
 addEventListener(k,f){this.listeners[k]=f;}
 fire(k){return this.listeners[k]?.();}
 append(...x){this.children.push(...x);}
 appendChild(x){this.children.push(x);}
 replaceChildren(...x){this.children=[...x];}
 setAttribute(k,v){this.attrs[k]=String(v);}
 focus(){this.focused=true;}
}
function simulate({clipboard=true}={}){
 const e=Object.fromEntries(required.map(id=>[id,new Element()]));
 e.activityMain.hidden=true;
 e.enterActivity.disabled=true;
 for(const [id,topic] of [['themeCommunity','community'],['themeEmployment','employment'],['themeHealth','health']])e[id].dataset.topic=topic;
 let printed=0;
 const copied=[];
 const document={
  getElementById:id=>e[id]||null,
  createElement:tag=>new Element(tag),
  querySelectorAll:sel=>{
   assert.equal(sel,'[data-topic]');
   return [e.themeCommunity,e.themeEmployment,e.themeHealth];
  }
 };
 const script=js.replace(/^import\s*\{[\s\S]*?\}\s*from '\.\/activity-data\.js';/m,'');
 vm.runInNewContext(script,{
  TOPICS,SLIDE_BLUEPRINT,FOUR_QUESTIONS,PPT_WORKFLOW,slidesFor,
  document,window:{print:()=>{printed++;}},
  navigator:clipboard?{clipboard:{writeText:async x=>{copied.push(x);}}}:{},
  encodeURIComponent
 });
 return{e,copied,get printed(){return printed;},enter(){
  e.activityAdult.checked=true;e.activityAdult.fire('change');e.enterActivity.fire('click');
 }};
}

test('all three themes retain only proposed, unvalidated youth/community narratives',()=>{
 assert.deepEqual(TOPICS.map(x=>x.id),['community','employment','health']);
 assert.equal(new Set(TOPICS.map(t=>t.id)).size,3);
 assert.match(ACTIVITY_STATUS.noGo,/NO-GO/);
 assert.match(ACTIVITY_STATUS.copyright,/不接受圖片上傳/);
 const demos=new Set(DEMO_SCENARIOS.map(s=>s.id));
 for(const t of TOPICS){
  assert.ok(demos.has(t.scene),t.id+' scenario missing');
  for(const field of ['label','tagline','context','observation','insight','challenge','need','proposal','resource','safety','sample']){
   assert.ok(typeof t[field]==='string'&&t[field].length>=(field==='label'?3:8),t.id+':'+field);
  }
  assert.match(t.observation,/未/);
  assert.match(t.resource,/未|需要/);
  assert.match(t.proposal,/自願|虛構|成年人|自選|概念/);
 }
 const all=JSON.stringify(TOPICS);
 assert.match(all,/唔會|唔|不可|不/);
 assert.match(all,/2389 2222/);
 assert.match(all,/2382 0000/);
 assert.match(all,/999/);
});

test('the eight-slide outline and four questions follow source examples without invented field evidence',()=>{
 assert.equal(SLIDE_BLUEPRINT.length,8);
 assert.deepEqual(SLIDE_BLUEPRINT.map(x=>x.number),['01','02','03','04','05','06','07','08']);
 assert.equal(FOUR_QUESTIONS.length,4);
 assert.equal(PPT_WORKFLOW.length,5);
 for(const t of TOPICS){
  const slides=slidesFor(t.id);
  assert.equal(slides.length,8);
  for(const s of slides){
   assert.equal(s.body,t[s.field]);
   assert.ok(s.helper.length>10);
   assert.equal(s.topicId,t.id);
  }
 }
 assert.equal(slidesFor('unknown')[0].topicId,'community');
 assert.match(PPT_WORKFLOW[3].detail,/唔.*產生|唔.*pptx/);
 assert.match(JSON.stringify(PPT_WORKFLOW),/照片|相片|圖片/);
});

test('adult gate is required; three tabs, eight slides, questions and workflow all render',()=>{
 const s=simulate(),e=s.e;
 assert.equal(e.activityMain.hidden,true);
 e.enterActivity.fire('click');
 assert.equal(e.activityMain.hidden,true);
 s.enter();
 assert.equal(e.activityMain.hidden,false);
 assert.equal(e.activityGate.hidden,true);
 assert.equal(e.activityStatus.focused,true);
 assert.equal(e.slideList.children.length,8);
 assert.equal(e.questionList.children.length,4);
 assert.equal(e.workflowList.children.length,5);
 assert.match(e.topicTitle.textContent,/青年社區參與/);
 assert.equal(e.themeCommunity.attrs['aria-pressed'],'true');
 e.themeEmployment.fire('click');
 assert.match(e.topicTitle.textContent,/青年就業/);
 assert.equal(e.themeEmployment.attrs['aria-pressed'],'true');
 assert.equal(e.themeCommunity.attrs['aria-pressed'],'false');
 assert.equal(e.slideList.children[6].children[1].textContent,TOPICS[1].proposal);
 e.themeHealth.fire('click');
 assert.match(e.topicTitle.textContent,/青年健康/);
 assert.equal(e.topicDemo.href,'/demo.html?scene=safety');
 assert.match(e.topicSafety.textContent,/2389 2222/);
 e.resetTheme.fire('click');
 assert.match(e.topicTitle.textContent,/青年社區參與/);
 assert.equal(e.slideList.children.length,8);
});

test('copy explicitly creates an honest text outline, never a PPT or offsite request',async()=>{
 const s=simulate(),e=s.e;s.enter();
 await e.copyOutline.fire('click');
 assert.equal(s.copied.length,1);
 assert.match(s.copied[0],/八頁大綱|概念大綱/);
 assert.match(s.copied[0],/08｜資源、風險與下一步/);
 assert.match(s.copied[0],/未有 NGO 正式合作/);
 assert.match(s.copied[0],/NO-GO/);
 assert.match(e.outlineStatus.textContent,/沒有生成 \.pptx/);
 e.themeEmployment.fire('click');
 await e.copyOutline.fire('click');
 assert.equal(s.copied.length,2);
 assert.match(s.copied[1],/青年就業／技能/);
 e.printOutline.fire('click');
 assert.equal(s.printed,1);
 const fallback=simulate({clipboard:false});
 fallback.enter();
 await fallback.e.copyOutline.fire('click');
 assert.match(fallback.e.outlineStatus.textContent,/剪貼簿/);
 assert.equal(fallback.copied.length,0);
});

test('page is nontracking, non-uploading, CSP-safe, responsive and linked from past versions',()=>{
 for(const id of required)assert.ok(html.includes('id="'+id+'"'),id+' missing from html');
 assert.match(html,/<main id="activityMain" hidden>/);
 assert.match(html,/role="dialog" aria-modal="true"/);
 assert.match(html,/<script type="module" src="\/activity\.js"><\/script>/);
 assert.match(html,/<script src="\/pilot-preview\.js"><\/script>/);
 assert.doesNotMatch(html,/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/);
 assert.match(css,/@media\(max-width:630px\)/);
 assert.match(css,/@media print/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(guard,/ntl-drawer-state/);
 assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|localStorage|sessionStorage|indexedDB|document\.cookie|geolocation|\.innerHTML\s*=/);
 assert.doesNotMatch(html,/<input\b[^>]*type="file"|<form\b/);
 assert.match(html,/唔接受上傳工作紙或相片/);
 assert.match(html,/唔.*生成 PowerPoint/);
 for(const prev of [home,partners,pilot,pitch,review,showcase])assert.match(prev,/href="\/activity\.html"/);
 assert.match(home,/src="\/app\.js"/);
 assert.match(home,/src="\/pet\.js"/);
 assert.match(home,/src="\/mood\.js"/);
 assert.match(partners,/id="partnersMain" hidden/);
});
