---
summary: "Rewrites the homepage around the Sunday promise and gives the starter system dedicated space in the page architecture. The goal is to make the offer clearer without tearing down the existing visual shell."
read_when: "Open this when editing homepage messaging, the starter-system section, or shared promise surfaces like metadata and checkout copy."
plan_status: "done"
---

# Reframe The Homepage Around The Sunday Promise And The Starter-System Advantage

This is a living execution plan for rewriting the public homepage so it sells the real promise first, then reveals the codebase mechanism, then gives the starter system the dedicated space it deserves. It is written so a fresh coding agent can execute it without prior chat context.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

The homepage currently undersells the offer by flattening too much value into small checklist language. After this work, a cold visitor who lands on `/?marketing=1` should immediately understand that Ship by Sunday helps them ship a real, durable product by Sunday, that normal AI building fails because it starts with prompts instead of product truth, that the OpenAI-aligned documentation packs are the mechanism that keeps agents on the codebase, and that the generated starter system is not “just a template” but a configurable, agent-ready codebase with codified operational leverage. The page should still feel like the existing site. The strongest UI elements stay: the dramatic hero headline, animated highlights, preview image, proof cards, GitHub graph, pricing card, and footer wordmark. The work is a message and section-architecture rewrite, not a visual teardown.

## Progress

- [x] 2026-03-25 22:04 EDT: Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, and `docs/prompts/execplan-writer.md` before freezing the planning slice.
- [x] 2026-03-25 22:04 EDT: Inspected the homepage control plane, content layer, render model, section components, UI atoms, tests, metadata surfaces, codebase compiler outputs, starter docs, and observability paths.
- [x] 2026-03-25 22:04 EDT: Chose the message hierarchy: promise first, enemy second, mechanism third, by-Sunday outcomes fourth, starter-system advantage fifth, then durability, proof, objections, and close.
- [x] 2026-03-25 22:04 EDT: Chose the structural scope: keep the existing homepage shell but add one new top-level starter section because the current sections cannot adequately sell the starter system without compressing it into filler.
- [x] 2026-03-25 22:04 EDT: Grilled the plan and locked the must-have product decisions: homepage-only scope, hero secondary CTA to `#system`, early-clarity guarantee framing, learning-path detail inside the starter section, OpenAI best-practice provenance as a supporting point, and `Agent-Ready Starter System` as the homepage marketing label while `Codebase` remains the literal download label.
- [x] 2026-03-25 22:04 EDT: Locked the starter sub-advantage labels for the homepage: `Agent-Ready QA Team` and `Telegram Incident Alerts`.
- [x] 2026-03-25 22:04 EDT: Locked the provider-skill layer label for the homepage: `Agent-Trained Provider Experts`.
- [x] 2026-03-25 22:04 EDT: Locked the support-lane names for the starter section: `Fast Pass Walkthroughs`, `Guided Ship Path`, and `Product Sense Fundamentals`.
- [x] 2026-03-26 00:11 EDT: Landed the homepage contract slice for `starterSystem` by updating `apps/web/config/product.ts`, `apps/web/features/marketing/lib/home-page-render-model.ts`, `apps/web/features/marketing/components/home-page.tsx`, `apps/web/features/marketing/components/home-page/starter-system-section.tsx`, `apps/web/features/marketing/content/home.ts`, and the homepage docs so the new top-level section is part of the fixed section order and render contract.
- [x] 2026-03-26 00:21 EDT: Rewrote the homepage story in `apps/web/features/marketing/content/home.ts` so the hero, sprint path, what’s inside, starter system, durability, FAQ guarantee framing, and pricing copy now sell the Sunday promise first and the pack-plus-starter mechanism second.
- [x] 2026-03-26 00:21 EDT: Preserved the existing visual shell while making only minimal UI changes: a feature-local `starter-system-section.tsx` component and a secondary hero CTA that points to `#system` without bypassing `HomePagePrimaryCta`.
- [x] 2026-03-26 00:21 EDT: Propagated the shared promise across `apps/web/config/product.ts`, `apps/web/app/opengraph-image.tsx`, Stripe’s line-item description via `productConfig.promise`, and the homepage unit/browser-smoke tests.
- [x] 2026-03-26 00:21 EDT: Ran the homepage-focused validation suite, targeted browser smoke, and `bun run build`, then recorded the command correction and the validation evidence in this plan.

## Surprises & Discoveries

The starter-system story is grounded in the repo more strongly than the current homepage suggests. The shipped docs in `apps/web/content/docs/index.mdx`, `apps/web/content/docs/how-the-starter-works.mdx`, and `apps/web/content/docs/customize-the-starter.mdx` already describe a public marketing surface, a docs surface, a protected codebase-first workspace, module flags, and an opinionated public-to-paid-to-protected path across Next.js, Vercel, Stripe, Clerk, and Convex. That means the homepage can speak more boldly about the starter because the product already has concrete starter behavior and docs, not just aspirational copy.

The codebase compiler also supports the starter story directly. `packages/codebase-compiler/src/public-artifact-contract.ts` exposes public labels for Design Pack, Marketing Pack, Build Pack, Prompt Pack, and Codebase. `packages/codebase-compiler/src/repo-generation/render-template-overrides.ts` shows that generated output already targets `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts`, and `packages/codebase-compiler/src/repo-generation/build-repo-generation-manifest.ts` shows the Codebase includes `apps/web` and `packages/codebase-compiler` while excluding build/test clutter. The homepage can therefore truthfully position the starter as generated around the product definition rather than as a static generic starter.

The provider-expert and docs/config story is also real product substance, not marketing garnish. `apps/web/features/course/lesson/workbench/modes/skills-quickstart/skills-quickstart-skills-data.ts` and `apps/web/content/docs/mcps-and-skills.mdx` already present provider-specific guidance for Clerk, Convex, Stripe, Next.js, React, QA, and related workflows. `apps/web/content/docs/customize-the-starter.mdx` and `apps/web/content/docs/configure-the-homepage.mdx` show that the starter already exposes meaningful config seams, module flags, and control points rather than forcing manual repo surgery. The homepage can therefore position the starter as change-friendly for agents because the repo ships with agent-readable docs and deliberate config levers, not because “config files” are inherently exciting.

The observability story is also real, but it must be framed carefully. `apps/web/features/observability/telegram/render-incident-message.ts`, the observability test suite under `apps/web/tests/unit/observability-*.test.ts` and `apps/web/tests/integration/observability-*.test.ts`, and the live-flow docs in `apps/web/content/docs/local-qa.mdx` and `apps/web/content/docs/deploy-to-vercel.mdx` confirm Telegram-backed incident delivery, Convex ingest endpoints, Clerk and Vercel webhook ingestion, and incident status controls. This is strong differentiator material for the starter section, but the homepage should describe it as part of the starter’s operational leverage rather than drown the page in implementation detail.

The current homepage contract is more coupled than it first appears. The old promise surfaces are reused in app metadata, Open Graph, Stripe checkout description, homepage structured data descriptions, and smoke tests. Any copy rewrite that does not update `apps/web/config/product.ts`, `apps/web/app/opengraph-image.tsx`, `apps/web/platform/billing/stripe.ts`, and the homepage tests will leave public drift behind.

The homepage contract also appears in more docs than the primary operating guide. While landing the `starterSystem` section boundary, `apps/web/content/docs/how-the-starter-works.mdx` still listed the old fixed section order. That means the section-order slice must update both `apps/web/content/docs/configure-the-homepage.mdx` and any other starter docs that enumerate the homepage contract, or the repo drifts immediately.

The browser-smoke command in the original plan was stale for this repo. `bunx playwright test ...` resolved to a binary without the `test` subcommand in this workspace, while the checked-in app script still worked. The stable command here is `bun run --cwd apps/web test:browser-smoke -- --grep ...` after sourcing `apps/web/.env.local`.

One guardrail is important: “first of its kind” is a strong public claim, but it is a proof claim. The plan should allow strong differentiator language, but should avoid unverifiable superlatives on the homepage unless there is explicit evidence added elsewhere on the site.

Evidence from the repo that supports the revised offer framing:

    apps/web/content/docs/index.mdx:
    - public marketing surface on `/`
    - protected codebase-first workspace
    - starter contract and module flags

    packages/codebase-compiler/src/public-artifact-contract.ts:
    - Design Pack
    - Marketing Pack
    - Build Pack
    - Prompt Pack
    - Codebase

    apps/web/content/docs/local-qa.mdx:
    - observability smoke with Convex + Telegram
    - real signed-out, entitled, and paid-flow QA guidance

## Decision Log

Decision: The homepage rewrite will add one new top-level section dedicated to the starter system.
Rationale: The current section set can sell the promise and the mechanism, but it cannot adequately sell the generated starter, operational setup, QA, observability, and learning-path value without compressing them into weak checklists. The user explicitly identified the starter as an offer pillar that deserves its own space. One new section is justified.
Date: 2026-03-25

Decision: The copy hierarchy is promise first, enemy second, mechanism third, by-Sunday outcomes fourth, starter-system advantage fifth.
Rationale: The user explicitly clarified that “ship a real, durable product by Sunday” is the promise, and that the codebase system is the mechanism that keeps agents on the codebase. The homepage must reflect that hierarchy.
Date: 2026-03-25

Decision: The page will preserve the strongest visual and interactive elements instead of flattening into plain landing-page copy blocks.
Rationale: The current hero treatment, animated highlights, proof cards, GitHub graph, preview image, and pricing card are assets. The plan should make those elements carry stronger meaning, not remove them.
Date: 2026-03-25

Decision: The hero may receive minimal structural changes to support a stronger promise line and a secondary discovery path, but the CTA contract remains centralized.
Rationale: The approved story wants a big pushy promise, a large primary CTA, and a softer “see what you get” path. The current hero content shape likely needs a small extension, but `HomePagePrimaryCta` must remain the only primary checkout-rendering boundary.
Date: 2026-03-25

Decision: Add the `starterSystem` section boundary before rewriting the broader homepage message.
Rationale: The new top-level section is a public contract change. Landing the fixed section order, render model property, feature-local component boundary, and starter-doc updates first keeps later work scoped to message changes, shared promise surfaces, and tests instead of repeatedly churning the contract layer.
Date: 2026-03-26

Decision: The homepage will sell the starter system strongly, but will avoid unverifiable superlatives unless supported.
Rationale: The user wants “first of its kind” energy. The safer and still strong path is to emphasize the uniqueness of the combination of packs, generated starter, QA, and observability without making claims that require third-party proof.
Date: 2026-03-25

Decision: A dedicated starter detail page is a likely follow-up, but is not required for this homepage slice.
Rationale: The user explicitly said the starter deserves its own page. That is directionally correct, but the approved work here is the landing-page plan and rewrite. The homepage should create space for the starter now and prepare clean handoff to a future dedicated page.
Date: 2026-03-25

Decision: This slice is homepage-only and must not create a new public starter detail route.
Rationale: The user chose to keep the work scoped to the homepage. A new route would add metadata, navigation, and testing surface area without being required to strengthen the main sales argument.
Date: 2026-03-25

Decision: If the hero gets a secondary CTA, it should point to `#system`.
Rationale: The approved argument is promise first, then the diagnosis of why normal AI building fails, then the mechanism reveal. Jumping straight to the starter section would skip the part of the page that makes the starter feel necessary.
Date: 2026-03-25

Decision: Keep the current guarantee policy, but frame it explicitly as an early-clarity guarantee rather than a shipping guarantee.
Rationale: The repo and current business logic support the “clearer product definition and tighter v1 scope” guarantee. The homepage promise is bigger, so the guarantee copy must avoid implying “ship by Sunday or your money back.”
Date: 2026-03-25

Decision: Put the detailed learning-path stack inside the new starter section and keep the pricing includes short.
Rationale: The pricing card should close. The new starter section is the right place to explain fast-pass walkthroughs, the full lesson path, and the 20-video PM bonus without turning the whole page into inventory.
Date: 2026-03-25

Decision: The homepage should mention the OpenAI best-practice provenance only as a supporting point inside the starter section.
Rationale: The research and template provenance are real differentiators, but they should support the starter-system story rather than replace the outcome-first sales argument.
Date: 2026-03-25

Decision: Use `Agent-Ready Starter System` as the homepage marketing label for the generated codebase layer, while keeping `Codebase` as the literal product download label.
Rationale: `Agent-Ready Starter System` is stronger buyer language for the homepage. `Codebase` is already the truthful public artifact name in the review/download flow and does not need to be renamed in this slice.
Date: 2026-03-25

Decision: Use `Agent-Ready QA Team` and `Telegram Incident Alerts` as branded sub-advantages inside the starter section.
Rationale: The QA capability should feel like a credible team you now get access to, not like generic “tests.” The Telegram capability is strongest when framed around the immediate buyer outcome, which is getting alerted when something breaks.
Date: 2026-03-25

Decision: Use `Agent-Trained Provider Experts` as the homepage label for the built-in provider-skill layer.
Rationale: The repo already ships real provider-specific skills for Convex, Clerk, Next.js, React, Vercel, and QA. This label makes that capability feel like a serious built-in advantage rather than a generic note that some skills are installed.
Date: 2026-03-25

Decision: Treat agent-ready documentation and configuration levers as part of the `Agent-Ready Starter System` itself, not as a separate branded sub-product.
Rationale: The repo already has real docs and control seams in `config/product.ts`, the homepage contract, starter module flags, and the shipped docs. Those are core reasons the starter is easy for an agent to change, so they should reinforce the main starter-system story instead of fragmenting it into too many nouns.
Date: 2026-03-25

Decision: The `Agent-Trained Provider Experts` layer explicitly includes Stripe along with Convex, Clerk, Next.js, React, and Vercel.
Rationale: The repo and installed skills already support Stripe-specific guidance, and the user explicitly called out Stripe as part of the provider-expert story.
Date: 2026-03-25

Decision: The learning-path copy should mention that the included training teaches how to use skills, how that differs from sub-agents, and how to work with the provider experts in practice.
Rationale: The user identified this as part of the actual value, and the repo already ships MCP-and-skill guidance plus skill quickstart content. This belongs in the support-lane copy, not the top-line promise.
Date: 2026-03-25

Decision: Use `Fast Pass Walkthroughs`, `Guided Ship Path`, and `Product Sense Fundamentals` as the support-lane names on the homepage.
Rationale: These names are clearer and stronger than generic “videos,” “lessons,” or “bonus course” language. They make the learning stack feel like deliberate options inside the offer rather than leftover inventory.
Date: 2026-03-25

Decision: Keep the hero in the existing two-line headline treatment and move “durable” plus the mechanism explanation into the supporting copy and secondary CTA path.
Rationale: The Sunday promise needed broader meaning than the old mechanism-first headline, but preserving the strongest visual shell mattered more than forcing a longer headline that would dilute impact or break the current treatment.
Date: 2026-03-26

Decision: Keep pricing short and let the starter section carry the detailed support-lane explanation.
Rationale: The pricing card still needs to close cleanly. Naming the starter plus the key support lanes in pricing is enough once the new starter section already explains how those lanes differ and why they matter.
Date: 2026-03-26

## Outcomes & Retrospective

The homepage now keeps its original visual energy while selling a different argument. The hero leads with “Ship a real product by Sunday,” the next screen explains why prompt-first AI building drifts, the by-Sunday block focuses on concrete outcomes instead of pack inventory, and the new `starterSystem` section gives the starter its own space to sell configurability, QA, observability, provider expertise, and support lanes. The metadata, Open Graph image, Stripe description, unit tests, browser smoke, and build now all reflect that promise-first story.

The most important implementation tradeoff was message density in the hero. The approved promise was broader than the existing two-line headline format, so the implementation kept the dramatic two-line headline, moved “durable” into the supporting body copy, and added a secondary CTA to `#system` instead of inflating the hero into a full explainer. The second important tradeoff was pricing density: the detailed learning-path explanation stayed in the starter section while pricing kept a short includes list that still names the starter and the key support lanes.

The main future-facing follow-up remains whether the starter section should later expand into a dedicated `/starter` or docs-linked detail page once the homepage version is validated. No new route was needed for this slice.

## Context and Orientation

The homepage is controlled by a fixed contract that lives across config, content, render model, components, and tests. `apps/web/config/product.ts` defines the global product identity, price, route constants, homepage section order, CTA target types, module flags, and the shared `productConfig.promise` and `productConfig.metadataDescription` values that are reused throughout the app. `apps/web/features/marketing/content/home.ts` owns the actual homepage copy and assets. `apps/web/features/marketing/lib/home-page-render-model.ts` adapts config plus content into the exact shape consumed by `apps/web/features/marketing/components/home-page.tsx`.

The current public homepage renders these top-level sections in order: hero, sprint path, what’s inside, starter system, durability, social proof, FAQ, pricing, footer. That order is documented in `apps/web/content/docs/configure-the-homepage.mdx`, and that same document also defines the public anchor contract for `id="system"` and `id="pricing"`. Adding a top-level section is therefore a deliberate contract change. It requires synchronized updates to `apps/web/config/product.ts`, `apps/web/features/marketing/content/home.ts`, `apps/web/features/marketing/lib/home-page-render-model.ts`, `apps/web/features/marketing/components/home-page.tsx`, the relevant tests, and the homepage contract doc.

The current components are already segmented cleanly. The hero lives in `apps/web/features/marketing/components/home-page/hero-sections.tsx` and `home-hero-headline.tsx`. The current “system” section lives in `apps/web/features/marketing/components/home-page/sprint-path-unified-section.tsx`. The three-card content block lives in `apps/web/features/marketing/components/home-page/whats-inside-section.tsx`. `apps/web/features/marketing/components/home-page/durability-section.tsx` holds the current Monday-durability block. Proof and FAQ are in `social-proof-faq-sections.tsx`, while pricing and footer are in `pricing-footer-sections.tsx`.

Several reusable UI atoms should be intentionally preserved. `apps/web/components/ui/cover.tsx` gives the hero headline its dramatic animated emphasis. `apps/web/components/ui/pointer-highlight.tsx` gives the system and card sections a “progressively discovered” feel. `apps/web/components/ui/encrypted-text.tsx` energizes the proof stats. The globe card and GitHub graph add motion and legitimacy to the proof section. These are not just decoration; they are part of the current page’s perceived value and should be made to serve the new argument.

The starter-system story is grounded in real product surfaces. `apps/web/content/docs/index.mdx` describes the starter as a codebase-first starter with a public landing page, real paid access, and a protected workspace. `apps/web/content/docs/how-the-starter-works.mdx` describes the locked stack and module gating. `apps/web/features/workspace-home/lib/workspace-home-model.ts` shows configurable modules for docs, course, codex, and observability. `packages/codebase-compiler/src/repo-generation/render-template-overrides.ts` and `build-repo-generation-manifest.ts` show that generated output can tailor `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts` while producing a repo-shaped artifact. The observability flow is backed by real code and tests under `apps/web/features/observability/**` and `apps/web/tests/**`.

The tests and metadata surfaces matter for this slice. `apps/web/tests/unit/home-page-content.test.ts`, `apps/web/tests/unit/home-page-render-model.test.ts`, `apps/web/tests/unit/home-page-structured-data.test.ts`, `apps/web/tests/integration-ui/home-page-primary-cta.test.tsx`, and `apps/web/tests/browser-smoke/app-smoke.spec.ts` now prove the updated promise-first homepage contract. `apps/web/features/marketing/lib/home-page-structured-data.ts`, `apps/web/app/layout.tsx`, `apps/web/app/manifest.ts`, `apps/web/app/opengraph-image.tsx`, and `apps/web/platform/billing/stripe.ts` all depend on the shared promise fields in `productConfig`, so those surfaces were updated or revalidated together.

## Plan of Work

The work should begin by freezing the revised section architecture and mapping it to the existing component shell. The new top-of-page story is already approved: the hero sells the promise with a big CTA, an optional secondary CTA points to `#system`, the current system section explains the enemy and the mechanism, the current “what’s inside” section becomes by-Sunday outcomes, and a new top-level starter section sells the `Agent-Ready Starter System`, its operational leverage, and the included learning paths. The durability, proof, FAQ, pricing, and footer sections stay in place but receive new copy.

Once the section map is frozen, update the content model in `apps/web/features/marketing/content/home.ts` and only then change the components necessary to render it. Preserve section-local architecture. Do not scatter new strings through component files. If the hero needs more expressive room, add one or two content fields and make the consuming components render them. If the starter section is new, add a dedicated feature-local component under `apps/web/features/marketing/components/home-page/` rather than stretching an existing unrelated section beyond its role. Do not add a new route or public detail page in this slice.

After the content model and section rendering are updated, propagate the new promise into `apps/web/config/product.ts` and the public metadata surfaces. Then update the unit and smoke tests to assert the new story, not the old “Agent-Ready Packs” headline. Finish by running the homepage-focused validation commands from `apps/web/content/docs/configure-the-homepage.mdx` and the broader build/browser checks.

## Milestones

### Milestone 1: Freeze the revised homepage architecture and the new section contract

At the end of this milestone, the implementer knows exactly how the new story maps to the page and whether a new top-level section is truly required. Success looks like a written architectural decision that the current fixed section order will gain one new section and that each section’s job is explicit.

The target order after this milestone is: hero, sprint path, what’s inside, starter system, durability, social proof, FAQ, pricing, footer. The hero sells the promise. The sprint-path section explains why prompt-first AI building fails and why the contract-first path works. “What’s inside” sells by-Sunday outputs. The new starter-system section sells the generated codebase, operational leverage, and learning-path support. Durability keeps the Monday payoff. Proof, FAQ, pricing, and footer stay in their existing roles.

This milestone must also decide the exact internal section name to add to the homepage contract. The name should be descriptive and feature-local. `starterSystem` is the preferred internal key because it is specific, readable, and matches the public story. The contract doc in `apps/web/content/docs/configure-the-homepage.mdx` must be updated as part of the same slice.

### Milestone 2: Rewrite the content model and preserve the strongest existing UI patterns

At the end of this milestone, the homepage can render the new story with current visual energy intact. Success looks like the new promise-first hero, the revised system section, the by-Sunday outcomes block, and the new starter-system section all rendering through feature-local components without breaking the current design language.

This milestone will touch `apps/web/features/marketing/content/home.ts` heavily. It will likely touch `apps/web/features/marketing/components/home-page/hero-sections.tsx` and `home-hero-headline.tsx` to support a stronger promise line and optional secondary CTA that points to `#system`. It will add a new feature-local component such as `apps/web/features/marketing/components/home-page/starter-system-section.tsx` for the starter section. If that component shares card or highlight patterns with `whats-inside-section.tsx`, either reuse the existing primitives in place or extract a small feature-local shared card component inside the same `home-page/` folder. Do not create global abstractions for a one-page landing need.

The new starter section should not read like a generic feature dump. It should explain that the `Agent-Ready Starter System` is configurable, aligned to the codebase output, pre-wired with real product infrastructure, and shipped with agent-readable docs and change-friendly control seams. It should surface the OpenAI best-practice provenance as a supporting point, not the headline. It should also surface included learning paths without making the videos feel like the main product. A likely content structure is a strong headline and intro, followed by three or four cards for the differentiators, and then a smaller secondary strip or subcopy that clarifies `Fast Pass Walkthroughs`, `Guided Ship Path`, `Product Sense Fundamentals`, and how to use skills versus sub-agents as included support lanes. The pricing card should stay short and should not carry the detailed learning-path explanation. Preferred starter-section card nouns now include `Agent-Ready QA Team`, `Telegram Incident Alerts`, and `Agent-Trained Provider Experts`.

### Milestone 3: Align the shared promise surfaces and connected tests

At the end of this milestone, the public message is consistent in the homepage, metadata, Open Graph card, Stripe description, and tests. Success looks like the new promise and starter-system framing appearing everywhere a user encounters the product identity, with the homepage contract and smoke tests still passing.

This milestone will update `apps/web/config/product.ts` so `productConfig.promise` and `productConfig.metadataDescription` reflect the new promise-first story. `apps/web/app/opengraph-image.tsx` may need small layout tightening if the new promise wraps poorly. `apps/web/platform/billing/stripe.ts` will pick up the new promise automatically through `productConfig.promise`, so that description must stay truthful and concise. The unit and smoke tests under `apps/web/tests/unit/home-page-content.test.ts` and `apps/web/tests/browser-smoke/app-smoke.spec.ts` must be updated to assert the new hero, the new section architecture, and the preserved anchor ids.

### Milestone 4: Validate behavior, record tradeoffs, and leave a clean follow-up path

At the end of this milestone, the homepage-focused suite passes, the broader build passes, and the plan records any tradeoffs between literal copy and component fit. Success looks like a passing narrow homepage suite, a passing build, and updated notes in this plan explaining what was adapted for the UI.

The likely tradeoffs are hero-line length, whether the globe card still helps the proof section after the new starter section is introduced, and whether the included video paths belong wholly inside the new starter section or partially in pricing. The plan should record those decisions so a later dedicated starter page can extend the story cleanly.

## Concrete Steps

Start from the repository root and refresh the exact homepage contract plus the starter-system evidence before touching code.

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,220p' apps/web/content/docs/configure-the-homepage.mdx
    sed -n '1,260p' apps/web/features/marketing/content/home.ts
    sed -n '1,260p' apps/web/config/product.ts
    sed -n '1,260p' apps/web/content/docs/index.mdx
    sed -n '1,260p' apps/web/content/docs/how-the-starter-works.mdx
    sed -n '1,260p' apps/web/content/docs/customize-the-starter.mdx
    sed -n '1,260p' apps/web/content/docs/local-qa.mdx
    sed -n '1,260p' packages/codebase-compiler/src/public-artifact-contract.ts
    sed -n '1,260p' packages/codebase-compiler/src/repo-generation/render-template-overrides.ts
    sed -n '1,260p' packages/codebase-compiler/src/repo-generation/build-repo-generation-manifest.ts

Write down the new section map and keep it stable during the implementation:

    hero -> promise + anti-slop contrast + large checkout CTA
    sprintPath -> enemy diagnosis + contract-first mechanism
    whatsInside -> by-Sunday outcomes
    starterSystem -> Agent-Ready Starter System + operations + learning paths
    durability -> Monday payoff
    socialProof -> proof
    faq -> objections
    pricing -> hard close

Then update `apps/web/config/product.ts` to add the new `starterSystem` section key to the homepage section order and the default section toggles. Update `apps/web/features/marketing/lib/home-page-render-model.ts` to include the new section in the render model. Update `apps/web/features/marketing/components/home-page.tsx` to render the new section in the correct place.

Next, update `apps/web/features/marketing/content/home.ts` to hold the new copy structure. The hero content should become promise-first. If a secondary CTA is added, it should link to `#system`. The hero checklist should shrink to high-value outcome reinforcement rather than try to explain the entire offer. The current sprint-path content should become the “why prompt-first fails / why the codebase matter” section. The current what’s-inside content should become by-Sunday deliverables. Add a new `starterSystemSection` content object that explains the `Agent-Ready Starter System`, the operational leverage, the OpenAI-aligned best-practice provenance as a supporting point, and the learning-path stack.
Next, update `apps/web/features/marketing/content/home.ts` to hold the new copy structure. The hero content should become promise-first. If a secondary CTA is added, it should link to `#system`. The hero checklist should shrink to high-value outcome reinforcement rather than try to explain the entire offer. The current sprint-path content should become the “why prompt-first fails / why the codebase matter” section. The current what’s-inside content should become by-Sunday deliverables. Add a new `starterSystemSection` content object that explains the `Agent-Ready Starter System`, the operational leverage, the agent-readable docs and easy config/toggle seams, the OpenAI-aligned best-practice provenance as a supporting point, and the support-lane stack named `Fast Pass Walkthroughs`, `Guided Ship Path`, and `Product Sense Fundamentals`.

If needed, extend the hero component shape minimally. Keep `HomePagePrimaryCta` as the only primary CTA renderer. If a secondary hero CTA is added, make it a normal link button or anchor that points to `#system`.

Create the new feature-local starter section component under `apps/web/features/marketing/components/home-page/`. Reuse the local card, badge, pointer-highlight, and spacing language from the existing homepage so the new section looks native. Do not introduce a one-off visual system.

After the page-level content and rendering work is done, align the shared promise and metadata surfaces.

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,180p' apps/web/app/opengraph-image.tsx
    sed -n '1,160p' apps/web/platform/billing/stripe.ts
    sed -n '1,260p' apps/web/features/marketing/lib/home-page-structured-data.ts
    sed -n '1,220p' apps/web/tests/unit/home-page-content.test.ts
    sed -n '1,260p' apps/web/tests/unit/home-page-render-model.test.ts
    sed -n '1,260p' apps/web/tests/unit/home-page-structured-data.test.ts
    sed -n '1,260p' apps/web/tests/browser-smoke/app-smoke.spec.ts

Update the tests to assert the new story and new section order while preserving the anchor-id checks and schema expectations. The homepage tests should also confirm the guarantee language reads as an early-clarity guarantee rather than implying a ship-or-refund promise.

Run the narrow homepage validation suite from `apps/web/content/docs/configure-the-homepage.mdx`.

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx oxlint --deny-warnings config/product.ts features/marketing/components/home-page.tsx features/marketing/components/home-page/durability-section.tsx features/marketing/components/home-page/hero-sections.tsx features/marketing/components/home-page/pricing-footer-sections.tsx features/marketing/components/home-page/home-page-primary-cta.tsx features/marketing/content/home.ts features/marketing/lib/home-page-render-model.ts features/marketing/lib/home-page-structured-data.ts tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts tests/integration-ui/home-page-primary-cta.test.tsx

    bunx oxfmt --check config/product.ts features/marketing/components/home-page.tsx features/marketing/components/home-page/durability-section.tsx features/marketing/components/home-page/hero-sections.tsx features/marketing/components/home-page/pricing-footer-sections.tsx features/marketing/components/home-page/home-page-primary-cta.tsx features/marketing/content/home.ts features/marketing/lib/home-page-render-model.ts features/marketing/lib/home-page-structured-data.ts tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts tests/integration-ui/home-page-primary-cta.test.tsx

    bunx vitest --config vitest.config.ts run --project unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts

    bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/home-page-primary-cta.test.tsx

Then run the browser smoke and full build from the repository root.

    cd /Users/parkerrex/Projects/ship-by-sunday
    set -a
    source apps/web/.env.local
    set +a
    bun run --cwd apps/web test:browser-smoke -- --grep "landing page renders the main offer CTA|homepage renders structured SEO data"

    bun run build

If any validation fails, stop, record the failure in `Surprises & Discoveries`, fix the issue, rerun the failing check, and only then proceed.

## Validation and Acceptance

The work is accepted only when a human can open `/?marketing=1` and immediately understand the offer without decoding internal jargon. The hero must communicate that Ship by Sunday helps the visitor ship a real, durable product by Sunday. The primary CTA must remain large and checkout-driven. If there is a secondary CTA, it must guide discovery without competing with purchase.

The next screenful must make the enemy and the mechanism obvious. A cold visitor should understand why prompt-first AI building drifts and why the contract-first docs-pack path keeps agents on the codebase. The by-Sunday outcomes section must make the deliverables concrete. The new starter-system section must clearly explain that the buyer is not just getting videos and a generic starter, but an `Agent-Ready Starter System` with a generated, configurable codebase, operational leverage, included learning paths, and OpenAI-aligned best-practice support as a supporting proof point. The durability section must make the Monday payoff explicit. The proof, FAQ, pricing, and footer must still render and feel intentional.

The homepage contract must still hold. `id="system"` and `id="pricing"` must remain present. The CTA behavior must still flow through the shared homepage CTA boundary. If a secondary hero CTA is added, it must point to `#system`. The homepage structured data must still emit `Organization`, `Product` when pricing is still checkout-backed, and `FAQPage` when FAQ is visible. The narrow homepage validation commands must pass. The browser-smoke tests must pass. `bun run build` must pass.

The public message must also remain consistent beyond the homepage. `productConfig.promise`, `productConfig.metadataDescription`, the Open Graph card, and the Stripe line-item description must reflect the new story instead of the old mechanism-first phrasing. The guarantee copy must remain clearly framed as an early-clarity guarantee rather than a ship-by-Sunday refund promise.

## Idempotence and Recovery

This plan is safe to rerun because it changes content, section wiring, and light presentation logic rather than performing destructive operations. Re-reading the contract docs and rerunning the validation commands should never damage the repo.

If the new starter section adds too much scope pressure, recover by implementing the new section with a simple local component and content object rather than refactoring existing sections into a generalized landing-page builder. Keep the work feature-local and additive. Do not solve scope pressure by adding a second public route in this slice.

If the hero copy becomes unstable or overstuffed, recover by reducing the literal text load in the hero and pushing detail down into the new starter section. The hero’s job is the promise and the click, not the full product explanation. Preserve the UI energy and move detail lower rather than blowing up the hero structure.

If metadata or Stripe descriptions become awkward after the promise change, recover by tightening `productConfig.promise` and `productConfig.metadataDescription` independently while keeping them aligned in direction. The homepage can be more expansive than the checkout description.

If validation fails because the new top-level section changed the homepage contract, update the contract doc, render model tests, and browser smoke in the same slice. Do not leave the contract half-updated. If the new section later proves too heavy for the homepage, it can be demoted in a future iteration because the section will be feature-local and separately toggleable through `starterConfig.homePage.sections`.

## Artifacts and Notes

The homepage should now sell four offer layers in order:

    1. Ship a real product by Sunday.
    2. Most AI builds fail because they start with prompts instead of product truth.
    3. The docs packs keep the agents on the codebase.
    4. The generated starter gives those agents the right place to work.

The homepage should use these naming rules consistently:

    mechanism layer -> docs packs / Agent-Ready Packs
    generated codebase marketing label -> Agent-Ready Starter System
    literal download label -> Codebase

The new homepage contract should move from this:

    hero
    sprintPath
    whatsInside
    durability
    socialProof
    faq
    pricing
    footer

to this:

    hero
    sprintPath
    whatsInside
    starterSystem
    durability
    socialProof
    faq
    pricing
    footer

The new starter section should carry these ideas explicitly, though the exact wording can be tightened for component fit:

    Agent-Ready Starter System, not generic template
    agent-ready docs plus configurable modules and starter-mode controls
    real auth, billing, access, and protected-workspace path
    Agent-Ready QA Team
    Telegram Incident Alerts
    Agent-Trained Provider Experts across Convex, Clerk, Stripe, Next.js, React, and Vercel
    OpenAI-aligned best-practice support as a supporting proof point
    Fast Pass Walkthroughs
    Guided Ship Path
    Product Sense Fundamentals
    skills versus sub-agents teaching as part of the support lane

Observed validation transcript for the completed contract slice:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx oxfmt --check config/product.ts features/marketing/components/home-page.tsx features/marketing/components/home-page/starter-system-section.tsx features/marketing/content/home.ts features/marketing/lib/home-page-render-model.ts tests/unit/home-page-render-model.test.ts
    All matched files use the correct format.

    bunx oxlint --deny-warnings config/product.ts features/marketing/components/home-page.tsx features/marketing/components/home-page/starter-system-section.tsx features/marketing/content/home.ts features/marketing/lib/home-page-render-model.ts tests/unit/home-page-render-model.test.ts
    Found 0 warnings and 0 errors.

    bunx vitest --config vitest.config.ts run --project unit tests/unit/home-page-render-model.test.ts
    Test Files  1 passed (1)
    Tests       2 passed (2)

Observed validation transcript for the completed homepage rewrite:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx oxlint --deny-warnings config/product.ts features/marketing/components/home-page.tsx features/marketing/components/home-page/durability-section.tsx features/marketing/components/home-page/hero-sections.tsx features/marketing/components/home-page/pricing-footer-sections.tsx features/marketing/components/home-page/home-page-primary-cta.tsx features/marketing/components/home-page/starter-system-section.tsx features/marketing/content/home.ts features/marketing/lib/home-page-render-model.ts features/marketing/lib/home-page-structured-data.ts tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts tests/integration-ui/home-page-primary-cta.test.tsx
    Found 0 warnings and 0 errors.

    bunx oxfmt --check config/product.ts features/marketing/components/home-page.tsx features/marketing/components/home-page/durability-section.tsx features/marketing/components/home-page/hero-sections.tsx features/marketing/components/home-page/pricing-footer-sections.tsx features/marketing/components/home-page/home-page-primary-cta.tsx features/marketing/components/home-page/starter-system-section.tsx features/marketing/content/home.ts features/marketing/lib/home-page-render-model.ts features/marketing/lib/home-page-structured-data.ts tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts tests/integration-ui/home-page-primary-cta.test.tsx
    All matched files use the correct format.

    bunx vitest --config vitest.config.ts run --project unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    Test Files  3 passed (3)
    Tests       7 passed (7)

    bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/home-page-primary-cta.test.tsx
    Test Files  1 passed (1)
    Tests       2 passed (2)

    cd /Users/parkerrex/Projects/ship-by-sunday
    set -a
    source apps/web/.env.local
    set +a
    bun run --cwd apps/web test:browser-smoke -- --grep "landing page renders the main offer CTA|homepage renders structured SEO data"
    2 passed

    bun run build
    ✓ Compiled successfully
    ✓ Finished TypeScript
    ✓ Generating static pages using 9 workers (64/64)

Strong homepage differentiator language should stay defensible. Prefer lines such as:

    More than a starter. More like an agent-ready operating system.
    The docs packs tell the agents what to do. The starter gives them the right place to do it.
    Most starters give you code. This gives you codebase.

Avoid unqualified lines such as “first of its kind” unless the site later adds explicit supporting proof.

## Interfaces and Dependencies

`apps/web/config/product.ts` is the authoritative source for the homepage section order, CTA target types, shared promise fields, and module flags. Adding `starterSystem` requires synchronized updates there first.

`apps/web/features/marketing/content/home.ts` remains the only source of homepage copy and assets. If new fields are required for the hero or the new starter section, add them there and let the consuming components derive their types from the content shape. Do not scatter literal copy into component bodies.

`apps/web/features/marketing/lib/home-page-render-model.ts` must remain the single place that turns config and content into the render contract. Add the new section there rather than sprinkling conditional logic through multiple components.

`apps/web/features/marketing/components/home-page/home-page-primary-cta.tsx` remains the only primary CTA rendering boundary for the hero and pricing sections. Do not bypass it with direct checkout button imports. Any new hero secondary CTA must be visually secondary, technically independent from the primary checkout CTA, and targeted at `#system`.

`apps/web/features/marketing/components/home-page/` is the correct location for any new section component or extracted shared section-local UI primitive. Keep any reuse feature-local unless it is already a global UI atom.

`apps/web/features/marketing/lib/home-page-structured-data.ts` must continue to emit truthful schema based on visible sections and CTA behavior. No schema change is needed solely because the new section exists, but the updated metadata description must remain honest.

`apps/web/app/layout.tsx`, `apps/web/app/manifest.ts`, `apps/web/app/opengraph-image.tsx`, and `apps/web/platform/billing/stripe.ts` all depend on the shared promise surfaces and must stay aligned with the homepage rewrite.

`apps/web/tests/unit/home-page-content.test.ts`, `apps/web/tests/unit/home-page-render-model.test.ts`, `apps/web/tests/unit/home-page-structured-data.test.ts`, `apps/web/tests/integration-ui/home-page-primary-cta.test.tsx`, and `apps/web/tests/browser-smoke/app-smoke.spec.ts` are mandatory proof surfaces for this slice. The work is not done until those are updated and passing.
