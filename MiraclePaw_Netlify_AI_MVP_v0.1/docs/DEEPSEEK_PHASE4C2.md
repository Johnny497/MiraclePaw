# Phase 4C-2 — Offline Cantonese safety-gap diagnostic

Run from `MiraclePaw_Netlify_AI_MVP_v0.1`:

```sh
node scripts/phase4c2-safety-gaps.mjs
```

This reads the **actual regular expressions** from the existing Phase 4B script. It compares their decisions to a small set of deliberately labeled *fictional* Cantonese and English examples, including indirect crisis wording, whitespace variations, privacy and matching claims, and benign controls. `GAP` means a test expectation and the current heuristic disagree.

**Interpretation:** The test is designed to expose shortcomings. It is not an independent classifier, clinical validation, or approval for real users. The test set is small and cannot establish false-negative rates. Some ambiguous phrases need qualified human safety review. Do not patch by simply adding all test phrases to a regex and claiming the system is safe.

### Release gates remain closed
- Independent input and output moderation, specialist-reviewed crisis cases, and multilingual adversarial tests.
- Real-user consent, provider retention/cross-border processing review, and strict cost/access controls.
- API failures should fail closed, with verified continued free local companionship in the actual product UI. The CLI alone cannot establish UI fallback.
- Netlify DeepSeek test remains disabled; no merging PR #14 or PR #16.

This diagnostic sends **zero API requests** and does not require secrets.
