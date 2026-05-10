---
title: "Standalone Telegram Chat Widget Current Support Runtime Research"
summary: "Research pass mapping the current support widget, route bridge, Convex support runtime, and extraction seams."
docType: "research_pass"
status: "active"
read_when:
  - "Extracting the current support widget into packages/telegram-chat-widget."
  - "Checking which support code should remain in apps/web or Convex."
---

# Standalone Telegram Chat Widget Current Support Runtime Research

This research pass records the current Ship by Sunday support runtime facts that matter for package extraction.

## Current Frontend Surface

The visitor-facing widget lives in `apps/web/app/_components/support/`.

Key files:

- `support-widget.tsx` owns launcher and panel mounting.
- `support-widget-panel.tsx` owns the polished chat panel, composer, bug-report fields, attachment chip, message bubbles, fallback link, and Enter-to-send behavior.
- `use-support-chat.ts` owns state orchestration, optimistic sends, transcript refresh, attachment validation, and API calls.
- `support-api-client.ts` owns the fetch transport to the app route.
- `support-widget-content.ts` owns copy.
- `support-widget-events.ts` owns analytics event names and payload shaping.
- `support-widget-types.ts` owns local UI/domain types.

The homepage and workspace do not need to move into the package. `apps/web/app/_components/home-page/support/home-page-support-widget.tsx` and `apps/web/app/(workspace)/_components/workspace-support/workspace-support-widget.tsx` are host placement wrappers and should remain app-owned.

## Current Server Bridge

The current frontend talks to the app through `apps/web/app/api/support/_server/support-message-route.ts`. The route reads and sets the support session cookie through `support-session-cookie.ts`, normalizes request input, associates optional Clerk/Convex identity, and calls Convex support functions.

This route is currently important because anonymous transcript access is authorized by an HttpOnly Secure cookie. Browser JavaScript cannot read that cookie, which is the point: transcript-bearing anonymous support access is not a raw localStorage bearer token today.

This means the first package extraction should keep the fetch transport and route bridge intact. The package can call a host-provided transport function instead of knowing about Next.js.

## Current Convex Runtime

Convex support state lives in:

- `apps/web/convex/support.ts`
- `apps/web/convex/support/model.ts`
- `apps/web/convex/support/telegram.ts`
- `apps/web/convex/http.ts`
- support tables inside `apps/web/convex/schema.ts`

Convex owns support visitors, threads, messages, delivery metadata, Telegram topic mapping, operator action audit rows, retention, manual retry, and token-protected operations snapshots.

Telegram inbound webhook handling is a Convex HTTP action. Outbound delivery uses support-specific Telegram env and must stay separate from observability Telegram delivery.

## Extraction Boundary

Move into `packages/telegram-chat-widget`:

- React panel and launcher presentation.
- Message list rendering.
- Composer behavior, including Enter-to-send and Shift+Enter newline.
- Bug-report mode UI and validation handoff.
- Screenshot attachment UI affordance and local file policy.
- Client-side optimistic state model.
- Transport-neutral type definitions.
- Package tests for UI behavior and state transitions.

Keep in `apps/web`:

- Homepage and workspace placement.
- Product-specific copy decisions until the package copy contract is finalized.
- PostHog implementation.
- Fallback URL choice.
- Next route handlers and HttpOnly cookie bridge while fetch transport is in use.
- Clerk/Convex provider wiring.
- Production bot setup docs owned by the current support runtime.

Keep in Convex backend:

- Thread/message persistence.
- Telegram Bot API calls.
- Telegram webhook parsing.
- Operator allowlists.
- Retention and purge behavior.
- Abuse controls.
- Recovery and operations snapshots.
- AI draft generation and operator action semantics.

## Current Gaps Relevant To This Program

The widget currently polls the support route to refresh transcript state. The package should preserve this behavior during extraction, then add an optional Convex realtime adapter as a later slice.

Screenshot and bug-report UX exists in the current app-local widget, but the package must make the boundary explicit: core UI can validate file policy and collect metadata, while the active adapter owns upload URL creation, storage, and backend message shape.

The existing app-local UI uses Tailwind classes. A reusable package should not require the host Tailwind configuration. The first package slice should define the final styling strategy before moving the UI.
