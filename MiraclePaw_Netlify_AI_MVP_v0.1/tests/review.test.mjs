import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as reviewData from '../public/review-data.js';

async function source(name) {
  return readFile(new URL('../public/' + name, import.meta.url), 'utf8');
}
const [html, js, css, main, showcase] = await Promise.all([
  source('review.html'), source('review.js'), source('review.css'),
  source('index.html'), source('showcase.html'),
]);

test('v0.8 provides an adult-stakeholder review page and source modules', () => {
  assert.match(html, /MiraclePaw|星爪/);
  assert.match(html, /NGO|社工/);
  assert.match(html, /HKSEC/);
  assert.ok(Object.keys(reviewData).length >= 2, 'Review guide data exports must exist');
  assert.ok(js.length >= 600 && css.length >= 1000);
});

test('review notes distinguish existing prototype from unverified outcomes', () => {
  const all = [html, JSON.stringify(reviewData)].join('\n');
  assert.match(all, /未完成|未經|尚未|待驗證|計劃/);
  assert.match(all, /測試|驗收|檢查|Demo/);
});

test('review presentation does not invoke AI or persist participant data', () => {
  const runtime = js.replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(runtime, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/);
  assert.doesNotMatch(runtime, /\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|document\.cookie|navigator\.geolocation/);
  assert.doesNotMatch(runtime, /\.innerHTML\s*=/);
});

test('existing application and scripted demos are preserved', () => {
  for (const script of ['/app.js', '/pet.js', '/mood.js']) {
    assert.ok(main.includes(script), 'Missing home script: ' + script);
  }
  assert.ok(showcase.includes('/showcase.js'));
  assert.match(css, /@media\s*\(/);
});

test('FAQ and acceptance content comes from authored data, not personal records', () => {
  const representation = JSON.stringify(reviewData);
  assert.ok(representation.length > 800);
  assert.match(representation, /私隱|安全|危機|風險|未成年/);
  assert.doesNotMatch(representation, /OPENAI_API_KEY|sk-[A-Za-z0-9]{15,}/);
});
