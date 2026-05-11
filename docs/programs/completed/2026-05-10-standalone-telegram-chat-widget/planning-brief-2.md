---
title: Standalone Telegram Chat Widget Planning Brief 2
program_id: standalone-telegram-chat-widget
brief_version: 2
status: current
summary: Move the current polished support widget UI and orchestration into the internal package while preserving the existing fetch bridge and polling behavior.
read_when:
  - "Creating the UI extraction child ExecPlan for packages/telegram-chat-widget."
  - "Moving apps/web support widget internals into the package."
---

# Standalone Telegram Chat Widget Planning Brief 2

The next child ExecPlan should be titled `UI Extraction With Fetch Transport`.

The goal is to move the customer-facing support widget UI, composer behavior, screenshot attachment affordance, inline bug-report mode, optimistic send state, metadata-only analytics events, and polling-backed thread refresh out of `apps/web/app/_components/support/` and into `packages/telegram-chat-widget`. This slice should make the package the owner of the rendered widget while keeping the existing Ship by Sunday host routes, HttpOnly support-session cookie, and fetch transport behavior intact.

The package must stay standalone React. It may depend on `lucide-react` for package-owned icons because the rendered widget needs icons, but it must not depend on Next.js, Clerk, PostHog, Convex runtime code, generated Convex APIs, app aliases, or app-local helpers. `react` and `react-dom` remain peer dependencies.

The package should use its own CSS file and CSS-variable token contract. The implementation should not require host Tailwind utility generation for package internals. The current app must import the package CSS once in the app global CSS surface or equivalent host setup. The rendered result should preserve the current ChatGPT-like dark panel and responsive launcher/panel behavior unless a small package-boundary adjustment is required.

The current app files are the migration source of truth: `apps/web/app/_components/support/support-widget.tsx`, `apps/web/app/_components/support/support-widget-panel.tsx`, `apps/web/app/_components/support/use-support-chat.ts`, and `apps/web/app/_components/support/support-api-client.ts`. After this slice, `apps/web` should keep only thin host wrappers that create the fetch client, pass content/entry/surface/fallback props, and adapt package events to `capturePostHogProductEvent`.

The package should expose `TelegramChatWidget` as the primary component. It should own open state, load-on-open, polling with the existing three-second interval, draft state, chat mode, bug-report draft state, screenshot validation, optimistic message state, send/reset behavior, and close/fallback analytics. It should accept one typed `client` object that implements the already-created package client adapter interface. The Ship by Sunday app should use `createFetchTelegramChatClient()` from the package `./fetch` subpath.

Analytics must remain host-owned and metadata-only. The package should emit typed events through `eventSink`. The app wrapper should translate those events into `capturePostHogProductEvent` calls without ever including message body text, transcript DOM, raw support session tokens, attachment URLs, emails, Telegram ids, or screenshot content in analytics payloads.

Privacy hooks must remain package-owned. The transcript log must keep `data-ph-no-capture="true"` and `ph-no-capture ph-sensitive`. Textareas and bug-report fields must keep `data-ph-mask="true"` and `ph-mask ph-sensitive`.

The screenshot contract remains one optional PNG, JPEG, or WebP screenshot per message with a 10 MB max. The bug-report mode remains inline inside the composer and should preserve structured package input fields plus the current readable body sent through the fetch adapter.

This slice should update tests, not weaken them. The existing homepage and workspace integration-ui tests should continue to prove opening the widget, privacy hooks, Enter-to-send, screenshot upload, bug-report body rendering, metadata-only PostHog events, and the exact current support route fetch shape. Add or update package tests for the extracted controller and rendered widget if that gives clearer package-local proof without brittle implementation assertions.

This slice should update package docs and Program state. The package README should describe that the root widget now renders the full UI, what host props are required, and how the app imports CSS. The Program should mark the UI extraction slice complete and name Convex realtime as the next slice if this work lands.

Out of scope: do not implement live Convex realtime, direct browser-visible conversation tokens, backend schema changes, Telegram provider changes, Clerk association changes, arbitrary file uploads, multi-attachment upload, public package publishing, or setup docs for external providers in this slice. Do not use Convex local mode.
