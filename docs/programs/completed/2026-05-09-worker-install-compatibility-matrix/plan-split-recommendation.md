---
title: Worker Install Compatibility Plan Split
summary: Recommended slice split for the Worker install compatibility matrix.
docType: planning
status: active
read_when:
  - Choosing the next Worker install compatibility slice.
  - Avoiding an oversized compatibility implementation.
---

# Worker Install Compatibility Plan Split

The first slice should create the compatibility fixture harness and prove the first practical scenarios: current blank-slate blocker, Bun package, npm app, pnpm monorepo, Bun different-version repo, fresh clone execution, and fake-Codex kickoff.

The second slice should implement blank-slate Bun defaults and generated recipient README/AGENTS ergonomics, then update the harness to expect blank-slate install success instead of a blocker.

The third slice should add conflict and upgrade fixtures for owner-authored README, AGENTS, `scripts/run-worker.sh`, `apps/worker`, root package scripts, legacy runtime scripts, and existing Worker-managed files.

The fourth slice should add polyglot and Arena-shaped fixtures plus release-gate integration for packed and native executable smoke.
