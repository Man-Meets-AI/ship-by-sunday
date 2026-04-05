import { runCli } from "../src/run-cli";
import { createCliIo, createTemporaryRepoRoot } from "./test-helpers";

describe("stage selection", () => {
	it("resume targets the first incomplete stage", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const { io } = createCliIo();
		const promptStage = vi.fn(async () => ({ kind: "completed" as const }));

		const exitCode = await runCli({
			argv: ["resume"],
			io,
			projectRootPath,
			promptStage,
		});

		expect(exitCode).toBe(0);
		expect(promptStage).toHaveBeenCalledWith(
			expect.objectContaining({
				stageId: "blueprint",
			}),
		);
	});

	it("stage routes to the explicit requested stage", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const { io } = createCliIo();
		const promptStage = vi.fn(async () => ({ kind: "completed" as const }));

		const exitCode = await runCli({
			argv: ["stage", "blueprint"],
			io,
			projectRootPath,
			promptStage,
		});

		expect(exitCode).toBe(0);
		expect(promptStage).toHaveBeenCalledWith(
			expect.objectContaining({
				stageId: "blueprint",
			}),
		);
	});

	it("maps legacy interactive stage aliases to blueprint", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const { io } = createCliIo();
		const promptStage = vi.fn(async () => ({ kind: "completed" as const }));

		const exitCode = await runCli({
			argv: ["stage", "marketing"],
			io,
			projectRootPath,
			promptStage,
		});

		expect(exitCode).toBe(0);
		expect(promptStage).toHaveBeenCalledWith(
			expect.objectContaining({
				stageId: "blueprint",
			}),
		);
	});
});
