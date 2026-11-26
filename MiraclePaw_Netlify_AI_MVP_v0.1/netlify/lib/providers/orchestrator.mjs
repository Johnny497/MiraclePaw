import { triageInput, triageOutput, supportForModerationCrisis } from '../crisis-triage.mjs';
import { ProviderFailure, requireProvider, checkLease, validateCompleteMessages, codePoints, utf8Bytes } from './contracts.mjs';
import { isOfflineQuotaAdapter, isOfflineTrustedConfig } from './offline-runtime.mjs';

export const CONTEXT_BUDGET_CODEPOINTS=8000;
export const LOCAL_FALLBACK='爪爪暫時未能安全回覆呢句，但我仍然喺度陪你。你可以轉用免費本地陪伴。';
const DISABLED='AI 對話未啟用；免費本地陪伴仍然可以使用。';
function boundedContext(system, history, message) {
  if (typeof system!=='string' || !system.trim() || typeof message!=='string' || !message.trim() ||
      !Array.isArray(history) || history.length>12 || history.some(x=>!x || !['user','assistant'].includes(x.role) || typeof x.content!=='string' || !x.content.trim())) throw new ProviderFailure('INVALID_CONTEXT');
  const messages=validateCompleteMessages([{role:'system',content:system},...history.map(x=>({role:x.role,content:x.content})),{role:'user',content:message}]);
  // JSON keeps role boundaries unambiguous even if user text contains role-like strings.
  const transcript=JSON.stringify(messages);
  if (codePoints(transcript)>CONTEXT_BUDGET_CODEPOINTS || utf8Bytes(transcript)>24000) throw new ProviderFailure('CONTEXT_BUDGET_EXCEEDED');
  return {messages,transcript};
}
// Exposed for exact-size offline tests; never truncates or edits moderation text.
export function buildCompleteContext(system,history,message) { return boundedContext(system,history,message); }

export function createOfflineCandidateOrchestrator({enabled=false,generation,moderation,quota,trusted}={}) {
  // Trusted values are captured once at construction; run() accepts message/history only.
  const config=trusted;
  return Object.freeze({
    async run({history=[],message}={}) {
      if (enabled!==true) return {kind:'disabled',reply:DISABLED};
      try {
        requireProvider(generation,'generate');requireProvider(moderation,'analyze');
        if (!isOfflineQuotaAdapter(quota)) throw new ProviderFailure('QUOTA_REQUIRED');
        if (!isOfflineTrustedConfig(config)) throw new ProviderFailure('TRUSTED_CONFIG_REQUIRED');
        if (await config.authorize() !== true) throw new ProviderFailure('AUTH_DENIED');
        const local=triageInput(message,history);
        if (local.blockGeneration) return {kind:'local_crisis',reply:local.reply,crisis:true};
        const context=boundedContext(config.system,history,message);
        const lease=await quota.reserve(config.route,config.requestUrl); // Exact existing reserveQuota signature.
        checkLease(quota.assertActive,lease,5000);const input=await moderation.analyze(context.transcript,{lease});
        if (!['pass','crisis','filtered'].includes(input)) throw new ProviderFailure('INVALID_MODERATION_VERDICT');
        if (input==='crisis') return {kind:'local_crisis',reply:supportForModerationCrisis().reply,crisis:true};
        if (input==='filtered') return {kind:'filtered',reply:LOCAL_FALLBACK};
        checkLease(quota.assertActive,lease,5000);const generated=await generation.generate(context.messages,{lease});
        if (typeof generated!=='string' || !generated.trim() || codePoints(generated)>1600 || utf8Bytes(generated)>6400) throw new ProviderFailure('INVALID_GENERATION_RESPONSE');
        const outputLocal=triageOutput(generated);
        if (outputLocal.blockGeneration) return {kind:'local_crisis',reply:outputLocal.reply,crisis:true};
        checkLease(quota.assertActive,lease,5000);const output=await moderation.analyze(generated,{lease});
        if (!['pass','crisis','filtered'].includes(output)) throw new ProviderFailure('INVALID_MODERATION_VERDICT');
        if (output==='crisis') return {kind:'local_crisis',reply:supportForModerationCrisis().reply,crisis:true};
        if (output==='filtered') return {kind:'filtered',reply:LOCAL_FALLBACK};
        return {kind:'reply',reply:generated.trim(),crisis:false};
      } catch { return {kind:'unavailable',reply:LOCAL_FALLBACK}; }
    },
  });
}
