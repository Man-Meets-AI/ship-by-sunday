---
summary: Move the blueprint archive download to the moment the completed blueprint hands off into `/review`, decouple post-review unlock from the download request, and simplify `/review` into a lightweight video-and-continue handoff screen. Preserve a small retry affordance for browsers where the automatic download does not begin.
read_when: Open this when implementing the review handoff change that should auto-start the Ship by Sunday Blueprint download and remove the heavy download cards from `/review`.
plan_status: done
---
# Decouple review unlock from download and simplify the `/review` handoff

This is a living execution plan for changing the end of the blueprint flow so the archive download starts automatically as the user enters `/review`, while the review screen itself becomes a short handoff surface instead of a download dashboard.

Maintain this ExecPlan in accordance with `.plans/PLANS.md` so a fresh coding agent can resume from this file alone.

## Purpose / Big Picture

Today the founder completes `/blueprint`, lands on `/review`, and then has to click one or two download-related cards before they can continue into the unlocked post-review lesson flow. That is the opposite of the desired handoff. After this change, the founder should press `Continue to Review` on a complete blueprint, arrive on `/review`, immediately see the review video plus a short explanation of what they just received, and also see the primary continue button into Build Lessons without needing to click a download card first. The archive download should start automatically only on that immediate handoff from `/blueprint` into `/review`. Later visits to `/review` from workspace navigation should stay passive and should not trigger another automatic download. The page should always show a quiet fallback link such as `Download didn’t start? Click here.` The visible proof is simple: finishing the blueprint unlocks post-review navigation without a manual download click, `/review` no longer shows the large download or `Keep going` cards, later review visits do not auto-download again, and the archive still downloads successfully through the existing `/api/download/repo` route.

## Progress

- [x] 2026-04-03 20:49 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `qa/AGENTS.md`, `.plans/PLANS.md`, `docs/prompts/execplan-writer.md`, the long-horizon prompt reference, and the current blueprint/review/download code paths before drafting this plan.
- [x] 2026-04-03 20:49 EDT — Confirmed the desired slice from user direction and screenshot: auto-start the Ship by Sunday Blueprint download as the user enters `/review`, remove the large manual download UI from `/review`, keep the review video, add brief handoff copy, and keep only a small retry affordance if the automatic download does not begin.
- [x] 2026-04-04 10:35 EDT — Grilled the plan against the live review-entry, post-review destination, and local-nav code. Locked the remaining product decisions: auto-download is one-time on the immediate `/blueprint -> /review` handoff only, the primary continue button goes to `buildLessonsDestination`, and the fallback download link stays visible at all times as low-emphasis support.
- [x] 2026-04-04 10:42 EDT — Completed the workflow-boundary slice for Milestone 1. `useBlueprintPageState` now calls `unlockExecuteShip` before navigating to `/review?download=1`, the repo download route no longer mutates workflow state, and focused validation passed in `tests/integration-ui/blueprint-page.test.tsx` plus `tests/integration/blueprint-download-routes.test.ts`.
- [x] 2026-04-04 10:51 EDT — Added the one-time review download handoff on `/review`, wired the best-effort auto-download attempt plus URL cleanup, replaced the manual download cards with the leaner handoff surface, and renamed the review local-nav anchor from `Downloads` to `Handoff`.
- [x] 2026-04-04 10:50 EDT — Updated the review-page tests, the blueprint-page copy assertions, the locked mission/lesson route copy, the local QA doc, and the buyer-handoff browser spec so the surrounding repo now describes the new handoff truthfully.
- [x] 2026-04-04 11:02 EDT — Passed `bun run format`, `bun run lint`, `bun run typecheck`, `bun run test:integration`, `bun run build`, `bun run --cwd apps/web test:integration:node -- tests/integration/blueprint-download-routes.test.ts`, and `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx`. Attempted `bun run dev` plus two retries of `PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run test:e2e:local-auth:default-ship`, but the browser lane failed before the changed review flow loaded because local sign-in hit Clerk redirect-loop warnings, an `Access required` bootstrap failure, and repeated Turbopack panics on `/sign-in`.
- [x] 2026-04-04 11:02 EDT — Deleted the last orphaned review artifact-grid component after the main validation pass, confirmed no remaining references with `rg`, reran `bun run lint`, and reran the focused review integration-UI suite successfully on the final tree.

## Surprises & Discoveries

The current unlock boundary is hidden inside `apps/web/app/api/download/repo/route.ts`. That route does two jobs at once: it builds the zip file and it calls `api.blueprint.unlockExecuteShip`. As a result, the current continue path is still implicitly gated by a successful download request, not by the user finishing the blueprint.

`apps/web/features/blueprint-flow/components/blueprint-review-page.tsx` already redirects away from `/review` when the review stage is still locked. That means the review page does not need a heavy incomplete-state card at all. Once the route renders, it can assume the blueprint is complete and focus on the handoff experience.

The current `/review` UI is assembled through `apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx`, which renders both `blueprint-review-checkpoint-card.tsx` and `blueprint-review-execute-preview.tsx`. Those two components are the source of the large download CTA and the `Keep going` card shown in the screenshot.

The `/review` route already accepts a query parameter for lesson-map behavior in `apps/web/app/(workspace)/review/page.tsx`. Any one-time auto-download signal added here must coexist with the existing `showLessonMap` parameter instead of replacing it.

The client cannot reliably know whether the browser actually accepted a download started from client code. The repo has retry and alert patterns, but no existing download-status pattern that can honestly distinguish `attempted but browser ignored it` from `started successfully`. The plan should therefore avoid any fake `failed download` state and keep the fallback link always visible.

The focused route test exposed one stale expectation unrelated to the new behavior: the real archive filename is now `ship-by-sunday-blueprint.zip`, not `starter-snapshot.zip`. The implementation should keep future route assertions aligned with the current compiler output contract rather than the older starter snapshot name.

JSDOM emits `Not implemented: navigation to another Document` when the focused integration-UI tests click the fallback archive link or the hook clicks a synthetic anchor for the one-time auto-download attempt. The suite still passes, so this is test-environment noise rather than a runtime regression.

The attempted local-auth Playwright proof is blocked by the repo’s local runtime rather than by the feature itself. A manual `bun run dev` booted `http://localhost:3000`, but the auth lane still failed before reaching the changed review page because local sign-in produced Clerk redirect-loop warnings, an `Access required` bootstrap error while `/blueprint` tried to load during session setup, and repeated Turbopack `Next.js package not found` panics on `/sign-in`.

The old `blueprint-review-artifact-grid.tsx` file turned out to be completely orphaned after the lighter handoff landed. Deleting it was safe, and a follow-up `rg` confirmed there were no remaining imports or references.

## Decision Log

Decision: Move the post-review unlock boundary out of `/api/download/repo` and into the successful final blueprint submission path in `apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts`.

Rationale: The continue button and post-review navigation should become available because the founder completed the blueprint, not because a file download request happened to succeed. This matches the requested product behavior and removes a hidden side effect from the archive endpoint.

Date/Author: 2026-04-03 / Codex

Decision: Use an explicit one-time review-entry signal, most likely a query parameter on the navigation into `/review`, to tell the client controller when it should start the automatic download.

Rationale: `/review` should auto-download only on the immediate handoff from a successful blueprint submission. A one-time signal makes that rule explicit, prevents repeated downloads on later visits or refresh, and lets the controller clear the signal after the first attempt.

Date/Author: 2026-04-03 / Codex

Decision: Keep the archive download route idempotent and primarily focused on returning the zip payload after this refactor.

Rationale: Archive generation and workflow unlocking are different responsibilities. Making `/api/download/repo` a pure download surface reduces coupling and makes fallback and testing easier to reason about.

Date/Author: 2026-04-03 / Codex

Decision: Never block the post-review continue button on automatic-download success. If the browser suppresses the automatic download, the page should still show the continue action plus a subtle retry link.

Rationale: Browsers differ in how they treat downloads started from page load or client effects. The user asked for the review page to feel lightweight and for manual download to become secondary, not for the continue path to disappear when the browser is cautious.

Date/Author: 2026-04-03 / Codex

Decision: The primary continue button on `/review` should always target `postReviewTargets.buildLessonsDestination` and should keep a Build-first label.

Rationale: This matches the current review-page behavior and the product story that review hands off into Build first. Using `latestLessonDestination` here would quietly change the review contract and make the page less predictable for new users.

Date/Author: 2026-04-04 / Codex

Decision: The fallback download affordance should always be visible as a low-emphasis link, and the controller should only model whether it attempted the automatic handoff, not whether the browser truly started saving the file.

Rationale: The client cannot reliably detect real browser download success here. An always-visible fallback link is simpler and more honest than pretending the app knows that the auto-download failed.

Date/Author: 2026-04-04 / Codex

Decision: Keep the review layout sparse and operational, following `DESIGN.md`, instead of replacing the removed cards with another large stacked card surface.

Rationale: The screenshot markup and the repo design contract both point toward a calmer, less card-heavy review handoff. The right move is subtraction, not a like-for-like redesign.

Date/Author: 2026-04-03 / Codex

Decision: Replace the dedicated `Downloads` local-nav anchor on `/review` with a truthful handoff-oriented anchor such as `Handoff`, and rename the related section id constant accordingly.

Rationale: The new review page no longer has a real downloads section. Leaving `Downloads` in the local nav would preserve obsolete IA and make the simplified page feel internally inconsistent.

Date/Author: 2026-04-04 / Codex

Decision: Use the query parameter `download=1` as the one-time review-entry signal and clear it with `window.history.replaceState` immediately after the first auto-download attempt.

Rationale: The repo already uses server `searchParams` for route entry and the bundled Next 16 docs explicitly allow client-side history updates that sync with router state. A short dedicated flag keeps the handoff explicit without forcing another route contract.

Date/Author: 2026-04-04 / Codex

## Outcomes & Retrospective

Implemented. The submit-driven unlock path, the one-time `download=1` review handoff, the lighter review UI, and the broader route/copy/test alignment are all in place. The review route now behaves like a handoff surface instead of a manual download checkpoint, and the archive endpoint no longer owns workflow state.

The remaining limitation is validation-only: the attempted local-auth Playwright lane could not prove the flow because the local dev runtime became unstable during sign-in before `/review` loaded. The feature itself still has strong proof because the explicit build gate, the route test, and the integration/UI suites all passed.

## Context and Orientation

The blueprint completion flow starts in `apps/web/features/blueprint-flow/components/blueprint-page.tsx`. That component renders the combined `/blueprint` page and wires its save bar into `apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts`. The hook is the real handoff boundary today. `handleSaveAndContinue` saves any dirty draft values through the Convex mutation, validates the required blueprint facts, and then navigates to `routeConfig.review` when the blueprint is complete.

The term `unlock` refers to `executeShipUnlockedAt` inside the workflow state returned by `apps/web/convex/blueprint/stageReadiness.ts`. When that timestamp exists, the app considers the post-review lesson flow unlocked. That timestamp is created by `apps/web/convex/blueprint/workflowState.ts` through the `unlockExecuteShip` mutation. The current system reaches that mutation indirectly through `apps/web/app/api/download/repo/route.ts`, which means a download request currently doubles as a workflow transition.

The `/review` route is split between the server file `apps/web/app/(workspace)/review/page.tsx` and the client component `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx`. The server file fetches the initial blueprint workspace state, the optional post-review destinations, and the optional bonus mission state, then passes the one-time `download=1` signal into the client tree. The client file redirects away if review is not unlocked, renders the video section, and delegates the lower handoff surface to `apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx`.

The review bridge is now intentionally small. `apps/web/features/blueprint-flow/hooks/use-review-download-handoff.ts` owns the one-time best-effort archive attempt plus query cleanup, and `apps/web/features/blueprint-flow/components/review/blueprint-review-handoff-card.tsx` owns the copy, the Build Lessons CTA, and the always-visible fallback download link. Because `/review` already redirects away when locked, the bridge no longer models a blocked review state.

The archive itself is produced in `apps/web/app/api/download/repo/route.ts`. That route uses `apps/web/features/blueprint-flow/server/downloads.ts` to fetch the authenticated canonical project definition and then calls `@shipbysunday/blueprint-compiler/server` to build the zip. There is already a focused route test in `apps/web/tests/integration/blueprint-download-routes.test.ts`. That test will need to change once workflow unlock moves out of the route.

The review page has more than one entry path. A founder reaches it immediately from the final `/blueprint` submit, but they can also return later from workspace navigation because the user menu links to `routeConfig.review` and the local nav model in `apps/web/features/workspace-navigation/lib/build-secondary-nav-model.ts` exposes review-specific anchors. That is why the automatic download must be gated by a one-time submit-only signal instead of by the mere fact that the user is on `/review`.

The review local nav now uses `REVIEW_HANDOFF_ID` and a `Handoff` item in `apps/web/features/workspace-navigation/lib/build-secondary-nav-model.ts`. Future edits should keep that anchor truthful to the actual page structure rather than reintroducing a downloads-first section name.

The current behavior is covered by two relevant integration-UI suites: `apps/web/tests/integration-ui/blueprint-page.test.tsx` and `apps/web/tests/integration-ui/blueprint-review-page.test.tsx`. Those tests currently assert copy such as `let the review page stay focused on readiness plus the Ship by Sunday Blueprint download`, `Download Ship by Sunday Blueprint first`, and `Continue to Build Lessons`. Those assertions are expected to change because the review page contract is changing. The implementation should keep the tests aligned with the new product story rather than preserving obsolete copy.

This change also touches the route, auth, and QA surface, so the implementation must respect `qa/AGENTS.md`. The safest proof set is focused integration coverage first, then the standard repo gates, and finally local-auth browser proof if a safe local environment is available.

## Plan of Work

Start with the workflow boundary, not the presentation. The current architecture makes the continue path depend on the download route, so implementation should first move the workflow unlock into the blueprint completion path. That means `use-blueprint-page-state.ts` needs access to `api.blueprint.unlockExecuteShip`, and the final successful `Continue to Review` sequence should become: save dirty draft values if needed, validate required fields, unlock the post-review flow, and then navigate to `/review` with a one-time signal that tells the review page to start the download automatically only on that immediate handoff.

Once the workflow state is truthful, add a small client-only handoff controller under the review feature folder. Keep UI and behavior separate. The controller should read the one-time signal, make exactly one best-effort attempt to start the existing `/api/download/repo` request, and expose only honest state to a slim presentational review handoff component. Do not model a fake `failed` browser-download state. The fallback download link should stay visible at all times as low-emphasis support. After the controller consumes the one-time signal, it should clear it from the URL so a normal refresh or later visit to `/review` does not trigger another archive request. The implementation can use a hidden anchor or another same-origin download trigger, but it must keep the fallback retry path explicit and never hide the continue button while waiting.

After the handoff controller exists, simplify the `/review` UI. Keep the current video section and short explanatory copy, then replace the review bridge with a lean handoff surface that says what the user received, why the blueprint matters, and where to go next. Remove the large download card and the `Keep going` card. Preserve a single primary continue action into `postReviewTargets.buildLessonsDestination`, keep the fallback download link small and always visible, and rename the review local-nav anchor away from `Downloads` so the navigation matches the new page.

Finish by updating the tests and copy surfaces that still describe review as a manual download checkpoint. Integration-UI tests should prove that a completed blueprint unlocks post-review navigation before any manual archive click, that `/review` no longer renders the removed cards, and that the auto-download retry affordance appears only as secondary support. The route test should prove that the archive endpoint still returns a zip but no longer owns workflow unlocking. Then run the repo’s required lint, format, typecheck, test, and build gates.

## Milestones

### Milestone 1 — Make blueprint completion unlock the post-review flow before `/review` renders

At the end of this milestone, the successful final action on `/blueprint` should create `executeShipUnlockedAt` before navigation into `/review`. The main files are `apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts`, `apps/web/features/blueprint-flow/components/blueprint-page.tsx`, and the Convex API surface referenced from `apps/web/convex/blueprint.ts` and `apps/web/convex/blueprint/workflowState.ts`. This milestone is complete when the completed blueprint path no longer relies on a manual download request to make post-review navigation available, and the focused integration-UI test proves that the review page can render the continue path immediately after final submission.

### Milestone 2 — Add a one-time review handoff controller that auto-starts the archive download

At the end of this milestone, navigating into `/review` from the final blueprint submission should include a one-time signal that the review route understands. The review feature should own a dedicated controller or hook that makes one best-effort attempt to start the existing `/api/download/repo` request and exposes the always-visible retry link without pretending it can detect true browser download failure. The main files are `apps/web/app/(workspace)/review/page.tsx`, `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx`, and one new feature-local controller or hook such as `apps/web/features/blueprint-flow/components/review/blueprint-review-download-handoff.tsx` or `apps/web/features/blueprint-flow/hooks/use-review-download-handoff.ts`. This milestone is complete when entering `/review` from the blueprint handoff attempts the download automatically, refreshing or later revisiting `/review` does not repeat it automatically, and the page still offers the small retry link.

### Milestone 3 — Replace the review download-era cards with a lightweight handoff surface

At the end of this milestone, the body below the review video should be a concise handoff section with a short explanation of what the founder now has, why the Ship by Sunday Blueprint is useful, and one continue action into `postReviewTargets.buildLessonsDestination`. The large manual download card and the `Keep going` card should be gone. The main files are `apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx`, `apps/web/features/blueprint-flow/components/review/blueprint-review-handoff-card.tsx`, `apps/web/features/blueprint-flow/hooks/use-review-download-handoff.ts`, and `apps/web/features/workspace-navigation/lib/build-secondary-nav-model.ts`. This milestone is complete when `/review` matches the leaner screenshot direction, the continue path remains obvious, the fallback link is small supporting text, and the local nav no longer advertises a `Downloads` section that does not exist.

### Milestone 4 — Update tests, copy, and repo validations to match the new handoff

At the end of this milestone, the focused tests and broad repo checks should all reflect the new behavior. The primary files are `apps/web/tests/integration-ui/blueprint-page.test.tsx`, `apps/web/tests/integration-ui/blueprint-review-page.test.tsx`, `apps/web/tests/integration/blueprint-download-routes.test.ts`, and any copy-bearing components such as `apps/web/features/blueprint-flow/components/blueprint-page-overview.tsx` and `apps/web/features/blueprint-flow/components/blueprint-page-save-bar.tsx`. This milestone is complete when the tests no longer assert obsolete download-first copy, the route test proves the archive endpoint still serves the zip cleanly, and the repo gates plus relevant browser proof are green.

## Concrete Steps

1. Update the blueprint completion boundary so it unlocks post-review state directly. Read `apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts` and wire in `api.blueprint.unlockExecuteShip` beside the existing save mutation. Keep the order strict: save dirty draft values, stop on validation errors, unlock the workflow state, then navigate to review with a one-time download signal.

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '430,580p' apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts

Expected observation: the current hook ends by calling `navigateToHref(routeConfig.review)` directly after validation success and does not unlock the workflow state itself yet.

2. Remove the hidden workflow mutation from the download route once step 1 is in place. Edit `apps/web/app/api/download/repo/route.ts` and its route test so the route remains responsible for authenticated archive generation only. If a temporary backstop mutation is kept during the migration, document that in the plan and remove it before closing the work.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd apps/web test:integration:node -- tests/integration/blueprint-download-routes.test.ts

Expected observation: the updated route test should still assert status `200`, the zip content type, and the archive filename, but it should stop requiring a workflow-unlock side effect from the route itself.

3. Extend the review route with a one-time handoff signal and a dedicated client-side download controller. Keep the behavior isolated from presentation. The review route already accepts `showLessonMap`; the new signal should coexist with that parameter and be cleared after consumption so a normal refresh or later navigation back to `/review` does not repeat the download. This signal must be emitted only from the successful `/blueprint` submit path, not from general review navigation.

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,220p' apps/web/app/'(workspace)'/review/page.tsx
    sed -n '1,240p' apps/web/features/blueprint-flow/components/blueprint-review-page.tsx

Expected observation: the server route currently forwards only `showLessonMap`, and the client review page currently renders the video section plus the review bridge. After this milestone, there should be an explicit download-handoff boundary with its own small state model, and that model should not claim to know whether the browser truly accepted the download.

4. Replace the review bridge components with a smaller handoff composition and update the review local nav to match it. Keep components under the 150-line limit and keep logic out of the presentational piece. Remove the large download button and the `Keep going` card. Keep only short copy, the primary continue action to Build Lessons, and the always-visible low-emphasis fallback download link. Rename or remove the old `Downloads` review anchor so the local nav matches the new page structure.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-review-page.test.tsx

Expected observation: the updated integration-UI test should assert the review heading, video, handoff copy, the Build Lessons continue button, and the small fallback download link, and it should explicitly fail if the removed download-era copy or a dedicated Downloads section returns.

5. Update the submit-side and review-side copy so it matches the new product story. The blueprint page should stop telling the user that review is a download dashboard. The review page should describe the blueprint positively but briefly. Keep the voice operational and calm per `DESIGN.md`.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx

Expected observation: no remaining assertions or visible strings should say `Download Ship by Sunday Blueprint first` or describe review as being focused on manual download.

6. Run the required project gates for this repo once the focused tests are green.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run format
    bun run lint
    bun run typecheck
    bun run test:integration
    bun run build

Expected observation: format, lint, typecheck, integration suites, and app build all pass. If browser proof is available locally, also run the local-auth pack below before considering the plan complete.

7. If a safe local-auth environment is available, prove the flow in a real browser because this change affects route handoff and download behavior.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run dev
    PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run test:e2e:local-auth:default-ship

Expected observation: the entitled founder flow reaches `/review`, the archive download starts automatically or clearly exposes the retry link, and the continue action is visible without a manual download-first requirement. In the current repo state, this step is blocked because the local dev runtime becomes unstable on `/sign-in` before `/review` loads, showing Clerk redirect-loop warnings, an `Access required` bootstrap error, and repeated Turbopack panics.

## Validation and Acceptance

Acceptance is behavioral. A founder with a complete blueprint presses `Continue to Review` on `/blueprint`, lands on `/review`, sees the review video, sees short handoff copy, and sees the continue action into Build Lessons immediately. The founder does not need to click a large download button on `/review`. The browser makes one best-effort attempt to start the Ship by Sunday Blueprint archive download only on that immediate submit-driven handoff. If the browser suppresses the automatic download, the page still shows the continue button and the always-visible small fallback link that triggers the same archive route manually. If the founder later revisits `/review` from workspace navigation, the page stays passive and does not auto-download again.

The minimum command-backed proof is:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd apps/web test:integration:node -- tests/integration/blueprint-download-routes.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx

The broad completion gates for this repo are:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run format
    bun run lint
    bun run typecheck
    bun run test:integration
    bun run build

If a local browser target is available, add:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run dev
    PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run test:e2e:local-auth:default-ship

Success means the focused tests pass, the large review download cards are gone, the primary review CTA points to Build Lessons, the local nav no longer advertises a fake Downloads section, the route test still proves the zip endpoint works, the repo gates are green, and either the browser flow passes or the attempted browser proof is explicitly documented as blocked by the repo’s current local auth/runtime instability.

## Idempotence and Recovery

This work should be implemented in additive, reversible slices. First move the unlock boundary, then add the review download controller, then simplify the UI. That order keeps the system shippable at each stop. If the new unlock placement regresses navigation, revert only the unlock call site and restore the existing route-side side effect temporarily while keeping the rest of the branch intact. If the automatic download trigger proves unreliable in browser testing, keep the continue path and retry affordance, record the observed browser limitation in `Surprises & Discoveries`, and adjust the controller strategy without reintroducing the large download dashboard.

The review-entry signal must be safe to replay and safe to clear. Refreshing `/review` after the controller consumes the signal or returning later through workspace navigation should not create repeated downloads. Retrying the manual fallback should always hit the same existing `/api/download/repo` route and should remain safe because archive generation is already idempotent for the same authenticated blueprint state.

If implementation leaves the tree in a mixed state where the submit flow unlocks correctly but the review page still renders old cards, the UI is ugly but functional and can be recovered by finishing the review component replacement without touching data. If the opposite happens and the UI is simplified before unlock moves, the continue path may disappear or stay gated; do not stop in that state.

## Artifacts and Notes

Key evidence captured during planning:

    apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts
      handleSaveAndContinue currently ends with navigateToHref(routeConfig.review)
      and does not call unlockExecuteShip.

    apps/web/app/api/download/repo/route.ts
      GET currently builds the zip and then calls api.blueprint.unlockExecuteShip.

    apps/web/features/blueprint-flow/components/blueprint-review-page.tsx
      redirects away when reviewStageStatus.isUnlocked is false, so the rendered
      review page can assume completion.

    apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx
      renders both the large download checkpoint card and the Keep going card.

    apps/web/features/workspace-navigation/lib/build-secondary-nav-model.ts
      still exposes REVIEW_DOWNLOADS_ID and a Downloads local-nav item, which
      no longer matches the intended simplified review page.

    apps/web/features/course/shared/components/app-shell/app-shell-user-menu-helpers.ts
      links to /review directly, which confirms that later passive visits to
      /review are part of the real product and must not auto-download again.

Implementation and validation evidence:

    bun run --cwd apps/web test:integration:node -- tests/integration/blueprint-download-routes.test.ts
    → 1 file passed, 1 test passed

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx
    → 2 files passed, 8 tests passed

    bun run format
    bun run lint
    bun run typecheck
    bun run test:integration
    bun run build
    → all passed

    bun run dev
    PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run test:e2e:local-auth:default-ship
    → attempted twice, but both retries failed before /review loaded because local sign-in
      hit Clerk redirect-loop warnings, an `Access required` bootstrap failure, and
      repeated Turbopack panics on /sign-in

Files most likely to change:

    apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts
    apps/web/features/blueprint-flow/components/blueprint-page-save-bar.tsx
    apps/web/features/blueprint-flow/components/blueprint-page-overview.tsx
    apps/web/app/(workspace)/review/page.tsx
    apps/web/features/blueprint-flow/components/blueprint-review-page.tsx
    apps/web/features/blueprint-flow/components/review/blueprint-review-handoff-card.tsx
    apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx
    apps/web/features/blueprint-flow/hooks/use-review-download-handoff.ts
    apps/web/features/blueprint-flow/lib/review-download-handoff.ts
    apps/web/features/workspace-navigation/lib/build-secondary-nav-model.ts
    apps/web/app/api/download/repo/route.ts
    apps/web/tests/integration-ui/blueprint-page.test.tsx
    apps/web/tests/integration-ui/blueprint-review-page.test.tsx
    apps/web/tests/integration/blueprint-download-routes.test.ts
    apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts
    apps/web/content/docs/local-qa.mdx

## Interfaces and Dependencies

The implementation depends on the existing Convex mutation `api.blueprint.unlockExecuteShip` from `apps/web/convex/blueprint.ts` and the workflow serialization in `apps/web/convex/blueprint/workflowState.ts`. That mutation should remain idempotent because the submit flow may call it when the timestamp already exists.

The review archive must continue to be served by `apps/web/app/api/download/repo/route.ts`, which depends on `apps/web/features/blueprint-flow/server/downloads.ts` and `@shipbysunday/blueprint-compiler/server`. The change should not alter the archive contents or filename contract.

The review-page continue action still depends on `PostReviewNavigationTargets` from `apps/web/features/workspace-navigation/lib/post-review-destination.ts` and must explicitly use `buildLessonsDestination` for the primary handoff button. The local-navigation model in `apps/web/features/workspace-navigation/lib/build-secondary-nav-model.ts` must stay aligned with that page so the review anchors remain truthful after the `Downloads` section disappears.

The client-side download handoff now lives in `apps/web/features/blueprint-flow/hooks/use-review-download-handoff.ts`, while the lightweight review presentation lives in `apps/web/features/blueprint-flow/components/review/blueprint-review-handoff-card.tsx`. Keep that split. The hook owns the one-time automatic attempt plus query-flag cleanup, and the card owns the copy plus CTA rendering. Do not reintroduce a broad config bag or a fake browser-download failure contract.

The main test dependencies are the existing Vitest integration and integration-UI projects declared in `apps/web/package.json`. Any new component or hook should reuse those test surfaces rather than inventing a new test runner path. If browser proof is added, use the existing local-auth Playwright lane instead of a one-off script.
