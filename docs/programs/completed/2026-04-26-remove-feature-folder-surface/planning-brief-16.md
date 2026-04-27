---
title: 'Planning Brief 16 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 16
status: 'current'
summary: 'Sixteenth child slice should remove the blueprint-flow feature folder by moving blueprint route UI, shared blueprint helpers, and the download route server helper to explicit owners.'
read_when:
  - 'Writing or executing the blueprint-flow feature-folder removal ExecPlan.'
  - 'Checking the canonical Blueprint route ownership slice.'
---

# Planning Brief 16 Feature Folder Surface

The sixteenth slice should delete `apps/web/features/blueprint-flow` without changing the canonical Blueprint, Review, legacy route redirect, or download behavior. The folder currently mixes protected workspace route UI, route-local hooks, shared blueprint helper contracts, scripts, and one server-only download helper. Those should be separated into explicit owners before the folder is removed.

Move blueprint route UI components, including video card UI, to `apps/web/app/(workspace)/_components/blueprint-flow`. Move blueprint route-local hooks to `apps/web/app/(workspace)/_hooks/blueprint-flow`. Move shared blueprint helper modules and types to `apps/web/lib/blueprint-flow`. Move `server/downloads.ts` to `apps/web/app/api/download/repo/_server/downloads.ts` and keep its `import "server-only"` guard. Update app routes, AppShell nav, review hooks/components, scripts, tests, execute-ship shared helpers, and legacy redirect helpers to import the new owners. Delete `apps/web/features/blueprint-flow` after scans are clean. Do not change visible Blueprint copy, route URLs, review auto-download behavior, download authorization, post-review unlock behavior, checkout, billing, Stripe, pricing, promo codes, Convex schema, generated Convex files, or environment behavior.

Focused proof should include Blueprint page and stage navigation integration-ui tests, blueprint state/model unit tests, review download handoff tests, the blueprint download route test, legacy route redirect tests, the review page integration-ui test, and the scripts that consume blueprint helper contracts if they have existing validation commands. After merge, production proof should at least run `default_ship`; billing proof should only run if release scope detects a billing-sensitive change.
