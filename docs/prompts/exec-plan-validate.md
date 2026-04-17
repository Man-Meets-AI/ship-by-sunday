# ExecPlan Validate

Use this after an ExecPlan has been executed far enough that the intended behavior should work, when the user wants repo-owned proof rather than more implementation.

## Preferred usage

Use this in normal agent mode after the main implementation loop.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/exec-plans/PLANS.md` next and use it as the maintenance contract.

Read this target ExecPlan carefully:
<target_execplan_path>
docs/exec-plans/active/2026-04-15-example-initiative.md
</target_execplan_path>

You are validating the plan against the real repository surfaces.

Validation loop:
1. Identify the exact acceptance path the plan says must be proven.
2. Run the narrowest deterministic checks first.
3. Use the repo-owned launch, smoke, or proof commands that already exist before inventing ad hoc shell state.
4. Compare the observed behavior with the ExecPlan acceptance criteria.
5. If proof fails because of a narrow issue, repair it and rerun proof.
6. Update the ExecPlan with the actual commands, outcomes, artifacts, and next step.

Rules:
- Do not substitute “tests passed” for end-to-end proof when the plan calls for user-visible behavior.
- Keep the validation diff scoped.
- If validation exposes materially incomplete implementation, return the work to execution and record the exact localized gap.

At each meaningful stopping point, return:
- acceptance path attempted
- deterministic checks run and results
- proof commands run and results
- artifacts or failures observed
- ExecPlan sections updated
- exact next step
```
