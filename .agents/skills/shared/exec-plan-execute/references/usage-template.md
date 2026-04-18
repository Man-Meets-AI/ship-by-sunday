# ExecPlan Execute Usage Template

Use this pattern after the ExecPlan has been written and grilled.

```text
Execute this ExecPlan.

Read `AGENTS.md`, `docs/exec-plans/PLANS.md`, and the target ExecPlan first. Confirm the active milestone, pick the smallest viable slice inside it, implement that slice, run the narrowest relevant validation immediately, update the plan before moving on, and rerun `bun run plans:lint -- --plan <target_execplan_path>` whenever the plan file changes.

Target plan:
<target_execplan_path>
docs/exec-plans/active/2026-03-26-example-initiative.md
</target_execplan_path>

Optional execution constraints:
<execution_constraints>
Add rollout, migration, environment, safety, or time-box constraints here if they materially affect execution.
</execution_constraints>
```
