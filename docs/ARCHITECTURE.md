---
title: 'Architecture'
summary: 'Canonical repo surface map and authority split for the Ship by Sunday workspace.'
docType: 'guide'
status: 'active'
read_when:
  - 'You need the repo-wide authority split before editing code or docs.'
  - 'You are deciding which surface should own a durable change.'
---

# Architecture

This file is the canonical repo-wide architecture and ownership map. It explains which surface owns which kind of truth so agents do not reconstruct the repo from scattered roots.

## Owns

- the repo-wide authority split between `docs/`, `apps/web/`, `packages/`, `qa/`, and local tooling state
- the map of first-hop surfaces a newcomer should understand before making a cross-cutting change
- the explanation of how root entrypoints and subtree owners fit together

## Does Not Own

- app implementation details that belong in `apps/web/`
- compiler implementation details that belong in `packages/blueprint-compiler/`
- day-to-day QA run evidence that belongs in `qa/`
- machine-local or ignored state

## Surface Map

- `docs/` owns cross-cutting, agent-facing repository knowledge and stable landing docs.
- `apps/web/` owns the live product, docs app, checkout routes, auth surfaces, and browser-facing implementation.
- `packages/blueprint-compiler/` owns generated blueprint docs, snapshot shaping, and starter-output contracts.
- `qa/` owns the current QA control plane, journey inventory, and run evidence.
- `.codex/` is a non-canonical local tooling/config surface for repo-local notes or incubation assets. Durable routing and planning truth do not live there.

## Entry Model

The root entrypoints stay intentionally small. `README.md` and `AGENTS.md` route into this docs spine first. More specific nested `AGENTS.md` files then narrow the working rules when the task moves into `apps/web/` or `packages/blueprint-compiler/`.

## Next

- Read [docs/RELIABILITY.md](/Users/parkerrex/Developer/ship-by-sunday/docs/RELIABILITY.md) for the validation loop and worktree behavior.
- Use [docs/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/index.md) for the first-hop docs spine.
- Use [apps/web/AGENTS.md](/Users/parkerrex/Developer/ship-by-sunday/apps/web/AGENTS.md) for the app-owned implementation surface.
- Use [packages/blueprint-compiler/AGENTS.md](/Users/parkerrex/Developer/ship-by-sunday/packages/blueprint-compiler/AGENTS.md) for generator-owned snapshot and template work.
