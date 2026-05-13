---
title: App Src Tree And Route Groups
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Move the web app into the template-style src tree, rename route groups, and add the app-shell billing attention surface without changing provider endpoints.
post_build_recap: The web app now loads from apps/web/src/app with (marketing), (auth), and (app) route groups, keeps checkout/API provider endpoints unchanged, exposes a typed non-dismissible app-shell billing attention banner prop, and passed focused route tests, app lint, app format check, and app typecheck/build.
program_id: template-first-web-convex-architecture
planning_brief: docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-2.md
read_when:
  - Resuming the app src tree migration.
  - Checking route group moves for the template-first Program.
  - Validating public and protected route behavior after the source tree move.
---

# App Src Tree And Route Groups

This document is a living execution plan for the app source tree and route group slice of the template-first web and Convex Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The app currently keeps its App Router and shared source at the root of `apps/web`, while the target template uses `src/app`, `(marketing)`, `(auth)`, `(app)`, and `api/`. This slice makes the tree match that shape so later billing, Convex, Sentry, Resend, and Cal.com work can land in predictable places. A user should see the same public and protected URLs after the change, while contributors should see a cleaner template-style source layout.

## Progress

- [x] 2026-05-13: Read Program rules, ExecPlan rules, app architecture/conventions docs, release workflow, homepage contract, design guidance, installed Next.js docs for `src`, route groups, route handlers, proxy, instrumentation, instrumentation-client, and MDX components, plus sibling template architecture/conventions.
- [x] 2026-05-13: Created immutable planning brief 2 and pointed `current-planning-brief.txt` at it.
- [x] Move source folders and Next.js special files into `apps/web/src`.
- [x] Rename route groups and repair imports/tests/docs.
- [x] Add the app-shell billing attention banner surface and focused tests.
- [x] Run focused app route tests and static validation.
- [x] Update the Program ledger and close this ExecPlan when complete.

## Surprises & Discoveries

- Next.js `src` mode makes root `apps/web/app` authoritative if it exists, so the old root router had to be removed entirely instead of kept as a compatibility layer.
- The public sitemap freshness helper resolves paths relative to `apps/web/src` after the move, so route source literals now omit the leading `src/`.

## Decision Log

Decision: Keep checkout pages and `api/stripe/checkout` endpoint names unchanged in this slice.

Rationale: The Program explicitly reserves provider endpoint changes, webhook moves, success sync, portal routes, and release/provider setup docs for the billing route slice. This slice is a structural source move and route-group rename.

Date: 2026-05-13.

Decision: Move the current `platform` folder into `src/platform` as temporary compatibility debt instead of distributing it into final `src/lib/*` lanes now.

Rationale: Renaming provider boundaries while also moving the App Router would widen a P0 billing/auth migration. Later provider slices can move each platform helper into the final target lane with focused tests.

Date: 2026-05-13.

Decision: Add the billing attention banner as a typed app-shell surface with no Convex wiring yet.

Rationale: The Program requires the app shell to have the surface, but the durable Workers billing attention state belongs in a later Convex billing slice. A hidden-by-default prop keeps this slice structural and avoids inventing temporary billing state.

Date: 2026-05-13.

## Outcomes & Retrospective

This plan is complete. The app source tree now lives under `apps/web/src`, the App Router is served from `apps/web/src/app`, source-only route groups are `(marketing)`, `(auth)`, and `(app)`, and root `apps/web/app` is gone. Public URLs, protected URLs, checkout routes, and API/provider endpoint names are unchanged. The app shell has a typed hidden-by-default, non-dismissible billing attention banner surface with focused coverage. No provider dashboards, environment variables, Convex schema, production endpoints, Stripe webhook URLs, Sentry setup, Resend setup, or Cal.com setup changed.

## Context and Orientation

`apps/web` is a Next.js 16 App Router app. The current root App Router lives at `apps/web/app`, but Next.js documentation says that when `src/` is used, `src/app` is ignored if a root `app` directory still exists. Therefore this migration must move the router fully enough that root `apps/web/app` is gone.

The current route groups are source folders only; they do not affect URLs. `(identity)` should become `(auth)`, and `(protected)` should become `(app)`. Public marketing pages should move under `(marketing)`. Existing URL paths such as `/`, `/starter`, `/workers`, `/sign-in`, `/starter/home`, `/workers/setup`, `/admin/impersonation`, `/checkout/success`, and `/api/stripe/checkout` should keep behaving the same.

Special Next.js files need special handling with `src/`: `proxy.ts`, `instrumentation.ts`, `instrumentation-client.ts`, and `mdx-components.tsx` sit beside `src/app`. Configuration files such as `next.config.ts`, `package.json`, `tsconfig.json`, `.env.*`, and `vercel.json` stay at `apps/web` root. The Convex backend stays at `apps/web/convex`.

### In Scope

This plan moves application source into `apps/web/src`, renames the route groups, updates aliases and path references, moves public marketing pages under `(marketing)`, moves admin impersonation under `(app)`, adds a typed non-dismissible billing attention banner prop to the app shell, and updates focused tests/docs affected by the new paths.

### Out Of Scope

This plan does not rename Stripe routes, add Stripe Customer Portal routes, move the Stripe webhook from Convex HTTP to Next.js, add `/billing`, change Convex schema, add provider dependencies, add Sentry, add Resend, configure Cal.com, or change external provider setup.

## Plan of Work

First, move the tree mechanically. Create `apps/web/src`, move `app`, `components`, `config`, `content`, `data`, `hooks`, `lib`, and `platform` into it, then move `proxy.ts`, `instrumentation.ts`, `instrumentation-client.ts`, and `mdx-components.tsx` into `src`.

Second, reorganize route groups inside `src/app`: rename `(identity)` to `(auth)`, rename `(protected)` to `(app)`, move `page.tsx`, `starter`, `workers`, `blog`, and `docs` under `(marketing)`, and move `admin/impersonation` under `(app)/admin/impersonation`. Leave `checkout` and `api` in place for the later billing slice.

Third, update path resolution. `apps/web/tsconfig.json` should resolve app source aliases from `src` while keeping `@/convex/*` pointed at the root Convex backend. `apps/web/vitest.config.ts` should mirror those aliases for tests. `apps/web/next.config.ts` should import output tracing config from `./src/config/vercel-output-tracing`, and `apps/web/components.json` should reference `src/app/globals.css`.

Fourth, update imports and path-sensitive docs/tests. Replace old `@/app/(protected)` imports with `@/app/(app)`, old `@/app/(identity)` imports with `@/app/(auth)`, and old root public/admin route imports with their `(marketing)` or `(app)` route-group homes. Update literal source paths in focused tests and app docs when those literals are intended to describe current truth rather than historical evidence.

Fifth, add the app-shell billing attention surface. Extend `AppShellProps` with a typed `billingAttention` field. Add a small `AppShellBillingAttentionBanner` component that renders only when the prop is present and has no dismiss/snooze state. Render it below the header and above app content in both app and document viewport modes. Add a focused test to prove default absence and supplied rendering.

Finally, run focused tests, repair failures, update the Program progress/slice ledger, fill the retrospective, and move this ExecPlan to completed only after validation passes or any skipped checks are explicitly justified.

## Milestones

Milestone 1 moves the source tree and route groups. It is complete when root `apps/web/app` no longer exists, `apps/web/src/app` owns the router, and route groups are named `(marketing)`, `(auth)`, and `(app)`.

Milestone 2 repairs path resolution and imports. It is complete when TypeScript, Vitest, and app imports can resolve the moved source and `@/convex` still resolves to the root Convex backend.

Milestone 3 adds the billing attention shell surface. It is complete when the app shell renders no banner by default, renders a non-dismissible banner when supplied typed data, and has focused test coverage.

Milestone 4 validates the migration and syncs durable docs. It is complete when focused route/app tests and static checks pass, the Program records this slice completion, and this ExecPlan records the outcome.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect current state before moves:

    git status --short
    find apps/web/app -maxdepth 3 -type f | sort | sed -n '1,120p'
    find apps/web -maxdepth 1 -type f | sort

Move the source tree and special files, then rename route groups and public route folders:

    mkdir -p apps/web/src
    mv apps/web/app apps/web/src/app
    mv apps/web/components apps/web/src/components
    mv apps/web/config apps/web/src/config
    mv apps/web/content apps/web/src/content
    mv apps/web/data apps/web/src/data
    mv apps/web/hooks apps/web/src/hooks
    mv apps/web/lib apps/web/src/lib
    mv apps/web/platform apps/web/src/platform
    mv apps/web/proxy.ts apps/web/src/proxy.ts
    mv apps/web/instrumentation.ts apps/web/src/instrumentation.ts
    mv apps/web/instrumentation-client.ts apps/web/src/instrumentation-client.ts
    mv apps/web/mdx-components.tsx apps/web/src/mdx-components.tsx

After the move, repair source paths, imports, and tests with mechanical replacements and targeted edits. Then validate the route tree:

    test ! -d apps/web/app
    test -d apps/web/src/app
    find apps/web/src/app -maxdepth 2 -type d | sort | sed -n '1,80p'

Run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/app-protected-layout.test.tsx tests/unit/product-shell.test.tsx tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/stripe-line-item.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts

Run static checks:

    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-app-src-tree-and-route-groups.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-app-src-tree-and-route-groups.md docs/programs/active/2026-05-13-template-first-web-convex-architecture apps/web/ARCHITECTURE.md apps/web/CONVENTIONS.md apps/web/AGENTS.md
    git diff --check

## Validation and Acceptance

Acceptance requires both source organization and behavior proof. The source organization proof is that root `apps/web/app` is gone, `apps/web/src/app` exists, route groups match the template names, and imports resolve. The behavior proof is that focused public metadata/proxy/auth/protected-layout/checkout/app-shell tests pass and the app static checks do not report unresolved paths.

Feature: app source tree and route groups. Risk: P1 because this touches public routes, protected routes, auth protection, checkout entry code paths, and the app shell, while intentionally avoiding provider endpoint changes. Source of truth: Next.js route tree, `routeConfig`, Clerk proxy route matcher, app shell rendered markup, and focused test output. Must work: public pages remain public, protected routes remain protected, auth routes keep their URLs, checkout route behavior stays unchanged, and app shell navigation still renders. Must fail safely: no new provider setup, no webhook endpoint move, no Convex schema change, no fake billing state, and no dismissible billing alert state. Tests: focused unit and integration tests plus lint/typecheck. CI gate: app static and integration surfaces.

### Test Commands

    bun run --cwd apps/web test:unit -- tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/app-protected-layout.test.tsx tests/unit/product-shell.test.tsx tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/stripe-line-item.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-app-src-tree-and-route-groups.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-app-src-tree-and-route-groups.md docs/programs/active/2026-05-13-template-first-web-convex-architecture apps/web/ARCHITECTURE.md apps/web/CONVENTIONS.md apps/web/AGENTS.md
    git diff --check

## Idempotence and Recovery

The tree move is mechanical but broad. If validation fails because imports still point at old route-group names, rerun searches for `(protected)`, `(identity)`, `apps/web/app`, `@/app/(app)/admin/impersonation`, and root source paths, then repair only the stale references. If Next.js ignores `src/app`, check that root `apps/web/app` is truly gone. If `@/convex` breaks, keep Convex at root and fix aliases instead of moving Convex.

If a partial move is interrupted, do not delete files. Inspect `git status --short`, use `find apps/web -maxdepth 2 -type d` to identify duplicate roots, and move directories into the intended `apps/web/src` location. Because this slice does not change data, providers, or schema, recovery is file-tree and import repair only.

## Artifacts and Notes

Record focused validation output here as the work proceeds.

- 2026-05-13: Source folders and Next.js special files moved under `apps/web/src`; route groups renamed to `(marketing)`, `(auth)`, and `(app)`; app shell gained typed `billingAttention` rendering with default absence covered in `apps/web/tests/unit/product-shell.test.tsx`.
- 2026-05-13: `test ! -d apps/web/app && test -d apps/web/src/app` passed, and `find apps/web/src/app -maxdepth 2 -type d` showed `(marketing)`, `(auth)`, `(app)`, `api`, and unchanged `checkout` roots.
- 2026-05-13: `bun run --cwd apps/web test:unit -- tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/app-protected-layout.test.tsx tests/unit/product-shell.test.tsx tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/stripe-line-item.test.ts tests/unit/release-scope.test.ts tests/unit/unknown-boundary-lint.test.ts tests/unit/blog-page-paths.test.ts tests/unit/docs-page-paths.test.ts tests/unit/public-content-inventory.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts` passed with 16 files and 92 tests.
- 2026-05-13: `bun run --cwd apps/web test:integration:node -- tests/integration/stripe-checkout-route.test.ts` passed with 1 file and 6 tests.
- 2026-05-13: `bun run --cwd apps/web test:integration:node -- tests/integration/workspace-runner-api.test.ts` passed with 1 file and 7 tests.
- 2026-05-13: `bun run --cwd apps/web format:check` passed after applying the repo formatter.
- 2026-05-13: `bun run --cwd apps/web lint` passed with 0 warnings and 0 errors.
- 2026-05-13: `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck` passed, and Next listed the expected moved routes including `/`, `/starter`, `/workers`, `/blog`, `/docs`, `/sign-in`, `/sign-up`, `/checkout/*`, protected app routes, and API routes.
- 2026-05-13: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-app-src-tree-and-route-groups.md`, `bun run programs:lint`, scoped `bun run markdown:lint`, and `bun run public-readiness:lint` passed.
- 2026-05-13: `bun run format`, `bun lint`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck`, and `git diff --check` passed.

## Interfaces and Dependencies

This slice depends on Next.js 16 `src/` folder behavior, Clerk proxy route protection, Vitest alias resolution, TypeScript `paths`, MDX component discovery, and the existing checkout route tests. The Convex backend remains at `apps/web/convex` and must not move.

The Program packet is `docs/programs/active/2026-05-13-template-first-web-convex-architecture/`. The immutable planning brief for this slice is `docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-2.md`. The app architecture contracts are `apps/web/ARCHITECTURE.md` and `apps/web/CONVENTIONS.md`.
