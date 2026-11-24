// Phase 4C-4: OFFLINE prototype for fail-closed decision handling.
// Never treats heuristic pass as independent safety approval.
import {checkInput,checkOutput} from './phase4c3-heuristics.mjs';
export const LOCAL_COMPANION='爪爪喺度陪你。AI 暫時未能提供經審查嘅回覆，但免費本地陪伴仍然可以使用。';
export const FIXED_CRISIS='爪爪仍然喺度陪你。如果你或者其他人有即時危險，請聯絡當地緊急服務；喺香港可致電 999。你可以自行聯絡香港撒瑪利亞會 2389 2222 或生命熱線 2382 0000。唔會暗中通知任何人。';
export function fallback(reason='unavailable'){
 return {kind:'local_fallback',text:LOCAL_COMPANION,reason,showModelText:false,localCompanionAvailable:true};
}
export async function evaluateSandboxTurn({message,requestModel,reviewInput,reviewOutput}){
 const first=checkInput(message);
 if(first.action==='fixed_crisis')return {kind:'fixed_crisis',text:FIXED_CRISIS,showModelText:false,localCompanionAvailable:true};
 if(first.action==='fixed_fallback')return fallback('sensitive_input');
 // Without BOTH independent reviews, never call the model.
 if(typeof reviewInput!=='function'||typeof reviewOutput!=='function')return fallback('review_unavailable');
 try{
   const inputReview=await reviewInput(message);
   if(inputReview!=='allow')return fallback('input_not_approved');
   const raw=await requestModel(message);
   const candidate=typeof raw==='string'?raw:raw?.reply;
   if(checkOutput(candidate).action!=='unreviewed')return fallback('output_rule_block');
   const outputReview=await reviewOutput(candidate);
   if(outputReview!=='allow')return fallback('output_not_approved');
   return {kind:'reviewed_model',text:candidate,showModelText:true,localCompanionAvailable:true};
 }catch{return fallback('upstream_or_review_failure');}
}
