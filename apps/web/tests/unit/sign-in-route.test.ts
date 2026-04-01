import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();
const authMock = vi.fn();
const shouldBypassClerkProtectionMock = vi.fn(() => false);
const getPendingCheckoutSessionIdFromCookieMock = vi.fn();
const signInPageMock = vi.fn();

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
	getPendingCheckoutSessionIdFromCookie: () =>
		getPendingCheckoutSessionIdFromCookieMock(),
}));

vi.mock("@/features/auth/sign-in/sign-in-page", () => ({
	SignInPage: (props: unknown) => {
		signInPageMock(props);
		return null;
	},
}));

import Page from "@/app/(identity)/sign-in/[[...sign-in]]/page";

describe("sign-in route", () => {
	beforeEach(() => {
		authMock.mockReset();
		redirectMock.mockReset();
		getPendingCheckoutSessionIdFromCookieMock.mockReset();
		getPendingCheckoutSessionIdFromCookieMock.mockResolvedValue(null);
		signInPageMock.mockReset();
		shouldBypassClerkProtectionMock.mockReset();
		shouldBypassClerkProtectionMock.mockReturnValue(false);
	});

	it("redirects authenticated visits to the preserved target", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: true,
		});

		await Page({
			searchParams: Promise.resolve({ redirect_url: "/settings" }),
		});

		expect(redirectMock).toHaveBeenCalledWith("/settings");
	});

	it("redirects authenticated visits without a target to the workspace start", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: true,
		});

		await Page({
			searchParams: Promise.resolve({}),
		});

		expect(redirectMock).toHaveBeenCalledWith("/start");
	});

	it("renders the sign-in page for signed-out visits", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: false,
		});

		const result = await Page({
			searchParams: Promise.resolve({ redirect_url: "/settings" }),
		});

		expect(redirectMock).not.toHaveBeenCalled();
		expect(result).toBeTruthy();
	});

	it("passes the post-checkout sign-up link when a pending checkout cookie exists", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: false,
		});
		getPendingCheckoutSessionIdFromCookieMock.mockResolvedValue("cs_test_123");

		const result = await Page({
			searchParams: Promise.resolve({ redirect_url: "/start" }),
		});

		expect(redirectMock).not.toHaveBeenCalled();
		expect(result).toMatchObject({
			props: {
				postCheckoutSignUpHref:
					"/sign-up?session_id=cs_test_123&redirect_url=%2Fstart",
			},
		});
	});

	it("renders the sign-in page without calling Clerk auth when middleware is bypassed", async () => {
		shouldBypassClerkProtectionMock.mockReturnValue(true);

		const result = await Page({
			searchParams: Promise.resolve({ redirect_url: "/settings" }),
		});

		expect(authMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
		expect(result).toBeTruthy();
	});
});
