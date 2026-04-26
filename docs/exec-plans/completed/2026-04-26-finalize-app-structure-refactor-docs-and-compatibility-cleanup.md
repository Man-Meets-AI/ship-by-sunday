---
title: Finalize App Structure Refactor Docs And Compatibility Cleanup
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Remove proven-unused route-local compatibility exports, sync app-structure docs, and close the app structure refactor Program without changing runtime behavior.
post_build_recap: Removed the proven-unused route-local compatibility exports, removed the stale product-config apiRouteConfig export, documented the final app ownership map, and closed the app structure refactor Program with focused plus app validation passing.
program_id: app-structure-refactor
planning_brief: docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-11.md
read_when:
  - Resuming final app structure cleanup.
  - Checking why selected compatibility exports were removed while AppShell and shared UI compatibility stayed.
  - Validating the Program closeout for the app structure refactor.
---

# Finalize App Structure Refactor Docs And Compatibility Cleanup

This is a living execution plan. It describes the final implementation slice for the app structure refactor Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The app structure refactor has moved route-local UI, shared shell code, course helpers, shared visual effects, and checkout session assembly into clearer homes. Several old feature-path files now exist only as temporary compatibility re-exports, and durable docs still do not describe the resulting structure.

After this slice, proven-unused route-local compatibility exports will be gone, the current app ownership map will be documented in `docs/ARCHITECTURE.md` and `docs/FRONTEND.md`, and the Program will be ready to close. Runtime behavior must not change.

## Progress

- [x] 2026-04-26 EDT: Confirmed the first ten child ExecPlans are complete and the Program names final features reduction and docs sync as the next recommended slice.
- [x] 2026-04-26 EDT: Inspected compatibility exports, feature inventory, product config route exports, app-structure docs, and Program indexes before editing.
- [x] 2026-04-26 EDT: Static scans found no first-party consumers of the selected route-local compatibility exports and no consumer importing `apiRouteConfig` from `apps/web/config/product.ts`.
- [x] 2026-04-26 EDT: Wrote planning brief 11 and opened this active child ExecPlan.
- [x] 2026-04-26 EDT: Deleted only the selected unused route-local compatibility exports and left shared UI inventory plus AppShell compatibility untouched.
- [x] 2026-04-26 EDT: Removed the unused `apiRouteConfig` compatibility export from product config while leaving API consumers on `@/app/api/_lib/api-route-config`.
- [x] 2026-04-26 EDT: Synced `docs/ARCHITECTURE.md` and `docs/FRONTEND.md` with the current `apps/web` ownership map.
- [x] 2026-04-26 EDT: Post-cleanup static scans found no exact deleted import paths and no product-config `apiRouteConfig` re-export.
- [x] 2026-04-26 EDT: Focused unit, checkout integration, and integration-ui tests passed for the touched route and helper surfaces.
- [x] 2026-04-26 EDT: App gates passed with `bun run format:check`, `bun run --cwd apps/web lint`, and `bun run --cwd apps/web typecheck`.
- [x] 2026-04-26 EDT: Archived this ExecPlan, closed the Program, moved the Program packet to `docs/programs/completed/`, and updated Program indexes.
- [x] 2026-04-26 EDT: Closeout validation passed with final plan lint, Program lint, markdown lint, and `git diff --check`.

## Surprises & Discoveries

2026-04-26 EDT: The selected route-local compatibility exports have no first-party code or test imports, but nearby durable feature files are still heavily used. The cleanup must delete only the wrapper exports, not whole feature areas such as auth route utilities, checkout button code, product-access server/lib code, or blueprint flow domain code.

2026-04-26 EDT: `apps/web/components/ui` compatibility exports and the old course-owned AppShell re-export layer are also unused by first-party app code, but they remain explicitly out of scope for this final pass because the user and Program boundaries call out shared UI inventory and AppShell as higher-risk boundaries.

2026-04-26 EDT: Completed ExecPlans and older codex planning notes still mention old paths. Those are historical records, not active import consumers, and should not be rewritten as part of this cleanup.

2026-04-26 EDT: A broad fixed-string scan for `@/features/auth/sign-in/sign-in-page` also matches the durable `sign-in-page-content` import in the new route-local sign-in page. The exact deleted import path scan with an import-terminating quote has no matches.

## Decision Log

Decision: Remove only route-local compatibility exports with no first-party consumers.
Rationale: These wrappers no longer protect active code, and deleting them makes the App Router ownership moves real without changing runtime behavior.
Date: 2026-04-26

Decision: Keep `components/ui` and AppShell compatibility exports for a future explicit cleanup.
Rationale: The Program and user boundaries forbid deleting shared UI inventory and warn against AppShell churn. Removing those compatibility layers is not required to close this Program safely.
Date: 2026-04-26

Decision: Close the Program only after focused tests, app gates, plan lint, Program lint, markdown lint, and diff validation pass.
Rationale: The final slice should leave a durable completed Program packet, not an active Program with no named next slice.
Date: 2026-04-26

## Outcomes & Retrospective

This plan removed the selected route-local compatibility exports without changing runtime behavior, removed the stale product-config `apiRouteConfig` compatibility export, and documented the final app ownership map in durable architecture and frontend docs.

The cleanup intentionally did not delete shared UI inventory, AppShell compatibility exports, feature folders, Convex schema or generated files, Stripe checkout or webhook behavior, pricing, promo code behavior, billing proof, environment behavior, route screens, or the unrelated stashed scrollbar styling change.

## Context and Orientation

Ship by Sunday's app lives in `apps/web`. The current ownership map after the completed slices is:

App Router route groups under `apps/web/app` own route-local page wrappers and private route UI. The protected workspace group owns access-required UI in `apps/web/app/(workspace)/_components` and legacy route redirects in `apps/web/app/(workspace)/_lib`. The identity group owns sign-in, sign-up, SSO callback, reset-password shells, and identity support copy in `apps/web/app/(identity)`. Checkout success owns its display wrappers in `apps/web/app/checkout/success`. API route path contracts live under `apps/web/app/api/_lib`.

Durable product domains remain under `apps/web/features`. Examples include `features/blueprint-flow`, `features/auth` for reusable auth forms and route utilities, `features/checkout` for checkout button, checkout server helpers, and checkout recovery, `features/product-access` for shared product-access types and server checks, `features/course` for course and lesson domain data, `features/workspace-shell` for shared workspace chrome, `features/workspace-navigation`, `features/marketing`, `features/docs`, `features/codex`, and `features/observability`.

The platform layer under `apps/web/platform` owns environment, auth, billing, Convex, and Next platform helpers. Convex backend code lives under `apps/web/convex`. Shared UI primitives remain under `apps/web/components/ui`.

### In Scope

Delete unused compatibility files for route-local wrappers:

`apps/web/features/auth/sign-in/auth-page-shell.tsx`, `apps/web/features/auth/sign-in/auth-page-support-panel.tsx`, `apps/web/features/auth/sign-in/identity-route-panel-content.ts`, `apps/web/features/auth/sign-in/sign-in-page.tsx`, `apps/web/features/auth/sign-in/sso-callback-page.tsx`, `apps/web/features/auth/sign-up/post-checkout-sign-up-page.tsx`, `apps/web/features/product-access/components/access-required-*.tsx`, `apps/web/features/product-access/hooks/use-access-required-controller.ts`, `apps/web/features/product-access/lib/access-required-view-model.ts`, `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx`, `apps/web/features/blueprint-flow/components/review/blueprint-review-download-bridge.tsx`, `apps/web/features/blueprint-flow/components/review/blueprint-review-handoff-card.tsx`, `apps/web/features/blueprint-flow/hooks/use-review-download-handoff.ts`, `apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts`, `apps/web/features/checkout/components/checkout-success-*.tsx`, `apps/web/features/checkout/components/checkout-success-view-model.ts`, and `apps/web/hooks/use-keyboard-shortcut.ts`.

Remove `export { apiRouteConfig } from "@/app/api/_lib/api-route-config";` from `apps/web/config/product.ts`.

Update `docs/ARCHITECTURE.md`, `docs/FRONTEND.md`, this ExecPlan, the owning Program, and Program index docs.

### Out Of Scope

Do not delete `apps/web/components/ui` compatibility files. Do not delete or change old AppShell compatibility exports under `apps/web/features/course/shared/components/app-shell` or its subpaths.

Do not move route screens, rename or delete feature folders, modify Convex schema or generated files, change Stripe checkout, webhook, pricing, promo code, billing proof, environment, route behavior, public Convex function names, shared UI inventory, AppShell behavior, or the unrelated stashed scrollbar styling change.

Do not rewrite completed ExecPlan archives just because they mention old file paths.

## Plan of Work

Start with the selected compatibility files. Delete only files that static scans already proved are unused by first-party code and tests. Leave durable sibling files in the same feature folders intact.

Remove the `apiRouteConfig` compatibility export from `apps/web/config/product.ts`. All first-party imports already use `@/app/api/_lib/api-route-config`.

Update `docs/ARCHITECTURE.md` with a concise `apps/web` ownership map. Update `docs/FRONTEND.md` with the current rule that route-local page wrappers belong in App Router private folders while durable product domains stay in `features`.

Run focused proof before app-wide gates. After validation, mark this ExecPlan complete, move it to `docs/exec-plans/completed/`, update the Program to `status: complete`, move the Program folder to `docs/programs/completed/`, and update Program indexes.

## Milestones

The first milestone is plan and baseline evidence. It is complete when planning brief 11 and this ExecPlan exist, and static scans identify the exact compatibility files that can be removed safely.

The second milestone is cleanup. It is complete when the selected compatibility files are deleted, `apiRouteConfig` is no longer re-exported from product config, and static scans prove no first-party imports reference those old paths.

The third milestone is durable docs sync. It is complete when architecture, frontend, Program, and Program index docs describe the final structure and validation paths.

The fourth milestone is validation and closeout. It is complete when focused tests, app gates, plan lint, Program lint, markdown lint, and `git diff --check` pass, this ExecPlan moves to `docs/exec-plans/completed/`, and the Program packet moves to `docs/programs/completed/`.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Read the Program, current planning brief, and this plan:

    sed -n '1,320p' docs/programs/completed/2026-04-26-app-structure-refactor/program.md
    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-11.md
    sed -n '1,380p' docs/exec-plans/completed/2026-04-26-finalize-app-structure-refactor-docs-and-compatibility-cleanup.md

Record baseline import evidence:

    rg '@/features/product-access/(components|hooks|lib/access-required-view-model)|@/features/blueprint-flow/(lib/legacy-blueprint-route-redirects|hooks/use-review-download-handoff|components/blueprint-review-page|components/review/blueprint-review-(download-bridge|handoff-card))|@/features/auth/sign-in/(auth-page-shell|auth-page-support-panel|identity-route-panel-content|sign-in-page|sso-callback-page)|@/features/auth/sign-up/post-checkout-sign-up-page|@/features/checkout/components/checkout-success|@/hooks/use-keyboard-shortcut' apps/web --glob '!node_modules'
    rg 'apiRouteConfig' apps/web --glob '!node_modules'

After cleanup, prove the deleted path imports stay gone:

    rg '@/features/product-access/(components|hooks|lib/access-required-view-model)|@/features/blueprint-flow/(lib/legacy-blueprint-route-redirects|hooks/use-review-download-handoff|components/blueprint-review-page|components/review/blueprint-review-(download-bridge|handoff-card))|@/features/auth/sign-in/(auth-page-shell|auth-page-support-panel|identity-route-panel-content|sign-in-page|sso-callback-page)|@/features/auth/sign-up/post-checkout-sign-up-page|@/features/checkout/components/checkout-success|@/hooks/use-keyboard-shortcut' apps/web --glob '!node_modules'
    rg 'export \\{ apiRouteConfig \\}' apps/web/config/product.ts

Run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/route-metadata.test.ts tests/unit/access-required-page.test.tsx tests/unit/app-protected-layout.test.tsx tests/unit/legacy-blueprint-route-redirects.test.ts tests/unit/review-download-handoff.test.tsx tests/unit/checkout-session-params.test.ts tests/unit/stripe-line-item.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/sso-callback-page.test.tsx tests/integration-ui/post-checkout-sign-up-page.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration-ui/blueprint-review-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/checkout-button.test.tsx

Then run app and plan checks:

    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-finalize-app-structure-refactor-docs-and-compatibility-cleanup.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/ARCHITECTURE.md docs/FRONTEND.md docs/programs docs/exec-plans/completed/2026-04-26-finalize-app-structure-refactor-docs-and-compatibility-cleanup.md
    git diff --check

## Validation and Acceptance

This slice is accepted when selected route-local compatibility exports are deleted, no first-party imports reference the deleted paths, `apps/web/config/product.ts` no longer re-exports `apiRouteConfig`, architecture and frontend docs describe the current ownership map, focused route and helper tests pass, app gates pass, and the Program packet is completed and archived.

### Test Commands

Run these commands from repo root after implementation:

    rg '@/features/product-access/(components|hooks|lib/access-required-view-model)|@/features/blueprint-flow/(lib/legacy-blueprint-route-redirects|hooks/use-review-download-handoff|components/blueprint-review-page|components/review/blueprint-review-(download-bridge|handoff-card))|@/features/auth/sign-in/(auth-page-shell|auth-page-support-panel|identity-route-panel-content|sign-in-page|sso-callback-page)|@/features/auth/sign-up/post-checkout-sign-up-page|@/features/checkout/components/checkout-success|@/hooks/use-keyboard-shortcut' apps/web --glob '!node_modules'
    rg 'export \\{ apiRouteConfig \\}' apps/web/config/product.ts
    bun run --cwd apps/web test:unit -- tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/route-metadata.test.ts tests/unit/access-required-page.test.tsx tests/unit/app-protected-layout.test.tsx tests/unit/legacy-blueprint-route-redirects.test.ts tests/unit/review-download-handoff.test.tsx tests/unit/checkout-session-params.test.ts tests/unit/stripe-line-item.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/sso-callback-page.test.tsx tests/integration-ui/post-checkout-sign-up-page.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration-ui/blueprint-review-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/checkout-button.test.tsx
    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-finalize-app-structure-refactor-docs-and-compatibility-cleanup.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/ARCHITECTURE.md docs/FRONTEND.md docs/programs docs/exec-plans/completed/2026-04-26-finalize-app-structure-refactor-docs-and-compatibility-cleanup.md
    git diff --check

## Idempotence and Recovery

The cleanup is safe to retry because deleted files have no first-party consumers. If a test fails from a missing import, restore only that compatibility file or update the consumer to the already-established canonical path, then rerun the focused tests.

If Program lint fails after moving the Program folder, check that `status`, `completed_at`, `post_build_recap`, indexes, and Program folder paths all agree. `PROGRAMS.md` requires completed Programs to live under `docs/programs/completed/`.

Do not recover by broadening the cleanup into shared UI inventory, AppShell compatibility, Convex, billing, route behavior, or feature-folder deletion.

## Artifacts and Notes

Completed Program packet:

    docs/programs/completed/2026-04-26-app-structure-refactor/

Current planning brief:

    docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-11.md

Selected compatibility cleanup excludes:

    apps/web/components/ui/*
    apps/web/features/course/shared/components/app-shell*

Focused validation targets:

    apps/web/tests/unit/sign-in-route.test.ts
    apps/web/tests/unit/sign-up-route.test.ts
    apps/web/tests/unit/route-metadata.test.ts
    apps/web/tests/unit/access-required-page.test.tsx
    apps/web/tests/unit/app-protected-layout.test.tsx
    apps/web/tests/unit/legacy-blueprint-route-redirects.test.ts
    apps/web/tests/unit/review-download-handoff.test.tsx
    apps/web/tests/unit/checkout-session-params.test.ts
    apps/web/tests/unit/stripe-line-item.test.ts
    apps/web/tests/integration/stripe-checkout-route.test.ts
    apps/web/tests/integration-ui/sign-in-page.test.tsx
    apps/web/tests/integration-ui/sso-callback-page.test.tsx
    apps/web/tests/integration-ui/post-checkout-sign-up-page.test.tsx
    apps/web/tests/integration-ui/access-required-page.test.tsx
    apps/web/tests/integration-ui/access-required-page.interactions.test.tsx
    apps/web/tests/integration-ui/blueprint-review-page.test.tsx
    apps/web/tests/integration-ui/checkout-success-view.test.tsx
    apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx
    apps/web/tests/integration-ui/checkout-button.test.tsx

## Interfaces and Dependencies

This plan depends on `docs/programs/completed/2026-04-26-app-structure-refactor/program.md`, `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-11.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, `docs/ARCHITECTURE.md`, `docs/FRONTEND.md`, `docs/programs/README.md`, `docs/programs/active/index.md`, `docs/programs/completed/index.md`, the selected app compatibility files, `apps/web/config/product.ts`, and focused tests under `apps/web/tests`.
