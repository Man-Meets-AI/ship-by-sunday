---
title: Convex Entitlement And Billing Module Reshape
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Move Convex product access helpers into an entitlement domain and checkout validators into a billing domain while preserving existing public function contracts.
post_build_recap: Product access implementation moved under `apps/web/convex/entitlements/`, checkout validators moved under `apps/web/convex/billing/validators.ts`, old access and root validator paths were initially left as compatibility shims, direct Convex imports used the new domains, and focused access, checkout, webhook, static, plan, Program, markdown, and whitespace validation passed. A later hard-rename slice superseded the compatibility-shim decision.
program_id: template-first-web-convex-architecture
planning_brief: docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-3.md
read_when:
  - Resuming the Convex module reshape slice.
  - Checking why access function names stayed compatible during the entitlement move.
  - Validating checkout and Stripe webhook behavior after Convex module reshaping.
---

# Convex Entitlement And Billing Module Reshape

This document is a living execution plan for the Convex module reshape slice of the template-first web and Convex Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The current Convex product access code still uses the old `access` module name, while the template organizes product authorization and billing state by domain. This slice makes the file ownership clearer without changing what customers can do: existing checkout, Stripe webhook, and protected route behavior must keep working, and existing `access:*` function paths must remain valid for app code, scripts, and release proof. A contributor should be able to find entitlement decisions under `apps/web/convex/entitlements/` and checkout validators under `apps/web/convex/billing/validators.ts`.

## Progress

- [x] 2026-05-13: Read root and app instructions, Convex AI guidelines, Program rules, ExecPlan rules, app architecture and conventions, release workflow, Program inventory, planning split recommendation, current Convex access/checkout/webhook modules, and the sibling template Convex auth, billing, entitlement, subscription, user, and schema modules.
- [x] 2026-05-13: Created immutable planning brief 3 and pointed `current-planning-brief.txt` at it.
- [x] 2026-05-13: Moved entitlement implementation into `apps/web/convex/entitlements/` with access compatibility shims.
- [x] 2026-05-13: Moved checkout validators into `apps/web/convex/billing/validators.ts` with root compatibility shims.
- [x] 2026-05-13: Updated direct Convex imports to use the new domain modules.
- [x] 2026-05-13: Added focused compatibility tests and ran focused access, checkout, and webhook tests.
- [x] 2026-05-13: Ran app static validation plus plan, Program, markdown, and whitespace validation.
- [x] 2026-05-13: Updated the Program ledger and closed this ExecPlan.

## Surprises & Discoveries

The current public and operator contracts depend on old module names. `api.entitlements.viewerProductAccess` is used by protected app helpers, scripts call `checkoutClaims:*` by string name, and release-scope tests mark `checkoutClaimsActions`, `stripeWebhook`, and `stripeWebhookEvents` as sensitive paths. Therefore this slice must move implementation ownership without renaming public Convex function modules.

The Convex guidelines prefer `identity.tokenIdentifier` for stable auth-linked lookups, but current `productAccessGrants` records are keyed by Clerk user id from `identity.subject`. This slice leaves that behavior unchanged because changing the key would be a data-model migration, not a module reshape.

## Decision Log

Decision: Keep `apps/web/convex/entitlements.ts` as the public compatibility boundary.

Rationale: App code, tests, scripts, and release proof already rely on `api.entitlements.viewerProductAccess` and `access:*` internal mutations. Moving implementation under `entitlements/` gives future code the right domain home without breaking those contracts.

Date: 2026-05-13.

Decision: Centralize checkout intent and offer validators in `apps/web/convex/billing/validators.ts`.

Rationale: These validators describe billing checkout state, not entitlement state. Keeping the root validator files as re-export shims avoids import churn for any remaining callers and prevents schema validator drift.

Date: 2026-05-13.

## Outcomes & Retrospective

This plan is complete. Product access implementation moved to `apps/web/convex/entitlements/model.ts`, `apps/web/convex/entitlements/types.ts`, and `apps/web/convex/entitlements/validators.ts`. Checkout intent and offer validators moved to `apps/web/convex/billing/validators.ts`. This slice originally retained compatibility shims and old public function paths, but the following hard-rename slice intentionally removed those shims and moved callers to `api.entitlements.*` and `entitlements:*`.

## Context and Orientation

`apps/web/convex/entitlements.ts` currently registers the public query `viewerProductAccess`, the public mutation `resolveViewerFulfillmentTrack`, and internal mutations/queries such as `grantProductAccess`, `grantProductAccessFromStripe`, `resetProductAccess`, and `getProductAccessDebug`. The implementation lives in `apps/web/convex/entitlements/model.ts`, with validators in `apps/web/convex/entitlements/validators.ts` and types in `apps/web/convex/entitlements/types.ts`.

Checkout fulfillment and Stripe webhook code use those access helpers from `apps/web/convex/checkoutClaims.ts`, `apps/web/convex/checkoutClaimsActions.ts`, `apps/web/convex/stripeWebhook.ts`, and `apps/web/convex/stripeWebhookEvents.ts`. Product data modules such as `apps/web/convex/codebase/*`, `apps/web/convex/course/shared.ts`, `apps/web/convex/uploads.ts`, and `apps/web/convex/workspace/model.ts` use access checks to authorize reads and writes.

The sibling template keeps entitlement decisions in `convex/entitlements.ts`, billing state in `convex/billing.ts`, subscription state in `convex/subscriptions.ts`, and identity/workspace helpers in `convex/auth.ts`. Ship by Sunday has more legacy checkout logic, so this slice only moves product-access implementation and checkout validators into domain-named modules while retaining compatibility shims.

### In Scope

This plan moves product access implementation into `apps/web/convex/entitlements/`, moves checkout validators into `apps/web/convex/billing/validators.ts`, updates direct imports to the new domain modules, and adds compatibility tests for the old module paths.

### Out Of Scope

This plan does not change Convex schema fields, add billing tables, rename public Convex function paths, move webhook endpoints, alter Stripe or Clerk behavior, change access identity keys, add provider setup, configure Resend or Sentry, or implement Starter/Workers/Worker Seal Team 6 billing state.

## Plan of Work

First, move `apps/web/convex/entitlements/model.ts`, `apps/web/convex/entitlements/types.ts`, and `apps/web/convex/entitlements/validators.ts` into `apps/web/convex/entitlements/`. Rename only local type aliases that describe the new module boundary, then leave `apps/web/convex/entitlements/*` as re-export shims.

Second, create `apps/web/convex/billing/validators.ts` with the checkout offer, checkout intent, fulfillment track, CTA, and checkout intent field validators. Replace `checkoutIntentValidators.ts` and `checkoutOfferValidators.ts` with focused re-exports from the billing validators file.

Third, update imports in Convex modules. `apps/web/convex/entitlements.ts` should import handlers from `./entitlements/model`. Product data modules should import product access guards from the entitlement model directly. Checkout and webhook modules should import product access validators from `./entitlements/validators` and checkout validators from `./billing/validators`.

Fourth, add a focused unit test that proves old compatibility modules export the same functions and validator objects as the new domain modules. This is intentionally a boundary test for migration safety, not a behavior replacement for existing access and checkout tests.

Finally, run focused tests and static validation, repair any failures, update the Program and this ExecPlan with validation evidence, and move the ExecPlan to completed only after the slice is proven.

## Milestones

Milestone 1 reshapes module ownership. It is complete when entitlement implementation lives under `apps/web/convex/entitlements/`, billing checkout validators live under `apps/web/convex/billing/validators.ts`, old files are compatibility shims, and direct Convex imports use the new domain modules.

Milestone 2 proves compatibility. It is complete when a focused test proves old access and checkout validator modules share the same exported functions and validators as the new domain modules, and existing access, checkout, and webhook tests still pass.

Milestone 3 syncs durable planning surfaces. It is complete when this ExecPlan records the outcome, the Program ledger names the slice correctly, plan and Program lint pass, markdown lint passes for touched docs, and whitespace validation passes.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the files involved before editing:

    sed -n '1,260p' apps/web/convex/entitlements/model.ts
    sed -n '1,220p' apps/web/convex/entitlements/validators.ts
    sed -n '1,220p' apps/web/convex/checkoutIntentValidators.ts
    sed -n '1,220p' apps/web/convex/checkoutOfferValidators.ts
    rg -n "entitlements/model|entitlements/validators|checkoutIntentValidators|checkoutOfferValidators" apps/web/convex apps/web/tests apps/web/scripts

Move and edit the modules:

    mkdir -p apps/web/convex/entitlements apps/web/convex/billing
    mv apps/web/convex/entitlements/model.ts apps/web/convex/entitlements/model.ts
    mv apps/web/convex/entitlements/types.ts apps/web/convex/entitlements/types.ts
    mv apps/web/convex/entitlements/validators.ts apps/web/convex/entitlements/validators.ts

After edits, run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/convex-entitlements-module-boundaries.test.ts tests/unit/course-access.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/stripe-webhook-events.test.ts tests/unit/convex-product-access-grant.test.ts

Run static and docs validation:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-convex-entitlement-billing-module-reshape.md
    bun run programs:lint
    bun run markdown:lint -- --paths apps/web/ARCHITECTURE.md docs/exec-plans/completed/2026-05-13-convex-entitlement-billing-module-reshape.md docs/programs/active/2026-05-13-template-first-web-convex-architecture
    git diff --check

## Validation and Acceptance

Acceptance requires structural proof and behavioral proof. The structural proof is that `entitlements/` and `billing/validators.ts` own the moved code while old module paths remain shims. The behavioral proof is that focused access, checkout, and webhook tests pass and TypeScript can still compile the app against the unchanged public Convex function paths.

Feature: Convex entitlement and billing module reshape. Risk: P1 because this touches entitlement checks, checkout fulfillment, and Stripe webhook imports, but intentionally does not change schema, provider endpoints, or public function names. Source of truth: Convex source modules, existing access/checkout/webhook unit tests, and TypeScript import resolution. Must work: existing protected routes can still read `api.entitlements.viewerProductAccess`, scripts can still call `access:*` and `checkoutClaims:*`, checkout claims can still grant access, and Stripe webhook action tests still exercise the same function paths. Must fail safely: no schema change, no provider endpoint move, no second entitlement truth source, and no identity-key migration. Tests: focused unit tests plus lint/typecheck. CI gate: app static and integration surfaces.

### Test Commands

    bun run --cwd apps/web test:unit -- tests/unit/convex-entitlements-module-boundaries.test.ts tests/unit/course-access.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/stripe-webhook-events.test.ts tests/unit/convex-product-access-grant.test.ts
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-convex-entitlement-billing-module-reshape.md
    bun run programs:lint
    bun run markdown:lint -- --paths apps/web/ARCHITECTURE.md docs/exec-plans/completed/2026-05-13-convex-entitlement-billing-module-reshape.md docs/programs/active/2026-05-13-template-first-web-convex-architecture
    git diff --check

## Idempotence and Recovery

This slice is a file-ownership move with compatibility shims. If a test fails because an old path no longer resolves, restore the shim in the old path and import from the new domain module rather than copying the implementation back. If a direct import still points at `entitlements/model` or root checkout validators, update only that import unless the caller is deliberately testing compatibility.

If a partial move is interrupted, inspect `git status --short` and `find apps/web/convex -maxdepth 3 -type f | sort`, then ensure there is one implementation under `entitlements/`, one implementation under `billing/validators.ts`, and old files are re-exports only.

## Artifacts and Notes

- 2026-05-13: `bun run --cwd apps/web test:unit -- tests/unit/convex-entitlements-module-boundaries.test.ts` passed with 1 file and 3 tests.
- 2026-05-13: `bun run --cwd apps/web test:unit -- tests/unit/convex-entitlements-module-boundaries.test.ts tests/unit/course-access.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/stripe-webhook-events.test.ts tests/unit/convex-product-access-grant.test.ts` passed with 7 files and 75 tests.
- 2026-05-13: `bun run --cwd apps/web test:unit -- tests/unit/course-entitlements.test.ts tests/unit/convex-entitlements-module-boundaries.test.ts` passed with 2 files and 16 tests.
- 2026-05-13: `bun run --cwd apps/web format:check` passed after formatting the new boundary test.
- 2026-05-13: `bun run --cwd apps/web lint` passed with 0 warnings and 0 errors.
- 2026-05-13: `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck` passed, including the optimized Next.js build and route listing.
- 2026-05-13: `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-convex-entitlement-billing-module-reshape.md`, `bun run programs:lint`, and scoped `bun run markdown:lint` passed before the plan was moved to `completed/`.
- 2026-05-13: `bun run format`, `bun lint`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck`, and `git diff --check` passed.
- 2026-05-13: After moving the plan to `completed/`, `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-convex-entitlement-billing-module-reshape.md`, `bun run programs:lint`, scoped `bun run markdown:lint`, and `git diff --check` passed.

## Interfaces and Dependencies

This slice depends on Convex validators from `convex/values`, Convex function registration in `apps/web/convex/entitlements.ts`, generated Convex type imports under `apps/web/convex/_generated/`, existing checkout and Stripe webhook modules, and the sibling template's domain naming conventions.

The Program packet is `docs/programs/active/2026-05-13-template-first-web-convex-architecture/`. The immutable planning brief for this slice is `docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-3.md`. The app architecture contracts are `apps/web/ARCHITECTURE.md` and `apps/web/CONVENTIONS.md`.
