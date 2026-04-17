---
title: Replace The QA Control Plane With A Dub-Style Thin CI Harness
status: active
created_at: 2026-04-15 15:46 EDT
completed_at: null
summary: Replace Ship by Sunday's current QA control plane and release-proof maze with a Dub-style thin CI surface, thin post-deploy verification surface, and a much smaller shared pricing and test helper layer.
post_build_recap: null
read_when: Open this when the goal is to delete the current QA pack, release-scope, persona-bootstrap, and billing-proof sprawl and replace it with a simpler Dub-style test and deployment harness.
---

# Replace The QA Control Plane With A Dub-Style Thin CI Harness

This is a living execution plan. It captures the full reset from the repository’s current release and QA orchestration model to a Dub-style model so a future coding agent can execute the migration without needing chat history or tribal knowledge.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Right now, shipping work in this repository is slower and riskier than it should be because the release path is wrapped in multiple overlapping layers: GitHub workflows that classify the diff, staging and production proof workflows that bootstrap their own environments, a QA control plane that inventories tests and builds scenario packs, multiple Stripe proof scripts, multiple persona sources, and several scripts whose only job is to keep the release machinery itself alive. The result is that correct code can still take hours to reach production because the workflow layer drifts independently from the application. After this change, the repository should behave like Dub in structure: one thin PR validation surface, one thin browser end-to-end surface, one thin post-deploy verification surface, and one small shared pricing and test-helper layer. A maintainer should be able to understand the shipping path by reading a few scripts and workflows instead of navigating a second product hidden inside `qa/`.

The change is successful when this repository no longer depends on `qa:run-pack`, release-scope classification, inventory CSV drift checks, staging alias surgery, or separate local-versus-hosted billing proof paths in order to ship. Instead, the repository should expose a small command surface and a small workflow surface that prove the real product behavior directly. A newcomer should be able to run the tests locally, open the deployment workflows, and understand the whole path without learning the current QA vocabulary.

## Progress

- [x] 2026-04-15 15:46 EDT — Researched the live repository and the sibling `~/Developer/dub` repository, then froze the first-pass scope for a full replacement plan rather than incremental cleanup.
- [x] 2026-04-15 16:03 EDT — Reviewed `~/Downloads/parker-cicd-blueprint` and the official Convex testing docs. Kept only the parts that reinforce the Dub pattern: one always-on PR workflow, deployment-driven smoke, and `convex-test` for fast offline Convex contract tests. Nightly regression is now treated as optional temporary quarantine only, not the target state.
- [x] 2026-04-15 16:31 EDT — Repaired the plan to better match the new ExecPlan skill contract by adding explicit scope boundaries, a sharper deletion map, and the required `### Test Commands` subsection under validation.
- [x] 2026-04-15 16:36 EDT — Refreshed the plan against the current worktree after large manual deletions. The repo no longer contains many of the old workflow, planning, and QA-skill surfaces, which means the implementation can move faster than the original first draft assumed.
- [x] 2026-04-15 17:18 EDT — Replaced the root and `apps/web` command surface with the planned thin set. Root validation now centers on `lint`, `typecheck`, `test`, `test:contracts`, `build`, and `test:e2e`; the old `qa:*`, `test:e2e:sandbox:*`, `test:e2e:local-auth:*`, and `test:smoke` surfaces are gone from normal operation.
- [x] 2026-04-15 17:24 EDT — Replaced the workflow layer with a thin three-file set: `.github/workflows/pr.yml`, `.github/workflows/deployment-smoke.yml`, and `.github/workflows/convex-production-deploy.yml`. The old workflow directory had already been manually cleared in the worktree, so this step was a fresh rebuild instead of a piecemeal edit.
- [x] 2026-04-15 17:31 EDT — Collapsed the browser and billing helper surface by deleting the authenticated sandbox Playwright lane, deleting the hosted/local Stripe proof scripts, and adding an offline Convex contract suite with `convex-test`. The deployment smoke lane now owns the real checkout-route proof against the deployed URL, while PR CI stays deterministic.
- [x] 2026-04-15 17:35 EDT — Deleted the QA control-plane runtime and checked-in bookkeeping artifacts.
- [x] 2026-04-15 17:18 EDT — Finished the Dub-style location shift: browser smoke now lives under `apps/web/playwright/`, shared jsdom setup now lives at `apps/web/tests/setupTests.ts`, starter-generated testing docs now live under `apps/web/tests/` and `apps/web/playwright/`, and the root `qa/` folder is gone entirely.
- [x] 2026-04-15 17:44 EDT — Reorganized `apps/web/tests` into domain folders such as `auth/`, `blueprint-flow/`, `checkout/`, `course/`, `observability/`, and `workspace/`. Vitest now selects non-unit lanes by filename suffix (`.integration`, `.ui`, `.contract`, `.convex-contract`) instead of by directory, shared helpers now live under `apps/web/tests/utils/`, and live docs plus generated starter surfaces now describe the domain-first layout.
- [x] 2026-04-15 17:56 EDT — Removed the last live stale references and legacy test-script surfaces: `apps/web/package.json` no longer exposes `test:unit` or `test:integration*`, the docs spine (`docs/index.md`, `ARCHITECTURE.md`, `RELIABILITY.md`, `QUALITY_SCORE.md`, `SECURITY.md`, `FRONTEND.md`, `DESIGN.md`, `PRODUCT_SENSE.md`) now describes Ship by Sunday instead of the unrelated worker runtime, and the starter-generator guidance now points at real current skills instead of dead names like `$qa-team`.
- [x] 2026-04-15 19:44 EDT — Upgraded the Playwright lane from request-level smoke on `next dev` to a production-backed public browser lane. `bun run test:e2e` now boots `next start` by default, the specs are split under `apps/web/playwright/public/`, the PR workflow prebuilds before browser execution, and both browser workflows now upload Playwright reports.
- [ ] Prove the new harness in GitHub Actions, then record the final removed surfaces and any required GitHub or Vercel settings changes. Local proof is complete through `format`, `lint`, `typecheck`, `test`, `test:contracts`, `build`, and the new production-backed `test:e2e`, but GitHub-hosted proof is still blocked until the new workflow files exist on a pushed branch or the default branch.

## Surprises & Discoveries

The biggest discovery from repo inspection is that Dub is not “better because it tests less.” Dub is better because it keeps the workflow layer thin. Its important logic lives in a few real helpers: app-local test harness files under `apps/web/tests/utils/`, one Playwright seed, and one shared pricing source of truth in `packages/utils`. Its workflows mostly invoke ordinary package scripts. In contrast, this repository has built a second system around the app: `qa/scripts/run-pack.mjs`, `qa/scripts/detect-release-scope.mjs`, `qa/scripts/validate.mjs`, `qa/scripts/generate-test-inventory.mjs`, `qa/scripts/personas.mjs`, the `dev-staging-proof.yml` and `production-release-proof.yml` workflow pair, and multiple Stripe and Convex coordination scripts. The pain is architectural, not just procedural.

Repo inspection also found concrete drift that proves the current control plane is already decaying. `qa/scripts/run-pack.mjs` still referenced a deleted legacy blueprint redirect test, `packages/blueprint-presentation` still had a test suite that the root workflows did not clearly exercise, and `apps/web/package.json` still exposed `test:smoke` even though it was only an alias for `test:contracts`. The current system was not merely complex; parts of it were already stale.

The Convex testing docs were useful because they are much simpler than the current repository. The `convex-test` guide recommends keeping backend logic tests fast and local with a mocked Convex backend inside Vitest, and the Convex CI guide only recommends running the test suite in GitHub Actions. That supports the Dub-style direction here: keep PR CI cheap and mostly offline, and do not rebuild the current release-scope or proof-pack machinery around Convex.

The worktree changed materially after the first draft of this plan. A large manual deletion pass has already removed many of the old workflow and documentation surfaces, including the old release-proof workflow files, many legacy plan files, the old `.plans/` tree, and several agent skill artifacts. That means the migration is no longer starting from a fully intact control plane. The plan should now assume a faster cutover, but it must still verify that the deleted surfaces were replaced by something smaller rather than simply vanished without a working path.

One additional discovery from implementation is that the authenticated sandbox browser lane was the wrong abstraction to preserve at all. It coupled Playwright to ignored persona files, hosted Convex state, Clerk env parity, and Stripe UI behavior. The simpler permanent replacement is two-layered: keep PR browser proof limited to deterministic public smoke, and move checkout/access protection into direct route tests plus `convex-test` contract coverage. The deployed smoke workflow can still hit the real checkout-session creation endpoint without dragging those dependencies into every local or PR run.

The domain reorg exposed one real path-coupling bug instead of just cosmetic churn. The moved Convex contract test still used the old `import.meta.glob("../../../convex/**/*.*s")` pattern from its former nested directory, which meant `convex-test` could no longer see the `_generated` directory after the move. The permanent fix was to keep the domain folder move and correct the glob to `../../convex/**/*.*s` rather than backing the file out of the domain layout. That is a useful reminder that this migration had to remove path assumptions, not only rename folders.

There is one repo-contract surprise that still needs to be acknowledged. The new planning skills point at `docs/exec-plans/PLANS.md` as the canonical contract, but that file does not exist in this checkout right now. The compatibility file `docs/PLANS.md` routes readers toward `docs/exec-plans/PLANS.md`, but the target is missing. This plan therefore follows the newer skill contract directly and uses the active `docs/exec-plans/` location, but the missing canonical file is itself a repo hygiene bug that should be cleaned up separately.

Evidence captured during the research pass:

    Dub workflows of interest:
    - .github/workflows/playwright.yaml
    - .github/workflows/e2e.yaml
    - .github/workflows/prettier.yaml

    Ship by Sunday workflows of interest:
    - .github/workflows/ci.yml
    - .github/workflows/dev-staging-proof.yml
    - .github/workflows/production-release-proof.yml
    - .github/workflows/convex-production-deploy.yml
    - .github/workflows/sandbox-e2e-nightly.yml

    Known stale reference:
    - qa/scripts/run-pack.mjs still called a deleted legacy blueprint redirect test

## Decision Log

Decision: treat this initiative as a full replacement, not a compatibility-preserving simplification.
Rationale: the user explicitly wants the current system removed, and the current pain comes from the existence of the control plane itself rather than from one bad script.
Date: 2026-04-15

Decision: match Dub structurally, not literally.
Rationale: this repository uses Bun and Convex while Dub uses pnpm, Prisma, and a different deployment model. The correct goal is to copy Dub’s pattern of thin workflows and thin shared helpers, not to copy its exact commands or infrastructure.
Date: 2026-04-15

Decision: delete the QA control plane as a release gate instead of preserving it behind aliases.
Rationale: the files under `qa/` currently function as a second orchestration system with their own state, vocabulary, and drift modes. Renaming the layer would preserve the real problem.
Date: 2026-04-15

Decision: collapse the public test command surface to a few top-level commands.
Rationale: Dub’s surface is understandable because it mostly exposes `test`, `test:e2e`, and ordinary build commands. This repository’s many `qa:*`, `test:e2e:sandbox:*`, `test:e2e:local-auth:*`, and billing-pack wrappers make the workflow harder to reason about than the app itself.
Date: 2026-04-15

Decision: replace current push-triggered staging and production proof with deployment-driven verification wherever possible.
Rationale: Dub’s strongest pattern is that deployed-app verification happens after a real deployment event, against the real deployment URL. That removes a large amount of alias-wait and environment-bootstrap logic from GitHub Actions.
Date: 2026-04-15

Decision: keep one minimal pricing source of truth and one minimal test-helper surface.
Rationale: Dub centralizes pricing in one shared package file and keeps test harnesses app-local. This repository currently spreads billing proof and persona logic across too many files. The reset must reduce those boundaries, not just move them around.
Date: 2026-04-15

Decision: use official Convex guidance only where it keeps the Dub-shaped design simple.
Rationale: the only strong Convex-specific addition is `convex-test` for fast offline contract coverage of Convex functions in PR CI. The Convex docs do not justify preserving the current QA pack, release-scope, or persona orchestration.
Date: 2026-04-15

Decision: keep at most one minimal Convex deployment workflow if the production architecture still requires a separate backend deploy step.
Rationale: the user explicitly confirmed that one Convex piece is fine. The goal is still a Dub-style thin workflow surface, so any surviving Convex workflow must stay small and must not reintroduce the current control plane.
Date: 2026-04-15

Decision: make domain folders the primary organization mechanism inside `apps/web/tests`, and use filename suffixes only for Vitest runtime selection.
Rationale: Dub’s tests are readable because folders describe product areas. This repository still needs multiple runtimes (`node`, `jsdom`, `edge-runtime`), but that concern belongs in filenames and config, not as the dominant directory taxonomy.
Date: 2026-04-15

Decision: keep cross-feature lesson and prompt coverage grouped under `apps/web/tests/workbenches/`.
Rationale: those tests span multiple lesson modes and internal builder surfaces, so forcing them into arbitrary technical buckets or scattering them across unrelated feature folders would make ownership less clear. `workbenches` is a real product area here, not a test layer.
Date: 2026-04-15

## Outcomes & Retrospective

The worktree outcome is now concrete. The runtime shipping path is smaller and easier to explain: the root surface is `format`, `lint`, `typecheck`, `test`, `test:contracts`, `build`, and `test:e2e`; the workflow surface is `.github/workflows/pr.yml`, `.github/workflows/deployment-smoke.yml`, and `.github/workflows/convex-production-deploy.yml`; the old root `qa/` folder is gone entirely; browser smoke now lives under `apps/web/playwright/`; shared jsdom setup and app-local test docs live under `apps/web/tests/`; the old authenticated sandbox Playwright lane is gone; the old hosted/local Stripe proof scripts are gone; and checkout/access protection now lives in route integration tests plus offline `convex-test` coverage.

The remaining migration gap inside `apps/web/tests` is also closed. The tree is now domain-first instead of layer-first: checkout tests live together under `tests/checkout/`, access gating under `tests/product-access/`, auth flows under `tests/auth/`, blueprint coverage under `tests/blueprint-flow/`, public marketing coverage under `tests/marketing/`, and so on. The runtime split still exists, but it is encoded in suffixes like `.ui.test.tsx` and `.integration.test.ts`, which keeps the folders aligned with product ownership while preserving the existing Vitest project boundaries.

The shared test utility surface now matches the app-local Dub pattern more honestly. Instead of leaving reusable fixtures buried inside a former `integration-ui/` bucket, the blueprint workspace builders now live at `apps/web/tests/utils/blueprint-flow-fixtures.ts`, and identity-shell rendering now lives at `apps/web/tests/utils/render-in-identity-layout.tsx`. The key change is not the number of helpers. It is that shared helpers now have one obvious home inside the app rather than being stranded inside a layer directory.

The last cleanup pass also fixed the surrounding contracts instead of leaving them as documentation debt. The app package no longer advertises the old `test:unit` and `test:integration*` scripts, the root-facing docs now route to the real Ship by Sunday surfaces instead of the unrelated worker-runtime docs they had drifted toward, and the starter-generator prompt and onboarding files no longer mention dead skill names. That matters because the test migration would still feel half-done if the repo kept teaching people to use removed commands or unrelated docs.

The implementation also confirmed one important deletion-pass recovery. The branch had already deleted `.agents/skills/QA-Browser/references/internal-test-accounts.json`, but `apps/web/scripts/ensure-clerk-test-user.mjs` still depended on it. Restoring the exact deleted file would have rebuilt the wrong architecture, so the minimal permanent fix was to move the account definitions into a repo-local runtime file at `apps/web/scripts/data/clerk-test-accounts.json`. That keeps the surviving Clerk helper scripts working without reviving the deleted QA skill surface.

The remaining gap is GitHub-hosted proof. Local validation is green, but `gh workflow run pr.yml` and `gh workflow run deployment-smoke.yml -f url=https://www.man-meets-ai.com` both returned `HTTP 404` because those workflow files do not exist on the default branch yet. That is expected until the branch is pushed or merged. The repo-side work is ready for that cutover, but this plan should stay active until at least one remote run of each new workflow succeeds.

## Context and Orientation

### In Scope

This plan owns the pull-request workflow shape, the post-deploy verification shape, the root and `apps/web` test command surface, the browser-bootstrap helpers, the Stripe and pricing proof helpers, the Convex test strategy for PR CI, the minimal surviving Convex deploy workflow, and the deletion of the current QA control plane as a runtime gate. It also owns the GitHub workflow files, the app and root `package.json` scripts, and the checked-in docs that describe the release path.

### Out Of Scope

This plan does not redesign the product itself. It does not change the core business behavior of checkout, post-checkout recovery, or product access beyond what is required to make those paths testable under the new harness. It does not migrate the repository from Bun to pnpm. It does not copy Dub’s database stack, service containers, or package layout literally. It also does not preserve today’s QA control plane in a renamed form. If a file exists only to support the current pack, inventory, or release-scope system, the default posture is deletion, not migration.

The current release and test path is spread across several layers. The standing code CI is in `.github/workflows/ci.yml`. It runs a dedicated QA control plane job, then separate static, CLI, integration, and browser-smoke jobs. The staging and production release proof lives in `.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml`. Those workflows classify changed files with `qa/scripts/detect-release-scope.mjs`, pull environment files from Vercel into `apps/web/.env.local` or `apps/web/.env.production`, write `qa/personas.local.json`, write `$HOME/.convex/config.json`, optionally sync hosted Convex dev, and then execute `qa:run-pack`. The billing lane is extended again through `qa/scripts/lib/billing-integration-step-planner.mjs`.

The current QA control plane is the `qa/` directory itself. The important files are `qa/scripts/run-pack.mjs`, `qa/scripts/validate.mjs`, `qa/scripts/generate-test-inventory.mjs`, `qa/scripts/personas.mjs`, `qa/scripts/wait-for-vercel-production-deployment.mjs`, `qa/scripts/wait-for-host.mjs`, `qa/scripts/ship.mjs`, `qa/test-inventory.csv`, `qa/coverage.csv`, `qa/journeys.csv`, and the run reports under `qa/runs/`. These files are not ordinary tests. They are an orchestration and bookkeeping system wrapped around the tests.

The application tests themselves are simpler than the surrounding control plane suggests. `apps/web/vitest.config.ts` still defines the four important Vitest projects: `unit`, `contracts`, `integration`, and `integration-ui`. The difference now is that project selection is suffix-based rather than directory-based, so domain folders stay readable while the runtime split stays explicit. `apps/web/playwright.config.ts` now defines only the `browser-e2e` Playwright project, backed by a production build plus `next start` unless a prebuilt app is explicitly reused. The actual app-level billing and access logic still lives in `apps/web/features/checkout/server/checkout-session.ts`, `apps/web/features/checkout/server/checkout-session-recovery.ts`, `apps/web/features/product-access/server/product-access.ts`, `apps/web/convex/checkoutClaims.ts`, `apps/web/convex/checkoutClaimsActions.ts`, and `apps/web/convex/access/model.ts`.

The pricing and billing proof surface is currently fragmented. The scripts `apps/web/scripts/local-stripe-doctor.mjs`, `apps/web/scripts/local-stripe-webhook.mjs`, `apps/web/scripts/dev-stripe-listen-ready.mjs`, `apps/web/scripts/verify-local-stripe-checkout.mjs`, `apps/web/scripts/verify-hosted-stripe-checkout.mjs`, `apps/web/scripts/verify-managed-stripe-env.ts`, `apps/web/scripts/lib/hosted-stripe-checkout-proof.mjs`, `apps/web/scripts/lib/stripe-cli-project.mjs`, and `apps/web/scripts/lib/convex-product-access-grant.mjs` all participate in one way or another in validating checkout and access. Dub’s equivalent shape is much smaller: one shared pricing definition in `packages/utils/src/constants/pricing/pricing-plans.tsx`, a small set of test utils under `apps/web/tests/utils/`, and one small Playwright seed.

The target architecture in plain language is as follows. A “thin PR workflow” means one always-on GitHub workflow that runs on pull requests, installs dependencies once, runs the repository’s ordinary test and build commands, and branches inside jobs if it wants to skip heavier work. It does not create stuck required checks by being skipped at the workflow trigger level. A “thin post-deploy verification workflow” means one GitHub workflow that is triggered by a successful deployment event and verifies the real deployed application directly at its deployment URL. A “nightly regression workflow” is not part of the target Dub-like architecture. It is only a temporary quarantine lane for any slow browser coverage that cannot be made deterministic immediately during the migration. A “thin helper layer” means a very small set of repository files that define prices, seed test data, and provide shared test clients or cleanup helpers, with no separate reporting or inventory database checked into the repo.

The concrete deletion target is broad on purpose. The current control plane files that should be presumed removable unless the implementation proves otherwise are the workflows `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/sandbox-e2e-nightly.yml`; the root scripts `qa:inventory:sync`, `qa:inventory:check`, `qa:validate`, `qa:convex:sync-hosted-dev`, `qa:personas:prepare`, `qa:personas:reset`, `qa:ship`, `qa:team`, and `qa:run-pack`; the runtime scripts `qa/scripts/run-pack.mjs`, `qa/scripts/validate.mjs`, `qa/scripts/generate-test-inventory.mjs`, `qa/scripts/personas.mjs`, `qa/scripts/ship.mjs`, `qa/scripts/team.mjs`, `qa/scripts/detect-release-scope.mjs`, `qa/scripts/wait-for-vercel-production-deployment.mjs`, `qa/scripts/wait-for-host.mjs`, `qa/scripts/sync-hosted-convex-dev.mjs`, and the files under `qa/scripts/lib/`; and the checked-in bookkeeping artifacts `qa/test-inventory.csv`, `qa/coverage.csv`, `qa/journeys.csv`, and the run reports under `qa/runs/`. If a file from that group survives, the implementation must explain exactly why it still belongs in the Dub-style design.

## Plan of Work

The work should proceed in four broad moves. First, freeze the target architecture and simplify the command surface so the repository has one obvious way to run tests locally and in CI. This means deleting or deprecating wrapper scripts before deleting workflows, because the workflows should ultimately call the new commands rather than the current pack system. Second, replace the current GitHub workflow set with a Dub-style shape: one always-on pull-request workflow that validates code against local or ephemeral infrastructure, one deployment-driven smoke workflow that verifies the real deployed host, and one minimal backend deployment workflow only if the Convex architecture still requires it. If some existing browser coverage cannot be made deterministic immediately, it may live temporarily in a non-required nightly workflow, but the target state is to eliminate the need for that lane. Third, shrink the shared helper layer by collapsing persona handling, Stripe proof logic, and Convex mutation helpers into smaller modules while deleting the QA control plane and its inventory/report artifacts. Where Convex-specific backend tests remain important in PR CI, use `convex-test` inside Vitest rather than hosted Convex orchestration. Fourth, run local and GitHub validation, then clean up the remaining docs and branch protections so the repo and the platform settings agree.

The sequence matters. Deleting `qa/` too early would strand the current workflows before the new commands and workflows exist. Rewriting the workflows before simplifying the command surface would just preserve the current complexity one level lower. The correct order is to create the smaller path first, switch the workflows to it, then delete the old path once the new path proves itself.

## Milestones

Milestone 1 resets the repository command surface. At the end of this milestone, the repo exposes a Dub-style top-level interface: a small number of commands for build, lint, typecheck, unit tests, contract tests, and browser tests. The important files are `package.json`, `apps/web/package.json`, and any package-level `package.json` files whose tests should still be reachable from the root. The end state should remove pack-oriented, environment-oriented, and persona-oriented commands from the public surface. Success is proven when a newcomer can read the root scripts and understand how to validate the app without learning `qa:*`, `test:e2e:sandbox:*`, or `test:e2e:local-auth:*`.

Milestone 2 replaces the workflow layer. At the end of this milestone, `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/sandbox-e2e-nightly.yml` are gone or have been reduced to the new minimal workflow set. The target shape is one always-on pull-request workflow with stable required job names, one deployment-driven smoke workflow that verifies the deployed app, and one minimal Convex production deploy workflow only if the architecture still cannot ride on platform deployment events alone. A nightly workflow may exist briefly during migration only if some remaining browser coverage cannot yet be made deterministic. Success is proven when the workflow directory is materially smaller and each remaining workflow can be explained in one paragraph.

Milestone 3 collapses pricing, billing proof, personas, and test helpers into a thin shared layer. At the end of this milestone, the application has one pricing source of truth, one small test-helper surface, one small browser-auth bootstrap surface, and one billing-proof surface. `qa/scripts/lib/billing-integration-step-planner.mjs`, `qa/scripts/personas.mjs`, `qa/scripts/lib/personas.mjs`, the multiple Stripe proof scripts, and any duplicate Convex helper logic should either be deleted or collapsed into the new layer. Where backend logic needs direct contract coverage, it should use `convex-test` in ordinary Vitest projects instead of hosted-environment orchestration. Success is proven when the number of helper modules participating in checkout and access proof is dramatically smaller and the remaining files have clear domain boundaries.

Milestone 4 deletes the QA control plane and stale artifacts. At the end of this milestone, `qa/scripts/run-pack.mjs`, `qa/scripts/validate.mjs`, `qa/scripts/generate-test-inventory.mjs`, `qa/scripts/ship.mjs`, the inventory and coverage CSVs, the run reports under `qa/runs/`, and the checked-in drift artifacts are removed unless a specific file remains as plain documentation rather than runtime infrastructure. Success is proven when shipping and CI no longer depend on any checked-in inventory or report files.

Milestone 5 proves the new path end to end. At the end of this milestone, the replacement command surface and replacement workflows have been run locally and in GitHub Actions, the minimal docs are updated, and the remaining external settings changes are recorded. Success is proven when a real test commit can move through the new path without touching any of the removed `qa:` machinery.

## Concrete Steps

Work from the repository root.

Start by rewriting the command surface. Inspect `package.json`, `apps/web/package.json`, `packages/blueprint-compiler/package.json`, `packages/blueprint-presentation/package.json`, and `packages/ship-by-sunday-cli/package.json`. The target state is that the root exposes a small number of ordinary scripts such as build, lint, typecheck, test, and test:e2e. Keep internal complexity behind implementation files rather than script names. Remove or deprecate the current public entrypoints that exist only to feed the control plane, especially `qa:*`, `test:smoke`, `test:e2e:sandbox:*`, and `test:e2e:local-auth:*`, unless a specific one is required briefly during transition.

The replacement root script surface should be intentionally small. The expected steady-state names are `lint`, `typecheck`, `test`, `test:contracts`, `build`, and `test:e2e`. The app-level scripts under `apps/web/package.json` may still be more granular internally, but the root should stop advertising the current pack and environment matrix as the primary interface. If package-level tests for `packages/blueprint-compiler`, `packages/blueprint-presentation`, or `packages/ship-by-sunday-cli` still matter, pull them into the new root `test` or `test:contracts` path instead of leaving them behind as hidden islands.

After the command surface is frozen, rewrite the workflow surface. Inspect `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/sandbox-e2e-nightly.yml`, and `.github/workflows/convex-production-deploy.yml`. Create the replacement files before deleting the old ones. The intended replacement shape is one always-on pull-request workflow whose required jobs have stable names and one deployment-driven workflow that runs on `deployment_status` and verifies the real deployed URL directly. Do not create required workflows that are skipped entirely at the trigger level. If Convex still needs a separate deployment step, keep one minimal workflow for it, but do not let it recreate the current proof-pack structure. Keep a nightly workflow only if a specific remaining browser lane cannot yet be made deterministic, and treat that workflow as temporary.

The intended workflow set after cutover is concrete. One workflow should own PR checks and should be the only required repository-managed workflow surface besides the host deployment check. One workflow should own preview or deployed smoke by reacting to deployment status. One Convex production deploy workflow may remain if the repo still cannot bind backend deploys to the host deployment path cleanly. No other workflow should exist only to compensate for test classification, release-scope routing, persona preparation, or pack planning. Those are the exact responsibilities being deleted.

Then collapse the helper layer. Inspect `apps/web/playwright.config.ts`, `apps/web/tests/e2e/global-setup.ts`, `apps/web/tests/e2e/auth-state.ts`, `apps/web/scripts/verify-local-stripe-checkout.mjs`, `apps/web/scripts/verify-hosted-stripe-checkout.mjs`, `apps/web/scripts/verify-managed-stripe-env.ts`, `apps/web/scripts/local-stripe-doctor.mjs`, `apps/web/scripts/local-stripe-webhook.mjs`, `apps/web/scripts/lib/hosted-stripe-checkout-proof.mjs`, `apps/web/scripts/lib/stripe-cli-project.mjs`, and `apps/web/scripts/lib/convex-product-access-grant.mjs`. Create one small set of helpers that own pricing configuration, one small set of helpers that own browser bootstrap, and one small set of helpers that own any required direct test mutations. If the app needs Convex-specific contract tests, add them to ordinary Vitest via `convex-test` and keep them in PR CI. Delete the duplicates after the replacement helpers land.

The point of this collapse is to stop treating proof as a separate application. Browser auth bootstrap should become one small path, not a persona framework. Billing proof should become one clear path, not a local doctor plus local listen plus local verify plus hosted verify plus pack planner plus release-scope matrix. Convex mutations needed for test setup should become one helper surface or one `convex-test` suite, not several scripts that each know part of the same story.

After the new workflows and helpers are in place, delete the control plane. Remove `qa/scripts/run-pack.mjs`, `qa/scripts/validate.mjs`, `qa/scripts/generate-test-inventory.mjs`, `qa/scripts/ship.mjs`, `qa/scripts/detect-release-scope.mjs`, `qa/scripts/lib/release-scope.mjs`, `qa/scripts/lib/billing-integration-step-planner.mjs`, and any CSV or run-report artifacts that only existed to support that machinery. If a `qa/` directory remains, it should only contain ordinary documentation that explains the new flow in plain language.

Do not preserve the current `qa/` system behind friendly wrappers. If the migration still leaves `bun run qa:run-pack` or `qa/scripts/run-pack.mjs` in place as part of normal operation, then the migration has failed its main goal. The only acceptable surviving `qa/` content is plain documentation that explains how the new smaller workflow surface maps to the application tests.

Use these commands as the implementation validation spine while the migration is happening:

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run format
    bun run lint
    bun run typecheck

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run test

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run test:e2e

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run test:contracts

During the transition, the exact scripts behind `bun run test`, `bun run test:contracts`, and `bun run test:e2e` may still be evolving, but the migration is not complete until those commands exist and the workflows call them directly. The intended steady-state behavior is simple: `bun run test` covers the cheap required path, `bun run test:contracts` covers provider-facing and Convex contract coverage with `convex-test` where appropriate, and `bun run test:e2e` covers the small deterministic browser layer that is good enough to live in the normal workflow. If any extra browser coverage remains too flaky, it should be quarantined temporarily rather than normalized as part of the design.

Once the replacement workflows exist, validate them with GitHub Actions instead of relying only on local success:

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    gh workflow list
    gh workflow run <new_pr_workflow_file> --ref fix-tests
    gh run list --limit 10

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    gh workflow run <new_post_deploy_workflow_file> --ref main
    gh run list --limit 10

Expected observations during the final phase are simple. The pull-request workflow should read like an ordinary CI job rather than a release orchestra. The post-deploy workflow should verify the deployed URL directly instead of waiting on aliases, generating reports, or selecting packs from changed-file classifiers.

## Validation and Acceptance

This plan is complete only when the repository feels Dub-like in operation, not merely when some files are renamed. Acceptance requires all of the following observable outcomes.

First, the root command surface must be small and understandable. A newcomer should be able to run build, lint, typecheck, unit tests, contract tests, and browser tests without using `qa:*` commands or pack-oriented commands. Second, the workflow surface in `.github/workflows/` must be materially smaller than it is today. The surviving workflows must be understandable without reading `qa/` scripts and must reflect the simple split endorsed by Dub and reinforced by the Convex testing docs: cheap PR validation and deployment-driven smoke, plus a minimal Convex deploy workflow if needed. Nightly regression is acceptable only as a temporary quarantine, not as the target architecture. Third, the post-deploy verification path must test the deployed application directly instead of rebuilding the current staging and production proof maze in smaller pieces. Fourth, the billing and pricing helper surface must be smaller, with one clear source of truth for pricing configuration and one clear proof path for checkout and access. Fifth, the old QA control plane files must be deleted or demoted to plain documentation.

Before marking the plan done, run the repository contract checks:

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run format
    bun run lint
    bun run typecheck

Those three commands are mandatory because the root `AGENTS.md` contract says work is not complete until they pass. In addition, run the new top-level test commands and the replacement workflows. The final acceptance evidence should show the new command surface, the reduced workflow list, and successful local plus GitHub execution against the replacement harness.

### Test Commands

These are the minimum commands that must exist and must pass before the cutover can be considered complete:

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run format

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run lint

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run typecheck

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run test

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run test:contracts

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run build

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run test:e2e

The final GitHub-side proof must also include one successful run of the replacement pull-request workflow and one successful run of the replacement deployment-driven smoke workflow. If a temporary nightly workflow still exists at that point, it must be explicitly labeled non-required and temporary in both the workflow file and the docs.

## Idempotence and Recovery

This migration must be safe to execute in slices. Create the new commands before deleting the old ones. Create the new workflows before removing the old workflow files. Create the replacement pricing, browser-bootstrap, and billing-proof helpers before deleting the duplicated scripts. This lets the repo validate at each stage and gives a clear fallback if a milestone fails.

If a milestone fails, stop and repair that milestone before deleting more of the old surface. If the replacement pull-request workflow is not green yet, do not delete the old CI workflow. If the replacement post-deploy workflow cannot verify the deployed app yet, do not delete the current proof workflows. If the consolidated Stripe or persona helpers are not yet sufficient, keep the old scripts until the new path is proven, then remove them in one follow-up commit so the diff stays understandable.

When cleaning up artifacts, prefer deletion over redirection. This initiative is explicitly about removing the current system, so do not preserve the old `qa:` commands as long-lived aliases unless a short transition period is needed to keep the branch working. After each deletion wave, rerun the full validation commands so the working tree can be safely resumed by another agent.

## Artifacts and Notes

The research baseline for this plan is the following comparison.

    Dub keeps pricing in packages/utils/src/constants/pricing/pricing-plans.tsx
    Dub keeps app test harnesses in apps/web/tests/utils/
    Dub keeps browser bootstrap small in apps/web/playwright/seed.ts and apps/web/playwright.config.ts
    Dub workflows are mainly .github/workflows/playwright.yaml and .github/workflows/e2e.yaml

    Ship by Sunday currently spreads release logic across:
    - .github/workflows/ci.yml
    - .github/workflows/dev-staging-proof.yml
    - .github/workflows/production-release-proof.yml
    - .github/workflows/convex-production-deploy.yml
    - .github/workflows/sandbox-e2e-nightly.yml
    - qa/scripts/run-pack.mjs
    - qa/scripts/validate.mjs
    - qa/scripts/generate-test-inventory.mjs
    - qa/scripts/personas.mjs
    - qa/scripts/detect-release-scope.mjs
    - multiple Stripe and Convex proof helpers under apps/web/scripts/

The final retrospective should include a before-and-after file count for the workflow and helper surfaces, plus the exact list of removed files so a future maintainer can verify that the old control plane is actually gone.

The final implementation summary should also include a cutover inventory in four buckets so the deletion is auditable:

    Keep:
    - the minimal Convex deploy workflow, only if still required
    - the real application tests under apps/web/tests/
    - the real package tests under packages/*/tests

    Replace:
    - the root script surface in package.json
    - the app script surface in apps/web/package.json
    - the workflow layer under .github/workflows/
    - the Stripe and browser proof helpers under apps/web/scripts/

    Delete:
    - qa/scripts/run-pack.mjs
    - qa/scripts/validate.mjs
    - qa/scripts/generate-test-inventory.mjs
    - qa/scripts/personas.mjs
    - qa/scripts/ship.mjs
    - qa/scripts/team.mjs
    - qa/scripts/detect-release-scope.mjs
    - qa/scripts/wait-for-vercel-production-deployment.mjs
    - qa/scripts/wait-for-host.mjs
    - qa/scripts/sync-hosted-convex-dev.mjs
    - qa/scripts/lib/**
    - qa/test-inventory.csv
    - qa/coverage.csv
    - qa/journeys.csv
    - qa/runs/**
    - the old release-proof workflow files

    Temporary quarantine only:
    - any non-required nightly browser lane that still exists because one specific remaining browser path cannot yet be made deterministic

Plan validation note from authoring time:

    Attempted:
    - bun run plans:lint -- --plan docs/exec-plans/active/2026-04-15-dub-style-ci-cd-test-harness-reset.md
    - bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-15-dub-style-ci-cd-test-harness-reset.md

    Result:
    - both commands failed because this checkout does not define the scripts "plans:lint" or "markdown:lint" in package.json

## Interfaces and Dependencies

The replacement plan depends on the following interfaces continuing to exist, though some may be simplified internally. The application still needs checkout creation in `apps/web/app/api/stripe/checkout/route.ts`. It still needs access recovery and entitlement logic in `apps/web/features/checkout/server/checkout-session-recovery.ts`, `apps/web/features/product-access/server/product-access.ts`, `apps/web/convex/checkoutClaims.ts`, `apps/web/convex/checkoutClaimsActions.ts`, and `apps/web/convex/access/model.ts`. It still needs Playwright and Vitest entrypoints in `apps/web/playwright.config.ts` and `apps/web/vitest.config.ts`. It still needs the package tests for `packages/blueprint-compiler`, `packages/blueprint-presentation`, and `packages/ship-by-sunday-cli`, but those tests should be reachable through a smaller root command surface.

The new architecture should preserve only a few categories of dependencies. One category is ordinary toolchain dependencies such as Bun, Vitest, Playwright, and GitHub Actions. A second category is runtime platform dependencies such as Vercel deployment events and Convex deployment commands. A third category is one small shared domain helper layer for pricing and test data. No part of the final design should depend on checked-in inventory CSV files, checked-in run reports, a release-scope classifier, or a scenario-pack planner. Those are explicit removal targets, not dependencies to preserve.

Implementation validation update:

    Passed locally:
    - bun run format
    - bun run lint
    - bun run typecheck
    - bun run test
    - bun run test:contracts
    - bun run build
    - bun run test:e2e

    GitHub-hosted proof attempt:
    - gh workflow list
    - gh workflow run pr.yml
    - gh workflow run deployment-smoke.yml -f url=https://www.man-meets-ai.com

    Result:
    - the local commands passed
    - the GitHub workflow dispatches returned `HTTP 404` because the new workflow files are not present on the default branch yet
    - both gh workflow run commands failed with HTTP 404 because the new workflow files are not on the default branch yet
