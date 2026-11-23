# MiraclePaw v1.6 DeepSeek — isolated sandbox (DRAFT)

This branch starts from the unmerged v1.5 PR #14 branch. Do not merge into main or enable public AI.

## Design
- Adds only a server-side Netlify Function at `/api/deepseek-test`. No frontend UI, navigation, or client-side API key.
- **Disabled by default** unless `DEEPSEEK_TEST_ENABLED=true`; `AI_CHAT_DISABLED=true` overrides it.
- Requires separate `DEEPSEEK_TEST_PASSCODE` (20+ chars), `DEEPSEEK_API_KEY`, and `OPENAI_API_KEY` for independent input moderation. No OpenAI key means **fail closed**, not an unsafe bypass.
- Requests are restricted to a single fictional test message; no history, storage, tracking, or retries. Do not submit real personal or sensitive information.
- DeepSeek model: `deepseek-chat`; max 250 output tokens. Rate limit configured to 3 requests/60 seconds per IP+domain; verify actual Netlify deploy logs. **Not a global budget cap.**
- Input and output are independently checked via OpenAI Moderation; output is never displayed if moderation fails, returns invalid data, or flags content. Expert safety testing, provider data review and cost controls remain outstanding. This is **not ready for real users**.

## Configuration (Netlify Deploy Preview only)
1. Add secret values via Netlify environment variable UI, scoped to a dedicated Deploy Preview context if supported. Never put keys in GitHub, chat, screenshots or frontend.
2. Keep `DEEPSEEK_TEST_ENABLED` unset or `false` until preview deployment, provider billing controls, moderation, and safety review are explicitly approved.
3. Set `AI_CHAT_DISABLED=true` if all AI calls should be blocked; note this also disables the existing OpenAI chat Function.
4. Verify Preview deploy log applied the rate-limit rule. Green CI alone does not prove edge enforcement.
5. Test the default disabled state with an ordinary POST: expected HTTP 503, `SANDBOX_DISABLED`. Do not run live model tests until explicitly authorized.
6. Before any activation: independently review DeepSeek terms, data retention, cross-border transfer, spending limits, incident response, and crisis handling. No public launch or minors/NGO pilot.

**Important:** GitHub repo is public. PR code is public even when Draft. A draft PR does not make its preview URL private. Secrets must remain server-side and Preview-scoped.
