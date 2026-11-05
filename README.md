# Open Learning Books

**Read, question, practice, and create books that can teach.**

一个开放的互动学习与创作平台。创作者共同设计正文、学习目标、练习、教学 AI 行为与反馈；读者在阅读中提问、尝试、复盘，并将所学带到新的情境。

Project inception: **2026-10-26** · Current development version: **0.3.0-dev** (draft PR; real-AI pilot pending)

## 正式书籍目录

| 书籍与版本 | 阅读与下载 |
| --- | --- |
| [理解人性：关系、边界与合作](https://github.com/kavadream/understanding-human-relations) · KK 著 · 中文修订版 v1.0.1 | [本版说明](https://github.com/kavadream/understanding-human-relations/blob/e99afdf5d40f551bdb2fa11331e59d652ad61783/RELEASE-NOTES-zh-v1.0.1.md) · [EPUB](https://raw.githubusercontent.com/kavadream/understanding-human-relations/e99afdf5d40f551bdb2fa11331e59d652ad61783/dist/zh-v1.0.1/理解人性_关系边界与合作_读者版.epub) · [PDF](https://raw.githubusercontent.com/kavadream/understanding-human-relations/e99afdf5d40f551bdb2fa11331e59d652ad61783/dist/zh-v1.0.1/理解人性_关系边界与合作_读者版.pdf) · [历史 v1.0.0](https://github.com/kavadream/understanding-human-relations/releases/tag/zh-v1.0.0) |
| Understanding Human Nature · English translation preview v0.1.0 | [英文预发布说明](https://github.com/kavadream/understanding-human-relations/releases/tag/en-v0.1.0-preview) · [English EPUB](https://github.com/kavadream/understanding-human-relations/releases/download/en-v0.1.0-preview/English_Understanding_Human_Nature_preview.epub) · [English PDF](https://github.com/kavadream/understanding-human-relations/releases/download/en-v0.1.0-preview/English_Understanding_Human_Nature_preview.pdf) · [完整英文初译](https://github.com/kavadream/understanding-human-relations/blob/main/translations/en/book.md) |

中文版 v1.0.1 含完整六部17章、来源说明及版权页，仅补足必要的虚构场景背景和时间线；旧版保留。英文预览尚未同步本次中文补充。英文完整17章初译现以预览版发布，尚未经过人类目标语审阅。作者的母语是中文，欢迎英语母语读者通过书籍仓库的 Issues 或 pull request 协助校正。免费阅读与完整文件非商业转发按书籍仓库的许可执行。

每本书在独立内容仓库维护，其中的中英文共用该书仓库。平台内现有示例仍为下文说明的固定脚本原型。

### 《理解人性》的正式 AI 学习入口

本书直接与AI开始学习时，应先提供对应章完整正式原文，含作者分析、结论及来源说明；长文可按原顺序分段连续给出，不能把摘要、三单元演示或训练决策切片冒称全章。全文已提供也不代表读者确认读完或理解；用户可暂停、跳过或选择训练。

正式入口为书籍仓库的[阅读与训练指南](https://github.com/kavadream/understanding-human-relations/blob/main/learning/README.md)。AI直接按用户指定展示章号读取，只有未指定才默认第一章；不先下载第一章、全书索引或原练习。已发现 `books_read_chapter` 时直接用 `{chapter:2,part:1}`，按返回的 next_request 真实续读；`part:"all"` 可取所选章全文一次。客户端未发现新工具时不伪造调用，仍可用既有 `books_get_unit` 指定所选 unit_id 与 `material:"chapter"`。无接口时按[完整源路由](https://github.com/kavadream/understanding-human-relations/blob/main/learning/reading.json)读取完整 Markdown。短块、HTTP或文字完整都不能证明实时语音逐字，口述应另行验收。

完整原文之后由读者选择[新编训练](https://github.com/kavadream/understanding-human-relations/blob/main/learning/index.json)。收到实质回答，AI先具体说明哪些判断有依据及其理由，及时纠正重要推断跳跃；追问须带来新理解，不能每轮机械提问。理由充分可小结并选择应用、[证据回顾](https://github.com/kavadream/understanding-human-relations/blob/main/learning/mastery-recap.json)或结束，不诊断人格或推定现实能力。详见[回应与停止规则](https://github.com/kavadream/understanding-human-relations/blob/main/learning/response-feedback.json)。私人回答和进度只留当前对话，不上传后端。

下方What works today中的三单元、固定脚本角色演示属于历史原型，不是《理解人性》正式17章全书，也不是新试点阅读入口。本次仅修正此书入口说明，未替换原型阅读器或扩展其他书。


## 已通过内容验收的书籍

以下七书均由KK署名、使用AI辅助撰写，**内容已获作者验收**，全部可公开浏览；沿用现有 v0.1 版本号。七书均已提供完整的AI辅助英文翻译预览；英文尚未经过人类目标语审阅，待英语母语者校正。作者KK的母语是中文，欢迎英语母语读者通过各书Issues或pull request协助修正。当前提供Markdown源码与连续阅读稿，未制作这七书的PDF或EPUB。

| 书籍 | 内容验收状态 | 中文阅读与反馈 | 英文翻译预览 |
| --- | --- | --- | --- |
| [把话说清楚：普通人的关键对话](https://github.com/kavadream/clear-conversations) | draft v0.1 · 12章 · 内容已获作者验收 | [完整中文初稿](https://github.com/kavadream/clear-conversations/blob/9b83758f8b92ede2558e35b59c83a39dc056f63c/dist/reader-manuscript.md) · [目录](https://github.com/kavadream/clear-conversations/blob/9b83758f8b92ede2558e35b59c83a39dc056f63c/README.md#阅读) · [反馈](https://github.com/kavadream/clear-conversations/issues) | [English](https://github.com/kavadream/clear-conversations/blob/368c810dbbe43a91d06f5f59cd4b590ac8d24359/translations/en/book.md) · [目录与纠错](https://github.com/kavadream/clear-conversations/blob/368c810dbbe43a91d06f5f59cd4b590ac8d24359/translations/en/README.md) |
| [在不确定中做选择](https://github.com/kavadream/choices-under-uncertainty) | draft v0.1 · 12章 · 内容已获作者验收 | [完整中文初稿](https://github.com/kavadream/choices-under-uncertainty/blob/a257e557d0db2215e12be4cd583dcb7d37341028/BOOK.md) · [目录](https://github.com/kavadream/choices-under-uncertainty/blob/a257e557d0db2215e12be4cd583dcb7d37341028/README.md#目录) · [反馈](https://github.com/kavadream/choices-under-uncertainty/issues) | [English](https://github.com/kavadream/choices-under-uncertainty/blob/88be7565d652121a4be38c8f216946851b1ae302/translations/en/book.md) · [目录与纠错](https://github.com/kavadream/choices-under-uncertainty/blob/88be7565d652121a4be38c8f216946851b1ae302/translations/en/README.md) |
| [把想做的事做下去](https://github.com/kavadream/follow-through-in-daily-life) | draft v0.1 · 14章 · 内容已获作者验收 | [完整中文初稿](https://github.com/kavadream/follow-through-in-daily-life/blob/03c81f5a03dd76793f2c91e050e109d4ca9c1311/BOOK.md) · [目录](https://github.com/kavadream/follow-through-in-daily-life/blob/03c81f5a03dd76793f2c91e050e109d4ca9c1311/TOC.md) · [反馈](https://github.com/kavadream/follow-through-in-daily-life/issues) | [English](https://github.com/kavadream/follow-through-in-daily-life/blob/a493690d7951396be0225c5d4b40473b089e48a3/translations/en/book.md) · [目录与纠错](https://github.com/kavadream/follow-through-in-daily-life/blob/a493690d7951396be0225c5d4b40473b089e48a3/translations/en/README.md) |
| [人情与规则：熟人社会里的现代生活](https://github.com/kavadream/social-ties-and-rules) | draft v0.1 · 12章 · 内容已获作者验收 | [完整中文初稿](https://github.com/kavadream/social-ties-and-rules/blob/bf73c52c8f96d52244e9429235be9e236a7e37ac/BOOK.md) · [分章](https://github.com/kavadream/social-ties-and-rules/tree/bf73c52c8f96d52244e9429235be9e236a7e37ac/manuscript) · [来源](https://github.com/kavadream/social-ties-and-rules/blob/bf73c52c8f96d52244e9429235be9e236a7e37ac/sources/READING-NOTES.md) · [反馈](https://github.com/kavadream/social-ties-and-rules/issues) | [English](https://github.com/kavadream/social-ties-and-rules/blob/d1875f8832d3ecbad2590b1a5fe6108103ba781d/translations/en/book.md) · [目录与纠错](https://github.com/kavadream/social-ties-and-rules/blob/d1875f8832d3ecbad2590b1a5fe6108103ba781d/translations/en/README.md) |
| [两个人的日常：亲密关系中的协商与修复](https://github.com/kavadream/two-peoples-daily-life) | draft v0.1 · 14章 · 内容已获作者验收 | [完整中文初稿](https://github.com/kavadream/two-peoples-daily-life/blob/6de1fffc1d23cf3345374c3d2662a0bdefbec867/BOOK.md) · [分章](https://github.com/kavadream/two-peoples-daily-life/tree/6de1fffc1d23cf3345374c3d2662a0bdefbec867/manuscript) · [来源](https://github.com/kavadream/two-peoples-daily-life/blob/6de1fffc1d23cf3345374c3d2662a0bdefbec867/sources/REFERENCES.md) · [反馈](https://github.com/kavadream/two-peoples-daily-life/issues) | [English](https://github.com/kavadream/two-peoples-daily-life/blob/11a527634dced1be4228d60e7889d9eea199ac2f/translations/en/book.md) · [目录与纠错](https://github.com/kavadream/two-peoples-daily-life/blob/11a527634dced1be4228d60e7889d9eea199ac2f/translations/en/README.md) |
| [一家人怎样共同成长](https://github.com/kavadream/growing-together-as-family) | draft v0.1 · 13章 · 内容已获作者验收 | [完整中文初稿](https://github.com/kavadream/growing-together-as-family/blob/b6c3cb1e7fc44800b669c943054466e1b088790b/BOOK.md) · [分章](https://github.com/kavadream/growing-together-as-family/tree/b6c3cb1e7fc44800b669c943054466e1b088790b/chapters) · [来源](https://github.com/kavadream/growing-together-as-family/blob/b6c3cb1e7fc44800b669c943054466e1b088790b/sources/README.md) · [反馈](https://github.com/kavadream/growing-together-as-family/issues) | [English](https://github.com/kavadream/growing-together-as-family/blob/614230116e1bb504ccbf2ad22e042d729de2df33/translations/en/book.md) · [目录与纠错](https://github.com/kavadream/growing-together-as-family/blob/614230116e1bb504ccbf2ad22e042d729de2df33/translations/en/README.md) |
| [不被一种活法困住](https://github.com/kavadream/beyond-one-way-of-life) | draft v0.1 · 14章 · 内容已获作者验收 | [完整中文初稿](https://github.com/kavadream/beyond-one-way-of-life/blob/85f2fbfb3a82f9a959879d8588721302f466c5b1/BOOK.md) · [分章](https://github.com/kavadream/beyond-one-way-of-life/tree/85f2fbfb3a82f9a959879d8588721302f466c5b1/chapters) · [来源](https://github.com/kavadream/beyond-one-way-of-life/blob/85f2fbfb3a82f9a959879d8588721302f466c5b1/sources/README.md) · [反馈](https://github.com/kavadream/beyond-one-way-of-life/issues) | [English](https://github.com/kavadream/beyond-one-way-of-life/blob/155394124b6b1dd7c7f1319147c6bd25b01277cf/translations/en/book.md) · [目录与纠错](https://github.com/kavadream/beyond-one-way-of-life/blob/155394124b6b1dd7c7f1319147c6bd25b01277cf/translations/en/README.md) |

中英文阅读链接分别固定到对应提交，便于按版本反馈。各书保留来源与实际读取范围、AI辅助说明和独立版权条款；阅读、下载与转发请遵守各书版权说明，公开阅读不等于开放许可。正文和版权文件保留首稿时的原有文字，当前内容验收状态以各仓README和元数据为准。作者内容验收不代表专业审定或读者效果已验证。

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

