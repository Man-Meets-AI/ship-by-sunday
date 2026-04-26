---
title: App Structure Refactor Planning Brief 2
program_id: app-structure-refactor
brief_version: 2
status: current
summary: Move the shared workspace AppShell out of course ownership without changing route behavior.
read_when:
  - Writing the second child ExecPlan for the app structure refactor Program.
  - Checking the target home for the workspace AppShell.
  - Preserving the boundary rules after the first app structure slice completed.
---

# App Structure Refactor Planning Brief 2

## Planning Refresh

This is the second planning brief for the app structure refactor Program.

The first child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md`. It made selected cross-feature imports explicit, moved shared assertion helpers to `apps/web/lib/assert.ts`, added server-only guards to true server helper modules, and passed focused and app-level validation.

## What The Previous Slice Unblocked

The Program packet identified `apps/web/features/course/shared/components/app-shell` as the first large structural move after baseline safety. That shell is consumed by blueprint, review, settings, starter, execute-ship, workspace-home, course mission, and tests, so its current course path hides a cross-workspace ownership boundary.

The first slice made selected import edges easier to inspect and left `AppShell` untouched. The next slice can now move the shell code itself while keeping the runtime behavior stable.

## Next Plan Recommendation

Exact next plan title: `Extract The Workspace Shell From Course`.

Exact scope: move `apps/web/features/course/shared/components/app-shell.tsx` and the sibling `apps/web/features/course/shared/components/app-shell/` implementation files into a neutral `apps/web/features/workspace-shell/components/` home. Update first-party static imports to use the new `@/features/workspace-shell/components/app-shell` path. Keep temporary compatibility re-exports at the old course-owned paths so hidden imports fail less abruptly during the larger Program.

Exact implementation boundaries: do not move route screens into `app`, do not rename or delete top-level feature folders, do not move course lesson registry or manifest files, do not modify Convex schema or generated files, do not change Stripe checkout, webhook, pricing, promo code, billing proof, or environment behavior, do not delete `components/ui` inventory, and do not include the unrelated stashed scrollbar styling change.

Exact validation boundaries: run focused AppShell and shell-consumer unit tests first, then focused blueprint integration-ui tests that mock the shell, then `bun run --cwd apps/web lint`, `bun run --cwd apps/web typecheck`, plan lint, Program lint, markdown lint, and `git diff --check`.

Why it is next: route-local colocation and course-domain splitting both depend on the cross-workspace shell no longer being hidden under `features/course/shared`. Moving the shell first makes later route and course cleanup easier to reason about without touching billing or Convex behavior.

## Risks To Carry Forward

This slice should be a behavior-neutral ownership move, not a redesign. The existing shell still has optional course lesson affordances such as layout mode, skill rail, and mission progress. Those affordances may continue to depend on course modules in this slice as long as generic workspace pages can still render the shell without mission or lesson state.

Keep the compatibility exports temporary and obvious. Later Program slices should remove them only after the repo proves no first-party consumers still import the old course path.

Do not use this slice to move route files, rewrite shell visuals, or prune shared UI. Those are separate slices in the Program split.
