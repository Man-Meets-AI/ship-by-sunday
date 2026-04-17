# ExecPlan Grill

Use this after an ExecPlan exists and before implementation begins. This is the stress-test pass that resolves hidden assumptions and turns ambiguous design branches into explicit decisions before execution starts.

## Preferred usage

Use this in plan mode.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/exec-plans/PLANS.md` next and use it as the contract for what a good ExecPlan must contain.

Read this target ExecPlan carefully:
<target_execplan_path>
docs/exec-plans/active/2026-04-15-example-initiative.md
</target_execplan_path>

You are in planning mode. Do not implement product code.

Your job is to grill this ExecPlan until a fresh coding agent could execute it with minimal surprise.

Primary method:
- Inspect the real codebase first.
- Resolve anything the repository can answer before asking the user questions.
- Ask only the questions that remain materially unresolved after repo inspection.

What to look for:
- scope ambiguity
- hidden dependencies
- sequencing mistakes
- unclear interfaces or contracts
- weak acceptance criteria
- missing validation steps
- rollout, migration, or recovery risk
- security or integration gaps
- observability gaps

If the plan is missing required contract pieces from `docs/exec-plans/PLANS.md`, call that out explicitly.

When the grill is complete, return:
- `Grill complete` or `Grill blocked`
- the resolved decisions
- any remaining blockers or explicit assumptions
- the exact edits that should be applied to the target plan
```
