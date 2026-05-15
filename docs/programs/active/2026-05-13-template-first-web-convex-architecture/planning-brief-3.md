---
title: Template First Web Convex Planning Brief 3
program_id: template-first-web-convex-architecture
brief_version: 3
status: current
summary: "Third planning brief for the Convex entitlement and billing module reshape."
read_when:
  - "Writing or resuming the Convex module reshape child ExecPlan."
  - "Moving product access helpers toward an entitlement domain."
  - "Moving checkout validators toward a billing domain without changing public Convex functions."
---

# Template First Web Convex Planning Brief 3

## Slice

Convex entitlement and billing module reshape.

## Desired Outcome

Move the current Convex access implementation toward the sibling template's domain naming without changing runtime behavior, schema, provider endpoints, or existing public Convex function paths. After this slice, entitlement logic should live under an `entitlements` domain, checkout validators should live under a `billing` domain, and existing callers of `access:*`, `checkoutClaims:*`, `stripeWebhook:*`, and the Convex HTTP webhook should continue to work.

## Scope

In scope:

- Keep `apps/web/convex/schema.ts` unchanged except for import locations.
- Keep public Convex function names and module paths currently used by app code, tests, scripts, and release proof unchanged.
- Move product access helper implementation from `apps/web/convex/entitlements/model.ts`, `apps/web/convex/entitlements/types.ts`, and `apps/web/convex/entitlements/validators.ts` into `apps/web/convex/entitlements/`.
- Leave compatibility re-exports under `apps/web/convex/entitlements/` so older imports and historical docs remain true during later slices.
- Update Convex modules that enforce product access to import from `apps/web/convex/entitlements/` directly.
- Move checkout offer and checkout intent validators into `apps/web/convex/billing/validators.ts`.
- Leave `checkoutIntentValidators.ts` and `checkoutOfferValidators.ts` as compatibility re-exports.
- Add focused tests proving compatibility exports still point at the new domain modules.
- Run focused Convex/billing unit tests plus lint, typecheck, plan lint, Program lint, markdown lint, and whitespace validation as feasible.

Out of scope:

- Convex schema changes or data migrations.
- Renaming `access:*`, `checkoutClaims:*`, `checkoutClaimsActions:*`, `stripeWebhook:*`, or `stripeWebhookEvents:*` function paths.
- Moving the Stripe webhook URL or replacing the Convex HTTP webhook endpoint.
- Implementing Starter annual license tables, Workers subscriptions, Stripe Customer Portal, Cal.com mirrors, Resend delivery state, or Sentry setup.
- Changing Clerk identity semantics from the current `identity.subject` product access key. A later auth/data-model slice can migrate identity keys with its own proof.
- Adding or changing external provider setup.

## Inputs

- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/plan-split-recommendation.md`
- `apps/web/ARCHITECTURE.md`
- `apps/web/CONVENTIONS.md`
- `apps/web/AGENTS.md`
- `docs/release-workflow.md`
- `docs/exec-plans/PLANS.md`
- `apps/web/convex/_generated/ai/guidelines.md`
- Sibling template Convex source: `~/Developer/next-js-convex-clerk-stripe-template/convex`

## Acceptance

- The child ExecPlan records `program_id: "template-first-web-convex-architecture"` and this planning brief path.
- Entitlement helper implementation lives under `apps/web/convex/entitlements/`.
- `apps/web/convex/entitlements.ts` still exports the current public/internal Convex functions and keeps the existing `api.entitlements.viewerProductAccess` and `access:*` script contract intact.
- `apps/web/convex/entitlements/model.ts`, `apps/web/convex/entitlements/types.ts`, and `apps/web/convex/entitlements/validators.ts` remain compatibility shims rather than independent implementations.
- Checkout intent and offer validators live in `apps/web/convex/billing/validators.ts`, with root validator files retained as compatibility shims.
- Existing Convex modules that check product access import the new entitlement implementation directly.
- Focused tests prove the compatibility shims point at the new domain modules.
- Focused checkout, access, Stripe webhook, and product access tests pass.
- No external provider setup changes are introduced in this slice.

## Watchpoints

- This is a P0/P1-adjacent structural slice because product access and Stripe fulfillment depend on these modules. Keep the diff mechanical and compatibility-preserving.
- Do not accept user ids as client authorization arguments. Existing server-trusted internal mutations may still accept Clerk ids where the current contract already does so.
- Do not change the access key from `identity.subject` in this slice. The Convex guideline prefers `tokenIdentifier`, but current tables and app code store Clerk user ids; that migration needs its own plan.
- Do not duplicate entitlement truth by adding a second table or second access decision path.
- Keep validator objects shared so schema and function validators cannot drift during later billing work.
