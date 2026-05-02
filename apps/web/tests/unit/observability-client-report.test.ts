import { beforeEach, describe, expect, it, vi } from "vitest";

import { reportClientError } from "@/lib/observability/client-error-report";

const capturePostHogClientExceptionMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/observability/posthog-client", () => ({
	capturePostHogClientException: (input: unknown) =>
		capturePostHogClientExceptionMock(input),
}));

describe("reportClientError", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
		capturePostHogClientExceptionMock.mockReset();
	});

	it("captures client errors through PostHog", () => {
		reportClientError({
			error: new Error("Client failed"),
			pathname: "/mission",
			code: "window_error",
		});

		expect(capturePostHogClientExceptionMock).toHaveBeenCalledWith(
			expect.objectContaining({
				error: expect.any(Error),
				properties: expect.objectContaining({
					source: "next_client",
					code: "window_error",
					pathname: "/mission",
					title: "Client failed",
				}),
			}),
		);
	});

	it("ignores Next.js control flow errors", () => {
		reportClientError({
			error: new Error("NEXT_REDIRECT"),
			pathname: "/mission",
			code: "window_error",
		});

		expect(capturePostHogClientExceptionMock).not.toHaveBeenCalled();
	});
});
