# AGENTS.md

Use this file for Ship by Sunday frontend design and implementation tasks.

## Scope

Apply these instructions whenever a task changes any of the following:

- UI layout
- styling or theming
- landing pages or marketing pages
- dashboards or app surfaces
- component presentation
- interaction design or motion
- copy hierarchy on user-facing screens
- Figma-to-code or screenshot-to-code work

If the task is not user-facing UI work, follow the repo's normal instructions instead.

## Required workflow

1. Start from `docs/openai/design-pack/` for the vanilla baseline.
2. Identify the surface type first: landing page, marketing page, packet workspace, or dashboard.
3. Read `CHECKLIST.md` and the matching surface doc under `surfaces/`.
4. Create or update a task plan from `PLANS.md` before broad UI work.
5. Preserve the existing product and design system when one already exists.
6. Keep the product packet-first, not course-first.
7. Use real copy, real product context, or tightly scoped placeholder copy.
8. Verify the result on both desktop and mobile before calling the task complete.
9. Update `documentation.md` when the work changes the user-facing experience in a meaningful way.
10. Use current `apps/web` routes, features, config, and local `AGENTS.md` files as the live product contract; use older `docs/ship-by-sunday/*.md` planning docs only for background context.

## How to think about the work

- Start with composition, not components.
- Start with the first screen the user sees, not decorative details.
- Prioritize restraint, hierarchy, and clarity over quantity of components.
- Use spacing, scale, alignment, contrast, and imagery before adding chrome.
- When the repo already has strong patterns, preserve them instead of imposing generic defaults.
- Do not let visual work reintroduce old CEO / Design / Build / Ship framing when it conflicts with the packet-first flow.

## Hard rules for branded and landing-page work

- The first viewport must read as one composition, not a dashboard.
- The brand or product name must be a hero-level signal.
- No headline should overpower the brand on branded pages.
- Prefer a full-bleed hero or dominant visual plane by default.
- Keep the first-screen budget tight: brand, one headline, one short supporting sentence, one CTA group, and one dominant image.
- Do not place stats, schedule rows, metadata bars, promo callouts, or other secondary content in the hero unless the brief explicitly requires it.
- Do not place detached labels, badges, or promo stickers on hero media.
- Default to no cards in the hero.
- Headlines should stay readable in one glance on mobile.
- Keep the text column narrow and anchored to a calm area of the image.
- If the task touches the public homepage, read `apps/web/content/docs/configure-the-homepage.mdx` first and preserve the existing CTA, section-order, and structured-data contract.

## Hard rules for app, dashboard, and workspace UI

- Default to calm hierarchy, strong typography, sparse color, and minimal chrome.
- Organize around a primary workspace, navigation, secondary context, and one clear accent for action or state.
- Use utility copy instead of marketing copy.
- Start with the working surface itself, not a homepage-style hero.
- Do not introduce a hero section on product UI unless explicitly requested.
- If a panel can become plain layout without losing meaning, remove the card treatment.
- If a section does not help someone operate, monitor, or decide, remove it.
- Prefer packet-stage and workspace-first composition over course-shell or promo-shell composition.

## Verification

Before marking a UI task complete:

- Verify at least one desktop viewport and one mobile viewport.
- Use Playwright or equivalent browser inspection tooling when available.
- Compare against screenshots, mocks, or Figma frames when the task is reference-driven.
- Run the repo's standard validation steps such as lint, tests, build, and typecheck.
- Review the final diff for both visual quality and architectural fit.

## Deliverables

A complete frontend task should usually leave behind:

- implemented UI changes
- an updated task plan if the scope evolved
- updated documentation for meaningful user-facing changes
- any screenshots or notes needed to explain tradeoffs, deviations, or follow-ups

## Files to consult

- `docs/ship-by-sunday/design-pack/AGENTS.md`
- `docs/openai/design-pack/AGENTS.md`
- `docs/openai/design-pack/CHECKLIST.md`
- `docs/openai/design-pack/PLANS.md`
- `docs/ship-by-sunday/design-pack/CHECKLIST.md`
- `docs/ship-by-sunday/design-pack/PLANS.md`
- `docs/ship-by-sunday/design-pack/documentation.md`
- `docs/ship-by-sunday/design-pack/surfaces/landing-page.md`
- `docs/ship-by-sunday/design-pack/surfaces/marketing-page.md`
- `docs/ship-by-sunday/design-pack/surfaces/app-surface.md`
- `docs/ship-by-sunday/design-pack/surfaces/dashboard.md`
- `apps/web/AGENTS.md`
- `apps/web/content/docs/configure-the-homepage.mdx`
