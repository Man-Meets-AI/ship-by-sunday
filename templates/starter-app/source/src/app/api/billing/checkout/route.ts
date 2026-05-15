import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

import { captureServerEvent } from "@/lib/analytics/server";
import { analyticsEvents } from "@/lib/analytics/events";
import { ensureConvexViewerReady } from "@/lib/auth/convex-viewer";
import { canManageBillingRole } from "@/lib/auth/roles";
import { ensureStripeCustomerForWorkspace } from "@/lib/billing/stripe-sync";
import { getStripe } from "@/lib/billing/stripe";
import { getBillingEnvIfConfigured } from "@/lib/env/server";
import { captureServerException } from "@/lib/sentry/server";

export async function POST(request: Request) {
  return Sentry.startSpan({ name: "billing.checkout.create" }, async () => {
    const billingEnv = getBillingEnvIfConfigured();

    if (!billingEnv) {
      return NextResponse.redirect(
        new URL("/billing?billing=unconfigured", request.url),
        { status: 303 },
      );
    }

    const stripe = getStripe();
    const { identity, token } = await ensureConvexViewerReady();
    const billingState = await fetchQuery(
      api.billing.currentWorkspaceState,
      {},
      { token },
    );

    if (!canManageBillingRole(billingState.membership.role)) {
      return NextResponse.redirect(
        new URL("/billing?error=forbidden", request.url),
        { status: 303 },
      );
    }

    const stripeCustomerId = await ensureStripeCustomerForWorkspace({
      token,
      workspaceId: billingState.workspace._id,
      stripeCustomerId: billingState.customer?.stripeCustomerId,
      email: identity?.email ?? undefined,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      allow_promotion_codes: true,
      customer: stripeCustomerId,
      line_items: [
        {
          price: billingEnv.STRIPE_PRICE_PRO_MONTHLY,
          quantity: 1,
        },
      ],
      metadata: {
        workspaceId: billingState.workspace._id,
      },
      subscription_data: {
        metadata: {
          workspaceId: billingState.workspace._id,
        },
      },
      success_url: `${billingEnv.NEXT_PUBLIC_APP_URL}/api/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${billingEnv.NEXT_PUBLIC_APP_URL}/billing?checkout=cancelled`,
    });

    if (identity) {
      void captureServerEvent({
        distinctId: identity.authSubject,
        event: analyticsEvents.startedCheckout,
        properties: {
          workspaceId: billingState.workspace._id,
        },
      }).catch((error) => {
        captureServerException(error, {
          area: "billing_checkout_analytics",
        });
      });
    }

    return NextResponse.redirect(session.url!, { status: 303 });
  });
}
