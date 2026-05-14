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
- compiler implementation details that belong in `packages/codebase-compiler/`
- release proof command behavior that belongs in `scripts/release/`
- machine-local or ignored state

## Surface Map

- `docs/` owns cross-cutting, agent-facing repository knowledge and stable landing docs.
- `apps/web/` owns the live product, docs app, checkout routes, auth surfaces, and browser-facing implementation.
- `packages/codebase-compiler/` owns generated codebase docs, snapshot shaping, and starter-output contracts.
- `scripts/release/` owns release proof orchestration, release personas, release evidence, and release workflow helpers.
- `.codex/` is a non-canonical local tooling/config surface for repo-local notes or incubation assets. Durable routing and planning truth do not live there.

## App Structure Map

Within `apps/web`, `src/app/` owns URL-addressable routes, route groups, route handlers, and thin route adapters. Next.js route groups such as `(auth)`, `(marketing)`, and `(app)` are framework organization and may stay when useful.

`src/lib/` owns durable product domains and app-local logic that are reused across routes or need a stable product boundary. Current durable domains include codebase flow, course and lesson domain data, execute/ship support, workspace navigation, and observability.

During the active T3 Code migration, historical route-local underscore implementation folders such as `_components`, `_content`, `_hooks`, `_lib`, `_server`, `_styles`, `_fonts`, and `_metadata` are migration inventory, not the preferred shape for new or migrated implementation. Move route-specific presentation and logic toward plain feature modules under `src/components`, `src/hooks`, or `src/lib` where framework constraints allow it.

`src/platform/` temporarily owns environment, auth, billing, Convex, and Next.js platform adapters until later Program slices move those helpers into named `src/lib/*` lanes. `convex/` owns backend state, actions, and HTTP webhook routes. Browser-only route UI should not be imported from Convex code.

`src/components/ui` owns shared primitives and retained UI inventory. Feature-specific effects and route-specific UI belong with their feature or route owner instead of the shared primitive layer.

## Entry Model

The root entrypoints stay intentionally small. `README.md` and `AGENTS.md` route into this docs spine first. More specific nested `AGENTS.md` files then narrow the working rules when the task moves into `apps/web/` or `packages/codebase-compiler/`.

## Next

- Read [docs/RELIABILITY.md](RELIABILITY.md) for the validation loop and worktree behavior.
- Use [docs/index.md](index.md) for the first-hop docs spine.
- Use [apps/web/AGENTS.md](../apps/web/AGENTS.md) for the app-owned implementation surface.
- Use [packages/codebase-compiler/AGENTS.md](../packages/codebase-compiler/AGENTS.md) for generator-owned snapshot and template work.
