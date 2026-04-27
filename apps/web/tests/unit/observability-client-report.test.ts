import { beforeEach, describe, expect, it, vi } from "vitest";

import { reportClientError } from "@/lib/observability/client-error-report";

describe("reportClientError", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("uses sendBeacon when available", () => {
		const sendBeaconMock = vi.fn(() => true);
		Object.defineProperty(globalThis.navigator, "sendBeacon", {
			configurable: true,
			value: sendBeaconMock,
		});

		reportClientError({
			error: new Error("Client failed"),
			pathname: "/mission",
			code: "window_error",
		});

		expect(sendBeaconMock).toHaveBeenCalledTimes(1);
	});

	it("falls back to fetch when sendBeacon is unavailable", () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true });
		vi.stubGlobal("fetch", fetchMock);
		Object.defineProperty(globalThis.navigator, "sendBeacon", {
			configurable: true,
			value: undefined,
		});

		reportClientError({
			error: new Error("Client failed"),
			pathname: "/mission",
			code: "window_error",
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/observability/client-error",
			expect.objectContaining({
				method: "POST",
			}),
		);
	});

	it("swallows rejected fallback fetches", async () => {
		const transportError = new Error("network offline");
		const rejectedFetch = Promise.reject(transportError);
		const catchMock = vi.spyOn(rejectedFetch, "catch");
		const fetchMock = vi.fn(() => rejectedFetch);
		vi.stubGlobal("fetch", fetchMock);
		Object.defineProperty(globalThis.navigator, "sendBeacon", {
			configurable: true,
			value: undefined,
		});

		reportClientError({
			error: new Error("Client failed"),
			pathname: "/mission",
			code: "window_error",
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(catchMock).toHaveBeenCalledTimes(1);
		await expect(rejectedFetch.catch(() => undefined)).resolves.toBeUndefined();
	});
});
