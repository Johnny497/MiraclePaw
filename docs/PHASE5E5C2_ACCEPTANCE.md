# MiraclePaw Phase 5E-5C-2 offline candidate acceptance

Date: 2026-11-26 (Hong Kong). Fixed baseline: `85e16b9a13b87f6692af7633c650367e0f52f6d2`. Existing crisis patch was not reapplied. Candidate files add only two documents, four provider modules and one offline test file. Existing handlers and existing source files are byte-for-byte unchanged against the local baseline copy.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Patch integrity | PASS | SHA256 `a8230053799a8083dd91e5fe87f52cb373bd1a0f3c831003c0239b254de7fb68`; `sha256.json` |
| Clean patch application | PASS | `git apply --check` exit 0; `git apply` exit 0; patched candidate tests 34/34; `patch-apply-verification.log` |
| Full Node.js suite with network-deny preload | PASS | Exit 0, 276/276; `node-raw.log`, `node-exit-code.txt` |
| SQLite quota suite | PASS | Exit 0, 9/9; `sqlite-raw.log`, `sqlite-exit-code.txt` |
| New provider/orchestrator tests | PASS | 34/34, included in Node suite |
| Candidate defaults closed | PASS | Disabled providers/orchestrator make no transport call in tests |
| No native network transport in candidate | PASS | Candidate adapters only call injected `transport.post`; test run preloaded network-deny |
| Existing handlers exercised with new provider | UNVERIFIED | Intentional: candidate is not wired into live handlers pending independent review and approval |
| Actual Qwen/Azure accounts, endpoint, model, regional and price eligibility | UNVERIFIED | No live calls or credential checks permitted |
| Clinical safety and 120-item benchmark | UNVERIFIED | This work is an offline engineering candidate, not clinical certification |

The first local test run had 33/34 due to an incorrect test expectation: existing local triage blocked an oversized emoji message before context budgeting. The test was corrected to verify the budget function directly, including the exact 8,000-code-point boundary. Final full and clean-apply runs passed. No production code was changed to accommodate the test.

## Safety properties and limits

Local triage precedes quota/provider calls; one quota reservation precedes provider calls; input and output moderation are independent; full context is budgeted to 8,000 Unicode code points and is never truncated solely for moderation. Invalid Qwen and Azure response shapes return fail-closed errors. The candidate has no retry, provider fallback or streaming path. The existing free local companionship, fixed Hong Kong support text and no-surprise third-party notification behavior are not changed.

R01–R06 remain open as listed in `PHASE5E5C2_ARCHITECTURE.md`. In particular, existing route acceptance, client history trust, sticky support, frontend parity, 120-item benchmark and provider eligibility are not resolved here.

GO: independent offline architecture and security review. NO-GO: live API calls, real-user testing, deployment, production integration or clinical safety claim. Approval is required before formal integration.
