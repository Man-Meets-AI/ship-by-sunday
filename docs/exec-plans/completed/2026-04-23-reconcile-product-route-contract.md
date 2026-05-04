---
title: Reconcile Product Route Contract
status: complete
created_at: 2026-04-23
completed_at: 2026-04-24
summary: Make app routes, docs, QA, redirects, navigation, and post-review language agree on the current Ship by Sunday product route model.
post_build_recap: The app, docs, QA control plane, and protected-route matcher now agree that Codebase and Review are canonical while old staged and Execute/Mission URLs are protected compatibility entrypoints.
read_when:
  - Resuming product route contract work.
  - Changing protected workspace routes, route docs, QA journeys, or post-review navigation.
  - Validating the next active Ship by Sunday recovery slice after CI/CD correction and runtime Program graduation.
program_id: sbs-codebase-recovery
planning_brief: docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md
---

# Reconcile Product Route Contract

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the product route contract.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The product should have one route story. Today the live app, docs, QA files, compatibility routes, and legacy course copy do not all describe the same workflow. That makes tests and implementation choices unreliable. After this plan, a maintainer should be able to read the route map, inspect the App Router tree, run QA validation, and see the same canonical protected flow.

This plan is the next active child slice of the Program packet at `docs/programs/active/2026-04-23-sbs-codebase-recovery/`, written from `planning-brief-1.md`. CI/CD harness retirement is complete, release/intake repair is deferred to a dedicated Program, and runtime footgun removal has graduated to a dedicated runtime-boundary Program.

## Progress

- [x] 2026-04-23 EDT: Identified route-contract drift from the review.
- [x] 2026-04-24 EDT: Selected as the next recovery slice after CI/CD completion, release/intake deferral, and runtime-boundary graduation to a dedicated Program.
- [x] 2026-04-24 EDT: Inspected the current App Router tree and wrote the canonical route decision into this plan.
- [x] 2026-04-24 EDT: Updated `apps/web/content/docs/route-map.mdx`, `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, and `qa/README.md` to match the chosen route contract.
- [x] 2026-04-24 EDT: Added missing protected compatibility redirect routes for `/start`, `/product`, `/design`, `/marketing`, and `/build-plan`.
- [x] 2026-04-24 EDT: Added `apps/web/features/codebase-flow/lib/legacy-codebase-route-redirects.ts` and confirmed primary navigation already points at canonical Codebase, Review, Lesson, and Settings surfaces.
- [x] 2026-04-24 EDT: Confirmed `/execute` is already a compatibility redirect: locked viewers return to `/review`, and unlocked viewers redirect to the Build Lessons destination.
- [x] 2026-04-24 EDT: Made the promised `/codebase#generated-preview` anchor real by adding `generated-preview` to the combined Codebase page section list and section media.
- [x] 2026-04-24 EDT: While running required closeout, repaired the existing dirty-worktree bonus lesson tracker boundary by moving the client-safe tracking constants to `bonus-lesson-view-contract.ts` and making non-terminal responses reset to idle.
- [x] 2026-04-24 EDT: Validation passed: `bun run --cwd apps/web test:unit -- tests/unit/proxy-protected-routes.test.ts tests/unit/legacy-codebase-route-redirects.test.ts tests/unit/app-workspace-execute-page.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/post-review-destination.test.ts` passed with 5 files and 11 tests; `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx` passed with 1 file and 4 tests; `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/bonus-lesson-view-tracker.test.tsx` passed with 1 file and 3 tests; `bun run qa:validate` passed with 25 journeys, 65 coverage rows, 165 inventory rows, and 3 personas; `bun run format` passed; `bun run lint` passed with 0 warnings and 0 errors; `bun run typecheck` passed and the Next route table included `/start`, `/product`, `/product/[stepId]`, `/design`, `/design/[stepId]`, `/marketing`, `/marketing/[stepId]`, `/build-plan`, and `/build-plan/[stepId]`; `bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md` passed; `bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md apps/web/content/docs/route-map.mdx qa/README.md` passed; `git diff --check` passed.
- [x] 2026-04-24 EDT: Moved this plan to `docs/exec-plans/completed/2026-04-23-reconcile-product-route-contract.md`; `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-reconcile-product-route-contract.md` passed, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-23-reconcile-product-route-contract.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md apps/web/content/docs/route-map.mdx qa/README.md` passed, `bun run programs:lint` passed, and `git diff --check` passed.

## Surprises & Discoveries

Earlier completed plans already collapsed the old staged codebase funnel, but the current tree and docs still contain enough legacy wording to make the contract unclear again. The issue is not simply whether old compatibility routes exist. The issue is whether current docs, QA, and navigation treat them as canonical.

Current inspection found `apps/web/app/(workspace)/` only contains route files for `/codebase`, `/review`, `/execute`, `/mission`, `/lesson/[lessonKey]`, `/artifacts`, and `/settings`. The docs already described `/start`, `/product`, `/design`, `/marketing`, and `/build-plan` as compatibility redirects, but there were no route files for those URLs and `apps/web/proxy.ts` did not protect them. Current `/execute` code is not a bridge page; it redirects to `/review` before post-review unlock and to the Build Lessons destination after unlock. Current `/mission` is a compatibility entry that shows locked guidance before unlock and redirects into the Review Lesson Map after unlock.

The compiler stage definition already included a `generated-preview` Codebase step, and existing content linked to `/codebase#generated-preview`, but `apps/web/features/codebase-flow/lib/codebase-page-sections.ts` omitted that section from the combined page. The compatibility marketing route would have pointed at a missing anchor without adding the section.

The dirty worktree already contained an untracked `/api/course/bonus-lesson-viewed` route and bonus lesson view tracker work. Required `bun run typecheck` initially failed because the client tracker and server handler shared the old `bonus-lesson-view-tracking` module boundary, pulling Clerk server auth into the client graph. Splitting the client-safe endpoint/error-code contract into `apps/web/features/execute-ship/lib/bonus-lesson-view-contract.ts` and resetting non-terminal tracker responses to `idle` made the build pass without changing the route-contract decision.

## Decision Log

Decision: Treat route-contract reconciliation as product truth work, not UI refactor work.
Rationale: The immediate need is to make routes, docs, QA, and navigation agree. UI restructuring belongs in later codebase and workbench plans.
Date: 2026-04-23

Decision: Keep compatibility redirects only if they are documented as compatibility.
Rationale: Old URLs can remain useful without being taught as the current product.
Date: 2026-04-23

Decision: Execute route-contract reconciliation next inside this Program.
Rationale: CI/CD truth is already codified, release/intake repair is deferred to a dedicated Program, and runtime-boundary implementation has moved to its own dedicated Program. Product route truth is now the next independent correctness lane and should land before codebase and workbench structural refactors.
Date: 2026-04-24

Decision: Freeze the canonical protected route model as `/codebase`, `/review`, `/lesson/[lessonKey]`, and `/settings`, with `/execute`, `/mission`, `/artifacts`, `/start`, `/product`, `/design`, `/marketing`, and `/build-plan` documented and implemented only as protected compatibility entrypoints.
Rationale: `/codebase` is the canonical intake workspace, `/review` owns the review/download handoff and the post-review Lesson Map surface, `/lesson/[lessonKey]` owns unlocked post-review lesson content, and `/settings` owns account support. Existing code already treats `/execute`, `/mission`, and `/artifacts` as compatibility paths. Legacy codebase URLs should remain usable but must redirect into canonical Codebase anchors instead of becoming current product surfaces.
Date: 2026-04-24

Decision: Keep `/execute` as a compatibility redirect instead of rebuilding the old two-CTA bridge page.
Rationale: Current runtime code and the post-review destination helper already make Review the handoff point and Build Lessons the first unlocked continuation. Restoring bridge-page wording would make docs and QA stale again and would conflict with the current Review-owned Lesson Map route model.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is complete. The final contract is: `/codebase`, `/review`, `/lesson/[lessonKey]`, and `/settings` are the canonical protected product routes; `/execute`, `/mission`, `/artifacts`, `/start`, `/product`, `/design`, `/marketing`, and `/build-plan` are protected compatibility routes only. `/execute` redirects locked members to `/review` and unlocked members to the Build Lessons destination. `/mission` shows locked Review guidance before unlock and redirects unlocked members to `/review?showLessonMap=1`. Old staged Codebase URLs now have real App Router files and redirect into the combined Codebase page anchors.

The implementation updated route files, route docs, QA journeys, QA coverage, test inventory, the proxy protected-route matcher, the combined Codebase generated-preview anchor, and focused route tests. Required closeout checks passed. The only extra repair was the bonus lesson tracker server/client boundary fix needed to make the existing dirty worktree build pass.

## Context and Orientation

The protected workspace route tree lives under `apps/web/app/(workspace)/`. The current likely canonical surfaces are `/codebase`, `/review`, `/execute`, `/mission`, `/lesson`, `/artifacts`, and `/settings`. Older wording still references `/start`, `/product`, `/design`, `/marketing`, and `/build-plan`. The route docs live in `apps/web/content/docs/route-map.mdx`. QA route truth lives in `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, and `qa/README.md`. Navigation and post-review routing live under `apps/web/features/workspace-navigation/` and course app-shell components.

### In Scope

In scope is deciding and documenting the canonical protected route flow, updating route docs, updating QA journeys and coverage rows, adjusting navigation and redirect helpers, making `/execute` truthful, and removing or relabeling legacy course-stage language where it conflicts with codebase-first product behavior.

### Out Of Scope

Out of scope is splitting `use-codebase-page-state.ts`, changing download generation internals, redesigning the UI, changing checkout, or changing public marketing pages except where they link to protected routes.

## Plan of Work

Start by mapping the actual App Router tree under `apps/web/app/(workspace)/` and every route constant under `apps/web/config/product.ts`, `apps/web/proxy.ts`, and navigation helpers. Write the chosen canonical route model into the `Decision Log` before editing broad docs.

Then update `apps/web/content/docs/route-map.mdx` to separate canonical protected routes from compatibility redirects. Any old stage routes should be described only as redirects or legacy paths if they still exist.

Next update QA evidence. Adjust `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, and `qa/README.md` so they validate the canonical route model. Run `bun run qa:validate` after every CSV update.

Then update navigation and post-review behavior. Make primary workspace links, review blockers, checkout success redirects, and post-review destination helpers point at canonical routes. Decide whether `/execute` is a real bridge or a redirect, then make code and docs agree.

Finally remove conflicting legacy language from current product UI where it would tell a user or test author that old stage labels are still the product model.

## Milestones

Milestone 1 freezes the route decision. At the end, the plan names the canonical routes, compatibility routes, and `/execute` behavior in the `Decision Log`.

Milestone 2 updates docs and QA truth. At the end, route docs and QA files describe the same route model and `bun run qa:validate` passes.

Milestone 3 updates runtime navigation and redirects. At the end, app links, post-review destinations, and redirect helpers point at the canonical surfaces.

Milestone 4 removes conflicting current-facing legacy language. At the end, active UI and docs do not present old stage names as the current product.

Milestone 5 validates the slice. At the end, route-focused tests, QA validation, plan lint, markdown lint, and repo closeout checks have passed or blockers are recorded.

## Concrete Steps

1. Map the current route tree and route references:

       cd /Users/parkerrex/Developer/ship-by-sunday
       find 'apps/web/app/(workspace)' -maxdepth 3 -type f | sort
       rg -n 'start|product|design|marketing|build-plan|codebase|review|execute' apps/web qa docs packages

2. Update this plan's `Decision Log` with the canonical route decision before code edits.

3. Update `apps/web/content/docs/route-map.mdx` and any linked route docs to reflect the canonical and compatibility split.

4. Update QA files and validate after the CSV/doc changes:

       cd /Users/parkerrex/Developer/ship-by-sunday
       bun run qa:validate

5. Update route constants, navigation, post-review destination helpers, review blocker links, and checkout success redirects so they point at canonical routes.

6. Update `/execute` implementation or docs so behavior and contract match.

7. Run focused route tests if they exist, then run:

       cd /Users/parkerrex/Developer/ship-by-sunday
       bun run qa:validate
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

## Validation and Acceptance

This slice is complete when docs, QA, route constants, navigation, redirects, and post-review copy all agree on the canonical product route model. Compatibility routes may remain, but they must not be documented or validated as the current canonical journey.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       bun run qa:validate
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

Also run route-focused unit or browser tests touched by the implementation and record their exact commands in `Progress`.

## Idempotence and Recovery

Route-doc and QA CSV edits should be small and reviewable. If `qa:validate` rewrites or rejects inventory rows, stop and inspect the exact mismatch before continuing. If changing `/execute` creates ambiguous product behavior, update the `Decision Log` and narrow the implementation rather than adding parallel behavior.

## Artifacts and Notes

Program source for this plan:

       docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md

High-signal files from the review:

       apps/web/app/(workspace)/
       apps/web/content/docs/route-map.mdx
       apps/web/features/workspace-navigation/
       qa/journeys.csv
       qa/coverage.csv
       qa/test-inventory.csv

## Interfaces and Dependencies

This plan depends on Next App Router behavior, `apps/web/proxy.ts` protected-route matching, product route constants in `apps/web/config/product.ts`, QA CSV validation, and current workspace navigation helpers.
