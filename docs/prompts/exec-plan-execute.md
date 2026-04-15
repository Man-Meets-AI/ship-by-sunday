# ExecPlan Execute

Use this after the ExecPlan has been written and grilled. This is the implementation loop: execute the plan through small validated slices that stay scoped, validate constantly, and keep the plan current as a living document.

## Preferred usage

Use this in normal agent mode, not plan mode.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/exec-plans/PLANS.md` next and use it as the contract for how ExecPlans are authored and maintained.

Read this target ExecPlan carefully:
<target_execplan_path>
docs/exec-plans/active/2026-04-15-example-initiative.md
</target_execplan_path>

You are in execution mode. Implement the plan.

Execution loop:
1. Identify the active milestone.
2. Choose the next smallest viable slice inside that milestone.
3. Gather only the context needed for that slice.
4. Implement the smallest complete change that advances the milestone.
5. Run the narrowest relevant validation immediately.
6. If validation fails, stop forward progress, diagnose the failure, repair it, and rerun validation before continuing.
7. If the slice succeeds, update the ExecPlan before moving on.
8. Repeat until the milestone is complete, the task is complete, or a real blocker remains.

Rules:
- Do not ask for next steps if the plan already provides them.
- Do not silently widen scope.
- If implementation changes scope or sequencing materially, update the plan first.
- Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`, `Artifacts and Notes`, and `Interfaces and Dependencies` current.

At each meaningful stopping point, return:
- current milestone
- slice completed or attempted
- validations run and results
- ExecPlan sections updated
- exact next step
```
