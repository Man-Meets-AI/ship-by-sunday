# Research Pass: Nextra Runtime Dependency Graph

## Summary

The migration is not docs-only. The docs route depends on Nextra for content import, static params, page map, MDX wrapper, theme shell, theme state, icons, and CSS. The blog route also depends on Nextra for MDX import, static params, reading-time metadata, TOC data, and one imported `Heading` type. Package removal must wait until both docs and blog runtime imports are gone.

The smallest durable migration shape is to keep the existing `.mdx` content format, build a repo-owned content inventory and route model first, then replace docs rendering, then replace blog rendering, then remove config/packages and starter assumptions, and finally run public-route release proof.

## Read Inputs

Repository instructions were read from `AGENTS.md`, `apps/web/AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, and `docs/release-workflow.md`.

Next.js docs were read from `node_modules/next/dist/docs/` because the requested app-local path `apps/web/node_modules/next/dist/docs/` is absent in this hoisted Bun install. Relevant local docs covered App Router pages, dynamic routes, optional catch-all params, `generateStaticParams`, `dynamicParams`, `generateMetadata`, sitemap metadata routes, MDX with `@next/mdx`, required `mdx-components.tsx` behavior, server components, and client components.

## Current Nextra Runtime Surfaces

Direct app package dependencies live in `apps/web/package.json` as `nextra` and `nextra-theme-docs`. `bun.lock` contains those packages and their transitive MDX, remark, rehype, search, and theme dependencies.

`apps/web/next.config.ts` wraps the Next config with `nextra({ defaultShowCopyCode: true, search: false })`. This is the build-time hook that makes current `.mdx` route imports and `nextra/pages` imports work.

`apps/web/mdx-components.tsx` imports `MDXComponents` from `nextra/mdx-components` and `useMDXComponents` from `nextra-theme-docs`. The docs route then uses this wrapper to render imported MDX pages.

`apps/web/app/docs/layout.tsx` imports `getPageMap` from `nextra/page-map`, `Layout` from `nextra-theme-docs`, and `nextra-theme-docs/style.css`. It also imports the local docs theme CSS overrides and renders repo components for navbar, footer, theme toggle, and disabled docs state.

`apps/web/app/docs/[[...mdxPath]]/page.tsx` imports `importPage` from `nextra/pages`, gets MDX content plus `toc`, `metadata`, and `sourceCode`, wraps the content through the Nextra theme wrapper, and uses `buildDocsMetadata` for page metadata.

`apps/web/app/docs/_lib/page-paths.ts` imports `generateStaticParamsFor` from `nextra/pages` and converts Nextra's root-prefixed params into docs route params.

`apps/web/app/docs/_components/docs-navbar.tsx`, `docs-footer.tsx`, and `docs-theme-toggle.tsx` import `Navbar`, `Footer`, `useTheme`, and Nextra icons from Nextra theme packages.

`apps/web/app/docs/_styles/docs-theme.css` is built around Nextra class names and variables, including `--nextra-*`, `header.nextra-navbar`, `.nextra-sidebar`, `.nextra-toc`, and `article.nextra-body-typesetting-article`.

`apps/web/app/blog/_server/blog-posts.ts` imports `importPage` from `nextra/pages` and consumes Nextra metadata, reading time, TOC, and default MDX content.

`apps/web/app/blog/_server/page-paths.ts` imports `generateStaticParamsFor` from `nextra/pages` for blog params.

`apps/web/app/blog/_lib/blog-toc.ts` imports the `Heading` type from `nextra` and normalizes Nextra TOC labels into plain blog TOC items.

`apps/web/tests/unit/blog-page-paths.test.ts` mocks `nextra/pages`, so the tests also need to move to the app-owned route inventory.

## Content Corpus

`apps/web/content/docs` has 32 `.mdx` files. They use YAML frontmatter with `title` and `description`, headings, lists, code fences, one markdown table, a few blockquotes, links, and nested routes under `troubleshooting/`. Docs content does not currently import custom MDX components or use markdown images.

`apps/web/content/blog` has one `.mdx` article with rich frontmatter and explicit MDX imports for `BlogSplitHero` and `BlogSplitSection`. It also uses headings, code blocks, and blockquotes.

There are three `_meta.ts` files: `apps/web/content/docs/_meta.ts`, `apps/web/content/docs/troubleshooting/_meta.ts`, and `apps/web/content/blog/_meta.ts`. The docs `_meta.ts` files must be treated as navigation input because they control labels, separators, and ordering that a plain file sort would not preserve.

The corpus can stay as MDX safely. Reducing docs to plain markdown might be possible in isolation, but reducing the whole app to plain markdown would require rewriting the current blog article or inventing a second content mode. Keeping `.mdx` avoids content copy churn and preserves authoring flexibility.

## Existing Non-Nextra Reference Surface

`apps/web/app/_metadata/content-route-index.ts` already reads `apps/web/content/docs` and `apps/web/content/blog` from the filesystem, parses simple frontmatter, skips draft blog content, and feeds `apps/web/app/sitemap.ts`. It proves that repo-owned route discovery is already acceptable for metadata routes, but it is not enough to replace page rendering because it does not import MDX modules, validate rich frontmatter, build `_meta.ts` navigation, or extract TOC.

`apps/web/app/docs/_lib/docs-metadata.ts` is already app-owned and should remain the metadata output boundary for docs pages.

`apps/web/app/blog/_lib/blog-toc.ts`, `apps/web/app/blog/_server/blog-posts.ts`, blog metadata tests, and blog structured-data tests define the blog-side output contract that a replacement importer must keep.

## Release-Sensitive Behavior To Preserve

Do not change public docs or blog URLs. `/docs`, `/docs/local-setup`, nested docs routes, `/blog`, and the existing blog article route must remain stable.

Do not change canonical URLs, Open Graph metadata, Twitter metadata, sitemap entries, public metadata tests, disabled docs states, or the generated starter repo's docs assumptions unless a child ExecPlan explicitly owns that update.

Do not touch Stripe, checkout, webhook, pricing, promo code, billing proof, environment behavior, Convex schema, generated Convex files, blueprint compiler schema, or compiler facts.

## Recommended Migration Shape

First build a repo-owned content inventory and route model for docs and blog without changing current runtime rendering. This should validate frontmatter, route slugs, `_meta.ts` ordering, draft behavior, docs-disabled behavior, and TOC extraction against the current corpus.

Second replace the `/docs` Nextra route loading and theme shell with app-owned rendering that consumes the route model and preserves docs metadata, sidebar, TOC, navbar, footer, theme toggle, disabled state, and CSS behavior.

Third replace blog Nextra usage because it is part of the dependency graph. Blog replacement must preserve frontmatter validation, draft filtering, reading-time behavior if still exposed, TOC data, MDX component imports, metadata, and structured data.

Fourth remove Nextra config, packages, lockfile entries, `mdx-components.tsx` assumptions if no longer needed, Nextra CSS leftovers, and starter repository assumptions after import scans prove runtime dependency removal is complete.

Fifth run release-hardening proof across docs, blog, sitemap, metadata, browser smoke, lint, typecheck, and package validation.
