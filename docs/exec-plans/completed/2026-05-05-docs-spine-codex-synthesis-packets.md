---
title: Docs Spine Codex Synthesis Packets
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Generate bounded local Codex synthesis packets from docs-spine scanner facts without applying customer docs.
post_build_recap: Added local Codex synthesis packet and draft artifacts under .sbs/docs-spine-adoption/drafts without model calls or docs application.
program_id: docs-spine-adoption-operating-loop
planning_brief: docs/programs/active/2026-05-05-docs-spine-adoption-operating-loop/planning-brief-3.md
read_when:
  - Implementing Codex synthesis packets for docs-spine adoption.
  - Updating docs-spine draft artifact contracts.
---

# Docs Spine Codex Synthesis Packets

This ExecPlan tracks the third Docs Spine Adoption Operating Loop slice: turn deterministic scanner facts into bounded local Codex synthesis packets and draft artifact contracts.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The scanner slice gives the workflow sync-safe facts. The next step is to prepare local draft packets that a later Codex synthesis/apply loop can use without rereading raw source, scripts, logs, or chat history.

After this slice, `docs-spine-adoption` should write structured synthesis packets and draft placeholders under `.sbs/docs-spine-adoption/drafts/**`. It should still not apply Markdown docs to the customer repo.

## Progress

- [x] 2026-05-05: Created this ExecPlan from `planning-brief-3.md`.
- [x] 2026-05-05: Read the scanner workflow, manifest, schemas, tests, and Program before editing.
- [x] 2026-05-05: Added local synthesis packet and draft artifact refs.
- [x] 2026-05-05: Generated bounded draft artifacts for docs index, Program, ExecPlan, agent instructions, prompts, validation/proof notes, quality-score notes, and parity checklist.
- [x] 2026-05-05: Added privacy tests proving raw source, package script bodies, logs, local paths, and transcripts are not included.
- [x] 2026-05-05: Updated Program/docs with validation evidence.

## Surprises & Discoveries

The synthesis slice can stay deterministic: it emits packet and draft contracts for local Codex use rather than calling a model. This keeps the controller as authority owner and gives the later apply slice stable JSON inputs.

The next recommendation should now be `docs-spine-apply-and-proof`, because scanner facts and local draft packet contracts are both present.

## Decision Log

Decision: Do not call an external model in this slice.
Rationale: This slice should define deterministic local packet and draft contracts. Actual Codex generation and file application need separate authority and proof.
Date: 2026-05-05

## Outcomes & Retrospective

Complete. The docs-spine workflow now writes bounded local synthesis artifacts under `.sbs/docs-spine-adoption/drafts/**`.

The primary implementation is `packages/local-runner/src/workflows/docs-spine-adoption/synthesis.ts`, wired through `packages/local-runner/src/core/docs-spine-adoption-workflow.ts`. The workflow now creates `codex-synthesis-packet.json`, draft artifacts for docs index, Program, ExecPlan, agent instructions, prompt assets, validation/proof notes, quality-score notes, and parity checklist, and includes those refs in proof and sync preview metadata.

The slice does not call OpenAI/Codex APIs, apply Markdown docs, mutate root docs, mutate package scripts, mutate CI, set up providers, push branches, open PRs, or touch Arena CRM.

Validation evidence:

    bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts workflow-run-api.test.ts cli-help.test.ts
    bun run --cwd apps/web test:unit -- workspace-findings-read-model.test.ts workspace-runner-events.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bunx oxlint -c .oxlintrc.json --deny-warnings apps/web/app/\(workspace\)/_lib/workspace-findings-read-model.ts apps/web/convex/workspace/model.ts apps/web/tests/unit/workspace-findings-read-model.test.ts apps/web/tests/unit/workspace-runner-events.test.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-docs-spine-codex-synthesis-packets.md
    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner build
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-05-docs-spine-adoption-operating-loop docs/exec-plans/completed/2026-05-05-docs-spine-codex-synthesis-packets.md docs/internal/workflow-packets.md docs/programs/README.md docs/programs/active/index.md
    git diff --check

## Context and Orientation

The docs-spine workflow runner is `packages/local-runner/src/core/docs-spine-adoption-workflow.ts`.

The workflow-local scanner and schemas live under `packages/local-runner/src/workflows/docs-spine-adoption/`.

The owning Program is `docs/programs/active/2026-05-05-docs-spine-adoption-operating-loop/program.md`; this slice was built from `planning-brief-3.md`.

### In Scope

Add local draft artifacts under `.sbs/docs-spine-adoption/drafts/**`:

    .sbs/docs-spine-adoption/drafts/codex-synthesis-packet.json
    .sbs/docs-spine-adoption/drafts/docs-index-draft.json
    .sbs/docs-spine-adoption/drafts/program-packet-draft.json
    .sbs/docs-spine-adoption/drafts/exec-plan-draft.json
    .sbs/docs-spine-adoption/drafts/agent-instructions-draft.json
    .sbs/docs-spine-adoption/drafts/prompt-assets-draft.json
    .sbs/docs-spine-adoption/drafts/validation-proof-notes.json
    .sbs/docs-spine-adoption/drafts/quality-score-notes.json
    .sbs/docs-spine-adoption/drafts/parity-checklist-draft.json

Use scanner artifact refs and bounded scanner facts as inputs. Store target repo-relative paths, missing surface ids, artifact refs, blocked reasons, and apply readiness. Avoid raw source, script bodies, dependency versions, logs, transcripts, and local absolute paths.

### Out Of Scope

Do not call OpenAI/Codex APIs. Do not apply Markdown docs. Do not mutate root docs, agent instructions, package scripts, CI, providers, dependencies, lockfiles, branches, pull requests, or Arena CRM.

## Plan of Work

Add synthesis artifact refs and schema types. Implement a workflow-local synthesis module that consumes scanner artifacts and emits draft packet JSON.

Wire the synthesis module into `runDocsSpineAdoptionWorkflow` after scanner facts and before proof. Include draft refs in proof and sync preview metadata.

Update tests to assert every draft artifact exists and does not include raw script bodies or secret-like fixture values.

## Milestones

The first milestone is draft contract definition. It is complete when manifest refs and schema types include the synthesis packet and draft families.

The second milestone is local draft generation. It is complete when the workflow writes every draft artifact under the approved `.sbs` draft root.

The third milestone is validation. It is complete when focused tests and planning lint pass.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the current scanner surfaces:

    rg -n "DocsSpine|docs-spine-adoption|drafts" packages/local-runner docs/programs/active/2026-05-05-docs-spine-adoption-operating-loop

Implement the synthesis packet generator under `packages/local-runner/src/workflows/docs-spine-adoption/`, then wire it into the runner.

Run focused validation and update this ExecPlan plus the Program.

## Validation and Acceptance

Acceptance requires local-runner tests proving every draft artifact is written under `.sbs/docs-spine-adoption/drafts/**`, proof includes draft refs, and privacy exclusions hold.

### Test Commands

    bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts workflow-run-api.test.ts cli-help.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-docs-spine-codex-synthesis-packets.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-05-docs-spine-adoption-operating-loop docs/exec-plans/completed/2026-05-05-docs-spine-codex-synthesis-packets.md
    git diff --check

## Idempotence and Recovery

Draft artifacts should be overwritten for the same workflow run. If required scanner artifacts are missing, write blocked draft metadata rather than widening reads.

## Artifacts and Notes

The primary implementation artifact should be `packages/local-runner/src/workflows/docs-spine-adoption/synthesis.ts`.

Draft artifacts are inputs for the later apply-and-proof slice, not customer repo docs.

## Interfaces and Dependencies

This slice depends on local scanner artifacts, local `.sbs` writes, manifest refs, schema types, and workflow proof.

It does not depend on OpenAI/Codex APIs, provider credentials, package installs, CI, branch remotes, pull requests, or Arena CRM.
