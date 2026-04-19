---
name: release-snapshot
description: Use when the normal dev to main release PR is structurally blocked and the repo needs a one-commit snapshot branch whose tree exactly matches origin/dev on top of origin/main.
---

# Release Snapshot

Use this fallback only when the normal `dev -> main` release PR is structurally blocked.

## Preconditions

- `bun run release:triage` already showed that the normal release path is blocked.
- `bun run release:snapshot -- --dry-run` returns `allowed: true`.
- The open release PR still targets `main`, still uses `dev` as the head branch, still points at the current `origin/dev` SHA, and GitHub reports the structural block through `mergeable=CONFLICTING` or `mergeStateStatus=DIRTY`.
- Keep that blocked `dev -> main` PR open until the snapshot branch has been created and the replacement production PR is open. Closing it too early removes the proof that snapshot mode is allowed and the command will correctly refuse to run.

## Forbidden conditions

Do not use snapshot mode when any of these are true:

- the normal `dev -> main` PR is still mergeable
- the release PR no longer matches `origin/dev`
- GitHub mergeability is still `UNKNOWN`
- the worktree is dirty and you are trying to create the branch for real

## Command

Dry run first:

```bash
bun run release:snapshot -- --dry-run
```

When the dry run says `allowed: true`, create the branch:

```bash
bun run release:snapshot -- --branch=<release-snapshot-branch>
```

Add `--push` only after the local branch and tree-identity proof look correct.

## Tree identity proof

The snapshot branch is only valid when its tree matches `origin/dev` exactly. The command prints the proof command:

```bash
git diff --quiet origin/dev <release-snapshot-branch>
```

That command must exit `0`.

## Rollback

If validation fails before merge:

```bash
git branch -D <release-snapshot-branch>
git push origin :<release-snapshot-branch>
```

## Post-merge cleanup

After the snapshot PR merges, close the superseded blocked `dev -> main` PR, delete the local and remote snapshot branch, and expect the repo-owned reconcile automation to open or reuse a `main -> dev` PR. Merge that reconcile PR so `dev` catches up to the shipped snapshot result, then move normal feature work back onto a fresh branch from current `origin/dev`. Use a fresh hotfix branch from current `origin/main` for any production-only repairs.
