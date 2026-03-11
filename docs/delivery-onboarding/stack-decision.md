# Ship by Sunday Stack Decision

Last updated: 2026-03-10

## Locked stack

- App / course shell: `Next.js`
- Deployment: `Vercel`
- Checkout: `Stripe`
- Auth: `Clerk`
- App data and lesson state: `Convex`

## Current handoff architecture

The app is no longer choosing a stack. It is now hardening the live access flow already implemented around that stack.

Current flow:

1. The landing page CTA sends signed-out visitors to Clerk sign-in with a redirect back to pricing.
2. Signed-in users call `POST /api/stripe/checkout`, which creates a Stripe Checkout Session with `clerkUserId` and `courseSlug` metadata.
3. Stripe sends buyers to `/checkout/success` after payment.
4. `POST /api/stripe/webhook` validates the Stripe signature and grants the Convex entitlement.
5. The success page polls `viewerAccess` and redirects entitled buyers into `/mission`.
6. Returning entitled users who hit `/` are resumed into `/mission` or their last worked lesson unless they explicitly use `?marketing=1`.
7. Users without access fall back to `/access-required`, where they can retry Mission, go home, or buy access.

## Current implementation status

- Protected product routes are live in the Next.js app.
- Convex already handles entitlements, lesson autosave, mission progress, artifact listing, resume routing, and upload persistence.
- Start Here lessons `0.1` and `0.2` are in the lesson registry and content system, with `0.0` as the mission-orientation screen.
- Worksheet and student-packet downloads are currently served from `public/downloads/`.
- Stripe checkout creation, success/cancel screens, and webhook grant logic are implemented in code.

## What is still not live-ready

- Stripe still needs final webhook secret configuration and endpoint registration in the live environment.
- Clerk still needs real production envs and the correct issuer domain wired through Convex auth.
- Final lesson video hosting is still undecided.
- There is no implemented transactional access email yet.
- Support inbox ownership and escalation path are still undefined.

## What is intentionally deferred

- final transcript attachment workflow
- richer download-library packaging beyond the current public links
- any second-pass onboarding automation beyond the minimal launch flow

## Recommended next actions

1. Register the Stripe webhook and verify the entitlement grant end to end.
2. Replace any placeholder Clerk envs and confirm Convex auth against the real issuer.
3. Decide the lesson video hosting path and attach the first real lesson media.
4. Define the support fallback and decide whether launch needs a transactional access email or can rely on the current in-app success flow.
