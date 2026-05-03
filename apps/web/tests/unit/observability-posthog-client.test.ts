import { beforeEach, describe, expect, it, vi } from "vitest";

const posthogInitMock = vi.hoisted(() => vi.fn());
const posthogCaptureMock = vi.hoisted(() => vi.fn());
const posthogCaptureExceptionMock = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({
	default: {
		init: (...args: unknown[]) => posthogInitMock(...args),
		capture: (...args: unknown[]) => posthogCaptureMock(...args),
		captureException: (...args: unknown[]) =>
			posthogCaptureExceptionMock(...args),
	},
}));

describe("PostHog client adapter", () => {
	const originalEnv = { ...process.env };

	beforeEach(async () => {
		process.env = { ...originalEnv };
		posthogInitMock.mockReset();
		posthogCaptureMock.mockReset();
		posthogCaptureExceptionMock.mockReset();
		const { resetPostHogClientForTests } =
			await import("@/lib/observability/posthog-client");
		resetPostHogClientForTests();
	});

	it("does not initialize when the browser token is missing", async () => {
		delete process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
		process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";

		const { initializePostHogClient } =
			await import("@/lib/observability/posthog-client");

		expect(initializePostHogClient()).toBe(false);
		expect(posthogInitMock).not.toHaveBeenCalled();
	});

	it("initializes analytics, error tracking, and masked session replay once", async () => {
		process.env.NEXT_PUBLIC_POSTHOG_TOKEN = "phc_test_123";
		process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";

		const { initializePostHogClient } =
			await import("@/lib/observability/posthog-client");

		expect(initializePostHogClient()).toBe(true);
		expect(initializePostHogClient()).toBe(true);
		expect(posthogInitMock).toHaveBeenCalledTimes(1);
		expect(posthogInitMock).toHaveBeenCalledWith(
			"phc_test_123",
			expect.objectContaining({
				api_host: "https://us.i.posthog.com",
				capture_pageview: "history_change",
				capture_exceptions: true,
				enable_recording_console_log: false,
				session_recording: expect.objectContaining({
					maskAllInputs: true,
					blockSelector: expect.stringContaining("ph-no-capture"),
				}),
			}),
		);
	});

	it("captures product events best-effort", async () => {
		process.env.NEXT_PUBLIC_POSTHOG_TOKEN = "phc_test_123";
		process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";

		const { capturePostHogProductEvent } =
			await import("@/lib/observability/posthog-client");

		expect(
			capturePostHogProductEvent({
				event: "checkout_started",
				properties: { surface: "checkout_button" },
			}),
		).toBe(true);
		expect(posthogCaptureMock).toHaveBeenCalledWith("checkout_started", {
			surface: "checkout_button",
		});
	});

	it("uses the default PostHog host when the public host is blank", async () => {
		process.env.NEXT_PUBLIC_POSTHOG_TOKEN = " phc_test_123 ";
		process.env.NEXT_PUBLIC_POSTHOG_HOST = " ";

		const { getPostHogBrowserConfig, initializePostHogClient } =
			await import("@/lib/observability/posthog-client");

		expect(getPostHogBrowserConfig()).toEqual({
			token: "phc_test_123",
			host: "https://us.i.posthog.com",
		});
		expect(initializePostHogClient()).toBe(true);
		expect(posthogInitMock).toHaveBeenCalledWith(
			"phc_test_123",
			expect.objectContaining({
				api_host: "https://us.i.posthog.com",
			}),
		);
	});

	it("captures after the SDK has already initialized", async () => {
		process.env.NEXT_PUBLIC_POSTHOG_TOKEN = "phc_test_123";
		process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";

		const { capturePostHogProductEvent, initializePostHogClient } =
			await import("@/lib/observability/posthog-client");

		initializePostHogClient();

		expect(
			capturePostHogProductEvent({
				event: "checkout_started",
				properties: { surface: "checkout_button" },
			}),
		).toBe(true);
		expect(posthogCaptureMock).toHaveBeenCalledWith("checkout_started", {
			surface: "checkout_button",
		});
	});

	it("swallows client capture failures", async () => {
		process.env.NEXT_PUBLIC_POSTHOG_TOKEN = "phc_test_123";
		process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";
		posthogCaptureExceptionMock.mockImplementationOnce(() => {
			throw new Error("PostHog unavailable");
		});

		const { capturePostHogClientException } =
			await import("@/lib/observability/posthog-client");

		expect(
			capturePostHogClientException({
				error: new Error("Client failed"),
			}),
		).toBe(false);
	});

	it("returns false when product event capture cannot initialize", async () => {
		delete process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

		const { capturePostHogProductEvent } =
			await import("@/lib/observability/posthog-client");

		expect(
			capturePostHogProductEvent({
				event: "checkout_started",
			}),
		).toBe(false);
		expect(posthogCaptureMock).not.toHaveBeenCalled();
	});

	it("swallows product event capture failures", async () => {
		process.env.NEXT_PUBLIC_POSTHOG_TOKEN = "phc_test_123";
		process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";
		posthogCaptureMock.mockImplementationOnce(() => {
			throw new Error("PostHog unavailable");
		});

		const { capturePostHogProductEvent } =
			await import("@/lib/observability/posthog-client");

		expect(
			capturePostHogProductEvent({
				event: "checkout_started",
			}),
		).toBe(false);
	});
});
