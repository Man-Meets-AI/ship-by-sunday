import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("support admin actions", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = { ...originalEnv };
		process.env.TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN = "recovery-secret";
		vi.restoreAllMocks();
	});

	afterEach(() => {
		process.env = { ...originalEnv };
	});

	it("protects the operations snapshot with the recovery token", async () => {
		const { getOperationsSnapshot } = await import("@/convex/supportAdmin");
		const action = getOperationsSnapshot as unknown as {
			_handler: (
				ctx: {
					runMutation: ReturnType<typeof vi.fn>;
					runQuery: ReturnType<typeof vi.fn>;
				},
				args: { recoveryToken: string },
			) => Promise<unknown>;
		};
		const runMutation = vi.fn().mockResolvedValue(null);
		const runQuery = vi.fn().mockResolvedValue({
			generatedAt: 1,
			failedVisitorMessages: [],
			operatorNoteDeliveryFailures: [],
			idleThreadsDueForClose: [],
			transcriptsDueForPurge: [],
			telegramTopicCleanupFailures: [],
		});

		await expect(
			action._handler(
				{ runMutation, runQuery },
				{ recoveryToken: "wrong-secret" },
			),
		).rejects.toThrow("Invalid support recovery token.");
		await expect(
			action._handler(
				{ runMutation, runQuery },
				{ recoveryToken: "recovery-secret" },
			),
		).resolves.toMatchObject({
			failedVisitorMessages: [],
			operatorNoteDeliveryFailures: [],
		});
		expect(runMutation).toHaveBeenNthCalledWith(1, expect.anything(), {
			accepted: false,
		});
		expect(runMutation).toHaveBeenNthCalledWith(2, expect.anything(), {
			accepted: true,
		});
		expect(runQuery).toHaveBeenCalledWith(expect.anything(), {});
	});
});
