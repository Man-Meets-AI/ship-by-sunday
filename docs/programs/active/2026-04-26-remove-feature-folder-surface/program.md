---
program_id: 'remove-feature-folder-surface'
title: 'Remove Feature Folder Surface'
status: 'active'
created_at: 2026-04-26
completed_at: null
summary: 'Reduce the remaining apps/web/features tree by moving non-domain code to explicit route, platform, hook, or library homes.'
post_build_recap: null
read_when:
  - 'Choosing the next feature-folder reduction slice.'
  - 'Checking why a feature folder should move out of apps/web/features.'
  - 'Validating that billing, Convex, and route behavior stay isolated.'
---

# Remove Feature Folder Surface

This is a living initiative document for reducing the remaining `apps/web/features` surface.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The app should be easier to navigate than a broad `features` bucket. This Program moves code out of `apps/web/features` when another owner is clearer: App Router private folders for route-local UI and metadata, `apps/web/hooks` for generic hooks, `apps/web/lib` for neutral helpers, and dedicated server or platform homes for runtime adapters. The end state is a smaller feature tree that contains only durable product domains until those domains are split by dedicated plans.

## Program Inputs

The Program packet lives under `docs/programs/active/2026-04-26-remove-feature-folder-surface/`.

The research input is `research-pass-feature-folder-surface.md`. The normalized input is `normalized-pass-feature-folder-surface.md`. The convergence artifact is `converged-decision-packet.md`. The dependency artifact is `dependency-graph.md`. The split recommendation is `plan-split-recommendation.md`. The review artifact is `cross-repo-review.md`. The planning briefs are `planning-brief-1.md`, `planning-brief-2.md`, `planning-brief-3.md`, `planning-brief-4.md`, `planning-brief-5.md`, `planning-brief-6.md`, `planning-brief-7.md`, `planning-brief-8.md`, `planning-brief-9.md`, `planning-brief-10.md`, and `planning-brief-11.md`, with `current-planning-brief.txt` pointing at the current one.

## Current State

The previous app-structure Program is complete and archived. It made ownership visible but intentionally left most `apps/web/features` folders in place. After the first eleven child slices, seven top-level feature folders remain: `auth`, `blueprint-flow`, `codex`, `course`, `execute-ship`, `marketing`, and `workspace-shell`.

The first child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-remove-generic-feature-surfaces.md`. The second child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-remove-settings-feature-surface.md`. The third child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-remove-workspace-home-feature-surface.md`. The fourth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-remove-starter-feature-surface.md`. The fifth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-remove-starter-repo-feature-surface.md`. The sixth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-27-remove-workspace-navigation-feature-surface.md`. The seventh child ExecPlan is complete at `docs/exec-plans/completed/2026-04-27-remove-product-access-feature-surface.md`. The eighth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-27-remove-docs-feature-surface.md`. The ninth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-27-remove-checkout-feature-surface.md`. The tenth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-27-remove-observability-feature-surface.md`. The eleventh child ExecPlan is complete at `docs/exec-plans/completed/2026-04-27-remove-blog-feature-surface.md`. No child ExecPlan is currently active.

## Progress

- [x] 2026-04-26 EDT: Created branch `codex/remove-feature-folder-surface` from `origin/main`.
- [x] 2026-04-26 EDT: Recorded the remaining top-level `apps/web/features` inventory and identified the first deletion slice.
- [x] 2026-04-26 EDT: Created the active Program packet and first child ExecPlan.
- [x] 2026-04-26 EDT: Moved the generic autosave hook and public metadata sitemap helper out of `apps/web/features`, then deleted `features/shared` and `features/public-metadata`.
- [x] 2026-04-26 EDT: Completed and archived the generic and public metadata feature-folder removal ExecPlan after focused tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` passed.
- [x] 2026-04-26 EDT: Wrote planning brief 2 and opened the second child ExecPlan for removing the settings feature folder.
- [x] 2026-04-26 EDT: Executed and completed the settings feature-folder removal slice. Focused settings/workspace-home tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, import scans, and `git diff --check` passed.
- [x] 2026-04-26 EDT: Wrote planning brief 3 for the next workspace-home feature-folder removal slice.
- [x] 2026-04-26 EDT: Created branch `codex/remove-workspace-home-feature-surface` and opened the third child ExecPlan for removing the workspace-home feature folder.
- [x] 2026-04-26 EDT: Executed and completed the workspace-home feature-folder removal slice. Focused workspace-home tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, import scans, and `git diff --check` passed.
- [x] 2026-04-26 EDT: Wrote planning brief 4 for the next starter feature-folder removal slice.
- [x] 2026-04-26 EDT: Created branch `codex/remove-starter-feature-surface` and opened the fourth child ExecPlan for removing the starter feature folder.
- [x] 2026-04-26 EDT: Executed and completed the starter feature-folder removal slice. Focused starter/docs-disabled tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, import scans, and `git diff --check` passed.
- [x] 2026-04-26 EDT: Wrote planning brief 5 for the next starter-repo feature-folder removal slice.
- [x] 2026-04-26 EDT: Created branch `codex/remove-starter-repo-feature-surface` and opened the fifth child ExecPlan for removing the starter-repo feature folder.
- [x] 2026-04-26 EDT: Executed and completed the starter-repo feature-folder removal slice. Focused starter-repo tests, settings/workspace-home consumer tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, import scans, and `git diff --check` passed.
- [x] 2026-04-27 EDT: Wrote planning brief 6 and opened the sixth child ExecPlan for removing the workspace-navigation feature folder.
- [x] 2026-04-27 EDT: Executed and completed the workspace-navigation feature-folder removal slice. Focused navigation unit, contract, and integration-ui tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, import scans, and `git diff --check` passed.
- [x] 2026-04-27 EDT: Wrote planning brief 7 and opened the seventh child ExecPlan for removing the product-access feature folder.
- [x] 2026-04-27 EDT: Executed and completed the product-access feature-folder removal slice. Focused access unit and integration-ui tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, import scans, and `git diff --check` passed.
- [x] 2026-04-27 EDT: Wrote planning brief 8 and opened the eighth child ExecPlan for removing the docs feature folder.
- [x] 2026-04-27 EDT: Executed and completed the docs feature-folder removal slice. Focused docs tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, import scans, and `git diff --check` passed.
- [x] 2026-04-27 EDT: Wrote planning brief 9 and opened the ninth child ExecPlan for removing the checkout feature folder.
- [x] 2026-04-27 EDT: Executed and completed the checkout feature-folder removal slice. Focused checkout unit, route integration, and integration-ui tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, import scans, and `git diff --check` passed.
- [x] 2026-04-27 EDT: Wrote planning brief 10 and opened the tenth child ExecPlan for removing the observability feature folder.
- [x] 2026-04-27 EDT: Executed and completed the observability feature-folder removal slice. Focused observability unit, integration, and integration-ui tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, import scans, and `git diff --check` passed.
- [x] 2026-04-27 EDT: Wrote planning brief 11 and opened the eleventh child ExecPlan for removing the blog feature folder.
- [x] 2026-04-27 EDT: Executed and completed the blog feature-folder removal slice. Focused blog/public-metadata tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, import scans, and `git diff --check` passed.

## Decision Log

Decision: Start by deleting `features/shared` and `features/public-metadata`.
Rationale: They are not durable product domains, have clear replacement homes, and can be removed with focused tests.
Date: 2026-04-26

Decision: Do not collapse all remaining feature folders in one PR.
Rationale: The remaining surface crosses route behavior, Convex-safe backend imports, checkout, billing, observability, and course state. One broad PR would hide real risk and make validation weak.
Date: 2026-04-26

## Slice Ledger

Active child ExecPlans:

- None.

Recommended future child ExecPlans:

- Treat `codex`, `auth`, `workspace-shell`, `execute-ship`, `blueprint-flow`, `marketing`, and `course` as larger domain slices that need fresh planning before any folder deletion.

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-04-26-remove-generic-feature-surfaces.md`
- `docs/exec-plans/completed/2026-04-26-remove-settings-feature-surface.md`
- `docs/exec-plans/completed/2026-04-26-remove-workspace-home-feature-surface.md`
- `docs/exec-plans/completed/2026-04-26-remove-starter-feature-surface.md`
- `docs/exec-plans/completed/2026-04-26-remove-starter-repo-feature-surface.md`
- `docs/exec-plans/completed/2026-04-27-remove-workspace-navigation-feature-surface.md`
- `docs/exec-plans/completed/2026-04-27-remove-product-access-feature-surface.md`
- `docs/exec-plans/completed/2026-04-27-remove-docs-feature-surface.md`
- `docs/exec-plans/completed/2026-04-27-remove-checkout-feature-surface.md`
- `docs/exec-plans/completed/2026-04-27-remove-observability-feature-surface.md`
- `docs/exec-plans/completed/2026-04-27-remove-blog-feature-surface.md`

## Next Slice

The next recommended slice is `codex`. It is smaller than the remaining product-domain folders but crosses route UI, hooks, server route helpers, and Codex app-server contracts, so it needs a dedicated child plan. The plan must preserve Codex connection card behavior, account API routes, generate route helpers, app-server contracts, auth/session behavior, rate-limit rendering, and any production release proof semantics.

## Risks and Watchpoints

Do not treat the word `features` as the only smell. Some remaining folders are durable domains and need replacement homes before deletion.

Do not move billing, checkout, Stripe, pricing, promo code, webhook, Convex schema, generated Convex files, or environment behavior as part of generic structure cleanup.

Do not move route screens without a child ExecPlan that names the route and focused proof.

## Outcomes & Retrospective

This Program is active. The first eleven child slices deleted `features/shared`, `features/public-metadata`, `features/settings`, `features/workspace-home`, `features/starter`, `features/starter-repo`, `features/workspace-navigation`, `features/product-access`, `features/docs`, `features/checkout`, `features/observability`, and `features/blog`. Later outcomes should reduce route-local and generic feature surfaces while keeping behavior stable.

## Validation and Acceptance

The Program is complete only when no non-domain code remains under `apps/web/features`, remaining feature folders are either durable product domains or have active follow-up plans, docs describe the final ownership map, and every child slice has focused validation plus app lint and typecheck.

For the first slice, acceptance requires import scans proving no references to `@/features/shared`, `features/shared`, `@/features/public-metadata`, or `features/public-metadata` remain.

## Artifacts and Notes

Initial top-level feature-folder file counts are recorded in `research-pass-feature-folder-surface.md`.

The first planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-1.md`.

The second planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-2.md`.

The third planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-3.md`.

The fourth planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-4.md`.

The fifth planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-5.md`.

The sixth planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-6.md`.

The seventh planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-7.md`.

The eighth planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-8.md`.

The ninth planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-9.md`.

The tenth planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-10.md`.

The eleventh planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-11.md`.

## Interfaces and Dependencies

This Program depends on the Next.js App Router folder convention under `apps/web/app`, the shared hook surface under `apps/web/hooks`, the neutral helper surface under `apps/web/lib`, and the Program and ExecPlan contracts under `docs/programs/PROGRAMS.md` and `docs/exec-plans/PLANS.md`.
