---
title: Implement Codex-Shaped CI And Tag Release Workflows
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Implement Ship by Sunday's manifest-backed tag release workflow and release evidence artifact while preserving current hosted proof and required checks.
post_build_recap: Added release.json, manifest and release-evidence validators, a guarded Tag Release workflow, proof-summary artifacts for branch proof workflows, focused tests, and docs while preserving CLI, QA, browser, and snapshot surfaces.
read_when:
  - Resuming the fourth child slice of the Codex release reset Program.
  - Changing CI, release proof workflows, tag validation, release manifests, or release evidence.
  - Checking boundaries before retiring the helper CLI, QA run-pack, browser proof, or branch-protection contexts.
program_id: sbs-codex-release-reset
planning_brief: docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-4.md
---

# Implement Codex-Shaped CI And Tag Release Workflows

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the CI and tag-release workflow migration.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday currently has documented release identity rules, release-owned helper scripts, and branch-driven staging and production proof, but it does not yet have the Codex-shaped operating layer the Program is aiming for. A release is still mostly a human-coordinated `dev -> main` promotion followed by docs and GitHub Release work, and there is no checked-in release manifest, no semver tag validator, and no machine-readable `release-evidence.v1` artifact that binds GitHub, Vercel, Convex, billing, auth, entitlement, changelog, and GitHub Release publication to one SHA.

After this plan is implemented, the repository should have a root `release.json` manifest, release-owned validators under `scripts/release`, a tag-aware GitHub Actions release workflow, machine-readable release evidence artifacts, and workflow summaries that make release state clear without hiding important gates behind skipped jobs. The existing hosted proof surfaces should still work: CI should still expose `static`, `integration`, `browser-smoke`, and `cli`; `dev` should still get staging proof; `main` should still get production proof and Convex production deployment proof; QA run-pack should remain the transitional hosted auth, entitlement, default ship, and billing proof mechanism.

This is the fourth child slice of the Program at `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`, governed by `planning-brief-4.md`.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-4.md`.
- [x] 2026-04-24 EDT: Grilled this ExecPlan and tightened the initial manifest decision, dry-run versus publish evidence rules, manual release workflow inputs, billing job visibility, and Convex skip handling.
- [x] 2026-04-24 EDT: Implemented root `release.json`, `scripts/release/validate-release-manifest.mjs`, `scripts/release/build-release-evidence.mjs`, and release manifest/evidence libraries under `scripts/release/lib/`.
- [x] 2026-04-24 EDT: Added `Tag Release` workflow, proof-summary artifacts for dev staging, production proof, and Convex production deploy, and package scripts `release:manifest:check` and `release:evidence:build`.
- [x] 2026-04-24 EDT: Added focused unit tests for release manifest and release evidence behavior and updated `docs/release-workflow.md` plus `qa/README.md`.
- [x] 2026-04-24 EDT: Ran local validation for manifest, evidence, publish fail-closed behavior, workflow YAML parsing, focused tests, lint, typecheck, plan lint, markdown lint, Program lint, and scoped diff check.

## Surprises & Discoveries

During plan authoring, local tags were `v0.2.0` and `v0.1.0`. `v0.2.0` resolves to commit `2de857d503bee13d763d3c7ed31d90e985ab3b00`, while `origin/main` resolves to `3c5347c06c039859b7780a61e331cebda9421aea`. This means the initial manifest should not pretend the latest historical tag is the current production tip; tag validation must compare each tag to evidence for that tag target SHA, not to whichever commit `origin/main` points at later.

During plan authoring, `CHANGELOG.md` uses date headings such as `## 2026-04-19`, not semver release headings. The release manifest and validator need an exact `changelogHeading` string and must validate that the heading exists, but this slice should not rewrite the whole changelog format unless the implementation chooses to add one focused heading for the current manifest.

During plan authoring, `.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml` still use job-level `if:` on `billing_integration`. That makes the job disappear as skipped when release scope is not billing-sensitive. The next implementation should decide whether to keep the job always present and perform the skip inside the job, because always-visible proof is one of the Codex-shaped goals.

During plan authoring, `.github/workflows/convex-production-deploy.yml` has one `deploy` job and a repository variable gate, `CONVEX_PRODUCTION_DEPLOY_ENABLED`. The release evidence workflow should treat this as the current Convex production proof source and should not bypass the pause switch.

During the pre-implementation grill on 2026-04-24, the plan still left the initial `release.json` version ambiguous. The implementation should seed `release.json` as the next stable release candidate, `0.3.0`, with `gitTag` set to `v0.3.0`, `schemaVersion` set to `release-manifest.v1`, `releaseEvidenceSchemaVersion` set to `release-evidence.v1`, `channel` set to `stable`, and `changelogHeading` set to the exact existing `CHANGELOG.md` heading the release owner intends to publish from. If no existing heading is suitable, the implementation should add one focused changelog heading for `v0.3.0` rather than leaving the manifest unvalidated.

During the pre-implementation grill on 2026-04-24, the plan needed a sharper publish rule. Dry-run evidence may contain `unavailable` hosted proof states so local validation can run without credentials, but tag-triggered publication evidence must fail on `unavailable` or `failed` required proof. The GitHub Release creation step must be unreachable unless evidence validation reports the release as publishable.

During the pre-implementation grill on 2026-04-24, workflow dispatch for the tag release workflow needed explicit inputs because a manual dispatch may not run on a tag ref. The release workflow should include inputs for `git_tag`, `tag_target_sha`, and `dry_run`, and should validate that manual non-dry-run publication still targets a real `refs/tags/v*` tag or an explicitly supplied tag target SHA.

During the pre-implementation grill on 2026-04-24, Convex production proof needed an explicit skip rule. If `CONVEX_PRODUCTION_DEPLOY_ENABLED` makes the main-push deploy workflow skip, release evidence must either find a previous successful Convex production deploy for the same tag target SHA or block publication. A skipped Convex deploy cannot be treated as passing proof by itself.

During implementation on 2026-04-24, the new `release.json` was seeded for the next stable release candidate, `v0.3.0`, with `changelogHeading` set to the existing `## 2026-04-19` heading. No tag was cut locally.

During implementation on 2026-04-24, the `Tag Release` workflow was implemented as fail-closed. It validates the manifest and tag identity, collects check-run proof for the tag target SHA, builds `release-evidence.v1`, and only reaches GitHub Release creation if publish-mode evidence has no blockers. Local publish validation intentionally fails when hosted proof is unavailable.

During implementation on 2026-04-24, the branch proof workflows were updated to upload JSON summaries: `dev-staging-proof-summary.json`, `production-release-proof-summary.json`, and `convex-production-deploy-summary.json`. These are machine-readable workflow artifacts for the tag release path; they do not replace QA run-pack proof.

## Decision Log

Decision: Add a root `release.json` as the release identity manifest in this slice.
Rationale: Plans 2 and 4 agree that package versions are not release truth. A root manifest gives tag validation one machine-readable source for version, channel, tag, changelog heading, and evidence schema.
Date: 2026-04-24

Decision: Keep the current tag-attests-main model for this slice.
Rationale: The Program has not proven that direct tag deployment to Vercel and Convex is safer or available. The current hosted product model deploys from `main`, so this slice should validate that a release tag points at the verified `main` SHA and that hosted evidence also points at that SHA.
Date: 2026-04-24

Decision: Put release manifest and evidence helpers under `scripts/release/`.
Rationale: Plan 3 made `scripts/release/` the canonical release-helper boundary. Adding tag and evidence helpers there avoids rebuilding new workflow logic on disposable QA paths.
Date: 2026-04-24

Decision: Preserve existing required CI contexts while adding release workflow proof.
Rationale: Branch protection currently requires `static`, `integration`, `browser-smoke`, and `cli` on `dev` and `main`. Removing or renaming those contexts belongs to later CLI and browser-proof slices, not this workflow implementation slice.
Date: 2026-04-24

Decision: Seed `release.json` for the next stable release candidate, `v0.3.0`, unless implementation discovers a release-owner-approved different next tag before editing.
Rationale: Seeding the manifest to the latest historical tag would create a manifest that cannot drive the next tag release because `v0.2.0` already exists. The workflow slice should establish the next release identity without cutting the tag locally.
Date: 2026-04-24

Decision: Let dry-run evidence be diagnostic, but require publish evidence to be complete.
Rationale: Local validation needs to work without Vercel, Convex, Stripe, Clerk, or GitHub release credentials, so dry-run artifacts may mark hosted facts as `unavailable`. A protected tag publication cannot be trustworthy if required hosted proof is unavailable.
Date: 2026-04-24

Decision: Implement `Tag Release` as guarded publication instead of cutting or publishing a real release locally.
Rationale: This repository cannot prove protected tag policy or hosted production evidence from the local shell. The workflow should exist and fail closed in publish mode until GitHub Actions can supply check-run and hosted proof for the tag target SHA.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is complete. The repo now has a root `release.json` manifest with `schemaVersion: release-manifest.v1`, `version: 0.3.0`, `gitTag: v0.3.0`, and `releaseEvidenceSchemaVersion: release-evidence.v1`. Package versions remain non-authoritative release metadata.

Release-owned manifest and evidence helpers now live under `scripts/release/`: `validate-release-manifest.mjs`, `build-release-evidence.mjs`, `lib/release-manifest.mjs`, and `lib/release-evidence.mjs`. Root package scripts expose `bun run release:manifest:check` and `bun run release:evidence:build`.

`.github/workflows/release.yml` now defines the guarded `Tag Release` workflow for `v*` tags and manual dry-runs. `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/convex-production-deploy.yml` now upload machine-readable proof summaries for downstream release evidence. Existing `CI` required contexts, helper CLI checks, QA run-pack proof, browser smoke, and snapshot fallback were preserved.

Local validation proves the manifest, evidence schema, workflow YAML, and focused unit tests. Hosted proof and live GitHub branch/tag protection were not mutated from the local shell; the tag workflow must run in GitHub Actions with real check-run, Vercel, Convex, billing, auth, and entitlement evidence before a protected release tag is trusted for production publication.

## Context and Orientation

The Program is replacing Ship by Sunday's bespoke and branch-driven release control plane with a Codex-shaped operating model. In this repository, Codex-shaped means GitHub-native checks, protected semver release tags, explicit version validation, deterministic release artifacts, narrow workflow permissions, source-level tests, and release-scoped hosted proof. It does not mean copying Codex's Rust, Bazel, npm package, DotSlash, WinGet, signing, or binary publishing mechanics.

The current workflow files are `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/convex-production-deploy.yml`, `.github/workflows/sandbox-e2e-nightly.yml`, and `.github/workflows/issue-labels.yml`. This plan should primarily touch the first four, and may add a new tag release workflow if that keeps release publication separate from branch-push proof.

The current `CI` workflow exposes these important jobs: `qa_control_plane`, `static`, `cli`, `integration`, and `browser-smoke`. Live branch protection documented by the Program requires `static`, `integration`, `browser-smoke`, and `cli`. The `qa_control_plane` job is release-important drift detection but is not currently a required context. This plan must preserve those names unless it deliberately records a credentialed branch-protection migration.

The current `Dev Staging Proof` workflow runs on pushes to `dev` and manual dispatch. It detects release scope, waits for the preview Vercel deployment behind `https://dev.man-meets-ai.com`, optionally syncs hosted Convex dev when Convex files changed, runs `qa:run-pack -- --pack=default_ship`, optionally runs `qa:run-pack -- --pack=billing_integration`, and ends with `release_gate`.

The current `Production Release Proof` workflow runs on pushes to `main` and manual dispatch. It detects release scope, waits for the production Vercel deployment behind `https://www.man-meets-ai.com`, runs `qa:run-pack -- --pack=default_ship`, optionally runs `qa:run-pack -- --pack=billing_integration`, ends with `release_gate`, and runs `reconcile_dev` after snapshot releases.

The current `Convex Production Deploy` workflow runs on pushes to `main` and manual dispatch. It uses `CONVEX_DEPLOY_KEY` and `CONVEX_PRODUCTION_DEPLOY_ENABLED`. The release evidence artifact must account for this workflow because hosted proof requires Convex production deployment identity.

The release helper boundary already exists under `scripts/release/`. Existing entrypoints include `release-triage.mjs`, `export-release-intake.mjs`, `export-engineering-intake-snapshot.mjs`, `release-snapshot.mjs`, `reconcile-post-snapshot-release.mjs`, `detect-release-scope.mjs`, `wait-for-vercel-production-deployment.mjs`, `wait-for-host.mjs`, and `sync-hosted-convex-dev.mjs`. Existing libraries live under `scripts/release/lib/`.

The release contract in `docs/release-workflow.md` says stable release tags use `vMAJOR.MINOR.PATCH`, optional prerelease tags use semver prerelease suffixes, release tags attest the verified `main` production SHA for now, package versions are not release truth, and a future root `release.json` plus `release-evidence.v1` artifact should own release identity.

### In Scope

In scope is adding a root `release.json` manifest, adding release manifest and tag validation helpers under `scripts/release`, adding `release-evidence.v1` construction and validation helpers under `scripts/release`, adding focused tests for those helpers, updating package scripts for local validation commands, and updating GitHub Actions workflows so CI and release proof can validate tags, preserve visible required checks, produce proof summaries, upload release evidence, and publish or prepare a GitHub Release for protected `v*` tags.

In scope is updating `.github/workflows/ci.yml` only if needed to keep required checks truthful or to add manifest validation to an existing always-visible job. In scope is updating `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/convex-production-deploy.yml` to emit machine-readable proof summaries or artifacts that the tag release workflow can consume. In scope is adding a new workflow such as `.github/workflows/release.yml` if the implementation chooses a separate tag publication workflow.

In scope is updating `docs/release-workflow.md`, `qa/README.md`, this ExecPlan, and the owning Program to describe the implemented workflow truth. In scope is documenting exact branch-protection and tag-ruleset settings that need to be applied, and verifying them with `gh` when credentials and permissions are available.

### Out Of Scope

Out of scope is deleting QA control-plane files, deleting QA journeys, deleting QA inventory, deleting personas, deleting `qa:run-pack`, deleting browser or e2e harness files, deleting `browser-smoke`, deleting the helper CLI, removing `bin/sbs`, removing `sbs:check`, removing the `cli` CI job, removing the required `cli` status context, deleting snapshot fallback, removing `release:snapshot`, removing post-snapshot reconcile behavior, adding CODEOWNERS, adding broad `.github/codex` automation, rotating credentials, rewriting product routes, rewriting the source test strategy, or performing broad historical docs cleanup.

Out of scope is cutting a real production release tag from the local shell, publishing a real GitHub Release manually, or mutating live branch protection and tag rulesets without explicit credentials, verification, and operator intent. The implementation may add automation and exact instructions for those settings, but it must not claim live policy changed unless it proves that with GitHub API or UI evidence.

## Plan of Work

Start by refreshing the current workflow and release identity facts. Run `git status --short`, list workflows, list local `v*` tags, read `CHANGELOG.md`, read the package scripts, and read the relevant workflow files. Confirm whether `release.json` already exists. The expected starting observation is that `release.json` does not exist, `CHANGELOG.md` has date headings, local tags include `v0.2.0` and `v0.1.0`, and the release helpers live under `scripts/release/`.

Next design and add the root manifest. Use a compact JSON object with fields that match `docs/release-workflow.md`: `schemaVersion`, `version`, `channel`, `gitTag`, `changelogHeading`, `releaseEvidenceSchemaVersion`, and optional `notes`. The initial manifest should represent the next stable release candidate, `v0.3.0`, not the already-existing historical `v0.2.0` tag. The manifest validator must treat `release.json` as the source of release truth and must not read package versions as release truth.

Add release-owned helper code under `scripts/release/` and `scripts/release/lib/`. A recommended split is `scripts/release/validate-release-manifest.mjs` as the CLI entrypoint, `scripts/release/build-release-evidence.mjs` as the CLI entrypoint for evidence creation or dry-run creation, and libraries such as `scripts/release/lib/release-manifest.mjs`, `scripts/release/lib/release-evidence.mjs`, and `scripts/release/lib/git-release-identity.mjs`. Keep APIs narrow: parse and validate the manifest, parse and validate release tags, verify changelog heading existence, verify tag target SHA when supplied, and build or assert the `release-evidence.v1` object.

Add focused unit tests under `apps/web/tests/unit` for manifest parsing, semver tag matching, changelog heading validation, tag target validation, evidence object validation, and error messages. Use fixture objects and local git refs where possible. Do not require Vercel, Convex, Stripe, Clerk, or GitHub network credentials for unit tests.

Update `package.json` with public operator commands that preserve a small local surface. Recommended names are `release:manifest:check` for validating `release.json` against a supplied or inferred tag and `release:evidence:build` for generating or dry-running `release-evidence.v1`. Keep existing `release:triage`, `release:snapshot`, `engineering:intake:release`, and `engineering:intake:snapshot` unchanged.

Update workflows in small steps. First make proof summaries machine-readable: `Dev Staging Proof`, `Production Release Proof`, and `Convex Production Deploy` should each write a JSON summary artifact containing workflow name, run id, commit SHA, key job outcomes, and the hosted identity facts they can know. Then add the tag release workflow. The tag workflow should run on `push` to `v*` tags and `workflow_dispatch` for dry-run or repair, with manual inputs for `git_tag`, `tag_target_sha`, and `dry_run`. It should validate that the tag matches `release.json`, validate that the tag target is the intended `main` SHA, query or consume production proof and Convex proof for the same SHA, build `release-evidence.v1`, upload it as an artifact, and create or update the GitHub Release only after publish-mode evidence validation passes.

Make release-scope-dependent jobs visible. The current `billing_integration` jobs use job-level `if:` conditions. If the implementation can do it without destabilizing the existing proof path, change those jobs to always exist and put the billing-sensitive decision inside the job, with explicit skip output and artifact summaries. If that change is too risky for this slice, record the reason in `Surprises & Discoveries` and make the tag release workflow's evidence artifact explicitly represent skipped billing proof as `not_required` only when release scope proves it.

Keep branch protection and tag protection truthful. Use `gh api` to inspect current branch protection and rulesets if credentials allow it. If the repo can apply settings in this environment, apply only the settings this plan explicitly authorizes and record the exact command and result. If not, update `docs/release-workflow.md` with exact required settings: branch protection still requires `static`, `integration`, `browser-smoke`, and `cli`; future tag protection should protect `refs/tags/v*`; and the tag release workflow should be required before GitHub Release publication. Do not add CODEOWNERS or issue automation in this slice.

Finally update docs and Program artifacts. `docs/release-workflow.md` should describe the real manifest, tag workflow, release evidence file, and remaining manual GitHub settings. `qa/README.md` should describe how QA evidence participates in the tag-attested release path while QA remains transitional. This ExecPlan should record implementation progress, discoveries, decisions, validation receipts, and any hosted proof that could not be proven locally.

## Milestones

Milestone 1 refreshes the workflow and release identity facts. At the end of this milestone, the implementer has current observations for workflow files, package scripts, local tags, changelog headings, existing release helpers, and current GitHub settings if available. Success means the implementation starts from repo facts rather than the Program brief alone.

Milestone 2 adds local release identity primitives. At the end of this milestone, `release.json` exists, release manifest validation runs locally, semver tag validation works, changelog heading validation works, and focused unit tests prove the helper behavior without network credentials. Success means a bad tag, bad manifest version, missing changelog heading, or package-version-only release claim fails before any workflow publishes evidence.

Milestone 3 adds release evidence primitives. At the end of this milestone, the repository can build and validate a `release-evidence.v1` JSON object from explicit inputs and can report blockers when hosted proof is unavailable. Success means evidence shape is deterministic, schema validation is covered by tests, and the artifact distinguishes `not_required`, `passed`, `failed`, and `unavailable` proof states without hiding missing hosted facts.

Milestone 4 updates GitHub Actions workflows. At the end of this milestone, branch-push proof workflows emit machine-readable summaries, release-scope-dependent proof is visible or explicitly represented, and a tag release workflow validates `release.json`, tag target SHA, production proof, Convex proof, billing proof when required, and GitHub Release publication evidence. Success means local workflow YAML parses and the workflow commands are testable locally in dry-run mode.

Milestone 5 updates docs and validates the slice. At the end of this milestone, `docs/release-workflow.md`, `qa/README.md`, this ExecPlan, and the owning Program reflect the implemented truth, focused tests pass, repo lint and typecheck pass, workflow YAML parses, and any unproven live GitHub or hosted setting is recorded as a blocker or operator step. Success means a fresh agent can tell exactly what changed and what still needs credentialed remote proof.

## Concrete Steps

1. Confirm the starting state and preserve unrelated work:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short
       ls -1 .github/workflows
       find scripts/release -maxdepth 2 -type f | sort
       git tag --list 'v*' --sort=-v:refname
       test ! -f release.json

   Expect unrelated dirty work in the checkout. Do not revert it. Expect `release.json` to be absent at the beginning of this slice.

2. Read the current release workflow surfaces:

       sed -n '1,220p' .github/workflows/ci.yml
       sed -n '1,380p' .github/workflows/dev-staging-proof.yml
       sed -n '1,380p' .github/workflows/production-release-proof.yml
       sed -n '1,220p' .github/workflows/convex-production-deploy.yml
       sed -n '60,132p' docs/release-workflow.md
       sed -n '1,140p' CHANGELOG.md
       sed -n '1,110p' package.json

   Expected observation: `CI` exposes `static`, `integration`, `browser-smoke`, and `cli`; staging and production proof use release-owned helper paths; `billing_integration` is job-level skipped when not sensitive; `release.json` is documented but missing.

3. Inspect live GitHub settings if credentials are available:

       gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection
       gh api repos/ParkerRex/ship-by-sunday/branches/main/protection
       gh api repos/ParkerRex/ship-by-sunday/rulesets
       gh workflow list --repo ParkerRex/ship-by-sunday --all

   If these commands fail because the local shell is not authenticated or lacks permissions, record that as a validation limitation. Do not block local implementation solely on missing GitHub settings access.

4. Add `release.json` at the repository root. Use the exact field names the docs already promised:

       schemaVersion
       version
       channel
       gitTag
       changelogHeading
       releaseEvidenceSchemaVersion
       notes

   Seed it as the next stable release candidate, `version: "0.3.0"` and `gitTag: "v0.3.0"`, unless implementation discovers a release-owner-approved different next tag before editing. Validate that `schemaVersion` is `release-manifest.v1`, `releaseEvidenceSchemaVersion` is `release-evidence.v1`, `gitTag` is `v${version}`, `channel` is `stable` unless a prerelease suffix is used, and `changelogHeading` exists in `CHANGELOG.md`.

5. Add manifest validation helpers under `scripts/release/`. The command should support a dry-run local form such as:

       node scripts/release/validate-release-manifest.mjs --manifest release.json --changelog CHANGELOG.md
       node scripts/release/validate-release-manifest.mjs --manifest release.json --tag "$(node -e 'console.log(require("./release.json").gitTag)')" --changelog CHANGELOG.md

   The exact flags may change during implementation, but the final command must support validating the manifest without network credentials and validating a supplied tag against the manifest.

6. Add evidence helpers under `scripts/release/`. The command should support a local dry-run form that writes a deterministic artifact to `tmp/`:

       node scripts/release/build-release-evidence.mjs --manifest release.json --output tmp/release-evidence.v1.json --dry-run

   The dry-run artifact may mark hosted proof as `unavailable`, but it must still validate against the `release-evidence.v1` schema and explain which live facts are missing. Add a publish-mode validation path that fails if any required proof is `unavailable` or `failed`.

7. Add focused unit tests. The minimum test files should cover release manifest and release evidence behavior:

       apps/web/tests/unit/release-manifest.test.ts
       apps/web/tests/unit/release-evidence.test.ts

   Add extra focused tests if implementation splits the helpers further. Tests should cover valid manifest, invalid tag, invalid version, missing changelog heading, prerelease/channel mismatch, valid evidence, missing required evidence fields, and blocker or unavailable states.

8. Update `package.json` scripts. Add stable operator commands such as:

       release:manifest:check
       release:evidence:build

   Keep existing release and engineering-intake commands unchanged unless they need to call the new helpers.

9. Update branch proof workflows to produce machine-readable summaries. The recommended artifacts are:

       dev-staging-proof-summary.json
       production-release-proof-summary.json
       convex-production-deploy-summary.json

   Each summary should include `schemaVersion`, `workflowName`, `runId`, `commitSha`, job outcomes, relevant URLs, and any hosted identity facts available inside that workflow. Upload each summary with `actions/upload-artifact`. For Convex production proof, a skipped deploy must be represented as `skipped`, not `passed`; release publication can treat it as acceptable only if evidence lookup finds another successful Convex production deploy for the same tag target SHA.

10. Add or update the tag release workflow. If adding a new file, use `.github/workflows/release.yml`. The workflow should run on `push` tags matching `v*` and have a manual path through `workflow_dispatch` with `git_tag`, `tag_target_sha`, and `dry_run` inputs. It should validate the manifest, validate tag target SHA, gather production and Convex proof for that SHA, build `release-evidence.v1`, upload the artifact, and create or update the GitHub Release only after publish-mode evidence validation passes. Use narrow permissions and keep write permissions only on the job that publishes release output.

11. Make billing proof visible or explicitly represented. Prefer changing `billing_integration` jobs in staging and production proof workflows so the job always exists and internally exits successfully with a clear `not_required` summary when release scope is not billing-sensitive. If keeping job-level skips is safer, make `release-evidence.v1` explicitly encode the skipped job as `not_required` only when `release_scope` proves billing is not sensitive.

12. Parse workflow YAML locally after edits:

       ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |file| YAML.load_file(file) }; puts "workflow yaml ok"'

   Expected observation: `workflow yaml ok`.

13. Update docs and living artifacts. Update `docs/release-workflow.md` for actual manifest, workflow, evidence, tag, and settings behavior. Update `qa/README.md` only where QA release evidence now participates in the tag-attested release path. Update this ExecPlan with progress, discoveries, decisions, and validation receipts. Update the owning Program only after the child slice is implemented or materially changes Program-level truth.

14. Run focused local validation:

       node scripts/release/validate-release-manifest.mjs --manifest release.json --changelog CHANGELOG.md
       node scripts/release/build-release-evidence.mjs --manifest release.json --output tmp/release-evidence.v1.json --dry-run
       node scripts/release/build-release-evidence.mjs --manifest release.json --output tmp/release-evidence.publish-check.json --validate-publish || test $? -eq 1
       bun run --cwd apps/web test:unit -- tests/unit/release-manifest.test.ts tests/unit/release-evidence.test.ts
       bun run release:triage -- --output tmp/release-triage-after-tag-workflow.json
       bun run engineering:intake:release -- --output tmp/release-intake-after-tag-workflow.json
       bun run engineering:intake:snapshot -- --output tmp/engineering-intake-snapshot-after-tag-workflow.json

   The publish-check command is expected to fail locally when hosted proof inputs are unavailable; it must fail with explicit missing-proof messages, not with schema or import errors. The release triage command may still report current release blockers such as missing Vercel metadata or skipped remote proof if credentials are not present. That is acceptable only if the command exits successfully and the blockers are the expected current release-state facts.

15. Run broader repo and docs validation:

       bun run format
       bun lint
       bun typecheck
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-4.md docs/release-workflow.md qa/README.md
       bun run programs:lint
       git diff --check -- release.json scripts/release package.json .github/workflows docs/release-workflow.md qa/README.md docs/exec-plans/active/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md

## Validation and Acceptance

This slice is complete when the repository has a manifest-backed release identity, local validation commands for release manifest and release evidence, a tag-aware release workflow, machine-readable proof summaries from branch proof workflows, a deterministic `release-evidence.v1` artifact, focused tests for the new release primitives, and truthful docs describing what is implemented and what still requires live GitHub settings or hosted credentials.

Acceptance requires that `release.json` exists and is validated, `release-evidence.v1` can be built or dry-run locally, semver tags are checked against the manifest, workflow YAML parses, existing required CI contexts are not silently removed, staging and production proof still use the release-owned helpers under `scripts/release`, billing proof is visible or explicitly represented, and no helper CLI, QA, browser harness, CODEOWNERS, issue automation, or broad docs cleanup work was absorbed.

If local credentials cannot prove Vercel, Convex, billing, GitHub Release publication, branch protection, or tag rulesets, this slice may still complete with local manifest/evidence proof and workflow YAML proof, but it must record those live checks as credentialed remote proof that must run in GitHub Actions or be applied by an operator before the new tag release path is trusted for production.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` unless a command states another working directory:

       git status --short
       node scripts/release/validate-release-manifest.mjs --manifest release.json --changelog CHANGELOG.md
       node scripts/release/build-release-evidence.mjs --manifest release.json --output tmp/release-evidence.v1.json --dry-run
       node scripts/release/build-release-evidence.mjs --manifest release.json --output tmp/release-evidence.publish-check.json --validate-publish || test $? -eq 1
       bun run --cwd apps/web test:unit -- tests/unit/release-manifest.test.ts tests/unit/release-evidence.test.ts
       bun run release:triage -- --output tmp/release-triage-after-tag-workflow.json
       bun run engineering:intake:release -- --output tmp/release-intake-after-tag-workflow.json
       bun run engineering:intake:snapshot -- --output tmp/engineering-intake-snapshot-after-tag-workflow.json
       ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |file| YAML.load_file(file) }; puts "workflow yaml ok"'
       bun run format
       bun lint
       bun typecheck
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-4.md docs/release-workflow.md qa/README.md
       bun run programs:lint
       git diff --check -- release.json scripts/release package.json .github/workflows docs/release-workflow.md qa/README.md docs/exec-plans/active/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md

When credentials are available, also run:

       gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection
       gh api repos/ParkerRex/ship-by-sunday/branches/main/protection
       gh api repos/ParkerRex/ship-by-sunday/rulesets
       gh workflow list --repo ParkerRex/ship-by-sunday --all

Record whether those commands prove the required branch contexts and protected tag policy or whether an operator still needs to apply settings.

## Idempotence and Recovery

The manifest and helper scripts should be safe to validate repeatedly. `release.json` should be edited intentionally and should not be generated from package versions during normal validation. Dry-run evidence should write to `tmp/` and should not be committed unless the implementation intentionally adds a fixture under a test directory.

Workflow changes should be staged so YAML parses after each edit. If a workflow change breaks parsing, repair the workflow before continuing to another file. Do not delete existing workflow files to recover. If a tag workflow cannot be completed in one pass, leave it disabled only with an explicit guard and record the blocker in this plan.

Do not mutate live branch protection or tag rulesets unless credentials, permissions, and the exact intended settings are known. If a GitHub API mutation fails halfway, stop, record the partial state, rerun read-only `gh api` checks, and do not improvise new policy from the shell.

If a hosted proof command cannot run locally because secrets are unavailable, keep the local dry-run and unit proof green, and record the missing secret or setting by name. Do not hide missing live proof behind a passing dry-run.

## Artifacts and Notes

Program source:

       docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-4.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/converged-decision-packet.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/dependency-graph.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/plan-split-recommendation.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/cross-repo-review.md

Completed prerequisite child plans:

       docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md
       docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md
       docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md

Authoring-time reference facts from 2026-04-24:

       local tags: v0.2.0, v0.1.0
       v0.2.0 commit: 2de857d503bee13d763d3c7ed31d90e985ab3b00
       origin/main commit: 3c5347c06c039859b7780a61e331cebda9421aea
       current required branch contexts documented by Program: static, integration, browser-smoke, cli
       current release helper boundary: scripts/release/
       current package version: 0.1.0 and not release truth
       current release manifest: absent before this slice
       current changelog headings: date-based, not semver-based

Plan-writing validation from 2026-04-24:

       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-4.md
       bun run programs:lint
       git diff --check -- docs/exec-plans/active/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-4.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/current-planning-brief.txt

These facts are orientation only. Implementation must rerun the inventory and reference commands and record fresh evidence in this plan before changing workflows.

Implementation validation from 2026-04-24:

       bun run release:manifest:check
       bun run release:evidence:build
       node scripts/release/build-release-evidence.mjs --manifest=release.json --output=tmp/release-evidence.publish-check.json --validate-publish || test $? -eq 1
       node scripts/release/build-release-evidence.mjs --manifest=release.json --output=tmp/release-evidence.publishable.json --tag-target-sha=sha --main-sha=sha --vercel-status=passed --convex-status=passed --billing-status=not_required --auth-status=passed --entitlement-status=passed --validate-publish
       node --check scripts/release/validate-release-manifest.mjs && node --check scripts/release/build-release-evidence.mjs && node --check scripts/release/lib/release-manifest.mjs && node --check scripts/release/lib/release-evidence.mjs
       bun run --cwd apps/web test:unit -- tests/unit/release-manifest.test.ts tests/unit/release-evidence.test.ts tests/unit/billing-integration-step-planner.test.ts tests/unit/convex-dev-sync.test.ts tests/unit/release-scope.test.ts tests/unit/release-triage.test.ts
       ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |file| YAML.load_file(file) }; puts "workflow yaml ok"'
       bun run release:triage -- --output tmp/release-triage-after-tag-workflow.json
       bun run engineering:intake:release -- --output tmp/release-intake-after-tag-workflow.json
       bun run engineering:intake:snapshot -- --output tmp/engineering-intake-snapshot-after-tag-workflow.json
       bun run format
       bun lint

## Interfaces and Dependencies

This plan depends on root `release.json`, root `package.json`, `CHANGELOG.md`, `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/convex-production-deploy.yml`, `scripts/release`, `apps/web/tests/unit`, `docs/release-workflow.md`, `qa/README.md`, and the owning Program packet.

The release manifest interface must be a JSON object with stable field names. The required fields are `schemaVersion`, `version`, `channel`, `gitTag`, `changelogHeading`, and `releaseEvidenceSchemaVersion`. `notes` is optional and must not affect validation.

The release evidence interface must be a JSON object with `schemaVersion: "release-evidence.v1"` and enough fields to bind the release tag, tag target SHA, main SHA, branch model, channel, changelog heading, workflow run references, Vercel identity, Convex identity, billing proof, auth and entitlement proof, GitHub Release publication, blockers, and generation timestamp to one release decision.

The workflow interfaces that must remain stable are the current required `CI` job names `static`, `integration`, `browser-smoke`, and `cli`; the release proof jobs `release_scope`, `default_ship`, `billing_integration`, and `release_gate`; the `Convex Production Deploy` workflow's `deploy` job and `CONVEX_PRODUCTION_DEPLOY_ENABLED` pause switch; and the root release commands `release:triage`, `release:snapshot`, `engineering:intake:release`, and `engineering:intake:snapshot`.

The downstream Program dependencies are Plan 5, `Retire The Helper CLI`, Plan 6, `Replace Browser Harness Proof With Source And Release Proof`, and Plan 7, `Retire Disposable QA Control Plane`. Those later plans depend on this slice to clarify which workflow contexts and hosted proof surfaces remain release-critical after tag evidence exists.
