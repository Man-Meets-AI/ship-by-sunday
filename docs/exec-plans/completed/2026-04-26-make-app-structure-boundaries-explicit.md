---
title: Make App Structure Boundaries Explicit
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Make the existing app structure safer to refactor by exposing hidden imports, server-only boundaries, and shared utility ownership before moving folders.
post_build_recap: Selected hidden cross-feature imports now use explicit aliases, shared assert helpers live in apps/web/lib/assert.ts, true server helpers carry server-only guards, and focused plus app-wide validation passed.
program_id: app-structure-refactor
planning_brief: docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-1.md
read_when:
  - Resuming the first app structure refactor slice.
  - Grilling the boundary-safety plan before implementation.
  - Checking why the first slice does not move route screens, AppShell, Convex schema, or Stripe behavior.
---

# Make App Structure Boundaries Explicit

This is a living execution plan. It describes the first implementation slice for the app structure refactor Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The app needs a cleaner structure, but early folder moves would touch high-fan-in route, course, Convex, and billing surfaces. This first slice makes the current boundaries visible and safer before any large migration. After this slice, a contributor should be able to inspect imports and server-only boundaries with less guesswork, and later plans can move the workspace shell and route-owned code with lower risk.

This slice is intentionally behavior-neutral. It should not change customer routes, checkout, Convex schema, billing state, generated output, or visible UI.

## Progress

- [x] 2026-04-26 EDT: Grilled the plan against the repo-local `exec-plan-griller` skill, Program packet, and real import/test surfaces before implementation.
- [x] 2026-04-26 EDT: Confirmed branch `codex/app-structure-research`, read the Program packet, and found the branch already carried pre-existing Program and child ExecPlan packet changes.
- [x] 2026-04-26 EDT: Recorded baseline import, assertion-helper, server-only candidate, and route inventory before edits.
- [x] 2026-04-26 EDT: Converted selected hidden cross-feature relative imports in `workspace-navigation` and `settings` to explicit `@/` imports.
- [x] 2026-04-26 EDT: Moved shared assertion helpers to `apps/web/lib/assert.ts`, repointed all static consumers to `@/lib/assert`, and removed the old course-owned helper file.
- [x] 2026-04-26 EDT: Added `server-only` guards to the planned server-only helper modules.
- [x] 2026-04-26 EDT: Limited durable documentation updates to this ExecPlan while validation is still in progress; no architecture docs changed because the runtime behavior and public contracts did not change.
- [x] 2026-04-26 EDT: Focused unit, integration, integration-ui, and contract tests passed.
- [x] 2026-04-26 EDT: App format check, lint, and typecheck passed; the Next build route graph included Proxy and all app routes without rejecting the new server-only guards.
- [x] 2026-04-26 EDT: Requested active-path plan lint, Program lint, and markdown lint passed before archival.

## Surprises & Discoveries

2026-04-26 EDT: The pre-implementation grill found one concrete import candidate that the first draft missed. `apps/web/features/workspace-navigation/lib/lesson-map-href.ts` imports `routeConfig` through `../../../config/product` and belongs in the same explicit-import cleanup as `build-primary-nav-model.ts` and `post-review-destination.ts`.

2026-04-26 EDT: The shared assertion helper has enough non-course consumers that the implementation should not leave its final home open. The target home for this slice is `apps/web/lib/assert.ts`; update static imports to use `@/lib/assert` and delete `apps/web/features/course/lesson/lib/assert.ts` if no imports remain. Use a temporary compatibility re-export only if a real hidden consumer appears during validation.

2026-04-26 EDT: `apps/web/features/observability/server/capture-server-error.ts` is also a server-only helper candidate because it forwards to `ingest-error-event` and is imported from server routes and server runtime code. It should be evaluated with the other server-only candidates.

2026-04-26 EDT: The worktree was not clean before implementation. `docs/programs/README.md`, `docs/programs/active/index.md`, the active Program packet, and this child ExecPlan were already dirty or untracked on branch `codex/app-structure-research`; the code slice did not apply the unrelated stashed scrollbar styling work.

2026-04-26 EDT: The `apps/web/node_modules/next/dist/docs/` path named in `AGENTS.md` does not exist because this checkout hoists Next dependencies to repo-root `node_modules/`. The relevant Next 16.2 docs were available at `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` and confirmed that `import "server-only"` marks server-only modules and causes build-time errors when imported into client modules.

2026-04-26 EDT: The npm `server-only` package throws when loaded through its default export outside the React Server condition, so focused Vitest files that import newly guarded modules need the repo's existing `vi.mock("server-only", () => ({}))` pattern.

## Decision Log

Decision: Do not move `AppShell` in this slice.
Rationale: `AppShell` is broad and client-side. Moving it belongs in the second child plan after this baseline exposes import edges and shared utility ownership.
Date: 2026-04-26

Decision: Do not move billing, Convex schema, route pages, or course registry files in this slice.
Rationale: Those areas are high-risk and need dedicated later plans with narrow proof.
Date: 2026-04-26

Decision: Move the shared assert helpers to `apps/web/lib/assert.ts`.
Rationale: The helper is pure TypeScript and currently imported by auth, checkout, Codex, marketing, product-access, and course workbench code. Keeping it under `features/course/lesson/lib` makes course look like shared infrastructure.
Date: 2026-04-26

## Outcomes & Retrospective

This boundary-safety slice is complete. Selected hidden cross-feature relative imports in `workspace-navigation` and `settings` now use explicit `@/` imports. Shared assertion helpers now live at `apps/web/lib/assert.ts`, and all previous consumers import `@/lib/assert`; the old course-owned helper file was removed with no compatibility re-export needed. `apps/web/features/codex/server/route-helpers.ts`, `apps/web/features/execute-ship/server/bonus-lesson-view-tracking.ts`, `apps/web/features/observability/server/ingest-error-event.ts`, `apps/web/features/observability/server/capture-server-error.ts`, and `apps/web/platform/env/server.ts` now carry `import "server-only"`.

Focused tests, app format check, app lint, app typecheck, active-path plan lint, Program lint, and markdown lint all passed before archival. The slice did not move `AppShell`, route screens, feature folders, Convex schema or generated files, Stripe checkout or billing behavior, UI inventory, or the unrelated stashed scrollbar styling.

## Context and Orientation

Ship by Sunday's web app lives in `apps/web`. The product contract in `apps/web/AGENTS.md` says the app is codebase-first, not course-first. The current structure still has shared workspace shell code under `apps/web/features/course/shared/components/app-shell`, and several feature boundaries import each other through relative paths that are hard to find with a simple `rg "@/features"`.

The App Router lives under `apps/web/app`. Route files are mostly thin adapters into `apps/web/features`. Convex backend code lives under `apps/web/convex`. External runtime integrations live under `apps/web/platform`. Shared UI primitives live under `apps/web/components/ui`.

The first slice should touch only boundary-safety code and docs. It should make future moves safer without changing runtime behavior.

### In Scope

This plan may update import paths where an existing cross-feature relative import already crosses a boundary and an explicit `@/` import makes that boundary visible.

This plan may move shared assertion helpers from `apps/web/features/course/lesson/lib/assert.ts` to a neutral shared module if current consumers already span auth, checkout, Codex, and course.

This plan may add `import "server-only"` to modules that already depend on server-only APIs, environment values, route handlers, Convex server preload, or server observability behavior.

This plan may add a short architecture note or update existing docs to reflect the boundary rule proven by the changes.

### Out Of Scope

Do not move `apps/web/features/course/shared/components/app-shell`.

Do not move route screens into `apps/web/app` private folders.

Do not rename or delete top-level feature folders.

Do not modify Convex schema, generated Convex files, public Convex function names, or hosted Convex configuration.

Do not change Stripe checkout, Stripe webhook routing, billing proof, pricing, promotion codes, or environment values.

Do not delete unused `components/ui` inventory.

Do not include the unrelated stashed scrollbar styling change.

## Plan of Work

Start by reading the Program packet under `docs/programs/completed/2026-04-26-app-structure-refactor/`, the root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/programs/PROGRAMS.md`, and this plan.

Record a baseline with `rg` and `find` commands that capture route aliases, cross-feature relative imports, server-only candidates, and shared assert consumers. Keep any one-off scripts under ignored `codex-scripts/` if a script is needed to inspect import behavior. The baseline should name the exact files changed so the final summary can distinguish this slice from later folder moves.

Replace hidden cross-feature relative imports with explicit `@/` imports where this does not alter behavior. Initial candidates from research and the grill are `apps/web/features/workspace-navigation/lib/build-primary-nav-model.ts`, `apps/web/features/workspace-navigation/lib/post-review-destination.ts`, `apps/web/features/workspace-navigation/lib/lesson-map-href.ts`, and `apps/web/features/settings/components/settings-page.tsx`.

Move shared assertion helpers to `apps/web/lib/assert.ts`. That module should export only the current `assert` and `assertNever` functions, stay free of React, Next, Convex, browser globals, and server-only dependencies, and be safe for both client and server TypeScript imports. Update all static imports from `@/features/course/lesson/lib/assert` to `@/lib/assert`. Delete `apps/web/features/course/lesson/lib/assert.ts` if the import scan proves no consumers remain. If a hidden consumer appears, leave a temporary compatibility re-export at the old path, record that in `Surprises & Discoveries`, and plan its removal in the next slice.

Add `import "server-only"` to true server-only modules. Initial candidates from research and the grill include `apps/web/features/codex/server/route-helpers.ts`, `apps/web/features/execute-ship/server/bonus-lesson-view-tracking.ts`, `apps/web/features/observability/server/ingest-error-event.ts`, `apps/web/features/observability/server/capture-server-error.ts`, and `apps/web/platform/env/server.ts`. If adding the guard reveals a client import, stop and fix the boundary rather than removing the guard. Do not add `server-only` to pure modules such as observability event normalization unless they actually depend on server runtime APIs.

Update documentation only if the implemented changes create a durable boundary rule that future slices must follow.

## Milestones

The first milestone is baseline evidence. It is complete when the implementer can name the exact imports, helpers, and server-only candidates being changed and has recorded commands in `Artifacts and Notes`.

The second milestone is import visibility. It is complete when cross-feature relative imports in the selected files use explicit `@/` imports and focused tests still pass.

The third milestone is shared utility ownership. It is complete when the shared assertion helper no longer lives under course ownership and all imports resolve.

The fourth milestone is server-only protection. It is complete when true server-only helpers carry `import "server-only"` and validation confirms no client modules import them.

The fifth milestone is validation and documentation. It is complete when touched docs are updated if needed and all test commands pass or have explicit, truthful blockers recorded in this plan.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Read the Program packet:

    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/program.md
    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-1.md

Record baseline import evidence:

    rg 'from ["'\"']\\.\\./\\.\\./' apps/web/features/workspace-navigation apps/web/features/settings
    rg '@/features/course/lesson/lib/assert|features/course/lesson/lib/assert' apps/web
    rg 'process\\.env|next/headers|next/navigation|@clerk/nextjs/server|server-only' apps/web/features apps/web/platform
    rg '@/features/(codex/server/route-helpers|execute-ship/server/bonus-lesson-view-tracking|observability/server/ingest-error-event|observability/server/capture-server-error)|@/platform/env/server' apps/web

After import rewrites, prove the selected hidden relative imports and old assertion imports are gone:

    rg 'from ["'\"']\\.\\./\\.\\./' apps/web/features/workspace-navigation apps/web/features/settings
    rg '@/features/course/lesson/lib/assert|features/course/lesson/lib/assert' apps/web

Run focused tests for touched surfaces. Pick the narrowest tests that map to the changed files. Likely commands include:

    bun run --cwd apps/web test:unit -- tests/unit/settings-page.test.tsx tests/unit/codex-route-helpers.test.ts tests/unit/observability-ingest.test.ts tests/unit/observability-capture-server-error.test.ts tests/unit/env.test.ts tests/unit/checkout-session.test.ts tests/unit/observability-api-error-response.test.ts
    bun run --cwd apps/web test:integration:node -- tests/integration/codex-route-handlers.test.ts tests/integration/bonus-lesson-viewed-route.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-primary-nav.test.tsx
    bun run --cwd apps/web test:contracts

Then run app quality checks:

    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck

Validate this plan and Program packet if they are updated during implementation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md
    git diff --check

## Validation and Acceptance

The slice is accepted when selected cross-feature imports are explicit, shared assertion helpers are no longer course-owned, true server-only modules have guards, no visible route or checkout behavior changes, and the validation commands pass.

If `server-only` exposes a client import, the accepted result is not to remove the guard. The accepted result is to repair or split the import boundary so server-only code stays server-only.

The implementation summary must include the post-change output of the two import scans proving that the old course assert path and the selected cross-feature relative imports are gone, or it must explain any remaining compatibility re-export.

### Test Commands

Run these commands from repo root after implementation:

    bun run --cwd apps/web test:unit -- tests/unit/settings-page.test.tsx tests/unit/codex-route-helpers.test.ts tests/unit/observability-ingest.test.ts tests/unit/observability-capture-server-error.test.ts tests/unit/env.test.ts tests/unit/checkout-session.test.ts tests/unit/observability-api-error-response.test.ts
    bun run --cwd apps/web test:integration:node -- tests/integration/codex-route-handlers.test.ts tests/integration/bonus-lesson-viewed-route.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-primary-nav.test.tsx
    bun run --cwd apps/web test:contracts
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md
    git diff --check

If implementation touches fewer files than the candidates above, the agent may reduce the focused test list only by recording the untouched candidates in `Progress` or `Surprises & Discoveries`. Do not claim this plan is complete without focused tests that prove every changed code path.

## Idempotence and Recovery

Import path changes are safe to rerun because they are behavior-neutral text edits. If typecheck fails, inspect the first unresolved import and repair the path rather than reverting unrelated files.

If moving the shared assert helper causes unexpected bundle or runtime coupling, keep the new neutral helper and add a temporary compatibility re-export from the old course path only if needed. Record the temporary export in `Surprises & Discoveries` and remove it in a later plan.

If a `server-only` guard reveals client usage, split the module or move the client-safe function out. Do not hide the problem by deleting `server-only`.

## Artifacts and Notes

Research source packet:

    docs/programs/completed/2026-04-26-app-structure-refactor/research-pass-app-structure.md

Current planning brief:

    docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-1.md

The unrelated scrollbar styling work was stashed before this branch was created:

    stash@{Sat Apr 25 23:30:29 2026}: On codex/global-scrollbar-style: wip: global scrollbar style

Baseline branch and import evidence before edits:

    git status --short --branch --show-stash
    ## codex/app-structure-research
     M docs/programs/README.md
     M docs/programs/active/index.md
    ?? docs/exec-plans/active/
    ?? docs/programs/completed/2026-04-26-app-structure-refactor/

    rg 'from ["'\"']\.\./\.\./' apps/web/features/workspace-navigation apps/web/features/settings
    apps/web/features/workspace-navigation/lib/post-review-destination.ts:import { routeConfig } from "../../../config/product";
    apps/web/features/workspace-navigation/lib/post-review-destination.ts:} from "../../course/lesson/model/manifest";
    apps/web/features/workspace-navigation/lib/post-review-destination.ts:import { getStudentFacingLessons } from "../../course/lesson/model/registry";
    apps/web/features/settings/components/settings-page.tsx:import { CodexConnectionCard } from "../../codex/components/codex-connection-card";
    apps/web/features/workspace-navigation/lib/build-primary-nav-model.ts:import { getLessonHref } from "../../course/lesson/model/manifest";
    apps/web/features/workspace-navigation/lib/build-primary-nav-model.ts:import type { BonusMissionState } from "../../execute-ship/lib/bonus-mission-types";
    apps/web/features/workspace-navigation/lib/lesson-map-href.ts:import { routeConfig } from "../../../config/product";

    rg '@/features/course/lesson/lib/assert|features/course/lesson/lib/assert' apps/web
    apps/web/features/marketing/components/home-page/home-page-primary-cta.tsx:import { assertNever } from "@/features/course/lesson/lib/assert";
    apps/web/features/codex/hooks/use-codex-connection-card.ts:import { assert } from "@/features/course/lesson/lib/assert";
    apps/web/features/product-access/lib/access-required-view-model.ts:import { assertNever } from "@/features/course/lesson/lib/assert";
    apps/web/features/checkout/hooks/use-stripe-checkout.ts:import { assert } from "@/features/course/lesson/lib/assert";
    apps/web/features/auth/sign-in/sign-in-page-content.ts:import { assertNever } from "@/features/course/lesson/lib/assert";
    apps/web/features/checkout/components/checkout-success-view-model.ts:import { assertNever } from "@/features/course/lesson/lib/assert";
    apps/web/features/course/lesson/workbench/fields/checklist-field-rows.tsx:import { assert } from "@/features/course/lesson/lib/assert";
    apps/web/features/auth/sign-in/use-sign-in-flow.ts:import { assertNever } from "@/features/course/lesson/lib/assert";
    apps/web/features/course/lesson/workbench/fields/collection-field-controls.tsx:import { assert } from "@/features/course/lesson/lib/assert";
    apps/web/features/auth/sign-in/sign-in-reset-form.tsx:import { assertNever } from "@/features/course/lesson/lib/assert";
    apps/web/features/course/lesson/workbench/shared/prompt-import-card.tsx:import { assertNever } from "@/features/course/lesson/lib/assert";
    apps/web/features/course/lesson/workbench/fields/basic-field-controls.tsx:import { assert } from "@/features/course/lesson/lib/assert";
    apps/web/features/course/lesson/workbench/fields/editable-table-field.tsx:import { assert, assertNever } from "@/features/course/lesson/lib/assert";
    apps/web/features/course/lesson/workbench/modes/sketch-upload-workbench.tsx:import { assert } from "@/features/course/lesson/lib/assert";
    apps/web/features/course/lesson/workbench/modes/core-flow-sketch/core-flow-sketch-fields.tsx:import { assert } from "@/features/course/lesson/lib/assert";
    apps/web/features/course/lesson/workbench/modes/core-flow-sketch/core-flow-sketch-brand-section.tsx:import { assert } from "@/features/course/lesson/lib/assert";
    apps/web/features/course/lesson/workbench/modes/core-ux-plan-flow/core-ux-plan-flow-shadcn-field-control.tsx:import { assert } from "@/features/course/lesson/lib/assert";
    apps/web/features/course/lesson/workbench/modes/codex-marketing-site/codex-marketing-site-marketing-field.tsx:import { assert } from "@/features/course/lesson/lib/assert";

Post-edit import evidence before validation:

    rg 'from ["'\"']\.\./\.\./' apps/web/features/workspace-navigation apps/web/features/settings
    # no matches

    rg '@/features/course/lesson/lib/assert|features/course/lesson/lib/assert' apps/web
    # no matches

Focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/settings-page.test.tsx tests/unit/codex-route-helpers.test.ts tests/unit/observability-ingest.test.ts tests/unit/observability-capture-server-error.test.ts tests/unit/env.test.ts tests/unit/checkout-session.test.ts tests/unit/observability-api-error-response.test.ts
    Test Files  7 passed (7)
    Tests  41 passed (41)

    bun run --cwd apps/web test:integration:node -- tests/integration/codex-route-handlers.test.ts tests/integration/bonus-lesson-viewed-route.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts
    Test Files  5 passed (5)
    Tests  43 passed (43)

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-primary-nav.test.tsx
    Test Files  1 passed (1)
    Tests  1 passed (1)

    bun run --cwd apps/web test:contracts
    Test Files  1 passed (1)
    Tests  4 passed (4)

App-wide validation:

    bun run format:check
    All matched files use the correct format.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Compiled successfully in 15.7s
    Finished TypeScript in 14.6s
    Generated static pages 71/71

Plan validation before archival:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-26-make-app-structure-boundaries-explicit.md
    docs/exec-plans/active/2026-04-26-make-app-structure-boundaries-explicit.md: ok

    bun run programs:lint
    app-structure-refactor: ok
    Program prompt inventory: ok

    bun run markdown:lint -- --paths docs/programs docs/exec-plans/active/2026-04-26-make-app-structure-boundaries-explicit.md
    docs/exec-plans/active/2026-04-26-make-app-structure-boundaries-explicit.md: ok
    docs/programs/completed/2026-04-26-app-structure-refactor/program.md: ok

Post-archival validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md
    docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md: ok

    bun run programs:lint
    app-structure-refactor: ok
    Program prompt inventory: ok

    bun run markdown:lint -- --paths docs/programs docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md
    docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md: ok
    docs/programs/completed/2026-04-26-app-structure-refactor/program.md: ok

    git diff --check
    # passed with no output

## Interfaces and Dependencies

This plan depends on `apps/web/AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `apps/web/tsconfig.json`, `apps/web/vitest.config.ts`, `apps/web/features`, `apps/web/app`, `apps/web/convex`, and `apps/web/platform`.

Any import alias change must keep TypeScript and Vitest resolution aligned. Any server-only change must respect Next.js App Router server/client boundaries.
