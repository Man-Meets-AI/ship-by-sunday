import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("updateIncidentStatus", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			NEXT_PUBLIC_CONVEX_URL: "https://convex.example",
		};
		vi.restoreAllMocks();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.unstubAllGlobals();
	});

	it("forwards the incident id and allowed status to the Convex control endpoint", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			text: vi.fn().mockResolvedValue(""),
		});
		vi.stubGlobal("fetch", fetchMock);
		const { updateIncidentStatus } =
			await import("@/features/observability/server/update-incident-status");

		await updateIncidentStatus({
			incidentId: "incident_123",
			status: "acked",
			ingestToken: "ingest_token",
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"https://convex.example/observability/incidents/status",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Authorization: "Bearer ingest_token",
				}),
			}),
		);
	});

	it("prefers NEXT_PUBLIC_CONVEX_SITE_URL when it is configured", async () => {
		process.env = {
			...originalEnv,
			NEXT_PUBLIC_CONVEX_URL: "https://convex.example",
			NEXT_PUBLIC_CONVEX_SITE_URL: "https://convex-site.example",
		};
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			text: vi.fn().mockResolvedValue(""),
		});
		vi.stubGlobal("fetch", fetchMock);
		const { updateIncidentStatus } =
			await import("@/features/observability/server/update-incident-status");

		await updateIncidentStatus({
			incidentId: "incident_123",
			status: "muted",
			ingestToken: "ingest_token",
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"https://convex-site.example/observability/incidents/status",
			expect.any(Object),
		);
	});

	it("throws when the Convex transport is not configured", async () => {
		process.env = {};
		const { updateIncidentStatus } =
			await import("@/features/observability/server/update-incident-status");

		await expect(
			updateIncidentStatus({
				incidentId: "incident_123",
				status: "resolved",
				ingestToken: "ingest_token",
			}),
		).rejects.toThrow("Convex observability url is not configured.");
	});

	it("includes the response body when the Convex update fails", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 503,
			text: vi.fn().mockResolvedValue("backend unavailable"),
		});
		vi.stubGlobal("fetch", fetchMock);
		const { updateIncidentStatus } =
			await import("@/features/observability/server/update-incident-status");

		await expect(
			updateIncidentStatus({
				incidentId: "incident_123",
				status: "resolved",
				ingestToken: "ingest_token",
			}),
		).rejects.toThrow(
			"Convex incident status update failed with 503: backend unavailable",
		);
	});
});
