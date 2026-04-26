---
title: App Structure Refactor Planning Brief 10
program_id: app-structure-refactor
brief_version: 10
status: current
summary: Make checkout and billing responsibilities easier to audit without changing Stripe, promo, webhook, environment, or release-proof behavior.
read_when:
  - Writing the tenth child ExecPlan for the app structure refactor Program.
  - Separating the Stripe checkout route from checkout session parameter assembly.
  - Preserving Stripe checkout, webhook, pricing, promo code, environment, billing proof, and Convex behavior during billing cleanup.
---

# App Structure Refactor Planning Brief 10

## Planning Refresh

This is the tenth planning brief for the app structure refactor Program.

The first nine child ExecPlans are complete. They made boundary imports explicit, extracted the shared workspace shell, moved route-owned wrapper surfaces into App Router private folders, moved marketing-only effects and a blueprint-only hook out of generic shared locations, moved persisted completion field IDs into the lesson model, moved lesson URL construction out of the curriculum model, and kept stage-unlock model summaries route-neutral.

The current Program recommendation is to make billing and Stripe boundaries auditable without changing behavior. The inspected billing surface shows that `apps/web/app/api/stripe/checkout/route.ts` still owns both App Router request orchestration and the full Stripe Checkout Session parameter object. The billing platform helper at `apps/web/platform/billing/stripe.ts` also imports the course registry only to read the canonical course slug, even though `apps/web/config/product.ts` already owns `productConfig.courseSlug`.

## What The Previous Slice Unblocked

Route-owned wrappers and API route path contracts are already visible under App Router private folders. That makes this a good time to make the checkout route thinner: it should authenticate, derive the request base URL, call the Stripe client, set the pending checkout cookie, and handle errors. Checkout-specific session metadata, URLs, line items, discounts, and promotion-code toggling should live in a checkout server helper that can be tested directly.

The course-domain cleanup also made it clearer that billing should not depend on lesson registry code. Stripe line item metadata should use `productConfig.courseSlug`, the product-level contract already used by the checkout route and Stripe webhook action.

## Next Plan Recommendation

Exact next plan title: `Make Billing And Stripe Boundaries Auditable`.

Exact scope: add a server-only helper such as `apps/web/features/checkout/server/checkout-session-params.ts` that builds the Stripe Checkout Session creation parameters currently assembled inline in `apps/web/app/api/stripe/checkout/route.ts`. Update the route to call that helper while preserving all existing parameters, including `mode`, `allow_promotion_codes` versus `discounts`, billing address collection, cancel and success URLs, customer email, client reference ID, line items, course metadata, and payment intent metadata. Update `apps/web/platform/billing/stripe.ts` so inline price metadata reads `productConfig.courseSlug` instead of importing `COURSE_SLUG` from the course registry. Add or update focused tests that prove the session params and route output remain unchanged.

Exact implementation boundaries: do not add a Next Stripe webhook route, move Convex HTTP routes, modify `apps/web/convex/schema.ts`, modify generated Convex files, rename or delete feature folders, change Stripe checkout behavior, webhook behavior, pricing, promo code behavior, billing proof behavior, environment behavior, public Convex function names, shared UI inventory, AppShell, route screens, or the unrelated stashed scrollbar styling change.

Exact validation boundaries: run static scans proving the checkout route no longer contains inline Stripe session parameter assembly and platform billing no longer imports the course registry. Run focused checkout params, Stripe line-item, checkout route, checkout session, hosted proof, and Stripe observability tests first. Then run `bun run format:check`, `bun run --cwd apps/web lint`, `bun run --cwd apps/web typecheck`, plan lint, Program lint, markdown lint, and `git diff --check`.

Why it is next: it targets the billing boundary smell named by the Program with the smallest behavior-preserving code move. It separates route orchestration from checkout contract assembly and removes a hidden billing-to-course dependency without changing Stripe, Convex, pricing, promo, env, or release-proof behavior.

## Risks To Carry Forward

Do not reinterpret pricing or offer truth. The current public offer, managed Stripe price validation, active promotion-code requirement, and auto-applied discount behavior must stay exactly as they are.

Do not move or rewrite the Convex webhook path in this slice. The production Stripe webhook contract belongs to Convex HTTP at `/stripe/webhook`.

Do not make the route helper configurable beyond the data the route already has. This slice is a boundary split, not a new checkout abstraction layer.
