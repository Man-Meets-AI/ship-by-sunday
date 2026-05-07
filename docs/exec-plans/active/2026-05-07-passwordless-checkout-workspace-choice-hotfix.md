---
title: Passwordless Checkout Workspace Choice Hotfix
status: active
created_at: 2026-05-07
completed_at: null
summary: Make every paid checkout lead through passwordless email-code auth into workspace choice, while removing pre-purchase checkout routing intents.
post_build_recap: null
read_when:
  - Resuming the passwordless checkout hotfix.
  - Changing checkout success, sign-in, product access, or workspace choice behavior.
  - Validating dev and production purchase or OTP login proof.
---

# Passwordless Checkout Workspace Choice Hotfix

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Paid users should not have to understand account claiming, passwords, checkout intent, or internal recovery states. After this change, checkout buys product access only. The first paid destination is the workspace chooser, where the user picks whether to generate a new codebase, watch tutorials, or set up an existing codebase or worker path. If the buyer is signed out, they authenticate with a Clerk email one-time code and then continue to that chooser. If they try to sign in with an email that has no paid account, they see one clear field-level message with a `Purchase a license` link to `/#pricing`.

This matters because the current production flow exposes implementation details. Some buyers see a password form even though the product is configured for passwordless login, and some paid checkout paths render "Prove checkout email" or a checkout email handoff screen instead of taking the user toward the product. The implementation also stores pre-purchase routing intent, such as `buyerStartingPoint: "no_codebase"`, and then silently sends buyers to a specific path. Removing that pre-purchase routing simplifies the system and improves product discovery because the buyer can choose the path after purchase.

The visible proof is two end-to-end browser tests on dev, then the same smoke on production after release. Test one buys with `{{TEST_CHECKOUT_EMAIL}}` in the dev Stripe checkout and confirms the flow reaches `/workspace/choose` with the expected three choices. Test two logs out, signs back in with email OTP, retrieves the Clerk code from Gmail if the connector can see it, and confirms the user lands on the chooser or their already-selected workspace path.

The provider-backed architecture is now fixed. Stripe Checkout fulfillment is webhook-backed and also triggered from the checkout return page using the same idempotent fulfillment function. Clerk email OTP is the only buyer identity proof when the browser is not already signed in. Convex grants product access only from server-validated Stripe checkout data or from an authenticated Clerk identity with a verified email. There is no separate claim page in the desired product.

The simple desired UX is: a first-time customer buys with Stripe using their email, the server creates or finds the Clerk user for that email, the server grants Convex product access to that Clerk user, the buyer enters one Clerk email code to create the browser login session, and then they land on `/workspace/choose`. Returning or already-authenticated users can skip the OTP only if the browser already has a valid Clerk session for the account that owns access. The chooser may show one celebratory first-arrival treatment, such as confetti plus a one-time banner that says the account is tied to the checkout email and can be managed in account settings. The app must not imply that Stripe email alone logs the browser in, because payment email is not the same thing as an authenticated Clerk session.

## Progress

- [x] 2026-05-07 11:13:59 EDT: Created clean branch `codex/passwordless-workspace-choice-hotfix` from `origin/main`.
- [x] 2026-05-07 11:13:59 EDT: Read `AGENTS.md`, `docs/exec-plans/PLANS.md`, and inspected the current checkout, sign-in, workspace choice, passwordless error, and checkout fixture surfaces.
- [x] 2026-05-07 11:13:59 EDT: Decided this work is one ExecPlan, not a Program, because it is one focused P0 route, auth, checkout, entitlement, docs, and proof slice.
- [x] 2026-05-07 11:13:59 EDT: Decided to remove active pre-purchase checkout intents in this pass rather than keep them as product-routing machinery.
- [x] 2026-05-07 11:58:52 EDT: Researched Stripe, Clerk, and Convex guidance and decided the durable method is Stripe webhook plus return-page fulfillment, Clerk email OTP proof, and Convex verified-email entitlement claiming.
- [x] 2026-05-07 11:58:52 EDT: Decided `/checkout/email-handoff` should be removed as a user-facing route, not kept as compatibility for normal buyer traffic.
- [x] 2026-05-07 12:05:00 EDT: Simplified the buyer UX decision: Stripe prepares access for the checkout email, Clerk OTP creates the browser session when needed, and successful first arrival opens `/workspace/choose` with a one-time celebratory confirmation.
- [x] 2026-05-07 12:10:00 EDT: Clarified the primary customer path: first-time buyers do not have accounts, so fulfillment creates the Clerk user and Convex access before OTP creates the browser session.
- [x] 2026-05-07 12:21:43 EDT: Decided the workspace welcome is a lightweight `welcome=checkout` route state, not durable account state.
- [x] 2026-05-07 12:24:20 EDT: Decided post-checkout sign-in should prefill and lock the server-validated Stripe checkout email without placing the email in the URL.
- [x] 2026-05-07 12:28:03 EDT: Decided generic signed-out protected-route recovery should use normal sign-in without `welcome=checkout`; the welcome state belongs only to the immediate checkout-success handoff.
- [x] 2026-05-07 12:29:57 EDT: Decided to leave old Convex checkout-intent fields as legacy-readable optional storage but stop new writes and active code dependency.
- [x] 2026-05-07 12:35:00 EDT: Grilled the plan against `AGENTS.md`, `apps/web/AGENTS.md`, `docs/release-workflow.md`, and live docs/tests; found release-flow and stale-doc weaknesses that are now part of this plan.
- [x] 2026-05-07 13:11:18 EDT: Removed active checkout intent from homepage CTAs, checkout buttons, checkout API request bodies, Stripe metadata creation, and new Convex writes while leaving legacy metadata readers/schema fields in place.
- [x] 2026-05-07 13:11:18 EDT: Changed checkout success so paid guest sessions run return-page fulfillment, signed-out buyers route to `/sign-in?redirect_url=/workspace/choose?welcome=checkout`, and the old claim/prove fixture state is gone.
- [x] 2026-05-07 13:11:18 EDT: Added `fulfillCheckoutSessionFromSuccessPage`, backed by the same idempotent Convex paid-email fulfillment path used by the Stripe webhook.
- [x] 2026-05-07 13:11:18 EDT: Made OTP sign-in default to `/workspace/choose`, locked the immediate post-checkout sign-in email from server-validated Stripe cookie state, and kept missing-account and invalid-code errors field-local.
- [x] 2026-05-07 13:11:18 EDT: Added the field-level `Purchase a license` link to `/#pricing` for missing passwordless accounts.
- [x] 2026-05-07 13:11:18 EDT: Updated focused checkout, sign-in, route, access, workspace choice, Convex grant, and webhook tests plus the active auth/checkout/release docs for the new contract.
- [x] 2026-05-07 13:18:45 EDT: Passed focused unit, Convex grant, integration UI, Stripe checkout route, app lint/typecheck/format, repo lint/typecheck/format, docs lint, public readiness lint, ExecPlan lint, and whitespace checks.
- [x] 2026-05-07 13:21:12 EDT: Updated hosted Stripe proof tooling so dev card-payment verification expects neutral product metadata and proof sign-in defaults to `/workspace/choose`.
- [x] 2026-05-07 13:44:13 EDT: Opened draft PR #218, ran the requested review swarm, removed the stale checkout-handoff integration test, strict-gated course metadata, protected success-page fulfillment with a server-only token, and upgraded dev card-payment proof to assert the passwordless workspace handoff.
- [x] 2026-05-07 13:49:43 EDT: Fixed the PR `static` full-unit regressions by making `/workspace/choose` tolerate the legacy no-argument test render without violating Next.js page prop typing and by updating the pending-checkout external redirect fallback expectation to `/workspace/choose`; full app unit and app typecheck now pass locally.
- [x] 2026-05-07 14:02:24 EDT: Addressed CodeRabbit follow-up by splitting checkout-success fulfillment retry auth to `CHECKOUT_FULFILLMENT_RETRY_SECRET`, tightening checkout-welcome redirect classification, removing personal test-email literals from the committed ExecPlan, and adding the missing proof/test assertions.
- [x] 2026-05-07 14:45:00 EDT: Proved hosted Stripe test-mode purchase on the Vercel PR preview. Session `cs_test_a1zp6FwaGGjX7u9hyhO4WX8ONSxOSwIa4ZX13HQnGNTDwB9W4c9HSO47Cr` completed for `25000` cents, PaymentIntent `pi_3TUWvvELhKLJkXlW1wYQP2uN` succeeded, new metadata was neutral, and the signed-out buyer landed on `/sign-in?redirect_url=/workspace/choose?welcome=checkout` with email locked, password hidden, and no checkout claim page.
- [x] 2026-05-07 15:06:00 EDT: Tightened checkout redirect origin selection so request-scoped checkout URLs only use trusted app, Vercel branch, Vercel deployment, Vercel production, or local-development origins, while retaining the buyer-origin fix that made preview proof work.
- [x] 2026-05-07 15:09:08 EDT: Refreshed `dev` staging to commit `77b158cfe5362e8f3d8c73fc4ff624ce21a163e1`, whose tree matches PR head `8407195307e49fdf24e2f02f0819d6436b1b4012`, and passed GitHub `Dev Staging Payment Proof` run `25516341830`. The proof confirmed `https://dev.man-meets-ai.com` creates neutral test-mode Checkout Session `cs_test_a1RP1mMh7uluCfMy7qemOPO9VqN48AdAgy6VzamVDk2uwApxqME8ulj9nD`, PaymentIntent `pi_3TUXI9ELhKLJkXlW1mG2Jpqw`, returns through `/checkout/success`, and reaches `/sign-in?redirect_url=/workspace/choose?welcome=checkout` with email locked, password hidden, and no claim page.
- [x] 2026-05-07 15:12:00 EDT: Completed real dev OTP login proof with `me@parkerrex.com`, because the connected Gmail mailbox exposed that inbox and the user approved using the alternate email. Clerk sent a development verification-code email at `2026-05-07T19:12:18Z`; the app accepted the code and landed on `https://dev.man-meets-ai.com/workspace/choose` with `passwordVisible=false` and `claimPageVisible=false`.
- [x] 2026-05-07 15:12:00 EDT: Audited `ea@parkerrex.com` in Clerk. Exactly one Clerk user exists for that email, it was created at `2026-05-07T14:02:09.560Z`, the email is verified, and it has not recorded a sign-in yet. Gmail connector searches still returned the `me@parkerrex.com` mailbox rather than EA-addressed OTP mail.
- [ ] Merge PR #218 after checks stay green, then prove production after merge.

## Surprises & Discoveries

The workspace chooser already exists at `apps/web/app/(workspace)/workspace/choose/page.tsx`. It already renders the three lanes when the viewer has product access and `fulfillmentTrack` is `unspecified`. It redirects users with `fulfillmentTrack: "generated_codebase"` to `/codebase` and users with `fulfillmentTrack: "existing_codebase_doctor"` to `/workspace/setup`.

The current public homepage checkout configuration in `apps/web/config/product.ts` sets `buyerStartingPoint: "no_codebase"` for hero and pricing CTAs. `apps/web/platform/billing/checkout/checkout-intent.ts` maps that buyer starting point to `fulfillmentTrack: "generated_codebase"`. This is why the purchase path chooses generated-codebase before the user reaches the chooser.

The current checkout success state in `apps/web/platform/billing/checkout/checkout-session.ts` returns `checkout_email_handoff_required` when a paid guest checkout has a checkout email but the browser has no Clerk session. `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts` then renders the "Prove checkout email" UI state. The fixture for that state still exists in `apps/web/app/checkout/success/_lib/checkout-success-fixtures.ts` even though dev and production currently 404 fixtures when fixture mode is disabled.

The sign-in route in `apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx` redirects `/sign-in?redirect_url=/checkout/success?...` into `/checkout/email-handoff`. That means even a normal sign-in redirect can surface the old checkout claim page.

The missing-account message is currently a plain string in `apps/web/app/(identity)/_lib/passwordless-auth-errors.ts`. The shared `FieldError` component in `apps/web/components/ui/field.tsx` already supports `children`, so the missing-account field can render a link without changing the shared error type.

Stripe's Checkout fulfillment documentation recommends automated fulfillment with webhooks and also recommends triggering the same fulfillment function from the return page because webhooks can be delayed. The current repo already has a close version of this in `apps/web/convex/checkoutClaimsActions.ts`: `fulfillCheckoutSessionByEmail` retrieves the Stripe Checkout Session, validates this product, checks `payment_status`, extracts the checkout email, creates or finds the Clerk user with `skip_password_requirement: true`, upserts a pending checkout claim, and repairs the product access grant. The gap is that the action is currently internal-only for webhook use, while checkout success still routes signed-out paid buyers into the handoff page instead of running a landing-page fulfillment attempt and sending them through normal OTP sign-in.

Clerk's current custom email OTP flow supports passwordless sign-in with `signIn.create`, `signIn.emailCode.sendCode`, `signIn.emailCode.verifyCode`, and finalization. The repo's `apps/web/app/(identity)/_components/sign-in/use-sign-in-flow.ts` already follows this shape and detects missing accounts through `signIn.isTransferable`. The bug is not that a special checkout proof UI is required; the bug is that app routing escapes from the normal sign-in form into `/checkout/email-handoff`.

Convex authentication exposes the current Clerk identity through `ctx.auth.getUserIdentity()`. With the Clerk integration, that identity can include `email` and `emailVerified`. The repo already uses this correctly in `claimLatestPendingCheckoutForViewer`, which refuses to claim pending checkout access unless the authenticated viewer has a verified email matching the normalized checkout email. This should remain the entitlement recovery guard after normal OTP sign-in.

The Gmail connector is callable after plugin reinstall, but searches for `to:{{TEST_CHECKOUT_EMAIL}} newer_than:30d` returned no messages during research. A broader search found mail in the connected mailbox mentioning the checkout test setup. During real OTP proof, trigger a fresh Clerk code first and then search recent Man Meets AI or Clerk auth mail. If no OTP arrives through the connector, record the account-scope limitation and use browser mailbox access or user-assisted login.

The current release workflow in `docs/release-workflow.md` no longer treats `dev` as release authority. `dev` is a branch-backed Vercel Preview payment staging lane for `https://dev.man-meets-ai.com`; production release authority is `main`. This plan must therefore use `dev` for hosted Stripe test-mode proof only and keep the release PR into `main`.

Several active docs still teach the old route and fulfillment model. Current inspection found stale `/checkout/email-handoff` or pre-purchase checkout-intent guidance in `apps/web/content/docs/clerk-convex-auth.mdx`, `apps/web/content/docs/index.mdx`, `apps/web/content/docs/how-the-starter-works.mdx`, `apps/web/content/docs/route-map.mdx`, `apps/web/content/docs/stripe-checkout-webhook.mdx`, `apps/web/content/docs/troubleshooting/stripe-convex.mdx`, `apps/web/content/docs/configure-the-homepage.mdx`, and `docs/release-workflow.md`. These are implementation-owned documentation surfaces for this hotfix.

## Decision Log

Decision: This is one ExecPlan, not a Program.
Rationale: The work is a single P0 hotfix with tightly coupled route, auth, checkout, entitlement, docs, and release proof changes. Splitting it into a Program would add coordination overhead without making the work safer.
Date: 2026-05-07

Decision: Checkout buys access; workspace choice selects product path.
Rationale: Pre-purchase routing intent is causing confusion and code complexity. Letting paid users choose after purchase makes the product easier to discover and removes the silent generated-codebase default.
Date: 2026-05-07

Decision: Remove active pre-purchase checkout intent machinery in this pass.
Rationale: Keeping `buyerStartingPoint`, CTA-specific checkout routing, and generated-vs-existing checkout metadata in the active path preserves the same confusing model. The hotfix should retire that model now, while preserving only the minimum legacy decoding needed for old Stripe or Convex records.
Date: 2026-05-07

Decision: Keep persisted fulfillment choice after purchase.
Rationale: Once a paid user chooses generated-codebase or existing-codebase setup, future visits should resume to the right workspace. That is not pre-purchase checkout intent; it is post-purchase product state.
Date: 2026-05-07

Decision: Do not render checkout-success claim UI.
Rationale: A buyer should not see "Prove checkout email" or a fixture-like claim page. Auth should be a normal email-code sign-in step and the destination should be `/workspace/choose`.
Date: 2026-05-07

Decision: Delete `/checkout/email-handoff` as a user-facing route in this hotfix.
Rationale: Keeping a hidden claim route preserves the exact mental model that caused the incident. The product should have one identity proof path, `/sign-in`, and one first paid destination, `/workspace/choose`. Old deep links may 404 rather than carrying a broken recovery concept forward.
Date: 2026-05-07

Decision: Use Stripe webhook fulfillment plus checkout-success fulfillment, both backed by the same idempotent Convex function.
Rationale: Stripe explicitly requires webhooks for reliable fulfillment because buyers might never reach the return page, and recommends return-page fulfillment because webhooks can be delayed while the buyer is present. Calling one shared function from both sources gives immediate UX without creating two entitlement systems.
Date: 2026-05-07

Decision: Use a dedicated `CHECKOUT_FULFILLMENT_RETRY_SECRET` for checkout-success fulfillment retries.
Rationale: The Stripe webhook signing secret should verify Stripe webhook signatures only. The success-page retry is a server-to-Convex bearer check, so it gets a separate high-entropy secret mirrored into Vercel and Convex for each environment.
Date: 2026-05-07

Decision: Clerk email OTP is the only checkout email ownership proof.
Rationale: The buyer proves control of the checkout email by signing in normally with a Clerk one-time email code. The app must not invent a second "prove checkout email" screen when Clerk already owns the identity proof and Convex can trust the resulting verified identity.
Date: 2026-05-07

Decision: Convex claims pending checkout access only from server-validated Stripe data or an authenticated verified Clerk email.
Rationale: The browser must not be trusted to provide user ids, checkout emails, or product access. Convex should retrieve Stripe sessions server-side, validate product and payment status, and use `ctx.auth.getUserIdentity()` plus `emailVerified` when attaching pending claims after sign-in.
Date: 2026-05-07

Decision: Payment pending is state on `/checkout/success`, not a page.
Rationale: Delayed or unpaid Stripe statuses should feel like one checkout finalization flow. A separate payment-pending route would add another product surface and more routing states without improving recovery.
Date: 2026-05-07

Decision: Do not auto-login signed-out buyers from Stripe email alone.
Rationale: Stripe gives the app a checkout email, but that email is not a Clerk-authenticated browser session. The app can create or repair the Clerk account and Convex access for that email, but a signed-out browser must still prove control of the email with Clerk OTP before receiving a session.
Date: 2026-05-07

Decision: Treat first-time paid checkout as account creation.
Rationale: The normal customer does not have a Clerk account before buying. Paid checkout fulfillment should create or find the Clerk user for the Stripe checkout email and grant access before the customer signs in. The OTP step is not account claiming; it is the browser login proof for the account the server already created.
Date: 2026-05-07

Decision: Add a one-time paid-arrival confirmation on workspace choice.
Rationale: The best customer experience is not another recovery page. It is a direct arrival in the product with a small confirmation that access is active and associated with the checkout email, plus a route to account settings if they need to manage it.
Date: 2026-05-07

Decision: Implement the paid-arrival confirmation as transient route state.
Rationale: Use `/workspace/choose?welcome=checkout` after checkout and OTP, show confetti plus a compact banner, then remove the query parameter with `router.replace("/workspace/choose")`. This creates a polished first-arrival moment without adding Convex schema, a permanent seen flag, or cross-device state.
Date: 2026-05-07

Decision: Emit `welcome=checkout` only from checkout success.
Rationale: A returning paid user who lands on a protected route while signed out should not see checkout celebration again. Generic protected-route recovery should send the user to normal sign-in for the requested route or workspace destination without the checkout welcome parameter. The welcome state is only for the immediate post-payment handoff.
Date: 2026-05-07

Decision: Prefill and lock the post-checkout OTP email from server-validated Stripe state.
Rationale: The buyer should not retype the email they just paid with, and the app should not put the checkout email in query parameters. The sign-in server page can read the existing httpOnly pending checkout session cookie, retrieve and validate the paid Stripe Checkout Session, derive the checkout email server-side, and pass it as `initialEmail` to the client sign-in form.
Date: 2026-05-07

Decision: Keep old checkout-intent fields as legacy-readable storage only.
Rationale: `fulfillmentTrack` remains active as the post-purchase workspace choice. `buyerStartingPoint` and checkout CTA-specific routing should stop being written or used by new code. The existing optional Convex fields may remain in schema and validators during this P0 hotfix so old access grants and pending claims remain readable without a risky data migration.
Date: 2026-05-07

Decision: Build from `origin/main`, target `main` for release, and use `dev` only for payment staging proof.
Rationale: `docs/release-workflow.md` says feature and hotfix PRs target `main`; `dev` is no longer a release-candidate branch. The user still needs real dev checkout proof, so the implementation may refresh the `dev` branch or use the Vercel preview branch domain for staging evidence, but that staging proof does not replace the reviewed PR into `main`.
Date: 2026-05-07

## Outcomes & Retrospective

Implementation is complete locally and the validation suite passed. The remaining work is hosted proof and PR/release flow. The shipped behavior under test is the original P0 failure path: a newly paid user and a returning paid user must authenticate passwordlessly and reach the product without seeing a password prompt, a checkout claim page, duplicated error messages, or a preselected product path.

## Context and Orientation

The web app lives in `apps/web`. The relevant product routing constants are in `apps/web/config/product.ts`. The current route names are `routeConfig.checkoutSuccess` for `/checkout/success`, `routeConfig.signIn` for `/sign-in`, `routeConfig.workspaceChoice` for `/workspace/choose`, `routeConfig.codebase` for `/codebase`, `routeConfig.workspaceSetup` for `/workspace/setup`, `routeConfig.tutorials` for `/tutorials`, and `routeConfig.pricingHash` for `#pricing`.

The current checkout flow starts in the public homepage and pricing CTAs. Those CTAs are configured through `starterConfig.homePage` in `apps/web/config/product.ts` and rendered by components under `apps/web/app/_components/home-page/`. They call the Stripe checkout API route in `apps/web/app/api/stripe/checkout/route.ts` or the express checkout route in `apps/web/app/api/stripe/checkout/express/route.ts`. Those API routes currently normalize request body intent through `apps/web/platform/billing/checkout/checkout-intent.ts` and send metadata into Stripe via `apps/web/platform/billing/checkout/checkout-session-params.ts`.

The product access grant is stored in Convex. The Convex access model is in `apps/web/convex/access/model.ts`. The Stripe webhook code is in `apps/web/convex/stripeWebhook.ts`, and checkout claim/fulfillment actions are in `apps/web/convex/checkoutClaimsActions.ts` and `apps/web/convex/checkoutClaims.ts`. The app already creates or resolves a Clerk user for paid checkout email fulfillment using `CLERK_SECRET_KEY` and `skip_password_requirement: true`. That account creation path is the primary first-time buyer path, not an edge recovery path. This plan must not use Convex local mode; hosted Convex dev is the validation backend.

The checkout success page is `apps/web/app/checkout/success/page.tsx`. It computes a `CheckoutSessionState` through `apps/web/platform/billing/checkout/checkout-session.ts` and renders a view model from `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts`. Today that state includes `checkout_email_handoff_required`, and the view model renders "Prove checkout email". The fixture registry for checkout success lives in `apps/web/app/checkout/success/_lib/checkout-success-fixtures.ts`.

The checkout email handoff page is `apps/web/app/checkout/email-handoff/page.tsx`, with UI under `apps/web/app/(identity)/_components/checkout-email-handoff/`. It currently exists as a user-facing page that locks the email address to the Stripe checkout email and sends a Clerk email code. This page should be removed in this hotfix. The normal replacement is `/sign-in` using the same Clerk email OTP mechanism, followed by `/workspace/choose`.

The sign-in page is `apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx`. The passwordless client flow is in `apps/web/app/(identity)/_components/sign-in/use-sign-in-flow.ts`, and the form is in `apps/web/app/(identity)/_components/sign-in/sign-in-email-code-form.tsx`. Error normalization is in `apps/web/app/(identity)/_lib/passwordless-auth-errors.ts`. Clerk must be configured with email sign-in and email verification code enabled in both dev and production. Password sign-in should not be part of this product flow.

The workspace choice page is `apps/web/app/(workspace)/workspace/choose/page.tsx`. It uses `loadWorkspacePageAccess` to enforce access, redirects already-resolved users, and renders `WorkspaceFulfillmentChoice` from `apps/web/app/(workspace)/_components/workspace-fulfillment-choice.tsx` for unresolved users. The choice component currently has three visible options: `Generate a new codebase`, `Set up an existing codebase`, and `Watch tutorial videos`. The generated and existing-codebase choices call `api.access.resolveViewerFulfillmentTrack` to persist a fulfillment track, while tutorials currently navigates to `/tutorials` without locking the user into a fulfillment track.

Use these plain-language definitions. A checkout is the Stripe payment session. Product access is the entitlement that lets a Clerk user enter protected Ship by Sunday surfaces. A fulfillment track is the post-purchase product path stored after the user chooses a lane. A pre-purchase checkout intent is the old request and Stripe metadata that tried to choose a product path before purchase. OTP means one-time password or one-time passcode; in this app it means a Clerk email verification code.

### In Scope

This plan includes removing active pre-purchase checkout intent from homepage, pricing, checkout API, Stripe session metadata, Convex grant creation, and tests. It includes keeping the smallest legacy reader necessary so old Stripe sessions or old Convex grants with intent metadata remain readable during recovery. It includes making new public checkout path-neutral, routing successful paid users to `/workspace/choose`, and making OTP sign-in default to `/workspace/choose`.

This plan includes deleting checkout-success claim UI, removing the `checkout_email_handoff_required` checkout-success fixture, deleting `/checkout/email-handoff` and its custom UI/tests, updating sign-in redirect logic so `/checkout/success` does not bounce into the old handoff page, and making the missing-account error render one `Purchase a license` link to `/#pricing`.

This plan includes adding or exposing a narrow checkout-success fulfillment fast path that retrieves and validates the Stripe Checkout Session server-side and calls the same idempotent Convex fulfillment logic used by the Stripe webhook. This fast path may be a public Convex action with no auth requirement if it accepts only a Stripe Checkout Session id, retrieves Stripe server-side, validates this product and `payment_status`, and never trusts client-provided email or user id. It may alternatively be a Next.js server route that delegates to the same Convex internals, but it must not duplicate fulfillment logic.

This plan includes preserving existing resolved-user behavior. Users already resolved to `generated_codebase` continue to `/codebase`. Users already resolved to `existing_codebase_doctor` continue to `/workspace/setup`. Users with no selected fulfillment track go to `/workspace/choose`. The tutorials choice should continue to avoid locking fulfillment unless implementation discovers a product reason to change that, in which case this ExecPlan must be updated first.

This plan includes updating docs that future operators will actually read when configuring Clerk, Stripe, Convex, and the paid-user handoff. It includes dev and production browser proof using Vercel, Stripe test mode where appropriate, Clerk OTP, Gmail code retrieval where possible, a release PR into `main`, and optional `dev` branch staging only for hosted payment proof.

### Out Of Scope

This plan does not change pricing, Stripe products or prices, refunds, coupons, production release versioning, protected tag policy, or the broader release proof architecture. It does not build a new landing page or redesign the workspace chooser beyond copy and behavior needed for the hotfix. It does not delete old production access grants or manually rewrite historical Stripe metadata.

This plan does not add social sign-in, password sign-in, passkeys, phone auth, or account portal changes. It does not require changing the Clerk dashboard if dev and production already have email-code sign-in enabled and password sign-in disabled for this flow, but the docs must record the required Clerk setup and the failure mode when email-code sign-in is missing.

This plan does not silently absorb unrelated work from local `main`, `.worktrees/`, stale dev refresh branches, or unrelated active ExecPlans. Work from this plan should stay on `codex/passwordless-workspace-choice-hotfix` or its successor branch if renamed.

## Plan of Work

Start by tightening the active checkout data model. Inspect `apps/web/platform/billing/checkout/checkout-intent.ts`, `apps/web/platform/billing/checkout/checkout-session-params.ts`, the Stripe checkout API routes, and the Convex access grant path. Remove the active request-body concept that lets public CTAs submit `buyerStartingPoint` or `checkoutCtaId`. New checkouts should not write generated-codebase or existing-codebase routing metadata to Stripe. Keep `fulfillmentTrack` as post-purchase state only. If a compatibility decoder remains, name it as legacy checkout metadata and restrict it to old sessions or old grants. Do not let new public checkout creation depend on it.

Then update `apps/web/config/product.ts` and homepage CTA tests. Remove `checkoutIntent` from `HomePageCtaTarget` if no active caller needs it. If the rendering layer still needs to know that a CTA starts checkout, keep `kind: "checkout"` without path-routing payload. Update `apps/web/app/_lib/home-page-render-model.ts`, the homepage primary CTA components, express checkout button props, and their tests so the public purchase path starts a neutral checkout.

Update the Convex grant and access model around fulfillment choice. Product access should still store `fulfillmentTrack` when a user chooses generated or existing setup after purchase. New Stripe grants should start with no chosen fulfillment track or an explicit `unspecified` value only if the schema requires it. If old fields such as `buyerStartingPoint` or `checkoutCtaId` are present in validators or schema, remove them from new writes and from app-facing types where possible. If removing stored schema fields would require a risky data migration, keep the stored fields as legacy optional fields but remove them from active code paths and browser-facing contracts. Record the exact choice in the Decision Log while implementing.

Update checkout success. The page should not render `checkout_email_handoff_required` as a success surface. Checkout success should first attempt the same idempotent server-side fulfillment that the Stripe webhook uses. For the normal first-time buyer, fulfillment creates or finds the Clerk user for the Stripe checkout email and grants access before the browser is logged in. The signed-out buyer then goes to `/sign-in?redirect_url=/workspace/choose?welcome=checkout`, enters the normal Clerk email code, receives a Clerk browser session for that already-created account, and lands on `/workspace/choose?welcome=checkout`. Returning or already-authenticated buyers with a valid Clerk session for the access-owning account may go to `/workspace/choose?welcome=checkout` immediately from checkout success. Generic later sign-in should not add `welcome=checkout`. If a browser is signed in as an account that cannot receive the purchase because the session belongs to a different checkout email, show a simple account mismatch state with one action to sign out and continue with the checkout email. This is not a gift-purchase feature; it is a guard against attaching paid access to the wrong Clerk session. Pending payments stay on `/checkout/success` with a polished finalizing or processing state. Do not route normal users to `/checkout/email-handoff`.

Delete the old checkout email handoff surface. Remove `apps/web/app/checkout/email-handoff/page.tsx`, the UI under `apps/web/app/(identity)/_components/checkout-email-handoff/`, `routeConfig.checkoutEmailHandoff`, route metadata imports, tests, release-scope allowlists, and docs that describe it as an active route. Update any old `/sign-up?session_id=...` or `/sign-in?redirect_url=/checkout/success?...` logic so it points to normal sign-in and workspace choice or returns `notFound()` for unsupported legacy claim links.

Update sign-in. Change `authViewConfig.fallbackRedirectUrl` in `apps/web/config/product.ts` from `/codebase` to `/workspace/choose`. Remove or narrow `buildCheckoutEmailHandoffHrefForSuccessRedirect` usage in the sign-in route so a checkout success redirect does not surface the old claim page. When the safe redirect path is `/workspace/choose?welcome=checkout`, the sign-in server page should read the httpOnly pending checkout session cookie, retrieve and validate the paid Stripe Checkout Session, derive the checkout email, and pass it to the client as a locked `initialEmail`. Keep `useSignInFlow` on Clerk email-code sign-in. Ensure completion navigates to the provided safe redirect path or the new workspace-choice fallback.

Update sign-in errors. Keep invalid OTP as a single field-level error reading `That code is incorrect. Use the latest email code or send a new one.` Keep missing account as a single field-level error. Render `Purchase a license` as a link to `${routeConfig.home}${routeConfig.pricingHash}`. Do this locally in `sign-in-email-code-form.tsx` or a small sign-in-specific component instead of widening the shared `FieldError` API unless that is clearly less code. Ensure the top banner does not duplicate the same missing-account or invalid-code error.

Update workspace choice only where needed. Confirm `WorkspaceFulfillmentChoice` still shows the three options. Use `/workspace/choose?welcome=checkout` only for the immediate checkout-success handoff, show confetti plus a compact banner that says access is active for the checkout email and links to account settings, then remove the query parameter with `router.replace("/workspace/choose")`. Do not add a new page, Convex field, or durable seen flag for this confirmation. A returning paid user who is merely signed out should use normal sign-in and should not receive the checkout welcome parameter. If product language should say worker install rather than existing-codebase setup, make a small copy update, but do not redesign the page. Confirm generated and existing choices call `api.access.resolveViewerFulfillmentTrack`, and tutorials still leaves fulfillment unresolved unless the product decision changes during implementation.

Update protected-route access recovery. Remove the `checkout_email_handoff_required` branch from `apps/web/platform/access/product-access.ts`, `apps/web/app/(workspace)/_lib/access-required-view-model.ts`, and `apps/web/app/(workspace)/_hooks/use-access-required-controller.ts`. If a signed-out user hits a protected route, redirect to normal `/sign-in` with the current safe destination. If a pending paid checkout cookie exists, sign-in may still use server-validated Stripe state to prefill the email only when the request is part of the immediate checkout-success flow; otherwise keep the normal editable sign-in form. Do not send generic protected-route recovery to `/workspace/choose?welcome=checkout`.

Update docs. At minimum, update `apps/web/content/docs/clerk-convex-auth.mdx`, `apps/web/content/docs/index.mdx`, `apps/web/content/docs/how-the-starter-works.mdx`, `apps/web/content/docs/route-map.mdx`, `apps/web/content/docs/stripe-checkout-webhook.mdx`, `apps/web/content/docs/troubleshooting/stripe-convex.mdx`, `apps/web/content/docs/configure-the-homepage.mdx`, and `docs/release-workflow.md`. The docs must state that Clerk email-code sign-in is required in dev and production, password sign-in is not the buyer flow, checkout grants neutral access, `/checkout/success` is a transient finalization route, and `/workspace/choose` is the first paid product destination. Document the failure mode: if Clerk email verification code sign-in is disabled, the app can show an email-code factor missing message or fail to send OTP. Document that `/checkout/email-handoff` is gone and should not be reintroduced as the happy path. Update homepage docs so checkout CTAs are neutral and no longer mention `checkoutIntent`, `buyerStartingPoint`, or CTA-specific checkout routing for new purchases. Update `docs/release-workflow.md` so dev and production proof no longer expects `/checkout/success` to forward into `/start`.

Update tests incrementally. Start with unit tests for checkout model simplification, sign-in redirect, and auth fallback. Then update integration UI tests for checkout success and sign-in. Finally update Stripe checkout route tests and Convex access tests so new grants do not carry pre-purchase routing intent and old grants remain compatible if legacy decoding remains.

After implementation, validate on hosted dev staging without treating `dev` as release authority. The normal release PR targets `main`. If `https://dev.man-meets-ai.com` must be refreshed, update or PR the same focused commit into the `dev` branch only as a payment-staging step, wait for the Vercel dev deployment, use the Vercel protected-access share URL if needed, buy through Stripe test checkout with `{{TEST_CHECKOUT_EMAIL}}`, and confirm the flow reaches `/workspace/choose?welcome=checkout` then cleans itself to `/workspace/choose`. Log out, sign in with OTP, fetch the newest code from Gmail if possible, and confirm return behavior without `welcome=checkout`. After dev validation, run the review swarm on the release PR into `main`, merge only after required checks pass, deploy, and repeat production smoke with the appropriate safe production proof path.

## Milestones

The first milestone is active checkout intent removal. At the end of this milestone, public checkout calls no longer accept or send pre-purchase path-routing intent, and new Stripe checkout sessions no longer encode generated-codebase or existing-codebase routing metadata. Existing tests that expected `buyerStartingPoint: "no_codebase"` should be updated to expect a neutral checkout. Success is proven by focused unit and route tests around checkout request body normalization, Stripe session params, homepage CTA rendering, and express checkout behavior.

The second milestone is neutral post-checkout routing and fulfillment. At the end of this milestone, paid checkout success calls the shared idempotent fulfillment path, does not render "Prove checkout email", and does not route happy-path users into `/checkout/email-handoff`. The safe destination is `/workspace/choose`, with sign-in handled by the normal OTP form when there is no Clerk session. Success is proven by checkout success tests, sign-in route tests, checkout fulfillment tests, and a local/browser smoke showing no checkout claim UI for the former fixture or recovery path.

The third milestone is passwordless sign-in UX. At the end of this milestone, `/sign-in` is an email-code flow with `/workspace/choose` as the fallback destination, missing accounts show one field-level message with a `Purchase a license` link to `/#pricing`, and invalid OTP shows one field-level message. Success is proven by sign-in integration UI tests and, if possible, a browser OTP flow using a real Clerk code.

The fourth milestone is workspace-choice arrival and entitlement compatibility. At the end of this milestone, new paid users with unresolved fulfillment see the chooser, a first paid arrival can show a one-time celebratory confirmation, generated and existing-codebase choices persist the selected fulfillment track, tutorials remains available without forcing a product path, and already-resolved users still resume correctly. Success is proven by workspace choice tests, Convex access tests, and a direct runtime or browser path check.

The fifth milestone is docs, release PR flow, and hosted proof. At the end of this milestone, operator docs describe the required Clerk OTP setup and new checkout handoff, the release PR targets `main`, dev staging has real purchase and OTP proof if a dev refresh is used, the focused change is reviewed before merge, and production proof confirms the incident is resolved. Success is proven by test commands, browser evidence, PR review evidence, and final dev/production URLs and timestamps recorded in this ExecPlan.

## Concrete Steps

From the repository root, start on a clean branch from `origin/main`:

    git fetch --all --prune
    git switch -c codex/passwordless-workspace-choice-hotfix origin/main
    git status --short --branch

Expected observation: the current branch is `codex/passwordless-workspace-choice-hotfix`, tracking `origin/main`, with no uncommitted changes except this ExecPlan after it is created.

Before editing implementation files, inspect the active route and auth surfaces:

    sed -n '1,220p' apps/web/AGENTS.md
    sed -n '1,160p' docs/release-workflow.md
    sed -n '1,160p' DESIGN.md
    sed -n '1,160p' docs/ship-by-sunday/design-pack/AGENTS.md
    sed -n '1,190p' apps/web/content/docs/configure-the-homepage.mdx
    sed -n '1,220p' apps/web/convex/_generated/ai/guidelines.md
    sed -n '1,180p' node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
    sed -n '1,180p' node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md
    sed -n '1,180p' node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
    sed -n '1,180p' node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
    rg -n "buyerStartingPoint|checkoutCtaId|fulfillmentTrack|checkout_email_handoff_required|Prove checkout email|fallbackRedirectUrl|Purchase a license" apps/web -S
    sed -n '95,115p' apps/web/config/product.ts
    sed -n '380,390p' apps/web/config/product.ts
    sed -n '1,220p' apps/web/platform/billing/checkout/checkout-intent.ts
    sed -n '1,220p' apps/web/platform/billing/checkout/checkout-session-params.ts
    sed -n '121,160p' apps/web/platform/billing/checkout/checkout-session.ts
    sed -n '1,60p' 'apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx'
    sed -n '1,80p' 'apps/web/app/(workspace)/workspace/choose/page.tsx'

Expected observation: homepage CTAs still send `buyerStartingPoint: "no_codebase"`, checkout success still has `checkout_email_handoff_required`, sign-in still redirects checkout-success redirects into email handoff, and the workspace choice page is already available for unresolved fulfillment.

For milestone one, edit these files as needed:

    apps/web/config/product.ts
    apps/web/app/_lib/home-page-render-model.ts
    apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx
    apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-cta-bar.tsx
    apps/web/app/api/stripe/checkout/route.ts
    apps/web/app/api/stripe/checkout/express/route.ts
    apps/web/platform/billing/checkout/checkout-session-params.ts
    apps/web/platform/billing/checkout/checkout-intent.ts
    apps/web/convex/access/model.ts
    apps/web/convex/access/validators.ts
    apps/web/convex/checkoutClaims.ts
    apps/web/convex/checkoutClaimsActions.ts
    apps/web/convex/stripeWebhook.ts
    apps/web/lib/product-access.ts

Remove active request-body path intent from checkout. If `checkout-intent.ts` becomes only legacy code, rename or reduce it so active imports do not imply new checkout intent is still supported. Keep `fulfillmentTrack` for `api.access.resolveViewerFulfillmentTrack` and product access routing after the user chooses a workspace path. If the Convex schema still needs legacy optional fields, leave schema compatibility in place but remove active writes and app-facing dependency on `buyerStartingPoint` and CTA-specific checkout routing.

For milestone two, edit:

    apps/web/app/checkout/success/page.tsx
    apps/web/platform/billing/checkout/checkout-session.ts
    apps/web/platform/billing/checkout/checkout-session-recovery.ts
    apps/web/app/checkout/success/_lib/checkout-success-view-model.ts
    apps/web/app/checkout/success/_lib/checkout-success-fixtures.ts
    apps/web/app/checkout/success/_components/checkout-success-view-content.tsx
    apps/web/platform/auth/auth-route-utils.ts
    apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx
    apps/web/app/checkout/email-handoff/page.tsx
    apps/web/app/(identity)/_components/checkout-email-handoff/
    apps/web/convex/checkoutClaimsActions.ts

Remove the checkout success claim UI state from the user-visible success path. Add or expose a checkout-success fulfillment action that calls the same underlying `fulfillPaidCheckoutSessionByEmail` logic as `fulfillCheckoutSessionByEmail`. The landing-page source should write a deterministic source such as `stripeEventId: "checkout-success:<sessionId>"` and `stripeEventType: "checkout.success.fulfillment"` so repeated page loads are harmless and traceable. Remove `checkout_email_handoff_required` from checkout-success fixtures or make any requested fixture slug return `notFound()`. Delete `/checkout/email-handoff` route code and tests instead of keeping it as a fallback unless implementation discovers a concrete blocker and this ExecPlan is updated first.

For milestone three, edit:

    apps/web/config/product.ts
    apps/web/app/(identity)/_components/sign-in/use-sign-in-flow.ts
    apps/web/app/(identity)/_components/sign-in/sign-in-email-code-form.tsx
    apps/web/app/(identity)/_components/sign-in/sign-in-banners.tsx
    apps/web/app/(identity)/_lib/passwordless-auth-errors.ts

Set the fallback redirect to `/workspace/choose`. Add an optional locked initial email path for post-checkout OTP. The email must come from the server-validated pending Stripe Checkout Session, not from URL search params. Render the missing-account field message with a link to `/#pricing`. Keep duplicate global banners suppressed for missing-account and invalid-code errors.

For milestone four, inspect and update only if needed:

    apps/web/app/(workspace)/workspace/choose/page.tsx
    apps/web/app/(workspace)/_components/workspace-fulfillment-choice.tsx
    apps/web/convex/access/model.ts
    apps/web/tests/integration-ui/workspace-fulfillment-choice.test.tsx

Confirm the chooser still provides generated-codebase, existing-codebase setup, and tutorial video paths. Confirm generated and existing choices persist fulfillment track through Convex, and tutorials remains a link without committing a track.

Update focused tests as implementation changes require. Likely files include:

    apps/web/tests/unit/home-page-render-model.test.ts
    apps/web/tests/unit/home-page-primary-cta.test.tsx
    apps/web/tests/unit/home-page-content.test.ts
    apps/web/tests/unit/home-page-structured-data.test.ts
    apps/web/tests/unit/checkout-session-params.test.ts
    apps/web/tests/unit/checkout-session.test.ts
    apps/web/tests/unit/checkout-success-fixtures.test.ts
    apps/web/tests/unit/sign-in-route.test.ts
    apps/web/tests/unit/sign-in-route-utils.test.ts
    apps/web/tests/unit/sign-up-route.test.ts
    apps/web/tests/unit/route-metadata.test.ts
    apps/web/tests/unit/release-scope.test.ts
    apps/web/tests/unit/access-required-page.test.tsx
    apps/web/tests/unit/course-access.test.ts
    apps/web/tests/unit/convex-product-access-grant.test.ts
    apps/web/tests/unit/checkout-claims.test.ts
    apps/web/tests/unit/checkout-claims-actions.test.ts
    apps/web/tests/unit/stripe-webhook-action.test.ts
    apps/web/tests/integration/stripe-checkout-route.test.ts
    apps/web/tests/integration-ui/home-page-primary-cta.test.tsx
    apps/web/tests/integration-ui/home-page-product-preview.test.tsx
    apps/web/tests/integration-ui/checkout-button.test.tsx
    apps/web/tests/integration-ui/express-checkout-button.test.tsx
    apps/web/tests/integration-ui/checkout-success-view.test.tsx
    apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx
    apps/web/tests/integration-ui/sign-in-page.test.tsx
    apps/web/tests/integration-ui/workspace-fulfillment-choice.test.tsx
    apps/web/tests/integration-ui/access-required-page.test.tsx
    apps/web/tests/integration-ui/access-required-page.interactions.test.tsx

Update docs after behavior is implemented:

    apps/web/content/docs/clerk-convex-auth.mdx
    apps/web/content/docs/index.mdx
    apps/web/content/docs/how-the-starter-works.mdx
    apps/web/content/docs/route-map.mdx
    apps/web/content/docs/stripe-checkout-webhook.mdx
    apps/web/content/docs/troubleshooting/stripe-convex.mdx
    apps/web/content/docs/configure-the-homepage.mdx
    docs/release-workflow.md

Update `docs/release-workflow.md` in this pass because its hosted proof language still describes the retired checkout-success-to-start behavior. Do not edit generated mirrors unless the source docs or generation path requires it.

For dev browser proof, use the in-app browser and Vercel protected access if necessary. If a Vercel login wall appears, use the Vercel connector to get access to the dev URL before asking the user to log in. For OTP, trigger a fresh code first, then search Gmail:

    newer_than:1d (from:accounts.dev OR from:clerk.com OR subject:code OR subject:verification)
    to:{{TEST_CHECKOUT_EMAIL}} newer_than:1d
    newer_than:1d {{TEST_CHECKOUT_EMAIL}}

Expected observation: a fresh Man Meets AI or Clerk email contains a six-digit code. If the Gmail connector cannot see the EA inbox, record that limitation and use browser mailbox access or user-assisted code retrieval.

## Validation and Acceptance

This plan is accepted when a new paid checkout on dev buys access without selecting a product path, authenticates through email OTP if needed, and lands on `/workspace/choose`. The chooser must show the generated-codebase path, tutorial videos path, and existing-codebase or worker setup path. Immediate first paid arrival may show one celebratory confirmation, but it must not create a new route or block the chooser. A later signed-out return must not get `welcome=checkout` just because the user already paid. Choosing generated or existing setup must persist the selected fulfillment path so later visits resume correctly. Tutorials must remain available without accidentally locking the fulfillment path unless this plan is explicitly updated with a changed product decision.

Checkout success is accepted when no happy-path or fixture path renders "Prove checkout email" or a checkout claim page. A paid signed-out buyer should hit checkout success, have fulfillment attempted server-side through the same idempotent path used by the webhook, go through normal sign-in with `redirect_url=/workspace/choose?welcome=checkout` or an equivalent safe immediate-checkout destination, then product access should attach through the already-created grant, the pending checkout session, or the latest pending checkout claim. Users should not see password fields as part of the buyer flow.

Sign-in is accepted when post-checkout OTP pre-fills and locks the server-derived checkout email, missing paid account and invalid OTP errors are shown once next to the relevant field, and no email address is exposed in the URL. The missing-account text must include a real `Purchase a license` link to `/#pricing`. The invalid-code text must tell the user the code is incorrect and to use the latest code or send a new one. The top banner must not duplicate those field errors.

Compatibility is accepted when already-resolved paid users still land on their selected workspace path. Existing generated-codebase users go to `/codebase`. Existing-codebase users go to `/workspace/setup`. Unresolved users go to `/workspace/choose`. Old Stripe sessions or old Convex grant records must not crash checkout recovery or access checks if they still contain legacy checkout intent fields.

Docs are accepted when the app docs describe the external setup contract: Clerk email sign-in with email verification code must be enabled in dev and production, password sign-in is not the paid buyer flow, Stripe checkout grants neutral access, checkout success is a transient finalization route backed by webhook and landing-page fulfillment, and workspace choice is the first paid product destination. The docs must also say what failure looks like when Clerk email-code auth is missing and must not describe `/checkout/email-handoff` as an active buyer route.

Hosted proof is accepted when dev has both purchase proof and OTP login proof with timestamps, then production has the same smoke after merge. If Gmail cannot see the `{{TEST_CHECKOUT_EMAIL}}` OTP, the proof record must state the connector limitation and how the OTP was retrieved instead.

### Test Commands

Run focused checks first from the repository root:

    bun run --cwd apps/web test:unit -- tests/unit/home-page-render-model.test.ts tests/unit/home-page-primary-cta.test.tsx tests/unit/home-page-content.test.ts tests/unit/home-page-structured-data.test.ts tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/checkout-success-fixtures.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/checkout-claims.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/convex-product-access-grant.test.ts tests/unit/course-access.test.ts tests/unit/sign-in-route.test.ts tests/unit/sign-in-route-utils.test.ts tests/unit/sign-up-route.test.ts tests/unit/route-metadata.test.ts tests/unit/release-scope.test.ts tests/unit/access-required-page.test.tsx
    bun run --cwd apps/web test:integration:node -- tests/integration/stripe-checkout-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/checkout-button.test.tsx tests/integration-ui/express-checkout-button.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/workspace-fulfillment-choice.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx

Run broader app and repo gates before PRs:

    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-07-passwordless-checkout-workspace-choice-hotfix.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-07-passwordless-checkout-workspace-choice-hotfix.md apps/web/content/docs/clerk-convex-auth.mdx apps/web/content/docs/index.mdx apps/web/content/docs/how-the-starter-works.mdx apps/web/content/docs/route-map.mdx apps/web/content/docs/stripe-checkout-webhook.mdx apps/web/content/docs/troubleshooting/stripe-convex.mdx apps/web/content/docs/configure-the-homepage.mdx docs/release-workflow.md
    bun run public-readiness:lint
    git diff --check

Run hosted dev proof only after the same focused commit is available on `https://dev.man-meets-ai.com` through the staging branch or a protected Vercel preview. Record the exact dev URL, deployment id if available, test email, Stripe test card path, final URL, and timestamp in `Artifacts and Notes`.

Run production proof only after the reviewed change is merged to `main` and deployed. Do not use Stripe test card on live production unless the production environment is explicitly in test mode. For production, use the smallest safe proof that verifies login and route behavior for an already-granted account, plus any approved purchase proof the operator authorizes.

## Idempotence and Recovery

Branch creation is safe to rerun by checking out the existing branch instead of creating a duplicate. If `codex/passwordless-workspace-choice-hotfix` already exists, use `git switch codex/passwordless-workspace-choice-hotfix` and confirm it is based on `origin/main`. Do not reset or overwrite unrelated user branches.

Removing pre-purchase checkout intent should be done in additive, testable slices. If a broad type removal causes too much churn, first introduce neutral checkout behavior while leaving legacy optional fields in storage, then remove dead active code after tests pass. Do not delete old production data. If Convex schema fields must remain for compatibility, mark them as legacy in code and docs instead of pretending they are active product inputs.

Checkout success and sign-in redirects should always validate redirect paths through `getSafeRedirectPath` or an equivalent internal-only path guard. If a redirect path is missing, malformed, or external, fall back to `/workspace/choose`, not `/codebase` and not an external URL.

If the pending checkout cookie is missing during proof, repeat checkout from the same browser context. If the paid session exists but the app cannot attach access after OTP, inspect Stripe session id, Convex checkout claims, Clerk user email verification, and the pending checkout cookie before trying a second purchase. Do not tell a paid buyer to purchase again while a paid Stripe session can be recovered.

If Gmail cannot retrieve the OTP, do not change code to bypass OTP. Use browser mailbox access or user-assisted code retrieval, and record that the connector is scoped to the wrong mailbox or did not receive EA mail. If Clerk does not send an email-code factor, verify Clerk dashboard settings in both dev and production before changing application code.

If `/checkout/success` fulfillment succeeds from both webhook and return page, this is expected. The fulfillment function must be idempotent and converge on the same access grant for the same Stripe Checkout Session. Do not add request-local flags, browser-only locks, or one-off suppression logic to prevent duplicate fulfillment calls.

If a hosted proof workflow stalls in GitHub Actions during Playwright browser installation, treat that as release proof infrastructure until logs show an application failure. Continue with manual browser proof only if the user approves that as sufficient for the staging or production decision, and record the limitation in this plan.

## Artifacts and Notes

Branch state at plan creation:

    2026-05-07 11:13:59 EDT
    branch: codex/passwordless-workspace-choice-hotfix
    base: origin/main at 4101f6be03c01c3b34cab7ea24339c193d557da8

Prior shipped hotfix context:

    PR #217 merged to main: fix: clarify passwordless auth errors
    origin/main: 4101f6be03c01c3b34cab7ea24339c193d557da8
    origin/dev: 652c7fecd3ff1a3c7abe048a73d31c1b4cfd4bd0
    origin/dev currently has the same tree as origin/main.

Research evidence for current root causes:

    apps/web/config/product.ts
    heroPrimaryCta.checkoutIntent.buyerStartingPoint = "no_codebase"
    pricingPrimaryCta.checkoutIntent.buyerStartingPoint = "no_codebase"

    apps/web/platform/billing/checkout/checkout-intent.ts
    getFulfillmentTrackForBuyerStartingPoint("no_codebase") returns "generated_codebase"

    apps/web/platform/billing/checkout/checkout-session.ts
    paid signed-out checkout with checkout email returns checkout_email_handoff_required

    apps/web/app/checkout/success/_lib/checkout-success-view-model.ts
    checkout_email_handoff_required renders "Prove checkout email"

    apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx
    checkout success redirect paths are converted to checkout email handoff hrefs

Provider research recorded on 2026-05-07:

    Stripe Checkout fulfillment docs:
    Webhooks are required for reliable fulfillment, and Stripe recommends also triggering the same fulfillment function from the checkout landing page because webhooks can be delayed. The success URL should include session_id={CHECKOUT_SESSION_ID}.

    Clerk custom email OTP docs:
    Passwordless sign-in is a normal custom flow using signIn.create, signIn.emailCode.sendCode, signIn.emailCode.verifyCode, and sign-in finalization. Backend-created users can omit passwords with skipPasswordRequirement when password is otherwise enabled.

    Convex auth docs:
    Convex functions should use ctx.auth.getUserIdentity() for the authenticated Clerk identity. Clerk-integrated identity can include email and emailVerified, so pending checkout claim by email should require a verified Clerk email.

Implementation validation recorded on 2026-05-07 13:11:18 EDT:

    bun run --cwd apps/web typecheck
    result: passed

    bun run --cwd apps/web test:unit -- tests/unit/home-page-render-model.test.ts tests/unit/home-page-primary-cta.test.tsx tests/unit/checkout-session-params.test.ts tests/integration/stripe-checkout-route.test.ts tests/integration-ui/checkout-button.test.tsx tests/integration-ui/express-checkout-button.test.tsx tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/home-page-product-preview.test.tsx tests/unit/sign-in-route-utils.test.ts tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/route-metadata.test.ts tests/unit/checkout-success-fixtures.test.ts tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/unit/access-required-page.test.tsx tests/unit/course-access.test.ts tests/integration-ui/workspace-fulfillment-choice.test.tsx
    result: passed, 10 files and 62 tests under the unit project

    bun run --cwd apps/web test:unit -- tests/unit/checkout-session.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/convex-product-access-grant.test.ts tests/unit/course-entitlements.test.ts tests/unit/workspace-privacy-contract.test.ts
    result: passed, 7 files and 70 tests

Final local validation recorded on 2026-05-07 13:18:45 EDT:

    bun run --cwd apps/web test:unit -- tests/unit/home-page-render-model.test.ts tests/unit/home-page-primary-cta.test.tsx tests/unit/checkout-session-params.test.ts tests/unit/sign-in-route-utils.test.ts tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/route-metadata.test.ts tests/unit/checkout-success-fixtures.test.ts tests/unit/access-required-page.test.tsx tests/unit/course-access.test.ts
    result: passed, 10 files and 62 tests

    bun run --cwd apps/web test:unit -- tests/unit/checkout-session.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/convex-product-access-grant.test.ts tests/unit/course-entitlements.test.ts tests/unit/workspace-privacy-contract.test.ts
    result: passed, 7 files and 70 tests

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/checkout-button.test.tsx tests/integration-ui/express-checkout-button.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/workspace-fulfillment-choice.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx
    result: passed, 9 files and 53 tests

    bun run --cwd apps/web test:integration:node -- tests/integration/stripe-checkout-route.test.ts
    result: passed, 1 file and 5 tests

    bun run --cwd apps/web format:check
    result: passed

    bun run --cwd apps/web lint
    result: passed

    bun run --cwd apps/web typecheck
    result: passed

    bun run format
    result: passed

    bun lint
    result: passed

    bun typecheck
    result: passed

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-07-passwordless-checkout-workspace-choice-hotfix.md
    result: passed

    bun run markdown:lint
    result: passed

    bun run public-readiness:lint
    result: passed

    git diff --check
    result: passed

Hosted proof tooling validation recorded on 2026-05-07 13:21:12 EDT:

    bun run --cwd apps/web test:unit -- tests/unit/hosted-stripe-checkout-proof.test.ts
    result: passed, 1 file and 5 tests

    node --check apps/web/scripts/verify-dev-stripe-card-payment.mjs
    result: passed

    node --check apps/web/scripts/lib/hosted-stripe-checkout-proof.mjs
    result: passed

Post-review validation recorded on 2026-05-07 13:44:13 EDT:

    bun run --cwd apps/web test:unit -- tests/unit/checkout-session.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/course-access.test.ts tests/unit/convex-product-access-grant.test.ts tests/unit/hosted-stripe-checkout-proof.test.ts
    result: passed, 6 files and 65 tests

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
    result: passed, 3 files and 30 tests

    test ! -e apps/web/tests/integration-ui/checkout-email-handoff-page.test.tsx
    result: passed

    node --check apps/web/scripts/verify-dev-stripe-card-payment.mjs
    result: passed

    bun run --cwd apps/web lint
    result: passed

    bun run --cwd apps/web typecheck
    result: passed

PR static follow-up recorded on 2026-05-07 13:49:43 EDT:

    gh pr checks 218 --watch=false
    result: static failed while integration and Vercel passed. Static failure was in the full unit suite:
    tests/unit/app-workspace-codebase-review-routes.test.tsx called WorkspaceChoiceRoutePage with no args, exposing that the route page required searchParams.
    tests/unit/checkout-clear-pending-route.test.ts still expected the retired /codebase fallback.

    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/checkout-clear-pending-route.test.ts
    result: passed, 2 files and 15 tests

    bun run --cwd apps/web test:unit
    result: passed, 140 files and 665 tests

    bun run --cwd apps/web format:check
    result: passed

    bun run --cwd apps/web typecheck
    result: passed

CodeRabbit follow-up validation recorded on 2026-05-07 14:03:59 EDT:

    bun run --cwd apps/web test:unit -- tests/unit/sign-in-route-utils.test.ts tests/unit/checkout-session.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/hosted-stripe-checkout-proof.test.ts
    result: passed, 5 files and 54 tests

    node --check apps/web/scripts/verify-dev-stripe-card-payment.mjs
    result: passed

    bun run --cwd apps/web test:unit
    result: passed, 140 files and 665 tests

    bun run --cwd apps/web format:check
    result: passed

    bun run --cwd apps/web lint
    result: passed

    bun run --cwd apps/web typecheck
    result: passed

    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-07-passwordless-checkout-workspace-choice-hotfix.md apps/web/content/docs/environment-variables.mdx apps/web/content/docs/stripe-checkout-webhook.mdx apps/web/content/docs/deploy-to-vercel.mdx apps/web/content/docs/ship-live.mdx
    result: passed

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-07-passwordless-checkout-workspace-choice-hotfix.md
    result: passed

    git diff --check
    result: passed

External setup added by the CodeRabbit follow-up:

    CHECKOUT_FULFILLMENT_RETRY_SECRET must be created as a high-entropy server-only value and mirrored into Vercel plus the matching Convex deployment for local, preview/dev, and production. It must not be public or exposed with a NEXT_PUBLIC_ prefix.

Add dev proof artifacts here during implementation:

    dev deployment:
    dev purchase timestamp:
    dev Stripe session id:
    dev Clerk user id for checkout email:
    dev Convex product access grant id or evidence:
    dev final URL after purchase:
    dev OTP email timestamp:
    dev final URL after logout/login:
    Gmail connector status:

Add production proof artifacts here during implementation:

    production deployment:
    production proof timestamp:
    production login account:
    production Clerk user id or email:
    production Convex product access evidence:
    production final URL after login:
    production purchase proof, if authorized:

## Interfaces and Dependencies

Clerk is the identity provider. The app uses `@clerk/nextjs` on the server and client. The buyer flow depends on email-code sign-in. The custom sign-in code calls `useSignIn`, creates a sign-in with an email identifier, gets an email-code first factor, sends a code, verifies the code, and then calls `clerk.setActive`. Clerk dashboard setup for dev and production must enable `User & authentication` -> `Email` -> `Sign-in with email` and `Email verification code`. The paid buyer flow should not require password sign-in; `User & authentication` -> `Password` should have `Sign-up with password` and `Add password to account` off unless a later product decision intentionally reintroduces passwords and updates this plan and docs.

Stripe is the payment provider. Checkout session creation lives in Next.js route handlers under `apps/web/app/api/stripe/checkout/`. Stripe webhook handling lives in Convex under `apps/web/convex/stripeWebhook.ts`. This plan removes active product-routing intent from new Stripe checkout metadata. Stripe still needs enough metadata to identify the product/course and support fulfillment, webhook idempotency, and recovery.

Convex is the backend. Access grants and checkout claims live in `apps/web/convex/access/model.ts`, `apps/web/convex/checkoutClaims.ts`, and `apps/web/convex/checkoutClaimsActions.ts`. Convex functions must use validators, must derive identity server-side, and must be validated against hosted Convex dev. Do not use Convex local mode. The shared fulfillment function must retrieve Stripe server-side, validate product metadata and payment status, derive checkout email from Stripe, and never trust client-supplied email or Clerk user id.

The checkout-success retry path depends on `CHECKOUT_FULFILLMENT_RETRY_SECRET` being set to the same value in the Next.js runtime and the target Convex deployment. If it is missing or mismatched, the webhook can still grant access eventually, but `/checkout/success` cannot safely perform the immediate retry and the first buyer handoff may stall or show the fulfillment-failed state.

Next.js App Router owns route behavior. Routes touched by this plan include `apps/web/app/checkout/success/page.tsx`, deletion of `apps/web/app/checkout/email-handoff/page.tsx`, `apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx`, and `apps/web/app/(workspace)/workspace/choose/page.tsx`. Before implementation changes App Router behavior, read the relevant local Next.js docs under `node_modules/next/dist/docs/` for route handlers, redirects, and server/client boundaries.

Vercel hosts dev and production. Dev may be protected by Vercel access, so browser proof can require a Vercel share or bypass URL. The `dev` branch and `https://dev.man-meets-ai.com` are payment staging surfaces, not release authority. The user can log in to Vercel if needed, but use the available Vercel connector first when possible.

Gmail is used only for test OTP retrieval. It is not part of the application runtime. Search recent Man Meets AI, Clerk, or auth code mail after triggering a fresh code. If the connector cannot see `{{TEST_CHECKOUT_EMAIL}}`, use browser mailbox access or user-assisted retrieval and record the limitation.

GitHub owns PR and review flow. The release PR targets `main`. If the dev staging domain needs to be refreshed for payment proof, do that as a staging-only branch operation with the same focused commit and record the exact commit used; do not treat `dev` as the merge authority. Before merging release-sensitive changes to `main`, run the repo's multi-agent review workflow: "Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on."
