---
name: PRD-eng-review
description: Review a `plan_packet_v1` before coding by challenging scope, inspecting existing architecture, finding reuse opportunities, identifying technical risks and failure modes, and enriching the same packet with an engineering approval or revision decision. Use when the user asks for engineering review, architecture review, implementation-plan review, or when `PRD-strategy` marks eng review as required.
---

# PRD - Eng Review

Use this skill for the engineering review pass that happens after planning and before code implementation.

This skill does not create a second artifact type. It reads an existing `plan_packet_v1`, inspects the real codebase, and returns the same packet with enriched engineering guidance and an approval status.

## Required Inputs

- a `plan_packet_v1` object, usually from `PRD-strategy`
- repo or codebase access
- known constraints if available: auth, billing, data, migration, rollout, performance, or environment

## Read Order

1. Read the provided `plan_packet_v1`.
2. Read `tasks/todo.md` if it exists before substantial work.
3. Read `todo.md` if the work is meaningful enough to affect the repo tracker.
4. Read the relevant code paths, schemas, contracts, and existing systems referenced by the packet.
5. Read [references/PRD-eng-review-prompts.md](references/PRD-eng-review-prompts.md).

## Default Workflow

1. Run the Eng Review prompt from the reference file.
2. Inspect the existing codebase surfaces named in the packet.
3. Challenge the proposed slice and scope.
4. Prefer reuse of existing architecture where possible.
5. Enrich the same `plan_packet_v1` with findings, risks, failure modes, test expectations, rollout notes, and an engineering decision:
   - `approved`
   - `revise`
   - `blocked`
6. Return the updated packet. Do not edit code.

## Guardrails

- Do not invent a second review artifact.
- Do not rewrite the whole plan if small targeted revisions are enough.
- Do not nitpick stylistic preferences that do not change implementation risk.
- Focus on scope, architecture, data, auth, billing, integrations, testing, rollout, and failure modes.
- Keep findings actionable for a downstream coding agent.
- Do not edit code from this skill.

## Machine-Readable Contract

This skill consumes and returns:

- `plan_packet_v1`

Keep the schema stable and enrich the packet instead of replacing it.

## Output Expectations

The updated packet should make these fields explicit:

- engineering review status
- engineering review reason
- engineering review findings
- updated technical risks
- updated failure modes
- updated test plan
- updated rollout notes
- recommended next agent

## Use This Skill For

- "review this plan before coding"
- "do an engineering review"
- "challenge this implementation plan"
- "is this slice safe to build"
- "what are the technical risks here"
- "approve or revise this coding handoff"

## Do Not Use This Skill For

- initial product planning with no packet yet
- direct code implementation
- bug RCA or remediation
- final git packaging
