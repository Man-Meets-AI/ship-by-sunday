# Learnings

## 2026-05-14 Webpack Dev Fallback For App Router Proof

- Fact: In this checkout, `bun run --cwd apps/web dev:web:only -- -p 3100` can fail before rendering with a Turbopack `apps/web/proxy.ts` module parse error, while `bun run --cwd apps/web dev:web:webpack -- -p 3100` renders the same route successfully.
  Verified by: Browser proof for `/worker-seal-team-6` on 2026-05-14. The default dev server returned the runtime overlay "Could not parse module '[project]/apps/web/proxy.ts', file not found"; the webpack dev server returned 200 responses for `/worker-seal-team-6` and `/`.

## 2026-05-13 Next Env Generation

- Fact: Next.js generates `apps/web/next-env.d.ts`; `next dev` writes the route import through `.next/dev/types/routes.d.ts`, while `next build` writes it through `.next/types/routes.d.ts`.
  Verified by: The installed Next.js TypeScript docs say `next-env.d.ts` is generated and should be ignored, and `node_modules/next/dist/lib/typescript/writeAppTypeDeclarations.js.map` shows the import is derived from the active `.next` dist directory.

## 2026-05-08 Root Typecheck

- Fact: `bun typecheck` at the repo root runs the web production build path and the PostHog sourcemap upload hook when the local PostHog token is present.
  Verified by: Running `bun typecheck` during Worker installer hardening validation; the command completed successfully after the Next build printed PostHog release and sourcemap upload output.

## 2026-05-08 Vitest Runner

- Fact: Tests that import `vi.hoisted` must run through the repo Vitest scripts, not `bun test`, because Bun's test runner does not provide `vi.hoisted`.
  Verified by: `bun test apps/web/tests/integration-ui/home-page-support-widget.test.tsx apps/web/tests/integration-ui/workspace-support-widget.test.tsx` failed before test execution with `vi.hoisted is not a function`, while `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx` passed.

## 2026-05-08 Worker Foundations Arena Dry Run

- Fact: Arena CRM currently has legacy Worker-style planning scripts that forward through `scripts/run-runtime.sh`, so the productized installer must recognize those exact commands as managed migration candidates rather than owner-authored script conflicts.
  Verified by: A read-only `shipbysunday install --repo <arena-crm-checkout> --dry-run --json --no-kickoff` smoke from the local-runner implementation; after legacy script recognition, the remaining blocker was missing local license activation.

- Fact: Worker-installed `scripts/run-worker.sh` must not depend on external shell utilities when it is proving a managed Bun path with a stripped PATH.
  Verified by: The no-global-Bun installer fixture failed when the script used `dirname`, then passed after the script switched to shell parameter expansion and prepended `~/.worker/toolchains/bun/bin` to PATH for nested Bun package scripts.

## 2026-05-09 Root Typecheck Side Effects

- Fact: In this checkout, root `bun typecheck` runs the Next.js production build path and can execute `runAfterProductionCompile`, including PostHog source-map release creation and upload when PostHog credentials are present in the environment.
  Verified by: Running `bun typecheck` on 2026-05-09, which completed successfully after creating `ship-by-sunday-web@38814d7a87699696bc9b2be4c878fe9a6b68437c` in PostHog and uploading source-map symbol sets.

- Fact: This local environment does not have `pnpm` available on PATH, so source-gate smokes that model pnpm-owned repositories need their own shim when they are testing dry-run detection rather than real pnpm execution.
  Verified by: `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run check:source` initially failed in `packages/local-runner/tests/package-smoke.ts` with the installer blocking the native pnpm dry-run fixture, then passed after the smoke supplied a fake `pnpm --version` binary for that fixture.

- Fact: This checkout's Convex CLI is authenticated enough to run `bunx convex deploy --dry-run -y` against the production deployment from `apps/web`; the production deployment URL is redacted from this repo note.
  Verified by: The Convex billing runtime hardening slice dry-run completed schema validation and reported that it would have deployed functions to the redacted production deployment without deleting indexes.

- Fact: Hosted Convex dev sync must run from `apps/web` in this monorepo when using the raw Convex CLI; the root `release:convex:sync-hosted-dev` helper currently runs from the repo root and fails because root `package.json` does not depend on `convex`.
  Verified by: `bun run release:convex:sync-hosted-dev` failed with "add `convex` to your package.json dependencies", while `bunx convex dev --once --typecheck disable` from `apps/web` succeeded and synced hosted dev indexes.

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

## 2026-05-11 Production Billing Proof Repair

- Fact: Vercel production environment variables created with the current CLI's sensitive default may not round-trip into `.env.production` through `vercel env pull`; the production proof still receives the authoritative Stripe webhook secret from the GitHub `production-billing-integration` environment.
  Verified by: After replacing the live Stripe webhook endpoint, `vercel env pull --environment production` left `STRIPE_WEBHOOK_SECRET` empty locally, while `STRIPE_WEBHOOK_SECRET` supplied from Convex/GitHub let `scripts/verify-managed-stripe-env.ts --expected-mode=live --app-base-url=https://www.man-meets-ai.com --require-webhook-endpoint` pass against endpoint `we_1TVzknCgIdJ1QglPmXzIqO3V`.

## 2026-05-06 Stripe Link Express Checkout Stall

- Fact: For Stripe custom Checkout Sessions, `payment_intent=null` on repeated `open` / `unpaid` sessions means confirmation did not progress far enough to create a PaymentIntent.
  Verified by: `docs/archive/incidents/2026-05-06-stripe-link-express-checkout-stall-postmortem.md`, which compared live Stripe Checkout Sessions, related events, PaymentIntents, Charges, and customer records.

- Fact: The production homepage purchase CTAs should use hosted Checkout, not app-owned custom Express Checkout, for the revenue-critical Link handoff.
  Verified by: PR #213 validation in the post-mortem, where production proof passed after homepage CTAs moved to `/api/stripe/checkout` and no longer precreated Express Checkout Sessions.

- Fact: `dev.man-meets-ai.com` is the dev-staging payment environment backed by the `dev` Vercel Preview branch and Preview environment variables.
  Verified by: PR #214 validation in the post-mortem, including the dev staging payment proof run that paid a Stripe test-mode US$250 Checkout Session.

- Fact: Production billing proof may use zero-cost hosted Checkout to avoid moving real money; dev staging covers the full paid card path in Stripe test mode.
  Verified by: The post-mortem validation and residual-risk sections.

## 2026-05-12 Worker Setup Install Affordance

- Fact: `apps/web` does not define a generic `test` script; focused app unit tests should use `bun run --cwd apps/web test:unit -- <paths>`.
  Verified by: `bun run --cwd apps/web test -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-setup-readiness-model.test.ts` failed before Vitest, while `bun run --cwd apps/web test:unit -- tests/unit/workspace-data-model.test.ts tests/unit/workspace-runner-events.test.ts tests/unit/workspace-setup-readiness-model.test.ts` passed.

- Fact: An unauthenticated in-app browser navigation to `/workers/setup` redirects to the custom sign-in screen.
  Verified by: Running `bun run --cwd apps/web dev:web:only` and opening `http://localhost:3000/workers/setup` in the in-app browser produced `/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fworkers%2Fsetup`.
