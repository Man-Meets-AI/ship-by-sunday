# Normalized Track 0

## Facts

The Dub-style harness plan is the wrong direction. Recent remote evidence shows the repository's working CI/CD path is the existing `Dev Staging Proof` on `dev` plus `CI`, `Production Release Proof`, and `Convex Production Deploy` on `main`. The recurring failures are `Sandbox E2E Nightly` and the unproven or failed `Deployment Smoke` lane, not the core release path.

## Recommendation

Make CI/CD harness retirement and working-path codification the first child ExecPlan. Move release/intake repair to the second slot.

## Risks

The main risk is leaving the old active Dub-style plan available for execution. It should be explicitly retired, superseded, or moved out of the active lane before later implementation work starts.

## Code Seams

Key seams include `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/convex-production-deploy.yml`, `.github/workflows/sandbox-e2e-nightly.yml`, `docs/release-workflow.md`, `qa/README.md`, and `docs/exec-plans/active/2026-04-15-dub-style-ci-cd-test-harness-reset.md`.

## Proposed Slices

This track maps to `docs/exec-plans/active/2026-04-24-retire-dub-style-harness-and-codify-cicd.md`.
