---
title: App Structure Refactor Planning Brief 1
program_id: app-structure-refactor
brief_version: 1
status: current
summary: Make existing app structure boundaries explicit before any large feature-folder moves.
read_when:
  - Writing the first child ExecPlan for the app structure refactor Program.
  - Checking whether the next slice may move feature folders.
  - Preserving the research-only recommendation on the current features organization.
---

# App Structure Refactor Planning Brief 1

## Planning Refresh

This is the first planning brief for the app structure refactor Program.

## What The Research Found

The current app is codebase-first by product contract, but some core shared
workspace UI still lives under course paths. `features/course` is the largest
and most overloaded feature, and `features/course/shared/components/app-shell`
is already a cross-workspace shell.

The top-level `features/` folder should be reduced and disciplined, not deleted
wholesale. Durable cross-route product domains still belong there until a better
home is proven.

The App Router should be easier to read as the product map. Route-owned wrappers,
route-control behavior, and route API contracts should move closer to
`apps/web/app` in later slices.

Convex and billing are not first-move targets. Convex public API names and
Stripe checkout/access proof are too sensitive for early physical moves.

## Next Plan Recommendation

Exact next plan title: `Make App Structure Boundaries Explicit`.

Exact scope: make the existing structure safer before physical moves. Convert
hidden cross-feature relative imports to explicit aliases, extract shared assert
helpers out of course paths, add missing `server-only` guards to true server-only
helpers, record an import and route baseline, and update architecture docs only
where behavior-neutral boundary rules change.

Exact implementation boundaries: do not move route screens into `app`, do not
rename feature folders, do not move `AppShell`, do not modify Convex schema or
generated files, do not change Stripe checkout/webhook behavior, do not touch
production services, and do not delete UI inventory.

Exact validation boundaries: run focused tests for touched utilities and server
helpers, then `bun run --cwd apps/web lint`, `bun run --cwd apps/web typecheck`,
plan lint, markdown lint, Program lint, and `git diff --check`.

Why it is next: folder moves are high-risk until import edges and server/client
boundaries are explicit. This slice creates the safe baseline for the workspace
shell extraction and route-local colocation slices.

## Risks To Carry Forward

Adding `server-only` may expose existing transitive client imports. That is a
useful failure, but the implementation agent must stop and repair the actual
boundary instead of removing the guard.

Do not use this first slice as cover for a broad route or feature migration. The
goal is visibility and safety, not architectural churn.

The scrollbar styling change from the previous branch was stashed before this
Program branch was created. It is unrelated to this Program and should not be
included in this branch.
