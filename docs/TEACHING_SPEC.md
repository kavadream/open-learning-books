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
