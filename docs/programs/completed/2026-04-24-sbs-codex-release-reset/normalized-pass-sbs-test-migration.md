# Ship By Sunday Test Migration Normalized

## Facts

- The source research reported 180 runnable test/spec files: 157 under `apps/web/tests` and 23 under `packages/*/tests`.
- The source research classified most source-level tests as worth preserving.
- Package tests include 10 codebase-compiler tests, 1 codebase-presentation test, and 12 helper CLI tests.
- CLI tests should disappear if the helper CLI disappears, unless reusable behavior moves elsewhere.
- The source research classified 17 source tests as merge-only backstops rather than strong standalone release proof.
- The source research marked `apps/web/tests/unit/use-autosave.test.tsx`, `apps/web/tests/unit/legacy-lesson-routes.test.ts`, and `apps/web/tests/unit/mission-page.test.tsx` as stale rewrite/delete candidates.
- The source research classified the browser-smoke/e2e harness files and generated auth failure artifacts as QA-harness delete candidates after replacement coverage lands.
- Replacement gaps remain for robots/sitemap, signed-out `/codebase` redirect behavior, entitled `/codebase -> /review -> /settings`, checkout success handoff, and metadata/noindex rendered HTML.

## Recommendation

Do not gut all SBS tests. Preserve source-level tests, delete or rewrite stale tests, remove CLI tests only with CLI deletion, and replace browser QA harness proof with smaller source or hosted release proof.

## Risks

- Removing browser harness files before replacement coverage lands would lose route, auth, checkout, and metadata proof.
- Keeping weak merge-only tests forever could preserve noise without improving release confidence.
- Deleting CLI tests without deleting the CLI would break package validation.
- Updating tests without updating `qa/test-inventory.csv` and QA references would create validation drift until the QA inventory is retired.

## Code Seams

- `apps/web/tests/unit/**`
- `apps/web/tests/integration/**`
- `apps/web/tests/integration-ui/**`
- `apps/web/tests/contracts/**`
- `apps/web/tests/browser-smoke/app-smoke.spec.ts`
- `apps/web/tests/e2e/auth-protection.sandbox.spec.ts`
- `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts`
- `apps/web/tests/e2e/auth-state.ts`
- `apps/web/tests/e2e/global-setup.ts`
- `apps/web/tests/e2e/.auth/bootstrap-failures/*`
- `packages/codebase-compiler/tests/**`
- `packages/codebase-presentation/tests/**`
- `packages/ship-by-sunday-cli/tests/**`
- `qa/test-inventory.csv`
- `qa/journeys.csv`
- `qa/coverage.csv`

## Proposed Slices

1. Preserve and stabilize source-level app and package tests.
2. Rewrite or delete the three stale source tests.
3. Remove CLI tests only inside the helper CLI deletion slice.
4. Replace browser-smoke/e2e harness coverage with source-level tests and release-scoped hosted checks.
5. Retire QA inventory references after test proof no longer depends on `qa:run-pack`.

