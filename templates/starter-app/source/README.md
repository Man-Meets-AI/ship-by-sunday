# Starter Stack

Next.js App Router starter with Convex, Clerk, Stripe, Tailwind CSS, shadcn/ui, Resend, PostHog, and Sentry wired behind clear internal boundaries.

## Why this exists

This repo is meant to be a better starting point. It gives you a working SaaS-style stack, but it also tries to model the patterns you want to keep as the codebase grows: clean ownership boundaries, explicit integration layers, regression tests around real behavior, and a reference feature slice you can copy from.

That matters even more if you use agentic coding heavily. LLMs extend the patterns they see. If the starting point is messy, they scale the mess. If the starting point is disciplined, they are much more likely to help you move quickly without eroding the architecture.

## What is included

- `Next.js` for routing, layouts, route handlers, and the app shell
- `Convex` for application data, domain logic, queries, mutations, and actions
- `Clerk` for sign-in and session identity
- `Stripe` for checkout, customer portal, and subscription lifecycle
- `Resend` for transactional email from server-side code
- `PostHog` for analytics capture through centralized helpers
- `Sentry` for error capture and tracing

## Prerequisites

Before you start, make sure you have:

- `Node.js 20+`
- `Bun 1.3+`
- a `Convex` account
- a `Clerk` account
- a `Stripe` account
- a `Resend` account
- a `PostHog` account
- a `Sentry` account

Optional but strongly recommended for billing development:

- `Stripe CLI` for forwarding webhook events locally

## Setup at a glance

Follow this order:

1. Install dependencies.
2. Create `.env.local`.
3. Set up Convex first.
4. Set up Clerk.
5. Set up Stripe and local webhook forwarding.
6. Add Resend, PostHog, and Sentry when you are ready for those integrations.
7. Start local development.
8. Verify the starter flows.

If you just want the exact commands first:

```bash
bun install
cp .env.local.example .env.local
bun run dev:convex
bun run dev
```

For billing development, run this in a second terminal after the app is up:

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

## Setup

### 1. Install dependencies and create the env file

```bash
bun install
cp .env.local.example .env.local
```

Start with the example env file, then fill values in as you complete each provider setup below.
Keep `NEXT_PUBLIC_APP_URL` in your local `.env.local` as well. The template build still expects it to be present, even in development.

### 2. Set up Convex first

Convex comes first because the rest of the starter assumes the app already has a deployment and generated client wiring.

Run:

```bash
bun run dev:convex
```

Then:

1. Sign in to Convex when prompted.
2. Create a new Convex project or connect this repo to an existing one.
3. Let the initialization finish.
4. Copy these values into `.env.local`:
   - `CONVEX_DEPLOYMENT`
   - `NEXT_PUBLIC_CONVEX_URL`

Helpful docs:

- [Convex Next.js docs](https://docs.convex.dev/client/react/nextjs)
- [Convex Clerk auth docs](https://docs.convex.dev/auth/clerk)
- [Convex quickstart for Next.js](https://docs.convex.dev/quickstart/nextjs)

If you want Clerk auth, Stripe entitlements, or Convex-triggered welcome emails to work inside Convex itself, also set the matching env values in your Convex deployment, not only in `.env.local`.

### 3. Set up Clerk

Create a Clerk application if you do not already have one, then add these values to `.env.local`:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Then configure Clerk for Convex:

1. Open the [Clerk Convex integration setup](https://dashboard.clerk.com/apps/setup/convex).
2. Activate the Convex integration for your Clerk app.
3. Copy the Clerk Frontend API URL shown there.
   - In development it should look like `https://verb-noun-00.clerk.accounts.dev`.
   - Use the Frontend API URL itself, not the JWKS URL ending in `/.well-known/jwks.json`.
4. Set `CLERK_JWT_ISSUER_DOMAIN` in `.env.local` to that Frontend API URL.
5. Set the same `CLERK_JWT_ISSUER_DOMAIN` value in your Convex deployment env.
6. Verify Clerk has the expected Convex JWT setup.
   - Depending on the current Clerk UI, this may appear through the Convex integration itself or under [JWT templates](https://dashboard.clerk.com/~/jwt-templates).
   - If you manage it manually, the template name must be exactly `convex`.
7. Restart local development and sign out and back in after changing Clerk auth configuration.

Set:

- `CLERK_JWT_ISSUER_DOMAIN`

That Convex JWT setup is what allows authenticated browser, server-side, and route-handler flows to talk to Convex with the expected identity.

If you see `Convex auth is not ready` when opening protected features like `/chat`, check these first:

- `CLERK_JWT_ISSUER_DOMAIN` matches your Clerk Frontend API URL in both `.env.local` and the Convex deployment env
- the value is the base Clerk domain, such as `https://verb-noun-00.clerk.accounts.dev`, not the JWKS URL
- the Clerk Convex integration is active
- the Clerk JWT template name is exactly `convex` if you are managing templates manually
- you restarted `bun run dev` and signed out and back in after changing auth settings

Helpful docs:

- [Clerk Next.js docs](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Convex integration docs](https://clerk.com/docs/guides/development/integrations/databases/convex)
- [Clerk JWT templates docs](https://clerk.com/docs/backend-requests/jwt-templates)

### 4. Set up OpenAI

Create an OpenAI API key for this app, then add it to the Convex deployment environment as:

- `OPENAI_API_KEY`

The protected chat route uses a Convex action for OpenAI calls, so the key must exist in Convex runtime env. For local development, keep the same value in `.env.local` as well so local validation and setup checks see the intended configuration.

The chat implementation uses the OpenAI Responses API with streaming enabled, stores OpenAI response ids for `previous_response_id` continuation, and never exposes the key to browser code.

Helpful docs:

- [OpenAI Responses API migration guide](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- [OpenAI streaming responses guide](https://developers.openai.com/api/docs/guides/streaming-responses)

### 5. Set up Stripe

Create a recurring monthly price in Stripe, then add:

- `CONVEX_WEBHOOK_MUTATION_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_SECRET_KEY`

For local development, start webhook forwarding:

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

Copy the signing secret printed by the Stripe CLI into:

- `STRIPE_WEBHOOK_SECRET`

Webhook events to subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

For production, create a Stripe webhook endpoint that points to:

```text
https://your-domain.com/api/stripe/webhook
```

Helpful docs:

- [Stripe Checkout subscriptions docs](https://docs.stripe.com/payments/checkout/build-subscriptions)
- [Stripe Checkout fulfillment docs](https://docs.stripe.com/checkout/fulfillment)
- [Stripe event destinations docs](https://docs.stripe.com/event-destinations)
- [Stripe subscription webhooks docs](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Stripe webhook endpoint docs](https://docs.stripe.com/webhooks/configure)
- [Stripe Customer Portal docs](https://docs.stripe.com/customer-management/integrate-customer-portal)
- [How I Stay Sane Implementing Stripe](https://github.com/t3dotgg/stripe-recommendations/blob/main/README.md)

### 6. Set up Resend

Create an API key, verify a sending domain, and add:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Example:

```env
RESEND_FROM_EMAIL=Starter Stack <hello@mail.yourdomain.com>
```

Helpful docs:

- [Resend API keys docs](https://resend.com/docs/dashboard/api-keys/introduction)
- [Resend send email docs](https://resend.com/docs/api-reference/emails/send-email)

### 7. Set up PostHog

Create a PostHog project, then add:

- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `POSTHOG_API_KEY`

The same PostHog project key is used for both browser and server event capture in this template.

Helpful docs:

- [PostHog Next.js docs](https://posthog.com/docs/libraries/next-js)
- [PostHog JavaScript config docs](https://posthog.com/docs/libraries/js/config)
- [PostHog identify users docs](https://posthog.com/docs/getting-started/identify-users)

### 8. Set up Sentry

Create a Sentry project for the app, then add:

- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ENVIRONMENT`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

`SENTRY_ENVIRONMENT` is used for both server and client Sentry initialization so event labels stay aligned across runtimes.

Helpful docs:

- [Sentry Next.js manual setup docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup)
- [Sentry source maps docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps/)

### 9. Start local development

Once your env file is populated, run:

```bash
bun run dev
```

That starts:

- Next.js on `http://localhost:3000`
- Convex dev in watch mode

### 10. Verify the starter

Before you start building on top of the template, run:

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

Then verify these flows manually:

1. Sign in with Clerk and confirm your user syncs into Convex.
2. Open `/chat` and send a message after `OPENAI_API_KEY` is configured in Convex.
3. Open `/billing` and confirm billing state loads from Convex.
4. Trigger a Stripe test checkout and replay webhook events locally.
5. If you set `ENABLE_DEBUG_TOOLS=true`, send a test email.
6. If you set `ENABLE_DEBUG_TOOLS=true`, trigger a Sentry test event in development.

## Local development commands

- `bun run dev` to run the web app and Convex together
- `bun run dev:web` to run only Next.js
- `bun run dev:convex` to run only Convex
- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run format`

## Environment variable checklist

- `NEXT_PUBLIC_APP_URL`: your canonical app URL. Set this in `.env.local` even for local development, usually `http://localhost:3000`
- `CONVEX_DEPLOYMENT`: from `bun run dev:convex`
- `NEXT_PUBLIC_CONVEX_URL`: from `bun run dev:convex`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: from Clerk
- `CLERK_SECRET_KEY`: from Clerk
- `CLERK_JWT_ISSUER_DOMAIN`: from Clerk
- `OPENAI_API_KEY`: from OpenAI, server-only and also required in Convex runtime env for chat
- `CONVEX_WEBHOOK_MUTATION_SECRET`: generate a long random secret shared only between Next.js and Convex for webhook billing writes
- `STRIPE_SECRET_KEY`: from Stripe
- `STRIPE_WEBHOOK_SECRET`: from Stripe CLI locally or Stripe Dashboard in production
- `STRIPE_PRICE_PRO_MONTHLY`: from Stripe Product catalog
- `RESEND_API_KEY`: from Resend
- `RESEND_FROM_EMAIL`: from your verified Resend domain
- `NEXT_PUBLIC_POSTHOG_HOST`: from PostHog
- `NEXT_PUBLIC_POSTHOG_KEY`: from PostHog
- `POSTHOG_API_KEY`: from PostHog
- `NEXT_PUBLIC_SENTRY_DSN`: from Sentry
- `SENTRY_AUTH_TOKEN`: from Sentry
- `SENTRY_ENVIRONMENT`: usually `development`, `staging`, or `production`
- `SENTRY_ORG`: from Sentry
- `SENTRY_PROJECT`: from Sentry
- `ENABLE_DEBUG_TOOLS`: optional, set to `true` locally if you want the development-only email and Sentry debug endpoints enabled

## Convex runtime env

Some values must also exist in the Convex runtime when Convex code reads `process.env`:

- `CLERK_JWT_ISSUER_DOMAIN` for Clerk auth inside Convex
- `OPENAI_API_KEY` for streaming assistant responses from `convex/chat.ts`
- `CONVEX_WEBHOOK_MUTATION_SECRET` for trusted webhook billing writes from Next.js into Convex
- `STRIPE_PRICE_PRO_MONTHLY` for entitlement decisions during billing sync
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` for welcome email actions

Set those in your Convex deployment as well as `.env.local` when the corresponding integration is enabled.

For Clerk specifically, `CLERK_JWT_ISSUER_DOMAIN` should be your Clerk Frontend API URL, for example `https://verb-noun-00.clerk.accounts.dev`, and not the JWKS URL.

## Opinionated billing choices

The Stripe setup in this starter is intentionally opinionated. The goal is to keep billing boring, explicit, and hard to get subtly wrong as the app grows.

The core stance is simple: Stripe owns payment collection and subscription mechanics, but the app owns its readable billing state and entitlement checks. That means the UI reads Convex, not Stripe objects, and Stripe events are used to reconcile local state rather than becoming the local state directly.

- Checkout always uses a known Stripe customer. If a workspace does not have one yet, the server creates it before starting Checkout.
- The app reads billing state from Convex, not from Stripe SDK calls in components.
- Verified webhook events are treated as triggers to sync fresh Stripe state, not as the final source of truth by themselves.
- The webhook route acknowledges verified events quickly and runs the Stripe-to-Convex sync after the response so transient downstream latency is less likely to trigger Stripe retries.
- The Checkout success redirect also triggers the same sync path so the billing page can reflect updates immediately even if webhook delivery is slightly behind.
- Entitlements are derived from normalized local billing state, which keeps authorization checks out of Stripe-specific code paths.
- The starter assumes one current subscription per customer and fails loudly if Stripe returns multiple active candidates instead of guessing. Turn on Stripe's single-subscription redirect setting before using this flow in production.
- The starter uses Stripe Checkout and Customer Portal first because hosted billing surfaces are usually the fastest route to a production-ready SaaS.

These choices are influenced by Stripe's own guidance to use both webhooks and the post-checkout landing page for reliable fulfillment, and to fetch current data when integrity matters instead of blindly trusting a point-in-time event snapshot. They also line up with the anti-split-brain Stripe approach described in Theo's write-up. See [Stripe Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment), [Stripe event destinations](https://docs.stripe.com/event-destinations), and [How I Stay Sane Implementing Stripe](https://github.com/t3dotgg/stripe-recommendations/blob/main/README.md).

## Project structure

```text
src/
  app/
    (marketing)/
    (auth)/
    (app)/
    api/
  components/
    app/
    layout/
    providers/
    ui/
  emails/
  lib/
    analytics/
    auth/
    billing/
    convex/
    email/
    env/
    flags/
    sentry/
convex/
```

## Included feature

The authenticated `Chat` feature is the reference implementation for future work:

- protected route in `src/app/(app)/chat/page.tsx`
- user sync mutation in `convex/users.ts`
- workspace-scoped auth helpers in `convex/auth.ts`
- chat queries, mutations, and OpenAI streaming action in `convex/chat.ts`
- model allowlist and chat business rules in `src/lib/chat/`
- entitlement-aware free assistant-message limit enforced in Convex

## Provider flows

- Billing starts in `/api/billing/checkout`.
- Billing management is restricted to workspace owners and admins.
- Stripe customer creation, checkout-success sync, and webhook sync logic live in `src/lib/billing/stripe-sync.ts`.
- Stripe webhook verification lives in `/api/stripe/webhook/route.ts`, and supported events trigger a fresh Stripe-to-Convex sync.
- The checkout success redirect lands on `/api/billing/success`, which runs the same sync path before sending the user back to `/billing`.
- The sync path writes through secret-gated Convex mutations so billing writes stay server-trusted even though Next.js cannot invoke internal Convex functions directly.
- Subscription billing periods are read from Stripe subscription items, matching current Stripe guidance.
- Billing state is read from Convex, not from Stripe objects in the UI.
- Test email sending lives in `/api/email/test/route.tsx` and is only enabled outside production when `ENABLE_DEBUG_TOOLS=true`.
- Test Sentry capture lives in `/api/debug/sentry/route.ts` and is only enabled outside production when `ENABLE_DEBUG_TOOLS=true`.

## Testing

The repo includes example regression tests:

- env parsing in `src/lib/env/env.test.ts`
- debug tool gating in `src/lib/app/debug-tools.test.ts`
- chat business rules in `src/lib/chat/rules.test.ts`
- Stripe webhook sync target extraction in `src/lib/billing/stripe-webhooks.test.ts`
- Stripe sync helpers in `src/lib/billing/stripe-sync.test.ts`
- Stripe webhook route behavior in `src/app/api/stripe/webhook/route.test.ts`
- billing authorization routes in `src/app/api/billing/routes.test.ts`

## More docs

- `ARCHITECTURE.md`
- `CONVENTIONS.md`

## Contributing

If you notice something that feels off, have an idea to improve the starter, or find a pattern that could be clearer, contributions are welcome.

The goal is to keep the template a strong starting point for future products and future AI-assisted work.

If you open a PR, try to keep `README.md`, `ARCHITECTURE.md`, `CONVENTIONS.md`, and `.env.local.example` aligned. If you add behavior, add or update tests around the real implementation path so the template stays trustworthy as it evolves.
