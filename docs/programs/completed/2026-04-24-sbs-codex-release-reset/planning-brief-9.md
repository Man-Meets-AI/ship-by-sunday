---
title: Ship By Sunday Codex Release Reset Planning Brief 9
program_id: sbs-codex-release-reset
brief_version: 9
status: current
summary: Make final docs and archive cleanup the next child slice after GitHub policy and Codex automation were aligned.
read_when:
  - Writing the ninth child ExecPlan for the Codex release reset Program.
  - Cleaning active docs, archive classifications, command docs, and Program closeout wording.
  - Checking boundaries before changing implementation code, CI/CD mechanics, or live GitHub policy.
---

# Ship By Sunday Codex Release Reset Planning Brief 9

## Planning Refresh

## What Changed

The eighth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-add-github-policy-and-codex-automation.md`.

Plan 8 aligned GitHub-facing policy with the new release model. The PR template now asks for target branch type, proof, and release sensitivity. Issue templates capture auth, entitlement, billing, release/deploy, generated starter, and release-sensitivity information. The managed label workflow now covers a small stable set: `auth`, `billing`, `docs`, `infrastructure`, and `release`, in addition to the existing labels. `.github/codex/release-policy.md` gives Codex/GitHub agents a concise branch, proof, review, and release-boundary guide.

Plan 8 did not add CODEOWNERS because no truthful low-maintenance ownership map exists yet. It did not mutate live GitHub settings, branch protection, tag rulesets, or CI/CD workflow mechanics.

## What Still Holds

The nine-plan split still holds. Plans 1 through 8 are complete. Plan 9 is now next and should close the Program by cleaning active docs, archive references, command maps, and final Program state.

Plan 9 should be documentation and archive cleanup only. The implementation work is already done by earlier children: required-check reconciliation, tag release identity, release-helper relocation, tag release workflow, helper CLI retirement, browser-smoke retirement, QA-control-plane retirement, and GitHub policy alignment.

The deferred release-intake repair plan remains separate at `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`. Plan 9 may update references to moved fixtures if active docs still point at old paths, but it must not repair release-intake logic.

## Boundary Changes

Plan 9 should be titled `Final Docs And Archive Cleanup`.

The next slice should audit active docs and only the archive index/classification surfaces needed to stop active readers from finding retired operating instructions as current truth. Start with `README.md`, `AGENTS.md`, `docs/index.md`, `docs/ARCHITECTURE.md`, `docs/RELIABILITY.md`, `docs/release-workflow.md`, `docs/design-docs/scripts.md`, `apps/web/content/docs`, `.github/codex/release-policy.md`, and the active Program file.

The next slice may update active docs to consistently name the final model: feature PRs into `dev`, release PRs into `main`, hotfixes from `main`, required `static` and `integration` checks, release-owned proof commands, tag-driven release identity through `release.json`, archived historical proof reports under `docs/archive/release-proof-runs/`, generated starter testing notes under `docs/testing/`, and no active helper CLI or QA control plane.

The next slice may add a short archive README if needed so `docs/archive/release-proof-runs/` is clearly historical. It may update `docs/codex` or `todo.md` only if there is a local index/classification document that active readers use. It should not rewrite old historical ExecPlans or changelog entries merely to erase old words.

The next slice must not change application code, release scripts, workflow mechanics, branch protection, tag rulesets, labels, PR templates, issue templates, or Codex policy automation unless it discovers a stale docs reference in those files that blocks final docs consistency.

## Dependency Changes

Plan 8 unblocked Plan 9 because GitHub templates and Codex guidance now describe the final release model. Final docs cleanup can reference those policy surfaces instead of leaving GitHub behavior implicit.

Plan 9 should close this Program if validation proves no active docs point contributors at retired CLI, QA, browser-smoke, or transitional release surfaces as current truth.

## Next Plan Recommendation

Exact next plan title: `Final Docs And Archive Cleanup`.

Exact scope: perform a final active-docs sweep and archive classification cleanup so the repo consistently teaches the completed Codex-shaped release model. Update active docs, command maps, and Program closeout text. Keep historical archives historical instead of rewriting them. Move or complete the Program only if all acceptance checks pass.

Exact implementation boundaries: do not change app/runtime code, source tests, release scripts, workflow mechanics, live GitHub policy, issue labels, PR templates, or issue templates except for stale wording discovered during docs cleanup. Do not repair the deferred release-intake plan.

Exact validation boundaries: run active-doc grep for retired surfaces, markdown lint for touched docs, Program lint, plan lint for the child ExecPlan, any narrow docs tests available, and `git diff --check`. If the Program is completed, update active/completed Program indexes and validate them.

Why it is next now: the operating model is implemented and policy surfaces are aligned. The remaining risk is discoverability drift: active docs, generated public docs, or archive entrypoints may still teach retired helper CLI, QA control-plane, browser-smoke, or transitional proof behavior.

## Risks To Carry Forward

Do not rewrite historical evidence to make grep look clean. Old changelog entries, completed ExecPlans, historical proof reports, and `docs/codex` archives can mention retired systems as history. Plan 9 should distinguish active instructions from archival records.

Do not over-clean by deleting archive material that still explains prior release incidents or evidence. Historical proof reports under `docs/archive/release-proof-runs/` should remain findable.

Do not close the Program unless the active docs and indexes are truthful and validation passes. If the deferred release-intake plan still prevents full Program completion, record that clearly instead of overstating closure.
