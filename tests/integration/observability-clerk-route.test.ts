import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyWebhookMock = vi.fn();
const ingestErrorEventMock = vi.fn();
const captureServerErrorMock = vi.fn();

const serverEnv = {
	CLERK_WEBHOOK_SIGNING_SECRET: "whsec_test",
};

vi.mock("@clerk/backend/webhooks", () => ({
	verifyWebhook: (...args: unknown[]) => verifyWebhookMock(...args),
}));

vi.mock("@/features/observability/server/ingest-error-event", () => ({
	ingestErrorEvent: (input: unknown) => ingestErrorEventMock(input),
}));

vi.mock("@/features/observability/server/capture-server-error", () => ({
	captureServerError: (input: unknown) => captureServerErrorMock(input),
}));

vi.mock("@/platform/env/server", () => ({
	serverEnv,
}));

describe("POST /api/observability/clerk", () => {
	beforeEach(() => {
		verifyWebhookMock.mockReset();
		ingestErrorEventMock.mockReset();
		captureServerErrorMock.mockReset();
		serverEnv.CLERK_WEBHOOK_SIGNING_SECRET = "whsec_test";
	});

	it("records a high-signal Clerk webhook incident", async () => {
		verifyWebhookMock.mockResolvedValue({
			type: "session.revoked",
			object: "event",
			data: {
				id: "sess_123",
				user_id: "user_123",
				status: "revoked",
				user: null,
			},
			event_attributes: {
				http_request: {
					client_ip: "127.0.0.1",
					user_agent: "vitest",
				},
			},
		});

		const { POST } = await import("@/app/api/observability/clerk/route");

		const response = await POST(
			new Request("https://example.test/api/observability/clerk", {
				method: "POST",
			}),
		);

		expect(response.status).toBe(202);
		expect(ingestErrorEventMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "clerk",
				surface: "auth",
				code: "clerk_session_revoked",
			}),
		);
		expect(captureServerErrorMock).not.toHaveBeenCalled();
	});

	it("ignores routine Clerk webhook events", async () => {
		verifyWebhookMock.mockResolvedValue({
			type: "user.created",
			object: "event",
			data: {
				id: "user_123",
			},
			event_attributes: {
				http_request: {
					client_ip: "127.0.0.1",
					user_agent: "vitest",
				},
			},
		});

		const { POST } = await import("@/app/api/observability/clerk/route");

		const response = await POST(
			new Request("https://example.test/api/observability/clerk", {
				method: "POST",
			}),
		);

		expect(response.status).toBe(202);
		expect(ingestErrorEventMock).not.toHaveBeenCalled();
	});

	it("captures verification failures", async () => {
		verifyWebhookMock.mockRejectedValue(new Error("bad signature"));

		const { POST } = await import("@/app/api/observability/clerk/route");

		const response = await POST(
			new Request("https://example.test/api/observability/clerk", {
				method: "POST",
			}),
		);

		expect(response.status).toBe(400);
		expect(captureServerErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "clerk",
				code: "clerk_webhook_verification_failed",
				surface: "webhook",
			}),
		);
	});

	it("captures missing signing-secret configuration", async () => {
		serverEnv.CLERK_WEBHOOK_SIGNING_SECRET = undefined as never;

		const { POST } = await import("@/app/api/observability/clerk/route");

		const response = await POST(
			new Request("https://example.test/api/observability/clerk", {
				method: "POST",
			}),
		);

		expect(response.status).toBe(503);
		expect(captureServerErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				source: "clerk",
				code: "clerk_webhook_secret_missing",
				surface: "config_drift",
			}),
		);
		expect(verifyWebhookMock).not.toHaveBeenCalled();
	});
});
