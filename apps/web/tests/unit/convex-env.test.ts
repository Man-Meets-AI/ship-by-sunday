import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("convex env", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = { ...originalEnv };
		vi.resetModules();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("only requires the specific env key being requested", async () => {
		process.env = {
			CLERK_FRONTEND_API_URL: "https://clerk.example.com",
		};

		const { requireConvexEnv } = await import("@/convex/env");

		expect(requireConvexEnv("CLERK_FRONTEND_API_URL")).toBe(
			"https://clerk.example.com",
		);
	});

	it("throws when the requested env key is missing", async () => {
		process.env = {};
		const { requireConvexEnv } = await import("@/convex/env");

		expect(() => requireConvexEnv("STRIPE_SECRET_KEY")).toThrow(
			"Missing required Convex environment variable: STRIPE_SECRET_KEY",
		);
	});

	it("reads optional support env without requiring unrelated provider keys", async () => {
		process.env = {
			TELEGRAM_SUPPORT_CHAT_ID: "-100123",
		};
		const { readOptionalConvexEnv } = await import("@/convex/env");

		expect(readOptionalConvexEnv("TELEGRAM_SUPPORT_CHAT_ID")).toBe("-100123");
		expect(readOptionalConvexEnv("TELEGRAM_SUPPORT_BOT_TOKEN")).toBeUndefined();
	});

	it("rejects short checkout fulfillment retry secrets", async () => {
		process.env = {
			CHECKOUT_FULFILLMENT_RETRY_SECRET: "short",
		};
		const { requireConvexEnv } = await import("@/convex/env");

		expect(() => requireConvexEnv("CHECKOUT_FULFILLMENT_RETRY_SECRET")).toThrow(
			"CHECKOUT_FULFILLMENT_RETRY_SECRET",
		);
	});

	it("normalizes copied checkout fulfillment retry secrets like the Next server env parser", async () => {
		const checkoutFulfillmentRetrySecret =
			"checkout_retry_secret_123456789012345";
		process.env = {
			CHECKOUT_FULFILLMENT_RETRY_SECRET: `${checkoutFulfillmentRetrySecret}\\n`,
		};
		const { requireConvexEnv } = await import("@/convex/env");

		expect(requireConvexEnv("CHECKOUT_FULFILLMENT_RETRY_SECRET")).toBe(
			checkoutFulfillmentRetrySecret,
		);
	});
});
