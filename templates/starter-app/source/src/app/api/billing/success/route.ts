import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

import { ensureConvexViewerReady } from "@/lib/auth/convex-viewer";
import { canManageBillingRole } from "@/lib/auth/roles";
import { syncStripeCheckoutSessionToConvex } from "@/lib/billing/stripe-sync";
import { captureServerException } from "@/lib/sentry/server";

export async function GET(request: Request) {
  return Sentry.startSpan({ name: "billing.checkout.success" }, async () => {
    const requestUrl = new URL(request.url);
    const sessionId = requestUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.redirect(new URL("/billing?checkout=missing_session", request.url), {
        status: 303,
      });
    }

    try {
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

      await syncStripeCheckoutSessionToConvex({
        sessionId,
        expectedWorkspaceId: billingState.workspace._id,
      });
    } catch (error) {
      captureServerException(error, {
        area: "billing_checkout_success_sync",
      });

      return NextResponse.redirect(
        new URL("/billing?checkout=sync_failed", request.url),
        { status: 303 },
      );
    }

    return NextResponse.redirect(new URL("/billing?checkout=success", request.url), {
      status: 303,
    });
  });
}
