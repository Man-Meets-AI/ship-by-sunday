---
title: 'Planning Brief 5 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 5
status: 'current'
summary: 'Fifth child slice should remove the starter-repo feature folder by moving validation, copy, and workspace UI to explicit owners without changing access behavior.'
read_when:
  - 'Writing or executing the starter-repo feature-folder removal ExecPlan.'
  - 'Checking the next starter-repo feature-folder reduction slice.'
---

# Planning Brief 5 Feature Folder Surface

The fifth slice should delete `apps/web/features/starter-repo` only if it can do so without changing behavior. Move the pure GitHub username validator to a neutral server-safe helper such as `apps/web/lib/github-username.ts`, then update both the Convex mutation import and focused unit tests. Move starter-repo access copy to an explicit non-feature owner such as `apps/web/config/starter-repo-access-copy.ts`. Move the starter-repo access card and form into a workspace-owned component folder that can still be consumed by settings, workspace home, and mission surfaces without treating starter-repo as a top-level feature domain.

Preserve billing, checkout, Stripe, Convex schema, generated Convex files, route behavior, AppShell, shared UI inventory, course workbench behavior, and starter-repo access semantics in this slice. The focused proof should cover GitHub username validation, starter-repo access card/form rendering, the settings/workspace-home consumers, and any existing Convex-safe import path before app lint/typecheck and Program/ExecPlan validation.
