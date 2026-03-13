# Google Doc Build Tab Source Notes

## Source

- Doc URL: https://docs.google.com/document/d/1XXPU4yBSRGWnQ84IC1grPVxH8qFBgjGt1UWMYkCIEOY/edit?tab=t.0
- Extraction date: 2026-03-13

## Extraction method used in this pass

1. `gws` CLI was tested with:
   - `npx -y @googleworkspace/cli auth status`
   - `npx -y @googleworkspace/cli docs documents get --params '{"documentId":"...","includeTabsContent":true}'`
2. Result: local OAuth was not configured, so direct `gws` read returned auth scope error.
3. To avoid blocking launch work, content was extracted from Google Docs export endpoints:
   - `...?export?format=zip` for HTML + images
   - `...?export?format=txt` for plaintext snapshot
4. Build section was isolated from `Build Block` heading to `Ship Block` heading.

## Artifacts generated

- `build-section-raw.md` (converted markdown snapshot)
- `build-section-raw.txt` (plaintext snapshot)
- `build-image-context-map.tsv` (image-to-heading mapping for Build section)

## Linked outputs

- Digest checklist: `docs/course-ops/checklists/build-block-step-checklist.md`
- Screen-map JSON: `docs/course-ops/checklists/build-block-screen-map.json`
- Build images: `assets/course/build-guide-images/`
- Runtime image copies: `public/course/build-guide-images/`
