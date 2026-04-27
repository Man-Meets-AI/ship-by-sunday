---
title: 'Research Pass Feature Folder Surface'
summary: 'Inventory of the remaining apps/web/features surface before starting the feature-folder reduction initiative.'
docType: 'research'
status: 'active'
read_when:
  - 'Choosing the next feature-folder reduction slice.'
  - 'Checking why the first slice starts with generic and metadata surfaces.'
---

# Research Pass Feature Folder Surface

The previous app-structure Program made ownership clearer but intentionally did not delete most feature folders. A fresh inventory on branch `codex/remove-feature-folder-surface` shows that `apps/web/features` still contains route-owned, platform-owned, shared, and durable product-domain code.

Top-level file counts before this initiative:

    18 apps/web/features/auth
    19 apps/web/features/blog
    40 apps/web/features/blueprint-flow
     6 apps/web/features/checkout
    11 apps/web/features/codex
   350 apps/web/features/course
     7 apps/web/features/docs
    16 apps/web/features/execute-ship
    32 apps/web/features/marketing
    16 apps/web/features/observability
     2 apps/web/features/product-access
     1 apps/web/features/public-metadata
     4 apps/web/features/settings
     1 apps/web/features/shared
     4 apps/web/features/starter
     4 apps/web/features/starter-repo
     6 apps/web/features/workspace-home
     6 apps/web/features/workspace-navigation
    15 apps/web/features/workspace-shell

The smallest safe deletion candidates are `features/shared` and `features/public-metadata`. `features/shared` contains only `hooks/use-autosave.ts`, which is a generic client hook with one unit test. `features/public-metadata` contains only `server/content-route-index.ts`, which is used by `apps/web/app/sitemap.ts` and covered by `apps/web/tests/unit/public-metadata-routes.test.ts`.

The remaining folders need separate slices because they are route-facing or business-facing. `features/settings` and `features/workspace-home` are protected workspace route UI. `features/starter` and `features/starter-repo` feed docs, checkout success, workspace shell, Convex, course workbench, and starter access behavior. `features/checkout`, `features/product-access`, and `features/observability` sit on release-sensitive API or error-reporting boundaries. `features/course` is the largest knot and must be split gradually.
