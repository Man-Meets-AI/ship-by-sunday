---
title: Loop Workflow Packet Contract
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Define the shared workflow-packet contract that every existing-codebase loop must satisfy before expanding loop types or execution surfaces.
post_build_recap: The internal workflow-packet contract and workspace loops UI now name the shared loop boundary for evidence, context, execution surface, Codex interpretation, writes, proof, sync, and revocation without adding new execution.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Adding or reviewing an existing-codebase workflow packet.
  - Updating `/workspace/loops`, finding approval, Convex workflow runs, or local-runner packet artifacts.
  - Checking loop boundaries before adding provider, PR, CI, source-sharing, or hosted execution behavior.
---

# Loop Workflow Packet Contract

This is a living execution plan for the next Customer Agentic Operating System slice: make the shared loop workflow-packet contract explicit before adding more loops or expanding execution surfaces.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday has shipped several workflow packets already: source-truth readiness, observability/debuggability, and broken-app triage. They are useful, but their shared contract is still implicit across the approval UI, Convex workflow rows, local-runner packet JSON, proof artifacts, and Program prose. After this slice, future contributors and customers can see the packet contract in durable docs and on `/workspace/loops`: evidence comes first, consent names the surface, writes are optional and scoped, proof is required, blocked proof is honest, and sync stays structured by default.

## Progress

- [x] 2026-05-05 EDT: Read root `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, the active Program, `planning-brief-2.md`, `apps/web/AGENTS.md`, root `DESIGN.md`, and `docs/ship-by-sunday/design-pack/AGENTS.md`.
- [x] 2026-05-05 EDT: Inspected `packages/local-runner/src/core/workflow-run-api.ts`, the source-truth, observability, and broken-app local workflow packet writers, the workspace finding approval read model, and `/workspace/loops` UI/tests.
- [x] Add the durable workflow-packet contract doc and internal docs index entry.
- [x] Expose the packet contract on `/workspace/loops` without adding a run action.
- [x] Add focused tests for the packet contract stages and forbidden authority claims.
- [x] Update the Program, complete this ExecPlan, and run validation.

## Surprises & Discoveries

The shipped local packet JSON already has the right intent but not one identical shape. Source truth writes a rich packet with inputs, local artifacts, touch targets, commands, sync policy, stop conditions, expected outputs, and rollback. Observability adds provider-value and sync-safe schema boundaries. Broken-app triage currently writes a smaller read-only diagnostics packet. The shared contract should describe required concepts rather than force a migration of all existing local artifacts in this slice.

## Decision Log

Decision: Define the common contract and customer-visible stages now, without migrating local packet JSON schemas.
Rationale: The Program asks to define the loop workflow-packet contract before further expansion. The existing workflows are already validated and customer-useful. A forced schema migration would touch runners, Convex, and several workflows at once. This slice should create the durable contract, expose it in the loops surface, and add tests that prevent future UI drift while leaving executor behavior unchanged.
Date: 2026-05-05

## Outcomes & Retrospective

This slice shipped the shared workflow-packet contract as a durable reference and a customer-visible loops explanation. `docs/internal/workflow-packets.md` now defines the packet lifecycle, required concepts, shipped workflow mapping, and future change checklist. `docs/internal/README.md` links to it.

The `/workspace/loops` read model now includes static packet-contract rows for evidence/probes, customer bottleneck context, execution surface, Codex interpretation, write authority, proof delivery, sync policy, and revocation/stops. The loops page renders those rows above the existing finding-filtered workflow catalog without adding queue controls, provider setup, hosted execution, branch pushes, pull request creation, CI reruns, raw-source sharing, raw-log sharing, or new workflow ids.

The Program now records this completed slice, marks the workflow-packet task complete, adds this completed ExecPlan to the slice ledger, and names `mature-repo-adoption-lane` as the next Program slice.

## Context and Orientation

The Program-owned next slice is recorded in `docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md`. The current planning brief is `docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`.

The shipped packet producers are `packages/local-runner/src/core/source-truth-workflow.ts`, `packages/local-runner/src/core/observability-debuggability-workflow.ts`, and `packages/local-runner/src/core/broken-app-triage-workflow.ts`. The runner API shape is `ApprovedWorkflowRunPacket` in `packages/local-runner/src/core/workflow-run-api.ts`. The workspace approval read model is `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts`. The loops catalog is built by `buildWorkspaceLoopsModel` in `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts` and rendered by `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-loops-page.tsx` plus `workspace-loops-catalog.tsx`.

The durable operator reference should live in `docs/internal/workflow-packets.md` and be linked from `docs/internal/README.md`.

### In Scope

Define the shared packet contract for existing-codebase loops. The contract must name deterministic probes, user bottleneck context, Codex interpretation, optional Codex write jobs, proof commands, stop conditions, sync policy, allowed and disallowed touch targets, blocked-proof states, execution surface selection, revocation behavior, and proof delivery.

Expose the same contract on `/workspace/loops` as an explanatory operational panel. The panel should make clear that finding approval starts execution, not the loops page. It must not add queue controls, package install buttons, provider setup, branch pushes, pull request creation, CI reruns, raw-source sharing, raw-log sharing, hosted execution, or new workflow execution.

Update focused unit and integration UI tests. Update this ExecPlan and the active Program after implementation.

### Out Of Scope

Do not migrate local packet JSON schemas, change Convex schema, add a new workflow id, add an executor, run provider commands, add package/update-channel mechanics, implement mature-repo adoption, install dependencies, run migrations, push branches, create pull requests, rerun CI, share raw source, share raw logs, expand Codex app-server repair behavior, or add hosted execution.

## Plan of Work

First, add `docs/internal/workflow-packets.md` and link it from `docs/internal/README.md`. The doc should describe the packet lifecycle in prose: intake evidence, customer bottleneck context, deterministic probes, optional Codex interpretation, explicit approval, selected execution surface, optional write phase, proof commands, sync policy, blocked-proof states, proof delivery, revocation, and forbidden expansions.

Second, extend `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts` with a small `WorkflowPacketContractRow` model and include it in `WorkspaceLoopsModel`. The rows should be static contract stages, not derived execution state. They should use concise labels suitable for `/workspace/loops`.

Third, add a `WorkflowPacketContractPanel` in `workspace-loops-catalog.tsx` and render it above the finding-filtered catalog from `workspace-loops-page.tsx`. Keep the current neutral workspace style and do not add a primary run button.

Fourth, update focused tests in `apps/web/tests/unit/workspace-support-read-model.test.ts` and `apps/web/tests/integration-ui/workspace-loops-page.test.tsx` to assert the contract rows render and forbidden execution claims remain absent.

Finally, update the active Program, move this ExecPlan to completed, and run the focused tests followed by required gates.

## Milestones

The first milestone is durable contract documentation. At the end, `docs/internal/workflow-packets.md` explains the loop packet model in enough detail for a future workflow slice to follow it without reading chat history.

The second milestone is customer-visible loop contract clarity. At the end, `/workspace/loops` shows that workflows start from approved findings and that packets include evidence, consented surface, optional writes, proof, blocked proof, and structured sync boundaries.

The third milestone is closeout proof. At the end, focused tests and repo gates pass, the plan is completed, and the Program names the next slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Edit these files:

    docs/internal/workflow-packets.md
    docs/internal/README.md
    apps/web/app/(workspace)/_lib/workspace-support-read-model.ts
    apps/web/app/(workspace)/_components/existing-codebase-support/workspace-loops-catalog.tsx
    apps/web/app/(workspace)/_components/existing-codebase-support/workspace-loops-page.tsx
    apps/web/tests/unit/workspace-support-read-model.test.ts
    apps/web/tests/integration-ui/workspace-loops-page.test.tsx
    docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md
    docs/exec-plans/active/2026-05-05-loop-workflow-packet-contract.md

After implementation, move the plan to:

    docs/exec-plans/completed/2026-05-05-loop-workflow-packet-contract.md

## Validation and Acceptance

Acceptance requires durable docs and `/workspace/loops` to state the shared workflow-packet contract without implying new execution authority. The tests must prove the packet contract rows render and that the loops page still lacks queue, provider, PR, CI, raw-source, and hosted-execution claims.

This slice does not require external setup. If a later packet adds provider setup, GitHub App work, PR authority, CI authority, source sharing, hosted execution, or app-server repair authority, that later slice must document exact setup, scopes, verification, and failure states.

### Test Commands

These commands are the required proof from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-support-read-model.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-loops-page.test.tsx
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-loop-workflow-packet-contract.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-loop-workflow-packet-contract.md docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md docs/internal/README.md docs/internal/workflow-packets.md docs/ship-by-sunday/design-pack/documentation.md docs/generated/ship-by-sunday-codebase/design-pack/documentation.md
    git diff --check

## Idempotence and Recovery

The implementation is additive. If tests fail because the loops page copy implies execution authority, reduce the copy back to packet-contract language. If broad validation fails in unrelated dirty worktree files, record the exact failure and do not revert unrelated work.

## Artifacts and Notes

The relevant shipped workflows are source-truth readiness, observability/debuggability, and broken-app triage. The contract should describe what they have in common and where future packet migrations should go, not force every existing local artifact to match one JSON schema in this slice.

## Interfaces and Dependencies

This slice depends on the workspace loops read model and UI, existing finding approval packets, local-runner workflow packet writers, internal docs, focused tests, and the active Program packet. It does not depend on external provider setup, GitHub APIs, CI providers, dependency installation, migrations, hosted execution, Convex schema changes, or generated-repo compiler changes.
