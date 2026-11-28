# DeepSeek presentation — verification record

2026-11-28 HKT. Tested a fresh GitHub-fetched detached worktree at **`1f1340399f890cfd25db08f9f9736640b5b63918`**. The subsequent evidence commit changes documentation only; production code and tests remain exactly those verified here.

## Results

| Check | Actual result | What it establishes |
|---|---|---|
| Pinned dependency install in fresh worktree | `npm ci --offline --ignore-scripts --no-audit --no-fund`, exit 0; 48 packages | Lockfile reproducible from the already downloaded package cache; no install scripts run |
| Complete Node regression, network-deny preloader | **373/373 PASS**, zero failures/skips, exit 0 | Existing regressions plus scoped DeepSeek/Blobs cases |
| Focused presentation tests, same preloader | **40/40 PASS**, exit 0; included in 373, not additional | Mock handler/transport, atomic quota and deploy-gate behavior |
| Existing SQLite quota regression | **9/9 PASS**, exit 0 | Unmodified original D1 semantics; not a real D1 service test |
| Local function bundling | esbuild 0.27.0, Node 24 target, ESM; exit 0, approximately 60.9 KB | Function and pinned Blobs dependency bundle locally; not a Netlify deployment |
| Bundled function Production smoke check | **503 `AI_DISABLED`**, network denied | Default/Production path stays closed after bundling |
| Offline harness negative control | Attempted global `fetch` immediately threw `OFFLINE_TEST_NETWORK_DENIED`; exit 1 expected | The test process could not make a real model request |
| Static changed-public-file pattern scan | Four changed public files, zero credential-like / `process.env` / fake-key sentinel matches | Provider key is not added to static client files; does not inspect an unknown live secret or deployed artifact |
| Git tree preservation | Original chat/sandbox functions, role prompt, `public/app.js`, GitHub workflow byte-identical to fixed Qwen presentation base | No original route/role/chat-client/workflow rewrite |
| GitHub save | Code trees checked against local Git tree IDs before ref updates | Saved remote source matches the source tested |

Node runtime: **v24.22.3**. Runtime dependency: exact **`@netlify/blobs@11.1.12`**, with a committed npm lockfile. Root source base: `38f5602ab76699281b9c1a850575bdeeff99662e`. Original safe branch remains `2620e065d0513849103489fb22de7daa6a003bd3`; main remains `a7d4e388704c099a92dd7e326fb73684e412c7ae` at the final read-only check.

Reproduce from `MiraclePaw_Netlify_AI_MVP_v0.1` after `npm ci --ignore-scripts`:

```sh
NODE_OPTIONS=--require=./tests/network-deny.cjs npm test
NODE_OPTIONS=--require=./tests/network-deny.cjs node --test tests/presentation-chat.test.mjs tests/presentation-quota.test.mjs
python3 tests/quota_sqlite_test.py
```

## Scoped cases covered

- DeepSeek request uses the exact direct endpoint and alias, explicit disabled thinking, no streaming, 420 maximum output tokens; no unsupported Qwen thinking parameter, no model retry, no redirect or provider fallback.
- Missing/invalid key configuration fails before quota; simulated provider 401/403/500/503 returns fixed fallback without exposing the body/key. Simulated 429 returns `AI_LIMIT`; timeout maps to 504 `AI_TIMEOUT`.
- Deadline covers stalled response bodies and transports that ignore cancellation. Request/response byte limits, output limits, malformed JSON, wrong provider metadata, truncated output, tool/refusal/reasoning output all fail closed.
- Twelve individual history messages preserve exact ordering/content and the original system prompt. A client-supplied system role or thirteenth history message is rejected. Every released reply fits the existing 900-unit next-turn history limit.
- Current and historical local input crisis, plus crisis-bearing model output, preserve the existing fixed local response. Local crisis makes zero model/quota calls. Existing free-local companion, mood, pet and other frontend regressions pass.
- Passcode/default-off checks, trusted runtime Preview metadata (including no runtime `CONTEXT` env), wrong-host/path/query and Production denial precede paid operations.
- Persistent-ledger mock proves sequential cap across independent handler instances, one winner among 25 simultaneous creates, one winner among 25 simultaneous updates using the same ETag, no reset by changing a window's bounds/cap, expired/future/invalid/overlong-window denial, ambiguous-write admission burn and storage-outage denial. The mock implements storage CAS semantics; this is not proof of the deployed Blobs backend.
- Build/ignore CLI exit codes require explicit branch Preview approval, block Production/branch deploys and never print an injected fake secret sentinel.

## Explicitly UNVERIFIED

**No real DeepSeek API call, paid model charge, cloud store creation, deployment, PR creation, credential operation or Netlify settings change was performed.** Natural Cantonese generation and actual memory recall have **not** been demonstrated with a real model. Mock fixture replies and payload history checks must not be described as a live conversation success.

The Netlify browser displayed its login page; no authenticated configuration was inspected. Owner-reported private Preview visibility, existing key/passcode values and scopes, actual signed-out Preview/Functions denial, branch-only secrets, existing-key validity/account entitlement/balance, Hong Kong account eligibility, deployed SDK credentials, persisted Blobs conditional writes, edge-rate-limit acceptance and actual billing remain unverified. The earlier code commit had no returned GitHub combined statuses; this is not deployment evidence.

Development pushes used `[skip netlify] [skip ci]`, with no PR. GitHub Actions is pull-request/manual triggered and unchanged. This branch also has a default-deny build/ignore guard. No claim is made that a Netlify audit log or unrelated project hooks were inspected.

The existing local crisis rules are not clinical safety certification. This remains an invited adult-founder, fictional-data demonstration. Setup, explicit approval boundaries, the full environment-variable table and the two-call live test are in [PRESENTATION_DEEPSEEK_DEMO.md](PRESENTATION_DEEPSEEK_DEMO.md).
