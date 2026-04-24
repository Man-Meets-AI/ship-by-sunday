# Normalized Track 1

## Facts

The release and intake control plane is the next thing to fix after the rejected CI/CD harness direction is retired, because it tells the team whether the rest of the app is safe to ship. The current dirty work includes a concrete slug-normalization bug, option-parsing drift, weak grouping boundaries, and generic QA inventory mapping.

## Recommendation

Write the second child ExecPlan around release and intake correctness. It should repair the current dirty release/intake work after the dedicated CI/CD correction slice has retired or superseded the active Dub-style harness plan.

## Risks

The main risk is creating another release plan that competes with the dedicated CI/CD correction slice. This slice should not update or execute the rejected harness plan; it should depend on that plan being retired or clearly superseded first.

## Code Seams

Key seams include `qa/scripts/lib/release-intake-export.mjs`, `qa/scripts/lib/release-triage-source.mjs`, `qa/scripts/lib/release-triage.mjs`, `apps/web/features/observability/export/runtime-intake.mjs`, `qa/test-inventory.csv`, and the CI/CD correction slice that retires the rejected harness direction.

## Proposed Slices

This track maps to `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`.
