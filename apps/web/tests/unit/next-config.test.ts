describe("next config", () => {
	const originalEnv = { ...process.env };

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.resetModules();
	});

	it("loads production config when PostHog source-map upload env is absent", async () => {
		process.env.NODE_ENV = "production";
		delete process.env.POSTHOG_API_KEY;
		delete process.env.POSTHOG_PROJECT_ID;

		await expect(import("../../next.config")).resolves.toBeDefined();
	});
});
