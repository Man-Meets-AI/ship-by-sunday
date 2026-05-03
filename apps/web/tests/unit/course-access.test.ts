import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();
const claimCheckoutSessionForViewerMock = vi.fn();
const claimLatestPendingCheckoutForViewerMock = vi.fn();
const clearPendingCheckoutSessionCookieMock = vi.fn();
const fetchQueryMock = vi.fn();
const getConvexServerSessionMock = vi.fn();
const getCheckoutSessionForRecoveryMock = vi.fn();
const getPendingCheckoutSessionIdFromCookieMock = vi.fn();
const getStripeCheckoutSessionEmailMock = vi.fn();
const isStripeCheckoutSessionForCourseMock = vi.fn();
const isStripeCheckoutSessionPaidMock = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("next/navigation", () => ({
	redirect: redirectMock,
}));

vi.mock("convex/nextjs", () => ({
	fetchQuery: fetchQueryMock,
}));

vi.mock("@/platform/auth/convex-auth", () => ({
	getConvexServerSession: getConvexServerSessionMock,
}));

vi.mock("@/platform/billing/checkout/checkout-session-recovery", () => ({
	claimCheckoutSessionForViewer: (...args: unknown[]) =>
		claimCheckoutSessionForViewerMock(...args),
	claimLatestPendingCheckoutForViewer: (...args: unknown[]) =>
		claimLatestPendingCheckoutForViewerMock(...args),
	clearPendingCheckoutSessionCookie: (...args: unknown[]) =>
		clearPendingCheckoutSessionCookieMock(...args),
	getCheckoutSessionForRecovery: (...args: unknown[]) =>
		getCheckoutSessionForRecoveryMock(...args),
	getPendingCheckoutSessionIdFromCookie: (...args: unknown[]) =>
		getPendingCheckoutSessionIdFromCookieMock(...args),
	getStripeCheckoutSessionEmail: (...args: unknown[]) =>
		getStripeCheckoutSessionEmailMock(...args),
	isStripeCheckoutSessionForCourse: (...args: unknown[]) =>
		isStripeCheckoutSessionForCourseMock(...args),
	isStripeCheckoutSessionPaid: (...args: unknown[]) =>
		isStripeCheckoutSessionPaidMock(...args),
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		access: {
			viewerProductAccess: "viewerProductAccess",
		},
		blueprint: {
			getBlueprintResumeDestination: "getBlueprintResumeDestination",
		},
	},
}));

describe("product access server helpers", () => {
	beforeEach(() => {
		redirectMock.mockReset();
		claimCheckoutSessionForViewerMock.mockReset();
		claimLatestPendingCheckoutForViewerMock.mockReset();
		clearPendingCheckoutSessionCookieMock.mockReset();
		fetchQueryMock.mockReset();
		getConvexServerSessionMock.mockReset();
		getCheckoutSessionForRecoveryMock.mockReset();
		getPendingCheckoutSessionIdFromCookieMock.mockReset();
		getStripeCheckoutSessionEmailMock.mockReset();
		isStripeCheckoutSessionForCourseMock.mockReset();
		isStripeCheckoutSessionPaidMock.mockReset();
		getPendingCheckoutSessionIdFromCookieMock.mockResolvedValue(null);
		getCheckoutSessionForRecoveryMock.mockResolvedValue({
			payment_status: "paid",
		});
		getStripeCheckoutSessionEmailMock.mockReturnValue("buyer@example.com");
		isStripeCheckoutSessionForCourseMock.mockReturnValue(true);
		isStripeCheckoutSessionPaidMock.mockReturnValue(true);
		claimLatestPendingCheckoutForViewerMock.mockResolvedValue({
			kind: "no_pending_claim",
		});
		vi.resetModules();
	});

	it("returns signed_out when no Clerk session is present", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: null,
			token: null,
		});

		const { getServerProductAccess } =
			await import("@/platform/access/product-access");

		const access = await getServerProductAccess();

		expect(access).toMatchObject({
			hasAccess: false,
			status: "signed_out",
		});
		expect(fetchQueryMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
	});

	it("keeps a signed-out pending paid checkout on the email handoff recovery path", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: null,
			token: null,
		});
		getPendingCheckoutSessionIdFromCookieMock.mockResolvedValue(
			"cs_pending_signed_out",
		);

		const { getServerProductAccess } =
			await import("@/platform/access/product-access");

		await expect(getServerProductAccess()).resolves.toEqual({
			clerkUserId: null,
			hasAccess: false,
			status: "signed_out",
			pendingCheckoutRecovery: {
				kind: "checkout_email_handoff_required",
				sessionId: "cs_pending_signed_out",
				checkoutEmail: "buyer@example.com",
			},
		});
		expect(fetchQueryMock).not.toHaveBeenCalled();
		expect(claimCheckoutSessionForViewerMock).not.toHaveBeenCalled();
		expect(claimLatestPendingCheckoutForViewerMock).not.toHaveBeenCalled();
	});

	it("keeps signed-in users with a missing Convex token on the recovery surface", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: null,
		});

		const { getServerProductAccess } =
			await import("@/platform/access/product-access");

		await expect(getServerProductAccess()).resolves.toEqual({
			clerkUserId: "user_123",
			hasAccess: false,
			status: "token_missing",
		});
	});

	it("returns granted access when Convex confirms the purchase", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		fetchQueryMock.mockResolvedValue({
			hasAccess: true,
			clerkUserId: "user_123",
			status: "granted",
		});

		const { getServerProductAccess } =
			await import("@/platform/access/product-access");

		await expect(getServerProductAccess()).resolves.toEqual({
			hasAccess: true,
			clerkUserId: "user_123",
			status: "granted",
		});

		expect(fetchQueryMock).toHaveBeenCalledTimes(1);
	});

	it("claims a pending checkout from the fallback cookie before rendering the no-access shell", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		getPendingCheckoutSessionIdFromCookieMock.mockResolvedValue(
			"cs_pending_123",
		);
		fetchQueryMock
			.mockResolvedValueOnce({
				hasAccess: false,
				clerkUserId: "user_123",
				status: "no_access",
			})
			.mockResolvedValueOnce({
				hasAccess: true,
				clerkUserId: "user_123",
				status: "granted",
			});
		claimCheckoutSessionForViewerMock.mockResolvedValue({
			kind: "validated",
			sessionId: "cs_pending_123",
			claimResult: {
				claim: "claimed",
				grantResult: { granted: "inserted" },
			},
		});

		const { getServerProductAccess } =
			await import("@/platform/access/product-access");

		await expect(getServerProductAccess()).resolves.toEqual({
			hasAccess: true,
			clerkUserId: "user_123",
			status: "granted",
		});
		expect(claimCheckoutSessionForViewerMock).toHaveBeenCalledWith(
			"cs_pending_123",
		);
		expect(fetchQueryMock).toHaveBeenCalledTimes(2);
	});

	it("keeps the original no-access response when there is no pending checkout cookie", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		fetchQueryMock.mockResolvedValue({
			hasAccess: false,
			clerkUserId: "user_123",
			status: "no_access",
		});
		getPendingCheckoutSessionIdFromCookieMock.mockResolvedValue(null);

		const { getServerProductAccess } =
			await import("@/platform/access/product-access");

		await expect(getServerProductAccess()).resolves.toEqual({
			hasAccess: false,
			clerkUserId: "user_123",
			status: "no_access",
		});
		expect(claimCheckoutSessionForViewerMock).not.toHaveBeenCalled();
		expect(claimLatestPendingCheckoutForViewerMock).toHaveBeenCalledTimes(1);
		expect(fetchQueryMock).toHaveBeenCalledTimes(1);
	});

	it("claims a matching pending checkout by verified email when the cookie is gone", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		fetchQueryMock
			.mockResolvedValueOnce({
				hasAccess: false,
				clerkUserId: "user_123",
				status: "no_access",
			})
			.mockResolvedValueOnce({
				hasAccess: true,
				clerkUserId: "user_123",
				status: "granted",
			});
		claimLatestPendingCheckoutForViewerMock.mockResolvedValue({
			kind: "validated",
			sessionId: "cs_email_pending_123",
			claimResult: {
				claim: "claimed",
				grantResult: { granted: "inserted" },
			},
		});

		const { getServerProductAccess } =
			await import("@/platform/access/product-access");

		await expect(getServerProductAccess()).resolves.toEqual({
			hasAccess: true,
			clerkUserId: "user_123",
			status: "granted",
		});
		expect(claimCheckoutSessionForViewerMock).not.toHaveBeenCalled();
		expect(claimLatestPendingCheckoutForViewerMock).toHaveBeenCalledTimes(1);
		expect(fetchQueryMock).toHaveBeenCalledTimes(2);
	});

	it("keeps paid checkout recovery details when the fallback checkout claim finds the wrong account", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		fetchQueryMock.mockResolvedValue({
			hasAccess: false,
			clerkUserId: "user_123",
			status: "no_access",
		});
		getPendingCheckoutSessionIdFromCookieMock.mockResolvedValue(
			"cs_pending_123",
		);
		claimCheckoutSessionForViewerMock.mockResolvedValue({
			kind: "wrong_account",
			sessionId: "cs_pending_123",
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: "other@example.com",
		});

		const { getServerProductAccess } =
			await import("@/platform/access/product-access");

		await expect(getServerProductAccess()).resolves.toEqual({
			hasAccess: false,
			clerkUserId: "user_123",
			status: "no_access",
			pendingCheckoutRecovery: {
				kind: "wrong_account",
				sessionId: "cs_pending_123",
				checkoutEmail: "buyer@example.com",
				currentAccountEmail: "other@example.com",
			},
		});
		expect(claimLatestPendingCheckoutForViewerMock).not.toHaveBeenCalled();
		expect(fetchQueryMock).toHaveBeenCalledTimes(1);
	});

	it("redirects home visitors to their saved resume destination when allowed", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		fetchQueryMock
			.mockResolvedValueOnce({
				hasAccess: true,
				clerkUserId: "user_123",
				status: "granted",
			})
			.mockResolvedValueOnce({
				destination: "/design",
				kind: "blueprint_stage",
				blueprintStageId: "design",
				postReviewTargets: null,
			});

		const { redirectGrantedHomeVisitor } =
			await import("@/platform/access/product-access");

		await redirectGrantedHomeVisitor({ allowMarketing: false });

		expect(redirectMock).toHaveBeenCalledWith("/design");
	});

	it("does nothing when the home page explicitly allows marketing mode", async () => {
		const { redirectGrantedHomeVisitor } =
			await import("@/platform/access/product-access");

		await redirectGrantedHomeVisitor({ allowMarketing: true });

		expect(fetchQueryMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
	});

	it("returns null when a granted viewer cannot mint a Convex token for resume data", async () => {
		getConvexServerSessionMock
			.mockResolvedValueOnce({
				userId: "user_123",
				token: "token_123",
			})
			.mockResolvedValueOnce({
				userId: "user_123",
				token: null,
			});
		fetchQueryMock.mockResolvedValue({
			hasAccess: true,
			clerkUserId: "user_123",
			status: "granted",
		});

		const { getServerResumeDestination } =
			await import("@/platform/access/product-access");

		await expect(getServerResumeDestination()).resolves.toBeNull();
	});

	it("returns null when the viewer still does not have access", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		fetchQueryMock.mockResolvedValue({
			hasAccess: false,
			clerkUserId: "user_123",
			status: "no_access",
		});

		const { getServerResumeDestination } =
			await import("@/platform/access/product-access");

		await expect(getServerResumeDestination()).resolves.toBeNull();
		expect(fetchQueryMock).toHaveBeenCalledTimes(1);
	});

	it("relays the centralized post-review resume destination for granted viewers", async () => {
		getConvexServerSessionMock
			.mockResolvedValueOnce({
				userId: "user_123",
				token: "token_123",
			})
			.mockResolvedValueOnce({
				userId: "user_123",
				token: "token_123",
			});
		fetchQueryMock
			.mockResolvedValueOnce({
				hasAccess: true,
				clerkUserId: "user_123",
				status: "granted",
			})
			.mockResolvedValueOnce({
				destination: "/lesson/product-review",
				kind: "post_review",
				blueprintStageId: null,
				postReviewTargets: {
					reviewDestination: "/review",
					buildLessonsDestination: "/lesson/iterate-the-product-with-ai",
					launchLessonsDestination: "/lesson/product-review",
					lessonMapDestination: "/review?showLessonMap=1",
					latestLessonDestination: "/lesson/product-review",
				},
			});

		const { getServerResumeDestination } =
			await import("@/platform/access/product-access");

		await expect(getServerResumeDestination()).resolves.toEqual({
			destination: "/lesson/product-review",
			kind: "post_review",
			blueprintStageId: null,
			postReviewTargets: {
				reviewDestination: "/review",
				buildLessonsDestination: "/lesson/iterate-the-product-with-ai",
				launchLessonsDestination: "/lesson/product-review",
				lessonMapDestination: "/review?showLessonMap=1",
				latestLessonDestination: "/lesson/product-review",
			},
		});
	});
});
