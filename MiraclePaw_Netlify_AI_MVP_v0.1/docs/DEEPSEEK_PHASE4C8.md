# Phase 4C-8 — Browser integration wiring audit

Scope: static source wiring assertions plus the earlier Phase 4C-7 fallback unit tests. This is **not** a real browser end-to-end test and **not** a safety certification.

Run from `MiraclePaw_Netlify_AI_MVP_v0.1`:

```sh
node --test tests/phase4c7-browser-fallback.test.mjs tests/phase4c8-wiring.test.mjs
```

Checks: fallback script loads before controller; chat uses /api/chat not DeepSeek sandbox; error path uses local fallback without automatic retry; local companion does not require the API; model output uses textContent; DeepSeek test route remains separate.

Remaining blockers before any public AI: execute a genuine browser test on desktop and mobile with mocked 429/503/network/malformed responses; verify no retry in network inspector; audit server moderation and rate limits, provider data handling, privacy, global spend limits and incident procedures. A valid HTTP 200 is not independent proof of safe output. Keep PR #14 and PR #16 unmerged and `DEEPSEEK_TEST_ENABLED=false`.
