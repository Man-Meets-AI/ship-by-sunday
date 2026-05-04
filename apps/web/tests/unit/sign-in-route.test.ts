import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();
const authMock = vi.fn();
const shouldBypassClerkProtectionMock = vi.fn(() => false);
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

vi.mock("@/app/(identity)/_components/sign-in-page", () => ({
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

	it("redirects authenticated visits without a target to the codebase page", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: true,
		});

		await Page({
			searchParams: Promise.resolve({}),
		});

		expect(redirectMock).toHaveBeenCalledWith("/codebase");
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

	it("routes checkout success sign-in attempts to the email handoff", async () => {
		authMock.mockResolvedValue({
			isAuthenticated: false,
		});

		await Page({
			searchParams: Promise.resolve({
				redirect_url: "/checkout/success?session_id=cs_test_123",
			}),
		});

		expect(redirectMock).toHaveBeenCalledWith(
			"/checkout/email-handoff?session_id=cs_test_123&redirect_url=%2Fcheckout%2Fsuccess%3Fsession_id%3Dcs_test_123",
		);
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
