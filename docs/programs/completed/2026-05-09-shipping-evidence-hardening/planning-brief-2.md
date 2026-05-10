---
title: Shipping Evidence Convex Billing Runtime Planning Brief 2
program_id: shipping-evidence-hardening
brief_version: 2
status: current
summary: Second planning brief for Convex access, Stripe webhook, and billing runtime evidence hardening.
read_when:
  - Writing or resuming the Convex and billing runtime child ExecPlan.
  - Changing checkout, webhook, entitlement, or Convex product-access proof.
---

# Shipping Evidence Convex Billing Runtime Planning Brief 2

Create the next child ExecPlan for the Convex and billing runtime hardening slice. This slice should improve evidence around the real money/access handoff without turning every pull request into a hosted provider run.

Start with cheap, deterministic hardening around the current app contract. The current persisted identity key is the Clerk user id stored as `clerkUserId`. Convex currently derives that value from `identity.subject`, while Stripe metadata and Next.js route logic also use Clerk `auth().userId`. Do not directly switch entitlement reads to `identity.tokenIdentifier`; that would orphan existing `productAccessGrants`, pending checkout claims, workspace rows, course state, Codex rows, and impersonation state. Instead, characterize the current Clerk-id contract with tests that include a distinct `tokenIdentifier` so a future migration must be deliberate and dual-read.

Close the low-risk secret-validation mismatch first. Next.js already requires `CHECKOUT_FULFILLMENT_RETRY_SECRET` to be at least 32 characters, docs say the same, but Convex currently accepts any non-empty value. Update Convex env validation and tests so both runtimes fail closed on weak retry secrets.

Harden the webhook path around delayed payments and duplicate/out-of-order delivery. The signed-in webhook branch must not grant access for an unpaid `checkout.session.completed`; it should wait for `checkout.session.async_payment_succeeded` just like the guest branch does. Pending payment events should return a successful Stripe response without access grant or failure incident so Stripe can send the eventual async success event. Add focused tests before broader implementation. A durable processed-event ledger is likely the next milestone, but keep it scoped and schema-backed rather than ad hoc logging.

Preserve the broke-startup cost model. Source-level unit and integration tests should run in PR CI through the existing `static` or `integration` contexts. Hosted Convex dev or Stripe card proof should remain release, manual, dev-staging, nightly, or conditional proof unless this slice proves a new check is cheap and reliable enough for every PR.

The result should answer what current runtime contract is now protected, which webhook failures are closed, which duplicate/out-of-order gaps remain, and what exact commands prove the slice. Update `program.md`, this child ExecPlan, and release/operator docs only when behavior or proof contracts change.
