---
title: Standalone Telegram Chat Widget Planning Brief 1
program_id: standalone-telegram-chat-widget
brief_version: 1
status: current
summary: Create the package contract and scaffold for the standalone Telegram chat widget without moving runtime behavior yet.
read_when:
  - "Creating the first child ExecPlan for packages/telegram-chat-widget."
  - "Starting the package contract and scaffold slice."
---

# Standalone Telegram Chat Widget Planning Brief 1

The next child ExecPlan should be titled `Package Contract And Scaffold`.

The goal is to create the durable shell for `packages/telegram-chat-widget` as `@shipbysunday/telegram-chat-widget` without moving the current support widget runtime behavior yet. This is a contract slice: establish the package boundary, public exports, styling strategy, TypeScript/test setup, and adapter seams so later slices can extract UI and add realtime without guessing the shape.

The package must be standalone React. It must not depend on Next.js, a router, a Bun server, or Convex Component packaging. React should be a peer dependency. Convex should be isolated behind an optional adapter entrypoint, not required by the root export. The root package should expose stable core types and React-facing primitives. Separate entrypoints should be planned for fetch, Convex, CSS, and testing helpers if the package tooling supports them cleanly.

The first slice should create the package directory and minimal source files, such as core types, a package index, adapter interface types, an initial CSS file or CSS strategy placeholder, and focused package tests that can run without `apps/web`. If workspace package validation scripts or `apps/web/next.config.ts` need updates for future consumption, make only the smallest necessary changes. Do not migrate the existing widget components in this slice unless the ExecPlan proves the scaffold cannot be validated otherwise.

Use the current support runtime as the source of truth for names and states. Important current files are `apps/web/app/_components/support/support-widget-panel.tsx`, `apps/web/app/_components/support/use-support-chat.ts`, `apps/web/app/_components/support/support-api-client.ts`, `apps/web/app/api/support/_server/support-message-route.ts`, `apps/web/convex/support.ts`, and `apps/web/convex/support/model.ts`.

Boundary rules: do not import `apps/web` modules into the package; do not import generated Convex API references into package core; do not replace polling in this slice; do not introduce a manual WebSocket; do not switch anonymous support access away from the current HttpOnly bridge; do not use Convex local mode; do not stage unrelated billing, release, or shipping-evidence changes that are currently dirty in the checkout.

Validation should include the new package tests or typecheck, any updated workspace package validation command, `bun run programs:lint` if Program files are touched, and narrow app checks only if the slice changes app config. The final ExecPlan should name any validation that is blocked by the package being scaffold-only.
