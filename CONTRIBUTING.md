# Contributing

Ship by Sunday ships through short-lived feature branches into `main`, then publishes stable releases from protected tags that point at verified `main` commits.

Before changing files, read `AGENTS.md` and the nearest nested instruction file for the surface you are touching. For release, auth, checkout, entitlement, browser proof, or ship-readiness work, also read `docs/release-workflow.md`.

## Branches And Pull Requests

- Branch from the current `main` for normal feature work.
- Keep the diff scoped to one reviewable change.
- Use conventional commit messages when committing.
- Open feature PRs into `main`.
- Use focused hotfix branches from `main` only for P0 or P1 production incidents, and run the same post-merge production proof used for ordinary releases.

## Local Checks

Run the narrowest relevant checks first, then broaden when the change affects shared contracts.

Useful defaults:

- `bun run format`
- `bun lint`
- `bun typecheck`
- focused unit, integration, compiler, release, or markdown checks for the touched surface

Local git hooks are not repository enforcement. Run and report the relevant local checks before requesting review.

## Pull Request Notes

Include what changed, why it changed, and the exact validation you ran. If a check could not run, say why. Update docs, generated mirrors, ExecPlans, or release notes when the change affects durable behavior, commands, public docs, generated starter output, or operator workflow.
