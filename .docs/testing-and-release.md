# Testing and release

## QA operating model

Ship by Sunday treats QA as a control plane, not a loose collection of test files.

Source-of-truth surfaces:

- `qa/README.md`
- `qa/journeys.csv`
- `qa/coverage.csv`
- `qa/runs/`

The main release-critical pack is `default_ship`. `billing_integration` is the separate commercial-path proof pack.

Ordinary CI should fail on QA control-plane drift before release workflows do. `qa:validate` plus an inventory-sync diff check belong in the standing CI path, not just in staging or production proof.

Use `dev` first for integrated staging proof and `prod` second for release evidence.

## Common verification surfaces

- lint
- format check
- unit tests
- contract tests
- integration tests
- integration-ui tests
- browser smoke
- local-auth or sandbox e2e
- build

For docs-only or planning-only changes, broad runtime checks are usually unnecessary. Say so explicitly when skipping them.

## Branch model

- Feature branches start from `dev` and merge back into `dev`.
- `dev` is the integrated staging branch.
- `main` is the production release branch.
- Hotfixes branch from `main` and must merge or cherry-pick back into `dev`.

## Release expectations

Standard release path:

1. Branch from `dev`.
2. Run the narrowest relevant local checks first.
3. Open the PR into `dev`.
4. Run the default multi-agent review against `dev`.
5. Treat the merged `dev` tip as the release candidate.
6. Open the `dev -> main` release PR.
7. Run the default multi-agent review against `main`.
8. Merge only after the required checks pass.
9. Tag the merged `main` commit and publish the matching GitHub Release.
10. Watch the Vercel web deploy and Convex production deploy settle.

On `dev`, the release workflow should self-heal the staging alias by binding `dev.man-meets-ai.com` to the exact ready preview deployment for the current `dev` commit. When the release changed `apps/web/convex/`, the workflow should also sync hosted Convex dev automatically before browser proof starts.

If `dev -> main` is dirty, the standard fallback is `bun run release:snapshot -- --source-ref origin/dev --base-ref origin/main --push`. That creates a clean release branch based on `main` whose tracked tree exactly matches the intended `dev` head.

Canonical long-form runbook: `docs/release-workflow.md`.

## Billing proof rule

Only run fresh billing proof when the release touched:

- checkout
- Stripe
- entitlement
- webhooks
- purchase-to-access handoff

Use the production no-cost direct discounted Checkout path instead of a real card charge when collecting live release evidence.
