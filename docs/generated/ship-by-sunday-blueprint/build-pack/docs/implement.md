# Implement.md

This file is the execution runbook for Codex on a Ship by Sunday-generated customer product.

## Source of truth

- `docs/prompt.md` defines the target.
- `docs/plans.md` defines the active milestone and validations.
- This file defines how to operate while implementing.
- `docs/documentation.md` is the live status and audit log.

## Operating procedure

1. Read the spec and identify the active milestone.
2. Gather only the context needed for that milestone.
3. Keep diffs scoped to the milestone.
4. Implement the smallest complete slice that satisfies acceptance criteria.
5. Run the milestone validation commands immediately.
6. Fix failures before moving on.
7. Update `docs/documentation.md`.
8. Repeat.

## Execution rules

- Do not expand scope without updating the plan.
- Do not postpone failing validations to a later milestone.
- Do not leave undocumented architectural changes.
- Prefer reversible changes when uncertainty is high.
- Prefer narrow tests and checks first, broad checks second.
- If blocked, document the blocker precisely and propose the smallest unblock.
- Do not treat workflow state, lesson checklists, or copied prompts as canonical build requirements.

## Required documentation update after each milestone

Record in `docs/documentation.md`:

- milestone status
- files changed
- key decisions
- validation run and results
- remaining issues / risks
- next milestone or next step

## Finalization rules

Before declaring the task complete:

- confirm the "done when" section in `docs/prompt.md`
- run the final validation set
- update demo / run instructions if needed
- leave a concise end-state summary in `docs/documentation.md`
