// Generated from netlify/lib/crisis-triage.mjs. Do not edit by hand.
(()=>{
'use strict';
/**
 * MiraclePaw Phase 5E-5B-2 / Step 3 — OFFLINE CANDIDATE ONLY.
 * Baseline: ef913538ddafb6692f38af93497ae71879cb09c0.
 * Suggested location: netlify/lib/crisis-triage.mjs.
 * Deterministic routing aid, NOT a clinical assessment or a safety guarantee.
 * No network, storage, logging, credentials, or third-party notification.
 * NORMAL never means clinically safe: independent input/output moderation remains mandatory.
 * Do not use this module to release a previously blocked moderation verdict.
 * Integrated into candidate handlers only; no deployment approved.
 */
const TRIAGE = Object.freeze({
  NORMAL: 'NORMAL', CLARIFY: 'CLARIFY', SUPPORT: 'SUPPORT', URGENT: 'URGENT',
});
const { NORMAL, CLARIFY, SUPPORT, URGENT } = TRIAGE;
const HOTLINES = '香港撒瑪利亞會 2389 2222｜生命熱線 2382 0000';
const SAFETY = `你可以自己決定聯絡可信任嘅成年人或專業人士，亦可以自行致電 ${HOTLINES}。如果你或者其他人有即時危險，請打香港 999。星爪唔會暗中通知第三方。`;
const RESPONSES = Object.freeze({
  [CLARIFY]: `我喺度陪你，想了解清楚你嘅意思，唔使急住做任何任務。你係咪擔心自己或者其他人會受傷，或者有唔想活落去嘅念頭？你而家安全嗎？${SAFETY}`,
  [SUPPORT]: `聽到你可能好辛苦，爪爪仍然喺度陪你。今日唔需要做任何任務。如果擔心傷害其他人，可以先保持安全距離。你而家安全嗎？如果可以，搵個可信任嘅人陪住你。${SAFETY}`,
  [URGENT]: `爪爪喺度陪你。你或者其他人可能有即時危險，請先以安全為重。如果可以安全做到，遠離危險，搵附近可信任嘅人陪住你，並請即刻打香港 999 求助。${SAFETY}`,
});

// Retain both legacy handlers' trigger families, adding Cantonese variants.
const DIRECT = /自殺|自殘|自傷|想死|唔想活|不想活|唔想再活|唔想生存|結束生命|割(?:手|腕)|跳樓|傷害自己|傷害(?:人|別人|他人|其他人|同學|朋友)|殺(?:人|咗佢|死佢)|kill myself|end my life|want to die|suicid|self[ -]?harm|hurt myself|hurt someone|kill someone/iu;
const INDIRECT = /冇我.{0,16}(?:更好|開心|好啲)|冇我喺度|永遠.{0,12}(?:消失|瞓落去|唔再醒)|唔再醒|想消失|(?:講晒|講哂|講完).{0,8}再見|(?:係|成為).{0,12}負累|頂唔順|控制唔到自己|唔知自己會做乜|唔敢講出嚟|唔敢同人講/iu;
const IMMEDIATE = /(?:我|自己|佢|有人).{0,12}(?:而家唔安全|有即時危險|需要即刻幫忙|已經受傷)|(?:而家唔安全|有即時危險|需要即刻幫忙|已經受傷)|有人威脅.{0,12}(?:傷害|打|殺)|有人威脅.{0,12}(?:附近|身邊)|一陣.{0,12}(?:傷害|殺)|真係好危險/iu;
const CONTEXT = /(?:唔係|不是|並非|冇|沒有|無)(?:真係|再|任何)?(?:想死|想傷害自己|自傷念頭|自殺念頭|傷害自己念頭)|講笑|誇張啫|套戲.{0,12}角色|小說.{0,12}角色|虛構.{0,8}(?:情境|角色)|(?:以前|之前|過往).{0,18}(?:自傷|自殺|危機)|(?:而家|目前|依家).{0,12}(?:安全|冇.{0,8}念頭)/iu;
// Context is never a global allowlist. Match affirmative or conflicting clauses
// separately before considering a conservative clarification downgrade.
const AFFIRMATIVE = /(?:我|自己).{0,8}(?:真係|仍然|仲係|又|其實|已經|而家|依家|即刻).{0,8}(?:想死|唔想活|傷害自己|傷害人|自殺|自殘)|(?:但|不過|其實|反而).{0,10}(?:想死|唔想活|想傷害|要傷害)|又有念頭/iu;
const EXAGGERATION = /(?:誇張|講笑).{0,12}(?:冇|沒有)(?:傷害自己|自傷|自殺)念頭/u;
const PAST_ONLY = /(?:以前|之前|過往).{0,18}(?:自傷|自殺|危機)/u;
const CURRENT_DENIAL = /^(?:而家|依家|目前)(?:已經)?冇(?:[，。,。]|$)/u;
const THIRD_PARTY = /(?:朋友|同學|家人|同事).{0,8}(?:話|表示|想).{0,12}(?:想死|傷害自己|自傷|自殺)/u;
const OTHER_HARM = /傷害(?:人|別人|他人|其他人|同學|朋友)|殺人/u;
const NEARBY = /(?:佢|對方|嗰個人).{0,8}(?:附近|身邊)/u;
const SAFETY_CONFIRM = /(?:而家|依家|目前).{0,12}(?:安全|冇.{0,8}念頭)|(?:冇|沒有)(?:傷害自己|自傷|自殺)念頭/iu;
// Tailor local responses without allowing context to authorize generation.
const BURDEN = /負累|累贅/u;
const HARM_REQUEST = /(?:想知|想問|教我|話我知|點樣|點先|方法|如何|怎樣|how to).{0,24}(?:傷害自己|自殺|自殘|傷害人|傷害他人|傷害別人|kill myself|self[ -]?harm)/iu;
const FICTION = /(?:套戲|電影|小說|故事|劇集).{0,12}角色|虛構.{0,8}角色/u;
const NO_QUESTIONS = /唔好再問|唔好問|不要再問|唔想再答|唔想再講/u;
const EXPLICIT_DENIAL = /(?:冇|沒有|無)(?:任何)?(?:傷害自己|自傷|自殺)念頭/u;
const SPLIT = /[。！？!?；;\n\r]+|(?:但係|但|不過|然而)/u;
const RANK = Object.freeze({ [NORMAL]: 0, [CLARIFY]: 1, [SUPPORT]: 2, [URGENT]: 3 });
function higher(a, b) { return RANK[a] >= RANK[b] ? a : b; }
function normalize(text) {
  return text.normalize('NFKC').replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/gu, '').trim();
}
function classify(text) {
  const value = normalize(text);
  if (IMMEDIATE.test(value)) return URGENT;
  if (AFFIRMATIVE.test(value)) return SUPPORT;
  // An explicit denial cannot downgrade a later first-person direct signal in
  // the same message, even when both clauses share a comma rather than a stop.
  if (EXPLICIT_DENIAL.test(value)) {
    const afterDenial = value.replace(new RegExp(EXPLICIT_DENIAL.source, 'gu'), '');
    if (/(?:^|[，,；;])\s*(?:我|自己)(?:真係|其實|而家|依家)?\s*(?:想死|唔想活|想傷害自己|要傷害自己)/u.test(afterDenial)) return SUPPORT;
  }
  if (EXAGGERATION.test(value) && /想死/.test(value) && !DIRECT.test(value.replace(/想死/g, '').replace(/(?:冇|沒有)(?:傷害自己|自傷|自殺)念頭/g, ''))) return CLARIFY;
  if (PAST_ONLY.test(value) && SAFETY_CONFIRM.test(value) && !DIRECT.test(value)) return CLARIFY;
  let level = NORMAL;
  for (const clause of value.split(SPLIT)) {
    if (DIRECT.test(clause)) level = higher(level, CONTEXT.test(clause) ? CLARIFY : SUPPORT);
    else if (INDIRECT.test(clause)) level = higher(level, CLARIFY);
  }
  return level;
}
function result(state, reason, customReply = null) {
  return Object.freeze({
    state,
    reason, // fixed enumerated label; never user content
    blockGeneration: state !== NORMAL,
    crisis: state !== NORMAL,
    reply: customReply ?? (state === NORMAL ? null : RESPONSES[state]),
    independentModerationRequired: true,
  });
}

/**
 * Input routing for the existing chat (500 chars, up to 12 history turns of
 * 900 chars) or single-turn sandbox (caller must enforce its 300-char limit).
 * Invoke AFTER existing method/flags/auth/body validation. This function
 * grants no authorization and cannot override quota or moderation controls.
 * History is client-supplied and untrusted; no durable crisis state is claimed.
 * Assistant messages are not attributed to the user. Existing independent
 * moderation must still examine EVERY forwarded turn and combined context.
 */
function triageInput(message, history = []) {
  if (typeof message !== 'string' || !message.trim() || message.length > 500 ||
      !Array.isArray(history) || history.length > 12 || history.some(h =>
        !h || !['user', 'assistant'].includes(h.role) ||
        typeof h.content !== 'string' || h.content.length > 900)) {
    return result(CLARIFY, 'invalid_context');
  }
  const current = classify(message);
  if (current === URGENT) return result(URGENT, 'current_immediate_signal');
  if (current !== NORMAL && HARM_REQUEST.test(normalize(message))) return result(SUPPORT, 'harm_instruction_request', `我唔可以提供傷害自己或者其他人嘅方法，但我仍然喺度陪你。你而家安全嗎？先唔使做任何任務；如果可以，搵可信任嘅人陪住你。${SAFETY}`);
  if (current === SUPPORT) {
    if (THIRD_PARTY.test(message) && !AFFIRMATIVE.test(message)) return result(SUPPORT, 'possible_third_party', `如果你講緊朋友嘅情況，可以鼓勵佢搵可信任成年人陪伴；如果有即時危險，請打香港 999。你自己而家安全嗎？${SAFETY}`);
    return result(SUPPORT, 'current_direct_signal');
  }
  // Prior user concern remains relevant even if current message changes topic.
  // A safety affirmation prompts clarification/support, not automatic release.
  let previous = NORMAL;
  for (const turn of history) {
    if (turn.role === 'user') previous = higher(previous, classify(turn.content));
  }
  if (previous !== NORMAL) {
    const priorUsers = history.filter(h => h.role === 'user').map(h => normalize(h.content));
    if (NEARBY.test(message) && priorUsers.some(t => OTHER_HARM.test(t))) return result(URGENT, 'prior_threat_nearby');
    if (NO_QUESTIONS.test(normalize(message))) return result(higher(SUPPORT, previous), 'respect_no_questions', `我尊重你暫時唔想再答問題，爪爪仍然喺度陪你。未確認安全之前，我唔會用笑話或者任務帶過呢件事。唔使勉強自己講嘢；如果可以，搵可信任嘅人陪住你。${SAFETY}`);
    if (CURRENT_DENIAL.test(normalize(message)) && current === NORMAL && priorUsers.length > 0 && priorUsers.every(t => classify(t) === NORMAL || (PAST_ONLY.test(t) && classify(t) === CLARIFY))) return result(CLARIFY, 'historical_concern_clarified', `多謝你講清楚而家冇呢啲念頭。你而家安全嗎？如果安全，我哋可以慢慢傾返你想講嘅話題，例如功課或者日常生活，唔使一定要傾危機。${SAFETY}`);
    if (SAFETY_CONFIRM.test(normalize(message))) return result(CLARIFY, 'prior_concern_safety_confirmation', `多謝你講清楚而家嘅情況。如果你已經搵到可信任嘅人陪住，呢個係重要嘅安全措施。我會繼續陪你，唔使急住做任務。你仲需要其他支援嗎？${SAFETY}`);
    return result(higher(SUPPORT, previous), 'prior_concern_unresolved');
  }
  // Catch some signals divided across adjacent user turns without using
  // assistant replies as evidence of user intent. No cross-turn negation bypass.
  if (current === CLARIFY && BURDEN.test(normalize(message)) && !DIRECT.test(normalize(message))) return result(CLARIFY, 'burden_belief', `聽到你覺得自己係負累，呢種感受可能好難受。但有困難或者需要幫助，唔代表你係負累。你而家安全嗎？我仍然喺度陪你。${SAFETY}`);
  if (current === CLARIFY && FICTION.test(normalize(message))) return result(CLARIFY, 'fiction_context', `我聽到你可能講緊虛構角色嘅感受，唔會單憑引用就當成你自己嘅意圖。我哋可以傾角色嘅處境同感受；如果亦涉及你自己嘅安全，可以話我知。${SAFETY}`);
  // Do not acknowledge a denial as settled when the same message carries another
  // risk phrase. Context-specific wording is never a route to generation.
  const withoutDenial = normalize(message).replace(new RegExp(EXPLICIT_DENIAL.source, 'gu'), '');
  if (current === CLARIFY && EXPLICIT_DENIAL.test(normalize(message)) && !DIRECT.test(withoutDenial) && !INDIRECT.test(withoutDenial) && !IMMEDIATE.test(withoutDenial)) return result(CLARIFY, 'explicit_denial_acknowledged', `多謝你講清楚自己冇呢啲念頭。我尊重你嘅澄清，可以傾返你本來想講嘅日常事情，唔使勉強自己做任何任務。以下支援係可選嘅。${SAFETY}`);
  const joined = [...history.filter(h => h.role === 'user').map(h => normalize(h.content)), normalize(message)].join(' ');
  const compact = joined.replace(/\s+/gu, '');
  if (IMMEDIATE.test(joined) || IMMEDIATE.test(compact)) return result(URGENT, 'combined_immediate_signal');
  if (DIRECT.test(joined) || DIRECT.test(compact)) return result(current === CLARIFY ? CLARIFY : SUPPORT, 'combined_direct_signal');
  if (current === CLARIFY || INDIRECT.test(joined)) return result(CLARIFY, 'ambiguous_signal');
  return result(NORMAL, 'no_local_signal');
}

/** Output screening is deliberately stricter than user-context triage.
 * Never relax a risk phrase because the generated text claims to be quoting,
 * joking or negating it. Independently moderate all otherwise eligible output.
 * Invalid or oversized output is blocked; do not show it to a user.
 */
function triageOutput(text) {
  if (typeof text !== 'string' || !text.trim() || text.length > 1600) return result(CLARIFY, 'invalid_output');
  const value = normalize(text);
  if (IMMEDIATE.test(value)) return result(URGENT, 'output_immediate_signal');
  if (DIRECT.test(value) || DIRECT.test(value.replace(/\s+/gu, ''))) return result(SUPPORT, 'output_direct_signal');
  if (INDIRECT.test(value)) return result(CLARIFY, 'output_ambiguous_signal');
  return result(NORMAL, 'no_local_signal');
}

// Use the independent moderation decision as an additional mandatory gate.
// A NORMAL result alone never authorizes generation or display. The caller
// must validate provider schemas and preserve existing filtered/error paths.
function supportForModerationCrisis() { return result(SUPPORT, 'independent_moderation_crisis'); }

window.MiraclePawTriage=Object.freeze({triageInput,triageOutput,supportForModerationCrisis});
})();
