---
name: land
description: Use when the user asks to land, merge, ship, or shepherd a change through GitHub. This skill cleans a dirty workspace with conventional commits, pushes or updates the PR, runs the repo's agent-review loop, waits for required checks, fixes deterministic failures or genuine flakes, handles merge conflicts, uses merge queue or auto-merge when available, and stays with the change until the relevant commit reaches `main`.
---

# Land

Land the change end to end. Do not stop at "PR opened" or "checks started".

## Branch Model

- Treat this repo's branch flow as authoritative: feature branch -> `dev`, then `dev` -> `main`.
- If the current branch is neither `dev` nor `main`, target `dev` first.
- If the current branch is `dev`, target `main`.
- If the current branch is `main`, verify whether the relevant commit already landed; do not create a PR from `main`.
- Do not ship unrelated `dev` work to `main` just to land one feature. If the `dev` delta contains unrelated risky work, stop and escalate before opening or queueing a release PR.

## Procedure

1. Inspect the repo state first.
   - Run `git status --short --branch`.
   - Run `git fetch origin --prune`.
   - Confirm the current branch, ahead/behind counts, dirty files, remote tracking, and whether a PR already exists.
   - Confirm `gh` is authenticated before relying on PR or Actions commands.

2. Clean the workspace with focused conventional commits.
   - Stage only files that belong to the intended landing scope.
   - Do not absorb or revert unrelated in-flight changes from other work.
   - Use conventional commit messages for every commit.
   - Run the narrowest relevant proof before each commit.
   - Before a meaningful ship step, prefer `bun run lint`, `bun run fmt:check`, and `bun run typecheck`.
   - Run `bun run proof:ci` when the CI surface or release path needs a full local proof pass.
   - Push the source branch once the branch state is clean enough to review.

3. Open or refresh the PR.
   - Reuse the existing PR when one already exists for the source branch.
   - Create a PR only when none exists.
   - Default bases:
     - feature branch -> `dev`
     - `dev` -> `main`
   - Keep the PR title and body factual and compact.

4. Run the agent-review loop before trusting the PR.
   - Use the repo-default multi-agent review prompt:
     `Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`
   - Run that review against the PR base branch, not blindly against the current checkout state.
   - Treat real findings as blocking until fixed or disproved with evidence.
   - Push fixes and rerun the review when the head SHA changes in a way that could affect correctness.

5. Wait on required GitHub checks and handle failures.
   - Use `gh pr checks --required --watch --fail-fast`.
   - When checks fail, inspect the failing workflow and logs before rerunning anything.
   - Use `gh run view <run-id> --log-failed` or JSON views to isolate the exact failed job.
   - Reproduce locally when feasible before declaring the failure a flake.
   - Treat a failure as a real bug unless there is concrete evidence of a transient issue.

6. Distinguish real failures from flakes.
   - Real failure:
     - deterministic test failure
     - lint, typecheck, or build error
     - assertion failure tied to the current diff
     - API misuse, contract break, or missing fixture
   - Flake:
     - network timeout
     - GitHub-hosted runner issue
     - known nondeterministic test with unchanged code and inconsistent reruns
     - infrastructure race that leaves no code-level fix in the current patch
   - Fix real failures at the root, push, and wait for checks again.
   - For a genuine flake, rerun the smallest safe failing scope, then keep watching the PR until the required checks are green.

7. Keep the branch mergeable.
   - If the PR shows conflicts or falls behind base in a way that matters, update it immediately.
   - Prefer merging the latest base branch into the source branch over rebasing shared branches.
   - Resolve conflicts carefully, rerun the relevant proof, and push the resolution commit.

8. Queue or merge the PR the safe way.
   - When the branch is ready, use `gh pr merge --auto`.
   - On branches with merge queue, that command will either enable auto-merge or add the PR to the queue once requirements pass.
   - Do not use `--admin` unless the user explicitly authorizes bypassing protection.
   - If the target branch does not support merge queue, say so explicitly and use the allowed protected-branch merge path instead of pretending queue exists.

9. Stay with the change until it reaches `main`.
   - If the feature PR targets `dev`, wait until it actually lands in `dev`.
   - Then inspect the `dev` -> `main` path.
   - Reuse the existing release PR when one exists.
   - Create the `dev` -> `main` PR only when the current `dev` delta is intentionally ready to ship.
   - Apply the same review, CI, flake, conflict, and queue loop to the release PR.
   - Finish only when the relevant commit is reachable from `origin/main` and the release proof surface is green.

## Preferred Commands

- `git status --short --branch`
- `git fetch origin --prune`
- `git rev-list --left-right --count origin/<base>...<branch>`
- `git log --oneline --decorate --graph origin/<base>..<branch>`
- `gh pr view`
- `gh pr create`
- `gh pr checks --required --watch --fail-fast`
- `gh run view <run-id> --log-failed`
- `gh run rerun --failed <run-id>`
- `gh pr merge --auto`
- `git branch -r --contains <sha>`

## Stop Conditions

- Stop if the repo has mixed-ownership edits that cannot be committed safely.
- Stop if review finds a substantive bug that you cannot fix confidently in the current pass.
- Stop if the `dev` -> `main` release path would ship unrelated work that has not been intentionally approved.
- Stop if GitHub auth, branch protection, or merge-queue policy blocks progress and there is no safe non-admin path.
- Stop if CI is red and the failure cannot be classified as either a reproducible bug or a genuine flake with evidence.
