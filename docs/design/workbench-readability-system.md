# Workbench Readability System

Last updated: 2026-03-13

## Outcome Context

### Product goal

`Ship by Sunday` only works if a paying student can move from one decision to the next without burning energy deciphering the interface. The product has to convert instructional clarity into forward motion, not hide it behind dense chrome.

### Surface goal

Lesson `1.2 Pick One User` is the highest-leverage readability target because it mixes the core workbench header, status rail, selection cards, preview states, section cards, inputs, and shell side panels in one screen. If this lesson reads clearly, the same system can carry across the rest of the workspace.

### Business model

This is a paid course and workspace product. Revenue quality depends on activation, lesson continuation, perceived instructional quality, and low support/refund risk from students who feel lost after purchase.

### Business metrics that matter here

- `1.2` completion rate
- `1.2 -> 1.3` continuation rate
- time to first meaningful save in a lesson
- failed completion attempts per lesson
- support or refund signals tied to confusion, overwhelm, or unclear next steps

### Assumptions and confidence

- Assumption: the current complaint is driven more by scan friction and visual rhythm than by missing functionality.
- Assumption: the harshness comes from repeated tiny type, repeated borders, and too many equal-weight panels in the same viewport.
- Assumption: if the shared shell primitives improve, most lesson modes will benefit without per-lesson redesign.
- Confidence: high. The same density patterns are visible in the current `1.2` implementation and the shared workbench primitives it depends on.

Inspected surfaces:

- `components/lesson-workbench/modes/pick-one-user-support.tsx`
- `components/lesson-workbench/modes/guided-form-workbench.tsx`
- `components/lesson-workbench/shared/workbench-header.tsx`
- `components/lesson-workbench/shared/status-rail.tsx`
- `components/lesson-workbench/shared/workbench-card.tsx`
- `components/lesson-workbench/shared/section-card.tsx`
- `components/lesson-workbench/shared/artifact-context.tsx`
- `components/lesson-workbench/shared/artifact-preview-content.tsx`
- `components/lesson-workbench/fields/field-styles.ts`
- `components/lesson-workbench/fields/field-list.tsx`
- `components/lesson-shells.tsx`
- `app/globals.css`

## Problems I Notice

### 1. Typography hierarchy collapses under tiny repeated labels.

User cannot scan the page quickly, causing fatigue before they start the work, because the workbench uses too many `8px` to `12px` text treatments, repeated uppercase mono labels, and very little difference between metadata, helper copy, and action copy.

### 2. The layout makes every panel feel equally important.

User cannot tell where to focus first, causing slower decisions, because the status rail, support cards, preview card, and form sections all use similar border weight, padding, and visual mass.

### 3. Reading width and grid choices are optimized for fitting panels, not for comprehension.

User can technically read every block, but the page is tough on the eye, because three-column text grids and narrow card widths force the eye to bounce across short lines and repeated boxes instead of following one strong path.

### 4. Shared shell chrome competes with the workbench instead of receding behind it.

User cannot hold the main task in focus, causing extra cognitive load, because the objective rail, coach rail, and workbench body all use similarly dense typography and similar card treatment.

### 5. The system lacks a reusable readability contract.

New lesson states can drift back into dense layouts, causing inconsistency across the workspace, because spacing, type size, line length, and card anatomy are not defined as shared workbench rules.

## Solutions I Recommend

### 1. Establish a shared workbench readability scale.

What to change:

- Standardize one label scale, one helper-copy scale, one body-copy scale, and one title scale for lesson shells and shared workbench components.
- Increase line-height and paragraph width for instructional copy.
- Reserve uppercase mono styling for metadata and section labels only.

Why it solves a user problem:

- It restores a clear scan order and reduces eye strain.

How it supports business growth:

- Clearer lesson pages should improve activation, continuation, and perceived product quality.

Trade-offs or risks:

- The interface will feel less aggressively compact.
- Some existing tests that assert exact class strings will need updating.

How to validate:

- Run focused renderer and shell tests.
- Browser-QA `1.2` plus one watch lesson and one focus lesson to confirm the scale feels consistent.

### 2. Rebalance shared card anatomy around spacing first, borders second.

What to change:

- Give shared workbench cards, section cards, artifact previews, and shell side panels more internal spacing.
- Soften border dominance and rely more on grouped spacing and width.
- Keep one consistent header/body rhythm across cards.

Why it solves a user problem:

- It makes the page easier to parse without removing structure.

How it supports business growth:

- Better readability lowers friction in the core student journey.

Trade-offs or risks:

- If pushed too far, the product could lose some of its hard-edged editorial character.

How to validate:

- Compare before/after screenshots and watch whether users can identify the main action path in a few seconds.

### 3. Make `1.2` follow one stronger narrative path.

What to change:

- Keep the user-choice block as the primary decision surface.
- Simplify the support copy around it.
- Reformat the pressure-test and inherited-preview states so they read as support, not as competing worksheets.

Why it solves a user problem:

- The lesson becomes one story: choose, pressure-test, then ground the choice.

How it supports business growth:

- A clearer `1.2` improves the quality of the artifacts inherited by `1.3` and later CEO lessons.

Trade-offs or risks:

- Requires a small amount of lesson-specific UI work on top of shared primitives.

How to validate:

- Review saved `1.2` artifacts after the change and compare specificity in `pain_moment`, `current_solution`, and `reachability`.

### 4. Apply the same readability rules to guided, focus, and watch shells.

What to change:

- Standardize shell-side panel typography and body spacing.
- Use the same readable width and copy rhythm for watch-shell transcript/resources sections and guided-form shell panels.

Why it solves a user problem:

- It prevents the workspace from feeling polished in one lesson and cramped in the next.

How it supports business growth:

- Consistency strengthens trust that the course is intentional and production-ready.

Trade-offs or risks:

- Some custom mode surfaces may still need later cleanup if they override the shared defaults heavily.

How to validate:

- Spot-check three lesson types after implementation: guided, watch, and focus.

## Trade-offs and Decisions

- Decision: favor readability and clear hierarchy over maximum information density.
- Decision: solve this primarily in shared workbench primitives, not by redesigning one lesson in isolation.
- Decision: keep the existing font families for now and standardize scale, spacing, and usage before considering a font swap.
- Trade-off: some panels will consume more vertical space, but the page should become faster to understand.

## Priority Plan

### Must

- Implement shared typography and spacing rules in the shared workbench header, cards, fields, artifact previews, and shell side panels.
- Rework lesson `1.2` so the choice block, support block, and preview block have clearer visual priority and lower text density.

### Should

- Capture the readability rules in docs so later lesson work does not regress.
- Verify one guided lesson, one watch lesson, and one focus lesson after the shared changes land.

### Could

- Do a second pass on mode-specific outliers like prompt-import or external-workspace cards if they still feel cramped after the shared update.

## Validation Plan

- Run focused unit coverage for renderer and shell components touched by the readability pass.
- Run `pnpm run typecheck` if the dirty tree and pre-existing unrelated failures allow it; otherwise report the blocker clearly.
- Browser-QA the live `1.2` lesson plus at least one non-guided lesson once an entitled QA account is prepared.
- Check that the revised shell still works in both product themes.

## Narrative Summary

The current `1.2` screen is directionally correct, but it asks the eye to do too much work. The lesson does not mainly suffer from missing features; it suffers from a readability system that makes metadata, support copy, previews, and primary inputs all compete at once. The right move is to use `1.2` as the proving ground for a shared workbench readability contract: a stronger type ladder, clearer spacing rhythm, and fewer same-weight slabs. Once that is in place, the rest of the workspace can inherit a calmer, more legible product language instead of collecting one-off fixes.
