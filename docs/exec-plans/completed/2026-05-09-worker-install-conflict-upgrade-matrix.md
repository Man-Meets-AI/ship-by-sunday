---
title: Ship Worker Install Conflict Upgrade Matrix
status: complete
created_at: 2026-05-09
completed_at: 2026-05-09
summary: Harden Worker install compatibility around lockfile identity, marker conflicts, owner files, package-manager preflight, launcher behavior, and expanded repo fixtures.
post_build_recap: Worker install now preserves lockfile-owned npm/Bun roots without adding packageManager, blocks duplicate or partial managed markers and owner apps/worker files before mutation, preflights non-Bun package-manager commands, removes the legacy Worker placeholder Bun lockfile on recognized reruns, respects BUN over stale managed Bun, supports direct worker:test, and proves an 11-scenario compatibility smoke including Yarn, polyglot, Arena-shaped, fresh-clone, and fake-Codex kickoff paths.
program_id: worker-install-compatibility-matrix
planning_brief: docs/programs/completed/2026-05-09-worker-install-compatibility-matrix/planning-brief-3.md
read_when:
  - Reviewing Worker install conflict and upgrade compatibility.
  - Changing Worker install package-manager detection or managed file blockers.
  - Updating the Worker install compatibility smoke matrix.
---

# Ship Worker Install Conflict Upgrade Matrix

This is a living execution plan for hardening Worker Foundations install around owner-authored repositories and reruns.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After this slice, Worker install should be safe to run against practical repositories that already have package-manager identity, owner docs, app directories, or previous Worker-managed output. The installer should mutate only after preflight proves the target is compatible, and the compatibility smoke should prove the expanded support matrix through real installed commands.

## Progress

- [x] 2026-05-09: Created planning brief 3 and this child ExecPlan.
- [x] 2026-05-09: Preserved lockfile-owned Bun and npm roots without writing `packageManager`.
- [x] 2026-05-09: Added duplicate and partial README/AGENTS managed-marker blockers.
- [x] 2026-05-09: Added owner `apps/worker` file blockers while allowing exact legacy Worker placeholder lockfile cleanup.
- [x] 2026-05-09: Added preflight checks for detected non-Bun package-manager commands.
- [x] 2026-05-09: Updated the generated launcher to respect `BUN`, ignore stale managed Bun versions, and support direct `worker:test`.
- [x] 2026-05-09: Removed the generated invalid Worker placeholder `apps/worker/bun.lock`.
- [x] 2026-05-09: Expanded compatibility smoke to Yarn, lockfile-owned npm/Bun roots, polyglot, Arena-shaped, direct Worker test, fresh-clone, and fake-Codex kickoff proof.
- [x] 2026-05-09: Ran focused validation and completed this plan.

## Surprises & Discoveries

Bun 1.3.5 deletes an empty lockfile for a no-dependency package, so generating a placeholder `apps/worker/bun.lock` was worse than omitting the file. The safe upgrade path is to remove only the exact legacy Worker-managed placeholder during a recognized rerun and continue blocking all owner-authored files under `apps/worker`.

## Decision Log

Decision: Do not add `packageManager` for lockfile-owned Bun roots.
Rationale: A lockfile can identify the package manager without authorizing the installer to claim package-manager identity in package.json.
Date: 2026-05-09

Decision: Treat duplicate managed markers as blockers.
Rationale: Replacing only the first managed block would leave stale Worker-owned content and can overwrite the wrong area of owner docs.
Date: 2026-05-09

Decision: Preflight non-Bun package-manager commands before mutation.
Rationale: npm, pnpm, and Yarn proof runs through the recipient root package manager; missing commands must fail while the repository is still unchanged.
Date: 2026-05-09

Decision: Keep Windows blocked for this installer slice.
Rationale: The generated recipient surface is POSIX shell based. Advertising a Windows Bun asset without a Windows launcher would overstate support.
Date: 2026-05-09

## Outcomes & Retrospective

This slice completed the conflict and upgrade matrix from planning brief 3. The installer now preserves lockfile-owned npm and Bun package identities, blocks duplicate or partial managed README/AGENTS markers, blocks owner-authored files under `apps/worker`, preflights missing non-Bun package-manager commands before writes, and keeps JSON blocker output free of owner script bodies or source content.

The generated launcher now honors a `BUN` override before considering the Worker-managed Bun path, only uses the managed Bun when it reports version `1.3.5`, and maps direct `./scripts/run-worker.sh worker:test` to the Worker test script. Fresh installs no longer generate the invalid placeholder Worker Bun lockfile, while reruns remove only the exact legacy placeholder as Worker-owned cleanup.

The compatibility smoke now proves 11 scenarios: blank-slate, minimal-unclaimed-package, bun-lockfile-owned-package, npm-lockfile-owned-package, minimal-bun-package, next-npm-single-app, next-pnpm-monorepo, next-yarn-monorepo, bun-different-version, polyglot-standalone, arena-shaped-runtime, plus fake-Codex kickoff.

## Context and Orientation

The Worker installer lives in `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`. It inspects target package-manager identity and managed-file conflicts, writes the Worker surface, proves installed commands, writes sync-safe install proof, and optionally starts Codex.

The compatibility smoke lives in `packages/local-runner/tests/worker-install-compatibility-smoke.ts`. It creates temporary Git repositories, runs dry-run and install paths, verifies root package-manager commands plus direct Worker commands, clones the installed repository, and proves fake Codex kickoff.

### In Scope

Harden package-manager identity handling, README/AGENTS marker safety, owner `apps/worker` blockers, non-Bun package-manager command preflight, generated shell launcher behavior, legacy placeholder lockfile cleanup, and compatibility smoke scenarios for Yarn, lockfile-owned roots, polyglot, and Arena-shaped repositories.

### Out Of Scope

Do not implement a Windows launcher in this slice. Do not change release-gate placement for the compatibility smoke beyond documenting that it remains the next Program slice.

## Plan of Work

First, adjust installer preflight so unsafe target states block before mutation. This includes duplicate and partial managed markers, owner-authored files under `apps/worker`, missing package-manager commands for npm, pnpm, or Yarn roots, and unsupported Windows installs.

Second, adjust apply behavior so package-manager identity is only claimed for blank or unclaimed roots, not lockfile-owned roots. Remove the invalid Worker placeholder Bun lockfile from fresh installs and clean up only the exact legacy Worker placeholder during recognized reruns.

Third, update the generated launcher and Worker package scripts so help, `BUN` override behavior, stale managed Bun handling, package-manager proof, and direct `worker:test` all work through the same installed surface.

Fourth, add focused unit regressions and expand the compatibility smoke to cover the practical repo shapes and upgrade cases described in planning brief 3.

## Milestones

Milestone 1 hardens preflight and identity policy. Success means blocked scenarios remain mutation-free and lockfile-owned package roots keep their existing identity.

Milestone 2 hardens the generated Worker runtime surface. Success means direct launcher help and tests work, stale managed Bun does not mask `BUN`, and fresh installs do not include an invalid Worker lockfile.

Milestone 3 expands and validates the matrix. Success means unit tests and the 11-scenario compatibility smoke pass, and Program documentation records the proven coverage.

## Concrete Steps

Update the installer and focused tests, then run:

    bun run --cwd packages/local-runner test -- worker-foundations-install
    bun run --cwd packages/local-runner worker:compatibility-smoke

Update the Program packet and this completed plan, then run:

    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-09-worker-install-conflict-upgrade-matrix.md
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-09-worker-install-compatibility-matrix docs/exec-plans/completed/2026-05-09-worker-install-conflict-upgrade-matrix.md

## Validation and Acceptance

Acceptance requires the focused Worker install tests to cover lockfile-owned identity preservation, missing non-Bun package-manager preflight, duplicate managed markers, owner `apps/worker` blockers, legacy placeholder cleanup, stale managed Bun plus `BUN` override, and dry-run mutation safety. The compatibility smoke must pass with all 11 scenarios and fake-Codex kickoff.

### Test Commands

Focused Worker install tests:

    bun run --cwd packages/local-runner test -- worker-foundations-install

Expanded compatibility smoke:

    bun run --cwd packages/local-runner worker:compatibility-smoke

Package validation:

    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check

Program and plan validation:

    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-09-worker-install-conflict-upgrade-matrix.md
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-09-worker-install-compatibility-matrix docs/exec-plans/completed/2026-05-09-worker-install-conflict-upgrade-matrix.md

## Idempotence and Recovery

Rerunning install over recognized Worker output should not duplicate README or AGENTS managed blocks. Rerunning over an exact legacy Worker placeholder `apps/worker/bun.lock` should remove that placeholder; any other owner-authored `apps/worker` file should block before mutation. If compatibility smoke fails, each scenario creates a fresh temporary repository, so rerun the named scenario after fixing the targeted case.

## Artifacts and Notes

The code artifacts are `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`, `packages/local-runner/tests/worker-foundations-install.test.ts`, and `packages/local-runner/tests/worker-install-compatibility-smoke.ts`.

The Program artifacts are `docs/programs/completed/2026-05-09-worker-install-compatibility-matrix/planning-brief-3.md`, `docs/programs/completed/2026-05-09-worker-install-compatibility-matrix/current-planning-brief.txt`, and `docs/programs/completed/2026-05-09-worker-install-compatibility-matrix/program.md`.

## Interfaces and Dependencies

This slice depends on Git-backed temporary fixtures, Bun 1.3.5, npm, Corepack-backed pnpm and Yarn, POSIX `scripts/run-worker.sh`, root package-manager script semantics, managed README/AGENTS markers, and sync-safe JSON install reporting.
