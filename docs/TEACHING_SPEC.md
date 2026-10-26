# Book and teaching contract

## A book package

A book should identify its schema version, ID, title, creator attribution, language, audience, publication state, learning goals, source basis, and chapters. A chapter contains ordered learning units. A unit can contain reading, a concept check, an open response, a scenario, and reflection.

Current examples are in content/books/. The prototype JSON shape is provisional; exported local creator drafts do not imply online publication or a completed teaching configuration.

## A teaching configuration

Each practice should specify the learner's task, AI role, stable scenario facts, possible misconceptions, prompting strategy, feedback criteria, completion conditions, and appropriate next task. Private simulator state belongs on the server in a real AI implementation.

Modes should be explicit: explanation, question, role-play, feedback, and independent transfer. Do not have a role character reveal all feedback while it is supposed to be realistically responding in the scenario.

## Feedback

Use observable evidence: a phrase the learner used, a question asked, an omitted condition, or an action that does not follow from the available information. Allow multiple reasonable choices. Do not invent personality, emotional-intelligence, clinical, or relationship-success scores.

Help can increase when needed: invitation to try, a useful hint, an example, an explanation, and then an independent attempt. A permanently evasive tutor that only asks questions is not a design goal.

## Evaluation set

For each pilot unit, maintain unfamiliar cases, counterexamples, common mistakes, good alternative responses, uncertainty cases, and failure cases. Separate development examples from cases used to compare versions. Include checks for ungrounded judgments, unconditional agreement, inconsistent role behavior, and premature answer-giving.

## Current demonstration

The fixed scenario reveals duplicate recording, missing late-shift equipment, and training needs over three turns. Feedback is a checklist for self-review, not an AI judgment of the learner. The mode is returned by the API and shown in the UI.

## 0.2.0-dev contracts and evaluation

The public book package now declares `version`; `content/teaching/human-nature.zh-CN.json` identifies its own version and the matching book version. Configurations define allowed modes, objective, criteria and, for the warehouse scenario, stable facts/role behavior. Only the selected unit's material is sent by the adapter; arbitrary exported creator drafts are not executable configurations.

Explanation, role-play and feedback are explicit validated modes. The default demo uses fixed excerpts/checklists; a configured model reply is labelled `real-ai` only after a successful provider response. Feedback objects require exact learner quotes, comments and next steps. Structural quote checks do not establish semantic fairness. Role-play cannot return coaching feedback objects.

The first-unit [evaluation protocol](../evals/facts-and-stories/PROTOCOL.md) defines six unfamiliar cases, split separation, reasonable disagreement, unsupported-judgment and factual consistency checks, and one unaided transfer task. `npm run eval:check` validates materials and can flag suspect local outputs without a model call. No actual comparison, learner-result collection or learning-effect estimate has been run.
