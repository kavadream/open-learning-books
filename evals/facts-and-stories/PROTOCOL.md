# First-unit evaluation protocol (v0.1.0)

This is a proposed evaluation set and review process, not learner-result evidence. All scenarios and development responses are invented. The six cases target the first unit, **先分清事实与解释**, in book `human-nature@0.1.0` and teaching configuration `0.1.0`.

## Keep development and comparison separate

Use `development.json` to improve prompts and inspect the three contrasting synthetic mistake/alternative pairs. Freeze the adapter, system rules, teaching version and selected model snapshot before opening `comparison.json` for a version comparison. Comparison cases must never be inserted into runtime prompts, demonstrations or a creator's public sample. They are public in this repository, so they are an engineering holdout rather than a secure assessment bank. Replace contaminated cases and increment the evaluation version. Do not train against a comparison result and then present the same cases as unseen.

The two comparison cases and one independent transfer case use contexts different from the warehouse. Score the independent task without AI, hints, prior feedback or examples. Collect the learner's answer before any assistance. A later assisted response must be recorded separately.

## Evidence-based rubric

For each dimension use **0 = absent/contradicted**, **1 = partial**, **2 = clear and supported**, or **NA = insufficient evidence**. Record an exact answer quote and the relevant case fact alongside every judgment. This rubric describes this response, not a person's personality or general ability.

| Dimension | Evidence to look for | Do not reward |
| --- | --- | --- |
| Observation | Separates given observations and reported claims from motive inference | Repeating a guessed motive as fact |
| Competing explanations | Leaves plausible alternatives open and states what is unknown | Requiring a single preferred interpretation |
| Information value | A concrete question or verification step would distinguish alternatives | Polite but uninformative questions |
| Conditional action | Next action respects known constraints and permits revision | Unconditional compliance or agreement |

A justified refusal, postponement, boundary or different sequence can receive full credit. Treat a report as a report: it is a fact that a person *said* a device failed; the device failure may still need verification. No aggregate mastery threshold is established yet.

## Model feedback and role checks

1. Feed only the case scenario/task and the consented or synthetic learner answer to the frozen candidate and baseline. Keep reviewer-only facts, alternative answers and checks out of the prompt. The script/reading-only experience is the labelled baseline; fluent text alone is not the outcome.
2. Inspect each `consistencyChecks` item: does the model contradict known facts, silently replace a report with certainty, invent a motive, or accept a false premise? For the warehouse role, repeat the same factual probes across turns and verify duplicate recording, absent late-shift equipment and training needs remain consistent. Praise alone must not erase these conditions.
3. Check feedback evidence quotes against the actual answer. Check semantic interpretations manually even when quotes match. Review unsupported judgments and unconditional agreement, premature coaching in role-play, and answers that disclose the independent solution too early.
4. Record malformed output, missing usage, rate limits, quotas, timeouts, cancellation, retries and actual provider usage separately from answer quality. A failed call is not a successful exercise. Record missing usage as unknown, never zero.
5. Randomize and blind candidate/baseline order where feasible. Have two independent reviewers assess a small subset, retain their disagreements and reconcile with case evidence. Report denominator, missing answers, assistance and reviewer uncertainty. Do not invent numerical results before collecting them.

## Local tooling and future report

`npm run eval:check` checks completeness, split separation and the independent task. It performs no model call. Optionally run `npm run eval:check -- runtime/review-records.json` to flag suspicious output from a locally stored JSON array:

```json
[{"caseId":"your-case-id","reply":"model text","feedback":[{"evidence":"exact quote","comment":"observation","nextStep":"suggestion"}],"learnerTexts":["actual or synthetic answer"]}]
```

Flags are a review aid; a clean flag list is **not** evidence of correctness or learning. Keep private answers and raw outputs in ignored `runtime/` with consent and a retention decision. Never commit them. A real report must identify book/config/evaluation versions, provider/model snapshot, date, prompt/code commit, baseline, conditions, sample size, assistance, exclusions, per-case evidence, reviewer agreement, uncertainty and actual usage/cost source. Any immediate or delayed transfer claim requires actual independent learner attempts. None have been run for this change.
