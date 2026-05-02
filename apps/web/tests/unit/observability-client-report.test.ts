import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { reportClientError } from "@/lib/observability/client-error-report";

describe("reportClientError", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
		captureExceptionMock.mockReset();
		setContextMock.mockReset();
		setFingerprintMock.mockReset();
		setLevelMock.mockReset();
		setTagMock.mockReset();
		setTagsMock.mockReset();
	});

	it("captures normalized client errors with Sentry", () => {
		const error = new Error("Client failed");

		reportClientError({
			error,
			pathname: "/mission",
			code: "window_error",
		});

		expect(setLevelMock).toHaveBeenCalledWith("warning");
		expect(setTagsMock).toHaveBeenCalledWith(
			expect.objectContaining({
				code: "window_error",
				source: "next_client",
				surface: "runtime_error",
			}),
		);
		expect(setTagMock).toHaveBeenCalledWith("pathname", "/mission");
		expect(captureExceptionMock).toHaveBeenCalledWith(error);
	});

	it("turns non-error client failures into an Error for Sentry", () => {
		reportClientError({
			error: "Client failed",
			pathname: "/start",
			code: "unhandled_rejection",
		});

		expect(captureExceptionMock).toHaveBeenCalledWith(expect.any(Error));
		expect(captureExceptionMock.mock.calls[0]?.[0]).toMatchObject({
			message: "Client failed",
		});
	});
});
