import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	requireProductAccessApiSessionMock,
	upsertViewerCodexConnectionMock,
	recordCodexRunMock,
	withCodexAppServerClientMock,
} = vi.hoisted(() => ({
	requireProductAccessApiSessionMock: vi.fn(),
	upsertViewerCodexConnectionMock: vi.fn(),
	recordCodexRunMock: vi.fn(),
	withCodexAppServerClientMock: vi.fn(),
}));

vi.mock("@/features/codex/server/route-helpers", async () => {
	const actual = await vi.importActual<
		typeof import("@/features/codex/server/route-helpers")
	>("@/features/codex/server/route-helpers");

	return {
		...actual,
		requireProductAccessApiSession: requireProductAccessApiSessionMock,
		upsertViewerCodexConnection: upsertViewerCodexConnectionMock,
		recordCodexRun: recordCodexRunMock,
	};
});

vi.mock("@/features/codex/server/app-server", async () => {
	const actual = await vi.importActual<
		typeof import("@/features/codex/server/app-server")
	>("@/features/codex/server/app-server");

	return {
		...actual,
		withCodexAppServerClient: withCodexAppServerClientMock,
	};
});

import { GET as getCodexLoginPoll } from "@/app/api/codex/account/login/poll/route";
import { POST as postCodexLoginStart } from "@/app/api/codex/account/login/start/route";
import { POST as postCodexLogout } from "@/app/api/codex/account/logout/route";
import { GET as getCodexAccountRead } from "@/app/api/codex/account/read/route";
import { GET as getCodexRateLimits } from "@/app/api/codex/account/rate-limits/route";
import { POST as postCodexGenerate } from "@/app/api/codex/generate/route";

function createRequest(url: string, init?: RequestInit) {
	return new Request(url, init);
}

describe("codex route handlers", () => {
	beforeEach(() => {
		requireProductAccessApiSessionMock.mockReset();
		upsertViewerCodexConnectionMock.mockReset();
		recordCodexRunMock.mockReset();
		withCodexAppServerClientMock.mockReset();
	});

	function mockClient<T extends Record<string, unknown>>(client: T) {
		withCodexAppServerClientMock.mockImplementation(async (_ctx, callback) =>
			callback(client),
		);
	}

	it("returns the account state and refreshes the viewer connection", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "chatgpt",
					email: "builder@example.com",
					planType: "plus",
				},
				requiresOpenaiAuth: false,
			}),
			readRateLimits: vi.fn().mockResolvedValue({
				rateLimits: {
					limitId: "main",
					limitName: "Main",
					primary: null,
					secondary: null,
					credits: null,
					planType: null,
				},
				rateLimitsByLimitId: {
					main: {
						limitId: "main",
						limitName: "Main",
						primary: null,
						secondary: null,
						credits: null,
						planType: null,
					},
				},
			}),
		});
		upsertViewerCodexConnectionMock.mockResolvedValue({
			connectionId: "connection_1",
			mode: "patched",
		});

		const response = await getCodexAccountRead(
			createRequest("https://example.test/api/codex/account/read"),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(body).toMatchObject({
			connected: true,
			requiresOpenaiAuth: false,
			account: {
				type: "chatgpt",
				email: "builder@example.com",
				planType: "plus",
			},
		});
		expect(upsertViewerCodexConnectionMock).toHaveBeenCalledWith(
			{ userId: "user_123", token: "token_123" },
			expect.objectContaining({
				status: "connected",
				account: {
					type: "chatgpt",
					email: "builder@example.com",
					planType: "plus",
				},
			}),
		);
	});

	it("starts Codex login and marks the viewer connection as connecting", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			loginStartManagedChatGPT: vi.fn().mockResolvedValue({
				loginId: "login_123",
				authUrl: "https://auth.example.test",
			}),
		});
		upsertViewerCodexConnectionMock.mockResolvedValue({
			connectionId: "connection_1",
			mode: "patched",
		});

		const response = await postCodexLoginStart(
			createRequest("https://example.test/api/codex/account/login/start", {
				method: "POST",
			}),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(body).toEqual({
			ok: true,
			loginId: "login_123",
			authUrl: "https://auth.example.test",
		});
		expect(upsertViewerCodexConnectionMock).toHaveBeenCalledWith(
			{ userId: "user_123", token: "token_123" },
			expect.objectContaining({
				status: "connecting",
				account: null,
				rateLimits: null,
			}),
		);
	});

	it("returns a mapped auth response when Codex access is missing", async () => {
		requireProductAccessApiSessionMock.mockRejectedValue(
			new Error("FORBIDDEN"),
		);

		const response = await postCodexLoginStart(
			createRequest("https://example.test/api/codex/account/login/start", {
				method: "POST",
			}),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(403);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(body).toEqual({
			error: "Product access is required before managing Codex connection.",
		});
		expect(withCodexAppServerClientMock).not.toHaveBeenCalled();
	});

	it("polls the login state using the pending login id and refresh flag", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "apiKey",
				},
				requiresOpenaiAuth: true,
			}),
		});
		upsertViewerCodexConnectionMock.mockResolvedValue({
			connectionId: "connection_1",
			mode: "patched",
		});

		const response = await getCodexLoginPoll(
			new Request(
				"https://example.test/api/codex/account/login/poll?loginId=login_123&refresh=true",
			),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(body).toEqual({
			connected: false,
			status: "connecting",
			account: {
				type: "apiKey",
			},
			rateLimits: null,
		});
		expect(upsertViewerCodexConnectionMock).toHaveBeenCalledWith(
			{ userId: "user_123", token: "token_123" },
			expect.objectContaining({
				status: "connecting",
				account: {
					type: "apiKey",
				},
				rateLimits: null,
			}),
		);
		expect(withCodexAppServerClientMock).toHaveBeenCalledTimes(1);
	});

	it("returns a mapped auth response when polling without access", async () => {
		requireProductAccessApiSessionMock.mockRejectedValue(
			new Error("FORBIDDEN"),
		);

		const response = await getCodexLoginPoll(
			createRequest("https://example.test/api/codex/account/login/poll"),
		);

		expect(response.status).toBe(403);
	});

	it("disconnects the Codex account and clears the viewer connection", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			logout: vi.fn().mockResolvedValue(undefined),
		});
		upsertViewerCodexConnectionMock.mockResolvedValue({
			connectionId: "connection_1",
			mode: "patched",
		});

		const response = await postCodexLogout(
			createRequest("https://example.test/api/codex/account/logout", {
				method: "POST",
			}),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(body).toEqual({
			ok: true,
			connected: false,
		});
		expect(upsertViewerCodexConnectionMock).toHaveBeenCalledWith(
			{ userId: "user_123", token: "token_123" },
			expect.objectContaining({
				status: "disconnected",
				account: null,
				rateLimits: null,
			}),
		);
	});

	it("returns a mapped auth response when logout access is missing", async () => {
		requireProductAccessApiSessionMock.mockRejectedValue(
			new Error("FORBIDDEN"),
		);

		const response = await postCodexLogout(
			createRequest("https://example.test/api/codex/account/logout", {
				method: "POST",
			}),
		);

		expect(response.status).toBe(403);
		expect(response.headers.get("x-request-id")).toBeTruthy();
	});

	it("returns a disconnected rate-limit state for non-managed accounts", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "apiKey",
				},
			}),
		});
		upsertViewerCodexConnectionMock.mockResolvedValue({
			connectionId: "connection_1",
			mode: "patched",
		});

		const response = await getCodexRateLimits(
			createRequest("https://example.test/api/codex/account/rate-limits"),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(body).toEqual({
			connected: false,
			rateLimits: null,
		});
		expect(upsertViewerCodexConnectionMock).toHaveBeenCalledWith(
			{ userId: "user_123", token: "token_123" },
			expect.objectContaining({
				status: "disconnected",
				account: {
					type: "apiKey",
				},
				rateLimits: null,
			}),
		);
	});

	it("returns live rate limits for managed Codex accounts", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "chatgpt",
					email: "builder@example.com",
					planType: "plus",
				},
			}),
			readRateLimits: vi.fn().mockResolvedValue({
				rateLimits: { limitId: "main", limitName: "Main" },
				rateLimitsByLimitId: { main: { limitId: "main", limitName: "Main" } },
			}),
		});

		const response = await getCodexRateLimits(
			createRequest("https://example.test/api/codex/account/rate-limits"),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(200);
		expect(body).toMatchObject({
			connected: true,
		});
	});

	it("rejects malformed generation payloads before contacting Codex", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});

		const response = await postCodexGenerate(
			new Request("https://example.test/api/codex/generate", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					templateId: "competitor_research",
				}),
			}),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(body).toEqual({
			error: "Invalid generation payload.",
		});
		expect(withCodexAppServerClientMock).not.toHaveBeenCalled();
		expect(recordCodexRunMock).not.toHaveBeenCalled();
	});

	it("rejects invalid JSON generation payloads before contacting Codex", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});

		const response = await postCodexGenerate(
			new Request("https://example.test/api/codex/generate", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: "{not-json",
			}),
		);

		expect(response.status).toBe(400);
		expect(withCodexAppServerClientMock).not.toHaveBeenCalled();
	});

	it("returns a disconnected error when the account is not attached yet", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "apiKey",
				},
			}),
		});
		upsertViewerCodexConnectionMock.mockResolvedValue({
			connectionId: "connection_1",
			mode: "patched",
		});
		recordCodexRunMock.mockResolvedValue({
			runId: "run_1",
			createdAt: 100,
		});

		const response = await postCodexGenerate(
			new Request("https://example.test/api/codex/generate", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					templateId: "competitor_research",
					prompt: "Research the offer",
				}),
			}),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(409);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(body).toEqual({
			error: "Connect your Codex account in Settings before generating.",
			code: "account_not_connected",
		});
		expect(recordCodexRunMock).toHaveBeenCalledWith(
			{ userId: "user_123", token: "token_123" },
			expect.objectContaining({
				templateId: "competitor_research",
				lessonId: undefined,
				status: "error",
				errorCode: "account_not_connected",
			}),
		);
	});

	it("returns trimmed generated output and records a successful run", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "chatgpt",
					email: "builder@example.com",
					planType: "plus",
				},
			}),
			generateText: vi.fn().mockResolvedValue({
				status: "completed",
				text: "  Output text  ",
				errorMessage: null,
			}),
			readRateLimits: vi.fn().mockResolvedValue({
				rateLimits: {
					limitId: "main",
					limitName: "Main",
					primary: null,
					secondary: null,
					credits: null,
					planType: null,
				},
				rateLimitsByLimitId: null,
			}),
		});
		upsertViewerCodexConnectionMock.mockResolvedValue({
			connectionId: "connection_1",
			mode: "patched",
		});
		recordCodexRunMock.mockResolvedValue({
			runId: "run_1",
			createdAt: 100,
		});

		const response = await postCodexGenerate(
			new Request("https://example.test/api/codex/generate", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					templateId: "competitor_research",
					prompt: "Research the offer",
					lessonId: "1.1",
				}),
			}),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(body).toMatchObject({
			ok: true,
			output: "Output text",
			account: {
				type: "chatgpt",
				email: "builder@example.com",
				planType: "plus",
			},
		});
		expect(recordCodexRunMock).toHaveBeenCalledWith(
			{ userId: "user_123", token: "token_123" },
			expect.objectContaining({
				templateId: "competitor_research",
				lessonId: "1.1",
				status: "success",
			}),
		);
	});

	it("returns a request-tagged 500 when polling fails unexpectedly", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockRejectedValue(new Error("boom")),
		});

		const response = await getCodexLoginPoll(
			createRequest(
				"https://example.test/api/codex/account/login/poll?loginId=login_123",
			),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(500);
		expect(body.requestId).toBeTruthy();
		expect(body.code).toBe("server_error");
	});

	it("returns a connected poll state when the account is already attached", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "chatgpt",
					email: "builder@example.com",
					planType: "plus",
				},
			}),
			readRateLimits: vi.fn().mockResolvedValue({
				rateLimits: { limitId: "main", limitName: "Main" },
				rateLimitsByLimitId: { main: { limitId: "main", limitName: "Main" } },
			}),
		});

		const response = await getCodexLoginPoll(
			createRequest("https://example.test/api/codex/account/login/poll"),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(body).toMatchObject({
			connected: true,
			status: "connected",
		});
	});

	it("returns a request-tagged 500 when reading the account fails unexpectedly", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockRejectedValue(new Error("boom")),
		});

		const response = await getCodexAccountRead(
			createRequest("https://example.test/api/codex/account/read"),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(500);
		expect(body.requestId).toBeTruthy();
	});

	it("returns a disconnected account state when the Codex account is not attached", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "apiKey",
				},
				requiresOpenaiAuth: true,
			}),
		});

		const response = await getCodexAccountRead(
			createRequest("https://example.test/api/codex/account/read"),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(body).toMatchObject({
			connected: false,
			account: {
				type: "apiKey",
			},
		});
	});

	it("returns a mapped auth response when reading the account without access", async () => {
		requireProductAccessApiSessionMock.mockRejectedValue(
			new Error("FORBIDDEN"),
		);

		const response = await getCodexAccountRead(
			createRequest("https://example.test/api/codex/account/read"),
		);

		expect(response.status).toBe(403);
	});

	it("returns a request-tagged 500 when login start fails unexpectedly", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			loginStartManagedChatGPT: vi.fn().mockRejectedValue(new Error("boom")),
		});

		const response = await postCodexLoginStart(
			createRequest("https://example.test/api/codex/account/login/start", {
				method: "POST",
			}),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(500);
		expect(body.requestId).toBeTruthy();
	});

	it("returns a request-tagged 500 when logout fails unexpectedly", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			logout: vi.fn().mockRejectedValue(new Error("boom")),
		});

		const response = await postCodexLogout(
			createRequest("https://example.test/api/codex/account/logout", {
				method: "POST",
			}),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(500);
		expect(body.requestId).toBeTruthy();
	});

	it("returns a request-tagged 500 when reading rate limits fails unexpectedly", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "chatgpt",
					email: "builder@example.com",
					planType: "plus",
				},
			}),
			readRateLimits: vi.fn().mockRejectedValue(new Error("boom")),
		});

		const response = await getCodexRateLimits(
			createRequest("https://example.test/api/codex/account/rate-limits"),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(500);
		expect(body.requestId).toBeTruthy();
	});

	it("returns a mapped auth response when rate limits are forbidden", async () => {
		requireProductAccessApiSessionMock.mockRejectedValue(
			new Error("FORBIDDEN"),
		);

		const response = await getCodexRateLimits(
			createRequest("https://example.test/api/codex/account/rate-limits"),
		);

		expect(response.status).toBe(403);
	});

	it("returns a generation failure when Codex does not complete", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "chatgpt",
					email: "builder@example.com",
					planType: "plus",
				},
			}),
			generateText: vi.fn().mockResolvedValue({
				status: "failed",
				text: " ",
				errorMessage: "The model failed.",
			}),
			readRateLimits: vi.fn().mockResolvedValue({
				rateLimits: {
					limitId: "main",
					limitName: "Main",
					primary: null,
					secondary: null,
					credits: null,
					planType: null,
				},
				rateLimitsByLimitId: null,
			}),
		});
		upsertViewerCodexConnectionMock.mockResolvedValue({
			connectionId: "connection_1",
			mode: "patched",
		});
		recordCodexRunMock.mockResolvedValue({
			runId: "run_1",
			createdAt: 100,
		});

		const response = await postCodexGenerate(
			new Request("https://example.test/api/codex/generate", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					templateId: "competitor_research",
					prompt: "Research the offer",
				}),
			}),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(502);
		expect(response.headers.get("x-request-id")).toBeTruthy();
		expect(body).toMatchObject({
			error: "The model failed.",
			code: "generation_failed",
		});
		expect(body.requestId).toBeTruthy();
		expect(recordCodexRunMock).toHaveBeenCalledWith(
			{ userId: "user_123", token: "token_123" },
			expect.objectContaining({
				templateId: "competitor_research",
				status: "error",
				errorCode: "generation_failed",
			}),
		);
	});

	it("handles rate-limit refresh failures after a successful generation", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "chatgpt",
					email: "builder@example.com",
					planType: "plus",
				},
			}),
			generateText: vi.fn().mockResolvedValue({
				status: "completed",
				text: " Output text ",
				errorMessage: null,
			}),
			readRateLimits: vi
				.fn()
				.mockRejectedValue(new Error("rate limits failed")),
		});
		upsertViewerCodexConnectionMock.mockResolvedValue({
			connectionId: "connection_1",
			mode: "patched",
		});
		recordCodexRunMock.mockResolvedValue({
			runId: "run_1",
			createdAt: 100,
		});

		const response = await postCodexGenerate(
			new Request("https://example.test/api/codex/generate", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					templateId: "competitor_research",
					prompt: "Research the offer",
				}),
			}),
		);

		expect(response.status).toBe(200);
	});

	it("returns a mapped auth response when generation access is missing", async () => {
		requireProductAccessApiSessionMock.mockRejectedValue(
			new Error("FORBIDDEN"),
		);

		const response = await postCodexGenerate(
			new Request("https://example.test/api/codex/generate", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					templateId: "competitor_research",
					prompt: "Research the offer",
				}),
			}),
		);

		expect(response.status).toBe(403);
	});

	it("returns a request-tagged 500 when generation crashes unexpectedly", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "chatgpt",
					email: "builder@example.com",
					planType: "plus",
				},
			}),
			generateText: vi.fn().mockRejectedValue(new Error("boom")),
		});
		recordCodexRunMock.mockResolvedValue({
			runId: "run_1",
			createdAt: 100,
		});

		const response = await postCodexGenerate(
			new Request("https://example.test/api/codex/generate", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					templateId: "competitor_research",
					prompt: "Research the offer",
					lessonId: "1.1",
				}),
			}),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(500);
		expect(body.requestId).toBeTruthy();
		expect(body.code).toBe("server_error");
	});

	it("captures persistence failures while still returning the original generate error", async () => {
		requireProductAccessApiSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		mockClient({
			readAccount: vi.fn().mockResolvedValue({
				account: {
					type: "chatgpt",
					email: "builder@example.com",
					planType: "plus",
				},
			}),
			generateText: vi.fn().mockRejectedValue(new Error("boom")),
		});
		recordCodexRunMock.mockRejectedValue(new Error("persist failed"));

		const response = await postCodexGenerate(
			new Request("https://example.test/api/codex/generate", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					templateId: "competitor_research",
					prompt: "Research the offer",
					lessonId: "1.1",
				}),
			}),
		);

		expect(response.status).toBe(500);
	});
});
