---
title: Convex Billing Runtime Hardening
status: complete
created_at: 2026-05-09
completed_at: 2026-05-09
summary: Harden the Convex and Stripe runtime evidence around checkout fulfillment, entitlement identity, retry-secret validation, and webhook idempotency.
post_build_recap: Convex and billing fulfillment now reject weak retry secrets, characterize the Clerk-id entitlement contract, avoid unpaid Checkout fulfillment, track accepted Stripe webhook events in a schema-backed ledger, and require same-commit Convex production deploy evidence for Convex-sensitive production proof.
program_id: shipping-evidence-hardening
planning_brief: docs/programs/completed/2026-05-09-shipping-evidence-hardening/planning-brief-2.md
read_when:
  - Resuming the Convex and billing runtime hardening slice.
  - Changing Stripe webhook fulfillment, checkout success recovery, or Convex product access grants.
  - Deciding what hosted Convex or billing proof belongs in release workflows.
---

# Convex Billing Runtime Hardening

This is a living execution plan for hardening the Convex and billing runtime proof slice of Shipping Evidence Hardening.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Checkout is only safe when payment truth, identity truth, and access truth converge. A buyer should not get access from an unpaid delayed-payment event, a weak retry secret should not let the success page call Convex fulfillment, and future identity migrations should not silently orphan paid access rows.

After this slice, the cheap source tests pin the current Clerk-id entitlement contract, Convex and Next.js agree on retry-secret strength, signed-in webhooks wait for paid Checkout Sessions, duplicate Stripe events are recorded in Convex before fulfillment work, and hosted production proof waits for Convex production when Convex-sensitive changes ship. A contributor can see the work by running the focused Convex billing tests and by reading this plan's progress and acceptance evidence.

## Progress

- [x] 2026-05-09: Refreshed root, app, Convex, release, Program, and ExecPlan instructions for the runtime hardening slice.
- [x] 2026-05-09: Spawned read-only 5.5 xhigh explorers for Convex identity, Stripe webhook/idempotency, and runtime proof infrastructure.
- [x] 2026-05-09: Confirmed the current persisted identity key is Clerk `clerkUserId`, derived from Convex `identity.subject`; a direct switch to `identity.tokenIdentifier` would require migration and dual-read.
- [x] 2026-05-09: Confirmed the current webhook is idempotent mostly by Checkout Session id and Clerk user id, not by a durable Stripe event ledger.
- [x] 2026-05-09: Confirmed the signed-in webhook branch grants on `checkout.session.completed` without checking `payment_status`, while the guest branch checks paid status after retrieving the session.
- [x] 2026-05-09: Created Planning Brief 2 and this active child ExecPlan.
- [x] 2026-05-09: Completed Milestone 1 source-level runtime hardening: Convex retry-secret validation now matches Next.js, identity tests characterize the current Clerk-id contract with distinct token identifiers, and unpaid signed-in Checkout completions are accepted without access fulfillment.
- [x] 2026-05-09: Ran focused, docs, repo, and source-gate validation for Milestone 1. The full source gate also exposed and drove a package-smoke portability fix for pnpm-owned fixture repos on machines without pnpm.
- [x] 2026-05-09: Completed Milestone 2 by adding the schema-backed `stripeWebhookEvents` table, generated Convex API references, internal ledger mutations, webhook duplicate handling, and focused duplicate/retry tests.
- [x] 2026-05-09: Completed Milestone 3 by making `Production Release Proof` consume `convex_sensitive`, continue detecting Convex scope during manual forced billing reruns, wait for the same-commit `Convex Production Deploy` run when Convex-sensitive, and record `convexSensitive` in its summary artifact.
- [x] 2026-05-09: Validated the completed slice with focused unit tests, hosted Convex dry-run, YAML parsing, repo source gates, and plan/Program/docs lint.

## Surprises & Discoveries

- 2026-05-09: The Convex guidelines prefer `identity.tokenIdentifier` for auth-linked ownership, but this app intentionally stores external Clerk user ids today. The safe path is characterization first, then a future dual-read migration if the product needs canonical Convex token identifiers.
- 2026-05-09: `CHECKOUT_FULFILLMENT_RETRY_SECRET` is documented and validated in Next.js as at least 32 characters, but Convex only requires a non-empty value. This is a real fail-open gap between the two runtimes.
- 2026-05-09: `scripts/release/detect-release-scope.mjs` already emits `convex_sensitive`, but `.github/workflows/production-release-proof.yml` only consumes `billing_sensitive`. A later release-proof slice should consume the Convex signal.
- 2026-05-09: Running `bun run --cwd apps/web typecheck` locally without `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1` executes the PostHog source-map upload hook when local credentials are present. This was recorded in `MISTAKES.md`; use the disabled env flag for local validation unless source-map upload is the target behavior.
- 2026-05-09: The new `check:source` gate exposed that the local-runner native package-manager smoke assumed a real `pnpm` binary. The smoke now provides a fake `pnpm --version` binary for that dry-run fixture while the installer still blocks real pnpm-owned repos when pnpm is unavailable.
- 2026-05-09: The production proof workflow's manual `force_billing` path exited before running the release-scope detector, which meant manual forced billing reruns discarded `convex_sensitive`. The workflow now always runs detection and only overrides `billing_sensitive` afterward.
- 2026-05-09: Hosted Convex dry-run succeeded for this local tree and showed the new `stripeWebhookEvents` indexes, but it also listed unrelated pending impersonation and support indexes from other active worktree changes. This slice owns only the `stripeWebhookEvents` table and indexes.

## Decision Log

Decision: Do not migrate entitlement keys from Clerk user ids to `tokenIdentifier` in this slice.
Rationale: `productAccessGrants`, pending claims, workspace rows, course state, Codex rows, impersonation state, Stripe metadata, and Next.js checkout comparisons all use Clerk user ids today. A direct replacement would break existing buyers.
Date: 2026-05-09

Decision: Treat unpaid `checkout.session.completed` as accepted but not fulfilled.
Rationale: Stripe can emit Checkout completion before delayed payment methods succeed. Returning a successful webhook response without granting access avoids false access and lets the later `checkout.session.async_payment_succeeded` event do fulfillment.
Date: 2026-05-09

Decision: Keep hosted Convex and Stripe proof out of every PR.
Rationale: Parker asked for broke-startup-friendly proof. The PR gate should stay cheap and deterministic; provider-backed proof belongs in release, staging, manual, conditional, or nightly paths unless a future milestone proves a check is cheap and stable enough.
Date: 2026-05-09

Decision: Add the schema-backed Stripe webhook event ledger in this slice.
Rationale: Duplicate webhook delivery is directly in the money-to-access path, and the existing session-id convergence did not prove exact Stripe event ids. A small Convex table with event-id, object-id, event-type, status, attempt count, and timestamps gives the webhook an auditable retry and duplicate boundary without adding hosted Stripe cost to PRs.
Date: 2026-05-09

Decision: Treat `processed`, `payment_pending`, and `ignored` ledger states as terminal duplicate skips, while `failed` and `processing` remain retryable.
Rationale: Stripe retries can recover transient Convex or fulfillment errors. Recording failures is useful operational evidence, but a failed event must not block a later replay from processing the paid Checkout Session.
Date: 2026-05-09

Decision: Put the Convex-sensitive production wait inside `default_ship` instead of adding a new proof pack.
Rationale: `default_ship` is already the required hosted production proof path. Waiting there binds the browser/auth/entitlement proof to the same Convex production deploy only when Convex code changed, while preserving cheap PR checks and avoiding a parallel proof ritual.
Date: 2026-05-09

## Outcomes & Retrospective

This plan is complete. Source tests now pin the current Clerk-id entitlement contract, Convex rejects short checkout retry secrets with a key-named error, and the Stripe webhook treats unpaid Checkout completion as an accepted pending payment rather than a grant or incident. Stripe webhook processing now has a durable `stripeWebhookEvents` ledger that skips terminal exact duplicates, skips terminal logical duplicates for the same Stripe object and event type, retries failed events, and still allows a later async success event for the same Checkout Session to fulfill access. Production proof now consumes Convex-sensitive release scope and fails closed for Convex-sensitive releases unless automatic Convex production deploys are enabled and the same commit's `Convex Production Deploy` run succeeds.

The remaining Program work is outside this child ExecPlan: staging and production preflight still need a dedicated slice, release evidence still needs stronger artifact truth, and generated customer repo command-contract proof still needs clean-room validation.

## Context and Orientation

The repository root is `/Users/bazelrex/Developer/ship-by-sunday`. The app lives in `apps/web`. The billing handoff starts in the Next.js Stripe checkout routes under `apps/web/app/api/stripe/checkout/`, writes Checkout Session metadata in `apps/web/platform/billing/checkout/checkout-session-params.ts`, receives Stripe webhooks in the Convex HTTP action `apps/web/convex/http.ts`, verifies and routes events in `apps/web/convex/stripeWebhook.ts`, writes product access in `apps/web/convex/access/model.ts`, and handles guest checkout claims in `apps/web/convex/checkoutClaims.ts` and `apps/web/convex/checkoutClaimsActions.ts`.

The persisted access row is `productAccessGrants` in `apps/web/convex/schema.ts`. Its owner field is `clerkUserId`, which is a Clerk user id such as `user_123`. Convex authenticated viewer code currently reads `ctx.auth.getUserIdentity()` and uses `identity.subject` as that Clerk id. Convex also exposes `identity.tokenIdentifier`, but that is not the current stored key in this app.

The retry path is the success-page fallback. `apps/web/platform/billing/checkout/checkout-session-recovery.ts` calls `api.checkoutClaimsActions.fulfillCheckoutSessionFromSuccessPage` with `CHECKOUT_FULFILLMENT_RETRY_SECRET`. That same secret must exist in Next.js server env and the matching Convex deployment.

### In Scope

This plan covers source-level tests and code changes for current Convex entitlement identity characterization, Convex retry-secret validation, signed-in webhook payment-status handling, a schema-backed Stripe webhook event ledger, and production release-proof wiring for Convex-sensitive changes.

Milestone 1 may change `apps/web/convex/env.ts`, `apps/web/convex/stripeWebhook.ts`, `apps/web/convex/http.ts`, focused unit tests under `apps/web/tests/unit/`, this ExecPlan, and the parent Program packet.

### Out Of Scope

This plan does not switch the product to Convex `tokenIdentifier` ownership. That requires a migration plan, schema changes, dual-read behavior, and backfill strategy across access, workspace, course, Codex, checkout, and impersonation state.

This plan does not make hosted Stripe, Clerk, Convex, or browser proof run on every pull request. It does not create a Next.js Stripe webhook route. It does not change `dev` into release authority. It does not implement refunds, disputes, subscriptions, or revocation policy unless those become necessary to complete the narrowly scoped webhook handoff evidence.

## Plan of Work

First, land the cheap runtime hardening. Update `apps/web/convex/env.ts` so `CHECKOUT_FULFILLMENT_RETRY_SECRET` has the same minimum length as `apps/web/platform/env/server.ts`. Add a focused `apps/web/tests/unit/convex-env.test.ts` assertion that short secrets fail. Update existing checkout claim action test fixtures to use a strong retry secret.

Second, characterize identity without migration. Update access and checkout-claim tests so mocked identities include a distinct `tokenIdentifier` while assertions continue to prove that `clerkUserId` comes from Clerk `identity.subject`. The tests should make a future direct `tokenIdentifier` switch fail loudly.

Third, make pending signed-in Checkout events safe. Update `apps/web/convex/stripeWebhook.ts` to return a new successful pending result when a supported Checkout Session event has `payment_status` other than `paid` or `no_payment_required`. Update `apps/web/convex/http.ts` to return 200 for that result without incident logging. Add unit tests that unpaid `checkout.session.completed` calls neither `runMutation` nor `runAction`, and that paid `checkout.session.async_payment_succeeded` still grants.

Fourth, add the processed-event ledger after Milestone 1 is green. The table lives in `apps/web/convex/schema.ts` as `stripeWebhookEvents`, with indexes by Stripe event id, by Stripe object identity plus event type, and by status plus update time. The implementation uses internal Convex mutations in `apps/web/convex/stripeWebhookEvents.ts` to begin processing, skip terminal duplicates, retry failed events, and record the final result around webhook side effects.

Fifth, wire the hosted proof hook through the existing release proof path. `.github/workflows/production-release-proof.yml` now consumes `convex_sensitive` from `scripts/release/detect-release-scope.mjs`, waits for `convex-production-deploy.yml` on the same commit when Convex-sensitive, and keeps hosted provider checks out of every PR.

## Milestones

Milestone 1 is cheap source-level hardening. At the end, Convex rejects short checkout retry secrets, tests prove the current Clerk-id identity contract even when `tokenIdentifier` differs, and the webhook accepts but does not fulfill unpaid Checkout completion events. Success is visible in focused unit tests.

Milestone 2 is explicit duplicate-event proof. It is complete. Duplicate Stripe event handling is schema-backed by `stripeWebhookEvents`, and success is visible in tests replaying the same event id, a different event id for the same Checkout Session and event type, a different event type for the same Checkout Session, and a retry after failure.

Milestone 3 is hosted runtime proof design and wiring. It is complete. Production proof consumes Convex-sensitive scope intentionally, manual forced billing reruns still detect Convex scope, and workflow/docs alignment explains that Convex-sensitive production proof requires a same-commit Convex production deploy.

## Concrete Steps

From the repository root, inspect the key files before each edit:

    nl -ba apps/web/convex/env.ts | sed -n '1,120p'
    nl -ba apps/web/convex/stripeWebhook.ts | sed -n '1,320p'
    nl -ba apps/web/convex/http.ts | sed -n '90,185p'
    nl -ba apps/web/tests/unit/stripe-webhook-action.test.ts | sed -n '1,340p'
    nl -ba apps/web/tests/unit/checkout-claims-actions.test.ts | sed -n '1,640p'
    nl -ba apps/web/tests/unit/course-entitlements.test.ts | sed -n '1,360p'

After Milestone 1 edits, run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/convex-env.test.ts tests/unit/course-entitlements.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/convex-http-boundary.test.ts

Observed Milestone 1 focused proof:

    Test Files  6 passed (6)
    Tests  52 passed (52)

Observed Milestone 1 source-gate proof:

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run check:source
    # passed

When schema or Convex function references change, run hosted Convex codegen or an equivalent hosted Convex validation. Do not use Convex local mode.

Observed completed-slice focused proof:

    bun run --cwd apps/web test:unit -- tests/unit/stripe-webhook-action.test.ts tests/unit/stripe-webhook-events.test.ts tests/unit/convex-http-boundary.test.ts tests/unit/release-scope.test.ts tests/unit/release-proof-command.test.ts tests/unit/release-evidence.test.ts
    # Test Files  6 passed (6)
    # Tests  25 passed (25)

    bun run --cwd apps/web test:unit -- tests/unit/convex-env.test.ts tests/unit/course-entitlements.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/stripe-webhook-events.test.ts tests/unit/convex-http-boundary.test.ts
    # Test Files  7 passed (7)
    # Tests  60 passed (60)

    cd apps/web && bunx convex deploy --dry-run -y
    # Schema validation complete.
    # Would add table indexes including stripeWebhookEvents.by_stripe_event_id, stripeWebhookEvents.by_stripe_object_id_and_event_type, and stripeWebhookEvents.by_status_and_updated_at.
    # Would have deployed Convex functions to the redacted production deployment

    ruby -e 'require "yaml"; YAML.load_file(ARGV[0]); puts "ok"' .github/workflows/production-release-proof.yml
    # ok

Observed completed-slice broad proof:

    bun run format
    # passed

    bun lint
    # passed

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    # passed

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run check:source
    # passed

## Validation and Acceptance

This plan is accepted because all three milestones have runnable proof, Program and ExecPlan documents are current, the hosted Convex validation was a dry-run rather than a production deploy, and broad source gates passed. For completed runtime code, the focused tests, hosted Convex dry-run, YAML parse, repo-level gates, and source gate all passed locally.

### Test Commands

Focused Milestone 1 proof:

    bun run --cwd apps/web test:unit -- tests/unit/convex-env.test.ts tests/unit/course-entitlements.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/convex-http-boundary.test.ts

Plan and Program proof:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-09-convex-billing-runtime-hardening.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-09-convex-billing-runtime-hardening.md docs/programs/completed/2026-05-09-shipping-evidence-hardening .github/workflows/README.md docs/release-workflow.md

Completion gates for runtime code:

    bun run format
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run check:source

Hosted Convex validation:

    cd apps/web && bunx convex deploy --dry-run -y

## Idempotence and Recovery

The Milestone 1 edits are source-level and safe to rerun. Test-only identity characterization does not change production data. Retry-secret validation can fail local tests if existing fixtures use short test secrets; update fixtures to a 32-character or longer value rather than weakening validation.

If webhook pending-payment handling causes an unexpected test failure, confirm whether the fixture is modeling a real Stripe Checkout Session. Real Checkout Session objects include `payment_status`; minimal test fixtures should set `payment_status: "paid"` when they expect fulfillment.

Convex schema changed in this completed slice. The generated API reference was refreshed with Convex codegen, and hosted Convex validation ran through `bunx convex deploy --dry-run -y`. Do not switch to Convex local mode. If future work changes the ledger schema, rerun codegen, focused webhook tests, and hosted Convex dry-run before relying on source-only proof.

## Artifacts and Notes

Read-only explorer findings that shaped this plan:

    The persisted user key is Clerk user id in `clerkUserId`; direct tokenIdentifier replacement is unsafe.
    Duplicate webhook handling currently converges by Checkout Session id and Clerk user id, not by Stripe event id.
    The signed-in webhook branch does not check payment_status before granting access.
    Hosted Convex runtime proof is possible through existing Convex CLI and release proof paths, but should not run on every PR.

Key source files:

    apps/web/convex/env.ts
    apps/web/convex/http.ts
    apps/web/convex/stripeWebhook.ts
    apps/web/convex/access/model.ts
    apps/web/convex/checkoutClaims.ts
    apps/web/convex/checkoutClaimsActions.ts
    apps/web/platform/billing/checkout/checkout-session-params.ts
    apps/web/platform/billing/checkout/checkout-session-recovery.ts
    scripts/release/lib/release-scope.mjs
    scripts/release/run-release-proof.mjs
    .github/workflows/production-release-proof.yml

Completed validation artifacts:

    apps/web/convex/stripeWebhookEvents.ts
    apps/web/tests/unit/stripe-webhook-events.test.ts
    apps/web/convex/_generated/api.d.ts
    .github/workflows/README.md
    docs/release-workflow.md

## Interfaces and Dependencies

This plan depends on Convex functions and validators, Stripe Checkout Session webhook event shape, Clerk user ids, Next.js server env validation, Vitest unit tests, GitHub Actions release proof workflows, hosted Convex dev or production deployments for provider-backed validation, and the Program packet at `docs/programs/completed/2026-05-09-shipping-evidence-hardening/program.md`.
