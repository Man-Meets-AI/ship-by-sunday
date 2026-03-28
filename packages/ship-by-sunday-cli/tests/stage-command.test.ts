import { runCli } from "../src/run-cli";
import { createCliIo, createTemporaryRepoRoot } from "./test-helpers";

describe("stage selection", () => {
	it("resume targets the first incomplete stage", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const { io } = createCliIo();
		const promptStage = vi.fn(async () => {});

		const exitCode = await runCli({
			argv: ["resume"],
			io,
			repoRootPath,
			promptStage,
		});

		expect(exitCode).toBe(0);
		expect(promptStage).toHaveBeenCalledWith(
			expect.objectContaining({
				stageId: "product",
			}),
		);
	});

	it("stage routes to the explicit requested stage", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const { io } = createCliIo();
		const promptStage = vi.fn(async () => {});

		const exitCode = await runCli({
			argv: ["stage", "design"],
			io,
			repoRootPath,
			promptStage,
		});

		expect(exitCode).toBe(0);
		expect(promptStage).toHaveBeenCalledWith(
			expect.objectContaining({
				stageId: "design",
			}),
		);
	});
});
