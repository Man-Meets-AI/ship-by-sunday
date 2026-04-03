import { promptStage } from "../src/prompts/prompt-stage";
import {
	createCliIo,
	createTemporaryRepoRoot,
	withMockedTerminalState,
} from "./test-helpers";

const readlineMockState = vi.hoisted(() => ({
	ask: vi.fn(),
	close: vi.fn(),
}));

vi.mock("../src/prompts/readline-stage-session", () => ({
	createReadlineStageSession: () => ({
		ask: readlineMockState.ask,
		close: readlineMockState.close,
	}),
}));

describe("interactive stage prompts", () => {
	beforeEach(() => {
		readlineMockState.ask.mockReset();
		readlineMockState.close.mockReset();
	});

	it("returns an interrupted outcome when the operator quits", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const { io } = createCliIo();
		const saveDraft = vi.fn();
		readlineMockState.ask.mockResolvedValueOnce({
			kind: "answer",
			value: ":quit",
		});

		const outcome = await withMockedTerminalState(
			{ stdinIsTTY: true, stdoutIsTTY: true },
			() =>
				promptStage({
					projectRootPath,
					stageId: "blueprint",
					io,
					saveDraft,
				}),
		);

		expect(outcome).toEqual(
			expect.objectContaining({
				kind: "interrupted",
				reason: "quit",
			}),
		);
		expect(outcome).toMatchObject({
			message: expect.stringContaining("Resume with bun run sbs resume."),
		});
		expect(saveDraft).not.toHaveBeenCalled();
	});

	it("returns an interrupted outcome when the prompt is cancelled", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const { io } = createCliIo();
		const saveDraft = vi.fn();
		readlineMockState.ask.mockResolvedValueOnce({ kind: "cancelled" });

		const outcome = await withMockedTerminalState(
			{ stdinIsTTY: true, stdoutIsTTY: true },
			() =>
				promptStage({
					projectRootPath,
					stageId: "blueprint",
					io,
					saveDraft,
				}),
		);

		expect(outcome).toEqual(
			expect.objectContaining({
				kind: "interrupted",
				reason: "cancelled",
			}),
		);
		expect(saveDraft).not.toHaveBeenCalled();
	});

	it("fails fast when readline closes before an answer is complete", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const { io } = createCliIo();
		const saveDraft = vi.fn();
		readlineMockState.ask.mockResolvedValueOnce({ kind: "closed" });

		await expect(
			withMockedTerminalState({ stdinIsTTY: true, stdoutIsTTY: true }, () =>
				promptStage({
					projectRootPath,
					stageId: "blueprint",
					io,
					saveDraft,
				}),
			),
		).rejects.toMatchObject({
			code: "invalid_state",
			exitCode: 2,
		});
		expect(saveDraft).not.toHaveBeenCalled();
	});

	it("rejects non-tty prompt attempts with an actionable invalid_state error", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const { io } = createCliIo();
		const saveDraft = vi.fn();

		await expect(
			promptStage({
				projectRootPath,
				stageId: "blueprint",
				io,
				saveDraft,
			}),
		).rejects.toMatchObject({
			code: "invalid_state",
			exitCode: 2,
		});
		expect(saveDraft).not.toHaveBeenCalled();
	});
});
