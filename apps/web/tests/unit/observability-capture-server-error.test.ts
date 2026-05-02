import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const captureExceptionMock = vi.fn();
const setContextMock = vi.fn();
const setFingerprintMock = vi.fn();
const setLevelMock = vi.fn();
const setTagMock = vi.fn();
const setTagsMock = vi.fn();

vi.mock("@sentry/nextjs", () => ({
	captureException: (input: unknown) => captureExceptionMock(input),
	withScope: (callback: (scope: unknown) => void) =>
		callback({
			setContext: setContextMock,
			setFingerprint: setFingerprintMock,
			setLevel: setLevelMock,
			setTag: setTagMock,
			setTags: setTagsMock,
		}),
}));

describe("captureServerError", () => {
	beforeEach(() => {
		captureExceptionMock.mockReset();
		setContextMock.mockReset();
		setFingerprintMock.mockReset();
		setLevelMock.mockReset();
		setTagMock.mockReset();
		setTagsMock.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("ignores Next.js control flow errors", async () => {
		const { captureServerError } =
			await import("@/platform/observability/capture-server-error");

		await captureServerError({
			source: "next_runtime",
			error: new Error("NEXT_REDIRECT"),
			pathname: "/mission",
		});

		expect(captureExceptionMock).not.toHaveBeenCalled();
	});

	it("normalizes unexpected errors into Sentry context", async () => {
		const { captureServerError } =
			await import("@/platform/observability/capture-server-error");
		const error = new Error("Stripe failed");

		await captureServerError({
			source: "stripe",
			error,
			pathname: "/api/stripe/checkout",
			requestId: "request_1",
			code: "stripe_checkout_failed",
			severity: "high",
		});

		expect(setLevelMock).toHaveBeenCalledWith("error");
		expect(setTagsMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "stripe",
				code: "stripe_checkout_failed",
				surface: "billing",
			}),
		);
		expect(setContextMock).toHaveBeenCalledWith(
			"ship_by_sunday_observability",
			expect.objectContaining({
				requestId: "request_1",
			}),
		);
		expect(captureExceptionMock).toHaveBeenCalledWith(error);
	});
});
