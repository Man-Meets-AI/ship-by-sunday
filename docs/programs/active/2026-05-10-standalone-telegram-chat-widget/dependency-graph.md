---
title: "Standalone Telegram Chat Widget Dependency Graph"
summary: "Dependency order for extracting the support widget into a standalone package and adding realtime."
docType: "dependency_graph"
status: "active"
read_when:
  - "Choosing the next implementation slice."
  - "Checking why package scaffold, app migration, and realtime should not be merged into one step."
---

# Standalone Telegram Chat Widget Dependency Graph

The hard dependency is that the package contract must exist before UI extraction, and UI extraction should preserve the current fetch bridge before direct Convex realtime changes transcript authority.

## Ordered Dependencies

1. Package contract and scaffold. Create `packages/telegram-chat-widget`, exports, scripts, tsconfig, test config, CSS strategy, public types, a working configurable fetch adapter, and a reserved Convex subpath without live realtime implementation.

2. UI extraction with fetch transport. Move the polished widget UI and state orchestration into the package, then make the app consume the package with the tested fetch adapter while keeping the current app support route bridge.

3. Ship by Sunday consumer migration. Replace app-local support widget internals with package imports and keep homepage/workspace wrappers in `apps/web`.

4. Convex realtime adapter. Fill in the reserved Convex subpath with optional Convex subscriptions and mutations through a host-provided adapter, then remove visitor-side polling where safe.

5. Anonymous direct-realtime authority. Decide and implement scoped conversation capability or preserve host bridge for anonymous transcript access.

6. Attachment and bug-report hardening. Make screenshot uploads and structured bug reports adapter-safe across fetch and Convex paths.

7. Standalone docs and example. Document install, CSS, adapter contracts, Telegram setup, Convex setup, Clerk behavior, and verification.

## Parallelizable Work

Package docs and test fixtures can be drafted alongside the package scaffold.

Browser visual proof can run alongside host migration validation once the app consumes the package.

Backend helper extraction should not run in parallel with UI extraction because it would make failures ambiguous across package, host, and Convex runtime boundaries.

## Blocking Rules

Do not start direct Convex realtime implementation until the package API and app consumer migration are stable.

Do not remove the existing fetch route bridge until anonymous transcript authority has a reviewed replacement.

Do not update production Telegram setup as part of package extraction unless a child ExecPlan explicitly includes provider setup work.
