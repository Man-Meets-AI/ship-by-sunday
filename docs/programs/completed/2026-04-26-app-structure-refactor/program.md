---
program_id: 'app-structure-refactor'
title: 'App Structure Refactor'
status: 'complete'
created_at: 2026-04-26
completed_at: 2026-04-26
summary: 'Reduce and discipline the Ship by Sunday app structure so routes, Convex, Stripe, shared UI, and durable product domains have clear homes.'
post_build_recap: 'Completed eleven app-structure slices that made boundaries explicit, moved route-local wrappers into App Router private folders, extracted workspace shell ownership, narrowed course, billing, shared UI, and helper boundaries, removed proven-unused route compatibility exports, and documented the final ownership map.'
read_when:
  - 'Preserving research for the app structure refactor.'
  - 'Writing or grilling child ExecPlans for feature, route, Convex, billing, or shared UI cleanup.'
  - 'Checking whether a proposed move belongs in app, features, Convex, platform, components, hooks, lib, or tests.'
---

# App Structure Refactor

This is a living initiative document. It keeps the durable initiative-level truth for reducing and disciplining the Ship by Sunday app structure.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

This initiative exists because the app structure has drifted from the current codebase-first product contract. The most important symptom is not the existence of `features/` itself; it is that route-local UI, shared workspace shell code, course domain code, Convex-safe backend logic, Stripe billing behavior, and shared UI inventory are not consistently separated.

The intended end state is a route-readable Next.js App Router, a clear Convex backend boundary, auditable Stripe and checkout responsibilities, a small shared UI primitive layer, and a reduced `features/` folder that contains only durable cross-route product domains.

## Program Inputs

The Program packet lives under `docs/programs/completed/2026-04-26-app-structure-refactor/`.

The durable research input is:

- `research-pass-app-structure.md`

The normalized input is:

- `normalized-pass-app-structure.md`

The convergence artifact is:

- `converged-decision-packet.md`

The dependency artifact is:

- `dependency-graph.md`

The plan split artifact is:

- `plan-split-recommendation.md`

The review artifact is:

- `cross-repo-review.md`

The current planning brief is:

- `planning-brief-1.md`
- `planning-brief-2.md`
- `planning-brief-3.md`
- `planning-brief-4.md`
- `planning-brief-5.md`
- `planning-brief-6.md`
- `planning-brief-7.md`
- `planning-brief-8.md`
- `planning-brief-9.md`
- `planning-brief-10.md`
- `planning-brief-11.md`
- `current-planning-brief.txt`

## Current State

The research-only pass is complete. It found that `apps/web/features` should be reduced and governed, not deleted outright. It also found that `features/course` is the largest structural knot, `features/course/shared/components/app-shell` is really a cross-workspace shell, the App Router is thin enough that route ownership is hard to read, Convex is mostly clean but imports some feature paths that are not obviously backend-safe, and billing is coherent but spread across several runtime boundaries.

The first child ExecPlan has been completed at `docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md`. That plan intentionally stayed a baseline and safety slice, not a folder move. It made selected cross-feature imports explicit, moved shared assertion helpers to `apps/web/lib/assert.ts`, and added server-only guards to true server helper modules.

The second child ExecPlan has been completed at `docs/exec-plans/completed/2026-04-26-extract-workspace-shell-from-course.md`. It moved the shared AppShell implementation out of course ownership into `apps/web/features/workspace-shell`, updated first-party imports to the new path, and left temporary compatibility exports at the old course-owned path while keeping route behavior stable.

The third child ExecPlan has been completed at `docs/exec-plans/completed/2026-04-26-make-route-ownership-visible.md`. It started route ownership by moving the protected workspace access gate and legacy codebase redirect helper into private `apps/web/app/(workspace)` folders, updated first-party imports and tests, and left temporary compatibility exports at the old feature paths.

The fourth child ExecPlan has been completed at `docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md`. It moved identity route wrapper screens and support shell code into private `apps/web/app/(identity)` folders, updated first-party imports and tests, and left temporary compatibility exports at the old auth feature paths.

The fifth child ExecPlan has been completed at `docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md`. It finished the current route ownership visibility pass by moving checkout success wrappers, review route wrappers, and API route path contracts into App Router private folders while leaving billing, Convex, and request behavior unchanged.

The sixth child ExecPlan has been completed at `docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md`. It moved marketing-only effects and the codebase-only keyboard hook to feature-owned paths while preserving compatibility exports and avoiding UI inventory deletion.

The seventh child ExecPlan has been completed at `docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md`. It started the course-domain split by moving persisted completion field IDs into the lesson model and keeping workbench constants as compatibility exports.

The eighth child ExecPlan has been completed at `docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md`. It continued the course-domain split by moving lesson URL construction out of the curriculum model and into an explicit course lesson routing helper, keeping manifest compatibility exports, and updating Convex course lookup imports to avoid the manifest compatibility surface.

The ninth child ExecPlan has been completed at `docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md`. It continued the course-domain split by keeping stage-unlock model summaries route-neutral, moving href decoration into a workbench adapter, and narrowing registry imports to preview and objective-task helpers.

The tenth child ExecPlan has been completed at `docs/exec-plans/completed/2026-04-26-make-billing-and-stripe-boundaries-auditable.md`. It extracted Stripe Checkout Session parameter assembly into a checkout server helper and removed a hidden billing platform dependency on the course registry, without changing Stripe checkout, webhook, pricing, promo code, billing proof, environment, Convex schema, generated Convex files, public Convex function names, route behavior, shared UI inventory, AppShell, route screens, or the unrelated stashed scrollbar styling.

The eleventh child ExecPlan has been completed at `docs/exec-plans/completed/2026-04-26-finalize-app-structure-refactor-docs-and-compatibility-cleanup.md`. It deleted only proven-unused route-local compatibility exports, removed the unused `apiRouteConfig` product-config re-export, synced architecture and frontend docs, and closed this Program without changing route, billing, Convex, Stripe, environment, shared UI inventory, AppShell, or feature-folder behavior.

The final state is a readable App Router route map, a shared workspace shell outside course ownership, backend-safe Convex-facing imports, auditable checkout and billing seams, marketing-owned effects, feature-owned hook behavior, smaller route compatibility surface, and durable docs that explain where route-local code, product domains, platform adapters, Convex code, and shared UI inventory belong.

## Progress

- [x] 2026-04-26 EDT: Preserved the unrelated scrollbar styling work in a stash before creating this Program branch.
- [x] 2026-04-26 EDT: Created clean branch `codex/app-structure-research` from current `main`.
- [x] 2026-04-26 EDT: Completed six read-only architecture inspections across repo structure, App Router, Convex, Stripe/billing, shared UI, and migration risk.
- [x] 2026-04-26 EDT: Completed local external reference comparison against WorkOS, HackerAI, Next SaaS starter, ticket marketplace, and Convex SaaS repository trees.
- [x] 2026-04-26 EDT: Wrote the Program packet research, normalization, convergence, dependency, split, review, planning brief, and Program document.
- [x] 2026-04-26 EDT: Wrote the first child ExecPlan for boundary safety.
- [x] 2026-04-26 EDT: Grilled the first child ExecPlan and tightened the assert-helper home, exact relative-import candidates, server-only candidates, and focused validation matrix before implementation.
- [x] 2026-04-26 EDT: Executed and completed the boundary-safety child ExecPlan. Focused unit, integration, integration-ui, contract, lint, typecheck, plan, Program, markdown, and diff checks passed.
- [x] 2026-04-26 EDT: Wrote planning brief 2 and opened the second child ExecPlan for extracting the workspace shell from course ownership.
- [x] 2026-04-26 EDT: Executed and completed the workspace-shell extraction child ExecPlan. Focused shell unit tests, integration-ui tests, format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and diff checks passed.
- [x] 2026-04-26 EDT: Wrote planning brief 3 and opened the third child ExecPlan for the first route-ownership move.
- [x] 2026-04-26 EDT: Executed and completed the first route-ownership child ExecPlan. Focused access gate, protected layout, legacy redirect, format, app lint, app typecheck, plan, Program, markdown, and diff checks passed.
- [x] 2026-04-26 EDT: Wrote planning brief 4 and opened the fourth child ExecPlan for identity route ownership.
- [x] 2026-04-26 EDT: Executed and completed the identity route-ownership child ExecPlan. Focused identity unit, integration-ui, format, app lint, app typecheck, plan, Program, markdown, and diff checks passed.
- [x] 2026-04-26 EDT: Wrote planning brief 5 and opened the fifth child ExecPlan for checkout, review, and API route ownership visibility.
- [x] 2026-04-26 EDT: Executed and completed the remaining route-ownership child ExecPlan. Focused checkout, review, API route, API client, format, app lint, app typecheck, plan, Program, markdown, and diff checks passed.
- [x] 2026-04-26 EDT: Wrote planning brief 6 and opened the sixth child ExecPlan for shared UI and hook cleanup.
- [x] 2026-04-26 EDT: Executed and completed the shared UI and hook cleanup child ExecPlan. Focused marketing effect, encrypted text, codebase, homepage contract, format, app lint, app typecheck, plan, Program, markdown, and diff checks passed.
- [x] 2026-04-26 EDT: Wrote planning brief 7 and opened the seventh child ExecPlan for splitting course completion field IDs from workbench constants.
- [x] 2026-04-26 EDT: Executed and completed the course completion field ID split child ExecPlan. Focused course registry, watch-lesson contract, core UX build constants, course state lifecycle, stage unlock, format, app lint, app typecheck, plan, Program, markdown, and diff checks passed.
- [x] 2026-04-26 EDT: Wrote planning brief 8 and opened the eighth child ExecPlan for splitting lesson routing from the curriculum model.
- [x] 2026-04-26 EDT: Executed and completed the lesson routing split child ExecPlan. Focused legacy routes, post-review destinations, execute route redirects, mission page, course registry, course state lifecycle, stage unlock, format, app lint, app typecheck, plan, Program, markdown, and diff checks passed.
- [x] 2026-04-26 EDT: Wrote planning brief 9 and opened the ninth child ExecPlan for making the stage-unlock summary boundary explicit.
- [x] 2026-04-26 EDT: Executed and completed the stage-unlock summary boundary child ExecPlan. Focused stage unlock, course registry, course state lifecycle, watch-lesson contract, lesson page, format, app lint, app typecheck, plan, Program, markdown, and diff checks passed.
- [x] 2026-04-26 EDT: Wrote planning brief 10 and opened the tenth child ExecPlan for making billing and Stripe boundaries auditable without changing checkout, webhook, pricing, promo, environment, or billing proof behavior.
- [x] 2026-04-26 EDT: Executed and completed the billing and Stripe boundary child ExecPlan. Focused checkout params, Stripe line item, checkout session, hosted proof, Stripe observability, checkout route, format, app lint, app typecheck, plan, Program, markdown, and diff checks passed.
- [x] 2026-04-26 EDT: Wrote planning brief 11 and opened the final child ExecPlan for compatibility cleanup, docs sync, and Program closeout.
- [x] 2026-04-26 EDT: Executed and completed the final compatibility cleanup and docs sync child ExecPlan. Static import scans, focused route/helper tests, format, app lint, app typecheck, plan, Program, markdown, and diff checks passed.

## Decision Log

Decision: Reduce `features/` instead of deleting it wholesale.
Rationale: The research found real durable product domains under `features/`, but also found route-local and shared shell code in misleading places. A wholesale delete would raise risk without improving clarity.
Date: 2026-04-26

Decision: Make boundary safety the first child slice.
Rationale: High-fan-in files such as `apps/web/config/product.ts`, `apps/web/features/course/lesson/model/manifest.ts`, and broad course registry barrels make early physical moves risky. Import visibility and server-only guards should come first.
Date: 2026-04-26

Decision: Treat external references as architecture inspiration only.
Rationale: The reference repos support route-visible App Router structure and clear backend boundaries, but Ship by Sunday has repo-specific Program/ExecPlan, codebase compiler, generated docs, release proof, Vercel, Clerk, Convex, and Stripe constraints.
Date: 2026-04-26

Decision: Keep billing and Convex schema moves late.
Rationale: Billing and Convex changes affect hosted release proof, Stripe, Clerk identity, generated Convex APIs, entitlement, and persisted state. They need dedicated later slices.
Date: 2026-04-26

Decision: Consider the first child ExecPlan grilled after tightening exact implementation candidates.
Rationale: The grill resolved the open assert-helper target as `apps/web/lib/assert.ts`, added the missed `lesson-map-href.ts` relative-import candidate, added `capture-server-error.ts` to the server-only candidate set, and replaced vague focused validation with concrete unit, integration, integration-ui, contract, lint, and typecheck commands.
Date: 2026-04-26

Decision: Split identity route ownership out from checkout, review, and API route contracts.
Rationale: Identity wrappers can move with focused route and integration-ui proof. Checkout success, review preload, and API request contracts carry billing, Convex, or request-boundary risk and should not be mixed into the same child slice.
Date: 2026-04-26

Decision: Finish the current route-ownership pass without changing billing or Convex behavior.
Rationale: Checkout success wrappers, review wrappers, and API route path constants can move into App Router private folders with focused proof, while checkout session interpretation, Stripe webhook behavior, and Convex preload behavior remain release-sensitive later work.
Date: 2026-04-26

Decision: Make shared UI cleanup compatibility-preserving before deleting inventory.
Rationale: The shared UI scan found marketing-only motion effects and a codebase-only keyboard hook that can move now, but also found shared primitives, shadcn inventory, and cross-feature visuals that should not be deleted or moved without a dedicated proof pass.
Date: 2026-04-26

Decision: Start course-domain cleanup with persisted completion field IDs.
Rationale: A full workbench move is too broad while the lesson content graph has high fan-in. The direct `model/registry/completion.ts` import from workbench constants is a small backend-safety smell that can move first without changing registry, manifest, Convex, route, checkout, or billing behavior.
Date: 2026-04-26

Decision: Split lesson route helper construction out of curriculum before moving higher-fan-in course files.
Rationale: `curriculum.ts` should own course data and lookups, while `getLessonHref` and legacy alias href construction depend on app route config and workspace navigation. Moving those helpers reduced route coupling without moving the manifest, registry barrels, route screens, or billing-sensitive behavior.
Date: 2026-04-26

Decision: Keep Convex course lookups off the manifest compatibility surface.
Rationale: The manifest still re-exports route helpers for old callers. Convex course files that only need pure lesson lookups should import from `apps/web/features/course/lesson/model/curriculum.ts` so their dependency is explicit.
Date: 2026-04-26

Decision: Keep stage-unlock model actions route-neutral and decorate hrefs in workbench.
Rationale: Registry code needs stage-unlock previews and objective tasks, not edit-link hrefs. Moving href decoration to a workbench adapter keeps model and registry paths off route helpers while preserving UI behavior.
Date: 2026-04-26

## Slice Ledger

Active child ExecPlans:

- None.

Recommended future child ExecPlans:

- None.

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md`
- `docs/exec-plans/completed/2026-04-26-extract-workspace-shell-from-course.md`
- `docs/exec-plans/completed/2026-04-26-make-route-ownership-visible.md`
- `docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md`
- `docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md`
- `docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md`
- `docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md`
- `docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md`
- `docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md`
- `docs/exec-plans/completed/2026-04-26-make-billing-and-stripe-boundaries-auditable.md`
- `docs/exec-plans/completed/2026-04-26-finalize-app-structure-refactor-docs-and-compatibility-cleanup.md`

## Next Slice

No required next slice remains inside this Program.

Future app-structure work should start from a new Program or a new bounded ExecPlan if it needs to delete shared UI inventory, remove AppShell compatibility exports, move feature folders, change Convex schema or generated files, change Stripe checkout or webhook behavior, change pricing or promo code behavior, change billing proof, change environment behavior, or alter public route behavior.

## Risks and Watchpoints

Do not turn this Program into a broad rewrite. The safe path is small, validated slices.

Do not delete `features/` just because reference projects have less feature-layer structure. This repo has a larger product surface and existing feature domains.

Do not move course registry or manifest files early. They have high fan-in across routes, tests, Convex, checkout, and navigation.

Do not silently change route aliases. Compatibility routes remain protected by `apps/web/proxy.ts` and must continue redirecting or behaving as the current product contract requires.

Do not add a Next Stripe webhook route. The current production webhook contract belongs to Convex HTTP actions.

Do not include the stashed scrollbar styling change in this Program branch.

## Outcomes & Retrospective

This Program completed as an eleven-slice refactor rather than a broad rewrite. The useful pattern was to make ownership visible first, preserve compatibility where risk was high, prove each route/helper boundary with focused tests, then delete only compatibility exports that had no first-party consumers.

The intentionally deferred work is any cleanup that would delete shared UI inventory or AppShell compatibility, rename or delete feature folders, change Convex schema or generated files, or alter billing, checkout, webhook, pricing, promo, environment, or route behavior. Those surfaces need fresh scope and proof instead of being folded into this completed Program.

## Validation and Acceptance

At the Program level, completion required the App Router to be readable as the route map, shared workspace shell code to live outside course paths, Convex imports to use backend-safe modules, Stripe and checkout responsibilities to be auditable, shared UI to contain primitives rather than miscellaneous effects, and `features/` to contain only durable product domains.

Every child slice ran narrow touched-surface validation first, then app lint and typecheck when code moved across app boundaries. Program and ExecPlan artifacts passed Program lint, plan lint where relevant, markdown lint, and `git diff --check`.

## Artifacts and Notes

The first planning brief is `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-1.md`.

The second planning brief is `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-2.md`.

The third planning brief is `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-3.md`.

The fourth planning brief is `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-4.md`.

The fifth planning brief is `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-5.md`.

The sixth planning brief is `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-6.md`.

The seventh planning brief is `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-7.md`.

The eighth planning brief is `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-8.md`.

The ninth planning brief is `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-9.md`.

The tenth planning brief is `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-10.md`.

The eleventh planning brief is `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-11.md`.

The completed first child ExecPlan is `docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md`.

The completed second child ExecPlan is `docs/exec-plans/completed/2026-04-26-extract-workspace-shell-from-course.md`.

The completed third child ExecPlan is `docs/exec-plans/completed/2026-04-26-make-route-ownership-visible.md`.

The completed fourth child ExecPlan is `docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md`.

The completed fifth child ExecPlan is `docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md`.

The completed sixth child ExecPlan is `docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md`.

The completed seventh child ExecPlan is `docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md`.

The completed eighth child ExecPlan is `docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md`.

The completed ninth child ExecPlan is `docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md`.

The completed tenth child ExecPlan is `docs/exec-plans/completed/2026-04-26-make-billing-and-stripe-boundaries-auditable.md`.

The completed eleventh child ExecPlan is `docs/exec-plans/completed/2026-04-26-finalize-app-structure-refactor-docs-and-compatibility-cleanup.md`.

The unrelated scrollbar work is preserved in the stash entry named `wip: global scrollbar style` from branch `codex/global-scrollbar-style`.

## Interfaces and Dependencies

This Program depends on the root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `docs/FRONTEND.md`, root `DESIGN.md`, `apps/web/config/product.ts`, `apps/web/proxy.ts`, `apps/web/app`, `apps/web/features`, `apps/web/convex`, `apps/web/platform`, `apps/web/components`, and `apps/web/tests`.
