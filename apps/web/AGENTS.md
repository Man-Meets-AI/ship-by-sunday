# apps/web

## Scope

Use this file for all work under `apps/web`.

This app is codebase-first, not course-first. The public customer outcome is one Codebase delivered at Review & Download.

## Read Before Editing

- For any `apps/web` task, start with the repo root `AGENTS.md`.
- Before changing app architecture, route groups, Convex module shape, billing boundaries, provider setup, Sentry, Resend, or debug tooling, read `apps/web/ARCHITECTURE.md` and `apps/web/CONVENTIONS.md`.
- For route, auth, checkout, entitlement, browser proof, release-readiness, or ship-readiness work, also read `docs/release-workflow.md`.
- For UI layout, styling, theming, motion, docs chrome, marketing presentation, component presentation, or component/file structure, read `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md`. Do not use root `DESIGN.md`, `docs/FRONTEND.md`, or `docs/ship-by-sunday/design-pack/` as preserved doctrine for that work.
- Before changing the public homepage, read `apps/web/src/content/docs/configure-the-homepage.mdx`.
- Before changing Convex code, read `apps/web/convex/_generated/ai/guidelines.md`.
- Before changing Next.js App Router, rendering, route handlers, middleware, config, caching, metadata, or server/client boundaries, read the relevant guide in the installed `next` package's `dist/docs/`. In this Bun workspace, Next.js is hoisted to `../../node_modules/next/dist/docs/` from `apps/web`.

## Product Contract

- Current pre-migration protected handoff: `/home -> /generate-codebase -> /generate-codebase/review`, with Worker under `/workers/*` and Tutorials under `/tutorials`.
- Target route, provider, and Convex architecture are governed by `apps/web/ARCHITECTURE.md`, `apps/web/CONVENTIONS.md`, and relevant Program records. Current paths are not preservation constraints unless a slice documents a live customer, provider callback, or release dependency plus the removal path.
- `/start`, `/product`, `/design`, `/marketing`, and `/build-plan` are current compatibility redirects, not target architecture.
- Optional post-download library: Execute / Ship.
- Do not preserve old CEO / Design / Build / Ship framing if it conflicts with codebase-first logic.
- Do not reintroduce separate pre-review download artifacts or staged download contracts into the UI unless the live product changes first.
- Do not turn workflow or ephemeral state into canonical intake.
- Use current `apps/web` runtime code to understand behavior that exists today, but use the template-first app docs and Program packet to choose migration targets. Use older `docs/ship-by-sunday/*.md` planning files only for background context when runtime code and Program docs do not answer the question.

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

- The completed T3 Code migration supersedes the old visual and frontend structure doctrine. Keep Next.js route groups such as `(auth)`, `(marketing)`, and `(app)` when useful, but treat underscore implementation folders such as `_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, and `_metadata` as migration targets.
- Keep presentation in components and stateful or behavioral logic in hooks, helpers, or controller layers.
- Split components above 150 lines when a clean feature-local boundary exists.
- Use product language in UI copy. Do not leak planning, prompt, or implementation terminology into customer-facing surfaces.
- New or migrated implementation should move toward T3 Code-style plain modules under `src/components`, `src/hooks`, `src/lib`, route adapters, and colocated logic/tests instead of adding new underscore implementation folders.

## Route And Access Triggers

- If a change touches access checks, checkout success, entitlement, Clerk auth, or protected routes, prove the affected route and hosted-release path with the focused app tests first, then use the release proof commands from `docs/release-workflow.md` when judging release confidence.
- If a test or route still uses legacy `/mission` or `/artifacts` wording, treat it as suspect unless the current customer-facing contract still depends on that alias.
- For checkout or billing changes, keep Stripe-to-Convex handoff proof separate from UI proof.

## External Setup Triggers

- If an app change adds or changes required work in Clerk, Convex, Stripe, PostHog, Vercel, GitHub, email, storage, analytics, observability, or any other provider, update the active setup docs in the same change.
- The doc update must say what to create, where to create it, required names/scopes/permissions, which environment owns it, where values are stored, how to verify it, and what breaks when it is missing.
- If the requirement affects the generated repo or a customer's future agent, update the generated customer-facing source docs as well as the internal app docs.
- If no external setup changed, say that explicitly in the final summary for provider/config work.

## Planning Triggers

- For major IA, lesson, funnel, state-model, route, or data-contract work, create or update an ExecPlan before coding.
- Explicitly separate fact, workflow, derived, and ephemeral state in plans and implementation.
- Call out contradictions instead of papering over them.

## Local Verification

- Run focused tests for the touched feature first.
- For UI route changes, prefer focused integration-ui tests or release-owned browser proof before broad validation.
- For Convex-backed changes, validate against hosted Convex dev only.
- Do not edit or commit `apps/web/next-env.d.ts`. Next.js generates it and rewrites the route type import differently for `next dev` and `next build`.
- Before completing code work, the repo-level gates from root still apply: `bun run format`, `bun lint`, and `bun typecheck`.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
