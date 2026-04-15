---
name: land-live
description: Use when the user asks to land, merge, ship, release, go live, or shepherd a change through this repo's GitHub flow. This skill follows Ship by Sunday's real feature-branch-to-dev-to-main path, cleans only the intended scope, runs the repo's review loop, waits for the actual staging and production proof gates, applies the repo's billing-sensitive release rules, and stays with the release until the relevant commit is proven on `main`.
---

# land-live

Land the change end to end. Do not stop at "PR opened", "checks started", or "merged to dev".

This is a workspace-local release skill. Treat the repository docs and workflows as authoritative over generic GitHub habits.

## Read Order

1. `AGENTS.md`
2. `.docs/scripts.md`
3. `docs/release-workflow.md`
4. `apps/web/content/docs/ship-live.mdx`
5. `qa/AGENTS.md`
6. `qa/README.md`
7. `docs/internal/observability.md` only when checkout, webhook, or incident recovery is in scope

## Default Stance

- Stay on the real repo path: feature branch -> `dev`, then `dev` -> `main`.
- Keep the landing scope tight. Do not absorb unrelated work just to make the branch clean.
- Treat feature branches as preview-only. The integrated buyer-flow proof belongs on `dev`, and production proof belongs after `main`.
- Use `eng-commit` when the tree is dirty and the right next step is focused staging plus conventional commits.
- Use the repo-default multi-agent review workflow before trusting either a feature PR or a release PR.
- Stay with the release until the exact commit is reachable from `origin/main`, Vercel and Convex have settled, and the post-release proof surface is green.

## Branch Model

- If the current branch is a feature branch, target `dev`.
- If the current branch is `dev`, target `main`.
- If the current branch is `main`, do not open a PR from `main`. Confirm whether the intended commit already landed or whether the request is actually a hotfix.
- Hotfixes branch from `main`, merge into `main`, and must be merged or cherry-picked back into `dev` immediately after release.
- Do not promote `dev` to `main` when the current `dev` delta includes unrelated risky work that has not been intentionally approved for production.

## Required Local Proof

- Run the narrowest relevant proof first.
- Before a real ship step, make sure the repo-required root checks pass on the intended change:
  - `bun run format`
  - `bun run lint`
  - `bun run typecheck`
- Before opening or refreshing a `dev -> main` release PR, prefer `bun run check` on the exact `dev` head unless the same head already has fresh equivalent evidence.
- For checkout, Stripe, entitlement, auth handoff, or webhook work, use the QA control plane instead of inventing ad hoc browser proof.

## Review Prompts

Feature PR into `dev`:

`Review this branch against dev. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`

Release PR into `main`:

`Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`

## Procedure

1. Inspect the repo state first.
   - Run `git status --short --branch`.
   - Run `git fetch origin --prune`.
   - Confirm the current branch, ahead/behind state, remote tracking branch, dirty files, and whether `gh` is authenticated.
   - Check whether a PR already exists for the source branch.

2. Decide the active landing target.
   - Feature branch: land to `dev`.
   - `dev`: prepare the production promotion to `main`.
   - `main`: verify landed state or switch to the hotfix path.

3. Clean the workspace without widening scope.
   - Stage only the files that belong to the intended landing scope.
   - Do not revert or absorb unrelated user changes.
   - Use conventional commits.
   - If the workspace is mixed-ownership dirty and you cannot separate it safely, stop and escalate.

4. Prove the branch locally.
   - Run focused tests first.
   - Run the repo-required root gates: `bun run format`, `bun run lint`, `bun run typecheck`.
   - If preparing `dev -> main`, prefer `bun run check` on the exact release candidate.

5. Open or refresh the feature PR.
   - Reuse the existing PR when one already exists.
   - Default base is `dev`.
   - Run the feature-PR review prompt against `dev`.
   - Treat substantive review findings as blocking until fixed or disproved with evidence.

6. Wait for required PR checks and repair failures.
   - Use `gh pr checks --required --watch --fail-fast`.
   - When checks fail, inspect the exact failing run before rerunning anything.
   - Use `gh run view <run-id> --log-failed` to isolate the real failure.
   - Fix deterministic failures at the root.
   - Rerun only the smallest safe failing scope when the failure is a genuine flake.

7. Merge the feature PR and watch `dev`.
   - Prefer `gh pr merge --auto`.
   - After the PR lands in `dev`, watch the `Dev Staging Proof` workflow on the resulting `dev` commit.
   - Do not treat `dev` as release-ready until the `release_gate` job is green.

8. Respect the repo's billing-sensitive staging rule.
   - The repo decides whether `billing_integration` is required by running `qa/scripts/detect-release-scope.mjs`.
   - Treat changes in checkout, Stripe, entitlement, webhook, access recovery, post-checkout sign-up, or the release-proof workflows themselves as billing-sensitive unless the detector proves otherwise.
   - If the `dev` proof skipped billing for a clearly billing-sensitive release candidate, rerun `Dev Staging Proof` with `force_billing=true` instead of hand-waving the gap away.

9. Decide whether production promotion is safe.
    - Reuse an existing `dev -> main` PR only if its delta matches the intended release candidate.
    - If `dev` now contains unrelated work that should not ship, stop and escalate instead of silently promoting it.
    - If the intended `dev -> main` PR is `DIRTY`, do not fight the merge in the PR UI. Create a release snapshot branch from `main` using `bun run release:snapshot -- --source-ref origin/dev --base-ref origin/main --push`, then open the release PR from that snapshot branch to `main`.

10. Open or refresh the release PR.
    - Base is `main`, head is `dev`.
    - Run the release-PR review prompt against `main`.
    - Wait for required PR checks, then merge with `gh pr merge --auto`.

11. Shepherd the merged `main` commit until production is proven.
    - Watch Vercel create the production deploy from the merged `main` commit.
    - Watch `Convex Production Deploy` for the same commit.
    - Watch `Production Release Proof` for the same commit and wait for `release_gate`.
    - If the release is billing-sensitive and `Production Release Proof` did not run `billing_integration`, rerun that workflow with `force_billing=true`.
    - Do not call the release done until the exact commit is reachable from `origin/main` and the post-release proof is green.

12. Apply the repo's production billing policy when relevant.
    - For production billing proof, prefer a restricted live `100% off` promotion code or an equivalently no-cost live Checkout path.
    - Do not treat production as a card-testing surface.
    - The webhook target must be the Convex HTTP-actions origin:
      - `https://<deployment>.convex.site/stripe/webhook`
    - If billing or webhook recovery is needed, use `docs/internal/observability.md` and the existing incident-control path instead of improvising direct data edits.

13. Finish the release cleanly.
    - For a real `dev -> main` release, tag the merged `main` commit with the next pre-1.0 version and publish the matching changelog-backed GitHub Release.
    - Delete the feature branch only after the release path has settled.

## Preferred Commands

- `git status --short --branch`
- `git fetch origin --prune`
- `git rev-list --left-right --count origin/<base>...<branch>`
- `git log --oneline --decorate origin/<base>..<branch>`
- `gh auth status`
- `gh pr list --state open --head <branch>`
- `gh pr view <number>`
- `gh pr checks --required --watch --fail-fast`
- `gh run list --workflow ci.yml --limit 10`
- `gh run list --workflow dev-staging-proof.yml --limit 10`
- `gh run list --workflow production-release-proof.yml --limit 10`
- `gh run list --workflow convex-production-deploy.yml --limit 10`
- `gh run view <run-id> --log-failed`
- `gh workflow run dev-staging-proof.yml -f force_billing=true`
- `gh workflow run production-release-proof.yml -f force_billing=true`
- `gh pr merge --auto`
- `git branch -r --contains <sha>`

## Real Failure vs Flake

Treat these as real failures until disproved:

- lint, typecheck, build, or test failures tied to the current diff
- broken release-scope detection for a clearly billing-sensitive diff
- missing env parity between the target host and the selected QA env file
- checkout, webhook, entitlement, or auth handoff regressions
- a failed `release_gate` job on `dev` or `main`

Treat these as flakes only with evidence:

- transient GitHub runner or network issues
- known nondeterministic test behavior with unchanged code and a clean rerun
- infra timing issues where the smallest safe rerun passes without a code change

## Output Contract

Return a concise ship report with:

1. current branch and landing target
2. local proof run
3. PR URL or URLs
4. review status
5. CI and staging or production proof status
6. whether billing proof was required and how it was satisfied
7. final landed commit SHA on `main`, or the exact blocker

## Stop / Escalate Conditions

- Mixed-ownership edits cannot be separated safely.
- The release candidate on `dev` includes unrelated risky work.
- A substantive review finding cannot be fixed confidently in the current pass.
- GitHub auth, branch protection, or repo policy blocks progress with no safe non-admin path.
- `Dev Staging Proof` or `Production Release Proof` is red and the failure is neither fixed nor convincingly classified as a flake.
- Production billing proof would require an unsafe real-charge path.
- The deploy, Convex release, or release-proof workflows no longer line up with the merged `main` commit.
