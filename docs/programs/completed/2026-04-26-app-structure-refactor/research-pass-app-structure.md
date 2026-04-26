# App Structure Refactor Research Pass

## Scope

This pass inspected `apps/web` as a Next.js, Convex, Clerk, and Stripe app. It
focused on whether the current top-level `features/` organization should be
removed, reduced, or kept with clearer boundaries. The pass was research only:
no app code, generated code, package files, Convex schema, Stripe settings, or
tests were changed.

The pass used six parallel read-only inspections:

- repo structure inventory
- Next.js App Router ownership
- Convex backend boundaries
- Stripe, billing, and webhook boundaries
- shared UI, hooks, components, and `lib`
- dependency and migration risk

The requested reference comparison was completed locally because the session hit
the active subagent limit before a seventh worker could start.

## Current Inventory

`apps/web/app` is a thin route tree. Most routes delegate immediately to feature
modules. Examples include `apps/web/app/page.tsx`, `apps/web/app/(workspace)/blueprint/page.tsx`,
`apps/web/app/(workspace)/review/page.tsx`,
`apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx`, and
`apps/web/app/checkout/success/page.tsx`.

`apps/web/app` has two route groups: `(identity)` and `(workspace)`. Protected
workspace access is enforced by `apps/web/app/(workspace)/layout.tsx` and
`apps/web/proxy.ts`. The proxy protects canonical routes from
`apps/web/config/product.ts` plus compatibility aliases such as `/start`,
`/product`, `/design`, `/marketing`, `/build-plan`, and `/lesson(.*)`.

`apps/web/features` is the main product map today. The active feature folders
include `auth`, `blog`, `blueprint-flow`, `checkout`, `codex`, `course`,
`docs`, `execute-ship`, `marketing`, `observability`, `product-access`,
`public-metadata`, `settings`, `shared`, `starter`, `starter-repo`,
`workspace-home`, and `workspace-navigation`.

`apps/web/features/course` is the largest and most overloaded feature. It
contains lesson registry and curriculum domain code, mission and artifact
surfaces, workbench rendering, video behavior, and the shared workspace app
shell.

`apps/web/convex` is mostly cleanly separated into thin public API facades plus
domain files. `apps/web/convex/blueprint.ts` and `apps/web/convex/course.ts`
delegate to validators and handlers under subfolders. Convex client wiring is
centralized in `apps/web/platform/convex`.

`apps/web/components/ui` contains true shared UI primitives, but it also contains
unused shadcn registry inventory and marketing-specific effects. True reusable
primitives include `button.tsx`, `card.tsx`, `badge.tsx`, `separator.tsx`,
`alert.tsx`, `field.tsx`, `label.tsx`, `input.tsx`, and `textarea.tsx`.

`apps/web/platform` is a useful boundary. `platform/auth`, `platform/billing`,
`platform/convex`, `platform/env`, and `platform/next` contain external I/O and
runtime integration code that should not be folded into route or UI folders.

`apps/web/lib` is small but mixed. `lib/utils.ts` is a generic `cn` utility.
`lib/clerk-auth-appearance.ts` is auth presentation configuration, and
`lib/generated-design-system-css.ts` is design-system integration.

`apps/web/tests` is split by runtime shape: unit, contracts, integration,
integration UI, and Playwright sandbox e2e. `apps/web/package.json` already has
phased commands for the slices that this refactor should use.

## Strong Findings

The route tree is not currently readable as the product map. It is mostly a set
of adapters into `features/**`. That is not automatically wrong, but it hides
route-owned UI and route-control behavior away from the route segments.

The top-level `features/` folder should not be deleted wholesale. Several
feature folders still hold real durable domain or product-area logic. The
problem is that route-local UI, shared workspace shell code, and backend-safe
domain logic are mixed into the same feature layer.

`features/course` is the highest-risk structural knot. It owns course domain
state, workbench rendering, mission surface, shared shell, and route/navigation
helpers. `apps/web/features/course/shared/components/app-shell.tsx` is a client
component imported by multiple non-course surfaces while it imports lesson model
data from `apps/web/features/course/lesson/model/manifest`.

`BlueprintReviewPage` is a large client route component that imports
`redirect()` from Next, uses live Convex queries, builds workspace navigation,
and renders review UI. This makes route control harder to see from
`apps/web/app/(workspace)/review/page.tsx`.

Convex imports some frontend feature code. Examples include course lesson model
code, workspace navigation resume logic, starter-repo validation, and
observability normalization. Some of those imports are pure today, but the path
names do not make that safety obvious.

Billing is split across app route, platform helper, Convex webhook state, Convex
claim actions, release scripts, and docs. The overall model is coherent:
Checkout starts from Next, Stripe webhooks land in Convex HTTP actions, and
Convex persists access. The problem is duplicated checkout session interpretation
and scripts with mixed read-only and live-mutating behavior.

The import graph argues against early physical moves. `apps/web/config/product.ts`
has very high fan-in, `features/course/lesson/model/manifest.ts` has very high
fan-in, and broad course registry barrels are consumed by app routes, Convex,
tests, checkout, and navigation.

There were no obvious multi-file import cycles in the lightweight static import
graph, but this is not a substitute for TypeScript, Next build, and focused route
proof after each slice.

## Evidence Pointers

`apps/web/config/product.ts` owns route configuration, homepage controls,
pricing, Stripe API version, product IDs, assets, starter repo config, and
metadata.

`apps/web/proxy.ts` owns protected route matching for canonical routes and
compatibility aliases.

`apps/web/features/course/shared/components/app-shell.tsx` imports course lesson
model state and renders shared shell behavior.

`apps/web/features/blueprint-flow/components/blueprint-review-page.tsx` is a
client route-level component that performs route control and cross-feature
composition.

`apps/web/convex/blueprint/workflowState.ts` unlocks Execute / Ship once access
is granted, but does not independently enforce blueprint readiness before
unlock.

`apps/web/platform/billing/stripe.ts` owns the Stripe client, price assertions,
promotion code assertions, checkout line item construction, and dashboard helper
URLs.

`apps/web/app/api/stripe/checkout/route.ts` owns the HTTP entrypoint for
creating Stripe Checkout Sessions.

`apps/web/tsconfig.json` exposes only one broad alias: `@/*`.

## Reference Comparison

The WorkOS B2B starter uses a small structure centered on `convex/`,
`src/app/`, `src/actions/`, and middleware. Its transferable lesson is that
Convex can own organizations, users, WorkOS, and Stripe state without a broad
feature tree. Its scale is much smaller than Ship by Sunday, so it is not a
complete target shape.

The HackerAI app uses top-level `app`, `components`, `convex`, `hooks`, `lib`,
`packages`, and `types`. Its transferable lesson is that a larger Convex app can
keep the App Router as the visible product map while still maintaining a rich
Convex backend. It also has app-local folders such as `app/components` and
`app/hooks`, which supports colocation when route ownership is strong.

The official Next.js SaaS starter uses `app/(dashboard)`, `app/(login)`,
`app/api`, `components`, and `lib`. It is useful for App Router and product route
shape, but it uses Postgres and Drizzle rather than Convex.

The ticket marketplace reference has a familiar top-level shape with `app`,
`components`, `convex`, `hooks`, `lib`, and middleware. It is relevant only if
future Ship by Sunday work introduces marketplace, queue, seller payout, or
Stripe Connect behavior.

The Convex SaaS reference is not a Next.js App Router structure model. Its useful
lesson is backend billing and SaaS domain separation inside Convex.

## Recommendation

Reduce and discipline `features/`; do not delete it in one pass.

The target should be:

- `apps/web/app` owns route entrypoints, route-local UI wrappers, route-control
  behavior, and private route folders for code used by only that route segment.
- `apps/web/features` remains for durable cross-route product domains only.
- `apps/web/features/workspace-shell` should replace the misleading
  `features/course/shared/components/app-shell` path.
- `apps/web/convex` owns backend state transitions, schema, HTTP actions,
  durable domain logic, and Convex-safe pure helpers.
- `apps/web/platform` keeps external I/O boundaries for Clerk, Convex, Stripe,
  environment, and Next runtime helpers.
- `apps/web/components/ui` stays as active shadcn-style primitives, while
  marketing effects and unused registry inventory move or disappear.
- `apps/web/lib` stays small and boring. Domain or integration code should move
  to feature, platform, or Convex-owned homes.

## Proposed Target Shape

```txt
apps/web/
  app/
    (identity)/
    (workspace)/
      blueprint/
        page.tsx
        _components/
        _hooks/
        _lib/
      review/
        page.tsx
        _components/
        _lib/
      settings/
    api/
      stripe/
        checkout/
          route.ts
  components/
    ui/
    product-brand.tsx
  convex/
    blueprint/
    billing/
    course/
    observability/
    schema.ts
    http.ts
  features/
    blueprint-flow/
    checkout/
    course/
    execute-ship/
    marketing/
    observability/
    product-access/
    starter-repo/
    workspace-navigation/
    workspace-shell/
  platform/
    auth/
    billing/
    convex/
    env/
    next/
  lib/
    utils.ts
  hooks/
  tests/
```

This is not an instruction to create every folder immediately. It is the target
boundary map for phased work.
