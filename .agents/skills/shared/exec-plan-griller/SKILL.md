---
name: exec-plan-griller
description: Use after an ExecPlan exists and before implementation begins, or when an existing ExecPlan needs a stress-test pass against docs/exec-plans/PLANS.md. Trigger for requests like "grill this ExecPlan", "review this plan before implementation", "stress-test this exec plan", or "repair this ExecPlan so it is implementation-ready".
---

# ExecPlan Griller

Stress-test one repo-local ExecPlan until a fresh coding agent could execute it with minimal surprise.

This is the shared, human-facing skill for ExecPlan review and hardening. It is for grilling and tightening a plan, not for implementation.

## Use When

- an ExecPlan already exists and needs a review pass before implementation
- the plan needs to be checked against `docs/exec-plans/PLANS.md`
- the plan feels vague, under-validated, or likely to create surprises for a newcomer
- the user wants the plan repaired in place rather than replaced wholesale

## Do Not Use When

- there is no plan file yet and the task still needs an initial ExecPlan draft
- the user wants code implementation rather than planning review
- the work is still too vague to have a real plan to grill

If no plan exists yet, use `exec-plan-writer` first.

## Required Inputs

- one target ExecPlan path
- the current plan file contents on disk
- any known concerns such as rollout risk, validation weakness, unclear interfaces, or sequencing confusion

## Required Repo Reads

1. Read `AGENTS.md` first.
2. Read `docs/exec-plans/PLANS.md` next and use it as the contract.
3. Read the target ExecPlan carefully.
4. Inspect the real code paths, docs, tests, and runtime surfaces before asking the user questions.

## Core Review Standard

Walk the plan down each likely failure path and tighten it where a newcomer would get lost or make the wrong move.

Look for:

- scope ambiguity
- hidden dependencies
- sequencing mistakes
- unclear interfaces or contracts
- weak acceptance criteria
- missing validation steps
- rollout, migration, or backfill risk
- missing recovery or rollback instructions
- auth, permissions, or security gaps
- performance or cost traps
- observability gaps
- ownership confusion
- edge cases that materially change the design

## Procedure

1. Confirm the task is grilling, not implementation.
2. Inspect the repository first and resolve anything the repo can answer without asking the user.
3. If high-impact ambiguity remains, ask only the minimum must-have question set.
4. Prefer one high-leverage question at a time.
5. When possible, give options, one recommended answer, and a compact reply format.
6. Once the key ambiguities are resolved, update the target ExecPlan file directly.
7. Keep the target path stable. Do not rename, relocate, or split the plan unless the user explicitly asks for that.
8. Tighten the existing plan with focused edits instead of rewriting the whole file unless the current state is too inconsistent to save.

## What Must Be Checked

Check these contract items explicitly:

- the path follows `docs/exec-plans/active/YYYY-MM-DD-<slug>.md` unless it is a legacy file or the user explicitly chose otherwise
- frontmatter includes `title`, `status`, `created_at`, `completed_at`, `summary`, `post_build_recap`, and `read_when`
- the frontmatter `title` matches the H1
- a near-top sentence says the plan must be maintained in accordance with `docs/exec-plans/PLANS.md`
- `## Context and Orientation` includes `### In Scope` and `### Out Of Scope`
- `## Validation and Acceptance` includes `### Test Commands`
- the plan includes `Artifacts and Notes`
- the plan includes `Interfaces and Dependencies`

If a section is weak, cite the exact section and say what is missing.

## Questioning Rules

- Ask only questions that remain materially unresolved after repo inspection.
- Separate must-have questions from nice-to-have cleanup.
- Do not ask open-ended questions when a tighter framing would remove ambiguity faster.
- Do not ask the user for information the repository can provide.

## Validation Before Returning

After repairing the plan, validate it immediately:

1. Re-read the plan against `docs/exec-plans/PLANS.md`.
2. Run any repo-local docs or markdown validation command if one exists for the touched path.
3. If the repo has no dedicated plan or markdown validator, state that exact reason in the summary instead of pretending the check ran.

## Completion Criteria

The grill is complete only when there are no remaining high-impact ambiguities in:

- user-visible outcome
- scope and out-of-scope boundaries
- architecture and ownership boundaries
- data or API contracts
- milestone sequencing
- validation and proof commands
- migration, rollout, and recovery
- evidence-bearing living sections
- interfaces and dependency contracts

## Summary After Grilling

When the grill is complete, return a short summary with:

- whether the grill is complete or blocked
- the resolved decisions
- any remaining blockers or explicit assumptions
- validation commands run and results
- the exact edits applied to the target plan

## Canonical References

- `docs/exec-plans/PLANS.md` is the authoritative plan contract
- `references/usage-template.md` contains the preferred invocation pattern for this skill
- `docs/prompts/exec-plan-grill.md` is the older prompt surface this skill was derived from
