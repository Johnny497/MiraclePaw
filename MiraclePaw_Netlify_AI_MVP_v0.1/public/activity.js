// MiraclePaw v1.2 — static, safe NGO activity proposal draft builder.
// Data is pre-authored; switching topics stays in browser memory. No upload,
// API request, automatic deck generation, analytics or persistence.
import {TOPICS, SLIDE_BLUEPRINT, FOUR_QUESTIONS, PPT_WORKFLOW, slidesFor} from './activity-data.js';

const $ = id=>document.getElementById(id);
const required=['activityGate','activityAdult','enterActivity','activityMain',
  'activityStatus','themeCommunity','themeEmployment','themeHealth',
  'topicEnglish','topicTitle','topicTagline','slideList','copyOutline',
  'printOutline','resetTheme','outlineStatus','questionList','workflowList',
  'topicSafety','topicResource','topicSample','topicDemo'];
for(const id of required){
 if(!$(id))throw new Error('Missing activity element: '+id);
}
let selected='community';
function make(tag,cls,text){
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(text!==undefined)el.textContent=text;
 return el;
}
const topic=()=>TOPICS.find(t=>t.id===selected)||TOPICS[0];
function renderTopic(){
 const t=topic();
 $('topicEnglish').textContent=t.english.toUpperCase();
 $('topicTitle').textContent=t.emoji+' '+t.label;
 $('topicTagline').textContent=t.tagline;
 $('topicSafety').textContent=t.safety;
 $('topicResource').textContent=t.resource;
 $('topicSample').textContent=t.sample;
 $('topicDemo').href='/demo.html?scene='+encodeURIComponent(t.scene);
 const cards=slidesFor(selected).map(slide=>{
  const card=make('article','slide-idea');
  const head=make('header');
  head.append(make('span','slide-no',slide.number),make('h3','',slide.title));
  card.append(
   head,make('p','slide-body',slide.body),make('p','slide-caveat','證據界線：'+slide.helper)
  );
  return card;
 });
 $('slideList').replaceChildren(...cards);
 for(const button of document.querySelectorAll('[data-topic]')){
  button.setAttribute('aria-pressed',String(button.dataset.topic===selected));
 }
 $('outlineStatus').textContent='正在查看「'+t.label+'」建議。呢份係虛構活動草稿，未上傳資料或生成 .pptx。';
}
function choose(next){
 if(!TOPICS.some(t=>t.id===next))return;
 selected=next;
 renderTopic();
 $('topicTitle').focus();
}
function renderReferences(){
 $('questionList').replaceChildren(...FOUR_QUESTIONS.map(q=>make('li','',q)));
 $('workflowList').replaceChildren(...PPT_WORKFLOW.map((w,index)=>{
  const card=make('article','workflow-item');
  card.append(make('span','work-no',String(index+1).padStart(2,'0')),make('h3','',w.title),make('p','',w.detail));
  return card;
 }));
}
function textOutline(){
 const t=topic();
 const lines=[
  '星爪 MiraclePaw v1.2｜'+t.label+'（概念大綱）',
  '重要：內容為虛構案例及未驗證問題假設，未有 NGO 正式合作、實地考察、真人試點或成效數據。',
  ''
 ];
 for(const s of slidesFor(t.id)){
  lines.push(s.number+'｜'+s.title);
  lines.push(s.body);
  lines.push('證據界線：'+s.helper,'');
 }
 lines.push('資源／安全：'+t.resource);
 lines.push('服務界線：'+t.safety);
 lines.push('正式決定：NO-GO，任何真人活動需另行取得適用書面批准。');
 return lines.join('\n');
}
function fallbackCopy(){
 $('outlineStatus').textContent='瀏覽器未開放剪貼簿；可用列印／另存 PDF，或者逐頁人手選取文字。未建立或上傳任何檔案。';
}
async function copy(){
 const text=textOutline();
 if(!navigator.clipboard||typeof navigator.clipboard.writeText!=='function'){
  fallbackCopy();return;
 }
 try{
  await navigator.clipboard.writeText(text);
  $('outlineStatus').textContent='已將建議大綱複製到剪貼簿。請人手核實圖片授權、來源、事實及 NGO／倫理／安全狀態，再自行排版 PPT；此頁沒有生成 .pptx。';
 }catch{fallbackCopy();}
}
for(const button of document.querySelectorAll('[data-topic]')){
 button.addEventListener('click',()=>choose(button.dataset.topic));
}
$('resetTheme').addEventListener('click',()=>choose('community'));
$('copyOutline').addEventListener('click',copy);
$('printOutline').addEventListener('click',()=>window.print());
$('activityAdult').addEventListener('change',()=>{
 $('enterActivity').disabled=!$('activityAdult').checked;
});
$('enterActivity').addEventListener('click',()=>{
 if(!$('activityAdult').checked)return;
 $('activityGate').hidden=true;
 $('activityMain').hidden=false;
 renderTopic();
 renderReferences();
 $('activityStatus').focus();
});
