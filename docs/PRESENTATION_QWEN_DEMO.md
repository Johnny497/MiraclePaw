# MiraclePaw private presentation Qwen candidate

Prepared for Edwin and Charlie's 2026-11-28 adult-team demonstration. This branch is **code only**: it has not been deployed or connected to a real API key. The original `/api/chat`, PR #16, and the separate Qwen/Azure offline candidate architecture remain intact.

## What this branch does

- Reuses the existing main chat UI and Paw Paw role prompt. The UI posts to the isolated `/api/presentation-chat` route.
- Keeps browser and server local crisis triage plus fixed Hong Kong support replies. Local crisis replies make no quota or model request and remain available after the UI's 20 AI-turn cap.
- Sends one nonstreaming Qwen Chat Completions request per accepted message, with at most 12 prior turns, complete-context limits of 8,000 Unicode code points / 24,000 UTF-8 bytes, `max_tokens: 420`, and no automatic retry or provider fallback.
- Requires a server-side passcode, exact private Preview host, default-deny flags, an existing shared D1 quota window, separate Qwen price attestation, a local-safety acknowledgment and Netlify edge rate limiting. One quota admission is reserved before Qwen. No quota row is created automatically.
- Caps response bytes while reading, rejects redirects and malformed/truncated responses, checks the quota lease again before showing model text, and never sends raw provider errors to the browser.

This single-provider presentation path **does not include independent Azure or other model moderation**. Local rules are not a clinical safety system. Use only with invited adults and wholly fictional data. Do not invite audience self-service or input real student information.

## Required owner-controlled setup after separate deployment and live-call approval

1. Confirm the Netlify project's Production branch remains `main`. Protect **all Preview URLs and their Functions** with Netlify private team login or Preview-only password protection **before** creating any Preview. Verify signed-out/incognito access is denied. A Draft GitHub PR does not make its Preview private. If the current plan cannot protect previews without affecting Production, stop and choose a separately approved private test project.
2. After deployment approval, create a Draft PR from `presentation/qwen-demo-20261128` against a Preview-eligible base branch. This action may trigger a deployment. Do not merge it. Record the resulting `deploy-preview-N--magenta-churros-99ffc3.netlify.app` host and inspect deploy logs to confirm the `/api/presentation-chat` rate-limit rule was accepted. Keep AI disabled while checking access and routing.
3. In Netlify UI, set **branch-specific, Functions-only** values for this presentation source branch, not a global or all-Deploy-Previews value. Netlify documents that branch values apply to Deploy Previews from that branch; Functions-only scopes depend on the team's plan. If the necessary isolation is unavailable, stop. Never place credentials in GitHub, `netlify.toml`, Chat, screenshots or logs. Required names: `QWEN_API_KEY`, `QWEN_BASE_URL`, `QWEN_MODEL`, `DEMO_PASSCODE`, `PRESENTATION_PREVIEW_HOST`, `AI_QUOTA_D1_ACCOUNT_ID`, `AI_QUOTA_D1_DATABASE_ID`, `AI_QUOTA_D1_TOKEN`, `AI_QUOTA_WINDOW_ID`.
4. The code accepts only `QWEN_BASE_URL=https://ws-m4tcc4k3fqktkmu8.cn-hongkong.maas.aliyuncs.com/compatible-mode/v1` and `QWEN_MODEL=qwen3.8-flash`. These are public configuration identifiers, **not** a claim that the account, inference geography, data terms or price have been approved. The existing D1 row must be pre-provisioned with the matching window/policy and a reviewed budget; this branch does not create a database or window.
5. Only after explicit owner approval for **paid adult-fictional smoke testing**, set the branch-scoped gates `PRESENTATION_AI_ENABLED=true`, `AI_CHAT_DISABLED=false`, `AI_QUOTA_ENABLED=true`, `PRESENTATION_QWEN_PRICE_REVIEWED=qwen3.8-flash-hk-v1`, and `PRESENTATION_LOCAL_SAFETY_ACCEPTED=true`. The last two values are owner attestations, not automatic approvals. Confirm no values inherited by Production or PR #16.
6. Start with one fictional greeting, then one fictional follow-up to verify memory. Check a fictional crisis phrase yields fixed local support without a Qwen request. Confirm 429/timeout fallback, one request per admitted turn, Netlify function rate-limit acceptance and D1 reservation count. Do not intentionally exhaust quota or use real identities. Return `PRESENTATION_AI_ENABLED=false` immediately after the demonstration.

## Cost and privacy limits

The shared D1 SQL permits at most 20 admissions per pre-provisioned window and reserves HK$1 per admission as an **accounting guard**, not a guarantee of the actual Alibaba bill. The Netlify function requests a maximum 420 output tokens and has no retry. Price, tokenization, provider account limits, regional processing, retention and terms still require owner review. The Preview access layer and server passcode serve different purposes; neither alone is sufficient for a youth service. No real youth use is approved. R01–R06 remain OPEN.

Official references: [Qwen Chat Completions](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-openai-chat-completions), [Netlify Preview visibility](https://docs.netlify.com/deploy/deploy-overview/), [Netlify branch-context environment values](https://docs.netlify.com/build/environment-variables/overview/), [Netlify Preview protection](https://docs.netlify.com/manage/security/secure-access-to-sites/password-protection/).
