---
title: 'Planning Brief 3 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 3
status: 'current'
summary: 'Third child slice should remove the workspace-home feature folder by moving protected workspace home UI into App Router workspace folders.'
read_when:
  - 'Writing or executing the workspace-home feature-folder removal ExecPlan.'
  - 'Checking the next route-local feature-folder reduction slice.'
---

# Planning Brief 3 Feature Folder Surface

The third slice should delete `apps/web/features/workspace-home`. Move workspace home route components into private workspace App Router folders and move `workspace-home-model.ts` into `apps/web/app/(workspace)/_lib`. Update route and test imports to the new homes.

Preserve route behavior and avoid moving starter, starter-repo, billing, checkout, Stripe, Convex schema, generated Convex files, AppShell, shared UI inventory, or course files in this slice. The focused proof should cover the workspace home model and page composition before app lint/typecheck and Program/ExecPlan validation.
