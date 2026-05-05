---
title: Reconcile Customer Agentic Source Contract
status: complete
created_at: 2026-05-02
completed_at: 2026-05-05
summary: Make generated customer repo agent guidance coherent before shipping the full Program and ExecPlan operating pack.
post_build_recap: Reconciled generated START-HERE skill triggers with shipped wrapper skills and the external-skill manifest, codified the no-hyphen `execplan-*` prompt asset family as the generated Codebase contract, and added clean-room compiler tests for trigger/script/source-contract coherence.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-1.md
read_when:
  - Reconciling generated-repo agent instructions, prompts, skills, scripts, and customer-safe output boundaries.
  - Preparing to ship customer-safe Program and ExecPlan artifacts in generated repos.
  - Refreshing the customer agentic operating system Program after the first slice.
---

# Reconcile Customer Agentic Source Contract

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Generated customer repos should arrive ready for agentic engineering loops, but the current guidance must be coherent before the full operating pack ships. After this change, a fresh customer repo should have aligned root instructions, Build Pack paths, prompt assets, local and external skill triggers, package-script promises, and customer-safe output boundaries.

The user-visible result is a downloaded repo whose agent guidance points to files, skills, and scripts that actually exist. This enables the next Program slice to add Program and ExecPlan artifacts without compounding drift.

## Progress

- [x] 2026-05-02 EDT: Created this child ExecPlan from `docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-1.md`.
- [x] 2026-05-02 EDT: Renamed and narrowed the plan after subagent review found the source-contract reconciliation should precede full operating-pack shipment.
- [x] 2026-05-05 EDT: Inspected the current generated repo materialization path, template overrides, starter onboarding, wrapper skills, root package scripts, prompt-pack rendering, customer-safe exclusions, review-download zip tests, and compiler instructions immediately before implementation.
- [x] 2026-05-05 EDT: Reconciled prompt naming by making the no-hyphen `execplan-*` prompt asset family the generated Codebase contract; removed the hyphenated `exec-plan*` family from the download trace and customer-safe shipping contract.
- [x] 2026-05-05 EDT: Reconciled generated skill triggers by replacing generic `$copywriting`, `$frontend-design`, `$docs`, and `$testing-practices` references with shipped local wrapper skills: `$starter-product-copy`, `$starter-frontend-design`, and `$starter-docs-and-testing`.
- [x] 2026-05-05 EDT: Rechecked package-script promises against generated root scripts and added a clean-room trigger-resolution test that proves every START-HERE `$skill` resolves to a shipped wrapper skill or external manifest entry.
- [x] 2026-05-05 EDT: Reconciled customer-safe snapshot expectations with the current source trace: internal Programs, internal ExecPlans, Program prompts, OpenAI sources, Ship by Sunday sources, env files, and local agent state remain excluded.
- [x] 2026-05-05 EDT: Added focused compiler tests and clean-room materialization proof for source-contract coherence.
- [x] 2026-05-05 EDT: Refreshed the owning Program after implementation and recorded validation evidence.

## Surprises & Discoveries

- 2026-05-05 EDT: The generated onboarding path still referenced generic `$copywriting`, `$frontend-design`, `$docs`, and `$testing-practices` triggers, but those skills were neither shipped under `.agents/skills/` nor included in `.agents/skills/external-skills.json`.
- 2026-05-05 EDT: Both `exec-plan-*` and `execplan-*` prompt files exist in the source repo, but generated Codebases already render and test only the no-hyphen `execplan-*` family. The source contract now names that family as the customer-facing prompt asset set.

## Decision Log

Decision: Keep the first slice generated-repo source-contract focused.
Rationale: Generated repos are compiler-owned, use known scripts, and can be proven without designing the mature-repo product lane at the same time. Subagent review found prompt naming drift, skill trigger drift, and package-script risk, so the first slice must stabilize current guidance before adding more artifacts.
Date: 2026-05-02

Decision: Do not ship internal Program and ExecPlan archives.
Rationale: Customers need generalized contracts, templates, prompts, and skills. Internal completed Programs, release evidence, and repo-specific planning history are not customer-safe.
Date: 2026-05-02

Decision: Use the no-hyphen `execplan-*` prompt family for generated Codebases.
Rationale: The compiler renders `docs/prompts/execplan-outline-from-session.md`, `docs/prompts/execplan-execution-loop.md`, `docs/prompts/execplan-grill.md`, and `docs/prompts/execplan-writer.md`; existing materialization tests already assert those paths. Shipping a second hyphenated prompt family would make generated guidance ambiguous and increase prompt drift.
Date: 2026-05-05

Decision: Generated onboarding may reference only shipped wrapper skills or manifest-backed external skills.
Rationale: START-HERE is the buyer's first agent handoff. Generic skill triggers that are not installed by the Codebase create dead instructions, so product-copy, frontend-design, docs, and testing guidance now use local wrapper skills shipped in `.agents/skills/`.
Date: 2026-05-05

## Outcomes & Retrospective

This plan is complete. Generated Codebases now have a coherent first source contract: START-HERE references only shipped local wrapper skills or manifest-backed external skills, package-script promises are covered by the generated root `package.json`, customer-facing prompt assets use the no-hyphen `execplan-*` family, and internal Program/ExecPlan archives remain excluded from customer snapshots.

The next Program slice can now add the generated-repo operating pack deliberately instead of compounding source-contract drift. That later slice should ship customer-safe Program and ExecPlan templates, bootstrap commands, prompts, and structural tests without exposing internal planning history.

## Context and Orientation

The generated customer repo zip is assembled through the review download path. `apps/web/app/api/download/repo/route.ts` gates the request. `apps/web/app/api/download/repo/_server/downloads.ts` loads the customer's project definition. `packages/codebase-compiler/src/bundle/build-review-download-zip.ts` creates the archive. `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts` materializes the snapshot.

The generated repo is a mix of tracked starter files and rendered overrides. `packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts` renders root agent guidance and testing notes. `packages/codebase-compiler/src/repo-generation/render-starter-project-onboarding.ts` renders `START-HERE.md` and the docs landing page. `packages/codebase-compiler/src/repo-generation/render-starter-skills.ts` renders local skills. `packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts` owns generated root scripts. `packages/codebase-compiler/src/codebases/render-prompt-pack.ts` renders prompt assets under `docs/prompts/`.

The current customer-safe snapshot contract in `packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts` excludes internal `docs/programs/**`, `docs/exec-plans/**`, and Program prompt assets. Preserve that safety boundary. Before adding generalized customer-safe artifacts, reconcile the guidance that already ships so it does not point to missing skills, missing scripts, old prompt contracts, or wrong Build Pack paths.

### In Scope

This plan includes source-contract reconciliation for generated repo agent guidance. It covers root assistant guides, `START-HERE.md`, Build Pack docs, prompt pack naming and contents, local and external skill trigger availability, generated package-script promises, customer-safe snapshot boundaries, materialization tests, and documentation references needed for a fresh agent to use the current generated repo without missing-path drift.

This plan may update `packages/codebase-compiler/src/generated-docs/generated-doc-paths.ts`, `packages/codebase-compiler/src/server/template-loader.ts`, `packages/codebase-compiler/src/codebases/render-prompt-pack.ts`, `packages/codebase-compiler/src/codebases/render-build-codebase.ts`, `packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts`, `packages/codebase-compiler/src/repo-generation/render-starter-project-onboarding.ts`, `packages/codebase-compiler/src/repo-generation/render-starter-skills.ts`, `packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts`, `packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts`, `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`, and focused compiler tests.

### Out Of Scope

This plan does not ship the full Program and ExecPlan operating pack, implement mature-repo adoption, repository upload, GitHub app ingestion, audit scoring, public homepage repositioning, pricing changes, auth changes, billing changes, checkout changes, Convex runtime changes, provider setup changes, codebase intake schema changes, or generated app route changes.

This plan does not ship internal completed Programs, active internal ExecPlans, release evidence, `docs/codex/**`, `docs/ship-by-sunday/**`, or local operator history into customer repos.

## Plan of Work

First, inspect the current generated repo file list, prompt pack wiring, starter skills, root package scripts, Build Pack docs, and tests. Confirm which customer-safe files are copied from tracked source and which are rendered as overrides.

Next, build an explicit source-contract inventory. List every generated prompt, every generated skill trigger, every generated package script mentioned in docs, every generated Build Pack path referenced by root guidance, and every internal planning path that remains excluded.

Then repair drift. Generated prompts should describe the actual customer-facing plan format. Generated skill triggers should resolve to a local skill or external skill manifest entry. Generated docs should not advertise planning validators unless the generated repo includes those validators.

After that, update onboarding only where it preserves the current generated-repo truth. Root `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.agents/README.md`, `START-HERE.md`, and the generated docs landing page should point to existing Build Pack and starter skills accurately.

Finally, prove the output. Materialized generated repo tests should assert that internal archive paths are absent, advertised scripts are present, prompt and skill references are coherent, and generated docs point to real Build Pack paths.

## Milestones

The first milestone is source-contract inventory. It is complete when current generated prompts, skill triggers, package scripts, Build Pack paths, and customer-safe exclusions are mapped and test targets are named.

The second milestone is drift repair. It is complete when generated guidance no longer points to missing skills, missing scripts, wrong prompt contracts, or wrong Build Pack paths.

The third milestone is customer-safety proof. It is complete when generated repo tests prove internal planning archives remain excluded and future operating-pack extension points are explicit.

The fourth milestone is Program refresh. It is complete when focused compiler tests pass, this ExecPlan records validation evidence, and the owning Program is refreshed with the next recommended operating file-set slice.

## Concrete Steps

From the repo root, inspect the relevant generated repo surfaces:

    sed -n '1,220p' packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts
    sed -n '1,220p' packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts
    sed -n '1,260p' packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts
    sed -n '1,260p' packages/codebase-compiler/src/repo-generation/render-starter-skills.ts
    sed -n '1,180p' packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts
    sed -n '1,180p' packages/codebase-compiler/src/codebases/render-prompt-pack.ts

After implementation, run focused compiler validation:

    bun run --cwd packages/codebase-compiler test -- tests/repo-generation.test.ts tests/review-download-zip.test.ts tests/customer-safe-snapshot-contract.test.ts

Run package checks:

    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler format:check
    bun run --cwd packages/codebase-compiler lint

Run planning validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-02-reconcile-customer-agentic-source-contract.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-02-customer-agentic-operating-system docs/exec-plans/completed/2026-05-02-reconcile-customer-agentic-source-contract.md
    git diff --check

## Validation and Acceptance

The implementation is accepted when a generated customer repo has coherent current agent guidance and tests prove that every generated skill trigger resolves, every advertised package script exists, prompt naming is intentional, Build Pack paths are accurate, and internal Ship by Sunday planning archives remain excluded.

The generated repo should not expose commands that are not implemented. If this slice does not include Program and ExecPlan validators in the generated repo, root scripts and onboarding must not claim that they exist. The next operating file-set slice can add validators deliberately.

### Test Commands

Validation evidence from 2026-05-05 EDT:

    bun run --cwd packages/codebase-compiler test -- tests/repo-generation.test.ts tests/review-download-zip.test.ts tests/customer-safe-snapshot-contract.test.ts
    Superseded by the broader focused command below.

    bun run --cwd packages/codebase-compiler test -- tests/repo-generation.test.ts tests/customer-safe-snapshot-contract.test.ts tests/review-download-zip.test.ts tests/codebase-renderers.test.ts
    Test Files 4 passed; Tests 13 passed.

    bun run --cwd packages/codebase-compiler typecheck
    Passed.

    bun run --cwd packages/codebase-compiler lint
    Passed.

    bun run --cwd packages/codebase-compiler format:check
    Passed after applying the package formatter.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-02-reconcile-customer-agentic-source-contract.md
    Passed.

    bun run programs:lint
    Passed.

    bun run markdown:lint -- --paths docs/programs/completed/2026-05-02-customer-agentic-operating-system docs/exec-plans/completed/2026-05-02-reconcile-customer-agentic-source-contract.md
    Passed.

    bun run format
    Passed.

    bun lint
    Passed.

    bun typecheck
    Passed and built the Next.js app route manifest.

    git diff --check
    Passed.

## Idempotence and Recovery

Generated artifacts should be deterministic from the project definition and source packs. Re-running repo generation should produce the same operating pack for the same input.

If generated customer artifacts accidentally include internal planning history, revert the renderer change before continuing and add a regression test that checks the forbidden path or phrase. If package scripts fail inside a materialized generated repo, keep the script out of onboarding until it works. If a skill trigger cannot resolve to a local or external skill, remove the trigger or add the missing generated skill definition before marking the slice complete.

## Artifacts and Notes

The owning Program is `docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md`.

The planning brief is `docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-1.md`.

The most relevant prior Program is `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/program.md`.

## Interfaces and Dependencies

This plan depends on `packages/codebase-compiler/AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts`, `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`, `packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts`, `packages/codebase-compiler/src/repo-generation/render-starter-project-onboarding.ts`, `packages/codebase-compiler/src/repo-generation/render-starter-skills.ts`, `packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts`, `packages/codebase-compiler/src/codebases/render-build-codebase.ts`, `packages/codebase-compiler/src/codebases/render-prompt-pack.ts`, and focused compiler tests under `packages/codebase-compiler/tests/`.
