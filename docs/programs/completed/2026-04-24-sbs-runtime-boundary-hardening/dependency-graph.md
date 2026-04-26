# Dependency Graph

This graph records the intended order for child ExecPlans in this Program.

## Graph

1. Harden client observability transport starts first. It is isolated, lowers telemetry noise, and establishes that browser reporting is best-effort. Status: complete.
2. Server-own bonus lesson view tracking follows. It changes auth-sensitive write ownership and should use the cleaner observability baseline for any client-side failure reporting. Status: complete.
3. Split Codex app-server route boundary follows the two smaller runtime hardening slices. It is the highest-risk server route slice because it touches process execution boundaries and route imports. Status: complete.
4. Harden public metadata routes follows the Codex route boundary work. It is public-route hardening with lower implementation coupling, and it should not absorb Codex runtime concerns. Status: complete.

## Critical Path

The fastest useful path is:

client observability transport -> bonus lesson server tracking -> Codex app-server route boundary -> public metadata routes.

No implementation slice remains on the critical path. The remaining Program action is completion-review bookkeeping after unrelated worktree validation blockers are resolved or accepted as external.

## Parallel Path

The public metadata route research can be read-only while earlier slices execute. Do not implement metadata dependency changes in parallel with Codex route boundary changes unless the write sets stay separate and each child ExecPlan remains current.
