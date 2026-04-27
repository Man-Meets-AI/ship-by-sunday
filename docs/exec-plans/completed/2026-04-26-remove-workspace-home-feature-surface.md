---
title: Remove Workspace Home Feature Surface
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Delete the workspace-home feature folder by moving protected workspace home UI and model code into App Router workspace-owned folders.
post_build_recap: Workspace home UI and model ownership now live under the workspace App Router group, apps/web/features/workspace-home is deleted, and focused plus app-wide validation passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/completed/2026-04-26-remove-feature-folder-surface/planning-brief-3.md
read_when:
  - Reviewing the completed workspace-home feature-folder removal slice.
  - Checking why workspace home components live under the workspace App Router group.
  - Validating that no features/workspace-home references remain.
---

# Remove Workspace Home Feature Surface

This is a living execution plan for deleting the workspace-home feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The workspace home surface is protected workspace route UI, not a durable product domain that should live under a broad `apps/web/features` bucket. After this slice, the same workspace home components and model can still render and pass their focused tests, but their ownership is explicit under `apps/web/app/(workspace)`. Someone can see the change working by scanning for old workspace-home feature imports and by running the focused workspace home model and page tests.

## Progress

- [x] 2026-04-26 EDT: Created branch `codex/remove-workspace-home-feature-surface` from current `main` after settings production proof passed.
- [x] 2026-04-26 EDT: Created this active child ExecPlan from planning brief 3.
- [x] 2026-04-26 EDT: Moved workspace home components to `apps/web/app/(workspace)/_components/workspace-home` and moved `workspace-home-model.ts` to `apps/web/app/(workspace)/_lib`.
- [x] 2026-04-26 EDT: Deleted `apps/web/features/workspace-home`; `rg '@/features/workspace-home|features/workspace-home' apps/web` returned no matches and `find apps/web/features/workspace-home -maxdepth 3 -type f` confirmed the folder is absent.
- [x] 2026-04-26 EDT: Updated starter docs that still named the old `features/workspace-home` owner.
- [x] 2026-04-26 EDT: Focused workspace home tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, import scans, and `git diff --check` passed.

## Surprises & Discoveries

2026-04-26 EDT: The code import scan was clean after the move, but two starter docs under `apps/web/content/docs` still named `features/workspace-home` as the owner. Those docs now point to `apps/web/app/(workspace)/_components/workspace-home` and `apps/web/app/(workspace)/_lib/workspace-home-model.ts`.

## Decision Log

Decision: Move the workspace home model into `apps/web/app/(workspace)/_lib`.
Rationale: The model is only used by workspace home UI and tests today, so the workspace route group is the clearest owner.
Date: 2026-04-26

Decision: Move workspace home components into `apps/web/app/(workspace)/_components/workspace-home`.
Rationale: They are protected workspace presentation components. Keeping them together under a route-group private component folder avoids inventing a new shared domain surface.
Date: 2026-04-26

## Outcomes & Retrospective

This slice is complete. `apps/web/features/workspace-home` is deleted, workspace home components now live under `apps/web/app/(workspace)/_components/workspace-home`, the model lives at `apps/web/app/(workspace)/_lib/workspace-home-model.ts`, starter docs point at the new owner, and focused plus app-wide validation passed.

## Context and Orientation

`apps/web/features/workspace-home` currently contains five components and one model helper. `workspace-home-page.tsx` composes the page with `AppShell`, `WorkspaceHomeHero`, `WorkspaceHomeModuleList`, `WorkspaceHomeNextSteps`, and `WorkspaceHomeSetupCards`. `workspace-home-model.ts` builds the copy, module list, quick actions, next steps, and setup-card flags from `starterConfig.modules`.

The only first-party consumers found before this slice are the focused tests under `apps/web/tests/unit/workspace-home-model.test.ts` and `apps/web/tests/unit/workspace-home-page.test.tsx`. The workspace home files themselves have internal imports from `@/features/workspace-home/...`.

### In Scope

Move `apps/web/features/workspace-home/components/*` to `apps/web/app/(workspace)/_components/workspace-home/`.

Move `apps/web/features/workspace-home/lib/workspace-home-model.ts` to `apps/web/app/(workspace)/_lib/workspace-home-model.ts`.

Update first-party imports and tests, then delete `apps/web/features/workspace-home`.

### Out Of Scope

Do not move starter, starter-repo, billing, checkout, Stripe, webhook, pricing, promotion codes, environment behavior, Convex schema, generated Convex files, route behavior, AppShell, shared UI inventory, or course files in this slice.

## Plan of Work

Create the App Router private folders `apps/web/app/(workspace)/_components/workspace-home` and `apps/web/app/(workspace)/_lib` if needed. Move the workspace home component files into the private component folder and move the model helper into `_lib`.

Update component imports so files in the new component folder import sibling components with relative paths and import the model from `@/app/(workspace)/_lib/workspace-home-model`. Update `apps/web/tests/unit/workspace-home-model.test.ts` and `apps/web/tests/unit/workspace-home-page.test.tsx` to import and mock the new paths.

Run an import scan for `@/features/workspace-home` and `features/workspace-home`, confirm the old folder is absent, and then run focused tests before broader app validation.

## Milestones

The first milestone is route-group ownership. It is complete when every workspace home component and model file lives under `apps/web/app/(workspace)` and imports resolve from that new owner.

The second milestone is old-surface deletion. It is complete when `apps/web/features/workspace-home` no longer exists and scans find no `@/features/workspace-home` or `features/workspace-home` references under `apps/web`.

The third milestone is validation. It is complete when focused tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` pass.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

After moving files and updating imports, run:

    rg '@/features/workspace-home|features/workspace-home' apps/web
    find apps/web/features/workspace-home -maxdepth 3 -type f

The first scan should return no matches. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/workspace-home` to be deleted, no old workspace-home feature imports to remain, and focused tests to prove the workspace home model and page composition still render the same starter-mode structure.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-home-model.test.ts tests/unit/workspace-home-page.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-remove-workspace-home-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-26-remove-workspace-home-feature-surface.md apps/web/content/docs/how-the-starter-works.mdx apps/web/content/docs/customize-the-starter.mdx
    git diff --check

## Idempotence and Recovery

These are file moves and import updates. If a scan finds old paths, update the consumer to the new App Router private folder rather than adding compatibility re-exports. If a validation command fails, fix the directly related import, formatting, or type issue before broadening scope.

## Artifacts and Notes

Baseline import scan:

    rg '@/features/workspace-home|features/workspace-home' apps/web/app apps/web/features apps/web/tests
    apps/web/features/workspace-home/components/workspace-home-hero.tsx:16:} from "@/features/workspace-home/lib/workspace-home-model";
    apps/web/features/workspace-home/components/workspace-home-setup-cards.tsx:4:import type { WorkspaceHomeModel } from "@/features/workspace-home/lib/workspace-home-model";
    apps/web/features/workspace-home/components/workspace-home-page.tsx:2:import { WorkspaceHomeHero } from "@/features/workspace-home/components/workspace-home-hero";
    apps/web/features/workspace-home/components/workspace-home-page.tsx:3:import { WorkspaceHomeModuleList } from "@/features/workspace-home/components/workspace-home-module-list";
    apps/web/features/workspace-home/components/workspace-home-page.tsx:4:import { WorkspaceHomeNextSteps } from "@/features/workspace-home/components/workspace-home-next-steps";
    apps/web/features/workspace-home/components/workspace-home-page.tsx:5:import { WorkspaceHomeSetupCards } from "@/features/workspace-home/components/workspace-home-setup-cards";
    apps/web/features/workspace-home/components/workspace-home-page.tsx:9:} from "@/features/workspace-home/lib/workspace-home-model";
    apps/web/features/workspace-home/components/workspace-home-module-list.tsx:19:import type { WorkspaceHomeModuleState } from "@/features/workspace-home/lib/workspace-home-model";
    apps/web/features/workspace-home/components/workspace-home-next-steps.tsx:18:import type { WorkspaceHomeStep } from "@/features/workspace-home/lib/workspace-home-model";
    apps/web/tests/unit/workspace-home-model.test.ts:3:import { buildWorkspaceHomeModel } from "@/features/workspace-home/lib/workspace-home-model";
    apps/web/tests/unit/workspace-home-page.test.tsx:51:vi.mock("@/features/workspace-home/components/workspace-home-hero", () => ({
    apps/web/tests/unit/workspace-home-page.test.tsx:56: "@/features/workspace-home/components/workspace-home-module-list",
    apps/web/tests/unit/workspace-home-page.test.tsx:63: "@/features/workspace-home/components/workspace-home-next-steps",
    apps/web/tests/unit/workspace-home-page.test.tsx:74:import { WorkspaceHomePage } from "@/features/workspace-home/components/workspace-home-page";
    apps/web/tests/unit/workspace-home-page.test.tsx:75:import { buildWorkspaceHomeModel } from "@/features/workspace-home/lib/workspace-home-model";

Final import scan:

    rg '@/features/workspace-home|features/workspace-home' apps/web

The final import scan returned no matches.

## Interfaces and Dependencies

Workspace home depends on `AppShell`, `CodexConnectionCard`, `StarterRepoAccessCard`, `SettingsAccountCard`, `starterConfig`, `routeConfig`, `productConfig`, starter module selectors, Next.js `Link`, and shared UI primitives. This slice changes only file ownership and imports, not those component APIs or route behavior.
