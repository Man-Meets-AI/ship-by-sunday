---
title: Replace Browser Harness Proof With Source And Release Proof
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Replace broad browser harness proof with source-level and release-scoped proof without deleting QA control-plane surfaces prematurely.
post_build_recap: Removed the shallow browser-smoke PR lane and replaced its public, crawl, metadata, homepage, and checkout-success assertions with source-level unit and integration-ui proof while retaining sandbox and hosted release browser proof.
read_when:
  - Resuming the sixth child slice of the Codex release reset Program.
  - Migrating browser-smoke, sandbox e2e, or QA-pack proof into source-level tests.
  - Checking boundaries before deleting browser harness files or changing required browser checks.
program_id: sbs-codex-release-reset
planning_brief: docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-6.md
---

# Replace Browser Harness Proof With Source And Release Proof

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the browser-proof migration.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The helper CLI is no longer part of the local release-critical surface, so the next oversized proof layer is browser and QA-pack proof. The repository should keep source-level unit and integration tests as the ordinary fast proof surface, preserve hosted proof for real deployment, auth, checkout, entitlement, Vercel, Convex, and billing facts, and remove or demote broad browser harness files only after their behavior is covered elsewhere.

After this plan, each browser-smoke or sandbox e2e behavior should be classified as replaced by source-level proof, retained as release-scoped hosted proof, or intentionally left for a later QA-control-plane slice. Checked-in docs and QA inventory should stop overstating browser proof as the primary source of truth where source tests now own the behavior.

This is the sixth child slice of the Program at `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`, governed by `planning-brief-6.md`.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-6.md`.
- [x] 2026-04-24 EDT: Inventoried browser-smoke, sandbox e2e, QA-pack, and release-proof browser surfaces. The active app-owned files are `apps/web/tests/browser-smoke/app-smoke.spec.ts`, `apps/web/tests/e2e/auth-protection.sandbox.spec.ts`, `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts`, and their support files; the `.auth/bootstrap-failures` files are generated local artifacts and not tracked proof.
- [x] 2026-04-24 EDT: Mapped active browser behavior. Public homepage, crawl, blog, docs, auth noindex, and checkout-success recovery move to source-level unit or integration-ui proof; authenticated `/blueprint`, `/review`, `/settings`, and billing handoff remain sandbox or release-scoped hosted proof.
- [x] 2026-04-24 EDT: Added or confirmed source-level replacement proof for public metadata routes, protected route noindex metadata, homepage render/schema contracts, checkout-success recovery, docs metadata, and blog metadata before deleting the shallow browser-smoke file.
- [x] 2026-04-24 EDT: Removed the `browser-smoke` Playwright project, package scripts, root script, and GitHub CI job while retaining `sandbox-e2e`, authenticated sandbox specs, `qa:run-pack`, and hosted release proof workflows.
- [x] 2026-04-24 EDT: Updated checked-in QA inventory, coverage, journeys, release docs, command docs, local QA docs, and QA runner docs so public/crawl/metadata proof points at source tests and authenticated hosted behavior remains separate.
- [x] 2026-04-24 EDT: Validated focused replacements, remaining sandbox browser proof listing, release evidence build, broad repo gates, plan lint, markdown lint, Program lint, and diff hygiene.

## Surprises & Discoveries

Plan authoring identified the replacement gaps carried forward from Program research: robots/sitemap, signed-out `/blueprint`, entitled `/blueprint -> /review -> /settings`, checkout success paid handoff, metadata/noindex rendered HTML, and QA inventory references for any removed harness files.

Live branch protection may still require the stale retired `cli` context until the helper CLI deletion lands and an operator removes it remotely. This plan should not confuse that external policy cleanup with browser-proof migration.

The read-only inventory on 2026-04-24 found that `apps/web/tests/browser-smoke/app-smoke.spec.ts` is a Playwright request-level suite, not an interactive browser journey. It checks marketing-page copy and anchors, checkout-success recovery copy, homepage structured data, robots and sitemap text, blog metadata, docs canonical metadata, and auth-page noindex. Existing source tests already cover most of those contracts, and this slice will add the missing source-level robots and route noindex checks before deleting the shallow smoke file.

The same inventory found that `apps/web/tests/e2e/auth-protection.sandbox.spec.ts` and `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts` still own real authenticated behavior: signed-out `/blueprint` redirect, redirect-preserving sign-in, no-access recovery, entitled `/blueprint` rendering, `/review`, `/settings`, and the billing handoff from Checkout back to `/blueprint`. Those behaviors are not safe to delete in this slice because they depend on hosted Clerk, Convex, Stripe, entitlement, and browser session state.

The focused public metadata replacement test exposed that `/blueprint` was missing from `robots.ts` disallow rules even though it is a canonical protected route. This slice added `/blueprint` to the robots disallow list and kept the source test as the owner for that contract.

`bun run qa:inventory:check` fails while this branch is uncommitted because the intended `qa/test-inventory.csv` updates differ from HEAD. The generator was still proven idempotent by diffing before and after `node qa/scripts/generate-test-inventory.mjs`; after these inventory changes land, the normal inventory check should pass.

## Decision Log

Decision: Start with proof mapping instead of browser-file deletion.
Rationale: Browser harness deletion is unsafe until every removed behavior has source-level proof, release-scoped hosted proof, or an explicit retained-owner decision.
Date: 2026-04-24

Decision: Preserve source-level tests by default.
Rationale: The Program research classified most unit and integration tests as useful Codex-shaped proof. This slice should migrate proof ownership, not purge tests.
Date: 2026-04-24

Decision: Keep hosted proof where the product is genuinely hosted.
Rationale: Auth, checkout, entitlement, Vercel, Convex, and billing can require deployment-environment proof that source tests cannot fully replace.
Date: 2026-04-24

Decision: Demote the shallow `browser-smoke` PR check after replacing its assertions with source tests.
Rationale: The `browser-smoke` file is request-level public HTML proof. Keeping it as a required GitHub context recreates a broad harness dependency even after the same contracts are covered by unit, integration, and integration-ui tests. Authenticated and billing browser proof stay in sandbox or hosted release lanes.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is complete. It deleted the shallow `apps/web/tests/browser-smoke/app-smoke.spec.ts` lane, removed the `browser-smoke` CI job and package scripts, kept the `sandbox-e2e` Playwright project and authenticated specs, kept `qa:run-pack`, and updated docs and QA inventory so public/crawl/metadata proof points at source tests instead of a required browser context.

Replacement proof now lives in `apps/web/tests/unit/public-metadata-routes.test.ts`, `apps/web/tests/unit/route-metadata.test.ts`, existing homepage unit and integration-ui CTA tests, existing checkout success integration-ui tests, and existing docs/blog metadata tests. `apps/web/app/robots.ts` now disallows `/blueprint` alongside the other protected surfaces.

The checked-in required-check story now names `static` and `integration`. `qa_control_plane` remains a CI drift detector, but it is not branch-required in this slice. Live branch protection was not mutated; `docs/release-workflow.md` records post-merge operator commands to remove stale `cli` and `browser-smoke` required contexts together after the workflow deletion lands.

## Context and Orientation

The likely surfaces are `apps/web/tests/browser-smoke/`, `apps/web/tests/e2e/`, `apps/web/playwright.config.ts`, QA pack scripts under `qa/scripts/`, QA inventory and coverage CSVs, release workflow docs, browser proof references in `qa/README.md`, and source tests under `apps/web/tests/unit/`, `apps/web/tests/integration/`, and `apps/web/tests/integration-ui/`.

Browser proof is not one thing. `browser-smoke` is a GitHub-native required context today, but inspection showed it is only shallow request-level proof for public HTML contracts. Sandbox e2e and QA packs are separate scenario proof surfaces. Hosted production and staging proof workflows are release-scoped and should remain unless this plan proves a narrower replacement. Do not delete a browser lane simply because another browser lane exists.

### In Scope

In scope is auditing browser-smoke, sandbox e2e, and QA-pack proof; adding source-level replacement tests for named gaps; removing or demoting browser harness files only after replacement proof exists; updating QA inventory and docs for changed proof ownership; and keeping the required-check model truthful if `browser-smoke` changes.

### Out Of Scope

Out of scope is deleting the QA control plane as a system, removing `qa:run-pack`, deleting QA personas, removing release-critical helpers, changing tag-release semantics, adding CODEOWNERS, adding broad GitHub automation, rotating credentials, changing product behavior, or doing final docs archive cleanup.

Out of scope is reopening helper CLI retirement. That slice is complete at `docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md`.

## Plan of Work

Start with read-only mapping. Inspect browser-smoke specs, sandbox e2e specs, Playwright config, QA run-pack behavior, QA inventory rows, and existing source tests for the replacement gaps. Record the mapping in this plan before deleting or demoting any browser file.

For each behavior currently proved by browser harnesses, choose one owner:

- source-level unit/integration/integration-ui proof for deterministic route, metadata, middleware, and render-model behavior
- release-scoped hosted proof for deployed auth, checkout, entitlement, Vercel, Convex, and billing facts
- retained browser proof when neither source tests nor hosted proof can replace the behavior safely in this slice

Add focused tests before deletion. Prefer existing test patterns and helpers. Do not introduce a new browser framework or broad test abstraction. The source replacement targets are `apps/web/tests/unit/public-metadata-routes.test.ts`, homepage content/render/structured-data tests, blog metadata and structured-data tests, docs metadata tests, checkout-success integration-ui tests, and route metadata tests for noindex pages.

The checked-in required contexts after demoting `browser-smoke` should be `static` and `integration`. `qa_control_plane` remains release-important drift detection inside CI, but it is not made branch-required in this slice. Record post-merge branch-protection operator commands that remove stale `cli` and `browser-smoke` contexts together after the workflow deletion lands.

## Milestones

Milestone 1 maps browser proof. At the end, this plan lists each browser/e2e/QA-pack file or lane and its owner: source replacement, hosted release proof, retained browser proof, or later QA cleanup.

Milestone 2 adds replacement source proof. At the end, focused unit, integration, or integration-ui tests cover the named replacement gaps that are safe to own locally.

Milestone 3 removes or demotes only proven browser harness files. At the end, any deleted or demoted file has a named replacement proof and QA inventory/docs no longer point at stale proof.

Milestone 4 validates release-scoped proof truth. At the end, release workflow docs and QA docs accurately distinguish source proof from hosted proof.

Milestone 5 closes out. At the end, focused tests, remaining browser proof where relevant, broad root gates, plan lint, markdown lint, Program lint, and diff hygiene have passed or blockers are recorded.

## Concrete Steps

1. Confirm current browser proof files and QA references:

       cd /Users/parkerrex/Developer/ship-by-sunday
       find apps/web/tests/browser-smoke apps/web/tests/e2e -type f | sort
       rg -n "browser-smoke|sandbox-e2e|qa:run-pack|default_ship|billing_integration|Playwright|playwright" qa docs apps/web/tests apps/web/playwright.config.ts .github/workflows

2. Map existing source tests for known gaps:

       rg -n "robots|sitemap|metadata|noindex|blueprint|review|settings|checkout/success|entitlement|access" apps/web/tests/unit apps/web/tests/integration apps/web/tests/integration-ui

3. Update this plan with the mapping before deleting browser files.

4. Add focused replacement tests for gaps that can be owned locally.

5. If browser files are removed or demoted, update `qa/test-inventory.csv`, `qa/coverage.csv`, `qa/README.md`, `docs/release-workflow.md`, and workflow docs as needed.

6. Run focused validation for touched behavior. Exact commands and results from this slice:

       bun run --cwd apps/web test:unit -- public-metadata route-metadata home-page structured-data

   Passed after adding `/blueprint` to `robots.ts`; 7 files and 13 tests passed.

       bun run --cwd apps/web test:integration:ui -- checkout-success home-page-primary-cta

   Passed; 3 files and 11 tests passed.

       bun run qa:run-pack -- --pack=default_ship --dry-run

   Passed; the dry run now plans QA validate, persona prep, report scaffold, the blueprint integration-ui proof suite, and the default-ship sandbox browser pack, without a browser-smoke step.

       bun run qa:validate

   Passed; Journeys 25, Coverage rows 66, Inventory rows 170, Personas 3.

       bun run --cwd apps/web test:e2e:sandbox -- --list

   Passed; listed the retained 7 sandbox tests in `auth-protection.sandbox.spec.ts` and `buyer-handoff.sandbox.spec.ts`.

       ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml"); puts "ci yaml ok"'

   Passed with local Ruby gem extension warnings, then printed `ci yaml ok`.

       bun run --cwd apps/web test:unit -- qa-run-pack public-metadata route-metadata

   Passed; 3 files and 4 tests passed.

       bun run --cwd apps/web test:integration -- blueprint checkout

   Passed; 9 files and 32 tests passed, with existing jsdom navigation notices.

       bun run release:evidence:build

   Passed; wrote dry-run `tmp/release-evidence.v1.json` and reported expected unavailable hosted proof blockers because no hosted Vercel, Convex, billing, auth, or entitlement proof was supplied.

       git diff -- qa/test-inventory.csv > /tmp/sbs-inventory-before.diff
       node qa/scripts/generate-test-inventory.mjs
       git diff -- qa/test-inventory.csv > /tmp/sbs-inventory-after.diff
       cmp -s /tmp/sbs-inventory-before.diff /tmp/sbs-inventory-after.diff && echo 'inventory sync idempotent'

   Passed; printed `inventory sync idempotent`.

       bun run qa:inventory:check

   Failed before commit because the intended `qa/test-inventory.csv` updates differ from HEAD. The generator idempotence proof above is the local proof for this uncommitted slice.

7. Run closeout validation:

       bun run format
       bun run lint
       bun run typecheck
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md docs/release-workflow.md qa/README.md qa/coverage.csv qa/test-inventory.csv
       bun run programs:lint
       git diff --check

   `bun run format` passed and reported `oxfmt` across 1002 files. `bun run lint` passed with 0 warnings and 0 errors across 942 files. `bun run typecheck` passed; the Next build compiled successfully, ran TypeScript, generated 71 static pages, and listed the expected app routes including `/`, `/blueprint`, `/checkout/success`, `/docs/[[...mdxPath]]`, `/review`, `/settings`, `/robots.txt`, and `/sitemap.xml`.

   `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md` passed. `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-6.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-7.md docs/release-workflow.md qa/README.md qa/AGENTS.md qa/coverage.csv qa/journeys.csv qa/test-inventory.csv README.md docs/RELIABILITY.md docs/design-docs/scripts.md apps/web/content/docs/commands.mdx apps/web/content/docs/configure-the-homepage.mdx apps/web/content/docs/local-qa.mdx` passed for the metadata-backed files it reports. `bun run programs:lint` passed for Program docs, packets, and prompts. `git diff --check` passed.

## Validation and Acceptance

This slice is complete when browser proof ownership is explicit, source-level replacement tests exist for any locally replaced behavior, remaining hosted proof is documented as release-scoped, stale browser harness references are removed from active docs and QA inventory, and the checked-in required-check story is truthful.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` unless the implementation records a more focused equivalent:

       bun run format
       bun run lint
       bun run typecheck
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md
       bun run programs:lint
       git diff --check

## Idempotence and Recovery

Do not delete browser harness files until replacement proof is in place and recorded. If a focused replacement test fails, fix the source proof before deleting harness files. If browser proof is still the only reliable owner for a hosted behavior, keep it and record why. If branch protection still requires a browser context that the checked-in workflow no longer emits, stop and record the exact operator command before claiming release readiness.

## Artifacts and Notes

Program source for this plan:

       docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-6.md

High-signal source research:

       docs/programs/completed/2026-04-24-sbs-codex-release-reset/research-pass-sbs-test-migration.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/normalized-pass-sbs-test-migration.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/plan-split-recommendation.md

## Interfaces and Dependencies

This plan depends on the completed helper CLI retirement, the current CI workflow, Playwright config, QA inventory and coverage files, existing app source tests, release workflow docs, and the hosted proof workflows that still own deployment-environment facts.
