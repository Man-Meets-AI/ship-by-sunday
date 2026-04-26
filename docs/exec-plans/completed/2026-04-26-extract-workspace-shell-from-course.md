---
title: Extract The Workspace Shell From Course
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Move the shared AppShell implementation from course ownership into a neutral workspace shell feature without changing workspace route behavior.
post_build_recap: AppShell now lives in apps/web/features/workspace-shell with first-party imports updated, old course-owned paths kept as temporary compatibility exports, and focused plus app-wide validation passed.
program_id: app-structure-refactor
planning_brief: docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-2.md
read_when:
  - Reviewing the completed workspace shell extraction.
  - Checking why AppShell moved before route-local colocation.
  - Validating that the shell move did not change route, Convex, or billing behavior.
---

# Extract The Workspace Shell From Course

This is a living execution plan. It describes the second implementation slice for the app structure refactor Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Before this slice, the shared workspace shell was stored under `apps/web/features/course/shared/components`, even though blueprint, review, settings, starter, execute-ship, workspace-home, and course routes all used it. That made the product look course-first in places where the current app contract is blueprint-first and workspace-oriented. After this slice, first-party code imports the shell from `apps/web/features/workspace-shell`, while the visible app behavior remains the same.

This slice is behavior-neutral. It should not change route screens, checkout, Convex schema, billing state, generated output, or visible UI.

## Progress

- [x] 2026-04-26 EDT: Confirmed the first boundary-safety child ExecPlan is complete and the Program names `Extract the Workspace Shell From Course` as the next recommended slice.
- [x] 2026-04-26 EDT: Inspected current AppShell files, shell consumers, and tests before file moves.
- [x] 2026-04-26 EDT: Moved the AppShell implementation into `apps/web/features/workspace-shell/components/`.
- [x] 2026-04-26 EDT: Updated first-party static imports and tests to the new workspace-shell path.
- [x] 2026-04-26 EDT: Left temporary compatibility exports at the old course-owned AppShell paths, preserving previous client boundaries on the old client entry files.
- [x] 2026-04-26 EDT: Focused shell unit tests and integration-ui tests passed.
- [x] 2026-04-26 EDT: App format check, lint, and typecheck passed after the shell move.
- [x] 2026-04-26 EDT: Active-path plan lint, Program lint, markdown lint, and `git diff --check` passed before archival.

## Surprises & Discoveries

2026-04-26 EDT: The shell implementation contains optional course-specific affordances. `AppShell` imports `getLesson` from the course lesson manifest to infer the current block and a lesson 1.1 viewport tweak, and the footer rail still renders course-owned skill rail components. Generic workspace pages already pass `showSkillRail={false}` or omit mission state, so this slice can move ownership without requiring a deeper course-domain split.

2026-04-26 EDT: First-party static imports are concentrated in a small set of route-facing feature components and tests. Visible production consumers include blueprint flow pages, execute-ship bonus pages, settings shell, starter disabled state, workspace home, and course mission.

2026-04-26 EDT: The old course-owned shell path now exists only as compatibility re-exports. A post-move import scan over `apps/web/features`, `apps/web/app`, and `apps/web/tests` found no remaining `features/course/shared/components/app-shell` import strings.

2026-04-26 EDT: The first integration-ui batch hit a transient `blueprint-page` timeout with a Radix select focus exception. The isolated `blueprint-page` file passed immediately afterward, and the same three-file focused integration-ui batch then passed, so no code change was needed for that transient test-environment failure.

## Decision Log

Decision: Use `apps/web/features/workspace-shell/components/app-shell.tsx` and `apps/web/features/workspace-shell/components/app-shell/` as the new home.
Rationale: The Program packet names `features/workspace-shell` as the best candidate. It keeps the shell as a durable cross-route product feature without mixing it into `workspace-navigation` or route-local `app` folders.
Date: 2026-04-26

Decision: Keep temporary compatibility exports at the old course-owned shell paths.
Rationale: The plan split explicitly calls for compatibility exports during migration, and they reduce risk while later Program slices continue moving route and course boundaries.
Date: 2026-04-26

Decision: Do not move course skill rail, lesson manifest, or course mission state in this slice.
Rationale: Those are course-domain cleanup concerns with separate fan-in. This slice only changes shell ownership and import paths.
Date: 2026-04-26

## Outcomes & Retrospective

This plan is complete. `AppShell` and its implementation files now live under `apps/web/features/workspace-shell/components/`. First-party production code and tests import `AppShell` and shell types from `@/features/workspace-shell/components/app-shell`. The previous `apps/web/features/course/shared/components/app-shell` paths remain as thin temporary compatibility re-exports, with previous client entry files still marked as client files.

Focused shell unit tests, focused integration-ui tests, app format check, app lint, app typecheck, active-path plan lint, Program lint, markdown lint, and `git diff --check` passed. The implementation did not move route screens, course registry or manifest files, Convex schema or generated files, Stripe checkout or billing behavior, shared UI inventory, or the unrelated stashed scrollbar styling.

## Context and Orientation

Ship by Sunday's web app lives in `apps/web`. The App Router is under `apps/web/app`, durable feature code is under `apps/web/features`, external runtime integrations are under `apps/web/platform`, Convex backend code is under `apps/web/convex`, and shared UI primitives are under `apps/web/components/ui`.

The shell implementation used to live at `apps/web/features/course/shared/components/app-shell.tsx`, with related files under `apps/web/features/course/shared/components/app-shell/`. It renders shared workspace chrome: header brand and navigation, primary nav, account menu, theme toggle, optional local navigation rail, and optional skill rail footer. Although it lived under course, it was used by blueprint, review, settings, starter, execute-ship, workspace-home, course mission, and tests.

The final home is `apps/web/features/workspace-shell/components/app-shell.tsx` plus `apps/web/features/workspace-shell/components/app-shell/`. The old course path is now a compatibility layer that re-exports the new shell module and submodules.

### In Scope

Move the AppShell implementation files from the course shared components path to the workspace shell feature path.

Update first-party imports and Vitest mocks from `@/features/course/shared/components/app-shell` and its subpaths to `@/features/workspace-shell/components/app-shell` and matching subpaths.

Leave temporary compatibility re-exports in the old course-owned shell files so hidden or future migration consumers can still resolve the old path.

Update this ExecPlan, the owning Program, the second planning brief pointer, and only plan surfaces required by the actual changes.

### Out Of Scope

Do not move route screens into `apps/web/app` private folders.

Do not move or rename top-level feature folders.

Do not move the course lesson manifest, course registry, course mission pages, skill rail components, or workbench files.

Do not modify Convex schema, generated Convex files, public Convex function names, or hosted Convex configuration.

Do not change Stripe checkout, Stripe webhook routing, pricing, promotion codes, billing proof, or environment behavior.

Do not delete unused `components/ui` inventory.

Do not include the unrelated stashed scrollbar styling change.

## Plan of Work

Start by confirming the current shell import fan-in with `rg`. The baseline should include production consumers, tests, and the shell implementation's internal imports.

Create `apps/web/features/workspace-shell/components/`. Move `apps/web/features/course/shared/components/app-shell.tsx` to `apps/web/features/workspace-shell/components/app-shell.tsx`, and move the `apps/web/features/course/shared/components/app-shell/` directory to `apps/web/features/workspace-shell/components/app-shell/`.

Update imports inside the moved files so shell submodules refer to the new workspace-shell path where absolute imports are clearer. Keep relative imports inside the shell subdirectory where they already describe local implementation structure.

Create compatibility re-exports at the old course-owned paths. The old `apps/web/features/course/shared/components/app-shell.tsx` should re-export from `@/features/workspace-shell/components/app-shell`. Each old submodule path under `apps/web/features/course/shared/components/app-shell/` should re-export from the matching new workspace-shell submodule path. These files should contain no implementation logic.

Update first-party production imports and tests to import from `@/features/workspace-shell/components/app-shell` and matching subpaths. The compatibility layer is for migration safety, not for ongoing repo-owned consumers.

Keep plan and Program documents current as work proceeds. If validation reveals that the compatibility exports are unnecessary or harmful, record the discovery before changing the approach.

## Milestones

The first milestone is baseline evidence. It is complete when the shell files and all static consumers are known and recorded in this plan.

The second milestone is the physical move. It is complete when the implementation files live under `apps/web/features/workspace-shell/components/`, old paths are compatibility exports, and `rg` shows first-party production and test imports use the new path.

The third milestone is focused validation. It is complete when shell unit tests and immediate shell-consumer tests pass.

The fourth milestone is app and plan validation. It is complete when app lint, app typecheck, plan lint, Program lint, markdown lint, and diff checks pass.

The fifth milestone is archival. It is complete when this ExecPlan records the completed outcome, moves from `docs/exec-plans/active/` to `docs/exec-plans/completed/`, and the Program names the next slice.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Read the Program and this planning brief:

    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/program.md
    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-2.md

Record baseline shell imports:

    rg 'features/course/shared/components/app-shell|features/workspace-shell/components/app-shell' apps/web/features apps/web/app apps/web/tests
    find apps/web/features/course/shared/components/app-shell -maxdepth 1 -type f | sort

After the move and import updates, prove first-party consumers use the new path and the old path contains only compatibility exports:

    rg 'features/course/shared/components/app-shell' apps/web/features apps/web/app apps/web/tests
    rg 'features/workspace-shell/components/app-shell' apps/web/features apps/web/app apps/web/tests

Run focused tests for shell and immediate shell consumers:

    bun run --cwd apps/web test:unit -- tests/unit/product-shell.test.tsx tests/unit/mission-page.test.tsx tests/unit/bonus-lesson-page.test.tsx tests/unit/bonus-mission-page.test.tsx tests/unit/settings-page.test.tsx tests/unit/workspace-home-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/app-workspace-mission-page.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx tests/integration-ui/workspace-primary-nav.test.tsx

Then run app and plan checks:

    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-extract-workspace-shell-from-course.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-extract-workspace-shell-from-course.md
    git diff --check

## Validation and Acceptance

This slice is accepted when the AppShell implementation lives under `apps/web/features/workspace-shell/components`, first-party static imports use `@/features/workspace-shell/components/app-shell`, old course-owned shell paths are compatibility re-exports only, and focused plus app-level validation pass.

Generic workspace pages must still render without course mission state. The `tests/unit/product-shell.test.tsx` test proves that `AppShell` can render primary navigation, local navigation, and account chrome without loading mission data implicitly.

No route screen, checkout, Convex schema, generated Convex file, Stripe webhook, pricing, promo code, billing proof, environment, or shared UI inventory behavior should change.

### Test Commands

Run these commands from repo root after implementation:

    bun run --cwd apps/web test:unit -- tests/unit/product-shell.test.tsx tests/unit/mission-page.test.tsx tests/unit/bonus-lesson-page.test.tsx tests/unit/bonus-mission-page.test.tsx tests/unit/settings-page.test.tsx tests/unit/workspace-home-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/app-workspace-mission-page.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx tests/integration-ui/workspace-primary-nav.test.tsx
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run format:check
    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-26-extract-workspace-shell-from-course.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/active/2026-04-26-extract-workspace-shell-from-course.md
    git diff --check

## Idempotence and Recovery

The move is safe to retry if it is done as a plain file relocation plus import rewrites. If a path rewrite misses a test mock or type import, fix the import and rerun the focused tests.

If a hidden consumer still imports the old course-owned AppShell path, the compatibility export should keep it compiling. Do not remove compatibility exports in this slice unless the implementation proves they break lint or typecheck.

If typecheck shows that a course-specific shell dependency is too tangled to move, keep the workspace-shell home and import that course-specific dependency explicitly. Do not broaden the slice into a course registry or skill rail migration.

## Artifacts and Notes

Source Program packet:

    docs/programs/completed/2026-04-26-app-structure-refactor/

Current planning brief:

    docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-2.md

Baseline shell fan-in before edits:

    apps/web/features/execute-ship/components/bonus-mission-page.tsx
    apps/web/features/execute-ship/components/bonus-lesson-page.tsx
    apps/web/features/settings/components/settings-page-shell.tsx
    apps/web/features/course/mission/components/mission-page.tsx
    apps/web/features/blueprint-flow/components/blueprint-page.tsx
    apps/web/features/blueprint-flow/components/blueprint-review-page.tsx
    apps/web/features/starter/components/course-module-disabled-state.tsx
    apps/web/features/workspace-home/components/workspace-home-page.tsx
    apps/web/tests/unit/product-shell.test.tsx
    apps/web/tests/unit/bonus-lesson-page.test.tsx
    apps/web/tests/unit/mission-page.test.tsx
    apps/web/tests/unit/settings-page.test.tsx
    apps/web/tests/unit/workspace-home-page.test.tsx
    apps/web/tests/integration-ui/blueprint-page.test.tsx
    apps/web/tests/integration-ui/blueprint-review-page.test.tsx

Post-move scan:

    rg 'features/course/shared/components/app-shell' apps/web/features apps/web/app apps/web/tests
    no matches

    rg 'features/workspace-shell/components/app-shell' apps/web/features apps/web/app apps/web/tests
    apps/web/features/execute-ship/components/bonus-mission-page.tsx
    apps/web/features/execute-ship/components/bonus-lesson-page.tsx
    apps/web/features/settings/components/settings-page-shell.tsx
    apps/web/features/course/mission/components/mission-page.tsx
    apps/web/features/blueprint-flow/components/blueprint-page.tsx
    apps/web/features/blueprint-flow/components/blueprint-review-page.tsx
    apps/web/features/starter/components/course-module-disabled-state.tsx
    apps/web/features/workspace-home/components/workspace-home-page.tsx
    apps/web/tests/unit/product-shell.test.tsx
    apps/web/tests/unit/bonus-lesson-page.test.tsx
    apps/web/tests/unit/mission-page.test.tsx
    apps/web/tests/unit/settings-page.test.tsx
    apps/web/tests/unit/workspace-home-page.test.tsx
    apps/web/tests/integration-ui/blueprint-page.test.tsx
    apps/web/tests/integration-ui/blueprint-review-page.test.tsx

Focused validation passed:

    bun run --cwd apps/web test:unit -- tests/unit/product-shell.test.tsx tests/unit/mission-page.test.tsx tests/unit/bonus-lesson-page.test.tsx tests/unit/bonus-mission-page.test.tsx tests/unit/settings-page.test.tsx tests/unit/workspace-home-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/app-workspace-mission-page.test.tsx
    Test Files  8 passed (8)
    Tests  21 passed (21)

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx tests/integration-ui/workspace-primary-nav.test.tsx
    Test Files  3 passed (3)
    Tests  10 passed (10)

App validation passed:

    bun run format:check
    All matched files use the correct format.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Compiled successfully, finished TypeScript, generated 71 static pages, and produced the App Router route graph.

Plan and diff validation passed before archival:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-26-extract-workspace-shell-from-course.md
    docs/exec-plans/active/2026-04-26-extract-workspace-shell-from-course.md: ok

    bun run programs:lint
    app-structure-refactor: ok

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/active/2026-04-26-extract-workspace-shell-from-course.md
    docs/exec-plans/active/2026-04-26-extract-workspace-shell-from-course.md: ok
    docs/programs/completed/2026-04-26-app-structure-refactor/program.md: ok

    git diff --check
    no output

## Interfaces and Dependencies

`AppShell` is a client component. It imports UI primitives from `apps/web/components/ui`, route configuration from `apps/web/config/product.ts`, workspace navigation components from `apps/web/features/workspace-navigation`, blueprint stage types from `@shipbysunday/blueprint-compiler`, Clerk client hooks from `@clerk/nextjs`, and optional course lesson and skill rail modules from `apps/web/features/course`.

The compatibility layer depends on the broad `@/*` alias defined for the web app. It should remain a thin re-export layer so later Program slices can delete it confidently after import scans prove the old path is unused.
