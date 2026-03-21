import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { NormalizedObservabilityEvent } from "@/features/observability/lib/error-event";

describe("ingestErrorEvent", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			OBSERVABILITY_INGEST_TOKEN: "ingest_token",
			NEXT_PUBLIC_CONVEX_URL: "https://convex.example",
		};
		vi.resetModules();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("posts normalized events to the Convex observability endpoint", async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true });
		vi.stubGlobal("fetch", fetchMock);
		const { ingestErrorEvent } = await import(
			"@/features/observability/server/ingest-error-event"
		);

		await ingestErrorEvent({
			fingerprint: "err_1",
			source: "next_server",
			message: "Mission failed",
			stack: null,
			details: null,
			requestId: "request_1",
			pathname: "/mission",
			userId: null,
			code: "next_request_error",
			severity: "medium",
			environment: "production",
		} satisfies NormalizedObservabilityEvent);

		expect(fetchMock).toHaveBeenCalledWith(
			"https://convex.example/observability/events",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Authorization: "Bearer ingest_token",
				}),
			}),
		);
	});

	it("no-ops when the ingest token or Convex url is missing", async () => {
		process.env = {
			...originalEnv,
		};
		vi.resetModules();
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const { ingestErrorEvent } = await import(
			"@/features/observability/server/ingest-error-event"
		);

		await ingestErrorEvent({
			fingerprint: "err_1",
			source: "next_server",
			message: "Mission failed",
			stack: null,
			details: null,
			requestId: "request_1",
			pathname: "/mission",
			userId: null,
			code: "next_request_error",
			severity: "medium",
			environment: "production",
		} satisfies NormalizedObservabilityEvent);

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("swallows fetch failures after logging them", async () => {
		const consoleErrorMock = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		const fetchMock = vi.fn().mockRejectedValue(new Error("network failed"));
		vi.stubGlobal("fetch", fetchMock);
		const { ingestErrorEvent } = await import(
			"@/features/observability/server/ingest-error-event"
		);

		await ingestErrorEvent({
			fingerprint: "err_1",
			source: "next_server",
			message: "Mission failed",
			stack: null,
			details: null,
			requestId: "request_1",
			pathname: "/mission",
			userId: null,
			code: "next_request_error",
			severity: "medium",
			environment: "production",
		} satisfies NormalizedObservabilityEvent);

		expect(consoleErrorMock).toHaveBeenCalledWith(
			"observability ingest failed",
			expect.any(Error),
		);
	});
});
