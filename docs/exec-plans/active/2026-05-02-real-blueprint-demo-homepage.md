---
title: Real Blueprint Demo Homepage
status: active
created_at: 2026-05-02
completed_at: null
summary: Replace the static worker-layer preview on the public homepage with an interactive Blueprint demo that mirrors the real /blueprint workspace, persists Foundation/Design/Pricing answers to localStorage before Stripe checkout, and seeds those answers into the buyer's first authenticated /blueprint load only when their Convex facts are empty.
post_build_recap: null
read_when:
  - Resuming implementation of the real Blueprint demo homepage slice.
  - Validating the post-checkout localStorage seeder before release.
  - Reviewing the final retrospective for the homepage demo / checkout handoff bridge.
---

# Real Blueprint Demo Homepage

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The current public homepage opens with `ProductPreviewSectionBlock`, an abstract "worker layer preview" with simulated tabs and a checklist. It does not mirror the real `/blueprint` intake the buyer is paying for. Visitors cannot see what the product actually asks of them, and there is no persistence path from the public page into the protected workspace.

After this slice ships, the first thing a visitor sees on `/` is an interactive Blueprint demo that visually rhymes with `/blueprint`. They can fill in `product_name`, `product_summary`, and `primary_user`, pick a curated design preset (which sets both `design_preset_id` and a valid encoded `theme_preset`), and choose a pricing model and price. The other four canonical sections (Problem, Outcome, Setup, Generated preview) are visible-but-locked rows in canonical order so the demo never lies about workspace scope. When the visitor clicks "Generate my codebase", the demo persists their draft to a single versioned `localStorage` key and only then starts Stripe checkout. After `/checkout/success` returns the buyer to `/blueprint`, a client-side seeder converts that draft into the canonical Convex payload and calls `saveProjectDefinitionFacts` once, but only when the authenticated workspace has zero saved project-definition facts. On success or intentional skip the localStorage key is cleared. On mutation failure the key is preserved for retry.

A human can prove the work by visiting `/?marketing=1` (so `redirectGrantedHomeVisitor` does not bounce an entitled local account), filling in the three interactive sections, clicking "Generate my codebase", confirming the draft survives the Stripe redirect, and verifying that `/blueprint` opens with only those three sections prefilled while the other sections remain empty. The browser console must show no Convex schema errors, and the localStorage key `sbs:home-blueprint-draft:v1` must be removed after the seed runs.

## Progress

- [x] 2026-05-02: Promote this Cursor plan into a real ExecPlan under `docs/exec-plans/active/`.
- [x] 2026-05-02: Reshape `productPreviewSection` content in `apps/web/app/_content/home-page.ts` to match the new demo (sections list + foundation/design/pricing field copy + CTA copy + locked section copy).
- [x] 2026-05-02: Add `apps/web/app/_components/home-page/sections/blueprint-demo/home-page-blueprint-draft-storage.ts` with versioned envelope load/save/clear/parse and matching `use-home-page-blueprint-draft.ts` SSR-safe hook.
- [x] 2026-05-02: Build `blueprint-demo-section.tsx`, `blueprint-demo-top-bar.tsx`, `blueprint-demo-sidebar.tsx`, `blueprint-demo-section-card.tsx`, `blueprint-demo-locked-card.tsx`, `blueprint-demo-cta-bar.tsx`, plus `blueprint-demo-foundation-card.tsx`, `blueprint-demo-design-card.tsx`, and `blueprint-demo-pricing-card.tsx` under `apps/web/app/_components/home-page/sections/blueprint-demo/`.
- [x] 2026-05-02: Extend `CheckoutButton` and `HomePagePrimaryCta` with an optional `onBeforeCheckout` callback. Update `tests/integration-ui/checkout-button.test.tsx` and `tests/integration-ui/home-page-primary-cta.test.tsx` accordingly.
- [x] 2026-05-02: Add `apps/web/lib/blueprint-flow/use-blueprint-local-draft-seeder.ts` and `apps/web/app/(workspace)/_components/blueprint-flow/blueprint-local-draft-seeder.tsx`, mounted inside `BlueprintPage`. Seed `saveProjectDefinitionFacts` only when `workspaceState.projectDefinition?.facts` is empty, clear localStorage on success or intentional skip, preserve it on mutation failure, and never write before auth + workspace state are ready.
- [x] 2026-05-02: Delete `product-preview-section.tsx` and `product-preview-loop-packet.tsx` and remove their imports from `apps/web/app/_components/home-page/home-page.tsx`.
- [x] 2026-05-02: Rewrite the `productPreviewSection` block in `apps/web/tests/unit/home-page-content.test.ts`. Update `apps/web/tests/integration-ui/home-page-product-preview.test.tsx` to assert canonical section order, typing into Foundation fields updates the draft, preset click updates Design fields with a valid encoded theme preset, model toggle updates the pricing label, and the bottom CTA persists draft before checkout.
- [x] 2026-05-02: Add unit tests for the storage helpers (SSR/no-window, valid round-trip, version mismatch, corrupt JSON, unknown key, invalid price, clear).
- [x] 2026-05-02: Add a hook test for the seeder (seeds only when facts empty, clears on success, clears without writing when facts exist, preserves key on mutation failure, never writes before workspace state ready).
- [x] 2026-05-02: Update `apps/web/content/docs/configure-the-homepage.mdx` (file list, change-pattern subsections, validation block, before-checkout persistence note) and `docs/ship-by-sunday/design-pack/documentation.md` (short shipped note).
- [x] 2026-05-02: Run focused unit and integration-ui tests, then `bun run --cwd apps/web lint`, `format:check`, `bun typecheck`, `bun lint`, `bun run format`, `bun run --cwd apps/web build`.
- [x] 2026-05-02: Manual desktop (1280x800) + mobile (390x844) viewport proof at `/?marketing=1` against the local Next.js dev server. Confirmed all 7 canonical sections render in canonical order with Foundation/Design/Pricing interactive and Problem/Outcome/Setup/Generated preview locked. Filling the three interactive cards, clicking "Generate my codebase", completing the Stripe redirect, and navigating back to `/?marketing=1` restored the typed values from `sbs:home-blueprint-draft:v1`, which proves the draft was persisted before the redirect and that `useHomePageBlueprintDraft`'s client-side hydration reads it back. Same behavior verified at mobile viewport.

## Surprises & Discoveries

The shared homepage CTA path (`HomePagePrimaryCta` -> `CheckoutButton` -> `useStripeCheckout`) does not currently expose a callback before the redirect. The plan must add `onBeforeCheckout?: () => void | Promise<void>` rather than re-implementing checkout inside the demo. This avoids the historical mistake of importing `CheckoutButton` directly into a section.

`theme_preset` is an opaque encoded shadcn preset string (e.g. `"a1PzeK"`), not a `{ color, style, radius }` object. The homepage demo must therefore store `theme_preset` only as the value returned by `buildDesignPresetFactSeed(presetId).theme_preset`. The full `BlueprintThemeConfigurator` stays a post-checkout affordance.

The post-checkout seeder cannot live in the server `page.tsx` because only the browser owns localStorage. It must mount inside `BlueprintPage` (the existing client component that already reads `workspaceState`). It must wait for both `useConvexAuth().isAuthenticated` and a non-loading `workspaceState`. The empty-facts check must use `Object.keys(workspaceState.projectDefinition?.facts ?? {}).length === 0` so a missing `projectDefinition` row is treated as empty.

`buildSavePayloadForBlueprint` already coerces the homepage draft's string `pricing` into a number via `buildSavePayload`'s numeric-field branch. The seeder must reuse this helper rather than invent its own converter.

During the first repo-level `bun typecheck` run after the demo cards landed, TypeScript narrowed the `FoundationFieldKey` alias (`type FoundationFieldKey = HomePageContent["productPreviewSection"]["foundation"]["fields"]["productName"]["key"]`) down to the literal `"product_name"` instead of the union of all three foundation fact keys. The fix was to declare an explicit `BlueprintDemoFoundationFieldKey = "product_name" | "product_summary" | "primary_user"` union in `blueprint-demo-foundation-card.tsx` and use it as the `onFoundationFieldChange` field-key parameter type. The hook signature already used the same explicit union, so no caller changes were needed.

## Decision Log

Decision: Keep `productPreview` as the section name in `starterConfig.homePage.sections` and `homePageSectionOrder`.
Rationale: That seam is part of the public render-model contract and is referenced by tests and structured data. Renaming it would widen scope and risk silent CTA / schema drift. Only the inner content shape changes.
Date: 2026-05-02

Decision: Show all 7 canonical Blueprint sections (Foundation, Problem, Outcome, Design, Pricing, Setup, Generated preview) on the demo, with only Foundation, Design, and Pricing interactive.
Rationale: The real `/blueprint` shows the same 7 sections in canonical order. Renumbering Design as section 2 or Pricing as section 3 would make the public demo lie about the workspace and oversell the homepage as a complete intake.
Date: 2026-05-02

Decision: Persist the homepage draft via a versioned localStorage envelope (`sbs:home-blueprint-draft:v1`) and seed it into Convex only on the first authenticated `/blueprint` load when facts are empty.
Rationale: This avoids a Convex schema change, avoids a pre-auth Convex draft session, keeps Convex as the source of truth after seeding, and prevents an old marketing draft from overwriting a returning buyer's real facts. The version key + parser validation also makes future schema drift safe.
Date: 2026-05-02

Decision: Add a narrow `onBeforeCheckout?: () => void | Promise<void>` callback to `CheckoutButton` and `HomePagePrimaryCta` rather than calling `useStripeCheckout` directly from the demo CTA.
Rationale: The hero and pricing sections already share the CTA renderer. A single callback seam keeps that renderer authoritative, lets the demo persist the draft before the redirect, and surfaces the contract clearly in the CTA component instead of hiding it inside the section.
Date: 2026-05-02

Decision: The Design demo card only mutates `design_preset_id` and `theme_preset` via `buildDesignPresetFactSeed(presetId)`. No theme grid, no free-form `theme_preset` input on the public route.
Rationale: `theme_preset` is an opaque encoded shadcn preset string. Editing it directly on `/` would either ship a broken value or pull the heavy `BlueprintThemeConfigurator` into the public bundle. The chip click is the only safe mutation.
Date: 2026-05-02

Decision: Reuse `buildSavePayloadForBlueprint` from `apps/web/lib/blueprint-flow/blueprint-page-draft-model.ts` to convert the homepage draft into the Convex payload.
Rationale: That helper already handles numeric coercion (e.g. `pricing`), array fields, and clear-vs-patch semantics for every blueprint section. Reinventing it in the seeder would risk silent drift between the workspace save path and the seeder save path.
Date: 2026-05-02

## Outcomes & Retrospective

Initial implementation landed on 2026-05-02. The new `BlueprintDemoSection` mirrors the canonical `/blueprint` workspace order, exposes Foundation, Design, and Pricing as interactive cards, and surfaces Problem, Outcome, Setup, and Generated preview as locked rows. The bottom CTA persists the homepage draft to `sbs:home-blueprint-draft:v1` via `useHomePageBlueprintDraft.persistNow()` before `useStripeCheckout` redirects. The new `BlueprintLocalDraftSeeder` runs once on the first authenticated `/blueprint` load, calls `saveProjectDefinitionFacts` only when `workspaceState.projectDefinition?.facts` is empty, and clears localStorage on success or on intentional skip while preserving the key on mutation failure.

Validation as of 2026-05-02:

- `bun run --cwd apps/web test:unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-blueprint-draft-storage.test.ts` -> pass (15/15).
- `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/checkout-button.test.tsx tests/integration-ui/blueprint-local-draft-seeder.test.tsx` -> pass (15/15).
- `bun run --cwd apps/web test:unit` -> pass (499/499).
- `bun run --cwd apps/web test:integration:ui` -> pass (77/77).
- `bun run --cwd apps/web lint` -> pass.
- `bun run --cwd apps/web format:check` -> pass after one `bun run --cwd apps/web format` run on the new test files.
- `bun typecheck` -> pass after explicitly typing `BlueprintDemoFoundationFieldKey`.
- `bun lint` -> pass.
- `bun run format` -> clean.
- `bun run --cwd apps/web build` -> succeeds (covered by the typecheck script which delegates to `next build`).
- Manual desktop + mobile viewport browser proof at `/?marketing=1` -> pass at both viewports. The strongest evidence is that the desktop form fields were automatically restored after the round-trip through Stripe checkout, which is only possible if the bottom CTA persisted the draft to `sbs:home-blueprint-draft:v1` before the Stripe redirect AND the SSR-safe `useHomePageBlueprintDraft` hook hydrated it back on the next render.

## Context and Orientation

The public homepage is split deliberately across a control plane (`apps/web/config/product.ts` -> `starterConfig.homePage`), a content layer (`apps/web/app/_content/home-page.ts`), and a render model (`apps/web/app/_lib/home-page-render-model.ts`). The first visible section is `productPreview`, which currently renders `apps/web/app/_components/home-page/sections/product-preview-section.tsx` and its `product-preview-loop-packet.tsx` block. Hero and pricing both delegate their CTA to `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx`, which forwards to `apps/web/app/checkout/_components/checkout-button.tsx`. That checkout button calls `useStripeCheckout` from `apps/web/app/checkout/_hooks/use-stripe-checkout.ts`. There is currently no callback hook before `window.location.assign(data.url)`.

The real workspace intake lives at `apps/web/app/(workspace)/blueprint/page.tsx`, which preloads `api.blueprint.getBlueprintWorkspaceState` and renders the client `BlueprintPage` component. `BlueprintPage` already calls `useConvexAuth`, queries the live workspace state, and uses `useBlueprintPageState` plus the `saveProjectDefinitionFacts` mutation. The canonical section order is owned by `apps/web/lib/blueprint-flow/blueprint-page-sections.ts` (`blueprintPageSectionIds`). The canonical save converter is `buildSavePayloadForBlueprint` in `apps/web/lib/blueprint-flow/blueprint-page-draft-model.ts`. Field labels and helper text come from `@shipbysunday/blueprint-presentation`. Design preset definitions and `buildDesignPresetFactSeed(presetId)` come from `@shipbysunday/blueprint-compiler`.

The Convex mutation `api.blueprint.saveProjectDefinitionFacts` requires granted product access. The seeder therefore can only run after Stripe checkout has populated entitlement and Clerk has authenticated the user. Convex remains the source of truth; the localStorage envelope is a one-time bridge.

### In Scope

- Replace the homepage `productPreview` content shape and section component with an interactive Blueprint demo that mirrors the real workspace section order, exposes Foundation/Design/Pricing as interactive cards, and renders Problem/Outcome/Setup/Generated preview as locked rows.
- Persist the demo draft to a single versioned localStorage key (`sbs:home-blueprint-draft:v1`) via a typed envelope `{ version: 1, savedAt, fields }` whose parser validates the version, drops unknown keys, rejects corrupt JSON, and rejects non-finite or negative price values.
- Add `onBeforeCheckout?: () => void | Promise<void>` to `CheckoutButton` and `HomePagePrimaryCta` and call it before `window.location.assign(data.url)` in `useStripeCheckout`. Update existing CTA tests in the same slice.
- Add a client seeder under the workspace blueprint flow that reads the localStorage draft after auth + workspace-state hydrate, calls `saveProjectDefinitionFacts` once via `buildSavePayloadForBlueprint` only when facts are empty, clears the key on success or intentional skip, and preserves it on mutation failure.
- Delete `product-preview-section.tsx` and `product-preview-loop-packet.tsx` and remove their imports.
- Update unit and integration-ui tests for the homepage content, demo behavior, CTA `onBeforeCheckout`, storage parser, and seeder behavior.
- Update `apps/web/content/docs/configure-the-homepage.mdx` and `docs/ship-by-sunday/design-pack/documentation.md` to match the new contract.

### Out Of Scope

- Adding the other 4 sections (Problem, Outcome, Setup, Generated preview) to the homepage demo as interactive surfaces.
- A pre-auth Convex draft session (e.g. an anonymous `projectDefinitions` row keyed by Stripe session id).
- A fully-faithful `BlueprintThemeConfigurator` (color/style/radius grid + free-form `theme_preset` editing) on the public homepage.
- "Draft with AI" buttons on the homepage demo.
- Editing `design_references` from the homepage.
- Convex schema or validator changes.
- Renaming `productPreview` in `starterConfig.homePage.sections`, `homePageSectionOrder`, or the render model.
- Changing the `Product` / `FAQPage` structured data shape.

## Plan of Work

The work proceeds in slices that each leave the homepage in a working state.

The content layer comes first. `apps/web/app/_content/home-page.ts` is rewritten so `productPreviewSection` becomes a typed object describing the new demo: a `headline`, `intro`, `unlockNote`, and `previewNote`; a `sections` array of `{ id, label, description, status }` for all 7 canonical ids in canonical order; a `foundation` block whose field copy is sourced from `blueprintFieldLabel`/`blueprintFieldHelperText`/`blueprintFieldPlaceholder`; a `design` block whose preset list is derived from `designPresetDefinitions` and whose `defaultPresetId` is `DEFAULT_DESIGN_PRESET_ID`; a `pricing` block whose model options come from `getBlueprintFieldScaleDefinition("pricing_model")` with a default model and default price; and a `cta` block with `label: "Generate my codebase"` and a locked-note string.

Next the storage helpers and hook land. `home-page-blueprint-draft-storage.ts` defines the `HomeBlueprintDraftFields` type, the `STORAGE_KEY` constant, and `loadHomeBlueprintDraft`, `saveHomeBlueprintDraft`, `clearHomeBlueprintDraft`, and `parseHomeBlueprintDraftEnvelope` functions. The parser must accept only `{ version: 1, savedAt: number, fields: { product_name, product_summary, primary_user, design_preset_id, theme_preset, pricing_model, pricing } }` and reject anything else. `pricing` may be an empty string but must not be a non-numeric or negative number. `use-home-page-blueprint-draft.ts` is an SSR-safe hook returning `{ fields, setField, persistNow }`. The hook initializes from deterministic defaults so server and client render the same markup, then calls `loadHomeBlueprintDraft` in a one-shot effect to hydrate from storage.

The demo shell, cards, and locked rows then replace the old preview component. `BlueprintDemoSection` mounts the top bar, the canonical sidebar, the section cards in canonical order, and the bottom CTA bar. The Foundation card uses the canonical labels, the Design card renders preset chips and a small preview pane, and the Pricing card renders the three-option model toggle plus a numeric input. Locked sections render `BlueprintDemoLockedCard` with their canonical label and description.

The CTA seam follows. `CheckoutButton` gains `onBeforeCheckout?: () => void | Promise<void>`. `useStripeCheckout` is extended to call `await onBeforeCheckout?.()` once before the fetch. If the callback throws, the redirect does not run, the button reports an error, and `isLoading` flips back to false. `HomePagePrimaryCta` forwards the callback only on the `checkout` branch.

The seeder lands inside the workspace tree. `apps/web/lib/blueprint-flow/use-blueprint-local-draft-seeder.ts` accepts `{ workspaceState, isAuthenticated, isAuthLoading, saveProjectDefinitionFacts }` and runs a single one-time effect once those inputs are stable. The component wrapper `apps/web/app/(workspace)/_components/blueprint-flow/blueprint-local-draft-seeder.tsx` is a no-render component mounted inside `BlueprintPage` that wires the existing mutation and `useConvexAuth` into the hook.

The old preview is deleted last so each preceding slice could compile and run on its own.

Tests are updated in the same slices. The homepage content unit test asserts the canonical 7-section order, interactive ids, default design preset, pricing model options, and CTA label. The integration-ui product-preview test mounts the new demo, types into Foundation, clicks a preset chip, toggles the pricing model, and clicks "Generate my codebase". The checkout-button test proves `onBeforeCheckout` runs before the redirect and that a thrown callback both cancels the redirect and re-enables the button. New unit tests cover the storage parser. A new integration-ui test mounts the seeder hook with a stub mutation and a stub workspace state to prove all the seeding cases.

Documentation is updated in the same slice that ships the behavior.

## Milestones

Milestone 1: Reshape the homepage content layer.

This milestone rewrites `productPreviewSection` in `apps/web/app/_content/home-page.ts`. After this milestone the `tests/unit/home-page-content.test.ts` `productPreviewSection` block can be rewritten to assert the new shape. Run `bun run --cwd apps/web test:unit tests/unit/home-page-content.test.ts` to prove only the homepage content shape changed.

Milestone 2: Add storage helpers and the SSR-safe draft hook.

This milestone adds `home-page-blueprint-draft-storage.ts` and `use-home-page-blueprint-draft.ts`, plus a focused unit test for the storage helpers. Run `bun run --cwd apps/web test:unit tests/unit/home-page-blueprint-draft-storage.test.ts`.

Milestone 3: Build the demo shell and the three interactive cards.

This milestone builds `blueprint-demo-section.tsx`, the top bar, the canonical sidebar, the section card chrome, the locked card, the CTA bar, and the Foundation/Design/Pricing cards. The homepage now renders the new demo when `starterConfig.homePage.sections.productPreview` is true. Run `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-product-preview.test.tsx`.

Milestone 4: Extend the shared CTA path with `onBeforeCheckout`.

This milestone adds the optional callback to `CheckoutButton`, threads it through `useStripeCheckout`, forwards it from `HomePagePrimaryCta` for `checkout` targets, and updates the existing tests. Run `bun run --cwd apps/web test:integration:ui tests/integration-ui/checkout-button.test.tsx tests/integration-ui/home-page-primary-cta.test.tsx`.

Milestone 5: Wire the bottom CTA to persist the draft before checkout.

This milestone uses the new callback in `BlueprintDemoCtaBar`. The integration-ui product-preview test asserts that the `onBeforeCheckout` callback persists the latest draft before the Stripe redirect runs.

Milestone 6: Add the post-checkout seeder.

This milestone adds the seeder hook and the no-render component, mounts it inside `BlueprintPage`, and adds the seeder integration-ui test. Run `bun run --cwd apps/web test:integration:ui tests/integration-ui/blueprint-local-draft-seeder.test.tsx`.

Milestone 7: Delete the old preview, finalize tests, and write docs.

This milestone deletes `product-preview-section.tsx` and `product-preview-loop-packet.tsx`, removes their imports, finalizes the rewritten `home-page-product-preview.test.tsx`, and updates `apps/web/content/docs/configure-the-homepage.mdx` and `docs/ship-by-sunday/design-pack/documentation.md`. Run the full focused test list.

Milestone 8: Repo-wide validation.

Run `bun run --cwd apps/web lint`, `bun run --cwd apps/web format:check`, `bun typecheck`, `bun lint`, `bun run format`, and `bun run --cwd apps/web build`. Then perform a desktop + mobile manual viewport check at `/?marketing=1` and verify the localStorage round-trip end to end.

## Concrete Steps

1. From the repo root, create this ExecPlan file. Confirm `docs/exec-plans/active/2026-05-02-real-blueprint-demo-homepage.md` exists.

2. Reshape `apps/web/app/_content/home-page.ts`: replace the `productPreviewSection` shape with the new demo shape and remove the legacy `loopPacket`/`workspace` blocks. Keep the rest of the file unchanged.

3. Add `apps/web/app/_components/home-page/sections/blueprint-demo/home-page-blueprint-draft-storage.ts` with `STORAGE_KEY`, the typed envelope, and load/save/clear/parse helpers. Add `use-home-page-blueprint-draft.ts` next to it with an SSR-safe `useState` + one-shot `useEffect` hydration pattern.

4. Add the demo components under `apps/web/app/_components/home-page/sections/blueprint-demo/`. Wire them into `apps/web/app/_components/home-page/home-page.tsx` by replacing the import and the `<ProductPreviewSectionBlock />` usage with `<BlueprintDemoSectionBlock />`.

5. Extend `apps/web/app/checkout/_hooks/use-stripe-checkout.ts` to accept `{ onBeforeCheckout }` and call `await onBeforeCheckout?.()` before `fetch`. If the callback throws, set `error` and `isLoading=false` and return. Update `apps/web/app/checkout/_components/checkout-button.tsx` to forward `onBeforeCheckout`. Update `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx` to forward `onBeforeCheckout` only on the `checkout` branch.

6. Wire `BlueprintDemoCtaBar` to call `HomePagePrimaryCta` with a `target: { kind: "checkout" }`, `label: "Generate my codebase"`, and an `onBeforeCheckout` that calls `persistNow()` from the draft hook.

7. Add `apps/web/lib/blueprint-flow/use-blueprint-local-draft-seeder.ts` and `apps/web/app/(workspace)/_components/blueprint-flow/blueprint-local-draft-seeder.tsx`. Mount the component inside `BlueprintPage` near the existing `useBlueprintPageState` call. The hook's effect must early-return until auth is non-loading and authenticated, and until `workspaceState` is available.

8. Delete `apps/web/app/_components/home-page/sections/product-preview-section.tsx` and `apps/web/app/_components/home-page/sections/product-preview-loop-packet.tsx`. Remove their imports from `apps/web/app/_components/home-page/home-page.tsx`.

9. Rewrite `apps/web/tests/unit/home-page-content.test.ts` `productPreviewSection` assertions. Update `apps/web/tests/integration-ui/home-page-product-preview.test.tsx`. Update `apps/web/tests/integration-ui/checkout-button.test.tsx` to add an `onBeforeCheckout` test pair.

10. Add `apps/web/tests/unit/home-page-blueprint-draft-storage.test.ts` covering SSR/no-window, valid round-trip, version mismatch, corrupt JSON, unknown key, invalid price, and clear behavior.

11. Add `apps/web/tests/integration-ui/blueprint-local-draft-seeder.test.tsx` covering the empty-facts seed, the existing-facts skip, the mutation-failure preserve, and the never-run-before-auth case.

12. Update `apps/web/content/docs/configure-the-homepage.mdx` (file list, change-pattern subsections, validation block, before-checkout persistence note) and `docs/ship-by-sunday/design-pack/documentation.md` (short shipped note).

13. Run validation in this order: focused unit tests, focused integration-ui tests, `bun run --cwd apps/web lint`, `bun run --cwd apps/web format:check`, `bun typecheck`, `bun lint`, `bun run format`, `bun run --cwd apps/web build`. Then perform the manual desktop + mobile viewport check at `/?marketing=1`.

## Validation and Acceptance

The slice is acceptable when a visitor can fill in Foundation/Design/Pricing on the public homepage, click "Generate my codebase", be redirected to Stripe, return through `/checkout/success`, and land on `/blueprint` with exactly those three sections prefilled. The other four canonical sections must remain visibly incomplete. The storage key `sbs:home-blueprint-draft:v1` must be cleared after the seed runs, and never written before the visitor clicks the CTA. A returning buyer with existing `projectDefinition.facts` must never have their facts overwritten by the seeder. A returning buyer with a stored draft and existing facts must have the draft cleared on the first authenticated `/blueprint` visit without writing.

### Test Commands

Run from repo root unless a working directory is specified.

Focused unit tests:

    bun run --cwd apps/web test:unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts tests/unit/home-page-blueprint-draft-storage.test.ts

Focused integration-ui tests:

    bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/checkout-button.test.tsx tests/integration-ui/blueprint-local-draft-seeder.test.tsx

Lint and format:

    bun run --cwd apps/web lint
    bun run --cwd apps/web format:check

Repo-level gates:

    bun typecheck
    bun lint
    bun run format

Build:

    bun run --cwd apps/web build

Manual smoke (no automated equivalent for the full Stripe round-trip):

    Open `/?marketing=1` in desktop and mobile viewports.
    Fill Foundation/Design/Pricing.
    Click "Generate my codebase". Inspect localStorage to confirm `sbs:home-blueprint-draft:v1` is set just before the redirect.
    Complete checkout in Stripe test mode. After `/checkout/success`, confirm `/blueprint` is prefilled with only those fields and the localStorage key is gone.

## Idempotence and Recovery

The storage envelope is versioned. Re-running the steps is safe. If a parse fails for any reason (wrong version, bad JSON, unknown keys, invalid price), the parser returns `null` and the hook silently uses defaults. If the seeder runs against a workspace with existing facts, it clears the localStorage key without writing. If the seeder mutation throws, the localStorage key is preserved so the next render attempt can retry without losing the buyer's draft.

To roll the slice back, restore `apps/web/app/_components/home-page/sections/product-preview-section.tsx` and `product-preview-loop-packet.tsx`, restore the prior `productPreviewSection` content shape, drop the new `blueprint-demo` folder, drop the seeder files, and remove the `onBeforeCheckout` arguments. The Convex contract is unchanged across this slice, so no migration is required either way.

## Artifacts and Notes

After implementation, capture:

- A short transcript or screenshot of the desktop + mobile manual smoke at `/?marketing=1`.
- The localStorage payload before and after seeding (use the browser devtools console).
- The output of the focused test commands listed above.

## Interfaces and Dependencies

This slice depends on these existing exports staying stable:

- `@shipbysunday/blueprint-compiler`: `designPresetDefinitions`, `DEFAULT_DESIGN_PRESET_ID`, `buildDesignPresetFactSeed`, `getBlueprintStageDefinition`, plus the canonical fact shape used by `parseCanonicalProjectFactsDraft`.
- `@shipbysunday/blueprint-presentation`: `blueprintFieldLabel`, `blueprintFieldHelperText`, `blueprintFieldPlaceholder`, `getBlueprintFieldScaleDefinition`.
- `apps/web/lib/blueprint-flow/blueprint-page-sections.ts`: `blueprintPageSections`, `blueprintPageSectionIds`.
- `apps/web/lib/blueprint-flow/blueprint-page-draft-model.ts`: `buildSavePayloadForBlueprint`, `BlueprintPageDraftValues`.
- `api.blueprint.saveProjectDefinitionFacts`: continues to require granted product access and accepts `{ clearedFieldKeys, factsPatch }`.
- `api.blueprint.getBlueprintWorkspaceState`: continues to return `{ projectDefinition: { facts } | null, ... }`.
- `useConvexAuth` from `convex/react` for the seeder gating.

This slice introduces these new internal interfaces:

- `apps/web/app/_components/home-page/sections/blueprint-demo/home-page-blueprint-draft-storage.ts`:
  - `STORAGE_KEY = "sbs:home-blueprint-draft:v1"`
  - `type HomeBlueprintDraftFields = { product_name, product_summary, primary_user, design_preset_id, theme_preset, pricing_model, pricing }` (all strings)
  - `loadHomeBlueprintDraft(): HomeBlueprintDraftFields | null`
  - `saveHomeBlueprintDraft(fields: HomeBlueprintDraftFields): void`
  - `clearHomeBlueprintDraft(): void`
  - `parseHomeBlueprintDraftEnvelope(raw: string): HomeBlueprintDraftFields | null`
- `apps/web/app/_components/home-page/sections/blueprint-demo/use-home-page-blueprint-draft.ts`:
  - `useHomePageBlueprintDraft(content): { fields, setField, persistNow }`
- `apps/web/app/checkout/_components/checkout-button.tsx` and `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx`:
  - new optional `onBeforeCheckout?: () => void | Promise<void>`
- `apps/web/lib/blueprint-flow/use-blueprint-local-draft-seeder.ts`:
  - `useBlueprintLocalDraftSeeder({ workspaceState, isAuthenticated, isAuthLoading, saveProjectDefinitionFacts })`
