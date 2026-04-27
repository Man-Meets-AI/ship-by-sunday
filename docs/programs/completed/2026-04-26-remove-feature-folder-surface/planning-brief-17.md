---
title: 'Planning Brief 17 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 17
status: 'current'
summary: 'Seventeenth child slice should remove the course feature folder by moving course domain contracts to lib/course and workspace course UI to route-private owners.'
read_when:
  - 'Writing or executing the course feature-folder removal ExecPlan.'
  - 'Checking the canonical course ownership slice.'
---

# Planning Brief 17 Feature Folder Surface

The seventeenth slice should delete `apps/web/features/course` without changing lesson, mission, artifacts, bonus lesson, skill rail, video verification, or Convex course behavior. The folder currently mixes shared course domain contracts, route-facing React UI, workbench renderers, browser hooks, route helpers, script-facing video metadata, and Convex-imported lesson registry helpers. Those should be separated into explicit owners before the folder is removed.

Move course domain contracts, lesson registry, curriculum content builders, route helpers, lesson resources, video verification helpers, prompt-copy helpers, mission view-model helpers, artifacts grouping helpers, and shared course types to `apps/web/lib/course`. Move workspace route UI for lessons, mission, artifacts, workbench, shells, video surfaces, and skill rail components to `apps/web/app/(workspace)/_components/course`. Move course-specific React hooks to `apps/web/app/(workspace)/_hooks/course`. Update app routes, AppShell, execute-ship pages, Blueprint video consumers, workspace navigation helpers, billing recovery imports, scripts, tests, and Convex course source modules to import from those new owners. Convex source import updates are allowed only to preserve the existing course helper references; do not change Convex schema, generated Convex files, function names, arguments, indexes, or persistence behavior. Delete `apps/web/features/course` after scans are clean.

Do not change visible lesson copy, curriculum data, mission progression, artifacts grouping behavior, route URLs, bonus lesson access, skill rail interaction, video URLs, checkout, billing, Stripe, pricing, promo codes, Convex schema, generated Convex files, environment behavior, marketing, or the remaining `apps/web/features/marketing` folder.

Focused proof should include pure course registry and lesson model tests, course workbench helper tests, mission and artifacts route/component tests, skill rail tests, lesson route/page tests, video verification tests, the curriculum contract test, and any script-facing video verification command already present. After merge, production proof should at least run `default_ship`; billing proof should only run if release scope detects a billing-sensitive change.
