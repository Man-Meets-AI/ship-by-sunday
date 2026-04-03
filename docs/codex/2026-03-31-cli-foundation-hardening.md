---
summary: "ExecPlan for hardening the Ship by Sunday CLI's trust boundaries so project-root pathing, read-only inspection, draft persistence, destructive generation, and user-facing failures behave intentionally. The slice stays inside the existing command surface and focuses on correctness and stability before any release or visual work."
read_when: "Open this when you need to implement or verify the CLI foundation hardening slice for packages/ship-by-sunday-cli."
plan_status: "not_done"
---

# Harden Ship by Sunday CLI trust boundaries

This document is a living execution plan for hardening the Ship by Sunday CLI so a human or agent can trust where it writes, what it mutates, what `--force` can delete, and how failures are reported. It is written so a fresh coding agent can implement the slice end to end without prior chat context, and it must be updated as work progresses.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this slice, someone using the Ship by Sunday CLI should be able to trust five things that are not reliable enough today. First, local draft files and relative output paths should resolve from the caller's intended project root rather than from the repository that happens to contain the CLI source. Second, read-only inspection commands such as `next` and `validate` should not silently create draft state. Third, interrupted or crashed writes should not leave a half-written `draft.json` behind. Fourth, `generate --force` should only replace the generated artifact it is responsible for, not an entire parent directory. Fifth, parse failures, missing draft state, user cancellation, and predictable file-system problems should surface as stable CLI errors instead of raw internal messages.

This matters because the CLI already exists and its current surface looks trustworthy, but several code paths can still create state, delete too much, or report ambiguous failures under normal use. A human should be able to prove the hardening by running the real CLI entrypoint from a temporary project directory, seeing `.ship-by-sunday/draft.json` land in that temporary directory, seeing `next --json` fail with a stable `missing_draft` error instead of creating state, interrupting `resume` with `Ctrl+C` and getting a deliberate cancellation message, and forcing `generate` without losing unrelated files beside the Blueprint folder.

## Progress

- [x] 2026-03-31 11:03 EDT — Read `/Users/parkerrex/.agents/docs/prompts/exec-plan-writer.md`, `/Users/parkerrex/Projects/ship-by-sunday/AGENTS.md`, `/Users/parkerrex/Projects/ship-by-sunday/docs/codex/PLANS.md`, and the `long-horizon` skill instructions, then inspected the real CLI entrypoint, draft store, generate path, error normalization, root blueprint script, README notes, and existing tests before freezing this plan.
- [x] 2026-03-31 11:03 EDT — Ran safe baseline checks against the current surface: `bun run sbs --help`, `bun run sbs review --json`, `bun run sbs init --fixture nope --json`, an immediate `Ctrl+C` probe on `bun run sbs resume`, and `bun run --cwd packages/ship-by-sunday-cli test`.
- [x] 2026-03-31 11:07 EDT — Grilled the plan against the live CLI code, reran `bun run sbs --help` and `cd packages/ship-by-sunday-cli && bun run test`, and locally verified that `bun run --cwd ...` leaves `process.env.INIT_CWD` unset in this Bun version. Updated the plan in place to remove that bad assumption and to make the root-script fix explicit.
- [x] 2026-03-31 11:52 EDT — Milestone 1: split caller project root from source install root and rename the ambiguous CLI `repoRootPath` plumbing. The root `sbs` script now executes `packages/ship-by-sunday-cli/src/cli.ts` directly, the CLI defaults to `process.cwd()` for local project state, and the blueprint suite plus a temporary-project real-entrypoint walkthrough both proved the draft and dry-run output anchor to the caller’s directory.
- [x] 2026-03-31 11:54 EDT — Milestone 2: make read-only draft inspection truly read-only and give missing-draft cases one stable contract. `next`, `validate`, and `review` now fail with the same `missing_draft` contract in an empty temp project without creating `.ship-by-sunday/`, and the blueprint suite plus direct CLI smoke both confirmed that behavior.
- [x] 2026-03-31 11:56 EDT — Milestone 3: make draft persistence atomic, same-directory, and recoverable after interrupted writes. `saveLocalDraft()` now writes through `draft.json.tmp`, `loadLocalDraft()` promotes a valid temp file when the final draft is missing, and the blueprint suite proves temp-only recovery, final-file precedence, and corrupt-temp failure.
- [x] 2026-03-31 11:58 EDT — Milestone 4: harden directory and zip generation so `--force` only replaces the intended artifact target. Directory generation now targets `path.join(outPath, repoName)` instead of deleting the whole container, zip generation rejects directory targets with `invalid_state`, and the blueprint suite covers sibling-file preservation plus wrong-type failures.
- [ ] 2026-03-31 11:03 EDT — Milestone 5: normalize expected CLI failures and interactive cancellation into stable human and JSON errors.
- [ ] 2026-03-31 11:03 EDT — Milestone 6: add targeted blueprint-local and real-entrypoint tests, then update the minimal README safety notes.

## Surprises & Discoveries

The CLI currently has one overloaded root concept where it really needs two. `packages/ship-by-sunday-cli/src/run-cli.ts` defaults its `repoRootPath` to `resolveRepoRootPath()` from `@manmeetsai/blueprint-compiler/server`, and the root `package.json` script runs the CLI through `bun run --cwd packages/ship-by-sunday-cli sbs`. That means the CLI source tree, the blueprint-compiler asset tree, and the caller's intended project root are all being conflated into the same value. The code works for this monorepo's happy path, but it is the wrong abstraction for local draft files and user-supplied relative paths.

One root-path assumption from the first draft of this plan is now explicitly ruled out by local evidence. A temporary blueprint run on 2026-03-31 showed that `bun run --cwd ...` leaves `process.env.INIT_CWD` as `null` in this environment, so the CLI cannot rely on Bun to preserve the caller's original directory through the existing root script. The implementation plan therefore needs to change the root `package.json` `sbs` wrapper so it stops changing cwd, then let the CLI derive `projectRootPath` from plain `process.cwd()` while continuing to resolve blueprint-compiler assets from the source install root.

The current read-only story is inconsistent. `packages/ship-by-sunday-cli/src/commands/next-command.ts` and `packages/ship-by-sunday-cli/src/commands/validate-command.ts` both call `ensureLocalDraft()`, so they create `.ship-by-sunday/draft.json` as a side effect. `packages/ship-by-sunday-cli/src/commands/review-command.ts` does not auto-create, but it throws a raw `Error` when no draft exists. `export` reads the existing draft without auto-init, but its behavior is not described as part of a single safety model.

That inconsistency is now resolved for the read-only surfaces in scope. `next`, `validate`, and `review` all use one helper that loads an existing draft and throws the same `missing_draft` CLI error when none exists, which keeps the JSON contract stable and prevents accidental draft creation in inspection-only commands.

All draft mutations flow through one persistence boundary, which is good for leverage and bad for current safety. `packages/ship-by-sunday-cli/src/draft/draft-store.ts` owns `saveLocalDraft()`, `importDraftFromFile()`, the field mutation helpers, `applyDraftMutations()`, and `applyDraftPatchFromFile()`. Today `saveLocalDraft()` uses a direct `writeFile()` to the final path, so a crash or interruption can leave a truncated `draft.json`, and load logic has no recovery branch for a partially completed save.

That safety gap is now closed with a small temp-file convention. The store writes to `draft.json.tmp` in the same directory, then renames it into `draft.json` only after the file is flushed and closed. If a final draft is missing and a valid temp draft is present, the loader now promotes it into place instead of failing or starting over.

The destructive generate path is narrower than it first looks, but it is still too broad. In directory mode, `packages/ship-by-sunday-cli/src/commands/generate-command.ts` writes the Blueprint inside `outPath/<repoName>`, yet `--force` currently deletes `outPath` itself with `rm(absoluteOutPath, { recursive: true, force: true })`. That can wipe unrelated files sitting beside the Blueprint slug. Zip mode only targets the exact file path, but its type and overwrite failures still bubble through generic error handling.

That destructive boundary is now narrower. Directory generation only removes the repo slug at `path.join(outPath, repoName)` when `--force` is present, so sibling files in the container path survive. Zip generation now treats a directory target as an invalid state instead of trying to force-write through it.

The current error contract already leaks two user-visible instability signals. `parseCliCommand()` throws a raw `Error` for an unknown `init --fixture` value, so `bun run sbs init --fixture nope --json` currently returns `error_code: "unknown"` instead of `invalid_args`. An immediate `Ctrl+C` during `bun run sbs resume` exits with a bare `^C` and no structured CLI message. Both behaviors were confirmed from the real `bun run sbs` entrypoint rather than from direct `runCli()` calls.

Milestone 1 also surfaced one extra mismatch that mattered at runtime: after the command-layer rename, `handleInitCommand()` and `handleGenerateCommand()` still had object properties named `repoRootPath`, so the first direct temp-directory proof returned `undefined` path errors until those property names were aligned with `projectRootPath`. The blueprint suite caught that quickly, which is why the renamed boundary is now covered by a real-entrypoint smoke as well as direct command tests.

The existing blueprint tests are useful but not yet aimed at these trust boundaries. `packages/ship-by-sunday-cli/tests/*.test.ts` currently drive `runCli()` directly with injected roots, and the blueprint suite passes with 20 tests. There is no spawned real-entrypoint test that proves caller-root anchoring, missing-draft read-only behavior, or stable cancellation from the actual CLI process.

## Decision Log

Decision: introduce two explicit roots in the CLI layer, `projectRootPath` and `sourceInstallRootPath`, and stop using one ambiguous `repoRootPath` name for both jobs. Rationale: the blueprint compiler still needs a source-install root so it can read starter files and prompt assets from this repository, but the CLI's local draft and relative `--file` and `--out` paths must anchor to the caller's intended project root. Date/Author: 2026-03-31 / Codex

Decision: derive `projectRootPath` from plain `process.cwd()` inside the CLI, and change the repository-root `package.json` `sbs` script from `bun run --cwd packages/ship-by-sunday-cli sbs` to direct file execution such as `bun packages/ship-by-sunday-cli/src/cli.ts`. Rationale: local verification on 2026-03-31 showed that `bun run --cwd ...` does not populate `INIT_CWD` here, so the only grounded way to preserve the caller's project root through the documented root wrapper is to stop changing cwd in that wrapper. `resolveRepoRootPath()` remains the source-install-root mechanism for blueprint-compiler assets. Date/Author: 2026-03-31 / Codex

Decision: preserve the existing command surface and the current JSON envelope shape instead of adding new commands, new config flags, or a second draft format. Rationale: the slice is about correctness and trust, not widening the product surface. The user explicitly asked to preserve the existing agent-friendly JSON command model. Date/Author: 2026-03-31 / Codex

Decision: treat `next`, `validate`, `review`, and draft-export reads as read-only with respect to `.ship-by-sunday/draft.json`, and make `missing_draft` the deliberate outcome when that state does not exist. Rationale: these commands are inspection surfaces. Silent draft creation makes the CLI harder to reason about and defeats the user's requested safety model. `resume`, `stage`, `init`, `import`, and mutation commands remain the explicit write paths. Date/Author: 2026-03-31 / Codex

Decision: centralize the no-draft path in a single `requireLocalDraft()` helper instead of repeating the error in each command. Rationale: the read-only commands need one stable message and one stable exit code, and a shared helper keeps `next`, `validate`, `review`, and `export` aligned without duplicating the contract text in multiple files. Date/Author: 2026-03-31 / Codex

Decision: implement draft persistence as same-directory temp write plus rename, and teach load logic how to recover or intentionally fail when it sees temp-file leftovers. Rationale: this is the smallest viable change that prevents truncated final files and gives interrupted writes a predictable recovery story without introducing a database or multi-file journal. Date/Author: 2026-03-31 / Codex

Decision: use a single stable temp filename, `draft.json.tmp`, instead of generating a new random temp name on each save. Rationale: the CLI only needs one recovery target, and a stable name makes load-time promotion and test coverage straightforward without introducing a temp-file scan. Date/Author: 2026-03-31 / Codex

Decision: in directory mode, treat `--out` as a container path and scope `--force` replacement to `path.join(outPath, repoName)` only; in zip mode, scope `--force` to the exact output file only. Rationale: the README already says directory output creates a slugified repo folder inside the target path, so the destructive boundary should match that contract instead of deleting the whole container directory. Date/Author: 2026-03-31 / Codex

Decision: classify the final output target before writing and refuse wrong-type paths with `invalid_state`. Rationale: a directory output path that is actually a file or a zip output path that is actually a directory is an operator error with a stable recovery path, not a generic overwrite situation. Date/Author: 2026-03-31 / Codex

Decision: normalize predictable local file-system boundary failures into path-specific CLI errors instead of leaking raw Node error strings. Rationale: this slice explicitly promises trustworthy write and delete behavior. Wrong-type output targets, unreadable draft files, failed same-directory renames, and permission-denied writes should all surface through the existing CLI error envelope with stable messages that name the affected path. Reuse `already_exists`, `missing_draft`, `invalid_args`, and `cancelled` where they already fit, and use `invalid_state` for remaining draft or output-path boundary failures. Date/Author: 2026-03-31 / Codex

Decision: add a new stable `cancelled` CLI error with exit code `130`, and remove raw `throw new Error(...)` from expected user-facing failure paths. Rationale: an interrupted interactive prompt is not an internal crash. It is a first-class CLI outcome and should be reported as such in both human and JSON modes. Date/Author: 2026-03-31 / Codex

Decision: keep this slice repository-native and additive instead of copying Mole's implementation details. Rationale: the CLI already has the right shape for this repo. The hardening should improve the existing draft store, generate path, and error model rather than introducing a parallel architecture. Date/Author: 2026-03-31 / Codex

## Outcomes & Retrospective

This plan is not implemented yet. When it is complete, the diff should stay concentrated in `packages/ship-by-sunday-cli/`, the repository root `package.json`, and a minimal `README.md` update that explains the new safety model. Success is not “the tests still pass”; success is a temporary project directory proving that the real CLI entrypoint writes its draft and dry-run output metadata into the caller's project root, that read-only commands leave no draft behind, and that `generate --force` only replaces the Blueprint slug or the target zip file.

The main known implementation risk is the root-wrapper cwd handoff. The grill resolved one false branch already: Bun is not supplying `INIT_CWD` here. The plan now resolves the remaining risk by changing the root `sbs` wrapper so it no longer mutates cwd, keeping `projectRootPath` equal to `process.cwd()` inside the CLI, and still requiring a real-entrypoint proof path in validation. If the direct-entrypoint proof or the root-wrapper smoke do not pass, the slice is not complete even if injected `runCli()` tests do.

## Context and Orientation

The user-facing entrypoint begins at the repository root `package.json`, where the `sbs` script is currently `bun run --cwd packages/ship-by-sunday-cli sbs`. That wrapper hands off to `packages/ship-by-sunday-cli/src/cli.ts`, which prints the banner and delegates to `packages/ship-by-sunday-cli/src/run-cli.ts`. `run-cli.ts` parses argv, dispatches command handlers, and normalizes errors before choosing the final exit code. Because local verification showed Bun does not provide `INIT_CWD` through this wrapper in the current environment, Milestone 1 must change the root `sbs` script to direct file execution from the repo root so `process.cwd()` can become the trustworthy caller-project-root signal.

Inside the CLI blueprint, `packages/ship-by-sunday-cli/src/draft/draft-paths.ts` defines the `.ship-by-sunday/` directory and `draft.json` file names. `packages/ship-by-sunday-cli/src/draft/draft-store.ts` is the real persistence boundary. It resolves relative input and output paths, reads stdin for `-`, loads and saves the draft, imports and exports JSON, and applies field or patch mutations. If this slice leaves duplicated write logic outside this file, it will be easier to regress again.

The current command surfaces split cleanly into read and write categories. `schema`, `stages`, and `fields` are pure blueprint-contract introspection. `next` and `validate` are intended as read-only blueprint-state introspection but currently call `ensureLocalDraft()`. `review` already loads without auto-init, but its missing-draft case is not normalized. `resume`, `stage`, `init`, `import`, `apply`, `mutate`, and the field mutation commands are explicit write paths. `generate` is read-only with respect to the draft, but it is destructive with respect to the chosen artifact output path.

`packages/ship-by-sunday-cli/src/commands/generate-command.ts` is the only path that crosses from CLI-local state into generated starter artifacts. It loads the draft, checks review readiness through `deriveStageStatus()`, converts the draft into a canonical project definition, and then calls `buildReviewDownloadZip()`, `buildRepoGenerationManifest()`, and `materializeRepoSnapshot()` from `@manmeetsai/blueprint-compiler/server`. The Blueprint directory is written to a temporary directory first, but the destructive preflight still removes the entire `--out` container path.

The blueprint compiler already has its own legitimate root semantics, and this slice must not break them. `packages/blueprint-compiler/src/repo-root.ts` exports `resolveRepoRootPath()`, which walks upward from the compiler source tree until it finds the repository markers needed to load starter files and prompt assets. `packages/blueprint-compiler/tests/repo-root.test.ts` already proves that template loading and repo snapshot generation still work even when `process.cwd()` is somewhere else. That behavior should remain source-install-root behavior, not be repurposed into caller-project-root behavior.

The current error model lives in `packages/ship-by-sunday-cli/src/cli-errors.ts`. `CliErrorCode` currently includes `already_exists`, `invalid_args`, `invalid_input`, `invalid_patch`, `invalid_stage`, `invalid_state`, `missing_draft`, `not_review_ready`, and `unknown`. `normalizeCliError()` only special-cases existing `CliError` objects and raw `SyntaxError`, so any expected failure that still throws `new Error(...)` collapses into `unknown`. The new hardening work should stay inside this model rather than inventing a separate error protocol. In this plan, that means adding `cancelled`, removing raw `Error` throws from predictable branches, and introducing one tiny helper for known `NodeJS.ErrnoException` cases so draft and output-path boundary failures become stable CLI messages that name the path involved.

The existing test surface is concentrated in `packages/ship-by-sunday-cli/tests/`. `draft-store.test.ts` covers import and export basics, `generate-command.test.ts` covers incomplete-draft gating and overwrite refusal, `review-command.test.ts` covers a normal readiness response, `stage-command.test.ts` covers routing, `agent-workflows.test.ts` covers happy-path JSON automation, and `cli-help.test.ts` covers help and unknown commands. None of these tests currently spawn the real CLI process.

In this plan, “caller project root” means the directory the user expects the CLI to operate on, where `.ship-by-sunday/` should live and where relative `--file` and `--out` arguments should resolve. “Source install root” means the repository that contains the CLI code, prompt assets, and starter repo source contract. Both concepts are valid in this repo, but they must no longer share one variable name or one code path.

## Plan of Work

Start by fixing naming and root semantics, because every other safeguard depends on that distinction. Change the repository-root `package.json` `sbs` script so it executes `packages/ship-by-sunday-cli/src/cli.ts` without `--cwd`, then introduce one explicit CLI helper that derives `projectRootPath` from `process.cwd()`, thread that value through `runCli()` and the command handlers, and rename the current `repoRootPath` plumbing anywhere it actually means caller project root. Keep `packages/blueprint-compiler/src/repo-root.ts` as the source-install-root behavior for starter assets and prompt files; the CLI still needs that distinction, but it should no longer use the blueprint-compiler root to decide where `.ship-by-sunday/` lives.

Once the roots are separated, make the CLI honest about when it writes local draft state. Replace `ensureLocalDraft()` in `next` and `validate` with a load-only path, normalize the missing-draft experience for `review` so it stops throwing a raw `Error`, and keep the explicit write behaviors limited to `resume`, `stage`, `init`, `import`, `apply`, `mutate`, and the field mutation commands. This is the place to make the no-draft messages point users at `init`, `import`, or `resume` without widening the command set.

After read-only behavior is fixed, strengthen the shared draft store so every mutation path inherits atomic persistence automatically. The write path should create the hidden directory if needed, write the next draft to a same-directory temporary file, flush and close that file, and rename it into place. The load path should look for the final file first, then intentionally handle leftover temp files so interrupted writes either recover safely or fail with a stable `invalid_state` message that names the recovery path.

Only then harden destructive generation. Keep the existing repo generation contract and slugified folder shape, but make directory mode treat `--out` as a container directory rather than as the thing to delete wholesale. Compute `repoName` before any destructive step, classify the output target before any removal, and make the directory write path stage a temporary repo directory that is renamed into `path.join(absoluteOutPath, repoName)` so sibling files in the container survive. Zip mode should stay simpler and only replace the exact target file when `--force` is present.

With mutation and deletion boundaries fixed, normalize the remaining user-facing failures. Remove raw `throw new Error(...)` from predictable parse or command-state branches, add `cancelled` to the CLI error union, wrap the interactive prompt so `Ctrl+C` returns a stable human message and JSON error instead of a bare `^C`, and classify representative local filesystem errors like `EISDIR`, `ENOTDIR`, `EACCES`, and `EPERM` into path-specific `invalid_state` messages at the draft and generate boundaries. Keep unexpected programmer faults under `unknown`; the goal of this slice is to eliminate expected operational ambiguity, not to hide every possible bug.

Finish by adding tests at the right two levels. Keep the existing blueprint-local `runCli()` tests for narrow behavior, add targeted storage and generate tests where that logic is easiest to isolate, and add at least one spawned real-entrypoint test that runs the actual CLI process from a temporary project directory. Update the root `README.md` only as much as needed to explain the new safety model around project-root anchoring, missing-draft read-only behavior, atomic draft writes, and scoped `--force`.

## Milestones

### Milestone 1: Separate caller project root from source install root

At the end of this milestone, the CLI has one explicit `projectRootPath` for local draft state and user-relative paths, blueprint-compiler retains its own `sourceInstallRootPath` behavior for starter assets and prompt files, and the repository-root `sbs` wrapper no longer changes cwd before calling the CLI. The files touched should include the repository-root `package.json`, `packages/ship-by-sunday-cli/src/run-cli.ts`, the command handler signatures under `packages/ship-by-sunday-cli/src/commands/`, `packages/ship-by-sunday-cli/src/draft/draft-paths.ts`, `packages/ship-by-sunday-cli/src/draft/draft-store.ts`, and one small new helper module under `packages/ship-by-sunday-cli/src/` if the root-derivation logic needs a home of its own.

Run the blueprint tests after the rename, then prove the caller-root behavior from a temporary project directory by executing the real CLI entrypoint with an absolute path to `packages/ship-by-sunday-cli/src/cli.ts`. Also prove the wrapper fix statically by showing the root `package.json` `sbs` script no longer contains `--cwd packages/ship-by-sunday-cli`. Success looks like `init --fixture complete --json` returning a `draftFilePath` under the temporary project directory, `generate --dry-run --json` reporting an output path under that same directory, and blueprint-compiler still resolving its own templates and starter files correctly from the source repository.

### Milestone 2: Make read-only inspection truly read-only

At the end of this milestone, `next`, `validate`, `review`, and draft-export reads do not create `.ship-by-sunday/draft.json`. When no draft exists, they return the existing `missing_draft` code with one stable human message and one stable JSON message. `resume`, `stage`, and the explicit mutation paths keep their current authority to initialize or update the draft.

The main files here are `packages/ship-by-sunday-cli/src/commands/next-command.ts`, `packages/ship-by-sunday-cli/src/commands/validate-command.ts`, `packages/ship-by-sunday-cli/src/commands/review-command.ts`, and the load helpers in `packages/ship-by-sunday-cli/src/draft/draft-store.ts`. Run the blueprint tests plus a temporary-project real-entrypoint exercise where `next --json` and `validate --json` are invoked before any draft exists. Success looks like exit code `4`, `error_code: "missing_draft"`, and no `.ship-by-sunday/` directory left behind.

### Milestone 3: Make draft persistence atomic and recoverable

At the end of this milestone, every draft mutation path uses the same atomic write helper, and an interrupted write no longer leaves a half-written final `draft.json`. The new persistence behavior should stay small and boring: same-directory temp file, flush, close, rename, and then intentional load-time handling if a temp file is left behind.

The main files are `packages/ship-by-sunday-cli/src/draft/draft-paths.ts`, `packages/ship-by-sunday-cli/src/draft/draft-store.ts`, and the tests that simulate interrupted writes under `packages/ship-by-sunday-cli/tests/`. Run blueprint-local tests that cover temp-only recovery, stale-temp-with-final precedence, and invalid temp-file behavior. Success looks like a valid temp file being recoverable when no final file exists, a valid final file winning when both exist, and a corrupt leftover temp file producing a stable `invalid_state` message instead of a raw JSON parse failure.

### Milestone 4: Scope destructive generate behavior to the real artifact target

At the end of this milestone, directory generation treats `--out` as a container directory and only replaces `path.join(outPath, repoName)` when `--force` is present. It must never recursively delete the whole container path just to replace the Blueprint slug. The concrete write shape should be: compute `repoName`, ensure the container directory exists, stage a temporary repo directory beside the final slug target, then rename that temporary repo directory into the slug target. Zip generation should only replace the exact file path when `--force` is present and should produce intentional messages when the existing target is the wrong file type.

The main file is `packages/ship-by-sunday-cli/src/commands/generate-command.ts`, with supporting test updates in `packages/ship-by-sunday-cli/tests/generate-command.test.ts`. Run the generate test file plus a temporary-project real-entrypoint dry run and one actual directory generation where an unrelated sibling file sits next to the generated slug directory. Success looks like the sibling file surviving `generate --force` while the Blueprint slug is replaced cleanly.

### Milestone 5: Normalize user-facing failures and cancellation

At the end of this milestone, expected user-facing failures no longer leak raw internal errors. Invalid fixture values should return `invalid_args`, missing draft paths should return `missing_draft`, interrupted interactive prompts should return `cancelled`, corrupt or unreadable local draft state should return `invalid_state` with recovery guidance, and representative local output-path failures such as “directory output path is actually a file” or “zip target path is actually a directory” should return stable path-specific `invalid_state` messages. The JSON envelope stays the same shape as today; only the stability of `error_code`, `message`, and `exitCode` improves.

The main files are `packages/ship-by-sunday-cli/src/cli-errors.ts`, `packages/ship-by-sunday-cli/src/parse-cli-command.ts`, `packages/ship-by-sunday-cli/src/commands/review-command.ts`, `packages/ship-by-sunday-cli/src/commands/resume-command.ts`, `packages/ship-by-sunday-cli/src/prompts/prompt-stage.ts`, `packages/ship-by-sunday-cli/src/draft/draft-store.ts`, and `packages/ship-by-sunday-cli/src/commands/generate-command.ts`. Run spawned tests for invalid fixture handling, representative wrong-type output targets, and interactive cancellation, plus one manual `Ctrl+C` check from the real CLI entrypoint. Success looks like the CLI printing a short cancellation message such as “Cancelled. Previous answers remain saved.” and exiting `130` instead of leaving a bare `^C`.

### Milestone 6: Defend the new safety model with tests and minimal docs

At the end of this milestone, the hardening behavior is locked in by blueprint-local tests and one real-entrypoint test path, and the root `README.md` explains only the safety model changes that a user needs to know. The docs update should stay small: where the draft lives, which commands remain read-only, what happens during interrupted saves, and what `generate --force` is allowed to replace.

The files touched should include whichever test files are extended under `packages/ship-by-sunday-cli/tests/`, one new spawned-entrypoint test file if needed, and the CLI section of `README.md`. Run `bun run test`, `bun run typecheck`, `bun run lint`, and `bun run format:check` from `packages/ship-by-sunday-cli`, then run `bun run sbs --help` from the repository root and one temporary-project real-entrypoint walkthrough. Success looks like both the narrow blueprint checks and the real-entrypoint proof passing without widening the command surface.

## Concrete Steps

Work from the repository root unless a step says otherwise.

Begin by re-confirming the current trust-boundary hotspots before editing:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ rg -n "resolveRepoRootPath|ensureLocalDraft|throw new Error|rm\\(|\"sbs\"" package.json packages/ship-by-sunday-cli/src packages/blueprint-compiler/src

The expected observation is that `run-cli.ts` defaults to `resolveRepoRootPath()`, `next-command.ts` and `validate-command.ts` call `ensureLocalDraft()`, `review-command.ts` and `parse-cli-command.ts` still throw raw `Error` objects in some cases, and `generate-command.ts` still removes the whole `absoluteOutPath`.

Run the blueprint baseline from the CLI blueprint before changing behavior:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/packages/ship-by-sunday-cli
    $ bun run test

The expected observation is the current green baseline. During plan creation this suite passed with 6 test files and 20 tests; the exact counts can grow as hardening tests are added, but the suite should stay green at each milestone boundary.

After Milestone 1 lands, prove caller-project-root anchoring from a temporary directory by invoking the real CLI entrypoint file rather than `runCli()` directly, then confirm that the root wrapper no longer changes cwd:

    $ repo_root=/Users/parkerrex/Projects/ship-by-sunday
    $ temp_project="$(mktemp -d /tmp/sbs-cli-project-XXXXXX)"
    $ cd "$temp_project"
    $ bun "$repo_root/packages/ship-by-sunday-cli/src/cli.ts" init --fixture complete --json
    $ bun "$repo_root/packages/ship-by-sunday-cli/src/cli.ts" generate --out ./generated --dry-run --json
    $ cd "$repo_root"
    $ node -e 'const pkg=require("./package.json"); console.log(pkg.scripts.sbs)'

The expected observation is that the JSON `draftFilePath` points at `$temp_project/.ship-by-sunday/draft.json`, the dry-run `outputPath` points at `$temp_project/generated/<slug>`, and the root script output no longer contains `--cwd packages/ship-by-sunday-cli`. Nothing in the source repository should be chosen as the project root for the temporary-project paths.

After Milestone 2 lands, verify that read-only inspection does not create state:

    $ repo_root=/Users/parkerrex/Projects/ship-by-sunday
    $ temp_project="$(mktemp -d /tmp/sbs-cli-readonly-XXXXXX)"
    $ cd "$temp_project"
    $ set +e
    $ bun "$repo_root/packages/ship-by-sunday-cli/src/cli.ts" next --json >/tmp/sbs-next.stdout 2>/tmp/sbs-next.stderr
    $ status=$?
    $ set -e
    $ test "$status" -eq 4
    $ test ! -e "$temp_project/.ship-by-sunday/draft.json"

The expected observation is exit code `4`, a JSON error payload with `error_code: "missing_draft"` in `/tmp/sbs-next.stderr`, and no draft file created under the temporary project directory.

After Milestone 3 lands, simulate interrupted-write recovery at the blueprint test level rather than by trying to crash a real save mid-stream. Create or update focused tests that write a valid temp draft file without a final file, write both final and temp files, and write an invalid temp file. The commands remain the blueprint-local suite:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/packages/ship-by-sunday-cli
    $ bun run test

The expected observation is that the test suite proves the new recovery rules without leaving residue in the repository working tree.

After Milestone 4 lands, prove that forced directory generation only replaces the Blueprint slug:

    $ repo_root=/Users/parkerrex/Projects/ship-by-sunday
    $ temp_project="$(mktemp -d /tmp/sbs-cli-generate-XXXXXX)"
    $ cd "$temp_project"
    $ mkdir -p generated
    $ printf 'keep\n' > generated/keep.txt
    $ bun "$repo_root/packages/ship-by-sunday-cli/src/cli.ts" init --fixture complete --json
    $ bun "$repo_root/packages/ship-by-sunday-cli/src/cli.ts" generate --out ./generated --force --json
    $ test -f "$temp_project/generated/keep.txt"

The expected observation is that the generated slug directory is created or replaced under `generated/`, but the unrelated sibling file `generated/keep.txt` survives.

Also add one targeted automated test for wrong-type targets instead of relying only on a manual shell probe. The representative cases are `generate --out ./generated-file` where `generated-file` already exists as a plain file in directory mode, and `generate --out ./generated-dir --zip` where `generated-dir` already exists as a directory in zip mode. Both should now return stable `invalid_state` errors that name the offending path instead of raw Node messages.

After Milestone 5 lands, verify interactive cancellation from the real entrypoint:

    $ repo_root=/Users/parkerrex/Projects/ship-by-sunday
    $ temp_project="$(mktemp -d /tmp/sbs-cli-cancel-XXXXXX)"
    $ cd "$temp_project"
    $ bun "$repo_root/packages/ship-by-sunday-cli/src/cli.ts" resume

At the first prompt, press `Ctrl+C`. The expected observation is a deliberate cancellation message, exit code `130`, and any previously answered fields still preserved in `$temp_project/.ship-by-sunday/draft.json`. There should be no raw stack trace and no bare `^C` as the only visible output.

Finish with the narrow blueprint checks and the documented root-script smoke:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/packages/ship-by-sunday-cli
    $ bun run test
    $ bun run typecheck
    $ bun run lint
    $ bun run format:check
    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run sbs --help

The expected observation is that the CLI blueprint checks pass and the root `bun run sbs --help` surface still prints the existing command list.

## Validation and Acceptance

This slice is complete only when the CLI's trust boundaries are demonstrably tighter from the real entrypoint, not just from direct `runCli()` tests. Acceptance starts with blueprint-local proof: `packages/ship-by-sunday-cli` must pass `bun run test`, `bun run typecheck`, `bun run lint`, and `bun run format:check`. Those checks are the minimum because this slice changes runtime behavior, type names, and local docs in the same blueprint. Acceptance for Milestone 1 also requires the repository-root `package.json` `sbs` script to stop using `--cwd packages/ship-by-sunday-cli`; otherwise the project-root fix is still resting on an assumption Bun did not satisfy during the grill.

Acceptance also requires one spawned or manual real-entrypoint walkthrough from a temporary project directory that uses the actual `packages/ship-by-sunday-cli/src/cli.ts` process. That walkthrough must prove three behaviors together. `init --fixture complete --json` or an equivalent complete import must create `.ship-by-sunday/draft.json` under the temporary project root. `generate --out ./generated --dry-run --json` must report an output path under that same temporary project root. `next --json` or `validate --json` in a fresh temporary project directory with no draft must return exit `4`, `error_code: "missing_draft"`, and leave no draft state behind.

Destructive-generate acceptance is specific. In directory mode, `--force` may replace only the computed repo slug directory under the chosen container path, and unrelated sibling files must survive. In zip mode, `--force` may replace only the exact target file. A human should be able to verify this with a sibling sentinel file as shown in `Concrete Steps`.

Failure-contract acceptance is equally specific. Invalid `init --fixture` input must return `invalid_args`, not `unknown`. A corrupt draft or unrecoverable temp draft must return `invalid_state` with a message that names the affected path. Representative wrong-type output targets in both directory and zip generation must also return stable path-specific `invalid_state` messages instead of raw `EISDIR`, `ENOTDIR`, or similar Node failures. Interrupting `resume` or `stage` with `Ctrl+C` must return `cancelled` and exit `130`, with a human message that tells the user prior answers remain saved. Expected failures should never print raw stack traces or collapse into generic `unknown` errors unless the underlying problem is genuinely unexpected.

If any broader repository check is attempted and fails for unrelated reasons, record the exact command and unrelated files in `Progress` and `Outcomes & Retrospective`. Do not claim the slice is complete unless the blueprint-local checks and the real-entrypoint proof path both pass.

## Idempotence and Recovery

The hardening should make the CLI safer to rerun, not more fragile. Re-running `init --fixture complete --json --force` in the same project root should replace only the local draft file through the atomic save path. Re-running `next`, `validate`, or `review` without a draft should never create new state. Re-running `generate --force` in directory mode should only replace the generated slug directory, and re-running it in zip mode should only replace the exact zip file. Re-running the root `bun run sbs` wrapper after Milestone 1 should preserve the same caller-project-root semantics as invoking `packages/ship-by-sunday-cli/src/cli.ts` directly, because the wrapper will no longer change cwd on the caller's behalf.

Draft persistence must remain recoverable after partial work. If a write is interrupted before the rename, the previously committed `draft.json` should remain untouched. If only a valid temp file exists, load logic should recover it or promote it intentionally. If a leftover temp file cannot be parsed, the CLI should stop with `invalid_state`, tell the user which file is corrupt, and preserve that file so they can inspect, copy, or remove it deliberately instead of silently discarding it. If generation or export points at a wrong-type or inaccessible path, the CLI should fail before any destructive step and should leave sibling files and existing valid artifacts untouched.

The validation steps above intentionally create temporary project directories under `/tmp`. Clean those up after each manual proof run so the working tree stays clean:

    $ rm -rf /tmp/sbs-cli-project-* /tmp/sbs-cli-readonly-* /tmp/sbs-cli-generate-* /tmp/sbs-cli-cancel-*

No schema migration or external service rollback is involved in this slice. The rollback path is code rollback plus removal of any temporary project directories created for validation. If a milestone introduces flaky behavior, stop at that milestone, revert the touched CLI-blueprint files, and rerun the blueprint-local suite before continuing.

## Artifacts and Notes

These current code snippets and transcripts are the evidence that motivated the plan and should be rechecked during implementation:

    Root blueprint script today
    "sbs": "bun run --cwd packages/ship-by-sunday-cli sbs"

    Local Bun verification during the grill
    $ bun run --cwd "$tmpdir" show
    {
      "cwd": "/private/tmp/bun-init-cwd-XXXXXX",
      "initCwd": null
    }

    Current default root in run-cli.ts
    const resolvedRepoRootPath = repoRootPath ?? resolveRepoRootPath();

    Current read-only mutation bug
    // next-command.ts
    const draft = await ensureLocalDraft(repoRootPath);

    // validate-command.ts
    const draft = await ensureLocalDraft(repoRootPath);

    Current broad force-delete in generate-command.ts
    await rm(absoluteOutPath, { recursive: true, force: true });

    Current invalid-fixture error from the real root script
    $ bun run sbs init --fixture nope --json
    {
      "status": "error",
      "command": "init",
      "version": "0.1.0",
      "error_code": "unknown",
      "message": "Unknown fixture \"nope\". Expected one of blank, complete."
    }

    Current interactive cancellation signal from the real root script
    $ bun run sbs resume
    ...
    > ^C

    Current blueprint-local test baseline during plan creation
    Test Files  6 passed (6)
    Tests       20 passed (20)

## Interfaces and Dependencies

The repository-root `package.json` is part of this plan because the current `sbs` wrapper changes cwd before launching the CLI, and local verification showed Bun is not restoring the original caller directory through `INIT_CWD`. Milestone 1 must replace that wrapper with direct file execution so the documented `bun run sbs ...` command preserves the same project-root semantics as invoking `packages/ship-by-sunday-cli/src/cli.ts` directly.

`packages/ship-by-sunday-cli/src/run-cli.ts` is the CLI orchestration boundary. Its option type, default root derivation, and command dispatch signatures are part of this plan because they currently blur caller-project and source-install concerns. Any rename from `repoRootPath` to `projectRootPath` should be carried through consistently so the code reads honestly.

`packages/ship-by-sunday-cli/src/draft/draft-store.ts` and `packages/ship-by-sunday-cli/src/draft/draft-paths.ts` are the local-state boundary. They define `.ship-by-sunday/`, `draft.json`, stdin and file-path handling, and every save path used by `init`, `resume`, `stage`, `import`, `apply`, `mutate`, and the field mutation commands. If a new temp file is introduced, keep it alongside `draft.json` in this same boundary rather than inventing a second state directory.

`packages/ship-by-sunday-cli/src/commands/generate-command.ts` depends on `buildReviewDownloadZip()`, `buildRepoGenerationManifest()`, and `materializeRepoSnapshot()` from `@manmeetsai/blueprint-compiler/server`. Those blueprint-compiler functions still depend on `packages/blueprint-compiler/src/repo-root.ts` to find starter files in the source repository. This hardening slice should preserve that source-install-root behavior while making the CLI's own path handling project-root aware.

`packages/ship-by-sunday-cli/src/cli-errors.ts` and `packages/ship-by-sunday-cli/src/cli-json.ts` define the stable error protocol for both human and JSON modes. Adding `cancelled` to `CliErrorCode` is acceptable in this slice because it preserves the current envelope shape and makes interactive cancellation intentional. A small helper for known `NodeJS.ErrnoException` cases is also acceptable here so draft and output-path filesystem failures become stable `invalid_state` messages with the affected path attached. No new output format should be introduced.

The root `README.md` is the only documentation surface that should change here, and only to explain the safety model that a user or agent must understand: where the draft lives, which commands are read-only, how interrupted writes recover, and what `generate --force` is allowed to replace. Do not widen into install, completion, or distribution docs in this slice.

No new external dependency is justified for this plan. The existing Node and Bun primitives already in use are enough: `node:fs/promises` for directory and file operations, same-directory rename for atomic replacement, `node:readline/promises` for interactive prompts, and Vitest for both narrow blueprint tests and spawned real-entrypoint tests.
