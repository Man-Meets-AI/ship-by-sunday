# Memory

## Lesson workbench readability guardrail

- Date: 2026-03-13
- Problem: lesson screens had drifted into repeated `8px` to `12px` typography, same-weight bordered slabs, and too many one-off spacing choices, which made guided and support surfaces feel more like dense worksheets than an intentional product.
- Durable decision:
  - keep the shared readability contract in `components/lesson-workbench/shared/workbench-readability.ts`
  - prove major readability changes on lesson `1.2 Pick One User` first, then propagate through shared shells and cards
  - when a lesson mode needs different density, extend the shared readability primitives instead of reintroducing custom tiny-label classes
- Current reference docs:
  - `docs/internal/design/workbench-system.md`
  - `docs/internal/design/workbench-readability-system.md`

## Local Stripe + Convex webhook setup

- Date: 2026-03-13
- Problem: local checkout can succeed and still leave `/checkout/success` stuck on `Confirming your entitlement.` even when the app, Clerk, and Stripe checkout page all look healthy.
- Root causes found in this repo:
  - the Stripe CLI listener can be logged into a different Stripe account than the app's `STRIPE_SECRET_KEY`
  - `.env.local` and the active Convex deployment env can hold different `STRIPE_WEBHOOK_SECRET` values
  - local success-page polling depends on the webhook grant path; payment success alone is not enough
- Required local setup:
  1. Run the web app on `localhost:3000`
  2. Run local Convex dev
  3. Start Stripe forwarding and auto-sync the fresh secret:
     - `pnpm run stripe:listen:local`
  4. Run the setup doctor:
     - `pnpm run stripe:local:doctor`
  5. If you only need to sync a known secret manually:
     - `pnpm run stripe:webhook:sync -- --secret whsec_...`
  6. Verify Convex has the same secret:
     - `node --env-file=.env.local ./node_modules/convex/bin/main.js env list`
  7. After a sandbox checkout completes, verify the handoff:
     - `pnpm run stripe:local:verify`
  8. Use `localhost:3000` consistently; avoid mixing `127.0.0.1` and `localhost`
- Verification checklist:
  - confirm the app Stripe account with:
    - `node --env-file=.env.local -e "const Stripe=require('stripe'); const s=new Stripe(process.env.STRIPE_SECRET_KEY,{apiVersion:'2026-02-25.clover'}); s.accounts.retrieve().then(a=>console.log(a.id,a.settings?.dashboard?.display_name))"`
  - confirm recent real checkout events exist on the app account:
    - `stripe.events.list` via the Stripe SDK or CLI using the app secret key
  - complete a sandbox checkout with `4242 4242 4242 4242`
  - verify `/api/stripe/webhook` receives `checkout.session.completed`
  - verify entitlement becomes active and the buyer leaves `/checkout/success`
- Current repo status at this note:
  - real `checkout.session.completed` events exist on the app Stripe account with the correct `clerkUserId` and `courseSlug` metadata
  - local checkout creation and Stripe payment completion work
  - local webhook/account/env mismatches were found and corrected by re-running `pnpm run stripe:listen:local` and restarting the web app after the fresh secret sync
  - the final `webhook -> Convex entitlement -> auto redirect to /mission` path has now been confirmed locally with a sandbox checkout that reached `/mission`

## Local testing runbook

- Date: 2026-03-13
- Durable decision:
  - treat `docs/dev/testing.md` as the obvious local testing entrypoint for this repo
  - keep shared Clerk QA account prep, browser QA flow, and Stripe sandbox verification documented there instead of spreading them across README notes and internal memory only
  - cross-link `docs/dev/testing.md` from public docs and `AGENTS.md` so contributors and agents use the same path first
- Use this runbook when:
  - you need the correct command matrix quickly
  - you need to test signed-out vs non-entitled vs entitled user flows
  - you need to verify a local paid Stripe handoff without re-deriving the sequence from old notes
