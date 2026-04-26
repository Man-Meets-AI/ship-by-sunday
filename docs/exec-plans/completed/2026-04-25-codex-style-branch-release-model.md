---
title: Copy The Codex Branch And Release Model
status: complete
created_at: 2026-04-25
completed_at: 2026-04-26
summary: Replace the current dev-centered release control plane with a Codex-style model where feature branches target main, PR checks stay fast, heavier proof runs after main, and releases are cut from protected tags.
post_build_recap: Main now contains the former dev product tree plus the Codex-style release model. PR #120 landed the migration, PR #133 removed retired compatibility contexts after branch protection was updated, the dev branch was deleted, and post-merge CI plus production proof passed on main.
read_when:
  - Resuming the branch and release migration.
  - Replacing dev-to-main release workflows.
  - Validating the final branch policy and tag release path.
---

# Copy The Codex Branch And Release Model

This document is a living execution plan for replacing Ship by Sunday's current dev-centered CI/CD and release control plane with the branch, PR, CI, and tag-release model used by the sibling Codex repository.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The current release system is too clever for the job. Ship by Sunday has a shared `dev` integration branch, a `dev -> main` release pull request, `release:triage`, snapshot fallback, staging proof workflows, reconcile automation, compatibility status jobs, and a release-evidence layer that tries to reason about all of it. The result is slow, brittle, and currently blocked: the latest `dev -> main` PR was structurally conflicting before it was closed.

The target outcome is the simpler Codex model. Maintainers branch from `main`, open focused PRs into `main`, get fast PR checks, merge into `main`, let post-merge checks and deployment proof run there, and cut releases by pushing protected semver tags from verified `main` commits. There is no shared `dev` release-candidate branch, no normal `dev -> main` release PR, no recurring snapshot fallback, and no release triage command deciding whether a release path is structurally possible.

After this plan is implemented, a maintainer should be able to explain the delivery path in one breath: branch from `main`, PR to `main`, merge when required checks pass, watch `main` deploy and verify, then tag the verified commit. The repo should encode that story in GitHub workflows, scripts, docs, and branch protection instead of preserving the old control plane under different names.

## Progress

- [x] 2026-04-25 EDT: Read the repo instructions, `docs/exec-plans/PLANS.md`, the long-horizon planning skill, current SBS release docs, current SBS workflow files, root scripts, and the sibling Codex workflow README.
- [x] 2026-04-25 EDT: Closed PR #119, the old `dev -> main` release PR, because it was closed-state `DIRTY` and `CONFLICTING` and should not be salvaged under the old release path.
- [x] 2026-04-25 EDT: Confirmed the current branch split is real: `git rev-list --left-right --count origin/main...origin/dev` prints `50 128`.
- [x] 2026-04-25 EDT: Confirmed Codex uses `main` as the integration branch, topic branches for work, fast PR checks, heavier `main` checks, and tag-driven releases rather than a shared `dev` release branch.
- [x] 2026-04-25 EDT: Created this ExecPlan as the execution artifact for the migration.
- [x] 2026-04-25 EDT: Grilled this plan against `docs/exec-plans/PLANS.md`, the repo-local `exec-plan-griller` skill, current SBS workflow/docs/script surfaces, live GitHub branch protection, live Vercel project metadata, and the sibling Codex workflow/contributing references.
- [x] 2026-04-25 EDT: Ran an additional active-surface gap scan and found two missing migration surfaces: `.github/pull_request_template.md` still instructs contributors to target `dev` or open `dev -> main` release PRs, and GitHub still lists an active remote `Deployment Smoke` workflow that has no local workflow file in the current checkout.
- [x] 2026-04-25 EDT: Compared Codex's full `.github` surface against SBS and confirmed the useful target is parity with Codex's GitHub operating model, not a literal copy of Rust, Bazel, V8, zsh, or code-signing implementation files.
- [x] 2026-04-25 EDT: Re-ran the grill after adding the `.github` parity audit and tightened acceptance so the implementation must leave a concrete parity decision artifact instead of only relying on prose in this plan.
- [x] 2026-04-26 EDT: Fetched `origin/main` and `origin/dev`, created raw reconciliation commit `2c74c1c` with the exact `origin/dev` tree and parent `origin/main`, and switched to local branch `codex-style-main-reconciliation`.
- [x] 2026-04-26 EDT: Rewrote active release policy docs and PR guidance for feature branches into `main`, post-merge production proof, and protected tag publication.
- [x] 2026-04-26 EDT: Removed the tracked `Dev Staging Proof` workflow, removed post-snapshot reconcile automation from `Production Release Proof`, and kept `browser-smoke` plus `cli` as temporary no-op CI jobs because live branch protection still requires those contexts.
- [x] 2026-04-26 EDT: Removed root `release:triage`, `release:snapshot`, `engineering:intake:release`, and `engineering:intake:snapshot` scripts plus now-dead release triage, snapshot, release-intake, and reconcile entrypoints, libraries, fixtures, and unit tests.
- [x] 2026-04-26 EDT: Added SBS-scoped Dependabot coverage for Bun workspaces and GitHub Actions; skipped CODEOWNERS, codespell, blob-size, and Codex issue automation for this slice because they require real owner enforcement or false-positive tuning outside the migration.
- [x] 2026-04-26 EDT: Ran focused unit proof for release manifest, release evidence, release scope, engineering-intake runtime contract, and runtime export: 5 files and 21 tests passed.
- [x] 2026-04-26 EDT: Ran required local validation: `bun run format`, `bun run plans:lint`, `bun run markdown:lint`, `git diff --check`, `bun run release:manifest:check`, `bun run release:evidence:build`, `bun run lint`, and `bun run typecheck` all passed.
- [x] 2026-04-26 EDT: Opened and merged PR #120, `ci: adopt Codex-style main branch release model`, into `main` as `1d95f69b0b5f375d73398ad5a35f548fe0c0e7f5`.
- [x] 2026-04-26 EDT: Verified post-merge `main` workflows for `1d95f69b0b5f375d73398ad5a35f548fe0c0e7f5`: CI, Convex Production Deploy, and Production Release Proof all completed successfully.
- [x] 2026-04-26 EDT: Updated live `main` branch protection so the required contexts are the durable `static` and `integration` jobs.
- [x] 2026-04-26 EDT: Disabled the remote-only `Deployment Smoke` workflow and deleted the protected remote `dev` branch after the new `main` state was verified.
- [x] 2026-04-26 EDT: Opened and merged PR #133, `ci: remove retired compatibility contexts`, into `main` as `aff44bde75cc50f37d8b086ee00b63d424774fb2`.
- [x] 2026-04-26 EDT: Verified post-merge `main` workflows for `aff44bde75cc50f37d8b086ee00b63d424774fb2`: CI, Convex Production Deploy, and Production Release Proof all completed successfully.

## Surprises & Discoveries

Codex has branch names under the `dev/<user>/<topic>` namespace, but those are ordinary topic branches. They are not a shared integration branch. The default branch is `main`, active PRs generally target `main`, and Codex documentation tells contributors to create a topic branch from `main`, keep it current with `main`, and wait for maintainer squash merge.

Codex splits checks by lifecycle instead of by staging branch. Pull requests get fast review-friendly signal from workflows such as `.github/workflows/bazel.yml`, `.github/workflows/rust-ci.yml`, `.github/workflows/ci.yml`, and `.github/workflows/sdk.yml`. Heavier Cargo-native verification lives in `.github/workflows/rust-ci-full.yml` and runs after pushes to `main` or explicit full-CI branches. Releases are tag-driven through `.github/workflows/rust-release.yml`, whose comments show the operator path as creating and pushing a version tag such as `rust-v0.1.0`.

SBS has already mixed two models. `.github/workflows/release.yml` and `release.json` are tag-oriented, but `docs/release-workflow.md`, `.github/workflows/dev-staging-proof.yml`, `scripts/release/release-triage.mjs`, `scripts/release/release-snapshot.mjs`, and several intake exports still assume `dev` is the release candidate and `main` is production-only.

The current branch divergence is the main migration hazard. Future work should be Codex-style, but the repository still has 128 commits reachable from `origin/dev` that are not reachable from `origin/main` and 50 commits reachable from `origin/main` that are not reachable from `origin/dev`. The migration therefore needs one deliberate topology reconciliation before the old `dev` path can be retired honestly.

Live GitHub branch protection is still on the old compatibility shape. On 2026-04-25, `gh api repos/ParkerRex/ship-by-sunday/branches/main/protection` and the matching `dev` call both reported strict required contexts `static`, `integration`, `browser-smoke`, and `cli`; `gh api repos/ParkerRex/ship-by-sunday/rulesets` returned an empty array. That means `.github/workflows/ci.yml` cannot drop the no-op `browser-smoke` or `cli` jobs until the live required contexts are changed, or every PR can be blocked by missing required checks.

Live Vercel project metadata confirmed the core production branch assumption and exposed an alias hazard. The project `prj_a2hZoA7YC7A5tYpGhsqIXvsVgrCf` for `mma-shipbysunday` reports `link.productionBranch: "main"` and `rootDirectory: "apps/web"`, but the current production target alias list includes both `www.man-meets-ai.com` and `dev.man-meets-ai.com`. After this migration, `dev.man-meets-ai.com` must either be retired or explicitly documented as a non-authoritative compatibility alias; it must not keep being described as the release-candidate staging authority.

The old model is also present outside the initially listed release docs. `.github/codex/release-policy.md` still says feature work targets `dev`; `apps/web/content/docs/ship-live.mdx` still says the `dev -> main` release PR changes production; and `apps/web/content/docs/deploy-to-vercel.mdx` still says preview handles unassigned git branches such as `dev`. These are active operator-facing surfaces and must be updated or deliberately removed with the same migration.

The current `Production Release Proof` workflow still has a `reconcile_dev` job that runs `scripts/release/reconcile-post-snapshot-release.mjs` after `release_gate`. That job and script are part of the recurring snapshot fallback, not the future Codex-style model. Deleting the script before rewriting `.github/workflows/production-release-proof.yml` would break the existing main proof workflow halfway through the migration.

The pull request template is an active policy surface. `.github/pull_request_template.md` still asks authors to choose between "Feature PR into `dev`", "Release PR from `dev` into `main`", and "Hotfix from `main`, with back-merge or cherry-pick to `dev`", and it tells release-sensitive PR authors to include `bun run release:triage` plus `Dev Staging Proof` evidence. This file must be rewritten with the docs, not treated as incidental GitHub copy.

GitHub Actions currently lists a remote active workflow named `Deployment Smoke` even though no `.github/workflows/deployment-smoke.yml` or equivalent file exists in the current checkout or `origin/main` tree. This is a remote repository hygiene hazard: an orphaned active workflow can confuse operators and branch-policy audits even if it is no longer in tracked files. The migration must either disable it or prove it is harmless and document why it remains active.

Codex has a much larger `.github` surface than SBS. The files that matter as patterns are `.github/workflows/README.md`, `.github/pull_request_template.md`, `.github/dependabot.yaml`, `.github/CODEOWNERS`, issue templates, lightweight policy workflows such as `codespell.yml` and `blob-size-policy.yml`, and the lifecycle split across PR, `main`, and tag workflows. The files that do not map directly to SBS are Rust, Bazel, Cargo, V8, zsh, DotSlash, Windows and macOS code-signing, npm package release, WinGet publishing, CLA, and public contributor cleanup workflows. The implementation must audit the whole Codex `.github` tree, but it should copy only the operating patterns that fit this private Bun, Next.js, Vercel, Convex, Clerk, and Stripe product.

Codex does not appear to use repo-local git hooks. A search for `.husky`, `.githooks`, `pre-push`, `pre-commit`, and `commit-msg` under `/Users/parkerrex/Developer/codex` found no hook files. The current SBS checkout also has no hook files. Copying Codex therefore means keeping local git hooks out of the delivery path unless a later plan deliberately chooses otherwise.

Implementation on 2026-04-26 confirmed the raw reconciliation branch was created locally without using the old snapshot command. `git diff --quiet origin/dev HEAD -- .` passed immediately after switching to `codex-style-main-reconciliation`, proving the raw commit tree matches `origin/dev`.

The Codex `.github` parity pass stayed intentionally narrow. SBS adapted the lifecycle structure, workflow README shape, simple PR template, Dependabot for Bun and GitHub Actions, explicit workflow permissions, and non-`main` cancellation behavior. SBS skipped Codex Rust, Bazel, Cargo, V8, zsh, DotSlash, code-signing, npm publishing, WinGet, CLA, stale-public-contributor cleanup, issue deduplicator, issue labeler, codespell, and blob-size workflows because they do not map cleanly to this private Bun, Next.js, Vercel, Convex, Clerk, and Stripe product without additional policy work.

## Decision Log

2026-04-25 - Decision: Adopt Codex's branch model for SBS. Rationale: a shared `dev` release-candidate branch plus release triage plus snapshot fallback has produced slow and unreliable releases, while the Codex model is simpler and easier to protect with ordinary GitHub branch rules.

2026-04-25 - Decision: Treat `main` as the single integration and production branch after migration. Rationale: this removes the `dev -> main` release PR as a release mechanism and makes every mergeable PR prove itself against the branch that will actually deploy.

2026-04-25 - Decision: Retire recurring snapshot fallback and release triage. Rationale: those scripts exist to support a branch topology that this plan deliberately removes. The only acceptable tree-copy operation is a one-time migration reconciliation documented in this plan, not a standing release lane.

2026-04-25 - Decision: Keep tag-driven release identity, but simplify it around verified `main` commits. Rationale: Codex releases are tag-driven, and SBS already has `release.json`, `release:manifest:check`, release evidence helpers, and `.github/workflows/release.yml`; those should be narrowed to tag validation and release publication instead of depending on `dev` proof.

2026-04-25 - Decision: Keep hosted production smoke as post-merge visibility, not pre-merge release-candidate authority. Rationale: SBS is a hosted Vercel, Convex, Clerk, and Stripe product, so production deploy proof is still valuable. Codex does not have the same hosted SaaS dependencies, so the literal copy is the lifecycle shape, not deletion of all product-specific production verification.

2026-04-25 - Decision: Make the topology reconciliation one explicit migration PR with a raw reconciliation commit followed by the Codex-model migration commit, not a reusable release lane. Rationale: a raw commit whose tree matches `origin/dev` but has `origin/main` as its parent gives reviewers exact branch-history evidence, while the following commit removes the old model before the PR head is merged. The raw reconciliation commit must not be merged alone, and the implementation must not run `bun run release:snapshot`.

2026-04-25 - Decision: Treat branch-protection and Vercel alias changes as operator configuration gates, not optional cleanup. Rationale: deleting required CI contexts or leaving `dev.man-meets-ai.com` as a production-looking staging name can make the new model either unmergeable or misleading even if the tracked files are correct.

2026-04-25 - Decision: Keep release evidence tag-attested to verified `main` for this migration. Rationale: Vercel and Convex both currently deploy production from `main`; moving either platform to direct tag deployment is a larger platform migration and is out of scope for this plan.

2026-04-25 - Decision: Treat the PR template and remote-only GitHub workflows as part of the migration surface. Rationale: Codex's model is only useful if normal PR authors see the right target and proof expectations, and remote workflow lists should not keep stale release signals alive after tracked files are simplified.

2026-04-25 - Decision: Add a `.github` parity audit, but adapt rather than literally copy every Codex file. Rationale: Codex's GitHub directory contains several reusable process patterns, but many files are specific to OpenAI's public Rust/Bazel/Cargo/code-signing release system and would add noise or broken jobs to SBS.

2026-04-25 - Decision: Do not add local pre-push or pre-commit hooks as part of copying Codex. Rationale: Codex does not use repo-local git hooks in the inspected checkout, and SBS should make GitHub PR checks and `main`/tag workflows authoritative instead of adding another local-only enforcement layer.

2026-04-26 - Decision: Keep `browser-smoke` and `cli` as no-op jobs in `ci.yml` for this local migration branch. Rationale: live branch protection still requires those exact contexts on `main`, so deleting the jobs before the remote branch-protection update would make the migration PR unmergeable.

2026-04-26 - Decision: Add Dependabot but not CODEOWNERS or lightweight policy workflows in this slice. Rationale: Dependabot is low-noise and directly matches the Codex maintenance pattern for existing Bun and GitHub Actions ecosystems; CODEOWNERS needs a real enforced owner list, and codespell or blob-size checks need tuning before they should appear in CI.

## Outcomes & Retrospective

The migration is complete on `main`. PR #120 landed the raw reconciliation commit `2c74c1c`, whose tree exactly matched the former `origin/dev` tree, followed by the tracked-file migration that replaced active docs, workflow wiring, root scripts, and dead release-control-plane files with the Codex-style model. PR #133 then removed the temporary `browser-smoke` and `cli` compatibility jobs after live branch protection was updated to require only `static` and `integration`.

The live repository policy now matches the intended steady state. `main` is the only release branch from this migration, the remote `dev` branch is deleted, the remote-only `Deployment Smoke` workflow is disabled, and current `main` branch protection requires `static` and `integration`. Post-merge checks on `aff44bde75cc50f37d8b086ee00b63d424774fb2` passed for CI, Convex Production Deploy, and Production Release Proof. The `dev.man-meets-ai.com` alias remains documented as non-authoritative compatibility surface rather than release-candidate authority; removing that alias is intentionally a separate live-domain operation.

## Context and Orientation

The current SBS release model is documented in `docs/release-workflow.md`, `.github/workflows/README.md`, root `AGENTS.md`, root `README.md`, `.github/pull_request_template.md`, `.github/codex/release-policy.md`, `apps/web/content/docs/ship-live.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, `docs/design-docs/scripts.md`, and recent entries in `CHANGELOG.md`. The active workflow files are `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/convex-production-deploy.yml`, `.github/workflows/release.yml`, and `.github/workflows/sandbox-e2e-nightly.yml`. The broader GitHub policy surface also includes `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md`, `.github/codex/release-policy.md`, and any remote active workflows returned by `gh workflow list --all`.

The old release-control scripts live under `scripts/release/` and are exposed through root `package.json`. The old branch-control commands include `release:triage`, `release:snapshot`, `engineering:intake:release`, and `engineering:intake:snapshot`. Release proof commands include `release:proof`, `release:proof:default-ship`, `release:proof:billing-integration`, `release:personas:prepare`, `release:personas:reset`, and `release:billing:doctor`. Release identity commands include `release:manifest:check` and `release:evidence:build`.

The sibling Codex repository at `/Users/parkerrex/Developer/codex` is the reference model. Its `docs/contributing.md` tells contributors to create a topic branch from `main`, keep changes focused, keep the branch current with `main`, and wait for maintainer squash merge. Its `.github/workflows/README.md` says pull requests get fast review-friendly signal while `main` gets the full cross-platform verification pass. Its workflows include PR and `main` checks such as `bazel.yml`, `rust-ci.yml`, `ci.yml`, `sdk.yml`, and heavier post-merge checks such as `rust-ci-full.yml`. Its release workflow is tag-driven through `rust-release.yml`.

Codex's reusable GitHub operating patterns are its concise PR template, narrow CODEOWNERS ownership for sensitive paths, weekly Dependabot maintenance for active ecosystems, structured issue templates, pinned action versions, explicit workflow permissions, cancellation of stale non-`main` runs, and a separation between fast PR checks, full `main` checks, and tag release. SBS should adapt those patterns to Bun, Next.js, Vercel, Convex, Clerk, Stripe, release evidence, and hosted proof. SBS should not copy Codex's Rust crate ownership, Bazel helper scripts, Cargo deny policy, V8 canary jobs, zsh release assets, macOS or Windows code-signing actions, npm package publishing, WinGet publishing, DotSlash configs, CLA assistant, or public stale-contributor cleanup unless a later plan identifies a real SBS need.

In this plan, "main" means the GitHub branch that receives normal PRs and deploys production. "Feature branch" means a short-lived branch created from the current `main`. "Tag release" means creating a protected semver tag, such as `v0.3.0`, that points at a verified `main` commit and triggers release publication. "Topology reconciliation" means the one-time work needed to make `origin/main` contain the current wanted product tree before deleting or freezing the old `dev` lane.

### In Scope

This plan covers replacing the SBS branch policy with feature branches into `main`; retiring the shared `dev` release-candidate path; updating GitHub Actions so PR checks are fast and `main` receives the broader post-merge proof; auditing the full Codex `.github` directory and adapting only the process pieces that make sense for SBS; simplifying or removing scripts that only exist for `dev -> main`, release triage, snapshot fallback, and release-intake exports; preserving and simplifying tag-driven release identity; updating docs and repo instructions to match the new model; and performing the one-time reconciliation needed to make `main` contain the current intended tree before `dev` is retired.

This plan also covers the GitHub, Vercel, and Convex operator configuration that must change with the repository files: branch protection should protect `main`, required status contexts should match the new workflows, Vercel production should remain `main`, the `dev.man-meets-ai.com` alias should stop being release-candidate authority, and Convex production deploys should remain tied to `main` with an explicit pause switch.

### Out Of Scope

This plan does not implement the migration in the planning turn that created it. It does not publish a production release before the new model is implemented. It does not delete source-level unit tests, integration tests, integration-ui tests, or retained sandbox Playwright tests. It does not remove hosted production proof where the proof is still the only way to verify Vercel, Convex, Clerk, Stripe, auth, entitlement, or billing behavior.

This plan does not use the old recurring snapshot fallback as the future operating model. A one-time branch topology reconciliation is in scope only because `origin/dev` and `origin/main` have already diverged. This plan does not copy Codex's Rust, Bazel, Cargo, V8, zsh, DotSlash, code-signing, npm publishing, WinGet publishing, CLA, or stale-public-contributor workflows unless implementation discovers an SBS-specific need and records a new decision. This plan also does not add local git hooks, rotate credentials, change product behavior, redesign the app, change pricing, or solve product bugs found while reconciling branches unless those bugs directly block the migration checks.

## Plan of Work

Start by refreshing remote facts and recording them in this plan before any deletion. Capture `origin/main`, `origin/dev`, both branch protection JSON documents, visible rulesets, repository variables, the full GitHub workflow list, Vercel project metadata, and current open PRs targeting `dev` or `main`. Also inventory Codex's `.github` tree next to SBS's `.github` tree and classify every meaningful Codex category as adapt, skip, or investigate later. If these reads fail because of credentials, keep tracked-file edits local but mark the migration PR blocked until an operator verifies the missing live settings.

Create the reconciliation branch from `origin/main`, then make one raw local commit whose tree exactly equals `origin/dev` and whose parent is `origin/main`. This commit exists only to make history reviewable; it is not the future operating model. On top of that raw commit, apply the Codex-style migration edits. The final PR head should contain the desired product tree plus the new model. Do not merge the raw reconciliation commit by itself, do not reopen PR #119, and do not run the old `release:snapshot` script.

Freeze the target policy in docs before deleting runtime pieces. Rewrite `docs/release-workflow.md`, `.github/workflows/README.md`, `AGENTS.md`, `README.md`, `.github/pull_request_template.md`, `.github/codex/release-policy.md`, `apps/web/content/docs/ship-live.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, and `docs/design-docs/scripts.md` so they all describe the same Codex-style path: branch from `main`, PR to `main`, fast PR checks, post-merge production proof on `main`, tag release from verified `main`.

Perform the `.github` parity work as an explicit pass, not as incidental cleanup. Adopt or adapt the Codex patterns that fit SBS: a simple PR template, a narrow CODEOWNERS file if owner review will be enforced, Dependabot for Bun workspaces and GitHub Actions, structured issue templates if GitHub Issues is an active intake surface, pinned action versions, explicit workflow permissions, concurrency that cancels stale non-`main` runs, and lightweight spelling or blob-size policy if they add real signal. Record the skipped categories in this plan or in a short repo note so a future contributor understands why Rust/Bazel/code-signing files were not copied.

Next simplify workflows in an order that keeps required contexts real. Keep `.github/workflows/ci.yml` as the fast PR and `main` source-proof workflow, and make sure the durable PR jobs are named clearly enough to become required branch-protection contexts. Prefer a Codex-style aggregate result job if that reduces branch-protection churn without hiding failures; for example, `static` and `integration` can remain visible while a single `CI results (required)`-style job becomes the stable required context after branch protection is updated. Keep temporary no-op `browser-smoke` and `cli` jobs until live branch protection no longer requires those exact contexts; remove them in the same rollout window as the branch-protection update. Remove `.github/workflows/dev-staging-proof.yml` because its entire purpose is proving the old shared `dev` candidate. Keep `.github/workflows/production-release-proof.yml` only after it is rewritten as a `main` push and manual post-deploy verification lane with the `reconcile_dev` job removed. Keep `.github/workflows/convex-production-deploy.yml` as a `main` deploy workflow. Keep `.github/workflows/release.yml`, but remove any dependence on `dev`, staging proof, snapshot evidence, or release-triage metadata. Disable or delete any active remote workflow that has no tracked workflow file after reconciliation, including the currently visible `Deployment Smoke` workflow, unless the implementation proves a current owner and documents it.

Then simplify scripts. Remove root scripts that only support the retired branch topology: `release:triage`, `release:snapshot`, `engineering:intake:release`, and `engineering:intake:snapshot`. Remove `scripts/release/release-triage.mjs`, `scripts/release/release-snapshot.mjs`, `scripts/release/reconcile-post-snapshot-release.mjs`, `scripts/release/export-release-intake.mjs`, `scripts/release/export-engineering-intake-snapshot.mjs`, and their now-unused libraries only after checking no surviving workflow, test, or docs path imports them. Preserve release manifest validation and tag evidence generation, but update evidence collection so it looks for PR or `main` proof on the tag target instead of staging proof from `dev`.

During the reconciliation, inspect the 50 commits reachable only from `origin/main` before assuming they are disposable. Many are release snapshot or promotion commits, but if any main-only production hotfix is not already present in `origin/dev`, reapply it deliberately on the migration branch or stop and record a blocker. After the final migration PR lands, either delete remote `dev` or lock it as deprecated and update local branch defaults so new work starts from `main`.

Finish by validating the full operator path. Open or simulate one small feature branch from `main`, confirm PR checks run without `dev` assumptions, merge to `main`, observe production deploy and post-merge proof behavior, run release manifest and evidence checks, then cut or dry-run the next protected tag. Record the resulting proof in this ExecPlan and in the durable release docs.

## Milestones

Milestone 1 records the live policy and prepares the reconciliation branch. At the end, the plan records the current branch SHAs, required contexts, visible rulesets, repository variables, active GitHub workflows, Vercel production branch and aliases, and open PR inventory. The local branch contains one raw reconciliation commit whose tree equals `origin/dev` and whose parent is `origin/main`, followed by no implementation changes yet. Success is proven by `git diff --quiet origin/dev <raw-reconciliation-commit> -- .` and by pasted remote-read receipts in this plan.

Milestone 2 documents and configures the target branch policy in tracked files. At the end, every canonical doc and GitHub PR template says `main` is the merge target, `dev` is retired or deprecated, and `dev -> main` release PRs are no longer described as normal. Success is proven by grep showing no active instructions that send feature work to `dev` or require `bun run release:triage` before a release PR.

Milestone 3 completes the `.github` parity audit and adopts the useful Codex patterns. At the end, SBS has an explicit file-by-file or category-by-category record for Codex `.github` items: adapted, skipped, or deferred. The adapted set should include the PR template, workflow README shape, workflow permissions and concurrency patterns, Dependabot if useful for Bun and GitHub Actions, CODEOWNERS if owner review will be enforced, and issue templates if GitHub Issues is an active intake surface. The skipped set should explicitly include Rust/Bazel/Cargo/V8/zsh/DotSlash/code-signing/package-publishing workflows that do not fit SBS. Success is proven by a written parity record and by grep showing no local git hook files were added.

Milestone 4 rewires CI and release workflows. At the end, PRs to `main` run fast source checks, pushes to `main` run post-merge deploy or proof lanes, tags run release publication, and no required status context points at a deleted job. Success is proven by workflow syntax inspection, local script checks where possible, and a GitHub branch-protection audit showing required contexts match jobs that actually exist.

Milestone 5 removes the old release control-plane commands. At the end, root `package.json` no longer exposes `release:triage`, `release:snapshot`, or `engineering:intake:*` commands that exist only for the old `dev` branch model. The old script files are deleted or moved to an archive only after surviving imports are proven absent. Success is proven by `rg` and by the surviving release commands still passing their focused checks.

Milestone 6 lands the one-time branch topology reconciliation and model migration. At the end, `main` contains the chosen current product tree plus the new release model, the old conflicting PR #119 remains closed, and there is no expectation that a regular `dev -> main` release PR will ever be opened again. Success is proven by a merged migration PR, `git rev-list --left-right --count origin/main...origin/dev` no longer showing unreleased `dev` work unless `dev` was intentionally frozen before deletion, and a documented decision about deleting or freezing `dev`.

Milestone 7 validates the steady-state workflow. At the end, a small normal branch created from `main` can PR into `main`, pass the new required checks, merge, deploy, and feed tag release evidence. Success is proven by one real PR or a controlled no-op PR, a successful `main` workflow run, a Convex production deploy run or explicit skip for the same SHA, and a tag release dry-run or actual tag run if the user approves publication.

## Concrete Steps

Begin from the repository root:

    cd /Users/parkerrex/Developer/ship-by-sunday
    git fetch origin main dev --prune
    git status --short --branch
    git rev-list --left-right --count origin/main...origin/dev
    gh pr view 119 --repo ParkerRex/ship-by-sunday --json state,mergeable,mergeStateStatus,url,title,headRefName,baseRefName

The expected current observations are:

    ## dev...origin/dev
    50 128
    state=CLOSED, headRefName=dev, baseRefName=main, mergeable=CONFLICTING, mergeStateStatus=DIRTY

Inspect remote policy before editing:

    gh api repos/ParkerRex/ship-by-sunday/branches/main/protection
    gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection
    gh api repos/ParkerRex/ship-by-sunday/rulesets
    gh variable list --repo ParkerRex/ship-by-sunday
    gh workflow list --repo ParkerRex/ship-by-sunday --all
    vercel project inspect prj_a2hZoA7YC7A5tYpGhsqIXvsVgrCf --scope team_6l65P1uy5rfiy8d8wqRwLI8e

If GitHub returns 404 or insufficient permissions for branch protection or rulesets, record that in this plan and continue with repository-file changes. Do not guess required contexts. The implementer must come back and verify live branch protection before merging the migration PR.

Inventory Codex `.github` and SBS `.github` before deciding what to copy:

    find /Users/parkerrex/Developer/codex/.github -maxdepth 3 -type f | sed 's#^/Users/parkerrex/Developer/codex/##' | sort
    find .github -maxdepth 3 -type f | sort
    find /Users/parkerrex/Developer/codex -maxdepth 4 \( -path '*/.husky/*' -o -path '*/.githooks/*' -o -name 'pre-push' -o -name 'pre-commit' -o -name 'commit-msg' \) -print | sort
    find . -maxdepth 3 \( -path './.husky/*' -o -path './.githooks/*' -o -name 'pre-push' -o -name 'pre-commit' -o -name 'commit-msg' \) -print | sort

Classify Codex `.github` categories before implementation. The initial expected classification is:

    adapt: workflows/README.md, pull_request_template.md, dependabot.yaml, CODEOWNERS if owner review will be enforced, issue templates if GitHub Issues is active, workflow permissions, workflow concurrency, pinned actions, lightweight spelling or blob-size policy if useful
    skip: Bazel, Rust, Cargo, V8, zsh, DotSlash, code-signing, npm package publishing, WinGet, CLA, stale public contributor cleanup, Codex product splash assets
    investigate later: Codex issue labeler and deduplicator, Codex label prompts, CODEOWNERS scope if no clear SBS owner list exists

Do not add `.husky`, `.githooks`, `pre-push`, `pre-commit`, or `commit-msg` files as part of this migration unless the plan is revised with a new decision that explains why SBS is intentionally diverging from Codex.

If Vercel CLI auth is unavailable, use the Vercel project settings UI or the Vercel API with a scoped token to verify `link.productionBranch`, `rootDirectory`, and the alias list for production. Record whether `dev.man-meets-ai.com` is still on the production alias list. Do not claim the staging alias is retired until live Vercel metadata proves it.

Inspect the branch-only histories before creating the migration branch:

    git log --oneline --left-only origin/main...origin/dev
    git log --oneline --right-only origin/main...origin/dev
    git diff --name-status origin/dev..origin/main
    git diff --name-status origin/main..origin/dev

Expected observation today: the main-only side is dominated by release snapshot, release promotion, and production proof repair commits, while the dev-only side contains the current product and release-reset work plus reconcile-back commits. If any main-only file change is not already represented in the desired `origin/dev` tree, decide explicitly whether to reapply it or block.

Create the one-time raw reconciliation commit without using the old snapshot command:

    git fetch origin main dev --prune
    raw_reconciliation_commit="$(git commit-tree "$(git rev-parse origin/dev^{tree})" -p "$(git rev-parse origin/main)" -m "chore: reconcile dev tree for main branch model")"
    git switch --create codex-style-main-reconciliation "$raw_reconciliation_commit"
    git diff --quiet origin/dev HEAD -- . && echo "raw reconciliation tree matches origin/dev"
    git log --oneline --decorate -2

The expected observation is:

    raw reconciliation tree matches origin/dev
    <raw_reconciliation_commit> chore: reconcile dev tree for main branch model
    <origin/main_sha> chore: release snapshot ...

Implementation receipt:

    $ git switch --create codex-style-main-reconciliation 2c74c1c
    raw reconciliation tree matches origin/dev
    2c74c1c chore: reconcile dev tree for main branch model
    3c5347c chore: release snapshot 1e30eba1b4c5 (#112)

Local validation receipt from 2026-04-26:

    bun run --cwd apps/web test:unit -- tests/unit/engineering-intake-contract.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/release-scope.test.ts tests/unit/release-manifest.test.ts tests/unit/release-evidence.test.ts
    Test Files  5 passed (5)
    Tests  21 passed (21)

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-25-codex-style-branch-release-model.md
    docs/exec-plans/completed/2026-04-25-codex-style-branch-release-model.md: ok

    bun run markdown:lint -- --paths AGENTS.md README.md CONTRIBUTING.md CHANGELOG.md docs/release-workflow.md docs/design-docs/scripts.md docs/design-docs/integrations.md docs/internal/observability.md .github/workflows/README.md .github/pull_request_template.md .github/codex/release-policy.md apps/web/content/docs/ship-live.mdx apps/web/content/docs/deploy-to-vercel.mdx docs/exec-plans/completed/2026-04-25-codex-style-branch-release-model.md
    apps/web/content/docs/deploy-to-vercel.mdx: ok
    apps/web/content/docs/ship-live.mdx: ok
    docs/exec-plans/completed/2026-04-25-codex-style-branch-release-model.md: ok

    git diff --check
    passed with no output

    bun run release:manifest:check
    ok: true, gitTag: v0.3.0, version: 0.3.0

    bun run release:evidence:build
    built tmp/release-evidence.v1.json in dry-run mode with hosted proof unavailable blockers, as expected locally

    bun run lint
    Found 0 warnings and 0 errors.

    bun run typecheck
    Next.js build and TypeScript completed successfully.

This raw commit is the one-time topology bridge only. Apply the Codex-style migration edits on top of it in later commits before opening the PR to `main`.

Rewrite the documentation surfaces first. Update `docs/release-workflow.md` from the current `dev`-candidate workflow to the target Codex-style workflow. Update `.github/workflows/README.md` so it mirrors Codex's shape: Pull Requests, Post-Merge On `main`, Tag Publication, and Rule Of Thumb. Update root `AGENTS.md`, root `README.md`, `.github/pull_request_template.md`, `.github/codex/release-policy.md`, `apps/web/content/docs/ship-live.mdx`, and `apps/web/content/docs/deploy-to-vercel.mdx` so they no longer instruct contributors to branch from `dev`, open `dev -> main` release PRs, or run `bun run release:triage`. Update `docs/design-docs/scripts.md` so retired scripts disappear from the active command map. Update `CHANGELOG.md` only after real implementation has happened, not during plan authoring.

Apply the `.github` parity decisions. If adding `.github/dependabot.yaml`, configure only ecosystems that exist in SBS, such as Bun package manifests and GitHub Actions. If adding `.github/CODEOWNERS`, keep ownership narrow and enforceable, for example `.github/`, `scripts/release/`, `apps/web/`, and `packages/blueprint-compiler/` only if the owner list is real. If rewriting issue templates, make them SBS-specific and remove Codex product fields such as CLI version, IDE extension, Rust crate, or subscription plan unless they map to a real SBS support question. If adding spelling or blob-size workflows, make them low-noise and non-blocking until their false positives are handled.

Use grep after the docs pass:

    rg -n 'dev -> main|origin/dev|feature work targets `dev`|release:triage|release:snapshot|snapshot fallback|Dev Staging Proof|dev-staging-proof|release_gate|engineering:intake:release|engineering:intake:snapshot' AGENTS.md README.md docs .github apps/web/content/docs package.json scripts

Expected result after implementation: matches remain only in this active ExecPlan, historical archives, completed plans, or explicit migration notes. Active workflow files, active docs, and root scripts should not instruct operators to use the old path.

Simplify workflows after the docs say the right thing. Edit `.github/workflows/ci.yml` so it runs on pull requests into `main`, pushes to `main`, schedule if still wanted, and manual dispatch. Keep durable fast jobs such as `static` and `integration`. Remove compatibility no-op jobs such as `browser-smoke` and `cli` only after GitHub branch protection no longer requires those exact contexts. Delete `.github/workflows/dev-staging-proof.yml` after docs and branch protection no longer rely on it. Update `.github/workflows/production-release-proof.yml` so it is a `main` post-merge proof lane with no post-snapshot reconcile job and no call to `scripts/release/reconcile-post-snapshot-release.mjs`. Keep `.github/workflows/convex-production-deploy.yml` tied to `main`. Update `.github/workflows/release.yml` so tag evidence is based on the tag target and `main` proof, not on `dev` staging proof.

Simplify package scripts and release files. In `package.json`, remove retired commands only after the workflow and docs edits are ready. Search imports before deleting script files:

    rg -n "release-triage|release-snapshot|export-release-intake|export-engineering-intake-snapshot|reconcile-post-snapshot-release|release-intake|engineering-intake.snapshot" package.json .github/workflows scripts docs apps packages

Remove script files that are no longer imported by any surviving command, workflow, or test. Keep `scripts/release/validate-release-manifest.mjs`, `scripts/release/build-release-evidence.mjs`, `scripts/release/lib/release-manifest.mjs`, and release proof helpers that are still needed by `production-release-proof.yml` or `release.yml`. If release evidence currently imports old staging fields, adjust its schema and tests deliberately rather than leaving dead optional fields.

Open the migration PR only after the head commit includes both the raw reconciliation and the Codex-style migration edits. The PR body must say that this is the one-time branch reconciliation for the Codex-style model and that future work targets `main` directly. Do not call it a snapshot fallback, and do not run the old `release:snapshot` script.

After the migration PR lands, update remotes and decide the fate of `dev`:

    git fetch origin main dev --prune
    git rev-list --left-right --count origin/main...origin/dev
    gh pr list --repo ParkerRex/ship-by-sunday --state open --base dev
    gh pr list --repo ParkerRex/ship-by-sunday --state open --base main
    gh api repos/ParkerRex/ship-by-sunday/branches/main/protection
    gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection
    gh workflow list --repo ParkerRex/ship-by-sunday --all

If no open PRs depend on `dev`, delete the remote `dev` branch or lock it in GitHub with a clear deprecation description. If deletion is not allowed immediately, leave a short-lived deprecation note in `docs/release-workflow.md` explaining that `dev` is not a release branch and must not receive new work.

If `Deployment Smoke` or any other workflow remains active in `gh workflow list --all` without a tracked `.github/workflows/*.yml` owner in the final `main` tree, disable it with `gh workflow disable <workflow-id-or-name> --repo ParkerRex/ship-by-sunday` or document why it must stay active. Do not leave remote-only workflows unnamed in the migration evidence.

Validate the steady-state path with a tiny branch from `main` after the migration PR lands:

    git switch main
    git pull --ff-only origin main
    git switch --create verify-main-pr-model
    date -u +"%Y-%m-%dT%H:%M:%SZ" > tmp/main-pr-model-proof.txt
    git add tmp/main-pr-model-proof.txt
    git commit -m "chore: verify main pr model"
    git push -u origin verify-main-pr-model
    gh pr create --repo ParkerRex/ship-by-sunday --base main --head verify-main-pr-model --title "chore: verify main pr model" --body "Verifies the post-migration PR path from a topic branch into main."

Only use that no-op PR if the user approves creating a proof branch and `tmp/` is acceptable for the proof file. Otherwise use the next real feature PR as the validation vehicle and record that choice in this plan.

## Validation and Acceptance

The migration is accepted only when active repository files and live GitHub settings agree on one delivery model. New feature work must branch from `main`, PR into `main`, and merge only after the required fast checks pass. A push to `main` must trigger the retained production deploy and post-merge proof lanes. A protected semver tag from a verified `main` commit must validate `release.json`, build release evidence, and either dry-run or publish the GitHub Release according to operator intent.

Acceptance is not just deleting files. A reviewer should be able to run grep and see that the old `dev` release-candidate path is gone from active docs, active workflows, and active package scripts. A reviewer should be able to inspect branch protection and see that required contexts are produced by current workflow jobs. A reviewer should be able to follow `docs/release-workflow.md` without encountering `release:triage`, snapshot fallback, or a `dev -> main` release PR.

Because this is a hosted product, the final proof must also include environment behavior. After the first merge to `main` under the new model, Vercel must deploy the matching commit, Convex production deploy must run or explicitly skip behind its pause variable, and production proof must report against the same `main` SHA. A release tag must point at that verified `main` SHA, not at a feature branch or old `dev` SHA.

The `.github` parity work is accepted only when the repository contains a durable decision artifact for the Codex `.github` comparison. That artifact may be a section in this ExecPlan updated during implementation, a short checked-in note under `docs/`, or a section in the migration PR body, but it must name which Codex `.github` categories were adapted, skipped, or deferred and why. The final state must not contain copied Rust, Bazel, Cargo, V8, zsh, DotSlash, code-signing, npm publishing, WinGet, CLA, or public stale-contributor workflows unless this plan has been revised with an SBS-specific reason.

### Test Commands

Run these local checks before opening the migration PR:

    bun run format
    bun run lint
    bun run typecheck
    bun run release:manifest:check
    bun run release:evidence:build
    bun run markdown:lint -- --paths docs/release-workflow.md .github/workflows/README.md .github/pull_request_template.md AGENTS.md README.md docs/design-docs/scripts.md docs/exec-plans/completed/2026-04-25-codex-style-branch-release-model.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-25-codex-style-branch-release-model.md
    git diff --check

Run these repository-shape checks before merging:

    rg -n 'dev -> main|origin/dev|feature work targets `dev`|release:triage|release:snapshot|snapshot fallback|Dev Staging Proof|dev-staging-proof|engineering:intake:release|engineering:intake:snapshot' AGENTS.md README.md docs .github apps/web/content/docs package.json scripts
    rg -n "release-triage|release-snapshot|export-release-intake|export-engineering-intake-snapshot|reconcile-post-snapshot-release" package.json .github/workflows scripts docs apps packages
    rg -n "Bazel|Cargo|rust-ci|rust-release|V8|zsh|DotSlash|code-sign|WinGet|CLA Assistant|Close stale contributor PRs" .github docs AGENTS.md README.md
    git rev-list --left-right --count origin/main...origin/dev
    gh pr list --repo ParkerRex/ship-by-sunday --state open --base dev
    gh pr list --repo ParkerRex/ship-by-sunday --state open --base main
    gh api repos/ParkerRex/ship-by-sunday/branches/main/protection
    gh api repos/ParkerRex/ship-by-sunday/rulesets
    gh workflow list --repo ParkerRex/ship-by-sunday --all
    vercel project inspect prj_a2hZoA7YC7A5tYpGhsqIXvsVgrCf --scope team_6l65P1uy5rfiy8d8wqRwLI8e
    find . -maxdepth 3 \( -path './.husky/*' -o -path './.githooks/*' -o -name 'pre-push' -o -name 'pre-commit' -o -name 'commit-msg' \) -print | sort

Run these remote checks after the migration PR lands:

    gh run list --repo ParkerRex/ship-by-sunday --workflow ci.yml --limit 10
    gh run list --repo ParkerRex/ship-by-sunday --workflow convex-production-deploy.yml --limit 10
    gh run list --repo ParkerRex/ship-by-sunday --workflow production-release-proof.yml --limit 10
    gh workflow run release.yml --repo ParkerRex/ship-by-sunday -f dry_run=true
    gh run list --repo ParkerRex/ship-by-sunday --workflow release.yml --limit 5
    gh workflow list --repo ParkerRex/ship-by-sunday --all

If `release.yml` does not accept a generic dry-run dispatch after simplification, document the actual supported tag dry-run command in `docs/release-workflow.md` and this plan before claiming the tag release path is validated.

If a Codex `.github` file was skipped, there must be a short reason in the parity record. For example, "skip `bazel.yml` because SBS does not use Bazel", "skip `cargo-deny.yml` because SBS has no Cargo workspace", or "defer issue deduplicator because it requires `CODEX_OPENAI_API_KEY` and a maintained public issue label taxonomy".

If the parity record lives only in the migration PR body, copy the final adapt, skip, and defer summary into this ExecPlan before completing it so a future agent can understand the final GitHub policy without depending on closed PR context.

## Idempotence and Recovery

Docs and workflow edits are safe to retry. Keep each milestone in its own conventional commit when possible so a failed workflow simplification can be reverted without losing the branch-policy docs. Do not delete script files until `rg` proves no surviving active path imports them. If a script is uncertain, remove the root command first, leave the file for one milestone, and delete it only after validation proves it is dead.

The `.github` parity audit is safe to retry because it is file inventory and classification. If an adapted workflow such as spelling or blob-size policy creates noisy failures, disable or mark that workflow non-required before continuing the branch migration. Do not allow a newly copied policy workflow to block the migration unless it has been tuned against the SBS tree.

The one-time topology reconciliation is the risky step. Before it starts, fetch `origin/main` and `origin/dev`, record both SHAs in this plan, and keep the migration branch separate from normal feature work. If the reconciliation PR fails checks because the `origin/dev` tree has product bugs, fix those bugs on the migration branch or split the migration into a policy PR followed by a tree reconciliation PR. Do not reopen the old `dev -> main` PR to work around the failure.

If the raw reconciliation commit was created incorrectly, delete only the local migration branch and recreate it from `origin/main` using `git commit-tree "$(git rev-parse origin/dev^{tree})" -p "$(git rev-parse origin/main)"`. Do not repair a bad reconciliation by hand-editing random files until it appears close. The raw commit must either exactly match the chosen source tree or be thrown away.

If branch protection still requires old contexts such as `browser-smoke`, `cli`, or `release_gate`, do not delete the corresponding jobs until the remote rules are updated. A missing required context can block every PR even when the code is correct. Update branch protection first, or keep temporary compatibility jobs with explicit comments saying they exist only until live GitHub rules are changed.

Before changing branch protection, save the current JSON for `main` and `dev` in an ignored local note or paste the relevant required contexts into this plan. If a branch-protection update blocks PRs, restore the previous required context list immediately and keep the compatibility jobs until a second attempt is ready. Today the known required context list is `static`, `integration`, `browser-smoke`, and `cli` on both `main` and `dev`.

Before disabling a remote-only workflow, capture `gh workflow view <workflow-id-or-name> --repo ParkerRex/ship-by-sunday` and the latest runs with `gh run list --workflow <workflow-id-or-name> --limit 5`. If disabling the workflow removes useful evidence unexpectedly, re-enable it with `gh workflow enable <workflow-id-or-name> --repo ParkerRex/ship-by-sunday` and add a tracked replacement workflow before trying again.

If Vercel alias changes cause `www.man-meets-ai.com` or `man-meets-ai.com` to point at the wrong deployment, roll back in Vercel before continuing GitHub work. If only `dev.man-meets-ai.com` is ambiguous, leave it documented as deprecated and non-authoritative rather than trying to use it as release proof.

If deleting `dev` is blocked by open PRs, communicate the cutoff clearly. Retarget open PRs to `main` if they are still wanted. Close stale PRs that only exist for the old release path. If `dev` must remain for a short time, protect it against new pushes and mark it deprecated in docs; do not let it become a second integration branch again.

## Artifacts and Notes

Current SBS state captured while writing this plan:

    $ git status --short --branch
    ## dev...origin/dev

    $ git rev-list --left-right --count origin/main...origin/dev
    50 128

    $ gh pr view 119 --repo ParkerRex/ship-by-sunday --json state,mergeable,mergeStateStatus,url,title,headRefName,baseRefName
    state=CLOSED, headRefName=dev, baseRefName=main, mergeable=CONFLICTING, mergeStateStatus=DIRTY

Live remote policy captured during the grill:

    main required contexts: static, integration, browser-smoke, cli
    dev required contexts: static, integration, browser-smoke, cli
    visible rulesets: []
    active remote-only workflow hazard: Deployment Smoke is active in GitHub but has no local workflow file in this checkout
    repository variables: CONVEX_PRODUCTION_DEPLOY_ENABLED=true, VERCEL_PROJECT_ID=prj_a2hZoA7YC7A5tYpGhsqIXvsVgrCf, VERCEL_TEAM_ID=team_6l65P1uy5rfiy8d8wqRwLI8e
    Vercel project: name=mma-shipbysunday, productionBranch=main, rootDirectory=apps/web
    Vercel alias hazard: production aliases include dev.man-meets-ai.com and www.man-meets-ai.com

Codex reference workflow shape:

    /Users/parkerrex/Developer/codex/.github/workflows/README.md
    Pull requests get fast, review-friendly signal.
    main gets the full cross-platform verification pass.
    rust-release.yml publishes from version tags.

Codex `.github` parity research:

    Codex has CODEOWNERS, Dependabot, a simple PR template, structured issue forms, workflow docs, PR/main/tag workflows, pinned actions, workflow permissions, and concurrency controls that are useful patterns.
    Codex also has Rust, Bazel, Cargo, V8, zsh, DotSlash, code-signing, npm publishing, WinGet, CLA, public stale-contributor cleanup, and product image assets that do not map directly to SBS.
    No repo-local Codex .husky, .githooks, pre-push, pre-commit, or commit-msg hook files were found during the research pass.

SBS files that must be considered during implementation:

    .github/workflows/README.md
    .github/pull_request_template.md
    .github/ISSUE_TEMPLATE/
    .github/CODEOWNERS if added
    .github/dependabot.yaml if added
    .github/workflows/ci.yml
    .github/workflows/dev-staging-proof.yml
    .github/workflows/production-release-proof.yml
    .github/workflows/convex-production-deploy.yml
    .github/workflows/release.yml
    package.json
    release.json
    scripts/release/
    docs/release-workflow.md
    docs/design-docs/scripts.md
    AGENTS.md
    README.md
    CHANGELOG.md

## Interfaces and Dependencies

GitHub branch protection and rulesets are part of the implementation, not an optional afterthought. Required contexts on `main` must exactly match current workflow job names. Remove protection from `dev` or change it to a deprecated branch rule only after the one-time reconciliation is complete. Tag protection or rulesets must cover `refs/tags/v*` if stable releases continue to use `vMAJOR.MINOR.PATCH`.

The `.github` parity work must stay SBS-specific. Dependabot should target existing SBS ecosystems only. CODEOWNERS should name real maintainers or be skipped. Issue templates should reflect SBS support and product surfaces. Any Codex-action issue triage workflow requires an explicit secret, label taxonomy, and owner because it would spend API credits and mutate GitHub issues. Local git hooks are not a dependency of this migration.

Vercel production must continue to track `main` for project `mma-shipbysunday`. The live project ID is `prj_a2hZoA7YC7A5tYpGhsqIXvsVgrCf`, the live team ID is `team_6l65P1uy5rfiy8d8wqRwLI8e`, and current Vercel metadata says `link.productionBranch` is `main` with `rootDirectory` set to `apps/web`. If any old staging alias such as `https://dev.man-meets-ai.com` remains, it should be documented as an optional preview or retired; it must not be described as the release-candidate authority after this migration.

Convex production deploy remains owned by `.github/workflows/convex-production-deploy.yml` and the repository variable `CONVEX_PRODUCTION_DEPLOY_ENABLED`. The workflow should deploy from `main` or explicitly skip when the variable disables automatic deploys. Do not move production Convex deploys to tags unless a later plan proves that is safer for this hosted app.

The release manifest contract in `release.json` remains the local source of release identity unless implementation deliberately replaces it. `release:manifest:check` must keep validating that the tag, version, and changelog heading agree. `release:evidence:build` must stay a tag-target and `main` proof collector, not become a `dev` release-candidate collector again.

The retained app test surfaces remain owned by `apps/web` and packages. This migration may remove release control-plane wrappers, but it must not delete meaningful unit, contract, integration, integration-ui, or retained sandbox tests just because the old QA harness is being retired.
