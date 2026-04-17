---
summary: "Reworks the blueprint funnel into route-driven blueprint pages that map the recorded L0-L13 curriculum onto the product experience. It introduces nested blueprint routes, routed step selection, and blueprint-local video wiring."
read_when: "Open this when changing blueprint-stage routing, curriculum/video mapping, or page-level blueprint flow behavior."
plan_status: "done"
---

# Reframe The Blueprint Funnel Around L0-L13 Video Pages

This is a living execution plan for reshaping the blueprint-first workspace so the recorded blueprint videos drive the page model instead of being bolted onto the current stage-only screens. It is written from current repository state and should be kept current as the implementation progresses.

This ExecPlan follows `docs/codex/PLANS.md` and must be maintained in accordance with that contract.

## Purpose / Big Picture

After this change, a buyer who enters the blueprint workspace will move through a blueprint-first funnel that matches the recorded blueprint curriculum: `L0` through `L13`, with one blueprint page per intended teaching beat and a video surface on every page that actually has a Bunny video attached. The Product, Design, Marketing, Build Plan, and Review flow will feel like a guided blueprint system instead of one large form per stage with an internal stepper.

This matters because the current implementation in `apps/web/features/blueprint-flow/` only gives `/start` a real video slot and treats `/product`, `/design`, `/marketing`, and `/build-plan` as single routes with in-page step switching. That shape does not match the recorded blueprint funnel. The user-visible proof of success is that `/start`, nested blueprint pages such as `/product/foundation` and `/design/references`, and `/review` all render the correct blueprint video when one exists, and saving a step advances the user to the next blueprint page instead of only changing local state.

## Progress

- [x] 2026-03-26 ET: Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/prompts/execplan-writer.md`, and `docs/codex/PLANS.md`.
- [x] 2026-03-26 ET: Inspected the real blueprint flow code paths in `packages/blueprint-compiler/src/stages/stage-definitions.ts`, `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx`, `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx`, and `apps/web/features/blueprint-flow/components/start/blueprint-start-welcome-video-card.tsx`.
- [x] 2026-03-26 ET: Verified the live Bunny library for the new blueprint titles. `L0`, `L1`, and `L3` through `L13` exist exactly once. `L2` does not currently exist under the new blueprint naming.
- [x] 2026-03-26 ET: Drafted and approved the execution plan in chat.
- [x] 2026-03-26 ET: Wrote the approved ExecPlan to `docs/codex/2026-03-26-17-17-38-EDT-blueprint-video-page-funnel.md`.
- [x] 2026-03-26 ET: Grilled the plan against the real blueprint-flow, compiler, auth, routing, and test code. Resolved the nested route contract, redirect behavior, page-layout rules, save-behavior inheritance, strict completion semantics, and the temporary `L2` fallback behavior.
- [x] 2026-03-26 ET: Updated the plan with the recolored Bunny upload run in `apps/web/output/video-pipeline/run-2026-03-26T20-30-50-836Z.links.md`, which supersedes the earlier darker blueprint video uploads.
- [x] 2026-03-26 ET: Completed Milestone 1 in `packages/blueprint-compiler/src/stages/stage-definitions.ts` by collapsing Marketing into the semantic `operating-system` page and regrouping Build Plan into `delivery`, `plan`, and `validation`.
- [x] 2026-03-26 ET: Preserved the old pricing completion behavior on the regrouped Build Plan delivery page by requiring pricing fields but not `domain` or `support_email`.
- [x] 2026-03-26 ET: Ran `bun test` in `packages/blueprint-compiler`; all 17 tests passed after adding readiness coverage for the new step ids and the preserved delivery-page semantics.
- [x] 2026-03-26 ET: Completed Milestone 2 by adding nested blueprint routes under `apps/web/app/(workspace)/*/[stepId]/page.tsx`, turning the stage-root routes into redirects, and moving `BlueprintStagePage` to route-driven step selection with URL-based progress navigation.
- [x] 2026-03-26 ET: Added blueprint route helpers in `apps/web/features/blueprint-flow/lib/blueprint-stage-routes.ts` and regression coverage in `apps/web/tests/unit/blueprint-stage-routes.test.ts`.
- [x] 2026-03-26 ET: Completed Milestone 3 by adding the blueprint-local media registry in `apps/web/features/blueprint-flow/lib/blueprint-stage-videos.ts`, the shared `BlueprintVideoCard`, the Product problem orientation fallback, stage-page responsive media placement, and the Review `L13` video above the download bridge.
- [x] 2026-03-26 ET: Updated blueprint UI and sandbox tests for the routed pages, video surfaces, and stage-root redirect contract.
- [x] 2026-03-26 ET: Validation passed for `apps/web` blueprint UI tests, `packages/blueprint-compiler` tests, and `bun run build`.
- [x] 2026-03-26 ET: Attempted `bun run test:e2e:sandbox --grep @default_ship`; Playwright exited cleanly with 4 tests skipped because the sandbox auth environment was not active.

## Surprises & Discoveries

The current blueprint funnel is not actually a 14-page blueprint experience. It is six workspace routes: `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, and `/review`, with only `/start` rendering a blueprint video today. The blueprint stage routes are defined in `packages/blueprint-compiler/src/stages/stage-definitions.ts`, while the current in-page step switching lives in `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx` through local React state.

The recorded blueprint curriculum implies 14 pages total: Start, four Product pages, four Design pages, one Marketing page, three Build Plan pages, and Review. If every current compiler step became its own route without regrouping, the repo would produce 16 pages, not 14. The mismatch comes from Marketing currently having three steps and Build Plan currently being grouped as `delivery`, `execution`, and `pricing` instead of the new teaching beats.

Evidence from the live Bunny library on 2026-03-26 ET:

    L0, L1, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, and L13 each appear once.
    L2 does not appear under the new blueprint naming.
    There are no duplicate `L<number>` blueprint videos.

The current video IDs changed later the same day because the initial blueprint uploads were too dark and had to be recolored. The implementation should use the latest upload report at `apps/web/output/video-pipeline/run-2026-03-26T20-30-50-836Z.links.md` rather than the earlier `19:41` run file.

Another discovery is that the canonical blueprint schema in `packages/blueprint-compiler/src/canonical-project-definition/schema.ts` does not have an explicit rollback or escape-hatch field. The Build Plan schema does include `done_when`, `acceptance_criteria`, `validation_plan`, `demo_flow`, `open_questions`, and `selected_next_slice`, so the first implementation pass should not widen schema scope unless we consciously approve that expansion.

During Milestone 1 implementation, merging the old Build Plan pricing step into the `delivery` page would have accidentally made `domain` and `support_email` required if the regrouped step relied on `fieldKeys` alone. The compiler still treats a step with no `requiredFieldKeys` as “every field is required,” so the merged `delivery` page now needs an explicit `requiredFieldKeys` list to preserve the pre-existing optional placeholders for domain and support email.

During Milestone 2 implementation, rendering separate mobile and desktop copies of the stage-page video card created duplicate media surfaces in the DOM. The final layout uses one shared media card with grid placement that moves it to the sidebar on desktop and keeps it above the form on mobile, which preserves accessibility and keeps the tests deterministic.

## Decision Log

Decision: Treat the blueprint videos as the source of truth for the page model, not as a decorative add-on to the current stage routes.  
Rationale: The re-recorded curriculum was made to fit the blueprint-first funnel. Keeping the current one-route-per-stage shell would preserve the wrong teaching shape.  
Date: 2026-03-26

Decision: Preserve the top-level stage entry routes `/product`, `/design`, `/marketing`, and `/build-plan`, but make them redirect to canonical nested blueprint page routes.  
Rationale: This keeps existing links, nav behavior, review links, and auth protection stable while letting the actual experience become page-based.  
Date: 2026-03-26

Decision: Keep Product at four pages and Design at four pages. Collapse Marketing to one page and regroup Build Plan into three pages so the runtime matches the `L0` through `L13` sequence.  
Rationale: This produces the 14-page blueprint funnel the recordings were made for without changing the blueprint-first intent.  
Date: 2026-03-26

Decision: Do not add new canonical fact keys for “starter config” or “rollback” in this slice.  
Rationale: The repo contract says to keep intake limited to facts that change blueprint outputs. The existing schema already supports the current blueprint outputs. The new recordings can be mapped to the current schema grouping first, and schema expansion can be a separate approved slice if needed.  
Date: 2026-03-26

Decision: Store blueprint video mapping inside `apps/web/features/blueprint-flow/`, not in the legacy lesson video asset map in `apps/web/features/course/lesson/model/media.ts`.  
Rationale: These are blueprint-flow surfaces. The only reusable part from the lesson system should be `LessonVideoPlayer` in `apps/web/features/course/lesson/components/lesson-video-player.tsx`.  
Date: 2026-03-26

Decision: Ship the Product problem page without a blueprint video until `L2` exists, and make the video slot optional so adding `L2` later is a one-line content update.  
Rationale: Reusing `L1` or `L3` would teach the wrong thing. The page model should not be blocked on a single missing upload.  
Date: 2026-03-26

Decision: Stage-root routes such as `/product` and `/design` remain the shared app contract and redirect to the current objective blueprint page within that stage. If the stage is already complete, the stage root redirects to that stage’s first blueprint page.  
Rationale: Many existing surfaces already link to stage-root URLs, including checkout, review, Execute / Ship, auth protection, and workspace navigation. Keeping stage roots stable avoids a repo-wide link migration while still allowing nested blueprint pages to become the real experience.  
Date: 2026-03-26

Decision: Canonical nested blueprint routes should use semantic step ids rather than video-number slugs or long teaching-copy slugs.  
Rationale: The route model should describe blueprint meaning, not the current video inventory. Semantic step ids also align naturally with the compiler step definitions and avoid awkward URL design around the missing `L2` video.  
Date: 2026-03-26

Decision: The route migration must preserve the current blueprint save behavior already implemented in `apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts`. Blank pages stay put, partial pages save in place, and complete pages save and advance.  
Rationale: This behavior was just implemented and tested in the blueprint save-feedback slice. The route migration should change URL shape and page structure, not silently redefine blueprint save semantics.  
Date: 2026-03-26

Decision: Preserve flexible in-stage browsing after the route migration. Inside an unlocked stage, users can still open any blueprint page from the progress panel even if earlier pages in that stage are incomplete.  
Rationale: The repo already supports this behavior and earlier blueprint progression work intentionally chose it. The routed page model should preserve that contract instead of turning blueprint stages into a strictly linear wizard.  
Date: 2026-03-26

Decision: Keep the generic blueprint form layout for this slice. Do not introduce custom page shells or sectioned page-specific form layouts while routing and video wiring are being migrated.  
Rationale: The real architectural change in this slice is route-driven blueprint pages plus blueprint-local video wiring. Page-specific content layout can be a later polish pass once the new funnel shape is stable.  
Date: 2026-03-26

Decision: Preserve current strict completion semantics for regrouped pages. Unless a step already defines narrower `requiredFieldKeys`, every field on the regrouped Marketing page and regrouped Build Plan pages remains required for completion.  
Rationale: The blueprint compiler currently treats these facts as required blueprint truth. This slice changes page boundaries, not the canonical readiness contract.  
Date: 2026-03-26

Decision: Treat “starter config” in `L10` as instructional framing only for this slice. Do not add new blueprint schema fields or repo-generation behavior for starter configuration choice.  
Rationale: The compiler has no starter-config fact today, and Blueprint overrides currently hard-code starter modules. Adding starter-config persistence would widen scope into schema, repo generation, review, and acceptance criteria.  
Date: 2026-03-26

Decision: Stage-page video placement should be responsive: desktop sidebar, mobile top.  
Rationale: This preserves the current wide-screen stage-page information architecture while still putting the video before the form on smaller screens where the right column would otherwise collapse below the main content.  
Date: 2026-03-26

Decision: The missing-`L2` Product problem page should render a non-video orientation card rather than hiding the slot entirely or showing a broken-looking placeholder.  
Rationale: This preserves layout consistency and keeps the page feeling intentional while making `L2` a future content drop-in rather than a visible missing-asset bug.  
Date: 2026-03-26

Decision: The Review video `L13` should render above the review checkpoint and download bridge.  
Rationale: The final teaching beat should lead into the final action. Review is structurally different from stage pages, so it should not inherit the sidebar-video pattern just for consistency.  
Date: 2026-03-26

Decision: The regrouped Build Plan `delivery` page keeps an explicit `requiredFieldKeys` list so `domain` and `support_email` stay optional while pricing fields remain required.  
Rationale: The old `pricing` step already had narrower completion rules. Without carrying that rule forward, the route regrouping would silently tighten readiness and review gating.  
Date: 2026-03-26

Decision: A complete save only advances across a stage boundary when that save clears the remaining blockers for the current stage.  
Rationale: In-stage browsing stays flexible, so a user can open later pages before the current objective is complete. If the app always pushed from the last page straight into the next stage, it would trigger redirect loops back to the current objective and make the flow feel unstable.  
Date: 2026-03-26

## Outcomes & Retrospective

When this work is complete, the blueprint workspace will feel like a deliberate guided sequence instead of a large multi-step form. The likely follow-up after this slice is content polish: page-level copy, helper text, button language, and any missing video-specific framing that makes the new sequence feel authored rather than merely routed.

The main gap already known at plan creation time is `L2`. If `L2` is uploaded before implementation completes, the final step is content wiring only. If it is still absent, the no-video Product problem page remains acceptable and should not block the route migration.

Milestone 1 completed cleanly without widening the canonical schema. The compiler now exposes the target Marketing and Build Plan page ids needed for nested routing, and the preserved delivery-page completion rule reduces the risk of a subtle readiness regression in Milestone 2.

Milestones 2 through 4 also completed. The workspace now behaves like the recorded 14-page blueprint funnel: stage roots redirect into semantic nested blueprint pages, save behavior remains inline for blank and partial pages, complete saves advance to the next blueprint page, Start and Review share the blueprint-local video system, and the Product problem page intentionally renders a non-video orientation block until `L2` exists. The only skipped verification was the sandbox browser run, which the repo marked as skipped because the required sandbox auth environment was not active.

## Context and Orientation

The blueprint-first user flow is split across two code areas. The blueprint compiler blueprint in `packages/blueprint-compiler/` defines the canonical stage and step model, readiness, and blueprint generation. The web app in `apps/web/` renders that model and saves facts through Convex.

The relevant compiler files are `packages/blueprint-compiler/src/stages/stage-definitions.ts`, which defines stage routes and step groupings, and `packages/blueprint-compiler/src/readiness/derive-stage-status.ts`, which decides whether a stage is unlocked, complete, and which step is currently incomplete. The canonical fact schema lives in `packages/blueprint-compiler/src/canonical-project-definition/schema.ts`. The existing readiness tests are in `packages/blueprint-compiler/tests/readiness.test.ts`.

The relevant web app files are `apps/web/app/(workspace)/start/page.tsx`, `apps/web/app/(workspace)/product/page.tsx`, `apps/web/app/(workspace)/design/page.tsx`, `apps/web/app/(workspace)/marketing/page.tsx`, `apps/web/app/(workspace)/build-plan/page.tsx`, and `apps/web/app/(workspace)/review/page.tsx`. The shared stage UI is in `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx`, `apps/web/features/blueprint-flow/components/progression/blueprint-stage-progress-panel.tsx`, `apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx`, and `apps/web/features/blueprint-flow/components/blueprint-stage-sidebar.tsx`. The current Start video is rendered by `apps/web/features/blueprint-flow/components/start/blueprint-start-welcome-video-card.tsx` and already reuses `LessonVideoPlayer`.

For testing, the important existing web tests are `apps/web/tests/integration-ui/blueprint-start-page.test.tsx`, `apps/web/tests/integration-ui/blueprint-stage-page.test.tsx`, `apps/web/tests/integration-ui/blueprint-review-page.test.tsx`, and the sandbox browser flow in `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts`. Those tests currently assume stage-root routes only and will need updates once nested blueprint pages become canonical.

In this plan, a “stage” means the top-level blueprint sections shown in the nav: Start, Product, Design, Marketing, Build Plan, and Review. A “blueprint page” means the concrete route the user lands on for one recorded teaching beat, such as `/product/foundation` or `/design/references`. A “step” means the compiler-level grouping of fact fields. After this change, a blueprint page and a step will be intentionally aligned.

The agreed route contract is two-layered. Stage roots such as `/product`, `/design`, `/marketing`, and `/build-plan` remain the stable URLs used by the rest of the app. Those stage roots redirect to semantic nested blueprint routes. The nested routes are the actual page model for the recorded funnel. The nested route names should be tied to blueprint meaning, not to lesson numbering, so examples such as `/product/foundation`, `/design/system`, `/marketing/operating-system`, and `/build-plan/validation` are the preferred direction.

The existing save-behavior contract from `apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts` remains in force for this plan. A blank save attempt stays on the same page and does not persist. A partial save persists but stays on the same page with inline guidance. A complete save persists and advances to the next blueprint page. Route migration must preserve those semantics rather than rewriting them.

The existing in-stage browsing contract also remains in force. Earlier blueprint progression work established that once a stage is unlocked, users can browse any page in that stage even if the “current objective” page is still incomplete. The new routed pages must preserve that behavior. “Current objective” continues to mean recommended next checkpoint, not the only allowed page.

## Plan of Work

First, reshape the compiler’s step grouping so the blueprint model matches the recorded curriculum. Product remains four steps. Design remains four steps. Marketing becomes a single step that owns all current marketing fact keys. Build Plan becomes three steps grouped around the new recordings: delivery and pricing together, work planning, and done-plus-validation. This keeps the blueprint schema intact while making the teaching shape correct. The regrouped steps must preserve current strict completion semantics rather than introducing new `requiredFieldKeys` to make the merged pages easier.

Second, make blueprint pages route-driven instead of local-state-driven. The stage root routes remain stable entry points and shared app contracts, but they will redirect to semantic nested blueprint routes based on the current objective page for an incomplete stage or the first page for a completed stage. New route files under `apps/web/app/(workspace)/product/`, `design/`, `marketing/`, and `build-plan/` will pass an explicit step identifier into a route-aware `BlueprintStagePage`. The current `activeStepIndex` React state will stop being the source of truth for which page is open, but the existing save-behavior contract and flexible in-stage browsing contract must stay intact. Saving a complete page should push the user to the next blueprint page. Saving a partial page should persist in place. Browsing to a later blueprint page inside an already unlocked stage should remain allowed.

Third, add a blueprint-flow-owned video registry and a reusable video card that wraps `LessonVideoPlayer`. This card will render the correct Bunny video for each blueprint page when one exists. It will be used on Start, each blueprint page, and Review. Stage pages should place the video in the right column on desktop and above the main page content on mobile. The Product problem page should deliberately use a non-video orientation card until `L2` exists. Review should place `L13` above the final checkpoint and download bridge rather than adopting the stage-page sidebar pattern.

Fourth, update tests at the compiler, integration UI, and browser levels so the new page model is protected. The implementation is only complete when the nested routes work, the stage root redirects are stable, the page videos render where expected, and Review still unlocks download and Execute / Ship correctly.

## Milestones

Milestone 1 freezes the new 14-page blueprint model in the compiler and does not yet touch the web routing. At the end of this milestone, `packages/blueprint-compiler/src/stages/stage-definitions.ts` will describe the regrouped Marketing and Build Plan steps using semantic step ids, and the compiler tests will still prove stage readiness. Success means the compiler can still derive stage completion correctly with the new groupings, strict completion semantics unchanged, and no canonical schema changes.

Milestone 2 moves the web app from stateful step switching to route-driven blueprint pages. At the end of this milestone, `/product`, `/design`, `/marketing`, and `/build-plan` will redirect to canonical semantic nested routes, the progress panel will navigate by URL, existing stage-root links across the app will remain valid, and saving a complete page will move to the next blueprint page while partial saves still persist in place. Success means a user can deep-link into a blueprint page and the UI reads the page from the route instead of local React state without regressing save feedback or in-stage browsing.

Milestone 3 adds blueprint video surfaces without touching the legacy lesson asset registry. At the end of this milestone, Start, each routed blueprint page with a configured Bunny video, and Review will render through one blueprint-flow video component. Success means the blueprint pages with known mappings show the expected recorded video, stage pages place video in the desktop sidebar and above content on mobile, the no-video Product problem page uses a truthful non-video orientation card, and Review places `L13` above the download checkpoint.

Milestone 4 updates the tests and runtime verification so the migration is safe. At the end of this milestone, blueprint compiler tests, blueprint UI tests, and the blueprint browser flow cover the new route model and video behavior. Success means the route migration is demonstrably stable and the review/download bridge still works.

## Concrete Steps

Begin by editing `packages/blueprint-compiler/src/stages/stage-definitions.ts`. Use semantic step identifiers as the nested route contract, collapse the three Marketing steps into one blueprint page step, and regroup Build Plan into three blueprint pages that align to the recordings. Keep the stage root routes unchanged as `/product`, `/design`, `/marketing`, and `/build-plan`. Do not add new starter-config or rollback schema fields in this slice. Do not relax current completion semantics for the regrouped pages. Update `packages/blueprint-compiler/tests/readiness.test.ts` if any assertions depend on the old step count or labels.

    Working directory: /Users/parkerrex/Projects/ship-by-sunday/packages/blueprint-compiler
    Command: bun test
    Expected observation: readiness tests still pass and stage completion remains correct with the regrouped step definitions.

Next, add blueprint page route helpers in `apps/web/features/blueprint-flow/lib/`. This helper should resolve the canonical nested route for a given stage and semantic step id, compute previous and next blueprint page links, and provide the default redirect target for a stage root. The redirect rule is fixed: incomplete stages go to the current objective blueprint page, and completed stages go to the first blueprint page in that stage. Add nested route files under `apps/web/app/(workspace)/product/[stepId]/page.tsx`, `design/[stepId]/page.tsx`, `marketing/[stepId]/page.tsx`, and `build-plan/[stepId]/page.tsx`. Change the existing stage-root `page.tsx` files to redirect to the resolved nested route. Leave all existing external callers in checkout, review, Execute / Ship, nav, and other app surfaces linking to stage roots rather than directly to nested pages.

Then refactor `apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx` so it receives the current step from the route instead of local `activeStepIndex` state. The progress panel in `apps/web/features/blueprint-flow/components/progression/blueprint-stage-progress-panel.tsx` should navigate by link or router push instead of mutating local state, but it must still allow free in-stage browsing inside an unlocked stage. The step card in `apps/web/features/blueprint-flow/components/blueprint-stage-step-card.tsx` should keep the existing save behavior from `apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts` and push to the next blueprint page only when the current save is complete. The Back control should use blueprint-page navigation rather than merely decrementing an index.

After the route model is stable, create a blueprint-flow-local video content module such as `apps/web/features/blueprint-flow/lib/blueprint-stage-videos.ts` and a reusable component such as `apps/web/features/blueprint-flow/components/video/blueprint-video-card.tsx`. Reuse `LessonVideoPlayer` from `apps/web/features/course/lesson/components/lesson-video-player.tsx`, but do not add the blueprint videos to `apps/web/features/course/lesson/model/media.ts`. Keep the blueprint page form layout generic in this slice. Map the configured videos as follows: `L0` on Start, `L1` on Product foundation, a non-video orientation card on Product problem until `L2` exists, `L3` on Product outcome, `L4` on Product scope, `L5` through `L8` across the four Design pages, `L9` on Marketing operating system, `L10` on Build Plan delivery, `L11` on Build Plan plan, `L12` on Build Plan validation, and `L13` above the Review checkpoint.

Finally, update the tests. Adjust `apps/web/tests/integration-ui/blueprint-stage-page.test.tsx` so it renders route-driven blueprint pages rather than relying on in-component step switching. Add or update a blueprint route helper test if the route logic lives in a standalone module. Update `apps/web/tests/integration-ui/blueprint-start-page.test.tsx` and `apps/web/tests/integration-ui/blueprint-review-page.test.tsx` to assert the new blueprint video surfaces, the Review video placement, and the Product problem non-video fallback. Update `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts` so it either visits canonical nested routes directly or asserts that stage-root routes redirect to them while preserving in-stage browsing once a stage is unlocked.

    Working directory: /Users/parkerrex/Projects/ship-by-sunday/apps/web
    Command: bunx vitest run --project integration-ui tests/integration-ui/blueprint-start-page.test.tsx tests/integration-ui/blueprint-stage-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx
    Expected observation: the blueprint UI tests pass against the new nested route and video behavior.

    Working directory: /Users/parkerrex/Projects/ship-by-sunday/packages/blueprint-compiler
    Command: bun test
    Expected observation: compiler tests pass after the step regrouping.

    Working directory: /Users/parkerrex/Projects/ship-by-sunday/apps/web
    Command: bun run build
    Expected observation: Next.js builds with the nested workspace routes and no blueprint route regressions.

If sandbox auth and checkout environment are available, finish with the blueprint browser flow.

    Working directory: /Users/parkerrex/Projects/ship-by-sunday/apps/web
    Command: bun run test:e2e:sandbox --grep @default_ship
    Expected observation: the canonical blueprint funnel still opens, the new routes are reachable, and Review still exposes blueprint downloads.

## Validation and Acceptance

Acceptance is user-visible. A signed-in buyer lands on `/start` and sees the Start video. Entering `/product` redirects to the current Product blueprint page and shows the correct Product video when configured. The same is true for Design, Marketing, and Build Plan. Review renders the Review video above the final checkpoint and download bridge without breaking the existing download and Execute / Ship behavior.

Acceptance also requires shape correctness. The blueprint runtime must now embody the 14-page funnel implied by the recordings: Start, four Product pages, four Design pages, one Marketing page, three Build Plan pages, and Review. It is acceptable for the Product problem page to have no video until `L2` exists, but it is not acceptable to reuse the wrong video there. The Product problem page must instead render a truthful non-video orientation block. The regrouped Marketing and Build Plan pages must preserve current strict completion semantics and current save feedback behavior.

Acceptance also requires route-contract stability. Existing callers throughout the app may continue linking to stage-root URLs such as `/design` and `/build-plan`, and those routes must redirect correctly to the current objective nested page. Nested blueprint pages must remain protected by the existing auth middleware and must keep free in-stage browsing inside already unlocked stages.

The required validation set for the implementation pass is `packages/blueprint-compiler` tests, the blueprint integration UI tests in `apps/web/tests/integration-ui/`, and `bun run build` in `apps/web`. If the sandbox browser test cannot run because the environment is unavailable, the implementer must record that limitation in the plan and final summary rather than silently skipping it.

## Idempotence and Recovery

The route migration should be additive and reversible. Keep the stage root routes in place until the nested routes and redirect behavior are verified. That means a bad nested route implementation can be rolled back without changing the top-level protected workspace shape or any existing callers that depend on stage-root links. Avoid deleting the old route files until the redirect pattern is working.

The blueprint video registry should be content-only data. If a mapping is wrong, the recovery is to edit the blueprint video registry rather than touching the compiler or route structure. The missing `L2` case should be implemented as absence of mapping, not a fake placeholder video ID. That makes the eventual recovery simple: add one mapping entry when the correct Bunny embed exists.

The auth and crawler surfaces already protect subpaths under stage-root routes because `apps/web/proxy.ts` matches `${route}(.*)` and `apps/web/app/robots.ts` already disallows the stage-root paths. Implementation should verify that nested blueprint pages continue to be covered by those existing patterns, but it should not widen scope into a separate auth-protection rewrite unless tests prove a real gap.

If build or tests fail after regrouping stage steps, first verify that `deriveStageStatus` still computes the right `currentStepIndex` with the new step arrays and that no route helper assumes the old three-step Marketing shape. If a nested route breaks browser navigation, revert the route files to stage-root rendering, keep the compiler regrouping isolated, and reintroduce nested routes only after the route helper tests are passing.

## Artifacts and Notes

Relevant current files and why they matter:

    packages/blueprint-compiler/src/stages/stage-definitions.ts
    Owns the blueprint stage and step grouping that currently does not match the recordings.

    apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx
    Owns the current local-state step switching that must become route-driven.

    apps/web/features/blueprint-flow/components/start/blueprint-start-welcome-video-card.tsx
    Already proves that blueprint flow can reuse LessonVideoPlayer.

    apps/web/features/blueprint-flow/components/blueprint-review-page.tsx
    Owns the Review route that needs the `L13` video without losing the download bridge.

Live Bunny evidence captured during planning on 2026-03-26 ET:

    Present blueprint titles: L0, L1, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13.
    Duplicate blueprint titles: none.
    Missing blueprint title: L2.

Latest Bunny source of truth for implementation:

    apps/web/output/video-pipeline/run-2026-03-26T20-30-50-836Z.links.md

This later run supersedes the earlier March 26 blueprint video uploads because the earlier exports were visually too dark. Use the recolored run when wiring blueprint video content.

Current recolored Bunny video IDs from that source report:

    L0 -> 9b219f52-c2ed-450b-ab3f-3ef9ab3a870f
    L1 -> 45709ba2-9bd2-4c9d-92e4-ea839b677408
    L3 -> 0d7bff45-2dbb-4722-9a1d-de22a8348629
    L4 -> ea50b4a6-b573-40f5-9cc1-ff1c67126b14
    L5 -> 734ea653-f95c-4208-9e69-914c8858b015
    L6 -> 73d7350c-5689-46a5-a896-b212098fb8df
    L7 -> 1a9d846c-e439-4a9b-9b89-9d5409f0e443
    L8 -> bcdd6030-6598-4019-a831-6243f200a919
    L9 -> a0b0e9c7-2ba7-410d-b36a-cd1a45272fab
    L10 -> b8d44210-c8c5-46a0-9d20-1998f3128aef
    L11 -> 17e493f8-1b23-40d6-ac06-bdeac5ec32d6
    L12 -> 6b2b6525-b1c0-4d70-811c-d901caf138c1
    L13 -> 61a62066-fb78-46e0-b788-6965eab8218b

Target blueprint page map for implementation:

    /start -> L0
    /product/foundation -> L1
    /product/problem -> non-video orientation card until L2 exists
    /product/outcome -> L3
    /product/scope -> L4
    /design/flow -> L5
    /design/references -> L6
    /design/direction -> L7
    /design/system -> L8
    /marketing/operating-system -> L9
    /build-plan/delivery -> L10
    /build-plan/plan -> L11
    /build-plan/validation -> L12
    /review -> L13 above checkpoint and download bridge

Milestone 1 validation evidence:

    Working directory: /Users/parkerrex/Projects/ship-by-sunday/packages/blueprint-compiler
    Command: bun test
    Observed result: 17 pass, 0 fail

Milestone 2 and 3 validation evidence:

    Working directory: /Users/parkerrex/Projects/ship-by-sunday/apps/web
    Command: bunx vitest run --project integration-ui tests/integration-ui/blueprint-start-page.test.tsx tests/integration-ui/blueprint-stage-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx tests/integration-ui/blueprint-stage-sidebar.test.tsx
    Observed result: 4 files passed, 10 tests passed

    Working directory: /Users/parkerrex/Projects/ship-by-sunday/apps/web
    Command: bunx vitest run --project unit tests/unit/blueprint-stage-routes.test.ts
    Observed result: 1 file passed, 3 tests passed

    Working directory: /Users/parkerrex/Projects/ship-by-sunday/apps/web
    Command: bun run build
    Observed result: production build passed and emitted dynamic routes for `/product/[stepId]`, `/design/[stepId]`, `/marketing/[stepId]`, and `/build-plan/[stepId]`

Sandbox verification note:

    Working directory: /Users/parkerrex/Projects/ship-by-sunday/apps/web
    Command: bun run test:e2e:sandbox --grep @default_ship
    Observed result: Playwright exited 0 with 4 skipped tests because the sandbox auth environment was not active

## Interfaces and Dependencies

The compiler-facing interface remains the canonical facts draft and blueprint readiness flow exposed by `@shipbysunday/blueprint-compiler`. This slice should not widen `packages/blueprint-compiler/src/canonical-project-definition/schema.ts` unless explicitly approved later. The allowed compiler changes are step regrouping metadata and any route-safe step identifiers needed for nested blueprint pages.

The web-facing interface should add a blueprint-flow-local route helper and a blueprint-flow-local video registry. The route helper must resolve stage root routes, semantic nested blueprint page routes, previous and next blueprint page routes, and default stage entry routes from one source of truth. The route helper must preserve stage-root URLs as the shared external contract while making nested blueprint pages the internal page model. The blueprint video registry must map blueprint pages to Bunny video content or to an explicit non-video orientation fallback in a way that lets Start, stage pages, and Review all reuse the same rendering component family.

`LessonVideoPlayer` in `apps/web/features/course/lesson/components/lesson-video-player.tsx` is a required dependency and should remain the only actual player implementation in this slice. `apps/web/features/course/lesson/model/media.ts` is intentionally not part of the blueprint video content system. Convex save behavior through `api.blueprint.saveProjectDefinitionFacts`, the existing `buildSavePayload` helper in `apps/web/features/blueprint-flow/lib/blueprint-field-helpers.ts`, and the save-classification behavior in `apps/web/features/blueprint-flow/hooks/use-blueprint-stage-step-state.ts` must continue to work unchanged except for route-aware next-page navigation after a complete save.
