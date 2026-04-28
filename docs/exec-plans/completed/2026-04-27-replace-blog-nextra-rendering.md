---
title: Replace Blog Nextra Rendering
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Replace blog Nextra imports for route discovery, MDX loading, metadata, and TOC data while preserving blog URLs and structured data.
post_build_recap: Replaced blog Nextra `importPage` and `Heading` usage with an app-owned direct MDX loader, inventory-backed summaries, inventory-backed TOC data, and focused browser/test proof.
program_id: remove-nextra-docs-runtime
planning_brief: docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-1.md
read_when:
  - Replacing blog Nextra imports.
  - Updating blog MDX loading, frontmatter validation, or TOC behavior.
  - Preparing for Nextra package removal.
---

# Replace Blog Nextra Rendering

This document is a living execution plan for removing Nextra from the blog runtime path.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

This slice removes the blog's dependency on Nextra while preserving `/blog`, the current article route, blog metadata, structured data, draft filtering, and the article table of contents. It matters because the app cannot remove `nextra` from packages while blog server modules still import `nextra/pages` and the `nextra` `Heading` type.

After this slice, blog pages should render from app-owned content loading and MDX rendering code. Users should see the same blog index and article content, including current MDX components.

## Progress

- [x] 2026-04-27 EDT: Program research confirmed blog imports from Nextra.
- [x] 2026-04-27 EDT: This ExecPlan was created from `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-1.md`.
- [x] 2026-04-27 EDT: Inventory dependency landed in `docs/exec-plans/completed/2026-04-27-build-docs-blog-content-inventory-and-route-model.md`; `apps/web/app/blog/_server/page-paths.ts` already uses the inventory for static params.
- [x] 2026-04-27 EDT: Docs rendering replacement landed in `docs/exec-plans/completed/2026-04-27-replace-docs-nextra-rendering.md`; `apps/web/mdx-components.tsx` is now repo-owned and no longer imports Nextra.
- [x] 2026-04-27 EDT: Grilled against `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-3.md`; the plan now names the direct blog MDX loader, inventory-backed summary/TOC path, and no-package-change boundary explicitly.
- [x] 2026-04-27 EDT: Added `apps/web/app/blog/_server/blog-content.ts` as the direct blog MDX loader and updated `apps/web/app/blog/_server/blog-posts.ts` to build summaries, article records, and TOC data from the shared inventory.
- [x] 2026-04-27 EDT: Replaced the `nextra` `Heading` type in `apps/web/app/blog/_lib/blog-toc.ts` with `PublicContentHeading`.
- [x] 2026-04-27 EDT: Applied a minimal MDX syntax correction in the current blog article so direct MDX rendering does not create nested paragraph hydration errors; no copy changed.
- [x] 2026-04-27 EDT: Focused blog tests, import scan, lint, typecheck/build, and desktop/mobile browser smoke passed for `/blog` and `/blog/the-operating-system-beats-the-prompt`.

## Surprises & Discoveries

The current blog article imports `BlogSplitHero` and `BlogSplitSection` directly inside MDX. This means blog cannot safely move to plain markdown without rewriting content or preserving an MDX-capable rendering path.

`apps/web/app/blog/_server/blog-posts.ts` currently depends on Nextra's imported page object for metadata, reading time, TOC, and default content. The replacement must account for each of those outputs.

The current rendered blog article does not show a read-time row, so preserving the visible contract does not require recreating Nextra's `metadata.readingTime` output in this slice. If a future direct-reading-time feature is desired, it should be added deliberately rather than smuggled into Nextra removal.

## Decision Log

Decision: Blog replacement is required for the Program, not optional hardening. Rationale: direct blog Nextra imports would keep the dependency alive. Date: 2026-04-27.

Decision: Preserve MDX imports in blog content. Rationale: changing the article authoring model would widen scope and rewrite content copy. Date: 2026-04-27.

Decision: Keep blog validation focused on public behavior and structured data. Rationale: blog is public content, and metadata drift is a release-sensitive regression. Date: 2026-04-27.

Decision: Use a static blog content loader module that maps each known published-or-draft blog slug to a direct dynamic import of its `.mdx` file, then pair the loaded component with the inventory entry for frontmatter, source path, draft filtering, and headings. Rationale: the current blog corpus uses MDX component imports, and an explicit registry keeps bundling analyzable without package changes in this slice. Date: 2026-04-27.

Decision: Treat `apps/web/app/_content/public-content-inventory.ts` as the frontmatter validation boundary for blog summaries in this slice instead of keeping a second Zod parser in `blog-posts.ts`. Rationale: the inventory already validates the same scalar fields, date, draft flag, hero media kind, and video poster requirement; duplicating validation would create drift while removing Nextra. Date: 2026-04-27.

## Outcomes & Retrospective

This plan replaced blog runtime loading with a repo-owned direct-MDX path. `apps/web/app/blog/_server/blog-content.ts` maps known blog slug keys to explicit dynamic MDX imports, while `apps/web/app/blog/_server/blog-posts.ts` now uses `getPublishedBlogContentEntries()` and `getBlogContentPage()` for summaries, article records, draft filtering, source paths, hero metadata, and content components.

Visible read-time behavior remained absent, matching the current rendered article. TOC behavior is preserved through inventory headings, and the current article still renders its explicit `BlogSplitHero` and `BlogSplitSection` MDX imports.

The only content edit was a syntax-only MDX correction inside the current article's `BlogSplitSection` children: explicit nested `<p>` JSX wrappers were replaced with equivalent markdown paragraphs so direct MDX rendering produces valid HTML and avoids hydration errors. Article copy did not change.

Browser smoke proved `/blog` and `/blog/the-operating-system-beats-the-prompt` at desktop and mobile sizes. The smoke checked page titles, H1 text, expected body content, article contents rail visibility, and article layout content.

## Context and Orientation

The blog route page is `apps/web/app/blog/[[...slug]]/page.tsx`. It uses server helpers from `apps/web/app/blog/_server/blog-posts.ts` and `apps/web/app/blog/_server/page-paths.ts`. `blog-posts.ts` imports MDX content through `nextra/pages`, validates metadata with Zod, exposes published summaries, and returns the default MDX content component. `page-paths.ts` already uses the shared inventory for `generateBlogStaticParams`.

The blog TOC helper in `apps/web/app/blog/_lib/blog-toc.ts` imports the `Heading` type from `nextra`. The replacement should use an app-owned heading type shared with the inventory.

Blog UI components and tests already define expected output. Existing tests include blog metadata, structured data, formatters, and page path behavior.

### In Scope

This slice owns blog route params, blog MDX import/render behavior, blog frontmatter validation, published and draft filtering, metadata output, structured data behavior, TOC extraction and typing, blog tests, and browser smoke for `/blog` plus the current article route.

### Out Of Scope

Do not change docs rendering, remove packages, remove Nextra config, update starter assumptions, rewrite blog copy, change blog public URLs, touch Stripe, checkout, billing, Convex files, compiler schema, or environment behavior.

Do not remove `nextra` or `nextra-theme-docs` in this slice. That belongs to the package cleanup slice after docs and blog imports are gone.

## Plan of Work

Begin by reading the inventory API from the first slice and the current blog server modules. Confirm the current published article slug and frontmatter fields.

Keep `generateBlogStaticParams` on the inventory route model. Preserve `dynamicParams = false` unless implementation proves the route model requires a different setting and the change is justified in this ExecPlan.

Add an app-owned blog content loader that maps inventory slug keys to direct dynamic imports of the matching blog `.mdx` files. Replace `importPage` in `blog-posts.ts` with that loader plus inventory entries. Preserve the existing public object shape returned to `apps/web/app/blog/[[...slug]]/page.tsx` as much as possible so UI churn stays small.

Replace the Nextra `Heading` type with an app-owned TOC item or heading type from the inventory. Since the replacement source is inventory headings, `normalizeBlogToc` should accept `PublicContentHeading[]` and map `text` to the visible label.

## Milestones

Milestone 1 verifies blog static params already use the inventory route model. Success means blog page path tests pass without mocking `nextra/pages`.

Milestone 2 replaces blog content import and metadata extraction with an inventory-backed direct-MDX loader. Success means the blog index and article can render the same title, description, summary, author, dates, hero data, and MDX components without Nextra.

Milestone 3 replaces blog TOC typing and validates structured data. Success means import scans find no blog imports from Nextra and blog metadata plus structured data tests pass.

## Concrete Steps

From `/Users/parkerrex/Developer/ship-by-sunday`, inspect the current blog Nextra imports:

    rg -n "nextra|importPage|generateStaticParamsFor|Heading" apps/web/app/blog apps/web/tests/unit

Confirm `apps/web/app/blog/_server/page-paths.ts` remains on the inventory route model.

Add a server-only app-owned blog content loader under `apps/web/app/blog/_server/`. It should import `apps/web/content/blog/*.mdx` through explicit dynamic imports and expose loader keys for focused tests.

Update `apps/web/app/blog/_server/blog-posts.ts` to use inventory entries for summaries and the app-owned content loader for article content. Remove Nextra `importPage` and avoid a duplicate frontmatter parser unless implementation proves the inventory contract is missing a required field.

Update `apps/web/app/blog/_lib/blog-toc.ts` to use app-owned heading or TOC types.

Update focused tests before broad checks. Preserve the current visible read-time behavior by leaving `readingTimeText` absent unless the inventory gains a deliberate reading-time field in a later slice.

## Validation and Acceptance

This slice is accepted when blog server modules and blog tests no longer import Nextra, `/blog` and the current article render correctly, metadata and structured data tests pass, draft filtering stays intact, and browser smoke verifies the index and article.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` after implementation:

    ! rg -n "nextra|nextra/pages|from \"nextra\"" apps/web/app/blog apps/web/tests/unit/blog-*.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/blog-page-paths.test.ts tests/unit/blog-posts.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-formatters.test.ts tests/unit/public-metadata-routes.test.ts
    bun lint
    bun typecheck
    bun run --cwd apps/web dev:web:only
    bun codex-scripts/blog-browser-smoke.mjs
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-replace-blog-nextra-rendering.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs docs/exec-plans/completed/2026-04-27-replace-blog-nextra-rendering.md
    git diff --check

Browser smoke is also required while the dev server is running: open `/blog` and the current published blog article route in desktop and mobile viewports and confirm content, TOC links, metadata-sensitive title behavior, and article layout. `codex-scripts/blog-browser-smoke.mjs` is the local ignored probe used for this proof.

## Idempotence and Recovery

Keep the public blog route page stable while swapping server internals. If the app-owned MDX loading path fails, stop and keep this slice scoped to blog rather than changing docs or package state.

If blog content needs syntax edits to compile without Nextra, keep the edits minimal and explain each one in this ExecPlan. Do not rewrite article copy.

## Artifacts and Notes

The current blog content lives under `apps/web/content/blog`. The current page path code excludes the programmatic index route and includes published articles. Tests should prove that behavior with the replacement inventory.

The current blog article uses MDX imports, so the final implementation must prove those imports still render or intentionally replace the component mechanism without changing copy.

Validation results recorded on 2026-04-27 EDT:

- `! rg -n "nextra|nextra/pages|from \"nextra\"" apps/web/app/blog apps/web/tests/unit/blog-*.test.ts`: passed with no matches.
- `bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/blog-page-paths.test.ts tests/unit/blog-posts.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-formatters.test.ts tests/unit/public-metadata-routes.test.ts`: 7 files and 17 tests passed.
- `bun lint`: passed with 0 warnings and 0 errors.
- `bun typecheck`: passed and generated 71 static pages, including `/blog` and `/blog/the-operating-system-beats-the-prompt`; the current Nextra shallow-clone warning remains because `apps/web/next.config.ts` still uses Nextra until the package/config cleanup slice.
- `bun codex-scripts/blog-browser-smoke.mjs` against `bun run --cwd apps/web dev:web:only`: passed for desktop and mobile `/blog` and `/blog/the-operating-system-beats-the-prompt`; post-fix server output no longer showed the nested paragraph hydration warning.

## Interfaces and Dependencies

This slice depends on the inventory API from the first child ExecPlan. It also depends on current blog UI components, inventory frontmatter validation, Next.js App Router optional catch-all route behavior, and public metadata route behavior.

The package cleanup slice depends on this slice because package removal is unsafe while blog imports Nextra.
