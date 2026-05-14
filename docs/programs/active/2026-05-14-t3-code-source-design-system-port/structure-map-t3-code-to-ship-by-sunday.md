---
title: "T3 Code Structure Map To Ship By Sunday"
summary: "Maps T3 Code's browser app structure to Ship by Sunday's replacement targets."
docType: "structure_map"
status: "active"
read_when:
  - "Planning a structural migration slice for apps/web."
  - "Deciding whether a Next.js route group or underscore implementation folder is in scope."
---

# T3 Code Structure Map To Ship By Sunday

## Rule

Copy T3 Code's implementation shape where framework constraints allow it.

Do not target Next.js route groups just because they use parentheses. `(auth)`, `(marketing)`, and `(app)` are route organization and can stay when useful.

Do target underscore implementation folders. `_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, and `_metadata` are Ship by Sunday conventions, not T3 Code conventions.

## T3 Code Source Shape

T3 Code keeps the browser app under plain `src/` directories:

- `src/components`
- `src/components/auth`
- `src/components/chat`
- `src/components/desktop`
- `src/components/settings`
- `src/components/sidebar`
- `src/components/ui`
- `src/environments`
- `src/hooks`
- `src/lib`
- `src/observability`
- `src/routes`
- `src/rpc`

It also uses plain feature files and colocated support files:

- `Component.tsx`
- `Component.logic.ts`
- `Component.logic.test.ts`
- `feature.ts`
- `feature.test.ts`

The only underscore route files found in T3 Code are TanStack Router path-layout files:

- `src/routes/__root.tsx`
- `src/routes/_chat.tsx`
- `src/routes/_chat.index.tsx`
- `src/routes/_chat.draft.$draftId.tsx`
- `src/routes/_chat.$environmentId.$threadId.tsx`

Those are router semantics, not a general underscore implementation-folder pattern.

## Current Ship By Sunday Replacement Targets

The current app has many implementation folders under `apps/web/src/app`:

- `apps/web/src/app/_components`
- `apps/web/src/app/_content`
- `apps/web/src/app/_fonts`
- `apps/web/src/app/_lib`
- `apps/web/src/app/_metadata`
- `apps/web/src/app/(app)/_components`
- `apps/web/src/app/(app)/_hooks`
- `apps/web/src/app/(app)/_lib`
- `apps/web/src/app/(app)/_server`
- `apps/web/src/app/(auth)/_components`
- `apps/web/src/app/(auth)/_lib`
- `apps/web/src/app/(marketing)/blog/_components`
- `apps/web/src/app/(marketing)/blog/_content`
- `apps/web/src/app/(marketing)/blog/_lib`
- `apps/web/src/app/(marketing)/blog/_server`
- `apps/web/src/app/(marketing)/docs/_components`
- `apps/web/src/app/(marketing)/docs/_lib`
- `apps/web/src/app/(marketing)/docs/_server`
- `apps/web/src/app/(marketing)/docs/_styles`
- `apps/web/src/app/api/*/_server`
- `apps/web/src/app/checkout/*/_components`
- `apps/web/src/app/checkout/*/_hooks`
- `apps/web/src/app/checkout/*/_lib`

Treat this as migration inventory. Do not add new underscore implementation folders in migrated areas.

First proof landed in this Program slice: `apps/web/src/app/(marketing)/worker-seal-team-6/_components` and `_lib` were replaced by `apps/web/src/components/workerSealTeam6`.

## Target Mapping

Use this mapping for future child ExecPlans:

- reusable or cross-route UI: move toward `apps/web/src/components/<feature>`
- low-level primitives: move toward `apps/web/src/components/ui`
- route shell adapters: keep thin files under `apps/web/src/app/**`
- client hooks: move toward `apps/web/src/hooks` or feature-adjacent plain files
- pure logic and render models: move toward `apps/web/src/lib/<feature>` or colocated `.logic.ts`
- API/server adapters: keep Next route handlers under `apps/web/src/app/api/**`, but move reusable server logic to plain modules such as `apps/web/src/platform`, `apps/web/src/lib`, or a future `apps/web/src/rpc`-style boundary
- docs/blog content: keep content where a framework or loader needs it, but avoid `_content` as a general pattern
- CSS/theme files: move toward app-global CSS, component CSS, or plain feature style modules; avoid `_styles` as a doctrine folder
- fonts/metadata: keep Next-required root files where needed, but avoid `_fonts` and `_metadata` directories as durable architecture

## First Safe Proof Slice Guidance

Pick one bounded non-critical area with limited imports. Good remaining candidates:

- public support/homepage shared components under `apps/web/src/app/_components`
- one checkout helper-only folder if tests already cover the path

Avoid as a first proof:

- auth callback and Clerk route files
- Stripe webhook or checkout success behavior
- Convex-backed worker setup flows
- docs/blog MDX pipeline
- broad app shell imports

The proof slice should:

- move one folder's implementation to a T3-style plain module location
- update imports explicitly
- keep public URLs unchanged
- run focused tests for that route or module
- run `bun run --cwd apps/web lint` and `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck` when feasible

## Later Generated-Codebase Scope

Generated customer repositories should eventually receive the same structure rules through `packages/codebase-compiler`, `templates/starter-app`, and generated docs. Do not implement that until the tracked app's target structure is proven.
