---
title: 'Planning Brief 2 Feature Folder Surface'
program_id: 'remove-feature-folder-surface'
brief_version: 2
status: 'current'
summary: 'Second child slice removes the settings feature folder by moving settings route UI into App Router workspace folders.'
read_when:
  - 'Writing or executing the settings feature-folder removal ExecPlan.'
  - 'Checking why the settings account card moves to workspace route-group ownership.'
---

# Planning Brief 2 Feature Folder Surface

The second slice should delete `apps/web/features/settings`. Move settings route page components into `apps/web/app/(workspace)/settings/_components`. Move `SettingsAccountCard` into a shared workspace route-group component at `apps/web/app/(workspace)/_components/settings-account-card.tsx`, because both the settings route and workspace home use it until workspace home moves in the next slice.

Update `apps/web/app/(workspace)/settings/page.tsx`, `apps/web/features/workspace-home/components/workspace-home-setup-cards.tsx`, and focused settings/workspace-home tests. Do not move workspace home, starter, starter-repo, billing, checkout, Stripe, Convex schema, generated Convex files, route behavior, AppShell, or shared UI inventory in this slice.

Focused proof should include `bun run --cwd apps/web test:unit -- tests/unit/settings-page.test.tsx tests/unit/workspace-home-page.test.tsx`, import scans proving no `features/settings` references remain, then app lint/typecheck and the Program/ExecPlan markdown checks.
