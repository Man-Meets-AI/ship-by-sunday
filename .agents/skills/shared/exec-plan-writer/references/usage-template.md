# ExecPlan Writer Usage Template

Use this pattern when the work is already approved enough to formalize into one plan file.

```text
/plan Write an ExecPlan for the approved work below.

Read `AGENTS.md` and `docs/exec-plans/PLANS.md` first. Inspect the real code paths before planning. If critical ambiguity remains after repo inspection, ask only the minimum must-have questions needed to unblock the plan.

Write the plan to:
<target_execplan_path>
docs/exec-plans/active/2026-03-26-example-initiative.md
</target_execplan_path>

Use this planning source:
<feature_outline>
Paste the approved feature outline, selected slice, PRD excerpt, or milestone notes here.
</feature_outline>

Optional constraints:
<extra_constraints>
Add rollout, migration, timeline, compatibility, safety, or stakeholder constraints here.
</extra_constraints>
```
