---
title: 'Planning Brief 7 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 7
status: 'current'
summary: 'Seventh child slice should remove the product-access feature folder by moving shared access types and server access orchestration to explicit owners.'
read_when:
  - 'Writing or executing the product-access feature-folder removal ExecPlan.'
  - 'Checking the next release-sensitive product access boundary slice.'
---

# Planning Brief 7 Feature Folder Surface

The seventh slice should delete `apps/web/features/product-access` only if it can do so without changing access, entitlement, checkout recovery, or resume redirect behavior. Move the shared `ProductAccess` and access-status types to a neutral client-safe helper such as `apps/web/lib/product-access.ts`. Move the server-only product-access orchestration to an explicit platform owner such as `apps/web/platform/access/product-access.ts`, preserving its `server-only` guard and all existing calls to checkout session recovery, Convex auth, `api.access.viewerProductAccess`, and `api.codebase.getCodebaseResumeDestination`.

This slice is release-sensitive because protected route access and checkout handoff depend on it. Preserve billing, checkout, Stripe, webhook, pricing, promotion-code, environment, Convex schema, generated Convex files, AppShell, route screen, and shared UI behavior. The focused proof should cover the server product-access unit tests, protected layout import mock, access-required view-model consumers, Codex route helper authorization, and app lint/typecheck before Program/ExecPlan validation. After the PR merges, verify the normal production proof and check whether release scope requires `billing_integration`.
