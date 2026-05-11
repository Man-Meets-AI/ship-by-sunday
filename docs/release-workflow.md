# Production Release Workflow

This repository now follows the Codex-style delivery model: branch from `main`, open focused pull requests into `main`, merge only after fast required checks pass, let hosted proof run after the merge to `main`, and publish stable releases from protected `vMAJOR.MINOR.PATCH` tags that point at verified `main` commits.

The retired model used a shared `dev` release-candidate branch, `dev -> main` release pull requests, release triage, snapshot fallback, and release-intake exports. Those paths are no longer active release machinery. The current `dev` branch is payment staging only: it backs the Vercel Preview branch domain at `https://dev.man-meets-ai.com` so operators can run real hosted Checkout in Stripe test mode before or after a production fix. It is not release authority.

## What Owns Production

- GitHub owns branch policy, pull request checks, protected tag release publication, Convex production deploys, and production proof workflows.
- Vercel owns production web deploys for project `mma-shipbysunday`.
- Convex owns production backend state for deployment `helpful-meadowlark-297`.

Production is healthy only when GitHub, Vercel, and Convex agree on the same `main` commit. Tags attest that verified `main` commit; they do not deploy a separate application tree.

## Current CI/CD Proof Path

The current workflow strategy is summarized beside the workflow files in `.github/workflows/README.md`.

- `CI` is the fast source proof surface from `.github/workflows/ci.yml`. It runs on pull requests into `main`, pushes to `main`, schedule, and manual dispatch. The durable merge-gate jobs are `static` and `integration`. `static` covers app and package lint, the app format check, package typechecks, app unit and contract tests, package tests, root script tests, critical coverage, package smoke, worker compatibility smoke, and the app build with PostHog source-map upload disabled. `integration` covers the app integration suite.
- `Production Release Proof` is the hosted production post-deploy proof surface from `.github/workflows/production-release-proof.yml`. It runs on `main` pushes and manual dispatches after the production web deployment settles. Manual dispatch requires the base commit SHA for release-scope detection; do not leave the scope implicit. It requires the matching Vercel deployment to own the `www.man-meets-ai.com` alias. When the release scope is Convex-sensitive, it also waits for a successful same-commit `Convex Production Deploy` summary that proves `deployMode: deploy` and a successful deploy step, and fails closed if automatic Convex production deploys are paused.
- `Convex Production Deploy` is the production backend deploy surface from `.github/workflows/convex-production-deploy.yml`. It runs on `main` pushes and manual dispatches and is controlled by the `CONVEX_PRODUCTION_DEPLOY_ENABLED` variable for automatic deploys.
- `Tag Release` is the protected `v*` tag workflow from `.github/workflows/release.yml`. It validates `release.json`, collects same-commit production proof summary artifacts for the tag target from the latest push or manual production proof run after that run completes, builds the GitHub Release body from the matching `CHANGELOG.md` section, and publishes the GitHub Release only after evidence is available.

## Branch Model

- Feature work starts on short-lived branches created from the current `main`.
- Pull requests target `main`.
- `main` is the single integration and production branch.
- Vercel production tracks `main`.
- `.github/workflows/convex-production-deploy.yml` deploys Convex production from `main`.
- The old shared `dev` release-candidate path is retired. Do not open or reopen `dev -> main` release pull requests.
- `dev` is a branch-backed Vercel Preview payment staging lane. Push to `dev` only when intentionally refreshing `https://dev.man-meets-ai.com` from a known commit for Stripe test-mode checkout proof.
- Hotfixes branch from `main`, open a pull request into `main`, and use the same post-merge production proof and tag rules as ordinary releases.

## Versioning And Release Notes

- Stable release tags use `vMAJOR.MINOR.PATCH`, for example `v0.3.0`.
- Optional prerelease tags are reserved for future prerelease channels and should use semver prerelease suffixes such as `v0.3.0-rc.1`.
- While the repo is pre-1.0, the minor digit marks the next ordinary release cut from `main`, and the patch digit is reserved for hotfixes and backports.
- Every GitHub Release must be created from the verified `main` tag and backed by the matching `CHANGELOG.md` entry. The release workflow uses that section as the GitHub Release notes and appends the release-evidence summary. Do not publish the release until the changelog section exists.

## Tag Release Identity Contract

The release source of truth is `release.json` at the repository root. Its fields are:

- `schemaVersion`: the manifest schema, currently `release-manifest.v1`
- `version`: semver without the leading `v`
- `channel`: `stable` or an explicit prerelease channel
- `gitTag`: the expected `vMAJOR.MINOR.PATCH` tag for the version
- `changelogHeading`: the exact `CHANGELOG.md` heading for the release notes
- `releaseEvidenceSchemaVersion`: the evidence artifact schema version
- `notes`: optional operator notes that are not used for validation

Validate the manifest locally with:

```bash
bun run release:manifest:check
```

The machine-readable release evidence artifact is a `release-evidence.v1` document generated by `scripts/release/build-release-evidence.mjs` and uploaded by `.github/workflows/release.yml`. It binds the tag, tag target SHA, `main` SHA, workflow runs, Vercel production proof, Convex production proof, billing proof, auth proof, entitlement proof, changelog heading, and GitHub Release publication state.

Hosted proof states in tag evidence are derived from summary artifacts, not check-run names. `production-release-proof-summary` supplies Vercel, auth, entitlement, billing, and release-scope facts, and can come from a same-commit push proof or manual proof rerun. If a newer same-commit production proof run is still active or completed unsuccessfully, tag evidence collection fails closed instead of using an older summary. `convex-production-deploy-summary` is required only when production proof says the release was Convex-sensitive. A skipped billing job is `not_required` only when the selected production summary says `billingSensitive=false`; a skipped or failed Convex deploy is never `passed`.

Build a local diagnostic evidence artifact with:

```bash
bun run release:evidence:build
```

Publish-mode evidence fails closed until required hosted proof is `passed` or explicitly `not_required`.

## Required Standing Configuration

- The canonical GitHub repository is `Man-Meets-AI/ship-by-sunday`.
- GitHub branch protection is enabled on `main`. After repository ownership changes, verify this directly before treating `main` as protected; if GitHub returns a plan-gated `403` for branch protection or ruleset APIs, the CLI proof is inconclusive.
- `main` requires pull requests and the current source checks `static` and `integration`.
- Vercel project `mma-shipbysunday` is linked to `Man-Meets-AI/ship-by-sunday`, uses `main` as its production branch, and uses `apps/web` as its root directory. For private repository ownership changes, the Vercel GitHub App must also be installed or granted access for `Man-Meets-AI/ship-by-sunday` before automatic `main` production deploys can resume.
- `https://www.man-meets-ai.com` is the production host used by hosted proof.
- `https://dev.man-meets-ai.com` is a Vercel Preview branch domain for the `dev` branch. It must use Vercel Preview environment variables pulled with `--git-branch=dev`, including `APP_BASE_URL=https://dev.man-meets-ai.com` as the no-request fallback, Vercel system variables such as `VERCEL_BRANCH_URL`/`VERCEL_URL` for trusted request-origin checks, Stripe test-mode keys and price IDs, Clerk test-mode keys, and the hosted Convex dev URL. Checkout route handlers derive Stripe success and cancel URLs from the incoming buyer origin only when that origin is a trusted app, branch, deployment, production, or local-development origin. It is payment staging, not release-candidate authority.
- Stripe Dashboard must have an enabled webhook endpoint in each active Stripe mode at exactly `{NEXT_PUBLIC_CONVEX_SITE_URL}/stripe/webhook`, subscribed only to `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Do not use wildcard event subscriptions; release preflight rejects `enabled_events: ["*"]`. Pin the webhook endpoint API version to `2023-08-16` or later so live no-cost Checkout events render correctly and the read-only preflight can prove compatibility. Production proof and dev payment staging fail before browser billing proof if this endpoint is missing, disabled, in the wrong mode, missing those events, using wildcard events, unpinned, pinned to an older API version, or if an enabled stale app-origin `/api/stripe/webhook` endpoint remains. `STRIPE_WEBHOOK_SECRET` must be copied from that endpoint into the active environment; the read-only preflight verifies that it is configured and shaped like a Stripe webhook secret, but Stripe does not expose endpoint secrets after creation for direct comparison.
- Vercel Deployment Protection remains enabled for preview deployments. Automated browser proof for `https://dev.man-meets-ai.com` uses Vercel Protection Bypass for Automation, and GitHub repository secret `VERCEL_AUTOMATION_BYPASS_SECRET` must hold the generated bypass secret.
- Root `bunfig.toml` forces `install.linker = "hoisted"` so GitHub Actions and Vercel installs do not use Bun's isolated symlink-heavy workspace layout during builds and serverless packaging.
- `apps/web/vercel.json` removes cached `node_modules` trees before `bun install --frozen-lockfile`, because switching linkers alone does not rewrite a restored isolated-install cache.
- GitHub repository secret `CONVEX_DEPLOY_KEY` must exist before remote Convex dry-runs or production deploys can succeed.
- GitHub repository secret `VERCEL_TOKEN` plus repository variables `VERCEL_PROJECT_ID` and `VERCEL_TEAM_ID` must exist before release proofs can wait for the exact Vercel deployment.
- GitHub environment `production-billing-integration` must include `PRODUCTION_CHECKOUT_FULFILLMENT_RETRY_SECRET`, `PRODUCTION_STRIPE_SECRET_KEY`, and `PRODUCTION_STRIPE_WEBHOOK_SECRET`. These mirror the production runtime values without depending on `vercel env pull` to expose sensitive production secrets during hosted billing proof.
- GitHub repository variable `CONVEX_PRODUCTION_DEPLOY_ENABLED` is the live pause switch for automatic Convex production deploys.
- Tag protection should use a GitHub ruleset or equivalent policy for `refs/tags/v*`.

## Standard Release

1. Branch from the current `main`.
2. Keep the diff scoped and split the work into logical conventional commits.
3. From the repository root, run the narrowest relevant checks first, then broaden as needed. PR CI is the required merge gate; the repository does not install git hooks that block commits or pushes.
4. Open a pull request into `main`.
5. Review the pull request against `main`. The default review prompt is:

   `Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`

6. Merge only after required GitHub checks pass.
7. Confirm Vercel creates the production web deploy from the merged `main` commit.
8. Confirm GitHub Actions runs `Convex Production Deploy` for the same `main` commit. A non-Convex release may intentionally record a skip when automatic deploys are paused, but a Convex-sensitive release must deploy Convex production before production proof can pass.
9. Let `Production Release Proof` wait for the exact Vercel production deployment and `www.man-meets-ai.com` alias for the merged commit and, when Convex-sensitive, the same-commit Convex production deploy, then run hosted verification against `https://www.man-meets-ai.com`.
10. When the release touched checkout, homepage checkout CTAs, Stripe, entitlement, webhook, or access-handoff behavior, make sure `Production Release Proof` also runs hosted `billing_integration`.
11. Update `release.json` and `CHANGELOG.md` for the next version when the verified `main` commit is ready to publish.
12. Create the protected `vMAJOR.MINOR.PATCH` tag at the verified `main` commit.
13. Let `.github/workflows/release.yml` validate the manifest, collect same-commit production proof summary artifacts for that tag target from the latest push or manual production proof run after that run completes, build the release notes from the matching changelog section, and publish the GitHub Release.
14. Delete the local and remote feature branch after the release settles.

Useful verification commands:

```bash
gh run list --repo Man-Meets-AI/ship-by-sunday --workflow ci.yml --limit 10
gh run list --repo Man-Meets-AI/ship-by-sunday --workflow convex-production-deploy.yml --limit 10
gh run list --repo Man-Meets-AI/ship-by-sunday --workflow dev-staging-payment-proof.yml --limit 10
gh run list --repo Man-Meets-AI/ship-by-sunday --workflow production-release-proof.yml --limit 10
gh run list --repo Man-Meets-AI/ship-by-sunday --workflow release.yml --limit 10
git rev-parse origin/main
gh workflow run production-release-proof.yml --repo Man-Meets-AI/ship-by-sunday --ref main -f base_sha=<previous-main-sha>
bun run release:manifest:check
bun run release:evidence:build
bun run release:billing:doctor -- --env=production --dry-run
gh workflow run dev-staging-payment-proof.yml --repo Man-Meets-AI/ship-by-sunday --ref dev
bun run release:proof:dev-payment
PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com QA_ENV_FILE=apps/web/.env.production bun run release:proof -- --proof=default_ship
```

For dev billing verification, `bun run release:proof:dev-payment` must run against `https://dev.man-meets-ai.com` with Vercel Preview env and Stripe test-mode keys. It uses a Stripe test card, verifies the app checkout route creates a hosted Checkout Session from a homepage CTA with matching `mma_checkout_v1` Checkout Session and PaymentIntent metadata, checks hosted Checkout has Link enabled, submits hosted Checkout, confirms the test-mode Checkout Session is paid, confirms the test-mode PaymentIntent succeeded for the expected amount, confirms return to `/checkout/success`, and verifies the buyer is sent through passwordless sign-in toward `/home` instead of a checkout claim page. It also fails if the homepage precreates custom Express Checkout Sessions before a buyer clicks. This proves the application checkout path in dev staging without moving real money; it does not prove live-mode Link rails.

For production billing verification in this repo, prefer a restricted live `100% off` discount and confirm the buyer auto-forwards from `/checkout/success` through passwordless sign-in into `/home`. On production, the canonical automation should create the Checkout Session directly with the discount already attached instead of relying on promotion-code entry in Stripe's hosted UI, verify the app checkout route can create a hosted Checkout Session, expire that smoke-created session, require the direct live Checkout Session to be zero-cost before navigation, refuse to enter card details in live mode, and fail if the homepage precreates custom Express Checkout Sessions before a buyer clicks. Use [docs/internal/observability.md](./internal/observability.md) for the incident-control and webhook-origin drill.

## Manual Convex Dry-Run

Before enabling automatic Convex production deploys, run the Convex workflow manually in dry-run mode from `main`:

```bash
gh workflow run convex-production-deploy.yml --repo Man-Meets-AI/ship-by-sunday -f dry_run=true
```

After that dry-run succeeds, enable automatic `main` deploys:

```bash
gh variable set CONVEX_PRODUCTION_DEPLOY_ENABLED --repo Man-Meets-AI/ship-by-sunday --body true
```

When that variable is `false`, pushes to `main` log a skip instead of deploying Convex production. When it is `true`, future `main` merges deploy Convex production automatically.

## Hotfix Path

Use the hotfix path only for production emergencies.

1. Branch from `main`.
2. Open a pull request into `main`.
3. Run the focused local proof for the fix.
4. Merge only after required checks pass.
5. Watch Vercel, Convex, and `Production Release Proof` for that exact `main` commit.
6. Cut a patch tag from the verified commit if the hotfix needs a GitHub Release.

## Cleanup

After a release repair or hotfix:

- close or delete stale feature branches once their PRs are merged or abandoned
- keep `release.json` pointed at the next intended tag
- keep `CHANGELOG.md` aligned with the next intended tag
- verify `gh workflow list --repo Man-Meets-AI/ship-by-sunday --all` has no active remote-only workflow that operators might mistake for current release proof

## What Success Looks Like

Production is ready when a brand-new buyer can understand the offer, buy cleanly, get access without confusion, and start the product immediately, and when the release can be traced cleanly back to the `main` commit that triggered Vercel production deploy, Convex production deploy, hosted production proof, and the protected release tag.
