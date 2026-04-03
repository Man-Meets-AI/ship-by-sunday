# Ship by Sunday Build Checklist

Use this before, during, and after any substantial build run from a Ship by Sunday starter snapshot.

## 1. Task definition

- [ ] The objective is explicit and concrete.
- [ ] The expected deliverable is named.
- [ ] The user-visible outcome is described.
- [ ] `scope_in` is written down.
- [ ] `scope_out` is written down.
- [ ] `non_goals` are written down.
- [ ] Hard constraints are listed.
- [ ] Relevant code paths, docs, and examples are attached.
- [ ] Risks and dependencies are listed.
- [ ] For risky work, rollback expectations are defined.

## 2. Facts vs workflow

- [ ] The task is grounded in stable project facts, not lesson progress.
- [ ] Workflow state is not being treated as product truth.
- [ ] Ephemeral runtime state is not being written into the spec or plan.
- [ ] Scope changes are reflected in the blueprint facts before implementation.

## 3. Durable memory setup

- [ ] `AGENTS.md` exists in the build blueprint.
- [ ] `docs/prompt.md` exists for the current initiative.
- [ ] `docs/plans.md` exists for milestone sequencing.
- [ ] `docs/implement.md` exists for runbook and execution rules.
- [ ] `docs/documentation.md` exists for live status and audit logging.

## 4. Planning quality

- [ ] A plan exists before major implementation starts.
- [ ] The plan is milestone-based.
- [ ] Each milestone is small enough to finish in one loop.
- [ ] Each milestone has acceptance criteria.
- [ ] Each milestone has concrete validation commands.
- [ ] The plan defines a stop-and-fix rule.
- [ ] The plan names intended architecture and file-ownership boundaries.
- [ ] The plan includes dependencies and rollback path.

## 5. Execution discipline

- [ ] The run follows `docs/prompt.md`, then `docs/plans.md`, then `docs/implement.md`.
- [ ] Diffs stay scoped to the active milestone.
- [ ] Progress is logged continuously in `docs/documentation.md`.
- [ ] When a check fails, the failure is repaired before forward progress.
- [ ] Scope creep is explicitly rejected unless the plan is updated.

## 6. Verification loop

- [ ] Validation runs after every milestone.
- [ ] Relevant checks are listed:
  - [ ] tests
  - [ ] lint
  - [ ] typecheck
  - [ ] build
  - [ ] smoke or demo flow
- [ ] Failed checks are fixed before proceeding.
- [ ] If a validation step cannot run, the reason is logged.
- [ ] Final behavior is verified, not just compilation.

## 7. Handoff

- [ ] Final summary names what changed.
- [ ] Final summary names what was verified.
- [ ] Final summary names open issues and follow-ups.
- [ ] Final summary includes run or demo instructions.
- [ ] Relevant docs were updated along with the code.
