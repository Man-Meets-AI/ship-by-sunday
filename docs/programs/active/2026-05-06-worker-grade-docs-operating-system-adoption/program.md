---
program_id: worker-grade-docs-operating-system-adoption
title: Worker-Grade Docs Operating System Adoption
status: active
created_at: 2026-05-06
completed_at: null
summary: Make the local runner install a Worker-grade docs operating system in arbitrary customer codebases, including docs spine, Programs, ExecPlans, validators, scripts, runtime bootstrap, and proof surfaces.
post_build_recap: null
read_when:
  - Extending docs-spine adoption beyond Markdown docs into scripts, package dependencies, validators, runtime bootstrap, or specialized operating surfaces.
  - Deciding how the local runner should install Worker-style Program, ExecPlan, docs-spine, markdown lint, and agent legibility systems in another codebase.
  - Planning the next docs-spine child ExecPlan after the contract-grade docs renderer and Arena proof are already passing.
---

# Worker-Grade Docs Operating System Adoption

This Program is a living initiative document for the larger runner capability that installs a full docs operating system, not just docs files.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The local runner now knows how to scan a mature repo, draft a docs spine, apply approved Markdown under docs roots, and prove the installed docs are strong. That is necessary, but it is not the whole Worker experience. Worker also has path-family markdown linting, docs-spine validation, Program and ExecPlan validators, specialized operating-surface validators, root script wrappers, worktree-local runtime bootstrap, runtime health commands, current worker state commands, and first-class proof artifacts.

This initiative exists to make that larger operating system portable. A customer should be able to connect the runner to an arbitrary codebase and receive the same shape of durable agent setup that exists in `~/Developer/worker`: checked-in Program memory, child ExecPlans, prompt contracts, docs routing, validation commands, runtime legibility, and honest blocked proof when the target repo is missing dependencies or chooses not to install an optional module.

The effort is moving correctly when the runner can distinguish portable core requirements from Worker-specific modules, install or propose the right scripts and validator files under explicit authority, resolve same-name conflicts without overwriting owner work, and produce proof that a fresh coding agent can use the repo without chat history.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/`.

The primary research input is `track-1-worker-grade-docs-operating-system.md`, which captures the Worker surfaces the user named: path-family markdown linting, docs-spine validation, specialized validators, runtime wrapper scripts, agent-legibility bootstrap, worktree-local runtime state, and proof artifacts. The normalized direction is `normalized-track-1.md`. The accepted direction is `converged-decision-packet.md`. Ordering is recorded in `dependency-graph.md` and `plan-split-recommendation.md`. Cross-repo risks are recorded in `cross-repo-review.md`. The current immutable planning brief is `planning-brief-1.md`, and `current-planning-brief.txt` points at that filename.

Completed prerequisite Programs are `docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/program.md` and `docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset/program.md`. Those Programs shipped the docs-only adoption and apply loop, deterministic quality gates, contract-grade Program and ExecPlan rendering, and Arena CRM proof. They intentionally left package scripts, dependencies, CI mutation, root instruction mutation, runtime code installation, and specialized operating surfaces outside scope.

Implementation reference surfaces include `packages/local-runner/src/workflows/docs-spine-adoption/scanner.ts`, `packages/local-runner/src/workflows/docs-spine-adoption/synthesis.ts`, `packages/local-runner/src/core/docs-spine-adoption-workflow.ts`, `packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts`, `docs/internal/workflow-packets.md`, `scripts/programs/`, `scripts/exec-plan/`, `scripts/markdown-metadata/`, and the Worker checkout at `~/Developer/worker`.

## Current State

The current runner slice can generate and apply a Worker-style docs packet. It emits Program and ExecPlan contracts, a complete active Program packet, a first Program-linked child ExecPlan, prompt inventory, validation docs, proof docs, quality-score structure, and instruction routing notes. The apply workflow preserves owner-authored docs with managed sections and replaces only recognized prior docs-spine output on approved targets. The Arena CRM live proof has `qualityScore: 100`, while its native `bun run gate` remains blocked by repo-local missing setup.

What is still missing is the operating system behind those docs. The runner does not yet install path-family markdown linting, docs-spine structural validation, Program and ExecPlan script entries, prompt inventory validation, package dependencies, root script wrappers, runtime bootstrap, runtime health commands, worktree-local runtime state, proof artifact commands, or optional Worker-like notes, goals, projects, worker-doc, and topology validators.

The important boundary is authority. The existing `docs-spine-apply-and-proof` workflow must remain a docs mutation packet. This Program owns the next authority class: a tooling and runtime install path that can read package manifests and repo scripts, propose or apply structured package/script/dependency changes, add validator/runtime files, and prove what was installed.

## Progress

- [x] 2026-05-06 EDT: Created this Program packet from the user-provided Worker operating-system inventory and the completed docs-spine quality reset state.
- [x] 2026-05-06 EDT: Separated the completed docs-only apply loop from the still-missing tooling, script, validator, runtime, and optional operating-surface install work.
- [ ] Write the first child ExecPlan from `planning-brief-1.md`.
- [ ] Implement the first tooling-install slice behind a distinct approval boundary.
- [ ] Pilot the resulting install plan against Worker, Ship by Sunday, Arena CRM, and at least one sparse repo fixture.

## Decision Log

Decision: Keep docs-only apply and tooling install as separate workflows or authority classes.
Rationale: Docs application can be safe with Markdown target refs and managed sections. Package scripts, dependencies, runtime wrappers, and validator files change how the repo runs and need stronger conflict handling, rollback proof, and explicit confirmation.
Date: 2026-05-06

Decision: Split the install model into a portable core and optional operating-surface modules.
Rationale: Program packets, ExecPlans, prompt contracts, path-family markdown linting, docs-spine validation, script wrappers, runtime bootstrap, and proof artifacts can be generalized. Worker-specific notes, goals, projects, workers, topology, and state commands should be capability modules so arbitrary repos do not receive fake or irrelevant surfaces.
Date: 2026-05-06

Decision: Treat same-name files as a first-class conflict state.
Rationale: Generated owned docs can be replaced when recognized as previous runner output, but owner-authored files with the same name must be merged through managed sections, structured patching, or a blocked conflict report. The runner must never silently overwrite a customer file because the filename matches a Worker template.
Date: 2026-05-06

Decision: Make package and dependency changes structured, not text-templated.
Rationale: `package.json`, lockfiles, workspace manifests, and root scripts should be parsed and patched through typed operations. The install proof must name added scripts, added dependencies, unchanged existing scripts, conflicts, and validation commands.
Date: 2026-05-06

## Slice Ledger

No active child ExecPlan exists yet for this Program.

The first recommended child ExecPlan should be `docs/exec-plans/active/2026-05-06-worker-grade-docs-tooling-install-boundary.md`. It should carry `program_id: worker-grade-docs-operating-system-adoption` and `planning_brief: docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-1.md`.

Completed prerequisite child ExecPlans from the earlier docs-spine Programs remain useful context:

- `docs/exec-plans/completed/2026-05-05-docs-spine-workflow-bundle-scaffold.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-scanner-and-facts-model.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-codex-synthesis-packets.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-apply-and-proof.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-eval-and-lint-harness.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-source-truth-scanner-repair.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-contract-grade-renderer-synthesis.md`
- `docs/exec-plans/completed/2026-05-06-docs-spine-final-apply-proof-and-arena-acceptance.md`

## Next Slice

The next slice is the tooling-install authority and manifest slice. It should define and implement the first concrete boundary for installing Worker-grade docs operating-system tooling without folding package or runtime mutation into `docs-spine-apply-and-proof`.

That child slice should inventory target scripts and dependencies, emit a structured install plan, classify same-name file conflicts, and prove at least dry-run behavior against Worker, Ship by Sunday, Arena CRM, and sparse fixtures. It may stop before full lockfile mutation if the first slice proves the manifest and conflict contract, but it must not leave the runner pretending docs-only apply is enough.

## Risks and Watchpoints

Do not make every repo pretend it is Worker. The portable install should adapt to each repo's package manager, docs layout, instructions, and native gate.

Do not hide package or dependency changes inside docs-spine apply. The approval prompt, manifest, proof, and rollback notes must make those changes obvious.

Do not treat specialized operating surfaces as universal. Notes, goals, projects, worker role docs, topology, and worker-state commands need explicit opt-in, capability detection, or a selected profile.

Do not overwrite same-name files. Existing owner-authored docs, scripts, prompts, or runtime files must become managed-section updates, structured patches, or blocked conflicts.

Do not call the install complete until a fresh agent can run the documented commands in the target repo or see exact blocked reasons for missing tooling.

## Outcomes & Retrospective

This Program is active. The expected outcome is a runner install path that can bootstrap a Worker-grade docs operating system in customer repos while preserving repo ownership, naming conflicts, package-manager conventions, and native validation semantics.

## Validation and Acceptance

Program-level acceptance requires the local runner to support a portable docs operating-system install model with explicit profiles, authority boundaries, conflict handling, and proof. The accepted state should include:

- path-family markdown linting and docs-spine validation installed or explicitly blocked
- Program and ExecPlan lint commands installed or explicitly blocked
- root script wrappers or equivalent package-manager-specific command wiring
- worktree-local runtime bootstrap and runtime index support where the runtime profile is selected
- first-class proof artifacts for install, validation, runtime health, and blocked native setup
- optional modules for notes, goals, projects, workers, topology, and worker-state commands
- same-name file conflict behavior covered by tests and proof
- real-repo dry runs against Worker, Ship by Sunday, Arena CRM, and a sparse repo fixture

Validation commands for this Program packet are:

```bash
bun run programs:lint
bun run markdown:lint -- --paths docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption docs/programs/active/index.md
git diff --check
```

Child ExecPlans must add focused local-runner tests for scanner facts, install-plan synthesis, conflict detection, package-script patching, validator installation, runtime bootstrap proof, and real-repo dry-run fixtures.

## Artifacts and Notes

The Worker surfaces named by the user are captured as a durable input in `track-1-worker-grade-docs-operating-system.md`.

The working model is:

1. Discover target repo package manager, scripts, deps, docs, instructions, validators, runtime state, and proof commands.
2. Apply docs-only spine through the existing docs workflow.
3. Produce a structured tooling install plan that names script, dependency, validator, runtime, and optional module operations.
4. Apply tooling only with stronger confirmation and same-name conflict handling.
5. Bootstrap runtime state when the runtime profile is selected.
6. Run validator, docs-spine, runtime-health, and native-gate proof.
7. Record passed, failed, and blocked evidence as files under `.sbs/runs/<workflow-run-id>/`.

## Interfaces and Dependencies

This Program depends on local-runner workflow dispatch, approval packets, `.sbs` run artifacts, docs-spine scanner facts, Program and ExecPlan contracts, markdown metadata linting, package manager detection, package manifest parsing, lockfile behavior, script wrappers, runtime bootstrap conventions, and target repo native gate discovery.

External comparison depends on the Worker checkout at `~/Developer/worker`, the Ship by Sunday checkout, the Arena CRM checkout, and intentionally sparse fixture repos that prove the install can degrade honestly when optional surfaces are absent.
