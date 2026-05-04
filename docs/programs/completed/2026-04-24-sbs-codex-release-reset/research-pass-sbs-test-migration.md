# Ship By Sunday Test Migration Research

This research pass preserves the Ship by Sunday test inventory gathered from `/Users/parkerrex/Developer/ship-by-sunday` on 2026-04-24. It is a static inventory and config inspection; no test suites were run during the source track.

## Source Track

The source track inspected `apps/web/tests`, `packages/*/tests`, and `qa/test-inventory.csv` to classify what should be preserved, merged, rewritten, or deleted under a Codex-like source-test strategy.

## Counts

The source track reported:

- 180 runnable test/spec files in scope
- 157 runnable files under `apps/web/tests`
- 23 runnable files under `packages/*/tests`
- 7 support files in test trees
- 2 ignored generated QA artifacts
- 163 rows in `qa/test-inventory.csv`, matching `apps/web/tests` excluding ignored `.auth/bootstrap-failures` artifacts
- existing dirty state: `qa/test-inventory.csv` modified and 6 engineering-intake unit tests untracked

## Preserve

The research track classified 157 runnable files as core source-level tests worth preserving:

- all `packages/*/tests/**/*.test.ts`, 23 files
- all `apps/web/tests/contracts/**/*.test.*`, 1 file
- all `apps/web/tests/integration/**/*.test.*`, 7 files
- all `apps/web/tests/integration-ui/**/*.test.*` except merge-only files, 17 files
- all `apps/web/tests/unit/**/*.test.*` except merge-only or stale files, 109 files

Package preserve paths reported by the source track:

- `packages/codebase-compiler/tests/codebase-field-helpers.test.ts`
- `packages/codebase-compiler/tests/codebase-renderers.test.ts`
- `packages/codebase-compiler/tests/canonical-project-definition.test.ts`
- `packages/codebase-compiler/tests/customer-safe-snapshot-contract.test.ts`
- `packages/codebase-compiler/tests/design-preset-catalog.test.ts`
- `packages/codebase-compiler/tests/generated-design-system.test.ts`
- `packages/codebase-compiler/tests/readiness.test.ts`
- `packages/codebase-compiler/tests/repo-generation.test.ts`
- `packages/codebase-compiler/tests/repo-root.test.ts`
- `packages/codebase-compiler/tests/review-download-zip.test.ts`
- `packages/codebase-presentation/tests/codebase-presentation.test.ts`
- `packages/ship-by-sunday-cli/tests/agent-workflows.test.ts`
- `packages/ship-by-sunday-cli/tests/cli-errors.test.ts`
- `packages/ship-by-sunday-cli/tests/cli-help.test.ts`
- `packages/ship-by-sunday-cli/tests/draft-store.test.ts`
- `packages/ship-by-sunday-cli/tests/executable-entrypoint.test.ts`
- `packages/ship-by-sunday-cli/tests/generate-command.test.ts`
- `packages/ship-by-sunday-cli/tests/prompt-stage-session.test.ts`
- `packages/ship-by-sunday-cli/tests/prompt-stage.test.ts`
- `packages/ship-by-sunday-cli/tests/read-only-commands.test.ts`
- `packages/ship-by-sunday-cli/tests/review-command.test.ts`
- `packages/ship-by-sunday-cli/tests/stage-command.test.ts`
- `packages/ship-by-sunday-cli/tests/startup.test.ts`

The CLI tests are preserve candidates only while the CLI exists. If the helper CLI is removed, these tests should disappear with that package or move only if their underlying reusable behavior moves elsewhere.

## Merge-Only Preserve

The source track classified these 17 as source-level but not strong standalone release proof. They should be preserved as implementation backstops or merged into stronger scenario tests over time:

- `apps/web/tests/integration-ui/bonus-lesson-view-tracker.test.tsx`
- `apps/web/tests/unit/codebase-stage-save-feedback.test.tsx`
- `apps/web/tests/unit/codebase-step-save-feedback.test.ts`
- `apps/web/tests/unit/bonus-course-card.test.tsx`
- `apps/web/tests/unit/bonus-route-state.test.ts`
- `apps/web/tests/unit/brand-kit-workbench.test.tsx`
- `apps/web/tests/unit/build-product-iteration-workbench.test.tsx`
- `apps/web/tests/unit/competitor-research-light-workbench.test.tsx`
- `apps/web/tests/unit/core-flow-sketch-workbench.test.tsx`
- `apps/web/tests/unit/core-ux-build-constants.test.ts`
- `apps/web/tests/unit/core-ux-plan-flow-workbench.test.tsx`
- `apps/web/tests/unit/production-deploy-handoff-workbench.test.tsx`
- `apps/web/tests/unit/repo-map-orientation-workbench.test.tsx`
- `apps/web/tests/unit/research-prompt.test.ts`
- `apps/web/tests/unit/route-access-orientation-workbench.test.tsx`
- `apps/web/tests/unit/skill-rail-navigation.test.ts`
- `apps/web/tests/unit/skill-rail.test.tsx`

## Stale

The source track marked these 3 tests for rewrite/delete treatment before they can be considered good source-level proof:

- `apps/web/tests/unit/use-autosave.test.tsx`
- `apps/web/tests/unit/legacy-lesson-routes.test.ts`
- `apps/web/tests/unit/mission-page.test.tsx`

Risk notes from the source track:

- `use-autosave.test.tsx` covers an unused hook; `rg` found no call sites outside its own source/test.
- `legacy-lesson-routes.test.ts` still proves compatibility behavior but is framed legacy-first.
- `mission-page.test.tsx` exercises old course/mission framing; `apps/web/AGENTS.md` says `/mission` or old framing is suspect unless the current contract needs it.

## QA Harness Delete Candidates

Under a Codex-like strategy where source tests remain in the repo and browser proof is run dynamically, the source track classified these 7 as QA-harness artifacts to delete after replacement coverage lands:

- `apps/web/tests/browser-smoke/app-smoke.spec.ts`
- `apps/web/tests/e2e/auth-protection.sandbox.spec.ts`
- `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts`
- `apps/web/tests/e2e/auth-state.ts`
- `apps/web/tests/e2e/global-setup.ts`
- `apps/web/tests/e2e/.auth/bootstrap-failures/test-test-com.html`
- `apps/web/tests/e2e/.auth/bootstrap-failures/test-test-com.png`

The source track warned that the first three are still wired into `qa/journeys.csv`, `qa/coverage.csv`, `qa/scripts/run-pack.mjs`, release-scope logic, and package scripts. Deleting them first would break QA control-plane expectations.

## Replacement Gaps

The source track named these source-level replacement gaps before browser harness files can be safely deleted:

- `apps/web/app/robots.ts` and `apps/web/app/sitemap.ts`, currently mainly proved by `apps/web/tests/browser-smoke/app-smoke.spec.ts`.
- signed-out `/codebase` middleware/redirect behavior, partially covered by protected-layout and sign-in tests but still browser-only for real route redirect proof.
- entitled `/codebase -> /review -> /settings` happy path, where component tests exist but route composition is still browser-pack proof.
- checkout success full paid handoff, where source tests cover route/session pieces but real Stripe-hosted return/access grant remains browser/hosted proof.
- metadata/noindex rendered HTML for docs/auth routes, where source helpers exist but full route render proof is browser-smoke today.
- QA inventory/control-plane references, which must be updated atomically if harness files are removed.

## Bottom Line

The research track does not support gutting all tests. It supports preserving most source-level tests, deleting or rewriting stale tests, deleting CLI tests if the CLI is removed, and replacing the browser QA harness with a smaller Codex-like strategy tied to source-level tests plus release-scoped hosted proof.

