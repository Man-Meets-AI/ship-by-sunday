import Stripe from "stripe";

const authMock = vi.fn();
const claimCheckoutSessionForViewerMock = vi.fn();
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

vi.mock("@/features/checkout/server/checkout-session-recovery", async () => {
	const actual = await vi.importActual<
		typeof import("@/features/checkout/server/checkout-session-recovery")
	>("@/features/checkout/server/checkout-session-recovery");

	return {
		...actual,
		claimCheckoutSessionForViewer: (...args: unknown[]) =>
			claimCheckoutSessionForViewerMock(...args),
	};
});

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
		claimCheckoutSessionForViewerMock.mockReset();
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

	it("treats a valid guest checkout as sign_in_required instead of invalid_session", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				client_reference_id: null,
			}),
		);
		authMock.mockResolvedValue({ userId: null });

		const { getCheckoutSessionState } =
			await import("@/features/checkout/server/checkout-session");

		await expect(
			getCheckoutSessionState("cs_guest_signed_out"),
		).resolves.toEqual({
			kind: "sign_in_required",
			sessionId: "cs_guest_signed_out",
		});
	});

	it("returns validated when the guest checkout claim succeeds for the signed-in viewer", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				client_reference_id: null,
			}),
		);
		authMock.mockResolvedValue({ userId: "user_123" });
		claimCheckoutSessionForViewerMock.mockResolvedValue({
			kind: "validated",
			sessionId: "cs_guest_claimed",
			claimResult: {
				claim: "claimed",
				grantResult: {
					granted: "inserted",
				},
			},
		});

		const { getCheckoutSessionState } =
			await import("@/features/checkout/server/checkout-session");

		await expect(getCheckoutSessionState("cs_guest_claimed")).resolves.toEqual({
			kind: "validated",
			sessionId: "cs_guest_claimed",
		});
	});

	it("returns wrong_account when the guest checkout claim refuses the signed-in viewer", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				client_reference_id: null,
			}),
		);
		authMock.mockResolvedValue({ userId: "user_other" });
		claimCheckoutSessionForViewerMock.mockResolvedValue({
			kind: "wrong_account",
			sessionId: "cs_guest_wrong_account",
		});

		const { getCheckoutSessionState } =
			await import("@/features/checkout/server/checkout-session");

		await expect(
			getCheckoutSessionState("cs_guest_wrong_account"),
		).resolves.toEqual({
			kind: "wrong_account",
			sessionId: "cs_guest_wrong_account",
		});
	});

	it("returns payment_pending when the guest checkout claim reports a pending payment", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				client_reference_id: null,
			}),
		);
		authMock.mockResolvedValue({ userId: "user_other" });
		claimCheckoutSessionForViewerMock.mockResolvedValue({
			kind: "payment_pending",
			sessionId: "cs_guest_pending",
			paymentStatus: "unpaid",
		});

		const { getCheckoutSessionState } =
			await import("@/features/checkout/server/checkout-session");

		await expect(getCheckoutSessionState("cs_guest_pending")).resolves.toEqual({
			kind: "payment_pending",
			sessionId: "cs_guest_pending",
			paymentStatus: "unpaid",
		});
	});

	it("returns sign_in_required when the guest checkout claim says another sign-in is needed", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				client_reference_id: null,
			}),
		);
		authMock.mockResolvedValue({ userId: "user_other" });
		claimCheckoutSessionForViewerMock.mockResolvedValue({
			kind: "sign_in_required",
			sessionId: "cs_guest_reauth",
		});

		const { getCheckoutSessionState } =
			await import("@/features/checkout/server/checkout-session");

		await expect(getCheckoutSessionState("cs_guest_reauth")).resolves.toEqual({
			kind: "sign_in_required",
			sessionId: "cs_guest_reauth",
		});
	});

	it.each(["invalid_session", "missing_checkout_email"] as const)(
		"returns invalid_session when the guest checkout claim reports %s",
		async (claimKind) => {
			retrieveSessionMock.mockResolvedValue(
				createCheckoutSession({
					metadata: {
						courseSlug: "ship-by-sunday",
					},
					client_reference_id: null,
				}),
			);
			authMock.mockResolvedValue({ userId: "user_other" });
			claimCheckoutSessionForViewerMock.mockResolvedValue({
				kind: claimKind,
				sessionId: `cs_${claimKind}`,
			});

			const { getCheckoutSessionState } =
				await import("@/features/checkout/server/checkout-session");

			await expect(getCheckoutSessionState(`cs_${claimKind}`)).resolves.toEqual(
				{
					kind: "invalid_session",
					sessionId: `cs_${claimKind}`,
				},
			);
		},
	);

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
		"claims access and returns validated when Stripe reports %s",
		async (paymentStatus) => {
			retrieveSessionMock.mockResolvedValue(
				createCheckoutSession({
					payment_status: paymentStatus,
				}),
			);
			authMock.mockResolvedValue({ userId: "user_123" });
			claimCheckoutSessionForViewerMock.mockResolvedValue({
				kind: "validated",
				sessionId: `cs_${paymentStatus}`,
				claimResult: {
					granted: "patched",
				},
			});

			const { getCheckoutSessionState } =
				await import("@/features/checkout/server/checkout-session");

			await expect(
				getCheckoutSessionState(`cs_${paymentStatus}`),
			).resolves.toEqual({
				kind: "validated",
				sessionId: `cs_${paymentStatus}`,
			});
			expect(claimCheckoutSessionForViewerMock).toHaveBeenCalledWith(
				`cs_${paymentStatus}`,
			);
		},
	);
});
