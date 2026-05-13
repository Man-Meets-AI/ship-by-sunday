export const analyticsEvents = {
  startedCheckout: "started_checkout",
  coreActionCompleted: "core_action_completed",
  noteCreated: "note_created",
  testEmailSent: "test_email_sent",
  sentryDebugTriggered: "sentry_debug_triggered",
} as const;

export type AnalyticsEvent =
  (typeof analyticsEvents)[keyof typeof analyticsEvents];
