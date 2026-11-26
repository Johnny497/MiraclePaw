# Phase 4C-3 — Experimental offline rule hardening

Phase 4C-2 diagnosed **8 missed blocks out of 11 deliberately chosen cases**. These are not population rates.

This change adds `scripts/phase4c3-heuristics.mjs` and `tests/phase4c3-heuristics.test.mjs`. It **does not connect the new rules to the live Phase 4B CLI or Netlify**, pending independent review. This is deliberate: extending keyword matching cannot make unreviewed mental-health content safe.

Run locally from project root:
```sh
node --test tests/phase4c3-heuristics.test.mjs
```
No DeepSeek API key or network request is needed. Expected: five offline test cases, including coverage of the eight earlier missed examples. Actual result must be confirmed by execution.

### Known limitations and gates
- `unreviewed` means no listed pattern matched; it **never means safe**.
- Ambiguous indirect language, negation, evasion, multilingual phrasing and unseen outputs may bypass rules; false positives also exist.
- Crisis replies and hotlines are not validated by this module. No real-user testing.
- Do not treat this regression as independent moderation or an acceptable replacement for it.
- Next steps: separate input/output moderation and Cantonese expert review; provider privacy/retention review; API spend and authentication controls; verify actual UI fallback.
- Keep `DEEPSEEK_TEST_ENABLED=false`; no merges of PR #14/#16 and no public AI.
