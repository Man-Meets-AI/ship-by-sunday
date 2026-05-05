---
title: Dependency Graph
summary: Ordering dependencies for the Admin User Impersonation Program.
docType: program_dependency_graph
status: active
read_when:
  - Deciding which admin impersonation slice should run next.
---

# Dependency Graph

## Root Decision

Impersonation uses Clerk actor tokens. Convex remains authorized as the customer subject and records the admin actor when support mode is active.

## Dependency Edges

The foundation/schema/provider contract comes first. Clerk provider setup, environment gates, Convex session/audit schema, actor parsing, status modeling, and kill-switch behavior must exist before UI handoff or mutation policy depends on them.

Clerk provider setup comes before Convex audit proof. The Clerk `convex` JWT template must expose the actor claim before Convex can reliably distinguish actor from subject.

The admin-only start boundary comes before UI polish. A selector is only safe after the backend can prove the current actor is allowed to mint an actor token.

Actor/subject parsing comes before mutation policy. Mutation classification needs a stable helper so every policy decision records the same support-mode metadata.

The append-only audit model comes before broad customer-impacting actions. Support-mode writes should not spread across workflow, checkout, Codex, or managed GitHub surfaces before there is one durable place to record actor/subject evidence.

The start/stop UI proof depends on the foundation contract. `/admin/impersonation`, actor-token handoff, support bar, stop flow, and history should not invent their own actor/session/status logic.

The persistent support bar comes before deeper support workflows. Every impersonated screen must visibly identify the customer and provide an exit control before the feature is usable in production.

Side-effect policy comes before complete release proof. The release proof must know which support-mode actions are allowed, blocked, confirmed, or audited.

Real-provider proof comes before production enablement. Mocked tests can cover logic, but one configured non-production Clerk actor-token proof must show actor claim propagation and session handoff.

Docs and external setup records move with the slice that introduces the dependency. Clerk dashboard or JWT-template requirements cannot live only in chat.

## Blocking Risks

If Convex cannot see the actor claim, support-mode writes can look identical to ordinary customer writes.

If the UI starts from a client-trusted email or target id, an admin-only feature can become a user-switching vulnerability.

If side effects are not classified, support debugging can create billing sessions, external provider mutations, or analytics events that are hard to explain later.

If stop flow only hides the bar, the browser may remain in the customer actor-token session.
