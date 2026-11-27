# Phase 5E-5C-4 combined offline hardening and frontend parity

Date: 2026-11-27 HKT. Audit source: Issue #17 comment 7212268896. Base commit: `75f5b38fbc68f85fac7ca1a650201d905ea3ef71`. Clean GitHub checkout tested at `2770a683588f70827f0f629f346558afddcbe050`. Candidate development branch only; no formal handler connection or deployment.

## Findings and changes

| Audit item | Offline result | Remaining boundary |
| --- | --- | --- |
| C3-01 cancellation and caps | `withDeadline` supplies AbortSignal to each stage; mock transport passes signal and response-byte limit to handler, aborts cooperating work on timeout/cancel, and caps async chunks before combining them. Tests cover timeout, parent cancel, oversized and valid chunks. | Arbitrary JavaScript callbacks can ignore AbortSignal; object responses are capped after materialization. Production transport and OS-wide network isolation are not established. |
| C3-02 lease | Intrinsic route/window/expiry checks at every stage; synchronous guard must return `undefined` or throw, never `false` or a Promise. Final lease check before releasing model text. Tests cover false, expired and final-release rejection. | Real quota binding is not connected; R01/R02 remain open. |
| C3-03 composition | Orchestrator accepts only Qwen/Azure candidate instances recorded by their factory-private WeakSets; plain no-op objects are rejected before reservation. The adapters still default disabled and accept only fictional fixtures and branded offline mock transport. | Caller-supplied mock callbacks and fixture attestations are cooperative conventions, not a production security boundary. |
| C3-04 immutable snapshot | Message and history are copied and frozen before the first `await`, then reused for local triage and complete input moderation. Mutation-during-authorization test confirms one snapshot. | Client history authenticity is still unverified (R02). |
| C3-05 combined crisis | Four Azure severity categories are validated first. A valid SelfHarm/Violence severity returns local crisis support even if blocklist metadata is malformed; malformed non-crisis blocklist remains fail-closed. | Nonzero severity policy is conservative engineering, not clinical certification. |
| C3-06 Unicode and request boundaries | Generation now rejects outputs exceeding the legacy 1,600 UTF-16 code-unit limit before local output triage; code-point and UTF-8 limits remain. Test covers supplementary characters and a valid high-byte context sent without truncation under the serialized transport cap. | Actual provider token count and real response-body streaming are unverified. |

## Frontend parity study and candidate fix

The previous browser quick check used a shorter regex and a separate fixed support reply. It could disagree with the existing server triage on negation, quotations and multi-turn concerns. The browser now loads `public/crisis-triage-browser.js`, generated mechanically from the unchanged `netlify/lib/crisis-triage.mjs` by `scripts/build-browser-triage.mjs`. A `--check` test rejects source drift. The main chat UI calls the same `triageInput(message, history)` before any API request and displays the exact server-fixed reply for blocked local routes. If the browser module is missing, the UI returns a fixed unavailable message without requesting AI. Offline tests compare 13 fictional scenarios, states, reasons and exact replies, plus UI no-request behavior for clarification and sticky concern. The server still independently checks requests; the browser grants no authorization.

R04 remains **OPEN** for other frontend surfaces and deployed browser behavior. R01 broad route acceptance, R02 client-history trust, R03 durable sticky support, R05 full 120-item benchmark and R06 supplier/region/privacy/cost also remain **OPEN**.

## Clean checkout evidence

From the checked-out app directory at `2770a683588f70827f0f629f346558afddcbe050`, with the in-repository network-deny preloader and the execution sandbox's default network restriction:

```text
NODE_OPTIONS=--require=./tests/network-deny.cjs npm test
exit 0; tests 332; pass 332; fail 0

NODE_OPTIONS=--require=./tests/network-deny.cjs python3 tests/quota_sqlite_test.py
exit 0; 9 tests; OK

NODE_OPTIONS=--require=./tests/network-deny.cjs node --test tests/phase5e5c4-hardening.test.mjs
exit 0; 16/16 pass

NODE_OPTIONS=--require=./tests/network-deny.cjs node --test tests/phase5e5c4-parity.test.mjs
exit 0; 14/14 pass
```

The new Phase 5E-5C-4 files add 30 tests, and two existing frontend tests were added, bringing the prior 300 to 332. A negative-control `fetch('https://example.invalid')` with the preloader threw `OFFLINE_TEST_NETWORK_DENIED` before any request. Raw logs and exit-code files are retained in the local handover directory, not published in this public repository.

**GO:** Chat independent integration review of the offline branch. **NO-GO:** live provider, real users, credentials, formal handler wiring, cloud database, deployment or production integration. These tests are not clinical safety certification.
