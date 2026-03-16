---
name: ENG-interface-polish
description: Review, critique, or implement the small UI details that make interfaces feel more refined. Use when the user asks to polish a UI, improve how an interface feels, fix number jitter, tighten text wrapping, clean up border radius relationships, sharpen icon or content alignment, replace harsh borders with softer surface treatment, improve image framing, or add light interaction polish without doing a full redesign or motion-system pass.
---

# ENG-Interface Polish

Use this skill when the job is to improve interface feel through small, concrete details rather than a redesign.

This is a workspace-local skill. It uses [references/interface-polish-recipes.md](references/interface-polish-recipes.md) as the main reference for article-derived heuristics and implementation defaults.

## Read Order

1. Read the user's request and identify whether the job is:
   - review
   - implementation
   - reference generation
2. Read the target surface:
   - component or page code
   - screenshot, mock, or recording
   - design note or QA note
3. Read only the relevant sections of [references/interface-polish-recipes.md](references/interface-polish-recipes.md).
4. If the request is primarily about hover states, tooltips, route transitions, gesture motion, loaders, menus, or a broader motion system, use [../ENG-practical-motion/SKILL.md](../ENG-practical-motion/SKILL.md) instead.

## Use This Skill For

- "polish this UI"
- "why do these numbers shift?"
- "make this button with an icon feel more balanced"
- "tighten these cards on a photo background"
- "the text wrapping feels awkward"
- "the border radius looks off"
- "make these small details feel more refined"

## Do Not Use This Skill For

- full visual redesigns or layout overhauls
- brand strategy, art direction, or visual identity work
- motion-first problems that belong in `ENG-practical-motion`
- accessibility audits where the primary issue is semantics, contrast, or keyboard behavior rather than interface feel

## Core Rules

- Prefer one to three high-leverage fixes over a broad redesign.
- Solve visible friction first: jitter, awkward wrapping, harsh edges, optical imbalance, or surfaces that blend into the background.
- Match the existing design system and tokens before inventing new styling language.
- Keep motion subtle and functional when you borrow motion-derived recipes.
- Verify on the actual surface, not just in isolation.
- Paraphrase the heuristics and adapt them to the repo; do not treat the source article as copy to paste.

## Default Workflow

1. Diagnose the problem in plain language.
   - What feels off?
   - Is the issue text, numbers, shape, alignment, surface treatment, or light interaction polish?
2. Map the problem to the smallest relevant recipe family in [references/interface-polish-recipes.md](references/interface-polish-recipes.md).
3. Choose the smallest viable fix.
   - CSS property or utility
   - spacing or radius adjustment
   - shadow or outline treatment
   - optical alignment offset
   - light enter or exit refinement
4. Implement or recommend with concrete values.
   - wrapping mode
   - radius relationship
   - numeric variant
   - shadow recipe
   - outline opacity
   - stagger timing or travel distance
5. Pressure-test the change.
   - desktop and mobile
   - light and dark mode
   - image and colored backgrounds when relevant
   - live data updates for counters and stats
   - reduced motion if any motion properties were touched
6. Verify against the actual UI or the code path that triggers it.

## Recipe Families

- Text and numbers: wrapping, font smoothing, tabular numerals
- Shape and alignment: concentric radii, optical alignment, icon padding
- Surface treatment: shadows, borders, image outlines
- Light interaction polish: contextual icon swaps, interruptible transitions, staggered enters, subtle exits

## Output Contract

For reviews, return:

1. `Interface Diagnosis`
2. `Relevant Detail Categories`
3. `Recommended Changes`
4. `Implementation Notes`
5. `Verification Checks`
6. `Open Questions`

For implementation tasks, default to:

1. diagnose the issue
2. implement directly
3. run the lightest relevant verification
4. summarize what changed and why

## Implementation Guardrails

- Do not turn polish work into a layout or component redesign.
- Do not add motion unless it clearly improves clarity or feedback.
- Do not add one-off magic numbers without checking the surrounding optical balance.
- Do not use harsh borders when a low-alpha shadow or outline solves the problem more cleanly.
- Do not apply large enter or exit travel to small UI elements.
- Do not change typography system-wide unless the problem is clearly global.
