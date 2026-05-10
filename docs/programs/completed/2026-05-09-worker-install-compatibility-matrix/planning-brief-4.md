---
title: Worker Install Release Gate Integration Planning Brief 4
program_id: worker-install-compatibility-matrix
brief_version: 4
status: current
summary: Decide and document the CI, source-check, package-smoke, and release-proof placement for the completed Worker install compatibility matrix.
read_when:
  - Completing the Worker install compatibility Program.
  - Checking why Worker compatibility smoke runs in CI instead of release proof.
---

# Worker Install Release Gate Integration Planning Brief 4

The next child ExecPlan should be titled `Complete Worker Install Release Gates`.

The goal is to close the Worker install compatibility Program by making the release-gate placement explicit and durable. The expanded 11-scenario source compatibility smoke should remain the authoritative matrix proof. It should run from the root `test:worker-compatibility-smoke` script, be included in root `check:source`, and have its own CI step in the required static job.

The package smoke should remain the shipped-artifact proof. It should build the local-runner CLI, run the package smoke through the packed and native command paths, and keep a package-manager dry-run check so the distributed command path respects non-Bun package-manager identity. It does not need to duplicate the full 11-scenario matrix because that would make release proof slower without proving a different contract.

Do not add Worker compatibility smoke to hosted production release proof. Worker install compatibility is a local repository mutation and generated-artifact contract, not a hosted web production behavior. The correct gates are local source validation, package smoke, and CI static validation.

After recording this decision, update the Program packet to `status: complete`, fill `completed_at` and `post_build_recap`, write the retrospective, update the active/completed Program indexes, and move the Program folder from `docs/programs/active/` to `docs/programs/completed/`. Update any Program-linked ExecPlan `planning_brief` paths so they point at the completed Program packet location.
