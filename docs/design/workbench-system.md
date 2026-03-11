# Ship by Sunday Workbench System

Last updated: 2026-03-11

## Goal

Make every student workbench feel like an active guided product, not a styled worksheet.

Keep the current editorial/blocky visual language, but rebuild the learner experience around stronger task hierarchy, clearer structure, and visible progress.

## Screen anatomy

Each lesson workbench should follow the same order:

1. Context strip
2. Primary lesson header
3. Compact status rail
4. Section cards
5. Workbench footer with progress and completion

### Context strip

- Use this for lesson id, output name, and runtime only
- Keep it visually quiet
- Never let metadata compete with the task header

### Primary lesson header

- One strong title
- One short framing sentence
- Maximum readable width around `48rem`
- This is the first thing the learner should read

### Compact status rail

- Replace heavy task framing cards with a lighter support rail
- Show:
  - what to do now
  - timebox
  - finish with
- Treat this as supporting information, not the visual center of gravity

### Section cards

- Guided lessons should be broken into named sections
- Each section should explain:
  - what the learner is doing
  - what good looks like
  - what fields belong to this rep
- Section cards own examples, helper copy, and local completion feedback

### Workbench footer

- Show section progress and incomplete items before the primary completion button
- Keep validation quiet until the learner tries to complete the lesson
- The footer should answer: `How far through this am I?`

## Hierarchy rules

- One dominant task area per lesson
- Metadata always reads lower than lesson title, intro, and fields
- Examples belong below the relevant input or section, not inside placeholders
- Use spacing and width first, borders second
- Keep the workbench column narrow enough to feel focused
- Side panels can stay, but they must visually recede behind the workbench

## Field rules

- Labels should be direct and sentence-case when possible
- Placeholder text should be minimal and disposable
- Real guidance belongs in:
  - section instruction
  - example surfaces
  - helper text
- Required fields should block completion, not first paint
- Input sizing should match task type:
  - short statement = compact
  - explanation = regular textarea
  - multi-part rep = grouped section with multiple fields

## Section model

Shared guided-form lessons should support reusable section metadata:

- `id`
- `title`
- `eyebrow`
- `instruction`
- `layout`
- `fieldIds`
- `completionLabel`

Section-level runtime content can optionally override the section instruction and example copy for a specific lesson.

## CEO-block first-pass rules

- Upgrade `0.1`, `1.1`, `1.2`, and `1.3` to section-aware guided forms
- Use `1.1` as the canonical example of structured guided input
- For `1.1`, split each candidate problem into:
  - who has this problem
  - what painful problem keeps happening
- Non-guided workbench types should inherit the new header, status rail, and footer hierarchy in this pass
- Do not redesign the coach system or invent new builder tools in this pass

## Persistence and compatibility

- Guided-form storage can change before launch
- Use explicit workbench field-shape versioning so stale prelaunch drafts are cleared instead of misread
- Keep artifact previews readable by using learner-facing labels and hiding private storage keys

## Acceptance bar

The redesign is correct when:

- `1.1` feels unmistakably guided instead of worksheet-like
- `0.1`, `1.1`, `1.2`, and `1.3` all use the same section-aware system
- progress is visible before lesson completion
- examples no longer depend on placeholder text
- old prelaunch drafts for changed lessons do not leak into the new UI
