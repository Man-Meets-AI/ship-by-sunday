import { createHmac } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

const ingestErrorEventMock = vi.fn();
const captureServerErrorMock = vi.fn();

const serverEnv = {
	OBSERVABILITY_VERCEL_WEBHOOK_SECRET: "vercel_secret",
};

vi.mock("@/features/observability/server/ingest-error-event", () => ({
	ingestErrorEvent: (input: unknown) => ingestErrorEventMock(input),
}));

vi.mock("@/features/observability/server/capture-server-error", () => ({
	captureServerError: (input: unknown) => captureServerErrorMock(input),
}));

vi.mock("@/platform/env/server", () => ({
	serverEnv,
}));

describe("POST /api/observability/vercel", () => {
	beforeEach(() => {
		ingestErrorEventMock.mockReset();
		captureServerErrorMock.mockReset();
		serverEnv.OBSERVABILITY_VERCEL_WEBHOOK_SECRET = "vercel_secret";
	});

	it("records a failed production deployment incident", async () => {
		const { POST } = await import("@/app/api/observability/vercel/route");
		const body = JSON.stringify({
			type: "deployment.error",
			payload: {
				target: "production",
				deployment: {
					id: "dpl_123",
					name: "ship-by-sunday",
					url: "ship-by-sunday.vercel.app",
				},
				project: {
					id: "prj_123",
				},
				links: {
					deployment:
						"https://vercel.com/acme/ship-by-sunday/deployments/dpl_123",
					project: "https://vercel.com/acme/ship-by-sunday",
				},
			},
		});

		const response = await POST(
			new Request("https://example.test/api/observability/vercel", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-vercel-signature": signVercelWebhook(body, "vercel_secret"),
				},
				body,
			}),
		);

		expect(response.status).toBe(202);
		expect(ingestErrorEventMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "vercel",
				surface: "health",
				code: "vercel_deployment_failed",
				pathname: "/api/observability/vercel",
			}),
		);
		expect(captureServerErrorMock).not.toHaveBeenCalled();
	});

	it("ignores preview deployment events", async () => {
		const { POST } = await import("@/app/api/observability/vercel/route");
		const body = JSON.stringify({
			type: "deployment.canceled",
			payload: {
				target: "preview",
				deployment: {
					id: "dpl_preview",
				},
			},
		});

		const response = await POST(
			new Request("https://example.test/api/observability/vercel", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-vercel-signature": signVercelWebhook(body, "vercel_secret"),
				},
				body,
			}),
		);

		expect(response.status).toBe(202);
		expect(ingestErrorEventMock).not.toHaveBeenCalled();
		expect(captureServerErrorMock).not.toHaveBeenCalled();
	});

	it("captures invalid signatures", async () => {
		const { POST } = await import("@/app/api/observability/vercel/route");

		const response = await POST(
			new Request("https://example.test/api/observability/vercel", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-vercel-signature": "bad_signature",
				},
				body: JSON.stringify({ type: "deployment.error" }),
			}),
		);

		expect(response.status).toBe(400);
		expect(captureServerErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "vercel",
				code: "vercel_webhook_verification_failed",
				surface: "webhook",
			}),
		);
		expect(ingestErrorEventMock).not.toHaveBeenCalled();
	});

	it("captures missing signing-secret configuration", async () => {
		serverEnv.OBSERVABILITY_VERCEL_WEBHOOK_SECRET = undefined as never;
		const { POST } = await import("@/app/api/observability/vercel/route");

		const response = await POST(
			new Request("https://example.test/api/observability/vercel", {
				method: "POST",
			}),
		);

		expect(response.status).toBe(503);
		expect(captureServerErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "vercel",
				code: "vercel_webhook_secret_missing",
				surface: "config_drift",
			}),
		);
	});
});

function signVercelWebhook(body: string, secret: string) {
	return createHmac("sha1", secret).update(body).digest("hex");
}
