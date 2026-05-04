---
title: Harden Public Metadata Routes
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Slim sitemap and docs route dependencies while making docs catch-all behavior explicit.
post_build_recap: Sitemap now reads public docs and blog route metadata from a filesystem-only public content index instead of Nextra/blog rendering loaders, and the docs catch-all route explicitly exports its dynamic params behavior. Focused sitemap proof passes; full build/typecheck are blocked by unrelated dirty codebase-flow type errors.
read_when:
  - Resuming the public metadata route hardening slice.
  - Changing sitemap or docs catch-all route behavior.
program_id: sbs-runtime-boundary-hardening
planning_brief: docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md
---

# Harden Public Metadata Routes

This is a living execution plan. Keep it current as implementation, proof, and discoveries change public metadata route behavior.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Public metadata routes should be boring, explicit, and light. After this slice, sitemap generation depends only on metadata it needs, docs catch-all behavior is explicit, and focused build-backed proof covers `/sitemap.xml` and a representative docs route.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md`.
- [x] 2026-04-24 EDT: Inspected current sitemap and docs catch-all dependencies. `apps/web/app/sitemap.ts` imported `getPublishedBlogPostSummaries` and docs Nextra page-path generation just to emit URL and last-modified metadata.
- [x] 2026-04-24 EDT: Added `apps/web/features/public-metadata/server/content-route-index.ts` as a filesystem-only public route metadata index for docs and published blog pages.
- [x] 2026-04-24 EDT: Updated `apps/web/app/sitemap.ts` to consume the lightweight public metadata index and avoid importing blog rendering/frontmatter records or docs Nextra static-param helpers.
- [x] 2026-04-24 EDT: Made `apps/web/app/docs/[[...mdxPath]]/page.tsx` catch-all behavior explicit with `export const dynamicParams = true`.
- [x] 2026-04-24 EDT: Added `apps/web/tests/unit/public-metadata-routes.test.ts` to prove `/sitemap.xml` includes `/docs/local-setup` and the published blog post with last-modified metadata.
- [x] 2026-04-24 EDT: Validation recorded. Focused sitemap test and lint passed. Build/typecheck compiled successfully but failed during TypeScript checking on unrelated dirty codebase-flow files.

## Surprises & Discoveries

The source brief identified public metadata dependency graph risk, and the current sitemap did pull in heavier content loaders than it needed. `getPublishedBlogPostSummaries` imports `server-only`, React `cache`, Nextra `importPage`, and blog rendering record logic. `generateDocsStaticParams` comes from `features/docs/server/page-paths`, which imports Nextra route generation. Sitemap only needs public pathnames and filesystem mtimes, so it now gets those from a narrower filesystem index.

The local `apps/web/node_modules/next/dist/docs/` guide path was not present. I checked the official Next.js sitemap and route segment config docs for the current App Router contract: `sitemap.ts` can export a default function returning `MetadataRoute.Sitemap`, and `dynamicParams` is a route segment config with default `true`.

## Decision Log

Decision: Preserve public behavior while reducing route dependency risk.
Rationale: This is a runtime hardening slice, not a product route strategy or content redesign.
Date: 2026-04-24

Decision: Keep docs catch-all dynamic params explicitly enabled.
Rationale: The current route supports the optional catch-all docs module state and on-demand docs behavior. Exporting `dynamicParams = true` makes that behavior explicit without changing public routing.
Date: 2026-04-24

## Outcomes & Retrospective

Completed on 2026-04-24. Sitemap now uses `apps/web/features/public-metadata/server/content-route-index.ts` to list docs and blog `.mdx` files, filter draft blog posts, compute route pathnames, and attach last-modified dates. `apps/web/app/sitemap.ts` no longer imports `features/blog/server/blog-posts`, `features/blog/server/page-paths`, `features/docs/server/page-paths`, or `nextra/pages`.

The docs catch-all route now explicitly exports `dynamicParams = true`, preserving the current optional catch-all behavior while removing reliance on the implicit default.

## Context and Orientation

The relevant public route files are `apps/web/app/sitemap.ts` and `apps/web/app/docs/[[...mdxPath]]/page.tsx`. Sitemap should use only the URL and last-modified data needed to emit public metadata. Docs catch-all behavior should be explicit so the route does not rely on hidden defaults.

### In Scope

In scope is slimming sitemap dependencies, introducing a lightweight metadata helper if the current imports pull in heavy rendering or private runtime graphs, and making docs catch-all behavior explicit.

### Out Of Scope

Out of scope is changing marketing copy, changing the canonical product route model, redesigning docs chrome, replacing the docs content system, or changing customer-facing generated docs.

## Plan of Work

Start by reading the sitemap and docs catch-all route. Use `rg` to identify the imports and any helpers that pull in Nextra rendering, customer repo generation, entitlement, or other private runtime graphs. If sitemap needs data from heavy modules, introduce a lightweight route-metadata or filesystem-index helper and have sitemap consume that. Then make the docs catch-all route's static or dynamic behavior explicit in the route file using the Next.js version's local docs if App Router route config changes are required.

## Milestones

Milestone 1 maps dependencies. At the end, the plan records which imports are safe and which are too heavy for public metadata.

Milestone 2 slims sitemap. At the end, sitemap imports only the lightweight data needed for public URLs and last-modified values.

Milestone 3 makes docs behavior explicit. At the end, the docs catch-all route documents its runtime behavior in code through the appropriate route config or generated params.

Milestone 4 validates public routes. At the end, focused tests, build-backed checks, or route probes cover `/sitemap.xml` and `/docs/local-setup`.

## Concrete Steps

1. Confirm the worktree and inspect route files:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short
       sed -n '1,240p' apps/web/app/sitemap.ts
       sed -n '1,260p' 'apps/web/app/docs/[[...mdxPath]]/page.tsx'

2. Inspect import dependencies:

       rg -n "from .*docs|from .*blog|from .*nextra|generateStaticParams|dynamicParams|revalidate|dynamic" apps/web/app/sitemap.ts 'apps/web/app/docs/[[...mdxPath]]/page.tsx' apps/web/features apps/web/lib

3. Add a lightweight metadata helper only if the route currently imports heavy rendering or private runtime graphs.

4. Make docs catch-all behavior explicit and preserve current public docs behavior.

5. Run focused validation and record the exact results in this plan.

## Validation and Acceptance

This slice is complete when sitemap imports are intentionally lightweight, docs catch-all behavior is explicit, `/sitemap.xml` and `/docs/local-setup` are covered by focused proof, and public content behavior is preserved.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       bun run --cwd apps/web typecheck
       bun run --cwd apps/web build
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-harden-public-metadata-routes.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-24-harden-public-metadata-routes.md
       git diff --check

If implementation adds focused route tests or uses a local route probe instead of a full build, record the exact commands and observed routes before closing the plan.

### Validation Results

Commands run from `/Users/parkerrex/Developer/ship-by-sunday`:

       rg -n "features/blog/server/blog-posts|features/docs/server/page-paths|nextra/pages" apps/web/app/sitemap.ts apps/web/features/public-metadata/server/content-route-index.ts; test $? -eq 1

Result: passed. No heavy blog/docs/Nextra route-loader imports remain in sitemap or the public metadata index.

       bun run --cwd apps/web test:unit -- tests/unit/public-metadata-routes.test.ts

Result: passed. 1 test file and 1 test passed. The test proves sitemap output includes `http://localhost:3000/docs/local-setup`, `http://localhost:3000/blog/the-operating-system-beats-the-prompt`, and a `Date` last-modified value for `/docs/local-setup`.

       node_modules/oxfmt/bin/oxfmt -c .oxfmtrc.json --check apps/web/features/public-metadata/server/content-route-index.ts apps/web/tests/unit/public-metadata-routes.test.ts apps/web/app/sitemap.ts 'apps/web/app/docs/[[...mdxPath]]/page.tsx'

Result: passed. All touched metadata-route files use the correct format.

       bun run format:check

Result: failed on unrelated dirty files outside this slice: `apps/web/features/codebase-flow/lib/codebase-page-validation-model.ts` and `apps/web/features/course/lesson/workbench/fields/checklist-field-rows.tsx`.

       bun run lint

Result: passed. Found 0 warnings and 0 errors.

       bun run --cwd apps/web build

Result: failed on unrelated dirty codebase-flow TypeScript after Next compiled successfully. Error: `apps/web/features/codebase-flow/components/codebase-page-progress-sidebar.tsx:4` imports missing `CodebasePageSectionStatus` from `@/features/codebase-flow/hooks/use-codebase-page-state`.

       bun run typecheck

Result: failed on unrelated dirty codebase-flow TypeScript after Next compiled successfully. Error: `apps/web/features/codebase-flow/hooks/use-codebase-page-state.ts:71` cannot find name `CodebaseStepInlineFeedback`.

       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-harden-public-metadata-routes.md

Result: passed. The completed child ExecPlan linted `ok`.

       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-harden-public-metadata-routes.md docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/program.md docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/dependency-graph.md

Result: passed. The completed child ExecPlan and Program document linted `ok`; the dependency graph path produced no lint error.

       bun run programs:lint

Result: passed. Program docs, packets, and prompt inventory all linted `ok`.

       git diff --check

Result: passed.

## Idempotence and Recovery

The dependency slimming should be reversible by returning sitemap to its previous imports if build proof fails. If the correct Next.js route config is unclear, read the local `apps/web/node_modules/next/dist/docs/` guide before editing route behavior.

## Artifacts and Notes

Program source:

       docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md

High-signal files:

       apps/web/app/sitemap.ts
       apps/web/app/docs/[[...mdxPath]]/page.tsx

## Interfaces and Dependencies

This plan depends on Next App Router metadata route behavior, the app's docs content loader, and the web app build or route-test proof available at implementation time.
