import { createHash, timingSafeEqual } from 'node:crypto';
import { triageInput, triageOutput, supportForModerationCrisis } from '../lib/crisis-triage.mjs';
import { moderationDecision } from '../lib/moderation.mjs';
import { reserveQuota, assertQuotaActive, QuotaDenied } from '../lib/quota.mjs';

// MiraclePaw internal adult-stakeholder demo only. Not a production youth mental-health service.
const HOTLINES = '撒瑪利亞會 2389 2222｜生命熱線 2382 0000';
const safeFallback = '爪爪暫時未能安全回覆呢句，但我仍然喺度陪你。你可以轉用免費本地陪伴。';
const MAX_BODY_BYTES = 30000;

// Intentionally non-retrying upstream calls. 429/timeout failures are reported
// without exposing OpenAI response bodies, credentials or account details.
class UpstreamFailure extends Error {
  constructor(kind) {
    super(kind);
    this.kind = kind;
  }
}

const INSTRUCTIONS = `你係「爪爪」，星爪 MiraclePaw 嘅溫柔虛擬寵物。目標對象係正在進行產品內部測試嘅成年人，並非已獲准讓未成年人自行使用嘅服務。
用自然、簡潔、口語嘅香港廣東話及繁體中文回應，通常兩至四句，約 30 至 90 字。先理解感受，再問一個唔催促嘅小問題；唔好一味追問。
若對方講咗名字或心情，使用本次對話上下文記住，但唔好假裝跨裝置或重開網頁仍能記得。你係 AI 虛擬寵物，唔係真人、社工、醫生或治療師；唔作診斷、唔保證醫療效果。
只可以自願邀請很小的行動，例如飲水、開窗、伸展、在白天安全的公共空間散步；用戶唔想出門，永遠唔懲罰、唔羞辱、唔扣分、唔收回陪伴；室內微步只是可選過渡。
未有真實 GPS、地圖安全審核、真人配對、真正寵物對寵物連線、家長模式或社工平台。若被問及，坦白講係未來構想或模擬，切勿聲稱已經提供。
避免過份依賴或排他式關係；鼓勵同可信任真人保持連結。唔提供危險行為指示。當出現自傷、傷人、嚴重即時安全風險，停止一般任務，溫和地保持支持並提供香港熱線（撒瑪利亞會 2389 2222；生命熱線 2382 0000），有即時危險可打 999，唔暗中通知第三方。`; 

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = createHash('sha256').update(a, 'utf8').digest();
  const right = createHash('sha256').update(b, 'utf8').digest();
  return timingSafeEqual(left, right);
}

async function openai(path, body, key, lease) {
  assertQuotaActive(lease, 20000);
  const serialized = JSON.stringify(body);
  if (Buffer.byteLength(serialized, 'utf8') > (path === 'moderations' ? 64000 : 36000)) throw new QuotaDenied();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`https://api.openai.com/v1/${path}`, {
      method: 'POST',
      redirect: 'error',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: serialized,
      signal: controller.signal,
    });
    if (!response.ok) {
      // Never forward upstream response bodies or secret/account identifiers.
      if (response.status === 429) throw new UpstreamFailure('LIMIT');
      throw new UpstreamFailure('UNAVAILABLE');
    }
    return await response.json();
  } catch (error) {
    if (error?.name === 'AbortError') throw new UpstreamFailure('TIMEOUT');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractText(response) {
  if (typeof response.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim();
  }
  const text = (response.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text' && typeof item.text === 'string')
    .map((item) => item.text)
    .join('\n')
    .trim();
  return text;
}

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: '只接受 POST 請求。' }, 405);

  // Default deny: both explicit flags are required. Missing or invalid values block AI.
  // The free kitten and scripted demonstrations remain available.
  if (process.env.AI_CHAT_DISABLED !== 'false' || process.env.AI_CHAT_ENABLED !== 'true') {
    return json({
      code: 'AI_DISABLED',
      error: `AI 對話暫時由管理員關閉。爪爪基本陪伴同五個免費固定劇本仍然可以使用。如有即時危險請打香港 999；亦可自行聯絡 ${HOTLINES}。`,
    }, 503);
  }

  const key = process.env.OPENAI_API_KEY;
  const passcode = process.env.DEMO_PASSCODE;
  if (!key || !passcode || passcode.length < 12) {
    return json({ error: '管理員尚未設定 API Key 或至少 12 位嘅試玩密碼。' }, 503);
  }

  // This is a private invite-code gate, NOT enterprise-grade authentication or rate limiting.
  if (!safeCompare(request.headers.get('x-demo-passcode'), passcode)) {
    return json({ error: '試玩密碼唔正確。' }, 401);
  }

  const lengthHeader = Number(request.headers.get('content-length') || 0);
  if (lengthHeader > MAX_BODY_BYTES) return json({ error: '內容太長，請開新對話。' }, 413);

  let payload;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json({ error: '內容太長，請開新對話。' }, 413);
    payload = JSON.parse(raw);
  } catch {
    return json({ error: '請求格式唔正確。' }, 400);
  }

  const message = payload?.message;
  const history = payload?.history;
  if (typeof message !== 'string' || !message.trim() || message.length > 500) {
    return json({ error: '請輸入 1 至 500 字。' }, 400);
  }
  if (!Array.isArray(history) || history.length > 12 || history.some((h) =>
    !h || !['user', 'assistant'].includes(h.role) ||
    typeof h.content !== 'string' || h.content.length > 900)) {
    return json({ error: '對話記錄格式唔正確。' }, 400);
  }

  const inputText = message.trim();
  const recent = history.map(({ role, content }) => ({ role, content }));
  const turns = [...recent, { role: 'user', content: inputText }];
  const transcript = turns.map(({ role, content }) => `${role}: ${content}`).join('\n');
  const localInput = triageInput(inputText, recent);
  if (localInput.blockGeneration) return json({ reply: localInput.reply, crisis: true });

  try {
    const lease = await reserveQuota('chat', request.url);
    // Review every forwarded turn and their combined context in one moderation request.
    // No truncation beyond the existing validated history/body limits.
    const moderationInput = recent.length ? [...turns.map(({ content }) => content), transcript] : inputText;
    const moderation = await openai('moderations', {
      model: 'omni-moderation-latest',
      input: moderationInput,
    }, key, lease);
    const decision = moderationDecision(moderation, Array.isArray(moderationInput) ? moderationInput.length : 1);
    if (decision === 'crisis') return json({ reply: supportForModerationCrisis().reply, crisis: true });
    if (decision === 'filtered') return json({ reply: safeFallback, crisis: false, filtered: true });

    const response = await openai('responses', {
      model: 'gpt-5.4-mini',
      instructions: INSTRUCTIONS,
      input: turns,
      max_output_tokens: 420,
      store: false,
    }, key, lease);
    const reply = extractText(response);
    if (!reply || reply.length > 1600) throw new Error('Invalid model response');
    // Conservative output keyword check; NOT a comprehensive or clinical safety test.
    const localOutput = triageOutput(reply);
    if (localOutput.blockGeneration) return json({ reply: localOutput.reply, crisis: true });
    // Phase 4C-6: independent output moderation. Fail closed on missing or malformed verdict.
    // This is a second API call, separate from the model generation request.
    const outputModeration = await openai('moderations', {
      model: 'omni-moderation-latest',
      input: reply,
    }, key, lease);
    const outputDecision = moderationDecision(outputModeration);
    if (outputDecision === 'crisis') return json({ reply: supportForModerationCrisis().reply, crisis: true });
    if (outputDecision === 'filtered') return json({ reply: safeFallback, crisis: false, filtered: true });
    return json({ reply: reply.slice(0, 1600), crisis: false });
  } catch (error) {
    // No raw user text, conversation history, API keys or upstream bodies in logs.
    const kind = error instanceof QuotaDenied ? 'LIMIT' : error instanceof UpstreamFailure ? error.kind : 'UNAVAILABLE';
    console.error('MiraclePaw AI upstream failure class:', kind);
    if (kind === 'LIMIT') {
      return json({ code: 'AI_LIMIT', error: 'AI 服務暫時達到使用限制。唔使重複傳送；你仍然可以開啟免費固定劇本，爪爪嘅基本陪伴唔會消失。' }, 503);
    }
    if (kind === 'TIMEOUT') {
      return json({ code: 'AI_TIMEOUT', error: 'AI 回應超時。今次訊息未能確認完成，請勿連續重試；可以先用固定劇本。' }, 504);
    }
    return json({ code: 'AI_UNAVAILABLE', error: `AI 暫時未能回覆，安全檢查或模型服務可能未就緒。你可以先用固定劇本。緊急支援：${HOTLINES}；有即時危險請打香港 999。` }, 502);
  }
}

// Native Netlify edge-enforced function rate limiting (NOT an in-memory counter).
// Netlify validates these rules at deploy post-processing. Inspect deploy logs;
// a green deployment alone does not prove a rate-limit rule was accepted.
// Limits apply to incoming requests (including invalid passcodes) and help
// protect the optional AI service without penalizing free static interactions.
export const config = {
  path: '/api/chat',
  rateLimit: {
    windowLimit: 6,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
