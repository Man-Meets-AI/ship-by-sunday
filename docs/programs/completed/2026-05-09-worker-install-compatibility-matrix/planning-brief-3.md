---
title: Worker Install Conflict Upgrade Matrix Planning Brief 3
program_id: worker-install-compatibility-matrix
brief_version: 3
status: current
summary: Harden Worker install around lockfile-owned identities, managed marker conflicts, owner files, package-manager preflight, and expanded compatibility fixtures.
read_when:
  - Writing the Worker install conflict and upgrade matrix ExecPlan.
  - Reviewing whether Worker install is safe for owner-authored recipient repositories.
---

# Worker Install Conflict Upgrade Matrix Planning Brief 3

The next child ExecPlan should be titled `Ship Worker Install Conflict Upgrade Matrix`.

The goal is to make Worker install safe across owner-authored repositories and reruns. Blank repositories and unclaimed packages should still default to Bun, but lockfile-owned npm and Bun roots must be detected without writing or rewriting a `packageManager` identity. Explicit npm, pnpm, Yarn, and Bun identities must stay preserved.

The installer must block before mutation when it finds unsafe managed-section markers, owner-authored same-name package scripts, owner-authored `scripts/run-worker.sh`, or owner-authored files under `apps/worker`. Duplicate and partial README or AGENTS managed markers should block just like incomplete markers. Dry-run must remain read-only even for blocked scenarios, and JSON output must remain sync-safe.

Package-manager proof should fail during preflight, before repository mutation, when a non-Bun root identity is detected but the corresponding command is unavailable. Worker-managed Bun should not mask a valid `BUN` override in the generated launcher, and stale managed Bun binaries should not break `./scripts/run-worker.sh`.

The generated Worker package should not include an invalid placeholder Bun lockfile. If the exact legacy placeholder exists from an earlier Worker-managed install, a rerun may remove it as Worker-owned cleanup; unrelated owner files must not be deleted.

The compatibility smoke should expand to cover Yarn, lockfile-owned npm and Bun roots, a polyglot repository, an Arena-shaped repository with legacy `./scripts/run-runtime.sh ...` Worker root scripts, direct `./scripts/run-worker.sh worker:test`, fresh-clone command execution, and fake Codex kickoff. Update the Program packet and completed ExecPlan with the final proven scenario count and any intentionally deferred release-gate work.
