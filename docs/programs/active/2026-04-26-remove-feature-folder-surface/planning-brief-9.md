---
title: 'Planning Brief 9 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 9
status: 'current'
summary: 'Ninth child slice should remove the checkout feature folder by moving checkout UI to the checkout route and server helpers to platform billing checkout owners.'
read_when:
  - 'Writing or executing the checkout feature-folder removal ExecPlan.'
  - 'Checking the billing-sensitive checkout ownership slice.'
---

# Planning Brief 9 Feature Folder Surface

The ninth slice should delete `apps/web/features/checkout` only if it can do so without changing Stripe Checkout creation, pending checkout cookie behavior, checkout success session recovery, post-payment sign-in and sign-up recovery, pricing, promotion-code behavior, webhook assumptions, environment behavior, or product-access handoff.

Move the checkout button and its client checkout hook to private folders under `apps/web/app/checkout`. Move the pending checkout session cookie helper, checkout session parameter builder, checkout session state interpreter, and checkout session recovery helpers under `apps/web/platform/billing/checkout`. Preserve the `server-only` guards on true server-only helpers. Update release-scope detection so the new platform billing checkout path still forces hosted `billing_integration` after merge.

Do not change Convex schema or generated Convex files. Do not move route screens, AppShell, route groups, marketing feature code, auth feature code, product-access behavior, shared UI inventory, Stripe price helpers, webhook handlers, pricing config, promo code config, or environment behavior. The focused proof should cover checkout session params, checkout session state, checkout route creation, sign-in and sign-up recovery consumers, access-required checkout consumers, homepage checkout CTA consumers, release-scope classification, app lint/typecheck, and Program/ExecPlan validation. After the PR merges, verify the production proof for the merged `main` commit and confirm `billing_integration` ran and passed.
