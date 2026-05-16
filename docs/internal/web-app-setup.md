---
title: Web App Setup
summary: Internal setup contract for local development, auth, billing, deployment, route ownership, and release proof after public docs retirement.
docType: reference
status: active
read_when:
  - Setting up the Ship by Sunday web app locally or in hosted environments.
  - Changing Clerk, Convex, Stripe, Cal.com, Vercel, checkout, route, or QA setup.
  - Looking for the non-public replacement for the retired public docs MDX setup pages.
---

# Web App Setup

This is the internal setup source of truth for the Ship by Sunday web app. Public docs MDX under `apps/web/src/content/docs/` was retired on 2026-05-16; do not restore public `/docs` just to preserve setup notes.

Keep this document current whenever external setup changes. External setup includes provider projects, dashboard settings, environment variables, webhooks, callback URLs, repository variables, GitHub secrets, Vercel env, Convex env, Stripe and Clerk configuration, Cal.com settings, and release proof commands.

## Local Setup

Work from the repository root:

```bash
cd <repo-root>
bun install
cp apps/web/.env.local.example apps/web/.env.local
```

Start hosted Convex dev first. This repo uses hosted Convex dev only; do not switch it to Convex local mode.

```bash
bun run dev:convex
```

That command writes `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL` when available, and `CONVEX_DEPLOYMENT` into `apps/web/.env.local`.

Use the full stack when testing checkout or provider behavior:

```bash
bun run dev
```

The focused commands remain available:

```bash
bun run dev:web
bun run dev:convex
bun run dev:stripe
bun run dev:core
```

`bun run dev` starts the web app, hosted Convex dev sync, and Stripe forwarding. `bun run dev:full` is a compatibility alias for the same full stack.

## Environment Ownership

Use `apps/web/.env.local.example` as the local inventory. Do not print secret values in logs, Program packets, ExecPlans, PRs, or chat transcripts.

Local `apps/web/.env.local` owns app-local values:

```bash
APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
CLERK_SECRET_KEY=
CLERK_FRONTEND_API_URL=
CLERK_AUTHORIZED_PARTIES=http://localhost:3000
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
CONVEX_DEPLOYMENT=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
CONVEX_WEBHOOK_MUTATION_SECRET=
CHECKOUT_FULFILLMENT_RETRY_SECRET=
```

Vercel owns web runtime values for Preview and Production. Mirror the matching Clerk, Convex, Stripe, Cal.com, PostHog, observability, and app URL values into the correct Vercel environment. Keep production branch deployments on `main`.

Hosted Convex env owns backend-only values for the active hosted deployment. Mirror shared billing secrets into both Vercel and Convex when a Next.js route writes trusted state into Convex:

```bash
CONVEX_WEBHOOK_MUTATION_SECRET=
CHECKOUT_FULFILLMENT_RETRY_SECRET=
STRIPE_SECRET_KEY=
CLERK_SECRET_KEY=
CLERK_FRONTEND_API_URL=
```

GitHub repository secrets and variables own release/deploy automation. `CONVEX_DEPLOY_KEY` belongs in GitHub repository secrets for `.github/workflows/convex-production-deploy.yml`, not in the Vercel project. Production release proof also expects `VERCEL_TOKEN` as a GitHub secret and `VERCEL_PROJECT_ID` plus `VERCEL_TEAM_ID` as repository variables when deployment metadata must be checked.

## Clerk And Convex Auth

The branded sign-in surface is `/sign-in`. Set:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
CLERK_SECRET_KEY=
CLERK_FRONTEND_API_URL=
CLERK_AUTHORIZED_PARTIES=http://localhost:3000
```

Configure the Clerk instance for email-code sign-in. Do not depend on passwords, OAuth, MFA, or client-trusted identity for the paid checkout path. Signed-out paid buyers return from Stripe, then sign in through Clerk email code using the Stripe checkout email.

Create a Clerk JWT template named `convex` with app id `convex`. The issuer must match `CLERK_FRONTEND_API_URL`. Convex auth should use that template, and hosted Convex env must have the same Clerk frontend API URL:

```bash
bunx convex env set CLERK_FRONTEND_API_URL "<clerk-frontend-api-url>"
```

Run the auth doctor after changing Clerk or Convex auth settings:

```bash
bun run auth:dev:doctor
```

Success means `/sign-in` sends and verifies an email code, protected routes can read the Clerk identity through Convex, and post-checkout buyers land on the offer-specific destination after authentication. A Clerk `factor_not_found` error usually means email-code sign-in is disabled or the checkout email cannot use the configured sign-in strategy.

## Stripe Checkout And Webhook

The billing path turns a paid Stripe Checkout Session into a Convex product-access grant. Production and preview webhooks should target the app origin:

```text
https://<app-domain>/api/stripe/webhook
```

Do not point the live Stripe webhook at an old Convex HTTP action such as `https://<convex-production-deployment>.convex.site/stripe/webhook`.

Required billing env:

```bash
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_STARTER_PRODUCT_ID=
STRIPE_STARTER_PRICE_ID=
STRIPE_WORKERS_PRODUCT_ID=
STRIPE_WORKERS_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
CONVEX_WEBHOOK_MUTATION_SECRET=
CHECKOUT_FULFILLMENT_RETRY_SECRET=
APP_BASE_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
CLERK_SECRET_KEY=
```

Create or refresh Starter and Workers products from the repo:

```bash
bun run stripe:create-product
```

Starter is a one-time `$297` price and lands paid buyers on `/starter/home`. Workers is a recurring `$600` subscription price and lands paid buyers on `/workers/setup`. Hosted preview and production billing proof require both managed prices. Local checkout can fall back to inline `price_data` if an offer-specific managed price is missing.

Start local webhook forwarding with:

```bash
bun run stripe:listen:dev
```

The helper forwards to `{APP_BASE_URL}/api/stripe/webhook`, checks the pinned Stripe CLI project name `ship-by-sunday`, captures the current webhook signing secret into `.env.local`, and syncs shared billing secrets into hosted Convex dev. If it warns about the Stripe CLI project, repair the profile:

```bash
stripe login --project-name ship-by-sunday
```

Subscribe the Stripe endpoint only to these events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.paid`

Do not use wildcard event subscriptions. The endpoint URL must not have a trailing slash. Use endpoint API version `2023-08-16` or later, or an account default at least that new.

Before debugging by hand, run:

```bash
bun run stripe:dev:doctor
bun run stripe:dev:verify
```

Before production billing proof, run:

```bash
bun run release:billing:doctor -- --env=production
```

Common billing failures are mismatched `CONVEX_WEBHOOK_MUTATION_SECRET`, mismatched `CHECKOUT_FULFILLMENT_RETRY_SECRET`, a missing `STRIPE_WEBHOOK_SECRET`, a stale webhook endpoint, a mismatched Stripe CLI project, disabled Clerk email-code sign-in, or Convex auth drift.

## Express Checkout

Express Checkout is progressive enhancement. Hosted Checkout remains the fallback when wallets are unavailable or provider setup is incomplete.

To show direct homepage wallet payment:

- Enable Link and desired wallet methods in the Stripe Dashboard for test and live mode.
- Register the homepage domain in Stripe payment method domains for test and live mode.
- Serve the page over HTTPS outside localhost browser testing.
- Set `STRIPE_PUBLISHABLE_KEY` beside the matching `STRIPE_SECRET_KEY`.
- Keep fulfillment on `/api/stripe/webhook`; Express Checkout still fulfills from Checkout Session events.

## Worker Seal Team 6 Cal.com

Worker Seal Team 6 booking is Cal.com-owned. The app owns `/worker-seal-team-6`, the verified webhook route, and the Convex booking mirror.

Create one maintainer-owned Cal.com event type:

- Name: `Worker Seal Team 6`
- URL slug: `worker-seal-team-6`
- Duration: `60 minutes`
- Price: `$500 USD`
- Payment app: Cal.com Stripe app connected to the maintainer Stripe account
- Calendar: Parker or the operator calendar that owns the service call
- Rescheduling: self-serve rescheduling allowed until `24 hours` before the call
- Cancellation and refunds: handled manually through support and the Cal.com or Stripe dashboards

Required booking questions:

- `Company URL`
- `Repository or product context`
- `What needs to be true by the end of the hour?`
- `What has the AI-worker loop already tried?`
- `Anything Parker should not touch?`

Set these in local `.env.local`, Vercel Preview, and Vercel Production:

```bash
NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_LINK=https://cal.com/parker-rex/worker-seal-team-6
NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_ORIGIN=https://cal.com
CAL_WEBHOOK_SECRET=
CONVEX_WEBHOOK_MUTATION_SECRET=
```

`NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_LINK` may be a Cal Link slug or a full hosted Cal.com URL. `NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_ORIGIN` is optional and defaults to `https://cal.com`. `CAL_WEBHOOK_SECRET` is server-only and belongs in the Next.js runtime. `CONVEX_WEBHOOK_MUTATION_SECRET` must match between Next.js and the matching hosted Convex deployment.

Create a webhook endpoint for each environment that mirrors booking state:

```text
https://<app-domain>/api/cal/worker-seal-team-6/webhook
```

Subscribe only to:

- `BOOKING_CREATED`
- `BOOKING_PAYMENT_INITIATED`
- `BOOKING_PAID`
- `BOOKING_RESCHEDULED`
- `BOOKING_CANCELLED`

The app route requires `x-cal-signature-256`, caps webhook bodies at `128 KB`, and verifies HMAC-SHA256 over the raw body before parsing JSON. Unsigned or incorrectly signed requests return `400`. Missing or mismatched `CONVEX_WEBHOOK_MUTATION_SECRET` returns `500` after Cal.com verification so Cal.com can retry.

## Vercel Deployment

Production is mainly env parity across Vercel, Clerk, Convex, Stripe, Cal.com, and PostHog.

Before the first deploy, prepare:

- Clerk publishable and secret keys
- Clerk frontend API URL
- Convex client URL as `NEXT_PUBLIC_CONVEX_URL`
- Convex HTTP actions URL as `NEXT_PUBLIC_CONVEX_SITE_URL` when the deployment uses HTTP actions
- Stripe live secret key, product ids, price ids, and webhook secret
- `CONVEX_WEBHOOK_MUTATION_SECRET` in Vercel and production Convex
- `CHECKOUT_FULFILLMENT_RETRY_SECRET` in Vercel and production Convex
- `APP_BASE_URL`
- PostHog source-map upload values when error tracking is enabled: `NEXT_PUBLIC_POSTHOG_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`, `POSTHOG_PROJECT_ID`, and `POSTHOG_API_KEY`

Vercel checklist:

- Deploy as a normal Next.js app.
- Keep the Vercel project linked to the intended GitHub repository.
- Grant the Vercel GitHub App access if the repository is private.
- Keep Production branch on `main`.
- Let Preview handle feature branches.
- Keep Bun pinned to the repo version.
- Use production Clerk and Stripe live values in production.
- Keep PostHog MCP credentials out of Vercel app env.

Convex production promotion happens from GitHub Actions on `main` through `.github/workflows/convex-production-deploy.yml`. Do not make Vercel responsible for production Convex deploys in this repo.

## Route Map

Public routes:

- `/`: public marketing surface
- `/starter`: public Starter sales page for the `$297` idea-to-repo offer
- `/workers`: public Workers sales page for the `$600` existing-codebase worker install
- `/worker-seal-team-6`: public Worker Seal Team 6 sales page for the `$500` paid booking service
- `/blog`: public editorial index plus `/blog/<slug>` article routes for published posts
- `/sign-in`: branded Clerk sign-in surface
- `/sign-up`: Starter redirect and legacy checkout session compatibility

`/docs` is intentionally not a public route. If a request hits `/docs`, the App Router should handle it through the normal not-found path because `apps/web/src/app/(marketing)/docs/` does not exist.

Purchase and recovery routes:

- `/checkout/success`: post-checkout fulfillment and validation route
- `/checkout/clear-pending`: stale pending-checkout cookie cleanup
- `/checkout/cancel`: checkout cancel return
- `/checkout/cancel/confirmed`: checkout canceled confirmation
- `/session-tasks/reset-password`: Clerk password reset task
- `/home`: protected paid product recovery hub
- `/starter/home`: first paid Starter destination
- `/workers/setup`: first paid Workers destination

Protected product routes:

- `/starter/home`
- `/starter/generate-codebase`
- `/starter/generate-codebase/review`
- `/starter/lessons`
- `/starter/lessons/[lessonKey]`
- `/workers/setup`
- `/workers/doctor-pass`
- `/workers/findings`
- `/workers/findings/[findingId]`
- `/workers/loops`
- `/workers/runs`
- `/workers/privacy`
- `/settings`
- `/lesson/[lessonKey]`

Compatibility routes:

- `/generate-codebase` redirects to `/starter/generate-codebase`
- `/generate-codebase/review` redirects to `/starter/generate-codebase/review`
- `/tutorials` redirects to `/starter/lessons`
- `/tutorials/[lessonKey]` redirects to `/starter/lessons/[lessonKey]`
- `/execute` preserves old Execute or Ship links
- `/mission` preserves old bonus-library links
- `/artifacts` forwards into `/starter/generate-codebase/review`
- `/start` redirects to `/starter/generate-codebase`
- `/product`, `/design`, `/marketing`, and `/build-plan` route families redirect to matching `/starter/generate-codebase` anchors

Integration routes:

- `POST /api/stripe/checkout`
- `POST /api/stripe/checkout/express`
- `POST /api/stripe/webhook`
- `POST /api/cal/worker-seal-team-6/webhook`
- `GET /api/download/starter-template`
- `POST /api/observability/clerk`
- `POST /api/observability/vercel`

## Homepage Contract

The homepage control plane is still split deliberately:

- `starterConfig.homePage` in `apps/web/src/config/product.ts` owns section flags and CTA target config.
- `apps/web/src/app/_content/home-page.ts` owns copy and assets.
- `apps/web/src/app/_lib/home-page-render-model.ts` owns section and CTA behavior.
- `apps/web/src/app/_components/home-page/sections/home-page-primary-cta.tsx` owns hero and pricing CTA rendering.
- `apps/web/src/app/_lib/home-page-structured-data.ts` must stay truthful to visible sections.

Do not hardwire checkout directly into hero or pricing components, scatter section gating across section components, or leave `FAQPage` or `Product` schema behind when visible homepage sections no longer support them.

## Local QA And Release Proof

Fast local checks:

```bash
bun run lint
bun run --cwd apps/web format:check
bun run --cwd apps/web test:unit
bun run --cwd apps/web test:contracts
bun run --cwd apps/web test:integration
bun run --cwd apps/web build
```

Full repo completion gate for code tasks:

```bash
bun run format
bun lint
bun typecheck
```

Use release personas for auth-proof work:

```bash
bun run release:personas:prepare
```

Use production proof against a hosted URL:

```bash
PLAYWRIGHT_BASE_URL=https://<production-url> QA_ENV_FILE=apps/web/.env.production bun run release:proof -- --proof=default_ship
```

For billing-sensitive releases:

```bash
PLAYWRIGHT_BASE_URL=https://<production-url> QA_ENV_FILE=apps/web/.env.production QA_ALLOW_BILLING_INTEGRATION=1 bun run release:proof -- --proof=billing_integration
```

The local proof defaults to Starter. Add `--offer=workers` when Workers-specific billing proof is needed. Production billing-sensitive proof defaults to both Starter and Workers.

After enabling PostHog source maps, run:

```bash
bun run posthog:proof
```

Success means payment, access, route protection, observability, and deployment provenance agree on the same release: the web app came from Vercel `main`, the backend came from the Convex production workflow on `main`, and both use the same production env values.

## Failure Shapes

If local setup fails, check that `bun run dev:convex` wrote `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`, then verify provider keys in `.env.local` without printing them.

If auth fails, verify Clerk email-code sign-in, `CLERK_FRONTEND_API_URL`, `CLERK_AUTHORIZED_PARTIES`, and the Clerk JWT template named `convex`.

If checkout completes but access does not, verify Stripe endpoint URL, subscribed events, `STRIPE_WEBHOOK_SECRET`, `CONVEX_WEBHOOK_MUTATION_SECRET`, `CHECKOUT_FULFILLMENT_RETRY_SECRET`, hosted Convex env, and Clerk email-code sign-in.

If production proof gives misleading auth results, stop when persona prep reports a Clerk publishable-key mismatch. That means the loaded env file does not match the production site.
