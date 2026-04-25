---
title: Ship By Sunday Codex Release Reset Planning Brief 8
program_id: sbs-codex-release-reset
brief_version: 8
status: superseded
summary: Make GitHub policy and Codex automation the next child slice after the disposable QA control plane was retired.
read_when:
  - Writing the eighth child ExecPlan for the Codex release reset Program.
  - Adding GitHub PR, issue, label, ownership, or Codex automation around the new release model.
  - Checking boundaries before changing CI, release workflows, branch protection, tag rules, or final docs archives.
---

# Ship By Sunday Codex Release Reset Planning Brief 8

## Planning Refresh

## What Changed

The seventh child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-retire-disposable-qa-control-plane.md`.

Plan 7 retired the active `qa/` control plane. Root `qa:*` scripts, the `qa_control_plane` CI job, QA CSV inventories, QA validation, QA run-pack orchestration, QA report/review scaffolding, the QA-team skill, repo-local QA agent config, and active `qa/` docs are gone. Hosted release proof semantics survived behind release-owned commands:

- `bun run release:proof -- --proof=default_ship`
- `QA_ALLOW_BILLING_INTEGRATION=1 bun run release:proof -- --proof=billing_integration`
- matching dry-run and persona-prep commands

Historical release proof reports moved to `docs/archive/release-proof-runs/`. Engineering-intake compatibility fixtures moved to `scripts/release/fixtures/engineering-intake/`. Generated customer starter output no longer ships a `qa/` mini-control-plane or `$qa-team` prompts; it now emits lightweight `docs/testing/` notes.

Plan 7 validation passed with replacement proof dry-runs, sandbox-e2e listings, moved fixture tests, generated starter tests, release manifest/evidence checks, workflow YAML parsing, `bun run format`, `bun run lint`, `bun run typecheck`, plan lint, markdown lint, Program lint, and diff hygiene.

## What Still Holds

The nine-plan split still holds. Plans 1 through 7 are complete. Plan 8 is now next because the release model is real enough for GitHub policy and Codex automation to describe it.

Plan 8 should support the new model, not redefine it. CI mechanics, tag release workflows, hosted release proof, helper CLI deletion, browser-smoke retirement, and QA retirement are already implemented by earlier children. Policy automation should make the workflow easier to follow and harder to drift from, not introduce another release lane.

The deferred release-intake repair plan remains separate at `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`. Plan 8 must not absorb runtime-intake grouping, release-intake correctness, or engineering-intake contract repair.

Final public docs and archive cleanup remains Plan 9. Plan 8 may update narrow docs required to explain GitHub policy surfaces, but broad archive classification and final wording cleanup should wait.

## Boundary Changes

Plan 8 should be titled `Add GitHub Policy And Codex Automation`.

The next slice should inventory current GitHub-facing repo policy surfaces before editing: `.github/`, workflow permissions, PR templates, issue templates, labeler or stale/dedupe workflows if present, CODEOWNERS if present, `.github/copilot-instructions.md` or `.github/codex/**` if present, branch/tag rules documentation, and release docs that name required contexts.

The next slice may add or refine lightweight PR and issue templates, label guidance, Codex/GitHub agent prompt files, ownership hints, and local documentation for branch/tag rules. It may add a minimal CODEOWNERS file only if ownership can be kept truthful and low-maintenance.

The next slice should document the expected GitHub branch and tag policy around the new release model: required `static` and `integration` contexts, `dev` and `main` PR requirements, protected `v*` tags, release manifest validation, release evidence artifact expectations, and stale external context cleanup commands already recorded in `docs/release-workflow.md`.

The next slice must not change the implementation of `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, release scripts, release evidence schemas, branch protection through live `gh api` mutation, or tag rulesets in GitHub. It may inspect live GitHub policy read-only if needed and record gaps for an operator.

Plan 8 must not reintroduce QA or helper CLI references as policy targets. If a template asks for proof, it should name source tests, release-owned proof commands, and the current release workflow.

## Dependency Changes

Plan 7 unblocked Plan 8 because GitHub policy no longer has to describe transitional `qa:run-pack`, QA control-plane validation, or helper CLI contexts.

Plan 8 still depends on the completed tag release identity work from Plan 2 and the workflow implementation from Plan 4. The policy docs should align with `release.json`, `release-evidence.v1`, `Tag Release`, `Dev Staging Proof`, `Production Release Proof`, and Convex production deploy.

Plan 9 still depends on Plan 8. Final docs cleanup should happen after GitHub templates, policy docs, and Codex automation surfaces exist or are explicitly rejected.

## Next Plan Recommendation

Exact next plan title: `Add GitHub Policy And Codex Automation`.

Exact scope: add or refine GitHub-native policy and agent-automation surfaces so contributors, maintainers, and Codex/GitHub agents can follow the new release model without rediscovering it. Start with an inventory. Then add minimal templates or guidance that route feature PRs to `dev`, release PRs to `main`, hotfixes from `main`, protected tags through `release.json`, and proof requests through source tests plus release-owned hosted proof. Keep automation descriptive and low-risk.

Exact implementation boundaries: do not alter CI or CD workflow mechanics in this slice. Do not mutate live branch protection or tag rulesets. Do not create broad bot automation that can close, relabel, or merge work without explicit proof. Do not add CODEOWNERS unless ownership is narrow and maintainable. Do not reopen QA or CLI retirement.

Exact validation boundaries: run GitHub-surface grep for stale QA/CLI/browser-smoke policy references; parse any added YAML; run markdown lint for touched templates/docs; run Program lint; run plan lint for the child ExecPlan; run `git diff --check`. If CODEOWNERS is added, add the smallest textual or script proof available that the paths are syntactically valid.

Why it is next now: the operating model now has stable local and hosted proof surfaces. Policy and Codex automation can finally be written against the actual model instead of the transitional helper CLI, browser-smoke, and QA control-plane surfaces.

## Risks To Carry Forward

Live GitHub branch protection may still have stale external contexts until the prior workflow deletions reach protected branches and an operator applies the documented cleanup commands. Plan 8 should document or inspect this, but should not silently mutate remote policy.

Visible repository rulesets were empty in earlier research, but that does not prove organization-level rules are absent. Treat branch protection endpoints and live policy inspection as read-only evidence unless the user explicitly asks for mutation.

Templates can become stale as quickly as docs. Keep PR and issue templates minimal and refer to `docs/release-workflow.md` for detailed commands instead of duplicating long checklists.

Over-automating labels or Codex prompts can create another control plane. Prefer small, transparent guidance surfaces over hidden routing logic.

Plan 9 still owns final docs/archive cleanup. Plan 8 should not spend its scope rewriting historical `docs/codex/`, `todo.md`, or archived proof reports.
