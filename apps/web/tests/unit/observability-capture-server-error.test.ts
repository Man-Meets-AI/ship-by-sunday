import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const ingestErrorEventMock = vi.fn();

vi.mock("@/features/observability/server/ingest-error-event", () => ({
	ingestErrorEvent: (input: unknown) => ingestErrorEventMock(input),
}));

describe("captureServerError", () => {
	beforeEach(() => {
		ingestErrorEventMock.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("ignores Next.js control flow errors", async () => {
		const { captureServerError } =
			await import("@/features/observability/server/capture-server-error");

		await captureServerError({
			source: "next_runtime",
			error: new Error("NEXT_REDIRECT"),
			pathname: "/mission",
		});

		expect(ingestErrorEventMock).not.toHaveBeenCalled();
	});

	it("normalizes and forwards unexpected errors", async () => {
		const { captureServerError } =
			await import("@/features/observability/server/capture-server-error");

		await captureServerError({
			source: "stripe",
			error: new Error("Stripe failed"),
			pathname: "/api/stripe/checkout",
			requestId: "request_1",
			code: "stripe_checkout_failed",
			severity: "high",
		});

		expect(ingestErrorEventMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "stripe",
				requestId: "request_1",
				code: "stripe_checkout_failed",
				severity: "high",
			}),
		);
	});
});
