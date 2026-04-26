import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();
const authMock = vi.fn();
const shouldBypassClerkProtectionMock = vi.fn(() => false);
const getCheckoutSessionForRecoveryMock = vi.fn();
const getStripeCheckoutSessionEmailMock = vi.fn();
const postCheckoutSignUpPageMock = vi.fn();

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: () => authMock(),
}));

vi.mock("@/platform/auth/clerk-middleware-bypass", () => ({
	shouldBypassClerkProtection: () => shouldBypassClerkProtectionMock(),
}));

vi.mock("@/features/checkout/server/checkout-session-recovery", () => ({
	getCheckoutSessionForRecovery: (...args: unknown[]) =>
		getCheckoutSessionForRecoveryMock(...args),
	getStripeCheckoutSessionEmail: (...args: unknown[]) =>
		getStripeCheckoutSessionEmailMock(...args),
	isStripeCheckoutSessionForCourse: () => true,
	isStripeCheckoutSessionPaid: () => true,
}));

vi.mock("@/app/(identity)/_components/post-checkout-sign-up-page", () => ({
	PostCheckoutSignUpPage: ({
		checkoutEmail,
		redirectPath,
	}: {
		checkoutEmail: string;
		redirectPath: string;
	}) => {
		postCheckoutSignUpPageMock({ checkoutEmail, redirectPath });
		return null;
	},
}));

import Page from "@/app/(identity)/sign-up/[[...sign-up]]/page";

describe("sign-up route", () => {
	beforeEach(() => {
		redirectMock.mockReset();
		authMock.mockReset();
		shouldBypassClerkProtectionMock.mockReset();
		shouldBypassClerkProtectionMock.mockReturnValue(false);
		getCheckoutSessionForRecoveryMock.mockReset();
		getStripeCheckoutSessionEmailMock.mockReset();
		postCheckoutSignUpPageMock.mockReset();
	});

	it("redirects direct visits without a checkout session back to pricing", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: false,
		});

		await Page({
			searchParams: Promise.resolve({}),
		});

		expect(redirectMock).toHaveBeenCalledWith("/#pricing");
	});

	it("redirects authenticated visits back to the checkout success handoff", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: true,
		});
		getCheckoutSessionForRecoveryMock.mockResolvedValue({
			metadata: {},
			client_reference_id: null,
			payment_status: "paid",
		});
		getStripeCheckoutSessionEmailMock.mockReturnValue("buyer@example.com");

		await Page({
			searchParams: Promise.resolve({ session_id: "cs_test_123" }),
		});

		expect(redirectMock).toHaveBeenCalledWith(
			"/checkout/success?session_id=cs_test_123",
		);
	});

	it("renders the post-checkout sign-up page for a valid guest checkout session", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: false,
		});
		getCheckoutSessionForRecoveryMock.mockResolvedValue({
			metadata: {},
			client_reference_id: null,
			payment_status: "paid",
		});
		getStripeCheckoutSessionEmailMock.mockReturnValue("buyer@example.com");

		const result = await Page({
			searchParams: Promise.resolve({ session_id: "cs_test_123" }),
		});

		expect(redirectMock).not.toHaveBeenCalled();
		expect(result).toMatchObject({
			props: {
				checkoutEmail: "buyer@example.com",
				redirectPath: "/checkout/success?session_id=cs_test_123",
			},
		});
	});
});
