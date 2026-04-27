---
title: 'Planning Brief 13 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 13
status: 'current'
summary: 'Thirteenth child slice should remove the auth feature folder by moving identity route UI into the identity route group and shared auth route URL helpers into platform auth.'
read_when:
  - 'Writing or executing the auth feature-folder removal ExecPlan.'
  - 'Checking the identity route and post-checkout sign-up ownership slice.'
---

# Planning Brief 13 Feature Folder Surface

The thirteenth slice should delete `apps/web/features/auth` only if it can do so without changing sign-in route behavior, sign-up route behavior, SSO callback behavior, reset-password task redirects, Clerk task URL configuration, protected workspace sign-in redirects, checkout-success sign-up handoff links, post-checkout sign-up form behavior, or release proof scope classification for billing-sensitive sign-up code.

Move identity route presentation and client flow code to explicit private owners under `apps/web/app/(identity)`. Move route URL helpers that are consumed outside the identity route group to `apps/web/platform/auth`, because they define app-wide auth paths and Clerk task redirect behavior rather than identity route UI. Preserve the post-checkout sign-up billing sensitivity by updating `scripts/release/lib/release-scope.mjs` and its focused unit test to recognize the new sign-up owner. Update route pages, root layout, workspace access, checkout success, tests, and docs/plan surfaces away from `@/features/auth`.

Do not change Clerk environment behavior, middleware behavior, checkout, Stripe, pricing, promo code behavior, Convex schema, generated Convex files, AppShell, route URLs, public auth copy, Clerk component behavior, protected route access policy, or production release proof semantics. Because this slice moves post-checkout sign-up code and release-scope classification, production proof should include `billing_integration` after merge unless the release-scope job explicitly proves it is not required.
