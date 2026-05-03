---
title: One Click Paid Access Planning Brief 2
program_id: one-click-paid-access
brief_version: 2
status: current
summary: Add the final passwordless checkout-email handoff slice after instant fulfillment and Express Checkout have landed.
read_when:
  - Authoring or refreshing child ExecPlans for checkout-email auth handoff.
  - Changing post-payment sign-in, sign-up, SSO, or protected-route recovery after Stripe checkout.
---

# One Click Paid Access Planning Brief 2

The initiative objective remains to make Ship by Sunday payment and access feel finished immediately. The buyer should click the homepage purchase action, pay through the fastest eligible Stripe path, and enter the product through the checkout email without seeing claim mechanics or provider-login ambiguity.

The first two implementation slices have landed: paid Stripe Checkout Sessions now fulfill access by checkout email, and the homepage can progressively render Stripe Express Checkout while hosted Checkout remains fallback. The remaining product gap is the post-payment identity handoff. A signed-out buyer can pay with Link or hosted Checkout, but after Stripe returns them to `/checkout/success`, the app still offers a generic sign-in/create-account path with password and Google/social recovery branches.

The next slice must turn that recovery into a narrow checkout-email passwordless handoff. The success page should tell the buyer that payment is confirmed for the checkout email and should send them into a Clerk email-code flow for that email. Stripe Link remains payment acceleration only. It must not be treated as application authentication, and the app must not auto-login a browser from the Stripe return URL alone. Clerk remains the identity boundary because only Clerk can prove the browser owns the email that now has product access.

Use Clerk email OTP as the first implementation slice. In current Clerk custom-flow docs, email OTP is the direct passwordless path: enable email sign-in with email verification code, call `signIn.create({ identifier: email })`, send the email code, verify the code, then finalize the Clerk session and return to the preserved redirect. That is simpler and more inspectable than sending a backend-generated sign-in token email because it keeps proof inside the client-side Clerk flow and does not require the app to own email delivery for auth links.

Email-link or sign-in-token handoff may be a later variant if the product wants a one-click inbox link. Sign-in tokens can associate a short-lived token with a Clerk user, but they would require an app-owned email template, token lifetime policy, replay handling, and support diagnostics. Email links have cross-device and callback behavior that should be designed deliberately instead of being mixed into the first slice.

This slice must remove Google/social auth and password-first recovery from the post-checkout path. It does not need to remove Google or password auth globally if those flows remain useful for non-checkout entry, but a buyer arriving from a paid Checkout Session should see only the checkout-email proof path plus safe support/retry exits. If implementation finds that global auth settings can safely become email-code only, document the provider setup and test the non-checkout sign-in path before widening.

Required implementation surfaces include checkout success state and view-model code, the custom sign-in flow, post-checkout sign-up code, SSO callback tests/docs, auth route utilities, `checkoutClaimsActions.fulfillCheckoutSessionByEmail`, the workspace access guard and home redirect behavior, and provider docs for Clerk email-code settings. Required validation includes focused unit and integration-ui tests for checkout success, sign-in, post-checkout sign-up replacement or removal, SSO callback behavior, access-required recovery, plus hosted billing proof because this changes checkout and access handoff behavior.
