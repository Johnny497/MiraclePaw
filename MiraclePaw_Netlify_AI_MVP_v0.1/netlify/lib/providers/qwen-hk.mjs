import { ProviderFailure, requireEnabled, checkLease, validateCompleteMessages, codePoints, utf8Bytes } from './contracts.mjs';
import { postMock } from './mock-transport.mjs';
const INSTANCES=new WeakSet();
export const isQwenHongKongCandidate = value => value!==null && typeof value==='object' && INSTANCES.has(value);

// Chat Completions candidate only. No endpoint, model, key or native fetch default.
export function createQwenHongKongCandidate({ enabled = false, transport, endpoint, model, credential, assertLease, approval } = {}) {
  const provider=Object.freeze({
    async generate(messages, {lease,signal} = {}) {
      requireEnabled(enabled);
      if (approval?.mode !== 'offline-fixture' || approval.endpoint !== endpoint || approval.model !== model ||
          approval.account !== 'fictional' || approval.pricePolicy !== 'fictional-only') throw new ProviderFailure('PROVIDER_REVIEW_REQUIRED');
      checkLease(assertLease, lease, 5000);
      if (typeof endpoint !== 'string' || !/^https:\/\/[a-z0-9-]+\.cn-hongkong\.maas\.aliyuncs\.com\/compatible-mode\/v1\/chat\/completions$/u.test(endpoint)) throw new ProviderFailure('ENDPOINT_UNAPPROVED');
      if (typeof model !== 'string' || !/^qwen[a-z0-9.-]{0,70}$/u.test(model)) throw new ProviderFailure('MODEL_UNAPPROVED');
      if (credential !== 'fictional-only') throw new ProviderFailure('FICTIONAL_CREDENTIAL_REQUIRED');
      const context=validateCompleteMessages(messages);
      const response = await postMock(transport,{url:endpoint,headers:{authorization:`Bearer ${credential}`,'content-type':'application/json'},body:{model,messages:context,stream:false,n:1,max_tokens:420},redirect:'error'},5000,signal);
      if (response?.status !== 200) throw new ProviderFailure('PROVIDER_UNAVAILABLE');
      const body=response.body, choice=body?.choices?.[0], msg=choice?.message;
      if (body?.object !== 'chat.completion' || !Array.isArray(body.choices) || body.choices.length !== 1 ||
          choice.index !== 0 || choice.finish_reason !== 'stop' || msg?.role !== 'assistant' ||
          typeof msg.content !== 'string' || !msg.content.trim() || msg.content.length>1600 ||
          codePoints(msg.content) > 1600 || utf8Bytes(msg.content)>6400 ||
          msg.tool_calls != null || msg.function_call != null || msg.refusal != null) throw new ProviderFailure('INVALID_GENERATION_RESPONSE');
      return msg.content.trim();
    },
  });
  INSTANCES.add(provider);
  return provider;
}
