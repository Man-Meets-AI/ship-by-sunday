---
title: 'Program Docs Sync'
summary: 'Prompt asset for syncing durable docs after a Program child ExecPlan is validated.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Syncing durable docs after a Program child ExecPlan lands.'
  - 'Checking whether Program-level truth or repo docs drifted after implementation.'
---

# Program Docs Sync

Use this after a Program child ExecPlan has been executed and validated. It is the docs-sync step before the next planning brief is written.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/index.md`, `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, `docs/exec-plans/PLANS.md`, and `docs/prompts/README.md`.

You are syncing durable repository docs after one Program child ExecPlan. Do not start the next ExecPlan. Do not rewrite the planning brief yet.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Use this completed or validated child ExecPlan:
<child_execplan_path>
docs/exec-plans/completed/YYYY-MM-DD-slice.md
</child_execplan_path>

Read:
- `program.md`
- `current-planning-brief.txt` and the referenced planning brief
- the child ExecPlan
- touched files named in the ExecPlan, current diff, or validation receipts
- durable docs that own the changed behavior

If the `docs-sync` skill is available and appropriate, use it.

Focus on:
- README files
- workflow docs
- AGENTS.md surfaces
- docs/
- Program `program.md` only when docs drift is already clear

Rules:
- do not create duplicate truth
- update only the owning surfaces
- prefer precise sync over broad cleanup
- if code changed but docs should not, state why
- do not change historical `planning_brief` frontmatter on completed child ExecPlans

Quality gate before returning:
- Confirm every changed behavior from the child ExecPlan is either reflected in an owning durable doc or explicitly judged not doc-worthy.
- Confirm no duplicate docs truth was introduced.
- Confirm the narrowest relevant markdown validation was run for touched docs.
- Confirm the child ExecPlan records docs synced and any intentionally remaining doc debt.

After changes:
- run `bun run markdown:lint -- --paths <touched-doc-paths>`
- run `bun run markdown:lint -- --paths docs` when docs indexes or repo-wide docs contracts may be affected
- run `bun run programs:lint` if `program.md` or packet artifacts changed

Update the child ExecPlan with:
- docs synced
- durable surfaces intentionally left unchanged
- remaining doc debt, if any

Return:
- docs updated
- validation commands and results
- unresolved doc debt
```
