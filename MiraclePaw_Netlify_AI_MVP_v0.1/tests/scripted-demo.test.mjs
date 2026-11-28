import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DEMO_SCENARIOS, SUPPORT_CONTACTS } from '../public/demo-data.js';

const demoHtml = await readFile(new URL('../public/demo.html', import.meta.url), 'utf8');
const demoJs = await readFile(new URL('../public/demo.js', import.meta.url), 'utf8');
const demoCss = await readFile(new URL('../public/demo.css', import.meta.url), 'utf8');
const mainHtml = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

test('five unique scenarios include all core MiraclePaw safety concepts', () => {
  assert.deepEqual(DEMO_SCENARIOS.map((scene) => scene.id),
    ['low-mood', 'name-mood', 'small-steps', 'pet-hello', 'safety']);
  assert.equal(new Set(DEMO_SCENARIOS.map((scene) => scene.id)).size, DEMO_SCENARIOS.length);
  assert.match(DEMO_SCENARIOS.find((scene) => scene.id === 'name-mood').nodes.recall.lines.at(-1).text, /預設劇本/);
  assert.match(DEMO_SCENARIOS.find((scene) => scene.id === 'pet-hello').nodes.hello.lines.at(-1).text, /冇任何真人/);
});

test('all script branches point to valid nodes and reach a terminal segment', () => {
  for (const scene of DEMO_SCENARIOS) {
    assert.ok(scene.nodes[scene.first], scene.id + ' has start node');
    const visited = new Set();
    const stack = [scene.first];
    let terminalCount = 0;
    while (stack.length) {
      const nodeId = stack.pop();
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      const node = scene.nodes[nodeId];
      assert.ok(node, scene.id + ' missing ' + nodeId);
      assert.ok(node.lines.length > 0);
      for (const line of node.lines) {
        assert.ok(['visitor', 'paw', 'other-pet'].includes(line.from));
        assert.ok(typeof line.text === 'string' && line.text.length > 0);
      }
      if (!node.choices.length) terminalCount++;
      for (const option of node.choices) {
        assert.ok(option.label && scene.nodes[option.next], scene.id + ': ' + option.next);
        stack.push(option.next);
      }
    }
    assert.ok(terminalCount >= 1, scene.id + ' should have a terminal scene');
    assert.equal(visited.size, Object.keys(scene.nodes).length, scene.id + ' has unreachable nodes');
  }
});

test('rejecting outings, tasks or pet exchanges never removes companionship', () => {
  const stay = DEMO_SCENARIOS.find((s) => s.id === 'low-mood').nodes.skip.lines.at(-1).text;
  const home = DEMO_SCENARIOS.find((s) => s.id === 'small-steps').nodes.home.lines.at(-1).text;
  const pet = DEMO_SCENARIOS.find((s) => s.id === 'pet-hello').nodes.stay.lines.at(-1).text;
  assert.match(stay, /唔會.*扣分.*停止陪伴/);
  assert.match(home, /照樣陪你/);
  assert.match(pet, /自己傾偈/);
});

test('crisis script preserves companionship and offers fixed Hong Kong helplines', () => {
  const safety = DEMO_SCENARIOS.find((s) => s.id === 'safety');
  assert.equal(safety.crisis, true);
  for (const node of Object.values(safety.nodes)) {
    assert.ok(node.lines.some((line) => line.from === 'paw'), 'each crisis branch must keep pet replying');
  }
  const allScript = JSON.stringify(safety.nodes);
  assert.match(allScript, /2389 2222/);
  assert.match(allScript, /2382 0000/);
  assert.match(allScript, /999/);
  assert.match(allScript, /唔會偷偷通知緊急聯絡人/);
  assert.equal(SUPPORT_CONTACTS.samaritans.href, 'tel:23892222');
  assert.equal(SUPPORT_CONTACTS.suicidePrevention.href, 'tel:23820000');
  assert.equal(SUPPORT_CONTACTS.emergency.href, 'tel:999');
  for (const str of ['撒瑪利亞會 2389 2222', '生命熱線 2382 0000', '即時危險：999']) {
    assert.ok(demoHtml.includes(str));
  }
});

test('demo consent gate is explicitly for adults and does not require AI credentials', () => {
  assert.match(demoHtml, /id="demoAdultAgree"/);
  assert.match(demoHtml, /id="demoStart"[^>]*disabled/);
  assert.match(demoHtml, /僅供成年|只供成年/);
  assert.match(demoHtml, /唔需要任何 AI API Key 或試玩密碼/);
  assert.match(demoHtml, /固定劇本 · 非真實 AI/);
  assert.match(demoJs, /if \(!\$\('demoAdultAgree'\)\.checked\) return/);
});

test('scripted demo has no API, user text input, analytics or browser persistence', () => {
  const runtime = demoJs.replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(runtime, /\bfetch\s*\(|\bXMLHttpRequest\b|sendBeacon|WebSocket|EventSource|localStorage|sessionStorage|indexedDB|document\.cookie|geolocation/);
  assert.doesNotMatch(demoHtml, /<(?:textarea|form)\b/i);
  assert.match(demoHtml, /<script type="module" src="\/demo\.js"><\/script>/);
  assert.match(demoJs, /\.textContent = line\.text/);
  assert.doesNotMatch(runtime, /\.innerHTML\s*=/);
});

test('homepage, welcome gate and AI failure fallback link to the five scripted demos', () => {
  assert.equal((mainHtml.match(/href="\/demo.html"/g) || []).length, 3);
  assert.match(mainHtml, /id="aiFallback"[^>]*role="status"/);
  assert.match(mainHtml, /src="\/app\.js"/);
  assert.match(mainHtml, /src="\/mood\.js"/);
  assert.match(demoCss, /prefers-reduced-motion:reduce/);
});
