# Converged Decision Packet

## Decision

Proceed with a five-slice Program that removes Nextra from docs and blog in real dependency order:

1. Build a repo-owned docs and blog content inventory plus route model without changing runtime rendering.
2. Replace `/docs` Nextra loading, theme shell, page map, TOC, and CSS with app-owned rendering.
3. Replace blog Nextra loading, route discovery, metadata extraction, and TOC typing with app-owned rendering.
4. Remove Nextra config, packages, lockfile entries, theme leftovers, and starter repository assumptions after import scans are clean.
5. Run release-hardening proof across public docs, blog, sitemap, metadata, browser smoke, lint, typecheck, and package validation.

## Why This Shape

The dependency graph shows that docs and blog both block package removal. Starting with an additive inventory gives later slices a stable contract for frontmatter, route params, `_meta.ts` ordering, draft filtering, and heading extraction while the current Nextra runtime remains available for comparison.

Keeping MDX is the lowest-risk content decision. Docs content currently looks markdown-compatible, but the blog article imports React components, so plain markdown would force content rewrites or split rendering modes.

Package removal is deliberately late. Removing Nextra before docs and blog imports disappear would break the app and hide the actual runtime work behind dependency errors.

## Strongest First Slice

The strongest first implementation slice is `docs/exec-plans/completed/2026-04-27-build-docs-blog-content-inventory-and-route-model.md`.

It is strongest because it is additive, testable, and does not change public runtime rendering. It proves the content corpus and route contract before docs or blog page rendering changes.

## Decisions That Must Not Drift

Public docs and blog URLs must not change.

Docs and blog content copy must not be rewritten except for minimal syntax fixes required by the migration.

Blog remains in scope because it imports Nextra today.

Nextra dependencies remain installed until all runtime imports, tests, config hooks, and starter assumptions are gone.

Compiler schema, compiler facts, Convex files, Stripe, checkout, billing, promo, webhook, and environment behavior remain out of scope.
