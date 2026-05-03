---
title: Resolve Paid Checkout Account Mismatches
status: active
created_at: 2026-05-02
completed_at: null
summary: Make paid-but-unclaimed checkout a first-class user state with clear account recovery instead of a generic no-access dead end.
post_build_recap: null
read_when:
  - Changing signed-out checkout behavior.
  - Improving checkout success or access-required UX.
  - Deciding how paid purchases attach to user accounts.
---

# Resolve Paid Checkout Account Mismatches

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The current product lets a person pay while signed out, then requires them to sign in with the same verified email before product access attaches. That rule is technically coherent but confusing in real life. Buyers use role inboxes, aliases, forwarded emails, or a different account than the one they later sign into. The app then says "no access" even though payment succeeded.

After this plan is implemented, paid-but-unclaimed checkout is a visible, recoverable state. The success page and access-required page should tell the buyer which checkout email owns the paid session when it is safe to reveal it, what account is currently signed in, and exactly how to finish access without buying again. The product team must also make an explicit policy decision: either require sign-in before checkout, or keep guest checkout and add an explicit account-attachment flow.

## Progress

- [x] 2026-05-02: Authored this ExecPlan from live sale research and existing checkout claim code.
- [x] 2026-05-02: Choose the product policy for future checkout account ownership. Worker 3 kept guest checkout for this slice and did not add attach-to-different-user.
- [x] 2026-05-02: Extend checkout session state to carry safe account-resolution details. `sign_in_required` and `wrong_account` can now carry `checkoutEmail` and `currentAccountEmail` only after the Stripe session is verified as this product and paid.
- [x] 2026-05-02: Update checkout success UX for sign-in-required and wrong-account states. The page names the checkout email and current signed-in email when available, warns against duplicate purchase, and points the user to the checkout account.
- [x] 2026-05-02: Update access-required UX so paid pending claims do not look like missing purchases. Server-known pending checkout recovery states now render recovery-first language and do not show the buy button.
- [x] 2026-05-02: Add tests for mismatch copy, no-double-purchase guidance, and recovery actions.
- [x] 2026-05-02: Run final validation for plan lint, markdown lint, diff hygiene, and any remaining focused interaction tests. Full `bun run format:check` still fails on two unrelated pre-existing files outside this slice; touched files pass targeted `oxfmt --check`.

## Surprises & Discoveries

The previous completed buy-first checkout plan intentionally chose signed-out checkout plus exact verified-email claiming. The current incident shows that this rule is too implicit for real customers. It creates a support burden even when the data model is doing what it was designed to do.

The current checkout success view has states for `sign_in_required` and `wrong_account`, but the view model does not carry the actual checkout email or current signed-in email. Copy says "same email" and "different account" without giving the buyer enough concrete information to self-correct.

Worker 3 found that access-required already had some recovery language, but `getServerProductAccess` discarded known wrong-account results from checkout claim recovery and returned generic `no_access`. Preserving that recovery detail lets the workspace gate avoid presenting the state as a missing purchase.

## Decision Log

Decision: Treat paid-but-unclaimed as a product state, not as generic no-access.
Rationale: Payment success and account mismatch require different user guidance from "you have not purchased." Mixing them encourages duplicate purchases and support tickets.
Date: 2026-05-02

Decision: The implementation must choose one account-ownership policy before changing copy.
Rationale: UX copy depends on whether the app requires checkout-account email equality or allows a paid session to be attached to a different signed-in account after explicit confirmation.
Date: 2026-05-02

Decision: Keep guest checkout for this slice, require exact checkout-email account resolution, and do not add attach-to-different-user yet.
Rationale: This is the smallest safe policy change for the incident. It preserves the existing buy-first funnel while making the current exact-email claiming rule explicit, concrete, and hard to mistake for a missing purchase. Cross-account attachment needs a deliberate verification and audit design before it can safely ship.
Date: 2026-05-02

Decision: Reveal `checkoutEmail` only after the Stripe session is valid, paid or no-payment-required, and belongs to this product.
Rationale: The success URL is sensitive recovery evidence. Invalid sessions, sessions for other products, and unpaid sessions must not disclose a buyer email.
Date: 2026-05-02

## Outcomes & Retrospective

Worker 3 completed the paid account-resolution UX slice. Checkout session and Convex claim results now carry safe email details for `sign_in_required` and `wrong_account` states, checkout success copy tells buyers which email owns the paid checkout and which account is currently signed in when known, wrong-account checkout success signs the current account out before sending the buyer to sign in with the checkout email, and access-required uses server-known pending checkout recovery details before generic no-access purchase actions. The implementation intentionally does not attach a paid checkout to a different signed-in account.

Validation passed:

    bun run --cwd apps/web vitest run tests/unit/checkout-session.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/course-access.test.ts
    bun run --cwd apps/web vitest run tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/access-required-page.test.tsx
    bun run --cwd apps/web vitest run tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx
    bun run --cwd apps/web vitest run tests/integration/stripe-checkout-route.test.ts tests/unit/checkout-session-params.test.ts
    bun run --cwd apps/web vitest run tests/unit/checkout-claims.test.ts tests/unit/access-required-page.test.tsx
    bun lint
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-paid-checkout-account-resolution.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-paid-checkout-account-resolution.md
    git diff --check -- apps/web/platform/billing/checkout/checkout-session.ts apps/web/platform/billing/checkout/checkout-session-recovery.ts apps/web/convex/checkoutClaimsActions.ts apps/web/app/checkout/success/_lib/checkout-success-view-model.ts apps/web/app/checkout/success/_components/checkout-success-cta-row.tsx "apps/web/app/(workspace)/_lib/access-required-view-model.ts" "apps/web/app/(workspace)/_hooks/use-access-required-controller.ts" apps/web/lib/product-access.ts apps/web/platform/access/product-access.ts apps/web/tests/unit/checkout-session.test.ts apps/web/tests/unit/checkout-claims-actions.test.ts apps/web/tests/unit/course-access.test.ts apps/web/tests/integration-ui/checkout-success-view.test.tsx apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx apps/web/tests/integration-ui/access-required-page.test.tsx

Validation limitation: `bun run format:check` fails only on `apps/web/app/(workspace)/_components/course/lesson/shells/coach-panel-motion.tsx` and `apps/web/app/(workspace)/_components/course/lesson/shells/objective-task-row.tsx`, which are outside this plan and were not touched by Worker 3. The touched files passed:

    bunx oxfmt -c .oxfmtrc.json --check apps/web/app/checkout/success/_components/checkout-success-cta-row.tsx apps/web/app/checkout/success/_lib/checkout-success-view-model.ts "apps/web/app/(workspace)/_hooks/use-access-required-controller.ts" "apps/web/app/(workspace)/_lib/access-required-view-model.ts" apps/web/platform/billing/checkout/checkout-session.ts apps/web/platform/billing/checkout/checkout-session-recovery.ts apps/web/convex/checkoutClaimsActions.ts apps/web/lib/product-access.ts apps/web/platform/access/product-access.ts apps/web/tests/unit/checkout-session.test.ts apps/web/tests/unit/checkout-claims-actions.test.ts apps/web/tests/unit/course-access.test.ts apps/web/tests/integration-ui/checkout-success-view.test.tsx apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx apps/web/tests/integration-ui/access-required-page.test.tsx

Implementation note: `bun typecheck` runs the app's Next production build. An initial run passed before the final wrong-account sign-out CTA change, but this local environment also ran the configured PostHog source-map upload step during that build. Worker 3 did not rerun the official typecheck after the CTA change to avoid another external source-map upload. Attempts to disable that upload with blank PostHog env failed during config load, and a `NODE_ENV=development` build is not a valid repo gate. The focused Vitest suites and `bun lint` passed after the CTA change. No Stripe or Convex production mutations were run by this slice.

Coordinator validation after all parallel slices landed:

    bun run --cwd apps/web vitest run tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/checkout-session.test.ts tests/unit/course-access.test.ts tests/unit/access-required-page.test.tsx tests/unit/app-workspace-blueprint-review-routes.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-execute-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/app-protected-layout.test.tsx
    Test Files  10 passed (10)
    Tests  68 passed (68)

    bun run --cwd apps/web vitest run tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration/stripe-checkout-route.test.ts tests/unit/checkout-session-params.test.ts
    Test Files  6 passed (6)
    Tests  28 passed (28)

    bun lint
    Found 0 warnings and 0 errors.

    bunx oxfmt -c .oxfmtrc.json --check <touched files>
    All matched files use the correct format.

    git diff --check
    Passed.

## Context and Orientation

Checkout starts in `apps/web/app/api/stripe/checkout/route.ts`. That route allows signed-out checkout. `apps/web/platform/billing/checkout/checkout-session-params.ts` sends a Clerk user id to Stripe only when the buyer is signed in. When the buyer is signed out, the Stripe checkout session can still carry `customer_details.email` after payment.

Stripe webhooks in `apps/web/convex/stripeWebhook.ts` grant access immediately when a Clerk user id is present. When no Clerk user id is present, the webhook saves a `pendingCheckoutClaims` row in Convex with the checkout email.

The recovery path in `apps/web/convex/checkoutClaimsActions.ts` and `apps/web/platform/billing/checkout/checkout-session.ts` tries to claim that pending checkout for the current signed-in user. `claimPendingCheckoutClaim` in `apps/web/convex/checkoutClaims.ts` only succeeds when the signed-in user's verified email exactly matches the checkout email.

The checkout success UI is built from `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts` and rendered by components under `apps/web/app/checkout/success/_components/`. The access gate UI is built from `apps/web/app/(workspace)/_lib/access-required-view-model.ts` and rendered by `apps/web/app/(workspace)/_components/access-required/`.

### In Scope

Make a policy decision for future checkouts. Then update the checkout/session state, success page, access-required page, and tests so paid-but-unclaimed purchases are explicit and recoverable. Include no-double-purchase guidance wherever a paid pending claim is known or strongly suspected.

### Out Of Scope

Do not add the operator repair mutation here; that belongs to `docs/exec-plans/active/2026-05-02-paid-checkout-claim-repair.md`. Do not fix protected workspace route throws here; that belongs to `docs/exec-plans/active/2026-05-02-workspace-access-guard-hardening.md`. Do not add a broad customer support dashboard. Do not expose arbitrary pending claims by email to unauthenticated users.

## Plan of Work

First decide the product policy.

The conservative option is to require sign-in before checkout. That means changing `apps/web/app/api/stripe/checkout/route.ts` so signed-out users are sent to sign in or sign up before Stripe checkout begins. It reduces conversion friction less elegantly, but it eliminates the role-email mismatch for future purchases because every paid session carries a Clerk user id.

The flexible option is to keep guest checkout and add explicit account attachment. In that model, a buyer who lands on `/checkout/success?session_id=...` while signed in as a different verified email sees the checkout email and current account email. They can either switch to the checkout email account or explicitly attach the paid session to the current account. If this option is chosen, the attach action must be deliberate and auditable, because the Stripe success URL becomes evidence for account ownership. A safer version requires the buyer to verify the checkout email before attaching to a different account.

After the policy is chosen, extend the checkout state contract in `apps/web/platform/billing/checkout/checkout-session.ts` and the Convex action return types in `apps/web/convex/checkoutClaimsActions.ts` so `sign_in_required` and `wrong_account` can carry safe details. For a paid guest checkout session, the state should include `checkoutEmail` when the session id is valid, paid, and belongs to the product. For wrong-account states, include the signed-in account email when available. Do not reveal checkout email for invalid sessions.

Update `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts` so the mismatch states are concrete. The copy should say that payment succeeded for the checkout email, name the currently signed-in email when known, warn not to buy again, and provide the right action: sign in or create account with the checkout email, switch accounts, or explicitly attach access if that policy is chosen.

Update `apps/web/app/(workspace)/_lib/access-required-view-model.ts` and the controller under `apps/web/app/(workspace)/_hooks/use-access-required-controller.ts` so access-required can distinguish generic no-access from known paid pending claim states. If the browser has a pending checkout session cookie or the server can identify a latest pending claim for the signed-in verified email, the UI should prefer recovery language over purchase language. Do not present "Buy access now" as the primary action while the app knows a paid claim exists.

Add tests in `apps/web/tests/unit/checkout-session.test.ts`, `apps/web/tests/unit/checkout-claims-actions.test.ts`, `apps/web/tests/integration-ui/checkout-success-view.test.tsx`, and `apps/web/tests/integration-ui/access-required-page.test.tsx`. The tests should prove that paid wrong-account and sign-in-required states show the checkout email, warn against duplicate purchase, and provide recovery actions.

## Milestones

Milestone 1 records the checkout account-ownership decision in this plan's Decision Log and updates the relevant source comments or docs if the behavior becomes durable operator knowledge. Success means implementers no longer have to infer whether guest checkout is still intended.

Milestone 2 extends the data contracts. Success means checkout session state and Convex action return values can represent paid checkout email and current account email without leaking details for invalid sessions.

Milestone 3 updates `/checkout/success`. Success means sign-in-required and wrong-account states are concrete enough for a buyer to understand which email owns the paid checkout and how to finish access without paying again.

Milestone 4 updates the workspace access-required flow. Success means known paid pending claims render recovery-first guidance and duplicate-purchase actions are demoted or hidden.

Milestone 5 validates the full account-resolution flow. Success means tests prove the selected policy and a manual or automated smoke shows a paid guest checkout can be resolved without support.

## Concrete Steps

Start from the repo root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Read the current checkout and claim flow:

    sed -n '1,180p' apps/web/app/api/stripe/checkout/route.ts
    sed -n '1,220p' apps/web/platform/billing/checkout/checkout-session.ts
    sed -n '1,420p' apps/web/convex/checkoutClaimsActions.ts
    sed -n '1,320p' apps/web/app/checkout/success/_lib/checkout-success-view-model.ts
    sed -n '1,360p' "apps/web/app/(workspace)/_lib/access-required-view-model.ts"

Choose the policy and record it in the Decision Log before editing code. If sign-in-before-checkout is chosen, update checkout route tests around signed-out checkout. If guest checkout remains, add the explicit account-resolution state fields and actions.

Run focused tests as the contracts change:

    bun run --cwd apps/web vitest run tests/unit/checkout-session.test.ts tests/unit/checkout-claims-actions.test.ts
    bun run --cwd apps/web vitest run tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
    bun run --cwd apps/web vitest run tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx

After implementation, run the checkout route tests and broader gates:

    bun run --cwd apps/web vitest run tests/integration/stripe-checkout-route.test.ts tests/unit/checkout-session-params.test.ts
    bun run format
    bun lint
    bun typecheck

## Validation and Acceptance

The selected account policy must be obvious from behavior and tests. A buyer who paid as one email and signs in as another should no longer see generic no-access language. They should see payment-aware account-resolution guidance and should not be pushed toward another checkout.

If sign-in-before-checkout is chosen, signed-out checkout attempts must route through auth before Stripe and Stripe sessions must carry a Clerk user id. If guest checkout remains, `/checkout/success` must reveal the checkout email only for a valid paid product session, show the current signed-in email when available, and provide an explicit recovery or attach action.

### Test Commands

Run these before considering the implementation complete:

    bun run --cwd apps/web vitest run tests/unit/checkout-session.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/checkout-claims.test.ts
    bun run --cwd apps/web vitest run tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
    bun run --cwd apps/web vitest run tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/unit/access-required-page.test.tsx
    bun run --cwd apps/web vitest run tests/integration/stripe-checkout-route.test.ts tests/unit/checkout-session-params.test.ts
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-paid-checkout-account-resolution.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-paid-checkout-account-resolution.md
    git diff --check

## Idempotence and Recovery

If sign-in-before-checkout is implemented and it proves too much conversion friction, the previous guest checkout behavior can be restored from the route and tests, but only with an explicit account-attachment flow in place.

If guest checkout remains and the attach action is added, the action must be idempotent for the same session and target user. It must refuse invalid sessions, unpaid sessions, sessions for another product, and sessions already attached to a different user unless a separate support repair path handles that case.

If UX copy ships before contract fields are available, revert the copy. Vague copy that still hides the checkout email does not solve the problem.

## Artifacts and Notes

The current problematic user story is:

    Buyer pays while signed out or with a role email.
    Stripe records a paid checkout.
    Convex records a pending checkout claim by checkout email.
    Buyer signs in with a different account.
    App says no access or wrong account without enough detail.
    Buyer contacts support or risks buying again.

The target user story is:

    Buyer pays.
    App recognizes the paid session.
    App names the checkout account and the current account when safe.
    Buyer switches accounts or explicitly attaches the purchase.
    Workspace opens without support intervention.

## Interfaces and Dependencies

This plan depends on Stripe Checkout session data, Clerk identity data, Convex pending checkout claims, and the Next.js checkout success and access-required views. The key interfaces are `CheckoutSessionState` in `apps/web/platform/billing/checkout/checkout-session.ts`, the Convex action result validators in `apps/web/convex/checkoutClaimsActions.ts`, and `CheckoutViewModel` in `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts`.
