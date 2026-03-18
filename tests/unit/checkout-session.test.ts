import Stripe from "stripe";

const authMock = vi.fn();
const retrieveSessionMock = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
}));

vi.mock("@/platform/billing/stripe", () => ({
	getStripe: () => ({
		checkout: {
			sessions: {
				retrieve: retrieveSessionMock,
			},
		},
	}),
}));

function createCheckoutSession(
	overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session {
	return {
		id: "cs_test_123",
		object: "checkout.session",
		payment_status: "paid",
		metadata: {
			clerkUserId: "user_123",
			courseSlug: "ship-by-sunday",
		},
		client_reference_id: null,
		...overrides,
	} as Stripe.Checkout.Session;
}

function createStripeInvalidRequestError() {
	const error = Object.create(
		Stripe.errors.StripeError.prototype,
	) as Stripe.errors.StripeError & {
		type: string;
	};

	error.type = "StripeInvalidRequestError";
	return error;
}

describe("getCheckoutSessionState", () => {
	beforeEach(() => {
		authMock.mockReset();
		retrieveSessionMock.mockReset();
		vi.resetModules();
	});

	it("returns missing_session_id when the success URL has no session id", async () => {
		const { getCheckoutSessionState } =
			await import("@/features/checkout/server/checkout-session");

		await expect(getCheckoutSessionState(undefined)).resolves.toEqual({
			kind: "missing_session_id",
		});
		expect(retrieveSessionMock).not.toHaveBeenCalled();
		expect(authMock).not.toHaveBeenCalled();
	});

	it("returns invalid_session when Stripe cannot find the checkout session", async () => {
		retrieveSessionMock.mockRejectedValue(createStripeInvalidRequestError());

		const { getCheckoutSessionState } =
			await import("@/features/checkout/server/checkout-session");

		await expect(getCheckoutSessionState("cs_missing")).resolves.toEqual({
			kind: "invalid_session",
			sessionId: "cs_missing",
		});
		expect(authMock).not.toHaveBeenCalled();
	});

	it("returns invalid_session when the checkout metadata does not match the course handoff", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					clerkUserId: "user_123",
					courseSlug: "other-course",
				},
			}),
		);

		const { getCheckoutSessionState } =
			await import("@/features/checkout/server/checkout-session");

		await expect(getCheckoutSessionState("cs_wrong_course")).resolves.toEqual({
			kind: "invalid_session",
			sessionId: "cs_wrong_course",
		});
		expect(authMock).not.toHaveBeenCalled();
	});

	it("returns sign_in_required when the checkout is valid but no user is signed in", async () => {
		retrieveSessionMock.mockResolvedValue(createCheckoutSession());
		authMock.mockResolvedValue({ userId: null });

		const { getCheckoutSessionState } =
			await import("@/features/checkout/server/checkout-session");

		await expect(getCheckoutSessionState("cs_signed_out")).resolves.toEqual({
			kind: "sign_in_required",
			sessionId: "cs_signed_out",
		});
	});

	it("returns wrong_account when the signed-in user does not own the checkout", async () => {
		retrieveSessionMock.mockResolvedValue(createCheckoutSession());
		authMock.mockResolvedValue({ userId: "user_other" });

		const { getCheckoutSessionState } =
			await import("@/features/checkout/server/checkout-session");

		await expect(getCheckoutSessionState("cs_wrong_account")).resolves.toEqual({
			kind: "wrong_account",
			sessionId: "cs_wrong_account",
		});
	});

	it("returns payment_pending when Stripe has not finalized payment yet", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				payment_status: "unpaid",
			}),
		);
		authMock.mockResolvedValue({ userId: "user_123" });

		const { getCheckoutSessionState } =
			await import("@/features/checkout/server/checkout-session");

		await expect(getCheckoutSessionState("cs_pending")).resolves.toEqual({
			kind: "payment_pending",
			sessionId: "cs_pending",
			paymentStatus: "unpaid",
		});
	});

	it.each(["paid", "no_payment_required"] as const)(
		"returns validated when Stripe reports %s",
		async (paymentStatus) => {
			retrieveSessionMock.mockResolvedValue(
				createCheckoutSession({
					payment_status: paymentStatus,
				}),
			);
			authMock.mockResolvedValue({ userId: "user_123" });

			const { getCheckoutSessionState } =
				await import("@/features/checkout/server/checkout-session");

			await expect(
				getCheckoutSessionState(`cs_${paymentStatus}`),
			).resolves.toEqual({
				kind: "validated",
				sessionId: `cs_${paymentStatus}`,
			});
		},
	);
});
