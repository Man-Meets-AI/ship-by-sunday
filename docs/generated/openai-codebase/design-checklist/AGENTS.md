# AGENTS.md

Use this file for frontend design and implementation tasks in this repository.

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

If the task is not user-facing UI work, follow the normal repo instructions instead.

## Required workflow

1. Before broad UI work, create or update a task plan using `design-checklist/PLANS.md`.
2. Read `design-checklist/CHECKLIST.md` and explicitly apply the relevant sections for the current surface type.
3. Preserve the existing product and design system when one already exists.
4. If the design system is weak or missing, define or extend tokens before adding broad visual polish.
5. Use real copy, real product context, or tightly scoped placeholder copy.
6. Verify the result on both desktop and mobile before calling the task complete.
7. Update project-facing documentation using `design-checklist/documentation.md` when the work changes the user-facing experience in a meaningful way.

## How to think about the work

- Start with composition, not components.
- Start with the experience the user sees first, not with decorative details.
- Prioritize restraint, hierarchy, and clarity over quantity of components.
- Use spacing, scale, alignment, contrast, and imagery before adding chrome.
- When the repo already has strong patterns, preserve them instead of imposing generic defaults.

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

## Hard rules for app, dashboard, and workspace UI

- Default to calm hierarchy, strong typography, sparse color, and minimal chrome.
- Organize around a primary workspace, navigation, secondary context, and one clear accent for action or state.
- Use utility copy instead of marketing copy.
- Start with the working surface itself, not a homepage-style hero.
- Do not introduce a hero section on product UI unless explicitly requested.
- If a panel can become plain layout without losing meaning, remove the card treatment.
- If a section does not help someone operate, monitor, or decide, remove it.

## Cards, color, and typography

- Default to no cards.
- Use cards only when they are the interaction container or clearly improve comprehension.
- Use expressive typography when the task requires a branded or premium surface.
- Limit the system to two typefaces unless the existing design system already supports more.
- Default to one accent color unless the product already has a strong multi-accent system.
- Avoid generic purple-on-white and generic dark-mode bias unless the product already uses them.
- Use tokens before hard-coded colors.

## Imagery

- Imagery must do narrative work.
- Prefer real-looking, in-context imagery when imagery is central to the experience.
- Avoid decorative gradients as the main visual idea unless the brief is explicitly abstract.
- Choose or crop images so text sits on a stable tonal area.
- Avoid images with embedded signage, logos, or text clutter fighting the UI.
- Do not use images with built-in UI frames, splits, cards, or panels.

## Copy

- Write in product language, not design commentary.
- Let the headline carry the meaning.
- Supporting copy should usually be one short sentence.
- Give each section one purpose: explain, prove, deepen, or convert.
- Remove repetition aggressively.
- Do not leak prompt wording into the UI.
- For dashboards and operational tools, headings should describe what the area is or what the user can do there.

## Motion

- Motion should create presence and hierarchy, not noise.
- For visually led work, ship 2-3 intentional motions when appropriate.
- Include motion only if it materially improves atmosphere, hierarchy, or affordance.
- Remove ornamental motion.
- Fixed or floating elements must not overlap key content across breakpoints.

## Technical defaults

- Prefer React + Tailwind when the stack is otherwise open-ended.
- Follow the repo's existing component, token, and CSS architecture.
- If the repo uses React Compiler guidance, follow it.
- Do not add `useMemo` or `useCallback` by default unless the existing codebase already relies on them or the change has a measured reason.
- Use modern React patterns such as `startTransition`, `useDeferredValue`, and `useEffectEvent` when they are appropriate and consistent with the repo.
- Reuse existing components before introducing new abstractions.

## Verification

Before marking a UI task complete:

- Verify at least one desktop viewport and one mobile viewport.
- Use Playwright or equivalent browser inspection tooling when available.
- Compare against screenshots, mocks, or Figma frames when the task is reference-driven.
- Run the repo's standard validation steps such as lint, typecheck, tests, and build.
- Review the final diff for both visual quality and architectural fit.

## Deliverables

A complete frontend task should usually leave behind:
- implemented UI changes
- an updated task plan if the scope evolved
- updated documentation for meaningful user-facing changes
- any screenshots or notes needed to explain tradeoffs, deviations, or follow-ups

## If the brief is underspecified

Do not jump straight to generic layouts.

Instead:
1. infer the surface type
2. define constraints
3. write a visual thesis
4. write a content plan
5. write an interaction thesis
6. then build

## Files to consult

- `design-checklist/CHECKLIST.md`
- `design-checklist/PLANS.md`
- `design-checklist/documentation.md`
