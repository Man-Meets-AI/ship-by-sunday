# Dependency Graph

## Ordering

1. Baseline boundary safety must happen before physical moves.
2. Workspace shell extraction depends on baseline import visibility.
3. Route-local colocation depends on the workspace shell no longer being hidden
   under course.
4. Shared UI cleanup can happen after the shell move, because the shell currently
   imports shared UI and workspace navigation pieces.
5. Course domain splitting depends on the shell move and import-barrel cleanup.
6. Billing and Stripe cleanup depends on route ownership clarity and should stay
   late because it is release-sensitive.
7. Final `features/` reduction depends on all prior slices proving which
   feature folders still deserve to exist.

## Blocking Edges

`features/course/shared/components/app-shell` blocks clear workspace ownership.
It depends on course lesson model state and is consumed by codebase, review,
settings, starter, execute-ship, workspace-home, and tests.

`features/course/lesson/model` blocks early course moves. Its manifest and
registry barrels are consumed by app routes, Convex, navigation, checkout, and
tests.

`apps/web/config/product.ts` blocks broad route/config refactors. It carries
routes, homepage, pricing, Stripe API version, starter repo config, and metadata.

`apps/web/proxy.ts` blocks route alias consolidation. It must preserve protected
coverage for `/codebase`, `/review`, `/settings`, `/execute`, `/mission`,
`/artifacts`, `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, and
`/lesson(.*)`.

`apps/web/app/api/stripe/checkout/route.ts`, `apps/web/platform/billing/stripe.ts`,
`apps/web/convex/http.ts`, `apps/web/convex/stripeWebhook.ts`, and
`apps/web/convex/checkoutClaimsActions.ts` form a release-sensitive billing
cluster. They should not be moved until route and Convex boundaries are clearer.

## Parallelizable Work

Shared UI inventory and marketing effect relocation can be planned in parallel
with route-local colocation after the baseline slice, as long as `AppShell`
imports are not moved at the same time.

Docs updates can run alongside each implementation slice, but public docs should
not claim the target architecture is complete until code has moved.

Test inventory can run in parallel with every slice. The useful split is not one
large full-suite run first; it is narrow touched-surface tests followed by app
lint, typecheck, and broader checks where imports crossed feature boundaries.

## Deferred Work

Convex identity-key migration should be its own data migration plan. The current
architecture pass found `identity.subject` persisted as `clerkUserId`, but
changing it touches persisted documents and indexes.

Billing product and promotion-code drift should be its own billing/release plan.
The architecture pass found likely env and product-creation inconsistencies, but
fixing them may touch Stripe dashboard state and release proof.
