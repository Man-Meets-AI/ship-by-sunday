import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const retrieveSessionMock = vi.fn();
const stripeConstructorArgs: Array<Array<unknown>> = [];
const checkoutFulfillmentRetrySecret = "checkout_retry_secret_123456789012345";

class StripeMock {
	checkout = {
		sessions: {
			retrieve: retrieveSessionMock,
		},
	};

	constructor(...args: Array<unknown>) {
		stripeConstructorArgs.push(args);
	}
}

vi.mock("stripe", () => ({
	default: StripeMock,
}));

function createActionCtx({
	identity = {
		subject: "user_123",
		tokenIdentifier: "https://clerk.example.com|user_123",
		email: "buyer@example.com",
		emailVerified: true,
	},
	runMutation = vi.fn(),
	runQuery = vi.fn(),
}: {
	identity?: Record<string, unknown> | null;
	runMutation?: ReturnType<typeof vi.fn>;
	runQuery?: ReturnType<typeof vi.fn>;
} = {}) {
	return {
		auth: {
			getUserIdentity: vi.fn().mockResolvedValue(identity),
		},
		runMutation,
		runQuery,
	};
}

describe("convex/checkoutClaimsActions", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			CLERK_SECRET_KEY: "sk_clerk_test_123",
			STRIPE_SECRET_KEY: "sk_test_123",
			STRIPE_WEBHOOK_SECRET: "whsec_test_123",
			CHECKOUT_FULFILLMENT_RETRY_SECRET: checkoutFulfillmentRetrySecret,
		};
		retrieveSessionMock.mockReset();
		stripeConstructorArgs.length = 0;
		vi.resetModules();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("requires an authenticated viewer", async () => {
		const { claimCheckoutSessionForViewer } =
			await import("@/convex/checkoutClaimsActions");

		const result = await claimCheckoutSessionForViewer._handler(
			createActionCtx({ identity: null }) as never,
			{ sessionId: "cs_test_123" },
		);

		expect(result).toEqual({
			kind: "sign_in_required",
			sessionId: "cs_test_123",
		});
		expect(retrieveSessionMock).not.toHaveBeenCalled();
	});

	it("grants access directly when the checkout already belongs to the signed-in Clerk user", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_test_123",
			metadata: {
				buyerStartingPoint: "existing_codebase",
				checkoutCtaId: "codebase_demo_existing",
				clerkUserId: "user_123",
				courseSlug: "ship-by-sunday",
				fulfillmentTrack: "existing_codebase_doctor",
			},
			client_reference_id: null,
			customer: "cus_123",
			payment_intent: "pi_123",
			payment_status: "paid",
		});
		const runMutation = vi.fn().mockResolvedValue({ granted: "inserted" });
		const { claimCheckoutSessionForViewer } =
			await import("@/convex/checkoutClaimsActions");

		const result = await claimCheckoutSessionForViewer._handler(
			createActionCtx({ runMutation }) as never,
			{ sessionId: "cs_test_123" },
		);

		expect(result).toEqual({
			kind: "validated",
			sessionId: "cs_test_123",
			claimResult: {
				granted: "inserted",
			},
		});
		expect(runMutation).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				clerkUserId: "user_123",
				source: "stripe_checkout",
				stripeCheckoutSessionId: "cs_test_123",
				stripeCustomerId: "cus_123",
				stripePaymentIntentId: "pi_123",
				fulfillmentTrack: "existing_codebase_doctor",
			}),
		);
	});

	it("persists and claims a guest checkout when the signed-in email matches", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_guest_123",
			metadata: {
				courseSlug: "ship-by-sunday",
			},
			client_reference_id: null,
			customer_details: {
				email: "buyer@example.com",
			},
			customer: "cus_123",
			payment_intent: "pi_123",
			payment_status: "paid",
		});
		const runMutation = vi
			.fn()
			.mockResolvedValueOnce({ saved: "inserted" })
			.mockResolvedValueOnce({
				claim: "claimed",
				grantResult: {
					granted: "inserted",
				},
			});
		const { claimCheckoutSessionForViewer } =
			await import("@/convex/checkoutClaimsActions");

		const result = await claimCheckoutSessionForViewer._handler(
			createActionCtx({ runMutation }) as never,
			{ sessionId: "cs_guest_123" },
		);

		expect(result).toEqual({
			kind: "validated",
			sessionId: "cs_guest_123",
			claimResult: {
				claim: "claimed",
				grantResult: {
					granted: "inserted",
				},
			},
		});
		expect(runMutation.mock.calls[0]?.[1]).toMatchObject({
			stripeCheckoutSessionId: "cs_guest_123",
			checkoutEmail: "buyer@example.com",
		});
		expect(runMutation).toHaveBeenNthCalledWith(2, expect.anything(), {
			stripeCheckoutSessionId: "cs_guest_123",
		});
	});

	it("refuses a guest checkout when the authenticated account does not match", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_guest_wrong",
			metadata: {
				courseSlug: "ship-by-sunday",
			},
			client_reference_id: null,
			customer_details: {
				email: "buyer@example.com",
			},
			payment_status: "paid",
		});
		const runMutation = vi
			.fn()
			.mockResolvedValueOnce({ saved: "inserted" })
			.mockResolvedValueOnce({
				claim: "email_mismatch",
			});
		const { claimCheckoutSessionForViewer } =
			await import("@/convex/checkoutClaimsActions");

		const result = await claimCheckoutSessionForViewer._handler(
			createActionCtx({
				identity: {
					subject: "user_456",
					tokenIdentifier: "https://clerk.example.com|user_456",
					email: "other@example.com",
					emailVerified: true,
				},
				runMutation,
			}) as never,
			{ sessionId: "cs_guest_wrong" },
		);

		expect(result).toEqual({
			kind: "wrong_account",
			sessionId: "cs_guest_wrong",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: "other@example.com",
		});
	});

	it("returns safe account details when a paid checkout belongs to another signed-in Clerk user", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_signed_in_wrong",
			metadata: {
				clerkUserId: "user_123",
				courseSlug: "ship-by-sunday",
			},
			client_reference_id: null,
			customer_details: {
				email: "buyer@example.com",
			},
			payment_status: "paid",
		});
		const { claimCheckoutSessionForViewer } =
			await import("@/convex/checkoutClaimsActions");

		const result = await claimCheckoutSessionForViewer._handler(
			createActionCtx({
				identity: {
					subject: "user_456",
					tokenIdentifier: "https://clerk.example.com|user_456",
					email: "other@example.com",
					emailVerified: true,
				},
			}) as never,
			{ sessionId: "cs_signed_in_wrong" },
		);

		expect(result).toEqual({
			kind: "wrong_account",
			sessionId: "cs_signed_in_wrong",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: "other@example.com",
		});
	});

	it("claims the latest pending checkout for the verified viewer email", async () => {
		const runQuery = vi.fn().mockResolvedValue({
			stripeCheckoutSessionId: "cs_email_pending_123",
		});
		const runMutation = vi.fn().mockResolvedValue({
			claim: "claimed",
			grantResult: {
				granted: "inserted",
			},
		});
		const { claimLatestPendingCheckoutForViewer } =
			await import("@/convex/checkoutClaimsActions");

		const result = await claimLatestPendingCheckoutForViewer._handler(
			createActionCtx({ runMutation, runQuery }) as never,
		);

		expect(result).toEqual({
			kind: "validated",
			sessionId: "cs_email_pending_123",
			claimResult: {
				claim: "claimed",
				grantResult: {
					granted: "inserted",
				},
			},
		});
		expect(runQuery).toHaveBeenCalledWith(expect.anything(), {
			checkoutEmailNormalized: "buyer@example.com",
		});
		expect(runMutation).toHaveBeenCalledWith(expect.anything(), {
			stripeCheckoutSessionId: "cs_email_pending_123",
		});
	});

	it("returns recovery details when the latest pending checkout is already claimed elsewhere", async () => {
		const runQuery = vi.fn().mockResolvedValue({
			stripeCheckoutSessionId: "cs_email_pending_wrong",
			checkoutEmail: "buyer@example.com",
		});
		const runMutation = vi.fn().mockResolvedValue({
			claim: "claimed_by_other_user",
		});
		const { claimLatestPendingCheckoutForViewer } =
			await import("@/convex/checkoutClaimsActions");

		const result = await claimLatestPendingCheckoutForViewer._handler(
			createActionCtx({ runMutation, runQuery }) as never,
		);

		expect(result).toEqual({
			kind: "wrong_account",
			sessionId: "cs_email_pending_wrong",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: "buyer@example.com",
		});
	});

	it("fulfills a paid guest checkout for an existing Clerk user by checkout email", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_guest_fulfill",
			metadata: {
				buyerStartingPoint: "existing_codebase",
				checkoutCtaId: "codebase_demo_existing",
				courseSlug: "ship-by-sunday",
				fulfillmentTrack: "existing_codebase_doctor",
			},
			client_reference_id: null,
			customer_details: {
				email: "Buyer@Example.com",
			},
			customer: "cus_123",
			payment_intent: "pi_123",
			payment_status: "paid",
		});
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => [
				{
					id: "user_existing",
					email_addresses: [{ email_address: "buyer@example.com" }],
				},
			],
		});
		vi.stubGlobal("fetch", fetchMock);
		const runMutation = vi
			.fn()
			.mockResolvedValueOnce({ saved: "inserted" })
			.mockResolvedValueOnce({
				repair: "repaired",
				grantResult: { granted: "inserted" },
			});
		const { fulfillCheckoutSessionByEmail } =
			await import("@/convex/checkoutClaimsActions");

		const result = await fulfillCheckoutSessionByEmail._handler(
			createActionCtx({ runMutation }) as never,
			{
				sessionId: "cs_guest_fulfill",
				stripeEventId: "evt_123",
				stripeEventType: "checkout.session.completed",
			},
		);

		expect(result).toEqual({
			kind: "fulfilled",
			sessionId: "cs_guest_fulfill",
			checkoutEmail: "Buyer@Example.com",
			clerkUserId: "user_existing",
			clerkUserStatus: "exists",
			grantResult: { granted: "inserted" },
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(runMutation).toHaveBeenNthCalledWith(
			1,
			expect.anything(),
			expect.objectContaining({
				stripeCheckoutSessionId: "cs_guest_fulfill",
				checkoutEmail: "Buyer@Example.com",
				stripeCustomerId: "cus_123",
				stripePaymentIntentId: "pi_123",
				fulfillmentTrack: "existing_codebase_doctor",
				stripeEventId: "evt_123",
				stripeEventType: "checkout.session.completed",
			}),
		);
		expect(runMutation).toHaveBeenNthCalledWith(2, expect.anything(), {
			stripeCheckoutSessionId: "cs_guest_fulfill",
			checkoutEmail: "Buyer@Example.com",
			clerkUserId: "user_existing",
		});
	});

	it("creates a Clerk user before fulfilling when the checkout email has no account", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_guest_create",
			metadata: {
				courseSlug: "ship-by-sunday",
			},
			customer_details: {
				email: "new@example.com",
			},
			payment_status: "paid",
		});
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => [],
			})
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => ({ id: "user_created" }),
			});
		vi.stubGlobal("fetch", fetchMock);
		const runMutation = vi
			.fn()
			.mockResolvedValueOnce({ saved: "inserted" })
			.mockResolvedValueOnce({
				repair: "repaired",
				grantResult: { granted: "inserted" },
			});
		const { fulfillCheckoutSessionByEmail } =
			await import("@/convex/checkoutClaimsActions");

		const result = await fulfillCheckoutSessionByEmail._handler(
			createActionCtx({ runMutation }) as never,
			{
				sessionId: "cs_guest_create",
				stripeEventId: "evt_create",
				stripeEventType: "checkout.session.completed",
			},
		);

		expect(result).toMatchObject({
			kind: "fulfilled",
			clerkUserId: "user_created",
			clerkUserStatus: "created",
		});
		expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
			email_address: ["new@example.com"],
			skip_password_requirement: true,
			private_metadata: {
				shipBySundayPaidCheckoutFulfillment: {
					checkoutEmail: "new@example.com",
					stripeCheckoutSessionId: "cs_guest_create",
				},
			},
		});
	});

	it("reuses the Clerk user when concurrent fulfillment creates it first", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_guest_create_race",
			metadata: {
				courseSlug: "ship-by-sunday",
			},
			customer_details: {
				email: "race@example.com",
			},
			payment_status: "paid",
		});
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => [],
			})
			.mockResolvedValueOnce({
				ok: false,
				status: 422,
				json: async () => ({
					errors: [{ message: "That email address is taken." }],
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => [
					{
						id: "user_created_elsewhere",
						email_addresses: [{ email_address: "race@example.com" }],
					},
				],
			});
		vi.stubGlobal("fetch", fetchMock);
		const runMutation = vi
			.fn()
			.mockResolvedValueOnce({ saved: "inserted" })
			.mockResolvedValueOnce({
				repair: "repaired",
				grantResult: { granted: "inserted" },
			});
		const { fulfillCheckoutSessionFromSuccessPage } =
			await import("@/convex/checkoutClaimsActions");

		const result = await fulfillCheckoutSessionFromSuccessPage._handler(
			createActionCtx({ runMutation }) as never,
			{
				fulfillmentToken: checkoutFulfillmentRetrySecret,
				sessionId: "cs_guest_create_race",
			},
		);

		expect(result).toEqual({
			kind: "fulfilled",
			sessionId: "cs_guest_create_race",
			checkoutEmail: "race@example.com",
			clerkUserId: "user_created_elsewhere",
			clerkUserStatus: "exists",
			grantResult: { granted: "inserted" },
		});
		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(runMutation).toHaveBeenNthCalledWith(2, expect.anything(), {
			stripeCheckoutSessionId: "cs_guest_create_race",
			checkoutEmail: "race@example.com",
			clerkUserId: "user_created_elsewhere",
		});
	});

	it("refuses success-page fulfillment with an invalid server token", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_guest_token",
			metadata: {
				courseSlug: "ship-by-sunday",
			},
			customer_details: {
				email: "buyer@example.com",
			},
			payment_status: "paid",
		});
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const runMutation = vi.fn();
		const { fulfillCheckoutSessionFromSuccessPage } =
			await import("@/convex/checkoutClaimsActions");

		const result = await fulfillCheckoutSessionFromSuccessPage._handler(
			createActionCtx({ runMutation }) as never,
			{
				fulfillmentToken: "wrong-token",
				sessionId: "cs_guest_token",
			},
		);

		expect(result).toEqual({
			kind: "invalid_session",
			sessionId: "cs_guest_token",
		});
		expect(retrieveSessionMock).not.toHaveBeenCalled();
		expect(fetchMock).not.toHaveBeenCalled();
		expect(runMutation).not.toHaveBeenCalled();
	});

	it("refuses success-page fulfillment when the checkout is missing course metadata", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_missing_course",
			metadata: {},
			customer_details: {
				email: "buyer@example.com",
			},
			payment_status: "paid",
		});
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const runMutation = vi.fn();
		const { fulfillCheckoutSessionFromSuccessPage } =
			await import("@/convex/checkoutClaimsActions");

		const result = await fulfillCheckoutSessionFromSuccessPage._handler(
			createActionCtx({ runMutation }) as never,
			{
				fulfillmentToken: checkoutFulfillmentRetrySecret,
				sessionId: "cs_missing_course",
			},
		);

		expect(result).toEqual({
			kind: "invalid_session",
			sessionId: "cs_missing_course",
		});
		expect(fetchMock).not.toHaveBeenCalled();
		expect(runMutation).not.toHaveBeenCalled();
	});

	it("refuses fulfillment when multiple Clerk users match the checkout email", async () => {
		retrieveSessionMock.mockResolvedValue({
			id: "cs_guest_conflict",
			metadata: {
				courseSlug: "ship-by-sunday",
			},
			customer_details: {
				email: "buyer@example.com",
			},
			payment_status: "paid",
		});
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => [
					{
						id: "user_1",
						email_addresses: [{ email_address: "buyer@example.com" }],
					},
					{
						id: "user_2",
						email_addresses: [{ email_address: "buyer@example.com" }],
					},
				],
			}),
		);
		const runMutation = vi.fn().mockResolvedValueOnce({ saved: "inserted" });
		const { fulfillCheckoutSessionByEmail } =
			await import("@/convex/checkoutClaimsActions");

		const result = await fulfillCheckoutSessionByEmail._handler(
			createActionCtx({ runMutation }) as never,
			{
				sessionId: "cs_guest_conflict",
				stripeEventId: "evt_conflict",
				stripeEventType: "checkout.session.completed",
			},
		);

		expect(result).toEqual({
			kind: "clerk_user_conflict",
			sessionId: "cs_guest_conflict",
			checkoutEmail: "buyer@example.com",
			matchingUserCount: 2,
		});
		expect(runMutation).toHaveBeenCalledTimes(1);
	});
});
