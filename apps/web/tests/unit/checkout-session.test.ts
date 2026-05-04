import Stripe from "stripe";

const authMock = vi.fn();
const currentUserMock = vi.fn();
const claimCheckoutSessionForViewerMock = vi.fn();
const retrieveSessionMock = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
	currentUser: currentUserMock,
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

vi.mock("@/platform/billing/checkout/checkout-session-recovery", async () => {
	const actual = await vi.importActual<
		typeof import("@/platform/billing/checkout/checkout-session-recovery")
	>("@/platform/billing/checkout/checkout-session-recovery");

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
			buyerStartingPoint: "no_codebase",
			checkoutCtaId: "hero_primary",
			clerkUserId: "user_123",
			courseSlug: "ship-by-sunday",
			fulfillmentTrack: "generated_codebase",
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
		currentUserMock.mockReset();
		currentUserMock.mockResolvedValue(null);
		claimCheckoutSessionForViewerMock.mockReset();
		retrieveSessionMock.mockReset();
		vi.resetModules();
	});

	it("returns missing_session_id when the success URL has no session id", async () => {
		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(getCheckoutSessionState(undefined)).resolves.toEqual({
			kind: "missing_session_id",
		});
		expect(retrieveSessionMock).not.toHaveBeenCalled();
		expect(authMock).not.toHaveBeenCalled();
	});

	it("returns invalid_session when Stripe cannot find the checkout session", async () => {
		retrieveSessionMock.mockRejectedValue(createStripeInvalidRequestError());

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

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
			await import("@/platform/billing/checkout/checkout-session");

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
			await import("@/platform/billing/checkout/checkout-session");

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
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_guest_signed_out"),
		).resolves.toEqual({
			kind: "sign_in_required",
			sessionId: "cs_guest_signed_out",
		});
	});

	it("requires checkout email proof for a signed-out guest checkout with an email", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				client_reference_id: null,
				customer_details: {
					email: "buyer@example.com",
				} as Stripe.Checkout.Session.CustomerDetails,
			}),
		);
		authMock.mockResolvedValue({ userId: null });

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_guest_signed_out_email"),
		).resolves.toEqual({
			kind: "checkout_email_handoff_required",
			sessionId: "cs_guest_signed_out_email",
			checkoutEmail: "buyer@example.com",
		});
	});

	it("claims and returns validated when guest checkout access belongs to the signed-in viewer", async () => {
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
			claimResult: { granted: "inserted" },
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(getCheckoutSessionState("cs_guest_claimed")).resolves.toEqual({
			kind: "validated",
			sessionId: "cs_guest_claimed",
			fulfillmentTrack: "unspecified",
		});
		expect(claimCheckoutSessionForViewerMock).toHaveBeenCalledWith(
			"cs_guest_claimed",
		);
	});

	it("returns wrong_account when guest checkout access belongs to another user", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				client_reference_id: null,
				customer_details: {
					email: "buyer@example.com",
				} as Stripe.Checkout.Session.CustomerDetails,
			}),
		);
		authMock.mockResolvedValue({ userId: "user_other" });
		currentUserMock.mockResolvedValue({
			primaryEmailAddress: {
				emailAddress: "other@example.com",
			},
		});
		claimCheckoutSessionForViewerMock.mockResolvedValue({
			kind: "wrong_account",
			sessionId: "cs_guest_wrong_account",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: "other@example.com",
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_guest_wrong_account"),
		).resolves.toEqual({
			kind: "wrong_account",
			sessionId: "cs_guest_wrong_account",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: "other@example.com",
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
			await import("@/platform/billing/checkout/checkout-session");

		await expect(getCheckoutSessionState("cs_guest_pending")).resolves.toEqual({
			kind: "payment_pending",
			sessionId: "cs_guest_pending",
			paymentStatus: "unpaid",
		});
	});

	it("returns sign_in_required when guest checkout claim needs the checkout email account", async () => {
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
			checkoutEmail: "buyer@example.com",
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(getCheckoutSessionState("cs_guest_reauth")).resolves.toEqual({
			kind: "sign_in_required",
			sessionId: "cs_guest_reauth",
			checkoutEmail: "buyer@example.com",
		});
	});

	it("adds the Stripe checkout email when a guest checkout claim requires sign-in without an email", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				client_reference_id: null,
				customer_details: {
					email: "buyer@example.com",
				} as Stripe.Checkout.Session.CustomerDetails,
			}),
		);
		authMock.mockResolvedValue({ userId: "user_other" });
		currentUserMock.mockResolvedValue({
			primaryEmailAddress: {
				emailAddress: "other@example.com",
			},
		});
		claimCheckoutSessionForViewerMock.mockResolvedValue({
			kind: "sign_in_required",
			sessionId: "cs_guest_sign_in_without_email",
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_guest_sign_in_without_email"),
		).resolves.toEqual({
			kind: "sign_in_required",
			sessionId: "cs_guest_sign_in_without_email",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: "other@example.com",
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
				await import("@/platform/billing/checkout/checkout-session");

			await expect(getCheckoutSessionState(`cs_${claimKind}`)).resolves.toEqual(
				{
					kind: "invalid_session",
					sessionId: `cs_${claimKind}`,
				},
			);
		},
	);

	it("returns wrong_account when the signed-in user does not own the checkout", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				customer_details: {
					email: "buyer@example.com",
				} as Stripe.Checkout.Session.CustomerDetails,
			}),
		);
		authMock.mockResolvedValue({ userId: "user_other" });
		currentUserMock.mockResolvedValue({
			primaryEmailAddress: {
				emailAddress: "other@example.com",
			},
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(getCheckoutSessionState("cs_wrong_account")).resolves.toEqual({
			kind: "wrong_account",
			sessionId: "cs_wrong_account",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: "other@example.com",
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
			await import("@/platform/billing/checkout/checkout-session");

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
				await import("@/platform/billing/checkout/checkout-session");

			await expect(
				getCheckoutSessionState(`cs_${paymentStatus}`),
			).resolves.toEqual({
				kind: "validated",
				sessionId: `cs_${paymentStatus}`,
				fulfillmentTrack: "generated_codebase",
			});
			expect(claimCheckoutSessionForViewerMock).toHaveBeenCalledWith(
				`cs_${paymentStatus}`,
			);
		},
	);

	it("returns existing-codebase fulfillment for a paid checkout with existing-codebase metadata", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					buyerStartingPoint: "existing_codebase",
					checkoutCtaId: "codebase_demo_existing",
					clerkUserId: "user_123",
					courseSlug: "ship-by-sunday",
					fulfillmentTrack: "existing_codebase_doctor",
				},
			}),
		);
		authMock.mockResolvedValue({ userId: "user_123" });
		claimCheckoutSessionForViewerMock.mockResolvedValue({
			kind: "validated",
			sessionId: "cs_existing_codebase",
			claimResult: {
				granted: "patched",
			},
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_existing_codebase"),
		).resolves.toEqual({
			kind: "validated",
			sessionId: "cs_existing_codebase",
			fulfillmentTrack: "existing_codebase_doctor",
		});
	});

	it("maps a paid signed-in checkout claim wrong_account result", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				customer_details: {
					email: "buyer@example.com",
				} as Stripe.Checkout.Session.CustomerDetails,
			}),
		);
		authMock.mockResolvedValue({ userId: "user_123" });
		currentUserMock.mockResolvedValue({
			primaryEmailAddress: {
				emailAddress: "current@example.com",
			},
		});
		claimCheckoutSessionForViewerMock.mockResolvedValue({
			kind: "wrong_account",
			checkoutEmail: "claim@example.com",
			currentAccountEmail: "claim-current@example.com",
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(getCheckoutSessionState("cs_claim_wrong")).resolves.toEqual({
			kind: "wrong_account",
			sessionId: "cs_claim_wrong",
			checkoutEmail: "claim@example.com",
			currentAccountEmail: "claim-current@example.com",
		});
	});

	it("maps a paid signed-in checkout claim sign_in_required result", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				customer_details: {
					email: "buyer@example.com",
				} as Stripe.Checkout.Session.CustomerDetails,
			}),
		);
		authMock.mockResolvedValue({ userId: "user_123" });
		currentUserMock.mockResolvedValue({
			primaryEmailAddress: {
				emailAddress: "current@example.com",
			},
		});
		claimCheckoutSessionForViewerMock.mockResolvedValue({
			kind: "sign_in_required",
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(getCheckoutSessionState("cs_claim_sign_in")).resolves.toEqual({
			kind: "sign_in_required",
			sessionId: "cs_claim_sign_in",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: "current@example.com",
		});
	});

	it.each(["invalid_session", "missing_checkout_email"] as const)(
		"maps a paid signed-in checkout claim %s result",
		async (claimKind) => {
			retrieveSessionMock.mockResolvedValue(createCheckoutSession());
			authMock.mockResolvedValue({ userId: "user_123" });
			claimCheckoutSessionForViewerMock.mockResolvedValue({
				kind: claimKind,
			});

			const { getCheckoutSessionState } =
				await import("@/platform/billing/checkout/checkout-session");

			await expect(
				getCheckoutSessionState(`cs_claim_${claimKind}`),
			).resolves.toEqual({
				kind: "invalid_session",
				sessionId: `cs_claim_${claimKind}`,
			});
		},
	);
});
