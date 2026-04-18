---
title: 'ExecPlans'
summary: 'This file defines the repository contract for an execution plan, referred to here as an ExecPlan. An ExecPlan is a self-contained Markdown plan that a coding agent can follow to deliver a working feature or system change.'
docType: 'plan_contract'
status: 'active'
read_when:
  - 'Reviewing the ExecPlan contract.'
  - 'Checking planning rules before writing or revising an ExecPlan.'
---

# ExecPlans

This file defines the repository contract for an execution plan, referred to here as an ExecPlan. An ExecPlan is a self-contained Markdown plan that a coding agent can follow to deliver a working feature or system change.

Treat the reader of an ExecPlan as a complete beginner to this repository. They have only the current working tree and the single ExecPlan file you provide. There is no memory of prior plans and no external context.

In this repository, store per-initiative ExecPlans in `docs/exec-plans/active/` while they are unfinished and move them to `docs/exec-plans/completed/` when they are complete.

## Repo-specific conventions

In this repo, every new ExecPlan file must use a dated filename in the form `YYYY-MM-DD-<slug>.md`. Use the local repo date on the day the plan is first created. If the slug already exists for that date, append a numeric suffix such as `-2` or `-3` after the slug. Existing older undated plan files are legacy files and do not need to be renamed unless a separate task explicitly asks for that migration.

This repo now ships a dedicated ExecPlan linter and markdown linter. When you touch a plan, validate it with `bun run plans:lint -- --plan <path>`, the repo’s normal quality surface where relevant, `bun run markdown:lint -- --paths <path-or-dir>`, `git diff --check`, and a direct read-through against this contract. Untouched historical archives under `docs/exec-plans/completed/` should not block unrelated docs work unless you target them explicitly.

In this repo, every new or revised ExecPlan must start with YAML front matter that includes `title`, `status`, `created_at`, `completed_at`, `summary`, `post_build_recap`, and `read_when`.

Before authoring or revising an ExecPlan here, read `AGENTS.md` first. Then inspect the real code, docs, and runtime surfaces the plan touches before deciding what the plan should say.

When a plan needs validation guidance, default to the repo's standard quality surface: `bun run format`, `bun run lint`, `bun run typecheck`, plus any narrower workflow-specific checks that prove the feature actually works.

When a plan changes durable repo behavior, the plan should name the writeback surfaces that must be updated at the end of implementation, such as `README.md`, `AGENTS.md`, `docs/*`, `.github/workflows/*`, `apps/web/content/docs/*`, or generator-owned docs under `packages/blueprint-compiler/src/repo-generation/`.

## How to use ExecPlans and PLANS.md

When authoring an ExecPlan, follow `docs/exec-plans/PLANS.md` to the letter. If it is not in your context, refresh your memory by reading the entire file. Be thorough in reading and re-reading the relevant source material before freezing the plan. Start from the required structure and flesh it out as you do your research.

When implementing an ExecPlan, do not ask for "next steps" if the plan already defines them. Proceed to the next milestone or the next smallest validatable slice inside that milestone. Keep all living sections up to date at every stopping point so it is always possible to resume from the ExecPlan alone.

When discussing or revising an ExecPlan, record the change in the plan itself so the reasoning stays visible to the next contributor.

## When to use an ExecPlan

Use an ExecPlan for complex features, long-horizon tasks, migrations, risky integrations, or significant refactors. If the work requires multiple milestones, notable research, prototype validation, or careful recovery steps, write an ExecPlan before implementation.

## Non-negotiable requirements

Every ExecPlan must be fully self-contained. Self-contained means that, in its current form, it contains all knowledge and instructions needed for a novice to succeed.

Every ExecPlan is a living document. Contributors are required to revise it as progress is made, as discoveries occur, and as design decisions are finalized. Each revision must remain fully self-contained.

Every ExecPlan must enable a complete novice to implement the feature end to end without prior knowledge of this repository.

Every ExecPlan must produce demonstrably working behavior, not merely code changes that claim to satisfy a definition.

Every ExecPlan must define every term of art in plain language or avoid the term entirely.

Purpose and intent come first. Begin by explaining, in a few sentences, why the work matters from a user's perspective, what someone can do after the change that they could not do before, and how to see it working. Then guide the reader through the exact steps to achieve that outcome, including what to edit, what to run, and what they should observe.

The agent executing the plan can list files, read files, search, run the project, and run tests. It does not know any prior context and cannot infer what you meant from earlier milestones. Repeat any assumption you rely on.

Do not point the implementer at external blogs or docs for required knowledge. If external knowledge matters, restate the relevant guidance inside the plan in repository-specific terms.

## Formatting rules

Write in plain prose. Prefer sentences over lists. Avoid checklists, tables, and long enumerations unless brevity would obscure meaning. Checklists are permitted only in the `Progress` section, where they are mandatory. Narrative sections must remain prose-first.

When returning an ExecPlan in chat, wrap the entire plan in one fenced `md` code block and do not nest additional fenced code blocks inside it. Present commands, expected transcripts, diffs, or code examples as indented blocks inside that single fence.

When writing an ExecPlan directly to a Markdown file, omit the outer triple backticks so the file contains only the plan.

Use standard Markdown headings with blank lines after headings.

## Front Matter

Every ExecPlan must begin with YAML front matter before the title. Use exactly one `---` block at the top of the file, then a blank line, then the title and body.

Required keys:

- `title`: the human-readable title of the plan. It must match the H1 exactly.
- `summary`: one short sentence that describes the plan and the user-visible result it is trying to deliver.
- `status`: the current lifecycle of the plan. Allowed values are `active` and `complete`. Use `active` while the plan still has implementation, validation, or follow-up work left. Use `complete` only after the work is finished and the retrospective is written.
- `created_at`: the local repo date when the plan was first created, formatted as `YYYY-MM-DD`. This value should never change after creation.
- `completed_at`: the local repo date when the plan actually became complete, formatted as `YYYY-MM-DD`, or `null` while the plan is still active.
- `post_build_recap`: a short finished-state recap of what actually changed after implementation, or `null` while the plan is still active. This is not the same as `summary`; `summary` is forward-looking and `post_build_recap` is backward-looking.
- `read_when`: a YAML list of short, concrete triggers for when someone should reopen or reread the plan. Prefer repo-specific situations such as resuming implementation, grilling the plan, validating the final slice, or checking the retrospective.

Keep the front matter compact and machine-readable. Do not add extra keys unless a separate repo rule requires them.

Frontmatter status rules:

- New or unfinished plans should usually start with `status: active`, `completed_at: null`, and `post_build_recap: null`.
- `status: complete` is invalid unless `completed_at` is a real date, `post_build_recap` is non-empty, and `Outcomes & Retrospective` is meaningfully filled in.
- Do not rewrite `summary` after the fact to sound like a finished recap. Keep it as the intended outcome the plan set out to deliver.
- Keep the detailed ExecPlan frontmatter schema canonical in `docs/exec-plans/PLANS.md`. Prompt files and higher-level docs may mirror or point to it, but they should not become an independent competing schema source.

Good active frontmatter:

    ---
    title: Canonicalize The Premiere UXP Handoff
    status: active
    created_at: 2026-04-08
    completed_at: null
    summary: Make the Premiere UXP disk lane the only canonical working-cut-build handoff so package truth, runtime code, and live plugin behavior finally agree.
    post_build_recap: null
    read_when:
      - Resuming implementation.
      - Validating the final slice.
    ---

Good complete frontmatter:

    ---
    title: Canonicalize The Premiere UXP Handoff
    status: complete
    created_at: 2026-04-08
    completed_at: 2026-04-08
    summary: Make the Premiere UXP disk lane the only canonical working-cut-build handoff so package truth, runtime code, and live plugin behavior finally agree.
    post_build_recap: Runtime, contracts, package truth, and the live UXP plugin now all use the same canonical command/result/session-log lane, proven in a real Premiere smoke run.
    read_when:
      - Reviewing the finished migration.
      - Reusing the handoff pattern for another host-app adapter.
    ---

Bad frontmatter:

- missing `title`
- `title` that does not match the H1
- `status: complete` with `completed_at: null`
- `status: complete` with empty or `null` `post_build_recap`
- `summary` rewritten after the fact to sound like a recap instead of an intended outcome

## Guidelines

Self-containment and plain language are paramount. If you introduce a phrase that is not ordinary English, define it immediately and remind the reader how it manifests in this repository by naming the relevant files, modules, commands, or outputs.

Avoid common failure modes. Do not rely on undefined jargon. Do not describe the letter of a feature so narrowly that the resulting code compiles but does nothing meaningful. Do not outsource key decisions to the implementer. When ambiguity exists, resolve it in the plan itself and explain why you chose that path. Err on the side of over-explaining user-visible effects and under-specifying incidental implementation details.

Anchor the plan with observable outcomes. State what the user can do after implementation, the commands to run, and the outputs or behavior they should see. Acceptance should be phrased as behavior a human can verify rather than internal attributes. If a change is internal, explain how its impact can still be demonstrated with tests, logs, or a concrete end-to-end scenario.

Specify repository context explicitly. Name files by full repository-relative path, name functions and modules precisely, and describe where new files should be created. If the work touches multiple areas, include a short orientation paragraph that explains how those parts fit together so a novice can navigate confidently. When running commands, show the working directory and exact command line. When outcomes depend on environment, state the assumptions and provide alternatives when reasonable.

Be idempotent and safe. Write the steps so they can be run multiple times without causing damage or drift. If a step can fail halfway, include how to retry or adapt. If a migration or destructive operation is necessary, spell out backups or safe fallbacks. Prefer additive, testable changes that can be validated as you go.

Validation is not optional. Include instructions to run tests, to start the system if applicable, and to observe it doing something useful. Describe comprehensive testing for any new feature or capability. Include expected outputs and error messages so a novice can distinguish success from failure. State the exact validation commands appropriate to the project toolchain and how to interpret their results.

Capture evidence. When the steps produce terminal output, short diffs, or logs, include them as concise indented examples focused on what proves success.

Use exact section and subsection names when this contract says a heading is required. Do not improvise near-miss aliases such as `Non-Goals` when the contract requires `Out Of Scope`, or `Validation Expectation` when the contract requires `Test Commands`. The exact heading text is part of the contract so prompts and linting can stay deterministic.

## Required structure

Each ExecPlan should follow this structure in order:

1. YAML front matter block with `title`, `status`, `created_at`, `completed_at`, `summary`, `post_build_recap`, and `read_when`
2. `# <Short action-oriented title>`
3. One short paragraph stating that the document is a living execution plan
4. One sentence referencing `docs/exec-plans/PLANS.md` and stating that the ExecPlan must be maintained in accordance with it
5. `## Purpose / Big Picture`
6. `## Progress`
7. `## Surprises & Discoveries`
8. `## Decision Log`
9. `## Outcomes & Retrospective`
10. `## Context and Orientation`
11. `## Plan of Work`
12. `## Milestones`
13. `## Concrete Steps`
14. `## Validation and Acceptance`
15. `## Idempotence and Recovery`
16. `## Artifacts and Notes`
17. `## Interfaces and Dependencies`

## Section expectations

`Purpose / Big Picture` explains the user-visible outcome, why it matters, and how someone will know the change works.

`Progress` uses checkboxes and must always reflect the actual current state of the work. Every stopping point must be documented here, even if that means splitting a partially completed task into completed and remaining parts. Include timestamps.

`Surprises & Discoveries` captures unexpected behaviors, bugs, performance tradeoffs, or insights discovered during implementation. Include concise evidence snippets when possible, ideally from tests or runtime output.

`Decision Log` records every material decision in a consistent format: decision, rationale, and date or author.

`Outcomes & Retrospective` captures final outcomes, lessons, follow-ups, and any remaining gaps once milestones complete. Compare the result against the original purpose.

`Context and Orientation` explains the repository areas, data flow, integration boundaries, dependencies, and definitions that a novice needs to navigate the work safely. Name the key files and modules by full repository-relative path. Do not refer to prior plans.

`Context and Orientation` must also include these exact subsections in this order:

- `### In Scope`
- `### Out Of Scope`

`In Scope` must name the concrete work that belongs in the plan so an implementer can tell what should be built now. `Out Of Scope` must name the adjacent work, follow-ons, exclusions, and non-goals that the implementer must not silently absorb into the current slice.

`Plan of Work` explains the intended sequence of implementation in prose. For each edit, name the file and location and describe what changes.

`Milestones` are narrative, not bureaucracy. Each milestone must be independently verifiable and incrementally implement the overall goal. Introduce each milestone with a brief paragraph describing its scope, what will exist at the end, what to run, and what success looks like.

`Concrete Steps` includes exact commands, working directories, and expected observations. When a command generates output, show a short expected transcript so the reader can compare. This section must be updated as work proceeds.

`Validation and Acceptance` defines how to prove the change works end to end and what checks must pass before the work is considered complete. Phrase acceptance as observable behavior with specific inputs and outputs. When tests are involved, say exactly which commands to run and how to interpret success.

`Validation and Acceptance` must also include the exact subsection `### Test Commands`.

`Test Commands` must list the runnable commands that prove the slice or finished plan works afterward. Prefer command-based proof even when a manual smoke check is also needed. If a meaningful part of the proof cannot be expressed as a command, say so directly and pair the command list with the smallest necessary manual verification step instead of omitting commands entirely.

`Idempotence and Recovery` explains safe reruns, rollback, cleanup, retry behavior, and how to recover from a partially completed risky step. Keep the environment clean after completion.

`Artifacts and Notes` includes the most important transcripts, diffs, or snippets as short indented examples that prove success.

`Interfaces and Dependencies` is prescriptive about the libraries, modules, services, interfaces, types, or function signatures that must exist and why they are part of the plan.

## Living plans and design decisions

ExecPlans must contain and maintain `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective`. These sections are not optional.

As you make key design decisions, update the plan to record both the decision and the thinking behind it. If you change course mid-implementation, document why in the `Decision Log` and reflect the implications in `Progress`.

At completion of a major task or the full plan, write an `Outcomes & Retrospective` entry summarizing what was achieved, what remains, and lessons learned.

## Prototyping milestones and parallel implementations

It is acceptable, and often encouraged, to include explicit prototyping milestones when they de-risk a larger change. Keep prototypes additive and testable. Clearly label their scope as prototyping, describe how to run and observe them, and state the criteria for promoting or discarding them.

Prefer additive code changes followed by subtractions that keep tests passing. Parallel implementations are acceptable when they reduce risk or enable tests to keep passing during a larger migration. Describe how to validate both paths and how to retire one safely.

## Implementation discipline

When implementing from an ExecPlan, stay scoped to the current milestone. Do not widen scope silently. If the intended approach changes materially, update the ExecPlan first.

Run the milestone validation before moving on. If a check fails, stop, diagnose the issue, repair it, rerun validation, and only then continue.

Keep the ExecPlan current while implementing so another agent can resume from the file alone.
