import { afterEach, describe, expect, it, vi } from "vitest";

import {
	getViewerConnection,
	recordRun,
	upsertViewerConnection,
} from "@/convex/codex";

const clerkUserId = "user_codex_123";

function createCodexCtx({
	connectionDocs = [],
	insert = vi.fn().mockResolvedValue("inserted_id"),
	patch = vi.fn().mockResolvedValue(undefined),
	deleteMock = vi.fn().mockResolvedValue(undefined),
}: {
	connectionDocs?: Array<Record<string, unknown>>;
	insert?: ReturnType<typeof vi.fn>;
	patch?: ReturnType<typeof vi.fn>;
	deleteMock?: ReturnType<typeof vi.fn>;
} = {}) {
	return {
		auth: {
			getUserIdentity: vi.fn().mockResolvedValue({ subject: clerkUserId }),
		},
		db: {
			query: vi.fn((table: string) => {
				if (table !== "codexConnections") {
					throw new Error(`Unexpected table query: ${table}`);
				}

				return {
					withIndex: vi.fn(() => ({
						collect: vi.fn().mockResolvedValue(connectionDocs),
					})),
				};
			}),
			insert,
			patch,
			delete: deleteMock,
		},
	};
}

describe("convex/codex", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns the newest Codex connection for the active viewer", async () => {
		const ctx = createCodexCtx({
			connectionDocs: [
				{
					_id: "old_connection",
					updatedAt: 10,
					clerkUserId,
					status: "disconnected",
				},
				{
					_id: "new_connection",
					updatedAt: 20,
					clerkUserId,
					status: "connected",
				},
			],
		});

		const result = await getViewerConnection._handler(ctx as never);

		expect(result).toMatchObject({
			_id: "new_connection",
			status: "connected",
		});
	});

	it("patches the latest connection and removes duplicates when one already exists", async () => {
		const patch = vi.fn().mockResolvedValue(undefined);
		const deleteMock = vi.fn().mockResolvedValue(undefined);
		const ctx = createCodexCtx({
			connectionDocs: [
				{
					_id: "old_connection",
					updatedAt: 10,
					clerkUserId,
					authMode: "managed_chatgpt",
					status: "disconnected",
				},
				{
					_id: "latest_connection",
					updatedAt: 30,
					clerkUserId,
					authMode: "managed_chatgpt",
					status: "connected",
				},
			],
			patch,
			deleteMock,
		});

		vi.spyOn(Date, "now").mockReturnValue(12345);

		const result = await upsertViewerConnection._handler(ctx as never, {
			authMode: "managed_chatgpt",
			status: "connected",
			accountId: "builder@example.com",
			planType: "plus",
			connectedAt: 999,
			lastRateLimitSnapshot: { main: { usedPercent: 12 } },
		});

		expect(result).toEqual({
			connectionId: "latest_connection",
			updatedAt: 12345,
			mode: "patched",
		});
		expect(patch).toHaveBeenCalledWith(
			"latest_connection",
			expect.objectContaining({
				status: "connected",
				accountId: "builder@example.com",
				planType: "plus",
				connectedAt: 999,
				lastRateLimitSnapshot: { main: { usedPercent: 12 } },
				updatedAt: 12345,
			}),
		);
		expect(deleteMock).toHaveBeenCalledWith("old_connection");
	});

	it("inserts a new Codex connection when the viewer has none", async () => {
		const insert = vi.fn().mockResolvedValue("new_connection");
		const ctx = createCodexCtx({
			connectionDocs: [],
			insert,
		});

		vi.spyOn(Date, "now").mockReturnValue(24680);

		const result = await upsertViewerConnection._handler(ctx as never, {
			authMode: "managed_chatgpt",
			status: "disconnected",
			accountId: undefined,
			planType: undefined,
			lastRateLimitSnapshot: null,
		});

		expect(result).toEqual({
			connectionId: "new_connection",
			updatedAt: 24680,
			mode: "inserted",
		});
		expect(insert).toHaveBeenCalledWith(
			"codexConnections",
			expect.objectContaining({
				clerkUserId,
				authMode: "managed_chatgpt",
				status: "disconnected",
				accountId: undefined,
				planType: undefined,
				lastRateLimitSnapshot: null,
				updatedAt: 24680,
			}),
		);
	});

	it("records Codex runs with the viewer identity and execution metadata", async () => {
		const insert = vi.fn().mockResolvedValue("run_1");
		const ctx = {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({ subject: clerkUserId }),
			},
			db: {
				insert,
			},
		};

		vi.spyOn(Date, "now").mockReturnValue(55555);

		const result = await recordRun._handler(ctx as never, {
			templateId: "competitor_research",
			status: "error",
			lessonId: "1.2",
			latencyMs: 987,
			errorCode: "account_not_connected",
		});

		expect(result).toEqual({
			runId: "run_1",
			createdAt: 55555,
		});
		expect(insert).toHaveBeenCalledWith(
			"codexRuns",
			expect.objectContaining({
				userId: clerkUserId,
				templateId: "competitor_research",
				status: "error",
				lessonId: "1.2",
				latencyMs: 987,
				errorCode: "account_not_connected",
				createdAt: 55555,
			}),
		);
	});
});
