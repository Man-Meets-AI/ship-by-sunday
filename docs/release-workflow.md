# Production Release Workflow

This repository ships through short-lived feature branches into `dev`, then promotes the reviewed `dev` release candidate into `main`. The workflow layer is intentionally small: one PR workflow, one deployment smoke workflow, and one minimal Convex production deploy workflow.

## What owns production

- GitHub owns branch policy, PR checks, and the Convex production deploy workflow.
- Vercel owns web deployments for project `mma-shipbysunday`.
- Convex owns backend state for production deployment `helpful-meadowlark-297`.

Production is healthy only when all three systems agree on the same `main` release candidate.

## Required standing configuration

- GitHub branch protection is enabled on `dev` and `main`.
- `.github/workflows/pr.yml` is the only required repository-managed PR workflow.
- `.github/workflows/deployment-smoke.yml` runs on `deployment_status` and verifies the real deployed URL directly.
- `.github/workflows/convex-production-deploy.yml` remains the only backend deploy workflow because Convex production still needs explicit coordination outside Vercel.
- Vercel project `mma-shipbysunday` is linked to `ParkerRex/mma-shipbysunday` and uses `main` as its production branch.
- Root `bunfig.toml` keeps Bun on the hoisted linker.
- `apps/web/vercel.json` keeps Vercel on the clean-install path the repo expects.
- GitHub repository secret `CONVEX_DEPLOY_KEY` must exist before remote Convex dry-runs or production deploys can succeed.
- GitHub repository variable `CONVEX_PRODUCTION_DEPLOY_ENABLED` is the live pause switch for automatic Convex production deploys.

## Standard release

1. Branch from the current `dev`.
2. Keep the diff scoped.
3. From the repository root, run the narrowest relevant checks first, then broaden as needed.
4. Open a pull request into `dev`.
5. Run the default multi-agent review against `dev`.
6. Merge only after `.github/workflows/pr.yml` is green.
7. Treat the merged `dev` tip as the release candidate.
8. Open the `dev -> main` release PR.
9. Run the default multi-agent review against `main`.
10. Merge only after the required PR jobs are green again.
11. Tag the merged `main` commit with the next version and publish the matching GitHub Release.
12. Watch Vercel create the production web deploy from the merged `main` commit.
13. Watch `.github/workflows/deployment-smoke.yml` verify the deployed URL for that release.
14. Watch `.github/workflows/convex-production-deploy.yml` when the release includes backend changes that still need a production Convex deploy.

## Verification commands

Use these from the repository root:

```bash
bun run format
bun run lint
bun run typecheck
bun run test
bun run test:contracts
bun run build
bun run test:e2e
gh run list --repo ParkerRex/mma-shipbysunday --workflow pr.yml --limit 10
gh run list --repo ParkerRex/mma-shipbysunday --workflow deployment-smoke.yml --limit 10
gh run list --repo ParkerRex/mma-shipbysunday --workflow convex-production-deploy.yml --limit 10
```

## Billing and checkout proof

The shipping path no longer uses a separate billing pack or hosted QA orchestration. Checkout and entitlement are protected by:

- direct integration coverage for `/api/stripe/checkout`
- offline Convex contract tests for pending checkout claims and access grants
- deployment smoke that can hit the real deployed checkout-session creation path by setting `PLAYWRIGHT_CHECKOUT_SMOKE=1`

If the deployed checkout smoke fails, debug the deployed environment first. A drifted Stripe key or price id is now supposed to fail in the deployment smoke workflow rather than in a second proof system.

## Hotfix path

Use the hotfix path only for production emergencies.

1. Branch from `main`.
2. Open a pull request into `main`.
3. Run the same multi-agent review used for ordinary releases.
4. Merge after the required checks pass.
5. Tag the merged `main` commit with the next patch version and publish the matching release.
6. Merge or cherry-pick the hotfix back into `dev` immediately after release.
