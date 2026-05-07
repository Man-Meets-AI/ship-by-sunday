import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();
const authMock = vi.fn();
const shouldBypassClerkProtectionMock = vi.fn(() => false);
const signInPageMock = vi.fn();
const getValidatedPendingCheckoutEmailFromCookieMock = vi.fn();

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: () => authMock(),
}));

vi.mock("@/platform/auth/clerk-middleware-bypass", () => ({
	shouldBypassClerkProtection: () => shouldBypassClerkProtectionMock(),
}));

vi.mock("@/app/(identity)/_components/sign-in-page", () => ({
	SignInPage: (props: unknown) => {
		signInPageMock(props);
		return null;
	},
}));

vi.mock("@/platform/billing/checkout/checkout-session-recovery", () => ({
	getValidatedPendingCheckoutEmailFromCookie: () =>
		getValidatedPendingCheckoutEmailFromCookieMock(),
}));

import Page from "@/app/(identity)/sign-in/[[...sign-in]]/page";

describe("sign-in route", () => {
	beforeEach(() => {
		authMock.mockReset();
		redirectMock.mockReset();
		signInPageMock.mockReset();
		getValidatedPendingCheckoutEmailFromCookieMock.mockReset();
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

	it("redirects authenticated visits without a target to workspace choice", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: true,
		});

		await Page({
			searchParams: Promise.resolve({}),
		});

		expect(redirectMock).toHaveBeenCalledWith("/workspace/choose");
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

	it("locks the checkout email for immediate post-checkout sign-in", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: false,
		});
		getValidatedPendingCheckoutEmailFromCookieMock.mockResolvedValue(
			"buyer@example.com",
		);

		const result = await Page({
			searchParams: Promise.resolve({
				redirect_url: "/workspace/choose?welcome=checkout",
			}),
		});

		expect(redirectMock).not.toHaveBeenCalled();
		expect(result).toBeTruthy();
		expect((result as { props: unknown }).props).toMatchObject({
			initialEmail: "buyer@example.com",
			isInitialEmailLocked: true,
		});
	});

	it("does not lock email for generic signed-out sign-in", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: false,
		});

		const result = await Page({
			searchParams: Promise.resolve({
				redirect_url: "/settings",
			}),
		});

		expect(
			getValidatedPendingCheckoutEmailFromCookieMock,
		).not.toHaveBeenCalled();
		expect((result as { props: unknown }).props).toMatchObject({
			initialEmail: undefined,
			isInitialEmailLocked: false,
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
