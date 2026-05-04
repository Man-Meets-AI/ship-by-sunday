---
title: Existing Codebase Checkout Intent Routing
status: active
created_at: 2026-05-04
completed_at: null
summary: Persist buyer starting point through checkout so generated-codebase buyers continue to `/codebase` and existing-codebase buyers route to `/workspace/setup`.
post_build_recap: null
program_id: customer-agentic-operating-system
planning_brief: docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Implementing checkout intent tracking for generated-codebase versus existing-codebase fulfillment.
  - Updating homepage CTAs, Stripe checkout metadata, Convex access grants, or checkout success routing.
  - Verifying that `/codebase` and `/workspace/setup` remain separate fulfillment routes.
---

# Existing Codebase Checkout Intent Routing

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday needs to know whether a buyer arrived from `I have an idea` or `I have a codebase` before it can fulfill the purchase correctly. After this change, generated-codebase buyers continue to `/codebase`, existing-codebase buyers land on `/workspace/setup`, and legacy or missing intent lands on a small protected choice screen instead of being guessed. The user-visible proof is a checkout path whose metadata, access grant, and success redirect preserve the buyer's intended fulfillment lane.

This plan is intentionally narrow. It creates the durable intent and routing contract that later runner setup, doctor pass, findings, and workflow approval plans depend on.

## Progress

- [x] 2026-05-04 EDT: Created this child ExecPlan from `planning-brief-2.md`.
- [x] 2026-05-04 EDT: Inspected current homepage CTA, checkout route, Stripe session parameter, checkout success, Convex checkout claim, product access grant, route map, and protected workspace surfaces immediately before implementation.
- [x] 2026-05-04 EDT: Defined the intent types and parse/validation helpers in the checkout billing boundary plus Convex validators.
- [x] 2026-05-04 EDT: Persisted intent in checkout request input, Stripe session metadata, payment intent metadata, pending checkout claims, product access grants, and checkout success state.
- [x] 2026-05-04 EDT: Added route constants and fulfillment routing for `/codebase`, `/workspace/setup`, and `/workspace/choose`.
- [x] 2026-05-04 EDT: Added focused unit, integration, and UI tests for metadata propagation, Convex durability, success routing, and homepage CTA intent wiring.
- [x] 2026-05-04 EDT: Refreshed the owning Program and this ExecPlan with validation evidence for the checkout intent routing slice.
- [x] 2026-05-04 EDT: Validation passed: `bun run --cwd apps/web test:unit -- tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/convex-product-access-grant.test.ts`.
- [x] 2026-05-04 EDT: Validation passed: `bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts`.
- [x] 2026-05-04 EDT: Validation passed using the repo's actual UI script: `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-button.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx`.
- [x] 2026-05-04 EDT: Additional homepage validation passed: `bun run --cwd apps/web test:unit -- tests/unit/home-page-render-model.test.ts tests/unit/home-page-primary-cta.test.tsx tests/unit/home-page-content.test.ts` and `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/home-page-product-preview.test.tsx`.
- [x] 2026-05-04 EDT: App static validation passed: `bun run --cwd apps/web format`, `bun run --cwd apps/web lint`, and `bun run --cwd apps/web typecheck`.
- [x] 2026-05-04 EDT: Planning and docs validation passed: `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-04-existing-codebase-checkout-intent-routing.md`, `bun run programs:lint`, and `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-04-existing-codebase-checkout-intent-routing.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md apps/web/content/docs/route-map.mdx apps/web/content/docs/configure-the-homepage.mdx`.
- [x] 2026-05-04 EDT: Browser proof passed on local `http://localhost:3024`: existing-codebase homepage branch rendered the `Set up my codebase` CTA on desktop `1440x1000` and mobile `390x844`.
- [x] 2026-05-04 EDT: Addressed review-found fulfillment routing and action-scope gaps: returning existing-codebase buyers now resume to `/workspace/setup`, missing intent resumes to `/workspace/choose`, and checkout email fulfillment is webhook/internal-only rather than a public unauthenticated Convex action.

## Surprises & Discoveries

- 2026-05-04 EDT: `apps/web/package.json` does not have the plan's `test:integration-ui` script. The equivalent local script is `bun run --cwd apps/web test:integration:ui -- ...`; that command passed for the focused checkout UI tests.
- 2026-05-04 EDT: The existing-codebase homepage branch had no checkout CTA, so selected starting point could not reach Stripe. The implementation adds a narrow existing-codebase checkout CTA only on that branch and leaves the real setup UX to the setup plan.
- 2026-05-04 EDT: Local browser proof surfaced existing Clerk development-key redirect-loop warnings while the public homepage still rendered. This is environment noise, not a checkout intent routing failure.

## Decision Log

Decision: Use `buyerStartingPoint`, `checkoutCtaId`, and `fulfillmentTrack` as the checkout intent fields.
Rationale: `buyerStartingPoint` records what the buyer selected, `checkoutCtaId` records the surface that started checkout, and `fulfillmentTrack` records the durable product lane used for routing after payment. Keeping these separate prevents CTA analytics from becoming the fulfillment contract.
Date: 2026-05-04

Decision: Keep this plan out of runner, doctor-pass, findings, and worker implementation.
Rationale: Later slices need the intent contract first. Mixing local runner setup or doctor-pass UI into checkout routing would make the first implementation too broad and harder to validate.
Date: 2026-05-04

Decision: Route missing or legacy intent to a choice screen instead of defaulting to existing-codebase setup.
Rationale: Existing purchases and old checkout links may not carry the new metadata. A small choice screen is safer than silently sending a generated-codebase buyer into setup or an existing-codebase buyer into `/codebase`.
Date: 2026-05-04

Decision: Keep homepage hero and pricing checkout intent on the generated-codebase track, and use the product-preview existing-codebase branch for existing-codebase checkout.
Rationale: Hero and pricing CTAs do not know the visitor's selected branch. The branch-specific CTA is the only current surface with an explicit existing-codebase selection.
Date: 2026-05-04

Decision: Keep checkout email fulfillment on the internal webhook/server path.
Rationale: Fulfillment by checkout email can create or repair Clerk-linked access, so it must not be a public unauthenticated Convex action callable by arbitrary clients with a session id. Public recovery remains limited to signed-in claim flows, while the Stripe webhook uses an internal action for guest-email fulfillment.
Date: 2026-05-04

Decision: Route returning granted viewers from stored `fulfillmentTrack` before generated-codebase resume state.
Rationale: Existing-codebase buyers should not be redirected into `/codebase` just because the generated-codebase resume query has a default destination. Product access intent is the durable lane selector; generated-codebase resume state only applies to generated-codebase grants.
Date: 2026-05-04

## Outcomes & Retrospective

This plan is active. Fill this section after implementation with the actual fields, routes, tests, and any intentionally deferred follow-up.

## Context and Orientation

The current app is generated-codebase-first. `apps/web/config/product.ts` defines `routeConfig.codebase = "/codebase"`, and checkout success currently opens the codebase workspace once access is ready. Checkout session creation starts in `apps/web/app/api/stripe/checkout/route.ts` and `apps/web/app/api/stripe/checkout/express/route.ts`, both of which call `apps/web/platform/billing/checkout/checkout-session-params.ts`. Stripe recovery and success routing pass through `apps/web/platform/billing/checkout/checkout-session.ts`, `apps/web/platform/billing/checkout/checkout-session-recovery.ts`, `apps/web/app/checkout/success/page.tsx`, and `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts`.

Convex stores product access in `apps/web/convex/schema.ts` through `productAccessGrants` and pending signed-out checkout handoff in `pendingCheckoutClaims`. The mutation/query logic lives in `apps/web/convex/access/model.ts`, `apps/web/convex/access/validators.ts`, `apps/web/convex/checkoutClaims.ts`, `apps/web/convex/checkoutClaimsActions.ts`, `apps/web/convex/stripeWebhook.ts`, and `apps/web/convex/http.ts`. Current access grants know payment and access status, but they do not know whether the buyer should enter generated-codebase fulfillment or existing-codebase setup.

Before implementation touches `apps/web`, read `apps/web/AGENTS.md`. Because this slice touches checkout, entitlement, routes, and Convex, also read `docs/release-workflow.md`, `apps/web/convex/_generated/ai/guidelines.md`, and the relevant Next.js docs under `apps/web/node_modules/next/dist/docs/` for any App Router, route-handler, redirect, or server/client boundary changes. Before changing homepage CTA behavior, read `apps/web/content/docs/configure-the-homepage.mdx`.

### In Scope

This plan includes checkout intent types, parsing and validation, homepage or pricing CTA intent submission, Stripe metadata, payment intent metadata, pending checkout claim storage, product access grant storage, checkout success state, route constants, missing-intent choice routing, focused tests, route-map docs, and Program/ExecPlan refresh.

This plan may add a minimal protected placeholder route for `/workspace/setup` or a protected choice route if redirect proof would otherwise 404. Any placeholder must explicitly defer real setup UI to the later `existing-codebase-setup-ui` plan.

### Out Of Scope

This plan does not implement Machine Setup, Project Setup, local runner pairing, daemon events, one-shot mode, Codex profile installation, doctor-pass probes, `.sbs/` local state, findings upload, findings UI, workflow packets, write leases, PR delivery, worker queues, managed GitHub, package/update-channel mechanics, or the generated-repo operating pack.

This plan must not rename the generated-codebase `/codebase` route, replace the existing review/download flow, or overload generated-codebase `projectDefinitions` and `codebaseWorkflowStates` for existing-codebase state.

## Plan of Work

Start by adding a small domain model for checkout intent. The implementation should define `buyerStartingPoint` as `no_codebase`, `existing_codebase`, or `unspecified`; `fulfillmentTrack` as `generated_codebase`, `existing_codebase_doctor`, or `unspecified`; and `checkoutCtaId` as a specific string identifier from the CTA surface. Put parsing and normalization in a billing or product-intent module instead of scattering string checks through route handlers.

Next, update the checkout request path. The checkout buttons or forms should send the selected intent to `apps/web/app/api/stripe/checkout/route.ts` and the express checkout route where applicable. `apps/web/platform/billing/checkout/checkout-session-params.ts` should include the normalized fields in both Stripe checkout session metadata and payment intent metadata, while preserving `courseSlug` and `clerkUserId`.

Then update Convex handoff storage. `pendingCheckoutClaims` and `productAccessGrants` should store the normalized fulfillment fields so signed-out checkout, webhook fulfillment, email handoff, and later access checks agree. Add validators in the appropriate Convex validator modules and keep unknown metadata mapped to `unspecified` rather than throwing away paid access.

After that, update checkout success routing. Once access is validated, generated-codebase fulfillment should point to `/codebase`, existing-codebase fulfillment should point to `/workspace/setup`, and `unspecified` should point to the protected choice screen. The choice screen can be minimal in this plan: it should let the buyer choose generated codebase or existing codebase setup and persist the selection before redirecting.

Finally, update tests and docs. Focused tests should cover metadata creation, signed-in checkout, signed-out checkout claim, webhook/email fulfillment, checkout success view model routing, and legacy checkout sessions without intent. Update `apps/web/content/docs/route-map.mdx` and the Program/ExecPlan notes when the route contract changes.

## Milestones

The first milestone is intent modeling. It is complete when typed helpers and validators exist, and tests prove unknown or absent intent normalizes to `unspecified`.

The second milestone is checkout metadata propagation. It is complete when both standard and express Stripe checkout sessions include `buyerStartingPoint`, `checkoutCtaId`, and `fulfillmentTrack` in session and payment intent metadata.

The third milestone is Convex durability. It is complete when pending checkout claims and product access grants store the normalized fulfillment fields and legacy rows without those fields still work.

The fourth milestone is success routing. It is complete when checkout success sends generated buyers to `/codebase`, existing-codebase buyers to `/workspace/setup`, and unspecified buyers to a protected choice screen.

The fifth milestone is proof and docs. It is complete when focused tests, planning validation, route docs, and this ExecPlan record the observed behavior.

## Concrete Steps

From the repo root, inspect the current files before editing:

    sed -n '1,120p' apps/web/platform/billing/checkout/checkout-session-params.ts
    sed -n '1,260p' apps/web/platform/billing/checkout/checkout-session.ts
    sed -n '1,220p' apps/web/convex/schema.ts
    sed -n '1,240p' apps/web/convex/access/model.ts
    sed -n '1,220p' apps/web/convex/checkoutClaims.ts
    sed -n '1,220p' apps/web/app/checkout/success/_lib/checkout-success-view-model.ts

Read required local docs before implementation:

    sed -n '1,220p' apps/web/AGENTS.md
    sed -n '1,220p' docs/release-workflow.md
    sed -n '1,220p' apps/web/convex/_generated/ai/guidelines.md
    sed -n '1,220p' apps/web/content/docs/configure-the-homepage.mdx

After implementation, run the focused checkout and route tests first:

    bun run --cwd apps/web test:unit -- tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/convex-product-access-grant.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts
    bun run --cwd apps/web test:integration-ui -- tests/integration-ui/checkout-button.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx

Run planning and static validation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-04-existing-codebase-checkout-intent-routing.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-04-existing-codebase-checkout-intent-routing.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md apps/web/content/docs/route-map.mdx
    git diff --check

Broaden before completion:

    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck

## Validation and Acceptance

The change is accepted when a buyer intent selected before checkout is visible in Stripe session metadata, payment intent metadata, Convex pending checkout claims, product access grants, and checkout success routing. Tests must show generated-codebase intent routes to `/codebase`, existing-codebase intent routes to `/workspace/setup`, and absent legacy intent routes to the choice screen without breaking paid access.

The route map must say that `/codebase` remains the generated-codebase protected landing and `/workspace/setup` is the existing-codebase setup entry. Any placeholder setup or choice screen must be clearly scoped as an entry point only, not the final setup UX.

### Test Commands

Run these commands from the repo root:

    bun run --cwd apps/web test:unit -- tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/convex-product-access-grant.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts
    bun run --cwd apps/web test:integration-ui -- tests/integration-ui/checkout-button.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-04-existing-codebase-checkout-intent-routing.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-04-existing-codebase-checkout-intent-routing.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md apps/web/content/docs/route-map.mdx
    git diff --check

If implementation changes the visible homepage or protected route UI, add browser proof for one desktop and one mobile viewport before marking the plan complete.

## Idempotence and Recovery

Intent parsing must be tolerant of old sessions and grants. Missing or unknown fields should normalize to `unspecified`, not block access to a paid purchase.

If a customer starts checkout with one intent and later changes on the choice screen, persist the explicit choice as the fulfillment track for future routing. Do not mutate Stripe history; record the resolved fulfillment track in app-owned state.

If the `/workspace/setup` route is not ready when this plan lands, use a minimal placeholder that names setup as the next step and links back to the choice screen. Remove or replace the placeholder in the later setup UI plan.

If tests reveal existing paid checkout fixtures lack intent fields, update fixtures to include both legacy and new cases. Do not delete legacy coverage.

## Artifacts and Notes

Owning Program: `docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md`.

Planning brief: `docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`.

Scratch note: `support-codebases.md`.

Current generated-codebase route: `/codebase`.

Planned existing-codebase setup route: `/workspace/setup`.

## Interfaces and Dependencies

This plan depends on `apps/web/AGENTS.md`, `docs/release-workflow.md`, `apps/web/convex/_generated/ai/guidelines.md`, `apps/web/content/docs/configure-the-homepage.mdx`, `apps/web/config/product.ts`, `apps/web/app/_content/home-page.ts`, `apps/web/app/_lib/home-page-render-model.ts`, `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx`, `apps/web/app/checkout/_hooks/use-stripe-checkout.ts`, `apps/web/app/checkout/_components/checkout-button.tsx`, `apps/web/app/checkout/_components/express-checkout-button.tsx`, `apps/web/app/api/stripe/checkout/route.ts`, `apps/web/app/api/stripe/checkout/express/route.ts`, `apps/web/platform/billing/checkout/checkout-session-params.ts`, `apps/web/platform/billing/checkout/checkout-session.ts`, `apps/web/platform/billing/checkout/checkout-session-recovery.ts`, `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts`, `apps/web/convex/schema.ts`, `apps/web/convex/access/model.ts`, `apps/web/convex/access/validators.ts`, `apps/web/convex/checkoutClaims.ts`, `apps/web/convex/checkoutClaimsActions.ts`, `apps/web/convex/stripeWebhook.ts`, `apps/web/convex/http.ts`, and `apps/web/content/docs/route-map.mdx`.
