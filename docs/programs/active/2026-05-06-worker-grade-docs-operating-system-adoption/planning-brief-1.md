---
title: 'Planning Brief 1: Worker-Grade Docs Tooling Install Boundary'
program_id: worker-grade-docs-operating-system-adoption
brief_version: 1
status: current
summary: Define and implement the first local-runner authority boundary for installing docs operating-system tooling beyond Markdown docs.
read_when:
  - Authoring the first child ExecPlan for Worker-grade docs operating-system adoption.
  - Implementing local-runner install-plan manifests, same-name conflict handling, or package-script dry-run proof.
---

# Planning Brief 1: Worker-Grade Docs Tooling Install Boundary

The next implementation slice should create the tooling-install authority boundary for the local runner. Do not widen `docs-spine-apply-and-proof` into package, dependency, script, runtime, or CI mutation. Keep docs apply as the docs workflow, and add a distinct install-plan surface for the rest of the Worker-grade operating system.

Focus on `packages/local-runner/src/workflows/docs-spine-adoption/`, `packages/local-runner/src/core/docs-spine-adoption-workflow.ts`, `packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts`, `packages/local-runner/src/commands/workflow.ts`, `packages/local-runner/src/commands/daemon.ts`, `docs/internal/workflow-packets.md`, and the real comparison repos Worker, Ship by Sunday, and Arena CRM.

The child ExecPlan should define a structured install-plan schema. At minimum, the schema should represent package scripts, dependency requirements, validator files, runtime wrapper files, optional operating-surface modules, proof commands, same-name file conflicts, blocked operations, and rollback notes. The plan must be serializable under `.sbs/docs-spine-adoption/` or a new `.sbs/docs-operating-system/` namespace without raw source dumps or local secrets.

The first implementation may remain dry-run only for actual package mutation if that is the smallest safe slice. It still needs to prove real behavior: the runner should inspect a target repo and produce a deterministic plan that says which Worker-grade surfaces are already present, which are installable, which are optional, and which are blocked.

Same-name behavior must be explicit. Recognized prior runner docs can be replaced. Owner Markdown gets managed sections when safe. Structured files require parsed operations. Package script collisions become keep, rename, replace-with-approval, or blocked operations. Unknown runtime files block until a later approved operation handles them.

Acceptance requires focused tests plus real-repo dry-run evals:

```bash
bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts docs-spine-apply-and-proof-workflow.test.ts
SBS_DOCS_SPINE_REAL_REPO_EVAL=1 bun run --cwd packages/local-runner test -- docs-spine-real-repo-eval.test.ts
bun run --cwd packages/local-runner lint
bun run --cwd packages/local-runner typecheck
bun run --cwd packages/local-runner format:check
bun run plans:lint -- --plan docs/exec-plans/active/2026-05-06-worker-grade-docs-tooling-install-boundary.md
bun run programs:lint
bun run markdown:lint -- --paths docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/active/2026-05-06-worker-grade-docs-tooling-install-boundary.md
git diff --check
```

After the child slice lands, update this Program with exact files changed, proof artifacts, real-repo dry-run results, unresolved blockers, and the next recommended slice for package-script patching or portable validator installation.
