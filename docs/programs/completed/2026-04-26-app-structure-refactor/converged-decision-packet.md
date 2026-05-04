# Converged Decision Packet

## Converged Decisions

The repo should reduce and discipline `apps/web/features`, not delete it
wholesale. Route-local code should move closer to `apps/web/app`, but durable
product domains should remain as feature modules until they have a clearer home.

The first implementation slice should not move folders. It should make current
boundaries visible and safer: explicit imports, shared utility extraction,
server-only guards, and baseline route/import inventories.

`features/course/shared/components/app-shell` should become a neutral workspace
shell feature. This is the first large structural move after baseline safety.

The App Router should become more readable as the product map. This does not
mean dumping every component into `app`; it means route-owned wrappers, guards,
and API contracts should be visible at the route location.

Convex should own backend state transitions and backend-safe domain logic.
Frontend feature modules may provide UI and view models, but Convex should not
depend on modules that also import workbench UI, Next-only code, or client
components.

Stripe should remain split by runtime: app route for HTTP checkout entrypoint,
`platform/billing` for Stripe SDK primitives and managed env assertions, Convex
for webhook/access persistence, and release scripts for operator proof. The
cleanup target is auditability and deduplication, not one giant billing folder.

The reference repos support the direction but should not be copied literally.
WorkOS and Next SaaS are smaller route-first examples. HackerAI shows a larger
Convex app can keep top-level `app`, `components`, `convex`, `hooks`, `lib`,
`packages`, and `types`. Ship by Sunday still needs its Program/ExecPlan system,
codebase compiler package, hosted release proof, and product-specific route
aliases.

## Tensions Or Open Questions

The final name for the workspace shell home is not settled. The best candidate
is `apps/web/features/workspace-shell`, but the implementation slice should
confirm whether `workspace-navigation` should own any shell pieces.

The target for shared assert helpers needs a small implementation decision.
`apps/web/lib/assert.ts` is straightforward, but a Convex-safe domain utility may
be better if backend code imports it.

The route-local migration should be selective. Moving all feature components
under `app` would likely make shared product domains less readable, not more.

The future of unused `components/ui` inventory depends on whether the repo
expects shadcn registry files to remain available for near-term work.

The identity-key issue in Convex is real but belongs to a separate data
migration plan. It should not be hidden inside folder cleanup.

## Strongest Repo Facts

`apps/web/AGENTS.md` says the app is codebase-first, not course-first, while the
largest shared shell still lives under a course path.

`apps/web/proxy.ts` duplicates route truth by protecting canonical routes and
compatibility aliases separately from the route redirect helpers.

`apps/web/tsconfig.json` exposes only the broad `@/*` alias, so migration work
must update import strings directly or add aliases deliberately with Vitest in
sync.

`apps/web/platform` is already the right kind of external I/O boundary.

`apps/web/convex` is mostly a good backend boundary, but some Convex files import
from feature paths that also contain UI or navigation concerns.

`apps/web/components/ui` contains both active primitives and unused or
route-specific visual effects.

## Recommended Direction

Treat this as a multi-slice Program. The first child ExecPlan should make
boundaries explicit without large moves. Later child plans can move the workspace
shell, then route-local wrappers, then shared UI, then course domain, then
billing and Convex boundaries.
