---
title: 'Normalized Pass Feature Folder Surface'
summary: 'Normalized slice ordering for reducing the remaining apps/web/features tree.'
docType: 'normalized_pass'
status: 'active'
read_when:
  - 'Comparing candidate slices for feature-folder reduction.'
  - 'Checking the boundary rules for the generic surface removal slice.'
---

# Normalized Pass Feature Folder Surface

The desired direction is to make `apps/web/app` own route-local screens and route metadata, make `apps/web/hooks` and `apps/web/lib` own truly generic helpers, keep `apps/web/platform` for external runtime adapters, and leave only durable product domains in `apps/web/features` until they can be moved safely.

The first slice should remove generic and metadata surfaces because they have the lowest behavioral risk and delete two top-level feature folders outright. Move `features/shared/hooks/use-autosave.ts` to `apps/web/hooks/use-autosave.ts`. Move `features/public-metadata/server/content-route-index.ts` to a private App Router metadata helper under `apps/web/app/_metadata/content-route-index.ts`. Update imports and delete the old folders.

The second slice should move settings route UI into `apps/web/app/(workspace)/settings/_components` and update `workspace-home` consumers of the account card. It should keep starter repository access untouched except for imports.

The third slice should move workspace home route UI into `apps/web/app/(workspace)/_components/workspace-home` and its model into `apps/web/app/(workspace)/_lib/workspace-home-model.ts`.

Later slices should split starter and starter-repo only after deciding which parts are docs route support, Convex-safe validation, course workbench copy, and protected workspace UI. Billing, Stripe, Convex schema, generated Convex files, and public route behavior must stay out of early deletion slices.
