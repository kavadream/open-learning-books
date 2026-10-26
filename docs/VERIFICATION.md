# Verification record

## 0.2.0-dev — 2026-10-26

Scope: bounded local teaching foundation, offline adapter contracts, evaluation materials and UI recovery. This is a development branch awaiting review. No live model call, production deployment, payment or learner-outcome study was performed.

### Automated checks

On macOS with Node **v24.14.1**, `npm run check`, `npm run eval:check` and **all 32 tests in `npm test` passed**. Checks cover syntax; matching book/teaching versions; six separated evaluation cases; legacy demo compatibility; HTTP validation/source isolation; local Host/origin constraints; provider request/output/usage contracts; sanitized configuration/quota/rate-limit/provider errors; malformed/truncated/oversized output; canonical server history; duplicate pending/completed requests; explicit retry; cancellation, expiry, shutdown and timeout; session/context/resource/concurrency bounds; late browser responses; uncertain-response replay before edited text; and local-store failure preserving current work. Synthetic fixtures identify themselves; their `real-ai` wire-label assertion is protocol coverage, not a live call.

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
