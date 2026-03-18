# Vendored `for_youtube` Bundle

Source copied from:

- `/Users/parkerrex/Downloads/for_youtube 2`

Purpose:

- Preserve the original Python/directive bundle inside the repo for local evaluation.
- Keep the imported scripts unchanged so they remain usable as a reference baseline.
- Separate third-party/reference tooling from the repo's production lesson-media pipeline.

What is likely relevant to the current course-media workflow:

- `execution/jump_cut_vad_parallel.py`
- `execution/jump_cut_vad.py`
- `execution/jump_cut_vad_singlepass.py`
- `execution/jump_cut_editor.py`
- `execution/simple_video_edit.py`
- `directives/jump_cut_vad.md`
- `directives/smart_video_edit.md`

What is likely reference-only for now:

- thumbnail recreation
- face-direction analysis
- 3D transition insertion
- cross-niche scraping

Notes:

- The imported bundle was copied as-is.
- `execution/pan_3d_transition.py` appears to contain embedded React/Remotion code inside a Python file and should be treated as broken reference material until reviewed separately.
- Do not treat anything in this folder as repo-owned production automation until it is wrapped, documented, and tested against the Ship by Sunday lesson pipeline.
