---
summary: "ExecPlan for restoring the post-review bonus continuation funnel by turning `/execute` into a bridge page and bringing back `/mission` and `/lesson/*` as the unlocked continuation experience. It documents the route contract, bonus lesson model, and the staged implementation that was already completed."
read_when: "Open this when you need the product rules and implementation trail for the restored post-review continuation flow."
plan_status: "done"
---

# Restore the Post-Review Bonus Continuation Funnel

This document is a living execution plan for restoring the paid continuation funnel that unlocks after `Review & Download`, while keeping the blueprint-first product contract intact. It is written so a new coding agent can execute the work from the repository alone, then keep the plan updated as implementation discoveries and milestone results come in.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this change, a customer who reaches `/review`, downloads the Blueprint, and unlocks the bonus path will get a coherent continuation experience instead of the current thin `/execute` tab page. `/execute` will become a short bridge page with a dedicated video that explains the bonus context and sends the customer into the restored BUILD continuation lessons. `/mission` will return as the unlocked bonus-library home, and `/lesson/*` will come back as a video-first continuation sequence behind the same post-review unlock rule. A human should be able to see the change by finishing the required blueprint run, unlocking the bonus from review, landing on `/execute`, watching or skipping the bridge video, entering the recommended BUILD lesson, and then browsing the restored bonus library and video lessons without seeing the old blueprint intake workbench.

## Progress

- [x] 2026-03-27 10:43 EDT — Wrote the first version of this initiative as a `/execute` workspace redesign after reading the repo contracts, current `/execute` code, blueprint-stage shell, and legacy mission and skill rail components.
- [x] 2026-03-27 11:28 EDT — Grilled the initial plan against the real lesson system, route redirects, course state model, mission shell, and media inventory. The scope changed materially: the real goal is to restore the post-review bonus continuation funnel, not to build a standalone `/execute` workspace.
- [x] 2026-03-27 11:28 EDT — Locked the product decisions needed to make the plan implementation-ready: `/execute` stays post-review only, becomes a dedicated bridge page with a new video, restores `/mission` as a bonus-library home, restores `/lesson/*` behind the same unlock, opens all bonus lessons at once, treats the whole continuation funnel as video-first, uses viewed progress instead of manual completion, and routes the bridge CTA to lesson `3.1` while leaving `3.0` available as reference.
- [x] 2026-03-27 11:42 EDT — Completed the full grill pass using the repo, route tests, mission model, lesson-state mutations, and blueprint-review UI as evidence. Locked the remaining implementation-shaping decisions: all 29 lessons stay visible on bonus surfaces with BUILD featured and the other sections demoted to references; direct `/mission` and `/lesson/*` access is allowed immediately after unlock and does not require a separate bridge-consumed flag; “started bonus funnel” means the user has opened any unlocked bonus lesson; bonus surfaces must relabel progress to opened/explored instead of completed; bonus section labels must be remapped to blueprint-era language instead of reusing `CEO / DESIGN / BUILD / SHIP`; and the `/execute` bridge may ship with a temporary non-video orientation fallback while the dedicated Bunny asset is being prepared.
- [x] 2026-03-27 11:54 EDT — Completed Milestone 1. Added a shared bonus-route access helper around `api.blueprint.getBlueprintWorkspaceState`, moved `/execute` onto that helper, replaced the old `/mission` and `/lesson/*` blind redirects with explicit locked-bonus messaging before unlock, and kept those two restored routes reachable after unlock through temporary placeholder panels instead of sending users back to `/start`. Validation passed in `tests/unit/app-workspace-mission-page.test.tsx`, `tests/unit/app-workspace-lesson-page.test.tsx`, and the existing `tests/integration-ui/execute-ship-page.test.tsx`.
- [x] 2026-03-27 12:05 EDT — Completed Milestone 2. `/execute` now renders the bonus bridge instead of the old tab hub, uses the orientation fallback card while the dedicated Bunny asset is pending, routes the primary CTA to lesson `3.1`, and redirects repeat visitors to `/mission` once any bonus lesson has been opened.
- [x] 2026-03-27 12:06 EDT — Completed Milestones 3 and 4. Added bonus-specific mission and lesson data paths, restored `/mission` as a BUILD-first bonus library, restored `/lesson/*` as video-first bonus lesson pages via the watch shell, and changed bonus shell progress wording from “lessons completed” to “lessons explored.”
- [x] 2026-03-27 12:06 EDT — Completed Milestone 5 for focused tests and production build. Focused route, bonus mission, bonus lesson, watch-contract, and execute integration tests all passed, and `bun run build` completed successfully.
- [x] 2026-03-27 12:24 EDT — Ran a multi-agent adversarial review pass over the restored bonus funnel and fixed the concrete issues it surfaced: repeat-route detection is now scoped to valid post-unlock lesson history, bonus shell block progress now tracks explored lessons instead of only completed lessons, the misleading mission “Replay the bridge” CTA was replaced with a lesson `3.0` reference CTA, BUILD-first ordering now flows into the shared shell chrome, and focused test/docs coverage now includes the actual `/execute` route entry, the bonus lesson view-tracker mutation, repeat `/execute -> /mission` docs, and locked-bonus QA expectations.
- [x] 2026-03-27 12:29 EDT — Closed the last holistic-review finding by removing stale “replay the bridge from Execute / Ship” copy from the restored bonus lesson page. The lesson page now explains that repeat `/execute` visits return to `/mission`, which matches the implemented route contract.
- [ ] Run live browser or manual proof of the `/review -> /execute -> /lesson/iterate-the-product-with-ai -> /mission` path with an authenticated post-review account. This was not run in this turn because no authenticated unlocked session was provisioned in the terminal.

## Surprises & Discoveries

The current `/execute` route is not the real continuation funnel; it is only a first-slice placeholder. `apps/web/features/execute-ship/components/execute-ship-hub.tsx` duplicates the same five tracks in a summary grid and a second tab list, but it does not reconnect the user to the richer lesson system that still exists elsewhere in the repo.

The old lesson system is still present and large enough to restore. `apps/web/features/course/lesson/model/curriculum.ts` defines 29 active lesson entries across `CEO`, `DESIGN`, `BUILD`, and `SHIP`, and the lesson runtime still exists through `apps/web/features/course/lesson/components/lesson-page.tsx`, `apps/web/features/course/lesson/hooks/use-lesson-page.tsx`, `apps/web/features/course/lesson/hooks/use-lesson-state.ts`, and the Convex course module. The current problem is routing and product framing, not total code deletion.

The old lesson and mission routes are currently dead on purpose. `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` and `apps/web/app/(workspace)/mission/page.tsx` both redirect to `/start`. Restoring the bonus continuation funnel therefore requires route work, not just changing a component.

The old continuation content does not cleanly match the new blueprint-first story without a bridge. There is already a real Bunny asset for `3.0 Build Kickoff` in `apps/web/features/course/lesson/model/media.ts`, but the user explicitly wants `/execute` to host a new dedicated video that explains the post-review bonus and the blueprint-driven framing shift. That means `/execute` should become a bridge page, not a pure redirect.

The plan cannot assume the current curriculum already behaves like a watch-only video library. `apps/web/tests/unit/watch-lesson-contract.test.ts` explicitly asserts that no student-facing lessons use the watch shell and that the current curriculum stays split/workbench-first. Because the desired continuation funnel is now video-first across the board, the restore must introduce a route-level or runtime bonus mode that overrides the default lesson presentation for bonus visits. It should not rely on the current manifest already being watch-first.

The old mission home is tied to the pre-blueprint four-block story and explicit completion counts. `apps/web/features/course/mission/components/mission-page.tsx`, `apps/web/features/course/mission/components/mission-page-intro.tsx`, and `apps/web/features/course/mission/components/mission/mission-hero-card.tsx` all assume the old course progression model. Restoring `/mission` for the bonus continuation funnel therefore means reworking it into a blueprint-era bonus-library home rather than simply removing the redirect and shipping the old page unchanged.

Viewed progress is not yet modeled the way this plan first assumed. `apps/web/features/course/lesson/hooks/use-lesson-state.ts` calls `markLessonViewed` on page open, but `apps/web/convex/course/shared.ts` currently inserts new lesson-state documents as `not_started` and only patches `lastViewedAt` on existing documents. `apps/web/convex/course/mission.ts`, `apps/web/features/course/mission/lib/mission-page-model.ts`, and the shell header components still present progress as “lessons completed.” The restore therefore needs an explicit bonus-progress display model instead of assuming page-open view state already surfaces as `in_progress` automatically.

The current test suite also encodes the legacy route behavior. `apps/web/tests/unit/app-workspace-mission-page.test.tsx` asserts that `/mission` redirects to `/start`, and `apps/web/tests/integration-ui/execute-ship-page.test.tsx` still expects the old tabbed hub. These tests must be replaced, not merely supplemented.

The early route-restore slice does not need the full course shell to be useful. Replacing the `/mission` and `/lesson/*` redirects with small server-rendered state panels let the route contract change land safely before the mission library and lesson runtime are reconnected. That reduces blast radius for the bridge-page milestone because the access behavior is now independent from the larger UI restore.

The cleanest restore path was not to mutate the legacy course query surface in place. A bonus-specific mission query plus a bonus-only `mark viewed` mutation let the restored continuation funnel unlock all 29 lessons after review while leaving the older completion-gated course queries intact for other surfaces that still depend on them.

The shared workspace shell needed one small seam to stay truthful. Adding an optional progress label to the shell mission props was enough to change bonus UI from “lessons completed” to “lessons explored” without forking the entire shell header or navigation chrome.

The adversarial review pass exposed that the first implementation was too trusting about historical lesson state. Treating any lesson-state timestamp as “bonus started” would have skipped the bridge for legacy course users, so the repeat-routing signal now requires a valid current-lesson key and a timestamp at or after `executeShipUnlockedAt`.

`bun run build` still emits the existing Turbopack NFT tracing warning from `apps/web/next.config.ts -> apps/web/app/api/download/repo/route.ts`. The build succeeds, so this remains a pre-existing repo warning rather than a blocker from the bonus-route restore.

Evidence from repo inspection:

    apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx
      - currently redirects to routeConfig.start

    apps/web/app/(workspace)/mission/page.tsx
      - currently redirects to routeConfig.start

    apps/web/features/course/lesson/model/curriculum.ts
      - currently contains 29 lesson entries
      - BUILD begins at 3.0 and 3.1 is the first real “iterate/build” lesson after kickoff

    apps/web/features/course/lesson/model/media.ts
      - already contains ready Bunny videos for 3.0 through 4.0

    apps/web/tests/unit/watch-lesson-contract.test.ts
      - currently asserts that no student-facing lessons use the watch shell

    apps/web/convex/course/shared.ts
      - markLessonViewed creates new lesson states as not_started and does not promote existing states to in_progress

    apps/web/tests/unit/app-workspace-mission-page.test.tsx
      - currently asserts that /mission redirects to /start

## Decision Log

Decision: This initiative is no longer a standalone `/execute` workspace redesign. It is the restoration of the post-review bonus continuation funnel.
Rationale: The grill showed that the real desired user journey is `/review` unlock -> `/execute` bridge -> restored continuation lessons and bonus-library home. Building a richer standalone `/execute` workspace would solve the wrong problem.
Date/Author: 2026-03-27 / Codex

Decision: `Execute / Ship` remains a post-review unlock and must stay gated by `workflowState.executeShipUnlockedAt`.
Rationale: The user clarified that the continuation funnel is a bonus unlocked only after the customer reaches review and downloads the starter. Restoring `/mission` or `/lesson/*` without that gate would break the product story.
Date/Author: 2026-03-27 / Codex

Decision: `/execute` will become a real bridge page with a dedicated bonus-context video, not a pure redirect and not a permanent standalone workspace.
Rationale: The user wants a video on `/execute` to explain how the restored continuation funnel fits the new blueprint-first product. That bridge is distinct from the old BUILD kickoff lesson.
Date/Author: 2026-03-27 / Codex

Decision: The bridge CTA will send the user to lesson `3.1`, while lesson `3.0` remains available as unlocked reference in the BUILD block.
Rationale: Sending the user from a new bonus-context bridge video directly into another kickoff video would likely feel redundant. `3.1` is the cleaner “real continuation starts here” lesson.
Date/Author: 2026-03-27 / Codex

Decision: `/mission` will be restored as a reworked bonus-library home, not as the old four-block dashboard and not as a dead route.
Rationale: Many existing course surfaces still reference `routeConfig.mission`, and the user wants the lesson system back as the continuation funnel. The old mission page’s structure must be updated to match the blueprint-era bonus story.
Date/Author: 2026-03-27 / Codex

Decision: All bonus continuation lessons will unlock at once after the post-review bonus unlock.
Rationale: The user explicitly wants the earlier lessons available as references and does not want the restored continuation funnel to preserve the old strict sequential lock model.
Date/Author: 2026-03-27 / Codex

Decision: The entire restored continuation funnel will be video-first in this first restore slice.
Rationale: The blueprint-first funnel already collected the durable project information. The continuation bonus is now teaching and execution guidance, not another structured data-entry path. The simplest safe implementation is to force bonus lessons through the watch shell and ignore the old workbench at runtime.
Date/Author: 2026-03-27 / Codex

Decision: Viewed progress replaces manual completion for the bonus continuation funnel.
Rationale: Since all bonus lessons unlock at once and become video-first, old completion buttons and completion gating are mostly friction. Opening a lesson should still create visible motion on the bonus surfaces, but that motion must be described as opened/explored progress rather than silently overloading completion semantics.
Date/Author: 2026-03-27 / Codex

Decision: Repeat visits to `/execute` after the user has already started the continuation funnel should land in `/mission`, not replay the bridge forever.
Rationale: The bridge page is the first-orientation moment. Once the user has entered the bonus library, the browseable home is the more useful repeat destination.
Date/Author: 2026-03-27 / Codex

Decision: Before unlock, direct visits to `/mission` or `/lesson/*` should render a locked-bonus state with copy and a CTA back to `/review`, not a silent redirect.
Rationale: The user should understand why the bonus funnel is unavailable and how to unlock it. A hard bounce to `/review` would hide the reason.
Date/Author: 2026-03-27 / Codex

Decision: During the route-contract milestone, unlocked `/mission` and `/lesson/*` visits can return explicit placeholder panels instead of the final restored mission and lesson runtime, as long as they stop redirecting to `/start`.
Rationale: This keeps Milestone 1 scoped to access behavior. The route contract becomes correct immediately, while the later mission-library and video-first lesson restore can proceed without half-wiring old course UI into the new bonus flow.
Date/Author: 2026-03-27 / Codex

Decision: The restored bonus funnel should use bonus-specific course queries and mutations instead of overloading the legacy completion-gated mission and lesson endpoints.
Rationale: The bonus contract is different from the old main-course contract: everything unlocks at once after review, view state is enough to count as exploration, and the lesson pages must stay video-first. A separate bonus surface keeps those rules local and avoids destabilizing remaining non-bonus consumers of the old course API.
Date/Author: 2026-03-27 / Codex

Decision: The restored bonus lesson route should reuse `LessonShellWatch` with a thin bonus footer and a dedicated view-tracker component rather than trying to coerce the old workbench runtime into a watch-first mode.
Rationale: The watch shell already matches the desired customer experience. Reusing it made the bonus lesson route much smaller and kept workbench code out of the post-review continuation path without editing the lesson manifest or the old lesson hook stack.
Date/Author: 2026-03-27 / Codex

Decision: After unlock, `/mission` shows the full 29-lesson library, with BUILD featured first and the other sections visibly demoted to reference status rather than hidden.
Rationale: The user explicitly wants earlier lessons available as references. Showing them directly avoids hidden deep-link-only content while still letting the bonus home emphasize BUILD as the recommended continuation path.
Date/Author: 2026-03-27 / Codex

Decision: Opening any unlocked bonus lesson is the only event that marks the continuation funnel as “started” for repeat `/execute` routing. Direct `/mission` visits after unlock are allowed and do not require a separate bridge-consumed workflow field.
Rationale: This keeps the route contract simple and avoids inventing a second persistence flag on top of `executeShipUnlockedAt`. The bridge remains the recommended entry point, but the unlocked library home is still a real destination.
Date/Author: 2026-03-27 / Codex

Decision: Bonus surfaces must relabel progress to opened/explored instead of completed, while preserving any pre-existing completed lesson states if they already exist.
Rationale: Viewing a bonus lesson is not the same as completing structured work. Keeping numeric orientation is still useful, but the UI must stop claiming completion for simple page-open behavior.
Date/Author: 2026-03-27 / Codex

Decision: Bonus section labels must be remapped to blueprint-era language on `/mission` and related bonus UI, even if the underlying block IDs remain `CEO`, `DESIGN`, `BUILD`, and `SHIP`.
Rationale: The current mission shell hardcodes the old main-course story. Reusing those labels verbatim would restore the wrong product framing even if the routing and unlock behavior are correct.
Date/Author: 2026-03-27 / Codex

Decision: The `/execute` bridge must support a dedicated Bunny video cleanly, but the route restore does not block on that asset being available on day one. A temporary text-orientation fallback is acceptable if the bridge remains small and the missing media is called out explicitly.
Rationale: The continuation restore should not get stuck on media operations. The bridge page still needs the right component boundary and content contract so the dedicated asset can be slotted in later without another route redesign.
Date/Author: 2026-03-27 / Codex

## Outcomes & Retrospective

This work is substantially implemented. `/execute` is now the bonus bridge, `/mission` is back as the BUILD-first bonus library, and `/lesson/*` is back as a video-first bonus lesson route that marks lessons as explored on open. The paid product now keeps its blueprint-first required outcome while restoring the continuation library as a real post-review bonus instead of a dead or half-restored route set.

The largest implementation risk was mixing two different product models in the same code path. The old lesson system was designed as the main funnel. The new product is blueprint-first. The implemented restore resolves that by treating the restored lesson system as a video-first bonus layer that lives after review, not as a rival source of project truth.

The remaining gap is live browser proof with a real unlocked account. Focused tests and production build passed, but no authenticated post-review session was provisioned in this turn, so the exact `/review -> /execute -> /lesson/iterate-the-product-with-ai -> /mission` browser walk still needs to be observed manually or with Playwright against a prepared account.

## Context and Orientation

The current product has two major systems that matter for this work. The first system is the blueprint-first required funnel. It lives under `apps/web/features/blueprint-flow/` and ends at `apps/web/app/(workspace)/review/page.tsx`. It is already the canonical paid product path. `apps/web/AGENTS.md` defines that required path as `Start -> Product -> Design -> Marketing -> Build Plan -> Review & Download` and labels `Execute / Ship` as an optional post-download library.

The second system is the older lesson and mission layer. That system still has a real curriculum, real lesson videos, mission-state queries, lesson-state queries, and complete rendering components. The curriculum is assembled in `apps/web/features/course/lesson/model/curriculum.ts`. The lesson runtime lives in `apps/web/features/course/lesson/components/lesson-page.tsx`, `apps/web/features/course/lesson/hooks/use-lesson-page.tsx`, `apps/web/features/course/lesson/hooks/use-lesson-state.ts`, and the lesson shells in `apps/web/features/course/lesson/shells/index.tsx`. The old library home and route model live in `apps/web/features/course/mission/components/mission-page.tsx` and `apps/web/features/course/mission/lib/mission-page-model.ts`.

Right now those two systems are not connected as a real continuation funnel. The route entries `apps/web/app/(workspace)/execute/page.tsx`, `apps/web/app/(workspace)/mission/page.tsx`, and `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` do not yet provide the desired post-review bonus flow. `/execute` still points to the first-slice placeholder hub. `/mission` and `/lesson/*` both redirect to `/start`. Restoring the continuation funnel means reconnecting these route entries under the right post-review gate.

The key shared gate already exists. `apps/web/convex/blueprint/workflowState.ts` stores `executeShipUnlockedAt` in `blueprintWorkflowStates`. `apps/web/features/execute-ship/components/execute-ship-page.tsx` already uses that field to redirect locked `/execute` visits back to `/review`. The restored bonus funnel should use the same unlock contract for `/execute`, `/mission`, and `/lesson/*`.

The current course state model is also still present. `apps/web/convex/course/shared.ts` loads viewer lesson states and computes unlocked lesson keys. `apps/web/convex/course/mission.ts` derives mission status. `apps/web/convex/course/lessonState.ts` returns lesson access and drives view, draft, and complete mutations. Today that model assumes a main-course progression with binary lesson access and interactive lessons. This plan changes how that model is used for the bonus continuation funnel: all bonus lessons become available at once after the execute unlock, bonus lessons are rendered video-first, and viewed state replaces completion gating for customer-facing progress.

There are 29 lessons in the active curriculum manifest. They still span `CEO`, `DESIGN`, `BUILD`, and `SHIP`. The restore keeps that full lesson inventory visible on bonus surfaces, but the user-facing library must be blueprint-era, not old-course-era. BUILD is the featured continuation path. The other sections remain browseable as references. The underlying block identifiers can stay intact in the data layer, but the bonus UI must remap the labels and supporting copy so the library does not read like the pre-blueprint main product.

The media layer is favorable to this plan. `apps/web/features/course/lesson/model/media.ts` already includes ready Bunny assets for BUILD and SHIP lessons, including `3.0 Build Kickoff`, `3.1 Iterate the product with AI`, `3.16 Finalize Build Handoff and Unlock Ship`, and `4.0 Product Review`. The new `/execute` bridge page needs a dedicated execute-context video, but the lesson library itself already has enough media to support a video-first restore.

For this plan, a bridge page means the `/execute` route that explains the bonus and then sends the user onward. A bonus-library home means the restored `/mission` route that lets the user browse the unlocked continuation lessons. A bonus lesson means any restored `/lesson/*` page that is now part of the post-review continuation funnel. Video-first means the bonus lesson route hides the old interactive workbench and presents the teaching layer first, even though the base lesson manifest still configures the lessons as split/workbench experiences today. The implementation should treat that as a bonus-mode override, not as an already-solved property of the curriculum.

The repeat-routing rule is intentionally narrow. A newly unlocked user may still visit `/mission` or a direct `/lesson/*` URL without first passing through `/execute`. The bridge is recommended, not mandatory. `/execute` should only stop showing the bridge once the user has opened any unlocked bonus lesson. That avoids adding another workflow-state field while still making `/execute` useful as an orientation moment.

## Plan of Work

The implementation should proceed by first establishing one shared bonus-access contract across the execute, mission, and lesson routes. The existing execute unlock in `blueprintWorkflowStates` already provides the right product trigger. The route layer should stop treating `/mission` and `/lesson/*` as dead legacy paths and instead use the blueprint workflow unlock to decide whether to render the bonus continuation funnel or a locked-bonus explanation. This is the foundation. Nothing else in the restored lesson system matters if the wrong users can reach it.

Once that gate is solid, replace `/execute` with the new bridge page. The bridge page should be intentionally small: one dedicated bonus-context video slot or temporary orientation fallback, one short explanation of why the blueprint-first funnel now hands off into the continuation library, and one primary CTA into lesson `3.1`. It should also define repeat-visit behavior explicitly by sending users who already opened any unlocked bonus lesson into `/mission` instead of replaying the bridge forever. Do not add a second persistence model for this if the existing course view state can answer the question.

After the bridge page exists, restore `/mission` and `/lesson/*`. `/mission` should not be the old weekend-roadmap dashboard with the old four-block story and completion framing. It should become the bonus-library home that acknowledges the user finished the blueprint, highlights the BUILD continuation path first, keeps the full unlocked lesson inventory visible, and clearly labels the non-BUILD sections as references. `/lesson/*` should stop redirecting and should render the lesson system again, but in bonus mode, which means video-first presentation, no editable workbench, and lightweight opened/explored progress.

Finally, update the course-state and shell surfaces that still assume the old completion model. Bonus progress should be derived from viewed/opened state, not described as completion. The safest implementation is to keep any existing completed records intact, derive bonus started/opened status from lesson-state presence or `lastViewedAt`, stop surfacing the old manual completion actions in the bonus path, and treat all bonus lessons as accessible once the execute unlock exists. Then the tests and route-model docs can be updated to reflect the restored post-review bonus funnel.

## Milestones

### Milestone 1: Establish one post-review bonus access contract for `/execute`, `/mission`, and `/lesson/*`

At the end of this milestone, the application will have one explicit definition of who can access the continuation bonus. That definition will be “customer has product access and `workflowState.executeShipUnlockedAt` exists.” `apps/web/app/(workspace)/execute/page.tsx`, `apps/web/app/(workspace)/mission/page.tsx`, and `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` will stop behaving like three unrelated surfaces. The execute page will still be gated, and mission and lesson pages will stop redirecting blindly to `/start`.

The main files touched in this milestone are the three route entrypoints above, plus whichever shared helper is introduced to check the blueprint workflow unlock for the current user and to summarize whether any unlocked bonus lesson has already been opened. The most likely shared source is a small server-side helper under `apps/web/features/execute-ship/` or a thin shared server helper that reads `api.blueprint.getBlueprintWorkspaceState` together with the relevant course view-state query. If pre-unlock access lands on `/mission` or `/lesson/*`, the user should see a locked-bonus explanation with a CTA back to `/review`, not a confusing bounce. If the user is already unlocked, direct `/mission` and direct `/lesson/*` visits remain allowed; do not add a second gate that forces `/execute` first.

Success for this milestone means a paid but not-yet-unlocked user cannot reach `/execute`, `/mission`, or `/lesson/*` without seeing clear product messaging that the bonus unlocks after review and download. It also means an unlocked user can reach all three surfaces without being sent back to `/start`, and no new workflow-state field is required just to remember bridge consumption.

### Milestone 2: Replace the current `/execute` placeholder with the real bridge page

At the end of this milestone, `/execute` will no longer render the first-slice duplicated tab hub. It will render a dedicated bridge page that explains the bonus continuation funnel and hosts either the dedicated execute-context video or a temporary orientation fallback that can be replaced by that video later without changing the route shape. The bridge page will have one primary CTA that takes the user to lesson `3.1`. Lesson `3.0` remains in the BUILD library but is no longer the recommended continuation start because the bridge itself now performs the kickoff function.

The main files touched in this milestone are `apps/web/app/(workspace)/execute/page.tsx` and new execute-specific bridge components under `apps/web/features/execute-ship/components/`. The old `execute-ship-hub.tsx` and `execute-ship-track-detail.tsx` should be retired or removed once the bridge is live. This milestone must also encode repeat-visit behavior: if the user already opened any unlocked bonus lesson, `/execute` should send them to `/mission` instead of replaying the bridge by default.

Success for this milestone means a newly unlocked user lands on a clean bridge page, understands what the bonus is, and can start the BUILD continuation funnel. A repeat visitor who already opened a bonus lesson should land in `/mission`. If the dedicated bridge video is not yet configured, the bridge still renders coherent orientation copy instead of blocking the route.

### Milestone 3: Restore `/mission` as the bonus-library home and `/lesson/*` as video-first bonus lesson pages

At the end of this milestone, `/mission` will be restored as the unlocked bonus-library home and `/lesson/*` will stop redirecting to `/start`. `/mission` must be reworked to match the blueprint-era bonus story: it should say the blueprint is complete, the continuation library is a bonus, BUILD is the featured starting path, and the other unlocked sections are references. It should still use the old rail pattern language where helpful, but it must not read like the old pre-blueprint course home.

The lesson route must also come back, but in bonus mode. The main files touched here are `apps/web/features/course/mission/components/mission-page.tsx`, its supporting mission components, `apps/web/features/course/lesson/components/lesson-page.tsx`, and the lesson route page. The bonus route should force a video-first bonus presentation regardless of the underlying interactive workbench config, so the implementation should introduce a clear runtime bonus-video mode in the lesson page or route layer instead of rewriting lesson content definitions in this slice. It must also remap the visible section labels on mission surfaces so the UI no longer says “CEO / DESIGN / BUILD / SHIP” as if those were the main product steps.

Success for this milestone means an unlocked user can enter `/mission`, see the bonus-library home, open any restored lesson, and get a video-first lesson page instead of the old interactive workbench. The full unlocked lesson inventory is visible, BUILD is clearly featured as the recommended continuation path, and the non-BUILD sections are clearly presented as references instead of hidden or mislabeled.

### Milestone 4: Convert course-state progress from completion-gated to viewed-progress for the bonus path

At the end of this milestone, the restored continuation funnel will feel alive without depending on the old manual completion buttons. All bonus lessons should be accessible once the execute unlock exists, and opening a lesson should produce visible opened/explored progress on bonus surfaces without falsely presenting that action as lesson completion. The old manual completion actions should no longer drive the customer-facing bonus path.

The main files touched in this milestone are the course-state and mission-state surfaces: `apps/web/convex/course/shared.ts`, `apps/web/convex/course/mission.ts`, `apps/web/convex/course/lessonState.ts`, `apps/web/features/course/mission/lib/mission-page-model.ts`, and any course UI components that still surface completion-specific copy or buttons for the bonus path. The implementation should reuse the existing `markLessonViewed` mutation and current lesson-state documents wherever possible, but it must update the bonus display model so view tracking produces meaningful mission and rail status. Prefer bonus-specific mapping from lesson-state presence or `lastViewedAt` over a sweeping global rewrite of course completion semantics unless that proves insufficient in practice.

Success for this milestone means the bonus-library home and lesson blueprint show lightweight opened/explored progress after users open lessons, without requiring explicit “complete lesson” actions, without re-locking the continuation sequence, and without printing “lessons completed” on the bonus surfaces.

### Milestone 5: Update tests, docs, and end-to-end proof for the restored bonus funnel

At the end of this milestone, the changed tests pass, the restored routes are covered, and the route model is durable for the next contributor. The execute integration test should prove the new bridge behavior instead of the old tab UI. The mission page test should prove the bonus-library home behavior and the blueprint-era label remap. New route-gating coverage should prove the pre-unlock locked-bonus state for `/mission` and `/lesson/*`. The browser proof should walk through review unlock, execute bridge, mission library home, and a restored lesson page. The old redirect-only route test for `/mission` should be replaced with the new contract.

The main files touched in this milestone are the focused tests under `apps/web/tests/integration-ui/` and `apps/web/tests/unit/`, plus any docs or `todo.md` entry needed to record the route-model restore. `bun run build` must pass before the milestone is complete.

## Concrete Steps

Work from the repository root unless a step says otherwise. Start by re-reading the current route entries, the mission-shell components, and the old course and blueprint contracts:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ sed -n '1,40p' apps/web/AGENTS.md
    $ sed -n '1,120p' apps/web/app/'(workspace)'/execute/page.tsx
    $ sed -n '1,120p' apps/web/app/'(workspace)'/mission/page.tsx
    $ sed -n '1,120p' apps/web/app/'(workspace)'/lesson/'[lessonKey]'/page.tsx
    $ sed -n '1,160p' apps/web/features/course/mission/components/mission-page-intro.tsx
    $ sed -n '1,200p' apps/web/features/course/mission/components/mission/mission-hero-card.tsx
    $ sed -n '1,220p' apps/web/features/course/lesson/model/curriculum.ts

The expected observation is that the blueprint-first contract still ends at review, `/execute` still exists, `/mission` and `/lesson/*` still redirect away from the old continuation system, and the mission shell still speaks in the old “weekend roadmap / lessons complete / all four blocks” voice even though the lesson registry remains real.

When Milestone 1 starts, create the shared bonus-access helper and thread it through the execute, mission, and lesson routes. Use additive server-side route checks first. Keep the user-facing behavior explicit by rendering a locked-bonus state for mission and lesson routes instead of only redirecting them. Do not add a new `bridgeViewedAt` workflow field unless the existing course view state proves insufficient. After the route gates exist, run the focused execute integration test and any new route-gating tests:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/execute-ship-page.test.tsx

The expected observation is that the old execute test will fail until it is rewritten around the new bridge semantics, and that locked mission and lesson visits can now be asserted directly instead of indirectly through `/start` redirects. Also update `tests/unit/app-workspace-mission-page.test.tsx`, which currently asserts the legacy redirect contract.

When Milestone 2 starts, build the new `/execute` bridge page under `apps/web/features/execute-ship/`. Reuse the existing shell and video primitives from the blueprint and lesson systems. Keep the page small: dedicated video slot or temporary orientation fallback, short explanation, and CTA into `3.1`. Do not rebuild a large tab workspace. Once the bridge exists, rerun the focused execute tests and verify repeat-visit behavior manually or in a new focused test. The repeat redirect should only trigger after an unlocked bonus lesson has been opened, not merely after visiting `/mission`.

When Milestone 3 starts, restore `/mission` and `/lesson/*`. Rework the mission home components instead of shipping the old page unchanged. Restore the lesson route by replacing the current redirect with a real route implementation that loads the lesson and forces bonus-mode video-first rendering. The expected observation is that an unlocked user can visit `/mission`, see BUILD featured, see the other sections presented as references with remapped blueprint-era labels, and open restored lessons without seeing the old workbench. Update `tests/unit/watch-lesson-contract.test.ts` or replace it with a bonus-route-specific contract so the test suite no longer asserts that no student-facing lesson path can render a watch-like shell.

When Milestone 4 starts, update the course-state behavior for bonus viewed progress. Use `markLessonViewed` as the central event and adapt lesson or mission status so opening a lesson is enough to show opened/explored progress on bonus surfaces. Audit `LessonPageFooter`, completion actions, header progress copy, hero-card progress copy, and any celebration or next-unlocked copy that would misrepresent the new video-first continuation model.

Before closing the work, run the narrowest relevant tests first, then the broader build:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/execute-ship-page.test.tsx
    $ bunx vitest run --project unit tests/unit/mission-page.test.tsx

Add new focused tests for the restored mission and lesson route gates, then run them with the same `bunx vitest run --project ...` pattern from `apps/web`. Update docs that currently describe `/execute` as an optional hub or the sole post-review route, especially `apps/web/content/docs/route-map.mdx` and `apps/web/content/docs/local-qa.mdx`, if the restored bonus-route model changes the customer-facing route map or QA checklist.

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run build

If route and browser behavior changed materially, run local manual proof with the web app:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run dev:web

The expected observation is that an unlocked user can move through `/review` -> `/execute` -> `3.1` -> `/mission` -> any restored lesson, while a locked user sees explicit bonus-locked messaging instead of being dropped back into `/start`.

## Validation and Acceptance

Acceptance is behavior-based. A user who has not yet unlocked the bonus by reaching review and downloading the starter must not be able to use `/execute`, `/mission`, or `/lesson/*` as continuation surfaces. Instead, those routes must explain that the bonus unlocks after review and link the user back to `/review`.

For an unlocked user entering the bonus for the first time, `/execute` must render the dedicated bridge page with the new video or temporary orientation fallback and a primary CTA into lesson `3.1`. That user must not see the old duplicated tab hub. For a user who has already opened any bonus lesson, `/execute` must send them to `/mission`.

`/mission` must render as a bonus-library home, not the old main-product mission dashboard. It should make it obvious that the blueprint work is complete, that BUILD is the recommended continuation path, and that the other lessons remain available as references. The old four-block course language must not dominate this surface. The visible section labels must be blueprint-era labels, not raw `CEO / DESIGN / BUILD / SHIP`.

Any restored `/lesson/*` page in the bonus funnel must render video-first. The old interactive workbench must not appear in the customer-facing bonus path, even if the underlying lesson definition still contains fields or workbench configuration. Page-open view state must be enough to produce visible opened/explored progress in the bonus library and blueprint.

Before the work is considered complete, the focused execute and mission tests must pass, the new route-gating coverage for mission and lesson pages must pass, the legacy `/mission -> /start` redirect test must be replaced, the watch-contract test surface must be updated for bonus mode, and `bun run build` must succeed. Browser or manual proof must demonstrate the full path from post-review unlock into the restored continuation funnel.

## Idempotence and Recovery

This plan is safe to execute incrementally because the bonus continuation funnel is already isolated from the required blueprint funnel by routing and unlock state. If a partial implementation breaks mission or lesson restore work midway through, keep the route gates in place and temporarily preserve the current redirects or locked-bonus states instead of exposing half-restored lesson pages.

If the new `/execute` bridge page is ready before mission and lesson restoration are finished, it is acceptable to keep its CTA disabled or routed to a temporary locked-bonus placeholder as long as the user-facing copy is explicit. Do not expose broken lesson routes just because the bridge page has landed first.

If runtime bonus-mode video forcing proves trickier than expected, prefer a small route-level override in the lesson page path over a broad lesson-content rewrite. The plan explicitly allows the first restore slice to keep the underlying lesson definitions intact while changing only how the bonus path renders them.

If viewed-progress changes start interfering with the old course completion logic in unintended places, keep the behavior scoped to the bonus continuation funnel. Prefer deriving bonus opened/explored status from existing lesson-state records and `lastViewedAt` before changing the generic completion lifecycle globally.

If the dedicated execute bridge video is not ready by the time the route work is otherwise complete, ship the route with the planned orientation fallback and record the missing Bunny asset here and in `Outcomes & Retrospective`. Do not leave the old tab hub in place just to wait on media.

## Artifacts and Notes

The most important repo facts supporting this plan are:

    apps/web/AGENTS.md
      - required funnel ends at Review & Download
      - Execute / Ship is an optional post-download library

    apps/web/app/(workspace)/mission/page.tsx
      - currently redirects to /start

    apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx
      - currently redirects to /start

    apps/web/features/course/lesson/model/curriculum.ts
      - still contains 29 active lesson entries
      - BUILD begins at 3.0 and includes 3.1 as the first non-kickoff build lesson

    apps/web/features/course/lesson/model/media.ts
      - already contains ready Bunny videos across BUILD and SHIP

    apps/web/tests/unit/watch-lesson-contract.test.ts
      - currently asserts that no student-facing lessons use the watch shell, so the bonus restore must replace that assumption explicitly

    apps/web/features/course/mission/components/mission-page-intro.tsx
      - currently says "Your weekend roadmap" and prints "x of y lessons complete"

    apps/web/features/course/shared/components/app-shell/app-shell-header-trailing.tsx
      - currently prints "x/y lessons completed" in the shell header

The earlier first-slice execute plan remains relevant only as historical context:

    docs/codex/2026-03-25-blueprint-progression-execute-ship-execplan.md
      - established the post-review unlock
      - the current initiative now supersedes its `/execute` UI direction

When implementation begins, add short transcripts here showing the route-gating checks, the new execute bridge behavior, the restored mission home, and the final build success.

Milestone 1 proof:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project unit tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx
      Test Files  2 passed (2)
      Tests  5 passed (5)

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/execute-ship-page.test.tsx
      Test Files  1 passed (1)
      Tests  3 passed (3)

Milestone 2-5 proof:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project unit tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/bonus-mission-page.test.tsx tests/unit/bonus-lesson-page.test.tsx tests/unit/watch-lesson-contract.test.ts
      Test Files  5 passed (5)
      Tests  14 passed (14)

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project unit tests/unit/mission-page.test.tsx
      Test Files  1 passed (1)
      Tests  3 passed (3)

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project unit tests/unit/app-workspace-execute-page.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/bonus-route-state.test.ts tests/unit/bonus-mission-page.test.tsx tests/unit/bonus-lesson-page.test.tsx tests/unit/watch-lesson-contract.test.ts tests/unit/mission-page.test.tsx
      Test Files  8 passed (8)
      Tests  24 passed (24)

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/execute-ship-page.test.tsx tests/integration-ui/bonus-lesson-view-tracker.test.tsx
      Test Files  2 passed (2)
      Tests  4 passed (4)

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run build
      ✓ Compiled successfully
      Finished TypeScript
      ✓ Generating static pages using 9 workers (68/68)

## Interfaces and Dependencies

The core shared dependency for the restored bonus funnel is the blueprint workflow unlock in `apps/web/convex/blueprint/workflowState.ts`. The restored execute, mission, and lesson routes must all use this same post-review unlock contract. The plan should not introduce a second bonus entitlement model.

The restore should not introduce a separate “bridge viewed” workflow field unless implementation proves that existing course view state cannot answer the repeat-routing question. The default design is: unlocked users may visit `/mission` and `/lesson/*` directly, and `/execute` only redirects to `/mission` after some unlocked bonus lesson has been opened.

The route entries that must exist and be coordinated are:

- `apps/web/app/(workspace)/execute/page.tsx`
- `apps/web/app/(workspace)/mission/page.tsx`
- `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx`

The execute bridge page should live under `apps/web/features/execute-ship/` and should replace the current first-slice hub components. Use feature-local naming that reflects the new bridge role, such as `execute-bonus-bridge-page.tsx`, instead of preserving generic hub names.

The mission library home continues to depend on the course mission model and lesson registry, but it must be reinterpreted for the bonus continuation funnel. The key current modules are `apps/web/convex/course/mission.ts`, `apps/web/features/course/mission/lib/mission-page-model.ts`, and `apps/web/features/course/lesson/model/curriculum.ts`. If those modules still encode the old completion-heavy worldview, the implementation should adapt them rather than attempting to bolt the new bonus story onto the old output unchanged.

The bonus restore likely needs a small display-model seam between the course mission data and the shell. Right now `apps/web/features/course/shared/components/app-shell/app-shell-props.ts` only exposes `progressCount` and `totalLessons`, and `apps/web/features/course/shared/components/app-shell/app-shell-header-trailing.tsx` hardcodes “lessons completed.” Either extend that interface with bonus-safe wording or provide a bonus-specific mission state that can render `opened`/`explored` counts without lying about completion.

The lesson route will continue to depend on the lesson registry, lesson shells, and course state surfaces:

- `apps/web/features/course/lesson/components/lesson-page.tsx`
- `apps/web/features/course/lesson/hooks/use-lesson-page.tsx`
- `apps/web/features/course/lesson/hooks/use-lesson-state.ts`
- `apps/web/convex/course/lessonState.ts`

The first restore slice should keep these modules intact where possible and introduce a clear bonus-video mode or route-level override so the old workbench is not shown in the bonus path. Do not assume the current manifest or the current watch-lesson tests already model this.

The required test touchpoints are:

- `apps/web/tests/integration-ui/execute-ship-page.test.tsx`
- `apps/web/tests/unit/mission-page.test.tsx`
- `apps/web/tests/unit/app-workspace-mission-page.test.tsx`
- `apps/web/tests/unit/watch-lesson-contract.test.ts`

Add new focused tests for mission and lesson route gating if they do not already exist. Keep validation narrow and evidence-based.
