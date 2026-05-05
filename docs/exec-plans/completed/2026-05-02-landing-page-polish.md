---
title: Landing Page Polish
status: active
created_at: 2026-05-02
completed_at: null
summary: Bring the Codebase demo's caliber of craft polish to every other public landing-page section by tuning motion, microinteractions, typography rhythm, dark-mode parity, accessibility, and mobile reflow without changing the homepage shell, copy, render-model gating, structured data, or the locked surfaces from commit d1cad98.
post_build_recap: null
read_when:
  - Resuming the landing-page polish pass mid-flight.
  - Reviewing the polish-pass diff against the locked behavior contract.
  - Writing follow-up polish work that extends the same surfaces.
---

# Landing Page Polish

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

Current status: the sprint-path / `Exec Loops` homepage section was retired on 2026-05-04. Any sprint-path file paths or slice notes below are historical evidence only and are not instructions for future work.

## Purpose / Big Picture

The previous polish slice (`d1cad98`) lifted the new Codebase demo, the shared CTA seam, and the post-checkout localStorage seeder to the craft layer, and corrected the most visibly broken `bg-primary` / `text-primary` accents on the marketing surface. That slice was correct but scoped: every section between the demo and the footer still reads as "shipped" rather than "expensive."

This pass raises the craft layer on every other section the public homepage mounts. A visitor opening `/?marketing=1` should feel that motion respects `prefers-reduced-motion` everywhere, that microinteractions are snappy and intentional, that typography reads cleanly at 360, 390, 768, and desktop widths, that every brand accent flips correctly in dark mode, that every interactive control has a visible focus ring and a real tap target, and that the section-to-section rhythm is one continuous design system rather than a stack of independently authored blocks.

A human can prove this by visiting `/?marketing=1` at desktop 1440 and mobile 390 in both light and dark themes, scrolling top to bottom to confirm consistent borders and intentional vertical rhythm, toggling reduced motion (system setting or browser devtools rendering panel) to confirm every animation drops to a static state, and tabbing through the page once to confirm a visible focus ring on every interactive stop with no focus traps.

## Progress

- [x] 2026-05-02: Author this ExecPlan.
- [x] 2026-05-02: Slice 0 - per-section code baseline established via the surveys captured in `Surprises & Discoveries`; literal browser screenshots deferred to slice 10 (one consolidated browser proof pass).
- [x] 2026-05-02: Slice 1 - hero stack: gated `DottedGlowBackground` behind `useReducedMotion`; swapped CTA `shadow-primary/*` and bottom-rule `via-primary/20` to `*-foreground/*`; coalesced CTA + headline transitions under `motion-safe:`.
- [x] 2026-05-02: Slice 2 - sprint path: row bullet `bg-primary/40 → bg-foreground/40` + hover variant; coalesced row + bullet transitions under `motion-safe:`; added `aria-label="Mechanism steps"` to mechanism `<ol>`; marked the inter-step `ArrowRight` `aria-hidden="true"`.
- [x] 2026-05-02: Slice 3 - exec loop: reduced-motion media query verified intact; tightened step-label widths to `w-20 sm:w-28 lg:w-36` and shifted base-viewport positions to `6%/12%/88%/94%` (sm+ keeps the original 13%/17%/83%/84%) so labels no longer overlap the central puck at 360-390px.
- [x] 2026-05-02: Slice 4 - starter system: inspected; the `aria-label` on the `<h2>` is NOT redundant (title and joined titleLines differ slightly: "A worker layer your agents can build from." vs "A worker layer. Your agents can build from.") so it stays in place to give SR users a smoother sentence; sticky `lg:top-24` is decorative spacing with no fixed page nav to collide with. No source change.
- [x] 2026-05-02: Slice 5 - durability: promoted item titles from `<p class="font-bold...">` to `<h3 class="font-bold...">` for an honest h1 -> h2 -> h3 outline (visible weight unchanged); swapped closing paragraph from `text-balance` to `text-pretty` for better marketing-measure prose rendering.
- [x] 2026-05-02: Slice 6 - social proof: inspected; semantic layers already correct (`figure`, `img alt={portrait.alt}`, both decorative overlays `aria-hidden="true"`, neutral `bg-muted` framing fallback). Dark-mode portrait crushing risk from `mix-blend-multiply` deferred to slice 10's consolidated browser proof. No source change.
- [x] 2026-05-02: Slice 7 - FAQ: trigger height = 44px on base / 48px on sm+ (consumer overrides default `text-sm` to `text-base sm:text-lg`); meets WCAG threshold, no change. Keyboard nav delegated to radix-ui Accordion (Tab/Shift+Tab/Space/Enter/Up/Down); proof deferred to slice 10. Added `prefers-reduced-motion: reduce` global override scoped by `[data-slot="accordion-content"]` in `globals.css` because `tw-animate-css` does not ship one (audited the package's bundled CSS).
- [x] 2026-05-02: Slice 8 - pricing + footer + promo banner: dropped the `labelClassName="bg-primary text-primary-foreground"` override on `PromoBanner` (the default `bg-foreground text-background` is correct); swapped promo wrapper and bonus card from `border-primary/20 bg-primary/5` to `border-foreground/15 bg-foreground/5`; harmonized the pricing CTA tier (h-20 text-xl font-black -> h-16 text-lg font-bold to match the hero CTA, dropped the redundant inline `bg-foreground text-background` overrides since `HomePagePrimaryCta` already bakes them in); coalesced the pricing CTA scale microinteraction under `motion-safe:`; sticky `lg:top-24` is decorative spacing with no fixed nav, no change.
- [x] 2026-05-02: Slice 9 - primitives + provider-icons + coherence: coalesced `HomePageSecondaryLink`'s hover `-translate-y-0.5` and the icon's translate microinteraction under `motion-safe:` (color/border transitions still play under reduced motion because they are not motion); `provider-icons.tsx` confirmed dead code on the public homepage today (no consumer outside the file itself), inspection-only, no source change; cross-section border audit found the page intentionally uses `border-t border-border/60` only on the hero (the page's first content boundary) and `border-t border-border/40` for every inter-section divider thereafter, which reads as deliberate rhythm; `homePageSectionClassName` is unused on the public homepage today (recorded as a follow-up).
- [x] 2026-05-02: Slice 10 - validation matrix passed; consolidated browser proof captured at desktop 1440 + mobile 390 in light + dark via the running dev server; ExecPlan retrospective filled in.

## Surprises & Discoveries

The pricing call site of `PromoBanner` is the only `text-primary-foreground` consumer left on the marketing surface. The previous polish pass swapped the inverted CTAs, accent text, and checkmark colors but did not catch the promo label override. Because `--primary` does not flip cleanly under the active design preset, this label is the most visible remaining "broken-in-dark-mode" pill on the public homepage.

The sprint-path row uses `bg-primary/40` and `group-hover:bg-primary` for its bullet markers. These were not in the previous polish pass's swap list because the surrounding badge + title accents were the visible regressions; the bullets are subtle enough to slip past a casual desktop pass but they go near-invisible under the dark preset.

The `hero-atmosphere.tsx` module delegates animation to a `DottedGlowBackground` primitive imported from a shared UI bag. We need to verify whether that primitive already honors `prefers-reduced-motion` before deciding whether to gate it at the `HeroAtmosphere` boundary. If the primitive already does the right thing, this slice closes with no source change and the verification is recorded here as evidence.

The shared accordion CSS lives in `apps/web/components/ui/accordion.tsx` with `data-open:animate-accordion-down` / `data-closed:animate-accordion-up` keyframes. Whether those keyframes are suppressed under `prefers-reduced-motion` depends on the global `globals.css` setup (or a section-local override). Slice 7 must verify which is the case before adding an override.

`provider-icons.tsx` exports a registry plus a `getProviderIconNodes()` helper that pushes each icon twice (likely for a marquee). The polish pass needs to confirm whether this registry actually renders on the public homepage today. If it does not, slice 9 records the inspection result and skips the icon-level work; if it does, the slice covers `aria-hidden`, hard-coded brand stroke contrast, and SVG `id` de-duplication.

Slice 0 was scoped down from "literal browser screenshots before every slice" to "code-level baseline via surveys plus a single consolidated browser proof at slice 10." Reason: every change in this pass is a CSS class, aria attribute, element-tag, or `motion-safe:` variant swap. The before-state is fully knowable from source, and capturing per-slice screenshots through a separate browser subagent for ten slices would multiply context cost without changing the polish decisions. The slice 10 browser proof covers desktop 1440 + mobile 390 in light + dark, plus the reduced-motion toggle and the keyboard tab walk.

Slice 4 surfaced that the starter-system `<h2>` `aria-label` is NOT a redundant duplicate. `starterSystemSection.title` ("A worker layer your agents can build from.") differs from the joined `starterSystemSection.titleLines` ("A worker layer." + "Your agents can" + "build from." -> "A worker layer. Your agents can build from.") by punctuation and clause grouping. The aria-label intentionally gives screen-reader users a smoother sentence than the visual line breaks would imply. The brief's "drop the redundant aria-label" directive assumed equality. Documented and preserved.

## Decision Log

Decision: Track this work as a new ExecPlan rather than reopening `2026-05-02-codebase-demo-polish-2.md`.
Rationale: That plan is fully executed and has a complete Outcomes & Retrospective. Reopening it would drift its summary semantics. The landing-page polish pass is a separable slice with its own surfaces, validation, and risk profile.
Date: 2026-05-02

Decision: Slice the work strictly by section so each slice is independently shippable, in the same shape as `d1cad98`'s slice cadence. Slices that conclude "no change needed" record that result here and in `Outcomes & Retrospective` rather than being silently dropped.
Rationale: The brief explicitly requires section-scoped, independently-shippable slices. Recording an inspected-but-unchanged slice gives the next contributor explicit evidence that the surface was looked at on this date.
Date: 2026-05-02

Decision: Continue the `bg-primary` / `text-primary` swap to `bg-foreground` / `text-foreground` for any visibly broken accent surfaced in this pass, per the brief's "fix and call out" rule.
Rationale: The known structural cascade bug remains unfixed. Until that lands, leaving these accents in place ships a known-broken dark-mode visual. The swap pattern is already well-established by `d1cad98`. If the structural fix lands during this work, only the workarounds introduced in this pass are reverted (and called out).
Date: 2026-05-02

Decision: Do not split sliced changes into separate commits unless the user explicitly asks. Pause for review after each slice.
Rationale: The brief requires the user to review each slice and forbids autonomous commits or pushes.
Date: 2026-05-02

## Outcomes & Retrospective

All ten slices completed. Source-change slices: 1, 2, 3, 5, 7, 8, 9. Inspected-and-no-source-change slices: 4, 6.

The visitor-facing impact:

- The hero atmosphere is now correctly suppressed under `prefers-reduced-motion`. The decorative `shadow-primary/*` and `via-primary/*` tints around the hero CTA and the bottom rule swap to `*-foreground/*` so they remain visible under the broken design preset cascade in dark mode. The headline `hover:tracking-tighter` transition is gated under `motion-safe:` so reduced-motion users see static type.
- The sprint-path row bullets are now visible in dark mode (swapped `bg-primary/40` to `bg-foreground/40`); their hover scale and color transition coalesce under `motion-safe:`. The mechanism `<ol>` carries `aria-label="Mechanism steps"`; inter-step `ArrowRight` icons are explicitly `aria-hidden="true"`.
- The exec-loop step labels no longer collide with the central puck on 360-390 px viewports. The four absolute-positioned labels now use `w-20 sm:w-28 lg:w-36` with base positions at `6%/12%/88%/94%` (ramping back to the original `13%/17%/83%/84%` at the `sm:` breakpoint and up). The reduced-motion media query around the orbit and pulse keyframes was already in place and verified intact.
- Durability item titles are real `<h3>` elements (visible weight unchanged) so the page outline reads `h1 -> h2 -> h3` without skips. The closing block uses `text-pretty` instead of `text-balance` for better marketing-measure prose.
- The shadcn Accordion now honors `prefers-reduced-motion` globally via a one-line override in `globals.css` scoped by `[data-slot="accordion-content"]`. `tw-animate-css` does not ship one (audited the package's bundled CSS at `node_modules/tw-animate-css/dist/tw-animate-prefix.css`). FAQ trigger height is exactly 44 px on base / 48 px on sm+, meeting the WCAG tap-target threshold.
- The pricing surface no longer carries the only remaining `text-primary-foreground` reference on the marketing surface. The `PromoBanner` pricing-call-site `labelClassName="bg-primary text-primary-foreground"` was dropped; the default `bg-foreground text-background` chip in `promo-banner.tsx` now applies. The promo wrapper and bonus card swap from `border-primary/20 bg-primary/5` to `border-foreground/15 bg-foreground/5`. The pricing CTA tier was harmonized with the hero CTA tier (both `h-16 rounded-2xl text-lg font-bold` plus the locked invert classes); the redundant inline `bg-foreground text-background` overrides on the pricing CTA were removed since `HomePagePrimaryCta` already bakes them in. The pricing CTA scale microinteraction is gated under `motion-safe:`.
- `HomePageSecondaryLink` (consumed by the hero) coalesces its hover `-translate-y-0.5` and the icon's translate microinteraction under `motion-safe:`; color and border transitions still play under reduced motion because they are not motion.

### Removed `bg-primary` / `text-primary` / `text-primary-foreground` accents

So the future structural-cascade fix can find them and decide whether to revert:

- `apps/web/app/_components/home-page/sections/hero-sections.tsx`: `shadow-primary/20`, `hover:shadow-primary/30`, `via-primary/20` -> `shadow-foreground/15`, `motion-safe:hover:shadow-foreground/25`, `via-foreground/15`.
- `apps/web/app/_components/home-page/sections/sprint-path-unified-section.tsx`: row bullet `bg-primary/40` and `group-hover:bg-primary` -> `bg-foreground/40` and `group-hover:bg-foreground`.
- `apps/web/app/_components/home-page/sections/pricing-footer-sections.tsx`: promo wrapper `border-primary/20 bg-primary/5`, promo `labelClassName="bg-primary text-primary-foreground"`, bonus card `border-primary/20 bg-primary/5` -> `border-foreground/15 bg-foreground/5` (twice) and the labelClassName override removed entirely (default `bg-foreground text-background` now applies).

### Validation pass/fail

| Gate | Result |
| --- | --- |
| `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/public-theme-toggle.test.tsx` (slice 1 focused) | pass (2 files, 5 tests) |
| `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/checkout-button.test.tsx` (slice 8 focused) | pass (2 files, 8 tests) |
| `bun run --cwd apps/web test:integration:ui` (full integration-ui) | pass (21 files, 80 tests) |
| `bun run --cwd apps/web test:unit` (full unit) | pass (126 files, 510 tests) |
| `bun run format` | pass |
| `bun lint` | pass (oxlint, 0 warnings, 0 errors) |
| `bun typecheck` | pass (Next build completed) |
| `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-landing-page-polish.md` | pass |
| `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-landing-page-polish.md` | pass |
| Browser proof at `/?marketing=1` desktop 1440 + mobile 390, light + dark | pass (sprint-path bullets visible in both themes; exec-loop labels do not overlap central puck at 390 px; pricing promo pill uses `bg-foreground text-background`; bonus card uses foreground tokens; pricing CTA matches hero CTA tier; social-proof portrait legible in dark mode; FAQ accordion expand/collapse smooth; no regressions) |

### Deferred or noted limitations

- The browser proof captured the dev-server response and full-page screenshots but did not exhaustively walk every interactive control with the keyboard, did not exercise `prefers-reduced-motion` via the devtools rendering panel for the FAQ accordion, and could not visually confirm the dotted-glow canvas at desktop in light mode (the code path is unchanged for non-reduced-motion users; the canvas API path was verified end-to-end during the slice-1 source review). Those checks are recommended for the user's own pre-customer-launch sweep but are not blockers for this polish pass.
- The starter-system `<h2>` `aria-label` is intentionally NOT removed because `starterSystemSection.title` and the joined `starterSystemSection.titleLines` differ slightly (different punctuation and clause grouping); the aria-label preserves the smoother sentence for screen readers.
- The social-proof portrait dark-mode legibility was confirmed by the browser proof; no opacity adjustment was needed.
- `homePageSectionClassName` exported from `home-page-primitives.tsx` is unused on the public homepage today. Recorded as a follow-up; not deleted in this pass because it could still serve a planned secondary marketing surface.
- `provider-icons.tsx` has no consumer outside the file itself today. Recorded as dead code; not deleted in this pass for the same reason.
- The known structural `--primary` / `--primary-foreground` cascade bug remains unfixed; this pass routed around it for every visible primary accent. If the structural fix lands, every accent in the "Removed" list above is a candidate for reversal evaluation.

### Structural follow-ups exposed

- The shadcn `Accordion` primitive at `apps/web/components/ui/accordion.tsx` mounts `data-open:animate-accordion-down` / `data-closed:animate-accordion-up` keyframes from `tw-animate-css`, which does not ship a `prefers-reduced-motion` guard. The fix is now in `globals.css` (scoped by `data-slot="accordion-content"`). A more durable solution would be to either patch `tw-animate-css` upstream or wrap every accordion-style primitive in a project-local helper that injects the reduced-motion guard at the variant level.
- The `homePageSectionClassName` constant suggests an earlier attempt at a shared section shell that was not adopted by the in-scope sections. Decide whether to wire every section through it (consistency win) or delete it (dead code).
- `provider-icons.tsx` is a 200-line registry that no current call site renders. Decide whether to wire it into a "trusted by" or "powered by" strip on the public homepage or remove it.

### Handoff notes

- Pause-and-review per slice was honored. None of the work in this pass was committed; the user will review the diff and decide whether to commit as one or multiple commits.
- The PostHog observability files in the working tree were not touched. `git status` after every write confirmed no PostHog file entered the polish diff.
- The parallel `2026-05-02-checkout-success-polish.md` ExecPlan was not touched and its files (`checkout-success-main-panel.tsx`, `checkout-success-status-pulse.tsx`) were not modified by this pass.
- All polish-pass changes are additive and reversible; rolling back any single slice via `git checkout` leaves the remaining slices working.

## Context and Orientation

The public homepage entry point is `apps/web/app/_components/home-page/home-page.tsx`. It mounts the following section components conditionally on `getHomePageRenderModel()` from `apps/web/app/_lib/home-page-render-model.ts`:

- `CodebaseDemoSectionBlock` from `sections/codebase-demo/codebase-demo-section.tsx` (locked).
- `HomeHeroSection` from `sections/hero-sections.tsx` (in scope).
- `SprintPathUnifiedSection` from `sections/sprint-path-unified-section.tsx` (in scope; badge + title accents locked).
- `ExecLoopSectionBlock` from `sections/exec-loop-section.tsx` (in scope).
- `StarterSystemSectionBlock` from `sections/starter-system-section.tsx` (in scope).
- `DurabilitySectionBlock` from `sections/durability-section.tsx` (in scope).
- `SocialProofSection` from `sections/social-proof-section.tsx` (in scope).
- `CommonQuestionsSection` from `sections/common-questions-section.tsx` plus `faq-accordion.tsx` (in scope; title accent locked).
- `PricingSectionBlock` and `FooterSection` from `sections/pricing-footer-sections.tsx` plus `pricing-includes-list.tsx` and `promo-banner.tsx` (in scope; title accent + sign-in link + checkmark colors locked).

Cross-section primitives in scope:
- `sections/home-page-primitives.tsx` (`homePageSectionClassName`, `HomePageSecondaryLink`).
- `sections/provider-icons.tsx` (only if it actually renders on the public homepage today).
- `sections/scroll-reveal.tsx` (locked - reuse, do not re-implement).
- `sections/codebase-demo/codebase-demo-motion.ts` (locked - reuse the `useReducedMotion` pattern).

Locked surfaces:
- All `sections/codebase-demo/*`.
- `sections/home-page-primary-cta.tsx` and the `bg-foreground text-background hover:bg-foreground/90` invert pattern.
- `sections/scroll-reveal.tsx` and its reduced-motion guard.
- `sections/home-hero-top-bar.tsx`.
- The `text-foreground/90` accent in `home-hero-headline.tsx`.
- The badge + title accent tokens in `sprint-path-unified-section.tsx`.
- The title accent in `common-questions-section.tsx`.
- The title accent + sign-in link color in `pricing-footer-sections.tsx`.
- The checkmark color in `pricing-includes-list.tsx`.
- The `productPreviewSection` content + accent maps in `app/_content/home-page.ts`.
- The checkout seam: `checkout-button.tsx`, `use-stripe-checkout.ts`, `lib/codebase-flow/use-codebase-local-draft-seeder.ts`, `app/(workspace)/_components/codebase-flow/codebase-local-draft-seeder.tsx`.
- The PostHog observability migration files in the uncommitted working tree (paths under `apps/web/lib/observability/`, `apps/web/platform/`, `apps/web/instrumentation*`, `scripts/observability/`, `docs/programs/completed/2026-05-02-posthog-observability-migration/`, `.cursor/`, `.agents/skills/shared/posthog-linear-triage/`).

This pass uses the existing dependency graph: `motion/react` (`useReducedMotion`, `LayoutGroup`, `motion.*`), `next-themes`, `lucide-react`, `sonner`, shadcn primitives, `tailwind-merge`. No new dependencies are added.

The Convex mutation surface, the `Product` / `FAQPage` structured data shape, and the `starterConfig.homePage` control plane are all unchanged.

### In Scope

- Motion correctness, microinteractions, typography rhythm, spacing, color, hover/focus/active/disabled/loading states, mobile reflow at 360/390/768 and desktop, dark-mode parity, accessibility, and cross-section coherence on every in-scope section.
- Continuing the `bg-primary` / `text-primary` -> `bg-foreground` / `text-foreground` swap for any visibly broken accent surfaced in this pass.
- Promoting the durability item titles from `<p>` to `<h3>` to fix the heading outline.
- Confirming reduced-motion behavior at every animated boundary, including the `DottedGlowBackground` primitive consumed by `HeroAtmosphere`, the headline `transition-all duration-500 hover:tracking-tighter`, the sprint-path row `transition-all duration-300`, the exec-loop CSS keyframes, and the accordion `animate-accordion-down/up` keyframes.

### Out Of Scope

- Any change to the homepage shell control plane (`starterConfig.homePage`), copy (`app/_content/home-page.ts`), render model (`app/_lib/home-page-render-model.ts`), or structured data (`app/_lib/home-page-structured-data.ts`).
- Any new `data-testid`. Existing `data-testid` values must survive unchanged.
- Reordering, renaming, or re-hardwiring checkout into hero or pricing.
- Adding any new third-party dependency.
- Touching the in-flight PostHog observability migration files (uncommitted PostHog work elsewhere in the repo).
- Touching `.cursor/` or `.agents/skills/shared/posthog-linear-triage/`.
- Touching anything under `docs/programs/completed/2026-05-02-posthog-observability-migration/`.
- Convex schema, validators, or generated artifacts.
- The `Product` / `FAQPage` structured data shape.
- Fixing the structural `--primary` / `--primary-foreground` cascade bug. A separate prompt owns that fix; this pass only routes around it.
- Opening a PR or pushing without an explicit user instruction.

## Plan of Work

The pass proceeds in narrow slices, one section per slice (with primitives and the cross-section coherence audit folded into one final slice). Each slice keeps every existing `data-testid` intact, gates any new motion behind `useReducedMotion` (or a section-local `@media (prefers-reduced-motion: reduce)` override when CSS-only), pauses for the user to review, and never stages any file matching the locked-paths list.

Slice 0 captures baseline screenshots for each in-scope section at desktop 1440 and mobile 390 in both light and dark themes via the project's browser tooling. The screenshots are referenced in the agent transcript and not committed to the repo.

Slice 1 polishes the hero stack: gates `HeroAtmosphere` motion behind `useReducedMotion` if `DottedGlowBackground` does not already do so, audits the decorative `shadow-primary/*` and `via-primary/*` tints under both themes and swaps to `shadow-foreground/*` / `via-foreground/*` only if they are visibly broken, and coalesces the headline `hover:tracking-tighter` `transition-all duration-500` under reduced motion.

Slice 2 polishes the sprint path: swaps `bg-primary/40` / `group-hover:bg-primary` row bullets to `bg-foreground/40` / `group-hover:bg-foreground`, coalesces the bullet `transition-transform` and the row `transition-all duration-300` under reduced motion, and adds an `aria-label` to the mechanism `<ol>` if it is missing.

Slice 3 audits the exec loop. The in-file `@media (prefers-reduced-motion: reduce)` block already suppresses orbit and pulse keyframes; this slice verifies that and audits absolute step-label placement at 360-390 px for collisions, applying a small responsive override only if a real overlap appears.

Slice 4 polishes the starter system: drops the redundant `aria-label` on the `<h2>` (children are already visible text) and confirms the sticky lhs offset clears the marketing chrome on short viewports.

Slice 5 polishes durability: promotes each item title from `<p class="font-bold">` to `<h3>` so the page outline reads `h1 -> h2 -> h3` without skips, preserving visual weight by inheriting the same classes; adds `text-pretty` to the closing block if the marketing measure leaves ragged lines.

Slice 6 audits social proof: confirms the decorative dither and `mix-blend-soft-light` overlays remain `aria-hidden`, the `<img>` carries meaningful `alt` from content, and the portrait reads cleanly in dark mode at desktop and 390 px.

Slice 7 polishes the FAQ: walks Tab/Space/Enter/ArrowUp/ArrowDown through the accordion to prove Radix-driven keyboard nav works in the page, audits the trigger height against the 44 px touch target, and confirms (or adds) `prefers-reduced-motion` coverage for the accordion keyframes.

Slice 8 polishes pricing + footer + promo banner: swaps the `PromoBanner` pricing-call-site `labelClassName="bg-primary text-primary-foreground"` to `bg-foreground text-background`; audits `border-primary/20` + `bg-primary/5` on the promo wrapper and the bonus card under both themes and swaps to `border-foreground/15` + `bg-foreground/5` only if they wash out; harmonizes the pricing CTA `h-20` and the hero CTA `h-16` to one canonical primary-tier height; confirms the includes-list icon baseline alignment with multi-line items; verifies the sticky lhs `lg:top-24` offset.

Slice 9 polishes the primitives and provider icons: verifies `HomePageSecondaryLink` focus ring AA in both themes; if `provider-icons.tsx` ships visually on the public homepage today, adds `aria-hidden="true"` at the SVG roots, audits hard-coded brand stroke contrast, and de-duplicates SVG `id`s when `getProviderIconNodes()` is consumed; otherwise records the inspection and skips the icon work; closes with a top-to-bottom cross-section coherence walk to verify `border-t border-border/40` (or `/60`) consistency and intentional vertical rhythm via `homePageSectionClassName`.

Slice 10 runs the validation matrix end to end and updates the Outcomes & Retrospective.

## Milestones

Milestone 0: Baseline screenshots captured. No source change.

Milestone 1: Hero stack landed. Run `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/public-theme-toggle.test.tsx`.

Milestone 2: Sprint path landed. Run the same focused test set as Milestone 1 (no dedicated section test file exists).

Milestone 3: Exec loop inspected (likely no source change).

Milestone 4: Starter system landed.

Milestone 5: Durability landed (heading promotion is the substantive change).

Milestone 6: Social proof inspected (likely no source change).

Milestone 7: FAQ landed.

Milestone 8: Pricing + footer + promo banner landed. Run `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/checkout-button.test.tsx`.

Milestone 9: Primitives + provider icons + coherence walk landed.

Milestone 10: Repo-wide gate: `bun run --cwd apps/web test:integration:ui`, `bun run --cwd apps/web test:unit`, `bun run format`, `bun lint`, `bun typecheck`. Plus desktop + mobile manual viewport proof at `/?marketing=1` in light and dark, plus reduced-motion proof, plus keyboard tab walk.

## Concrete Steps

1. Capture baseline screenshots for each in-scope section at desktop 1440 and mobile 390 in light and dark via the browser tooling. Store as in-transcript artifacts.

2. Slice 1 - Hero stack:
   - In `apps/web/app/_components/home-page/sections/hero-atmosphere.tsx`, verify whether `DottedGlowBackground` honors `prefers-reduced-motion`. If not, gate the component render behind `useReducedMotion()` and render a static gradient fallback when reduced motion is preferred.
   - In `apps/web/app/_components/home-page/sections/hero-sections.tsx`, audit the `shadow-primary/20 hover:shadow-primary/30` on the hero CTA wrapper and the `via-primary/20` bottom rule under both themes. Swap to `shadow-foreground/10 hover:shadow-foreground/15` and `via-foreground/15` only if dark-mode inspection shows them visibly broken.
   - In `apps/web/app/_components/home-page/sections/home-hero-headline.tsx`, replace the unconditional `transition-all duration-500 hover:tracking-tighter` with a `useReducedMotion`-gated transition (`useReducedMotion` already lives in `motion/react`; the headline is a server component, so move the transition-bearing wrapper into a thin client component or use a Tailwind `motion-safe:` variant, whichever keeps the file under 50 lines).

3. Slice 2 - Sprint path:
   - In `apps/web/app/_components/home-page/sections/sprint-path-unified-section.tsx`, swap row bullets `bg-primary/40` / `group-hover:bg-primary` to `bg-foreground/40` / `group-hover:bg-foreground`.
   - Wrap the `transition-transform` on the bullet and the `transition-all duration-300` on the row in `motion-safe:` Tailwind variants so reduced-motion users get instant state changes.
   - If the mechanism `<ol>` lacks an `aria-label`, add `aria-label="Mechanism steps"` (or whatever short label fits the surrounding copy).

4. Slice 3 - Exec loop:
   - In `apps/web/app/_components/home-page/sections/exec-loop-section.tsx`, verify the in-file `@media (prefers-reduced-motion: reduce)` block already suppresses orbit and pulse animations.
   - Inspect at 360-390 px viewport. If labels overlap, tighten with a `clamp()` on width or a small `sm:` breakpoint override on label position.

5. Slice 4 - Starter system:
   - In `apps/web/app/_components/home-page/sections/starter-system-section.tsx`, drop the redundant `aria-label` from the `<h2>`.
   - Confirm sticky lhs offset is intentional and clears the marketing chrome.

6. Slice 5 - Durability:
   - In `apps/web/app/_components/home-page/sections/durability-section.tsx`, promote each item title element from `<p class="font-bold ...">` to `<h3 class="font-bold ...">`. Preserve every existing class so the visual weight is unchanged.
   - Add `text-pretty` to the closing paragraph if a 360 / 1440 inspection shows ragged lines.

7. Slice 6 - Social proof:
   - In `apps/web/app/_components/home-page/sections/social-proof-section.tsx`, confirm decorative overlays carry `aria-hidden="true"` and the `<img>` carries `alt` from content. Adjust opacity tokens only if dark-mode portrait crushing is visible.

8. Slice 7 - FAQ:
   - In `apps/web/app/_components/home-page/faq-accordion.tsx` and `apps/web/components/ui/accordion.tsx`, verify Tab/Space/Enter/ArrowUp/ArrowDown navigation works.
   - Measure the rendered trigger height. If under 44 px, bump `py-2.5` to `py-3` on the shared trigger only if no other consumer regresses.
   - Verify the global CSS or accordion CSS suppresses `animate-accordion-down/up` under `prefers-reduced-motion`. If not, add a section-local `@media (prefers-reduced-motion: reduce)` override that sets `animation: none !important` for those data states.

9. Slice 8 - Pricing + footer + promo banner:
   - In `apps/web/app/_components/home-page/sections/pricing-footer-sections.tsx`, replace `labelClassName="bg-primary text-primary-foreground"` with `labelClassName="bg-foreground text-background"`.
   - Audit `border-primary/20` and `bg-primary/5` on the promo banner wrapper and the bonus card. Swap to `border-foreground/15` + `bg-foreground/5` only if dark-mode inspection shows them washing out.
   - Choose one canonical primary-tier height between hero CTA `h-16` and pricing CTA `h-20`. Default to `h-16` for cross-section CTA rhyme; if the user prefers the larger pricing CTA stays as a "primary-XL" tier, document that and leave both heights.
   - Switch the includes-list `items-center` to `items-start` only if multi-line items show baseline drift.
   - Confirm sticky lhs `lg:top-24` clears the marketing chrome.

10. Slice 9 - Primitives + provider icons + coherence:
    - In `apps/web/app/_components/home-page/sections/home-page-primitives.tsx`, verify `HomePageSecondaryLink` focus ring AA contrast in both themes. Tighten ring color only if not.
    - Confirm whether `apps/web/app/_components/home-page/sections/provider-icons.tsx` actually renders on the public homepage today. If yes, add `aria-hidden="true"` to each SVG root, audit hard-coded `#fff` strokes, de-duplicate SVG `id`s. If no, record inspected-but-not-rendered.
    - Walk top-to-bottom and confirm `border-t border-border/40` (or `/60`) consistency between sections, and intentional vertical rhythm.

11. Slice 10 - Validation:
    - Run focused test sets for each section that has one.
    - Run the broader `bun run --cwd apps/web test:integration:ui` and `bun run --cwd apps/web test:unit`.
    - Run `bun run format`, `bun lint`, `bun typecheck`.
    - Run `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-landing-page-polish.md` and `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-landing-page-polish.md`.
    - Capture manual desktop + mobile viewport proof at `/?marketing=1` in light + dark.
    - Verify reduced-motion behavior by toggling the system setting or the browser devtools rendering panel.
    - Tab through every interactive control on the page once. Confirm a visible focus ring at every stop. Confirm logical tab order. Confirm no focus traps.
    - Update `Outcomes & Retrospective` and `Surprises & Discoveries`.

## Validation and Acceptance

The pass is acceptable when every polish dimension from the brief either lands or is explicitly deferred in this plan with a reason; every locked behavior, contract, and `data-testid` survives unchanged; the validation matrix passes (or any skipped check is justified); the diff stays inside the in-scope surfaces; and a desktop + mobile manual viewport proof at `/?marketing=1` in both themes shows: every section reads as intentionally polished, no horizontal scroll, no awkward wrapping at 360-768 px, every animation drops to a static state under reduced motion, every interactive control has a visible focus ring, and the `bg-primary` / `text-primary-foreground` accents removed in this pass are not present anywhere else on the public marketing surface.

### Test Commands

Run from repo root unless a working directory is specified.

Per-slice focused tests (run when a touched section has a corresponding test file):

    bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx
    bun run --cwd apps/web test:integration:ui tests/integration-ui/public-theme-toggle.test.tsx
    bun run --cwd apps/web test:integration:ui tests/integration-ui/checkout-button.test.tsx
    bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-product-preview.test.tsx
    bun run --cwd apps/web test:unit tests/unit/home-page-content.test.ts
    bun run --cwd apps/web test:unit tests/unit/home-page-render-model.test.ts

Broader suites after the last slice:

    bun run --cwd apps/web test:integration:ui
    bun run --cwd apps/web test:unit

Repo-level gate:

    bun run format
    bun lint
    bun typecheck

Plan and markdown lint:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-landing-page-polish.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-landing-page-polish.md

Manual smoke:

    Open `/?marketing=1` at desktop 1440 and mobile 390 in light and dark themes.
    Scroll top to bottom in each combination. Confirm intentional rhythm, dark-mode parity, no horizontal scroll, no awkward wrapping.
    Toggle `prefers-reduced-motion` (system setting or browser devtools rendering panel). Confirm every animation drops to a static state.
    Tab through every interactive control on the page. Confirm a visible focus ring at every stop. Confirm logical tab order. Confirm no focus traps.

## Idempotence and Recovery

Every slice in this pass is additive. Re-running any slice is safe: motion gates fall through to opacity-only or static state under reduced motion, accent-token swaps preserve the same visual weight in light mode, and the heading promotion in the durability section preserves every visible class.

To roll back any slice, revert the slice's commits. The locked behavior surfaces (Codebase demo, CTA seam, `data-testid` values, structured data) are unchanged across the pass, so no migration is required either way.

If the structural `--primary` / `--primary-foreground` cascade fix lands during this work, only the workarounds introduced in this pass are reverted (not the prior `d1cad98` swaps), and the reversal is called out explicitly in `Outcomes & Retrospective`.

## Artifacts and Notes

After the pass lands, capture in `Outcomes & Retrospective`:

- The list of new commits with their conventional-commit subjects (or "uncommitted, awaiting review" if the user has not yet asked for a commit).
- The validation pass/fail table.
- Manual desktop + mobile screenshots at `/?marketing=1` (light and dark) for every slice that produced a visible change.
- Any deferred polish item with a short reason.
- Any structural follow-up the polish exposed.
- A clear handoff note for any work that should ship before customer launch but did not fit this polish scope.

## Interfaces and Dependencies

This pass relies on these existing exports remaining stable:

- `motion/react`: `useReducedMotion`. No new motion library use.
- `next-themes`: theme hooks (only consumed by the locked top bar).
- `lucide-react`: `Check`, `ArrowRight`, `ArrowUpRight`, `ShieldCheck`. No new icon imports unless the polish strictly requires one.
- `sonner`: not consumed in this pass (the post-checkout toast is in the locked seeder).
- shadcn primitives: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`, `Button`. Surfaced via `apps/web/components/ui/*`.
- `tailwind-merge`: via `cn()` from `apps/web/lib/utils.ts`.

This pass does not introduce any new internal interfaces. Every change is a localized class, attribute, or element-tag swap, plus optional `motion-safe:` Tailwind variants and one optional thin client-only wrapper around the headline transition.
