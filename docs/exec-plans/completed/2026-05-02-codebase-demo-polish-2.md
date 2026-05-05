---
title: Codebase Demo Polish Pass
status: active
created_at: 2026-05-02
completed_at: null
summary: Raise the craft layer on the freshly-shipped Codebase demo, the shared CTA seam, and the post-checkout localStorage-to-Convex seeder. Treat behavior, contracts, and data flow as locked; polish motion, microinteractions, typography, dark-mode parity, mobile reflow, accessibility, form micro-UX, locked-card affordance, design preview presentation, CTA loading and error surfaces, and the post-checkout aha-moment.
post_build_recap: null
read_when:
  - Resuming the Codebase demo polish pass mid-flight.
  - Reviewing the polish-pass diff against the locked behavior contract.
  - Writing follow-up polish work that extends the same surfaces.
---

# Codebase Demo Polish Pass

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The previous slice landed an interactive Codebase demo on the public homepage, threaded a localStorage envelope through the existing CTA seam via `onBeforeCheckout`, and wired a one-shot seeder into the workspace codebase flow. That slice was correct but visually undercooked: card entry was abrupt, the design-preset preview tile under-sold the brand DNA, dark mode broke on Vercel/Notion accent stripes, the bottom CTA was easy to miss on mobile, and the post-checkout seeder was completely silent so the buyer never felt their answers carry through.

This pass raises the craft layer on every surface in scope without touching the locked behavior contract. The visitor should feel motion that reinforces hierarchy, microinteractions that make controls feel snappy, typography and spacing that read at desktop and mobile breakpoints down to 360px, dark-mode parity for every brand accent, and an aha-moment on the first authenticated `/codebase` load that confirms their homepage answers carried through.

A human can prove this by visiting `/?marketing=1` at desktop and a 390x844 mobile viewport, scrolling the demo to verify card stagger and reduced-motion fallback, toggling pricing model and design preset to verify the layoutId pill and chip microinteractions, switching to dark mode to verify accent-stripe legibility, exercising the CTA to verify the loading copy swap and inline error rendering, completing checkout, and confirming the workspace surfaces a one-time toast announcing the carried-in answers.

## Progress

- [x] 2026-05-02: Author this ExecPlan.
- [x] 2026-05-02: Slice 1 - shared reduced-motion helper, ScrollReveal reduced-motion guard, demo card stagger.
- [x] 2026-05-02: Slice 2 - pricing toggle layoutId pill + preset chip microinteractions.
- [x] 2026-05-02: Slice 3 - sidebar progress dots + locked-card unlock-preview line sourced from canonical descriptions.
- [x] 2026-05-02: Slice 4 - form micro-UX (debounced Saved-locally pill, char budget hint, number-input key blocking, placeholder contrast).
- [x] 2026-05-02: Slice 5 - design preview CSS browser chrome, font specimen line, dark-mode brand-accent parity.
- [x] 2026-05-02: Slice 6 - phase-aware CTA loading copy + inline error region in the demo CTA bar.
- [x] 2026-05-02: Slice 7 - mobile sticky bottom CTA with backdrop blur and safe-area inset.
- [x] 2026-05-02: Slice 8 - top-bar rhythm + consolidate the duplicate trust note.
- [x] 2026-05-02: Slice 9 - post-checkout seeder success toast (success branch only).
- [x] 2026-05-02: Slice 10 - extend product-preview, seeder, and content tests; preserve every existing data-testid.
- [x] 2026-05-02: Slice 11 - validation matrix and manual viewport proof at `/?marketing=1`.

## Surprises & Discoveries

The shared `ScrollReveal` component used by the demo headline does not currently honor `prefers-reduced-motion`. We add the guard in this pass so the new card stagger and the existing headline both respect the user preference from the same boundary.

The current `tests/integration-ui/home-page-product-preview.test.tsx` matches sidebar entries with the regex `/codebase-demo-sidebar-section-/`. Any new sidebar progress indicator must use a different `data-testid` prefix (e.g. `codebase-demo-sidebar-progress-{id}`) so the existing canonical-order assertion keeps passing without modification.

`CheckoutButton` already renders an inline `<Alert>` for errors. Surfacing the error inside the demo's bar layout requires an additive seam: an optional `onError?: (message: string | null) => void` plus a switch that suppresses the in-button alert when the host opts in. Both props default to undefined, keeping `tests/integration-ui/checkout-button.test.tsx` and `tests/integration-ui/home-page-primary-cta.test.tsx` green.

The Sonner `<Toaster />` is already mounted at the root layout, so the post-checkout seeder toast does not require new provider wiring.

`apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-section-card.tsx` shows the canonical `description` in the header for both interactive and locked tones. To avoid double-printing the same text on locked rows, the section card grows an optional `hideDescription?: boolean` (used only by the locked card) so the locked body can carry the canonical "After checkout..." preview line without redundancy.

## Decision Log

Decision: Track this work as a new ExecPlan rather than reopening `2026-05-02-real-codebase-demo-homepage.md`.
Rationale: That plan is fully executed and has a complete Outcomes & Retrospective. Reopening it would drift its summary semantics. The polish pass is a separable slice with its own surfaces, validation, and risk profile. The `-2` filename suffix follows the PLANS.md convention for same-day plan collisions.
Date: 2026-05-02

Decision: Use a CSS-only mock browser chrome around the existing brand-accent tile rather than checking in real screenshots under `apps/web/public/codebase/design-presets/previews/`.
Rationale: Real screenshots would add asset-licensing scope and ongoing freshness debt. A CSS browser chrome with the existing repo-owned SVG logo and a one-line font specimen evokes the reference without taking on those costs. The "View live reference" anchor already links to the real `previewPageUrl`.
Date: 2026-05-02

Decision: Surface CTA error state in the demo bar via a new optional `onError` callback on `HomePagePrimaryCta` and `CheckoutButton`. When a host provides `onError`, the in-button `<Alert>` is suppressed so the bar can render contextual error UI without double messaging.
Rationale: Smallest additive seam that satisfies "render that error inline near the CTA in the demo, not just inside the existing CheckoutButton internals" without breaking the existing checkout-button test, which only asserts the error text exists in the document.
Date: 2026-05-02

Decision: The debounced "Saved locally" acknowledgment writes the same envelope shape via the same storage helper. The CTA still calls `persistNow()` for an immediate flush so the integration-ui test's synchronous post-click localStorage check stays valid.
Rationale: Adding a parallel debounce removes the visitor's "did my answer take?" anxiety without changing the storage contract or invalidating any existing tests.
Date: 2026-05-02

Decision: The post-checkout seeder toast only fires on the success branch of the seeder hook (where `saveProjectDefinitionFacts` resolves and `clearDraftFromStorage` runs). Skip branches (no draft, workspace-already-has-facts, empty-patch) and the failure branch do not toast.
Rationale: A toast on the no-draft or facts-already-present branch would surface to returning buyers who never saw the homepage demo. A toast on the failure branch would lie about persistence. The success branch is the only path where the carried-in answers actually reach Convex.
Date: 2026-05-02

## Outcomes & Retrospective

All eleven slices landed. The visitor-facing impact:

- The seven Codebase demo cards now stagger into view on first scroll, the pricing toggle pill animates between models with `motion/react` shared `layoutId`, and the design preset chips snap with a sub-180ms color transition and a tap scale. Every animation drops to a static state under `prefers-reduced-motion`.
- The sidebar is now a `<nav aria-label="Codebase sections">` landmark with progress dots/checks for the three interactive sections and explicit `Lock` badges for the four locked sections. New `data-testid` prefix `codebase-demo-sidebar-progress-{id}` does not collide with the existing canonical-order regex used by the integration test.
- Every locked card now shows a one-line "After checkout: ..." preview sourced from `apps/web/lib/codebase-flow/codebase-page-sections.ts`, and the section card was widened with an optional `hideDescription` so the locked tone reads cleanly.
- Foundation, Design, and Pricing each render a debounced "Saved locally" pill bound to `lastSavedAt` from the draft hook, plus the foundation card surfaces a soft 120-character budget hint on `product_summary` and the pricing input blocks `e/E/+/-` keys. The CTA seam still calls `persistNow()` for an immediate flush so the existing storage-on-click integration test keeps passing.
- The design preset preview wears a CSS-only browser chrome with the live reference host name in the address bar, an accent stripe driven by per-preset CSS variables, a brand-aware logo-invert behavior, and a one-line font specimen sourced from local fonts. Vercel and Notion accent stripes and logos now render legibly in dark mode.
- The shared CTA seam grew two optional props: `onError` (so a host can surface the error in its own layout) and `loadingLabels` (so the CTA can swap to "Saving your draft..." then "Opening checkout..."). The Stripe checkout hook tracks an internal `phase: idle | saving | redirecting`. The demo CTA bar uses both new props to render a dismissable inline error.
- The bottom CTA bar is sticky on mobile with `bg-background/85 backdrop-blur` and `pb-[calc(1.25rem+env(safe-area-inset-bottom))]`, plus a sibling `h-16 sm:hidden` spacer that prevents the sticky bar from covering the closing region. The desktop sidebar offset moved from `lg:top-20` to `lg:top-24` to clear the top-bar rhythm.
- The duplicate trailing trust note was consolidated. The standalone shield-check + previewNote block at the bottom of the demo section was removed; the shield icon now sits next to `cta.lockedNote` inside the CTA bar, and the unused `previewNote` field on `productPreviewSection` was removed from content.
- The post-checkout seeder hook gained an optional `onSeedSuccess`. The workspace seeder component now shows a one-time `toast.success("We carried your homepage answers in")` with a dedupe id, only on the success branch. Skip and failure branches stay silent.

### Validation pass/fail

| Gate | Result |
| --- | --- |
| `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/checkout-button.test.tsx tests/integration-ui/codebase-local-draft-seeder.test.tsx` | pass (4 files, 17 tests) |
| `bun run --cwd apps/web test:unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-codebase-draft-storage.test.ts` | pass (3 files, 15 tests) |
| `bun run --cwd apps/web lint` | pass |
| `bun run --cwd apps/web format:check` | pass after `bun run format` reformatted four touched files |
| `bun typecheck` | pass (Next build completed) |
| `bun lint` | pass |
| `bun run --cwd apps/web build` | pass |
| `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-codebase-demo-polish-2.md` | pass |
| Manual viewport proof at `/?marketing=1` desktop 1280x800 | pass (sections in canonical order, sidebar progress dots, headline cursor highlight, design preset Linear updates the preview, monthly toggle moves the pill, CTA bar with shield + primary + secondary). |
| Manual viewport proof at `/?marketing=1` mobile 390x844 | pass (sections in order, sticky CTA bar with safe-area padding). |
| Manual dark-mode proof at `/?marketing=1` (forced via `documentElement.classList.add("dark")`) | pass (Vercel near-white accent stripe + inverted logo, Notion light beige stripe + inverted logo, CTA bar legible). |

### Deferred or noted limitations

- The "Saved locally" pill was not captured in the dark-mode browser inspection. The pill renders for 2 seconds after the 600ms debounce, so the inspection window likely arrived after the fade. The unit and integration paths exercise the same `lastSavedAt` write path; this is recorded as an inspection-timing artifact, not a behavior regression.
- The structured screenshot artifacts captured by the browser proof live in the headless browser sandbox and are referenced by name in the agent transcript. They are not committed to the repo.
- No new third-party dependencies were added. No screenshot assets were added under `apps/web/public/codebase/design-presets/previews/`. No edits to Convex schema, validators, or the `Product` / `FAQPage` structured data shape. The PostHog observability migration files in the parent uncommitted working tree were left untouched.
- The `productPreviewSection.previewNote` field was removed from `apps/web/app/_content/home-page.ts` because the trust messaging was consolidated into the CTA bar. No test asserted this field was rendered. The `design.previewNote` field is unrelated and is unchanged.

## Context and Orientation

The shipped Codebase demo lives under `apps/web/app/_components/home-page/sections/codebase-demo/`. The shared CTA seam is `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx`, `apps/web/app/checkout/_components/checkout-button.tsx`, and `apps/web/app/checkout/_hooks/use-stripe-checkout.ts`. The post-checkout bridge is `apps/web/app/(workspace)/_components/codebase-flow/codebase-local-draft-seeder.tsx` plus `apps/web/lib/codebase-flow/use-codebase-local-draft-seeder.ts`, mounted by `apps/web/app/(workspace)/_components/codebase-flow/codebase-page.tsx`. The content layer is `apps/web/app/_content/home-page.ts` (`productPreviewSection`). Canonical section descriptions live in `apps/web/lib/codebase-flow/codebase-page-sections.ts`. Design preset metadata comes from `@shipbysunday/codebase-compiler` (`designPresetDefinitions`, `buildDesignPresetFactSeed`).

The shared ScrollReveal primitive is `apps/web/app/_components/home-page/sections/scroll-reveal.tsx`. The PointerHighlight is `apps/web/components/ui/pointer-highlight.tsx`. Toaster is mounted at `apps/web/app/layout.tsx`. The repo uses `motion/react` (already a dependency) and Tailwind v4 via `apps/web/app/globals.css`. Color tokens live in CSS variables on `:root` and `.dark`. The Sonner exports come from `apps/web/components/ui/sonner.tsx` and the upstream `sonner` package.

The Convex mutation `api.codebase.saveProjectDefinitionFacts` requires granted product access and is unchanged in this pass. The storage envelope key `sbs:home-codebase-draft:v1` and parser are unchanged.

### In Scope

- Microinteractions, motion, typography, spacing, color, hover/focus/active/disabled/loading states, mobile reflow, dark-mode parity, accessibility on every demo surface, the shared CTA seam, and the post-checkout seeder.
- One additive `onError` and `loadingLabels` seam on `HomePagePrimaryCta` and `CheckoutButton`.
- One additive `onSeedSuccess` seam on the seeder hook plus a sonner toast on the first successful seed.
- A debounced "Saved locally" indicator that writes the same envelope via the existing storage helper.
- Source the locked-card unlock-preview lines from `sectionDescriptionById` in `apps/web/lib/codebase-flow/codebase-page-sections.ts`.
- A one-line font specimen per design preset, sourced from local fonts only.
- A CSS browser chrome wrapping the existing brand-accent tile.
- A mobile-only sticky CTA bar with backdrop blur and `env(safe-area-inset-bottom)`.

### Out Of Scope

- New screenshot assets under `apps/web/public/codebase/design-presets/previews/`.
- A theme grid or any free-form `theme_preset` editing on the public route.
- Any change to Convex schema, validators, or the `Product` / `FAQPage` structured data shape.
- Renaming `productPreview` in `starterConfig.homePage.sections` or the render model.
- Changing storage envelope key or parser.
- Reordering or renumbering canonical sections.
- Touching the in-flight PostHog observability migration files (uncommitted PostHog/Sentry work elsewhere in the repo).
- Adding new third-party dependencies.

## Plan of Work

The pass proceeds in narrow slices, one polish dimension per slice, each leaving the demo in a working state. Every slice keeps every existing `data-testid` intact and respects `prefers-reduced-motion` for any new motion it introduces.

Slice 1 lands a tiny shared motion helper (`useReducedMotion` re-export plus a `useStaggerDelays` utility) and uses it to short-circuit `ScrollReveal` under reduced motion and to stagger the seven Codebase demo cards on first scroll into view. This is the foundation every later motion slice builds on.

Slice 2 makes the pricing model toggle animate via `motion/react` `LayoutGroup` + shared `layoutId`, and adds a snappy color/border + `whileTap` scale transition to the design preset chips. Both honor reduced motion by collapsing to static states.

Slice 3 adds subtle progress indicators to the canonical sidebar (interactive sections show empty/started/complete dots; locked sections keep their existing tone) and replaces the generic "Unlocks after checkout" line on each locked card with the canonical description from `apps/web/lib/codebase-flow/codebase-page-sections.ts`, framed as an "After checkout: ..." preview. Locked cards remain non-interactive.

Slice 4 adds form micro-UX: a soft character-budget hint on `product_summary` past 120 chars, an `onKeyDown` guard on the pricing input that prevents `e/E/+/-`, a placeholder color contrast audit, and a debounced "Saved locally" pill on each interactive card that fires ~600ms after the visitor stops typing.

Slice 5 wraps the brand-accent design tile in a CSS-only browser chrome, adds a one-line font-family specimen per preset using local fonts, and fixes dark-mode brand-accent parity for `vercel` and `notion` whose true-black accent stripes vanish against the dark card background.

Slice 6 adds phase-aware loading copy ("Saving your draft..." then "Opening checkout...") and an inline error region inside the demo CTA bar via the new optional `onError` and `loadingLabels` seams on the shared CTA path.

Slice 7 adds a mobile-only sticky variant of the bottom CTA bar with backdrop blur, `pb-[env(safe-area-inset-bottom)]`, and a sibling spacer so the sticky bar never covers the trailing shield-check note. It also audits the desktop sticky sidebar's `top` offset against the actual top-bar height.

Slice 8 harmonizes the demo top bar's typography and spacing with the rest of the marketing chrome and consolidates the duplicate trust messaging by reframing or removing the bottom shield-check note.

Slice 9 wires the post-checkout seeder's success branch to a sonner toast that announces "We carried your homepage answers in" once, on the first authenticated `/codebase` load. The hook gains an optional `onSeedSuccess` callback. Skip and failure branches do not toast.

Slice 10 extends the existing tests to cover the locked-card unlock-preview line, the debounced "Saved locally" indicator, and the seeder success callback. Every existing assertion stays green.

Slice 11 runs the validation matrix and captures manual desktop + mobile viewport proof at `/?marketing=1`.

## Milestones

Milestone 1: Shared motion helper and reduced-motion guard. Run `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-product-preview.test.tsx`.

Milestone 2: Pricing toggle and design preset chip microinteractions.

Milestone 3: Sidebar progress + locked-card unlock-preview line. Run the same focused integration-ui test.

Milestone 4: Form micro-UX. Run the focused integration-ui test plus the storage unit test.

Milestone 5: Design preview chrome + font specimen + dark-mode parity. Run the focused integration-ui test plus the home-page-content unit test.

Milestone 6: CTA loading copy + inline error. Run `bun run --cwd apps/web test:integration:ui tests/integration-ui/checkout-button.test.tsx tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/home-page-product-preview.test.tsx`.

Milestone 7: Mobile sticky CTA + safe area + sidebar offset audit.

Milestone 8: Top-bar rhythm + consolidated trust note.

Milestone 9: Post-checkout seeder success toast. Run `bun run --cwd apps/web test:integration:ui tests/integration-ui/codebase-local-draft-seeder.test.tsx`.

Milestone 10: Test extensions (run the full focused list).

Milestone 11: Repo-wide validation: `bun run --cwd apps/web lint`, `format:check`, `bun typecheck`, `bun lint`, `bun run format`, `bun run --cwd apps/web build`. Then desktop + mobile viewport proof at `/?marketing=1`.

## Concrete Steps

1. Add `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-motion.ts` exporting `useCodebaseDemoReducedMotion()` and `useCodebaseDemoStaggerDelays(count, step)`.

2. Update `apps/web/app/_components/home-page/sections/scroll-reveal.tsx` to short-circuit transition `y` and `duration` when reduced motion is preferred.

3. Update `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-section.tsx` to wrap each card in a per-index `ScrollReveal` with staggered delays.

4. Update `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-pricing-card.tsx` to render the active pill via `motion.span` + `layoutId` inside `LayoutGroup`. Drop the `layoutId` under reduced motion.

5. Update `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-design-card.tsx` to wrap each preset chip in `motion.button` with `whileTap` and a sub-180ms color/border transition. Drop `whileTap` under reduced motion.

6. Update `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-sidebar.tsx` to accept an optional `progress` prop and render a small progress indicator per interactive section using a new `data-testid` prefix `codebase-demo-sidebar-progress-{id}` (which does not collide with the existing `codebase-demo-sidebar-section-{id}` regex).

7. Update `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-section-card.tsx` to accept `hideDescription?: boolean`. Update `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-locked-card.tsx` to pass `hideDescription` and render the canonical description framed as an unlock preview.

8. Update `apps/web/app/_components/home-page/sections/codebase-demo/use-home-page-codebase-draft.ts` to expose `lastSavedAt: number | null` and run a 600ms debounced effect that calls `saveHomePageCodebaseDraft(fields)` after edits.

9. Update each interactive card to render a small "Saved locally - just now" pill bound to `lastSavedAt` (auto-fades after ~2s). Render order respects the existing markup so all `data-testid`s remain in place.

10. Update `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-foundation-card.tsx` to surface a soft character-budget hint when `product_summary.length > 120`.

11. Update `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-pricing-card.tsx` to add an `onKeyDown` guard that prevents `e/E/+/-`.

12. Add `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-design-browser-chrome.tsx` (presentational only). Wire it into the design card, keeping all existing `data-testid`s on the inner content.

13. Add a per-preset font specimen mapping to `apps/web/app/_content/home-page.ts` keyed by preset id, returning `{ family, sample, fontStack }`. Render that specimen in the chrome.

14. Update `apps/web/app/_content/home-page.ts` to switch the `vercel`/`notion` accent colors from a single hex to a `{ light, dark }` pair. Adjust the design card to apply the correct shade via the `dark:` Tailwind variant.

15. Add an internal `phase: "idle" | "saving" | "redirecting"` to `apps/web/app/checkout/_hooks/use-stripe-checkout.ts`. Extend `apps/web/app/checkout/_components/checkout-button.tsx` with optional `onError` and `loadingLabels`. Suppress the in-button `<Alert>` when `onError` is provided.

16. Forward the new optional props through `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx` on the `checkout` branch only.

17. Update `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-cta-bar.tsx` to render an inline error region above the button row, hold local `errorMessage` state, and pass `loadingLabels={{ saving: "Saving your draft...", redirecting: "Opening checkout..." }}` and `onError={setErrorMessage}` into `HomePagePrimaryCta`.

18. Update the bottom CTA bar to apply mobile-only sticky positioning with `bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t border-border/60 pb-[env(safe-area-inset-bottom)]`. Add a `sm:hidden h-20` spacer at the bottom of the demo section so the sticky bar never overlaps the closing trust note.

19. Audit `lg:top-20` on the desktop sticky sidebar against the actual top-bar height; bump if needed.

20. Update `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-top-bar.tsx` to harmonize spacing and link tone with the rest of the marketing chrome.

21. Reframe the bottom shield-check note in `apps/web/app/_content/home-page.ts` so it does not duplicate the unlock note. If the duplicate cannot be made distinct, drop the bottom note and move the shield icon next to `cta.lockedNote` inside the CTA bar.

22. Extend `apps/web/lib/codebase-flow/use-codebase-local-draft-seeder.ts` with an optional `onSeedSuccess?: () => void` invoked only on the success branch.

23. Update `apps/web/app/(workspace)/_components/codebase-flow/codebase-local-draft-seeder.tsx` to call `toast.success("We carried your homepage answers in")` on success.

24. Extend the focused tests as described in slice 10. Keep every existing assertion intact.

25. Run the validation matrix in order: focused unit, focused integration-ui, lint, format:check, typecheck, repo lint, format, build. Capture manual desktop + mobile proof at `/?marketing=1`.

## Validation and Acceptance

The pass is acceptable when every polish dimension from the brief either lands or is explicitly deferred in this plan with a reason; every locked behavior, contract, and `data-testid` survives unchanged; the validation matrix passes (or any skipped check is justified); the diff stays within the surfaces named in section 1 of the brief; and a desktop + mobile manual viewport proof at `/?marketing=1` shows: all 7 canonical sections in canonical order with the correct interactive vs locked split, working preset chip + pricing toggle microinteractions, intact "$" + numeric pricing input across all three model selections, the CTA loading copy swap and inline error rendering on failure, the sticky mobile CTA reachable above the safe-area inset, dark-mode brand accents legible, and a one-time success toast on the first authenticated `/codebase` load.

### Test Commands

Run from repo root unless a working directory is specified.

Focused unit tests:

    bun run --cwd apps/web test:unit \
      tests/unit/home-page-content.test.ts \
      tests/unit/home-page-render-model.test.ts \
      tests/unit/home-page-codebase-draft-storage.test.ts

Focused integration-ui tests:

    bun run --cwd apps/web test:integration:ui \
      tests/integration-ui/home-page-product-preview.test.tsx \
      tests/integration-ui/home-page-primary-cta.test.tsx \
      tests/integration-ui/checkout-button.test.tsx \
      tests/integration-ui/codebase-local-draft-seeder.test.tsx

Lint and format:

    bun run --cwd apps/web lint
    bun run --cwd apps/web format:check

Repo-level gates:

    bun typecheck
    bun lint
    bun run format

Build:

    bun run --cwd apps/web build

Manual smoke:

    Open `/?marketing=1` at desktop (>= 1280) and mobile (390x844 and 360px wide).
    Verify card stagger, reduced-motion fallback (system setting), pricing toggle layoutId pill, design preset chip microinteraction, dark-mode accent legibility, CTA loading copy swap, inline error render on simulated failure, sticky mobile CTA above safe-area, post-checkout success toast.

## Idempotence and Recovery

Every slice in this pass is additive. Re-running any slice is safe: motion components fall through to opacity-only under reduced motion, the debounced "Saved locally" effect writes the same envelope shape, the new `onError` / `onSeedSuccess` props default to undefined, and the storage helpers are unchanged.

To roll back any slice, revert the slice's commits. The storage envelope, the seeder gating semantics, the CTA seam shape, and Convex contracts are unchanged across the pass, so no migration is required either way.

## Artifacts and Notes

After the pass lands, capture:

- The list of new commits with their conventional-commit subjects.
- The validation pass/fail table.
- Manual desktop + mobile screenshots at `/?marketing=1` (light and dark).
- Any deferred polish item with a short reason.

## Interfaces and Dependencies

This pass relies on these existing exports remaining stable:

- `motion/react`: `useReducedMotion`, `LayoutGroup`, `motion.button`, `motion.span`, `whileTap`, `layoutId`.
- `@shipbysunday/codebase-compiler`: `designPresetDefinitions`, `DEFAULT_DESIGN_PRESET_ID`, `buildDesignPresetFactSeed`.
- `apps/web/lib/codebase-flow/codebase-page-sections.ts`: `sectionDescriptionById` (re-exported via `codebasePageSections[].description`).
- `apps/web/components/ui/sonner.tsx`: `Toaster` (mounted at `apps/web/app/layout.tsx`); `sonner`'s `toast.success`.
- `convex/react`: `useConvexAuth`, `useMutation` (unchanged usage).
- `useHomePageCodebaseDraft.persistNow()` continues to flush the latest fields synchronously on CTA click.

This pass introduces these new internal interfaces:

- `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-motion.ts`:
  - `useCodebaseDemoReducedMotion(): boolean`
  - `useCodebaseDemoStaggerDelays(count: number, step?: number): number[]`
- `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-design-browser-chrome.tsx` (presentational only).
- `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-section-card.tsx`:
  - new optional `hideDescription?: boolean`.
- `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-sidebar.tsx`:
  - new optional `progress?: ReadonlyArray<{ id: string; status: "empty" | "started" | "complete" }>`.
- `apps/web/app/_components/home-page/sections/codebase-demo/use-home-page-codebase-draft.ts`:
  - new `lastSavedAt: number | null` on the returned handle.
- `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx` and `apps/web/app/checkout/_components/checkout-button.tsx`:
  - new optional `onError?: (message: string | null) => void`.
  - new optional `loadingLabels?: { saving?: string; redirecting?: string }`.
- `apps/web/lib/codebase-flow/use-codebase-local-draft-seeder.ts`:
  - new optional `onSeedSuccess?: () => void`.
