---
title: Remove Blog Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Delete the blog feature folder by moving public blog route UI, content constants, metadata helpers, and server content loaders into explicit App Router private owners without changing public blog behavior.
post_build_recap: Public blog UI, content constants, helper modules, and Nextra content loaders now live under app/blog private folders, the old blog feature folder is deleted, and focused blog tests plus app format/lint/typecheck and plan validation passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-11.md
read_when:
  - Resuming the blog feature-folder removal slice.
  - Checking why blog code lives under app/blog private folders.
  - Validating that no features/blog references remain.
---

# Remove Blog Feature Surface

This is a living execution plan for deleting the blog feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The public blog is owned by the `/blog` App Router segment, not by a broad feature bucket. After this slice, the blog index, blog article shell, MDX-only split components, content constants, metadata helpers, structured-data helpers, and Nextra-backed content loader should live under `apps/web/app/blog` private folders. The public behavior must not change: `/blog` still renders the index, `/blog/the-operating-system-beats-the-prompt` still renders the published article, unknown blog slugs still 404 through the existing optional catch-all route behavior, metadata and JSON-LD stay equivalent, and the app build still prerenders the same blog paths.

## Progress

- [x] 2026-04-27 EDT: Created branch `codex/remove-blog-feature-surface` from verified `main` at `81d1ead`.
- [x] 2026-04-27 EDT: Confirmed `features/blog` contains eighteen files: eleven route UI components, one blog content constant file, three pure helper files, one table-of-contents helper, and two server content/path files.
- [x] 2026-04-27 EDT: Read the repo Program and ExecPlan contracts, `apps/web/AGENTS.md`, `docs/release-workflow.md`, and local Next 16.2.0 docs for App Router project structure, dynamic route segments, `generateStaticParams`, metadata, and MDX dynamic imports. The app-local `apps/web/node_modules/next/dist/docs` path is absent because Next is hoisted at the repo root, so the equivalent docs were read from `node_modules/next/dist/docs`.
- [x] 2026-04-27 EDT: Created planning brief 11 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved blog route UI to `apps/web/app/blog/_components`, blog copy constants to `apps/web/app/blog/_content`, pure blog helpers to `apps/web/app/blog/_lib`, and Nextra content loading/path helpers to `apps/web/app/blog/_server`.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/blog`; old-path import scans returned no app or script matches.
- [x] 2026-04-27 EDT: Focused blog and public metadata unit tests passed: 5 files and 11 tests.
- [x] 2026-04-27 EDT: App format check, app lint, and app typecheck passed. The typecheck build output still prerenders `/blog` and `/blog/the-operating-system-beats-the-prompt`.
- [x] 2026-04-27 EDT: ExecPlan lint, Program lint, markdown lint, Convex schema/generated diff check, and `git diff --check` passed.

## Surprises & Discoveries

`apps/web/node_modules/next/dist/docs` does not exist in this hoisted Bun install. The Next 16.2.0 package is at `node_modules/next`, and the relevant docs are available under `node_modules/next/dist/docs`. The guidance still applies: private folders under `app` are not routeable, `[[...slug]]` optional catch-all routes include `/blog`, `params` is a promise, `generateStaticParams` supplies prerendered dynamic routes, and dynamic MDX imports should keep the `.mdx` extension.

The current blog route uses `export const dynamicParams = false` with an optional catch-all route. This slice must preserve `generateStaticParams()` returning the index entry plus published post slugs so unspecified blog slugs keep returning 404.

## Decision Log

Decision: Move all blog-specific route UI to `apps/web/app/blog/_components`.
Rationale: The components render only the public blog route and MDX blog articles, and Next private folders make route ownership explicit without adding URL segments.
Date: 2026-04-27

Decision: Move blog copy constants to `apps/web/app/blog/_content`.
Rationale: These constants are editorial route content, not a shared product-domain module. Keeping them under the blog segment mirrors the existing docs route private ownership pattern.
Date: 2026-04-27

Decision: Move blog pure helpers and server content loaders to `apps/web/app/blog/_lib` and `apps/web/app/blog/_server`.
Rationale: Metadata, structured data, date formatting, table-of-contents normalization, and path helpers belong to the blog route owner. The Nextra content loader must remain server-only because it imports MDX page modules and validates frontmatter on the server.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. `apps/web/features/blog` was deleted. Public blog UI now lives under `apps/web/app/blog/_components`, blog copy constants live under `apps/web/app/blog/_content`, route helper modules live under `apps/web/app/blog/_lib`, and Nextra content loading plus page-path discovery live under `apps/web/app/blog/_server`. The public `/blog` route, article route, metadata helpers, structured data, MDX imports, and static build output were intentionally unchanged.

## Context and Orientation

`apps/web/app/blog/layout.tsx` exports the blog metadata defaults and wraps the `/blog` route. `apps/web/app/blog/[[...slug]]/page.tsx` owns the optional catch-all page for both `/blog` and article pages such as `/blog/the-operating-system-beats-the-prompt`. It uses `generateStaticParams()` to prerender the blog index and published blog posts, `generateMetadata()` to emit index or article metadata, and `notFound()` for missing or draft posts.

`apps/web/app/blog/_components` contains route UI for the index, article shell, article metadata, table of contents, JSON-LD script injection, rich text wrapping, and MDX-only split media sections. The MDX article at `apps/web/content/blog/the-operating-system-beats-the-prompt.mdx` imports `BlogSplitHero` and `BlogSplitSection` from this folder.

`apps/web/app/blog/_content/blog.ts` contains blog index and promo copy derived from marketing homepage content and starter display config. `apps/web/app/blog/_lib` contains date formatting, metadata construction, structured-data serialization, and table-of-contents normalization. `apps/web/app/blog/_server/blog-posts.ts` starts with `import "server-only"` and loads Nextra page modules. `apps/web/app/blog/_server/page-paths.ts` discovers blog static params from Nextra and computes public paths and source file paths.

### In Scope

Move `apps/web/features/blog/components` to `apps/web/app/blog/_components`.

Move `apps/web/features/blog/content/blog.ts` to `apps/web/app/blog/_content/blog.ts`.

Move `apps/web/features/blog/lib` to `apps/web/app/blog/_lib`, and move `apps/web/features/blog/server` to `apps/web/app/blog/_server` while preserving the existing server-only guard on `blog-posts.ts`.

Update app route imports, MDX imports, docs references, tests, and coverage config away from `@/features/blog`, then delete `apps/web/features/blog`.

### Out Of Scope

Do not change blog public URLs, route params, metadata content, structured-data schemas, MDX frontmatter, Nextra content discovery behavior, marketing content, homepage CTA behavior, checkout, Stripe, pricing, promotion-code behavior, environment behavior, Convex schema, generated Convex files, AppShell, or production release proof semantics.

Do not move or delete `apps/web/features/marketing` in this slice, even though the blog promo still consumes marketing homepage content and CTA UI. That dependency belongs to a later marketing slice.

## Plan of Work

Create private folders under `apps/web/app/blog`: `_components`, `_content`, `_lib`, and `_server`. Move the blog UI files into `_components`, the blog copy file into `_content`, helper files into `_lib`, and server content/path files into `_server`.

Update imports inside the moved files first so blog internals point at `@/app/blog/_components`, `@/app/blog/_content`, `@/app/blog/_lib`, and `@/app/blog/_server`. Preserve the existing external imports from product config, shared UI, marketing content, marketing CTA, Nextra, and platform metadata helpers.

Update `apps/web/app/blog/layout.tsx`, `apps/web/app/blog/[[...slug]]/page.tsx`, the MDX post imports, focused blog tests, public metadata tests if needed, docs text in `apps/web/content/docs/customize-the-starter.mdx`, and `apps/web/vitest.config.ts` coverage includes away from the old blog feature folder.

Delete `apps/web/features/blog`, run the old-path scans, then run focused tests followed by app and Program validation.

## Milestones

The first milestone is route-private ownership. It is complete when all blog components, content constants, helper modules, and server loaders live under `apps/web/app/blog` private folders, with `blog-posts.ts` still guarded by `import "server-only"`.

The second milestone is import and docs cleanup. It is complete when the app route, MDX article, tests, docs, and coverage config no longer reference `@/features/blog` or `features/blog`.

The third milestone is feature-folder deletion. It is complete when `apps/web/features/blog` is absent and import scans return no old blog feature references under app code or scripts.

The fourth milestone is validation. It is complete when focused blog tests pass, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` all pass.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

After edits, run import scans:

    rg '@/features/blog|features/blog|\\.\\./features/blog|\\.\\./\\.\\./features/blog' apps/web scripts
    find apps/web/features/blog -maxdepth 4 -type f

The first scan should return no app or script matches. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/blog` to be deleted, all old blog feature imports to be gone, `blog-posts.ts` to keep its `server-only` guard, public blog docs to name the new App Router private owner, and focused tests to prove blog path generation, date formatting, metadata, structured data, and sitemap/public metadata still behave the same. App typecheck must still build the public blog routes.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/blog-page-paths.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-formatters.test.ts tests/unit/blog-structured-data.test.ts tests/unit/public-metadata-routes.test.ts
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-blog-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-blog-feature-surface.md
    git diff --check

After this PR merges, inspect the `Production Release Proof` run for the merged `main` commit and confirm `default_ship` and `release_gate` pass. `billing_integration` is not expected unless release scope marks the slice billing-sensitive through changed checkout, Stripe, entitlement, webhook, or access-handoff paths.

## Idempotence and Recovery

These are file moves and import updates. If a scan finds old paths, update the consumer to the new App Router private owner instead of adding compatibility re-exports. If MDX import resolution fails, keep the `.mdx` content file in `apps/web/content/blog` and update only its component import specifiers to `@/app/blog/_components/...`.

If typecheck or build fails in the blog route, compare `generateStaticParams()`, `dynamicParams`, `normalizeBlogSlug()`, and `getPublishedBlogPostBySlug()` behavior to the pre-move tests before changing route logic. If structured-data tests fail, verify the output changed only because of import movement; do not alter schema semantics in this slice.

## Artifacts and Notes

Initial import scan:

    rg '@/features/blog|features/blog|\.\./features/blog|\.\./\.\./features/blog' apps/web scripts

The scan shows consumers in `apps/web/app/blog`, the MDX blog article, focused blog tests, docs text, and internal blog modules. Those should all move to `@/app/blog/...` or updated docs wording.

The final scan returns no app or script matches. `find apps/web/features/blog -maxdepth 4 -type f` fails with `No such file or directory`. `git diff --name-only -- apps/web/convex/schema.ts apps/web/convex/_generated` returns no matches.

## Interfaces and Dependencies

The blog route depends on Next.js App Router private-folder conventions, optional catch-all dynamic segments, `generateStaticParams()`, `generateMetadata()`, MDX dynamic imports, Nextra `importPage` and `generateStaticParamsFor`, shared product config, starter blog display config, marketing homepage content and CTA UI, `apps/web/platform/next/metadata-base.ts`, public metadata route generation, and production release proof for the merged `main` commit.
