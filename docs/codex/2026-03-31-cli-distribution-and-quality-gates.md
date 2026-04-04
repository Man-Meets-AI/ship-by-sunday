---
summary: "Productize the Ship by Sunday CLI as a trustworthy repo-local tool by adding a real executable contract, version and completion surfaces that fit the current architecture, and dedicated CLI release gates. Keep `bun run sbs` and the existing JSON envelopes intact while explicitly deferring public blueprint distribution and self-update."
read_when: "Open this when you need to make the Ship by Sunday CLI feel maintained and supportable instead of like a hidden monorepo script."
plan_status: done
---

# Productize the Ship by Sunday CLI distribution and quality gates

This is a living execution plan for turning the existing Ship by Sunday CLI from a useful repository script into a maintained repo-local product surface with a clear install story, explicit support boundaries, and dedicated release protection. It must stay self-contained and must be updated as implementation, validation, and rollout decisions evolve.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this slice, a person who clones the repository and runs `bun install` should be able to understand exactly how to run the Ship by Sunday CLI, confirm which version they have, optionally install shell completion, and understand how to update it without guessing. The CLI should also have its own required automated gate so maintainers can trust that command parsing, executable wiring, and starter-snapshot generation are still healthy even when the web app pipeline is green.

This matters because the current CLI already does real product work, but it still feels internal. The only documented invocation is `bun run sbs`, `--version` is not implemented even though JSON envelopes already include a version, help and suggested commands are hard-coded to the workspace script, the blueprint has no declared executable, and the root CI workflow never exercises the CLI blueprint directly. A legitimate command-line product needs the same basic trust signals that a maintained tool such as Mole communicates: a clear way to invoke it, a visible version, an honest update story, and release gates that defend the command surface. In this repository, the truthful near-term version of that bar is a repo-local binary plus explicit docs and CI, not a public registry blueprint.

The change is successful when a newcomer can run both `bun run sbs --version` and a direct repo-local executable such as `./bin/sbs --version`, can source a documented completion script, can follow docs that clearly say what install and update paths are supported today, and can see a dedicated `cli` GitHub Actions job pass before merge.

## Progress

- [x] 2026-03-31 11:00 EDT — Audited the existing CLI blueprint, root scripts, generator dependencies, blueprint tests, docs, and CI workflow to establish the current baseline and support boundary.
- [x] 2026-03-31 11:55 EDT — Grilled the plan against the live repo and locked the remaining implementation decisions: the supported direct launcher is `./bin/sbs`, `completion` supports only `bash` and `zsh`, `--version` and `completion` must suppress banner output, and the root `check` command must start calling `sbs:check` once the CLI gate exists.
- [x] 2026-03-31 12:24 EDT — Landed the repo-local launcher seam, shared process wrapper, version command, completion command, and the shared command-surface helper that keeps `bun run sbs` and `./bin/sbs` aligned.
- [x] 2026-03-31 12:25 EDT — Added the executable-entrypoint test coverage, root `sbs:check` aggregator, CLI GitHub Actions job, and the repo-local smoke path for version, completion, init, and generate.
- [x] 2026-03-31 12:35 EDT — Updated the release workflow docs, root README, blueprint README, and web CLI docs to describe the repo-local install/update story, then updated GitHub branch protection on `main` so `cli` is required alongside `static`, `integration`, and `browser-smoke`.
- [x] Milestone 1 — Lock the repo-local distribution contract and add a stable executable entrypoint plus version surface.
- [x] Milestone 2 — Add completion support and document the supported install and update story while explicitly rejecting premature public distribution.
- [x] Milestone 3 — Add CLI-specific executable tests, root check scripts, GitHub Actions coverage, and required release gates.
- [x] Milestone 4 — Update durable docs, run the release-confidence walkthrough, and record the final support boundary plus deferred public-packaging work.

## Surprises & Discoveries

The first discovery is that versioning already exists in one layer but not in the human-facing command surface. `packages/ship-by-sunday-cli/src/cli-json.ts` injects `package.json.version` into every JSON success and error envelope, but the parser in `packages/ship-by-sunday-cli/src/parse-cli-command.ts` has no `version` command and the observed baseline still fails:

    $ bun run sbs --version
    Unknown command "--version".

The second discovery is that the invocation story is duplicated and hard-coded. `packages/ship-by-sunday-cli/src/run-cli.ts`, `packages/ship-by-sunday-cli/src/commands/next-command.ts`, `README.md`, `apps/web/content/docs/commands.mdx`, and `apps/web/content/docs/ship-by-sunday-cli.mdx` all spell commands as `bun run sbs ...`. There is no single place that defines the supported human-facing command forms.

The third discovery is the most important scope guard: the CLI is not honestly publishable as a detached global blueprint yet. Both `packages/ship-by-sunday-cli/package.json` and `packages/blueprint-compiler/package.json` are private. More importantly, `packages/blueprint-compiler/src/repo-root.ts` resolves the repository root by looking for markers such as `apps/web/package.json` and `docs/prompts/execplan-execution-loop.md`, `packages/blueprint-compiler/src/server/template-loader.ts` reads `docs/openai/*` and `docs/prompts/*` directly from the live repo, and `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts` plus `repo-download-source-contract.ts` build the blueprint by reading large parts of the checked-out repository. That means “standalone” can only mean a direct executable inside a cloned repo for this slice, not `npm install -g`, `bunx`, Homebrew, or self-updating binaries.

The fourth discovery is that the current CLI test suite is useful but incomplete for distribution work. `packages/ship-by-sunday-cli/tests/*.test.ts` call `runCli()` directly with injected `repoRootPath` and fake IO, so they defend command logic but do not defend the real process entrypoint, shebang, direct executable path, or completion output. The root GitHub Actions workflow at `.github/workflows/ci.yml` does not run any CLI blueprint lint, typecheck, format, or test commands at all.

The fifth discovery is a hidden output-contract risk in the current process entrypoint. `packages/ship-by-sunday-cli/src/cli.ts` only suppresses the startup banner for JSON output and `export --out -`, while `packages/ship-by-sunday-cli/src/theme/render-theme.ts` only highlights help lines that start with `bun run sbs`. That means a naive `--version` or `completion` implementation could emit themed banner noise on a TTY, and a help update that introduces `./bin/sbs` examples would otherwise leave styling behavior inconsistent unless the shared command-surface strings and theme rules move together.

The sixth discovery was that the repository already had the right GitHub auth available locally, so the branch-protection rollout could be completed from the terminal instead of being left as an unresolved follow-up. Before the patch, the repository's main-branch protection showed only `static`, `integration`, and `browser-smoke`; after the patch, `cli` was added to the required status checks. That matters because this plan’s release gate is only real once code, docs, and external branch protection all agree.

The seventh discovery is that the supported completion surface can stay intentionally small without losing usefulness. A script printed by `./bin/sbs completion zsh` can still be perfectly sourceable for the supported shells, and the command does not need to mutate shell profile files or teach the tool about shell installers. That kept the slice focused on a truthful stdout contract instead of a larger shell-integration subsystem.

## Decision Log

2026-03-31 — Decision: ship a trustworthy repo-local executable and blueprint identity now, not a public registry distribution. Rationale: the CLI and its compiler dependency are both private today, and the generator reads live monorepo assets from `docs/`, `apps/web/`, and `packages/blueprint-compiler/`. Pretending that detached installation is supported would create a false contract.

2026-03-31 — Decision: keep `bun run sbs` as the automation-safe repository command, but add `./bin/sbs` as the supported human-facing standalone launcher inside a clone. Rationale: this preserves current agent workflows and the existing monorepo development muscle memory while giving humans a real binary that does not require knowing `--cwd packages/ship-by-sunday-cli`.

2026-03-31 — Decision: add `version` and `--version`, add `completion`, and explicitly do not add `update`, `self-update`, or remote installer commands. Rationale: version and completion help trust and daily ergonomics, while update automation would be dishonest without a true published channel. The truthful update story for this slice is “pull the repo and rerun `bun install`.”

2026-03-31 — Decision: introduce one dedicated CLI quality gate in GitHub Actions, backed by root `bun run sbs:check`, and make that check required on `main` after the first green run. Rationale: the current `static`, `integration`, and `browser-smoke` checks defend the web app only.

2026-03-31 — Decision: preserve all existing agent-friendly JSON envelopes and the current draft model. Rationale: the user explicitly asked to preserve the JSON surfaces and monorepo workflow. This slice should not rewrite `cli-json.ts`, the blueprint contract, the draft envelope, or the interactive prompt flow unless a distribution command requires a narrow change.

2026-03-31 — Decision: make `./bin/sbs` the only promised direct launcher path for humans, and treat any dependency-tool `bin` linking as secondary metadata rather than part of the support contract. Rationale: there is no root `bin/` directory today, the repo-local wrapper is the simplest truthful path inside a clone, and Bun workspace linking behavior should not determine whether the CLI is considered supported.

2026-03-31 — Decision: support `completion bash` and `completion zsh` only in this slice, and return an `invalid_args` exit-2 error for any other shell. Rationale: those are the only realistic shells to maintain here, and an explicit refusal is better than an ambiguous placeholder.

2026-03-31 — Decision: once `sbs:check` exists, root `bun run check` must call it so the repository's “full repo check” wording becomes truthful. Rationale: both `AGENTS.md` and `docs/release-workflow.md` describe root `check` as the broad validation path, and leaving the CLI out would preserve a misleading contract.

2026-03-31 — Decision: do not add a new blueprint-level `engines` contract in this slice. Rationale: the repo root already pins Bun via `packageManager: bun@1.3.5`, and duplicating an engine requirement inside a private workspace blueprint would add drift without changing the real support boundary.

2026-03-31 — Decision: update GitHub branch protection on `main` to require `cli` once the CLI job exists, and record that rollout in the repo docs. Rationale: the code gate is not genuine until the external merge policy names it, and the release workflow should tell future maintainers exactly what must be checked before merge.

2026-03-31 — Decision: keep the `sbs:check` smoke step repo-local and cleanup-safe by backing up an existing `.ship-by-sunday/` directory before the smoke init and restoring it afterward. Rationale: the gate needs to prove the real launcher contract without trampling a maintainer’s local draft.

## Outcomes & Retrospective

This slice finished with a truthful repo-local CLI product surface. The repository now has a checked-in `./bin/sbs` launcher, `version`/`--version` output that stays banner-free, `completion` output for `bash` and `zsh`, a root `sbs:check` gate, a dedicated `cli` GitHub Actions job, and branch protection on `main` now requires `cli` alongside the existing web checks. The docs, blueprint README, and release workflow all say the same thing: clone the repo, run `bun install`, and use either `bun run sbs` or `./bin/sbs`.

The main lesson is that this CLI should be treated as a repo-local product, not a detached distribution target. Public packaging still remains out of scope because the blueprint compiler reads repository assets directly. If the team wants a future global install or self-update story, that should be a separate packaging initiative with its own asset-bundling and release-channel decisions.

## Context and Orientation

In this plan, “repo-local install” means a cloned checkout of `/Users/parkerrex/Projects/ship-by-sunday` with dependencies installed from the repository root via `bun install`. In this plan, “standalone invocation” means a direct executable that runs inside that clone without going through `bun run sbs`. It does not mean a detached global install. “Public install” means `npm install -g`, `bunx`, Homebrew, or any other path that works without the full repository checkout; that is intentionally out of scope for now.

The current root command surface lives in `package.json`. The root `sbs` script is only a workspace convenience wrapper:

    "sbs": "bun run --cwd packages/ship-by-sunday-cli sbs"

That means the current CLI looks like a root script, not a declared executable. The root `check`, `lint`, `typecheck`, `format`, and test scripts all delegate into `apps/web`, so the repository’s “full repo check” language is currently misleading for the CLI.

The CLI blueprint itself lives in `packages/ship-by-sunday-cli/`. `packages/ship-by-sunday-cli/package.json` is private, versioned at `0.1.0`, and currently defines only a blueprint-local `sbs` script that runs `src/cli.ts`. There is no `bin` field, no blueprint-local README, no declared engine requirement, and no human-visible install or update metadata. `packages/ship-by-sunday-cli/src/cli.ts` is a Bun shebang process entrypoint that renders the banner from `src/theme/render-banner.ts`, suppresses theme output for JSON and stdout-export modes, and delegates to the pure command runner in `src/run-cli.ts`.

The repository root already pins the only real runtime contract that matters for this slice. `package.json` at the repo root sets `packageManager` to `bun@1.3.5`, and there is no existing root `bin/` directory. That makes a new checked-in `bin/sbs` launcher an additive, low-surprise support surface. The plan should not invent a second Bun-version source of truth inside the blueprint.

The command parser and dispatcher are split cleanly already. `packages/ship-by-sunday-cli/src/parse-cli-command.ts` owns the discriminated union of commands. `packages/ship-by-sunday-cli/src/run-cli.ts` prints help and dispatches into `src/commands/*`. That is the right seam for this slice. The plan should keep `runCli()` reusable for tests and keep the process-specific wiring thin. New user-visible distribution commands should land as small command modules under `src/commands/` rather than as ad hoc logic in `src/cli.ts`.

The current command surface already reveals the gap this slice should fix. `run-cli.ts` prints help lines for `bun run sbs ...`, `next-command.ts` returns `suggestedCommand` values such as `bun run sbs stage design`, and the docs repeat the same examples. That is a monorepo-utility posture. The plan should centralize human-facing invocation metadata so help text, completion output, suggested commands, and docs can stay aligned without manually editing the same strings in multiple places.

The process wrapper and the theme layer are part of the outward contract too. `packages/ship-by-sunday-cli/src/cli.ts` decides when the startup banner appears, and `packages/ship-by-sunday-cli/src/theme/render-theme.ts` currently recognizes only `bun run sbs` command examples. Any implementation that adds `./bin/sbs`, `--version`, or `completion` must update those files deliberately so terse machine-facing output stays banner-free and human-facing help stays visually coherent.

The draft model and JSON contract should not move. `packages/ship-by-sunday-cli/src/draft/draft-paths.ts` fixes the local state location at `.ship-by-sunday/draft.json`, and `packages/ship-by-sunday-cli/src/draft/draft-store.ts` resolves `--file` and `--out` relative to the repo root. `packages/ship-by-sunday-cli/src/cli-json.ts` already provides stable success and error envelopes with `status`, `command`, `version`, and error metadata. This slice may add new commands or new documented fields, but it should not break the existing machine-readable envelope structure.

The generator boundary is what constrains distribution. `packages/blueprint-compiler/src/repo-root.ts` proves that the compiler expects to find this repository. `packages/blueprint-compiler/src/server/template-loader.ts` reads prompt assets from `docs/openai/` and `docs/prompts/`. `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts` and `repo-download-source-contract.ts` read `apps/web`, `packages/blueprint-compiler`, and repo-root config files to build the blueprint. That means a detached install would fail unless those assets were bundled or re-architected. This plan must say that plainly and avoid accidental scope creep into packaging those assets.

The existing test surface is in `packages/ship-by-sunday-cli/tests/`. It currently covers help, draft import/export, review, generate behavior, stage selection, and several agent workflows. Those tests pass today, but they do not spawn the real executable. A distribution slice needs at least one executable-level test file that verifies the launcher, exit codes, stdout/stderr behavior, and completion output through the actual process boundary.

The durable documentation and release surfaces that must be updated are `README.md`, `apps/web/content/docs/ship-by-sunday-cli.mdx`, `apps/web/content/docs/commands.mdx`, and `docs/release-workflow.md`. If the command surface changes in a way users would notice, `CHANGELOG.md` should also receive one concise entry so release readers can see that the CLI gained a real distribution story and its own gates.

## Plan of Work

Start by making the distribution boundary explicit in code before adding any new polish. Introduce one small source of truth for the CLI’s outward-facing identity in `packages/ship-by-sunday-cli/src/command-surface.ts`: the binary name `sbs`, the repo-safe shortcut `bun run sbs`, the supported direct launcher `./bin/sbs`, and the help/completion command strings built from those values. Use that module to remove string drift between help output, suggested next commands, parse errors, completion output, theme formatting, and docs references. Keep `runCli()` pure and keep the existing JSON envelope code in `cli-json.ts`.

Once the outward-facing identity is explicit, add the direct repo-local executable and the version surface. The launcher contract for this slice is a checked-in root wrapper at `bin/sbs` plus blueprint metadata in `packages/ship-by-sunday-cli/package.json` that names the binary without pretending detached installation is supported. Both `bun run sbs` and `./bin/sbs` must route through the same shared process helper so there is only one banner, IO, and exit-code path. Add `version` and `--version`, and make them print only the version string in plain text with no startup banner and no color formatting.

After the executable exists, add only the ergonomic surfaces that the current architecture can honestly support. `completion` should print scripts to stdout, support only `bash` and `zsh`, and fail fast for any other shell. `completion` output must also suppress the startup banner so the emitted script is sourceable as-is. Self-update still does not belong in this slice because there is no detached install channel and no registry story. Keep the update story in docs and help text: pull the repo, rerun `bun install`, and verify with `--version`.

With the surface locked, harden the quality gates. Expand the CLI test suite so it covers the real `./bin/sbs` launcher and its stdout/stderr behavior, then add a root aggregator command `bun run sbs:check` that runs the CLI blueprint checks, the blueprint-compiler blueprint checks that the CLI depends on, and launcher-level smoke coverage. Once `sbs:check` exists, root `bun run check` must call it so the repo-wide check contract is accurate. Wire `sbs:check` into a dedicated `cli` job in `.github/workflows/ci.yml`. After the first green run, update GitHub branch protection on `main` so `cli` is required alongside `static`, `integration`, and `browser-smoke`.

Finish by rewriting the docs and release workflow around the truthful support boundary. The docs should clearly separate three things: the repo-local shortcut `bun run sbs`, the supported direct repo-local executable `./bin/sbs`, and the intentionally unsupported public install/update paths. Capture one release-confidence walkthrough that uses the new surfaces and actually exercises starter-snapshot generation so a future maintainer can tell the difference between a passing unit suite and a healthy CLI product.

## Milestones

Milestone 1 establishes the repo-local distribution contract in code. At the end of this milestone, the repository has one supported direct executable path at `./bin/sbs`, `packages/ship-by-sunday-cli/package.json` declares the CLI identity fields that matter now, `packages/ship-by-sunday-cli/src/command-surface.ts` owns the outward-facing command strings, and the CLI can report its version through both `version` and `--version` without printing the banner. The touched files should be `packages/ship-by-sunday-cli/package.json`, new `bin/sbs`, new `packages/ship-by-sunday-cli/src/command-surface.ts`, new `packages/ship-by-sunday-cli/src/execute-cli-process.ts`, `packages/ship-by-sunday-cli/src/cli.ts`, `packages/ship-by-sunday-cli/src/parse-cli-command.ts`, `packages/ship-by-sunday-cli/src/run-cli.ts`, new `packages/ship-by-sunday-cli/src/commands/version-command.ts`, `packages/ship-by-sunday-cli/src/commands/next-command.ts`, and `packages/ship-by-sunday-cli/src/theme/render-theme.ts`. Run the CLI blueprint tests, then verify `bun run sbs --version`, `./bin/sbs --version`, `bun run sbs --help`, and `./bin/sbs --help`. Success looks like a newcomer being able to invoke the CLI directly without knowing about `--cwd packages/ship-by-sunday-cli`, while machine-facing output stays banner-free.

Milestone 2 adds the ergonomic surfaces that fit the real architecture and documents the support boundary. At the end of this milestone, the CLI can print a completion script for `bash` and `zsh`, rejects unsupported shells with a clear exit-2 error, and the docs explain how to install and update the CLI inside a clone while explicitly refusing unsupported public distribution stories. The touched files should be new `packages/ship-by-sunday-cli/src/commands/completion-command.ts`, `packages/ship-by-sunday-cli/src/command-surface.ts`, `packages/ship-by-sunday-cli/src/parse-cli-command.ts`, `packages/ship-by-sunday-cli/src/run-cli.ts`, `packages/ship-by-sunday-cli/src/cli.ts`, new `packages/ship-by-sunday-cli/README.md`, `README.md`, `apps/web/content/docs/ship-by-sunday-cli.mdx`, and `apps/web/content/docs/commands.mdx`. Run `./bin/sbs completion zsh | sed -n '1,20p'`, `./bin/sbs completion bash | sed -n '1,20p'`, and one unsupported-shell check such as `./bin/sbs completion fish`. Success looks like the CLI sounding truthful: it offers version and completion, and it clearly refuses to pretend it can update itself or run outside the repo.

Milestone 3 puts the CLI under continuous release protection. At the end of this milestone, the repository has root `bun run sbs:check`, root `bun run check` includes that CLI pass, at least one executable-level test file spawns the real launcher, and `.github/workflows/ci.yml` contains a dedicated `cli` job that runs on pull requests and pushes. The touched files should be `package.json`, `.github/workflows/ci.yml`, new `packages/ship-by-sunday-cli/tests/executable-entrypoint.test.ts`, and `packages/ship-by-sunday-cli/tests/test-helpers.ts` if subprocess helpers are needed. Run `bun run sbs:check` locally and confirm that the CI workflow shows `cli` as a first-class job name. Success looks like CLI regressions being visible both in local “full repo” checks and in pull-request automation even when the web app remains green.

Milestone 4 closes the loop with the documented release-confidence path and final evidence. At the end of this milestone, the release docs mention the `cli` gate, the root and web docs match the actual command surface, the blueprint README exists beside the manifest, and the plan includes short transcripts proving the new path plus the external branch-protection follow-through. The touched files should be `docs/release-workflow.md`, `README.md`, `packages/ship-by-sunday-cli/README.md`, `apps/web/content/docs/ship-by-sunday-cli.mdx`, `apps/web/content/docs/commands.mdx`, and optionally `CHANGELOG.md` if the team wants a user-facing note. Run the final local walkthrough from the repository root: initialize or replace a draft, run review, verify version, print at least one completion script, and generate a blueprint under `tmp/`. Success looks like a fresh coding agent being able to follow the docs and trust both the automation story and the human operator story without additional chat context.

## Concrete Steps

Work from the repository root unless a command below explicitly changes directories.

Begin by creating the outward-facing distribution seam. Update `packages/ship-by-sunday-cli/package.json` so it remains private but gains the identity fields that matter for a maintained repo-local tool: a short description and a `bin` declaration for `sbs`. Do not add a new `engines` field. Add a checked-in root launcher at `bin/sbs` that resolves the repo root and executes the same CLI process path as the root script. Keep `packages/ship-by-sunday-cli/src/cli.ts` thin by extracting `packages/ship-by-sunday-cli/src/execute-cli-process.ts` so the launcher and the blueprint script share one banner, IO, and exit-code implementation.

Update `packages/ship-by-sunday-cli/src/parse-cli-command.ts` and `packages/ship-by-sunday-cli/src/run-cli.ts` to understand `version`, `--version`, and `completion`. Add `packages/ship-by-sunday-cli/src/commands/version-command.ts` and `packages/ship-by-sunday-cli/src/commands/completion-command.ts`. Add `packages/ship-by-sunday-cli/src/command-surface.ts` and move the human-facing command forms plus completion command inventory there so `run-cli.ts`, `next-command.ts`, parse-error messages, and the new completion command stop repeating literal `bun run sbs ...` strings in multiple places. Update `packages/ship-by-sunday-cli/src/theme/render-theme.ts` so the human-readable help output still styles both `bun run sbs ...` and `./bin/sbs ...` examples coherently.

When adding `version`, keep the default output terse. A plain `--version` or `version` should print the version string and nothing else. `version --json` must use the existing envelope shape through `cli-json.ts` with `command: "version"`. When adding `completion`, print the script to stdout rather than mutating shell files, support only `bash` and `zsh`, and return the existing `invalid_args` error shape plus exit code `2` for unsupported shells. Update `packages/ship-by-sunday-cli/src/cli.ts` so both `--version` and `completion` suppress the startup banner and themed output even on a TTY.

After the command surface exists, write the distribution tests. Keep the existing `runCli()` tests, but add `packages/ship-by-sunday-cli/tests/executable-entrypoint.test.ts` that spawns `./bin/sbs` and asserts `--help`, `--version`, unsupported-command stderr, and completion output. The test should run against the checked-in repo because that is the supported environment. Do not fabricate a fake detached install, because that would test an unsupported contract.

Add one root aggregator command in `package.json` named `sbs:check`. It should run the CLI blueprint lint, format check, typecheck, and tests; the blueprint-compiler lint, format check, typecheck, and tests that the CLI depends on; `./bin/sbs --help`; `./bin/sbs --version`; one supported completion smoke check such as `./bin/sbs completion zsh >/dev/null`; and a generation-path smoke check that proves the compiler integration still works, preferably `./bin/sbs init --fixture complete --force --json >/dev/null` followed by `./bin/sbs generate --out ./tmp/sbs-cli-check --force --dry-run --json >/dev/null`. Once `sbs:check` exists, update root `check` so it runs the existing web check and then `sbs:check`. Then add a dedicated `cli` job to `.github/workflows/ci.yml` that installs dependencies once and runs `bun run sbs:check`.

Only after the `cli` job exists should the release docs be updated to say it is part of the expected ship path. Update `docs/release-workflow.md` so the “required standing configuration” and “standard release” sections mention `cli` alongside `static`, `integration`, and `browser-smoke`. Because branch protection is external to git, include one rollout step after the first successful `cli` run to update GitHub branch protection on `main` so `cli` is required before merge, and do not mark the milestone complete until that operational step is recorded as done or explicitly called out as still pending.

Update the human docs last so they match the real behavior instead of planning intent. `README.md` should explain the repo-local install path, the two supported invocations, the version and completion surfaces, and the explicit “not supported yet” list. `apps/web/content/docs/ship-by-sunday-cli.mdx` should become the detailed CLI operating guide. `apps/web/content/docs/commands.mdx` should carry only the concise command reference and should link to the deeper CLI page. Add `packages/ship-by-sunday-cli/README.md` so the blueprint documents itself beside its manifest.

Use the following commands as the concrete validation backbone while building the slice:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd packages/ship-by-sunday-cli test
    bun run --cwd packages/blueprint-compiler test
    bun run sbs --help
    bun run sbs --version
    ./bin/sbs --help
    ./bin/sbs --version
    ./bin/sbs version --json
    ./bin/sbs completion zsh | sed -n '1,20p'
    ./bin/sbs completion bash | sed -n '1,20p'
    ./bin/sbs completion fish
    ./bin/sbs init --fixture complete --force --json
    ./bin/sbs review --json
    ./bin/sbs generate --out ./tmp/sbs-cli-release-check --force --json
    bun run sbs:check
    bun run check

Expected observations after the slice lands:

    $ bun run sbs --version
    0.1.x

    $ ./bin/sbs completion zsh | sed -n '1,5p'
    #compdef sbs
    ...

    $ ./bin/sbs completion fish
    Unsupported shell "fish". Expected one of bash, zsh.

    $ ./bin/sbs generate --out ./tmp/sbs-cli-release-check --force --json
    {
      "status": "ok",
      "command": "generate",
      "mode": "directory",
      "outputPath": ".../tmp/sbs-cli-release-check/ship-by-sunday-os",
      "repoName": "ship-by-sunday-os"
    }

Do not change the launcher path without updating every command and transcript in this plan first.

## Validation and Acceptance

Acceptance is based on observable behavior, not on metadata existing in blueprint files. A newcomer must be able to clone the repository, run `bun install`, then invoke the CLI both through `bun run sbs` and through the supported direct repo-local executable without learning any blueprint-internal `--cwd` detail. `--version` must succeed and report the same version source that the JSON envelopes already use.

The CLI must also expose a completion surface that can be installed manually from stdout for the supported shells. Success is not “a command named completion exists.” Success is that `./bin/sbs completion zsh` prints a plausible shell script header, `./bin/sbs completion bash` prints a bash completion body, and the docs tell the user exactly how to source them. Unsupported shells must fail directly with a clear error and exit code `2`.

Machine-facing output must stay clean. `bun run sbs --version`, `./bin/sbs --version`, `./bin/sbs version --json`, and `./bin/sbs completion zsh` must not print the startup banner or themed prefixes before their payloads, even on a TTY. If banner suppression only works in non-TTY test mode, the slice is incomplete.

The docs must tell the truth about installation and updating. The root README, the web CLI guide, the commands reference, and the blueprint README must all agree that today’s supported install story is “clone the repo, run `bun install`, and use the repo-local launcher.” They must all agree that today’s supported update story is “pull the repo and rerun `bun install`.” They must all agree that detached public installation and self-update are intentionally unsupported for now.

The automated release gates are complete only when `bun run sbs:check` passes locally, root `bun run check` includes that CLI pass, the `cli` GitHub Actions job passes in CI, and the release docs plus branch protection configuration treat `cli` as part of the required merge bar. If the job exists in code but branch protection is not updated yet, the slice is not fully complete; record that operational gap in `Progress` and `Outcomes & Retrospective`.

The end-to-end release-confidence walkthrough must prove real utility, not just help text. From the repo root, the maintainer should be able to run `./bin/sbs init --fixture complete --force --json`, `./bin/sbs review --json`, `./bin/sbs generate --out ./tmp/sbs-cli-release-check --force --json`, plus both `bun run sbs --version` and one `./bin/sbs completion ...` command. The generated output path must end with a slugified repo directory. If that walkthrough fails while unit tests pass, treat it as a real regression in the productized CLI surface.

## Idempotence and Recovery

All new launchers must be thin wrappers over the existing CLI process path so rerunning them does not create a second command implementation. If the team ends up needing both `bun run sbs` and `./bin/sbs`, they must both route through the same `runCli()` and the same version source.

The local release-confidence walkthrough mutates `.ship-by-sunday/draft.json` and writes generated artifacts under `tmp/`. That is acceptable during validation because those are already the CLI’s local working surfaces, but clean up after the run if the repository should return to a neutral state:

    cd /Users/parkerrex/Projects/ship-by-sunday
    rm -rf .ship-by-sunday tmp/sbs-cli-release-check

`bun run sbs init --force` intentionally replaces the local draft. Do not use it casually if a maintainer is holding meaningful local CLI work in `.ship-by-sunday/draft.json`. If that draft matters, export it first with `bun run sbs export --out ./tmp/sbs-backup.json` before running the forced seed path.

If completion support becomes more expensive than expected, keep the first shipping slice narrow. Bash and zsh are enough. Do not add fish, PowerShell, or shell-file mutation logic just to make the command list longer. A completion command that prints scripts to stdout is recoverable and easy to rerun.

dependency-tool `bin` linking is not part of the acceptance contract for this slice. The checked-in repo-local launcher at `./bin/sbs` is the promised direct executable path inside the clone, and the blueprint `bin` field exists only so the blueprint identity is internally coherent. Do not block the slice on any expectation that Bun workspaces will expose `sbs` globally.

If the `cli` job lands in GitHub Actions before branch protection is updated, record that explicitly and do not rewrite `docs/release-workflow.md` to claim the gate is already required until the external setting has been changed. The recovery path is simple: wait for one green `cli` run, update branch protection on `main`, and then update the plan and docs to reflect the completed rollout.

## Artifacts and Notes

Observed baseline before implementation:

    $ bun run sbs --help
    Ship by Sunday CLI
    Commands:
      bun run sbs init ...
      ...

    $ bun run sbs --version
    Unknown command "--version".

Observed blueprint-test baseline before implementation:

    $ bun run --cwd packages/ship-by-sunday-cli test
    Test Files  6 passed (6)
    Tests      20 passed (20)

Observed repo-check baseline before implementation:

    $ bun run check
    runs only the apps/web check path and does not cover the CLI blueprint or blueprint-compiler blueprint

The most important source-level evidence for the current support boundary is here:

    packages/blueprint-compiler/src/repo-root.ts
      resolves the repo root by searching for this repository's marker files

    packages/blueprint-compiler/src/server/template-loader.ts
      reads docs/openai/* and docs/prompts/* directly from the checked-out repo

    packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts
      reads apps/web, repo-root config files, and generated blueprint files to build the blueprint

Observed launcher and gate evidence after implementation:

    $ ./bin/sbs --version
    0.1.0

    $ ./bin/sbs completion zsh | sed -n '1,5p'
    #compdef sbs
    ...

    $ ./bin/sbs completion fish
    Unsupported shell "fish". Expected one of bash, zsh.

    $ bun run sbs:check
    ... CLI blueprint checks, blueprint-compiler checks, and launcher smoke all passed ...

    $ bun run check
    ... web checks passed, then `sbs:check` passed ...

    $ gh api repos/ParkerRex/mma-shipbysunday/branches/main/protection/required_status_checks -X PATCH -F strict=true -F 'contexts[]=static' -F 'contexts[]=integration' -F 'contexts[]=browser-smoke' -F 'contexts[]=cli'
    {"strict":true,"contexts":["static","integration","browser-smoke","cli"],...}

    $ ./bin/sbs generate --out ./tmp/sbs-cli-release-check --force --json
    {
      "status": "ok",
      "command": "generate",
      "version": "0.1.0",
      "mode": "directory",
      "outputPath": ".../tmp/sbs-cli-release-check/ship-by-sunday-os",
      "repoName": "ship-by-sunday-os"
    }

Update this section during implementation with short transcripts from the new version command, completion command, `sbs:check`, and the final generation walkthrough.

## Interfaces and Dependencies

`packages/ship-by-sunday-cli/package.json` is the user-visible identity source for the CLI. Its `version` field already feeds `packages/ship-by-sunday-cli/src/cli-json.ts`. After this slice, it must also be the single source of the version that `--version` reports. Keep the blueprint private. Do not invent a fake public blueprint story inside the manifest.

`packages/ship-by-sunday-cli/src/run-cli.ts` and `packages/ship-by-sunday-cli/src/parse-cli-command.ts` are the command-surface boundary. They must remain exhaustive and easy to scan. New commands should be added there through discriminated unions and explicit switch branches. Do not replace them with a generic framework or config bag for this small CLI.

`packages/ship-by-sunday-cli/src/command-surface.ts`, `packages/ship-by-sunday-cli/src/execute-cli-process.ts`, `packages/ship-by-sunday-cli/src/cli.ts`, and `packages/ship-by-sunday-cli/src/theme/render-theme.ts` together define the human-facing launcher contract. They must agree on the supported command examples, when the startup banner is suppressed, and which outputs are safe to pipe or source. `bin/sbs` is the repo-local wrapper that exposes this contract from the repository root.

`packages/ship-by-sunday-cli/src/cli-json.ts` is the machine-contract boundary. Existing success and error envelope fields must remain stable. If `version` gains a JSON mode, it must use this same pattern rather than inventing a second JSON style.

`packages/ship-by-sunday-cli/src/commands/next-command.ts` is part of the outward distribution story because it returns `suggestedCommand`. Once a direct executable exists, suggested commands must stay truthful and repo-safe. Preserve the current automation-friendly bias toward `bun run sbs ...` unless there is a strong reason to change it and that change is explicitly documented.

`packages/ship-by-sunday-cli/src/draft/draft-store.ts` and `src/draft/draft-paths.ts` define the local draft contract. This slice should not change the draft file location or envelope shape. Any change there would widen into migration work and is out of scope.

`packages/blueprint-compiler/src/repo-root.ts`, `src/server/template-loader.ts`, `src/repo-generation/materialize-repo-snapshot.ts`, and `src/repo-generation/repo-download-source-contract.ts` explain why the CLI currently requires a cloned repo. They are dependencies of this plan because they determine what install and update claims are honest. Only change them in this slice if a narrow fix is required to make the repo-local launcher more reliable. Do not use this plan to bundle assets or redesign snapshot generation.

`package.json` at the repository root, `.github/workflows/ci.yml`, and the external GitHub branch protection settings for `main` together define the release gate. Root `check` must become a truthful broad-repo command by calling `sbs:check` after the existing web check. The code change and the repository setting must agree before this slice can be called done.

The durable documentation dependencies are `README.md`, `apps/web/content/docs/ship-by-sunday-cli.mdx`, `apps/web/content/docs/commands.mdx`, `docs/release-workflow.md`, and the new `packages/ship-by-sunday-cli/README.md` if that file is added. They must all describe the same install path, invocation forms, support boundary, and validation path. If `CHANGELOG.md` receives a user-facing note, keep it concise and focused on the new command surfaces and release gates rather than implementation detail.
