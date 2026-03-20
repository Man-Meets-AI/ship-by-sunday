import { describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
}));

import Page from "@/app/sign-up/[[...sign-up]]/page";

describe("sign-up route", () => {
	it("redirects direct visits to pricing", () => {
		redirectMock.mockReset();

		Page();

		expect(redirectMock).toHaveBeenCalledWith("/#pricing");
	});
});
