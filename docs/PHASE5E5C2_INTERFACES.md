# Phase 5E-5C-2 interface specification

All calls below are server-side candidate contracts; they are not wired to a deployed route.

## GenerationProvider

`generate(messages: Array<{role: 'system'|'user'|'assistant', content: string}>): Promise<string>`

Requires explicit `enabled: true`, an injected `transport.post`, a reviewed endpoint/model, and an injected credential. Qwen adapter sends exactly one Chat Completions request with `stream: false`, `n: 1`, and `max_tokens: 420`. It accepts only HTTP 200, one `chat.completion` choice at index zero, `finish_reason: 'stop'`, an assistant message with nonempty content at most 1,600 Unicode code points, and no tool or function call. All other shapes fail closed.

## ModerationProvider

`analyze(text: string): Promise<'pass'|'filtered'|'crisis'>`

Azure adapter requires explicit enablement, injected transport/credential, a reviewed resource URL, and text at most 10,000 Unicode code points. It requests Hate, SelfHarm, Sexual, Violence and four severity levels. A response must contain each category exactly once with severity 0, 2, 4, or 6, plus a blocklist array. Any missing, duplicate, unknown, or invalid field fails closed. Nonzero SelfHarm/Violence returns `crisis`; nonzero Hate/Sexual or blocklist hit returns `filtered`; all zero returns `pass`.

## Orchestrator dependencies

`createOfflineCandidateOrchestrator({enabled, generation, moderation, reserve, assertActive})`

`reserve(route): Promise<lease>` must atomically reserve the existing server quota once. `assertActive(lease): void` must throw if it expires. Both are mandatory when enabled. The orchestrator catches failure and releases only a fixed local fallback. No implicit quota implementation is supplied. Input and output are independently moderated. The same full context sent to generation is represented in the input moderation transcript without truncation.

The 8,000 code-point limit is provisional and includes role labels. Browser strings use UTF-16, so code points are counted with iteration, not `.length`.
