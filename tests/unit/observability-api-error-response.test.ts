import { describe, expect, it, vi } from "vitest";

const captureServerErrorMock = vi.fn();

vi.mock("@/features/observability/server/capture-server-error", () => ({
	captureServerError: (input: unknown) => captureServerErrorMock(input),
}));

import { getUnexpectedApiErrorResponse } from "@/features/observability/server/api-error-response";

describe("getUnexpectedApiErrorResponse", () => {
	it("captures the error and returns a normalized 500 response", async () => {
		const response = await getUnexpectedApiErrorResponse({
			error: new Error("Boom"),
			requestId: "request_1",
			pathname: "/api/codex/generate",
			source: "codex",
			defaultMessage: "Codex failed.",
			code: "server_error",
		});

		expect(captureServerErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "codex",
				requestId: "request_1",
				pathname: "/api/codex/generate",
			}),
		);
		expect(response.status).toBe(500);
		expect(response.headers.get("x-request-id")).toBe("request_1");
		expect(await response.json()).toEqual({
			error: "Boom",
			code: "server_error",
			requestId: "request_1",
		});
	});

	it("falls back to the default message for non-Error values", async () => {
		const response = await getUnexpectedApiErrorResponse({
			error: "plain string",
			requestId: "request_2",
			pathname: "/api/stripe/checkout",
			source: "stripe",
			defaultMessage: "Stripe failed.",
		});

		expect(await response.json()).toEqual({
			error: "Stripe failed.",
			code: "server_error",
			requestId: "request_2",
		});
	});
});
