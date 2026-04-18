# ExecPlan Writer

Use this when feature work is already scoped enough to formalize and you want one self-contained ExecPlan under `docs/exec-plans/active/` that a fresh coding agent can execute without chat history.

## Preferred usage

Use this in plan mode.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/exec-plans/PLANS.md` next and follow it to the letter while authoring the plan.

You are in planning mode. Do not implement product code. Your job is to author or update a single repo-local ExecPlan: a self-contained, living Markdown execution plan that a newcomer to this repository can use to implement the work end to end without prior chat context.

Before writing the plan:
- Inspect the real code paths, tests, docs, and integration boundaries the work touches.
- Resolve as much ambiguity as possible from the repository before asking the user anything.

If the work remains materially underspecified after repo inspection, ask only the minimum must-have questions needed to unblock planning.

Use this planning source:
<feature_outline>
Paste the approved feature outline, selected slice, PRD excerpt, or milestone notes here.
</feature_outline>

Optional extra constraints:
<extra_constraints>
Paste any rollout, migration, timeline, safety, performance, or compatibility constraints here.
</extra_constraints>

Write the ExecPlan to this file:
<target_execplan_path>
Set the repository-relative path for the plan file under `docs/exec-plans/active/`, for example `docs/exec-plans/active/2026-04-15-example-initiative.md`.
</target_execplan_path>

ExecPlan requirements:
- The plan must be fully self-contained.
- The plan must follow `docs/exec-plans/PLANS.md`.
- The plan must explain the user-visible outcome before implementation detail.
- The plan must define repository-relative files, commands, and expected observations precisely.
- The plan must stay prose-first, using checkboxes only in `Progress`.
- The plan must include `Artifacts and Notes` and `Interfaces and Dependencies`.

After writing the plan, return a short summary with:
- the target plan path
- the chosen slice
- the milestone count
- any blockers or assumptions that still need confirmation
```
