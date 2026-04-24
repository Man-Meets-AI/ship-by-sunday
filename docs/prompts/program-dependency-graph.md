---
title: 'Program Dependency Graph'
summary: 'Prompt asset for turning Program decisions into a dependency-ordered work graph.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Ordering Program workstreams before plan splitting.'
  - 'Checking which Program slices must land before others.'
---

# Program Dependency Graph

Use this after the converged decision packet exists. The graph should optimize for real prerequisite order, not parallelism theater.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, and `docs/prompts/README.md`.

You are building a dependency-ordered work graph for one Program. Do not write an ExecPlan. Do not implement code.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Read:
- `converged-decision-packet.md`
- every `normalized-track-*.md` and `normalized-pass-*.md`
- relevant research passes only when a dependency claim needs source evidence

Write:
docs/programs/active/YYYY-MM-DD-program-id/dependency-graph.md

Use exactly this structure:

# Dependency Graph

## Workstreams
- list the major workstreams

## Dependency Order
1. ...
2. ...
3. ...

## Why This Order
- one short paragraph per workstream explaining what it unlocks

## Unsafe Orders To Avoid
- tempting but wrong sequencing choices

## Proposed Plan Boundaries
- where one ExecPlan should stop and the next should begin

Rules:
- be opinionated
- explain prerequisites, not just preferences
- separate hard dependencies from sequencing conveniences
- call out work that can safely run in parallel only after prerequisites are true
- keep Program-level workstreams separate from ExecPlan implementation details

Quality gate before returning:
- Confirm every hard dependency explains what breaks if the order is reversed.
- Confirm optional parallelism is described only after prerequisites are satisfied.
- Confirm proposed plan boundaries do not hide a dependency inside a later slice.
- Confirm unsafe orders include at least the tempting sequencing mistakes a later agent might choose.

After writing the graph, run:
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/prompts/program-dependency-graph.md`

Return:
- graph path
- dependency order
- unsafe orders to avoid
- validation commands and results
```
