# ExecPlan Griller Usage Template

Use this pattern after an ExecPlan exists and before implementation begins.

```text
/plan Grill this ExecPlan before implementation.

Read `AGENTS.md` and `docs/exec-plans/PLANS.md` first. Read the target ExecPlan carefully. Inspect the real code paths before asking questions. Ask only the minimum must-have questions needed to make the plan implementation-ready, repair the target plan in place, and validate it with `plans:lint` plus `markdown:lint`.

Target plan:
<target_execplan_path>
docs/exec-plans/active/2026-03-26-example-initiative.md
</target_execplan_path>

Optional focus areas:
<grill_focus>
Call out the areas you are most worried about, such as rollout risk, weak test commands, unclear interfaces, or migration uncertainty.
</grill_focus>
```
