---
title: Ship By Sunday Codebase Recovery Planning Brief 2
program_id: sbs-codebase-recovery
brief_version: 2
status: current
summary: Reorder the recovery program so rejected Dub-style CI/CD harness retirement and proven CI/CD codification run before release and intake repair.
read_when:
  - Writing child ExecPlans after the Dub-style harness direction was rejected.
  - Checking the updated first recovery slice.
---

# Ship By Sunday Codebase Recovery Planning Brief 2

## Goal

Use actual remote CI/CD evidence to correct the Program order. The old Dub-style harness direction should be thrown out, and the first slice should codify the working `dev` and `main` release path before the release/intake repair slice runs.

## Current Facts

The local repo still has `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/convex-production-deploy.yml`, `.github/workflows/sandbox-e2e-nightly.yml`, and `.github/workflows/issue-labels.yml`.

Remote `dev` evidence shows `Dev Staging Proof` working. Run `24736371175`, created 2026-04-21, passed on commit `36c8360da5d94d9be2ac4485d935389fa5b4fe52`.

Remote `main` evidence shows the production path working through `CI`, `Production Release Proof`, and `Convex Production Deploy`. Runs `24736015264`, `24736015243`, and `24736015267`, all created 2026-04-21 for commit `3c5347c06c039859b7780a61e331cebda9421aea`, passed. Scheduled `CI` also passed on 2026-04-24. `Sandbox E2E Nightly` failed repeatedly in the inspected scheduled runs, and `Deployment Smoke` had a failed deployment-status run on 2026-04-17.

## Child ExecPlan Sequence

The first child ExecPlan should be `docs/exec-plans/active/2026-04-24-retire-dub-style-harness-and-codify-cicd.md`.

The second child ExecPlan should be `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`.

The third child ExecPlan should be `docs/exec-plans/active/2026-04-23-remove-runtime-footguns.md`.

The fourth child ExecPlan should be `docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md`.

The fifth child ExecPlan should be `docs/exec-plans/active/2026-04-23-split-blueprint-and-workbench-systems.md`.

The sixth child ExecPlan should be `docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md`.

The seventh child ExecPlan should be `docs/exec-plans/active/2026-04-23-reduce-design-dependency-sprawl.md`.

## Boundaries

Do not implement the Dub-style harness reset. Do not delete working CI/CD surfaces just because the old plan says to. The first slice should retire or supersede that plan, document the working remote path, and identify broken or unproven lanes separately.

## Validation

The updated first child plan is valid when `bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-retire-dub-style-harness-and-codify-cicd.md` passes. Program packet updates are valid when the current brief pointer names this file and the child plan sequence in `program.md` matches this brief.
