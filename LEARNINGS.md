# Learnings

## 2026-05-08 Vitest Runner

- Fact: Tests that import `vi.hoisted` must run through the repo Vitest scripts, not `bun test`, because Bun's test runner does not provide `vi.hoisted`.
  Verified by: `bun test apps/web/tests/integration-ui/home-page-support-widget.test.tsx apps/web/tests/integration-ui/workspace-support-widget.test.tsx` failed before test execution with `vi.hoisted is not a function`, while `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx` passed.

## 2026-05-08 Worker Foundations Arena Dry Run

- Fact: Arena CRM currently has legacy Worker-style planning scripts that forward through `scripts/run-runtime.sh`, so the productized installer must recognize those exact commands as managed migration candidates rather than owner-authored script conflicts.
  Verified by: A read-only `shipbysunday install --repo <arena-crm-checkout> --dry-run --json --no-kickoff` smoke from the local-runner implementation; after legacy script recognition, the remaining blocker was missing local license activation.

- Fact: Worker-installed `scripts/run-worker.sh` must not depend on external shell utilities when it is proving a managed Bun path with a stripped PATH.
  Verified by: The no-global-Bun installer fixture failed when the script used `dirname`, then passed after the script switched to shell parameter expansion and prepended `~/.worker/toolchains/bun/bin` to PATH for nested Bun package scripts.

## 2026-05-07 Passwordless Checkout Account Handoff

- Fact: A Stripe Checkout payment cannot safely create an authenticated browser session by itself.
  Verified by: The hotfix design and production proof for PR #218. The server can create or reconcile the Clerk user and grant access, but the browser still needs Clerk to establish a session by proving control of the email.

- Fact: For Clerk custom UI, the app must ask for an actually supported first factor instead of assuming `email_code` exists.
  Verified by: The original `factor_not_found` failure and the replacement sign-in flow, which reads supported first factors, reports a high-severity client error when email code is missing, and documents the required Clerk Dashboard settings.

- Fact: The checkout success route should be a transient finalization route, not a product destination or claim experience.
  Verified by: PR #218 and production release proof. Paid buyers now finalize fulfillment, sign in passwordlessly when needed, and land on `/workspace/choose`.

- Fact: Webhook and success-page fulfillment can race, so Clerk user creation must be idempotent at the domain boundary.
  Verified by: The review-swarm P1 finding and follow-up fix in PR #218, which re-queries Clerk after create failure and keeps both fulfillment paths on the same access-grant flow.

- Fact: Neutral checkout improves the product and the code.
  Verified by: Removing active checkout intents from new public checkout creation while still preserving legacy readers for old records. Buyers discover the available workspace paths after purchase instead of being locked into a pre-checkout branch.

## 2026-05-06 Stripe Link Express Checkout Stall

- Fact: For Stripe custom Checkout Sessions, `payment_intent=null` on repeated `open` / `unpaid` sessions means confirmation did not progress far enough to create a PaymentIntent.
  Verified by: `docs/archive/incidents/2026-05-06-stripe-link-express-checkout-stall-postmortem.md`, which compared live Stripe Checkout Sessions, related events, PaymentIntents, Charges, and customer records.

- Fact: The production homepage purchase CTAs should use hosted Checkout, not app-owned custom Express Checkout, for the revenue-critical Link handoff.
  Verified by: PR #213 validation in the post-mortem, where production proof passed after homepage CTAs moved to `/api/stripe/checkout` and no longer precreated Express Checkout Sessions.

- Fact: `dev.man-meets-ai.com` is the dev-staging payment environment backed by the `dev` Vercel Preview branch and Preview environment variables.
  Verified by: PR #214 validation in the post-mortem, including the dev staging payment proof run that paid a Stripe test-mode US$250 Checkout Session.

- Fact: Production billing proof may use zero-cost hosted Checkout to avoid moving real money; dev staging covers the full paid card path in Stripe test mode.
  Verified by: The post-mortem validation and residual-risk sections.
