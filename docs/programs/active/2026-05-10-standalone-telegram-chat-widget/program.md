---
program_id: standalone-telegram-chat-widget
title: Standalone Telegram Chat Widget
status: active
created_at: 2026-05-10
completed_at: null
summary: Extract the first-party Telegram support experience into a standalone React package with optional Convex realtime support, without depending on Next.js or Convex Component packaging.
post_build_recap: null
read_when:
  - Planning or implementing the standalone Telegram chat widget package.
  - Changing support widget package boundaries, realtime transport, attachment handling, or host-app integration.
  - Deciding whether the support widget should depend on Next.js, Convex, Clerk, or app-specific routes.
---

# Standalone Telegram Chat Widget

This Program is a living initiative document. Update it whenever a child slice lands, the package boundary changes, or validation changes the durable truth.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday now has a working first-party Telegram-backed support widget, but the implementation still lives as app-local components, routes, and Convex support code. The next product step is to turn the chat experience into `packages/telegram-chat-widget`: a reusable React package that can be mounted by Ship by Sunday first and later reused in other hosts without depending on Next.js, a router, or a Convex Component install model.

The initiative is moving in the right direction when the widget UI, composer behavior, attachment affordances, and chat state orchestration live behind a clear package API; the Ship by Sunday web app consumes that package as the first production host; Convex realtime replaces visitor-side polling through an adapter; anonymous and signed-in thread access are explicit; and external setup requirements are documented where a future maintainer will look.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/active/2026-05-10-standalone-telegram-chat-widget/`.

The current support runtime research is recorded in `research-pass-current-support-runtime.md`. Convex realtime and auth research is recorded in `research-pass-convex-realtime-and-auth.md`. Package boundary research is recorded in `research-pass-package-boundaries-and-distribution.md`. The normalized architecture is recorded in `normalized-pass-standalone-widget-architecture.md`. Locked initiative decisions are in `converged-decision-packet.md`. Ordering is in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is in `cross-repo-review.md`. The first immutable implementation brief is `planning-brief-1.md`, and `current-planning-brief.txt` points at that brief.

## Current State

The current support system is implemented in the web app and Convex runtime. `apps/web/app/_components/support/` owns the React widget modules. `apps/web/app/api/support/_server/` owns the Next support-session bridge and HttpOnly cookie behavior. `apps/web/convex/support.ts`, `apps/web/convex/support/model.ts`, `apps/web/convex/support/telegram.ts`, and `apps/web/convex/http.ts` own support threads, messages, Telegram delivery, webhook ingestion, operator actions, retention, and recovery.

Recent support work landed the custom Telegram bridge, authenticated workspace entry, screenshot and bug-report UX, a ChatGPT-like visual polish pass, removal of the redundant `Replies stay in this thread` copy, and Enter-to-send behavior. The latest focused UI polish is committed as `31742e66 feat: polish support widget chat UI`.

The existing implementation still polls through the app support route for visitor transcript updates. Convex already supports realtime subscriptions through React hooks, and `apps/web/platform/convex/convex-client-provider.tsx` already wraps the web app with `ConvexProviderWithClerk`. The package extraction should use this existing host capability rather than introduce a manual WebSocket or a package-specific server.

This Program depends on the active Telegram Support Bot Program for the current backend behavior and provider setup truth. It should not re-litigate the customer-support bot architecture. Its job is to package and harden the widget boundary.

## Progress

- [x] 2026-05-10: Confirmed the product direction: create an owned standalone React package, not a Convex Component and not a Next.js feature extraction.
- [x] 2026-05-10: Researched current support runtime seams, Convex realtime behavior, package conventions, and extraction risks.
- [x] 2026-05-10: Created the initial Program packet and first planning brief for the package contract slice.
- [x] 2026-05-10: Locked v1 distribution as internal monorepo only.
- [x] 2026-05-10: Locked one-package subpath exports as the v1 distribution shape.
- [x] 2026-05-10: Locked an opinionated default-styled widget presentation model, using selected AI Elements primitives as the starting point where they strengthen the experience.
- [x] 2026-05-10: Locked source-owned adapted AI Elements primitives inside the package, with heavy branding and behavior modifications expected.
- [x] 2026-05-10: Locked shadcn-style CSS variable theming as the package styling contract.
- [x] 2026-05-10: Locked host-token inheritance as the default theme mode, mediated through package-scoped branded chat variables.
- [x] 2026-05-10: Locked a single typed client adapter object as the transport API shape.
- [x] 2026-05-10: Locked host-provided metadata-only analytics as the package analytics boundary.
- [x] 2026-05-10: Locked all-in-one `TelegramChatWidget` as the primary public component API.
- [x] 2026-05-10: Locked default fixed bottom-right placement with a small placement enum.
- [x] 2026-05-10: Locked strong default content with partial host overrides.
- [x] 2026-05-10: Locked Parker/Ship by Sunday-branded default content for internal v1.
- [x] 2026-05-10: Locked v1 upload scope to screenshot/image attachments only, while keeping the model ready for later diagnostics.
- [x] 2026-05-10: Locked one screenshot attachment per message in v1.
- [x] 2026-05-10: Locked bug reporting as an inline composer mode, not a separate wizard or modal.
- [x] 2026-05-10: Locked structured bug-report metadata plus a readable fallback body as the package payload shape.
- [x] 2026-05-10: Locked the first child ExecPlan scope as package scaffold and contracts only, with no widget UI migration yet.
- [x] 2026-05-10: Locked focused package contract tests as required from the scaffold slice.
- [x] 2026-05-10: Locked immediate root package gate wiring for the new package.
- [x] 2026-05-10: Locked package dependency policy: React peers, minimal runtime deps, no host framework dependencies.
- [x] 2026-05-10: Locked `./convex` as a reserved subpath in the scaffold slice, with no live Convex adapter implementation until the realtime slice.
- [x] 2026-05-11: Locked a working configurable fetch adapter into the scaffold slice, without switching `apps/web` to consume it yet.
- [x] 2026-05-11: Locked fetch adapter defaults to current support routes, with endpoint overrides.
- [ ] Create the first child ExecPlan from `planning-brief-1.md`.
- [ ] Land the package contract and scaffold.
- [ ] Migrate the Ship by Sunday support widget to consume the package without behavior regression.
- [ ] Add the Convex realtime adapter and remove visitor-side polling where the host provides Convex.
- [ ] Document standalone setup, auth/session tradeoffs, attachment limits, and verification.

## Decision Log

Decision: Build `packages/telegram-chat-widget` as an owned Ship by Sunday package.
Rationale: The product owner wants our package boundary and implementation style, not a Convex Component or a provider-owned ecosystem primitive.
Date: 2026-05-10

Decision: Keep the core package independent of Next.js and routing.
Rationale: The widget is a React runtime surface. Placement, routes, cookies, deployment, and provider configuration belong to the host app or adapter.
Date: 2026-05-10

Decision: Treat Convex as the first realtime backend adapter, not the package model.
Rationale: Convex realtime fits the current support backend and avoids manual WebSocket work, but the package should expose optional adapter entrypoints so the base widget does not force Convex on every consumer.
Date: 2026-05-10

Decision: Do not use Convex Component for this extraction.
Rationale: A Convex Component would make reuse easier only for Convex-native consumers while adding ecosystem coupling and setup shape that the product owner explicitly rejected.
Date: 2026-05-10

Decision: Ship package styles without requiring the host Tailwind configuration.
Rationale: A standalone widget should be visually complete when imported by a React host. Tailwind can remain an implementation detail in the current app until extraction, but the package API should converge on CSS variables, a CSS import, and narrow class hooks instead of host Tailwind dependencies.
Date: 2026-05-10

Decision: Preserve the existing fetch-backed bridge as the first migration path before introducing direct Convex realtime.
Rationale: Moving UI into the package first with the current transport limits risk. Realtime can then be added behind an adapter with focused validation instead of coupling extraction and auth changes in one slice.
Date: 2026-05-10

Decision: Design standalone direct-Convex anonymous access around a scoped high-entropy conversation capability, not the current long-lived HttpOnly session token.
Rationale: A direct browser-to-Convex package cannot read an HttpOnly cookie. If the standalone adapter needs browser-visible authority, it must be scoped, high-entropy, hash-stored, and limited to one conversation. The existing app can keep the HttpOnly bridge until the realtime token model is deliberately migrated.
Date: 2026-05-10

Decision: Treat v1 as an internal monorepo package.
Rationale: The package should solve the Ship by Sunday extraction first. It should still have clean internal exports and boundaries, but v1 should not add npm publishing, public-package documentation, versioning policy, or external compatibility guarantees.
Date: 2026-05-10

Decision: Use one internal package with subpath exports instead of separate adapter packages.
Rationale: One package keeps the customer-facing widget coherent, gives coding agents one obvious ownership root, avoids repetitive setup logic, and still keeps optional adapters isolated at import boundaries such as root, fetch, Convex, testing, and CSS subpaths. Separate packages would add coordination and dependency churn before the adapter surfaces are proven.
Date: 2026-05-10

Decision: Ship an opinionated default-styled widget, not a headless-first component kit.
Rationale: The support chat should wow customers by default, give coding agents one strong path, and keep developers out of repetitive host-specific UI assembly. Hosts can customize copy, fallback behavior, placement, theme variables, and narrow class hooks, but the package owns the complete polished chat experience.
Date: 2026-05-10

Decision: Use selected AI Elements primitives as the starting point for chat UI patterns.
Rationale: AI Elements already provides source-addable React primitives for conversation scrolling, prompt input, attachments, task progress, and stack trace display. Those primitives match the product direction, but they must be adapted into the package boundary instead of making the widget depend on host-local `@/components/ai-elements/*` paths.
Date: 2026-05-10

Decision: Bring selected AI Elements primitives into the package source and modify them heavily for Ship by Sunday.
Rationale: The package should own the branded support experience. AI Elements should act as a high-quality starting point for primitives, not as an app-local dependency or a visual constraint. This gives future agents one package root to edit and prevents host-local component paths from leaking into the package.
Date: 2026-05-10

Decision: Follow shadcn theming best practices for the package styling contract.
Rationale: shadcn recommends CSS variables and semantic theme tokens such as `background`, `foreground`, `primary`, `muted`, `border`, `input`, `ring`, and `radius`, with dark mode overriding the same tokens under `.dark`. The package should ship CSS that maps its branded widget variables to the host's shadcn tokens when present, with safe package fallbacks, instead of requiring host Tailwind utility generation.
Date: 2026-05-10

Decision: Inherit host theme tokens by default instead of forcing a separate widget theme.
Rationale: The widget should feel native to every host surface while still owning a polished support-chat identity. Package CSS should define `--sbs-chat-*` variables that default to host shadcn tokens such as `--background`, `--foreground`, `--popover`, `--primary`, `--muted`, `--border`, `--input`, `--ring`, and `--radius`, with branded fallbacks when those tokens are absent. Host-specific fixed light or dark styling should be done by overriding package variables, not by adding a widget theme provider in v1.
Date: 2026-05-10

Decision: Use a single typed client adapter object for transport.
Rationale: A client adapter gives the widget one coherent state machine for load, send, upload, subscribe, and failure behavior. It is clearer for coding agents than loose callback props, reduces brittle prop combinations for developers, and lets fetch and Convex implementations share the same customer-facing UI states.
Date: 2026-05-10

Decision: Keep analytics host-owned through a typed metadata-only event sink.
Rationale: The package should emit typed lifecycle and delivery metadata events, but it must not depend on PostHog or any host analytics SDK. This keeps transcript privacy enforceable, makes package tests simple, and lets `apps/web` adapt package events to `capturePostHogProductEvent` while preserving the existing no-message-body analytics rule.
Date: 2026-05-10

Decision: Make an all-in-one `TelegramChatWidget` the primary public component API.
Rationale: The current app already uses one `SupportWidget` that owns launcher, panel, open state, and fixed placement. Preserving that shape gives customers the polished full interaction by default, gives coding agents one obvious component to mount, and avoids repeated host-specific launcher and mobile positioning logic.
Date: 2026-05-10

Decision: Give `TelegramChatWidget` default fixed bottom-right placement with a small placement enum.
Rationale: The widget should work beautifully when mounted once. A small placement enum such as `bottom-right`, `bottom-left`, and `inline` covers the known host needs while avoiding brittle positioning config bags and repeated fixed/z-index/mobile inset logic.
Date: 2026-05-10

Decision: Ship strong default widget content and allow partial host overrides.
Rationale: The package should render polished launcher, empty-state, composer, attachment, bug-report, fallback, loading, delivery, error, and closed-state copy without forcing every host to pass a large string object. Hosts can override visible strings for identity and surface fit, but missing copy should never produce a half-built customer experience.
Date: 2026-05-10

Decision: Use Parker/Ship by Sunday-branded default content in v1.
Rationale: v1 is internal monorepo-only, so branded defaults produce the best first customer experience and avoid generic copy leaking into production. Host wrappers can override surface-specific strings such as homepage `Message Parker` versus workspace `Ask Parker`, and a future public package can revisit generic defaults without changing the content override model.
Date: 2026-05-10

Decision: Support screenshot/image uploads only in v1.
Rationale: Screenshots are the immediate customer-support win and keep the UI, storage, Telegram rendering, retention, and tests focused. The package model should be narrow for actual uploads in v1, using PNG, JPEG, and WebP with the existing size policy, while leaving room for later structured diagnostics such as stack traces or task state without implying arbitrary file upload.
Date: 2026-05-10

Decision: Allow one screenshot attachment per message in v1.
Rationale: The current backend and route bridge already model a single `attachment` per support message. Keeping v1 to one screenshot per message avoids array upload state, partial failure handling, ordering, and Telegram rendering complexity while covering the common support and bug-report flow.
Date: 2026-05-10

Decision: Keep bug reporting as an inline composer mode.
Rationale: The current widget already models `message` and `bug_report` modes inside one composer and one send path. Keeping that shape makes bug reporting fast and conversational for customers, gives coding agents one state machine to reason about, and avoids duplicated attachment, loading, delivery, and error handling that a separate wizard or modal would create.
Date: 2026-05-10

Decision: Represent bug reports as structured metadata plus a readable fallback body.
Rationale: Parker should still receive a clean human-readable support message in Telegram, but package and adapter code should not have to parse that text later. The package should produce typed bug-report fields for summary, steps, expected result, impact, page path, viewport, and user agent, alongside the rendered message body used by the current backend until structured backend fields are accepted.
Date: 2026-05-10

Decision: Keep the first child ExecPlan to package scaffold and contracts only.
Rationale: The first implementation slice should establish the package root, exports, types, CSS token contract, client adapter interface, event sink types, content defaults, attachment policy, and package validation without also moving runtime UI. This gives coding agents and developers a strong boundary before the more behavior-sensitive UI extraction slice.
Date: 2026-05-10

Decision: Require focused package tests in the scaffold slice.
Rationale: The package should be strong on day one. Pure contract tests for content merging, attachment policy, bug-report payload rendering, analytics event safety, and adapter fixture shape give coding agents executable examples and catch mistakes without brittle UI-rendering tests before the UI exists.
Date: 2026-05-10

Decision: Wire `packages/telegram-chat-widget` into root package validation gates immediately.
Rationale: Once the package exists, it is part of the product contract. Including it in `lint:packages`, `typecheck:packages`, and `test:packages` from the scaffold slice prevents drift, gives coding agents the standard commands, and avoids special-case validation instructions.
Date: 2026-05-10

Decision: Keep package runtime dependencies minimal.
Rationale: React and React DOM should be peer dependencies. `lucide-react` can be a normal dependency only if the package owns icon rendering. `clsx` can be a normal dependency only if needed for simple class composition. `tailwind-merge` should be avoided in v1 because package styling is CSS-variable/class based, not Tailwind utility composition. Next.js, Clerk, PostHog, and app-specific dependencies must not enter the package.
Date: 2026-05-10

Decision: Reserve the Convex adapter subpath in the scaffold slice without implementing realtime.
Rationale: The package should make the future `@shipbysunday/telegram-chat-widget/convex` import path obvious, but the first scaffold should not pull in Convex runtime behavior or ship a half-working realtime adapter. The live Convex implementation belongs in the later Convex Realtime Adapter slice after the package and fetch migration are stable.
Date: 2026-05-10

Decision: Include a working configurable fetch adapter in the scaffold slice.
Rationale: The fetch adapter proves the typed client contract against today's `/api/support/messages` and `/api/support/attachments` route shape before UI migration begins. Keeping `apps/web` on its existing local implementation until the UI extraction slice prevents behavior change while still giving future agents a tested bridge to the current backend.
Date: 2026-05-11

Decision: Default the fetch adapter to the current support route endpoints.
Rationale: v1 is internal monorepo-only, so the zero-config fetch adapter should work against the current Ship by Sunday support routes: `/api/support/messages` and `/api/support/attachments`. Endpoint overrides should still be supported for tests and future hosts.
Date: 2026-05-11

## Slice Ledger

No child ExecPlan exists yet. Child ExecPlans should carry `program_id: standalone-telegram-chat-widget` and `planning_brief: docs/programs/active/2026-05-10-standalone-telegram-chat-widget/planning-brief-<N>.md` in their frontmatter.

Planned slices:

- Package Contract And Scaffold: define the public API, exports, styling contract, peer dependencies, test harness, and first empty package.
- UI Extraction With Fetch Transport: move the current polished widget UI and hook orchestration into the package while preserving the existing Next route bridge.
- Ship By Sunday Consumer Migration: replace app-local support widget internals with package imports while keeping homepage and workspace placement in `apps/web`.
- Convex Realtime Adapter: add optional direct Convex subscriptions and mutations so host apps can stream updates without polling.
- Attachments And Bug Report Hardening: make screenshot upload, bug report metadata, file limits, and retention behavior package-aware and adapter-safe.
- Standalone Docs And Example: document install, CSS import, host adapter contracts, Convex env setup, Telegram setup, Clerk association, and verification.

## Next Slice

No child ExecPlan exists yet. The first recommended slice is `Package Contract And Scaffold`, created from `planning-brief-1.md`.

That slice should establish the package directory, public exports, types, styling strategy, test config, and host integration contract without moving runtime behavior yet. It must keep the package free of Next.js dependencies, avoid Convex Component APIs, keep Convex under an optional adapter subpath export, and update workspace/package validation so later implementation slices can build on a stable package shell. It should also create or reserve package-local primitive modules for selected AI Elements-inspired Conversation, Prompt Input, and Attachments primitives so later UI extraction does not create host-local component imports. Package CSS should follow shadcn's CSS-variable token model and map widget-specific variables to host tokens with branded fallbacks. Do not add a widget-specific theme provider in v1. Transport should be modeled as one typed client adapter object, with fetch and Convex implementations behind subpath exports. Analytics should be modeled as a host-provided typed event sink and must stay metadata-only. The primary React export should be an all-in-one `TelegramChatWidget` that owns launcher, panel, open state, and default fixed placement. Placement should be a narrow enum with bottom-right as the default, not a free-form positioning config bag. Content should have Parker/Ship by Sunday-branded package defaults with partial host overrides, not a required exhaustive copy object. Actual upload support should be screenshot/image-only in v1, with one screenshot per message. Bug reporting should remain an inline composer mode and should produce structured metadata plus a rendered body.

The first slice should not migrate the current widget UI out of `apps/web`. UI extraction starts only after this package contract exists and validates.

The first slice should include focused package tests for contract helpers and types. Typecheck alone is not enough for the scaffold because the package's defaults, merge behavior, attachment policy, and bug-report payload rendering are real behavior that future slices will depend on.

The first slice should add the new package to the root package validation scripts so `bun run lint:packages`, `bun run typecheck:packages`, and `bun run test:packages` include `packages/telegram-chat-widget` immediately.

The first slice should keep dependencies narrow: peer `react` and `react-dom`, optional normal dependency on `lucide-react` if icon components are used, optional normal dependency on `clsx` only if class composition needs it, and no `tailwind-merge`, Next.js, Clerk, PostHog, or app-local dependencies.

The first slice should reserve the `./convex` subpath only as a stable future boundary. It may export future-facing adapter types or a deliberate placeholder, but it must not implement live Convex `useQuery` or mutation behavior until the Convex Realtime Adapter child slice.

The first slice should include `createFetchTelegramChatClient` or equivalent under the `./fetch` subpath. It should default to `/api/support/messages` and `/api/support/attachments`, while accepting message endpoint, attachment endpoint, and optional `fetchImpl` overrides for tests and future hosts. `apps/web` should not consume this adapter until the later UI extraction slice.

The package should be internal monorepo-only in v1. The first slice should not add npm publishing workflows, public release automation, or external compatibility guarantees.

## Risks and Watchpoints

The largest risk is mixing three separate problems in one slice: packaging the UI, changing auth/session authority, and replacing polling with realtime. The migration should land those boundaries in order.

The current app's anonymous transcript authority is an HttpOnly support-session cookie. Direct Convex subscriptions from browser code cannot use that cookie directly. A future realtime adapter must either preserve a host server bridge for sensitive reads or introduce a scoped browser-visible conversation capability with clear limits.

Package styling can accidentally couple the widget to `apps/web` Tailwind classes. The reusable package should converge on a CSS import and variables so other React hosts can render the widget without copying the app Tailwind setup.

Convex subscriptions should use the official Convex React client behavior. Do not create a manual WebSocket layer for this feature unless a later researched blocker proves Convex subscriptions cannot satisfy the product requirement.

The existing Telegram Support Bot Program still owns backend provider setup, production bot decisions, operator action semantics, and retention policy. This Program should reference that truth instead of duplicating or drifting it.

There is unrelated dirty billing/release work in the local checkout. Program and package commits should stage only files belonging to this initiative unless the product owner explicitly asks for a broader commit.

## Outcomes & Retrospective

This Program is active. The expected outcome is a first-party standalone chat widget package that Ship by Sunday consumes in production, with a polished ChatGPT-like UX built from package-owned, heavily branded AI Elements-inspired primitives, screenshot and bug-report support, optional Convex realtime, host-owned auth/session integration, documented setup, and no hard dependency on Next.js or Convex Component packaging.

The retrospective should be filled after the package is consumed by `apps/web`, polling is removed where realtime is available, docs and examples are complete, and validation proves both the package and host integration.

## Validation and Acceptance

The Program can move to completed only when `packages/telegram-chat-widget` exists, the package passes its own lint/typecheck/test gates, `apps/web` consumes the package through stable exports, support widget browser proof covers desktop and mobile, Convex realtime is proven where enabled, screenshot and bug-report behavior still works, and setup docs describe every required Telegram, Convex, Clerk, env, and host-app value.

Each runtime slice should run the narrowest package and app tests for the touched behavior, then broaden to `bun run format`, `bun lint`, and `bun typecheck` before completion when code changes are involved. Program-only doc slices should run `bun run programs:lint` and markdown validation when available.

## Artifacts and Notes

Research anchors:

- Convex realtime docs: `https://docs.convex.dev/realtime`
- Convex React client docs: `https://docs.convex.dev/client/react`
- Convex auth in functions: `https://docs.convex.dev/auth/functions-auth`
- AI Elements introduction: `https://elements.ai-sdk.dev/docs`
- AI Elements Attachments: `https://elements.ai-sdk.dev/components/attachments`
- AI Elements Conversation: `https://elements.ai-sdk.dev/components/conversation`
- AI Elements Prompt Input: `https://elements.ai-sdk.dev/components/prompt-input`
- AI Elements Task: `https://elements.ai-sdk.dev/components/task`
- AI Elements Stack Trace: `https://elements.ai-sdk.dev/components/stack-trace`
- shadcn theming docs: `https://ui.shadcn.com/docs/theming`
- Current Telegram Support Bot Program: `docs/programs/active/2026-05-06-telegram-support-bot/program.md`

Current code anchors:

- Widget UI: `apps/web/app/_components/support/support-widget-panel.tsx`
- Widget orchestration: `apps/web/app/_components/support/use-support-chat.ts`
- Support API client: `apps/web/app/_components/support/support-api-client.ts`
- Next support bridge: `apps/web/app/api/support/_server/support-message-route.ts`
- Support session cookie: `apps/web/app/api/support/_server/support-session-cookie.ts`
- Convex public support API: `apps/web/convex/support.ts`
- Convex support model: `apps/web/convex/support/model.ts`
- Telegram webhook: `apps/web/convex/http.ts`

## Interfaces and Dependencies

The package depends on the repo workspace convention for packages under `packages/*`, Bun scripts, `packages/tsconfig.base.json`, and app package consumption through `workspace:*`.

The Ship by Sunday host app depends on Convex through `apps/web/platform/convex/convex-client-provider.tsx` and Clerk through the existing Convex provider integration.

The package should expose a React-facing interface that can run with a fetch transport first and a Convex transport later. The primary React interface should be an all-in-one `TelegramChatWidget`; lower-level panel or primitive exports should stay private or testing-only until a real host need appears. Transport should be represented by one typed client adapter object, not a loose bag of callbacks. In v1, those surfaces should live in one package with subpath exports rather than separate packages. Host apps own fallback links, analytics event sinks, auth context, provider env, provider deployment, and any copy overrides needed for their surface. The package owns Parker/Ship by Sunday-branded defaults. The styling interface should be a package CSS file that follows shadcn semantic token conventions, inherits from the host's token values by default, and allows host overrides through `--sbs-chat-*` variables. Placement should default to fixed bottom-right with narrow alternatives such as bottom-left and inline.

The backend behavior depends on the Telegram Support Bot Program until and unless backend helper code is deliberately extracted into this package or a sibling package.
