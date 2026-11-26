import { ProviderFailure, assertReady, codePoints } from './contracts.mjs';

// Chat Completions candidate only. No endpoint, model, key or native fetch default.
export function createQwenHongKongCandidate({ enabled = false, transport, endpoint, model, credential } = {}) {
  return Object.freeze({
    async generate(messages) {
      assertReady(enabled, transport);
      if (typeof endpoint !== 'string' || !/^https:\/\/[a-z0-9-]+\.cn-hongkong\.maas\.aliyuncs\.com\/compatible-mode\/v1\/chat\/completions$/u.test(endpoint)) throw new ProviderFailure('ENDPOINT_UNAPPROVED');
      if (typeof model !== 'string' || !/^qwen[a-z0-9.-]{0,70}$/u.test(model)) throw new ProviderFailure('MODEL_UNAPPROVED');
      if (typeof credential !== 'string' || !credential) throw new ProviderFailure('CREDENTIAL_REQUIRED');
      if (!Array.isArray(messages) || !messages.length || messages.some(m =>
        !m || !['system','user','assistant'].includes(m.role) || typeof m.content !== 'string' || !m.content.trim())) throw new ProviderFailure('INVALID_CONTEXT');
      const response = await transport.post({url:endpoint,headers:{authorization:`Bearer ${credential}`,'content-type':'application/json'},body:{model,messages,stream:false,n:1,max_tokens:420}});
      if (response?.status !== 200) throw new ProviderFailure('PROVIDER_UNAVAILABLE');
      const body=response.body, choice=body?.choices?.[0], msg=choice?.message;
      if (body?.object !== 'chat.completion' || !Array.isArray(body.choices) || body.choices.length !== 1 ||
          choice.index !== 0 || choice.finish_reason !== 'stop' || msg?.role !== 'assistant' ||
          typeof msg.content !== 'string' || !msg.content.trim() || codePoints(msg.content) > 1600 ||
          msg.tool_calls != null || msg.function_call != null || msg.refusal != null) throw new ProviderFailure('INVALID_GENERATION_RESPONSE');
      return msg.content.trim();
    },
  });
}
