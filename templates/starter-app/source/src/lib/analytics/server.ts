"server-only";

import { PostHog } from "posthog-node";

import type { AnalyticsEvent } from "@/lib/analytics/events";
import { getServerAnalyticsEnv } from "@/lib/env/server";

let posthogClient: PostHog | null = null;

function getPostHogClient() {
  const analyticsEnv = getServerAnalyticsEnv();

  if (!analyticsEnv) {
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(analyticsEnv.POSTHOG_API_KEY, {
      host: analyticsEnv.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogClient;
}

export async function captureServerEvent(args: {
  distinctId: string;
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean | null | undefined>;
}) {
  const client = getPostHogClient();

  if (!client) {
    return;
  }

  client.capture({
    distinctId: args.distinctId,
    event: args.event,
    properties: args.properties,
  });

  await client.shutdown();
  posthogClient = null;
}
