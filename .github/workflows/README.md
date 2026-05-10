# Workflow Strategy

The workflows in this directory follow the Codex-style lifecycle: pull requests target `main` and get fast source-level feedback, pushes to `main` get hosted product proof, and protected `v*` tags publish releases from verified `main` commits.

## Pull Requests

- `ci.yml` is the pre-merge source proof path for pull requests into `main`.
- The durable merge-gate jobs are `static` and `integration`.
- `static` runs app and package lint, the app format check, package typechecks, app unit tests, app contract tests, package tests, root script tests, critical coverage, package smoke checks, worker compatibility smoke, and the app build.
- `integration` runs the integration test suite.
- `static` disables PostHog source-map upload during its app build so pull request proof remains source-level and non-provider-backed.
- Keep `static` and `integration` as the required context names unless branch protection or ruleset enforcement is verified and this workflow documentation is updated in the same change. Private-repo branch protection and ruleset APIs can return a plan-gated `403`, which is inconclusive rather than proof that enforcement is absent.

## Post-Merge On `main`

- `ci.yml` also runs on pushes to `main` so the merged source tree is rechecked.
- `production-release-proof.yml` runs hosted production proof after pushes to `main` and on manual dispatch. It waits for the matching Vercel production deployment with the `www.man-meets-ai.com` alias, waits for the same-commit Convex production deploy summary to prove an actual deploy when the release scope is Convex-sensitive, runs `default_ship`, and runs `billing_integration` when the release scope requires it.
- `convex-production-deploy.yml` owns Convex production deployment from `main`. Automatic deploys remain controlled by `CONVEX_PRODUCTION_DEPLOY_ENABLED`.

## Dev Payment Staging

- `dev-staging-payment-proof.yml` runs on pushes to the `dev` branch and on manual dispatch.
- It waits for the `dev.man-meets-ai.com` branch-domain Preview deployment, pulls Vercel Preview env, bypasses Vercel Deployment Protection for automation, and runs a Stripe test-mode card through hosted Checkout.
- Before the browser card proof, it runs the managed Stripe verifier in test mode and requires the Stripe Dashboard webhook endpoint to target the exact Convex HTTP-actions URL with the checkout completion events and a no-cost Checkout-compatible webhook API version.
- This lane proves the app checkout route, hosted Stripe redirect, paid test-mode Checkout Session, paid test-mode PaymentIntent, and return to `/checkout/success` on the actual dev staging URL. It is not release authority and does not replace production proof on `main`.

## Tag Publication

- `release.yml` runs on protected `v*` tags and manual dispatch.
- It validates `release.json`, confirms the tag target is the verified `main` SHA, downloads same-commit production proof summary artifacts from the latest push or manual production proof run after that run completes, builds `release-evidence.v1`, builds release notes from the matching `CHANGELOG.md` section, and publishes the GitHub Release only after publish-mode evidence passes.
- Hosted proof states come from `production-release-proof-summary` and, when Convex-sensitive, `convex-production-deploy-summary`. Missing, corrupt, wrong-commit, or skipped-required summaries fail closed instead of being inferred from check-run names.
- Tags attest a verified `main` production SHA. They do not replace hosted production proof.

## Repair And Non-Release Lanes

- `issue-labels.yml` keeps managed labels available for the issue templates.
- `dev-staging-payment-proof.yml` is current proof only for the `dev.man-meets-ai.com` test-mode payment lane.
- Remote-only workflows such as `Deployment Smoke` are not current proof unless a tracked workflow file owns them. Disable or replace them during the remote landing pass.

## Rule Of Thumb

- Keep PR checks fast and source-level.
- Put hosted environment proof after merge on `main`.
- Put release publication behind protected semver tags.
- Do not add a required status context unless branch protection and this directory can be updated together.
