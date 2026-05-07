---
title: Admin User Impersonation Planning Brief 2
program_id: admin-user-impersonation
brief_version: 2
status: current
summary: Finish support-mode start/stop UI, audit policy, operator docs, and release proof.
read_when:
  - Authoring the closeout child ExecPlan for the Admin User Impersonation Program.
---

# Admin User Impersonation Planning Brief 2

This closeout slice should finish the support-mode product boundary on top of the completed foundation. Reuse the existing environment gate, admin allowlist helper, Convex session and audit schema, actor-claim parser, support-mode status model, and fail-closed policy helpers. Do not replace Clerk session handling or introduce a parallel effective-user model.

Add `/admin/impersonation` as the app-managed start surface. It must be protected by Clerk, render as 404 for signed-in non-admin users, and use server-side Clerk user search rather than loading all customers into the browser. The customer picker is Clerk-first, excludes configured admin emails, requires a 10-500 character reason, shows setup-integrity warnings after selection, and requires a final confirmation before creating the actor token.

Create the Convex `impersonationSessions` row before creating the Clerk actor token. The Clerk actor token must include the admin actor `sub` plus the app-managed `impersonationSessionId` in the actor payload. The browser handoff should consume the actor-token ticket with Clerk's ticket sign-in strategy and then land on `/workspace`. Failed token creation or handoff must mark the Convex session failed where the backend has a session id.

Add a persistent support-mode bar above authenticated workspace/admin content. It should render from server/Convex-backed status, show customer email, truncated reason, time remaining, setup warnings when present, and a one-click `Stop impersonating` action. Stopping must close the Convex session record and end the active Clerk actor-token session, then land on `/admin/impersonation`.

Add admin-only read-only history on `/admin/impersonation`. V1 history should show customer email, reason, status, started/stopped/expired timing, and blocked event counts. It should not support resume or reopen.

Classify support-mode writes. Allowed audited writes are limited to ordinary in-app product state and customer setup changes that stay inside Ship by Sunday's Convex state. High-impact external side effects must be blocked while impersonating, including billing/checkout, Clerk account changes, managed GitHub mutations, Codex account operations, outbound customer notifications, customer repository operations, and destructive deletes. Blocked direct server/API paths must write support-mode audit before returning an error. Known direct UI controls should also be disabled with a support-mode reason where practical.

Customer artifact downloads are allowed if the customer is otherwise authorized, but the download attempt must be audited. Suppress ordinary customer analytics while impersonating when the touched path can identify support mode cheaply; rely on Convex audit for support-mode evidence.

Update operator docs for the complete flow, including Clerk actor-token setup, Convex JWT template `act` claim, dedicated non-production and production test customers, support workflow, failure modes, and proof commands. The Program can move to `completed/` only after the code is complete, child ExecPlans are complete, active/completed indexes are updated, and the release proof limitations are stated honestly. If the real configured Clerk proof is unavailable in this checkout, the Program document must remain active and name the exact blocker instead of claiming completion.

Focused validation should include unit tests for server helpers and Convex policy, integration-ui tests for the support bar/admin UI state, route/action tests for start/stop boundaries, `bunx convex codegen` after Convex API changes, Program/ExecPlan markdown lint, and the repo gates required by `AGENTS.md`.
