---
title: 'Dependency Graph Feature Folder Surface'
summary: 'Dependency order for deleting remaining feature-folder surfaces without changing behavior.'
docType: 'dependency_graph'
status: 'active'
read_when:
  - 'Selecting the next child ExecPlan.'
  - 'Checking why billing, Convex, and course work are not first.'
---

# Dependency Graph Feature Folder Surface

The generic and metadata helper slice has no dependency on later slices. It depends only on focused unit tests for `useAutosave` and public metadata routes.

The settings route slice depends on the current App Router private folder shape under `apps/web/app/(workspace)/settings` and can follow the generic slice.

The workspace home slice depends on settings account-card placement because workspace home currently imports `SettingsAccountCard`.

The starter and starter-repo slices depend on workspace home and settings decisions because their components are used there, but they also cross into docs, Convex, course workbench, and checkout success. They require a more careful split.

Course, checkout, product-access, observability, Codex, docs, blog, and marketing folders should not be collapsed into one migration. They have route, server, release, or product-domain behavior that needs dedicated proof.
