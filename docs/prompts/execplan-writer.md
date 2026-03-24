# ExecPlan Writer

Use this when feature work is already scoped enough to formalize and you want the most OpenAI-aligned planning workflow in this repo: root `PLANS.md` as the contract, plus one self-contained ExecPlan file under `.codex/plans/` that a fresh coding agent can run without chat history.

## Recommended repo pattern

The OpenAI cookbook pattern is:

1. Keep reusable planning rules in `PLANS.md`.
2. Tell the agent in `AGENTS.md` when to use an ExecPlan.
3. For each substantial initiative, author one self-contained ExecPlan markdown file.
4. During implementation, keep that ExecPlan updated as a living document.

In this repository, the per-initiative ExecPlan files live in `.codex/plans/`.

## Preferred usage

Use this in plan mode. Once `AGENTS.md` and `PLANS.md` are in place, prefer a short invocation like this:

```text
/plan Write an ExecPlan for the approved work below.

Read `AGENTS.md` and `PLANS.md` first. Inspect the real code paths before planning. If critical ambiguity remains after repo inspection, ask only the minimum must-have questions needed to unblock the plan.

Write the plan to:
<target_execplan_path>
.codex/plans/example-initiative.md
</target_execplan_path>

Use this planning source:
<feature_outline>
Paste the approved feature outline, selected slice, or PRD excerpt here.
</feature_outline>

Optional constraints:
<extra_constraints>
Add rollout, migration, timeline, compatibility, safety, or stakeholder constraints here.
</extra_constraints>
```

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `PLANS.md` next and follow it to the letter while authoring the plan.

You are in planning mode. Do not implement product code. Your job is to author or update a single OpenAI-style ExecPlan: a self-contained, living Markdown execution plan that a complete newcomer to this repository can use to implement the work end to end without prior chat context.

Before writing the plan:
- Inspect the real code paths, data models, integrations, tests, and existing docs that the work touches.
- Resolve as much ambiguity as possible from the repository itself before asking the user anything.

If the outline remains materially underspecified after repo inspection, switch into clarification mode before writing the plan. Treat it as underspecified if the repo does not make the objective, done criteria, scope, constraints, environment, or safety and rollback expectations clear enough to avoid wrong work.

Clarification mode rules:
- Ask only the minimum set of must-have questions needed to unblock planning.
- Ask 1 to 5 questions in the first pass.
- Prefer short numbered questions.
- Use multiple-choice options when practical.
- Suggest reasonable defaults when practical.
- Include a fast-path reply such as `defaults` when the defaults are acceptable.
- Do not ask questions you can answer with a quick, low-risk repo read.
- Pause before editing the ExecPlan until the must-have questions are answered.
- If the user explicitly wants you to proceed without answers, state your assumptions as a short numbered list and ask for confirmation before continuing.

Use this input as the planning source:
<feature_outline>
Paste the approved feature outline, selected slice, PRD excerpt, or milestone notes here.
</feature_outline>

Optional extra constraints:
<extra_constraints>
Paste any rollout, migration, timeline, safety, performance, compatibility, or stakeholder constraints here.
</extra_constraints>

Write the ExecPlan to this file:
<target_execplan_path>
Set the repository-relative path for the plan file under `.codex/plans/`, for example `.codex/plans/checkout-recovery.md`.
</target_execplan_path>

ExecPlan requirements:
- The plan must be fully self-contained. It must contain all knowledge and instructions needed for a novice to succeed.
- The plan must be a living document. Seed it so it can be updated as implementation progresses.
- The plan must define every term of art in plain language or avoid the term.
- The plan must optimize for a fresh coding agent that has no chat history and only the current working tree plus this single plan file.
- The plan must produce demonstrably working behavior, not merely code changes.
- Purpose and user-visible outcome come first. Explain why the work matters, what someone can do after the change, and how to see it working.
- Do not rely on external blogs or docs. If outside knowledge is required, embed it in the plan itself in your own words.
- Name repository-relative file paths, functions, modules, commands, working directories, and expected observations precisely.
- Resolve reasonable ambiguities in the plan itself and explain why you chose that path.
- If the work has meaningful unknowns, include spike or prototype milestones to prove feasibility before broader implementation.
- Phrase acceptance as observable behavior a human can verify.
- If a change is internal, explain how to demonstrate its impact with tests, logs, or a concrete scenario.
- Prefer prose-first writing. Avoid tables and long enumerations unless they materially improve clarity.
- Use checkboxes only in the `Progress` section.
- In `Progress`, document every stopping point and include timestamps.
- In `Surprises & Discoveries`, include concise evidence snippets when possible.
- In `Decision Log`, use a consistent decision, rationale, and date or author format.
- For commands, include the working directory and short expected transcripts when practical.
- Each milestone must be independently verifiable and incrementally advance the overall goal.
- Keep the plan concrete, scoped, and free of filler.

ExecPlan structure:
- `# <Short action-oriented title>`
- One short paragraph stating that this is a living execution plan.
- One sentence referencing `PLANS.md` from the repository root and stating that the ExecPlan must be maintained in accordance with it.
- `## Purpose / Big Picture`
- `## Progress`
- `## Surprises & Discoveries`
- `## Decision Log`
- `## Outcomes & Retrospective`
- `## Context and Orientation`
- `## Plan of Work`
- `## Milestones`
- `## Concrete Steps`
- `## Validation and Acceptance`
- `## Idempotence and Recovery`
- `## Artifacts and Notes`
- `## Interfaces and Dependencies`

Section expectations:
- `Purpose / Big Picture`: explain the user-visible outcome and why it matters.
- `Progress`: seed the initial major tasks as checkboxes.
- `Surprises & Discoveries`: seed with `None yet` or the first known unknowns discovered during repo inspection.
- `Decision Log`: record initial scope choices and key assumptions with rationale.
- `Outcomes & Retrospective`: seed as future-facing and note any obvious gaps known at plan creation time.
- `Context and Orientation`: explain the relevant repository areas, key flows, data boundaries, dependencies, and definitions a novice needs.
- `Plan of Work`: explain the intended sequence of work in prose.
- `Milestones`: for each milestone, describe what will exist at the end, which files or systems are touched, what to run, and how success is proven.
- `Concrete Steps`: include exact commands, working directories, and expected observations.
- `Validation and Acceptance`: define end-to-end proof, milestone checks, and any smoke test or demo flow.
- `Idempotence and Recovery`: explain safe reruns, rollback, retries, cleanup, and how to recover from partially completed risky steps.
- `Artifacts and Notes`: include concise transcripts, diffs, or snippets that prove success.
- `Interfaces and Dependencies`: be prescriptive about modules, services, libraries, interfaces, types, or signatures that must exist.

Formatting rules:
- If you are returning the ExecPlan in chat, wrap the entire plan in one fenced `md` code block and do not nest other code fences inside it.
- If you are writing the ExecPlan directly to a Markdown file, omit the outer triple backticks so the file contains only the plan.
- Use standard Markdown headings with blank lines after headings.

Output behavior:
- If critical planning inputs are still underspecified after repo inspection, ask the minimum must-have questions first and wait for answers before editing the ExecPlan.
- Otherwise, write or update only the target ExecPlan file.
- Do not start implementation code.
- After writing the plan, return a short summary with:
  - the target plan path
  - the chosen slice
  - the milestone count
  - any blockers or assumptions that still need human confirmation
```
