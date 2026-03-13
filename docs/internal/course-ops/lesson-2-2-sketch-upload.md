# Lesson 2.2 Sketch Upload Reset

## Why this changed

`Sketch Before Software` was reading like a generic upload form instead of a momentum-building lesson. The new structure is meant to make one thing obvious:

1. watch the short sketch prompt
2. sketch fast off-screen
3. upload proof
4. move on to storyboarding

No in-app drawing canvas was added. The lesson is intentionally upload-first.

## Student-facing structure

- Default layout: `focus`
- Workbench type: `sketch_upload`
- Primary artifact: `Sketch Set`
- Required action to complete: upload at least one stored sketch image
- Strong suggestion in the UI: sketch `3-5` rough screens before uploading

## Workbench anatomy

- `Watch first` card
  - Uses the existing lesson video payload inline instead of hiding the video in split view
  - Falls back to the existing `Video not wired yet.` placeholder until media is attached
- `Sketch rules` card
  - Repeats the blunt instruction and keeps the lesson from feeling like a blank form
- `Upload sketch set` card
  - Dominant multi-image upload action
  - `Add more sketches` and `Replace all` controls
  - Simple remove-per-image action in the gallery
- `Template` card
  - Keeps the worksheet/template secondary
- `Need context?`
  - Hides `Product Brief` and `Reference Board` until the learner wants them

## Saved artifact contract

- Field id: `sketch_upload`
- Field kind: `image_uploads`
- Persisted value: `UploadFieldValue[]`
- Persistence rule: strip preview-only URLs before save, keep `storageId` and file metadata
- Read rule: hydrate each stored upload with a signed `url`
- Summary rule: render upload arrays as human-readable counts such as `2 images uploaded`

## QA checklist

- Desktop: upload one image, complete the lesson, reload, confirm the sketch still renders
- Desktop: upload multiple images, remove one, confirm the others remain
- Mobile: use `image/*` picker or camera path and confirm the upload still stores cleanly
- Flow: verify `2.3` still pins the saved `Sketch Set`
- Flow: verify the artifacts area shows the sketch set as an uploaded-image count instead of raw JSON
