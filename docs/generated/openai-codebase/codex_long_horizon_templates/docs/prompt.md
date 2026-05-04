# Prompt / Spec

Use this file as the task contract for the current build slice. Replace every bracketed placeholder before handing the task to a coding agent. If a value is genuinely unknown, leave it under **Open questions** with the decision needed and the smallest safe assumption.

## Authority order

1. `docs/facts/project-definition.json`
2. `DESIGN.md`
3. this task spec
4. `docs/plans.md`
5. repo code and tests
6. current chat context

If two sources conflict, stop before changing product behavior and record the conflict in `docs/documentation.md`.

## Task name

[Short, specific task title]

## Objective

[Describe the result we want in plain English.]

## Why this matters

[Business, product, or technical reason this work matters.]

## Product fact inputs

- Product name: [...]
- Product summary: [...]
- Primary user: [...]
- Problem statement: [...]
- Scope in: [...]
- Scope out: [...]
- Non-goals: [...]
- v1 rationale: [...]
- Buyer AI promise: [...]

## Implementation target

- Primary surface: [route, feature, package, script, or docs pack]
- Owning files: [...]
- Supporting files: [...]
- User path affected: [...]
- Data or external systems touched: [...]

## In-scope

- [...]
- [...]
- [...]

## Out-of-scope

- [...]
- [...]
- [...]

## User-visible outcome

[Describe what a user, teammate, or reviewer should be able to do or observe after the work is complete.]

## Constraints

- Platform / stack: [...]
- Performance constraints: [...]
- UX constraints: [...]
- Compatibility constraints: [...]
- Safety / compliance constraints: [...]
- Time / token / cost constraints: [...]
- Product fact constraints: [...]

## Inputs and context

- Relevant code paths: [...]
- Relevant docs: [...]
- Screenshots / mocks / examples: [...]
- Prior decisions to preserve: [...]
- Existing tests or commands that already cover this area: [...]

## Deliverables

- [ ] Code changes
- [ ] Tests
- [ ] Docs updates
- [ ] Demo / run instructions
- [ ] Migration / rollout notes

## Autonomy contract

- Safe assumptions the agent may make: [...]
- Decisions that require customer confirmation: [...]
- Expected documentation updates: [...]
- Forbidden shortcuts or fake-success patterns: [...]

## Done when

- [ ] [...]
- [ ] [...]
- [ ] [...]

## Completion audit checklist

| Requirement | Evidence source | Status |
|---|---|---|
| [Deliverable or done-when item] | [test, command, browser proof, file diff, or doc update] | [Pass / Fail / Blocked] |

## Validation / demo flow

1. [...]
2. [...]
3. [...]

## Risks / edge cases to watch

- [...]
- [...]
- [...]

## Open questions

- [...]
- [...]
- [...]
