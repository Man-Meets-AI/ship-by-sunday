---
name: ENG-commit
description: Land finished engineering work cleanly by reviewing the diff, staging only owned files, splitting the work into small logical conventional commits, updating tests and docs where needed, pushing the branch, and returning a terse handoff. Use when feature work is done and the user asks to commit, land, stage, split commits, clean up a branch, or push finished changes.
---

# ENG-COMMIT

Use this skill when implementation is done and the job is to package the work safely into commits without absorbing unrelated changes.

This is a workspace-local engineering skill for the end of the change lifecycle: selective staging, commit shaping, verification, repo-tracker hygiene, push, terse handoff.

## Required Inputs

- repo with completed local work
- git branch access
- task scope clear enough to separate owned vs unrelated edits
- repo tracking files if present, especially `tasks/todo.md`, `todo.md`, and `CHANGELOG.md`

## Read Order

1. Read the user request and current task scope.
2. Read `git status --short` and a diff summary.
3. Read only the files that appear to belong to the task.
4. Read `tasks/todo.md`, `todo.md`, and `CHANGELOG.md` only if the change may require updates there.

## Default Workflow

1. Review the diff and group files by ownership.
   - Stage only files that clearly belong to your work.
   - Leave unrelated edits untouched.
   - If ownership is mixed and your changes cannot be isolated safely, omit the file and note it in the handoff.
2. Decide whether regression tests materially reduce risk.
   - Add tests when they cover real failure risk.
   - If no meaningful regression test fits, say that explicitly.
3. Update tracking and docs.
   - Update `tasks/todo.md` with the local execution record.
   - Update `todo.md` with terse status, output, blocker, or follow-up notes.
   - Update docs when behavior, setup, UX, API, or maintenance expectations changed.
   - Update `CHANGELOG.md` only for meaningful customer-facing changes users would notice.
4. Shape commit history.
   - Prefer small logical commits.
   - Split implementation, tests, and docs or tracker updates when that improves history.
   - Use conventional commit messages for every commit.
5. Verify the final state.
   - Run the lightest sufficient test set for the change.
   - Confirm only intended files are staged in each commit.
6. Push the branch unless the user explicitly says not to.
7. Return the final handoff in terse telegraph style.

## Commit Split Rubric

Prefer separate commits for:

- implementation
- regression tests
- docs, `todo.md`, and `CHANGELOG.md`

Combine them only when separation adds noise instead of clarity.

## Guardrails

- Do not revert, reformat, or absorb unrelated changes from other developers.
- Do not include mixed-ownership files unless your changes can be isolated safely.
- Do not invent test coverage, doc updates, or changelog justification.
- Keep tracker updates terse and factual, not narrative.
- Do not stop after local commits if push is part of the request.
- If the request is only to refine the workflow itself, edit the skill instead of making repo commits.

## Final Handoff Contract

Always return:

- commit SHAs and messages
- tests added and tests run
- docs updated
- `todo.md` updates made
- whether `CHANGELOG.md` was updated, and why or why not
- files intentionally omitted because of mixed ownership or overlapping edits
- remaining follow-ups or risk

Communication style:

- terse
- telegraph style
- no long essay

## Use This Skill For

- "commit this"
- "land it cleanly"
- "stage only my changes"
- "split this into clean commits"
- "push the branch"
- "package this feature work"

## Do Not Use This Skill For

- starting new feature implementation
- broad code review before work is done
- release-note writing without git packaging
- debugging or remediation work that still needs root-cause analysis
