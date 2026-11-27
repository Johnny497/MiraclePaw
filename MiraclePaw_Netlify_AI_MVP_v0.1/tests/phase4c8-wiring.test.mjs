import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const html = read('public/index.html');
const app = read('public/app.js');
const fallback = read('public/ai-fallback.js');
const deepseek = read('netlify/functions/deepseek-test.mjs');

test('browser loads fallback adapter before app controller', () => {
  const adapter = html.indexOf('src="/ai-fallback.js"');
  const controller = html.indexOf('src="/app.js"');
  assert.ok(adapter >= 0 && controller > adapter);
  assert.match(app, /window\.MiraclePawAIFallback/);
  assert.match(app, /fallbackAdapter\?\.classify/);
});
test('chat UI does not invoke isolated DeepSeek test endpoint', () => {
  assert.doesNotMatch(app, /\/api\/deepseek-test|DEEPSEEK_API_KEY/);
  assert.match(app, /fetch\('\/api\/presentation-chat'/);
});
test('failed requests use local response, no automatic retry', () => {
  assert.match(app, /response\.ok\s*\?\s*await response\.json\(\)\.catch\(\(\) => null\)/);
  assert.match(app, /fallbackAdapter\?\.classify\(0, null, true\)/);
  assert.match(app, /addMessage\('assistant', decision\?\.text/);
  assert.doesNotMatch(app, /setTimeout\s*\(\s*\(\)\s*=>\s*send|while\s*\(\s*!response\.ok/);
});
test('free local companion does not call the chat endpoint', () => {
  assert.match(app, /function reassureNoOuting\(\)/);
  assert.match(app, /\$\('skipStep'\)\.addEventListener\('click', reassureNoOuting\)/);
  assert.match(app, /data-local-companion/);
  assert.match(app, /demoPasscode = '';/);
});
test('model text is rendered as text, not HTML', () => {
  assert.match(app, /bubble\.textContent = text/);
  assert.doesNotMatch(app, /bubble\.innerHTML = (?:decision\.text|result\.reply)/);
});
test('DeepSeek server test remains opt-in and disabled without explicit flag', () => {
  assert.match(deepseek, /DEEPSEEK_TEST_ENABLED/);
  assert.match(deepseek, /AI_CHAT_DISABLED/);
  assert.doesNotMatch(html, /\/api\/deepseek-test/);
});
