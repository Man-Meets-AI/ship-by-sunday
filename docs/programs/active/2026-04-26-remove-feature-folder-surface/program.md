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

The research input is `research-pass-feature-folder-surface.md`. The normalized input is `normalized-pass-feature-folder-surface.md`. The convergence artifact is `converged-decision-packet.md`. The dependency artifact is `dependency-graph.md`. The split recommendation is `plan-split-recommendation.md`. The review artifact is `cross-repo-review.md`. The current planning brief is `planning-brief-1.md`, with `current-planning-brief.txt` pointing at it.

## Current State

The previous app-structure Program is complete and archived. It made ownership visible but intentionally left most `apps/web/features` folders in place. A fresh inventory shows nineteen top-level feature folders remain. The smallest non-domain folders are `features/shared`, which contains one generic hook, and `features/public-metadata`, which contains one sitemap helper used only by App Router metadata.

The first child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-remove-generic-feature-surfaces.md`.

## Progress

- [x] 2026-04-26 EDT: Created branch `codex/remove-feature-folder-surface` from `origin/main`.
- [x] 2026-04-26 EDT: Recorded the remaining top-level `apps/web/features` inventory and identified the first deletion slice.
- [x] 2026-04-26 EDT: Created the active Program packet and first child ExecPlan.
- [x] 2026-04-26 EDT: Moved the generic autosave hook and public metadata sitemap helper out of `apps/web/features`, then deleted `features/shared` and `features/public-metadata`.
- [x] 2026-04-26 EDT: Completed and archived the generic and public metadata feature-folder removal ExecPlan after focused tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` passed.

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

- Move settings route components into `apps/web/app/(workspace)/settings/_components`.
- Move workspace home route components and model into `apps/web/app/(workspace)` private folders.
- Split starter and starter-repo surfaces into route, docs, Convex-safe validation, and course workbench owners.

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-04-26-remove-generic-feature-surfaces.md`

## Next Slice

No child ExecPlan is active right now. The next recommended slice is moving settings route components from `apps/web/features/settings` into private folders under `apps/web/app/(workspace)/settings`, while preserving route behavior and keeping starter repository access imports stable.

## Risks and Watchpoints

Do not treat the word `features` as the only smell. Some remaining folders are durable domains and need replacement homes before deletion.

Do not move billing, checkout, Stripe, pricing, promo code, webhook, Convex schema, generated Convex files, or environment behavior as part of generic structure cleanup.

Do not move route screens without a child ExecPlan that names the route and focused proof.

## Outcomes & Retrospective

This Program is active. The first expected outcome is deletion of `features/shared` and `features/public-metadata`. Later outcomes should reduce route-local and generic feature surfaces while keeping behavior stable.

## Validation and Acceptance

The Program is complete only when no non-domain code remains under `apps/web/features`, remaining feature folders are either durable product domains or have active follow-up plans, docs describe the final ownership map, and every child slice has focused validation plus app lint and typecheck.

For the first slice, acceptance requires import scans proving no references to `@/features/shared`, `features/shared`, `@/features/public-metadata`, or `features/public-metadata` remain.

## Artifacts and Notes

Initial top-level feature-folder file counts are recorded in `research-pass-feature-folder-surface.md`.

The first planning brief is `docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-1.md`.

## Interfaces and Dependencies

This Program depends on the Next.js App Router folder convention under `apps/web/app`, the shared hook surface under `apps/web/hooks`, the neutral helper surface under `apps/web/lib`, and the Program and ExecPlan contracts under `docs/programs/PROGRAMS.md` and `docs/exec-plans/PLANS.md`.
