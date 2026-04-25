# Program Taxonomy Research

This research pass preserves the Program taxonomy synthesis created from the Codex/SBS research on 2026-04-24. It is not a plan, ExecPlan, or implementation sequence.

## Source Track

The source track identified the minimal coherent research-track taxonomy for a future Program packet that replaces the current SBS QA/CI/CD model with a Codex-like model. It used `docs/programs/PROGRAMS.md` as the Program contract.

## Recommended Research Passes

The source track recommended one future Program packet with these research passes:

1. `research-00-current-state-and-codex-reference.md`
   Must answer what "Codex-like" means for SBS and what must not be copied literally. Evidence should include SBS `package.json`, `.github/workflows/*`, `qa/README.md`, `docs/release-workflow.md`, and Codex `justfile`, `.github/workflows/ci.yml`, `rust-ci.yml`, `rust-release.yml`, and `docs/contributing.md`. Boundary: comparison language only, no deletion map or target implementation.

2. `research-01-command-surface-and-cli-deletion.md`
   Must answer which SBS commands are product/dev commands versus control-plane wrapper commands, and which wrapper commands disappear or are renamed in a Codex-like model. Evidence should include root `package.json`, `apps/web/package.json`, package-level scripts, `packages/ship-by-sunday-cli/*`, and Codex `justfile`. Boundary: CLI/script surface only. It does not decide QA file deletion, workflow YAML replacement, branch policy, release tags, or test coverage.

3. `research-02-qa-control-plane-demotion-or-deletion.md`
   Must answer which `qa/` files are authoritative product QA truth, which are runtime orchestration, and which could survive only as plain docs or fixtures. Evidence should include `qa/README.md`, `qa/AGENTS.md`, `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, `qa/scripts/*`, and `.agents/skills/qa-team/SKILL.md`. Boundary: QA source-of-truth fate only. It does not design CI, branch protection, release tags, or final test matrix.

4. `research-03-ci-workflow-replacement.md`
   Must answer the smallest GitHub Actions shape that gives equal or stronger proof than current SBS release workflows. Evidence should include `.github/workflows/ci.yml`, `dev-staging-proof.yml`, `production-release-proof.yml`, `convex-production-deploy.yml`, `sandbox-e2e-nightly.yml`, and Codex `ci.yml`, `rust-ci.yml`, `rust-ci-full.yml`, and `bazel.yml`. Boundary: workflow topology and required-status strategy only. It does not delete QA scripts, define release tags, or decide branch model.

5. `research-04-release-tags-and-artifacts.md`
   Must answer whether SBS releases become tag-driven, PR-driven, or remain `dev -> main` with explicit release proof, and what artifacts must exist before publishing. Evidence should include `docs/release-workflow.md`, `CHANGELOG.md` if present, GitHub Release/tag docs in the repo, and Codex `rust-release.yml`, `CHANGELOG.md`, and `cliff.toml`. Boundary: tags, release notes, release assets, and version semantics only. It does not own branch policy or CI topology except where release jobs consume tags.

6. `research-05-branch-policy-and-promotion.md`
   Must answer whether SBS keeps `feature -> dev -> main`, moves closer to Codex's topic-branch-from-`main` model, or uses a hybrid. Evidence should include root `AGENTS.md`, `docs/release-workflow.md`, `qa/README.md`, current GitHub workflow triggers, and Codex `docs/contributing.md`. Boundary: branch lifecycle, merge targets, hotfix path, and required checks by branch. It does not decide which tests exist or which QA files are deleted.

7. `research-06-test-strategy-and-proof-migration.md`
   Must answer what tests prove product behavior after QA packs are removed or demoted, and which current proof must be replaced before deletion is safe. Evidence should include `apps/web/vitest.config.ts`, `apps/web/playwright.config.ts`, `apps/web/tests/**`, `packages/*/tests/**`, `qa:run-pack` behavior, and Codex test guidance in `AGENTS.md`, `justfile`, and `docs/contributing.md`. Boundary: test taxonomy and proof equivalence only. It does not own workflow YAML, release tags, or branch policy.

The filenames in this actual Program packet may differ from the recommended numeric names, but each durable research pass should preserve one coherent source track.

## Hard Boundaries

The source track emphasized these boundaries:

- CLI deletion is not QA deletion. Removing `qa:*` scripts from `package.json` is separate from deleting `qa/` files.
- QA deletion is not test deletion. `qa/test-inventory.csv` or `qa:run-pack` can be retired only after the test-strategy pass names replacement proof.
- CI replacement is not branch-policy replacement. Workflow shape can change while `dev -> main` remains, or branch policy can change while workflow proof stays intact.
- Release tags are not release readiness. Tags and artifacts answer what was released; CI and QA answer whether it is safe.
- Branch policy is not test strategy. Merging to `main` does not imply which Playwright, Vitest, billing, or Convex proof must run.
- The failed old Dub-style plan is evidence, not an execution source. Future work should preserve its warnings but not inherit its deletion bundle.

## Program Constraints

The source track carried forward the `docs/programs/PROGRAMS.md` contract:

- one folder under `docs/programs/active/<date>-<program_id>/`
- `program.md`
- research passes
- normalized memos
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- `cross-repo-review.md`
- versioned `planning-brief-<N>.md`
- `current-planning-brief.txt`

The Program stays above ExecPlans and should use `bun run programs:lint` as its packet validation surface once the packet exists.

