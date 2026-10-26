# Architecture

## Current prototype

Node.js serves `public/`, `/api/status`, `/api/books`, the backward-compatible scripted `/api/practice`, and the local-only teaching session routes described in [AI_ADAPTER.md](AI_ADAPTER.md). Versioned book JSON and server teaching configuration remain separate. A deterministic script is the default; an explicit opt-in adapter can target a selected Chat Completions endpoint after authorization. No supplier, model or credential is supplied or live-tested by this increment.

`lib/sessions.mjs` owns canonical history, book/config versions, teaching mode, bounded input/context/attempts/turns/lifetime, resource reservations, cancellation and idempotent request replay. `lib/provider.mjs` separates platform instructions from material data, makes one bounded non-streaming request without tools/redirects/automatic retries, validates structured reply/usage and maps sanitized errors. The browser state machine rejects stale replies and preserves input after failed/cancelled requests. Browser-local progress, reflection and creator drafts retain their original storage key; failures leave current work in memory with a persistent warning.

This is not a multi-user production service. Teaching requests require loopback remote address and Host, with same-origin write checks. There is no identity provider, durable database, production quota ledger, billing or payment processor. Server memory expires within ten minutes; a restart ends sessions and resets resource reservations. Provider cancellation cannot prove that an upstream service stopped work or waived cost. Default binding is 127.0.0.1, and default AI enablement is off.

## Target boundaries

The learner UI and creator workspace should share a versioned book model. A teaching orchestration service combines approved book content, learning objectives, role scenarios, feedback criteria, permitted actions, and user-selected learning state. Provider adapters sit behind that service so each book does not need its own separately trained base model.

Identity and durable storage must precede online publication of learner records. Book versions, teaching configurations, and model versions should be identifiable when reproducing feedback or comparing learning outcomes. Private learner state must not be packaged as public book content.

The billing service should record actual provider usage, reserves, debits, reversals, and creator settlements separately from learning progress. Use idempotency for financial operations and avoid trusting balances or completed requests supplied by the browser.

## Deployment

The prototype runs on a standard Node host or a local machine. GitHub is the source and collaboration destination, not the application runtime. A production hosting choice is an open decision after the first real teaching pilot; do not silently bind the project to one deployment vendor.

## Extension sequence

1. Versioned content and teaching contracts.
2. Authenticated, bounded real-AI practice and evaluation.
3. Durable user-owned progress and creator drafts.
4. Preview, review, and versioned publishing.
5. Usage accounting, payments, and creator compensation.

The zero-dependency UI is a prototype choice. The production frontend and storage architecture should be chosen from demonstrated needs rather than treated as already settled.

## Versioned packages and private reading (0.3.0-dev)

`schemas/` and TEACHING_SPEC.md define package/acceptance protocol 1.0.0. `public/book-package.js` provides pure offline structural and cross-reference/state consistency checks shared by CLI and browser. It supports only the fixed schemas' documented keyword subset and fails on unsupported schema keywords. `lib/book-package.mjs` adds bounded local file reads and manifest-digest binding without model/network access.

`lib/content.mjs` loads only an explicit public fixture allowlist and retains the legacy sample. `public/reader-model.js` projects packages into the reader, stores local packages/progress under `olb.reader.v1`, and keys records by book/version and stable chapter/unit IDs. Existing creator drafts remain at `olb.prototype.v1`. New local imports validate and persist before replacing state; progress save failures retain current memory with a warning.

The browser fetches only public schema definitions from `/api/package-schemas`. Private file/pasted JSON stays in the browser; no upload route, folder scanning or server log of imported content is introduced. `public/local-teaching.js` is a bounded fixed-script transport for private books and does not invoke fetch. Real private-model access is planned and must not be inferred from public-book server adapters.

Chapter reading is continuous, with optional learning tools opened separately. Server sessions accept explicit content version and chapter binding; legacy callers without those fields remain compatible. UI status derives from actual format checks and labels content/AI as unverified; author-supplied acceptance metadata cannot grant approval. Official registry, authenticated review, evidence storage and publication are not implemented.
