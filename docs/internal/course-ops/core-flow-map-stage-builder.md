# Core Flow Photo Upload

Last updated: 2026-03-12

## Purpose

Lesson `1.5` now uses a video-first paper exercise instead of the in-app node editor.

The goal is to make the core-flow exercise faster and less fussy while still preserving the downstream `core_flow_image` artifact that later lessons expect.

## Current contract

- Lesson: `CEO 1.5 — Map the Core Flow`
- Workbench type: `paper_photo_upload`
- Artifact key: `core_flow_image`
- Artifact type: `image`

Persisted lesson fields:

- `__core_flow_image_upload`

The private upload field is the saved artifact used for completion and downstream pinned-artifact reuse.

## Student flow

1. Open lesson `1.5`
2. Watch the walkthrough first
3. Draw the core flow off-screen on paper with pen
4. Keep the flow to 5-7 steps
5. Upload one clean photo or screenshot
6. Continue only after the image is saved

Paper is the default. A tablet sketch or other off-screen screenshot still counts if the sequence is clear.

## Validation rules

- saved image is required

## QA checklist

- Confirm the lesson uses the focus-only, video-first layout
- Confirm the upload card stores one image and shows the preview
- Confirm legacy `1.5` structured fields do not satisfy completion without an uploaded image
- Confirm an already-saved `__core_flow_image_upload` still satisfies completion
- Confirm later lessons that pin `core_flow_image` still load cleanly
