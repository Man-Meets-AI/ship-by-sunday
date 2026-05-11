---
title: Generated Repo Command Contract Proof
status: complete
created_at: 2026-05-10
completed_at: 2026-05-10
summary: Prove a materialized generated customer repo can resolve its shipped workspace and run the advertised low-cost command contract outside the source checkout.
post_build_recap: Generated repos now ship the presentation workspace source they import, a sanitized customer lockfile, a runnable Codebase contract command, aligned generated docs and CI examples, and a clean-room test that runs the generated `bun ci` install command plus the no-provider command contract.
program_id: shipping-evidence-hardening
planning_brief: docs/programs/completed/2026-05-09-shipping-evidence-hardening/planning-brief-5.md
read_when:
  - Resuming generated customer repo proof work.
  - Changing Codebase snapshot package scripts, workspace package inclusion, generated operating-pack scripts, or generated CI examples.
---

# Generated Repo Command Contract Proof

This is a living execution plan for the generated repo command-contract proof slice of Shipping Evidence Hardening.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The downloaded Codebase is part of the product. A buyer or their agent should be able to unpack the generated repo, resolve the shipped workspace, and run the first no-provider validation commands without relying on the source checkout or chat history.

After this slice, `packages/codebase-compiler` has a clean-room test that materializes a generated repo into a temporary directory, runs the generated `bun ci` install command, runs the generated operating-pack commands, and fails if generated docs or package scripts advertise a baseline command the snapshot cannot run. The generated snapshot also includes every workspace package required by `apps/web` imports, without leaking internal release docs or local-runner internals.

## Progress

- [x] 2026-05-10: Created Planning Brief 5 and this child ExecPlan.
- [x] 2026-05-10: Probed the current generated snapshot and confirmed `bun run agentic:check` passes from a temporary repo.
- [x] 2026-05-10: Probed the current generated snapshot and confirmed `bun install --lockfile-only --frozen-lockfile` fails because `@shipbysunday/codebase-presentation` is missing from the generated workspace.
- [x] 2026-05-10: Included `packages/codebase-presentation` package metadata and source in generated snapshots, matching the app workspace imports.
- [x] 2026-05-10: Added generated `codebase:contract` and `test:compiler` alias scripts backed by `scripts/agentic/check-codebase-contract.mjs`.
- [x] 2026-05-10: Sanitized generated `bun.lock` so the customer snapshot no longer carries the unshipped `packages/local-runner` workspace.
- [x] 2026-05-10: Added clean-room compiler tests that materialize the generated repo and run `bun ci` plus `programs:lint`, `plans:lint`, `codebase:contract`, and `agentic:check`.
- [x] 2026-05-10: Updated generated README/START-HERE, generated CI examples, Build Pack validation mapping, package-script expectations, and the compiler output contract.
- [x] 2026-05-10: Fixed review findings by narrowing generated CI and Build Pack baseline validation to `bun ci`, `codebase:contract`, and `agentic:check`; the clean-room test now fails if generated CI or readiness docs advertise an unexecuted baseline command.
- [x] 2026-05-10: Ran focused compiler tests, full package tests, plan/program lint, markdown lint, format check, lint, and typecheck.

## Surprises & Discoveries

- 2026-05-10: `bun run agentic:check` works from a materialized repo without dependency installation because the generated Program and ExecPlan checkers use only built-in Bun/Node APIs.
- 2026-05-10: A lockfile-only frozen install is enough to catch missing workspace packages without downloading the full dependency tree.
- 2026-05-10: The generated app imports both `@shipbysunday/codebase-compiler` and `@shipbysunday/codebase-presentation`, but the snapshot currently ships only `packages/codebase-compiler`.
- 2026-05-10: After adding `packages/codebase-presentation`, frozen lockfile resolution still failed because the source lockfile carried the unshipped `packages/local-runner` workspace. The generated snapshot now renders a customer lockfile with only shipped workspaces.
- 2026-05-10: Review caught that the generated CI example still advertised `bun run build`, while the generated app build is outside the no-provider command contract. The CI example now uses `bun ci` and only runs clean-room-proven no-provider checks.

## Decision Log

Decision: Use a materialized clean-room repo test instead of only string-level assertions.
Rationale: String assertions already missed a missing workspace package. The customer contract is that the downloaded repo can resolve and run the first commands from its own files.
Date: 2026-05-10

Decision: Treat provider-backed and full app proof as outside the generated baseline command contract.
Rationale: This slice should prove commands that are safe before Clerk, Convex, Stripe, and hosted browser setup. Full app build and integration proof remain valid later-stage commands when dependencies and provider environment are configured.
Date: 2026-05-10

## Outcomes & Retrospective

This plan is complete. Generated repos now include the customer-safe `packages/codebase-presentation` source required by `apps/web`, keep `packages/local-runner` out of the customer snapshot, and render a lockfile that matches the shipped workspace set. The generated root package now exposes `codebase:contract`, keeps `test:compiler` as a runnable compatibility alias to that contract, and the generated README, START-HERE flow, Build Pack validation table, and example CI workflow point at the runnable no-provider proof. The generated CI example uses `bun ci` so copied CI fails on lockfile drift.

The executable proof is `packages/codebase-compiler/tests/generated-repo-command-contract.test.ts`. It materializes a generated repo into a temporary directory, runs `bun ci`, then runs `bun run programs:lint`, `bun run plans:lint`, `bun run codebase:contract`, and `bun run agentic:check` from the generated repo root. Full app build, integration, hosted browser, Clerk, Convex, and Stripe proof remain later-stage setup validation, not the pre-provider generated command contract.

## Context and Orientation

The generated customer repo is assembled by `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts`. The source inclusion contract is `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`, and the generated root `package.json` comes from `packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts`.

The generated operating-pack commands are produced by `packages/codebase-compiler/src/repo-generation/render-starter-operating-pack.ts`. The generated Build Pack command manifest is rendered by `packages/codebase-compiler/src/codebases/render-build-codebase.ts` from data prepared in `packages/codebase-compiler/src/readiness/build-pack-readiness.ts`. The generated workflow example lives in `packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts`.

### In Scope

This plan covers generated workspace package inclusion, generated root package scripts, generated operating-pack command scripts, generated Build Pack validation command mapping, generated CI examples, and compiler tests that materialize and execute the generated no-provider command contract.

### Out Of Scope

This plan does not run hosted browser proof, Stripe proof, Clerk proof, Convex proof, full app build proof, production release proof, or local-runner installer proof. It does not ship internal release docs, `docs/openai/` source instruction packs, generated mirrors, local-runner internals, provider secrets, or historical Program archives inside the generated repo.

## Plan of Work

First, update `repo-download-source-contract.ts` so the generated snapshot includes the customer-safe `packages/codebase-presentation` package files required by `apps/web` and `@shipbysunday/codebase-presentation` workspace resolution. Keep the inclusion as narrow as the compiler package inclusion: package metadata and runtime source, not package tests or local-runner internals.

Second, make the baseline generated command contract explicit in `starter-root-package-json.ts` and the generated checker scripts. The no-provider commands should include `programs:lint`, `plans:lint`, `agentic:check`, and a generated Codebase contract check if needed. If legacy `test:compiler` remains, it must be runnable in the generated repo or must stop being advertised as a baseline command.

Third, update the Build Pack validation mapping so default generated validation points at runnable generated commands. A validation step should be marked runnable only when the generated root package defines the script and the clean-room test can prove the command or its required setup class. Commands that require provider setup or full dependency installation should be documented as later-stage proof, not the first no-provider command contract.

Fourth, add a focused compiler test. It should materialize a complete generated repo into a temporary directory, write the files, run `bun ci`, run `bun run programs:lint`, run `bun run plans:lint`, run `bun run agentic:check`, and run the generated Codebase contract command. It should also parse the generated Build Pack manifest and generated CI example and assert baseline runnable commands are part of the tested command set.

Fifth, update package tests and docs contracts, including `packages/codebase-compiler/AGENTS.md` if the generated output contract now names the presentation package. Update the parent Program after validation.

## Milestones

Milestone 1 is clean-room failure capture and workspace inclusion. It is complete when the generated snapshot includes the package surfaces required for frozen workspace resolution, and the clean-room install proof passes.

Milestone 2 is command-contract alignment. It is complete when generated package scripts, Build Pack command mapping, README/START-HERE guidance, and workflow examples agree on the no-provider commands that can run immediately.

Milestone 3 is executable proof. It is complete when compiler tests materialize the snapshot and run the baseline commands from the generated repo directory, and the parent Program records the result.

## Concrete Steps

Inspect before editing:

    sed -n '1,260p' packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts
    sed -n '1,220p' packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts
    sed -n '1,540p' packages/codebase-compiler/src/repo-generation/render-starter-operating-pack.ts
    sed -n '1,240p' packages/codebase-compiler/src/readiness/build-pack-readiness.ts
    sed -n '1,460p' packages/codebase-compiler/tests/repo-generation.test.ts

Observed pre-fix probe from a materialized temporary repo:

    bun run agentic:check
    # Program packet ok
    # ExecPlans ok

    bun ci
    # error: Workspace dependency "@shipbysunday/codebase-presentation" not found

After implementation, run the focused generated repo test first:

    bun run --cwd packages/codebase-compiler test -- tests/generated-repo-command-contract.test.ts

Observed focused generated repo proof:

    bun run --cwd packages/codebase-compiler test -- tests/generated-repo-command-contract.test.ts
    # Test Files  1 passed (1)
    # Tests  1 passed (1)

Observed package proof:

    bun run --cwd packages/codebase-compiler test
    # Test Files  11 passed (11)
    # Tests  41 passed (41)

    bun run test:packages
    # packages/codebase-compiler: 11 passed
    # packages/codebase-presentation: 1 passed
    # packages/local-runner: 24 passed, 2 skipped

Observed repo gates:

    bun run format:check
    # passed

    bun lint
    # passed

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    # passed

## Validation and Acceptance

This plan is accepted when a generated customer repo materialized outside the source checkout can resolve its workspace with the shipped lockfile and run its advertised no-provider command contract from its own root. The test must fail if a required workspace package is missing, if `agentic:check` breaks, if Program or ExecPlan lints cannot run, or if generated docs or CI examples advertise a baseline command that the clean-room test does not execute.

### Test Commands

Run these before marking the plan complete:

    bun run --cwd packages/codebase-compiler test -- tests/generated-repo-command-contract.test.ts
    bun run --cwd packages/codebase-compiler test
    bun run test:packages
    bun run format:check
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-10-generated-repo-command-contract-proof.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-10-generated-repo-command-contract-proof.md docs/programs/completed/2026-05-09-shipping-evidence-hardening packages/codebase-compiler/AGENTS.md

## Idempotence and Recovery

The clean-room test writes to a temporary directory and removes it through the test framework's temporary directory cleanup. Re-running the test should not mutate the source checkout. If workspace resolution fails, inspect generated `package.json` files and included package directories before weakening the test. If a generated command requires provider secrets, classify it as later-stage proof rather than adding fake defaults.

## Artifacts and Notes

The clean-room probe exposed this current failure:

    error: Workspace dependency "@shipbysunday/codebase-presentation" not found

Key files:

    packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts
    packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts
    packages/codebase-compiler/src/repo-generation/render-starter-operating-pack.ts
    packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts
    packages/codebase-compiler/src/repo-generation/render-starter-bun-lock.ts
    packages/codebase-compiler/src/readiness/build-pack-readiness.ts
    packages/codebase-compiler/tests/generated-repo-command-contract.test.ts

## Interfaces and Dependencies

This plan depends on Bun 1.3.5 workspace resolution, the generated root package script contract, the customer-safe snapshot inclusion contract, `apps/web/package.json` workspace dependencies, generated Program and ExecPlan checker scripts, generated Build Pack validation tables, and the compiler test runner under `packages/codebase-compiler`.
