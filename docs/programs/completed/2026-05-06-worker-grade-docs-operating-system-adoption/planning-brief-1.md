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

The next implementation slice should create the `docs-operating-system-adoption` workflow and tooling-install authority boundary for the local runner. Do not widen `docs-spine-apply-and-proof` into package, dependency, script, runtime, CI, app-stack command, provider, broad root `AGENTS.md`, or Worker-specific operating-state mutation. Treat `docs-operating-system-adoption` as the long-term customer-facing workflow ID, with internal phase approvals for docs and tooling only.

Extract reusable phase services instead of chaining the existing public workflow functions. The current public functions validate their own workflow IDs and packet shapes, so the maintainable design is to factor shared services for scan, docs synthesis, docs apply, install-plan generation, tooling apply, and proof. The old workflow entry points can become wrappers or be retired after the new workflow proves the full path.

Focus on `packages/local-runner/src/workflows/docs-spine-adoption/`, `packages/local-runner/src/core/docs-spine-adoption-workflow.ts`, `packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts`, `packages/local-runner/src/commands/workflow.ts`, `packages/local-runner/src/commands/daemon.ts`, `packages/local-runner/src/core/workflow-run-api.ts`, `docs/internal/workflow-packets.md`, and the real comparison repos Worker, Ship by Sunday, and Arena CRM.

The child ExecPlan should define a structured install-plan schema. At minimum, the schema should represent portable docs package scripts, dependency requirements, validator files, proof commands, same-name file conflicts, blocked operations, and rollback notes. The plan must be serializable under `.sbs/docs-spine-adoption/` or a new `.sbs/docs-operating-system/` namespace without raw source dumps or local secrets.

Use `.sbs/docs-operating-system-adoption/**` for the new workflow's phase artifacts. Keep `.sbs/runs/<workflow-run-id>/proof.json` as the run-level proof entry point. Do not reuse `.sbs/docs-spine-adoption/**` for tooling evidence.

Keep `profileName` as the execution permission profile and add a distinct `installProfile` field to the approved workflow packet. For the first implementation, expect `profileName: sbs-workspace-write` and `installProfile: worker-grade`.

Treat `installProfile` as a preset that resolves into explicit modules. The first install-plan schema should include `resolvedModules` and a per-module status enum with at least `already-present`, `installable`, `selected`, `skipped`, `blocked`, and `conflict`.

For `installProfile: worker-grade`, resolve the preset into portable docs core modules only: `docs-spine`, `programs`, `exec-plans`, `prompts`, `markdown-lint`, `docs-validate`, `planning-scripts`, and `proof-artifacts`.

Use a hybrid install strategy. Shared core validators and docs operating-system helpers should come from a pinned project-local `ship-by-sunday` package plus small checked-in wrappers. Runtime modules and Worker-specific operating-state modules must not be installed by this slice.

Use phase confirmation flags instead of one broad confirmation. The initial flag names should be:

- `--confirm-docs-operating-system-scan`
- `--confirm-docs-operating-system-docs-apply`
- `--confirm-docs-operating-system-tooling-plan`
- `--confirm-docs-operating-system-tooling-apply`

Only require the flags for phases enabled by the approved packet.

The first implementation is dry-run manifest only. It should not mutate `package.json`, lockfiles, validator files, docs files, or root instruction files. It needs to prove real behavior by inspecting a target repo and producing a deterministic plan that says which portable docs surfaces are already present, which are installable, and which are blocked. Package and dependency patching belongs to the next child slice after the manifest and conflict contract are proven.

The validator source of truth should be a pinned project-local `ship-by-sunday` tooling package plus tiny checked-in wrapper scripts in the target repo. Do not copy large Worker validator source into customer repos.

The canonical portable docs scripts are `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `docs:refresh-quality`, and `program:write-child-plan`. If one of those script names already exists and is not recognized as the same runner-managed command, the dry-run plan should keep it, propose a rename, or block. It must not overwrite the script body.

Same-name behavior must be explicit. Recognized prior runner docs can be replaced. Owner Markdown gets managed sections when safe. Structured files require parsed operations. Package script collisions become keep, rename, replace-with-approval, or blocked operations. Runtime files, Worker-specific operating-state files, app-stack command wiring, CI/provider setup, and broad root `AGENTS.md` rewrites should be reported as out of scope rather than installed or overwritten.

Docs routing edits are limited to scoped docs navigation. Root docs and instruction files may receive a minimal managed routing section only under approved docs apply authority. The tooling install slice must not rewrite root instructions.

Keep `installProfile: worker-grade` as a quality name, not a Worker clone. In this Program it resolves only to the portable docs core and does not imply Worker runtime, Worker state, app-stack commands, CI/provider setup, or broad instruction rewrites.

Acceptance requires focused tests plus real-repo dry-run evals:

```bash
bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts docs-spine-apply-and-proof-workflow.test.ts
SBS_DOCS_SPINE_REAL_REPO_EVAL=1 bun run --cwd packages/local-runner test -- docs-spine-real-repo-eval.test.ts
bun run --cwd packages/local-runner lint
bun run --cwd packages/local-runner typecheck
bun run --cwd packages/local-runner format:check
bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-worker-grade-docs-tooling-install-boundary.md
bun run programs:lint
bun run markdown:lint -- --paths docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/completed/2026-05-06-worker-grade-docs-tooling-install-boundary.md
git diff --check
```

After the child slice lands, update this Program with exact files changed, proof artifacts, real-repo dry-run results, unresolved blockers, and the next recommended slice for package-script patching or portable validator installation.
