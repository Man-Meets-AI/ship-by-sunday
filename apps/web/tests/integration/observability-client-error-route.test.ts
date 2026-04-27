import { beforeEach, describe, expect, it, vi } from "vitest";

const ingestErrorEventMock = vi.fn();

vi.mock("@/platform/observability/ingest-error-event", () => ({
	ingestErrorEvent: (input: unknown) => ingestErrorEventMock(input),
}));

describe("POST /api/observability/client-error", () => {
	beforeEach(() => {
		ingestErrorEventMock.mockReset();
	});

	it("rejects unauthenticated cross-origin payloads", async () => {
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

		expect(response.status).toBe(403);
		expect(ingestErrorEventMock).not.toHaveBeenCalled();
	});

	it("accepts same-origin reports and forces them into next_client medium severity", async () => {
		const { POST } = await import("@/app/api/observability/client-error/route");

		const response = await POST(
			new Request("https://example.test/api/observability/client-error", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					origin: "https://example.test",
				},
				body: JSON.stringify({
					message: "Client failed",
					stack: "stack",
					details: '{"client":"details"}',
					requestId: null,
					pathname: "/mission",
					code: "window_error",
				}),
			}),
		);

		expect(response.status).toBe(202);
		expect(ingestErrorEventMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "next_client",
				severity: "medium",
				pathname: "/mission",
				code: "window_error",
			}),
		);
	});
});
