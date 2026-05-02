import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const posthogCaptureExceptionMock = vi.hoisted(() => vi.fn());
const posthogFlushMock = vi.hoisted(() => vi.fn());
const posthogConstructorMock = vi.hoisted(() => vi.fn());

vi.mock("posthog-node", () => ({
	PostHog: class PostHogMock {
		constructor(...args: unknown[]) {
			posthogConstructorMock(...args);
		}

		captureException(...args: unknown[]) {
			posthogCaptureExceptionMock(...args);
		}

		flush(...args: unknown[]) {
			posthogFlushMock(...args);
		}
	},
}));

describe("PostHog server adapter", () => {
	const originalEnv = { ...process.env };

	beforeEach(async () => {
		process.env = { ...originalEnv };
		posthogConstructorMock.mockReset();
		posthogCaptureExceptionMock.mockReset();
		posthogFlushMock.mockReset();
		const { resetPostHogServerForTests } =
			await import("@/platform/observability/posthog-server");
		resetPostHogServerForTests();
	});

	it("does not initialize without a PostHog browser token", async () => {
		delete process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

		const { capturePostHogServerException } =
			await import("@/platform/observability/posthog-server");

		expect(
			capturePostHogServerException({
				error: new Error("Server failed"),
			}),
		).toBe(false);
		expect(posthogConstructorMock).not.toHaveBeenCalled();
	});

	it("captures server exceptions with request context", async () => {
		process.env.NEXT_PUBLIC_POSTHOG_TOKEN = "phc_test_123";
		process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";

		const { capturePostHogServerException, flushPostHogServer } =
			await import("@/platform/observability/posthog-server");

		expect(
			capturePostHogServerException({
				error: new Error("Server failed"),
				distinctId: "person_123",
				properties: {
					source: "next_runtime",
					pathname: "/checkout",
				},
			}),
		).toBe(true);
		await flushPostHogServer();

		expect(posthogConstructorMock).toHaveBeenCalledWith("phc_test_123", {
			host: "https://us.i.posthog.com",
			flushAt: 1,
			flushInterval: 0,
		});
		expect(posthogCaptureExceptionMock).toHaveBeenCalledWith(
			expect.any(Error),
			"person_123",
			{
				source: "next_runtime",
				pathname: "/checkout",
			},
		);
		expect(posthogFlushMock).toHaveBeenCalledTimes(1);
	});
});
