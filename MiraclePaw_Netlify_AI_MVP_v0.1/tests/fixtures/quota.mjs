// Test-only D1 response fixture. No production bypass or real credentials.
export const preview = 'https://deploy-preview-16--magenta-churros-99ffc3.netlify.app';
export const windowId = '00000000-0000-4000-8000-000000000001';
export const quotaEnv = Object.freeze({ CONTEXT: 'deploy-preview', AI_QUOTA_ENABLED: 'true',
  AI_QUOTA_PRICE_REVIEWED: 'phase5e3-v1', AI_QUOTA_D1_ACCOUNT_ID: '0'.repeat(32),
  AI_QUOTA_D1_DATABASE_ID: '00000000-0000-4000-8000-000000000002',
  AI_QUOTA_D1_TOKEN: 'fictional-quota-token-not-real', AI_QUOTA_WINDOW_ID: windowId });
export function quotaResult(admissions = 1, overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return { success: true, errors: [], result: [{ success: true, meta: { changes: 1 }, results: [{
    window_id: windowId, policy: 'phase5e3-v1', starts_at: now - 10, expires_at: now + 1500,
    admissions, reserved_hkd_cents: admissions * 100, ...overrides,
  }] }] };
}
export function setEnv(values) {
  const prior = Object.fromEntries(Object.keys(values).map(k => [k, process.env[k]]));
  for (const [k, v] of Object.entries(values)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  return () => { for (const [k, v] of Object.entries(prior)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } };
}
// Keep legacy assertions counting only model/moderation attempts. Quota wiring has its own tests.
export async function withMockQuota(handler, request) {
  const restore = setEnv(quotaEnv), mock = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (String(url).startsWith('https://api.cloudflare.com/client/v4/')) return Response.json(quotaResult());
    return mock(url, options);
  };
  try { return await handler(new Request(preview + new URL(request.url).pathname, request)); }
  finally { globalThis.fetch = mock; restore(); }
}
