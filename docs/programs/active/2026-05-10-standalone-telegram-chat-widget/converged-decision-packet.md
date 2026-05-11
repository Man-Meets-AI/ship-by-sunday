---
title: "Standalone Telegram Chat Widget Converged Decision Packet"
summary: "Final planning decisions for extracting the Telegram support widget into an owned standalone package."
docType: "decision_packet"
status: "active"
read_when:
  - "Checking the locked package, adapter, and non-goal decisions."
  - "Resolving whether to use Convex Component, Next.js routes, or direct Convex subscriptions."
---

# Standalone Telegram Chat Widget Converged Decision Packet

## Decisions

Decision: Create `packages/telegram-chat-widget` as `@shipbysunday/telegram-chat-widget`.

Rationale: This follows the repo's package scope and gives the widget a durable boundary above the web app.

Decision: The package is standalone React, not Next.js.

Rationale: The widget does not need a router or framework-specific server. Host apps can decide where to mount it and which transport to provide.

Decision: Do not implement this as a Convex Component.

Rationale: The product owner explicitly prefers an owned package boundary. Convex Component packaging would add ecosystem coupling without enough benefit for this app.

Decision: Use Convex realtime through an optional adapter, not a manual WebSocket.

Rationale: Convex React subscriptions already provide realtime query updates. Manual WebSocket code would duplicate the backend client's job and increase failure surface.

Decision: Preserve fetch transport during the first migration.

Rationale: The current HttpOnly support-session bridge is working. Keeping it during UI extraction avoids coupling packaging with an auth model change.

Decision: Make Convex an optional adapter entrypoint.

Rationale: Consumers that only use the fetch adapter should not install or configure Convex. Consumers that do use Convex should provide their own Convex client/provider and generated function references.

Decision: Ship default package CSS instead of requiring host Tailwind.

Rationale: A standalone package should render correctly in any React host with one CSS import and documented variables.

Decision: Keep provider setup and backend runtime outside the first package slice.

Rationale: The existing Telegram Support Bot Program owns the live backend. Backend extraction should wait until the frontend package and app consumption prove the boundary.

Decision: Treat v1 as internal monorepo only.

Rationale: The first package version should extract and stabilize Ship by Sunday's own support widget. It should keep clean package boundaries, but it should not include npm publishing, public semver guarantees, or external consumer docs in v1.

Decision: Use one internal package with subpath exports.

Rationale: One package gives customers one coherent widget experience, gives coding agents one clear ownership root, and gives developers DRY shared core logic while keeping adapters optional at import boundaries. Subpath exports are enough separation for v1 and match existing repo package precedent.

Decision: Ship an opinionated default-styled widget.

Rationale: The package should make the polished customer experience the default. A headless-first kit would push too much layout and interaction design onto every host and every future coding agent.

Decision: Use selected AI Elements primitives as source-pattern inputs.

Rationale: AI Elements provides proven primitives for conversation scrolling, prompt input, attachments, task progress, and stack trace display. The package should adopt the useful primitives while preserving its own standalone boundary and not importing from app-local `@/components/ai-elements/*` paths.

Decision: Own the adapted AI Elements primitive source inside the package.

Rationale: The primitives will be heavily modified for Ship by Sunday branding and support-specific behavior. Package-local source keeps the customer experience coherent and gives agents and developers one clear place to evolve the primitives.

Decision: Use shadcn-style CSS variable theming for the package styling contract.

Rationale: shadcn recommends CSS variables and semantic tokens for theming, with dark mode overriding the same tokens. The package should align with those conventions by mapping widget variables to host tokens such as `background`, `foreground`, `primary`, `muted`, `border`, `input`, `ring`, and `radius`, while keeping package fallbacks so the widget remains complete.

Decision: Inherit host theme tokens by default.

Rationale: Host-token inheritance keeps the widget native to the surrounding surface and reduces duplicate theme logic. Package-scoped `--sbs-chat-*` variables preserve the branded support-chat feel and give hosts an override point when a fixed light or dark treatment is needed.

Decision: Use a single typed client adapter object for transport.

Rationale: The widget needs a coherent state machine across loading, sending, attachment upload, transcript updates, realtime subscription, and failures. A typed adapter object is easier to test and evolve than many loose callback props, and it keeps fetch and Convex implementations interchangeable behind one UI contract.

Decision: Keep analytics host-owned through a typed metadata-only event sink.

Rationale: The package should not import PostHog or any analytics SDK. It should emit typed lifecycle metadata events that hosts can adapt to their analytics provider, while transcript bodies, attachment content, emails, tokens, Telegram ids, and generated output remain out of event payloads.

Decision: Make `TelegramChatWidget` the primary public React component.

Rationale: An all-in-one widget gives customers the complete polished launcher, panel, open state, and placement behavior by default. It also gives coding agents one obvious mount point and prevents developers from duplicating launcher and mobile positioning logic across hosts.

Decision: Use default fixed bottom-right placement with a small placement enum.

Rationale: Default fixed placement makes the widget complete on first mount. A narrow enum gives legitimate host control without opening arbitrary position, breakpoint, and z-index configuration that would become brittle and repetitive.

Decision: Ship strong default content with partial host overrides.

Rationale: The package should be polished when mounted with minimal props. Hosts can customize identity and surface-specific wording, but the package should provide complete defaults for launcher, empty state, composer, attachment, bug-report, fallback, loading, delivery, error, and closed states.

Decision: Use Parker/Ship by Sunday-branded defaults for v1.

Rationale: v1 is internal monorepo-only. Branded defaults produce the best first customer experience and reduce repetitive wrapper copy, while the same partial override model preserves a later path to generic public defaults if the package is published.

Decision: Keep v1 uploads to screenshots/images only.

Rationale: Screenshot upload is the high-value support flow. Arbitrary files, videos, logs, and stack traces would widen storage, retention, Telegram rendering, privacy, and tests before the image path is proven. The type model can leave room for future structured diagnostics.

Decision: Support one screenshot attachment per message in v1.

Rationale: The current support backend and API bridge use one `attachment` per support message. A one-attachment v1 keeps optimistic UI, upload, retry, failure, and Telegram delivery straightforward and avoids multi-upload edge cases before real usage proves they are needed.

Decision: Keep bug reporting as an inline composer mode.

Rationale: Inline composer mode keeps bug reporting conversational and lets the same send, attachment, loading, error, and delivery states handle both normal support messages and structured bug reports. A separate wizard or modal would add surface area before customers need it.

Decision: Use structured bug-report metadata plus a rendered fallback body.

Rationale: A readable body preserves today's Telegram and support transcript experience, while structured metadata gives future automation, tests, and backend storage a strong contract without parsing prose.

Decision: First implementation slice is scaffold/contracts only.

Rationale: The first child ExecPlan should create the package root and stable contracts before moving UI. This keeps package mechanics, styling primitives, and app behavior migration from being debugged in one large diff.

Decision: Add focused package tests in the scaffold slice.

Rationale: The scaffold owns real behavior: content default merging, screenshot policy, structured bug-report payload rendering, metadata-only event helpers, and adapter fixtures. Testing those contracts immediately gives future agents executable guidance without brittle visual tests.

Decision: Include the new package in root package validation from its first commit.

Rationale: Root `lint:packages`, `typecheck:packages`, and `test:packages` should cover every active internal product package. That gives agents and developers one standard validation path and prevents the widget package from drifting outside the repo gates.

Decision: Keep runtime dependencies minimal and framework-free.

Rationale: React and React DOM belong as peer dependencies. Icons and tiny class helpers can be normal dependencies only when the package owns those behaviors. Tailwind merge, Next.js, Clerk, PostHog, generated Convex API references, and app-local modules should stay out of the package root.

Decision: Reserve `./convex` in the scaffold but do not implement the live Convex adapter there.

Rationale: Stable subpath exports help agents and developers see the intended architecture. Live realtime behavior should wait for the dedicated Convex Realtime Adapter slice so package setup and realtime auth/session design are not mixed into one diff.

Decision: Implement a configurable fetch adapter in the scaffold slice.

Rationale: The current backend already works through fetch routes. A tested fetch adapter gives the package contract a real backend bridge before UI migration, while deferring app consumption keeps the scaffold slice behavior-neutral.

Decision: Give the fetch adapter current route defaults with overrides.

Rationale: `createFetchTelegramChatClient()` should be useful immediately inside this monorepo by targeting `/api/support/messages` and `/api/support/attachments`. Tests and future hosts can override those endpoints without changing the package contract.

## Non-Decisions

This packet does not decide when or whether to publish the package outside the monorepo after v1. It does not decide to replace the current anonymous HttpOnly support session with a browser-visible token in the first slice. It does not decide to extract Convex backend functions into the package. It does not change production Telegram setup ownership.
