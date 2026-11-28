# MiraclePaw — private DeepSeek Flash presentation

Prepared 2026-11-28 HKT. This is the current guide for `presentation/deepseek-flash-demo`, based on Qwen presentation commit `38f5602ab76699281b9c1a850575bdeeff99662e`. `PRESENTATION_QWEN_DEMO.md` describes the historical Qwen branch; do not use its Qwen credentials, D1 prerequisites or Functions-only requirement for this branch.

Code is implemented and saved to GitHub. **No deployment or real model call has been performed.** Only invited adult founders, using wholly fictional information, are in scope. All AI gates default to closed. There is no Qwen/Azure call on this presentation path. Original `/api/chat`, `/api/deepseek-test`, PR #16 and `dev/phase5e5c` are unchanged.

## Implemented behavior

The existing pet, mood features, chat interface, free local companion and exact Paw Paw system prompt are retained. The browser sends the newest 12 prior messages (12 individual user/assistant messages, not 12 pairs) plus the current message to `/api/presentation-chat`. The server independently validates history and performs the existing local input/output crisis triage. Fixed Hong Kong support text is unchanged. Local crisis replies do not call DeepSeek or use quota; browser crisis support and the free local companion remain available after the AI cap. No conversation database or raw conversation logging is added.

One admitted message produces at most one `POST https://api.deepseek.com/chat/completions`, with `model: "deepseek-flash"`, `thinking: {type: "disabled"}`, `stream: false`, `max_tokens: 420`. There is no automatic model retry or provider fallback. Config overrides may only equal the approved URL/model. `deepseek-chat` is rejected. The official current version is DeepSeek-V4.1-Flash-1017; accepted response model names are the request alias and that version ID in lowercase. Unexpected model identifiers fail closed.

Bounds: 500 JavaScript string units/current message, 900/history message, 12 history entries, complete context 8,000 Unicode code points / 24,000 UTF-8 bytes, 30,000-byte incoming and provider requests, 32,768-byte provider response, maximum 900 JavaScript string units of released reply (so every reply fits the next turn’s existing history bound), 18-second model deadline, four-second quota deadline, three-second input-body deadline. The provider deadline includes response-body stalls. Oversized, malformed, redirected, tool-call, reasoning-bearing and truncated responses are withheld. Errors are fixed text; upstream bodies and credentials are never returned. The function proposes three requests/60 seconds per IP/domain at Netlify's edge; actual acceptance remains a deploy-log check.

Netlify's trusted second handler argument `context.deploy.context` supplies the Preview context. No manually defined runtime `CONTEXT` variable is needed or trusted. An environment string or client header cannot turn Production into a Preview. The request must use the exact allowlisted `deploy-preview-N--magenta-churros-99ffc3.netlify.app` alias and route, without query, alternate host, port or path.

## Minimal persistent quota, without D1

Only this presentation handler now uses the official pinned `@netlify/blobs@11.1.12` client. Existing D1 code/tests are untouched. The SDK uses Netlify-provided server runtime credentials; **no Cloudflare account, database, token or D1 window is required** for this route. No Blobs store or cloud resource was created during development.

A site-wide store `miraclepaw-deepseek-demo-quota-v1` holds one aggregate record per owner-chosen window UUID. It persists across deploys and cold starts. Reads require strong consistency. First admission uses `onlyIfNew: true`; later admissions use the read ETag in `onlyIfMatch`. A conflicting caller is denied without an application-level retry. The record includes only policy, window ID, start/end, maximum request count, admissions and HKD-cent accounting reservations. No text, name, IP, passcode or provider key is stored.

The window must be explicitly configured, at most 30 minutes, with a maximum from 1 to 20. The first authorized, admitted request conditionally creates the record; there is no scheduled reset or rolling window. Reusing an ID with changed dates/cap cannot reset it. Upstream failures and ambiguous storage receipts burn an admission. Storage outage, missing runtime credentials, stale/malformed metadata, exhausted count, expiry or a CAS conflict prevents the model call. The SDK may retry storage transport internally; conditional writes remain idempotent and a missing/ambiguous receipt never permits a model request. A storage operation completing after the four-second deadline may consume an admission but cannot trigger generation.

Blobs account entitlement, conditional writes on the deployed service and actual hosting/storage charges are UNVERIFIED until the separately approved private deploy. Do not remove the ledger if unavailable. The smallest fallback is the already present D1 design with an owner-provisioned database/window, requiring a separately reviewed wiring change; this branch does not silently fall back to an in-memory counter.

## Environment variables — exact branch only

Use Netlify **Project configuration → Environment variables**, selecting the exact source branch `presentation/deepseek-flash-demo`, including its Deploy Previews. Never apply an enabled value or secret to all contexts or all Deploy Previews. Existing status below is owner-reported, not independently inspected: the current browser requires Netlify login. Keep secret values in Netlify; do not send them to Chat, GitHub, a screenshot, a public log, or a front-end-prefixed variable.

| Category | Variable | Required value / action |
|---|---|---|
| Existing; verify scope | `DEEPSEEK_API_KEY` | Reuse its existing value privately if valid and limited to this source branch; key format checks cannot prove validity. Never read it into chat. |
| Existing; retain value, verify scope | `DEMO_PASSCODE` | At least 12 characters, branch only. Retain the current value if it meets this requirement. |
| Existing; modify branch override only after paid-test approval | `AI_CHAT_DISABLED` | `true` during setup; `false` only for the approved window. Production and other branches stay disabled. |
| New | `PRESENTATION_DEPLOY_APPROVED` | `false`/absent initially. `true` permits an explicitly approved Deploy Preview build for this source branch; it does not enable AI. |
| New or verify if inherited from Qwen demo | `PRESENTATION_AI_ENABLED` | `false` during setup; `true` only after paid-test approval. |
| New or verify if inherited | `PRESENTATION_PREVIEW_HOST` | Exact resulting Preview hostname, without `https://` or a path. The real PR number is not known yet; do not enter the example `99`. |
| New or verify if inherited | `AI_QUOTA_ENABLED` | `true` in the selected branch once the Blobs setup is approved. Missing/false means no model call. |
| New | `PRESENTATION_DEEPSEEK_PRICE_REVIEWED` | `deepseek-flash-20261128`, only after reviewing current direct-DeepSeek rates/account. |
| New or verify if inherited | `PRESENTATION_LOCAL_SAFETY_ACCEPTED` | `true` only for this adult-fictional demo with existing local triage. Not a clinical safety certification. |
| New | `PRESENTATION_QUOTA_WINDOW_ID` | A fresh UUID for the approved window; never change an active window merely to bypass its count. |
| New | `PRESENTATION_QUOTA_START` | UTC Unix epoch **milliseconds**, integer string, approved window start. |
| New | `PRESENTATION_QUOTA_END` | UTC Unix epoch **milliseconds**, integer string, at most 1,800,000 ms after start. |
| New | `PRESENTATION_QUOTA_MAX_REQUESTS` | Start with `2` for the proposed greeting + memory smoke test; hard maximum `20`. |
| Optional; fixed defaults if absent | `DEEPSEEK_BASE_URL` | `https://api.deepseek.com`; other values reject generation. |
| Optional; fixed defaults if absent | `DEEPSEEK_MODEL` | `deepseek-flash`; other values reject generation. |
| Keep legacy routes off | `AI_CHAT_ENABLED`, `DEEPSEEK_TEST_ENABLED` | Must remain `false`/absent on this branch. If inherited enabled, override to `false` on this branch only before changing the shared kill switch. |
| Do not modify | `QWEN_*`, Azure/OpenAI credentials and model settings, `AI_QUOTA_D1_*`, `AI_QUOTA_WINDOW_ID`, `AI_QUOTA_PRICE_REVIEWED` | Unused by the presentation route. Do not copy/change them for this work. |
| Do not define manually | `CONTEXT`, `HEAD`, `BRANCH`, Netlify `SITE_*`, Blobs runtime credentials | Netlify owns these. Runtime authorization uses trusted handler metadata. |

Node 24 is selected by the checked-in `.nvmrc`; SDK requires Node >=22.12.0. Do not override the branch runtime to Node 20. No additional secret or public build variable is required.

### Free plan scopes and secret isolation

Functions-only scoping is **not required**. On the current plan, Netlify may also provide branch environment values to its trusted build process. This is different from inserting a key into downloadable HTML/JS. This project serves the checked-in `public` directory directly: no Vite/Next variable substitution, custom public-config generator or `process.env` serialization is added. The build command reads only approval/context/branch flags, emits no environment dump and creates no public artifacts. The key is looked up at function runtime for the outbound Authorization header.

Before enabling AI, the owner must verify **context isolation** in Netlify: the DeepSeek key/passcode must be branch-specific, not a shared/default/all-preview secret. Avoid third-party build plugins or commands that dump or embed environment values. Missing Functions-only support alone is not a blocker; missing branch-specific values is. If branch-specific values are unavailable on this account, stop before entering/reusing a secret and choose a separately approved isolated test project or account plan. Do not silently use global secrets.

Changing a variable's context does not erase secrets captured by older deploy snapshots. If this same key was previously copied into an untrusted/other deployment, exact isolation cannot be established just by moving its current environment value. Resolve that exposure privately (including owner-controlled rotation if necessary) before live use. No credential change is made by this code session.

## Private Preview deployment — after separate approval

1. Confirm Production branch stays `main`, Production visibility stays as currently configured, and **Deploy Preview visibility is Private**. Include Functions and every usable Preview alias in signed-out checks. No change to main, PR #16 or its settings is required. A Draft PR alone is not privacy protection.
2. Before any Preview is created, set only this source branch's `PRESENTATION_DEPLOY_APPROVED=true`, keeping `PRESENTATION_AI_ENABLED=false`, `AI_CHAT_DISABLED=true`, and both legacy route flags false/absent. The checked-in `ignore` guard skips unapproved builds; the build-command guard also fails closed for a manual/build-hook build that bypasses Netlify's ignore step. It accepts only `deploy-preview` for this source branch, using Netlify's `HEAD` (or `BRANCH` fallback). Do not remove the guard if metadata is unexpected; inspect the non-secret branch/context and correct the configuration.
3. After deployment approval, open a **Draft PR** from `presentation/deepseek-flash-demo` to `main`, without merging. All development commits include `[skip netlify] [skip ci]`; no PR was opened during this session. To request the first Preview deliberately, use a PR title without skip markers and a subsequent empty trigger commit without skip markers (only after approval), or Netlify's explicit retry-from-latest-branch control once the PR has registered. If deliberately keeping the PR non-deploying, put `[skip netlify]` in its title. Do not rebase/modify PR #16.
4. Record the actual `deploy-preview-N--magenta-churros-99ffc3.netlify.app` hostname. Review build logs for correct base `MiraclePaw_Netlify_AI_MVP_v0.1`, publish `public`, functions `netlify/functions`, Node 24, successful function bundle and accepted rate-limit rule. No bundle/env logs should contain credentials. Keep existing project build plugins under owner review because branch keys are also build-scoped on this plan.
5. Open the Preview signed in and signed out/incognito. Signed out must be denied before HTML and `/api/presentation-chat`; confirm the alternative function path and deploy permalink cannot bypass access protection. Signed-in POST while disabled must return 503 `AI_DISABLED`. Free local entry, pet and mood features must still work without model requests.
6. Set the exact branch host and other branch variables from the table, retain AI disabled, then redeploy that private Preview. Netlify environment changes affect new deploys; they do not instantly change already deployed function snapshots.
7. Do not switch to a public branch deploy or Production to bypass Preview protections or branch secrets. No deploy or account settings have been changed by this session.

## First real model test — separately approved, proposed two calls

No live test is authorized by this guide. Proposed approval scope: one private Preview, two fictional adult messages, no retries, maximum 420 output tokens each, one ten-minute window, requested spend budget HK$1 (not a provider-enforced hard cap). Confirm owner account entitlement/balance, current rates and existing key scope privately first. Do not send account screenshots containing keys or billing identifiers to public GitHub.

Generate non-secret window configuration locally just before the approved test (this prints no API key):

```sh
node --input-type=module -e 'import {randomUUID} from "node:crypto"; const start=Date.now(); console.log(JSON.stringify({PRESENTATION_QUOTA_WINDOW_ID:randomUUID(),PRESENTATION_QUOTA_START:String(start),PRESENTATION_QUOTA_END:String(start+600000),PRESENTATION_QUOTA_MAX_REQUESTS:"2"},null,2))'
```

1. After paid-test approval, apply these window values and the reviewed attestations only to the branch. Set `PRESENTATION_AI_ENABLED=true`, `AI_CHAT_DISABLED=false`. Redeploy the same private Preview. Allow time for the deploy within the window; if it expires before testing, stop and approve a fresh window rather than bypassing expiry.
2. Check signed-out denial again, sign in as an invited founder, acknowledge adult fictional use and enter the existing demo passcode privately in the app. A passcode alone is not Netlify team-login protection. Invalid-passcode checks must return 401 with zero ledger/provider calls.
3. First fictional message: `我叫阿晴，今日想同你傾下偈，我鍾意橙色。` Check a natural Cantonese Paw Paw reply. Browser network should show only the same-origin `/api/presentation-chat`; no provider key or direct provider request appears in the browser.
4. Second message: `你仲記唔記得我叫咩名，同埋鍾意咩顏色？` Check recall of 阿晴 and 橙色. Inspect the protected Blobs ledger: admissions must be exactly 2, with the same window ID. Record only sanitized status, counts and pass/fail; never raw chats/keys. Invalid provider keys return fixed 502 fallback and still consume a reserved admission; timeout returns fixed 504; upstream 429 returns fixed 503. These failures are already mock-tested and do not justify more real calls automatically.
5. Use a fictional local-crisis test phrase from the existing demo; the browser should display its fixed local support with **no** new API request. Free local companionship must remain usable. Do not intentionally exceed the approved real-call count; the persisted cap has been tested offline.
6. End the session: set branch `PRESENTATION_AI_ENABLED=false`, `AI_CHAT_DISABLED=true` while keeping `PRESENTATION_DEPLOY_APPROVED=true` for the shutdown redeploy. Deliberately redeploy the disabled Preview and confirm deployed POST returns 503; then set `PRESENTATION_DEPLOY_APPROVED=false` to prevent subsequent builds. The fixed quota window also expires automatically; old deploy-permalink hosts are denied by the exact-host check. An env edit alone is not an immediate kill switch until redeployed.

### Direct DeepSeek official verification, 2026-11-28 HKT

- Official [first call](https://api-docs.deepseek.com/en/), [Chat Completions](https://api-docs.deepseek.com/api/create-chat-completion/) and [pricing](https://api-docs.deepseek.com/quick_start/pricing/) confirm the endpoint, `deepseek-flash` alias, V4.1-Flash-1017 version and explicit `thinking: {type: "disabled"}`. Streaming is disabled and output is capped by this app at 420.
- USD per million tokens: input cache hit $0.003 off-peak / $0.006 peak; input cache miss $0.15 / $0.30; output $0.60 / $1.20. Peak is weekdays 09:00–12:00 and 14:00–18:00 HKT, excluding Chinese public holidays; remaining hours are off-peak. No web tools are requested. Prices may change; the attestation must be reviewed before real testing.
- Illustrative stress estimate, not a certified tokenizer bound: 24,000 input tokens + 420 output at peak is USD0.007704, approximately HKD0.061632 at an assumed 8 HKD/USD; two calls about HKD0.123264. The actual context is bounded in **bytes/code points**, not verified provider tokens. HK$1/admission in the ledger is accounting only, not the actual cost or a hard provider cap. Hosting, Blobs, taxes and use of this same key elsewhere are excluded. Check provider balance/usage after testing.
- **Hong Kong account eligibility is UNVERIFIED.** Official [Open Platform terms](https://cdn.deepseek.com/policies/en-US/deepseek-open-platform-terms-of-service.html) permit downstream integrations subject to terms but do not guarantee jurisdictional availability (§1.4). No official jurisdiction list located in this review establishes this particular account's eligibility. Having a key does not prove account entitlement, usable balance, model access or Hong Kong inference/retention geography. Verify in the owner's existing platform account; if still unclear, obtain provider confirmation. No Qwen/Azure research or account operation is needed for code completion.

### Platform references

[Netlify conditional Blobs writes and strong consistency](https://docs.netlify.com/build/data-and-storage/netlify-blobs/), [trusted function deploy context](https://docs.netlify.com/build/functions/api/), [Functions env and scopes](https://docs.netlify.com/build/functions/environment-variables/), [branch-context env values](https://docs.netlify.com/build/environment-variables/overview/), [skip deploy markers](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/), [ignore builds](https://docs.netlify.com/build/configure-builds/ignore-builds/).

## Verification evidence and remaining gates

See `docs/PRESENTATION_DEEPSEEK_TEST_RESULTS.md` for fresh results. Mock request/response tests prove local behavior with fictional transports; they do not prove actual DeepSeek availability, Cantonese quality, live memory recall, platform billing, deployed Blobs consistency or deployed Netlify privacy. Local crisis rules are retained, not clinically certified. No real audience/self-service or youth launch is authorized.

Before any real use, remaining gates are: Netlify login/config inspection, branch-only existing-key/passcode scope, actual private Preview deployment/access, accepted edge rule, Blobs runtime entitlement and persisted receipt, direct DeepSeek account eligibility/key/balance, and separately approved bounded live smoke test. All settings changes, deployment, paid model calls and any resource purchase remain owner-controlled. No new paid resource has been provisioned.
