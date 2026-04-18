# ExecPlan Execution Loop

Use this after the ExecPlan has been written and grilled. This is step 3 in the workflow: execute the plan through a tight implementation loop that stays scoped, validates constantly, and keeps the plan current as a living document.

## Why this prompt exists

The OpenAI-aligned execution pattern is:

1. Read the repo instructions first.
2. Read the execution-plan contract.
3. Read the target ExecPlan.
4. Identify the active milestone.
5. Make the smallest viable scoped change that advances that milestone.
6. Run validation immediately.
7. Stop and fix failures before moving on.
8. Update the living plan with progress, discoveries, decisions, and next steps.
9. Repeat until the milestone or task is complete.

## Preferred usage

Use this in normal agent mode, not plan mode.

```text
Execute this ExecPlan.
```

Then paste the prompt below and set the target plan path.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/exec-plans/PLANS.md` next and use it as the contract for how ExecPlans are authored and maintained.

Read this target ExecPlan carefully:
<target_execplan_path>
docs/exec-plans/active/example-initiative.md
</target_execplan_path>

You are in execution mode. Implement the plan.

Before making changes:
- Inspect only the code, tests, config, and docs needed for the active milestone.
- Confirm the active milestone from the ExecPlan.
- If the plan is too broad at the current step, narrow it by choosing the smallest complete slice that can be validated immediately after implementation.

Execution loop:
1. Identify the current active milestone and the next smallest viable scoped change within it.
2. Gather only the context required for that slice.
3. Implement the smallest complete slice that satisfies part or all of the milestone acceptance criteria.
4. Run the narrowest relevant validation commands immediately.
5. If validation fails:
   - stop forward progress,
   - diagnose the failure,
   - repair the failure,
   - rerun validation,
   - only then continue.
6. If the slice succeeds, update the ExecPlan before moving on.
7. Repeat until the milestone is complete, the task is complete, or you hit a real blocker that the repo and plan cannot resolve.

Core rules:
- Keep diffs tightly scoped to the active milestone.
- Prefer additive, reversible changes when uncertainty is high.
- Do not silently expand scope.
- Do not postpone failing validations to a later loop.
- Do not ask for “next steps” if the plan already provides them.
- If a better approach materially changes scope or sequencing, update the ExecPlan first, then continue.
- If a question can be answered by exploring the repo, answer it from the repo instead of asking me.
- Ask me only when a blocker cannot be resolved from the plan or the codebase and the choice would materially change the outcome.

Validation rules:
- Prefer narrow validation first, then broader validation.
- Run the milestone’s explicit validation commands when they exist.
- If they do not exist, choose the smallest validation set that proves the slice works.
- Never claim success without stating what was actually verified.
- If a validation step cannot run, record exactly why.
- Where practical, capture short expected or observed transcripts that prove the slice worked.

ExecPlan maintenance rules:
- Keep `Progress` current at every stopping point.
- Add discoveries to `Surprises & Discoveries` when implementation reveals new facts.
- Record scope or design choices in `Decision Log` with rationale.
- Update `Outcomes & Retrospective` when a milestone completes or when a meaningful lesson emerges.
- Update any command examples, validation notes, or recovery notes that changed during implementation.
- Update `Artifacts and Notes` with concise proof snippets when they materially help the next contributor.
- Update `Interfaces and Dependencies` if implementation changes the required modules, services, types, or signatures.
- The ExecPlan must remain sufficient for a fresh coding agent to resume from the file alone.

How to choose the next slice:
- Prefer the smallest slice that creates demonstrable progress and can be validated now.
- If a milestone contains multiple independent subtasks, take one at a time.
- If the milestone depends on a risky unknown, implement a prototype or spike first if the ExecPlan calls for it.
- If a slice would touch too many unrelated files before becoming testable, it is too large; split it.

When blocked:
- First try to unblock yourself from the repository, tests, logs, and existing code.
- If still blocked, update the ExecPlan with the blocker, what you tried, and the smallest proposed unblock.
- Then ask me only the minimum question needed to proceed.

Progress update behavior:
- Give short, high-signal progress updates at major phase changes.
- Before edits, say what slice you are about to implement.
- After validation, say what passed, what failed, and what you will do next.

Completion rules:
- A milestone is complete only when its acceptance criteria are met and its validation passes or skipped checks are explicitly justified.
- The task is complete only when the ExecPlan’s intended user-visible behavior is implemented, the final validation set has run, the ExecPlan is current, and remaining risks or follow-ups are clearly stated.

Output behavior:
- Start by naming the active milestone and the first smallest viable slice you will implement.
- Then execute the loop.
- At the end of each meaningful stopping point, return:
  - current milestone
  - slice completed or attempted
  - validations run and results
  - ExecPlan sections updated
  - exact next step
```
