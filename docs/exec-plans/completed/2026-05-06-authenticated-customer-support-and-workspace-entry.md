---
title: Authenticated Customer Support And Workspace Entry
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Add a protected workspace entry point for the Telegram-backed support chat while preserving session-scoped transcript privacy and avoiding automatic workspace data sharing.
post_build_recap: Extracted the support widget into a reusable client boundary, kept homepage behavior stable, added the protected workspace `Ask Parker` launcher with workspace-scoped metadata, and validated the slice with focused tests plus repo gates.
program_id: telegram-support-bot
planning_brief: docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-4.md
read_when:
  - Resuming Telegram Support Bot Slice 4.
  - Changing authenticated workspace support entry behavior.
  - Validating support transcript privacy in protected workspace routes.
---

# Authenticated Customer Support And Workspace Entry

This document is the completed execution plan for the authenticated workspace support entry slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Buyers who are already inside the protected workspace should not have to return to the public homepage to ask Parker for help. This slice adds a workspace-scoped support launcher that uses the same Telegram-backed support bridge already proven on the homepage. The visible result is a quiet `Ask Parker` entry in authenticated workspace routes; messages sent there create or reuse the visitor's support thread, include Clerk metadata when available, and reach Parker in Telegram without exposing raw workspace state automatically.

## Progress

- [x] 2026-05-06: Read the Program contract, ExecPlan contract, Telegram Support Bot Program, planning brief 4, app instructions, Convex guidance, release workflow, design guidance, and current support/widget/workspace code before writing this plan.
- [x] 2026-05-06: Created `planning-brief-4.md`, updated `current-planning-brief.txt`, and created this child ExecPlan for Slice 4.
- [x] 2026-05-06: Implemented reusable support widget boundaries under `apps/web/app/_components/support/` and kept the homepage wrapper stable.
- [x] 2026-05-06: Rendered the support widget from the protected workspace layout with workspace-scoped content, `entrySurface: "workspace_support_widget"`, and metadata-only analytics surface `workspace`.
- [x] 2026-05-06: Added focused workspace support widget integration-ui coverage and reran homepage compatibility tests.
- [x] 2026-05-06: Validation passed: focused support tests, plan/program/markdown lint, `bun run format:check`, `bun run format`, `bun lint`, `bun typecheck`, and `git diff --check`.

## Surprises & Discoveries

- 2026-05-06: The current support message route already reads Clerk auth server-side and passes `clerkUserId` into `api.support.sendVisitorMessage`, so the first workspace milestone does not need a new auth-to-support association mutation. The raw support session token still stays in the HttpOnly cookie.
- 2026-05-06: The homepage widget code is currently named and scoped as `HomePageSupport*`. Reusing it directly in workspace routes would create misleading names. The implementation should extract a generic support widget boundary and keep a homepage wrapper for existing imports.

## Decision Log

Decision: Keep the support session cookie as the transcript access authority in this slice.
Rationale: Slice 1 deliberately used an HttpOnly support-session cookie and Convex-stored token hash for anonymous transcript access. Changing to account-wide support history needs a separate privacy model, retention rules, and UI.
Date: 2026-05-06

Decision: Do not send workspace context automatically.
Rationale: Workspace state can include source-derived findings, runner metadata, local paths, and product details. The safe first milestone is an authenticated entry point only; visitors can type context deliberately.
Date: 2026-05-06

Decision: Extract a reusable support widget instead of rendering homepage-named components inside the workspace.
Rationale: The same chat mechanics should serve both surfaces, but names should reflect responsibility. A small shared widget boundary keeps the homepage wrapper compatible and makes the workspace surface explicit.
Date: 2026-05-06

## Outcomes & Retrospective

This plan is complete. The support widget now has a generic client boundary shared by homepage and workspace entry points. The homepage wrapper still sends `entrySurface: "homepage_support_widget"` and analytics surface `homepage`; the protected workspace layout renders an `Ask Parker` launcher that sends `entrySurface: "workspace_support_widget"` and analytics surface `workspace`. The implementation does not send workspace state, source-derived findings, logs, payment details, local paths, or account-wide transcript history automatically.

The intentionally deferred work remains account-wide support history, automatic safe workspace context summaries, live Telegram/OpenAI provider proof after external env setup, and broader operations hardening.

## Context and Orientation

The support chat currently enters through `apps/web/app/_components/home-page/support/home-page-support-widget.tsx`, `use-home-page-support-chat.ts`, `home-page-support-widget-panel.tsx`, and `home-page-support-api-client.ts`. The client calls `apps/web/app/api/support/messages/route.ts`, which delegates to `apps/web/app/api/support/_server/support-message-route.ts`. That server helper reads the HttpOnly support session cookie, reads optional Clerk auth with `auth()` from `@clerk/nextjs/server`, and calls Convex support functions in `apps/web/convex/support.ts`.

Protected workspace pages live under `apps/web/app/(workspace)/`. The shared layout in `apps/web/app/(workspace)/layout.tsx` checks product access with `getServerProductAccess()` and wraps authorized children. The app shell itself is a client component in `apps/web/app/(workspace)/_components/app-shell.tsx`. The workspace support entry should render only after access is granted, but it should remain a passive fixed launcher and should not change workspace navigation or local runner behavior.

Next.js App Router pages and layouts are Server Components by default. Client Components are appropriate for event handlers, state, effects, and browser APIs. The support widget is interactive, so the reusable widget boundary remains a Client Component, while the workspace layout can import and render that client boundary after server-side access checks.

### In Scope

This plan includes extracting reusable support widget client modules, preserving the existing homepage support widget wrapper, rendering a workspace-scoped support launcher from the protected workspace layout, passing `entrySurface: "workspace_support_widget"` on workspace sends, recording metadata-only analytics with `surface: "workspace"`, and adding focused tests that prove both homepage and workspace behavior.

### Out Of Scope

This plan does not add account-wide support history, a support inbox, workspace transcript routes, automatic workspace summaries, source-code excerpts, findings text, runner logs, payment details, local paths, screenshots, Codex transcripts, uploads, binary attachments, CRM behavior, Linear writes, automatic AI replies, CAPTCHA, Turnstile, or changes to Telegram provider setup. It also does not prove the live Telegram loop because the Program already records support-specific Convex env setup as the current live-proof blocker.

## Plan of Work

First, extract the homepage support widget mechanics into a generic client component under `apps/web/app/_components/support/`. The generic API should accept content, fallback href, `entrySurface`, and analytics surface. Keep the transcript `data-ph-no-capture` and textarea `data-ph-mask` attributes intact.

Next, keep `apps/web/app/_components/home-page/support/home-page-support-widget.tsx` as a small compatibility wrapper that adapts the homepage render model to the generic support widget with `entrySurface: "homepage_support_widget"` and analytics surface `homepage`.

Then add a workspace support wrapper under `apps/web/app/(workspace)/_components/workspace-support/`. It should supply workspace-specific copy such as `Ask Parker`, use the configured Telegram fallback href, and pass `entrySurface: "workspace_support_widget"` plus analytics surface `workspace`.

After that, render the workspace support widget from `apps/web/app/(workspace)/layout.tsx` only when `access.hasAccess` is true. Keep `WorkspaceDoctorPassToastWatcher` behavior unchanged and avoid adding support UI to the access-required state.

Finally, add or update focused tests. Preserve the homepage integration-ui test expectations, and add a workspace support widget test that opens the launcher, verifies transcript masking, sends a message from a workspace URL, and asserts the POST body and analytics surface are workspace-scoped.

## Milestones

Milestone 1 extracts the reusable widget. At the end, homepage behavior is unchanged, component names describe their responsibilities, and the existing homepage support widget test still passes.

Milestone 2 adds the workspace entry. At the end, protected workspace routes render a passive `Ask Parker` launcher, workspace sends include `entrySurface: "workspace_support_widget"`, and no raw workspace state is sent automatically.

Milestone 3 validates and records the slice. At the end, focused tests and repo gates pass, and this ExecPlan plus the Program document record the final evidence and any remaining blocker.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the current support and workspace boundaries:

    rg -n "HomePageSupportWidget|useHomePageSupportChat|entrySurface|support_widget" apps/web/app apps/web/tests
    rg -n "WorkspaceLayout|getServerProductAccess|WorkspaceDoctorPassToastWatcher" apps/web/app/\(workspace\)

After extracting the widget and adding workspace entry, run the focused support tests:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx

Before finishing, run every command in `Validation and Acceptance`.

## Validation and Acceptance

The slice is accepted because the homepage support launcher still sends `entrySurface: "homepage_support_widget"` and `surface: "homepage"`, the protected workspace support launcher sends `entrySurface: "workspace_support_widget"` and `surface: "workspace"`, transcript DOM remains masked from PostHog replay, and no implementation sends workspace source, findings, logs, payment, local path, or runner data automatically.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-authenticated-customer-support-and-workspace-entry.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-06-authenticated-customer-support-and-workspace-entry.md docs/programs/active/2026-05-06-telegram-support-bot
    bun run format
    bun lint
    bun typecheck
    git diff --check

If browser tooling is available, also open one workspace route at desktop and mobile widths and verify the launcher does not cover the primary workspace controls. If local auth blocks a real browser session, record that limitation and rely on integration-ui coverage plus the production build route manifest.

## Idempotence and Recovery

The extraction should be mechanical and safe to rerun because the support route contract stays the same. If workspace widget rendering causes layout or z-index issues, remove only the workspace wrapper import from `apps/web/app/(workspace)/layout.tsx` while keeping the generic extraction and homepage wrapper intact. If tests fail after the extraction, verify the POST body still includes `messageText`, `pagePath`, and the correct `entrySurface`.

Do not delete the support session cookie or support tables as part of this slice. Do not run Convex local mode. Do not revert unrelated dirty worktree changes.

## Artifacts and Notes

The implementation files are `apps/web/app/_components/support/support-widget.tsx`, `apps/web/app/_components/support/use-support-chat.ts`, `apps/web/app/_components/support/support-widget-panel.tsx`, `apps/web/app/_components/support/support-api-client.ts`, `apps/web/app/_components/home-page/support/home-page-support-widget.tsx`, `apps/web/app/(workspace)/_components/workspace-support/workspace-support-widget.tsx`, `apps/web/app/(workspace)/layout.tsx`, and focused tests under `apps/web/tests/integration-ui/`.

Validation evidence from 2026-05-06:

    bun run test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx
    Test Files 2 passed; Tests 2 passed.

    bun run test:unit -- tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts
    Test Files 2 passed; Tests 9 passed.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-authenticated-customer-support-and-workspace-entry.md
    docs/exec-plans/completed/2026-05-06-authenticated-customer-support-and-workspace-entry.md: ok

    bun run programs:lint
    telegram-support-bot: ok

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-06-authenticated-customer-support-and-workspace-entry.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs/telegram-support-bot.mdx
    all targeted paths: ok

    bun run format:check
    All matched files use the correct format.

    bun run format
    Finished successfully.

    bun lint
    Found 0 warnings and 0 errors.

    bun typecheck
    Passed and included existing workspace routes plus `/api/support/messages` in the production build route manifest.

    git diff --check
    Passed with no whitespace errors.

## Interfaces and Dependencies

This slice depends on the existing support API routes in `apps/web/app/api/support/`, Convex support functions in `apps/web/convex/support.ts`, the support session cookie helper in `apps/web/app/api/support/_server/support-session-cookie.ts`, product access in `apps/web/app/(workspace)/layout.tsx`, and metadata-only PostHog capture through `capturePostHogProductEvent`. The public route contract remains `GET /api/support/messages` and `POST /api/support/messages`; only the client-provided `entrySurface` changes by surface.
