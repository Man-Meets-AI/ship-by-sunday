# apps/web

## Scope

Use this file for all work under `apps/web`.

This app is blueprint-first, not course-first. The public customer outcome is one Blueprint delivered at Review & Download.

## Read Before Editing

- For any `apps/web` task, start with the repo root `AGENTS.md`.
- For route, auth, checkout, entitlement, browser proof, release-readiness, or ship-readiness work, also read `docs/release-workflow.md`.
- For UI layout, styling, theming, motion, docs chrome, marketing presentation, or component presentation, read root `DESIGN.md` and `docs/ship-by-sunday/design-pack/AGENTS.md`.
- Before changing the public homepage, read `apps/web/content/docs/configure-the-homepage.mdx`.
- Before changing Convex code, read `apps/web/convex/_generated/ai/guidelines.md`.
- Before changing Next.js App Router, rendering, route handlers, middleware, config, caching, metadata, or server/client boundaries, read the relevant guide in `apps/web/node_modules/next/dist/docs/`.

## Product Contract

- Required funnel: Start -> Product -> Design -> Marketing -> Build Plan -> Review & Download.
- Optional post-download library: Execute / Ship.
- Do not preserve old CEO / Design / Build / Ship framing if it conflicts with blueprint-first logic.
- Do not reintroduce separate pre-review download artifacts or stage-pack contracts into the UI unless the live product changes first.
- Do not turn workflow or ephemeral state into canonical intake.
- Use current `apps/web` routes, features, config, and local instruction files as the live product contract. Use older `docs/ship-by-sunday/*.md` planning files only for background context when runtime code does not answer the question.

## State Rules

- Convex-backed product state is the source of truth in `apps/web`.
- Do not mirror `useQuery` results or server-loaded workspace state into React `useState` just to drive normal rendering.
- Keep local React state only for clearly UX-only purposes:
  - editable draft buffers
  - inline validation or save feedback
  - optimistic mutation state
  - client-only acknowledgement that Convex should not store
- If local state would survive long enough to compete with Convex truth across refresh, route change, or save, remove it.

## UI And Component Rules

- Preserve the existing visual system unless the task explicitly calls for redesign.
- Keep presentation in components and stateful or behavioral logic in hooks, helpers, or controller layers.
- Split components above 150 lines when a clean feature-local boundary exists.
- Use product language in UI copy. Do not leak planning, prompt, or implementation terminology into customer-facing surfaces.
- For user-facing UI work, also follow `docs/ship-by-sunday/design-pack/`.

## Route And Access Triggers

- If a change touches access checks, checkout success, entitlement, Clerk auth, or protected routes, prove the affected route and hosted-release path with the focused app tests first, then use the release proof commands from `docs/release-workflow.md` when judging release confidence.
- If a test or route still uses legacy `/mission` or `/artifacts` wording, treat it as suspect unless the current customer-facing contract still depends on that alias.
- For checkout or billing changes, keep Stripe-to-Convex handoff proof separate from UI proof.

## Planning Triggers

- For major IA, lesson, funnel, state-model, route, or data-contract work, create or update an ExecPlan before coding.
- Explicitly separate fact, workflow, derived, and ephemeral state in plans and implementation.
- Call out contradictions instead of papering over them.

## Local Verification

- Run focused tests for the touched feature first.
- For UI route changes, prefer focused integration-ui tests or release-owned browser proof before broad validation.
- For Convex-backed changes, validate against hosted Convex dev only.
- Before completing code work, the repo-level gates from root still apply: `bun run format`, `bun lint`, and `bun typecheck`.
