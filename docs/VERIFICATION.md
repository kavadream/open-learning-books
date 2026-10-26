# Verification record

## 0.3.0-dev — 2026-10-26: package contract and local reading loop

Scope: protocol 1.0.0, strict offline validation, public multi-chapter loading and browser-only private reading. No private full manuscript was accessed or copied; fixtures use only the existing public sample and synthetic UI test text. No real AI, payments, account setup or deployment was performed.

### Automated

`npm run check`, `npm run package:check`, `npm run eval:check` and all **49 tests** pass on Node v24.14.1. New coverage includes package levels without compulsory roles/exercises; complete-text/rights/ID/order/reference requirements; unsafe media paths and unknown schemas; separated case coverage; no promotion from format to content/AI; live-plus-reader metadata gates and critical facts/rights/safety blockers; explicit `claimsVerified:false`; public allowlist loading; local import/restore; malformed/oversized/conflicting input atomicity; version-specific progress and explicit position adoption; storage failure and protection of damaged original saves; private teaching with HTTP mocked to throw if called; and server-side book/chapter/version binding. The existing HTTP shutdown/cancellation regressions remain included.

Offline acceptance-record consistency is not authentication or verification of evidence. The example record remains `not-run` for all three layers. The package-check reports only format as passed, with content/AI not run and publication not performed.

### Actual browser flow

Used a hidden supported ChatGPT in-app Chromium preview with `OLB_AI_ENABLED=false`, bound only to 127.0.0.1. Tested the following on the actual running app, not static mockups:

| Viewport | Flow and observation |
| --- | --- |
| 390 × 844 | Open public multi-chapter book; full chapter body with teaching closed; mark chapter/read next; refresh restores chapter 2 and completion. Keyboard Enter opens optional tools; Tab/Enter submits a labelled script question. Three role turns end with a self-check quoting the actual synthetic learner response. Close tools/read next/refresh restores chapter 3. Page width equals scroll width (375px excluding scrollbar). |
| 320 × 740 | Invalid pasted JSON shows format failure and leaves two public cards intact. Valid synthetic private package saves only locally. A literal `<img>` marker renders as text with zero injected reading images. Local feedback quotes the synthetic answer; real private AI option is disabled. Close tools/refresh restores private book chapter 2. Page width equals scroll width (305px excluding scrollbar). |
| 1440 × 1000 | Import a new synthetic version: starts at chapter 1 with 0/3 completed. Explicitly adopt the older stable-ID position: reaches chapter 2, still 0/3; no completion state copied. Desktop outline and continuous text visually inspected. |

Actually closed this task's preview tab and opened a fresh tab at the same origin: imported version 0.2.0 and chapter 2 were restored. This is same-browser local persistence, not account sync or a guarantee after clearing site data.

Screenshots contain public material/synthetic data only: [390px continuous reading](verification/reader-390.jpg), [320px local imported reading](verification/private-import-320.jpg), [desktop version/position isolation](verification/reader-desktop-1440.jpg). No file-download/upload approval was needed: import verification used the local paste field. The file-picker branch has code-level size/error handling but was not exercised through the browser. Save-denial and corrupt-store failures were tested offline; no browser security setting was changed.

Limitations: simulated viewport sizes, no hardware-phone/Safari/Firefox or full screen-reader audit; plain Markdown text only, no media or voice; actual AI and reader learning trial unrun; trusted review/registry/publishing and cross-device state unimplemented. Browser local storage is neither encrypted nor large-book durable storage. Temporary viewport reset and task preview/server closed after verification. No other apps/tasks were operated.

---

## 0.2.0-dev — 2026-10-26

Scope: bounded local teaching foundation, offline adapter contracts, evaluation materials and UI recovery. This is a development branch awaiting review. No live model call, production deployment, payment or learner-outcome study was performed.

### Automated checks

On macOS with Node **v24.14.1**, `npm run check`, `npm run eval:check` and **all 34 tests in `npm test` passed**. Checks cover syntax; matching book/teaching versions; six separated evaluation cases; legacy demo compatibility; HTTP validation/source isolation; local Host/origin constraints; provider request/output/usage contracts; sanitized configuration/quota/rate-limit/provider errors; malformed/truncated/oversized output; canonical server history; duplicate pending/completed requests; explicit retry; cancellation, expiry, shutdown and timeout; session/context/resource/concurrency bounds; late browser responses; uncertain-response replay before edited text; and local-store failure preserving current work. Synthetic fixtures identify themselves; their `real-ai` wire-label assertion is protocol coverage, not a live call.

The independent review identified that an HTTP server's `close` event fires after active connections finish, so the original shutdown test only exercised the session manager. A new real-HTTP regression reproduced the defect. HTTP `server.close(callback)` now aborts teaching before native connection draining, and shutdown cancellation responses close their connection. The regression verifies synchronous provider abort, the actual cancellation response and completion of the native close callback; a second HTTP test verifies that cancelling one session allows another request to finish normally. Session-manager tests also reject new work after terminal shutdown. These tests use offline fixtures only.

The initial sandbox prevented loopback socket listening. The test suite was then run with permission to create temporary **127.0.0.1-only** listeners. It used no external model/network fixtures or new dependencies. A lifetime/timeout classification race found in the added test was fixed before the final passing run.

### Browser checks

The Mac's native UI was locked. A supported hidden **ChatGPT in-app Chromium** preview worked independently; no unlocking or other app interaction was attempted. The temporary project server used a random loopback port with `OLB_AI_ENABLED=false`. Existing Chrome tabs, SketchUp and unrelated tasks were left alone.

| Requested viewport | Checked flow | Result |
| --- | --- | --- |
| 1440 × 1000 | Reading, concept answer, role-play start/two turns, keyboard Enter/Tab/send | No horizontal page overflow; focus returns to labelled response input |
| 390 × 844 | Third role-play turn, self-check feedback, new round, cancel with retained text, unconfigured AI | No horizontal overflow; new round clears prior dialogue on successful creation; unconfigured state is explicit |
| 320 × 740 | One 2,000-character unbroken reply; form labels; creator save/long preview | Page content width equals scroll width (305px excluding scrollbar); each reply width equals scroll width; current draft retained |
| 768 × 1024 | Restored creator draft, Enter to preview | No horizontal overflow (753px excluding scrollbar); keyboard focus moves into preview |

Successful creator save/preview and draft recovery after refresh were exercised with synthetic text. The browser JSON export test triggered an optional download approval and a long tool wait. A path was eventually returned, but approval/file completion was not independently verified; **browser download remains unverified**. The optional preview was closed and no alternate download route or retry was used. Pure JSON export behavior was preserved from the prototype. The temporary viewport was reset.

Browser-save denial/quota and damaged stored JSON were exercised in offline contract tests, not by changing browser security settings. The reading/reflection/creator storage key remains `olb.prototype.v1`. Full assistive-technology testing, hardware phones/soft keyboards, Safari/Firefox, production networking and real model quality are not verified.

Evidence contains only the demonstration text and synthetic learner replies:

- [Desktop reading/practice screenshot](verification/desktop-1440.jpg)
- [Phone completed scripted practice screenshot](verification/phone-390.jpg)

### Remaining gates

- **#1:** supplier/model snapshot, legal project-specific configuration and a specifically authorized bounded live call/spend pilot. No other project's secrets were inspected. Use docs/AI_ADAPTER.md for the exact contract.
- **#2:** frozen model/baseline comparison, independent learner attempts with consent, and reviewer evidence. Dataset validation and output flags do not establish learning benefit.
- **#3:** optional browser JSON-download approval/completion, hardware/assistive-technology coverage and independent review.
- **#8:** walkthrough implementation is ready for maintainer review; no public announcement or invitation was sent.

No issue was closed, main was not merged and no production deployment was attempted.

---

## Foundation record (0.1.0)

Date: 2026-10-26. Scope: local prototype, not a deployed production service.

## Automated

`npm run check` passed JavaScript syntax and sample-content checks. `npm test` passed eight meaningful tests covering HTTP serving, disclosed capability state, book loading, practice-contract validation, malformed requests, source-file isolation, scenario progression, and reflection output without fabricated ability scores.

## Browser

The browser successfully opened the real running preview. The bookshelf, chapter navigation, correct-choice explanation, local reading progress, initial scenario, three learner turns, and end-of-scenario reflection were exercised. The creator workspace accepted a sample draft, saved it, and rendered a preview. Desktop layout was visually inspected.

The preview launcher supplies `--host` and `--port`; support for those options was added after its first startup failure. The repaired preview became healthy.

Phone-specific viewport inspection, full accessibility review, real model quality, durable multi-user storage, payments, and learning-outcome evaluation are not verified by this prototype record.

## External delivery

The public GitHub repository kavadream/open-learning-books was created by the owner. Read and write access was confirmed on 2026-10-26 after repository access was updated. All 35 source files were verified on main at commit 1b5e89745ab7ae19420f454bbce8f45054cbc1ef. Eight initial development issues were created (#1–#8). The [GitHub Actions verification run](https://github.com/kavadream/open-learning-books/actions/runs/40257054620) completed successfully for that application commit. Source delivery and task filing are recorded in docs/ROADMAP.md and GitHub Issues. This does not verify an externally deployed production website.
