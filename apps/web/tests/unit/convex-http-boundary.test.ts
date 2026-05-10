import { describe, expect, it } from "vitest";

describe("Convex HTTP boundary", () => {
	it("does not import Next server-only modules", async () => {
		await expect(import("@/convex/http")).resolves.toHaveProperty("default");
	});

	it("keeps duplicate and pending-payment Stripe webhook results successful", async () => {
		const { buildStripeWebhookAcceptedResponseBody } =
			await import("@/convex/http");

		expect(
			buildStripeWebhookAcceptedResponseBody({
				kind: "payment_pending",
				paymentStatus: "unpaid",
			}),
		).toEqual({
			received: true,
			paymentPending: true,
			paymentStatus: "unpaid",
		});
		expect(
			buildStripeWebhookAcceptedResponseBody({
				kind: "duplicate",
				status: "processed",
				resultKind: "granted",
			}),
		).toEqual({
			received: true,
			duplicate: true,
			status: "processed",
			resultKind: "granted",
		});
	});
});
