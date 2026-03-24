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
});
