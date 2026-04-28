---
title: Remove Nextra Docs Runtime Planning Brief 2
program_id: remove-nextra-docs-runtime
brief_version: 2
status: superseded
summary: Carry forward the completed inventory slice and steer the next docs rendering replacement slice.
read_when:
  - Grilling or executing the docs rendering replacement slice.
  - Checking what changed after the inventory and route-model slice landed.
  - Validating that the next slice does not absorb blog or package cleanup.
---

# Remove Nextra Docs Runtime Planning Brief 2

## What Landed

The first child ExecPlan completed at `docs/exec-plans/completed/2026-04-27-build-docs-blog-content-inventory-and-route-model.md`.

That slice added `apps/web/app/_content/public-content-inventory.ts` as the server-only app-owned inventory for public docs and blog content. It reads MDX files from `apps/web/content/docs` and `apps/web/content/blog`, validates current scalar frontmatter, extracts headings, models docs `_meta.ts` navigation entries including separators and sections, filters published blog entries, and carries last-modified data for sitemap consumers.

The slice also changed `apps/web/app/_metadata/content-route-index.ts` to consume the inventory for sitemap routes, changed `apps/web/app/docs/_lib/page-paths.ts` to generate docs static params from the inventory, and changed `apps/web/app/blog/_server/page-paths.ts` to generate published blog static params from the inventory. It added focused tests for the inventory, docs page paths, blog page paths, public metadata routes, and docs metadata.

## Updated Initiative Facts

Route discovery is no longer blocked on `generateStaticParamsFor` in docs or blog page-path helpers. The remaining Nextra runtime surfaces are now concentrated in docs MDX rendering, docs layout/theme shell, docs components, docs theme CSS, blog MDX loading, blog TOC typing, `apps/web/mdx-components.tsx`, `apps/web/next.config.ts`, package dependencies, lockfile entries, and starter assumptions.

The app still uses Nextra at render time. The completed first slice deliberately preserved `importPage`, the Nextra theme wrapper, the docs layout, the blog post loader, and package/config state.

`bun typecheck` still emits the current Nextra shallow-clone warning while compiling because Nextra rendering remains in place. That warning is expected until later slices remove Nextra.

## Remaining Risks

The next slice must not remove packages or edit lockfiles. Package cleanup remains blocked until docs and blog rendering no longer import Nextra.

The next slice must not rewrite docs copy or change public docs URLs. `/docs`, `/docs/local-setup`, nested docs routes, docs metadata, sitemap entries, docs disabled-state behavior, and docs navigation ordering remain release-sensitive.

The next slice must not absorb blog rendering. Blog replacement is a separate child ExecPlan because blog has different frontmatter, content components, structured data, and TOC behavior.

The next slice must preserve the app-owned inventory contract. If docs rendering needs inventory shape changes, it should update the completed inventory API carefully and rerun the inventory tests rather than creating a parallel docs-only discovery path.

## Next Child ExecPlan

The next active child ExecPlan is `docs/exec-plans/active/2026-04-27-replace-docs-nextra-rendering.md`.

Before implementation, grill that plan against this planning brief and the completed inventory API. The grill should verify that docs rendering consumes `apps/web/app/_content/public-content-inventory.ts`, keeps `apps/web/app/docs/_lib/docs-metadata.ts` as the metadata output boundary unless a concrete reason appears, and does not touch blog rendering or package cleanup.

## Next Slice Validation

The docs rendering slice should prove `/docs` and `/docs/local-setup` through focused tests and browser smoke. It should include an import scan showing docs runtime files no longer import `nextra/pages`, `nextra/page-map`, `nextra-theme-docs`, `nextra-theme-docs/style.css`, or `nextra/icons`, while package dependencies may remain until the later cleanup slice.

It must rerun the inventory and docs path tests if it changes the inventory API:

    bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/docs-page-paths.test.ts tests/unit/public-metadata-routes.test.ts tests/unit/docs-metadata.test.ts

It must also run the required planning validation after any plan edits:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-27-replace-docs-nextra-rendering.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs docs/exec-plans/active/2026-04-27-replace-docs-nextra-rendering.md
