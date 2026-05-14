---
title: "Template First Web Convex Architecture Migration Inventory"
summary: "Current-to-target inventory for the first architecture contract slice of the template-first web and Convex Program."
docType: "migration_inventory"
status: "active"
read_when:
  - "Planning the app src tree migration."
  - "Moving routes, Convex modules, provider helpers, or billing code toward the template shape."
  - "Checking whether a deviation from the sibling template has already been accepted."
---

# Template First Web Convex Architecture Migration Inventory

This inventory records the target map created by the first Program slice. It is intentionally not a file-move patch. It gives later implementation ExecPlans a concrete source of truth for where current code should land and which deviations from the sibling template are intentional.

## Source References

- Current app: `apps/web`
- Current Convex backend: `apps/web/convex`
- Local app architecture contract: `apps/web/ARCHITECTURE.md`
- Local app conventions: `apps/web/CONVENTIONS.md`
- Sibling template: `~/Developer/next-js-convex-clerk-stripe-template`
- Sibling template docs: `~/Developer/next-js-convex-clerk-stripe-template/ARCHITECTURE.md` and `~/Developer/next-js-convex-clerk-stripe-template/CONVENTIONS.md`
- Program: `docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md`

## Current Shape

After the second slice, browser-facing source lives under `apps/web/src`. Browser routes live in `apps/web/src/app`, shared UI primitives live in `apps/web/src/components`, app utilities live in `apps/web/src/lib`, provider and boundary helpers temporarily live in `apps/web/src/platform`, product config lives in `apps/web/src/config`, content lives in `apps/web/src/content`, tests live in `apps/web/tests`, and Convex functions remain at `apps/web/convex`.

The current route groups are `(marketing)`, `(auth)`, and `(app)`. Public product pages currently exist at `apps/web/src/app/(marketing)/page.tsx`, `apps/web/src/app/(marketing)/starter/page.tsx`, `apps/web/src/app/(marketing)/workers/page.tsx`, and `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx`. The Worker Seal Team 6 page is public and uses a direct scheduling handoff until the Cal.com embed, hosted fallback, and webhooks land.

The current billing path is split between `apps/web/src/app/api/stripe/checkout/route.ts`, `apps/web/src/app/api/stripe/webhook/route.ts`, checkout UI routes under `apps/web/src/app/checkout`, helper modules under `apps/web/src/platform/billing`, new server-only sync helpers under `apps/web/src/lib/billing`, and compatibility Convex HTTP webhook code in `apps/web/convex/http.ts` plus `apps/web/convex/stripeWebhook.ts`. The rebuilt Convex billing-domain foundation now exists in additive tables and `apps/web/convex/billing.ts`, with model helpers under `apps/web/convex/billing/`; Stripe webhook ingress and Checkout success now write into it through secret-gated public Convex wrappers. The target copies the template's Next.js route-handler webhook and billing-route shape, while preserving Convex as the durable app-state owner.

## Target Route Map

| Current path or behavior | Target path or behavior | Notes |
| --- | --- | --- |
| `apps/web/src/app/(marketing)/page.tsx` | `apps/web/src/app/(marketing)/page.tsx` | Main public landing page; route group move completed. |
| `apps/web/src/app/(marketing)/starter/page.tsx` | `apps/web/src/app/(marketing)/starter/page.tsx` | Public Starter sales page; route group move completed. |
| `apps/web/src/app/(marketing)/workers/page.tsx` | `apps/web/src/app/(marketing)/workers/page.tsx` | Public Workers sales page; route group move completed. |
| `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx` | `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx` | Public service page exists; Cal.com embed and provider wiring remain pending. |
| `apps/web/src/app/(marketing)/blog/**` | `apps/web/src/app/(marketing)/blog/**` | Public content route, not protected app state; route group move completed. |
| `apps/web/src/app/(marketing)/docs/**` | `apps/web/src/app/(marketing)/docs/**` | Public docs route unless a later slice intentionally protects specific docs; route group move completed. |
| `apps/web/src/app/(auth)/**` | `apps/web/src/app/(auth)/**` | Clerk auth routes and auth shell. |
| `apps/web/src/app/(app)/**` | `apps/web/src/app/(app)/**` | Protected product routes and app shell. |
| `apps/web/src/app/(app)/admin/impersonation/**` | `apps/web/src/app/(app)/admin/impersonation/**` | Admin routes belong in protected app group; move completed. |
| `apps/web/src/app/(app)/access-required/page.tsx` | `apps/web/src/app/(app)/access-required/page.tsx` unless a later slice proves it must stay public | Access gating is product state and should read Convex; move completed. |
| no current dedicated billing page | `apps/web/src/app/(app)/billing/page.tsx` | Protected billing-management surface that reads Convex state and launches Stripe Customer Portal for authorized Workers subscription management. |
| `apps/web/src/app/checkout/success/**` | Template-style billing success route plus protected product return route | Later billing slice should replace stale checkout-page assumptions with `/api/billing/success` sync and product redirects. |
| `apps/web/src/app/checkout/cancel/**` | Template-style cancel/return behavior owned by billing slice | Keep customer-facing cancel affordance only if the billing slice documents it. |
| `apps/web/src/app/api/stripe/checkout/route.ts` | `apps/web/src/app/api/billing/checkout/route.ts` | App-owned Checkout creation. |
| no current portal route | `apps/web/src/app/api/billing/portal/route.ts` | Workers Customer Portal session creation. |
| no current billing success route | `apps/web/src/app/api/billing/success/route.ts` | Eager Stripe sync after Checkout success. |
| Convex `.site` Stripe webhook | `apps/web/src/app/api/stripe/webhook/route.ts` | App-origin webhook route added; Convex `.site` route remains compatibility-only until a later removal slice. |
| no current Cal.com webhook | `apps/web/src/app/api/cal/webhook/route.ts` target | Used for Worker Seal Team 6 booking mirror state. |
| no current debug Sentry route | `apps/web/src/app/api/debug/sentry/route.ts` | Must require explicit debug env opt-in. |
| no current email test route | `apps/web/src/app/api/email/test/route.tsx` | Must require explicit debug env opt-in. |

## Target Component And Helper Map

| Current path | Target path | Notes |
| --- | --- | --- |
| `apps/web/src/components/ui/**` | `apps/web/src/components/ui/**` | Preserve shadcn primitives. |
| `apps/web/src/components/product-brand.tsx` | `apps/web/src/components/layout/brand-lockup.tsx` or route-local equivalent | Name by responsibility, not product placeholder. |
| `apps/web/src/app/(app)/_components/app-shell/**` shared chrome pieces | `apps/web/src/components/layout/**` | App shell, header, navigation, user menu, skip link, theme toggle, and protected chrome belong with shared layout primitives. |
| `apps/web/src/app/(app)/_components/app-shell/**` product-state panels | `apps/web/src/components/app/**` | Product-specific app panels such as billing attention belong with shared app components. |
| `apps/web/src/app/(auth)/_components/**` | `apps/web/src/components/layout/**` plus route-local auth `_components` | Shared auth shell can be global; flow-specific pieces can stay route-local. |
| `apps/web/src/app/_components/public-site/**` | `apps/web/src/components/layout/**` | Public header/footer/chrome. |
| `apps/web/src/app/_components/home-page/**` | `apps/web/src/app/(marketing)/_components/home-page/**` unless shared | Complex landing-page-only pieces should stay route-local. |
| `apps/web/src/app/(app)/_hooks/**` | `apps/web/src/components/app/**` or `apps/web/src/lib/app/**` | Hooks that own behavior but not presentation should move into app/lib boundaries. |
| `apps/web/src/app/(app)/_lib/**` | `apps/web/src/lib/app/**` or product-specific route-local `_lib` | Preserve route-local helpers only when they are not shared. |
| `apps/web/src/platform/env/**` | `apps/web/src/lib/env/**` | Copy template client/server/app-url split. |
| `apps/web/src/platform/auth/**` | `apps/web/src/lib/auth/**` | Clerk, authorized parties, Convex auth helpers. |
| `apps/web/src/platform/convex/**` | `apps/web/src/lib/convex/**` | Convex client/provider and server preload helpers. |
| `apps/web/src/platform/billing/**` | `apps/web/src/lib/billing/**` | Stripe, plans, entitlements, sync, and webhook helpers. |
| `apps/web/src/platform/observability/**` | `apps/web/src/lib/analytics/**` and `apps/web/src/lib/sentry/**` | Split analytics from error/tracing. |
| `apps/web/src/lib/observability/**` | `apps/web/src/lib/analytics/**` and `apps/web/src/lib/sentry/**` | Keep safe context only. |
| `apps/web/src/lib/codebase-flow/**` | `apps/web/src/lib/app/codebase-flow/**` or route-local app module | Product app logic, not provider/platform code. |
| `apps/web/src/config/**` | `apps/web/src/lib/app/**`, `apps/web/src/lib/billing/**`, or `apps/web/src/lib/env/**` | Move config by ownership; avoid a broad config dumping ground. |
| no current `emails` folder | `apps/web/src/emails/**` | React Email templates for Resend. |

## Target Convex Module Map

| Current Convex path | Target module or responsibility | Notes |
| --- | --- | --- |
| `apps/web/convex/schema.ts` | `apps/web/convex/schema.ts` | Keep canonical schema file; add domain tables by product. |
| `apps/web/convex/auth.config.ts` | `apps/web/convex/auth.config.ts` | Required for Clerk-backed Convex auth. |
| `apps/web/convex/entitlements.ts` and `apps/web/convex/entitlements/**` | `apps/web/convex/entitlements.ts` plus `apps/web/convex/entitlements/**` | Product access implementation and public Convex function paths now use `entitlements`; the old `access` module has been removed. |
| `apps/web/convex/checkoutClaims.ts` and `checkoutClaimsActions.ts` | Starter license, Workers subscription, and checkout intent modules | Replace claim-shaped state with product-shaped state as billing rebuild lands. |
| `apps/web/convex/billing.ts` and `apps/web/convex/billing/**` | Convex billing domain boundary | Rebuilt domain foundation exists with `api.billing.viewerBillingState`, internal sync mutations, validators, and model helpers for Starter licenses, Workers subscriptions, refunds, provider events, email deliveries, and Worker Seal Team 6 bookings. |
| `apps/web/convex/migrations/legacyBillingReset.ts` | Temporary operator-run reset migration | Dry-run-first, confirm-gated cleanup for legacy product access and checkout handoff rows before the billing rebuild. |
| `apps/web/convex/stripeWebhook.ts` and `stripeWebhookEvents.ts` | `apps/web/convex/billing/stripeSync.ts`, `processedStripeEvents`, and domain writers | Next.js verifies webhooks; Convex normalizes state and records idempotency. |
| `apps/web/convex/http.ts` Stripe webhook route | Temporary compatibility only until route migration | Target webhook ingress is Next.js API route. |
| `apps/web/convex/workspace.ts` and `workspace/**` | `workspaces`, `memberships`, and Workers product modules | Keep workspace and membership truth separate from product entitlement state. |
| `apps/web/convex/codebase.ts` and `codebase/**` | Codebase product modules | Keep as domain modules; do not bury inside billing. |
| `apps/web/convex/course.ts` and `course/**` | Starter learning/tutorial modules if still product-supported | Preserve only live product surfaces. |
| `apps/web/convex/codex.ts` and validators | Codex integration modules | Keep integration state separate from billing. |
| `apps/web/convex/support.ts`, `supportAdmin.ts`, and `support/**` | Support domain modules | Keep support/admin state separate from billing. |
| `apps/web/convex/observability.ts` and `observability/**` | Observability domain modules | Sentry/PostHog helpers belong in Next.js libs; durable incident state can stay in Convex. |
| `starterLicenseTerms` table and `apps/web/convex/billing/model.ts` | `apps/web/convex/billing/licenses.ts` or focused billing model files if later split | Starter annual license terms, renewal, expiration, and refund/voiding state now exist in the rebuilt billing domain. |
| `workersSubscriptions` table and `apps/web/convex/billing/model.ts` | `apps/web/convex/billing/subscriptions.ts` or focused billing model files if later split | Workers monthly/quarterly/annual subscription state, failed-payment attention, cancellation, and refund state now exist in the rebuilt billing domain. |
| `workerSealTeam6Bookings` table and `apps/web/convex/billing/model.ts` | `apps/web/convex/billing/serviceBookings.ts` or focused service module if later split | Cal.com booking/payment/refund mirror and fulfillment state now exist in the rebuilt billing domain; Cal.com webhook wiring is still pending. |
| `processedCalEvents` table and `apps/web/convex/billing/model.ts` | Cal.com event ledger boundary | Required idempotency ledger now exists; webhook verification and event mapping remain pending. |
| `billingEmailDeliveries` table and `apps/web/convex/billing/model.ts` | Email delivery state boundary | Required exactly-once email state now exists; Resend senders and templates remain pending. |

## Billing Target Summary

Starter is a one-time annual license. Initial purchase and renewal are app-owned Stripe Checkout flows. Renewal checkout creation requires Clerk authentication and Convex authorization for the workspace/license. Convex creates the new term only after verified payment. Early renewal extends from the current expiration date; expired renewal starts from verified payment time.

Workers is a subscription with monthly, quarterly, and annual variants. Initial checkout is app-owned Stripe Checkout. Stripe Customer Portal owns plan changes and cancellation when configured for the final prices and proration policy. Upgrades and longer commitments apply immediately with fair proration. Downgrades and customer-requested cancellation take effect at period end. Convex mirrors cancellation intent and keeps access active through the paid period.

Workers failed-payment recovery uses Stripe Smart Retries with 8 retries over 2 weeks, then cancellation if recovery fails. Convex keeps access active during `past_due`, shows owner/admin billing attention, sends exactly-once customer and internal recovery emails from Convex state, sends recovered-payment confirmations after recovery, and sends terminal access-ended and internal closeout emails after retry-exhausted cancellation.

Worker Seal Team 6 is a Cal.com paid booking for a one-hour, $2500 service. Cal.com owns booking and scheduling. Convex mirrors paid booking, reschedule, cancellation, refund, fulfillment, customer prep email, and internal ops email state. Booking does not create Clerk or workspace state.

Refunds are initiated in Stripe or Cal.com provider dashboards. Full refunds update access or future fulfillment by product, then send exactly-once customer status and internal closeout emails when product state changes. Partial refunds are support/accounting mirror state only.

## Deviation Register

| Deviation | Status | Reason | Validation required |
| --- | --- | --- | --- |
| Current app keeps `src/platform/` and `src/config/` until provider/domain slices redistribute them | Temporary | The second slice moved the source tree without widening provider ownership changes | Future provider/file-move ExecPlans must run focused route tests and broad app checks. |
| Legacy Convex HTTP `.site` Stripe webhook remains present | Temporary compatibility | The app-origin route is now canonical, but the old endpoint is not deleted in the same slice | Later cleanup must prove no provider dashboard or release proof still depends on `/stripe/webhook` before removal. |
| Ship by Sunday has codebase, tutorial, support, Codex, and admin surfaces that the sibling template does not have | Intentional | This app has a larger product than the starter notes template | Target modules must still follow template ownership and naming rules. |
| Public blog/docs remain part of marketing route group | Intentional | They are public content and do not own product state | Route tests and metadata tests must keep public access and SEO behavior intact. |
| Worker Seal Team 6 uses Cal.com instead of app-owned scheduler | Intentional expansion | Cal.com owns scheduling, paid booking, timezone, invites, and rescheduling better than custom code | Cal.com paid booking, webhook, reschedule, refund, and Convex mirror tests. |
| Failed-payment emails are added beyond the sibling template | Intentional expansion | Customer trust requires explicit recovery, resolved, and terminal communication | Resend idempotency tests and Stripe lifecycle tests. |
| Refund issuance stays in provider dashboards | Intentional simplification | Avoids adding an app-owned P0 money mutation during architecture migration | Later refund-reconciliation tests must prove provider refund events sync and no in-app admin refund action route exists. |
| `platform/` is not preserved as a permanent boundary | Intentional target | Template has clearer named `src/lib/*` provider/domain folders | Inventory and file moves must route each helper into a named owner folder. |

## Test And Proof Inventory

Later slices must add or preserve these proof surfaces:

| Current proof surface | Target proof surface | Notes |
| --- | --- | --- |
| `apps/web/tests/unit/route-metadata.test.ts`, `apps/web/tests/unit/public-metadata-routes.test.ts`, `apps/web/tests/unit/home-page-*.test.ts`, and focused public route tests | Public route rendering and metadata tests for `/`, `/starter`, `/workers`, and `/worker-seal-team-6` | Keep public access, SEO behavior, and structured data aligned with visible pages. |
| `apps/web/tests/unit/sign-in-route.test.ts`, `apps/web/tests/unit/sign-up-route.test.ts`, `apps/web/tests/integration-ui/sign-in-page.test.tsx`, `apps/web/tests/integration-ui/reset-password-page.test.tsx`, and auth protection E2E coverage | Auth route behavior after `(identity)` moves to `(auth)` | Clerk routes stay auth-owned; route group names must not leak into URLs. |
| `apps/web/tests/unit/app-protected-layout.test.tsx`, protected route unit tests, `apps/web/tests/integration-ui/app-shell-*.test.tsx`, and `apps/web/tests/e2e/auth-protection.sandbox.spec.ts` | Protected app behavior after `(protected)` moves to `(app)` | Preserve auth gates, app shell, role-aware navigation, and public/protected separation. |
| `apps/web/tests/integration/stripe-checkout-route.test.ts`, `apps/web/tests/unit/checkout-session*.test.ts`, `apps/web/tests/unit/checkout-claims*.test.ts`, `apps/web/tests/unit/stripe-webhook-*.test.ts`, and hosted checkout proof tests | Billing checkout, portal, success sync, webhook, Starter renewal, Workers lifecycle, refund, idempotency, and entitlement tests | Add template-style route tests for `api/billing/checkout`, `api/billing/portal`, `api/billing/success`, and `api/stripe/webhook`; include no in-app admin refund action route. |
| `apps/web/tests/unit/convex-product-access-grant.test.ts`, `apps/web/tests/unit/course-entitlements.test.ts`, `apps/web/tests/unit/workspace-data-model.test.ts`, and Convex billing/access tests | Convex tests for licenses, subscriptions, entitlements, billing attention, provider event ledgers, refund effects, and email delivery state | Test state outcomes in Convex, not raw provider payload assumptions. |
| no current Cal.com tests | Cal.com webhook, duplicate event, paid booking mirror, reschedule/cancellation/refund mirror, no Clerk/workspace side effects, and support-correction tests | Worker Seal Team 6 booking is Cal.com-owned and Convex-mirrored. |
| no current Resend tests | Resend exactly-once customer/internal email tests for Workers recovery, recovered payment, terminal failed recovery, cancellation, full refunds, and Worker Seal Team 6 prep/ops emails | Webhook acknowledgement must not depend on email delivery. |
| current PostHog observability tests under `apps/web/tests/unit/observability-*` and `apps/web/tests/integration/observability-*.test.ts` | Sentry, PostHog, and debug-route tests with explicit env opt-in and safe context assertions | Do not expose secrets, signatures, raw payloads, payment method details, or sensitive customer content. |
| `docs/release-workflow.md`, `apps/web/src/content/docs/environment-variables.mdx`, `apps/web/src/content/docs/stripe-checkout-webhook.mdx`, `apps/web/src/content/docs/set-up-db-auth-and-payments.mdx`, `.env.local.example`, Vercel/Convex env docs, and release proof scripts | Updated provider setup docs and release proof docs when endpoints, event lists, env vars, provider dashboards, or proof commands change | Every later external setup change must document what to create, where values go, how to verify setup, and what fails when missing or misconfigured. |

## First Slice Completion Evidence

This inventory was created with the first child ExecPlan for the Program. The slice did not move runtime files, change provider dashboards, change Convex schema, add packages, or change production endpoints.

## Second Slice Completion Evidence

The second child ExecPlan moved the web app source tree into `apps/web/src`, removed the root `apps/web/app` router, renamed source-only route groups to `(marketing)`, `(auth)`, and `(app)`, and kept public/protected URLs plus checkout/API provider endpoint names unchanged. `apps/web/src/platform` and `apps/web/src/config` remain intentional temporary compatibility lanes until later provider/domain slices move them into final `src/lib/*` owners.

The app-shell billing attention surface now exists as a typed prop and hidden-by-default banner. It does not read Convex billing state yet, does not add dismiss/snooze state, and does not change customer billing behavior; durable Workers billing attention still belongs to the later Convex and billing-domain slices.

## Fifth Slice Completion Evidence

The fifth child ExecPlan added the rebuilt Convex billing-domain foundation without changing live provider routes. New additive tables include `stripeCustomers`, `starterLicenseTerms`, `workersSubscriptions`, `productEntitlements`, `billingRefunds`, `processedStripeEvents`, `processedCalEvents`, `billingEmailDeliveries`, and `workerSealTeam6Bookings`. The public billing function module is `apps/web/convex/billing.ts`; it exposes `api.billing.viewerBillingState` plus internal sync/write functions for future trusted provider route slices. Focused tests live in `apps/web/tests/unit/convex-billing-domain.test.ts` and prove Starter renewal windows, Starter/Workers access derivation, Workers billing attention, provider event idempotency, email-delivery idempotency, and Worker Seal Team 6 paid-booking readiness.

## Sixth Slice Completion Evidence

The sixth child ExecPlan added the public Worker Seal Team 6 landing-page surface. The route now lives at `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx`, is linked from `PublicSiteHeader`, appears as a route card from `/`, and is included in `robots.ts`, `sitemap.ts`, and `apps/web/tests/unit/public-metadata-routes.test.ts`. It intentionally uses a direct scheduling handoff and does not add a Cal.com embed, hosted Cal.com fallback, app-owned checkout, auth gate, webhook, or email behavior.

## Seventh Slice Completion Evidence

The seventh child ExecPlan migrated Stripe billing ingress to the app-origin route at `apps/web/src/app/api/stripe/webhook/route.ts`. New server-only helpers under `apps/web/src/lib/billing/` classify Stripe webhook events, sync fresh Starter and Workers billing state, and record processed or skipped Stripe events through public Convex wrappers guarded by `CONVEX_WEBHOOK_MUTATION_SECRET`. Checkout success now retries the same billing-domain sync path, Workers Checkout uses Stripe subscription mode, release preflight expects `{APP_BASE_URL}/api/stripe/webhook`, and setup docs name the new endpoint plus the shared Convex sync secret. The legacy Convex `/stripe/webhook` route remains compatibility-only until a later cleanup slice proves it is unused.
