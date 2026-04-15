# Testing and release

## Operating model

Ship by Sunday now uses a thin Dub-style path:

- one always-on PR workflow: `.github/workflows/pr.yml`
- one deployment-status smoke workflow: `.github/workflows/deployment-smoke.yml`
- one minimal Convex production deploy workflow when backend deploy coordination is required: `.github/workflows/convex-production-deploy.yml`

The repo no longer ships through a separate release orchestration layer, pack runner, persona bootstrap, coverage CSV, or checked-in run report system.

## Common verification surfaces

- format
- lint
- typecheck
- test
- contract tests
- build
- browser smoke

The root command surface is the source of truth:

- `bun run format`
- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run test:contracts`
- `bun run build`
- `bun run test:e2e`

For docs-only or planning-only changes, broad runtime checks are usually unnecessary. Say so explicitly when skipping them.

## Branch model

- Feature branches start from `dev` and merge back into `dev`.
- `dev` is the integrated staging branch.
- `main` is the production release branch.
- Hotfixes branch from `main` and must merge or cherry-pick back into `dev`.

## Release expectations

1. Branch from `dev`.
2. Run the narrowest relevant local checks first.
3. Open the PR into `dev`.
4. Let `.github/workflows/pr.yml` prove the code-centric path.
5. Treat the merged `dev` tip as the release candidate.
6. Open the `dev -> main` release PR.
7. Merge only after the required PR jobs are green.
8. Tag the merged `main` commit and publish the matching GitHub Release.
9. Watch Vercel deploy the web app.
10. Watch `.github/workflows/deployment-smoke.yml` verify the deployed URL directly.
11. Watch `.github/workflows/convex-production-deploy.yml` when the release includes backend changes that still require a production Convex deploy.

Canonical long-form runbook: `docs/release-workflow.md`.

## Billing proof rule

Checkout and entitlement are now protected by:

- direct route and integration tests in domain folders such as `apps/web/tests/checkout/`
- offline Convex contract coverage in domain files such as `apps/web/tests/checkout/*.convex-contract.test.ts`
- deployment smoke that can hit the real checkout-session creation endpoint when the deployed environment is ready

Do not rebuild a separate billing pack on top of those layers.
