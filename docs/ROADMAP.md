# Development roadmap

## Foundation

- [x] Founding charter, product requirements, teaching contract, and operating assumptions.
- [x] Responsive local reading and creator-draft prototype.
- [x] One demonstration chapter with concept check, scripted practice, and transfer reflection.
- [x] Contributor documents, issue forms, agent instructions, and CI configuration.
- [x] Public GitHub repository creation and repository access confirmed.
- [x] Initial source upload and 35-file remote verification.
- [x] Eight scoped development tasks created as GitHub Issues #1–#8.

## Initial development issues

- [M1: Implement a bounded, server-side teaching AI adapter](https://github.com/kavadream/open-learning-books/issues/1)
- [M1: Build an evaluation set for the first learning unit](https://github.com/kavadream/open-learning-books/issues/2)
- [M1: Refine the responsive reading and practice experience](https://github.com/kavadream/open-learning-books/issues/3)
- [M2: Add identity and durable user-owned learning records](https://github.com/kavadream/open-learning-books/issues/4)
- [M2: Create a guided book editor and versioned publishing flow](https://github.com/kavadream/open-learning-books/issues/5)
- [M3: Meter real usage and validate unit economics](https://github.com/kavadream/open-learning-books/issues/6)
- [M3: Design payments, internal credits and creator settlement](https://github.com/kavadream/open-learning-books/issues/7)
- [Community: Add an English introduction and contributor walkthrough](https://github.com/kavadream/open-learning-books/issues/8)

## Current development increment (0.2.0-dev, awaiting review)

- [x] #1 foundation: versioned book/teaching configuration, explicit modes, server-owned bounded sessions, opt-in replaceable Chat Completions protocol adapter, failure/cancel/replay contracts and offline tests.
- [ ] #1 real connection: choose supplier/model, provide authorized project configuration and run a bounded live pilot. No real call has been made; issue remains open.
- [x] #2 materials: three development cases with mistake/alternative examples, three separated comparison cases including unaided transfer, evidence rubric and consistency/unsupported-judgment review process.
- [ ] #2 evidence: run a frozen candidate/baseline comparison and actual independent learner tasks with consent. Dataset/tool checks are not learning results; issue remains open.
- [x] #3 implementation: retry/cancel/reset state recovery, visible save failure without discarding memory, readable long text, labels, focus restoration and responsive controls.
- [x] #3 browser checks: in-app Chromium at 1440×1000, 768×1024, 390×844 and 320×740; keyboard paths, long text, demo flow and creator draft/save/preview. Browser JSON download remains unverified because its optional approval was not resolved during the test. See verification record for limits.
- [x] #8 English prototype introduction and contributor walkthrough, including one teaching and one code example; reader remains Chinese-first.

The current increment is a reviewable development branch, not a main release or public application deployment. The existing sample chapter is unchanged; independent book-manuscript work can connect later through versioned content packages. M2–M4 and real billing remain future work.

## Approved next increment: package contract and local reading loop (0.3.0-dev)

- [x] One canonical package/teaching/acceptance contract in TEACHING_SPEC.md, protocol 1.0.0, with strict schemas and offline checks.
- [x] General readable/question-answering/practice levels; role-play and voice remain optional. No book-specific writing style is imposed.
- [x] Public multi-chapter package loading alongside the unchanged legacy demonstration.
- [x] Multi-book/version shelf, chapter outline, continuous chapter body, chapter navigation and browser-local progress/reflection recovery.
- [x] Browser-only private JSON import, validated before atomic save; rejected input/conflicts do not replace books/progress or enter a server upload API.
- [x] Optional teaching bound to book/chapter/version; public scripts and private browser scripts remain clearly labelled. Three-layer status appears in reader/import reports.
- [x] Browser verification at 390×844, 320×740 and 1440×1000, including actual close/reopen, with final contract/recovery/error checks recorded in VERIFICATION.md.
- [ ] Real supplier/model, authorized bounded live calls and independent reader evidence before AI teaching may pass.
- [ ] Authenticated content/rights review, trusted evidence storage, official intake and version publication. Format validation alone grants none of these.

The first-stage user goal is: open the local preview at phone size → find a book → read completed chapters continuously → optionally ask/practice/self-review → close teaching and continue later. Public internet access, hardware-phone testing and real teaching are separate gates. Private manuscripts remain outside the public repository; fixtures use only existing public/original synthetic examples.

## Milestone 1 Real teaching pilot

Build a server-side AI adapter, explicit teaching modes, bounded sessions, and a small evaluation set for the demonstration chapter. Compare response quality and independent transfer with a clear baseline. Confirm the cost of actual use before introducing paid balances.

Completion means real, labelled AI interactions work and their failure modes are tested. It does not mean measured long-term learning benefit has already been demonstrated.

## Milestone 2 Creator and learner accounts

Introduce identity, durable user-owned progress, saved drafts, book versions, teaching previews, and a reviewed publishing path. Invite a small creator group to produce books using the same tools. Verify that authoring works for people who do not write prompts or code.

## Milestone 3 Sustainable service

Implement usage accounting, learning credits, transparent prices, payment handling, and creator settlements. Test failed, cancelled, retried, and refunded operations. Verify the contribution left after variable costs before scaling usage.

## Milestone 4 Broader participation

Add voice where it improves the learning task, cross-book skills, translations, reusable teaching components, and community review. Expand based on observed usefulness and sustainable maintenance.

No calendar deadline or funding amount is committed by this roadmap. Each milestone has a working experience and a validation question before the next scope expansion.
