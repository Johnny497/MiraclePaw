# Phase 4 — Private local interactive DeepSeek demo

This is a **menu-based** developer demo, not a free-text mental-health chatbot. It runs in a local terminal and allows an adult tester to choose from eight fixed fictional prompts. It keeps conversation history in memory only and makes **at most five attempted API requests per run**. There is no server or Netlify exposure.

## Run (macOS zsh)
Download the latest PR #16 ZIP, then enter `MiraclePaw_Netlify_AI_MVP_v0.1` in Terminal. Check DeepSeek billing before running.

```sh
read -rs "DEEPSEEK_API_KEY?Paste DeepSeek API key: "
echo
export DEEPSEEK_API_KEY
node scripts/deepseek-phase4-local-demo.mjs
unset DEEPSEEK_API_KEY
```

Use number keys 1–8 to choose a fictional message; 0 exits. The program displays the actual, **unreviewed** DeepSeek response locally. Use no real user details. The model may return unsafe or unsuitable content, so a responsible adult developer must review every reply.

## Limitations and safeguards
- **No independent input/output moderation** is available with only a DeepSeek key. This demo restricts inputs to prewritten fictional messages, but it cannot guarantee safe model outputs.
- Five attempted API calls per run is **not** an account-wide spend cap; restarting can incur further costs.
- No persistent memory, user authentication, child access, GPS, matching, or real mental-health support.
- No crisis prompts are in the menu; crisis detection/response requires a separately verified implementation.
- Keep Netlify `DEEPSEEK_TEST_ENABLED=false`; PR #14 and PR #16 remain unmerged.
