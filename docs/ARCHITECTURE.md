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

- the repo-wide authority split between `docs/`, `apps/web/`, `packages/`, release scripts, and local tooling state
- the map of first-hop surfaces a newcomer should understand before making a cross-cutting change
- the explanation of how root entrypoints and subtree owners fit together

## Does Not Own

- app implementation details that belong in `apps/web/`
- compiler implementation details that belong in `packages/blueprint-compiler/`
- release proof command behavior that belongs in `scripts/release/`
- machine-local or ignored state

## Surface Map

- `docs/` owns cross-cutting, agent-facing repository knowledge and stable landing docs.
- `apps/web/` owns the live product, docs app, checkout routes, auth surfaces, and browser-facing implementation.
- `packages/blueprint-compiler/` owns generated blueprint docs, snapshot shaping, and starter-output contracts.
- `scripts/release/` owns release proof orchestration, release personas, release evidence, and release workflow helpers.
- `.codex/` is a non-canonical local tooling/config surface for repo-local notes or incubation assets. Durable routing and planning truth do not live there.

## App Structure Map

Within `apps/web`, `app/` owns URL-addressable routes, route groups, route handlers, and private route UI. Route-local wrappers, controllers, view models, and redirect helpers belong under App Router private folders such as `_components`, `_hooks`, and `_lib`.

`lib/` owns durable product domains and app-local logic that are reused across routes or need a stable product boundary. Current durable domains include blueprint flow, course and lesson domain data, execute/ship support, workspace navigation, and observability.

Route-local product presentation lives under `app/` private folders. The homepage, blog, docs, workspace, checkout, and identity surfaces use route-owned `_components`, `_content`, `_hooks`, and `_lib` folders when the code only serves that route area.

`platform/` owns environment, auth, billing, Convex, and Next.js platform adapters. `convex/` owns backend state, actions, and HTTP webhook routes. Browser-only route UI should not be imported from Convex code.

`components/ui` owns shared primitives and retained UI inventory. Feature-specific effects and route-specific UI belong with their feature or route owner instead of the shared primitive layer.

## Entry Model

The root entrypoints stay intentionally small. `README.md` and `AGENTS.md` route into this docs spine first. More specific nested `AGENTS.md` files then narrow the working rules when the task moves into `apps/web/` or `packages/blueprint-compiler/`.

## Next

- Read [docs/RELIABILITY.md](RELIABILITY.md) for the validation loop and worktree behavior.
- Use [docs/index.md](index.md) for the first-hop docs spine.
- Use [apps/web/AGENTS.md](../apps/web/AGENTS.md) for the app-owned implementation surface.
- Use [packages/blueprint-compiler/AGENTS.md](../packages/blueprint-compiler/AGENTS.md) for generator-owned snapshot and template work.
