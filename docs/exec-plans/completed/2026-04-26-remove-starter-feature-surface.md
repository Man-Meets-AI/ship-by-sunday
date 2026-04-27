---
title: Remove Starter Feature Surface
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Delete the starter feature folder by moving module selector helpers to config ownership and docs disabled-state UI to the docs App Router owner.
post_build_recap: Starter selector helpers now live under config, docs disabled-state UI lives under the docs App Router owner, apps/web/features/starter is deleted, and focused plus app-wide validation passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-4.md
read_when:
  - Reviewing the completed starter feature-folder removal slice.
  - Checking why starter selectors live under config.
  - Validating that no features/starter references remain.
---

# Remove Starter Feature Surface

This is a living execution plan for deleting the starter feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The starter module flags are configuration helpers, and the docs disabled-state UI is owned by the docs route. Keeping them under `apps/web/features/starter` makes the app look like it has a starter product domain when this folder only holds cross-cutting config selectors and a route-local disabled screen. After this slice, selectors should import from `apps/web/config/starter-selectors.ts`, docs disabled UI should live under `apps/web/app/docs/_components`, and `apps/web/features/starter` should be gone.

## Progress

- [x] 2026-04-26 EDT: Created branch `codex/remove-starter-feature-surface` from current `main` after workspace-home production proof passed.
- [x] 2026-04-26 EDT: Created this active child ExecPlan from planning brief 4.
- [x] 2026-04-26 EDT: Confirmed `CourseModuleDisabledState` has no first-party consumers outside its own file.
- [x] 2026-04-26 EDT: Moved starter selector helpers to `apps/web/config/starter-selectors.ts` and moved docs disabled-state UI to `apps/web/app/docs/_components`.
- [x] 2026-04-26 EDT: Deleted `apps/web/features/starter`; `rg '@/features/starter/|features/starter/' apps/web` returned no matches and `find apps/web/features/starter -maxdepth 3 -type f` confirmed the folder is absent.
- [x] 2026-04-26 EDT: Focused starter selector and docs disabled-state unit tests passed, along with app format check, app lint, and app typecheck.
- [x] 2026-04-26 EDT: Plan lint, Program lint, markdown lint, and `git diff --check` passed.

## Surprises & Discoveries

2026-04-26 EDT: The broad text scan `features/starter` also matches the preserved `features/starter-repo` folder. Final proof uses the precise pattern `@/features/starter/|features/starter/` so starter-repo references remain visible and intentionally untouched.

## Decision Log

Decision: Move `starter-selectors.ts` to `apps/web/config/starter-selectors.ts`.
Rationale: It derives display and module-state helpers from `apps/web/config/product.ts`, and consumers span app routes and multiple feature folders.
Date: 2026-04-26

Decision: Move docs disabled-state UI into `apps/web/app/docs/_components`.
Rationale: The only live disabled-state UI consumer is the docs route. The screen is route-local fallback UI, not a reusable starter domain.
Date: 2026-04-26

## Outcomes & Retrospective

This slice is complete. `apps/web/features/starter` is deleted, selector helpers now live at `apps/web/config/starter-selectors.ts`, docs disabled-state UI now lives under `apps/web/app/docs/_components`, the unused course disabled-state component is gone, and focused plus app-wide validation passed.

## Context and Orientation

`apps/web/features/starter/lib/starter-selectors.ts` exports `StarterModuleName`, `isStarterModuleEnabled`, and display config objects derived from `productConfig`, `routeConfig`, and `starterConfig`.

`apps/web/features/starter/components/docs-module-disabled-state.tsx` renders the public docs disabled fallback and is imported by `apps/web/app/docs/layout.tsx` and `apps/web/app/docs/[[...mdxPath]]/page.tsx`.

`apps/web/features/starter/components/starter-module-disabled-card.tsx` is only used by the docs disabled-state component and the unused course disabled-state component. `apps/web/features/starter/components/course-module-disabled-state.tsx` has no consumers in the first-party scan.

### In Scope

Move `apps/web/features/starter/lib/starter-selectors.ts` to `apps/web/config/starter-selectors.ts`.

Move `apps/web/features/starter/components/docs-module-disabled-state.tsx` and the disabled-card helper it needs to `apps/web/app/docs/_components`.

Delete `course-module-disabled-state.tsx` if the consumer scan still confirms it is unused, then delete `apps/web/features/starter`.

Update imports and docs that name the old starter feature owner.

### Out Of Scope

Do not move starter-repo, billing, checkout, Stripe, webhook, pricing, promotion codes, environment behavior, Convex schema, generated Convex files, route behavior, AppShell, shared UI inventory, course workbench behavior, or feature folders unrelated to `features/starter` in this slice.

## Plan of Work

Create `apps/web/app/docs/_components` if needed. Move the docs disabled-state component and its disabled-card helper there. Move `starter-selectors.ts` into `apps/web/config`.

Update imports from `@/features/starter/lib/starter-selectors` to `@/config/starter-selectors`. Update docs route imports for `DocsModuleDisabledState` to the new docs private component path. Update the starter selector unit test and starter docs references.

Delete `apps/web/features/starter`, run an import scan for old starter feature paths, then run focused tests before broader validation.

## Milestones

The first milestone is config ownership. It is complete when all selector and display-config consumers import from `@/config/starter-selectors`.

The second milestone is docs route ownership. It is complete when docs disabled-state UI lives under `apps/web/app/docs/_components` and the old starter component folder is gone.

The third milestone is validation. It is complete when focused tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` pass.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Run import scans after edits:

    rg '@/features/starter/|features/starter/' apps/web
    find apps/web/features/starter -maxdepth 3 -type f

The first scan should return no matches. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/starter` to be deleted, no old starter feature imports to remain, and focused tests to prove starter module selection and docs disabled-state rendering still work.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/starter-selectors.test.ts tests/unit/docs-disabled-state.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-remove-starter-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-26-remove-starter-feature-surface.md apps/web/content/docs/how-the-starter-works.mdx
    git diff --check

## Idempotence and Recovery

These are file moves and import updates. If a scan finds old paths, update the consumer to the new config or docs private owner instead of adding compatibility re-exports. If the docs disabled-state focused test exposes a missing unit test, add the smallest route-owned test for the moved component.

## Artifacts and Notes

Baseline import scan:

    rg '@/features/starter/|features/starter/' apps/web

The scan found selector consumers across app routes and feature folders, docs disabled-state consumers under `apps/web/app/docs`, the unused course disabled-state component, and one starter docs reference to `features/starter/`. The scan intentionally uses a trailing slash so it does not match preserved `features/starter-repo` imports.

Final import scan:

    rg '@/features/starter/|features/starter/' apps/web

The final import scan returned no matches.

## Interfaces and Dependencies

Starter selectors depend on `productConfig`, `routeConfig`, and `starterConfig`. Docs disabled-state UI depends on `routeConfig`, shared UI primitives, and Next.js `Link`. This slice changes file ownership and imports, not config semantics, docs routing behavior, or paid-access behavior.
