# Phase 5E-5C-3 security remediation and offline acceptance

Date: 2026-11-26 HKT. Reviewed finding: Issue #17 comment 7192553483. Source baseline: `cff44df24dc2f7b834abc1f365af2ca1073072a9`. Clean GitHub checkout tested at `48935ac2b3edd7809bd290ce2fccc5e03fcdeca5`. Tests use fictional fixtures and a checked-in network-deny preloader. No live provider, credential, database or deployed handler was used.

## Defect disposition

| Finding | Remediation | Offline status |
| --- | --- | --- |
| C2-01 remote layout | Moved four modules and test into `MiraclePaw_Netlify_AI_MVP_v0.1/`; clean checkout `npm test` discovers both candidate test files. | PASS |
| C2-02 quota contract | Added server-owned offline trusted config and quota adapter with exact `reserveQuota(route,requestUrl)` / synchronous `assertQuotaActive(lease,timeoutMs)` signatures, strict route/host/path, authorization callback and fictional price attestation. Lease shape and time margin checked. Existing quota/auth/flags remain unchanged and are not wired. | PASS for offline contract; real binding UNVERIFIED |
| C2-03 transport | Added branded offline-only mock transport, 5-second stage and transport deadlines, request/response byte caps, redirect rejection, exact fixture approval and fictional credential. No native network transport or real endpoint activation. | PASS for offline mock; production transport UNVERIFIED |
| C2-04 Azure verdict | SelfHarm/Violence severity takes priority over blocklist; blocklist entries are structurally checked; combined and malformed responses tested. Nonzero crisis severity remains conservative policy pending professional review. | PASS for routing test; clinical threshold UNVERIFIED |
| C2-05 trust/context | `run()` takes message/history only; system/route/URL captured in branded trusted config. JSON serialization makes role boundaries unambiguous. Complete context enforced at 8,000 Unicode code points and 24,000 UTF-8 bytes, with no moderation-only truncation. Direct generation requires context validation and lease guard. | PASS for offline checks; client-history trust R02 OPEN |
| C2-06 coverage | Added overbudget-through-orchestrator, combined findings, filtered paths, malformed/timeout/rejected mock, invalid/async lease, output crisis, actual adapter composition, Unicode/bytes and no-retry tests. | PASS 58/58 candidate tests |
| C2-07 evidence | Corrected historical acceptance limitation, updated interface docs, checked in network-deny preloader and this sanitized evidence. Raw logs and exit codes retained locally. | PASS |

## Clean GitHub checkout evidence

Repository branch: `dev/phase5e5c`; tested source commit: `48935ac2b3edd7809bd290ce2fccc5e03fcdeca5`.

From `MiraclePaw_Netlify_AI_MVP_v0.1/`:

```text
NODE_OPTIONS=--require=./tests/network-deny.cjs npm test
exit code: 0
tests: 300; pass: 300; fail: 0; skipped: 0

NODE_OPTIONS=--require=./tests/network-deny.cjs python3 tests/quota_sqlite_test.py
exit code: 0
Ran 9 tests; OK

node --test tests/phase5e5c2-provider-candidate.test.mjs
34/34 pass, exit 0
node --test tests/phase5e5c3-security.test.mjs
24/24 pass, exit 0
```

The two new test files contribute 58 tests to the full 300-test run; baseline app suite contributed 242. Full raw logs and machine-recorded exit codes are stored in the local handover directory, not in this public repository. This summary contains no credential values or user conversations.

## Remaining risks and decision

R01 broad route acceptance, R02 client-supplied history trust, R03 sticky support, R04 frontend parity, R05 full 120-case benchmark, and R06 provider eligibility/privacy/moderation/cost remain **OPEN**. The Qwen Hong Kong hostname and Azure endpoint format do not prove inference geography, supplier eligibility, terms, pricing or safety suitability. A provider tokenizer is unavailable offline; actual token usage is unverified. The checked-in network-deny preloader covers common Node socket/HTTP/fetch paths but is not a proof against every conceivable native extension or child process; no such paths are used by the candidate tests.

**GO:** Chat independent review of this offline branch. **NO-GO:** formal handler integration, real users, live AI, credentials, cloud database, Netlify deployment, main or PR #16 changes. This is not clinical safety certification.
