---
title: Convex Billing Domain Rebuild
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Add explicit Convex billing-domain state for Starter licenses, Workers subscriptions, refunds, provider events, email deliveries, and Worker Seal Team 6 bookings.
post_build_recap: Added the additive Convex billing-domain schema, validators, model helpers, public viewer query, internal sync mutations, generated API refs, and focused tests for Starter renewals, Workers access and attention, provider event idempotency, email delivery idempotency, and paid Worker Seal Team 6 booking readiness.
program_id: template-first-web-convex-architecture
planning_brief: docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-5.md
read_when:
  - Resuming the Convex billing domain rebuild.
  - Adding route, webhook, email, or UI code that depends on rebuilt billing state.
  - Validating billing-domain schema and derivation behavior before the provider slices.
---

# Convex Billing Domain Rebuild

This document is a living execution plan for the Convex billing domain rebuild slice of the template-first web and Convex Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday is moving from a generic paid-access flag toward three explicit paid products: Starter annual licenses, Workers subscriptions, and Worker Seal Team 6 paid service bookings. Before the app can safely replace checkout routes, webhooks, billing UI, Resend emails, or Cal.com booking flow, Convex needs to model those products directly. After this slice, future provider routes can write normalized billing state into Convex instead of encoding business rules in raw Stripe or Cal.com payload handling.

## Progress

- [x] 2026-05-13: Read the Program, current planning brief pointer, app architecture/conventions docs, release workflow, ExecPlan contract, Convex AI guidelines, Convex migration helper guidance, current Convex billing/access code, current tests, and sibling template Convex billing modules.
- [x] 2026-05-13: Created immutable `planning-brief-5.md` for the Convex billing domain rebuild.
- [x] 2026-05-13: Added additive billing-domain schema tables and validators for Stripe customers, Starter license terms, Workers subscriptions, product entitlements, refunds, processed Stripe and Cal.com events, billing email deliveries, and Worker Seal Team 6 bookings.
- [x] 2026-05-13: Added `apps/web/convex/billing/model.ts` with Starter renewal/access derivation, Workers access and billing-attention derivation, paid booking readiness, idempotent provider event writes, idempotent email delivery writes, and product sync helpers.
- [x] 2026-05-13: Added `apps/web/convex/billing.ts` as the public/internal Convex function registration boundary with a viewer billing-state query and internal sync mutations.
- [x] 2026-05-13: Added focused unit tests for derivation and idempotent write behavior.
- [x] 2026-05-13: Regenerated Convex API bindings.
- [x] 2026-05-13: Updated Program docs and architecture inventory after implementation.
- [x] 2026-05-13: Ran focused validation, app format/lint/typecheck, Program lint, ExecPlan lint, markdown lint, and whitespace checks.

## Surprises & Discoveries

The current app does not yet have the sibling template's generic `users`, `workspaces`, and `memberships` tables. Existing product access is keyed by Clerk user id, and existing Workers project state uses `workspaceProjects` as product workspace data rather than billing tenant data. This slice will keep the billing domain keyed by `ownerClerkUserId` with optional product references instead of inventing a full workspace/membership migration inside a P0 billing slice.

The Convex migration helper guidance says adding new tables is a safe schema change that does not need the migrations component. This slice adds new tables and leaves legacy tables intact, so it does not require a widen-migrate-narrow data migration.

The app typecheck/build still lists several historical compatibility route URLs such as `/generate-codebase`, `/home`, and `/mission`. This slice did not touch route shape; those are existing compatibility routes and remain governed by later route/provider cleanup slices.

## Decision Log

Decision: Keep this slice additive and Convex-domain-only.

Rationale: The Program's next slice is the domain rebuild that other route, webhook, UI, and provider slices depend on. Replacing provider endpoints, sending email, or embedding Cal.com before the state model exists would keep business truth scattered.

Date: 2026-05-13.

Decision: Key the first rebuilt billing domain by `ownerClerkUserId` instead of adding template-style workspaces and memberships now.

Rationale: The current app's live product access and protected product surfaces are Clerk-user keyed. A proper user/workspace/membership migration is a separate auth and data-model project. This slice can still name the billing owner clearly and avoid weakening authorization while keeping the diff scoped.

Date: 2026-05-13.

Decision: Store event and email idempotency separately from product state.

Rationale: Stripe and Cal.com events are triggers and receipts, not the product model. Resend delivery state needs exactly-once keys, but webhook acknowledgement must not depend on delivery succeeding. Separate ledgers keep those concerns visible.

Date: 2026-05-13.

## Outcomes & Retrospective

This slice added the rebuilt Convex billing-domain foundation without replacing current checkout or webhook routes. New additive tables now model Stripe customer mappings, Starter annual license terms, Workers subscription lifecycle state, product entitlements, refund mirrors, processed Stripe events, processed Cal.com events, billing email deliveries, and Worker Seal Team 6 booking mirrors. `apps/web/convex/billing.ts` now exposes `viewerBillingState` plus internal sync/write mutations for future trusted provider slices.

The focused tests prove the user-visible billing rules that matter before routes depend on the model: early Starter renewal extends from the active expiration, expired renewal starts from payment time, expired/voided/fully refunded Starter terms do not grant access, Workers `past_due` keeps access through the mirrored retry window and creates non-dismissible billing attention, terminal Workers states remove access, provider event writes are idempotent, email delivery writes are idempotent by key, and Worker Seal Team 6 prep readiness requires paid booking state.

No external provider setup changed in this slice. Stripe route migration, Cal.com webhook verification, Resend sending/templates, Sentry setup, and the destructive legacy reset remain later Program slices.

## Context and Orientation

The current Convex billing/access path is legacy. `apps/web/convex/productAccessGrants`, `checkoutPurchaseIntents`, `pendingCheckoutClaims`, and `stripeWebhookEvents` support today's checkout and access handoff. They are still present so current code keeps working, but this Program intends to replace them with explicit billing-domain tables.

The target architecture is recorded in `apps/web/ARCHITECTURE.md`, `apps/web/CONVENTIONS.md`, and `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`. The sibling template's Convex billing source uses `stripeCustomers`, `subscriptions`, `entitlements`, and `processedStripeEvents`; this app needs those ideas expanded for annual licenses, subscription variants, failed-payment recovery, refunds, service bookings, and exactly-once email delivery.

Convex functions live under `apps/web/convex`. Public functions exported from `apps/web/convex/billing.ts` appear as `api.billing.<name>` and CLI refs like `billing:<name>`. Files under `apps/web/convex/billing/` hold implementation details and validators. Every Convex function needs argument validators. Viewer-facing billing queries must derive identity from `ctx.auth.getUserIdentity()` instead of accepting a user id argument.

### In Scope

This plan adds the rebuilt billing domain schema, validators, model helpers, Convex function registrations, tests, generated API updates, and Program/architecture inventory updates. The domain includes Starter annual licenses, Workers subscriptions, provider event ledgers, refund mirrors, email delivery state, Worker Seal Team 6 booking mirrors, and billing-state derivation for viewer reads.

### Out Of Scope

This plan does not move the Stripe webhook endpoint, replace current checkout success behavior, add Next.js route handlers under `src/app/api/billing`, add Cal.com webhook verification, embed Cal.com UI, add Resend or Sentry packages, send email, run the destructive legacy reset migration, add in-app admin refund actions, or migrate all existing product access checks to the rebuilt tables.

## Plan of Work

First, extend `apps/web/convex/billing/validators.ts` with billing-domain validators. Add narrow literals for products, license status, Workers cadence and lifecycle state, refund state, provider event state, email-delivery state, and Worker Seal Team 6 booking state. Keep existing checkout validators in the same file so current code continues to import them.

Second, update `apps/web/convex/schema.ts` with additive tables. The tables should include Stripe customer mappings, Starter license terms, Workers subscriptions, product entitlements, provider refund records, processed Stripe events, processed Cal.com events, billing email deliveries, and Worker Seal Team 6 bookings. Add indexes for owner lookups, provider identifiers, current product state, and idempotency keys. Do not remove or narrow any existing table in this slice.

Third, add `apps/web/convex/billing/types.ts` and `apps/web/convex/billing/model.ts`. The model should export pure derivation helpers for Starter entitlement, Starter renewal term windows, Workers entitlement, Workers billing attention, and viewer billing-state assembly. It should also export database helpers for idempotent provider event recording, email delivery upsert, Starter license term upsert, Workers subscription upsert, refund mirror upsert, and Worker Seal Team 6 booking upsert.

Fourth, add `apps/web/convex/billing.ts` as the Convex function registration boundary. It should expose a viewer query that reads the signed-in user's billing state. Sync writes should be internal functions for this slice so arbitrary clients cannot mutate billing state. Later route/webhook slices can add server-trusted public wrappers or Convex actions when they wire Next.js, Stripe, Cal.com, and Resend.

Fifth, add focused unit tests under `apps/web/tests/unit/convex-billing-domain.test.ts`. The tests should import model helpers directly, use a small in-memory Convex-like database where needed, and prove the most important product outcomes: early Starter renewal starts at the current expiration, expired Starter renewal starts at paid time, full refunds/voids remove Starter access, Workers `past_due` keeps access through the retry window and creates non-dismissible billing attention, terminal Workers states remove access, provider event upsert is idempotent, email delivery upsert is idempotent by key, and Worker Seal Team 6 prep email readiness requires paid booking state.

Finally, regenerate Convex API bindings, update `planning-brief-5.md` or this ExecPlan with discoveries, update the Program progress and next-slice text, and run validation.

## Milestones

Milestone 1 is the schema and validator layer. It is complete when all new billing domain tables are additive, validators are named by domain concept, no current checkout validator import breaks, and type generation can see the new tables.

Milestone 2 is the model and function layer. It is complete when `apps/web/convex/billing.ts` exposes viewer read state plus internal sync/write functions, and model helpers derive entitlements and billing attention from normalized Convex docs rather than provider payloads.

Milestone 3 is focused proof. It is complete when unit tests prove renewal-term calculation, entitlement derivation, billing attention, idempotent provider events, idempotent email deliveries, and Worker Seal Team 6 paid-booking readiness.

Milestone 4 is documentation and validation. It is complete when generated Convex API types, the Program packet, this ExecPlan, and the architecture inventory match the implementation, and focused plus docs validation commands pass or have exact recorded blockers.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Edit these files first:

    apps/web/convex/billing/validators.ts
    apps/web/convex/schema.ts
    apps/web/convex/billing/types.ts
    apps/web/convex/billing/model.ts
    apps/web/convex/billing.ts

Add focused tests:

    apps/web/tests/unit/convex-billing-domain.test.ts

Regenerate Convex API bindings from the app directory:

    cd apps/web
    bunx convex codegen --typecheck disable

Return to the repository root and run focused validation:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun run --cwd apps/web test:unit -- tests/unit/convex-billing-domain.test.ts tests/unit/convex-entitlements-module-boundaries.test.ts

Run plan and Program validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-convex-billing-domain-rebuild.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-convex-billing-domain-rebuild.md docs/programs/active/2026-05-13-template-first-web-convex-architecture
    git diff --check

Run broader app validation if focused tests pass:

    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck

## Validation and Acceptance

Acceptance requires observable Convex-domain behavior, not only schema names. A signed-in viewer query should return a stable billing read model for the current Clerk user. Starter license helpers should show access only for active, unvoided, unrefunded terms. Workers helpers should distinguish active access, past-due attention with retained access, scheduled cancellation through period end, and terminal access removal. Worker Seal Team 6 helpers should distinguish paid confirmed bookings from created or unpaid bookings. Provider events and email deliveries should be idempotent by explicit keys.

Feature: rebuilt Convex billing domain. Risk: P0 because billing, entitlements, refunds, paid service fulfillment, and email idempotency are money and access state. Source of truth: Convex tables and focused unit tests for derived state. Must work: normalized Starter, Workers, refund, provider event, email, and service booking records can be written idempotently and read as product state. Must fail safely: arbitrary clients cannot mutate billing sync state, terminal or fully refunded states do not grant access, and booking-created states cannot trigger paid-booking prep email readiness. Tests: unit tests for pure derivation and Convex-like write helpers, generated API codegen, app static checks, plan and Program lint. CI gate: app static, generated API/typecheck, and future billing route tests in later slices.

### Test Commands

    bun run --cwd apps/web test:unit -- tests/unit/convex-billing-domain.test.ts tests/unit/convex-entitlements-module-boundaries.test.ts
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-convex-billing-domain-rebuild.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-convex-billing-domain-rebuild.md docs/programs/active/2026-05-13-template-first-web-convex-architecture
    git diff --check

## Idempotence and Recovery

All schema changes in this slice are additive. If validation fails because a new required field conflicts with existing data, make the field optional or move that change to a separate migration plan. Do not delete or narrow legacy tables here.

Provider event writes must be safe to repeat with the same Stripe or Cal.com event id. Email delivery writes must be safe to repeat with the same idempotency key. If a helper creates duplicate state during tests, repair the helper before adding routes on top of it.

If Convex generated API types are stale, regenerate from `apps/web` with `bunx convex codegen --typecheck disable`, then rely on the app typecheck for TypeScript proof.

## Artifacts and Notes

Important source references for this slice are:

- `apps/web/ARCHITECTURE.md`
- `apps/web/CONVENTIONS.md`
- `apps/web/convex/_generated/ai/guidelines.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-5.md`
- `~/Developer/next-js-convex-clerk-stripe-template/convex/schema.ts`
- `~/Developer/next-js-convex-clerk-stripe-template/convex/billing.ts`
- `~/Developer/next-js-convex-clerk-stripe-template/convex/subscriptions.ts`
- `~/Developer/next-js-convex-clerk-stripe-template/convex/entitlements.ts`

Validation evidence:

- `bunx convex codegen --typecheck disable` passed from `apps/web`.
- `bun run --cwd apps/web test:unit -- tests/unit/convex-billing-domain.test.ts tests/unit/convex-entitlements-module-boundaries.test.ts` passed with 2 files and 13 tests.
- `bun run --cwd apps/web format:check` passed.
- `bun run --cwd apps/web lint` passed.
- `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck` passed.

## Interfaces and Dependencies

This slice depends on Convex schema validation, Convex function validators, Clerk-backed Convex auth for viewer reads, the current `ownerClerkUserId` access key convention, and future server-trusted provider routes that will call the internal sync helpers or add public secret-gated wrappers. It intentionally does not depend on live Stripe, Cal.com, Resend, or Sentry credentials.
