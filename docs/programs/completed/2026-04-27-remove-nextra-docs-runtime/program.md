---
program_id: remove-nextra-docs-runtime
title: Remove Nextra Docs Runtime
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Replace the public docs and blog Nextra runtime dependency with repo-owned content discovery, rendering, metadata, navigation, and release proof while preserving public URLs.
post_build_recap: Public docs and blog now render through repo-owned MDX inventory, loaders, navigation, theme shell, metadata, and release proof; Nextra packages, config hooks, runtime imports, and starter assumptions were removed.
read_when:
  - Planning the Nextra removal migration.
  - Choosing the next docs or blog rendering slice.
  - Validating public docs, blog, sitemap, metadata, or starter snapshot behavior.
---

# Remove Nextra Docs Runtime

This is a living initiative document for removing the app's dependency on Nextra and `nextra-theme-docs` without changing public docs or blog URLs.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

At the start of this Program, the app relied on Nextra for three separate responsibilities: finding content routes, importing and rendering MDX pages, and supplying the docs theme shell. The initiative replaced those responsibilities with repo-owned code so the public docs and blog routes remain stable while the runtime no longer depends on `nextra` or `nextra-theme-docs`.

Completion means `/docs`, nested docs pages such as `/docs/local-setup`, `/blog`, the current blog article, sitemap entries, page metadata, Open Graph data, and starter repository assumptions all keep working through app-owned content inventory and rendering code. Dependency removal happened only after runtime imports, tests, CSS hooks, and starter-snapshot assumptions no longer required Nextra.

## Program Inputs

The durable packet artifacts for this completed Program live in `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/`.

- `research-pass-nextra-runtime.md` records the current dependency graph, content corpus, runtime paths, risks, and recommended migration shape.
- `normalized-pass-nextra-runtime.md` reduces the research into stable work tracks and boundary rules.
- `converged-decision-packet.md` records the final planning decisions used to split the work.
- `dependency-graph.md` records the real dependency order between route inventory, docs rendering, blog rendering, package removal, starter assumptions, and release proof.
- `plan-split-recommendation.md` maps the Program into child ExecPlans.
- `cross-repo-review.md` records the affected app, compiler, docs, and release surfaces.
- `planning-brief-1.md` is the initial planning brief used to write the child ExecPlans.
- `planning-brief-2.md` is the superseded planning brief after the completed inventory and route-model slice.
- `planning-brief-3.md` is the superseded planning brief after the completed docs rendering replacement slice.
- `planning-brief-4.md` is the superseded planning brief after the completed blog rendering replacement slice.
- `planning-brief-5.md` is the final planning brief after the completed package/config/starter cleanup slice.
- `current-planning-brief.txt` points to the final brief revision used before completion.

## Current State

At discovery, Nextra was not isolated to the docs route. The docs route imported `nextra/pages`, `nextra/page-map`, `nextra/mdx-components`, `nextra-theme-docs`, `nextra-theme-docs/style.css`, and `nextra/icons`. The blog route imported `nextra/pages` for MDX loading and static params, and imported the `Heading` type from `nextra` for table-of-contents normalization. That proved the dependency removal had to include blog before the app could remove the packages.

The docs corpus under `apps/web/content/docs` contains 32 `.mdx` files with frontmatter, headings, lists, links, code fences, one markdown table, a few blockquotes, and nested routes under `troubleshooting/`. Docs content does not currently import custom MDX components. The blog corpus under `apps/web/content/blog` currently contains one `.mdx` article with rich frontmatter, code blocks, blockquotes, and explicit MDX imports for `BlogSplitHero` and `BlogSplitSection`, so the durable low-risk path is to keep MDX support rather than rewrite content to plain markdown.

The completed first implementation slice added a server-only app-owned inventory in `apps/web/app/_content/public-content-inventory.ts`. `apps/web/app/_metadata/content-route-index.ts` consumes that inventory for sitemap entries, and docs/blog page-path helpers use it for static params.

The completed second implementation slice moved docs rendering off Nextra. `/docs` now renders through an explicit direct-MDX loader and app-owned docs shell, sidebar, TOC, theme toggle, and CSS.

The completed third implementation slice moved blog rendering off Nextra. `/blog` and the current article now render through an explicit direct-MDX loader, inventory-backed summaries, and inventory-backed TOC data.

The completed fourth implementation slice removed Nextra from Next config, app dependencies, and the lockfile. The app now compiles MDX through `@next/mdx` and `remark-frontmatter`, with `apps/web/mdx-components.tsx` kept as the app-owned MDX component seam.

The completed fifth implementation slice proved the integrated public surface with import/package scans, frozen install validation, focused docs/blog/metadata tests, browser smoke across desktop and mobile, compiler starter tests, lint, typecheck, planning lint, markdown lint, and diff hygiene.

## Progress

- [x] 2026-04-27 EDT: Read repository instructions, Program and ExecPlan contracts, release workflow guidance, app instructions, and local Next.js docs relevant to App Router, MDX, static params, metadata, optional catch-all routes, sitemap, and server/client boundaries.
- [x] 2026-04-27 EDT: Inspected the known Nextra surfaces in app config, docs layout, docs page loading, docs navigation components, docs CSS, blog loading, blog TOC, sitemap metadata tests, and starter repository generation surfaces.
- [x] 2026-04-27 EDT: Created the Program packet and child ExecPlans for research and planning only.
- [x] 2026-04-27 EDT: Completed the first child ExecPlan, `docs/exec-plans/completed/2026-04-27-build-docs-blog-content-inventory-and-route-model.md`. The slice added the shared inventory, moved docs and blog static-param discovery off `generateStaticParamsFor`, kept rendering unchanged, and passed focused tests, lint, format, and typecheck.
- [x] 2026-04-27 EDT: Refreshed the Program loop with `planning-brief-2.md` and updated `current-planning-brief.txt` for the next docs rendering slice.
- [x] 2026-04-27 EDT: Completed the second child ExecPlan, `docs/exec-plans/completed/2026-04-27-replace-docs-nextra-rendering.md`. The slice moved docs page loading, layout, page-map, TOC, theme shell, theme toggle, MDX components, and docs CSS off Nextra while preserving docs URLs and metadata.
- [x] 2026-04-27 EDT: Refreshed the Program loop with `planning-brief-3.md` and updated `current-planning-brief.txt` for the next blog rendering slice.
- [x] 2026-04-27 EDT: Completed the third child ExecPlan, `docs/exec-plans/completed/2026-04-27-replace-blog-nextra-rendering.md`. The slice moved blog page loading, summaries, article records, and TOC typing off Nextra while preserving blog URLs, metadata, structured data, and current MDX components.
- [x] 2026-04-27 EDT: Refreshed the Program loop with `planning-brief-4.md` and updated `current-planning-brief.txt` for the next package/config/starter cleanup slice.
- [x] 2026-04-27 EDT: Completed the fourth child ExecPlan, `docs/exec-plans/completed/2026-04-27-remove-nextra-config-packages-and-starter-assumptions.md`. The slice removed Nextra config/packages/lockfile entries, added official direct MDX dependencies, and updated starter Next docs path guidance.
- [x] 2026-04-27 EDT: Refreshed the Program loop with `planning-brief-5.md` and updated `current-planning-brief.txt` for the final release-hardening slice.
- [x] 2026-04-27 EDT: Completed the fifth child ExecPlan, `docs/exec-plans/completed/2026-04-27-harden-public-docs-blog-release-proof.md`. Final release-hardening proof passed across import/package scans, frozen install, focused public-surface tests, compiler tests, browser smoke, lint, typecheck, planning lint, markdown lint, and diff hygiene.
- [x] 2026-04-27 EDT: Moved the Program packet to `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/` after every required slice completed.

## Decision Log

- Decision: Treat the migration as docs plus blog, not docs only. Rationale: `apps/web/app/blog/_server/blog-posts.ts`, `apps/web/app/blog/_server/page-paths.ts`, and `apps/web/app/blog/_lib/blog-toc.ts` import Nextra surfaces, so removing only docs Nextra usage would leave the direct dependency alive. Date: 2026-04-27.
- Decision: Keep existing `.mdx` content through the migration. Rationale: the docs corpus could likely render as plain markdown, but the current blog article imports React components, and rewriting content copy or authoring format is outside scope. Date: 2026-04-27.
- Decision: Make the strongest first implementation slice a repo-owned docs and blog content inventory plus route model without changing runtime rendering. Rationale: it creates the contract needed by later rendering slices while preserving the current Nextra runtime as a safety net. Date: 2026-04-27.
- Decision: Remove `nextra` and `nextra-theme-docs` packages only after app runtime imports, Nextra config hooks, tests, CSS selectors, and starter-snapshot assumptions are gone. Rationale: package removal before import removal would turn the migration into a broken dependency bump instead of a controlled replacement. Date: 2026-04-27.

## Slice Ledger

- `docs/exec-plans/completed/2026-04-27-build-docs-blog-content-inventory-and-route-model.md`: Completed strongest first slice. Built app-owned content inventory, route normalization, frontmatter validation, `_meta.ts` ordering, TOC extraction, sitemap integration, and docs/blog static-param discovery without changing runtime rendering.
- `docs/exec-plans/completed/2026-04-27-replace-docs-nextra-rendering.md`: Completed docs rendering replacement. Replaced `/docs` Nextra import, page-map, wrapper, layout shell, TOC, navbar, footer, theme toggle, and CSS behavior while preserving docs URLs and metadata.
- `docs/exec-plans/completed/2026-04-27-replace-blog-nextra-rendering.md`: Completed blog rendering replacement. Replaced blog `nextra/pages` loading, metadata extraction, MDX content rendering, and TOC typing while preserving blog URLs and structured data.
- `docs/exec-plans/completed/2026-04-27-remove-nextra-config-packages-and-starter-assumptions.md`: Completed package/config/starter cleanup. Removed Nextra config, packages, lockfile entries, theme leftovers, and updated starter repository assumptions after all runtime imports were gone.
- `docs/exec-plans/completed/2026-04-27-harden-public-docs-blog-release-proof.md`: Completed release-sensitive browser, metadata, sitemap, lint, typecheck, package, planning, and diff validation across the migrated public surfaces.

## Next Slice

No required next slice remains inside this Program. Future docs or blog changes should start from the completed child ExecPlans and preserve the same public URL, metadata, sitemap, and starter assumptions unless a new Program or ExecPlan explicitly changes that contract.

## Risks and Watchpoints

The blog must not be overlooked. Leaving blog Nextra imports in place means package removal is incomplete.

Docs disabled-state behavior must stay intact. `isStarterModuleEnabled("docs")` currently gates docs static params, docs layout rendering, and disabled docs UI.

Public route behavior is release-sensitive. `/docs`, nested docs pages, `/blog`, article routes, sitemap entries, canonical URLs, Open Graph data, and Twitter metadata must remain stable.

`_meta.ts` files currently carry navigation ordering, labels, and separators. A plain filesystem sort would change the docs sidebar and should not be accepted as a drop-in replacement without explicit review.

The app-owned docs shell now supplies article styling, TOC behavior, and docs chrome directly. Blog now uses an app-owned MDX loading and TOC path. Config and package cleanup can remove Nextra after final import scans and starter assumption checks.

Starter repository generation still includes `apps/web/mdx-components.tsx` because App Router MDX requires it. Starter guidance now points at local Next docs under `node_modules/next/dist/docs/`, matching this Bun workspace's hoisted dependency layout.

## Outcomes & Retrospective

This Program is complete. The migration chose a repo-owned MDX path rather than rewriting content to plain markdown because the current blog article imports React MDX components and the docs corpus already works safely as MDX. The app now owns content inventory, docs static params, blog static params, metadata route inputs, docs page loading, blog page loading, sidebar ordering, TOC extraction, docs shell, theme toggle, docs styling, and starter path guidance.

`nextra` and `nextra-theme-docs` were removed from `apps/web/package.json` and `bun.lock` only after all runtime imports and config hooks were gone. Direct MDX support is now explicit through `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, and `remark-frontmatter`.

Browser smoke covered desktop `1280x900` and mobile `390x844` for `/docs`, `/docs/local-setup`, `/blog`, and `/blog/the-operating-system-beats-the-prompt`. No required content feature was intentionally deferred. The only runtime console noise observed during final local browser proof was the existing Clerk development-key/session-refresh warning, unrelated to docs or blog rendering.

## Validation and Acceptance

The Program moved to `completed/` after every child ExecPlan completed, all Nextra runtime imports were removed, `nextra` and `nextra-theme-docs` were removed from `apps/web/package.json` and `bun.lock`, docs and blog public behavior was proven through focused tests and browser smoke, and starter repository assumptions were updated where needed.

Program-level validation included focused docs tests first, blog tests because blog was touched, metadata and sitemap tests, browser smoke for `/docs` and `/docs/local-setup`, browser smoke for `/blog` and the current article, repo lint, repo typecheck, package and lockfile validation, Program lint, ExecPlan lint for each child plan, markdown lint, and `git diff --check`.

## Artifacts and Notes

The remaining Nextra dependency graph is empty for active runtime, package, and lockfile surfaces. Historical Program and ExecPlan documents still mention Nextra as the removed dependency.

The content inventory found 33 frontmatter-bearing MDX files, 12 files with code fences, one docs markdown table, three files with blockquotes, one blog MDX file with explicit imports, no markdown images, and 11 files with absolute `/docs` links. The completed first child ExecPlan backs the route-critical subset with `apps/web/tests/unit/public-content-inventory.test.ts`, `docs-page-paths.test.ts`, `blog-page-paths.test.ts`, public metadata route tests, and docs metadata tests.

Final validation evidence recorded by the hardening ExecPlan: no Nextra import/package matches, direct MDX dependencies present, `bun install --frozen-lockfile` passed, focused app tests passed with 13 files and 29 tests, codebase compiler tests passed with 4 tests, `bun lint` passed with 0 warnings and 0 errors, `bun typecheck` passed and generated 71 static pages, docs and blog browser smoke passed in desktop and mobile viewports, planning lint passed, markdown lint passed, and `git diff --check` passed.

## Interfaces and Dependencies

This Program depends on Next.js App Router behavior for server components, optional catch-all route params, `generateStaticParams`, `dynamicParams`, `generateMetadata`, sitemap metadata routes, and MDX support. The local Next docs were read from the hoisted `node_modules/next/dist/docs/` location because `apps/web/node_modules/next/dist/docs/` does not exist in this Bun workspace.

This Program also depends on `docs/release-workflow.md` for public route and release-proof expectations, `apps/web/AGENTS.md` for app work rules, `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts` for starter-safe file assumptions, and `docs/exec-plans/PLANS.md` for child ExecPlan maintenance.
