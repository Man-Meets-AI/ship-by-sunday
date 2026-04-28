---
title: Remove Nextra Docs Runtime Planning Brief 3
program_id: remove-nextra-docs-runtime
brief_version: 3
status: superseded
summary: Carry forward the completed docs rendering replacement and steer the next blog rendering replacement slice.
read_when:
  - Grilling or executing the blog rendering replacement slice.
  - Checking what changed after docs runtime rendering moved off Nextra.
  - Validating that blog replacement does not absorb package or starter cleanup.
---

# Remove Nextra Docs Runtime Planning Brief 3

## What Landed

The second child ExecPlan completed at `docs/exec-plans/completed/2026-04-27-replace-docs-nextra-rendering.md`.

That slice added `apps/web/app/docs/_server/docs-content.ts` as the direct docs MDX loader, `apps/web/mdx.d.ts` for local MDX module typing, app-owned docs shell/sidebar/article/TOC components, and `apps/web/app/_content/public-content-heading-ids.ts` for shared heading IDs. It replaced the docs route's Nextra `importPage` usage, Nextra page map, Nextra theme layout, Nextra navbar/footer/theme toggle imports, Nextra CSS import, `.nextra-*` CSS selectors, and Nextra-backed `apps/web/mdx-components.tsx`.

The docs route now renders `.mdx` through explicit dynamic imports paired with the inventory contract. `/docs` and `/docs/local-setup` passed desktop and mobile browser smoke for title, H1, body content, sidebar, TOC visibility, and theme toggle behavior.

## Updated Initiative Facts

Docs runtime files no longer import `nextra`, `nextra/page-map`, `nextra/pages`, `nextra-theme-docs`, `nextra-theme-docs/style.css`, or `nextra/icons`.

The remaining Nextra runtime surfaces are now concentrated in blog rendering and cleanup: `apps/web/app/blog/_server/blog-posts.ts` imports `nextra/pages`, `apps/web/app/blog/_lib/blog-toc.ts` imports the `Heading` type from `nextra`, `apps/web/next.config.ts` still wraps config with Nextra, and `apps/web/package.json` plus `bun.lock` still include `nextra` and `nextra-theme-docs`.

The completed docs slice intentionally did not remove packages or config. Package cleanup remains blocked until blog no longer imports Nextra.

## Remaining Risks

The next slice must preserve `/blog` and `/blog/the-operating-system-beats-the-prompt`, blog index ordering, draft filtering, blog metadata, structured data, current hero media behavior, explicit MDX component imports inside the blog article, and the blog TOC.

The next slice should reuse the shared inventory for blog frontmatter, published filtering, source paths, headings, and last-modified data. It should not add a second frontmatter parser or route discovery path.

The next slice must not remove Nextra packages, edit `apps/web/next.config.ts`, or update starter assumptions. Those remain in the package/config/starter cleanup slice after docs and blog runtime import scans are clean.

## Next Child ExecPlan

The next active child ExecPlan is `docs/exec-plans/active/2026-04-27-replace-blog-nextra-rendering.md`.

Before implementation, grill that plan against this planning brief and the completed inventory/docs-rendering state. The grill should verify that blog rendering consumes `apps/web/app/_content/public-content-inventory.ts`, keeps current blog metadata and structured data boundaries unless a concrete reason appears, supports the current blog article's explicit MDX imports, and does not touch package cleanup.

## Next Slice Validation

The blog rendering slice should prove `/blog` and `/blog/the-operating-system-beats-the-prompt` through focused tests and, if feasible, browser smoke. It should include an import scan showing blog runtime files no longer import `nextra/pages` or `nextra` types, while package dependencies may remain until the later cleanup slice.

It must rerun the inventory and metadata tests if it changes the inventory API:

    bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/blog-page-paths.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/public-metadata-routes.test.ts

It must also run the required planning validation after any plan edits:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-27-replace-blog-nextra-rendering.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs docs/exec-plans/active/2026-04-27-replace-blog-nextra-rendering.md
