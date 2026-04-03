---
summary: "ExecPlan for a section-by-section visual reset of the public homepage to remove generic AI-landing-page patterns and make the page feel more expensive and deliberate. It keeps the existing homepage contract intact while rebuilding the visual language, hierarchy, and section primitives."
read_when: "Open this when you need to redesign the public homepage without changing section order, CTA behavior, or SEO and pricing contracts."
plan_status: "done"
---

# Reset The Homepage Visual Language And Remove Cheap UI Patterns

This is a living execution plan for a section-by-section visual reset of the public homepage. It is written so a fresh coding agent can execute the redesign without prior chat context and without relying on the earlier implementation thread.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

The homepage message is now closer to the right promise, but the interface still contains too many patterns that read as generic AI-generated landing-page UI: repeated badges, nested cards, cheap gradients, repeated tinted panels, and explainer-style diagrams. After this work, a visitor landing on `/?marketing=1` should still understand the offer quickly, but the page should feel more expensive, cleaner, and more deliberate. The goal is not to remove personality. The goal is to remove the low-signal UI furniture that makes the page feel templated. A human should be able to open the homepage and see a bold, minimal, premium system with stronger hierarchy, quieter structure, and fewer boxed surfaces, while all CTA behavior, section order, and SEO or pricing contracts continue to work.

## Progress

- [x] 2026-03-26 08:28 EDT: Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, and `docs/prompts/execplan-writer.md` before writing this plan.
- [x] 2026-03-26 08:28 EDT: Inspected the current homepage section components, the design context in `.impeccable.md`, the current homepage contract doc, and the recently changed loop-preview surfaces.
- [x] 2026-03-26 08:28 EDT: Confirmed the redesign scope is visual-language reset only, not a new homepage message strategy or funnel rewrite.
- [x] 2026-03-26 08:28 EDT: Read the guidance in `.agents/skills/polish`, `.agents/skills/harden`, `.agents/skills/optimize`, and `.agents/skills/normalize` through dedicated subagent reviews and used the useful parts to tighten this plan.
- [x] 2026-03-26 09:02 EDT: Grilled the plan against the repo and resolved the remaining high-impact scope questions: the hero may drop its preview and outcome list, sprint-path owns the strongest visual sell, `durability` can be demoted into supporting copy, proof compresses around founder image plus GitHub graph, FAQ trims to the strongest 5-7 questions, pricing compresses hard, and the bonus must read as explicit free extra value rather than bundle inventory.
- [x] 2026-03-26 09:28 EDT: Replaced the first batch of homepage chrome with feature-local primitives in `home-page-primitives.tsx`, rebuilt the hero around headline/body/CTA plus a single operational note, and rebuilt `system-loop-preview.tsx` plus `sprint-path-unified-section.tsx` around a flatter product-truth-to-packs visual. `oxlint`, `oxfmt --check`, and the homepage content/render-model unit tests passed for this slice.
- [x] 2026-03-26 09:30 EDT: Rebuilt `whats-inside-section.tsx` and `starter-system-section.tsx` as typography-first sections with row-based structure instead of boxed card grids, and added an explicit bonus callout above pricing. `oxlint`, `oxfmt --check`, and the homepage content/render-model unit tests passed for this slice.
- [x] 2026-03-26 09:38 EDT: Simplified `durability`, proof, FAQ, pricing, and footer around the same quieter primitive layer; split the old proof/FAQ file into `social-proof-section.tsx` and `common-questions-section.tsx`; removed the unused globe proof surface; and trimmed FAQ to 7 questions after manual QA exposed that it was still one item over the plan target.
- [x] 2026-03-26 09:38 EDT: Ran the final homepage validation stack: `oxlint` and `oxfmt --check` across the homepage files, unit tests for `home-page-content`, `home-page-render-model`, and `home-page-structured-data`, the `home-page-primary-cta` integration-ui test, targeted browser-smoke for the landing CTA and structured SEO data, manual Playwright QA at desktop and 320px mobile, and `bun run build`.
- [x] 2026-03-26 10:19 EDT: Re-ran the full homepage validation loop against the current working tree without additional homepage code edits. `oxlint`, `oxfmt --check`, homepage unit tests, the `home-page-primary-cta` integration-ui test, targeted browser-smoke, fresh Playwright QA on `http://localhost:3000/?marketing=1`, and `bun run build` all passed. Captured fresh dated desktop and 320px screenshots under `output/playwright/` and confirmed the only remaining browser warning was the expected Clerk development-instance warning.
- [x] Replace repeated badges, nested cards, and cheap gradient panels with a smaller shared set of premium homepage primitives across the rest of the page.
- [x] Rebuild the hero and sprint-path sections around the new visual system while preserving CTA behavior and the `#system` anchor, then verify them with CTA/browser smoke checks.
- [x] Rebuild the by-Sunday and starter-system sections so they no longer read as stacked card grids.
- [x] Simplify durability, social proof, FAQ, pricing, and footer to match the new visual language without breaking content or proof surfaces.
- [x] Run homepage-focused validation and record any design tradeoffs or residual issues in this plan.

## Surprises & Discoveries

The main issue is not one bad component. The cheap feeling comes from repetition across the whole page. At the start of this work, `apps/web/features/marketing/components/home-page/whats-inside-section.tsx`, `starter-system-section.tsx`, `durability-section.tsx`, the old combined proof/FAQ surface that is now split into `social-proof-section.tsx` and `common-questions-section.tsx`, and `pricing-footer-sections.tsx` all leaned on a mix of section badges, rounded bordered panels, and repeated card containers. Any one of those in isolation would be acceptable, but together they flattened hierarchy and made the whole page feel assembled from the same few primitives.

The current render path already gives enough flexibility to do a serious redesign without breaking the homepage contract. `apps/web/config/product.ts`, `apps/web/features/marketing/lib/home-page-render-model.ts`, and `apps/web/features/marketing/components/home-page.tsx` cleanly separate control plane, content, and section rendering. The redesign can stay inside feature-local homepage components and should not require route-level or metadata-level restructuring.

The visual references provided by the user point toward a quieter, more expensive system language than the current homepage uses. The Figma references at nodes `818:2` and `798:48` both use thin linework, mostly flat surfaces, mono labels, restrained fills, one obvious active state, and very little decorative chrome. The important lesson is not to literally import that loop everywhere; it is to apply that same discipline across the homepage.

The design context saved in `.impeccable.md` is materially useful here. It confirms the target user is a knowledge worker using AI tools to move from idea to shipped v1 in one weekend, and that the interface should feel excited, confident, expensive, curious, bold, and serious. It also explicitly rejects childish or overly playful aesthetics and asks for something closer to Airbnb simplicity and early Uber minimalism. That means the redesign should bias toward fewer surfaces, stronger typography, and more structural restraint, not more “creative” decoration.

The supporting design skills add one important constraint: this cannot just be a prettier screenshot pass. `optimize` says the hero and sprint-path visuals need explicit performance attention because they sit above the fold. `harden` says the redesigned sections must be tested against longer text, tighter widths, and real interaction states. `normalize` says the redesign should remove homepage-local drift by leaning harder on existing tokens and behaviors instead of inventing more one-off styling. `polish` says the quality bar should be flagship, not MVP cleanup, with a final pass for alignment, focus states, touch targets, and copy consistency.

The grill pass resolved one more critical product truth: this homepage is selling to distracted users who are likely doomscrolling or tab-switching while they evaluate the offer. That means the redesign should bias even harder toward fewer visible decisions, fewer explanatory blocks, and less duplicated selling copy. If a section repeats what another section already proved, it should be cut, merged, or demoted rather than “redesigned better.”

The top-of-page implementation confirmed there was already stale contract surface in the homepage model. `apps/web/features/marketing/lib/home-page-render-model.ts` still exposed `hero.previewImage`, and `apps/web/features/marketing/content/home.ts` still carried hero preview and sprint-path image fields that were no longer consumed by the rendered page. Removing that dead surface made the hero rewrite simpler and reduced the risk of the design drifting between content and JSX again.

The middle-section rewrite exposed one more product truth: the bonus needed its own copy object in `apps/web/features/marketing/content/home.ts` instead of being implied through support-lane naming or later pricing inventory. Without that explicit content seam, the redesign would keep burying the bonus inside the rest of the offer.

The final manual QA pass surfaced one last scope miss: the FAQ trim had stopped at 8 questions, while the plan target was 5-7. That was easy to miss in code review because the layout still looked materially cleaner than before, but the count itself was part of the plan. The fix was to cut the redundant access-duration question and rerun the homepage unit checks before browser smoke.

A fresh manual QA pass later in the morning surfaced one dev-only false alarm: opening `http://127.0.0.1:3000/?marketing=1` against a `localhost` Next dev server produced a hot-reload WebSocket console error that looked like a frontend regression at first glance. Re-running the same pass on `http://localhost:3000/?marketing=1` removed that error entirely. The homepage itself was fine; the mismatch was only between the dev-server host and the browser URL.

## Decision Log

Decision: This work is a new focused visual-language plan, not an amendment to the earlier homepage message rewrite plan.
Rationale: The earlier plan solved section order, message hierarchy, CTA behavior, and metadata alignment. This work is about a second layer of quality: removing templated UI patterns and rebuilding section presentation. Keeping that in a separate ExecPlan makes implementation and validation clearer.
Date: 2026-03-26

Decision: The redesign will preserve the existing homepage section order and content contract.
Rationale: The complaint is about how the sections look, not what the sections are or how the funnel is sequenced. Keeping section order stable lets the design pass stay scoped to presentational and compositional changes.
Date: 2026-03-26

Decision: Repeated section badges should be removed or heavily reduced.
Rationale: Badge overuse is one of the clearest “cheap” signals on the current page. Labels should be carried by overlines, inline microcopy, or typography-driven structure instead of the same badge primitive on nearly every section.
Date: 2026-03-26

Decision: Nested cards and repeated boxed layouts should be replaced with fewer, stronger structural surfaces.
Rationale: The current page often uses a card to hold a set of smaller cards or framed boxes. That repetition weakens hierarchy. The redesign should use spacing, dividers, type, and occasional hero surfaces rather than container-on-container composition.
Date: 2026-03-26

Decision: Gradients should be treated as suspect and removed by default unless they create real compositional value.
Rationale: Several current fills rely on lightweight gradients or tinted panels that make the UI feel mass-produced. The new system should prefer flat or near-flat fills with subtle temperature shifts and clean linework.
Date: 2026-03-26

Decision: The Figma loop references are style references, not literal page templates.
Rationale: The value of the Figma references is the restraint: mono labels, thin strokes, one active state, and confidence through simplicity. The homepage should adopt that discipline while still feeling like Ship by Sunday, not a direct copy of the loop artifact.
Date: 2026-03-26

Decision: Treat this redesign as a flagship-quality pass, not an MVP cleanup.
Rationale: The supporting `polish` guidance makes sense here. The user is reacting to compounded quality issues, so the plan should explicitly reserve time for spacing, alignment, state coverage, and consistency rather than treating them as optional finishing touches.
Date: 2026-03-26

Decision: Protect top-of-page performance while redesigning the hero and system surfaces.
Rationale: The `optimize` skill applies directly to the hero preview and sprint-path visual. Those surfaces are above the fold and can easily become the slowest or heaviest part of the page if the redesign adds too much DOM, paint, or motion cost.
Date: 2026-03-26

Decision: Build every redesigned section against long text, mobile compression, and real interaction states.
Rationale: The `harden` guidance matters because this page contains large headlines, mono labels, FAQ accordions, CTA rows, proof stats, and pricing lists. A section that only looks good with ideal copy is not done.
Date: 2026-03-26

Decision: Normalize around the existing token and behavior system instead of creating more homepage-local one-offs.
Rationale: The `normalize` guidance is useful because the current problem is design drift. The redesign should use existing typography, theme tokens, and CTA or motion rules more intentionally, not create a new mini design system inside each section.
Date: 2026-03-26

Decision: The hero may remove both its preview and its outcome list entirely if that makes the first screen sell harder.
Rationale: The user explicitly chose a simpler, harder-selling top-of-page direction. Since sprint-path will own the strongest system visual, the hero should be allowed to become mostly headline, body, and CTA without being forced to carry a second explanation surface.
Date: 2026-03-26

Decision: The sprint-path visual should depict `Product Truth` feeding the pack system instead of another execution-milestone loop.
Rationale: Once the hero stopped carrying a preview, the strongest remaining system visual needed to reinforce the actual homepage promise: one product truth becoming design, marketing, build, and prompt handoff. That is more truthful to the page than another generic milestone loop and fits the “one obvious active state” guidance better.
Date: 2026-03-26

Decision: The earlier explicit bonus callout belongs in the starter-system section, not only in pricing.
Rationale: The user-approved plan said the bonus should read as free extra value before the close, not as buried bundle inventory. The starter-system section is the first place where the support layer is discussed directly, so it is the cleanest place to surface that extra value without interrupting the hero or the system story.
Date: 2026-03-26

Decision: `durability` is the secondary section allowed to be merged or demoted.
Rationale: The user accepted reducing one visible section, and `durability` is the most second-order idea on the page. Its best insight can survive as support inside proof or pricing without needing a full standalone section by default.
Date: 2026-03-26

Decision: Proof should compress around founder image plus GitHub graph, with only the strongest supporting stats retained.
Rationale: The user marked founder image and GitHub graph as sacred, allowed the headline stat set to shrink, and made the reach or globe surfaces optional. The redesign should therefore target a tighter proof composition instead of trying to restyle all current proof artifacts.
Date: 2026-03-26

Decision: FAQ should be cut to the strongest 5-7 questions.
Rationale: The user approved a tighter objection-handling block. This supports the broader “sell hard, reduce noise” direction and prevents the lower half of the page from turning into a knowledge base.
Date: 2026-03-26

Decision: Pricing should compress to price, CTA, and the minimum trust or support copy required to close.
Rationale: The user explicitly approved a harder, quieter pricing close. The pricing section should stop carrying explanatory inventory that better belongs earlier in the page.
Date: 2026-03-26

Decision: The bonus must read as obvious free extra value, not as part of the core bundle.
Rationale: The user explicitly called out the psychology: if the bonus sits inside normal offer inventory, buyers price it as bundle content instead of “insane extra value for free.” The redesign must therefore call it out separately both earlier in the page and again near pricing.
Date: 2026-03-26

## Outcomes & Retrospective

The homepage now reads as one quieter system instead of a stack of section-specific card treatments. The hero is down to headline, body, CTA, and one operational note. Sprint-path owns the main system visual with a single active `Product Truth` state feeding the packs. The by-Sunday and starter-system sections now use row structure, typography, and dividers instead of tinted panel stacks. Durability is demoted into a simpler support section. Proof compresses around the founder image, two strong stats, and the GitHub graph. FAQ is cut to 7 questions. Pricing treats the bonus as separate free extra value rather than ordinary bundle inventory.

The main tradeoff is that the page is intentionally less “explained” than before. That is the right trade. The strongest remaining follow-up would be a smaller motion-and-density pass on the proof graph and maybe the footer wordmark at very narrow widths, but the central problem called out by the user is now resolved: the page no longer feels badge-heavy, gradient-heavy, or nested-card-heavy.

A second full validation run on the same day confirmed the redesign is landed rather than partially staged. The current working tree passed homepage lint, format, unit, integration-ui, browser-smoke, and production build checks without requiring homepage repairs, and fresh desktop plus 320px screenshots still show the intended quieter, premium system language.

## Context and Orientation

The homepage lives in `apps/web/features/marketing/components/home-page.tsx` and is assembled from feature-local sections. The current top-level sections are `HomeHeroSection`, `SprintPathUnifiedSection`, `WhatsInsideSection`, `StarterSystemSectionBlock`, `DurabilitySectionBlock`, `SocialProofSection`, `CommonQuestionsSection`, `PricingSectionBlock`, and `FooterSection`. The page order comes from `apps/web/config/product.ts` and the section enablement or CTA behavior comes through `apps/web/features/marketing/lib/home-page-render-model.ts`. That means the redesign should focus on the feature-local section components first and avoid widening scope into routing or data flow.

The files that now define the new visual language are `apps/web/features/marketing/components/home-page/home-page-primitives.tsx`, `hero-sections.tsx`, `system-loop-preview.tsx`, `whats-inside-section.tsx`, `starter-system-section.tsx`, `durability-section.tsx`, `social-proof-section.tsx`, `common-questions-section.tsx`, and `pricing-footer-sections.tsx`. `home-page-primitives.tsx` owns the shared overline, quiet-surface, and low-chrome secondary-link treatments that replaced badge-first and card-first styling. `system-loop-preview.tsx` is the main system visual and should remain the only obvious active-state surface. `social-proof-section.tsx` and `common-questions-section.tsx` replaced the older combined proof/FAQ file, which keeps the lower-half responsibilities split cleanly instead of drifting back into an oversized mixed-responsibility section.

The design system primitives relevant to this plan are in `apps/web/components/ui/`. `Badge` is the primitive most likely to be reduced or retired from the homepage. `Card` is the primitive most likely to be used more selectively. `PointerHighlight` is a strong existing signature that should be preserved where it adds meaning, because the design context explicitly says to keep distinctive interaction signatures instead of flattening them away. Typography and theme tokens are defined in `apps/web/app/globals.css`, where the page already uses a strong display font, restrained neutral palette, and light or dark mode support. The product wordmark styling lives in `apps/web/components/product-brand.tsx`.

The redesign also depends on a few shared interaction surfaces that must stay intact while the visual language changes. `apps/web/features/marketing/components/home-page/home-page-primary-cta.tsx` owns the primary CTA behavior for hero and pricing. `apps/web/features/marketing/components/faq-accordion.tsx` owns disclosure behavior in the FAQ. `apps/web/features/marketing/components/home-page/github-activity-graph.tsx` owns one of the most visually dense proof surfaces on the page. These are the places where the `harden`, `normalize`, and `polish` guidance overlap most clearly: do not make them prettier but more brittle.

The design context for this work is already established in `.impeccable.md`. The user is a knowledge worker using AI coding and design tools. The job to be done is to move from idea to v1 shipped in one weekend. The interface should feel excited, confident, and expensive, with a brand personality of curious, bold, and serious. The aesthetic target is closer to Airbnb simplicity and early Uber minimalism than to playful or mascot-driven UI. That context should guide every removal decision in this plan.

The Figma references the user provided are important enough to restate plainly here so the plan remains self-contained. The key characteristics visible in nodes `818:2` and `798:48` are: almost no gradients, almost no ornamental shadows, thin neutral linework, mono labels, mostly flat off-white backgrounds, one highlighted active node, and a restrained sense of system. The redesign should generalize those qualities across the homepage rather than merely re-render the loop.

## Plan of Work

Start by defining the new homepage visual primitives before changing individual sections. This is the most important scope guard in the plan. If the implementation starts by editing sections one at a time without agreeing on the new primitives, the work will drift into a mixture of old and new patterns. The primitives that need to be standardized first are: section labels without `Badge`, a more premium low-chrome secondary CTA, a flatter but intentional surface treatment, a reduced linework palette for diagrams or system previews, a cleaner proof layout language, and a clear rule for when a section gets a full background surface versus when it should rely on whitespace and type only.

Before the first section is rebuilt, audit where the homepage currently diverges from shared tokens and patterns. The redesign should remove homepage-local hard-coded color behavior and repeated container logic when the same result can be achieved with better typography, spacing, and use of the existing theme tokens. This is the main normalization requirement for the plan.

Once those primitives are stable, rebuild the top of the page first. The hero and sprint-path sections set the language for everything beneath them, so they must be redesigned together. The hero should keep the dramatic wordmark and headline but stop presenting its preview like a boxed widget, and it is allowed to drop the preview entirely if that creates a stronger and quieter first screen. The hero should also lose the current outcome list. The sprint-path section should stop feeling like a two-column explainer with a stock illustration on the right and instead feel like an integrated system story with quieter visual structure and stronger type hierarchy. Sprint-path now owns the strongest visual explanation of the system. While doing this work, measure and protect the top-of-page experience: do not trade cheap gradients for expensive DOM or paint cost.

After the top of the page is reset, rebuild the middle sections that currently feel most templated: the by-Sunday section and the starter-system section. These two sections currently rely heavily on repeated framed panels, panel-in-panel compositions, and section badges. They should be reauthored around fewer structural surfaces, more asymmetric composition, and stronger type rhythm. Preserve the content hierarchy but change how it is expressed. While doing so, explicitly test long-wrap behavior in highlight phrases, support-lane labels, and section headings rather than assuming the default copy is representative. The learning-path and bonus material should stay visible in the starter-system section, but the bonus must already read as bonus value rather than normal offer inventory.

Only then simplify the lower sections. Durability, proof, FAQ, pricing, and footer should be brought into alignment with the new language once the primitives are proven above the fold. These changes should remove remaining badge usage, reduce card repetition, and tighten the end-of-page flow so the close feels inevitable rather than boxed. `durability` may be merged into proof or pricing support instead of surviving as its own full section. Proof should compress around the founder image, GitHub graph, and only the strongest supporting stats. FAQ should reduce to the strongest 5-7 questions. Pricing should compress hard and include a dedicated bonus callout that makes the bonus feel like free extra value rather than bundle content.

Throughout the work, validate incrementally with the homepage-focused checks already used in the repo. If a section redesign breaks copy tests, browser smoke, or layout assumptions, stop and repair within the same milestone. Keep the plan updated with real discoveries, especially if a section turns out to need more structural change than expected. Reserve a final flagship-quality polish pass for micro-alignment, focus states, touch targets, reduced-motion behavior, and copy consistency once the layouts are functionally complete.

## Milestones

### Milestone 1: Define the new homepage primitives and the anti-pattern removal rules

At the end of this milestone, the implementer has a clear, reusable visual rule set for the redesign and does not need to make section-level styling decisions ad hoc. Success looks like a small set of section-local design rules that replace the current overuse of badges, cards, gradients, and stacked panels. The files most likely touched in this milestone are `apps/web/features/marketing/components/home-page/hero-sections.tsx`, `apps/web/features/marketing/components/home-page/system-loop-preview.tsx`, and possibly a new small feature-local helper if a shared section label or line primitive is warranted.

This milestone should also explicitly document which homepage patterns are being removed. The removal list should include badge-as-default-section-label, repeated `Card` grids, nested bordered containers, decorative gradients, and explanatory diagram posters. It should also define the normalization rules: where hard-coded colors are still acceptable, where existing tokens must be used, how section overlines should replace badges, and which sections are allowed to use a full background surface. The milestone is complete when the implementer can articulate the replacement language in code and in the plan, and when the redesigned hero or system prototype shows those rules working.

Validate this milestone by running the smallest formatting or lint checks on the affected files and manually inspecting the top section in a local browser if a prototype path exists.

### Milestone 2: Rebuild the hero and sprint-path sections around the new language

At the end of this milestone, the first screenful of the homepage feels expensive and intentional instead of component-library-driven. Success looks like a hero that still leads with the promise and CTA while becoming materially quieter, and a sprint-path section that adopts the quieter Figma-inspired system language without feeling like a diagram asset dropped beside text.

This milestone should touch `apps/web/features/marketing/components/home-page/hero-sections.tsx`, `apps/web/features/marketing/components/home-page/home-hero-headline.tsx` if needed, `apps/web/features/marketing/components/home-page/sprint-path-unified-section.tsx`, and `apps/web/features/marketing/components/home-page/system-loop-preview.tsx`. It will likely touch `apps/web/features/marketing/content/home.ts` because the hero is now allowed to lose the outcome list and because sprint-path owns the stronger visual sell.

Validate this milestone with homepage-focused lint and format checks, plus the targeted browser-smoke test for `landing page renders the main offer CTA` so the redesigned top of page still loads and preserves CTA behavior. Add a quick manual check that the hero preview and loop surface do not introduce obvious layout shift, animation jank, or larger-than-necessary DOM complexity.

### Milestone 3: Rebuild the by-Sunday and starter-system sections without card-grid thinking

At the end of this milestone, the middle of the page no longer feels like a series of repeated cards. Success looks like a by-Sunday section and starter-system section that preserve the existing information hierarchy but communicate it with fewer containers, less repeated panel styling, and more deliberate typography and spacing.

This milestone should touch `apps/web/features/marketing/components/home-page/whats-inside-section.tsx`, `apps/web/features/marketing/components/home-page/starter-system-section.tsx`, and likely `apps/web/features/marketing/content/home.ts`. The implementer should remove section badges or turn them into quieter overlines, remove repeated gradient panels, and replace badge-like support-lane chips with more structural treatments.

Validate this milestone with `tests/unit/home-page-content.test.ts` plus lint and format checks for the changed files. If visual changes require content trims, update the content tests in the same slice. Add manual checks for long-wrap behavior in highlight phrases, support-lane labels, and any newly asymmetrical section headings.

### Milestone 4: Simplify durability, proof, FAQ, pricing, and footer to match the new system

At the end of this milestone, the lower half of the page no longer reintroduces the same cheap patterns that were removed above the fold. Success looks like durability either demoted or merged, proof simplified around the strongest credibility signals, FAQ reduced to a tighter objection set, pricing compressed to a harder close, and the footer aligned to the same restrained system.

This milestone should touch `apps/web/features/marketing/components/home-page/durability-section.tsx`, `apps/web/features/marketing/components/home-page/social-proof-section.tsx`, `apps/web/features/marketing/components/home-page/common-questions-section.tsx`, `apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx`, and possibly `apps/web/features/marketing/components/home-page/pricing-includes-list.tsx`. The pricing section should still close hard, but it should do so without looking like a stock pricing card. The implementation should explicitly preserve the founder image and GitHub graph, reduce the supporting stats to the strongest 1-2, treat reach or globe content as optional combined proof, cut the FAQ to 5-7 questions, and make the bonus feel visibly separate from the base offer.

Validate this milestone with the unit homepage suite, the integration-ui CTA test, and the targeted browser-smoke checks for both the main CTA and structured SEO data. If section structure changes affect schema truthfulness or visible FAQ presence, verify `tests/unit/home-page-structured-data.test.ts` as part of the same slice. Add explicit checks for touch target sizes and focus visibility anywhere CTA styling or accordion styling changes.

### Milestone 5: Final polish, dark-mode consistency, and design QA

At the end of this milestone, the homepage should feel visually coherent from top to bottom in both light and dark mode. Success looks like a final manual QA pass that confirms there are no leftover cheap badges, no obvious nested-card patterns, no off-brand gradients, and no sections that feel like they belong to a different visual system.

This milestone should include a final pass through the changed homepage components and a real browser QA session on `/?marketing=1`. If proof surfaces or system previews still feel overexplained, trim them. If any section still looks like “AI made this,” simplify again. This milestone is complete only when the page feels like one intentional system rather than a set of individually “improved” sections.

Validate this milestone with the homepage browser-smoke checks and `bun run build`, then record the observed tradeoffs in this plan. The manual QA at this stage should explicitly cover spacing rhythm, optical alignment, focus states, touch targets, reduced-motion behavior, and any remaining visual drift between sections.

## Concrete Steps

Start by refreshing the current homepage sections and the design context before making any design decisions.

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,220p' .impeccable.md
    sed -n '1,240p' apps/web/content/docs/configure-the-homepage.mdx
    sed -n '1,220p' apps/web/features/marketing/components/home-page/hero-sections.tsx
    sed -n '1,220p' apps/web/features/marketing/components/home-page/system-loop-preview.tsx
    sed -n '1,260p' apps/web/features/marketing/components/home-page/whats-inside-section.tsx
    sed -n '1,220p' apps/web/features/marketing/components/home-page/starter-system-section.tsx
    sed -n '1,220p' apps/web/features/marketing/components/home-page/durability-section.tsx
    sed -n '1,260p' apps/web/features/marketing/components/home-page/social-proof-section.tsx
    sed -n '1,240p' apps/web/features/marketing/components/home-page/common-questions-section.tsx
    sed -n '1,260p' apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx

Write down the explicit anti-patterns to remove before editing code:

    repeated Badge headers
    panel inside panel
    repeated Card grids
    cheap gradient fills
    explainer-diagram posters
    identical rounded-box rhythm across sections

Write down the normalization and hardening rules before editing code:

    use existing tokens before inventing new colors
    prefer overlines or inline labels over Badge by default
    every CTA and accordion state keeps visible focus
    test long text and narrow widths in each redesigned section
    avoid layout-property animations; prefer transform or opacity only
    treat hero and sprint-path visuals as performance-sensitive surfaces
    hero should not carry lower-section detail just because space exists
    bonus value should never read like ordinary bundle inventory

Then establish replacement primitives in the homepage feature folder. Prefer feature-local utilities or small component helpers over global abstractions.

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    sed -n '1,260p' features/marketing/components/home-page/hero-sections.tsx
    sed -n '1,260p' features/marketing/components/home-page/system-loop-preview.tsx
    sed -n '1,220p' components/ui/badge.tsx
    sed -n '1,260p' app/globals.css

After the primitives are settled, rebuild the top of page first, then the middle sections, then the lower sections. Keep each milestone scoped tightly enough that the relevant checks can be run immediately:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx oxlint --deny-warnings features/marketing/components/home-page.tsx features/marketing/components/home-page/hero-sections.tsx features/marketing/components/home-page/sprint-path-unified-section.tsx features/marketing/components/home-page/system-loop-preview.tsx
    bunx oxfmt --check features/marketing/components/home-page.tsx features/marketing/components/home-page/hero-sections.tsx features/marketing/components/home-page/sprint-path-unified-section.tsx features/marketing/components/home-page/system-loop-preview.tsx

When the middle sections are changed, include the content test and render-model test:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts

When the lower sections are changed, run the broader homepage checks:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/home-page-primary-cta.test.tsx

For browser proof, use the repo’s working smoke command rather than `bunx playwright test` directly:

    cd /Users/parkerrex/Projects/ship-by-sunday
    set -a
    source apps/web/.env.local
    set +a
    bun run --cwd apps/web test:browser-smoke -- --grep "landing page renders the main offer CTA|homepage renders structured SEO data"

Finish with a full production build:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run build

Expected transcript when the final homepage checks pass:

    Test Files  ... passed
    Tests       ... passed
    2 passed (...s)   # from browser-smoke grep run
    ✓ Compiled successfully

During manual QA, explicitly inspect:

    320px mobile width
    200% browser zoom
    long section headings or CTA labels
    keyboard tab and focus ring behavior
    reduced-motion behavior for any new motion

## Validation and Acceptance

The redesign is accepted only when a human can open `/?marketing=1` and describe the page as intentional, premium, and clean rather than boxed, badge-heavy, or templated. This is not a subjective “looks nicer” bar. The page should visibly remove repeated badge headers, nested-card layouts, and low-signal gradients while preserving the core funnel.

The hero must still present one dominant CTA path plus the quieter discovery path to `#system`. The hero may become mostly headline, body, and CTA if that sells harder. The sprint-path visual must still communicate a system, but it should do so without looking like an explainer poster or a drop-in SVG widget. The by-Sunday and starter-system sections must still make their content clear, but they should no longer rely on repeated boxed cards as the default content pattern. The lower sections must still show proof, FAQ, and pricing, but they should not revert to component-library-default presentation. `durability` no longer needs to survive as a standalone default section if its best selling idea is absorbed elsewhere.

Acceptance must be proven with:

- homepage lint and format checks for the changed components
- the homepage unit tests
- the CTA integration-ui test
- the targeted browser-smoke checks for the landing page and structured data
- a final `bun run build`

The redesign is not done if the code passes but the page still reads as AI-generated UI. A final manual browser QA pass is required and should be recorded in `Artifacts and Notes`.

The redesign is also not done if it only works with ideal content. The final page must tolerate longer lines, awkward wraps, and mobile compression without the composition breaking. If a section only looks good in the default copy state, that section is not yet production-ready. Likewise, if hover, focus, active, loading, error, reduced-motion, or keyboard-only behavior feels like an afterthought, the page is not yet at the flagship bar this plan is targeting. The bonus is not done if it is still psychologically computed as bundle content rather than obvious free extra value.

## Idempotence and Recovery

This plan is safe to rerun because it is a presentational redesign of homepage components and local assets. It does not change data models, access control, Stripe integration, or Convex behavior. Re-running the plan should only revisit component structure, styling, and homepage-local assets.

If a redesign attempt goes too far, recover by reverting only the affected feature-local section component to the last passing milestone and keeping the new shared primitives if they are still sound. Do not recover by widening scope into route-level or config-level changes.

If the new visual system breaks a content test because a section no longer needs the same copy structure, update the content model and matching tests within the same slice rather than leaving the content schema half-changed.

If a section becomes too complex to keep below the repo’s 150-line component guidance, split it into smaller feature-local subcomponents in the same folder. Do not solve complexity by inlining more JSX into `home-page.tsx`.

If browser smoke fails after a visual change, stop and repair before moving on. Do not postpone visual regressions to the end. If the smoke command itself appears broken, use the known-good repo pattern of sourcing `apps/web/.env.local` and running `bun run --cwd apps/web test:browser-smoke`.

## Artifacts and Notes

The section-by-section visual complaints this plan must resolve are:

    Hero:
    - preview feels boxed-in and secondary CTA still reads like styled component chrome
    - current outcome list and support inventory add distraction at the very moment the page should sell hardest

    Sprint Path:
    - system surface still risks reading like a diagram asset rather than integrated product UI

    What’s Inside:
    - ordered list wrapped in a large bordered shell still feels like repeated panels

    Starter System:
    - repeated badges, gradient fills, and support-lane chips make the section feel cheapest

    Durability:
    - top quote box plus three cards repeats the same container logic again

    Social Proof:
    - proof image, stat cards, GitHub card, and reach cards create too many boxed surfaces

    FAQ and Pricing:
    - badge headers and card-based pricing still feel like generic component-kit defaults
    - bonus value is currently too easy to mentally file as normal bundle inventory

The core visual target, restated from the user-approved design context and Figma references, is:

    simpler than the current page
    more expensive than the current page
    fewer boxes
    fewer badges
    almost no cheap gradients
    stronger typography
    thin linework
    one obvious active state when a system visual needs it
    both light and dark mode must still feel first-class

The extra guidance extracted from the supporting skills and adopted into this plan is:

    flagship polish bar, not MVP cleanup
    measure and protect top-of-page performance
    remove DOM and paint cost alongside visual clutter
    harden every redesigned section against long text and edge cases
    normalize against existing tokens and behavior instead of creating new one-off homepage styles

Observed proof from the first execution slice:

    Found 0 warnings and 0 errors.
    Test Files  2 passed (2)
    Tests       4 passed (4)

Observed proof from the middle-section slice:

    Found 0 warnings and 0 errors.
    Test Files  2 passed (2)
    Tests       4 passed (4)

Observed proof from the final validation pass:

    Test Files  3 passed (3)
    Tests       7 passed (7)
    Test Files  1 passed (1)
    Tests       2 passed (2)
    2 passed (41.2s)
    ✓ Compiled successfully in 23.4s

Fresh revalidation on the current working tree:

    Found 0 warnings and 0 errors.
    All matched files use the correct format.
    Test Files  3 passed (3)
    Tests       7 passed (7)
    Test Files  1 passed (1)
    Tests       2 passed (2)
    2 passed (37.8s)
    ✓ Compiled successfully in 28.7s

Manual QA artifacts captured during the final pass:

    output/playwright/homepage-desktop-2026-03-26.png
    output/playwright/homepage-mobile-320-2026-03-26.png

Manual QA notes:

    Desktop at 1440px: page reads as one continuous premium system; hero, proof, and pricing no longer revert to generic card-kit presentation.
    Mobile at 320px: headline, CTA stack, proof image, pricing close, and footer remain readable; FAQ count fix reduced lower-half length and density.
    Keyboard tab order reached the hero primary CTA cleanly during local Playwright QA, so the redesigned above-the-fold shell did not introduce a focus-order regression.
    Theme-toggle QA flipped from “Switch to dark mode” to “Switch to light mode” without introducing console errors beyond the expected Clerk development-instance warning, which confirms the dark-mode control still responds after the redesign.
    Console warning seen during local Playwright QA was the expected Clerk development-instance warning, not a homepage regression.
    A temporary WebSocket console error only appeared when the page was opened at `127.0.0.1` against a `localhost` dev server; the error disappeared when the host matched, confirming the issue was a dev-server host mismatch rather than a homepage bug.

The final flagship polish checklist should include:

    no default-looking badges left by habit
    no leftover one-off gradients that exist only as decoration
    no section that relies on fixed-width pills or short English labels
    no card grid that exists only because `Card` was available
    no awkward headline or CTA wrapping at common desktop and mobile widths
    no focus state that disappears into the redesign
    no above-the-fold visual that materially slows or clutters the first screen
    bonus callout reads as free extra value at a glance

## Interfaces and Dependencies

`apps/web/features/marketing/components/home-page.tsx` must remain the top-level homepage assembly point. The redesign should not move sections out of the feature-local homepage folder or reintroduce route-level homepage logic.

`apps/web/features/marketing/components/home-page/home-page-primitives.tsx` is now an explicit dependency because it holds the shared overline, quiet-surface, and low-chrome secondary-link primitives that replaced badge-first and card-first section styling. Future homepage changes should reuse that file before inventing more one-off section chrome.

`apps/web/features/marketing/content/home.ts` remains the single source of homepage copy. If section structures change enough to require different content fields, update that file and the tests together rather than hardcoding copy into JSX.

`apps/web/config/product.ts` and `apps/web/features/marketing/lib/home-page-render-model.ts` must continue to own section order, CTA wiring, and toggle behavior. The redesign should not bypass or duplicate those contracts.

`apps/web/features/marketing/components/home-page/home-page-primary-cta.tsx` remains the only primary CTA renderer for hero and pricing. Even if the visual language of the CTA area changes, checkout behavior must continue to flow through this boundary.

`apps/web/components/ui/badge.tsx` and `apps/web/components/ui/card.tsx` are dependencies mainly because this redesign will likely reduce homepage reliance on them. They should not be edited globally unless the redesign truly requires a system-wide primitive change. Prefer removing homepage usage over changing the primitives for the entire app.

`apps/web/components/ui/pointer-highlight.tsx` is an explicit dependency because the design context says to preserve distinctive interaction signatures when they still serve meaning. The redesign should decide deliberately where that primitive stays instead of deleting it by default.

`apps/web/app/globals.css` and `apps/web/components/product-brand.tsx` are critical styling dependencies because typography, spacing, and token choices need to stay consistent with the broader app while the homepage becomes cleaner and more premium.

`apps/web/features/marketing/components/home-page/system-loop-preview.tsx` is an especially important dependency because both the performance and normalization guidance apply directly to it. If that component survives the redesign, it must remain lightweight, use restrained motion, and avoid reintroducing one-off styling that drifts away from the rest of the homepage.

`apps/web/features/marketing/components/home-page/home-page-primary-cta.tsx`, `apps/web/features/marketing/components/faq-accordion.tsx`, and `apps/web/features/marketing/components/home-page/github-activity-graph.tsx` are explicit hardening dependencies because CTA state coverage, disclosure behavior, and proof-surface resilience all need to survive the redesign unchanged or improved.

`apps/web/features/marketing/components/home-page/social-proof-section.tsx` and `apps/web/features/marketing/components/home-page/common-questions-section.tsx` replaced the old combined proof/FAQ file. Future changes to proof density or FAQ structure should stay split along those boundaries so the repo does not drift back into oversized mixed-responsibility files.
