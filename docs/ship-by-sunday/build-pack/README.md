# Ship by Sunday Build Pack

This folder is the Ship by Sunday custom build-pack layer that sits on top of the vanilla long-horizon baseline in `docs/openai/codex_long_horizon_templates/`.

It is the template for the customer-facing `docs/build/` blueprint that should be generated into the starter snapshot after the review route.

## What this pack is for

- Turn stable product facts into an implementation spec, milestone plan, execution runbook, and live status log.
- Make build scope explicit before Codex or another agent starts changing code.
- Keep long-horizon implementation aligned to the same product truth used by design and marketing.
- Separate real project facts from workflow state, lesson progress, and ephemeral runtime.

## What is in scope

- objective, why it matters, and the user-visible outcome
- scope in, scope out, and non-goals
- constraints, risks, dependencies, deliverables, and done-when
- milestone sequencing, validation commands, and rollback or escape hatch
- execution rules for milestone-by-milestone implementation
- live documentation of status, validation, decisions, and next step

## What is out of scope

- teaching checklists and lesson-completion state
- copied prompts or browser/session state as canonical truth
- marketing strategy, brand-system exploration, or unrelated design work
- secrets, deploy credentials, or ephemeral operational toggles
- scope expansion beyond the agreed v1 without updating the blueprint facts first

## Files in this pack

- `AGENTS.md` - the build-pack operating contract
- `CHECKLIST.md` - long-horizon readiness and operating gate
- `docs/prompt.md` - canonical task spec
- `docs/plans.md` - milestone plan template
- `docs/implement.md` - execution runbook
- `docs/documentation.md` - live status and handoff log
- `examples/review-route-build-slice.md` - a concrete golden-example blueprint

## Ship by Sunday source basis

- `docs/openai/codex_long_horizon_templates/AGENTS.md`
- `docs/openai/codex_long_horizon_templates/CHECKLIST.md`
- `docs/openai/codex_long_horizon_templates/docs/prompt.md`
- `docs/openai/codex_long_horizon_templates/docs/plans.md`
- `docs/openai/codex_long_horizon_templates/docs/implement.md`
- `docs/openai/codex_long_horizon_templates/docs/documentation.md`
- `docs/ship-by-sunday/blueprint-contract-and-question-map-2026-03-23.md`
- `docs/ship-by-sunday/input-architecture-keep-kill-combine-2026-03-23.md`
