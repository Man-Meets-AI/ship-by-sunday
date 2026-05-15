---
title: "T3 Code Telegram Widget Planning Brief 11"
program_id: "t3-code-source-design-system-port"
brief_version: 11
status: "current"
summary: "Next slice for migrating the standalone Telegram support widget package to the T3 Code visual system after auth and checkout edge surfaces."
read_when:
  - "Writing the next Telegram widget child ExecPlan after auth and checkout edge-surface migration."
  - "Changing packages/telegram-chat-widget visuals, package CSS, launcher, panel, composer, messages, or host integration during the T3 Code migration."
---

# T3 Code Telegram Widget Planning Brief 11

## Slice

Telegram widget visual migration: update the standalone `packages/telegram-chat-widget` package so its launcher, panel, messages, composer, attachment controls, bug-report mode, and error states match the T3 Code visual system in light and dark mode.

## Desired Outcome

The first-party support widget should no longer appear as a hardcoded dark overlay beside the migrated app. It should inherit Ship by Sunday and host app tokens where available, use the same DM Sans/T3 Code density, compact panel rhythm, subdued borders, blue primary accent, focus rings, and light/dark semantic colors as the current app. The widget should still remain package-owned and embeddable: hosts import `@shipbysunday/telegram-chat-widget/styles.css`, pass the existing client/content props, and get the same support behavior without provider or API changes.

This slice should make the support widget feel native on the migrated homepage, docs, protected app, and checkout-adjacent surfaces without changing Telegram transport, support session cookies, Convex realtime capability tokens, screenshot privacy policy, bug-report payload shape, analytics event schema, attachment limits, or host route contracts.

## Scope

In scope:

- audit `packages/telegram-chat-widget/src/styles/telegram-chat-widget.css` and React components under `packages/telegram-chat-widget/src/react` for hardcoded old dark colors, oversized panel geometry, old launcher styling, and token gaps
- migrate the package CSS to T3 Code-compatible CSS variables with explicit light and dark fallbacks
- preserve host override support through existing `--sbs-chat-*` variables and app semantic tokens such as `--background`, `--foreground`, `--card`, `--border`, `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--destructive`, and `--ring`
- keep `TelegramChatWidget`, `mergeTelegramChatContent`, `createFetchTelegramChatClient`, `useConvexTelegramChatRealtime`, package exports, screenshot policy, privacy constants, bug-report mode, optimistic messages, realtime behavior, and analytics helpers unchanged unless a visual test forces a tiny markup hook
- add or update package tests that prove public API stability, privacy-safe bug-report rendering, CSS token presence, and absence of old hardcoded dark-only shell values where practical
- run package lint, format check, typecheck, tests, and browser or app-host proof for the widget in light and dark mode
- update the Program ledger and a completed child ExecPlan

Out of scope:

- changing support API routes under `apps/web/src/app/api/support`
- changing Telegram bot, Convex support schema/functions, support session cookies, realtime capability issuance, PostHog event names, screenshot upload routes, or provider setup
- generated-codebase compiler, starter template output, generated customer docs, or `docs/generated`
- broad app support-widget product changes, new support channels, new attachment types, or copy rewrites beyond visual-state clarity
- dependency changes unless the package cannot meet the visual contract with existing CSS and React primitives

## Inputs

- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/exec-plans/completed/2026-05-15-t3-code-auth-checkout-edge-surfaces.md`
- `packages/telegram-chat-widget/README.md`
- `packages/telegram-chat-widget/package.json`
- `packages/telegram-chat-widget/src/styles/telegram-chat-widget.css`
- `packages/telegram-chat-widget/src/react/telegram-chat-widget.tsx`
- `packages/telegram-chat-widget/src/react/telegram-chat-launcher.tsx`
- `packages/telegram-chat-widget/src/react/telegram-chat-panel.tsx`
- `packages/telegram-chat-widget/src/react/telegram-chat-composer.tsx`
- `packages/telegram-chat-widget/src/react/telegram-chat-messages.tsx`
- `packages/telegram-chat-widget/tests`
- `apps/web/src/app/_components/support/support-widget.tsx`
- `apps/web/src/app/_components/home-page/support/home-page-support-widget.tsx`

## Acceptance

- The child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- The package keeps all current public exports, props, support route defaults, privacy constants, event helpers, bug-report payload behavior, and attachment limits.
- The widget CSS uses T3 Code-compatible token fallbacks for light and dark mode and no longer hardcodes the old dark-only launcher and panel as the only supported presentation.
- Existing package tests pass, with focused additions for CSS token contract or visual-class stability when useful.
- Browser proof verifies the widget hosted inside the app in light and dark mode, including launcher closed state, panel open state, composer, at least one assistant/visitor message state or empty intro, and mobile viewport behavior.
- `bun run --cwd packages/telegram-chat-widget lint`, `bun run --cwd packages/telegram-chat-widget format:check`, `bun run --cwd packages/telegram-chat-widget typecheck`, `bun run --cwd packages/telegram-chat-widget test`, relevant app-host checks, Program/plan lint, markdown lint, repo lint/typecheck, and `git diff --check` pass or exact blockers are recorded.

## Watchpoints

- The widget is a standalone package. Do not assume app-only Tailwind classes or shadcn primitives are available inside the package CSS.
- Preserve host theming. The package should work when embedded by `apps/web`, but it should not become coupled to one route or one app wrapper.
- Support transcript and screenshot data are privacy-sensitive. Do not add tests, logs, CSS content, analytics, or visual proof artifacts that expose private message text, raw tokens, screenshot URLs, email addresses, or Telegram ids.
- Browser proof should use synthetic or empty support states. Do not send live Telegram messages or upload real screenshots just to prove styling.
- Do not start generated-codebase migration in this slice. Generated output should wait until the current app and standalone widget visual contracts are stable.
