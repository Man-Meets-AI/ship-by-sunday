---
title: Remove Nextra Config Packages And Starter Assumptions
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Remove Nextra configuration, dependencies, lockfile entries, theme leftovers, and starter assumptions after docs and blog imports are gone.
post_build_recap: Removed the Nextra config wrapper and package dependencies, added official Next MDX dependencies, updated starter Next-docs path assumptions, and verified docs/blog rendering still builds through app-owned loaders.
program_id: remove-nextra-docs-runtime
planning_brief: docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-1.md
read_when:
  - Removing Nextra packages after docs and blog runtime replacement.
  - Updating starter repository assumptions for docs rendering.
  - Validating package and lockfile cleanup.
---

# Remove Nextra Config Packages And Starter Assumptions

This document is a living execution plan for the cleanup slice that removes Nextra only after runtime usage is gone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

This slice removes the Nextra build hook, direct app dependencies, lockfile entries, theme CSS leftovers, and starter repository assumptions after docs and blog runtime imports have already been replaced. The goal is a clean dependency state that matches the app-owned docs and blog rendering path.

Users should not see public behavior change in this slice. The proof is import scans, package validation, focused docs and blog tests, compiler starter contract tests, lint, and typecheck.

## Progress

- [x] 2026-04-27 EDT: Program research identified package, config, CSS, and starter assumption surfaces.
- [x] 2026-04-27 EDT: This ExecPlan was created from `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-1.md`.
- [x] 2026-04-27 EDT: Docs rendering replacement landed in `docs/exec-plans/completed/2026-04-27-replace-docs-nextra-rendering.md`.
- [x] 2026-04-27 EDT: Blog rendering replacement landed in `docs/exec-plans/completed/2026-04-27-replace-blog-nextra-rendering.md`.
- [x] 2026-04-27 EDT: Grilled against `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-4.md`; the plan now names the official `@next/mdx` replacement hook, `remark-frontmatter`, and the `mdx-components.tsx` keep decision.
- [x] 2026-04-27 EDT: Replaced `apps/web/next.config.ts` Nextra wrapping with `@next/mdx` plus `remark-frontmatter`; kept the existing output tracing, Turbopack ignore, transpile packages, and image config.
- [x] 2026-04-27 EDT: Removed `nextra` and `nextra-theme-docs` through Bun, added `@next/mdx@16.2.0`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, and `remark-frontmatter`, and validated the frozen lockfile.
- [x] 2026-04-27 EDT: Kept `apps/web/mdx-components.tsx` and its local `apps/web/mdx.d.ts` module declaration because the app-owned MDX render path needs them.
- [x] 2026-04-27 EDT: Updated starter generation guidance from `apps/web/node_modules/next/dist/docs/` to the hoisted `node_modules/next/dist/docs/` path.
- [x] 2026-04-27 EDT: Runtime import scans, package scans, focused docs/blog tests, compiler starter tests, lint, and typecheck passed.

## Surprises & Discoveries

`packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts` includes `apps/web/mdx-components.tsx` in the customer-safe app file list. Starter rendering code also mentions docs content layout and local Next docs paths. Those assumptions need review after the final rendering shape is known.

`bun.lock` contains many MDX and theme transitive dependencies through Nextra. The final package diff should remove only what is no longer needed and preserve any direct dependencies required by the app-owned renderer.

The completed docs and blog rendering slices still compile because `apps/web/next.config.ts` uses Nextra as the MDX build hook. Removing that wrapper requires an explicit MDX build hook. Local Next 16.2 docs recommend `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, and `@types/mdx`; this repo also needs `remark-frontmatter` because all docs and blog content files keep YAML frontmatter that the inventory parses separately.

## Decision Log

Decision: Package removal is late in the Program. Rationale: dependencies cannot be safely removed until docs and blog imports are gone. Date: 2026-04-27.

Decision: Starter assumptions are part of this cleanup slice, not the docs rendering slice. Rationale: starter-safe paths should reflect the final replacement shape, not an intermediate docs-only state. Date: 2026-04-27.

Decision: Do not change compiler schema or facts in this slice unless explicitly approved later. Rationale: the Program only needs source contract and starter snapshot alignment. Date: 2026-04-27.

Decision: Keep `apps/web/mdx-components.tsx` and continue including it in starter-safe app files. Rationale: App Router MDX requires a root `mdx-components.tsx`, and the completed docs slice now uses it for repo-owned heading IDs and links. Date: 2026-04-27.

Decision: Replace the Nextra config wrapper with the official `@next/mdx` wrapper configured with `remark-frontmatter`, not with a custom compiler. Rationale: direct MDX imports need a maintained Next build integration, while frontmatter should remain in source files for the inventory parser. Date: 2026-04-27.

## Outcomes & Retrospective

This plan removed the Nextra build hook and direct package dependencies. `apps/web/next.config.ts` now uses `@next/mdx` configured with `remark-frontmatter`, and `apps/web/package.json` plus `bun.lock` no longer contain `nextra` or `nextra-theme-docs`.

The direct MDX dependencies retained or added are `@next/mdx@16.2.0`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, and `remark-frontmatter`. The `@next/mdx` version is pinned to the app's `next` version. `apps/web/mdx-components.tsx` remains because App Router MDX requires it, and the local `apps/web/mdx.d.ts` declaration remains because the app package did not pick up root-hoisted `@types/mdx` for alias imports during typecheck.

Starter generation no longer points at `apps/web/node_modules/next/dist/docs/`; it points at `node_modules/next/dist/docs/`, matching the hoisted Bun workspace layout observed during this Program. The customer-safe app file list still includes `apps/web/mdx-components.tsx` because it is part of the final rendering path.

## Context and Orientation

The app package manifest is `apps/web/package.json`. The workspace lockfile is `bun.lock`. Current Nextra config is in `apps/web/next.config.ts`, which wraps the Next config with `nextra`. Current global MDX component bridging is in `apps/web/mdx-components.tsx`.

Starter repository assumptions are in `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts` and related starter rendering surfaces under `packages/codebase-compiler/src/repo-generation/`. These should be updated only to match the final app-owned docs and blog runtime shape.

### In Scope

This slice owns removing `nextra` and `nextra-theme-docs` from `apps/web/package.json`, updating `bun.lock`, removing the Nextra wrapper from `apps/web/next.config.ts`, removing or repurposing `apps/web/mdx-components.tsx` only if the final app-owned renderer no longer needs it, deleting or rewriting Nextra-specific CSS leftovers, updating tests that reference Nextra mocks, and updating starter-safe file assumptions.

It also owns package validation, import scans, focused docs and blog tests, compiler starter contract tests, lint, and typecheck.

### Out Of Scope

Do not replace docs rendering or blog rendering in this slice. Do not rewrite content copy, change public URLs, touch Stripe, checkout, billing, Convex files, compiler schema, compiler facts, generated mirrors without their source path, or release tag behavior.

Do not remove generated mirrors unless the source or generation path is updated in the same approved slice.

## Plan of Work

Start with a clean import scan over app code, tests, and starter generation code. If any runtime imports from Nextra remain, stop and send the work back to the docs or blog rendering ExecPlan.

Remove the Nextra wrapper from `apps/web/next.config.ts` and replace it with `@next/mdx` configured for `.mdx` imports and YAML frontmatter parsing. Keep `mdx-components.tsx` because it is required by App Router MDX and by the repo-owned heading/link mappings.

Update `apps/web/package.json` and `bun.lock` with Bun. Remove `nextra` and `nextra-theme-docs` only after imports are clean. Do not manually edit lockfile sections.

Update starter repository source contract paths and tests only where final assumptions changed. `apps/web/mdx-components.tsx` should remain in the starter-safe file list. The generated Next-docs guidance should point at the hoisted installed docs path if the source currently assumes `apps/web/node_modules/next/dist/docs/`.

## Milestones

Milestone 1 proves no app runtime imports from Nextra remain before dependency removal. Success means import scans are clean or identify only package metadata that this slice owns.

Milestone 2 removes config and dependencies through the package manager while adding only the official direct MDX dependencies needed by the final renderer. Success means `apps/web/package.json` and `bun.lock` no longer contain direct Nextra dependencies and install validation succeeds.

Milestone 3 updates starter assumptions and CSS leftovers. Success means compiler starter tests pass and no Nextra class-name or package references remain outside historical Program or ExecPlan planning documents.

## Concrete Steps

From `/Users/parkerrex/Developer/ship-by-sunday`, run the blocking import scan:

    rg -n "from ['\"]nextra|from ['\"]nextra-theme-docs|nextra/pages|nextra/page-map|nextra/icons|nextra-theme-docs/style.css" apps/web packages/codebase-compiler

If the scan finds runtime imports in docs or blog code, stop. Do not edit packages.

Update `apps/web/next.config.ts` to remove the Nextra wrapper and keep the existing Next config behavior.

Use Bun to remove `nextra` and `nextra-theme-docs`, then add `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, and `remark-frontmatter` if they are not already direct dependencies. Inspect the resulting diff carefully and keep dependency changes limited to what the final renderer requires.

Update starter contract tests and source contract paths only after confirming whether any starter guidance still points at the wrong installed Next docs path. Keep `apps/web/mdx-components.tsx` in the app-owned rendering path.

## Validation and Acceptance

This slice is accepted when `nextra` and `nextra-theme-docs` are gone from the app manifest and lockfile, Nextra config hooks are gone, runtime import scans are clean, focused docs and blog tests still pass, compiler starter contract tests pass, package install validation passes, lint passes, and typecheck passes.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` after implementation:

    rg -n "from ['\"]nextra|from ['\"]nextra-theme-docs|nextra/pages|nextra/page-map|nextra/icons|nextra-theme-docs/style.css" apps/web packages/codebase-compiler
    rg -n "\"nextra\"|\"nextra-theme-docs\"" apps/web/package.json bun.lock
    rg -n "\"@next/mdx\"|\"@mdx-js/loader\"|\"@mdx-js/react\"|\"@types/mdx\"|\"remark-frontmatter\"" apps/web/package.json bun.lock
    bun install --frozen-lockfile
    bun run --cwd apps/web test:unit -- tests/unit/docs-metadata.test.ts tests/unit/docs-disabled-state.test.tsx tests/unit/blog-page-paths.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/public-metadata-routes.test.ts
    bun test packages/codebase-compiler/tests/repo-generation.test.ts packages/codebase-compiler/tests/review-download-zip.test.ts
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-nextra-config-packages-and-starter-assumptions.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs docs/exec-plans/completed/2026-04-27-remove-nextra-config-packages-and-starter-assumptions.md
    git diff --check

## Idempotence and Recovery

Package cleanup must be done with the package manager and reviewed before continuing. If `bun install --frozen-lockfile` fails because the lockfile is stale, run the repo's normal Bun install/update command, inspect the diff, then rerun frozen validation.

If any runtime import remains, restore package changes from this slice only and return to the owning docs or blog rendering ExecPlan.

## Artifacts and Notes

Keep the final import scan in the retrospective. It should exclude only historical planning documents if those documents mention Nextra as the removed dependency.

The final package diff should be narrow. Do not opportunistically upgrade unrelated packages.

Validation results recorded on 2026-04-27 EDT:

- `! rg -n "from ['\"]nextra|from ['\"]nextra-theme-docs|nextra/pages|nextra/page-map|nextra/icons|nextra-theme-docs/style.css" apps/web packages/codebase-compiler`: passed with no matches.
- `! rg -n "\"nextra\"|\"nextra-theme-docs\"" apps/web/package.json bun.lock`: passed with no matches.
- `rg -n "\"@next/mdx\"|\"@mdx-js/loader\"|\"@mdx-js/react\"|\"@types/mdx\"|\"remark-frontmatter\"" apps/web/package.json bun.lock`: passed and showed the direct MDX dependencies.
- `bun install --frozen-lockfile`: passed with no changes.
- `bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/docs-page-paths.test.ts tests/unit/docs-content-loader.test.ts tests/unit/docs-navigation-components.test.tsx tests/unit/docs-metadata.test.ts tests/unit/docs-disabled-state.test.tsx tests/unit/blog-page-paths.test.ts tests/unit/blog-posts.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/public-metadata-routes.test.ts`: 11 files and 26 tests passed.
- `bun test packages/codebase-compiler/tests/repo-generation.test.ts packages/codebase-compiler/tests/review-download-zip.test.ts`: 4 tests passed. The original broad filter `bun test packages/codebase-compiler/src/repo-generation` matched no test files, so the source-adjacent repo-generation tests were run directly.
- `bun lint`: passed with 0 warnings and 0 errors.
- `bun typecheck`: passed and generated 71 static pages, including docs and blog routes, without the previous Nextra shallow-clone warning.

## Interfaces and Dependencies

This slice depends on completed docs rendering and blog rendering replacement.

It touches package manager state, Next config, starter generation contracts, and tests. It must preserve public route behavior and must not change release workflow, billing, Stripe, checkout, Convex, or compiler schema.
