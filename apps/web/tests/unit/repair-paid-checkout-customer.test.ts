import {
	buildRepairPaidCheckoutClaimCommand,
	ensureCheckoutEmailClerkUser,
	parseArgs,
	runCli,
} from "@/scripts/repair-paid-checkout-customer.mjs";
import { CONVEX_BIN_PATH } from "@/scripts/lib/convex-product-access-grant.mjs";

function makeClerkUser(email: string, id = "user_checkout") {
	return {
		id,
		email_addresses: [{ email_address: email }],
	};
}

describe("repair-paid-checkout-customer", () => {
	it("parses required checkout repair inputs", () => {
		expect(
			parseArgs([
				"--checkout-email",
				" Buyer@Example.com ",
				"--stripe-checkout-session-id=cs_live_123",
				"--create-clerk-user",
			]),
		).toEqual({
			checkoutEmail: "buyer@example.com",
			stripeCheckoutSessionId: "cs_live_123",
			clerkUserId: null,
			createClerkUser: true,
		});
	});

	it("builds the production Convex repair command", () => {
		expect(
			buildRepairPaidCheckoutClaimCommand({
				checkoutEmail: "buyer@example.com",
				stripeCheckoutSessionId: "cs_live_123",
				clerkUserId: "user_123",
			}),
		).toEqual({
			command: process.execPath,
			args: [
				CONVEX_BIN_PATH,
				"run",
				"--prod",
				"checkoutClaims:repairPaidCheckoutClaim",
				'{"stripeCheckoutSessionId":"cs_live_123","checkoutEmail":"buyer@example.com","clerkUserId":"user_123"}',
			],
		});
	});

	it("reuses an existing Clerk user for the checkout email", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: true,
			json: vi
				.fn()
				.mockResolvedValue([makeClerkUser("buyer@example.com", "user_exists")]),
		});

		await expect(
			ensureCheckoutEmailClerkUser({
				secretKey: "sk_live_123",
				email: "buyer@example.com",
				stripeCheckoutSessionId: "cs_live_123",
				createClerkUser: false,
				fetchImpl,
			}),
		).resolves.toEqual({
			status: "exists",
			clerkUserId: "user_exists",
		});
	});

	it("creates a passwordless Clerk user when explicitly requested", async () => {
		const fetchImpl = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: vi.fn().mockResolvedValue([]),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: vi.fn().mockResolvedValue({ id: "user_created" }),
			});

		await expect(
			ensureCheckoutEmailClerkUser({
				secretKey: "sk_live_123",
				email: "buyer@example.com",
				stripeCheckoutSessionId: "cs_live_123",
				createClerkUser: true,
				fetchImpl,
			}),
		).resolves.toEqual({
			status: "created",
			clerkUserId: "user_created",
		});

		const createBody = JSON.parse(String(fetchImpl.mock.calls[1]?.[1]?.body));
		expect(createBody).toMatchObject({
			email_address: ["buyer@example.com"],
			skip_password_requirement: true,
			private_metadata: {
				shipBySundayPaidCheckoutRepair: {
					checkoutEmail: "buyer@example.com",
					stripeCheckoutSessionId: "cs_live_123",
					source: "repair-paid-checkout-customer",
				},
			},
		});
	});

	it("blocks missing Clerk users unless creation is explicit", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue([]),
		});

		await expect(
			runCli({
				args: [
					"--checkout-email",
					"buyer@example.com",
					"--stripe-checkout-session-id",
					"cs_live_123",
				],
				env: { CLERK_SECRET_KEY: "sk_live_123" },
				fetchImpl,
				repairPaidCheckoutClaimImpl: vi.fn(),
			}),
		).resolves.toMatchObject({
			exitCode: 1,
			payload: {
				status: "blocked",
				clerkUserStatus: "missing",
			},
		});
	});

	it("repairs the paid checkout after resolving the Clerk user", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: true,
			json: vi
				.fn()
				.mockResolvedValue([makeClerkUser("buyer@example.com", "user_exists")]),
		});
		const repairPaidCheckoutClaimImpl = vi.fn().mockResolvedValue({
			code: 0,
			stdout: '{"repair":"repaired"}',
			stderr: "",
		});

		await expect(
			runCli({
				args: [
					"--checkout-email",
					"buyer@example.com",
					"--stripe-checkout-session-id",
					"cs_live_123",
				],
				env: { CLERK_SECRET_KEY: "sk_live_123" },
				fetchImpl,
				repairPaidCheckoutClaimImpl,
			}),
		).resolves.toMatchObject({
			exitCode: 0,
			payload: {
				status: "ok",
				checkoutEmail: "buyer@example.com",
				clerkUserId: "user_exists",
				clerkUserStatus: "exists",
			},
		});
		expect(repairPaidCheckoutClaimImpl).toHaveBeenCalledWith({
			checkoutEmail: "buyer@example.com",
			stripeCheckoutSessionId: "cs_live_123",
			clerkUserId: "user_exists",
			env: { CLERK_SECRET_KEY: "sk_live_123" },
		});
	});
});
