import { ProviderFailure, isRecord } from './contracts.mjs';

const TRUSTED = Symbol('server-owned offline config');
const QUOTA = Symbol('offline quota adapter');
const HOST = 'deploy-preview-16--magenta-churros-99ffc3.netlify.app';

// Built only by server-owned test setup. Request payloads cannot override these values.
export function createOfflineTrustedConfig({system,route,requestUrl,authorize,offlinePriceAttestation}={}) {
  if (typeof system!=='string' || !system.trim() || !['chat','sandbox'].includes(route) ||
      typeof requestUrl!=='string' || typeof authorize!=='function' ||
      offlinePriceAttestation!=='fictional-test-only') throw new ProviderFailure('TRUSTED_CONFIG_REQUIRED');
  let url;
  try { url=new URL(requestUrl); } catch { throw new ProviderFailure('TRUSTED_CONFIG_REQUIRED'); }
  if (url.protocol!=='https:' || url.hostname!==HOST || url.port || url.username || url.password ||
      url.pathname!==(route==='chat'?'/api/chat':'/api/deepseek-test') || url.search || url.hash) throw new ProviderFailure('TRUSTED_CONFIG_REQUIRED');
  return Object.freeze({[TRUSTED]:true,system,route,requestUrl,authorize,offlinePriceAttestation});
}
export const isOfflineTrustedConfig = value => value?.[TRUSTED]===true;

// Exact existing quota signatures: reserveQuota(route, requestUrl),
// assertQuotaActive(lease, timeoutMs). The injected implementations are mocks here.
export function createOfflineQuotaAdapter({reserveQuota,assertQuotaActive}={}) {
  if (typeof reserveQuota!=='function' || typeof assertQuotaActive!=='function') throw new ProviderFailure('QUOTA_REQUIRED');
  return Object.freeze({
    [QUOTA]:true,
    async reserve(route,requestUrl) {
      const lease=await reserveQuota(route,requestUrl);
      if (!isRecord(lease) || lease.route!==route || typeof lease.windowId!=='string' || !lease.windowId ||
          !Number.isSafeInteger(lease.expiresAt) || lease.expiresAt<=Date.now()+16000) throw new ProviderFailure('INVALID_LEASE');
      return Object.freeze({...lease});
    },
    assertActive(lease,timeoutMs) { return assertQuotaActive(lease,timeoutMs); },
  });
}
export const isOfflineQuotaAdapter = value => value?.[QUOTA]===true;
