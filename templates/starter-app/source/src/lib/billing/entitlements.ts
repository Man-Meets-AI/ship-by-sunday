import { activeSubscriptionStatuses } from "./plans";

export function shouldEnableStarterProEntitlement(args: {
  status: string;
  stripePriceId?: string;
  starterPriceId?: string;
}) {
  return (
    activeSubscriptionStatuses.has(args.status) &&
    args.stripePriceId !== undefined &&
    args.starterPriceId !== undefined &&
    args.stripePriceId === args.starterPriceId
  );
}
