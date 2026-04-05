---
summary: "Strategic plan for re-framing the repo as a reusable starter platform without losing the strongest existing infrastructure. It defines the core/optional/too-specific/remove/missing classification model and the milestone map for the generalization effort."
read_when: "Open this when you need the boundary-setting audit, milestone framing, or the repository-level strategy for starter configuration."
plan_status: "done"
---

# Configurable Starter Plan for `ship-by-sunday`

## Initiative

Turn `ship-by-sunday` from a product-shaped repo into a configurable starter platform without losing the stronger infrastructure already present in the repo.

## Execution companion

Implementation progress, slice sequencing, and the build-test-update loop now live in [2026-03-23-configurable-starter-execution-plan.md](/Users/parkerrex/Projects/ship-by-sunday/.codex/plans/2026-03-23-configurable-starter-execution-plan.md).

## Goal

Use `ship-by-sunday` as the base starter instead of `ship-by-sunday-starter`, then make it safe to reuse for new user builds by separating reusable platform capabilities from Ship by Sunday specific product assumptions. The finished starter should preserve the strongest parts of the current repo — Clerk auth, hosted Convex workflow, Stripe checkout primitives, Telegram observability, SEO foundations, Codex-assisted flows, and the existing workspace shell — while making branding, product framing, onboarding shape, public marketing surface, blank-state behavior, starter operations, and future analytics instrumentation configurable.

## Non-goals

- Rebuild the repo from scratch.
- Remove working infrastructure just because it is not needed by every starter.
- Fully redesign every public or workspace screen in the same pass.
- Finalize every future generated-doc-pack integration detail in this plan.
- Add every optional integration immediately.
- Ship a full analytics implementation in the same first pass unless the baseline adapter and event contract are ready.
- Create a giant over-configured starter with endless knobs and weak defaults.

## Constraints

- Keep the strongest existing runtime surfaces intact where possible: `features/observability/`, `features/codex/`, `features/checkout/`, `features/product-access/`, and the hosted Convex workflow.
- Favor configuration, modularization, feature gating, and starter-safe defaults before deletion.
- Keep diffs milestone-scoped; do not perform opportunistic repo-wide cleanup.
- Preserve the repo's feature-based folder structure.
- Preserve or improve current validation coverage.
- New starter behavior must still support the existing app while the repo is being generalized.
- Anything that remains product-specific must be clearly identified and intentionally isolated.
- The starter should feel like a clean powerful base, not like “our app with some logos sanded off.”

## Architecture intent

The target shape is a starter platform with four clean layers:

1. **Platform capabilities** — auth, billing primitives, access model, observability, Codex integration, docs infrastructure, SEO helpers, app shell, deployment/dev workflow, and other reusable infrastructure.
2. **Configurable starter defaults** — theme tokens, branding text, nav labels, enabled modules, starter content, onboarding defaults, checkout framing, blank states, and public-site configuration.
3. **Optional product modules** — starter-repo access, Telegram observability UI exposure, curriculum/course surfaces, and any future channel-specific or workflow-specific add-ons.
4. **Project-specific overlays** — future generated doc-pack output that customizes the starter without rewriting its core systems.

The repo should stop feeling like “Ship by Sunday with some strings cut” and start feeling like “a strong default platform that can become many products.”

## Audit classification model

Every major feature, route, workflow, and integration should be classified into exactly one primary bucket during the audit:

- **Core** — every starter should get this because it is universal capability or foundational infrastructure.
- **Optional** — a good capability worth keeping, but not every starter should expose it by default.
- **Too specific** — useful in this repo today, but too branded, opinionated, or tied to the current product; should be neutralized into config/content/module boundaries.
- **Remove** — dead experiments, haunted leftovers, one-off tooling, internal-only assumptions, or setup weirdness that would confuse a fresh user.
- **Missing** — capabilities the starter still needs in order to feel complete and reusable.

Use these decision questions on every significant surface:

1. Is this a universal capability?
2. Is this a good optional capability?
3. Is this actually a product decision masquerading as infrastructure?
4. Should this be off by default?
5. Should this be user-selectable later?
6. Would a new user think “hell yes, glad this is here” or “why is this random thing in my app?”

## Milestone map

| Milestone | Outcome | Acceptance criteria | Validation commands | Status |
|---|---|---|---|---|
| M1 | Repo capability audit and starter boundary map | Reusable vs product-specific surfaces are explicitly classified as core / optional / too specific / remove / missing; missing starter needs are written down; no code changes required yet | `ls app features convex scripts`, manual doc review | Not started |
| M2 | Configuration model and starter contract | A documented contract exists for branding, product framing, module enablement, marketing defaults, blank states, starter hygiene, and analytics hooks | manual review of planned config surfaces; update plan before coding | Not started |
| M3 | Public surface generalization plan | Public marketing, pricing, docs framing, blank-state content, and checkout messaging have a concrete generalization path | `bun run build`, `bun run test:browser-smoke` after implementation work begins | Not started |
| M4 | Workspace and module decoupling plan | Workspace routes and product modules are split into core vs optional modules with file ownership boundaries and starter-safe defaults | `bun run test:unit`, `bun run test:integration`, `bun run build` after implementation work begins | Not started |
| M5 | Analytics, observability, and starter ops baseline plan | Product analytics baseline, Telegram observability, starter settings, integration toggles, and starter visibility conventions coexist cleanly with documented contracts | `bun run test:contracts`, `bun run test:integration`, targeted smoke checks after implementation work begins | Not started |
| M6 | Starter hardening and rollout | The repo can operate both as the existing product and as a generalized starter with documented setup, cleanup, and fallback rules | `bun run check`, `bun run test:browser-smoke` | Not started |

## Detailed milestone plans

### M1 — Audit the repo into core / optional / too specific / remove / missing

**Objective**

Build the source-of-truth inventory for what this repo already has, what should remain core, what should become optional, what is too Ship-by-Sunday specific, what should be removed, and what is missing for a reusable starter.

**Tasks**

1. Audit `README.md`, `app/`, `features/`, `convex/`, `scripts/`, and docs for major capabilities already present.
2. Classify each major surface into one of five buckets:
   - core,
   - optional,
   - too specific,
   - remove,
   - missing.
3. For every significant feature, answer these exact questions:
   - does every starter get this?
   - does only some starter get this?
   - should this be off by default?
   - should this be user-selectable later?
   - would this feel helpful or random to a new user?
4. Explicitly assess likely **keep/core** infrastructure, including:
   - auth and user model,
   - workspace structure,
   - chat/agent orchestration primitives,
   - Telegram integration plumbing,
   - background jobs or queue-like workflows if present,
   - file upload flows if present,
   - doc generation pipeline or Codex build helpers,
   - admin/debug surfaces,
   - billing hooks and product-access primitives,
   - deployment/env/dev workflow patterns.
5. Explicitly assess likely **too specific** or **neutralize** surfaces, including:
   - specific copy,
   - Ship by Sunday or MMAI naming,
   - hardcoded workflows,
   - business-specific assumptions,
   - opinionated nav labels,
   - seeded content that feels like someone else’s app,
   - canned agent personalities or prompts that are too specific.
6. Explicitly assess likely **remove** candidates, including:
   - dead experiments,
   - one-off internal tooling,
   - product-specific hacks,
   - leftover test pages,
   - internal-only debug assumptions,
   - weird setup steps that only make sense for the current story.
7. Explicitly assess likely **missing** starter categories, including:
   - marketing shell,
   - product analytics,
   - starter configuration surface,
   - clearer modularity,
   - better blank-state behavior,
   - onboarding/setup scaffolding,
   - starter operations visibility.
8. Record the audit output in a planning artifact before any major implementation starts.

**Acceptance criteria**

- [ ] Every major repo surface is classified as core, optional, too specific, remove, or missing.
- [ ] Telegram observability, Stripe/product-access, SEO, Codex, current workspace shell, and marketing surfaces are explicitly assessed instead of hand-waved.
- [ ] The repo’s biggest product-specific assumptions are identified in plain English.
- [ ] Remove candidates are named explicitly instead of getting buried under “later cleanup.”
- [ ] Missing starter needs are listed in priority order.
- [ ] The audit uses the “helpful vs random to a new user” test, not just technical categorization.

**Validation commands**

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
ls
find app -maxdepth 2 -type d
find features -maxdepth 2 -type d
find convex -maxdepth 2 -type f
find scripts -maxdepth 2 -type f
```

**Notes / decisions**

- Start with an audit, not implementation.
- The immediate question is not “what should we code first?” but “what shape should this repo become?”
- Keep the existing stronger infrastructure unless it is actively harmful to starter reuse.
- Make “remove” a real category so haunted starter leftovers do not survive by accident.

### M2 — Define the starter configuration model and hygiene surfaces

**Objective**

Decide how a future project changes this repo without rewriting internals, and define the first-class starter operations surfaces a new user will need.

**Tasks**

1. Identify the configuration seams for:
   - app identity and brand,
   - product name and positioning,
   - public navigation and CTA framing,
   - workspace nav and default routes,
   - enabled modules,
   - checkout/product access framing,
   - docs visibility,
   - analytics provider and event sink wiring,
   - blank-state behavior,
   - onboarding defaults.
2. Decide which values live in code config, content files, env, or starter metadata.
3. Identify hardcoded product language and rename it into config-driven or content-driven surfaces.
4. Define the starter-hygiene surfaces the product should eventually expose:
   - starter settings page,
   - branding/theme config,
   - integration toggles,
   - onboarding/setup checklist,
   - “what is enabled in this workspace?” visibility.
5. Write down what stays opinionated vs what becomes configurable.
6. Define a stop line for over-configuration: do not create a giant bag of knobs that makes the starter impossible to reason about.

**Acceptance criteria**

- [ ] There is a documented list of starter inputs.
- [ ] Brand/product text, module enablement, blank states, and starter operations have named homes.
- [ ] Product-specific copy does not remain scattered as invisible assumptions.
- [ ] The starter-hygiene surfaces are explicitly called out, not left as a vague future idea.
- [ ] The plan preserves strong defaults instead of demanding everything be configurable.

**Validation commands**

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
rg -n "Ship by Sunday|ship-by-sunday|student|lesson|mission|artifacts|workspace" app features content docs convex
rg -n "telegram|observability|starter repo|checkout|pricing|brand|theme|settings" app features docs README.md
```

**Notes / decisions**

- “Configurable” should mean stable extension points, not infinite options.
- Prefer a few obvious starter inputs over a broad config schema no one can understand.
- Starter hygiene matters almost as much as starter capability.

### M3 — Generalize the public product surface

**Objective**

Create a concrete path to turn the existing public marketing/checkout/docs surface into a starter-ready public shell.

**Tasks**

1. Audit `features/marketing/` and root public routes for Ship-by-Sunday-specific positioning.
2. Decide the minimum public starter surface:
   - landing page structure,
   - waitlist or CTA capture path,
   - pricing or offer page shell,
   - docs entry point,
   - sign-in/sign-up framing,
   - checkout success/cancel messaging.
3. Separate generic SEO infrastructure from product-specific copy and schema.
4. Plan how public-page sections become replaceable starter content rather than bespoke landing-page code.
5. Identify whether the current docs site is part of the starter baseline or an optional module.
6. Define the baseline marketing fields the starter should support:
   - SEO fields,
   - social/share metadata,
   - proof/testimonial sections if needed,
   - configurable CTA destinations.
7. Define where product analytics should hook into the public funnel:
   - page views,
   - CTA clicks,
   - sign-up starts,
   - checkout starts,
   - checkout success.
8. Define the blank-state and first-impression test for the public surface: a new user should see a generic but strong starter, not somebody else’s launch page.

**Acceptance criteria**

- [ ] The public surface has a clear baseline starter shape.
- [ ] Existing SEO work remains reusable.
- [ ] Product-specific landing-page sections are identified for neutralization, optionalization, or replacement.
- [ ] Baseline analytics events for the public funnel are defined.
- [ ] The blank-state public experience does not feel haunted by the current product.

**Validation commands**

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
find features/marketing -maxdepth 3 -type f
find app -maxdepth 2 -type f | rg "page|layout|checkout|docs|opengraph|twitter|robots|sitemap"
```

**Notes / decisions**

- Keep the SEO foundation.
- Replace marketing specificity before replacing infrastructure.
- The public shell should feel immediately reusable even before a project-specific overlay is applied.

### M4 — Decouple the workspace into core shell vs optional modules

**Objective**

Make the signed-in app reusable by separating platform shell from current product modules.

**Tasks**

1. Audit protected routes under `app/(workspace)/` and mirrored route entrypoints.
2. Separate core workspace concerns from Ship-by-Sunday course concerns.
3. Decide whether these remain core, optional, too specific, or remove candidates for default starter exposure:
   - mission,
   - lessons,
   - artifacts,
   - starter-repo access,
   - settings,
   - session-task identity flows.
4. Document ownership boundaries between shell, navigation, access control, and product modules.
5. Plan starter-safe defaults for a new workspace with minimal enabled modules.
6. Define better blank states for disabled or absent modules so the workspace still feels intentional.
7. Ensure current product access logic can gate optional modules without rewriting auth foundations.

**Acceptance criteria**

- [ ] The workspace shell is separable from course/product-specific modules.
- [ ] Route ownership boundaries are documented.
- [ ] Optional modules are identified and have a clear default-on/default-off stance.
- [ ] Disabled or missing modules have a deliberate blank state instead of broken-looking leftovers.
- [ ] The plan preserves the existing auth/access model while broadening reuse.

**Validation commands**

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
find app/\(workspace\) -maxdepth 3 -type f
find features/course -maxdepth 4 -type f
find features/settings -maxdepth 3 -type f
find features/starter-repo -maxdepth 3 -type f
```

**Notes / decisions**

- The current repo already has a useful workspace skeleton; preserve that strength.
- Product modules should stop defining the repo’s identity.
- A starter without some optional modules still needs to feel finished.

### M5 — Add analytics without weakening observability, and define starter ops surfaces

**Objective**

Introduce a minimal product analytics baseline while preserving the stronger Telegram error/incident pipeline already present, and define the first starter operations surfaces that make the platform understandable to operators.

**Tasks**

1. Treat observability and analytics as separate concerns:
   - observability = failures and operational health,
   - analytics = user behavior and product adoption.
2. Audit existing observability surfaces and identify where analytics should not be mixed into incident handling.
3. Define the first analytics event contract for both public and signed-in flows.
4. Decide whether analytics should start with an internal adapter abstraction before choosing a provider.
5. Identify the smallest useful analytics surfaces for v1:
   - page viewed,
   - CTA clicked,
   - sign-in or sign-up started,
   - onboarding completed,
   - primary workspace action completed,
   - checkout success.
6. Define starter operations surfaces or metadata conventions for:
   - starter settings,
   - integration toggles,
   - module visibility,
   - enabled-feature summary,
   - first-run setup checklist.
7. Decide how Telegram capability is presented so it remains a reusable option without making the starter feel like “this app is about Telegram.”

**Acceptance criteria**

- [ ] Analytics and observability are clearly separated in the plan.
- [ ] A baseline event taxonomy exists.
- [ ] The starter can gain analytics without hardwiring a vendor across the whole repo.
- [ ] Existing Telegram observability remains a reusable platform feature.
- [ ] Starter settings / integration visibility / feature-toggle surfaces are explicitly planned.
- [ ] Messaging-channel capability is presented as optional capability, not starter identity.

**Validation commands**

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
find features/observability -maxdepth 3 -type f
find app/api/observability -maxdepth 3 -type f
rg -n "track|analytics|event|telemetry|observability" app features lib platform convex
```

**Notes / decisions**

- Do not confuse “we need product analytics” with “replace the error pipeline.”
- Start with an event contract and adapter seam before a provider-specific rollout.
- Telegram is a good example of “keep capability, remove identity dominance.”

### M6 — Harden the starter path and rollout strategy

**Objective**

Make the generalized repo safe to evolve and safe to hand off as a starter.

**Tasks**

1. Decide rollout order so existing product behavior keeps working during generalization.
2. Define how to verify both modes during the transition:
   - current Ship-by-Sunday behavior,
   - generalized starter behavior.
3. Plan docs updates for setup, customization, module toggles, analytics setup, blank states, and optional integrations.
4. Decide where the future generated doc-pack layer will attach to the starter.
5. Define what qualifies as “starter-ready” for external reuse.
6. Define cleanup rules for remove-category items so they do not linger forever.
7. Add an explicit recovery plan if the generalization effort creates too much churn.

**Acceptance criteria**

- [ ] The repo has a defined rollout sequence.
- [ ] Existing product behavior is protected during transition.
- [ ] Starter-readiness criteria are explicit.
- [ ] Future generated-doc-pack overlay points are named, even if not fully implemented yet.
- [ ] The cleanup path for remove-category items is explicit.
- [ ] The starter is judged by first-run usability, not just by technical flexibility.

**Validation commands**

```bash
cd /Users/parkerrex/Projects/ship-by-sunday
bun run lint
bun run format:check
bun run test:unit
bun run test:contracts
bun run test:integration
bun run build
```

**Notes / decisions**

- The repo should become a platform in place, not a speculative parallel rewrite.
- Delay large deletion until the configurable path is proven.
- Starter quality includes emotional quality: does it feel reusable on day one?

## Stop-and-fix rule

If a milestone surfaces ambiguity that materially changes architecture, module boundaries, or rollout risk:
1. stop implementation,
2. update this plan,
3. narrow the active milestone,
4. document the new decision,
5. only then continue.

If validation fails during implementation:
1. stop forward progress,
2. diagnose the failure,
3. repair the failure,
4. rerun validation,
5. only then continue.

## Risks and unknowns

- The repo may contain more Ship-by-Sunday assumptions than are visible from route and feature names alone.
- Some “core” systems may be entangled with course-specific concepts such as lesson progression, mission flow, or starter-repo access.
- The public marketing surface may need more restructuring than the internal shell.
- Product analytics can create accidental provider lock-in if added too early without an event contract.
- Future doc-pack integration may pressure the starter toward too much configurability unless strong defaults are preserved.
- Existing tests may assume current product naming and route structure.
- Remove-category cleanup may uncover hidden dependencies on one-off tooling or test fixtures.

## Rollback / escape hatch

If the generalization effort starts destabilizing the working product:

1. stop broad refactors,
2. keep the existing product behavior as the primary path,
3. isolate generalization work behind config flags or new starter-specific modules,
4. land only the documentation, audit, seam-creation, and starter-hygiene work first,
5. defer destructive cleanup until the starter path is verified.
