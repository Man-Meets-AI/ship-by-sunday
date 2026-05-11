---
title: Docs Operating System Package Distribution Proof
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Prove the shared Ship by Sunday CLI package can distribute the docs operating-system command surface that generated wrappers call.
post_build_recap: The local-runner package now declares a minimal CLI artifact, package smoke proves packed tarball contents plus bunx/npx setup pairing, and an installed packed artifact can run docs operating-system markdown lint.
program_id: worker-grade-docs-operating-system-adoption
planning_brief: docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-2.md
read_when:
  - Resuming package distribution proof for docs operating-system adoption.
  - Changing the local runner package artifact shape.
  - Validating generated wrapper dependency behavior.
---

# Docs Operating System Package Distribution Proof

This document is a living execution plan for the package distribution proof slice of the Worker-grade docs operating-system Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Generated docs operating-system wrappers now expect an installed `ship-by-sunday` binary to provide the bundled validator commands. The package metadata and lockfile refresh path exist, but the Program is not done until the package artifact itself is shaped for distribution and the smoke test proves that a packed artifact can run the docs operating-system command surface from a customer-like repo.

After this slice, `packages/local-runner` will have a minimal package artifact contract and package smoke will prove three things: the tarball contains the built CLI and required metadata only, `bunx` and `npx` can run setup pairing from that tarball, and an installed tarball can run `ship-by-sunday docs-operating-system markdown-lint` from a temporary repository. This does not publish the package or create registry setup.

## Progress

- [x] 2026-05-06 EDT: Read root `AGENTS.md`, `docs/index.md`, the owning Program, `docs/internal/workflow-packets.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, the completed lockfile-refresh ExecPlan, package smoke, package manifest, docs operating-system commands, and install/package patch helpers before editing.
- [x] 2026-05-06 EDT: Added a minimal `files` whitelist and `prepack` build hook to `packages/local-runner/package.json`.
- [x] 2026-05-06 EDT: Hardened `packages/local-runner/tests/package-smoke.ts` to inspect tarball contents and run an installed packed artifact through `ship-by-sunday docs-operating-system markdown-lint`.
- [x] 2026-05-06 EDT: Fixed package bundling by removing the imported script-entrypoint dependency from `packages/local-runner/src/commands/docs-operating-system.ts`.
- [x] 2026-05-06 EDT: Updated `docs/internal/workflow-packets.md` and the owning Program with the shipped local package artifact proof boundary.
- [x] 2026-05-06 EDT: Focused package smoke, local-runner tests, lint, typecheck, format check, plan lint, and markdown lint passed.

## Surprises & Discoveries

The existing package smoke already packs `packages/local-runner` and proves `bunx` plus `npx` setup pairing. It does not inspect tarball contents and does not run the docs operating-system command surface that generated wrappers rely on.

The current package artifact can be built as a single Bun bundle at `dist/cli.js`, so this slice does not need to copy source files, tests, validator scripts, or runtime code into customer repositories.

Package smoke initially failed after tarball inspection was added because `packages/local-runner/src/commands/docs-operating-system.ts` imported `runExecPlanLint` from `scripts/exec-plan/run-lint.ts`. That script has a command-line entrypoint guard that evaluates as true inside the Bun bundle, so `ship-by-sunday setup pair ...` was parsed as `plans:lint`. The fix was to use the underlying library functions directly from `scripts/exec-plan/plan-lint.ts`.

## Decision Log

Decision: Treat package distribution as package artifact proof, not registry publication.
Rationale: This Program can prove the portable CLI package shape and customer-like execution path locally. Publishing, registry credentials, release automation, package signing, and update channels require separate authority and setup.
Date: 2026-05-06

Decision: Keep generated wrappers dependent on the `ship-by-sunday` binary instead of copying validator implementation files.
Rationale: The Program already chose package-owned validators plus tiny wrappers to avoid source drift in customer repos. Distribution proof should validate that package path instead of introducing copied validator source.
Date: 2026-05-06

## Outcomes & Retrospective

This slice is complete. `packages/local-runner/package.json` now declares the package artifact as the bundled `dist/cli.js` plus required package metadata, with `prepack` building the bundle for standard pack and publish flows. The package smoke still packs with lifecycle scripts ignored after an explicit build, so it proves the artifact is already present instead of hiding a missing bundle behind pack hooks.

`packages/local-runner/tests/package-smoke.ts` now proves the tarball contains `package/package.json` and `package/dist/cli.js`, excludes `package/src/`, `package/tests/`, and `package/node_modules/`, still runs `bunx` and `npx` setup pairing, installs the tarball into a temporary repo, and runs `ship-by-sunday docs-operating-system markdown-lint --repo <repo> --paths docs/index.md` through the installed package binary. The generated-wrapper dependency path is locally proven without publishing to a registry.

The remaining Program outcomes are evidence-bound quality refresh and native command integration. Public package publication, registry credentials, signing, release automation, and update channels remain outside this slice.

## Context and Orientation

The owning Program is `docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md`. The already-shipped package-script patching workflow writes generated wrapper files under `scripts/sbs-docs/**`; those wrappers spawn the `ship-by-sunday` binary with `docs-operating-system` subcommands. The lockfile refresh workflow proves the target package manager can refresh manager-specific lockfiles after package metadata is patched.

The local-runner package lives in `packages/local-runner/package.json`. The CLI entry is `packages/local-runner/src/cli.ts`; the distributable bundle is `packages/local-runner/dist/cli.js`; package smoke is `packages/local-runner/tests/package-smoke.ts`. The docs operating-system command implementation is `packages/local-runner/src/commands/docs-operating-system.ts`.

### In Scope

This slice may update `packages/local-runner/package.json` to make the package artifact explicit, update `packages/local-runner/tests/package-smoke.ts` to inspect and execute the packed artifact, and update durable Program and workflow docs that describe the package distribution boundary.

The smoke test should prove tarball contents, `bunx` setup pairing, `npx` setup pairing, and installed-package docs command execution against a temporary repo with valid Markdown metadata.

### Out Of Scope

This slice does not publish to npm, create registry credentials, add GitHub/Vercel/CI publishing automation, sign packages, add an update channel, alter package-script patching authority, mutate target customer repos, refresh quality evidence, wire native app-stack commands, configure providers, install runtime state, or copy Worker-specific operating files.

## Plan of Work

First update `packages/local-runner/package.json` so the package records its intended artifact shape. The package should keep the `ship-by-sunday` bin pointed at `./dist/cli.js`, add a minimal `files` whitelist for the bundle, and add a standard `prepack` build hook. The existing `package:smoke` script can continue to require an explicit build before smoke because it packs with lifecycle scripts ignored.

Then update `packages/local-runner/tests/package-smoke.ts`. After `bun pm pack --ignore-scripts`, inspect the tarball with `tar -tf` and assert that `package/package.json` and `package/dist/cli.js` are present while `package/src/`, `package/tests/`, and `package/node_modules/` are absent. Keep the existing `bunx` and `npx` setup pairing checks. Add a temporary docs-command repo, install the tarball as a dev dependency with lifecycle scripts ignored, write a valid `docs/index.md`, and run the installed `ship-by-sunday docs-operating-system markdown-lint --repo <repo> --paths docs/index.md`.

Finally update `docs/internal/workflow-packets.md` and the owning Program to state that package distribution proof now exists locally as package artifact proof, while actual publication remains outside this Program. Move this ExecPlan to completed only after validation passes.

## Milestones

Milestone one is package artifact shape. At the end, `packages/local-runner/package.json` clearly describes the distributable artifact and standard pack/publish commands build `dist/cli.js`.

Milestone two is package smoke hardening. At the end, `package:smoke` fails if the tarball omits the bundle, includes source/test/runtime noise, cannot pair through `bunx` or `npx`, or cannot run the docs operating-system markdown command from an installed packed artifact.

Milestone three is durable documentation. At the end, the Program and workflow-packet docs describe the package distribution proof boundary and the remaining slices truthfully.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Inspect the package surfaces:

    sed -n '1,220p' packages/local-runner/package.json
    sed -n '1,260p' packages/local-runner/tests/package-smoke.ts
    sed -n '1,180p' packages/local-runner/src/cli.ts
    sed -n '1,180p' packages/local-runner/src/commands/docs-operating-system.ts

Patch only these implementation files unless validation exposes a direct dependency:

    packages/local-runner/package.json
    packages/local-runner/tests/package-smoke.ts
    packages/local-runner/src/commands/docs-operating-system.ts

Then update these durable docs:

    docs/internal/workflow-packets.md
    docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md
    docs/exec-plans/completed/2026-05-06-docs-operating-system-package-distribution-proof.md

## Validation and Acceptance

Acceptance requires `package:smoke` to prove the packed package shape and docs command execution path. The tarball must contain `package/dist/cli.js` and `package/package.json`; it must not contain local source, tests, or `node_modules`. The installed package command must run `markdown-lint` successfully against a temporary repo, showing that generated wrappers have a real package-owned command surface to call after dependency installation.

The final docs must keep publication and update-channel setup out of scope. If package publishing, registry credentials, package signing, or CI release automation are still missing, the docs should say that directly instead of implying they were completed.

### Test Commands

- bun run --cwd packages/local-runner build
- bun run --cwd packages/local-runner package:smoke
- bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts docs-operating-system-package-script-patching.test.ts docs-operating-system-lockfile-refresh.test.ts
- bun run --cwd packages/local-runner lint
- bun run --cwd packages/local-runner typecheck
- bun run --cwd packages/local-runner format:check
- bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-docs-operating-system-package-distribution-proof.md
- bun run programs:lint
- bun run markdown:lint -- --paths docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/completed/2026-05-06-docs-operating-system-package-distribution-proof.md docs/internal/workflow-packets.md
- git diff --check

## Idempotence and Recovery

The package manifest changes are safe to rerun because they describe static package metadata. If the package smoke fails after creating temporary repos or tarballs, inspect the failure output and rerun after `bun run --cwd packages/local-runner build`; the smoke uses temporary directories and does not mutate customer source.

If adding a `files` whitelist accidentally excludes a required runtime artifact, the smoke should fail before any publication. Recovery is to add the missing built artifact to the whitelist or confirm it is bundled into `dist/cli.js`, then rerun build and package smoke.

## Artifacts and Notes

Expected package smoke evidence should include:

    package smoke passed

Expected tarball contents include:

    package/package.json
    package/dist/cli.js

Expected customer-like command path:

    npm exec -- ship-by-sunday docs-operating-system markdown-lint --repo <repo> --paths docs/index.md

Validation evidence from implementation:

    bun run --cwd packages/local-runner package:smoke
    package smoke passed

    bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts docs-operating-system-package-script-patching.test.ts docs-operating-system-lockfile-refresh.test.ts
    Test Files  3 passed (3)
    Tests  25 passed (25)

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    tsc --noEmit -p tsconfig.json

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

## Interfaces and Dependencies

This slice depends on Bun's `bun build` bundling the CLI into `dist/cli.js`, Bun's `bun pm pack` producing an npm-compatible tarball, npm's local tarball install preserving the `ship-by-sunday` bin, and the docs operating-system command implementation staying bundled into the CLI.
