---
title: 'Planning Brief 18 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 18
status: 'current'
summary: 'Final child slice should remove the marketing feature folder by moving homepage UI to app-private owners and homepage contracts to app-owned content and library modules.'
read_when:
  - 'Writing or executing the marketing feature-folder removal ExecPlan.'
  - 'Checking the canonical homepage ownership slice.'
---

# Planning Brief 18 Feature Folder Surface

The eighteenth slice should delete `apps/web/features/marketing` without changing the public homepage, blog promo copy, homepage structured data, checkout CTA behavior, pricing copy, promo banner behavior, or public metadata behavior. This is the final remaining top-level feature folder, so the slice should also update the Program toward completion after validation and merge proof.

Move homepage route UI from `apps/web/features/marketing/components/home-page*` to `apps/web/app/_components/home-page`. Move homepage content to `apps/web/app/_content/home-page.ts`. Move homepage render-model and structured-data helpers to `apps/web/app/_lib`. Move the existing marketing effect primitive implementations into the already-public `apps/web/components/ui/*` files that currently re-export them. Keep `apps/web/components/ui` inventory intact. If the currently unused GitHub contributions and globe arc helpers are still present, move them to explicit app-owned homes rather than leaving a `features/marketing` compatibility surface.

Update `apps/web/app/page.tsx`, blog content, tests, homepage docs, and any current docs that reference `features/marketing` to use the new owners. Preserve `starterConfig.homePage`, `homePageSectionOrder`, `HomePageCtaTarget`, the `#system` and `#pricing` anchors, `FAQPage` and `Product` structured-data truth rules, checkout target behavior, Stripe and promo-code behavior, billing, Convex schema, generated Convex files, environment behavior, and all visible homepage copy and layout.

Focused proof should include homepage content, render-model, structured-data, public metadata route, marketing effect primitive, encrypted-text, blog metadata or promo consumer tests if imports move, and the integration-ui test for `HomePagePrimaryCta`. After that, run app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, old-path scans proving no `features/marketing` references remain in current app/docs surfaces, `git diff --check`, and then the ordinary PR CI and production proof after merge.
