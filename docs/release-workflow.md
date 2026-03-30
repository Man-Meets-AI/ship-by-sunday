# Production Release Workflow

This repository ships through short-lived pull request branches into `main`. There is no long-lived integration branch. Production changes happen when a reviewed feature branch merges into `main`.

## What owns production

- GitHub owns branch policy, release pull requests, hotfix policy, and the Convex production deploy workflow.
- Vercel owns production web deploys for project `mma-shipbysunday`.
- Convex owns production backend state for deployment `helpful-meadowlark-297`.

Production is healthy only when all three systems agree on the same release candidate from `main`.

## Branch model

- Feature work starts on short-lived branches created from the current `main`.
- `main` is both the GitHub default branch and the production release branch.
- Vercel production tracks `main`.
- `.github/workflows/convex-production-deploy.yml` deploys Convex production from `main`.
- Hotfixes also branch from `main` and merge back into `main`.

## Required standing configuration

- GitHub branch protection is enabled on `main`.
- `main` requires pull requests and the `static`, `integration`, and `browser-smoke` checks.
- Vercel project `mma-shipbysunday` is linked to `ParkerRex/mma-shipbysunday` and uses `main` as its production branch.
- Root `bunfig.toml` forces `install.linker = "hoisted"` so GitHub Actions and Vercel installs do not use Bun's isolated symlink-heavy workspace layout during builds and serverless packaging.
- `apps/web/vercel.json` overrides the Vercel install step to remove cached `node_modules` trees before `bun install --frozen-lockfile`, because switching linkers alone does not rewrite a restored isolated-install cache.
- GitHub repository secret `CONVEX_DEPLOY_KEY` must exist before remote Convex dry-runs or production deploys can succeed.
- GitHub repository variable `CONVEX_PRODUCTION_DEPLOY_ENABLED` is the live pause switch for automatic Convex production deploys. It is `true` after the first successful dry-run; set it back to `false` if you need to pause automatic `main` deploys.

Create that secret from the Convex dashboard for the production deployment:

1. Open `https://dashboard.convex.dev/d/helpful-meadowlark-297`.
2. Go to the deployment settings page.
3. Generate a production deploy key.
4. Store it in GitHub repository secrets as `CONVEX_DEPLOY_KEY`.

## Standard release

1. Branch from the current `main`.
2. Keep the diff scoped and split the work into logical conventional commits.
3. From the repository root, run the narrowest relevant checks first, then broaden as needed. Use `bun run check` when the slice justifies a full pass.
4. Open a pull request from the feature branch into `main`.
5. Run the default multi-agent PR review against `main`:

   `Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`

6. Fix substantive findings and merge only after `static`, `integration`, and `browser-smoke` are green.
7. Watch Vercel create the production web deploy from the merged `main` commit.
8. Watch GitHub Actions run `Convex Production Deploy` for the same merged `main` commit.
9. Run the `default_ship` QA pack against production with matching production Clerk env values when the change warrants post-deploy proof.
10. When you need billing confidence on production, use the documented live no-cost Checkout proof instead of a real card charge.
11. Delete the local and remote feature branch after the release settles.

Useful verification commands:

```bash
gh run list --repo ParkerRex/mma-shipbysunday --workflow ci.yml --limit 10
gh run list --repo ParkerRex/mma-shipbysunday --workflow convex-production-deploy.yml --limit 10
vercel target list
cd apps/web && bunx convex logs --prod --history 20
PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com QA_ENV_FILE=apps/web/.env.production bun run qa:run-pack -- --pack=default_ship
```

For production billing verification in this repo:

- prefer a restricted live `100% off` promotion code
- verify Stripe points at the Convex `.convex.site` webhook URL, not the app origin
- verify Convex production has both `STRIPE_WEBHOOK_SECRET` and `STRIPE_SECRET_KEY`
- confirm the buyer auto-forwards from `/checkout/success` into `/start`

For that production QA command:

- `qa/personas.local.json` supplies the QA account emails and passwords
- `QA_ENV_FILE` selects the production Clerk and Convex env values
- `PLAYWRIGHT_BASE_URL` points the browser pack at production

If persona prep fails on a Clerk publishable-key mismatch, fix env parity before spending time on packet-route debugging.

The current production billing evidence is already captured in:

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
5. Watch the production web and Convex deploys settle before deleting the branch.

## Explicit non-goal

This workflow does not set up dedicated Convex-backed preview environments for non-`main` Vercel branches. Preview web deployments can still exist, but backend preview isolation is a separate initiative.
