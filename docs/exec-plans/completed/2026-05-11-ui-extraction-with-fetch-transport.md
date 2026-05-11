---
title: UI Extraction With Fetch Transport
status: complete
created_at: 2026-05-11
completed_at: 2026-05-11
summary: Move the current support widget UI into packages/telegram-chat-widget while preserving the existing fetch-backed app behavior.
post_build_recap: Package now owns the full Telegram support widget UI and fetch-backed controller; apps/web consumes it through a thin wrapper, with package CSS imported from the root layout for both production and Turbopack dev.
program_id: standalone-telegram-chat-widget
planning_brief: docs/programs/completed/2026-05-10-standalone-telegram-chat-widget/planning-brief-2.md
read_when:
  - Resuming the support widget UI extraction.
  - Validating the package widget migration.
  - Checking why apps/web still uses the fetch transport.
---

# UI Extraction With Fetch Transport

This document is a living execution plan for moving the current Ship by Sunday support widget UI into `packages/telegram-chat-widget`.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Customers should keep seeing the polished ChatGPT-like support widget, but the implementation should now live inside the standalone internal package instead of app-local support components. After this slice, `apps/web` will mount `TelegramChatWidget` from `@shipbysunday/telegram-chat-widget`, use the package fetch client against the same support routes, and keep the same visible behavior, privacy hooks, screenshot upload, bug-report mode, Enter-to-send, and metadata-only analytics. This proves the package can own the real customer experience before the later Convex realtime slice changes transport behavior.

## Progress

- [x] 2026-05-11: Created `planning-brief-2.md` for the UI extraction slice.
- [x] 2026-05-11: Created this child ExecPlan from the second planning brief.
- [x] 2026-05-11: Moved widget state orchestration into the package.
- [x] 2026-05-11: Moved the rendered launcher, panel, conversation, composer, attachment, and bug-report UI into the package.
- [x] 2026-05-11: Replaced app-local support internals with thin host wrappers that use the package fetch adapter and event sink.
- [x] 2026-05-11: Imported package CSS in the web app and added the package to Next transpilation.
- [x] 2026-05-11: Updated package README and Program state, including `planning-brief-3.md` for the Convex realtime adapter slice.
- [x] 2026-05-11: Ran focused package and app validation plus desktop/mobile browser proof.

## Surprises & Discoveries

- Running `bun install` updated the root `@clerk/backend` lockfile entry from `3.4.1` to `3.4.6` while `@clerk/nextjs` still carried its nested `@clerk/backend@3.4.1`. The app typecheck then failed because `apps/web/app/admin/impersonation/_server/admin-impersonation-server.ts` imported the standalone Clerk `User` class type while `clerkClient()` returned the nested class type. The fix was to infer `ClerkUser` from the actual `clerkClient()` instance instead of naming the standalone package class.
- Production webpack build included the package CSS when it was nested as an `@import` in `globals.css`, but Turbopack dev did not apply those package styles. Browser proof caught the unstyled panel. The fix was to import `@shipbysunday/telegram-chat-widget/styles.css` directly from the root layout as a package stylesheet, matching Next's external stylesheet guidance.

## Decision Log

Decision: Preserve the current fetch bridge for this extraction.
Rationale: The customer-visible UI can move into the package without changing the HttpOnly support-session cookie, route bridge, or polling behavior. Realtime belongs in the next dedicated slice.
Date: 2026-05-11

Decision: Allow `lucide-react` as a package dependency.
Rationale: The package now owns rendered icon buttons and should not rely on app-local icon composition. React remains a peer dependency.
Date: 2026-05-11

## Outcomes & Retrospective

This plan is complete. `packages/telegram-chat-widget` now renders the full support widget UI and controller, including load-on-open, three-second fetch refresh, inline bug-report mode, screenshot validation, optimistic sends, delivery/error states, Enter-to-send, and package-owned privacy hooks. `apps/web` now consumes the package through `SupportWidget`, imports package CSS from `app/layout.tsx`, and transpiles the package through Next.

## Context and Orientation

The current app-owned widget lives in `apps/web/app/_components/support/`. `support-widget.tsx` owns fixed placement and the launcher. `support-widget-panel.tsx` owns the panel, transcript, composer, attachment chip, inline bug-report fields, delivery labels, and progressive operator text. `use-support-chat.ts` owns open state, load-on-open, polling, draft state, bug-report state, screenshot validation, optimistic send state, and analytics. `support-api-client.ts` owns the fetch calls to `/api/support/messages` and `/api/support/attachments`.

The new package lives in `packages/telegram-chat-widget`. It already has core thread/message types, content defaults, screenshot policy helpers, bug-report payload rendering, privacy constants, metadata-only event helpers, a tested `./fetch` adapter, a reserved `./convex` subpath, and a skeletal `TelegramChatWidget` root export.

The app support routes stay in `apps/web/app/api/support/`. They keep the anonymous transcript authority behind an HttpOnly support-session cookie. This slice must not expose that cookie or change route behavior.

### In Scope

This plan moves the current widget UI and controller into `packages/telegram-chat-widget`, expands the package content contract to cover all currently rendered labels, uses package CSS classes instead of app Tailwind utility classes for package internals, adds `lucide-react` as a package dependency, makes `apps/web` use `createFetchTelegramChatClient()` and `TelegramChatWidget`, imports package CSS in the web app, updates `next.config.ts` `transpilePackages`, updates tests and docs, and validates that homepage and workspace support behavior still works.

### Out Of Scope

Do not implement live Convex realtime. Do not add direct browser-visible conversation tokens. Do not change Convex schema, support routes, Telegram delivery, Clerk behavior, PostHog setup, support-session cookies, arbitrary file uploads, multi-attachment uploads, public package publishing, or external provider setup docs. Do not use Convex local mode.

## Plan of Work

First expand the package API. Update `packages/telegram-chat-widget/src/core/telegram-chat-content.ts` so the package content type covers the existing app labels such as starter message, close label, bug impact label, remove screenshot label, delivery labels, and closed-thread text. Update `src/core/telegram-chat-types.ts`, `src/core/telegram-chat-client.ts`, and `src/core/telegram-chat-events.ts` only where the rendered widget needs typed status, mode, surface, or event context.

Next replace the skeletal root React export. Create package React modules for the widget controller and presentation under `packages/telegram-chat-widget/src/react/`. The controller should call the provided `TelegramChatClient`, load on open, poll every three seconds after first load, validate screenshots with package helpers, create optimistic visitor messages, build bug-report payloads with package helpers, emit metadata-only events through `eventSink`, and never import host code. The presentation should reproduce the current polished launcher and panel using package CSS classes and lucide icons.

Then update `packages/telegram-chat-widget/src/styles/telegram-chat-widget.css` so all package class names used by the UI are styled without Tailwind. Preserve the current dark panel, responsive fixed placement, launcher motion variants, transcript privacy hooks, and mobile width behavior.

Then migrate `apps/web`. Keep `apps/web/app/_components/support/support-widget.tsx` as a small host wrapper that creates the fetch client, passes app content, entry surface, fallback link, launcher motion, and surface metadata, and maps package events to `capturePostHogProductEvent`. Remove or stop using app-local `support-widget-panel.tsx`, `use-support-chat.ts`, and `support-api-client.ts`. Add `@shipbysunday/telegram-chat-widget` to `apps/web/next.config.ts` `transpilePackages` and import package CSS from `apps/web/app/layout.tsx`.

Finally update docs and validation. Update `packages/telegram-chat-widget/README.md`, this ExecPlan, and the owning Program. Run package tests, app support integration-ui tests, package root gates, docs linters, and browser proof on desktop and mobile.

## Milestones

Milestone 1 moves controller and presentation into the package. Success means the package `TelegramChatWidget` renders the launcher and panel using package-owned state and CSS, and package-local typecheck succeeds.

Milestone 2 migrates `apps/web` to consume the package. Success means homepage and workspace wrappers no longer import app-local support internals, fetch calls still target the existing app routes, and existing support integration-ui tests pass.

Milestone 3 validates and documents the slice. Success means package/app focused checks pass, docs reflect the new ownership boundary, and browser proof shows the widget renders on desktop and mobile.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Before editing, confirm the worktree:

    git status --short

After package edits, run:

    bun run --cwd packages/telegram-chat-widget typecheck
    bun run --cwd packages/telegram-chat-widget test

After app migration, run:

    bun run --cwd apps/web test:integration:ui -- home-page-support-widget workspace-support-widget

Before completion, run:

    bun run --cwd packages/telegram-chat-widget lint
    bun run --cwd packages/telegram-chat-widget format:check
    bun run lint:packages
    bun run typecheck:packages
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-11-ui-extraction-with-fetch-transport.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-11-ui-extraction-with-fetch-transport.md docs/programs/completed/2026-05-10-standalone-telegram-chat-widget packages/telegram-chat-widget/README.md
    bun run programs:lint
    git diff --check

Use browser tooling against the local app on one desktop viewport and one mobile viewport after the app renders.

## Validation and Acceptance

This plan is accepted only when `TelegramChatWidget` in `packages/telegram-chat-widget` renders the full current support widget, `apps/web` consumes it through the package, the existing homepage and workspace behavior remains intact, the package remains free of Next.js, Clerk, PostHog, Convex runtime, generated Convex APIs, and app aliases, and support transcript/input privacy hooks remain present.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd packages/telegram-chat-widget lint
    bun run --cwd packages/telegram-chat-widget format:check
    bun run --cwd packages/telegram-chat-widget typecheck
    bun run --cwd packages/telegram-chat-widget test
    bun run --cwd apps/web test:integration:ui -- home-page-support-widget workspace-support-widget
    bun run lint:packages
    bun run typecheck:packages
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-11-ui-extraction-with-fetch-transport.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-11-ui-extraction-with-fetch-transport.md docs/programs/completed/2026-05-10-standalone-telegram-chat-widget packages/telegram-chat-widget/README.md
    bun run programs:lint
    git diff --check

Run browser proof on desktop and mobile if the local app can start.

## Idempotence and Recovery

This migration is mostly a move from app-local support internals into the package. If a package file fails midway, repair the package file directly; do not restore deleted app-local files unless the package migration is abandoned. If Next fails to compile the package import, update `apps/web/next.config.ts` `transpilePackages` rather than importing app code into the package. If package CSS does not load, import the package CSS from the app root layout as an external package stylesheet. If tests show fetch shape drift, fix the app wrapper or package fetch adapter to match the current routes instead of changing the routes in this slice.

## Artifacts and Notes

The previous scaffold commit is `8442f3b6 feat: scaffold telegram chat widget package`.

The existing homepage and workspace tests are `apps/web/tests/integration-ui/home-page-support-widget.test.tsx` and `apps/web/tests/integration-ui/workspace-support-widget.test.tsx`. They are the main regression proof for this slice.

Final validation:

- `bun run --cwd packages/telegram-chat-widget lint` passed.
- `bun run --cwd packages/telegram-chat-widget format:check` passed.
- `bun run --cwd packages/telegram-chat-widget typecheck` passed.
- `bun run --cwd packages/telegram-chat-widget test` passed, 3 files and 14 tests.
- `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx` passed, 2 files and 3 tests.
- `bun run --cwd apps/web lint` passed.
- `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck` passed.
- Desktop browser proof on `http://localhost:3000` showed the package launcher and opened support panel.
- Mobile browser proof on `http://localhost:3000` showed the responsive package launcher and opened support panel.

## Interfaces and Dependencies

The package root is `@shipbysunday/telegram-chat-widget`. The web app should import `TelegramChatWidget` from the root, `createFetchTelegramChatClient` from `@shipbysunday/telegram-chat-widget/fetch`, and CSS from `@shipbysunday/telegram-chat-widget/styles.css` through the app root layout. The package may depend on `lucide-react`; React and React DOM remain peer dependencies. The app owns `capturePostHogProductEvent`, support routes, support-session cookies, and provider setup. The package owns the React UI, controller, content contract, privacy hooks, and fetch client interface.
