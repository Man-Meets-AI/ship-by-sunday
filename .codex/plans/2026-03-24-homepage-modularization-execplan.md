# Generalize the homepage into a modular starter marketing shell

This is a living execution plan for the next public-surface slice of the starter. It is written so a fresh coding agent can execute the work without prior chat context and must be updated as decisions, discoveries, validation results, and scope adjustments accumulate.

This ExecPlan must be maintained in accordance with `PLANS.md` at the repository root.

## Purpose / Big Picture

The current homepage is technically starter-safe but still reads like a renamed `Ship by Sunday` sales page and is configured through one large product-specific content object. After this change, the default homepage should still sell the paid `Ship by Sunday` starter product, but it should do so through reusable section seams and explicit section controls instead of one monolithic page contract. A customer should land on `/` and feel that the starter is intentional and configurable, while Parker’s own default sales page still works as-is.

The user-visible outcome is a homepage whose top-level sections can be enabled or disabled cleanly, whose hero and pricing calls to action use an explicit target model, whose social-proof section remains strong by default, and whose structured data still matches what is visibly rendered. The default configuration must still behave like the current paid sales page: docs on, pricing on, checkout CTA on, and a proof-heavy public shell that still converts.

## Progress

- [x] 2026-03-24 09:16 EDT — Planning inputs confirmed from user: default homepage sells the paid starter product; baseline proof stays on; pricing stays on; docs stay on; scope includes homepage modularization plus SEO, structured-data, and CTA continuity.
- [x] 2026-03-24 09:24 EDT — Grill review completed. Locked section control into `starterConfig`, fixed section order, required CTA target abstraction, and required section-aware data fetching.
- [x] 2026-03-24 09:28 EDT — Wrote the finalized ExecPlan to `.codex/plans/2026-03-24-homepage-modularization-execplan.md`.
- [x] 2026-03-24 10:20 EDT — Inspected the live homepage assembly and verified the current public contract: fixed section order in `features/marketing/components/home-page.tsx`, unconditional `fetchGitHubContributions()`, checkout-bound hero and pricing CTAs, stable `system` and `pricing` anchors, and schema assertions in `tests/unit/home-page-structured-data.test.ts` plus `tests/browser-smoke/app-smoke.spec.ts`.
- [x] 2026-03-24 10:20 EDT — Extended `starterConfig` in `config/product.ts` with explicit `homePage` section defaults plus `heroPrimaryCta` and `pricingPrimaryCta` target config for the public shell.
- [x] 2026-03-24 10:20 EDT — Added `features/marketing/lib/home-page-render-model.ts`, switched `features/marketing/components/home-page.tsx` to assemble from that derived model, and added focused unit coverage in `tests/unit/home-page-render-model.test.ts` for default and non-default section/CTA derivation.
- [x] 2026-03-24 10:24 EDT — Renamed the public homepage proof contract to `socialProof` across content, render-model, and section exports while preserving the founder-specific default subtype. The section file now lives at `features/marketing/components/home-page/social-proof-faq-sections.tsx`.
- [x] 2026-03-24 10:24 EDT — Made the GitHub activity fetch conditional on the derived section model by adding `socialProof.githubActivityUsername` to `features/marketing/lib/home-page-render-model.ts` and only calling `fetchGitHubContributions()` when that value is present.
- [x] 2026-03-24 10:24 EDT — Performed a small copy cleanup in `features/marketing/content/home.ts` by making the hero body explicitly reference `productName`, which restores the intended curriculum-contract alignment for homepage marketing copy.
- [x] 2026-03-24 10:28 EDT — Added `features/marketing/components/home-page/home-page-primary-cta.tsx`, wired hero and pricing to the explicit CTA target model, and gated all top-level sections in `features/marketing/components/home-page.tsx` using the fixed canonical order from the render model.
- [x] 2026-03-24 10:31 EDT — Updated `features/marketing/lib/home-page-structured-data.ts` and `tests/unit/home-page-structured-data.test.ts` so `FAQPage` follows FAQ visibility and `Product` only appears when the visible pricing section still presents a checkout offer.
- [x] 2026-03-24 10:31 EDT — Synced `README.md`, `content/docs/customize-the-starter.mdx`, and `content/docs/how-the-starter-works.mdx` with the new `starterConfig.homePage` control plane and the homepage render-model seam.
- [x] 2026-03-24 10:39 EDT — Broader verification is complete for this slice: `bun run build` now passes, and `bun run test:browser-smoke` passes when `.env.local` is sourced into the command environment before execution.

## Surprises & Discoveries

The homepage is already section-based in rendering, but not in configuration. `features/marketing/components/home-page.tsx` renders multiple top-level sections, while `features/marketing/content/home.ts` still models the whole page as a single product-specific object. That means the main work is not inventing sections; it is making the section control plane explicit and reusable.

The hero CTA is not just label-coupled to checkout. It is structurally hardwired to `CheckoutButton` in `features/marketing/components/home-page/hero-sections.tsx`. If this slice claims section modularity without introducing a CTA target abstraction, the homepage will still hide one of its most important product assumptions.

The homepage entry currently calls `fetchGitHubContributions()` unconditionally in `features/marketing/components/home-page.tsx` before rendering any sections. That means a future `socialProof = off` path would still fetch social-proof data unless this slice explicitly makes the fetch conditional.

The page already has stable anchor semantics: `id="system"` is emitted by `features/marketing/components/home-page/sprint-path-unified-section.tsx`, and `id="pricing"` is emitted by `features/marketing/components/home-page/pricing-footer-sections.tsx`. `tests/browser-smoke/app-smoke.spec.ts` asserts those anchors today, so section-order and section-presence changes cannot treat them as incidental.

The smallest safe Milestone 1 slice did not require mutating `features/marketing/content/home.ts`. Adding `starterConfig.homePage` plus `features/marketing/lib/home-page-render-model.ts` was enough to make section defaults and CTA targets explicit while preserving the current public output. Evidence: `bun run test:unit tests/unit/home-page-structured-data.test.ts tests/unit/home-page-render-model.test.ts` passed after `features/marketing/components/home-page.tsx` switched to the render model.

A broader contract run during Milestone 2 exposed one unrelated repo issue: `tests/contracts/curriculum-contract.test.ts` still fails on `legacyLessonRedirects` pointing at a lesson slug that `getLessonById()` no longer resolves. Evidence after the homepage copy fix: the only remaining failing assertion is `tests/contracts/curriculum-contract.test.ts:38`, which checks the legacy redirect map rather than homepage behavior.

Section gating did not require a page-layout engine. Because `features/marketing/lib/home-page-render-model.ts` already centralizes fixed order and enable flags, `features/marketing/components/home-page.tsx` could stay simple with ordered conditional renders and still preserve the public anchor contract in the default configuration.

Broader verification is currently constrained by repo state outside the homepage work. `bun run build` now fails on a pre-existing type mismatch between `NormalizedIncidentEvent.surface` and `RecordIncidentArgs.surface` in `convex/http.ts:112`, specifically around the `"config_drift"` variant. Separately, browser smoke is blocked in this shell because `NEXT_PUBLIC_CONVEX_URL` is empty, which matches the known requirement documented in this plan.

Browser smoke depends on shell-level environment loading rather than reading `.env.local` automatically. Even though `next build` reads `.env.local`, `bun run test:browser-smoke` failed until the command was run as `set -a; source .env.local; set +a; bun run test:browser-smoke`.

## Decision Log

2026-03-24 — Decision: the homepage will continue selling the paid `Ship by Sunday` starter product by default. Rationale: this preserves Parker’s current commercial path while still improving the starter’s reuse seams.

2026-03-24 — Decision: the conceptual proof section becomes `socialProof`, but founder-specific proof remains the default content subtype for the baseline `Ship by Sunday` homepage. Rationale: this removes product-specific naming from the section contract without weakening the default proof surface.

2026-03-24 — Decision: pricing stays enabled by default and remains part of the baseline homepage shell. Rationale: this slice is about modularizing the public shell, not changing the monetization path.

2026-03-24 — Decision: docs stay enabled by default. Rationale: public docs are already a first-class starter capability and should remain visible in the baseline shell.

2026-03-24 — Decision: homepage section control will live in `starterConfig` inside `config/product.ts`, with a local marketing helper deriving the final render model. Rationale: the starter already has one obvious control plane, and section defaults should be discoverable there rather than hidden in local implementation details.

2026-03-24 — Decision: this slice includes moderate copy cleanup for the default homepage, not just structural modularization and not a full rewrite. Rationale: structure-only work would still leave the page feeling too specific, while a full rewrite would widen scope too far.

2026-03-24 — Decision: hero and pricing CTA behavior must use an explicit CTA target model in this slice, even though the default path still points to checkout. Rationale: a modular homepage without a CTA abstraction would still be hardwired to one product path in its most important surface.

2026-03-24 — Decision: top-level homepage section order stays fixed in this slice. Rationale: the immediate customer value is reusable sections with safe defaults, not a full page-layout engine; the repo already has anchor expectations around `system` and `pricing`.

2026-03-24 — Decision: disabled sections must not fetch their section-specific data. Rationale: section modularization must be behaviorally real, not just visually hidden.

2026-03-24 — Decision: keep `features/marketing/content/home.ts` stable during Milestone 1 and layer the explicit homepage control plane through `features/marketing/lib/home-page-render-model.ts`. Rationale: this creates visible section and CTA seams with minimal churn, keeps the current public output stable, and preserves a clean handoff into the later `proofSection` to `socialProof` rename.

2026-03-24 — Decision: represent the default proof surface as a `socialProof` section with a founder-specific `kind: "founder"` subtype in the render model instead of creating a broader variant system immediately. Rationale: this keeps the public boundary reusable now without widening Milestone 2 into a larger proof-content redesign.

2026-03-24 — Decision: route both hero and pricing CTAs through a shared `HomePagePrimaryCta` component rather than branching separately inside each section. Rationale: the target semantics now live in one place, the default checkout path remains unchanged, and later CTA target additions only need one rendering boundary.

2026-03-24 — Decision: emit `Product` schema only when the visible pricing section is enabled and its CTA target still uses checkout. Rationale: the homepage should default to truthful omission when pricing or purchase intent is no longer visible, even if other product metadata still exists in config.

2026-03-24 — Decision: treat the homepage slice as complete once targeted lint, format, unit, integration-ui CTA, build, and browser-smoke checks pass, while leaving the unrelated legacy redirect contract failure outside scope. Rationale: the redirect failure lives in curriculum routing rather than homepage modularization, and the homepage contract itself is now covered by direct tests plus browser smoke.

## Outcomes & Retrospective

At plan creation time, the intended result is a homepage whose configuration is explicit, whose default rendering still looks like Parker’s polished paid starter sales page, and whose non-default section behavior is honest and testable. The final retrospective should compare the result against the current page along three dimensions: how easy it is to customize, how truthful the structured data remains, and whether the default homepage still sells the starter effectively.

The main failure mode to watch for is building a “modular” page that still has hidden hardwired assumptions about checkout, data fetching, or JSON-LD. Another failure mode is over-widening into a full copy rewrite or route-level public-surface redesign. If the final implementation stays within this plan, it should improve starter reuse without weakening the current public funnel.

2026-03-24 — Milestone 1 now has an explicit homepage control plane in `config/product.ts` and a derived render model in `features/marketing/lib/home-page-render-model.ts`. The homepage assembly no longer pulls directly from the monolithic content object, but structured data and content naming still do, so later milestones still need to rename `proofSection`, make fetches conditional, and teach schema generation about section visibility.

2026-03-24 — Milestone 2 now models the section as `socialProof`, keeps the founder-heavy proof surface as the default subtype, and skips the GitHub fetch when the section model does not request it. The remaining work is now concentrated in visible section gating, CTA rendering, and schema/test truthfulness.

2026-03-24 — Milestone 3 now gates every top-level homepage section through the derived render model and renders hero/pricing CTAs through the explicit target contract. The default public funnel still uses checkout, but a non-default `kind: "link"` path is now covered by an integration-ui test so the abstraction is behaviorally real.

2026-03-24 — Milestone 4 is functionally complete for the homepage slice: structured data now follows visible homepage sections, unit coverage includes non-default FAQ and pricing schema behavior, and the canonical docs explain the new control plane. Remaining verification gaps are explicit external blockers: the unrelated observability type error in `convex/http.ts` prevents a clean build, and the missing `NEXT_PUBLIC_CONVEX_URL` prevents browser smoke in this shell.

2026-03-24 — The homepage modularization slice is now complete. The starter has an explicit homepage control plane, a centralized render model, section-aware data fetch behavior, CTA target abstraction, truthful schema generation, docs coverage, a clean production build, and passing browser smoke. The only known residual issue encountered during broader exploration is the unrelated legacy redirect contract failure in `tests/contracts/curriculum-contract.test.ts`.

## Context and Orientation

The public route entry is `app/page.tsx`. That file injects homepage structured data by calling `getHomePageStructuredData()` from `features/marketing/lib/home-page-structured-data.ts` and then renders the default export from `features/marketing/components/home-page.tsx`.

The page assembly currently lives in `features/marketing/components/home-page.tsx`. That file fetches GitHub contribution activity with `fetchGitHubContributions()` from `features/marketing/lib/github.ts` and then renders the homepage sections in a fixed order: hero, sprint path, what’s inside, proof, FAQ, pricing, and footer. The order is currently implicit in the component tree, and the GitHub fetch is currently unconditional.

The monolithic homepage content contract lives in `features/marketing/content/home.ts`. That file already consumes starter-driven product labels from `config/product.ts` and `features/starter/lib/starter-selectors.ts`, but it still models the page as one large product-specific object with fields like `proofSection`, `faqSection`, and `pricingSection`. That is the main structural seam that this slice needs to improve.

The hero section lives in `features/marketing/components/home-page/hero-sections.tsx`. It renders `CheckoutButton` directly from `features/checkout/components/checkout-button.tsx`, so the hero CTA is currently structurally tied to checkout. The docs and sign-in links in the top bar live in `features/marketing/components/home-page/home-hero-top-bar.tsx`.

The social-proof and FAQ rendering currently live in `features/marketing/components/home-page/proof-faq-section.tsx`, which exports `FounderProofSection` and `CommonQuestionsSection`. The pricing and footer rendering live in `features/marketing/components/home-page/pricing-footer-sections.tsx`.

The homepage’s public structured-data contract is in `features/marketing/lib/home-page-structured-data.ts`. That file currently always emits `Organization`, `Product`, and `FAQPage` schema and depends directly on `homePageContent`. The current unit contract for that behavior is `tests/unit/home-page-structured-data.test.ts`.

The current browser smoke contract for the public surface is in `tests/browser-smoke/app-smoke.spec.ts`. It expects the landing page to render the main CTA, the `system` anchor, the `pricing` anchor, and JSON-LD containing `FAQPage` and `Product`. Because of that test, fixed section order and default section presence are not just visual concerns; they are part of the public contract.

In this plan, “section-level modularization” means each top-level homepage block has an explicit name, explicit default enabled or disabled behavior, explicit content contract, and explicit render decision. In this slice, the top-level sections are hero, sprint path, what’s inside, social proof, FAQ, pricing, and footer.

## Plan of Work

Start by making the control plane explicit in `config/product.ts`. Add a homepage-specific marketing config under `starterConfig` that names the top-level sections, indicates whether they are enabled by default, and defines the CTA target contract used by hero and pricing. Keep the default values aligned with the current `Ship by Sunday` public funnel: docs on, social proof on, pricing on, and CTA target set to checkout.

Once the starter config exists, create a local render-model helper under `features/marketing/lib/`. This helper should translate `starterConfig` plus the current homepage content into a concrete page model that the route-facing homepage component can render. The implementing agent should not add branching directly all over `features/marketing/components/home-page.tsx` if a single derived model can make section presence and CTA behavior obvious in one place.

After the render model exists, generalize the proof concept to `socialProof`. Do not remove the founder image, founder stats, GitHub activity, or reach stats from the default path. Instead, treat them as the default content subtype inside a more reusable section contract. In this same pass, do moderate copy cleanup in the most obviously product-specific sections so the page remains Parker’s default sales page but reads more like a reusable paid starter shell.

Once the content and render contracts are explicit, make data fetching section-aware. In `features/marketing/components/home-page.tsx`, stop fetching GitHub activity when the social-proof section is disabled or when the default content subtype no longer needs it. This step matters because otherwise the page would be visually modular but behaviorally monolithic.

After the section and fetch seams are real, wire the CTA target abstraction into the hero and pricing sections. The default path should still render checkout calls to action through `CheckoutButton`, but the section model must also be able to describe a non-checkout CTA target for future clones. This slice does not need to expose every possible target type; it only needs a clean, explicit target model that makes the default path and at least one non-default path coherent.

Only after the render, fetch, and CTA seams are done should the public schema and tests be updated. `features/marketing/lib/home-page-structured-data.ts` must reflect the visible sections honestly. If FAQ is disabled, omit `FAQPage`. If pricing is disabled, the Product offer behavior must be explicitly decided through the new section and CTA model rather than accidentally left behind. The default path must preserve the current smoke-test expectations, especially `id="system"`, `id="pricing"`, the default checkout CTA, and the current default schema blocks.

Finish by updating `README.md`, `content/docs/customize-the-starter.mdx`, `content/docs/how-the-starter-works.mdx`, and any related docs so contributors know where the new homepage seams live and how the default public shell is controlled.

## Milestones

### Milestone 1 — Make homepage configuration explicit in the starter contract

At the end of this milestone, the homepage should still render exactly as it does today by default, but the section defaults and CTA target semantics should exist explicitly under `starterConfig` in `config/product.ts`. A local render-model helper should also exist under `features/marketing/lib/` so the page renderer no longer relies on an implicit one-off composition contract. The most important files here are `config/product.ts`, `features/marketing/content/home.ts`, and the new helper under `features/marketing/lib/`.

Success for this milestone means a novice can open `config/product.ts` and see that the homepage has named top-level sections and CTA target configuration. They can also open the local marketing helper and understand how those defaults become a render model. The default homepage output should not change yet.

### Milestone 2 — Generalize proof to social proof, clean up default copy, and make fetches section-aware

At the end of this milestone, the section currently modeled as proof should be explicitly understood as `socialProof` in the content and rendering contract, while still rendering Parker’s founder-specific proof by default. The homepage copy in the most obviously product-specific sections should be moderately cleaned up so the baseline page still sells `Ship by Sunday` but feels more like a configurable starter shell. The GitHub activity fetch in `features/marketing/components/home-page.tsx` must become conditional on the section model rather than unconditional.

Success for this milestone means the default page still shows strong founder-driven proof, but the code no longer assumes that founder proof is the only possible proof model. It also means that disabling social proof skips the GitHub activity fetch path cleanly.

### Milestone 3 — Add section gating and CTA target wiring without changing the default funnel

At the end of this milestone, the homepage renderer should make explicit, section-level render decisions in a fixed canonical order: hero, sprint path, what’s inside, social proof, FAQ, pricing, footer. Hero and pricing should no longer be structurally hardwired to checkout alone. Instead, they should consume the new CTA target model, while the default `Ship by Sunday` path still uses checkout.

Success for this milestone means the default public shell still behaves exactly like a paid starter sales page, but at least one non-default path proves that a non-checkout CTA target can render safely. It also means section disabling does not leave broken layout or missing anchors in the default configuration.

### Milestone 4 — Preserve truthful structured data, anchors, and tests, then sync docs

At the end of this milestone, `features/marketing/lib/home-page-structured-data.ts` should generate schema that matches the visible page, and the existing public tests should still pass in the default configuration. `tests/unit/home-page-structured-data.test.ts` and `tests/browser-smoke/app-smoke.spec.ts` should be updated or extended to prove both default continuity and at least one non-default section-aware behavior. The docs should then be updated so the new control surfaces are discoverable.

Success for this milestone means the default page still has `id="system"` and `id="pricing"`, the default checkout CTA remains present, the default JSON-LD still contains `Organization`, `Product`, and `FAQPage`, and the docs explain where the new homepage seams live.

## Concrete Steps

Begin in `/Users/parkerrex/Projects/manmeetsai-workspace` by re-reading the exact homepage files, tests, and config surfaces before editing.

    cd /Users/parkerrex/Projects/manmeetsai-workspace
    sed -n '1,260p' config/product.ts
    sed -n '1,260p' features/marketing/content/home.ts
    sed -n '1,220p' features/marketing/components/home-page.tsx
    sed -n '1,260p' features/marketing/components/home-page/hero-sections.tsx
    sed -n '1,260p' features/marketing/components/home-page/proof-faq-section.tsx
    sed -n '1,260p' features/marketing/components/home-page/pricing-footer-sections.tsx
    sed -n '1,260p' features/marketing/lib/home-page-structured-data.ts
    sed -n '1,260p' tests/unit/home-page-structured-data.test.ts
    sed -n '1,260p' tests/browser-smoke/app-smoke.spec.ts

Expected observation: the page is already section-based in rendering but not in configuration, the hero is hardwired to checkout, the proof concept is founder-specific in naming, and the GitHub activity fetch happens before any section-aware decision is made.

Then extend `starterConfig` with a homepage section and CTA target contract. Keep the default path aligned with the current public shell. After that, add a local helper under `features/marketing/lib/` that translates starter config and homepage content into a render-ready model. That helper should make section presence, section order, social-proof content subtype, and CTA target semantics obvious to a novice.

Observed Milestone 1 implementation: `config/product.ts` now exports `homePageSectionOrder`, `HomePageCtaTarget`, `StarterHomePageConfig`, and `starterHomePageConfig`, then mounts that config at `starterConfig.homePage`. `features/marketing/lib/home-page-render-model.ts` derives a centralized render contract from `starterConfig.homePage` plus `homePageContent`, and `features/marketing/components/home-page.tsx` now consumes that render model for assembly while keeping the rendered output unchanged.

Once the control plane is in place, update `features/marketing/content/home.ts` and the relevant section components so `socialProof` becomes the conceptual section name. In the same pass, clean up the most obviously over-specific copy while preserving the fact that this is still Parker’s `Ship by Sunday` sales page by default.

After the content contract is explicit, move the GitHub fetch behind the section model in `features/marketing/components/home-page.tsx`. Then wire hero and pricing rendering through the CTA target model so the default path still uses `CheckoutButton` while a future non-default path can use a normal link or button target safely.

When the render path is stable, update `features/marketing/lib/home-page-structured-data.ts` and the tests so schema and smoke expectations match reality. Keep the default `system` and `pricing` anchors intact. Finally, update the public and repo docs that explain homepage customization.

## Validation and Acceptance

Validation starts with scoped static checks on touched files:

    cd /Users/parkerrex/Projects/manmeetsai-workspace
    bunx oxlint --deny-warnings <touched homepage/config/docs files and touched tests>
    bunx oxfmt --check <touched homepage/config/docs files and touched tests>

Then run focused homepage unit tests. At minimum, the plan requires the existing structured-data test and new tests that prove the homepage section model and CTA target model.

    bun run test:unit tests/unit/home-page-structured-data.test.ts <new homepage tests>

Success means the section model renders the default configuration correctly, the default schema still passes, and at least one non-default behavior is explicitly covered in unit tests.

Observed Milestone 1 validation on 2026-03-24:

    bunx oxlint --deny-warnings config/product.ts features/marketing/components/home-page.tsx features/marketing/lib/home-page-render-model.ts tests/unit/home-page-render-model.test.ts
    Found 0 warnings and 0 errors.

    bunx oxfmt --check config/product.ts features/marketing/components/home-page.tsx features/marketing/lib/home-page-render-model.ts tests/unit/home-page-render-model.test.ts
    All matched files use the correct format.

    bun run test:unit tests/unit/home-page-structured-data.test.ts tests/unit/home-page-render-model.test.ts
    Test Files 2 passed (2)
    Tests 3 passed (3)

Observed Milestone 2 validation on 2026-03-24:

    bunx oxlint --deny-warnings features/marketing/components/home-page.tsx features/marketing/components/home-page/social-proof-faq-sections.tsx features/marketing/content/home.ts features/marketing/lib/home-page-render-model.ts tests/unit/home-page-render-model.test.ts
    Found 0 warnings and 0 errors.

    bunx oxfmt --check features/marketing/components/home-page.tsx features/marketing/components/home-page/social-proof-faq-sections.tsx features/marketing/content/home.ts features/marketing/lib/home-page-render-model.ts tests/unit/home-page-render-model.test.ts
    All matched files use the correct format.

    bun run test:unit tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    Test Files 2 passed (2)
    Tests 3 passed (3)

    bun run test:contracts tests/contracts/curriculum-contract.test.ts
    Remaining failure after homepage copy fix: `tests/contracts/curriculum-contract.test.ts:38` in the legacy redirect assertion, unrelated to homepage modularization.

Observed Milestone 3 validation on 2026-03-24:

    bunx oxlint --deny-warnings features/marketing/components/home-page.tsx features/marketing/components/home-page/hero-sections.tsx features/marketing/components/home-page/pricing-footer-sections.tsx features/marketing/components/home-page/home-page-primary-cta.tsx tests/unit/home-page-render-model.test.ts tests/integration-ui/home-page-primary-cta.test.tsx
    Found 0 warnings and 0 errors.

    bunx oxfmt --check features/marketing/components/home-page.tsx features/marketing/components/home-page/hero-sections.tsx features/marketing/components/home-page/pricing-footer-sections.tsx features/marketing/components/home-page/home-page-primary-cta.tsx tests/unit/home-page-render-model.test.ts tests/integration-ui/home-page-primary-cta.test.tsx
    All matched files use the correct format.

    bun run test:unit tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    Test Files 2 passed (2)
    Tests 3 passed (3)

    bunx vitest run --project integration-ui tests/integration-ui/home-page-primary-cta.test.tsx
    Test Files 1 passed (1)
    Tests 2 passed (2)

Observed Milestone 4 validation on 2026-03-24:

    bunx oxlint --deny-warnings features/marketing/lib/home-page-structured-data.ts tests/unit/home-page-structured-data.test.ts
    Found 0 warnings and 0 errors.

    bunx oxfmt --check features/marketing/lib/home-page-structured-data.ts tests/unit/home-page-structured-data.test.ts
    All matched files use the correct format.

    bun run test:unit tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    Test Files 2 passed (2)
    Tests 5 passed (5)

    bun run build
    Passed.

    set -a; source .env.local; set +a; bun run test:browser-smoke
    5 passed (29.7s)

Then run:

    bun run build

Success means the public route, metadata pipeline, docs, and homepage all still compile end to end.

If the environment is wired for browser smoke, run:

    bun run test:browser-smoke

Success means the default public shell still contains the main CTA, still contains `id="system"` and `id="pricing"`, and still emits the expected default schema blocks. If browser smoke is blocked by missing `NEXT_PUBLIC_CONVEX_URL`, record the block and do not claim smoke validation passed.

Observable acceptance criteria are:

The default homepage still sells the paid `Ship by Sunday` starter and still routes the main CTA through checkout. The docs link remains visible by default. The top-level homepage sections are controlled by explicit starter config and a local render model. The section formerly known as proof is now modeled as social proof in the code. At least one non-default CTA target path works without checkout. Disabling social proof skips the GitHub fetch path. The default page still renders `id="system"` and `id="pricing"`. The default JSON-LD still contains `Organization`, `Product`, and `FAQPage`.

## Idempotence and Recovery

Implement this slice additively. Do not delete the existing page structure until the new config and render model can reproduce the current default output. If a proof-to-social-proof rename causes too much churn, add compatibility aliases temporarily rather than widening scope into a repo-wide rename.

If a non-default section-disabled or non-checkout CTA path is not stable yet, keep the new config and model seam but preserve the default path and defer the unstable variant to a tightly named follow-up. Do not merge a “modular” homepage that only works in the default path while pretending the non-default paths are complete.

If structured-data updates become ambiguous, default to truthful omission. It is better to emit fewer schema blocks than to emit schema that no longer matches the visible page.

If browser smoke is blocked by environment, record the exact block in the ExecPlan’s `Artifacts and Notes` section and leave build plus unit validation green. Do not invent environment workarounds inside this slice.

## Artifacts and Notes

When this plan is written to disk, the target path should be:

`.codex/plans/2026-03-24-homepage-modularization-execplan.md`

The most important implementation artifacts this slice should eventually capture are a short config diff showing the new homepage section defaults, a render-model snippet showing fixed section order plus CTA target semantics, one unit-test excerpt proving section-aware structured data or conditional fetch behavior, and a build transcript confirming the public shell still compiles.

Milestone 1 artifacts now exist:

    config/product.ts
    starterHomePageConfig = {
      sections: { hero: true, sprintPath: true, whatsInside: true, socialProof: true, faq: true, pricing: true, footer: true },
      heroPrimaryCta: { kind: "checkout" },
      pricingPrimaryCta: { kind: "checkout" },
    }

    features/marketing/lib/home-page-render-model.ts
    createHomePageRenderModel() returns fixed `sectionOrder`, explicit section enable flags, and explicit CTA target semantics while preserving the founder-proof default subtype.

    tests/unit/home-page-render-model.test.ts
    Verified the default checkout path and a non-default `kind: "link"` CTA path with `socialProof: false`.

    tests/contracts/curriculum-contract.test.ts
    After updating the hero body to include `productName`, the homepage-specific contract failure disappeared and the only remaining failure is the unrelated legacy redirect assertion.

    features/marketing/components/home-page/home-page-primary-cta.tsx
    One rendering boundary now handles both `{ kind: "checkout" }` and `{ kind: "link", href }` targets, which keeps hero and pricing aligned while preserving the default checkout path.

    features/marketing/lib/home-page-structured-data.ts
    Structured data now derives from the homepage render model instead of the raw monolithic content object, so `FAQPage` and `Product` are omitted when their visible sections no longer justify them.

    set -a; source .env.local; set +a; bun run test:browser-smoke
    Verified the default landing-page CTA, `system` and `pricing` anchors, default structured SEO data, crawl surface, and docs/auth metadata behavior end to end.

## Interfaces and Dependencies

`config/product.ts` must gain an explicit homepage configuration shape under `starterConfig`. That shape must include named top-level homepage sections, whether they are enabled by default, and CTA target semantics for hero and pricing. The default values must preserve the existing `Ship by Sunday` public funnel.

A new or updated helper under `features/marketing/lib/` must derive a concrete homepage render model from `starterConfig` plus `features/marketing/content/home.ts`. That helper is a required interface for this plan because it keeps section decisions centralized and novice-readable.

`features/marketing/content/home.ts` must evolve from one monolithic object into a section-aware content contract. It may still contain the default `Ship by Sunday` copy, but it must clearly distinguish hero, sprint path, what’s inside, social proof, FAQ, pricing, and footer in a reusable way.

`features/marketing/components/home-page.tsx` must stop fetching section-specific data unconditionally. In particular, `fetchGitHubContributions()` must be conditional on the section model and the default social-proof subtype.

`features/marketing/components/home-page/hero-sections.tsx` and `features/marketing/components/home-page/pricing-footer-sections.tsx` must consume an explicit CTA target model. The default path should still use `CheckoutButton`, but the interface must support at least one non-checkout target path safely.

`features/marketing/components/home-page/proof-faq-section.tsx` should stop using founder proof as the public conceptual boundary of the section. The file can retain founder-specific defaults internally, but the section contract must be modeled as social proof.

`features/marketing/lib/home-page-structured-data.ts` is a required dependency and must be updated so schema matches the visible page. `tests/unit/home-page-structured-data.test.ts` and `tests/browser-smoke/app-smoke.spec.ts` are required validation dependencies and must stay truthful to the default homepage contract.
