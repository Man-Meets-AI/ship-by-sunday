---
title: Standalone Telegram Chat Widget Planning Brief 3
program_id: standalone-telegram-chat-widget
brief_version: 3
status: current
summary: Add the optional Convex realtime adapter so supported hosts can receive chat updates without visitor-side fetch polling.
read_when:
  - "Creating the Convex realtime adapter child ExecPlan for packages/telegram-chat-widget."
  - "Replacing support widget polling with Convex subscriptions."
---

# Standalone Telegram Chat Widget Planning Brief 3

The next child ExecPlan should be titled `Convex Realtime Adapter`.

The goal is to make `packages/telegram-chat-widget` support realtime message updates through an optional Convex-backed adapter while preserving the package's standalone React boundary. The package root should remain usable with the existing typed `TelegramChatClient` and fetch adapter. Convex-specific imports and host assumptions should stay behind the `@shipbysunday/telegram-chat-widget/convex` subpath or a host-provided adapter factory.

This slice should remove visitor-side polling for Ship by Sunday only after the realtime authority model is explicit. The current fetch bridge relies on an HttpOnly support-session cookie that browser Convex subscriptions cannot read. Do not expose that existing cookie to browser code. If the realtime adapter needs browser-visible authority for anonymous visitors, design and implement a scoped, high-entropy conversation capability with hash-stored server state, single-thread scope, and clear expiration/rotation behavior. If that is too large for the slice, keep send/upload through the fetch bridge and add realtime only for signed-in or explicitly authorized thread contexts.

The widget UI should not be redesigned in this slice. It may need small state additions for subscription loading, unavailable realtime fallback, or reconnect status, but the customer-facing launcher, panel, composer, bug-report mode, screenshot chip, Enter-to-send, and privacy hooks should stay owned by the package UI added in the previous slice.

The Ship by Sunday app already wraps client surfaces with `ConvexProviderWithClerk` in `apps/web/platform/convex/convex-client-provider.tsx`. Use that host capability where appropriate instead of creating a manual WebSocket or introducing a Convex Component. Read `apps/web/convex/_generated/ai/guidelines.md` before changing Convex code, and use hosted Convex dev only.

The adapter should keep analytics metadata-only. Do not emit transcript bodies, screenshot URLs, raw session tokens, emails, Telegram ids, or user-agent strings through the package event sink. Preserve transcript/input masking.

Validation should prove that package/app behavior still works with the fetch adapter and that the new Convex realtime path updates the transcript without the three-second polling loop. Add focused tests around adapter state transitions, anonymous versus signed-in authority, failure fallback, and message delivery metadata. Run hosted Convex dev validation for touched Convex functions, package checks, app integration tests, and desktop/mobile browser proof.

Out of scope: do not convert this package into a Convex Component, do not publish to npm, do not redesign the widget, do not add arbitrary file uploads or multi-attachment uploads, and do not change Telegram operator semantics unless realtime delivery requires a narrow backend event shape.
