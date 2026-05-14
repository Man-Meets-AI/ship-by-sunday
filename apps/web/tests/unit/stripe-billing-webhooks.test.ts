import { describe, expect, it } from "vitest";

import { getStripeBillingSyncTargetFromWebhookEvent } from "@/lib/billing/stripe-webhooks";

describe("getStripeBillingSyncTargetFromWebhookEvent", () => {
	it("targets paid Checkout sessions for billing sync", () => {
		expect(
			getStripeBillingSyncTargetFromWebhookEvent({
				created: 1_800_000_000,
				id: "evt_checkout",
				type: "checkout.session.completed",
				data: {
					object: {
						id: "cs_123",
					},
				},
			} as never),
		).toEqual({
			kind: "checkout_session",
			eventCreatedAt: 1_800_000_000_000,
			eventId: "evt_checkout",
			eventType: "checkout.session.completed",
			sessionId: "cs_123",
		});
	});

	it("targets subscription lifecycle events", () => {
		expect(
			getStripeBillingSyncTargetFromWebhookEvent({
				created: 1_800_000_001,
				id: "evt_subscription",
				type: "customer.subscription.updated",
				data: {
					object: {
						id: "sub_123",
						customer: "cus_123",
					},
				},
			} as never),
		).toEqual({
			kind: "subscription",
			eventCreatedAt: 1_800_000_001_000,
			eventId: "evt_subscription",
			eventType: "customer.subscription.updated",
			stripeCustomerId: "cus_123",
			stripeSubscriptionId: "sub_123",
		});
	});

	it("targets subscription invoices with their Stripe subscription id", () => {
		expect(
			getStripeBillingSyncTargetFromWebhookEvent({
				created: 1_800_000_002,
				id: "evt_invoice",
				type: "invoice.payment_failed",
				data: {
					object: {
						id: "in_123",
						customer: "cus_123",
						subscription: "sub_123",
					},
				},
			} as never),
		).toEqual({
			kind: "invoice_subscription",
			eventCreatedAt: 1_800_000_002_000,
			eventId: "evt_invoice",
			eventType: "invoice.payment_failed",
			stripeCustomerId: "cus_123",
			stripeInvoiceId: "in_123",
			stripeSubscriptionId: "sub_123",
		});
	});

	it("targets current-shape subscription invoices through parent details", () => {
		expect(
			getStripeBillingSyncTargetFromWebhookEvent({
				created: 1_800_000_004,
				id: "evt_invoice_parent",
				type: "invoice.paid",
				data: {
					object: {
						id: "in_parent_123",
						customer: "cus_123",
						parent: {
							type: "subscription_details",
							subscription_details: {
								subscription: "sub_parent_123",
							},
						},
					},
				},
			} as never),
		).toEqual({
			kind: "invoice_subscription",
			eventCreatedAt: 1_800_000_004_000,
			eventId: "evt_invoice_parent",
			eventType: "invoice.paid",
			stripeCustomerId: "cus_123",
			stripeInvoiceId: "in_parent_123",
			stripeSubscriptionId: "sub_parent_123",
		});
	});

	it("records unsupported events as ignored targets", () => {
		expect(
			getStripeBillingSyncTargetFromWebhookEvent({
				created: 1_800_000_003,
				id: "evt_ignored",
				type: "invoice.created",
				data: {
					object: {
						id: "in_ignored",
					},
				},
			} as never),
		).toEqual({
			kind: "ignored",
			eventCreatedAt: 1_800_000_003_000,
			eventId: "evt_ignored",
			eventType: "invoice.created",
			reason: "unsupported_event_type",
		});
	});
});
