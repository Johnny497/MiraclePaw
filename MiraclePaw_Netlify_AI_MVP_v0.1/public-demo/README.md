# MiraclePaw v1.5 — Public Local-only Demo

This is a **separate Netlify site** configuration, for adult stakeholder testing only. It intentionally excludes AI chat, Netlify Functions, API credentials, tracking, GPS, and server-side data capture. Do not deploy it over the existing production project.

## Create second Netlify site (Free plan)
1. In Netlify, choose **Add new project → Import an existing project → GitHub → Johnny497/MiraclePaw**.
2. Choose the deploy branch **feature/public-local-demo-v1.5**.
3. Set **Base directory** to `MiraclePaw_Netlify_AI_MVP_v0.1/public-demo`. This folder has its own `netlify.toml`, with build command `node build.mjs` and publish `dist` relative to this base.
4. Do not add **any environment variables**, API keys, functions directory, or AI backend. Confirm the build logs show no functions deployed.
5. In the **new** site only, set Visitor access to **Public**. Keep the existing MiraclePaw Netlify project Private.
6. Verify the new URL on a separate browser/incognito: cat, mood, optional steps, fictional pet hello, tour; browser Network tab must show **no /api/chat, no remote API, no analytics**.
7. Share the **new** site URL privately with adult testers and ask for usability feedback without personal stories or sensitive data.

## Security boundaries
- The build copies only 7 static assets and generates `index.html` and `local-demo.js`. No `app.js`, `netlify/functions`, `netlify.toml` from the AI app, secrets, or backend endpoints.
- CSP sets `connect-src 'none'` to block browser network calls by JavaScript.
- There is no text-entry chat; replies are local fixed strings.
- No under-18 testing or real-world mental-health support. Hotline information is static.
- Changes to the source v1.5 UI may require adjusting the build assertions. Fail the build rather than silently publishing AI UI.
