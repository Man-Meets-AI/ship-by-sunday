import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
}));

import Page from "@/app/(identity)/sign-up/[[...sign-up]]/page";

describe("sign-up route", () => {
	beforeEach(() => {
		redirectMock.mockReset();
	});

	it("redirects direct visits without a checkout session back to pricing", async () => {
		await Page({
			searchParams: Promise.resolve({}),
		});

		expect(redirectMock).toHaveBeenCalledWith("/#pricing");
	});

	it("redirects checkout sessions through the email handoff", async () => {
		await Page({
			searchParams: Promise.resolve({ session_id: "cs_test_123" }),
		});

		expect(redirectMock).toHaveBeenCalledWith(
			"/checkout/email-handoff?session_id=cs_test_123&redirect_url=%2Fcheckout%2Fsuccess%3Fsession_id%3Dcs_test_123",
		);
	});

	it("preserves a safe post-handoff redirect path", async () => {
		await Page({
			searchParams: Promise.resolve({
				redirect_url: "/blueprint",
				session_id: "cs_test_123",
			}),
		});

		expect(redirectMock).toHaveBeenCalledWith(
			"/checkout/email-handoff?session_id=cs_test_123&redirect_url=%2Fblueprint",
		);
	});
});
