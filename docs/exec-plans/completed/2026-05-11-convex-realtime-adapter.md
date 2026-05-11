---
title: Convex Realtime Adapter
status: complete
created_at: 2026-05-11
completed_at: 2026-05-11
summary: Add a Convex-backed realtime thread subscription for the standalone Telegram chat widget so customer replies update without visitor-side polling.
post_build_recap: The support widget now receives Convex-backed realtime thread state through a hash-stored conversation capability, suppresses fetch polling while realtime is active, and falls back to the existing fetch bridge when realtime is unavailable.
program_id: standalone-telegram-chat-widget
planning_brief: docs/programs/completed/2026-05-10-standalone-telegram-chat-widget/planning-brief-3.md
read_when:
  - Resuming the Convex realtime adapter slice.
  - Changing support widget polling or realtime subscription behavior.
  - Auditing anonymous support-thread authority.
---

# Convex Realtime Adapter

This document is a living execution plan for replacing the support widget's three-second refresh loop with a Convex-backed realtime subscription when the host can provide Convex.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Customers should see Parker's replies appear naturally in the support widget without a refresh button and without browser polling. Convex already streams reactive query results through its React client, so this slice should let the package consume a realtime thread state while keeping message sends and screenshot uploads on the existing Next route bridge. The finished behavior is visible when opening the support widget: the package should subscribe to the current support thread and skip the old three-second polling loop while the subscription is available.

## Progress

- [x] 2026-05-11: Read Program `planning-brief-3.md`, the active Program packet, `apps/web/AGENTS.md`, Convex AI guidance, local Next route-handler docs, and current support/widget runtime code.
- [x] 2026-05-11: Verified current Convex docs: `useQuery` creates subscriptions, rerenders on underlying data changes, can be skipped with `"skip"`, and uses a WebSocket under `ConvexReactClient`.
- [x] 2026-05-11: Created this child ExecPlan before implementing the realtime slice.
- [x] 2026-05-11: Added a scoped support conversation capability for anonymous realtime reads.
- [x] 2026-05-11: Added the package realtime state contract and Convex subpath hook.
- [x] 2026-05-11: Wired `apps/web` support wrapper to the Convex subscription and removed package polling when realtime is active.
- [x] 2026-05-11: Updated tests, package docs, and Program state.
- [x] 2026-05-11: Ran focused and broad validation, hosted Convex dev sync, and browser proof.

## Surprises & Discoveries

The existing support session authority is intentionally held in an HttpOnly cookie by `apps/web/app/api/support/_server/support-session-cookie.ts`, and browser Convex subscriptions cannot read it. That means direct Convex realtime cannot safely reuse the raw session token. The realtime path needs a separate high-entropy capability token issued by the server route, stored only as a hash in Convex, and scoped to the support conversation.

While reading `apps/web/convex/support/model.ts`, the closed-thread fallback path was found to query closed support threads without constraining the query to the current visitor. This is a privacy-sensitive bug in the existing fetch path and must be fixed inside this slice before adding a new realtime read path that depends on the same model.

The root `bun run release:convex:sync-hosted-dev` helper currently runs the Convex CLI from the repo root and failed because the root package does not depend on `convex`. Running the equivalent hosted command from `apps/web` with `bunx convex dev --once --typecheck disable` succeeded and added the new hosted dev indexes.

Broad app typecheck exposed two stale dirty-tree issues outside this support widget slice: checkout success fixtures were missing the newly required `ProductAccess.capabilities`, and `fulfillQueuedStripeWebhookEvent` had been widened to the full Stripe webhook result union even though its validator only permits fulfillment results. Both were repaired narrowly so the app could typecheck.

## Decision Log

Decision: Keep send and screenshot upload on the existing fetch bridge in this slice.
Rationale: The fetch bridge preserves the HttpOnly cookie, attachment upload flow, Telegram delivery action, and current error handling. Realtime reads can be added independently through a subscription state, avoiding a larger mutation/auth migration.
Date: 2026-05-11

Decision: Use a server-issued support conversation capability for anonymous realtime reads.
Rationale: The browser needs a value it can pass to Convex `useQuery`, but it must not receive the long-lived HttpOnly session token. A random capability token stored as a hash in Convex limits the exposed authority to this support conversation and can expire independently.
Date: 2026-05-11

Decision: Keep Convex imports behind `@shipbysunday/telegram-chat-widget/convex`.
Rationale: The base package should stay usable with the generic `TelegramChatClient` and fetch adapter. Hosts that already have Convex can opt into the subpath hook and pass the resulting realtime state to `TelegramChatWidget`.
Date: 2026-05-11

## Outcomes & Retrospective

This plan is complete. `apps/web` still sends support messages and prepares screenshot uploads through the same fetch route bridge, but it now requests a realtime conversation capability from `GET /api/support/session` and subscribes to `api.support.getThreadByConversationCapability` through the package Convex subpath. The package applies subscribed thread state and suppresses its former three-second `/api/support/messages` polling loop while realtime is loading or ready. If the capability route or subscription is unavailable, the fetch fallback still works.

## Context and Orientation

The package widget lives in `packages/telegram-chat-widget`. `src/react/telegram-chat-widget.tsx` currently calls `useTelegramChatController`, loads the thread on open, and then starts a three-second interval through `telegramChatPollIntervalMs`. `src/core/telegram-chat-client.ts` defines the transport contract, and `src/adapters/fetch/fetch-telegram-chat-client.ts` talks to `GET /api/support/messages`, `POST /api/support/messages`, and `POST /api/support/attachments`.

The web app wrapper is `apps/web/app/_components/support/support-widget.tsx`. It currently creates the fetch client, passes branded content, and maps package events to PostHog. The whole app already sits under `ConvexClientProvider` in `apps/web/app/layout.tsx`, so client components can use Convex React hooks.

The support backend lives in `apps/web/convex/support.ts` and `apps/web/convex/support/model.ts`. `getThreadBySession` reads a thread by a raw session token, but that raw token is only available to Next route handlers through `apps/web/app/api/support/_server/support-session-cookie.ts`. The session route `apps/web/app/api/support/session/route.ts` currently exists and can become the server boundary that issues a separate realtime capability.

Convex realtime works by subscribing to query functions through `useQuery`. The first hook call starts a subscription for the query and arguments, the hook returns `undefined` while loading, and the client rerenders when database data read by the query changes. Passing `"skip"` disables a query.

### In Scope

This slice adds a `supportConversationCapabilities` Convex table, capability-token hashing helpers, a public mutation to issue a capability from the server-held session token, and a public query to read the current support thread by capability. It fixes the current closed-thread lookup so it only returns closed threads for the current visitor. It extends the widget package with a realtime state prop that suppresses polling while active, plus a Convex subpath hook that adapts `convex/react` `useQuery` into that package state. It updates the Ship by Sunday support wrapper to fetch `/api/support/session`, subscribe through Convex, and pass realtime state into `TelegramChatWidget`.

### Out Of Scope

Do not move sends or screenshot uploads to direct Convex mutations in this slice. Do not expose the existing HttpOnly support-session cookie to browser JavaScript. Do not redesign the widget UI. Do not introduce a Convex Component, a manual WebSocket, npm publishing, arbitrary file uploads, multi-attachment uploads, or a new Telegram operator workflow.

## Plan of Work

First fix the support model authority. Update `apps/web/convex/schema.ts` with a capability table and add validators in `apps/web/convex/support/validators.ts`. In `apps/web/convex/support/model.ts`, add helpers to hash capability tokens with a distinct prefix, create random capability tokens, issue active capabilities with an expiration, and read a thread by capability. While there, update the closed-thread lookup to query `supportThreads.by_visitor_id_and_status` with the current visitor id and closed status before ordering by newest. Expose the new handlers from `apps/web/convex/support.ts` with validators.

Then update the server session route. Change `getSupportSessionFromRequest` in `apps/web/app/api/support/_server/support-message-route.ts` so it still appends the HttpOnly support cookie, but also calls `api.support.issueVisitorConversationCapability` and returns a browser-visible `realtime.capabilityToken`. If capability issuance fails, return `realtime.kind: "unavailable"` instead of failing the whole support widget.

Next update the package. Add a `TelegramChatRealtimeState` type and a `realtime` prop to `TelegramChatWidget`. The widget should still load through `client.loadThread()` when realtime is unavailable, but when realtime status is `loading` or `ready`, it should not start the three-second polling interval. When realtime returns a thread state, apply it to the controller state and mark the thread loaded. Replace the reserved `./convex` export with a `useConvexTelegramChatRealtime` hook that accepts a host-provided query function reference plus a capability token and returns the package realtime state.

Then wire the app host. Add a small hook near `apps/web/app/_components/support/` that fetches `/api/support/session` once, validates the response shape, and stores only the returned capability token. In `support-widget.tsx`, call that hook, pass the token to `useConvexTelegramChatRealtime` with `api.support.getThreadByConversationCapability`, and pass the realtime state into `TelegramChatWidget`. Keep the fetch client for send/upload.

Finally update tests and docs. Add focused package tests for polling suppression state decisions and Convex hook exports where practical. Add app unit tests for session capability response safety and Convex model tests for capability hashing, issuance, capability reads, and visitor-scoped closed-thread lookup. Update `packages/telegram-chat-widget/README.md`, this ExecPlan, and the Program packet.

## Milestones

Milestone 1 is backend authority. It is complete when Convex can issue a hash-stored support conversation capability, read a support thread by capability, and closed-thread reads cannot cross visitors. The proof is focused app unit tests around `convex-support-model` and `support-message-route`.

Milestone 2 is package realtime support. It is complete when `TelegramChatWidget` accepts a realtime state, applies subscribed thread updates, and suppresses the polling interval while realtime is loading or ready. The proof is package typecheck and focused package tests.

Milestone 3 is host integration. It is complete when `apps/web` fetches a realtime capability from the session route, uses Convex `useQuery` through the package subpath, keeps sends/uploads on fetch, and browser proof shows the widget still opens on desktop and mobile. The proof is focused app tests, package/app typecheck, hosted Convex dev sync if credentials are available, and browser proof.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Implement Milestone 1, then run:

    bun run --cwd apps/web test:unit -- convex-support-model support-message-route

Implement Milestone 2, then run:

    bun run --cwd packages/telegram-chat-widget lint
    bun run --cwd packages/telegram-chat-widget format:check
    bun run --cwd packages/telegram-chat-widget typecheck
    bun run --cwd packages/telegram-chat-widget test

Implement Milestone 3, then run:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx

Before completion, run:

    bun run lint:packages
    bun run typecheck:packages
    bun run test:packages
    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-11-convex-realtime-adapter.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-11-convex-realtime-adapter.md docs/programs/completed/2026-05-10-standalone-telegram-chat-widget packages/telegram-chat-widget/README.md
    git diff --check

Use `bun run dev:convex` only against hosted Convex dev, never Convex local mode. In this checkout, the raw command that succeeded was:

    cd /Users/bazelrex/Developer/ship-by-sunday/apps/web
    bunx convex dev --once --typecheck disable

## Validation and Acceptance

The plan is accepted when the support widget still loads and sends messages through the current fetch bridge, but open widget threads receive Convex-backed realtime state when a capability is available and do not start the three-second polling interval in that mode. The anonymous browser-visible token must not be the support-session cookie; only its hash may be stored in Convex. A closed support thread read must only return a thread belonging to the current visitor. If capability issuance or subscription setup fails, the widget must keep working through the fetch fallback.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- convex-support-model support-message-route
    bun run --cwd packages/telegram-chat-widget lint
    bun run --cwd packages/telegram-chat-widget format:check
    bun run --cwd packages/telegram-chat-widget typecheck
    bun run --cwd packages/telegram-chat-widget test
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx
    bun run lint:packages
    bun run typecheck:packages
    bun run test:packages
    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-11-convex-realtime-adapter.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-11-convex-realtime-adapter.md docs/programs/completed/2026-05-10-standalone-telegram-chat-widget packages/telegram-chat-widget/README.md
    git diff --check

Run desktop and mobile browser proof against the local app after the app compiles. Verify the support launcher opens, the panel is styled, and the browser console/network path does not show a three-second `/api/support/messages` polling cadence while realtime is active.

## Idempotence and Recovery

Capability issuance is additive. If a token is lost, the session route can issue another token for the same HttpOnly session without changing the support thread. If Convex subscription setup fails, the host should pass realtime unavailable and the package should use the fetch fallback. If schema or function generation becomes stale, run hosted Convex dev sync rather than switching to local Convex mode. If the package realtime prop causes a render regression, remove only the app's realtime prop to fall back to the already validated fetch transport while fixing the package.

## Artifacts and Notes

Research sources used for implementation:

- Convex realtime docs: query functions are automatically realtime through client subscriptions.
- Convex React docs: `useQuery` subscribes on mount, returns `undefined` while loading, can be skipped with `"skip"`, and rerenders on database changes.
- Convex auth debug docs: client auth can be temporarily null on page load, so this slice should not rely on authenticated identity for anonymous support subscriptions.

The previous completed package migration is `docs/exec-plans/completed/2026-05-11-ui-extraction-with-fetch-transport.md`.

Final validation:

- `bun run --cwd apps/web test:unit -- convex-support-model support-message-route` passed, 2 files and 40 tests.
- `bun run --cwd packages/telegram-chat-widget lint` passed.
- `bun run --cwd packages/telegram-chat-widget format:check` passed.
- `bun run --cwd packages/telegram-chat-widget typecheck` passed.
- `bun run --cwd packages/telegram-chat-widget test` passed, 4 files and 16 tests.
- `bun run --cwd apps/web lint` passed.
- `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck` passed.
- `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx` passed, 2 files and 4 tests.
- `bunx convex dev --once --typecheck disable` from `apps/web` passed against hosted Convex dev and added the support conversation capability indexes.
- `node codex-scripts/telegram-chat-widget-browser-proof.mjs` passed on desktop and mobile, including the assertion that opening the widget makes one `/api/support/session` request and no `/api/support/messages` polling GETs while realtime is active.
- `bun run lint:packages`, `bun run typecheck:packages`, and `bun run test:packages` passed.

## Interfaces and Dependencies

`@shipbysunday/telegram-chat-widget` remains the root package UI and fetch-client contract. `@shipbysunday/telegram-chat-widget/convex` may import `convex/react` and Convex function-reference types, with `convex` declared as an optional peer for hosts that opt into realtime. The Ship by Sunday host imports `api.support.getThreadByConversationCapability` from `apps/web/convex/_generated/api` and passes the subscribed thread state into the package. The server session route owns the only bridge from the HttpOnly support cookie to the browser-visible realtime capability.
