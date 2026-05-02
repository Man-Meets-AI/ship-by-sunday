import { beforeEach, describe, expect, it, vi } from "vitest";

const capturePostHogServerExceptionMock = vi.hoisted(() => vi.fn());
const flushPostHogServerMock = vi.hoisted(() => vi.fn());

vi.mock("@/platform/observability/posthog-server", () => ({
	capturePostHogServerException: (input: unknown) =>
		capturePostHogServerExceptionMock(input),
	flushPostHogServer: () => flushPostHogServerMock(),
}));

describe("Next.js PostHog instrumentation", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = { ...originalEnv, NEXT_RUNTIME: "nodejs" };
		capturePostHogServerExceptionMock.mockReset();
		flushPostHogServerMock.mockReset();
	});

	it("captures request errors in PostHog with route context", async () => {
		const { onRequestError } = await import("@/instrumentation");
		const error = Object.assign(new Error("Render failed"), {
			digest: "digest_123",
		});

		await onRequestError(
			error,
			{
				path: "/checkout",
				method: "GET",
				headers: {
					cookie:
						"ph_phc_123_posthog=%7B%22distinct_id%22%3A%22person_123%22%7D",
					"x-request-id": "request_123",
				},
			},
			{
				routerKind: "App Router",
				routePath: "/checkout/page",
				routeType: "render",
				renderSource: "server-rendering",
				revalidateReason: undefined,
				renderType: "dynamic",
			},
		);

		expect(capturePostHogServerExceptionMock).toHaveBeenCalledWith({
			error,
			distinctId: "person_123",
			properties: expect.objectContaining({
				source: "next_runtime",
				requestId: "request_123",
				pathname: "/checkout",
				code: "next_request_error",
				routePath: "/checkout/page",
				routeType: "render",
				digest: "digest_123",
			}),
		});
		expect(flushPostHogServerMock).toHaveBeenCalledTimes(1);
	});

	it("does not load PostHog for non-node runtimes", async () => {
		process.env.NEXT_RUNTIME = "edge";
		const { onRequestError } = await import("@/instrumentation");

		await onRequestError(
			new Error("Edge failed"),
			{
				path: "/checkout",
				method: "GET",
				headers: {},
			},
			{
				routerKind: "App Router",
				routePath: "/checkout/page",
				routeType: "render",
				renderSource: "server-rendering",
				revalidateReason: undefined,
				renderType: "dynamic",
			},
		);

		expect(capturePostHogServerExceptionMock).not.toHaveBeenCalled();
	});
});
