import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const checkoutEmailHandoffPageMock = vi.fn();
const fulfillCheckoutSessionByEmailMock = vi.fn();
const getCheckoutSessionForRecoveryMock = vi.fn();
const getStripeCheckoutSessionEmailMock = vi.fn();
const isStripeCheckoutSessionForCourseMock = vi.fn();
const isStripeCheckoutSessionPaidMock = vi.fn();
const redirectMock = vi.fn();
const shouldBypassClerkProtectionMock = vi.fn();

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: () => authMock(),
}));

vi.mock("@/platform/auth/clerk-middleware-bypass", () => ({
	shouldBypassClerkProtection: () => shouldBypassClerkProtectionMock(),
}));

vi.mock("@/platform/billing/checkout/checkout-session-recovery", () => ({
	fulfillCheckoutSessionByEmail: (...args: unknown[]) =>
		fulfillCheckoutSessionByEmailMock(...args),
	getCheckoutSessionForRecovery: (...args: unknown[]) =>
		getCheckoutSessionForRecoveryMock(...args),
	getStripeCheckoutSessionEmail: (...args: unknown[]) =>
		getStripeCheckoutSessionEmailMock(...args),
	isStripeCheckoutSessionForCourse: (...args: unknown[]) =>
		isStripeCheckoutSessionForCourseMock(...args),
	isStripeCheckoutSessionPaid: (...args: unknown[]) =>
		isStripeCheckoutSessionPaidMock(...args),
}));

vi.mock(
	"@/app/(identity)/_components/checkout-email-handoff/checkout-email-handoff-page",
	() => ({
		CheckoutEmailHandoffPage: (props: unknown) => {
			checkoutEmailHandoffPageMock(props);
			return null;
		},
	}),
);

import Page from "@/app/checkout/email-handoff/page";

describe("checkout email handoff route", () => {
	beforeEach(() => {
		authMock.mockReset();
		checkoutEmailHandoffPageMock.mockReset();
		fulfillCheckoutSessionByEmailMock.mockReset();
		getCheckoutSessionForRecoveryMock.mockReset();
		getStripeCheckoutSessionEmailMock.mockReset();
		isStripeCheckoutSessionForCourseMock.mockReset();
		isStripeCheckoutSessionPaidMock.mockReset();
		redirectMock.mockReset();
		shouldBypassClerkProtectionMock.mockReset();

		authMock.mockResolvedValue({ isAuthenticated: false });
		getCheckoutSessionForRecoveryMock.mockResolvedValue({
			id: "cs_test_123",
			payment_status: "paid",
		});
		getStripeCheckoutSessionEmailMock.mockReturnValue("buyer@example.com");
		fulfillCheckoutSessionByEmailMock.mockResolvedValue({
			kind: "fulfilled",
			sessionId: "cs_test_123",
			checkoutEmail: "buyer@example.com",
			clerkUserId: "user_123",
			clerkUserStatus: "exists",
			grantResult: {
				granted: "inserted",
			},
		});
		isStripeCheckoutSessionForCourseMock.mockReturnValue(true);
		isStripeCheckoutSessionPaidMock.mockReturnValue(true);
		shouldBypassClerkProtectionMock.mockReturnValue(false);
	});

	it("renders the locked-email handoff for a paid course checkout", async () => {
		const result = await Page({
			searchParams: Promise.resolve({ session_id: "cs_test_123" }),
		});

		expect(redirectMock).not.toHaveBeenCalled();
		expect(result.type.name).toBe("IdentityPageFrame");
		expect(fulfillCheckoutSessionByEmailMock).toHaveBeenCalledWith(
			"cs_test_123",
			"checkout.email_handoff.fulfillment",
		);
		expect(result.props.children).toMatchObject({
			props: {
				checkoutEmail: "buyer@example.com",
				redirectPath: "/checkout/success?session_id=cs_test_123",
			},
		});
	});

	it("redirects authenticated visits back to checkout success", async () => {
		authMock.mockResolvedValue({ isAuthenticated: true });

		await Page({
			searchParams: Promise.resolve({ session_id: "cs_test_123" }),
		});

		expect(redirectMock).toHaveBeenCalledWith(
			"/checkout/success?session_id=cs_test_123",
		);
	});

	it("routes stale checkout cookies through the cookie-clearing handler", async () => {
		getCheckoutSessionForRecoveryMock.mockResolvedValue(null);

		await Page({
			searchParams: Promise.resolve({
				redirect_url: "/codebase",
				session_id: "cs_missing",
			}),
		});

		expect(redirectMock).toHaveBeenCalledWith(
			"/checkout/clear-pending?redirect_url=%2Fcodebase",
		);
	});

	it("returns unpaid sessions to checkout success instead of showing auth", async () => {
		isStripeCheckoutSessionPaidMock.mockReturnValue(false);

		await Page({
			searchParams: Promise.resolve({ session_id: "cs_pending" }),
		});

		expect(redirectMock).toHaveBeenCalledWith(
			"/checkout/success?session_id=cs_pending",
		);
	});

	it("returns to checkout success instead of rendering OTP before fulfillment exists", async () => {
		fulfillCheckoutSessionByEmailMock.mockResolvedValue({
			kind: "clerk_lookup_failed",
			sessionId: "cs_test_123",
			checkoutEmail: "buyer@example.com",
			message: "Clerk lookup failed.",
		});

		await Page({
			searchParams: Promise.resolve({ session_id: "cs_test_123" }),
		});

		expect(checkoutEmailHandoffPageMock).not.toHaveBeenCalled();
		expect(redirectMock).toHaveBeenCalledWith(
			"/checkout/success?session_id=cs_test_123",
		);
	});
});
