---
title: Worker Install Compatibility Decision Packet
summary: Converged decisions for proving Worker Foundations install across repo shapes.
docType: decision
status: active
read_when:
  - Reviewing Worker install compatibility policy.
  - Deciding whether a scenario belongs in fast CI or release smoke.
---

# Worker Install Compatibility Decision Packet

The Worker install compatibility matrix should be owned by `packages/local-runner` tests and this Program, not by the disposable `runner-test` repository.

The first harness should run the real installer against temporary Git repositories. Dry-run proof must assert no repo mutation. Mutating install proof must assert proof commands, tracked install report, clean worktree, root package-manager command execution, direct `scripts/run-worker.sh` execution, and fresh clone execution.

Fake-Codex kickoff is part of the product contract. JSON install mode should continue to block kickoff unless `--no-kickoff` is explicit, but non-JSON install proof should include one successful fake-Codex kickoff path.

Package-manager proof should preserve target repo identity. Bun and npm can run directly in the current environment. pnpm proof should use a Corepack-backed `pnpm` shim so the command is still the real pnpm package manager rather than a fake script runner.
