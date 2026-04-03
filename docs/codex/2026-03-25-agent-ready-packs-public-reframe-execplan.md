---
summary: "Reframes the public product story around Agent-Ready Packs and a Starter Snapshot, replacing the retired course wrapper and private starter-repo narrative. It aligns homepage copy, protected-flow labels, docs, module flags, downloads, and tests to one coherent public contract."
read_when: "Open this when changing public-facing offer language, homepage framing, review/download artifact names, or the visible starter-repo module."
plan_status: "done"
---

# Reframe the public product around Agent-Ready Packs

This is a living execution plan for rewriting the public product story so Ship by Sunday sells the current product truth instead of the retired four-block course wrapper and obsolete starter-repo delivery model. It is written so a fresh coding agent can implement the change end to end without prior chat context, and it must be updated as work proceeds.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this work, a visitor landing on `/`, moving into the protected flow, opening review/download, or reading the shipped docs under `apps/web/content/docs/` should encounter one coherent public story. That story is that Ship by Sunday is an OpenAI-derived, OpenAI-aligned system that turns one product idea into Agent-Ready Packs for design, marketing, and build execution, then generates a final Starter Snapshot. The page and supporting customer-visible surfaces should stop selling a guided sprint, a workshop, a masterclass, a four-block course, or a private starter repo as the core delivery. A human should be able to verify the change by loading the homepage, seeing the new category language, seeing the new durability section, seeing pack-first artifact names on the review/download surfaces, seeing the obsolete starter-repo module disappear from visible product surfaces, and seeing the public docs read consistently with that new story.

## Progress

- [x] 2026-03-25 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, `docs/prompts/execplan-writer.md`, and `docs/prompts/execplan-grill.md` before drafting and refining this plan.
- [x] 2026-03-25 EDT — Inspected the current homepage contract in `apps/web/config/product.ts`, `apps/web/features/marketing/content/home.ts`, `apps/web/features/marketing/lib/home-page-render-model.ts`, `apps/web/features/marketing/components/home-page.tsx`, and the section components under `apps/web/features/marketing/components/home-page/`.
- [x] 2026-03-25 EDT — Inspected the blueprint compiler and review/download flow in `packages/blueprint-compiler/src/stages/stage-definitions.ts`, `packages/blueprint-compiler/src/server/template-loader.ts`, `packages/blueprint-compiler/src/server/rendered-blueprint-tree.ts`, `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts`, `apps/web/features/blueprint-flow/components/blueprint-start-page.tsx`, `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx`, and the download routes under `apps/web/app/api/download/`.
- [x] 2026-03-25 EDT — Grilled the draft plan in chat and resolved the major scope branches: full customer-visible naming pass, hybrid public terminology rule, standardized artifact names, broad shipped-docs alignment, guarantee rewrite without policy change, and disabling the visible `starterRepo` module.
- [x] 2026-03-25 EDT — Completed Milestone 1. Rewrote `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts` around `Agent-Ready Packs` and `Starter Snapshot`, added `apps/web/tests/unit/home-page-content.test.ts`, and updated `apps/web/tests/browser-smoke/app-smoke.spec.ts` to assert the new homepage wording.
- [x] 2026-03-25 EDT — Completed Milestone 2. Added the `durability` section through `apps/web/config/product.ts`, `apps/web/features/marketing/content/home.ts`, `apps/web/features/marketing/lib/home-page-render-model.ts`, `apps/web/features/marketing/components/home-page.tsx`, and `apps/web/features/marketing/components/home-page/durability-section.tsx`; replaced the four-block homepage art with new pack-system SVGs under `apps/web/public/`; and updated `apps/web/content/docs/configure-the-homepage.mdx` plus homepage tests to match the new contract.
- [x] 2026-03-25 EDT — Completed Milestone 3. Added a shared outward-facing artifact contract in `packages/blueprint-compiler/src/public-artifact-contract.ts`, updated review/start/sidebar copy in `apps/web/features/blueprint-flow/components/`, changed download filenames in `apps/web/app/api/download/`, rewrote visible blueprint headings in `packages/blueprint-compiler/src/blueprints/`, and added focused integration and renderer tests for the new naming.
- [x] 2026-03-25 EDT — Completed Milestone 4. Disabled `starterConfig.modules.starterRepo` by default in `apps/web/config/product.ts`, removed the legacy starter-repo module from the visible workspace-home inventory in `apps/web/features/workspace-home/lib/workspace-home-model.ts`, confirmed settings and mission no longer expose the obsolete card path by default, and updated the directly coupled docs entry points plus unit tests to match.
- [x] 2026-03-25 EDT — Completed Milestone 5. Swept `apps/web/content/docs/` for remaining repo-snapshot and starter-repo delivery language, updated the shipped docs entry points that still contradicted the new public story, reran the broader app validation suite, and confirmed the local browser-smoke lane plus production build still pass.

## Surprises & Discoveries

The homepage is structurally cleaner than the copy suggests. `apps/web/config/product.ts` already owns the homepage section order and CTA targets, `apps/web/features/marketing/lib/home-page-render-model.ts` already centralizes behavioral decisions, and `apps/web/features/marketing/components/home-page.tsx` already assembles the top-level sections in one place. The main technical risk is not the shell. The risk is touching the public contract incompletely when adding the new section and renaming customer-visible artifact labels.

The blueprint system is more literal than the old marketing copy suggests. `packages/blueprint-compiler/src/server/template-loader.ts` loads the OpenAI-derived template source files from `docs/openai/*`. `packages/blueprint-compiler/src/server/rendered-blueprint-tree.ts` renders the full `blueprint/` tree from canonical facts. `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts` packages that tree into the review download bundle. The product already justifies a stronger “Agent-Ready Packs” story than the homepage currently tells.

The stale private starter-repo flow is not merely a documentation problem. `apps/web/config/product.ts` still enables `starterConfig.modules.starterRepo` by default. That module still appears in `apps/web/features/settings/components/settings-page.tsx`, `apps/web/features/workspace-home/lib/workspace-home-model.ts`, `apps/web/features/workspace-home/components/workspace-home-setup-cards.tsx`, and `apps/web/features/course/mission/components/mission/mission-extras-row.tsx`. The visible product is therefore still advertising a delivery path the user explicitly says is no longer real.

The hybrid terminology rule matters. The repository uses `blueprint` honestly in technical places such as the protected stage flow, validators, routes, `blueprint/` output tree, and internal blueprint names. The public story can still lead with `Agent-Ready Packs`, but the plan must not force a misleading internal rename of actual blueprint mechanics.

Focused homepage Vitest runs are not portable from the repository root unless the app config is loaded. Running `bunx vitest` from `/Users/parkerrex/Projects/ship-by-sunday` failed with `Cannot find blueprint '@/config/product'`. Running the same focused suite from `/Users/parkerrex/Projects/ship-by-sunday/apps/web` with `--config vitest.config.ts` passed immediately. Future milestone-level homepage checks should use the app-local commands recorded below.

Adding the `durability` section did not require structured-data changes. The homepage JSON-LD currently depends only on organization metadata, FAQ visibility, and whether pricing still routes through checkout. Because the new section is purely explanatory, `apps/web/features/marketing/lib/home-page-structured-data.ts` remained truthful without any schema edits. That made the section insertion smaller than expected once the config, content, render model, assembler, docs, and tests were all updated together.

The Review surface was more misleading than the plan draft implied. `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx` originally rendered the `Product` stage as if it were a downloadable artifact, offered no direct pack-download buttons, and labeled the final bundle as a repo snapshot. Fixing Milestone 3 required reshaping the review cards around actual outward artifacts instead of merely renaming a couple of buttons.

Turning off `starterRepo` in config was not enough on its own. `apps/web/features/workspace-home/lib/workspace-home-model.ts` still rendered a disabled `Starter repo` module row and still counted that obsolete path in the visible module totals. Milestone 4 needed the visible module inventory itself to drop the legacy path, not just the cards that depended on the flag.

The shipped docs sweep was narrower than expected after the earlier milestones. Once the homepage, review flow, and homepage contract doc were updated, the only shipped docs still contradicting the new public story were the docs entry page and the starter architecture overview. No deeper `apps/web/content/docs/` pages still matched the search terms for the retired offer language.

Playwright browser smoke and `next build` cannot share the same working directory at the same time when Playwright is responsible for starting its own local Next server. A first attempt to run them in parallel failed with `Another next build process is already running.` Running the build first and then the browser-smoke lane sequentially succeeded without any product changes.

The final cross-workspace format pass exposed one unrelated-but-real hygiene issue in `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts`. `oxfmt --check` failed on that file even though the product work in this initiative had not edited it yet. Running `oxfmt --write` on that single file cleared the workspace-level format check without changing behavior.

## Decision Log

2026-03-25 — Decision: the public mechanism name is `Agent-Ready Packs`. Rationale: the user explicitly approved it in chat, and it communicates the buyer-visible outcome more clearly than `documentation-driven` or `Blueprint-Driven Development`.

2026-03-25 — Decision: use the hybrid terminology rule. Rationale: homepage offer copy, artifact labels, and download naming should use `Agent-Ready Packs`, but internal and route-adjacent `blueprint` terminology can remain where it names the real protected flow or output tree.

2026-03-25 — Decision: the outward-facing artifact names are `Design Pack`, `Marketing Pack`, `Build Pack`, `Prompt Pack`, and `Starter Snapshot`. Rationale: the artifact stack needs one noun family, and `Starter Snapshot` is a clearer public name for the generated review download than `repo snapshot` or `starter repo`.

2026-03-25 — Decision: preserve the guarantee policy and rewrite only the language. Rationale: the current FAQ and pricing copy make a real business promise; the plan should modernize the wording without inventing a new policy.

2026-03-25 — Decision: add a new top-level homepage section after `whatsInside`, using a code-facing key such as `durability` and a stronger user-facing heading such as “Agents will change. Your packs still work.” Rationale: the durability story is one of the strongest differentiators and deserves its own public surface.

2026-03-25 — Decision: disable and hide the visible `starterRepo` module in this slice, but do not delete its deeper code yet. Rationale: the user says the private starter-repo delivery path is obsolete. Hiding and disabling it restores customer-visible truth immediately while avoiding a larger deletion/refactor project in the same slice.

2026-03-25 — Decision: all shipped docs under `apps/web/content/docs/` that still use stale product language are in scope for alignment. Rationale: a buyer or operator who leaves the homepage should not immediately hit contradictory public docs.

2026-03-25 — Decision: keep Milestone 1 scoped to copy/config truthfulness plus homepage-focused tests, and defer visual replacement plus module visibility changes to later milestones. Rationale: the homepage story could be corrected immediately without widening the diff into asset work or settings/workspace behavior, which kept validation tight and preserved the plan’s milestone boundaries.

2026-03-25 — Decision: move the sprint-path visual asset references into `apps/web/features/marketing/content/home.ts` instead of leaving them hardcoded in `sprint-path-unified-section.tsx`. Rationale: the homepage content layer should own the public asset contract wherever possible, and that keeps future art swaps in the same place as the section copy.

2026-03-25 — Decision: centralize outward-facing artifact labels and filenames in `packages/blueprint-compiler/src/public-artifact-contract.ts`. Rationale: Review UI, stage sidebar download buttons, archive filenames, and generated pack headings all need the same customer-facing contract, and a shared source prevents them from drifting again.

2026-03-25 — Decision: present the `Prompt Pack` on Review as part of the final `Starter Snapshot` instead of inventing a new standalone download route in this slice. Rationale: the current product only exposes separate archive routes for design, marketing, and build. Showing Prompt Pack as included in the final snapshot keeps the visible artifact set truthful without silently expanding API scope.

2026-03-25 — Decision: when `starterRepo` is disabled, remove it from the visible workspace-home module inventory entirely instead of showing it as a disabled module. Rationale: leaving a disabled row still advertises the obsolete delivery path, which conflicts with the goal of removing it from the default customer-visible contract.

2026-03-25 — Decision: keep the shipped-docs sweep search-driven and update only the pages that still contain contradictory public-story language. Rationale: the repo already contains many legitimate uses of “starter” and technical `blueprint` terminology, so the docs pass should remove contradictions without flattening every starter-oriented engineering doc into the public offer language.

## Outcomes & Retrospective

2026-03-25 milestone note: the homepage copy and config layer now lead with `Agent-Ready Packs`, `Prompt Pack`, and `Starter Snapshot` instead of the old guided-sprint framing. The hero, system explanation, FAQ, and pricing include list now describe the pack system truthfully, and a focused homepage content test plus targeted browser smoke assertions lock that wording in place. The main remaining homepage contradiction is visual: the shell still shows the old four-block artwork until Milestone 2 replaces it.

2026-03-25 milestone note: the homepage shell now contains the new `durability` section in the intended order, and the old four-block art has been replaced by pack-system SVGs in both the hero preview and the system explainer. The next remaining public-story gap is downstream naming: Review, download filenames, and generated pack headings still need the outward-facing artifact names from Milestone 3.

2026-03-25 milestone note: the protected review/download surfaces now use `Design Pack`, `Marketing Pack`, `Build Pack`, `Prompt Pack`, and `Starter Snapshot`, and the generated pack headings plus zip filenames match those outward labels. The remaining work is now mostly subtractive: removing the obsolete starter-repo module from visible surfaces and sweeping the shipped docs for stale language.

2026-03-25 milestone note: the obsolete starter-repo delivery path is now off by default and hidden from the visible settings, workspace-home, and mission-adjacent contract. The remaining work is copy cleanup: the shipped docs still need a broader stale-language sweep so a buyer or operator does not hit old repo-snapshot or starter-template framing after leaving the homepage.

2026-03-25 final outcome: the public homepage, the protected review/download flow, the visible module inventory, the docs entry points, and the shipped homepage contract doc now tell one coherent story. The product leads with `Agent-Ready Packs`, includes the `durability` explanation, exposes `Starter Snapshot` as the final handoff, and no longer advertises the obsolete private starter-repo path in the default customer-visible surfaces. The remaining deliberate gap is technical debt only: the deeper `features/starter-repo/` implementation and old starter-repo helper code still exist behind the now-disabled path, which is acceptable for this initiative because the plan explicitly scoped deletion out.

Known likely follow-up at plan creation time: once the visible delivery path is truthful again, a later cleanup slice may fully remove the dormant `starterRepo` module code, tests, and course-era build surfaces that still assume the private repo path. That deletion is intentionally out of scope for this initiative.

## Context and Orientation

In this repository, the public homepage is controlled by three layers. `apps/web/config/product.ts` owns the durable starter config, section order, CTA target types, brand promise, and enabled module flags. `apps/web/features/marketing/content/home.ts` owns the public copy, image asset references, FAQ items, pricing includes, and section-specific content. `apps/web/features/marketing/lib/home-page-render-model.ts` adapts config plus content into the render contract consumed by `apps/web/features/marketing/components/home-page.tsx`.

The current homepage renders these top-level sections in fixed order: `hero`, `sprintPath`, `whatsInside`, `socialProof`, `faq`, `pricing`, and `footer`. The `system` and `pricing` anchors are part of the current smoke-tested contract. Adding a new top-level section is therefore not a copy-only change. It requires updates to the homepage section config, the render model, the page assembler, docs, and tests.

The source of truth for the new public message is not limited to the homepage files. The blueprint compiler and blueprint flow explain what the product actually does. `packages/blueprint-compiler/src/stages/stage-definitions.ts` defines the protected stage sequence. `packages/blueprint-compiler/src/server/template-loader.ts` loads the OpenAI-derived source templates from `docs/openai/`. `packages/blueprint-compiler/src/server/rendered-blueprint-tree.ts` renders the design, marketing, build, and prompt packs from canonical facts. `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts` combines the generated pack files with repo overrides into the final review download bundle. `apps/web/features/blueprint-flow/components/blueprint-start-page.tsx` and `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx` are the visible protected surfaces that explain and deliver that system.

For this plan, “Agent-Ready Pack” means a file-based operating pack that gives an agent durable context in one domain. In this repository, those packs are not vague notes. They are generated files such as `AGENTS.md`, `CHECKLIST.md`, `PLANS.md`, `documentation.md`, and domain prompts under `blueprint/prompts/*`.

For this plan, “Starter Snapshot” means the generated review download bundle returned by `apps/web/app/api/download/repo/route.ts`, currently built by `buildReviewDownloadZip()` and shipped with `content-disposition: starter-repo.zip`. It does not mean the separate old private GitHub starter-repo access workflow. That workflow is now obsolete for this product and must be disabled in visible surfaces.

For this plan, the hybrid terminology rule means this: use `Agent-Ready Packs` and the standardized artifact names in homepage offer copy, review/download labels, shipped docs, and other buyer-facing artifact language. Keep `blueprint` where it names the actual protected flow, output tree, blueprint, or technical contract.

## Plan of Work

Start by making the public message truthful in the copy and config layers only. Update `apps/web/config/product.ts` so the brand promise, metadata description, and homepage preview alt text reflect the new product story, but leave section order and module flags alone until the later milestones that change them. Rewrite `apps/web/features/marketing/content/home.ts` so the hero, step-reduction section, packs section, social-proof framing, FAQ answers, and pricing includes all reflect the Agent-Ready Pack System. Remove the old four-block, workshop, masterclass, course, and private starter-repo language from visible copy in that file in the same pass, and add focused homepage tests that prove the new wording.

Once the content model is stable, add the new `durability` top-level homepage section through the full homepage contract. Add the section key and default visibility to `apps/web/config/product.ts`, add its content to `apps/web/features/marketing/content/home.ts`, teach the render model about it in `apps/web/features/marketing/lib/home-page-render-model.ts`, and render it from `apps/web/features/marketing/components/home-page.tsx`. Implement the view as a new feature-local component such as `apps/web/features/marketing/components/home-page/durability-section.tsx`, keeping it below the repository’s component length limit.

After the new section exists, replace the old four-block visuals and any stale alt text with a pack-system visual. Add new asset files under `apps/web/public/`, point the content layer at them, and update `hero-sections.tsx` and `sprint-path-unified-section.tsx` so the visible art no longer contradicts the copy.

Then align the public artifact names beyond the homepage. Update `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx` so Review describes the new artifact stack and the final Starter Snapshot clearly. Update `apps/web/app/api/download/repo/route.ts` and `apps/web/app/api/download/blueprint/[stage]/route.ts` so customer-visible zip filenames reflect the new outward artifact names. Update the blueprint renderer titles in `packages/blueprint-compiler/src/blueprints/render-design-blueprint.ts`, `render-marketing-blueprint.ts`, `render-build-blueprint.ts`, `render-prompt-pack.ts`, and `render-blueprint-readme.ts` wherever the generated artifact headings are visible to customers.

Next, disable and hide the obsolete `starterRepo` module in visible product surfaces. Set the default module flag off in `apps/web/config/product.ts`. Update `apps/web/features/settings/components/settings-page.tsx`, `apps/web/features/workspace-home/lib/workspace-home-model.ts`, `apps/web/features/workspace-home/components/workspace-home-setup-cards.tsx`, and `apps/web/features/course/mission/components/mission/mission-extras-row.tsx` so the stale module stops appearing. Remove or rewrite homepage and docs copy that still describes private starter-repo delivery as part of the offer. Do not delete the underlying `features/starter-repo/` implementation yet.

Finish with a full shipped-docs sweep under `apps/web/content/docs/`. Update every page that still uses stale offer or delivery language, including the docs entry points and architecture overview pages. Preserve accurate technical `blueprint` terminology where it names the protected stage flow or output tree. Update `apps/web/content/docs/configure-the-homepage.mdx` in the same slice so the new section contract and changed surfaces remain documented.

## Milestones

### Milestone 1 — Re-anchor the homepage content model and default product config

At the end of this milestone, `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts` will stop selling a guided weekend sprint, a course wrapper, or a private starter repo. The hero, pricing, FAQ, metadata, and pack breakdown will all use the new `Agent-Ready Packs` story and the standardized outward artifact names. The visible output may still look familiar, but the words will be materially correct. Success is proven by loading `/` and seeing the new mechanism language everywhere the old story used to dominate, while the CTA path remains intact.

### Milestone 2 — Add the durability section and replace the old four-block visuals

At the end of this milestone, the homepage will contain a new top-level section after `whatsInside` that explains why the packs survive tool churn. The old four-block art and stale alt text will be gone, replaced by a pack-system visual. This milestone touches the homepage control plane, render model, page assembler, and public assets. Success is proven by loading `/` and seeing the new section in the intended order, with no remaining four-block art anywhere in the public homepage shell.

### Milestone 3 — Align visible artifact names across protected review/download and generated pack headings

At the end of this milestone, the review page, pack download route filenames, repo download route filename, and generated customer-visible pack titles will all use the outward artifact set: `Design Pack`, `Marketing Pack`, `Build Pack`, `Prompt Pack`, and `Starter Snapshot`. Technical `blueprint` terms may remain where they name the internal flow or output structure. Success is proven by loading `/review`, observing the new labels, and verifying the download responses use the intended visible filenames.

### Milestone 4 — Disable the obsolete visible starter-repo delivery path

At the end of this milestone, the default config will no longer expose the `starterRepo` module in customer-visible surfaces. Settings, workspace home, mission extras, homepage copy, and any related docs will stop implying that buyers receive a private GitHub starter repo as the main delivery path. The underlying starter-repo code remains in the repository but is no longer part of the visible product contract. Success is proven by loading the visible surfaces and confirming that the starter-repo card and related messaging are absent.

### Milestone 5 — Sweep shipped docs and validate the full public story

At the end of this milestone, the shipped docs under `apps/web/content/docs/` will be aligned with the new public story, the homepage contract doc will explain the new top-level section, and the homepage-focused tests, integration checks, build, and browser smoke lane will pass or be explicitly blocked with evidence. Success is proven by reading the public docs and moving through the homepage plus protected start/review surfaces without hitting contradictory language.

## Concrete Steps

Begin from the repository root and re-read the current homepage, review/download, module, and docs files before editing. Compare the homepage content model, the section assembler, the review/download copy, and the starter-repo module visibility logic.

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,220p' apps/web/config/product.ts
    sed -n '1,260p' apps/web/features/marketing/content/home.ts
    sed -n '1,260p' apps/web/features/marketing/lib/home-page-render-model.ts
    sed -n '1,260p' apps/web/features/marketing/components/home-page.tsx
    sed -n '1,220p' apps/web/features/blueprint-flow/components/blueprint-start-page.tsx
    sed -n '1,260p' apps/web/features/blueprint-flow/components/blueprint-review-page.tsx
    sed -n '1,220p' apps/web/features/settings/components/settings-page.tsx
    sed -n '1,240p' apps/web/features/workspace-home/lib/workspace-home-model.ts

Expected observation: the homepage shell is structurally ready for the new message, while the visible delivery story still leaks the old starter-repo module and the old four-block/course vocabulary.

Next, inspect the blueprint compiler outputs and customer-visible download routes to keep the new artifact names grounded in real outputs.

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,260p' packages/blueprint-compiler/src/stages/stage-definitions.ts
    sed -n '1,260p' packages/blueprint-compiler/src/server/template-loader.ts
    sed -n '1,260p' packages/blueprint-compiler/src/server/rendered-blueprint-tree.ts
    sed -n '1,220p' packages/blueprint-compiler/src/blueprints/render-design-blueprint.ts
    sed -n '1,220p' packages/blueprint-compiler/src/blueprints/render-marketing-blueprint.ts
    sed -n '1,220p' packages/blueprint-compiler/src/blueprints/render-build-blueprint.ts
    sed -n '1,220p' packages/blueprint-compiler/src/blueprints/render-prompt-pack.ts
    sed -n '1,220p' apps/web/app/api/download/repo/route.ts
    sed -n '1,220p' apps/web/app/api/download/blueprint/\[stage\]/route.ts

Expected observation: the internal mechanics justify the new public artifact names even though the internal `blueprint` implementation stays in place.

When implementation begins, first edit `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts`. Change the brand promise, metadata description, section content, FAQ copy, pricing includes, trust line, guarantee wording, and the homepage smoke assertions. Leave default module flags, section order, and visual asset replacement for later milestones.

After the Milestone 1 copy rewrite, run focused homepage validation from `apps/web` instead of the repository root so Vitest picks up `apps/web/vitest.config.ts`.

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/home-page-primary-cta.test.tsx
    PLAYWRIGHT_USE_LOCAL_SERVER=1 bunx playwright test --project=browser-smoke tests/browser-smoke/app-smoke.spec.ts --grep "landing page renders the main offer CTA|homepage renders structured SEO data"

Expected observation: the three focused unit files pass with seven tests, the CTA integration test passes with two tests, and the targeted browser smoke lane confirms the homepage HTML now contains `Turn one product idea`, `Agent-Ready Packs`, `#system`, and `#pricing`.

After the copy rewrite, add the `durability` section through the full homepage contract. Edit `apps/web/config/product.ts`, `apps/web/features/marketing/content/home.ts`, `apps/web/features/marketing/lib/home-page-render-model.ts`, `apps/web/features/marketing/components/home-page.tsx`, and add a new section component such as `apps/web/features/marketing/components/home-page/durability-section.tsx`. Update `apps/web/content/docs/configure-the-homepage.mdx` in the same slice.

Then replace the old art. Add new SVGs or other lightweight public assets under `apps/web/public/`, update the content layer to point to them, and update `hero-sections.tsx` and `sprint-path-unified-section.tsx` so the visible art matches the new pack-system story.

Next, align the visible artifact names and delivery labels. Update `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx`, `apps/web/features/blueprint-flow/components/blueprint-start-page.tsx` where helpful, `apps/web/app/api/download/repo/route.ts`, `apps/web/app/api/download/blueprint/[stage]/route.ts`, and the blueprint renderer files under `packages/blueprint-compiler/src/blueprints/`. Update the integration and browser tests that assert the old labels or filenames.

Then disable the visible starter-repo module. Set `starterConfig.modules.starterRepo` to `false` in `apps/web/config/product.ts`, update settings and workspace-home copy that conditionally mentions starter-repo management, and remove obsolete homepage and docs references to the private repo path. Keep the underlying feature code present; do not delete it in this slice.

Finally, sweep the shipped docs for stale customer-facing language while preserving accurate technical blueprint terminology. Use repository search rather than hand-editing only the obvious entry pages.

    cd /Users/parkerrex/Projects/ship-by-sunday
    rg -n "guided sprint|masterclass|workshop|four-block|CEO Block|starter repo|repo snapshot|blueprint-first starter" apps/web/content/docs apps/web/features/marketing apps/web/features/blueprint-flow

Expected observation: the search gives the exact remaining customer-visible strings to update or explicitly preserve under the hybrid terminology rule.

After edits, run the validation from the repository root.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run lint
    bun run format:check
    bun run test:unit
    bunx vitest run --project integration-ui apps/web/tests/integration-ui/home-page-primary-cta.test.tsx
    bun run build

Expected observation: lint, formatting, unit tests, CTA integration, and production build complete without homepage-, artifact-label-, or starterRepo-visibility regressions.

Then run the smoke lane if the environment is available.

    cd /Users/parkerrex/Projects/ship-by-sunday
    set -a
    source apps/web/.env.local
    set +a
    bun run test:browser-smoke

Expected observation: the public homepage still loads, the `system` and `pricing` anchors still exist, the checkout path still works, and the protected start/review surfaces show the updated visible labels.

## Validation and Acceptance

The change is accepted only when a human can move through the public homepage, the public docs, and the protected start/review surfaces without hitting contradictory language. The homepage must clearly sell the Agent-Ready Pack System and the new outward artifact names. The old four-block, course, workshop, CEO-block, and private starter-repo delivery language must be gone from visible product surfaces.

The homepage must now visibly communicate one canonical intake, Design / Marketing / Build / Prompt packs, the new durability story, and the final Starter Snapshot. The `system` and `pricing` anchors must still exist, and the shared CTA behavior must still route through checkout unless the plan is later revised.

For Milestone 1 specifically, the focused acceptance lane is the app-local homepage suite recorded in `Concrete Steps`: the content contract test, the homepage render-model and structured-data tests, the CTA integration test, and the targeted browser smoke checks for `/` and the JSON-LD block.

The protected review page must use the new outward-facing artifact names. The pack download routes and repo download route must return visible filenames that match the new artifact set. The visible obsolete starter-repo module must be gone from settings, workspace home, mission extras, homepage offer copy, and shipped docs.

At minimum, `bun run lint`, `bun run format:check`, `bun run test:unit`, `bunx vitest run --project integration-ui apps/web/tests/integration-ui/home-page-primary-cta.test.tsx`, `bun run build`, and `bun run test:browser-smoke` with the required environment loaded should pass. If browser smoke cannot run, the implementer must say exactly why and must not present the work as fully verified.

## Idempotence and Recovery

Implement this plan additively. First rewrite the visible copy. Then add the new section. Then replace visuals and align filenames. Then disable the stale module. Then sweep docs. This order makes it safe to stop after any milestone without leaving the product telling a false story.

If the new `durability` section introduces layout or test instability, the safe fallback is to keep the homepage copy rewrite and temporarily gate the new section off in the homepage config while the component is repaired. The existing homepage control plane supports that pattern. Do not keep the old four-block art in place as a fallback once the new copy lands. If the new visual is not ready, use a simpler static illustration or file-tree mock that matches the new story.

If disabling `starterRepo` surfaces reveals unexpected visible dependencies, keep the module flag off, remove the obvious customer-facing copy, and document the remaining hidden dependency as a follow-up instead of re-enabling the stale delivery model. The user has already said that model is obsolete for this product.

If a validation command fails, stop forward progress, capture the failing output in `Surprises & Discoveries`, repair the issue, and rerun the failed command before continuing. If broader repo failures unrelated to this slice already exist, document them explicitly and isolate confidence with the narrowest passing checks available.

## Artifacts and Notes

At execution time, capture a concise before-and-after evidence set. The most useful artifacts will be a screenshot of the new hero, a screenshot of the new durability section, a screenshot of the review page with the new visible artifact labels, a screenshot or HTML proof that the stale starter-repo card is gone from visible surfaces, a short diff of `apps/web/features/marketing/content/home.ts` and `apps/web/config/product.ts`, and the passing output from the homepage- and download-focused validation commands.

Useful success evidence will look like this:

    Homepage hero now says “Agent-Ready Packs” and no longer references a guided sprint or four-block system.
    The section after “What’s inside” explains that the packs remain useful as tools change.
    Review now says “Starter Snapshot” and exposes the renamed pack downloads.
    Settings and workspace-home no longer expose the old starter-repo access workflow.
    Browser smoke still reaches the `#system` and `#pricing` anchors.
    Build completes without homepage-, download-, or module-visibility regressions.

Current recorded evidence from Milestone 1:

    bunx vitest --config vitest.config.ts run --project unit tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    Test Files 3 passed
    Tests 7 passed

    bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/home-page-primary-cta.test.tsx
    Test Files 1 passed
    Tests 2 passed

    PLAYWRIGHT_USE_LOCAL_SERVER=1 bunx playwright test --project=browser-smoke tests/browser-smoke/app-smoke.spec.ts --grep "landing page renders the main offer CTA|homepage renders structured SEO data"
    2 passed
    landing page renders the main offer CTA
    homepage renders structured SEO data

Current recorded evidence from Milestone 2:

    bunx oxlint --deny-warnings config/product.ts features/marketing/components/home-page.tsx features/marketing/components/home-page/durability-section.tsx features/marketing/components/home-page/hero-sections.tsx features/marketing/components/home-page/pricing-footer-sections.tsx features/marketing/components/home-page/home-page-primary-cta.tsx features/marketing/components/home-page/sprint-path-unified-section.tsx features/marketing/content/home.ts features/marketing/lib/home-page-render-model.ts features/marketing/lib/home-page-structured-data.ts tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts tests/integration-ui/home-page-primary-cta.test.tsx tests/browser-smoke/app-smoke.spec.ts
    Found 0 warnings and 0 errors

    bun run build
    Compiled successfully
    Finished TypeScript
    Generating static pages ... 64/64

    PLAYWRIGHT_USE_LOCAL_SERVER=1 bunx playwright test --project=browser-smoke tests/browser-smoke/app-smoke.spec.ts --grep "landing page renders the main offer CTA|homepage renders structured SEO data"
    2 passed
    landing page renders the main offer CTA
    homepage renders structured SEO data

Current recorded evidence from Milestone 3:

    cd /Users/parkerrex/Projects/ship-by-sunday/packages/blueprint-compiler
    bunx vitest --config vitest.config.ts run tests/blueprint-renderers.test.ts
    Test Files 1 passed
    Tests 1 passed

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project integration tests/integration/blueprint-download-routes.test.ts
    Test Files 1 passed
    Tests 3 passed

    bunx vitest --config vitest.config.ts run --project integration-ui tests/integration-ui/blueprint-review-page.test.tsx
    Test Files 1 passed
    Tests 1 passed

    bun run build
    Compiled successfully
    Finished TypeScript
    Generating static pages ... 64/64

Current recorded evidence from Milestone 4:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project unit tests/unit/settings-page.test.tsx tests/unit/workspace-home-model.test.ts tests/unit/workspace-home-page.test.tsx tests/unit/mission-extras-row.test.tsx tests/unit/mission-page.test.tsx
    Test Files 5 passed
    Tests 7 passed

    bunx oxlint --deny-warnings config/product.ts features/settings/components/settings-page.tsx features/workspace-home/lib/workspace-home-model.ts features/workspace-home/components/workspace-home-setup-cards.tsx features/course/mission/components/mission/mission-extras-row.tsx tests/unit/settings-page.test.tsx tests/unit/workspace-home-model.test.ts tests/unit/workspace-home-page.test.tsx tests/unit/mission-extras-row.test.tsx tests/unit/mission-page.test.tsx
    Found 0 warnings and 0 errors

Current recorded evidence from Milestone 5:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bun run test:unit
    Test Files 79 passed
    Tests 303 passed

    bun run test:integration:node
    Test Files 7 passed
    Tests 49 passed

    PLAYWRIGHT_USE_LOCAL_SERVER=1 bunx playwright test --project=browser-smoke tests/browser-smoke/app-smoke.spec.ts
    5 passed
    landing page renders the main offer CTA
    checkout success without a session renders the recovery surface
    homepage renders structured SEO data
    public crawl endpoints expose the indexable surface
    docs pages emit canonical tags and auth pages emit noindex

    bun run build
    Compiled successfully
    Finished TypeScript
    Generating static pages ... 64/64

Final cross-workspace verification after implementation:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run lint
    Found 0 warnings and 0 errors.

    bun run format:check
    All matched files use the correct format.

    cd /Users/parkerrex/Projects/ship-by-sunday/packages/blueprint-compiler
    bun run lint
    Found 0 warnings and 0 errors.

    bun run format:check
    All matched files use the correct format.

    bun run test
    Test Files 5 passed
    Tests 15 passed

If the final implemented copy differs from the exact phrasing in this plan, record the shipped wording here so later contributors know what actually went live.

## Interfaces and Dependencies

`apps/web/config/product.ts` must continue to own the homepage section order, CTA target types, default module flags, and brand promise. This file must gain the new `durability` section key, must disable the visible `starterRepo` module by default, and must expose any new hero visual asset references needed by the content layer.

`apps/web/features/marketing/content/home.ts` remains the single content source for homepage copy and assets. The new `Agent-Ready Packs` story, the standardized outward artifact names, the new durability content, the rewritten FAQ answers, the pricing includes, and the starter-repo removal from offer copy must all land there rather than being scattered across components.

`apps/web/features/marketing/lib/home-page-render-model.ts` must remain the behavioral seam that translates config plus content into the render contract. The new section must be modeled here instead of adding ad hoc branching directly inside `apps/web/features/marketing/components/home-page.tsx`.

`apps/web/features/marketing/components/home-page.tsx` must remain the single assembler of top-level homepage sections. If the section order changes, this file, the render model, and the homepage config must stay in sync.

`apps/web/features/marketing/lib/home-page-structured-data.ts` must stay truthful to the visible page. If the metadata description, product description, or visible section set changes, this file and its tests must be updated in the same slice.

The blueprint-system grounding files under `packages/blueprint-compiler/` are in scope only for customer-visible artifact names and headings. Internal `blueprint/` paths, validators, blueprint names, and route names are not in scope for renaming under the hybrid terminology rule.

`apps/web/app/api/download/repo/route.ts` and `apps/web/app/api/download/blueprint/[stage]/route.ts` are in scope because the visible zip filenames are part of the customer-facing delivery contract.

The visible starter-repo surfaces under `apps/web/features/settings/`, `apps/web/features/workspace-home/`, and `apps/web/features/course/mission/` are in scope because the user explicitly says the old private starter-repo delivery model is obsolete. The deeper `features/starter-repo/` implementation and its tests remain out of scope for deletion in this slice.

The homepage-focused tests under `apps/web/tests/unit/`, `apps/web/tests/integration-ui/`, `apps/web/tests/integration/`, and `apps/web/tests/browser-smoke/` are required dependencies because this is a public-surface, artifact-label, and visible-module change with real checkout and download implications.
