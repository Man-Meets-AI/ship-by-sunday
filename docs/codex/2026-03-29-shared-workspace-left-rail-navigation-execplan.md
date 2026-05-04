---
summary: Introduce one shared desktop workspace pattern where the header owns macro navigation, a new left rail owns local navigation, and the footer skill rail becomes a mobile fallback across codebase and post-review surfaces.
read_when: Open this plan when implementing the next navigation refactor after the 2026-03-29 header unification so codebase pages, unlocked review, and post-review lessons all follow the same header-plus-left-rail shell.
plan_status: done
---

# Build A Shared Header And Left-Rail Workspace Navigation System

This is a living execution plan. Keep it updated as implementation progresses so a new contributor can resume from this file alone without relying on chat history.

Maintain this ExecPlan in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday now has a shared header navigation model, but the local wayfinding underneath that header still changes shape depending on where the buyer is. Codebase pages still split local orientation across a header dropdown, a mobile step selector, a right-side progress panel, and in-form back and continue controls. Post-review lesson pages now use the shared header, but still rely on the sticky bottom skill rail as the main desktop local navigator. After this change, both codebase and post-review desktop surfaces should feel like one product: the header tells the buyer which major area they are in, the left rail shows exactly where they are inside that area, the main pane is the work itself, and any right-side area only supports context rather than competing with navigation.

A human should be able to prove the result by opening a codebase step such as `/product/problem`, seeing a stage-level header plus a full codebase map in a desktop left rail, using top-right previous and next arrows without losing dirty-draft protection, then unlocking post-review and opening a build lesson, where the header still shows the macro sections while the desktop left rail now shows the build lesson sequence instead of relying on the bottom skill rail. On mobile, the compact selectors and footer rail behavior should still provide local movement without forcing the desktop left rail pattern onto small screens.

## Progress

- [x] 2026-03-29 21:45 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, `docs/prompts/execplan-writer.md`, and `docs/prompts/execplan-grill.md`. Inspected the current `AppShell`, codebase-stage pages, codebase-stage nav model, right-context sidebar, review page, post-review primary nav model, bonus lesson page, footer skill rail, and the completed follow-on plan `docs/codex/2026-03-29-unify-codebase-and-bonus-navigation.md`.
- [x] 2026-03-29 21:45 EDT — Completed the grill pass against the real shell, codebase, review, and lesson code paths. Resolved the highest-leverage open questions inside the plan: the shell-level local-nav contract should be discriminated, left codebase should appear from `xl`, the footer skill rail should fall back below `xl`, review needs an explicit light local rail, and post-review section codebase should derive from the existing `BUILD`, `SHIP`, `CEO`, and `DESIGN` blocks.
- [x] 2026-03-29 22:06 EDT — Implemented the shared shell contract slice: `AppShell` now accepts an explicit discriminated `localNav` prop, `AppShellLocalNavRail` renders a low-chrome left-rail slot with desktop and compact variants, and the product-shell test proves the contract without touching codebase or post-review product pages.
- [x] Milestone 1 — Freeze the shared shell contract so `AppShell` can host both macro header navigation and optional local left-rail navigation without regressing the current merged `primaryNav` architecture.
- [x] 2026-03-29 22:15 EDT — Reworked codebase desktop navigation so `CodebaseStageNav` is stage-level only, `CodebaseStagePage` now passes the full codebase map through the shell `localNav` slot, the compact codebase selector lives in `localNav.compact`, and the pager still routes through the existing leave guard.
- [x] 2026-03-29 22:15 EDT — Validated the codebase slice from `apps/web` with `bunx vitest run tests/integration-ui/codebase-stage-navigation.test.tsx tests/integration-ui/codebase-stage-page.test.tsx tests/unit/codebase-stage-routes.test.ts`; all 3 files and 20 tests passed.
- [x] Milestone 2 — Replace codebase desktop local navigation with a full codebase left rail plus pager controls while simplifying the header nav to a stage-level macro surface and preserving the existing codebase route contract.
- [x] 2026-03-29 22:18 EDT — Added `WorkspaceLocalNavRail` plus `build-secondary-nav-model.ts`, wired unlocked review and bonus lesson pages into `AppShell.localNav`, anchored review sections for local linking, and moved desktop post-review wayfinding out of the footer rail while keeping the footer skill rail as the compact below-`xl` fallback.
- [x] 2026-03-29 22:18 EDT — Validated the post-review slice from `apps/web` with `bunx vitest run tests/integration-ui/codebase-review-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/build-primary-nav-model.test.ts tests/unit/post-review-destination.test.ts tests/unit/bonus-lesson-page.test.tsx tests/unit/product-shell.test.tsx`; all 6 files and 18 tests passed.
- [x] Milestone 3 — Move post-review desktop local navigation from the bottom skill rail into a left rail for review, build lessons, launch lessons, and bonus references while keeping the existing post-review macro header model.
- [x] Milestone 4 — Demote the footer skill rail to mobile-only or compatibility-only behavior, validate the shared shell on codebase and post-review surfaces, and update the plan with final outcomes plus any cleanup follow-ups.
- [x] 2026-03-29 22:22 EDT — Final validation passed: targeted `oxlint` and `oxfmt --check` on the changed files, full `bun run --cwd apps/web test:integration:ui`, full `bun run build`, and `bun run test:browser-smoke` all succeeded.
- [x] 2026-03-30 07:43 EDT — Broader app-level verification also passed after the initial sign-off sweep: full `bun run --cwd apps/web lint`, full `bun run --cwd apps/web format:check`, full `bun run --cwd apps/web test:unit`, `bun run --cwd apps/web test:contracts`, and `bun run --cwd apps/web test:integration:node` all completed successfully.
- [x] Milestone 5 — Run the full shell validation pass, record outcomes in this plan, and leave the migration in a recoverable state if the desktop rail needs to be backed out selectively.

## Surprises & Discoveries

The 2026-03-29 nav merge already changed the architecture enough that older codebase-only assumptions are wrong. `apps/web/features/course/shared/components/app-shell.tsx` no longer auto-queries mission state for header navigation. Instead, the shell now expects explicit `primaryNav` input, and `apps/web/features/course/shared/components/app-shell/app-shell-primary-nav.tsx` chooses between codebase-stage navigation and workspace navigation. Any plan that still assumes codebase nav lives only inside `CodebaseStagePage` is stale.

Codebase pages now use the shell-local-nav slot for the full codebase map and compact selector, so the codebase component only needs to contribute content instead of recreating the left-rail landmark. `apps/web/features/codebase-flow/components/codebase-stage-nav.tsx` has been reduced to stage-level links only, `apps/web/features/codebase-flow/components/navigation/codebase-stage-rail.tsx` now supplies the codebase map rows as content, and `apps/web/features/codebase-flow/components/codebase-stage-page.tsx` hands both desktop and compact codebase navigation to `AppShell.localNav`.

Targeted Vitest validation for this slice is easiest from `apps/web` rather than the workspace root. The web app’s local test command resolves `@codebase-compiler` aliases correctly there, while the workspace-root invocation did not.

The desktop footer-rail demotion turned out to be simpler than expected. `AppShellFooterRail` only needed an `xl:hidden` guard because the new shell-local-nav slot now owns the desktop left-rail space. That kept mobile lesson navigation intact without adding a second conditional system.

Unlocked post-review lessons already have both layers of navigation at once. `apps/web/features/execute-ship/components/bonus-lesson-page.tsx` passes a workspace-style `primaryNav` into `AppShell` and still enables `showSkillRail`, which causes `apps/web/features/course/shared/components/app-shell/app-shell-footer-rail.tsx` to render the sticky bottom skill rail. This means the merged shell already separates macro navigation from local progression conceptually, but the local progression is still anchored to the footer instead of a desktop rail.

Review is already halfway to the target model. `apps/web/features/codebase-flow/components/codebase-review-page.tsx` switches between `primaryNav.kind === "codebase"` and `primaryNav.kind === "workspace"` based on unlock state. That makes review the natural place to prove the shared shell pattern rather than treating review as a one-off exception.

The repo’s real user-facing labels remain `Build Lessons` and `Launch Lessons` in `apps/web/features/workspace-navigation/lib/build-primary-nav-model.ts`. The plan therefore needs to treat `Build` and `Launch` as conceptual shorthand while keeping the current repo labels unless implementation explicitly includes a copy adjustment. There is no need to widen this slice into a naming rewrite.

The current footer skill rail does more than render a row of lesson pills. `apps/web/features/course/shared/components/skill-rail-shadcn.tsx` also owns cross-stage previous and next buttons, which means the footer-rail demotion needs to account for those movement affordances rather than hiding the footer blindly. If the desktop left rail fully replaces the desktop footer rail, the page or lesson shell still needs a clear answer for where that cross-stage movement lives.

The post-review lesson universe already has the grouping needed for section-scoped left codebase. `apps/web/features/execute-ship/lib/bonus-library-presentation.ts` maps `BUILD`, `SHIP`, `CEO`, and `DESIGN` blocks to user-facing concepts. That gives the plan an existing source of truth for `Build Lessons`, `Launch Lessons`, and grouped bonus references instead of requiring a new classification system.

The visual target should stay close to the current shadcn docs surfaces rather than turning into a custom dashboard shell. The official docs pages and component pages use sparse chrome, sentence-case labels, thin separators, small but readable typography, subtle active fills, muted text for inactive items, and top-right previous and next controls that feel like lightweight document navigation rather than a product wizard. The implementation should inherit that tone so the new shell feels native to shadcn/ui instead of merely using shadcn primitives underneath a louder custom treatment.

Milestone 1 proved that the shell contract can be introduced without touching codebase or post-review page implementations yet. The new `AppShellLocalNavRail` component sits at the shared shell boundary, and the contract remains page-agnostic until later milestones provide real codebase and lesson content.

The completed follow-on plan `docs/codex/2026-03-29-unify-codebase-and-bonus-navigation.md` solved the macro header unification, not the local navigation layer. This new plan should build on that result instead of re-opening it. The unresolved problem now is not route ownership. It is shell grammar: where local navigation lives, when the footer rail still matters, and how the codebase and post-review areas share the same structural rules.

## Decision Log

Decision — Reuse the current merged `AppShell` plus `primaryNav` architecture as the baseline rather than inventing a second shell system for left-rail work.
Rationale — The latest merge already centralized macro navigation in the header. The next step should extend that system with an explicit local-navigation layer, not re-litigate the header architecture.
Date — 2026-03-29.

Decision — Treat the header as macro navigation and the left rail as local navigation across both codebase and post-review surfaces.
Rationale — This is the clearest shared rule for buyers and the cleanest mental model for implementation. The header answers “which zone am I in,” while the left rail answers “where exactly am I inside this zone.”
Date — 2026-03-29.

Decision — Simplify codebase header navigation to stage-level movement only and remove step-dropdown responsibility from the desktop header.
Rationale — If the codebase left rail shows the full stage and step map on desktop, keeping step dropdowns in the header would duplicate the same local information and recreate the current confusion in a different place.
Date — 2026-03-29.

Decision — Show the full codebase map in the desktop left rail, including all codebase stages and all codebase steps, rather than collapsing to the current stage only.
Rationale — The total routed codebase step count is still manageable, and the approved direction explicitly favors “see all the things” over progressive disclosure for the codebase funnel.
Date — 2026-03-29.

Decision — Keep post-review desktop left codebase section-scoped instead of showing the entire post-review universe at once.
Rationale — Post-review contains more optional branches and browsing depth than the codebase flow. Showing only the current section’s local map keeps build, launch, and bonus navigation focused without overloading the rail.
Date — 2026-03-29.

Decision — Keep `Build Lessons` and `Launch Lessons` as the concrete user-facing labels in this slice, even though “Build” and “Launch” may be used as shorthand in planning discussions.
Rationale — Those are the current live labels in the repo and in the merged primary-nav model. Renaming them is a separate copy decision and not required to deliver the structural nav refactor.
Date — 2026-03-29.

Decision — Introduce an explicit local-navigation contract at the shell boundary instead of rendering every left rail page-locally with ad hoc layout.
Rationale — The approved direction is one shared shell pattern across codebase and post-review. A shell-level local-nav slot keeps that promise real and prevents the left rail from becoming duplicated page-specific layout code.
Date — 2026-03-29.

Decision — Demote the footer skill rail to mobile-only or compatibility-only behavior once desktop left codebase are in place.
Rationale — The footer rail is now redundant on desktop once the header owns macro navigation and the left rail owns local navigation. It still remains useful as a compact mobile fallback where a persistent left rail would be impractical.
Date — 2026-03-29.

Decision — The new shell should look and feel like a shadcn docs surface, not a bespoke dashboard.
Rationale — The approved reference is the current shadcn docs experience. That means low chrome, text-first hierarchy, small sentence-case nav labels, thin separators, restrained active states, and lightweight previous and next controls in the header area. The implementation should reuse shadcn/ui primitives where practical and avoid adding decorative cards, loud color treatments, or heavy chrome that would drift away from that reference.
Date — 2026-03-29.

Decision — Add top-right codebase pager controls that use the existing adjacency helper and the current leave-guard callbacks.
Rationale — The codebase route sequence and dirty-draft protection already exist. Reusing those contracts keeps the pager behavioral change low-risk and avoids route or save-flow rewrites.
Date — 2026-03-29.

Decision — Name the shell-local rail contract `localNav` and render it through a dedicated `AppShellLocalNavRail` slot component.
Rationale — The prop name is short, explicit, and keeps the shell boundary readable. A dedicated slot component preserves the shared layout grammar without forcing codebase or lesson content into the shell file itself.
Date — 2026-03-29.

Decision — Give unlocked review a light local rail rather than a completely custom shell.
Rationale — Review is the pivot between codebase and post-review. Keeping it inside the same header-plus-left-rail grammar will make the whole product feel more coherent and reduce the number of special cases in both code and user experience.
Date — 2026-03-29.

Decision — The new shell-level local-navigation contract should be a discriminated union instead of a generic config bag.
Rationale — The shell needs to support codebase, review, and post-review lesson variants, but the repo instructions explicitly discourage broad override bags. A discriminated union keeps the contract explicit and makes it obvious which pages are responsible for which local-nav behaviors.
Date — 2026-03-29.

Decision — Desktop left codebase should appear at the `xl` breakpoint, and the footer skill rail should remain the fallback below `xl` when local navigation is required.
Rationale — Codebase pages already move into a wider multi-column layout at `xl`, and a shared `xl` breakpoint avoids forcing a cramped three-column shell on smaller laptop widths. This also gives post-review pages a clear mobile and tablet fallback without needing separate breakpoint logic for each surface.
Date — 2026-03-29.

Decision — The compact fallback below `xl` is surface-specific rather than universal: codebase pages keep the step selector, while post-review lesson pages keep the footer skill rail unless implementation proves a better compact lesson fallback.
Rationale — Codebase flow already has a working mobile-local-navigation surface in `CodebaseStageStepStrip`, and the footer skill rail currently carries lesson progression behavior that codebase pages do not share. Forcing one identical compact fallback across both halves would create extra migration work without improving clarity.
Date — 2026-03-29.

Decision — Review’s light local rail should contain `Overview`, `Downloads`, and `Lesson Map` for the local page plus direct links to `Build Lessons` and `Launch Lessons` once the post-review header model is active.
Rationale — Review is both a document-like handoff page and the pivot into post-review learning. A mixed rail with local anchors plus next-step destinations keeps review in the shared shell without pretending it has a long lesson sequence.
Date — 2026-03-29.

Decision — Post-review section codebase should derive from the existing block model: `BUILD` for Build Lessons, `SHIP` for Launch Lessons, and grouped `CEO` plus `DESIGN` blocks for Bonus.
Rationale — The grouping already exists in `bonus-library-presentation.ts`, so the left rail can reuse known boundaries instead of inventing a second taxonomy.
Date — 2026-03-29.

Decision — Codebase pages get explicit top-right pager controls in this slice, but post-review desktop pages do not need a second shell-level pager yet.
Rationale — Codebase progression is a strict linear route sequence, and the repo already exposes an adjacency helper for it. Post-review lesson movement is already represented in lesson-level progression and the current skill rail, so the left-rail migration can happen without also inventing a new global pager for lessons.
Date — 2026-03-29.

Decision — Let `AppShellLocalNavRail` own the actual nav/aside landmark chrome for codebase local navigation, and keep `CodebaseStageRail` as content-only codebase map rows.
Rationale — The shell already has the correct landmark, padding, and breakpoint handling. Making the codebase component content-only avoids nested navigation landmarks and keeps codebase-specific code focused on the map data itself.
Date — 2026-03-29.

## Outcomes & Retrospective

This work is complete. Codebase pages, unlocked review, and unlocked post-review lesson pages now all use the same desktop shell grammar: macro navigation stays in the header, local navigation is supplied through the shell-level `localNav` slot, and contextual support stays outside the primary navigation lane. Codebase desktop pages now show the full codebase map in a shell-owned left rail, use top-right pager controls for the linear codebase sequence, and preserve the existing dirty-draft protection. Unlocked review now exposes a light local rail with anchored review sections and direct next-step destinations, and unlocked post-review lessons now render section-scoped local codebase instead of relying on the footer skill rail as the primary desktop navigator.

The footer skill rail is now a compact fallback only. Desktop lesson pages no longer show both a full left rail and a full footer progression rail at the same time because `AppShellFooterRail` is hidden from `xl` upward. The current repo labels `Build Lessons` and `Launch Lessons` stayed intact, which kept the slice focused on structure rather than copy. The main lesson from implementation is that the merged shell architecture was already strong enough; the missing piece was a disciplined shell-local-nav boundary and test coverage that matched the new header-plus-left-rail grammar.

The most likely follow-up is visual polish, not another structural rewrite. If the header labels should be shortened later or if the shell-local-nav contract should be generalized to other app surfaces, that should happen as a separate plan after this behavior has had some runtime soak time.

## Context and Orientation

The shared shell now starts in `apps/web/features/course/shared/components/app-shell.tsx`. That component is the layout root for codebase pages, review, and post-review lesson pages. It currently owns the header and, when `showSkillRail` is enabled, a sticky bottom `AppShellFooterRail`. `apps/web/features/course/shared/components/app-shell/app-shell-header.tsx` renders the product brand, the explicit `primaryNav`, and header trailing controls. `apps/web/features/course/shared/components/app-shell/app-shell-primary-nav.tsx` chooses between codebase and workspace header navigation. `apps/web/features/course/shared/components/app-shell/app-shell-local-nav.tsx` is the new shared left-rail slot that makes the local-navigation contract explicit without coupling it to codebase or lesson content yet.

The codebase half of the system lives in `apps/web/features/codebase-flow/`. `apps/web/features/codebase-flow/components/codebase-stage-page.tsx` renders codebase steps. It now passes `primaryNav.kind = "codebase"` plus `localNav.kind = "codebase"` into `AppShell`, with the shell local-nav slot carrying the full codebase map on desktop and the compact step selector on mobile. `apps/web/features/codebase-flow/components/codebase-stage-nav.tsx` is now stage-level only, and `apps/web/features/codebase-flow/lib/codebase-stage-nav-model.ts` still builds the codebase header stage data. `apps/web/features/codebase-flow/lib/codebase-stage-routes.ts` is the authoritative source for codebase step hrefs and global codebase adjacency. `apps/web/features/codebase-flow/hooks/use-codebase-stage-leave-guard.ts` and `apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts` already own dirty-draft navigation behavior, including save-and-continue and back behavior.

The codebase route contract must not change. `packages/codebase-compiler/src/stages/stage-definitions.ts` still defines `start`, `product`, `design`, `marketing`, `build-plan`, and `review`. The routed step pages remain `/product/[stepId]`, `/design/[stepId]`, `/marketing/[stepId]`, and `/build-plan/[stepId]`. Stage entry redirects still flow through `apps/web/features/codebase-flow/server/codebase-stage-route-data.ts`, and the new left rail must build on that rather than introduce new codebase routes.

The post-review half of the system now uses explicit workspace header and local navigation. `apps/web/features/workspace-navigation/lib/build-primary-nav-model.ts` builds the current `Review | Build Lessons | Launch Lessons | Bonus` macro-nav items. `apps/web/features/workspace-navigation/lib/build-secondary-nav-model.ts` now builds the review-local and lesson-local rail sections. `apps/web/features/workspace-navigation/components/workspace-local-nav-rail.tsx` renders those section models. `apps/web/features/codebase-flow/components/codebase-review-page.tsx` switches between codebase and workspace header models depending on unlock state and now passes a `localNav.kind = "review"` slot when unlocked. `apps/web/features/execute-ship/components/bonus-lesson-page.tsx` renders unlocked lesson pages using the workspace-style header and now passes a `localNav.kind = "workspace"` slot that reflects the current lesson section.

The footer skill rail is still driven by mission-shaped lesson progression data. `apps/web/features/course/shared/components/app-shell/app-shell-footer-rail.tsx` renders `SkillRailShadcn`, and `AppShell` still expects `mission`, `currentLessonId`, and `showSkillRail` when that footer should appear. This means the left-rail migration is not only a visual change. It also needs a clear answer for how the current footer-rail inputs are preserved or translated when the desktop local navigator moves to the left side.

`apps/web/features/course/shared/components/skill-rail-shadcn.tsx` currently owns local lesson pills plus previous and next lesson navigation, including cross-stage movement when the current lesson sits at a block boundary. That behavior should be treated as a contract to migrate or intentionally leave in the footer on smaller screens, not as incidental chrome.

The prior completed plan `docs/codex/2026-03-29-unify-codebase-and-bonus-navigation.md` already unified route semantics and header macro navigation. That plan is now historical context and must not be edited as part of this slice. This new plan is the follow-on that brings local navigation into alignment with the merged header architecture.

The likely feature layout after implementation is:

    Before
      apps/web/features/course/shared/components/app-shell.tsx
      apps/web/features/course/shared/components/app-shell/app-shell-primary-nav.tsx
      apps/web/features/course/shared/components/app-shell/app-shell-footer-rail.tsx
      apps/web/features/codebase-flow/components/codebase-stage-nav.tsx
      apps/web/features/codebase-flow/components/progression/codebase-stage-step-strip.tsx
      apps/web/features/execute-ship/components/bonus-lesson-page.tsx

    After
      apps/web/features/course/shared/components/app-shell.tsx
      apps/web/features/course/shared/components/app-shell/app-shell-primary-nav.tsx
      apps/web/features/course/shared/components/app-shell/app-shell-local-nav.tsx
      apps/web/features/course/shared/components/app-shell/app-shell-footer-rail.tsx
      apps/web/features/codebase-flow/components/navigation/codebase-stage-rail.tsx
      apps/web/features/codebase-flow/components/navigation/codebase-stage-pager.tsx
      apps/web/features/codebase-flow/lib/codebase-stage-rail-model.ts
      apps/web/features/workspace-navigation/components/workspace-local-nav-rail.tsx
      apps/web/features/workspace-navigation/lib/build-secondary-nav-model.ts

Use that structure as guidance, not a rigid mandate. The important outcome is one explicit shell contract for local desktop navigation plus a clear mobile fallback path.

## Plan of Work

Start by freezing the shell contract instead of jumping straight into codebase markup. The current merged `primaryNav` system already owns macro navigation, so the next step is to introduce a second explicit layer for local navigation. That likely means adding a `secondaryNav` or equivalently precise prop to `AppShell`, teaching the shell to reserve a desktop left-rail slot, and deciding how the existing footer skill rail behaves when that slot is present. This contract needs to be solved before codebase and post-review pages diverge into separate implementations.

The shell-level local-nav contract should be resolved concretely in this plan instead of left as an implementer choice. The recommended shape is a discriminated union with at least three variants: a codebase variant for the full codebase map plus optional pager metadata, a review variant for a light mixed rail of local anchors and next-step destinations, and a workspace-lessons variant for section-scoped lesson lists. The shell should render that contract only at `xl`. Below `xl`, compact local fallback remains surface-specific: codebase pages keep the existing step selector, while post-review lesson surfaces keep the footer skill rail until or unless implementation intentionally replaces it with something equally compact.

Once the shell contract is explicit, implement the codebase side first because its scope is smaller and its data model is already linear and complete. Codebase pages should simplify the header to stage-level macro links, build a new full-map left rail from the current codebase stage plus step model, add a top-right pager that reuses the existing adjacency and leave-guard contracts, and reduce the right side to contextual support rather than navigation. Codebase mobile behavior should remain compact through the existing step selector or a slightly refactored version of it.

After the codebase shell proves out, move the same grammar into unlocked review and post-review lessons. Review should gain a light left rail that keeps it inside the same shell without pretending to have the full lesson universe as a local sequence. Build lesson pages should show the build sequence in the left rail. Launch lesson pages should show the launch sequence. Bonus pages should show grouped local navigation for Product and Design references. This work should reuse the merged workspace macro-nav model rather than reimplementing macro state in the left rail.

Finish by demoting the footer skill rail from primary desktop navigation to mobile fallback behavior, then validate codebase and post-review surfaces together. The final result should prove one coherent shell rule on desktop and a clear fallback rule on mobile, with tests that cover codebase page navigation, review unlock behavior, lesson navigation, and footer-rail migration risks.

## Milestones

### Milestone 1 — Freeze the shared shell contract for macro and local navigation

At the end of this milestone, the repository has an explicit shell-level contract for local desktop navigation that sits beside the existing `primaryNav` contract. A novice should be able to open the shell files and understand how macro navigation, local desktop navigation, and compact fallback behavior fit together without reading codebase-specific or lesson-specific page code first.

This milestone should touch `apps/web/features/course/shared/components/app-shell.tsx`, `apps/web/features/course/shared/components/app-shell/app-shell-props.ts`, `apps/web/features/course/shared/components/app-shell/app-shell-header.tsx`, the footer-rail boundary, and any new shared shell-local component used to render a left rail. Success looks like a clear prop contract, a desktop left-rail slot in the shell, and a documented rule for which surfaces keep the footer skill rail or another compact fallback below `xl`.

Run focused validation from the repository root:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bunx vitest run apps/web/tests/unit/product-shell.test.tsx apps/web/tests/unit/app-workspace-lesson-page.test.tsx

Success looks like the shell contract staying explicit, existing header tests still passing, and any new shell-local tests proving that desktop and mobile navigation layers do not fight each other.

### Milestone 2 — Convert codebase desktop navigation into header plus left rail plus pager

At the end of this milestone, codebase desktop pages no longer depend on header step dropdowns as their primary local navigator. The header becomes stage-level only. A new codebase left rail shows the full codebase map with stage labels, step rows, active state, completion checks, and locked styling. Codebase pages gain top-right previous and next controls that move through the full codebase sequence while still honoring the current dirty-draft leave guard.

This milestone should touch `apps/web/features/codebase-flow/components/codebase-stage-page.tsx`, `apps/web/features/codebase-flow/components/codebase-stage-nav.tsx` or its renamed replacement, `apps/web/features/codebase-flow/components/progression/codebase-stage-step-strip.tsx`, `apps/web/features/codebase-flow/components/codebase-stage-sidebar.tsx`, `apps/web/features/codebase-flow/lib/codebase-stage-nav-model.ts`, a new codebase left-rail model file, and the codebase page tests. Success looks like `/product/*`, `/design/*`, `/marketing/*`, and `/build-plan/*` following the shared shell grammar while the route contract remains unchanged.

Run focused validation from the repository root:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bunx vitest run apps/web/tests/integration-ui/codebase-stage-page.test.tsx apps/web/tests/integration-ui/codebase-stage-navigation.test.tsx apps/web/tests/unit/codebase-stage-routes.test.ts

Success looks like the codebase page tests proving mobile fallback behavior, desktop left-rail behavior, and leave-guard-safe pager movement.

### Milestone 3 — Bring review and post-review lesson pages onto the same desktop shell pattern

At the end of this milestone, unlocked review and post-review lesson pages use the same macro-plus-local shell grammar as codebase pages. Review keeps the shared header and gains a light local rail. Build lesson pages show the build sequence in the left rail. Launch lesson pages show the launch sequence. Bonus uses grouped local navigation for Product and Design references or lessons. The left rail should reflect the current section only instead of showing every post-review destination at once.

This milestone should touch `apps/web/features/codebase-flow/components/codebase-review-page.tsx`, `apps/web/features/workspace-navigation/lib/build-primary-nav-model.ts`, a new or updated secondary-nav model under `apps/web/features/workspace-navigation/`, `apps/web/features/execute-ship/components/bonus-lesson-page.tsx`, `apps/web/features/execute-ship/components/lesson-map-surface.tsx`, and any new post-review left-rail components. Success looks like post-review desktop surfaces no longer depending on the footer skill rail as their main local navigator.

Run focused validation from the repository root:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bunx vitest run apps/web/tests/integration-ui/codebase-review-page.test.tsx apps/web/tests/unit/app-workspace-lesson-page.test.tsx apps/web/tests/unit/post-review-destination.test.ts apps/web/tests/unit/build-primary-nav-model.test.ts

Success looks like unlocked review and lesson pages still using the correct macro header while the local map moves into the left rail.

### Milestone 4 — Demote the footer skill rail and prove the mobile fallback behavior

At the end of this milestone, the footer skill rail is no longer the primary desktop local navigator. It is either hidden on desktop when a local left rail is present or otherwise clearly downgraded to compatibility behavior, while still providing compact movement on mobile when the desktop left rail is absent. Codebase mobile pages still use the compact step selector. Post-review mobile pages still have a sane local fallback.

This milestone should touch `apps/web/features/course/shared/components/app-shell/app-shell-footer-rail.tsx`, any shell-level breakpoint or visibility logic, and the affected lesson tests. Success looks like desktop screens no longer showing both a full left rail and a full bottom progression rail at the same time, while mobile retains usable navigation.

Run focused validation from the repository root:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bunx vitest run apps/web/tests/unit/product-shell.test.tsx apps/web/tests/unit/app-workspace-lesson-page.test.tsx apps/web/tests/unit/bonus-lesson-page.test.tsx

Success looks like footer-rail expectations updated to the new breakpoint rules and no regression in mobile-friendly navigation behavior.

### Milestone 5 — Validate the full shell, document outcomes, and leave a recoverable migration path

At the end of this milestone, codebase pages, review, and post-review lessons all demonstrate the same desktop navigation grammar. The plan is updated with final results, validation transcripts, and any discovered follow-up cleanup work. Recovery instructions clearly explain how to revert to the header-only plus footer-rail model if the new left-rail shell needs to be backed out.

This milestone should touch the plan file itself, any user-facing docs that explain the workspace shell, and the most relevant browser or build checks. Success looks like a build-ready plan execution path with no hidden architecture gaps.

Run broader validation from the repository root:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run build
    $ bun run test:integration:ui

If browser-smoke coverage is updated as part of the slice, also run:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run test:browser-smoke

Success looks like the app building cleanly and the focused integration-ui coverage proving the new shell across codebase and post-review surfaces.

## Concrete Steps

1. Freeze the shell contract before editing codebase or lesson pages.

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Inspect and edit these files first:
        apps/web/features/course/shared/components/app-shell.tsx
        apps/web/features/course/shared/components/app-shell/app-shell-props.ts
        apps/web/features/course/shared/components/app-shell/app-shell-header.tsx
        apps/web/features/course/shared/components/app-shell/app-shell-primary-nav.tsx
        apps/web/features/course/shared/components/app-shell/app-shell-footer-rail.tsx

    Rules to encode:
        - macro nav remains in the header
        - local desktop nav gets an explicit shell-level discriminated-union contract
        - local desktop nav renders from `xl` upward
        - compact fallback below `xl` stays explicit and surface-specific
        - codebase keeps the step selector below `xl`
        - post-review lessons keep the footer rail below `xl` unless the implementation intentionally replaces it
        - mobile fallback behavior stays explicit and safe
        - desktop visual treatment should stay close to the current shadcn docs surfaces: sparse chrome, thin borders or separators, sentence-case labels, subtle active backgrounds, and lightweight top-right previous or next controls

    Expected observation:
        Page components can pass both macro navigation and local navigation into the shell without re-implementing left-rail layout page by page.

    Files now carrying the shell-level contract:
        apps/web/features/course/shared/components/app-shell.tsx
        apps/web/features/course/shared/components/app-shell/app-shell-props.ts
        apps/web/features/course/shared/components/app-shell/app-shell-local-nav.tsx

2. Rebuild codebase local navigation on top of the new shell contract.

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Inspect and edit these files:
        apps/web/features/codebase-flow/components/codebase-stage-page.tsx
        apps/web/features/codebase-flow/components/codebase-stage-nav.tsx
        apps/web/features/codebase-flow/components/progression/codebase-stage-step-strip.tsx
        apps/web/features/codebase-flow/components/codebase-stage-sidebar.tsx
        apps/web/features/codebase-flow/lib/codebase-stage-nav-model.ts
        apps/web/features/codebase-flow/lib/codebase-stage-routes.ts
        apps/web/features/codebase-flow/hooks/use-codebase-stage-leave-guard.ts
        apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts

    Implement these outcomes:
        - codebase header is stage-level only
        - codebase left rail shows the full codebase map
        - codebase pager reuses existing adjacency and leave-guard logic
        - right side is context, not primary navigation
        - mobile keeps a compact selector or equivalent fallback below `xl`

    Expected observation:
        On desktop, codebase users can see all codebase stages and steps at once while still moving linearly with arrows and preserving dirty-draft protection.
        The desktop rail content is supplied through `AppShell.localNav.desktop`, while the compact step selector is supplied through `AppShell.localNav.compact`.

3. Move post-review local navigation into a left rail.

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Inspect and edit these files:
        apps/web/features/codebase-flow/components/codebase-review-page.tsx
        apps/web/features/workspace-navigation/lib/build-primary-nav-model.ts
        apps/web/features/execute-ship/components/bonus-lesson-page.tsx
        apps/web/features/execute-ship/components/lesson-map-surface.tsx
        apps/web/features/execute-ship/lib/bonus-library-presentation.ts
        apps/web/features/course/shared/components/app-shell/app-shell-footer-rail.tsx

    Implement these outcomes:
        - review has a light local rail with `Overview`, `Downloads`, `Lesson Map`, `Build Lessons`, and `Launch Lessons` once unlocked
        - build lessons have a build-sequence rail sourced from the `BUILD` block
        - launch lessons have a launch-sequence rail sourced from the `SHIP` block
        - bonus has grouped local rail sections sourced from `CEO` and `DESIGN`
        - footer skill rail is no longer the primary desktop map

    Expected observation:
        Unlocked lesson pages still use the shared header macro nav, but the local lesson map now lives on the left side on desktop.

4. Update tests and validation around the new navigation grammar.

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Prioritize these tests:
        apps/web/tests/integration-ui/codebase-stage-page.test.tsx
        apps/web/tests/integration-ui/codebase-stage-navigation.test.tsx
        apps/web/tests/integration-ui/codebase-review-page.test.tsx
        apps/web/tests/unit/app-workspace-lesson-page.test.tsx
        apps/web/tests/unit/build-primary-nav-model.test.ts
        apps/web/tests/unit/post-review-destination.test.ts
        apps/web/tests/unit/product-shell.test.tsx

    Expected observation:
        Tests prove the new shell contract, the codebase desktop rail, the post-review desktop rail, the mobile fallback behavior, and the preserved route plus leave-guard behavior.

5. Run final verification and document outcomes back into this plan.

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Run:
        bun run build
        bun run test:integration:ui
        bun run test:browser-smoke

    Expected observation:
        The app still builds, codebase and post-review flows have focused coverage, and any browser-smoke updates are captured here if the shell changed visible navigation in buyer-facing routes.

    Codebase slice evidence captured on 2026-03-29:

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday/apps/web

    Command:
        bunx vitest run tests/integration-ui/codebase-stage-navigation.test.tsx tests/integration-ui/codebase-stage-page.test.tsx tests/unit/codebase-stage-routes.test.ts

    Result:
        Test Files  3 passed (3)
        Tests      20 passed (20)

    Post-review slice evidence captured on 2026-03-29:

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday/apps/web

    Command:
        bunx vitest run tests/integration-ui/codebase-review-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/build-primary-nav-model.test.ts tests/unit/post-review-destination.test.ts tests/unit/bonus-lesson-page.test.tsx tests/unit/product-shell.test.tsx

    Result:
        Test Files  6 passed (6)
        Tests      18 passed (18)

    Final validation evidence captured on 2026-03-29:

    Working directory:
        /Users/parkerrex/Projects/ship-by-sunday

    Commands:
        bun run --cwd apps/web test:integration:ui
        bun run build
        bun run test:browser-smoke

    Result:
        integration-ui: 18 files passed, 69 tests passed
        build: completed successfully with Next.js production output
        browser-smoke: 7 tests passed

    Broader verification completed on 2026-03-30:

        lint: 0 warnings, 0 errors across the full app
        format: all matched files correctly formatted across the full app
        unit: 102 files passed, 369 tests passed
        contracts: 1 file passed, 4 tests passed
        integration node: 7 files passed, 47 tests passed

## Validation and Acceptance

Acceptance is behavior-first.

The first acceptance criterion is that codebase desktop pages now follow the same shell grammar as post-review surfaces. A desktop codebase page must show a macro header, a persistent left rail with the full codebase map, a main work pane, and only contextual support on the right if the right pane remains. The header must no longer act as the main step navigator.

The second acceptance criterion is that codebase route semantics do not change. Entering `/product`, `/design`, `/marketing`, or `/build-plan` must still redirect into the correct step page, the desktop left rail must route into the existing step URLs, and the top-right previous and next controls must follow the current codebase sequence rather than inventing a new order.

The third acceptance criterion is that codebase dirty-draft protection still works. Leaving a codebase page from the left rail, the header, or the codebase pager must still route through the current unsaved-change guard instead of silently dropping unsaved edits.

The fourth acceptance criterion is that unlocked review and post-review lessons now use a left rail for local desktop navigation. On desktop, unlocked lesson pages must no longer rely on the bottom skill rail as the primary local map. The header must continue to own macro navigation with the current repo’s concrete labels, and the left rail must own local lesson selection.

The fifth acceptance criterion is that the footer skill rail is clearly demoted. On desktop, it must no longer duplicate the left rail’s responsibility. On mobile, it may remain visible if that is the chosen fallback path, but the breakpoint and ownership rules must be explicit in code and tests.

The sixth acceptance criterion is that review fits the shared shell. Review must not remain a special shell that breaks the shared grammar. It may have a lighter local rail than codebase or lessons, but it should still look and behave like the same family of product surfaces.

The seventh acceptance criterion is that tests prove the behavior. Codebase tests must cover the left rail and pager behavior. Post-review tests must cover the left rail replacing the footer rail as the primary desktop map. Shell tests must prove the new macro plus local contract instead of assuming header-only or footer-only navigation.

The eighth acceptance criterion is that the visual execution stays recognizably aligned with shadcn docs. The finished shell should read as text-first and low-chrome, with restrained active states, minimal card treatment, and clear but quiet separators. It should not feel like a different design system wrapped around shadcn components.

The ninth acceptance criterion is that the shell contract itself is reusable. The shared shell must expose a typed local-nav slot with a discriminant and desktop or compact content, and the contract must be present in the code even before codebase and post-review pages start consuming it.

## Idempotence and Recovery

This slice is safe to implement incrementally because it is a shell plus UI-structure refactor layered on top of already centralized route semantics. No schema migration or backend state migration is required. Re-running the focused tests or build commands should not mutate data.

If the shell-level local-navigation contract becomes too broad, recover by keeping the prop precise and discriminated instead of falling back to an untyped config bag. The recovery target is an explicit shell slot with codebase and workspace variants, not a generic “misc sidebar” prop that hides behavior in loosely typed objects.

If codebase left-rail work succeeds before post-review left-rail work is complete, keep the footer skill rail active on lesson pages until the post-review local rail is implemented. The milestones are intentionally ordered so codebase can prove the shell grammar without forcing a single giant cutover.

If the footer-rail demotion creates mobile regressions, restore the footer rail on the affected mobile surfaces first and keep the desktop left rail in place. The most important invariant is that mobile remains navigable; the desktop demotion can be rolled back more selectively than the overall shell contract.

If review turns out to need less local structure than expected, keep it inside the shared shell with a light local rail rather than introducing a new page-specific shell. The recovery target is reduced local density, not a special-case shell path.

If broader validation fails because of unrelated work outside this slice, record the exact blocker in `Surprises & Discoveries` and `Progress` before deciding whether to continue. Do not silently widen the work into unrelated repair tasks.

## Artifacts and Notes

Important current-repo evidence:

    Shared shell macro nav already exists:
    apps/web/features/course/shared/components/app-shell.tsx
    apps/web/features/course/shared/components/app-shell/app-shell-primary-nav.tsx

    Codebase page already uses shared header nav:
    apps/web/features/codebase-flow/components/codebase-stage-page.tsx
      primaryNav={{ kind: "codebase", ... }}

    Codebase local navigation now lives in the shell slot:
      - stage-level header links in codebase-stage-nav.tsx
      - desktop codebase map rows in navigation/codebase-stage-rail.tsx
      - mobile selector in progression/codebase-stage-step-strip.tsx
      - right-side progress/context in codebase-stage-sidebar.tsx

    Post-review lesson pages already have both macro and footer local nav:
    apps/web/features/execute-ship/components/bonus-lesson-page.tsx
      showSkillRail
      primaryNav={{ kind: "workspace", ... }}

    Review already switches macro models by unlock state:
    apps/web/features/codebase-flow/components/codebase-review-page.tsx

    Current concrete workspace header labels:
      Review
      Build Lessons
      Launch Lessons
      Bonus

    Visual reference surfaces checked on 2026-03-29:
      https://ui.shadcn.com/docs/components/radix/checkbox
      https://ui.shadcn.com/docs/components/sidebar
      https://ui.shadcn.com/docs/components/radix/navigation-menu

    Characteristics to preserve from those shadcn docs surfaces:
      - text-first navigation with sentence-case labels
      - subtle active-state fills and muted inactive text
      - thin separators instead of heavy cards or thick outlines
      - airy spacing without promotional chrome
      - lightweight top-right previous and next controls

Implemented end-state summary:

    Desktop codebase:
      header macro nav
      full codebase left rail
      main work pane
      contextual right pane

    Desktop post-review:
      header macro nav
      section-scoped left rail
      main lesson or review pane
      footer rail hidden at `xl` and no longer primary

    Mobile:
      codebase keeps the compact step selector
      post-review lessons keep the footer rail unless replaced intentionally
      compact fallback stays only where it still adds value

## Interfaces and Dependencies

The shell contract remains explicit and discriminated. `apps/web/features/course/shared/components/app-shell/app-shell-props.ts` now defines the shared `AppShellLocalNav` union, and `apps/web/features/course/shared/components/app-shell/app-shell-local-nav.tsx` renders the shell-owned local-nav landmark and breakpoint behavior. Avoid reintroducing optional config bags with loosely related booleans.

The implemented `localNav` contract is:

    kind: "codebase"
      - desktop codebase rail content
      - optional compact codebase fallback content
    kind: "review"
      - desktop review rail content
      - optional compact review fallback content

    kind: "workspace"
      - desktop lesson rail content
      - optional compact lesson fallback content

`apps/web/features/codebase-flow/lib/codebase-stage-routes.ts` remains the source of truth for codebase step hrefs, stage entry behavior, and global codebase adjacency. Codebase pager controls and codebase left-rail links must depend on those helpers rather than duplicating route sequencing.

`apps/web/features/codebase-flow/hooks/use-codebase-stage-leave-guard.ts` and `apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts` remain the codebase behavior contracts for dirty navigation, back behavior, and save-and-continue flow. The new codebase pager and codebase left rail must route through those existing pathways.

`apps/web/features/workspace-navigation/lib/build-primary-nav-model.ts` remains the source of truth for post-review macro header items. `apps/web/features/workspace-navigation/lib/build-secondary-nav-model.ts` is now the source of truth for review-local and lesson-local section codebase, so macro and local workspace navigation stay in the same feature boundary.

`apps/web/features/course/shared/components/app-shell/app-shell-footer-rail.tsx` remains the current footer local-nav boundary for lesson surfaces. This slice should narrow it to below-`xl` use or otherwise make its desktop behavior conditional on the new shell-level local-navigation contract. It should not continue to be the undisputed desktop progression owner once left codebase exist, and it should not be imposed on codebase pages that already have a different compact fallback.

`apps/web/features/execute-ship/components/bonus-lesson-page.tsx`, `apps/web/features/codebase-flow/components/codebase-review-page.tsx`, and `apps/web/features/codebase-flow/components/codebase-stage-page.tsx` are the primary call sites that will prove whether the shared shell contract is actually reusable. If the new shell contract only works for one of these surfaces, the slice is not done.
