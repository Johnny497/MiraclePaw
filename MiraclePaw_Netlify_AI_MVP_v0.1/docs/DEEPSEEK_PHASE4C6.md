# Phase 4C-6 — Independent output moderation gate

Branch: `feature/deepseek-sandbox-v1-6`. Changes are **not merged or deployed to production**.

The existing OpenAI `/api/chat` function now calls `omni-moderation-latest` after generating a reply, in addition to existing input moderation. A missing/malformed output verdict or upstream error prevents the model reply from reaching the client. A flagged result yields the fixed support response. This is not a clinical or semantic safety guarantee.

Offline integration tests mock HTTP responses; no paid API calls:
```sh
node --test tests/phase4c6-server-moderation.test.mjs tests/phase4c5-ui-audit.test.mjs
```
Remaining blockers: no specialist Cantonese crisis evaluation, real provider moderation may miss nuanced coercion, no browser mock test, UI not wired to Phase 4C-4, independent output review of all applicable routes must be verified, real deploy kill-switch and cost limits unverified. Do not enable public AI, do not merge PR #14/#16.
