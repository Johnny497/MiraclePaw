# MiraclePaw Phase 5E-5B-2 handover

Public, sanitized handover material for Chat and Work. This branch is for records only. Do not merge it into `main` or treat it as an AI activation request.

## Contents

- `revised-candidate.patch`: approved local candidate against PR #16 baseline `ef913538ddafb6692f38af93497ae71879cb09c0`; SHA256 `3c9dd254b46ba3aa438d900716e43280d72627da040de67296a7d40981789d3e`.
- `MiraclePaw_Cantonese_Safety_Benchmark_v1.0.xlsx`: supplied 120-case benchmark; the complete set has **not** been scored.
- `phase5e5b2_cases.json`: supplied 40 fictional crisis cases.
- `reconstructed-test-harness.mjs`: independently reconstructed test program. The two original test programs were unavailable; this is **not** a copy or equivalent certification.
- `network-deny.cjs`: local Node transport blocker for offline testing.
- `reconstructed-results.json` and `acceptance-summary.md`: sanitized outcomes and limitations.

## Reproduction boundary

The patch must be applied to a clean checkout of commit `ef913538ddafb6692f38af93497ae71879cb09c0`, not to this handover branch's source tree. The tested PR #16 commit after integration is `85e16b9a13b87f6692af7633c650367e0f52f6d2`.

Use only fictional credentials and a no-network environment. Run the full Node suite, local SQLite suite, and reconstructed harness from the patched checkout. See `acceptance-summary.md` for actual results, remaining limits, and the non-clinical interpretation.

## Safety

No real API keys, passcodes, personal data, real user conversations or raw unreviewed logs are included. Do not enable AI, provision cloud storage or deploy from these records. Read Issue #17 before continuing and append sanitized results after work.
