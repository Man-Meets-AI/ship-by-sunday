import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

import { ensureConvexViewerReady } from "@/lib/auth/convex-viewer";
import { canManageBillingRole } from "@/lib/auth/roles";
import { getStripe } from "@/lib/billing/stripe";
import { getBillingEnvIfConfigured } from "@/lib/env/server";

export async function POST(request: Request) {
  return Sentry.startSpan({ name: "billing.portal.create" }, async () => {
    const billingEnv = getBillingEnvIfConfigured();

    if (!billingEnv) {
      return NextResponse.redirect(
        new URL("/billing?billing=unconfigured", request.url),
        { status: 303 },
      );
    }

    const stripe = getStripe();
    const { token } = await ensureConvexViewerReady();
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

    if (!billingState.customer?.stripeCustomerId) {
      return NextResponse.redirect(
        `${billingEnv.NEXT_PUBLIC_APP_URL}/billing?portal=unavailable`,
        { status: 303 },
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: billingState.customer.stripeCustomerId,
      return_url: `${billingEnv.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return NextResponse.redirect(session.url, { status: 303 });
  });
}
