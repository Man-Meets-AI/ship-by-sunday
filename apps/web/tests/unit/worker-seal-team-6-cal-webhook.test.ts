import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import {
	getWorkerSealTeam6CalWebhookSyncTarget,
	verifyCalWebhookSignature,
} from "@/lib/cal/worker-seal-team-6-webhook";

vi.mock("server-only", () => ({}));

function signCalWebhookPayload(payload: string, secret: string) {
	return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

describe("Worker Seal Team 6 Cal.com webhook mapping", () => {
	it("verifies the Cal.com HMAC signature over the raw request body", () => {
		const payload = '{"triggerEvent":"BOOKING_PAID"}';
		const signature = signCalWebhookPayload(payload, "cal_secret");

		expect(
			verifyCalWebhookSignature({
				payload,
				signature: `sha256=${signature}`,
				secret: "cal_secret",
			}),
		).toBe(true);
		expect(
			verifyCalWebhookSignature({
				payload: new TextEncoder().encode(payload),
				signature: `sha256=${signature}`,
				secret: "cal_secret",
			}),
		).toBe(true);
		expect(
			verifyCalWebhookSignature({
				payload,
				signature,
				secret: "wrong_secret",
			}),
		).toBe(false);
	});

	it("maps a paid booking webhook into the Convex booking mirror input", () => {
		const target = getWorkerSealTeam6CalWebhookSyncTarget(
			JSON.stringify({
				id: "cal_event_123",
				triggerEvent: "BOOKING_PAID",
				createdAt: "2026-05-14T15:00:00.000Z",
				payload: {
					uid: "booking_123",
					eventTypeId: "event_type_123",
					startTime: "2026-05-20T17:00:00.000Z",
					endTime: "2026-05-20T18:00:00.000Z",
					attendees: [
						{
							email: "Buyer@Example.com",
							name: "Buyer Example",
							timeZone: "America/New_York",
						},
					],
					payment: {
						stripeCustomerId: "cus_123",
						paymentIntentId: "pi_123",
					},
					responses: {
						"Company URL": "https://example.com",
						"Desired outcome": {
							label: "Desired outcome",
							value: "Ship it",
						},
					},
					rescheduleUrl: "https://cal.com/reschedule/booking_123",
					cancelUrl: "https://cal.com/cancel/booking_123",
					bookingUrl: "https://cal.com/booking/booking_123",
				},
			}),
		);

		expect(target).toEqual({
			kind: "booking",
			calEventId: "cal_event_123",
			eventType: "BOOKING_PAID",
			booking: {
				calBookingUid: "booking_123",
				calEventTypeId: "event_type_123",
				stripeCustomerId: "cus_123",
				stripePaymentIntentId: "pi_123",
				status: "scheduled",
				paymentStatus: "paid",
				refundState: "none",
				fulfillmentStatus: "not_started",
				attendeeEmail: "Buyer@Example.com",
				attendeeName: "Buyer Example",
				attendeeTimeZone: "America/New_York",
				scheduledStartAt: Date.UTC(2026, 4, 20, 17),
				scheduledEndAt: Date.UTC(2026, 4, 20, 18),
				rescheduleUrl: "https://cal.com/reschedule/booking_123",
				cancelUrl: "https://cal.com/cancel/booking_123",
				calBookingUrl: "https://cal.com/booking/booking_123",
				intakeAnswers: [
					{
						label: "Company URL",
						value: "https://example.com",
					},
					{
						label: "Desired outcome",
						value: "Ship it",
					},
				],
				paidAt: Date.UTC(2026, 4, 14, 15),
			},
		});
	});

	it("maps Cal.com Stripe PaymentIntent metadata into the booking mirror", () => {
		const target = getWorkerSealTeam6CalWebhookSyncTarget(
			JSON.stringify({
				id: "cal_event_metadata_payment",
				triggerEvent: "BOOKING_PAID",
				createdAt: "2026-05-14T15:00:00.000Z",
				payload: {
					uid: "booking_123",
					metadata: {
						externalId: "pi_metadata_123",
					},
					attendees: [
						{
							email: "buyer@example.com",
						},
					],
				},
			}),
		);

		expect(target).toMatchObject({
			kind: "booking",
			booking: {
				stripePaymentIntentId: "pi_metadata_123",
				paymentStatus: "paid",
			},
		});
	});

	it("does not infer paid payment state for Cal.com cancellation events without payment fields", () => {
		const target = getWorkerSealTeam6CalWebhookSyncTarget(
			JSON.stringify({
				id: "cal_event_cancelled",
				triggerEvent: "BOOKING_CANCELLED",
				createdAt: "2026-05-14T15:00:00.000Z",
				payload: {
					uid: "booking_123",
					attendees: [
						{
							email: "buyer@example.com",
						},
					],
				},
			}),
		);

		expect(target).toMatchObject({
			kind: "booking",
			booking: {
				status: "canceled",
				paymentStatus: "payment_pending",
				refundState: "none",
				fulfillmentStatus: "canceled",
				canceledAt: Date.UTC(2026, 4, 14, 15),
			},
		});
		if (target.kind !== "booking") {
			throw new Error("Expected cancellation target to map to a booking");
		}
		expect(target.booking).not.toHaveProperty("paidAt");
	});

	it("caps Cal.com intake labels and values before syncing to Convex", () => {
		const longLabel = "L".repeat(180);
		const longValue = "V".repeat(2_500);
		const target = getWorkerSealTeam6CalWebhookSyncTarget(
			JSON.stringify({
				id: "cal_event_long_intake",
				triggerEvent: "BOOKING_CREATED",
				payload: {
					uid: "booking_123",
					attendees: [
						{
							email: "buyer@example.com",
						},
					],
					responses: {
						[longLabel]: longValue,
					},
				},
			}),
		);

		if (target.kind !== "booking") {
			throw new Error("Expected long intake target to map to a booking");
		}
		expect(target.booking.intakeAnswers).toHaveLength(1);
		expect(target.booking.intakeAnswers?.[0]?.label).toHaveLength(120);
		expect(target.booking.intakeAnswers?.[0]?.value).toHaveLength(2_000);
	});

	it("records unsupported Cal.com trigger events as skipped", () => {
		const target = getWorkerSealTeam6CalWebhookSyncTarget(
			JSON.stringify({
				id: "cal_event_unsupported",
				triggerEvent: "MEETING_ENDED",
				payload: {
					uid: "booking_123",
				},
			}),
		);

		expect(target).toEqual({
			kind: "skipped",
			calEventId: "cal_event_unsupported",
			eventType: "MEETING_ENDED",
			reason: "Unsupported Cal.com trigger event: MEETING_ENDED.",
			calBookingUid: "booking_123",
		});
	});

	it("does not treat explicit unpaid booking state as paid", () => {
		const target = getWorkerSealTeam6CalWebhookSyncTarget(
			JSON.stringify({
				id: "cal_event_unpaid",
				triggerEvent: "BOOKING_CREATED",
				payload: {
					uid: "booking_unpaid",
					paymentStatus: "unpaid",
					attendees: [
						{
							email: "buyer@example.com",
						},
					],
				},
			}),
		);

		expect(target).toMatchObject({
			kind: "booking",
			booking: {
				status: "created",
				paymentStatus: "unpaid",
			},
		});
	});
});
