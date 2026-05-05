---
title: Clerk Convex Impersonation Primitives Research Pass
summary: External provider and UI-pattern findings for the Admin User Impersonation Program.
docType: program_research
status: active
read_when:
  - Checking whether Clerk or Convex ships an impersonation primitive.
  - Revalidating the support-mode UI pattern.
---

# Clerk Convex Impersonation Primitives Research Pass

## Questions

1. Does Convex ship a first-party impersonation template, or does Clerk provide an impersonation primitive?
2. Are there established UI patterns for admin user impersonation that fit this product?

## Provider Findings

Clerk provides the relevant primitive. Clerk's impersonation guide describes actor tokens and an `act` claim that identifies the admin actor while the session is active as the impersonated user. Clerk's Next.js custom-flow guide documents creating an actor token on the backend, signing in with the returned token on the frontend, and setting the new session active.

Clerk exposes impersonation state on the frontend through `useAuth().actor` and on the backend through `auth().actor`. For custom JWT templates, Clerk documents adding `{{session.actor}}` so the actor claim is included in generated JWTs.

Convex does not appear to ship a first-party impersonation template. Convex's Clerk integration accepts Clerk-issued JWTs, and its custom auth docs explain that Convex functions can read identity information from the token. The practical path is to include Clerk's actor claim in the Clerk `convex` JWT template and parse it from Convex identity data.

Better Auth and Better Convex have admin impersonation examples, but they are not the right foundation for this repo because the active stack is Clerk plus Convex, not Better Auth.

## UI Pattern Findings

Common admin impersonation patterns include:

- an admin-only user search/list where the admin starts impersonation
- a persistent warning or support bar while impersonation is active
- a clear `Stop impersonating` action
- visible customer identity, usually the customer's email
- optional reason capture before the session starts
- special handling for risky writes or outbound side effects

Sigma and Docebo both present impersonation as an explicit admin/support operation with visible in-session state and a stop/exit control. The pattern maps well to Ship by Sunday's workspace shell: a top support bar should be visible on every workspace screen while the actor-token session is active.

## Sources

- Clerk impersonation guide: `https://clerk.com/docs/guides/users/impersonation`
- Clerk custom Next.js user impersonation flow: `https://clerk.com/docs/nextjs/guides/development/custom-flows/account-updates/user-impersonation`
- Convex Clerk auth docs: `https://docs.convex.dev/auth/clerk`
- Convex custom auth docs: `https://docs.convex.dev/auth/advanced/custom-auth`
- Sigma impersonation docs: `https://help.sigmacomputing.com/docs/impersonate-users`
- Docebo impersonation docs: `https://help.docebo.com/hc/en-us/articles/360020125239-Impersonating-a-user`

## Recommendation

Use Clerk actor tokens. Do not build a custom effective-user session table as the source of truth. Convex should remain customer-subject authorized and become actor-aware for audit and policy by receiving Clerk's actor claim.
