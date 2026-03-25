# Production Release Workflow

This repository ships through a two-branch release model. Daily integration happens on `dev`. Production changes happen only when code is promoted from `dev` to `main`.

## What owns production

- GitHub owns branch policy, release pull requests, hotfix policy, and the Convex production deploy workflow.
- Vercel owns production web deploys for project `mma-shipbysunday`.
- Convex owns production backend state for deployment `helpful-meadowlark-297`.

Production is healthy only when all three systems agree on the same release candidate from `main`.

## Branch model

- Feature work starts on short-lived branches and merges into `dev`.
- `dev` is the shared integration branch.
- `main` is the release branch and the GitHub default branch.
- Vercel production tracks `main`.
- `.github/workflows/convex-production-deploy.yml` deploys Convex production from `main`.
- Hotfixes branch from `main`, merge into `main`, and then merge or cherry-pick back into `dev`.

## Required standing configuration

- GitHub branch protection is enabled on both `dev` and `main`.
- `main` requires pull requests, one approval, last-push approval, and the `static`, `integration`, and `browser-smoke` checks.
- `dev` requires pull requests plus the same always-on checks, but not a formal approval.
- Vercel project `mma-shipbysunday` is linked to `ParkerRex/mma-shipbysunday` and uses `main` as its production branch.
- GitHub repository secret `CONVEX_DEPLOY_KEY` must exist before remote Convex dry-runs or production deploys can succeed.

Create that secret from the Convex dashboard for the production deployment:

1. Open `https://dashboard.convex.dev/d/helpful-meadowlark-297`.
2. Go to the deployment settings page.
3. Generate a production deploy key.
4. Store it in GitHub repository secrets as `CONVEX_DEPLOY_KEY`.

## Standard release

1. Merge feature work into `dev`.
2. From the repository root, run `bun run check`.
3. Open a release pull request from `dev` into `main`.
4. Merge only after GitHub checks are green.
5. Watch Vercel create the production web deploy from `main`.
6. Watch GitHub Actions run `Convex Production Deploy` for the same merge.
7. Run one real buyer-flow check in production.

Useful verification commands:

```bash
gh run list --repo ParkerRex/mma-shipbysunday --workflow ci.yml --limit 10
gh run list --repo ParkerRex/mma-shipbysunday --workflow convex-production-deploy.yml --limit 10
vercel target list
cd apps/web && bunx convex logs --prod --history 20
```

## Manual Convex dry-run

Before the first live production promotion, run the Convex workflow manually in dry-run mode:

```bash
gh workflow run convex-production-deploy.yml --repo ParkerRex/mma-shipbysunday -f dry_run=true
```

That workflow defaults to dry-run when manually dispatched. A successful run proves the GitHub secret, checkout, Bun install, and `bunx convex deploy --dry-run -y` path are wired correctly.

## Hotfix path

Use the hotfix path only for production emergencies.

1. Branch from `main`.
2. Open a pull request into `main`.
3. Merge after the required checks pass.
4. Back-merge or cherry-pick the same fix into `dev` immediately.

Do not leave `main` and `dev` drifting after a hotfix.

## Explicit non-goal

This workflow does not set up dedicated Convex-backed preview environments for non-`main` Vercel branches. Preview web deployments can still exist, but backend preview isolation is a separate initiative.
