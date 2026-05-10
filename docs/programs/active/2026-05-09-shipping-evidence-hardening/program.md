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

The initial inputs are this Program packet, `research-pass-test-infrastructure-hardening.md`, `normalized-pass-shipping-evidence-hardening.md`, `converged-decision-packet.md`, `dependency-graph.md`, `plan-split-recommendation.md`, `cross-repo-review.md`, `planning-brief-1.md`, and `planning-brief-2.md`.

The codebase inputs are `apps/web/vitest.config.ts`, `apps/web/playwright.config.ts`, `.github/workflows/ci.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/dev-staging-payment-proof.yml`, `.github/workflows/convex-production-deploy.yml`, `.github/workflows/release.yml`, `scripts/release/`, `apps/web/convex/`, `apps/web/platform/billing/`, `packages/codebase-compiler/`, and the generated customer repo renderers under `packages/codebase-compiler/src/repo-generation/`.

The operator contract inputs are `AGENTS.md`, `apps/web/AGENTS.md`, `docs/release-workflow.md`, `.github/workflows/README.md`, `apps/web/content/docs/local-qa.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, and `apps/web/content/docs/stripe-checkout-webhook.mdx`.

## Current State

The repo already has useful test infrastructure. `apps/web` has Vitest unit, contract, integration, and integration-ui projects plus Playwright sandbox e2e. CI runs documented `static` and `integration` jobs. The release system has dev payment staging, production release proof, Convex production deploy, and tag release evidence.

The first CI baseline slice has been landed. `static` now runs app and package lint, the app format check, package typechecks, app unit tests, app contract tests, package tests, root script tests, critical coverage, package smoke, worker compatibility smoke, and the app build. `integration` remains the app integration suite.

The Convex and billing runtime hardening slice has been landed. `productAccessGrants.clerkUserId` is now characterized as the current Clerk-id contract, Convex retry-secret validation matches Next.js, unpaid signed-in Checkout completion is accepted without access fulfillment, and Stripe webhook processing uses a schema-backed `stripeWebhookEvents` ledger for terminal duplicates and retryable failures. Production proof now consumes Convex-sensitive release scope and waits for the same-commit Convex production deploy when Convex code changes.

The remaining gap is generated customer repo proof. Release evidence now consumes same-commit proof summary artifacts from push or manual production proof runs instead of loose check-run conclusions.

## Progress

- [x] 2026-05-09: Completed the initial multi-agent research pass across test harness, CI/release gates, billing/auth/entitlement paths, staging/preflight infrastructure, and generated customer repo output.
- [x] 2026-05-09: Created this Program packet to preserve the research and split the work into bounded implementation slices.
- [x] 2026-05-09: Created the first child ExecPlan for the CI and workspace baseline slice, now completed at `docs/exec-plans/completed/2026-05-09-shipping-evidence-ci-baseline.md`.
- [x] 2026-05-09: Landed the first CI baseline slice so the required merge gate covers all shipped workspaces and the critical app coverage gate.
- [x] 2026-05-09: Created `planning-brief-2.md` and child ExecPlan `docs/exec-plans/completed/2026-05-09-convex-billing-runtime-hardening.md` for the Convex and billing runtime slice.
- [x] 2026-05-09: Completed Milestone 1 of the active Convex/billing runtime slice: retry-secret validation, identity characterization, and pending Checkout webhook handling.
- [x] 2026-05-09: Completed the Convex/runtime and billing webhook hardening slice: schema-backed Stripe webhook event ledger, retryable failure records, duplicate-event tests, hosted Convex dry-run, and Convex-sensitive production proof wiring.
- [x] 2026-05-10: Created `planning-brief-3.md` and child ExecPlan `docs/exec-plans/active/2026-05-10-production-preflight-hardening.md` for the production preflight slice.
- [x] 2026-05-10: Completed the production preflight hardening slice: production Vercel alias enforcement, Stripe webhook endpoint preflight, dev staging webhook preflight, release billing doctor webhook checks, and live no-card billing proof safety.
- [x] 2026-05-10: Created `planning-brief-4.md` and child ExecPlan `docs/exec-plans/active/2026-05-10-release-evidence-truthfulness.md` for release evidence truthfulness.
- [x] 2026-05-10: Completed the release evidence truthfulness slice: tag evidence now downloads same-commit production and Convex proof summaries, derives proof states from validated artifacts, and preserves proof run metadata.
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

Completed child ExecPlan:

- `docs/exec-plans/completed/2026-05-09-shipping-evidence-ci-baseline.md`: landed the cheap CI and workspace source-gate baseline.
- `docs/exec-plans/completed/2026-05-09-convex-billing-runtime-hardening.md`: hardened Convex retry-secret validation, current Clerk-id entitlement characterization, signed-in webhook pending-payment handling, Stripe webhook event idempotency, and Convex-sensitive production proof wiring.
- `docs/exec-plans/completed/2026-05-10-production-preflight-hardening.md`: hardened Vercel production alias binding, Stripe webhook endpoint checks, dev staging webhook preflight, release billing doctor webhook checks, and live no-card hosted billing proof safety.
- `docs/exec-plans/completed/2026-05-10-release-evidence-truthfulness.md`: made tag release evidence consume same-commit production and Convex proof summary artifacts rather than check-run conclusions.

Recommended child slices:

- Generated customer repo proof: materialize a generated repo and run the advertised command contract in a clean-room fixture.

## Next Slice

No child ExecPlan is currently active for this Program. The next recommended slice is generated customer repo proof: materialize a generated repo and run the advertised command contract in a clean-room fixture.

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
