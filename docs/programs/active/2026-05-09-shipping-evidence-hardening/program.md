---
program_id: shipping-evidence-hardening
title: Shipping Evidence Hardening
status: active
created_at: 2026-05-09
completed_at: null
summary: Harden the test, CI, staging, production preflight, and generated-repo evidence surfaces so releases are judged by risk-matched proof instead of ambient green checks.
post_build_recap: null
read_when:
  - Deciding which proof must exist before shipping billing, auth, Convex, or generated-codebase changes.
  - Splitting test infrastructure hardening into bounded ExecPlans.
  - Checking how CI, staging, production preflight, and generated repo validation should converge.
---

# Shipping Evidence Hardening

This Program is a living initiative document for turning the current test and release proof system into a risk-matched shipping evidence system.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The goal is not more tests for their own sake. The goal is that every release has the exact evidence needed for the risk it carries: unit and integration confidence before merge, hosted rehearsal where money/auth/config can drift, and production preflight that proves live configuration without pretending test-mode payment success proves production.

The initiative is moving correctly when CI covers every shipped workspace, Convex and billing-sensitive changes fail closed, staging is a clear rehearsal lane instead of an ambiguous branch, production proof binds to the exact deployed commit and config, and generated customer repos only advertise runnable validation commands.

## Program Inputs

The initial inputs are this Program packet, `research-pass-test-infrastructure-hardening.md`, `normalized-pass-shipping-evidence-hardening.md`, `converged-decision-packet.md`, `dependency-graph.md`, `plan-split-recommendation.md`, `cross-repo-review.md`, and `planning-brief-1.md`.

The codebase inputs are `apps/web/vitest.config.ts`, `apps/web/playwright.config.ts`, `.github/workflows/ci.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/dev-staging-payment-proof.yml`, `.github/workflows/convex-production-deploy.yml`, `.github/workflows/release.yml`, `scripts/release/`, `apps/web/convex/`, `apps/web/platform/billing/`, `packages/codebase-compiler/`, and the generated customer repo renderers under `packages/codebase-compiler/src/repo-generation/`.

The operator contract inputs are `AGENTS.md`, `apps/web/AGENTS.md`, `docs/release-workflow.md`, `.github/workflows/README.md`, `apps/web/content/docs/local-qa.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, and `apps/web/content/docs/stripe-checkout-webhook.mdx`.

## Current State

The repo already has useful test infrastructure. `apps/web` has Vitest unit, contract, integration, and integration-ui projects plus Playwright sandbox e2e. CI runs documented `static` and `integration` jobs. The release system has dev payment staging, production release proof, Convex production deploy, and tag release evidence.

The current gap is evidence alignment. CI is mostly app-centered and does not run package workspace tests, package typechecks, package smoke scripts, root script tests, or the critical coverage gate. Convex-sensitive changes are detected but not used by production proof. Billing tests cover important checkout and webhook branches, but the runtime proof is mocked more than hosted Convex, and production preflight is conditional and coarse. Generated customer repos can advertise validation commands that the generated snapshot cannot actually run.

## Progress

- [x] 2026-05-09: Completed the initial multi-agent research pass across test harness, CI/release gates, billing/auth/entitlement paths, staging/preflight infrastructure, and generated customer repo output.
- [x] 2026-05-09: Created this Program packet to preserve the research and split the work into bounded implementation slices.
- [ ] Land the first CI baseline slice so the required merge gate covers all shipped workspaces and the critical app coverage gate.
- [ ] Add Convex/runtime and billing webhook hardening slices.
- [ ] Add production preflight and release evidence hardening slices.
- [ ] Add generated customer repo command-contract proof.

## Decision Log

Decision: Use a Program instead of one ExecPlan.
Rationale: The work spans CI, app tests, Convex runtime behavior, Stripe billing proof, staging, production preflight, release evidence, and generated customer repo contracts. One ExecPlan would either be too broad to execute safely or would lose context between slices.
Date: 2026-05-09

Decision: Treat shipping evidence as the product, not test count.
Rationale: The research showed that the repo already has many tests. The weak points are missing risk gates, optional preflight, mocked Convex runtime behavior, and proof artifacts that can look greener than the underlying deployment state.
Date: 2026-05-09

Decision: Keep dev payment staging separate from release authority.
Rationale: `dev.man-meets-ai.com` is useful for Stripe test-mode rehearsal, but release authority remains `main`, production Vercel, Convex production deploy, production proof, and protected release tags.
Date: 2026-05-09

Decision: Make generated customer repo validation a first-class track.
Rationale: The shipped Codebase is part of the product. If it advertises commands or CI examples that are not runnable, the internal repo can be green while the customer artifact is misleading.
Date: 2026-05-09

Decision: Preserve cheap PR gates for a broke-startup operating model.
Rationale: Every PR should run fast source-level proof. Hosted browser, Stripe, Vercel, Clerk, Convex, and production preflight checks should be conditional, post-merge, nightly, or manual unless a child ExecPlan proves they are cheap and reliable enough for every PR.
Date: 2026-05-09

Decision: Verify live required-check enforcement before changing required context names.
Rationale: The branch-protection and ruleset APIs were plan-gated during research, so the first CI slice should discover the live enforcement shape through available GitHub surfaces and preserve `static` and `integration` unless it intentionally updates branch-protection docs and operator guidance.
Date: 2026-05-09

Decision: Put the reusable feature-risk testing rubric in root `AGENTS.md`.
Rationale: Future agents need the risk/testing standard before writing code or plans. Root instructions are the most reliable place to make P0/P1/P2/P3 risk classification and feature test briefs a default habit.
Date: 2026-05-09

## Slice Ledger

No child ExecPlan exists yet.

Recommended child slices:

- CI and workspace baseline: aggregate package tests, package typechecks, package smoke scripts, root script tests, and `test:coverage:critical` into the intended required gate without making hosted proof part of every PR.
- Convex and billing runtime harness: add real Convex runtime coverage where appropriate, close entitlement identity and retry-secret validation gaps, and harden Stripe webhook idempotency and duplicate/out-of-order evidence.
- Staging and production preflight: make environment, Vercel alias, Convex deploy mode, Stripe live object, webhook endpoint, and observability checks explicit and fail-closed.
- Release evidence truthfulness: make tag evidence consume proof summaries/artifacts rather than only check-run conclusions.
- Generated customer repo proof: materialize a generated repo and run the advertised command contract in a clean-room fixture.

## Next Slice

The next recommended slice is the CI and workspace baseline. It should make the required source gate represent the whole repo by adding or wiring aggregate scripts for package tests, package typechecks, package smoke commands where they are cheap enough, root script tests, and the existing critical app coverage gate. It should verify the live required-check enforcement shape before changing check names, preserve `static` and `integration` unless there is a deliberate docs-backed reason to change them, and avoid hosted staging or production proof. The desired outcome is a fast, deterministic merge gate whose omissions are intentional and documented.

## Risks and Watchpoints

Do not turn every PR into a slow hosted browser or Stripe run. Use source-level gates for every PR, conditional or post-merge hosted proof for environment-sensitive paths, and nightly/manual runs for expensive lifecycle proof.

Do not ignore CI cost. This repo should bias toward cheap, deterministic checks on PRs and reserve expensive provider-backed proof for risky paths, `main`, nightly, release, or manual runs.

Do not let path detection fail open for money, auth, Convex, or release proof changes. If the detector is unsure, the relevant gate should run.

Do not treat production proof as green when it only proves a workflow conclusion. The proof must identify which deployment, alias, Convex mode, and billing/auth/entitlement states were actually verified.

Do not rewrite the billing product flow while hardening tests unless a test exposes a real defect that must be fixed before the harness can be trusted.

Do not ship generated customer repo commands that the generated snapshot cannot run.

## Outcomes & Retrospective

This Program is active. Record the final source-gate shape, the staging policy, the production preflight contract, the release evidence schema behavior, the generated customer repo proof surface, and any intentionally deferred high-cost checks before moving the Program to completed.

## Validation and Acceptance

The Program is complete only when the repo has a documented and enforced source gate for all shipped workspaces, Convex/runtime coverage for critical backend contracts, billing webhook and checkout evidence that covers idempotency and delayed fulfillment, a staging lane with explicit authority boundaries, production preflight that verifies live config without unsafe live-card testing, release evidence that cannot hide skipped deploys, and generated customer repo proof that runs the commands the customer artifact advertises.

Program-level validation should include `bun run programs:lint`, relevant child ExecPlan lint, updated CI workflow proof, focused app/package tests for touched slices, release proof dry-runs where release orchestration changes, and a clean-room generated repo command-contract proof before the generated-output track is complete.

## Artifacts and Notes

- CI workflow: `.github/workflows/ci.yml`
- Production proof workflow: `.github/workflows/production-release-proof.yml`
- Dev payment staging workflow: `.github/workflows/dev-staging-payment-proof.yml`
- Convex deploy workflow: `.github/workflows/convex-production-deploy.yml`
- Tag release workflow: `.github/workflows/release.yml`
- Release scope classifier: `scripts/release/lib/release-scope.mjs`
- Billing paths: `apps/web/platform/billing/`, `apps/web/convex/stripeWebhook.ts`, `apps/web/convex/checkoutClaims.ts`, `apps/web/convex/checkoutClaimsActions.ts`
- Generated repo scripts: `packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts`

## Interfaces and Dependencies

This Program depends on GitHub Actions, branch protection or rulesets, Vercel deployment metadata and aliases, hosted Convex dev and production deployments, Stripe test and live mode configuration, Clerk environments, Playwright release personas, package workspace scripts, Program and ExecPlan lint contracts, and generated Codebase snapshot rendering.
