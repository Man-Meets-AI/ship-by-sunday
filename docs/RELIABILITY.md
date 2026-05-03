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
- the canonical Program contract, which lives in `docs/programs/PROGRAMS.md`
- app-specific setup details that belong in `apps/web/content/docs/*`
- live machine-local state

## Proof Loop

Start with the narrowest relevant proof for the slice you changed. For repo-wide or shared-surface work, finish with the root quality surface:

```bash
bun run format
bun run lint
bun run typecheck
bun run test:unit
bun run test:contracts
bun run test:integration
bun run build
```

For docs-only or planning-only changes, use the dedicated markdown layer first:

```bash
bun run markdown:lint -- --paths <repo-path-or-dir>
bun run plans:lint -- --plan docs/exec-plans/active/<plan-file>.md
bun run programs:lint
git diff --check
```

`markdown:lint` currently validates the repo-owned frontmatter-backed docs families under the canonical `docs/` spine, `docs/programs/`, `docs/exec-plans/`, `apps/web/content/docs/`, and `apps/web/content/blog/`. `plans:lint` applies the stricter ExecPlan body contract from `docs/exec-plans/PLANS.md`. `programs:lint` validates Program docs, checked-in Program packet folders, versioned planning briefs, current-brief pointers, and Program prompt contracts.

## Review Expectations

Multi-step, risky, or cross-cutting work should use the checked-in ExecPlan loop and should re-run proof after each meaningful milestone. Fresh-eyes review is part of the reliability model for risky changes, not optional polish.

## Worktrees And Local Environments

A worktree is a separate checkout. Git cannot check out the same branch in both locations at the same time. Thread handoff moves Git-visible state, not ignored files, so `.gitignore` content and untracked local setup do not automatically follow.

Fresh checkouts should use the repo-owned boot path instead of reconstructing setup from memory:

```bash
bun install
cp apps/web/.env.local.example apps/web/.env.local
bun run dev
```

Use `bun run dev:core` only when you intentionally want the lighter no-Stripe path. Source-level tests and `scripts/release/` proof are the current confidence surfaces; do not resurrect the retired QA control plane or helper CLI as local release gates.

## Next

- Use [docs/design-docs/scripts.md](design-docs/scripts.md) for the current command map.
- Use [apps/web/content/docs/local-qa.mdx](../apps/web/content/docs/local-qa.mdx) for the app-local verification runbook.
- Use [docs/programs/PROGRAMS.md](programs/PROGRAMS.md) for the canonical Program contract.
- Use [docs/exec-plans/PLANS.md](exec-plans/PLANS.md) for the canonical ExecPlan contract.
