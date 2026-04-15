# Production Release Workflow

This repository ships through short-lived feature branches into `dev`, then promotes the reviewed `dev` release candidate into `main`. `dev` is the integrated staging branch, `main` is production only, and feature branches are preview-only until they merge into `dev`.

## What owns production

- GitHub owns branch policy, release pull requests, hotfix policy, and the Convex production deploy workflow.
- Vercel owns production web deploys for project `mma-shipbysunday`.
- Convex owns production backend state for deployment `helpful-meadowlark-297`.

Production is healthy only when all three systems agree on the same release candidate from `main`, and staging is healthy when `dev` is the integrated proof point for auth, Convex, and Stripe test-mode billing.

## Branch model

- Feature work starts on short-lived branches created from the current `dev`.
- Feature branches are preview-only until they merge into `dev`.
- `dev` is the integrated staging branch and the normal merge target for feature work.
- `main` is the production release branch.
- Vercel production tracks `main`.
- `.github/workflows/convex-production-deploy.yml` deploys Convex production from `main`.
- Hotfixes branch from `main`, merge into `main` for the emergency release, and then merge or cherry-pick back into `dev`.

## Versioning and release notes

- `v0.1.0` is the first GitHub Release and the first tag cut from `main`.
- While the repo is pre-1.0, the minor digit marks the next ordinary release cut from `main`, and the patch digit is reserved for hotfixes and backports. `1.0.0` stays off the table until the product contract is intentionally stabilized.
- Every GitHub Release must be created from the merged `main` tag and backed by the matching `CHANGELOG.md` entry. Do not publish the release until the changelog section exists.

## Required standing configuration

- GitHub branch protection is enabled on `dev` and `main`.
- `.github/workflows/ci.yml` should fail early on QA control-plane drift by running `qa:validate` and checking that `qa:inventory:sync` leaves `qa/test-inventory.csv` unchanged.
- `dev` requires pull requests and the code-centric CI checks. After each merge into `dev`, the resulting branch tip must also pass `Dev Staging Proof` before that `dev` commit is treated as a release candidate for `main`.
- `main` requires pull requests and the `static`, `integration`, `browser-smoke`, and `cli` checks.
- Vercel project `mma-shipbysunday` is linked to `ParkerRex/mma-shipbysunday` and uses `main` as its production branch.
- The staging host `https://dev.man-meets-ai.com` must stay aliased to the current `dev` preview deployment. `Dev Staging Proof` should bind that alias automatically to the exact ready preview deployment for the current `dev` commit; manual `vercel alias set` is now a recovery tool, not the normal path.
- Root `bunfig.toml` forces `install.linker = "hoisted"` so GitHub Actions and Vercel installs do not use Bun's isolated symlink-heavy workspace layout during builds and serverless packaging.
- `apps/web/vercel.json` overrides the Vercel install step to remove cached `node_modules` trees before `bun install --frozen-lockfile`, because switching linkers alone does not rewrite a restored isolated-install cache.
- GitHub repository secret `CONVEX_DEPLOY_KEY` must exist before remote Convex dry-runs or production deploys can succeed.
- GitHub repository secret `VERCEL_TOKEN` plus repository variables `VERCEL_PROJECT_ID` and `VERCEL_TEAM_ID` must exist before the release proofs can wait for the exact Vercel deployment for either the staged `dev` commit or the merged `main` commit.
- GitHub repository variable `CONVEX_PRODUCTION_DEPLOY_ENABLED` is the live pause switch for automatic Convex production deploys. It is `true` after the first successful dry-run; set it back to `false` if you need to pause automatic `main` deploys.

Create that secret from the Convex dashboard for the production deployment:

1. Open `https://dashboard.convex.dev/d/helpful-meadowlark-297`.
2. Go to the deployment settings page.
3. Generate a production deploy key.
4. Store it in GitHub repository secrets as `CONVEX_DEPLOY_KEY`.

## Standard release

1. Branch from the current `dev`.
2. Keep the diff scoped and split the work into logical conventional commits.
3. From the repository root, run the narrowest relevant checks first, then broaden as needed. Install the committed local hooks once with `bun run hooks:install`. After that, `git commit` runs `bun run precommit` and `git push` runs `bun run prepush`. Use `bun run check` when the slice justifies a fuller local pass.
4. Open a pull request from the feature branch into `dev`.
5. Run the default multi-agent PR review against `dev`:

   `Review this branch against dev. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`

6. Merge the feature branch into `dev` only after the code-centric checks for the staging candidate are green.
7. Treat `dev` as the release candidate branch. After the merge, wait for the aggregate `release_gate` job from `Dev Staging Proof` on the resulting `dev` commit. That job is the integrated staging proof and must be green before you open the `dev -> main` release pull request.
   If the release touched `apps/web/convex/`, `Dev Staging Proof` should sync hosted Convex dev automatically before browser proof. A green Vercel preview alone is not enough when the staged frontend has outrun hosted Convex dev.
8. Run the default multi-agent PR review against `main` for the release pull request:

   `Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`

9. Fix substantive findings and merge the `dev -> main` release PR only after `static`, `integration`, `browser-smoke`, and `cli` are green.
   If the `dev -> main` PR is `DIRTY`, do not hand-resolve the release in the PR UI. Create a clean release snapshot branch from `main` whose working tree exactly matches the intended `dev` head, then open the production PR from that snapshot branch instead.
10. Tag the merged `main` commit with the next pre-1.0 version and publish the matching GitHub Release from that tag. Copy or summarize the notes from the corresponding `CHANGELOG.md` section before publishing.
11. Watch Vercel create the production web deploy from the merged `main` commit.
12. Watch GitHub Actions run `Convex Production Deploy` for the same merged `main` commit.
13. Let the `Production Release Proof` workflow wait for the exact Vercel production deployment for the merged commit, then run the hosted post-deploy verification against `https://www.man-meets-ai.com`.
14. When the release touched checkout, Stripe, entitlement, webhook, or access-handoff behavior, `Production Release Proof` should also run hosted `billing_integration` automatically. Skip this extra proof only for unrelated docs or presentation changes.
15. Before hosted billing proof starts on `dev` or `main`, verify the managed Stripe env and the deployed `/api/stripe/checkout` route against the target host so stale `STRIPE_PRICE_ID` or `STRIPE_PRODUCT_ID` values fail fast.
16. Delete the local and remote feature branch after the release settles.

Useful verification commands:

```bash
gh run list --repo ParkerRex/mma-shipbysunday --workflow ci.yml --limit 10
gh run list --repo ParkerRex/mma-shipbysunday --workflow convex-production-deploy.yml --limit 10
gh run list --repo ParkerRex/mma-shipbysunday --workflow production-release-proof.yml --limit 10
vercel target list
cd apps/web && bunx convex logs --prod --history 20
PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com QA_ENV_FILE=apps/web/.env.production bun run qa:run-pack -- --pack=default_ship
cd apps/web && bun --env-file=.env.local scripts/verify-managed-stripe-env.ts --expected-mode=test --app-base-url=https://dev.man-meets-ai.com
cd apps/web && bun --env-file=.env.production scripts/verify-managed-stripe-env.ts --expected-mode=live --app-base-url=https://www.man-meets-ai.com
bun run release:snapshot -- --source-ref origin/dev --base-ref origin/main --push
```

For staging or production billing verification in this repo, prefer a restricted live `100% off` discount and confirm the buyer auto-forwards from `/checkout/success` into `/start`. On production, the canonical automation should create the Checkout Session directly with the discount already attached instead of relying on promotion-code entry in Stripe’s hosted UI. Use [docs/internal/observability.md](./internal/observability.md) for the incident-control and webhook-origin drill.

The snapshot helper is the standard fallback when the release candidate is good but the branch histories make `dev -> main` non-mergeable. It creates a temporary branch on top of the current `main`, copies the exact tracked tree from `dev`, commits that snapshot, and optionally pushes it. The important invariant is that the snapshot branch’s tree matches `dev`, while its parent commit stays on `main`, so GitHub can review and merge it cleanly.

For the matching QA command:

- `qa/personas.local.json` supplies the QA account emails and passwords
- `QA_ENV_FILE` selects the Clerk and Convex env values for the target environment and is resolved from the repository root in CI, for example `apps/web/.env.production`
- `PLAYWRIGHT_BASE_URL` points the browser pack at the target environment
- production bootstrap can derive `CONVEX_DEPLOYMENT` from `NEXT_PUBLIC_CONVEX_URL`, so the production env file does not have to carry a separate `CONVEX_DEPLOYMENT` entry

If persona prep fails on a Clerk publishable-key mismatch, fix env parity before spending time on blueprint-route debugging.

The current durable release-proof evidence is captured in:

- `qa/runs/2026-04-01-release-proof-final-green.md`

Historical production billing repair evidence remains in:

- `qa/runs/2026-03-25-prod-billing-integration-webhook-fix.md`
- `qa/runs/2026-03-25-prod-billing-integration-automatic-rerun.md`

## Manual Convex dry-run

Before the first live production promotion, run the Convex workflow manually in dry-run mode:

```bash
gh workflow run convex-production-deploy.yml --repo ParkerRex/mma-shipbysunday -f dry_run=true
```

That workflow defaults to dry-run when manually dispatched. A successful run proves the GitHub secret, checkout, Bun install, and `bunx convex deploy --dry-run -y` path are wired correctly.

After that dry-run succeeds, enable automatic `main` deploys:

```bash
gh variable set CONVEX_PRODUCTION_DEPLOY_ENABLED --repo ParkerRex/mma-shipbysunday --body true
```

When that variable is `false`, pushes to `main` log a skip instead of deploying Convex production. When it is `true`, future `main` merges deploy Convex production automatically.

## Hotfix path

Use the hotfix path only for production emergencies.

1. Branch from `main`.
2. Open a pull request into `main`.
3. Run the same multi-agent PR review used for ordinary releases.
4. Merge after the required checks pass.
5. Tag the merged `main` commit with the next patch version and publish the matching changelog-backed GitHub Release.
6. Merge or cherry-pick the hotfix back into `dev` immediately after release.
7. Watch the production web and Convex deploys settle before deleting the branch.

## Explicit non-goal

This workflow does not set up dedicated Convex-backed preview environments for feature branches. Preview web deployments can still exist, but backend preview isolation is a separate initiative.
