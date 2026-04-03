---
summary: "Turns the blueprint-first funnel into a more game-like progression system with clearer objectives, rewards, and locked section flow. It also adds an optional Execute / Ship branch that unlocks only after review and download."
read_when: "Open this when working on blueprint-stage UX, progression state, review checkpoint behavior, or the Execute / Ship unlock path."
plan_status: "done"
---

# Gamify Blueprint Progression and Unlock Execute / Ship

This document is a living execution plan for making the blueprint-first workspace feel more like a guided game run while preserving the blueprint contract, then unlocking an optional `Execute / Ship` path after the user reaches the review and download moment.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this change, a buyer still moves through the required blueprint-first funnel in the same order, but the experience feels more like clearing levels than filling forms. Each required section has a clearer objective, richer progress signals, visible rewards, and flexible step browsing inside the section without allowing section skipping. Once the user reaches `Review & Download`, downloads the final `Starter Snapshot`, and explicitly unlocks the next path from review, the app reveals an optional `Execute / Ship` hub that continues the momentum without becoming part of the required blueprint-definition flow. A human can see this working when the blueprint stages show level-like progression states, the review page feels like a checkpoint-complete screen, and a new optional `/execute` route becomes available only after the user has both used the review/download moment and triggered the separate unlock action.

## Progress

- [x] 2026-03-25 23:44 EDT — Inspected `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, `docs/prompts/execplan-writer.md`, the blueprint compiler stage model, the current blueprint-flow UI, the legacy mission shell, the download routes, and the relevant tests to freeze the planning slice.
- [x] 2026-03-25 23:57 EDT — Grilled the ExecPlan against the repo and resolved the remaining must-have ambiguities: the unlock trigger is a separate explicit action after download, unlocked blueprint sections permit full open/edit/save freedom across internal steps, `/execute` ships first as a shell plus lightweight detail views, and the first slice stores only the top-level unlock with no per-track persistence.
- [x] 2026-03-26 00:14 EDT — Completed Milestone 1. Added a feature-local blueprint progression panel with visible objective and reward copy, made in-stage step browsing persistent across step switches, locked future blueprint-stage nav links, and redirected direct hits to locked blueprint stages back to the first incomplete required stage.
- [x] 2026-03-26 00:14 EDT — Ran focused Milestone 1 validation from `apps/web`: `bunx vitest run --project integration-ui tests/integration-ui/blueprint-stage-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx` passed.
- [x] 2026-03-26 00:18 EDT — Landed the first Milestone 2 slice. `/review` now presents a checkpoint-complete card, keeps the existing outward-facing pack download labels and hrefs intact, previews `Execute / Ship` as an optional post-download branch, and redirects direct hits back to the first incomplete required stage when Review is still locked.
- [x] 2026-03-26 00:25 EDT — Completed Milestone 2. `/review` now uses a client-side post-download bridge so `Download Starter Snapshot` stays the primary outcome, while a separate `Unlock Execute / Ship` action appears only after the review download moment and keeps the archive GET routes side-effect free.
- [x] 2026-03-26 00:25 EDT — Completed Milestone 3. Added `blueprintWorkflowStates`, exposed `workflowState` through `api.blueprint.getBlueprintWorkspaceState`, added the `api.blueprint.unlockExecuteShip` mutation, and guarded `/execute` behind the persisted top-level unlock without touching `projectDefinitions.facts`.
- [x] 2026-03-26 00:25 EDT — Completed Milestone 4. Added the protected `/execute` route, a feature-local `execute-ship` hub with starter track cards, and lightweight detail views for `Build Now`, `Refine Design`, `Refine Marketing`, `QA & Debug`, and `Launch & Ship`.
- [x] 2026-03-26 00:28 EDT — Completed Milestone 5. Added focused integration-ui coverage for review unlock and execute-route gating, updated the public route-model docs to include optional `/execute`, added the required `todo.md` recent-work entry, and ran the broader validation set plus browser smoke.
- [x] 2026-03-26 15:43 EDT — Reworked the canonical `/start` entry to feel more like the original lesson flow by pairing the real Welcome Bunny video with the intro card, removed blueprint-flow and execute-shell header subtitles that were over-explaining the run, added focused `blueprint-start-page` coverage, and reran lint, the touched integration-ui specs, `bun run build`, and the sandbox auth-protection Playwright proof against `http://localhost:3000`.

## Surprises & Discoveries

The repository already contains the product split that this work needs. `apps/web/AGENTS.md` says the required product flow is `Start -> Product -> Design -> Marketing -> Build Plan -> Review & Download`, and explicitly reserves the old lesson-style material for an optional post-download library named `Execute / Ship`. That means this initiative is not a funnel rewrite. It is a presentation upgrade plus a post-review branch.

The blueprint model is stricter than the current UI suggests. `packages/blueprint-compiler/src/stages/stage-definitions.ts` defines only six stage identifiers: `start`, `product`, `design`, `marketing`, `build-plan`, and `review`. `packages/blueprint-compiler/src/readiness/derive-stage-status.ts` derives unlock and completion strictly from missing canonical facts. There is no legal way to add `execute` as a seventh blueprint stage without changing the contract that the rest of the app already depends on.

The existing blueprint-stage UI is flatter than the user intent. `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx` shows one active step card and the current sidebar. `apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx` only supports `Back` and `Save step`. The user requirement that steps inside a section can be browsed, while sections themselves cannot be skipped, is not already implemented. That behavior must be built intentionally in the blueprint-flow presentation layer.

The old “game-like” system is still present in the codebase even though the routes now redirect away from it. `apps/web/features/course/mission/**`, `apps/web/features/course/shared/components/app-shell/app-shell-mission-rail-shadcn.tsx`, `apps/web/features/course/shared/components/skill-rail-shadcn.tsx`, and the completion-celebration logic in `apps/web/features/course/lesson/components/lesson-page-footer-standard-body.tsx` and `apps/web/features/course/lesson/hooks/use-lesson-completion.ts` still encode the strongest progression cues. `apps/web/app/(workspace)/mission/page.tsx` and `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` now redirect to `/start`, so the old surfaces can be mined for mechanics and visual language but should not be restored as first-class blueprint routes.

The review page outward-facing labels are locked by tests. `apps/web/tests/integration-ui/blueprint-review-page.test.tsx` currently asserts the presence of `Design Pack`, `Marketing Pack`, `Build Pack`, `Prompt Pack`, and `Download Starter Snapshot`. Any redesign of review must preserve those public labels and download destinations while allowing the page to become a stronger checkpoint and unlock moment.

Milestone 1 exposed a subtle browsing trap in the original blueprint-stage shell. `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx` used to resync its active step directly from `stageStatus.currentStepIndex` every time the live workspace state changed. That behavior was fine when the stage only rendered one enforced next step, but it would have snapped the user back to the first incomplete step after every save and made out-of-order browsing inside one unlocked section feel broken. The progression refactor therefore had to separate the derived “current objective” from the locally selected step.

Milestone 2 exposed a second direct-access gap. `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx` previously rendered Review even when `review` was still locked in the derived stage model. The nav badges could say Review was locked while a direct `/review` hit still opened the page. The review shell now has to enforce the same sequential gate as the stage pages before the `Execute / Ship` bridge can be truthful.

The cleanest way to honor the “download first, unlock second” rule was to treat the Starter Snapshot click as a local review-side acknowledgement, not as proof that a browser download completed. `apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx` now records that local download moment in component state, then calls a separate `unlockExecuteShip` mutation only when the user explicitly asks to continue. That preserves pure GET download routes and still creates a truthful handoff.

The intro video for this experience did not need a new media path. The original lesson system already had a real Welcome Bunny asset attached as video asset `0.1`, but the blueprint `/start` route was not reusing it. The fastest clean fix was to reuse that existing asset through the shared lesson video player instead of inventing a blueprint-specific embed configuration.

Evidence from repo inspection:

    $ git log --format='%h %ad %s' --date=iso-strict -- docs/ship-by-sunday apps/web/features/blueprint-flow apps/web/app/'(workspace)'/mission/page.tsx apps/web/app/'(workspace)'/lesson/'[lessonKey]'/page.tsx | head -n 5
    c5391c9 2026-03-25T15:35:14-04:00 feat(web): reframe public story around agent-ready packs
    ab13519 2026-03-25T09:51:48-04:00 feat(blueprint): ship blueprint-first workspace flow
    86e4643 2026-03-24T16:01:04-04:00 updating docs
    579c46f 2026-03-24T15:50:28-04:00 refactor(web): move app root into apps/web

## Decision Log

Decision: Keep the blueprint-stage contract unchanged and make the blueprint flow feel game-like through presentation, local navigation, and workflow-only state rather than through new blueprint stages.
Rationale: The blueprint compiler, Convex validators, review/download routing, and current docs all assume the existing six-stage contract. Replacing that with a new stage graph would widen scope immediately and blur the boundary between canonical project facts and optional execution support.
Date/Author: 2026-03-25 / Codex

Decision: Allow flexible browsing of steps inside an unlocked blueprint stage, but do not allow browsing into a later section before the previous required section is complete.
Rationale: This matches the approved user rule. It also aligns with the current blueprint readiness model, which already exposes a current step index inside each stage while keeping stage unlock sequential.
Date/Author: 2026-03-25 / Codex

Decision: Store the `Execute / Ship` unlock in a new workflow-only Convex surface rather than inside `projectDefinitions.facts`.
Rationale: `projectDefinitions` is the canonical source of blueprint facts. The optional execution branch is teaching and workflow state. Mixing it into canonical blueprint facts would violate the blueprint-first architecture documented in `docs/ship-by-sunday/blueprint-contract-and-question-map-2026-03-23.md` and `docs/ship-by-sunday/input-architecture-keep-kill-combine-2026-03-23.md`.
Date/Author: 2026-03-25 / Codex

Decision: Create a new protected `/execute` route instead of reusing `/mission` as the public entry point for the optional branch.
Rationale: `/mission` is now explicitly a legacy compatibility route that redirects to `/start`. A new route avoids confusing the blueprint-first story, preserves existing redirect tests unless intentionally changed later, and lets the optional library use blueprint-first naming from day one.
Date/Author: 2026-03-25 / Codex

Decision: The first implementation slice will set up the `Execute / Ship` shell and unlock path, but it will not attempt a full rewrite or full recuration of every surviving old lesson before the hub can ship.
Rationale: The user wants a smoother transition and a place to “see the next stuff” soon, then iterate. The shell, unlock behavior, and one starter set of curated track cards deliver that value earlier than a full content migration.
Date/Author: 2026-03-25 / Codex

Decision: Unlock `Execute / Ship` through a separate explicit review-page action that appears after the user downloads, rather than through the archive GET route or by marking review ready.
Rationale: The archive routes in `apps/web/app/api/download/repo/route.ts` and `apps/web/app/api/download/blueprint/[stage]/route.ts` are clean, pure download endpoints today. Keeping them side-effect free avoids hidden state transitions, avoids pretending the server can prove that a browser download completed successfully, and creates a cleaner review-page handoff for both product use and video recording.
Date/Author: 2026-03-25 / Codex

Decision: Inside an unlocked blueprint section, users may open, edit, and save any internal step in any order.
Rationale: The user explicitly wants section order to be hard-gated while step order inside a section stays flexible. The blueprint model already derives section completion from required facts, so allowing out-of-order step edits inside a section does not weaken the blueprint contract.
Date/Author: 2026-03-25 / Codex

Decision: The first `/execute` release must include a real shell and lightweight detail views for each starter track, not only teaser cards and not a deep content migration.
Rationale: A shell-only unlock would feel too thin for the promised transition, but migrating large amounts of dormant course content in the first slice would widen scope too quickly. Lightweight detail views create a believable optional branch without reopening the old course as the main product.
Date/Author: 2026-03-25 / Codex

Decision: The first `/execute` release stores only the top-level unlock and does not add per-track progress persistence.
Rationale: This keeps the new workflow state minimal and avoids accidentally rebuilding a second full lesson-state system before the optional branch has proven its shape. Per-track persistence can be added later if real usage justifies it.
Date/Author: 2026-03-25 / Codex

Decision: Keep the blueprint compiler’s `currentStepIndex` as the recommended objective, but store the user’s selected in-stage step locally in the stage page so flexible browsing does not collapse back to the first incomplete step after every save.
Rationale: Milestone 1 requires out-of-order browsing inside one unlocked section. Reusing the derived `currentStepIndex` as the live selection would have undone that behavior as soon as the Convex query refreshed. Separating “recommended next required step” from “currently open step card” preserves the canonical readiness model while making the stage UI behave like a level map.
Date/Author: 2026-03-26 / Codex

Decision: Use a separate client-side acknowledgement after the Starter Snapshot click to reveal the unlock CTA, then persist the unlock only when the user explicitly asks to continue into `Execute / Ship`.
Rationale: The browser can initiate a file download without giving the server a reliable “download completed” signal. Revealing the optional unlock only after the user clicks the Starter Snapshot CTA preserves the desired product pacing, while the follow-up mutation keeps the GET archive routes pure and the persisted workflow state minimal.
Date/Author: 2026-03-26 / Codex

## Outcomes & Retrospective

This initiative is complete. The required blueprint flow still follows the canonical `Start -> Product -> Design -> Marketing -> Build Plan -> Review` order, but each required section now feels like a level with a visible objective, richer progression states, and browseable internal steps. `/review` now acts like a real checkpoint-complete screen instead of a flat download list, and it preserves the existing public pack labels and archive routes while adding a separate post-download bridge into the optional branch.

The optional branch is also complete for the first slice. `blueprintWorkflowStates` stores only the top-level `Execute / Ship` unlock, `/execute` is protected by both product access and the new workflow gate, and the first hub release ships as a lightweight but real post-review shell with starter track detail views instead of teaser-only cards. The intentionally deferred gap is per-track progress persistence, which remains out of scope by design for this first release.

## Context and Orientation

This initiative touches two already-separate systems in the repository. The first is the blueprint-first workspace. The second is the older mission-and-lesson shell that still exists in code but is no longer the primary route model.

The blueprint-first workspace starts with the blueprint compiler definitions in `packages/blueprint-compiler/src/stages/stage-definitions.ts` and `packages/blueprint-compiler/src/readiness/derive-stage-status.ts`. These files define the required sections, the steps inside each section, and the fact-based completion rules. The Convex bridge for that system lives in `apps/web/convex/blueprint/stageReadiness.ts`, `apps/web/convex/blueprint/projectDefinition.ts`, and `apps/web/convex/blueprint/validators.ts`. The protected UI for the blueprint flow lives in `apps/web/features/blueprint-flow/components/blueprint-start-page.tsx`, `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx`, `apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx`, `apps/web/features/blueprint-flow/components/blueprint-stage-sidebar.tsx`, `apps/web/features/blueprint-flow/components/blueprint-stage-nav.tsx`, and `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx`.

The old mission-and-lesson shell still provides the best reusable progression mechanics. The mission home is in `apps/web/features/course/mission/components/mission-page.tsx` and `apps/web/features/course/mission/components/mission/mission-hero-card.tsx`. The block rail and footer rail live in `apps/web/features/course/shared/components/app-shell/app-shell-mission-rail-shadcn.tsx` and `apps/web/features/course/shared/components/skill-rail-shadcn.tsx`. The completion-celebration layer lives in `apps/web/features/course/lesson/components/lesson-page-footer-standard-body.tsx` and `apps/web/features/course/lesson/hooks/use-lesson-completion.ts`. These files should be treated as a parts bin for interaction patterns, status language, motion expectations, and visual structure. They should not be treated as permission to bring back the old IA as the main product.

For this plan, a “section” means one required blueprint stage such as `Design` or `Marketing`. A “step” means one blueprint-stage step inside that section, such as `Flow` or `Voice`. A “reward” means the public pack that becomes downloadable when that section is complete. A “workflow-only state” means state that helps the app guide the user but does not change the blueprint output. The future `Execute / Ship` unlock is workflow-only state.

The present route behavior matters. The current protected routes are `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, and `/review`. The old `/mission` and `/lesson/[lessonKey]` paths currently redirect to `/start`. The new work must preserve the required stage order and fact-based readiness, while adding one new optional protected route such as `/execute` for the post-review branch.

The proposed feature-local folder additions should stay aligned with the repository’s feature-first structure. The likely shape is:

    apps/web/features/blueprint-flow/components/progression/
    apps/web/features/blueprint-flow/lib/
    apps/web/features/execute-ship/components/
    apps/web/features/execute-ship/lib/
    apps/web/app/(workspace)/execute/page.tsx

No top-level shared `components/` or `utils/` bucket should be introduced for this work. If a reused mechanic comes from the old mission shell, either adapt it in place only if it still serves both systems cleanly, or copy the pattern into a blueprint-flow or execute-ship feature-local component with domain-specific naming.

## Plan of Work

The work should proceed in four implementation movements. First, improve the required blueprint stages so they feel like progressing through a campaign. This means the stage shell must expose clearer step status, stronger objective framing, reward copy, and the ability to browse steps inside the current unlocked section without allowing section skipping. Second, convert the review page from a plain download list into a checkpoint-complete screen that both preserves the current download affordances and previews the next optional branch. Third, add a small workflow-only state surface that records whether the user has unlocked `Execute / Ship`, then use that state to guard a new `/execute` route without polluting `projectDefinitions`. Fourth, stand up the first version of the optional `/execute` hub using blueprint-first labels and selectively reused mission-shell mechanics, while keeping the scope narrow enough that the shell can ship before any large legacy-content migration.

The implementation should not reopen the blueprint compiler contract. The only blueprint-related data changes should support richer presentation and the optional workflow unlock. The build should not add a new `BlueprintStageId`, should not rewrite `projectDefinitions.facts`, and should not make `Execute / Ship` a prerequisite for any blueprint download. The hub should feel like a “continue the run” space that becomes available after review, not a seventh required blueprint stage.

## Milestones

### Milestone 1: Turn each required blueprint section into a level-like progression surface

At the end of this milestone, `/product`, `/design`, `/marketing`, and `/build-plan` will still be the same required stages, but each stage will feel more like a guided level. The implementer should add a stronger section header, visible “current objective” and “reward unlocked” copy, and a step-navigation surface that lets the user open, edit, and save any step inside the current unlocked stage in any order. `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx`, `apps/web/features/blueprint-flow/components/blueprint-stage-sidebar.tsx`, `apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx`, and one or more new blueprint-flow progression components will be the main files touched. The blueprint compiler stage definitions remain unchanged, but the UI may need helper functions in `apps/web/features/blueprint-flow/lib/` to derive step states such as `current`, `complete`, `incomplete`, and `upcoming` from the existing fact draft.

Success for this milestone means a signed-in user cannot open a later blueprint section before the previous section is complete, but can jump between steps inside the current unlocked section and save facts out of order within that section. The stage shell should visibly show that the reward for completing the section is the corresponding pack download. Validation for this milestone should include focused UI tests for step browsing, out-of-order step saves within one section, and a manual run through at least one multi-step stage.

### Milestone 2: Make `Review & Download` a checkpoint-complete screen with an `Execute / Ship` bridge

At the end of this milestone, the review page still shows the same pack labels and download targets, but the page will feel like the end of the required run instead of a static download list. `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx` will gain a stronger progress summary, a visible checkpoint or completion treatment, and an optional-branch section for `Execute / Ship`. The new branch must be clearly marked optional and clearly subordinate to the download CTA so users understand that the blueprint-first product is complete at review. The page must keep the `Download Starter Snapshot` action as the primary review moment, then present a separate explicit post-download action to unlock or continue into `Execute / Ship`.

Success for this milestone means the review page communicates two truths at once: the required product outcome is the set of downloadable packs, and there is a visible but optional next path for execution support. The existing download labels and URLs must remain intact so `apps/web/tests/integration-ui/blueprint-review-page.test.tsx` can be updated narrowly rather than replaced wholesale. The archive GET routes must remain side-effect free, and the unlock or continue action must use a separate workflow mutation.

### Milestone 3: Add workflow-only persistence for the optional unlock and guard `/execute`

At the end of this milestone, there is a new blueprint-workflow persistence surface that records whether the user has unlocked the optional post-review branch. The safest shape is a new `blueprintWorkflowStates` table in `apps/web/convex/schema.ts`, keyed by `clerkUserId` and `productKey`, with timestamps such as `executeShipUnlockedAt`, plus `createdAt` and `updatedAt`. The blueprint query surface in `apps/web/convex/blueprint/stageReadiness.ts` and `apps/web/convex/blueprint/validators.ts` should be extended to expose this workflow state to the review page and the future execute page. Add a focused mutation in the blueprint Convex module such as `unlockExecuteShip`. Do not add per-track persistence in this milestone.

Do not attach this unlock bit to `projectDefinitions.facts`. Do not add side effects to the GET download routes in `apps/web/app/api/download/repo/route.ts` or `apps/web/app/api/download/blueprint/[stage]/route.ts`. Instead, make the review page explicitly start the final download flow and record the optional unlock through a separate client-side action or adjacent acknowledgement after the download action so the GET archive routes remain predictable and easy to test.

Success for this milestone means a direct hit to `/execute` before unlock redirects back to `/review` or shows a locked state, and a user who has triggered the explicit unlock from review can reopen `/execute` later without affecting blueprint readiness. There should still be no workflow contract for per-track completion after this milestone.

### Milestone 4: Stand up the first playable `Execute / Ship` hub without reintroducing the old funnel

At the end of this milestone, `apps/web/app/(workspace)/execute/page.tsx` exists and renders a new feature-local hub under `apps/web/features/execute-ship/`. The hub should reuse the best old mechanics: a hero that presents the next action, a route map of optional tracks, visible `now`, `ready`, `done`, and `locked` states where appropriate, and optionality language that tells the user this is the “continue the run” area after blueprint download. The hub should not be called `Mission` in its primary user-facing copy. It should be called `Execute / Ship`.

The initial hub does not need a full recut of every dormant lesson before it can ship. The first version should provide a clear shell, a small starter set of track cards aligned to post-blueprint actions, such as `Build Now`, `Refine Design`, `Refine Marketing`, `QA & Debug`, and `Launch & Ship`, and lightweight detail views for those tracks. The detail views may be tabs, nested subroutes, or another feature-local pattern, but they must provide real next-step guidance rather than only teaser copy. If the implementer decides to expose legacy content inside the hub, do it selectively and behind the new `/execute` surface rather than by reviving `/mission` as the entry point. Any legacy lesson route restoration should be deliberate, minimal, and described in the plan updates at implementation time. The first version should remain largely stateless beyond the top-level unlock.

Success for this milestone means a user can finish the required blueprint flow, unlock the optional branch, and land on a coherent post-review hub that visually and narratively continues the journey without confusing the required product shape. The user must be able to open a starter track and see a lightweight but real detail view without the app yet claiming track-level completion memory.

### Milestone 5: Validate the new route model, update tests, and record the docs footprint

At the end of this milestone, the changed tests pass, the new protected route is covered, and the repository has a durable written record of the work. The implementer should add or update focused integration-ui tests for the review bridge, blueprint-stage browsing, and execute-route guard behavior; update any unit tests that intentionally encode the old `/mission` redirect assumptions only if those assumptions are intentionally changed; and update docs if the new `/execute` route becomes part of the user-facing protected-route model. The `todo.md` recent-work log should receive a timestamped entry once implementation is real.

Success for this milestone means the route contract, optional unlock behavior, and blueprint-first story are all proven both by tests and by a manual end-to-end run from `/start` to `/review` to `/execute`.

## Concrete Steps

Work from the repository root unless a step says otherwise.

Begin by creating a short implementation branch note inside this ExecPlan and confirming that the current blueprint-stage tests and review-page tests are green before changing anything:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run test:integration:ui

The broad integration-ui suite can take time. During development, run focused tests directly with Vitest from `apps/web` for the files touched by this work:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/blueprint-review-page.test.tsx
    $ bunx vitest run --project unit tests/unit/app-workspace-mission-page.test.tsx tests/unit/mission-page.test.tsx

When Milestone 1 starts, add feature-local blueprint progression components and wire them into `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx`. Expect the first visible proof to be that the blueprint stage renders a map of steps rather than only the current step heading, and that clicking a step changes the active card without opening a later locked stage. Add a focused test proving that a user can save a later step inside an unlocked section before earlier steps are complete, while the next section still stays locked.

When Milestone 2 starts, convert the review page into a richer checkpoint screen. Preserve the download links and text that the current test asserts. Add only the new optional bridge and stronger completion framing around them. Expect the first visible proof to be a new `Execute / Ship` section on `/review` that is visibly optional and a separate explicit unlock or continue button that appears after the review download moment rather than piggybacking on the GET archive request.

When Milestone 3 starts, add a new Convex workflow table and handlers. After editing `apps/web/convex/schema.ts`, run code generation before wiring the UI:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx convex codegen

Expect code generation to update the Convex generated files without schema errors. If the schema change fails, revert only the in-progress workflow table edits, fix the validator or index mismatch, and rerun code generation before touching the UI again.

When Milestone 4 starts, create `apps/web/app/(workspace)/execute/page.tsx` and the `apps/web/features/execute-ship/` feature folder. Reuse patterns from the old mission shell, but keep names and copy blueprint-first. The first proof should be that a user who has triggered the unlock from review can load `/execute`, while a user who has not triggered it gets redirected or shown a locked state, and that opening a starter track reveals a lightweight detail view without any new per-track persistence contract.

Before closing the work, run the focused checks for the touched surfaces, then the broader project commands from the repository root:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run test:unit
    $ bun run test:contracts
    $ bun run test:integration:ui
    $ bun run build

If browser behavior on `/review` or `/execute` is materially changed, also run the smoke suite with the local environment sourced:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ set -a; source apps/web/.env.local; set +a; bun run test:browser-smoke

The expected successful transcript is the usual Bun and Vitest/Next success output with no failed tests, no schema errors, and a completed app build. Record the exact commands and final pass/fail state in this ExecPlan’s `Progress` and `Artifacts and Notes` sections as implementation proceeds.

## Validation and Acceptance

Acceptance is behavior-based.

The first acceptance criterion is that the required blueprint flow remains intact. A user who has not completed `Product` cannot open `Design`. A user who has completed `Design` can still revisit `Design`, open any internal step, and save facts from those steps in any order, but cannot skip ahead to `Marketing` until `Design` is actually complete. Completion must still be based on required facts, not on whether the user clicked every step.

The second acceptance criterion is that the blueprint stages feel more like guided levels. Each required blueprint stage should visibly show the current objective, the step map, and the reward or pack that the user is working toward. Manual verification should include moving among steps inside one unlocked stage and observing that the active step changes without changing blueprint readiness unless facts are saved.

The third acceptance criterion is that `Review & Download` still serves the same product outcome while becoming a better bridge. The page must still show `Design Pack`, `Marketing Pack`, `Build Pack`, `Prompt Pack`, and `Download Starter Snapshot`, and those links must still target the same archive routes. The page must also visibly preview `Execute / Ship` as optional and provide a separate explicit unlock or continue action instead of coupling that transition to the archive GET request.

The fourth acceptance criterion is that the optional branch is truly post-review and truly optional. Before unlock, a direct visit to `/execute` must not grant access. After the user downloads from review and then triggers the separate review-side unlock action, `/execute` must become accessible and remain accessible on later sessions. This unlock must not change blueprint readiness, must not appear in `projectDefinitions.facts`, and must be the only new persisted workflow state in the first slice.

The fifth acceptance criterion is that the new route model is covered by tests. At minimum, the changed work should leave `packages/blueprint-compiler/tests/readiness.test.ts`, `apps/web/tests/integration-ui/blueprint-review-page.test.tsx`, and the new or updated tests for blueprint-stage browsing, out-of-order step saving within a section, and execute-route gating before and after unlock in a passing state. The broader `bun run build` must also pass.

## Idempotence and Recovery

This work is safe to execute incrementally if the implementer respects the system boundaries. UI-only changes in `apps/web/features/blueprint-flow/**` and `apps/web/features/execute-ship/**` can be rerun freely. The risky step is the Convex schema change for the workflow-only unlock. Keep that change additive. Do not mutate or backfill `projectDefinitions`. Do not delete or repurpose existing blueprint fields.

If the new workflow table or validators break code generation, back out only the new workflow-state edits, rerun `bunx convex codegen` until it is green again, and then reapply the change in smaller pieces. If the new review-page unlock behavior proves flaky, keep the archive routes pure and move the unlock trigger to a simpler explicit acknowledgement action rather than trying to infer download completion from server-side GET behavior.

If the `/execute` shell lands before any deeper legacy-content mapping is ready, that is acceptable. The shell can ship with a narrow starter set of track cards and explicit “optional, more coming” copy. Do not reopen the blueprint-stage contract or the old `/mission` primary route just because the optional library is still shallow.

If the design direction becomes muddled during implementation, return to the core split: blueprint stages are required sections; steps are browseable within a section; review is the checkpoint; `/execute` is the optional post-review branch. Any change that weakens that split should be rejected or documented in the `Decision Log` before code continues.

## Artifacts and Notes

The repo already provides the strongest anchor points for this initiative:

    Required stage model:
    packages/blueprint-compiler/src/stages/stage-definitions.ts
    packages/blueprint-compiler/src/readiness/derive-stage-status.ts

    Blueprint workspace bridge:
    apps/web/convex/blueprint/stageReadiness.ts
    apps/web/convex/blueprint/projectDefinition.ts
    apps/web/convex/blueprint/validators.ts

    Current blueprint UI:
    apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx
    apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx
    apps/web/features/blueprint-flow/components/blueprint-stage-sidebar.tsx
    apps/web/features/blueprint-flow/components/blueprint-review-page.tsx

    Reusable game-like mechanics:
    apps/web/features/course/mission/components/mission-page.tsx
    apps/web/features/course/mission/components/mission/mission-hero-card.tsx
    apps/web/features/course/shared/components/app-shell/app-shell-mission-rail-shadcn.tsx
    apps/web/features/course/shared/components/skill-rail-shadcn.tsx
    apps/web/features/course/lesson/components/lesson-page-footer-standard-body.tsx

The cutover from old primary routes to blueprint-first happened on 2026-03-25:

    ab13519 2026-03-25T09:51:48-04:00 feat(blueprint): ship blueprint-first workspace flow

The old mission-shell mechanics were not deleted. They were redirected away:

    apps/web/app/(workspace)/mission/page.tsx
    apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx

As implementation proceeds, append short transcripts here showing the first successful blueprint-stage browsing test, the first successful unlock of `/execute`, and the final validation run.

Milestone 1 focused validation:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/blueprint-stage-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx
    Test Files  2 passed (2)
    Tests  3 passed (3)

Milestone 2 slice validation:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/blueprint-stage-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx
    Test Files  2 passed (2)
    Tests  4 passed (4)

Milestone 3 and 4 focused validation:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx convex codegen
    Uploading functions to Convex...
    Generating TypeScript bindings...
    Running TypeScript...

    $ bunx vitest run --project integration-ui tests/integration-ui/blueprint-stage-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx tests/integration-ui/execute-ship-page.test.tsx
    Test Files  3 passed (3)
    Tests  6 passed (6)

Broad validation and smoke:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run test:integration:ui
    Test Files  14 passed (14)
    Tests  48 passed (48)

    $ bun run test:unit
    Test Files  82 passed (82)
    Tests  309 passed (309)

    $ bun run test:contracts
    Test Files  1 passed (1)
    Tests  4 passed (4)

    $ bun run build
    ✓ Compiled successfully
    ✓ Generating static pages

    $ bun run lint
    Found 0 warnings and 0 errors.

    $ bun run format:check
    All matched files use the correct format.

    $ set -a; source apps/web/.env.local; set +a; bun run test:browser-smoke
    5 passed

## Interfaces and Dependencies

The `BlueprintStageId` union in `packages/blueprint-compiler/src/stages/stage-definitions.ts` must remain `start`, `product`, `design`, `marketing`, `build-plan`, and `review`. This plan does not authorize adding `execute` to that union.

`deriveStageStatus` in `packages/blueprint-compiler/src/readiness/derive-stage-status.ts` must remain the source of truth for stage unlock, completion, current-step derivation, and blueprint readiness. New game-like UI state may interpret that result, but it must not replace it.

`getBlueprintWorkspaceStateHandler` in `apps/web/convex/blueprint/stageReadiness.ts` should be extended, not replaced, to expose workflow-only unlock state for the optional branch. Any validator changes in `apps/web/convex/blueprint/validators.ts` must preserve the existing blueprint workspace fields while adding the new optional workflow fields.

`projectDefinitions` in `apps/web/convex/schema.ts` must remain the canonical store for blueprint facts only. Add a new workflow table, such as `blueprintWorkflowStates`, for optional progression and unlock state. Give it a precise index by `clerkUserId` and `productKey` so the blueprint feature can query it directly. In the first slice, this workflow state should store only the top-level `Execute / Ship` unlock and its timestamps, not per-track progress.

`routeConfig` in `apps/web/config/product.ts` should gain a new protected route for `/execute`. The blueprint routes and review route must remain unchanged. The old `/mission` route should remain a legacy compatibility surface unless a later plan explicitly changes that contract.

`api.blueprint.getBlueprintWorkspaceState` now depends on both `projectDefinitions` and `blueprintWorkflowStates`. The public validator in `apps/web/convex/blueprint/validators.ts` must therefore continue returning both `projectDefinition` and `workflowState` so `/review` and `/execute` can render from one server-fetched workspace object.

`api.blueprint.unlockExecuteShip` is the only new persisted workflow mutation in this first release. It must keep the archive GET routes pure, patch only `blueprintWorkflowStates`, and remain idempotent when the unlock already exists.

The new optional hub should live in a feature-local `apps/web/features/execute-ship/` area. Keep names domain-specific. Avoid vague names such as `hub`, `misc`, or `extra`. Prefer names like `execute-ship-page`, `execute-track-card`, `execute-ship-access-state`, and `build-execute-ship-model`.

The review download routes in `apps/web/app/api/download/repo/route.ts` and `apps/web/app/api/download/blueprint/[stage]/route.ts` should stay side-effect free for this initiative. Triggering the optional unlock should happen through explicit workflow UI and a dedicated mutation, not through hidden work inside archive GET handlers. The `/execute` hub should not define or persist a first-slice per-track completion contract.
