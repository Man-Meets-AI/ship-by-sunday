---
title: Managed GitHub Run Phase
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Add the premium managed GitHub consent and audit boundary so off-machine execution cannot begin without explicit repository scope, PR authority, storage, raw-source, proof, and revocation terms.
post_build_recap: Added Convex managed GitHub consent and audit state, `/workspace/privacy` concierge request and revocation controls, operator setup docs, and focused validation without adding GitHub API calls or off-machine execution.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Resuming managed GitHub Run-phase work.
  - Checking off-machine execution consent, storage, raw-source, or PR boundaries.
  - Validating concierge GitHub execution readiness.
---

# Managed GitHub Run Phase

This document is a living execution plan for the managed GitHub Run-phase slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The existing-codebase product now supports local Crawl, Walk, and Work through a privacy-forward runner. Managed GitHub is the higher-trust Run-phase path for customers who want Ship by Sunday to coordinate work off their machine. This slice makes that mode visible but bounded: a customer can request concierge managed GitHub only after seeing repository scope, installation scope, storage policy, PR authority, audit logging, revocation, raw-source visibility, and proof boundaries. Nothing in this slice silently installs broad GitHub access, pushes branches, opens pull requests, runs CI-affecting commands, or shares raw source.

## Progress

- [x] 2026-05-04 local: Read `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, the active Program, `current-planning-brief.txt`, `planning-brief-2.md`, app instructions, release workflow, design guidance, security docs, Convex guidelines, and the relevant Next.js App Router docs before editing.
- [x] 2026-05-04 local: Confirmed the Program's current next slice is `managed-github-run-phase` and that local runner, doctor pass, findings, first workflow, support surfaces, Work phase, and broken-app rescue are already marked complete in the dirty working tree.
- [x] 2026-05-04 local: Implemented `managedGithubExecutionConsents` and `managedGithubAuditEvents` with request, state, and revocation functions in the workspace Convex contract.
- [x] 2026-05-04 local: Updated `/workspace/privacy` to render the managed GitHub concierge request packet with selected-repository access, installation scope, storage policy, PR authority, audit log, revocation, raw-source visibility, and proof boundaries.
- [x] 2026-05-04 local: Added `docs/internal/managed-github-execution.md` to document future GitHub App setup, environment ownership, values, verification, and failure states.
- [x] 2026-05-04 local: Added focused backend, read-model, and integration UI tests for consent, audit, revocation, GitHub-only enforcement, and privacy-page actions.
- [x] 2026-05-04 local: Focused validation passed for managed GitHub unit tests, privacy UI, app lint, and app typecheck. Broad repo validation is recorded in `Validation and Acceptance`.
- [x] 2026-05-05 local: Ran the remaining root and docs gates. Format, lint, typecheck, plan lint, program lint, markdown metadata lint, and whitespace validation all passed.

## Surprises & Discoveries

- 2026-05-04 local: `bunx convex codegen` initially failed because the existing `workflowRuns` index name for project, finding document, workflow, status, and created time was over Convex's 64-character identifier limit. The follow-up fix renamed that index to `by_project_finding_workflow_status_created_at`, updated call sites and tests, and `bunx convex codegen` now passes.

## Decision Log

Decision: Ship managed GitHub as a consent and concierge request boundary first, not as an execution bridge.
Rationale: The Program says managed GitHub is premium or concierge and must name access, storage, PR authority, audit, revocation, raw-source, and proof boundaries before use. Implementing consent state and audit logging first prevents the UI from implying off-machine automation can start silently.
Date: 2026-05-04

## Outcomes & Retrospective

This plan is complete. The app now stores a sync-safe managed GitHub consent request, renders the scope and boundaries in `/workspace/privacy`, records audit entries for request and revocation, documents the future GitHub App setup, and tests prove that no PR, push, CI command, workflow run, or raw-source sharing is triggered by the request.

The important product boundary is that managed GitHub is still a concierge request, not execution. A customer can request or revoke the packet, but the current code does not call GitHub, store provider tokens, clone repositories, push branches, open PRs, rerun CI, or share raw source. Future execution needs a separate integration slice with provider setup and a second customer approval for the exact branch, PR, CI, or source-sharing action.

## Context and Orientation

The current existing-codebase workspace lives under protected `/workspace/*` routes in `apps/web/app/(workspace)/workspace/`. Workspace state is stored in Convex through `apps/web/convex/workspace.ts`, with table validators in `apps/web/convex/workspace/validators.ts` and handlers in `apps/web/convex/workspace/model.ts`. The privacy surface is `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-page.tsx`, driven by `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts`.

Managed GitHub is an execution surface, not the default local runner. In this slice it means a customer-visible consent packet and audit trail. It does not mean a GitHub App install callback, GitHub token storage, repository cloning, branch pushing, PR opening, or CI execution. A future operator or app integration can use the consent packet only after the external GitHub App setup exists and the customer has approved the exact repository and authority.

### In Scope

This slice includes a Convex-backed managed GitHub consent request for one workspace project, one selected GitHub repository binding, fixed single-repository installation scope, fixed storage policy, fixed PR authority rules, fixed raw-source visibility rules, fixed proof boundaries, an append-only audit trail for request and revocation, `/workspace/privacy` UI for the scope and actions, and operator documentation for the future GitHub App setup required before the request can become executable.

### Out Of Scope

This slice does not create or install a GitHub App, store GitHub tokens, call GitHub APIs, clone repositories, push branches, open pull requests, run GitHub Actions, rerun CI, share raw source, stream raw logs, expose Codex transcripts, create provider secrets, add background hosted workers, or replace the local runner path. It also does not create public SKU or checkout changes for managed GitHub.

## Plan of Work

First, add the managed GitHub data contract. Extend the workspace validators and schema with a `managedGithubExecutionConsents` table and a `managedGithubAuditEvents` table. The consent record should store only sync-safe metadata: project id, repository binding id, status, consent version, selected-repository scope, storage policy, PR authority, raw-source visibility, proof boundary, requested-at metadata, and revoked-at metadata. The audit event should record request and revocation events without raw source or secrets.

Next, expose narrow Convex functions. Add a viewer-owned query for the managed GitHub state, a mutation to request a consent packet for the selected active GitHub repository binding, and a mutation to revoke a requested or approved packet. The request mutation must fail unless the repository binding provider is `github`. It must create an audit entry and must not create or update workflow runs.

Then update the privacy read model and UI. `/workspace/privacy` should replace the disabled managed GitHub note with a concise concierge panel showing repository access, installation scope, storage policy, PR authority, audit log, revocation, raw-source visibility, and proof boundaries. The action should request concierge review when no active consent exists and revoke the request when one exists. Copy must say that execution still requires operator follow-up and customer approval before any branch, PR, CI, or raw-source action.

After that, add operator documentation in `docs/internal/managed-github-execution.md`. It should document the future GitHub App or token setup exactly: what to create, where, single-repository scope, required permissions, environment ownership, where values would go, how to verify it, and what failure looks like when missing. It should also state that this slice adds no external setup requirement until the feature is enabled operationally.

Finally, add focused tests and validation. Unit tests should prove consent state, audit entries, revocation, GitHub-only repository enforcement, and read-model copy. Integration UI tests should prove the privacy page shows all managed GitHub boundaries and calls request or revoke mutations without PR or CI controls.

## Milestones

The first milestone is backend consent state. It is complete when Convex handlers can request and revoke managed GitHub consent for a GitHub repository binding, audit both actions, and reject non-GitHub repositories.

The second milestone is privacy UI. It is complete when `/workspace/privacy` renders the managed GitHub scope and consent controls without any push, PR-open, CI-run, or raw-source sharing action.

The third milestone is documentation. It is complete when operator docs define the GitHub App setup and explicitly say no external provider values are required by this implementation until managed execution is operationally enabled.

The fourth milestone is validation and Program writeback. It is complete when tests and repo gates pass, this ExecPlan is moved to `completed/`, and the Program ledger and next slice are current.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the current implementation surfaces:

    rg -n "managedGithub|managed GitHub|WorkspacePrivacyPage|workspace-support-read-model" apps/web/convex apps/web/app apps/web/tests support-codebases.md

Run focused tests after backend and model edits:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-managed-github.test.ts tests/unit/workspace-support-read-model.test.ts

Run focused UI validation after the privacy page changes:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-privacy-page.test.tsx

Before completion, run the full command list in `Validation and Acceptance`.

## Validation and Acceptance

Acceptance requires that managed GitHub appears as a premium or concierge request, not a default execution path. The customer must see the selected repository, single-repository installation scope, storage policy, PR authority, audit log, revocation path, raw-source visibility, and proof boundaries before requesting it. Request and revocation must be recorded in Convex with sync-safe audit events. The implementation must not call GitHub, store GitHub tokens, create workflow runs, push branches, open PRs, run CI-affecting commands, or share raw source.

### Test Commands

Validation evidence from 2026-05-04 local:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-managed-github.test.ts tests/unit/workspace-support-read-model.test.ts
    Test Files 2 passed; Tests 8 passed.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-privacy-page.test.tsx
    Test Files 1 passed; Tests 1 passed.

    bun run format
    Passed.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Passed and included `/workspace/privacy` in the production route manifest.

Additional validation evidence from 2026-05-05 local:

    bun lint
    Passed.

    bun typecheck
    Passed and built the Next.js app route manifest, including `/workspace/privacy`.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-managed-github-run-phase.md
    Passed.

    bun run programs:lint
    Passed.

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-managed-github-run-phase.md docs/programs/active/2026-05-02-customer-agentic-operating-system docs/internal/managed-github-execution.md support-codebases.md
    Passed.

    git diff --check
    Passed.

Follow-up validation after review fixes:

    bunx convex codegen
    Passed after renaming the overlong `workflowRuns` index.

    bun run --cwd apps/web test:unit -- tests/unit/workspace-managed-github.test.ts tests/unit/workspace-support-read-model.test.ts tests/unit/workspace-runner-events.test.ts tests/unit/workspace-findings-read-model.test.ts
    Test Files 4 passed; Tests 34 passed.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-privacy-page.test.tsx
    Test Files 1 passed; Tests 1 passed.

## Idempotence and Recovery

Requesting managed GitHub consent is idempotent for the latest non-revoked consent on a project. Re-requesting should return the existing consent instead of creating duplicate authority. Revocation is safe to repeat in effect: once revoked, managed GitHub stays non-executable until the customer requests a new packet. Audit entries are append-only and sync-safe.

If validation fails, fix the narrow failing surface and rerun that command before broad gates. Do not revert unrelated dirty worktree changes. If a future implementation adds GitHub API calls, it must create a separate ExecPlan because that changes provider setup, token storage, and proof boundaries.

## Artifacts and Notes

The local command `date +%F` returned `2026-05-04`, so this plan uses the local repo date in its filename and front matter.

Implemented files include `apps/web/convex/schema.ts`, `apps/web/convex/workspace.ts`, `apps/web/convex/workspace/model.ts`, `apps/web/convex/workspace/validators.ts`, `apps/web/app/(workspace)/workspace/privacy/page.tsx`, `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts`, `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-page.tsx`, `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-privacy-panels.tsx`, `apps/web/app/(workspace)/_components/existing-codebase-support/use-workspace-privacy-actions.ts`, `apps/web/tests/unit/workspace-managed-github.test.ts`, `apps/web/tests/unit/workspace-support-read-model.test.ts`, `apps/web/tests/integration-ui/workspace-privacy-page.test.tsx`, `docs/internal/managed-github-execution.md`, `support-codebases.md`, and this Program packet.

## Interfaces and Dependencies

This slice depends on Clerk-authenticated existing-codebase access, Convex workspace project and repository bindings, the protected `/workspace/privacy` route, and the current local-runner privacy contract. It deliberately does not depend on GitHub API credentials or a configured GitHub App at runtime.
