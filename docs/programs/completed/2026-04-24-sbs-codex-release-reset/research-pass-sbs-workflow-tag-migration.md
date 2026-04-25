# Ship By Sunday Workflow And Tag Migration Research

This research pass preserves the Ship by Sunday workflow, branch, release, and tag migration findings gathered from the local repo and GitHub API on 2026-04-24.

## Source Track

The source track compared current Ship by Sunday GitHub workflows, branch/release flow, package/version surfaces, and GitHub rules against Codex's tag-driven release model.

## Findings

Ship by Sunday is branch-driven today while Codex is tag-driven at release time. `docs/release-workflow.md:3` and `docs/release-workflow.md:46` define feature branches into `dev`, then `dev -> main`, with Vercel and Convex production tracking `main`. Active release workflows are branch-push based:

- `.github/workflows/dev-staging-proof.yml:3` runs on `dev`
- `.github/workflows/production-release-proof.yml:3` runs on `main`
- `.github/workflows/convex-production-deploy.yml:3` runs on `main`

Codex release starts on tag push. `.github/workflows/rust-release.yml:8` triggers only on `rust-v*.*.*`.

Ship by Sunday treats tags as post-merge publication, not release trigger. `docs/release-workflow.md:103` says to merge `dev -> main`, then tag the merged `main` commit and publish a GitHub Release. Codex reverses this ownership: tag push triggers validation, builds, GitHub Release creation, npm publish, WinGet publish, and branch update jobs. Evidence includes `.github/workflows/rust-release.yml:392`, `.github/workflows/rust-release.yml:513`, `.github/workflows/rust-release.yml:561`, and `.github/workflows/rust-release.yml:667`.

Ship by Sunday lacks a Codex-style required-check gatherer for PR CI. The source track reported from GitHub API that SBS branch protection currently requires `static`, `integration`, `browser-smoke`, and `cli` on both `dev` and `main`; it does not require `qa_control_plane`, `release_gate`, `Dev Staging Proof`, or `Production Release Proof`. Codex has `CI results (required)` in `.github/workflows/rust-ci.yml:182`. SBS has `release_gate` jobs, but they live inside branch-push proof workflows, not protected PR checks. Evidence is `.github/workflows/dev-staging-proof.yml:304` and `.github/workflows/production-release-proof.yml:284`.

Codex protects release tags. The source track reported live Codex tag rulesets for `refs/tags/rust-v*.*.*` and `refs/tags/alpha-cli`, with creation, update, and deletion protection. The same API reportedly returned no SBS rulesets. A Codex-like SBS release would need protected tag rules for a chosen pattern such as `sbs-v*.*.*` or `v*.*.*`, plus a tag validation job.

SBS version source of truth is not release-grade yet. Several private packages report `0.1.0`: root `package.json:3`, `apps/web/package.json:2`, and `packages/blueprint-compiler/package.json:2`. Codex validates `rust-vX.Y.Z` against `codex-rs/Cargo.toml` in `.github/workflows/rust-release.yml:24` and `codex-rs/Cargo.toml:103`. Codex keeps npm package manifests at dev versions and stamps release tarballs during staging. Evidence includes `codex-cli/package.json:3`, `sdk/typescript/package.json:3`, and `codex-cli/scripts/build_npm_package.py:299`.

Ship by Sunday release artifacts are operational evidence, not packaged release assets. Codex creates binaries, DMGs, compressed assets, config schema, installer scripts, npm tarballs, GitHub Release assets, and downstream publishes. Evidence includes `.github/workflows/rust-release.yml:311`, `.github/workflows/rust-release.yml:451`, `.github/workflows/rust-release.yml:497`, and `.github/workflows/rust-release.yml:508`. SBS artifacts are currently Vercel/Convex deployed state plus QA/runbook evidence and intake JSON commands. Evidence is `docs/release-workflow.md:37` and root `package.json:73`.

Vercel and Convex are the biggest mismatch with Codex's artifact-release model. Codex releases software artifacts from tags. SBS deploys a hosted app from `main`: Vercel production tracks `main` and Convex production deploys from `main`. Evidence is `docs/release-workflow.md:52` and `.github/workflows/convex-production-deploy.yml:49`. A tag-driven SBS release must either deploy the exact tagged SHA to Vercel/Convex or treat the tag as a post-deploy attestation after `main` has already deployed.

Billing proof is not obsolete; the `dev -> main` machinery around it is. Production billing proof pulls Vercel env, writes Convex auth config, verifies live Stripe mode, and runs `billing_integration` when scope requires it. Evidence is `.github/workflows/production-release-proof.yml:171` and `.github/workflows/production-release-proof.yml:264`. Codex has no equivalent hosted billing/entitlement dependency. In a tag model, SBS still needs billing scope detection and no-cost live checkout proof, tied to the release tag's deployed SHA rather than a `dev -> main` PR.

The current `release:triage` stack is deeply `origin/dev` / `origin/main` / release-PR shaped. Defaults include `origin/main`, `origin/dev`, base branch `main`, head branch `dev`, and `dev.man-meets-ai.com` preview in `qa/scripts/lib/release-triage-source.mjs:333`. The stack also verifies a release PR targets expected branches and tracks the candidate SHA in `qa/scripts/lib/release-triage.mjs:113`.

`Dev Staging Proof` currently under-scopes dev candidate diffs. `.github/workflows/dev-staging-proof.yml:42` uses `github.event.before` to `github.sha` on push, not `merge-base origin/main HEAD`, so a multi-commit integrated candidate can be classified from only the latest push range. In a tag-driven model, this should be replaced by tag/base calculation. If the repo stays branch-driven, it is a release-scope bug.

Some QA proof workflows become stale in a tag model. `snapshot_required`, `release:snapshot`, post-snapshot reconcile, and `RELEASE_RECONCILE_GH_TOKEN` exist to recover from blocked `dev -> main` PRs. Evidence includes `docs/release-workflow.md:153` and `.github/workflows/production-release-proof.yml:311`. A tag-driven flow would not need snapshot PRs as a release lane, though it may still need branch reconciliation for hotfixes.

There is an orphaned remote workflow surface. The source track reported that GitHub API sees active `Deployment Smoke` at `.github/workflows/deployment-smoke.yml`, but the file is absent locally. Docs already call it historical/orphaned evidence in `docs/release-workflow.md:24` and `qa/README.md:39`.

## Bottom Line

The source track concluded that SBS can become Codex-like only by moving release ownership from "merge `dev` to `main`, then prove/deploy/tag" to "create a protected version tag, validate the tag/version, deploy or attest the exact tagged SHA, gather hosted Vercel/Convex/billing proof, then publish the GitHub Release."

The non-negotiable SBS-specific differences are Vercel production, hosted Convex deploys, and live billing/entitlement proof. Those cannot be copied from Codex's artifact-only release model.

