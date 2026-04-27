---
title: 'Planning Brief 10 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 10
status: 'current'
summary: 'Tenth child slice should remove the observability feature folder by moving route UI, shared incident models, server ingest helpers, source adapters, and runtime-intake export code to explicit owners.'
read_when:
  - 'Writing or executing the observability feature-folder removal ExecPlan.'
  - 'Checking the error-reporting and incident ownership slice.'
---

# Planning Brief 10 Feature Folder Surface

The tenth slice should delete `apps/web/features/observability` only if it can do so without changing error boundary UI behavior, not-found UI behavior, client error reporting, request ID propagation, server error capture, Convex incident ingest, incident status updates, Vercel webhook incident mapping, Clerk webhook incident mapping, Stripe failure incident mapping, Telegram incident rendering, or runtime intake export behavior.

Move app-owned error and not-found screens to App Router private components. Move client-safe incident models, error-event helpers, client error reporting, Stripe webhook incident mapping, Telegram rendering, and runtime intake export helpers to `apps/web/lib/observability`. Move server-only error capture, ingest, API error response, request ID helpers, source adapters, and incident status update helpers to `apps/web/platform/observability`. Preserve `server-only` guards on true server-only helpers. Update Convex runtime imports only where they point at moved shared observability models; do not modify Convex schema or generated Convex files.

Do not change billing, checkout, Stripe checkout, webhook behavior, pricing, promotion-code behavior, environment behavior, Convex schema, generated Convex files, AppShell, route screens beyond import ownership, shared UI inventory, or production release proof semantics. The focused proof should cover observability unit tests, observability route integration tests, error and not-found UI tests, proxy protected-route capture, Stripe observability adapters, runtime-intake export tests, app lint/typecheck, and Program/ExecPlan validation. After the PR merges, verify normal production proof for the merged `main` commit.
