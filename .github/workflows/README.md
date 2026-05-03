# Workflow Strategy

The workflows in this directory follow the Codex-style lifecycle: pull requests target `main` and get fast source-level feedback, pushes to `main` get hosted product proof, and protected `v*` tags publish releases from verified `main` commits.

## Pull Requests

- `ci.yml` is the pre-merge source proof path for pull requests into `main`.
- The durable merge-gate jobs are `static` and `integration`.
- `static` runs lint, format check, unit tests, contract tests, and the app build.
- `integration` runs the integration test suite.

## Post-Merge On `main`

- `ci.yml` also runs on pushes to `main` so the merged source tree is rechecked.
- `production-release-proof.yml` runs hosted production proof after pushes to `main` and on manual dispatch. It waits for the matching Vercel production deployment, runs `default_ship`, and runs `billing_integration` when the release scope requires it.
- `convex-production-deploy.yml` owns Convex production deployment from `main`. Automatic deploys remain controlled by `CONVEX_PRODUCTION_DEPLOY_ENABLED`.

## Tag Publication

- `release.yml` runs on protected `v*` tags and manual dispatch.
- It validates `release.json`, confirms the tag target is the verified `main` SHA, builds `release-evidence.v1`, builds release notes from the matching `CHANGELOG.md` section, and publishes the GitHub Release only after publish-mode evidence passes.
- Tags attest a verified `main` production SHA. They do not replace hosted production proof.

## Repair And Non-Release Lanes

- `issue-labels.yml` keeps managed labels available for the issue templates.
- Remote-only workflows such as `Deployment Smoke` are not current proof unless a tracked workflow file owns them. Disable or replace them during the remote landing pass.

## Rule Of Thumb

- Keep PR checks fast and source-level.
- Put hosted environment proof after merge on `main`.
- Put release publication behind protected semver tags.
- Do not add a required status context unless branch protection and this directory can be updated together.
