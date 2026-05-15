---
title: "T3 Code Public Surface Migration Planning Brief 9"
program_id: "t3-code-source-design-system-port"
brief_version: 9
status: "current"
summary: "Next slice for migrating public marketing, docs, blog, starter/workers, and public support surfaces after protected app route closeout."
read_when:
  - "Writing the next public-surface child ExecPlan after protected app route closeout."
  - "Changing homepage, marketing, docs, blog, starter, workers, worker-seal-team-6, or public support surfaces during the T3 Code migration."
---

# T3 Code Public Surface Migration Planning Brief 9

## Slice

Public surfaces migration: move the public homepage, product landing pages, docs chrome, blog pages, and public support-adjacent route islands away from the old editorial/serif visual system and onto the T3 Code design source while keeping Ship by Sunday branding and conversion behavior intact.

## Desired Outcome

The public web experience should no longer feel like a separate legacy site beside the T3 Code-styled protected app. Homepage, Starter, Workers, Worker Seal Team 6, docs, blog, and public support-facing surfaces should use DM Sans, T3 Code tokens, compact headers, quiet panels, dense product rows, restrained CTAs, and app-like visual rhythm rather than oversized serif hero islands, decorative marketing cards, or old design-pack styling.

Ship by Sunday product language, visible offers, checkout entry points, SEO/metadata, structured data, docs routes, blog slugs, Cal.com fallback behavior, and public route URLs must remain intact unless the slice explicitly records a contract change and updates the owning docs.

## Scope

In scope:

- audit remaining public routes for `font-heading-serif`, old negative tracking, decorative hero/card islands, legacy docs chrome, route-local rounded-xl panel recipes, and old design-pack references
- migrate the public homepage shell and visible homepage sections without changing checkout CTA behavior or homepage structured-data truth
- migrate `/starter`, `/workers`, `/worker-seal-team-6`, public support-adjacent pages, and reusable public product components where old styling remains
- migrate docs and blog chrome enough that public docs/blog do not visibly diverge from the T3 Code app system
- reuse existing shared primitives and T3 Code token decisions before adding public-route wrappers
- preserve route URLs, redirects, metadata, structured data, checkout links, Cal.com fallback links, docs navigation, blog slugs, and content ownership boundaries
- add focused tests for changed visible contracts and behavior-sensitive checkout/structured-data paths
- run desktop and mobile browser proof for homepage or a product page plus docs or blog
- update the Program ledger and a completed child ExecPlan

Out of scope:

- protected app route migration already completed by earlier slices
- auth pages, checkout success, Stripe/Clerk provider setup, Convex schema/functions, provider configuration, or billing behavior changes
- generated-codebase compiler, starter app output, generated customer docs, or `docs/generated`
- Telegram widget visual migration
- Base UI migration or dependency changes
- broad copy rewrite that changes the offer rather than restyling the current public surfaces

## Inputs

- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/exec-plans/completed/2026-05-15-t3-code-protected-app-route-closeout.md`
- `apps/web/src/content/docs/configure-the-homepage.mdx`
- `apps/web/src/config/product.ts`
- `apps/web/src/app/_content/home-page.ts`
- `apps/web/src/app/_lib/home-page-render-model.ts`
- `apps/web/src/app/_components/home-page`
- `apps/web/src/app/(marketing)`
- `apps/web/src/app/(marketing)/docs`
- `apps/web/src/app/(marketing)/blog`
- `apps/web/tests/integration-ui`
- `apps/web/tests/unit`

## Acceptance

- The child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- Touched public routes keep current route URLs, metadata, structured data, checkout CTAs, Cal.com fallback behavior, docs links, blog slugs, and app/product copy contracts unless a deliberate behavior change is recorded.
- Old public serif/hero/page-island styling is removed from touched public surfaces without creating a marketing page disconnected from the T3 Code app visual system.
- Homepage structured data remains truthful to visible sections and CTA behavior.
- Focused tests cover changed visible contracts and behavior-sensitive checkout or structured-data paths touched by the slice.
- Desktop and mobile browser proof verifies at least one public product/home route and one docs or blog route.
- `bun run format`, focused app tests, `bun run --cwd apps/web lint`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck`, Program/plan lint, markdown lint, repo lint/typecheck, scope checks, and `git diff --check` pass or exact blockers are recorded.

## Watchpoints

- Read `apps/web/src/content/docs/configure-the-homepage.mdx` before editing homepage code or copy, and keep the homepage shell contract intact.
- Do not re-hardwire checkout into hero or pricing, scatter homepage section gating across multiple components, or leave structured data behind when visible homepage sections change.
- Public checkout entry points are P1/P0-adjacent. Preserve CTA hrefs, offer identity, and recovery paths while changing visuals.
- Keep public pages product-specific and operational. Avoid decorative landing-page composition that conflicts with T3 Code's dense app/tool feel.
- Do not start generated-codebase, Telegram widget, auth/checkout success, or provider setup work in this slice.
