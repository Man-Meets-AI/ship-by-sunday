# Generated Repo Autonomy Dependency Graph

## Slice Dependencies

Build Pack Readiness Manifest has no prior implementation dependency. It depends only on existing canonical facts, generated Build Pack renderers, repo-generation materialization, and compiler tests.

Derived First Slice Planner depends on the readiness manifest because it should reuse the confidence state, blockers, and weak-fact signals instead of creating a second planning truth source.

Validation Command Resolver depends on the first readiness manifest command model, but the first slice may introduce the initial typed resolver if needed to stop shell-comment fallbacks.

Review And Verification Pack depends on the readiness manifest and typed validation entries so review proof can reference runnable, manual, and blocked evidence consistently.

Weak Fact Detection is partially introduced in the first slice and can be expanded later after the manifest establishes where warnings and blockers appear.

Clean-Room Replay Proof depends on generated docs and command manifests being parseable enough to exercise from a materialized repo without chat history.

Regression Snapshots depend on the manifest shape becoming stable enough to parse rather than assert only substrings.

## Critical Path

The critical path starts with a deterministic readiness file, then improves first-slice derivation, then hardens validation commands and review proof, then adds clean-room replay and structural regression snapshots.

## Parallel Work

No later child slice should run until the readiness manifest lands, because the manifest defines the shared vocabulary for command state, confidence, blockers, and customer-input work.
