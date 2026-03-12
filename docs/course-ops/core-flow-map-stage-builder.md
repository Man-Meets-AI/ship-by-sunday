# Core Flow Map Stage Builder

Last updated: 2026-03-12

## Purpose

Lesson `1.5` now uses an in-app stage builder instead of a screenshot-only upload flow.

The goal is to make the core-flow exercise feel like a real reusable asset inside the product, while still preserving the downstream `core_flow_image` artifact that later lessons expect.

## Current contract

- Lesson: `CEO 1.5 — Map the Core Flow`
- Workbench type: `core_flow_map`
- Artifact key: `core_flow_image`
- Artifact type: `image`

Persisted lesson fields:

- `flow_actors`
- `flow_steps`
- `flow_ending`
- `__core_flow_image_upload`

The first three fields are the editable source of truth.

The private upload field is the saved PNG artifact used for completion and downstream pinned-artifact reuse.

## Student flow

1. Open lesson `1.5`
2. The stage seeds from the chosen user and outcome when the draft is still empty
3. Add or edit actors, steps, and the ending on the stage
4. Save the current map image
5. Continue only after the image is saved

Fallbacks:

- `Open FigJam template`
- `Upload external screenshot`

Figma is optional. The in-app stage is the primary path.

## Validation rules

- 1 to 4 actors
- 5 to 7 complete steps
- ending is required
- saved image is required

If the learner edits the map after saving, the saved image is cleared and must be regenerated or replaced before completion.

## QA checklist

- Confirm `1.5` seeds from real `1.2` and `1.3` artifacts
- Confirm the stage fits the full map on first load
- Confirm `Save image` uploads a PNG and shows a preview
- Confirm editing after save invalidates the old image
- Confirm `Upload external screenshot` satisfies completion
- Confirm later lessons that pin `core_flow_image` still load cleanly
