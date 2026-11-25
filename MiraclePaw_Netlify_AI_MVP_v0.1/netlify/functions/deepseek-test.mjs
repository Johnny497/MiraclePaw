// DeepSeek integration sandbox only. Not linked from UI, not approved for public AI use.
import { createHash, timingSafeEqual } from 'node:crypto';
import { moderationDecision } from '../lib/moderation.mjs';

const reply = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, private', 'x-content-type-options': 'nosniff' }
});
const equal = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
};
const crisis = /自殺|自殘|想死|唔想活|不想活|傷害自己|傷害別人|跳樓|kill myself|suicid|self[ -]?harm|hurt myself|kill someone/i;
const hotline = '撒瑪利亞會 2389 2222｜生命熱線 2382 0000';
const support = `爪爪仍然喺度陪你。你可以自行聯絡 ${hotline}；有即時危險請打香港 999。星爪唔會暗中通知其他人。`;
const safeFallback = '爪爪暫時未能安全回覆呢句，但我仍然喺度陪你。你可以轉用免費本地陪伴。';
async function moderate(text, key) {
  const response = await postJson('https://api.openai.com/v1/moderations',
    { model: 'omni-moderation-latest', input: text }, key);
  return moderationDecision(response);
}
async function postJson(url, payload, key, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { method: 'POST', signal: controller.signal,
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload) });
    if (!r.ok) throw new Error('upstream_failure');
    return await r.json();
  } finally { clearTimeout(timer); }
}
export default async function handler(request) {
  if (request.method !== 'POST') return reply({ error: 'POST only' }, 405);
  // Disabled by default, even if a key is configured. Never enable on Production.
  if (process.env.AI_CHAT_DISABLED !== 'false' || process.env.DEEPSEEK_TEST_ENABLED !== 'true')
    return reply({ code: 'SANDBOX_DISABLED', error: 'DeepSeek sandbox is disabled.' }, 503);
  const passcode = process.env.DEEPSEEK_TEST_PASSCODE;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const moderationKey = process.env.OPENAI_API_KEY;
  if (!passcode || passcode.length < 20 || !deepseekKey || !moderationKey)
    return reply({ code: 'NOT_CONFIGURED', error: 'Sandbox safety configuration incomplete.' }, 503);
  if (!equal(request.headers.get('x-demo-passcode'), passcode))
    return reply({ error: 'Unauthorized' }, 401);
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > 4096) return reply({ error: 'Request too large' }, 413);
  let data;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 4096) return reply({ error: 'Request too large' }, 413);
    data = JSON.parse(raw);
  } catch { return reply({ error: 'Invalid JSON' }, 400); }
  const message = data?.message;
  if (typeof message !== 'string' || !message.trim() || message.length > 300)
    return reply({ error: 'Invalid message' }, 400);
  if (crisis.test(message)) return reply({ reply: support, crisis: true });
  try {
    // Independent input moderation is mandatory. Fail closed if unavailable.
    const inputDecision = await moderate(message, moderationKey);
    if (inputDecision === 'crisis') return reply({ reply: support, crisis: true });
    if (inputDecision === 'filtered') return reply({ reply: safeFallback, crisis: false, filtered: true });
    const answer = await postJson('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-chat', stream: false, max_tokens: 250, temperature: 0.5,
      messages: [
        { role: 'system', content: 'You are 爪爪, a fictional virtual pet for adult internal tests using fictional data only. Respond in gentle Hong Kong Cantonese, traditional Chinese. Do not diagnose, pressure users to go outside, or claim to be a human. Never facilitate self-harm or violence. Never claim real-world matching or GPS. Keep responses short.' },
        { role: 'user', content: message }
      ]
    }, deepseekKey);
    const output = answer?.choices?.[0]?.message?.content;
    if (typeof output !== 'string' || !output.trim() || output.length > 1600) throw new Error('invalid_output');
    // Never display model text before independent output moderation succeeds.
    // The output check is an additional guardrail, not a clinical safety guarantee.
    if (crisis.test(output)) return reply({ reply: support, crisis: true });
    const outputDecision = await moderate(output, moderationKey);
    if (outputDecision === 'crisis') return reply({ reply: support, crisis: true });
    if (outputDecision === 'filtered') return reply({ reply: safeFallback, crisis: false, filtered: true });
    return reply({ reply: output, crisis: false, sandbox: true });
  } catch {
    // No secrets, user content or upstream response bodies in logs or response.
    return reply({ code: 'SANDBOX_UNAVAILABLE', error: `Sandbox unavailable; local companion remains free. 香港支援：${hotline}；有即時危險請打香港 999。` }, 503);
  }
}
export const config = {
  path: '/api/deepseek-test',
  rateLimit: { windowLimit: 3, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};
