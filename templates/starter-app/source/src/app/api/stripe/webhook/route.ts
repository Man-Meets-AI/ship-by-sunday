import { after, NextResponse } from "next/server";
import type Stripe from "stripe";

import { syncStripeCustomerToConvex } from "@/lib/billing/stripe-sync";
import { getStripe } from "@/lib/billing/stripe";
import { getStripeSyncTargetFromWebhookEvent } from "@/lib/billing/stripe-webhooks";
import { getBillingEnv } from "@/lib/env/server";
import { captureServerException } from "@/lib/sentry/server";

export async function POST(request: Request) {
  const billingEnv = getBillingEnv();
  const stripe = getStripe();
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      billingEnv.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    captureServerException(error, { area: "stripe_webhook_verification" });
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  const syncTarget = getStripeSyncTargetFromWebhookEvent(event);

  if (syncTarget) {
    after(async () => {
      try {
        await syncStripeCustomerToConvex({
          eventId: event.id,
          eventType: syncTarget.type,
          stripeCustomerId: syncTarget.stripeCustomerId,
          workspaceId: syncTarget.workspaceId,
        });
      } catch (error) {
        captureServerException(error, {
          area: "stripe_webhook_processing",
          stripeEventType: event.type,
        });
      }
    });
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
