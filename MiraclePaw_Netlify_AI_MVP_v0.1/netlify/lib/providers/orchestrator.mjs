import { triageInput, triageOutput, supportForModerationCrisis } from '../crisis-triage.mjs';
import { ProviderFailure, assertGenerationProvider, assertModerationProvider, codePoints } from './contracts.mjs';

export const CONTEXT_BUDGET_CODEPOINTS=8000;
export const LOCAL_FALLBACK='爪爪暫時未能安全回覆呢句，但我仍然喺度陪你。你可以轉用免費本地陪伴。';
const DISABLED='AI 對話未啟用；免費本地陪伴仍然可以使用。';
function boundedContext(system, history, message) {
  if (typeof system!=='string' || !system.trim() || typeof message!=='string' || !message.trim() ||
      !Array.isArray(history) || history.length>12 || history.some(x=>!x || !['user','assistant'].includes(x.role) || typeof x.content!=='string' || !x.content.trim())) throw new ProviderFailure('INVALID_CONTEXT');
  const messages=[{role:'system',content:system},...history.map(x=>({role:x.role,content:x.content})),{role:'user',content:message}];
  const transcript=messages.map(x=>`${x.role}: ${x.content}`).join('\n');
  if (codePoints(transcript)>CONTEXT_BUDGET_CODEPOINTS) throw new ProviderFailure('CONTEXT_BUDGET_EXCEEDED');
  return {messages,transcript};
}
// Exposed for exact-size offline tests; never truncates or edits moderation text.
export function buildCompleteContext(system,history,message) { return boundedContext(system,history,message); }

export function createOfflineCandidateOrchestrator({enabled=false,generation,moderation,reserve,assertActive}={}) {
  return Object.freeze({
    async run({system,history=[],message,route='chat'}={}) {
      if (enabled!==true) return {kind:'disabled',reply:DISABLED};
      try {
        assertGenerationProvider(generation);assertModerationProvider(moderation);
        if (typeof reserve!=='function' || typeof assertActive!=='function') throw new ProviderFailure('QUOTA_REQUIRED');
        const local=triageInput(message,history);
        if (local.blockGeneration) return {kind:'local_crisis',reply:local.reply,crisis:true};
        const context=boundedContext(system,history,message);
        const lease=await reserve(route); // One reservation before any provider transport.
        assertActive(lease);const input=await moderation.analyze(context.transcript);
        if (!['pass','crisis','filtered'].includes(input)) throw new ProviderFailure('INVALID_MODERATION_VERDICT');
        if (input==='crisis') return {kind:'local_crisis',reply:supportForModerationCrisis().reply,crisis:true};
        if (input==='filtered') return {kind:'filtered',reply:LOCAL_FALLBACK};
        assertActive(lease);const generated=await generation.generate(context.messages);
        if (typeof generated!=='string' || !generated.trim() || codePoints(generated)>1600) throw new ProviderFailure('INVALID_GENERATION_RESPONSE');
        const outputLocal=triageOutput(generated);
        if (outputLocal.blockGeneration) return {kind:'local_crisis',reply:outputLocal.reply,crisis:true};
        assertActive(lease);const output=await moderation.analyze(generated);
        if (!['pass','crisis','filtered'].includes(output)) throw new ProviderFailure('INVALID_MODERATION_VERDICT');
        if (output==='crisis') return {kind:'local_crisis',reply:supportForModerationCrisis().reply,crisis:true};
        if (output==='filtered') return {kind:'filtered',reply:LOCAL_FALLBACK};
        return {kind:'reply',reply:generated.trim(),crisis:false};
      } catch { return {kind:'unavailable',reply:LOCAL_FALLBACK}; }
    },
  });
}
