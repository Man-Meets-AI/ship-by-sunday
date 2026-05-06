---
title: Docs Operating System Shared Validator Commands
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Add the package-owned docs operating-system command surface that generated wrappers call for shared validation and bounded child-plan creation.
post_build_recap: The local-runner package now exposes the docs operating-system command family used by generated wrappers, with bundled validators, docs validation aggregation, bounded child-plan creation, and explicit quality-refresh blocking.
program_id: worker-grade-docs-operating-system-adoption
planning_brief: docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-1.md
read_when:
  - Resuming shared validator command implementation for docs operating-system adoption.
  - Changing generated wrapper targets under scripts/sbs-docs/.
  - Validating that installed docs scripts call package-owned tooling instead of unknown CLI commands.
---

# Docs Operating System Shared Validator Commands

This document is a living execution plan for the shared command surface behind the generated docs operating-system wrappers.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The previous slice can install root package scripts and small wrapper files under `scripts/sbs-docs/`, but those wrappers call `ship-by-sunday docs-operating-system <subcommand>` and the package does not yet expose that command family. A customer repo that has accepted the tooling patch should be able to run the installed docs validation commands and receive real bundled validation behavior, not an unknown command error.

After this slice, the local-runner package owns a `docs-operating-system` CLI command with the subcommands named by `packages/local-runner/src/workflows/docs-operating-system-adoption/manifest.ts`. The read-only validators run from the target repository root and reuse the repo's canonical Program, ExecPlan, and Markdown validators through bundled package code. The `program:write-child-plan` wrapper gets a bounded file creation command that resolves `current-planning-brief.txt` once and writes one Program-linked ExecPlan skeleton without overwriting existing files. Package-manager installs, lockfile refresh, cURL or package distribution setup, runtime bootstrap, CI/provider setup, app-stack command wiring, and Worker-specific state stay outside this slice.

## Progress

- [x] 2026-05-06 EDT: Read root `AGENTS.md`, `docs/index.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, the owning Program, the completed package-script patching ExecPlan, generated wrapper manifest, current CLI dispatcher, and root validator scripts before coding.
- [x] 2026-05-06 EDT: Added the active ExecPlan for the bounded shared validator command slice.
- [x] 2026-05-06 EDT: Implemented `ship-by-sunday docs-operating-system` command dispatch, bundled validator calls, `docs-validate`, explicit quality-refresh blocking, and create-only child-plan writing.
- [x] 2026-05-06 EDT: Added focused command and CLI-help tests covering markdown lint, ExecPlan lint, failing aggregate docs validation, child-plan creation, overwrite refusal, and quality-refresh blocking.
- [x] 2026-05-06 EDT: Updated durable workflow packet docs and the owning Program, then ran focused local-runner and docs validation.
- [x] 2026-05-06 EDT: Fixed review findings in the completed slice: path traversal is rejected for child-plan creation, child plans use atomic create-only writes, unsafe `bun run <file>` script recognition is blocked, non-string scripts and invalid install-plan statuses block before mutation, and late partial write failure proof reports touched refs.

## Surprises & Discoveries

The package-script patching slice already writes all six wrapper files, so this slice must use the exact existing subcommand names instead of inventing a narrower command vocabulary.

The repository references `docs:validate` as a docs operating-system aggregate, but the root package currently has no `docs:validate` script. This slice implements the aggregate in the shared package command instead of adding a root app script.

`program:write-child-plan` has no existing executable implementation. This slice gives it the smallest useful behavior: create one Program-linked ExecPlan skeleton from an existing active Program packet and refuse to overwrite an existing plan.

The ExecPlan linter trims subsection bodies before detecting runnable commands. A `### Test Commands` subsection whose first content is only an indented command does not satisfy the linter, so this plan and generated child-plan skeletons use bullet commands in that subsection.

Review found that `validatePlanPath` was too broad for create-only child plans because it accepted traversal segments under the active ExecPlan prefix. The command now requires a normalized dated slug directly under `docs/exec-plans/active/`, resolves the target under that root, and writes with `flag: "wx"`.

Review also found that `bun run scripts/...` command bodies can be shadowed by package scripts. Existing script recognition now accepts only command-exact `bun <file>` forms for portable docs tooling.

## Decision Log

Decision: Split shared validator command implementation from package-manager install and lockfile refresh.
Rationale: The user explicitly clarified that distribution mechanics are later, and package-manager writes are a separate authority class. The wrappers can become executable and testable now without running dependency installs or changing lockfiles.
Date: 2026-05-06

Decision: Reuse the repository validator modules through the bundled local-runner package instead of copying validator source into customer repos.
Rationale: The Program already chose package-owned validators. Generated customer repos should keep tiny wrappers while the `ship-by-sunday` package remains the source of truth for Program, ExecPlan, and Markdown validation behavior.
Date: 2026-05-06

Decision: Make `write-child-plan` an explicit create-only command.
Rationale: Creating a child ExecPlan is useful docs operating-system behavior, but overwriting or rewriting plans would be a larger planning workflow. A create-only command with required `--program-id`, `--plan`, `--title`, and `--summary` arguments is bounded and recoverable.
Date: 2026-05-06

Decision: Leave evidence-bound quality-score mutation outside this slice.
Rationale: `docs:refresh-quality` implies quality evidence updates, and this repository's quality-score contract says numeric scoring needs a separate evidence-bound audit. This slice may give the subcommand an explicit blocked message, but it must not invent score evidence or mutate `docs/QUALITY_SCORE.md`.
Date: 2026-05-06

## Outcomes & Retrospective

This slice is complete. `packages/local-runner/src/commands/docs-operating-system.ts` now exposes the exact wrapper command family through `ship-by-sunday docs-operating-system ...`. `programs-lint`, `exec-plans-lint`, and `markdown-lint` reuse the bundled root validator modules; `docs-validate` aggregates Markdown, Program, and active ExecPlan validation from the selected target repo root; `write-child-plan` creates one Program-linked active ExecPlan skeleton after resolving the immutable planning brief; and `docs-refresh-quality` returns an explicit blocked message until an evidence-bound quality refresh workflow exists.

The CLI help now lists the command family, and `bun build` proves the imported validator modules bundle into the local-runner CLI. Review hardening added stricter active-plan path containment, atomic child-plan creation, safer package-script recognition, runtime install-plan status validation, live non-string script blocking, and truthful blocked proof when a late source write failure leaves partial approved refs. Remaining work is package-manager install proof and lockfile refresh, plus a later quality-refresh workflow if quality evidence mutation becomes part of the portable docs core.

## Context and Orientation

The generated wrappers are produced by `packages/local-runner/src/workflows/docs-operating-system-adoption/package-script-patching.ts`. Each wrapper calls the `ship-by-sunday` binary with a `docs-operating-system` subcommand defined in `packages/local-runner/src/workflows/docs-operating-system-adoption/manifest.ts`. The current CLI entry point is `packages/local-runner/src/cli.ts`, which dispatches top-level commands such as `workflow`, `daemon`, and `doctor-pass`, but not `docs-operating-system`.

The reusable validators already live in root script modules. `scripts/exec-plan/run-lint.ts` exports `runExecPlanLint`. `scripts/markdown-metadata/lint.ts` exports Markdown linting and formatting helpers. Program linting is composed from `scripts/programs/frontmatter-lint.ts`, `scripts/programs/prompt-contract.ts`, and the shared Markdown metadata linter. Those modules should be imported by the package command and bundled by the local-runner build; they should not be copied into generated customer repos.

### In Scope

This slice adds a package command under `packages/local-runner/src/commands/` and wires it through `packages/local-runner/src/cli.ts`. It implements `programs-lint`, `exec-plans-lint`, `markdown-lint`, `docs-validate`, and `write-child-plan` with focused tests under `packages/local-runner/tests/`. It updates the CLI help, workflow packet docs, the owning Program, and this ExecPlan as behavior changes.

### Out Of Scope

This slice does not run package-manager installs, update lockfiles, change package distribution, publish the runner, add cURL or npx setup, mutate CI or provider settings, edit runtime code, create `.runtime`, install Worker notes/goals/projects/workers/topology, add worker-state commands, wire customer app-stack commands, rewrite root `AGENTS.md`, or change the already-landed package-script dry-run and conflict contracts. It does not implement evidence-bound quality-score mutation.

## Plan of Work

Add `packages/local-runner/src/commands/docs-operating-system.ts` as the command boundary. It should parse an optional `--repo <path>` flag for tests and direct operator use, default to `process.cwd()`, then dispatch the exact subcommands from the wrapper manifest.

Implement `programs-lint` by composing the same three checks as `scripts/programs/run-lint.ts`: Markdown metadata under `docs/programs`, Program packet structure, and Program prompt contract. Implement `exec-plans-lint` by reusing `parseLintCommandArgs` and `runExecPlanLint`, preserving the existing `--plan` and `--paths` contract. Implement `markdown-lint` by reusing `lintMarkdownMetadata` and `formatMarkdownMetadataLintReports`, preserving `--paths` and `--format text|json`. Implement `docs-validate` as an aggregate that runs Markdown metadata lint for `docs`, Program lint, and active ExecPlan lint when active plans exist. All validator outputs should be human-readable by default and return exit code `1` on validation failure.

Implement `write-child-plan` as a create-only command. It should require `--program-id`, `--plan`, `--title`, and `--summary`, validate the plan path with the ExecPlan path rules, resolve the Program's immutable planning brief through `current-planning-brief.txt`, refuse to overwrite an existing file, create the target directory if needed, and write a valid active ExecPlan skeleton with `program_id` and `planning_brief` frontmatter.

Wire the command into `packages/local-runner/src/cli.ts` and update `packages/local-runner/tests/cli-help.test.ts`. Add focused command tests that create temporary target repositories or directories, run the command functions directly, and assert exit codes, output, and file creation behavior. Update `docs/internal/workflow-packets.md` so the wrapper contract says the wrappers now call bundled package commands rather than placeholder commands.

## Milestones

Milestone one is command dispatch. At the end, `runCli(["docs-operating-system", "--help"])` prints the shared command family, unknown docs operating-system subcommands fail clearly, and generated wrapper subcommand names are all recognized.

Milestone two is read-only validation. At the end, focused tests prove `markdown-lint` and `exec-plans-lint` can pass on minimal valid fixtures, `docs-validate` returns a failing exit code on an invalid docs fixture, and validation output does not require root package scripts in the target repo.

Milestone three is bounded child-plan creation. At the end, `write-child-plan` writes one Program-linked active ExecPlan skeleton with the immutable `planning_brief` path and refuses to overwrite an existing target.

Milestone four is durable documentation and validation. At the end, the owning Program and workflow packet docs describe the new command surface and the next remaining slice, and focused local-runner plus docs lint checks pass.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Inspect the current wrapper and command surfaces:

    sed -n '1,260p' packages/local-runner/src/workflows/docs-operating-system-adoption/manifest.ts
    sed -n '400,480p' packages/local-runner/src/workflows/docs-operating-system-adoption/package-script-patching.ts
    sed -n '1,140p' packages/local-runner/src/cli.ts

Add and wire the command:

    packages/local-runner/src/commands/docs-operating-system.ts
    packages/local-runner/src/cli.ts

Add or update focused tests:

    packages/local-runner/tests/docs-operating-system-command.test.ts
    packages/local-runner/tests/cli-help.test.ts

Update durable docs after behavior exists:

    docs/internal/workflow-packets.md
    docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/program.md
    docs/exec-plans/completed/2026-05-06-docs-operating-system-shared-validator-commands.md

## Validation and Acceptance

Acceptance requires the generated wrapper command family to be executable through the local-runner package command surface. `programs-lint`, `exec-plans-lint`, `markdown-lint`, and `docs-validate` must run package-owned validators from the selected target repo root and return nonzero exit codes on failed validation. `write-child-plan` must create a valid Program-linked ExecPlan skeleton only when all required arguments and Program packet state are present, and it must refuse to overwrite an existing plan.

The CLI help must list the new command family. The implementation must not run dependency installs, mutate lockfiles, reach provider APIs, inspect runtime state, or require the target repo to already define root scripts such as `docs:validate`.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

- bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts cli-help.test.ts
- bun run --cwd packages/local-runner test
- bun run --cwd packages/local-runner lint
- bun run --cwd packages/local-runner typecheck
- bun run --cwd packages/local-runner format:check
- bun run --cwd packages/local-runner build
- bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-docs-operating-system-shared-validator-commands.md
- bun run programs:lint
- bun run markdown:lint -- --paths docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/completed/2026-05-06-docs-operating-system-shared-validator-commands.md docs/internal/workflow-packets.md
- git diff --check

## Idempotence and Recovery

Read-only validator commands are safe to rerun because they do not mutate target files. `write-child-plan` is intentionally not idempotent over an existing target file: it refuses to overwrite and tells the operator which plan already exists. Recovery from a mistaken child-plan creation is ordinary Git review of the new file and deletion or revert before committing.

If command validation fails after partial implementation, keep the command file and tests in place, update this plan's Progress and Surprises sections with the failure, then repair the implementation before widening scope.

## Artifacts and Notes

The expected wrapper command names are:

    ship-by-sunday docs-operating-system programs-lint
    ship-by-sunday docs-operating-system exec-plans-lint
    ship-by-sunday docs-operating-system markdown-lint
    ship-by-sunday docs-operating-system docs-validate
    ship-by-sunday docs-operating-system docs-refresh-quality
    ship-by-sunday docs-operating-system write-child-plan

The expected `write-child-plan` shape is:

    ship-by-sunday docs-operating-system write-child-plan --program-id <program-id> --plan docs/exec-plans/active/YYYY-MM-DD-slice.md --title "Slice Title" --summary "One sentence."

Validation evidence from implementation:

    bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts cli-help.test.ts
    Test Files  2 passed (2)
    Tests  6 passed (6)

    bun run --cwd packages/local-runner test
    Test Files  22 passed | 2 skipped (24)
    Tests  118 passed | 7 skipped (125)

    bun run --cwd packages/local-runner build
    Bundled 133 modules

## Interfaces and Dependencies

This slice depends on Bun's ability to bundle imported TypeScript modules into `packages/local-runner/dist/cli.js`, the existing root validator modules under `scripts/`, the generated wrapper command names in `packages/local-runner/src/workflows/docs-operating-system-adoption/manifest.ts`, and the ExecPlan and Program contracts under `docs/exec-plans/PLANS.md` and `docs/programs/PROGRAMS.md`.

The new public TypeScript boundary should expose `runDocsOperatingSystemCommand` from `packages/local-runner/src/commands/docs-operating-system.ts` so tests can call the command without spawning a separate process.
