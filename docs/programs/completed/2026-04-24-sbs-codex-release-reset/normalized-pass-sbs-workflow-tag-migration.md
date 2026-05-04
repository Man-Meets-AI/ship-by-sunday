# Ship By Sunday Workflow And Tag Migration Normalized

## Facts

- SBS is branch-driven today: feature branches into `dev`, `dev -> main`, then production tracks `main`.
- `docs/release-workflow.md:103` says to merge `dev -> main`, then tag the merged `main` commit and publish a GitHub Release.
- `dev-staging-proof.yml`, `production-release-proof.yml`, and `convex-production-deploy.yml` are branch-push workflows.
- The source research reported branch protection requires `static`, `integration`, `browser-smoke`, and `cli` on `dev` and `main`, but not `qa_control_plane`, `release_gate`, `Dev Staging Proof`, or `Production Release Proof`.
- SBS has no reported tag rulesets, while Codex protects release tags.
- SBS package versions are private and repeated as `0.1.0`; no single release-grade version source has been established.
- SBS release artifacts are operational evidence, not packaged binaries or npm release assets.
- Vercel production and Convex production currently track `main`, so a tag-driven flow must deploy or attest the exact tagged SHA.
- Billing proof remains necessary and has no Codex equivalent.
- `qa/scripts/lib/release-triage-source.mjs:333` and related release triage code are shaped around `origin/dev`, `origin/main`, release PRs, and `dev.man-meets-ai.com`.
- `.github/workflows/dev-staging-proof.yml:42` scopes dev candidate diffs from `github.event.before` to `github.sha`, which can under-scope multi-commit integrated candidates.
- The source research reported an orphaned remote `Deployment Smoke` workflow absent from the local checkout.

## Recommendation

Move SBS release ownership toward protected semver tags, but adapt the tag workflow to hosted product realities: exact Vercel and Convex SHA identity, billing/entitlement proof, release evidence artifacts, and GitHub Release publication from verified evidence.

## Risks

- A tag workflow that only attests after `main` deploys may not be strong enough if the deployed SHA can drift from the tag.
- Deploying directly from tags may require Vercel/Convex workflow changes beyond the current branch-tracking setup.
- Removing `dev -> main` machinery before release triage and billing proof are reshaped would break current release safety.
- Existing required checks may remain stale in branch protection after workflow changes.
- Orphaned remote workflows can keep producing confusing Actions history unless removed or replaced.

## Code Seams

- `.github/workflows/ci.yml`
- `.github/workflows/dev-staging-proof.yml`
- `.github/workflows/production-release-proof.yml`
- `.github/workflows/convex-production-deploy.yml`
- `.github/workflows/sandbox-e2e-nightly.yml`
- remote `.github/workflows/deployment-smoke.yml`
- `docs/release-workflow.md`
- `qa/README.md`
- `qa/scripts/lib/release-triage-source.mjs`
- `qa/scripts/lib/release-triage.mjs`
- `qa/scripts/release-triage.mjs`
- `package.json`
- `apps/web/package.json`
- `packages/codebase-compiler/package.json`
- GitHub branch and tag rulesets
- Vercel production project settings
- Convex production deploy workflow
- Stripe billing proof path

## Proposed Slices

1. Define release identity: tag pattern, version source, and protected tag rules.
2. Replace branch-shaped release triage with tag/SHA-shaped release evidence.
3. Attach Vercel, Convex, and billing proof to the tagged SHA.
4. Remove obsolete `dev -> main` snapshot/reconcile release lanes after tag release works.
5. Clean orphaned or stale remote workflow surfaces.

