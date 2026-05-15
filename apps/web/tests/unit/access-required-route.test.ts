import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
}));

import Page from "@/app/access-required/page";

describe("access-required route", () => {
	beforeEach(() => {
		redirectMock.mockReset();
	});

	it("redirects direct visits to app home before app access layout gating", async () => {
		await Page();

		expect(redirectMock).toHaveBeenCalledWith("/home");
	});
});
