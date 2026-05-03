---
title: 'Stripe Link And Checkout Research Pass'
summary: 'Official Stripe findings for the one-click paid access Program.'
docType: 'program_research'
status: 'active'
read_when:
  - 'Rechecking payment-entry decisions for One Click Paid Access.'
  - 'Implementing Link, Express Checkout, or Checkout Session fulfillment.'
---

# Stripe Link And Checkout Research Pass

Stripe Link is a payment acceleration product, not an app-auth product. Stripe says Link securely saves and autofills customer address and payment details, authenticates existing Link customers with a one-time passcode, and works with Checkout, Payment Links, Web Elements, mobile Elements, and Invoicing. This supports the product desire for a `Pay with Link` experience, but it does not replace Clerk as the application session boundary.

Hosted Checkout with Link is the lowest-complexity path. Stripe documents Link with Checkout as a prebuilt payment form that can be hosted by Stripe or embedded. With dynamic payment methods, the integration should enable Link in the Dashboard and avoid hardcoding `payment_method_types`; Stripe then chooses eligible methods for each session. The current Ship by Sunday Checkout Session code already avoids manual `payment_method_types`, so the repo is aligned with dynamic payment methods once Dashboard settings are correct.

Express Checkout Element is the direct homepage-button path. Stripe describes it as an integration for one-click payment buttons, including Link, Apple Pay, Google Pay, PayPal, Klarna, and Amazon Pay. It presents active, supported, and set-up payment methods and sorts them by relevance. It also has practical constraints: HTTPS is required, the domain must be registered in test and live modes, some methods require additional setup, and availability depends on browser, currency, country, and the customer's wallet setup.

Stripe's current Express Checkout docs recommend Checkout Sessions API for most integrations and warn against choosing raw PaymentIntents unless the integration explicitly needs that lower-level API. For Ship by Sunday, Checkout Sessions are the correct abstraction because product identity, success URLs, metadata, fulfillment, and hosted fallback already depend on Sessions.

Fulfillment must happen on the server. Stripe's fulfillment guide says webhook fulfillment is required because a paid customer may not reach the success URL. It also recommends triggering fulfillment from the landing page to improve the present customer's immediate experience. This maps directly to the Program decision: webhook and success page should both invoke the same idempotent paid-session fulfillment function.

Checkout Sessions can create Stripe Customers for one-time payment mode by setting `customer_creation: "always"`. Stripe also says that even when a Customer is not created, `customer_details` still exposes email and other customer-entered data after Checkout. The Program should still set customer creation to improve Stripe-side customer continuity and reconciliation, while using `customer_details.email` as the fulfillment email for paid guest sessions.

Official sources:

- `https://docs.stripe.com/payments/link`
- `https://docs.stripe.com/payments/link/checkout-link`
- `https://docs.stripe.com/payments/payment-methods/dynamic-payment-methods`
- `https://docs.stripe.com/elements/express-checkout-element`
- `https://docs.stripe.com/elements/express-checkout-element/accept-a-payment`
- `https://docs.stripe.com/checkout/fulfillment`
- `https://docs.stripe.com/api/checkout/sessions/create`
