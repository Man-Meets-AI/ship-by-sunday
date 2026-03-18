describe("env helpers", () => {
	const originalEnv = { ...process.env };

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.resetModules();
	});

	it("parses the public env through the typed loader", async () => {
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_123";
		process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";

		const { publicEnv } = await import("@/platform/env/public");

		expect(publicEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe("pk_test_123");
		expect(publicEnv.NEXT_PUBLIC_CONVEX_URL).toBe(
			"https://example.convex.cloud",
		);
	});

	it("trims surrounding whitespace from public env values", async () => {
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = " pk_test_123\n";
		process.env.NEXT_PUBLIC_CONVEX_URL = " https://example.convex.cloud \n";

		const { publicEnv } = await import("@/platform/env/public");

		expect(publicEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe("pk_test_123");
		expect(publicEnv.NEXT_PUBLIC_CONVEX_URL).toBe(
			"https://example.convex.cloud",
		);
	});

	it("throws an actionable error when a required server env is requested but missing", async () => {
		delete process.env.STRIPE_SECRET_KEY;

		const { requireServerEnv } = await import("@/platform/env/server");

		expect(() => requireServerEnv("STRIPE_SECRET_KEY")).toThrow(
			"Missing required environment variable: STRIPE_SECRET_KEY",
		);
	});

	it("trims surrounding whitespace from optional server env values", async () => {
		process.env.APP_BASE_URL = " https://www.man-meets-ai.com \n";
		process.env.CLERK_FRONTEND_API_URL = " https://clerk.man-meets-ai.com\n";

		const { serverEnv } = await import("@/platform/env/server");

		expect(serverEnv.APP_BASE_URL).toBe("https://www.man-meets-ai.com");
		expect(serverEnv.CLERK_FRONTEND_API_URL).toBe(
			"https://clerk.man-meets-ai.com",
		);
	});
});
