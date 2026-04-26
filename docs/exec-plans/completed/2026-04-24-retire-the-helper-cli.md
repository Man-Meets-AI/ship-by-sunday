---
title: Retire The Helper CLI
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Remove Ship by Sunday's repo-local helper CLI and its required-check wiring while preserving the compiler, web generation, release helpers, QA transitional proof, and browser proof.
post_build_recap: Removed the helper CLI package, launcher, scripts, CI job, active docs, and required-check docs while preserving compiler, web, release, QA, and browser proof surfaces.
read_when:
  - Resuming the fifth child slice of the Codex release reset Program.
  - Removing the helper CLI, root sbs scripts, bin launcher, CLI docs, or cli CI context.
  - Checking boundaries before changing blueprint compiler generation, browser proof, QA proof, or release workflows.
program_id: sbs-codex-release-reset
planning_brief: docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-5.md
---

# Retire The Helper CLI

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the helper CLI retirement.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday now has a manifest-backed tag release workflow and release evidence layer, but the repo still treats the old helper CLI as release-critical. A user or maintainer can still discover `bun run sbs`, `./bin/sbs`, `sbs:check`, the `packages/ship-by-sunday-cli/` workspace package, and a required-looking `cli` GitHub Actions job even though the hosted product and compiler-owned review/download path are the real product surfaces.

After this plan is implemented, the repository should no longer expose the helper CLI as a supported product or release gate. Root scripts, CI, active docs, workspace metadata, and branch-protection references should stop naming `sbs`, `sbs:check`, `./bin/sbs`, `packages/ship-by-sunday-cli/`, and a required `cli` context. The web app, `packages/blueprint-compiler`, review/download generation, `release.json`, `scripts/release/`, the `Tag Release` workflow, QA transitional proof, browser proof, and snapshot fallback must keep working.

This is the fifth child slice of the Program at `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`, governed by `planning-brief-5.md`.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-5.md`.
- [x] 2026-04-24 EDT: Grilled the plan before implementation and tightened the branch-protection stance: inspect and document live required contexts locally, but do not mutate remote branch protection from a dirty local checkout before the workflow deletion is pushed.
- [x] 2026-04-24 EDT: Inventory confirmed the helper CLI surface is active before deletion: `packages/ship-by-sunday-cli` exists, `bin/sbs` exists, and `bun pm ls @shipbysunday/ship-by-sunday-cli` lists the workspace package. The before grep found helper CLI references in root `package.json` scripts, `.github/workflows/ci.yml`, `README.md`, `docs/design-docs/scripts.md`, `docs/release-workflow.md`, `qa/README.md`, public docs under `apps/web/content/docs/`, `bun.lock`, and the CLI package itself. The same scan also found unrelated third-party CLI references such as Stripe CLI, Convex CLI, Playwright CLI, Remotion CLI, and vendor/package binary names; those are intentionally out of scope.
- [x] 2026-04-24 EDT: Import-direction proof passed. `rg -n "@shipbysunday/ship-by-sunday-cli|packages/ship-by-sunday-cli|bin/sbs|bun run sbs|sbs:check" packages/blueprint-compiler apps/web --glob '!apps/web/content/docs/**' --glob '!**/node_modules/**'` returned no matches. `rg -n "@shipbysunday/blueprint-compiler|@shipbysunday/blueprint-compiler/server" packages/ship-by-sunday-cli/src packages/ship-by-sunday-cli/tests` showed the CLI imports the compiler from `generate-command.ts`, `field-contract.ts`, `blueprint-derivation.ts`, `draft-store.ts`, and CLI tests.
- [x] 2026-04-24 EDT: Removed local helper CLI wiring: deleted `packages/ship-by-sunday-cli/`, deleted `bin/sbs`, removed root `sbs` and `sbs:check` scripts, changed root `check` to `bun run --cwd apps/web check`, deleted the `.github/workflows/ci.yml` `cli` job, removed active helper CLI docs/navigation, and ran `bun install`. `bun install` reported 1390 installs across 1490 packages and no further changes; the lockfile no longer contains `@shipbysunday/ship-by-sunday-cli` or `packages/ship-by-sunday-cli`.
- [x] 2026-04-24 EDT: Parsed `.github/workflows/ci.yml` with `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml"); puts "ci yaml ok"'`; it printed `ci yaml ok` after Ruby emitted local gem-extension warnings for `ffi` and `io-console`.
- [x] 2026-04-24 EDT: Inspected live GitHub branch protection read-only per the grilled plan. `dev` still reports `strict: true` and contexts/checks `static`, `integration`, `browser-smoke`, and `cli`. `main` still reports `strict: true` and contexts/checks `static`, `integration`, `browser-smoke`, and `cli`. The plan intentionally did not patch remote protection from this dirty local checkout before the workflow deletion is pushed; `docs/release-workflow.md` now records the exact post-merge `gh api --method PATCH` commands to remove only the retired helper context.
- [x] 2026-04-24 EDT: Focused validation passed. `bun install --frozen-lockfile` checked 1390 installs across 1490 packages with no changes. `bun run --cwd packages/blueprint-compiler lint` found 0 warnings/errors across 47 files. `bun run --cwd packages/blueprint-compiler format:check` passed across 50 files. `bun run --cwd packages/blueprint-compiler typecheck` passed. `bun run --cwd packages/blueprint-compiler test` passed 10 files / 31 tests. `bun run --cwd apps/web test:unit -- release-manifest release-evidence` passed 2 files / 10 tests. `bun run --cwd apps/web test:integration -- blueprint` passed 4 files / 12 tests with existing jsdom `Not implemented: navigation to another Document` notices.
- [x] 2026-04-24 EDT: Release and workflow validation passed. `bun run release:manifest:check` returned `ok: true` for `release.json`, channel `stable`, `gitTag: v0.3.0`, schema `release-manifest.v1`, and evidence schema `release-evidence.v1`. `bun run release:evidence:build` wrote dry-run `tmp/release-evidence.v1.json` for `v0.3.0` with expected unavailable hosted-proof blockers. `ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |file| YAML.load_file(file) }; puts "workflow yaml ok"'` passed after Ruby emitted local gem-extension warnings for `ffi` and `io-console`.
- [x] 2026-04-24 EDT: Broad validation passed. `bun run format` finished in 406ms on 1002 files. `bun run lint` found 0 warnings/errors across 942 files. `bun run typecheck` passed after waiting for the serialized Next build lock; Next compiled in 101s, TypeScript finished in 12.7s, and 71 static pages generated.
- [x] 2026-04-24 EDT: Plan, docs, Program, and root check validation passed. `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md` passed. `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md README.md docs/design-docs/scripts.md docs/release-workflow.md qa/README.md apps/web/content/docs` passed. `bun run programs:lint` passed. `git diff --check` passed. Extra proof `bun run check` now enters `bun run --cwd apps/web check` directly and passed lint, format check, unit tests (134 files / 507 tests), contract tests (1 file / 4 tests), integration tests (26 files / 119 tests), coverage-critical tests (17 files / 115 tests, 97.89% statements), and final Next build (compiled in 92s, TypeScript finished in 12.9s, 71 static pages generated).
- [x] 2026-04-24 EDT: After-grep audit found no active helper CLI references. The helper-specific scan for `packages/ship-by-sunday-cli`, `@shipbysunday/ship-by-sunday-cli`, `bin/sbs`, `./bin/sbs`, `bun run sbs`, `sbs:check`, `ship-by-sunday-cli`, `Ship by Sunday CLI`, `intake CLI`, `helper CLI`, and `required .*cli` returned no active matches outside this ExecPlan/Program history. A broader `\bcli\b` scan only found unrelated package binary metadata in `bun.lock`, Stripe CLI helper/test names, and generic Clerk CLI usage-error test wording, all intentionally retained.

## Surprises & Discoveries

During plan authoring, repo inspection found no direct import from `apps/web` or `packages/blueprint-compiler` into `@shipbysunday/ship-by-sunday-cli`, `packages/ship-by-sunday-cli`, `bin/sbs`, `bun run sbs`, or `sbs:check` outside active docs. This supports the expected default: delete the CLI instead of migrating behavior. The implementer must rerun the audit immediately before deletion because the worktree is dirty and other agents may have changed files.

During plan authoring, the CLI imports `@shipbysunday/blueprint-compiler` and `@shipbysunday/blueprint-compiler/server`, especially from `packages/ship-by-sunday-cli/src/commands/generate-command.ts` and `packages/ship-by-sunday-cli/src/blueprint-derivation.ts`. The dependency direction is CLI-to-compiler, not compiler-to-CLI.

During plan authoring, the active public docs that clearly advertise the helper CLI are `apps/web/content/docs/ship-by-sunday-cli.mdx`, `apps/web/content/docs/commands.mdx`, `apps/web/content/docs/index.mdx`, and `apps/web/content/docs/_meta.ts`. These are different from unrelated Stripe CLI and Convex CLI references, which must stay unless a later task changes those operational surfaces.

During plan authoring, `docs/release-workflow.md` still says live branch protection on both `dev` and `main` requires `static`, `integration`, `browser-smoke`, and `cli`, and the standard release steps still wait for `cli`. This plan must make the checked-in docs truthful and must treat live GitHub branch protection as part of the work.

During the pre-implementation grill on 2026-04-24, live GitHub required-status reads succeeded. `dev` currently requires `static`, `integration`, `browser-smoke`, and `cli` with `strict: true`; `main` currently requires the same contexts with `strict: true`. The implementation should not patch those remote settings from this dirty local checkout before the workflow deletion is committed and pushed. It should update checked-in truth and leave exact post-merge operator commands for removing `cli` from branch protection.

## Decision Log

Decision: Default to deleting the helper CLI rather than migrating it.
Rationale: `planning-brief-5.md` says the CLI is downstream of `packages/blueprint-compiler`, and repo inspection supports that direction. Keeping CLI behavior alive somewhere else would preserve the bespoke surface this Program is trying to retire unless a concrete compiler or web dependency is found.
Date: 2026-04-24

Decision: Preserve unrelated Stripe CLI and Convex CLI documentation.
Rationale: The retired surface is the Ship by Sunday helper CLI exposed through `bun run sbs`, `./bin/sbs`, `sbs:check`, `packages/ship-by-sunday-cli/`, and `cli` CI. The repository also uses third-party Stripe and Convex CLIs for local billing and hosted Convex operations; those are not part of this slice.
Date: 2026-04-24

Decision: Keep `static`, `integration`, and `browser-smoke` as the expected branch-required contexts after CLI retirement.
Rationale: Browser proof replacement belongs to Plan 6. This slice removes only the `cli` required context and leaves the remaining current code-centric contexts in place until a later plan changes browser proof deliberately.
Date: 2026-04-24

Decision: Update live GitHub branch protection only when credentials and permissions make the change inspectable and safe.
Rationale: Removing a workflow job before removing the live required context can block merges. If the local shell cannot make or prove that policy change, the implementation must leave exact operator commands and call the external policy blocker out instead of claiming completion of the remote release model.
Date: 2026-04-24

Decision: Do not mutate live branch protection from this local implementation pass.
Rationale: The working tree is dirty and the workflow removal is not yet committed or pushed. Updating remote branch protection before the repo change lands would make an external policy change ahead of the code review path. This slice should inspect live required contexts, update checked-in docs and workflows, and record exact post-merge branch-protection commands.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is complete. The helper CLI package, repo-local launcher, root scripts, CI job, public docs page, public docs navigation, and active docs references are removed. `package.json` no longer exposes `sbs` or `sbs:check`, and root `check` now runs the web app check directly. `.github/workflows/ci.yml` no longer defines the `cli` job.

The compiler and hosted product boundaries remain intact. `packages/blueprint-compiler` still validates independently, the web release manifest/evidence tests pass, and release helpers under `scripts/release/` remain the release-owned automation boundary.

Live branch protection still reported the stale `cli` required context on both `dev` and `main` during read-only inspection. The pre-implementation grill explicitly said not to mutate those remote settings from this dirty local checkout before the workflow deletion is pushed, so this plan records the exact post-merge `gh api --method PATCH` operator commands in `docs/release-workflow.md`.

## Context and Orientation

The helper CLI is the repo-local Ship by Sunday command surface exposed by the root `package.json` scripts `sbs` and `sbs:check`, the checked-in launcher `bin/sbs`, and the workspace package `packages/ship-by-sunday-cli/`. It asks or imports blueprint facts, stores one local draft under `.ship-by-sunday/`, and calls `packages/blueprint-compiler` to review readiness or generate a customer-safe repo snapshot.

The compiler is a separate product boundary at `packages/blueprint-compiler/`. It owns the canonical project definition schema, readiness logic, generated blueprint files, review/download zip, repo generation manifest, starter snapshot contract, and server exports consumed by the web app. The compiler must survive this slice. The implementer should think of the CLI as one frontend that uses the compiler, not as the owner of compiler behavior.

The web review/download path is separate from the CLI. The protected user journey is `/blueprint -> /review`, and the compiler-backed download behavior is exercised through `apps/web` code and tests. Removing the CLI must not remove or weaken web review/download generation, starter repo generation, design preset generation, or generated docs used by the hosted product.

The current `CI` workflow at `.github/workflows/ci.yml` has jobs named `qa_control_plane`, `static`, `cli`, `integration`, and `browser-smoke`. The `cli` job installs dependencies and runs `bun run sbs:check`. After this plan is implemented, that job should be gone, and branch protection should no longer require a `cli` context.

Release identity and release evidence now live outside the CLI. The root `release.json` manifest, `scripts/release/` helpers, `.github/workflows/release.yml` workflow named `Tag Release`, `Dev Staging Proof`, `Production Release Proof`, `Convex Production Deploy`, release triage, release snapshot, release intake, and engineering-intake exports must be preserved.

QA and browser proof are transitional but still active. `qa:run-pack`, QA inventories, QA personas, hosted proof workflows, `browser-smoke`, sandbox e2e, and browser harness files belong to later plans. This plan may remove CLI-owned tests under `packages/ship-by-sunday-cli/tests/`, but it must not delete QA packs or browser proof.

### In Scope

In scope is retiring `packages/ship-by-sunday-cli/`, `bin/sbs`, root `sbs` and `sbs:check` scripts, the `cli` CI job in `.github/workflows/ci.yml`, the root `check` dependency on `sbs:check`, CLI tests, active CLI docs, workspace and lockfile metadata for the CLI package, and release docs that treat `cli` as required proof.

In scope is first proving whether any CLI-only behavior is required by `packages/blueprint-compiler` or the web review/download generation path. The expected default is deletion, not migration. If the proof finds a real compiler or web dependency, only that specific non-CLI behavior may move behind an existing non-CLI boundary, and the implementer must update this plan before doing it.

In scope is updating `README.md`, `docs/design-docs/scripts.md`, `docs/release-workflow.md`, `qa/README.md` only where it names `cli` as a required context, `apps/web/content/docs/commands.mdx`, `apps/web/content/docs/ship-by-sunday-cli.mdx`, `apps/web/content/docs/_meta.ts`, and `apps/web/content/docs/index.mdx` so active docs no longer advertise the helper CLI.

In scope is inspecting live GitHub branch protection for `dev` and `main`, removing the required `cli` context when credentials allow, and recording an exact operator command or blocker when they do not.

### Out Of Scope

Out of scope is deleting QA control-plane files, deleting QA inventories, deleting QA personas, removing `qa:run-pack`, replacing or deleting browser proof, deleting `browser-smoke`, deleting sandbox e2e, deleting snapshot fallback, changing `release.json` semantics, removing `scripts/release/`, rewriting the `Tag Release` workflow beyond CLI references, changing `Dev Staging Proof`, changing `Production Release Proof`, changing `Convex Production Deploy`, adding CODEOWNERS, adding broad GitHub policy automation, adding broad `.github/codex` automation, rotating credentials, redesigning product routes, rewriting the release workflow beyond CLI references, or doing final historical docs archive cleanup.

Out of scope is deleting or rewriting `packages/blueprint-compiler`, web review/download generation, generated starter behavior, release manifest tests, release evidence tests, application tests, auth, checkout, entitlement, metadata, public route behavior, or course/workbench product surfaces.

Out of scope is removing unrelated third-party CLI references such as Stripe CLI local guardrails, Convex CLI deployment commands, Codex CLI docs, or vendor docs that happen to contain the generic word `CLI`.

## Plan of Work

Start with an audit, not deletion. Rerun focused greps across root scripts, workflows, active docs, package manifests, lockfile, compiler, and web app to identify helper CLI references and to distinguish them from unrelated third-party CLI references. Prove there are no imports from `packages/blueprint-compiler` or `apps/web` into the CLI package. Read the files that the audit points to before editing.

Next remove the command and package surface. Delete `packages/ship-by-sunday-cli/` and `bin/sbs`, remove root scripts `sbs` and `sbs:check`, and change root `check` so it remains truthful without the CLI. The likely replacement is `bun run --cwd apps/web check`, because `sbs:check` was the only root-level compiler aggregator. Do not add a new compiler aggregator unless the audit proves the compiler needs an ordinary non-CLI root check; the compiler-focused validation commands in this plan still prove the compiler after deletion.

Then remove the CI job and update policy truth. In `.github/workflows/ci.yml`, delete only the `cli` job. Keep `qa_control_plane`, `static`, `integration`, and `browser-smoke` unchanged. Inspect live branch protection for `dev` and `main`, but do not mutate remote branch protection from a dirty local checkout before this workflow deletion is pushed. Record the current required contexts and the exact post-merge operator command needed to remove `cli` while keeping `static`, `integration`, and `browser-smoke`.

Then update active docs. Remove public CLI operating instructions rather than leaving a retired guide in the active docs navigation. `README.md` should stop listing `packages/ship-by-sunday-cli/` as a live package and should remove the `CLI` section. `docs/design-docs/scripts.md` should remove the helper CLI and generator section or replace it with compiler-focused validation guidance if that is the truthful active command map. `docs/release-workflow.md` and `qa/README.md` should stop saying `cli` is required once branch protection is updated or should clearly mark the external policy blocker if it is not. `apps/web/content/docs/commands.mdx`, `apps/web/content/docs/index.mdx`, `apps/web/content/docs/_meta.ts`, and `apps/web/content/docs/ship-by-sunday-cli.mdx` should stop advertising the helper CLI; deleting the CLI docs page is acceptable if metadata and links are removed.

Finally refresh dependency metadata with the repo's existing Bun workflow and validate. Removing a workspace package should update `bun.lock`. Use `bun install` from the root after deleting the package and scripts, then inspect the lockfile diff so only CLI package metadata disappears. Run focused compiler and web tests before broad gates, parse workflow YAML, build release manifest and evidence dry-run artifacts, lint the plan and touched docs, and run a final grep audit that excludes historical archives.

## Milestones

Milestone 1 proves the deletion boundary. At the end of this milestone, the implementer has current grep output showing all active helper CLI references and import-direction proof showing that `packages/blueprint-compiler` and `apps/web` do not depend on the CLI. Success means the implementer can name whether this is pure deletion or whether a specific non-CLI behavior must move before deletion.

Milestone 2 removes local command and package wiring. At the end of this milestone, `packages/ship-by-sunday-cli/`, `bin/sbs`, root `sbs`, root `sbs:check`, root `check`'s dependency on `sbs:check`, CLI tests, and workspace/lockfile entries are gone. Success means `bun install --frozen-lockfile` no longer expects the CLI package, `bun run check` no longer calls `sbs:check`, and compiler-focused tests still pass.

Milestone 3 removes CI and branch policy wiring. At the end of this milestone, `.github/workflows/ci.yml` no longer defines a `cli` job, workflow YAML parses, and live branch protection either no longer requires `cli` or the exact permission blocker and operator command are recorded. Success means the workflow file and branch policy truth do not disagree silently.

Milestone 4 updates active docs. At the end of this milestone, active README, command docs, public docs navigation, release workflow docs, and QA docs no longer advertise the helper CLI or treat `cli` as required proof. Success means a user browsing current docs cannot accidentally learn the retired helper CLI as an active path, while unrelated Stripe and Convex CLI guardrails remain intact.

Milestone 5 validates the slice and updates living artifacts. At the end of this milestone, focused compiler/web/release checks pass, broad root gates pass, plan lint and markdown lint pass, Program lint passes if `program.md` is touched, `git diff --check` passes for touched files, and this ExecPlan records the actual proof. Success means the repo no longer exposes the helper CLI as an active product or required gate, and a later Plan 6 can focus on browser proof without also carrying CLI cleanup.

## Concrete Steps

1. Confirm the starting state and preserve unrelated work:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short
       test -d packages/ship-by-sunday-cli
       test -f bin/sbs
       bun pm ls @shipbysunday/ship-by-sunday-cli

   Expect unrelated dirty files in the checkout. Do not revert them. If `bun pm ls` is unavailable or noisy, continue with direct `rg` and package manifest reads.

2. Run the before grep audit for active helper CLI references:

       rg -n "packages/ship-by-sunday-cli|@shipbysunday/ship-by-sunday-cli|bin/sbs|\\./bin/sbs|bun run sbs|sbs:check|ship-by-sunday-cli|Ship by Sunday CLI|intake CLI|helper CLI|\\bcli\\b" package.json bun.lock .github/workflows README.md docs/release-workflow.md docs/design-docs/scripts.md qa/README.md apps/web/content/docs packages/ship-by-sunday-cli packages/blueprint-compiler apps/web --glob '!docs/exec-plans/**' --glob '!docs/programs/**' --glob '!tmp/**'

   Classify matches into helper CLI references, unrelated third-party CLI references, and historical references. Do not delete unrelated Stripe CLI, Convex CLI, Codex CLI, or vendor CLI references.

3. Prove import direction before deletion:

       rg -n "@shipbysunday/ship-by-sunday-cli|packages/ship-by-sunday-cli|bin/sbs|bun run sbs|sbs:check" packages/blueprint-compiler apps/web --glob '!apps/web/content/docs/**' --glob '!**/node_modules/**'
       rg -n "@shipbysunday/blueprint-compiler|@shipbysunday/blueprint-compiler/server" packages/ship-by-sunday-cli/src packages/ship-by-sunday-cli/tests

   Expected observation: the first command prints no runtime imports from compiler or web into the CLI; the second command shows the CLI importing the compiler. If the first command finds a real runtime dependency, stop and update this plan before deleting the package.

4. Remove the helper CLI files and package metadata:

       rm -rf packages/ship-by-sunday-cli
       rm -f bin/sbs

   Then edit `package.json` to remove `sbs` and `sbs:check`, and change `check` so it no longer chains `bun run sbs:check`. Keep the rest of the root scripts unchanged. Run:

       bun install

   Inspect `bun.lock` and `package.json` afterward. Expected observation: CLI workspace metadata is gone, but unrelated dependency changes are absent or explainable by the package removal.

5. Remove the CLI CI job:

       sed -n '1,180p' .github/workflows/ci.yml

   Edit `.github/workflows/ci.yml` to remove only the `cli` job. Leave `qa_control_plane`, `static`, `integration`, and `browser-smoke` intact. Parse YAML afterward:

       ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml"); puts "ci yaml ok"'

   Expected observation: `ci yaml ok`.

6. Inspect live GitHub branch protection:

       gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection/required_status_checks --jq '{strict,contexts,checks}'
       gh api repos/ParkerRex/ship-by-sunday/branches/main/protection/required_status_checks --jq '{strict,contexts,checks}'

   In this local implementation pass, do not patch live branch protection before the workflow removal is committed and pushed. Instead, record the current output and leave these exact post-merge operator commands:

       printf '%s\n' '{"strict":true,"contexts":["static","integration","browser-smoke"]}' > tmp/required-checks-dev-without-cli.json
       printf '%s\n' '{"strict":true,"contexts":["static","integration","browser-smoke"]}' > tmp/required-checks-main-without-cli.json
       gh api --method PATCH repos/ParkerRex/ship-by-sunday/branches/dev/protection/required_status_checks --input tmp/required-checks-dev-without-cli.json
       gh api --method PATCH repos/ParkerRex/ship-by-sunday/branches/main/protection/required_status_checks --input tmp/required-checks-main-without-cli.json
       gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection/required_status_checks --jq '{strict,contexts,checks}'
       gh api repos/ParkerRex/ship-by-sunday/branches/main/protection/required_status_checks --jq '{strict,contexts,checks}'

   If the read commands fail, record the exact failure in `Surprises & Discoveries` and leave the same operator action in `Outcomes & Retrospective`: remove `cli` from required status checks on `dev` and `main`, keeping `static`, `integration`, and `browser-smoke`.

7. Update active docs and navigation. Remove helper CLI operating instructions from:

       README.md
       docs/design-docs/scripts.md
       docs/release-workflow.md
       qa/README.md
       apps/web/content/docs/commands.mdx
       apps/web/content/docs/index.mdx
       apps/web/content/docs/_meta.ts
       apps/web/content/docs/ship-by-sunday-cli.mdx

   Deleting `apps/web/content/docs/ship-by-sunday-cli.mdx` is acceptable if `_meta.ts`, `index.mdx`, and `commands.mdx` no longer link to it. Do not delete unrelated Stripe CLI or Convex CLI references.

8. Run focused validation before broad validation:

       bun run --cwd packages/blueprint-compiler lint
       bun run --cwd packages/blueprint-compiler format:check
       bun run --cwd packages/blueprint-compiler typecheck
       bun run --cwd packages/blueprint-compiler test
       bun run --cwd apps/web test:unit -- release-manifest release-evidence
       bun run --cwd apps/web test:integration -- blueprint

   If the exact app test filters do not match this repo's runner, choose the nearest focused tests that cover release manifest/evidence and review/download or blueprint generation, then record the exact commands that ran.

9. Run release and workflow checks:

       bun run release:manifest:check
       bun run release:evidence:build
       ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |file| YAML.load_file(file) }; puts "workflow yaml ok"'

   Expected observation: the manifest and dry-run evidence still validate, and workflow YAML still parses.

10. Run broad repo gates:

       bun run format
       bun lint
       bun typecheck

   If any command fails because of unrelated dirty work, preserve the exact failing command, file paths, and error summary in this ExecPlan before continuing.

11. Run the after grep audit:

       rg -n "packages/ship-by-sunday-cli|@shipbysunday/ship-by-sunday-cli|bin/sbs|\\./bin/sbs|bun run sbs|sbs:check|ship-by-sunday-cli|Ship by Sunday CLI|intake CLI|helper CLI|required .*cli|\\bcli\\b" package.json bun.lock .github/workflows README.md docs/release-workflow.md docs/design-docs/scripts.md qa/README.md apps/web/content/docs packages/blueprint-compiler apps/web --glob '!docs/exec-plans/**' --glob '!docs/programs/**' --glob '!docs/codex/**' --glob '!docs/generated/**' --glob '!docs/ship-by-sunday/**' --glob '!tmp/**'

   Expected observation: no active helper CLI references remain. Unrelated Stripe CLI, Convex CLI, Codex CLI, and vendor references may remain and should be explicitly classified rather than deleted.

12. Validate plan, docs, Program, and diff hygiene:

      bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md
      bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md README.md docs/design-docs/scripts.md docs/release-workflow.md qa/README.md apps/web/content/docs
       bun run programs:lint
      git diff --check -- docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md package.json bun.lock .github/workflows/ci.yml README.md docs/design-docs/scripts.md docs/release-workflow.md qa/README.md apps/web/content/docs

   If `program.md` is not touched during implementation, `bun run programs:lint` is still useful because this active child is Program-linked, but a Program lint failure from unrelated Program files should be recorded separately.

13. Close the loop. Update this ExecPlan's `Progress`, `Surprises & Discoveries`, `Outcomes & Retrospective`, and `Artifacts and Notes` with the actual deletion list, branch-protection outcome, validation commands, and remaining risks. If Program protocol requires registration or completion updates, update `docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md` narrowly and rerun Program lint.

## Validation and Acceptance

The slice is accepted only when the helper CLI is gone from active repo surfaces and the remaining product/release proof still works. A human should be able to read `package.json`, `.github/workflows/ci.yml`, `README.md`, `docs/release-workflow.md`, `docs/design-docs/scripts.md`, and public docs without seeing `bun run sbs`, `./bin/sbs`, `sbs:check`, `packages/ship-by-sunday-cli/`, or a required `cli` context as active instructions.

The compiler and web app must still prove the hosted product path. `packages/blueprint-compiler` tests must pass. Focused web tests for blueprint generation, review/download, or release evidence must pass. `release.json`, `scripts/release/`, `Tag Release`, release evidence, QA transitional proof, browser proof, and snapshot fallback must remain present.

Live branch protection must be handled explicitly. If credentials allow mutation, `dev` and `main` required status checks must no longer include `cli` and must still include `static`, `integration`, and `browser-smoke` until Plan 6 changes browser proof. If credentials do not allow mutation, the final plan update must state the exact command attempted, the exact failure, and the exact operator action required before the remote release model is fully reconciled.

### Test Commands

Run these from `/Users/parkerrex/Developer/ship-by-sunday` after implementation:

    rg -n "packages/ship-by-sunday-cli|@shipbysunday/ship-by-sunday-cli|bin/sbs|\\./bin/sbs|bun run sbs|sbs:check|ship-by-sunday-cli|Ship by Sunday CLI|intake CLI|helper CLI" package.json bun.lock .github/workflows README.md docs/release-workflow.md docs/design-docs/scripts.md qa/README.md apps/web/content/docs packages/blueprint-compiler apps/web --glob '!docs/exec-plans/**' --glob '!docs/programs/**' --glob '!docs/codex/**' --glob '!docs/generated/**' --glob '!docs/ship-by-sunday/**' --glob '!tmp/**'
    ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |file| YAML.load_file(file) }; puts "workflow yaml ok"'
    bun run --cwd packages/blueprint-compiler lint
    bun run --cwd packages/blueprint-compiler format:check
    bun run --cwd packages/blueprint-compiler typecheck
    bun run --cwd packages/blueprint-compiler test
    bun run release:manifest:check
    bun run release:evidence:build
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md
    bun run programs:lint
    git diff --check

Also run the nearest focused app tests for review/download or blueprint generation after inspecting the current test names. If the chosen command differs from the examples in `Concrete Steps`, record the exact command and why it is the nearest proof.

## Idempotence and Recovery

Deleting the CLI is repeatable if the implementer treats each step as a narrow removal and reruns the grep audits after every group of edits. If `rm -rf packages/ship-by-sunday-cli` or `rm -f bin/sbs` is rerun after the files are gone, it remains safe.

If deleting the workspace package causes lockfile churn beyond CLI metadata, stop and inspect `bun.lock` before continuing. Do not normalize unrelated dependency versions as part of this slice. If `bun install` fails because another agent has the workspace in an inconsistent state, record the failure and repair only the package metadata needed for the CLI removal.

If branch-protection mutation fails, do not recreate the `cli` job just to satisfy remote policy. Keep the local repo state aligned with the intended slice, document the remote policy blocker, and leave the exact `gh api` update command for an operator with permissions.

If focused compiler or web generation tests fail after CLI deletion, treat that as evidence that the deletion boundary was wrong. Inspect the failing import or behavior, move only the specific reusable non-CLI behavior into `packages/blueprint-compiler` or an existing web boundary, update this plan's Decision Log, and rerun the focused tests before continuing.

If docs grep finds historical references under completed ExecPlans, `docs/codex/`, generated historical docs, changelog entries, or Program packet artifacts, do not delete them for this slice. Historical archives may mention the CLI. Active truth surfaces must not.

## Artifacts and Notes

Plan authoring observed these active helper CLI surfaces:

    package.json: root sbs, sbs:check, and check chaining sbs:check
    .github/workflows/ci.yml: cli job running bun run sbs:check
    bin/sbs: repo-local launcher into packages/ship-by-sunday-cli/src/cli.ts
    packages/ship-by-sunday-cli/: CLI source, tests, package manifest, and README
    README.md: What lives here and CLI operating section
    docs/design-docs/scripts.md: CLI and generator command section
    docs/release-workflow.md: required cli context and release-step references
    qa/README.md: reminder that helper CLI retirement must change branch protection and CI deliberately
    apps/web/content/docs/commands.mdx: public helper CLI command block
    apps/web/content/docs/ship-by-sunday-cli.mdx: public helper CLI guide
    apps/web/content/docs/_meta.ts: public docs navigation entry
    apps/web/content/docs/index.mdx: public docs link to helper CLI guide
    bun.lock: CLI workspace metadata

Plan authoring observed this dependency direction:

    packages/ship-by-sunday-cli/src/commands/generate-command.ts imports @shipbysunday/blueprint-compiler and @shipbysunday/blueprint-compiler/server
    packages/ship-by-sunday-cli/src/blueprint-derivation.ts imports @shipbysunday/blueprint-compiler
    packages/blueprint-compiler and apps/web did not report direct runtime imports from the helper CLI in the focused audit excluding active docs

Final validation receipts for implementation are recorded in `Progress`: branch-protection read-only inspection, workflow YAML parse, compiler lint/format/typecheck/tests, release manifest and evidence checks, broad root gates, `bun run check`, docs and plan lint, Program lint, diff hygiene, and after-grep audit.

## Interfaces and Dependencies

`package.json` at the repository root defines the public local command surface. Removing `sbs`, `sbs:check`, and the `check` dependency on `sbs:check` is required so local operators no longer learn or run the retired helper CLI.

`bun.lock` is the Bun workspace lockfile. Removing `packages/ship-by-sunday-cli/` must remove its workspace entries without unrelated dependency churn.

`.github/workflows/ci.yml` defines the code-centric CI jobs. The `cli` job must be removed in this slice. `qa_control_plane`, `static`, `integration`, and `browser-smoke` must be preserved.

GitHub branch protection for `dev` and `main` is an external dependency. The checked-in workflow file and live required status contexts must agree. The target required contexts after this slice are `static`, `integration`, and `browser-smoke` until a later plan changes browser proof.

`packages/blueprint-compiler/` is the compiler boundary that must remain. It owns canonical facts, readiness, blueprint rendering, review/download zip generation, repo snapshot generation, and customer-safe output contracts.

`apps/web` is the hosted product boundary that must remain. It owns `/blueprint`, `/review`, checkout, auth, entitlement, docs, and release-related tests.

`release.json`, `scripts/release/`, `.github/workflows/release.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/convex-production-deploy.yml` are release infrastructure from earlier Program slices. They are dependencies of this slice because the helper CLI should no longer be needed for release identity or release evidence.

`qa/` and browser proof remain transitional dependencies. They should continue to exist until Plans 6 and 7 replace browser proof and retire disposable QA deliberately.
