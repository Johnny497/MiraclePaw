// Offline-only candidate contracts. There is deliberately no production transport.
export class ProviderFailure extends Error {
  constructor(code = 'PROVIDER_UNAVAILABLE') { super(code); this.name = 'ProviderFailure'; this.code = code; }
}
export const codePoints = value => [...value].length;
export const utf8Bytes = value => new TextEncoder().encode(value).length;
export const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function requireEnabled(enabled) {
  if (enabled !== true) throw new ProviderFailure('CANDIDATE_DISABLED');
}
export function checkLease(assertLease, lease, timeoutMs) {
  if (typeof assertLease !== 'function') throw new ProviderFailure('LEASE_GUARD_REQUIRED');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000) throw new ProviderFailure('INVALID_DEADLINE');
  const result = assertLease(lease, timeoutMs);
  if (result && typeof result.then === 'function') {
    Promise.resolve(result).catch(() => {}); // Drain rejected async guards; never treat them as valid.
    throw new ProviderFailure('ASYNC_LEASE_GUARD_FORBIDDEN');
  }
}
export function requireProvider(provider, method) {
  if (!provider || typeof provider[method] !== 'function') throw new ProviderFailure('PROVIDER_REQUIRED');
}
export function freezeMessages(messages) {
  if (!Array.isArray(messages) || !messages.length || messages.some(m =>
    !isRecord(m) || !['system','user','assistant'].includes(m.role) || typeof m.content !== 'string' || !m.content.trim())) throw new ProviderFailure('INVALID_CONTEXT');
  return Object.freeze(messages.map(m => Object.freeze({role:m.role,content:m.content})));
}
export function validateCompleteMessages(messages) {
  const checked = freezeMessages(messages);
  if (checked[0].role !== 'system' || checked.at(-1).role !== 'user' ||
      checked.slice(1,-1).length > 12 || checked.slice(1,-1).some(x=>x.role==='system') ||
      codePoints(JSON.stringify(checked)) > 8000 ||
      utf8Bytes(JSON.stringify(checked)) > 24000) throw new ProviderFailure('CONTEXT_BUDGET_EXCEEDED');
  return checked;
}
export async function withDeadline(operation, timeoutMs) {
  if (typeof operation!=='function' || !Number.isSafeInteger(timeoutMs) || timeoutMs<1 || timeoutMs>5000) throw new ProviderFailure('INVALID_DEADLINE');
  let timer;
  try { return await Promise.race([
    Promise.resolve().then(operation),
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(new ProviderFailure('STAGE_TIMEOUT')),timeoutMs);}),
  ]); } finally { clearTimeout(timer); }
}
