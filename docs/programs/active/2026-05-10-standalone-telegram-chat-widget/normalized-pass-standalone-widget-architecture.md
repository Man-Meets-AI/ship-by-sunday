---
title: "Standalone Telegram Chat Widget Normalized Architecture"
summary: "Normalized architecture for the owned standalone React package and host adapters."
docType: "normalized_pass"
status: "active"
read_when:
  - "Checking the intended package architecture before writing child ExecPlans."
  - "Resolving whether code belongs in the package, apps/web, or Convex."
---

# Standalone Telegram Chat Widget Normalized Architecture

The architecture is an owned React package with optional transports, not a backend component framework.

## Package Layers

Core layer:

- shared domain types
- message and thread state models
- attachment policy
- bug-report payload shape
- adapter result and error types

React layer:

- all-in-one `TelegramChatWidget` as the primary public component
- launcher and panel components
- message stream
- composer
- bug-report fields
- attachment chip
- accessible labels and keyboard behavior
- default styled experience

The panel and primitive modules should remain internal or testing-only in v1 unless a concrete host need proves they should be exported. The default developer path should be mounting one widget with a client adapter and content configuration.

Placement should be owned by the all-in-one widget by default. The package should start with fixed bottom-right placement and a small placement enum for bottom-left or inline contexts, not an arbitrary host positioning bag.

Content should be merged inside the package from strong defaults plus partial host overrides. Host wrappers should customize identity and surface-specific language without re-declaring every label and state string.

The v1 defaults should be Parker/Ship by Sunday-branded because the package is internal monorepo-only. Generic support-chat defaults are a future publishing concern, not a v1 requirement.

Attachment uploads should be screenshot/image-only in v1. The package should model PNG, JPEG, and WebP screenshot policy directly and leave arbitrary files, logs, videos, stack traces, and task diagnostics for later deliberate slices.

The v1 attachment model should allow one optional screenshot per message, matching the current support backend's single `attachment` field.

Bug reporting should be an inline composer mode that shares the normal message send path, attachment policy, optimistic state, delivery state, and error state. The package can make the mode feel smarter with branded Prompt Input and Attachments primitives, but it should not introduce a separate wizard or modal in v1.

Bug-report payloads should include typed metadata plus a rendered readable body. This keeps current Telegram and transcript behavior readable while avoiding later string parsing for automation or backend storage.

Adapter layer:

- fetch adapter for the current Ship by Sunday Next route bridge
- Convex adapter for direct realtime subscriptions and mutations
- future adapters only when a real host needs them

The adapter layer should expose one typed client object to the React layer. The client owns transport operations such as loading a thread, sending a message, uploading or preparing an attachment when needed, and subscribing to updates when the backend supports realtime. React components should not receive a broad bag of unrelated transport callbacks.

Testing layer:

- fixtures and render helpers for package tests and host integration tests
- focused contract tests in the scaffold slice for content merging, attachment policy, bug-report payload rendering, metadata-only events, and adapter fixtures

Analytics boundary:

- package-defined typed lifecycle and delivery events
- host-provided event sink
- no package dependency on PostHog or another analytics SDK
- no transcript bodies, attachment content, emails, tokens, Telegram ids, or generated output in event payloads

## Host Responsibilities

The host app owns:

- placement on homepage, workspace, or any other page
- auth provider wiring
- Convex provider wiring
- generated Convex API references
- fallback URLs
- analytics implementation
- PostHog masking configuration
- provider env setup
- Telegram bot setup
- docs and runbook links

## Backend Responsibilities

The existing Convex support backend remains the first backend runtime. It owns persistence, Telegram delivery, webhook handling, operator allowlists, retention, abuse controls, operations snapshots, and AI draft behavior.

Backend helper extraction is not part of the first slice. If later slices prove the backend helper surface should be reusable, it should be added deliberately after the frontend package and Ship by Sunday consumer migration are stable.

## Migration Strategy

First migrate shape, then behavior:

1. Create the package contract and scaffold.
2. Move UI and state orchestration into the package while preserving the current fetch bridge.
3. Make `apps/web` consume the package.
4. Add the Convex realtime adapter.
5. Decide whether anonymous direct Convex access uses a scoped browser-visible conversation capability or keeps a host bridge.
6. Move screenshot and bug-report handling fully behind adapter-safe contracts.

This keeps the package extraction reversible and testable at each step.
