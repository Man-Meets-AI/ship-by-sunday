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

		const { loadPublicEnv } = await import("@/platform/env/public");
		const publicEnv = loadPublicEnv();

		expect(publicEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe("pk_test_123");
		expect(publicEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL).toBe("/sign-in");
		expect(publicEnv.NEXT_PUBLIC_CONVEX_URL).toBe(
			"https://example.convex.cloud",
		);
	});

	it("trims surrounding whitespace from public env values", async () => {
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = " pk_test_123\n";
		process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = " /sign-in \n";
		process.env.NEXT_PUBLIC_CONVEX_URL = " https://example.convex.cloud \n";

		const { loadPublicEnv } = await import("@/platform/env/public");
		const publicEnv = loadPublicEnv();

		expect(publicEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe("pk_test_123");
		expect(publicEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL).toBe("/sign-in");
		expect(publicEnv.NEXT_PUBLIC_CONVEX_URL).toBe(
			"https://example.convex.cloud",
		);
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

		const { loadServerEnv } = await import("@/platform/env/server");
		const serverEnv = loadServerEnv();

		expect(serverEnv.APP_BASE_URL).toBe("https://www.man-meets-ai.com");
		expect(serverEnv.CLERK_FRONTEND_API_URL).toBe(
			"https://clerk.man-meets-ai.com",
		);
	});
});
