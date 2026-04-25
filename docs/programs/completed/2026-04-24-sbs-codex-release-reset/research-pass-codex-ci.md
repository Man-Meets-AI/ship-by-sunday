# Codex CI Research

This research pass preserves the Codex CI findings gathered from `/Users/parkerrex/Developer/codex` on 2026-04-24. No Ship by Sunday files were edited during the source research.

## Source Track

The source track inspected Codex GitHub Actions CI architecture, branch-protection assumptions, job triggers, gatherer jobs, path gating, cache behavior, artifacts, and permissions.

## Findings

Codex intentionally splits PR-time verification from heavier post-merge verification. `.github/workflows/README.md:3-33` states that PRs get fast, review-friendly signal while `main` gets full cross-platform verification. The main PR Rust path is Bazel-heavy, while Cargo-native full verification moves to `rust-ci-full`.

`rust-ci.yml` always triggers on PRs and then gates jobs internally through a `changed` job. The changed-path detector lives around `.github/workflows/rust-ci.yml:8-53`, and downstream jobs are guarded by those outputs around `.github/workflows/rust-ci.yml:55-180`. This preserves required-check visibility while avoiding unnecessary work.

Codex has a gatherer job named `CI results (required)` in `.github/workflows/rust-ci.yml:183-222`. Comments near `.github/workflows/rust-ci.yml:182-184` say this is intended as the required aggregate status, but the live ruleset reported by the research agent on 2026-04-24 required many individual contexts too. That mismatch is a caution: a gatherer is useful only if branch protection is synchronized with the workflow design.

`bazel.yml` runs on PR, push to `main`, and manual dispatch. It uses concurrency cancellation for non-main runs and a cross-platform matrix for test, clippy, and release-build verification. Relevant workflow evidence is `.github/workflows/bazel.yml:6-17`, `.github/workflows/bazel.yml:19-125`, `.github/workflows/bazel.yml:127-209`, and `.github/workflows/bazel.yml:211-292`.

`rust-ci-full.yml` runs on push to `main`, on `**full-ci**`, and manually. It covers full Cargo format/shear/lint/build, nextest, release-profile builds, argument-comment-lint, remote-env coverage, and a `Full CI results` gatherer. Relevant evidence is `.github/workflows/rust-ci-full.yml:2-8`, `.github/workflows/rust-ci-full.yml:13-137`, `.github/workflows/rust-ci-full.yml:139-508`, `.github/workflows/rust-ci-full.yml:510-739`, and `.github/workflows/rust-ci-full.yml:741-774`.

Path filters are mostly avoided at the workflow level for required checks. `v8-canary.yml` is the exception: it has workflow-level path filters and is not part of branch protection. Evidence is `.github/workflows/v8-canary.yml:3-28`.

Codex cache behavior is layered and non-fatal. Bazel uses BuildBuddy when secrets exist and falls back for forks through `.github/scripts/run-bazel-ci.sh:346-390`. Bazel repository-cache restore/save is handled by `.github/actions/prepare-bazel-ci/action.yml:35-64`. Cargo full CI uses Cargo home caches, sccache GHA backend or actions/cache fallback, and musl APT cache in `.github/workflows/rust-ci-full.yml:266-330`, `.github/workflows/rust-ci-full.yml:458-508`, `.github/workflows/rust-ci-full.yml:586-643`, and `.github/workflows/rust-ci-full.yml:687-705`.

Codex also has narrow policy workflows:

- `.github/workflows/ci.yml:3-70` runs repo policy scripts, pnpm install/format, and npm staging artifact checks.
- `.github/workflows/sdk.yml:3-13` and `.github/workflows/sdk.yml:36-122` run TypeScript SDK build/lint/test from a Bazel-built Codex binary.
- `.github/workflows/cargo-deny.yml:3-26` runs cargo-deny.
- `.github/workflows/codespell.yml:5-27` checks spelling.
- `.github/workflows/blob-size-policy.yml:3-32` enforces a changed-blob size cap.

## Live Branch Protection Observation

The research agent queried live GitHub rules on 2026-04-24. It reported a default-branch ruleset named `CI must pass to merge to main`, with deletion, non-fast-forward, and creation blocked, linear history required, one approving code-owner review, squash-only merges, and strict status checks disabled. The required contexts reportedly included `build-test`, `cla`, `Check for spelling errors`, `Blob size policy`, `cargo-deny`, `sdks`, `Format / etc`, `cargo shear`, `Argument comment lint package`, several argument-comment-lint contexts, `CI results (required)`, and Bazel matrix contexts.

This live ruleset observation is secondhand from the subagent result, not re-queried in this file-writing step.

## Copyable Principles For Ship By Sunday

The durable Codex CI shape to carry forward is:

- PR CI should be fast but representative.
- Required checks should always appear and self-skip inside jobs rather than disappearing behind workflow-level path filters.
- Branch protection must match the actual required-check strategy.
- Heavy soak should run after merge or on explicit full-CI triggers.
- Caches should speed up runs without being able to turn a cold build red.
- Fork or unprivileged contexts should fall back gracefully when privileged cache or signing secrets are unavailable.
- Write/OIDC/signing permissions should stay out of ordinary PR CI.

