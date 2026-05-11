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

Convex-specific code should be behind a separate entrypoint inside the same package, such as:

- `@shipbysunday/telegram-chat-widget`
- `@shipbysunday/telegram-chat-widget/fetch`
- `@shipbysunday/telegram-chat-widget/convex`
- `@shipbysunday/telegram-chat-widget/styles.css`
- `@shipbysunday/telegram-chat-widget/testing`

This keeps the base React package usable without forcing Convex dependencies on every consumer. It also gives coding agents one clear ownership root and avoids repetitive package boilerplate while the adapter surfaces are still young.

## Dependencies

React and React DOM should be peer dependencies. If the package keeps lucide icons, `lucide-react` can be a dependency or peer dependency based on existing repo practice. Convex should be optional and isolated to the Convex adapter entrypoint.

The package should not depend on Next.js. It should not import app routes, app content, Clerk-specific hooks, or generated Convex API references from `apps/web`.

For v1, prefer the narrowest runtime dependency surface: peer `react` and `react-dom`; normal `lucide-react` only if the package owns icon rendering; normal `clsx` only if class composition needs it; avoid `tailwind-merge` because package styling is not a Tailwind utility override API. Keep Next.js, Clerk, PostHog, and app-local utilities out of package dependencies.

## Styling

The current app UI uses Tailwind classes. That is not a good standalone package contract.

The reusable package should ship styles through a CSS file and CSS variables. The host should import the CSS once and may override variables or pass a small set of class hooks. The package can keep a headless or lightly controlled internal state API, but v1 should ship a complete default styled widget because the product goal is a polished support experience, not only primitives.

The shadcn theming docs recommend CSS variables for theming. Their convention is semantic surface and foreground pairs such as `background` / `foreground`, `card` / `card-foreground`, `popover` / `popover-foreground`, `primary` / `primary-foreground`, `secondary` / `secondary-foreground`, `muted` / `muted-foreground`, and `accent` / `accent-foreground`, plus `destructive`, `border`, `input`, `ring`, and `radius`. Dark mode works by overriding the same tokens under `.dark`. The current web app already follows this shape in `apps/web/app/globals.css` with `@theme inline`, `:root`, and `.dark`.

For the package, the best contract is package-owned CSS classes backed by widget-specific variables that map to shadcn tokens, for example `--sbs-chat-background: var(--popover, oklch(...))` and `--sbs-chat-ring: var(--ring, oklch(...))`. This keeps the package aligned with shadcn while avoiding a hard requirement that every host run Tailwind over package internals. The default behavior should inherit host tokens. Fixed light or dark treatments should be expressed through CSS variable overrides by the host wrapper, not through a widget-specific React theme provider in v1.

AI Elements is relevant, but it is source-added component code built on shadcn/ui, React 19, and Tailwind CSS 4. The docs show components installed into a local components directory, usually `@/components/ai-elements/`, through commands such as `npx ai-elements@latest add conversation`. The package must not depend on those app-local import paths. AI Elements primitives should be copied or adapted into `packages/telegram-chat-widget` so the package owns its UI boundary and can heavily modify the primitives for Ship by Sunday branding.

Useful AI Elements inputs:

- Conversation: automatic bottom scrolling and scroll button behavior.
- Prompt Input: textarea, submit button, attachment actions, screenshot action, and attachment state hook.
- Attachments: grid, inline, and list attachment displays with media detection and remove behavior.
- Task: optional structured progress display for future support automation or bug-report diagnostics.
- Stack Trace: optional formatted stack trace display if bug reports collect developer errors.

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
