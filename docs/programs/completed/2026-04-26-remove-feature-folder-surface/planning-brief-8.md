---
title: 'Planning Brief 8 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 8
status: 'current'
summary: 'Eighth child slice should remove the docs feature folder by moving docs chrome, metadata, page-path helpers, and styles under the docs App Router route.'
read_when:
  - 'Writing or executing the docs feature-folder removal ExecPlan.'
  - 'Checking the next docs route ownership slice.'
---

# Planning Brief 8 Feature Folder Surface

The eighth slice should delete `apps/web/features/docs` only if it can do so without changing public docs routes, Nextra rendering, docs metadata, disabled-docs behavior, or docs theme persistence. Move docs chrome components to `apps/web/app/docs/_components`, move metadata/theme/page-path helpers to `apps/web/app/docs/_lib`, and move docs CSS to `apps/web/app/docs/_styles`.

Preserve generated/source docs boundaries, public `/docs` and `/docs/[[...mdxPath]]` behavior, Nextra page-map usage, route metadata behavior, and starter docs disabled-state behavior. Do not change billing, checkout, Stripe, Convex schema, generated Convex files, AppShell, protected workspace routes, or shared UI inventory. The focused proof should cover docs metadata helpers, docs disabled-state tests, old-path scans, app lint/typecheck, and Program/ExecPlan validation.
