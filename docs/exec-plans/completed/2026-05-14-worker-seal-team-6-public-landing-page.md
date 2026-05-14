---
title: Worker Seal Team 6 Public Landing Page
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Add the public Worker Seal Team 6 landing page and wire it through public navigation, metadata routes, and Program documentation.
post_build_recap: Added the Worker Seal Team 6 public route, public navigation and homepage routing, robots and sitemap coverage, public route tests, Program/docs updates, and desktop/mobile browser proof without adding Cal.com or checkout behavior.
program_id: template-first-web-convex-architecture
planning_brief: docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-6.md
read_when:
  - Resuming the Worker Seal Team 6 public landing-page slice.
  - Changing public marketing navigation, robots, sitemap, or route metadata.
  - Preparing the later Cal.com provider integration slice.
---

# Worker Seal Team 6 Public Landing Page

This document is a living execution plan for adding the Worker Seal Team 6 public landing page and public IA wiring.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday's Program names four public landing pages: `/`, `/starter`, `/workers`, and `/worker-seal-team-6`. The first three exist; the service route does not. After this slice, a visitor can open `/worker-seal-team-6`, understand the $2500 one-hour hands-on service, ask about scheduling without creating an app account, and see the route reflected in public navigation, robots, sitemap, and durable docs. The actual Cal.com paid booking flow remains a separate provider slice, so this page must be honest about the current handoff.

## Progress

- [x] 2026-05-14: Read the Program, planning brief inputs, app architecture/conventions, homepage configuration doc, public route files, design instructions, Next.js page/metadata/sitemap/robots docs, and ExecPlan contract.
- [x] 2026-05-14: Created immutable `planning-brief-6.md` for the public landing-page set and Worker Seal Team 6 route.
- [x] 2026-05-14: Added the service route, route config entry, public header nav item, homepage routing card, direct inquiry CTA, and no-checkout/no-Cal.com service page.
- [x] 2026-05-14: Updated robots, sitemap, public metadata route tests, and homepage configuration docs.
- [x] 2026-05-14: Updated the Program, architecture inventory, app architecture status, design-pack note, and this ExecPlan.
- [x] 2026-05-14: Ran focused validation, app format/lint/typecheck, plan/Program/docs lint, whitespace checks, and desktop/mobile browser proof.

## Surprises & Discoveries

The Program already contains Worker Seal Team 6 billing and Cal.com decisions, and the Convex billing-domain foundation already has future booking mirror state. The public route is the missing visible surface, but no Cal.com URL or environment contract exists in the repo yet. This slice therefore uses a direct inquiry CTA and records Cal.com embed/setup as follow-up instead of inventing a placeholder provider contract.

The default Turbopack dev server failed browser proof with an existing `proxy.ts` module parse error before rendering the page. The webpack dev server rendered `/worker-seal-team-6` correctly, and the production typecheck/build also prerendered the route as static content. This slice did not change proxy or middleware behavior.

## Decision Log

Decision: Ship the public service page before the Cal.com embed.

Rationale: The Program acceptance requires the route to exist, and public IA can be made truthful without live provider credentials. Adding the page now gives the later Cal.com slice a designed container and avoids hiding the service inside `/workers`.

Date: 2026-05-14.

Decision: Use a direct inquiry CTA instead of `CheckoutButton` or a fake booking embed.

Rationale: Worker Seal Team 6 is a Cal.com-owned paid booking in the Program decisions. An app-owned checkout button would violate that boundary, and a fake embed or hardcoded unverified provider URL would create a misleading customer setup contract.

Date: 2026-05-14.

## Outcomes & Retrospective

The public Worker Seal Team 6 page now exists at `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx` and renders at `/worker-seal-team-6`. It has its own metadata, a first-viewport product signal, a real founder proof image, a $2,500 one-hour service promise, direct scheduling CTAs, and a secondary path to Workers. The public header includes a compact "Seal Team 6" nav item, and the Man Meets AI homepage now includes a third routing card for the service.

Robots and sitemap now include `/worker-seal-team-6`, and public metadata route tests assert that behavior. `apps/web/src/content/docs/configure-the-homepage.mdx`, the Program, the architecture inventory, app architecture status, and the design-pack documentation now record the route and the deferred provider work.

The intentional remaining gap is the live Cal.com provider flow: embedded booking, hosted fallback URL, Cal.com dashboard setup, webhook verification, Convex booking mirror writes, refund/cancellation mirroring, and Resend prep/ops emails remain in the later Worker Seal Team 6 Cal.com integration slice.

## Context and Orientation

Browser routes live under `apps/web/src/app`. The marketing route group `(marketing)` affects source organization only; the URL for `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx` is `/worker-seal-team-6`. Public navigation is owned by `apps/web/src/app/_components/public-site/public-site-header.tsx`. Shared product paths and asset paths are in `apps/web/src/config/product.ts`. Public SEO metadata routes are `apps/web/src/app/robots.ts` and `apps/web/src/app/sitemap.ts`, with route tests in `apps/web/tests/unit/public-metadata-routes.test.ts`.

The current public IA doc is `apps/web/src/content/docs/configure-the-homepage.mdx`. It currently names `/`, `/starter`, `/workers`, `/blog`, and direct-link `/docs`. This slice must update that doc because `/worker-seal-team-6` becomes a first-class public offer route.

The visual rule is a landing-page rule, not a dashboard rule. The first viewport needs one composition, a clear product signal, concise hero copy, one real visual asset, and a CTA group. Cards can appear after the first screen, but the hero should not become a wall of cards, stats, badges, or fake process diagrams.

### In Scope

This plan adds the `/worker-seal-team-6` page, updates route config, public nav, robots, sitemap, public metadata route tests, homepage configuration docs, Program docs, architecture inventory, and design-pack documentation. It also verifies desktop and mobile render behavior.

### Out Of Scope

This plan does not add Cal.com embed code, a hosted Cal.com fallback URL, Cal.com dashboard setup, Cal.com webhook verification, Stripe checkout for Worker Seal Team 6, Convex booking mirror writes, Resend emails, Sentry setup, Starter checkout changes, Workers checkout changes, or a broad homepage redesign.

## Plan of Work

First, extend `routeConfig` in `apps/web/src/config/product.ts` with `workerSealTeam6: "/worker-seal-team-6"`. Then add a compact "Seal Team 6" nav item to `apps/web/src/app/_components/public-site/public-site-header.tsx`, using the new route config value and preserving the existing responsive desktop nav behavior.

Second, add `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx`. The page should import `Image`, `Link`, `Metadata`, lucide icons, `PublicSiteHeader`, `Button`, `assetPaths`, and `routeConfig`. The hero should use `assetPaths.founderProof` as the real visual anchor, name "Worker Seal Team 6" in the first screen, state that it is a $2500 hands-on hour for a live codebase, and route the primary CTA to the existing direct support line while the Cal.com booking flow is not live. The secondary CTA should link to `/workers`.

Third, update `apps/web/src/app/robots.ts` and `apps/web/src/app/sitemap.ts` to include `/worker-seal-team-6`. The sitemap entry should use `getPublicFileLastModified("app/(marketing)/worker-seal-team-6/page.tsx")` so metadata reflects the source file.

Fourth, update `apps/web/tests/unit/public-metadata-routes.test.ts` so the allow-list and sitemap assertions include `/worker-seal-team-6`.

Fifth, update `apps/web/src/content/docs/configure-the-homepage.mdx`, the Program, the architecture inventory, and design-pack documentation so future agents know the public route now exists and that Cal.com/payment integration remains a later slice.

## Milestones

Milestone 1 is the public route and navigation. It is complete when `/worker-seal-team-6` has a route file, metadata, first-viewport hero, direct inquiry CTA, secondary Workers CTA, and public header nav entry.

Milestone 2 is metadata and tests. It is complete when robots and sitemap publish the service route and focused public metadata tests pass.

Milestone 3 is durable documentation. It is complete when the homepage configuration doc, Program, architecture inventory, design-pack documentation, and this ExecPlan describe what shipped and what remains deferred.

Milestone 4 is validation and visual proof. It is complete when focused tests, static checks, docs lint, plan/Program lint, whitespace checks, and browser desktop/mobile proof pass or have exact recorded blockers.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Edit these files:

    apps/web/src/config/product.ts
    apps/web/src/app/_components/public-site/public-site-header.tsx
    apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx
    apps/web/src/app/robots.ts
    apps/web/src/app/sitemap.ts
    apps/web/tests/unit/public-metadata-routes.test.ts
    apps/web/src/content/docs/configure-the-homepage.mdx
    docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md
    docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md
    docs/ship-by-sunday/design-pack/documentation.md

Run the focused public route validation:

    bun run --cwd apps/web test:unit -- tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts

Run static checks for the app surface:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck

Run docs and plan checks:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-worker-seal-team-6-public-landing-page.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-worker-seal-team-6-public-landing-page.md docs/programs/active/2026-05-13-template-first-web-convex-architecture apps/web/src/content/docs/configure-the-homepage.mdx docs/ship-by-sunday/design-pack/documentation.md
    git diff --check

Start the app for browser proof:

    bun run --cwd apps/web dev:web:webpack -- -p 3100

Open `http://localhost:3100/worker-seal-team-6` and check at least one desktop viewport and one mobile viewport. Success means the hero is not blank, the image renders, header/navigation does not overlap, hero text fits, the direct inquiry CTA is visible, and the page scrolls to the follow-on sections cleanly.

## Validation and Acceptance

Acceptance is user-visible. A visitor opening `/worker-seal-team-6` should immediately see "Worker Seal Team 6", understand that the offer is a $2500 one-hour hands-on codebase service, and have a clear inquiry path without being asked to sign in. Search metadata routes should include the page, and protected-route rules should not accidentally hide it. The page must not expose a dead Cal.com embed, fake checkout, or app-owned Stripe path for this service.

Feature: Worker Seal Team 6 public landing page. Risk: P3 public route, copy, navigation, and metadata because this slice intentionally excludes checkout, provider webhooks, auth, and data mutation. Source of truth: rendered public page, robots allow-list, sitemap entry, and public route tests. Must work: public visitor can open the route, scan the offer, navigate to inquiry or Workers, and find the route in public metadata. Must fail safely: no checkout or Cal.com action appears unless provider setup exists, protected operational routes remain blocked, and docs record the deferred provider work. Tests: focused route metadata unit tests, app lint/typecheck, docs lint, Program/ExecPlan lint, whitespace check, and browser desktop/mobile proof. CI gate: app static and public route metadata.

### Test Commands

    bun run --cwd apps/web test:unit -- tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-worker-seal-team-6-public-landing-page.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-worker-seal-team-6-public-landing-page.md docs/programs/active/2026-05-13-template-first-web-convex-architecture apps/web/src/content/docs/configure-the-homepage.mdx docs/ship-by-sunday/design-pack/documentation.md
    git diff --check

## Idempotence and Recovery

The route and metadata changes are additive. If the page needs to be retried, re-run the focused tests and browser proof after each edit. If the dev server port is busy, use another local port and record the URL in the final validation notes. If broad static checks fail in unrelated dirty files, keep the public-route checks separate and report the unrelated blocker rather than reverting user changes.

If a Cal.com URL appears during implementation, do not wire it unless it is already documented as a configured provider contract. The safe recovery path is to keep the direct inquiry CTA and leave Cal.com setup for the provider slice.

## Artifacts and Notes

Design plan for this landing-page slice:

Surface type: landing page. Goal: make the Worker Seal Team 6 offer inspectable and schedulable by inquiry before the Cal.com provider slice. Audience: founder, agency, or team lead with a live codebase and a stuck AI-worker adoption path. Job to be done: decide whether to buy a hands-on hour or route to the Workers subscription. Existing system: extend the current public marketing system.

Constraints: one H1, four major page sections, existing typography and color tokens, primary CTA above the fold, no checkout button, no fake Cal.com embed, no account gate, and no docs/tutorials links in primary public nav. The codebase-first invariant is that the page speaks to live repos, source truth, bounded worker loops, and proof rather than generic coaching.

Visual thesis: a calm premium field briefing over a real founder/proof image, with restrained neutral sections that make the service feel decisive rather than promotional.

Content plan: section one is the hero with the product name, service promise, price/timebox, direct inquiry CTA, and Workers comparison CTA. Section two explains when to use the service. Section three explains what happens in the hour. Section four explains booking handoff and routes people to the right product lane.

Interaction thesis: keep the sticky header active state, use clear button hover/focus states from the existing system, and make the hero CTA target the booking/inquiry section or direct inquiry without animated distractions.

Verification plan: check desktop around 1440 by 900 and mobile around 390 by 844. Confirm text fits, the hero image renders, nav does not overflow on desktop, the first viewport is one composition, and follow-on sections are visible when scrolling.

Validation evidence:

- `bun run --cwd apps/web test:unit -- tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts` passed with 2 files and 5 tests.
- `bun run --cwd apps/web format:check` passed after formatting the new page and sitemap.
- `bun run --cwd apps/web lint` passed with 0 warnings and 0 errors.
- `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck` passed and listed `/worker-seal-team-6` as a static route.
- `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-worker-seal-team-6-public-landing-page.md` passed before moving this file to `completed/`.
- `bun run programs:lint` passed.
- `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-14-worker-seal-team-6-public-landing-page.md docs/programs/active/2026-05-13-template-first-web-convex-architecture apps/web/src/content/docs/configure-the-homepage.mdx docs/ship-by-sunday/design-pack/documentation.md` passed before moving this file to `completed/`.
- `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-worker-seal-team-6-public-landing-page.md` passed after moving this file to `completed/`.
- `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-worker-seal-team-6-public-landing-page.md docs/programs/active/2026-05-13-template-first-web-convex-architecture apps/web/src/content/docs/configure-the-homepage.mdx docs/ship-by-sunday/design-pack/documentation.md` passed after the move.
- `bun lint` passed after removing two unused imports in `packages/local-runner/src/workflows/worker-foundations-install/templates.ts`; the root unknown-boundary lint passed.
- `bun run --cwd packages/local-runner format:check` passed after the unused-import fix.
- `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck` passed.
- Browser proof used `bun run --cwd apps/web dev:web:webpack -- -p 3100` after the default Turbopack dev server hit the existing `proxy.ts` parse error. At 1440 by 900, `/worker-seal-team-6` had no horizontal overflow, the founder proof image loaded with natural size 417 by 264, the primary CTA was visible, and the next section began at 886px in a 900px viewport. At 390 by 844 mobile emulation, the page had no horizontal overflow, the image loaded with natural size 390 by 247, the primary and secondary hero CTAs were visible at full width, the desktop nav was hidden, and the next section began at 837px in an 844px viewport.
- Screenshots were captured at `codex-scripts/worker-seal-team-6-desktop.png` and `codex-scripts/worker-seal-team-6-mobile.png`.

## Interfaces and Dependencies

This slice depends on Next.js App Router pages, static route metadata, `next/image`, the existing public site header, existing UI button primitives, lucide icons, public asset paths, the route config object, and the current support Telegram link already used elsewhere in product config. It intentionally does not depend on live Cal.com, Stripe, Convex writes, Resend, Sentry, Clerk authentication, or new environment variables.
