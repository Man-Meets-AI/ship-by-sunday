---
title: Remove Starter Repo Invite Flow
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Remove the obsolete customer-facing private starter repository invite path while preserving generated Codebase delivery.
post_build_recap: The customer and operator private starter repository invite flow is gone, generated Codebase delivery remains intact, and the only retained backend artifact is the deprecated inert historical Convex table.
read_when:
  - Reviewing the removed starter repo invite flow.
  - Cleaning up the deprecated starterRepoAccess Convex table.
  - Validating generated Codebase delivery after starter-repo access removal.
  - Checking why old audit docs mention retired starter-repo access.
---

# Remove Starter Repo Invite Flow

This is a living execution plan for removing the obsolete private starter repository invite path from the customer-facing app and operator surface.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday now sells a customer-facing Codebase, not access to a private GitHub starter repository. A buyer should pay, enter the protected workspace, complete `/codebase`, and download the Codebase from `/review` without being asked for a GitHub username or waiting for a manual repository collaborator invite. After this work, `/settings` contains Codex and account management only, workspace-home and post-review lesson surfaces no longer mention starter-repo access, and no operator script promises to manually invite customers to `ParkerRex/ship-by-sunday-starter`.

The important boundary is that the private invite flow is not the same thing as the codebase compiler's internal repo-generation machinery. The compiler may still use files and function names containing "starter" to assemble the generated customer Codebase. This plan removes the invite/provisioning path only.

## Progress

- [x] 2026-05-04: Mapped the current customer path and confirmed the live app re-enabled `starterConfig.modules.starterRepo`.
- [x] 2026-05-04: Confirmed one ExecPlan is enough; this is one removal slice with a staged Convex cleanup, not a multi-plan Program.
- [x] 2026-05-04: Removed customer-visible starter repository access UI from settings, workspace home, and mission extras.
- [x] 2026-05-04: Removed obsolete starter repository access config, copy, scripts, and tests.
- [x] 2026-05-04: Removed the Convex public/internal access functions and left the remaining table inert with a deprecation comment.
- [x] 2026-05-04: Updated conflicting customer docs and design documentation. The older settings polish plan had already been moved out of `docs/exec-plans/active/` in this checkout.
- [x] 2026-05-04: Validated focused app tests, Codebase/review access tests, Convex codegen, import scans, docs/generated sync, plan lint, markdown lint, formatting, lint, typecheck, and diff whitespace. Authenticated browser proof was blocked by missing local E2E persona credentials.

## Surprises & Discoveries

The current public docs already say the legacy `starterRepo` module is off by default in `apps/web/content/docs/how-the-starter-works.mdx`, but the live product config in `apps/web/config/product.ts` sets `starterRepo: true`. That mismatch is why the screenshot can appear in `/settings`.

The generated Codebase path deliberately sets generated output module flags in `packages/codebase-compiler/src/repo-generation/render-template-overrides.ts`. That file uses the key `starterRepo: false` today. If the module key is removed from the app config type, the compiler override must be updated to stop emitting that key, but the repo-generation feature itself remains in scope for preservation, not deletion.

The `starterRepoAccess` Convex table may contain historical production or development data. Convex schema validation is tied to data at rest, so the first implementation should remove all app and operator reads and writes while leaving the table definition temporarily deprecated unless the implementer verifies the table can be safely dropped in the same deployment window.

During implementation, the stale settings polish ExecPlan named in the first draft of this plan was no longer present under `docs/exec-plans/active/`. It appears to have been moved to completed plans by unrelated work in the shared checkout. This removal slice therefore updated the active plan and customer-facing docs it owns, and did not modify the moved historical plan.

The broader reference scan found historical source-pack audit docs under `docs/ship-by-sunday/` and their generated mirrors under `docs/generated/ship-by-sunday-codebase/` still saying to preserve the GitHub username invite path. Those files are historical, but they are source instructions and generated customer output mirrors, so this implementation added explicit 2026-05-04 retirement notes and changed the stale rows to say the flow is removed.

## Decision Log

Decision: Use one ExecPlan rather than a Program.

Rationale: The work crosses UI, config, Convex, scripts, tests, and docs, but all changes serve one product decision: remove the private starter repo invite path. Splitting it into multiple active plans would add coordination overhead without creating independent deliverables.

Date: 2026-05-04

Decision: Remove the customer-facing and operator invite path, not the compiler's generated Codebase repo-generation machinery.

Rationale: Customers should receive a generated Codebase through `/review`. Internal code names that say "starter" are still part of the current repo-generation implementation and must not be confused with GitHub collaborator invite provisioning.

Date: 2026-05-04

Decision: Stage the Convex table deletion unless record counts are verified safe.

Rationale: Removing exported functions and callers kills the live behavior immediately. Dropping the table is schema cleanup that can be deployment-sensitive if historical documents exist. The safer first pass is to make the table inert and document a follow-up purge/drop step if needed.

Date: 2026-05-04

## Outcomes & Retrospective

The removal is complete. `/settings` now renders Codex connection and Account management only, workspace home and mission extras no longer render starter repository access, course copy no longer asks customers to clone or initialize the private starter repository, and the build-product iteration checklist points to the paid workspace and generated Codebase handoff instead of private template access.

The operator path is also gone. The root and app `starter-repo:*` scripts were removed, the local GitHub collaborator invite scripts were deleted, and no live setup path requires `GITHUB_STARTER_REPO_TOKEN`.

The backend public and internal Convex APIs were removed from `api.course` and `internal.course`. The `starterRepoAccess` schema table remains in `apps/web/convex/schema.ts` with a deprecation comment because production record counts were not verified in this slice; no live application or operator code reads or writes it. A future cleanup can purge and drop that table after hosted data is inspected.

Validation passed for focused UI/model tests, Codebase/review route and access tests, Convex code generation, import scans, docs/generated sync, plan lint, markdown lint, formatting, lint, typecheck, and whitespace checks. The authenticated Playwright local proof could not run because this checkout lacks the required E2E persona credentials or release persona file; the command failed during global setup before exercising `/settings`.

## Context and Orientation

The protected customer path is codebase-first. A paid generated-codebase buyer is routed to `/codebase`, completes the Codebase workspace, then receives the generated Codebase through `/review`. Existing-codebase buyers are routed to `/workspace/setup`. The private starter repository invite flow is separate: it asks for a GitHub username, writes a `starterRepoAccess` record, and relies on local operator scripts to invite the user to `ParkerRex/ship-by-sunday-starter`.

The current visible entry point is `apps/web/config/product.ts`, where `starterConfig.modules.starterRepo` is `true`. Settings reads that flag through `isStarterModuleEnabled("starterRepo")` in `apps/web/app/(workspace)/settings/_components/settings-page.tsx` and renders `StarterRepoAccessCard` from `apps/web/app/(workspace)/_components/starter-repo-access/`. Workspace home reads the same flag in `apps/web/app/(workspace)/_lib/workspace-home-model.ts` and `apps/web/app/(workspace)/_components/workspace-home/workspace-home-setup-cards.tsx`. Mission extras read it in `apps/web/app/(workspace)/_components/course/mission/components/mission/mission-extras-row.tsx`.

The backend path lives in `apps/web/convex/course/starterRepoAccess.ts`, is exported from `apps/web/convex/course.ts`, uses validators from `apps/web/convex/course/validators.ts`, and stores records in the `starterRepoAccess` table in `apps/web/convex/schema.ts`. The customer form calls `api.course.requestStarterRepoAccess`; the operator scripts call `course:listStarterRepoAccessQueue`, `course:recordStarterRepoProvisioningResult`, and `course:resetStarterRepoAccess`.

The operator path lives in root `package.json`, `apps/web/package.json`, `apps/web/scripts/starter-repo-access.mjs`, and `apps/web/scripts/lib/starter-repo-access.mjs`. Those scripts use `GITHUB_STARTER_REPO_TOKEN` and GitHub collaborator APIs. Once this plan is implemented, that token is no longer a required setup value for Ship by Sunday.

The generated Codebase path lives primarily under `packages/codebase-compiler` and must keep working. Files such as `packages/codebase-compiler/src/repo-generation/render-template-overrides.ts`, `render-starter-bootstrap`, `render-starter-project-onboarding`, and `render-starter-skills` may keep internal names containing "starter" unless customer-facing output says private GitHub repository access is part of delivery.

### In Scope

Remove the starter repository access card, form, status badge, body, record type, copy helpers, GitHub username validator, customer settings section, workspace-home setup card entry, mission extras card, and all tests dedicated only to that invite flow.

Remove `starterRepo` as a visible product module from `apps/web/config/product.ts` and update `apps/web/config/starter-selectors.ts`, workspace-home model types, tests, and compiler overrides so TypeScript no longer expects a `starterRepo` module key.

Remove starter repository invite operator scripts and package scripts from root `package.json` and `apps/web/package.json`. Remove script module declarations and unit tests that only validate those scripts.

Remove exported Convex functions for starter repo access from `apps/web/convex/course.ts`, remove their implementation file if no longer referenced, and remove related validators and document types. Leave the schema table deprecated on the first pass unless record counts and deployment constraints prove it can be safely dropped immediately.

Update docs and active plans that currently tell future contributors to preserve or polish the starter repository access path. At minimum, update `apps/web/content/docs/how-the-starter-works.mdx` so it says the legacy invite module has been removed rather than merely hidden, and update design documentation so the user-facing Settings change is recorded. If a historical plan has already been moved out of `docs/exec-plans/active/`, do not edit it as part of this slice.

### Out Of Scope

Do not remove the codebase compiler, Review download generation, generated Codebase packaging, root `DESIGN.md` generation, generated docs, prompt pack rendering, or repo-generation files merely because their internal names contain "starter".

Do not redesign Settings beyond removing the obsolete section and making the remaining Codex and Account sections read cleanly.

Do not change checkout intent routing, access entitlement, `/codebase`, `/review`, `/workspace/setup`, or `/workspace/choose` behavior except where tests need updated expectations because the starter repository module no longer exists.

Do not delete historical Convex data without an explicit verification step. If the table contains production data and deletion is desired, use a separate schema cleanup follow-up or record in this plan exactly how the data was purged and verified before dropping the table.

## Plan of Work

Start by deleting the customer UI entry points. In `apps/web/app/(workspace)/settings/_components/settings-page.tsx`, remove `StarterRepoAccessCard`, the starter module check, the conditional settings copy, and the `starter-repo-access` section. In `settings-page-nav.tsx`, remove the `starterRepoEnabled` prop and the Starter repository jump link. Settings should render Codex connection and Account only.

Then remove workspace and mission references. In `apps/web/app/(workspace)/_components/workspace-home/workspace-home-setup-cards.tsx`, remove the starter card import and `showStarterRepoCard` prop usage. In `apps/web/app/(workspace)/_lib/workspace-home-model.ts`, remove `starterRepo` from `moduleCopy`, module list construction, next steps, the `showStarterRepoCard` model field, and any type relationship that requires the `starterRepo` module key. In `apps/web/app/(workspace)/_components/course/mission/components/mission/mission-extras-row.tsx`, remove the starter card import and conditional grid logic so the bonus playlist remains.

Next remove config and UI implementation. Delete `apps/web/app/(workspace)/_components/starter-repo-access/`, `apps/web/config/starter-repo-access-copy.ts`, and `apps/web/lib/github-username.ts` after confirming no remaining imports. Remove `starterRepoConfig`, `starterConfig.modules.starterRepo`, and `starterRepo` entries from `productConfig` and `courseResourceConfig` in `apps/web/config/product.ts`. Update `apps/web/config/starter-selectors.ts` so module names are only the remaining modules.

Then remove backend and scripts. In `apps/web/convex/course.ts`, remove imports and exports for `getStarterRepoAccess`, `requestStarterRepoAccess`, `listStarterRepoAccessQueue`, `recordStarterRepoProvisioningResult`, and `resetStarterRepoAccess`. Delete `apps/web/convex/course/starterRepoAccess.ts` if no remaining code imports it. Remove `StarterRepoAccessDoc` from `apps/web/convex/course/types.ts` and starter-repo validators from `apps/web/convex/course/validators.ts`. Remove `starter-repo:*` scripts from root `package.json` and `apps/web/package.json`, then delete `apps/web/scripts/starter-repo-access.mjs` and `apps/web/scripts/lib/starter-repo-access.mjs`.

For the schema, first remove code paths that write `starterRepoAccess`. Leave the table in `apps/web/convex/schema.ts` as a deprecated inert table if record counts are unknown. Add a short comment above the table explaining that it is retained only for historical data during removal and has no live callers. If the implementer verifies that local and target hosted Convex deployments have no records, the table may be removed in the same slice and the verification evidence must be recorded in `Artifacts and Notes`.

Update tests after each deletion. Remove tests whose only purpose was starter repo access: `apps/web/tests/unit/starter-repo-access-card.test.tsx`, `apps/web/tests/integration-ui/starter-repo-access-form.test.tsx`, `apps/web/tests/unit/starter-repo-access.test.ts`, `apps/web/tests/unit/starter-repo-script.test.ts`, and `apps/web/tests/unit/github-username.test.ts`. Update settings, workspace home, mission extras, starter selectors, and compiler tests so they assert absence of starter repository access instead of preserving it.

Finally update docs and active plans. Update `apps/web/content/docs/how-the-starter-works.mdx` from "off by default" to "removed from the customer-visible protected app." Update `docs/exec-plans/active/2026-05-02-settings-page-polish.md` so its scope, progress, test commands, and purpose no longer mention the starter repo card or form. Search for current active docs that still tell contributors to preserve starter repo access and either update them or record why they are historical background.

## Milestones

Milestone 1 removes visible UI and config gating. At the end of this milestone, `/settings` no longer has a starter repository section, workspace home no longer offers starter repository access, mission extras no longer render the card, and `starterConfig.modules` no longer contains `starterRepo`. Run focused settings, workspace home, mission extras, and selector tests. Success means no customer-visible route can reach the screenshot that triggered this plan.

Milestone 2 removes the dead implementation and operator surface. At the end of this milestone, the starter-repo access component folder, copy helper, GitHub username helper, local invite scripts, package scripts, and dedicated tests are gone. Run import scans for `starter-repo-access`, `StarterRepoAccess`, `starterRepoAccess`, `GITHUB_STARTER_REPO_TOKEN`, and `starter-repo:`. Success means the only remaining "starter" references are either historical docs or internal generated Codebase machinery.

Milestone 3 removes Convex API access and stages schema cleanup. At the end of this milestone, no public or internal Convex function can create, list, update, reset, or sync starter repository access records. The table is either removed with recorded record-count evidence or retained with a deprecation comment and no live callers. Run Convex code generation if generated API references changed, then typecheck. Success means `api.course.requestStarterRepoAccess` and related functions no longer exist as callable application APIs.

Milestone 4 updates tests and docs. At the end of this milestone, affected tests assert the new product contract, customer docs say the invite path is removed, and design documentation records the Settings simplification. Run the focused tests, plan lint, markdown lint, formatting, lint, and typecheck. Success means a future contributor will not rediscover contradictory instructions that reintroduce the obsolete flow.

## Concrete Steps

Work from the repository root unless a command says otherwise.

Before editing, inspect current references:

    rg -n "StarterRepoAccess|starterRepoAccess|starter-repo-access|starterRepo|GITHUB_STARTER_REPO_TOKEN|starter-repo:" apps/web packages package.json docs/exec-plans/active --glob '!apps/web/convex/_generated/**'

Expected observation before implementation: references appear in settings, workspace home, mission extras, Convex course files, scripts, package scripts, and starter-repo tests.

After Milestone 1, run:

    bun run --cwd apps/web vitest run tests/unit/settings-page.test.tsx tests/unit/workspace-home-model.test.ts tests/unit/workspace-home-page.test.tsx tests/unit/mission-extras-row.test.tsx tests/unit/starter-selectors.test.ts

Expected observation: the focused tests pass after expectations are updated to the new contract. Settings tests should not look for `starter-repo-access`, workspace home should not expect `showStarterRepoCard`, and mission extras should not mock `StarterRepoAccessCard`.

After Milestone 2 and Milestone 3, run the import scan again:

    rg -n "StarterRepoAccess|starterRepoAccess|starter-repo-access|GITHUB_STARTER_REPO_TOKEN|starter-repo:" apps/web packages package.json --glob '!apps/web/convex/_generated/**'

Expected observation: no live application or package-script references remain. If `starterRepo` still appears, each remaining occurrence must be either removed, a deprecated inert schema comment, or a compiler-generated output key that is updated before completion.

If Convex generated API files need to refresh after removing exports, run from `apps/web`:

    bunx convex codegen

Expected observation: generated API references update cleanly without starting Convex local mode. Do not run Convex local mode.

Run docs and plan checks after updating this and related plans:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-remove-starter-repo-invite-flow.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-remove-starter-repo-invite-flow.md apps/web/content/docs/how-the-starter-works.mdx docs/ship-by-sunday/design-pack/documentation.md docs/generated/ship-by-sunday-codebase/design-pack/documentation.md docs/ship-by-sunday/repository-input-audit-2026-03-23.md docs/ship-by-sunday/repo-input-audit-2026-03-23.md docs/ship-by-sunday/openai-domain-contract-reconciliation-2026-03-23.md docs/generated/ship-by-sunday-codebase/repository-input-audit-2026-03-23.md docs/generated/ship-by-sunday-codebase/repo-input-audit-2026-03-23.md docs/generated/ship-by-sunday-codebase/openai-domain-contract-reconciliation-2026-03-23.md

Expected observation: the ExecPlan satisfies the plan contract and modified docs pass markdown lint.

Finish with the repo gates:

    bun run format
    bun lint
    bun typecheck

Expected observation: formatting completes, lint reports no warnings or errors, and typecheck/build succeeds.

## Validation and Acceptance

The change is accepted only when a customer with product access can open `/settings` and see Codex connection plus Account management without any starter repository section, GitHub username input, invite status badge, or "Open starter repo" button. Workspace home and mission or post-review surfaces must no longer advertise starter repository access. The product config must no longer expose a `starterRepo` module flag that future surfaces can accidentally re-enable.

The operator surface is accepted only when `bun run starter-repo:pending`, `bun run starter-repo:invite`, `bun run starter-repo:sync`, and `bun run starter-repo:reset` are no longer valid root scripts, and there is no `GITHUB_STARTER_REPO_TOKEN` requirement in live setup docs or scripts.

The backend cleanup is accepted only when no public or internal Convex function related to starter repository access remains callable from `api.course` or `internal.course`. If the `starterRepoAccess` table remains in schema for historical data, it must be explicitly commented as deprecated and inert, and this plan's `Outcomes & Retrospective` must state that a future table drop is the remaining cleanup. If the table is dropped, record the exact record-count or purge verification evidence.

The generated Codebase path is accepted only when `/codebase` and `/review` tests still pass and compiler tests do not lose the generated Codebase package. Removing the invite flow must not remove Review download generation.

### Test Commands

    bun run --cwd apps/web vitest run tests/unit/settings-page.test.tsx tests/unit/workspace-home-model.test.ts tests/unit/workspace-home-page.test.tsx tests/unit/mission-extras-row.test.tsx tests/unit/starter-selectors.test.ts
    bun run --cwd apps/web vitest run tests/unit/app-workspace-codebase-review-routes.test.tsx
    bun run --cwd apps/web vitest run tests/unit/course-access.test.ts
    rg -n "StarterRepoAccess|starterRepoAccess|starter-repo-access|GITHUB_STARTER_REPO_TOKEN|starter-repo:" apps/web packages package.json --glob '!apps/web/convex/_generated/**'
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-04-remove-starter-repo-invite-flow.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-remove-starter-repo-invite-flow.md apps/web/content/docs/how-the-starter-works.mdx docs/ship-by-sunday/design-pack/documentation.md docs/generated/ship-by-sunday-codebase/design-pack/documentation.md docs/ship-by-sunday/repository-input-audit-2026-03-23.md docs/ship-by-sunday/repo-input-audit-2026-03-23.md docs/ship-by-sunday/openai-domain-contract-reconciliation-2026-03-23.md docs/generated/ship-by-sunday-codebase/repository-input-audit-2026-03-23.md docs/generated/ship-by-sunday-codebase/repo-input-audit-2026-03-23.md docs/generated/ship-by-sunday-codebase/openai-domain-contract-reconciliation-2026-03-23.md
    bun run format
    bun lint
    bun typecheck

Manual verification is also useful for the final UI shape. Start the app with the normal dev command for this repo, sign in with a product-access account, open `/settings`, and confirm there is no Starter repository section or jump link at desktop and mobile widths. In this implementation, the authenticated Playwright proof was attempted but could not run because local E2E persona credentials were not configured.

## Idempotence and Recovery

All deletions should be ordinary source removals and test updates. If a deletion exposes a remaining import, restore nothing blindly; search for the import and decide whether that caller belongs to the obsolete invite flow or the generated Codebase path. Remove invite-flow callers and preserve compiler/generation callers.

If removing `starterConfig.modules.starterRepo` causes compiler or generated-output tests to fail, update the generated module override to stop emitting `starterRepo`. Do not reintroduce the module flag just to placate old tests.

If Convex codegen fails because generated files still reference deleted functions, inspect the remaining `api.course.*` callers and remove or update them. Do not switch to Convex local mode. Use hosted Convex dev only for record-count verification or migration proof.

If the `starterRepoAccess` table contains data, leave it in schema with a deprecation comment for this slice. That is a completed removal of the customer behavior, not a failure. A later schema cleanup can purge and drop the historical table once production data has been inspected.

Rollback for the customer UI is simple: restore the last committed state for the touched UI files. Rollback for schema deletion is not simple if data was purged, so do not purge data unless the verification and recovery notes are recorded before the destructive step.

## Artifacts and Notes

Record focused test output here as implementation proceeds. Useful snippets include the final `rg` scan showing no live invite-flow references, the settings screenshot note, and any Convex record-count verification.

Focused tests passed after UI/config removal:

    bun run --cwd apps/web vitest run tests/unit/settings-page.test.tsx tests/unit/workspace-home-model.test.ts tests/unit/workspace-home-page.test.tsx tests/unit/mission-extras-row.test.tsx tests/unit/starter-selectors.test.ts
    Test Files  5 passed (5)
    Tests  5 passed (5)

The final focused rerun also included the curriculum contract after removing the last private-template checklist copy:

    bun run --cwd apps/web vitest run tests/unit/settings-page.test.tsx tests/unit/workspace-home-model.test.ts tests/unit/workspace-home-page.test.tsx tests/unit/mission-extras-row.test.tsx tests/unit/starter-selectors.test.ts tests/contracts/curriculum-contract.test.ts
    Test Files  6 passed (6)
    Tests  9 passed (9)

Codebase/review route and access tests passed after preserving generated Codebase delivery:

    bun run --cwd apps/web vitest run tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/course-access.test.ts
    Test Files  2 passed (2)
    Tests  23 passed (23)

Convex code generation passed after deleting the removed course functions:

    bunx convex codegen
    Generated Convex functions and types.

The remaining live reference scan is intentionally limited to the deprecated inert schema table:

    rg -n "StarterRepoAccess|starterRepoAccess|starter-repo-access|starterRepo|GITHUB_STARTER_REPO_TOKEN|starter-repo:" apps/web packages package.json --glob '!apps/web/convex/_generated/**'
    apps/web/convex/schema.ts:92:	starterRepoAccess: defineTable({

Final live app/package copy scans found only expected removal-proof references:

    rg -n "starter repository|Starter repository|GitHub username|invite pending|Invite pending|ParkerRex/ship-by-sunday-starter|ship-by-sunday-starter|starter repo invite|private starter" apps/web packages package.json --glob '!apps/web/convex/_generated/**'
    apps/web/content/docs/how-the-starter-works.mdx:70:- the legacy private starter repository invite module has been removed from the customer-visible protected app
    apps/web/convex/schema.ts:90:	// Deprecated: retained temporarily for historical private starter repository
    apps/web/tests/unit/settings-page.test.tsx:39:		expect(markup).not.toContain("Starter repository");

The table is retained at `apps/web/convex/schema.ts` with this comment:

    // Deprecated: retained temporarily for historical private starter repository
    // invite records. No live app or operator path writes this table.

Plan, markdown, format, lint, typecheck, docs sync, and whitespace validation passed:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-remove-starter-repo-invite-flow.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-remove-starter-repo-invite-flow.md apps/web/content/docs/how-the-starter-works.mdx docs/ship-by-sunday/design-pack/documentation.md docs/generated/ship-by-sunday-codebase/design-pack/documentation.md docs/ship-by-sunday/repository-input-audit-2026-03-23.md docs/ship-by-sunday/repo-input-audit-2026-03-23.md docs/ship-by-sunday/openai-domain-contract-reconciliation-2026-03-23.md docs/generated/ship-by-sunday-codebase/repository-input-audit-2026-03-23.md docs/generated/ship-by-sunday-codebase/repo-input-audit-2026-03-23.md docs/generated/ship-by-sunday-codebase/openai-domain-contract-reconciliation-2026-03-23.md
    bun run docs:generated:check
    bun run format
    bun lint
    bun typecheck
    git diff --check

Authenticated local browser proof was attempted with an explicit base URL but failed in global setup because local release persona credentials are absent:

    PLAYWRIGHT_USE_LOCAL_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 bun run --cwd apps/web test:e2e:local-auth:default-ship
    Error: Missing E2E auth persona config. Set E2E_NON_ENTITLED_EMAIL/PASSWORD and E2E_ENTITLED_EMAIL/PASSWORD or provide a release persona file.

## Interfaces and Dependencies

The main app interfaces affected are `starterConfig.modules` in `apps/web/config/product.ts`, `StarterModuleName` and `isStarterModuleEnabled` in `apps/web/config/starter-selectors.ts`, `WorkspaceHomeModel` in `apps/web/app/(workspace)/_lib/workspace-home-model.ts`, and the Settings page component props in `apps/web/app/(workspace)/settings/_components/settings-page-nav.tsx`.

The Convex interfaces affected are the removed `api.course.getStarterRepoAccess`, `api.course.requestStarterRepoAccess`, `internal.course.listStarterRepoAccessQueue`, `internal.course.recordStarterRepoProvisioningResult`, and `internal.course.resetStarterRepoAccess` function references. All Convex functions must keep validators while they exist, and removed functions must not leave dangling imports in client components, tests, scripts, or generated API consumers.

The package-script interface affected is the removal of root and app-level `starter-repo:*` commands. No replacement command should be introduced because the product no longer promises manual private repository provisioning.

The generated Codebase interface must remain intact. Keep `packages/codebase-compiler` tests and Review download behavior passing. If the generated app config no longer accepts a `starterRepo` module key, update compiler-rendered config output to match the new app contract without changing the generated Codebase delivery model.
