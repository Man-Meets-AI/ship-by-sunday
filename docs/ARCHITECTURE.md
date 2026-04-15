---
title: "Architecture"
summary: "Canonical repo surface map and ownership split for Ship by Sunday."
docType: "guide"
status: "active"
read_when:
  - "You need the repo-wide authority split before editing code or docs."
  - "You are deciding which surface should own a durable change."
---

# Architecture

This file is the canonical repo-wide architecture and ownership map. It explains which checked-in surface owns which kind of truth so contributors do not reconstruct the repository from scattered roots.

## Owns

- the authority split between `docs/`, `apps/web/`, and `packages/*`
- the map of first-hop surfaces a newcomer should understand before making a cross-cutting change
- the explanation of how root entrypoints and nested owner files fit together

## Does Not Own

- detailed feature behavior that belongs in `apps/web/features/*`
- snapshot-generation internals that belong in `packages/blueprint-compiler`
- package-local implementation notes that belong next to the package itself

## Surface Map

- `docs/` owns cross-cutting contributor and agent-facing knowledge, release runbooks, references, and ExecPlans.
- `apps/web/` owns the live Next.js app, public docs, protected workspace, checkout flow, Playwright smoke, and app-local Vitest coverage.
- `packages/blueprint-compiler/` owns the compiled Blueprint and generated starter snapshot contract.
- `packages/blueprint-presentation/` owns presentation helpers shared with snapshot output.
- `packages/ship-by-sunday-cli/` owns the local CLI that writes `.ship-by-sunday/` drafts and generates starter snapshots.
- `docs/generated/` owns checked-in machine-produced projections and research artifacts. These are useful context, not higher-priority contracts than code, `AGENTS.md`, or active ExecPlans.

## Entry Model

The root entrypoints stay intentionally small. `README.md` and `AGENTS.md` route into this docs spine first. More specific nested `AGENTS.md` files then narrow the rules when work moves into `apps/web/` or `packages/blueprint-compiler/`.

## Next

- Read [docs/RELIABILITY.md](/Users/parkerrex/Developer/ship-by-sunday/docs/RELIABILITY.md) for the validation loop and worktree behavior.
- Use [docs/FRONTEND.md](/Users/parkerrex/Developer/ship-by-sunday/docs/FRONTEND.md) for browser-facing implementation defaults.
- Use [docs/design-docs/architecture.md](/Users/parkerrex/Developer/ship-by-sunday/docs/design-docs/architecture.md) for the app-specific runtime map.
- Use [docs/release-workflow.md](/Users/parkerrex/Developer/ship-by-sunday/docs/release-workflow.md) when the task changes shipping or deployment behavior.
