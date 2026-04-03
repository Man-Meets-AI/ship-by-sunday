---
summary: "Migrate the canonical ExecPlan contract from docs/codex into .plans, update all active repo and shared automation callers, and preserve docs/codex as a legacy archive instead of the live write target."
read_when: "Open this when changing where ExecPlans are authored, shipped, validated, or launched from repo and home-level automation."
plan_status: done
---
# Move The ExecPlan Contract To .plans

This is a living execution plan for migrating the repository and shared automation from `docs/codex/` to `.plans/` as the canonical ExecPlan surface while keeping enough historical compatibility that completed records stay useful.

This ExecPlan must be maintained in accordance with `.plans/PLANS.md`.

## Purpose / Big Picture

After this change, every new ExecPlan in this repository should be written under `.plans/` instead of `docs/codex/`, and the canonical plan contract should live at `.plans/PLANS.md`. A fresh operator, a prompt-driven planning run, the packet-compiler starter snapshot, and the home-level `~/.codex` plus `~/.agents` automation should all agree on that location. Completed historical plan files under `docs/codex/` should remain as archival records rather than being bulk-rewritten. The change works when active callers no longer generate `docs/codex/...` plan paths, the repo ships `.plans/PLANS.md` instead of `docs/codex/PLANS.md`, and targeted grep plus tests show no live dependency left on the old location.

## Progress

- [x] 2026-04-03 11:02 EDT — Audited the current repo contract in `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `docs/codex/PLANS.md`, and the three ExecPlan prompts under `docs/prompts/`.
- [x] 2026-04-03 11:03 EDT — Audited packet-compiler snapshot and trace contracts in `packages/packet-compiler/src/repo-generation/customer-safe-snapshot-contract.ts`, `packages/packet-compiler/src/repo-generation/repo-download-source-contract.ts`, and their related tests.
- [x] 2026-04-03 11:08 EDT — Audited the home-level workflow callers in `~/.agents/src/workflows/execplan-feature-workflow`, `~/.agents/src/channels/telegram`, `~/.agents/docs/prompts`, `~/.agents/.codex/prompts`, and `~/.codex/agent-prompts`.
- [x] 2026-04-03 11:18 EDT — Confirmed the live repo contract is already migrated: `.plans/PLANS.md` exists, `docs/codex/PLANS.md` is already a legacy shim, the root agent docs already point new ExecPlans at `.plans/`, and the packet-compiler snapshot contracts and tests already ship `.plans/PLANS.md`.
- [x] 2026-04-03 11:45 EDT — Grilled this ExecPlan against the live repo and updated it to reflect the real remaining work instead of repeating already-complete repo-side migration steps.
- [x] 2026-04-03 11:31 EDT — Added the repo-owned `docs/prompts/execplan-outline-from-session.md` prompt and extended the packet-compiler Prompt Pack so the generated prompt tree now ships the full repo-owned `execplan-*` family.
- [x] 2026-04-03 11:38 EDT — Updated `~/.agents/src/workflows/execplan-feature-workflow/prompt-loader.ts` to load `docs/prompts/execplan-outline-from-session.md`, `execplan-writer.md`, `execplan-grill.md`, and `execplan-execution-loop.md` from the target repo.
- [x] 2026-04-03 11:44 EDT — Updated the shared Telegram launcher prompt text plus the stale `~/.agents` tests so they assert `.plans/*.md` paths and the real `ship-by-sunday` prompt filenames instead of the old `docs/codex` and `exec-plan-*` assumptions.
- [x] 2026-04-03 11:50 EDT — Validated the repo and shared workflow with targeted grep, packet-compiler tests, and `~/.agents` workflow plus Telegram tests. Active callers are aligned; remaining `docs/codex/*` hits are archive-only references.

## Surprises & Discoveries

The repo-side `.plans/` migration is already present in the live working tree. `.plans/PLANS.md` exists, `docs/codex/PLANS.md` is already a legacy shim, the root agent docs already teach `.plans/`, and the packet-compiler snapshot contracts and tests already ship `.plans/PLANS.md`. The real remaining risk is not in the repo contract anymore. It is in shared automation outside the repo.

The highest-risk remaining breakage is a prompt filename mismatch in `~/.agents`. `prompt-loader.ts` still tries to load `docs/prompts/exec-plan-writer.md`, `exec-plan-grill.md`, `exec-plan-execute.md`, and `exec-plan-outline-from-session.md`, but this repo owns `docs/prompts/execplan-writer.md`, `execplan-grill.md`, and `execplan-execution-loop.md`, and it does not yet ship any outline-distillation prompt file at all. If left unchanged, automated planning can still fail before writing a plan.

Two shared-workflow tests already prove the remaining drift. `~/.agents/src/workflows/execplan-feature-workflow/prompt-loader.test.ts` still feeds `docs/codex/...` and old prompt names, and `~/.agents/src/channels/telegram/launchers.test.ts` still asserts old plan paths and launcher text. Those tests must move with the runtime code or the workflow will remain incorrect for this repo.

The working tree already contains unrelated edits in some files this slice touches. Implementation must preserve those unrelated changes and avoid opportunistic rewrites of archival `docs/codex/*.md` records.

The shared Telegram tests had one extra stale expectation beyond the path migration: they still used `/claim chat` even though the live topic kinds are now `task`, `plan`, `feed`, and `ops`. Updating the `.plans` flow surfaced that drift and the fix stayed safely inside the test fixture layer.

## Decision Log

Decision: Treat `.plans/` as the only canonical location for new ExecPlans, but keep `docs/codex/` as a legacy archive for completed plan records.  
Rationale: This gives future planning runs one clear path without turning a contract migration into a large provenance rewrite.  
Date/Author: 2026-04-03 / Codex

Decision: Do not bulk-move or bulk-rewrite existing dated plan files in `docs/codex/` in this slice.  
Rationale: Those files are historical implementation records, many other records point at them, and rewriting them would create high-noise churn with little operator value.  
Date/Author: 2026-04-03 / Codex

Decision: Keep the existing `docs/codex/PLANS.md` legacy shim in place for now.  
Rationale: Historical plans and QA notes reference that path directly, and the shim no longer acts as a live contract or shipped starter artifact.  
Date/Author: 2026-04-03 / Codex

Decision: Treat the live repo contract as the baseline and do not reopen it in this slice.  
Rationale: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.plans/PLANS.md`, and the packet-compiler snapshot contracts already point at `.plans/`. Reworking those files again would add churn while hiding the real remaining runtime mismatch in `~/.agents`.  
Date/Author: 2026-04-03 / Codex

Decision: Make the repo own the outline-distillation prompt as part of the same prompt family, using the `execplan-*` naming convention already present in `docs/prompts/`.  
Rationale: The shared workflow already expects a repo-owned outline prompt. Adding `docs/prompts/execplan-outline-from-session.md` keeps repo prompt ownership consistent instead of baking more `~/.agents`-local prompt assumptions into the runtime path.  
Date/Author: 2026-04-03 / Codex

Decision: Extend the packet-compiler Prompt Pack to ship the new `execplan-outline-from-session.md` prompt.  
Rationale: Once the repo owns the full ExecPlan prompt family, the generated docs tree and Prompt Pack should expose the same source of truth instead of omitting the first planning step.  
Date/Author: 2026-04-03 / Codex

Decision: Update shared workflow callers and tests after confirming the repo's prompt filenames, not before.  
Rationale: The source of truth for prompt filenames should live in the repo. The shared workflow must adapt to that source of truth rather than preserve older hyphenated prompt names.  
Date/Author: 2026-04-03 / Codex

## Outcomes & Retrospective

Final outcome: the live repo and shared planning automation now agree on `.plans/` and the repo-owned `execplan-*` prompt family. `ship-by-sunday` now ships `docs/prompts/execplan-outline-from-session.md` alongside the existing writer, grill, and execution-loop prompts, the packet-compiler Prompt Pack includes that new outline prompt, `~/.agents` loads the real repo prompt filenames, and the relevant shared-workflow tests pass against the actual `ship-by-sunday` repo shape. The remaining `docs/codex/*` hits are explicit archive references such as the legacy shim and archive-exclusion rules, not active plan-generation callers.

## Context and Orientation

The live repo contract already points at `.plans/`. `.plans/PLANS.md` is the active ExecPlan contract, `docs/codex/PLANS.md` is a legacy shim, the root instruction surfaces in `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` already direct new plans into `.plans/`, and the packet-compiler snapshot and trace contracts already ship `.plans/PLANS.md` while excluding `.plans/**` history and `docs/codex/**` archive content from starter output.

The remaining breakage sits in the shared workflow repo under `~/.agents`. `~/.agents/src/workflows/execplan-feature-workflow/manifest.ts` and `cli.ts` still define the generated path shape and validator behavior, so they must agree on `.plans/YYYY-MM-DD-<slug>.md`. `~/.agents/src/workflows/execplan-feature-workflow/prompt-loader.ts` resolves the repo prompt filenames that automation loads from the target repo. `~/.agents/src/workflows/execplan-feature-workflow/outline-distiller.ts` and `service.ts` both depend on the `outlineFromSession` prompt key, so a missing repo-owned outline prompt is a real runtime failure, not a theoretical cleanup item.

The target repo currently ships `docs/prompts/execplan-writer.md`, `docs/prompts/execplan-grill.md`, and `docs/prompts/execplan-execution-loop.md`. It does not currently ship `docs/prompts/execplan-outline-from-session.md`. The shared workflow still assumes the older hyphenated prompt names `exec-plan-writer.md`, `exec-plan-grill.md`, `exec-plan-execute.md`, and `exec-plan-outline-from-session.md`. The most important task in this slice is to reconcile that filename and ownership mismatch.

`~/.agents/src/channels/telegram/launchers.ts` exposes the plan path and starter instructions to operators. Its tests under `~/.agents/src/channels/telegram/launchers.test.ts` and `poller.test.ts` still assert `docs/codex/...` and older prompt names. `~/.agents/src/workflows/execplan-feature-workflow/prompt-loader.test.ts` also needs to be updated so the workflow proves prompt rendering against `/Users/parkerrex/Projects/ship-by-sunday` and not just against `~/.agents`-local assumptions.

Historical plan files in `docs/codex/*.md`, dated lines in `todo.md`, and some QA records in `qa/reviews/local/*.md` still point at `docs/codex/*`. In this slice, those are archive records. They should not be rewritten unless one of them is still an active operator surface.

## Plan of Work

Start from the current repo baseline instead of reopening already-complete repo contract work. Verify that `.plans/PLANS.md`, the root agent docs, and the packet-compiler snapshot rules remain correct and leave them unchanged unless validation later proves otherwise.

Next, close the prompt filename gap. Add a repo-owned `docs/prompts/execplan-outline-from-session.md` prompt so the repo owns the full ExecPlan prompt family. Then update `~/.agents/src/workflows/execplan-feature-workflow/prompt-loader.ts` so it resolves the repo's real prompt filenames: `execplan-outline-from-session.md`, `execplan-writer.md`, `execplan-grill.md`, and `execplan-execution-loop.md`.

After the prompt loader matches the repo, update the rest of the shared workflow callers. Change `manifest.ts`, `cli.ts`, `README.md`, `launchers.ts`, and any mirrored prompt docs so every active plan path is `.plans/YYYY-MM-DD-<slug>.md`, every operator-facing instruction says to read `.plans/PLANS.md`, and no runtime path expects `docs/codex/...` or hyphenated repo prompt filenames.

Then move the stale tests with the runtime code. Update `prompt-loader.test.ts`, `launchers.test.ts`, `topic-registry.test.ts`, and any affected `poller.test.ts` or `grill-loop.test.ts` fixtures so they assert `.plans/...` plan paths and the actual `ship-by-sunday` repo prompt layout. Add or tighten one explicit prompt-rendering test that proves the shared workflow can render prompts against `/Users/parkerrex/Projects/ship-by-sunday`.

Finish with targeted grep and test validation in both repos. If a remaining `docs/codex/*` hit is still present, either remove it or explicitly classify it as archive-only in this plan before concluding the work is complete.

## Milestones

### Milestone 1: Confirm the repo baseline and preserve it

At the end of this milestone, the implementer has verified that the in-repo contract is already migrated and does not accidentally undo it while patching the shared workflow. The touched files should be minimal, ideally only this plan if the baseline is already correct. Success looks like `.plans/PLANS.md`, `docs/codex/PLANS.md`, the root agent docs, and the packet-compiler snapshot rules being consciously treated as the fixed baseline for the remaining work.

Run the baseline check from the repo root:

    cd /Users/parkerrex/Projects/ship-by-sunday
    rg -n "docs/codex|\\.plans" AGENTS.md CLAUDE.md GEMINI.md .plans/PLANS.md docs/codex/PLANS.md packages/packet-compiler/src/repo-generation packages/packet-compiler/tests

Successful output should show `.plans/` as the live location and `docs/codex/PLANS.md` only as a legacy shim or archive exclusion rule.

### Milestone 2: Resolve prompt filename and outline prompt ownership

At the end of this milestone, the target repo owns a complete ExecPlan prompt family and the shared workflow knows how to load it. The touched files are `docs/prompts/execplan-outline-from-session.md`, `~/.agents/src/workflows/execplan-feature-workflow/prompt-loader.ts`, and any small companion updates required by the prompt key mapping.

Run a repo-shaped prompt check:

    cd /Users/parkerrex/Projects/ship-by-sunday
    ls docs/prompts
    cd /Users/parkerrex/.agents
    bun test src/workflows/execplan-feature-workflow/prompt-loader.test.ts

Success looks like the shared workflow resolving `docs/prompts/execplan-outline-from-session.md`, `execplan-writer.md`, `execplan-grill.md`, and `execplan-execution-loop.md` against this repo without falling back to older hyphenated names.

### Milestone 3: Update shared workflow callers and stale tests

At the end of this milestone, the shared runtime code, launcher text, mirrored prompt docs, and tests all use `.plans/*.md` and the real repo prompt filenames. The touched files include `~/.agents/src/workflows/execplan-feature-workflow/manifest.ts`, `cli.ts`, `README.md`, `~/.agents/src/channels/telegram/launchers.ts`, `~/.agents/src/channels/telegram/launchers.test.ts`, `~/.agents/src/channels/telegram/topic-registry.test.ts`, any affected `poller.test.ts` fixtures, `~/.agents/src/workflows/execplan-feature-workflow/grill-loop.test.ts`, `~/.agents/docs/prompts/*`, `~/.agents/.codex/prompts/*`, and `~/.codex/agent-prompts/*`.

Run targeted shared-workflow tests:

    cd /Users/parkerrex/.agents
    bun test src/workflows/execplan-feature-workflow src/channels/telegram

Success looks like plan path generation, CLI validation, launcher prompt text, and test fixtures all matching `.plans/...` and the repo's `execplan-*` prompt family.

### Milestone 4: Final dangling-reference sweep and acceptance proof

At the end of this milestone, all active repo and home-level callers agree on `.plans/`, the repo and automation tests pass, and any remaining `docs/codex/*` hits are consciously retained archival records only. The touched files are limited to whichever validation-unblocking fixes remain after the previous milestones.

Run the final sweep:

    cd /Users/parkerrex/Projects/ship-by-sunday
    rg -n "docs/codex/PLANS\\.md|docs/codex/|\\.codex/plans" .
    rg -n "docs/codex/PLANS\\.md|docs/codex/|\\.codex/plans" /Users/parkerrex/.agents /Users/parkerrex/.codex

Success looks like every remaining hit being either a deliberate archive record or a compatibility note that is explicitly documented in `Decision Log` and `Artifacts and Notes`.

## Concrete Steps

Begin by freezing the repo baseline instead of reopening it:

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,220p' .plans/PLANS.md
    sed -n '1,120p' docs/codex/PLANS.md
    rg -n "docs/codex|\\.plans" AGENTS.md CLAUDE.md GEMINI.md docs/prompts packages/packet-compiler/src/repo-generation packages/packet-compiler/tests

Record any unexpected repo-side drift in this plan before changing the shared workflow.

Then add the missing repo-owned outline prompt:

    cd /Users/parkerrex/Projects/ship-by-sunday
    ls docs/prompts

Create `docs/prompts/execplan-outline-from-session.md` using the same repo naming convention as the existing `execplan-*` prompt files.

Update the shared prompt loader next:

    cd /Users/parkerrex/.agents
    sed -n '1,200p' src/workflows/execplan-feature-workflow/prompt-loader.ts
    sed -n '1,200p' src/workflows/execplan-feature-workflow/outline-distiller.ts
    sed -n '620,700p' src/workflows/execplan-feature-workflow/service.ts

Edit the prompt path map so the runtime loads the real prompt files from `ship-by-sunday`.

After the loader is correct, update the rest of the shared callers and tests:

    cd /Users/parkerrex/.agents
    rg -n "docs/codex/PLANS\\.md|docs/codex/|exec-plan-|execplan-outline-from-session|\\.plans/" src docs .codex

Edit runtime code, mirrored prompt docs, and test fixtures until they all reflect `.plans/` and the repo's actual prompt names.

Finish with a repo-shaped validation pass and preserve short proof snippets in `Artifacts and Notes`.

## Validation and Acceptance

The migration is accepted only when all of the following are true.

The live repo contract still points at `.plans/` and has not regressed while the shared workflow was patched. A newcomer reading `.plans/PLANS.md` sees `.plans/` as the live contract, and `docs/codex/PLANS.md` reads only as a legacy shim.

The target repo ships a complete ExecPlan prompt family under `docs/prompts/`, including `execplan-outline-from-session.md`, `execplan-writer.md`, `execplan-grill.md`, and `execplan-execution-loop.md`.

The shared `~/.agents` workflow can resolve those exact repo prompt filenames, validate `.plans/*.md` plan paths, and launch planning runs that point operators at `.plans/PLANS.md`. The relevant tests for `src/workflows/execplan-feature-workflow` and `src/channels/telegram` must pass from the `~/.agents` repo root.

There is at least one explicit validation that renders or loads prompts against `/Users/parkerrex/Projects/ship-by-sunday`, not just against `~/.agents`-local assumptions. `~/.agents/src/workflows/execplan-feature-workflow/prompt-loader.test.ts` and `~/.agents/src/channels/telegram/launchers.test.ts` must be updated and pass against the real repo shape.

Targeted grep across this repo, `~/.agents`, and `~/.codex` must show no active caller that still expects `docs/codex/PLANS.md`, writes new plans under `docs/codex/`, or loads outdated `exec-plan-*` repo prompt filenames. Any remaining hits must be explicitly identified as archive-only in `Artifacts and Notes` or `Decision Log`.

## Idempotence and Recovery

This migration is mostly textual and should be safe to rerun. Repeating the grep and test commands should converge on the same result. If `.plans/PLANS.md` already exists, diff it against the intended contract rather than recreating it blindly.

If repo validation passes but `~/.agents` validation fails, stop before declaring success. The partial state would leave the repo canonical but shared automation stale. Record the blocker in `Progress` and `Surprises & Discoveries`, then finish the automation patch before resuming normal plan generation.

If the compatibility shim at `docs/codex/PLANS.md` proves confusing or causes a snapshot regression, keep the live contract in `.plans/PLANS.md`, exclude the shim from shipped starter output, and reduce the shim to the smallest redirect note possible. Do not restore `docs/codex/` as an active authoring target.

If the shared workflow starts passing its own tests but still fails to load prompts from `/Users/parkerrex/Projects/ship-by-sunday`, stop and fix the target-repo prompt path assumptions before moving on. A green `~/.agents` test run is not enough unless one of the tests explicitly exercises this repo shape.

If unrelated working-tree edits conflict with the files touched in this slice, re-read the current working-tree version, preserve the unrelated changes, and apply only the smallest path-contract edits needed for the migration.

## Artifacts and Notes

Repo-side baseline already complete:

    .plans/PLANS.md
    docs/codex/PLANS.md
    AGENTS.md
    CLAUDE.md
    GEMINI.md
    docs/prompts/execplan-writer.md
    docs/prompts/execplan-grill.md
    docs/prompts/execplan-execution-loop.md
    packages/packet-compiler/src/repo-generation/customer-safe-snapshot-contract.ts
    packages/packet-compiler/src/repo-generation/repo-download-source-contract.ts
    packages/packet-compiler/tests/repo-generation.test.ts
    packages/packet-compiler/tests/customer-safe-snapshot-contract.test.ts

Highest-risk remaining shared-workflow files:

    ~/.agents/src/workflows/execplan-feature-workflow/prompt-loader.ts
    ~/.agents/src/workflows/execplan-feature-workflow/outline-distiller.ts
    ~/.agents/src/workflows/execplan-feature-workflow/service.ts
    ~/.agents/src/workflows/execplan-feature-workflow/manifest.ts
    ~/.agents/src/workflows/execplan-feature-workflow/cli.ts
    ~/.agents/src/workflows/execplan-feature-workflow/README.md
    ~/.agents/src/workflows/execplan-feature-workflow/prompt-loader.test.ts
    ~/.agents/src/workflows/execplan-feature-workflow/grill-loop.test.ts
    ~/.agents/src/channels/telegram/launchers.ts
    ~/.agents/src/channels/telegram/launchers.test.ts
    ~/.agents/src/channels/telegram/topic-registry.test.ts
    ~/.agents/src/channels/telegram/poller.test.ts
    ~/.agents/docs/prompts/*
    ~/.agents/.codex/prompts/*
    ~/.codex/agent-prompts/*

Required new repo prompt file:

    docs/prompts/execplan-outline-from-session.md

Expected archive-only areas after implementation:

    docs/codex/*.md
    qa/reviews/local/*.md that cite historical plan files
    todo.md dated entries that describe earlier contract locations

Validation proof recorded during completion:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun test packages/packet-compiler/tests/packet-renderers.test.ts packages/packet-compiler/tests/repo-generation.test.ts packages/packet-compiler/tests/customer-safe-snapshot-contract.test.ts
    6 pass
    0 fail

    cd /Users/parkerrex/.agents
    bun test src/workflows/execplan-feature-workflow/prompt-loader.test.ts src/workflows/execplan-feature-workflow/grill-loop.test.ts src/channels/telegram/launchers.test.ts src/channels/telegram/topic-registry.test.ts src/channels/telegram/poller.test.ts
    48 pass
    0 fail

Final targeted grep observations:

    repo active surfaces: only archive-intent mentions of `docs/codex/` remain in `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `docs/codex/PLANS.md`, and the packet-compiler exclusion rule for `docs/codex/**`
    shared workflow active surfaces: no remaining runtime or test callers load `docs/prompts/exec-plan-*` from `ship-by-sunday`, and no runtime callers generate new `docs/codex/*.md` plan paths

## Interfaces and Dependencies

`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.plans/PLANS.md`, and `docs/codex/PLANS.md` together define the live repo contract plus the archive shim. They are the baseline interfaces that must not regress.

`docs/prompts/execplan-writer.md`, `docs/prompts/execplan-grill.md`, `docs/prompts/execplan-execution-loop.md`, and the new `docs/prompts/execplan-outline-from-session.md` are the repo-owned prompt interfaces. Their filenames are part of the runtime contract because the shared workflow loads them directly from disk.

`packages/packet-compiler/src/repo-generation/customer-safe-snapshot-contract.ts` and `packages/packet-compiler/src/repo-generation/repo-download-source-contract.ts` define which root files ship into starter output and which paths are traced as source inputs. They already reflect `.plans/PLANS.md` and must remain aligned with the live repo contract while the shared workflow is patched.

`~/.agents/src/workflows/execplan-feature-workflow/prompt-loader.ts` is the prompt filename interface between the shared workflow and the target repo. `outline-distiller.ts` and `service.ts` depend on the `outlineFromSession` prompt key and therefore on the repo shipping a matching outline prompt file.

`~/.agents/src/workflows/execplan-feature-workflow/manifest.ts` defines the generated plan path convention. `~/.agents/src/workflows/execplan-feature-workflow/cli.ts` enforces the accepted plan path shape. `~/.agents/src/channels/telegram/launchers.ts` exposes both the plan path and the starter instructions to operators. Those three code paths are the hard runtime dependency chain for shared automation.

`~/.agents/src/workflows/execplan-feature-workflow/prompt-loader.test.ts`, `~/.agents/src/channels/telegram/launchers.test.ts`, `~/.agents/src/channels/telegram/topic-registry.test.ts`, `~/.agents/src/channels/telegram/poller.test.ts`, and `~/.agents/src/workflows/execplan-feature-workflow/grill-loop.test.ts` are the test interfaces that must prove the runtime assumptions match this repo's `.plans/` layout and `execplan-*` prompt family.

The prompt mirrors under `~/.agents/docs/prompts`, `~/.agents/.codex/prompts`, and `~/.codex/agent-prompts` must stay aligned with the repo contract or prompt-driven planning runs will reintroduce stale path or filename assumptions even after the runtime code is fixed.
