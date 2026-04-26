# Cross-Repo Review

## References Checked

The comparison used the current GitHub repository trees for:

- https://github.com/workos/next-b2b-starter-kit
- https://github.com/hackerai-tech/hackerai
- https://github.com/nextjs/saas-starter
- https://github.com/sonnysangha/ticket-marketplace-saas-nextjs15-convex-clerk-stripe-connect
- https://github.com/get-convex/convex-saas

No reference code was copied.

## Transferable Lessons

Route-first structure is the common pattern for smaller Next.js SaaS apps. WorkOS
uses `convex`, `src/app`, `src/actions`, and middleware. Next's SaaS starter uses
`app/(dashboard)`, `app/(login)`, `app/api`, `components`, and `lib`.

Larger Convex apps can keep backend code in `convex` without a feature folder
being the only product map. HackerAI uses top-level `app`, `components`,
`convex`, `hooks`, `lib`, `packages`, and `types`.

Stripe and billing become easier to audit when the public HTTP entrypoint,
Stripe SDK/client helper, webhook persistence, and release/operator scripts each
have an obvious home.

Convex should be treated as a backend application boundary, not as a dumping
ground for UI-adjacent helpers. Convex modules should import backend-safe domain
code.

## What Does Not Transfer

Ship by Sunday has a blueprint compiler package, generated customer-facing docs,
release proof, Program/ExecPlan planning contracts, hosted Vercel deployment,
Clerk auth, Convex hosted dev/prod, and Stripe entitlement proof. The reference
projects do not replace those repo-specific contracts.

WorkOS is small enough that it does not need a feature/domain layer like this
repo currently does.

Next's SaaS starter is not a Convex architecture model because it uses
Postgres/Drizzle.

The ticket marketplace reference matters only if marketplace or Stripe Connect
flows become relevant.

Convex SaaS is not a Next.js App Router structure model.

## Review Conclusion

The reference projects support a route-visible, backend-clear architecture, but
they do not justify deleting `features/` in one pass. The better move is a
disciplined hybrid: App Router for route ownership, Convex for backend state,
platform for external I/O, shared UI for primitives, and feature folders only
for durable cross-route product domains.
