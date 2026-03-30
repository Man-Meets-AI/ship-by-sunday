---
summary: "Replace the desktop packet stage nav with a shadcn Navigation Menu that exposes stage-step dropdowns without changing packet routing or backend state. Preserve the mobile step select, the shared leave-guard behavior, and the packet-first funnel while adding dedicated nav regression coverage."
read_when: "Open this when packet-flow navigation needs a desktop dropdown menu for Product, Design, Marketing, and Build Plan without breaking review, mobile step navigation, or dirty-draft protection."
plan_status: done
---

# Replace Packet Stage Nav With a Dropdown Navigation Menu

This document is a living execution plan for moving the packet workspace from a flat desktop stage list plus separate desktop step strip to one desktop navigation surface that exposes stage steps inside a shadcn Navigation Menu. It is written so a fresh coding agent can execute the work without prior chat context and must be updated as progress, discoveries, validation results, and scope decisions accumulate.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this change, a user working inside `/product/*`, `/design/*`, `/marketing/*`, or `/build-plan/*` will see one desktop navigation bar that still shows the packet-first stages in order, but the step-based stages will open dropdowns listing the stage’s steps instead of forcing the user to use a second horizontal step strip. `Start` and `Review` remain plain links. Mobile keeps the simpler `Page` select because it already solves step navigation in a constrained layout. A human can see this working by opening a packet stage page on desktop, opening the `Product`, `Design`, `Marketing`, or `Build Plan` stage trigger, seeing the step links and active state, navigating through a dropdown item, and confirming that dirty-draft leave protection still interrupts navigation when unsaved edits exist.

## Progress

- [x] 2026-03-29 15:20 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, `docs/prompts/execplan-writer.md`, `docs/prompts/execplan-grill.md`, and the current packet-flow navigation, route, and test files to scope the plan against the live repo.
- [x] 2026-03-29 15:20 EDT — Confirmed the current UI split: `PacketStageNav` renders flat stage links, `PacketStageStepStrip` owns step navigation, `PacketStagePage` mounts both, and `PacketReviewPage` mounts only `PacketStageNav`.
- [x] 2026-03-29 15:20 EDT — Locked the main design choices for implementation planning: routed stage items become dropdown triggers rather than navigable top-level links, the desktop dropdown replaces the desktop step strip, and the mobile step select remains the mobile fallback.
- [x] 2026-03-29 15:20 EDT — Grilled the plan before implementation. The highest-leverage ambiguity was whether routed stage items should still navigate at the top level; the answer is no. The trigger opens the dropdown, and all actual navigation remains inside menu links so the leave-guard path stays explicit and testable.
- [x] 2026-03-29 15:25 EDT — Ran an independent repo sanity pass after the first grill and tightened the proof surface: `PacketStartPage` does not render the shared nav, so start-page tests are not part of the nav acceptance path for this slice.
- [x] 2026-03-29 15:20 EDT — Implement the shared stage-nav render model and shadcn `NavigationMenu` composition inside packet-flow without widening scope into backend or schema work.
- [x] 2026-03-29 15:20 EDT — Add dedicated navigation regression tests because existing review and start integration-ui tests mock `PacketStageNav`.
- [x] 2026-03-29 15:20 EDT — Run focused packet-flow validation and record any broader build blockers without repairing unrelated dirty-tree work.

## Surprises & Discoveries

The current packet workspace already has a mobile-only step selector that matches the desired mobile fallback. `apps/web/features/packet-flow/components/progression/packet-stage-step-strip.tsx` renders a `<select>` labeled `Page` on small screens and only switches to inline step links on desktop. That means the cleanest implementation is not “replace step navigation everywhere.” It is “replace the desktop inline strip while keeping the mobile select.”

The desktop stage dropdown will not be covered by today’s broader integration-ui tests unless new nav-focused coverage is added. `apps/web/tests/integration-ui/packet-review-page.test.tsx` mocks `@/features/packet-flow/components/packet-stage-nav`, so that file cannot catch a broken desktop dropdown implementation. `apps/web/tests/integration-ui/packet-start-page.test.tsx` also mocks the nav boundary, but `PacketStartPage` does not render `PacketStageNav` in the live app, so that test is not part of the nav proof surface for this change.

All dirty-draft navigation protection already flows through one hook. `apps/web/features/packet-flow/hooks/use-packet-stage-leave-guard.ts` exposes `handleLinkNavigation` and `requestNavigation`, and both the flat stage nav and the step strip already use those callbacks. The new dropdown should reuse that same contract instead of inventing a menu-specific navigation path.

The stage model already contains everything needed to render dropdown contents. `packages/packet-compiler/src/stages/stage-definitions.ts` exposes `packetStageDefinitions`, and `apps/web/features/packet-flow/lib/packet-stage-progress.ts` already derives active and complete step state from the current stage status and active step id. No backend or schema change is required to power the dropdown content.

There is unrelated user work already dirty in the tree, including packet-flow files. Implementation must treat those changes as existing user work and avoid reverting or rewriting them unless the user explicitly asks for that.

Evidence from repo inspection:

    apps/web/features/packet-flow/components/packet-stage-page.tsx
      <PacketStageNav ... />
      <PacketStageStepStrip ... />

    apps/web/features/packet-flow/components/progression/packet-stage-step-strip.tsx
      <div className="sm:hidden"> ... <select aria-label="Page" ... />
      <div className="hidden ... sm:flex"> ... desktop step links ...

    apps/web/tests/integration-ui/packet-review-page.test.tsx
      vi.mock("@/features/packet-flow/components/packet-stage-nav", () => ({
        PacketStageNav: () => <div data-testid="packet-stage-nav" />,
      }));

## Decision Log

Decision: `Start` and `Review` stay plain links, while `Product`, `Design`, `Marketing`, and `Build Plan` become non-navigating dropdown triggers on desktop.
Rationale: The routed stage pages already redirect to an entry step, so clicking a top-level stage trigger and opening a menu at the same time would create conflicting behavior. Making the trigger open the menu and keeping navigation inside the menu items is the clearest interaction model.
Date/Author: 2026-03-29 / Codex

Decision: Replace the desktop inline step strip instead of keeping it alongside the new desktop dropdown menu.
Rationale: The current desktop strip and the proposed desktop dropdown both represent stage-step navigation. Keeping both would duplicate information and create conflicting active-state surfaces. The mobile `Page` select remains because it already solves the small-screen case cleanly.
Date/Author: 2026-03-29 / Codex

Decision: Keep implementation inside the packet-flow feature layer and reuse the existing `NavigationMenu` primitive from `apps/web/components/ui/navigation-menu.tsx`.
Rationale: The UI primitive already exists, and the required behavior is a rendering and interaction refactor, not a design-system or backend initiative. The smallest safe change is to build a packet-flow-specific render model and menu composition on top of the existing shared UI component.
Date/Author: 2026-03-29 / Codex

Decision: Preserve the existing leave-guard contract instead of replacing it with menu-local state or direct router calls.
Rationale: `usePacketStageLeaveGuard()` already handles both clean and dirty transitions, including the pending-href dialog and history-sentinel behavior. The new nav should remain just another caller of `handleLinkNavigation` and `requestNavigation`.
Date/Author: 2026-03-29 / Codex

Decision: Add dedicated navigation tests rather than relying on existing page tests.
Rationale: The review integration-ui test mocks the nav boundary, and the start-page test is irrelevant because the start page does not render the shared nav in production. The new desktop menu needs focused coverage that renders the real nav and exercises trigger opening, active-step indication, and leave-guard interception.
Date/Author: 2026-03-29 / Codex

Decision: Keep `PacketStartPage` out of scope for implementation and acceptance proof.
Rationale: The live start page does not render `PacketStageNav`, so changing or validating start-page behavior would widen scope without improving confidence in the shared desktop dropdown nav.
Date/Author: 2026-03-29 / Codex

## Outcomes & Retrospective

The refactor is complete. Packet-flow now uses a shadcn `NavigationMenu` for the desktop stage bar, routed stages expose dropdown step links, `Start` and `Review` remain plain links, and the mobile `Page` select still handles compact screens. The shared leave-guard path still routes navigation through the same callbacks, and the new nav behavior is covered by dedicated integration-ui tests instead of only mocked page tests.

The final validation set passed: `bunx vitest run --project unit tests/unit/packet-stage-routes.test.ts`, `bunx vitest run --project integration-ui tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-navigation.test.tsx`, `bunx oxfmt ...`, `bunx oxlint --deny-warnings ...`, and `bun run build`. The only extra work outside the nav slice was bringing the review-page test expectations back in line with the review UI that already existed in the dirty tree.

## Context and Orientation

The packet workspace is packet-first, not course-first. The required funnel order is `Start -> Product -> Design -> Marketing -> Build Plan -> Review`. The route entry files under `apps/web/app/(workspace)/product/page.tsx`, `apps/web/app/(workspace)/design/page.tsx`, `apps/web/app/(workspace)/marketing/page.tsx`, and `apps/web/app/(workspace)/build-plan/page.tsx` all redirect to a step page through `redirectToPacketStageEntry(...)` in `apps/web/features/packet-flow/server/packet-stage-route-data.ts`. The step pages under `apps/web/app/(workspace)/*/[stepId]/page.tsx` all render the shared `apps/web/features/packet-flow/components/packet-stage-page.tsx` component. `apps/web/app/(workspace)/review/page.tsx` renders `PacketReviewPage`, which also shows the top-level stage nav but does not have an active step id because `Review` is not step-based.

The current navigation split is straightforward. `apps/web/features/packet-flow/components/packet-stage-nav.tsx` renders the stage row from `packetStageDefinitions`, handling lock state and current stage styling. `apps/web/features/packet-flow/components/progression/packet-stage-step-strip.tsx` renders step-level navigation, with a mobile `Page` select and a desktop inline link strip. `apps/web/features/packet-flow/components/packet-stage-page.tsx` mounts both surfaces and wires them to `usePacketStageLeaveGuard()`. That hook exposes `handleLinkNavigation` for `Link.onNavigate` interception and `requestNavigation` for explicit route pushes when the user clicks a control that should go through the dirty-draft dialog.

The data needed for the new dropdown already exists in the current repo. `packages/packet-compiler/src/stages/stage-definitions.ts` defines stage order, labels, routes, and step lists. `apps/web/features/packet-flow/lib/packet-stage-routes.ts` builds step hrefs and stage-entry hrefs. `apps/web/features/packet-flow/lib/packet-stage-progress.ts` derives the current step state for the active stage, including whether each step is active, complete, or merely open. The new desktop menu should combine those existing pieces into a render model instead of recomputing stage and step semantics inside the JSX.

The shared UI primitive already exists in `apps/web/components/ui/navigation-menu.tsx`. That file exports the root, list, item, trigger, content, link, indicator, viewport, and `navigationMenuTriggerStyle`. The implementation here should treat that file as a stable dependency and keep the packet-specific composition inside packet-flow. Do not change the shared primitive unless implementation discovers a general-purpose bug that affects more than packet-flow.

The tests matter because existing coverage is asymmetric. `apps/web/tests/integration-ui/packet-stage-page.test.tsx` already proves that the mobile `Page` select routes to the correct step and that dirty navigation from a packet page opens the leave dialog. `apps/web/tests/integration-ui/packet-review-page.test.tsx` mocks `PacketStageNav`, so it is not proof of nav correctness. `apps/web/tests/integration-ui/packet-start-page.test.tsx` is also not proof, because the live start page does not render the shared nav at all. Dedicated nav coverage is therefore part of the work, not optional cleanup.

## Plan of Work

Start by extracting a packet-flow-local render model for the new nav so the JSX stays readable and the component boundary stays under control. The likely home is a new feature-local helper such as `apps/web/features/packet-flow/lib/packet-stage-nav-model.ts` or an equivalently precise name. That helper should accept the full `stageStatuses` array plus the current `stageId` and optional active `stepId`, then return the exact desktop menu items needed to render stage links, stage triggers, dropdown step items, active-step state, completion state, and lock state. The helper should also define the route target for each dropdown item using `getPacketStageStepHref(...)` rather than duplicating route string construction.

Once the render model exists, refactor `apps/web/features/packet-flow/components/packet-stage-nav.tsx` into a composition around the shared shadcn `NavigationMenu`. Keep `Start` and `Review` as plain `Link`-backed items. For `Product`, `Design`, `Marketing`, and `Build Plan`, render a `NavigationMenuTrigger` that opens a `NavigationMenuContent` list of step links. Each actual navigation target inside the dropdown should still use the existing leave-guard path: `Link.onNavigate` should call `onLinkNavigate`, and explicit click behavior should still route through `onNavigate` when present. The trigger itself should open the menu, not navigate. If the component starts exceeding the repository’s size guidance, split out a packet-flow-local child such as `packet-stage-nav-desktop-item.tsx` or `packet-stage-nav-content.tsx`.

After the desktop menu exists, simplify `apps/web/features/packet-flow/components/progression/packet-stage-step-strip.tsx` so it becomes a mobile-only step selector instead of a dual mobile-and-desktop component. The small-screen `Page` select should stay intact, because it already offers step navigation in a touch-friendly form. The desktop inline strip should be removed once the desktop dropdown can fully replace it. Update `apps/web/features/packet-flow/components/packet-stage-page.tsx` so the page passes `stepId` into `PacketStageNav` and still renders the mobile step selector. `apps/web/features/packet-flow/components/packet-review-page.tsx` should continue to render the top-level stage nav, but it should pass no active step id because review has no step context.

Finish by adding focused tests that render the real nav. The safest path is to add a new integration-ui test file dedicated to packet-stage navigation rather than overloading page tests that already cover save and leave-guard behavior. Keep the existing page tests where they already prove mobile select routing or review-page layout, but add or update targeted coverage so a broken desktop dropdown, broken active-step highlight, or broken leave-guard interception cannot slip through behind mocked nav components.

## Milestones

### Milestone 1: Freeze a shared packet-stage nav render model

At the end of this milestone, the repo has one packet-flow-local model that explains what the nav should render for every stage in the packet funnel. The new or updated model layer should name the files, labels, routes, and state needed by the desktop dropdown composition without embedding those rules directly in JSX. This milestone should touch packet-flow helper code and possibly `packet-stage-routes.ts` if a small exported helper improves clarity. Success means a developer can describe, from one source of truth, which stages are plain links, which stages are dropdown triggers, which step links appear under each routed stage, and which item should look active on a given step page.

Run focused validation for this milestone from the repository root’s `apps/web` app directory:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project unit tests/unit/packet-stage-routes.test.ts

Success looks like the existing route tests still passing, and any new model-helper test passing if the model helper merits its own unit file.

### Milestone 2: Replace the desktop step strip with a shadcn desktop dropdown nav

At the end of this milestone, `PacketStageNav` renders a desktop `NavigationMenu` that exposes `Product`, `Design`, `Marketing`, and `Build Plan` step links inside dropdown content, while `Start` and `Review` remain plain links. The trigger click opens the dropdown rather than navigating. All actual navigation links inside the menu still honor the existing leave-guard callbacks. `PacketStageStepStrip` no longer renders the desktop inline step row. `PacketStagePage` passes the active step id into the nav and still renders the mobile step select.

Run focused validation for this milestone from `apps/web`:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-stage-page.test.tsx

Success looks like the page-level integration test still passing for the mobile `Page` select and the unsaved-leave flow after the desktop strip is removed.

### Milestone 3: Prove dropdown behavior with dedicated nav regression coverage

At the end of this milestone, there is dedicated test coverage for the real desktop nav composition. That coverage should render the actual `PacketStageNav` and prove at least these behaviors: plain links for `Start` and `Review`, trigger presence for the routed stages, correct step labels inside dropdown content, active-step indication for the current step, leave-guard interception when the nav is used from a dirty packet page, and sensible behavior on the review page where no active step id exists. If existing review-page tests still mock the nav, note that clearly and keep the new coverage separate.

Run focused validation from `apps/web`:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-stage-navigation.test.tsx tests/integration-ui/packet-review-page.test.tsx

Success looks like the new nav-specific test file passing and the review-page integration test still proving its existing behavior.

### Milestone 4: Confirm broader packet-flow stability

At the end of this milestone, the packet-flow navigation refactor has passed the narrowest relevant tests and any broader app checks that can run without widening scope into unrelated failures. The final file list should stay inside packet-flow and related focused tests unless a tiny helper export in a shared file is truly necessary. The dirty-tree warning should be preserved so implementation does not trample unrelated user work already present in packet-flow or marketing files.

Run broader validation from the repository root:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run build

Success looks like the build passing. If it fails due to an unrelated existing issue, record the exact blocker in `Surprises & Discoveries` and `Progress`, and do not silently widen this slice into a repair for unrelated dirty-tree work.

## Concrete Steps

Work from the repository root unless a step says otherwise.

Begin by capturing the current packet-flow navigation baseline and existing route coverage:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project unit tests/unit/packet-stage-routes.test.ts
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-stage-page.test.tsx

Before implementation, the expected observation is that the existing route test passes and the page-level integration test still proves mobile select routing and dirty-leave behavior, but there is no dedicated desktop dropdown proof.

Then implement the packet-flow-local nav render model and, if needed, add the smallest unit coverage that keeps route and state mapping honest. Use the live stage data from `packages/packet-compiler/src/stages/stage-definitions.ts`, `getPacketStageStepHref(...)`, and `derivePacketStageProgressItems(...)`. Do not introduce a broad config bag. Keep the helper inputs precise and packet-flow-specific.

After the model exists, refactor `apps/web/features/packet-flow/components/packet-stage-nav.tsx` to compose the shared shadcn `NavigationMenu` exports. If the JSX grows too large, split it into packet-flow-local children before the component exceeds the repository’s component-size guidance. Keep `Start` and `Review` as links, routed stages as triggers, and the actual step navigation inside `NavigationMenuContent`.

Once the desktop menu works, update `apps/web/features/packet-flow/components/progression/packet-stage-step-strip.tsx` so it becomes a mobile-only component. Update `apps/web/features/packet-flow/components/packet-stage-page.tsx` to pass `stepId` into the nav and keep rendering the mobile selector. Update `apps/web/features/packet-flow/components/packet-review-page.tsx` only as much as needed to support the shared nav API without inventing a fake review step id.

Then add dedicated nav coverage. The recommended path is a new integration-ui test file that renders the real `PacketStageNav` without mocking it. Keep review-page tests focused on review-page responsibilities, but remove or narrow mocks only where necessary to prove the shared nav behavior you are changing. Do not widen this slice into `PacketStartPage`; that page does not render the shared nav in production. If a test continues to mock the nav by design, state that explicitly in the test file comments or assertions so future agents do not mistake it for nav coverage.

Finish by running the narrow relevant checks first, then the broader build if feasible:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project unit tests/unit/packet-stage-routes.test.ts
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-stage-page.test.tsx
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-stage-navigation.test.tsx
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-review-page.test.tsx
    $ bunx oxlint --deny-warnings features/packet-flow/components/packet-stage-nav.tsx features/packet-flow/components/progression/packet-stage-step-strip.tsx features/packet-flow/components/packet-stage-page.tsx features/packet-flow/components/packet-review-page.tsx features/packet-flow/lib/packet-stage-routes.ts features/packet-flow/lib/packet-stage-progress.ts tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-stage-navigation.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/unit/packet-stage-routes.test.ts
    $ bunx oxfmt --check features/packet-flow/components/packet-stage-nav.tsx features/packet-flow/components/progression/packet-stage-step-strip.tsx features/packet-flow/components/packet-stage-page.tsx features/packet-flow/components/packet-review-page.tsx features/packet-flow/lib/packet-stage-routes.ts features/packet-flow/lib/packet-stage-progress.ts tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-stage-navigation.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/unit/packet-stage-routes.test.ts
    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run build

Record the exact output of any failure in `Surprises & Discoveries` before proceeding.

## Validation and Acceptance

Acceptance is behavior-first.

The first acceptance criterion is that the desktop packet workspace shows one top-level navigation bar for stage movement and routed stage step movement. On desktop packet stage pages, `Product`, `Design`, `Marketing`, and `Build Plan` must open dropdown content that lists the step links for that stage. `Start` and `Review` must remain plain links.

The second acceptance criterion is that the current step is still obvious. On a step page such as `/product/problem` or `/build-plan/validation`, the dropdown content for the current stage must show which step is active, and completed steps must remain visually distinguishable if that state is surfaced from the existing progress model.

The third acceptance criterion is that the refactor does not weaken dirty-draft protection. When a user has unsaved changes on a packet page, clicking a top-level plain link or a dropdown step link must still route through the existing leave-guard dialog instead of bypassing it with direct router navigation.

The fourth acceptance criterion is that mobile behavior remains simple and intact. Small-screen packet pages must still expose the `Page` select for step movement, and it must continue to route to the selected step.

The fifth acceptance criterion is that review still renders a sane stage nav even though it has no active step id. `Review` remains the current plain link, and the step-based stages still expose useful dropdown content for jumping back into those stages if the shared nav design calls for that.

The sixth acceptance criterion is that the change is actually proven by tests. Existing packet-stage page integration coverage must still pass, and new dedicated nav coverage must prove the desktop dropdown interaction path because the review-page test mocks `PacketStageNav` and the start page is outside the nav surface for this slice.

The seventh acceptance criterion is that the refactor stays within intended scope. There must be no backend mutation changes, no packet compiler schema changes, and no unrelated dirty-tree reversions.

## Idempotence and Recovery

This slice is intentionally safe to rerun because it is a feature-local navigation refactor. Re-running the focused tests and formatting commands should not mutate backend state or create drift beyond the files directly touched by the implementation.

If the new nav composition becomes too large or tangled, recover by splitting packet-flow-local pieces rather than pushing packet-specific logic into the shared `apps/web/components/ui/navigation-menu.tsx` primitive. The shared primitive should remain generic. Packet-specific state mapping belongs in packet-flow.

If the dropdown implementation breaks dirty navigation behavior, revert that part of the refactor to the last state that still routes through `usePacketStageLeaveGuard()` and repair the menu links from there. The recovery target is always the existing leave-guard contract, not a new ad hoc navigation branch.

If the review page cannot cleanly support the new shared nav API, keep the shared nav prop surface optional and packet-flow-specific. Do not fake a review step id just to satisfy a new type. The review page should stay honest about the fact that review is not step-based.

If `bun run build` fails because of unrelated existing issues in the dirty worktree, document the exact blocker in `Surprises & Discoveries` and `Progress`. Do not widen this slice into unrelated repair work unless the user explicitly asks for that.

## Artifacts and Notes

Useful proof to preserve during implementation:

    Shared page shell today:
    `apps/web/features/packet-flow/components/packet-stage-page.tsx` mounts both
    `PacketStageNav` and `PacketStageStepStrip`.

    Mobile fallback today:
    `apps/web/features/packet-flow/components/progression/packet-stage-step-strip.tsx`
    renders a `Page` select under `sm:hidden`.

    Existing desktop-nav coverage gap:
    `apps/web/tests/integration-ui/packet-review-page.test.tsx` mocks
    `PacketStageNav`, and `PacketStartPage` does not render the shared nav.

    Stage-step counts from the compiler contract:
    Product = 4
    Design = 4
    Marketing = 1
    Build Plan = 3
    Start = 0
    Review = 0

    Expected post-fix behavior summary:
    Desktop: plain links for Start/Review, dropdown triggers for routed stages
    Mobile: keep the `Page` select
    Dirty page: stage and step navigation still open the leave dialog first
    Tests: dedicated nav coverage added because the review-page test mocks the nav

Likely implementation file list:

    apps/web/features/packet-flow/components/packet-stage-nav.tsx
    apps/web/features/packet-flow/components/progression/packet-stage-step-strip.tsx
    apps/web/features/packet-flow/components/packet-stage-page.tsx
    apps/web/features/packet-flow/components/packet-review-page.tsx
    apps/web/features/packet-flow/lib/packet-stage-routes.ts
    apps/web/features/packet-flow/lib/packet-stage-progress.ts
    apps/web/tests/integration-ui/packet-stage-page.test.tsx
    apps/web/tests/integration-ui/packet-stage-navigation.test.tsx
    apps/web/tests/integration-ui/packet-review-page.test.tsx
    apps/web/tests/unit/packet-stage-routes.test.ts

## Interfaces and Dependencies

`apps/web/features/packet-flow/components/packet-stage-nav.tsx` remains the main shared navigation boundary for this slice. It will need a slightly richer interface than today so it can accept the optional active `stepId` and any packet-flow-local render model data needed to show active or complete step state in dropdown content. Keep the prop surface narrow and explicit.

`apps/web/features/packet-flow/components/progression/packet-stage-step-strip.tsx` remains a dependency, but only as the mobile step selector after the refactor. Its public responsibility should narrow to mobile step movement instead of mixed mobile-and-desktop behavior.

`apps/web/features/packet-flow/components/packet-stage-page.tsx` is the shared packet-stage page shell and remains responsible for wiring navigation surfaces to `usePacketStageLeaveGuard()`, `derivePacketStageProgressItems(...)`, and the active `stepId`. `apps/web/features/packet-flow/components/packet-review-page.tsx` depends on the same nav component but must be able to omit step-specific state cleanly.

`apps/web/features/packet-flow/hooks/use-packet-stage-leave-guard.ts` is a required behavioral dependency. The new desktop nav must continue to use `handleLinkNavigation` and `requestNavigation` so dirty-draft protection remains unchanged.

`apps/web/features/packet-flow/lib/packet-stage-routes.ts` is a required routing dependency because dropdown items must use `getPacketStageStepHref(...)` and the broader packet workspace still depends on `getPacketStageEntryHref(...)` for route entry redirects. If implementation adds a helper for nav-item route derivation, keep it small and colocated with existing packet-stage route helpers.

`apps/web/features/packet-flow/lib/packet-stage-progress.ts` is a required state dependency because it already defines active and complete step state in packet-flow terms. Reuse it for dropdown content instead of inventing a second step-status model in JSX.

`apps/web/components/ui/navigation-menu.tsx` is the required UI primitive dependency. Use the existing exports as designed. Keep packet-specific rendering logic out of this shared file unless implementation discovers a true generic bug that affects more than packet-flow.

`apps/web/tests/integration-ui/packet-stage-page.test.tsx`, `apps/web/tests/integration-ui/packet-review-page.test.tsx`, and the new dedicated nav test file together form the behavior proof. `apps/web/tests/unit/packet-stage-routes.test.ts` remains the guardrail for route-entry and adjacent-page behavior if any helper changes are needed. `apps/web/tests/integration-ui/packet-start-page.test.tsx` is not part of this proof surface because the live start page does not render the shared nav.
