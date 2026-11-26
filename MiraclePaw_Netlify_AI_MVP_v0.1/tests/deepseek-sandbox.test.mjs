import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../netlify/functions/deepseek-test.mjs', import.meta.url), 'utf8');

test('DeepSeek is gated, server-side only, and defaults off', () => {
  assert.match(source, /DEEPSEEK_TEST_ENABLED !== 'true'/);
  assert.match(source, /AI_CHAT_DISABLED !== 'false'/);
  assert.match(source, /DEEPSEEK_API_KEY/);
  assert.match(source, /DEEPSEEK_TEST_PASSCODE/);
  assert.match(source, /OPENAI_API_KEY/);
  assert.match(source, /\/api\/deepseek-test/);
  assert.match(source, /windowLimit: 3/);
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
});

test('disabled sandbox does not contact a provider', async () => {
  const prior = process.env.DEEPSEEK_TEST_ENABLED;
  process.env.DEEPSEEK_TEST_ENABLED = 'false';
  try {
    const { default: handler } = await import('../netlify/functions/deepseek-test.mjs');
    const result = await handler(new Request('https://example.test/api/deepseek-test', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'fictional test' })
    }));
    assert.equal(result.status, 503);
    assert.equal((await result.json()).code, 'SANDBOX_DISABLED');
  } finally {
    if (prior === undefined) delete process.env.DEEPSEEK_TEST_ENABLED;
    else process.env.DEEPSEEK_TEST_ENABLED = prior;
  }
});


test('model output must pass independent moderation before returning', () => {
  assert.match(source, /await moderate\(message, moderationKey, lease\)/);
  assert.match(source, /await moderate\(output, moderationKey, lease\)/);
  assert.match(source, /const safeFallback/);
  assert.match(source, /const localOutput = triageOutput\(output\)/);
  assert.match(source, /if \(localOutput\.blockGeneration\) return reply\(\{ reply: localOutput\.reply, crisis: true \}\)/);
  assert.match(source, /const outputDecision = await moderate\(output, moderationKey, lease\)/);
  assert.match(source, /if \(outputDecision === 'filtered'\)/);
  assert.match(source, /return moderationDecision\(response\)/);
});
