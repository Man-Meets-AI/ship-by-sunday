# Production Release Workflow

This repository uses short-lived branches into `main`, local verification, Vercel's
Git integration for the web deployment, and an explicit operator-controlled Convex
deployment. It does not contain GitHub Actions workflows.

## Ownership

- GitHub owns source review, pull requests, branch policy, tags, and releases.
- Vercel owns the production web deployment from `main`.
- Convex owns production backend state and is deployed explicitly by an operator.
- `scripts/release/` owns local release proof and evidence generation.
- `release.json` owns the intended release version and tag identity.

Production is healthy only when Vercel and Convex serve the intended `main` commit.

## Branch Model

- Start feature and hotfix branches from the current `main`.
- Open pull requests into `main`.
- Run the repository checks locally before merge.
- Keep `dev` only as the Vercel Preview payment-staging branch.
- Cut stable `vMAJOR.MINOR.PATCH` tags only from a verified `main` commit.

## Required Local Verification

Run the narrowest affected checks first, then the repository gates:

```bash
bun run format
bun run lint
DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
bun run test:unit
bun run test:contracts
bun run test:packages
bun run test:integration
```

For release-sensitive changes, also run:

```bash
bun run release:manifest:check
bun run release:evidence:build
bun run release:proof -- --proof=default_ship --dry-run
```

Checkout, billing, auth, entitlement, or access changes require the matching hosted
proof against the intended environment. Keep test-mode and production proof separate,
and never move live money solely to validate a release.

## Standard Release

1. Branch from `main` and keep the change focused.
2. Run the relevant local checks and review the diff.
3. Open and review a pull request into `main`.
4. Merge only after the local proof is recorded and any configured repository policy
   is satisfied.
5. Confirm Vercel deploys the merged `main` commit and owns the production alias.
6. From `apps/web`, run `bunx convex deploy --dry-run -y` against the intended
   production deployment. For Convex-sensitive changes, perform the approved production
   deploy and verify it completed.
7. Run the hosted release proof against the deployed application when the change is
   release-sensitive.
8. Update `release.json` and `CHANGELOG.md`, create the matching protected tag, and
   publish the GitHub Release from the verified commit.
9. Delete the merged feature branch after the release settles.

## Dev Payment Proof

`https://dev.man-meets-ai.com` is the Vercel Preview payment environment backed by the
`dev` branch. It uses Stripe test-mode credentials and hosted Convex dev. Run:

```bash
bun run release:proof:dev-payment
```

The proof must confirm the selected offer, hosted Checkout completion, successful
test-mode payment state, checkout return, and the expected post-purchase route.

## Production Billing Proof

Use a restricted live 100%-off discount for automated production proof. The proof must
refuse to enter card details in live mode, verify the undiscounted line-item amount and
access grant, and expire any smoke-created Checkout Session after inspection.

```bash
PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com \
QA_ENV_FILE=apps/web/.env.production \
bun run release:proof -- --proof=default_ship
```

For billing-sensitive releases, add `QA_ALLOW_BILLING_INTEGRATION=1` and run the
`billing_integration` proof for the affected offer.

## Production Configuration

- Vercel tracks `main`, uses `apps/web` as its root, and owns the production alias.
- Convex production credentials stay in the approved operator environment, not files.
- Stripe webhook endpoints use exactly `{APP_BASE_URL}/api/stripe/webhook` and only the
  documented event set.
- Vercel Preview protection remains enabled for non-production deployments.
- Tag protection should cover `refs/tags/v*`.

See [internal observability](./internal/observability.md) for incident control and
webhook-origin verification.

## Hotfixes

Use the same flow for hotfixes: branch from `main`, prove the focused fix locally,
review and merge into `main`, verify Vercel and Convex explicitly, then cut a patch tag
if the fix needs a release.
