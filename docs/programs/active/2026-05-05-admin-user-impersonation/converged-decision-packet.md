---
title: Converged Decision Packet
summary: Final initiative decision for the Admin User Impersonation Program.
docType: program_decision
status: active
read_when:
  - Checking why admin impersonation should use Clerk actor tokens.
---

# Converged Decision Packet

The Program will implement admin user impersonation through Clerk actor tokens.

Clerk is the source of truth for the impersonated browser session. During impersonation, the active session subject is the customer and the actor claim identifies Parker's admin identity. This lets the app experience the customer's actual permissions and data without passing target user ids through ordinary product functions.

Convex should stay customer-subject authorized and become actor-aware. The Clerk `convex` JWT template must include the session actor claim so Convex functions can record support-mode audit metadata and enforce side-effect policy.

The first implementation slice should build the foundation: admin-only start boundary, actor-token session handoff, stop flow, Convex actor parsing, audit model, provider setup docs, and minimal proof. Broad selector UI and mutation-by-mutation side-effect policy should follow after the actor/subject contract is proved.

The final product behavior should be unmistakable: Parker can enter a customer session, the workspace renders as the customer, a persistent top bar says which customer is being impersonated, and support-mode writes can later be attributed to both actor and subject.
