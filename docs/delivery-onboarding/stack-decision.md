# Ship by Sunday Stack Decision

Last updated: 2026-03-18

## Locked stack

- App / course shell: `Next.js`
- Deployment: `Vercel`
- Checkout: `Stripe`
- Auth: `Clerk`
- App data and lesson state: `Convex`

## Current handoff architecture

The app is no longer deciding a stack. The real work is documenting the exact implementation that already exists, then closing the remaining live-env and QA gaps around it.

Current flow in code:

1. The landing-page CTA uses `features/checkout/components/checkout-button.tsx`.
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
   - `success_url` prefers `APP_BASE_URL` and falls back to the active local/dev host only when no canonical app URL is configured
   - `cancel_url` follows the same rule
5. Stripe-hosted checkout returns the buyer to `/checkout/success`.
6. `POST /api/stripe/webhook` verifies the `stripe-signature` header with `STRIPE_WEBHOOK_SECRET`.
7. The webhook only handles `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
8. The webhook extracts `clerkUserId` from `session.metadata.clerkUserId`, falling back to `client_reference_id`, then calls `api.course.grantEntitlementFromStripe`.
9. Convex re-checks the same `STRIPE_WEBHOOK_SECRET` before upserting an `active` entitlement keyed by `clerkUserId + courseSlug`, while also storing Stripe customer / checkout-session / payment-intent IDs when present.
10. `/checkout/success` reads `session_id` server-side, validates the Stripe Checkout Session, and renders distinct states for:

- missing session id
- invalid session id
- sign-in required
- wrong account for the checkout
- payment still pending
- validated paid session waiting on entitlement

11. For a validated paid session, the success page waits for authenticated `viewerAccess`, rotates status copy while entitlement is pending, and redirects to `/mission` about 700ms after access becomes active.
12. If the buyer opens `/access-required`, that page also polls `viewerAccess`, auto-redirects to `/mission` when access appears, and otherwise offers recovery paths based on signed-out vs signed-in-without-access state.
13. Returning entitled users who land on `/` are redirected server-side to `/mission` or their most recently viewed accessible lesson, unless they explicitly use `?marketing=1`.

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
- Server-side Clerk -> Convex calls now explicitly request the Clerk `convex` JWT template instead of relying on Clerk’s default token shape.
- Lesson video delivery now uses a repo-local publish pipeline: Auphonic preset processing -> Bunny Stream hosting -> generated `features/course/lesson/model/media.ts` attachments that the lesson registry merges into the app shell.
- Starter repo access now uses a separate post-purchase provisioning path: entitled buyers save a GitHub username in-app, Convex stores the request state, `/mission` and `/settings` surface the current repo-access status, and local operator scripts send/sync/reset access to `ParkerRex/ship-by-sunday-starter` without changing the Stripe entitlement flow.

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

Current verified local sequence:

1. Start `pnpm run dev`.
2. Start `pnpm run stripe:listen:local`.
3. If the listener prints a fresh webhook secret, restart the web app so `/api/stripe/webhook` uses the new value.
4. Complete a sandbox checkout with card `4242 4242 4242 4242`.
5. Confirm Stripe forwards `checkout.session.completed`.
6. Confirm the webhook logs `grant_succeeded`.
7. Confirm the buyer leaves `/checkout/success` and reaches `/mission`.

Starter repo access has its own local operator loop after entitlement:

1. Save the buyer's GitHub username from `/mission` or `/settings`.
2. Run `pnpm run starter-repo:pending` to confirm the queue item exists.
3. Run `pnpm run starter-repo:invite` to send the GitHub invite by username.
4. Accept the invite on the target GitHub account.
5. Run `pnpm run starter-repo:sync` to mark the record `accepted`.
6. Confirm `/mission` hides the onboarding card and Build `3.1` enables the template path.

## Lesson video pipeline

The lesson media path is now explicit:

1. Put an approved lesson master into `/Volumes/2TB SSD Video/Movies/Ship by Sunday Raw Footage/Ready`.
2. Name it `<lessonId>--<slug>.<ext>`, for example `2.4--figma-basics.mp4`.
3. Use `pnpm run video:lessons` when you need the current lesson id list.
4. Run `pnpm run video:cut:setup` once on a machine before using the silence-cut stage.
5. Use `pnpm run video:cut -- --only <fileName>` to test only the local VAD cut stage.
6. Use `pnpm run video:publish -- --only <fileName>` when you want to test the full pipeline on a single file, or `pnpm run video:publish` to process the whole ready batch.
7. By default the publish flow now does: local VAD silence cut -> Auphonic preset processing -> Bunny upload.
8. Use `--skip-cut` if a specific file should bypass the local cut stage.
9. The script validates filenames, uploads successful source files to Bunny, moves successful source files into `Processed/`, and writes a local report to `output/video-pipeline/`.
10. If the filename prefix matches a real lesson id, the script also updates the generated attachment map in `features/course/lesson/model/media.ts`; if it does not match a lesson yet, the script still uploads it to Bunny and records it as unattached media.

Launch implication: the hosting decision is made, but the first real lesson batch still needs to be published and browser-QA'd in the live shell.

## What is still not live-ready

- Stripe still needs live webhook endpoint registration and verified delivery against the deployed environment.
- Clerk and Convex still need a real production auth check, not just local wiring. The risky point is issuer/domain mismatch around `CLERK_FRONTEND_API_URL` and the `convex` JWT template.
- The buyer handoff still depends on the purchaser finishing checkout in the same signed-in browser context used to query `viewerAccess`.
- Starter repo access is still operator-run for launch; there is no automatic background invite worker or transactional email.
- The first real lesson media batch still needs to be published through the Bunny pipeline and validated in the lesson shell.
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
3. Run the first full buyer journey QA pass against the deployed environment, including the delayed-entitlement recovery path on `/access-required` and the validated-session states on `/checkout/success`.
4. Decide whether the launch can rely on in-app access handoff only, or whether a transactional access email is required before launch.
5. Run the Bunny publish pipeline on the first approved lesson batch, then QA the attached lesson media in-product.
