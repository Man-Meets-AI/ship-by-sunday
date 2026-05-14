import { internalMutation, query } from "./_generated/server";
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

export const syncWorkersSubscription = internalMutation({
	args: syncWorkersSubscriptionArgs,
	returns: syncWorkersSubscriptionReturns,
	handler: syncWorkersSubscriptionHandler,
});

export const recordProcessedStripeEvent = internalMutation({
	args: recordProcessedStripeEventArgs,
	returns: recordProcessedStripeEventReturns,
	handler: recordProcessedStripeEventHandler,
});

export const recordProcessedCalEvent = internalMutation({
	args: recordProcessedCalEventArgs,
	returns: recordProcessedCalEventReturns,
	handler: recordProcessedCalEventHandler,
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
