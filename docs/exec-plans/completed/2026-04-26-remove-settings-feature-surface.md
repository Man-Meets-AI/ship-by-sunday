---
title: Remove Settings Feature Surface
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Delete the settings feature folder by moving settings route UI into App Router workspace-owned folders.
post_build_recap: Settings route UI now lives under App Router workspace folders, SettingsAccountCard is workspace route-group owned, and apps/web/features/settings is deleted with focused and app-wide validation passing.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-2.md
read_when:
  - Resuming the settings feature-folder removal slice.
  - Checking why SettingsAccountCard is workspace-owned during the transition.
  - Validating that no features/settings references remain.
---

# Remove Settings Feature Surface

This is a living execution plan for deleting the settings feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Settings is a protected workspace route, not a durable product domain. After this slice, `apps/web/features/settings` will be gone. Settings page components will live under `apps/web/app/(workspace)/settings/_components`, and the shared account card used by settings and workspace home will live under `apps/web/app/(workspace)/_components`. Route behavior and UI output should remain unchanged.

## Progress

- [x] 2026-04-26 EDT: Created planning brief 2 and this active child ExecPlan.
- [x] 2026-04-26 EDT: Confirmed `features/settings` has four component files and only route, workspace-home, and focused test consumers.
- [x] 2026-04-26 EDT: Moved settings route components into `apps/web/app/(workspace)/settings/_components` and `SettingsAccountCard` into `apps/web/app/(workspace)/_components/settings-account-card.tsx`.
- [x] 2026-04-26 EDT: Deleted `apps/web/features/settings`.
- [x] 2026-04-26 EDT: Import scans found no remaining `@/features/settings` or `features/settings` references under `apps/web`; `find` confirmed the old folder is absent.
- [x] 2026-04-26 EDT: Focused settings and workspace-home unit tests passed.
- [x] 2026-04-26 EDT: App format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` passed.

## Surprises & Discoveries

2026-04-26 EDT: The focused workspace-home page test tripped over the existing local duplicate-React/Radix package layout before it reached the moved account-card seam. The test now mocks the untouched workspace-home child panels and leaves setup cards plus the moved account-card import under proof.

## Decision Log

Decision: Put `SettingsAccountCard` under `apps/web/app/(workspace)/_components`.
Rationale: It is route-group UI shared by settings and workspace home during this transition. Keeping it under `settings/_components` would make workspace home import from a settings-private folder.
Date: 2026-04-26

## Outcomes & Retrospective

This slice is complete. It deleted `apps/web/features/settings` and made settings route ownership explicit under `apps/web/app/(workspace)`. `SettingsAccountCard` moved to the workspace route-group component folder because settings and workspace home both use it until workspace home moves in the next slice.

## Context and Orientation

`apps/web/features/settings/components/settings-page-shell.tsx` wraps the settings page in `AppShell` and is imported only by `apps/web/app/(workspace)/settings/page.tsx`.

`apps/web/features/settings/components/settings-page.tsx` renders Codex, optional starter repository access, and account cards.

`apps/web/features/settings/components/settings-account-card.tsx` uses Clerk client hooks and is used by settings and `apps/web/features/workspace-home/components/workspace-home-setup-cards.tsx`.

`apps/web/features/settings/components/settings-user-profile.tsx` is currently unused but belongs with the settings route if retained.

### In Scope

Move settings page route components to `apps/web/app/(workspace)/settings/_components`.

Move `SettingsAccountCard` to `apps/web/app/(workspace)/_components/settings-account-card.tsx`.

Update first-party imports and tests, then delete `apps/web/features/settings`.

### Out Of Scope

Do not move workspace home, starter, starter-repo, billing, checkout, Stripe, webhook, pricing, promotion codes, environment behavior, Convex schema, generated Convex files, route behavior, AppShell, or shared UI inventory in this slice.

## Plan of Work

Create `apps/web/app/(workspace)/settings/_components`. Move `settings-page.tsx`, `settings-page-shell.tsx`, and `settings-user-profile.tsx` there. Move `settings-account-card.tsx` to `apps/web/app/(workspace)/_components/settings-account-card.tsx`.

Update `apps/web/app/(workspace)/settings/page.tsx` to import `SettingsPageShell` from the local `_components` folder. Update settings page and workspace home imports for `SettingsAccountCard`. Update `apps/web/tests/unit/settings-page.test.tsx` and `apps/web/tests/unit/workspace-home-page.test.tsx` mocks and imports.

Delete the old `apps/web/features/settings` folder and prove there are no remaining references.

## Milestones

The first milestone is route ownership. It is complete when settings page components live under the settings App Router folder and the settings route imports them locally.

The second milestone is shared workspace account card ownership. It is complete when settings and workspace home both import `SettingsAccountCard` from the workspace route-group component folder.

The third milestone is validation. It is complete when focused tests, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` pass.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Run import scans after edits:

    rg '@/features/settings|features/settings' apps/web
    find apps/web/features/settings -maxdepth 3 -type f

The first scan should return no matches. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/settings` to be deleted, no old settings feature imports to remain, and focused tests to prove the settings page still renders Codex and account cards while workspace home still renders the account setup card.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/settings-page.test.tsx tests/unit/workspace-home-page.test.tsx
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-remove-settings-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-26-remove-settings-feature-surface.md
    git diff --check

## Idempotence and Recovery

These are file moves and import updates. If an import scan finds old paths, update the consumer instead of adding compatibility exports. If workspace home becomes awkward because it imports a workspace route-group component, leave that explicit temporary state and remove it in the next workspace-home slice.

## Artifacts and Notes

Baseline import scan:

    rg '@/features/settings|features/settings' apps/web
    apps/web/app/(workspace)/settings/page.tsx:1:import { SettingsPageShell } from "@/features/settings/components/settings-page-shell";
    apps/web/features/workspace-home/components/workspace-home-setup-cards.tsx:2:import { SettingsAccountCard } from "@/features/settings/components/settings-account-card";
    apps/web/tests/unit/workspace-home-page.test.tsx:47:vi.mock("@/features/settings/components/settings-account-card", () => ({
    apps/web/tests/unit/settings-page.test.tsx:20:vi.mock("@/features/settings/components/settings-account-card", () => ({
    apps/web/tests/unit/settings-page.test.tsx:28:import { SettingsPage } from "@/features/settings/components/settings-page";

## Interfaces and Dependencies

Settings route components depend on `AppShell`, `CodexConnectionCard`, `StarterRepoAccessCard`, starter module selectors, Clerk client hooks, and shared UI primitives. This slice changes only file ownership and imports, not those component APIs.
