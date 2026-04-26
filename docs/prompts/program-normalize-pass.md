---
title: 'Program Normalize Pass'
summary: 'Prompt asset for converting one Program research pass into a normalized decision memo.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Normalizing a Program research pass.'
  - 'Preparing track memos before convergence.'
---

# Program Normalize Pass

Use this once per research pass. The output should clean one source track without merging it with other tracks.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, and `docs/prompts/README.md`.

You are normalizing one Program research pass. Do not merge this track with other tracks. Do not write the converged decision packet yet. Do not implement code.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Read this research pass:
<research_pass_path>
docs/programs/active/YYYY-MM-DD-program-id/track-N-slug.md
</research_pass_path>

Write this normalized pass:
<normalized_pass_path>
docs/programs/active/YYYY-MM-DD-program-id/normalized-track-N.md
</normalized_pass_path>

Use exactly this structure:

# Track N Normalized

## Facts
- only concrete repo-backed or source-backed facts

## Recommendation
- the strongest recommendation from this track

## Risks
- only high-signal risks

## Code Seams
- exact files, modules, APIs, docs, workflows, or external interfaces implicated

## Proposed Slices
1. ...
2. ...
3. ...

Rules:
- remove repetition
- remove weak observations
- preserve important file references and evidence
- distinguish facts from recommendations
- do not add new ideas
- do not merge with other tracks yet
- keep unresolved claims marked as unresolved

Quality gate before returning:
- Confirm every fact is backed by the source research pass or direct repo evidence.
- Confirm the recommendation is the strongest recommendation from this track, not a compromise with other tracks.
- Confirm risks are actionable and high-signal.
- Confirm proposed slices are concrete enough to compare during convergence.

After writing the normalized pass, run:
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/prompts/program-normalize-pass.md`

Return:
- normalized pass path
- strongest recommendation
- high-signal risks
- validation commands and results
```
