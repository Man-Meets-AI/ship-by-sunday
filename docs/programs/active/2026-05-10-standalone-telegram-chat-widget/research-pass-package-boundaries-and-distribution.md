---
title: "Standalone Telegram Chat Widget Package Boundaries And Distribution Research"
summary: "Research pass for package conventions, peer dependencies, exports, styling, and app consumption."
docType: "research_pass"
status: "active"
read_when:
  - "Creating packages/telegram-chat-widget."
  - "Changing package exports, peer dependencies, test scripts, or app consumption."
---

# Standalone Telegram Chat Widget Package Boundaries And Distribution Research

This research pass records the package conventions and distribution boundaries for `packages/telegram-chat-widget`.

## Workspace Package Facts

Existing workspace packages live under `packages/*`. Package names use the `@shipbysunday/*` scope, for example `@shipbysunday/codebase-compiler` and `@shipbysunday/codebase-presentation`.

The new package should use `@shipbysunday/telegram-chat-widget`.

Existing packages are source-first TypeScript packages. They expose `src/index.ts`, use local package scripts for lint, format, typecheck, and tests, and extend shared TypeScript config from `packages/tsconfig.base.json`.

`apps/web` consumes internal packages through `workspace:*`. Next.js may need `apps/web/next.config.ts` `transpilePackages` updates when consuming a new TypeScript package.

## Recommended Package Shape

Initial package:

```txt
packages/telegram-chat-widget/
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    index.ts
    react/
      telegram-chat-widget.tsx
      telegram-chat-panel.tsx
      use-telegram-chat.ts
    core/
      telegram-chat-types.ts
      attachment-policy.ts
      conversation-state.ts
    adapters/
      fetch/
        index.ts
        fetch-telegram-chat-client.ts
      convex/
        index.ts
        convex-telegram-chat-client.ts
    styles/
      telegram-chat-widget.css
    testing/
      index.ts
```

The exact file names can change during implementation if the package conventions suggest a better local pattern, but the boundary should remain: core types and state logic, React components, optional adapters, package CSS, and test helpers.

## Public Exports

The root export should include the default React widget, core types, and the fetch transport helpers needed by `apps/web`.

Convex-specific code should be behind a separate entrypoint, such as:

- `@shipbysunday/telegram-chat-widget`
- `@shipbysunday/telegram-chat-widget/fetch`
- `@shipbysunday/telegram-chat-widget/convex`
- `@shipbysunday/telegram-chat-widget/styles.css`
- `@shipbysunday/telegram-chat-widget/testing`

This keeps the base React package usable without forcing Convex dependencies on every consumer.

## Dependencies

React and React DOM should be peer dependencies. If the package keeps lucide icons, `lucide-react` can be a dependency or peer dependency based on existing repo practice. Convex should be optional and isolated to the Convex adapter entrypoint.

The package should not depend on Next.js. It should not import app routes, app content, Clerk-specific hooks, or generated Convex API references from `apps/web`.

## Styling

The current app UI uses Tailwind classes. That is not a good standalone package contract.

The reusable package should ship styles through a CSS file and CSS variables. The host should import the CSS once and may override variables or pass a small set of class hooks. The package can keep a headless or lightly controlled internal state API, but v1 should ship a complete default styled widget because the product goal is a polished support experience, not only primitives.

## Tests And Validation

The package should have focused tests for:

- opening and closing the widget
- empty transcript intro
- Enter-to-send and Shift+Enter newline
- disabled and closed composer states
- attachment file policy
- bug-report mode validation handoff
- optimistic message state
- adapter error state mapping

`apps/web` should retain integration-ui tests proving homepage and workspace launchers still mount and send through the host bridge.

The first package slice should update workspace-level package validation scripts if needed so future package work is covered by repo gates.
