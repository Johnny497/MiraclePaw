# Phase 5E-5C-2 interface specification

All calls below are server-side candidate contracts; they are not wired to a deployed route.

## GenerationProvider

`generate(messages: Array<{role: 'system'|'user'|'assistant', content: string}>, {lease}): Promise<string>`

Requires explicit `enabled: true`, branded offline mock transport, synchronous lease guard, exact fictional fixture approval, and fictional credential. Qwen adapter sends exactly one Chat Completions request with `stream: false`, `n: 1`, and `max_tokens: 420`. It accepts only HTTP 200, one `chat.completion` choice at index zero, `finish_reason: 'stop'`, an assistant message with nonempty content at most 1,600 Unicode code points / 6,400 UTF-8 bytes, and no tool or function call. All other shapes fail closed. No real provider approval is implied.

## ModerationProvider

`analyze(text: string, {lease}): Promise<'pass'|'filtered'|'crisis'>`

Azure adapter requires explicit enablement, branded offline mock transport, synchronous lease guard, exact fictional fixture approval/credential, and text at most 8,000 Unicode code points / 24,000 UTF-8 bytes. It requests Hate, SelfHarm, Sexual, Violence and four severity levels. A response must contain each category exactly once with severity 0, 2, 4, or 6, plus a structurally valid blocklist array. Any missing, duplicate, unknown, or invalid field fails closed. Nonzero SelfHarm/Violence takes priority and returns `crisis`; nonzero Hate/Sexual or blocklist hit returns `filtered`; all zero returns `pass`. Nonzero severity is a conservative offline rule, not a clinically validated threshold.

## Orchestrator dependencies

`createOfflineCandidateOrchestrator({enabled, generation, moderation, quota, trusted})`

`trusted` comes from `createOfflineTrustedConfig({system,route,requestUrl,authorize,offlinePriceAttestation})`; `run()` accepts only message/history. `quota` comes from `createOfflineQuotaAdapter({reserveQuota,assertQuotaActive})` with exact existing signatures `reserveQuota(route,requestUrl)` and synchronous `assertQuotaActive(lease,timeoutMs)`. Its lease must have the same route, a window ID and enough time for three 5-second stages. Real quota and auth functions are deliberately not injected by this candidate. The orchestrator catches failure and releases only a fixed local fallback. Input and output are independently moderated. The same complete messages sent to generation are serialized as JSON for input moderation without truncation. Each stage has a deadline.

The 8,000 code-point and 24,000-byte limits are provisional and include JSON role encoding. Browser strings use UTF-16, so code points are counted with iteration, not `.length`. A provider tokenizer is not available offline; actual token counts and regional processing remain UNVERIFIED.
