# Ship By Sunday CLI Deletion Research

This research pass preserves the Ship by Sunday helper CLI blast-radius research gathered from `/Users/parkerrex/Developer/ship-by-sunday` on 2026-04-24.

## Source Track

The source track inspected `packages/ship-by-sunday-cli`, `bin/sbs`, root package scripts, docs, tests, generated starter references, CI/check dependencies, and Codex as a contrast point.

## Findings

The CLI is currently release-critical only because it is wired into broad local and CI gates. Deleting `packages/ship-by-sunday-cli` without first unwiring it would immediately break:

- `package.json:19`, where `bun run sbs` points at `packages/ship-by-sunday-cli/src/cli.ts`.
- `package.json:20`, where `bun run sbs:check` runs CLI lint, format, typecheck, test, `./bin/sbs` smoke checks, and CLI generation dry-run.
- `package.json:46`, where root `bun run check` depends on `bun run sbs:check`.
- `.github/workflows/ci.yml:80-101`, where the dedicated `cli` job runs `bun run sbs:check`.
- `bin/sbs:1-9`, where the checked-in launcher execs `bun packages/ship-by-sunday-cli/src/cli.ts`.
- `bun.lock:114-122` and `bun.lock:868-872`, where the lockfile contains CLI workspace/package entries.
- `docs/release-workflow.md:67` and `docs/release-workflow.md:103`, where external branch protection and merge steps document `cli` as required proof.

## Live Inventory

Core CLI package files:

- `packages/ship-by-sunday-cli/package.json:1-29`
- `packages/ship-by-sunday-cli/tsconfig.json:1-3`
- `packages/ship-by-sunday-cli/vitest.config.ts:1-8`
- `packages/ship-by-sunday-cli/README.md:1-37`

The package declares `bin.sbs` and depends on `@shipbysunday/codebase-compiler` and `@shipbysunday/codebase-presentation`.

Source functionality includes:

- entrypoint/orchestration in `src/cli.ts`, `src/execute-cli-process.ts`, `src/run-cli.ts:1-223`, and `src/parse-cli-command.ts:16-57` plus `src/parse-cli-command.ts:102-423`
- command surface, help, version, and completion behavior in `src/command-catalog.ts`, `src/command-surface.ts:1-2`, `src/help/render-help.ts`, `src/commands/version-command.ts`, and `src/commands/completion-command.ts`
- local draft state in `src/draft/draft-paths.ts:3-24`, which defines `.ship-by-sunday/draft.json`
- draft normalization, atomic writes/recovery, import/export, patching, mutation, and auto-init in `src/draft/draft-store.ts:52-60`, `src/draft/draft-store.ts:274-382`, `src/draft/draft-store.ts:398-425`, `src/draft/draft-store.ts:526-560`, and `src/draft/draft-store.ts:598-755`
- reduced CLI fact model in `src/field-contract.ts:7-32` and `src/field-contract.ts:108-163`
- legacy/facts conversion in `src/codebase-derivation.ts:104-178`
- canonical project fact derivation for compiler generation after `src/codebase-derivation.ts:176`
- starter generation bridge in `src/commands/generate-command.ts:1-6`, `src/commands/generate-command.ts:103-217`, and `src/commands/generate-command.ts:231-303`

Tests that disappear with the package:

- `packages/ship-by-sunday-cli/tests/agent-workflows.test.ts`
- `packages/ship-by-sunday-cli/tests/cli-errors.test.ts`
- `packages/ship-by-sunday-cli/tests/cli-help.test.ts`
- `packages/ship-by-sunday-cli/tests/draft-store.test.ts`
- `packages/ship-by-sunday-cli/tests/executable-entrypoint.test.ts`
- `packages/ship-by-sunday-cli/tests/generate-command.test.ts`
- `packages/ship-by-sunday-cli/tests/prompt-stage-session.test.ts`
- `packages/ship-by-sunday-cli/tests/prompt-stage.test.ts`
- `packages/ship-by-sunday-cli/tests/read-only-commands.test.ts`
- `packages/ship-by-sunday-cli/tests/review-command.test.ts`
- `packages/ship-by-sunday-cli/tests/stage-command.test.ts`
- `packages/ship-by-sunday-cli/tests/startup.test.ts`

Current docs that become stale:

- `README.md:15`
- `README.md:140-155`
- `apps/web/content/docs/ship-by-sunday-cli.mdx:1-217`
- `apps/web/content/docs/commands.mdx:40-74`
- `apps/web/content/docs/_meta.ts:99-100`
- `apps/web/content/docs/index.mdx:56`
- `docs/design-docs/scripts.md:45-49`
- `docs/release-workflow.md:18`
- `docs/release-workflow.md:67`
- `docs/release-workflow.md:103`
- `qa/README.md:33`

Historical or status-only references include `CHANGELOG.md:53-55`, `CHANGELOG.md:79`, and `todo.md:21`, `todo.md:23`, `todo.md:27`, `todo.md:36`, and `todo.md:44`.

## Generated Starter And Compiler Impact

The source track found no live references to `bun run sbs`, `./bin/sbs`, `Ship by Sunday CLI`, `.ship-by-sunday`, or `ship-by-sunday-cli` inside `packages/codebase-compiler` source/tests or generated starter renderers.

The generated starter is not coupled to the CLI. The coupling points the other way: the CLI depends on codebase-compiler APIs for schema/defaults and repo/zip generation.

Deleting the CLI therefore should not directly break the protected web `/review` download path or generated starter output, assuming root scripts, CI, branch protection, and docs are unwired.

## Release-Critical Versus Historical

Release-critical surfaces:

- `package.json` scripts, especially `sbs:check` and root `check`
- `.github/workflows/ci.yml` `cli` job
- branch protection requirement for `cli`
- `bin/sbs`
- `bun.lock`
- release docs that treat `cli` as required proof

Current docs but not build-critical:

- README CLI section
- public docs pages and nav entries under `apps/web/content/docs/*`
- `docs/design-docs/scripts.md`
- `qa/README.md` release evidence wording

Historical/docs-only:

- `CHANGELOG.md`
- `todo.md`
- completed or archived ExecPlans under `docs/codex/*` and `docs/exec-plans/completed/*`

## Functionality Lost If The CLI Disappears

If the CLI is thrown away and not replaced immediately, the web app and generated starter can still work, but these capabilities disappear:

- local, browserless codebase intake and `.ship-by-sunday/draft.json` workflows
- JSON automation contract for `schema`, `stages`, `fields`, `next`, `validate`, and `review`
- import/export/apply/mutate support for agents
- legacy/facts-only draft import normalization
- local zip/directory generation from a draft without Clerk/Convex/browser
- regression coverage proving CLI-created drafts still generate the same compiler output

If any of those capabilities matter without a CLI, reusable pieces should move into `packages/codebase-compiler` or a small non-CLI package: draft normalization/import, reduced fact derivation, readiness review, and local generation from facts. The command parser, banner/help/theme, shell completion, and `./bin/sbs` launcher can die.

## Codex Contrast

Codex does not have an SBS-style repo-local helper CLI bolted into root scripts. Its CLI is the product:

- Codex root `package.json:5-9` has only maintenance scripts.
- `codex-cli/package.json:1-21` publishes `@openai/codex` with `bin.codex`.
- `codex-rs/cli/Cargo.toml:8-10` defines the Rust `codex` binary.
- `justfile:13`, `justfile:17`, and `justfile:61` provide developer shortcuts around `cargo run` and `bazel run`.

The research track concluded that Codex is not an argument for keeping an extra repo-local product-adjacent CLI in Ship by Sunday. Codex is a CLI-first product repo; Ship by Sunday is a web product where the CLI is an additional local intake/generation surface.

