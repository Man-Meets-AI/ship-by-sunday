---
title: "Template First Web Convex Cross Repo Review"
summary: "Cross-repo review notes for adopting the sibling template in the current web app."
docType: "cross_repo_review"
status: "active"
read_when:
  - "Checking which sibling-template patterns are being imported."
  - "Reviewing risks from copying template code into Ship by Sunday."
---

# Template First Web Convex Cross Repo Review

## Reusable Patterns

The sibling template's strongest reusable patterns are:

- The `src/` file tree.
- Route groups named by intent: `(marketing)`, `(auth)`, `(app)`, and `api/`.
- Provider folders under `src/lib/`.
- App shell and layout components separated from generic UI components.
- React Email templates under `src/emails`.
- Sentry setup through `@sentry/nextjs` and Next.js instrumentation files.
- Resend server-only email helpers and debug/test routes.
- Billing route tests for checkout, portal, success, and webhook behavior.
- Convex billing modules that normalize Stripe state before UI reads it.
- Debug tools controlled by env and unavailable in production.

## Patterns To Adapt

The template's subscription billing model should be expanded for Ship by Sunday's app-owned products: Starter as a one-time one-year license with app-owned fresh-checkout renewals, and Workers as monthly/quarterly/annual subscription variants managed through Stripe Customer Portal plan changes when the portal is configured for the final prices, immediate prorated upgrades/longer commitments, period-end downgrades, period-end cancellation with access retained through the paid period, Smart Retries recovery with 8 retries over 2 weeks before cancellation, provider-dashboard refund initiation with no in-app admin refund actions, manual/support-approved product-specific refund mirroring, one branded full-refund customer status email when access or fulfillment changes, one internal full-refund ops closeout email when access or fulfillment changes, one branded customer failed-payment recovery email per failed renewal invoice, one branded recovered-payment confirmation email per recovered failed renewal invoice, one final branded customer access-ended email when failed-payment recovery ends in cancellation, one internal billing ops alert email per failed renewal invoice, one internal billing ops resolved email per recovered failed renewal invoice, one internal billing ops closeout email per retry-exhausted cancellation, and exactly-once cancellation confirmation email. `BILLING_OPS_EMAILS` is a maintainer-owned internal recipient list for payment issues, initially the operator/support email, not a Clerk role or workspace concept. Worker Seal Team 6 should be treated as a Cal.com-backed service booking, not as a custom app-owned scheduler.

The template does not currently implement a failed-payment email lane. Adding one is a deliberate product expansion, not a reason to abandon the template's integration style. The extension should add `invoice.payment_failed`, `invoice.paid`, and refund events as verified triggers, then reuse the template's sync-first Stripe-to-Convex boundary, entitlement derivation, processed-event idempotency, and server-only Resend helper. It should send one customer failed-payment action email, one customer recovered-payment confirmation email, one final customer access-ended email after terminal failed-recovery cancellation, one branded full-refund customer status email when a full refund changes access or fulfillment, one internal full-refund ops closeout email when a full refund changes access or fulfillment, one internal billing ops alert email, one internal billing ops resolved email, and one internal billing ops closeout email after retry-exhausted cancellation from normalized Convex state. It should not send any of those emails straight from the raw webhook payload or block Stripe acknowledgement on Resend delivery.

The template also does not currently have a global `past_due` billing banner. Ship by Sunday should expand the template's role-aware billing page pattern into a global non-blocking app-shell attention surface for owners/admins only, because failed payment recovery is a customer trust moment and should not depend on someone discovering `/billing`. The detailed state should still live on `/billing`, and the banner should read Convex billing attention state rather than provider payloads. The banner should not be dismissible or snoozable while Convex still reports active billing attention; otherwise the app would create local UI state that hides a P0 billing problem.

Cal.com is now the target booking provider for Worker Seal Team 6. The app should still copy the template's boundary discipline: Cal.com owns scheduling and paid booking UX, Stripe remains the payment processor, Convex mirrors normalized booking/payment state, Resend owns one branded customer prep email and one internal ops email after paid sync, and Sentry owns provider-sync failures.

The referenced Mobbin flow remains useful as a fallback/custom UX reference, but it is not the primary implementation target while Cal.com satisfies the booking contract.

The current app also has release proof and customer setup docs that the template does not know about. Those docs must move with the endpoint contracts; otherwise a correct implementation can still fail in production because the provider dashboard points to an old URL.

## Patterns To Avoid Preserving

The current broad `platform/` boundary should not be preserved as the final shape merely because many files use it today.

The current Convex `.site` webhook endpoint should not be preserved as canonical unless a child slice proves it is still the better architecture after comparing it with the template's Next.js route pattern.

The current route group names should not be preserved for continuity alone.

## Review Risks

- Copying the template without adapting annual licenses and Cal.com service-booking mirrors would under-model the new product strategy.
- Moving route groups without exact auth tests could expose protected product routes.
- Moving webhook ingress without updating Stripe dashboard docs would break production fulfillment.
- Adding Resend debug routes without the template's production guard would create an operator/security issue.
- Adding Sentry on top of PostHog without clear ownership could double-report errors or leave source maps misconfigured.
- A partial `src/` migration could make imports harder to understand than either current or target architecture.
- Treating Cal.com as magic would make support and release proof brittle. Convex still needs idempotent mirrored booking/payment state.
- Building a custom Worker Seal Team 6 scheduler while Cal.com satisfies the requirements would add avoidable P0/P1 code.
- Ignoring Cal.com settings drift would create high-dollar booking mistakes that tests may miss unless event type configuration is documented and verified.

## Review Conclusion

The template is a strong source repo for this Program, but the migration must be done as a product architecture change, not a blind copy. The deciding rule is: copy the shape by default, expand app-owned billing for Ship by Sunday's Starter license with fresh-checkout renewal and Workers subscription variants with Customer Portal plan changes plus period-end cancellation, integrate Cal.com for Worker Seal Team 6, and prove billing/auth/provider behavior with tests before calling any slice complete.
