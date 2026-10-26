# Architecture

## Current prototype

Node.js serves public/ and three routes: GET /api/status, GET /api/books, and POST /api/practice. Book content comes from versioned JSON. A deterministic teaching script provides a labelled product demonstration. The browser stores progress, reflection, and creator drafts locally.

This is not a multi-user production service. There is no identity provider, database, AI provider integration, billing ledger, or payment processor. The default server binds to 127.0.0.1. No external AI call is made.

## Target boundaries

The learner UI and creator workspace should share a versioned book model. A teaching orchestration service combines approved book content, learning objectives, role scenarios, feedback criteria, permitted actions, and user-selected learning state. Provider adapters sit behind that service so each book does not need its own separately trained base model.

Identity and durable storage must precede online publication of learner records. Book versions, teaching configurations, and model versions should be identifiable when reproducing feedback or comparing learning outcomes. Private learner state must not be packaged as public book content.

The billing service should record actual provider usage, reserves, debits, reversals, and creator settlements separately from learning progress. Use idempotency for financial operations and avoid trusting balances or completed requests supplied by the browser.

## Deployment

The prototype runs on a standard Node host or a local machine. GitHub is the source and collaboration destination, not the application runtime. A production hosting choice is an open decision after the first real teaching pilot; do not silently bind the project to one deployment vendor.

## Extension sequence

1. Versioned content and teaching contracts.
2. Authenticated, bounded real-AI practice and evaluation.
3. Durable user-owned progress and creator drafts.
4. Preview, review, and versioned publishing.
5. Usage accounting, payments, and creator compensation.

The zero-dependency UI is a prototype choice. The production frontend and storage architecture should be chosen from demonstrated needs rather than treated as already settled.
