# Step 4D independent offline acceptance — 2026-11-26 HKT

## PASS

- The revised candidate patch SHA256 is `3c9dd254b46ba3aa438d900716e43280d72627da040de67296a7d40981789d3e`. It applied cleanly to the supplied baseline ZIP; reverse and whitespace checks passed locally.
- Fresh full Node.js run on the clean patched tree: **242 tests, 242 pass, 0 fail, exit 0**.
- Fresh file-backed SQLite quota run: **9/9 pass, exit 0**.
- Supplied 40 fictional cases: **40/40 cases**, with **65/65 applicable handler checks** passed.
- Fourteen independently reconstructed counterexamples: **22/22 applicable handler checks** passed, including the previously failing contradictory-denial case.
- Transport-deny preload and fictional mocks were used. No real provider or cloud database request was made.

## FAIL

- None observed in this fresh offline run.

## UNVERIFIED

- The unavailable original test programs were replaced by a clearly labelled reconstructed harness; equivalence is unverified.
- The entire 120-case workbook was not executed or clinically scored.
- Real Netlify/runtime, cloud D1, provider costs/processing, privacy compliance, real-user safety and clinical efficacy are unverified.
- A passing rule-based routing check is **not** clinical safety certification.

## Deployment and release boundary

The handover branch must remain separate from `main` and PR #16. GitHub Actions' checked workflow triggers on pull requests and manual dispatch, not branch push. The owner-reported Netlify branch-deploy allowlist contains only `feature/mvp-demo-experience-v1.5`, and no build hooks were configured. External integrations outside these checked surfaces cannot be globally ruled out. No AI activation or Production change is approved by this handover.

Exact local raw logs and exit-code records were retained in the Work workspace; they are intentionally not posted to this public repository. Continue to use Issue #17 for sanitized handover updates.
