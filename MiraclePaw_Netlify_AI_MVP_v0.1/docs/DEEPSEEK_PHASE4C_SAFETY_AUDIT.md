# Phase 4C — Safety audit gate (2026-11-24)

**Status: BLOCKED for real users, minors, or public AI.** Phase 4B's five successful fictional replies are functional evidence, not evidence of moderation quality.

## Verified source review
- `scripts/deepseek-phase4b-local-chat.mjs`: free-text fictional developer input; max 160 JS characters; up to five attempted API calls per process; timeout 12 s; in-memory conversation; output shown after simple regex checks.
- Local crisis/high-risk input filters are regular expressions, **not independent moderation**. They can miss paraphrases, spacing, multilingual expressions and indirect intent. Do not treat absence of a match as safety.
- Local output blocklist can miss coercive, privacy-violating, unsafe or manipulative replies. It can also block harmless discussion. Model outputs are unreviewed; there is no independent reviewer.
- Script says no history saved to disk **by this script**; terminal scrollback and provider-side processing are separate.
- `netlify/functions/deepseek-test.mjs`: disabled unless explicitly enabled, passcode-protected, and currently **requires an OpenAI moderation key** for both input and output. With DeepSeek key alone it must fail closed. This is different from the local Phase 4B script.
- Netlify rateLimit 3/60 per IP/domain is **not a global hard cost cap**. No independently verified account-level budget limit or private access control.

## Release-blocking checklist
| Gate | Evidence needed | Status |
|---|---|---|
| Independent input and output safety review | Separate service or validated human-controlled workflow with documented test metrics | BLOCKED |
| Crisis and self-harm evaluation | Expert-reviewed Cantonese multi-turn test corpus, false-negative analysis, fixed Hong Kong hotline behavior | BLOCKED |
| Privacy and consent | DeepSeek data handling, retention, cross-border processing and data-minimization review | BLOCKED |
| Authentication and cost | Strong access control, rate limits and provider-side hard spend controls, tested in deployment | BLOCKED |
| Adversarial and regression tests | Prompt injection, boundary persistence, privacy claims, mixed-language cases, failures | BLOCKED |
| Operational fallback | Test outage/timeout/revoked key with uninterrupted free local companionship | BLOCKED |
| Production deployment | Explicit signoff after all gates pass | NOT AUTHORIZED |

## Safe next test
Run `node --test tests/phase4c-audit.test.mjs` to verify the local prototype's **configuration and documented guard presence** without using an API key or sending data. This is a smoke test, not a content-safety pass.

No merge to main. Keep `DEEPSEEK_TEST_ENABLED=false`. Do not copy secrets into the repository or screenshots.
