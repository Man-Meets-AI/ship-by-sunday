name: ENG-debugger
description: Investigate software incidents, identify root cause, decide whether direct remediation or an extra planning step is needed, and implement the safest fix with tracked tasks. Use when the user asks to debug a bug, find root cause, diagnose an issue, trace a failure, fix a regression, or remediate a production incident.
---

# ENG-Debugger

Use this skill for software debugging and incident remediation work where the goal is to find the real failure mechanism and fix it cleanly.

This is a workspace-local engineering skill. It keeps a default 2-part chain on hand:

1. investigation
2. remediation

It can temporarily insert a plan-first execution mode inside remediation when the fix is too risky or cross-system for direct edits.

## Required Inputs

- problem report
- repo or codebase access
- environment or runtime context if known
- safety constraints around destructive actions, migrations, or production systems if relevant

## Read Order

1. Read the user request and supplied evidence.
2. Read the relevant logs, stack traces, screenshots, docs, and recent changes.
3. Read the relevant code paths in the repo.
4. Read [references/ENG-debugger-prompts.md](references/ENG-debugger-prompts.md).

## Default Workflow

1. Run the Investigation prompt from the reference file.
2. Decide whether remediation can proceed in `direct_fix` mode or needs `plan_then_fix`.
3. Run the Remediation prompt from the reference file.
4. Track execution in the repo task file:
   - use `tasks/todo.md` if it exists
   - otherwise create `tasks.md`
5. Implement, verify, and report residual risk.

## Execution Mode Rubric

Use `direct_fix` when:

- root cause is clear
- affected surface is small
- no schema or data migration is needed
- no auth, payment, queue, or deployment risk is introduced
- validation is straightforward

Use `plan_then_fix` when any of these are true:

- the fix spans multiple subsystems or service boundaries
- schema, data, auth, payments, queues, or deployments are involved
- there are multiple viable fix strategies with real tradeoffs
- rollback is non-trivial
- the investigation still contains critical unknowns
- the safest fix depends on sequencing, compatibility work, or migrations

## Guardrails

- Do not stop at symptom descriptions.
- Do not invent proof or certainty.
- Prefer the smallest correct fix over wide refactors.
- Preserve existing architecture unless the root cause demands change.
- Add or update tests when practical.
- Verify before declaring the issue fixed.
- If the user only asks for prompt design or workflow design, work on the prompts or skill itself instead of running the debugging chain.

## Output Expectations

During investigation, return the structured RCA contract from the reference prompt.

During remediation, record the execution checklist in the repo task file, complete it step by step, and return a concise summary of:

- execution mode
- files changed
- verification run
- remaining risks or follow-ups

## Use This Skill For

- "debug this"
- "find the root cause"
- "trace this regression"
- "why is this failing"
- "fix this production bug"
- "do an RCA and remediate it"

## Do Not Use This Skill For

- pure code review without a failing behavior
- general architecture brainstorming with no incident
- performance tuning unless there is a concrete failure or regression to investigate
