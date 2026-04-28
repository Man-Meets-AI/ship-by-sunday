---
title: Replace Docs Nextra Rendering
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Replace the public docs route Nextra loader, page map, theme shell, TOC, and CSS with app-owned rendering while preserving docs URLs and metadata.
post_build_recap: Replaced the docs Nextra loader, page map, theme shell, docs CSS hooks, and Nextra-backed MDX components with an app-owned docs content loader, shell, sidebar, TOC, theme toggle, and direct MDX rendering path.
program_id: remove-nextra-docs-runtime
planning_brief: docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-1.md
read_when:
  - Replacing the /docs Nextra runtime.
  - Updating docs navigation, TOC, or MDX rendering.
  - Validating docs public routes after the inventory slice lands.
---

# Replace Docs Nextra Rendering

This document is a living execution plan for replacing the docs route Nextra runtime after the content inventory slice exists.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

This slice makes `/docs` and nested docs pages render through repo-owned code instead of Nextra. Users should see the same public docs URLs, metadata, sidebar navigation, table of contents, disabled docs state, theme behavior, code blocks, tables, and prose layout, but the route should no longer import `nextra/pages`, `nextra/page-map`, `nextra-theme-docs`, `nextra-theme-docs/style.css`, or Nextra icons.

The result is visible by opening `/docs` and `/docs/local-setup`, checking the sidebar and TOC, and confirming metadata and sitemap tests still pass.

## Progress

- [x] 2026-04-27 EDT: Program research identified the docs Nextra surfaces.
- [x] 2026-04-27 EDT: This ExecPlan was created from `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-1.md`.
- [x] 2026-04-27 EDT: Inventory dependency landed in `docs/exec-plans/completed/2026-04-27-build-docs-blog-content-inventory-and-route-model.md`.
- [x] 2026-04-27 EDT: Grilled against `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-2.md`; the plan now names the direct-MDX docs import registry, app-owned docs shell, and no-package-change boundary explicitly.
- [x] 2026-04-27 EDT: Added `apps/web/app/docs/_server/docs-content.ts`, `apps/web/mdx.d.ts`, app-owned docs shell/sidebar/article/TOC components, and a shared heading-ID helper used by the inventory and MDX components.
- [x] 2026-04-27 EDT: Replaced `apps/web/app/docs/layout.tsx`, `apps/web/app/docs/[[...mdxPath]]/page.tsx`, `apps/web/app/docs/_components/docs-navbar.tsx`, `docs-footer.tsx`, `docs-theme-toggle.tsx`, `apps/web/mdx-components.tsx`, and `apps/web/app/docs/_styles/docs-theme.css` so the docs route no longer imports Nextra runtime surfaces.
- [x] 2026-04-27 EDT: Added focused tests for the direct docs content loader and docs navigation/TOC components.
- [x] 2026-04-27 EDT: Focused unit tests, import scan, lint, typecheck/build, and desktop/mobile browser smoke passed for `/docs` and `/docs/local-setup`.

## Surprises & Discoveries

`apps/web/app/docs/_styles/docs-theme.css` is tightly coupled to Nextra theme class names and variables. Replacing the layout without replacing CSS selectors would leave fragile styling tied to removed markup.

Docs disabled-state behavior is part of the route contract. `apps/web/app/docs/layout.tsx` currently renders a disabled state when `isStarterModuleEnabled("docs")` is false, and `apps/web/app/docs/[[...mdxPath]]/page.tsx` returns no static params when docs are disabled.

Direct MDX imports are the smallest app-owned render path for this slice because the current docs corpus uses plain MDX/markdown features and no docs-local custom MDX imports. The route can keep the content as `.mdx` while removing Nextra's `importPage` and page-map runtime.

## Decision Log

Decision: This slice depends on the app-owned inventory and route model. Rationale: docs rendering should consume a tested route, frontmatter, navigation, and TOC contract rather than rediscover content inside the page component. Date: 2026-04-27.

Decision: Replace the Nextra theme shell with app-owned components rather than wrapping or adapting Nextra components. Rationale: the Program goal is to remove the runtime dependency. Date: 2026-04-27.

Decision: Preserve current docs public URLs and metadata behavior exactly unless a failing test proves a current bug that must be corrected. Rationale: public docs routes are release-sensitive. Date: 2026-04-27.

Decision: Use a static docs content loader module that maps each known docs route key to a direct dynamic import of its `.mdx` file, then pair the loaded component with the inventory entry for frontmatter, headings, and source path. Rationale: Next App Router can render imported MDX through `mdx-components.tsx`, and a static import registry keeps bundling analyzable without introducing package changes in this slice. Date: 2026-04-27.

Decision: Replace `apps/web/mdx-components.tsx` with repo-owned MDX component mappings for headings and basic prose instead of delegating to `nextra-theme-docs`. Rationale: direct MDX rendering still needs stable heading IDs for TOC links, but global Nextra theme components must be gone before package cleanup. Date: 2026-04-27.

## Outcomes & Retrospective

This plan replaced docs rendering with a repo-owned direct-MDX path while keeping the existing docs content corpus as `.mdx`. The new server loader maps each inventory segment key to an explicit dynamic MDX import and returns inventory-backed metadata for `generateMetadata`. The page now renders `DocsArticle` around the imported content and calls `notFound()` for unknown enabled docs routes.

The Nextra theme shell was replaced with app-owned `DocsShell`, `DocsSidebar`, `DocsTableOfContents`, `DocsNavbar`, `DocsFooter`, and `DocsThemeToggle` components. The docs CSS now targets `sbs-docs-*` classes instead of `.nextra-*` or `article.nextra-body-typesetting-article`. `apps/web/mdx-components.tsx` no longer imports Nextra and now only supplies repo-owned heading IDs and local link handling.

Browser smoke proved `/docs` and `/docs/local-setup` at desktop and mobile sizes. The smoke checked the page title, H1, page body content, sidebar content, desktop TOC visibility, mobile TOC hiding, and theme toggle application. The intentionally changed shell behavior is that mobile docs navigation is rendered as a visible navigation panel above the article instead of Nextra's drawer behavior.

## Context and Orientation

The docs route currently lives at `apps/web/app/docs/[[...mdxPath]]/page.tsx` with a parent layout at `apps/web/app/docs/layout.tsx`. `page.tsx` imports MDX pages through `nextra/pages`, calls `buildDocsMetadata`, and wraps content through the Nextra theme wrapper from `apps/web/mdx-components.tsx`. The layout imports Nextra's page map and theme layout.

The replacement should use the inventory from the first child ExecPlan for route params, source paths, frontmatter, TOC data, and navigation data. It should keep `apps/web/app/docs/_lib/docs-metadata.ts` as the metadata output boundary unless implementation proves a stronger domain boundary is needed. The docs MDX component itself should come from a static import registry owned by the docs route, not from filesystem globbing, `nextra/pages`, or a new package.

Docs-specific UI exists in `apps/web/app/docs/_components/` and CSS exists in `apps/web/app/docs/_styles/docs-theme.css`. Nextra navbar, footer, theme, icon, and CSS imports must be replaced with app-owned code or existing local components.

### In Scope

This slice owns `/docs` page import/render behavior, `generateStaticParams`, `generateMetadata`, not-found behavior for unknown docs pages, docs disabled-state behavior, sidebar/page-map rendering, docs table of contents, docs navbar and footer replacements, docs theme toggle replacement, docs prose styling, code block and table styling, and focused docs tests and browser smoke.

### Out Of Scope

Do not replace blog rendering in this slice. Do not remove packages, lockfile entries, Nextra config, or starter assumptions until both docs and blog runtime imports are gone. Do not rewrite docs content copy, change public URLs, touch checkout, Stripe, billing, Convex files, compiler schema, or environment behavior.

## Plan of Work

Begin by reading the inventory API created by the first slice and the current docs route files. Identify the exact Nextra imports to remove from docs route code and docs components.

Create an app-owned docs content loader that maps inventory segment keys to direct dynamic imports of the matching docs `.mdx` files. The loader should expose a small lookup API for route components and metadata, and it should fail closed for unknown segment keys so the page can call `notFound()`.

Create app-owned docs shell components that render the sidebar, article body, TOC, navbar, footer, and theme toggle. Keep the component boundaries clear: content loading and metadata stay in server modules, presentation stays in components, and browser-only theme state stays in a small client component.

Keep `generateDocsStaticParams` on the inventory route model while preserving the current docs-disabled behavior. Replace `importPage` usage with the direct-MDX loader and pair the loaded content with inventory metadata and headings. Preserve `buildDocsMetadata` output for all docs pages.

Replace Nextra-specific CSS selectors with app-owned class names. Keep the visual system aligned with root `DESIGN.md` and the existing docs appearance; this is not a redesign.

## Milestones

Milestone 1 adds the docs direct-MDX loader and uses inventory entries for docs page lookup while Nextra rendering is still available for comparison. Success means the loader can resolve `/docs`, `/docs/local-setup`, and nested troubleshooting pages by segment key.

Milestone 2 replaces the docs MDX import and render path. Success means `/docs` and `/docs/local-setup` render the expected content without importing `nextra/pages`.

Milestone 3 replaces the docs theme shell, sidebar, TOC, navbar, footer, theme toggle, and CSS. Success means import scans find no docs-route imports from `nextra`, `nextra/page-map`, `nextra-theme-docs`, or `nextra/icons`.

## Concrete Steps

From `/Users/parkerrex/Developer/ship-by-sunday`, confirm the first slice has landed and inspect the docs dependency surface:

    rg -n "nextra|nextra-theme-docs|nextra/page-map|nextra/pages|nextra/icons" apps/web/app/docs apps/web/mdx-components.tsx apps/web/next.config.ts

Add an app-owned docs content loader under `apps/web/app/docs/_server/` or another server-only docs boundary. It should import `apps/web/content/docs/*.mdx` and `apps/web/content/docs/troubleshooting/*.mdx` through explicit dynamic imports and combine those modules with `getDocsContentEntries()`.

Update `apps/web/app/docs/[[...mdxPath]]/page.tsx` to use the inventory and direct-MDX render path. Keep parameter normalization at the route boundary, call `notFound()` for unknown enabled docs pages, and keep the disabled-state metadata branch.

Update `apps/web/app/docs/layout.tsx` and `apps/web/app/docs/_components/` to remove Nextra theme components. Preserve the disabled-state early return.

Replace `apps/web/app/docs/_styles/docs-theme.css` selectors that target Nextra classes with app-owned docs shell and prose classes.

Replace `apps/web/mdx-components.tsx` with repo-owned component mappings. Heading components should emit deterministic IDs that match the inventory heading extractor for the current docs corpus, so TOC links keep working.

Add or update focused tests under `apps/web/tests/unit/` and any component tests needed for docs disabled state, static params, metadata, sidebar data, TOC data, and the docs direct-MDX loader metadata contract.

## Validation and Acceptance

This slice is accepted when docs route runtime code no longer imports Nextra, `/docs` and `/docs/local-setup` render through app-owned code, docs metadata and sitemap behavior are preserved, docs disabled state still works, and a desktop plus mobile browser smoke finds the docs shell usable.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` after implementation:

    ! rg -n "nextra|nextra-theme-docs|nextra/page-map|nextra/pages|nextra/icons" apps/web/app/docs apps/web/mdx-components.tsx
    bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/docs-page-paths.test.ts tests/unit/docs-content-loader.test.ts tests/unit/docs-navigation-components.test.tsx tests/unit/docs-metadata.test.ts tests/unit/docs-disabled-state.test.tsx tests/unit/public-metadata-routes.test.ts
    bun lint
    bun typecheck
    bun run --cwd apps/web dev:web:only
    bun codex-scripts/docs-browser-smoke.mjs
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-replace-docs-nextra-rendering.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs docs/exec-plans/completed/2026-04-27-replace-docs-nextra-rendering.md
    git diff --check

Browser smoke is required while the dev server is running: open `/docs` and `/docs/local-setup` in one desktop viewport and one mobile viewport, confirm the page content, sidebar, TOC, theme toggle, and metadata-sensitive title behavior are not visibly broken. `codex-scripts/docs-browser-smoke.mjs` is the local ignored probe used for this proof.

## Idempotence and Recovery

Keep the replacement additive until each test passes. If the MDX render path fails, revert only this slice's docs rendering edits and leave the inventory slice intact.

If styling becomes too large, keep the markup app-owned and defer only non-critical visual polish to a follow-up inside this ExecPlan, not to package cleanup. Package cleanup must not inherit broken docs chrome.

## Artifacts and Notes

The old docs CSS targets Nextra class names. The final proof should include a clean scan showing no docs runtime imports from Nextra packages, but `apps/web/package.json` may still contain Nextra until the package cleanup slice.

The current docs content includes tables, blockquotes, code fences, links, and nested troubleshooting routes. Browser and tests should cover at least one page with a table or code fence if feasible.

Validation results recorded on 2026-04-27 EDT:

- `! rg -n "nextra|nextra-theme-docs|nextra/page-map|nextra/pages|nextra/icons" apps/web/app/docs apps/web/mdx-components.tsx`: passed with no matches.
- `bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/docs-page-paths.test.ts tests/unit/docs-content-loader.test.ts tests/unit/docs-navigation-components.test.tsx tests/unit/docs-metadata.test.ts tests/unit/docs-disabled-state.test.tsx tests/unit/public-metadata-routes.test.ts`: 7 files and 16 tests passed.
- `bun lint`: passed with 0 warnings and 0 errors.
- `bun typecheck`: passed and generated 71 static pages, including `/docs` plus 31 nested docs paths.
- `bun codex-scripts/docs-browser-smoke.mjs` against `bun run --cwd apps/web dev:web:only`: passed for desktop and mobile `/docs` and `/docs/local-setup`.

## Interfaces and Dependencies

This slice depends on the inventory API from `docs/exec-plans/completed/2026-04-27-build-docs-blog-content-inventory-and-route-model.md`.

It must preserve `buildDocsMetadata` output, Next.js App Router server component boundaries, optional catch-all route behavior, docs module disabled state, and the repo's design system constraints.
