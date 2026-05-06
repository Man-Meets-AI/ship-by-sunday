---
program_id: docs-spine-adoption-quality-reset
title: Docs Spine Adoption Quality Reset
status: complete
created_at: 2026-05-05
completed_at: 2026-05-06
summary: Rebuild docs-spine adoption around evals, linting, source-truth accuracy, and Worker/SBS-grade customer output after the weak Arena CRM v1 pilot.
post_build_recap: The docs-spine runner now quality-gates adoption and apply, renders contract-grade repo-specific docs, replaces recognized weak prior docs-spine output on approved targets, tolerates approved prior adoption artifacts, records native gate blockers honestly, and passed live Arena CRM acceptance with quality score 100.
read_when:
  - Reworking docs-spine adoption after the Arena CRM v1 output failed the quality bar.
  - Implementing docs-spine evals, linting, scanner repair, renderer repair, apply proof, or pilot acceptance.
  - Deciding what good looks like for runner-installed customer docs spines.
---

# Docs Spine Adoption Quality Reset

This Program is the completed initiative record for rebuilding docs-spine adoption into a quality-gated customer install experience.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The first docs-spine adoption loop proved the runner can scan, draft, apply, and write proof artifacts, but it did not produce a great docs spine. Arena CRM received thin Markdown, weak Program and ExecPlan contracts, placeholder quality notes, noisy hidden-folder references, and proof that checked headings instead of quality.

The product bar is higher. When a customer connects the Ship by Sunday local runner, docs-spine adoption should feel like a serious audit landed in their repo: source-truth-aware, repo-specific, contract-compliant, linted, proven, and useful to the next coding agent without chat history.

This Program resets the initiative around evals. The next implementation work should define "good" in executable checks, fail the current Arena output, repair scanning and rendering against those checks, harden apply proof, and rerun the Arena pilot only when the output is strong enough to show a customer.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset/`.

The failure and parity research is recorded in `research-pass-docs-spine-v1-failure-and-parity.md`. The normalized direction is recorded in `normalized-pass-quality-gated-docs-spine.md`. The initiative decision is recorded in `converged-decision-packet.md`. Ordering is recorded in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is recorded in `cross-repo-review.md`. Completed slices used `planning-brief-1.md`, `planning-brief-2.md`, and `planning-brief-3.md`; the current immutable implementation brief is `planning-brief-4.md`, and `current-planning-brief.txt` points at that brief.

Historical input: `docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/program.md` records the v1 loop that is now treated as insufficient. Its child ExecPlans remain useful for locating the current scanner, synthesis, apply, and proof code, but their acceptance standard is superseded by this Program.

Parity inputs include Worker docs spine surfaces and docs-spine validation concepts, Ship by Sunday docs under `docs/`, Program and ExecPlan contracts under `docs/programs/PROGRAMS.md` and `docs/exec-plans/PLANS.md`, and generated operating-pack rendering under `packages/codebase-compiler/src/repo-generation/render-starter-operating-pack.ts`.

Pilot input is the Arena CRM checkout, especially root `AGENTS.md`, `.codex/AGENTS.md`, `package.json`, existing docs, `.sbs/docs-spine-adoption/**`, and the weak docs applied by the v1 pilot.

## Current State

The local runner has quality-gated `docs-spine-adoption` and `docs-spine-apply-and-proof` workflows. They write scanner facts, deterministic drafts, quality reports, approved Markdown files, and proof artifacts. Adoption proof fails weak drafts. Apply proof rejects blocked drafts, validates the merged target docs before writes, replaces recognized weak prior docs-spine output only on approved targets, preserves managed sections, tolerates approved prior adoption artifacts, and records setup-shaped native gate blockers separately from docs-spine quality.

Arena CRM acceptance is complete. The live checkout at `/Users/bazelrex/Developer/arena-crm` received the accepted docs-spine output on branch `sbs/docs-spine-apply-20260505-2250`; the live apply proof passed with `qualityReportStatus: passed`, `qualityScore: 100`, and native `bun run gate` recorded as blocked by missing repo-local setup (`Error: Failed to run Biome: spawnSync biome ENOENT`, with `happy-dom` also missing from the repo test setup).

The remaining gaps are outside this Program's authority: Arena's native dependency/tooling blocker can be fixed in that customer repo, and any later runner expansion should happen under a new Program or focused ExecPlan.

## Progress

- [x] 2026-05-05: Ran postmortem research comparing Arena CRM v1 output against Worker and Ship by Sunday docs-spine expectations.
- [x] 2026-05-05: Decided the v1 Program is historical evidence, not the active quality bar.
- [x] 2026-05-05: Created this active quality-reset Program packet.
- [x] 2026-05-05: Completed the docs-spine eval and lint harness slice. Adoption and apply now write quality reports, weak Arena-style output fails, and blocked drafts cannot be applied.
- [x] 2026-05-05: Completed source-truth scanner repair. Canonical instructions, root shims, local skills, hidden noise, native gates, and app topology are now classified separately.
- [x] 2026-05-05: Completed contract-grade renderer and synthesis repair. Focused adoption proof now passes the deterministic quality report with contract-bearing Markdown.
- [x] 2026-05-06: Completed final apply/proof hardening. Apply now runs deterministic quality before writes, tolerates approved prior docs-spine adoption artifacts, expands collapsed `.sbs/` dirty refs, preserves managed sections, and records setup-shaped native gate blockers separately from docs-spine quality.
- [x] 2026-05-06: Ran a sandbox Arena CRM acceptance pilot from a clean clone. Adoption proof passed, apply proof passed, the apply quality report passed with score 100, and native `bun run gate` was recorded as blocked by `Error: Failed to run Biome: spawnSync biome ENOENT`.
- [x] 2026-05-06: Replaced the prior weak untracked docs in the live Arena CRM checkout with approved repaired docs. Live apply proof passed with quality score 100 and recorded the Arena native gate as blocked by repo-local setup.

## Decision Log

Decision: Reopen docs-spine adoption as an active quality reset.
Rationale: The v1 loop shipped a mechanical scaffold and should not define the customer install standard.
Date: 2026-05-05

Decision: Build evals before rendering fixes.
Rationale: The failure was not a lack of more templates; it was the absence of checks that would reject weak templates.
Date: 2026-05-05

Decision: Treat Worker/SBS parity as adaptive contract parity, not content copying.
Rationale: Customer repos need the same operating quality while preserving their own stack, commands, docs, and instruction hierarchy.
Date: 2026-05-05

Decision: Keep deterministic apply authority in the runner.
Rationale: Codex and subagents can synthesize and critique, but validators and the workflow controller must own apply readiness, paths, proof, and blocked states.
Date: 2026-05-05

Decision: Arena CRM remains the pilot acceptance repo.
Rationale: It already exposed the failure mode: canonical `.codex/AGENTS.md`, root shim behavior, Bun/Turbo scripts, native gate blockers, and enough existing repo complexity to test mature-repo adoption.
Date: 2026-05-05

## Slice Ledger

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-05-05-docs-spine-eval-and-lint-harness.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-source-truth-scanner-repair.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-contract-grade-renderer-synthesis.md`
- `docs/exec-plans/completed/2026-05-06-docs-spine-final-apply-proof-and-arena-acceptance.md`

Completed Slice 4: Final apply and proof hardening. This slice runs the full eval suite against renderer-complete docs before apply, preserves managed sections, records native gate blockers honestly, and tolerates the approved adoption artifacts needed for apply.

Completed Slice 5: Arena CRM sandbox and live acceptance. This slice reran the full loop against a clean Arena CRM clone, then replaced the recognized weak prior docs-spine output in the live Arena checkout with the accepted output and recorded live proof.

## Next Slice

No required next slice remains inside this Program.

Future work should be opened separately if the product needs broader customer-repo fixtures, model-assisted critique, hosted UI affordances for blocked native gates, or Arena CRM dependency/tooling repair.

## Risks and Watchpoints

Do not regress proof into checking only that files exist. The implementation must continue enforcing the quality bar.

Do not let `proofStatus: passed` mean "files exist." Proof must mean the installed spine is structurally valid, source-truth-aware, and above the content-quality threshold.

Do not mutate root instructions, package scripts, CI, dependencies, or provider setup without explicit authority. The docs spine can propose those changes and document them before a later authority class applies them.

Do not overfit to Arena. Arena is the first acceptance repo, but the validators should encode general docs-spine quality with fixture families.

Do not generate fake certainty. Missing architecture, security, reliability, or quality evidence should become blocked audit items or pending sections, not confident claims.

## Outcomes & Retrospective

Complete. The docs-spine adoption loop now installs a serious, repo-specific operating spine and refuses to apply weak output. The original weak Arena-style output is caught by deterministic evals for blocked drafts, placeholder docs, missing contract sections, fake quality score evidence, hidden-noise first-hop routes, invalid Program packets, invalid ExecPlans, and missing native-gate routing.

The reset required four implementation slices: a quality eval and lint harness, source-truth scanner repair, contract-grade renderer synthesis, and final apply/proof hardening. The scanner now separates canonical instructions, shims, secondary instructions, ignored hidden noise, local skills, app topology, native gate scripts, docs lanes, and generated-output lanes. The renderer now emits contract-bearing first-hop docs, Program and ExecPlan packets, prompt inventory, validation notes, proof notes, and quality-score structure. Apply now validates the final merged Markdown before writes, replaces recognized weak prior docs-spine output only on approved targets, and records native setup blockers honestly.

Arena CRM received the accepted output in its live checkout: `docs/index.md`, `docs/exec-plans/PLANS.md`, `docs/exec-plans/active/2026-05-05-docs-spine-adoption-first-slice.md`, `docs/programs/PROGRAMS.md`, `docs/programs/active/2026-05-05-docs-spine-adoption/program.md`, `docs/programs/active/2026-05-05-docs-spine-adoption/planning-brief-1.md`, `docs/prompts/README.md`, `docs/QUALITY_SCORE.md`, `docs/validation.md`, and `docs/proof.md`. The live proof path is `/Users/bazelrex/Developer/arena-crm/.sbs/runs/arena_docs_spine_live_acceptance_apply/proof.json`.

The authority boundaries remain intentional. The runner can install and prove the docs spine, but it should not silently change customer dependencies, package scripts, CI, provider setup, or root instructions. Arena's `bun run gate` blocker is documented proof, not runner scope.

## Validation and Acceptance

Program completion required deterministic docs-spine evals, linting, checks, and pilot proof.

The eval suite includes structural checks, contract checks, source-truth checks, content-quality checks, safety checks, and pilot acceptance checks. The current Arena CRM v1 output now fails those checks. A fixed Arena output must pass them.

The local-runner proof path must include the docs-spine quality report and fail or block when generated docs are below threshold. Apply must reject blocked drafts, placeholder docs, missing required sections, hidden-noise route maps, invalid Program packets, invalid ExecPlans, and quality-score placeholders that pretend to be complete.

The scanner must correctly recognize canonical instructions, instruction shims, package manager, native commands, app topology, CI, docs lanes, generated-output lanes, and existing docs ownership.

The renderer must produce complete repo-specific docs for the approved target surfaces. At minimum, it must install or update first-hop docs, Program and ExecPlan contracts, active Program and ExecPlan packets, prompt docs, validation docs, proof docs, quality-score structure, and instruction routing notes. Optional architecture, reliability, security, frontend, design, product, generated, specs, and reference docs should be emitted when repo evidence supports them.

The Arena CRM pilot preserves `.codex/AGENTS.md` as canonical, root `AGENTS.md` as a shim, Bun/Turbo command semantics, and `bun run gate` blocker evidence. Its final docs diff is strong enough to show a customer as the runner install outcome.

Validation commands for this Program include:

```bash
bun run programs:lint
bun run markdown:lint -- --paths docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset docs/programs/README.md docs/programs/active/index.md docs/programs/completed/index.md
git diff --check
```

Child ExecPlans must add focused local-runner tests, validator tests, fixture tests, and workflow proof tests for the code they touch.

## Artifacts and Notes

The original weak pilot output was replaced in `/Users/bazelrex/Developer/arena-crm/docs/` by the accepted docs-spine output after the runner learned to identify recognized weak prior docs-spine output on approved targets.

Primary implementation surfaces are:

- `packages/local-runner/src/workflows/docs-spine-adoption/scanner.ts`
- `packages/local-runner/src/workflows/docs-spine-adoption/synthesis.ts`
- `packages/local-runner/src/core/docs-spine-adoption-workflow.ts`
- `packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts`
- `packages/codebase-compiler/src/repo-generation/render-starter-operating-pack.ts`
- `scripts/programs/`
- `scripts/exec-plan/`
- `scripts/markdown-metadata/`

Current proof artifacts include `.sbs/docs-spine-adoption/facts/quality-report.json` for adoption and `.sbs/docs-spine-adoption/apply/quality-report.json` for apply. Current scanner facts classify canonical instructions, shims, secondary instructions, ignored hidden refs, local skills, app roots, and native gate scripts. Current renderer output passes the focused deterministic quality report. The live Arena acceptance proof recorded `qualityReportStatus: passed`, `qualityScore: 100`, and `bun run gate` blocked by `Error: Failed to run Biome: spawnSync biome ENOENT`; keep durable follow-up evidence in repo-relative Program or ExecPlan notes, not local temporary paths.

## Interfaces and Dependencies

This Program depends on local-runner workflow dispatch, `.sbs` artifact storage, workflow approval packets, Convex proof refs, Program linting, ExecPlan linting, markdown metadata linting, generated operating-pack rendering, Worker docs-spine validation concepts, Arena CRM as a pilot repo, and repo-native gate discovery.

Child ExecPlans carry `program_id: docs-spine-adoption-quality-reset` and completed packet `planning_brief` paths in their frontmatter.
