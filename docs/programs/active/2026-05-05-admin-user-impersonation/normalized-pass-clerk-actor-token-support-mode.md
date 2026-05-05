---
title: Clerk Actor Token Support Mode Normalized Pass
summary: Normalized implementation direction for admin user impersonation.
docType: program_normalized_pass
status: active
read_when:
  - Translating impersonation research into an implementation plan.
---

# Clerk Actor Token Support Mode Normalized Pass

## Target Model

Support mode is a Clerk actor-token session. The effective user is the customer. The actor is Parker's admin identity. Convex authorization continues to operate on the customer subject, and audit/policy logic reads the actor when present.

## Required Contracts

Only `me@parkerrex.com` can create an impersonation session.

The admin entry point must identify the target Clerk user from a trusted server boundary. Client state can search or select, but the backend decides whether the actor token may be created.

The Clerk `convex` JWT template must include the session actor claim. This is external provider setup and must be documented in the implementation slice that depends on it.

Convex code needs a small, named support-mode boundary that returns:

- real actor Clerk user id
- real actor email when present
- effective subject Clerk user id
- impersonation status
- raw actor claim validation result

The app shell should show support mode from Clerk's actor state, not from an untrusted local toggle.

Audit should record actor and subject together on customer-impacting support-mode writes. The audit record should include the action, reason or session note when available, Convex function or route, result, and changed ids where practical.

## Non-Goals

Do not build a general admin role-management system in the first pass.

Do not replace Clerk with a custom auth layer.

Do not introduce user-selectable target ids into ordinary Convex queries or mutations.

Do not fake Clerk's user object in React. Customer-facing views should naturally render from the active customer session, while the support bar separately names the impersonation state.

Do not silently allow external side effects that can confuse customers, billing, analytics, or provider state.

## First Slice Shape

The first child ExecPlan should implement the support-mode foundation:

- admin-only route or server action to create a Clerk actor token
- frontend start and stop plumbing for the actor-token session
- Convex actor-claim parsing and tests
- append-only audit schema/helper for support-mode events
- provider setup docs for the Clerk Convex JWT template
- minimal proof that start, actor visibility, audit, and stop work
