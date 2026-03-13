import {
	checkClerkTestUser,
	ensureClerkTestUser,
	findUserByEmail,
	loadConfiguredAccount,
	runCli,
} from "@/scripts/ensure-clerk-test-user.mjs";

function makeUser(email: string, id = "user_123") {
	return {
		id,
		email_addresses: [{ email_address: email }],
	};
}

describe("ensure-clerk-test-user", () => {
	let account: Awaited<ReturnType<typeof loadConfiguredAccount>>;

	beforeAll(async () => {
		account = await loadConfiguredAccount();
	});

	it("finds an exact email match from a Clerk user list", () => {
		const user = findUserByEmail(
			[makeUser("someone@example.com"), makeUser("Test@test.com", "user_test")],
			"test@test.com",
		);

		expect(user?.id).toBe("user_test");
	});

	it("returns exists when the Clerk test user is already present", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue([makeUser(account.email, "user_exists")]),
		});

		const result = await checkClerkTestUser({
			account,
			secretKey: "sk_test_123",
			fetchImpl,
		});

		expect(result).toMatchObject({
			status: "exists",
			clerkUserId: "user_exists",
			email: account.email,
		});
		expect(fetchImpl).toHaveBeenCalledTimes(1);
	});

	it("returns missing without creating anything when no exact user exists", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue([]),
		});

		const result = await checkClerkTestUser({
			account,
			secretKey: "sk_test_123",
			fetchImpl,
		});

		expect(result).toMatchObject({
			status: "missing",
			email: account.email,
		});
		expect(fetchImpl).toHaveBeenCalledTimes(1);
	});

	it("queries Clerk users with a lowercase email to avoid case-sensitive misses", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue([]),
		});

		await checkClerkTestUser({
			account: {
				...account,
				email: "Test@Test.com",
			},
			secretKey: "sk_test_123",
			fetchImpl,
		});

		const requestUrl = new URL(String(fetchImpl.mock.calls[0]?.[0]));
		expect(requestUrl.searchParams.get("query")).toBe("test@test.com");
	});

	it("creates the user after a missing check", async () => {
		const fetchImpl = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: vi.fn().mockResolvedValue([]),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: vi.fn().mockResolvedValue({
					id: "user_created",
					email_addresses: [{ email_address: account.email }],
				}),
			});

		const result = await ensureClerkTestUser({
			account,
			secretKey: "sk_test_123",
			fetchImpl,
		});

		expect(result).toMatchObject({
			status: "created",
			clerkUserId: "user_created",
			email: account.email,
		});
		expect(fetchImpl).toHaveBeenCalledTimes(2);
		expect(fetchImpl.mock.calls[1]?.[1]).toMatchObject({
			method: "POST",
		});
	});

	it("returns blocked when the Clerk secret key is missing", async () => {
		const fetchImpl = vi.fn();

		const result = await checkClerkTestUser({
			account,
			secretKey: "",
			fetchImpl,
		});

		expect(result).toMatchObject({
			status: "blocked",
			message: "Missing CLERK_SECRET_KEY.",
		});
		expect(fetchImpl).not.toHaveBeenCalled();
	});

	it("returns blocked when Clerk rejects creation for instance or auth constraints", async () => {
		const fetchImpl = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: vi.fn().mockResolvedValue([]),
			})
			.mockResolvedValueOnce({
				ok: false,
				status: 422,
				json: vi.fn().mockResolvedValue({
					errors: [{ long_message: "Password sign-in is disabled." }],
				}),
			});

		const result = await ensureClerkTestUser({
			account,
			secretKey: "sk_test_123",
			fetchImpl,
		});

		expect(result).toMatchObject({
			status: "blocked",
			message: "Password sign-in is disabled.",
		});
	});

	it("returns a cli usage error for an invalid mode", async () => {
		const result = await runCli({
			args: ["nope"],
			env: { CLERK_SECRET_KEY: "sk_test_123" },
			fetchImpl: vi.fn(),
		});

		expect(result.exitCode).toBe(1);
		expect(result.payload.status).toBe("error");
	});
});
