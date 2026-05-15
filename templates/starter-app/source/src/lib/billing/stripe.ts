"server-only";

import Stripe from "stripe";

import { getBillingEnv } from "@/lib/env/server";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!stripeClient) {
    const billingEnv = getBillingEnv();

    stripeClient = new Stripe(billingEnv.STRIPE_SECRET_KEY, {
      appInfo: {
        name: "next-js-convex-clerk-stripe-template",
      },
    });
  }

  return stripeClient;
}
