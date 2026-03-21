vi.mock("server-only", () => ({}));

describe("getClerkAuthorizedParties", () => {
	const originalEnv = { ...process.env };

	afterEach(async () => {
		process.env = { ...originalEnv };
		vi.resetModules();
	});

	it("uses the canonical app origin and configured Clerk allowlist entries", async () => {
		process.env.NODE_ENV = "production";
		process.env.APP_BASE_URL = "https://app.example.com/checkout/cancel";
		process.env.CLERK_AUTHORIZED_PARTIES =
			"https://preview.example.com, https://app.example.com";

		const { getClerkAuthorizedParties } =
			await import("@/platform/auth/clerk-authorized-parties");

		expect(getClerkAuthorizedParties()).toEqual([
			"https://app.example.com",
			"https://preview.example.com",
		]);
	});

	it("adds local development origins outside production", async () => {
		process.env.NODE_ENV = "development";
		delete process.env.APP_BASE_URL;
		delete process.env.CLERK_AUTHORIZED_PARTIES;

		const { getClerkAuthorizedParties } =
			await import("@/platform/auth/clerk-authorized-parties");

		expect(getClerkAuthorizedParties()).toEqual([
			"http://localhost:3000",
			"http://127.0.0.1:3000",
		]);
	});

	it("fails fast when a configured origin is invalid", async () => {
		process.env.NODE_ENV = "production";
		process.env.CLERK_AUTHORIZED_PARTIES = "not-a-url";

		const { getClerkAuthorizedParties } =
			await import("@/platform/auth/clerk-authorized-parties");

		expect(() => getClerkAuthorizedParties()).toThrow("Invalid URL");
	});
});
