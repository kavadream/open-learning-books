# Open Learning Books

**Read, question, practice, and create books that can teach.**

一个开放的互动学习与创作平台。创作者共同设计正文、学习目标、练习、教学 AI 行为与反馈；读者在阅读中提问、尝试、复盘，并将所学带到新的情境。

Project inception: **2026-10-26** · Current version: **0.1.0 prototype**

## 正式书籍目录

| 书籍与版本 | 阅读与下载 |
| --- | --- |
| [理解人性：关系、边界与合作](https://github.com/kavadream/understanding-human-relations) · KK 著 · 中文正式版 v1.0.0 | [中文版本说明](https://github.com/kavadream/understanding-human-relations/releases/tag/zh-v1.0.0) · [EPUB](https://github.com/kavadream/understanding-human-relations/releases/download/zh-v1.0.0/understanding-human-relations_zh-CN_v1.0.0.epub) · [PDF](https://github.com/kavadream/understanding-human-relations/releases/download/zh-v1.0.0/understanding-human-relations_zh-CN_v1.0.0.pdf) |
| Understanding Human Nature · English translation preview v0.1.0 | [英文预发布说明](https://github.com/kavadream/understanding-human-relations/releases/tag/en-v0.1.0-preview) · [English EPUB](https://github.com/kavadream/understanding-human-relations/releases/download/en-v0.1.0-preview/English_Understanding_Human_Nature_preview.epub) · [English PDF](https://github.com/kavadream/understanding-human-relations/releases/download/en-v0.1.0-preview/English_Understanding_Human_Nature_preview.pdf) · [完整英文初译](https://github.com/kavadream/understanding-human-relations/blob/main/translations/en/book.md) |

中文版含完整六部17章、来源说明及版权页，仍为正式最新版。英文完整17章初译现以预览版发布，尚未经过人类目标语审阅。作者的母语是中文，欢迎英语母语读者通过书籍仓库的 Issues 或 pull request 协助校正。免费阅读与完整文件非商业转发按书籍仓库的许可执行。

每本书在独立内容仓库维护，其中的中英文共用该书仓库。平台内现有示例仍为下文说明的固定脚本原型。

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
npm test
```

## What works today

- Responsive Chinese-first bookshelf and reading experience.
- One demonstration chapter from 人性的弱点升级版, split into three learning units.
- A concept question with explanatory feedback.
- A three-turn, **explicitly scripted** role-play with reflection prompts.
- Device-local reading progress and a written reflection.
- A creator workspace with local draft saving, preview, and JSON export.
- A small Node HTTP API with request validation and automated tests.

The practice conversation is **not generative AI**. It is a fixed teaching scenario for evaluating the user experience. No external AI is called, no payments are taken, and no real credits are issued. Drafts, reflections, and reading progress remain in the current browser; they do not sync across devices. Submitted role-play turns are processed by the local demo server without durable session storage.

## What we are building toward

1. A shared teaching engine with book-specific content, learning objectives, scenarios, and feedback criteria.
2. A creator workspace that helps subject experts design, preview, and publish good learning experiences.
3. Learner-controlled progress and practice records across books.
4. Transparent AI usage, internal learning credits, and creator compensation supported by real revenue.
5. An open community contributing software, teaching designs, scenarios, translations, and evaluations.

Accounts, durable storage, real AI and voice, publishing, payments, and creator payouts are **planned**, not implemented. A tradable token is an undecided, separate proposal; this repository does not issue one.

## Start here

- [Project charter](docs/PROJECT_CHARTER.md) — vision, scope, and decisions grounded in the founding discussion.
- [Product requirements](docs/PRD.md) — user workflows and initial acceptance criteria.
- [Roadmap](docs/ROADMAP.md) — phased delivery and validation gates.
- [Architecture](docs/ARCHITECTURE.md) — current implementation and future boundaries.
- [Book and teaching specification](docs/TEACHING_SPEC.md) — content, scenarios, and teaching behavior.
- [Operating model](docs/ECONOMICS.md) — consumption credits, costs, and creator compensation.
- [Decisions](docs/DECISIONS.md) — accepted working choices and open questions.
- [Research starting points](docs/RESEARCH.md).
- [Full sample chapter](content/samples/chapter-07.zh-CN.md).
- [GitHub development tasks](https://github.com/kavadream/open-learning-books/issues) and [founding task scopes](docs/backlog.json).
- [Contributor guide](CONTRIBUTING.md) and [agent instructions](AGENTS.md).

## Repository layout

```text
public/          Responsive UI and browser-local prototype state
lib/             Content loading and scripted teaching behavior
content/         Versioned example books and sample chapter
docs/            Product, teaching, architecture, and operating decisions
tests/           HTTP and teaching contract tests
.github/         Issue forms, pull request template, and CI
server.mjs       Local HTTP entry point
```

## How to participate

We welcome developers, educators, writers, designers, translators, and learning researchers. Start with a reproducible bug, a narrowly scoped improvement, a scenario with an explicit learning goal, or a proposal for a short teaching-focused book. Read [CONTRIBUTING.md](CONTRIBUTING.md) before a large change.

Learning quality matters more than text volume or chat duration. A book may have multiple reasonable answers; feedback should explain evidence and conditions rather than invent personality scores.

## License and content

Software is released under the [MIT License](LICENSE). The `content/` directory has [separate terms](content/LICENSE.md). The repository contains original teaching examples, not full copies of the reference books. Private learner data, credentials, and production records do not belong in this repository.
