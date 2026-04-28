---
title: Remove Nextra Docs Runtime Planning Brief
program_id: remove-nextra-docs-runtime
brief_version: 1
status: superseded
summary: Split the Nextra removal into inventory, docs rendering, blog rendering, package cleanup, and release-hardening slices.
read_when:
  - Writing or revising child ExecPlans for the Nextra removal Program.
  - Choosing the next implementation slice.
  - Validating that package removal is safe.
---

# Remove Nextra Docs Runtime Planning Brief

## Objective

Remove the app's runtime dependency on `nextra` and `nextra-theme-docs` while preserving public docs and blog URLs, metadata, sitemap behavior, disabled docs states, and starter repository assumptions.

## Current Facts

Nextra is used by docs and blog. Docs imports cover config, MDX components, page import, page-map, theme layout, theme CSS, nav/footer/theme components, static params, metadata wrapper data, and CSS selectors. Blog imports cover page import, static params, rich frontmatter content loading, reading-time metadata, TOC data, and a `nextra` heading type.

The docs corpus is currently MDX but does not import custom MDX components. The blog corpus currently has one MDX article that imports `BlogSplitHero` and `BlogSplitSection`, so the Program should keep MDX support instead of converting the whole content system to plain markdown.

The existing metadata route index in `apps/web/app/_metadata/content-route-index.ts` is a useful reference but not a complete replacement for page rendering, `_meta.ts` navigation, rich frontmatter validation, or TOC extraction.

## Required Plan Split

Use five child ExecPlans in this order:

1. Build the repo-owned docs and blog content inventory and route model without changing runtime rendering.
2. Replace `/docs` Nextra loading, theme shell, page map, TOC, and CSS with app-owned rendering.
3. Replace blog Nextra loading, route discovery, frontmatter import, and TOC typing with app-owned rendering.
4. Remove Nextra config, packages, lockfile entries, CSS leftovers, and starter assumptions after import scans are clean.
5. Run release-hardening proof for public docs and blog behavior.

## Strongest First Slice

The first implementation slice is the content inventory and route model. It should be additive, test-backed, and should not change runtime rendering. It must make later docs and blog rendering slices consume the same content contract instead of inventing parallel discovery logic.

## Boundary Rules

Do not change public docs or blog URLs.

Do not rewrite content copy except for minimal syntax fixes required by the migration.

Do not touch Stripe, checkout, webhook, pricing, promo code, billing proof, environment behavior, Convex schema, generated Convex files, blueprint compiler schema, or blueprint compiler facts.

Do not remove `nextra` or `nextra-theme-docs` until all runtime imports, tests, config hooks, CSS dependencies, and starter assumptions are gone or intentionally updated.

## Validation Shape

Each child ExecPlan should run focused tests for the touched surface before broad validation. Program-level proof must include docs tests, blog tests when blog is touched, metadata and sitemap tests, browser smoke for `/docs` and `/docs/local-setup`, `bun lint`, `bun typecheck`, package and lockfile validation when dependencies change, `bun run plans:lint -- --plan <plan>`, `bun run programs:lint`, `bun run markdown:lint -- --paths docs/programs docs/exec-plans/active/<plan>.md`, and `git diff --check`.
