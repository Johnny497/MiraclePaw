# Phase 5E-5C-2 offline provider candidate

Baseline: `85e16b9a13b87f6692af7633c650367e0f52f6d2`. This is an offline, unconnected candidate. Existing live handlers and crisis patch are unchanged. All candidate providers and the orchestrator default to disabled. No endpoint, model, region, credential, transport, or provider account is configured by default.

## Flow

1. Local crisis triage checks the complete current message and supplied history. A block returns the existing local response without quota or provider calls.
2. Build one complete context from system prompt, at most 12 history turns, and current message. Count Unicode code points, including role labels. Reject above 8,000. Never truncate the moderation copy.
3. Reserve one quota lease. Check lease validity before each remote stage.
4. Independently moderate the entire exact context transcript. Only `pass` permits generation.
5. Generate one nonstreaming answer from the same messages. Local output triage may block it.
6. Independently moderate the entire generated answer. Only `pass` releases it.
7. Any malformed response, exception, unavailable provider, quota failure, or expired lease returns a fixed local fallback. No retry, provider switching, streaming, or raw model output release.

The candidate uses injected `transport.post` and has no native network transport. The existing free local companionship remains available. The existing fixed Hong Kong support text is supplied by the crisis triage module. No third-party notification is introduced.

## Integration boundary

The candidate is deliberately not imported by either `netlify/functions/chat.mjs` or `netlify/functions/deepseek-test.mjs`. A later approved integration must map real authentication, route eligibility, quotas and lease checks from the existing handlers into the orchestrator, verify R01–R06, and undergo independent review before any live provider configuration.

## Provider status and references

Qwen Chat Completions uses a Hong Kong workspace URL pattern as a candidate shape only. Azure Text Analyze uses API version 2024-09-01, four categories, and `FourSeverityLevels` as a candidate shape only. Actual endpoint, model, region eligibility, data handling, price, contractual terms, and clinical suitability remain unverified and unapproved.

- Qwen API: https://help.aliyun.com/en/model-studio/qwen-api-via-openai-chat-completions
- Azure Text Analyze: https://learn.microsoft.com/en-us/rest/api/contentsafety/text-operations/analyze-text?view=rest-contentsafety-2024-09-01

## Open risks

- R01: Broad route acceptance.
- R02: Client-supplied bounded history and trust boundary.
- R03: Sticky support behavior.
- R04: Frontend parity.
- R05: 120-item benchmark not scored for this candidate.
- R06: Provider eligibility, privacy, content safety, costs, and regional arrangements unverified.

This offline routing work is not clinical safety certification. GO for offline independent review only; NO-GO for real users, paid AI, or production integration.
