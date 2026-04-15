---
title: "Reliability"
summary: "Repo-wide validation loop, review expectations, and local-environment guidance for Ship by Sunday."
docType: "guide"
status: "active"
read_when:
  - "You are deciding how to validate a change in this repo."
  - "You need the current worktree or local-environment assumptions."
  - "You want the repo-wide review loop before shipping a risky change."
---

# Reliability

This file owns the repo-wide proof loop and the operational facts that let contributors validate changes honestly instead of by inspection or folklore.

## Owns

- the default validation loop for repo work
- review expectations for risky or multi-step changes
- the current local-environment assumptions that affect proof

## Does Not Own

- the canonical ExecPlan contract, which lives in `docs/exec-plans/PLANS.md`
- app-specific setup details that belong in `apps/web/content/docs/*`
- live machine-local state

## Proof Loop

Start with the narrowest relevant proof for the slice you changed. For repo-wide or shared-surface work, finish with the root quality surface:

```bash
bun run format
bun run lint
bun run typecheck
bun run test
bun run test:contracts
bun run build
bun run test:e2e
```

For docs-only or planning-only changes, there is no dedicated docs linter in this repository today. Use the narrowest relevant code checks, targeted grep or diff review, and `git diff --check` when structure or links changed.

## Review Expectations

Multi-step, risky, or cross-cutting work should use the checked-in ExecPlan loop and should re-run proof after each meaningful milestone. Fresh-eyes review is part of the reliability model for risky changes, not optional polish.

## Worktrees And Local Environments

A worktree is a separate checkout. Git cannot check out the same branch in both locations at the same time. Thread handoff moves Git-visible state, not ignored files, so `.gitignore` content and untracked local setup do not automatically follow.

Fresh checkouts should use the repo-owned boot path instead of reconstructing setup from memory:

```bash
bun install
cp apps/web/.env.local.example apps/web/.env.local
bun run dev:core
```

Use `bun run dev` only when you need the full local buyer-flow stack, including Stripe forwarding.

## Next

- Use [docs/design-docs/scripts.md](/Users/parkerrex/Developer/ship-by-sunday/docs/design-docs/scripts.md) for the current command map.
- Use [apps/web/content/docs/local-qa.mdx](/Users/parkerrex/Developer/ship-by-sunday/apps/web/content/docs/local-qa.mdx) for the app-local verification runbook.
- Use [docs/exec-plans/PLANS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/PLANS.md) for the canonical ExecPlan contract.
