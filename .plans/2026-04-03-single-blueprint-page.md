---
summary: Collapse the protected founder intake from Start/Product/Design/Marketing/Build Plan into one canonical `/blueprint` page plus `/review`, while preserving the reduced blueprint fact contract, the existing problem-statement optimizer, CLI generation, and review/download behavior. Replace the old stage routes with compatibility redirects and remove the obsolete stage-shell code that no longer matches the product.
read_when: Open this when implementing the single-page blueprint intake, legacy route redirects, CLI alignment, and review-preserving migration away from the current multi-stage workspace funnel.
plan_status: done
---
# Collapse the blueprint funnel to `/blueprint` and `/review`

This is a living execution plan for replacing the current multi-page founder funnel with one combined Blueprint workspace page plus the existing Review page, without losing the reduced blueprint contract, the download path, or the local CLI.

Maintain this ExecPlan in accordance with `.plans/PLANS.md` so a fresh coding agent can resume from this file alone.

## Purpose / Big Picture

Today an entitled founder still bounces through `/start`, `/product/[stepId]`, `/design/[stepId]`, `/marketing/[stepId]`, `/build-plan/[stepId]`, and then `/review`, even though the saved blueprint contract is already small enough to fit on one page. After this change, the protected product experience should feel like a normal operating surface: the user lands on `/blueprint`, sees one combined form with clear sections, uses one primary save-and-continue action to reach `/review`, and downloads the same Ship Kit they get today. The visible proof is straightforward: `/blueprint` becomes the canonical protected entry, the old stage routes only redirect to `/blueprint` anchors or `/review`, the `problem_statement` Optimize button still works, the review download CTA still works, and the CLI plus QA/docs surfaces stop pretending that Product, Design, Marketing, and Build Plan are still separate canonical stages.

## Progress

- [x] 2026-04-03 17:54 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `packages/blueprint-compiler/AGENTS.md`, `qa/AGENTS.md`, `.plans/PLANS.md`, the existing reduced-blueprint ExecPlan, and inspected the current web, compiler, CLI, docs, and QA code paths that this migration touches.
- [x] 2026-04-03 18:05 EDT — Completed a local grill pass against the live route, CLI, and review/download code. No blocker remained after repo inspection, so the plan now proceeds on the explicit assumptions that `/blueprint` and `/review` are the only canonical protected surfaces, old stage routes become compatibility redirects, and the combined page keeps the current explicit save-and-continue behavior.
- [x] 2026-04-03 18:18 EDT — Replaced the shared stage contract with `blueprint` plus `review`, added `routeConfig.blueprint`, removed obsolete Convex save-stage validators, and moved the canonical protected entry away from `/start`.
- [x] 2026-04-03 18:23 EDT — Built the combined `/blueprint` page, added the page-level draft hook, preserved the optimizer and generated-scope omission rule, and converted the old staged route files into explicit compatibility redirects.
- [x] 2026-04-03 18:27 EDT — Simplified Review blocker links to `/blueprint` anchors, updated adjacent workspace navigation and checkout recovery, and deleted the dead staged page shell files that no longer match the product.
- [x] 2026-04-03 18:33 EDT — Aligned the CLI, route-map docs, CLI docs, QA journeys, coverage, inventory, and QA pack command list with the `/blueprint` plus `/review` contract.
- [x] 2026-04-03 18:36 EDT — Ran the targeted and broad validation sequence, captured evidence below, and left the only remaining gap as unrun live authenticated browser proof because no local browser target was declared for this turn.

## Surprises & Discoveries

`packages/blueprint-compiler/src/stages/stage-definitions.ts` already reduced Marketing to a zero-field preview step, and `apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx` already renders a `GeneratedPreviewCard` whenever a step has no fields. That means the user-visible “Marketing is compiler-owned preview” behavior already exists; the remaining problem is route shell and navigation complexity, not missing preview logic.

`apps/web/app/api/download/` now contains only `repo/route.ts`. The old per-pack download routes are already gone, so this migration does not need to preserve separate design, marketing, or build downloads. Review only has to keep `/api/download/repo` working.

The old route names are still baked into a wide blast radius. `apps/web/config/product.ts`, `apps/web/proxy.ts`, `apps/web/features/product-access/server/product-access.ts`, `apps/web/features/checkout/components/checkout-success-view.tsx`, `apps/web/features/course/shared/components/app-shell/*`, `apps/web/content/docs/route-map.mdx`, `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, `qa/scripts/run-pack.mjs`, and the Playwright/browser tests all still treat `/start` and the staged routes as canonical product surfaces.

The CLI already speaks the reduced fact contract, but it still exposes `product`, `design`, `marketing`, and `build-plan` as if those were still real stages. The core drift is in `packages/ship-by-sunday-cli/src/field-contract.ts`, `parse-cli-command.ts`, `resume-command.ts`, and the help text, not in the generator contract itself.

The first draft of the new page-level save hook almost regressed the generated-scope contract. `buildStageDraftValues()` materializes derived `scope_in` and `scope_out` text even when Convex facts omit those keys, so a naive page-level save would have written those generated defaults back as user-authored values. The final hook now strips those fields when the saved baseline still matches the generated draft.

`qa:validate` failed once even after the CSV edits because the inventory no longer matched the renamed and deleted tests. Running `bun run qa:inventory:sync` after the route/test migration was necessary to make the QA control plane truthful again.

## Decision Log

Decision: Make `/blueprint` the only canonical protected intake route and keep `/review` as the only canonical post-intake route.

Rationale: The product goal is one combined Blueprint page plus Review. Keeping `/start` or the stage-entry routes canonical would preserve the very complexity this change is supposed to remove.

Date/Author: 2026-04-03 / Codex

Decision: Convert `/start`, `/product`, `/product/[stepId]`, `/design`, `/design/[stepId]`, `/marketing`, `/marketing/[stepId]`, `/build-plan`, and `/build-plan/[stepId]` into compatibility redirects that land on `/blueprint` with an appropriate section anchor, not into shadow pages that still render old UI.

Rationale: This preserves bookmarks, stale auth redirects, old QA entry points, and any external links while keeping the runtime honest. Redirect pages are useful compatibility surfaces; duplicate rendered pages are not.

Date/Author: 2026-04-03 / Codex

Decision: Fold the current Start framing and the generated marketing preview into `/blueprint`, and keep `/review` download-focused.

Rationale: `docs/ship-by-sunday/design-pack/surfaces/app-surface.md` says product UI should start from the working surface, not a hero. The current Start page is a kickoff shell, and the current Marketing page is already generated preview only. The cleanest single-page version is one operational Blueprint page with a top overview/video panel and a final generated-preview section before Review.

Date/Author: 2026-04-03 / Codex

Decision: Collapse the shared stage contract to two stages, `blueprint` and `review`, but keep ordered step definitions inside the `blueprint` stage to drive section order, sidebar grouping, CLI prompts, and legacy redirect anchors.

Rationale: One real intake page still needs stable section ordering. Reusing ordered step definitions avoids inventing a second grouping system while deleting the fake multi-stage route shell.

Date/Author: 2026-04-03 / Codex

Decision: Preserve the current manual-save interaction model, but move it from per-route-step save to one page-level “Continue to Review” save boundary.

Rationale: `apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts` already supports partial saves, field-level validation reveal, contact email prefilling, untouched generated scope omission, optimistic Convex writes, and unsaved-change protection. The user asked for a faster route model, not a second state-management rewrite.

Date/Author: 2026-04-03 / Codex

Decision: Keep the first `problem_statement` optimizer unchanged in capability and keep it on the combined page.

Rationale: The existing optimizer is already implemented, already uses the managed Codex login flow, and the approved outline explicitly says it must survive the collapse.

Date/Author: 2026-04-03 / Codex

Decision: Make `blueprint` the canonical CLI stage and treat `product`, `design`, and `build-plan` as optional short-lived compatibility aliases only if removing them immediately would break existing local automation.

Rationale: The CLI must stop advertising fake stages, but a thin parser alias is a cheap risk reducer while help text, docs, and human usage switch to `blueprint`.

Date/Author: 2026-04-03 / Codex

Decision: Keep deprecated CLI stage aliases only at the parser boundary and normalize them immediately to `blueprint`.

Rationale: This preserves lightweight local automation compatibility without letting help text, stage listings, JSON output, or readiness reporting keep advertising fake canonical stages.

Date/Author: 2026-04-03 / Codex

## Outcomes & Retrospective

Implemented. The protected workspace is now smaller and more truthful: one Blueprint page gathers the whole reduced contract, one Review page stays focused on readiness and download, and the old staged URLs survive only as compatibility redirects into `/blueprint` anchors or `/review`.

The route and readiness contract is now consistent across compiler, Convex, web, CLI, docs, and QA. The old staged page shell files are gone. The CLI now reports `blueprint` plus `review` canonically, but parser-level aliases still normalize legacy stage names to `blueprint` so local scripts do not fail abruptly.

The remaining gap is browser execution against a real local-auth environment. The plan required `PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:local-auth:default-ship`, but no live local target or authenticated env was declared in this turn, so the implementation stops at dry-run QA plus the static/integration proof surfaces.

## Context and Orientation

The current protected funnel is driven by shared stage definitions in `packages/blueprint-compiler/src/stages/stage-definitions.ts`. Those stage definitions feed readiness in `packages/blueprint-compiler/src/readiness/evaluate-blueprint-readiness.ts` and `packages/blueprint-compiler/src/readiness/derive-stage-status.ts`. The web app reads that shared contract through `apps/web/convex/blueprint/stageReadiness.ts`, the route helpers in `apps/web/features/blueprint-flow/lib/blueprint-stage-routes.ts`, and the server route loader in `apps/web/features/blueprint-flow/server/blueprint-stage-route-data.ts`. The UI then renders either `blueprint-start-page.tsx`, `blueprint-stage-page.tsx`, or `blueprint-review-page.tsx` depending on which route the user opened.

The reduced blueprint fact contract is already in place. The founder-authored required keys are `product_name`, `product_summary`, `primary_user`, `problem_statement`, `problem_trigger`, `problem_severity`, `success_looks_like`, `core_flow`, and `pricing`. `theme_hex` is defaulted but editable. `design_references`, `scope_in`, `scope_out`, `domain`, and `contact_email` are optional. `packages/blueprint-compiler/src/canonical-project-definition/derived-blueprint-facts.ts` already derives the broader legacy/output fields that the renderers and starter overrides still need.

The current page-save behavior is centered on `apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts`. That hook keeps a local draft buffer only while the user is editing, prefills `contact_email` from Clerk when possible, strips untouched generated scope fields before save, uses optimistic Convex writes, and only reveals validation when the user presses Continue. Preserve those good behaviors. Do not replace them with uncontrolled autosave or a second source of truth.

The review and download path is already simpler than the intake shell. `apps/web/app/api/download/repo/route.ts` is the only remaining download route. `apps/web/features/blueprint-flow/server/downloads.ts` creates the canonical project definition and hands it to `@manmeetsai/blueprint-compiler/server` for the starter snapshot zip. The review surface in `apps/web/features/blueprint-flow/components/review/` is therefore worth preserving, but its blocker UI must stop assuming that each pack still corresponds to a separate stage route.

The local CLI is structurally parallel to the web flow. `packages/ship-by-sunday-cli/src/field-contract.ts` defines stage groupings and readiness, `prompt-stage.ts` and `stage-prompt-session.ts` walk a user through interactive entry, `next-command.ts` and `review-command.ts` report progress, and `generate-command.ts` still turns the reduced facts into the same starter snapshot. The CLI must stay aligned with the web model so both agree on what “review-ready” means.

The route blast radius is wide enough that a novice should treat route migration as a product-wide contract change, not a local page edit. `apps/web/config/product.ts`, `apps/web/proxy.ts`, the checkout-success redirect logic, sign-in fallback redirects, the app-shell workspace links, `apps/web/content/docs/route-map.mdx`, the Playwright specs, and the QA control plane all reference the current canonical workspace routes.

The current protected route tree is:

    apps/web/app/(workspace)/
      start/page.tsx
      product/page.tsx
      product/[stepId]/page.tsx
      design/page.tsx
      design/[stepId]/page.tsx
      marketing/page.tsx
      marketing/[stepId]/page.tsx
      build-plan/page.tsx
      build-plan/[stepId]/page.tsx
      review/page.tsx
      execute/page.tsx
      settings/page.tsx
      mission/page.tsx
      artifacts/page.tsx

The target protected route tree after this change should be:

    apps/web/app/(workspace)/
      blueprint/page.tsx                      # canonical combined intake page
      review/page.tsx                         # canonical review/download page
      start/page.tsx                          # redirect to /blueprint
      product/page.tsx                        # redirect to /blueprint#foundation
      product/[stepId]/page.tsx               # redirect to mapped /blueprint#<section>
      design/page.tsx                         # redirect to /blueprint#design
      design/[stepId]/page.tsx                # redirect to /blueprint#design
      marketing/page.tsx                      # redirect to /blueprint#generated-preview
      marketing/[stepId]/page.tsx             # redirect to /blueprint#generated-preview
      build-plan/page.tsx                     # redirect to /blueprint#pricing
      build-plan/[stepId]/page.tsx            # redirect to mapped /blueprint#pricing or #setup
      execute/page.tsx
      settings/page.tsx
      mission/page.tsx
      artifacts/page.tsx

Inside the new `/blueprint` page, use these stable section ids because they also power redirects, sidebar links, and QA assertions: `foundation`, `problem`, `outcome`, `design`, `pricing`, `setup`, and `generated-preview`. The top overview/video block can have its own `overview` id for in-page navigation, but the required answer groups should use the section ids listed above.

The feature-local component tree should move away from misleading “stage page” naming. The current page components are:

    apps/web/features/blueprint-flow/components/
      blueprint-start-page.tsx
      blueprint-stage-page.tsx
      blueprint-stage-sidebar.tsx
      blueprint-stage-step-card.tsx
      blueprint-stage-step-field.tsx
      blueprint-review-page.tsx

The target tree should be closer to:

    apps/web/features/blueprint-flow/
      components/
        blueprint-page.tsx
        blueprint-page-overview.tsx
        blueprint-page-section-card.tsx
        blueprint-page-progress-sidebar.tsx
        blueprint-page-save-bar.tsx
        blueprint-stage-step-field.tsx        # reusable field renderer kept if still truthful
        blueprint-problem-statement-optimizer.tsx
        review/
          blueprint-review-page.tsx
          blueprint-review-checkpoint-card.tsx
          blueprint-review-artifact-grid.tsx
          blueprint-review-download-bridge.tsx
      hooks/
        use-blueprint-page-state.ts
      lib/
        blueprint-page-sections.ts
        blueprint-page-routes.ts
        legacy-blueprint-route-redirects.ts
        blueprint-field-optimizer.ts
        blueprint-workspace-types.ts

Do not keep a single monolithic `blueprint-page.tsx` that grows beyond 150 lines. The top-level page should orchestrate composition; section rendering, sidebar progress, overview/media, and save footer should live in smaller feature-local components.

## Plan of Work

Start by changing the shared route contract, not the JSX. The compiler, Convex workspace state, route config, and resume logic must stop reporting fake stages before the UI can be made truthful. That means introducing a canonical `blueprint` route in `apps/web/config/product.ts`, changing `BlueprintStageId` to `blueprint | review`, and reducing the shared stage list to one real editable stage whose steps are the combined page sections.

Once the shared contract is truthful, build the new `/blueprint` page by reusing what is still good from the current route workbench. Keep the current field renderer, the problem optimizer, the helper text, the contact-email prefill, the generated-scope omission rule, and the optimistic save pattern. Replace only the false assumptions: there is no longer a separate Start page, there are no longer per-step routes, and there is no longer a separate marketing form stage.

After `/blueprint` works, simplify `/review` so it talks about one blueprint page feeding multiple generated packs instead of multiple stage pages feeding those packs. The review blocker UI should link back to `/blueprint` anchors grouped by missing section, not to dead stage routes. Update every adjacent app surface that opens “the workspace” or “a blueprint stage” so it now points to `/blueprint`, `/review`, or a `/blueprint#section` anchor.

Then align the CLI, docs, and QA control plane. The CLI should no longer advertise stage names that the web app no longer has. The route-map docs and local QA docs must stop naming `/start`, `/product`, `/design`, `/marketing`, and `/build-plan` as canonical protected surfaces. The QA journeys, coverage rows, test inventory, and default pack commands must all reflect the new flow so release evidence remains truthful.

Only after the new route, page, review, CLI, docs, and tests are green should the old stage-shell rendering code be deleted. Redirect stubs can remain, but dead page components, dead route helpers, and stage-specific nav logic should be removed once there is no test or runtime dependency on them.

## Milestones

### Milestone 1 — Replace the shared stage and route contract with `blueprint` plus `review`

At the end of this milestone, the shared compiler contract, Convex workspace state, and route config all agree that there are only two canonical protected stages: `blueprint` and `review`. `packages/blueprint-compiler/src/stages/stage-definitions.ts` should describe one editable `blueprint` stage whose steps are the combined-page sections. `packages/blueprint-compiler/src/readiness/*.ts`, `apps/web/convex/blueprint/stageReadiness.ts`, `apps/web/config/product.ts`, `apps/web/proxy.ts`, and `apps/web/features/workspace-navigation/lib/post-review-destination.ts` should all use that truth. Success is visible when any code that asks for the first incomplete stage now gets `blueprint` or `review`, and the canonical workspace URL constants point to `/blueprint` and `/review` rather than `/start` or the old staged routes.

### Milestone 2 — Build the combined `/blueprint` page with preserved save semantics and optimizer behavior

At the end of this milestone, `/blueprint` renders one combined operating surface with the overview/video block, the seven ordered sections, a section-aware progress/sidebar model, and one primary save-and-continue action that navigates to Review only when the required answers are complete. `apps/web/features/blueprint-flow/components/blueprint-page.tsx` and its supporting components should replace the old start/stage page shell. `apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts` should preserve the current draft/save behavior, including `contact_email` prefilling, untouched generated scope omission, field-error reveal on continue, and optimistic Convex updates. The `problem_statement` Optimize button should still appear inside the Problem section and still write the optimized text into the current draft. Success is visible when a founder can fill the whole reduced contract on one page, save partial work, get focused validation, and move to `/review` from a single button.

### Milestone 3 — Add compatibility redirects and simplify review plus adjacent navigation

At the end of this milestone, the legacy workspace routes no longer render old UI; they only redirect to `/blueprint` anchors or `/review`. The canonical review surface no longer links to fake stage pages when blocked. `apps/web/app/(workspace)/start/page.tsx`, the old stage route files, `apps/web/features/blueprint-flow/lib/review-artifacts.ts`, `apps/web/features/execute-ship/lib/execute-ship-tracks.ts`, `apps/web/features/course/shared/components/app-shell/*`, `apps/web/features/checkout/components/checkout-success-view.tsx`, and similar callers should now point to `/blueprint`, `/review`, or `/blueprint#section`. Success is visible when old deep links still land somewhere useful, but every new user-facing CTA and navigation item points to the new canonical surfaces.

### Milestone 4 — Align the local CLI, docs, and QA control plane with the collapsed blueprint model

At the end of this milestone, the CLI, product docs, and QA files all describe a `blueprint` plus `review` world. `packages/ship-by-sunday-cli/src/field-contract.ts`, `parse-cli-command.ts`, `resume-command.ts`, `next-command.ts`, `review-command.ts`, and the help catalog should expose `blueprint` as the editable stage and stop presenting `product`, `design`, `marketing`, and `build-plan` as canonical. `apps/web/content/docs/route-map.mdx`, `apps/web/content/docs/ship-by-sunday-cli.mdx`, `qa/README.md`, `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, and `qa/scripts/run-pack.mjs` should describe and validate the new route model. Success is visible when `bun run sbs stages` reports `blueprint` and `review`, and the QA/docs language matches the actual protected routes.

### Milestone 5 — Remove dead stage-shell code and prove the full funnel end to end

At the end of this milestone, there is no dead route-shell rendering code left for Start/Product/Design/Marketing/Build Plan, the compatibility redirect surfaces are the only remaining legacy route implementations, and the broad validation stack is green. The touched systems include the now-unused page components and route helpers, the renamed or replaced tests, and the QA pack commands. Success is visible when the full test and build suite passes, the repo-wide diff no longer contains unused stage-page implementations, and the only surviving references to old canonical stage routes are intentional redirects, historical docs, or QA evidence notes.

## Concrete Steps

1. Freeze the canonical route map first. Read `packages/blueprint-compiler/src/stages/stage-definitions.ts`, `packages/blueprint-compiler/src/readiness/evaluate-blueprint-readiness.ts`, `packages/blueprint-compiler/src/readiness/derive-stage-status.ts`, `apps/web/config/product.ts`, `apps/web/features/blueprint-flow/lib/blueprint-stage-routes.ts`, and `apps/web/features/workspace-navigation/lib/post-review-destination.ts` together, then replace the shared stage ids with `blueprint` and `review`. The `blueprint` stage should keep the ordered section steps `foundation`, `problem`, `outcome`, `design`, `pricing`, `setup`, and `generated-preview`. Do not leave `product`, `design`, `marketing`, or `build-plan` in the canonical shared stage union.

    cd /Users/parkerrex/Projects/ship-by-sunday
    rg -n 'routeConfig\.(start|product|design|marketing|buildPlan)|"start"|"product"|"design"|"marketing"|"build-plan"' apps/web packages/ship-by-sunday-cli packages/blueprint-compiler qa

Expected observation: many hits across config, nav, resume logic, tests, docs, and QA. Use this search as the migration checklist, not as a reason to keep the old model.

2. Before touching `apps/web/convex/**`, read `apps/web/convex/_generated/ai/guidelines.md`. Then simplify the workspace-state contract. Update `apps/web/convex/blueprint/projectDefinition.ts` so `saveProjectDefinitionFacts` no longer accepts a fake old-stage id. Either remove the `stageId` argument entirely or replace it with the truthful literal `blueprint`; do not keep obsolete `product | design | marketing | build-plan` validators. After changing Convex function signatures, sync generated API types the normal hosted-dev way.

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bun run dev:convex

Expected observation: Convex syncs cleanly, updates `_generated/api`, and the app compiles against the new mutation/query signatures.

3. Introduce the new canonical page route before deleting the old pages. Add `apps/web/app/(workspace)/blueprint/page.tsx`, load the same authenticated workspace state there, and compose a new `BlueprintPage` component under `apps/web/features/blueprint-flow/components/`. Split the page into small feature-local pieces: overview/media, section list, progress sidebar, save bar, and section cards. Reuse `BlueprintStageStepField` and the optimizer where the names remain truthful; do not keep a giant all-in-one component.

    cd /Users/parkerrex/Projects/ship-by-sunday
    find apps/web/features/blueprint-flow -maxdepth 3 -type f | sort

Expected observation: after implementation, the feature folder should contain `blueprint-page*` components and a page-state hook. `blueprint-start-page.tsx` and `blueprint-stage-page.tsx` should either be gone or reduced to redirect-only support code.

4. Rebuild the save state around one page-level draft buffer. Replace `use-blueprint-stage-step-state.ts` with a new page-level hook or a clearly adapted equivalent that still does four critical things: uses live Convex facts as the pristine baseline, keeps only a local draft buffer while the user is editing, strips untouched generated `scope_in` and `scope_out` values before save, and only reveals validation when the user presses the primary save-and-continue action. Keep the `problem_statement` optimizer writing into the local draft, not directly into Convex.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd apps/web test:unit -- tests/unit/use-blueprint-page-state.test.ts tests/unit/blueprint-problem-statement-optimizer.test.tsx tests/unit/blueprint-step-save-feedback.test.ts

Expected observation: the new hook tests prove that live Convex updates reset clean drafts but do not clobber dirty edits, untouched generated scope fields are omitted from the save payload, and pressing Continue focuses the first missing required field.

5. Add a single explicit legacy redirect map and use it everywhere. Create one feature-local mapping module that turns old routes into `/blueprint` anchors. The minimum mapping is `/start -> /blueprint`, `/product` and `/product/foundation -> /blueprint#foundation`, `/product/problem -> /blueprint#problem`, `/product/outcome -> /blueprint#outcome`, `/design` and any design step -> /blueprint#design, `/marketing` and `/marketing/preview -> /blueprint#generated-preview`, `/build-plan` and `/build-plan/delivery -> /blueprint#pricing`, and `/build-plan/setup -> /blueprint#setup`. Make the old route files call that mapping instead of rendering old UI.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx tests/integration-ui/legacy-blueprint-route-redirects.test.tsx

Expected observation: `/blueprint` renders the combined page, `/review` still renders the review handoff, and the legacy URLs redirect to the right anchors instead of rendering old shells.

6. Simplify the review surface so its blocker logic matches the new route truth. `apps/web/features/blueprint-flow/components/review/blueprint-review-checkpoint-card.tsx` should show one general “Return to Blueprint” path plus section-level blocker links. `apps/web/features/blueprint-flow/lib/review-artifacts.ts` should stop storing fake `stageRoute` values tied to dead stages. Artifact summaries can remain informational, but blocker navigation should target `/blueprint#<section>`.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd apps/web test:integration -- tests/integration/blueprint-download-routes.test.ts

Expected observation: review still exposes the same Ship Kit download CTA, blocked review entry still sends the user back to the first incomplete canonical destination, and there are no UI links that imply separate design, marketing, or build-plan pages still exist.

7. Align the local CLI after the web contract is truthful. Update `packages/ship-by-sunday-cli/src/field-contract.ts` so `CliBlueprintStageId` becomes `blueprint | review` canonically, with the combined page sections as blueprint steps. Update `parse-cli-command.ts`, `command-catalog.ts`, `resume-command.ts`, `next-command.ts`, and prompt helpers so the human-facing contract says “blueprint” and “review”. If you keep deprecated `product`, `design`, or `build-plan` aliases for one release, implement them only in the parser and emit a deprecation notice; do not leave them in help, JSON schema descriptors, or `stages` output.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd packages/ship-by-sunday-cli test

Expected observation: CLI tests prove that `stages`, `next`, `review`, and the interactive prompt all report the `blueprint` stage as the only editable canonical stage, and generation still works from the same reduced facts.

8. Update the truth surfaces that describe or verify the route model. At minimum, update `apps/web/content/docs/route-map.mdx`, `apps/web/content/docs/ship-by-sunday-cli.mdx`, `qa/README.md`, `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, and `qa/scripts/run-pack.mjs`. Replace old claims about the staged funnel with the new combined-page contract, and swap the default integration-ui proof suite to the renamed combined-page tests.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run qa:validate

Expected observation: QA validation passes and the control plane no longer describes `/start`, `/product`, `/design`, `/marketing`, or `/build-plan` as canonical protected surfaces.

9. Run the final broad validation only after the targeted checks are green. The broad gate should include the root web checks required by `AGENTS.md`, the CLI plus compiler checks, and the narrowest safe QA/browser proof available for the branch.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run sbs:check
    bun run lint
    bun run format:check
    bun run typecheck
    bun run build
    bun run qa:run-pack -- --pack=default_ship --dry-run

Expected observation: the web app, CLI, and compiler all pass their static and test gates, and the QA pack dry-run reflects the updated `/blueprint` plus `/review` contract.

10. If a safe local authenticated browser environment is available, finish with the protected-flow smoke that now matters most.

    cd /Users/parkerrex/Projects/ship-by-sunday
    PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:local-auth:default-ship

Expected observation: the entitled user lands on `/blueprint`, legacy stage URLs redirect to `/blueprint` anchors, Review still exposes the Ship Kit download, and checkout-success recovery lands on `/blueprint` instead of `/start`. If this environment is not available, record the exact blocker in this plan and do not claim manual browser proof.

## Validation and Acceptance

This change is acceptable only when an entitled member lands on `/blueprint` as the canonical protected entry, not on `/start`, and sees one combined blueprint workspace with the reduced fact contract. The page must show the overview/video block, the required sections, the defaulted `theme_hex`, the optional `design_references`, `scope_in`, `scope_out`, `domain`, and `contact_email`, and the generated-preview section that replaces Marketing as a separate stop.

The save interaction must remain truthful. Typing on `/blueprint` should update only the local draft until the user presses the primary save-and-continue action. Pressing that action should save partial work, reveal missing-field guidance, and focus the first missing required field if the blueprint is incomplete. When the required fields are complete, the same action should take the user to `/review`. The `problem_statement` Optimize control must still work from the combined page and must still rely on the existing managed Codex connection flow.

The compatibility behavior must also be visible. `/start` must redirect to `/blueprint`. `/product/problem`, `/design/references`, `/marketing/preview`, and `/build-plan/setup` must redirect to the matching `/blueprint` anchor. `/review` must remain the canonical review/download surface, and a blocked direct visit to `/review` must redirect back to `/blueprint`, not to a dead stage route.

Review/download is still a release gate. `/review` must keep the Ship Kit download CTA, `/api/download/repo` must still return the starter snapshot, and the generated output must still contain `docs/README.md`, `docs/facts/project-definition.json`, `docs/design/`, `docs/marketing/`, `docs/build/`, `docs/prompts/`, `apps/web/config/product.ts`, and `apps/web/features/marketing/content/home.ts` inside the generated snapshot.

The CLI acceptance bar is: `bun run sbs stages` exposes `blueprint` and `review` as the canonical stages, `bun run sbs next` reports `blueprint` until the draft is review-ready, `bun run sbs review --json` agrees with the web review readiness, and `bun run sbs generate --out ./tmp/... --dry-run --json` still succeeds from a review-ready draft.

Before marking the work done, run these checks in order and record the result in this plan:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd packages/blueprint-compiler test
    bun run --cwd packages/ship-by-sunday-cli test
    bun run --cwd apps/web test:unit
    bun run --cwd apps/web test:integration
    bun run qa:validate
    bun run sbs:check
    bun run lint
    bun run format:check
    bun run typecheck
    bun run build

If a safe browser environment exists, add the local-auth default-ship Playwright run after the targeted tests. If it does not, say exactly why and leave that limitation in `Progress` and `Artifacts and Notes`.

Actual validation status for this implementation:

    PASS  bun run --cwd packages/blueprint-compiler test
    PASS  bun run --cwd packages/ship-by-sunday-cli test
    PASS  bun run --cwd apps/web test:unit
    PASS  bun run --cwd apps/web test:integration
    PASS  bun run qa:validate
    PASS  bun run sbs:check
    PASS  bun run lint
    PASS  bun run format:check
    PASS  bun run typecheck
    PASS  bun run build
    PASS  bun run qa:run-pack -- --pack=default_ship --dry-run

    NOT RUN  PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:local-auth:default-ship
    Reason: no authenticated local browser target was declared or booted in this turn, so there was no safe environment for end-to-end execution.

## Idempotence and Recovery

Add the new `/blueprint` route and the shared `blueprint` stage contract before deleting old page renderers. That order keeps the app functional while redirects, nav, tests, and docs are catching up.

Keep the compatibility redirect map in one place. If a legacy redirect points to the wrong anchor, fix the single mapping module and rerun the redirect tests rather than hand-editing route files independently.

Treat the combined-page state migration as additive first. Reuse the current field renderer, helper text, and optimizer. Only after the new page-state hook is green should the old per-step route UI be removed. If the new page-level save flow regresses, restore the new page to use the last known good save helper behavior rather than reintroducing the old route shell.

If the Convex signature change breaks generated client types, rerun the hosted Convex sync before debugging TypeScript elsewhere. Do not paper over stale `_generated/api` types in app code.

If the CLI contract change proves too disruptive for existing local scripts, keep the deprecated stage aliases for one release but hide them from help and stage descriptors. Do not let temporary CLI compatibility block the web route simplification.

Leave the environment clean after validation. `bun run sbs:check` already uses a temporary draft directory and cleans it up. Any local Playwright or generated output directories used during manual proof should be removed or kept under `tmp/` so reruns stay predictable.

## Artifacts and Notes

Canonical combined-page section ids for this implementation:

    overview
    foundation
    problem
    outcome
    design
    pricing
    setup
    generated-preview

Legacy route redirect map that this plan assumes:

    /start -> /blueprint
    /product -> /blueprint#foundation
    /product/foundation -> /blueprint#foundation
    /product/problem -> /blueprint#problem
    /product/outcome -> /blueprint#outcome
    /design -> /blueprint#design
    /design/direction -> /blueprint#design
    /design/references -> /blueprint#design
    /marketing -> /blueprint#generated-preview
    /marketing/preview -> /blueprint#generated-preview
    /build-plan -> /blueprint#pricing
    /build-plan/delivery -> /blueprint#pricing
    /build-plan/setup -> /blueprint#setup

Files that are already strong evidence of the current behavior and should guide the rewrite instead of being ignored:

    packages/blueprint-compiler/src/stages/stage-definitions.ts
    packages/blueprint-compiler/src/readiness/evaluate-blueprint-readiness.ts
    apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx
    apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts
    apps/web/features/blueprint-flow/components/blueprint-problem-statement-optimizer.tsx
    apps/web/features/blueprint-flow/components/blueprint-review-page.tsx
    apps/web/features/blueprint-flow/server/downloads.ts
    packages/ship-by-sunday-cli/src/field-contract.ts
    apps/web/tests/integration-ui/blueprint-stage-page.test.tsx
    apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts
    qa/journeys.csv

Expected success transcript fragments to capture after implementation:

    bun run sbs stages
    ...
    Blueprint (blueprint)
      Lock the full reduced blueprint on one page.
    Review (review)
      Review readiness and download the starter snapshot.

    bun run qa:validate
    ...
    QA control plane is valid.

    PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:local-auth:default-ship
    ...
    ✓ entitled user opens /blueprint
    ✓ legacy /product/problem redirects to /blueprint#problem
    ✓ /review still exposes Download Ship Kit

Actual validation evidence captured on 2026-04-03:

    bun run qa:validate
    QA control plane is internally consistent.
    Journeys: 25
    Coverage rows: 61
    Inventory rows: 142
    Personas: 3

    bun run qa:run-pack -- --pack=default_ship --dry-run
    ... planned integration-ui proof now points at:
    ... tests/integration-ui/blueprint-page.test.tsx
    ... tests/integration-ui/blueprint-review-page.test.tsx
    ... tests/integration-ui/legacy-blueprint-route-redirects.test.tsx

    bun run typecheck
    ... Route (app) includes /blueprint, /review, and the legacy redirect routes

    bun run build
    ... Route (app) includes /blueprint, /review, and the legacy redirect routes

## Interfaces and Dependencies

`packages/blueprint-compiler/src/stages/stage-definitions.ts` must define only these canonical stage ids:

    type BlueprintStageId = "blueprint" | "review"

The `blueprint` stage must keep ordered step definitions for `foundation`, `problem`, `outcome`, `design`, `pricing`, `setup`, and `generated-preview`, because those step definitions still drive section ordering, missing-field grouping, CLI prompt order, and legacy redirect anchors.

`packages/blueprint-compiler/src/readiness/evaluate-blueprint-readiness.ts` and `derive-stage-status.ts` must return a truthful two-stage status model. Do not keep `product`, `design`, `marketing`, or `build-plan` in the exported stage status types after this migration. If review still needs artifact summaries, build those from a separate artifact list or section mapping; do not smuggle dead stage ids back into the readiness contract.

`apps/web/config/product.ts` must expose `routeConfig.blueprint` and `routeConfig.review` as canonical protected routes. Old route constants should either be removed from `routeConfig` or clearly isolated as compatibility-only values. New user-facing code must not import `routeConfig.start`, `routeConfig.product`, `routeConfig.design`, `routeConfig.marketing`, or `routeConfig.buildPlan` as canonical destinations.

`apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts` or an equivalent single-purpose module must own the old-route-to-anchor mapping. Route files, review blocker links, execute-ship links, and tests should all read from that mapping rather than re-encoding the same redirects in multiple places.

`apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts` must preserve the existing local-draft rules from `use-blueprint-stage-step-state.ts`: live Convex facts remain the source of truth, local state exists only for the editable draft buffer and UX feedback, `contact_email` can prefill from the signed-in user, untouched generated `scope_in` and `scope_out` values are omitted from save payloads, and validation only becomes visible after the explicit save-and-continue action.

`apps/web/convex/blueprint/projectDefinition.ts` must not validate obsolete stage ids on save. The mutation signature should match the truthful one-page model.

`packages/ship-by-sunday-cli/src/field-contract.ts` and `parse-cli-command.ts` must expose the same canonical route vocabulary the web app uses. If deprecated aliases exist, they are parser-level shims only. They must not appear in `stages`, `schema`, `fields`, or help output.

The review/download pipeline remains dependent on `apps/web/features/blueprint-flow/server/downloads.ts`, `packages/blueprint-compiler/src/server.ts`, and the starter snapshot renderer chain. This plan assumes no change to the generated repo contract itself; only the intake and route shell should change.
