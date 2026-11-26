# Phase 4B — Local synthetic free-text prototype

**Not for real emotional support, minors, or public access.** This is a local terminal test with a real DeepSeek API. It accepts developer-typed *fictional* text, not real user data. An adult developer must opt in by typing YES.

Run in the newest PR #16 branch folder `MiraclePaw_Netlify_AI_MVP_v0.1` (macOS zsh):

```sh
read -rs "DEEPSEEK_API_KEY?Paste DeepSeek API key: "
echo
export DEEPSEEK_API_KEY
node scripts/deepseek-phase4b-local-chat.mjs
unset DEEPSEEK_API_KEY
```

Commands: `/quit` exits, `/reset` clears in-memory chat history. Maximum 160 characters per message, five attempted API calls per process, 12-second timeout. Check DeepSeek balance beforehand; restart resets the five-call counter and **is not a provider-side hard spend cap**.

### Critical limitations
- The local crisis/high-risk keyword filters and output blocklist are **incomplete and bypassable**. They are not independent moderation, cannot detect all unsafe messages or outputs, and must never be used as a safety claim.
- Crisis keyword matches display fixed support and Hong Kong hotlines without an API call. This is a limited prototype, not a validated crisis workflow.
- Only type fictional, non-sensitive material. Do not paste real names, health information, personal data, secrets, or crisis messages. A model reply can still be unsuitable even if it passes the blocklist.
- No data saved to disk by the script; DeepSeek receives each allowed input plus conversation history and may process/store it under its own terms. Terminal scrollback can retain displayed content.
- The public Netlify AI remains disabled (`DEEPSEEK_TEST_ENABLED=false`). PR #14/#16 remain unmerged.
- Before any real-user or publicly accessible chatbot: independent input/output moderation, crisis detection evaluation, authorization, privacy and retention review, spend hard caps, and external safety review are required.
