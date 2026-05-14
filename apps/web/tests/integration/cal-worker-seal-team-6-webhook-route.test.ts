import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { syncWorkerSealTeam6CalWebhookToConvexMock } = vi.hoisted(() => ({
	syncWorkerSealTeam6CalWebhookToConvexMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/cal/worker-seal-team-6-webhook", async () => {
	const actual = await vi.importActual<
		typeof import("@/lib/cal/worker-seal-team-6-webhook")
	>("@/lib/cal/worker-seal-team-6-webhook");

	return {
		...actual,
		syncWorkerSealTeam6CalWebhookToConvex:
			syncWorkerSealTeam6CalWebhookToConvexMock,
	};
});

function signCalWebhookPayload(payload: string, secret: string) {
	return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

function createCalWebhookRequest({
	body = '{"triggerEvent":"BOOKING_PAID"}',
	signature,
}: {
	body?: string;
	signature?: string | null;
} = {}) {
	const headers = new Headers();
	if (signature !== null) {
		headers.set(
			"x-cal-signature-256",
			signature ?? signCalWebhookPayload(body, "cal_secret"),
		);
	}

	return new Request(
		"https://app.example.com/api/cal/worker-seal-team-6/webhook",
		{
			method: "POST",
			headers,
			body,
		},
	);
}

describe("POST /api/cal/worker-seal-team-6/webhook", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			CAL_WEBHOOK_SECRET: "cal_secret",
			CONVEX_WEBHOOK_MUTATION_SECRET:
				"convex_webhook_mutation_secret_1234567890",
		};
		syncWorkerSealTeam6CalWebhookToConvexMock.mockReset();
		syncWorkerSealTeam6CalWebhookToConvexMock.mockResolvedValue({
			kind: "booking_synced",
			eventId: "cal_event_123",
			calBookingUid: "booking_123",
			paidBookingReady: true,
		});
		vi.resetModules();
	});

	it("rejects requests without a Cal.com signature before sync starts", async () => {
		const { POST } =
			await import("../../src/app/api/cal/worker-seal-team-6/webhook/route");

		const response = await POST(createCalWebhookRequest({ signature: null }));

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "Missing Cal.com signature.",
		});
		expect(syncWorkerSealTeam6CalWebhookToConvexMock).not.toHaveBeenCalled();
	});

	it("rejects invalid Cal.com signatures before sync starts", async () => {
		const { POST } =
			await import("../../src/app/api/cal/worker-seal-team-6/webhook/route");

		const response = await POST(
			createCalWebhookRequest({ signature: "bad_signature" }),
		);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "Invalid Cal.com signature.",
		});
		expect(syncWorkerSealTeam6CalWebhookToConvexMock).not.toHaveBeenCalled();
	});

	it("fails closed when the Cal.com webhook secret is missing", async () => {
		delete process.env.CAL_WEBHOOK_SECRET;
		vi.resetModules();
		const { POST } =
			await import("../../src/app/api/cal/worker-seal-team-6/webhook/route");

		const response = await POST(createCalWebhookRequest());

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			error: "Cal.com webhook is not configured.",
		});
		expect(syncWorkerSealTeam6CalWebhookToConvexMock).not.toHaveBeenCalled();
	});

	it("rejects oversized Cal.com webhook bodies before sync starts", async () => {
		const body = "x".repeat(128 * 1024 + 1);
		const { POST } =
			await import("../../src/app/api/cal/worker-seal-team-6/webhook/route");

		const response = await POST(createCalWebhookRequest({ body }));

		expect(response.status).toBe(413);
		expect(await response.json()).toEqual({
			error: "Cal.com webhook body is too large.",
		});
		expect(syncWorkerSealTeam6CalWebhookToConvexMock).not.toHaveBeenCalled();
	});

	it("syncs verified Cal.com events to Convex", async () => {
		const body = '{"triggerEvent":"BOOKING_PAID","id":"cal_event_123"}';
		const { POST } =
			await import("../../src/app/api/cal/worker-seal-team-6/webhook/route");

		const response = await POST(createCalWebhookRequest({ body }));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			received: true,
			result: "booking_synced",
		});
		expect(syncWorkerSealTeam6CalWebhookToConvexMock).toHaveBeenCalledWith(
			body,
		);
	});

	it("returns a retryable failure when Convex sync fails", async () => {
		syncWorkerSealTeam6CalWebhookToConvexMock.mockRejectedValue(
			new Error("Convex unavailable"),
		);
		const { POST } =
			await import("../../src/app/api/cal/worker-seal-team-6/webhook/route");

		const response = await POST(createCalWebhookRequest());

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			error: "Unable to sync Cal.com booking event.",
		});
	});
});
