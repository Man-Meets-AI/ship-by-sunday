---
title: Web Convex Architecture Contract And Inventory
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Create the first Program child slice by adding app-level architecture and conventions docs plus a current-to-target migration inventory.
post_build_recap: Added `apps/web/ARCHITECTURE.md`, `apps/web/CONVENTIONS.md`, an `apps/web/AGENTS.md` read-before-editing pointer, and a Program migration inventory that map the current web and Convex app to the template-first target without moving runtime files.
program_id: template-first-web-convex-architecture
planning_brief: docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-1.md
read_when:
  - Resuming the template-first web and Convex Program.
  - Preparing the app src tree and route group migration.
  - Checking the first architecture contract slice retrospective.
---

# Web Convex Architecture Contract And Inventory

This document is a living execution plan for the first child slice of the template-first web and Convex Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday started this Program from four public landing pages, but those pages expose different revenue and fulfillment paths. Before moving routes or rewriting billing, the app needs a checked-in contract that future contributors can trust. After this slice, a novice can open the web app docs and see which layer owns routes, product state, billing, email, observability, provider setup, and migration deviations.

## Progress

- [x] 2026-05-13: Read root instructions, `apps/web/AGENTS.md`, `docs/release-workflow.md`, Convex AI guidelines, the Program packet, planning brief 1, and the sibling template's `ARCHITECTURE.md` and `CONVENTIONS.md`.
- [x] 2026-05-13: Inspected current `apps/web` routes, provider helper folders, Convex modules, package scripts, and test layout.
- [x] 2026-05-13: Added `apps/web/ARCHITECTURE.md` with the template-first ownership contract expanded for Starter, Workers, Worker Seal Team 6, Sentry, Resend, Stripe, Cal.com, and Convex.
- [x] 2026-05-13: Added `apps/web/CONVENTIONS.md` with concrete route, component, Convex, billing, email, env, debug, observability, testing, and external setup rules.
- [x] 2026-05-13: Added `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md` with current-to-target maps, billing target summary, deviation register, and test inventory.
- [x] 2026-05-13: Updated `apps/web/AGENTS.md` so future architecture, route, Convex, billing, provider, Sentry, Resend, and debug work reads the new app docs first.
- [x] 2026-05-13: Updated the Program ledger and next-slice state.
- [x] 2026-05-13: Ran plan, Program, markdown, and whitespace validation for the docs-only slice.
- [x] 2026-05-13: Repaired review findings by clarifying pre-migration route wording, requiring secret-gated server-trusted Convex provider writes, adding the target `/billing` route, splitting app-shell component ownership, and adding concrete test/docs proof maps.

## Surprises & Discoveries

The current app has more public and protected surfaces than the sibling template, including blog, docs, support, Codex, admin impersonation, checkout repair, course/tutorials, and Workers operational routes. The correct first-slice result is not a blind one-to-one path list; it is a template-shaped ownership contract plus a deviation register that keeps those real product surfaces from becoming excuses to preserve the old `platform/` and route-group layout.

The Convex skill path shown in the skill inventory resolves under the repo's `.agents/skills` directory, not under the global `.codex/skills` directory. The failed read was corrected before any source edits.

## Decision Log

Decision: Complete the first child slice as a docs and inventory slice, not a runtime file move.

Rationale: The Program touches P0 billing, auth, webhooks, Convex state, Sentry, Resend, and Cal.com. Moving files before the target contract exists would make later regressions harder to isolate.

Date: 2026-05-13.

Decision: Put the app architecture and conventions docs directly under `apps/web`.

Rationale: The app-specific docs need to be where future web and Convex contributors will look, and `apps/web/AGENTS.md` already points workers at app-local instructions.

Date: 2026-05-13.

Decision: Keep the detailed move map in the Program packet instead of only in `apps/web`.

Rationale: The move map is Program-specific migration scaffolding. After the migration completes, the local app docs should remain as permanent architecture and convention contracts, while the inventory can remain with the Program history.

Date: 2026-05-13.

## Outcomes & Retrospective

This first child slice is complete. It created a local app architecture contract, local app conventions, an app-local instruction pointer, and a durable Program migration inventory. The post-review repair tightened those docs so they do not preserve pre-migration routes by default, do require secret-gated provider writes into Convex, do name `/billing` as the protected management route, and do map later test/docs proof surfaces concretely. It did not move runtime files, change provider dashboards, change Convex schema, add packages, or alter production endpoints. The next child slice can now focus on the app `src/` tree and route group migration without reopening the template-first decision or the product billing model.

## Context and Orientation

The owning Program is `docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md`. It exists because the current web app's shape is not trusted for the new product and billing model. The visible public pages are `/`, `/starter`, `/workers`, and `/worker-seal-team-6`, but each page carries a different payment and fulfillment path.

The current app stores routes in `apps/web/app`, UI primitives in `apps/web/components`, utility code in `apps/web/lib`, provider and boundary helpers in `apps/web/platform`, product config in `apps/web/config`, tests in `apps/web/tests`, and backend functions in `apps/web/convex`. The sibling template target stores app code under `src/`, with route groups `(marketing)`, `(auth)`, `(app)`, and `api`, shared components under `src/components`, provider/domain helpers under `src/lib`, email templates under `src/emails`, and Convex modules under `convex`.

### In Scope

This slice creates `apps/web/ARCHITECTURE.md`, `apps/web/CONVENTIONS.md`, and `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`. It updates `apps/web/AGENTS.md` to point future contributors at those app-local docs, then updates the owning Program to show that the first child slice is complete and names the next slice.

### Out Of Scope

This slice does not move the app into `src/`, change route groups, rewrite checkout or webhooks, change Convex schema, add Sentry or Resend packages, configure Cal.com, change provider dashboard endpoints, or alter tests. Those are later Program slices.

## Plan of Work

First, inspect the sibling template docs and current app shape. The relevant source files are the template's `ARCHITECTURE.md` and `CONVENTIONS.md`, `apps/web/AGENTS.md`, `apps/web/convex/_generated/ai/guidelines.md`, `docs/release-workflow.md`, current route files under `apps/web/app`, provider helpers under `apps/web/platform`, and Convex modules under `apps/web/convex`.

Second, create `apps/web/ARCHITECTURE.md` from the template ownership model. Expand the template's notes/billing example into Ship by Sunday's actual product model: Starter annual license, Workers subscription, Worker Seal Team 6 paid booking, provider-dashboard refunds, failed-payment recovery, Resend email state, and Sentry context rules.

Third, create `apps/web/CONVENTIONS.md` as the change guide. It should say how to name routes and modules, where components and helpers belong, how Convex authorization works, how Stripe/Cal.com/Resend/Sentry are allowed to interact with the app, and what tests/proof are required.

Fourth, create the Program migration inventory beside the Program packet. It should map current paths to target paths, record target Convex modules, summarize billing and fulfillment state, list deviations, and name later test/proof surfaces.

Fifth, update `apps/web/AGENTS.md` so the new architecture and conventions docs become part of the normal app workflow. Then update the Program progress, slice ledger, and next slice so a future contributor can resume from the Program alone.

## Milestones

Milestone 1 was source inspection. It is complete because the template docs, app instructions, release workflow, Convex AI guidelines, current route tree, current Convex modules, current package scripts, and existing Program packet were read before authoring the docs.

Milestone 2 was local app architecture and convention docs. It is complete because `apps/web/ARCHITECTURE.md` and `apps/web/CONVENTIONS.md` now exist and capture the template-first ownership contract for this app.

Milestone 3 was migration inventory. It is complete because the Program packet now includes `architecture-migration-inventory.md` with route, component/helper, Convex, billing, deviation, and test/proof sections.

Milestone 4 was validation and Program writeback. It is complete because plan lint, Program lint, markdown lint, and whitespace validation passed for the touched docs.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Read the planning and source docs:

    sed -n '1,260p' docs/exec-plans/PLANS.md
    sed -n '1,260p' apps/web/AGENTS.md
    sed -n '1,260p' apps/web/convex/_generated/ai/guidelines.md
    sed -n '1,260p' docs/release-workflow.md
    sed -n '1,260p' /Users/bazelrex/Developer/next-js-convex-clerk-stripe-template/ARCHITECTURE.md
    sed -n '1,300p' /Users/bazelrex/Developer/next-js-convex-clerk-stripe-template/CONVENTIONS.md

Inspect the current and target trees:

    find apps/web/app -maxdepth 3 -type f \( -name 'page.tsx' -o -name 'route.ts' -o -name 'layout.tsx' \) | sort
    find apps/web/convex -maxdepth 3 -type f -not -path 'apps/web/convex/_generated/*' | sort
    rg --files /Users/bazelrex/Developer/next-js-convex-clerk-stripe-template/src /Users/bazelrex/Developer/next-js-convex-clerk-stripe-template/convex -g '!**/node_modules/**' | sort

Validate the finished docs:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md
    bun run programs:lint
    bun run markdown:lint -- --paths apps/web/ARCHITECTURE.md apps/web/CONVENTIONS.md apps/web/AGENTS.md docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md docs/programs/active/2026-05-13-template-first-web-convex-architecture
    git diff --check -- apps/web/ARCHITECTURE.md apps/web/CONVENTIONS.md apps/web/AGENTS.md docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md docs/programs/active/2026-05-13-template-first-web-convex-architecture MISTAKES.md

## Validation and Acceptance

Acceptance requires the first child slice to leave behind a self-contained app architecture contract, a change convention contract, and a migration inventory that a later app tree migration can execute without redoing the analysis. The docs must clearly say what is in scope for later slices, which old paths are migration debt, which deviations are intentional, and which P0/P1 tests later slices must add or preserve.

Feature: architecture contract and migration inventory. Risk: P1/P0 planning surface because it governs future billing, auth, webhook, Convex, Sentry, Resend, and Cal.com implementation, but this slice itself is docs-only and changes no runtime behavior. Source of truth: `apps/web/ARCHITECTURE.md`, `apps/web/CONVENTIONS.md`, the Program migration inventory, this completed ExecPlan, and Program ledger. Must work: a future agent can identify target route groups, provider ownership, Convex module ownership, billing target state, and accepted deviations. Must fail safely: the docs explicitly forbid runtime moves, provider endpoint changes, and in-app admin refund actions in this first slice. Tests: plan lint, Program lint, markdown lint, and whitespace check. CI gate: docs and Program validation.

### Test Commands

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md
    bun run programs:lint
    bun run markdown:lint -- --paths apps/web/ARCHITECTURE.md apps/web/CONVENTIONS.md apps/web/AGENTS.md docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md docs/programs/active/2026-05-13-template-first-web-convex-architecture
    git diff --check -- apps/web/ARCHITECTURE.md apps/web/CONVENTIONS.md apps/web/AGENTS.md docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md docs/programs/active/2026-05-13-template-first-web-convex-architecture MISTAKES.md

## Idempotence and Recovery

This slice is docs-only. The docs can be safely edited and revalidated. If a future contributor finds an inaccurate path map, update `architecture-migration-inventory.md`, record the reason in the Program decision log if it changes a boundary, and rerun the plan, Program, markdown, and whitespace checks.

No runtime rollback is needed because this slice changes no application code, provider configuration, database schema, or environment variables.

## Artifacts and Notes

Final validation evidence recorded on 2026-05-13:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md
    docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md: ok

    bun run programs:lint
    template-first-web-convex-architecture: ok

    bun run markdown:lint -- --paths apps/web/ARCHITECTURE.md apps/web/CONVENTIONS.md apps/web/AGENTS.md docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md docs/programs/active/2026-05-13-template-first-web-convex-architecture
    docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md: ok
    docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md: ok

    git diff --check -- apps/web/ARCHITECTURE.md apps/web/CONVENTIONS.md apps/web/AGENTS.md docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md docs/programs/active/2026-05-13-template-first-web-convex-architecture MISTAKES.md
    exited with code 0

## Interfaces and Dependencies

This slice depends on the Program packet under `docs/programs/active/2026-05-13-template-first-web-convex-architecture/`, the sibling template under `~/Developer/next-js-convex-clerk-stripe-template`, `apps/web/AGENTS.md`, `docs/release-workflow.md`, and `apps/web/convex/_generated/ai/guidelines.md`.

The permanent app docs added by this slice are `apps/web/ARCHITECTURE.md` and `apps/web/CONVENTIONS.md`. The app instruction file `apps/web/AGENTS.md` now points future workers at those docs. The migration-specific Program artifact added by this slice is `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`.
