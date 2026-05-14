---
title: Convex Entitlement Hard Rename And Reset Migration
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Remove Convex access compatibility shims, make entitlements the public function module, and add a dry-run-first legacy billing/access reset migration.
post_build_recap: Removed the access compatibility function path, made entitlements the only active Convex entitlement module, added and tested a confirm-gated legacy billing/access reset migration, synced hosted Convex dev functions, and proved the reset in dry-run mode without deleting rows.
program_id: template-first-web-convex-architecture
planning_brief: docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-4.md
read_when:
  - Resuming the hard Convex entitlement rename.
  - Preparing to run or review the legacy billing access reset migration.
  - Checking why `api.access` and `access:*` are no longer supported.
---

# Convex Entitlement Hard Rename And Reset Migration

This document is a living execution plan for the hard Convex entitlement rename and reset migration slice of the template-first web and Convex Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The previous Convex reshape left compatibility shims for `access` so deployed callers could keep working. The product decision is now to break cleanly because the live data set is tiny and the next billing model should not inherit compatibility debt. After this slice, the entitlement function module is `apps/web/convex/entitlements.ts`, app code calls `api.entitlements.*`, scripts call `entitlements:*`, and an explicit dry-run-first migration can reset legacy access and checkout rows when the operator chooses to discard them.

## Progress

- [x] 2026-05-13: Read the Convex skill, migration helper skill, local Convex AI guidelines, and official Convex docs for schema validation and migration behavior.
- [x] 2026-05-13: Confirmed the function rename itself needs no data migration, while destructive data reset should be a separate confirm-gated migration.
- [x] 2026-05-13: Moved `apps/web/convex/access.ts` to `apps/web/convex/entitlements.ts` and deleted `apps/web/convex/access/**`.
- [x] 2026-05-13: Deleted root checkout validator shims.
- [x] 2026-05-13: Updated app, script, test, and release-scope callers to `api.entitlements.*` and `entitlements:*`.
- [x] 2026-05-13: Added `apps/web/convex/migrations/legacyBillingReset.ts` as a dry-run-first reset migration.
- [x] 2026-05-13: Regenerated Convex API bindings and repaired type/test issues.
- [x] 2026-05-13: Synced hosted Convex dev functions with `bunx convex dev --once --typecheck disable`.
- [x] 2026-05-13: Proved the reset migration in hosted dry-run mode; it reported 8 product access grants, 5 pending checkout claims, 0 checkout purchase intents, and 0 Stripe webhook events, with 0 deletes.
- [x] 2026-05-13: Updated Program, app architecture docs, and this ExecPlan after validation.
- [x] 2026-05-13: Ran focused and broad validation, with root lint limited by unrelated local-runner `unknown` boundary changes outside this slice.

## Surprises & Discoveries

`bunx convex codegen --typecheck enable` regenerated `apps/web/convex/_generated/api.d.ts`, but exited non-zero because the Convex CLI did not find a `tsc` binary from that invocation. `bunx convex codegen --typecheck disable` succeeded, and the repo's normal `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck` remains the authoritative TypeScript gate for this slice.

`bunx convex run migrations/legacyBillingReset:resetLegacyBillingAccessState '{"confirmation":"reset_legacy_billing_access_state","dryRun":true}'` initially reported only the old `access:*` functions on the hosted dev deployment. Running `bunx convex dev --once --typecheck disable` pushed the renamed Convex function set, after which the migration dry run succeeded.

## Decision Log

Decision: Delete the compatibility shims instead of keeping `access` as a transitional module.

Rationale: The user explicitly accepted a breaking change and a small operator-run migration for the current real users. Keeping old function paths would preserve exactly the ambiguity this Program is removing.

Date: 2026-05-13.

Decision: Add a small-table reset mutation instead of installing `@convex-dev/migrations` now.

Rationale: Official Convex guidance prefers the migrations component for non-trivial live migrations, but the requested reset covers a known tiny legacy data set and uses bounded batches, dry-run default, and an explicit confirmation literal. The billing rebuild can still add `@convex-dev/migrations` when it introduces real schema migrations.

Date: 2026-05-13.

## Outcomes & Retrospective

This slice removed the compatibility shims instead of preserving `access` as a public function path. The active Convex entitlement function module is now `apps/web/convex/entitlements.ts`, implementation internals live under `apps/web/convex/entitlements/`, and checkout validators live under `apps/web/convex/billing/validators.ts`.

The reset migration lives at `apps/web/convex/migrations/legacyBillingReset.ts`. It defaults to dry run, requires the literal confirmation `reset_legacy_billing_access_state`, deletes at most 100 rows per target table per destructive invocation, and reports per-table `matched`, `deleted`, and `hasMore` counts. The destructive reset was not run in this slice.

Validation passed for Convex codegen, hosted Convex dev sync, hosted migration dry run, focused entitlement/checkout/webhook/release-scope tests, app formatting, app lint, app typecheck/build, root formatting, root typecheck, ExecPlan lint, and Program lint. Root lint is blocked by unrelated dirty `packages/local-runner` files that violate the repo's `unknown` boundary lint; this slice did not touch or repair those files.

## Context and Orientation

The hard rename touches Convex function references, not just file names. Convex public functions are file-routed: a function exported from `apps/web/convex/entitlements.ts` is referenced as `api.entitlements.<name>` or `entitlements:<name>` from the CLI. Old `api.access.*` and `access:*` callers will fail after this change.

The legacy data reset migration lives in `apps/web/convex/migrations/legacyBillingReset.ts`. It targets only the current checkout/access handoff tables: `productAccessGrants`, `checkoutPurchaseIntents`, `pendingCheckoutClaims`, and `stripeWebhookEvents`. It does not touch workspace, codebase, course, support, Codex, observability, or user-auth data.

### In Scope

This plan removes the `access` public module and root checkout validator shims, updates current callers, regenerates Convex API bindings, adds the confirm-gated reset migration, and validates the affected access, checkout, webhook, release-scope, and script surfaces.

### Out Of Scope

This plan does not run the destructive reset, add the new billing schema, change the Stripe webhook URL, add Resend/Sentry/Cal.com dependencies, or migrate Clerk identity keys.

## Plan of Work

First, complete the hard rename by moving `apps/web/convex/access.ts` to `apps/web/convex/entitlements.ts`, deleting `apps/web/convex/access/**`, deleting the root checkout validator shim files, and replacing current callers with `api.entitlements.*` and `entitlements:*`.

Second, add `apps/web/convex/migrations/legacyBillingReset.ts`. The function should default to dry run, require the exact confirmation literal `reset_legacy_billing_access_state`, operate in bounded batches, and report per-table counts plus whether another invocation is needed.

Third, regenerate Convex bindings, update docs and Program state, then run focused tests before app and repo-level gates.

## Milestones

Milestone 1 is the hard rename. It is complete when no current source, script, or test refers to `api.access`, `access:*`, `@/convex/access`, `checkoutIntentValidators`, or `checkoutOfferValidators`.

Milestone 2 is migration prep. It is complete when the reset function exists, is confirm-gated, defaults to dry run, and has a test proving dry-run and destructive paths.

Milestone 3 is validation and Program sync. It is complete when focused tests, static gates, plan/Program/markdown lint, and whitespace checks pass, and the Program points at the next slice.

## Concrete Steps

Work from the repository root, then enter the app before running Convex CLI commands:

    cd /Users/bazelrex/Developer/ship-by-sunday
    cd apps/web

Regenerate Convex API bindings:

    bunx convex codegen --typecheck disable

Dry-run the legacy reset only after the function is deployed to the intended hosted Convex environment. Hosted dev:

    bunx convex run migrations/legacyBillingReset:resetLegacyBillingAccessState '{"confirmation":"reset_legacy_billing_access_state","dryRun":true}'

Production:

    bunx convex run --prod migrations/legacyBillingReset:resetLegacyBillingAccessState '{"confirmation":"reset_legacy_billing_access_state","dryRun":true}'

Run the destructive reset only by explicit operator choice after inspecting a matching dry-run result for the same environment, repeating until `hasMore` is `false`. Hosted dev:

    bunx convex run migrations/legacyBillingReset:resetLegacyBillingAccessState '{"confirmation":"reset_legacy_billing_access_state","dryRun":false}'

Production:

    bunx convex run --prod migrations/legacyBillingReset:resetLegacyBillingAccessState '{"confirmation":"reset_legacy_billing_access_state","dryRun":false}'

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/convex-entitlements-module-boundaries.test.ts tests/unit/convex-legacy-billing-reset.test.ts tests/unit/course-entitlements.test.ts tests/unit/course-access.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/stripe-webhook-events.test.ts tests/unit/convex-product-access-grant.test.ts tests/unit/release-scope.test.ts

Run broad validation:

    bun run format
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-convex-entitlement-hard-rename-and-reset-migration.md
    bun run programs:lint
    bun run markdown:lint -- --paths apps/web/ARCHITECTURE.md docs/exec-plans/completed/2026-05-13-convex-entitlement-hard-rename-and-reset-migration.md docs/programs/active/2026-05-13-template-first-web-convex-architecture
    git diff --check

## Validation and Acceptance

Acceptance requires a hard function-path rename, no compatibility shim leftovers in current code, generated Convex API bindings that expose `entitlements` instead of `access`, and an operator-run reset migration that can be dry-run before deletion.

Feature: hard Convex entitlement rename and legacy reset migration. Risk: P1/P0-adjacent because it breaks access function paths and includes a destructive migration function, but the destructive function is not run in this slice. Source of truth: generated Convex API bindings, focused tests, and the reset migration result shape. Must work: protected access checks, checkout success polling, scripts, hosted checkout proof helpers, and release-scope detection use `entitlements`. Must fail safely: old `access` function paths are absent, reset defaults to dry run, destructive reset requires confirmation, and no provider endpoint changes occur. Tests: focused unit tests plus app/root static gates. CI gate: app static, package static, and release-scope unit coverage.

### Test Commands

    bun run --cwd apps/web test:unit -- tests/unit/convex-entitlements-module-boundaries.test.ts tests/unit/convex-legacy-billing-reset.test.ts tests/unit/course-entitlements.test.ts tests/unit/course-access.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/stripe-webhook-events.test.ts tests/unit/convex-product-access-grant.test.ts tests/unit/release-scope.test.ts
    bun run format
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-convex-entitlement-hard-rename-and-reset-migration.md
    bun run programs:lint
    bun run markdown:lint -- --paths apps/web/ARCHITECTURE.md docs/exec-plans/completed/2026-05-13-convex-entitlement-hard-rename-and-reset-migration.md docs/programs/active/2026-05-13-template-first-web-convex-architecture
    git diff --check

## Idempotence and Recovery

The function rename is not backward-compatible. If validation finds a stale caller, update it to `entitlements` rather than restoring `access`. If Convex API bindings are stale, regenerate with `bunx convex codegen --typecheck disable` from `apps/web`, then rely on the repo typecheck for TypeScript.

The reset migration is safe to dry-run repeatedly. The destructive invocation is intentionally repeatable in batches; repeat it until `hasMore` is `false`. If it is run by mistake, the deleted legacy checkout/access rows are gone unless restored from Convex backup/export or provider state.

## Artifacts and Notes

- `bunx convex codegen --typecheck disable` passed.
- `bunx convex dev --once --typecheck disable` passed and synced hosted Convex dev functions.
- Hosted dry run passed: `bunx convex run migrations/legacyBillingReset:resetLegacyBillingAccessState '{"confirmation":"reset_legacy_billing_access_state","dryRun":true}'`.
- `bun run --cwd apps/web test:unit -- tests/unit/convex-entitlements-module-boundaries.test.ts tests/unit/convex-legacy-billing-reset.test.ts tests/unit/course-entitlements.test.ts tests/unit/course-access.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/stripe-webhook-events.test.ts tests/unit/convex-product-access-grant.test.ts tests/unit/release-scope.test.ts` passed with 10 files and 94 tests.
- `bun run --cwd apps/web format:check` passed after formatting.
- `bun run --cwd apps/web lint` passed.
- `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck` passed.
- `bun run format` passed.
- `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck` passed.
- `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-convex-entitlement-hard-rename-and-reset-migration.md` passed before the plan was moved to completed.
- `bun run programs:lint` passed.
- `bun lint` is blocked outside this slice by existing `packages/local-runner` `unknown` boundary lint violations.

## Interfaces and Dependencies

This slice depends on Convex file-based function references, `apps/web/convex/_generated/api.d.ts`, current checkout/access tests, release-scope classification, and the operator's hosted Convex environment. It also depends on the user-approved policy that the current real customer data set can be overwritten or reset during the billing rebuild.
