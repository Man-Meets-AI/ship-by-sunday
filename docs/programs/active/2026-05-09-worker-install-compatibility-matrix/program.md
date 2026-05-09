---
program_id: worker-install-compatibility-matrix
title: Worker Install Compatibility Matrix
status: active
created_at: 2026-05-09
completed_at: null
summary: Prove that Worker Foundations install drops a standalone ready-to-run Worker system into practical repo shapes without assuming one app stack or package manager.
post_build_recap: null
read_when:
  - Extending Worker Foundations install compatibility coverage.
  - Checking whether a repo shape is officially supported by the installer.
  - Deciding which Worker install smoke tests belong in CI or release proof.
---

# Worker Install Compatibility Matrix

This Program is a living initiative document for turning Worker Foundations install into a proved, repo-style-agnostic drop-in system.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Worker Foundations install should produce a standalone ready-to-run Worker surface in the target repository, similar in spirit to the useful Arena CRM runtime setup but with productized names and safer installer behavior. A recipient should be able to clone the installed repo, read the generated README and AGENTS instructions, run the documented commands, and let the Worker kickoff path start without knowing the installer's internal implementation.

The initiative is moving correctly when automated fixtures prove blank and existing repos, Bun, npm, pnpm, monorepo, polyglot, conflict, upgrade, fresh-clone, and fake-Codex kickoff behavior through the real installer.

## Program Inputs

The initial inputs are this Program packet, `planning-brief-1.md`, `planning-brief-2.md`, the completed compatibility harness slice in `docs/exec-plans/completed/2026-05-09-worker-install-fixture-harness.md`, the completed recipient ergonomics slice in `docs/exec-plans/completed/2026-05-09-worker-install-recipient-ergonomics.md`, the current Worker installer implementation in `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`, and the package smoke runner in `packages/local-runner/tests/package-smoke.ts`.

Arena CRM remains a reference input for what a useful repo-local runtime looks like, but the productized Worker install should use `apps/worker`, `scripts/run-worker.sh`, `.worker/`, and generated Worker docs instead of copying Arena-specific runtime names.

## Current State

Worker Foundations install now has a source-level compatibility smoke organized around repo-shape compatibility. The default smoke covers blank-slate install success, unclaimed package roots that default to Bun, explicit Bun, npm, and pnpm identities that remain preserved, fresh-clone command execution, generated root README and AGENTS handoff text, Worker-specific `./scripts/run-worker.sh --help`, and fake-Codex kickoff proof.

The Program remains active because conflict and upgrade coverage, polyglot fixtures, an Arena-shaped fixture, and release-gate integration are not complete.

## Progress

- [x] 2026-05-09: Defined the compatibility Program around all practical repo shapes, ready-to-rip kickoff behavior, and both fast CI plus release smoke proof.
- [x] 2026-05-09: Completed the first fixture harness slice with Bun, npm, pnpm, current blank-slate blocker, dry-run no-mutation proof, preserved target identity checks, exact proof-report assertions, fresh clone proof, and fake-Codex kickoff contract proof.
- [x] 2026-05-09: Completed the recipient ergonomics slice with blank-slate install support, unclaimed package Bun defaults, generated README/AGENTS handoff, direct Worker help, six-scenario compatibility smoke, and fake-Codex kickoff proof.
- [ ] Expand the matrix to polyglot, conflict, upgrade, and Arena-shaped fixtures.
- [ ] Decide which compatibility smoke commands are required in CI and which remain release-only.

## Decision Log

Decision: Use a Program instead of a one-off test file.
Rationale: Worker install compatibility spans installer policy, generated docs, package-manager behavior, Codex kickoff, package smoke, and release proof. That needs durable initiative memory above any single test.
Date: 2026-05-09

Decision: Support all practical repo shapes through representative fixtures, not a combinatorial explosion.
Rationale: The installer needs confidence across meaningful dimensions, but every package manager crossed with every framework crossed with every conflict would create slow, low-signal tests. Representative fixtures plus targeted overlays give better confidence.
Date: 2026-05-09

Decision: Treat ready-to-rip as including kickoff, not only file generation.
Rationale: The product promise is a usable Worker operating system. Install proof must show commands, docs, fresh clone behavior, and a successful fake-Codex kickoff path.
Date: 2026-05-09

Decision: Use both fast fixture coverage and slower shipped-artifact smoke.
Rationale: Source-level integration catches regressions quickly, while packed/native smoke proves the artifact a customer actually runs.
Date: 2026-05-09

## Slice Ledger

- `docs/exec-plans/completed/2026-05-09-worker-install-fixture-harness.md` completed the first slice: create the fixture harness, cover the first installing scenarios, record current blank-slate behavior, prove fresh clone command execution, and prove fake-Codex kickoff.
- `docs/exec-plans/completed/2026-05-09-worker-install-recipient-ergonomics.md` completed the second slice from `planning-brief-2.md`: make blank and unclaimed repositories default to Bun, generate recipient README and AGENTS handoff, make direct Worker help useful, and prove the recipient surface through installed and fresh-clone compatibility smoke.

Future slices should cover conflict and upgrade fixtures, polyglot and Arena-shaped fixtures, and release-gate integration.

## Next Slice

The next recommended slice is conflict, upgrade, polyglot, and Arena-shaped fixture coverage. It should add representative fixtures for existing owner README and AGENTS content, incomplete managed markers, rerunning over an already installed Worker surface, a polyglot monorepo with non-JavaScript project areas, and an Arena-shaped repo that proves the installer drops in the standalone Worker system without assuming a single Next.js app.

## Risks and Watchpoints

Do not let this matrix become a fake-package-manager test that only proves shims. When a package manager is part of a supported scenario, the proof must run the real manager or an explicit Corepack-backed manager shim that delegates to the real manager version.

Do not treat `runner-test` as canonical proof. It is useful for manual exploration, but the durable product proof belongs in `packages/local-runner` tests and package smoke.

Do not let generated docs claim more support than the automated fixtures prove. If a repo shape is currently blocked, the Program should say so until the product behavior changes.

## Outcomes & Retrospective

This Program is active. Record the final compatibility matrix, the CI and release smoke split, and any intentionally deferred repo shapes before moving the Program to completed.

## Validation and Acceptance

The Program is complete only when `packages/local-runner` contains a reusable compatibility harness, the default smoke covers the primary repo-shape matrix, shipped package/native smoke proves the customer artifact path, generated README and AGENTS output are recipient-grade, kickoff is proven with fake Codex, JSON mode remains sync-safe, and the target matrix has an explicit policy for every practical repo shape.

Program validation should include `bun run --cwd packages/local-runner worker:compatibility-smoke`, `bun run --cwd packages/local-runner package:smoke`, local runner unit tests, lint, typecheck, format check, and Program/ExecPlan markdown validation.

## Artifacts and Notes

- Compatibility harness: `packages/local-runner/tests/worker-install-compatibility-smoke.ts`
- Harness command: `bun run --cwd packages/local-runner worker:compatibility-smoke`
- Latest harness proof: `worker install compatibility smoke passed (6 scenarios)` with blank-slate, minimal-unclaimed-package, minimal-bun-package, next-npm-single-app, next-pnpm-monorepo, bun-different-version, and fake-Codex kickoff all passing.
- Package smoke command: `bun run --cwd packages/local-runner package:smoke`
- Installer implementation: `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`

## Interfaces and Dependencies

This Program depends on the Worker Foundations install workflow, the local runner CLI command surface, Git-backed temporary fixture repositories, Bun, npm, Corepack-backed pnpm, fake Codex binaries for kickoff proof, Program/ExecPlan lint contracts, and package smoke for the distributed artifact path.
