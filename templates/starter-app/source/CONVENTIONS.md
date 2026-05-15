# Conventions

This document is the change guide for the repo.
It assumes the ownership model in `ARCHITECTURE.md` and focuses on the rules contributors should follow when extending the template.

## Product modeling

- Add new product data models in Convex before building UI around them.
- Do not use provider payloads as your primary application state.
- Keep table and module names aligned with product concepts.

## Auth and authorization

- Route protection goes through Clerk proxy configuration and internal auth helpers.
- Authorization checks for Convex-owned data belong in Convex helpers, not duplicated in components.
- Do not add product-specific authorization rules directly to Clerk metadata or UI-only checks.

## Billing

- Billing state comes from Convex.
- Stripe webhooks are the source of truth for subscription lifecycle changes.
- Entitlements are what the app checks, not raw Stripe statuses.
- Billing actions must be gated by workspace role, not just authentication.
- Verified webhook routes should acknowledge Stripe quickly, then run slower reconciliation work after the response.
- Use supported Stripe events as triggers to sync fresh customer and subscription state before the UI consumes local billing state.
- Trigger the same sync path from the Checkout success landing route so the customer-visible billing page updates promptly even if webhook delivery lags.
- Assume one current subscription per customer unless you deliberately redesign the billing model. If Stripe returns multiple active candidates, fail loudly instead of guessing.
- Verified webhook handlers should write through a server-trusted Convex boundary. If the caller is a Next.js route handler, require a dedicated shared secret because Next.js helpers only invoke public Convex functions.

## Analytics

- Add new event names to `src/lib/analytics/events.ts` first.
- Capture client events through `src/lib/analytics/client.ts`.
- Capture server events through `src/lib/analytics/server.ts`.
- Keep one stable user identity strategy across client and server events.

## UI

- Use local app-level abstractions like `PageShell`, `AppHeader`, and `SectionHeader` before inventing new page structures.
- Do not paste raw primitive recipes everywhere when a reusable local component should exist.
- Default to server components and keep client islands small.

## Environment variables

- Every new environment variable must be added to `.env.local.example`.
- Public variables belong in `src/lib/env/client.ts`.
- Server-only variables belong in `src/lib/env/server.ts`.
- Optional integrations should validate env at the boundary that uses them, not during unrelated app startup.
- Update README setup instructions whenever env requirements change.

## Debug tools

- Development-only debug endpoints must require an explicit opt-in flag, not just `NODE_ENV !== "production"`.

## Server-only integrations

- Stripe, Resend, PostHog server capture, and Sentry server capture stay out of client components.
- Use route handlers or Convex actions for third-party side effects.
- Keep heavy side effects off critical request paths when the business write should still succeed.

## Observability

- Capture safe context only.
- Never attach secrets, webhook signatures, raw Stripe payloads, or sensitive user content to Sentry.
- Keep analytics and observability side effects out of critical billing paths when a failure should not change the business outcome.
