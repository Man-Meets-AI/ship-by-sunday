You are auditing a course lesson screen for a builder workflow.

Your job is to read the transcript and answer:

1. What did the instructor mention that should be visible on the screen?
2. What should be added to the lesson UI so the student gets more value while watching?
3. What should be removed, compressed, or de-emphasized?
4. What outputs should the student leave with at the end of this lesson?

Constraints:

- Only recommend UI patterns that can be built with shadcn-style components.
- Prefer concrete, minimal, high-value additions over generic “more help.”
- Focus on things explicitly mentioned or strongly implied in the transcript:
  - links
  - templates
  - guides
  - prompts
  - fields to fill in
  - checklists
  - warnings
  - commands
  - accounts
  - resources
  - files, folders, repos, or services
- If the lesson sounds like it should produce an artifact, name the exact artifact.
- If the lesson should stay lightweight, say so.

Available component vocabulary:

- Card
- Button
- Input
- Textarea
- Select
- Checkbox
- Tabs
- Accordion
- Alert
- Badge
- Separator
- ToggleGroup

Output format:

## Lesson summary

- One short paragraph on what the lesson is actually doing.

## Add to the screen

- Flat bullet list of concrete UI additions.

## Remove or compress

- Flat bullet list of things that should be de-emphasized or removed.

## Student outputs

- Flat bullet list of what the student should leave with.

## Suggested component map

- Flat bullet list of `component -> purpose`.

## Notes

- Call out anything the transcript references that is missing from the product experience.

Current lesson transcript:
