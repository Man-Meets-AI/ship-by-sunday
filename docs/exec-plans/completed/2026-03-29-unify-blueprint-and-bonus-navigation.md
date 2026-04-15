---
summary: Remove Mission and Execute / Ship as user-facing navigation concepts, make Build Lessons the default continuation after Review & Download, and keep `/execute` plus `/mission` alive only as compatibility behavior while one shared header model drives blueprint and post-download surfaces.
read_when: Open this plan when implementing or reviewing the 2026-03-29 workspace navigation rewrite across review, unlocked header IA, lesson pages, Lesson Map affordances, and compatibility redirects.
plan_status: done
---

# Make Post-Review Navigation Match The Blueprint

This is a living execution plan. Keep it updated as implementation progresses so a new contributor can resume from this file alone without relying on chat history.

Maintain this ExecPlan in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday is already blueprint-first in the required funnel, but the runtime still changes vocabulary and route semantics the moment a buyer leaves Review. Today the review screen still teaches `Execute / Ship`, `/execute` still renders a one-time bridge, `/mission` still behaves like a stable browse page, lesson pages still send people back to Mission, and the header shell still thinks in mission blocks. After this change, the required run will still end at `Review & Download`, but the unlocked experience will use one header language and one continuation model: `Review | Build Lessons | Launch Lessons | Bonus`. `Build Lessons` becomes the default next move after download, `Launch Lessons` becomes the user-facing label for the old SHIP block, `Bonus` becomes a dropdown instead of a route target, and the Lesson Map becomes an optional reusable surface that appears only after download instead of acting like the primary home.

A human should be able to prove the result by buying access, finishing the blueprint, reaching `Review & Download`, downloading the Blueprint, seeing the unlocked header switch to `Review | Build Lessons | Launch Lessons | Bonus`, clicking `Continue to Build Lessons` into lesson `3.1`, opening the optional Lesson Map from the unlocked review or lesson UI, and confirming that old `/execute` and `/mission` links still land on the canonical post-review experience without teaching `Mission` or `Execute / Ship` as the main wayfinding model.

## Progress

- [x] 2026-03-29 16:17 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, and `docs/prompts/execplan-writer.md`. Inspected the live route, nav, review, lesson, and test surfaces that currently shape blueprint and post-review navigation.
- [x] 2026-03-29 17:06 EDT — Re-inspected `apps/web/app/(workspace)/review`, `/execute`, `/mission`, `/lesson/[lessonKey]`, the shared `AppShell`, curriculum helpers, resume routing, proxy protection, and the current unit plus integration tests so this plan reflects the approved `Review | Build Lessons | Launch Lessons | Bonus` IA instead of the older `Review | Build | Ship | Bonus` and stable `/mission` assumptions.
- [x] 2026-03-29 17:31 EDT — Centralized route semantics in `apps/web/features/workspace-navigation/lib/post-review-destination.ts`, widened `api.blueprint.getBlueprintResumeDestination` to return blueprint, review, and post-review targets, redirected `/execute` to the canonical Build Lessons target, redirected unlocked `/mission` to `/review?showLessonMap=1`, and validated the slice with focused unit tests plus `bun run --cwd apps/web typecheck`.
- [x] 2026-03-29 18:08 EDT — Replaced `AppShell`’s hidden mission query path with an explicit `primaryNav` contract, added shared workspace-nav model plus component files under `apps/web/features/workspace-navigation/`, moved blueprint-stage navigation into the shell header, and wired unlocked lesson pages to the new `Review | Build Lessons | Launch Lessons | Bonus` header while keeping footer-rail progress on the existing mission data.
- [x] 2026-03-29 18:32 EDT — Completed the explicit header-nav cutover for the active surfaces: blueprint pages, unlocked review, and unlocked lesson pages now all pass explicit `primaryNav` items into `AppShell`, the Bonus dropdown uses the shared workspace-nav model, and `AppShell` no longer auto-queries `getMissionState`.
- [x] 2026-03-29 18:31 EDT — Made `/api/download/repo` the canonical unlock path, removed the second unlock-only CTA from review, switched unlocked review to the workspace header plus `Continue to Build Lessons`, and extracted `apps/web/features/execute-ship/components/lesson-map-surface.tsx` so review and lesson pages can reveal the same Lesson Map without routing through `/mission`.
- [x] 2026-03-29 19:05 EDT — Removed the remaining live Mission and Execute / Ship copy plus canonical `/mission` fallbacks from settings, artifacts, lesson completion, legacy lesson redirects, stale starter-access workbench copy, and dead execute bridge components, while keeping `/mission` and `/execute` alive only as protected compatibility routes.
- [x] 2026-03-29 19:06 EDT — Re-ran the focused unit, proxy, contract, integration-ui, typecheck/build, and browser-smoke lanes, and updated this plan with the final validation transcripts plus the last stale browser-smoke assertions that needed to match the current homepage copy.

## Surprises & Discoveries

The current review handoff still requires a second unlock click after download. `apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx` sets local download state, then separately calls `api.blueprint.unlockExecuteShip` and pushes to `routeConfig.execute`. `apps/web/features/blueprint-flow/components/review/blueprint-review-execute-preview.tsx` still teaches `Continue into Execute / Ship`, so the deprecated concept is still behavioral, not just textual.

`/execute` and `/mission` are still first-class pages, not compatibility-only entrypoints. `apps/web/app/(workspace)/execute/page.tsx` loads bonus access and renders `ExecuteShipPage`. `apps/web/features/execute-ship/components/execute-ship-page.tsx` redirects repeat visitors to `routeConfig.mission` and renders `ExecuteBonusBridgePage` for first-time unlocked users. `apps/web/app/(workspace)/mission/page.tsx` still serves a full locked or unlocked browse surface and currently tells locked users `Mission opens after Review & Download.`

Lesson pages still assume Mission is the browse destination. `apps/web/features/execute-ship/components/bonus-lesson-page.tsx` links to `/mission` in the alert copy, `apps/web/features/execute-ship/components/bonus-lesson-footer.tsx` exposes `Bonus library` as a `/mission` link, `apps/web/features/execute-ship/lib/bonus-library-presentation.ts` falls back to `/execute`, and `apps/web/features/course/lesson/model/curriculum.ts` still maps `1.0` and `routeConfig.mission` through `getLessonHref`.

The shared shell contract is still mission-shaped. `apps/web/features/course/shared/components/app-shell.tsx` auto-queries `api.course.getMissionState` unless callers opt out, `apps/web/features/course/shared/components/app-shell/app-shell-header.tsx` renders mission-rail variants, `apps/web/features/course/shared/components/app-shell/app-shell-props.ts` exposes `mission`, `showMissionRail`, and `enableMissionQuery`, and `apps/web/features/settings/components/settings-page-shell.tsx` still preloads mission data just to render header chrome.

Validation already encodes the old IA. `apps/web/tests/integration-ui/blueprint-review-page.test.tsx` expects `Continue into Execute / Ship`, `apps/web/tests/integration-ui/execute-ship-page.test.tsx` expects a first-time bridge and a repeat redirect to `/mission`, `apps/web/tests/unit/app-workspace-mission-page.test.tsx` treats `/mission` as a stable unlocked page, and `apps/web/tests/unit/product-shell.test.tsx` plus `product-shell-navigation.test.ts` assert mission-rail behavior instead of the new explicit header model.

`fetchAuthenticatedQuery` remains typed as nullable in the app-route server pages even when the underlying query is required. The new `/execute` and `/mission` compatibility redirects therefore need explicit `null` guards before reading `postReviewTargets` or the serialized Next typecheck fails.

Moving blueprint-stage navigation into the shell header changed the integration-test seam, not the blueprint behavior. `apps/web/tests/integration-ui/blueprint-stage-page.test.tsx` had to update its `AppShell` mock to render the explicit `primaryNav` prop; otherwise the blueprint-stage navigation disappeared from the test DOM even though the real runtime was behaving correctly.

Unlocking from inside the download route turned out to be the safest low-scope handoff. `apps/web/app/api/download/repo/route.ts` can call `api.blueprint.unlockExecuteShip` only after the archive has been built successfully, which preserves a no-JavaScript fallback and keeps the unlock state aligned with the actual Blueprint response instead of a separate client-only click.

Browser smoke surfaced two stale homepage assertions that were unrelated to the navigation rewrite but blocked the final proof lane. The live homepage CTA copy is `Get the system`, and the current top bar no longer renders a `Blog` link, so `apps/web/tests/browser-smoke/app-smoke.spec.ts` had to be updated to assert the actual shipped marketing shell before the browser-smoke lane would pass.

## Decision Log

Decision — Remove Mission and Execute / Ship as user-facing concepts in this slice, but keep the persisted `executeShipUnlockedAt` storage field unchanged.
Rationale — The IA change is user-facing and route-facing. It does not require a data migration, and delaying storage renames keeps implementation smaller and safer.
Date — 2026-03-29.

Decision — The unlocked top-level header information architecture is `Review | Build Lessons | Launch Lessons | Bonus`.
Rationale — This is the approved IA. `Review` keeps continuity with the blueprint run, `Build Lessons` becomes the primary continuation, `Launch Lessons` replaces the old SHIP label in user-facing UI, and `Bonus` becomes a container for secondary references instead of a route destination.
Date — 2026-03-29.

Decision — `Review & Download` is the pivot surface. Before unlock it uses the blueprint-stage header model. After unlock it uses the unlocked header model with `Review` active.
Rationale — The header transition needs to happen where the funnel actually ends. Leaving review on the old nav after unlock would preserve the split mental model.
Date — 2026-03-29.

Decision — A successful Blueprint download is the canonical unlock event for post-review content.
Rationale — The approved direction says the required run ends at `Review & Download`. The extra unlock-only click exists only to preserve the old Execute concept and should be removed.
Date — 2026-03-29.

Decision — `Build Lessons` resolves to the centralized BUILD resume target, defaulting to lesson `3.1` when the user has no post-review history.
Rationale — The approved direction explicitly says Build Lessons is the default continuation after Review & Download, and lesson `3.1` is already the recommended BUILD start in the current bonus presentation.
Date — 2026-03-29.

Decision — `Launch Lessons` is the user-facing label for the existing SHIP block and resolves through the same centralized resume logic used by Build Lessons.
Rationale — The user-facing IA changes, but the underlying curriculum and block identifiers can stay stable for this slice.
Date — 2026-03-29.

Decision — `Bonus` is a header dropdown, not a route target.
Rationale — The approved IA explicitly demotes the old browse page. The nav model therefore needs a menu-capable item, not another top-level destination.
Date — 2026-03-29.

Decision — The Bonus dropdown must expose at least Product lessons, Design lessons, and a Lesson Map entry, with Build and Launch kept as top-level items rather than duplicated inside Bonus.
Rationale — Product and Design remain useful references, but they are no longer primary path choices. The Lesson Map remains useful as a secondary overview, but not as the main browse concept.
Date — 2026-03-29.

Decision — The Lesson Map is a reusable optional surface that appears only after unlock on canonical review and lesson pages. It is not a stable primary route.
Rationale — This matches the approved direction and removes the need for `/mission` to remain a taught browse destination.
Date — 2026-03-29.

Decision — `/execute` remains compatibility-only behavior and should become a pure redirect to the canonical Build Lessons destination.
Rationale — The current bridge page exists only because the product still teaches Execute as a concept. The new IA removes that concept.
Date — 2026-03-29.

Decision — `/mission` remains compatibility-only behavior and should redirect into a canonical unlocked surface that can reveal the Lesson Map when possible, falling back to the plain Build Lessons destination if the reveal cannot be honored.
Rationale — Old deep links should not 404, but `/mission` should stop acting like the stable browse page or the Bonus destination.
Date — 2026-03-29.

Decision — The shared header contract must become explicit and route-agnostic instead of mission-shaped. Hidden `getMissionState` queries should be removed from live shell behavior.
Rationale — The current mission auto-query is the architectural reason blueprint and post-review surfaces still render different navigation systems.
Date — 2026-03-29.

Decision — `/mission` compatibility redirects now target `/review?showLessonMap=1` instead of a dedicated browse page.
Rationale — Review is the canonical unlocked surface in the approved IA. Carrying the reveal query through the redirect keeps the Lesson Map request centralized now, while Milestones 3 and 4 can teach review and lesson pages to honor it without changing the redirect contract again.
Date — 2026-03-29.

Decision — The legacy `1.0` and `/mission` lesson aliases stay intact during Milestone 1.
Rationale — The compatibility route now immediately redirects into the canonical unlocked surface, so changing the aliases in the same slice would not improve user-visible behavior. Keeping them untouched minimizes blast radius until the later legacy-cleanup milestone removes canonical `/mission` fallbacks end to end.
Date — 2026-03-29.

Decision — The shared shell keeps `mission` data only as a progress plus footer-rail input while the header moves to explicit `primaryNav` items.
Rationale — This removes the hidden header query and mission-shaped routing contract immediately without forcing the footer rail, bonus lesson progress, and current-block detection into the same refactor. The remaining `mission` prop is now a scoped presentation input rather than the source of header navigation truth.
Date — 2026-03-29.

Decision — Successful Blueprint responses from `/api/download/repo` now call `api.blueprint.unlockExecuteShip` on the server before the archive is returned.
Rationale — The download response is the canonical proof that the handoff actually happened. Unlocking in the route handler removes the second post-download click, keeps no-JavaScript behavior intact, and reuses the existing idempotent mutation instead of inventing a parallel unlock path.
Date — 2026-03-29.

Decision — The shared Lesson Map surface is revealed locally on review and lesson pages through the `showLessonMap` action, while `/mission` compatibility still redirects to `/review?showLessonMap=1`.
Rationale — This keeps the compatibility route stable for old links, but the live product no longer depends on a dedicated Mission page to show the browse surface. The header Bonus menu and lesson footer now point at the same reusable component instead of a route-specific page.
Date — 2026-03-29.

## Outcomes & Retrospective

This section should be updated during implementation. At completion it should describe whether Review became the unlock pivot, whether the header truly unified around `Review | Build Lessons | Launch Lessons | Bonus`, whether `/execute` and `/mission` became compatibility-only redirects, whether the Lesson Map works as an unlocked optional surface on review and lesson pages, and which internal names still remain for compatibility.

The most likely intentional follow-up, if this lands cleanly, will be a narrower naming cleanup for durable internal artifacts such as `bonusMission` queries or `executeShipUnlockedAt`. That follow-up should happen only after the new route and navigation model is proven stable with QA.

Milestone 1 outcome — The resume contract is now centralized and testable. Granted home visitors can resume into blueprint or post-review destinations from one helper, `/execute` no longer renders a bespoke bridge page, and unlocked `/mission` visits now collapse into the canonical review surface with a Lesson Map reveal query instead of serving a browse page.

Milestone 2 outcome — The shell header now consumes explicit navigation props instead of querying mission state for itself. Blueprint pages render their stage navigation from the header, and unlocked review plus lesson pages render the shared `Review | Build Lessons | Launch Lessons | Bonus` header model with the Bonus dropdown.

Milestone 3 outcome — Review is now the real unlock pivot. Downloading the Blueprint is the idempotent unlock event, the review CTA now advances directly to Build Lessons instead of a second Execute step, and the shared Lesson Map surface opens on review and lesson pages without routing through a separate Mission page.

Milestone 4 outcome — The post-review lessons no longer send users to `/mission`. The lesson footer, alert copy, Bonus dropdown, and review handoff all converge on the shared `LessonMapSurface`, while Product and Design references stay inside the Bonus menu instead of competing as top-level siblings.

Milestone 5 outcome — The live runtime no longer depends on mission-shaped shell behavior or canonical `/mission` fallbacks. Settings no longer preload mission state, artifacts and completion fallbacks point at the canonical Lesson Map href, the dead mission-rail and execute-bridge code paths were removed, and `/execute` plus `/mission` remain only as protected compatibility redirects. The remaining intentional legacy names are internal compatibility artifacts such as `executeShipUnlockedAt`, `routeConfig.mission`, `api.course.getBonusMissionState`, and the `course/mission` historical model that still exists outside the live runtime.

## Context and Orientation

The blueprint funnel remains the source of truth for the required run. `packages/blueprint-compiler/src/stages/stage-definitions.ts` defines `start`, `product`, `design`, `marketing`, `build-plan`, and `review`, while `packages/blueprint-compiler/src/readiness/derive-stage-status.ts` determines which stages are unlocked. Nothing in this plan changes blueprint stage order.

`apps/web/features/blueprint-flow/` owns the blueprint runtime. `apps/web/features/blueprint-flow/lib/blueprint-stage-routes.ts` computes stage and step URLs. `apps/web/features/blueprint-flow/lib/blueprint-stage-nav-model.ts` builds the blueprint-stage header items, and blueprint pages now pass those items into `AppShell` through explicit `primaryNav` props. `apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx` and `blueprint-review-execute-preview.tsx` now treat the download response itself as the unlock event and reveal the post-review continuation state without a second click.

Post-review routing still spans three entrypoints, but only one of them is canonical. `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` renders the unlocked lessons. `apps/web/app/(workspace)/execute/page.tsx` is now a compatibility redirect into the centralized Build Lessons destination, and `apps/web/app/(workspace)/mission/page.tsx` is a compatibility redirect into the review surface with a Lesson Map reveal query. `apps/web/features/execute-ship/server/load-bonus-route-access.ts` still reads `workspaceState.workflowState?.executeShipUnlockedAt` to gate post-review access.

The current lesson browse state already comes from bonus-specific data, not from the old mission route. `apps/web/convex/course/bonusMission.ts` builds the current post-review lesson state from course progress plus the unlock marker. `apps/web/features/execute-ship/lib/bonus-library-presentation.ts` turns internal block ids into current user-facing labels and already recommends lesson `3.1`. That file, or a replacement beside it, should keep owning the mapping from internal BUILD and SHIP blocks to the new `Build Lessons` and `Launch Lessons` labels.

The shared shell is now explicit. `apps/web/features/course/shared/components/app-shell.tsx` no longer auto-queries `api.course.getMissionState`. `apps/web/features/course/shared/components/app-shell/app-shell-primary-nav.tsx` chooses between blueprint-stage navigation and the unlocked workspace navigation, while `apps/web/features/workspace-navigation/components/workspace-primary-nav.tsx` renders the `Review | Build Lessons | Launch Lessons | Bonus` model. The remaining `mission` prop exists only as a progress and footer-rail input for unlocked lesson surfaces.

Resume routing is currently blueprint-only. `apps/web/features/product-access/server/product-access.ts` calls `api.blueprint.getBlueprintResumeDestination`, which is implemented in `apps/web/convex/blueprint/stageReadiness.ts` and only knows about blueprint completion. That means the root redirect in `apps/web/app/page.tsx` never considers post-review progress. The new plan needs one central post-review destination contract that can answer three questions: where should `Build Lessons` go, where should `Launch Lessons` go, and what should compatibility links like `/execute` and `/mission` do.

The current curriculum helpers keep compatibility ids but no longer treat `/mission` as the canonical browse destination. `apps/web/features/course/lesson/model/curriculum.ts` now maps `1.0` and incoming `routeConfig.mission` identifiers to the canonical review + Lesson Map href, while the compatibility route itself still exists for old deep links.

The route protection layer already treats `/mission` and `/execute` as canonical workspace routes. `apps/web/proxy.ts` protects both, and `apps/web/tests/unit/proxy-protected-routes.test.ts` asserts `/mission` but currently omits `/execute` from the expected array. Because `/mission` and `/execute` remain compatibility-only behavior, they should stay protected and tested even after they stop being taught in the UI.

The old mission runtime still exists. `apps/web/features/course/mission/` and `apps/web/convex/course/mission.ts` model the older course home and resume behavior. The live `/mission` route no longer uses them, and the shell plus settings pages no longer depend on mission-shaped state. Those modules remain only as historical compatibility and test surface.

The current implementation direction should stay feature-based and small. A likely structure is:

    Before
      apps/web/features/blueprint-flow/components/blueprint-stage-nav.tsx
      apps/web/features/course/shared/components/app-shell/*
      apps/web/features/execute-ship/components/bonus-mission-page.tsx
      apps/web/features/execute-ship/lib/bonus-library-presentation.ts

    After
      apps/web/features/workspace-navigation/components/workspace-primary-nav.tsx
      apps/web/features/workspace-navigation/lib/build-primary-nav-model.ts
      apps/web/features/workspace-navigation/lib/post-review-destination.ts
      apps/web/features/execute-ship/components/lesson-map-surface.tsx
      apps/web/features/execute-ship/components/post-review-bonus-menu.tsx
      apps/web/features/course/shared/components/app-shell/* consuming explicit nav props instead of mission auto-query

Use that as direction, not a rigid mandate. The important outcome is one explicit header model with a dropdown-capable Bonus item, not the exact folder names.

## Plan of Work

Start by freezing route semantics and compatibility behavior before touching copy or visuals. One helper should decide blueprint resume, Build Lessons resume, Launch Lessons resume, and optional Lesson Map reveal behavior from blueprint readiness, unlock state, and post-review lesson history. `Build Lessons` should resolve to lesson `3.1` or the latest valid BUILD progress. `Launch Lessons` should resolve to the latest valid SHIP progress or the first SHIP lesson when none exists. `/execute` should become a thin compatibility redirect into the Build Lessons target. `/mission` should stop rendering its own stable browse page and instead redirect into a canonical unlocked surface while requesting the optional Lesson Map when possible.

Once route semantics are central, replace mission-shaped shell inputs with an explicit primary-nav model. The blueprint pages still need the blueprint-stage links. Unlocked review and unlocked lesson pages need the new top-level items. That means the primary-nav model must be able to represent both simple top-level links and a dropdown menu item. It should also be explicit per page so `AppShell` stops inventing mission state with hidden queries.

Then rework the review handoff. The review page should remain blueprint-nav until download succeeds or the unlock marker already exists. After unlock, the same screen should switch to the unlocked header with `Review` active, expose `Continue to Build Lessons` as the primary next move, and expose the Lesson Map only as a secondary optional surface. The download path should set the unlock marker as part of the canonical handoff so there is no second unlock-only button.

After the review pivot works, make lesson pages match it. `BonusLessonPage` and any other post-review lesson surfaces should stop linking back to `/mission` and instead surface `Lesson Map` as an optional affordance on the current page, plus the new Bonus dropdown in the shared header. Product and Design references should remain reachable through Bonus, but they should no longer compete with Build Lessons as top-level siblings.

Finish by cleaning up stale mission assumptions and proving the compatibility layer. Sweep `routeConfig.mission` fallbacks, mission-shaped AppShell props, settings preloads, artifacts links, and old tests. Keep `/mission` and `/execute` protected and tested, but make sure they are treated as compatibility-only behavior in both code and docs.

## Milestones

### Milestone 1 — Canonical post-review destinations and compatibility redirects

At the end of this milestone, the repository will have one deterministic answer for blueprint resume, Build Lessons resume, Launch Lessons resume, and compatibility entrypoints. Blueprint-incomplete users will still resume to the first incomplete blueprint stage. Blueprint-complete users with unlock state will no longer always resume to `/review`; they will be able to resume into the correct post-review destination model. `/execute` will be a compatibility redirect into the Build Lessons target. `/mission` will no longer render a stable browse page; it will redirect into a canonical unlocked surface and request Lesson Map reveal behavior if that surface supports it.

This milestone should touch `apps/web/config/product.ts`, `apps/web/features/product-access/server/product-access.ts`, `apps/web/convex/blueprint/stageReadiness.ts`, a new or updated post-review destination helper under `apps/web/features/workspace-navigation/` or `apps/web/features/execute-ship/`, `apps/web/app/(workspace)/execute/page.tsx`, `apps/web/app/(workspace)/mission/page.tsx`, and the curriculum alias helpers in `apps/web/features/course/lesson/model/curriculum.ts` plus `apps/web/features/course/lesson/utils/legacy-routes.ts`.

Success looks like route resolution being centralized and testable. The home redirect can send finished buyers into post-review progress, `/execute` never renders a unique page, and `/mission` stops acting like a stable browse destination even though old links still work.

### Milestone 2 — One explicit header model for blueprint and unlocked surfaces

At the end of this milestone, blueprint pages, unlocked review, and unlocked lesson pages will render their primary navigation from one explicit header model. Before unlock, the model renders blueprint-stage navigation. After unlock, it renders `Review | Build Lessons | Launch Lessons | Bonus`. `Bonus` is a dropdown. The header shell no longer depends on hidden mission queries, and settings no longer need mission preloads just to render chrome.

This milestone should touch `apps/web/features/course/shared/components/app-shell.tsx`, `apps/web/features/course/shared/components/app-shell/app-shell-header.tsx`, `apps/web/features/course/shared/components/app-shell/app-shell-props.ts`, the mission-rail components, `apps/web/features/course/shared/utils/app-shell-navigation.ts`, `apps/web/features/blueprint-flow/components/blueprint-stage-nav.tsx`, `apps/web/features/blueprint-flow/lib/blueprint-stage-nav-model.ts`, and any new feature-local files added under `apps/web/features/workspace-navigation/`.

Success looks like the header no longer being mission-shaped. Blueprint pages still show blueprint stages. Unlocked review and lesson pages show `Review | Build Lessons | Launch Lessons | Bonus`, with Build and Launch resolving through centralized target helpers and Bonus opening a dropdown instead of navigating to `/mission`.

### Milestone 3 — Review becomes the real handoff and unlock pivot

At the end of this milestone, `Review & Download` will be both the end of the required blueprint run and the first unlocked post-review surface. Before download, review still behaves like the final blueprint stage. After download or when the unlock marker already exists, the same surface switches to the unlocked header, shows `Continue to Build Lessons` as the primary next move, and exposes a secondary Lesson Map affordance without teaching Mission or Execute / Ship.

This milestone should touch `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx`, `apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx`, `apps/web/features/blueprint-flow/components/review/blueprint-review-execute-preview.tsx`, `apps/web/app/api/download/repo/route.ts`, and any helper that currently calls `api.blueprint.unlockExecuteShip`.

Success looks like the second unlock click disappearing, `Continue to Build Lessons` replacing `Continue into Execute / Ship`, the review page switching header states truthfully, and the Lesson Map becoming available only after a successful download or existing unlock.

### Milestone 4 — Lesson page affordances and reusable Lesson Map surface

At the end of this milestone, the post-review lessons will no longer send users to `/mission`. Instead they will expose the new unlocked header, optional Lesson Map affordances, and Bonus dropdown entries for Product and Design references. The Lesson Map itself will be reusable and route-independent so review and lesson pages can both reveal it without creating a new primary route concept.

This milestone should touch `apps/web/features/execute-ship/components/bonus-lesson-page.tsx`, `apps/web/features/execute-ship/components/bonus-lesson-footer.tsx`, `apps/web/features/execute-ship/components/bonus-mission-page.tsx` or its renamed replacement, `apps/web/features/execute-ship/components/bonus-mission-hero-card.tsx`, `apps/web/features/execute-ship/lib/bonus-library-presentation.ts`, and any new `lesson-map-surface` component or hook used by review and lesson pages.

Success looks like lesson pages offering `Lesson Map` as a secondary affordance instead of a `/mission` link, `Build Lessons` staying the primary restart path, and Product plus Design references living inside Bonus rather than as top-level header peers.

### Milestone 5 — Legacy mission cleanup, validation, and rollback hardening

At the end of this milestone, the live runtime will no longer depend on mission-shaped shell behavior or canonical `/mission` fallbacks. Compatibility routes will remain protected, tests will assert the new IA, and rollback instructions will be recorded in this plan without requiring any schema migration.

This milestone should touch `apps/web/features/settings/components/settings-page-shell.tsx`, `apps/web/features/course/artifacts/components/artifacts-page.tsx`, `apps/web/features/course/artifacts/components/artifacts-page-states.tsx`, `apps/web/features/course/lesson/hooks/use-lesson-completion.ts`, `apps/web/proxy.ts`, `apps/web/tests/unit/app-workspace-mission-page.test.tsx`, `apps/web/tests/unit/app-workspace-execute-page.test.tsx`, `apps/web/tests/unit/product-shell.test.tsx`, `apps/web/tests/unit/product-shell-navigation.test.ts`, `apps/web/tests/unit/proxy-protected-routes.test.ts`, `apps/web/tests/integration-ui/blueprint-review-page.test.tsx`, `apps/web/tests/integration-ui/execute-ship-page.test.tsx`, and related contract or browser tests. If `apps/web/features/course/mission/` and `apps/web/convex/course/mission.ts` become fully unused, remove or quarantine them in this milestone.

Success looks like no primary runtime code teaching Mission or Execute / Ship, compatibility routes still functioning, focused tests passing, and this plan documenting how to roll back only the routing plus nav layer if needed.

## Concrete Steps

1. Freeze the new route semantics before changing components.

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Files to inspect and edit first:
        apps/web/config/product.ts
        apps/web/features/product-access/server/product-access.ts
        apps/web/convex/blueprint/stageReadiness.ts
        apps/web/app/page.tsx
        apps/web/app/(workspace)/execute/page.tsx
        apps/web/app/(workspace)/mission/page.tsx
        apps/web/features/course/lesson/model/curriculum.ts
        apps/web/features/course/lesson/utils/legacy-routes.ts

    Frozen rules to encode:
        - blueprint-incomplete visitors still resume into the first incomplete blueprint stage
        - unlocked visitors use `Review | Build Lessons | Launch Lessons | Bonus`
        - `Build Lessons` defaults to lesson `3.1` and otherwise resumes BUILD progress
        - `Launch Lessons` resumes SHIP progress but is labeled `Launch Lessons` in UI
        - `Bonus` is not a route target
        - `/execute` is compatibility-only redirect behavior
        - `/mission` is compatibility-only redirect or reveal behavior, not a browse page
        - no new primary `lesson-map` route should be added unless implementation proves the reusable surface approach is impossible

    Expected observation after this step:
        Home redirects, header links, and compatibility routes all resolve through the same post-review destination logic instead of page-local redirects and hardcoded `/mission` fallbacks.

2. Build the explicit header-nav model and remove the shell auto-query.

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Files to edit:
        apps/web/features/course/shared/components/app-shell.tsx
        apps/web/features/course/shared/components/app-shell/app-shell-header.tsx
        apps/web/features/course/shared/components/app-shell/app-shell-props.ts
        apps/web/features/course/shared/utils/app-shell-navigation.ts or a replacement wrapper
        apps/web/features/blueprint-flow/components/blueprint-stage-nav.tsx
        apps/web/features/blueprint-flow/lib/blueprint-stage-nav-model.ts
        new files under apps/web/features/workspace-navigation/ if extraction is chosen

    The new primary-nav model must support:
        - top-level link items for blueprint stages before unlock
        - top-level link items for `Review`, `Build Lessons`, and `Launch Lessons` after unlock
        - a top-level menu item for `Bonus`
        - dropdown entries that can be links or local actions, so `Lesson Map` can open a local surface instead of navigating to `/mission`

    Expected observation after this step:
        Blueprint pages and unlocked post-review pages use one header component family, and `AppShell` no longer calls `api.course.getMissionState` just to decide what nav to render.

3. Rework the review handoff so download is the unlock event and Build Lessons is the next move.

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Files to edit:
        apps/web/features/blueprint-flow/components/blueprint-review-page.tsx
        apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx
        apps/web/features/blueprint-flow/components/review/blueprint-review-execute-preview.tsx
        apps/web/app/api/download/repo/route.ts
        apps/web/features/blueprint-flow/server/downloads.ts
        apps/web/convex/blueprint/workflowState.ts if helper reuse is needed

    Required behavior:
        - review remains the final blueprint stage before unlock
        - download success leaves `executeShipUnlockedAt` set idempotently
        - no second unlock-only button remains
        - the primary unlocked CTA becomes `Continue to Build Lessons`
        - the Lesson Map is unavailable before unlock and optional after unlock

    Expected observation after this step:
        The review page becomes the truthful handoff point. A buyer downloads the Blueprint, sees the unlocked header, and can go straight into Build Lessons without ever learning a separate Execute route.

4. Extract the reusable Lesson Map surface and wire the Bonus dropdown plus lesson affordances around it.

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Files to edit:
        apps/web/features/execute-ship/components/bonus-lesson-page.tsx
        apps/web/features/execute-ship/components/bonus-lesson-footer.tsx
        apps/web/features/execute-ship/components/bonus-mission-page.tsx or its replacement
        apps/web/features/execute-ship/components/bonus-mission-hero-card.tsx
        apps/web/features/execute-ship/lib/bonus-library-presentation.ts
        any new `lesson-map-surface` component, hook, or presentation wrapper

    Required behavior:
        - review and lesson pages can both reveal the same Lesson Map surface after unlock
        - Bonus dropdown exposes Product references, Design references, and Lesson Map
        - lesson copy and footer links stop using `/mission`
        - Build Lessons remains the primary restart path

    Expected observation after this step:
        Users can inspect the optional map or reference content without leaving the canonical review or lesson flow, and the Bonus dropdown becomes the secondary access point instead of a destination page.

5. Sweep legacy mission assumptions, then re-run the focused validation lanes.

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Files to inspect and update:
        apps/web/features/course/lesson/hooks/use-lesson-completion.ts
        apps/web/features/course/artifacts/components/artifacts-page.tsx
        apps/web/features/course/artifacts/components/artifacts-page-states.tsx
        apps/web/features/settings/components/settings-page-shell.tsx
        apps/web/features/course/mission/*
        apps/web/convex/course/mission.ts
        apps/web/proxy.ts
        apps/web/tests/unit/app-workspace-mission-page.test.tsx
        apps/web/tests/unit/app-workspace-execute-page.test.tsx
        apps/web/tests/unit/product-shell.test.tsx
        apps/web/tests/unit/product-shell-navigation.test.ts
        apps/web/tests/unit/proxy-protected-routes.test.ts
        apps/web/tests/integration-ui/blueprint-review-page.test.tsx
        apps/web/tests/integration-ui/execute-ship-page.test.tsx

    Suggested focused test command:
        bunx vitest run \
          apps/web/tests/unit/app-workspace-mission-page.test.tsx \
          apps/web/tests/unit/app-workspace-execute-page.test.tsx \
          apps/web/tests/unit/app-workspace-lesson-page.test.tsx \
          apps/web/tests/unit/legacy-lesson-routes.test.ts \
          apps/web/tests/unit/product-shell.test.tsx \
          apps/web/tests/unit/product-shell-navigation.test.ts \
          apps/web/tests/unit/proxy-protected-routes.test.ts \
          apps/web/tests/contracts/curriculum-contract.test.ts \
          apps/web/tests/integration-ui/blueprint-review-page.test.tsx \
          apps/web/tests/integration-ui/execute-ship-page.test.tsx

    Build command:
        bun run build

    Optional browser-level proof when the local env is available:
        set -a; source apps/web/.env.local; set +a; bun run test:browser-smoke

    Expected observation after this step:
        The suite describes the new IA, `/execute` and `/mission` remain protected compatibility paths, and the build plus optional browser proof show the new Review-to-Build-Lessons journey.

## Validation and Acceptance

Acceptance is behavioral. An entitled user who has not finished the blueprint must still be redirected into the first incomplete blueprint stage and must still see blueprint-stage navigation, including on `/review` before download. Once the Blueprint is downloaded or the existing unlock marker is present, the review page must switch to the unlocked header with `Review` active and must show `Build Lessons`, `Launch Lessons`, and `Bonus` instead of any Mission or Execute / Ship language.

Acceptance also requires `Build Lessons` to be the default continuation after `Review & Download`. A newly unlocked user should land on lesson `3.1` when they continue. A returning unlocked user should resume into the right BUILD or SHIP lesson through centralized target logic, not through page-local conditionals. `Launch Lessons` is the user-facing label even if the underlying block id stays `SHIP`.

The Lesson Map acceptance criterion is that it is optional and unlocked-only. It must not appear as a primary route concept or as a stable header destination. A user can open it from the unlocked review or lesson UI, or from the Bonus dropdown, after download. The same surface should be reusable between review and lesson pages instead of being implemented as two separate browse pages.

Compatibility acceptance requires `/execute` and `/mission` to keep working without remaining first-class destinations. `/execute` should redirect into the canonical Build Lessons target. `/mission` should redirect into a canonical unlocked surface and reveal the Lesson Map when possible, or fall back to the plain Build Lessons destination. Neither route should remain the place where the UI teaches users how to move through the post-review product.

The shell acceptance criterion is that `AppShell` no longer auto-queries `getMissionState` and no live page needs to preload mission state just to show header chrome. Blueprint pages and unlocked post-review pages should render one explicit header system, while pages that do not need workflow nav can omit it entirely.

## Idempotence and Recovery

The unlock path must stay safe to rerun. The existing `executeShipUnlockedAt` storage should remain idempotent, so repeated downloads or repeated compatibility-route hits do not create duplicate state or change the canonical destination logic unexpectedly.

Keep `/execute` and `/mission` alive as protected compatibility routes for the entire rollout. That makes rollback cheap. If the new nav model or Lesson Map surface regresses, the immediate recovery path is to point the compatibility routes and root resume helper back to the safest known canonical page, likely `/review`, without touching stored workflow data.

Do not rename the `blueprintWorkflowStates` table or the `executeShipUnlockedAt` column in this slice. Those renames are intentionally deferred. If implementation reveals that the optional Lesson Map surface is riskier than expected, the recovery fallback is to preserve the new header IA and keep `/mission` as a temporary compatibility redirect straight into the Build Lessons target while finishing the reusable surface work in a follow-up.

If partial implementation lands and the shell needs to be stabilized quickly, revert only the header-nav and route-helper changes. The stored unlock marker, protected routes, and blueprint data should remain untouched.

## Artifacts and Notes

Current behavior evidence that this plan is replacing:

    apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx
    - download and unlock are separate steps
    - `unlockExecuteShip` pushes to `/execute`

    apps/web/features/blueprint-flow/components/review/blueprint-review-execute-preview.tsx
    - still renders `Continue into Execute / Ship`

    apps/web/features/execute-ship/components/execute-ship-page.tsx
    - repeat unlocked visitors redirect to `/mission`
    - first-time unlocked visitors render `ExecuteBonusBridgePage`

    apps/web/app/(workspace)/mission/page.tsx
    - still renders a stable locked or unlocked browse page

    apps/web/features/execute-ship/components/bonus-lesson-page.tsx
    - alert copy and footer still link to `/mission`

    apps/web/features/course/shared/components/app-shell.tsx
    - auto-queries `api.course.getMissionState`

    apps/web/features/course/lesson/model/curriculum.ts
    - `1.0` and `routeConfig.mission` still resolve canonically

Capture these artifacts during implementation:

    - a transcript proving `/execute` redirects to the Build Lessons target
    - a transcript proving `/mission` redirects to a canonical unlocked surface and can reveal the Lesson Map
    - a screenshot of unlocked review showing `Review | Build Lessons | Launch Lessons | Bonus`
    - a screenshot of the Bonus dropdown contents
    - before-and-after screenshots of the review page, a blueprint stage page, and an unlocked lesson page
    - a proof snippet showing Build Lessons and Launch Lessons resuming to the correct lesson targets

Use those captures to prove the product no longer relies on Mission or Execute / Ship as the visible IA.

Current proof from Milestone 1:

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Command:
        bun run --cwd apps/web test:unit -- tests/unit/post-review-destination.test.ts tests/unit/app-workspace-execute-page.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/course-access.test.ts

    Observed result:
        Test Files  4 passed (4)
        Tests  14 passed (14)

    Command:
        bun run --cwd apps/web typecheck

    Observed result:
        ✓ Compiled successfully
        Finished TypeScript

    Command:
        bun run --cwd apps/web test:unit -- tests/unit/build-primary-nav-model.test.ts tests/unit/post-review-destination.test.ts tests/unit/product-shell.test.tsx tests/unit/app-workspace-execute-page.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/bonus-lesson-page.test.tsx tests/unit/bonus-mission-page.test.tsx tests/unit/course-access.test.ts tests/unit/legacy-lesson-routes.test.ts tests/unit/course-state-lifecycle.test.ts tests/unit/proxy-protected-routes.test.ts

    Observed result:
        Test Files  12 passed (12)
        Tests  39 passed (39)

    Command:
        bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-stage-page.test.tsx

    Observed result:
        Test Files  1 passed (1)
        Tests  15 passed (15)

    Command:
        bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-review-page.test.tsx tests/integration-ui/blueprint-stage-page.test.tsx

    Observed result:
        Test Files  2 passed (2)
        Tests  18 passed (18)

    Command:
        set -a; source apps/web/.env.local; set +a; bun run --cwd apps/web test:browser-smoke

    Observed result:
        7 passed (39.0s)
        Tests  3 passed (3)

## Interfaces and Dependencies

The blueprint-stage source of truth remains `packages/blueprint-compiler/src/stages/stage-definitions.ts` and the readiness derivation in `packages/blueprint-compiler/src/readiness/derive-stage-status.ts`. Do not duplicate blueprint stage order inside `apps/web`.

The persisted unlock interface remains `apps/web/convex/blueprint/workflowState.ts`, including `executeShipUnlockedAt`. Treat that as a stable storage dependency for this slice.

The post-review destination contract must be centralized. Whether it lives under `apps/web/features/workspace-navigation/`, `apps/web/features/execute-ship/`, or a small Convex helper, it must answer these questions consistently:

    - what is the canonical Build Lessons destination
    - what is the canonical Launch Lessons destination
    - what URL or action reveals the Lesson Map on a canonical unlocked surface
    - what should `/execute` and `/mission` compatibility routes do

The shared primary-nav interface should stop being mission-shaped. The exact type names may differ, but the live interface should support at least:

    - explicit top-level link items
    - explicit dropdown items
    - active-state calculation
    - disabled fallbacks when a configured destination does not resolve
    - page-local actions for optional surfaces such as the Lesson Map

`routeConfig.execute` and `routeConfig.mission` should remain as compatibility paths, but they should not remain canonical navigation targets. Do not add a new stable `routeConfig.lessonMap` browse route unless implementation proves the reusable surface approach is not viable.

The current bonus lesson data contract in `apps/web/convex/course/bonusMission.ts` and `apps/web/features/execute-ship/lib/bonus-library-presentation.ts` can remain the source for post-review lesson ordering, explored counts, and default BUILD recommendation. The user-facing labels emitted from that layer must change to `Build Lessons`, `Launch Lessons`, and Bonus dropdown content so the old Mission and Execute / Ship vocabulary no longer leaks into visible UI.
