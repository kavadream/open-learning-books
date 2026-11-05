# Bounded teaching adapter (0.3.0-dev; M1 foundation retained)

This change supplies an opt-in Chat Completions protocol adapter and offline tests. **No provider, model or credential has been selected; no real model was called or evaluated.** The default UI and legacy `/api/practice` remain explicitly scripted. Issue #1 stays open until a specifically authorized real-model pilot succeeds. Accounts and production hosting are separate gates.

## Enablement boundary

The server reads only `OLB_AI_ENABLED`, `OLB_AI_ADAPTER`, `OLB_AI_ENDPOINT`, `OLB_AI_MODEL` and `OLB_AI_KEY`. It does not search other projects or inherit a generic model SDK's credential conventions. `.env.example` contains empty placeholders. Node loads an ignored `.env` only when the operator explicitly passes `--env-file=.env`.

All five settings must be present and enablement must equal `true`. Adapter ID is `chat-completions`. Endpoint must be an explicitly chosen HTTPS completion URL with no embedded credentials, query or fragment. No default vendor, model, endpoint or fallback exists. This module can be replaced by another implementation of `generate({messages,maxOutputTokens,signal})` without changing the teaching session API.

The protocol sends `model`, `messages`, `max_completion_tokens`, `response_format: {type: 'json_object'}`, `stream: false` and `store: false`, with a server-side Bearer key. It accepts `choices[0].message.content` containing the teaching JSON contract, an ordinary `stop` finish, and nonnegative `prompt_tokens`, `completion_tokens`, `total_tokens`. Providers/models that do not support these options require a separate tested adapter. The wire shape was checked against [official OpenAI Chat Completions documentation](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create); this is not a supplier selection. `store:false` is a request option, not a claim about every provider's retention policy.

## Local HTTP contract

| Operation | Request | Result |
| --- | --- | --- |
| `POST /api/teaching/sessions` | `{bookId, bookVersion, chapterId, unitId, engine: 'demo' or 'ai', mode: 'explanation', 'role-play' or 'feedback'}` | Session ID, engine, mode, book/teaching versions, limits and expiry |
| `POST /api/teaching/sessions/:id/turns` | `{requestId, message}` | Labelled reply, phase, feedback, remaining turns and versions; AI responses also include model and provider usage |
| `DELETE /api/teaching/sessions/:id` | No body | Closes and aborts the session; clears its history |

An empty message is accepted only for the initial prompt (or a replay of its request ID). Clients send **no conversation history, prompts, keys, URLs or limits**. The server owns canonical history. Unit/config versions must match. Role-play is allowed only on the warehouse unit; explanation and feedback are available on all three units. Demo explanation is a fixed excerpt; demo feedback is a self-check, never adaptive judgment.

Same request ID plus same trimmed message shares a pending call or replays its cached result/error. A different body returns 409. After transport uncertainty, retry the same ID first. A known retryable failure can be retried manually with a **new** ID; failed attempts retain their reservation. There are no automatic provider retries or invisible fallback to a demo.

## Bounds and failure behavior

- 16 KiB HTTP JSON body, 2,000 UTF-16 input code units, 20,000 UTF-8 context bytes, 600 requested completion tokens, 64 KiB provider response, 6,000 reply characters and four feedback items.
- Six learner turns, ten distinct attempts and ten-minute expiry per session; expiry timers remove idle sessions too. At most 100 sessions, including cancelled tombstones until expiry; at most two active AI calls.
- Fifteen-second model deadline, bounded by remaining session lifetime. Client disconnect, explicit cancellation and shutdown abort pending work. Late replies do not enter history or overwrite another UI state.
- Resource reservations use serialized context bytes + output token cap + 256 units of framing allowance, up to 90,000/session and 300,000/process. These conservative application units are **not a tokenizer count, paid balance, dollar limit or durable financial ledger**. Actual usage remains separately identified. Unknown/failed usage is not silently treated as free. Restarts reset these pilot safeguards; real usage economics and persistent quotas belong to #6.
- `AI_NOT_CONFIGURED`, `PROVIDER_CONFIG`, `PROVIDER_QUOTA`, `PROVIDER_RATE_LIMIT`, `PROVIDER_UNAVAILABLE`, `INVALID_OUTPUT`, `INVALID_USAGE`, `TIMEOUT`, `CANCELLED`, `SESSION_EXPIRED`, `USAGE_LIMIT`, `SESSION_LIMIT`, `BUSY`, `SERVER_SHUTDOWN`, and input errors have Chinese messages. Provider response bodies and low-level connection details are not shown to learners.

This is an unauthenticated **local pilot**. Teaching routes require both a loopback remote address and loopback Host, and reject cross-origin writes. Do not expose it through a reverse proxy or treat these checks as production authentication. There is no online publishing, user account, persistent transcript store or payment operation.

## Material and output boundaries

Platform behavior and the validated mode occupy the system message. Versioned book text and teaching configurations are a separately labelled user-data message. Creator text cannot set URLs, tools, keys or bounds. No tool execution capability is provided to the model. Only the selected unit is sent; browser drafts and reflections are not included.

Model feedback must quote exact nonempty learner text; unknown quotes, added score fields and role-play feedback are rejected. This structural check cannot prove that a semantic judgment is fair or that the character stays consistent. Prompt injection remains a quality risk: human adversarial/consistency review and real-model evaluation are still required. Learner/model output is escaped as text in the UI.

## First authorized live pilot gate

An owner must supply an explicitly selected provider/model snapshot, project-specific credentials, an approved small call/spend limit, and a decision on what test data may be sent and retained. Then use synthetic data first, exercise all three modes and cancellation/error paths, record actual usage, and complete the evaluation protocol. Do not mark issue #1 or the M1 milestone complete based on offline mocks. No live call, credential creation, fee, deployment or learning-effect claim is part of this implementation.

## Shutdown lifecycle

The returned HTTP server's `close(callback)` first marks the service as closing and synchronously closes its teaching session manager, then invokes native HTTP close. In-flight provider signals are aborted before HTTP waits for active connections, and the cancellation responses use `Connection: close` so keep-alive cannot delay completion. The wrapper preserves the native return value and callback/error behavior. CLI `SIGINT`/`SIGTERM` use this same path. Closing is terminal for that application instance; create a fresh server to restart it.

The session manager rejects later creates/turns with `SERVER_SHUTDOWN`, including work whose HTTP body finished parsing after close began. Ordinary `DELETE` cancellation stays scoped to the selected session and leaves concurrent sessions/service availability intact. Real HTTP regression tests cover both paths using offline provider fixtures, including a fixture that ignores the abort signal.

## 0.3 reading/package boundary

The reader supplies explicit book/version/chapter IDs when creating public-book sessions; a mismatch returns `CONTENT_MISMATCH`. Legacy callers omitting version/chapter remain supported. Responses identify the bound book/chapter/unit and versions. Public content is loaded only from the checked-in allowlist.

Browser-imported private books do not enter these HTTP routes. They use the isolated fixed-script transport in `public/local-teaching.js`; private real-AI access is unimplemented. No private upload route, directory scan or private book logging is added. Package/schema state does not mark content or teaching as approved; see the canonical [package and acceptance specification](TEACHING_SPEC.md).
