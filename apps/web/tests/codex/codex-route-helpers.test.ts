import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, fetchQueryMock, fetchMutationMock, serverEnv } = vi.hoisted(
	() => ({
		authMock: vi.fn(),
		fetchQueryMock: vi.fn(),
		fetchMutationMock: vi.fn(),
		serverEnv: {
			CODEX_APP_SERVER_MODEL: undefined as string | undefined,
			CODEX_APP_SERVER_TIMEOUT_MS: undefined as string | undefined,
		},
	}),
);

vi.mock("@/platform/env/server", () => ({
	serverEnv,
}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
}));

vi.mock("convex/nextjs", () => ({
	fetchQuery: fetchQueryMock,
	fetchMutation: fetchMutationMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		access: {
			viewerProductAccess: "access.viewerProductAccess",
		},
		codex: {
			upsertViewerConnection: "codex.upsertViewerConnection",
			recordRun: "codex.recordRun",
		},
	},
}));

import {
	API_FORBIDDEN_ERROR,
	API_UNAUTHORIZED_ERROR,
	accountIsManagedChatGpt,
	getApiAuthErrorResponse,
	getCodexDefaultModel,
	getCodexTurnTimeoutMs,
	recordCodexRun,
	requireApiSession,
	requireProductAccessApiSession,
	upsertViewerCodexConnection,
} from "@/features/codex/server/route-helpers";

describe("codex route helpers", () => {
	beforeEach(() => {
		authMock.mockReset();
		fetchQueryMock.mockReset();
		fetchMutationMock.mockReset();
		serverEnv.CODEX_APP_SERVER_MODEL = undefined;
		serverEnv.CODEX_APP_SERVER_TIMEOUT_MS = undefined;
	});

	it("falls back to the default turn timeout and null model when env values are absent", () => {
		expect(getCodexTurnTimeoutMs()).toBe(60_000);
		expect(getCodexDefaultModel()).toBeNull();
	});

	it("uses explicit Codex runtime env values when provided", () => {
		serverEnv.CODEX_APP_SERVER_MODEL = "gpt-5.4";
		serverEnv.CODEX_APP_SERVER_TIMEOUT_MS = "45000";

		expect(getCodexTurnTimeoutMs()).toBe(45_000);
		expect(getCodexDefaultModel()).toBe("gpt-5.4");
	});

	it("maps auth and deployment errors to API responses", async () => {
		const unauthorized = await getApiAuthErrorResponse(
			new Error(API_UNAUTHORIZED_ERROR),
			{
				unauthorized: "Sign in first.",
				forbidden: "No access.",
				unavailable: "Unavailable.",
			},
			"request_1",
		);
		const forbidden = await getApiAuthErrorResponse(
			new Error(API_FORBIDDEN_ERROR),
			{
				unauthorized: "Sign in first.",
				forbidden: "No access.",
				unavailable: "Unavailable.",
			},
			"request_2",
		);
		const unavailable = await getApiAuthErrorResponse(
			new Error("CODEX_APP_SERVER_DISABLED"),
			{
				unauthorized: "Sign in first.",
				forbidden: "No access.",
				unavailable: "Unavailable.",
			},
			"request_3",
		);

		expect(await unauthorized?.json()).toEqual({ error: "Sign in first." });
		expect(unauthorized?.status).toBe(401);
		expect(unauthorized?.headers.get("x-request-id")).toBe("request_1");
		expect(await forbidden?.json()).toEqual({ error: "No access." });
		expect(forbidden?.status).toBe(403);
		expect(forbidden?.headers.get("x-request-id")).toBe("request_2");
		expect(await unavailable?.json()).toEqual({
			error: "Unavailable.",
			requestId: "request_3",
		});
		expect(unavailable?.status).toBe(503);
		expect(unavailable?.headers.get("x-request-id")).toBe("request_3");
		expect(
			getApiAuthErrorResponse(
				"nope",
				{
					unauthorized: "Sign in first.",
					forbidden: "No access.",
					unavailable: "Unavailable.",
				},
				"request_4",
			),
		).toBeNull();
	});

	it("requires an authenticated Clerk session before continuing", async () => {
		authMock.mockResolvedValue({ userId: null });

		await expect(requireApiSession()).rejects.toThrow(API_UNAUTHORIZED_ERROR);
		expect(authMock).toHaveBeenCalledTimes(1);
		expect(fetchQueryMock).not.toHaveBeenCalled();
	});

	it("rejects sessions that do not produce a Convex token", async () => {
		authMock.mockResolvedValue({
			userId: "user_123",
			getToken: vi.fn().mockResolvedValue(null),
		});

		await expect(requireApiSession()).rejects.toThrow(API_UNAUTHORIZED_ERROR);
	});

	it("requires a Clerk token and the access check before allowing Codex actions", async () => {
		authMock.mockResolvedValue({
			userId: "user_123",
			getToken: vi.fn().mockResolvedValue("token_123"),
		});
		fetchQueryMock.mockResolvedValue({
			hasAccess: true,
			status: "granted",
		});

		await expect(requireProductAccessApiSession()).resolves.toEqual({
			userId: "user_123",
			token: "token_123",
		});
		expect(fetchQueryMock).toHaveBeenCalledWith(
			"access.viewerProductAccess",
			{},
			{ token: "token_123" },
		);
	});

	it("rejects unauthorised access before the product-access lookup", async () => {
		authMock.mockResolvedValue({
			userId: "user_123",
			getToken: vi.fn().mockResolvedValue("token_123"),
		});
		fetchQueryMock.mockResolvedValue({
			hasAccess: false,
			status: "no_access",
		});

		await expect(requireProductAccessApiSession()).rejects.toThrow(
			API_FORBIDDEN_ERROR,
		);
	});

	it("returns the account shape used by the Codex routes", () => {
		expect(
			accountIsManagedChatGpt({
				type: "chatgpt",
				email: "builder@example.com",
				planType: "plus",
			}),
		).toBe(true);
		expect(accountIsManagedChatGpt({ type: "apiKey" })).toBe(false);
		expect(accountIsManagedChatGpt(null)).toBe(false);
	});

	it("upserts Codex connection state with the active session token", async () => {
		const session = { userId: "user_123", token: "token_123" };
		fetchMutationMock.mockResolvedValue({
			connectionId: "connection_1",
			mode: "inserted",
		});

		await expect(
			upsertViewerCodexConnection(session, {
				status: "connected",
				account: {
					type: "chatgpt",
					email: "builder@example.com",
					planType: "plus",
				},
				rateLimits: {
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
				},
			}),
		).resolves.toEqual({
			connectionId: "connection_1",
			mode: "inserted",
		});
		expect(fetchMutationMock).toHaveBeenCalledWith(
			"codex.upsertViewerConnection",
			expect.objectContaining({
				authMode: "managed_chatgpt",
				status: "connected",
				accountId: "builder@example.com",
				planType: "plus",
				connectedAt: expect.any(Number),
				lastRateLimitSnapshot: {
					main: expect.any(Object),
				},
			}),
			{ token: "token_123" },
		);
	});

	it("records Codex runs without mutating the session payload", async () => {
		const session = { userId: "user_123", token: "token_123" };
		fetchMutationMock.mockResolvedValue({
			runId: "run_1",
			createdAt: 123,
		});

		await expect(
			recordCodexRun(session, {
				templateId: "competitor_research",
				lessonId: "1.1",
				status: "success",
				latencyMs: 1234,
			}),
		).resolves.toEqual({
			runId: "run_1",
			createdAt: 123,
		});
		expect(fetchMutationMock).toHaveBeenCalledWith(
			"codex.recordRun",
			{
				lessonId: "1.1",
				templateId: "competitor_research",
				status: "success",
				latencyMs: 1234,
				errorCode: undefined,
			},
			{ token: "token_123" },
		);
	});
});
