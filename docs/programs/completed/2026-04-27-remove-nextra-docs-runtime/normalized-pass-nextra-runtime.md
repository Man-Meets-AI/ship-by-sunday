# Normalized Pass: Nextra Removal Tracks

## Track 1: Content Inventory And Route Model

Build the app-owned source of truth for docs and blog content before changing rendering. The inventory should read `apps/web/content/docs` and `apps/web/content/blog`, validate frontmatter, normalize index and nested route paths, preserve draft behavior, preserve docs disabled-state behavior, extract headings for TOC, and model `_meta.ts` navigation ordering.

This track is additive and is the strongest first implementation slice.

## Track 2: Docs Rendering Replacement

Replace the docs route's Nextra dependency after Track 1 exists. The replacement must own docs MDX import/render behavior, metadata, sidebar/page map, TOC, navbar, footer, theme toggle, disabled-state shell, prose styling, table styling, code block styling, and nested route 404 behavior.

This track must preserve `/docs` and nested docs URLs.

## Track 3: Blog Rendering Replacement

Replace blog Nextra usage after Track 1 exists. The replacement must preserve blog frontmatter validation, draft filtering, article metadata, structured data, TOC normalization, route params, and MDX component imports.

This track is required because the blog route imports `nextra/pages` and a `nextra` type.

## Track 4: Package, Config, CSS, And Starter Cleanup

Remove `nextra` and `nextra-theme-docs` only after Tracks 2 and 3 remove all runtime imports. This track owns `apps/web/package.json`, `bun.lock`, `apps/web/next.config.ts`, `apps/web/mdx-components.tsx`, theme CSS leftovers, Nextra import scans, and starter repository generation assumptions such as `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`.

This track must not change compiler schema or facts unless a later approved plan explicitly expands scope.

## Track 5: Release Hardening

Run public-route proof after package removal and cleanup. This track owns focused docs tests, blog tests, metadata and sitemap tests, browser smoke for `/docs` and `/docs/local-setup`, broader lint and typecheck, package validation, and final Program/ExecPlan evidence.

## Normalized Boundary Rules

Keep existing content copy and public URLs. Do not rewrite docs or blog prose except for migration-required syntax fixes.

Keep MDX as the content format unless an implementation slice proves a lower-risk path. The current blog article uses MDX imports, so plain markdown is not a safe whole-app target.

Do not remove dependencies until import scans prove Nextra is gone from runtime code and tests.

Do not touch Stripe, checkout, webhook, pricing, promo code, billing proof, environment behavior, Convex schema, generated Convex files, or codebase compiler schema and facts.
