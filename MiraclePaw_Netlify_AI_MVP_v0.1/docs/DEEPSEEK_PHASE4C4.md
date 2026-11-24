# Phase 4C-4 — Offline fail-closed simulation

**No API calls. No credentials. No changes to live Phase 4B or Netlify.**

New pure decision module `scripts/phase4c4-fallback.mjs` requires **two injected independent reviewer functions**. Without both, it refuses to call the model. It also handles recognized crisis patterns locally and suppresses model output on upstream errors, rejected reviews or heuristic output blocks.

Run:
```sh
node --test tests/phase4c4-fallback.test.mjs
```

Expected: seven test groups. This is an offline **simulation**. The injected reviewer functions in tests are stubs and do NOT establish moderation accuracy. No production reviewer has been connected. The `localCompanionAvailable` field is a proposed contract, **not proof that the existing frontend implements fallback**. Real UI, network and browser tests are outstanding.

Other release blockers remain: specialist-reviewed Cantonese crisis coverage; independent input/output moderation; real-user privacy and provider retention assessment; access controls; provider-side hard spend limit; deployment verification. Keep public AI disabled and do not merge PR #14/#16.
