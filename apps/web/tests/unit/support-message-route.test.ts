import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	getConvexServerSessionMock,
	fetchActionMock,
	fetchMutationMock,
	fetchQueryMock,
} = vi.hoisted(() => ({
	getConvexServerSessionMock: vi.fn(),
	fetchActionMock: vi.fn(),
	fetchMutationMock: vi.fn(),
	fetchQueryMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/platform/auth/convex-auth", () => ({
	getConvexServerSession: getConvexServerSessionMock,
}));

vi.mock("convex/nextjs", () => ({
	fetchAction: fetchActionMock,
	fetchMutation: fetchMutationMock,
	fetchQuery: fetchQueryMock,
}));

function createThreadState() {
	return {
		status: "open",
		supportId: "SBS-0506-1234",
		messages: [],
		fallbackHref: "https://t.me/parkerrex",
		error: null,
	};
}

describe("support message route", () => {
	beforeEach(() => {
		getConvexServerSessionMock.mockReset();
		fetchActionMock.mockReset();
		fetchMutationMock.mockReset();
		fetchQueryMock.mockReset();
		fetchQueryMock.mockResolvedValue(createThreadState());
		fetchActionMock.mockResolvedValue(createThreadState());
		fetchMutationMock.mockResolvedValue("https://storage.example/upload");
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "convex-auth-token",
		});
	});

	it("keeps the support session token in an HttpOnly cookie for reads", async () => {
		const { GET } = await import("@/app/api/support/messages/route");

		const response = await GET(
			new Request("https://example.test/api/support/messages"),
		);
		const body = await response.json();
		const setCookieHeader = response.headers.get("set-cookie");
		const cookieValue = setCookieHeader?.match(
			/__Host-sbs_support_session=([^;]+)/,
		)?.[1];

		expect(response.status).toBe(200);
		expect(response.headers.get("cache-control")).toBe("no-store");
		expect(body).toEqual(createThreadState());
		expect(setCookieHeader).toContain("HttpOnly");
		expect(fetchQueryMock).toHaveBeenCalledWith(expect.anything(), {
			sessionToken: cookieValue,
		});
	});

	it("issues a browser-visible realtime capability without exposing the session token", async () => {
		fetchMutationMock.mockResolvedValueOnce({
			capabilityToken: "r".repeat(64),
			expiresAt: 1_764_566_400_000,
		});
		const { GET } = await import("@/app/api/support/session/route");

		const response = await GET(
			new Request("https://example.test/api/support/session"),
		);
		const body = await response.json();
		const setCookieHeader = response.headers.get("set-cookie");
		const cookieValue = setCookieHeader?.match(
			/__Host-sbs_support_session=([^;]+)/,
		)?.[1];

		expect(response.status).toBe(200);
		expect(setCookieHeader).toContain("HttpOnly");
		expect(body).toEqual({
			ok: true,
			realtime: {
				kind: "convex",
				capabilityToken: "r".repeat(64),
				expiresAt: 1_764_566_400_000,
			},
		});
		expect(JSON.stringify(body)).not.toContain(cookieValue ?? "missing");
		expect(fetchMutationMock).toHaveBeenCalledWith(expect.anything(), {
			sessionToken: cookieValue,
		});
	});

	it("keeps the session route available when realtime capability issuance fails", async () => {
		fetchMutationMock.mockRejectedValueOnce(new Error("convex unavailable"));
		const { GET } = await import("@/app/api/support/session/route");

		const response = await GET(
			new Request("https://example.test/api/support/session"),
		);

		await expect(response.json()).resolves.toEqual({
			ok: true,
			realtime: {
				kind: "unavailable",
			},
		});
		expect(response.status).toBe(200);
		expect(response.headers.get("set-cookie")).toContain("HttpOnly");
	});

	it("returns realtime unavailable when the support session has no thread", async () => {
		fetchMutationMock.mockResolvedValueOnce(null);
		const { GET } = await import("@/app/api/support/session/route");

		const response = await GET(
			new Request("https://example.test/api/support/session"),
		);

		await expect(response.json()).resolves.toEqual({
			ok: true,
			realtime: {
				kind: "unavailable",
			},
		});
		expect(response.status).toBe(200);
		expect(response.headers.get("set-cookie")).toContain("HttpOnly");
	});

	it("sends messages with the existing cookie token and no browser-held bearer", async () => {
		const { POST } = await import("@/app/api/support/messages/route");
		const existingToken = "b".repeat(64);

		const response = await POST(
			new Request("https://example.test/api/support/messages", {
				method: "POST",
				headers: {
					cookie: `__Host-sbs_support_session=${existingToken}`,
					"content-type": "application/json",
				},
				body: JSON.stringify({
					messageText: "Can this help my SaaS?",
					pagePath: "/",
				}),
			}),
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("set-cookie")).toBeNull();
		expect(fetchActionMock).toHaveBeenCalledWith(
			expect.anything(),
			{
				sessionToken: existingToken,
				messageText: "Can this help my SaaS?",
				pagePath: "/",
				entrySurface: "homepage_support_widget",
				attachment: null,
			},
			{ token: "convex-auth-token" },
		);
	});

	it("does not pass client-forgeable Clerk ids to Convex", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: null,
			token: null,
		});
		const { POST } = await import("@/app/api/support/messages/route");

		await POST(
			new Request("https://example.test/api/support/messages", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					messageText: "Can this help my SaaS?",
					pagePath: "/",
					clerkUserId: "user_forged",
				}),
			}),
		);

		expect(fetchActionMock).toHaveBeenCalledWith(expect.anything(), {
			sessionToken: expect.any(String),
			messageText: "Can this help my SaaS?",
			pagePath: "/",
			entrySurface: "homepage_support_widget",
			attachment: null,
		});
	});

	it("returns the direct Telegram fallback when Convex support reads are unavailable", async () => {
		fetchQueryMock.mockRejectedValue(new Error("support function missing"));
		const { GET } = await import("@/app/api/support/messages/route");

		const response = await GET(
			new Request("https://example.test/api/support/messages"),
		);

		await expect(response.json()).resolves.toEqual({
			status: "disabled",
			supportId: null,
			messages: [],
			fallbackHref: "https://t.me/parkerrex",
			error: "Ship by Sunday support is using Telegram directly right now.",
		});
		expect(response.status).toBe(200);
	});

	it("returns closed thread state from the support session read path", async () => {
		fetchQueryMock.mockResolvedValue({
			status: "closed",
			supportId: "SBS-0506-1234",
			messages: [
				{
					id: "message_1",
					source: "visitor",
					body: "Question",
					attachment: null,
					createdAt: 1,
					deliveryStatus: "delivered_to_parker",
					deliveryFailureClass: null,
				},
			],
			fallbackHref: "https://t.me/parkerrex",
			error: null,
		});
		const { GET } = await import("@/app/api/support/messages/route");

		const response = await GET(
			new Request("https://example.test/api/support/messages"),
		);

		await expect(response.json()).resolves.toMatchObject({
			status: "closed",
			supportId: "SBS-0506-1234",
			messages: [expect.objectContaining({ body: "Question" })],
		});
		expect(response.status).toBe(200);
	});

	it("does not treat a closed thread send as a server failure", async () => {
		fetchActionMock.mockRejectedValue(new Error("Support thread is closed."));
		const { POST } = await import("@/app/api/support/messages/route");

		const response = await POST(
			new Request("https://example.test/api/support/messages", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({ messageText: "Can I keep going?" }),
			}),
		);

		await expect(response.json()).resolves.toEqual({
			error: "This support thread is closed.",
		});
		expect(response.status).toBe(409);
	});

	it("rejects empty messages before calling Convex", async () => {
		const { POST } = await import("@/app/api/support/messages/route");

		const response = await POST(
			new Request("https://example.test/api/support/messages", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({ messageText: "   " }),
			}),
		);

		expect(response.status).toBe(400);
		expect(fetchActionMock).not.toHaveBeenCalled();
		expect(response.headers.get("set-cookie")).toContain("HttpOnly");
	});

	it("prepares screenshot uploads through the server-held support session", async () => {
		const { POST } = await import("@/app/api/support/attachments/route");
		const existingToken = "c".repeat(64);

		const response = await POST(
			new Request("https://example.test/api/support/attachments", {
				method: "POST",
				headers: {
					cookie: `__Host-sbs_support_session=${existingToken}`,
					"content-type": "application/json",
				},
				body: JSON.stringify({
					fileName: "checkout-stall.png",
					contentType: "image/png",
					size: 1234,
				}),
			}),
		);

		await expect(response.json()).resolves.toEqual({
			uploadUrl: "https://storage.example/upload",
		});
		expect(response.status).toBe(200);
		expect(response.headers.get("set-cookie")).toBeNull();
		expect(fetchMutationMock).toHaveBeenCalledWith(expect.anything(), {
			sessionToken: existingToken,
			fileName: "checkout-stall.png",
			contentType: "image/png",
			size: 1234,
		});
	});
});
