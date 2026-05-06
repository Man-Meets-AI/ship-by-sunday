---
program_id: worker-grade-docs-operating-system-adoption
title: Worker-Grade Docs Operating System Adoption
status: active
created_at: 2026-05-06
completed_at: null
summary: Make the local runner install a Worker-grade docs operating system in arbitrary customer codebases, including docs spine, Programs, ExecPlans, validators, scripts, and proof surfaces.
post_build_recap: null
read_when:
  - Extending docs-spine adoption beyond Markdown docs into portable docs scripts, package dependencies, validators, and proof.
  - Deciding how the local runner should install Worker-style Program, ExecPlan, docs-spine, and markdown lint systems in another codebase.
  - Planning the next docs-spine child ExecPlan after the contract-grade docs renderer and Arena proof are already passing.
---

# Worker-Grade Docs Operating System Adoption

This Program is a living initiative document for the larger runner capability that installs a full docs operating system, not just docs files.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The local runner now knows how to scan a mature repo, draft a docs spine, apply approved Markdown under docs roots, and prove the installed docs are strong. That is necessary, but it is not the whole Worker docs experience. Worker also has path-family markdown linting, docs-spine validation, Program and ExecPlan validators, planning scripts, and first-class proof artifacts.

This initiative exists to make that docs operating system portable. A customer should be able to connect the runner to an arbitrary codebase and receive the same shape of durable agent docs setup that exists in `~/Developer/worker`: checked-in Program memory, child ExecPlans, prompt contracts, docs routing, validation commands, and honest blocked proof when the target repo is missing dependencies.

The effort is moving correctly when the runner can install or propose only the portable docs core, resolve same-name conflicts without overwriting owner work, and produce proof that a fresh coding agent can use the repo docs without chat history.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/`.

The primary research input is `track-1-worker-grade-docs-operating-system.md`, which captures the Worker surfaces the user named: path-family markdown linting, docs-spine validation, specialized validators, planning scripts, runtime wrapper scripts, worktree-local runtime state, and proof artifacts. The accepted direction now keeps only the portable docs core in this Program. Runtime installation and Worker-specific operating state are out of scope. The normalized direction is `normalized-track-1.md`. The accepted direction is `converged-decision-packet.md`. Ordering is recorded in `dependency-graph.md` and `plan-split-recommendation.md`. Cross-repo risks are recorded in `cross-repo-review.md`. The current immutable planning brief is `planning-brief-1.md`, and `current-planning-brief.txt` points at that filename.

Completed prerequisite Programs are `docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/program.md` and `docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset/program.md`. Those Programs shipped the docs-only adoption and apply loop, deterministic quality gates, contract-grade Program and ExecPlan rendering, and Arena CRM proof. They intentionally left package scripts, dependencies, CI mutation, root instruction mutation, runtime code installation, and Worker-specific operating state outside scope.

Implementation reference surfaces include `packages/local-runner/src/workflows/docs-spine-adoption/scanner.ts`, `packages/local-runner/src/workflows/docs-spine-adoption/synthesis.ts`, `packages/local-runner/src/core/docs-spine-adoption-workflow.ts`, `packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts`, `docs/internal/workflow-packets.md`, `scripts/programs/`, `scripts/exec-plan/`, `scripts/markdown-metadata/`, and the Worker checkout at `~/Developer/worker`.

## Current State

The current runner slice can generate and apply a Worker-style docs packet. It emits Program and ExecPlan contracts, a complete active Program packet, a first Program-linked child ExecPlan, prompt inventory, validation docs, proof docs, quality-score structure, and instruction routing notes. The apply workflow preserves owner-authored docs with managed sections and replaces only recognized prior docs-spine output on approved targets. The Arena CRM live proof has `qualityScore: 100`, while its native `bun run gate` remains blocked by repo-local missing setup.

The first tooling boundary now exists as a dry-run workflow. `docs-operating-system-adoption` validates `installProfile: worker-grade`, requires a clean worktree before dry-run writes, requires explicit scan and tooling-plan confirmations, writes only `.sbs/runs/<workflow-run-id>/**` and `.sbs/docs-operating-system-adoption/**`, emits a portable install plan, blocks unknown same-name canonical script collisions, and reports runtime or Worker-specific state as out of scope. It does not mutate package scripts, dependencies, wrapper files, lockfiles, docs, root instructions, CI, runtime files, provider setup, or source code.

The first tooling-apply authority now covers package scripts, exact shared tooling dependency metadata, and generated wrappers. `docs-operating-system-package-script-patching` consumes `.sbs/docs-operating-system-adoption/tooling-plan/install-plan.json`, validates the live `package.json` against the dry-run conflict contract, writes only `package.json`, `scripts/sbs-docs/**`, `.sbs/runs/<workflow-run-id>/**`, and `.sbs/docs-operating-system-adoption/tooling-apply/**`, and blocks stale plans or unrecognized same-name canonical scripts before source writes. It does not run package-manager installs, mutate lockfiles, implement shared validator internals, apply docs, edit root instructions, configure CI/providers, touch runtime state, or wire app-stack commands.

The shared validator command surface now exists behind those wrappers. `ship-by-sunday docs-operating-system programs-lint`, `exec-plans-lint`, `markdown-lint`, and `docs-validate` run bundled validator code from the target repo root; `write-child-plan` creates one Program-linked active ExecPlan without overwriting an existing plan; and `docs-refresh-quality` is recognized but explicitly blocked until a later evidence-bound quality refresh workflow exists.

What is still missing is the dependency-install follow-through and lockfile proof behind the package metadata. The runner can install command entries and wrapper files, and the wrappers now call package-owned commands, but package-manager install proof, lockfile refresh, full quality refresh mutation, and native command integration remain later explicit authority slices.

The important boundary is authority. The existing `docs-spine-apply-and-proof` workflow must remain a docs mutation packet. This Program owns the next authority class: a tooling install path that can read package manifests and repo scripts, propose or apply structured package/script/dependency changes, add portable docs validator files, and prove what was installed. Runtime bootstrap, runtime health, `.runtime` state, target-stack process management, CI/provider setup, app-stack command installation, broad root `AGENTS.md` rewrites, and Worker-specific operating state are explicitly out of scope for this Program.

## Progress

- [x] 2026-05-06 EDT: Created this Program packet from the user-provided Worker operating-system inventory and the completed docs-spine quality reset state.
- [x] 2026-05-06 EDT: Separated the completed docs-only apply loop from the still-missing portable docs tooling, script, and validator install work.
- [x] 2026-05-06 EDT: Deferred runtime bootstrap, runtime health, target-stack process wiring, and Worker-specific operating state out of this Program so the next slice stays portable.
- [x] 2026-05-06 EDT: Wrote and completed the first child ExecPlan at `docs/exec-plans/completed/2026-05-06-worker-grade-docs-tooling-install-boundary.md`.
- [x] 2026-05-06 EDT: Implemented the first tooling-install slice behind the distinct `docs-operating-system-adoption` dry-run approval boundary.
- [x] 2026-05-06 EDT: Piloted the resulting install plan against Worker, Ship by Sunday, Arena CRM, and sparse test fixtures.
- [x] 2026-05-06 EDT: Implemented package-script, shared dependency metadata, and wrapper-file patching behind the distinct `docs-operating-system-package-script-patching` tooling-apply authority.
- [x] 2026-05-06 EDT: Implemented the package-owned `ship-by-sunday docs-operating-system` command surface for bundled docs validators and bounded child-plan creation.
- [x] 2026-05-06 EDT: Hardened command and package-script boundaries after review: child-plan paths are normalized and create-only, `bun run <file>` script recognition is blocked, non-string canonical scripts block, invalid install-plan statuses block, and late partial source writes are reported honestly.

## Decision Log

Decision: Keep docs-only apply and tooling install as separate workflows or authority classes.
Rationale: Docs application can be safe with Markdown target refs and managed sections. Package scripts, dependencies, and validator files change how the repo runs and need stronger conflict handling, rollback proof, and explicit confirmation.
Date: 2026-05-06

Decision: Keep this Program to the portable docs core only.
Rationale: Program packets, ExecPlans, prompt contracts, path-family markdown linting, docs-spine validation, planning scripts, and proof artifacts can be generalized. Worker-specific notes, goals, projects, workers, topology, state commands, runtime process management, CI/provider setup, and app-stack commands cannot be treated as universal customer-repo requirements.
Date: 2026-05-06

Decision: Treat same-name files as a first-class conflict state.
Rationale: Generated owned docs can be replaced when recognized as previous runner output, but owner-authored files with the same name must be merged through managed sections, structured patching, or a blocked conflict report. The runner must never silently overwrite a customer file because the filename matches a Worker template.
Date: 2026-05-06

Decision: Make package and dependency changes structured, not text-templated.
Rationale: `package.json`, lockfiles, workspace manifests, and root scripts should be parsed and patched through typed operations. The install proof must name added scripts, added dependencies, unchanged existing scripts, conflicts, and validation commands.
Date: 2026-05-06

Decision: Use `docs-operating-system-adoption` as the canonical top-level workflow ID.
Rationale: The repo has no compatibility need for the existing two-step docs-spine workflow names as the customer-facing long-term interface. A single canonical workflow ID gives the hosted runner, CLI, daemon, approval packet, proof, and future UI one stable product action while still preserving internal phase approvals for docs and tooling.
Date: 2026-05-06

Decision: Build the new workflow on extracted phase services, not by chaining the existing public workflow functions.
Rationale: The existing `docs-spine-adoption` and `docs-spine-apply-and-proof` functions validate their own workflow IDs and packet shapes. Chaining them from a new workflow would require fake sub-packets or CLI-shaped orchestration. Extracted services for scan, docs synthesis, docs apply, install-plan generation, tooling apply, and proof keep the long-term codebase maintainable and let old workflow entry points become thin wrappers or be retired.
Date: 2026-05-06

Decision: Store workflow-specific artifacts under `.sbs/docs-operating-system-adoption/**`.
Rationale: The new workflow is larger than docs spine. Reusing `.sbs/docs-spine-adoption/**` would mix docs drafts, docs apply proof, tooling plans, package-script operations, and validation evidence under a name that no longer describes the work. The run-level entry point remains `.sbs/runs/<workflow-run-id>/proof.json`, while phase artifacts live under `.sbs/docs-operating-system-adoption/`.
Date: 2026-05-06

Decision: Keep `profileName` for execution permissions and add a separate `installProfile` for the operating-system package.
Rationale: Existing runner packets use `profileName` for Codex permission profiles such as `sbs-workspace-write`. The new workflow also needs to express what should be installed, such as `worker-grade` or `core-docs`. Combining those concerns would make approval checks and hosted UI language confusing. The workflow packet should keep `profileName: sbs-workspace-write` and add `installProfile: worker-grade` or another supported install profile.
Date: 2026-05-06

Decision: Use separate phase confirmation flags under the single `docs-operating-system-adoption` workflow.
Rationale: The new workflow spans different authority classes. Scan and plan phases write local `.sbs` artifacts, docs apply writes checked-in docs, and tooling apply can edit package manifests, scripts, and validator files. Separate confirmations let the same workflow run in plan-only, docs-only, or tooling modes without granting broad mutation authority by accident.
Date: 2026-05-06

Decision: Treat `installProfile` values as presets that resolve into explicit modules.
Rationale: Product names such as `worker-grade` are useful at approval and UI level, but the runner needs module-level truth for install planning, skip decisions, conflicts, proof, and partial adoption. `installProfile: worker-grade` should resolve to a concrete module list, and each module should record `already-present`, `installable`, `selected`, `skipped`, `blocked`, or `conflict` in the install plan.
Date: 2026-05-06

Decision: Resolve `worker-grade` into portable docs core modules only.
Rationale: Worker parity for this Program means durable docs memory, planning contracts, prompts, validators, scripts, and proof. Runtime behavior and Worker-like state surfaces are separate product problems. Keeping `worker-grade` to the portable docs core prevents the runner from inventing fake Worker state in arbitrary repos.
Date: 2026-05-06

Decision: Defer runtime and Worker-specific operating state out of this Program.
Rationale: Worker runtime commands route through `scripts/run-runtime.sh` into Worker's own `apps/runtime` package. Worker notes, goals, projects, role docs, topology, and worker-state commands represent Worker-specific operating state. Copying any of that into Arena CRM or another customer repo would be fake or wrong. Shared docs validators, Program and ExecPlan linters, docs-spine checks, planning scripts, and install-plan helpers can move forward now.
Date: 2026-05-06

Decision: Make the first child slice dry-run manifest only.
Rationale: The runner needs to prove it can inspect real repos and produce a deterministic portable docs tooling install plan before it edits `package.json`, lockfiles, or validator files. Package and dependency patching belongs in the next slice after the manifest, conflict states, proof shape, and out-of-scope behavior are tested.
Date: 2026-05-06

Decision: Package shared validators instead of copying Worker validator source into customer repos.
Rationale: Customer repos should receive small checked-in wrappers and package scripts that call a pinned `ship-by-sunday` tooling package. Copying large Worker validator implementations into arbitrary repos would create drift, make updates slow, and blur source-of-truth ownership.
Date: 2026-05-06

Decision: Treat validator script name collisions as blocked or explicitly renamed operations.
Rationale: The canonical portable docs scripts are `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `docs:refresh-quality`, and `program:write-child-plan`. If one of those script names already exists and is not recognized as the same runner-managed command, the install plan must keep it, propose a rename, or block. It must never overwrite a customer script body.
Date: 2026-05-06

Decision: Allow only scoped docs routing edits.
Rationale: Docs navigation belongs to the portable docs core, but broad root `AGENTS.md` rewrites do not. Root docs and instruction files may receive a minimal managed routing section only when an approved docs apply authority covers that target; the tooling install slice must not rewrite root instructions.
Date: 2026-05-06

Decision: Keep `worker-grade` as a quality name, not a Worker clone.
Rationale: The install profile name should communicate the bar: Worker-grade docs memory, plans, prompts, validators, scripts, and proof. In this Program it resolves only to the portable docs core and does not imply Worker runtime, Worker state, app-stack commands, CI/provider setup, or broad instruction rewrites.
Date: 2026-05-06

## Slice Ledger

The first completed child ExecPlan is `docs/exec-plans/completed/2026-05-06-worker-grade-docs-tooling-install-boundary.md`. It carries `program_id: worker-grade-docs-operating-system-adoption` and `planning_brief: docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-1.md`.

The second completed child ExecPlan is `docs/exec-plans/completed/2026-05-06-docs-operating-system-package-script-patching.md`. It carries the same `program_id` and consumes the first child's dry-run install plan.

The third completed child ExecPlan is `docs/exec-plans/completed/2026-05-06-docs-operating-system-shared-validator-commands.md`. It carries the same `program_id` and implements the package-owned command surface that generated wrappers call.

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

The next remaining authority slice is package-manager install proof and lockfile refresh. It should run only an explicitly approved package-manager/install proof path and must preserve the dry-run, package-script, and shared-command conflict contracts.

That child slice must preserve the dry-run and package-script conflict contracts. Same-name scripts with unrecognized bodies stay blocked unless a later approval explicitly chooses a rename or replacement. Runtime bootstrap, Worker-specific state, CI/provider setup, app-stack command wiring, and broad root `AGENTS.md` rewrites remain out of scope.

## Risks and Watchpoints

Do not make every repo pretend it is Worker. The portable install should adapt to each repo's package manager, docs layout, instructions, and native gate.

Do not hide package or dependency changes inside docs-spine apply. The approval prompt, manifest, proof, and rollback notes must make those changes obvious.

Do not include Worker-specific operating state in this Program. Notes, goals, projects, worker role docs, topology, and worker-state commands are out of scope.

Do not overwrite same-name files. Existing owner-authored docs, scripts, or prompts must become managed-section updates, structured patches, or blocked conflicts.

Do not restart runtime work inside this Program. Runtime bootstrap, runtime health, `.runtime` state, and target-stack process management are out of scope until there is a separate runtime-specific design.

Do not install CI/provider setup, customer app-stack commands, or broad root `AGENTS.md` rewrites. Native commands may be discovered for proof, but the runner should not impose a run-the-stack convention in this Program.

Do not call the install complete until a fresh agent can run the documented commands in the target repo or see exact blocked reasons for missing tooling.

## Outcomes & Retrospective

This Program is active. The first shipped outcome is the dry-run install boundary: a customer or operator can ask the local runner for a Worker-grade portable docs tooling plan and see exactly what would be installed, what is already present, what is blocked by owner-defined script names, and what is out of scope. The second shipped outcome is the package-script patching boundary: an approved runner can apply only conflict-free package script, dependency metadata, and wrapper-file operations from that plan while preserving repo ownership and reporting blocked stale/conflicting states. The third shipped outcome is the shared command surface: generated wrappers now call package-owned docs validators and bounded child-plan creation instead of an unknown CLI command. The remaining Program outcome is an approved package-manager and lockfile path that can prove dependency installation without widening into distribution, runtime, or provider setup.

## Validation and Acceptance

Program-level acceptance requires the local runner to support a portable docs operating-system install model with explicit profiles, authority boundaries, conflict handling, and proof. The accepted state should include:

- path-family markdown linting and docs-spine validation installed or explicitly blocked
- Program and ExecPlan lint commands installed or explicitly blocked
- distinct `profileName` and `installProfile` packet fields
- phase confirmation flags for scan, docs apply, tooling plan, and tooling apply
- install profiles resolved into explicit module states
- `worker-grade` resolved into portable docs core modules only
- root script wrappers or equivalent package-manager-specific command wiring
- first-class proof artifacts for install, validation, and blocked native setup
- same-name file conflict behavior covered by tests and proof
- real-repo dry runs against Worker, Ship by Sunday, Arena CRM, and a sparse repo fixture

Validation commands for this Program packet are:

```bash
bun run programs:lint
bun run markdown:lint -- --paths docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption docs/programs/active/index.md
git diff --check
```

Child ExecPlans must add focused local-runner tests for scanner facts, install-plan synthesis, conflict detection, package-script patching, validator installation, proof artifacts, and real-repo dry-run fixtures.

## Artifacts and Notes

The Worker surfaces named by the user are captured as a durable input in `track-1-worker-grade-docs-operating-system.md`.

The working model is:

1. Resolve one approved `docs-operating-system-adoption` workflow run.
2. Write phase artifacts under `.sbs/docs-operating-system-adoption/**` and the run-level proof entry point under `.sbs/runs/<workflow-run-id>/proof.json`.
3. Discover target repo package manager, scripts, deps, docs, instructions, validators, and proof commands.
4. Require `--confirm-docs-operating-system-scan` for local scan artifacts when the phase is enabled.
5. Apply docs-only spine through the docs phase only when `--confirm-docs-operating-system-docs-apply` is present.
6. Produce a structured tooling install plan only when `--confirm-docs-operating-system-tooling-plan` is present.
7. Resolve `installProfile` into explicit module states before any tooling mutation.
8. Apply tooling only when `--confirm-docs-operating-system-tooling-apply` is present.
9. Run validator, docs-spine, and native-gate proof.
10. Record passed, failed, and blocked evidence as files under `.sbs/runs/<workflow-run-id>/`.

## Interfaces and Dependencies

This Program depends on local-runner workflow dispatch, approval packets, `.sbs` run artifacts, docs-spine scanner facts, Program and ExecPlan contracts, markdown metadata linting, package manager detection, package manifest parsing, lockfile behavior, script wrappers, and target repo native gate discovery.

External comparison depends on the Worker checkout at `~/Developer/worker`, the Ship by Sunday checkout, the Arena CRM checkout, and intentionally sparse fixture repos that prove the install does not invent non-core surfaces.

The initial `worker-grade` preset resolves to:

- core modules: `docs-spine`, `programs`, `exec-plans`, `prompts`, `markdown-lint`, `docs-validate`, `planning-scripts`, and `proof-artifacts`

Shared core modules can use a pinned `ship-by-sunday` package plus small checked-in wrappers. Runtime modules and Worker-specific operating-state modules are not part of this Program.
