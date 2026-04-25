---
name: exec-plan-validate
description: Use after an ExecPlan has been executed far enough that the intended behavior should work, when the user wants repo-owned full-stack proof rather than more implementation. Trigger for requests like "validate this ExecPlan", "prove this plan works", "run the end-to-end proof pass", or "self-test these execplan changes".
---

# ExecPlan Validate

Validate one approved ExecPlan against the real repo-owned launch and proof surfaces, then update the plan with evidence.

This is the shared, human-facing validation skill for the ExecPlan workflow. It is for end-to-end proof after execution, not for initial planning or the main implementation loop.

## Use When

- the target ExecPlan already exists
- the plan has already been written and grilled
- implementation is far enough along that the intended user-visible behavior should now work
- the user wants full-stack proof, self-observation, browser evidence, or runtime validation rather than more speculative coding

## Do Not Use When

- the plan does not exist yet
- the plan still needs a review pass before implementation
- the main gap is still missing implementation rather than proof

If no plan exists yet, use `exec-plan-writer`. If the plan still needs a stress-test pass, use `exec-plan-griller`. If the feature is still materially incomplete, return to `exec-plan-execute` first.

## Required Inputs

- one target ExecPlan path
- the current working tree
- the plan's acceptance criteria and proof expectations

## Required Repo Reads

1. Read `AGENTS.md` first.
2. Read `docs/exec-plans/PLANS.md` next and use it as the maintenance contract.
3. Read the target ExecPlan carefully.
4. Read the repo-owned launch or proof docs that the validation path depends on, such as `docs/release-workflow.md`, `docs/references/observability.md`, workflow-local READMEs, or other documented proof surfaces.

## Validation Posture

Treat the ExecPlan as the source of truth for what must be proven, and treat repo-owned launch scripts as the preferred way to prove it.

- Do not substitute "tests passed" for end-to-end proof when the plan calls for runtime or operator-visible behavior.
- Prefer repo-owned launch, health, and proof commands before inventing ad hoc shell state.
- Keep the validation diff scoped. Fix narrow proof blockers when that clearly completes validation, but do not silently reopen broad implementation work.
- If validation exposes a materially incomplete feature, update the plan and return the work to execution.

## Validation Loop

1. Identify the exact acceptance path you are trying to prove.
2. Run the narrowest deterministic checks first.
3. Discover the existing repo-owned launch, health, smoke, or proof scripts for that path.
4. Boot the smallest necessary local stack through those scripts.
5. Self-observe the running system through health output, logs, browser proof artifacts, screenshots, or other checked-in evidence.
6. Compare the observed behavior with the ExecPlan acceptance criteria.
7. If proof fails because of a narrow issue, repair it and rerun proof.
8. Update the ExecPlan with the actual commands, artifacts, outcomes, and next step.

## Repo-Owned Proof Rules

- Prefer documented repo commands such as `bun run test:contracts`, `bun run test:browser-smoke`, `bun run build`, or narrower feature-specific proof commands when the plan touches app behavior.
- If the validation path already pre-started a local stack or supplied a preflight report, reuse that live stack instead of restarting it.
- Treat the plan's own `### Test Commands` as the deterministic proof surface. Expect those commands to be rerun by the wrapper after each validation attempt.
- Expect the command surface itself to capture at least one deterministic proof artifact before cleanup when the runtime stack is healthy.
- Reuse workflow-local smoke or proof commands when they already exist.
- When a proof artifact is created, record the exact path in the ExecPlan.
- If a required proof surface does not exist yet, record that gap explicitly instead of faking proof with unrelated checks.

## ExecPlan Maintenance Rules

Keep the plan current during the validation pass.

Update at least these sections when validation changes reality:

- `Progress`
- `Surprises & Discoveries`
- `Decision Log`
- `Outcomes & Retrospective`
- `### Test Commands`
- `Artifacts and Notes`
- `Interfaces and Dependencies`

Keep frontmatter honest:

- while the plan is still active, preserve `completed_at: null` and `post_build_recap: null`
- when the proof pass establishes that the work is actually complete, fill `completed_at` and write a real `post_build_recap`

## Completion Criteria

The validation pass is complete only when:

- the relevant deterministic checks have run, or their absence is explicitly justified
- the real proof path has run, or the exact blocker is recorded
- proof artifacts or failure evidence are captured
- the ExecPlan is current
- the next step is explicit, either "plan complete" or "return to execution with this localized gap"

## Summary At Stopping Points

At each meaningful stopping point, return:

- acceptance path attempted
- deterministic checks run and results
- repo-owned launch or proof commands run and results
- artifacts or failures observed
- ExecPlan sections updated
- exact next step

## Canonical References

- `docs/exec-plans/PLANS.md` is the authoritative plan contract
- `references/usage-template.md` contains the preferred invocation pattern for this skill
- `docs/prompts/exec-plan-validate.md` is the older prompt surface this skill was derived from
