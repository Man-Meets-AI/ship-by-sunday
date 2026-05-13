# Program Example Use Case

The high level is: **this became a template-first web app and billing trust reset**, with the four landing pages as the visible customer-facing entry points.

What started as:

- `/`
- `/starter`
- `/workers`
- `/worker-seal-team-6`

expanded because those pages are not just marketing pages. Each one points at a different product, payment model, fulfillment path, and provider boundary. So the real Program is:

**1. Copy The Template's Architecture**
Move `apps/web` toward the sibling template's structure and conventions:

- `src/app/(marketing)`
- `src/app/(auth)`
- `src/app/(app)`
- `src/app/api`
- domain-shaped `src/lib/*`
- smaller, clearer Convex modules
- architecture/conventions docs that future agents can actually follow

**2. Rebuild The Public Product IA**
The four landing routes become the clean public surface:

- `/` explains the overall offer
- `/starter` sells the one-time Starter license
- `/workers` sells the Workers subscription
- `/worker-seal-team-6` sells the high-ticket paid call/service

**3. Rebuild Billing Around Product Truth**
This is the biggest expansion.

- Starter is a one-time annual license with fresh Stripe Checkout renewal.
- Workers is monthly/quarterly/annual subscription billing through Stripe Checkout + Customer Portal.
- Worker Seal Team 6 is a Cal.com paid booking connected to Stripe.
- Convex becomes the durable source of app state: licenses, subscriptions, entitlements, bookings, refunds, processed events, email delivery state.
- Stripe/Cal.com remain provider truth. Webhooks trigger sync; raw payloads do not become app state.

**4. Add Trust And Ops Loops**
Because payment failures have hurt customers before, the Program includes the boring but critical trust paths:

- failed-payment recovery
- recovered-payment confirmation
- cancellation confirmation
- terminal access-ended email
- full-refund customer status email
- internal billing ops emails
- Worker Seal Team 6 prep/internal emails
- no in-app admin refunds in this Program; refunds happen in Stripe/Cal.com dashboards and sync back

**5. Add Sentry, Resend, Debug Gates**
The template is cleaner partly because provider setup is explicit.

So this Program includes:

- Sentry setup
- Resend setup
- env validation
- debug tools controlled by env
- provider setup docs
- missing-config failure modes

**6. Prove The P0 Paths**
This cannot just be a folder reshuffle. The target requires tests around:

- Stripe route handlers
- webhook idempotency
- Starter license fulfillment/renewal
- Workers subscription lifecycle
- failed-payment recovery
- refunds
- Cal.com booking sync
- entitlement derivation
- billing UI visibility
- provider setup docs staying current

So the simple framing is:

**Ship four strong landing pages, but do it by adopting the better template architecture underneath them, because the pages are tied to revenue flows we cannot afford to keep messy.**

This is not just a marketing-page Program anymore. It is the foundation for the next version of the web app: cleaner architecture, clearer routes, safer billing, stronger provider boundaries, better customer communications, and better agent/developer ergonomics.
