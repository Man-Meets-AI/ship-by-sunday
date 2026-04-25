---
title: Define Tag Release Identity And Hosted Evidence Contract
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Define the Ship by Sunday release tag, version, branch, and hosted evidence contract before any tag workflow or QA and CLI cleanup begins.
post_build_recap: Documented a tag-attests-main release identity contract, future release.json version source, protected v* tag policy requirements, and hosted Vercel, Convex, billing, auth, and entitlement evidence requirements without changing workflows or product behavior.
read_when:
  - Resuming the second child slice of the Codex release reset Program.
  - Deciding what an SBS release tag means before changing release workflows.
  - Preparing tag workflow, release-helper relocation, CLI retirement, or QA retirement work.
program_id: sbs-codex-release-reset
planning_brief: docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-2.md
---

# Define Tag Release Identity And Hosted Evidence Contract

This completed execution plan records the release identity and hosted evidence contract defined by the second child slice of the Codex release reset Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday is moving toward a Codex-shaped release model, but it cannot safely implement tag-triggered workflows until the repo defines what a release tag means. The visible outcome of this plan is a documented, repo-visible release identity contract: which tag patterns are valid, which file or manifest owns release version truth, whether tags deploy or attest production, how `dev`, `main`, Vercel, Convex, Stripe, Clerk, entitlement, and GitHub Releases prove the same SHA, and what machine-readable evidence future workflows must produce. After this plan lands, the next workflow implementation plan should be able to build tag validation and hosted proof without re-litigating release semantics.

This is the second child slice of the Program at `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`, governed by `planning-brief-2.md`.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-2.md`.
- [x] 2026-04-24 EDT: Completed the pre-implementation grill and tightened the plan around tag target evidence, optional hosted identity checks, and release-manifest contract detail.
- [x] 2026-04-24 EDT: Reconfirmed local tag, version, changelog, workflow, and release script facts.
- [x] 2026-04-24 EDT: Reconfirmed live GitHub tag, release, branch-protection, and ruleset facts with read-only commands.
- [x] 2026-04-24 EDT: Decided and documented the release tag, version source, branch model, deploy-versus-attest model, and hosted evidence contract.
- [x] 2026-04-24 EDT: Updated narrow release documentation and this ExecPlan with the finalized contract and evidence.
- [x] 2026-04-24 EDT: Ran plan lint, markdown lint, Program lint, and scoped diff checks.

## Surprises & Discoveries

During plan authoring, the current repo state showed existing Git tags `v0.2.0` and `v0.1.0`. Root `package.json`, `apps/web/package.json`, `packages/ship-by-sunday-cli/package.json`, `packages/blueprint-compiler/package.json`, and `packages/blueprint-presentation/package.json` all still report version `0.1.0`, so the existing package versions are not trustworthy as release identity without a deliberate contract change.

During plan authoring, `docs/release-workflow.md` already says releases are tagged after the merged `main` commit and backed by `CHANGELOG.md`, while Vercel and Convex production currently track `main`. That makes an attest-the-verified-main-SHA contract the least disruptive first tag model unless live platform checks prove direct tag deployment is already available and safer.

During plan authoring, the completed first child plan recorded that both `dev` and `main` still require `static`, `integration`, `browser-smoke`, and `cli`, visible repo rulesets and branch-rule endpoints returned empty arrays, and no protected release tag ruleset was visible. This plan must define the desired tag protection contract, not assume one exists.

During pre-implementation grill on 2026-04-24, `gh release list --repo ParkerRex/ship-by-sunday --limit 20` returned real releases for `v0.2.0` and `v0.1.0`. `gh release view v0.2.0` reported target commit `2de857d503bee13d763d3c7ed31d90e985ab3b00`, and `gh release view v0.1.0` reported target commit `7c5c179b5ba71346901605b40b6c46e8a7334a42`. Current `origin/main` was `3c5347c06c039859b7780a61e331cebda9421aea`, so historical release tags should not be compared to the current branch tip as a failure. The future contract must bind each tag to the Vercel, Convex, billing, auth, entitlement, and GitHub evidence captured for that tag's target SHA at release time.

During pre-implementation grill on 2026-04-24, the existing Vercel helper `qa/scripts/wait-for-vercel-production-deployment.mjs` was confirmed to support a read-only production deployment lookup when `--assign_alias_if_missing` is omitted. The child execution plan should use that helper as the concrete Vercel identity seam if credentials are available, and record an auth limitation if they are not.

During execution on 2026-04-24, `git tag --list 'v*' --sort=-creatordate` returned `v0.2.0` and `v0.1.0`. `git rev-list -n 1 v0.2.0` returned `2de857d503bee13d763d3c7ed31d90e985ab3b00`; `git rev-list -n 1 v0.1.0` returned `7c5c179b5ba71346901605b40b6c46e8a7334a42`; `git rev-parse origin/main` returned `3c5347c06c039859b7780a61e331cebda9421aea`; `git rev-parse origin/dev` returned `36c8360da5d94d9be2ac4485d935389fa5b4fe52`.

During execution on 2026-04-24, `rg -n '"version"' package.json apps/web/package.json packages/*/package.json` showed `0.1.0` in root, `apps/web`, `packages/blueprint-compiler`, `packages/blueprint-presentation`, and `packages/ship-by-sunday-cli`. This reconfirmed that package versions are not aligned to the latest GitHub Release tag.

During execution on 2026-04-24, GitHub returned real published releases for `v0.2.0` and `v0.1.0`. `v0.2.0` is not a draft or prerelease, was published at `2026-04-19T12:52:26Z`, and targets `2de857d503bee13d763d3c7ed31d90e985ab3b00`. `v0.1.0` is not a draft or prerelease, was published at `2026-04-15T02:15:09Z`, and targets `7c5c179b5ba71346901605b40b6c46e8a7334a42`.

During execution on 2026-04-24, live GitHub policy reads reconfirmed that `gh api repos/ParkerRex/ship-by-sunday/rulesets`, `gh api repos/ParkerRex/ship-by-sunday/rules/branches/main`, and `gh api repos/ParkerRex/ship-by-sunday/rules/branches/dev` returned empty arrays. Branch protection for both `main` and `dev` still requires `static`, `integration`, `browser-smoke`, and `cli`; enforces admins; has pull-request review protection with stale review dismissal; and reports no restrictions.

During execution on 2026-04-24, this shell had no `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, or `VERCEL_TEAM_ID`, so the read-only Vercel production deployment identity helper could not be run locally. `$HOME/.convex/config.json` existed, and `cd apps/web && bunx convex logs --prod --history 20` connected to production deployment `helpful-meadowlark-297` but behaved as a live watch and emitted no historical log lines before it was stopped. The contract therefore defines required future hosted identity fields without claiming fresh local Vercel or Convex deploy identity proof.

## Decision Log

Decision: Make this slice a release-contract definition slice, not a workflow migration.
Rationale: Program dependency order requires tag identity, branch model, deploy-versus-attest, version source, and evidence shape before Plan 4 can safely alter GitHub Actions or branch/tag protection.
Date: 2026-04-24

Decision: Start from an attest-the-verified-main-SHA recommendation unless implementation-time evidence proves direct tag deployment is safer.
Rationale: SBS production web and Convex deploys currently track `main`, and the existing production proof waits for deployments from the merged `main` SHA. Direct tag deployment may require Vercel or Convex platform changes that are larger than this definition slice.
Date: 2026-04-24

Decision: Treat current package versions as evidence that a dedicated release version source must be chosen.
Rationale: Existing `0.1.0` package versions conflict with the existing `v0.2.0` tag, so future tag validation cannot safely depend on package versions by default.
Date: 2026-04-24

Decision: Future release attestation must compare a tag to evidence for the tag target SHA, not to whatever `origin/main` points at later.
Rationale: Existing release tags point at historical commits while `origin/main` has moved. That is normal after later production work; the release contract needs publish-time evidence that the tag target was the deployed and proven SHA.
Date: 2026-04-24

Decision: Use `vMAJOR.MINOR.PATCH` as the stable production tag pattern and reserve semver prerelease suffixes for future prerelease channels.
Rationale: The repo already has `v0.1.0` and `v0.2.0` GitHub Releases, and Codex-shaped release policy benefits from one protected release tag family instead of branch- or workflow-specific tag variants.
Date: 2026-04-24

Decision: Keep `dev -> main` as the hosted-product branch model for now and make tags attest the verified `main` production SHA.
Rationale: The current Vercel production branch and Convex production deploy workflow both track `main`. Changing platform deployment identity to direct tag deploys is larger than this contract slice and needs a later workflow/platform plan.
Date: 2026-04-24

Decision: Define a future root `release.json` manifest as the release version source of truth, without creating it in this slice.
Rationale: Package versions are stale relative to the latest tag. A small dedicated manifest can tie together `version`, `channel`, `gitTag`, `changelogHeading`, and release evidence schema without forcing app or workspace package versions to become product release identity.
Date: 2026-04-24

Decision: Require a future protected `refs/tags/v*` policy before tag-driven release identity is trusted.
Rationale: Live repo ruleset and branch-rule endpoints returned no visible policy. A valid tag contract needs restricted tag creation, update, and deletion, plus validation that the tag matches the manifest and evidence before publication.
Date: 2026-04-24

Decision: Define `release-evidence.v1` as the future machine-readable evidence shape.
Rationale: A hosted product release must bind GitHub, Vercel, Convex, billing, auth, entitlement, and GitHub Release notes to one SHA. A named schema gives the workflow implementation slice a concrete artifact target.
Date: 2026-04-24

## Outcomes & Retrospective

This plan defined the release identity contract without changing workflows, branch protection, tag rulesets, package scripts, package versions, QA control-plane files, CLI files, or tests.

The documented contract is:

- stable production tags use `vMAJOR.MINOR.PATCH`
- prerelease tags are reserved for future explicit prerelease channels using semver prerelease suffixes such as `v0.3.0-rc.1`
- current behavior remains the branch-driven `dev -> main` path until a later workflow slice implements tag validation and evidence publication
- release tags attest a verified `main` production SHA instead of directly deploying from tags for now
- a valid release tag must target the merged `main` commit that Vercel production, Convex production, production release proof, GitHub Release notes, and the changelog entry prove at publication time
- current package versions are not trustworthy release identity
- a future root `release.json` manifest should own `version`, `channel`, `gitTag`, `changelogHeading`, `releaseEvidenceSchemaVersion`, and optional `notes`
- a future protected `refs/tags/v*` policy should restrict tag create, update, and delete operations and validate the tag against the manifest and evidence before publication
- the future `release-evidence.v1` artifact must bind `version`, `gitTag`, `tagTargetSha`, `mainSha`, `branchModel`, `releaseChannel`, `changelogHeading`, `githubReleaseUrl`, workflow runs, Vercel deployment identity, Convex deploy identity, billing proof, auth proof, entitlement proof, and `generatedAt`

The remaining assumption is platform-side: this local shell could not query Vercel production deployment identity because the Vercel env vars were missing. Convex CLI auth existed, but `convex logs --prod --history 20` behaved as a watch and emitted no historical lines before being stopped. The next workflow implementation plan must prove hosted identity from CI credentials rather than relying on this local shell.

## Context and Orientation

The Program is copying Codex's operating shape, not Codex's Rust release implementation. Codex releases from protected semver-like tags, validates the tag against one version source, gathers artifacts before publication, and treats stable and prerelease channels explicitly. SBS is a hosted product: release correctness is not a binary asset alone. It requires GitHub, Vercel production, Convex production, Stripe billing, Clerk auth, entitlement behavior, and GitHub Release notes to agree on the same SHA.

The current SBS release model is branch-driven. Feature branches merge into `dev`; `dev` is the integrated staging branch; `main` is production; Vercel production tracks `main`; `.github/workflows/convex-production-deploy.yml` deploys Convex production from `main`; `docs/release-workflow.md` says to tag the merged `main` commit and publish a changelog-backed GitHub Release after promotion. `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/convex-production-deploy.yml` are branch-push workflows today.

The first child plan documented current required checks. Both `dev` and `main` require `static`, `integration`, `browser-smoke`, and `cli`. The `cli` context comes from `.github/workflows/ci.yml` and `bun run sbs:check`, so later helper CLI retirement cannot happen until a later plan replaces that required context and updates branch protection.

`CHANGELOG.md` contains dated release notes. Existing tags include `v0.1.0` and `v0.2.0`. The package versions in root, app, and package workspaces currently repeat `0.1.0`, so this plan must not pretend they already form release-grade version truth.

### In Scope

In scope is read-only verification of current tags, GitHub Releases, local package versions, changelog headings, branch protection, visible tag rulesets, workflow triggers, release triage and release-intake commands, Vercel/Convex production identity assumptions, and existing docs. In scope is choosing and documenting a proposed release contract in `docs/release-workflow.md`, `qa/README.md` only if its release operator expectations need a narrow correction, and this ExecPlan. The contract must name the tag pattern, version source of truth, stable/prerelease policy, branch model recommendation, deploy-versus-attest model, protected tag policy, GitHub Release rules, machine-readable evidence fields, and hosted proof requirements.

### Out Of Scope

Out of scope is editing `.github/workflows/*`, changing branch protection, creating or changing GitHub tag rulesets, moving release helpers out of `qa/scripts`, changing `package.json` scripts or versions, adding a release manifest file unless the plan is first updated and grilled to allow it, deleting QA files, deleting the helper CLI, removing the `cli` context, replacing browser/e2e proof, adding CODEOWNERS, adding `.github/codex` automation, rotating credentials, or doing broad docs cleanup. If a read-only platform check shows direct tag deployment requires a Vercel or Convex platform migration, record that as a blocker or later split instead of implementing it here.

## Plan of Work

Start by refreshing the local facts that define release identity today. Read `docs/release-workflow.md`, `qa/README.md`, `CHANGELOG.md`, root `package.json`, `apps/web/package.json`, package-level `package.json` files, the current workflow files under `.github/workflows/`, and release-related scripts under `qa/scripts`. List existing Git tags and, if GitHub CLI access works, list GitHub Releases. Confirm whether the existing tags match the changelog and whether any package version is already aligned with the latest tag.

Next perform read-only live policy checks. Query GitHub repository settings, branch protection for `dev` and `main`, visible rulesets, branch rules, tag refs, and release records. Do not change any settings. If GitHub returns no visible rulesets, document that as "no visible repo rulesets returned with current permissions" rather than as proof that no organization-level rules exist.

Then define the contract. The expected first-pass recommendation is to keep `dev -> main` as the hosted-product staging and production branch model for now, define `v<major>.<minor>.<patch>` as the stable release tag pattern with optional semver prerelease suffixes reserved for future prerelease releases, use a dedicated release manifest as the future version source rather than current package versions, and use tags to attest a verified `main` SHA until a later platform plan proves direct tag deployment is safer. If this recommendation holds, name the future manifest path and schema in prose without creating the manifest in this slice. The recommended manifest path is `release.json`, with fields for `version`, `channel`, `gitTag`, `changelogHeading`, `releaseEvidenceSchemaVersion`, and optional `notes`. If implementation-time evidence contradicts any of these defaults, update this plan's `Surprises & Discoveries` and decide explicitly in the `Decision Log`.

Update `docs/release-workflow.md` narrowly. It should gain a clear "tag release identity" or equivalent section that explains the chosen tag pattern, version source, branch model, deploy-versus-attest policy, required hosted evidence, GitHub Release rules, and what future workflows must prove before publishing. Preserve the existing current proof-path documentation from the first child plan. Do not rewrite the runbook as if tag workflows already exist.

Update `qa/README.md` only if needed to keep QA operator expectations truthful. If the release workflow doc is sufficient and QA already points at current branch-driven proof, leave QA unchanged and record that choice here.

Finally update this ExecPlan's `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`, and `Artifacts and Notes` with the exact facts and decisions. If live GitHub or platform queries fail because of authentication or missing tools, record the exact limitation and avoid claiming verified live policy. For hosted identity, prefer existing repo helpers over inventing a new probe: use `qa/scripts/wait-for-vercel-production-deployment.mjs` for Vercel deployment identity when `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, and `VERCEL_TEAM_ID` are available, and use the existing Convex production deploy workflow and `bunx convex logs --prod --history 20` only as read-only orientation when Convex auth is available. Missing hosted credentials should become an explicit limitation, not a blocker to documenting the contract.

## Milestones

Milestone 1 verifies the current release identity facts. At the end of this milestone, the plan records existing tags, GitHub Releases if accessible, package versions, changelog headings, current release workflow shape, and live GitHub policy outputs. Success means the implementer can explain why current package versions are or are not suitable as version truth and whether a protected tag policy already exists.

Milestone 2 defines the release contract. At the end of this milestone, the repo has a documented decision for the tag pattern, version source, stable/prerelease policy, branch model, deploy-versus-attest model, hosted evidence fields, and publication requirements. Success means Plan 4 can consume this contract without asking what a release tag means.

Milestone 3 validates the planning slice. At the end of this milestone, the child plan, Program packet, and touched docs pass their linters, and scoped `git diff --check` reports no whitespace errors. Success means no workflows, package scripts, GitHub settings, QA control-plane files, CLI files, or tests changed.

## Concrete Steps

1. Confirm the starting state and preserve unrelated work:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short

   Expect unrelated dirty work in the checkout. Do not revert it.

2. Inspect local release identity and version files:

       git tag --list 'v*' --sort=-creatordate
       sed -n '1,140p' docs/release-workflow.md
       sed -n '1,100p' qa/README.md
       sed -n '1,120p' CHANGELOG.md
       sed -n '1,90p' package.json
       sed -n '1,90p' apps/web/package.json
       find packages -maxdepth 2 -name package.json -print

   The expected authoring-time facts are tags `v0.2.0` and `v0.1.0`, with root/app/package versions still at `0.1.0`.

   Also resolve tag target commits:

       git rev-list -n 1 v0.2.0
       git rev-list -n 1 v0.1.0
       git rev-parse origin/main

   A historical tag target does not have to equal current `origin/main`; future release evidence must prove the tag target SHA was the hosted production SHA at publish time.

3. Inspect current workflow triggers and release helper seams:

       sed -n '1,180p' .github/workflows/ci.yml
       sed -n '1,220p' .github/workflows/dev-staging-proof.yml
       sed -n '1,240p' .github/workflows/production-release-proof.yml
       sed -n '1,140p' .github/workflows/convex-production-deploy.yml
       sed -n '1,180p' qa/scripts/release-triage.mjs
       sed -n '1,220p' qa/scripts/lib/release-triage-source.mjs
       sed -n '1,180p' qa/scripts/export-release-intake.mjs

4. Capture live GitHub release and policy facts:

       gh repo view ParkerRex/ship-by-sunday --json nameWithOwner,defaultBranchRef,mergeCommitAllowed,rebaseMergeAllowed,squashMergeAllowed,deleteBranchOnMerge,viewerPermission
       gh release list --repo ParkerRex/ship-by-sunday --limit 20
       gh release view v0.2.0 --repo ParkerRex/ship-by-sunday --json tagName,targetCommitish,isDraft,isPrerelease,publishedAt,name,url
       gh release view v0.1.0 --repo ParkerRex/ship-by-sunday --json tagName,targetCommitish,isDraft,isPrerelease,publishedAt,name,url
       gh api repos/ParkerRex/ship-by-sunday/git/matching-refs/tags/v
       gh api repos/ParkerRex/ship-by-sunday/rulesets
       gh api repos/ParkerRex/ship-by-sunday/rules/branches/main
       gh api repos/ParkerRex/ship-by-sunday/rules/branches/dev
       gh api repos/ParkerRex/ship-by-sunday/branches/main/protection --jq '{required_status_checks:.required_status_checks.contexts,enforce_admins:.enforce_admins.enabled,required_pull_request_reviews:.required_pull_request_reviews,restrictions:.restrictions}'
       gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection --jq '{required_status_checks:.required_status_checks.contexts,enforce_admins:.enforce_admins.enabled,required_pull_request_reviews:.required_pull_request_reviews,restrictions:.restrictions}'

   If any command fails, record the exact failure. Do not substitute old chat evidence for implementation-time truth.

   If hosted platform credentials are available, capture read-only platform identity orientation:

       VERCEL_TOKEN=<token> VERCEL_PROJECT_ID=<project_id> VERCEL_TEAM_ID=<team_id> node qa/scripts/wait-for-vercel-production-deployment.mjs --commit_sha="$(git rev-parse origin/main)" --timeout_ms=60000 --interval_ms=10000
       cd apps/web && bunx convex logs --prod --history 20

   Do not set `--assign_alias_if_missing` on the Vercel command. If credentials are unavailable, record that hosted identity could not be queried during this slice and define the required future evidence fields anyway.

5. Decide the release identity contract and record each decision in this plan's `Decision Log`. The decision set must include:

       release tag pattern
       stable versus prerelease policy
       version source of truth
       future release manifest path and fields, if a manifest is chosen
       branch model recommendation
       deploy-versus-attest model
       protected tag or ruleset requirements
       GitHub Release publication requirements
       hosted Vercel proof requirements
       hosted Convex proof requirements
       billing, auth, and entitlement proof requirements
       machine-readable evidence artifact fields

6. Update the narrow docs surfaces:

       docs/release-workflow.md
       qa/README.md, only if needed
       docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md

   In `docs/release-workflow.md`, add or update a section that clearly marks the tag contract as the intended next release identity, not already-implemented workflow behavior. Preserve the current proof-path section and existing release-intake export notes.

7. Run validation:

       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md
       bun run programs:lint
       git diff --check -- docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md

## Validation and Acceptance

This slice is complete when the release identity and hosted evidence contract is documented with implementation-time evidence and no release workflow behavior has changed. A fresh agent should be able to open `docs/release-workflow.md` and this ExecPlan and know exactly what future tag workflow implementation must validate, what it must publish, and which current branch-driven assumptions remain in force until changed by a later plan.

Acceptance requires the documentation to distinguish current behavior from the intended tag contract. It must not claim that tag-driven workflows, protected tag rulesets, direct tag deployment, or release evidence artifacts already exist unless implementation-time commands prove them. It must explicitly state how the chosen model prevents a tag from drifting away from the Vercel and Convex production SHA.

If live GitHub metadata, GitHub Releases, or platform identity cannot be queried, the slice is not complete unless the limitation is recorded and the docs avoid claiming verified live truth.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       git tag --list 'v*' --sort=-creatordate
       gh release list --repo ParkerRex/ship-by-sunday --limit 20
       gh release view v0.2.0 --repo ParkerRex/ship-by-sunday --json tagName,targetCommitish,isDraft,isPrerelease,publishedAt,name,url
       gh api repos/ParkerRex/ship-by-sunday/git/matching-refs/tags/v
       gh api repos/ParkerRex/ship-by-sunday/rulesets
       gh api repos/ParkerRex/ship-by-sunday/branches/main/protection --jq '{required_status_checks:.required_status_checks.contexts,enforce_admins:.enforce_admins.enabled,required_pull_request_reviews:.required_pull_request_reviews,restrictions:.restrictions}'
       gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection --jq '{required_status_checks:.required_status_checks.contexts,enforce_admins:.enforce_admins.enabled,required_pull_request_reviews:.required_pull_request_reviews,restrictions:.restrictions}'
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md
       bun run programs:lint
       git diff --check -- docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md

There are no product unit tests for this slice because it should not change product code. If implementation changes any script, workflow, GitHub setting, or package behavior, stop and update this plan before continuing.

## Idempotence and Recovery

All verification commands are read-only except docs edits. It is safe to rerun local inspections and GitHub metadata queries. If a GitHub command fails because of authentication, rate limits, or missing permissions, record the failure and rerun after fixing access. If docs edits drift into workflow implementation or broad docs cleanup, narrow the diff before validation.

If a later implementer accidentally edits workflows, package scripts, versions, GitHub settings, QA control-plane files, CLI files, or tests while executing this plan, stop and revert only those changes if they were made by that implementer in the same slice. Do not revert unrelated dirty work that already existed in the checkout.

## Artifacts and Notes

Program source:

       docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-2.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/converged-decision-packet.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/dependency-graph.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/plan-split-recommendation.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/cross-repo-review.md

Completed prerequisite child plan:

       docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md

Authoring-time evidence from 2026-04-24:

       git tags: v0.2.0, v0.1.0
       root package version: 0.1.0
       apps/web package version: 0.1.0
       packages/ship-by-sunday-cli package version: 0.1.0
       packages/blueprint-compiler package version: 0.1.0
       packages/blueprint-presentation package version: 0.1.0
       current production branch model: feature branches -> dev -> main; Vercel and Convex production track main
       current required branch contexts from first child: static, integration, browser-smoke, cli on both dev and main
       current visible rulesets from first child: empty arrays returned by repo ruleset and branch-rule endpoints

Execution-time validation from 2026-04-24:

       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md
       bun run programs:lint
       git diff --check -- docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/programs/active/index.md

These snapshots are orientation only. Implementation must rerun the commands and record fresh evidence.

## Interfaces and Dependencies

This plan depends on local repository files `docs/release-workflow.md`, `qa/README.md`, `CHANGELOG.md`, root `package.json`, `apps/web/package.json`, `packages/*/package.json`, workflows under `.github/workflows/`, and release helpers under `qa/scripts`. It also depends on GitHub CLI read access for `ParkerRex/ship-by-sunday` to inspect tags, releases, branch protection, and visible rulesets.

The contract this plan defines must be consumed by the later `Implement Codex-Shaped CI And Tag Release Workflows` child plan. It must also give the `Relocate Release-Critical Helpers Out Of QA` child plan enough shape to preserve release triage, release-intake, Vercel deployment lookup, Convex production proof, billing proof, and engineering-intake behavior while those helpers are moved. The plan must preserve the existing release and QA command interfaces while defining the future release identity.
