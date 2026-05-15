import { v } from "convex/values";

export const billingProductKeyValidator = v.union(
	v.literal("starter"),
	v.literal("workers"),
	v.literal("worker_seal_team_6"),
);

export const billingEntitlementCapabilityValidator = v.union(
	v.literal("generate_codebase"),
	v.literal("tutorials"),
	v.literal("worker"),
);

export const billingEntitlementStatusValidator = v.union(
	v.literal("active"),
	v.literal("inactive"),
);

export const billingEntitlementSourceValidator = v.union(
	v.literal("starter_license"),
	v.literal("workers_subscription"),
	v.literal("support_adjustment"),
);

export const starterLicenseTermStatusValidator = v.union(
	v.literal("active"),
	v.literal("voided"),
);

export const billingRefundStateValidator = v.union(
	v.literal("none"),
	v.literal("partial_refunded"),
	v.literal("fully_refunded"),
);

export const workersBillingCadenceValidator = v.union(
	v.literal("monthly"),
	v.literal("quarterly"),
	v.literal("annual"),
);

export const workersSubscriptionStatusValidator = v.union(
	v.literal("incomplete"),
	v.literal("incomplete_expired"),
	v.literal("trialing"),
	v.literal("active"),
	v.literal("past_due"),
	v.literal("unpaid"),
	v.literal("canceled"),
	v.literal("paused"),
);

export const billingProviderValidator = v.union(
	v.literal("stripe"),
	v.literal("cal_com"),
);

export const billingRefundStatusValidator = v.union(
	v.literal("pending"),
	v.literal("succeeded"),
	v.literal("failed"),
	v.literal("canceled"),
);

export const billingRefundAmountKindValidator = v.union(
	v.literal("full"),
	v.literal("partial"),
);

export const billingRefundProductStateChangeKindValidator = v.union(
	v.literal("none"),
	v.literal("access_removed"),
	v.literal("future_fulfillment_canceled"),
	v.literal("fulfilled_service_recorded"),
);

export const billingProviderEventStatusValidator = v.union(
	v.literal("applied"),
	v.literal("skipped"),
	v.literal("failed"),
);

export const billingEmailKindValidator = v.union(
	v.literal("workers_failed_payment_customer"),
	v.literal("workers_recovered_payment_customer"),
	v.literal("workers_terminal_failed_recovery_customer"),
	v.literal("workers_cancellation_customer"),
	v.literal("workers_failed_payment_ops"),
	v.literal("workers_recovered_payment_ops"),
	v.literal("workers_terminal_failed_recovery_ops"),
	v.literal("refund_customer_status"),
	v.literal("refund_ops_closeout"),
	v.literal("worker_seal_team_6_customer_prep"),
	v.literal("worker_seal_team_6_ops"),
);

export const billingEmailRecipientKindValidator = v.union(
	v.literal("customer"),
	v.literal("billing_ops"),
	v.literal("worker_seal_team_6_ops"),
);

export const billingEmailDeliveryStatusValidator = v.union(
	v.literal("queued"),
	v.literal("sent"),
	v.literal("skipped"),
	v.literal("failed"),
);

export const workerSealTeam6BookingStatusValidator = v.union(
	v.literal("created"),
	v.literal("scheduled"),
	v.literal("rescheduled"),
	v.literal("canceled"),
	v.literal("fulfilled"),
);

export const workerSealTeam6PaymentStatusValidator = v.union(
	v.literal("unpaid"),
	v.literal("payment_pending"),
	v.literal("paid"),
	v.literal("partially_refunded"),
	v.literal("fully_refunded"),
);

export const workerSealTeam6FulfillmentStatusValidator = v.union(
	v.literal("not_started"),
	v.literal("prep_sent"),
	v.literal("ops_notified"),
	v.literal("fulfilled"),
	v.literal("canceled"),
);

export const workerSealTeam6IntakeAnswerValidator = v.object({
	label: v.string(),
	value: v.string(),
});

export const billingAttentionStateValidator = v.union(
	v.object({
		kind: v.literal("none"),
	}),
	v.object({
		kind: v.literal("workers_past_due"),
		productKey: v.literal("workers"),
		nondismissible: v.literal(true),
		accessThroughAt: v.optional(v.number()),
		nextPaymentAttemptAt: v.optional(v.number()),
		latestInvoiceId: v.optional(v.string()),
		paymentRecoveryUrl: v.optional(v.string()),
	}),
);

export const billingEntitlementSummaryValidator = v.object({
	capability: billingEntitlementCapabilityValidator,
	active: v.boolean(),
	productKey: billingProductKeyValidator,
	accessEndsAt: v.optional(v.number()),
});

export const viewerBillingStateReturnValidator = v.union(
	v.object({
		kind: v.literal("signed_out"),
	}),
	v.object({
		kind: v.literal("ready"),
		ownerClerkUserId: v.string(),
		starter: v.object({
			hasAccess: v.boolean(),
			licenseTermId: v.optional(v.id("starterLicenseTerms")),
			accessEndsAt: v.optional(v.number()),
			refundState: billingRefundStateValidator,
		}),
		workers: v.object({
			hasAccess: v.boolean(),
			subscriptionId: v.optional(v.id("workersSubscriptions")),
			stripeSubscriptionId: v.optional(v.string()),
			status: v.optional(workersSubscriptionStatusValidator),
			cadence: v.optional(workersBillingCadenceValidator),
			accessEndsAt: v.optional(v.number()),
			billingAttention: billingAttentionStateValidator,
		}),
		entitlements: v.array(billingEntitlementSummaryValidator),
		serviceBookings: v.array(
			v.object({
				bookingId: v.id("workerSealTeam6Bookings"),
				calBookingUid: v.string(),
				status: workerSealTeam6BookingStatusValidator,
				paymentStatus: workerSealTeam6PaymentStatusValidator,
				scheduledStartAt: v.optional(v.number()),
				scheduledEndAt: v.optional(v.number()),
			}),
		),
	}),
);

export const checkoutOfferIdValidator = v.union(
	v.literal("starter"),
	v.literal("workers"),
);

export const checkoutBuyerStartingPointValidator = v.union(
	v.literal("no_codebase"),
	v.literal("existing_codebase"),
	v.literal("unspecified"),
);

export const checkoutFulfillmentTrackValidator = v.union(
	v.literal("generated_codebase"),
	v.literal("existing_codebase_doctor"),
	v.literal("unspecified"),
);

export const checkoutResolvedFulfillmentTrackValidator = v.union(
	v.literal("generated_codebase"),
	v.literal("existing_codebase_doctor"),
);

export const checkoutCtaIdValidator = v.union(
	v.literal("hero_primary"),
	v.literal("pricing_primary"),
	v.literal("codebase_demo_generated"),
	v.literal("codebase_demo_existing"),
	v.literal("choice_generated"),
	v.literal("choice_existing"),
	v.literal("unspecified"),
);

export const checkoutIntentFieldsValidator = {
	buyerStartingPoint: v.optional(checkoutBuyerStartingPointValidator),
	checkoutCtaId: v.optional(checkoutCtaIdValidator),
	fulfillmentTrack: v.optional(checkoutFulfillmentTrackValidator),
} as const;
