import { mkdtemp, mkdir, realpath, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { runCli } from "../src/cli";
import { runExecPlanCommand } from "../src/commands/execplan";
import { resolveRepositoryRoot } from "../src/core/repository-root";
import { initializeGitRepository } from "./test-utils";

describe("execplan command", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("prints autonomous ExecPlan build usage", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(runCli(["execplan", "--help"])).resolves.toBe(0);

		expect(logSpy.mock.calls.join("\n")).toContain(
			"ship-by-sunday execplan build --program-id <id>",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"ship-by-sunday execplan build --plan <path>",
		);
	});

	it("requires either a Program id or a plan path", async () => {
		const errorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);

		await expect(runCli(["execplan", "build"])).resolves.toBe(1);

		expect(errorSpy.mock.calls.join("\n")).toContain(
			"execplan build requires --program-id <id> or --plan <path>.",
		);
	});

	it("delegates program-id builds to the Program loop", async () => {
		const repositoryRoot = await createExecPlanCommandRepository();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const runProgramRunLoop = vi.fn(async () => ({
			finalStatus: "complete" as const,
			loopRunDirectory: ".sbs/program-runs/test/run-loop",
			loopRunId: "run-loop",
			maxPlanningSteps: 6,
			maxSlices: 2,
			planningSteps: [],
			programId: "autonomous-program-execution-loop",
			slices: [],
			stopReason: "program_complete" as const,
		}));
		const runProgramRunSlice = vi.fn();

		await expect(
			runExecPlanCommand(
				[
					"build",
					"--repo",
					repositoryRoot,
					"--program-id",
					"autonomous-program-execution-loop",
					"--max-slices",
					"2",
					"--max-fix-attempts",
					"1",
				],
				{
					resolveRepositoryRoot,
					runProgramRunLoop,
					runProgramRunSlice,
				},
			),
		).resolves.toBe(0);

		expect(runProgramRunLoop).toHaveBeenCalledWith({
			maxFixAttempts: 1,
			maxPlanningSteps: undefined,
			maxSlices: 2,
			programId: "autonomous-program-execution-loop",
			repoRootDir: repositoryRoot,
		});
		expect(runProgramRunSlice).not.toHaveBeenCalled();
		expect(logSpy.mock.calls.join("\n")).toContain("ExecPlan build complete");
	});

	it("infers program_id for plan builds and delegates to the slice runner", async () => {
		const repositoryRoot = await createExecPlanCommandRepository();
		const planPath = "docs/exec-plans/active/2026-05-13-command-plan.md";
		await writeExecPlanFile({
			planPath,
			programId: "autonomous-program-execution-loop",
			repositoryRoot,
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const runProgramRunLoop = vi.fn();
		const runProgramRunSlice = vi.fn(async () => ({
			finalStatus: "complete" as const,
			fixAttempts: 0,
			planPath,
			programId: "autonomous-program-execution-loop",
			proofResults: [],
			reviewFindings: [],
			runDirectory: ".sbs/program-runs/test/run-slice",
			runId: "run-slice",
		}));

		await expect(
			runExecPlanCommand(
				[
					"build",
					"--repo",
					repositoryRoot,
					"--plan",
					planPath,
					"--max-fix-attempts",
					"1",
				],
				{
					resolveRepositoryRoot,
					runProgramRunLoop,
					runProgramRunSlice,
				},
			),
		).resolves.toBe(0);

		expect(runProgramRunSlice).toHaveBeenCalledWith({
			maxFixAttempts: 1,
			planPath,
			programId: "autonomous-program-execution-loop",
			repoRootDir: repositoryRoot,
		});
		expect(runProgramRunLoop).not.toHaveBeenCalled();
		expect(logSpy.mock.calls.join("\n")).toContain("ExecPlan build completed");
	});
});

async function createExecPlanCommandRepository() {
	const repositoryRoot = await mkdtemp(
		path.join(os.tmpdir(), "sbs-execplan-command-"),
	);
	await initializeGitRepository(repositoryRoot);
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		'{"name":"execplan-command"}\n',
	);
	return await realpath(repositoryRoot);
}

async function writeExecPlanFile(params: {
	planPath: string;
	programId: string;
	repositoryRoot: string;
}) {
	const planAbsolutePath = path.join(params.repositoryRoot, params.planPath);
	await mkdir(path.dirname(planAbsolutePath), { recursive: true });
	await writeFile(
		planAbsolutePath,
		[
			"---",
			"title: Command Plan",
			"status: active",
			"created_at: 2026-05-13",
			"summary: Proves execplan command delegation.",
			`program_id: ${params.programId}`,
			"planning_brief: docs/programs/active/2026-05-13-autonomous-program-execution-loop/planning-brief-4.md",
			"---",
			"",
			"# Command Plan",
			"",
		].join("\n"),
	);
}
