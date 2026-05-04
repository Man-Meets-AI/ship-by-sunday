---
summary: Convert Ship by Sunday from sign-in-before-checkout to buy-first checkout with a safe post-payment access-claim path tied to the Stripe session and the buyer's verified Clerk email.
read_when: Open this plan when changing homepage CTA, Stripe checkout creation, webhook handling, checkout success recovery, or product-access grants for the paid buyer flow.
plan_status: not_done
---

# Implement Buy-First Checkout With Safe Access Claim

This document is a living execution plan. Update it as discoveries are made, as milestones complete, and as design decisions change so another agent can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday currently claims to support a buy-first flow, but the live app still requires a Clerk session before it will create a Stripe Checkout Session. A signed-out buyer clicks the homepage CTA, gets sent to `/sign-in`, and after authentication returns to pricing instead of paying. The user-visible goal of this plan is simple: a brand-new buyer should be able to click the homepage CTA, pay first, return to `/checkout/success`, sign in only after payment if needed, and then have access granted safely without support intervention. The change is working when a signed-out buyer can complete a full Stripe-hosted checkout, return to the app, authenticate with the same email used during payment, and land in `/start` with product access.

This is the highest-risk path in the product. If the app cannot reliably collect payment and convert that paid buyer into product access, the product has failed at its core commercial job. Treat regressions in checkout launch, payment completion, webhook acknowledgment, post-payment account creation, purchase claim, or access grant as release-blocking failures, not as follow-up polish.

## Progress

Every time work stops, add a timestamped entry that names the last verified slice, the exact files touched, the current rollback boundary, and the next safe resume point.

- [x] 2026-03-31 19:20 EDT: Reproduced the current production CTA behavior. Signed-out homepage CTA calls `POST /api/stripe/checkout`, receives `401`, and routes to `/sign-in?redirect_url=%2F%23pricing`.
- [x] 2026-03-31 19:32 EDT: Mapped the current contract. Checkout creation, webhook processing, and `/checkout/success` all assume `clerkUserId` exists before payment.
- [x] 2026-03-31 19:40 EDT: Collected subagent review and API verification. Stripe post-payment identity should use `checkout.session.customer_details.email`; Clerk server code can read `currentUser().primaryEmailAddress?.emailAddress`.
- [x] 2026-03-31 19:48 EDT: Wrote this ExecPlan to freeze scope, risk, and validation before implementation.
- [x] 2026-03-31 20:05 EDT: Hardened this plan with explicit recovery, rollback, and living-document instructions before implementation begins.
- [x] 2026-03-31 19:46 EDT: Completed Milestone 1 Slice 1. Added `pendingCheckoutClaims` to `apps/web/convex/schema.ts`, created `apps/web/convex/checkoutClaims.ts`, generated Convex bindings with `bunx convex codegen`, added `apps/web/tests/unit/checkout-claims.test.ts`, and verified the slice with `bunx vitest run --project unit tests/unit/checkout-claims.test.ts` plus `bun run typecheck`. Rollback boundary: revert the new schema/table and `checkoutClaims.ts` together before touching webhook behavior.
- [x] 2026-03-31 20:14 EDT: Completed Milestone 1 Slice 2. Guest webhook deliveries now persist pending claims and stop surfacing `missing_clerk_user` as a Stripe failure. Focused webhook and observability unit suites passed, and `bun run qa:validate` stayed green.
- [x] 2026-03-31 20:19 EDT: Completed Milestone 2. Added the post-payment claim action, rewired `/checkout/success`, added the locked-email post-payment sign-up route, and wired sign-in recovery to preserve the paid sign-up branch. Unit, integration, integration-ui, `bunx convex codegen`, and `bun run typecheck` all passed.
- [x] 2026-03-31 20:22 EDT: Completed Milestone 3 implementation and proof alignment. The homepage CTA is buy-first, `/start` can recover with the cookie-scoped fallback claim, the public docs and QA control plane reflect the new contract, `bun run qa:inventory:sync`, `bun run qa:validate`, `qa:run-pack` dry-runs, `test:browser-smoke`, and `stripe:dev:doctor` all ran successfully at least once in this turn.
- [x] 2026-03-31 20:30 EDT: QA review verdict received. QA approves for merge based on the collected code and browser proof. Remaining gap: no successful real `billing_integration` pack execution for this exact change set, so ship confidence stays below full release confidence.

## Surprises & Discoveries

The biggest discovery is that this is not a homepage CTA bug. It is a contract bug across the entire paid-access path. `apps/web/app/api/stripe/checkout/route.ts` rejects signed-out checkout with `401`, `apps/web/convex/stripeWebhook.ts` returns `missing_clerk_user` when checkout metadata lacks `clerkUserId`, and `apps/web/features/checkout/server/checkout-session.ts` classifies any session without `clerkUserId` or `client_reference_id` as `invalid_session`. The current docs are internally contradictory: several product docs and QA notes say the target UX is buy first, but `apps/web/content/docs/stripe-checkout-webhook.mdx` and `apps/web/content/docs/test-the-buyer-journey.mdx` still describe a signed-in buyer path.

Subagent review also surfaced an important safety constraint: exact email matching is not enough unless the claim is bound to the Stripe session and refused when that session was already attached to a different Clerk subject. The current schema stores grants by `clerkUserId` and only indexes `stripeCheckoutSessionId`, so session replay or multi-claim bugs are possible unless the implementation adds an explicit pending-purchase model or a durable session-level claim lock.

Expected surprises in this flow include Stripe retry timing, email-normalization edge cases, and claim recovery after a lost return tab; record each with the exact file, trigger, and evidence snippet.

The first implementation slice proved that adding a separate `pendingCheckoutClaims` table is low-risk as long as Convex codegen is rerun immediately. `bunx convex codegen` completed successfully against the hosted dev deployment after the new table landed, so the schema addition does not currently require an env migration or a second deployment step before TypeScript can see the new data model.

## Decision Log

Decision: QA validates the contract; it does not define the contract.  
Rationale: the source of truth for this change is, in order, the explicit user directive in this thread, the repository’s stated product intent that the target UX is buy first, the Stripe and Clerk best-practice constraints recorded in this plan, and then the implementation details in the current codebase. QA is a proof and risk function. It should strengthen confidence and catch holes, but it does not get to override the product contract for this path.  
Date: 2026-03-31

Decision: do not ship a smaller “resume checkout after sign-in” patch as the final fix.  
Rationale: it preserves the wrong contract and still requires login before pay. The user-visible issue is that someone who has not bought cannot be expected to sign in first.  
Date: 2026-03-31

Decision: use Stripe’s post-payment checkout email from `checkout.session.customer_details.email` as the canonical buyer email on the claim path.  
Rationale: Stripe documents that field on the retrieved Checkout Session after payment. `customer_email` is a create-time prefill field and should not be the durable match key.  
Date: 2026-03-31

Decision: do not auto-create Clerk users from the Stripe webhook or Stripe server routes.  
Rationale: Stripe should own payment collection, Clerk should own identity creation and authentication, and Convex should own access grants. The safe buy-first path is “pay first, then sign in or create the account on the success path, then claim the paid session by verified email.” Creating Clerk users from the webhook would couple billing to identity provisioning and violate the current Clerk-first account model in this repository.  
Date: 2026-03-31

Decision: compare Stripe checkout email only against Clerk’s verified primary email on the signed-in account.  
Rationale: the app’s real account identity is the Clerk subject, but the safe bridge from guest checkout to account ownership is the verified primary email. Secondary or unverified emails would widen the takeover surface.  
Date: 2026-03-31

Decision: redesign webhook handling and `/checkout/success` together.  
Rationale: guest checkout means the webhook will legitimately see sessions without `clerkUserId`. That case must no longer be treated as a hard Stripe error, and `/checkout/success` must become the safe claim point for paid guest sessions.  
Date: 2026-03-31

Decision: add a durable pending guest checkout record rather than relying only on ephemeral success-page recovery.  
Rationale: if the buyer closes the Stripe return tab or revisits later, the app still needs a server-side source of truth proving there was a paid but unclaimed purchase. The current `productAccessGrants` table alone is not enough because it only tracks claimed access by Clerk subject.  
Date: 2026-03-31

Decision: use the existing custom identity shell for post-payment sign-in and add a dedicated post-payment sign-up path instead of relying on the current generic `/sign-up` redirect.  
Rationale: this repository already has a custom sign-in shell and Clerk route handling. Reusing that shell avoids mixing auth surfaces while still allowing a paid guest buyer to create the account that will own the purchase. The post-payment sign-up route must preserve the original checkout success session context.  
Date: 2026-03-31

Decision: lock the post-payment sign-up route to the Stripe checkout email instead of allowing the buyer to edit it freely.  
Rationale: the purchase is already tied to one checkout email, so the account-creation route should make that identity explicit and avoid creating the wrong Clerk account at the most sensitive point in the funnel.  
Date: 2026-03-31

Decision: keep `/checkout/success` as the canonical claim route, but also allow the protected access gate to perform a safe fallback claim when a signed-in user has exactly one matching pending paid checkout.  
Rationale: buyers may lose the Stripe return tab. Restricting fallback recovery to the protected access gate preserves a clear mental model and avoids broad “claim on any page load” behavior.  
Date: 2026-03-31

Decision: persist the Stripe Checkout Session ID in a first-party browser cookie when checkout starts, and use that session ID as the fallback recovery handle instead of scanning pending purchases by email.  
Rationale: the cookie narrows recovery to the exact checkout the browser started, avoids exposing a generic “look up pending purchases by email” interface, and still supports the user-approved fallback where the buyer loses the Stripe return tab but later signs in from the same browser. The claim path still requires a verified Clerk primary email match against the Stripe checkout email before access is granted.  
Date: 2026-03-31

Decision: preserve the guest-purchase pending record even if claim automation is later disabled.  
Rationale: the durable pending record is the recovery source of truth for a paid-but-unclaimed checkout, and deleting it would erase the only safe handoff path after a webhook or success-page interruption.  
Date: 2026-03-31

Decision: if rollback is needed, disable claim entrypoints before removing any schema or storage related to pending guest purchases.  
Rationale: this keeps payment collection and webhook acknowledgment live while stopping only the automation that could create duplicate or wrong-user access grants.  
Date: 2026-03-31

## Outcomes & Retrospective

The feature is implemented. A signed-out buyer can now start Stripe Checkout directly from the public CTA, the app persists the Stripe session as a first-party recovery handle, guest checkouts are recorded as durable pending claims, `/checkout/success` supports sign-in or locked-email account creation after payment, and `/start` can recover the handoff if the Stripe return tab is lost. This matches the stated product contract more closely than the previous sign-in-first flow.

The strongest proof collected in this turn is code-level and local-browser-level: focused unit, integration, and integration-ui suites passed; `bunx convex codegen` passed; `bun run typecheck` passed; `bun run qa:validate` passed; QA pack dry-runs passed; `PLAYWRIGHT_USE_LOCAL_SERVER=1 bun run --cwd apps/web test:browser-smoke` passed 7/7; and `bun run --cwd apps/web stripe:dev:doctor` passed. QA approved the implementation for merge from that evidence set.

The main remaining gap is ship-proof, not implementation-proof. We did not complete a real `billing_integration` pack run for this exact change set. An attempted full `default_ship` pack run picked up an unrelated localhost app on port `3000`, so the browser proof inside the pack was contaminated even though the standalone browser smoke run using the local test server passed. No rollback was exercised during implementation.

## Context and Orientation

The source of truth hierarchy for this plan is explicit and should not drift during implementation. First, the product requirement is buy first, not sign in first. That requirement comes from the user directive for this work and is also echoed by repository product text such as the checkout QA lesson content that says the target UX is “buy first, then account creation tied to the Stripe checkout email.” Second, Stripe best practice for this app shape is still Stripe-hosted Checkout Sessions for the one-time payment. Third, Clerk best practice in this Next.js app is to keep identity creation and authenticated user checks inside Clerk server-side APIs, not inside Stripe webhook logic. Fourth, the current code is not the desired contract here; it is the broken implementation being replaced. Fifth, QA evidence is used to prove or disprove the implementation against the contract, not to define the contract.

The current buyer flow starts on the homepage through `apps/web/features/marketing/components/home-page/home-page-primary-cta.tsx`, which delegates checkout CTAs to `apps/web/features/checkout/components/checkout-button.tsx`. The actual checkout start logic lives in `apps/web/features/checkout/hooks/use-stripe-checkout.ts`. That hook currently calls `POST /api/stripe/checkout` and, on `401`, routes the buyer to `/sign-in`.

The Next.js checkout creation route is `apps/web/app/api/stripe/checkout/route.ts`. It currently uses `auth()` and `currentUser()` from Clerk, requires `userId`, and writes `clerkUserId` into Stripe session metadata and `client_reference_id`.

The Stripe webhook enters through Convex HTTP in `apps/web/convex/http.ts` and then calls the internal action in `apps/web/convex/stripeWebhook.ts`. Today that action only grants access when the Stripe event includes `metadata.clerkUserId` or `client_reference_id`.

Product access storage lives in `apps/web/convex/access/model.ts`, with schema fields defined in `apps/web/convex/schema.ts` and validators in `apps/web/convex/access/validators.ts`. The app’s protected routes consume product access through `api.access.viewerProductAccess`, which is keyed by the authenticated Clerk subject.

The post-payment page is `apps/web/app/checkout/success/page.tsx`. It calls `apps/web/features/checkout/server/checkout-session.ts` to classify the Stripe session into states like `validated`, `sign_in_required`, `wrong_account`, `payment_pending`, and `invalid_session`. The visible copy for those states lives in `apps/web/features/checkout/components/checkout-success-view-model.ts`.

The key integration boundary is this: Stripe proves a payment happened, Clerk proves who the current signed-in user is, and Convex is the canonical store for access grants. The new design has to convert a paid guest Stripe session into exactly one Convex access grant for exactly one Clerk subject.

Two repository-specific best-practice constraints matter here. First, Stripe best practice for this product shape is still Stripe-hosted Checkout Sessions for the one-time payment, not a custom card form or raw PaymentIntent flow. Second, Clerk best practice in this Next.js app is to keep `await auth()` and `currentUser()` on the server side only and to treat `401` as “not signed in” and `403` as “signed in but not allowed.” The claim path should therefore remain a server-side or Convex-authenticated operation, never a client-side trust decision.

This plan assumes account creation still happens through Clerk after payment, not before payment and not through the Stripe webhook. In plain terms: a buyer can pay while signed out, then on `/checkout/success` they either sign into the purchased account or create the account that will own the purchase, and only then does the app bind the paid Stripe session to that Clerk subject. The post-payment sign-up flow must live in the existing custom identity shell and must lock the email field to the Stripe checkout email.

When implementation reveals a new failure mode, record it in `Surprises & Discoveries` with the exact trigger, the observed output or test failure, and whether the safe rollback boundary changed. Do not bury rollback-relevant discoveries only in prose notes or progress entries.

## Plan of Work

Start by adding a new durable data model for paid guest checkout sessions. A separate table such as `pendingCheckoutClaims` should hold the Stripe Checkout Session ID, normalized checkout email, payment status, Stripe customer and payment intent IDs, creation and update timestamps, and claim state. This table exists to represent “a paid purchase exists but has not been attached to a Clerk subject yet.” It should also record the claiming Clerk user ID once claimed so later replays can be rejected.

Then update `apps/web/app/api/stripe/checkout/route.ts` so signed-out buyers can create a Stripe Checkout Session. Signed-in buyers should continue to write `clerkUserId` metadata for the direct grant path. Signed-out buyers should still write `courseSlug`, but must omit `clerkUserId` and rely on Stripe to collect the buyer email during checkout. Keep `success_url` and `cancel_url` unchanged.

Next, update `apps/web/convex/stripeWebhook.ts` plus the relevant mutation layer so webhook processing does two different things. When `clerkUserId` exists, keep the current direct access-grant path. When it does not exist, do not return a hard failure. Instead, upsert a pending guest checkout record keyed by `stripeCheckoutSessionId`, record the canonical Stripe checkout email from the event payload, and return an acknowledged “pending claim” result so Stripe sees a successful webhook delivery.

After that, add a public Convex action in a new file such as `apps/web/convex/checkoutClaims.ts` running in Node. This action should require an authenticated viewer, retrieve the Stripe Checkout Session by `sessionId`, verify the course slug, verify payment is complete, compare the normalized Stripe checkout email against the authenticated user’s verified Clerk primary email, check whether the session is already claimed by another Clerk user, and then either grant access for the current Clerk subject or return a typed refusal state. The action must be idempotent for the same Clerk subject and reject reassignment across users.

With that action in place, update `apps/web/features/checkout/server/checkout-session.ts` and `apps/web/app/checkout/success/page.tsx`. The server page should, when it sees a paid session with no embedded `clerkUserId`, attempt to claim it using the signed-in Convex token. If no one is signed in, keep the existing `sign_in_required` recovery and add a post-payment sign-up route in the same identity shell. If the wrong account is signed in, map that to `wrong_account`. If the claim succeeds or was already completed for the same user, treat the session as `validated` and fetch initial product access as usual. The goal is to keep the success-page UI model mostly stable while changing the server-side contract.

After the success-page claim path works, add the guarded fallback claim to the protected access gate. That fallback should run only when the signed-in user has no product access and the browser still carries the stored pending Stripe Checkout Session ID from the checkout start. The claim must still compare the signed-in user’s verified primary email against the Stripe checkout email before granting access. It should not scan or claim on arbitrary signed-in page loads.

Finally, update the test suite and docs together. The checkout route tests must stop expecting `401` for signed-out checkout. The webhook tests must stop treating missing `clerkUserId` as a high-severity hard failure and start asserting pending-claim persistence. The checkout session tests and success-page tests must cover signed-out guest checkout, post-payment sign-up with locked email, signed-in same-email claim, signed-in wrong-email refusal, protected-gate fallback claim, and already-claimed replay. The buyer-journey and Stripe webhook docs must be rewritten to describe the buy-first flow truthfully.

## QA Scope

These scenario IDs are affected by this plan and must have their proof refreshed when the corresponding behavior changes:

- `FREEPAID-01`: public CTA starts checkout from the homepage without forcing sign-in first.
- `FREEPAID-02`: safe checkout completion still grants access and lands the buyer in the funnel.
- `ACCESS-02`: checkout success recovery remains truthful when the buyer is signed out or the session is not yet claimable.
- `AUTH-01`: post-payment sign-in or sign-up preserves the intended destination and same-email claim path.
- `ACCESS-01`: the protected access gate can recover a lost paid session without opening a new escalation path.
- `CODEBASE-01`: a claimed buyer lands in `/start` with access.
- `CODEBASE-07`: the end-to-end codebase journey still begins cleanly after access is granted.

Before a milestone can close, update the matching rows in `qa/journeys.csv` and `qa/coverage.csv` if the proof meaning or journey wording changed, then record the run report path in `Artifacts and Notes`.

## Milestones

Milestone 1 creates the pending-purchase foundation and the webhook split.

- Affected QA scenarios: `FREEPAID-02`, `ACCESS-02`
- Commands to run:
  - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bunx vitest run --project unit tests/unit/stripe-webhook-action.test.ts tests/unit/pending-checkout-claims.test.ts`
  - `cd /Users/parkerrex/Projects/ship-by-sunday && bun run qa:validate`
- Evidence snippets to capture:
  - `Webhook result: pending_claim_saved session_id=cs_test_... email=buyer@example.com payment_status=paid`
  - `qa/journeys.csv snippet: FREEPAID-02 expected_outcome now names the pending-claim handoff truthfully`
  - `Coverage update: FREEPAID-02 now proves pending-claim persistence instead of a hard webhook failure`
  - `Run report: Environment=dev-local; Scenario IDs=FREEPAID-02, ACCESS-02; Commands=...`

At the end of this milestone, Stripe webhook deliveries for guest checkout no longer fail just because `clerkUserId` is absent, and the repo has a durable record representing a paid but unclaimed purchase. Success looks like webhook tests proving both direct signed-in grants and guest pending-claim persistence.

Milestone 2 adds the claim action and rewires `/checkout/success` plus the post-payment identity shell to use it.

- Affected QA scenarios: `FREEPAID-02`, `AUTH-01`, `ACCESS-02`, `CODEBASE-01`
- Commands to run:
  - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bunx vitest run --project integration tests/integration/stripe-checkout-route.test.ts`
  - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bunx vitest run --project unit tests/unit/checkout-session.test.ts tests/unit/course-entitlements.test.ts`
  - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bunx vitest run --project integration-ui tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/sign-in-page.test.tsx`
  - `cd /Users/parkerrex/Projects/ship-by-sunday && bun run qa:validate`
- Evidence snippets to capture:
  - `Checkout success state: validated session_id=cs_test_... matched_email=buyer@example.com access_granted=true`
  - `Checkout success state: wrong_account session_id=cs_test_... checkout_email=buyer@example.com signed_in_email=other@example.com`
  - `Post-payment sign-up: email locked to buyer@example.com and claim succeeds after account creation`
  - `qa/journeys.csv snippet: AUTH-01 and CODEBASE-01 now describe the post-payment claim path and validated funnel handoff`
  - `qa/coverage.csv snippet: AUTH-01 proof source now points to checkout-session and sign-in-page tests for the claim path`
  - `Run report: Environment=dev-local; Scenario IDs=FREEPAID-02, AUTH-01, ACCESS-02, CODEBASE-01; Commands=...`

At the end of this milestone, a signed-out buyer can complete Stripe checkout, return to `/checkout/success`, sign in or create the account with the locked checkout email, and have access granted without manual support. Success looks like the success-page state machine reaching `validated` after an email-matched claim.

Milestone 3 aligns the homepage CTA path, the protected access gate fallback claim, tests, and docs with the new contract.

- Affected QA scenarios: `FREEPAID-01`, `ACCESS-01`, `FREEPAID-02`, `CODEBASE-07`
- Commands to run:
  - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bunx vitest run --project integration-ui tests/integration-ui/checkout-button.test.tsx tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/access-required-page.test.tsx`
  - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bun run typecheck`
  - `cd /Users/parkerrex/Projects/ship-by-sunday && bun run qa:run-pack -- --pack=default_ship --dry-run`
  - `cd /Users/parkerrex/Projects/ship-by-sunday && bun run qa:run-pack -- --pack=billing_integration --dry-run`
- Evidence snippets to capture:
  - `Homepage CTA: signed-out click now starts checkout instead of redirecting to sign-in`
  - `Access gate fallback: cookie-carried checkout session matched on verified primary email and restored access at /start`
  - `qa/journeys.csv snippet: FREEPAID-01 and ACCESS-01 now describe the buy-first CTA and guarded fallback claim`
  - `qa/coverage.csv snippet: FREEPAID-01 and ACCESS-01 proof source now points to the CTA and access-gate browser evidence`
  - `Run report: Environment=dev-local or prod-www.man-meets-ai.com; Scenario IDs=FREEPAID-01, ACCESS-01, FREEPAID-02, CODEBASE-07; Commands=...`

At the end of this milestone, the homepage CTA starts buy-first checkout, `/start` can recover a lost success-tab state through the guarded fallback claim, the tests assert the new buyer path, and the docs no longer describe a sign-in-first purchase flow. Success looks like a coherent contract across code, tests, docs, and QA proof.

## Concrete Steps

Work from the repository root unless a step says otherwise.

1. Inspect the current affected files again before editing:

   cd /Users/parkerrex/Projects/ship-by-sunday
   sed -n '1,220p' apps/web/app/api/stripe/checkout/route.ts
   sed -n '1,260p' apps/web/convex/stripeWebhook.ts
   sed -n '1,260p' apps/web/features/checkout/server/checkout-session.ts
   sed -n '1,260p' apps/web/features/checkout/components/checkout-success-view-model.ts

   Expect to see the current `401` signed-out guard, the `missing_clerk_user` webhook result, and the success-page user-ID matching logic.

2. Add the new pending guest checkout schema and validators. Edit `apps/web/convex/schema.ts` and `apps/web/convex/access/validators.ts` first, then extend the access model or add a dedicated `checkoutClaims` model file.

3. Add the pending guest checkout webhook path. Edit `apps/web/convex/stripeWebhook.ts`, `apps/web/convex/http.ts`, and `apps/web/features/observability/server/source-adapters/stripe-failure.ts` so guest sessions are acknowledged and persisted instead of treated as webhook failures.

4. Add the claim action. Create a new Node Convex action file such as `apps/web/convex/checkoutClaims.ts`, export it publicly, and use Stripe session retrieval plus authenticated viewer email matching before granting access through the mutation layer.

5. Rework the success-page server path. Edit `apps/web/features/checkout/server/checkout-session.ts` and `apps/web/app/checkout/success/page.tsx` so paid guest sessions can be claimed inline when the signed-in user matches the checkout email.

6. Update checkout creation and CTA flow. Edit `apps/web/app/api/stripe/checkout/route.ts` and `apps/web/features/checkout/hooks/use-stripe-checkout.ts` so signed-out checkout is allowed and no buyer is forced into auth before paying.

7. Update the tests and docs named in this plan before broad verification. Do not leave the old sign-in-first contract encoded in tests or docs.

## Validation and Acceptance

Run the milestone commands in order, starting with the narrowest proof and widening only when the previous slice passes:

1. Milestone 1:
   - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bunx vitest run --project unit tests/unit/stripe-webhook-action.test.ts tests/unit/pending-checkout-claims.test.ts`
   - `cd /Users/parkerrex/Projects/ship-by-sunday && bun run qa:validate`
2. Milestone 2:
   - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bunx vitest run --project integration tests/integration/stripe-checkout-route.test.ts`
   - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bunx vitest run --project unit tests/unit/checkout-session.test.ts tests/unit/course-entitlements.test.ts`
   - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bunx vitest run --project integration-ui tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/sign-in-page.test.tsx`
   - `cd /Users/parkerrex/Projects/ship-by-sunday && bun run qa:validate`
3. Milestone 3:
   - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bunx vitest run --project integration-ui tests/integration-ui/checkout-button.test.tsx tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/access-required-page.test.tsx`
   - `cd /Users/parkerrex/Projects/ship-by-sunday/apps/web && bun run typecheck`
   - `cd /Users/parkerrex/Projects/ship-by-sunday && bun run qa:run-pack -- --pack=default_ship --dry-run`
   - `cd /Users/parkerrex/Projects/ship-by-sunday && bun run qa:run-pack -- --pack=billing_integration --dry-run`
   - `cd /Users/parkerrex/Projects/ship-by-sunday && QA_ALLOW_BILLING_INTEGRATION=1 PLAYWRIGHT_BASE_URL=<safe_base_url> QA_ENV_FILE=<safe_env_file> bun run qa:run-pack -- --pack=billing_integration`
   - If a safe billing environment is available, rerun the billing pack for real and include the resulting `qa/runs/YYYY-MM-DD-<slug>.md` report path in this plan.

Acceptance requires all of the following observable behaviors:

A signed-out buyer clicking the homepage CTA is no longer redirected to `/sign-in` before checkout begins.

The Stripe webhook accepts guest checkout sessions without `clerkUserId` and records them as pending claim instead of returning a hard failure.

`/checkout/success?session_id=...` shows sign-in recovery for a paid guest session when the browser is still signed out.

After signing in with the same verified email used during checkout, the same success URL or follow-up success render auto-claims access and transitions to the existing validated workspace handoff.

Signing in with a different email must not claim the session and must produce a recoverable wrong-account experience.

The protected access gate fallback may only attempt claim when the browser still carries the stored pending checkout session ID from the exact checkout flow that browser started.

Revisiting a session already claimed by the same user must be idempotent.

The tests and docs describe the buy-first path truthfully.

The executor must also refresh the proof trail:

- Update `qa/journeys.csv` when a scenario description, pack assignment, or expected outcome changes.
- Update `qa/coverage.csv` when the proof source or confidence state changes.
- Add or update a `qa/runs/YYYY-MM-DD-<slug>.md` report with `Environment`, `Pack`, `Scenario IDs`, exact commands run, pass/fail findings, blocked items, and the evidence snippets listed above.

No milestone is acceptable if it preserves a state where a buyer can still reach the homepage CTA and fail to start payment because they are signed out. No final rollout is acceptable if a paid buyer can complete Stripe Checkout and still fail to reach a recoverable claim path into product access. For this initiative, “payment collection still works end to end” is a non-negotiable acceptance criterion, not a nice-to-have.

Do not accept the change if any of the following remain true: signed-out checkout still returns `401`; guest webhook deliveries still fail hard on missing `clerkUserId`; a paid checkout can be claimed by more than one Clerk subject; the claim path accepts an unverified or non-primary email; or rollback would require deleting payment evidence or access records to keep the app usable.

## Idempotence and Recovery

All schema and logic changes must be additive first. Do not delete the direct signed-in `clerkUserId` checkout path while introducing guest checkout. That direct path is the safe fallback if the claim path misbehaves.

Webhook handling must be idempotent on `stripeCheckoutSessionId`. Replayed Stripe events should patch the same pending record or the same claimed grant instead of creating duplicates.

The claim action must refuse to rebind a Stripe session already claimed by a different Clerk subject. That refusal is the recovery boundary that prevents an accidental or malicious re-claim.

If a test fails mid-milestone, stop and repair before widening scope. If the pending-claim schema lands but the success-page claim path is not ready, keep the webhook acknowledging guest checkouts and document the partial state here before stopping.

If a claim-path regression reaches review or production, roll back in reverse dependency order. First disable the fallback claim in the protected access gate, then disable `/checkout/success` auto-claim, then leave checkout creation and guest webhook acknowledgment intact. Only remove the pending-guest schema or helper code after there are no outstanding paid guest sessions that still need recovery.

Do not roll back by deleting claimed access records or pending purchase records in a live environment unless a specific mistaken test fixture must be cleaned up. Recovery should repair the owning Clerk subject or disable automation, not erase evidence of payment.

After any rollback or partial revert, add a Progress entry that names the rollback boundary, the exact files reverted, and the next safe validation to rerun. The plan is not current until that note exists.

## Artifacts and Notes

Useful evidence already captured during planning:

Production reproduction on 2026-03-31:

- Homepage CTA click from signed-out state triggered `POST /api/stripe/checkout`
- API returned `401`
- Browser navigated to `/sign-in?redirect_url=%2F%23pricing`

Local code evidence:

- `apps/web/app/api/stripe/checkout/route.ts` currently returns `401 "Sign in before starting checkout."`
- `apps/web/convex/stripeWebhook.ts` currently returns `missing_clerk_user` when checkout metadata lacks `clerkUserId`
- `apps/web/features/checkout/server/checkout-session.ts` currently rejects Stripe sessions without `clerkUserId` / `client_reference_id`

Milestone 1 Slice 1 proof:

- `bunx vitest run --project unit tests/unit/checkout-claims.test.ts` → `1 file passed, 3 tests passed`
- `bunx convex codegen` → completed successfully after adding `pendingCheckoutClaims`
- `bun run typecheck` → passed after the schema and new Convex module landed

External API facts confirmed:

- Stripe post-payment email should come from `checkout.session.customer_details.email`
- Clerk server code can read `currentUser().primaryEmailAddress?.emailAddress`

Example run-report snippets the executor should preserve:

- `Environment: dev-local`
- `Scenario IDs: FREEPAID-02, ACCESS-02`
- `Scenario IDs: FREEPAID-02, AUTH-01, ACCESS-02, CODEBASE-01`
- `Scenario IDs: FREEPAID-01, ACCESS-01, FREEPAID-02, CODEBASE-07`
- `Webhook result: pending_claim_saved session_id=cs_test_... email=buyer@example.com payment_status=paid`
- `Checkout success state: validated session_id=cs_test_... matched_email=buyer@example.com access_granted=true`
- `Checkout success state: wrong_account session_id=cs_test_... checkout_email=buyer@example.com signed_in_email=other@example.com`
- `Access gate fallback: pending claim matched on verified primary email and restored access at /start`

## Interfaces and Dependencies

The implementation depends on Stripe Checkout Session retrieval in server code and Convex Node actions using the existing `STRIPE_SECRET_KEY` environment value. The new action must use the existing `apiConfig.stripeApiVersion` to stay aligned with the repo’s Stripe client configuration.

The implementation must preserve the current public `api.access.viewerProductAccess` contract because protected routes and client-side access polling already depend on it. Any new pending-claim state should be represented in new server-side or internal types rather than silently widening the existing product-access query unless there is a clear, tested UI consumer.

The plan assumes `convex/nextjs` helpers remain available for `fetchAction` and `fetchMutation` from Next.js Server Components and Route Handlers, and that authenticated server code can obtain the Convex JWT token through `apps/web/platform/auth/convex-auth.ts`.
