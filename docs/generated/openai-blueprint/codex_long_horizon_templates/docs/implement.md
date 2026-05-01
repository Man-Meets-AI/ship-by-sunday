# Implement.md

This file is the execution runbook for Codex.

## Source of truth

- `docs/prompt.md` defines the target.
- `docs/plans.md` defines the active milestone and validations.
- This file defines how to operate while implementing.
- `docs/documentation.md` is the live status / audit log.

## Operating procedure

1. Read the spec and identify the active milestone.
2. Read `docs/facts/project-definition.json` and `DESIGN.md` before making product or UI changes.
3. Gather only the context needed for that milestone.
4. Keep diffs scoped to the milestone.
5. Implement the smallest complete slice that satisfies acceptance criteria.
6. Run the milestone validation commands immediately.
7. Fix failures before moving on.
8. Update `docs/documentation.md`.
9. Repeat.

## Execution rules

- Do not expand scope without updating the plan.
- Do not postpone failing validations to a later milestone.
- Do not leave undocumented architectural changes.
- Prefer reversible changes when uncertainty is high.
- Prefer narrow tests/checks first, broad checks second.
- If blocked, document the blocker precisely and propose the smallest unblock.
- Ask for customer input only when the missing answer affects product promise, data model, billing behavior, auth boundary, legal/compliance posture, or production credentials.
- Do not paper over missing facts with fake defaults. Keep placeholders explicit and documented.

## Required documentation update after each milestone

Record in `docs/documentation.md`:
- milestone status
- files changed
- key decisions
- assumptions made
- validation run + results
- remaining issues / risks
- next milestone or next step

## Finalization rules

Before declaring the task complete:
- confirm the "done when" section in `docs/prompt.md`
- build a requirement-to-evidence checklist from `docs/prompt.md`
- run the final validation set
- update demo / run instructions if needed
- review the final diff for unrelated scope, secrets, placeholders hidden as production data, and missing tests
- leave a concise end-state summary in `docs/documentation.md`
