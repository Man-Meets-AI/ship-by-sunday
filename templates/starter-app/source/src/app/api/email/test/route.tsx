import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

import { captureServerEvent } from "@/lib/analytics/server";
import { analyticsEvents } from "@/lib/analytics/events";
import { ensureConvexViewerReady } from "@/lib/auth/convex-viewer";
import { WelcomeEmail } from "@/emails/welcome-email";
import { areDebugToolsEnabled } from "@/lib/app/debug-tools";
import { sendTransactionalEmail } from "@/lib/email/send";
import { captureServerException } from "@/lib/sentry/server";

export async function POST() {
  if (!areDebugToolsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return Sentry.startSpan({ name: "email.test.send" }, async () => {
    const { identity, token } = await ensureConvexViewerReady();
    const workspaceState = await fetchQuery(api.workspaces.current, {}, {
      token,
    });

    if (!identity.email) {
      return NextResponse.json(
        { error: "Authenticated user does not have a primary email address." },
        { status: 400 },
      );
    }

    await sendTransactionalEmail({
      to: identity.email,
      subject: "Starter Stack test email",
      react: (
        <WelcomeEmail
          name={identity.name}
          workspaceName={workspaceState.workspace.name}
        />
      ),
    });

    void captureServerEvent({
      distinctId: identity.authSubject,
      event: analyticsEvents.testEmailSent,
      properties: {
        workspaceName: workspaceState.workspace.name,
      },
    }).catch((error) => {
      captureServerException(error, {
        area: "test_email_analytics",
      });
    });

    return NextResponse.json({ sent: true });
  });
}
