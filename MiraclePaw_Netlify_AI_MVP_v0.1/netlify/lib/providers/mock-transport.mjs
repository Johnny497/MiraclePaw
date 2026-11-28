import { ProviderFailure, isRecord, utf8Bytes, withDeadline } from './contracts.mjs';

const BRAND = Symbol('MiraclePaw offline mock transport');
const REQUEST_CAP = 32768;
const RESPONSE_CAP = 32768;
export function createOfflineMockTransport(handler) {
  if (typeof handler !== 'function') throw new ProviderFailure('MOCK_HANDLER_REQUIRED');
  return Object.freeze({ [BRAND]: true, post: handler });
}
export async function postMock(transport, request, timeoutMs, parentSignal) {
  if (transport?.[BRAND] !== true || typeof transport.post !== 'function') throw new ProviderFailure('OFFLINE_MOCK_REQUIRED');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000) throw new ProviderFailure('INVALID_DEADLINE');
  if (!isRecord(request) || utf8Bytes(JSON.stringify(request)) > REQUEST_CAP) throw new ProviderFailure('REQUEST_TOO_LARGE');
  try {
    const response = await withDeadline(async signal => {
      const received=await transport.post(structuredClone(request),{signal,maxResponseBytes:RESPONSE_CAP});
      if (received?.bodyChunks && typeof received.bodyChunks[Symbol.asyncIterator]==='function') {
        let bytes=0;const parts=[];
        for await (const chunk of received.bodyChunks) {
          if (signal.aborted) throw new ProviderFailure('STAGE_CANCELLED');
          if (!(typeof chunk==='string' || chunk instanceof Uint8Array)) throw new ProviderFailure('INVALID_TRANSPORT_RESPONSE');
          const part=typeof chunk==='string'?new TextEncoder().encode(chunk):chunk;
          bytes+=part.byteLength;
          if (bytes>RESPONSE_CAP) throw new ProviderFailure('INVALID_TRANSPORT_RESPONSE');
          parts.push(part);
        }
        const combined=new Uint8Array(bytes);let offset=0;
        for(const part of parts){combined.set(part,offset);offset+=part.byteLength;}
        return {...received,body:JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(combined)),bodyChunks:undefined};
      }
      return received;
    },timeoutMs,parentSignal);
    if (!isRecord(response) || response.redirected === true || !Number.isInteger(response.status) ||
        utf8Bytes(JSON.stringify(response)) > RESPONSE_CAP) throw new ProviderFailure('INVALID_TRANSPORT_RESPONSE');
    return response;
  } catch (error) {
    if (error?.code==='STAGE_TIMEOUT') throw new ProviderFailure('TRANSPORT_TIMEOUT');
    if (error instanceof ProviderFailure) throw error;
    throw new ProviderFailure('TRANSPORT_FAILURE');
  }
}
