---
title: Add Starter Interactive Preview
status: complete
created_at: 2026-05-15
completed_at: 2026-05-15
summary: Add a Starter-specific interactive preview to `/starter` while preserving checkout, draft handoff, and the public route visual system.
post_build_recap: The Starter page now mounts a scoped interactive preview under the hero, reuses old codebase-demo draft/card internals through a shared progress helper, keeps checkout on `offerId="starter"`, and passes focused route, preview, Program, plan, typecheck, and diff checks; app format and root lint remain blocked by unrelated public-docs WIP in the local worktree.
program_id: starter-interactive-preview
planning_brief: docs/programs/active/2026-05-15-starter-interactive-preview/planning-brief-1.md
read_when:
  - Resuming the Starter interactive preview implementation.
  - Validating the `/starter` public marketing surface.
  - Checking why the old homepage demo wrapper must not be mounted on `/starter`.
---

# Add Starter Interactive Preview

This ExecPlan is a living document for adding a focused interactive preview to the public Starter page.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The public Starter offer page should let a visitor feel the first part of the product before checkout. After this change, a visitor on `/starter` can type product facts, choose design DNA, choose pricing, see the locked repo/codebase promise, and start Starter checkout with those answers saved into the same browser draft storage that protected Starter onboarding already reads. The page should still look like the current T3 Code public route system and should not bring back the old homepage section stack.

## Progress

- [x] 2026-05-15: Read the Program packet, public Starter route, old codebase demo internals, checkout button, draft storage hook, public route surface components, and relevant tests.
- [x] 2026-05-15: Created this child ExecPlan from `planning-brief-1.md`.
- [x] 2026-05-15: Extracted the reusable sidebar progress helper from the old homepage demo.
- [x] 2026-05-15: Added the Starter-specific client preview component under `apps/web/src/components/starter/`.
- [x] 2026-05-15: Mounted the preview below the Starter hero without changing the hero checkout CTA.
- [x] 2026-05-15: Added focused tests for rendering, `offerId="starter"`, and local draft persistence.
- [x] 2026-05-15: Validated focused tests, Program/plan docs, typecheck, `git diff --check`, and desktop/mobile browser proof.
- [x] 2026-05-15: Recorded unrelated local validation blockers for app format and root lint.
- [x] 2026-05-15: Updated this ExecPlan and the parent Program with final evidence and retrospective notes.

## Surprises & Discoveries

The initial working tree was on `codex/public-telegram-support`, not local `main`. The branch was switched to `main`, then `codex/starter-interactive-preview` was created from `main` before code implementation.

The active Program indexes currently include an unrelated `2026-05-16-public-docs-retirement` entry from a separate empty folder. This Starter slice must not stage that unrelated folder or rely on it for validation.

Browser proof found mobile horizontal overflow at 390px because the preview grid items held a 614px min-content width. Adding `min-w-0` to the preview grid and children removed the overflow. The preview CTA was also changed from sticky to static so the public route mobile layout reads cleanly.

The local checkout contains unrelated public-docs retirement WIP. It removes `docsDisplayConfig` from `apps/web/src/config/starter-selectors.ts`, changes `apps/web/tests/unit/public-metadata-routes.test.ts`, and adds `unknown` to `apps/web/src/app/_content/public-content-inventory.ts`. Those changes block `bun run --cwd apps/web format:check`, the combined public metadata unit test command, and `bun lint`, but they are not part of the Starter preview patch.

Running `bun typecheck` invoked the app build path and uploaded PostHog source maps using the local environment. The command exited successfully.

## Decision Log

Decision: Keep `apps/web/src/app/(marketing)/starter/page.tsx` as a Server Component and pass `homePageContent.productPreviewSection` into a smaller Client Component.
Rationale: Next.js App Router defaults to Server Components. The route assembly does not need browser state; only the preview controls need `use client`.
Date: 2026-05-15.

Decision: Reuse old codebase-demo cards and draft storage, but do not import `CodebaseDemoSectionBlock` into `/starter`.
Rationale: The full wrapper includes the old dark full-screen homepage hero and existing-codebase branch. The useful behavior is in the smaller cards, draft hook, storage, and progress logic.
Date: 2026-05-15.

Decision: Use the existing `CheckoutButton` directly for the preview CTA with `offerId="starter"`.
Rationale: This preserves checkout behavior while making the revenue-critical offer id explicit on the Starter page.
Date: 2026-05-15.

## Outcomes & Retrospective

The plan delivered a scoped `/starter` preview without mounting the old homepage wrapper. `apps/web/src/components/starter/StarterInteractivePreview.tsx` owns the interactive Starter surface, `apps/web/src/components/starter/StarterPreviewCheckoutBar.tsx` owns the explicit Starter checkout CTA, and `apps/web/src/app/_components/home-page/sections/codebase-demo/codebase-demo-sidebar-progress.ts` lets the old homepage demo and new Starter preview share progress rules.

The existing `/starter` hero checkout CTA remains unchanged. The preview CTA uses `CheckoutButton offerId="starter"` and saves the draft through `draft.persistNow` before checkout. The old homepage demo integration test still passes.

Residual local validation risk is limited to unrelated public-docs WIP in this checkout. Focused Starter tests, browser proof, docs linting, Program linting, typecheck, and whitespace diff checks passed.

## Context and Orientation

The public Starter route is `apps/web/src/app/(marketing)/starter/page.tsx`. It currently renders a `PublicRoutePage`, the public site header, a hero section, a hero `CheckoutButton` with `offerId="starter"` and `testId="starter-checkout-cta"`, and a muted included-items section. That route must remain the public offer page for Starter.

The current public visual system is in `apps/web/src/components/layout/public-route-surface.tsx`. It provides the full-page shell, public containers, panels, titles, descriptions, icons, and list items used by the current `/`, `/starter`, `/workers`, and `/worker-seal-team-6` pages.

The old interactive demo lives under `apps/web/src/app/_components/home-page/sections/codebase-demo/`. `CodebaseDemoSectionBlock` is the old full homepage wrapper and must not be mounted on `/starter`. The reusable pieces are `use-home-page-codebase-draft.ts`, `home-page-codebase-draft-storage.ts`, `codebase-demo-card.tsx`, `codebase-demo-foundation-card.tsx`, `codebase-demo-design-card.tsx`, `codebase-demo-pricing-card.tsx`, `codebase-demo-locked-card.tsx`, and `codebase-demo-sidebar.tsx`.

The content for those old demo pieces is in `apps/web/src/app/_content/home-page.ts` as `homePageContent.productPreviewSection`. Even though the object name says homepage, the field is the current content source for the idea-to-codebase preview and is already wired to the canonical Codebase section definitions.

The protected Starter draft handoff reads the same browser storage through `apps/web/src/lib/codebase-flow/use-codebase-local-draft-seeder.ts`. Do not change the storage key or schema in this slice.

### In Scope

This slice adds one focused Starter preview component under `apps/web/src/components/starter/`, extracts any shared old-demo helper needed to avoid duplicating logic, mounts the preview near the hero on `/starter`, and updates focused public marketing tests and interactive preview tests.

This slice may make small compatibility-safe changes under `apps/web/src/app/_components/home-page/sections/codebase-demo/` when they allow both the old homepage demo and the new Starter preview to share behavior.

This slice updates this ExecPlan and the parent Program with progress and validation evidence.

### Out Of Scope

Do not change checkout session creation, Stripe offer ids, webhook handling, entitlements, protected Starter routes, Workers pages, Worker Seal Team 6, Cal.com booking, Telegram widget mounting, generated repo output, or MDX cleanup.

Do not restore the old homepage stack to `/starter`, including the old full-screen leverage hero, existing-codebase branch, Doctor Pass audit section, social proof, Program section, FAQ, or homepage pricing footer.

Do not touch unrelated active Program folders such as `docs/programs/active/2026-05-16-public-docs-retirement/`.

## Plan of Work

First, extract `buildSidebarProgress` from `apps/web/src/app/_components/home-page/sections/codebase-demo/codebase-demo-section.tsx` into a small sibling module. Keep the existing `CodebaseDemoSectionBlock` behavior unchanged by importing the extracted helper back into that file.

Next, add `apps/web/src/components/starter/StarterInteractivePreview.tsx` as a Client Component. It should accept `section: HomePageContent["productPreviewSection"]` and `offerPriceDisplay: string`, create a draft with `useHomePageCodebaseDraft`, compute progress with the shared helper, and render only the Starter idea path: Foundation, Design, Pricing, and a locked generated-preview/repo promise. The component should use `PublicRouteSection`, `PublicRouteContainer`, and public route title/eyebrow styling around the reused cards so the preview belongs to the current public route system.

Then, mount the component in `apps/web/src/app/(marketing)/starter/page.tsx` directly after the hero section. Import `homePageContent` on the server route and pass `homePageContent.productPreviewSection` to the client component. Leave the existing hero `CheckoutButton` untouched.

Finally, update tests. `apps/web/tests/unit/public-marketing-surfaces.test.tsx` should prove the Starter page renders the preview and both Starter checkout CTAs use the Starter offer. A new integration UI test should render `StarterInteractivePreview`, type product facts, change design/pricing, click the preview CTA, and assert the existing local storage envelope contains those values.

## Milestones

Milestone 1 extracts shared demo progress and confirms the old homepage demo still imports cleanly. Success means the old `CodebaseDemoSectionBlock` still renders the same section progress and its integration test still passes.

Milestone 2 adds and mounts the Starter preview. Success means `/starter` contains a `data-testid="starter-interactive-preview"` region, the preview CTA has `data-testid="starter-preview-checkout-cta"`, and no old existing-codebase branch test id appears on `/starter`.

Milestone 3 adds focused tests and browser proof. Success means the public surface and preview interaction tests pass, browser screenshots show usable desktop and mobile layouts, and broad validation either passes or names unrelated blockers precisely.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday` on branch `codex/starter-interactive-preview`.

Create the shared progress helper, then import it from the old demo wrapper:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-product-preview.test.tsx

Add `apps/web/src/components/starter/StarterInteractivePreview.tsx` and mount it in `apps/web/src/app/(marketing)/starter/page.tsx`. The route should still statically render a button with `data-testid="starter-checkout-cta"` and `data-offer-id="starter"` in the unit surface test.

Add or update tests, then run the narrow checks:

    bun run --cwd apps/web test:unit -- tests/unit/public-marketing-surfaces.test.tsx tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/starter-interactive-preview.test.tsx tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/checkout-button.test.tsx

Run docs validation for this plan and Program packet:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-add-starter-interactive-preview.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-add-starter-interactive-preview.md docs/programs/active/2026-05-15-starter-interactive-preview docs/programs/active/index.md docs/programs/README.md

Run the requested broader gates:

    bun run --cwd apps/web format:check
    bun lint
    bun typecheck
    git diff --check

If browser proof is practical, run the web app locally and capture `/starter` at desktop and mobile widths. The useful observation is that the hero remains readable, the preview appears directly below or near the hero, the cards do not overlap, the preview CTA appears after the locked generated preview, and the visual treatment matches the public route page rather than the old black homepage hero.

## Validation and Acceptance

Acceptance is observable on `/starter`: the page shows the existing hero with its checkout CTA, then shows a Starter-specific preview that lets a visitor edit product facts, choose a design preset, choose pricing, see locked repo/codebase preview cards, and start checkout with `offerId="starter"`.

The implementation must not render the old existing-codebase branch, old full-screen homepage leverage hero, or unrelated homepage sections on `/starter`.

The existing homepage/demo code must keep working. The old `home-page-product-preview` integration test is the guardrail for that compatibility.

The test brief for this feature is: Feature: Starter interactive preview on the public Starter offer page. Risk: P1 core product because it is checkout-adjacent and writes the draft state used after checkout, although it does not change checkout session creation or entitlements. Source of truth: visible `/starter` UI, `CheckoutButton` offer id props, and the existing local storage draft envelope. Must work: static Starter route render, preview render, editing Foundation, selecting Design, toggling Pricing, saving before checkout, and old homepage demo compatibility. Must fail safely: checkout save errors stay within existing `CheckoutButton` behavior, absent local storage starts from defaults, and old homepage demo route continues to render. Tests: public marketing unit test, Starter preview integration UI test, old homepage demo integration UI test, checkout button integration UI test, desktop/mobile browser smoke, format/lint/typecheck. CI gate: baseline web app checks plus root lint/typecheck.

### Test Commands

    bun run --cwd apps/web test:unit -- tests/unit/public-marketing-surfaces.test.tsx tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/starter-interactive-preview.test.tsx tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/checkout-button.test.tsx
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-add-starter-interactive-preview.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-add-starter-interactive-preview.md docs/programs/active/2026-05-15-starter-interactive-preview docs/programs/active/index.md docs/programs/README.md
    bun run --cwd apps/web format:check
    bun lint
    bun typecheck
    git diff --check

Observed validation on 2026-05-15:

    bun run --cwd apps/web test:unit -- tests/unit/public-marketing-surfaces.test.tsx
    1 file passed, 6 tests passed

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/starter-interactive-preview.test.tsx tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/checkout-button.test.tsx
    3 files passed, 15 tests passed

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-add-starter-interactive-preview.md
    ok

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-add-starter-interactive-preview.md docs/programs/active/2026-05-15-starter-interactive-preview docs/programs/active/index.md docs/programs/README.md
    ok

    bun run programs:lint
    ok

    bun typecheck
    passed

    git diff --check
    passed

    bun run --cwd apps/web format:check
    failed on unrelated apps/web/tests/unit/public-metadata-routes.test.ts public-docs WIP formatting

    bun lint
    failed on unrelated apps/web/src/app/_content/public-content-inventory.ts explicit unknown from public-docs WIP

The combined public metadata route command also failed because unrelated public-docs WIP removes `docsDisplayConfig` while `apps/web/src/app/(marketing)/docs/_lib/docs-metadata.ts` still imports it.

## Idempotence and Recovery

All code changes are additive or small extractions. If the new preview causes trouble, remove the import and render call from `apps/web/src/app/(marketing)/starter/page.tsx` and the new `apps/web/src/components/starter/StarterInteractivePreview.tsx` file, leaving the old homepage demo untouched.

If local storage contains stale or malformed preview data during manual testing, clear browser local storage and reload `/starter`; the draft hook falls back to defaults when no valid envelope exists.

If broad validation fails in unrelated files, keep the focused preview tests passing and record the exact unrelated file or command failure in this ExecPlan and the final PR notes.

## Artifacts and Notes

Important implementation paths:

    apps/web/src/app/(marketing)/starter/page.tsx
    apps/web/src/components/starter/StarterInteractivePreview.tsx
    apps/web/src/app/_components/home-page/sections/codebase-demo/codebase-demo-sidebar-progress.ts
    apps/web/tests/unit/public-marketing-surfaces.test.tsx
    apps/web/tests/integration-ui/starter-interactive-preview.test.tsx

Expected static proof from the public surface test includes:

    data-testid="starter-checkout-cta"
    data-testid="starter-interactive-preview"
    data-testid="starter-preview-checkout-cta"
    data-offer-id="starter"

Browser proof artifacts were captured under ignored `codex-scripts/artifacts/`:

    codex-scripts/artifacts/starter-preview-desktop-viewport.png
    codex-scripts/artifacts/starter-preview-mobile-viewport.png

The 390px mobile recheck reported `horizontalOverflow: false`, `scrollWidth: 379`, and a static preview checkout bar.

## Interfaces and Dependencies

`StarterInteractivePreview` depends on `HomePageContent["productPreviewSection"]`, `useHomePageCodebaseDraft`, `CodebaseDemoCard`, `CodebaseDemoSidebar`, `CheckoutButton`, and public route layout primitives.

The preview CTA must call `CheckoutButton` with `offerId="starter"` and `onBeforeCheckout={draft.persistNow}`. Do not call checkout APIs directly from the preview.

The shared sidebar progress helper depends on `HomePageCodebaseDraftFields` and the three default values already passed to `useHomePageCodebaseDraft`: default design preset id, default pricing model, and default price.

The storage contract remains `HOME_PAGE_CODEBASE_DRAFT_STORAGE_KEY` and `HomePageCodebaseDraftEnvelope` from `home-page-codebase-draft-storage.ts`.
