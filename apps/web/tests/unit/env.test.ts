vi.mock("server-only", () => ({}));

describe("env helpers", () => {
	const originalEnv = { ...process.env };

	afterEach(() => {
		process.env = { ...originalEnv };
	});

	it("parses the public env through the typed loader", async () => {
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_123";
		process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = "/sign-in";
		process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
		process.env.NEXT_PUBLIC_POSTHOG_TOKEN = "phc_test_123";
		process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";

		const { loadPublicEnv } = await import("@/platform/env/public");
		const publicEnv = loadPublicEnv();

		expect(publicEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe("pk_test_123");
		expect(publicEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL).toBe("/sign-in");
		expect(publicEnv.NEXT_PUBLIC_CONVEX_URL).toBe(
			"https://example.convex.cloud",
		);
		expect(publicEnv.NEXT_PUBLIC_POSTHOG_TOKEN).toBe("phc_test_123");
		expect(publicEnv.NEXT_PUBLIC_POSTHOG_HOST).toBe("https://us.i.posthog.com");
	});

	it("trims surrounding whitespace from public env values", async () => {
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = " pk_test_123\n";
		process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = " /sign-in \n";
		process.env.NEXT_PUBLIC_CONVEX_URL = " https://example.convex.cloud \n";
		process.env.NEXT_PUBLIC_POSTHOG_TOKEN = " phc_test_123 \n";
		process.env.NEXT_PUBLIC_POSTHOG_HOST = " https://us.i.posthog.com \n";

		const { loadPublicEnv } = await import("@/platform/env/public");
		const publicEnv = loadPublicEnv();

		expect(publicEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe("pk_test_123");
		expect(publicEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL).toBe("/sign-in");
		expect(publicEnv.NEXT_PUBLIC_CONVEX_URL).toBe(
			"https://example.convex.cloud",
		);
		expect(publicEnv.NEXT_PUBLIC_POSTHOG_TOKEN).toBe("phc_test_123");
		expect(publicEnv.NEXT_PUBLIC_POSTHOG_HOST).toBe("https://us.i.posthog.com");
	});

	it("defaults the Clerk sign-in URL to the local auth route when unset", async () => {
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_123";
		delete process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
		process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";

		const { loadPublicEnv } = await import("@/platform/env/public");
		const publicEnv = loadPublicEnv();

		expect(publicEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL).toBe("/sign-in");
	});

	it("rejects any Clerk sign-in URL that is not the local auth route", async () => {
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_123";
		process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = "/login";
		process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";

		const { loadPublicEnv } = await import("@/platform/env/public");

		expect(() => loadPublicEnv()).toThrow("/sign-in");
	});

	it("requires PostHog public token and host to be configured together", async () => {
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_123";
		process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = "/sign-in";
		process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
		process.env.NEXT_PUBLIC_POSTHOG_TOKEN = "phc_test_123";
		delete process.env.NEXT_PUBLIC_POSTHOG_HOST;

		const { loadPublicEnv } = await import("@/platform/env/public");

		expect(() => loadPublicEnv()).toThrow(
			"NEXT_PUBLIC_POSTHOG_TOKEN and NEXT_PUBLIC_POSTHOG_HOST must be set together.",
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
		process.env.POSTHOG_PROJECT_ID = " 317852 \n";
		process.env.POSTHOG_API_KEY = " phx_source_map_key \n";

		const { loadServerEnv } = await import("@/platform/env/server");
		const serverEnv = loadServerEnv();

		expect(serverEnv.APP_BASE_URL).toBe("https://www.man-meets-ai.com");
		expect(serverEnv.CLERK_FRONTEND_API_URL).toBe(
			"https://clerk.man-meets-ai.com",
		);
		expect(serverEnv.POSTHOG_PROJECT_ID).toBe("317852");
		expect(serverEnv.POSTHOG_API_KEY).toBe("phx_source_map_key");
	});

	it("requires a high-entropy checkout fulfillment retry secret", async () => {
		process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET = "short";

		const { loadServerEnv } = await import("@/platform/env/server");

		expect(() => loadServerEnv()).toThrow("CHECKOUT_FULFILLMENT_RETRY_SECRET");
	});
});
