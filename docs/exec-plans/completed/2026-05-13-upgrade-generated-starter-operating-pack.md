---
title: Upgrade Generated Starter Operating Pack
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Make generated Starter repos ship a durable setup Program and ordered setup ExecPlans for core boot, Clerk, Convex, Stripe, and first product work.
post_build_recap: Generated Starter repos now ship a first customer Program with active Core Boot, Clerk Setup, Convex Setup, Stripe Setup, and First Product Slice ExecPlans, plus stronger generated operating-pack validation and onboarding guidance.
program_id: starter-template-source-and-billing-proof
planning_brief: docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/planning-brief-4.md
read_when:
  - Upgrading generated customer Program and ExecPlan material.
  - Changing generated repo operating-pack scripts or docs.
  - Validating the generated clean-room no-provider contract.
---

# Upgrade Generated Starter Operating Pack

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Generated Starter repos should give customers and agents a durable, resumable setup roadmap immediately after download. The current generated operating pack has a Program and one generic first product slice. This slice upgrades it into a first customer Program with ordered active ExecPlans for core boot, Clerk setup, Convex setup, Stripe setup, and first product work.

## Progress

- [x] 2026-05-13 EDT: Created this ExecPlan from planning brief 4.
- [x] 2026-05-13 EDT: Inspected current generated operating-pack renderers, onboarding, wrapper skills, and generated repo tests.
- [x] 2026-05-13 EDT: Rendered ordered setup ExecPlans, updated generated Program/planning brief/index output, and routed setup instructions through the generated plans.
- [x] 2026-05-13 EDT: Ran generated repo clean-room proof through the focused compiler test suite plus compiler typecheck, lint, and format checks.
- [x] 2026-05-13 EDT: Addressed review findings by removing non-contract app-doc and Convex `_generated` references from generated customer guidance, dropping the generated app docs onboarding page, and strengthening generated Program/ExecPlan/Codebase contract checks around the exact first roadmap.
- [x] 2026-05-13 EDT: Removed stale root-app route-group assumptions from repo-generation contracts/tests and added generated snapshot assertions for the pinned template's `apps/web/src/app` marketing, auth, and app route groups.

## Surprises & Discoveries

- The autonomous `program:run-slice` command refused to start because the checkout has unrelated dirty files. This slice was completed manually while preserving the same Program/ExecPlan loop and leaving unrelated worktree changes untouched.
- The generated operating-pack lint script needed to prove active child plan links, not just headings, so missing generated setup plans are now caught by `programs:lint`.
- Review clarified that missing setup-doc references should not be fixed by shipping more generated app docs. The correct customer surface is the copied template source plus README/START-HERE, Program, ExecPlans, and wrapper skills.
- Review also clarified that generated repo contracts should track the sibling template's `src/app` route groups instead of naming old source-app route groups.

## Decision Log

Decision: Keep provider setup as generated ExecPlans, not live provider requirements.
Rationale: The generated repo must keep passing no-provider proof while making future provider work durable and ordered.
Date: 2026-05-13

## Outcomes & Retrospective

Completed on 2026-05-13. Generated Starter repos now include a customer-safe first Program, a planning brief that starts with Core Boot, active child ExecPlans for Core Boot, Clerk Setup, Convex Setup, Stripe Setup, and First Product Slice, and generated onboarding/skills that route setup work through those plans without pointing customers at non-contract app docs. The generated clean-room no-provider command contract still passes.

Validation passed: focused compiler/template tests including the clean generated repo command contract, compiler typecheck, compiler lint, compiler format check, plan lint for this completed ExecPlan, Program lint, markdown metadata lint, and scoped diff whitespace check. Post-review route-shape hardening also passed `bun run --cwd packages/codebase-compiler test -- tests/repo-generation.test.ts tests/review-download-zip.test.ts tests/generated-repo-command-contract.test.ts tests/customer-safe-snapshot-contract.test.ts`, `bun run --cwd packages/codebase-compiler typecheck`, `bun run --cwd packages/codebase-compiler lint`, and `bun run --cwd packages/codebase-compiler format:check`.

The next recommended Program slice is `Beef Up Starter Template App`.

## Context and Orientation

The owning renderer is `packages/codebase-compiler/src/repo-generation/render-starter-operating-pack.ts`. Related generated onboarding and skills live in `render-starter-project-onboarding.ts`, `render-starter-skills.ts`, and generated repo tests under `packages/codebase-compiler/tests/`.

### In Scope

Render a first customer Program, multiple active setup ExecPlans, indexes, generated validation scripts, tests, and Program ledger updates.

### Out Of Scope

Do not implement the ChatGPT app. Do not add live provider requirements to the clean-room proof. Do not fetch or mutate the sibling template. Do not broaden template source materialization.

## Plan of Work

First, update the operating-pack path model to render a setup roadmap rather than one first-slice plan. Then update Program, planning brief, indexes, lint scripts, onboarding expectations, and compiler tests. Finally, run the clean-room generated repo proof and focused package checks.

## Milestones

The first milestone is source inspection. It is complete when the current renderer and tests are understood.

The second milestone is generated output. It is complete when the generated repo includes setup ExecPlans for core boot, Clerk, Convex, Stripe, and first product work.

The third milestone is proof. It is complete when generated operating-pack tests and clean-room no-provider proof pass.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd packages/codebase-compiler test -- tests/repo-generation.test.ts tests/generated-repo-command-contract.test.ts
    bun run --cwd packages/codebase-compiler typecheck

Broaden as needed for touched docs and generated output.

## Validation and Acceptance

The slice is acceptable when generated repos contain a coherent ordered setup roadmap, `agentic:check` and `codebase:contract` prove it, clean-room no-provider proof passes, and the owning Program ledger is updated.

### Test Commands

Run these commands before completion:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts tests/starter-template-source-materialization.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts tests/generated-repo-command-contract.test.ts
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler format:check
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-upgrade-generated-starter-operating-pack.md
    bun run programs:lint

## Idempotence and Recovery

Keep edits scoped to generated operating-pack compiler code, focused tests, and the owning docs. If generated proof fails, inspect the generated repo output rather than weakening the no-provider contract.

## Artifacts and Notes

Owning Program: `docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/program.md`.

Planning brief: `docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/planning-brief-4.md`.

## Interfaces and Dependencies

This plan depends on `materializeRepoSnapshot`, generated repo command proof, Program lint, ExecPlan lint, and the generated template-source materialization path.
