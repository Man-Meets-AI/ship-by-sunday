# Ship by Sunday Design Pack

This folder is the Ship by Sunday-specific design pack layered on top of the vanilla baseline in `docs/openai/design-pack/`.

Use it for actual UI work in this repo when blueprint-first product rules, homepage contract constraints, and Ship by Sunday tone matter.

Start with root `DESIGN.md` first. That file is the canonical visual source of truth. This pack exists to operationalize it for real UI tasks.

## What is in here

- `AGENTS.md` - the Ship by Sunday operating contract for design tasks.
- `CHECKLIST.md` - the SBS-specific gate layered on the vanilla checklist.
- `PLANS.md` - the task-specific plan template with product constraints.
- `documentation.md` - the post-ship record template for SBS UI changes.
- `surfaces/` - rule sheets adapted to public marketing and blueprint/workspace surfaces.
- `examples/` - filled examples from SBS work.
- `decisions/` - repo-specific SBS rules and exception logs.

## Scope

This pack is meant to standardize how Ship by Sunday handles:

1. Surface framing and goal setting.
2. Composition, typography, color, imagery, and motion decisions.
3. Landing-page, marketing-page, blueprint/workspace, and dashboard defaults.
4. Verification, documentation, and handoff discipline.

It is the repo's live product-specific UI contract, not a style essay.

## Recommended structure

```text
docs/ship-by-sunday/design-pack/
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

1. Start in `docs/openai/design-pack/` for the vanilla baseline.
2. Read root `DESIGN.md`.
3. Read `AGENTS.md`, `CHECKLIST.md`, and the matching surface doc in this SBS pack.
4. Copy `PLANS.md` into a task file and fill it with the real SBS brief and product constraints.
5. Implement the smallest viable slice that matches the visual thesis, content plan, and blueprint-first contract.
6. Verify desktop and mobile, then run the repo's normal checks.
7. Write a post-ship note from `documentation.md` when the change is meaningful.

Marketing pages generally follow the landing-page rules unless a task-specific plan says otherwise. Product UI should prefer blueprint/workspace-first composition over homepage-style hero framing.

## Source policy

This pack is derived from the vanilla baseline in `docs/openai/design-pack/` and should be re-verified whenever the product design system, homepage contract, or blueprint/workspace flow changes in a meaningful way.

Source basis:

- `docs/openai/design-pack/AGENTS.md`
- `docs/openai/design-pack/CHECKLIST.md`
- `docs/openai/design-pack/PLANS.md`
- `docs/openai/design-pack/documentation.md`
- `DESIGN.md`
- `apps/web/AGENTS.md`
- `apps/web/content/docs/configure-the-homepage.mdx`
