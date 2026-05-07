import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "@/app/checkout/clear-pending/route";
import { PENDING_CHECKOUT_SESSION_COOKIE_NAME } from "@/platform/billing/checkout/pending-checkout-session-cookie";

describe("checkout clear pending route", () => {
	it("clears the pending checkout cookie and redirects to a safe path", () => {
		const response = GET(
			new NextRequest(
				"https://shipbysunday.test/checkout/clear-pending?redirect_url=%2Fcodebase",
			),
		);

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toBe(
			"https://shipbysunday.test/codebase",
		);
		expect(response.headers.get("set-cookie")).toContain(
			`${PENDING_CHECKOUT_SESSION_COOKIE_NAME}=`,
		);
	});

	it("rejects external redirect targets", () => {
		const response = GET(
			new NextRequest(
				"https://shipbysunday.test/checkout/clear-pending?redirect_url=https%3A%2F%2Fexample.com",
			),
		);

		expect(response.headers.get("location")).toBe(
			"https://shipbysunday.test/workspace/choose",
		);
	});
});
