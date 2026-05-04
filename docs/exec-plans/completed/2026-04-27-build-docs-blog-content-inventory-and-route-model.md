---
title: Build Docs And Blog Content Inventory And Route Model
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Create an app-owned inventory for docs and blog content so later slices can replace Nextra without changing runtime rendering first.
post_build_recap: Added a server-only public content inventory, moved docs and blog static-param discovery off Nextra, kept rendering unchanged, and proved the route model with focused inventory, docs, blog, sitemap, lint, format, and typecheck validation.
program_id: remove-nextra-docs-runtime
planning_brief: docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-1.md
read_when:
  - Starting the first implementation slice for the Nextra removal Program.
  - Updating docs or blog content route discovery.
  - Validating that later rendering slices have one shared content contract.
---

# Build Docs And Blog Content Inventory And Route Model

This document is a living execution plan for the first implementation slice of the Nextra removal Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

This slice creates the app-owned source of truth for docs and blog content while the current Nextra rendering path remains active. After this slice, the app can answer which docs and blog routes exist, which frontmatter fields are valid, how `_meta.ts` files order docs navigation, which pages are draft or disabled, and which headings feed a table of contents without asking Nextra.

The visible site should behave exactly as it does before this slice. The proof is focused tests that compare the new inventory and route model to the current content corpus and existing metadata behavior.

## Progress

- [x] 2026-04-27 EDT: Program research confirmed that both docs and blog depend on Nextra today.
- [x] 2026-04-27 EDT: This ExecPlan was created from `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-1.md`.
- [x] 2026-04-27 EDT: Grilled the plan with the `exec-plan-griller` standard and tightened the inventory module path, API contract, route-helper sequencing, and validation commands.
- [x] 2026-04-27 EDT: Implemented `apps/web/app/_content/public-content-inventory.ts`, wired sitemap discovery and docs/blog static-param helpers to the inventory, and added focused inventory plus route-helper tests.
- [x] 2026-04-27 EDT: Ran the route-discovery Nextra import scan and focused unit tests successfully.
- [x] 2026-04-27 EDT: Ran `bun lint`, `bun typecheck`, and `bun run format` successfully.

## Surprises & Discoveries

The requested app-local Next docs path `apps/web/node_modules/next/dist/docs/` is absent in this Bun workspace. The relevant Next.js docs were read from the hoisted `node_modules/next/dist/docs/` location.

The blog is part of the dependency removal because `apps/web/app/blog/_server/blog-posts.ts`, `apps/web/app/blog/_server/page-paths.ts`, and `apps/web/app/blog/_lib/blog-toc.ts` import Nextra surfaces.

The app already has an `apps/web/app/_content/` convention for shared content constants, so the shared inventory should live there instead of under the metadata route folder. `apps/web/app/_metadata/content-route-index.ts` should become a consumer of the inventory, not the owner of the canonical content discovery logic.

Docs `_meta.ts` files include separator-only keys such as `getRunning`, `buildYourProduct`, `aiWorkflow`, and `reference`. The implementation must not treat every `_meta.ts` key as a routable page.

`bun typecheck` still prints the current Nextra shallow-clone warning while compiling because this slice intentionally leaves Nextra rendering in place for later slices. The warning is not a failure for this slice.

## Decision Log

Decision: This slice must be additive and must not change docs or blog runtime rendering. Rationale: it gives later slices a stable contract while current Nextra behavior remains available for comparison. Date: 2026-04-27.

Decision: Keep `.mdx` as the modeled content extension. Rationale: docs content is markdown-like, but the current blog article imports React components. Date: 2026-04-27.

Decision: Model docs and blog together in one inventory contract. Rationale: both surfaces block Nextra package removal, and separate discovery systems would create drift. Date: 2026-04-27.

Decision: Put the shared inventory in `apps/web/app/_content/public-content-inventory.ts` and keep `apps/web/app/_metadata/content-route-index.ts` as a thin sitemap-oriented adapter. Rationale: `_metadata` should not become the shared runtime owner for docs and blog route discovery. Date: 2026-04-27.

Decision: Replace Nextra static-param discovery in `apps/web/app/docs/_lib/page-paths.ts` and `apps/web/app/blog/_server/page-paths.ts` during this slice, but do not replace MDX rendering or page content import. Rationale: route discovery belongs to this inventory slice and can be proven without changing visible rendering. Date: 2026-04-27.

Decision: Do not add new parsing packages in this slice. Rationale: package changes are intentionally late in the Program; the current frontmatter and heading corpus can be parsed with a small boundary parser that fails loudly on unsupported syntax. Date: 2026-04-27.

## Outcomes & Retrospective

This slice landed the app-owned inventory and route model without changing visible docs or blog rendering. `apps/web/app/_content/public-content-inventory.ts` now owns filesystem discovery, scalar frontmatter validation, docs and blog route records, `_meta.ts` navigation modeling, heading extraction, draft filtering, and last-modified data. `apps/web/app/_metadata/content-route-index.ts` now consumes that inventory for sitemap entries instead of maintaining a separate content walker.

Docs and blog static-param helpers no longer import `generateStaticParamsFor`. `apps/web/app/docs/_lib/page-paths.ts` and `apps/web/app/blog/_server/page-paths.ts` keep their existing helper APIs and delegate route discovery to the inventory through dynamic imports so pure path helpers remain usable by metadata helpers and tests.

The slice intentionally leaves docs and blog MDX rendering on Nextra. Remaining Nextra imports in `apps/web/app/docs/[[...mdxPath]]/page.tsx`, `apps/web/app/blog/_server/blog-posts.ts`, theme shell code, and config belong to the later child ExecPlans.

## Context and Orientation

The current docs route gets paths from `apps/web/app/docs/_lib/page-paths.ts`, which calls Nextra's `generateStaticParamsFor`. The current blog route gets paths from `apps/web/app/blog/_server/page-paths.ts`, which also calls `generateStaticParamsFor`. This slice should replace those two static-param discovery imports with the app-owned inventory while leaving docs and blog MDX rendering on the current Nextra path.

The new inventory should live at `apps/web/app/_content/public-content-inventory.ts`. It should import `server-only` because it reads from the filesystem and is never meant for client components. Unit tests that import it must mock `server-only` the same way existing metadata tests do.

`apps/web/app/_metadata/content-route-index.ts` already has a lightweight filesystem reader for sitemap entries. After this slice, it should call the new inventory and map inventory records into sitemap records instead of maintaining a second MDX walker and frontmatter parser.

`_meta.ts` files live in `apps/web/content/docs/_meta.ts`, `apps/web/content/docs/troubleshooting/_meta.ts`, and `apps/web/content/blog/_meta.ts`. They should be treated as route/navigation metadata, not ignored.

Next.js route params for optional catch-all pages are promise-backed in this repo's Next version. The inventory should expose plain app-owned values such as `segments: string[]`, `slug: string[]`, `pathname: string`, and `sourcePath: string`; route pages adapt promise params at their own boundaries.

The inventory should parse only the frontmatter syntax that the current corpus uses: a leading `---` block with single-line scalar values that become strings or booleans. Missing required frontmatter, malformed delimiter blocks, arrays, objects, multiline values, or unsupported scalar values should throw an error that names the source file. Do not silently default bad content.

Heading extraction should support current Markdown ATX headings, ignore fenced code blocks, and return app-owned heading objects with stable slug IDs. If the implementation finds headings that cannot be represented with this parser, stop and update this plan before widening the parser.

### In Scope

This slice owns a repo-owned docs and blog content inventory, frontmatter validation for existing docs and blog requirements, route path normalization, `_meta.ts` navigation ordering, draft handling for blog content, heading extraction data that later slices can use for a table of contents, and static-param discovery in the docs and blog page-path helpers.

It also owns focused tests for the inventory, a new docs page-path test, updates to `apps/web/tests/unit/blog-page-paths.test.ts` so it no longer mocks `nextra/pages`, and updates to `apps/web/app/_metadata/content-route-index.ts` so sitemap discovery uses the same inventory.

### Out Of Scope

Do not change `/docs` page rendering, docs layout rendering, blog page rendering, Nextra config, packages, lockfile entries, docs theme CSS, content copy, public URLs, Stripe, checkout, billing, environment behavior, Convex files, codebase compiler schema, or generated mirrors.

Do not remove `nextra` or `nextra-theme-docs` in this slice.

## Plan of Work

Start by mapping the current content corpus and tests. Read `apps/web/app/_metadata/content-route-index.ts`, `apps/web/app/docs/_lib/page-paths.ts`, `apps/web/app/blog/_server/page-paths.ts`, `apps/web/app/blog/_server/blog-posts.ts`, docs metadata tests, public metadata route tests, and blog page path tests.

Add `apps/web/app/_content/public-content-inventory.ts`. It should read docs and blog MDX files from `apps/web/content`, parse frontmatter at the boundary, normalize index routes, record source paths, record public paths, track draft state, read `_meta.ts` ordering, and extract heading text and depth for future TOC rendering. Keep the API narrow and domain-named.

Expose functions with names close to these contracts:

    getDocsContentEntries(): Promise<DocsContentEntry[]>
    getDocsNavigationEntries(): Promise<DocsNavigationEntry[]>
    getPublishedBlogContentEntries(): Promise<BlogContentEntry[]>
    getAllBlogContentEntries(): Promise<BlogContentEntry[]>

Use plain app-owned types close to these shapes:

    type PublicContentHeading = { id: string; depth: 2 | 3 | 4; text: string };
    type DocsContentEntry = { kind: "docs"; segments: string[]; pathname: string; sourcePath: string; title: string; description: string; headings: PublicContentHeading[] };
    type BlogContentEntry = { kind: "blog"; slug: string[]; pathname: string; sourcePath: string; title: string; description: string; summary: string; publishedAt: string; authorName: string; authorRole: string; featured?: boolean; draft?: boolean; heroMediaKind: "image" | "video"; heroMediaSrc: string; heroPosterSrc?: string; headings: PublicContentHeading[] };

The exact type names can change if the implementation finds a clearer local name, but the shape must stay explicit enough for later docs rendering, blog rendering, metadata, sitemap, and tests to consume without importing Nextra.

Make `apps/web/app/_metadata/content-route-index.ts` consume the new inventory so sitemap output uses the same source of truth. Preserve its public exports unless there is a compelling local reason to rename them and update all current callers.

Update `apps/web/app/docs/_lib/page-paths.ts` and `apps/web/app/blog/_server/page-paths.ts` so `generateDocsStaticParams` and `generateBlogStaticParams` read from the inventory instead of `generateStaticParamsFor`. Preserve existing helper outputs such as `getDocsPagePath`, `getDocsSourcePath`, `normalizeBlogSlug`, `getBlogPagePath`, and `getBlogSourcePath`.

Add focused tests that prove the current docs and blog corpus. Tests should cover `/docs`, `/docs/local-setup`, at least one nested troubleshooting docs page, `/blog`, the current published blog article, draft filtering behavior, frontmatter validation, `_meta.ts` ordering, and heading extraction for docs and blog.

## Milestones

Milestone 1 creates `apps/web/app/_content/public-content-inventory.ts` and tests it against the current content corpus. Success means tests list docs and blog routes, validate frontmatter, preserve `_meta.ts` ordering, and extract headings without importing Nextra.

Milestone 2 wires the inventory into `apps/web/app/_metadata/content-route-index.ts`, `apps/web/app/docs/_lib/page-paths.ts`, and `apps/web/app/blog/_server/page-paths.ts` without changing page rendering. Success means sitemap, docs metadata, docs page-path, and blog page-path tests pass.

Milestone 3 removes obsolete `nextra/pages` mocks from route-path tests and records the remaining Nextra imports as intentionally deferred rendering imports. Success means route discovery no longer depends on `generateStaticParamsFor`, while `importPage` remains only in the later docs and blog rendering slices.

## Concrete Steps

From `/Users/parkerrex/Developer/ship-by-sunday`, inspect the current route and metadata surfaces:

    rg -n "nextra|generateStaticParamsFor|content-route-index|buildDocsMetadata|BlogPost" apps/web/app apps/web/tests/unit

Create `apps/web/app/_content/public-content-inventory.ts` with domain-specific names such as `getDocsContentEntries`, `getPublishedBlogContentEntries`, `getDocsNavigationEntries`, `DocsContentEntry`, `BlogContentEntry`, and `PublicContentHeading`. Avoid vague names like `data`, `helper`, or `utils`.

Add focused unit tests under `apps/web/tests/unit/` for the inventory. Use `apps/web/tests/unit/public-content-inventory.test.ts` unless the implementation finds a more precise local name. Expected observations should include `/docs`, `/docs/local-setup`, `/docs/troubleshooting/access`, `/blog`, and `/blog/the-operating-system-beats-the-prompt`.

Add `apps/web/tests/unit/docs-page-paths.test.ts` for docs route helpers. Update `apps/web/tests/unit/blog-page-paths.test.ts` so it no longer mocks `nextra/pages`.

Update `apps/web/app/_metadata/content-route-index.ts` to map inventory entries into sitemap entries and keep `apps/web/tests/unit/public-metadata-routes.test.ts` passing.

Run an import scan that proves route discovery no longer imports `generateStaticParamsFor` while later rendering imports remain deferred:

    bash -lc '! rg -n "generateStaticParamsFor" apps/web/app/docs/_lib/page-paths.ts apps/web/app/blog/_server/page-paths.ts apps/web/tests/unit/blog-page-paths.test.ts apps/web/tests/unit/docs-page-paths.test.ts'

Run the focused tests before broad checks. If a test exposes a content feature that the research missed, update this ExecPlan and the Program research artifacts before continuing.

## Validation and Acceptance

This slice is accepted when the app has a tested content inventory that lists docs and blog routes without Nextra, validates the current frontmatter shape, preserves `_meta.ts` ordering inputs, extracts heading data for TOC, updates docs and blog static-param helpers to stop using `generateStaticParamsFor`, keeps sitemap output stable, and does not change docs or blog MDX rendering.

The final diff for this slice should not modify `apps/web/next.config.ts`, `apps/web/mdx-components.tsx`, docs layout rendering, blog page rendering, packages, lockfile entries, compiler schema, Convex files, or billing-sensitive code.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` after implementation:

    bash -lc '! rg -n "generateStaticParamsFor" apps/web/app/docs/_lib/page-paths.ts apps/web/app/blog/_server/page-paths.ts apps/web/tests/unit/blog-page-paths.test.ts apps/web/tests/unit/docs-page-paths.test.ts'
    bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/docs-page-paths.test.ts tests/unit/blog-page-paths.test.ts tests/unit/public-metadata-routes.test.ts tests/unit/docs-metadata.test.ts
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-build-docs-blog-content-inventory-and-route-model.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs docs/exec-plans/completed/2026-04-27-build-docs-blog-content-inventory-and-route-model.md
    git diff --check

## Idempotence and Recovery

The inventory should be deterministic and safe to run repeatedly. If a filesystem read fails, tests should fail loudly with the missing path instead of hiding the problem with fallback content.

Because the inventory reads local files, keep filesystem access inside the server-only inventory module and pure parser helpers. Do not import the inventory from client components.

If implementation starts to require rendering changes, stop and move that work to the docs or blog rendering ExecPlan. If package changes become necessary, stop and move them to the package cleanup ExecPlan.

If the current scalar frontmatter parser cannot represent an existing file, stop and record the exact unsupported syntax before adding a dependency. New parsing packages are out of scope for this slice unless the Program is updated first.

## Artifacts and Notes

Current research found 32 docs MDX files, one blog MDX file, three `_meta.ts` files, one docs table, several blockquotes, and one blog article with MDX imports. Treat these as seed observations and regenerate them through tests or scripts during implementation.

`apps/web/app/_metadata/content-route-index.ts` is the strongest existing reference for filesystem discovery, but it should become a consumer of the inventory because it cannot model `_meta.ts`, rich blog frontmatter, or TOC data by itself.

The current docs `_meta.ts` includes separator keys that are not pages. Tests should prove those separators appear in the navigation model but do not create route params.

Validation evidence from 2026-04-27:

    bash -lc '! rg -n "generateStaticParamsFor" apps/web/app/docs/_lib/page-paths.ts apps/web/app/blog/_server/page-paths.ts apps/web/tests/unit/blog-page-paths.test.ts apps/web/tests/unit/docs-page-paths.test.ts'
    exited 0

    bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/docs-page-paths.test.ts tests/unit/blog-page-paths.test.ts tests/unit/public-metadata-routes.test.ts tests/unit/docs-metadata.test.ts
    5 files passed, 13 tests passed

    bun lint
    Found 0 warnings and 0 errors.

    bun typecheck
    compiled, ran TypeScript, collected page data, and generated 71 static pages successfully

    bun run format
    finished successfully across apps/web files

## Interfaces and Dependencies

The inventory interface should expose plain app-owned route and content metadata objects from `apps/web/app/_content/public-content-inventory.ts`. Later slices should be able to use those objects from docs pages, blog pages, metadata routes, and sitemap code without importing Nextra.

`apps/web/app/docs/_lib/page-paths.ts` and `apps/web/app/blog/_server/page-paths.ts` should remain the public route-helper interfaces for their route segments. They should delegate discovery to the inventory and keep their existing public helper names so current imports keep working.

The slice may use existing repo dependencies. New parsing dependencies should be avoided unless the implementer proves the current toolchain cannot parse the needed frontmatter or headings safely. If a new package is required, pause and update the Program because package changes were intended for a later slice.
