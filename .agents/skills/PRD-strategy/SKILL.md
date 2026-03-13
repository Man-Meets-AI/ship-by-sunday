---
name: PRD-strategy
description: Create a machine-readable feature plan packet for a downstream coding agent by classifying the request, decomposing vague asks into slices, choosing the thinnest valuable slice, and defining scope, acceptance, dependencies, risks, and whether engineering review is required. Use when the user asks for a PRD, feature strategy, plan, implementation handoff, slice selection, or 0-to-1 feature planning.
---

# PRD - Strategy

Use this skill for pre-implementation planning work when the output should be a coding-agent-ready plan, not code changes.

This skill is router-first and plan-only. It does not implement code. Its job is to turn a request into one stable `plan_packet_v1` artifact that a coding agent or a follow-up engineering review pass can consume.

## Required Inputs

- feature request, product ask, or implementation goal
- repo or codebase access
- known constraints if available: auth, billing, data, migration, rollout, timeline, or environment

## Read Order

1. Read the user request and any supplied acceptance criteria.
2. Read `tasks/todo.md` if it exists before substantial work.
3. Read `todo.md` if the work is meaningful enough to affect the repo tracker.
4. Read the relevant code paths, schemas, contracts, and existing feature surfaces before finalizing scope.
5. Read [references/PRD-strategy-prompts.md](references/PRD-strategy-prompts.md).

## Default Workflow

1. Run the Strategy prompt from the reference file.
2. Inspect the relevant codebase surfaces before freezing scope.
3. Classify the request and normalize it into candidate slices.
4. Choose the thinnest valuable slice.
5. Draft one `plan_packet_v1` object for that slice.
6. Decide whether engineering review is required:
   - `skipped_low_risk`
   - `required`
7. Return the packet. Do not edit code.

## Guardrails

- Do not turn the output into generic PRD prose.
- Do not create multiple artifact types for the same handoff.
- Prefer one stable JSON packet over multiple human-style documents.
- Prefer the smallest slice that can ship meaningful value.
- Do not assume engineering review is always required.
- Do not edit code from this skill.
- If the user only asks to rename, refine, or redesign the planning workflow itself, edit the skill rather than producing a feature packet.

## Machine-Readable Contract

This skill outputs one stable JSON contract:

- `plan_packet_v1`

`PRD-strategy` creates the first-pass packet.
`PRD-eng-review` consumes and enriches that same packet.

Keep field names stable unless both skills are updated together.

## Output Expectations

The packet should always make these fields explicit:

- request classification
- candidate slices
- chosen slice
- in-scope and out-of-scope boundaries
- acceptance contract
- affected systems
- dependencies
- technical risks
- test plan
- rollout notes
- blocked questions
- engineering review status
- recommended next agent

## Use This Skill For

- "make a PRD"
- "plan this feature"
- "break this into slices"
- "which slice should we build first"
- "turn this into a coding handoff"
- "0 to 1 plan for this"
- "decide if this needs eng review before coding"

## Do Not Use This Skill For

- direct code implementation
- bug RCA or remediation
- final git packaging
- post-implementation code review
