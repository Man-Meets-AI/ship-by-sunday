import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type BillingQueryCtx = QueryCtx;
export type BillingMutationCtx = MutationCtx;
export type BillingReadCtx = QueryCtx | MutationCtx;

export type StripeCustomerDoc = Doc<"stripeCustomers">;
export type StarterLicenseTermDoc = Doc<"starterLicenseTerms">;
export type WorkersSubscriptionDoc = Doc<"workersSubscriptions">;
export type ProductEntitlementDoc = Doc<"productEntitlements">;
export type BillingRefundDoc = Doc<"billingRefunds">;
export type ProcessedStripeEventDoc = Doc<"processedStripeEvents">;
export type ProcessedCalEventDoc = Doc<"processedCalEvents">;
export type BillingEmailDeliveryDoc = Doc<"billingEmailDeliveries">;
export type WorkerSealTeam6BookingDoc = Doc<"workerSealTeam6Bookings">;

export type StarterLicenseTermId = Id<"starterLicenseTerms">;
export type WorkersSubscriptionId = Id<"workersSubscriptions">;
export type BillingEmailDeliveryId = Id<"billingEmailDeliveries">;
export type WorkerSealTeam6BookingId = Id<"workerSealTeam6Bookings">;

export type BillingProductKey = ProductEntitlementDoc["productKey"];
export type BillingEntitlementCapability = ProductEntitlementDoc["capability"];
export type BillingRefundState = StarterLicenseTermDoc["refundState"];
export type WorkersBillingCadence = WorkersSubscriptionDoc["cadence"];
export type WorkersSubscriptionStatus = WorkersSubscriptionDoc["status"];
export type WorkerSealTeam6BookingStatus = WorkerSealTeam6BookingDoc["status"];
export type WorkerSealTeam6PaymentStatus =
	WorkerSealTeam6BookingDoc["paymentStatus"];
