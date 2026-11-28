# DeepSeek local-only API smoke test

This test is for an adult developer, using one fixed fictional message. It makes **one** paid-capable DeepSeek API request; check provider balance/usage first. It does not use OpenAI, Netlify, or any real personal data. It does not activate the public site, expose a chatbot, or merge PRs.

## Run locally (Node.js 20+)
1. Download/clone this PR branch on your own computer. Never copy API keys into the repository or into ChatGPT.
2. Open a terminal in `MiraclePaw_Netlify_AI_MVP_v0.1`.
3. Set `DEEPSEEK_API_KEY` temporarily in your own terminal environment using a non-echoing input method, then run `node scripts/deepseek-smoke-test.mjs`. Do not use a committed `.env` file.
4. The script only prints HTTP status, response presence, and response length. It does not print raw DeepSeek content, account details, or secrets.
5. Clear the shell variable afterwards. Report only SUCCESS or HTTP status, not the key.

### Mac/Linux example (does not echo key)
```sh
read -rs "DEEPSEEK_API_KEY?Paste DeepSeek API key: "
echo
export DEEPSEEK_API_KEY
node scripts/deepseek-smoke-test.mjs
unset DEEPSEEK_API_KEY
```

For Bash use `read -r -s -p "Paste DeepSeek API key: " DEEPSEEK_API_KEY` instead of the zsh prompt syntax.

## Limitations
- A successful connection proves only that DeepSeek API accepted one fixed request. It does **not** validate mental-health safety, provider data handling, budget limits, or public deployment.
- The preview function stays disabled (`DEEPSEEK_TEST_ENABLED=false`); this local smoke test does not change it.
- Never send real personal, medical, or crisis messages in this test.
