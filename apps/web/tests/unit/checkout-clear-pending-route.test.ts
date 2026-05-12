import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "@/app/checkout/clear-pending/submit/route";
import { PENDING_CHECKOUT_SESSION_COOKIE_NAME } from "@/platform/billing/checkout/pending-checkout-session-cookie";

describe("checkout clear pending route", () => {
	it("clears the pending checkout cookie and redirects to a safe path", () => {
		const response = POST(
			new NextRequest(
				"https://shipbysunday.test/checkout/clear-pending/submit?redirect_url=%2Fgenerate-codebase",
				{ method: "POST" },
			),
		);

		expect(response.status).toBe(303);
		expect(response.headers.get("location")).toBe(
			"https://shipbysunday.test/generate-codebase",
		);
		expect(response.headers.get("set-cookie")).toContain(
			`${PENDING_CHECKOUT_SESSION_COOKIE_NAME}=`,
		);
	});

	it("rejects external redirect targets", () => {
		const response = POST(
			new NextRequest(
				"https://shipbysunday.test/checkout/clear-pending/submit?redirect_url=https%3A%2F%2Fexample.com",
				{ method: "POST" },
			),
		);

		expect(response.headers.get("location")).toBe(
			"https://shipbysunday.test/home",
		);
	});
});
