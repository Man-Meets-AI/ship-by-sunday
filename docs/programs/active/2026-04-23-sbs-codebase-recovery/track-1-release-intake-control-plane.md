# Release Intake Control Plane Research

This research pass captures the release, QA, and engineering-intake findings that should drive the second slice after the CI/CD harness correction.

## Findings

The current worktree already contains release and engineering-intake changes. The most concrete defect is in `qa/scripts/lib/release-intake-export.mjs`, where the blocker slug normalization returns before the intended trimming call can run. The focused unit tests pass today because they do not exercise leading punctuation, trailing punctuation, or long blocker names.

The release triage command advertises kebab-case CLI flags, but the current collector reads underscore-shaped option names. That makes documented operator usage weaker than the implementation expects. The same control-plane surface also has prior drift around stale check selection, deployment metadata, and release candidate proof.

Runtime intake export groups incidents without including the product field, which means unrelated incidents can collapse when they share environment, source, surface, code, and canonical path. The QA inventory currently maps the new intake tests into broad content buckets instead of product-specific release and runtime evidence lanes.

## Durable Implication

The second child ExecPlan should repair the release and intake control plane before any wider cleanup starts. It should not reconcile or execute the existing active Dub-style harness plan directly; the first CI/CD correction slice should retire or supersede that stale plan state before this slice runs.
