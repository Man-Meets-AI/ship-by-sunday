---
program_id: 'sbs-codex-release-reset'
title: 'Ship By Sunday Codex Release Reset'
status: 'complete'
created_at: 2026-04-24
completed_at: 2026-04-24
summary: 'Replace the current Ship by Sunday QA and release control plane with a Codex-shaped CI, release, branch, and test model.'
post_build_recap: 'Completed the nine-slice Codex release reset: reconciled required checks, defined tag release identity, moved release helpers, added tag release evidence, retired the helper CLI, retired browser-smoke proof, retired the active QA control plane, aligned GitHub policy, and cleaned final active docs.'
read_when:
  - 'Preserving research for the Codex-style Ship by Sunday release reset.'
  - 'Normalizing the QA, CLI, CI, release, branch, and test migration tracks.'
  - 'Writing child ExecPlans from the completed Program packet.'
---

# Ship By Sunday Codex Release Reset

This is a living initiative document. It keeps the durable initiative-level truth for replacing the current Ship by Sunday QA and release control plane with a Codex-shaped release, CI, branch, and test model.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

This initiative exists because Ship by Sunday's current QA control plane, helper CLI, release proof workflows, branch promotion model, and test harnesses are not producing the speed or reliability the project needs. The working hypothesis from the initial research is that the repo should move closer to Codex's simpler operating model: GitHub-native CI, protected branch and tag policy, tag-driven release identity, source-level tests, explicit release artifacts, and narrowly scoped automation.

The intended end state is not a literal port of Codex's Rust, Bazel, npm, or binary packaging stack. Ship by Sunday is a hosted Vercel, Convex, Stripe, and Clerk product, so the final model must preserve hosted deployment, billing, entitlement, and environment proof while removing bespoke QA and CLI machinery that has become drag.

## Program Inputs

The Program packet lives under `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`.

The durable research inputs are:

- `research-pass-codex-ci.md`
- `research-pass-codex-release-cd.md`
- `research-pass-codex-pr-branch-policy.md`
- `research-pass-codex-test-strategy.md`
- `research-pass-sbs-qa-control-plane.md`
- `research-pass-sbs-test-migration.md`
- `research-pass-sbs-cli-deletion.md`
- `research-pass-sbs-workflow-tag-migration.md`
- `research-pass-docs-github-automation.md`
- `research-pass-program-taxonomy.md`

This Program has durable research pass files, but the full packet is not complete yet. The next step is to normalize each research pass into one decision memo without cross-track synthesis.

The normalized inputs are:

- `normalized-pass-codex-ci.md`
- `normalized-pass-codex-release-cd.md`
- `normalized-pass-codex-pr-branch-policy.md`
- `normalized-pass-codex-test-strategy.md`
- `normalized-pass-sbs-qa-control-plane.md`
- `normalized-pass-sbs-test-migration.md`
- `normalized-pass-sbs-cli-deletion.md`
- `normalized-pass-sbs-workflow-tag-migration.md`
- `normalized-pass-docs-github-automation.md`
- `normalized-pass-program-taxonomy.md`

This Program has normalized pass files, but the full packet is not complete yet. The next step is to write `converged-decision-packet.md`.

The convergence artifact is:

- `converged-decision-packet.md`

This Program has a converged decision packet, but the full packet is not complete yet. The next step is to write `dependency-graph.md`.

The dependency artifact is:

- `dependency-graph.md`

This Program has a dependency graph, but the full packet is not complete yet. The next step is to write `plan-split-recommendation.md`.

The plan split artifact is:

- `plan-split-recommendation.md`

This Program has a plan split recommendation, but the full packet is not complete yet. The next step is to write `cross-repo-review.md`.

The review artifact is:

- `cross-repo-review.md`

This Program has a cross-repo review, but the full packet is not complete yet. The next step is to write `planning-brief-1.md` and `current-planning-brief.txt`.

The current planning brief is:

- `planning-brief-1.md`
- `planning-brief-2.md`
- `planning-brief-3.md`
- `planning-brief-4.md`
- `planning-brief-5.md`
- `planning-brief-6.md`
- `planning-brief-7.md`
- `planning-brief-8.md`
- `planning-brief-9.md`
- `current-planning-brief.txt`

The Program packet advanced through `planning-brief-9.md` and all recommended child slices are complete.

## Current State

The Program packet is complete. Source research has been preserved, normalized, converged, dependency-ordered, split into recommended child plans, pressure-tested by cross-repo review, captured in nine planning briefs, executed through all nine child ExecPlans, and moved to the completed Program lane.

The first child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md`.

The second child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md`.

The third child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md`.

The fourth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md`.

The fifth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md`.

The sixth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md`.

The seventh child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-retire-disposable-qa-control-plane.md`.

The eighth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md`.

The ninth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md`.

The first child ExecPlan verified and documented the current proof surface. The release workflow and QA readme now distinguish required branch-protection contexts from branch-push and post-deploy proof, identify `Deployment Smoke` as an orphaned remote workflow surface, and identify `Sandbox E2E Nightly` as a failing non-release-critical repair candidate.

The second child settled the release tag pattern, future `release.json` version source, stable/prerelease policy, branch model recommendation, deploy-versus-attest model, protected tag/ruleset requirements, GitHub Release publication requirements, release evidence artifact fields, and hosted proof requirements. It did not implement workflow, branch-protection, tag-ruleset, QA, CLI, test, CODEOWNERS, or GitHub automation changes.

The final planning brief pointer names `docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-9.md`.

The fifth child retired the helper CLI surface from checked-in code and docs: `packages/ship-by-sunday-cli/`, `bin/sbs`, root `sbs` and `sbs:check`, the `cli` CI job, active helper CLI docs, public docs navigation, and checked-in release-doc required-context references are gone. The child preserved the web app, `packages/blueprint-compiler`, `release.json`, `scripts/release/`, the `Tag Release` workflow, QA transitional proof, browser proof, and snapshot fallback. Live branch protection was inspected read-only and still reported the stale helper context on `dev` and `main`; post-merge operator commands are recorded in `docs/release-workflow.md`.

The sixth child replaced the shallow browser-smoke proof lane with source-level proof and removed `browser-smoke` from checked-in package scripts, Playwright config, and CI.

The seventh child retired the active `qa/` control plane by moving hosted proof behind release-owned commands, removing root `qa:*` scripts and `qa_control_plane` CI, deleting QA CSV inventories and scaffolding, archiving historical proof reports under `docs/archive/release-proof-runs/`, moving engineering-intake fixtures to `scripts/release/fixtures/engineering-intake/`, and changing generated starter output from `qa/` to lightweight `docs/testing/` notes.

The eighth child aligned GitHub-facing policy with the new release model. PR and issue templates now ask for target branch, proof, affected area, and release sensitivity; the issue-label workflow manages a small stable label set; and `.github/codex/release-policy.md` gives agents concise GitHub-facing release boundaries.

The ninth child cleaned the final active docs and closed the Program. Active docs no longer point current readers at retired QA, helper CLI, browser-smoke, run-pack, or inventory surfaces, while historical archives remain intact.

The initial research has already been gathered in the working session. It found that Codex uses tag-driven release identity, protected branch and tag rules, GitHub-native checks, source-level unit and integration tests, mocked or local-process integration coverage, and optional live/runtime proof. It also found that Ship by Sunday currently has deep coupling between `qa/`, release/intake scripts, GitHub workflows, package scripts, public docs, and a helper CLI that is only release-critical because the repo made it part of root checks and CI.

## Progress

- [x] 2026-04-24 EDT: Initialized this Program root and skeletal `program.md`.
- [x] 2026-04-24 EDT: Preserved the completed source research as durable research pass files.
- [x] 2026-04-24 EDT: Normalized each research pass into one decision memo without cross-track merging.
- [x] 2026-04-24 EDT: Wrote `converged-decision-packet.md`.
- [x] 2026-04-24 EDT: Wrote `dependency-graph.md`.
- [x] 2026-04-24 EDT: Wrote `plan-split-recommendation.md`.
- [x] 2026-04-24 EDT: Wrote `cross-repo-review.md`.
- [x] 2026-04-24 EDT: Wrote `planning-brief-1.md`.
- [x] 2026-04-24 EDT: Wrote `current-planning-brief.txt`.
- [x] 2026-04-24 EDT: Refreshed `program.md` from the completed packet.
- [x] 2026-04-24 EDT: Wrote the first child ExecPlan, `docs/exec-plans/active/2026-04-24-reconcile-release-proof-and-required-checks.md`.
- [x] 2026-04-24 EDT: Grilled the first child ExecPlan and tightened it before implementation.
- [x] 2026-04-24 EDT: Executed and completed the first child ExecPlan, now stored at `docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md`.
- [x] 2026-04-24 EDT: Wrote `planning-brief-2.md`, marked `planning-brief-1.md` superseded, and advanced `current-planning-brief.txt`.
- [x] 2026-04-24 EDT: Wrote the second child ExecPlan, `docs/exec-plans/active/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md`.
- [x] 2026-04-24 EDT: Grilled the second child ExecPlan and tightened it before implementation.
- [x] 2026-04-24 EDT: Executed and completed the second child ExecPlan, now stored at `docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md`.
- [x] 2026-04-24 EDT: Wrote `planning-brief-3.md`, marked `planning-brief-2.md` superseded, and advanced `current-planning-brief.txt`.
- [x] 2026-04-24 EDT: Validated the third planning refresh with Program lint, markdown lint, and scoped diff check.
- [x] 2026-04-24 EDT: Wrote the third child ExecPlan, `docs/exec-plans/active/2026-04-24-relocate-release-critical-helpers-out-of-qa.md`.
- [x] 2026-04-24 EDT: Validated the third child ExecPlan with plan lint, markdown lint, Program lint, and scoped diff check.
- [x] 2026-04-24 EDT: Grilled the third child ExecPlan and tightened it before implementation.
- [x] 2026-04-24 EDT: Executed and completed the third child ExecPlan, now stored at `docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md`.
- [x] 2026-04-24 EDT: Wrote `planning-brief-4.md`, marked `planning-brief-3.md` superseded, and advanced `current-planning-brief.txt`.
- [x] 2026-04-24 EDT: Wrote the fourth child ExecPlan, `docs/exec-plans/active/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md`.
- [x] 2026-04-24 EDT: Grilled the fourth child ExecPlan and tightened the initial manifest decision, dry-run versus publish evidence rules, manual release workflow inputs, billing job visibility, and Convex skip handling.
- [x] 2026-04-24 EDT: Executed and completed the fourth child ExecPlan, now stored at `docs/exec-plans/completed/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md`.
- [x] 2026-04-24 EDT: Wrote `planning-brief-5.md`, marked `planning-brief-4.md` superseded, and advanced `current-planning-brief.txt`.
- [x] 2026-04-24 EDT: Wrote the fifth child ExecPlan, `docs/exec-plans/active/2026-04-24-retire-the-helper-cli.md`.
- [x] 2026-04-24 EDT: Grilled, executed, and completed the fifth child ExecPlan, now stored at `docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md`.
- [x] 2026-04-24 EDT: Wrote `planning-brief-6.md`, marked `planning-brief-5.md` superseded, and advanced `current-planning-brief.txt`.
- [x] 2026-04-24 EDT: Wrote the sixth child ExecPlan, `docs/exec-plans/active/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md`.
- [x] 2026-04-24 EDT: Executed and completed the sixth child ExecPlan, now stored at `docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md`.
- [x] 2026-04-24 EDT: Wrote `planning-brief-7.md`, marked `planning-brief-6.md` superseded, and advanced `current-planning-brief.txt`.
- [x] 2026-04-24 EDT: Wrote and grilled the seventh child ExecPlan, `docs/exec-plans/active/2026-04-24-retire-disposable-qa-control-plane.md`.
- [x] 2026-04-24 EDT: Executed and completed the seventh child ExecPlan, now stored at `docs/exec-plans/completed/2026-04-24-retire-disposable-qa-control-plane.md`.
- [x] 2026-04-24 EDT: Wrote `planning-brief-8.md`, marked `planning-brief-7.md` superseded, and advanced `current-planning-brief.txt`.
- [x] 2026-04-24 EDT: Wrote, executed, and completed the eighth child ExecPlan, now stored at `docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md`.
- [x] 2026-04-24 EDT: Wrote `planning-brief-9.md`, marked `planning-brief-8.md` superseded, and advanced `current-planning-brief.txt`.
- [x] 2026-04-24 EDT: Wrote, executed, and completed the ninth child ExecPlan, now stored at `docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md`.
- [x] 2026-04-24 EDT: Completed the Program and moved it to the completed Program lane.

## Decision Log

Decision: Create a dedicated Program instead of folding this work into the existing codebase recovery Program.
Rationale: The Codex-style release reset spans QA control-plane deletion, CLI deletion, CI replacement, tag-driven release policy, branch policy, tests, docs, and GitHub automation. That is larger than one ExecPlan and materially broader than the existing recovery Program's runtime and product cleanup sequence.
Date: 2026-04-24

Decision: Initialize before creating research pass files.
Rationale: `docs/prompts/program-initialize.md` requires the first step to create only the Program root and honest skeletal `program.md`, without placeholder packet artifacts that would mislead `programs:lint`.
Date: 2026-04-24

Decision: Treat Codex as a model for operating principles, not a literal implementation template.
Rationale: Codex releases CLI artifacts from tags. Ship by Sunday releases a hosted app with Vercel, Convex, billing, entitlement, and environment proof. The future packet must preserve those product-specific constraints while removing unnecessary bespoke QA and CLI surfaces.
Date: 2026-04-24

Decision: Preserve research as ten source passes instead of collapsing immediately into seven normalized tracks.
Rationale: The completed research arrived from separate source lanes, including Codex CI, Codex release/CD, Codex policy, Codex tests, SBS QA, SBS tests, SBS CLI, SBS workflow/tag migration, docs/GitHub automation, and Program taxonomy. Keeping those source records separate preserves evidence and lets the next Program step normalize deliberately.
Date: 2026-04-24

Decision: Keep normalized memo filenames aligned to source-pass slugs.
Rationale: The source research was not collected as numbered tracks, so `normalized-pass-<slug>.md` preserves source traceability while satisfying the Program packet naming accepted by `programs:lint`.
Date: 2026-04-24

Decision: Converge on Codex operating shape with SBS hosted-product constraints.
Rationale: The normalized tracks agree on protected tags, truthful GitHub checks, source-level tests, smaller release-scoped hosted proof, CLI retirement, and QA control-plane decomposition. They also agree that Codex's Rust/Bazel/npm implementation details do not transfer literally to a Vercel, Convex, Stripe, Clerk, Bun, Next.js, and Playwright product.
Date: 2026-04-24

Decision: Make proof-surface inventory and release identity prerequisites for destructive cleanup.
Rationale: The dependency graph shows that CLI deletion, QA deletion, browser harness deletion, and docs cleanup are unsafe until required checks, tag/version policy, hosted proof, and release-critical helper relocation are settled.
Date: 2026-04-24

Decision: Split the reset into nine child ExecPlan recommendations.
Rationale: The plan split keeps proof-surface reconciliation, release identity, release-helper relocation, workflow replacement, CLI retirement, browser-proof migration, QA retirement, GitHub automation, and final docs cleanup reviewable and validateable without hiding hard dependencies.
Date: 2026-04-24

Decision: Keep the nine-plan split after cross-repo review, with decision gates called out.
Rationale: The review found the split and first plan hold up, but Plan 2 must settle branch model, deploy-versus-attest, and version source before Plan 4. It also added security and per-plan docs watchpoints.
Date: 2026-04-24

Decision: Make proof-surface reconciliation the first child ExecPlan.
Rationale: The first planning brief confirms that local workflows, remote Actions state, required contexts, branch/tag rules, package scripts, and release docs must be reconciled before any destructive CLI, QA, browser harness, or workflow replacement slice can proceed safely.
Date: 2026-04-24

Decision: Make release-critical helper relocation the third child ExecPlan.
Rationale: The first two completed children established current proof truth and release identity, but release-critical helpers still live under `qa/scripts`. Workflow replacement and QA retirement should not build on or delete a folder that still owns release triage, release snapshot, Vercel lookup, Convex sync, release scope, billing planning, and engineering-intake exports.
Date: 2026-04-24

Decision: Make Codex-shaped CI and tag release workflows the fourth child ExecPlan.
Rationale: The Program now has proof-surface truth, release identity, and release-owned helper paths. The next reliability bottleneck is that tag validation, release manifest truth, release evidence, and protected-tag workflow behavior are documented but not implemented.
Date: 2026-04-24

Decision: Make helper CLI retirement the fifth child ExecPlan.
Rationale: The Program now has a manifest-backed tag release workflow and release evidence layer, while the helper CLI remains required only because root scripts, CI, docs, and branch protection still name it. Removing that bespoke command surface simplifies the required-check model before browser proof and disposable QA cleanup.
Date: 2026-04-24

Decision: Make browser-harness proof migration the sixth child ExecPlan.
Rationale: The helper CLI is now gone from checked-in code, scripts, docs, and CI. The remaining oversized proof surface is browser and QA-pack proof, which must be mapped to source-level tests, retained hosted proof, or later QA cleanup before any browser harness deletion is safe.
Date: 2026-04-24

Decision: Make disposable QA control-plane retirement the seventh child ExecPlan.
Rationale: Browser-smoke is no longer a checked-in branch-required proof lane, but QA inventories, run packs, personas, reports, docs, root scripts, hosted proof wiring, and the QA-team skill still form a bespoke control plane. That should be retired only after the next plan maps which pieces are disposable and which hosted proof semantics must move to release-owned commands.
Date: 2026-04-24

Decision: Make GitHub policy and Codex automation the eighth child ExecPlan.
Rationale: The release model now has stable code, hosted proof, tag, CLI-retirement, browser-proof, and QA-retirement surfaces. GitHub templates, ownership hints, label guidance, and Codex prompt files can now describe the actual model without depending on transitional QA or CLI surfaces.
Date: 2026-04-24

Decision: Make final docs and archive cleanup the ninth child ExecPlan.
Rationale: The implementation and policy surfaces are now aligned. The remaining risk is active-document discoverability drift, not another implementation migration.
Date: 2026-04-24

## Slice Ledger

Active child ExecPlans:

- none for this Program.

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md`
- `docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md`
- `docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md`
- `docs/exec-plans/completed/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md`
- `docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md`
- `docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md`
- `docs/exec-plans/completed/2026-04-24-retire-disposable-qa-control-plane.md`
- `docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md`
- `docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md`

Future child ExecPlans must carry `program_id: sbs-codex-release-reset` and a `planning_brief` path pointing at an immutable versioned planning brief under this Program folder.

The most recently completed child ExecPlan carries:

    program_id: sbs-codex-release-reset
    planning_brief: docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-9.md

The current planning brief file is:

    docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-9.md

Recommended child ExecPlan sequence:

1. Reconcile Release Proof And Required Checks.
2. Define Tag Release Identity And Hosted Evidence Contract.
3. Relocate Release-Critical Helpers Out Of QA.
4. Implement Codex-Shaped CI And Tag Release Workflows.
5. Retire The Helper CLI.
6. Replace Browser Harness Proof With Source And Release Proof.
7. Retire Disposable QA Control Plane.
8. Add GitHub Policy And Codex Automation.
9. Final Docs And Archive Cleanup.

## Next Slice

No required next slice remains.

The separate release-intake repair plan at `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md` remains separate work and does not block this Program's completed Codex release reset.

## Risks and Watchpoints

Do not implement deletion or workflow changes from this Program before the relevant child ExecPlan exists, has been grilled, and explicitly authorizes that implementation. The first completed child was inventory and reconciliation only. The second completed child was release-contract definition only. The third completed child was release-helper relocation only. The fourth completed child added the manifest-backed tag workflow and release evidence layer only. The fifth completed child retired the helper CLI only. The sixth completed child retired browser-smoke only.

Do not treat `qa/` as one disposable folder. The initial research found disposable QA bookkeeping mixed with release-critical intake, Vercel, Convex, and billing proof helpers.

Do not scatter relocated release helpers across multiple ownership boundaries without an explicit rule. The current recommended default for the next child is a repo-level `scripts/release/` boundary, with exceptions only if code inspection proves a narrower owner is safer.

Do not treat CLI deletion as QA deletion. The helper CLI can likely be removed after root scripts, CI, branch protection, docs, and tests are unwired, but that is a different migration from retiring QA packs and release proof machinery.

Do not delete source-level tests wholesale. The initial research found that most source-level tests should be preserved, while browser harness files, stale legacy tests, generated auth failure artifacts, and CLI tests need separate treatment.

Do not copy Codex's Rust/Bazel/npm release mechanics literally. Copy the invariant shape: protected release tags, version validation, artifacts, idempotent publishing, branch protections, and clearer test strata.

Do not assume live branch protection has already been reconciled just because the checked-in helper CLI job is gone. The fifth child inspected branch protection read-only and found the stale helper context still present on `dev` and `main`; remove that external requirement only after the workflow deletion reaches the protected branches, using the commands in `docs/release-workflow.md`.

Do not let Plan 8 become a hidden CI/CD rewrite. It should support the now-real release model with policy and guidance, not redefine release mechanics.

Do not let Plan 8 mutate live GitHub branch protection or tag rulesets unless the user explicitly asks for remote policy changes. Read-only inspection is acceptable when needed.

Do not let Plan 8 reintroduce retired QA or helper CLI surfaces in templates, labels, CODEOWNERS, or Codex prompts.

Do not let Plan 9 become implementation cleanup. It should update active docs, archive classification, Program closeout text, and indexes only.

Do not rewrite historical evidence just to make search output clean. Old changelog entries, completed ExecPlans, historical proof reports, and `docs/codex` archives can mention retired systems as history.

Do not delete `packages/blueprint-compiler` or product generation paths while retiring the CLI. The CLI is downstream of the compiler. If deletion reveals reusable draft or generation logic that the web app still needs, move only that specific behavior into an existing non-CLI boundary and prove it with focused tests.

## Outcomes & Retrospective

This Program is complete. It replaced the old release reset target model with a Codex-shaped operating model that is native to this hosted product. The final state keeps source-level CI required checks at `static` and `integration`, defines tag release identity through `release.json`, builds release evidence with fail-closed hosted proof expectations, keeps release-critical helpers under `scripts/release/`, removes the helper CLI from checked-in code, removes the shallow browser-smoke lane, retires the active QA control plane, moves hosted proof to release-owned commands, aligns GitHub PR and issue policy, and cleans active docs so current readers do not learn retired surfaces as truth.

The Program deliberately did not mutate live GitHub branch protection or tag rulesets. Operator-facing cleanup commands and tag-protection expectations remain documented in `docs/release-workflow.md`. The separate release-intake repair plan remains active but is outside this Program's scope.

## Validation and Acceptance

Program-level acceptance requires a packet that can drive several bounded child ExecPlans without chat history. The packet must preserve the research evidence, normalize the tracks, converge the direction, order dependencies, split implementation into safe slices, and keep the current `planning-brief-<N>.md` pointer accurate after each child slice.

The initiative itself is complete only when Ship by Sunday has a reliable Codex-shaped release model: GitHub-native CI with truthful required checks, protected tag-driven release identity, hosted Vercel/Convex/billing proof tied to the released SHA, a retired or relocated QA control plane, the helper CLI removed or intentionally re-scoped, preserved source-level product tests, and updated docs and GitHub automation.

This Program packet should pass:

    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs docs/prompts/program-planning-refresh.md

All child ExecPlans for this Program are complete.

## Artifacts and Notes

Program contract source:

    docs/programs/PROGRAMS.md
    docs/programs/README.md
    docs/prompts/README.md
    docs/prompts/program-initialize.md
    docs/prompts/program-research-passes.md
    docs/prompts/program-normalize-pass.md
    docs/prompts/program-converged-decision-packet.md
    docs/prompts/program-dependency-graph.md
    docs/prompts/program-plan-split-recommendation.md
    docs/prompts/program-cross-repo-review.md
    docs/prompts/program-planning-brief.md
    docs/prompts/program-planning-refresh.md

Current planning brief:

    docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-9.md

Active child ExecPlan:

    none

Completed child ExecPlan:

    docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md
    docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md
    docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md
    docs/exec-plans/completed/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md
    docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md
    docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md
    docs/exec-plans/completed/2026-04-24-retire-disposable-qa-control-plane.md
    docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md
    docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md

Final Program validation:

    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-9.md docs/programs/active/index.md docs/programs/completed/index.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md
    git diff --check -- docs/programs docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md

Program root:

    docs/programs/completed/2026-04-24-sbs-codex-release-reset/

## Interfaces and Dependencies

This Program depends on:

- `/Users/parkerrex/Developer/codex` as the sibling Codex reference repository
- `.github/workflows/` for Ship by Sunday CI, release proof, deployment, and cleanup workflows
- GitHub branch protection and tag rulesets for the eventual policy surface
- `package.json`, `apps/web/package.json`, and package-level scripts for command-surface migration
- `packages/ship-by-sunday-cli/` and `bin/sbs` for helper CLI deletion research
- `docs/archive/release-proof-runs/`, `scripts/release/`, and historical research for proof and QA-control-plane retirement context
- `apps/web/tests/` and `packages/*/tests/` for test strategy migration
- `docs/release-workflow.md`, `README.md`, `apps/web/content/docs/`, and `docs/codex/` for docs migration
- `docs/exec-plans/PLANS.md` for future child ExecPlan shape
