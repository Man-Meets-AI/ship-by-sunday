---
title: 'Architecture'
summary: 'Canonical repo surface map and authority split for the Worker workspace.'
docType: 'guide'
status: 'active'
read_when:
  - 'You need the repo-wide authority split before editing code or docs.'
  - 'You are deciding which surface should own a durable change.'
---

# Architecture

This file is the canonical repo-wide architecture and ownership map. It explains which surface owns which kind of truth so agents do not reconstruct the repo from scattered roots.

## Owns

- the repo-wide authority split between `docs/`, `workspace/`, `system/`, `knowledge/`, runtime docs, and local runtime state
- the map of first-hop surfaces a newcomer should understand before making a cross-cutting change
- the explanation of how root entrypoints and subtree owners fit together

## Does Not Own

- runtime implementation details that belong in `apps/runtime/`
- human-facing business operating docs that belong in `workspace/`
- runtime self-improvement doctrine that belongs in `system/`
- non-role knowledge content that belongs in `knowledge/`

## Surface Map

- `docs/` owns cross-cutting, agent-facing repository knowledge and stable landing docs.
- `workspace/` owns the human-facing operating surface, including cases, plans, notes, meetings, and goals that humans and agents read directly.
- `system/` owns runtime self-improvement, durable repo-meta choices, and machine-readable role packages.
- `docs/references/README.md` is the docs-owned first hop for external references, while the existing detailed corpus under `system/references/` remains a legacy checked-in exception rather than a reason to treat all of `system/` as default context.
- `knowledge/` owns non-role knowledge surfaces and pipeline-readable content.
- `apps/runtime/` owns executable runtime code, runtime-local docs, and operational command details.
- `.runtime/assistant/` owns technical execution state and other local runtime artifacts. It is not a tracked docs surface.
- `.codex/` is a non-canonical local tooling/config surface for repo-local notes or incubation assets. Durable routing and planning truth do not live there.

## Entry Model

The root entrypoints stay intentionally small. `README.md` and `AGENTS.md` route into this docs spine first. More specific nested `AGENTS.md` files then narrow the working rules when the task moves into `apps/runtime/`, `system/`, `knowledge/`, or `apps/knowledge-pipeline/`.

## Next

- Read [docs/RELIABILITY.md](/Users/parkerrex/Developer/worker/docs/RELIABILITY.md) for the validation loop and worktree behavior.
- Use [workspace/README.md](/Users/parkerrex/Developer/worker/workspace/README.md) for human-facing operating context.
- Use [system/README.md](/Users/parkerrex/Developer/worker/system/README.md) only for runtime-meta and repo-policy work.
- Use [knowledge/README.md](/Users/parkerrex/Developer/worker/knowledge/README.md) for non-role knowledge surfaces.
- Use [apps/runtime/README.md](/Users/parkerrex/Developer/worker/apps/runtime/README.md) for runtime implementation detail.
