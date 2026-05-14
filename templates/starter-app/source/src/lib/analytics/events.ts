export const analyticsEvents = {
  startedCheckout: "started_checkout",
  chatMessageSent: "chat_message_sent",
  coreActionCompleted: "core_action_completed",
  testEmailSent: "test_email_sent",
  sentryDebugTriggered: "sentry_debug_triggered",
} as const;

export type AnalyticsEvent =
  (typeof analyticsEvents)[keyof typeof analyticsEvents];
