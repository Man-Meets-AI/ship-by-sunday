---
title: Execution Surface Contract Refresh
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Define and expose the consent, storage, proof, source-visibility, and authority boundaries for every Ship by Sunday execution surface before further paid-loop expansion.
post_build_recap: The internal execution-surface contract and workspace privacy UI now name separate authority boundaries for local runner, Codex cloud handoff, managed GitHub, generated repo, and Codex app server without adding new execution.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Implementing or reviewing execution-surface boundaries.
  - Updating workspace privacy, managed GitHub, Codex cloud handoff, generated repo, or Codex app-server behavior.
  - Checking what each execution surface may sync or execute before adding a paid loop.
---

# Execution Surface Contract Refresh

This is a living execution plan for the next Customer Agentic Operating System slice: define the shared execution-surface contract before Ship by Sunday expands any paid-loop execution surface.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday now has several ways a customer might receive codebase work: local runner, Codex cloud handoff, managed GitHub concierge, generated repo delivery, and the existing Codex app-server connection. Without a shared contract, later slices can accidentally grant broader GitHub access, source visibility, command authority, or PR authority than the customer understood. After this slice, operators and customers can inspect the five execution surfaces from durable docs and from `/workspace/privacy`, and each surface will have explicit consent, storage, raw-source, provider, proof, revocation, and sync boundaries.

## Progress

- [x] 2026-05-05 EDT: Read root `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, the active Program, `planning-brief-2.md`, `apps/web/AGENTS.md`, root `DESIGN.md`, and `docs/ship-by-sunday/design-pack/AGENTS.md`.
- [x] 2026-05-05 EDT: Checked official Codex docs through the OpenAI developer docs MCP for Codex cloud GitHub connector setup and short-lived least-privilege GitHub App token behavior.
- [x] 2026-05-05 EDT: Inspected `/workspace/privacy` read-model, panels, page composition, and focused privacy tests.
- [x] Add the shared execution-surface contract doc and index entry.
- [x] Expose the contract in the workspace privacy read model and UI.
- [x] Add focused tests for the five execution-surface rows and forbidden authority claims.
- [x] Update the Program and complete this ExecPlan with validation proof.

## Surprises & Discoveries

Official Codex cloud documentation describes repository connection through the ChatGPT GitHub Connector or Codex GitHub App and says Codex uses short-lived, least-privilege GitHub App installation tokens while respecting existing user repo permissions and branch protections. Ship by Sunday should not present Codex cloud handoff as SBS-owned GitHub access; it is a customer-owned Codex/GitHub connector handoff.

## Decision Log

Decision: Treat this as a contract and visibility slice, not a new execution slice.
Rationale: The Program asks for a shared contract before expanding paid-loop execution surfaces. The smallest safe implementation is durable operator documentation plus a customer-visible privacy summary. GitHub app setup, provider access, branch pushes, PR opening, CI-affecting commands, raw-source sharing, package installs, migrations, and hosted execution remain out of scope.
Date: 2026-05-05

Decision: Keep managed GitHub consent separate from branch, PR, CI, and raw-source action approvals.
Rationale: The existing managed GitHub slice records a premium concierge request packet and audit trail only. A selected-repository request is not permission to push branches, create pull requests, rerun CI, inspect unrestricted source, or share raw source. Those actions need later explicit approvals naming the action and proof boundary.
Date: 2026-05-05

## Outcomes & Retrospective

This slice shipped as a contract refresh, not a new executor. `docs/internal/execution-surfaces.md` now defines the five execution surfaces and their consent, storage, provider, source-visibility, command, PR, proof, revocation, failure, and sync boundaries. `docs/internal/README.md` links to that contract.

The `/workspace/privacy` read model now exposes five execution-surface rows. The page renders them in the existing workspace privacy surface beside runner status, sharing defaults, sync preview, and managed GitHub consent. The copy deliberately avoids execution commands and does not add GitHub setup, provider setup, branch pushes, pull request creation, CI reruns, raw-source sharing, hosted execution, or app-server repair authority.

The Program now records the completed execution-surface contract, marks that Program task complete, adds this completed ExecPlan to the slice ledger, and names `loop-workflow-packet-contract` as the next slice.

## Context and Orientation

The Program-owned next slice is recorded in `docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md`. The current planning brief is `docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`. The relevant customer-facing surface is `/workspace/privacy`, implemented by `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-page.tsx`, `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-panels.tsx`, and `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts`.

The durable operator reference should live under `docs/internal/` because this contract guides future product and provider work. The documentation index is `docs/internal/README.md`.

The five execution surfaces are plain product modes. `local_runner` runs on the customer's machine and syncs only approved structured state. `codex_cloud_handoff` means the customer uses their own Codex cloud and GitHub connector setup, with Ship by Sunday handing off instructions or packet material rather than receiving hidden repo access. `managed_github` is a premium or concierge mode that starts as consent and audit state only, with later action approvals required for off-machine work. `generated_repo` is the generated-codebase delivery lane and does not inspect an existing customer repo. `codex_app_server` is the existing paid-user in-app Codex connection used for generation/account status, not the default existing-codebase repair surface.

### In Scope

Add a durable execution-surface contract doc and make it discoverable from `docs/internal/README.md`. Add a read-model type and static row builder for the five execution surfaces in the workspace privacy model. Render those rows on `/workspace/privacy` in the existing restrained workspace style. Add focused tests that prove the rows name customer consent, storage, command authority, provider access, raw-source visibility, PR authority or lack of PR authority, proof delivery, revocation or failure states, and sync boundaries without introducing action commands.

Update this ExecPlan and the active Program as the slice lands. The Program update must add a progress entry, mark the execution-surface contract task complete, add a completed slice ledger entry, set the next slice, and refresh risks if the boundary changes.

### Out Of Scope

Do not implement package/update-channel mechanics, mature-repo adoption, broad provider access, dependency installs, migrations, branch pushes, pull request creation, CI-affecting commands, raw-log or raw-source sharing, hosted execution, GitHub App installation flow, GitHub token storage, Codex cloud API calls, Codex app-server expansion, or any new executor. Do not change Convex schema or backend mutations unless the read-model contract cannot be represented without it. Do not add secrets or provider configuration.

## Plan of Work

First, document the contract in `docs/internal/execution-surfaces.md` and link it from `docs/internal/README.md`. The doc should name the five surfaces and, for each, state consent, repo access, installation or provider scope, storage policy, command authority, PR authority, raw-source visibility, proof delivery, audit/revocation or failure states, sync boundary, and current setup status. It should state that this slice adds no new external setup.

Second, add a `WorkspaceExecutionSurfaceRow` type and `executionSurfaceRows` field in `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts`. The builder should derive local-runner and managed-GitHub status from the existing runner and managed GitHub state, while keeping the other surfaces as current contract rows. The text must remain concise and must not expose raw local paths or imply immediate branch, PR, CI, provider, or source-sharing authority.

Third, render an `ExecutionSurfacesPanel` in `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-panels.tsx` and add it to `workspace-privacy-page.tsx`. Use the existing panel geometry and neutral workspace styling rather than introducing a new visual system.

Fourth, update focused tests in `apps/web/tests/unit/workspace-support-read-model.test.ts` and `apps/web/tests/integration-ui/workspace-privacy-page.test.tsx`. The tests should assert all five surfaces render and that forbidden claims such as hidden broad GitHub access, branch pushing, pull request creation, CI reruns, and raw source upload do not appear.

Finally, update the Program, move this ExecPlan to `docs/exec-plans/completed/`, and run focused tests followed by the required format, lint, typecheck, plan/program/markdown lint, and diff whitespace gates.

## Milestones

The first milestone is durable contract documentation. At the end, `docs/internal/execution-surfaces.md` explains each surface enough for a later agent to know what it may sync or execute, and `docs/internal/README.md` points to it.

The second milestone is customer-visible surface clarity. At the end, `/workspace/privacy` shows the five surfaces and their current authority boundaries without adding execution buttons or provider setup.

The third milestone is closeout proof. At the end, focused tests and repo gates pass, this plan is completed, and the active Program names the next slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Edit these files:

    docs/internal/execution-surfaces.md
    docs/internal/README.md
    apps/web/app/(workspace)/_lib/workspace-support-read-model.ts
    apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-panels.tsx
    apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-page.tsx
    apps/web/tests/unit/workspace-support-read-model.test.ts
    apps/web/tests/integration-ui/workspace-privacy-page.test.tsx
    docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md
    docs/exec-plans/active/2026-05-05-execution-surface-contract-refresh.md

After implementation, move the plan to:

    docs/exec-plans/completed/2026-05-05-execution-surface-contract-refresh.md

Expected focused proof should include unit and integration UI tests for the privacy read model and page. The broad gates are listed below.

## Validation and Acceptance

Acceptance requires a customer or operator to see a coherent execution-surface contract without relying on chat history. The docs must say what each surface is allowed to sync, what it may execute, who owns provider setup, what storage exists, whether raw source can be visible, whether branch or PR authority exists, how proof is delivered, how revocation or failure works, and what remains forbidden. The `/workspace/privacy` page must summarize those same boundaries for the current workspace.

This slice does not require external setup. If future work enables Codex cloud, managed GitHub execution, or app-server expansion, that later work must document provider setup, env vars, scopes, callbacks, verification, and failure behavior separately.

### Test Commands

These commands are the required proof from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-support-read-model.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-privacy-page.test.tsx
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-execution-surface-contract-refresh.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-execution-surface-contract-refresh.md docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md docs/internal/README.md docs/internal/execution-surfaces.md
    git diff --check

## Idempotence and Recovery

The implementation is additive and should be safe to rerun. If tests fail because copy includes forbidden execution language, tighten the contract text rather than weakening the assertion. If broad validation fails in unrelated dirty files, record the exact limitation and do not revert unrelated work.

## Artifacts and Notes

The official Codex cloud setup reference checked during planning is `https://developers.openai.com/codex/enterprise/admin-setup#connect-codex-cloud-to-repositories`. It says customers connect repositories through the ChatGPT GitHub Connector or Codex GitHub App and that Codex uses short-lived, least-privilege GitHub App installation tokens while respecting user GitHub permissions and branch protections. In this repo, that supports treating Codex cloud handoff as customer-owned connector setup, not hidden SBS GitHub access.

## Interfaces and Dependencies

This slice depends on the workspace privacy read model, workspace privacy UI, existing managed GitHub consent model, internal docs, the active Program packet, and official Codex cloud documentation. It does not depend on GitHub APIs, provider secrets, Codex app-server runtime changes, Convex schema changes, CI services, package managers, migrations, or generated-repo compiler changes.
