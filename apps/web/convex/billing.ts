import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
	recordProcessedCalEventArgs,
	recordProcessedCalEventHandler,
	recordProcessedCalEventReturns,
	recordProcessedStripeEventArgs,
	recordProcessedStripeEventHandler,
	recordProcessedStripeEventReturns,
	syncStarterLicenseTermArgs,
	syncStarterLicenseTermHandler,
	syncStarterLicenseTermReturns,
	syncWorkerSealTeam6BookingArgs,
	syncWorkerSealTeam6BookingHandler,
	syncWorkerSealTeam6BookingReturns,
	syncWorkersSubscriptionArgs,
	syncWorkersSubscriptionHandler,
	syncWorkersSubscriptionReturns,
	upsertBillingEmailDeliveryArgs,
	upsertBillingEmailDeliveryHandler,
	upsertBillingEmailDeliveryReturns,
	upsertBillingRefundArgs,
	upsertBillingRefundHandler,
	upsertBillingRefundReturns,
	viewerBillingStateArgs,
	viewerBillingStateHandler,
	viewerBillingStateReturns,
} from "./billing/model";
import { requireConvexEnv } from "./env";

function assertConvexWebhookMutationSecret(
	convexWebhookMutationSecret: string,
) {
	if (
		convexWebhookMutationSecret !==
		requireConvexEnv("CONVEX_WEBHOOK_MUTATION_SECRET")
	) {
		throw new Error("Unauthorized billing sync call.");
	}
}

const convexWebhookMutationSecretArgs = {
	convexWebhookMutationSecret: v.string(),
} as const;

export const viewerBillingState = query({
	args: viewerBillingStateArgs,
	returns: viewerBillingStateReturns,
	handler: viewerBillingStateHandler,
});

export const syncStarterLicenseTerm = internalMutation({
	args: syncStarterLicenseTermArgs,
	returns: syncStarterLicenseTermReturns,
	handler: syncStarterLicenseTermHandler,
});

export const syncStarterLicenseTermFromServer = mutation({
	args: {
		...convexWebhookMutationSecretArgs,
		...syncStarterLicenseTermArgs,
	},
	returns: syncStarterLicenseTermReturns,
	handler: async (ctx, args) => {
		assertConvexWebhookMutationSecret(args.convexWebhookMutationSecret);
		const { convexWebhookMutationSecret: _secret, ...syncArgs } = args;
		return await syncStarterLicenseTermHandler(ctx, syncArgs);
	},
});

export const syncWorkersSubscription = internalMutation({
	args: syncWorkersSubscriptionArgs,
	returns: syncWorkersSubscriptionReturns,
	handler: syncWorkersSubscriptionHandler,
});

export const syncWorkersSubscriptionFromServer = mutation({
	args: {
		...convexWebhookMutationSecretArgs,
		...syncWorkersSubscriptionArgs,
	},
	returns: syncWorkersSubscriptionReturns,
	handler: async (ctx, args) => {
		assertConvexWebhookMutationSecret(args.convexWebhookMutationSecret);
		const { convexWebhookMutationSecret: _secret, ...syncArgs } = args;
		return await syncWorkersSubscriptionHandler(ctx, syncArgs);
	},
});

export const recordProcessedStripeEvent = internalMutation({
	args: recordProcessedStripeEventArgs,
	returns: recordProcessedStripeEventReturns,
	handler: recordProcessedStripeEventHandler,
});

export const recordProcessedStripeEventFromServer = mutation({
	args: {
		...convexWebhookMutationSecretArgs,
		...recordProcessedStripeEventArgs,
	},
	returns: recordProcessedStripeEventReturns,
	handler: async (ctx, args) => {
		assertConvexWebhookMutationSecret(args.convexWebhookMutationSecret);
		const { convexWebhookMutationSecret: _secret, ...eventArgs } = args;
		return await recordProcessedStripeEventHandler(ctx, eventArgs);
	},
});

export const lookupStripeCustomerOwnerFromServer = query({
	args: {
		...convexWebhookMutationSecretArgs,
		stripeCustomerId: v.string(),
	},
	returns: v.union(
		v.object({
			ownerClerkUserId: v.string(),
			email: v.optional(v.string()),
		}),
		v.null(),
	),
	handler: async (ctx, args) => {
		assertConvexWebhookMutationSecret(args.convexWebhookMutationSecret);
		const customer = await ctx.db
			.query("stripeCustomers")
			.withIndex("by_stripe_customer_id", (indexQuery) =>
				indexQuery.eq("stripeCustomerId", args.stripeCustomerId),
			)
			.unique();

		return customer
			? {
					ownerClerkUserId: customer.ownerClerkUserId,
					...(customer.email ? { email: customer.email } : {}),
				}
			: null;
	},
});

export const recordProcessedCalEvent = internalMutation({
	args: recordProcessedCalEventArgs,
	returns: recordProcessedCalEventReturns,
	handler: recordProcessedCalEventHandler,
});

export const recordProcessedCalEventFromServer = mutation({
	args: {
		...convexWebhookMutationSecretArgs,
		...recordProcessedCalEventArgs,
	},
	returns: recordProcessedCalEventReturns,
	handler: async (ctx, args) => {
		assertConvexWebhookMutationSecret(args.convexWebhookMutationSecret);
		const { convexWebhookMutationSecret: _secret, ...eventArgs } = args;
		return await recordProcessedCalEventHandler(ctx, eventArgs);
	},
});

export const upsertBillingRefund = internalMutation({
	args: upsertBillingRefundArgs,
	returns: upsertBillingRefundReturns,
	handler: upsertBillingRefundHandler,
});

export const upsertBillingEmailDelivery = internalMutation({
	args: upsertBillingEmailDeliveryArgs,
	returns: upsertBillingEmailDeliveryReturns,
	handler: upsertBillingEmailDeliveryHandler,
});

export const syncWorkerSealTeam6Booking = internalMutation({
	args: syncWorkerSealTeam6BookingArgs,
	returns: syncWorkerSealTeam6BookingReturns,
	handler: syncWorkerSealTeam6BookingHandler,
});

export const syncWorkerSealTeam6BookingFromServer = mutation({
	args: {
		...convexWebhookMutationSecretArgs,
		...syncWorkerSealTeam6BookingArgs,
	},
	returns: syncWorkerSealTeam6BookingReturns,
	handler: async (ctx, args) => {
		assertConvexWebhookMutationSecret(args.convexWebhookMutationSecret);
		const { convexWebhookMutationSecret: _secret, ...syncArgs } = args;
		return await syncWorkerSealTeam6BookingHandler(ctx, syncArgs);
	},
});
