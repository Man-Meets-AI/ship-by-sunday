import { describe, expect, it } from "vitest";

describe("POST /api/observability/client-error", () => {
	it("returns gone because generic client errors moved to PostHog", async () => {
		const { POST } = await import("@/app/api/observability/client-error/route");

		const response = await POST(
			new Request("https://example.test/api/observability/client-error", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					message: "spoofed",
					stack: null,
					details: null,
					requestId: null,
					pathname: "/api/stripe/checkout",
					code: "stripe_checkout_failed",
				}),
			}),
		);
		const body = (await response.json()) as { error: string };

		expect(response.status).toBe(410);
		expect(body.error).toContain("Client error ingest moved to PostHog");
	});
});
