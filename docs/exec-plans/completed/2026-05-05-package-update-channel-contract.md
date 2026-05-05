---
title: Package Update Channel Contract
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Define the trusted package/update-channel contract before any registry, updater, migration runner, PR automation, or hosted execution is built.
post_build_recap: Added `docs/internal/update-channel.md`, linked it from the internal docs spine, updated the Program ledger/next-slice guidance, and validated the docs-only contract slice.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Planning package/update-channel mechanics for generated or mature repos.
  - Reviewing whether update work is still contract-only or has crossed into execution.
  - Deciding how future migrations, prompt packs, manifests, provenance, rollback, and review handoff should work.
---

# Package Update Channel Contract

This is a living execution plan for the next Customer Agentic Operating System slice: define the update-channel contract without building the update channel.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday can eventually become a trusted update channel for agent-built SaaS: generated repos get a versioned starting point, mature repos get adoption metadata, and future paid loops can propose migrations, prompt-pack refreshes, production patterns, and upgrade PRs. That opportunity is useful only if the permission boundary is explicit before code exists. After this slice, the repo should have a durable contract for demand triggers, generated-versus-mature repo differences, manifest and provenance concepts, migration preview, rollback proof, customer review handoff, failure modes, and hard non-goals.

The slice is complete when future workers can read one internal contract and understand what must be proven before any updater, registry, migration runner, PR automation, hosted executor, dependency upgrade engine, or source-sharing path is implemented.

## Progress

- [x] 2026-05-05 EDT: Read the active Program, Next Slice, `package-discussion.md`, packaging/validation research, planning brief 2, and existing internal docs spine.
- [x] 2026-05-05 EDT: Created the update-channel contract doc and linked it from `docs/internal/README.md`.
- [x] 2026-05-05 EDT: Updated the Program progress, decision log, slice ledger, next slice, and risks.
- [x] 2026-05-05 EDT: Completed this ExecPlan and ran validation.

## Surprises & Discoveries

The Program explicitly says this slice should create a child ExecPlan before implementation and define the contract before any updater build. The smallest viable implementation is a docs contract plus Program closeout; code, generated repo manifests, package scripts, CLI commands, registry schemas, and PR automation are out of scope.

## Decision Log

Decision: Make this slice contract-only.
Rationale: `package-discussion.md` includes a tempting next-day roadmap for manifests, CLI stubs, recipes, and registry story, but the active Program narrows the next slice to a contract and risk split. Shipping code here would create update authority before the product has named demand triggers, provenance, review, rollback, failure, and permission boundaries.
Date: 2026-05-05

## Outcomes & Retrospective

This plan is complete. `docs/internal/update-channel.md` now defines the contract for future trusted update-channel work: demand triggers, generated-versus-mature repo modes, manifest concept, provenance, file ownership classes, permission boundaries, lifecycle states, proof and rollback, customer review handoff, failure modes, and a future implementation checklist.

No executable update behavior was added. This slice did not create a registry, updater, migration runner, package manager integration, dependency upgrade path, manifest renderer, generated repo output, CLI command, PR opener, hosted executor, provider setup, migration recipe, prompt-pack updater, checkout SKU, package script, lockfile change, Convex schema change, app UI, or external setup requirement.

## Context and Orientation

The Program next slice is `package-update-channel-contract` in `docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md`. The research inputs are `package-discussion.md` and `docs/programs/completed/2026-05-02-customer-agentic-operating-system/research-pass-packaging-validation.md`.

The owning documentation surface is `docs/internal/`. The new contract should live at `docs/internal/update-channel.md` and be linked from `docs/internal/README.md`.

### In Scope

Define the update-channel contract:

- demand trigger and readiness gate before update mechanics ship
- generated-repo versus mature-repo differences
- manifest concept and ownership boundaries
- migration and prompt-pack provenance
- permission boundary for detection, planning, writing, validation, PRs, and hosted execution
- preview, customer review handoff, rollback proof, and blocked-proof requirements
- sync and raw-source policy
- failure modes and stop conditions
- explicit non-goals for the current contract slice

### Out Of Scope

Do not build a registry, update bot, migration runner, package manager integration, dependency upgrade engine, manifest renderer, generated repo `ship-by-sunday.json`, CLI command, PR opener, hosted executor, provider setup, migration recipe, prompt-pack updater, or customer-facing checkout/package SKU. Do not change package scripts, dependency manifests, lockfiles, codebase compiler output, local runner behavior, Convex schema, GitHub integrations, homepage copy, or app UI.

## Plan of Work

First, write `docs/internal/update-channel.md` as a readable operator contract. It should name the staged lifecycle from demand proof through detection, planning, preview, approval, local execution, proof, optional PR handoff, and rollback. It should repeatedly separate generated repos from mature repos because generated repos can carry SBS-managed hashes and manifests earlier, while mature repos must begin with `.sbs` adoption artifacts and explicit ownership mapping.

Second, link the doc from `docs/internal/README.md`.

Third, update the active Program: record progress, add a decision if needed, move this plan into the completed ledger, set the next slice to "no implementation slice selected until demand or a new planning brief", and add/update risks so future work does not interpret this contract as updater authority.

Finally, complete this ExecPlan and run docs-focused validation plus the required broad gates.

## Milestones

The first milestone is a contract doc. At the end, `docs/internal/update-channel.md` names the update-channel boundary without adding executable behavior.

The second milestone is Program closeout. At the end, the Program records that update-channel work remains future implementation behind a completed contract.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Edit:

    docs/internal/update-channel.md
    docs/internal/README.md
    docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md
    docs/exec-plans/active/2026-05-05-package-update-channel-contract.md

After implementation, move the plan to:

    docs/exec-plans/completed/2026-05-05-package-update-channel-contract.md

## Validation and Acceptance

Acceptance requires the update-channel contract to define what future update work must prove before it can execute. It must not add executable updater behavior or imply that update-channel mechanics are live.

This slice does not require external setup. It adds no provider project, GitHub App, OAuth app, registry, token, secret, environment variable, repository secret, webhook, callback, package install, migration, CI permission, or hosted executor.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-package-update-channel-contract.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-package-update-channel-contract.md docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md docs/internal/README.md docs/internal/update-channel.md
    git diff --check

## Idempotence and Recovery

This is documentation-only. Recovery is reverting the touched docs and rerunning the validators. There is no runtime migration, external setup, or generated output to unwind.

## Artifacts and Notes

The durable artifact is `docs/internal/update-channel.md`.

Validation evidence recorded for completion as passed:

    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-package-update-channel-contract.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-package-update-channel-contract.md docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md docs/internal/README.md docs/internal/update-channel.md
    git diff --check

## Interfaces and Dependencies

This slice depends on the active Program, `package-discussion.md`, packaging/validation research, generated-repo operating pack decisions, mature-repo adoption decisions, execution-surface contract, and workflow-packet contract. It does not depend on package registries, GitHub APIs, provider secrets, local runner execution changes, codebase compiler changes, Convex schema changes, or generated repo materialization.
