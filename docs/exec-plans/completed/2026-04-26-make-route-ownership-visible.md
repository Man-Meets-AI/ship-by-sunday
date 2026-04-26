---
title: Make Route Ownership Visible
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Move the first route-owned workspace access and legacy redirect surfaces into App Router private folders without changing access or redirect behavior.
post_build_recap: Workspace access gate UI and legacy blueprint redirect helpers now live under apps/web/app/(workspace) private folders with old feature paths kept as compatibility exports and focused plus app validation passed.
program_id: app-structure-refactor
planning_brief: docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-3.md
read_when:
  - Reviewing the completed first route-ownership visibility slice.
  - Checking why this route slice starts with workspace access and legacy redirects.
  - Validating that access, checkout, Convex, and route alias behavior stayed unchanged.
---

# Make Route Ownership Visible

This is a living execution plan. It describes the third implementation slice for the app structure refactor Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The App Router should be readable as the product route map. Today some route-owned UI and redirect helpers still live under broad feature paths even though they are used only to support specific App Router segments. After this slice, the protected workspace access gate and the old stage redirect helper will sit under `apps/web/app/(workspace)/` private folders, so a reader inspecting the route tree can find the route behavior where it is applied.

This slice is behavior-neutral. It should not change protected-route coverage, access decisions, checkout handoff, Convex state, route aliases, visible UI, billing, or environment behavior.

## Progress

- [x] 2026-04-26 EDT: Confirmed the first two child ExecPlans are complete and the Program names `Make Route Ownership Visible` as the next recommended slice.
- [x] 2026-04-26 EDT: Inspected App Router pages, product access gate consumers, legacy blueprint redirect consumers, and focused tests before editing.
- [x] 2026-04-26 EDT: Moved workspace access gate UI, controller, and view model into private `(workspace)` App Router folders.
- [x] 2026-04-26 EDT: Moved the legacy blueprint redirect helper into `apps/web/app/(workspace)/_lib/`.
- [x] 2026-04-26 EDT: Updated first-party imports and tests to the new App Router paths.
- [x] 2026-04-26 EDT: Left temporary compatibility re-exports at the old feature paths.
- [x] 2026-04-26 EDT: Focused route-ownership unit and integration-ui tests passed.
- [x] 2026-04-26 EDT: App format check, lint, and typecheck passed after the route-local moves.
- [x] 2026-04-26 EDT: Active-path plan lint, Program lint, markdown lint, and `git diff --check` passed before archival.

## Surprises & Discoveries

2026-04-26 EDT: The access gate split has a clean route-local boundary. `AccessRequiredPage`, its presentation components, `useAccessRequiredController`, and `access-required-view-model.ts` are consumed by `apps/web/app/(workspace)/layout.tsx` and tests. The durable access-domain pieces, `apps/web/features/product-access/server/product-access.ts` and `apps/web/features/product-access/lib/product-access.ts`, are also consumed by the homepage redirect, Codex server route helpers, checkout success view, and course access tests, so they stay in the feature.

2026-04-26 EDT: `legacy-blueprint-route-redirects.ts` is route-owned compatibility logic. Its only production consumers are the App Router compatibility pages under `apps/web/app/(workspace)/start`, `product`, `design`, `marketing`, and `build-plan`, plus its focused unit test.

2026-04-26 EDT: After the move, `rg 'features/product-access/(components|hooks|lib/access-required-view-model)|features/blueprint-flow/lib/legacy-blueprint-route-redirects' apps/web/app apps/web/features apps/web/tests --glob '!node_modules'` produced no matches. The old feature files now contain only compatibility re-exports to `@/app/(workspace)/...` paths.

2026-04-26 EDT: The first post-move format check failed only on `tests/unit/app-protected-layout.test.tsx` after its mock import changed to the longer App Router path. Running the repo formatter repaired that mechanical import layout, and the focused tests still passed afterward.

## Decision Log

Decision: Start route ownership with the workspace access gate and legacy blueprint redirect helper.
Rationale: Both are route-owned, well-tested, and behavior-neutral to move. Identity flows, checkout success, review preload, and API route contracts are more sensitive and should not be mixed into this slice.
Date: 2026-04-26

Decision: Keep durable product-access server and type modules under `features/product-access`.
Rationale: `getServerProductAccess` and the `ProductAccess` type represent access-domain behavior used by multiple surfaces. Moving them under a single route would make the boundary less clear.
Date: 2026-04-26

Decision: Keep temporary compatibility exports at the old feature paths.
Rationale: This Program is still mid-migration. Re-exports make hidden imports less disruptive while first-party code is moved to the App Router path.
Date: 2026-04-26

## Outcomes & Retrospective

This plan is complete. First-party route code and tests now import the workspace access gate from `@/app/(workspace)/_components/access-required/access-required-page` and legacy redirect helpers from `@/app/(workspace)/_lib/legacy-blueprint-route-redirects`. The old product-access UI, access gate hook, access gate view-model, and legacy redirect feature paths remain as thin compatibility re-exports.

Focused route-ownership unit tests, access-required integration-ui tests, app format check, app lint, app typecheck, active-path plan lint, Program lint, markdown lint, and `git diff --check` passed. The implementation did not move route pages, identity screens, checkout success screens, review preload logic, API route contracts, course registry or manifest files, Convex schema or generated files, Stripe checkout or billing behavior, UI inventory, or the unrelated stashed scrollbar styling.

## Context and Orientation

Ship by Sunday's web app lives in `apps/web`. The App Router lives under `apps/web/app`. Durable feature code lives under `apps/web/features`. The Program's boundary rule is that route entrypoints, route-level guards, route-local wrappers, and route-only helpers should live near the route that uses them.

The protected workspace layout is `apps/web/app/(workspace)/layout.tsx`. It calls `getServerProductAccess` from `apps/web/features/product-access/server/product-access.ts` to decide whether protected workspace children can render. When access is missing, it renders an access gate page. That access gate UI is currently in `apps/web/features/product-access/components`, with a controller hook in `apps/web/features/product-access/hooks/use-access-required-controller.ts` and UI view-model logic in `apps/web/features/product-access/lib/access-required-view-model.ts`.

The old stage routes are compatibility routes under `apps/web/app/(workspace)/start`, `product`, `design`, `marketing`, and `build-plan`. They redirect into the canonical Blueprint page. Their helper currently lives in `apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts`, even though it only supports those route files.

### In Scope

Move the access gate page, access gate presentation components, access gate controller hook, and access gate view-model helper into private folders under `apps/web/app/(workspace)/`.

Move the legacy blueprint route redirect helper into `apps/web/app/(workspace)/_lib/`.

Update first-party route files and tests to import the moved modules from the new App Router private paths.

Leave temporary compatibility re-exports in the old feature paths.

Update this ExecPlan, the owning Program, the third planning brief pointer, and only plan surfaces required by the actual changes.

### Out Of Scope

Do not move route pages themselves.

Do not move identity sign-in, sign-up, SSO callback, or reset-password screens.

Do not move checkout success screens or change checkout session, Stripe, billing, pricing, promo code, billing proof, webhook, or environment behavior.

Do not move review route preload logic, Blueprint review components, API route request contracts, course lesson registry files, course manifest files, Convex schema, generated Convex files, public Convex function names, or hosted Convex configuration.

Do not delete top-level feature folders or `components/ui` inventory.

Do not include the unrelated stashed scrollbar styling change.

## Plan of Work

Start by confirming the current import fan-in for the access gate and legacy redirect helper. Record the baseline in this plan so later reviewers can see why these files are route-owned.

Create `apps/web/app/(workspace)/_components/access-required/`, `apps/web/app/(workspace)/_hooks/`, and `apps/web/app/(workspace)/_lib/`.

Move `apps/web/features/product-access/components/access-required-page.tsx`, `access-required-shell.tsx`, `access-required-header.tsx`, `access-required-help-panel.tsx`, `access-required-path-panel.tsx`, `access-required-status-panel.tsx`, and `access-required-actions.tsx` into the new access-required component folder. Move `apps/web/features/product-access/hooks/use-access-required-controller.ts` into `apps/web/app/(workspace)/_hooks/use-access-required-controller.ts`. Move `apps/web/features/product-access/lib/access-required-view-model.ts` into `apps/web/app/(workspace)/_lib/access-required-view-model.ts`.

Update imports inside the moved access gate files to use local relative imports for route-local files and `@/features/product-access/lib/product-access` for the durable `ProductAccess` type. Keep `apps/web/features/product-access/server/product-access.ts` unchanged.

Move `apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts` to `apps/web/app/(workspace)/_lib/legacy-blueprint-route-redirects.ts`. Update the compatibility route pages and `apps/web/tests/unit/legacy-blueprint-route-redirects.test.ts` to import from the new App Router private path.

Replace the old product-access UI, hook, and view-model files with compatibility re-exports from the new route-local paths. Replace the old legacy redirect helper with a compatibility re-export from the new route-local path.

Keep plan and Program documents current as work proceeds. If validation reveals a hidden durable consumer, record it in `Surprises & Discoveries` before changing the approach.

## Milestones

The first milestone is baseline evidence. It is complete when the import scan proves which production files and tests consume the access gate and legacy redirect helper.

The second milestone is access gate colocation. It is complete when the access gate UI, controller, and view model live under `apps/web/app/(workspace)/` private folders and old feature paths are compatibility re-exports.

The third milestone is legacy redirect colocation. It is complete when the old stage redirect helper lives under `apps/web/app/(workspace)/_lib/`, compatibility route pages import it from there, and the old feature path is a compatibility re-export.

The fourth milestone is validation. It is complete when focused tests, format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and diff checks pass.

The fifth milestone is archival. It is complete when this ExecPlan records the completed outcome, moves from `docs/exec-plans/active/` to `docs/exec-plans/completed/`, and the Program names the next slice.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Read the Program and this planning brief:

    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/program.md
    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-3.md

Record baseline imports:

    rg 'features/product-access/(components|hooks|lib/access-required-view-model)' apps/web --glob '!node_modules'
    rg 'features/blueprint-flow/lib/legacy-blueprint-route-redirects|app/\\(workspace\\)/_lib/legacy-blueprint-route-redirects' apps/web --glob '!node_modules'

After the moves and import updates, prove first-party consumers use the App Router paths and old feature paths are compatibility exports:

    rg 'features/product-access/(components|hooks|lib/access-required-view-model)' apps/web --glob '!node_modules'
    rg 'features/blueprint-flow/lib/legacy-blueprint-route-redirects' apps/web --glob '!node_modules'
    rg 'app/\\(workspace\\)/(_components/access-required|_hooks/use-access-required-controller|_lib/(access-required-view-model|legacy-blueprint-route-redirects))' apps/web --glob '!node_modules'

Run focused route-ownership tests:

    bun run --cwd apps/web test:unit -- tests/unit/access-required-page.test.tsx tests/unit/app-protected-layout.test.tsx tests/unit/legacy-blueprint-route-redirects.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx

Then run app and plan checks:

    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-route-ownership-visible.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-route-ownership-visible.md
    git diff --check

## Validation and Acceptance

This slice is accepted when the workspace access gate UI lives under `apps/web/app/(workspace)/_components/access-required`, its controller and view-model helper live under private `(workspace)` folders, legacy blueprint redirect helpers live under `apps/web/app/(workspace)/_lib`, first-party imports use those App Router paths, old feature paths are compatibility re-exports only, and focused plus app-level validation pass.

Protected workspace behavior must remain unchanged. `tests/unit/app-protected-layout.test.tsx` must still prove `getServerProductAccess` runs before protected children render, and access-required unit and integration-ui tests must still prove loading, signed-out, no-access, token-missing, retry, refresh, and reauthentication states.

Legacy route alias behavior must remain unchanged. `tests/unit/legacy-blueprint-route-redirects.test.ts` must still prove `/start`, `/product`, `/design`, `/marketing`, and `/build-plan` compatibility destinations.

### Test Commands

Run these commands from repo root after implementation:

    bun run --cwd apps/web test:unit -- tests/unit/access-required-page.test.tsx tests/unit/app-protected-layout.test.tsx tests/unit/legacy-blueprint-route-redirects.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx
    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-26-make-route-ownership-visible.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/active/2026-04-26-make-route-ownership-visible.md
    git diff --check

## Idempotence and Recovery

The moves are safe to retry because the old feature files become compatibility re-exports. If a path rewrite misses a test mock or static import, fix the import and rerun the focused tests.

If typecheck shows that a moved file is imported by a durable non-route feature, stop and record the consumer before deciding whether to keep a compatibility export or move that file back. Do not broaden the slice into identity, checkout success, review preload, API route contracts, course registry, Convex, or billing.

If access gate behavior tests fail, compare imports first. This slice should not change logic or copy. Repair path and module-boundary issues before considering behavior changes.

## Artifacts and Notes

Source Program packet:

    docs/programs/completed/2026-04-26-app-structure-refactor/

Current planning brief:

    docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-3.md

Baseline route-owned access gate fan-in:

    apps/web/app/(workspace)/layout.tsx
    apps/web/tests/unit/access-required-page.test.tsx
    apps/web/tests/unit/app-protected-layout.test.tsx
    apps/web/tests/integration-ui/access-required-page.test.tsx
    apps/web/tests/integration-ui/access-required-page.interactions.test.tsx

Focused validation passed:

    bun run --cwd apps/web test:unit -- tests/unit/access-required-page.test.tsx tests/unit/app-protected-layout.test.tsx tests/unit/legacy-blueprint-route-redirects.test.ts
    Test Files  3 passed (3)
    Tests  7 passed (7)

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx
    Test Files  2 passed (2)
    Tests  10 passed (10)

App validation passed:

    bun run format:check
    All matched files use the correct format.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Compiled successfully, finished TypeScript, generated 71 static pages, and produced the App Router route graph.

Plan and diff validation passed before archival:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-26-make-route-ownership-visible.md
    docs/exec-plans/active/2026-04-26-make-route-ownership-visible.md: ok

    bun run programs:lint
    app-structure-refactor: ok

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/active/2026-04-26-make-route-ownership-visible.md
    docs/exec-plans/active/2026-04-26-make-route-ownership-visible.md: ok
    docs/programs/completed/2026-04-26-app-structure-refactor/program.md: ok

    git diff --check
    no output

Baseline legacy redirect fan-in:

    apps/web/app/(workspace)/start/page.tsx
    apps/web/app/(workspace)/product/page.tsx
    apps/web/app/(workspace)/product/[stepId]/page.tsx
    apps/web/app/(workspace)/design/page.tsx
    apps/web/app/(workspace)/design/[stepId]/page.tsx
    apps/web/app/(workspace)/marketing/page.tsx
    apps/web/app/(workspace)/marketing/[stepId]/page.tsx
    apps/web/app/(workspace)/build-plan/page.tsx
    apps/web/app/(workspace)/build-plan/[stepId]/page.tsx
    apps/web/tests/unit/legacy-blueprint-route-redirects.test.ts

Post-move scan:

    rg 'features/product-access/(components|hooks|lib/access-required-view-model)|features/blueprint-flow/lib/legacy-blueprint-route-redirects' apps/web/app apps/web/features apps/web/tests --glob '!node_modules'
    no matches

    rg 'app/\(workspace\)/(_components/access-required|_hooks/use-access-required-controller|_lib/(access-required-view-model|legacy-blueprint-route-redirects))' apps/web/app apps/web/features apps/web/tests --glob '!node_modules'
    apps/web/app/(workspace)/layout.tsx
    apps/web/app/(workspace)/start/page.tsx
    apps/web/app/(workspace)/product/page.tsx
    apps/web/app/(workspace)/product/[stepId]/page.tsx
    apps/web/app/(workspace)/design/page.tsx
    apps/web/app/(workspace)/design/[stepId]/page.tsx
    apps/web/app/(workspace)/marketing/page.tsx
    apps/web/app/(workspace)/marketing/[stepId]/page.tsx
    apps/web/app/(workspace)/build-plan/page.tsx
    apps/web/app/(workspace)/build-plan/[stepId]/page.tsx
    apps/web/tests/unit/access-required-page.test.tsx
    apps/web/tests/unit/app-protected-layout.test.tsx
    apps/web/tests/unit/legacy-blueprint-route-redirects.test.ts
    apps/web/tests/integration-ui/access-required-page.test.tsx
    apps/web/tests/integration-ui/access-required-page.interactions.test.tsx

## Interfaces and Dependencies

The moved access gate remains a client UI surface. It depends on Clerk client hooks, Convex React hooks, Next navigation hooks, shared UI primitives, `CheckoutButton`, `routeConfig`, `timingConfig`, `ProductAccess`, and `getServerProductAccess` in the workspace layout. Only the UI/controller/view-model ownership changes; the access-domain server function and product-access type remain in `features/product-access`.

The moved legacy redirect helper depends on `routeConfig` and `getBlueprintPageSectionHref`. It is route compatibility logic, not blueprint domain state. The compatibility export at `apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts` should stay thin until a later cleanup slice removes old feature-path imports.
