import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { withMockQuota } from './fixtures/quota.mjs';
import handler from '../netlify/functions/chat.mjs';
import { verdict, moderation } from './fixtures/moderation.mjs';

const previousEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DEMO_PASSCODE: process.env.DEMO_PASSCODE,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  AI_CHAT_ENABLED: process.env.AI_CHAT_ENABLED,
  AI_CHAT_DISABLED: process.env.AI_CHAT_DISABLED,
};
const nativeFetch = globalThis.fetch;
const testCode = 'the-different-long-demo-password';

before(() => {
  process.env.AI_CHAT_ENABLED = 'true';
  process.env.AI_CHAT_DISABLED = 'false';
  globalThis.fetch = async () => { throw new Error('Unexpected external request'); };
  process.env.OPENAI_API_KEY = 'sk-test-not-real';
  process.env.DEMO_PASSCODE = testCode;
  process.env.OPENAI_MODEL = 'gpt-5.4-mini';
});
after(() => {
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  globalThis.fetch = nativeFetch;
});

function req(message, history = [], code = testCode) {
  return new Request('https://demo.example.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Demo-Passcode': code },
    body: JSON.stringify({ message, history }),
  });
}

test('rejects invalid or missing demo passcode', async () => {
  const response = await withMockQuota(handler, req('你好', [], 'wrong'));
  assert.equal(response.status, 401);
});

test('fails closed when not configured', async () => {
  delete process.env.OPENAI_API_KEY;
  const response = await withMockQuota(handler, req('你好'));
  assert.equal(response.status, 503);
  process.env.OPENAI_API_KEY = 'sk-test-not-real';
});

test('rejects oversized messages', async () => {
  const response = await withMockQuota(handler, req('測'.repeat(501)));
  assert.equal(response.status, 400);
});

test('Cantonese crisis phrase results in helplines without calling AI', async () => {
  globalThis.fetch = () => { throw new Error('Must not invoke external AI'); };
  const response = await withMockQuota(handler, req('我想自殺'));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.crisis, true);
  assert.match(body.reply, /2389 2222/);
  assert.match(body.reply, /2382 0000/);
});

test('normal input uses independent input/output moderation and stateless Responses API', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    if (String(url).endsWith('/moderations')) {
      const input = JSON.parse(init.body).input;
      return new Response(JSON.stringify(moderation(Array.isArray(input) ? input.length : 1)), { status: 200 });
    }
    return new Response(JSON.stringify({ output: [{ content: [{ type: 'output_text', text: '你好呀！我記得你叫阿明。🍀' }] }] }), { status: 200 });
  };
  const response = await withMockQuota(handler, req('你仲記唔記得我叫咩名？', [{ role: 'user', content: '我叫阿明' }, { role: 'assistant', content: '好呀阿明' }]));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.match(body.reply, /阿明/);
  assert.equal(body.crisis, false);
  assert.equal(calls.length, 3);
  assert.match(String(calls[0].url),/moderations$/);
  assert.match(String(calls[1].url),/responses$/);
  assert.match(String(calls[2].url),/moderations$/);
  assert.equal(calls[1].body.store, false);
  assert.equal(calls[1].body.model, 'gpt-5.4-mini');
  assert.equal(calls[1].body.input.length, 3);
  assert.deepEqual(calls[0].body.input.slice(0, 3), calls[1].body.input.map(turn => turn.content));
  assert.match(calls[0].body.input[3], /我叫阿明/);
});

test('moderation flags safety issues before response model call', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({ results: [verdict({ 'self-harm/intent': true })] }), { status: 200 });
  };
  const response = await withMockQuota(handler, req('我有啲危險嘅念頭'));
  assert.equal((await response.json()).crisis, true);
  assert.equal(calls, 1);
});

test('moderation outage fails closed', async () => {
  globalThis.fetch = async () => new Response('down', { status: 503 });
  const response = await withMockQuota(handler, req('今日天氣幾好'));
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /安全檢查/);
});
