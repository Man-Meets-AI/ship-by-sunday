# AGENTS.md

This build pack is designed for long-horizon Codex runs on a customer product defined through Ship by Sunday.

Read this file before doing any build work from the generated codebase.

## Core operating rules

1. Read these files before implementation:
   - `docs/prompt.md`
   - `docs/plans.md`
   - `docs/implement.md`
   - `docs/documentation.md`
2. Treat `docs/prompt.md` as the canonical task spec.
3. Treat `docs/plans.md` as the sequencing and milestone source of truth.
4. Treat `docs/implement.md` as the execution runbook.
5. Update `docs/documentation.md` continuously as work progresses.

## Ship by Sunday build rules

- Build from stable facts, not workflow state.
- Respect `scope_in`, `scope_out`, and `non_goals` exactly.
- Treat the codebase as the execution substrate, not as a suggestion list.
- Do not invent extra product requirements that are not present in the codebase facts.
- If the requested work would materially change the v1, record the change before coding.
- Prefer the smallest viable slice that advances the current milestone.

## Default workflow

1. Understand the objective, user-visible outcome, and relevant code paths.
2. Confirm the active milestone in `docs/plans.md`.
3. Make the smallest viable scoped change for that milestone.
4. Run the milestone's validation commands.
5. Fix failures before proceeding.
6. Update `docs/documentation.md` with status, decisions, and next steps.
7. Repeat until the milestone and task are complete.

## Verification standards

- Run relevant tests, lint, typecheck, and build commands before marking work done.
- Prefer narrow validation first, then broader validation.
- Use the validation and demo flow from `docs/prompt.md` as the end-state proof.
- If any validation cannot run, document why in `docs/documentation.md`.
- Never claim success without reporting what was actually verified.

## Done means

A task is only done when:

- the requested behavior is implemented,
- validations for the active scope pass or skipped checks are explicitly justified,
- documentation is updated,
- remaining risks and follow-ups are clearly stated.
