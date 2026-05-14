---
title: Parameterize Hosted Billing Proof By Offer
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Give the hosted Stripe proof an explicit Starter or Workers offer selector while keeping Starter as the default proof path.
post_build_recap: Added the shared hosted proof offer selector, wired production/dev-card proof scripts and release proof planning through it, documented Starter and Workers expectations, and validated helper, planner, checkout route, docs, lint, format, and typecheck surfaces.
program_id: starter-template-source-and-billing-proof
planning_brief: docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/planning-brief-1.md
read_when:
  - Updating hosted Stripe billing proof scripts.
  - Changing Starter or Workers checkout metadata, pricing, or protected access proof.
  - Planning release proof commands for billing integration.
---

# Parameterize Hosted Billing Proof By Offer

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The hosted billing proof currently proves only the Starter checkout lane. The Program's first child slice needs the same proof machinery to cover Starter and Workers without changing the product direction, weakening live Stripe safeguards, or beginning template-source work. After this change, operators can run the hosted proof with `--offer=starter` or `--offer=workers`; omitting the selector continues to prove Starter.

This slice is intentionally narrow. It touches the shared proof helper, the hosted production proof, the hosted dev-card proof, the release proof planner, focused regression tests, and operator docs. It does not fetch or modify the pinned template skeleton and does not implement the ChatGPT template.

## Progress

- [x] 2026-05-13 EDT: Created this child ExecPlan from `planning-brief-1.md`.
- [x] 2026-05-13 EDT: Read the Program packet and local repository guidance before changing files.
- [x] 2026-05-13 EDT: Inspected the hosted production verifier, hosted dev-card verifier, checkout route tests, checkout offer model, managed Stripe price configuration, product access grant debug shape, and release proof planner.
- [x] 2026-05-13 EDT: Implemented the shared hosted proof offer contract and wired it into the production hosted proof, dev-card proof, and release proof planner.
- [x] 2026-05-13 EDT: Added focused regression tests for Starter default behavior, Workers proof configuration, release planner offer propagation, and Workers checkout route metadata.
- [x] 2026-05-13 EDT: Updated release/operator docs for proof commands, selected offer amounts, price envs, destinations, and capabilities.
- [x] 2026-05-13 EDT: Validation passed: `bun run --cwd apps/web test:unit -- tests/unit/hosted-stripe-checkout-proof.test.ts tests/unit/billing-integration-step-planner.test.ts`.
- [x] 2026-05-13 EDT: Validation passed: `bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts`.
- [x] 2026-05-13 EDT: Validation passed: `PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com bun run release:proof -- --proof=billing_integration --offer=workers --dry-run`.
- [x] 2026-05-13 EDT: Validation passed: `PLAYWRIGHT_BASE_URL=https://dev.man-meets-ai.com bun run release:proof -- --proof=billing_integration --offer=workers --dry-run`.
- [x] 2026-05-13 EDT: Validation passed: `bun run --cwd apps/web format:check`, `bun run --cwd apps/web lint`, and `bun run --cwd apps/web typecheck`.
- [x] 2026-05-13 EDT: Validation passed: `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-parameterize-hosted-billing-proof-by-offer.md`, `bun run programs:lint`, and the touched-docs `bun run markdown:lint` command.
- [x] 2026-05-13 EDT: Updated the owning Program ledger after the slice landed.

## Surprises & Discoveries

- 2026-05-13 EDT: The requested Program packet is in `/Users/bazelrex/Developer/ship-by-sunday`, while the initial shell cwd was `/Users/bazelrex/Developer/worker`. The slice implementation is in the Ship by Sunday repo because that is where the Program packet and billing proof scripts live.
- 2026-05-13 EDT: Product access grants already persist offer and capability data through `offerIds`, `lastCheckoutOfferId`, and `capabilities`, so the proof can assert Workers access without adding a new entitlement field.
- 2026-05-13 EDT: The current release proof planner always emits Starter-shaped hosted billing commands because no offer selector is passed through `release:proof`.

## Decision Log

Decision: Keep the offer selector in the existing hosted proof helper.
Rationale: The hosted production verifier, dev-card verifier, and release proof planner all need the same Starter/Workers contract for price env selection, expected amount, route destination, and access capability expectations. A shared helper avoids script-local string drift.
Date: 2026-05-13

Decision: Keep Starter as the default selected offer.
Rationale: Existing production workflows and commands should keep their current behavior unless an operator explicitly asks for Workers.
Date: 2026-05-13

Decision: Treat "destination" in this slice as the product success/access destination, not a Stripe Connect transfer destination.
Rationale: The current app's checkout model is direct Stripe Checkout with managed prices and no configured Connect destination account. The offer-specific destination that exists today is Starter `/starter/home` versus Workers `/workers/setup`.
Date: 2026-05-13

## Outcomes & Retrospective

This plan is complete. Hosted billing proof now accepts `--offer=starter|workers`, defaults to Starter, resolves offer-specific price envs, and uses one shared proof offer contract for public path, checkout button, expected amount, post-checkout destination, access source, and capabilities.

The production hosted proof keeps the existing live safety model: release proof still requires the billing integration approval gate, live mode still uses the direct zero-cost coupon path, and the script still refuses to enter card details in live mode. It now also asserts the selected offer's line-item amount, Checkout Session metadata, route destination, and product access grant offer/capability data when Convex debug is available.

The dev-card proof now exercises the selected public offer page and asserts Checkout Session metadata, PaymentIntent metadata, amount, shared success route, and passwordless handoff destination. Release proof dry-runs confirmed Workers commands are planned for both production and dev hosted targets.

## Context and Orientation

The current offer source of truth is `apps/web/platform/billing/checkout/checkout-offers.ts`. It defines `starter` and `workers`, with Starter priced at 29700 cents and Workers priced at 60000 cents. Starter's public path is `/starter`, its success path is `/starter/home`, and its capabilities are `generate_codebase` and `tutorials`. Workers' public path is `/workers`, its success path is `/workers/setup`, and its capability is `worker`.

The hosted proof helper lives in `apps/web/scripts/lib/hosted-stripe-checkout-proof.mjs`. `apps/web/scripts/verify-hosted-stripe-checkout.mjs` runs the hosted production proof and keeps live Stripe proof on the existing zero-cost no-card path. `apps/web/scripts/verify-dev-stripe-card-payment.mjs` runs the hosted dev-card proof and asserts the paid card amount. `scripts/release/lib/billing-integration-step-planner.mjs` chooses the billing proof command for local, dev, and production release targets.

The checkout route tests are in `apps/web/tests/integration/stripe-checkout-route.test.ts`. Focused helper and release planner tests are in `apps/web/tests/unit/hosted-stripe-checkout-proof.test.ts` and `apps/web/tests/unit/billing-integration-step-planner.test.ts`.

### In Scope

This plan includes the hosted proof offer selector, shared proof helper configuration, hosted production proof script, hosted dev-card proof script, release proof command planning, focused tests, operator docs, this ExecPlan, and the owning Program ledger.

### Out Of Scope

This plan does not fetch or modify the pinned template skeleton, implement the ChatGPT app, change checkout product direction, add a Stripe Connect transfer destination, alter live Stripe approval gates, or modify sibling repositories.

## Plan of Work

First, add a small hosted proof offer contract to the existing helper. It should expose a default `starter` offer, validate `starter|workers`, resolve the offer-specific Stripe price env var, and describe the public path, checkout button test id, expected amount, post-checkout destination, access probe path, and capability expectations.

Next, wire both hosted proof scripts to the selector. The production proof keeps its existing live mode approval gates and zero-cost coupon path, but it creates and verifies metadata for the selected offer. The dev-card proof clicks the selected public offer page and asserts the selected offer's metadata, payment intent metadata, amount, and destination.

Then, pass the selector through release proof planning. `release:proof -- --proof=billing_integration --offer=workers` should emit the Workers hosted proof command while no selector keeps Starter.

Finally, update focused tests and docs. Tests should cover helper defaults, Workers metadata, price env selection, release planner offer propagation, and the checkout route's Workers session metadata. Docs should explain the offer selector, default, price envs, expected amounts, and expected destinations.

## Milestones

The first milestone is shared offer configuration. It is complete when the proof helper resolves Starter and Workers expectations and rejects unsupported offer ids.

The second milestone is proof script parameterization. It is complete when both hosted proof scripts accept `--offer=starter|workers` and assert offer-specific metadata, amount, destination, and access capability.

The third milestone is release planner propagation. It is complete when release proof commands can be planned for Workers and still default to Starter.

The fourth milestone is regression coverage and docs. It is complete when focused tests and operator docs cover the new selector.

The fifth milestone is Program closeout. It is complete when validation evidence and the Program ledger record the landed slice.

## Concrete Steps

1. Update `apps/web/scripts/lib/hosted-stripe-checkout-proof.mjs` with offer config and selector helpers.
2. Update `apps/web/scripts/verify-hosted-stripe-checkout.mjs` to parse `--offer`, choose the selected price env, and assert selected offer access.
3. Update `apps/web/scripts/verify-dev-stripe-card-payment.mjs` to parse `--offer`, click the selected public page, and assert selected offer payment details.
4. Update `scripts/release/run-release-proof.mjs` and `scripts/release/lib/billing-integration-step-planner.mjs` so release proof can pass the selector to hosted billing commands.
5. Add focused unit/integration coverage for helper behavior, release planner output, and Workers checkout route metadata.
6. Update `docs/release-workflow.md` and the relevant app docs that list billing proof commands.
7. Run focused tests first, then `bun run programs:lint`, plan lint, and broader relevant checks.
8. Update this ExecPlan and the Program ledger with the actual result.

## Validation and Acceptance

The implementation is accepted when:

- `--offer=starter|workers` works for the hosted production proof and hosted dev-card proof.
- Omitting `--offer` keeps Starter behavior.
- The selected offer controls Stripe price env selection, Checkout Session metadata, PaymentIntent metadata, expected amount, post-checkout destination, and access/capability assertions.
- Live hosted proof still requires the existing zero-cost Checkout Session before navigation.
- Release proof planning can emit Workers hosted billing commands without changing the default Starter workflow.
- Focused tests and docs reflect the new operator contract.

### Test Commands

Run these focused checks first:

    bun run --cwd apps/web test:unit -- tests/unit/hosted-stripe-checkout-proof.test.ts tests/unit/billing-integration-step-planner.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts

Run planning and docs checks after edits:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-parameterize-hosted-billing-proof-by-offer.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-parameterize-hosted-billing-proof-by-offer.md docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/program.md docs/release-workflow.md apps/web/content/docs/commands.mdx apps/web/content/docs/deploy-to-vercel.mdx apps/web/content/docs/ship-live.mdx .github/codex/release-policy.md

Run broader relevant checks if the focused proof surface passes:

    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck

Live Stripe proof commands remain approval-gated and should not be run unless the operator explicitly approves the existing live billing proof flow.

## Idempotence and Recovery

All helper changes should be deterministic and side-effect free. The hosted production proof must keep creating one-time zero-cost coupons only inside the existing proof command and must keep refusing live card entry. If validation fails, inspect the selected offer id, price env resolution, and route destination before changing checkout behavior.

If the release planner emits the wrong command, fix the planner arguments rather than duplicating command construction in callers. If a Workers protected page cannot render after access is granted, keep the proof assertion focused on the `worker` capability and `/workers/setup` destination; do not build new Workers setup UI in this slice.

## Artifacts and Notes

- Program packet: `docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/`
- Child slice brief: `docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/planning-brief-1.md`
- No sibling repo writes are allowed in this slice.

## Interfaces and Dependencies

The proof depends on Stripe Checkout, managed Stripe price configuration, Clerk-hosted proof sign-in, Convex product access grants, and the current Starter/Workers checkout offer model. The implementation must preserve the existing billing approval gates and must not fetch mutable template source.
