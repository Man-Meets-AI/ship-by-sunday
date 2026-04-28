---
title: Harden Public Docs Blog Release Proof
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Prove the migrated docs and blog public routes, metadata, sitemap, browser behavior, packages, lint, and typecheck after Nextra removal.
post_build_recap: Final proof passed for Nextra removal across import/package scans, focused docs/blog/metadata tests, compiler snapshot tests, browser smoke, frozen install, lint, typecheck, planning lint, markdown lint, and diff hygiene.
program_id: remove-nextra-docs-runtime
planning_brief: docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-1.md
read_when:
  - Final-validating the Nextra removal Program.
  - Preparing a release-sensitive public route change for review.
  - Checking browser proof, metadata, sitemap, lint, and typecheck evidence.
---

# Harden Public Docs Blog Release Proof

This document is a living execution plan for the final hardening slice after docs, blog, package, and starter cleanup work lands.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

This slice proves that the Nextra removal is safe for public docs and blog behavior. The previous slices change route discovery, rendering, theme shell, blog loading, package config, and starter assumptions. This slice validates the final integrated state through focused tests, browser smoke, metadata and sitemap checks, package validation, lint, typecheck, Program lint, ExecPlan lint, markdown lint, and diff hygiene.

Users should be able to visit `/docs`, `/docs/local-setup`, `/blog`, and the current blog article and see stable content, navigation, metadata-sensitive titles, and working page layout without Nextra installed.

## Progress

- [x] 2026-04-27 EDT: Program research identified the release-sensitive behavior to preserve.
- [x] 2026-04-27 EDT: This ExecPlan was created from `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-1.md`.
- [x] 2026-04-27 EDT: Inventory, docs rendering, blog rendering, and package cleanup slices are complete.
- [x] 2026-04-27 EDT: Grilled against `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/planning-brief-5.md`; the plan now uses the final completed child-plan paths, web-only dev command, local browser smoke probes, and source-adjacent blueprint compiler tests.
- [x] 2026-04-27 EDT: Final import and package scans passed with no Nextra runtime, package, or lockfile matches.
- [x] 2026-04-27 EDT: Focused docs, blog, metadata, sitemap, and route metadata unit tests passed.
- [x] 2026-04-27 EDT: Blueprint compiler repo-generation and review-download zip tests passed.
- [x] 2026-04-27 EDT: `bun install --frozen-lockfile`, `bun lint`, and `bun typecheck` passed.
- [x] 2026-04-27 EDT: Browser smoke passed for `/docs`, `/docs/local-setup`, `/blog`, and `/blog/the-operating-system-beats-the-prompt` in desktop and mobile viewports.

## Surprises & Discoveries

The current repository release model no longer uses the old shared `dev` release-candidate branch. Public route changes should be prepared as focused feature work into `main`, with CI and post-merge proof following `docs/release-workflow.md`.

This Program does not touch billing-sensitive behavior, so billing proof is not part of the required validation unless a later implementation unexpectedly changes checkout, entitlement, Stripe, promo, webhook, or environment behavior.

## Decision Log

Decision: Keep final hardening separate from package cleanup. Rationale: release proof should validate the final dependency state after Nextra config and packages are removed. Date: 2026-04-27.

Decision: Browser smoke must cover `/docs` and `/docs/local-setup` at minimum. Rationale: the docs shell, sidebar, TOC, nested routes, and content rendering are the highest-risk public surfaces. Date: 2026-04-27.

Decision: Include blog browser smoke if blog was touched, which this Program expects. Rationale: blog Nextra removal is part of the dependency graph. Date: 2026-04-27.

## Outcomes & Retrospective

Final hardening passed. There is no Nextra runtime dependency remaining in active app or blueprint-compiler code, and `apps/web/package.json` plus `bun.lock` no longer contain `nextra` or `nextra-theme-docs`.

Browser smoke covered desktop `1280x900` and mobile `390x844` viewports for `/docs`, `/docs/local-setup`, `/blog`, and `/blog/the-operating-system-beats-the-prompt`. The docs smoke verified title, H1, body content, sidebar, desktop TOC visibility, mobile TOC hiding, and theme toggle application. The blog smoke verified title, H1, expected body content, and article contents rail behavior. The dev server logged the existing local Clerk development-key/session-refresh warning, but no Nextra warning and no docs/blog hydration warning appeared during the final run.

No validation checks were skipped. The broad `bun typecheck` build generated 71 static pages, including `/docs` plus nested docs pages and `/blog` plus the current article.

## Context and Orientation

By the time this slice starts, docs and blog should render through app-owned code, and package cleanup should have removed `nextra` and `nextra-theme-docs` from app dependencies and lockfile. This slice should not implement new rendering behavior. It validates and fixes only defects found while proving the final state.

Relevant surfaces include `apps/web/app/docs`, `apps/web/app/blog`, `apps/web/app/_metadata/content-route-index.ts`, `apps/web/app/sitemap.ts`, `apps/web/package.json`, `bun.lock`, `packages/blueprint-compiler/src/repo-generation/`, and all child ExecPlans in this Program.

### In Scope

This slice owns focused docs tests, blog tests, metadata and sitemap tests, browser smoke for `/docs` and `/docs/local-setup`, browser smoke for `/blog` and the current blog article, package and lockfile validation, import scans, lint, typecheck, Program lint, ExecPlan lint, markdown lint, and final evidence updates to the Program and child ExecPlans.

### Out Of Scope

Do not introduce new rendering architecture in this slice. Do not touch Stripe, checkout, webhook, pricing, promo code, billing proof, environment behavior, Convex files, compiler schema, or unrelated public pages.

Do not change public docs or blog URLs to make proof easier.

## Plan of Work

Start by reading the completed retrospectives of the preceding child ExecPlans and confirming their validation evidence. Run import scans and package checks first so the final state is known before browser proof.

Run focused unit tests for docs, blog, metadata, sitemap, and starter assumptions. Fix only regressions caused by this Program's migration, and update the relevant earlier ExecPlan if a fix belongs to that slice's implementation history.

Start the web app locally and perform browser smoke on desktop and mobile viewports for `/docs`, `/docs/local-setup`, `/blog`, and the current published blog article. Record any route, console, layout, navigation, or metadata issues.

Run broad lint and typecheck after focused tests and browser proof pass. Finish with Program lint, ExecPlan lint for every touched plan, markdown lint, and `git diff --check`.

## Milestones

Milestone 1 proves dependency removal. Success means package and import scans show no runtime Nextra dependency.

Milestone 2 proves focused behavior. Success means docs, blog, metadata, sitemap, and starter tests pass.

Milestone 3 proves browser behavior. Success means desktop and mobile smoke for docs and blog routes show stable content, navigation, TOC, and layout.

Milestone 4 proves repository hygiene. Success means lint, typecheck, Program lint, ExecPlan lint, markdown lint, and diff check pass.

## Concrete Steps

From `/Users/parkerrex/Developer/ship-by-sunday`, confirm the final dependency state:

    rg -n "from ['\"]nextra|from ['\"]nextra-theme-docs|nextra/pages|nextra/page-map|nextra/icons|nextra-theme-docs/style.css" apps/web packages/blueprint-compiler

Run focused tests before broad checks. If a focused test fails, fix the root cause in the owning app surface and rerun the same test.

Start the local web server and smoke the public routes. Use the app's normal local development environment and do not switch Convex into local mode.

Update the Program `Progress`, child ExecPlan `Outcomes & Retrospective`, and final artifacts with the exact proof that ran.

## Validation and Acceptance

This slice is accepted when the final state has no Nextra runtime dependency, docs and blog routes pass focused tests, metadata and sitemap tests pass, browser smoke proves `/docs`, `/docs/local-setup`, `/blog`, and the current article in desktop and mobile viewports, package validation passes, lint and typecheck pass, and planning artifacts are lint-clean.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` after implementation:

    ! rg -n "from ['\"]nextra|from ['\"]nextra-theme-docs|nextra/pages|nextra/page-map|nextra/icons|nextra-theme-docs/style.css" apps/web packages/blueprint-compiler
    ! rg -n "\"nextra\"|\"nextra-theme-docs\"" apps/web/package.json bun.lock
    rg -n "\"@next/mdx\"|\"@mdx-js/loader\"|\"@mdx-js/react\"|\"@types/mdx\"|\"remark-frontmatter\"" apps/web/package.json bun.lock
    bun install --frozen-lockfile
    bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/docs-page-paths.test.ts tests/unit/docs-content-loader.test.ts tests/unit/docs-navigation-components.test.tsx tests/unit/docs-metadata.test.ts tests/unit/docs-disabled-state.test.tsx tests/unit/blog-page-paths.test.ts tests/unit/blog-posts.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-formatters.test.ts tests/unit/public-metadata-routes.test.ts tests/unit/route-metadata.test.ts
    bun test packages/blueprint-compiler/tests/repo-generation.test.ts packages/blueprint-compiler/tests/review-download-zip.test.ts
    bun lint
    bun typecheck
    bun run --cwd apps/web dev:web:only
    bun codex-scripts/docs-browser-smoke.mjs
    bun codex-scripts/blog-browser-smoke.mjs
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-build-docs-blog-content-inventory-and-route-model.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-replace-docs-nextra-rendering.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-replace-blog-nextra-rendering.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-nextra-config-packages-and-starter-assumptions.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-harden-public-docs-blog-release-proof.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs docs/exec-plans/completed/2026-04-27-build-docs-blog-content-inventory-and-route-model.md docs/exec-plans/completed/2026-04-27-replace-docs-nextra-rendering.md docs/exec-plans/completed/2026-04-27-replace-blog-nextra-rendering.md docs/exec-plans/completed/2026-04-27-remove-nextra-config-packages-and-starter-assumptions.md docs/exec-plans/completed/2026-04-27-harden-public-docs-blog-release-proof.md
    git diff --check

Browser smoke is required while the dev server is running: open `/docs`, `/docs/local-setup`, `/blog`, and the current published blog article in desktop and mobile viewports. Record the URLs, viewport sizes, and whether content, navigation, TOC, and layout are stable. `codex-scripts/docs-browser-smoke.mjs` and `codex-scripts/blog-browser-smoke.mjs` are the local ignored probes used for this proof.

## Idempotence and Recovery

All validation commands are safe to rerun. If the dev server is already running, reuse it or start a new port according to the app's normal workflow.

If broad lint or typecheck fails because of unrelated pre-existing work, record the exact failure separately from this Program's proof and rerun the narrow checks that prove the migrated surfaces.

## Artifacts and Notes

The final evidence should include import scan results, package scan results, focused test results, browser-smoke notes, broad lint and typecheck results, and planning lint results.

The Program can stay complete because every child ExecPlan has an accurate retrospective and no required implementation slice remains.

Validation results recorded on 2026-04-27 EDT:

- `! rg -n "from ['\"]nextra|from ['\"]nextra-theme-docs|nextra/pages|nextra/page-map|nextra/icons|nextra-theme-docs/style.css" apps/web packages/blueprint-compiler`: passed with no matches.
- `! rg -n "\"nextra\"|\"nextra-theme-docs\"" apps/web/package.json bun.lock`: passed with no matches.
- `rg -n "\"@next/mdx\"|\"@mdx-js/loader\"|\"@mdx-js/react\"|\"@types/mdx\"|\"remark-frontmatter\"" apps/web/package.json bun.lock`: passed and showed the direct MDX dependencies.
- `bun install --frozen-lockfile`: passed with no changes.
- `bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/docs-page-paths.test.ts tests/unit/docs-content-loader.test.ts tests/unit/docs-navigation-components.test.tsx tests/unit/docs-metadata.test.ts tests/unit/docs-disabled-state.test.tsx tests/unit/blog-page-paths.test.ts tests/unit/blog-posts.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-formatters.test.ts tests/unit/public-metadata-routes.test.ts tests/unit/route-metadata.test.ts`: 13 files and 29 tests passed.
- `bun test packages/blueprint-compiler/tests/repo-generation.test.ts packages/blueprint-compiler/tests/review-download-zip.test.ts`: 4 tests passed.
- `bun lint`: passed with 0 warnings and 0 errors.
- `bun typecheck`: passed and generated 71 static pages.
- `bun codex-scripts/docs-browser-smoke.mjs` against `bun run --cwd apps/web dev:web:only`: passed for desktop and mobile `/docs` and `/docs/local-setup`.
- `bun codex-scripts/blog-browser-smoke.mjs` against `bun run --cwd apps/web dev:web:only`: passed for desktop and mobile `/blog` and `/blog/the-operating-system-beats-the-prompt`.

## Interfaces and Dependencies

This slice depends on all previous child ExecPlans. It also depends on the current release workflow in `docs/release-workflow.md`, Next.js App Router behavior, the app's local dev workflow, and the Program packet under `docs/programs/completed/2026-04-27-remove-nextra-docs-runtime/`.
