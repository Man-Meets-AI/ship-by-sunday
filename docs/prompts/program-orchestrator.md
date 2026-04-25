---
title: 'Program Orchestrator'
summary: 'Prompt asset for deciding the next correct Program Funnel or Program Loop step from checked-in artifact state.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Resuming an existing Program without knowing which prompt should run next.'
  - 'Checking whether a Program should continue funneling, write a child ExecPlan, refresh, or complete.'
---

# Program Orchestrator

Use this when the current Program state is unclear. It is the routing prompt for the whole Program system.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, `docs/exec-plans/PLANS.md`, and `docs/prompts/README.md`.

You are routing one Program to the next correct prompt. Do not implement product code. Do not rewrite artifacts unless the minimum repair is required to make state classification possible.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Optional latest context:
<latest_context>
Paste any recent validation summary, child ExecPlan path, PR note, or operator instruction here.
</latest_context>

Inspect:
- the Program root contents
- `program.md`, if it exists
- every `planning-brief-*.md`
- `current-planning-brief.txt`, if it exists
- linked active or completed child ExecPlans
- relevant git status for touched Program and ExecPlan files

State classification:
- `initialize`: the Program root or skeleton is missing
- `research`: source research passes are missing or too rough to trust
- `normalize`: at least one research pass lacks a normalized pass
- `converge`: normalized passes exist but `converged-decision-packet.md` is missing or stale
- `order`: the decision packet exists but `dependency-graph.md` is missing or stale
- `split`: the dependency graph exists but `plan-split-recommendation.md` is missing or stale
- `review`: plan split exists but `cross-repo-review.md` is missing or stale
- `brief`: review exists but `planning-brief-1.md` or `current-planning-brief.txt` is missing or stale
- `program-doc`: packet artifacts exist but `program.md` is missing or stale
- `write-plan`: Program packet is valid and no child ExecPlan is active for the next slice
- `grill-plan`: a child ExecPlan exists but is not grilled enough for execution
- `execute-plan`: a grilled child ExecPlan exists and work remains
- `validate-plan`: implementation is claimed complete but receipts are missing or weak
- `docs-sync`: validation is complete but durable docs have not been synced
- `refresh`: docs are synced but the next planning brief has not been written
- `completion-review`: the latest planning brief and Program say no required next slice remains

Prompt routing:
- `initialize` -> `docs/prompts/program-initialize.md`
- `research` -> `docs/prompts/program-research-passes.md`
- `normalize` -> `docs/prompts/program-normalize-pass.md`
- `converge` -> `docs/prompts/program-converged-decision-packet.md`
- `order` -> `docs/prompts/program-dependency-graph.md`
- `split` -> `docs/prompts/program-plan-split-recommendation.md`
- `review` -> `docs/prompts/program-cross-repo-review.md`
- `brief` -> `docs/prompts/program-planning-brief.md`
- `program-doc` -> `docs/prompts/program-doc-synthesis.md`
- `write-plan` -> `docs/prompts/exec-plan-writer.md`
- `grill-plan` -> `docs/prompts/exec-plan-grill.md`
- `execute-plan` -> `docs/prompts/exec-plan-execute.md`
- `validate-plan` -> `docs/prompts/exec-plan-validate.md`
- `docs-sync` -> `docs/prompts/program-docs-sync.md`
- `refresh` -> `docs/prompts/program-planning-refresh.md`
- `completion-review` -> `docs/prompts/program-completion-review.md`

Rules:
- Prefer artifact evidence over chat memory.
- If two states seem possible, choose the earliest state whose output is missing, stale, or unvalidated.
- Do not skip validation, docs sync, or planning refresh just because implementation appears done.
- Do not advance to a child ExecPlan until `bun run programs:lint` can pass or the failure is explicitly unrelated to the Program being routed.
- Do not rewrite historical child ExecPlan `planning_brief` provenance.
- If the Program root is under `completed/`, do not route to a new child ExecPlan. Route only to completion audit or historical inspection.

Quality gate before returning:
- Confirm the selected state is backed by concrete files or missing files.
- Confirm the selected next prompt can run without chat history.
- Confirm no earlier required Program artifact remains missing.
- Confirm the route preserves immutable planning brief provenance.

Run:
- `bun run programs:lint`

Return:
- state classification
- next prompt path
- exact files that justify the route
- blocking missing artifacts, if any
- validation commands and results
```
