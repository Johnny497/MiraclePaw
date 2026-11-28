// Private test authorization only. No per-instance counters or automatic window creation.
// One admission reserves HK$1 for the complete pipeline, not a measured provider charge.
export const QUOTA_POLICY = 'phase5e3-v1';
const PREVIEW_HOST = 'deploy-preview-16--magenta-churros-99ffc3.netlify.app';
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const routeFlag = Object.freeze({ chat: 'AI_CHAT_ENABLED', sandbox: 'DEEPSEEK_TEST_ENABLED' });
const duration = Object.freeze({ chat: 65, sandbox: 41 });

// A single conditional write on one pre-provisioned row, shared by both routes.
// SQLite/D1 serializes conflicting writes; never SELECT then UPDATE.
export const RESERVE_SQL = `UPDATE ai_quota
SET admissions = admissions + 1, reserved_hkd_cents = reserved_hkd_cents + 100
WHERE singleton = 1 AND window_id = ?1 AND policy = 'phase5e3-v1'
  AND starts_at <= unixepoch('now') AND expires_at > unixepoch('now') + CAST(?2 AS INTEGER)
  AND expires_at > starts_at AND expires_at - starts_at <= 1800
  AND admissions BETWEEN 0 AND 19 AND reserved_hkd_cents = admissions * 100
  AND reserved_hkd_cents BETWEEN 0 AND 1900
RETURNING window_id, policy, starts_at, expires_at, admissions, reserved_hkd_cents`;

export class QuotaDenied extends Error {
  constructor() { super('quota_denied'); }
}
const deny = () => { throw new QuotaDenied(); };
function enabled(route) {
  return Object.hasOwn(routeFlag, route) && process.env.CONTEXT === 'deploy-preview' &&
    process.env.AI_CHAT_DISABLED === 'false' && process.env[routeFlag[route]] === 'true' &&
    process.env.AI_QUOTA_ENABLED === 'true' && process.env.AI_QUOTA_PRICE_REVIEWED === QUOTA_POLICY;
}

export async function reserveQuota(route, requestUrl) {
  try {
    if (!enabled(route)) deny();
    const u = new URL(requestUrl);
    if (u.protocol !== 'https:' || u.hostname !== PREVIEW_HOST || u.port || u.username || u.password) deny();
    if (route === 'chat' && process.env.OPENAI_MODEL !== undefined && process.env.OPENAI_MODEL !== 'gpt-5.4-mini') deny();
    const account = process.env.AI_QUOTA_D1_ACCOUNT_ID;
    const database = process.env.AI_QUOTA_D1_DATABASE_ID;
    const token = process.env.AI_QUOTA_D1_TOKEN;
    const windowId = process.env.AI_QUOTA_WINDOW_ID;
    if (!/^[a-f0-9]{32}$/.test(account || '') || !UUID.test(database || '') ||
        !UUID.test(windowId || '') || !token || token.length < 20 || token.length > 512 || /\s/.test(token)) deny();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`, {
        method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        // No message, history, IP, user ID, passcode or provider key is sent to the ledger.
        body: JSON.stringify({ sql: RESERVE_SQL, params: [windowId, String(duration[route])] }),
      });
      if (!response.ok) deny();
      const body = await response.json();
      const result = body?.result?.[0];
      if (body?.success !== true || !Array.isArray(body.errors) || body.errors.length !== 0 ||
          !Array.isArray(body.result) || body.result.length !== 1 || result?.success !== true ||
          result.meta?.changes !== 1 || !Array.isArray(result.results) || result.results.length !== 1) deny();
      const row = result.results[0];
      const now = Math.floor(Date.now() / 1000);
      if (row?.window_id !== windowId || row.policy !== QUOTA_POLICY ||
          !Number.isSafeInteger(row.starts_at) || !Number.isSafeInteger(row.expires_at) ||
          row.starts_at > now || row.expires_at - row.starts_at > 1800 ||
          row.expires_at <= now + duration[route] || !Number.isSafeInteger(row.admissions) ||
          row.admissions < 1 || row.admissions > 20 || row.reserved_hkd_cents !== row.admissions * 100) deny();
      return Object.freeze({ route, windowId, expiresAt: row.expires_at * 1000 });
    } finally { clearTimeout(timer); }
  } catch {
    // Ambiguous commit, outage, invalid response, expiry or exhaustion: never retry/refund.
    deny();
  }
}

export function assertQuotaActive(lease, timeoutMs) {
  if (!lease || !enabled(lease.route) || process.env.AI_QUOTA_WINDOW_ID !== lease.windowId ||
      !Number.isSafeInteger(lease.expiresAt) || Date.now() + timeoutMs + 1000 >= lease.expiresAt) deny();
}
