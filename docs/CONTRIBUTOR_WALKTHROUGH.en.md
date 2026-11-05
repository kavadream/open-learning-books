# Try Open Learning Books and make a first contribution

Open Learning Books is a Chinese-first, open-source prototype for books that combine reading, practice and teaching design. The reader interface intentionally stays in Chinese. You can contribute software or teaching cases in English and discuss how to adapt them with maintainers.

Today it offers one original demonstration chapter, a concept question, a fixed three-turn warehouse role-play, reading/reflection records in the current browser, and a local creator draft/preview/JSON export. The development branch adds explicit explanation/role-play/feedback modes, a bounded server-side adapter contract and an offline evaluation set. **Default interactions are scripted, not a real AI tutor.** No model supplier or paid account is configured by the repository. Accounts, cross-device sync, publishing, billing and creator payouts are not delivered. No learning benefit has yet been measured.

## Run it locally

Use Node.js 22 or newer. There are no third-party runtime or development package dependencies to install.

```bash
git clone https://github.com/kavadream/open-learning-books.git
cd open-learning-books
npm run check
npm test
npm run eval:check
npm start
```

Open `http://127.0.0.1:3000`. If the port is in use, run `node server.mjs --port 3002`. The host defaults to loopback. No API key is needed. Tests use synthetic/offline providers, never a paid API.

## Walk through the sample

1. Choose **开始体验** (start) or **打开这本书** (open the book). The chapter is **为什么有道理的话别人却听不进去**. The full original sample is [chapter 07](../content/samples/chapter-07.zh-CN.md).
2. In **先分清事实与解释** (facts and interpretations), open **可选：提问 / 练习** under that section, then choose B: the blank system records are directly given, while the suggested motives are inferences. Read the feedback. **记录为已读** saves reading progress locally, not an ability score.
3. In **问清楚对方在反对什么** (ask before judging), open that section’s optional tools and leave **练习服务** on **脚本演示** and **教学模式** on **角色演练**. Choose **开始练习**. Respond three times. The script reveals duplicate entry, missing late-shift equipment and training needs regardless of the wording you choose. Its final checklist is self-review, not adaptive feedback or a personality rating.
4. Try **解释** (explanation) and **依据反馈** (evidence feedback). Their demo outputs are fixed excerpts/prompts. Selecting **真实 AI** and starting with no server configuration shows a clear unconfigured message; it does not silently call another service.
5. In **换一种关系再试一次** (transfer), write a question about the friend/job scenario and explain what it would help you learn. **保存思考** stores it only in this browser. This is practice, not an evaluated research result.

Use Tab, Shift+Tab and Enter to navigate and activate controls. Inputs have labels; conversation output flows with the page. Cancelling preserves current text; a new round resets the conversation only after its new session is created. Input survives a failed request in the open page. A refresh does not restore the temporary conversation.

## Walk through the creator flow

Open **创作空间**. Fill **作品名称** (title), **你希望帮助谁** (audience), **读完以后，读者能做什么** (observable objective) and **第一个小节** (first unit). Choose **保存草稿**, then **预览我的草稿**. Use **导出作品 JSON** to obtain a local file. It is a draft export, not a published book or a complete AI configuration. A browser-save warning leaves the current draft in memory so you can export or copy it before closing. Do not use private learner records or copied full books as sample content.

## One teaching contribution

Propose an invented scenario where a delayed submission could have several explanations. Identify the facts, unknowns, one common mistaken inference, two reasonable alternative responses, an information-seeking question and feedback criteria. Include a justified disagreement that should be accepted. The [development evaluation cases](../evals/facts-and-stories/development.json) show this structure. Work on development cases; preserve the [comparison protocol](../evals/facts-and-stories/PROTOCOL.md) and never claim learning improvement from a fluent answer. Explain your intended content reuse permission; the MIT software license does not automatically license every book.

## One code contribution

A useful bounded change is to reproduce a request failure and improve recovery without losing the user's draft. Add a failing contract/race test in `tests/client.test.mjs` or `tests/sessions.test.mjs`, fix the relevant state transition, and run the checks above. For layout work, record the browser, viewport, keyboard path, screenshot and any remaining limitations. No external AI key is required for either example.

Read [CONTRIBUTING.md](../CONTRIBUTING.md) and [AGENTS.md](../AGENTS.md), choose one [issue](https://github.com/kavadream/open-learning-books/issues), branch from current main and open a small draft PR with the problem, resulting behavior, evidence and limitations. Keep private data, `.env`, raw research transcripts and runtime exports out of commits. Maintainers review scope and merge readiness; contribution does not imply payment or production access.

## Package and continuous reader increment (0.3.0-dev)

Use the single [package and three-layer acceptance specification](TEACHING_SPEC.md) for new contributions. `npm run package:check` validates the 1.0.0 public examples without calling a model or approving content. Read-only and question-answering books need no role-play. Legacy creator JSON remains a draft requiring migration, not an automatically publishable package.

Open **公开多章节阅读演示** on the shelf to try complete chapter text, **下一章** navigation, optional teaching and local position recovery. Private 1.0.0 packages can be selected or pasted through **本机导入 JSON**; this browser-only path does not upload text and uses fixed local teaching scripts. Different versions keep separate records; explicit position adoption copies no completion/reflection. Review, AI teaching evidence and publishing remain separate unimplemented gates. Do not test with private manuscripts in a public contribution.
