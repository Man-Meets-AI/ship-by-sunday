# Ship by Sunday Stack Decision

Last updated: 2026-03-13

## Locked stack

- App / course shell: `Next.js`
- Deployment: `Vercel`
- Checkout: `Stripe`
- Auth: `Clerk`
- App data and lesson state: `Convex`

## Current handoff architecture

The app is no longer deciding a stack. The real work is documenting the exact implementation that already exists, then closing the remaining live-env and QA gaps around it.

Current flow in code:

1. The landing-page CTA uses `components/checkout-button.tsx`.
2. Signed-out visitors are pushed to `/sign-in?redirect_url=<current-path>#pricing`, so the buyer returns to pricing after Clerk auth.
3. Signed-in visitors call `POST /api/stripe/checkout`.
4. The checkout route creates a Stripe Checkout Session with:
   - `client_reference_id = clerkUserId`
   - `customer_email` from Clerk `currentUser()`
   - `metadata.clerkUserId`
   - `metadata.courseSlug`
   - matching `payment_intent_data.metadata`
   - `allow_promotion_codes: true`
   - `billing_address_collection: "auto"`
   - `success_url = /checkout/success?session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url = /checkout/cancel`
5. Stripe-hosted checkout returns the buyer to `/checkout/success`.
6. `POST /api/stripe/webhook` verifies the `stripe-signature` header with `STRIPE_WEBHOOK_SECRET`.
7. The webhook only handles `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
8. The webhook extracts `clerkUserId` from `session.metadata.clerkUserId`, falling back to `client_reference_id`, then calls `api.course.grantEntitlementFromStripe`.
9. Convex re-checks the same `STRIPE_WEBHOOK_SECRET` before upserting an `active` entitlement keyed by `clerkUserId + courseSlug`, while also storing Stripe customer / checkout-session / payment-intent IDs when present.
10. `/checkout/success` does not currently validate the `session_id` against Stripe. It waits for authenticated `viewerAccess`, rotates status copy while entitlement is pending, and redirects to `/mission` about 700ms after access becomes active.
11. If the buyer opens `/access-required`, that page also polls `viewerAccess`, auto-redirects to `/mission` when access appears, and otherwise offers three paths: retry Mission, go home, or start checkout from that account.
12. Returning entitled users who land on `/` are redirected server-side to `/mission` or their most recently viewed accessible lesson, unless they explicitly use `?marketing=1`.

## Current implementation status

- Protected product routes are live in the Next.js app: `/mission`, `/lesson/[lessonId]`, `/artifacts`, `/settings`, and `/access-required`.
- Convex already handles entitlements, lesson autosave, mission progress, artifact listing, resume routing, and upload persistence.
- Start Here now lives as lesson `0.0` through `0.2` inside the protected lesson system, not as a separate public onboarding page.
- Worksheet and student-packet downloads are currently served from `public/downloads/`.
- Stripe checkout creation, success/cancel screens, and webhook grant logic are implemented in code.
- The current Stripe price path supports either:
  - `STRIPE_PRICE_ID` for a dashboard-managed price
  - inline fallback `price_data` for a one-time USD charge of `50000` cents (`$500`)
- Convex auth is wired through `convex/auth.config.ts` and expects the Clerk JWT template app ID `convex` with `CLERK_FRONTEND_API_URL` as the provider domain.

## Local development note

Local Stripe QA has one extra dependency that is easy to miss:

1. The Stripe CLI listener must be authenticated against the same Stripe account as the app's `STRIPE_SECRET_KEY`.
2. The current listener's `STRIPE_WEBHOOK_SECRET` must be updated in both `.env.local` and the active Convex env.
3. The local buyer flow should use `localhost:3000` consistently, not a mix of `localhost` and `127.0.0.1`.

The repo now includes a helper command for this:

- `pnpm run stripe:listen:local`

That command starts `stripe listen` with the app's `STRIPE_SECRET_KEY`, captures the fresh webhook signing secret, writes it into `.env.local`, and syncs the same value into Convex env. For manual sync only, use:

- `pnpm run stripe:webhook:sync -- --secret whsec_...`

Before a fresh local checkout pass, run:

- `pnpm run stripe:local:doctor`

That command reports:

- the app Stripe account id
- the default Stripe CLI account id
- `.env.local` webhook secret presence
- Convex webhook secret presence
- secret parity across app and Convex env
- reachability of `localhost:3000` and the local Convex URL

After a local sandbox checkout, run:

- `pnpm run stripe:local:verify`

That verifier checks the latest real `checkout.session.completed` event on the app account against the corresponding Convex entitlement row and reports pass/fail for the payment, metadata, entitlement status, source, and session-id linkage.

If those drift, local checkout can succeed, real `checkout.session.completed` events can exist on Stripe, and `/checkout/success` can still hang on entitlement polling because the webhook grant path never completes.

## What is still not live-ready

- Stripe still needs live webhook endpoint registration and verified delivery against the deployed environment.
- Clerk and Convex still need a real production auth check, not just local wiring. The risky point is issuer/domain mismatch around `CLERK_FRONTEND_API_URL` and the `convex` JWT template.
- `/checkout/success` trusts authenticated `viewerAccess`; it does not currently verify the `session_id` query param with Stripe. That is acceptable for the current thin flow, but it should be treated as an implementation constraint, not a stronger payment-proof guarantee than the code actually provides.
- The buyer handoff still depends on the purchaser finishing checkout in the same signed-in browser context used to query `viewerAccess`.
- Final lesson video hosting is still undecided.
- There is no transactional access email in code today.
- Support inbox ownership and escalation path are still undefined.
- The flow still needs a full real-environment QA pass across landing page -> sign-in -> checkout -> success -> mission -> Start Here.

## What is intentionally deferred

- final transcript attachment workflow
- richer download-library packaging beyond the current public links
- any second-pass onboarding automation beyond the minimal launch flow

## Recommended next actions

1. Register the live Stripe webhook endpoint, run a real purchase in test mode, and confirm entitlement insert / patch behavior in Convex.
2. Verify the production Clerk -> Convex auth chain with the real `convex` JWT template and final `CLERK_FRONTEND_API_URL`.
3. Run the first full buyer journey QA pass against the deployed environment, including the delayed-entitlement recovery path on `/access-required`.
4. Decide whether the launch can rely on in-app access handoff only, or whether a transactional access email is required before launch.
5. Decide the lesson video hosting path and attach the first real lesson media.
