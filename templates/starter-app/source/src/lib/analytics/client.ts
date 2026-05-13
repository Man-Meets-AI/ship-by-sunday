"use client";

import posthog from "posthog-js";

import type { AnalyticsEvent } from "@/lib/analytics/events";

export function captureClientEvent(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | null | undefined>,
) {
  posthog.capture(event, properties);
}
