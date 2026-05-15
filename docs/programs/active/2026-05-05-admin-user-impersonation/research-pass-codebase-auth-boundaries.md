---
title: Codebase Auth Boundaries Research Pass
summary: Local codebase findings for the Admin User Impersonation Program.
docType: program_research
status: active
read_when:
  - Re-entering the impersonation Program from local auth, Convex, UI, or audit code.
---

# Codebase Auth Boundaries Research Pass

## Scope

This pass consolidates the five read-only codebase explorer tracks run on 2026-05-05:

- identity and admin model
- backend authorization
- frontend session and support UI
- side effects and audit
- validation and release proof

## Findings

The app is Clerk-backed. `apps/web/app/layout.tsx` installs `ClerkProvider`, `apps/web/platform/convex/convex-client-provider.tsx` bridges Clerk into Convex, `apps/web/convex/auth.config.ts` configures Clerk as the Convex auth provider, and `apps/web/proxy.ts` handles protected route behavior.

Server-side product access goes through `apps/web/platform/auth/convex-auth.ts` and `apps/web/platform/access/product-access.ts`. Convex authorization helpers derive the current viewer from `ctx.auth.getUserIdentity()` and treat `identity.subject` as the Clerk user id.

There is no active admin role model. No runtime code currently treats `me@parkerrex.com` as a super admin, and there is no users table, accounts table, support session table, admin table, or impersonation UI.

Customer-owned state is keyed through `clerkUserId` across product access grants, workspace projects, generated codebase workflow state, lesson state, Codex connections/runs, checkout claims, and several managed integration paths. The support-mode design should preserve customer ownership by making the Clerk session subject the customer while retaining the admin actor for audit.

The protected app shell has clean UI insertion points. `apps/web/app/(protected)/_components/app-shell.tsx` can host a persistent top bar above the shell header. Header and account-menu components can host an admin-only entry point without faking Clerk's `useUser()` result.

Existing audit is narrow and inconsistent for this feature. Managed GitHub audit stores an `actorClerkUserId`, workspace runner events are runner-centric, and incident-style records use a single user field. Support mode needs an explicit append-only audit ledger or a shared actor metadata helper before broad customer-impacting mutations are allowed.

Side-effect surfaces need classification. Checkout/session recovery, Clerk email/user operations, Codex account operations, managed GitHub, generated codebase workflows, PostHog events, and notification-style paths should not silently behave as ordinary customer actions when an admin actor is present.

## Implications

The first implementation slice should not start with broad UI. It should establish the actor/subject contract, provider configuration assumptions, a backend parser/helper for actor claims, and a minimal audit record shape.

The app should avoid public Convex functions that accept arbitrary target user ids. A request to impersonate should start from an admin-only server boundary that creates a Clerk actor token for a selected Clerk user.

Because `clerkUserId` already models ownership, the customer view can work with existing authorization once the browser is signed into the actor-token session. The main backend gap is actor visibility and audit, not customer data access.

## Suggested Validation Surface

Focused validation should include:

- auth helper tests for admin allow/deny behavior
- actor-claim parsing tests for Convex identity tokens
- audit schema/model tests for actor and subject recording
- route/action tests for impersonation start and stop boundaries
- UI tests for persistent support-mode visibility
- end-to-end browser proof that the customer workspace is visible while support mode is marked
