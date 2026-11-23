import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const read = (file) => readFile(new URL(`../public/${file}`, import.meta.url), 'utf8');
const [html, app, tour, css] = await Promise.all([
  read('index.html'), read('app.js'), read('tour.js'), read('styles.css')
]);

class El {
  constructor(id) { this.id = id; this.hidden = false; this.textContent = ''; this.handlers = {}; this.focused = false; }
  addEventListener(event, fn) { this.handlers[event] = fn; }
  click() { this.handlers.click?.(); }
  focus() { this.focused = true; }
  scrollIntoView() { this.scrolled = true; }
}
function simulateTour() {
  const ids = ['tourStart', 'tourNext', 'tourStop', 'tourStatus', 'petTouch', 'moodCheckin', 'littleSteps', 'petHello'];
  const el = Object.fromEntries(ids.map(id => [id, new El(id)]));
  el.tourNext.hidden = true;
  el.tourStop.hidden = true;
  vm.runInNewContext(tour, { document: { getElementById(id) { return el[id] || null; } } }, { filename: 'tour.js' });
  return el;
}

test('v1.5 includes free local entry and clearly separates optional AI', () => {
  assert.match(html, /id="localEntry"/);
  assert.match(html, /id="agree"/);
  assert.match(html, /id="tourStart"/);
  assert.match(html, /src="\/tour\.js"/);
  assert.match(html, /僅供成年持份者測試/);
  assert.match(app, /localEntry/);
  assert.match(app, /demoPasscode = '';/);
  assert.match(app, /if \(!\$\('agree'\)\.checked\)/);
  assert.match(app, /AI 對話未啟用/);
  assert.match(css, /\.tour-panel/);
});

test('four optional scenes are local and support completion, restart, and early exit', () => {
  const e = simulateTour();
  e.tourStart.click();
  assert.equal(e.tourStart.hidden, true);
  assert.equal(e.tourNext.hidden, false);
  assert.match(e.tourStatus.textContent, /第一段/);
  assert.equal(e.petTouch.focused, true);
  e.tourNext.click();
  assert.match(e.tourStatus.textContent, /第二段/);
  assert.equal(e.moodCheckin.focused, true);
  e.tourNext.click();
  assert.match(e.tourStatus.textContent, /第三段/);
  assert.equal(e.littleSteps.focused, true);
  e.tourNext.click();
  assert.match(e.tourStatus.textContent, /第四段/);
  assert.equal(e.petHello.focused, true);
  e.tourNext.click();
  assert.equal(e.tourStart.hidden, false);
  assert.equal(e.tourNext.hidden, true);
  assert.match(e.tourStatus.textContent, /冇分數/);
  e.tourStart.click();
  e.tourStop.click();
  assert.equal(e.tourStart.hidden, false);
  assert.match(e.tourStatus.textContent, /一樣可以/);
});

test('the tour and no-outing quick suggestion never require API requests', () => {
  assert.doesNotMatch(tour, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|navigator\.geolocation/);
  assert.match(html, /data-local-companion="rest"/);
  assert.doesNotMatch(html, /data-prompt="我今日唔想出門/);
  assert.match(app, /querySelectorAll\('\[data-local-companion\]'\)/);
  assert.match(app, /button\.addEventListener\('click', reassureNoOuting\)/);
  assert.match(app, /A refusal must not trigger an unwanted network message/);
});
