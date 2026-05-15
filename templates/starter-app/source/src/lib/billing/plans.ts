export const activeSubscriptionStatuses = new Set([
  "active",
  "trialing",
  "past_due",
]);

export const currentSubscriptionStatuses = new Set([
  ...activeSubscriptionStatuses,
  "paused",
  "unpaid",
]);
