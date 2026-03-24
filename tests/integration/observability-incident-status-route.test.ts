import { beforeEach, describe, expect, it, vi } from "vitest";

const updateIncidentStatusMock = vi.fn();
const captureServerErrorMock = vi.fn();

const serverEnv = {
	OBSERVABILITY_INCIDENT_CONTROL_TOKEN: "control_token",
	OBSERVABILITY_INGEST_TOKEN: "ingest_token",
};

vi.mock("@/features/observability/server/update-incident-status", () => ({
	updateIncidentStatus: (input: unknown) => updateIncidentStatusMock(input),
}));

vi.mock("@/features/observability/server/capture-server-error", () => ({
	captureServerError: (input: unknown) => captureServerErrorMock(input),
}));

vi.mock("@/platform/env/server", () => ({
	serverEnv,
}));

describe("POST /api/observability/incidents/[incidentId]/status", () => {
	beforeEach(() => {
		updateIncidentStatusMock.mockReset();
		captureServerErrorMock.mockReset();
		serverEnv.OBSERVABILITY_INCIDENT_CONTROL_TOKEN = "control_token";
		serverEnv.OBSERVABILITY_INGEST_TOKEN = "ingest_token";
	});

	it("applies an allowed incident status change", async () => {
		const { POST } = await import(
			"@/app/api/observability/incidents/[incidentId]/status/route"
		);

		const response = await POST(
			new Request(
				"https://example.test/api/observability/incidents/incident_123/status",
				{
					method: "POST",
					headers: {
						authorization: "Bearer control_token",
						"content-type": "application/json",
					},
					body: JSON.stringify({
						status: "acked",
					}),
				},
			),
			{
				params: Promise.resolve({
					incidentId: "incident_123",
				}),
			},
		);

		expect(response.status).toBe(200);
		expect(updateIncidentStatusMock).toHaveBeenCalledWith({
			incidentId: "incident_123",
			status: "acked",
			ingestToken: "ingest_token",
		});
		expect(captureServerErrorMock).not.toHaveBeenCalled();
	});

	it("rejects unauthorized status changes", async () => {
		const { POST } = await import(
			"@/app/api/observability/incidents/[incidentId]/status/route"
		);

		const response = await POST(
			new Request(
				"https://example.test/api/observability/incidents/incident_123/status",
				{
					method: "POST",
					headers: {
						authorization: "Bearer wrong_token",
						"content-type": "application/json",
					},
					body: JSON.stringify({
						status: "resolved",
					}),
				},
			),
			{
				params: Promise.resolve({
					incidentId: "incident_123",
				}),
			},
		);

		expect(response.status).toBe(401);
		expect(updateIncidentStatusMock).not.toHaveBeenCalled();
	});

	it("rejects statuses outside the maintainer control subset", async () => {
		const { POST } = await import(
			"@/app/api/observability/incidents/[incidentId]/status/route"
		);

		const response = await POST(
			new Request(
				"https://example.test/api/observability/incidents/incident_123/status",
				{
					method: "POST",
					headers: {
						authorization: "Bearer control_token",
						"content-type": "application/json",
					},
					body: JSON.stringify({
						status: "regressed",
					}),
				},
			),
			{
				params: Promise.resolve({
					incidentId: "incident_123",
				}),
			},
		);

		expect(response.status).toBe(400);
		expect(updateIncidentStatusMock).not.toHaveBeenCalled();
	});

	it("captures missing control-token configuration", async () => {
		serverEnv.OBSERVABILITY_INCIDENT_CONTROL_TOKEN = undefined as never;
		const { POST } = await import(
			"@/app/api/observability/incidents/[incidentId]/status/route"
		);

		const response = await POST(
			new Request(
				"https://example.test/api/observability/incidents/incident_123/status",
				{
					method: "POST",
				},
			),
			{
				params: Promise.resolve({
					incidentId: "incident_123",
				}),
			},
		);

		expect(response.status).toBe(503);
		expect(captureServerErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "next_runtime",
				code: "incident_control_token_missing",
				surface: "config_drift",
			}),
		);
	});

	it("captures missing ingest-token transport configuration", async () => {
		serverEnv.OBSERVABILITY_INGEST_TOKEN = undefined as never;
		const { POST } = await import(
			"@/app/api/observability/incidents/[incidentId]/status/route"
		);

		const response = await POST(
			new Request(
				"https://example.test/api/observability/incidents/incident_123/status",
				{
					method: "POST",
					headers: {
						authorization: "Bearer control_token",
						"content-type": "application/json",
					},
					body: JSON.stringify({
						status: "acked",
					}),
				},
			),
			{
				params: Promise.resolve({
					incidentId: "incident_123",
				}),
			},
		);

		expect(response.status).toBe(503);
		expect(captureServerErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "next_runtime",
				code: "incident_status_transport_unconfigured",
				surface: "config_drift",
			}),
		);
	});

	it("captures backend update failures", async () => {
		updateIncidentStatusMock.mockRejectedValue(new Error("backend failed"));
		const { POST } = await import(
			"@/app/api/observability/incidents/[incidentId]/status/route"
		);

		const response = await POST(
			new Request(
				"https://example.test/api/observability/incidents/incident_123/status",
				{
					method: "POST",
					headers: {
						authorization: "Bearer control_token",
						"content-type": "application/json",
					},
					body: JSON.stringify({
						status: "firing",
					}),
				},
			),
			{
				params: Promise.resolve({
					incidentId: "incident_123",
				}),
			},
		);

		expect(response.status).toBe(502);
		expect(captureServerErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "convex",
				code: "incident_status_update_failed",
				surface: "health",
			}),
		);
	});
});
