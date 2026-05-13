import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { captureServerEvent } from "@/lib/analytics/server";
import { analyticsEvents } from "@/lib/analytics/events";
import { areDebugToolsEnabled } from "@/lib/app/debug-tools";
import { requireViewerIdentity } from "@/lib/auth/clerk";
import { captureServerException } from "@/lib/sentry/server";

export async function POST() {
  if (!areDebugToolsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const identity = await requireViewerIdentity();

  return Sentry.startSpan({ name: "debug.sentry.test" }, async () => {
    try {
      throw new Error("Intentional Sentry test error");
    } catch (error) {
      captureServerException(error, {
        source: "api_debug_sentry",
      });

      void captureServerEvent({
        distinctId: identity.authSubject,
        event: analyticsEvents.sentryDebugTriggered,
      }).catch((analyticsError) => {
        captureServerException(analyticsError, {
          area: "debug_sentry_analytics",
        });
      });

      return NextResponse.json({ captured: true });
    }
  });
}
