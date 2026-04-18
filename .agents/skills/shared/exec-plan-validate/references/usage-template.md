# ExecPlan Validate Usage Template

Use this pattern after the ExecPlan has been implemented far enough that the intended behavior should now work.

```text
Validate this ExecPlan end to end.

Read `AGENTS.md`, `docs/exec-plans/PLANS.md`, and the target ExecPlan first. Extract the exact acceptance path to prove, run the narrowest deterministic checks first, then use the repo-owned launch and proof scripts to self-observe the live system. Capture concrete evidence, update the plan with the commands and artifacts you actually used, and say clearly whether the plan is now complete or must return to execution.

Target plan:
<target_execplan_path>
docs/exec-plans/active/2026-03-26-example-initiative.md
</target_execplan_path>

Optional validation focus:
<validation_focus>
Name the most important live path to prove, such as a runtime harness flow, dashboard proof, gateway interaction, or another user-visible acceptance path.
</validation_focus>
```
