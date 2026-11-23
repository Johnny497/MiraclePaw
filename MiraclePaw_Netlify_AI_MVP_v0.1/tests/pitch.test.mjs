import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { PITCH_ROUTES, PILOT_STAGES, PROPOSED_MEASURES, FALLBACK_STEPS, TOTAL_SECONDS } from '../public/pitch-data.js';
import { DEMO_SCENARIOS } from '../public/demo-data.js';

const read = (name) => readFile(new URL('../public/' + name, import.meta.url), 'utf8');
const [html, css, js, home, showcase, review] = await Promise.all([
  read('pitch.html'), read('pitch.css'), read('pitch.js'),
  read('index.html'), read('showcase.html'), read('review.html')
]);

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
    this.checked = false;
    this.focused = false;
    this.href = '';
    this.type = '';
  }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  fire(name) { this.listeners[name]?.(); }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  replaceChildren(...els) { this.children = [...els]; }
  appendChild(el) { this.children.push(el); }
  append(...els) { this.children.push(...els); }
  focus() { this.focused = true; }
}

const requiredIds = [
  'pitchGate','pitchAdult','enterPitch','pitchMain','pitchHKSEC','pitchNGO',
  'timerDisplay','startTimer','pauseTimer','resetTimer','pitchEyebrow',
  'pitchStepTitle','pitchCount','durationCue','pitchProgress','pitchProgressFill',
  'pitchStepButtons','pitchHeadline','pitchScript','pitchEvidence','pitchDemoLink',
  'previousPitch','restartPitch','nextPitch','pitchStatus','pilotStages',
  'proposedMeasures','fallbackSteps','printPitch'
];
function simulatePitch() {
  const e = Object.fromEntries(requiredIds.map(id => [id, new Element()]));
  e.pitchHKSEC.dataset.pitchAudience = 'hksec';
  e.pitchNGO.dataset.pitchAudience = 'ngo';
  e.pitchMain.hidden = true;
  e.enterPitch.disabled = true;
  const docEvents = {}, winEvents = {};
  const document = {
    hidden: false,
    getElementById: id => e[id] || null,
    querySelectorAll: selector => {
      assert.equal(selector, '[data-pitch-audience]');
      return [e.pitchHKSEC, e.pitchNGO];
    },
    createElement: () => new Element(),
    addEventListener: (name, fn) => { docEvents[name] = fn; }
  };
  let now = 0, nextTimer = 1, printed = 0;
  const timers = new Map();
  const script = js.replace(/^import \{[^\n]+\} from '\.\/pitch-data\.js';/m, '');
  vm.runInNewContext(script, {
    PITCH_ROUTES, PILOT_STAGES, PROPOSED_MEASURES, FALLBACK_STEPS, TOTAL_SECONDS,
    document, window: {
      print: () => { printed++; },
      addEventListener: (name, fn) => { winEvents[name] = fn; }
    },
    Date: { now: () => now },
    setInterval: (fn) => { const id = nextTimer++; timers.set(id, fn); return id; },
    clearInterval: id => timers.delete(id),
    encodeURIComponent
  });
  return {
    e,
    docEvents,
    winEvents,
    get printed() { return printed; },
    get activeTimers() { return timers.size; },
    advance(ms) { now += ms; for(const fn of [...timers.values()]) fn(); },
    hide() { document.hidden = true; docEvents.visibilitychange?.(); },
    enter() { e.pitchAdult.checked = true; e.pitchAdult.fire('change'); e.enterPitch.fire('click'); }
  };
}

test('Netlify Deploy Preview hides external Drawer without modifying production, permission gate or routes', () => {
  const script = html.split('<script id="previewDrawerFix">')[1]?.split('</script>')[0];
  assert.ok(script, 'Missing preview-only Drawer guard');
  function run(hostname, search = '', hash = '') {
    const redirects = [];
    vm.runInNewContext(script, {
      location: {
        hostname, search, hash, pathname: '/pitch.html',
        replace: path => redirects.push(path)
      },
      URLSearchParams
    });
    return redirects;
  }
  assert.deepEqual(run('deploy-preview-8--magenta-churros-99ffc3.netlify.app'),
    ['/pitch.html?ntl-drawer-state=hidden']);
  assert.deepEqual(run('deploy-preview-8--magenta-churros-99ffc3.netlify.app', '?utm_source=chatgpt.com', '#pitchDeck'),
    ['/pitch.html?utm_source=chatgpt.com&ntl-drawer-state=hidden#pitchDeck']);
  assert.deepEqual(run('deploy-preview-8--magenta-churros-99ffc3.netlify.app', '?ntl-drawer-state=hidden'), []);
  assert.deepEqual(run('deploy-preview-8--magenta-churros-99ffc3.netlify.app', '?ntl-drawer-state=visible'), []);
  assert.deepEqual(run('magenta-churros-99ffc3.netlify.app'), []);
  assert.deepEqual(run('example.org'), []);
  assert.match(html, /id="pitchGate" role="dialog" aria-modal="true"/);
});

test('two pitch routes have five honest timed segments totalling 180 seconds', () => {
  assert.equal(TOTAL_SECONDS, 180);
  assert.deepEqual(Object.keys(PITCH_ROUTES), ['hksec', 'ngo']);
  const scenarios = new Set(DEMO_SCENARIOS.map(s => s.id));
  for (const [key, route] of Object.entries(PITCH_ROUTES)) {
    assert.ok(route.label.includes(key === 'hksec' ? 'HKSEC' : 'NGO'));
    assert.equal(route.steps.length, 5);
    assert.equal(new Set(route.steps.map(s=>s.id)).size, 5);
    assert.equal(route.steps.reduce((acc,s)=>acc+s.duration,0), 180);
    for (const step of route.steps) {
      assert.ok(scenarios.has(step.scene), 'Invalid demo deep link in ' + step.id);
      for (const field of ['title','eyebrow','headline','script','evidence','demoLabel'])
        assert.ok(typeof step[field] === 'string' && step[field].length >= 4, field + ' missing');
      assert.ok(step.script.length >= 50, step.id + ' speaking notes too short');
    }
  }
});

test('pilot and indicator drafts are clearly proposals, never clinical outcomes', () => {
  assert.equal(PILOT_STAGES.length, 3);
  assert.equal(PROPOSED_MEASURES.length, 4);
  assert.equal(FALLBACK_STEPS.length, 3);
  assert.ok(PILOT_STAGES.every(stage => /未|建議|可能/.test(stage.state)));
  assert.ok(PROPOSED_MEASURES.every(item => /未|尚|唔|不|需/.test(item.caveat)));
  assert.match(html, /非醫療|唔可以當成醫療/);
  assert.match(html, /無真實使用者個案/);
  assert.match(html, /唔會當成既有成果/);
  assert.match(JSON.stringify(PITCH_ROUTES), /2389 2222/);
  assert.match(JSON.stringify(PITCH_ROUTES), /2382 0000/);
  assert.match(JSON.stringify(PITCH_ROUTES), /唔會暗中通知/);
});

test('pitch is gated, renders planned content and can switch audience without bypassing scene gate', () => {
  const p = simulatePitch(), e = p.e;
  assert.equal(e.pitchMain.hidden, true);
  e.enterPitch.fire('click');
  assert.equal(e.pitchMain.hidden, true);
  p.enter();
  assert.equal(e.pitchMain.hidden, false);
  assert.equal(e.pitchGate.hidden, true);
  assert.equal(e.pitchStepButtons.children.length, 5);
  assert.equal(e.pilotStages.children.length, 3);
  assert.equal(e.proposedMeasures.children.length, 4);
  assert.equal(e.fallbackSteps.children.length, 3);
  assert.equal(e.pitchDemoLink.href, '/demo.html?scene=low-mood');
  assert.equal(e.pitchProgress.attributes['aria-valuenow'], '1');
  assert.equal(e.pitchStepTitle.focused, true);
  e.nextPitch.fire('click');
  assert.equal(e.pitchCount.textContent, '02 / 05');
  assert.equal(e.pitchDemoLink.href, '/demo.html?scene=small-steps');
  e.pitchStepButtons.children[4].fire('click');
  assert.equal(e.nextPitch.disabled, true);
  e.pitchNGO.fire('click');
  assert.equal(e.pitchCount.textContent, '01 / 05');
  assert.equal(e.pitchStepTitle.textContent, PITCH_ROUTES.ngo.steps[0].title);
  assert.equal(e.pitchNGO.attributes['aria-pressed'], 'true');
  e.nextPitch.fire('click');
  e.restartPitch.fire('click');
  assert.equal(e.pitchCount.textContent, '01 / 05');
  e.printPitch.fire('click');
  assert.equal(p.printed, 1);
});

test('timer pauses on hide, resets on audience switch and stops at three minutes', () => {
  const p = simulatePitch(), e = p.e;
  p.enter();
  assert.equal(e.timerDisplay.textContent, '00:00 / 03:00');
  e.startTimer.fire('click');
  assert.equal(p.activeTimers, 1);
  p.advance(32500);
  assert.equal(e.timerDisplay.textContent, '00:32 / 03:00');
  e.pauseTimer.fire('click');
  assert.equal(p.activeTimers, 0);
  assert.equal(e.timerDisplay.textContent, '00:32 / 03:00');
  e.startTimer.fire('click');
  p.advance(12500);
  p.hide();
  assert.equal(p.activeTimers, 0);
  assert.equal(e.timerDisplay.textContent, '00:45 / 03:00');
  e.pitchNGO.fire('click');
  assert.equal(e.timerDisplay.textContent, '00:00 / 03:00');
  e.startTimer.fire('click');
  p.advance(190000);
  assert.equal(e.timerDisplay.textContent, '03:00 / 03:00');
  assert.equal(p.activeTimers, 0);
  assert.equal(e.startTimer.disabled, true);
  e.resetTimer.fire('click');
  assert.equal(e.timerDisplay.textContent, '00:00 / 03:00');
});

test('presenter page has responsive safeguards and no storage, tracking or API calls', () => {
  assert.match(html, /id="pitchGate" role="dialog" aria-modal="true"/);
  assert.match(html, /id="pitchMain" hidden/);
  assert.match(html, /<script type="module" src="\/pitch\.js"><\/script>/);
  assert.match(css, /@media\(max-width:630px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /@media print/);
  assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|localStorage|sessionStorage|indexedDB|document\.cookie|geolocation|\.innerHTML\s*=/);
  assert.match(js, /visibilitychange/);
  assert.match(js, /document\.hidden/);
  assert.match(html, /固定劇本仍須成年人自行確認/);
});

test('pitch linked from home, showcase and review without disrupting previous demos', () => {
  for (const page of [home, showcase, review]) assert.match(page, /href="\/pitch\.html"/);
  assert.match(home, /src="\/app\.js"/);
  assert.match(home, /src="\/pet\.js"/);
  assert.match(home, /src="\/mood\.js"/);
  assert.match(showcase, /href="\/demo\.html"/);
  assert.match(review, /id="reviewMain" hidden/);
});
