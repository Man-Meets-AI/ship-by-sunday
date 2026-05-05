---
title: Plan Split Recommendation
summary: Recommended child ExecPlan split for the Admin User Impersonation Program.
docType: program_plan_split
status: active
read_when:
  - Creating child ExecPlans for admin user impersonation.
---

# Plan Split Recommendation

## Slice 1: Foundation Schema And Provider Contract

Implement the environment gate, admin helper, Convex `impersonationSessions` and `impersonationAuditEvents` schema, actor-claim parsing, support-mode status read model, session pointer validation rules, kill-switch invalidation behavior, and provider setup docs. Keep this slice mostly backend and contract-focused so the foundation can be tested before UI handoff depends on it.

## Slice 2: Start Stop Minimal UI Proof

Add `/admin/impersonation`, the server-side Clerk-backed eligible customer picker, reason capture, setup-integrity warnings, final confirmation, Clerk actor-token handoff, persistent support-mode bar, stop flow, read-only history skeleton, and browser proof. The bar should render from server-validated status and should not rely on a local-only toggle.

## Slice 3: Mutation Audit And Side-Effect Policy

Classify customer-impacting Convex mutations and route handlers. Record support-mode actor/subject metadata for allowed writes and block or require explicit confirmation for risky external side effects such as billing, provider account changes, managed GitHub, Codex account operations, and outbound customer notifications.

## Slice 4: Release Proof And Operator Docs

Document Clerk dashboard setup, Convex JWT template requirements, dedicated non-production and production test customers, support-mode operating procedure, failure modes, and verification steps. Add focused release proof for start, customer view, audited action, blocked side effect where applicable, artifact download audit, stop flow, and history.

## Deferred Or Separate Work

A general admin console, multi-admin roles, customer support notes, and long-term support-session analytics are not required to ship the first safe version.
