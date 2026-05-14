import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import {
	runProgramRunLoop,
	type ProgramRunLoopSliceRunner,
} from "../src/core/program-run-loop";
import type { ProgramRunSliceResult } from "../src/core/program-run-slice";
import { runCli } from "../src/cli";
import {
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

const execFileAsync = promisify(execFile);

describe("program run loop", () => {
	it("runs matching active child ExecPlans until the Program is complete", async () => {
		const repositoryRoot = await createProgramLoopFixture();
		const calls: string[] = [];
		const sliceRunner = createFakeSliceRunner(repositoryRoot, {
			onRun: async (input) => {
				calls.push(input.planPath);
				await writeRepoFile(
					repositoryRoot,
					`slice-${calls.length}.txt`,
					"done\n",
				);
				if (calls.length === 2) {
					await writeRepoFile(
						repositoryRoot,
						PROGRAM_PATH,
						buildFixtureProgram({ status: "complete" }),
					);
				}
			},
		});

		const result = await runProgramRunLoop({
			maxSlices: 4,
			programId: PROGRAM_ID,
			repoRootDir: repositoryRoot,
			runId: "loop-complete",
			sliceRunner,
			timeoutMs: 15_000,
		});

		expect(result.finalStatus).toBe("complete");
		expect(result.stopReason).toBe("program_complete");
		expect(result.slices.map((slice) => slice.planPath)).toEqual([
			PLAN_A_PATH,
			PLAN_B_PATH,
		]);
		expect(calls).toEqual([PLAN_A_PATH, PLAN_B_PATH]);
		await expect(
			readFile(
				path.join(
					repositoryRoot,
					".sbs/program-runs/autonomous-program-execution-loop/loop-complete/loop-state.json",
				),
				"utf8",
			),
		).resolves.toContain('"currentStatus": "complete"');
	});

	it("stops at the configured safety limit without claiming completion", async () => {
		const repositoryRoot = await createProgramLoopFixture();
		const calls: string[] = [];
		const result = await runProgramRunLoop({
			maxSlices: 1,
			programId: PROGRAM_ID,
			repoRootDir: repositoryRoot,
			runId: "loop-max",
			sliceRunner: createFakeSliceRunner(repositoryRoot, {
				onRun: async (input) => {
					calls.push(input.planPath);
					await writeRepoFile(repositoryRoot, "slice-one.txt", "done\n");
				},
			}),
			timeoutMs: 15_000,
		});

		expect(result.finalStatus).toBe("stopped");
		expect(result.stopReason).toBe("max_slices_reached");
		expect(calls).toEqual([PLAN_A_PATH]);
	});

	it("blocks when an active Program has no runnable active child plan", async () => {
		const repositoryRoot = await createProgramLoopFixture({
			planPaths: [],
		});
		const result = await runProgramRunLoop({
			maxSlices: 2,
			programId: PROGRAM_ID,
			repoRootDir: repositoryRoot,
			runId: "loop-no-plan",
			sliceRunner: createFakeSliceRunner(repositoryRoot),
			timeoutMs: 15_000,
		});

		expect(result.finalStatus).toBe("blocked");
		expect(result.stopReason).toBe("no_active_child_plan");
		expect(result.slices).toHaveLength(0);
	});

	it("blocks and records state when a child slice fails", async () => {
		const repositoryRoot = await createProgramLoopFixture();
		const result = await runProgramRunLoop({
			maxSlices: 2,
			programId: PROGRAM_ID,
			repoRootDir: repositoryRoot,
			runId: "loop-slice-fails",
			sliceRunner: async () => {
				throw new Error("slice failed in fixture");
			},
			timeoutMs: 15_000,
		});

		expect(result.finalStatus).toBe("blocked");
		expect(result.stopReason).toBe("slice_blocked");
		expect(result.slices).toEqual([
			expect.objectContaining({
				errorMessage: "slice failed in fixture",
				planPath: PLAN_A_PATH,
				status: "blocked",
			}),
		]);
		await expect(
			readFile(
				path.join(
					repositoryRoot,
					".sbs/program-runs/autonomous-program-execution-loop/loop-slice-fails/loop-state.json",
				),
				"utf8",
			),
		).resolves.toContain("slice failed in fixture");
	});

	it("runs from a dirty worktree", async () => {
		const repositoryRoot = await createProgramLoopFixture();
		await writeRepoFile(repositoryRoot, "dirty.txt", "uncommitted\n");
		const calls: string[] = [];

		const result = await runProgramRunLoop({
			maxSlices: 1,
			programId: PROGRAM_ID,
			repoRootDir: repositoryRoot,
			runId: "loop-dirty",
			sliceRunner: createFakeSliceRunner(repositoryRoot, {
				onRun: async (input) => {
					calls.push(input.planPath);
				},
			}),
			timeoutMs: 15_000,
		});

		expect(result.finalStatus).toBe("stopped");
		expect(result.stopReason).toBe("max_slices_reached");
		expect(calls).toEqual([PLAN_A_PATH]);
	});

	it("prints the program run command in CLI help", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(runCli(["program", "--help"])).resolves.toBe(0);

		expect(logSpy.mock.calls.join("\n")).toContain(
			"ship-by-sunday program run --program-id <id>",
		);
		logSpy.mockRestore();
	});
});

const PROGRAM_ID = "autonomous-program-execution-loop";
const PROGRAM_ROOT =
	"docs/programs/active/2026-05-13-autonomous-program-execution-loop";
const PROGRAM_PATH = `${PROGRAM_ROOT}/program.md`;
const PLANNING_BRIEF_PATH = `${PROGRAM_ROOT}/planning-brief-2.md`;
const PLAN_A_PATH = "docs/exec-plans/active/2026-05-13-loop-a.md";
const PLAN_B_PATH = "docs/exec-plans/active/2026-05-13-loop-b.md";
const OTHER_PROGRAM_PLAN_PATH =
	"docs/exec-plans/active/2026-05-13-other-program.md";
const OLD_BRIEF_PLAN_PATH = "docs/exec-plans/active/2026-05-13-old-brief.md";

async function createProgramLoopFixture(
	options: {
		planPaths?: string[];
	} = {},
) {
	const repositoryRoot = await createTemporaryDirectory("sbs-program-loop-");
	await initializeGitRepository(repositoryRoot);
	await writeRepoFile(repositoryRoot, "AGENTS.md", "# Test Agents\n");
	await writeRepoFile(
		repositoryRoot,
		`${PROGRAM_ROOT}/current-planning-brief.txt`,
		"planning-brief-2.md\n",
	);
	await writeRepoFile(
		repositoryRoot,
		`${PROGRAM_ROOT}/planning-brief-1.md`,
		buildFixturePlanningBrief({ version: 1 }),
	);
	await writeRepoFile(
		repositoryRoot,
		PLANNING_BRIEF_PATH,
		buildFixturePlanningBrief({ version: 2 }),
	);
	await writeRepoFile(repositoryRoot, PROGRAM_PATH, buildFixtureProgram());

	for (const planPath of options.planPaths ?? [PLAN_A_PATH, PLAN_B_PATH]) {
		await writeRepoFile(repositoryRoot, planPath, buildFixturePlan(planPath));
	}
	await writeRepoFile(
		repositoryRoot,
		OTHER_PROGRAM_PLAN_PATH,
		buildFixturePlan(OTHER_PROGRAM_PLAN_PATH, {
			programId: "other-program",
		}),
	);
	await writeRepoFile(
		repositoryRoot,
		OLD_BRIEF_PLAN_PATH,
		buildFixturePlan(OLD_BRIEF_PLAN_PATH, {
			planningBriefPath: `${PROGRAM_ROOT}/planning-brief-1.md`,
		}),
	);
	await execFileAsync("git", ["add", "."], { cwd: repositoryRoot });
	await execFileAsync("git", ["commit", "-m", "initial fixture"], {
		cwd: repositoryRoot,
	});
	return repositoryRoot;
}

function createFakeSliceRunner(
	repositoryRoot: string,
	options: {
		onRun?: (input: Parameters<ProgramRunLoopSliceRunner>[0]) => Promise<void>;
	} = {},
): ProgramRunLoopSliceRunner {
	return async (input) => {
		await options.onRun?.(input);
		return buildSliceResult({
			planPath: input.planPath,
			repositoryRoot,
			runId: input.runId,
		});
	};
}

function buildSliceResult(params: {
	planPath: string;
	repositoryRoot: string;
	runId: string;
}): ProgramRunSliceResult {
	return {
		finalStatus: "complete",
		fixAttempts: 0,
		planPath: params.planPath,
		programId: PROGRAM_ID,
		proofResults: [],
		reviewFindings: [],
		runDirectory: path.join(
			params.repositoryRoot,
			".sbs/program-runs",
			PROGRAM_ID,
			params.runId,
		),
		runId: params.runId,
	};
}

function buildFixtureProgram(options: { status?: "active" | "complete" } = {}) {
	const status = options.status ?? "active";
	return [
		"---",
		"program_id: autonomous-program-execution-loop",
		"title: Autonomous Program Execution Loop",
		`status: ${status}`,
		"created_at: 2026-05-13",
		status === "complete" ? "completed_at: 2026-05-13" : "completed_at: null",
		"summary: Fixture Program.",
		status === "complete"
			? "post_build_recap: Fixture complete."
			: "post_build_recap: null",
		"read_when:",
		"  - Testing.",
		"---",
		"",
		"# Autonomous Program Execution Loop",
		"",
		"Fixture Program.",
		"",
		"## Progress",
		"",
	].join("\n");
}

function buildFixturePlanningBrief(options: { version: number }) {
	return [
		"---",
		`title: Fixture Brief ${options.version}`,
		"program_id: autonomous-program-execution-loop",
		`brief_version: ${options.version}`,
		options.version === 2 ? "status: current" : "status: superseded",
		"summary: Fixture brief.",
		"read_when:",
		"  - Testing.",
		"---",
		"",
		`# Fixture Brief ${options.version}`,
		"",
	].join("\n");
}

function buildFixturePlan(
	planPath: string,
	options: {
		planningBriefPath?: string;
		programId?: string;
	} = {},
) {
	return [
		"---",
		`title: ${path.basename(planPath, ".md")}`,
		"status: active",
		"created_at: 2026-05-13",
		"completed_at: null",
		"summary: Fixture plan.",
		"post_build_recap: null",
		`program_id: ${options.programId ?? PROGRAM_ID}`,
		`planning_brief: ${options.planningBriefPath ?? PLANNING_BRIEF_PATH}`,
		"read_when:",
		"  - Testing.",
		"---",
		"",
		`# ${path.basename(planPath, ".md")}`,
		"",
		"Fixture plan.",
		"",
		"## Validation and Acceptance",
		"",
		"### Test Commands",
		"",
		"    node -e \"console.log('proof')\"",
		"",
	].join("\n");
}

async function writeRepoFile(
	repositoryRoot: string,
	repoPath: string,
	content: string,
) {
	const absolutePath = path.join(repositoryRoot, repoPath);
	await mkdir(path.dirname(absolutePath), { recursive: true });
	await writeFile(absolutePath, content, "utf8");
}
