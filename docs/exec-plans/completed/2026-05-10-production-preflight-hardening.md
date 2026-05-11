---
title: Production Preflight Hardening
status: complete
created_at: 2026-05-10
completed_at: 2026-05-10
summary: Harden hosted production preflight around Vercel alias binding, Stripe webhook endpoint configuration, and live no-card billing proof safety.
post_build_recap: Production proof now requires the same-commit Vercel deployment to own the `www.man-meets-ai.com` alias, staging and production billing proof run Stripe webhook endpoint preflight, the release billing doctor includes webhook endpoint verification, and live hosted billing proof refuses non-zero-cost sessions or card entry.
program_id: shipping-evidence-hardening
planning_brief: docs/programs/completed/2026-05-09-shipping-evidence-hardening/planning-brief-3.md
read_when:
  - Resuming production preflight hardening.
  - Changing release proof, hosted billing proof, Vercel deployment waits, or Stripe webhook endpoint checks.
---

# Production Preflight Hardening

This is a living execution plan for the production preflight slice of Shipping Evidence Hardening.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Production checkout can fail even when source tests and Stripe test-mode flows are green. The risky drift is operational: the production domain can point at the wrong Vercel deployment, Stripe can post live webhooks to a stale app-origin route, a required async checkout event can be unsubscribed, or live proof can accidentally behave like sandbox card testing.

After this slice, hosted production proof requires the exact `www.man-meets-ai.com` alias on the same Vercel deployment SHA, Stripe preflight verifies an enabled Convex webhook endpoint with the required events, dev staging runs the same test-mode webhook preflight before card proof, and live hosted billing proof refuses to enter card details. A contributor can see the work through focused unit/workflow tests and by reading the release docs.

## Progress

- [x] 2026-05-10: Read root, app, release, Program, ExecPlan, Stripe, and Vercel guidance for the production preflight slice.
- [x] 2026-05-10: Collected read-only 5.5 xhigh subagent findings for staging/preflight, release evidence, and Stripe preflight gaps.
- [x] 2026-05-10: Created Planning Brief 3 and this child ExecPlan.
- [x] 2026-05-10: Added Stripe webhook endpoint preflight to the managed Stripe verifier.
- [x] 2026-05-10: Required production Vercel alias binding and wired webhook preflight into staging and production workflows.
- [x] 2026-05-10: Hardened live hosted billing proof so it cannot enter card details or navigate to a non-zero-cost live proof session.
- [x] 2026-05-10: Ran focused tests, workflow syntax checks, docs/plan/program validation, format check, lint, and typecheck.

## Surprises & Discoveries

- 2026-05-10: `Production Release Proof` already validates same-commit Convex deploy summaries for Convex-sensitive changes, so Convex deploy-mode preflight does not need to be rebuilt in this slice.
- 2026-05-10: Dev staging already enforces the `dev.man-meets-ai.com` alias, but production only waited for a matching deployment SHA before separately probing `www`. The production wait helper already supports alias enforcement.
- 2026-05-10: The current managed Stripe verifier checks key mode, price, product, promotion code, and checkout route, but it does not list Stripe webhook endpoints or verify URL, status, mode, or subscribed events.

## Decision Log

Decision: Extend the existing managed Stripe verifier instead of adding a parallel preflight framework.
Rationale: `apps/web/scripts/verify-managed-stripe-env.ts` already owns release billing drift checks and runs in the right staging/production surfaces. Adding webhook endpoint checks there keeps the preflight path small and avoids a second source of truth.
Date: 2026-05-10

Decision: Defer tag release artifact truthfulness to the next slice.
Rationale: The tag workflow should eventually consume production proof and Convex deploy summary artifacts, but this slice first needs the provider preflight facts to exist. Mixing both would make the implementation and validation harder to review.
Date: 2026-05-10

## Outcomes & Retrospective

This plan is complete. The managed Stripe verifier now checks that a webhook signing secret is configured and shaped like a Stripe signing secret, then verifies the expected Convex HTTP-actions webhook URL, Stripe endpoint status, live/test mode parity, explicit webhook API version, required checkout completion events, and stale app-origin endpoints. Stripe only returns endpoint signing secrets at creation time, so the read-only verifier cannot prove the saved secret matches the Dashboard endpoint. Production proof waits for the same-commit Vercel deployment with the `www.man-meets-ai.com` alias before hosted proof. Dev staging runs the same webhook endpoint verifier in test mode before card proof. The release billing doctor includes the webhook endpoint check for preview and production. Live hosted billing proof now requires the direct proof Checkout Session to be zero-cost before navigation and refuses to enter card fields in live mode.

The release-tag evidence artifact still consumes check-run conclusions rather than proof summaries. That is intentionally deferred to the next child slice.

## Context and Orientation

The release proof surfaces are `.github/workflows/production-release-proof.yml`, `.github/workflows/dev-staging-payment-proof.yml`, `.github/workflows/convex-production-deploy.yml`, and `.github/workflows/release.yml`. Vercel deployment waiting is implemented in `scripts/release/wait-for-vercel-production-deployment.mjs`.

The Stripe preflight surfaces are `apps/web/scripts/verify-managed-stripe-env.ts`, `apps/web/platform/billing/managed-stripe-config.ts`, `apps/web/platform/billing/stripe.ts`, `apps/web/scripts/lib/release-billing-doctor.mjs`, and `apps/web/scripts/verify-hosted-stripe-checkout.mjs`.

The production Stripe webhook contract is Convex HTTP `POST /stripe/webhook`, exposed by `apps/web/convex/http.ts`. The expected endpoint URL is `{NEXT_PUBLIC_CONVEX_SITE_URL}/stripe/webhook`, not the Next.js app origin.

### In Scope

This plan covers Vercel production alias enforcement, Stripe webhook endpoint preflight for dev staging and production billing proof, release billing doctor command updates, live no-card hosted proof safety, focused tests, and release/operator docs.

### Out Of Scope

This plan does not make provider-backed checks run on every PR. It does not rewrite tag release evidence to consume artifacts. It does not add new Stripe webhook event types beyond the existing checkout completion contract. It does not move the Stripe webhook out of Convex or add a Next.js webhook route.

## Plan of Work

First, extend `managed-stripe-config.ts` with a webhook endpoint preflight helper. It should require `STRIPE_WEBHOOK_SECRET`, derive the expected endpoint from `NEXT_PUBLIC_CONVEX_SITE_URL` unless an explicit URL is passed, call `stripe.webhookEndpoints.list()`, require an enabled endpoint at the exact expected URL, require mode parity with `--expected-mode`, reject unpinned webhook API versions and explicit webhook API versions older than `2023-08-16`, accept either the required events or `*`, and fail if an enabled app-origin `/api/stripe/webhook` endpoint exists.

Second, wire the helper through `verify-managed-stripe-env.ts` behind `--require-webhook-endpoint` and optional `--expected-webhook-url`. Include the result in the verifier's JSON output. Update the release billing doctor command to pass the new flag for preview and production.

Third, update workflows. Production proof should pass `--alias_domain=www.man-meets-ai.com` to both Vercel waits and pass `--require-webhook-endpoint` to the Stripe env verifier. Dev staging should run the managed Stripe verifier with `--expected-mode=test`, `--app-base-url=https://dev.man-meets-ai.com`, and `--require-webhook-endpoint` after pulling preview env and before the hosted card proof.

Fourth, harden `verify-hosted-stripe-checkout.mjs`. When the configured secret key is live, the intentionally created proof Checkout Session must have `amount_total === 0` before navigation, and the script must fail if card fields are visible instead of filling sandbox card details.

Fifth, add focused tests for webhook endpoint validation, workflow structure, release billing doctor command flags, and live no-card script structure. Update docs to describe the new preflight proof contract.

## Milestones

Milestone 1 is Stripe endpoint preflight. It is complete when the managed verifier can reject missing, disabled, wrong-mode, wrong-URL, and missing-event webhook endpoint configurations with focused unit tests.

Milestone 2 is hosted workflow wiring. It is complete when production proof enforces the `www` alias, production and dev staging run webhook preflight in provider-backed lanes, and workflow structure tests cover those requirements.

Milestone 3 is live no-card safety. It is complete when live hosted billing proof requires a zero-cost session and refuses visible card fields.

## Concrete Steps

Inspect before editing:

    sed -n '1,340p' apps/web/platform/billing/managed-stripe-config.ts
    sed -n '1,180p' apps/web/scripts/verify-managed-stripe-env.ts
    sed -n '1,380p' .github/workflows/production-release-proof.yml
    sed -n '1,140p' .github/workflows/dev-staging-payment-proof.yml
    sed -n '1,760p' apps/web/scripts/verify-hosted-stripe-checkout.mjs

Observed focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/stripe-line-item.test.ts tests/unit/release-billing-doctor.test.ts tests/unit/production-release-proof-workflow.test.ts tests/unit/hosted-stripe-checkout-proof.test.ts
    # Test Files  4 passed (4)
    # Tests  40 passed (40)

    ruby -e 'require "yaml"; YAML.load_file(ARGV[0]); YAML.load_file(ARGV[1]); puts "ok"' .github/workflows/production-release-proof.yml .github/workflows/dev-staging-payment-proof.yml
    # ok

Observed docs and Program validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-10-production-preflight-hardening.md
    # passed before this plan was moved to completed

    bun run programs:lint
    # passed

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-10-production-preflight-hardening.md docs/programs/completed/2026-05-09-shipping-evidence-hardening .github/workflows/README.md docs/release-workflow.md apps/web/content/docs/stripe-checkout-webhook.mdx
    # passed before this plan was moved to completed

Observed broader completion gates:

    bun run format:check
    # passed

    bun lint
    # passed

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    # passed

## Validation and Acceptance

This plan is accepted because production billing proof fails before browser proof if the Vercel alias is not bound to the same deployment, if Stripe lacks an enabled exact Convex webhook endpoint, if required checkout events are missing, if Stripe mode is wrong, if the webhook endpoint API version is unpinned or too old for no-cost Checkout orders, or if a stale app-origin webhook endpoint is still enabled. Dev staging runs the same webhook endpoint verifier in test mode before card proof.

Live proof safety is accepted because the production hosted billing script refuses to proceed unless its direct proof Checkout Session is zero-cost and refuses to enter card details in live mode.

### Test Commands

Run these before marking the plan complete:

    bun run --cwd apps/web test:unit -- tests/unit/stripe-line-item.test.ts tests/unit/release-billing-doctor.test.ts tests/unit/production-release-proof-workflow.test.ts tests/unit/hosted-stripe-checkout-proof.test.ts
    ruby -e 'require "yaml"; YAML.load_file(ARGV[0]); YAML.load_file(ARGV[1]); puts "ok"' .github/workflows/production-release-proof.yml .github/workflows/dev-staging-payment-proof.yml
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-10-production-preflight-hardening.md
    bun run programs:lint

## Idempotence and Recovery

The verifier is read-only against Stripe. It lists webhook endpoints and creates/cleans up the existing app checkout route smoke session when `--app-base-url` is passed. Re-running the proof is safe. If the webhook check fails, repair Stripe Dashboard endpoint URL, status, mode, or event subscriptions; do not weaken the verifier.

If production Vercel alias waiting fails, inspect the matching Vercel deployment and alias assignment before rerunning proof. Do not treat a successful deployment SHA as production-ready unless the `www` alias is bound to it.

## Artifacts and Notes

Read-only subagent findings that shaped this plan:

    Production Vercel alias binding is weaker than dev staging even though the helper supports alias checks.
    No script currently lists Stripe webhook endpoints or checks URL, status, mode, or event subscriptions.
    Release evidence still consumes check-run conclusions; that should be the next slice after preflight facts exist.

Key files:

    apps/web/platform/billing/managed-stripe-config.ts
    apps/web/scripts/verify-managed-stripe-env.ts
    apps/web/scripts/verify-hosted-stripe-checkout.mjs
    .github/workflows/production-release-proof.yml
    .github/workflows/dev-staging-payment-proof.yml
    scripts/release/wait-for-vercel-production-deployment.mjs

## Interfaces and Dependencies

This plan depends on GitHub Actions, the Vercel Deployments API, the Vercel project variables `VERCEL_PROJECT_ID` and `VERCEL_TEAM_ID`, the `VERCEL_TOKEN` secret, Vercel production alias assignment for `www.man-meets-ai.com`, hosted Convex production and dev HTTP-actions URLs, Stripe test and live API keys, Stripe Dashboard webhook endpoint configuration, Stripe Checkout Sessions, Clerk release personas, and the existing release proof scripts.

The public command interfaces are `bun run release:billing:doctor -- --env=preview|production`, `bun --env-file=.env.production apps/web/scripts/verify-managed-stripe-env.ts --expected-mode=live --app-base-url=https://www.man-meets-ai.com --require-webhook-endpoint`, and the GitHub workflow jobs in `production-release-proof.yml` and `dev-staging-payment-proof.yml`.
