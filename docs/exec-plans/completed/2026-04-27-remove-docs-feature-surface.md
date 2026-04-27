---
title: Remove Docs Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Delete the docs feature folder by moving docs route chrome, metadata helpers, page-path helpers, theme helpers, and styles into docs App Router private folders without changing docs behavior.
post_build_recap: Docs route chrome, helpers, and styles now live under app/docs private folders, and the old docs feature folder is deleted. Focused docs tests, app format/lint/typecheck, Program/ExecPlan lint, markdown lint, and diff checks passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-8.md
read_when:
  - Resuming the docs feature-folder removal slice.
  - Checking why docs chrome and helpers live under app/docs private folders.
  - Validating that no features/docs references remain.
---

# Remove Docs Feature Surface

This is a living execution plan for deleting the docs feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The docs code is owned by the public `/docs` App Router route, not a standalone feature. After this slice, docs chrome components, metadata helpers, page-path helpers, theme helpers, and CSS should live beside the docs route in private folders. The visible behavior should be unchanged: `/docs` and nested docs pages render through Nextra, metadata remains canonical, docs disabled-state behavior still works, and theme persistence still uses the same local storage key and cookie.

## Progress

- [x] 2026-04-27 EDT: Created branch `codex/remove-docs-feature-surface` from `main` at `37da0b5`.
- [x] 2026-04-27 EDT: Confirmed `features/docs` contains three route chrome components, two docs helper files, one Nextra page-path helper, and one docs stylesheet consumed only by `app/docs` and docs tests.
- [x] 2026-04-27 EDT: Created planning brief 8 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved docs components to `apps/web/app/docs/_components`, docs helpers to `apps/web/app/docs/_lib`, and docs CSS to `apps/web/app/docs/_styles`.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/docs`; `rg '@/features/docs|features/docs' apps/web` returned no matches and `find apps/web/features/docs -maxdepth 3 -type f` confirmed the folder is absent.
- [x] 2026-04-27 EDT: Focused docs metadata and disabled-state tests passed, followed by app format check, app lint, app typecheck, completed ExecPlan lint, Program lint, markdown lint, and `git diff --check`.

## Surprises & Discoveries

No surprises yet.

## Decision Log

Decision: Move docs chrome components to `apps/web/app/docs/_components`.
Rationale: The navbar, footer, and theme toggle are route chrome for the public docs app and should sit beside the existing docs disabled-state component.
Date: 2026-04-27

Decision: Move docs helpers and stylesheet to docs App Router private folders.
Rationale: Metadata, theme preference, page-path, and style files are route-local support code for `app/docs`; `_lib` and `_styles` keep them non-routable and explicitly docs-owned.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. `apps/web/features/docs` was deleted, docs route chrome now lives under `apps/web/app/docs/_components`, docs helpers now live under `apps/web/app/docs/_lib`, and docs CSS now lives under `apps/web/app/docs/_styles`. The focused proof covered docs metadata helpers, docs disabled-state behavior, app lint/typecheck, Nextra docs static generation during build, plan validation, and old-path import scans. Public docs routes, docs content, Nextra rendering, and generated/source docs boundaries were intentionally unchanged.

## Context and Orientation

`apps/web/app/docs/layout.tsx` imports docs metadata defaults, the docs theme storage key, docs navbar/footer components, Nextra theme CSS, and the custom docs CSS. `apps/web/app/docs/[[...mdxPath]]/page.tsx` imports docs metadata and page-path helpers to generate static params, metadata, and Nextra content.

`apps/web/features/docs/components/docs-navbar.tsx`, `docs-footer.tsx`, and `docs-theme-toggle.tsx` render docs route chrome. `apps/web/features/docs/lib/docs-metadata.ts` builds canonical and social metadata. `apps/web/features/docs/lib/theme-preferences.ts` owns the docs theme local storage key and cookie. `apps/web/features/docs/server/page-paths.ts` maps Nextra page params to `/docs` paths and content source files. `apps/web/features/docs/styles/docs-theme.css` styles Nextra docs chrome with the product theme variables.

### In Scope

Move docs components to `apps/web/app/docs/_components`.

Move docs metadata, theme, and page-path helpers to `apps/web/app/docs/_lib`.

Move docs CSS to `apps/web/app/docs/_styles`.

Update first-party imports in docs routes and tests, then delete `apps/web/features/docs`.

### Out Of Scope

Do not change public docs routes, Nextra rendering, docs content, generated/source docs boundaries, docs disabled-state behavior, billing, checkout, Stripe, Convex schema, generated Convex files, AppShell, protected workspace routes, or shared UI inventory in this slice.

## Plan of Work

Create `apps/web/app/docs/_lib` and `apps/web/app/docs/_styles` if needed. Move docs navbar, footer, and theme toggle into the existing docs route component folder. Move docs metadata, theme preferences, and page paths into the docs route library folder. Move docs CSS into the docs route styles folder.

Update imports in `apps/web/app/docs/layout.tsx`, `apps/web/app/docs/[[...mdxPath]]/page.tsx`, moved docs components, and docs tests. Delete `apps/web/features/docs` after all imports resolve.

Run old-path scans, focused docs tests, app validation, and plan validation.

## Milestones

The first milestone is docs route ownership. It is complete when docs chrome, helpers, and CSS are all under `apps/web/app/docs` private folders and route files import those owners.

The second milestone is feature-folder deletion. It is complete when `apps/web/features/docs` is absent and no `@/features/docs` imports remain in `apps/web`.

The third milestone is validation. It is complete when focused docs tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` pass.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Run import scans after edits:

    rg '@/features/docs|features/docs' apps/web
    find apps/web/features/docs -maxdepth 3 -type f

The first scan should return no matches. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/docs` to be deleted, no old docs feature imports to remain, docs metadata helpers and disabled-state tests to pass, and app typecheck/build to prove Nextra docs routes still compile and statically generate.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/docs-metadata.test.ts tests/unit/docs-disabled-state.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-docs-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-docs-feature-surface.md
    git diff --check

## Idempotence and Recovery

These are file moves and import updates. If a scan finds old paths, update the consumer to the moved docs route component, helper, or style owner instead of adding compatibility re-exports. If Nextra route generation fails, keep the page-path helper route-local and preserve its `content/docs` source-root calculation relative to the new file path.

## Artifacts and Notes

Baseline import scan:

    rg '@/features/docs|features/docs|docs-metadata|page-paths|DOCS_THEME_STORAGE_KEY|docs-theme.css' apps/web/app apps/web/features apps/web/tests

The scan found imports only in docs route files, docs feature implementation files, and the docs metadata unit test.

## Interfaces and Dependencies

Docs route ownership depends on Next.js App Router private folders, Nextra `Layout`, `Navbar`, `Footer`, `importPage`, `getPageMap`, and `generateStaticParamsFor`, docs content under `apps/web/content/docs`, docs disabled-state UI under `apps/web/app/docs/_components/docs-module-disabled-state.tsx`, and starter docs display config in `apps/web/config/starter-selectors.ts`.
