---
title: T3 Code Public Surfaces
status: complete
created_at: 2026-05-15
completed_at: 2026-05-15
summary: Move the current public homepage, product pages, docs chrome, and blog chrome onto T3 Code-style public route surfaces without changing checkout, metadata, or route contracts.
post_build_recap: Current public homepage, Starter, Workers, Worker Seal Team 6, blog chrome, and docs chrome now use T3 Code-style public route surfaces and sans docs/blog typography while preserving checkout, Cal.com, metadata, and route contracts.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-9.md
read_when:
  - Resuming the public surface migration slice.
  - Reviewing homepage, Starter, Workers, Worker Seal Team 6, docs, or blog T3 Code migration work.
  - Checking validation for planning brief 9.
---

# T3 Code Public Surfaces

This document is a living execution plan for the public surface slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The protected app now uses the T3 Code route surface recipe, but the public site still reads like a separate legacy editorial system. The Man Meets AI homepage, Starter, Workers, Worker Seal Team 6, blog, and docs surfaces still include large serif headings, loose hero islands, route-local cards, and docs-specific typography that do not match the current app. After this slice, a visitor should move from `/` to product pages, blog, or docs without seeing an obvious visual reset, while checkout buttons, Cal.com booking, metadata, sitemap, robots rules, and public URLs keep their current behavior.

## Progress

- [x] 2026-05-15: Read root and web agent instructions, release workflow, app architecture/conventions, ExecPlan and Program contracts, planning brief 9, and the current homepage configuration doc.
- [x] 2026-05-15: Audited public route files, docs/blog chrome, current public tests, and old serif/header patterns.
- [x] 2026-05-15: Created and validated this active ExecPlan.
- [x] 2026-05-15: Added shared public route-surface helpers and moved the public site header out of the route-local underscore folder.
- [x] 2026-05-15: Migrated `/`, `/starter`, `/workers`, `/worker-seal-team-6`, blog index/post shell, and docs chrome away from old serif/editorial surfaces while preserving contracts.
- [x] 2026-05-15: Added focused tests for public route surface slots, checkout and Cal.com affordances, docs/blog chrome, and removal of old serif public markup.
- [x] 2026-05-15: Ran focused tests, app lint/typecheck, and desktop/mobile browser proof for public home, Workers, docs, and blog routes.
- [x] 2026-05-15: Completed this ExecPlan, updated the Program ledger and next-slice note, and ran final validation.

## Surprises & Discoveries

The homepage configuration doc says the current `/` contract is the lightweight Man Meets AI public IA in `apps/web/src/app/(marketing)/page.tsx`, not the older generated-codebase homepage system under `apps/web/src/app/_components/home-page/`. This slice should not edit the old homepage compatibility system unless a touched blog CTA still depends on it.

The public docs route is direct-link support material and is intentionally not promoted in primary public navigation. It still needs visual alignment, but it should not become a primary nav item.

The focused docs loader command exposed that `apps/web/src/content/docs/worker-seal-team-6-cal-com.mdx` was already tracked in the docs inventory and `_meta`, but `apps/web/src/app/(marketing)/docs/_server/docs-content.ts` did not have a direct MDX loader for it and `public-content-inventory.test.ts` still expected 33 docs pages. This slice touches docs chrome and docs validation, so it added the missing loader and updated the count to 34.

Browser proof used the webpack dev server at `http://localhost:3022` because this local environment has a known Turbopack panic during browser smoke. Desktop home and docs plus mobile Workers and blog proof passed, and screenshots were saved under ignored `codex-scripts/artifacts/t3-public-surfaces/`.

## Decision Log

Decision: Treat this as a public visual and structure migration, not a checkout, Cal.com, metadata, sitemap, or content rewrite.
Rationale: Planning brief 9 names checkout, Cal.com, route, metadata, structured data, docs, and blog contracts as preservation requirements. The user asked to continue the T3 migration, not to change the offer or purchase flow.
Date: 2026-05-15

Decision: Start with the current public IA rather than the old homepage compatibility system.
Rationale: `apps/web/src/content/docs/configure-the-homepage.mdx` says `/`, `/starter`, `/workers`, `/worker-seal-team-6`, `/blog`, and direct-link `/docs` are the active public surfaces; the old generated-codebase homepage component tree is compatibility inventory.
Date: 2026-05-15

## Outcomes & Retrospective

This slice added `apps/web/src/components/layout/public-route-surface.tsx` as the shared public route recipe and moved `PublicSiteHeader` to `apps/web/src/components/layout/public-site-header.tsx`, removing the old route-local public header under `apps/web/src/app/_components/public-site/`. The current public `/`, `/starter`, `/workers`, and `/worker-seal-team-6` pages now render through public route page, header, panel, list, and step-marker slots without changing their metadata exports, hrefs, checkout offer ids, checkout test ids, or Worker Seal Team 6 Cal.com booking configuration.

Blog index and post shells now share the public header and T3 Code-style route header typography instead of the old editorial serif scale. Docs nav/footer/prose styling now uses compact sans heading rhythm and T3-compatible panel radii instead of Instrument Serif docs headings or the old product wordmark footer. The direct-link docs policy is unchanged and docs are still not added to primary public navigation.

Focused tests now cover public marketing route slots, Starter and Workers checkout affordances, Worker Seal Team 6 booking presentation, blog route shells, docs chrome, docs CSS, public metadata, docs/blog inventory, and the tracked Cal.com docs loader. Browser proof covered desktop `/`, mobile `/workers`, desktop `/docs`, and mobile `/blog`.

## Context and Orientation

The active Program is `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`, and this plan is driven by `docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-9.md`. The current homepage contract is documented in `apps/web/src/content/docs/configure-the-homepage.mdx`.

The public pages for this pass are:

    apps/web/src/app/(marketing)/page.tsx
    apps/web/src/app/(marketing)/starter/page.tsx
    apps/web/src/app/(marketing)/workers/page.tsx
    apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx

Blog chrome and article shells live under:

    apps/web/src/app/(marketing)/blog/_components/

Docs chrome and prose styling live under:

    apps/web/src/app/(marketing)/docs/_components/
    apps/web/src/app/(marketing)/docs/_styles/docs-theme.css

The public header currently lives in the route-local underscore folder:

    apps/web/src/app/_components/public-site/public-site-header.tsx

This slice should move that shared header to a plain source module under `apps/web/src/components/layout/` and update imports. The route group folders such as `(marketing)` can stay because they are Next.js route organization.

### In Scope

This plan may add shared public route-surface helpers under `apps/web/src/components/layout/`, move the public site header to `apps/web/src/components/layout/`, update the current public pages, update blog and docs chrome/styling, update focused tests, update this ExecPlan, and update the active T3 Program ledger.

### Out Of Scope

This plan must not change route URLs, redirects, checkout offer ids, checkout success routes, Stripe or Clerk provider setup, Convex schema/functions, Cal.com booking behavior, metadata meaning, robots/sitemap policy, docs content, blog slugs, generated-codebase compiler output, generated customer docs, Telegram widget CSS, auth pages, checkout success pages, or dependencies.

## Plan of Work

First, validate this active plan with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-public-surfaces.md`.

Second, add a shared public route surface module under `apps/web/src/components/layout/public-route-surface.tsx`. It should provide page, section, header, title, description, panel, panel body, icon, and compact list primitives with `data-slot` attributes for tests. The recipes should use DM Sans, T3 Code tokens, compact headers, quiet panels, and stable responsive spacing.

Third, move `PublicSiteHeader` from `apps/web/src/app/_components/public-site/public-site-header.tsx` to `apps/web/src/components/layout/public-site-header.tsx`, update public imports, and keep primary navigation unchanged: Man Meets AI, Starter, Workers, Seal Team 6, Blog, Sign in, and theme toggle. Do not add docs to primary public navigation.

Fourth, migrate `/`, `/starter`, `/workers`, and `/worker-seal-team-6` to the shared public route surface helpers. Preserve visible copy, hrefs, checkout button offer ids and test ids, the Cal.com booking component, hosted and direct booking fallbacks, and all metadata exports.

Fifth, align blog and docs chrome. Blog index and blog post shells should no longer use `font-heading-serif` or oversized editorial title scales. Blog header should share the public site header. Docs prose should use the T3 Code sans font and compact heading rhythm instead of Instrument Serif. Docs navigation should stay direct-link support material and should not add docs to the primary public nav.

Sixth, add or update focused tests. Tests should render the public pages and blog/docs chrome, assert `data-slot="public-route-page"`, `data-slot="public-route-header"`, and `data-slot="public-route-panel"` where applicable, assert checkout and Cal.com affordances remain present, and assert touched public markup/styles do not include `font-heading-serif` or docs Instrument Serif heading rules.

Seventh, run browser proof on a local webpack dev server for one product/home route and one docs or blog route at desktop and mobile sizes. Use the existing webpack fallback if Turbopack panics in this environment.

Eighth, complete this ExecPlan, move it to `docs/exec-plans/completed/2026-05-15-t3-code-public-surfaces.md`, update the Program ledger and next-slice note, and run final validation.

## Milestones

Milestone 1 creates the plan and shared public route primitives. Success means this plan exists, passes `plans:lint`, and the public route-surface module provides stable reusable slots without touching checkout or provider code.

Milestone 2 migrates current public pages. Success means `/`, `/starter`, `/workers`, and `/worker-seal-team-6` render with public route page/header/panel slots, no old serif route shells, and preserved CTA hrefs, checkout buttons, and Cal.com booking UI.

Milestone 3 migrates blog/docs chrome. Success means blog index/post shells and docs prose/header styling no longer visibly diverge from the T3 Code app system, while docs remain direct-link support material and blog slugs/content remain unchanged.

Milestone 4 validates and records completion. Success means focused tests, browser proof, app lint/typecheck, Program/plan/markdown lint, repo lint/typecheck, and `git diff --check` pass or exact blockers are recorded.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this active plan:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-public-surfaces.md

Edit the files named in the Context section. Keep checkout, Cal.com, metadata, route, docs content, and blog content behavior unchanged.

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts tests/unit/public-content-inventory.test.ts tests/unit/blog-page-paths.test.ts tests/unit/blog-posts.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/docs-navigation-components.test.tsx tests/unit/docs-content-loader.test.ts tests/unit/docs-metadata.test.ts tests/unit/docs-page-paths.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-button.test.tsx tests/integration-ui/worker-seal-team-6-cal-booking.test.tsx tests/integration-ui/public-theme-toggle.test.tsx

Add the new focused public surface tests to the relevant command once they exist.

Run static and docs validation:

    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-public-surfaces.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-public-surfaces.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

Use the active plan path in lint commands until this plan is moved to `completed/`.

## Validation and Acceptance

Acceptance requires the touched public pages to keep their current contracts while adopting the T3 Code public route-surface recipe. The Man Meets AI page must still route visitors to Starter, Workers, and Worker Seal Team 6. Starter checkout must still render a Starter checkout button using offer id `starter`; Workers checkout must still render a Workers checkout button using offer id `workers`. Worker Seal Team 6 must still render the Cal.com booking surface or the direct scheduling fallback with hosted/direct links unchanged. Blog and docs routes must keep slugs, metadata, navigation, and content source behavior unchanged.

The route markup and docs styles touched by this slice must no longer include `font-heading-serif` or Instrument Serif public docs heading rules. Browser proof must cover at least one public product or home route and one docs or blog route at desktop and mobile sizes.

Feature risk for this slice is P1-adjacent because it changes public checkout entry surfaces and Cal.com booking presentation, even though behavior is preserved. Source of truth remains current route metadata, checkout button offer ids, public hrefs, Cal.com booking config, docs inventory, and blog inventory. The CI gate is baseline app static checks plus focused public metadata, checkout, Cal.com, docs, blog, and visual contract tests.

### Test Commands

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-public-surfaces.md
    bun run --cwd apps/web test:unit -- tests/unit/public-marketing-surfaces.test.tsx tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts tests/unit/public-content-inventory.test.ts tests/unit/blog-page-paths.test.ts tests/unit/blog-posts.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/docs-navigation-components.test.tsx tests/unit/docs-content-loader.test.ts tests/unit/docs-metadata.test.ts tests/unit/docs-page-paths.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-button.test.tsx tests/integration-ui/worker-seal-team-6-cal-booking.test.tsx tests/integration-ui/public-theme-toggle.test.tsx
    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-public-surfaces.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-public-surfaces.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

Passed before completing this plan:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-public-surfaces.md
    bun run --cwd apps/web test:unit -- tests/unit/public-marketing-surfaces.test.tsx tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts tests/unit/public-content-inventory.test.ts tests/unit/blog-page-paths.test.ts tests/unit/blog-posts.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/docs-navigation-components.test.tsx tests/unit/docs-content-loader.test.ts tests/unit/docs-metadata.test.ts tests/unit/docs-page-paths.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-button.test.tsx tests/integration-ui/worker-seal-team-6-cal-booking.test.tsx tests/integration-ui/public-theme-toggle.test.tsx
    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck

Browser proof passed on `bun --cwd apps/web next dev --webpack -p 3022`:

    http://localhost:3022/
    http://localhost:3022/workers
    http://localhost:3022/docs
    http://localhost:3022/blog

Screenshots:

    codex-scripts/artifacts/t3-public-surfaces/home-desktop.png
    codex-scripts/artifacts/t3-public-surfaces/workers-mobile.png
    codex-scripts/artifacts/t3-public-surfaces/docs-desktop.png
    codex-scripts/artifacts/t3-public-surfaces/blog-mobile.png

## Idempotence and Recovery

The implementation is local React composition and CSS changes. If a test shows that an href, checkout offer id, checkout test id, Cal.com link, metadata rule, docs path, or blog slug changed, restore the original behavior and keep only the visual migration. If browser proof cannot run through the default dev server because of the known Turbopack panic, use `bun --cwd apps/web next dev --webpack -p <port>` and record the fallback.

## Artifacts and Notes

Important references:

    docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-9.md
    apps/web/src/content/docs/configure-the-homepage.mdx
    apps/web/src/config/product.ts
    apps/web/src/app/(marketing)/page.tsx
    apps/web/src/app/(marketing)/starter/page.tsx
    apps/web/src/app/(marketing)/workers/page.tsx
    apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx
    apps/web/src/app/(marketing)/blog/_components/
    apps/web/src/app/(marketing)/docs/_components/
    apps/web/src/app/(marketing)/docs/_styles/docs-theme.css

No external provider setup, dependency change, generated customer repository change, or Convex schema/function change should be needed.

## Interfaces and Dependencies

This slice depends on Next.js App Router public route files, current public metadata exports, `routeConfig`, `checkoutOffers`, the client `CheckoutButton`, the Worker Seal Team 6 Cal.com booking component, docs and blog content inventory loaders, the shared theme toggles, T3 Code-compatible global tokens, and shared UI primitives. It must not change those data or provider contracts.
