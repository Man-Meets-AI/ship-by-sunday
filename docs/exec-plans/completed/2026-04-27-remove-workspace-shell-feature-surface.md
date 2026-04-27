---
title: Remove Workspace Shell Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Move the workspace AppShell out of the feature tree and into the workspace route private component surface without changing workspace chrome behavior.
post_build_recap: AppShell now lives under app/(workspace)/_components, old workspace-shell and unused course AppShell aliases are gone, consumers import the new owner, and focused workspace shell plus app validation passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-14.md
read_when:
  - Resuming the workspace-shell feature-folder removal slice.
  - Checking why AppShell lives under app/(workspace).
  - Validating that no features/workspace-shell references remain.
---

# Remove Workspace Shell Feature Surface

This is a living execution plan for deleting the workspace-shell feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Workspace route chrome should live with the workspace route group instead of in a broad feature bucket. The AppShell renders the protected workspace header, navigation, optional local rail, layout mode controls, account menu, and mobile footer rail for blueprint, review, course, execute/ship, settings, and workspace-home surfaces. After this slice, `apps/web/features/workspace-shell` should be gone while the rendered shell markup, navigation destinations, protected route behavior, and production release proof selection stay the same.

## Progress

- [x] 2026-04-27 EDT: Created branch `codex/remove-workspace-shell-feature-surface` from verified `main` at `ddbfec1`.
- [x] 2026-04-27 EDT: Confirmed `apps/web/features/workspace-shell` contains the AppShell entrypoint and fourteen AppShell-private subcomponent, prop, and helper files.
- [x] 2026-04-27 EDT: Confirmed current consumers are blueprint-flow, course mission pages, execute-ship bonus pages, workspace review, workspace home, settings, and focused tests.
- [x] 2026-04-27 EDT: Confirmed `apps/web/features/course/shared/components/app-shell` has no direct consumers and only re-exports the old workspace-shell modules.
- [x] 2026-04-27 EDT: Read the local Next.js project-structure documentation for route groups and private folders. Private `_components` folders opt files out of routing and are intended for route-owned UI logic.
- [x] 2026-04-27 EDT: Created planning brief 14 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved AppShell and its private subcomponents to `apps/web/app/(workspace)/_components/app-shell`.
- [x] 2026-04-27 EDT: Updated blueprint-flow, course, execute-ship, workspace review, workspace home, settings, and focused tests to import AppShell from the new workspace private owner.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/workspace-shell`, deleted the unused `apps/web/features/course/shared/components/app-shell` alias, and confirmed old-path scans return no app or script matches.
- [x] 2026-04-27 EDT: Focused AppShell and route-consumer unit tests passed: 8 files and 21 tests.
- [x] 2026-04-27 EDT: Focused blueprint and review integration-ui tests passed: 2 files and 9 tests.
- [x] 2026-04-27 EDT: App format check, app lint, and app typecheck passed. The typecheck build output still includes `/blueprint`, `/review`, `/mission`, `/lesson/[lessonKey]`, `/execute`, `/settings`, and `/start`.
- [x] 2026-04-27 EDT: Convex schema/generated diff check returned no changes.

## Surprises & Discoveries

The course feature still contains an unused `shared/components/app-shell` compatibility re-export folder. It has no direct imports in app code or tests, and every file in it only points back at `@/features/workspace-shell`. Keeping it would preserve a stale alias to a folder this slice deletes, so the folder should be removed with this slice.

The AppShell itself imports course lesson metadata and skill-rail types. That coupling already exists and should not be redesigned here. This slice is an ownership move, not a new workspace shell abstraction.

Focused tests needed local mocks for third-party Radix and theme primitives that can load duplicate React copies when server-rendered in this local checkout. Those mocks are limited to tests and keep the proof focused on AppShell ownership, page composition, and route consumer behavior.

## Decision Log

Decision: Move AppShell and its private subcomponents to `apps/web/app/(workspace)/_components/app-shell`.
Rationale: AppShell is workspace route chrome and Next.js private route folders are non-routable owners for route-local UI utilities.
Date: 2026-04-27

Decision: Remove the unused course AppShell re-export folder.
Rationale: The folder has no consumers and only re-exports the old workspace-shell implementation paths.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. AppShell and its private subcomponents now live under `apps/web/app/(workspace)/_components/app-shell`. Blueprint-flow, course, execute-ship, workspace review, workspace home, settings, and tests import the new workspace private owner. `apps/web/features/workspace-shell` and the unused course AppShell compatibility alias are deleted. AppShell props, layout class expectations, navigation destinations, route URLs, protected workspace access, checkout, billing, Convex schema, generated Convex files, and production release proof semantics were intentionally unchanged.

## Context and Orientation

`apps/web/features/workspace-shell/components/app-shell.tsx` is the current AppShell entrypoint. It renders a client-side workspace shell with a header, local navigation rail, children slot, and optional footer rail. Its subcomponents live under `apps/web/features/workspace-shell/components/app-shell`.

`apps/web/app/(workspace)/_components` already owns route-local workspace UI. It contains access-required UI, workspace navigation, workspace-home components, settings support components, starter-repo access, and Codex connection UI. Moving AppShell there keeps all protected workspace route chrome in one explicit route-private owner.

Current AppShell consumers include `apps/web/features/blueprint-flow/components/blueprint-page.tsx`, `apps/web/features/course/mission/components/mission-page.tsx`, `apps/web/features/execute-ship/components/bonus-mission-page.tsx`, `apps/web/features/execute-ship/components/bonus-lesson-page.tsx`, `apps/web/app/(workspace)/review/_components/blueprint-review-page.tsx`, `apps/web/app/(workspace)/_components/workspace-home/workspace-home-page.tsx`, and `apps/web/app/(workspace)/settings/_components/settings-page-shell.tsx`.

### In Scope

Move `apps/web/features/workspace-shell/components/app-shell.tsx` and the files under `apps/web/features/workspace-shell/components/app-shell` to `apps/web/app/(workspace)/_components/app-shell`.

Update app, feature, and test imports from `@/features/workspace-shell/components/app-shell` to `@/app/(workspace)/_components/app-shell`.

Delete `apps/web/features/workspace-shell` and the unused `apps/web/features/course/shared/components/app-shell` re-export folder.

Update the Program packet and this ExecPlan as implementation and validation complete.

### Out Of Scope

Do not change AppShell props, layout class names, navigation destinations, route URLs, protected workspace access, Clerk behavior, checkout, billing, Stripe, pricing, promo code behavior, Convex schema, generated Convex files, course mission state, blueprint compiler behavior, production release proof semantics, or remaining feature folders.

Do not move `apps/web/features/blueprint-flow`, `apps/web/features/course`, `apps/web/features/execute-ship`, or `apps/web/features/marketing` in this slice.

## Plan of Work

Create `apps/web/app/(workspace)/_components/app-shell` and move the AppShell entrypoint and subcomponent files there. Update the AppShell entrypoint's internal imports to the new owner while keeping its public export shape unchanged.

Update all direct consumers and focused tests to import from `@/app/(workspace)/_components/app-shell`. Remove the unused `features/course/shared/components/app-shell` re-export folder because it has no current consumers and would otherwise retain references to the deleted workspace-shell folder.

Delete `apps/web/features/workspace-shell`, run old-path scans, then run focused AppShell and workspace route tests before app-wide format, lint, and typecheck. Finish by updating the ExecPlan and Program packet with actual validation evidence.

## Milestones

The first milestone is route-private AppShell ownership. It is complete when AppShell files live under `apps/web/app/(workspace)/_components/app-shell` and the old workspace-shell folder is absent.

The second milestone is consumer import cleanup. It is complete when app, feature, and test consumers import the new workspace private owner and scans return no current-code references to `@/features/workspace-shell`.

The third milestone is stale re-export removal. It is complete when the unused course AppShell compatibility re-export folder is absent and scans prove nothing imported it.

The fourth milestone is validation. It is complete when focused AppShell, workspace home, settings, blueprint, review, mission, bonus mission, bonus lesson, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` all pass.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Move the files with `git mv` so the diff preserves rename history where possible. After edits, run import scans:

    rg '@/features/workspace-shell|features/workspace-shell|\.\./features/workspace-shell|\.\./\.\./features/workspace-shell' apps/web scripts
    find apps/web/features/workspace-shell -maxdepth 4 -type f
    rg '@/features/course/shared/components/app-shell|features/course/shared/components/app-shell' apps/web scripts

The first and third scans should return no app or script matches. The `find` command should fail because the workspace-shell folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/workspace-shell` to be deleted, all old workspace-shell feature imports to be gone, AppShell markup tests to keep the same navigation and shell class expectations, and the route surfaces that consume AppShell to pass their focused tests. App typecheck must still build the protected workspace routes, including `/blueprint`, `/review`, `/mission`, `/lesson/[lessonKey]`, `/execute`, `/settings`, and `/start`.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/product-shell.test.tsx tests/unit/workspace-home-page.test.tsx tests/unit/settings-page.test.tsx tests/unit/mission-page.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/bonus-mission-page.test.tsx tests/unit/bonus-lesson-page.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-workspace-shell-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-workspace-shell-feature-surface.md
    git diff --check

After this PR merges, inspect the `Production Release Proof` run for the merged `main` commit and confirm `default_ship` and `release_gate` pass. `billing_integration` should only run if release scope explicitly detects billing-sensitive files.

## Idempotence and Recovery

These are file moves, import updates, and stale re-export deletion. If a scan finds old paths, update the consumer to the new workspace private owner instead of adding compatibility re-exports. If a focused route test fails, compare rendered AppShell markup and imports before changing navigation, route behavior, or mission state code.

If a build or lint check treats route-group imports unusually, keep the file owner under `apps/web/app/(workspace)/_components` and fix import strings consistently. Next.js route groups and private folders are valid organizational folders and should not change URLs.

## Artifacts and Notes

Initial import scan:

    rg 'features/workspace-shell|@/features/workspace-shell|workspace-shell' apps/web scripts docs/programs/active/2026-04-26-remove-feature-folder-surface

The scan shows current app and test consumers, historical Program references, and an unused course compatibility re-export folder. Current app and test references should move. Historical completed plans may keep old-path history unless a current docs surface needs an ownership update.

The final app/script scan should return no matches for old workspace-shell paths. `find apps/web/features/workspace-shell -maxdepth 4 -type f` should fail with `No such file or directory`. `git diff --name-only -- apps/web/convex/schema.ts apps/web/convex/_generated` should return no matches.

## Interfaces and Dependencies

The workspace-shell slice depends on Next.js App Router route groups and private folders, the protected workspace route group under `apps/web/app/(workspace)`, AppShell consumers in blueprint-flow, course, execute-ship, review, settings, and workspace home, the shared workspace navigation model under `apps/web/lib/workspace-navigation`, Clerk account menu hooks, `next-themes`, and production release proof for the merged `main` commit.
