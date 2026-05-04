---
title: 'Planning Brief 14 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 14
status: 'current'
summary: 'Fourteenth child slice should remove the workspace-shell feature folder by moving AppShell into the workspace route private component surface.'
read_when:
  - 'Writing or executing the workspace-shell feature-folder removal ExecPlan.'
  - 'Checking the workspace route chrome ownership slice.'
---

# Planning Brief 14 Feature Folder Surface

The fourteenth slice should delete `apps/web/features/workspace-shell` by moving the AppShell implementation and its private subcomponents to `apps/web/app/(workspace)/_components/app-shell`. The shell is workspace route chrome, not a durable product-domain feature. Next.js private folders are the right owner because they are explicitly non-routable and already hold workspace route UI such as workspace navigation, access-required, settings, starter-repo access, Codex connection, and workspace-home components.

Update all current AppShell consumers to import from the new workspace private owner, including codebase-flow, course mission pages, execute-ship bonus pages, workspace review, workspace home, settings, and focused tests. Remove the unused `apps/web/features/course/shared/components/app-shell` compatibility re-export folder if it only re-exports the old workspace-shell modules and has no direct consumers. Do not change AppShell props, layout classes, navigation behavior, protected workspace access, route URLs, course mission state, codebase stage behavior, checkout, billing, Stripe, Convex schema, generated Convex files, or production release proof semantics.

Focused proof should include AppShell markup tests plus the main route surfaces that consume it: workspace home, settings, codebase page, codebase review page, mission page, bonus mission page, bonus lesson page, and workspace route page tests. After merge, production proof should at least run `default_ship`; billing proof should only run if release scope detects a billing-sensitive change.
