---
title: "Standalone Telegram Chat Widget Converged Decision Packet"
summary: "Final planning decisions for extracting the Telegram support widget into an owned standalone package."
docType: "decision_packet"
status: "active"
read_when:
  - "Checking the locked package, adapter, and non-goal decisions."
  - "Resolving whether to use Convex Component, Next.js routes, or direct Convex subscriptions."
---

# Standalone Telegram Chat Widget Converged Decision Packet

## Decisions

Decision: Create `packages/telegram-chat-widget` as `@shipbysunday/telegram-chat-widget`.

Rationale: This follows the repo's package scope and gives the widget a durable boundary above the web app.

Decision: The package is standalone React, not Next.js.

Rationale: The widget does not need a router or framework-specific server. Host apps can decide where to mount it and which transport to provide.

Decision: Do not implement this as a Convex Component.

Rationale: The product owner explicitly prefers an owned package boundary. Convex Component packaging would add ecosystem coupling without enough benefit for this app.

Decision: Use Convex realtime through an optional adapter, not a manual WebSocket.

Rationale: Convex React subscriptions already provide realtime query updates. Manual WebSocket code would duplicate the backend client's job and increase failure surface.

Decision: Preserve fetch transport during the first migration.

Rationale: The current HttpOnly support-session bridge is working. Keeping it during UI extraction avoids coupling packaging with an auth model change.

Decision: Make Convex an optional adapter entrypoint.

Rationale: Consumers that only use the fetch adapter should not install or configure Convex. Consumers that do use Convex should provide their own Convex client/provider and generated function references.

Decision: Ship default package CSS instead of requiring host Tailwind.

Rationale: A standalone package should render correctly in any React host with one CSS import and documented variables.

Decision: Keep provider setup and backend runtime outside the first package slice.

Rationale: The existing Telegram Support Bot Program owns the live backend. Backend extraction should wait until the frontend package and app consumption prove the boundary.

## Non-Decisions

This packet does not decide to publish the package outside the monorepo. It does not decide to replace the current anonymous HttpOnly support session with a browser-visible token in the first slice. It does not decide to extract Convex backend functions into the package. It does not change production Telegram setup ownership.
