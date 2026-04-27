---
title: 'Planning Brief 1 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 1
status: 'current'
summary: 'First child slice removes the generic shared hook folder and public metadata feature folder.'
read_when:
  - 'Writing or executing the first child ExecPlan.'
  - 'Checking the boundaries for the generic and metadata helper move.'
---

# Planning Brief 1 Feature Folder Surface

The first slice should delete two top-level feature folders with clear replacement homes. Move `apps/web/features/shared/hooks/use-autosave.ts` to `apps/web/hooks/use-autosave.ts` and update `apps/web/tests/unit/use-autosave.test.tsx`. Move `apps/web/features/public-metadata/server/content-route-index.ts` to `apps/web/app/_metadata/content-route-index.ts` and update `apps/web/app/sitemap.ts`.

Do not touch billing, checkout behavior, Stripe behavior, webhook behavior, pricing, promotion codes, environment behavior, Convex schema, generated Convex files, route behavior, AppShell, route screens, or shared UI inventory.

Focused proof should include `bun run --cwd apps/web test:unit -- tests/unit/use-autosave.test.tsx tests/unit/public-metadata-routes.test.ts`, then app lint and typecheck. Plan and Program docs must pass their linters because this slice creates a new active Program and child ExecPlan.
