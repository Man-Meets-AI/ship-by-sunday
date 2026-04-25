# Workflow Strategy

The workflows in this directory are split so pull requests get fast source-level feedback while `dev`, `main`, and protected release tags get the hosted proof that a SaaS release needs.

## Pull Requests And Source Proof

- `ci.yml` is the pre-merge and source proof path. It runs on pull requests, pushes to `main`, schedule, and manual dispatch.
- The durable merge-gate jobs are `static` and `integration`.
- `static` runs lint, format check, unit tests, contract tests, and the app build.
- `integration` runs the integration test suite.
- `browser-smoke` and `cli` are temporary compatibility jobs while branch protection still requires those contexts. They are no-ops and are not release evidence.

## Integrated Staging On `dev`

- `dev-staging-proof.yml` runs on pushes to `dev` and manual dispatch.
- It proves the integrated `dev` branch against the staging host and release proof personas.
- It is the staging release-candidate proof, not a required PR context.

## Production On `main`

- `production-release-proof.yml` runs hosted production proof after pushes to `main` and on manual dispatch.
- `convex-production-deploy.yml` owns Convex production deployment from `main`; automatic deploys remain controlled by `CONVEX_PRODUCTION_DEPLOY_ENABLED`.
- These workflows prove the production deployment path after a reviewed `dev -> main` release PR lands.

## Tag Publication

- `release.yml` runs on protected `v*` tags and manual dispatch.
- It validates `release.json`, checks release identity, builds `release-evidence.v1`, and publishes the GitHub Release only after evidence is available.
- Tags attest a verified `main` production SHA; they do not replace hosted production proof.

## Repair And Non-Release Lanes

- `sandbox-e2e-nightly.yml` is a scheduled and manual sandbox browser lane for repair work.
- It is useful regression signal, but it is not a release gate and does not replace `dev-staging-proof.yml` or `production-release-proof.yml`.
- Do not treat missing historical workflow metadata as current proof unless the workflow file exists in this directory.

## Rule Of Thumb

- Keep PR checks fast and source-level.
- Put hosted environment proof in the `dev`, `main`, and tag workflows that know the target environment.
- Do not add a required status context unless branch protection and the workflow file can be updated together.
