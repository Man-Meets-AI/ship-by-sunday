---
summary: "Refactor codebase workspace form state so codebase steps save to Convex only on explicit Continue, keep validation tied to Continue, and remove timer-driven autosave plus DOM-driven draft reconstruction. Track the lesson workbench invalid-field system and starter repo form as adjacent follow-on audits, not silent scope creep."
read_when: "Open this when simplifying protected workspace form state around Convex truth and you need the exact repo paths, milestones, commands, and follow-on boundaries."
plan_status: "done"
---

# Replace Codebase Timer Churn With Convex-First Step State

This is a living execution plan. Update it as work progresses, discoveries land, or scope changes so a new coding agent can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

People filling out the protected workspace should be able to type, pause, and tab between fields without the page acting like a validator just because an idle timer fired. Today the codebase step flow mixes uncontrolled inputs, DOM reads, a debounce autosave hook, optimistic query mutation, and validation visibility in one client-side state machine. After this change, Product, Design, Marketing, and Build Plan codebase pages will use one current-step draft in React state, Convex will remain the saved source of truth, and pressing `Continue` will be the only moment that both persists the current step and reveals missing required fields. A user should be able to move through `Foundation`, `Problem`, `Outcome`, `Scope`, and the rest of the codebase pages without red field errors appearing until they explicitly ask to move on.

This plan intentionally does not widen into every form in the application. The repo-wide audit found one live defect cluster in codebase-flow, plus two adjacent form systems that deserve follow-on attention once the codebase fix is stable: the lesson workbench invalid-field pipeline and the starter repo access form. Those are tracked here so the next agent does not have to rediscover them, but they are not part of the first implementation slice.

## Progress

- [x] 2026-03-27 16:13 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, `docs/prompts/execplan-writer.md`, and `apps/web/convex/_generated/ai/guidelines.md`.
- [x] 2026-03-27 16:13 EDT — Audited the protected codebase workspace and confirmed that Product, Design, Marketing, and Build Plan step pages all share the same state stack through `apps/web/features/codebase-flow/components/codebase-stage-page.tsx`.
- [x] 2026-03-27 16:13 EDT — Audited Convex guidance and the current codebase mutation/query seams. Confirmed that the backend architecture is already correct and the client form seam is the problem.
- [x] 2026-03-27 16:20 EDT — Audited adjacent systems and classified them as follow-on scope rather than first-slice scope: `apps/web/features/course/lesson/hooks/use-lesson-completion.ts` and the lesson workbench tree, plus `apps/web/features/starter-repo/components/starter-repo-access-form.tsx`.
- [x] 2026-03-27 16:24 EDT — Chose the first-slice product contract: remove codebase autosave entirely. Codebase steps will persist only on explicit `Continue`; partial steps will save partial data and reveal missing required fields only at that moment.
- [x] 2026-03-27 16:41 EDT — Completed the grill pass and resolved the remaining product and architecture decisions: unsaved codebase edits must warn on all codebase exits, in-app exits use shadcn `AlertDialog`, browser tab close or reload uses native `beforeunload`, the dialog actions are `Stay` and `Leave without saving`, and dirty local drafts must win over live Convex query updates until the draft is clean again.
- [x] 2026-03-27 16:46 EDT — Finished the final grill pass and locked the browser history fallback for Milestone 1: codebase links and buttons use the custom `AlertDialog`, while browser back or forward may use native browser confirmation in the first slice if a fully custom history-interception path would add brittle complexity.
- [x] 2026-03-27 19:16 EDT — Replaced the codebase step controller with a controlled current-step draft, preserved live Convex truth as the saved baseline, removed codebase autosave and DOM draft reconstruction, and wired codebase exits through the codebase-scoped leave guard plus `beforeunload` fallback.
- [x] 2026-03-27 19:16 EDT — Rebased the codebase unit and integration-ui coverage around Continue-only persistence. `bun run test:unit tests/unit/use-codebase-stage-step-state.test.tsx`, `bun run test:unit tests/unit/codebase-step-save-feedback.test.ts`, and `bun run test:integration:ui tests/integration-ui/codebase-stage-page.test.tsx` all passed.
- [x] 2026-03-27 20:56 EDT — Ran the broader codebase integration-ui proof set from the `default_ship` pack: `codebase-start-page`, `codebase-stage-page`, `codebase-review-page`, and `codebase-stage-sidebar` all passed together.
- [x] 2026-03-27 20:56 EDT — Repaired QA control-plane drift caused by the removed autosave helper path. `qa/test-inventory.csv` now inventories `codebase-problem-severity-field.test.tsx`, no longer expects `use-autosave.test.tsx`, and `bun run qa:validate` passes again.
- [x] 2026-03-27 21:00 EDT — Closed Milestone 3 with the local-auth browser lane. `bun run qa:personas:prepare -- --pack=default_ship` succeeded for all three personas, and `PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:local-auth:default-ship` passed all five `@default_ship` browser scenarios on local dev.
- [x] 2026-03-27 19:16 EDT — Captured the follow-on shape for the lesson workbench invalid-field system and the starter repo access form in this plan so the next slice can start from evidence instead of a fresh audit.

## Surprises & Discoveries

The first surprise is that the live defect is much narrower than “every form.” The active timer-driven validation problem is centralized in the codebase-flow stack. `apps/web/features/shared/hooks/use-autosave.ts` is only imported by `apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts`, which means a single architectural rewrite can fix every codebase step page at once. That is a much smaller and safer slice than a repo-wide form rewrite.

The second surprise is that the broader lesson/workbench form system is not the same defect class. `apps/web/features/course/lesson/hooks/use-lesson-completion.ts` computes `invalidFieldIds` and `invalidFieldMessages` from explicit completion issues and then fans those through a large workbench component tree. That system still has client-side architecture debt, but it is not using the codebase autosave helper and it does not appear to be showing the same timer-driven validation churn. It needs a separate spike.

The third surprise is that the current working tree already contains exploratory local changes in `apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts`, `apps/web/tests/unit/use-codebase-stage-step-state.test.tsx`, `apps/web/features/course/shared/components/app-shell/app-shell-header-trailing.tsx`, and `apps/web/tests/unit/product-shell.test.tsx`. Those edits must be treated as a spike, not as settled implementation truth, because they partially suppress the current symptom without delivering the full Convex-first rewrite described here.

The fourth surprise is that there is no existing unsaved-change guard pattern anywhere in `apps/web`. The repo already has a shared `AlertDialog` wrapper in `apps/web/components/ui/alert-dialog.tsx`, but no reusable navigation-warning helper. The first implementation therefore needs to introduce a codebase-scoped leave guard deliberately rather than trying to reuse a nonexistent pattern.

The fifth surprise during implementation is that the page-level spike had already moved the active codebase route through `apps/web/features/codebase-flow/components/codebase-stage-page.tsx` with direct hook wiring, while the older `CodebaseStageStepController` path was effectively dead code. Finishing the page-level seam was less risky than reintroducing a second controller layer.

The sixth surprise is that browser QA could not be completed anonymously in this environment. The protected codebase routes redirect to the Clerk dev sign-in host immediately for an unauthenticated browser session, so the local-auth pack was required to close Milestone 3 instead of a casual manual browser visit.

The seventh surprise is that the QA control plane still expected the historical autosave helper test after the autosave helper itself had left the working tree. Fixing `qa/test-inventory.csv` was required before `bun run qa:validate` could produce a trustworthy release-confidence answer.

Evidence captured during audit:

  `rg -n "useAutosave|document.getElementById|withOptimisticUpdate" apps/web/features apps/web/tests -g '!**/node_modules/**'`

  Expected high-signal result:

    apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts
    apps/web/tests/unit/use-codebase-stage-step-state.test.tsx

  `rg -n "useLessonCompletion|invalidFieldIds|invalidFieldMessages" apps/web/features/course/lesson -g '!**/node_modules/**'`

  Expected high-signal result:

    apps/web/features/course/lesson/hooks/use-lesson-completion.ts
    apps/web/features/course/lesson/workbench/**/*

## Decision Log

2026-03-27 — Decision: Scope the first implementation slice to codebase-flow only. Rationale: the codebase-flow defect is centralized, user-visible, and shared by every codebase step. The lesson workbench is broader architecture debt and would turn a focused bug fix into a second project.

2026-03-27 — Decision: Remove codebase autosave entirely instead of keeping a silent debounce timer. Rationale: the user complaint is specifically about timer-driven weirdness, and Convex does not require the client to maintain a second save-oriented state machine during typing. Saving on explicit `Continue` is the smallest correct model.

2026-03-27 — Decision: Keep partial-save semantics, but move them behind `Continue`. Rationale: a user who clicks `Continue` with some fields filled should still persist those answers to Convex and see which required fields remain. Typing alone should do neither.

2026-03-27 — Decision: Preserve the existing Convex mutation and query interfaces. Rationale: `api.codebase.saveProjectDefinitionFacts` and `api.codebase.getCodebaseWorkspaceState` already express the correct server boundary. The bug lives in the client controller, not in the codebase backend.

2026-03-27 — Decision: Treat the starter repo access form as a follow-on audit, not an implementation dependency. Rationale: `apps/web/features/starter-repo/components/starter-repo-access-form.tsx` uses submit-time mutation through TanStack React Form and is not part of the codebase timer bug, but it is worth reviewing later for consistency around validation timing.

2026-03-27 — Decision: Dirty codebase drafts must be preserved locally until the user either presses `Continue` or explicitly discards them. Rationale: the reactive Convex query remains the saved truth, but overwriting an in-progress local draft on every live query update would create silent data loss while typing.

2026-03-27 — Decision: Warn on every codebase exit when the current step draft is dirty. Rationale: “all exits” in this product means codebase stage links, within-stage step switches, back navigation, browser history navigation, sidebar codebase links, and browser tab close or reload. Anything narrower would still allow silent data loss on a common exit path.

2026-03-27 — Decision: Use the local shadcn `AlertDialog` for in-app codebase exits and native `beforeunload` for tab close or reload. Rationale: the app already ships a shared `AlertDialog` wrapper, while native unload prompts remain the only portable browser option for closing or reloading the page.

2026-03-27 — Decision: The dirty-exit dialog offers only `Stay` and `Leave without saving`. Rationale: `Continue` is the only save action in the new codebase contract. Adding `Save and leave` would reintroduce a second persistence path and make the controller harder to reason about.

2026-03-27 — Decision: Browser back or forward may use native browser confirmation in the first slice if a fully custom in-app history-interception path proves disproportionate. Rationale: the first milestone must protect dirty edits on all exits, but codebase links and buttons are the primary product surface. Native confirmation is an acceptable practical fallback for browser history navigation in Milestone 1 and keeps the controller rewrite focused.

2026-03-27 — Decision: Finish the codebase page around the already-inlined page plus leave-guard spike instead of restoring `CodebaseStageStepController` as the active runtime seam. Rationale: the working tree had already moved codebase navigation and leave-dialog wiring into `apps/web/features/codebase-flow/components/codebase-stage-page.tsx`, so completing that path kept the diff smaller than reintroducing a second controller layer.

2026-03-27 — Decision: Treat Milestone 3 as blocked by authentication instead of faking browser verification. Rationale: the local app is reachable, but the protected codebase routes redirect to Clerk sign-in immediately for an unauthenticated browser, so a human-authenticated session is required for the final route-level browser sweep.

## Outcomes & Retrospective

As of 2026-03-27 21:00 EDT, Milestones 1 through 4 are complete. Codebase steps now stay quiet while typing, persist only on explicit `Continue`, rehydrate from live Convex values only when the local draft is clean, and route codebase exits through the codebase-scoped leave guard plus native unload protection. The exploratory page-level spike was kept and finished; the older `CodebaseStageStepController` runtime path was not restored.

The QA picture is now command-backed instead of inferred. The codebase-specific unit and integration-ui suites are green, the broader codebase integration-ui proof set from `default_ship` is green, the QA control plane validates cleanly, and the local-auth `@default_ship` Playwright lane passed all five browser scenarios. The remaining follow-on work is not a blocker for this slice: the lesson workbench invalid-field pipeline and the starter repo access form still deserve their own focused audit when the team chooses to tackle them.

## Context and Orientation

The codebase-first protected workspace lives under `apps/web/app/(workspace)/`. The editable codebase routes are `apps/web/app/(workspace)/product/[stepId]/page.tsx`, `apps/web/app/(workspace)/design/[stepId]/page.tsx`, `apps/web/app/(workspace)/marketing/[stepId]/page.tsx`, and `apps/web/app/(workspace)/build-plan/[stepId]/page.tsx`. All of these render through `apps/web/features/codebase-flow/components/codebase-stage-page.tsx`, so any state change in the shared codebase step controller changes every codebase step surface at once.

The active codebase state stack is now `apps/web/features/codebase-flow/components/codebase-stage-page.tsx` to `apps/web/features/codebase-flow/hooks/use-codebase-stage-leave-guard.ts` plus `apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts` to `apps/web/features/codebase-flow/components/codebase-stage-step-card.tsx` and `apps/web/features/codebase-flow/components/codebase-stage-step-field.tsx`. The page owns the codebase-scoped leave guard, the step-state hook owns the current-step draft plus Continue-only persistence, and the card and field components are controlled presentational form surfaces. The previous DOM draft reconstruction path is gone.

The codebase saved-state boundary already lives in Convex. `apps/web/features/codebase-flow/components/codebase-stage-page.tsx` subscribes to `api.codebase.getCodebaseWorkspaceState`, and `apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts` mutates through `api.codebase.saveProjectDefinitionFacts` with `.withOptimisticUpdate`. Convex best practice for this repo is simple: saved truth comes from the reactive query, optimistic updates are temporary local query changes for snappy UI, and the client should not build a second durable state machine on top of that. In practical terms for this initiative, the reactive query should hydrate the initial saved baseline for the current step, the local React draft should own only unsaved edits for that current step, and the local draft must not be pushed into the URL or turned into a sub-route. Route state should continue to mean “which codebase step is open,” not “which transient edit state exists.”

`apps/web/features/codebase-flow/lib/codebase-step-save-feedback.ts` is still the right place for codebase completeness classification. It knows how to determine whether a step is blank, partial, complete, or cleared back to incomplete. That logic should remain centralized, but its output should only control field-level validation after `Continue`, not during typing.

Two adjacent systems were identified during the audit. `apps/web/features/course/lesson/hooks/use-lesson-completion.ts` and the many components under `apps/web/features/course/lesson/workbench/` propagate `invalidFieldIds` and `invalidFieldMessages` across a large workbench tree. This is broad client-side form orchestration and deserves a separate plan after the codebase fix is stable. `apps/web/features/starter-repo/components/starter-repo-access-form.tsx` is a smaller submit-time mutation form built on TanStack React Form. It does not use autosave and should not block the codebase rewrite.

The codebase pages have multiple exit paths that can discard a dirty local draft: stage navigation in `apps/web/features/codebase-flow/components/codebase-stage-nav.tsx`, step switching in `apps/web/features/codebase-flow/components/progression/codebase-stage-step-strip.tsx`, codebase sidebar links in `apps/web/features/codebase-flow/components/codebase-stage-sidebar.tsx`, the back button inside `apps/web/features/codebase-flow/components/codebase-stage-step-card.tsx`, browser history back or forward, and browser tab close or reload. The active implementation now routes in-app exits through the page-level leave guard, uses shadcn `AlertDialog` for codebase links and buttons, uses native `beforeunload` for tab close or reload, and falls back to native browser confirmation for browser history navigation in the first slice.

## Plan of Work

Start by making the codebase-flow contract explicit in code and tests. The codebase controller should stop saving while the user is merely typing. The only action that persists codebase answers will be `Continue`, which may save a partial step and reveal missing required fields or save a complete step and navigate forward. That removes the debounce timer, the autosave hook, and the current coupling between saving and validation churn.

Once the contract is explicit, rewrite the codebase hook around one current-step draft. Make the codebase step card controlled so the hook always has the latest values in React state. Remove `readCodebaseStepDraftValuesFromDom`, remove the dependency on `apps/web/features/shared/hooks/use-autosave.ts`, and collapse the current save and validation maps into a smaller state model that is easy to explain: current draft values, is-saving status, explicit validation attempt state, the current mutation error if one exists, and a dirty-step guard state for leave warnings. When `api.codebase.getCodebaseWorkspaceState` changes, rehydrate the current step from Convex only if the local draft is clean. If the local draft is dirty, preserve it until the user either presses `Continue` or explicitly discards it.

After the controller rewrite, re-baseline the tests. The unit hook tests and the integration-ui codebase page tests should stop asserting timer-driven “Saved for now” behavior during idle typing. Instead, they must prove that typing stays quiet, `Continue` reveals missing required fields, partial `Continue` saves partial values to Convex, complete `Continue` navigates or stays in place exactly as the route rules demand, and dirty codebase exits open the correct warning path.

Finish by recording the adjacent system follow-ups. The lesson workbench and starter repo form should each have a short note in this plan or a follow-on plan so the next contributor can pick them up intentionally instead of rediscovering them through another broad audit.

## Milestones

Milestone 1 is the codebase contract and controller rewrite. At the end of this milestone, `apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts` no longer uses `useAutosave`, no longer reads values from the DOM, no longer couples typing pauses to validation visibility, and owns a codebase-scoped dirty-step leave guard. `apps/web/features/codebase-flow/components/codebase-stage-step-card.tsx` renders controlled inputs backed by the hook’s current draft state. Success is proven when a user can tab through `Foundation` without red errors appearing until `Continue` and can attempt to leave with dirty edits only through a warning flow.

Milestone 2 is the codebase test re-baseline. At the end of this milestone, `apps/web/tests/unit/use-codebase-stage-step-state.test.tsx` and `apps/web/tests/integration-ui/codebase-stage-page.test.tsx` describe the new Continue-only persistence model and pass cleanly. Success is proven when the tests show that typing alone produces no validation, explicit `Continue` both saves and reveals missing required fields, and codebase navigation exits honor the dirty-step guard.

Milestone 3 is the codebase browser verification sweep. At the end of this milestone, representative steps in Product, Design, Marketing, and Build Plan have been exercised manually and all exhibit the same behavior. Success is proven when a human can reproduce the intended experience on at least one page per stage family.

Milestone 4 is the adjacent-form follow-on capture. At the end of this milestone, this plan or a companion plan records the next slice for `apps/web/features/course/lesson/hooks/use-lesson-completion.ts` and the starter repo access form without widening the first implementation. Success is proven when a newcomer can tell exactly what remains after the codebase fix lands.

## Concrete Steps

Work from `/Users/parkerrex/Projects/ship-by-sunday` unless a command below says otherwise.

Begin by verifying the codebase blast radius and the current working tree state:

    cd /Users/parkerrex/Projects/ship-by-sunday
    git status --short
    rg -n "CodebaseStagePage" apps/web/app apps/web/features -g '!**/node_modules/**'
    sed -n '1,260p' apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts
    sed -n '1,220p' apps/web/features/codebase-flow/components/codebase-stage-step-card.tsx
    sed -n '1,260p' apps/web/tests/unit/use-codebase-stage-step-state.test.tsx
    sed -n '1,320p' apps/web/tests/integration-ui/codebase-stage-page.test.tsx

Expected observation: the codebase hook still contains the timer-driven save architecture, and the working tree may already contain exploratory edits that must be reviewed before the real rewrite starts.

Implement Milestone 1 by editing the codebase state stack. The touched files ended up being `apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts`, `apps/web/features/codebase-flow/hooks/use-codebase-stage-leave-guard.ts`, `apps/web/features/codebase-flow/components/codebase-stage-page.tsx`, `apps/web/features/codebase-flow/components/codebase-stage-nav.tsx`, `apps/web/features/codebase-flow/components/progression/codebase-stage-step-strip.tsx`, `apps/web/features/codebase-flow/components/codebase-stage-sidebar.tsx`, `apps/web/features/codebase-flow/components/codebase-stage-leave-dialog.tsx`, and the codebase field rendering components. `apps/web/features/shared/hooks/use-autosave.ts` is no longer part of the runtime codebase path and can be treated as follow-on cleanup if the repo wants to retire the helper entirely.

The codebase leave guard should use a shadcn `AlertDialog` for in-app exits and native `beforeunload` for tab close or reload. The dialog actions are exactly `Stay` and `Leave without saving`. The implementation must cover codebase stage links, within-stage step switching, codebase sidebar links, controller-owned `router.push` calls, and browser history navigation. Browser history back or forward may use native browser confirmation in Milestone 1 if a custom modal-based interception path would widen the change too far.

When the rewrite is ready, run the codebase-focused test suite from `/Users/parkerrex/Projects/ship-by-sunday/apps/web`:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bun run test:unit tests/unit/use-codebase-stage-step-state.test.tsx
    bun run test:unit tests/unit/codebase-step-save-feedback.test.ts
    bun run test:integration:ui tests/integration-ui/codebase-stage-page.test.tsx

Expected observation: the codebase unit and integration-ui tests pass with no timer-driven validation assertions left in place and with explicit assertions for the dirty-step leave guard. On 2026-03-27 19:16 EDT, these exact commands passed.

Then run targeted static checks from the repo root:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bunx oxlint -c .oxlintrc.json --deny-warnings apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts apps/web/features/codebase-flow/hooks/use-codebase-stage-leave-guard.ts apps/web/features/codebase-flow/components/codebase-stage-page.tsx apps/web/features/codebase-flow/components/codebase-stage-nav.tsx apps/web/features/codebase-flow/components/progression/codebase-stage-step-strip.tsx apps/web/features/codebase-flow/components/codebase-stage-sidebar.tsx apps/web/features/codebase-flow/components/codebase-stage-leave-dialog.tsx apps/web/tests/unit/use-codebase-stage-step-state.test.tsx apps/web/tests/integration-ui/codebase-stage-page.test.tsx
    bunx oxfmt -c .oxfmtrc.json --check apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts apps/web/features/codebase-flow/hooks/use-codebase-stage-leave-guard.ts apps/web/features/codebase-flow/components/codebase-stage-page.tsx apps/web/features/codebase-flow/components/codebase-stage-nav.tsx apps/web/features/codebase-flow/components/progression/codebase-stage-step-strip.tsx apps/web/features/codebase-flow/components/codebase-stage-sidebar.tsx apps/web/features/codebase-flow/components/codebase-stage-leave-dialog.tsx apps/web/tests/unit/use-codebase-stage-step-state.test.tsx apps/web/tests/integration-ui/codebase-stage-page.test.tsx

Expected observation: no lint or format regressions in the codebase files. On 2026-03-27 19:16 EDT, both the targeted `oxlint` run and the targeted `oxfmt --check` run passed across the touched codebase files.

Run manual browser QA against local dev from `/Users/parkerrex/Projects/ship-by-sunday/apps/web`:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bun run dev:web

Manually verify the following pages while signed into the protected workspace:

    /product/foundation
    /product/scope
    one /design/* step
    one /marketing/* step
    one /build-plan/* step

Expected observation: typing and tabbing between fields does not show validation, `Continue` saves and reveals missing required fields when needed, complete `Continue` moves the flow forward correctly, codebase link exits show the custom `AlertDialog` while the step is dirty, browser back or forward is protected either by the same modal or by native browser confirmation, and tab close or reload shows the native browser unload warning while the step is dirty.

Observed unauthenticated browser limitation on 2026-03-27 19:16 EDT:

    curl -I http://localhost:3000/product/foundation
    HTTP/1.1 307 Temporary Redirect
    location: https://amused-cattle-61.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fproduct%2Ffoundation
    x-clerk-auth-reason: dev-browser-missing

Observed Milestone 3 completion on 2026-03-27 21:00 EDT:

    bun run qa:personas:prepare -- --pack=default_ship
    member_without_access: exists
    member_with_access: exists

    PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:local-auth:default-ship
    5 passed (30.0s)

After the codebase milestone lands, inspect the follow-on surfaces so the next plan starts from evidence instead of guesses:

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '120,380p' apps/web/features/course/lesson/hooks/use-lesson-completion.ts
    sed -n '1,220p' apps/web/features/starter-repo/components/starter-repo-access-form.tsx

Expected observation: the lesson workbench invalid-field system is explicit-submit oriented and much larger, while the starter repo access form is a smaller submit-time validator flow.

## Validation and Acceptance

Acceptance is behavioral, not merely structural.

On every codebase step page in Product, Design, Marketing, and Build Plan, a user must be able to type into one field, pause, and tab to the next field without red errors or “finish this before continuing” messaging appearing during plain editing. That is the core visible regression this plan exists to remove.

Pressing `Continue` on an incomplete page must save the values already entered for that step to Convex, reveal the missing required fields, and focus the first missing field. Reloading the page after that partial save must show the saved entered values from `api.codebase.getCodebaseWorkspaceState`.

Pressing `Continue` on a complete page must save successfully and then either navigate forward or stay in place according to the existing route rules in `apps/web/features/codebase-flow/lib/codebase-stage-routes.ts`. The success path must not depend on any debounce timer.

While the current step draft is dirty, any attempt to leave through codebase stage links, the codebase step strip, codebase sidebar links, controller-owned navigation, browser back or forward, or browser tab close or reload must trigger the correct warning behavior. In-app codebase exits must use the custom `AlertDialog`. Tab close or reload must use the native browser unload warning. Browser back or forward may use either the same custom modal or native browser confirmation in Milestone 1, but it must not silently drop dirty edits. Choosing `Stay` must preserve the local draft. Choosing `Leave without saving` must discard the dirty draft and proceed.

If `api.codebase.getCodebaseWorkspaceState` updates while the current step draft is dirty, the local draft must remain visible. Once the draft is clean again, the next live Convex result may become the new baseline.

The minimum required checks for the implementation are the codebase hook unit test, the codebase step integration-ui test, and targeted lint and format checks on the touched files. If any of those checks cannot run, update this plan with the exact reason and the next-best validation that was used instead.

## Idempotence and Recovery

This rewrite must be safe to retry. Codebase saved state already lives in Convex, so a failed local refactor should not corrupt codebase data. Keep the backend mutation and query interfaces stable while rewriting the client controller. If the controlled-input migration breaks hydration or navigation, recover by comparing the hook’s draft initialization against the current query data path in `apps/web/features/codebase-flow/components/codebase-stage-page.tsx`. Do not reintroduce DOM reads or debounce validation as a shortcut.

If removing autosave causes product concerns about losing partially typed answers when a user abandons a step before clicking `Continue`, do not restore the old timer-driven save hook by default. The agreed first response is the codebase leave guard, not hidden background saving. Any later addition of explicit draft saving or silent-save-on-leave behavior must be treated as a new product decision and recorded in the Decision Log before implementation.

If the exploratory local edits in the working tree conflict with the chosen implementation, either harvest the useful parts deliberately or discard them deliberately. Do not leave the final codebase controller as a half-spike mixture of old debounce logic and new validation rules.

If the dirty-step guard proves difficult on browser history navigation, do not workaround it by encoding dirty state into sub-routes or URL parameters. The route should continue to mean “which codebase step is open,” not “which transient draft state exists.” The approved fallback for Milestone 1 is native browser confirmation on back or forward, not route-shape changes.

## Artifacts and Notes

High-signal file set for the first implementation slice:

`apps/web/features/codebase-flow/components/codebase-stage-page.tsx`

`apps/web/features/codebase-flow/components/codebase-stage-step-card.tsx`

`apps/web/features/codebase-flow/components/codebase-stage-step-field.tsx`

`apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts`

`apps/web/features/codebase-flow/hooks/use-codebase-stage-leave-guard.ts`

`apps/web/features/codebase-flow/lib/codebase-step-save-feedback.ts`

`apps/web/tests/unit/use-codebase-stage-step-state.test.tsx`

`apps/web/tests/integration-ui/codebase-stage-page.test.tsx`

Adjacent follow-on files identified during the audit:

`apps/web/features/course/lesson/hooks/use-lesson-completion.ts`

`apps/web/features/course/lesson/workbench/**/*`

`apps/web/features/starter-repo/components/starter-repo-access-form.tsx`

Supporting codebase leave-guard UI already in the repo:

`apps/web/components/ui/alert-dialog.tsx`

Validation transcript excerpts captured during implementation:

    bun run test:unit tests/unit/use-codebase-stage-step-state.test.tsx tests/unit/codebase-step-save-feedback.test.ts tests/unit/codebase-problem-severity-field.test.tsx
    Test Files  3 passed (3)
    Tests  11 passed (11)

    bun run test:integration:ui tests/integration-ui/codebase-stage-page.test.tsx
    Test Files  1 passed (1)
    Tests  13 passed (13)

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-start-page.test.tsx tests/integration-ui/codebase-stage-page.test.tsx tests/integration-ui/codebase-review-page.test.tsx tests/integration-ui/codebase-stage-sidebar.test.tsx
    Test Files  4 passed (4)
    Tests  18 passed (18)

    bun run typecheck
    ✓ Compiled successfully
    Finished TypeScript ...

    bun run qa:validate
    QA control plane is internally consistent.

    bun run test:integration:ui tests/integration-ui/codebase-stage-page.test.tsx
    Test Files  1 passed (1)
    Tests  13 passed (13)

Official Convex guidance used to shape this plan, restated in repo terms: queries are reactive and should own saved truth, while optimistic updates are temporary local query changes used only when the UI truly needs to move before the mutation result returns. Codebase step validation does not need to move before the mutation result returns, so it should not be implemented as timer-driven local churn. The practical client shape in this plan is therefore: route equals current codebase step, local React state equals the current unsaved step draft, and Convex query data equals saved truth.

## Interfaces and Dependencies

`api.codebase.saveProjectDefinitionFacts` in `apps/web/convex/codebase/projectDefinition.ts` must remain the persistence boundary for codebase step answers. It accepts `stageId`, `clearedFieldKeys`, and `factsPatch`, and updates the canonical codebase facts document. `api.codebase.getCodebaseWorkspaceState` must remain the reactive read boundary that returns the codebase facts, first incomplete stage, readiness, and per-stage statuses. The first-slice implementation should not change either public interface.

`apps/web/features/codebase-flow/lib/codebase-step-save-feedback.ts` remains the place that classifies codebase completeness. The controller may change how it consumes that classifier, but it should not scatter blank, partial, and complete logic across multiple codebase components.

`apps/web/features/codebase-flow/components/codebase-stage-step-card.tsx` should become a presentational controlled-form component over the current step draft. `apps/web/features/codebase-flow/hooks/use-codebase-stage-step-state.ts` should become the only place that knows how to initialize that draft from saved values, preserve it while dirty, track whether the user has pressed `Continue`, call the Convex mutation, decide whether to navigate, and trigger the codebase leave guard. The first-slice leave guard contract is: custom `AlertDialog` for codebase links and buttons, native `beforeunload` for tab close or reload, and native browser confirmation as an acceptable fallback for back or forward if needed.

`apps/web/features/shared/hooks/use-autosave.ts` is currently a dependency only because the codebase hook still imports it. If the codebase rewrite removes its last usage, retire it in the same change or record a small cleanup follow-up explicitly in Progress.

The lesson workbench and starter repo form are dependencies only in the planning sense. They were audited as adjacent systems and must not be modified during Milestone 1 unless this plan is updated first to explain the scope expansion.
