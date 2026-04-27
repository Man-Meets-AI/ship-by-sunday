---
title: Remove Blueprint Flow Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Move Blueprint route code out of the feature tree and into route-private, shared library, and route-handler owners without changing Blueprint or Review behavior.
post_build_recap: Blueprint route UI now lives under workspace route private components, route-local hooks live under workspace private hooks, shared Blueprint contracts live under lib/blueprint-flow, the download helper lives beside its route, and the old blueprint-flow folder is gone.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/completed/2026-04-26-remove-feature-folder-surface/planning-brief-16.md
read_when:
  - Resuming the blueprint-flow feature-folder removal slice.
  - Checking why Blueprint UI lives under the workspace route group.
  - Validating that no features/blueprint-flow references remain.
---

# Remove Blueprint Flow Feature Surface

This is a living execution plan for deleting the blueprint-flow feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The canonical Blueprint route should no longer be hidden behind `apps/web/features/blueprint-flow`. Users should see the same `/blueprint`, Review handoff, legacy route redirects, video surfaces, and download behavior, but the code should make ownership explicit. Blueprint route UI belongs under the protected workspace route group, shared Blueprint helpers belong under `apps/web/lib/blueprint-flow`, and the download server helper belongs beside the `/api/download/repo` route handler. This slice is working when `apps/web/features/blueprint-flow` is gone, route behavior is unchanged under focused tests, and production proof for the merged commit succeeds.

## Progress

- [x] 2026-04-27 EDT: Created branch `codex/remove-blueprint-flow-feature-surface` from verified `main` at `6b6451b`.
- [x] 2026-04-27 EDT: Confirmed three top-level feature folders remain before this slice: `blueprint-flow`, `course`, and `marketing`.
- [x] 2026-04-27 EDT: Confirmed `apps/web/features/blueprint-flow` contains Blueprint route UI components, route-local hooks, shared helper modules, scripts-facing contracts, workspace state types, and one server-only download helper.
- [x] 2026-04-27 EDT: Confirmed current consumers include `/blueprint`, `/review`, `/api/download/repo`, AppShell primary nav, legacy route redirects, execute-ship helpers, app scripts, and focused tests.
- [x] 2026-04-27 EDT: Created planning brief 16 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved Blueprint route UI to `apps/web/app/(workspace)/_components/blueprint-flow`, route-local hooks to `apps/web/app/(workspace)/_hooks/blueprint-flow`, shared helpers to `apps/web/lib/blueprint-flow`, and the download helper to `apps/web/app/api/download/repo/_server/downloads.ts`.
- [x] 2026-04-27 EDT: Preserved the download helper's `import "server-only"` guard after the move.
- [x] 2026-04-27 EDT: Updated current app, library, script, and test imports away from `@/features/blueprint-flow` and relative `features/blueprint-flow` paths.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/blueprint-flow` and confirmed old-path scans return no current app or script matches.
- [x] 2026-04-27 EDT: Pure Blueprint unit tests passed locally: 4 files and 21 tests.
- [x] 2026-04-27 EDT: Focused blueprint download route integration test passed locally: 1 file and 1 test.
- [x] 2026-04-27 EDT: Focused Blueprint and Review integration-ui tests passed locally: 3 files and 11 tests. JSDOM printed two expected `Not implemented: navigation to another Document` notices while tests passed.
- [x] 2026-04-27 EDT: Review handoff doctor passed locally and kept the `/review?download=1` and `/api/download/repo` contracts unchanged.
- [x] 2026-04-27 EDT: App format check, app lint, and app typecheck passed. The typecheck route table still includes `/blueprint`, `/review`, legacy workspace routes, and `/api/download/repo`.
- [x] 2026-04-27 EDT: Plan lint, Program lint, markdown lint, old blueprint-flow path scans, Convex schema/generated diff check, and `git diff --check` passed.
- [x] 2026-04-27 EDT: Moved this ExecPlan to completed and updated the Program after validation passed.

## Surprises & Discoveries

The Blueprint helper surface is shared beyond `/blueprint`. `BlueprintWorkspaceState` is used by bonus lesson route access and tests; review handoff constants are used by Review page hooks and a script; stage videos are used by Review and video verification. Those shared contracts should not be placed in a route-private folder.

The download helper already has `import "server-only"` and backs only `/api/download/repo`. Moving it beside the route handler should preserve that guard and should not change the download authorization or archive generation contract.

Local Vitest unit runs that render React hooks and components still hit this checkout's known duplicate-React `Invalid hook call` failure. Pure Blueprint model tests, the download route integration test, and the Blueprint/Review integration-ui tests pass locally after the move. The PR static check must be treated as the authoritative clean-install proof for the full unit suite.

## Decision Log

Decision: Move Blueprint route UI components to `apps/web/app/(workspace)/_components/blueprint-flow`.
Rationale: The components render protected workspace route UI for `/blueprint`, Review, AppShell navigation, and tests. A Next.js private route folder is the explicit non-routable owner.
Date: 2026-04-27

Decision: Move Blueprint route-local hooks to `apps/web/app/(workspace)/_hooks/blueprint-flow`.
Rationale: The hooks drive the Blueprint page interaction model and are not generic app hooks.
Date: 2026-04-27

Decision: Move shared Blueprint helpers and types to `apps/web/lib/blueprint-flow`.
Rationale: App routes, review hooks, AppShell, scripts, execute-ship helpers, and tests consume these contracts outside the Blueprint page component tree.
Date: 2026-04-27

Decision: Move the download server helper beside `/api/download/repo`.
Rationale: It is a server-only helper for that route handler and should not live in a feature folder.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. Blueprint route UI now lives under `apps/web/app/(workspace)/_components/blueprint-flow`, route-local hooks live under `apps/web/app/(workspace)/_hooks/blueprint-flow`, shared Blueprint helpers and types live under `apps/web/lib/blueprint-flow`, and the server-only download context helper lives under `apps/web/app/api/download/repo/_server/downloads.ts`. `apps/web/features/blueprint-flow` has been deleted. Visible Blueprint copy, route URLs, Review auto-download behavior, download authorization, archive generation, post-review unlock behavior, checkout, billing, Stripe, Convex schema, generated Convex files, and environment behavior were intentionally unchanged.

## Context and Orientation

`apps/web/features/blueprint-flow` currently owns the canonical Blueprint flow. The live route entrypoint is `apps/web/app/(workspace)/blueprint/page.tsx`, which renders `BlueprintPage`. Review code under `apps/web/app/(workspace)/review` consumes Blueprint video and review handoff helpers. The download route at `apps/web/app/api/download/repo/route.ts` imports the server-only context loader from the feature folder. AppShell primary navigation imports `BlueprintStageNav`. Legacy route redirects under `apps/web/app/(workspace)/_lib/legacy-blueprint-route-redirects.ts` use Blueprint page section helpers to map old routes into `/blueprint` anchors.

### In Scope

Move files under `apps/web/features/blueprint-flow/components` to `apps/web/app/(workspace)/_components/blueprint-flow`.

Move files under `apps/web/features/blueprint-flow/hooks` to `apps/web/app/(workspace)/_hooks/blueprint-flow`.

Move files under `apps/web/features/blueprint-flow/lib` to `apps/web/lib/blueprint-flow`.

Move `apps/web/features/blueprint-flow/server/downloads.ts` to `apps/web/app/api/download/repo/_server/downloads.ts` and keep `import "server-only"`.

Update app, script, library, test, and Program imports away from `@/features/blueprint-flow` and `features/blueprint-flow`.

Delete `apps/web/features/blueprint-flow` after imports are updated.

Update the Program packet and this ExecPlan as implementation and validation complete.

### Out Of Scope

Do not change visible Blueprint copy, route URLs, Review handoff behavior, auto-download query behavior, download authorization, download archive generation, post-review unlock behavior, AppShell props or layout, checkout, billing, Stripe, pricing, promo code behavior, Convex schema, generated Convex files, environment behavior, course lesson behavior, marketing, or remaining feature folders.

Do not move `apps/web/features/course` or `apps/web/features/marketing` in this slice.

## Plan of Work

First, move shared Blueprint helper files to `apps/web/lib/blueprint-flow` and update imports in app routes, AppShell, scripts, execute-ship helpers, and tests. Keep exported names unchanged so this remains an ownership move.

Next, move route UI and hooks to workspace route private folders. Update `/blueprint`, Review, AppShell, and tests to import the new route-private owners.

Then, move the download helper to `apps/web/app/api/download/repo/_server/downloads.ts`, preserve `import "server-only"`, update the route handler and mocked integration test, and run the focused download route test.

Finally, delete the old feature folder, run old-path scans, run focused tests, broaden to app format check, app lint, app typecheck, plan and Program lint, markdown lint, Convex diff checks, and `git diff --check`, then archive the ExecPlan and update the Program.

## Milestones

The first milestone is shared-contract ownership. It is complete when Blueprint helper modules and workspace state types live under `apps/web/lib/blueprint-flow` and all non-UI consumers import that owner.

The second milestone is route-private UI and hook ownership. It is complete when Blueprint components live under `apps/web/app/(workspace)/_components/blueprint-flow` and route-local hooks live under `apps/web/app/(workspace)/_hooks/blueprint-flow`.

The third milestone is download route server ownership. It is complete when the server-only download helper lives under `apps/web/app/api/download/repo/_server` and `/api/download/repo` tests still pass.

The fourth milestone is feature-folder deletion and validation. It is complete when `apps/web/features/blueprint-flow` is absent, old-path scans return no current app or script references, focused tests and app gates pass, plan docs are current, Convex schema/generated files are unchanged, and production proof passes after merge.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Move files with `git mv` so rename history is preserved. After editing imports, run scans:

    rg '@/features/blueprint-flow|features/blueprint-flow|\.\./features/blueprint-flow|\.\./\.\./features/blueprint-flow' apps/web scripts
    find apps/web/features/blueprint-flow -maxdepth 4 -type f
    git diff --name-only -- apps/web/convex/schema.ts apps/web/convex/_generated

The first scan should return no app or script matches. The `find` command should fail because the blueprint-flow folder was deleted. The Convex diff command should return no paths.

## Validation and Acceptance

Acceptance requires `apps/web/features/blueprint-flow` to be deleted, all old blueprint-flow feature imports to be gone, Blueprint and Review behavior to remain unchanged under focused tests, and app typecheck to still build `/blueprint`, `/review`, legacy workspace redirects, and `/api/download/repo`.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/blueprint-page-state-model.test.ts tests/unit/use-blueprint-page-state.test.tsx tests/unit/blueprint-stage-save-feedback.test.tsx tests/unit/blueprint-stage-scale-field.test.tsx tests/unit/blueprint-stage-step-field.test.tsx tests/unit/blueprint-problem-statement-optimizer.test.tsx tests/unit/blueprint-step-save-feedback.test.ts tests/unit/blueprint-theme-tokens.test.ts tests/unit/review-download-handoff.test.tsx tests/unit/legacy-blueprint-route-redirects.test.ts tests/unit/app-workspace-lesson-page.test.tsx
    bun run --cwd apps/web test:integration:node -- tests/integration/blueprint-download-routes.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-stage-navigation.test.tsx tests/integration-ui/blueprint-review-page.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-blueprint-flow-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-blueprint-flow-feature-surface.md
    git diff --check

After this PR merges, inspect the `Production Release Proof` run for the merged `main` commit and confirm `default_ship` and `release_gate` pass. `billing_integration` should only run if release scope explicitly detects billing-sensitive files.

## Idempotence and Recovery

These are file moves, import updates, and docs updates. If a scan finds old paths, update the consumer to the new explicit owner instead of adding compatibility re-exports. If a focused test fails, compare imports and rendered output before changing Blueprint state, Review behavior, route redirects, or download generation.

If a server-only guard reveals a client import, move only the client-safe contract to `apps/web/lib/blueprint-flow` and keep server helpers under `_server`. If a route-private import is awkward in tests, mock the route-private module path directly rather than moving UI back into a shared feature folder.

## Artifacts and Notes

Initial import scan:

    rg -n '@/features/blueprint-flow|features/blueprint-flow|\.\./features/blueprint-flow|\.\./\.\./features/blueprint-flow' apps/web scripts docs/programs/active/2026-04-26-remove-feature-folder-surface

The scan shows current app, script, and test consumers of the blueprint-flow surface plus Program references. Current app, script, and test references should move. Historical completed plans may keep old-path history unless a current docs surface needs an ownership update.

## Interfaces and Dependencies

This slice depends on Next.js App Router private folder colocation, the protected workspace route group under `apps/web/app/(workspace)`, the download route under `apps/web/app/api/download/repo`, the shared workspace navigation models under `apps/web/lib/workspace-navigation`, the Convex blueprint APIs, the blueprint compiler package, and production release proof for the merged `main` commit.
