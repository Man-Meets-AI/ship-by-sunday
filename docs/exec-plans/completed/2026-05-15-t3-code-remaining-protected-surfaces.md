---
title: T3 Code Remaining Protected Surfaces
status: complete
created_at: 2026-05-15
completed_at: 2026-05-15
summary: Apply the shared protected route-surface recipe to Worker findings, finding detail, Worker runs, loops, privacy, and tutorial index surfaces inside the Sidebar app shell.
post_build_recap: Worker findings, finding detail, runs, loops, privacy, and the Starter tutorial index now use the shared protected route page/header/panel recipe while preserving AppShell props, local navigation, route URLs, copy controls, filters, run history, privacy actions, workflow approvals, and tutorial hrefs.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-7.md
read_when:
  - Resuming the remaining protected route-surface sweep.
  - Reviewing Worker findings/detail, Worker runs, loops, privacy, or tutorial index visual migration.
  - Checking why this slice avoids admin policy and backend behavior changes.
---

# T3 Code Remaining Protected Surfaces

This document is a living execution plan for the remaining protected route-surface sweep of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The first protected route-surface slice proved the shared T3 Code-style page recipe on Starter home, Workers setup, and settings. Several protected routes still show the old page-island pattern: serif display headings, negative tracking, ad hoc summary cards, and rounded-xl route-local panels. This slice applies the proven recipe to the next representative protected app surfaces so the Sidebar-backed app feels coherent across Worker operations and tutorial browsing.

After this slice, the Worker findings ledger, finding detail, run history, loops catalog, privacy controls, and Starter tutorial video index render with compact protected route headers, quiet T3 panels, and dense summary or block navigation surfaces. The user-visible behavior stays the same: findings still filter and link to detail pages, finding approval still uses the same Convex mutation and local proof command contract, run history still exposes doctor-pass and workflow proof rows, privacy controls still call the same hosted-state mutations, loops still link back to findings, and tutorial videos still link to the same lesson routes. Route protection, AppShell props, local navigation, support/admin policy, Convex behavior, and generated-codebase output did not change.

## Progress

- [x] 2026-05-15: Read root and app agent instructions, release workflow, app architecture/conventions, Next App Router docs, the active Program, planning brief 7, and the completed protected route-surface ExecPlan.
- [x] 2026-05-15: Inspected Worker findings, Worker runs, tutorial index route components, and their focused tests.
- [x] 2026-05-15: Created this active ExecPlan for a bounded remaining protected surface sweep.
- [x] 2026-05-15: Expanded the sweep to include the remaining old route shells in the same Worker findings/support family: finding detail, loops, and privacy.
- [x] 2026-05-15: Migrated the touched route wrappers, headers, summaries, empty states, tables, approval panels, and tutorial block panels onto the shared protected route-surface helpers.
- [x] 2026-05-15: Updated focused tests to assert protected route slots and absence of the old `font-heading-serif` shell while preserving behavior-sensitive checks.
- [x] 2026-05-15: Ran focused tests, local browser proof through a temporary route, broad validation, and Program/ExecPlan lint before moving this plan to completed.

## Surprises & Discoveries

Planning brief 7 allows either support/admin or course/tutorial coverage. Admin impersonation is policy-sensitive, so this slice chose privacy/loops support surfaces plus the tutorial index instead of touching admin impersonation behavior. A scope check found finding detail, privacy, and loops still used the same old serif/page-island shell inside the touched Worker route family, so they were included to avoid leaving an obvious partial migration in the same operational area.

## Decision Log

Decision: Scope this slice to Worker findings, finding detail, Worker runs, loops, privacy, and the Starter tutorial video index.
Rationale: This covers the required Worker findings/runs path, safe support surfaces, and a course/tutorial route without changing admin policy or backend/provider behavior. It also keeps the diff testable with existing focused unit and integration-ui suites.
Date: 2026-05-15

Decision: Reuse `apps/web/src/components/app/protected-route-surface.tsx` instead of creating route-local wrappers.
Rationale: The prior slice introduced this module as the shared protected app route-body recipe. Reusing it proves the pattern can scale while avoiding new underscored route-local structure.
Date: 2026-05-15

Decision: Preserve existing filters, links, copy targets, local nav, and tutorial route hrefs.
Rationale: This is a visual/source-shape migration. The behavior users rely on belongs to the current route components and focused tests, and should not change in this pass.
Date: 2026-05-15

Decision: Keep `WorkspaceOperatorSummaryCard` for summary rows that expose copy buttons, but render it with the shared protected route panel recipe.
Rationale: The server-side `ProtectedRouteSummaryGrid` intentionally has no clipboard behavior. Reusing the existing client summary card preserves the current findings/runs/privacy copy controls while aligning the visual surface.
Date: 2026-05-15

## Outcomes & Retrospective

This slice moved Worker findings, finding detail, runs, loops, privacy, and the Starter tutorial video index to the shared protected route-surface recipe. It also aligned route-local empty states, data tables, workflow approval panels, privacy panels, loop catalog panels, and the shared operator summary card with protected panel styling.

Behavior stayed unchanged: AppShell still runs in `viewportMode="app"`, local navigation models are preserved, findings filters and links still work, copy buttons still write the same values, workflow approval still calls `requestWorkspaceWorkflowRun`, privacy actions still call the same revoke/delete mutations, loops still link to finding detail pages, and tutorial rows still point at `/starter/lessons/*`.

Browser proof used a temporary local route at `/codex-remaining-protected-surfaces-proof` to render each swept surface with fixture data because direct protected routes require an authenticated browser session. The temporary route was deleted before final validation. Desktop checks covered findings, runs, finding detail, loops, privacy, and tutorials; mobile proof covered findings. Screenshots were captured under ignored `codex-scripts/artifacts/t3-protected-surfaces/`. The only browser noise observed was the existing local Clerk development-key warning, font preload warnings, and protected tutorial thumbnail 403s in the unauthenticated proof harness.

## Context and Orientation

The active Program is `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`, and the current brief is `docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-7.md`. The prior protected route-surface slice is `docs/exec-plans/completed/2026-05-15-t3-code-protected-route-surfaces.md`.

The shared route-surface helpers live in `apps/web/src/components/app/protected-route-surface.tsx`. They provide `ProtectedRoutePage`, `ProtectedRouteHeader`, `ProtectedRouteEyebrow`, `ProtectedRouteTitle`, `ProtectedRouteDescription`, `ProtectedRoutePanel`, `ProtectedRoutePanelHeader`, `ProtectedRoutePanelTitle`, `ProtectedRoutePanelDescription`, `ProtectedRoutePanelBody`, `ProtectedRouteSummaryGrid`, and `protectedRoutePanelClassName`.

The route surfaces for this pass are:

    apps/web/src/app/(app)/_components/existing-codebase-findings/workspace-findings-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-findings/workspace-finding-detail-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-runs-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-loops-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-privacy-page.tsx
    apps/web/src/app/(app)/tutorials/_components/tutorial-videos-page.tsx

The focused tests for these pages are:

    apps/web/tests/integration-ui/workspace-findings-page.test.tsx
    apps/web/tests/integration-ui/workspace-finding-detail-page.test.tsx
    apps/web/tests/integration-ui/workspace-runs-page.test.tsx
    apps/web/tests/integration-ui/workspace-loops-page.test.tsx
    apps/web/tests/integration-ui/workspace-privacy-page.test.tsx
    apps/web/tests/unit/app-workspace-tutorial-routes.test.tsx

### In Scope

This plan may update the route surfaces above, their focused tests, route-local visual panel wrappers used by those surfaces, this ExecPlan, and the active Program ledger. It may create a temporary local proof route for browser verification if the protected routes redirect to sign-in in the available browser context, but any temporary route must be deleted before final validation.

### Out Of Scope

This plan does not change admin impersonation policy, support-mode behavior, Convex schema/functions, Clerk auth, Stripe billing, provider setup, generated-codebase compiler output, templates, public marketing/docs/blog routes, auth/checkout pages, Telegram widget CSS, route URLs, protected access checks, or AppShell props. It does not migrate Worker doctor-pass setup internals, paid home, generated codebase flow, or admin impersonation.

## Plan of Work

First, validate this ExecPlan with `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-remaining-protected-surfaces.md`.

Second, migrate `apps/web/src/app/(app)/_components/existing-codebase-findings/workspace-findings-page.tsx` and `apps/web/src/app/(app)/_components/existing-codebase-findings/workspace-finding-detail-page.tsx`. Replace the old route wrappers and serif headers with `ProtectedRoutePage`, `ProtectedRouteHeader`, `ProtectedRouteTitle`, and `ProtectedRouteDescription`. Keep `AppShell viewportMode="app"`, local nav, filter state, empty state, ledger, summary row values, copy behavior, finding detail links, workflow approval mutations, and proof command behavior intact.

Third, migrate `apps/web/src/app/(app)/_components/existing-codebase-support/workspace-runs-page.tsx`, `workspace-loops-page.tsx`, and `workspace-privacy-page.tsx` the same way. Preserve run-history model construction, local nav, doctor-pass run rows, workflow rows, loops catalog links, privacy summary rows, hosted-state actions, empty states, and copy behavior.

Fourth, migrate `apps/web/src/app/(app)/tutorials/_components/tutorial-videos-page.tsx`. Replace the old document wrapper and serif header with the shared protected route page/header recipe. Render the block jump links as a protected panel or compact panel grid, and keep all tutorial lesson hrefs, block IDs, section labels, and `TutorialVideoRow` rendering unchanged.

Fifth, update focused tests. The findings, finding detail, runs, loops, and privacy tests should assert the new protected route slots and absence of `font-heading-serif` while continuing to prove filters, links, local nav, copy buttons, workflow approval behavior, privacy mutation calls, and policy-sensitive absence checks. The tutorial route unit test should assert the protected route slots, preserved lesson href, and absence of `font-heading-serif` without adding Convex calls.

Sixth, run desktop and mobile browser proof. If direct protected routes redirect to sign-in in the available browser context, use a temporary local proof route that renders `AppShell viewportMode="app"` and representative Worker findings/runs plus tutorial content through the same shared route helpers. Record that limitation in this plan and delete the temporary route before final validation.

Seventh, complete this ExecPlan, move it to `docs/exec-plans/completed/2026-05-15-t3-code-remaining-protected-surfaces.md`, update the Program ledger and next-slice note, and run final validation.

## Milestones

Milestone 1 creates and validates the plan. Success means this file exists under `docs/exec-plans/active`, points at planning brief 7, names the bounded route surfaces, and passes `plans:lint`.

Milestone 2 migrates Worker findings, finding detail, runs, loops, and privacy. Success means those pages render through protected route page/header/panel or summary slots while existing filters, links, local nav, copy actions, workflow approval behavior, privacy actions, and empty states still pass their focused tests.

Milestone 3 migrates the tutorial index. Success means the tutorial video index uses the shared protected route recipe while keeping video counts, block anchors, lesson rows, and route hrefs stable.

Milestone 4 validates and records completion. Success means focused tests, browser proof, app lint/typecheck, Program/plan/markdown lint, repo lint/typecheck, scope checks, and `git diff --check` pass or exact blockers are recorded.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this active plan:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-remaining-protected-surfaces.md

Edit:

    apps/web/src/app/(app)/_components/existing-codebase-findings/workspace-findings-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-findings/workspace-finding-detail-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-findings/workspace-findings-empty-state.tsx
    apps/web/src/app/(app)/_components/existing-codebase-findings/workspace-findings-ledger.tsx
    apps/web/src/app/(app)/_components/existing-codebase-findings/workspace-source-truth-approval-sheet.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-runs-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-runs-sections.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-workflow-runs-section.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-loops-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-loops-catalog.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-privacy-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-privacy-panels.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-privacy-action-panel.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-support-shared.tsx
    apps/web/src/app/(app)/_components/workspace-operator-summary-card.tsx
    apps/web/src/app/(app)/tutorials/_components/tutorial-videos-page.tsx
    apps/web/tests/integration-ui/workspace-findings-page.test.tsx
    apps/web/tests/integration-ui/workspace-finding-detail-page.test.tsx
    apps/web/tests/integration-ui/workspace-runs-page.test.tsx
    apps/web/tests/integration-ui/workspace-loops-page.test.tsx
    apps/web/tests/integration-ui/workspace-privacy-page.test.tsx
    apps/web/tests/unit/app-workspace-tutorial-routes.test.tsx
    docs/exec-plans/completed/2026-05-15-t3-code-remaining-protected-surfaces.md
    docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md

Run focused validation:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-findings-page.test.tsx tests/integration-ui/workspace-runs-page.test.tsx tests/integration-ui/workspace-loops-page.test.tsx tests/integration-ui/workspace-privacy-page.test.tsx tests/integration-ui/workspace-finding-detail-page.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-tutorial-routes.test.tsx

Run static and docs validation:

    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-remaining-protected-surfaces.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-remaining-protected-surfaces.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

## Validation and Acceptance

Acceptance requires the touched Worker findings, finding detail, Worker runs, loops, privacy, and tutorial index route surfaces to keep current behavior and AppShell integration while adopting the dense T3 Code protected route-surface recipe. The diff must not add Base UI, must not change generated customer repo output, must not alter protected access or support/admin policy, and must not widen into public/auth/checkout/provider work.

### Test Commands

Passed commands:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-findings-page.test.tsx tests/integration-ui/workspace-runs-page.test.tsx tests/integration-ui/workspace-loops-page.test.tsx tests/integration-ui/workspace-privacy-page.test.tsx tests/integration-ui/workspace-finding-detail-page.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-tutorial-routes.test.tsx
    bun run format
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-remaining-protected-surfaces.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-remaining-protected-surfaces.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

## Idempotence and Recovery

The changes are local React and CSS changes. If a focused test fails because a behavior label or href changed, restore the original visible contract unless this plan is updated with a deliberate decision. If browser proof cannot access authenticated routes, use a temporary proof route, document the auth limitation, and delete that route before final validation. If route protection or Convex behavior changes, revert that part and keep only visual composition changes.

## Artifacts and Notes

Important source references:

    apps/web/src/components/app/protected-route-surface.tsx
    apps/web/src/app/(app)/_components/existing-codebase-findings/workspace-findings-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-findings/workspace-finding-detail-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-runs-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-loops-page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-support/workspace-privacy-page.tsx
    apps/web/src/app/(app)/tutorials/_components/tutorial-videos-page.tsx
    apps/web/tests/integration-ui/workspace-findings-page.test.tsx
    apps/web/tests/integration-ui/workspace-finding-detail-page.test.tsx
    apps/web/tests/integration-ui/workspace-runs-page.test.tsx
    apps/web/tests/integration-ui/workspace-loops-page.test.tsx
    apps/web/tests/integration-ui/workspace-privacy-page.test.tsx
    apps/web/tests/unit/app-workspace-tutorial-routes.test.tsx

No external provider setup or generated customer repository change should be needed.

## Interfaces and Dependencies

This slice depends on Next.js App Router protected route groups, the current `AppShell viewportMode="app"` Sidebar implementation, React Client Components for Worker findings/runs interactivity, the shared protected route-surface helpers, the shared Button/Badge/Item primitives, the current Worker findings and support read models, and the current tutorial video library. It must not change those data models, access helpers, AppShell prop contracts, or add a UI runtime dependency.
