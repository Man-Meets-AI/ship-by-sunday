import { beforeEach, describe, expect, it, vi } from "vitest";

import { reportClientError } from "@/features/observability/lib/client-error-report";

describe("reportClientError", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
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
});
