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

The package must be standalone React and internal monorepo-only for v1. It must not depend on Next.js, a router, a Bun server, or Convex Component packaging. React should be a peer dependency. Use one package with subpath exports instead of separate adapter packages. Convex should be isolated behind an optional adapter entrypoint, not required by the root export. The root package should expose stable core types and React-facing primitives. Separate entrypoints should be planned for fetch, Convex, CSS, and testing helpers if the package tooling supports them cleanly.

Dependency policy: `react` and `react-dom` should be peer dependencies. `lucide-react` can be a package dependency only if package-owned icons remain. `clsx` can be a package dependency only if needed for class composition. Avoid `tailwind-merge` in v1. Do not add Next.js, Clerk, PostHog, or app-local dependencies.

Reserve a `./convex` subpath in the package scaffold so the future adapter import path is stable, but do not implement live Convex realtime in the first child ExecPlan. The scaffold may expose future-facing Convex adapter types or a deliberate placeholder; real `useQuery`, mutation, and conversation-token behavior belongs in the later Convex Realtime Adapter slice.

The scaffold should include a working configurable fetch adapter under `./fetch`. `createFetchTelegramChatClient()` should default to today's `/api/support/messages` and `/api/support/attachments` route shape, while accepting configurable endpoint paths and an optional injected `fetchImpl` for tests. Do not switch `apps/web` to consume the package fetch adapter in the scaffold slice.

The package should be opinionated and default-styled rather than headless-first. The first slice should plan for selected AI Elements primitives to enter the package source as package-owned, heavily modified branded primitives, especially Conversation, Prompt Input, and Attachments. Task and Stack Trace should remain candidates for structured bug-report or diagnostic displays, not default chrome unless a later UI slice proves they improve the customer experience.

Styling should follow shadcn theming best practices. Package CSS should use CSS variables and semantic token mapping, inheriting host shadcn tokens when present and providing branded package fallbacks when they are absent. The package styling contract should not require the host app to generate Tailwind utilities for package internals. Do not add a package theme provider or React `themeMode` prop in the first scaffold unless implementation proves CSS variable overrides cannot cover the need.

Transport should be modeled as one typed client adapter object, not a loose set of callback props. The first scaffold should define the client interface and related thread/message/send/upload types even if the fetch implementation remains skeletal until the UI extraction slice.

Analytics should be modeled as a host-provided typed event sink. The first scaffold should define package event types for lifecycle and delivery metadata, but it must not import PostHog or send transcript text, attachment content, emails, tokens, Telegram ids, or generated output in event payloads.

The primary public React API should be an all-in-one `TelegramChatWidget` that owns the launcher, panel, open state, and default fixed placement. Lower-level panel and primitive modules can exist internally for code organization and tests, but they should not become broad public exports in the first scaffold.

Placement should be narrow and explicit. Default to fixed `bottom-right`, support `bottom-left` and `inline` if the first scaffold includes placement types, and avoid arbitrary positioning config bags in v1.

Content should have strong package defaults and allow partial host overrides. The first scaffold should define the complete content type and the merge boundary so later UI extraction does not require every host wrapper to pass a full copy object.

Because v1 is internal-only, the default copy should be Parker/Ship by Sunday-branded rather than generic support-chat language. Keep the override model ordinary so a later public-package direction can swap defaults without changing the API.

Actual upload support should be screenshot/image-only in v1. The first scaffold should define an attachment policy for PNG, JPEG, and WebP screenshots with the current support max size, and avoid arbitrary file/log/video upload types. The domain model can still leave a clean extension point for future structured diagnostics.

Allow only one screenshot attachment per message in v1. The type and client adapter should model a single optional attachment, matching the current backend and avoiding multi-upload partial failure behavior in the scaffold.

Bug reporting should stay an inline composer mode rather than a separate wizard or modal. The first scaffold should model chat modes and bug-report draft state so the later UI extraction can keep one send path, one attachment path, and one delivery/error state model.

Bug-report send input should include structured metadata plus a rendered readable body. The fetch adapter can flatten to the current backend shape during migration, but the package contract should preserve typed fields for summary, steps, expected result, impact, page path, viewport, and user agent.

The first slice should create the package directory and minimal source files, such as core types, a package index, adapter interface types, an initial CSS file or CSS strategy placeholder, and focused package tests that can run without `apps/web`. If workspace package validation scripts or `apps/web/next.config.ts` need updates for future consumption, make only the smallest necessary changes. Do not migrate the existing widget components in this slice unless the ExecPlan proves the scaffold cannot be validated otherwise.

The first child ExecPlan should be scaffold/contracts only. It should not move the current widget UI, switch app imports, replace polling, or modify support runtime behavior. Those changes belong in later child ExecPlans after the package contract validates.

The scaffold must include focused package tests from day one. Required test coverage should include content defaults merging with partial overrides, screenshot policy acceptance and rejection, structured bug-report payload rendering, metadata-only analytics event helpers, and any adapter fixture helpers introduced by the scaffold. Avoid browser or pixel-level UI tests until a later UI extraction slice creates real rendered UI in the package.

Fetch adapter tests should cover GET thread loading, POST message sending, screenshot upload URL preparation, storage upload, invalid response handling, and backend error propagation using an injected test `fetchImpl`.

The package should own privacy DOM hooks by default. The scaffold should define constants, helper class names, or documented selectors for transcript no-capture surfaces, sensitive rendered message/attachment surfaces, and masked input fields so UI extraction cannot omit them. The package should not rely on `apps/web` wrappers to add privacy hooks after the fact.

The scaffold may include a minimal skeletal `TelegramChatWidget` React export so the root package API compiles. It should not copy the existing app UI, implement the real launcher/panel, adapt AI Elements primitives, or create empty AI Elements primitive placeholder files. Rendered UI tests should wait for the UI extraction slice.

Create `packages/telegram-chat-widget/README.md` in the scaffold slice. It should document package imports, CSS import, fetch adapter usage, content overrides, privacy hook guarantees, local package commands, and the fact that live Convex realtime is reserved for a later slice. It should not duplicate app-owned Telegram, Convex env, webhook, production verification, or operator workflow setup docs.

The scaffold must wire the new package into root package gates immediately. Update root `lint:packages`, `typecheck:packages`, and `test:packages` so standard repo validation includes `packages/telegram-chat-widget` from its first commit.

Use the current support runtime as the source of truth for names and states. Important current files are `apps/web/app/_components/support/support-widget-panel.tsx`, `apps/web/app/_components/support/use-support-chat.ts`, `apps/web/app/_components/support/support-api-client.ts`, `apps/web/app/api/support/_server/support-message-route.ts`, `apps/web/convex/support.ts`, and `apps/web/convex/support/model.ts`.

Boundary rules: do not import `apps/web` modules into the package; do not import generated Convex API references into package core; do not import app-local `@/components/ai-elements/*` paths into package code; do not leave AI Elements primitives visually generic when they become package source; do not create empty AI Elements primitive placeholder files in the scaffold; do not make host Tailwind generation a requirement for package styling; do not force a standalone widget theme provider in v1; do not import PostHog or any analytics SDK into the package; do not add Next.js, Clerk, or app-specific dependencies to the package; do not make panel-only composition the main public API; do not introduce arbitrary placement config bags in v1; do not require exhaustive host copy props for the widget to render well; do not use generic support copy as the internal v1 default; do not add arbitrary file, log, or video upload support in v1; do not add multi-attachment upload support in v1; do not create a separate bug-report wizard or modal in the scaffold; do not make future code parse rendered bug-report text to recover structured fields; do not rely on host wrappers to add transcript/input privacy hooks; do not implement real launcher/panel UI in the scaffold slice; do not migrate the current `apps/web` widget UI in this first slice; do not switch `apps/web` to consume the package fetch adapter in this first slice; do not implement live Convex realtime in this scaffold slice; do not duplicate app-owned Telegram/Convex provider setup docs inside the package README; do not replace polling in this slice; do not introduce a manual WebSocket; do not switch anonymous support access away from the current HttpOnly bridge; do not add npm publishing workflows or public-package release automation; do not use Convex local mode; do not stage unrelated billing, release, or shipping-evidence changes that are currently dirty in the checkout.

Validation should include the new package tests, package typecheck, root package validation commands that include the new package, `bun run programs:lint` if Program files are touched, and narrow app checks only if the slice changes app config. The final ExecPlan should name any validation that is blocked by the package being scaffold-only.
