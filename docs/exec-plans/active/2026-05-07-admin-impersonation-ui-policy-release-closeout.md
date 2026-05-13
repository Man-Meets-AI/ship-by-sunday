---
title: Admin Impersonation UI Policy And Release Closeout
status: active
created_at: 2026-05-07
completed_at: null
summary: Finish app-managed Clerk actor-token support mode with UI, stop flow, audit policy, docs, and proof boundaries.
post_build_recap: null
program_id: admin-user-impersonation
planning_brief: docs/programs/active/2026-05-05-admin-user-impersonation/planning-brief-2.md
read_when:
  - Resuming the Admin User Impersonation Program closeout.
  - Touching `/admin/impersonation`, support-mode UI, Convex impersonation functions, or support-mode write policy.
  - Proving the real Clerk actor-token flow before Program completion.
---

# Admin Impersonation UI Policy And Release Closeout

This is a living execution plan. It describes the remaining Admin User Impersonation Program work after the foundation/schema/provider contract slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship the app-managed support-mode path on top of Clerk actor tokens and Convex audit state. Parker should be able to search for a Clerk customer, record a reason, create a Convex support session, consume a Clerk actor-token ticket, land in the customer's workspace, see an unmistakable support-mode bar, stop cleanly, and review session history.

The feature must preserve the existing ownership model: Clerk's active subject is the customer, and Convex continues authorizing customer data through `identity.subject`. The support-mode layer adds the admin actor, immutable reason, session id, audit evidence, and side-effect policy needed to make customer support safe.

This plan cannot mark the Program complete until the real-provider proof gates are satisfied. If this checkout lacks support-mode env and dedicated Clerk test customers, record that blocker rather than moving the Program to completed.

## Progress

- [x] 2026-05-07: Created Planning Brief 2 and this closeout ExecPlan from the active Program.
- [x] 2026-05-07: Implemented Convex public boundaries for app-managed session start, handoff active marking, stop, history, blocked route audit, download audit, and allowed-write success audit.
- [x] 2026-05-07: Implemented `/admin/impersonation`, server-side Clerk customer search, reason capture, final confirmation, Clerk actor-token ticket handoff, persistent support-mode bar, account-menu entry point, stop flow, and read-only history.
- [x] 2026-05-07: Classified support-mode writes and side effects. Ordinary in-app product/customer setup writes preflight the support-mode session and append success audit; billing, Codex, managed GitHub, workspace workflow starts, sync approvals, destructive deletes, and runner revocation are blocked at reachable app boundaries.
- [x] 2026-05-07: Updated `docs/internal/admin-impersonation.md` and the Program packet with the implemented flow and exact proof blocker.
- [x] 2026-05-07: Ran `bunx convex codegen`, focused impersonation unit tests, focused support-mode UI tests, `bun run --cwd apps/web lint`, and `bun run --cwd apps/web typecheck`.
- [x] 2026-05-07: Tightened allowed-write and review-download policy so expired, mismatched, or invalidated support-mode sessions fail before customer-state mutation or archive return, with focused unit coverage.
- [x] 2026-05-07: Final local gates passed: `bun run format`, `bun lint`, `bun typecheck`, `bun run plans:lint`, `bun run programs:lint`, `bun run markdown:lint`, and `git diff --check`.
- [ ] Real Clerk actor-token proof and production smoke remain blocked until support-mode env and dedicated test customers are configured.

## Surprises & Discoveries

- 2026-05-07: The installed Clerk frontend SDK exposes the newer `useSignIn()` signal shape, not the older `{ isLoaded, setActive }` hook return. The client handoff now uses `useSignIn().signIn.create({ strategy: "ticket", ticket })` and `useClerk().setActive(...)`, matching the local package types.
- 2026-05-07: Route-level blocked-action audit must be a separate Convex mutation before the HTTP response. A thrown Convex mutation rolls back its own writes, so server/API side-effect blockers cannot rely on "append audit then throw" inside the same mutation transaction.
- 2026-05-07: This checkout has Clerk and Convex credentials, but not support-mode enablement or dedicated proof users. `.env.local` is missing `ADMIN_IMPERSONATION_ENABLED`, `ADMIN_IMPERSONATION_EMAILS`, `CLERK_TEST_USER_EMAIL`, and `CLERK_TEST_USER_PASSWORD`.

## Decision Log

Decision: Use Clerk ticket sign-in for the actor-token browser handoff.
Rationale: Clerk actor tokens produce a ticket that the browser can consume through Clerk's sign-in flow. This keeps Clerk as the browser-session owner and avoids raw redirect or custom session-cookie logic.
Date: 2026-05-07

Decision: Keep `/admin/impersonation` server-owned.
Rationale: Customer search and actor-token creation require Clerk Backend API access and admin allowlist checks. The client can select and confirm, but the server decides whether a ticket can be minted.
Date: 2026-05-07

Decision: Preflight allowed in-app writes and audit after success.
Rationale: A support-mode write should not mutate customer state when the app-managed session is expired, mismatched, or invalidated. Successful writes record evidence only after the underlying customer-state mutation succeeds. The audit event links to the current app-managed session and records a stable action id without storing before/after snapshots.
Date: 2026-05-07

Decision: Block high-impact external side effects during v1 support mode.
Rationale: Billing, Codex account operations, managed GitHub, workflow starts, sync approvals, destructive deletes, and customer repository operations can create confusing external effects. V1 support mode should let Parker see and edit ordinary in-app state while these paths fail closed with audit.
Date: 2026-05-07

Decision: Do not complete the Program without real-provider proof.
Rationale: The Program acceptance explicitly requires one configured non-production Clerk actor-token proof and one production smoke with dedicated test customers. The local implementation can be complete while the Program remains active on that external proof blocker.
Date: 2026-05-07

## Outcomes & Retrospective

The local implementation is in place and validated with mocked Clerk/Convex tests plus app typecheck. The support mode path now has the expected UI, session lifecycle, and policy boundaries.

The Program remains active because real-provider proof is blocked by missing environment-owned configuration and dedicated test customers. The remaining work is operational proof, not another code slice: configure non-production support-mode env, create/verify the dedicated eligible test customer, run the real actor-token flow, then perform a non-destructive production smoke with a dedicated internal production test customer.

## Context and Orientation

The relevant app code lives under `apps/web`. Clerk wraps the app in `apps/web/app/layout.tsx`, and `ConvexProviderWithClerk` passes Clerk auth to Convex. Convex auth is configured through `apps/web/convex/auth.config.ts`.

The completed foundation lives in `apps/web/platform/admin-impersonation/`, `apps/web/convex/impersonation.ts`, and `apps/web/convex/impersonation/`. It already provides runtime env parsing, admin allowlist classification, session/audit schema, actor-claim parsing, support-mode status, and base write policy helpers.

The workspace shell insertion point is `apps/web/app/(protected)/_components/app-shell.tsx`. The account menu entry point is `apps/web/app/(protected)/_components/app-shell/app-shell-user-menu-workspace-items.tsx`. The admin page route is `/admin/impersonation`, protected by `apps/web/proxy.ts`.

Provider setup and operating instructions live in `docs/internal/admin-impersonation.md`. The active Program packet lives under `docs/programs/active/2026-05-05-admin-user-impersonation/`.

### In Scope

Add `/admin/impersonation`, admin-only customer search, reason capture, confirmation, actor-token ticket creation, Clerk ticket handoff, support-mode bar, stop behavior, read-only history, and account-menu entry.

Add public Convex boundaries that let the app start, mark active, stop, list history, audit blocked server/API actions, audit downloads, and append allowed-write success audit.

Classify customer-impacting writes. Allow ordinary in-app product/customer setup writes that stay in Convex only after support-mode session preflight, then audit them after success. Block high-impact external side effects and destructive operations while impersonating.

Update operator docs and the Program packet with the implemented behavior, proof commands, and proof blocker.

### Out Of Scope

Do not add multi-admin roles, a general admin console, raw Clerk Dashboard impersonation support, session resume, customer notification, destructive repair buttons, or broad reset tooling.

Do not pass target customer ids through ordinary product functions. Do not fake Clerk user data in React. Do not enable production support mode without dedicated proof users.

Do not touch `.worktrees/`.

## Plan of Work

Create server-side admin impersonation helpers under `apps/web/app/admin/impersonation/_server/`. They should resolve the current Clerk user, validate the runtime allowlist, search Clerk users through the Backend API, exclude configured admin emails, create Convex support sessions, mint Clerk actor tokens, and mark failed starts when token creation or handoff fails.

Expose public Convex functions in `apps/web/convex/impersonation.ts` for app-managed begin, mark active, stop current session, list admin history, record blocked actions, record downloads, and append allowed-write success audit. Keep returned values UI-safe and avoid raw tokens or actor claims.

Build the admin page and client components under `apps/web/app/admin/impersonation/`. The page should 404 for signed-in non-admins, redirect unauthenticated users to sign-in, show recent non-admin Clerk customers, enforce the reason length, and require final confirmation before start.

Add a shared support-mode bar under `apps/web/app/_components/support-mode/`, mount it in the workspace shell and admin page, and add the account-menu entry point.

Patch customer-impacting Convex mutations and route handlers with support-mode policy. Allowed in-app writes preflight support-mode session state before mutating and append success audit after the underlying mutation succeeds. Blocked routes write a blocked audit event before returning 403.

Update docs and Program state. Leave the Program active if real-provider proof cannot run.

## Milestones

The first milestone is the server and Convex lifecycle boundary. At the end, the app can validate an allowlisted admin, search Clerk users server-side, begin a Convex support session, mint a Clerk actor-token ticket, mark handoff active, mark start failures, stop the current actor session, and list recent history.

The second milestone is the UI boundary. At the end, `/admin/impersonation` renders for admins, signed-in non-admins receive 404, the workspace shell has a persistent support-mode bar, the account menu exposes an admin entry point only when eligible, and focused integration UI tests prove ticket handoff and stop behavior.

The third milestone is write and side-effect policy. At the end, ordinary in-app product/customer setup writes preflight support-mode session state and append success audit, blocked billing/Codex/workspace side-effect routes write blocked audit before returning 403, and review downloads preflight support-mode session state before archive creation and append download audit.

The fourth milestone is documentation and proof closeout. At the end, operator docs and the Program packet state the implemented flow, validation evidence, and any real-provider proof blocker. The Program remains active until the dedicated non-production and production proof gates pass.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Before editing, read:

    sed -n '1,220p' AGENTS.md
    sed -n '1,220p' apps/web/AGENTS.md
    sed -n '1,220p' docs/release-workflow.md
    sed -n '1,220p' apps/web/convex/_generated/ai/guidelines.md
    sed -n '1,260p' docs/programs/active/2026-05-05-admin-user-impersonation/program.md
    sed -n '1,220p' docs/programs/active/2026-05-05-admin-user-impersonation/planning-brief-2.md

Inspect the implementation surfaces:

    sed -n '1,240p' apps/web/convex/impersonation.ts
    sed -n '1,260p' apps/web/convex/impersonation/model.ts
    sed -n '1,220p' apps/web/app/(protected)/_components/app-shell.tsx
    sed -n '1,220p' apps/web/proxy.ts

After Convex API changes, regenerate bindings from `apps/web`:

    cd apps/web
    bunx convex codegen

Focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/admin-impersonation-config.test.ts tests/unit/admin-impersonation-admin.test.ts tests/unit/admin-impersonation-status.test.ts tests/unit/convex-impersonation.test.ts tests/unit/proxy-protected-routes.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/support-mode-bar.test.tsx tests/integration-ui/admin-impersonation-page.test.tsx

Docs and repo validation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-07-admin-impersonation-ui-policy-release-closeout.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-07-admin-impersonation-ui-policy-release-closeout.md docs/programs/active/2026-05-05-admin-user-impersonation docs/internal/admin-impersonation.md
    bun run format
    bun lint
    bun typecheck
    git diff --check

Proof gate, after environment setup exists:

    ADMIN_IMPERSONATION_ENABLED=true
    ADMIN_IMPERSONATION_EMAILS=me@parkerrex.com

Run the manual proof checklist in `docs/internal/admin-impersonation.md` against the dedicated non-production test customer, then repeat the non-destructive production smoke against the dedicated internal production test customer.

## Validation and Acceptance

Acceptance for local implementation requires:

- only explicitly enabled, allowlisted, verified-email admins can initiate app-managed impersonation
- `/admin/impersonation` is protected and never mints tokens for unauthenticated or non-admin callers
- the selected target is a non-admin Clerk user
- reason is required and immutable after session start
- Convex session row is created before the Clerk actor token
- the actor token includes `impersonationSessionId`
- the browser handoff uses Clerk's ticket strategy
- a persistent bar shows customer email, reason preview, time remaining, and stop action
- stop closes Convex session state and signs out the active actor-token session
- history is read-only and recent-session scoped
- allowed support-mode writes preflight session state and append success audit
- blocked side-effect routes audit before returning an HTTP error
- review downloads preflight support-mode session state and append download audit
- docs name setup, failure modes, and proof blockers

Program completion additionally requires real-provider proof:

- one configured non-production Clerk actor-token proof with a dedicated eligible test customer
- one non-destructive production smoke with a dedicated internal production test customer

If those proof gates cannot run, this ExecPlan and Program must remain active with the blocker recorded.

### Test Commands

Run focused tests first:

    bun run --cwd apps/web test:unit -- tests/unit/admin-impersonation-config.test.ts tests/unit/admin-impersonation-admin.test.ts tests/unit/admin-impersonation-status.test.ts tests/unit/convex-impersonation.test.ts tests/unit/proxy-protected-routes.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/support-mode-bar.test.tsx tests/integration-ui/admin-impersonation-page.test.tsx

Run generated bindings, docs, and app gates:

    cd apps/web
    bunx convex codegen
    cd ../..
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-07-admin-impersonation-ui-policy-release-closeout.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-07-admin-impersonation-ui-policy-release-closeout.md docs/programs/active/2026-05-05-admin-user-impersonation docs/internal/admin-impersonation.md
    bun run format
    bun lint
    bun typecheck
    git diff --check

## Idempotence and Recovery

The implementation is additive. Re-running `bunx convex codegen` refreshes generated bindings. Re-running the focused tests and repo gates is safe.

If actor-token creation fails after a Convex session is created, mark that session `start_failed`. If browser handoff fails, mark the same session `start_failed` when the client still has the session id.

If the kill switch is disabled during an active session, Convex status observation lazily invalidates the session. If the browser cannot stop cleanly, sign out the active Clerk session and return to `/admin/impersonation`.

Blocked route audit uses a separate Convex mutation before returning the HTTP error. If that audit mutation fails, prefer returning the blocked response over allowing the external side effect.

## Artifacts and Notes

Implemented code surfaces:

- `apps/web/app/admin/impersonation/`
- `apps/web/app/_components/support-mode/`
- `apps/web/platform/admin-impersonation/route-policy.ts`
- `apps/web/convex/impersonation.ts`
- `apps/web/convex/impersonation/model.ts`
- `apps/web/convex/impersonation/validators.ts`
- `apps/web/convex/schema.ts`
- patched public mutations under `apps/web/convex/access.ts`, `codebase.ts`, `course.ts`, and `workspace.ts`
- patched side-effect routes under `apps/web/app/api/stripe`, `apps/web/app/api/codex`, and `apps/web/app/api/download/repo`
- `docs/internal/admin-impersonation.md`

Focused tests:

- `apps/web/tests/unit/convex-impersonation.test.ts`
- `apps/web/tests/integration-ui/support-mode-bar.test.tsx`
- `apps/web/tests/integration-ui/admin-impersonation-page.test.tsx`

Proof blocker observed on 2026-05-07:

- `ADMIN_IMPERSONATION_ENABLED` missing from local env
- `ADMIN_IMPERSONATION_EMAILS` missing from local env
- dedicated Clerk test-user env missing from local env

## Interfaces and Dependencies

This plan depends on Clerk Backend `actorTokens.create`, Clerk frontend ticket sign-in, Clerk session actor claims, the Clerk `convex` JWT template exposing `{{session.actor}}`, Convex hosted auth identity, Convex schema/codegen, existing product access/workspace ownership by `clerkUserId`, the workspace shell, protected route proxy, Stripe checkout routes, Codex app-server routes, generated codebase download route, Program packet docs, and release-proof discipline.
