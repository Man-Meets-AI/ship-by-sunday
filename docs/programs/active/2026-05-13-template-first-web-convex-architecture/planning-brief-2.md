---
title: Template First Web Convex Planning Brief 2
program_id: template-first-web-convex-architecture
brief_version: 2
status: current
summary: "Second planning brief for the app src tree, route group, and app-shell billing attention surface migration."
read_when:
  - "Writing or resuming the app src tree and route group child ExecPlan."
  - "Moving Next.js app routes from root app into src/app."
  - "Checking why billing endpoints are not being renamed in this slice."
---

# Template First Web Convex Planning Brief 2

## Slice

App `src/` tree, route groups, and app-shell billing attention surface.

## Desired Outcome

Move the Next.js application source toward the sibling template shape without changing provider endpoints or durable billing state. After this slice, Next.js should load the app from `apps/web/src/app`, public marketing routes should live under `(marketing)`, Clerk auth routes should live under `(auth)`, protected product routes should live under `(app)`, and the app shell should have a typed, non-dismissible billing attention banner surface ready for the later Convex billing slice.

## Scope

In scope:

- Move the root `apps/web/app` router to `apps/web/src/app`.
- Move source folders that App Router code imports through the app alias into `apps/web/src`: `components`, `config`, `content`, `data`, `hooks`, `lib`, and the current `platform` compatibility boundary.
- Move special Next.js files that must sit beside `src/app` when `src/` is used: `proxy.ts`, `instrumentation.ts`, `instrumentation-client.ts`, and `mdx-components.tsx`.
- Update `tsconfig.json`, `vitest.config.ts`, `next.config.ts`, `components.json`, tests, scripts, and docs that rely on old app/source paths.
- Rename `(identity)` to `(auth)` and `(protected)` to `(app)`.
- Move `/`, `/starter`, `/workers`, `/blog`, and `/docs` under `(marketing)`.
- Move `/admin/impersonation` under `(app)` without changing its URL.
- Keep existing `/checkout/*` routes and existing `/api/stripe/checkout` route behavior in place until the billing route slice replaces them.
- Add a typed app-shell billing attention banner prop and component that is hidden by default, non-dismissible, and role-agnostic until the later Convex billing slice supplies owner/admin state.
- Preserve public and protected URL behavior.
- Run focused public metadata and protected-route tests, app-shell tests, then broader app static checks as feasible.

Out of scope:

- Renaming Stripe checkout or webhook endpoints.
- Moving the Convex backend under `src/`.
- Changing Convex schema or product entitlement logic.
- Adding Sentry, Resend, Cal.com, Stripe portal, or email dependencies.
- Building `/billing` or wiring live billing attention from Convex.
- Splitting `platform/` into final `src/lib/*` provider lanes. This slice may move it into `src/platform` as a temporary compatibility boundary so the app can switch to `src/` safely.

## Inputs

- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`
- `apps/web/ARCHITECTURE.md`
- `apps/web/CONVENTIONS.md`
- `apps/web/AGENTS.md`
- `docs/release-workflow.md`
- `docs/exec-plans/PLANS.md`
- Next.js installed docs:
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/src-folder.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation-client.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/mdx-components.md`
- Sibling template source: `~/Developer/next-js-convex-clerk-stripe-template/src`

## Acceptance

- The child ExecPlan records `program_id: "template-first-web-convex-architecture"` and this planning brief path.
- There is no root `apps/web/app` router left; Next.js loads from `apps/web/src/app`.
- `src/app/(marketing)` owns `/`, `/starter`, `/workers`, `/blog`, and `/docs`.
- `src/app/(auth)` owns sign-in, sign-up, and reset-password auth routes.
- `src/app/(app)` owns protected product routes and `/admin/impersonation`.
- `src/app/api` still owns existing route handlers, including unchanged checkout endpoint behavior.
- TypeScript and Vitest aliases resolve `@/app`, `@/components`, `@/config`, `@/content`, `@/data`, `@/hooks`, `@/lib`, and `@/platform` from `src`, while `@/convex` still resolves to the root Convex backend.
- The app shell exposes a typed billing attention banner prop and tests prove it renders when supplied and stays absent by default.
- Focused tests prove public metadata routes, proxy protection, auth routes, protected layout, checkout route, and app shell behavior still pass.
- No external provider setup changes are introduced in this slice.

## Watchpoints

- Next.js ignores `src/app` while a root `app` directory exists, so the move must be complete enough that no root app router remains.
- Moving `proxy.ts`, instrumentation files, and `mdx-components.tsx` is required because `src/` special files sit beside `src/app`.
- Do not accidentally move `apps/web/convex`; Convex remains at app root.
- Do not use this mechanical tree migration as an excuse to rename billing endpoints or change checkout behavior.
- Tests and docs may import route-group paths directly. Update those imports to `(auth)` and `(app)` because route-group names are source organization, not URL contract.
