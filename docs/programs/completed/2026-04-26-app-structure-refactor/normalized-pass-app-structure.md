# Normalized Pass: App Structure Refactor

## Decision Track

The central decision is to reduce `features/`, not remove it outright. The repo
already uses feature boundaries as the active product organization, and many
feature folders hold real domain behavior. The structural bug is that
route-local UI, shared app shell, Convex-safe domain code, and integration code
are not consistently separated.

## Boundary Rules

`apps/web/app` should own route entrypoints, route groups, route handlers, route
metadata, route-level guards, route-local wrappers, and private `_components`,
`_hooks`, and `_lib` folders when code is used by only that route.

`apps/web/features` should own durable product domains that are used by more than
one route or that would be confusing if buried inside one route segment.

`apps/web/features/course` should shrink to course and lesson domain behavior.
It should not own the workspace app shell.

`apps/web/features/workspace-shell` should own the cross-workspace app shell and
layout chrome after the first migration slices de-risk current imports.

`apps/web/features/workspace-navigation` should own workspace navigation models,
but it should stop reaching into course and execute-ship internals through hidden
relative imports.

`apps/web/convex` should own durable state transitions, schema, Convex HTTP
actions, and Convex-safe backend domain helpers. Convex should not import modules
that also import workbench UI, route components, or Next-only helpers.

`apps/web/platform` should remain the external I/O boundary for Clerk, Convex,
Stripe, environment, and Next runtime helpers.

`apps/web/components/ui` should keep active shadcn-style primitives. Marketing
effects and unused registry files should not sit beside primitives forever.

`apps/web/lib` should stay small and boring. `cn` belongs there. Clerk appearance
and generated design-system CSS should move to clearer auth or design-system
homes when that slice is touched.

## Phased Direction

Start with boundary safety and import visibility. Convert hidden cross-feature
relative imports to explicit aliases, extract truly shared utilities out of
course paths, and add server-only boundaries where server code already depends
on server-only APIs.

Move shared shell next. The current `AppShell` is already a cross-workspace
shell, but its path and imports still say course. Move it with a temporary
compatibility export so existing routes and tests can migrate safely.

Then move route-owned wrappers into `app` private folders. Do this for route
screens where ownership is clearer than the feature name: review route control,
checkout success, identity route wrappers, access-required UI, and API request
contracts.

Then clean shared UI. Keep primitives, move marketing-only effects into
marketing, and prune unused registry inventory only after an import scan and
build prove it is unused.

Only then split course and Convex-safe domain code. The course registry and
manifest have too much fan-in to move early.

Billing and Stripe cleanup should be late and deliberate. It is release
sensitive and interacts with Convex, Clerk, Stripe, hosted proof, release docs,
and environment setup.

## High-Risk Areas

Do not move `apps/web/config/product.ts` early. It is a broad control plane for
routes, homepage sections, pricing, Stripe, starter repo config, and metadata.

Do not move `apps/web/features/course/lesson/model/manifest.ts` or broad course
registry barrels early. They are imported by app routes, Convex files, tests,
navigation, and checkout.

Do not rename Convex public function files early. Generated `api.*` references
depend on file and export names.

Do not add a Next Stripe webhook route. The production webhook contract is
Convex HTTP actions at `/stripe/webhook`.

Do not prune UI inventory without proving static imports and build output. Some
unused shadcn registry files may still be expected by local generation or
near-term work.

## Validation Shape

Every implementation slice should start with narrow proof for the touched
surface, then run `bun run --cwd apps/web lint` and
`bun run --cwd apps/web typecheck`. Broader checks such as
`bun run --cwd apps/web check` should run after import or route ownership changes
that cross feature boundaries.

Program and ExecPlan artifacts should be validated with `bun run programs:lint`,
`bun run plans:lint -- --plan <path>`, `bun run markdown:lint -- --paths <path>`,
and `git diff --check`.
