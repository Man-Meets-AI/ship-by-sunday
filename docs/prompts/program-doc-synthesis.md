---
title: 'Program Doc Synthesis'
summary: 'Prompt asset for creating or refreshing `program.md` from a complete Program packet.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Creating the canonical `program.md` after Program packet artifacts exist.'
  - 'Refreshing Program-level truth from checked-in packet artifacts.'
---

# Program Doc Synthesis

Use this after the Program packet artifacts exist. The output is the canonical initiative document, not another implementation plan.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, `docs/exec-plans/PLANS.md`, and `docs/prompts/README.md`.

You are creating or refreshing the canonical `program.md` for one Program. Do not write a child ExecPlan. Do not implement code.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Read every Program packet artifact in the root:
- research passes
- normalized passes
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- `cross-repo-review.md`
- `planning-brief-*.md`
- `current-planning-brief.txt`

Write or update:
docs/programs/active/YYYY-MM-DD-program-id/program.md

Rules:
- Follow `docs/programs/PROGRAMS.md` frontmatter and section order exactly.
- Keep `program.md` at Program level: why this initiative exists, what artifacts define it, what has landed, what remains, and what slice is next.
- Do not duplicate child ExecPlan implementation details.
- Use repo-relative paths in visible prose.
- The `Next Slice` section must name the first recommended child ExecPlan slice and its boundaries.
- The `Program Inputs` section must name all packet artifacts that define the Program.
- The `Slice Ledger` should be empty or future-facing if no child ExecPlan exists yet.
- The `Validation and Acceptance` section should define Program-level completion proof, not just one test command.

Quality gate before returning:
- Confirm `program.md` can orient a fresh agent without reading the full chat transcript.
- Confirm `Program Inputs` names the checked-in packet artifacts that actually exist.
- Confirm `Next Slice` matches the current planning brief.
- Confirm the document separates Program-level truth from child ExecPlan implementation details.

After updating `program.md`, run:
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/prompts/program-doc-synthesis.md`

Return:
- Program doc path
- current planning brief version
- next child ExecPlan recommendation
- validation commands and results
```
