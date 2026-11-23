import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { AUDIENCE_ROUTES } from '../public/showcase-data.js';
import { DEMO_SCENARIOS } from '../public/demo-data.js';

const source = await readFile(new URL('../public/showcase.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../public/showcase.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../public/showcase.css', import.meta.url), 'utf8');
const demoJs = await readFile(new URL('../public/demo.js', import.meta.url), 'utf8');
const indexHtml = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const demoHtml = await readFile(new URL('../public/demo.html', import.meta.url), 'utf8');

class Element {
  constructor() {
    this.listeners = {};
    this.attributes = {};
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.textContent = '';
    this.hidden = false;
    this.disabled = false;
    this.focused = false;
    this.href = '';
  }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  fire(name) { this.listeners[name]?.(); }
  appendChild(node) { this.children.push(node); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  focus() { this.focused = true; }
}
const ids = [
  'showcaseGate','showcaseAdult','enterShowcase','showcaseGuide',
  'routeHKSEC','routeNGO','audienceTitle','stepCount','guideProgress',
  'progressFill','stepChips','stepEyebrow','stepHeading','stepFocus',
  'openScenario','presenterTalk','presenterEvidence',
  'previousStep','nextStep','restartGuide','printBrief'
];
function runShowcase() {
  const elements = Object.fromEntries(ids.map((id) => [id, new Element()]));
  const buttons = [elements.routeHKSEC, elements.routeNGO];
  buttons[0].dataset.audience = 'hksec';
  buttons[1].dataset.audience = 'ngo';
  elements.showcaseGuide.hidden = true;
  elements.enterShowcase.disabled = true;
  let prints = 0;
  const doc = {
    getElementById(id) { return elements[id] || null; },
    querySelectorAll(selector) {
      assert.equal(selector, '[data-audience]');
      return buttons;
    },
    createElement() { return new Element(); },
  };
  const script = source.replace(/^import \{ AUDIENCE_ROUTES \} from '\.\/showcase-data\.js';/m, '');
  vm.runInNewContext(script, { document: doc, AUDIENCE_ROUTES, window: { print() { prints++; } } });
  return { elements, prints: () => prints };
}

test('the two stakeholder routes have five unique and honest evidence-scoped steps', () => {
  assert.deepEqual(Object.keys(AUDIENCE_ROUTES), ['hksec','ngo']);
  const scenarioIds = new Set(DEMO_SCENARIOS.map(s => s.id));
  for (const [audience, route] of Object.entries(AUDIENCE_ROUTES)) {
    assert.equal(route.id, audience);
    assert.equal(route.steps.length, 5);
    assert.equal(new Set(route.steps.map(s=>s.id)).size,5);
    for (const step of route.steps) {
      for(const field of ['heading','eyebrow','focus','presenter','evidence','scenario','cta'])
        assert.ok(typeof step[field] === 'string' && step[field].length >= (['presenter','evidence','focus'].includes(field) ? 12 : 1), `${audience} ${step.id}: ${field}`);
      assert.ok(scenarioIds.has(step.scenario), `${audience} ${step.id} invalid scripted scene`);
    }
  }
});

test('showcase visually distinguishes present prototype from unvalidated outcomes',()=>{
  assert.match(html,/已做 · 可試/);
  assert.match(html,/未完成 · 待驗證/);
  assert.match(html,/唔係醫療服務|非醫療服務/);
  assert.match(html,/無聲稱已完成 NGO 試點/);
  assert.match(html,/無任何真實服務使用者個案/);
});

test('showcase remains gated until adult confirmation and offers an accessible guided route',()=>{
  const {elements:e}=runShowcase();
  assert.equal(e.showcaseGuide.hidden,true);
  assert.equal(e.enterShowcase.disabled,true);
  e.enterShowcase.fire('click');
  assert.equal(e.showcaseGuide.hidden,true);
  e.showcaseAdult.checked=true;
  e.showcaseAdult.fire('change');
  assert.equal(e.enterShowcase.disabled,false);
  e.enterShowcase.fire('click');
  assert.equal(e.showcaseGuide.hidden,false);
  assert.equal(e.showcaseGate.hidden,true);
  assert.equal(e.stepChips.children.length,5);
  assert.equal(e.stepHeading.textContent,AUDIENCE_ROUTES.hksec.steps[0].heading);
  assert.equal(e.openScenario.href,'/demo.html?scene=low-mood');
  assert.equal(e.guideProgress.attributes['aria-valuenow'],'1');
  assert.equal(e.previousStep.disabled,true);
  assert.equal(e.stepHeading.focused,true);
});

test('presenter controls navigate steps, switch audiences, restart and offer print',()=>{
  const {elements:e,prints}=runShowcase();
  e.showcaseAdult.checked=true;
  e.enterShowcase.fire('click');
  e.nextStep.fire('click');
  assert.equal(e.stepCount.textContent,'第 2／5 步');
  assert.equal(e.openScenario.href,'/demo.html?scene=small-steps');
  e.routeNGO.fire('click');
  assert.equal(e.audienceTitle.textContent,AUDIENCE_ROUTES.ngo.label);
  assert.equal(e.stepCount.textContent,'第 1／5 步');
  assert.equal(e.openScenario.href,'/demo.html?scene=low-mood');
  e.stepChips.children[3].fire('click');
  assert.equal(e.stepCount.textContent,'第 4／5 步');
  assert.equal(e.openScenario.href,'/demo.html?scene=safety');
  e.stepChips.children[4].fire('click');
  assert.equal(e.nextStep.disabled,true);
  e.restartGuide.fire('click');
  assert.equal(e.stepCount.textContent,'第 1／5 步');
  e.printBrief.fire('click');
  assert.equal(prints(),1);
});

test('demo deep links preserve adult acknowledgement and whitelist scene choices',()=>{
  assert.match(demoJs,/new URLSearchParams\(window\.location\.search\)\.get\('scene'\)/);
  assert.match(demoJs,/scenarioById\.has\(requestedScenarioId\)/);
  assert.match(demoJs,/if \(!\$\('demoAdultAgree'\)\.checked\) return;/);
  assert.match(demoJs,/openScenario\(initialScenarioId, true\)/);
  assert.ok(demoJs.indexOf('openScenario(initialScenarioId, true)')>demoJs.indexOf("if (!$('demoAdultAgree').checked) return;"));
  assert.match(demoHtml,/href="\/showcase\.html"/);
});

test('main site and gated welcome link to the new stakeholder showcase',()=>{
  assert.equal((indexHtml.match(/href="\/showcase\.html"/g)||[]).length,2);
  assert.match(indexHtml,/src="\/app\.js"/);
  assert.match(indexHtml,/src="\/pet\.js"/);
  assert.match(indexHtml,/src="\/mood\.js"/);
});

test('stakeholder guide has no active AI, data collection, storage or external scripts',()=>{
  const runtime=source.replace(/\/\/[^\n]*/g,'');
  assert.doesNotMatch(runtime,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB|document\.cookie|geolocation/);
  assert.doesNotMatch(html,/<textarea\b|<form\b/i);
  assert.match(html,/<script type="module" src="\/showcase\.js"><\/script>/);
  assert.match(css,/@media print/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});
