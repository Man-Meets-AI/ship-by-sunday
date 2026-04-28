# Plan Split Recommendation

## Recommended Child ExecPlans

Create five child ExecPlans under `docs/exec-plans/active/`:

1. `2026-04-27-build-docs-blog-content-inventory-and-route-model.md`
2. `2026-04-27-replace-docs-nextra-rendering.md`
3. `2026-04-27-replace-blog-nextra-rendering.md`
4. `2026-04-27-remove-nextra-config-packages-and-starter-assumptions.md`
5. `2026-04-27-harden-public-docs-blog-release-proof.md`

## Split Rationale

The split follows the real dependency order instead of grouping unrelated work for speed. Inventory comes first because later rendering slices need the same route, metadata, `_meta.ts`, draft, and TOC contract. Docs and blog rendering are separate because they have different UI shells, frontmatter schemas, and proof surfaces. Package cleanup is separate because it should only remove dependencies after import scans are clean. Release hardening is separate because public route and metadata proof should run against the final dependency state.

## Strongest First Slice

Start with `2026-04-27-build-docs-blog-content-inventory-and-route-model.md`.

This slice does not change runtime rendering. It gives the app an owned content contract that can be compared against current Nextra behavior before any public page changes.

## Deferral Boundaries

Do not combine package removal with docs or blog rendering replacement. That would make failures harder to attribute.

Do not combine release proof with package cleanup. The release proof should validate the final state after cleanup, not an intermediate state.

Do not split starter assumptions out of package cleanup unless implementation proves compiler updates are larger than expected. Starter assumptions are blocked on the final content/rendering shape.
