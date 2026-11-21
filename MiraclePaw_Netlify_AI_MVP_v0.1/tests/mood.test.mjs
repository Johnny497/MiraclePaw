import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const moodJs = await readFile(new URL('../public/mood.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const catJs = await readFile(new URL('../public/pet.js', import.meta.url), 'utf8');

class FakeElement {
  constructor(id = '') {
    this.id = id;
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.dataset = {};
    this.textContent = '';
    this.hidden = false;
    this.disabled = false;
  }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  click() { this.listeners.click?.(); }
  appendChild(node) { this.children.push(node); }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
}
function prepare(confirmResult = true) {
  const ids = ['moodHistory', 'moodEmpty', 'moodFeedback', 'moodClear', 'moodSkip', 'petSpeech'];
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement(id)]));
  const keys = ['happy', 'calm', 'worried', 'low', 'tired'];
  const buttons = keys.map((key) => {
    const element = new FakeElement();
    element.dataset.feeling = key;
    return element;
  });
  const events = [];
  const document = {
    getElementById(id) { return elements[id] || null; },
    querySelectorAll(selector) {
      assert.equal(selector, '[data-feeling]');
      return buttons;
    },
    createElement(tag) { return new FakeElement(tag); },
    dispatchEvent(event) { events.push(event); },
  };
  const window = { confirm: () => confirmResult };
  class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  vm.runInNewContext(moodJs, { document, window, CustomEvent }, { filename: 'mood.js' });
  return { elements, buttons, events };
}

test('mood UI offers five voluntary emotions with explicit skip and clear', () => {
  const controls = ['happy', 'calm', 'worried', 'low', 'tired'];
  controls.forEach((key) => assert.match(html, new RegExp('data-feeling="' + key + '"')));
  assert.match(html, /id="moodSkip"/);
  assert.match(html, /id="moodClear"/);
  assert.match(html, /src="\/mood\.js"/);
  assert.match(html, /唔係心理診斷/);
});

test('initial mood history is empty and clearing is disabled', () => {
  const { elements } = prepare();
  assert.equal(elements.moodHistory.children.length, 0);
  assert.equal(elements.moodEmpty.hidden, false);
  assert.equal(elements.moodClear.disabled, true);
});

test('check-in is local; low mood gets support and changes only pet expression', () => {
  const { elements, buttons, events } = prepare();
  buttons[3].click();
  assert.equal(elements.moodHistory.children.length, 1);
  const entry = elements.moodHistory.children[0];
  assert.match(entry.children[0].textContent, /低落/);
  assert.ok(!Number.isNaN(Date.parse(entry.children[1].dateTime)));
  assert.equal(elements.moodEmpty.hidden, true);
  assert.equal(elements.moodClear.disabled, false);
  assert.match(elements.petSpeech.textContent, /繼續喺度陪你/);
  assert.equal(events.length, 1);
  assert.equal(events[0].detail.petMood, 'calm');
  assert.equal(buttons[3].attributes['aria-pressed'], 'true');
});

test('skipping changes no records, cancelling deletion leaves data intact', () => {
  const { elements, buttons } = prepare(false);
  buttons[2].click();
  elements.moodSkip.click();
  assert.equal(elements.moodHistory.children.length, 1);
  assert.match(elements.moodFeedback.textContent, /冇任何懲罰/);
  elements.moodClear.click();
  assert.equal(elements.moodHistory.children.length, 1);
});

test('confirmed deletion removes all records, and log is limited to 10', () => {
  const { elements, buttons } = prepare(true);
  for (let i = 0; i < 14; i++) buttons[i % 5].click();
  assert.equal(elements.moodHistory.children.length, 10);
  elements.moodClear.click();
  assert.equal(elements.moodHistory.children.length, 0);
  assert.equal(elements.moodEmpty.hidden, false);
  assert.equal(elements.moodClear.disabled, true);
});

test('mood selection never sends network requests or persists to storage', () => {
  assert.doesNotMatch(moodJs, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.match(catJs, /miraclepaw:mood-checkin/);
  assert.match(html, /冇飢餓值、親密度扣分/);
});
