# CI/CD Harness Retirement Research

This research pass captures the correction that the Dub-style CI/CD harness plan should not be implemented.

## Findings

The active Dub-style CI/CD harness plan describes deleting or replacing surfaces that the current repository still uses and that recent remote runs show are working. The local workflow set still includes `ci.yml`, `dev-staging-proof.yml`, `production-release-proof.yml`, `convex-production-deploy.yml`, `sandbox-e2e-nightly.yml`, and `issue-labels.yml`.

Recent remote evidence shows that `Dev Staging Proof` is the working `dev` proof surface. The latest checked run on `dev` was successful on 2026-04-21 for commit `36c8360da5d94d9be2ac4485d935389fa5b4fe52`, with green `release_scope`, `default_ship`, and `release_gate` jobs.

Recent production evidence shows that `main` releases rely on a green trio: `CI`, `Production Release Proof`, and `Convex Production Deploy`. On 2026-04-21, commit `3c5347c06c039859b7780a61e331cebda9421aea` had green runs for all three. Scheduled `CI` also succeeded on 2026-04-24. The unstable surfaces are different: `Sandbox E2E Nightly` has recurring scheduled failures, and `Deployment Smoke` only showed a failed deployment-status run in the inspected history.

## Durable Implication

The first child ExecPlan should retire the Dub-style harness direction and codify the working dev and production CI/CD path from actual remote evidence. It should preserve and clarify working surfaces before any release/intake repair or broader cleanup begins.
