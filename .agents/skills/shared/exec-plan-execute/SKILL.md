---
name: exec-plan-execute
description: Use after an ExecPlan has been written and grilled, when the user wants the plan implemented through a tight build-validate-update loop. Trigger for requests like "execute this ExecPlan", "implement this plan", "work through the active milestone", or "carry out this ExecPlan".
---

# ExecPlan Execute

Implement one approved ExecPlan through small validated slices while keeping the plan current as a living document.

This is the shared, human-facing execution skill for the ExecPlan workflow. It is for implementation from an approved plan, not for plan authoring or plan review.

## Use When

- the target ExecPlan already exists
- the plan has already been written and ideally grilled
- the user wants implementation rather than more planning
- the next move is to execute the active milestone in the plan

## Do Not Use When

- the plan does not exist yet
- the plan is still too weak or ambiguous to execute safely
- the user wants a plan written or grilled rather than implemented

If no plan exists yet, use `exec-plan-writer`. If the plan still needs a stress-test pass, use `exec-plan-griller` first.

## Required Inputs

- one target ExecPlan path
- the current working tree
- the plan's current active milestone and acceptance criteria

## Required Repo Reads

1. Read `AGENTS.md` first.
2. Read `docs/exec-plans/PLANS.md` next and use it as the maintenance contract.
3. Read the target ExecPlan carefully.
4. Gather only the code, tests, config, and docs needed for the active milestone and current slice.

## Execution Posture

Treat the ExecPlan as the source of truth for sequence and scope.

- Do not ask for "next steps" if the plan already provides them.
- Do not silently widen scope.
- Do not postpone failing validation to a later loop.
- If implementation changes scope or sequencing materially, update the plan first and then continue.

## Execution Loop

1. Identify the active milestone.
2. Choose the next smallest viable slice inside that milestone.
3. Gather only the context needed for that slice.
4. Implement the smallest complete change that advances the milestone.
5. Run the narrowest relevant validation immediately.
6. If validation fails, stop forward progress, diagnose the failure, repair it, and rerun validation before continuing.
7. If the slice succeeds, update the ExecPlan before moving on.
8. Repeat until the milestone is complete, the task is complete, or a real blocker remains.

## How To Choose The Next Slice

- Prefer the smallest slice that creates demonstrable progress and can be validated now.
- If a milestone contains multiple independent subtasks, do one at a time.
- If a slice would touch too many unrelated files before becoming testable, it is too large and must be split.
- If the milestone depends on a risky unknown and the plan calls for a spike first, do the spike first.

## Validation Rules

- Prefer narrow validation first, then broader validation.
- Run the milestone's explicit proof commands when they exist.
- If they do not exist, choose the smallest validation set that proves the slice works.
- Never claim success without stating what was actually verified.
- If a validation step cannot run, record exactly why.
- At each meaningful stopping point, re-read the target plan against `docs/exec-plans/PLANS.md` if the plan file changed.

## ExecPlan Maintenance Rules

Keep the plan current at every stopping point.

Update at least these sections when implementation changes reality:

- `Progress`
- `Surprises & Discoveries`
- `Decision Log`
- `Outcomes & Retrospective`
- `### In Scope`
- `### Out Of Scope`
- `### Test Commands`
- `Artifacts and Notes`
- `Interfaces and Dependencies`

Keep frontmatter honest:

- while the plan is still active, preserve `completed_at: null` and `post_build_recap: null`
- when the work is truly complete, fill `completed_at` and write a real `post_build_recap`

## Blocker Rules

- First try to unblock yourself from the repository, tests, logs, and existing code.
- If still blocked, update the ExecPlan with the blocker, what you tried, and the smallest proposed unblock.
- Ask the user only the minimum question needed to proceed.

## Completion Criteria

The task is complete only when:

- the ExecPlan's intended user-visible behavior is implemented
- the final validation set has run, or skipped checks are explicitly justified
- the ExecPlan is current
- `completed_at` is filled
- `post_build_recap` is non-empty
- remaining risks or follow-ups are clearly stated

## Summary At Stopping Points

At each meaningful stopping point, return:

- current milestone
- slice completed or attempted
- validations run and results
- ExecPlan sections updated
- exact next step

## Canonical References

- `docs/exec-plans/PLANS.md` is the authoritative plan contract
- `references/usage-template.md` contains the preferred invocation pattern for this skill
- `docs/prompts/exec-plan-execute.md` is the older prompt surface this skill was derived from
