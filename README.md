# Open Learning Books

**Read, question, practice, and create books that can teach.**

一个开放的互动学习与创作平台。创作者共同设计正文、学习目标、练习、教学 AI 行为与反馈；读者在阅读中提问、尝试、复盘，并将所学带到新的情境。

Project inception: **2026-10-26** · Current development version: **0.3.0-dev** (draft PR; real-AI pilot pending)

## Quick start

Requires Node.js 22 or newer. This prototype has no third-party runtime dependencies.

```bash
npm start
```

Open `http://127.0.0.1:3000`. To develop with automatic server restarts:

```bash
npm run dev
```

To verify the project:

```bash
npm run check
npm run package:check
npm test
```

## What works today

- Responsive Chinese-first, multi-book shelf with chapter navigation and continuous chapter reading.
- Per-book/version local position, completion and reflection recovery.
- Browser-only private package import with atomic validation/save and no upload route; private teaching uses local scripts only.
- Version 1.0.0 package/acceptance schemas and offline checking, with separate format/content/AI states.
- One demonstration chapter from 人性的弱点升级版, split into three learning units.
- A concept question with explanatory feedback.
- A three-turn, **explicitly scripted** role-play with reflection prompts.
- Device-local reading progress and a written reflection.
- A creator workspace with local draft saving, preview, and JSON export.
- A Node HTTP API with request validation, bounded server-owned teaching sessions, cancellation and request replay.
- Explicit explanation, role-play and feedback modes, with a replaceable server-side Chat Completions adapter that is **off by default and only offline-tested**.
- Six first-unit evaluation cases with separate development/comparison sets and an unaided transfer task; no learner outcomes collected.

By default, the practice conversation is **not generative AI**. It is a fixed teaching scenario for evaluating the user experience. No external AI is called, no payments are taken, and no real credits are issued. Drafts, reflections, and reading progress remain in the current browser; they do not sync across devices. Submitted turns are processed by the local server without durable session storage; versioned teaching sessions expire after ten minutes. Real AI is a separate, explicit opt-in requiring a selected supplier/model, project-specific configuration and an authorized bounded pilot. No real model call has been made for this change. See [adapter contract and pilot gate](docs/AI_ADAPTER.md).

## Try the first reading loop

Open the **公开多章节阅读演示** card, read the full chapter text, use **下一章**, and optionally open **提问 / 练习**. The role-play and self-check are visibly scripted. Close the teaching panel to continue reading; refreshing restores the selected book/version and last section. No public internet deployment or hardware-phone test is implied.

For a private package, choose **本机导入 JSON**, then select or paste a 1.0.0 package. Validation and saving occur only in the current browser; the book is not uploaded or publicly indexed. Same-ID/version content conflicts and failed imports leave existing records intact. Different versions retain separate progress, with an explicit option to reuse a stable section position. Private real-AI integration, media and voice remain planned. Browser storage is not encrypted or cross-device; see the [canonical import/privacy and compatibility rules](docs/TEACHING_SPEC.md#6-兼容读取与本机导入).

A format check never grants content approval, teaching approval or publication. Both public fixtures show content review and AI teaching as unverified. The [three-layer process](docs/TEACHING_SPEC.md#5-三层验收入库与发布分别记录) requires real calls **and** independent reader evidence before teaching can pass; unresolved critical facts/rights/safety findings cannot be averaged away. Read-only and question-answering books need no compulsory role-play.

## What we are building toward

1. A shared teaching engine with book-specific content, learning objectives, scenarios, and feedback criteria.
2. A creator workspace that helps subject experts design, preview, and publish good learning experiences.
3. Learner-controlled progress and practice records across books.
4. Transparent AI usage, internal learning credits, and creator compensation supported by real revenue.
5. An open community contributing software, teaching designs, scenarios, translations, and evaluations.

Accounts, durable storage, a verified real-AI pilot, voice, publishing, payments, and creator payouts are **planned**, not delivered. A tradable token is an undecided, separate proposal; this repository does not issue one.

## Start here

- [Project charter](docs/PROJECT_CHARTER.md) — vision, scope, and decisions grounded in the founding discussion.
- [Product requirements](docs/PRD.md) — user workflows and initial acceptance criteria.
- [Roadmap](docs/ROADMAP.md) — phased delivery and validation gates.
- [Architecture](docs/ARCHITECTURE.md) — current implementation and future boundaries.
- [Unified book package and acceptance specification 1.0.0](docs/TEACHING_SPEC.md) — six content groups, capability levels, compatibility, and the three independent review layers.
- [Public package example](content/packages/human-nature.package.json), [multi-chapter fixture](content/packages/public-reader-demo.package.json), and [unrun acceptance template](content/packages/human-nature.acceptance.example.json).
- [Operating model](docs/ECONOMICS.md) — consumption credits, costs, and creator compensation.
- [Decisions](docs/DECISIONS.md) — accepted working choices and open questions.
- [Research starting points](docs/RESEARCH.md).
- [Full sample chapter](content/samples/chapter-07.zh-CN.md).
- [GitHub development tasks](https://github.com/kavadream/open-learning-books/issues) and [founding task scopes](docs/backlog.json).
- [Contributor guide](CONTRIBUTING.md), [English walkthrough](docs/CONTRIBUTOR_WALKTHROUGH.en.md), and [agent instructions](AGENTS.md).
- [Evaluation protocol](evals/facts-and-stories/PROTOCOL.md) and [verification record](docs/VERIFICATION.md).

## Repository layout

```text
public/          Responsive UI and browser-local prototype state
lib/            Versioned content, scripted behavior, bounded sessions and provider adapter
content/         Versioned example books and sample chapter
docs/            Product, teaching, architecture, and operating decisions
evals/          Development/comparison cases and evidence-based evaluation protocol
tests/          HTTP, adapter, session, race/recovery and evaluation contract tests
.github/         Issue forms, pull request template, and CI
server.mjs       Local HTTP entry point
```

## How to participate

We welcome developers, educators, writers, designers, translators, and learning researchers. Start with a reproducible bug, a narrowly scoped improvement, a scenario with an explicit learning goal, or a proposal for a short teaching-focused book. Read [CONTRIBUTING.md](CONTRIBUTING.md) before a large change.

Learning quality matters more than text volume or chat duration. A book may have multiple reasonable answers; feedback should explain evidence and conditions rather than invent personality scores.

## License and content

Software is released under the [MIT License](LICENSE). The `content/` directory has [separate terms](content/LICENSE.md). The repository contains original teaching examples, not full copies of the reference books. Private learner data, credentials, and production records do not belong in this repository.
