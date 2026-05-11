---
title: Worker-Grade Docs Operating System Research Track
summary: Research capture for the Worker docs, validation, script, runtime, and specialized operating-surface setup, with non-core surfaces deferred from the current portable docs Program.
docType: program_research
status: active
read_when:
  - Comparing the current docs-only runner output to the full Worker operating surface.
  - Designing the next local-runner install workflow for portable docs scripts and validators.
---

# Worker-Grade Docs Operating System Research Track

## Question

What is still missing if the runner needs to drop into any codebase and create the same usable agent setup that exists in `~/Developer/worker`?

## Findings

The current repaired docs-spine runner has reached the first quality bar: it can create serious docs, Programs, ExecPlans, prompt docs, validation notes, proof notes, and quality-score structure. That is still only the visible docs surface. Worker works because those docs are connected to validators, scripts, and proof commands. Worker also has runtime bootstrap and specialized operating state, but those surfaces are not part of this Program.

Worker's docs system has four main layers beyond the Program and ExecPlan packet itself.

Path-family markdown linting is the generic docs validator. The command is `bun run markdown:lint`. It does not apply one universal frontmatter schema. It resolves each Markdown path into a document family, then applies the schema for that family. Normal docs use `title`, `summary`, `docType`, `status`, and `read_when`. Family-specific surfaces add fields such as `ownerPath`, `workflowId`, `shelfId`, `sourceType`, `buildoutStage`, `topicTags`, or `bodyFormat`. Program packet artifacts are a special case: `program.md` is a Program document, while packet artifacts such as planning briefs and convergence files are handled by `programs:lint` rather than generic markdown lint.

Docs-spine validation is repo-structure validation. The command is `bun run docs:validate`. It checks required docs, required sections such as `## Owns`, `## Does Not Own`, and `## Next`, route correctness from `docs/index.md`, root README and AGENTS routing, stale `.plans/` references, non-empty `docs/references/` files, and generated docs freshness. If generated docs drift, Worker fixes them with `bun run docs:refresh-quality` followed by `bun run docs:validate`.

Specialized operating-surface validators are intentionally separate from generic markdown lint because they validate Worker operating state, not ordinary documentation. Worker examples include `bun run notes:lint` for `workspace/notes/**`, `bun run goals:validate` for `workspace/goals/**`, `bun run projects:validate` for `workspace/projects/**`, `bun run workers:validate` for worker role docs, and `bun run topology:validate` for `system/topology.json`. These are out of scope for the current portable docs Program.

Startup scripts and agent experience are the runtime glue in Worker. Worker root scripts mostly call `scripts/run-runtime.sh`. That wrapper normalizes `PATH`, loads `.env`, loads `.runtime/agent-legibility/bootstrap.env` when present, changes into `apps/runtime`, and runs the runtime package script with Bun. The key commands are `runtime:bootstrap`, `runtime:up`, `runtime:health`, `runtime:down`, `worker-state:current`, and runtime proof commands. These commands are research input only for this Program, not install requirements.

Worker's runtime bootstrap is worktree-local. `runtime:bootstrap` derives a worktree id from repo name and branch or HEAD, creates `.runtime/worktrees/<worktree-id>/`, writes `.runtime/agent-legibility/bootstrap.env`, writes `.runtime/agent-legibility/runtime-index.json`, and exports `ASSISTANT_RUNTIME_ROOT`. Runtime proof writes durable artifacts, logs, screenshots, and reports instead of treating terminal output as the only proof.

The immediate product gap is that the current runner can mention missing portable docs scripts as blocked proof, but it cannot yet install those scripts, add dependencies, or add validator files.

## Same-Name File Behavior

Same-name files are not a small detail. A customer repo may already have `docs/index.md`, `docs/validation.md`, `docs/prompts/README.md`, `scripts/run-runtime.sh`, `package.json` scripts, or validation files with the same names as Worker templates.

The correct behavior depends on ownership:

- recognized prior runner output can be replaced on approved targets
- owner-authored Markdown can receive or refresh a managed section
- owner-authored structured files need parsed patches
- package scripts need explicit add, keep, rename, or conflict operations
- runtime files, Worker-specific state files, CI/provider files, app-stack command wiring, and broad root `AGENTS.md` rewrites are out of scope for this Program and should be reported as deferred

The runner should report conflicts as install-plan facts, not improvise overwrites.

## Recommended Direction

The next Program work should not shove script and dependency mutation into `docs-spine-apply-and-proof`. It should create a stronger tooling-install authority that understands package manifests, script names, dependencies, portable docs validator files, and proof commands.

The model should be profile-based:

- core docs memory: Programs, ExecPlans, prompts, validation docs, proof docs, quality score
- portable validators: markdown family lint, docs-spine validation, Program lint, ExecPlan lint, prompt inventory lint
- proof artifacts: installed command proof, validation proof, blocked native setup proof, and rollback notes

The first child ExecPlan should design and implement the structured install manifest and dry-run proof before validator installation. Runtime installation and Worker-specific operating-state installation should stay out of scope.

## Watchpoints

Do not treat Worker-specific operational state as portable. A customer repo may need Programs and ExecPlans but not Worker role docs, goals, projects, topology, worker-state commands, or runtime process management.

Do not mutate package manifests with string replacement. Package scripts and dependencies must be parsed and patched through deterministic operations.

Do not let generated docs claim commands exist before scripts are installed. Until tooling install lands, missing commands should remain blocked proof.

Do not make proof depend on chat history. The result must be inspectable from checked-in files and `.sbs/runs/<workflow-run-id>/` artifacts.
