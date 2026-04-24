---
title: Reconcile Product Route Contract
status: active
created_at: 2026-04-23
completed_at: null
summary: Make app routes, docs, QA, redirects, navigation, and post-review language agree on the current Ship by Sunday product route model.
post_build_recap: null
read_when:
  - Resuming product route contract work.
  - Changing protected workspace routes, route docs, QA journeys, or post-review navigation.
  - Validating the third Ship by Sunday recovery slice.
---

# Reconcile Product Route Contract

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the product route contract.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The product should have one route story. Today the live app, docs, QA files, compatibility routes, and legacy course copy do not all describe the same workflow. That makes tests and implementation choices unreliable. After this plan, a maintainer should be able to read the route map, inspect the App Router tree, run QA validation, and see the same canonical protected flow.

This plan is the third child slice of the Program packet at `docs/programs/active/2026-04-23-sbs-codebase-recovery/`, written from `planning-brief-1.md`.

## Progress

- [x] 2026-04-23 EDT: Identified route-contract drift from the review.
- [ ] Write the canonical route decision into this plan after inspecting the current App Router tree.
- [ ] Update route docs, QA journeys, coverage, and inventory to match the chosen contract.
- [ ] Update navigation and redirect helpers to stop advertising non-canonical stages.
- [ ] Decide and implement the truthful `/execute` behavior.
- [ ] Run QA validation, route-focused tests, and repo closeout checks.

## Surprises & Discoveries

Earlier completed plans already collapsed the old staged blueprint funnel, but the current tree and docs still contain enough legacy wording to make the contract unclear again. The issue is not simply whether old compatibility routes exist. The issue is whether current docs, QA, and navigation treat them as canonical.

## Decision Log

Decision: Treat route-contract reconciliation as product truth work, not UI refactor work.
Rationale: The immediate need is to make routes, docs, QA, and navigation agree. UI restructuring belongs in later blueprint and workbench plans.
Date: 2026-04-23

Decision: Keep compatibility redirects only if they are documented as compatibility.
Rationale: Old URLs can remain useful without being taught as the current product.
Date: 2026-04-23

## Outcomes & Retrospective

This plan is active. Fill this section after implementation with the final route contract, the files updated, the QA proof, and any intentionally deferred route or copy follow-up.

## Context and Orientation

The protected workspace route tree lives under `apps/web/app/(workspace)/`. The current likely canonical surfaces are `/blueprint`, `/review`, `/execute`, `/mission`, `/lesson`, `/artifacts`, and `/settings`. Older wording still references `/start`, `/product`, `/design`, `/marketing`, and `/build-plan`. The route docs live in `apps/web/content/docs/route-map.mdx`. QA route truth lives in `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, and `qa/README.md`. Navigation and post-review routing live under `apps/web/features/workspace-navigation/` and course app-shell components.

### In Scope

In scope is deciding and documenting the canonical protected route flow, updating route docs, updating QA journeys and coverage rows, adjusting navigation and redirect helpers, making `/execute` truthful, and removing or relabeling legacy course-stage language where it conflicts with blueprint-first product behavior.

### Out Of Scope

Out of scope is splitting `use-blueprint-page-state.ts`, changing download generation internals, redesigning the UI, changing checkout, or changing public marketing pages except where they link to protected routes.

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
       rg -n 'start|product|design|marketing|build-plan|blueprint|review|execute' apps/web qa docs packages

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
