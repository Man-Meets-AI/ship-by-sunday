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

### Wrap-up and unlock screens

Some lessons should not feel like one more worksheet.

If a lesson is a block-end handoff and the real work already happened upstream, treat it as a stage-unlock screen instead of a generic summary dump.

Use this order:

1. Completion hero
2. Short stat strip
3. Curated `What you built` recap
4. Skill recap
5. Footer CTA that names the next unlocked stage

Rules:

- Congratulate the learner explicitly
- Make the next stage obvious in the hero and again in the footer
- Show the best parts of what they built, not every raw field
- Keep the reward system-level and short; no confetti or novelty animation
- Reuse shell completion cues so the footer, banner, and rail all reinforce the same unlock moment

## Hierarchy rules

- One dominant task area per lesson
- Metadata always reads lower than lesson title, intro, and fields
- Workbench container headers should use one thin all-caps label, not an eyebrow-plus-bold-title pair
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

Rendering note:

- `eyebrow` can stay in the lesson contract for compatibility, but the shared section shell should render only the section title as the visible header label.

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

## Manifest contract rules

- Lesson unlocks must be declared explicitly in the lesson manifest:
  - `unlocks.lessons` for next lesson ids
  - `unlocks.blocks` for next block ids
- Cross-lesson handoffs should not infer structure from field names. If a lesson needs structured source data from a prior artifact, declare the source mapping explicitly on the handoff config.
- `select_candidate_problem` handoffs should declare:
  - `selectionFieldId`
  - `options` with `index`, `ownerSourceFieldId`, and `statementSourceFieldId`
  - `persistedFields` for any copied snapshot fields that should be stored on the target lesson artifact
- Artifact titles that need special learner-facing context should use explicit manifest metadata such as `artifact.contextTitle`, not preview-label sniffing in the renderer.
- Contract tests should validate that handoff source field ids exist and that persisted handoff target ids are unique.

## Acceptance bar

The redesign is correct when:

- `1.1` feels unmistakably guided instead of worksheet-like
- `0.1`, `1.1`, `1.2`, and `1.3` all use the same section-aware system
- progress is visible before lesson completion
- examples no longer depend on placeholder text
- old prelaunch drafts for changed lessons do not leak into the new UI
- block wrap-up lessons can feel like a stage clear without inventing a one-off shell path
