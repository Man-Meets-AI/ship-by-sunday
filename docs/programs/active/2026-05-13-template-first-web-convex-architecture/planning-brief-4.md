---
title: Template First Web Convex Planning Brief 4
program_id: template-first-web-convex-architecture
brief_version: 4
status: current
summary: "Fourth planning brief for the hard Convex entitlement rename and legacy billing access reset migration."
read_when:
  - "Writing or resuming the hard Convex entitlement rename child ExecPlan."
  - "Removing temporary access and checkout validator compatibility shims."
  - "Preparing to reset legacy billing/access data before the rebuilt billing model."
---

# Template First Web Convex Planning Brief 4

## Slice

Hard Convex entitlement rename and legacy billing access reset migration.

## Desired Outcome

Remove the temporary compatibility layer from the previous Convex reshape. The app should call `api.entitlements.*` and scripts should call `entitlements:*`; `apps/web/convex/access.ts`, `apps/web/convex/access/**`, `checkoutIntentValidators.ts`, and `checkoutOfferValidators.ts` should be gone. A confirm-gated Convex migration function should be available to dry-run and then delete legacy product-access, checkout-intent, pending-claim, and Stripe webhook event rows when the operator intentionally resets the small current customer data set ahead of the billing rebuild.

## Scope

In scope:

- Move the public Convex function registration boundary from `apps/web/convex/access.ts` to `apps/web/convex/entitlements.ts`.
- Delete `apps/web/convex/access/**`, `apps/web/convex/checkoutIntentValidators.ts`, and `apps/web/convex/checkoutOfferValidators.ts`.
- Update app code, scripts, tests, release-scope classification, and active docs from `api.access.*` and `access:*` to `api.entitlements.*` and `entitlements:*`.
- Regenerate Convex API bindings so `api.entitlements` is typed.
- Add a confirm-gated, dry-run-first legacy reset migration for `productAccessGrants`, `checkoutPurchaseIntents`, `pendingCheckoutClaims`, and `stripeWebhookEvents`.
- Document the destructive reset command and make the default invocation a dry run.

Out of scope:

- Running the destructive reset against production data.
- Adding the new Starter license, Workers subscription, refund, email, or Cal.com tables.
- Changing the Convex HTTP Stripe webhook URL.
- Changing Clerk identity semantics or migrating `clerkUserId` ownership fields.

## Inputs

- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-3.md`
- `docs/exec-plans/completed/2026-05-13-convex-entitlement-billing-module-reshape.md`
- `apps/web/convex/_generated/ai/guidelines.md`
- `apps/web/ARCHITECTURE.md`
- `apps/web/CONVENTIONS.md`
- Convex migration helper guidance in `.agents/skills/convex-migration-helper/`
- Official Convex docs for schema validation and migrations

## Acceptance

- `api.entitlements.viewerProductAccess`, `api.entitlements.resolveViewerFulfillmentTrack`, `entitlements:grantProductAccess`, `entitlements:resetProductAccess`, and `entitlements:getProductAccessDebug` are the only active entitlement function paths.
- No current app, script, or test imports `@/convex/access` or root checkout validator shim files.
- Convex generated API bindings include `entitlements`, `entitlements/model`, `entitlements/validators`, `billing/validators`, and `migrations/legacyBillingReset`, with no `access` module.
- The legacy reset migration defaults to `dryRun: true`, requires `confirmation: "reset_legacy_billing_access_state"`, deletes at most a bounded batch per invocation, reports whether more rows remain, and is not run destructively during this slice.
- Focused entitlement, checkout, webhook, route, script, migration, and release-scope tests pass, followed by app/root static gates.

## Watchpoints

- This intentionally breaks old Convex function references. Deploy frontend and Convex functions together; do not leave a build calling `api.access.*`.
- The reset migration is destructive. Keep it confirm-gated, dry-run by default, and operator-run only.
- The hard rename does not itself require a data migration. The reset migration exists because the current live data set is intentionally disposable for the upcoming billing model rebuild.
