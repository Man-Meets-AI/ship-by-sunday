# Architecture

This document explains the system shape: which layer owns what, how requests flow, and what the main data concepts mean.
If you are changing code style or adding new functionality, read `CONVENTIONS.md` alongside this file.

## Principles

- Keep each vendor in one lane.
- Model product concepts in Convex first.
- Prefer thin integration boundaries over provider-shaped application code.
- Make route ownership obvious from the folder structure.

## Ownership

### Next.js

- owns route groups, layouts, metadata, route handlers, and shell composition
- hosts narrow integration endpoints like Stripe webhooks and billing redirects
- gates development-only debug routes behind explicit environment opt-in
- renders the marketing site, auth entry points, and protected product pages

### Convex

- owns application tables, domain logic, authorization helpers, and starter feature logic
- stores users, workspaces, memberships, notes, stripe customers, subscriptions, and entitlements
- exposes queries for reads, mutations for writes, actions for external side effects, and internal functions when the caller is another Convex function

### Clerk

- owns sign-in, session identity, and route protection proxy logic
- does not own workspace truth, billing truth, or product permissions

### Stripe

- owns Checkout, Customer Portal, invoices, and subscription lifecycle events
- webhooks are verified in Next.js, acknowledged quickly, and treated as triggers to sync fresh Stripe customer and subscription state into Convex through a secret-gated server-trusted mutation boundary
- subscription billing periods are normalized from subscription items, matching current Stripe API guidance
- Stripe objects are integration inputs, not the product data model

### Resend

- owns server-side transactional email delivery
- email templates live in `src/emails`

### PostHog

- owns analytics capture and event ingestion
- stable event names live in `src/lib/analytics/events.ts`

### Sentry

- owns errors and tracing
- safe context only; do not attach raw third-party payloads or secrets

## Request flow examples

### Authenticated notes feature

1. Clerk proxy protection gates `/notes`.
2. `src/components/providers/user-bootstrap.tsx` synchronizes the signed-in user into Convex.
3. `src/components/app/notes-workbench.tsx` calls Convex query and mutation refs.
4. `convex/auth.ts` resolves the current user and workspace membership.
5. `convex/notes.ts` applies the business rule and writes the note.

### Billing

1. User submits `/api/billing/checkout`.
2. Next.js route handler uses Clerk auth plus a Convex query to resolve the current workspace and membership.
3. Stripe Checkout is created with workspace metadata.
4. Checkout success redirects through `/api/billing/success`, which eagerly syncs the latest Stripe state before the user returns to `/billing`.
5. Stripe webhook calls `/api/stripe/webhook`.
6. Webhook verification succeeds before any write happens.
7. The webhook event is used as a sync trigger, then the latest Stripe state is written through a secret-gated Convex mutation, and only then is the event marked processed.
8. UI reads `convex/billing.ts`, never Stripe directly.

## Route groups

- `(marketing)` contains public pages.
- `(auth)` contains Clerk auth routes.
- `(app)` contains protected product routes.
- `api/` contains explicit integration endpoints only.

## Domain model

- `users`: app-level user profile linked to an auth provider subject
- `workspaces`: product-level tenant records
- `memberships`: workspace membership and role
- `notes`: starter authenticated feature
- `stripeCustomers`: Stripe-to-workspace mapping
- `subscriptions`: normalized billing lifecycle state
- `entitlements`: app-readable feature access state
- `processedStripeEvents`: applied webhook receipts for idempotency, not a full billing audit log
