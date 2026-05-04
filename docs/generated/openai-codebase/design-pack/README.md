# OpenAI Design Pack

This folder is the neutral baseline design-pack template derived from the OpenAI design-checklist source docs in this repo.

Use it as the vanilla starting point for landing pages, marketing pages, app surfaces, dashboards, and other user-facing UI tasks where composition, hierarchy, copy, and verification matter.

## What is in here

- `AGENTS.md` - the baseline workflow contract for design tasks.
- `CHECKLIST.md` - the preflight gate and surface rules.
- `PLANS.md` - the task-specific plan template.
- `documentation.md` - the post-ship record template.
- `surfaces/` - short opinionated rule sheets for common surface types.
- `examples/` - filled examples that show the pack in use.
- `decisions/` - baseline rules and exception logs.

## Scope

This pack is meant to standardize how a product team can handle:

1. Surface framing and goal setting.
2. Composition, typography, color, imagery, and motion decisions.
3. Landing-page, marketing-page, app-surface, and dashboard defaults.
4. Verification, documentation, and handoff discipline.

It is a practical baseline workflow, not a style essay.

## Recommended structure

```text
docs/openai/design-pack/
  README.md
  AGENTS.md
  CHECKLIST.md
  PLANS.md
  documentation.md
  surfaces/
    landing-page.md
    marketing-page.md
    app-surface.md
    dashboard.md
  examples/
    homepage-cleanup.md
  decisions/
    known-rules.md
```

## Suggested workflow

1. Start in `AGENTS.md` to confirm the task is user-facing UI work.
2. Read `CHECKLIST.md` and the surface doc that matches the task.
3. Copy `PLANS.md` into a task file and fill it with the real brief.
4. Implement the smallest viable slice that matches the visual thesis and content plan.
5. Verify desktop and mobile, then run the product's normal checks.
6. Write a post-ship note from `documentation.md` when the change is meaningful.

Marketing pages generally follow the landing-page rules unless a task-specific plan says otherwise.

## Source policy

This pack is the active vanilla baseline for human UI work. It is derived from the checked-in design-checklist source docs and should be re-verified whenever those source docs change.

The codebase compiler currently reads `docs/openai/design-checklist/` as its design template input. Do not delete or rename the source checklist lane unless the compiler path and generated mirrors are migrated in the same change.

Source basis:

- `docs/openai/design-checklist/AGENTS.md`
- `docs/openai/design-checklist/CHECKLIST.md`
- `docs/openai/design-checklist/PLANS.md`
- `docs/openai/design-checklist/documentation.md`

Git basis:

- `7035e29` introduced the current `docs/openai/design-checklist/*` source set that this baseline pack was derived from.
