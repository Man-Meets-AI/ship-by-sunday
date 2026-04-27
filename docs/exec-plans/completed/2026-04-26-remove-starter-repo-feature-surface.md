---
title: Remove Starter Repo Feature Surface
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Delete the starter-repo feature folder by moving GitHub username validation, access copy, and workspace access UI to explicit owners without changing access behavior.
post_build_recap: GitHub username validation now lives under apps/web/lib, starter-repo access copy under apps/web/config, and starter-repo workspace UI under the workspace App Router component tree. The old feature folder is deleted and focused tests plus app and plan validation passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/completed/2026-04-26-remove-feature-folder-surface/planning-brief-5.md
read_when:
  - Resuming the starter-repo feature-folder removal slice.
  - Checking why starter repo access UI lives under the workspace App Router group.
  - Validating that no features/starter-repo references remain.
---

# Remove Starter Repo Feature Surface

This is a living execution plan for deleting the starter-repo feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The starter-repo feature folder is no longer a durable top-level product domain. It contains a pure GitHub username validator, access-copy helpers, and protected workspace UI that is shared by settings, workspace home, and mission-adjacent surfaces. After this slice, those pieces should live in explicit owners while behavior remains unchanged: validation under `apps/web/lib`, copy under `apps/web/config`, and workspace access UI under `apps/web/app/(workspace)/_components/starter-repo-access`.

## Progress

- [x] 2026-04-26 EDT: Created branch `codex/remove-starter-repo-feature-surface` from current `main` after starter production proof passed.
- [x] 2026-04-26 EDT: Created this active child ExecPlan from planning brief 5.
- [x] 2026-04-26 EDT: Confirmed `features/starter-repo` has two components and two lib helpers with consumers in Convex, settings, workspace home, mission, course workbench, and focused tests.
- [x] 2026-04-26 EDT: Moved GitHub username validation to `apps/web/lib/github-username.ts`, access copy to `apps/web/config/starter-repo-access-copy.ts`, and access UI to `apps/web/app/(workspace)/_components/starter-repo-access`.
- [x] 2026-04-26 EDT: Deleted `apps/web/features/starter-repo`; `rg '@/features/starter-repo|features/starter-repo' apps/web` returned no matches and `find apps/web/features/starter-repo -maxdepth 3 -type f` confirmed the folder is absent.
- [x] 2026-04-26 EDT: Focused starter-repo unit tests, starter-repo integration-ui form test, app format check, app lint, and app typecheck passed.
- [x] 2026-04-26 EDT: Program lint, completed ExecPlan lint, markdown lint, and `git diff --check` passed.

## Surprises & Discoveries

2026-04-26 EDT: The focused form interaction test hit the existing local duplicate-React package layout through TanStack Form. The test now mocks TanStack Form internals while still exercising this repo's submit handler, validation, Convex mutation call, and mission toast behavior.

## Decision Log

Decision: Move `github-username.ts` to `apps/web/lib/github-username.ts`.
Rationale: It is a pure validation helper used by both Convex and React tests. `apps/web/lib` is a neutral server-safe home and avoids importing app UI from Convex.
Date: 2026-04-26

Decision: Move `starter-repo-access-copy.ts` to `apps/web/config/starter-repo-access-copy.ts`.
Rationale: It is deterministic status and copy mapping used by workspace UI and course workbench surfaces, not a standalone feature implementation.
Date: 2026-04-26

Decision: Move starter-repo access components to `apps/web/app/(workspace)/_components/starter-repo-access`.
Rationale: The card and form render protected workspace access UI shared by settings, workspace home, and mission surfaces.
Date: 2026-04-26

## Outcomes & Retrospective

This slice is complete. `apps/web/features/starter-repo` was deleted, the pure GitHub username validator now has a neutral library owner, starter-repo access copy now has a config owner, and the card/form UI now lives under the workspace App Router component tree. The focused proof covered username validation, access-card rendering, access-form submit wiring, settings/workspace-home consumers, app format/lint/typecheck, plan validation, and old-path import scans. The only implementation note is that the focused form interaction test mocks TanStack Form internals because the local package layout currently exposes duplicate React through TanStack Form; the test still exercises this repo's validation, submit handler, Convex mutation call, and mission toast behavior.

## Context and Orientation

`apps/web/features/starter-repo/lib/github-username.ts` normalizes and validates GitHub usernames. It is imported by `apps/web/convex/course/starterRepoAccess.ts`, the starter-repo access form, and the username unit test.

`apps/web/features/starter-repo/lib/starter-repo-access-copy.ts` defines starter-repo access statuses, surfaces, status labels, card copy, and template lock reasons. It is imported by the access card and several course workbench components.

`apps/web/features/starter-repo/components/starter-repo-access-card.tsx` and `starter-repo-access-form.tsx` are client components. The card is consumed by settings, workspace home, mission extras, and focused tests. The form is consumed by the card and an integration-ui test.

### In Scope

Move the GitHub username validator to `apps/web/lib/github-username.ts`.

Move access copy helpers to `apps/web/config/starter-repo-access-copy.ts`.

Move access card and form components to `apps/web/app/(workspace)/_components/starter-repo-access`.

Update first-party imports, tests, and docs or Program surfaces required by the move, then delete `apps/web/features/starter-repo`.

### Out Of Scope

Do not change billing, checkout, Stripe, webhook, pricing, promotion codes, environment behavior, Convex schema, generated Convex files, route behavior, AppShell, shared UI inventory, course workbench behavior, or starter-repo access semantics in this slice.

## Plan of Work

Create `apps/web/app/(workspace)/_components/starter-repo-access` if needed. Move the access card and form there. Move `github-username.ts` to `apps/web/lib` and `starter-repo-access-copy.ts` to `apps/web/config`.

Update imports in app routes, course workbench components, Convex `starterRepoAccess.ts`, and tests. Keep the card and form API unchanged. Delete `apps/web/features/starter-repo` after imports resolve.

Run old-path scans, focused tests, app validation, and plan validation.

## Milestones

The first milestone is neutral helper ownership. It is complete when username validation imports from `@/lib/github-username` or the Convex-safe relative equivalent, and access copy imports from `@/config/starter-repo-access-copy`.

The second milestone is workspace UI ownership. It is complete when starter-repo access UI lives under the workspace App Router group and all first-party UI consumers import the moved card or form.

The third milestone is validation. It is complete when focused tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` pass.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Run import scans after edits:

    rg '@/features/starter-repo|features/starter-repo' apps/web
    find apps/web/features/starter-repo -maxdepth 3 -type f

The first scan should return no matches. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/starter-repo` to be deleted, no old starter-repo feature imports to remain, and focused tests to prove GitHub username validation, access card rendering, and access form submission behavior still work.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/github-username.test.ts tests/unit/starter-repo-access-card.test.tsx tests/unit/settings-page.test.tsx tests/unit/workspace-home-page.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/starter-repo-access-form.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-remove-starter-repo-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-26-remove-starter-repo-feature-surface.md
    git diff --check

## Idempotence and Recovery

These are file moves and import updates. If a scan finds old paths, update the consumer to the new neutral helper, config helper, or workspace UI owner instead of adding compatibility re-exports. If Convex import validation fails, keep the validator pure and use a relative path from the Convex file to `apps/web/lib/github-username.ts`.

## Artifacts and Notes

Baseline import scan:

    rg '@/features/starter-repo|features/starter-repo|starter-repo-access|github-username|StarterRepoAccess' apps/web/app apps/web/features apps/web/convex apps/web/tests apps/web/content/docs

The scan found the Convex username validator import, settings/workspace-home/mission card consumers, course workbench access-copy consumers, focused tests, and existing `features/starter-repo` implementation files.

## Interfaces and Dependencies

Starter-repo access UI depends on Convex generated API imports, `useConvexAuth`, `useQuery`, `useMutation`, TanStack React Form, Sonner toast, `starterRepoConfig`, shared UI primitives, and the unchanged `StarterRepoAccessSurface` and `StarterRepoAccessStatus` types. This slice changes ownership and import paths only.
