---
title: Repair Paid Checkout Claims
status: active
created_at: 2026-05-02
completed_at: null
summary: Add a safe operator repair lane for paid Stripe checkout claims that did not attach to the intended account.
post_build_recap: null
read_when:
  - Repairing a paid checkout claim in production.
  - Implementing the support repair mutation.
  - Verifying a customer has access after a Stripe purchase.
---

# Repair Paid Checkout Claims

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

A customer can pay through Stripe while signed out, then fail to receive product access because the paid checkout claim is waiting for an account with the same verified email. After this plan is implemented, support can repair that exact state without ad hoc database edits: the operator identifies the paid pending claim, selects the production Clerk user that should own it, runs one internal repair operation, and verifies the grant and claim state in Convex.

The user-visible result is simple. A paid customer who was stuck at the access gate can open the protected workspace after support repairs the claim. The durable result is that future repairs are auditable, idempotent, and constrained to already-paid Stripe checkout claims.

## Progress

- [x] 2026-05-02: Authored this ExecPlan from the live checkout incident research.
- [x] 2026-05-02: Added `checkoutClaims:repairPaidCheckoutClaim` as an internal-only support mutation that validates the stored claim, checkout email, paid payment status, and claim ownership before upserting Stripe-sourced access and marking the claim claimed by the target Clerk user.
- [x] 2026-05-02: Added focused unit tests for successful repair, repeat idempotent repair, missing claim, mismatched checkout email, non-paid defensive state, and an already claimed claim owned by a different Clerk user.
- [x] 2026-05-02: Ran the focused checkout claim unit test file successfully with 13 passing tests, plan lint, markdown lint, `git diff --check`, and `bun lint`. After all parallel slices landed, the coordinator reran the checkout/access unit suite successfully with 10 files and 68 passing tests, plus the checkout/access integration-ui and route tests with 6 files and 28 passing tests.
- [x] 2026-05-02: Added `apps/web/scripts/repair-paid-checkout-customer.mjs`, an operator script that resolves or creates the production Clerk user for the checkout email, then runs `checkoutClaims:repairPaidCheckoutClaim` against production Convex. Added `apps/web/tests/unit/repair-paid-checkout-customer.test.ts` with 6 passing tests.
- [ ] 2026-05-02: Run the repair for the affected production customer after identifying the intended production Clerk user.
- [ ] 2026-05-02: Record production verification evidence without committing customer personal data.

## Surprises & Discoveries

The live incident did not look like a Stripe webhook crash. Convex stored a paid pending checkout claim, but no `productAccessGrants` row existed for that payment. That means the payment path saved the handoff state, while the account-claim path never attached it to a Clerk user.

The local Clerk secret available in the development environment did not resolve production Clerk user IDs already present in Convex. Treat local Clerk lookups as non-authoritative for production repairs unless the environment is explicitly proven to be the production Clerk instance.

The current Convex schema only represents `paid` and `no_payment_required` checkout claims. The repair mutation still includes a defensive `payment_not_paid` refusal branch so imported, legacy, or otherwise invalid stored data cannot be repaired silently.

## Decision Log

Decision: Add a narrow internal Convex repair mutation instead of telling operators to run `access:grantProductAccess` directly.
Rationale: `access:grantProductAccess` can create the access grant, but it does not mark the related `pendingCheckoutClaims` row as claimed. A dedicated repair mutation can validate the paid claim, upsert the grant, patch the claim, and return one structured result.
Date: 2026-05-02

Decision: Do not commit customer emails, Stripe session IDs, payment intent IDs, or Clerk user IDs into this plan.
Rationale: The plan should be durable operator procedure, not a customer-data ledger. Operators can retrieve live identifiers from Stripe, Convex, and Clerk at repair time.
Date: 2026-05-02

## Outcomes & Retrospective

The local support repair lane is implemented but this ExecPlan remains active until the production claim is repaired and verified. Worker 1 added the internal repair mutation and focused unit tests, and proved the local slice with `bun run --cwd apps/web vitest run tests/unit/checkout-claims.test.ts`, `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-paid-checkout-claim-repair.md`, `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-paid-checkout-claim-repair.md`, `git diff --check`, and `bun lint`. No production mutation was run during Worker 1's implementation pass.

After Parker clarified that access should simply work with the email used at checkout, the coordinator added `apps/web/scripts/repair-paid-checkout-customer.mjs`. The script takes the checkout email and Stripe checkout session id, looks up the matching Clerk user in the loaded Clerk instance, optionally creates a passwordless Clerk user for that email when `--create-clerk-user` is present, and then runs the production Convex repair mutation. The new script is covered by `apps/web/tests/unit/repair-paid-checkout-customer.test.ts`.

The coordinator reran the combined checkout/access unit suite after all parallel slices landed:

    bun run --cwd apps/web vitest run tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/checkout-session.test.ts tests/unit/course-access.test.ts tests/unit/access-required-page.test.tsx tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-execute-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/app-protected-layout.test.tsx
    Test Files  10 passed (10)
    Tests  68 passed (68)

The coordinator also reran checkout/access integration and route coverage:

    bun run --cwd apps/web vitest run tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration/stripe-checkout-route.test.ts tests/unit/checkout-session-params.test.ts
    Test Files  6 passed (6)
    Tests  28 passed (28)

Official `bun typecheck` was not rerun in its normal production-build mode after all slices because this local environment has PostHog source-map upload configured during `next build`. A `NODE_ENV=development` attempt is not a valid repo gate; it completed TypeScript and then failed during static prerender under the nonstandard environment. Targeted formatting for the touched files passed, as did plan lint, markdown lint, `bun lint`, and `git diff --check`.

## Context and Orientation

The product access system lives in `apps/web/convex/access.ts`, `apps/web/convex/access/model.ts`, and `apps/web/convex/checkoutClaims.ts`. A `productAccessGrants` row is what unlocks the product for a Clerk user. A `pendingCheckoutClaims` row is a paid Stripe checkout that does not yet have a user attached.

The webhook in `apps/web/convex/stripeWebhook.ts` writes a pending claim when Stripe reports a paid checkout session that has an email but no Clerk user id. The recovery flow in `apps/web/convex/checkoutClaimsActions.ts` and `apps/web/platform/access/product-access.ts` later claims that pending row only when the signed-in Clerk identity has the same verified email.

The current claim mutation, `claimPendingCheckoutClaim` in `apps/web/convex/checkoutClaims.ts`, uses the signed-in viewer identity. That is correct for self-service account recovery, but support needs a separate internal lane that repairs a known paid checkout claim for a specific Clerk user after human verification.

### In Scope

Add a new internal Convex mutation in `apps/web/convex/checkoutClaims.ts` that repairs one paid pending checkout claim by Stripe checkout session id and target Clerk user id. Add tests in `apps/web/tests/unit/checkout-claims.test.ts`. Document the operator command and verification sequence in this plan and, if implementation creates a reusable support workflow, in the nearest internal runbook.

### Out Of Scope

Do not change checkout UX in this plan. Do not change whether signed-out checkout is allowed. Do not create a public endpoint for repairs. Do not grant access from an email alone. Do not store customer emails or live payment IDs in source-controlled docs. Do not query or mutate Clerk users from Convex unless a separate plan owns that integration.

## Plan of Work

In `apps/web/convex/checkoutClaims.ts`, add a new return validator for repair results. The result should distinguish `repaired`, `already_claimed_by_target`, `claimed_by_other_user`, `missing_claim`, `payment_not_paid`, and `checkout_email_mismatch`. The mutation should be internal-only, not public.

The mutation should accept `stripeCheckoutSessionId`, `checkoutEmail`, and `clerkUserId`. It should normalize `checkoutEmail` with the existing `normalizeCheckoutEmail` helper, load the pending claim by `stripeCheckoutSessionId`, and fail closed if no claim exists. It should require the stored normalized checkout email to match the provided normalized email. It should require `paymentStatus` to be `paid` or `no_payment_required`, matching the existing schema. If the claim is already claimed by another Clerk user, return `claimed_by_other_user` without changing data.

When the claim is pending or already claimed by the target Clerk user, the mutation should call the existing `upsertProductAccessGrant` helper with `source: "stripe_checkout"` and the Stripe ids already stored on the claim. Then it should patch the claim with `status: "claimed"`, `claimedByClerkUserId`, `claimedAt`, and `updatedAt`. The mutation must be idempotent: rerunning it with the same inputs should patch the grant and return an already-claimed-by-target result rather than creating duplicate state.

In `apps/web/tests/unit/checkout-claims.test.ts`, extend the existing in-memory Convex context fixtures instead of adding a new test harness. Cover the successful repair, repeat repair, missing claim, mismatched checkout email, and claim already owned by another user. Assert that `upsertProductAccessGrant` receives the Stripe checkout session id and payment intent id from the claim, not from operator input.

After deployment, repair the current production incident only after a production Clerk user id has been identified from the Clerk production dashboard or another trusted production-admin surface. The operator should then run the internal mutation through Convex production and verify `productAccessGrants` and `pendingCheckoutClaims`.

## Milestones

Milestone 1 creates the repair mutation and unit tests. Success means local tests prove the mutation refuses unsafe states and repairs one paid pending claim without duplicating rows.

Milestone 2 documents and dry-runs the operator command with placeholder values. Success means an operator can identify exactly which values are required, where to retrieve them, and how to avoid committing them.

Milestone 3 repairs the affected production claim. Success means Convex production has a granted product access row for the target Clerk user and the matching pending checkout claim is marked claimed by that same user.

## Concrete Steps

Start from the repo root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Read the relevant code before editing:

    sed -n '1,340p' apps/web/convex/checkoutClaims.ts
    sed -n '1,220p' apps/web/convex/access/model.ts
    sed -n '1,340p' apps/web/tests/unit/checkout-claims.test.ts

Implement the internal mutation in `apps/web/convex/checkoutClaims.ts`. Keep the mutation close to `claimPendingCheckoutClaim` because it uses the same table and grant helper, but give it a support-specific name such as `repairPaidCheckoutClaim`.

Run the focused tests:

    bun run --cwd apps/web vitest run tests/unit/checkout-claims.test.ts

Run the plan and docs checks:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-paid-checkout-claim-repair.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-paid-checkout-claim-repair.md
    git diff --check

After the code is deployed to production and the target production Clerk user id is known, run the repair with live values that are not committed to source control:

    bunx convex run --prod checkoutClaims:repairPaidCheckoutClaim '{
      "stripeCheckoutSessionId": "cs_live_...",
      "checkoutEmail": "customer@example.com",
      "clerkUserId": "user_..."
    }'

If the customer does not yet have a Clerk user for the checkout email, prefer the operator script so the account and access repair happen as one support operation:

    node --env-file=.env.production apps/web/scripts/repair-paid-checkout-customer.mjs --checkout-email customer@example.com --stripe-checkout-session-id cs_live_... --create-clerk-user

If the Clerk user already exists or the operator has already identified it in the Clerk dashboard, omit `--create-clerk-user` or pass the explicit user id:

    node --env-file=.env.production apps/web/scripts/repair-paid-checkout-customer.mjs --checkout-email customer@example.com --stripe-checkout-session-id cs_live_... --clerk-user-id user_...

Then verify the production state:

    bunx convex data productAccessGrants --prod --format jsonLines
    bunx convex data pendingCheckoutClaims --prod --format jsonLines

The expected observation is one product access grant with `status` equal to `granted`, `source` equal to `stripe_checkout`, and the repaired checkout session id, plus one pending checkout claim now carrying `status` equal to `claimed` and `claimedByClerkUserId` equal to the target Clerk user.

## Validation and Acceptance

The mutation is accepted only if it cannot repair an unpaid, missing, mismatched, or already-other-owned claim. A successful repair must be observable both in unit tests and in production data after the operator command runs.

The customer repair is accepted only after the customer's target Clerk user has `productAccessGrants.status` equal to `granted` and can load the protected workspace without hitting the access-required gate. The pending claim must no longer be left in `pending` for the same session.

### Test Commands

Run these before considering the implementation complete:

    bun run --cwd apps/web vitest run tests/unit/checkout-claims.test.ts
    bun run --cwd apps/web vitest run tests/unit/repair-paid-checkout-customer.test.ts
    bun run --cwd apps/web vitest run tests/unit/convex-product-access-grant.test.ts tests/unit/course-access.test.ts
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-paid-checkout-claim-repair.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-paid-checkout-claim-repair.md
    git diff --check

## Idempotence and Recovery

The repair mutation must be safe to rerun with the same session id, checkout email, and Clerk user id. Reruns should patch timestamps and return an already-claimed-by-target result, not create duplicate grants or move a claim away from a different owner.

If the operator chooses the wrong Clerk user before running the mutation, stop and do not repair. If the mutation already repaired to the wrong Clerk user, do not run another repair over it. Escalate to a separate explicit reversal plan that reviews whether to revoke the grant, preserve audit fields, and notify the customer.

If production verification commands return multiple grants for the same Stripe checkout session id, stop and inspect `apps/web/convex/access/model.ts` before making further changes. The repair lane should not hide duplicate grant behavior.

## Artifacts and Notes

The incident pattern that motivated this plan was:

    Stripe payment status: paid
    Convex pendingCheckoutClaims.status: pending
    Convex productAccessGrants for the Stripe checkout session: none
    Application symptom: customer reaches access gate after payment

Keep live identifiers in operator notes or provider dashboards, not in this file.

## Interfaces and Dependencies

This plan depends on Convex internal mutations, the existing `pendingCheckoutClaims` schema in `apps/web/convex/schema.ts`, and the existing `upsertProductAccessGrant` helper in `apps/web/convex/access/model.ts`. It also depends on production operator access to Stripe, Clerk, and Convex. Stripe proves payment. Clerk identifies the user account to receive access. Convex performs the durable grant and claim patch.
