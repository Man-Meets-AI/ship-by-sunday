---
title: Final Docs And Archive Cleanup
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Finish the Codex release reset by cleaning active docs and archive entrypoints so the repo consistently teaches the final release model.
post_build_recap: Active docs now avoid retired QA, helper CLI, browser-smoke, run-pack, and inventory surfaces as current truth; the Codex release reset Program is complete and moved to the completed Program lane.
read_when:
  - Resuming the ninth child slice of the Codex release reset Program.
  - Cleaning active docs after CI, release, QA, CLI, browser proof, and GitHub policy migrations.
  - Deciding whether the Codex release reset Program can move to completed.
program_id: sbs-codex-release-reset
planning_brief: docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-9.md
---

# Final Docs And Archive Cleanup

This is a living execution plan. Keep it current as active docs are audited, cleaned, validated, and the Program is either closed or left active with a clear blocker.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The Codex release reset has changed the way Ship by Sunday proves and ships work. The implementation slices are done: required checks are reconciled, tag release identity exists, release helpers live under `scripts/release/`, the helper CLI is retired, shallow browser-smoke proof is retired, the active QA control plane is retired, and GitHub policy now points at the new model. The last risk is documentation drift. A fresh contributor should not read an active doc and be told to use retired QA, CLI, browser-smoke, or transitional release surfaces.

After this plan is implemented, active docs and archive entrypoints should consistently describe the final model: feature PRs into `dev`, release PRs into `main`, hotfixes from `main`, required `static` and `integration` checks, tag-driven release identity through `release.json`, release-owned hosted proof commands, archived release reports under `docs/archive/release-proof-runs/`, and no active helper CLI or QA control plane.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-9.md`.
- [x] 2026-04-24 EDT: Read `planning-brief-9.md`, `docs/index.md`, active Program indexes, archive README, and the first retired-surface grep before freezing the plan.
- [x] 2026-04-24 EDT: Reworded active docs in `docs/release-workflow.md`, `apps/web/content/docs/commands.mdx`, `apps/web/content/docs/clerk-convex-auth.mdx`, and `apps/web/content/docs/local-qa.mdx` so current readers are not pointed at retired browser-smoke wording.
- [x] 2026-04-24 EDT: Verified the active-doc retired-surface grep returns no matches for the targeted active docs and public docs.
- [x] 2026-04-24 EDT: Completed the Codex release reset Program and moved it to `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`.

## Surprises & Discoveries

The initial active-doc grep was already mostly clean. Remaining active-reader hits were wording issues rather than live command dependencies: `docs/release-workflow.md` still named stale historical `browser-smoke` contexts, `apps/web/content/docs/commands.mdx` said `release:proof` runs "browser smoke", `apps/web/content/docs/clerk-convex-auth.mdx` used "local browser smoke" for the Playwright local-server bypass mode, and `apps/web/content/docs/local-qa.mdx` described the retired shallow lane.

`docs/archive/release-proof-runs/README.md` already clearly says the folder is historical release evidence. It does not need a new archive wrapper unless implementation finds a missing active link.

`docs/codex/` contains historical legacy plans and compatibility records, but the active `docs/index.md` does not route users there as current truth. This plan should not rewrite those historical files just to remove old words.

## Decision Log

Decision: Treat historical records as allowed to mention retired systems.
Rationale: Old changelog entries, completed ExecPlans, `docs/codex/`, and archived proof reports explain past work. Rewriting them to make search output clean would destroy useful history.
Date: 2026-04-24

Decision: Keep Plan 9 docs-only unless a stale active reference blocks final consistency.
Rationale: Implementation code, release workflows, GitHub templates, and proof commands were already handled by earlier Program children.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is complete. Active docs no longer instruct contributors or agents to use retired QA, helper CLI, browser-smoke, run-pack, or inventory surfaces as current truth. Historical archives remain intact, including `docs/archive/release-proof-runs/` and `docs/codex/`.

The Codex release reset Program moved to `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`. The active and completed Program indexes now reflect that move. The separate release-intake repair plan remains active at `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`, but it is outside this Program's completed release-reset scope.

## Context and Orientation

The active documentation spine starts at `README.md`, `AGENTS.md`, and `docs/index.md`. The main cross-cutting docs for this slice are `docs/ARCHITECTURE.md`, `docs/RELIABILITY.md`, `docs/release-workflow.md`, `docs/design-docs/scripts.md`, and `docs/internal/observability.md`. Public app docs live under `apps/web/content/docs`. GitHub-agent policy now lives at `.github/codex/release-policy.md`.

Historical evidence and legacy planning archives are different from active docs. `docs/archive/release-proof-runs/` stores historical release proof reports moved from the old QA runs folder. `docs/codex/` stores legacy planning records. Completed ExecPlans and changelog entries can describe retired systems as history. Active docs should not instruct current users to run retired commands or treat retired folders as current authority.

The active Program is `docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md`. Its current pointer is `docs/programs/completed/2026-04-24-sbs-codex-release-reset/current-planning-brief.txt`, which should name `planning-brief-9.md`. Program indexes live at `docs/programs/active/index.md` and `docs/programs/completed/index.md`.

### In Scope

In scope is updating active docs and active public docs so current instructions no longer use retired wording such as helper CLI, QA control plane, QA run-pack, browser-smoke, or stale transitional proof wording. In scope is preserving historical context in `docs/release-workflow.md` only when it is explicitly historical. In scope is updating archive entrypoint wording if needed so `docs/archive/release-proof-runs/` is clearly historical.

In scope is completing this Program if validation proves the active docs and indexes are truthful. Completing the Program means updating `program.md`, moving the Program folder from `docs/programs/active/` to `docs/programs/completed/`, updating active and completed Program indexes, and validating the Program packet.

### Out Of Scope

Out of scope is changing application code, source tests, release scripts, workflow mechanics, live GitHub policy, GitHub templates, issue labels, or Codex policy automation unless a stale docs reference in one of those files blocks final consistency.

Out of scope is repairing `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`. That plan remains separate. Out of scope is rewriting old changelog entries, completed ExecPlans, `docs/codex/` historical files, or archived proof reports merely to remove historical mentions of retired systems.

## Plan of Work

Start with the active-doc grep. Search only active docs, public docs, and GitHub policy surfaces for retired terms. Classify each match as active stale wording, historical context that is still useful, or archival content intentionally excluded from cleanup.

Then update active stale wording. Prefer precise current language: "hosted browser proof" instead of "browser smoke", "retired shallow browser proof lane" only when explaining history, "release-owned proof commands" instead of QA pack/run-pack language, and "historical release proof reports" instead of QA runs.

Then inspect archive and Program entrypoints. If `docs/archive/release-proof-runs/README.md` is already clear, leave it alone. If the active Program is eligible to close, update its status and retrospective, move the folder to `docs/programs/completed/`, and update both Program indexes.

Finally validate. Run active grep, markdown lint for touched docs, plan lint, Program lint, and diff hygiene. If moving the Program breaks links or indexes, repair them before claiming completion.

## Milestones

Milestone 1 writes and validates this ExecPlan. At the end, the plan is lint-clean and contains the active-doc audit scope.

Milestone 2 cleans active stale wording. At the end, active docs no longer tell current readers to use retired QA, CLI, browser-smoke, or transitional proof surfaces. Success is proven by an active-doc grep whose remaining matches are either zero or explicitly historical.

Milestone 3 closes archive and Program entrypoints. At the end, archive evidence remains findable, Program indexes are accurate, and the Program either moves to completed or records why it must stay active. Success is proven by Program lint.

Milestone 4 validates final docs cleanup. At the end, markdown lint, plan lint, Program lint, active grep, and diff hygiene pass.

## Concrete Steps

1. Confirm the Program pointer and dirty tree:

       cd /Users/parkerrex/Developer/ship-by-sunday
       test "$(cat docs/programs/completed/2026-04-24-sbs-codex-release-reset/current-planning-brief.txt)" = "planning-brief-9.md"
       git status --short --branch

   Expect a large dirty tree from prior Program slices. Do not revert unrelated changes.

2. Run the active-doc audit:

       rg -n "qa:|qa/|qa_control_plane|browser-smoke|browser smoke|helper CLI|ship-by-sunday-cli|sbs:|bin/sbs|qa-team|QA control plane|canonical QA|run-pack|test-inventory|coverage.csv|journeys.csv" README.md AGENTS.md docs/index.md docs/ARCHITECTURE.md docs/RELIABILITY.md docs/release-workflow.md docs/design-docs/scripts.md docs/internal apps/web/content/docs .github/codex --glob '!docs/archive/**' --glob '!docs/codex/**' --glob '!docs/exec-plans/**' --glob '!docs/programs/**' --glob '!docs/ship-by-sunday/**'

   Expected starting observation: only a small number of active wording hits remain, mostly around browser-smoke terminology.

3. Edit active stale docs. Likely files are:

       docs/release-workflow.md
       apps/web/content/docs/commands.mdx
       apps/web/content/docs/clerk-convex-auth.mdx
       apps/web/content/docs/local-qa.mdx

   Replace current-facing "browser smoke" wording with "hosted browser proof", "local Playwright check", or another accurate current phrase. Keep historical notes only when they clearly explain stale external contexts.

4. Inspect archive and Program entrypoints:

       sed -n '1,120p' docs/archive/release-proof-runs/README.md
       sed -n '1,180p' docs/programs/active/index.md
       sed -n '1,180p' docs/programs/completed/index.md

   If the archive README is already historical and clear, do not churn it.

5. If active-doc validation is clean and no Program blocker remains, complete the Program. Update `docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md` to `status: complete`, fill `completed_at`, write a final retrospective, then move the folder to `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`. Update `docs/programs/active/index.md` and `docs/programs/completed/index.md`.

6. Validate:

       rg -n "qa:|qa/|qa_control_plane|browser-smoke|browser smoke|helper CLI|ship-by-sunday-cli|sbs:|bin/sbs|qa-team|QA control plane|canonical QA|run-pack|test-inventory|coverage.csv|journeys.csv" README.md AGENTS.md docs/index.md docs/ARCHITECTURE.md docs/RELIABILITY.md docs/release-workflow.md docs/design-docs/scripts.md docs/internal apps/web/content/docs .github/codex --glob '!docs/archive/**' --glob '!docs/codex/**' --glob '!docs/exec-plans/**' --glob '!docs/programs/**' --glob '!docs/ship-by-sunday/**'
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md README.md AGENTS.md docs/index.md docs/ARCHITECTURE.md docs/RELIABILITY.md docs/release-workflow.md docs/design-docs/scripts.md docs/internal apps/web/content/docs .github/codex docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/programs/active/index.md docs/programs/completed/index.md
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md
       bun run programs:lint
       git diff --check -- README.md AGENTS.md docs apps/web/content/docs .github/codex

   If the Program is moved to completed, update the plan path in the validation commands before final lint reruns.

## Validation and Acceptance

This slice is accepted when active docs no longer instruct contributors or agents to use retired QA, helper CLI, browser-smoke, run-pack, or QA inventory surfaces as current truth. Historical archive records may still mention those systems. The release model should be discoverable from active docs: `dev` for feature integration, `main` for production, hotfixes from `main`, required `static` and `integration`, release tags through `release.json`, and release-owned hosted proof.

The Codex release reset Program may close only if its active docs, current planning brief, completed child ExecPlans, Program indexes, and retrospective all describe the final state truthfully. If the separate release-intake repair plan remains active but does not block this Program's release reset goals, record that as separate work rather than blocking Program completion.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` after implementation:

       rg -n "qa:|qa/|qa_control_plane|browser-smoke|browser smoke|helper CLI|ship-by-sunday-cli|sbs:|bin/sbs|qa-team|QA control plane|canonical QA|run-pack|test-inventory|coverage.csv|journeys.csv" README.md AGENTS.md docs/index.md docs/ARCHITECTURE.md docs/RELIABILITY.md docs/release-workflow.md docs/design-docs/scripts.md docs/internal apps/web/content/docs .github/codex --glob '!docs/archive/**' --glob '!docs/codex/**' --glob '!docs/exec-plans/**' --glob '!docs/programs/**' --glob '!docs/ship-by-sunday/**'
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md README.md AGENTS.md docs/index.md docs/ARCHITECTURE.md docs/RELIABILITY.md docs/release-workflow.md docs/design-docs/scripts.md docs/internal apps/web/content/docs .github/codex
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md
       bun run programs:lint
       git diff --check -- README.md AGENTS.md docs apps/web/content/docs .github/codex

## Idempotence and Recovery

Docs edits are safe to rerun and inspect with `git diff`. If the active-doc grep returns a historical note that is useful, either reword it so it is clearly historical or exclude that archive path from the grep. Do not delete archive evidence to satisfy search. If Program movement breaks `programs:lint`, move the folder back or repair the active/completed indexes before continuing.

If final Program closure feels premature because the deferred release-intake repair plan blocks the release reset, keep the Program active and record the blocker in `program.md` and this ExecPlan. Do not claim the Program is complete without matching index and lint evidence.

## Artifacts and Notes

Initial active-doc grep hits:

       docs/release-workflow.md: historical stale browser context references
       apps/web/content/docs/commands.mdx: "browser smoke" wording for release proof
       apps/web/content/docs/clerk-convex-auth.mdx: "local browser smoke" wording for Playwright local-server mode
       apps/web/content/docs/local-qa.mdx: retired shallow browser smoke lane wording

Initial archive check:

       docs/archive/release-proof-runs/README.md already says the folder is historical release evidence.

Final validation receipts from 2026-04-24 EDT:

       rg active-doc retired-surface audit: passed with no matches
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md: passed
       bun run programs:lint: initially caught the completed Program `## Next Slice` wording requirement, then passed after the section was changed to start with "No required next slice remains."
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-final-docs-and-archive-cleanup.md README.md AGENTS.md docs/index.md docs/ARCHITECTURE.md docs/RELIABILITY.md docs/release-workflow.md docs/design-docs/scripts.md docs/internal apps/web/content/docs .github/codex docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/programs/active/index.md docs/programs/completed/index.md: passed
       git diff --check -- README.md AGENTS.md docs apps/web/content/docs .github/codex: passed

## Interfaces and Dependencies

`docs/release-workflow.md` owns release process truth. It may mention stale external contexts only as history and cleanup guidance.

`apps/web/content/docs` owns public-facing operator docs. These docs should use current proof names and avoid teaching retired internal surfaces.

`docs/archive/release-proof-runs/` owns historical release evidence. It is not an active proof command surface.

`docs/programs/completed/2026-04-24-sbs-codex-release-reset/` is the active Program packet until completion. If the Program closes, the entire folder must move to `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`, and indexes must move with it.
