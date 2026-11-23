# MiraclePaw v1.5 — Free Local Demo Journey

**Status:** Draft release candidate for adults reviewing fictional MVP behavior. No authorization for real minors, care recipients, or clinical/NGO deployment.

## Scope
- New four-stage, user-driven local guide: pet interaction → optional feelings → optional microstep → fictional pet-to-pet greeting.
- Every stage can be bypassed. The tour is not a score, assessment, attendance log, or compliance indicator. No interaction is automatically triggered by tour navigation.
- Free local entry **without a demo passcode** after adult-stakeholder acknowledgment; AI chat stays disabled until the existing passcode gate is completed. Refresh/reset reopens consent.
- “唔想出門” quick suggestion uses the same local reassurance as the existing skip button; no optional AI calls are needed.
- Existing expressive pet responses, self-contained mood history, mock greeting, crisis resources and v1.4 rate limiting remain unchanged.

## Zero-data / zero-billing boundaries
- `public/tour.js` has no network, storage, cookie, location, analytics, model call, or user identity.
- Optional AI chat retains the separate Netlify/OpenAI path, passcode and existing cost controls; the site must not imply it can cap total spend.
- No GPS, no real-person matching, no punitive mechanism. Mood check-ins remain only in page memory; neither parents nor NGOs can read raw dialogues.
- No diagnostic effect or crisis safety guarantee is claimed.

## Acceptance checklist (before merge)
1. `npm test` green; existing v1.3/v1.4 crisis, fail-closed, timeout, skip, and rate-limit tests still green.
2. Netlify Deploy Preview succeeds; verify it points at the new v1.5 PR head SHA.
3. Adult acknowledgment checkbox must be required for *both* AI and local-entry routes.
4. With local entry, no passcode: pet, mood, steps, tour, fictional greeting all work; chat input remains disabled; Network panel shows zero `/api/chat` requests from these actions.
5. Tour: next/skip/stop/restart, keyboard focus, responsive mobile, screen reader status and reduced-motion checks.
6. “唔想出門” local button never calls `/api/chat`, both before and after opting into AI; no pressure, penalties or absent companionship.
7. Crisis hotline and restricted use warnings remain visible; AI under a valid internal passcode still has the previously reviewed v1.4 rate limiter and fail-closed behavior.
8. Do **not** merge or publish without an explicit review/acceptance step; independently verify Production Published after eventual merge.

## Follow-up outside this release
- Independent youth safety, privacy/retention, consent/ethics and professional review before real-world pilots.
- Global shared cost guardrail (per IP edge throttling is not a total monetary cap).
- Four internal MVP demonstrations targeted for Nov 30 require a separate completeness check; this guided page is not evidence all four have been delivered.
