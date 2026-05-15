import Stripe from "stripe";

const authMock = vi.fn();
const currentUserMock = vi.fn();
const claimCheckoutSessionForViewerMock = vi.fn();
const fulfillCheckoutSessionFromSuccessPageMock = vi.fn();
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
		fulfillCheckoutSessionFromSuccessPage: (...args: unknown[]) =>
			fulfillCheckoutSessionFromSuccessPageMock(...args),
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
		fulfillCheckoutSessionFromSuccessPageMock.mockReset();
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

		await expect(getCheckoutSessionState("cs_test_missing")).resolves.toEqual({
			kind: "invalid_session",
			sessionId: "cs_test_missing",
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

		await expect(
			getCheckoutSessionState("cs_test_wrong_course"),
		).resolves.toEqual({
			kind: "invalid_session",
			sessionId: "cs_test_wrong_course",
		});
		expect(authMock).not.toHaveBeenCalled();
	});

	it("returns invalid_session when the checkout is missing course metadata", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					clerkUserId: "user_123",
				},
			}),
		);

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_test_missing_course_metadata"),
		).resolves.toEqual({
			kind: "invalid_session",
			sessionId: "cs_test_missing_course_metadata",
		});
		expect(authMock).not.toHaveBeenCalled();
	});

	it("returns sign_in_required when the checkout is valid but no user is signed in", async () => {
		retrieveSessionMock.mockResolvedValue(createCheckoutSession());
		authMock.mockResolvedValue({ userId: null });

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_test_signed_out"),
		).resolves.toEqual({
			kind: "sign_in_required",
			sessionId: "cs_test_signed_out",
			offerId: "starter",
			checkoutEmail: undefined,
		});
	});

	it("fulfills a valid signed-out guest checkout before requiring sign-in", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				client_reference_id: null,
			}),
		);
		authMock.mockResolvedValue({ userId: null });
		fulfillCheckoutSessionFromSuccessPageMock.mockResolvedValue({
			kind: "fulfilled",
			sessionId: "cs_test_guest_signed_out",
			clerkUserId: "user_buyer",
			checkoutEmail: "buyer@example.com",
			grantResult: { granted: "inserted" },
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_test_guest_signed_out"),
		).resolves.toEqual({
			kind: "sign_in_required",
			sessionId: "cs_test_guest_signed_out",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: undefined,
		});
		expect(fulfillCheckoutSessionFromSuccessPageMock).toHaveBeenCalledWith(
			"cs_test_guest_signed_out",
		);
	});

	it("uses normal sign-in for a signed-out guest checkout with an email", async () => {
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
		fulfillCheckoutSessionFromSuccessPageMock.mockResolvedValue({
			kind: "fulfilled",
			sessionId: "cs_test_guest_signed_out_email",
			clerkUserId: "user_buyer",
			checkoutEmail: "buyer@example.com",
			grantResult: { granted: "inserted" },
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_test_guest_signed_out_email"),
		).resolves.toEqual({
			kind: "sign_in_required",
			sessionId: "cs_test_guest_signed_out_email",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: undefined,
		});
		expect(fulfillCheckoutSessionFromSuccessPageMock).toHaveBeenCalledWith(
			"cs_test_guest_signed_out_email",
		);
	});

	it("returns validated when guest checkout fulfillment belongs to the signed-in viewer", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				client_reference_id: null,
			}),
		);
		authMock.mockResolvedValue({ userId: "user_123" });
		fulfillCheckoutSessionFromSuccessPageMock.mockResolvedValue({
			kind: "fulfilled",
			sessionId: "cs_test_guest_claimed",
			clerkUserId: "user_123",
			checkoutEmail: "buyer@example.com",
			grantResult: { granted: "inserted" },
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_test_guest_claimed"),
		).resolves.toEqual({
			kind: "validated",
			sessionId: "cs_test_guest_claimed",
			fulfillmentTrack: "unspecified",
		});
		expect(fulfillCheckoutSessionFromSuccessPageMock).toHaveBeenCalledWith(
			"cs_test_guest_claimed",
		);
		expect(claimCheckoutSessionForViewerMock).not.toHaveBeenCalled();
	});

	it("returns wrong_account when guest checkout fulfillment belongs to another user", async () => {
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
		fulfillCheckoutSessionFromSuccessPageMock.mockResolvedValue({
			kind: "fulfilled",
			sessionId: "cs_test_guest_wrong_account",
			clerkUserId: "user_123",
			checkoutEmail: "buyer@example.com",
			grantResult: { granted: "patched" },
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_test_guest_wrong_account"),
		).resolves.toEqual({
			kind: "wrong_account",
			sessionId: "cs_test_guest_wrong_account",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: "other@example.com",
		});
	});

	it("returns payment_pending when guest checkout fulfillment reports a pending payment", async () => {
		retrieveSessionMock.mockResolvedValue(
			createCheckoutSession({
				metadata: {
					courseSlug: "ship-by-sunday",
				},
				client_reference_id: null,
			}),
		);
		authMock.mockResolvedValue({ userId: "user_other" });
		fulfillCheckoutSessionFromSuccessPageMock.mockResolvedValue({
			kind: "payment_pending",
			sessionId: "cs_test_guest_pending",
			paymentStatus: "unpaid",
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_test_guest_pending"),
		).resolves.toEqual({
			kind: "payment_pending",
			sessionId: "cs_test_guest_pending",
			paymentStatus: "unpaid",
		});
	});

	it("returns fulfillment_failed when success-page fulfillment cannot create access", async () => {
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
		fulfillCheckoutSessionFromSuccessPageMock.mockResolvedValue({
			kind: "grant_failed",
			sessionId: "cs_test_guest_fulfillment_failed",
			checkoutEmail: "buyer@example.com",
			message: "Convex grant failed.",
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_test_guest_fulfillment_failed"),
		).resolves.toEqual({
			kind: "fulfillment_failed",
			sessionId: "cs_test_guest_fulfillment_failed",
			checkoutEmail: "buyer@example.com",
			message: "Convex grant failed.",
		});
	});

	it.each(["invalid_session", "missing_checkout_email"] as const)(
		"returns invalid_session when guest checkout fulfillment reports %s",
		async (fulfillmentKind) => {
			retrieveSessionMock.mockResolvedValue(
				createCheckoutSession({
					metadata: {
						courseSlug: "ship-by-sunday",
					},
					client_reference_id: null,
				}),
			);
			authMock.mockResolvedValue({ userId: "user_other" });
			fulfillCheckoutSessionFromSuccessPageMock.mockResolvedValue({
				kind: fulfillmentKind,
				sessionId: `cs_test_${fulfillmentKind}`,
			});

			const { getCheckoutSessionState } =
				await import("@/platform/billing/checkout/checkout-session");

			await expect(
				getCheckoutSessionState(`cs_test_${fulfillmentKind}`),
			).resolves.toEqual({
				kind: "invalid_session",
				sessionId: `cs_test_${fulfillmentKind}`,
			});
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

		await expect(
			getCheckoutSessionState("cs_test_wrong_account"),
		).resolves.toEqual({
			kind: "wrong_account",
			sessionId: "cs_test_wrong_account",
			offerId: "starter",
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

		await expect(getCheckoutSessionState("cs_test_pending")).resolves.toEqual({
			kind: "payment_pending",
			sessionId: "cs_test_pending",
			offerId: "starter",
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
				sessionId: `cs_test_${paymentStatus}`,
				claimResult: {
					granted: "patched",
				},
			});

			const { getCheckoutSessionState } =
				await import("@/platform/billing/checkout/checkout-session");

			await expect(
				getCheckoutSessionState(`cs_test_${paymentStatus}`),
			).resolves.toEqual({
				kind: "validated",
				sessionId: `cs_test_${paymentStatus}`,
				offerId: "starter",
				fulfillmentTrack: "generated_codebase",
			});
			expect(claimCheckoutSessionForViewerMock).toHaveBeenCalledWith(
				`cs_test_${paymentStatus}`,
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
			sessionId: "cs_test_existing_codebase",
			claimResult: {
				granted: "patched",
			},
		});

		const { getCheckoutSessionState } =
			await import("@/platform/billing/checkout/checkout-session");

		await expect(
			getCheckoutSessionState("cs_test_existing_codebase"),
		).resolves.toEqual({
			kind: "validated",
			sessionId: "cs_test_existing_codebase",
			offerId: "workers",
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

		await expect(
			getCheckoutSessionState("cs_test_claim_wrong"),
		).resolves.toEqual({
			kind: "wrong_account",
			sessionId: "cs_test_claim_wrong",
			offerId: "starter",
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

		await expect(
			getCheckoutSessionState("cs_test_claim_sign_in"),
		).resolves.toEqual({
			kind: "sign_in_required",
			sessionId: "cs_test_claim_sign_in",
			offerId: "starter",
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
				getCheckoutSessionState(`cs_test_claim_${claimKind}`),
			).resolves.toEqual({
				kind: "invalid_session",
				sessionId: `cs_test_claim_${claimKind}`,
			});
		},
	);
});
