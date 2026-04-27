---
title: 'Planning Brief 4 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 4
status: 'current'
summary: 'Fourth child slice should remove the starter feature folder by moving selector/config helpers and docs disabled-state UI to explicit owners.'
read_when:
  - 'Writing or executing the starter feature-folder removal ExecPlan.'
  - 'Checking the next small non-domain feature-folder reduction slice.'
---

# Planning Brief 4 Feature Folder Surface

The fourth slice should delete `apps/web/features/starter`. Move `starter-selectors.ts` to an explicit config-owned helper such as `apps/web/config/starter-selectors.ts`, then update its first-party app, feature, and test imports. Move the docs disabled-state UI into the docs App Router owner, for example `apps/web/app/docs/_components/docs-module-disabled-state.tsx`. Before deleting `course-module-disabled-state.tsx`, rerun the consumer scan; if it is still unused, delete it with the old starter disabled-card helper instead of inventing a compatibility export.

Preserve starter-repo, billing, checkout, Stripe, Convex schema, generated Convex files, route behavior, AppShell, shared UI inventory, and course workbench behavior in this slice. The focused proof should cover starter selector behavior and docs disabled-state rendering before app lint/typecheck and Program/ExecPlan validation.
