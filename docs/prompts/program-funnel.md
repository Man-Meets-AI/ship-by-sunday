---
title: 'Program Funnel'
summary: 'Prompt asset for turning stable multi-track research into one checked-in folder-owned Program packet.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Creating the first Program packet for a multi-ExecPlan initiative.'
  - 'Converting stable research passes into Program-owned planning artifacts.'
---

# Program Funnel

Use this when an initiative is too large for one ExecPlan and the framing is stable enough to deserve a checked-in Program root under `docs/programs/active/<YYYY-MM-DD-program-id>/`.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, `docs/exec-plans/PLANS.md`, and `docs/prompts/README.md` next.

You are creating one folder-owned Program packet. Do not implement product code. Do not create a child ExecPlan yet unless the user explicitly asks for it after the packet exists.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Use these stable research inputs:
<research_inputs>
Paste the durable research notes, current findings, release analysis, repo inspection notes, or selected transcript excerpts here.
</research_inputs>

Optional constraints:
<extra_constraints>
Add scope boundaries, ordering constraints, cross-repo constraints, release deadlines, or validation requirements here.
</extra_constraints>

Use the artifact-level Program prompts as the step contracts:
1. `docs/prompts/program-initialize.md`
2. `docs/prompts/program-research-passes.md`
3. `docs/prompts/program-normalize-pass.md`
4. `docs/prompts/program-converged-decision-packet.md`
5. `docs/prompts/program-dependency-graph.md`
6. `docs/prompts/program-plan-split-recommendation.md`
7. `docs/prompts/program-cross-repo-review.md`
8. `docs/prompts/program-planning-brief.md`
9. `docs/prompts/program-doc-synthesis.md`

Create or update only the Program packet files under the Program root.

Required packet outputs:
- `program.md`
- one or more durable research passes named `track-<N>-<slug>.md` or `research-pass-<slug>.md`
- one or more normalized passes named `normalized-track-<N>.md` or `normalized-pass-<slug>.md`
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- `cross-repo-review.md`
- `planning-brief-1.md`
- `current-planning-brief.txt`

Artifact rules:
- Keep rough unresolved scratch out of the Program folder.
- The Program folder should contain durable artifacts a later agent can trust.
- `current-planning-brief.txt` must contain exactly one filename: `planning-brief-1.md`.
- `planning-brief-1.md` must include the frontmatter required by `programs:lint`.
- `program.md` must follow `docs/programs/PROGRAMS.md`.
- `program.md` must name the first recommended child ExecPlan slice but must not duplicate that ExecPlan body.
- Use repo-relative paths in prose.
- Preserve source-of-truth boundaries explicitly when the Program crosses systems or repositories.

The packet should answer:
- why this initiative exists
- which facts survived research
- what decision packet governs the work
- what depends on what
- how the initiative should split into child ExecPlans
- what the first child ExecPlan should do
- what validation proves the Program is complete

Quality gate before returning:
- Confirm each required packet artifact exists in the Program root.
- Confirm every durable decision is traceable back to a research pass, normalized pass, direct repo evidence, or explicit operator constraint.
- Confirm `planning-brief-1.md` is sufficient for `docs/prompts/exec-plan-writer.md` to write the first child plan without chat history.
- Confirm the packet does not contain unresolved scratch notes that a later agent could mistake for settled Program truth.

After writing the packet, run:
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/prompts/README.md docs/prompts/program-funnel.md docs/prompts/program-initialize.md docs/prompts/program-research-passes.md docs/prompts/program-normalize-pass.md docs/prompts/program-converged-decision-packet.md docs/prompts/program-dependency-graph.md docs/prompts/program-plan-split-recommendation.md docs/prompts/program-cross-repo-review.md docs/prompts/program-planning-brief.md docs/prompts/program-doc-synthesis.md`

Return:
- the Program root
- the first child ExecPlan recommendation
- the packet artifacts created or updated
- validation commands and results
- any remaining blockers or assumptions
```
