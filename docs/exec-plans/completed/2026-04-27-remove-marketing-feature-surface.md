---
title: Remove Marketing Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Move homepage marketing code out of the feature tree and into explicit app-private, app-library, and shared UI owners without changing the public homepage.
post_build_recap: Homepage UI now lives under app-private root owners, homepage content and render/schema helpers live under app-owned content and library modules, shared effect primitives live directly in components/ui, and the old features tree is gone.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/completed/2026-04-26-remove-feature-folder-surface/planning-brief-18.md
read_when:
  - Resuming the marketing feature-folder removal slice.
  - Checking why homepage code lives under app-owned private folders.
  - Validating that no marketing feature imports remain.
---

# Remove Marketing Feature Surface

This is a living execution plan for deleting the marketing feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The public homepage should keep rendering the same offer, copy, CTA behavior, structured data, and section order, but its code should no longer be hidden under `apps/web/features/marketing`. The homepage route owns its public UI, content, render model, and JSON-LD contract, while reusable effect primitives belong in `apps/web/components/ui`. This final slice is ready when `apps/web/features` is gone, the focused homepage and public-surface tests still pass, and the Program can be completed after the merged main commit proves itself in production.

## Progress

- [x] 2026-04-27 EDT: Verified PR #168 merged at `8d3e0d50d0cd68ad0458050dc8b48e0a40f90818` with main CI, Convex Production Deploy, Production Release Proof default_ship, billing_integration, and release_gate passing.
- [x] 2026-04-27 EDT: Created branch `codex/remove-marketing-feature-surface` from current `main`.
- [x] 2026-04-27 EDT: Confirmed `apps/web/features/marketing` is the only remaining top-level feature folder.
- [x] 2026-04-27 EDT: Created planning brief 18 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved homepage UI to `apps/web/app/_components/home-page`, homepage content to `apps/web/app/_content/home-page.ts`, homepage render-model and structured-data helpers to `apps/web/app/_lib`, and reusable effect implementations to `apps/web/components/ui`.
- [x] 2026-04-27 EDT: Deleted the empty `apps/web/features` tree and confirmed current `apps/web` scans return no `features/marketing` references.
- [x] 2026-04-27 EDT: Focused pure homepage, public metadata, blog, curriculum contract, and HomePagePrimaryCta integration-ui tests passed locally.
- [x] 2026-04-27 EDT: App format check, app lint, app typecheck, plan lint, Program lint, markdown lint, old-path scans, Convex schema/generated diff check, local built-homepage smoke, and `git diff --check` passed.
- [x] 2026-04-27 EDT: PR integration CI caught the blueprint download snapshot still including the deleted `apps/web/features` directory. Updated the customer-safe repo snapshot manifest and generated starter guidance to use `apps/web/app/_content/home-page.ts`.

## Surprises & Discoveries

The marketing folder contains the root homepage, homepage content, render-model helpers, JSON-LD helpers, a promo banner, reusable motion/effect primitives that are already re-exported from `apps/web/components/ui`, and two currently unused helper/data modules. The reusable primitives should be promoted into their existing `components/ui` files so current UI imports stay canonical.

The local React render-to-string tests for `EncryptedText` and marketing effects still hit this checkout's known duplicate-React `Invalid hook call` issue through the motion/framer-motion dependency graph. Pure homepage contracts, integration-ui proof, app lint, and app typecheck pass locally; clean-install PR static is the authoritative full-unit proof for those React-heavy unit files.

The blueprint compiler customer-safe snapshot manifest still listed `apps/web/features` as an included directory after the folder was deleted. That was a real integration failure in the download route, so the snapshot contract now follows the new app-owned homepage content path instead of recreating a compatibility folder.

## Decision Log

Decision: Move homepage UI to `apps/web/app/_components/home-page`.
Rationale: The homepage is the root App Router route, and Next.js private folders make the UI owner explicit without creating route segments.
Date: 2026-04-27

Decision: Move homepage content to `apps/web/app/_content/home-page.ts` and behavior helpers to `apps/web/app/_lib`.
Rationale: The content, render model, and structured-data helpers are app-owned public homepage contracts consumed by the root route, blog promo content, and tests.
Date: 2026-04-27

Decision: Move marketing effect implementations into the existing `apps/web/components/ui` files.
Rationale: Those files already define the public shared UI import surface; replacing re-exports with implementations keeps the UI inventory intact while deleting the feature folder.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. `apps/web/features/marketing` and the empty `apps/web/features` container have been deleted. Homepage UI now lives under `apps/web/app/_components/home-page`, homepage content lives at `apps/web/app/_content/home-page.ts`, homepage render-model and structured-data helpers live under `apps/web/app/_lib`, and the shared effect primitives live directly in the existing `apps/web/components/ui` files. The blueprint download snapshot no longer tries to scan `apps/web/features`, and generated starter instructions now point to the app-owned homepage content path. Visible homepage copy, section order, CTA behavior, structured data rules, blog route behavior, public metadata behavior, checkout, billing, Stripe, Convex schema, generated Convex files, and environment behavior were intentionally unchanged.

## Context and Orientation

The root public page is `apps/web/app/page.tsx`. At the start of this slice it imported `HomePage` and `HomePageStructuredData` from `apps/web/features/marketing/components`. Homepage default copy and assets lived in `apps/web/features/marketing/content/home.ts`. Homepage section gating and CTA targets were built by `apps/web/features/marketing/lib/home-page-render-model.ts`, which combined `starterConfig.homePage` from `apps/web/config/product.ts` with the content file. JSON-LD was produced by `apps/web/features/marketing/lib/home-page-structured-data.ts` and rendered by `components/home-page/home-page-structured-data.tsx`. Blog promo content imports the homepage content from `apps/web/app/blog/_content/blog.ts`. Several `apps/web/components/ui` files re-exported effect components from the marketing feature folder.

### In Scope

Move homepage React UI from `apps/web/features/marketing/components/home-page*` to `apps/web/app/_components/home-page`.

Move homepage content from `apps/web/features/marketing/content/home.ts` to `apps/web/app/_content/home-page.ts`.

Move homepage render-model and structured-data helpers from `apps/web/features/marketing/lib` to `apps/web/app/_lib`.

Move the implementation of `Cover`, `EncryptedText`, `HeroHighlight`, `PointerHighlight`, and `TextHoverEffect` into the existing `apps/web/components/ui` files.

Update imports in app routes, blog content, tests, and current docs away from `@/features/marketing` and textual `features/marketing` ownership references.

Delete `apps/web/features/marketing` after scans are clean.

Update this ExecPlan and the owning Program packet as implementation and validation complete.

### Out Of Scope

Do not change homepage copy, section order, layout, motion behavior, `#system` or `#pricing` anchors, checkout CTA behavior, pricing, promo code behavior, Stripe, billing, webhook behavior, Convex schema, generated Convex files, environment behavior, blog route behavior, public metadata route behavior, or route URLs.

Do not delete the `apps/web/components/ui` inventory.

Do not add compatibility re-export folders under `apps/web/features/marketing`.

## Plan of Work

First, move homepage route-owned UI to `apps/web/app/_components/home-page` and update the root page import. Keep component names and props stable so the rendered tree does not change.

Next, move homepage content to `apps/web/app/_content/home-page.ts`, then move the render-model and JSON-LD helpers to `apps/web/app/_lib`. Update blog promo content, homepage components, and tests to import those app-owned contracts.

Then, replace the shared UI re-export files with the effect implementations currently under `apps/web/features/marketing/components/effects`. Update homepage and tests to import those primitives from `apps/web/components/ui`.

Finally, update current docs to point future agents at the new ownership map, scan for old marketing paths, delete the empty feature tree, and run focused validation before broad app and planning gates.

## Milestones

The first milestone is homepage app ownership. It is complete when the root page, homepage components, homepage content, render model, and structured-data helper all import from `apps/web/app/_components`, `apps/web/app/_content`, and `apps/web/app/_lib`.

The second milestone is shared UI primitive ownership. It is complete when the effect implementation files live directly under `apps/web/components/ui` and no current source imports effect primitives from `features/marketing`.

The third milestone is feature-folder deletion. It is complete when `apps/web/features/marketing` and then `apps/web/features` are absent and old-path scans return no current app, test, or current docs references except historical completed plans.

The fourth milestone is validation and release handoff. It is complete when focused tests, app gates, plan/program/markdown lint, import scans, and `git diff --check` pass locally, then PR CI and production proof pass for the merged main commit.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Move files with `git mv` so rename history is preserved. After imports are updated, run scans:

    rg '@/features/marketing|features/marketing|\.\./features/marketing|\.\./\.\./features/marketing|\.\./\.\./\.\./features/marketing' apps/web
    find apps/web/features -maxdepth 3 -type d
    git diff --name-only -- apps/web/convex/schema.ts apps/web/convex/_generated

The old-path scan should return no current source or current docs references. The `find` command should fail because the `features` folder is gone. The Convex diff command should return no paths.

## Validation and Acceptance

Acceptance requires `apps/web/features/marketing` and the empty `apps/web/features` container to be deleted, all current marketing feature imports and current docs ownership references to be gone, the homepage render model and structured data tests to pass, public metadata and blog consumers to remain aligned, app format/lint/typecheck to pass, and production proof to pass after merge.
The blueprint download route and compiler repo-generation tests must also pass because the customer-safe starter snapshot used to include the deleted feature directory.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts tests/unit/public-metadata-routes.test.ts tests/unit/encrypted-text.test.tsx tests/unit/marketing-effects.test.tsx tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-primary-cta.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-marketing-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-marketing-feature-surface.md
    git diff --check

After this PR merges, inspect the `CI`, `Convex Production Deploy`, and `Production Release Proof` runs for the merged `main` commit and confirm they pass. If release scope schedules billing proof, let it complete and record the result.

## Idempotence and Recovery

These changes are file moves, import rewrites, and docs updates. If a scan finds an old marketing path, update the consumer to the new explicit owner instead of adding a compatibility re-export. If focused tests fail, first compare imports and the moved file content before changing homepage behavior.

If a homepage structured-data test fails, preserve the existing schema truth rules: `Organization` always remains, `FAQPage` appears only when FAQ is visible, and `Product` appears only when pricing is visible and its CTA target is checkout.

## Artifacts and Notes

Initial inventory shows `apps/web/features/marketing` has homepage components, effect primitives, homepage content, homepage render-model helpers, JSON-LD helpers, and unused GitHub/globe helpers. Initial current consumers are the root app page, blog content, `apps/web/components/ui` re-export files, focused homepage tests, and current docs.

Initial import scan:

    rg -n '@/features/marketing|features/marketing|\.\./features/marketing|\.\./\.\./features/marketing' apps/web

The scan shows current imports in `apps/web/app/page.tsx`, `apps/web/app/blog/_content/blog.ts`, shared UI re-exports, homepage tests, and docs. Historical completed ExecPlans may keep old-path history unless they are part of the current Program surface being updated.

## Interfaces and Dependencies

This slice depends on Next.js App Router private-folder colocation under `apps/web/app`, the root homepage route `apps/web/app/page.tsx`, shared UI primitives under `apps/web/components/ui`, homepage starter config in `apps/web/config/product.ts`, display selectors in `apps/web/config/starter-selectors.ts`, metadata helpers in `apps/web/platform/next`, blog content under `apps/web/app/blog/_content`, and production release proof for the merged `main` commit.
