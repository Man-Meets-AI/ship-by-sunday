---
title: 'Program Initialize'
summary: 'Prompt asset for creating the minimum checked-in Program root before research artifacts are promoted.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Starting a new Program before the packet artifacts exist.'
  - 'Creating the initial Program folder and skeletal `program.md`.'
---

# Program Initialize

Use this before the Program Funnel when the Program folder does not exist yet.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, `docs/exec-plans/PLANS.md`, and `docs/prompts/README.md`.

You are initializing one checked-in Program root. Do not normalize research, synthesize decisions, write an ExecPlan, or implement product code.

Use this Program identity:
<program_identity>
program_id: kebab-case-program-id
title: Human-readable Program title
created_at: YYYY-MM-DD
</program_identity>

Use this initial framing:
<initial_framing>
Paste the durable objective, known systems, source repositories, known constraints, and why this is larger than one ExecPlan.
</initial_framing>

Create:
- `docs/programs/active/YYYY-MM-DD-program-id/`
- `docs/programs/active/YYYY-MM-DD-program-id/program.md`

The initial `program.md` must:
- follow `docs/programs/PROGRAMS.md` frontmatter and section order
- use `status: active`
- use `completed_at: null`
- use `post_build_recap: null`
- state clearly that the Program is initialized but the packet is not complete yet
- put unchecked placeholders in `Progress` for research passes, normalization, convergence, dependency graph, plan split, review, first planning brief, and first child ExecPlan
- set `Next Slice` to "Complete the Program Funnel packet" until `planning-brief-1.md` exists
- avoid pretending that decisions have converged before they have

Rules:
- Create only the Program root and skeletal `program.md`.
- Do not create placeholder packet files that would mislead `programs:lint`.
- Do not create `current-planning-brief.txt` until `planning-brief-1.md` exists.
- Use repo-relative paths in visible prose.

Quality gate before returning:
- Confirm the folder name date and slug match `created_at` and `program_id`.
- Confirm `program.md` is honest about missing packet artifacts.
- Confirm the next prompt is `docs/prompts/program-research-passes.md`.
- Confirm the Program can be resumed from `program.md` without chat history.

Run:
- `bun run markdown:lint -- --paths docs/programs docs/prompts/program-initialize.md`

Return:
- Program root
- `program.md` path
- packet artifacts still missing
- next prompt path
- validation commands and results
```
