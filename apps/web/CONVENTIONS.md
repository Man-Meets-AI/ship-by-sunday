# Web App Conventions

This document is the change guide for `apps/web`. It assumes the ownership model in `apps/web/ARCHITECTURE.md` and should be read before extending the web app, Convex backend, billing, provider setup, or transactional email.

## Default Rule

Copy the sibling template's architecture and naming unless this app has an explicit product requirement that needs an adaptation. Do not preserve a current path, route group, helper layer, or provider boundary only because it already exists.

## Product Modeling

Model product concepts in Convex first. The app's business concepts are users, workspaces, memberships, Starter annual licenses, Workers subscriptions, Worker Seal Team 6 service bookings, entitlements, refunds, provider events, and email delivery records.

Do not use provider payloads, client cookies, Clerk metadata, route params, or UI state as product truth. Validate external payloads at the boundary, normalize the app state into Convex, and let UI read Convex.

Do not collapse Starter, Workers, and Worker Seal Team 6 into one vague paid-access state. They have different purchase, renewal, cancellation, refund, and fulfillment behavior.

## Routes

Use route groups by product intent:

- Public pages live under `src/app/(marketing)`.
- Clerk auth pages live under `src/app/(auth)`.
- Protected product routes live under `src/app/(app)`.
- Integration endpoints live under `src/app/api`.

The target public landing pages are `/`, `/starter`, `/workers`, and `/worker-seal-team-6`. Starter and Workers can have protected child routes under `(app)` with the same URL prefixes. The route group controls code organization; it must not leak into the URL.

Do not add compatibility redirects for historical route names unless a slice documents the live dependency and removal path.

## Components

Keep shared app components in `src/components/app`, shared page chrome and layout primitives in `src/components/layout`, providers in `src/components/providers`, and shadcn primitives in `src/components/ui`.

Route-specific marketing or protected page pieces can live in route-local `_components/` folders when they are not reused. Prefer route-local components over inventing a broad generic component namespace.

Keep rendering, orchestration, domain logic, and external I/O separate. Components should call typed helpers and Convex function refs; they should not know raw provider payload shapes.

## Convex

Follow `apps/web/convex/_generated/ai/guidelines.md`.

Always include argument validators for Convex functions. Use internal functions for private server-side calls. Use `ctx.auth.getUserIdentity()` for authenticated operations and prefer `identity.tokenIdentifier` for stable auth-linked lookup. Never accept a user id argument for authorization.

Keep Convex modules domain-named and small enough to scan. Authorization helpers belong near the data they protect. Provider idempotency ledgers belong in Convex, not in route-local module state.

Use indexes for growing data access. Do not rely on unbounded `.collect()` for product queries.

## Billing

Billing state comes from Convex. Entitlements are what the app checks, not raw Stripe statuses.

Stripe webhooks are verified triggers to sync fresh provider state. Checkout success routes should trigger the same sync path so the customer sees current state even if webhook delivery lags.

Billing actions require Clerk authentication and Convex authorization for the workspace, license, or subscription being changed. Authentication alone is not authorization.

Starter renewal uses fresh app-owned Stripe Checkout. Workers subscription management uses Stripe Customer Portal when it supports the final plan-change policy. Worker Seal Team 6 uses Cal.com paid booking rather than app-owned checkout.

Refunds are issued in Stripe or Cal.com provider dashboards for this Program. The app mirrors provider truth into Convex. Do not add in-app admin refund actions in this migration.

## Email

Transactional email goes through server-only Resend helpers and React Email templates. Templates live under `src/emails`, while sending helpers live under `src/lib/email`.

Send customer and internal ops emails from normalized Convex state with dedicated idempotency keys. Do not send directly from a raw webhook payload. Webhook acknowledgement must not depend on email delivery.

Do not duplicate Stripe receipts or Cal.com booking confirmations in app emails. App emails explain product state, access, preparation, support contact, and next action when the app owns that customer communication.

## Environment Variables

Every new environment variable must be documented where future workers will look. The target env code is:

- `src/lib/env/client.ts` for public variables.
- `src/lib/env/server.ts` for server-only variables.
- `src/lib/env/app-url.ts` for trusted app URL derivation.

Optional integrations should validate env at the boundary that uses them. Production-required env must fail clearly when missing. Local and preview may skip optional paths only when the skipped behavior is explicit.

## Debug Tools

Debug tools and test endpoints require explicit opt-in flags. Do not rely on `NODE_ENV !== "production"` as the only guard.

Debug responses must not expose secrets, webhook signatures, raw provider payloads, payment method details, or sensitive customer content.

## Observability

PostHog owns analytics. Sentry owns errors and tracing. Keep analytics and observability side effects out of critical billing paths when a failure should not change the business outcome.

Capture safe context only. Provider payloads should be summarized into safe identifiers and states before they reach logs, analytics, or Sentry.

## Tests And Proof

Risk determines test depth. Billing, auth, webhooks, entitlements, provider setup, external email, and paid booking are P0/P1 surfaces. They need route tests, Convex tests, idempotency tests, failure-mode tests, and provider setup docs.

Each migration slice should validate the exact production path it touches before broad gates. For docs-only slices, run the plan, Program, markdown, and whitespace checks. For runtime slices, add focused app tests before running broader `bun run lint`, `bun run typecheck`, and relevant release proof.

## External Setup

External setup is part of the shipped contract. If a change requires Clerk, Convex, Stripe, Cal.com, Resend, Sentry, Vercel, GitHub, or any other provider configuration, update setup docs in the same change. Include what to create, exact names or URLs, environment ownership, where values go, how to verify setup, and what failure looks like.
