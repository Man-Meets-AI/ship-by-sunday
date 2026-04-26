---
title: Ship By Sunday Codex Release Reset Planning Brief 4
program_id: sbs-codex-release-reset
brief_version: 4
status: superseded
summary: Make Codex-shaped CI and tag release workflows the next child slice after release-critical helpers moved to scripts/release.
read_when:
  - Writing the fourth child ExecPlan for the Codex release reset Program.
  - Implementing tag validation, release evidence, and GitHub Actions release workflows.
  - Checking boundaries before changing CI, release proof, branch protection, or tag policy.
---

# Ship By Sunday Codex Release Reset Planning Brief 4

## Planning Refresh

## What Changed

The third child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md`. It moved release-critical entrypoints and libraries out of `qa/scripts` and into `scripts/release/` and `scripts/release/lib/`. Public root command names still work, release workflows now call release-owned helper paths, and QA-owned scripts remain in `qa/scripts` for later retirement.

The new release-owned helper boundary is now concrete. The release entrypoints are `scripts/release/release-triage.mjs`, `scripts/release/export-release-intake.mjs`, `scripts/release/export-engineering-intake-snapshot.mjs`, `scripts/release/release-snapshot.mjs`, `scripts/release/reconcile-post-snapshot-release.mjs`, `scripts/release/detect-release-scope.mjs`, `scripts/release/wait-for-vercel-production-deployment.mjs`, `scripts/release/wait-for-host.mjs`, and `scripts/release/sync-hosted-convex-dev.mjs`. The release libraries live under `scripts/release/lib/`.

The relocation used direct caller updates rather than compatibility wrappers. `package.json` now routes `release:triage`, `release:snapshot`, `engineering:intake:release`, `engineering:intake:snapshot`, and `qa:convex:sync-hosted-dev` to `scripts/release`. `.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml` call `scripts/release/detect-release-scope.mjs`, `scripts/release/wait-for-vercel-production-deployment.mjs`, `scripts/release/wait-for-host.mjs`, and `scripts/release/reconcile-post-snapshot-release.mjs` where applicable.

Focused proof passed for the relocation. `bun run release:triage`, `bun run engineering:intake:release`, `bun run engineering:intake:snapshot`, `node scripts/release/detect-release-scope.mjs`, focused moved-helper unit tests, plan lint, markdown lint, Program lint, scoped diff check, `bun run format`, `bun lint`, and `bun typecheck` passed. `node scripts/release/release-snapshot.mjs --dry-run` produced deterministic JSON but exited 1 because there is no open `dev -> main` release PR; that is current release-policy behavior, not a relocation failure.

The next workflow slice no longer has to reach into disposable QA paths for release triage, release scope, Vercel wait, Convex sync, release intake, or snapshot fallback. It can build tag validation and release evidence against `scripts/release` as the canonical helper boundary.

## What Still Holds

The nine-plan split still holds. Plans 1, 2, and 3 are complete. Plan 4 remains the next dependency because the repo has documented proof-surface truth, documented release identity, and a release-owned helper boundary, but it still has branch-driven workflows and no implemented tag validation or `release-evidence.v1` artifact.

Codex remains a model for operating shape, not implementation details. The next slice should copy Codex's invariants: GitHub-native checks, always-visible required jobs, protected semver release tags, explicit version validation, narrow workflow permissions, deterministic release artifacts, and idempotent publication. It should not copy Codex's Rust, Bazel, npm package, DotSlash, WinGet, signing, or binary packaging mechanics.

The current hosted product constraints still hold. Ship by Sunday releases a Vercel, Convex, Stripe, Clerk, and entitlement-backed product. The release workflow must prove production deployment identity, Convex deployment identity, billing-sensitive proof, auth and entitlement proof, and GitHub Release publication against the same tag target SHA.

The release identity decision from Plan 2 still holds. Stable production tags use `vMAJOR.MINOR.PATCH`; prerelease suffixes are reserved for future channels; release tags attest the verified `main` production SHA until a later platform plan proves direct tag deployment is safer; package versions are not release truth; the future source of release identity is a root `release.json`; and future release proof should emit `release-evidence.v1`.

The existing `dev -> main` branch model remains in force until this workflow slice deliberately changes or replaces a piece of it. The next slice may implement tag-attested release publication from the merged `main` SHA, but it must not silently delete staging proof, production proof, snapshot fallback, or the normal release PR path without equivalent proof.

The required `cli` status context still exists and still blocks helper CLI retirement. The next workflow slice may add new checks or make release checks more truthful, but it must not delete the helper CLI, remove `bin/sbs`, remove `sbs:check`, remove the `cli` CI job, or declare the `cli` required context obsolete. That belongs to the later helper CLI retirement slice.

QA and browser proof are still active transitional surfaces. The next slice may keep calling `qa:run-pack` from release proof workflows when that is the current hosted proof mechanism, but it must not delete QA inventory, personas, run reports, browser smoke, sandbox e2e, or the QA team skill. Replacement proof and deletion belong to later slices.

## Boundary Changes

Plan 4 should now be titled `Implement Codex-Shaped CI And Tag Release Workflows`.

The scope is workflow and release-identity implementation, not broad cleanup. The next ExecPlan should add the root `release.json` manifest, implement semver tag and manifest validation, implement `release-evidence.v1` generation or validation under `scripts/release`, and reshape GitHub Actions so release proof can be driven by protected `v*` tags while preserving hosted product proof.

The next plan should treat `scripts/release/` as the only canonical release-helper implementation boundary. New release manifest, tag validation, and release evidence helpers should live under `scripts/release/` or `scripts/release/lib/` unless inspection proves a narrower app-owned boundary is necessary for one helper. New tests for those helpers should live in the existing source-level test surface, most likely `apps/web/tests/unit` if they exercise repo-level scripts the current Vitest setup already imports.

The next plan may update `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/convex-production-deploy.yml` when needed to make checks always visible, preserve current required contexts, add tag validation, upload release evidence, and bind hosted proof to the release SHA. It may add a new release workflow if that is the cleanest way to separate tag publication from branch-push proof. It may update `docs/release-workflow.md`, `qa/README.md`, and this Program to describe the implemented workflow truth.

The next plan may document exact branch-protection and protected-tag settings that a human or GitHub API must apply, and it may add scripts or workflow jobs that verify expected settings when credentials are available. It should not assume local shell access can mutate GitHub repository rulesets. If live branch protection or tag rules cannot be changed from the local environment, the plan must still make the repo artifacts truthful and record the manual or credentialed setting as an explicit remaining release-blocking step.

The next plan must not delete the helper CLI, delete QA control-plane files, delete browser or e2e harness files, remove `qa:run-pack`, remove `browser-smoke`, remove the `cli` check, retire snapshot release fallback, add CODEOWNERS, add broad `.github/codex` automation, rotate credentials, rewrite the source test strategy, or perform broad docs archive cleanup.

## Dependency Changes

The dependency order is unchanged, but Plan 3 removes the largest blocker for Plan 4. New tag and evidence workflows can now call release-owned helpers without creating new dependencies on the QA control plane.

Plan 5, helper CLI retirement, remains blocked until Plan 4 produces a replacement required-check story. The current branch protection still requires `cli`, and the helper CLI remains wired through root scripts and CI.

Plan 6, browser proof replacement, remains blocked until the workflow slice makes clear which browser or hosted checks are still release-critical. Plan 4 may call existing browser or QA proof from release workflows, but broad replacement or deletion belongs to Plan 6.

Plan 7, disposable QA retirement, remains blocked until release workflows and browser replacement proof no longer depend on QA-owned run-pack, personas, inventory, or reports.

Plan 8, GitHub policy and Codex automation, remains downstream. Plan 4 may define branch and tag protection requirements because they are release-mechanics prerequisites, but CODEOWNERS, issue templates, Codex prompts, labelers, and deduplication automation should wait.

## Next Plan Recommendation

Exact next plan title: `Implement Codex-Shaped CI And Tag Release Workflows`.

Exact scope: implement the release workflow mechanics promised by Plans 1 through 3. The next plan should add a root `release.json` manifest as the version source of truth, add release tag validation for `vMAJOR.MINOR.PATCH` against that manifest, add or update `scripts/release` helpers that create and validate `release-evidence.v1`, update GitHub Actions so release checks are always visible where they are intended to be required, bind staging and production proof to the exact commit SHA under test, and publish or prepare GitHub Release evidence for protected `v*` tags.

Exact workflow boundaries: preserve the current `CI` required contexts unless the plan explicitly proves and documents their replacement; keep `dev` staging proof for integrated release candidates; keep production proof for the merged `main` SHA; keep Convex production deploy proof tied to `main`; make billing proof internally gated by release scope rather than silently disappearing when it should be visible; and add tag-triggered or tag-attested release publication only after the workflow can prove that the tag target SHA matches `main`, Vercel production, Convex production, billing evidence when required, and the matching changelog heading.

Exact artifact boundaries: `release.json` should be the repo-root release identity manifest. `release-evidence.v1` should be a machine-readable artifact generated by release automation and should include at least schema version, tag, tag target SHA, release manifest version, changelog heading, GitHub workflow run references, Vercel deployment identity, Convex deployment identity, billing proof state, auth and entitlement proof references, GitHub Release URL or draft URL, and explicit blockers when evidence is unavailable. The next ExecPlan should decide the exact file shape and tests before implementation.

Exact exclusion boundaries: do not delete QA, do not retire the CLI, do not remove `qa:run-pack`, do not remove `browser-smoke`, do not remove the required `cli` context, do not delete snapshot fallback, do not add CODEOWNERS, do not add broad GitHub issue automation, do not rewrite product tests, do not rotate credentials, and do not clean historical docs except for local docs that must describe the workflow changes truthfully.

Why it is next now: the Program now has proof-surface truth, release identity, and release-owned helper paths. The next reliability bottleneck is that those decisions are still mostly documented, while the live GitHub Actions release path remains branch-driven and lacks a manifest-backed tag workflow and release evidence artifact. Implementing that workflow layer is the central Codex-shaped operating-model change that unlocks later CLI and QA retirement.

## Risks To Carry Forward

Always-visible checks are easy to get wrong. A job-level `if:` that skips an optional proof job can make GitHub branch protection and human review misleading. The next plan should prefer always-present jobs with internal skip decisions and explicit summaries for release-scope-dependent checks such as `billing_integration`.

Tag-attested release identity can drift if the tag, `main`, Vercel deployment, Convex deployment, and GitHub Release do not all point at the same SHA. The next plan must make SHA identity an explicit validation step, not a release note convention.

`release.json` will become release-critical. The next plan must validate its version, tag, channel, changelog heading, and evidence schema fields, and must prevent package versions from being treated as release truth.

Hosted proof may be partially unprovable in a local shell because `VERCEL_TOKEN`, Vercel project variables, Convex deployment metadata, billing secrets, or GitHub ruleset permissions may be missing. The next plan should distinguish local unit and dry-run proof from credentialed GitHub Actions proof, and it must not claim live tag protection or hosted deployment proof unless those facts are actually verified.

The snapshot fallback is still a separate recovery lane. Workflow replacement must not remove `release:snapshot` or `reconcile-post-snapshot-release` behavior unless a later plan explicitly replaces the fallback with an equal or stronger recovery path.

The helper CLI is still required by branch protection and CI. Plan 4 must avoid creating a half-migrated state where tag workflows assume the CLI is gone while `dev` and `main` still require the `cli` context.

`qa:run-pack` remains the current hosted auth, entitlement, default ship, and billing proof mechanism. Plan 4 can orchestrate it from release workflows, but deleting or replacing it belongs to Plan 6 and Plan 7.

Remote GitHub settings may not be representable by checked-in files alone. If protected tag rulesets or required contexts need manual or API changes, the plan must capture exact settings, verification commands, and remaining operator steps rather than burying them in prose.
