import { ProviderFailure, isRecord, utf8Bytes } from './contracts.mjs';

const BRAND = Symbol('MiraclePaw offline mock transport');
const REQUEST_CAP = 32768;
const RESPONSE_CAP = 32768;
export function createOfflineMockTransport(handler) {
  if (typeof handler !== 'function') throw new ProviderFailure('MOCK_HANDLER_REQUIRED');
  return Object.freeze({ [BRAND]: true, post: handler });
}
export async function postMock(transport, request, timeoutMs) {
  if (transport?.[BRAND] !== true || typeof transport.post !== 'function') throw new ProviderFailure('OFFLINE_MOCK_REQUIRED');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000) throw new ProviderFailure('INVALID_DEADLINE');
  if (!isRecord(request) || utf8Bytes(JSON.stringify(request)) > REQUEST_CAP) throw new ProviderFailure('REQUEST_TOO_LARGE');
  let timer;
  try {
    const response = await Promise.race([
      Promise.resolve().then(() => transport.post(structuredClone(request))),
      new Promise((_,reject) => { timer=setTimeout(() => reject(new ProviderFailure('TRANSPORT_TIMEOUT')), timeoutMs); }),
    ]);
    if (!isRecord(response) || response.redirected === true || !Number.isInteger(response.status) ||
        utf8Bytes(JSON.stringify(response)) > RESPONSE_CAP) throw new ProviderFailure('INVALID_TRANSPORT_RESPONSE');
    return response;
  } catch (error) {
    if (error instanceof ProviderFailure) throw error;
    throw new ProviderFailure('TRANSPORT_FAILURE');
  } finally { clearTimeout(timer); }
}
