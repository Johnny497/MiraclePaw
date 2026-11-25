import test from 'node:test';
import assert from 'node:assert/strict';
import { withMockQuota } from './fixtures/quota.mjs';
import chat from '../netlify/functions/chat.mjs';
import sandbox from '../netlify/functions/deepseek-test.mjs';
import { moderationDecision } from '../netlify/lib/moderation.mjs';
import { verdict, moderation } from './fixtures/moderation.mjs';

const passcode = 'fictional-offline-only-passcode';
const dummy = { AI_CHAT_ENABLED: 'true', AI_CHAT_DISABLED: 'false', DEEPSEEK_TEST_ENABLED: 'true',
  OPENAI_API_KEY: 'mock-only', DEEPSEEK_API_KEY: 'mock-only', DEMO_PASSCODE: passcode,
  DEEPSEEK_TEST_PASSCODE: passcode };
const text = '爪爪陪你慢慢休息。';
const models = { chat: { output_text: text }, sandbox: { choices: [{ message: { content: text } }] } };
const handlers = { chat, sandbox };
const clean = () => moderation();
const flagged = key => ({ results: [verdict({ [key]: true })] });
const inconsistent = () => ({ results: [{ ...verdict({ 'self-harm': true }), flagged: false }] });
const missing = () => ({ results: [{ flagged: false, categories: {} }] });
async function run(route, { env = {}, responses = [], payload = { message: '今日想休息', history: [] }, auth = passcode } = {}) {
  const old = Object.fromEntries(Object.keys(dummy).map(key => [key, process.env[key]]));
  const oldFetch = globalThis.fetch;
  const calls = [];
  try {
    for (const [key, value] of Object.entries({ ...dummy, ...env })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    globalThis.fetch = async (url, options) => {
      calls.push({ url: String(url), body: JSON.parse(options.body) });
      const next = responses[calls.length - 1];
      if (next instanceof Error) throw next;
      if (next === undefined) throw new Error('Unexpected mocked request');
      return new Response(JSON.stringify(next), { status: 200 });
    };
    const response = await withMockQuota(handlers[route], new Request('https://example.test/api/mock', {
      method: 'POST', headers: { 'x-demo-passcode': auth, 'content-type': 'application/json' }, body: JSON.stringify(payload),
    }));
    return { status: response.status, data: await response.json(), calls, headers: response.headers };
  } finally {
    globalThis.fetch = oldFetch;
    for (const [key, value] of Object.entries(old)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}
function support(result) {
  assert.equal(result.status, 200); assert.equal(result.data.crisis, true);
  assert.match(result.data.reply, /2389 2222/); assert.match(result.data.reply, /2382 0000/);
  assert.match(result.data.reply, /999/); assert.match(result.data.reply, /唔會(?:偷偷聯絡第三方|暗中通知其他人)/);
}
function blocked(result, route, count) {
  assert.equal(result.status, route === 'chat' ? 502 : 503);
  assert.equal(result.data.reply, undefined); assert.equal(result.calls.length, count);
  assert.match(result.data.error, /2389 2222/); assert.match(result.data.error, /2382 0000/);
  assert.match(result.headers.get('cache-control'), /no-store/);
}
for (const route of ['chat', 'sandbox']) {
  const enable = route === 'chat' ? 'AI_CHAT_ENABLED' : 'DEEPSEEK_TEST_ENABLED';
  test(`${route}: missing, false and invalid enable flag blocks all upstream requests`, async () => {
    for (const value of [undefined, 'false', 'TRUE', '']) {
      const r = await run(route, { env: { [enable]: value } });
      assert.equal(r.status, 503); assert.equal(r.calls.length, 0);
    }
  });
  test(`${route}: kill switch takes precedence and missing/invalid kill setting fails closed`, async () => {
    for (const value of ['true', undefined, 'FALSE', '']) {
      const r = await run(route, { env: { AI_CHAT_DISABLED: value } });
      assert.equal(r.status, 503); assert.equal(r.calls.length, 0);
    }
  });
  test(`${route}: wrong passcode is rejected before upstream`, async () => {
    const r = await run(route, { auth: 'wrong' }); assert.equal(r.status, 401); assert.equal(r.calls.length, 0);
  });
  test(`${route}: malformed or incomplete input moderation blocks generation`, async () => {
    for (const value of [missing(), { results: [] }, { results: [null] }, { results: [{ categories: verdict().categories }] }, { results: [{ ...verdict(), categories: [] }] }])
      blocked(await run(route, { responses: [value] }), route, 1);
  });
  test(`${route}: contradictory input verdict blocks generation`, async () => {
    blocked(await run(route, { responses: [inconsistent()] }), route, 1);
  });
  test(`${route}: general flagged input gets non-crisis local reassurance without generation`, async () => {
    const r = await run(route, { responses: [flagged('harassment')] });
    assert.equal(r.status, 200); assert.equal(r.data.filtered, true); assert.equal(r.data.crisis, false);
    assert.match(r.data.reply, /陪你/); assert.equal(r.calls.length, 1);
  });
  test(`${route}: valid crisis moderation gives fixed hotline support without generation`, async () => {
    const r = await run(route, { responses: [flagged('self-harm/intent')] }); support(r); assert.equal(r.calls.length, 1);
  });
  test(`${route}: normal mocked pipeline returns only independently moderated output`, async () => {
    const r = await run(route, { responses: [clean(), models[route], clean()] });
    assert.equal(r.status, 200); assert.equal(r.data.reply, text); assert.equal(r.data.crisis, false);
    assert.deepEqual(r.calls.map(c => c.url.split('/').pop()), ['moderations', route === 'chat' ? 'responses' : 'completions', 'moderations']);
  });
  test(`${route}: malformed, contradictory or unavailable output moderation never returns model text`, async () => {
    for (const value of [missing(), inconsistent(), new Error('offline')])
      blocked(await run(route, { responses: [clean(), models[route], value] }), route, 3);
  });
  test(`${route}: general flagged output is replaced with reassurance`, async () => {
    const r = await run(route, { responses: [clean(), models[route], flagged('sexual')] });
    assert.equal(r.status, 200); assert.equal(r.data.filtered, true); assert.equal(r.data.crisis, false);
    assert.notEqual(r.data.reply, text); assert.equal(r.calls.length, 3);
  });
  test(`${route}: crisis flagged output is replaced with fixed support`, async () => {
    const r = await run(route, { responses: [clean(), models[route], flagged('violence')] });
    support(r); assert.notEqual(r.data.reply, text); assert.equal(r.calls.length, 3);
  });
}
test('chat: all twelve bounded history turns, current input and combined context are moderated', async () => {
  const history = Array.from({ length: 12 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `fictional-${i}-` + 'x'.repeat(880) }));
  const message = '今日想休息';
  const r = await run('chat', { payload: { message, history }, responses: [moderation(14), models.chat, clean()] });
  assert.equal(r.status, 200); assert.equal(r.calls.length, 3);
  const sent = r.calls[0].body.input;
  assert.deepEqual(sent.slice(0, 13), [...history.map(h => h.content), message]);
  assert.equal(sent[13], [...history, { role: 'user', content: message }].map(h => `${h.role}: ${h.content}`).join('\n'));
  assert.deepEqual(r.calls[1].body.input, [...history, { role: 'user', content: message }]);
  assert.equal(r.calls[1].body.store, false);
});
test('chat: a flagged historical turn or combined context blocks generation', async () => {
  const payload = { message: '今日想休息', history: [{ role: 'assistant', content: '虛構測試內容' }] };
  for (const index of [0, 2]) {
    const result = moderation(3); result.results[index] = verdict({ 'self-harm/intent': true });
    const r = await run('chat', { payload, responses: [result] }); support(r); assert.equal(r.calls.length, 1);
  }
});
test('chat: historical crisis keyword gives fixed support without provider requests', async () => {
  const r = await run('chat', { payload: { message: '今日想休息', history: [{ role: 'user', content: '虛構情境：我想死' }] } });
  support(r); assert.equal(r.calls.length, 0);
});
test('chat: missing or extra batch results block generation', async () => {
  const payload = { message: '今日想休息', history: [{ role: 'user', content: '虛構測試內容' }] };
  for (const count of [1, 2, 4]) blocked(await run('chat', { payload, responses: [moderation(count)] }), 'chat', 1);
});
test('shared schema rejects missing required keys, non-boolean values, and false/true contradictions', () => {
  const partial = verdict(); delete partial.categories['sexual/minors'];
  for (const result of [partial, verdict({ violence: 'false' }), { ...verdict(), flagged: true }, { ...verdict({ hate: true }), flagged: false }])
    assert.throws(() => moderationDecision({ results: [result] }), /invalid_moderation/);
});
test('shared schema allows additional boolean categories but filters if flagged', () => {
  assert.equal(moderationDecision({ results: [verdict({ future_category: false })] }), 'clear');
  assert.equal(moderationDecision({ results: [verdict({ future_category: true })] }), 'filtered');
});
test('sandbox: missing moderation credential refuses before upstream', async () => {
  const r = await run('sandbox', { env: { OPENAI_API_KEY: undefined } });
  assert.equal(r.status, 503); assert.equal(r.data.code, 'NOT_CONFIGURED'); assert.equal(r.calls.length, 0);
});
