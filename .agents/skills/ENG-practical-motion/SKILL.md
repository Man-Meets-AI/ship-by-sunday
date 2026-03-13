name: ENG-practical-motion
description: Review, critique, design, or implement UI motion using practical scenario-to-fix heuristics. Use when the user asks to improve animations, hover states, transitions, microinteractions, loading states, tooltips/popovers, route changes, drag motion, or when an interface "feels off" and the likely problem is timing, motion structure, or interaction feedback.
---

# ENG-Practical Motion

Use this skill when the job is to make motion feel better in a shippable way.

This is a workspace-local skill. It uses [docs/design/motion-practical-examples.md](../../../docs/design/motion-practical-examples.md) as the main reference for scenario matching, defaults, and implementation heuristics.

## Read Order

1. Read the user's request and identify whether the job is:
   - review
   - implementation
   - reference generation
2. Read the target surface:
   - component or page code
   - screenshot, video, or image
   - design doc or motion note
3. Read the relevant sections of [docs/design/motion-practical-examples.md](../../../docs/design/motion-practical-examples.md).
4. If motion already exists in the codebase, inspect the current timing, easing, transform, and wrapper patterns before changing anything.

## Use This Skill For

- "make this animation feel better"
- "review the hover states"
- "why does this tooltip flicker?"
- "improve the loading state motion"
- "make these cards feel more responsive"
- "tighten the route transition"
- "fix the janky list reorder"
- "add microinteractions that feel intentional"
- "this UI feels off but I can't tell why"

## Do Not Use This Skill For

- full visual redesigns where motion is not the real problem
- brand strategy, identity work, or general art direction
- flashy showcase animations for their own sake
- introducing a new animation library unless the user asks for it or the existing stack clearly cannot support the need

## Core Rules

- Solve the product problem first. Motion should improve clarity, responsiveness, and continuity.
- Prefer the smallest fix that materially improves feel.
- Default to `transform` and `opacity`.
- Start close to the final state. Avoid `scale(0)` for standard UI entrances.
- Exit faster than enter in most UI flows.
- Preserve hit-area stability on hover, press, and anchored UI.
- Gate hover-driven behavior with `@media (hover: hover) and (pointer: fine)` when relevant.
- Respect `prefers-reduced-motion`.
- Avoid stacking multiple strong motion ideas on one surface.
- Follow the project's existing stack and patterns before introducing a new technique.

## Default Workflow

1. Diagnose the problem in plain language.
   - What feels wrong?
   - When does it happen?
   - Is the issue feedback, entrance/exit, layout motion, loading, or performance?
2. Map the problem to the closest scenario category in [docs/design/motion-practical-examples.md](../../../docs/design/motion-practical-examples.md).
3. Choose the smallest viable fix.
   - timing
   - easing
   - property choice
   - `transform-origin`
   - wrapper or DOM structure
   - reduced-motion or hover guardrails
4. Implement or recommend with concrete values.
   - duration range
   - easing
   - travel distance
   - scale range
   - wrapper placement
5. Pressure-test the change.
   - touch versus hover
   - keyboard and focus visibility
   - reduced motion
   - repeated real use, not just first impression
   - performance on dense surfaces
6. Verify against the actual UI or the code path that triggers it.

## Common Scenario Mapping

- Buttons, links, and card hover: direct feedback and surface polish
- Tooltips, popovers, menus, comboboxes: anchored UI and origin problems
- Accordions and FAQs: height changes and content sequencing
- Lists, grids, feeds, Kanban: reorder and layout motion
- Tabs, filters, segmented controls: selection-change motion
- Forms and autosave: inline guidance and state feedback
- Loaders, skeletons, progress bars: async continuity
- Toasts and banners: temporary notice motion
- Sticky headers, reveals, parallax: scroll-based motion
- Drag, swipe, pull-to-refresh: gesture-driven motion
- Counters, labels, headlines: text and number motion
- Blur, jitter, fuzziness, frame drops: rendering and performance fixes

## Output Contract

For reviews, return:

1. `Motion Diagnosis`
2. `Closest Scenario Match`
3. `Recommended Fix`
4. `Implementation Notes`
5. `Accessibility + Performance Checks`
6. `Open Questions`

For implementation tasks, default to:

1. diagnose the issue
2. implement directly
3. run the lightest relevant verification
4. summarize what changed and why

## Implementation Guardrails

- Do not animate layout when a simple opacity or transform change will do the job.
- Do not animate the hover target itself if it destabilizes the pointer hit area.
- Do not add delays to high-frequency interactions like hover, press, or menus unless intent logic truly needs it.
- Do not let decorative loops compete with reading, forms, or primary CTA actions.
- Do not ship major motion changes without checking `prefers-reduced-motion`.
- Do not scale text-heavy surfaces aggressively; animate inner layers, borders, shadows, or wrappers instead.

## Good Uses

- Review a component whose hover state feels cheap or unstable.
- Tighten modal, popover, tooltip, or menu motion.
- Add better loading-state or save-state feedback.
- Diagnose list reorder, drag, or layout-motion jank.
- Improve route transitions or sticky header behavior.
- Extend the internal motion reference with new scenario-to-fix examples when the repo needs them.

## Bad Uses

- "Redesign this whole page" when motion is only a small part of the problem.
- "Make this look cooler" with no product or interaction diagnosis.
- "Add GSAP everywhere" when CSS or the existing motion stack is enough.
- "Invent a signature animation style" when the task is basic interaction polish.
