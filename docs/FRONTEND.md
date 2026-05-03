---
title: 'Frontend'
summary: 'Frontend implementation rules and routing for browser-facing surfaces in this repository.'
docType: 'guide'
status: 'active'
read_when:
  - 'You are changing a browser-facing surface in this repo.'
  - 'You need the repo-wide frontend implementation defaults before editing UI code.'
---

# Frontend

This file owns the repo-wide frontend implementation rules for browser-facing surfaces in this repository.

## Owns

- frontend implementation defaults that should stay stable across browser-facing surfaces
- the distinction between frontend code structure and visual doctrine
- routing to the current frontend-owning app surface

## Does Not Own

- visual taste or interaction doctrine beyond implementation rules
- product prioritization or feature requirements
- runtime-only CLI or backend behavior

## Current Rules

- Keep presentation separate from behavior. Move stateful or behavioral logic into hooks, helpers, or controller modules instead of bloating components.
- Prefer domain-owned folders over global `components/`, `hooks/`, or `utils/` buckets that mix unrelated work.
- Treat App Router private folders as the home for route-local UI, controller hooks, view models, and redirect helpers. If a module only serves one route group or page, keep it under that route's `_components`, `_hooks`, or `_lib` folder.
- Keep durable cross-route product UI and domain logic in `lib/`, `platform/`, or explicit route-owner folders. Reusable course models, workspace navigation, observability, checkout helpers, and product-access checks belong behind those boundaries when they are not owned by one route.
- Use `platform/` for environment, auth, billing, Convex, and Next.js adapter boundaries. Do not hide platform behavior in broad frontend helper files.
- Treat compatibility re-exports as temporary migration surfaces. Remove them only with static import proof and focused tests; shared UI inventory and AppShell compatibility require an explicit slice.
- Avoid oversized components. Split browser-facing components before they become hard to scan.
- Preserve the repo’s current shadcn-style component usage as vanilla building blocks instead of adding another UI framework layer.
- Treat `apps/web` as the main browser surface unless a task clearly belongs to generated output or package-local tooling.

## Next

- Use [docs/DESIGN.md](DESIGN.md) for visual and interaction doctrine.
- Use [docs/design-docs/index.md](design-docs/index.md) for durable design notes.
- Use [apps/web/AGENTS.md](../apps/web/AGENTS.md) for the current frontend-owning app surface.
