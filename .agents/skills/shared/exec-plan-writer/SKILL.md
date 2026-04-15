---
name: exec-plan-writer
description: Use when a task is approved and needs to be turned into one self-contained ExecPlan under docs/exec-plans, or when an existing ExecPlan needs to be repaired to match the PLANS.md contract. Trigger for requests like "write an exec plan", "turn this outline into an ExecPlan", "formalize this feature into a plan", or "fix this ExecPlan".
---

# ExecPlan Writer

Write or repair one repo-local ExecPlan that a fresh coding agent can execute without chat history.

This is the shared, human-facing skill for ExecPlan authoring.

## Use When

- the work is already approved or scoped enough to formalize
- the user wants a new ExecPlan under `docs/exec-plans/active/`
- an existing ExecPlan needs to be brought back into compliance with `docs/exec-plans/PLANS.md`
- a feature outline, PRD excerpt, or milestone notes need to become one self-contained execution plan

## Do Not Use When

- the request is still vague, disputed, or exploratory enough that it needs qualification first
- the user wants implementation rather than planning
- the task is a tiny one-step change that does not justify an ExecPlan

If the request is important but still too vague for direct planning, use `systems-workshop` first.

## Required Inputs

- one target plan path
- one planning source such as an approved outline, selected slice, PRD excerpt, or milestone notes
- any rollout, migration, safety, compatibility, or stakeholder constraints that materially change the plan

## Required Repo Reads

1. Read `AGENTS.md` first.
2. Read `docs/exec-plans/PLANS.md` next and treat it as the canonical contract.
3. Inspect the real code, docs, tests, and runtime surfaces the work touches before freezing the plan.
4. Read `docs/ARCHITECTURE.md` or `docs/design-docs/architecture.md` only if the plan changes durable architecture or repo-wide ownership boundaries.

## Procedure

1. Confirm the task is planning, not implementation.
2. Resolve as much ambiguity as possible from the repository before asking the user anything.
3. If critical ambiguity remains, switch into clarification mode and ask only the minimum must-have questions needed to unblock planning.
4. Otherwise, write or update exactly one ExecPlan file at the target path.
5. Preserve the target path. Do not rename, relocate, or split the plan unless the user explicitly asks for that.
6. Make the plan self-contained and novice-readable. Define terms of art or avoid them.
7. Keep the plan prose-first. Use checkboxes only in `Progress`.
8. Seed the plan so it can be maintained as a living document during implementation.

## Clarification Mode

- Ask only must-have questions.
- Keep the first pass to 1 to 5 questions.
- Prefer numbered questions.
- Suggest reasonable defaults when practical.
- If the user wants to proceed without answers, state assumptions as a short numbered list before writing the plan.

## Output Contract

The finished plan must:

- use YAML frontmatter that follows `docs/exec-plans/PLANS.md`
- use the exact required section order from `docs/exec-plans/PLANS.md`
- explain the user-visible outcome before implementation detail
- include concrete milestones, commands, expected observations, and recovery guidance
- optimize for a newcomer with only the repo and the plan file

Pay special attention to these contract points:

- `Context and Orientation` must include `### In Scope` and `### Out Of Scope`
- `Validation and Acceptance` must include `### Test Commands`
- new plan paths should live under `docs/exec-plans/active/` and use the dated `YYYY-MM-DD-<slug>.md` naming convention
- the plan must include `Artifacts and Notes`
- the plan must include `Interfaces and Dependencies`

## Validation Before Returning

After writing or repairing the plan, validate it immediately:

1. Re-read the plan against `docs/exec-plans/PLANS.md`.
2. Run any repo-local docs or markdown validation command if one exists for the touched path.
3. If the repo has no dedicated plan or markdown validator, state that exact reason in the summary instead of pretending the check ran.

## Summary After Writing

After authoring the plan, return a short summary with:

- the target plan path
- the chosen slice
- the milestone count
- validation commands run and results
- any blockers or assumptions that still need human confirmation

## Canonical References

- `docs/exec-plans/PLANS.md` is the authoritative plan contract
- `references/usage-template.md` contains the preferred invocation pattern for this skill
- `docs/prompts/exec-plan-writer.md` is the older prompt surface this skill was derived from
