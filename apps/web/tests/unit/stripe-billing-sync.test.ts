import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("getWorkersBillingCadenceFromStripePrice", () => {
	it("maps supported Stripe recurring intervals to Workers billing cadence", async () => {
		const { getWorkersBillingCadenceFromStripePrice } =
			await import("@/lib/billing/stripe-sync");

		expect(
			getWorkersBillingCadenceFromStripePrice({
				recurring: {
					interval: "month",
					interval_count: 1,
				},
			} as never),
		).toBe("monthly");
		expect(
			getWorkersBillingCadenceFromStripePrice({
				recurring: {
					interval: "month",
					interval_count: 3,
				},
			} as never),
		).toBe("quarterly");
		expect(
			getWorkersBillingCadenceFromStripePrice({
				recurring: {
					interval: "year",
					interval_count: 1,
				},
			} as never),
		).toBe("annual");
	});

	it("rejects one-time or unsupported Workers prices", async () => {
		const { getWorkersBillingCadenceFromStripePrice } =
			await import("@/lib/billing/stripe-sync");

		expect(() =>
			getWorkersBillingCadenceFromStripePrice({
				recurring: null,
			} as never),
		).toThrow("Workers subscription price must be recurring.");
		expect(() =>
			getWorkersBillingCadenceFromStripePrice({
				recurring: {
					interval: "week",
					interval_count: 1,
				},
			} as never),
		).toThrow("Unsupported Workers subscription cadence: 1 week.");
	});
});
