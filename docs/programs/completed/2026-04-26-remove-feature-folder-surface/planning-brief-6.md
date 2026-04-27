---
title: 'Planning Brief 6 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 6
status: 'current'
summary: 'Sixth child slice should remove the workspace-navigation feature folder by moving workspace navigation UI and routing helpers to explicit non-feature owners.'
read_when:
  - 'Writing or executing the workspace-navigation feature-folder removal ExecPlan.'
  - 'Checking the next shared workspace navigation boundary slice.'
---

# Planning Brief 6 Feature Folder Surface

The sixth slice should delete `apps/web/features/workspace-navigation` only if it can do so without changing route semantics, AppShell ownership, lesson map links, or post-review resume behavior. Move `workspace-primary-nav.tsx` and `workspace-local-nav-rail.tsx` to a workspace-owned App Router private component folder such as `apps/web/app/(workspace)/_components/workspace-navigation`. Move the shared navigation model and routing helpers to an explicit non-feature owner such as `apps/web/lib/workspace-navigation`, while keeping Convex imports relative from `apps/web/convex`.

Preserve AppShell location and public route behavior in this slice. Do not move route screens, checkout, billing, Stripe, Convex schema, generated Convex files, or shared UI primitives. The focused proof should cover primary navigation rendering, primary nav model behavior, post-review resume destination behavior, legacy lesson-map href behavior, the curriculum contract that consumes lesson-map routing, and Convex-safe import paths before app lint/typecheck and Program/ExecPlan validation.
