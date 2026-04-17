---
title: 'Reliability'
summary: 'Repo-wide validation loop, review expectations, and worktree/local-environment guidance for this workspace.'
docType: 'guide'
status: 'active'
read_when:
  - 'You are deciding how to validate a change in this repo.'
  - 'You need the current worktree or local-environment assumptions.'
  - 'You want the repo-wide review loop before shipping a risky change.'
---

# Reliability

This file owns the repo-wide proof loop and the operational facts that let agents validate changes honestly instead of by inspection or folklore.

## Owns

- the default validation loop for repo work
- review expectations for risky or multi-step changes
- the current worktree and local-environment assumptions that affect proof

## Does Not Own

- runtime boot implementation details that belong in `apps/runtime/`
- the canonical ExecPlan contract, which lives in `docs/exec-plans/PLANS.md`
- live runtime logs or state under `.runtime/assistant/`

## Proof Loop

Start with the narrowest relevant proof for the slice you changed. For repo-wide or shared-surface work, finish with the root quality surface:

```bash
bun run lint
bun run fmt:check
bun run typecheck
```

For docs or planning changes, also use the docs-focused surfaces:

```bash
bun run plans:lint -- --plan <repo-relative-plan-path>
bun run markdown:lint -- --paths <touched-doc-paths>
bun run docs:validate
```

When a relevant command fails because of an unrelated pre-existing repo issue, document the exact failure in the active ExecPlan or handoff instead of hiding it.

## Review Expectations

Multi-step, risky, or cross-cutting work should use the checked-in ExecPlan loop and should re-run proof after each meaningful milestone. Fresh-eyes review is part of the reliability model for risky changes, not optional polish.

## Worktrees And Local Environments

A worktree is a separate checkout. Git cannot check out the same branch in both Local and Worktree at the same time. Thread handoff moves Git-visible state, not ignored files, so `.gitignore` content and untracked local setup do not automatically follow.

Official Codex guidance expects setup scripts or project-scoped config to make fresh worktrees bootable. This repo now has a checked-in runtime harness for that purpose under [apps/runtime/QUICKSTART.md](/Users/parkerrex/Developer/worker/apps/runtime/QUICKSTART.md) plus the V1 runtime legibility command surface in [apps/runtime/README.md](/Users/parkerrex/Developer/worker/apps/runtime/README.md). Fresh worktrees should use the repo-owned `runtime:bootstrap`, `runtime:up`, `runtime:health`, `runtime:legibility`, `runtime:proof:worker-dashboard`, and `runtime:down` commands instead of relying on shell folklore.

## Next

- Use [apps/runtime/README.md](/Users/parkerrex/Developer/worker/apps/runtime/README.md) for runtime command and operator details.
- Use [apps/runtime/QUICKSTART.md](/Users/parkerrex/Developer/worker/apps/runtime/QUICKSTART.md) for the checked-in worktree boot path.
- Use [docs/exec-plans/PLANS.md](/Users/parkerrex/Developer/worker/docs/exec-plans/PLANS.md) for the canonical ExecPlan contract.
