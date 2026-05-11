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

	it("redirects checkout sessions back to checkout success", async () => {
		await Page({
			searchParams: Promise.resolve({ session_id: "cs_test_123" }),
		});

		expect(redirectMock).toHaveBeenCalledWith(
			"/checkout/success?session_id=cs_test_123",
		);
	});

	it("preserves a safe post-checkout redirect path", async () => {
		await Page({
			searchParams: Promise.resolve({
				redirect_url: "/generate-codebase",
				session_id: "cs_test_123",
			}),
		});

		expect(redirectMock).toHaveBeenCalledWith("/generate-codebase");
	});
});
