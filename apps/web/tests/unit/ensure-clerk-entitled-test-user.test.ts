import { runCli } from "@/scripts/ensure-clerk-entitled-test-user.mjs";

function makeExistingUser(email: string, id = "user_exists") {
	return {
		id,
		email_addresses: [{ email_address: email }],
	};
}

describe("ensure-clerk-entitled-test-user", () => {
	it("uses the shared grant helper after the Clerk user already exists", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: true,
			json: vi
				.fn()
				.mockResolvedValue([makeExistingUser("test-entitled@test.com")]),
		});
		const grantProductAccessImpl = vi.fn().mockResolvedValue({
			code: 0,
			stdout: '{"granted":"patched"}',
			stderr: "",
		});

		const result = await runCli({
			env: {
				CLERK_SECRET_KEY: "sk_test_123",
				NEXT_PUBLIC_CONVEX_URL: "https://fast-echidna-802.convex.cloud",
				CONVEX_DEPLOYMENT: "dev:fast-echidna-802",
			},
			fetchImpl,
			grantProductAccessImpl,
		});

		expect(result.exitCode).toBe(0);
		expect(result.payload).toMatchObject({
			status: "ok",
			email: "test-entitled@test.com",
			clerkUserId: "user_exists",
			grantOutput: '{"granted":"patched"}',
		});
		expect(grantProductAccessImpl).toHaveBeenCalledWith({
			clerkUserId: "user_exists",
			courseSlug: "ship-by-sunday",
			env: {
				CLERK_SECRET_KEY: "sk_test_123",
				NEXT_PUBLIC_CONVEX_URL: "https://fast-echidna-802.convex.cloud",
				CONVEX_DEPLOYMENT: "dev:fast-echidna-802",
			},
		});
	});

	it("returns a structured error when the shared grant helper fails", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: true,
			json: vi
				.fn()
				.mockResolvedValue([makeExistingUser("test-entitled@test.com")]),
		});
		const grantProductAccessImpl = vi.fn().mockResolvedValue({
			code: 1,
			stdout: "",
			stderr: "convex unavailable",
		});

		const result = await runCli({
			env: {
				CLERK_SECRET_KEY: "sk_test_123",
				NEXT_PUBLIC_CONVEX_URL: "https://fast-echidna-802.convex.cloud",
				CONVEX_DEPLOYMENT: "dev:fast-echidna-802",
			},
			fetchImpl,
			grantProductAccessImpl,
		});

		expect(result.exitCode).toBe(1);
		expect(result.payload).toMatchObject({
			status: "error",
			clerkUserId: "user_exists",
			stderr: "convex unavailable",
		});
	});
});
