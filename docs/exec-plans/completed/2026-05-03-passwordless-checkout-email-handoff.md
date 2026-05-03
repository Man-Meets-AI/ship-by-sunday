---
title: Passwordless Checkout Email Handoff
status: complete
created_at: 2026-05-03
completed_at: 2026-05-03
summary: Replace the post-payment generic auth recovery path with a checkout-email passwordless handoff that proves the paid email through Clerk.
post_build_recap: Checkout success now uses an explicit checkout_email_handoff_required state, /checkout/email-handoff validates Stripe server-side and renders locked Clerk email OTP, /sign-up checkout links redirect there, checkout-success /sign-in and /sso-callback redirects avoid generic auth, and signed-out protected-route recovery with a paid pending checkout cookie prefers the email handoff.
program_id: one-click-paid-access
planning_brief: docs/programs/active/2026-05-02-one-click-paid-access/planning-brief-2.md
read_when:
  - Implementing post-payment passwordless auth after Stripe checkout.
  - Changing checkout success, sign-in, sign-up, SSO, or access-required recovery behavior.
  - Validating the remaining One Click Paid Access UX slice.
---

# Passwordless Checkout Email Handoff

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After Stripe confirms payment for a signed-out buyer, Ship by Sunday should show a narrow handoff: payment is confirmed for the checkout email, product access is already waiting for that email, and the only remaining step is to prove that email through Clerk. Today the buyer can land in a generic sign-in or create-account recovery path with password and Google/social branches. After this plan, the post-checkout path uses a passwordless Clerk email-code flow for the checkout email and then returns the buyer to `/checkout/success`, where the already-granted access can open `/blueprint`.

This matters because Stripe Link is not app login. Link can accelerate payment and help Stripe collect the payer email, but Clerk is still the application identity boundary. The visible proof of success is a signed-out buyer paying through Stripe, landing on `/checkout/success?session_id=...`, seeing a clear checkout-email handoff instead of generic auth recovery, entering the one-time code sent by Clerk, and reaching the protected workspace without buying again or choosing Google.

## Progress

- [x] 2026-05-03: Authored this ExecPlan from the One Click Paid Access Program packet, current checkout/auth code, and current Clerk passwordless docs.
- [x] 2026-05-03: Implemented the checkout-email handoff state and route utilities.
- [x] 2026-05-03: Replaced post-checkout password and Google/social recovery with Clerk email OTP.
- [x] 2026-05-03: Updated focused tests and provider docs.
- [x] 2026-05-03: Ran focused checkout, auth, SSO, access recovery, route metadata, fixture, and release-scope validation.

## Surprises & Discoveries

The instant fulfillment slice already changed the backend source of truth. `apps/web/platform/billing/checkout/checkout-session.ts` calls `fulfillCheckoutSessionByEmail` for paid guest sessions and maps `kind: "fulfilled"` to `sign_in_required` when the browser has no Clerk user. That means this plan does not need to build entitlement fulfillment. It only needs to make the remaining identity proof match the new entitlement model.

The current UI still speaks like access is attached after account auth. `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts` says "Sign in or create that account to attach access" and offers both `Sign in` and `Create account`. That copy is stale for the fulfilled-by-email happy path, where access is already attached to the Clerk user for the checkout email and the browser only needs to prove that email.

The custom sign-in route still has password and Google branches. `apps/web/app/(identity)/_components/sign-in/use-sign-in-flow.ts` exposes `submitPassword`, password reset, `startGoogleSignIn`, MFA verification, and `buildSsoCallbackHref`. `apps/web/app/(identity)/_components/sign-in/sign-in-credentials-form.tsx` renders the password submit and passes Google to `SignInSecondaryActions`. Post-checkout recovery must bypass or specialize this generic surface.

Current Clerk docs for custom email OTP say email-code sign-in uses `signIn.create({ identifier: email })`, sends an email code, verifies the code, and finalizes the session. They also state that email OTP requires Clerk Dashboard email sign-in with email verification code and password disabled for a pure OTP setup. This plan uses that as the first slice, while keeping sign-in-token and email-link handoff as later variants.

## Decision Log

Decision: Keep this work as the third child ExecPlan under the existing `one-click-paid-access` Program.
Rationale: The Program already owns the split between payment speed, fulfillment correctness, and the remaining checkout-email identity handoff. Creating a new Program would duplicate initiative-level truth.
Date: 2026-05-03

Decision: Do not auto-login from the Stripe return URL alone.
Rationale: The success URL proves that a browser navigated back with a Checkout Session id. It does not prove the browser controls the checkout email, and success URLs can be copied, shared, revisited, or opened on another device. Stripe Link proves payment acceleration, not application identity. Clerk must mint the app session after the buyer proves the checkout email.
Date: 2026-05-03

Decision: Use Clerk email OTP as the first passwordless handoff slice.
Rationale: Email OTP is the smallest explicit proof loop: the app already knows the checkout email from Stripe, Clerk sends the code, the buyer enters it, and Clerk finalizes the session. It avoids app-owned auth emails, token storage, callback routing, and cross-device link edge cases.
Date: 2026-05-03

Decision: Treat Clerk sign-in tokens and email links as later variants, not this slice.
Rationale: Sign-in tokens can make a one-click inbox link, and email links can also authenticate, but both require more policy: token lifetime, replay behavior, email delivery, callback routing, support logs, and cross-device behavior. They should not be mixed into the first implementation unless this plan is deliberately revised.
Date: 2026-05-03

Decision: Remove Google/social auth from the post-checkout recovery path without necessarily removing it globally.
Rationale: OAuth can be legitimate for ordinary sign-in, but it is confusing after checkout because the purchase is tied to a specific Stripe email. The post-payment path should not invite a different Google account or an account-discovery loop.
Date: 2026-05-03

## Outcomes & Retrospective

Implemented. The final Clerk flow is email OTP through `signIn.create({ identifier })`, `signIn.emailCode.sendCode({ emailAddress })`, `signIn.emailCode.verifyCode({ code })`, and Clerk session finalization back to the preserved checkout success URL. The old password-first post-checkout sign-up component and hook were deleted; `/sign-up?session_id=...` now redirects to `/checkout/email-handoff?session_id=...`.

Focused validation passed with:

    bun run --cwd apps/web vitest run tests/unit/checkout-session.test.ts tests/unit/checkout-email-handoff-route.test.ts tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/sign-in-route-utils.test.ts tests/unit/course-access.test.ts tests/unit/release-scope.test.ts tests/unit/route-metadata.test.ts tests/unit/checkout-success-fixtures.test.ts tests/integration-ui/checkout-email-handoff-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/sso-callback-page.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx

Hosted billing proof was intentionally not expanded in this slice. Use the standard release workflow proof selected by release scope rather than adding a new proof surface for this handoff.

## Context and Orientation

The payment and entitlement path is already mostly correct. `apps/web/convex/checkoutClaimsActions.ts` exposes `checkoutClaimsActions.fulfillCheckoutSessionByEmail`. It retrieves the Stripe Checkout Session, validates this product, checks `payment_status`, extracts `customer_details.email`, resolves or creates the Clerk user for that email, and grants Convex product access. The server helper `apps/web/platform/billing/checkout/checkout-session-recovery.ts` wraps that action as `fulfillCheckoutSessionByEmail(sessionId, stripeEventType)`.

Checkout success state lives in `apps/web/platform/billing/checkout/checkout-session.ts`. Its `CheckoutSessionState` union now includes `checkout_email_handoff_required`. For a paid guest session that fulfillment successfully attaches to the Clerk user for the checkout email, the code returns `checkout_email_handoff_required` when there is no current Clerk user and includes required `checkoutEmail`.

Checkout success presentation lives under `apps/web/app/checkout/success/_components/` and `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts`. The view model currently renders generic sign-in and create-account actions by calling `getSignInRedirectHref(getCheckoutSuccessHref(sessionId))` and `buildSignUpHref({ redirectPath, sessionId })`. `CheckoutSuccessViewContent` redirects to `/blueprint` only when the state is `validated` and `viewerProductAccess` says access is ready.

The custom identity route group lives under `apps/web/app/(identity)/`. `/sign-in` renders `SignInPage` from `apps/web/app/(identity)/_components/sign-in-page.tsx`. The sign-in controller is `apps/web/app/(identity)/_components/sign-in/use-sign-in-flow.ts`; it currently supports email/password, password reset, email-code MFA or client-trust verification after password/OAuth, and Google OAuth through `signIn.sso({ strategy: "oauth_google" })`. `/sso-callback` renders `SsoCallbackPage` and has tests in `apps/web/tests/integration-ui/sso-callback-page.test.tsx`.

Checkout email proof now exists at `/checkout/email-handoff?session_id=...`. The route file is `apps/web/app/checkout/email-handoff/page.tsx`; it retrieves the Stripe Checkout Session, verifies that it is paid for this product, derives the checkout email server-side, and renders `CheckoutEmailHandoffPage`. The legacy `/sign-up?session_id=...` route now redirects to this handoff for backward compatibility.

Auth route helpers live in `apps/web/platform/auth/auth-route-utils.ts`. They own `buildSignInHref`, `buildSignUpHref`, `buildSsoCallbackHref`, `getBlockedGoogleSignInHref`, redirect sanitization, and the `auth_error=purchase_required` state used after blocked Google sign-in. This plan should add specific checkout-email handoff URLs here or in a nearby auth-handoff helper rather than scattering query-string construction through UI files.

Protected workspace recovery uses `apps/web/app/(workspace)/_hooks/use-access-required-controller.ts` and `apps/web/app/(workspace)/_lib/access-required-view-model.ts`. Signed-out access-required state immediately redirects to `buildSignInHref({ redirectPath: currentPath })`. After this slice, protected-route recovery can keep the generic sign-in route, but checkout-email recovery should prefer the passwordless handoff when a paid checkout session id or pending checkout cookie is available.

The public docs updated for this slice are `apps/web/content/docs/stripe-checkout-webhook.mdx`, `apps/web/content/docs/how-the-starter-works.mdx`, `apps/web/content/docs/test-the-buyer-journey.mdx`, `apps/web/content/docs/clerk-convex-auth.mdx`, `apps/web/content/docs/route-map.mdx`, `apps/web/content/docs/index.mdx`, and `apps/web/content/docs/troubleshooting/stripe-convex.mdx`.

Official Clerk docs consulted while authoring this plan were `https://clerk.com/docs/guides/development/custom-flows/authentication/email-sms-otp`, `https://clerk.com/docs/guides/development/custom-flows/authentication/sign-in-or-up`, `https://clerk.com/docs/reference/backend/sign-in-tokens/create-sign-in-token`, and `https://clerk.com/docs/guides/development/custom-flows/authentication/email-links`.

### In Scope

Create a post-checkout passwordless handoff that is keyed to the Stripe checkout email and proves that email through Clerk email OTP. Update checkout success state and copy, add or specialize auth route utilities, replace the post-checkout create-password path with an email-code path, remove Google/social auth from the post-checkout branch, and update tests and docs that describe the checkout-to-access handoff.

Keep instant fulfillment through `checkoutClaimsActions.fulfillCheckoutSessionByEmail` as the entitlement source of truth. The handoff should consume the fulfilled checkout email; it should not create a parallel access-claim model.

### Out Of Scope

Do not replace Clerk with Stripe Link as app auth. Do not auto-login anyone merely because a browser has a Stripe success URL. Do not remove webhook fulfillment or success-page fulfillment retry. Do not redesign the homepage or Express Checkout button. Do not implement backend sign-in-token emails or Clerk email-link callbacks in the first slice unless this ExecPlan is revised with a new decision. Do not silently remove global password or Google sign-in for non-checkout routes unless the implementation deliberately widens provider setup, tests non-checkout auth, and updates docs.

## Plan of Work

First, read the relevant Next.js App Router docs from the installed `node_modules/next/dist/docs/` tree before changing route handlers, server/client boundaries, redirects, or metadata. Then read `apps/web/AGENTS.md`, `docs/release-workflow.md`, root `DESIGN.md`, and `docs/ship-by-sunday/design-pack/AGENTS.md` because this touches auth, checkout, access handoff, and visible UI.

Start by making checkout success state more explicit. In `apps/web/platform/billing/checkout/checkout-session.ts`, split the current fulfilled-but-signed-out case from generic `sign_in_required`. A domain-specific state such as `checkout_email_handoff_required` should include `sessionId` and required `checkoutEmail`. Use it only after the Stripe session is paid for this product and `fulfillCheckoutSessionByEmail` returns `kind: "fulfilled"`. Keep the generic `sign_in_required` state for invalid, missing-email, provider-failure, or non-checkout protected-route recovery if the code still needs it.

Update `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts` so the new state renders a narrow handoff. The shell should say payment is confirmed for the checkout email and access is waiting for that email. The primary action should start or open the passwordless checkout-email flow. The view should not offer Google sign-in, password reset, or a generic create-account action in this state. Keep wrong-account and payment-pending states explicit, but revise copy that says access will attach later when the fulfilled-by-email path already attached it.

Add a checkout-email auth URL helper. Prefer `apps/web/platform/auth/auth-route-utils.ts` unless the code becomes clearer with a new nearby file such as `checkout-email-auth-route-utils.ts`. The helper should build a URL that includes the sanitized redirect path, the `session_id`, and a mode that the identity route can validate. Do not trust an email query parameter from the browser. The identity route should derive the email from the server-validated Stripe Checkout Session id, just as the current post-checkout sign-up route does.

Replace the post-checkout sign-up path with a passwordless handoff route. The lowest-risk route shape is probably reusing `/sign-up?session_id=...` for backward compatibility while changing what it renders, or adding a clearer route such as `/checkout/email-handoff?session_id=...` and keeping `/sign-up?session_id=...` as a redirect. In either case, the server entrypoint must retrieve the Stripe session, verify paid status, verify this product, reject sessions that already contain a different signed-in Clerk user id, extract `customer_details.email`, and render a locked-email passwordless component. If the current browser is already authenticated, redirect back to the safe checkout success path.

Build or adapt a focused client flow for Clerk email OTP. Keep it separate from the generic `useSignInFlow` if that keeps responsibilities clearer. The flow should show the locked checkout email, start a Clerk sign-in attempt with that identifier, send the email code, accept the code, finalize the Clerk session, and navigate back to `/checkout/success?session_id=...`. It should handle existing users and users created by fulfillment. If Clerk returns a sign-up transfer or missing-account state despite fulfillment, handle it explicitly and log the state rather than falling back to a password form.

Then narrow the generic sign-in branch for checkout redirects. If `/sign-in?redirect_url=/checkout/success?...` remains reachable, it should detect the checkout success redirect with a valid `session_id` and route the buyer to the checkout-email handoff instead of rendering password and Google. Avoid passing the checkout email through query strings. Use the server-side success/session validation path to recover it.

Remove Google/social auth from the post-checkout path. This likely means that `SignInSecondaryActions` and `startGoogleSignIn` remain available only for non-checkout sign-in, while checkout handoff components do not render them. If tests currently assert Google purchase-required copy for checkout recovery, replace those assertions with email-code handoff assertions. Keep `/sso-callback` functional for ordinary OAuth if global Google remains enabled, and update SSO callback tests so they prove OAuth cannot become the post-checkout recovery path.

Update access-required recovery. In `apps/web/app/(workspace)/_hooks/use-access-required-controller.ts` and `apps/web/app/(workspace)/_lib/access-required-view-model.ts`, keep signed-out protected routes redirecting to sign-in for normal deep links. For paid checkout recovery states, prefer the checkout-email handoff when the model has a recoverable checkout email or session id. If there is no trusted session id, keep the existing generic sign-in path and explain in copy that the buyer must use the checkout email.

Update docs in the same change. `apps/web/content/docs/stripe-checkout-webhook.mdx` should state that Stripe grants access by checkout email and `/checkout/success` sends signed-out buyers through Clerk email OTP for that same email. `apps/web/content/docs/clerk-convex-auth.mdx` should document the Clerk Dashboard settings needed for email-code sign-in in the environments this repo uses. `apps/web/content/docs/how-the-starter-works.mdx`, `apps/web/content/docs/test-the-buyer-journey.mdx`, and troubleshooting docs should stop saying the buyer creates a password account after checkout unless password fallback intentionally remains.

## Milestones

Milestone 1 maps and narrows the state model. At the end, checkout success has an explicit fulfilled-by-email handoff state, route helpers know how to address the handoff without trusting browser-provided email, and unit tests prove the server state classification for paid guest, signed-in, wrong-account, missing-email, and invalid sessions.

Milestone 2 builds the passwordless handoff UI and Clerk email-code controller. At the end, a buyer with a server-validated `session_id` sees the locked checkout email, receives an email code through Clerk, enters the code, and returns to the preserved checkout success URL with a Clerk session. Tests should use Clerk hook mocks and should not require real email delivery.

Milestone 3 removes generic auth branches from the post-checkout path. At the end, checkout success and checkout-recovery sign-in do not render Google, password reset, or create-password account creation. Ordinary non-checkout sign-in still behaves according to the decision recorded during implementation.

Milestone 4 updates access-required recovery and docs. At the end, protected-route recovery still works, checkout-specific recovery prefers the email handoff when it has a trusted Checkout Session id, and builder/operator docs describe Clerk email-code setup plus failure symptoms.

Milestone 5 validates the full flow. At the end, focused tests and the normal repo gates show that a signed-out paid checkout can finish through email OTP and enter `/blueprint`.

## Concrete Steps

Start from the repo root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Confirm the worktree and do not touch unrelated edits:

    git status --short

Read the required instructions and route docs before coding:

    sed -n '1,260p' AGENTS.md
    sed -n '1,260p' docs/release-workflow.md
    sed -n '1,180p' apps/web/AGENTS.md
    sed -n '1,220p' DESIGN.md
    sed -n '1,180p' docs/ship-by-sunday/design-pack/AGENTS.md

Read the current checkout and auth surfaces:

    sed -n '1,260p' apps/web/platform/billing/checkout/checkout-session.ts
    sed -n '1,260p' apps/web/platform/billing/checkout/checkout-session-recovery.ts
    sed -n '640,860p' apps/web/convex/checkoutClaimsActions.ts
    sed -n '1,340p' apps/web/app/checkout/success/_lib/checkout-success-view-model.ts
    sed -n '1,360p' 'apps/web/app/(identity)/_components/sign-in/use-sign-in-flow.ts'
    sed -n '1,340p' 'apps/web/app/(identity)/_components/checkout-email-handoff/use-checkout-email-handoff-flow.ts'
    sed -n '1,280p' apps/web/platform/auth/auth-route-utils.ts
    sed -n '1,340p' 'apps/web/app/(workspace)/_lib/access-required-view-model.ts'

Inspect installed Clerk types before implementing exact method calls:

    rg -n "emailCode|email_code|createSignInToken|signInTokens|SignInResource" node_modules/@clerk -S

Run the current focused tests before editing so regressions are visible:

    bun run --cwd apps/web vitest run tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/checkout-email-handoff-page.test.tsx tests/integration-ui/sso-callback-page.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/unit/checkout-session.test.ts tests/unit/sign-in-route-utils.test.ts

Implement Milestone 1, then rerun the checkout-session and checkout-success tests. Implement Milestone 2, then rerun the identity tests. Implement Milestone 3 and 4, then rerun the full focused command. After docs are updated, run the commands listed under `Test Commands`.

Expected successful test output should end with a Vitest summary showing all selected tests passed, for example:

    Test Files  8 passed
    Tests       ... passed

If a command fails because a named test file has been moved or renamed, locate the current equivalent with `rg --files apps/web/tests | rg 'checkout-success|sign-in|post-checkout|sso-callback|access-required|auth-route'`, update this plan, and run the current focused files.

## Validation and Acceptance

Acceptance is user-visible. A signed-out buyer who completes a paid Stripe Checkout Session for Ship by Sunday should land on `/checkout/success?session_id=...`, see payment confirmed for the checkout email, start a Clerk email-code handoff for that exact email, enter the code, and return to the success page as the Clerk user that owns the granted access. The success page should then open `/blueprint` when product access is ready.

The post-checkout path is not acceptable if it offers Google sign-in, asks the buyer to create a password as the primary path, suggests buying again, or treats Stripe Link as app authentication. The implementation is also not acceptable if a copied Stripe success URL can create a Clerk session without proving the checkout email through Clerk.

Wrong-account behavior must remain explicit. If the browser is signed into a different Clerk user than the fulfilled checkout email, the app should tell the buyer to switch accounts or sign out and use the checkout email. It must not transfer access between users silently.

Provider setup must be documented. The docs should name the Clerk Dashboard settings for email-code sign-in, the environments that need the setting, and how failure appears when email-code auth is disabled or misconfigured.

### Test Commands

Run these from the repo root after implementation:

    bun run --cwd apps/web vitest run tests/unit/checkout-session.test.ts tests/unit/checkout-email-handoff-route.test.ts tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/sign-in-route-utils.test.ts tests/unit/course-access.test.ts tests/unit/release-scope.test.ts tests/unit/route-metadata.test.ts tests/unit/checkout-success-fixtures.test.ts tests/integration-ui/checkout-email-handoff-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/sso-callback-page.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-03-passwordless-checkout-email-handoff.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-03-passwordless-checkout-email-handoff.md docs/programs/active/2026-05-02-one-click-paid-access apps/web/content/docs/stripe-checkout-webhook.mdx apps/web/content/docs/clerk-convex-auth.mdx apps/web/content/docs/how-the-starter-works.mdx apps/web/content/docs/test-the-buyer-journey.mdx
    bun run format
    bun lint
    bun typecheck
    git diff --check

After deployment, use the standard release workflow for whatever proof the release scope selects. This ExecPlan does not add a new hosted-proof requirement.

## Idempotence and Recovery

All server validation should be safe to rerun. Refreshing `/checkout/success?session_id=...` may call `fulfillCheckoutSessionByEmail` again, but that action is already designed to converge on the same Clerk user and product access grant for the checkout email.

The passwordless auth flow should tolerate a buyer requesting another code. Resending an OTP should not create another checkout, another access grant, or another Clerk user. If Clerk reports rate limiting, show a specific retry message and leave the buyer on the handoff page.

If the email-code route cannot validate the Stripe session, redirect back to the checkout success URL or pricing according to the existing route safety model. Do not render a form for an untrusted `session_id`, and do not use a browser-supplied email parameter as the locked account identity.

If email OTP provider setup is missing in Clerk, the failure should be explicit in UI tests or manual QA. The recovery is to enable email sign-in with email verification code in the same Clerk instance used by the target environment, then rerun the focused auth and checkout checks.

If implementation discovers that Clerk users created by `fulfillCheckoutSessionByEmail` cannot sign in with email OTP because of current Clerk instance settings, stop and document the exact Clerk status or error in `Surprises & Discoveries`. The likely fixes are provider setup or changing the user-creation strategy, not returning to Stripe Link as auth.

Rollback is localized. Revert the checkout-email handoff route, state, and UI changes while keeping instant fulfillment and Express Checkout intact. The old generic sign-in/create-account path can remain a fallback during rollout only if the docs and tests clearly identify it as temporary and it does not reintroduce Google as the primary post-checkout path.

## Artifacts and Notes

Final post-payment shape:

    signed-out buyer pays through Stripe Link or hosted Checkout
    /checkout/success retrieves the paid session
    fulfillCheckoutSessionByEmail confirms access is waiting for the checkout email
    success page shows only the checkout-email handoff
    Clerk sends an email code to the checkout email
    buyer enters the code and Clerk creates the app session
    /checkout/success validates the matching user and opens /blueprint

Official docs facts used for this plan:

    Stripe Link accelerates payment and is not the application auth boundary in this repo.
    Clerk email OTP proves email ownership through an emailed one-time code.
    Clerk sign-in tokens can mint a sign-in link for a specific user, but require token lifetime and email delivery policy.
    Clerk email links are a valid passwordless variant, but need callback and cross-device behavior designed deliberately.

## Interfaces and Dependencies

Preserve `checkoutClaimsActions.fulfillCheckoutSessionByEmail` as the entitlement source of truth. It is the bridge between Stripe's paid Checkout Session email and the Clerk user id that owns product access.

Preserve `CheckoutSessionState` as the checkout success server-to-client contract, but add a more specific state for checkout-email handoff rather than overloading generic `sign_in_required` everywhere.

Preserve `getSafeRedirectPath` and the redirect-sanitization rules in `apps/web/platform/auth/auth-route-utils.ts`. Any new handoff route helper must sanitize redirect targets and must not accept external URLs.

Use Clerk's client-side custom-flow APIs through `useSignIn`, `useSignUp`, and `useClerk` in the same style as the existing identity components. Verify the exact installed SDK method names before coding; current docs describe `signIn.create({ identifier })`, `signIn.emailCode.sendCode()` for email OTP, code verification, and `signIn.finalize({ navigate })`.

Keep the Convex access check path intact. `CheckoutSuccessView` still uses `api.access.viewerProductAccess`, and protected routes still use the access-required controller and server access guard. This plan changes how the browser gets a Clerk session after payment, not how Convex stores product access.

The external dependencies are Stripe Checkout Sessions, Stripe Link and Express Checkout as payment entry points, Clerk email-code authentication, Clerk user resolution or creation from the previous fulfillment slice, Convex product access, and the standard release workflow for checkout and access-handoff changes.
