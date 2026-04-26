# Codex CI Normalized

## Facts

- Codex splits PR verification from heavier post-merge verification, documented in `/Users/parkerrex/Developer/codex/.github/workflows/README.md:3-33`.
- Codex PR checks mostly trigger consistently and self-skip inside jobs. `rust-ci.yml` uses a changed-path detector around `.github/workflows/rust-ci.yml:8-53` and job guards around `.github/workflows/rust-ci.yml:55-180`.
- Codex has an aggregate `CI results (required)` gatherer in `.github/workflows/rust-ci.yml:183-222`, but the source research reported live branch protection still required many individual contexts too.
- Codex uses `bazel.yml` for broad PR and `main` verification, with concurrency control and cross-platform test, clippy, and release-build matrices in `.github/workflows/bazel.yml`.
- Codex uses `rust-ci-full.yml` for heavier `main` and manual verification, including Cargo format, shear, lint/build, nextest, release-profile builds, remote-env coverage, and `Full CI results`.
- Codex keeps cache restore/save non-fatal and falls back when privileged cache secrets are unavailable, with BuildBuddy fallback in `.github/scripts/run-bazel-ci.sh:346-390`.
- Codex keeps release write/OIDC/signing permissions out of ordinary PR CI.

## Recommendation

Use Codex's required-check shape as the CI target: stable required jobs that always appear, self-skip internally when irrelevant, and separate fast PR proof from heavier post-merge or manual proof. Do not rely on disappearing workflow-level path filters for any required SBS check.

## Risks

- A gatherer job is misleading if GitHub branch protection still requires stale or individual contexts.
- Workflow-level path filters can make required checks disappear and block or confuse PRs.
- Cache or remote-build integration can reduce reliability if cache failures are treated as test failures.
- Copying Codex's Bazel-specific implementation into SBS would add irrelevant tooling rather than improving CI truth.

## Code Seams

- `.github/workflows/ci.yml`
- `.github/workflows/dev-staging-proof.yml`
- `.github/workflows/production-release-proof.yml`
- `.github/workflows/convex-production-deploy.yml`
- `.github/workflows/sandbox-e2e-nightly.yml`
- GitHub branch protection required contexts for `dev` and `main`
- `package.json` CI scripts
- `/Users/parkerrex/Developer/codex/.github/workflows/README.md`
- `/Users/parkerrex/Developer/codex/.github/workflows/rust-ci.yml`
- `/Users/parkerrex/Developer/codex/.github/workflows/rust-ci-full.yml`
- `/Users/parkerrex/Developer/codex/.github/workflows/bazel.yml`

## Proposed Slices

1. Inventory current SBS required checks and workflow triggers against live branch protection.
2. Replace or reshape PR CI so required jobs always appear and skip internally when out of scope.
3. Move heavier hosted proof out of ordinary PR checks and into post-merge, tag, or explicit release workflows.
4. Remove or quarantine non-required failing lanes only after the protected check surface is truthful.

