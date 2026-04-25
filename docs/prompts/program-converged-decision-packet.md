---
title: 'Program Converged Decision Packet'
summary: 'Prompt asset for synthesizing normalized Program tracks into a crisp decision packet.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Building the converged decision packet for a Program.'
  - 'Reconciling multiple normalized research tracks before dependency ordering.'
---

# Program Converged Decision Packet

Use this after the normalized passes exist. The packet should decide what the Program should treat as true enough to plan against.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, and `docs/prompts/README.md`.

You are building the converged decision packet for one Program. Do not write an ExecPlan. Do not implement code.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Read every normalized pass in the Program root:
- `normalized-track-*.md`
- `normalized-pass-*.md`

Write:
docs/programs/active/YYYY-MM-DD-program-id/converged-decision-packet.md

Use exactly this structure:

# Converged Decision Packet

## Converged Decisions
- only points supported by more than one track, or by one track plus direct repo evidence
- group by theme

## Tensions Or Open Questions
- unresolved points
- conflicting implementation paths
- decisions that still need a deliberate choice

## Strongest Repo Facts
- architectural facts and workflow facts the Program must treat as constraints

## Recommended Direction
- one concise recommendation for overall architecture
- one concise recommendation for sequencing

Rules:
- be strict about evidence
- do not include weak observations
- do not flatten real tensions
- do not name fake consensus when tracks disagree
- optimize for crisp decision-making by a later plan writer

Quality gate before returning:
- Confirm every converged decision names the evidence basis: multiple tracks, one track plus repo evidence, or explicit operator constraint.
- Confirm unresolved tensions remain visible instead of being hidden inside vague recommendations.
- Confirm the recommended direction is specific enough to drive a dependency graph.
- Confirm no child ExecPlan scope has been chosen prematurely.

After writing the packet, run:
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/prompts/program-converged-decision-packet.md`

Return:
- packet path
- converged decisions
- unresolved tensions
- validation commands and results
```
