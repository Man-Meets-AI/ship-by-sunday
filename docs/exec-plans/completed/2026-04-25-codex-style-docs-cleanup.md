---
title: Codex-Style Docs Cleanup
status: complete
created_at: 2026-04-25
completed_at: 2026-04-25
summary: Make Ship by Sunday's active documentation match the lean Codex documentation pattern while preserving compiler-owned source packs and useful historical records.
post_build_recap: Active docs now have a Codex-style workflow strategy entrypoint, a root contributor guide, repaired planning and product-spec pointers, explicit generated mirror ownership, thinned Program and prompt entrypoints, and documented CI compatibility contexts that remain blocked by live branch protection.
read_when:
  - Resuming the Codex-style documentation cleanup.
  - Deciding whether a docs surface should be active, generated, source-pack, or historical.
  - Validating cleanup after release workflow, prompt, Program, or generated-doc changes.
---

# Codex-Style Docs Cleanup

This is a living execution plan. It was completed on 2026-04-25 after the documentation cleanup was implemented, validated, and narrowed by discoveries in the repository.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday recently moved away from the old QA control plane and toward a Codex-shaped release model: fast PR checks, hosted release proof, tag-driven release identity, and short-lived feature branches into `dev`. The documentation now needs the same discipline. A contributor should be able to open the repo, find the current release and docs model quickly, and avoid stale or over-broad historical material unless they intentionally need archive context.

After this plan is implemented, the active docs will be thinner and more reliable. The root README will route instead of trying to teach every operating detail, workflow strategy will live beside GitHub workflow files, generated mirrors will be labeled as generated mirrors, compiler-owned source packs will have a clear owner, duplicate prompt families will be reconciled safely, and stale active docs will not point at missing files, Worker-specific debt, retired browser-smoke lanes, or deleted active plans.

## Progress

- [x] 2026-04-25 EDT: Created this ExecPlan after a read-only multi-agent comparison of `~/Developer/codex` and the current Ship by Sunday docs.
- [x] 2026-04-25 EDT: Confirmed `docs/exec-plans/active/` was missing before this plan was created.
- [x] 2026-04-25 EDT: Grilled this ExecPlan against `AGENTS.md`, `docs/exec-plans/PLANS.md`, live branch protection, missing-file checks, and the current validation commands.
- [x] 2026-04-25 EDT: Created `.github/workflows/README.md` and trimmed volatile release-run evidence from `docs/release-workflow.md`.
- [x] 2026-04-25 EDT: Repaired broken or stale active documentation pointers by adding `CONTRIBUTING.md`, resetting `docs/exec-plans/tech-debt-tracker.md`, fixing `docs/product-specs/index.md`, refreshing `docs/design-docs/encyclopedia.md`, and cleaning `todo.md`.
- [x] 2026-04-25 EDT: Defined generated-doc and source-pack ownership with `docs:generated:check`, `docs/generated/index.md`, `docs/index.md`, and source/mirror README updates.
- [x] 2026-04-25 EDT: Reconciled prompt and planning documentation duplication by thinning `docs/programs/README.md` and labeling `exec-plan-*` versus compiler-shipped `execplan-*` prompt families.
- [x] 2026-04-25 EDT: Rechecked branch protection; both `dev` and `main` still require `browser-smoke` and `cli`, so the no-op compatibility jobs remain in place.
- [x] 2026-04-25 EDT: Completed the plan and moved it to `docs/exec-plans/completed/`.

## Surprises & Discoveries

Codex keeps most top-level documentation intentionally small. Its root `README.md` is a quickstart and route map, its root `AGENTS.md` contains contributor rules, `.github/workflows/README.md` explains CI strategy beside the workflow files, and deeper README files live near owning code. That pattern is a better target for Ship by Sunday than adding more broad global docs.

`docs/exec-plans/active/` did not exist in this checkout even though `docs/exec-plans/PLANS.md` says unfinished ExecPlans belong there. Creating this plan reintroduces the active lane and should make future references real again.

Some cleanup candidates are wired into code and cannot be deleted as a simple docs prune. The blueprint compiler still reads `docs/prompts/execplan-*` files, uses `docs/prompts/execplan-execution-loop.md` as a repo-root marker, and loads `docs/openai/design-checklist/*` even though the newer docs call `docs/openai/design-pack/` the vanilla baseline.

`docs/generated/openai-blueprint/` currently mirrors `docs/openai/`, and `docs/generated/ship-by-sunday-blueprint/` currently mirrors `docs/ship-by-sunday/`. Generated mirrors are not proof of customer starter output; customer output proof belongs to blueprint compiler render and repo-generation tests.

Live branch protection currently requires `static`, `integration`, `browser-smoke`, and `cli` for both `dev` and `main`. The no-op `browser-smoke` and `cli` jobs cannot be removed during this cleanup unless branch protection is updated first and rechecked. Until then, they are compatibility contexts, not release evidence.

The first grill run found that `README.md` links to `CONTRIBUTING.md`, but `CONTRIBUTING.md` does not exist. Because the final validation command includes `CONTRIBUTING.md`, this plan should create a short contributor guide rather than leave that link optional.

Milestone 1 confirmed the durable workflow strategy now lives beside the workflow files. `docs/release-workflow.md` no longer carries the old audited run IDs, branch-protection patch recipe, or orphaned `Deployment Smoke` snapshot as current guidance.

The Program README could not be reduced to only links because `bun run programs:lint` enforces that `docs/programs/README.md` carries the Program prompt inventory. The final version keeps that inventory but removes the long duplicated Program Funnel and Program Loop explanation.

The implementation chose not to migrate compiler input from `docs/openai/design-checklist/` to `docs/openai/design-pack/`. The lighter and safer cleanup is to document the current ownership: `design-checklist` remains compiler input, while `design-pack` is the active human-facing vanilla baseline.

## Decision Log

Decision: Keep this as one standalone ExecPlan rather than creating a new Program packet.
Rationale: The work has several milestones and needs sequencing, but the scope is one coherent cleanup theme rather than a multi-track product program.
Date/Author: 2026-04-25 / Codex

Decision: Do not bulk-delete completed Program packets, completed ExecPlans, or compiler-wired prompt files.
Rationale: The read-only audit found useful recovery history and live compiler references. Cleanup should remove stale active guidance and collapse duplication only after ownership is proven.
Date/Author: 2026-04-25 / Codex

Decision: Treat branch-protection cleanup as a gated step.
Rationale: The no-op `browser-smoke` and `cli` workflow contexts can be removed only after GitHub branch protection no longer requires them, otherwise a docs cleanup PR can strand itself behind missing required checks.
Date/Author: 2026-04-25 / Codex

Decision: Create `CONTRIBUTING.md` instead of removing the README link.
Rationale: Codex has a concise contributor guide, the current README already routes to a root `CONTRIBUTING.md`, and the final markdown validation path expects that file to exist.
Date/Author: 2026-04-25 / Codex

Decision: Treat `browser-smoke` and `cli` job deletion as currently blocked by live branch protection.
Rationale: A grill check against GitHub returned `["static","integration","browser-smoke","cli"]` for both `dev` and `main`. The implementation may document the blocker, but it must not delete those jobs unless a fresh branch-protection check proves the contexts are no longer required.
Date/Author: 2026-04-25 / Codex

## Outcomes & Retrospective

This plan is complete. Active documentation now follows the useful parts of the Codex docs model: workflow strategy lives beside GitHub workflow files, the root contributor guide is concise, durable release docs no longer carry volatile run IDs or branch-protection patch recipes, generated mirrors are labeled as mirrors, Program docs route to the canonical contract, and prompt docs explain the active repo-agent prompt family versus compiler-shipped starter prompt assets.

The cleanup deliberately preserved compiler-wired `execplan-*` prompt files, completed Program packets, completed ExecPlans, and historical source packs. It also deliberately left the no-op `browser-smoke` and `cli` CI jobs in place because live branch protection still requires those contexts on both `dev` and `main`.

Remaining follow-up: remove the compatibility CI jobs only after branch protection no longer requires `browser-smoke` or `cli`.

## Context and Orientation

This repository has several different documentation lanes. Active repo docs live at `README.md`, `AGENTS.md`, `docs/index.md`, and top-level `docs/*.md` files such as `docs/RELIABILITY.md`, `docs/QUALITY_SCORE.md`, and `docs/release-workflow.md`. Public product docs for the web app live under `apps/web/content/docs/`. GitHub release and automation policy lives under `.github/`, especially `.github/codex/release-policy.md` and `.github/workflows/*.yml`.

Planning docs live in `docs/exec-plans/`, `docs/programs/`, and `docs/prompts/`. `docs/exec-plans/PLANS.md` is the contract for this file. `docs/programs/PROGRAMS.md` is the canonical Program contract. Prompt files have two families: `docs/prompts/exec-plan-*`, which current Program docs route agents toward, and `docs/prompts/execplan-*`, which the blueprint compiler still ships into generated starter repos.

Source-pack docs live under `docs/openai/` and `docs/ship-by-sunday/`. These are not ordinary active repo docs. The blueprint compiler reads selected `docs/openai/*` files through `packages/blueprint-compiler/src/server/template-loader.ts` and ships prompt assets through `packages/blueprint-compiler/src/blueprints/render-prompt-pack.ts`. Generated mirror docs live under `docs/generated/`. A generated mirror is a checked-in copy of source-pack material, not the same as a rendered customer starter repository.

The Codex reference repo at `~/Developer/codex` uses a leaner shape: a short root README, contributor rules in `AGENTS.md`, CI strategy in `.github/workflows/README.md`, module READMEs near owning code, and deeper docs only for stable design or protocol decisions. Ship by Sunday should copy that organization principle, not every Codex file or policy. Ship by Sunday still needs SaaS-specific docs for Vercel, Convex, Stripe, Clerk, hosted proof, and the `dev` to `main` release path.

### In Scope

In scope is adding or updating active documentation so the repo has one clear workflow strategy entrypoint, one clear command map, and one clear generated-doc/source-pack ownership model. In scope is creating a short root `CONTRIBUTING.md`, because the README already links there and Codex's small contributor guide is the right model. In scope is repairing broken active links such as the missing `docs/design-docs/product-contract.md` reference. In scope is resetting or removing active references to Worker-specific tech debt. In scope is thinning duplicated Program and prompt entrypoints without deleting compiler-owned files until code and tests are migrated.

In scope is updating code only when the cleanup requires it to make docs truthful, such as changing blueprint compiler references from one prompt or source-pack family to another. If code changes are made, they must be limited to documentation ownership, generated starter docs, or compiler path references needed by this cleanup.

### Out Of Scope

Out of scope is redesigning the public docs UI, changing product copy outside documentation cleanup, changing checkout, auth, entitlement, Convex, Stripe, or Vercel runtime behavior, and rewriting historical archives merely to remove old terms. Completed ExecPlans, completed Program packets, `docs/codex/`, and `docs/archive/` may preserve historical descriptions of retired systems.

Out of scope is deleting `browser-smoke` and `cli` CI compatibility jobs before confirming GitHub branch protection no longer requires those contexts. Out of scope is replacing the `dev` to `main` release path with Codex's direct-to-main model; Ship by Sunday needs `dev` as hosted staging for this product.

## Plan of Work

Start by creating the missing workflow strategy doc at `.github/workflows/README.md`. It should be concise and sit beside the workflow YAML files, following Codex's pattern. It should explain what each workflow proves, which checks are required on PRs, which hosted proofs run after merges, and which workflows are non-release repair lanes.

Then repair broken and stale active documentation pointers. Create a small root `CONTRIBUTING.md` so the existing README link resolves. Reset `docs/exec-plans/tech-debt-tracker.md` so it contains Ship by Sunday debt only, or remove links to it from `docs/QUALITY_SCORE.md` and `docs/exec-plans/index.md`. Fix `docs/product-specs/index.md` so it no longer points at missing `docs/design-docs/product-contract.md` unless that product contract is created. Clean stale command glossary wording in `docs/design-docs/encyclopedia.md`.

Next, split durable release runbook content from volatile evidence. Keep `docs/release-workflow.md` as the canonical release runbook, but remove dated run IDs, failed workflow snapshots, and branch-protection mutation recipes from the durable path. Historical evidence belongs in PRs, GitHub runs, `docs/archive/release-proof-runs/`, or a clearly labeled archive note.

After the active docs are truthful, define source-pack and generated-mirror ownership. Update `docs/generated/index.md` to say `docs/generated/openai-blueprint/` mirrors `docs/openai/` and `docs/generated/ship-by-sunday-blueprint/` mirrors `docs/ship-by-sunday/`. Add or document a repeatable mirror check. Decide whether `docs/openai/design-checklist/` remains the compiler input and historical source basis, or whether the compiler should switch to `docs/openai/design-pack/`. The preferred final shape is that `docs/openai/design-pack/` is the vanilla baseline for active use, while `docs/openai/design-checklist/` is explicitly historical source basis.

Then reconcile prompt and Program duplication. Do not delete `docs/prompts/execplan-*` until `packages/blueprint-compiler/src/server/template-loader.ts`, `packages/blueprint-compiler/src/generated-docs/generated-doc-paths.ts`, `packages/blueprint-compiler/src/repo-root.ts`, `packages/blueprint-compiler/src/blueprints/render-prompt-pack.ts`, and matching tests no longer require those files. If the repo keeps both prompt families, label one as repo-agent prompts and one as generated-starter prompts so readers do not treat them as competing current truth. Thin `docs/programs/README.md`, `docs/programs/active/index.md`, and `docs/prompts/README.md` so `docs/programs/PROGRAMS.md` remains the canonical Program contract.

Finally, record the CI compatibility gate. Current branch protection requires `browser-smoke` and `cli`, so the implementation should leave the no-op jobs in `.github/workflows/ci.yml` and keep compatibility-shim language truthful. If branch protection is updated before this milestone runs, query it again; only then may the implementation remove the no-op jobs and the compatibility-shim language from `.github/codex/release-policy.md` and `docs/release-workflow.md`.

## Milestones

### Milestone 1: Workflow And Release Docs Consolidation

This milestone adds `.github/workflows/README.md` and trims duplicated or volatile release wording. At the end, a contributor can understand PR checks, hosted proof, tag release evidence, and non-release repair lanes without reading every workflow YAML file. Success is shown by markdown lint on `.github/workflows/README.md`, `docs/release-workflow.md`, `.github/codex/release-policy.md`, and any touched public docs.

### Milestone 2: Broken Active-Doc Repair

This milestone fixes active docs that point at missing, wrong-repo, or stale surfaces. It covers the missing `CONTRIBUTING.md` link, Worker-specific `docs/exec-plans/tech-debt-tracker.md`, the missing product-contract pointer from `docs/product-specs/index.md`, stale command glossary wording, and stale `todo.md` active items. Success is shown by targeted `rg` checks for the repaired pointers and markdown lint on touched docs.

### Milestone 3: Source-Pack And Generated-Mirror Boundary

This milestone makes `docs/openai/`, `docs/ship-by-sunday/`, and `docs/generated/` understandable and safe to edit. It defines which docs are primary edit targets, which are generated mirrors, and which compiler tests prove customer starter output. It resolves or records the `design-checklist` versus `design-pack` compiler-input mismatch. Success is shown by mirror diff checks and blueprint compiler tests if compiler references change.

### Milestone 4: Prompt And Program Entry Point Thinning

This milestone removes active confusion around `exec-plan-*` versus `execplan-*` prompt files and around Program docs that repeat the same contract. It either migrates compiler references and tests before retiring older prompt names, or marks the older names as generated-starter-owned. It keeps `docs/programs/PROGRAMS.md` canonical and makes nearby README/index files route instead of re-explaining the whole system. Success is shown by Program lint, plan lint for this plan, and blueprint compiler tests if prompt paths change.

### Milestone 5: Branch-Protection Compatibility Gate

This milestone records the live branch-protection gate around the no-op `browser-smoke` and `cli` CI jobs. Current branch protection still requires those checks, so the expected action is to leave the jobs intact and make the docs say they are compatibility contexts, not release proof. If branch protection changes before implementation reaches this milestone, the executor may remove the jobs only after a fresh `gh api` check proves both branches no longer require them. Success is shown by recorded branch-protection output and, if workflow YAML changes, a passing PR CI run.

### Milestone 6: Final Validation And Handoff

This milestone runs the full relevant proof set, updates this ExecPlan's living sections, and prepares the final PR handoff. Success is shown by passing markdown lint, plan lint, Program lint, mirror checks, blueprint compiler checks when relevant, root format/lint/typecheck if code changed, and clean diff hygiene.

## Concrete Steps

1. Confirm the starting branch and clean state:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short --branch

   Expected observation is `## dev...origin/dev` plus only the files created or changed for this plan once implementation begins.

2. Read the Codex workflow strategy model and the current SBS workflow files:

       sed -n '1,120p' /Users/parkerrex/Developer/codex/.github/workflows/README.md
       ls -1 .github/workflows
       sed -n '1,220p' .github/workflows/ci.yml
       sed -n '1,220p' .github/workflows/dev-staging-proof.yml
       sed -n '1,220p' .github/workflows/production-release-proof.yml
       sed -n '1,220p' .github/workflows/convex-production-deploy.yml
       sed -n '1,220p' .github/workflows/release.yml
       sed -n '1,140p' .github/workflows/sandbox-e2e-nightly.yml

   Use that to write `.github/workflows/README.md`. Keep it concise. Do not duplicate every job step.

3. Fix broken active pointers:

       test -f CONTRIBUTING.md || true
       rg -n "CONTRIBUTING|tech-debt-tracker|product-contract|browser-smoke|browser smoke|Deployment Smoke|test:e2e" README.md docs apps/web/content/docs .github/codex --glob '!docs/archive/**' --glob '!docs/codex/**' --glob '!docs/exec-plans/completed/**' --glob '!docs/programs/completed/**'

   Repair the matches according to this plan. Create `CONTRIBUTING.md` and keep it short and Codex-shaped: issue or task context, branch expectations, local checks, PR contents, docs update rule, and no local hooks as enforcement.

4. Split release runbook from evidence:

       sed -n '1,220p' docs/release-workflow.md
       sed -n '1,140p' .github/codex/release-policy.md

   Preserve durable release mechanics. Remove volatile run IDs and remote metadata snapshots from active runbook prose unless they are moved to a clearly historical note.

5. Define generated mirror policy and verify current mirror state:

       diff -qr docs/openai docs/generated/openai-blueprint
       diff -qr docs/ship-by-sunday docs/generated/ship-by-sunday-blueprint
       sed -n '1,120p' docs/generated/index.md

   Expected observation today is no output from both `diff -qr` commands. If that changes during implementation, either sync the mirrors from source or explain why the mirror policy changed.

6. Resolve source-pack and design-pack ownership:

       rg -n "design-checklist|design-pack" docs/openai docs/ship-by-sunday docs/generated packages/blueprint-compiler/src packages/blueprint-compiler/tests --glob '!docs/archive/**'
       sed -n '1,140p' packages/blueprint-compiler/src/server/template-loader.ts

   If switching compiler input from `docs/openai/design-checklist/*` to `docs/openai/design-pack/*`, update code, tests, generated mirrors, and docs in one slice. If not switching, update docs to say `design-checklist` remains compiler input and `design-pack` is active baseline material derived from it.

7. Reconcile prompt families:

       rg -n "execplan-|exec-plan-" docs/prompts docs/programs packages/blueprint-compiler/src packages/blueprint-compiler/tests
       sed -n '1,140p' packages/blueprint-compiler/src/repo-root.ts
       sed -n '1,160p' packages/blueprint-compiler/src/generated-docs/generated-doc-paths.ts
       sed -n '1,140p' packages/blueprint-compiler/src/blueprints/render-prompt-pack.ts

   Do not remove `docs/prompts/execplan-*` until all compiler references and tests are updated. If keeping both families, update `docs/prompts/README.md` to state which family is for repo agents and which is shipped to generated starter repos.

8. Thin Program docs:

       sed -n '1,220p' docs/programs/PROGRAMS.md
       sed -n '1,220p' docs/programs/README.md
       sed -n '1,120p' docs/programs/active/index.md
       sed -n '1,140p' docs/prompts/README.md

   Keep `docs/programs/PROGRAMS.md` canonical. Make other files route readers to the canonical contract and current prompt sequence without duplicating the full contract.

9. Check branch protection before removing no-op CI jobs:

       gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection --jq '.required_status_checks.contexts'
       gh api repos/ParkerRex/ship-by-sunday/branches/main/protection --jq '.required_status_checks.contexts'

   The grill-time output for both branches was:

       ["static","integration","browser-smoke","cli"]

   If either fresh output still includes `browser-smoke` or `cli`, do not delete those jobs. If both branches omit them, remove the no-op jobs from `.github/workflows/ci.yml` and update `.github/codex/release-policy.md` and `docs/release-workflow.md` accordingly.

10. Update this ExecPlan as implementation proceeds. After each milestone, check off completed work in `Progress`, add any unexpected discoveries, and record material decisions in `Decision Log`.

## Validation and Acceptance

The cleanup is accepted when active documentation gives a consistent current model without forcing readers through stale, duplicated, or historical lanes. A contributor should find one workflow strategy doc beside the workflow files, one command map with links from other docs, an accurate contributor guide link, no active Worker-specific tech-debt tracker, no broken product-contract pointer, and no generated mirror presented as primary doctrine.

Compiler-owned docs are accepted only when tests prove the generated starter still contains the expected prompt and docs assets. If prompt paths or source-pack paths change, `packages/blueprint-compiler` tests must pass. If prompt paths do not change, docs must clearly explain why both prompt families exist.

CI compatibility cleanup is accepted only when branch protection and PR CI agree. With the current branch-protection state, acceptance means the no-op jobs remain and docs accurately call them compatibility contexts. Removing no-op jobs is not allowed until `dev` and `main` branch protection no longer require those contexts and the next PR does not wait on missing required checks.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` for the final proof set:

       bun run markdown:lint -- --paths README.md CONTRIBUTING.md AGENTS.md GEMINI.md .github/codex .github/workflows/README.md docs/index.md docs/QUALITY_SCORE.md docs/RELIABILITY.md docs/release-workflow.md docs/design-docs docs/exec-plans docs/product-specs docs/programs docs/prompts docs/generated apps/web/content/docs
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-25-codex-style-docs-cleanup.md
       bun run programs:lint
       diff -qr docs/openai docs/generated/openai-blueprint
       diff -qr docs/ship-by-sunday docs/generated/ship-by-sunday-blueprint
       bun run --cwd packages/blueprint-compiler format:check
       bun run --cwd packages/blueprint-compiler lint
       bun run --cwd packages/blueprint-compiler typecheck
       bun run --cwd packages/blueprint-compiler test
       git diff --check

   If implementation changes TypeScript, package scripts, workflow YAML, or compiler code beyond documentation text, also run the root quality surface:

       bun run format
       bun lint
       bun typecheck

   If implementation removes `browser-smoke` or `cli` compatibility jobs, also run:

       gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection --jq '.required_status_checks.contexts'
       gh api repos/ParkerRex/ship-by-sunday/branches/main/protection --jq '.required_status_checks.contexts'

   The outputs must not contain `browser-smoke` or `cli` before those jobs are deleted.

## Idempotence and Recovery

Most changes in this plan are text edits and can be safely retried. Before making broad changes, use `git status --short --branch` and `git diff -- <path>` to avoid overwriting unrelated work. If markdown lint fails, repair only the touched docs unless the error is in a file this plan explicitly owns.

Generated mirror cleanup must remain source-first. If `docs/generated/*` diverges from `docs/openai/*` or `docs/ship-by-sunday/*` accidentally, either resync from the source pack or revert the generated-only change. Do not hand-edit generated mirrors as the primary source of truth.

Prompt cleanup must be code-aware. If removing or renaming prompt files breaks blueprint compiler tests or repo-root detection, restore the old files or add explicit compatibility shims until the compiler migration is complete. Never delete `docs/prompts/execplan-*` just because `docs/prompts/exec-plan-*` looks newer.

CI compatibility cleanup must be reversible. If `browser-smoke` or `cli` no-op jobs are removed and branch protection still waits on them, restore the jobs immediately or update branch protection before rerunning PR CI. Record the recovery in `Surprises & Discoveries` and `Decision Log`.

Completed Programs and completed ExecPlans are historical records. If a deletion removes useful recovery history or causes `programs:lint` or `plans:lint` to fail, restore the archive and narrow the cleanup to active entrypoints.

## Artifacts and Notes

Read-only research identified these concrete current issues:

       README.md linked to missing CONTRIBUTING.md: fixed by adding CONTRIBUTING.md.
       docs/exec-plans/tech-debt-tracker.md contained Worker-specific debt: fixed by resetting the active tracker to SBS-owned debt only.
       docs/product-specs/index.md linked to missing docs/design-docs/product-contract.md: fixed by routing to docs/PRODUCT_SENSE.md until a dedicated product spec exists.
       docs/prompts contains both exec-plan-* and execplan-* families: fixed by documenting repo-agent versus generated-starter ownership.
       packages/blueprint-compiler still references docs/prompts/execplan-*: preserved intentionally and covered by blueprint compiler tests.
       packages/blueprint-compiler/src/repo-root.ts uses docs/prompts/execplan-execution-loop.md as a marker: preserved intentionally.
       docs/generated was linked from docs/index.md as a landing zone: fixed by demoting it to generated mirror reference material.
       docs/openai/design-pack is the human-facing vanilla baseline while template-loader.ts still reads docs/openai/design-checklist: fixed by documenting the compiler input boundary.
       .github/workflows/ci.yml still has no-op browser-smoke and cli compatibility jobs: preserved because branch protection still requires them.
       docs/release-workflow.md contained volatile dated run evidence and orphaned Deployment Smoke discussion: fixed by moving durable strategy to prose and .github/workflows/README.md.

Milestone 1 validation:

       bun run markdown:lint -- --paths .github/workflows/README.md docs/release-workflow.md .github/codex/release-policy.md
       rg -n "247360|248762|245713|Deployment Smoke|required-checks-source-proof|gh api --method PATCH|2026-04-24" docs/release-workflow.md .github/workflows/README.md .github/codex/release-policy.md

Milestone validation receipts:

       bun run markdown:lint -- --paths CONTRIBUTING.md docs/exec-plans/tech-debt-tracker.md docs/product-specs/index.md docs/design-docs/encyclopedia.md todo.md README.md docs/QUALITY_SCORE.md docs/exec-plans/index.md
       bun run markdown:lint -- --paths docs/generated/index.md docs/index.md docs/openai/design-checklist/README.md docs/openai/design-pack/README.md docs/generated/openai-blueprint/design-checklist/README.md docs/generated/openai-blueprint/design-pack/README.md
       bun run docs:generated:check
       bun run --cwd packages/blueprint-compiler test
       bun run programs:lint
       bun run markdown:lint -- --paths docs/programs docs/prompts
       gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection --jq '.required_status_checks.contexts'
       gh api repos/ParkerRex/ship-by-sunday/branches/main/protection --jq '.required_status_checks.contexts'

Final validation receipts:

       bun run markdown:lint -- --paths README.md CONTRIBUTING.md AGENTS.md GEMINI.md .github/codex .github/workflows/README.md docs/index.md docs/QUALITY_SCORE.md docs/RELIABILITY.md docs/release-workflow.md docs/design-docs docs/exec-plans docs/product-specs docs/programs docs/prompts docs/generated apps/web/content/docs
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-25-codex-style-docs-cleanup.md
       bun run programs:lint
       bun run docs:generated:check
       bun run --cwd packages/blueprint-compiler format:check
       bun run --cwd packages/blueprint-compiler lint
       bun run --cwd packages/blueprint-compiler typecheck
       bun run --cwd packages/blueprint-compiler test
       bun run format
       bun lint
       bun typecheck
       git diff --check

Useful Codex model files to inspect during implementation:

       /Users/parkerrex/Developer/codex/README.md
       /Users/parkerrex/Developer/codex/AGENTS.md
       /Users/parkerrex/Developer/codex/.github/workflows/README.md
       /Users/parkerrex/Developer/codex/docs/contributing.md
       /Users/parkerrex/Developer/codex/codex-rs/core/src/config_loader/README.md

## Interfaces and Dependencies

`.github/workflows/*.yml` defines GitHub Actions behavior. `.github/workflows/README.md` should explain intent and required proof without duplicating YAML details.

`.github/codex/release-policy.md` is the short agent-facing release policy. It should remain shorter than `docs/release-workflow.md`.

`docs/release-workflow.md` is the canonical release runbook. It should describe durable release mechanics, not every dated evidence snapshot.

`docs/design-docs/scripts.md` is the preferred command map. README, reliability docs, release docs, and public docs should link to it rather than maintain separate long command inventories.

`docs/openai/` and `docs/ship-by-sunday/` are source-pack lanes. `docs/generated/` is a generated mirror lane. Customer starter output is validated through `packages/blueprint-compiler` tests, not by reading `docs/generated/` alone.

`packages/blueprint-compiler/src/server/template-loader.ts`, `packages/blueprint-compiler/src/generated-docs/generated-doc-paths.ts`, `packages/blueprint-compiler/src/repo-root.ts`, `packages/blueprint-compiler/src/blueprints/render-prompt-pack.ts`, and matching tests own any prompt or source-pack path migration.

`docs/programs/PROGRAMS.md` is the canonical Program contract. `docs/programs/README.md`, `docs/programs/active/index.md`, and `docs/prompts/README.md` should route to canonical contracts instead of competing with them.
