import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const [app,html]=await Promise.all([
  readFile(new URL('../public/app.js',import.meta.url),'utf8'),
  readFile(new URL('../public/index.html',import.meta.url),'utf8')
]);
const ids=[
  'messages','chatForm','userInput','sendButton','gate','gateForm',
  'crisisNotice','aiFallback','connectionStatus','petSpeech',
  'stepStatus','doneStep','skipStep','petHello','petHelloMessage',
  'resetChat','agree','passcode','gateError'
];
class Element {
  constructor(tag='div'){
    this.tag=tag;
    this.children=[];
    this.handlers={};
    this.dataset={};
    this.className='';
    this.classList={remove:()=>{},toggle:()=>{}};
    this.style={};
    this.textContent='';
    this.innerHTML='';
    this.value='';
    this.hidden=false;
    this.disabled=false;
    this.checked=false;
    this.scrollTop=0;
    this.scrollHeight=33;
    this.attributes={};
    this.removed=false;
    this.focused=false;
  }
  addEventListener(key,fn){this.handlers[key]=fn;}
  fire(key,arg){return this.handlers[key]?.(arg??{preventDefault(){}});}
  appendChild(x){this.children.push(x);}
  append(...items){this.children.push(...items);}
  replaceChildren(...items){this.children=[...items];}
  remove(){this.removed=true;}
  setAttribute(k,v){this.attributes[k]=String(v);}
  removeAttribute(k){delete this.attributes[k];}
  focus(){this.focused=true;}
}
function simulate(fetchImpl=async()=>new Response(JSON.stringify({error:'AI 暫時未能回覆',code:'AI_LIMIT'}),{status:503})){
  const e=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
  e.aiFallback.hidden=true;
  e.crisisNotice.hidden=true;
  e.gateError.hidden=true;
  const allButtons={'[data-prompt]':[],'[data-step]':[]};
  const document={
    getElementById:id=>e[id]??null,
    createElement:tag=>new Element(tag),
    querySelectorAll:sel=>allButtons[sel]??[]
  };
  const requests=[];
  const fetch=async (...args)=>{requests.push(args);return await fetchImpl(...args);};
  vm.runInNewContext(app,{document,fetch,Error},{filename:'app.js'});
  return {
    e,requests,
    unlock(){e.agree.checked=true;e.passcode.value='mock-passcode-at-least-12-chars';e.gateForm.fire('submit');}
  };
}
const settle=async()=>{await new Promise(resolve=>setImmediate(resolve));await Promise.resolve();};

test('refusing to go outside never sends network requests and remains comforting before/after password',()=>{
  const s=simulate(),e=s.e;
  e.skipStep.fire('click');
  assert.equal(s.requests.length,0);
  assert.match(e.petSpeech.textContent,/休息都得/);
  assert.match(e.stepStatus.textContent,/唔出去完全可以/);
  assert.match(e.messages.children.at(-1).children[0].textContent,/一樣陪住/);
  s.unlock();
  assert.equal(e.gate.hidden,true);
  e.skipStep.fire('click');
  assert.equal(s.requests.length,0);
  assert.match(e.messages.children.at(-1).children[0].textContent,/唔需要交功課/);
});

test('upstream AI failure exposes optional scripted-demo fallback without repeated requests',async()=>{
  const s=simulate(),e=s.e;
  s.unlock();
  e.userInput.value='你好爪爪';
  e.chatForm.fire('submit');
  await settle();
  assert.equal(s.requests.length,1);
  assert.equal(s.requests[0][0],'/api/chat');
  assert.equal(e.aiFallback.hidden,false);
  assert.equal(e.sendButton.disabled,false);
  const replies=e.messages.children.filter(row=>row.className==='message system');
  assert.equal(replies.length,1);
  assert.match(replies[0].children[0].textContent,/AI 暫時未能回覆/);
  assert.match(html,/id="aiFallback"/);
  assert.match(html,/<a href="\/demo\.html">五個免費虛構固定劇本<\/a>/);
  assert.match(html,/role="status" aria-live="polite"/);
});

test('new message hides old AI fallback, while local crisis response never invokes upstream',async()=>{
  const s=simulate(),e=s.e;
  s.unlock();
  e.userInput.value='今朝好攰';
  e.chatForm.fire('submit');
  await settle();
  assert.equal(e.aiFallback.hidden,false);
  e.userInput.value='我想自殺';
  e.chatForm.fire('submit');
  await settle();
  assert.equal(s.requests.length,1,'Local crisis branch must not invoke API');
  assert.equal(e.aiFallback.hidden,true);
  assert.equal(e.crisisNotice.hidden,false);
  assert.match(e.messages.children.at(-1).children[0].textContent,/2389 2222/);
  assert.match(e.messages.children.at(-1).children[0].textContent,/2382 0000/);
});

test('reset hides fallback and reopens consent/password gate',async()=>{
  const s=simulate(),e=s.e;
  s.unlock();
  e.userInput.value='測試';
  e.chatForm.fire('submit');
  await settle();
  assert.equal(e.aiFallback.hidden,false);
  e.resetChat.fire('click');
  assert.equal(e.aiFallback.hidden,true);
  assert.equal(e.gate.hidden,false);
  assert.equal(e.userInput.disabled,true);
  assert.equal(e.agree.checked,false);
  assert.equal(s.requests.length,1);
});
