# Contributing

Open Learning Books welcomes software, teaching, content, design, translation, and evaluation contributions.

## First contribution

1. Read README.md and docs/ROADMAP.md.
2. Run `npm start` and try the chapter, practice, and creator draft flows.
3. Open an issue with one concrete problem or proposal. For a small fix, an early draft pull request is welcome.
4. Explain the user problem, proposed behavior, and how it can be checked.
5. Keep the change focused and run the relevant checks.

GitHub Issues is the working task list; docs/backlog.json preserves the founding task scopes. We use `good first issue` and `help wanted` for bounded tasks once maintainers have scoped them.

## Development

Node.js 22+ is sufficient. No API key is needed for the scripted demonstration.

```bash
npm run dev
npm run check
npm test
```

## Teaching and content proposals

Describe the learner, concrete learning objective, source basis, example scenario, likely misunderstanding, proposed practice, and feedback criteria. Identify which statements are research findings, author interpretations, or original hypotheses. Mark invented scenarios clearly.

Avoid uploading another author's full book, private learner transcripts, or unreviewed claims of learning effectiveness. Contributions to sample content must explain the reuse permissions the contributor intends to grant; the software license does not automatically cover book content.

## Pull requests

Use the pull request template. Include the problem and resulting behavior, relevant validation, and any material limitation. For UI changes, describe the tested viewport and accessibility behavior. Do not add dependencies or change the application architecture without explaining why.

Maintainers decide scope and merge readiness. Opening an issue or contributing code does not guarantee payment or access to private user data. Bounties, credit rewards, and paid work must be explicitly agreed and funded before work begins.
