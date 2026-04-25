---
title: 'Program Research Passes'
summary: 'Prompt asset for preserving stable research inputs as durable Program packet source artifacts.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Starting a Program Funnel from prior research outputs.'
  - 'Saving track-by-track research before normalization.'
---

# Program Research Passes

Use this at the start of a Program Funnel when research has already happened and the durable parts need to be preserved inside the Program packet.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, and `docs/prompts/README.md`.

You are preserving source research for one Program packet. Do not normalize, synthesize, plan, or implement yet.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Use these research inputs:
<research_inputs>
Paste each research pass, subagent result, transcript excerpt, repo inspection summary, release note analysis, or external protocol finding here.
</research_inputs>

Write one durable research pass file per coherent source track under the Program root.

Naming rules:
- Use `track-<N>-<slug>.md` when the input came from a numbered track.
- Use `research-pass-<slug>.md` when the input is not naturally numbered.
- Keep filenames stable, lowercase, and descriptive.

Content rules:
- Preserve the source findings faithfully.
- Remove only obvious chat scaffolding, duplicate greetings, and non-evidence filler.
- Keep concrete file paths, commands, URLs, dates, versions, and observed outputs.
- Mark unverified claims as unverified instead of upgrading them into facts.
- Do not merge tracks.
- Do not add new recommendations beyond what the source track actually supports.
- Do not write normalized memos or convergence artifacts in this step.

Quality gate before returning:
- Confirm each research pass maps to one coherent source track.
- Confirm all important evidence handles from the input survived: file paths, command outputs, URLs, dates, versions, and observed failures.
- Confirm unverified or inference-based claims are labeled as such.
- Confirm the next prompt can normalize each pass without needing the original chat transcript.

After writing the research passes, run:
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/prompts/program-research-passes.md`

Return:
- Program root
- research pass files created or updated
- any source tracks intentionally excluded and why
- validation commands and results
```
