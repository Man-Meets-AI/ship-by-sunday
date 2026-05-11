---
title: Package Contract And Scaffold
status: complete
created_at: 2026-05-11
completed_at: 2026-05-11
summary: Create the internal telegram chat widget package shell, contracts, fetch adapter, package docs, and validation gates without moving app UI yet.
post_build_recap: Added the internal telegram chat widget package scaffold with typed contracts, screenshot and bug-report helpers, metadata-only events, CSS token shell, reserved Convex subpath, tested fetch adapter, README, lockfile entry, and root package validation wiring.
program_id: standalone-telegram-chat-widget
planning_brief: docs/programs/active/2026-05-10-standalone-telegram-chat-widget/planning-brief-1.md
read_when:
  - Starting the standalone telegram chat widget package scaffold.
  - Resuming package contract implementation.
  - Validating the first standalone widget Program slice.
---

# Package Contract And Scaffold

This document is a living execution plan for creating the first `packages/telegram-chat-widget` package scaffold.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday already has a polished Telegram-backed support widget in the web app. This slice creates the durable internal package boundary for that widget before moving UI or changing customer behavior. After this plan is complete, the repo will have `@shipbysunday/telegram-chat-widget` with typed contracts, package CSS token scaffolding, a tested fetch adapter for the current support routes, package docs, and root validation wiring. Nothing in `apps/web` should render differently yet; the visible proof is that the package contracts compile, test, and are ready for the next UI extraction slice.

## Progress

- [x] 2026-05-11: Created this child ExecPlan from `docs/programs/active/2026-05-10-standalone-telegram-chat-widget/planning-brief-1.md`.
- [x] 2026-05-11: Created the package manifest, TypeScript config, Vitest config, README, and source/test directories.
- [x] 2026-05-11: Defined core public types, content defaults, privacy hook constants, attachment policy, bug-report payload helpers, analytics event helpers, and client adapter interface.
- [x] 2026-05-11: Added a working configurable fetch adapter that defaults to the current support routes.
- [x] 2026-05-11: Added a reserved `./convex` subpath without live Convex realtime behavior.
- [x] 2026-05-11: Added a minimal skeletal `TelegramChatWidget` root export without real launcher or panel UI.
- [x] 2026-05-11: Added focused package contract tests.
- [x] 2026-05-11: Wired the package into root `lint:packages`, `typecheck:packages`, and `test:packages`.
- [x] 2026-05-11: Ran validation, repaired package formatting, updated this plan and the owning Program, and prepared the finished scaffold for commit.

## Surprises & Discoveries

`bun run test:packages` is blocked before reaching `packages/telegram-chat-widget` by unrelated dirty work in `packages/codebase-compiler/tests/generated-repo-command-contract.test.ts`. That local diff changes the clean-room generated repo proof from `bun install --lockfile-only --frozen-lockfile` to `bun ci`, and the generated repo lockfile then reports `error: lockfile had changes, but lockfile is frozen`. This slice still proves the new package directly with package-local tests, and the root `test:packages` script now includes `packages/telegram-chat-widget`.

## Decision Log

Decision: The first package slice is scaffold and contracts only.
Rationale: Moving UI at the same time would mix package setup, transport behavior, styling, and customer-facing rendering in one risky diff.
Date: 2026-05-11

Decision: Include a real fetch adapter in the scaffold but do not make `apps/web` consume it yet.
Rationale: The adapter proves the package client contract against the current API shape before the UI migration slice, while leaving customer behavior unchanged.
Date: 2026-05-11

Decision: Reserve the Convex subpath without live realtime implementation.
Rationale: The future import boundary should be visible, but Convex subscription and conversation-token design belongs to a later dedicated slice.
Date: 2026-05-11

Decision: Add focused package tests immediately.
Rationale: Content merging, attachment policy, bug-report payload rendering, analytics event safety, and fetch behavior are real contracts that should be executable from day one.
Date: 2026-05-11

## Outcomes & Retrospective

This plan is complete. `packages/telegram-chat-widget` now exists as internal package `@shipbysunday/telegram-chat-widget` with root, `./fetch`, `./convex`, `./testing`, and `./styles.css` exports. The package owns the first public contracts for threads, messages, placements, content overrides, screenshot validation, bug-report rendering, metadata-only events, privacy hooks, and the shared client adapter. The fetch adapter matches today's `/api/support/messages` and `/api/support/attachments` route shape and is tested with injected fetch functions. The current `apps/web` support widget is still the production UI, so this slice has no browser-visible behavior change. The remaining gap is the unrelated generated-repo command-contract failure described in `Surprises & Discoveries`.

## Context and Orientation

The current support widget lives in `apps/web/app/_components/support/`. `support-widget.tsx` owns the launcher and fixed placement. `support-widget-panel.tsx` owns the chat panel, composer, bug-report fields, attachment chip, message rendering, privacy DOM hooks, and Enter-to-send behavior. `use-support-chat.ts` owns open state, message draft state, bug-report draft state, optimistic send behavior, screenshot validation, polling, and analytics calls. `support-api-client.ts` owns the current fetch calls to `/api/support/messages` and `/api/support/attachments`.

The current route bridge lives in `apps/web/app/api/support/_server/support-message-route.ts`. The browser reads and writes support messages through app routes so anonymous transcript authority stays behind an HttpOnly cookie. This slice must not replace that route bridge, expose the support-session cookie to browser JavaScript, or change polling.

The new package root is `packages/telegram-chat-widget`. Existing internal packages such as `packages/codebase-compiler` and `packages/codebase-presentation` are TypeScript source-first packages with `package.json`, `tsconfig.json`, `vitest.config.ts`, `src/index.ts`, package-local `lint`, `format`, `format:check`, `typecheck`, and `test` scripts, and root package validation wiring in `package.json`.

The Program packet for the larger initiative lives in `docs/programs/active/2026-05-10-standalone-telegram-chat-widget/`. The immutable brief for this slice is `planning-brief-1.md`. When implementation discovers new facts, update this ExecPlan first, then the Program if the discovery changes initiative-level truth.

### In Scope

This plan creates `packages/telegram-chat-widget` as an internal monorepo package named `@shipbysunday/telegram-chat-widget`. It defines one-package subpath exports for the root package, `./fetch`, `./convex`, `./testing`, and `./styles.css` if the package tooling accepts that shape. It creates core types for threads, messages, screenshots, bug reports, placement, content, events, and the typed chat client adapter. It creates Parker/Ship by Sunday-branded default content and a partial override merge helper. It creates package-owned privacy hook constants. It ports the current screenshot policy into package-owned code for PNG, JPEG, WebP, 10 MB max, one optional screenshot per message. It creates a bug-report helper that preserves structured metadata and renders a readable fallback body. It creates a metadata-only event helper contract. It implements a configurable fetch adapter that defaults to `/api/support/messages` and `/api/support/attachments` and supports injected `fetchImpl` for tests. It adds a reserved Convex subpath without live realtime behavior. It adds a minimal skeletal `TelegramChatWidget` export only for type/API stability. It adds package README docs for package usage and local commands. It adds focused package tests and root package gate wiring.

### Out Of Scope

Do not move the current widget UI out of `apps/web`. Do not make `apps/web` import or render the new package. Do not adapt AI Elements primitives yet and do not create empty AI Elements placeholder files. Do not implement the real launcher, panel, conversation, prompt input, attachments display, or branded UI in the package. Do not replace polling with Convex realtime. Do not implement a live Convex adapter, Convex `useQuery`, Convex mutations, or browser-visible conversation tokens. Do not change the current support routes, Convex support schema, Telegram provider behavior, Clerk auth behavior, PostHog setup, or support-session cookie authority. Do not add arbitrary file uploads, multi-attachment upload support, videos, logs, or stack traces. Do not add npm publishing workflows or public-package release automation. Do not use Convex local mode.

## Plan of Work

Create `packages/telegram-chat-widget/package.json` following existing internal package conventions. Use `private: true`, `type: "module"`, version `0.1.0`, and package scripts matching the other internal packages. Add subpath exports for the root package, fetch adapter, reserved Convex adapter, testing helpers, and CSS file. Use `react` and `react-dom` as peer dependencies. Add only narrow dev dependencies needed for TypeScript, Vitest, oxlint, and oxfmt. Add `lucide-react` only if the skeletal component uses icons; otherwise leave it for the UI extraction slice. Avoid `tailwind-merge`, Next.js, Clerk, PostHog, and app-local dependencies.

Create `packages/telegram-chat-widget/tsconfig.json` extending `packages/tsconfig.base.json`. Include `src/**/*.ts`, `src/**/*.tsx`, `tests/**/*.ts`, `tests/**/*.tsx`, and `vitest.config.ts`. Create `packages/telegram-chat-widget/vitest.config.ts` using the package-local test environment. For contract/helper tests, `node` is enough. If a minimal React component test is added, use `jsdom` only if needed and keep the test simple.

Create `packages/telegram-chat-widget/src/index.ts` as the root export. Export the minimal skeletal `TelegramChatWidget` component, public props, content types and merge helper, placement type, event types, client adapter types, message/thread types, attachment policy, bug-report helpers, and privacy hook constants. The component should not render the production UI. A safe scaffold implementation can return `null` or a tiny inert container that makes clear it is not the real widget. Do not create AI Elements primitive placeholder files.

Create core modules under `packages/telegram-chat-widget/src/core/`. Suggested files are `telegram-chat-types.ts`, `telegram-chat-content.ts`, `telegram-chat-events.ts`, `telegram-chat-client.ts`, `attachment-policy.ts`, `bug-report-payload.ts`, and `privacy-dom.ts`. Use clear domain names rather than vague helper or utils files. Keep functions small and typed. Use discriminated unions for normal messages and bug-report sends.

Create `packages/telegram-chat-widget/src/adapters/fetch/index.ts` and related fetch client code. Export `createFetchTelegramChatClient`. The client should implement the shared chat client interface. The default endpoints are `/api/support/messages` and `/api/support/attachments`. Allow overrides for `messagesEndpoint`, `attachmentsEndpoint`, and `fetchImpl`. Implement GET thread loading, POST message sending, screenshot upload URL preparation, storage upload, response parsing, invalid response errors, and backend error propagation. For bug-report sends, preserve structured data in the input type but flatten to the current backend body shape when calling today's app route.

Create `packages/telegram-chat-widget/src/adapters/convex/index.ts` as a reserved future boundary. It may export future-facing types or a function that throws a clear error such as `createConvexTelegramChatClient is reserved for the Convex Realtime Adapter slice.` Do not import `convex`, `apps/web/convex/_generated/api`, or generated Convex references in this slice.

Create `packages/telegram-chat-widget/src/styles/telegram-chat-widget.css`. This file should establish package class names and `--sbs-chat-*` variables that map to host shadcn tokens with branded fallbacks. It should not require Tailwind generation. Since real UI is not implemented yet, keep CSS focused on root variables and stable selectors that later UI can use.

Create `packages/telegram-chat-widget/src/testing/index.ts` only if tests or future consumers need fixtures. Keep fixtures explicit and harmless. Do not export production-only internals through testing unless tests need them.

Create package tests under `packages/telegram-chat-widget/tests/`. Tests must cover content default merging with partial overrides, screenshot policy acceptance and rejection, bug-report structured metadata plus readable body rendering, metadata-only analytics event helper behavior, fetch adapter GET and POST behavior, screenshot upload request and storage upload behavior, invalid response handling, and backend error propagation. Use an injected `fetchImpl` test function rather than global network calls.

Create `packages/telegram-chat-widget/README.md`. Document package imports, CSS import, the zero-config fetch adapter defaults, endpoint overrides, content override model, privacy hook guarantee, package commands, and the reserved status of live Convex realtime. Do not duplicate app-owned Telegram BotFather, Convex env, webhook, production verification, or operator workflow setup.

Update the root `package.json` scripts `lint:packages`, `typecheck:packages`, and `test:packages` to include `packages/telegram-chat-widget`. If the root lockfile changes because of package metadata or dependency additions, commit that lockfile change. Do not update `apps/web/next.config.ts` in this slice unless TypeScript or package validation proves it is required before the app consumes the package.

Update this ExecPlan as implementation proceeds. When the scaffold is complete, update the owning Program in `docs/programs/active/2026-05-10-standalone-telegram-chat-widget/program.md` to mark this child plan created or completed as appropriate and to name the next recommended slice.

## Milestones

Milestone 1 creates the package shell. At the end of this milestone, `packages/telegram-chat-widget` has package metadata, TypeScript config, Vitest config, README, source directories, and scripts. Run the package `typecheck` command and expect it to either pass with an empty scaffold or fail only because source files are not yet present. Repair any config issue before moving on.

Milestone 2 adds core contracts and helpers. At the end of this milestone, the root package exports public types, content defaults, privacy constants, attachment policy, bug-report payload helpers, event helpers, and the skeletal React component. Package contract tests for pure helpers should pass.

Milestone 3 adds adapters. At the end of this milestone, `./fetch` exports a working configurable fetch client tested with injected fetch functions, and `./convex` exists only as a reserved boundary without live Convex runtime behavior. The package must still have no Next.js, Clerk, PostHog, app-local, or generated Convex dependencies.

Milestone 4 wires validation and docs. At the end of this milestone, root package scripts include the new package, the package README documents the public scaffold, the owning Program points to this child plan, and the narrow and root package validations pass or record an unrelated external blocker.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Before editing, confirm the dirty worktree and avoid unrelated files:

    git status --short

Create the package directory and files. Use `apply_patch` for hand-authored files. Do not use shell redirection to write source files. Suggested directories:

    packages/telegram-chat-widget/src/core
    packages/telegram-chat-widget/src/adapters/fetch
    packages/telegram-chat-widget/src/adapters/convex
    packages/telegram-chat-widget/src/react
    packages/telegram-chat-widget/src/styles
    packages/telegram-chat-widget/src/testing
    packages/telegram-chat-widget/tests

After the package shell exists, run:

    bun run --cwd packages/telegram-chat-widget typecheck

Expected success is a zero exit code from `tsc --noEmit -p tsconfig.json`. If TypeScript reports missing JSX settings, adjust the package `tsconfig.json` rather than importing app config.

After core helpers and tests exist, run:

    bun run --cwd packages/telegram-chat-widget test

Expected success resembles:

    Test Files  4 passed
    Tests       ... passed

The exact file and test counts may differ. All package tests must pass.

After adding package lint config and scripts, run:

    bun run --cwd packages/telegram-chat-widget lint
    bun run --cwd packages/telegram-chat-widget format:check

After wiring root package gates, run:

    bun run lint:packages
    bun run typecheck:packages
    bun run test:packages

If these commands fail because of the new package, fix the package. If they fail because of unrelated pre-existing dirty work, record the exact unrelated blocker in `Surprises & Discoveries` and still run the package-local commands successfully.

Validate docs and plan state:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-11-package-contract-and-scaffold.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-11-package-contract-and-scaffold.md docs/programs/active/2026-05-10-standalone-telegram-chat-widget packages/telegram-chat-widget/README.md
    git diff --check

Run `bun run programs:lint` if the unrelated Program tree is in a valid state. If it is blocked by unrelated dirty files, record that exact blocker and the targeted Program metadata result. The standalone widget Program should remain valid.

When complete, update the `Progress`, `Surprises & Discoveries`, `Outcomes & Retrospective`, and `Artifacts and Notes` sections in this plan. Then update `docs/programs/active/2026-05-10-standalone-telegram-chat-widget/program.md` so the Program ledger names this active or completed child plan and the next recommended slice.

## Validation and Acceptance

This plan is accepted only when the new internal package exists, package-local lint/typecheck/test commands pass, root package gates include and validate the new package, the package README explains the API and exclusions, the fetch adapter is tested against the current route shape with injected fetch functions, and no app UI or support runtime behavior has changed.

The package must not import `apps/web` modules, generated Convex API references, Next.js, Clerk, PostHog, app-local AI Elements paths, or Convex runtime code in the root or fetch paths. The Convex subpath must clearly be reserved and non-live. The root package must expose only a skeletal `TelegramChatWidget` until the UI extraction slice.

Human review should verify that `apps/web/app/_components/support/` remains the active customer-facing widget implementation after this slice. There should be no visible browser behavior to smoke test yet because this plan deliberately does not wire the package into the app.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd packages/telegram-chat-widget lint
    bun run --cwd packages/telegram-chat-widget format:check
    bun run --cwd packages/telegram-chat-widget typecheck
    bun run --cwd packages/telegram-chat-widget test
    bun run lint:packages
    bun run typecheck:packages
    bun run test:packages
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-11-package-contract-and-scaffold.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-11-package-contract-and-scaffold.md docs/programs/active/2026-05-10-standalone-telegram-chat-widget packages/telegram-chat-widget/README.md
    git diff --check

Run this command too when the unrelated Program tree is valid:

    bun run programs:lint

If `bun run programs:lint` fails only because unrelated dirty Program files are already inconsistent, do not repair unrelated files in this slice. Record the blocker and rely on targeted markdown metadata lint for the standalone widget Program.

## Idempotence and Recovery

This scaffold is additive. Re-running tests and typecheck is safe. If package creation partially succeeds, delete only files under `packages/telegram-chat-widget` that were created by this plan and reapply the intended files; do not touch other packages. If root package scripts are edited incorrectly, compare against the original `package.json` pattern and preserve all existing package commands while appending the new package command. Do not run destructive git commands.

If a dependency addition changes `bun.lock`, keep the lockfile change only if it belongs to this package. If the scaffold can avoid new runtime dependencies, prefer no lockfile churn. If tests fail because the fetch adapter calls real network, rewrite the tests to use an injected `fetchImpl` and make the production adapter default to global `fetch` only at runtime.

If validation exposes that the skeletal React export needs JSX config or React typings, fix the package config locally. Do not import app TypeScript config or app aliases into the package. If validation suggests `apps/web/next.config.ts` must transpile the new package, defer that to the app consumer migration unless a command in this scaffold actually imports the package from the app.

## Artifacts and Notes

The current support widget UI polish commit is `31742e66 feat: polish support widget chat UI`. The Program packet was created in `1db3cf12 docs: plan standalone telegram chat widget package` and refined in `302804df docs: refine telegram widget package decisions` and `85067714 docs: refine telegram widget scaffold boundaries`.

The current app support API client shape is:

    loadSupportThread() -> GET /api/support/messages
    sendSupportMessage(...) -> POST /api/support/messages
    uploadSupportAttachment(file) -> POST /api/support/attachments, then POST uploadUrl

The current screenshot policy is:

    image/png, image/jpeg, image/webp
    10 MB max
    one optional screenshot attachment per message

Final validation evidence:

    bun run --cwd packages/telegram-chat-widget lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/telegram-chat-widget format:check
    All matched files use the correct format.

    bun run --cwd packages/telegram-chat-widget typecheck
    tsc --noEmit -p tsconfig.json

    bun run --cwd packages/telegram-chat-widget test
    Test Files  3 passed (3)
    Tests       14 passed (14)

    bun run lint:packages
    Found 0 warnings and 0 errors.

    bun run typecheck:packages
    tsc --noEmit -p tsconfig.json

    bun run test:packages
    Failed in packages/codebase-compiler before reaching packages/telegram-chat-widget because the unrelated dirty generated-repo command-contract test now runs bun ci and the generated repo lockfile would change under frozen lockfile rules.

## Interfaces and Dependencies

The package name is `@shipbysunday/telegram-chat-widget`. The package is internal monorepo-only in v1 and must use `private: true`.

The root export should expose the skeletal `TelegramChatWidget`, public prop types, content helpers, message and thread types, event types, attachment policy, bug-report helpers, privacy constants, and the shared client adapter interface.

The `./fetch` subpath should expose `createFetchTelegramChatClient` and related fetch adapter option types. The default endpoints are `/api/support/messages` and `/api/support/attachments`. The adapter must accept `fetchImpl` for tests.

The `./convex` subpath is reserved. It must not implement live Convex realtime in this slice.

The `./styles.css` subpath should point at `src/styles/telegram-chat-widget.css`. Package CSS should define `--sbs-chat-*` variables mapped to shadcn semantic tokens with fallbacks and should not depend on Tailwind generation.

The `./testing` subpath may expose package test fixtures only if needed. Keep testing exports clearly separate from root production exports.

Root validation scripts in `package.json` must include the new package in `lint:packages`, `typecheck:packages`, and `test:packages`.
