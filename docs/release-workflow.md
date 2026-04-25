# Production Release Workflow

This repository ships through short-lived feature branches into `dev`, then promotes the reviewed `dev` release candidate into `main`. `dev` is the integrated staging branch, `main` is production only, and feature branches are preview-only until they merge into `dev`.

## What owns production

- GitHub owns branch policy, release pull requests, hotfix policy, and the Convex production deploy workflow.
- Vercel owns production web deploys for project `mma-shipbysunday`.
- Convex owns production backend state for deployment `helpful-meadowlark-297`.

Production is healthy only when all three systems agree on the same release candidate from `main`, and staging is healthy when `dev` is the integrated proof point for auth, Convex, and Stripe test-mode billing.

## Current CI/CD Proof Path

The current workflow strategy is summarized beside the workflow files in `.github/workflows/README.md`. That file is the quickest way to see which workflow owns PR source proof, integrated `dev` proof, production hosted proof, Convex production deploys, tag release evidence, and non-release repair lanes.

- `CI` is the code-centric pull-request, `main` push, scheduled, and manual proof surface from `.github/workflows/ci.yml`. The durable merge-gate jobs are `static` and `integration`.
- `browser-smoke` and `cli` currently remain as compatibility no-ops because live branch protection still requires those status contexts. They are not release evidence and must not be treated as proof that the retired browser harness or helper CLI still owns release confidence.
- `Dev Staging Proof` is the integrated `dev` branch-push proof surface from `.github/workflows/dev-staging-proof.yml`. It proves the merged `dev` tip before that commit is trusted as a release candidate. Use `bun run release:triage` as the candidate-level authority before trusting the `dev -> main` PR.
- `Production Release Proof` is the hosted production post-deploy proof surface from `.github/workflows/production-release-proof.yml`. It runs on `main` pushes and manual dispatches after the production web deployment settles.
- `Convex Production Deploy` is the production backend deploy surface from `.github/workflows/convex-production-deploy.yml`. It runs on `main` pushes and manual dispatches and is controlled by the `CONVEX_PRODUCTION_DEPLOY_ENABLED` variable for automatic deploys.
- `Tag Release` is the protected `v*` tag workflow from `.github/workflows/release.yml`. It validates `release.json`, collects release evidence, and publishes the GitHub Release only after evidence is available.

Preserve `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/convex-production-deploy.yml`, and `.github/workflows/release.yml` unless a later plan replaces them with equal or stronger remote proof. Do not remove the compatibility `browser-smoke` and `cli` contexts until branch protection on both `dev` and `main` no longer requires them.

`Sandbox E2E Nightly` is a non-release repair lane from `.github/workflows/sandbox-e2e-nightly.yml`. It is useful regression signal, but it is not a release gate and does not replace `Dev Staging Proof` or `Production Release Proof`. Historical workflow metadata for absent workflow files is archive context, not current proof.

## Release candidate contract

A `dev` release candidate is valid only when these four facts point at the same commit:

- `origin/dev` is the candidate branch and SHA.
- the staged preview deployment for that SHA is the deployment behind `https://dev.man-meets-ai.com`.
- the staged env proof comes from the preview app env pulled into `apps/web/.env.local` plus the GitHub Actions environments `dev-staging` and `dev-staging-billing-integration`.
- the latest `release_scope`, `default_ship`, `billing_integration` when required, and `release_gate` checks are green on that same SHA.

Use `bun run release:triage` from the repository root before trusting or refreshing a `dev -> main` release PR. If `releasePath.state` is `blocked_metadata` or `blocked_unrelated_dev_scope`, stop and repair the release control plane first. If `releasePath.state` is `snapshot_required`, stop the normal release path and switch to the documented snapshot fallback instead of improvising recovery git moves.

The SBS-owned machine-readable release export lives beside that control-plane answer:

```bash
bun run engineering:intake:release -- --output tmp/release-intake.v1.json
bun run engineering:intake:snapshot -- --output tmp/engineering-intake.snapshot.v1.json
```

`engineering:intake:release` serializes the current release candidate, blocker identities, and evidence links into the frozen `release-intake.v1` contract. `engineering:intake:snapshot` is a read-only derivative that nests the authoritative runtime and release exports unchanged. The snapshot is diagnostic only; it is not a second execution lane and it must not replace the separate authoritative feeds.

Release-critical helper implementations live under `scripts/release/`. That folder owns release personas, hosted release proof orchestration, billing-sensitive proof selection, release evidence, and engineering-intake compatibility fixtures. Historical proof reports live under `docs/archive/release-proof-runs/`; they are evidence records, not an active command surface.

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

## Tag release identity contract

This is the release identity contract implemented by the manifest and tag workflow slice. Current promotion still starts with the `dev -> main` path, but release publication now has a checked-in manifest, local validators, a tag workflow, and a fail-closed release evidence artifact.

Stable release tags must use `vMAJOR.MINOR.PATCH`, for example `v0.3.0`. Optional prerelease tags are reserved for future prerelease channels and should use semver prerelease suffixes such as `v0.3.0-rc.1`. Do not introduce another tag family for production releases.

Until a later platform plan proves direct tag deployment is safer, release tags attest the verified `main` production SHA. A release tag is valid only when all of these facts are true at publication time:

- the tag target SHA is the exact merged `main` commit being released
- the Vercel production deployment behind `https://www.man-meets-ai.com` was created for that same SHA
- the Convex production deploy was run from that same SHA
- the production release proof ran against that same SHA
- the GitHub Release points at that same tag and copies or summarizes the matching `CHANGELOG.md` heading

Historical tags do not have to match the current `origin/main` tip after later releases move the branch forward. Future checks must compare each tag to evidence captured for that tag's target SHA, not to whichever commit `origin/main` points at later.

Package versions are not the release source of truth today. The existing root, app, and workspace package versions still report `0.1.0` while the latest release tag is `v0.2.0`. The release source of truth is now the dedicated `release.json` manifest at the repository root. The manifest currently prepares the next stable release candidate, `v0.3.0`, and must be updated in the release PR before cutting a different protected tag. Its fields are:

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

Tag protection should use a GitHub ruleset or equivalent policy for `refs/tags/v*`. The policy should restrict tag creation, update, and deletion to the release automation or maintainers, reject tags that do not match the manifest version, and prevent GitHub Release publication unless the evidence artifact exists for the tag target SHA. Verify live rulesets before trusting protected tag enforcement.

The machine-readable release evidence artifact is a `release-evidence.v1` document generated by `scripts/release/build-release-evidence.mjs` and uploaded by `.github/workflows/release.yml`. It includes at least:

- `schemaVersion`
- `version`
- `gitTag`
- `tagTargetSha`
- `mainSha`
- `branchModel`
- `releaseChannel`
- `changelogHeading`
- `githubReleaseUrl`
- `workflowRuns` for CI, production release proof, Convex production deploy, and any staging proof that qualified the release candidate
- `vercel` production deployment id, url, alias, target, project id, and commit SHA
- `convex` production deployment name, deploy workflow run id, and commit SHA
- `billing` mode, billing doctor result, and `billing_integration` run when the release is billing-sensitive
- `auth` and `entitlement` proof references for the `default_ship` production pack
- `blockers`
- `generatedAt`

Build a local diagnostic evidence artifact with:

```bash
bun run release:evidence:build
```

Hosted proof remains mandatory for a hosted product. Vercel proof must show the production deployment commit SHA equals `tagTargetSha`. Convex proof must show the production deploy ran from `tagTargetSha` or that a previous successful Convex production deploy exists for that same SHA. Billing-sensitive releases must run the production billing doctor and hosted `billing_integration` proof. Auth and entitlement proof must come from the production `default_ship` pack or a documented stronger replacement. Local dry-run evidence may mark these facts as `unavailable`; publish-mode evidence fails closed until required proof is `passed` or explicitly `not_required`.

`.github/workflows/release.yml` runs on `v*` tag pushes and manual dispatch once the release reset has landed on `main`. Until then, treat local `release:manifest:check` and `release:evidence:build` as the available validation surfaces and do not assume remote tag publication is active. Manual dispatch is dry-run by default and accepts `git_tag`, `tag_target_sha`, and `dry_run` inputs. A non-dry-run release validates `release.json`, validates that the tag target equals `origin/main`, collects check-run proof for the target SHA, builds `release-evidence.v1`, and only then publishes the GitHub Release.

## Required standing configuration

- GitHub branch protection is enabled on `dev` and `main`.
- `.github/workflows/ci.yml` should stay code-centric and fail on static or integration regressions through the `static` and `integration` jobs.
- `dev` requires pull requests and the `static` and `integration` checks. While branch protection still requires compatibility contexts, `browser-smoke` and `cli` must remain no-op jobs and must not be treated as release evidence. After each merge into `dev`, the resulting branch tip must also pass `Dev Staging Proof` before that `dev` commit is treated as a release candidate for `main`.
- `main` requires pull requests and the `static` and `integration` checks. While branch protection still requires compatibility contexts, `browser-smoke` and `cli` must remain no-op jobs and must not be treated as release evidence.
- Vercel project `mma-shipbysunday` is linked to `ParkerRex/mma-shipbysunday` and uses `main` as its production branch.
- The staging host `https://dev.man-meets-ai.com` must stay aliased to the current `dev` preview deployment. `Dev Staging Proof` should bind that alias automatically to the exact ready preview deployment for the current `dev` commit; manual `vercel alias set` is now a recovery tool, not the normal path.
- Root `bunfig.toml` forces `install.linker = "hoisted"` so GitHub Actions and Vercel installs do not use Bun's isolated symlink-heavy workspace layout during builds and serverless packaging.
- `apps/web/vercel.json` overrides the Vercel install step to remove cached `node_modules` trees before `bun install --frozen-lockfile`, because switching linkers alone does not rewrite a restored isolated-install cache.
- GitHub repository secret `CONVEX_DEPLOY_KEY` must exist before remote Convex dry-runs or production deploys can succeed.
- GitHub repository secret `VERCEL_TOKEN` plus repository variables `VERCEL_PROJECT_ID` and `VERCEL_TEAM_ID` must exist before the release proofs can wait for the exact Vercel deployment for either the staged `dev` commit or the merged `main` commit.
- GitHub repository secret `RELEASE_RECONCILE_GH_TOKEN` must exist before post-snapshot reconcile automation can open the `main -> dev` PR after a snapshot release. The default `github.token` is not enough in this repo because GitHub Actions is not permitted to create pull requests here.
- The `Tag Release` workflow requires read access to check runs and write access to contents only in its publish job. It does not replace hosted release proof or the snapshot fallback.
- GitHub repository variable `CONVEX_PRODUCTION_DEPLOY_ENABLED` is the live pause switch for automatic Convex production deploys. It is `true` after the first successful dry-run; set it back to `false` if you need to pause automatic `main` deploys.

Create that secret from the Convex dashboard for the production deployment:

1. Open `https://dashboard.convex.dev/d/helpful-meadowlark-297`.
2. Go to the deployment settings page.
3. Generate a production deploy key.
4. Store it in GitHub repository secrets as `CONVEX_DEPLOY_KEY`.

## Standard release

1. Branch from the current `dev`.
2. Keep the diff scoped and split the work into logical conventional commits.
3. From the repository root, run the narrowest relevant checks first, then broaden as needed. Use explicit local commands like `bun run check:fast`, focused tests, and `bun run check` when the slice justifies a fuller local pass. Pushes are not blocked by repository-owned git hooks; PR CI is the required merge gate.
4. Open a pull request from the feature branch into `dev`.
5. Run the default multi-agent PR review against `dev`:

   `Review this branch against dev. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`

6. Merge the feature branch into `dev` only after the code-centric checks for the staging candidate are green.
7. Treat `dev` as the release candidate branch. After the merge, run `bun run release:triage`. The command must point at the exact `origin/dev` SHA you intend to release and must explain whether the current `dev -> main` path is clean, metadata-blocked, or snapshot-only.
   Then wait for the aggregate `release_gate` job from `Dev Staging Proof` on that same `dev` commit. That job is the integrated staging proof and must be green before you open or trust the `dev -> main` release pull request.
   If the release touched `apps/web/convex/`, `Dev Staging Proof` should sync hosted Convex dev automatically before browser proof. A green Vercel preview alone is not enough when the staged frontend has outrun hosted Convex dev.
8. If `bun run release:triage` says `snapshot_required`, stop the normal release path here and use `bun run release:snapshot -- --dry-run` first. Do not hand-roll a snapshot branch.
9. Run the default multi-agent PR review against `main` for the release pull request:

   `Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`

10. Fix substantive findings and merge the `dev -> main` release PR only after `static` and `integration` are green.
11. Tag the merged `main` commit with the next pre-1.0 version and publish the matching GitHub Release from that tag. Copy or summarize the notes from the corresponding `CHANGELOG.md` section before publishing.
12. Watch Vercel create the production web deploy from the merged `main` commit.
13. Watch GitHub Actions run `Convex Production Deploy` for the same merged `main` commit.
14. Let the `Production Release Proof` workflow wait for the exact Vercel production deployment for the merged commit, then run the hosted post-deploy verification against `https://www.man-meets-ai.com`.
15. When the release touched checkout, Stripe, entitlement, webhook, or access-handoff behavior, `Production Release Proof` should also run hosted `billing_integration` automatically. Skip this extra proof only for unrelated docs or presentation changes.
16. Before hosted billing proof starts on `dev` or `main`, run `bun run release:billing:doctor -- --env=preview` or `--env=production` so stale `STRIPE_PRICE_ID`, stale `STRIPE_PRODUCT_ID`, or a promo code that no longer applies to the current order fails fast.
17. Delete the local and remote feature branch after the release settles.

Useful verification commands:

```bash
gh run list --repo ParkerRex/ship-by-sunday --workflow ci.yml --limit 10
gh run list --repo ParkerRex/ship-by-sunday --workflow convex-production-deploy.yml --limit 10
gh run list --repo ParkerRex/ship-by-sunday --workflow production-release-proof.yml --limit 10
git rev-parse origin/dev
git rev-parse origin/main
git merge-base origin/main origin/dev
git rev-list --left-right --count origin/main...origin/dev
bun run release:triage
bun run engineering:intake:release -- --output tmp/release-intake.v1.json
bun run engineering:intake:snapshot -- --output tmp/engineering-intake.snapshot.v1.json
bun run release:billing:doctor -- --env=preview --dry-run
bun run release:billing:doctor -- --env=production --dry-run
bun run release:snapshot -- --dry-run
vercel target list
cd apps/web && bunx convex logs --prod --history 20
PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com QA_ENV_FILE=apps/web/.env.production bun run release:proof -- --proof=default_ship
```

For staging or production billing verification in this repo, prefer a restricted live `100% off` discount and confirm the buyer auto-forwards from `/checkout/success` into `/start`. On production, the canonical automation should create the Checkout Session directly with the discount already attached instead of relying on promotion-code entry in Stripe’s hosted UI. Use [docs/internal/observability.md](./internal/observability.md) for the incident-control and webhook-origin drill.

For the matching release proof command:

- `tmp/release-personas.local.json` supplies the release proof account emails and passwords by default; set `RELEASE_PERSONAS_LOCAL_FILE` to use a different ignored local file
- `QA_ENV_FILE` selects the Clerk and Convex env values for the target environment and is resolved from the repository root in CI, for example `apps/web/.env.production`
- `PLAYWRIGHT_BASE_URL` points the browser pack at the target environment
- production bootstrap can derive `CONVEX_DEPLOYMENT` from `NEXT_PUBLIC_CONVEX_URL`, so the production env file does not have to carry a separate `CONVEX_DEPLOYMENT` entry

If persona prep fails on a Clerk publishable-key mismatch, fix env parity before spending time on blueprint-route debugging.

The current durable release-proof evidence is captured in:

- `docs/archive/release-proof-runs/2026-04-01-release-proof-final-green.md`

Historical production billing repair evidence remains in:

- `docs/archive/release-proof-runs/2026-03-25-prod-billing-integration-webhook-fix.md`
- `docs/archive/release-proof-runs/2026-03-25-prod-billing-integration-automatic-rerun.md`

## Snapshot fallback

Use the snapshot fallback only when `bun run release:triage` says the normal `dev -> main` release path is structurally blocked and `bun run release:snapshot -- --dry-run` returns `allowed: true`.

The fallback contract is simple:

- build one snapshot branch whose tree exactly matches `origin/dev` on top of `origin/main`
- prove tree identity before you push or open a PR
- use the printed rollback commands if validation fails
- let the repo-owned reconcile automation open or reuse a `main -> dev` PR after the snapshot merges
- clean up the snapshot branch after merge instead of keeping it around as a second release lane

The reconcile automation uses `RELEASE_RECONCILE_GH_TOKEN`, not the default Actions token. If that secret is missing, the reconcile step should fail with an explicit missing-secret error instead of a generic GitHub GraphQL permission error.

If `bun run release:snapshot -- --dry-run` exits non-zero, do not force it through. The current repo state does not justify snapshot mode.

## Manual Convex dry-run

Before the first live production promotion, run the Convex workflow manually in dry-run mode:

```bash
gh workflow run convex-production-deploy.yml --repo ParkerRex/ship-by-sunday -f dry_run=true
```

That workflow defaults to dry-run when manually dispatched. A successful run proves the GitHub secret, checkout, Bun install, and `bunx convex deploy --dry-run -y` path are wired correctly.

After that dry-run succeeds, enable automatic `main` deploys:

```bash
gh variable set CONVEX_PRODUCTION_DEPLOY_ENABLED --repo ParkerRex/ship-by-sunday --body true
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

## Local reconciliation after a messy release

After a release repair, snapshot PR, or hotfix:

- start new feature work from current `origin/dev`
- start emergency production-only work from current `origin/main`
- delete stale local release-repair or snapshot branches once their PRs are merged or abandoned
- rerun `bun run release:triage` before trusting an older local `dev` checkout
- after a snapshot release, merge the reconcile PR from `main` back into `dev` if the automation opened one

## Explicit non-goal

This workflow does not set up dedicated Convex-backed preview environments for feature branches. Preview web deployments can still exist, but backend preview isolation is a separate initiative.
