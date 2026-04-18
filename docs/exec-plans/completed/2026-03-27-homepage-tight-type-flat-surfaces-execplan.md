---
summary: "ExecPlan for tightening the homepage by removing airy label treatments, flattening passive card chrome, and normalizing type and spacing. It keeps the offer, anchors, CTA behavior, and SEO contract intact while making the page feel more deliberate."
read_when: "Open this when you need the exact homepage cleanup scope, milestone breakdown, or validation targets."
plan_status: "done"
---

# Tighten Homepage Type And Remove Passive Card Chrome

This is a living execution plan for a focused public-homepage cleanup pass. It is written so a fresh coding agent can remove the airy badge typography, standalone eyebrow-style labels, and passive card surfaces without needing the earlier chat thread or any prior homepage planning context.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

The homepage message and section order are already in the right neighborhood, but the page still leaks visual habits the user explicitly rejected: airy, tracked-out labels, standalone eyebrow-style microcopy, and passive framed surfaces that make the page feel more like assembled marketing UI than a serious product shell. After this work, a visitor opening `/?marketing=1` should still see the same offer, CTA path, anchors, and SEO contract, but the page should read tighter, flatter, and more deliberate. The result should feel closer to premium editorial minimalism: no section mustaches or eyebrows, divider-based structure instead of bordered cards, normal body leading instead of loose copy blocks, and a cleaner hierarchy that still preserves the current hero display typography, top-bar buttons, and key proof surfaces.

## Progress

- [x] 2026-03-27 11:39 EDT: Read the repo root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, and `docs/prompts/execplan-writer.md` before writing this plan.
- [x] 2026-03-27 11:39 EDT: Loaded the project design context from `.impeccable.md` and used the `frontend-design` skill context rules to confirm the product should feel serious, premium, minimal, and operational rather than playful or decorative.
- [x] 2026-03-27 11:39 EDT: Inspected the real homepage implementation in `apps/web/features/marketing/components/home-page/` plus the homepage contract doc and the current validation tests before freezing scope.
- [x] 2026-03-27 11:39 EDT: Resolved the main planning ambiguities from the repo: the hero eyebrow is long-form meta copy rather than a section label, the old `homePageQuietSurfaceClassName` helper is unused and should be removed in a no-cards pass, and the footer theme-toggle wrapper can be flattened without changing the actual toggle control behavior.
- [x] 2026-03-27 12:02 EDT: Grilled the plan against the user again and resolved the highest-leverage styling ambiguity: the page should keep strong hero and top-bar buttons, but remove all standalone label or eyebrow treatments entirely instead of restyling them into a new micro-label system.
- [x] 2026-03-27 12:00 EDT: Removed the remaining standalone eyebrow rows and folded the visual cleanup into the homepage feature components without widening the render-model or structured-data surface.
- [x] 2026-03-27 12:00 EDT: Removed the passive card and chip wrappers from the durability, sprint-path, pricing footer, and footer chrome surfaces while keeping the interactive controls intact.
- [x] 2026-03-27 12:00 EDT: Ran the homepage validation stack, browser smoke, production build, and a manual light/dark browser read on `/?marketing=1`; the remaining grep hits are intentional hero/footer controls and the preserved hero display headline.

## Surprises & Discoveries

The current homepage already has a partial visual reset, but the remaining problems are distributed across multiple files rather than concentrated in one obvious offender. The tracked-out uppercase label pattern is still present in `apps/web/features/marketing/components/home-page/hero-sections.tsx`, `social-proof-section.tsx`, `whats-inside-section.tsx`, `durability-section.tsx`, `common-questions-section.tsx`, and `starter-system-section.tsx`. This means the cleanup must be treated as a system pass, not a one-file tweak.

The previous draft counted fourteen `leading-relaxed` cases, but the current repo has fifteen such matches in homepage files, plus one `leading-loose` highlight wrapper in `apps/web/features/marketing/components/home-page/whats-inside-section.tsx`. If that highlight wrapper is left alone, the page will still feel looser than the user asked for even after the obvious paragraph classes are normalized.

The user rejected labels altogether after the first draft of this plan. That moves the implementation away from inventing a better label style and toward removing the label rows entirely. In practical terms, `hero.eyebrow`, `pricingSection.label`, `pricingSection.eyebrow`, `pricingSection.bonus.label`, `socialProofSection.label`, `faqSection.label`, `whatsInsideSection.label`, and the hardcoded `Built on` string in `starter-system-section.tsx` should not survive as standalone rows. If a fact still matters, it must be folded into nearby body or trust copy.

The footer theme toggle issue is narrower than it first appears. The wrapper chip in `apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx` is passive marketing chrome and should go. The actual toggle in `apps/web/features/marketing/components/home-page/home-hero-theme-toggle.tsx` is a real control rendered through the shared button primitive and does not need to be redesigned unless manual QA shows it still reads too heavy after the wrapper is removed.

`apps/web/features/marketing/components/home-page/home-page-primitives.tsx` still exports `homePageQuietSurfaceClassName`, but the current homepage no longer uses it anywhere. This is a useful signpost for the cleanup: a no-cards pass should not leave an unused boxed-surface primitive behind.

The user clarified that “flat” applies to passive surfaces, not to the main hero and top-bar buttons. That means `apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx` should stay visually strong and button-like. The no-cards rule should not accidentally flatten the controls that already work.

After implementation, the remaining grep hits are intentional: the hero headline keeps its display uppercase treatment, the hero and pricing CTAs keep their rounded button shapes, the top-bar theme control keeps its hover behavior, and the sprint-path dot keeps its primary tint as a small accent rather than a card surface. The footer wordmark also now reads tighter after dropping the airy letter-spacing animation and pill wrapper.

## Decision Log

Decision: Treat this as a presentation-only homepage slice, not a new message strategy or funnel rewrite.
Rationale: The current section order, CTA routing, anchors, render-model behavior, and structured-data rules are already covered by the homepage contract. The user asked for tighter typography and flatter surfaces, not a new homepage information architecture.
Date: 2026-03-27

Decision: Remove standalone label and eyebrow rows entirely instead of inventing a replacement micro-label system.
Rationale: The user explicitly rejected labels, mustaches, and eyebrows after reviewing the first plan draft. The pass should therefore delete those rows rather than restyle them.
Date: 2026-03-27

Decision: Preserve the hero display headline as the one clear uppercase brand moment, but audit the footer wordmark for any airy spacing.
Rationale: `apps/web/features/marketing/components/home-page/home-hero-headline.tsx` already uses tight negative tracking and is part of the product’s established display identity. The footer wordmark is allowed to remain uppercase only if it still reads tight after this pass; any positive spacing or animated airy letter spacing should be removed if it weakens the new direction.
Date: 2026-03-27

Decision: “No cards” means no passive bordered or tinted containers whose only job is emphasis.
Rationale: The user explicitly asked for flat minimal structure. That rules out item cards, value-frame chips, dark slabs, and decorative container-on-container layouts. It does not ban functional controls such as buttons, accordions, or image crops.
Date: 2026-03-27

Decision: Keep hero and top-bar buttons visually strong; “flat” applies to passive surfaces, not to the primary control language.
Rationale: The user clarified that the main hero and top-bar buttons are still desirable. The pass should not collapse button hierarchy while removing passive card and chip chrome.
Date: 2026-03-27

Decision: `apps/web/features/marketing/content/home.ts` is in scope if removing label rows requires folding necessary facts into adjacent copy.
Rationale: Once standalone labels are removed, some factual lines such as payment or bonus framing may need to be rewritten into nearby trust or body copy. That is a planned content adjustment, not accidental scope creep.
Date: 2026-03-27

Decision: Remove the unused `homePageQuietSurfaceClassName` export during this pass.
Rationale: Leaving a dead “quiet surface” helper behind would preserve the old card vocabulary in code after the page itself moves away from it.
Date: 2026-03-27

## Outcomes & Retrospective

This section should be updated after implementation. Success means the homepage still renders the same offer and preserves `#system`, `#pricing`, primary CTA behavior, founder proof, GitHub proof, FAQ schema, and pricing schema truthfulness, while visibly removing the remaining airy badge language and passive card chrome. The most likely follow-up risk is that one or two proof or footer details may still feel too decorative after the main sweep; if so, record the exact remaining offender here instead of leaving a vague “more polish later” note.

The sweep completed without changing the render model or structured-data code. The homepage now presents with divider-led sections, no standalone eyebrow rows, flatter durability and sprint-path treatment, and a tighter footer wordmark. The only remaining prominent uppercase/tracking hits are intentional brand or control surfaces.

## Context and Orientation

The public homepage is assembled in `apps/web/features/marketing/components/home-page.tsx`. That file pulls together `HomeHeroSection`, `SprintPathUnifiedSection`, `WhatsInsideSection`, `StarterSystemSectionBlock`, `DurabilitySectionBlock`, `SocialProofSection`, `CommonQuestionsSection`, `PricingSectionBlock`, and `FooterSection`. The enabled sections and CTA targets come from `apps/web/features/marketing/lib/home-page-render-model.ts`, which reads starter-config state from `apps/web/config/product.ts` and content from `apps/web/features/marketing/content/home.ts`. This plan does not change that control plane or the fixed section order. It changes only presentation and minor copy-role decisions inside the homepage feature components.

The relevant visual files are `apps/web/app/globals.css` for reusable typography utilities, plus the homepage section components under `apps/web/features/marketing/components/home-page/`. The current anti-patterns are present in `hero-sections.tsx`, `social-proof-section.tsx`, `whats-inside-section.tsx`, `durability-section.tsx`, `common-questions-section.tsx`, `starter-system-section.tsx`, `sprint-path-unified-section.tsx`, and `pricing-footer-sections.tsx`. `apps/web/features/marketing/components/home-page/pricing-includes-list.tsx` also participates because it still uses loose line-height. `apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx` matters as an explicit non-target for flattening: its buttons stay strong, but the plan must avoid accidentally dragging it into the no-cards cleanup. `home-page-primitives.tsx` matters because it contains the dead `homePageQuietSurfaceClassName` export that should be removed as part of the no-cards cleanup.

The design context lives in `.impeccable.md`. The core user is a knowledge worker using AI coding and design tools to move from idea to shipped v1 in one weekend. The interface should feel serious, expensive, confident, and operational. The brand target is between Airbnb simplicity and early Uber minimalism, with strong hierarchy and restrained color. That context supports a tight, flat, premium pass. It does not support playful microcopy, soft toy-like surfaces, glassy cards, or decorative padding for its own sake.

The current homepage contract is documented in `apps/web/content/docs/configure-the-homepage.mdx`. Preserve these invariants while implementing this plan: the top-level section order remains fixed, the `system` and `pricing` anchors remain in place, hero and pricing still render through `home-page-primary-cta.tsx`, GitHub proof stays conditional through the render model, `FAQPage` schema stays tied to the FAQ section, and `Product` schema stays tied to a checkout-driven pricing CTA. Because this pass is presentational, a correct implementation should not need to touch the render model or structured-data code.

The validation surface already exists. The homepage contract is guarded by `apps/web/tests/unit/home-page-content.test.ts`, `apps/web/tests/unit/home-page-render-model.test.ts`, `apps/web/tests/unit/home-page-structured-data.test.ts`, `apps/web/tests/integration-ui/home-page-primary-cta.test.tsx`, and `apps/web/tests/browser-smoke/app-smoke.spec.ts`. The browser-smoke test named `landing page renders the main offer CTA` proves that the page still renders the promise, the starter-system headline, the durability headline, the main CTA, the `system` anchor, the `pricing` anchor, and the blog link. The browser-smoke test named `homepage renders structured SEO data` proves that the homepage still emits `FAQPage` and `Product` schema on the default path.

## Plan of Work

Start by deleting the standalone label rows rather than designing a nicer label system. Remove the remaining tracked-out uppercase label treatments from the homepage sections, and if any factual line still matters after that removal, fold it into adjacent body, trust, or bonus copy in `apps/web/features/marketing/content/home.ts`. Do not invent a new section-label pattern. The goal is that the page no longer needs mustaches, eyebrows, or overlines at all.

Once the label rows are gone, normalize the line-height, weight, and opacity drift in the touched homepage files. Every body paragraph in the homepage pass should move to `leading-normal` unless there is a specific reason not to. Item titles should use `font-semibold` instead of `font-bold`. Meta copy should resolve to a small set of opacity values instead of the current mix of `/90`, `/70`, `/60`, `/55`, and `/20`. The price display and hero display should remain display moments rather than getting flattened into ordinary text.

After the type cleanup is stable, flatten passive surfaces. Replace durability cards with divider-based rows. Replace the sprint-path value-frame chip with a simple top-divider note. Remove passive hover-fill treatments that make list rows feel like latent cards, especially in `whats-inside-section.tsx`. Remove the footer “Display” pill wrapper. Leave functional controls intact, especially the hero and top-bar buttons the user wants to keep. Review the social-proof image wrapper and the footer wordmark at the end of the pass; keep those only if they still read as content or brand moments rather than card chrome.

Finish with a grep audit and homepage-focused validation. The grep audit should prove that the homepage files no longer contain the badge-era patterns that motivated the pass. Then run lint, format, unit, integration-ui, targeted browser-smoke, and build checks. Manual QA should confirm the page still feels premium in both light and dark mode, the hero display remains the strongest typography moment, and the rest of the page no longer relies on card frames or loose leading to create hierarchy.

## Milestones

### Milestone 1: Remove badge-era and eyebrow-style label rows from the homepage

At the end of this milestone, the homepage no longer renders standalone section labels, mustaches, or eyebrow rows in the known homepage sections. The likely files are `apps/web/features/marketing/components/home-page/hero-sections.tsx`, `social-proof-section.tsx`, `whats-inside-section.tsx`, `durability-section.tsx`, `common-questions-section.tsx`, `starter-system-section.tsx`, `pricing-footer-sections.tsx`, and `apps/web/features/marketing/content/home.ts` if necessary. The milestone is successful when those rows are deleted and any still-essential factual line has been folded into adjacent real copy instead of surviving as a micro-label.

Run `oxlint` and `oxfmt --check` on the touched homepage files after this milestone. Then run the grep audit for badge-era classes to confirm the main label cleanup is real rather than partial.

### Milestone 2: Normalize line-height, weights, and opacity drift inside the same homepage files

At the end of this milestone, the touched homepage sections no longer use loose body leading or inconsistent microcopy opacity rules. The likely files are `hero-sections.tsx`, `social-proof-section.tsx`, `whats-inside-section.tsx`, `durability-section.tsx`, `common-questions-section.tsx`, `starter-system-section.tsx`, `sprint-path-unified-section.tsx`, `pricing-footer-sections.tsx`, and `pricing-includes-list.tsx`. `whats-inside-section.tsx` must also remove the `leading-loose` highlight wrapper. The milestone is successful when body copy uses `leading-normal`, item headings use `font-semibold`, and the touched sections resolve to a smaller, intentional set of opacity treatments.

Run `oxlint`, `oxfmt --check`, and the homepage unit tests after this milestone. The unit tests should continue to pass without changing render-model behavior or homepage copy unless a truly necessary copy adjustment is made.

### Milestone 3: Remove passive card chrome and flatten the remaining framed surfaces

At the end of this milestone, the homepage no longer relies on passive cards, slabs, chips, or hover-fill panels to create emphasis. The likely files are `durability-section.tsx`, `sprint-path-unified-section.tsx`, `whats-inside-section.tsx`, `pricing-footer-sections.tsx`, and `home-page-primitives.tsx`. Durability should become a border-top list rather than a stack of rounded cards. The sprint-path value frame should become a divider note instead of a framed chip. The footer “Display” chip should disappear, and the unused `homePageQuietSurfaceClassName` export should be removed. This milestone is successful when a manual visual read of the page shows divider-based structure, strong type, and whitespace doing the work that boxes used to do, while the hero and top-bar buttons remain intentionally button-like.

Run `oxlint`, `oxfmt --check`, and the CTA integration-ui test after this milestone. If the footer or pricing CTA styling changes materially, inspect focus states and tap targets before moving on.

### Milestone 4: Validate the homepage contract and document any remaining visual edge cases

At the end of this milestone, the page still satisfies the homepage contract and the new typography-and-surface rules are demonstrably present. Run the full homepage-focused validation stack from the contract doc, then perform manual QA at `/?marketing=1` in light and dark mode. This milestone is successful when the browser-smoke checks pass, the build passes, and manual QA confirms that the hero display remains the dominant typography moment while the rest of the page feels tighter and flatter.

If any one surface still reads like leftover card chrome, record it in `Surprises & Discoveries` and either fix it in the same milestone or log it as a precise follow-up instead of a vague design debt note.

## Concrete Steps

Start from the repository root and refresh the homepage contract, design context, and the exact files involved in this pass.

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,220p' .impeccable.md
    sed -n '1,240p' apps/web/content/docs/configure-the-homepage.mdx
    sed -n '1,220p' apps/web/features/marketing/components/home-page/hero-sections.tsx
    sed -n '1,220p' apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx
    sed -n '1,240p' apps/web/features/marketing/components/home-page/social-proof-section.tsx
    sed -n '1,220p' apps/web/features/marketing/components/home-page/whats-inside-section.tsx
    sed -n '1,220p' apps/web/features/marketing/components/home-page/durability-section.tsx
    sed -n '1,220p' apps/web/features/marketing/components/home-page/common-questions-section.tsx
    sed -n '1,260p' apps/web/features/marketing/components/home-page/starter-system-section.tsx
    sed -n '1,220p' apps/web/features/marketing/components/home-page/sprint-path-unified-section.tsx
    sed -n '1,260p' apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx
    sed -n '1,160p' apps/web/features/marketing/components/home-page/pricing-includes-list.tsx
    sed -n '1,160p' apps/web/features/marketing/components/home-page/home-page-primitives.tsx
    sed -n '1,260p' apps/web/features/marketing/content/home.ts

Run a before-state grep so the implementer can see exactly what is being removed.

    cd /Users/parkerrex/Projects/ship-by-sunday
    rg -n "uppercase|tracking-\\[|tracking-wide|tracking-widest|leading-relaxed|leading-snug|leading-7|leading-8|leading-loose|rounded-2xl|bg-muted/|bg-primary/|hover:bg-" apps/web/features/marketing/components/home-page apps/web/features/marketing/content/home.ts

Implement Milestone 1 and Milestone 2 in the homepage files. Keep the first slice limited to homepage presentation and any required copy folding in `apps/web/features/marketing/content/home.ts`. Do not touch `apps/web/features/marketing/lib/home-page-render-model.ts` or `apps/web/features/marketing/lib/home-page-structured-data.ts` unless a touched test proves they unexpectedly depend on a visual detail.

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx oxlint --deny-warnings features/marketing/components/home-page.tsx features/marketing/components/home-page/hero-sections.tsx features/marketing/components/home-page/home-hero-top-bar.tsx features/marketing/components/home-page/social-proof-section.tsx features/marketing/components/home-page/whats-inside-section.tsx features/marketing/components/home-page/durability-section.tsx features/marketing/components/home-page/common-questions-section.tsx features/marketing/components/home-page/starter-system-section.tsx features/marketing/components/home-page/sprint-path-unified-section.tsx features/marketing/components/home-page/pricing-footer-sections.tsx features/marketing/components/home-page/pricing-includes-list.tsx features/marketing/components/home-page/home-page-primitives.tsx features/marketing/content/home.ts
    bunx oxfmt --check app/globals.css features/marketing/components/home-page.tsx features/marketing/components/home-page/hero-sections.tsx features/marketing/components/home-page/home-hero-top-bar.tsx features/marketing/components/home-page/social-proof-section.tsx features/marketing/components/home-page/whats-inside-section.tsx features/marketing/components/home-page/durability-section.tsx features/marketing/components/home-page/common-questions-section.tsx features/marketing/components/home-page/starter-system-section.tsx features/marketing/components/home-page/sprint-path-unified-section.tsx features/marketing/components/home-page/pricing-footer-sections.tsx features/marketing/components/home-page/pricing-includes-list.tsx features/marketing/components/home-page/home-page-primitives.tsx features/marketing/content/home.ts
    bunx vitest --config vitest.config.ts run --project unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts

Implement Milestone 3 and then rerun the grep audit. The expected observation is that the homepage files no longer contain the badge-era classes or passive rounded card wrappers except in functional controls or the preserved hero display surface.

    cd /Users/parkerrex/Projects/ship-by-sunday
    rg -n "uppercase|tracking-\\[|tracking-wide|tracking-widest|leading-relaxed|leading-snug|leading-7|leading-8|leading-loose|rounded-2xl|bg-muted/|bg-primary/|hover:bg-" apps/web/features/marketing/components/home-page apps/web/features/marketing/content/home.ts

Run the CTA integration-ui test, the targeted browser-smoke checks, and the production build.

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/home-page-primary-cta.test.tsx
    PLAYWRIGHT_USE_LOCAL_SERVER=1 bunx playwright test --project=browser-smoke tests/browser-smoke/app-smoke.spec.ts --grep "landing page renders the main offer CTA|homepage renders structured SEO data"

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run build

Finish with manual QA in a local browser. Use `localhost`, not `127.0.0.1`, to avoid a misleading Next.js dev WebSocket warning during local review.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run dev

Open `http://localhost:3000/?marketing=1` and verify the page in light mode and dark mode. Confirm that there are no standalone label rows above sections, the hero and top-bar buttons still feel strong, the footer no longer starts with a pill wrapper, durability reads as a flat list instead of cards, and the page no longer feels airy or over-tracked.

## Validation and Acceptance

The work is accepted only if the homepage still behaves like the current public offer while visibly adopting the new type-and-surface rules. A correct implementation must preserve the hero CTA, the hero top-bar controls, the `system` and `pricing` anchors, the founder proof image, the GitHub activity graph when social proof is enabled, the FAQ accordion, the pricing CTA path, the blog link in the footer, and the default `FAQPage` plus `Product` structured-data output on the default homepage path.

Run the homepage-focused validation stack in this order: homepage lint and format checks on the touched files, homepage unit tests, CTA integration-ui, targeted browser smoke, and `bun run build`. The grep audit is also part of acceptance. The important success signal is not just green tests; it is that the grep audit no longer shows the old uppercase badge language, standalone eyebrow copy, and loose-leading classes in the homepage files being cleaned up.

Manual QA is mandatory because this is a design pass. In light mode and dark mode, verify that the page feels tighter and flatter than before, that body copy does not read loose, that no section still opens with a label or eyebrow row, that passive framed surfaces are gone, and that the remaining controls still feel interactive. If the footer wordmark still looks airy after the rest of the cleanup, tighten it in the same slice and rerun the affected checks.

## Idempotence and Recovery

This plan is safe to execute incrementally because it is presentation-only and should remain inside feature-local homepage files plus `apps/web/app/globals.css`. Apply changes in small slices and rerun the homepage checks after each milestone. If one slice introduces a visual regression or breaks a test, revert only that local change and keep the rest of the pass intact.

If manual QA shows that removing a label row leaves an important fact orphaned, prefer a one-line content adjustment in `apps/web/features/marketing/content/home.ts` rather than inventing a new one-off label treatment. Document the copy change in `Decision Log` when that happens. If a flattening pass accidentally makes an element look non-interactive, restore the minimum necessary control affordance instead of reintroducing a passive card wrapper around it.

The build and browser-smoke checks can be rerun safely. For local browser QA, always use `localhost` when the dev server is on `localhost`; otherwise a host mismatch can create a false-positive console error. If the targeted browser-smoke command fails because environment variables are missing, source `.env.local` into the shell and rerun from the same working directory, then record that recovery step in this plan.

## Artifacts and Notes

At implementation time, record the before-and-after grep snippets here so a future contributor can see that the badge-era classes, standalone eyebrow copy, and loose-leading classes were actually removed.

Record the final validation summary here in short form, for example:

    oxlint: passed on touched homepage files
    oxfmt --check: passed on touched homepage files
    homepage unit tests: passed
    home-page-primary-cta integration-ui: passed
    targeted browser smoke: passed
    build: passed
    manual light/dark QA at http://localhost:3000/?marketing=1: passed

If the implementation needs one source-copy normalization in `apps/web/features/marketing/content/home.ts`, paste the exact changed text here with a one-sentence explanation for why removing the old standalone row required folding the fact into neighboring copy.

## Interfaces and Dependencies

The homepage assembly boundary remains `apps/web/features/marketing/components/home-page.tsx`. This plan does not change its section order or wiring. The CTA boundary remains `apps/web/features/marketing/components/home-page/home-page-primary-cta.tsx`, and the pricing plus hero sections must continue to route their primary CTA through that component.

The content boundary remains `apps/web/features/marketing/content/home.ts`. It may stay untouched if class-only cleanup is sufficient. The render-model boundary remains `apps/web/features/marketing/lib/home-page-render-model.ts`, and the structured-data boundary remains `apps/web/features/marketing/lib/home-page-structured-data.ts`. Do not widen this pass into those files unless a test proves a presentational assumption unexpectedly affects them.

The key implementation files are `apps/web/app/globals.css`, `apps/web/features/marketing/content/home.ts`, `apps/web/features/marketing/components/home-page/hero-sections.tsx`, `home-hero-top-bar.tsx`, `social-proof-section.tsx`, `whats-inside-section.tsx`, `durability-section.tsx`, `common-questions-section.tsx`, `starter-system-section.tsx`, `sprint-path-unified-section.tsx`, `pricing-footer-sections.tsx`, `pricing-includes-list.tsx`, and `home-page-primitives.tsx`. The existing test dependencies are `apps/web/tests/unit/home-page-content.test.ts`, `apps/web/tests/unit/home-page-render-model.test.ts`, `apps/web/tests/unit/home-page-structured-data.test.ts`, `apps/web/tests/integration-ui/home-page-primary-cta.test.tsx`, and `apps/web/tests/browser-smoke/app-smoke.spec.ts`.

The design dependency is the project context in `.impeccable.md`: serious, premium, minimal, operational, and closer to Airbnb or early Uber restraint than generic SaaS marketing UI. The practical consequence is simple: use typography, spacing, and dividers to create hierarchy; remove passive cards and badge chrome; preserve only the few display and proof moments that still earn visual emphasis.
