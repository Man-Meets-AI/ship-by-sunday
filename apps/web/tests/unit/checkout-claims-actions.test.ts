import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const retrieveSessionMock = vi.fn();
const stripeConstructorArgs: Array<Array<unknown>> = [];

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
		email: "buyer@example.com",
		emailVerified: true,
	},
	runMutation = vi.fn(),
}: {
	identity?: Record<string, unknown> | null;
	runMutation?: ReturnType<typeof vi.fn>;
} = {}) {
	return {
		auth: {
			getUserIdentity: vi.fn().mockResolvedValue(identity),
		},
		runMutation,
	};
}

describe("convex/checkoutClaimsActions", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			STRIPE_SECRET_KEY: "sk_test_123",
		};
		retrieveSessionMock.mockReset();
		stripeConstructorArgs.length = 0;
		vi.resetModules();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
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
				clerkUserId: "user_123",
				courseSlug: "ship-by-sunday",
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
				stripeCheckoutSessionId: "cs_test_123",
				stripeCustomerId: "cus_123",
				stripePaymentIntentId: "pi_123",
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
		expect(runMutation).toHaveBeenNthCalledWith(
			1,
			expect.anything(),
			expect.objectContaining({
				stripeCheckoutSessionId: "cs_guest_123",
				checkoutEmail: "buyer@example.com",
			}),
		);
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
		});
	});
});
