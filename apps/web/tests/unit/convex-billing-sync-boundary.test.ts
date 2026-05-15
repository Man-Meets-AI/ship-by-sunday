import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("convex billing sync boundary", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env.CONVEX_WEBHOOK_MUTATION_SECRET =
			"convex_webhook_mutation_secret_1234567890";
	});

	afterEach(() => {
		process.env = { ...originalEnv };
	});

	it("rejects public billing sync calls with the wrong shared secret", async () => {
		const { syncStarterLicenseTermFromServer } =
			await import("@/convex/billing");

		await expect(
			syncStarterLicenseTermFromServer._handler({} as never, {
				convexWebhookMutationSecret: "wrong_secret",
				ownerClerkUserId: "user_123",
				stripeCheckoutSessionId: "cs_123",
				purchasedAt: Date.UTC(2026, 4, 14),
			}),
		).rejects.toThrow("Unauthorized billing sync call.");
	});

	it("rejects public Worker Seal Team 6 booking sync calls with the wrong shared secret", async () => {
		const { syncWorkerSealTeam6BookingFromServer } =
			await import("@/convex/billing");

		await expect(
			syncWorkerSealTeam6BookingFromServer._handler({} as never, {
				convexWebhookMutationSecret: "wrong_secret",
				calBookingUid: "booking_123",
				status: "scheduled",
				paymentStatus: "paid",
				attendeeEmail: "buyer@example.com",
			}),
		).rejects.toThrow("Unauthorized billing sync call.");
	});

	it("rejects public Cal.com processed-event writes with the wrong shared secret", async () => {
		const { recordProcessedCalEventFromServer } =
			await import("@/convex/billing");

		await expect(
			recordProcessedCalEventFromServer._handler({} as never, {
				convexWebhookMutationSecret: "wrong_secret",
				calEventId: "cal_event_123",
				eventType: "BOOKING_PAID",
				status: "applied",
			}),
		).rejects.toThrow("Unauthorized billing sync call.");
	});
});
