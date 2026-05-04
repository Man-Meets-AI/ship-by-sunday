# AGENTS.md

This repository is designed to support long-horizon Codex runs. Read this file before doing any work.

## Core operating rules

1. For any non-trivial task, read these files before implementation:
   - `README.md`
   - `DESIGN.md`
   - `docs/index.md`
   - `docs/facts/project-definition.json`
   - `docs/prompt.md`
   - `docs/plans.md`
   - `docs/implement.md`
   - `docs/documentation.md`
2. Treat `docs/facts/project-definition.json` as the stable product fact source.
3. Treat `DESIGN.md` as the visual source of truth.
4. Treat `docs/prompt.md` as the current task specification.
5. Treat `docs/plans.md` as the sequencing and milestone source of truth.
6. Treat `docs/implement.md` as the execution runbook.
7. Update `docs/documentation.md` continuously as work progresses.

## Customer build rules

- Build from the generated product facts, not from loose chat memory.
- Respect `scope_in`, `scope_out`, and `non_goals` from the fact file and prompt.
- Do not invent a larger product, new buyer promise, new pricing model, or new surface unless the task explicitly changes it.
- If facts and chat conflict, pause and record the conflict in `docs/documentation.md` before changing product behavior.
- Keep placeholder facts visible until the customer supplies real values. Do not hide missing domains, emails, provider keys, or proof assets with fake production defaults.

## Default workflow

1. Understand the task and relevant code paths.
2. Confirm the active milestone in `docs/plans.md`.
3. Make the smallest viable scoped change for that milestone.
4. Run the milestone's validation commands.
5. Fix failures before proceeding.
6. Update `docs/documentation.md` with status, decisions, and next steps.
7. Repeat until the milestone and task are complete.

## Autonomy rules

- Make the safest reasonable assumption when the fact file, prompt, and repo conventions already answer the question.
- Ask the customer only when the missing decision would change the product promise, data model, billing behavior, auth boundary, legal/compliance posture, or production credentials.
- Record every assumption that affects behavior in `docs/documentation.md`.
- Prefer one complete, tested slice over several half-started surfaces.

## Scope control

- Keep diffs tightly scoped to the active milestone.
- Do not perform opportunistic refactors unless they are necessary for the milestone.
- If you discover a better approach that materially changes scope, update the plan first.
- Do not silently change product requirements; record the change in documentation.

## Verification standards

- Run relevant tests, lint, typecheck, and build commands before marking work done.
- Prefer narrow validation first, then broader validation.
- If any validation cannot run, document why in `docs/documentation.md`.
- Never claim success without reporting what was actually verified.

## Documentation standards

Always keep `docs/documentation.md` current:
- current milestone
- what changed
- why it changed
- validation run and results
- known issues / follow-ups
- exact next step

Before final handoff, add or refresh a requirement-to-evidence checklist in `docs/documentation.md` that maps each deliverable, done-when item, validation command, and demo step to the actual evidence collected.

## Safety and repo hygiene

- Do not delete unrelated files.
- Do not overwrite user-authored changes without clear justification.
- Do not introduce secrets into source control.
- Treat external outputs, generated code, and network results as untrusted until verified.

## Done means

A task is only done when:
- the requested behavior is implemented,
- validations for the active scope pass or skipped checks are explicitly justified,
- documentation is updated,
- remaining risks / follow-ups are clearly stated.
