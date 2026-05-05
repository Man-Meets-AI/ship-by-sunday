---
title: Add Paid Tutorial Videos Access
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Add a protected Tutorial Videos surface so every paid buyer can watch the existing lesson video library without completing the generated-codebase Review flow.
post_build_recap: Paid customers now have protected `/tutorials` and `/tutorials/[lessonKey]` video access, chooser/menu discovery, route docs, and focused tests without changing generated-codebase lesson progression.
read_when:
  - Reviewing the completed interim Tutorial Videos implementation.
  - Validating paid access to lesson videos for existing-codebase buyers.
  - Updating the later Worker, Tutorials, and Generate Codebase IA migration.
---

# Add Paid Tutorial Videos Access

This document is a living execution plan for adding an interim Tutorial Videos access path for paid Ship by Sunday customers.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Existing-codebase buyers currently have paid product access, but the lesson video experience is effectively hidden behind generated-codebase progress and the post-Review bonus unlock. Some paid customers may also buy before deciding whether they want to generate a Codebase, connect an existing codebase, or only watch the videos first. The immediate user-visible outcome is simple: a paid customer can choose `Tutorial Videos`, land on `/tutorials`, and watch all existing lesson videos without needing to generate a Codebase, set up an existing repository, or complete Review.

This is intentionally smaller than the later `/workers`, `/tutorials`, and `/generate-codebase` hard switch. It gives customers the videos now while leaving the broader naming, route, entitlement, and runtime migration for a separate plan.

## Progress

- [x] 2026-05-05: Confirmed the current `/lesson/[lessonKey]` route checks general paid access first, then calls `loadBonusRouteAccess`, which requires generated-codebase workspace state and post-Review unlock.
- [x] 2026-05-05: Confirmed Command-K only shows lesson links when a generated-codebase `primaryNav` exists, so existing-codebase pages do not expose tutorial videos through the current command menu.
- [x] 2026-05-05: Created this ExecPlan for the smaller interim paid tutorial surface.
- [x] 2026-05-05: Interviewed the product owner through the design tree and recorded the locked decisions in this plan.
- [x] 2026-05-05: Implemented `/tutorials` as a protected tutorial video index inside the existing paid `(workspace)` layout.
- [x] 2026-05-05: Implemented `/tutorials/[lessonKey]` as a protected video-first watch page that does not require generated-codebase workspace state.
- [x] 2026-05-05: Added a non-committing `Tutorial Videos` card to the existing fulfillment chooser.
- [x] 2026-05-05: Added `Tutorial Videos` discovery in Command-K and the app shell user menu.
- [x] 2026-05-05: Updated the route map docs for `/tutorials`.
- [x] 2026-05-05: Added focused tests for route helpers, tutorial models/pages, chooser behavior, and app-shell discovery.
- [x] 2026-05-05: Ran focused validation, app lint, app typecheck/build, format check, plan lint, markdown lint, and blocked browser proof notes.

## Surprises & Discoveries

The existing lesson page is not only access-gated; it is also generated-codebase-state-gated. `apps/web/app/(workspace)/lesson/[lessonKey]/_server/load-bonus-route-access.ts` throws when `api.codebase.getCodebaseWorkspaceState` returns null. That makes the current lesson route the wrong place to solve existing-codebase tutorial access because existing-codebase buyers can be paid and still have no generated Codebase workspace state.

The existing Command-K lesson group is driven by `primaryNav.postReviewItems` in `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu-items.tsx`. Existing-codebase pages pass no generated-codebase `primaryNav`, so there is no reliable Command-K path to tutorial videos for those users today.

All 29 current student-facing lessons resolve to ready Bunny video content and have duration labels. No student-facing lessons currently have ready transcripts, and only two currently have resources. The index should therefore promise a complete video library and duration metadata, but it should not advertise transcript or resource availability.

`apps/web/app/(workspace)/layout.tsx` already gates every route inside the `(workspace)` route group with `getServerProductAccess()` and returns `AccessRequiredPage` when `hasAccess` is false. New `/tutorials` routes inside that group do not need to call `loadWorkspacePageAccess()` again unless they need fulfillment-track data, which this plan intentionally avoids.

## Decision Log

Decision: Add a separate `/tutorials` surface instead of loosening `/lesson/*`.
Rationale: `/lesson/*` currently represents the generated-codebase post-Review progression surface. Relaxing it would mix tutorial watching with generated-codebase unlock state, view tracking, and post-review navigation. A separate route lets every paid buyer watch videos without corrupting generated-codebase progress behavior.
Date: 2026-05-05.

Decision: Tutorial Videos is broad paid access, not a new checkout lane or fulfillment track.
Rationale: The product need is that people who bought can watch the videos. A paid customer may be generated-codebase, existing-codebase, or still unspecified. Tutorial watching should not force or permanently set the generated/existing decision.
Date: 2026-05-05.

Decision: Keep this plan out of the full Worker hard-switch scope.
Rationale: The full Program changes canonical routes, product nouns, entitlement capabilities, and owned runtime naming. The user explicitly asked for an interim path because that work is large. This plan must not rename `/workspace` to `/workers` or `/codebase` to `/generate-codebase`.
Date: 2026-05-05.

Decision: Show all 29 current student-facing lesson videos.
Rationale: Code inspection showed every student-facing lesson has ready video content and duration metadata. Hiding lessons would create a second editorial curriculum with no current need.
Date: 2026-05-05.

Decision: Make tutorial watch pages video-first reference pages.
Rationale: Existing `LessonShellWatch` provides title, intro, video, transcript/resource rendering when available, and a footer slot. Tutorial Videos should not render generated-codebase tasks, completion state, lesson-clear behavior, or progress writes.
Date: 2026-05-05.

Decision: The tutorial footer has `Back to Tutorial Videos`, previous video, and next video links only.
Rationale: The existing bonus lesson footer uses `/lesson/*`, Lesson Map, and progress copy. Tutorial Videos needs video-only navigation under `/tutorials/*`.
Date: 2026-05-05.

Decision: Do not add a tutorial left rail or skill rail in this interim.
Rationale: The tutorial index can group videos by the existing curriculum blocks in the main content, and the watch page only needs video navigation. Rails would imply a second course/progress shell that the larger IA migration may replace.
Date: 2026-05-05.

Decision: Add `Tutorial Videos` to Command-K and the app shell user menu.
Rationale: Command-K is useful but hidden. The user menu is a low-risk visible discovery path that does not require changing top navigation or starting the broader IA migration.
Date: 2026-05-05.

Decision: Add `Tutorial Videos` to `/workspace/choose` as a non-committing third card.
Rationale: Some customers may just want tutorials or may want to watch before deciding. The card should be titled `Watch tutorial videos` so it matches the action phrasing of `Generate a new codebase` and `Set up an existing codebase`. It should route to `/tutorials` without calling `api.access.resolveViewerFulfillmentTrack`, so the customer can later choose generated-codebase or existing-codebase without being locked into a fake track.
Date: 2026-05-05.

Decision: Leave `/workspace/choose` redirects for already committed users as-is.
Rationale: Generated-codebase users should still redirect to `/codebase`, and existing-codebase users should still redirect to `/workspace/setup`. The new chooser card only affects unresolved paid users.
Date: 2026-05-05.

Decision: Use `routeConfig.tutorials` as the canonical `/tutorials` base path and add separate tutorial route helpers.
Rationale: Durable app routes belong in `routeConfig`, but `/lesson/*` and `/tutorials/*` should remain separate helper surfaces so post-Review course links do not blur with paid video-only links.
Date: 2026-05-05.

Decision: Update Command-K copy from workspace-specific to neutral search copy.
Rationale: Adding Tutorial Videos makes `Search workspace...` less accurate, but the full Workspace-to-Worker rename is out of scope. The interim neutral copy should be `Search actions...`, with screen-reader description `Search product pages and run quick actions.`
Date: 2026-05-05.

Decision: Update only `apps/web/content/docs/route-map.mdx` for documentation.
Rationale: This changes protected route behavior. The route map is the maintainer/operator truth surface for route contracts. Public sitemap and robots should not change because `/tutorials` is protected and noindexed through the `(workspace)` layout.
Date: 2026-05-05.

Decision: No local `release:proof` requirement for this interim.
Rationale: The slice touches protected UI routes and navigation, but not checkout, billing, entitlement schema, release machinery, or production release workflow. Focused tests, lint/typecheck, and narrow browser proof are the right local proof.
Date: 2026-05-05.

## Outcomes & Retrospective

The interim Tutorial Videos path is implemented. The app now has protected `/tutorials` and `/tutorials/[lessonKey]` routes inside the existing `(workspace)` layout, a static tutorial library model for all 29 student-facing lesson videos, and a video-first watch page that reuses `LessonShellWatch` without generated-codebase progress state. `/lesson/*` remains the generated-codebase post-Review lesson route.

Unresolved paid buyers now see a third `/workspace/choose` card titled `Watch tutorial videos`. That card routes to `/tutorials` without calling `api.access.resolveViewerFulfillmentTrack`; the generated-codebase and existing-codebase cards still commit their fulfillment tracks. Command-K and the app shell user menu now include `Tutorial Videos`, and Command-K uses the neutral `Search actions...` placeholder. The route map documents the new protected tutorial routes.

This remains intentionally narrower than the later Worker, Tutorials, and Generate Codebase IA Program. It does not rename `/workspace`, does not add `/workers`, does not rename `/codebase` to `/generate-codebase`, and does not redirect or replace `/lesson/*`.

## Context and Orientation

The web app lives under `apps/web`. Protected app routes currently sit in the App Router route group `apps/web/app/(workspace)/`; the group name does not affect the URL. `apps/web/app/(workspace)/layout.tsx` calls `getServerProductAccess()` and returns `AccessRequiredPage` if `hasAccess` is false. Therefore new routes under `apps/web/app/(workspace)/tutorials/` are already paid-gated by the shared layout.

The generated-codebase lesson route is `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx`. It looks up a lesson using `getLessonByRouteSegment` from `apps/web/lib/course/lesson/model/manifest.ts`, checks paid access through `loadWorkspacePageAccess()`, then calls `loadBonusRouteAccess`. That bonus access helper requires generated-codebase workspace state and checks whether Execute / Ship is unlocked. The new tutorial route must reuse the lesson video rendering components but must not call `loadBonusRouteAccess`, `api.codebase.getCodebaseWorkspaceState`, `api.course.getBonusMissionState`, or `api.codebase.getCodebaseResumeDestination`.

The reusable watch UI is `apps/web/app/(workspace)/_components/course/lesson/shells/lesson-shell-watch.tsx`. It renders a lesson's title, intro, coach video, transcript when present, resource cards when present, helpful links when present, and a footer slot. It can be used for tutorial videos without Convex progress state when the page passes a tutorial-specific footer and empty pinned artifacts.

The tutorial inventory should come from the existing static lesson registry through `getStudentFacingLessons()` and `getOrderedBlocks()` in `apps/web/lib/course/lesson/model/registry`. Code inspection on 2026-05-05 showed 29 student-facing lessons, all with ready Bunny video content and duration labels.

Command-K is composed by `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu-items.tsx`, and the top-level command menu wrapper is `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu.tsx`. The app shell user menu renders `AppShellUserMenuWorkspaceItems` from `apps/web/app/(workspace)/_components/app-shell/app-shell-user-menu-workspace-items.tsx`. Both Command-K and the user menu consume `workspaceMenuLinks()` from `apps/web/app/(workspace)/_components/app-shell/app-shell-user-menu-helpers.ts`. Add `Tutorial Videos` through that helper so both surfaces share one order and active-state rule.

The fulfillment chooser is `apps/web/app/(workspace)/_components/workspace-fulfillment-choice.tsx` and is shown by `apps/web/app/(workspace)/workspace/choose/page.tsx` only for paid users whose `fulfillmentTrack` is unresolved. The existing generated-codebase and existing-codebase cards call `api.access.resolveViewerFulfillmentTrack` and then route to their lane. The new `Tutorial Videos` card must not call that mutation; it should route directly to `/tutorials`.

Route constants live in `apps/web/config/product.ts`. Existing post-Review lesson links are built by `apps/web/lib/course/lesson/routing/lesson-routes.ts`, which returns `/lesson/<segment>`. The interim tutorial route needs its own helper at `apps/web/lib/course/lesson/routing/tutorial-routes.ts`, so new code does not accidentally route paid tutorial watching back into the generated-codebase post-Review route.

### In Scope

This plan includes adding `routeConfig.tutorials` with value `/tutorials`, adding `apps/web/lib/course/lesson/routing/tutorial-routes.ts`, adding `apps/web/app/(workspace)/tutorials/page.tsx`, adding `apps/web/app/(workspace)/tutorials/[lessonKey]/page.tsx`, adding `apps/web/app/(workspace)/tutorials/_lib/tutorial-video-library.ts`, adding feature-local tutorial page components under `apps/web/app/(workspace)/tutorials/_components/`, adding `Tutorial Videos` to `workspaceMenuLinks()`, using the lucide `ListVideo` icon in Command-K and the user menu, adding the non-committing chooser card, updating `apps/web/content/docs/route-map.mdx`, and adding focused tests for those changes.

### Out Of Scope

This plan does not rename `/workspace` to `/workers`, does not rename `/codebase` to `/generate-codebase`, does not redirect `/lesson/*` to `/tutorials/*`, does not remove `/lesson/*`, does not change checkout products, does not migrate Convex entitlement schema, does not change generated-codebase post-Review unlock rules, does not mark tutorial videos as completed course progress, does not add a tutorial-specific fulfillment track, does not add public sitemap or robots entries, and does not add compatibility redirects for the later hard-switch IA. It must not edit Convex code unless implementation discovers that a purely static paid video surface is impossible, which current research does not indicate.

## Plan of Work

Start with route identity. Add `tutorials: "/tutorials"` to `routeConfig` in `apps/web/config/product.ts`. Add `apps/web/lib/course/lesson/routing/tutorial-routes.ts` with `getTutorialsHref()` and `getTutorialVideoHref(identifier: string)`. `getTutorialsHref()` should return `routeConfig.tutorials`. `getTutorialVideoHref()` should resolve the identifier through the existing lesson manifest functions and return `/tutorials/<routeSegment>`. It must not return `/lesson/*`.

Next add the static tutorial library model in `apps/web/app/(workspace)/tutorials/_lib/tutorial-video-library.ts`. The model should group all `getStudentFacingLessons()` by `getOrderedBlocks()` order, include all 29 current lessons, include lesson display label, title, route segment, intro or a short description, and `durationLabel`, and mark all blocks as open. It should not expose locked/unlocked state, progress state, transcript promises, or resource promises.

Then add feature-local components. `apps/web/app/(workspace)/tutorials/_components/tutorial-videos-page.tsx` should render an `AppShell` with `viewportMode="app"`, `appScrollMode="page"`, and `showSkillRail={false}`. The page should show `Tutorial Videos`, a concise description, and open sectioned lists for each curriculum block. Each lesson row should show lesson label, title, duration, and a `Watch` affordance linking to `getTutorialVideoHref(lesson.lessonKey)` or the route segment from the model.

Add `apps/web/app/(workspace)/tutorials/_components/tutorial-video-page.tsx` for the watch page. It should wrap `LessonShellWatch` in `AppShell` with `showSkillRail={false}`, pass the lesson's coach content, pass empty pinned artifacts, and render a tutorial-specific footer with `Back to Tutorial Videos`, previous video when present, and next video when present. Previous and next links must use `/tutorials/*` helpers, not `/lesson/*`.

Then add the route files. `apps/web/app/(workspace)/tutorials/page.tsx` should export static metadata `{ title: "Tutorial Videos" }`, build the tutorial library model, and render `TutorialVideosPage`. It should not call `loadWorkspacePageAccess()` because the protected layout already owns the access gate. `apps/web/app/(workspace)/tutorials/[lessonKey]/page.tsx` should resolve the route segment with `getLessonByRouteSegment`, call `notFound()` for an unknown route segment, and render `TutorialVideoPage`. It should not add dynamic metadata in this interim.

Then update discovery. In `workspaceMenuLinks()`, add `{ href: routeConfig.tutorials, label: "Tutorial Videos", active: isPathPrefixActive(pathname, routeConfig.tutorials) }` between Review and Settings. In Command-K and the user menu icon maps, use lucide `ListVideo` for `routeConfig.tutorials`. In `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu.tsx`, change the placeholder to `Search actions...` and the screen-reader description to `Search product pages and run quick actions.` Keep the existing Command-K group heading `Workspace`; the broad naming cleanup belongs to the later hard-switch plan.

Then update the chooser. In `WorkspaceFulfillmentChoice`, add a third card titled `Watch tutorial videos`, with a description that clearly says the customer can watch first without choosing a product path. Clicking it should route to `routeConfig.tutorials` and must not call `resolveViewerFulfillmentTrack`. The existing two committing cards should keep their mutation behavior unchanged.

Then update docs. In `apps/web/content/docs/route-map.mdx`, add `/tutorials` as a protected Tutorial Videos library available to paid customers regardless of fulfillment track, and add `/tutorials/[lessonKey]` as the video-only lesson route. State that `/lesson/*` remains the generated-codebase post-Review lesson route and is not redirected in this interim.

Finally add tests. Extend `apps/web/tests/integration-ui/app-shell-command-menu.test.tsx` to assert the `Tutorial Videos` item appears and calls `router.push("/tutorials")`, and update placeholder expectations from `Search workspace` to `Search actions`. Add or extend a user-menu test if one exists; otherwise cover `workspaceMenuLinks()` directly in a focused unit test to prove ordering and active state. Add an integration-ui test for `WorkspaceFulfillmentChoice` proving the Tutorial Videos card routes to `/tutorials` and does not call `api.access.resolveViewerFulfillmentTrack`. Add a contract test for the tutorial route helper proving student-facing lessons map to `/tutorials/<routeSegment>` and never `/lesson/*`. Add a unit test for the tutorial library model proving it returns 29 lessons grouped by CEO, DESIGN, BUILD, and SHIP, with duration labels and no lock states. Add a route-page unit test proving `/tutorials` and `/tutorials/[lessonKey]` render without Convex server queries or mutations, and unknown tutorial lesson segments call `notFound()`.

## Milestones

The first milestone is route identity and library modeling. At the end, `routeConfig.tutorials` exists, `getTutorialsHref()` and `getTutorialVideoHref()` return `/tutorials` paths, and the tutorial library model lists all 29 current student-facing videos grouped by curriculum block without touching Convex. Success is proven with contract/model tests.

The second milestone is protected tutorial pages. At the end, `/tutorials` renders the video index inside the existing paid `(workspace)` layout, `/tutorials/[lessonKey]` renders a video-first watch page, unknown lesson segments 404, and the pages make no Convex server calls. Success is proven by focused route-page tests and component/model tests.

The third milestone is discovery and chooser behavior. At the end, Command-K and the user menu show `Tutorial Videos`, Command-K uses neutral search copy, and `/workspace/choose` offers a non-committing Tutorial Videos card for unresolved paid customers. Success is proven by Command-K tests, menu-link tests, and chooser interaction tests.

The fourth milestone is route-map docs and validation. At the end, `apps/web/content/docs/route-map.mdx` documents `/tutorials`, focused tests pass, lint and typecheck pass or any inability to run them is recorded, narrow browser proof is captured when local entitled auth is available, and this ExecPlan is updated with exact evidence.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Before editing, inspect the current route, shell, chooser, and route-map files again if the worktree has changed:

    sed -n '1,220p' apps/web/config/product.ts
    sed -n '1,220p' 'apps/web/app/(workspace)/layout.tsx'
    sed -n '1,220p' 'apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx'
    sed -n '1,260p' 'apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu-items.tsx'
    sed -n '1,180p' 'apps/web/app/(workspace)/_components/workspace-fulfillment-choice.tsx'
    sed -n '1,180p' apps/web/lib/course/lesson/routing/lesson-routes.ts
    sed -n '1,180p' apps/web/content/docs/route-map.mdx

Implement the route constant and tutorial href helper. Prefer small, named functions over ad hoc string concatenation in pages. Expected behavior after this step is that the helper can resolve a known lesson key such as `iterate-the-product-with-ai`, a display label such as `3.1`, or a route segment such as `iterate-the-product-with-ai` into a path beginning with `/tutorials/`.

Implement the tutorial library model and feature-local page components under `apps/web/app/(workspace)/tutorials/`. Reuse `LessonShellWatch` for the watch page and existing app-shell, item, button, and card primitives. Do not copy video player internals.

Update shared app-shell discovery through `workspaceMenuLinks()` and icon maps. The visible label must be `Tutorial Videos`, and the selected destination must be `routeConfig.tutorials`.

Update `WorkspaceFulfillmentChoice` with the non-committing Tutorial Videos card. Keep generated-codebase and existing-codebase cards committing their fulfillment tracks exactly as they do today.

Update `apps/web/content/docs/route-map.mdx` with the new protected route.

Update tests. Prefer extending existing tests over creating broad new test harnesses. The command-menu test should open Command-K, find `Tutorial Videos`, click it, and assert `pushMock` received `/tutorials`. The chooser interaction test should click Tutorial Videos and assert router navigation without a fulfillment-track mutation.

Run focused validation first:

    bun run --cwd apps/web test:unit -- tests/unit/tutorial-routes.test.ts tests/unit/tutorial-video-library.test.ts tests/unit/app-workspace-tutorial-routes.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-command-menu.test.tsx tests/integration-ui/workspace-fulfillment-choice.test.tsx

Then run the app-level checks relevant to this web route change:

    bun lint
    bun typecheck
    bun run format:check

If local entitled auth is available, start the local app with hosted Convex dev through the existing script:

    bun run dev:core

Then verify desktop `/tutorials`, mobile `/tutorials`, one desktop `/tutorials/<known-lesson>`, and Command-K containing `Tutorial Videos`. Do not use Convex local mode. If local entitled auth is unavailable, record the exact blocker instead of weakening the implementation.

Do not run local `release:proof` for this interim unless a later change expands scope into checkout, entitlement, release workflow, or production-readiness judgment.

## Validation and Acceptance

Acceptance is observable from the product UI. A paid existing-codebase buyer can open Command-K or the user menu, choose `Tutorial Videos`, land on `/tutorials`, choose a lesson, and watch the video without being redirected to `/workspace/setup`, `/codebase`, `/review`, or an access-required screen. A paid generated-codebase buyer can do the same. A paid unresolved buyer can open `/workspace/choose`, choose the non-committing Tutorial Videos card, watch tutorials, and later return to choose a generated-codebase or existing-codebase path. An unpaid or signed-out viewer receives the existing access-required path from the protected layout rather than seeing protected tutorial content. The old generated-codebase `/lesson/*` route still uses its current post-Review unlock behavior.

The code-level acceptance criteria are that the new tutorial pages do not call `loadWorkspacePageAccess()`, `loadBonusRouteAccess`, `api.codebase.getCodebaseWorkspaceState`, `api.course.getBonusMissionState`, or `api.codebase.getCodebaseResumeDestination`; do not render `BonusLessonViewTracker`; and do not write generated-codebase lesson progress. The new tutorial href helper must not produce `/lesson/*`. Command-K and the user menu must contain the exact visible label `Tutorial Videos` and route to `/tutorials`. The chooser Tutorial Videos card must not call `api.access.resolveViewerFulfillmentTrack`.

### Test Commands

Run these from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/tutorial-routes.test.ts tests/unit/tutorial-video-library.test.ts tests/unit/app-workspace-tutorial-routes.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-command-menu.test.tsx tests/integration-ui/workspace-fulfillment-choice.test.tsx
    bun lint
    bun typecheck
    bun run format:check
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-05-add-paid-tutorial-videos-access.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-05-add-paid-tutorial-videos-access.md apps/web/content/docs/route-map.mdx
    git diff --check -- docs/exec-plans/active/2026-05-05-add-paid-tutorial-videos-access.md apps/web

Add any new focused test files to this command list after implementation. If browser proof is run, record the local URL, the entitled user state used, and the observed desktop and mobile result in `Artifacts and Notes`.

## Idempotence and Recovery

The implementation should be additive. Re-running tests or rebuilding should not mutate app state. The tutorial pages should read static lesson content and should rely on the existing protected layout for access, so partial implementation can be backed out by removing the `/tutorials` route files, removing the route constant, removing the tutorial href helper, removing the menu-link entry, removing the chooser card, and reverting the route-map doc update. Because this plan does not change Convex schema, checkout data, Stripe, Clerk, or external provider setup, no database migration or provider rollback should be required.

If a test fails because an existing lesson has no ready video, record the discovery and decide whether to keep all student-facing lessons with a truthful empty state or filter to ready videos only. Do not add fallback fake video URLs.

If browser proof is blocked by missing local Clerk, Convex, or entitled persona configuration, record the exact missing prerequisite. Do not switch Convex to local mode to work around hosted dev configuration.

## Artifacts and Notes

Initial research snippets:

    apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx calls loadWorkspacePageAccess, then loadBonusRouteAccess.
    apps/web/app/(workspace)/lesson/[lessonKey]/_server/load-bonus-route-access.ts requires api.codebase.getCodebaseWorkspaceState.
    apps/web/app/(workspace)/layout.tsx gates protected app routes with getServerProductAccess.
    apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu-items.tsx only derives lesson links from primaryNav.postReviewItems.
    Current student-facing lesson inventory: 29 lessons, 29 ready videos, 29 duration labels, 0 ready transcripts.

Validation evidence from 2026-05-05:

    bun run --cwd apps/web test:unit -- tests/unit/tutorial-routes.test.ts tests/unit/tutorial-video-library.test.ts tests/unit/app-workspace-tutorial-routes.test.tsx
    Result: 3 test files passed, 6 tests passed.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-command-menu.test.tsx tests/integration-ui/workspace-fulfillment-choice.test.tsx
    Result: 2 test files passed, 10 tests passed. Vitest emitted the existing localstorage-file warning.

    bun lint
    Result: 0 warnings and 0 errors.

    bun typecheck
    Result: Next production build and TypeScript completed successfully. The build output listed `/tutorials` and `/tutorials/[lessonKey]` as dynamic app routes.

    bun run format:check
    Result: all matched files use the correct format.

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-05-add-paid-tutorial-videos-access.md
    Result: ok.

    bun run markdown:lint -- --paths apps/web/content/docs/route-map.mdx docs/exec-plans/active/2026-05-05-add-paid-tutorial-videos-access.md
    Result: both files ok.

    git diff --check -- docs/exec-plans/active/2026-05-05-add-paid-tutorial-videos-access.md apps/web
    Result: no whitespace errors.

Browser proof attempt:

    bun run --cwd apps/web start -- -p 3021
    Chrome DevTools desktop request to http://localhost:3021/tutorials redirected to /sign-in?redirect_url=%2Ftutorials.
    Chrome DevTools mobile request to http://localhost:3021/tutorials/build-kickoff redirected to /sign-in?redirect_url=%2Ftutorials%2Fbuild-kickoff.
    Screenshots saved under codex-scripts/tutorials-auth-redirect-desktop.png and codex-scripts/tutorials-auth-redirect-mobile.png.
    Console showed only the expected Clerk development-key warning. No entitled local browser session was available, so protected tutorial content could not be visually inspected through the browser in this run.

## Interfaces and Dependencies

This plan depends on Next.js App Router file-system routes under `apps/web/app/(workspace)/`, the protected app layout `apps/web/app/(workspace)/layout.tsx`, the existing access-required component `AccessRequiredPage`, the app shell and Command-K components under `apps/web/app/(workspace)/_components/app-shell/`, `WorkspaceFulfillmentChoice`, the lesson manifest and video content under `apps/web/lib/course/lesson/`, `apps/web/content/docs/route-map.mdx`, and the existing test commands in `apps/web/package.json`. It should not depend on Convex mutations for tutorial access, generated-codebase workspace state, Stripe checkout changes, release proof changes, public SEO changes, or new external provider configuration.
