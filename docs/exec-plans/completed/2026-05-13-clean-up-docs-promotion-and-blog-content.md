---
title: Clean Up Docs Promotion And Blog Content
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Keep docs reachable but unpromoted, and add a product-split blog post so the thesis has a public content home.
post_build_recap: Docs remain directly reachable but are removed from sitemap and explicit robots allow rules, docs metadata is noindex, the old demo nav now points to Blog, and a Starter/Workers split article is published.
program_id: public-product-split-starter-workers
planning_brief: docs/programs/active/2026-05-12-public-product-split-starter-workers/planning-brief-4.md
read_when:
  - Resuming docs and blog cleanup for the public product split.
  - Changing public robots, sitemap, docs metadata, homepage demo navigation, or blog MDX inventory.
  - Validating that docs are support material and blog is the editorial surface.
---

# Clean Up Docs Promotion And Blog Content

This document is a living execution plan for keeping docs reachable but unpromoted while making blog content carry the public product thesis.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The product decision is that docs are support material for generated-codebase and setup customers, not a public product path. The blog is where Man Meets AI / Ship by Sunday thesis material should live. After this slice, direct `/docs` links should still work, but docs should not be promoted through public navigation or sitemap discovery. `/blog` should contain a product-split article that explains why Starter and Workers are separate paths.

## Progress

- [x] 2026-05-13: Read root instructions, design guidance, homepage configuration docs, Next metadata/robots/sitemap docs, the active Program, and the relevant app/blog/docs source files.
- [x] 2026-05-13: Confirmed the primary public header already excludes Docs, but robots, sitemap, docs metadata, and the old homepage demo top bar still promote docs.
- [x] 2026-05-13: Created planning brief 4 and this active child ExecPlan.
- [x] 2026-05-13: Removed docs from the explicit public robots allow list, disallowed `/docs`, removed docs routes from the sitemap, and added noindex/follow false metadata to docs pages.
- [x] 2026-05-13: Replaced the old homepage demo top bar Docs link with Blog.
- [x] 2026-05-13: Added `apps/web/content/blog/starter-and-workers-are-different-jobs.mdx`, wired it into the manual MDX loader, and updated blog metadata.
- [x] 2026-05-13: Updated and ran focused public metadata, blog, content inventory, blog path, and docs metadata tests successfully.

## Surprises & Discoveries

The public header is already correct. The remaining docs promotion is more subtle: SEO metadata and the old demo top bar. This means the slice can stay small and avoid route, access, or checkout changes.

The blog route uses file discovery for metadata but a manual MDX module map for rendering. Any new blog post must update `apps/web/app/blog/_server/blog-content.ts` or it will be discoverable but not renderable.

## Decision Log

Decision: Keep `/docs` public and direct-linkable, but remove it from sitemap discovery and mark docs pages noindex.
Rationale: The user explicitly wants docs available when generating a codebase, but not promoted as the thing being marketed.
Date: 2026-05-13.

Decision: Add one blog post for the Starter / Workers split instead of rewriting the whole content system.
Rationale: The immediate need is a real public home for the thesis. A larger editorial import from all Program docs can happen later if needed.
Date: 2026-05-13.

## Outcomes & Retrospective

Completed the docs and blog cleanup slice. `/docs` remains implemented and direct-linkable, but it no longer appears in the public sitemap or explicit robots allow list, and docs pages now emit noindex metadata. The old generated-codebase demo top bar no longer links to Docs; it links to Blog instead. `/blog` now has two published posts, including `starter-and-workers-are-different-jobs`, and the manual MDX loader is wired so the post renders.

Focused validation passed for public metadata routes, blog post loading, public content inventory, blog page paths, and docs metadata.

## Context and Orientation

The public site uses `apps/web/app/_components/public-site/public-site-header.tsx` for the current primary navigation. The old generated-codebase homepage demo under `apps/web/app/_components/home-page/sections/codebase-demo/` still exists for compatibility and tests, and its top bar still links to Docs. Public crawl rules live in `apps/web/app/robots.ts`. Sitemap output lives in `apps/web/app/sitemap.ts`. Docs metadata is built by `apps/web/app/docs/_lib/docs-metadata.ts`.

Blog content files live under `apps/web/content/blog/`. Blog metadata discovery is handled by `apps/web/app/_content/public-content-inventory.ts`, but rendered MDX pages are manually loaded through `apps/web/app/blog/_server/blog-content.ts`.

### In Scope

This slice may change public robots, sitemap, docs metadata, the old demo top bar, one new blog MDX file, blog loader wiring, and focused tests for public metadata and blog inventory/loading.

### Out Of Scope

Do not delete, protect, or disable `/docs`. Do not rewrite docs content beyond what is required by this slice. Do not change checkout, entitlements, generated repo output, Worker local runner code, or public route families.

## Plan of Work

First, update public discovery. Remove `/docs` from the explicit robots allow list, add `/docs` to disallow, remove docs entries from the sitemap, and update docs metadata so docs pages emit noindex metadata.

Next, update public navigation remnants. Replace the old demo top bar Docs link with Blog so the visible public path is editorial rather than support docs.

Next, add `apps/web/content/blog/starter-and-workers-are-different-jobs.mdx` with a concise public article about why Starter and Workers are separate product paths. Add the post to `apps/web/app/blog/_server/blog-content.ts`.

Finally, update tests that assert robots, sitemap, blog summary count, blog loader keys, and blog content inventory.

## Milestones

The first milestone is docs unpromotion. It is complete when tests prove docs are absent from the sitemap and explicit robots allow list while still remaining a route in app source.

The second milestone is blog content. It is complete when two published posts are discovered and the new post has a direct MDX loader.

The third milestone is validation. It is complete when focused public metadata and blog tests pass, followed by the relevant repo gates if files were formatted.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Run focused tests after implementation:

    bun run --cwd apps/web test:unit -- tests/unit/public-metadata-routes.test.ts tests/unit/blog-posts.test.ts tests/unit/public-content-inventory.test.ts tests/unit/blog-page-paths.test.ts

Run docs validation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-clean-up-docs-promotion-and-blog-content.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-13-clean-up-docs-promotion-and-blog-content.md docs/programs/active/2026-05-12-public-product-split-starter-workers

## Validation and Acceptance

Acceptance requires `/docs` to remain implemented while no longer appearing in the public sitemap or explicit robots allow list. Docs metadata should mark docs pages noindex. The old homepage demo top bar should not link to Docs. Blog discovery should list at least two published posts, and the new product-split post must be renderable through the MDX loader.

The test brief for this slice is: Feature: docs unpromotion and blog content. Risk: P3 low-risk public metadata/content because it changes crawl hints and editorial content, not account state or checkout. Source of truth: robots output, sitemap output, docs metadata object, blog inventory, and blog MDX loader keys. Must work: direct docs routes remain in source, sitemap excludes docs, robots disallows docs, blog lists the new post. Must fail safely: if a blog file is discoverable without a loader, the blog loader test fails. Tests: focused unit tests for public metadata, blog posts, content inventory, and blog paths. CI gate: app unit tests and docs lint.

### Test Commands

    bun run --cwd apps/web test:unit -- tests/unit/public-metadata-routes.test.ts tests/unit/blog-posts.test.ts tests/unit/public-content-inventory.test.ts tests/unit/blog-page-paths.test.ts
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-clean-up-docs-promotion-and-blog-content.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-13-clean-up-docs-promotion-and-blog-content.md docs/programs/active/2026-05-12-public-product-split-starter-workers

## Idempotence and Recovery

If docs disappear entirely, restore the docs route and metadata first, then reapply noindex/sitemap changes. If a blog post appears in inventory but renders 404, add the missing MDX loader key in `apps/web/app/blog/_server/blog-content.ts`.

## Artifacts and Notes

Relevant Next docs read for this slice: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md`, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md`, and `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`.

## Interfaces and Dependencies

This slice depends on `apps/web/app/robots.ts`, `apps/web/app/sitemap.ts`, `apps/web/app/docs/_lib/docs-metadata.ts`, `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-top-bar.tsx`, `apps/web/content/blog/`, `apps/web/app/blog/_server/blog-content.ts`, and focused unit tests under `apps/web/tests/unit/`.
