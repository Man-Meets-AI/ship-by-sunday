---
title: 'Program Completion Review'
summary: 'Prompt asset for deciding whether an active Program can move to completed and writing the final retrospective.'
docType: 'prompt'
status: 'active'
read_when:
  - 'A Program appears to have no required next slice.'
  - 'Moving a Program from `docs/programs/active/` to `docs/programs/completed/`.'
---

# Program Completion Review

Use this when the latest planning brief says no required next slice remains, or when a Program may be ready to move from `active/` to `completed/`.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, `docs/exec-plans/PLANS.md`, and `docs/prompts/README.md`.

You are reviewing one Program for completion. Do not implement product code. Do not mark the Program complete unless the evidence supports it.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Use this completion evidence:
<completion_evidence>
Paste final validation receipts, shipped PRs, child ExecPlan paths, operator signoff, or intentionally deferred follow-up here.
</completion_evidence>

Read:
- `program.md`
- every `planning-brief-*.md`
- `current-planning-brief.txt`
- all child ExecPlans named in the Program
- validation receipts from the child ExecPlans
- durable docs changed by the Program

Completion criteria:
- the intended initiative-level outcome has landed
- no required child ExecPlan remains
- all child ExecPlans are complete or intentionally abandoned with rationale
- the latest planning brief says no required next slice remains, or the Program explains why remaining work is outside this Program
- durable docs and packet artifacts reflect the final state
- `bun run programs:lint` passes before and after the move

If completion is not supported:
- keep the Program under `docs/programs/active/`
- update `program.md` with the real next slice or blocker
- do not move the folder

If completion is supported:
- update `program.md` frontmatter to `status: complete`
- set `completed_at` to the repo-local completion date
- write a concrete `post_build_recap`
- update `Outcomes & Retrospective`
- set `Next Slice` to state that no required next slice remains inside this Program
- move the entire folder from `docs/programs/active/YYYY-MM-DD-program-id/` to `docs/programs/completed/YYYY-MM-DD-program-id/`
- update Program indexes if needed
- preserve every child ExecPlan's historical `planning_brief` path; do not rewrite provenance just because the Program folder moved

Quality gate before returning:
- Confirm every completion claim is backed by a child ExecPlan, validation receipt, doc update, or explicit deferral.
- Confirm the Program retrospective names what actually changed, not just that work is done.
- Confirm no active child ExecPlan remains unaccounted for.
- Confirm `programs:lint` passes after the move.

Run:
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/prompts/program-completion-review.md`
- `bun run plans:lint -- --paths <child-plan-paths>` when child ExecPlans changed during completion

Return:
- completion verdict: complete / not complete
- Program root before and after, if moved
- retrospective updates made
- remaining work, if any
- validation commands and results
```
