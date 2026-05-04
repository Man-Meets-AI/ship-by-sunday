---
title: App Structure Refactor Planning Brief 6
program_id: app-structure-refactor
brief_version: 6
status: current
summary: Clean the shared UI and hook boundary by moving marketing-only effects and a codebase-only keyboard hook without deleting compatibility inventory.
read_when:
  - Writing the sixth child ExecPlan for the app structure refactor Program.
  - Cleaning shared UI after the route-ownership visibility slices.
  - Preserving shared UI inventory while moving non-primitive effects toward feature ownership.
---

# App Structure Refactor Planning Brief 6

## Planning Refresh

This is the sixth planning brief for the app structure refactor Program.

The first child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md`. It made selected cross-feature imports explicit, moved shared assertion helpers to `apps/web/lib/assert.ts`, added server-only guards to true server helper modules, and passed focused and app-level validation.

The second child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-extract-workspace-shell-from-course.md`. It moved the shared AppShell implementation into `apps/web/features/workspace-shell`, updated first-party imports, kept temporary compatibility exports at the old course-owned shell path, and passed focused and app-level validation.

The third child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-route-ownership-visible.md`. It moved the protected workspace access gate and legacy codebase redirect helper into private `apps/web/app/(workspace)` folders, updated first-party imports and tests, kept temporary compatibility exports, and passed focused and app-level validation.

The fourth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md`. It moved identity route wrapper screens and support shell code into private `apps/web/app/(identity)` folders, updated first-party imports and tests, kept temporary compatibility exports, and passed focused and app-level validation.

The fifth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md`. It moved checkout success wrappers, review route wrappers, and API route path contracts into App Router private folders, kept compatibility exports, and passed focused and app-level validation without changing checkout, billing, Convex, or API behavior.

## What The Previous Slice Unblocked

The remaining route-ownership visibility work no longer blocks the shared UI cleanup. `apps/web/components/ui` can now be treated as the active shadcn-style primitive layer plus explicit temporary compatibility exports, instead of a mixed home for primitives, marketing motion effects, and route or feature hooks.

This slice should make the first safe shared UI and hook boundary moves without pruning inventory. Deleting unused UI files, moving shared cross-feature visuals, and removing compatibility exports are later decisions that require fresh import scans and proof.

## Next Plan Recommendation

Exact next plan title: `Clean Shared UI And Hooks`.

Exact scope: move marketing-style visual effects from `apps/web/components/ui/cover.tsx`, `apps/web/components/ui/pointer-highlight.tsx`, `apps/web/components/ui/encrypted-text.tsx`, `apps/web/components/ui/hero-highlight.tsx`, and `apps/web/components/ui/text-hover-effect.tsx` into `apps/web/features/marketing/components/effects/`. Update first-party marketing imports and focused tests to the new feature-owned paths. Keep the old `components/ui` files as temporary compatibility exports so the component inventory is not deleted. Move `apps/web/hooks/use-keyboard-shortcut.ts` into `apps/web/features/codebase-flow/hooks/use-keyboard-shortcut.ts`, update the codebase stage card import, and keep the old hook path as a compatibility export.

Exact implementation boundaries: do not move or delete active shadcn-style primitives in `apps/web/components/ui`. Do not delete unused UI inventory. Do not move `apps/web/components/ui/dotted-glow-background.tsx` in this slice because it is currently consumed by both marketing and course mission UI. Do not move `apps/web/hooks/use-mobile.ts` because it backs the shared sidebar primitive. Do not delete or move `apps/web/features/shared/hooks/use-autosave.ts` in this slice because it has a focused test but no production consumer in the current scan. Do not change homepage content, section visibility, CTA behavior, structured data, route behavior, Convex, Stripe, checkout, billing proof, pricing, promo codes, environment behavior, or the unrelated stashed scrollbar styling change.

Exact validation boundaries: run focused marketing-effect and codebase-flow tests first. Then run `bun run format:check`, `bun run --cwd apps/web lint`, `bun run --cwd apps/web typecheck`, plan lint, Program lint, markdown lint, and `git diff --check`.

Why it is next: the Program packet identifies shared UI as the next lower-risk cleanup after route ownership. These moves make the primitive boundary easier to read while preserving compatibility and avoiding deletion or cross-feature visual moves.

## Risks To Carry Forward

Do not treat every animated visual as marketing-only. `DottedGlowBackground` is currently shared by the marketing hero atmosphere and the course mission hero card, so moving it into marketing would create a worse dependency.

Do not prune unused shadcn registry files during this slice. Some files are unused by production imports today but may still be expected by local generation, design-system iteration, or near-term feature work. A later slice can delete inventory only after a dedicated scan and build proof.

Keep compatibility exports temporary and obvious. Later slices should remove old `components/ui` effect exports and old global hook exports only after first-party import scans prove they are no longer needed.
