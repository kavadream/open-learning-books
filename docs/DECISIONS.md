# Decisions

## Working choices

- Working name: Open Learning Books; final branding remains open.
- First language and demonstration: Chinese, with 人性的弱点升级版 as the first reference work.
- Platform scope: reading, teaching-focused practice, creation, versioned publishing, and sustainable usage.
- One reusable teaching system with book-specific configuration; no separate base-model training requirement for each book.
- Implementation: zero-dependency Node and browser prototype; default teaching remains explicitly scripted. The 0.2.0-dev increment adds a replaceable, opt-in Chat Completions protocol adapter, verified only with offline fixtures. This protocol choice does not choose an AI supplier or model.
- Open collaboration through GitHub. Software and creator content have separate permission statements.
- Internal learning credits are the first operating concept. No tradable-token issuance is approved or implemented.

## Still open

Production framework and hosting, AI provider, voice interaction design, identity and storage, creator-content permission options, publishing review, pricing, revenue share, and any future tradable-token proposal.

## Delivery status

The public repository is https://github.com/kavadream/open-learning-books . Repository access was confirmed on 2026-10-26 after the owner enabled access to all repositories. Source delivery and issue filing are tracked in docs/ROADMAP.md and the repository history. Repository publication does not mean a production website has been deployed.

## M1 development boundaries (0.2.0-dev)

- Public book packages and server teaching configurations have independent explicit versions, checked for a matching book version before use. Existing sample prose is unchanged. A separate private manuscript project is outside this platform change and can supply future versioned packages.
- Teaching routes are local-only until identity and access control are designed. Session memory, expiry, cancellation and duplicate-request handling precede any real-model pilot. Browser drafts/reflections retain the existing local storage key and do not enter model requests.
- No endpoint/model/key defaults; only explicit project-prefixed settings enable the provider. No real call or learning-outcome evaluation was performed. Details and the live pilot gate are in docs/AI_ADAPTER.md.
- Evaluation development and comparison sets are separate, with a proposed evidence rubric and independent transfer task. Semantic quality, fair feedback, provider cost and learner benefit require actual review/data; tests and text fluency cannot establish them.
- Resource reservations are bounded local safeguards, not real paid balances or durable usage accounting. No M2/M3 feature is implied by them.
