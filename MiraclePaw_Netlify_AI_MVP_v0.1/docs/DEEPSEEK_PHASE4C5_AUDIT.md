# Phase 4C-5 — Source-level frontend/API audit (2026-11-24)

Scope: `public/app.js`, `public/index.html`, `netlify/functions/chat.mjs`, `netlify/functions/deepseek-test.mjs`, `netlify.toml` on `feature/deepseek-sandbox-v1-6`. **No browser run, deployed Netlify verification, or API call has been performed.**

## Findings
1. **Local-only companion is structurally separate.** The local entry handler clears the demo passcode, while pet, mood, steps, and local reassurance are browser-side. This is source evidence only, not proof of full offline operation.
2. **Fallback UI exists but is not integrated with Phase 4C-4.** `aiFallback` appears on caught fetch/HTTP errors and links to static scripts. A simulated `localCompanionAvailable` flag is not a real browser capability test.
3. **Critical: `/api/chat` has no independent model-output moderation.** It moderates the incoming message and uses crisis regex after the model response. The frontend displays a successful response. An independent output review gate must be implemented and tested before considering public AI.
4. **Critical: no guaranteed safe semantic response for indirect crisis language.** Browser/server keyword sets differ, and neither replaces specialist evaluation. The Phase 4C-3 module is not integrated.
5. **DeepSeek remains isolated.** No frontend link to `/api/deepseek-test` is present. DeepSeek route is disabled unless explicitly enabled and requires credentials; however, public preview URL access and spend controls still require separate review.
6. **OpenAI endpoint exists independently of DeepSeek.** `AI_CHAT_DISABLED` is the operator switch for `/api/chat`. Keeping only `DEEPSEEK_TEST_ENABLED=false` does NOT disable the OpenAI chat route. Verify Netlify Production/Preview contexts and actual behavior; do not assume environment state.
7. **Privacy caveat.** `history` is sent to `/api/chat` in API mode; the statement 'in memory only' refers to client-side persistence, not absence of transmission. Do not use real personal data.

## Offline checks
```sh
node --test tests/phase4c5-ui-audit.test.mjs
```
These tests are source-level assertions; even a complete pass does **not** certify deployed UI behavior or safety. Tests explicitly document known blockers rather than concealing them.

## Next release gates
- Confirm operator kill switches on actual deploy contexts; keep AI off.
- Implement independent input AND output review on server; fail closed on errors; specialist review of Cantonese crisis coverage.
- Run browser tests with mocked network (429, 503, timeout, malicious output) and verify pet/mood/steps remain functional.
- Validate provider data retention/consent, server logs, access control and hard spend caps.
- Do not merge PR #14/#16 or enable public AI.
