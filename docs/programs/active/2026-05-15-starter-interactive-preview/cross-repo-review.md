---
title: "Starter Interactive Preview Cross-Repo Review"
summary: "Risk review for the Starter preview Program across route, checkout, draft handoff, and visual-system boundaries."
docType: "cross_repo_review"
status: "active"
read_when:
  - "Grilling a child ExecPlan for preview risks."
  - "Checking what must not be changed during implementation."
---

# Starter Interactive Preview Cross-Repo Review

## Real Risks

Risk: The old homepage returns by accident.

The easiest implementation is importing `CodebaseDemoSectionBlock` directly into `/starter`, but that imports the old full-screen hero, old section stack shape, and existing-codebase branch. This would satisfy "interactive" technically while violating the current public IA and T3 design system.

Risk: Checkout defaults hide a billing regression.

The old homepage CTA wrapper defaults missing checkout offer IDs to Starter. The new preview should not rely on that fallback. Public checkout entry points should pass `offerId="starter"` so tests can catch accidental Workers or undefined offer usage.

Risk: The draft handoff breaks.

The protected codebase seeder reads the old local storage key and schema. Duplicating the parser or inventing a new key would make the preview feel interactive but fail to prefill the paid workspace. The storage contract should be reused.

Risk: The route becomes a large Client Component.

The current `/starter` page is a Server Component and should stay that way. Only the interactive preview needs the client boundary. Marking the route page itself with `"use client"` would send too much static public route UI to the client and would conflict with the current Next.js Server/Client component guidance.

Risk: Existing homepage demo tests fail silently or are deleted.

The old code remains referenced and tested. If shared pieces are moved, the compatibility test should be updated rather than removed. If the old homepage demo is no longer referenced later, that is a separate cleanup decision.

Risk: Browser layout looks good on desktop only.

The preview includes inputs, pill controls, logos, labels, saved-state text, and checkout loading text. Mobile proof is required because these controls can overflow or create jarring sticky behavior.

## Security And Provider Review

No provider setup should change. The first slice should not touch Stripe Dashboard configuration, Clerk, Convex schema, Cal.com, Telegram, PostHog, Sentry, Resend, or Vercel env. If implementation discovers a required provider change, stop and update scope before proceeding.

The only persistent data behavior is browser local storage. The preview should store product facts that the user types intentionally. It should not store secrets, credentials, local paths, source code, payment data, or provider tokens.

## Testing Review

The focused tests should prove the actual user-facing and boundary behavior: preview visible on `/starter`, Starter checkout offer ID preserved, draft fields persist before checkout, old homepage demo still works, and public route metadata/protection behavior remains unchanged.

Browser screenshots are not optional polish. They are the proof that the preview matches current public route design and does not look like the old homepage was pasted back in.
