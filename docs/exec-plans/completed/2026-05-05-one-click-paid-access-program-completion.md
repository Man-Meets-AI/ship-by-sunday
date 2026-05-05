---
title: Complete One Click Paid Access Program
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Close the one-click paid access Program after its checkout fulfillment, Express Checkout, and passwordless handoff slices are complete.
post_build_recap: The One Click Paid Access Program is archived under completed, child planning briefs point at the completed Program packet, Program inventories no longer list it as active, and release proof remains delegated to guarded standard release commands validated with dry-runs.
program_id: one-click-paid-access
planning_brief: docs/programs/completed/2026-05-02-one-click-paid-access/planning-brief-2.md
read_when:
  - Closing or auditing the One Click Paid Access Program.
  - Checking how checkout release proof is delegated to the standard release workflow.
  - Validating Program archive bookkeeping.
---

# Complete One Click Paid Access Program

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The One Click Paid Access initiative has no remaining implementation slice. Paid checkout fulfillment, homepage Express Checkout progressive enhancement, and checkout-email passwordless handoff are already complete. The remaining work is to make the durable Program truth match that finished state, archive the Program, and prove the release-proof boundary without running production billing from a local shell.

This matters because a future worker should not restart completed checkout work or treat an unchecked production-proof note as a missing feature. Success is visible when `one-click-paid-access` no longer appears under active Programs, all child ExecPlans point at the completed Program packet, and local validation confirms the release proof command plans `billing_integration` behind the explicit approval gate.

## Progress

- [x] 2026-05-05: Read `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, the active One Click Paid Access Program, its current planning brief, and the completed passwordless handoff child ExecPlan.
- [x] 2026-05-05: Confirmed `docs/exec-plans/active/` has no active Markdown ExecPlans and the Program's `## Next Slice` already says no implementation child remains.
- [x] 2026-05-05: Update the Program document, indexes, and child ExecPlan Program links to the completed archive path.
- [x] 2026-05-05: Run focused release-proof dry-runs for `default_ship` and `billing_integration`.
- [x] 2026-05-05: Run touched plan lint, Program lint, Markdown lint, format, lint, typecheck, and diff hygiene.
- [x] 2026-05-05: Move this ExecPlan to completed with a retrospective.

## Surprises & Discoveries

The active Program was internally stale. `## Next Slice` correctly stated that no implementation child remains, but `Current State`, `Progress`, `Slice Ledger`, and `Outcomes & Retrospective` still described the passwordless handoff as future or left earlier child paths under `docs/exec-plans/active/` even though those files already live under `docs/exec-plans/completed/`.

`docs/release-workflow.md` makes production billing proof a release workflow responsibility. For checkout, Stripe, entitlement, webhook, or access-handoff changes, `Production Release Proof` should include hosted `billing_integration` after merge to `main`. This Program should not invent a Program-specific production proof pass.

## Decision Log

Decision: Treat this as a Program completion and archive slice, not a new checkout implementation slice.
Rationale: The active Program and child ExecPlan ledger show the implementation slices are already complete. The only remaining truth gap is stale Program bookkeeping and release-proof wording.
Date: 2026-05-05

Decision: Use release-proof dry-run validation locally instead of running production billing proof from this slice.
Rationale: `billing_integration` can touch Stripe Checkout and requires explicit approval through `QA_ALLOW_BILLING_INTEGRATION=1` for real runs. The standard release workflow owns hosted production proof after merge to `main`; this local closeout should only prove that the command surface still plans the expected guarded steps.
Date: 2026-05-05

## Outcomes & Retrospective

Completed. The One Click Paid Access Program now lives under `docs/programs/completed/2026-05-02-one-click-paid-access/` with `status: complete`, a real completion date, a retrospective, a checked progress ledger, and a `## Next Slice` statement that no Program-owned slice remains.

The closeout corrected stale active-path references in child ExecPlans and the Program packet, moved the Program out of the active inventory, and added the Program to the completed inventory. Local release-proof dry-runs passed for both `default_ship` and `billing_integration`; no live billing proof was run because real hosted production billing proof belongs to the standard post-merge release workflow and requires explicit approval.

## Context and Orientation

The Program packet is now under `docs/programs/completed/2026-05-02-one-click-paid-access/`. Its current planning brief pointer is `current-planning-brief.txt`, which points at `planning-brief-2.md`. The Program-linked child ExecPlans are already in `docs/exec-plans/completed/`: `2026-05-02-instant-paid-checkout-fulfillment.md`, `2026-05-02-homepage-express-link-checkout.md`, and `2026-05-03-passwordless-checkout-email-handoff.md`.

The release proof contract lives in `docs/release-workflow.md`, and the runnable proof command lives at `scripts/release/run-release-proof.mjs` through root `package.json` scripts. `billing_integration` requires explicit approval for non-dry-run execution, so this closeout must not run a live billing proof accidentally.

Program indexes are `docs/programs/README.md`, `docs/programs/active/index.md`, and `docs/programs/completed/index.md`. Program movement updates those indexes and rewrites child ExecPlan `planning_brief` links from the active Program path to the completed Program path.

### In Scope

Update and archive the One Click Paid Access Program packet. Fix stale Program ledger paths, progress, current state, outcomes, validation wording, and release-proof boundary notes. Update Program indexes. Rewrite Program-linked child ExecPlan planning brief paths to the completed Program path. Run focused release-proof dry-runs and documentation validation.

### Out Of Scope

Do not change checkout, Stripe, Clerk, Convex, homepage, auth, or access behavior in this slice. Do not run a live production billing proof locally. Do not create new provider setup requirements. Do not touch `.worktrees/` or unrelated dirty worktree changes.

## Plan of Work

First, update the Program document. Change the frontmatter to `complete`, fill `completed_at` and `post_build_recap`, and rewrite stale sections so they say the three child slices are complete and no Program-owned next slice remains.

Next, move the whole Program folder to `docs/programs/completed/2026-05-02-one-click-paid-access/`. Update `docs/programs/README.md`, `docs/programs/active/index.md`, and `docs/programs/completed/index.md` so the inventories no longer list this Program as active.

Then update Program-linked child ExecPlans so their `planning_brief` frontmatter points at `docs/programs/completed/2026-05-02-one-click-paid-access/planning-brief-1.md` or `planning-brief-2.md`. Update this closeout plan too before moving it to completed.

Finally, run local validation. The focused behavior proof for this docs-only closeout is the release-proof dry-run pair: `bun run release:proof -- --proof=default_ship --dry-run` and `bun run release:proof -- --proof=billing_integration --dry-run`. Those commands must plan the proof without doing live browser or Stripe work. Then run Program, plan, Markdown, format, lint, typecheck, and diff checks.

## Milestones

Milestone 1 updates the Program truth while it remains active. At the end, the Program document no longer says passwordless handoff is future work, its child ledger points at completed ExecPlans, and its validation section distinguishes completed implementation from post-merge release proof.

Milestone 2 archives the Program and rewrites references. At the end, there is no active One Click Paid Access Program folder, indexes agree, and child ExecPlans point at the completed Program packet.

Milestone 3 validates and completes this closeout plan. At the end, dry-run release proof, Program lint, touched plan lint, Markdown lint, broad repo gates, and diff hygiene have passed or any limitation is recorded directly in this plan.

## Concrete Steps

Start from the repo root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Confirm the active Program and child plan inventory:

    rg -n "program_id: one-click-paid-access|one-click-paid-access" docs/programs docs/exec-plans -g '*.md'

Update the Program document and indexes, then move the Program folder from the active lane to the completed lane. If the folder already lives under `docs/programs/completed/`, keep editing it there instead of moving it again.

Run the release-proof dry-runs:

    bun run release:proof -- --proof=default_ship --dry-run
    bun run release:proof -- --proof=billing_integration --dry-run

The expected dry-run output is JSON with `status: "ok"`, `dryRun: true`, and planned steps. The billing proof dry-run must not require `QA_ALLOW_BILLING_INTEGRATION=1` because it does not perform Stripe Checkout.

Run final validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-one-click-paid-access-program-completion.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-one-click-paid-access-program-completion.md docs/exec-plans/completed/2026-05-02-instant-paid-checkout-fulfillment.md docs/exec-plans/completed/2026-05-02-homepage-express-link-checkout.md docs/exec-plans/completed/2026-05-03-passwordless-checkout-email-handoff.md docs/programs/README.md docs/programs/active/index.md docs/programs/completed/index.md docs/programs/completed/2026-05-02-one-click-paid-access
    bun run format
    bun lint
    bun typecheck
    git diff --check

## Validation and Acceptance

The Program is accepted as complete when the durable archive says the initiative outcome landed, no active next slice remains, child ExecPlans point at immutable planning briefs in the completed Program packet, and production billing proof is described as part of the normal release workflow rather than this Program's local completion criteria.

Local proof is accepted when dry-run release-proof commands plan both `default_ship` and `billing_integration`, Program lint passes, every touched Program-linked plan passes `plans:lint`, Markdown lint passes for touched docs, and the repo gates pass.

### Test Commands

Run these commands from the repo root:

    bun run release:proof -- --proof=default_ship --dry-run
    bun run release:proof -- --proof=billing_integration --dry-run
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-one-click-paid-access-program-completion.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-02-instant-paid-checkout-fulfillment.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-02-homepage-express-link-checkout.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-03-passwordless-checkout-email-handoff.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-one-click-paid-access-program-completion.md docs/exec-plans/completed/2026-05-02-instant-paid-checkout-fulfillment.md docs/exec-plans/completed/2026-05-02-homepage-express-link-checkout.md docs/exec-plans/completed/2026-05-03-passwordless-checkout-email-handoff.md docs/programs/README.md docs/programs/active/index.md docs/programs/completed/index.md docs/programs/completed/2026-05-02-one-click-paid-access
    bun run format
    bun lint
    bun typecheck
    git diff --check

## Idempotence and Recovery

Moving the Program folder is safe to repeat only after checking the current location. If the folder is already under `docs/programs/completed/`, update references in place and do not recreate an active copy. If validation fails after movement, fix the completed Program path and rerun the same lint commands.

The release-proof commands in this plan use `--dry-run` and should not mutate Stripe, Clerk, Convex, Vercel, or GitHub. Do not remove `--dry-run` during this closeout. A real hosted billing proof belongs after merge through the standard release workflow and must use explicit billing approval.

## Artifacts and Notes

The active Program's `## Next Slice` already stated the key boundary before this plan began:

    There is no remaining implementation child slice in this Program.

The release-proof dry-runs passed:

    bun run release:proof -- --proof=default_ship --dry-run
    status: ok; planned persona preparation, codebase integration-ui proof, legacy redirect proof, and authenticated browser proof

    bun run release:proof -- --proof=billing_integration --dry-run
    status: ok; planned Stripe doctor, billing persona preparation, billing browser proof, and Stripe-to-Convex handoff verification

Final validation passed:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-one-click-paid-access-program-completion.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-02-instant-paid-checkout-fulfillment.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-02-homepage-express-link-checkout.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-03-passwordless-checkout-email-handoff.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-one-click-paid-access-program-completion.md docs/exec-plans/completed/2026-05-02-instant-paid-checkout-fulfillment.md docs/exec-plans/completed/2026-05-02-homepage-express-link-checkout.md docs/exec-plans/completed/2026-05-03-passwordless-checkout-email-handoff.md docs/programs/README.md docs/programs/active/index.md docs/programs/completed/index.md docs/programs/completed/2026-05-02-one-click-paid-access
    bun run format
    bun lint
    bun typecheck
    git diff --check

The release workflow requires hosted billing proof when release scope touches checkout, Stripe, entitlement, webhook, or access-handoff behavior. This closeout does not weaken that rule; it removes the stale impression that the Program itself owns a separate production proof pass.

## Interfaces and Dependencies

This plan depends on `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `docs/release-workflow.md`, `scripts/release/run-release-proof.mjs`, the root `release:proof` package script, the Program linters, the Markdown linter, and the existing completed child ExecPlans for the One Click Paid Access initiative.
