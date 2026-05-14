import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { parseMarkdownFrontmatter } from "../../../../scripts/markdown-metadata/frontmatter";
import {
	isProgramId,
	resolveCurrentPlanningBrief,
} from "../../../../scripts/programs/briefs";
import { ensureLocalProjectStateDirectory } from "./local-project-state";
import {
	ensureRepositoryDirectory,
	resolveRepositoryPath,
	writeRepositoryTextFile,
} from "./repository-boundary";
import {
	runProgramRunSlice,
	type ProgramRunSliceResult,
} from "./program-run-slice";

const DEFAULT_MAX_SLICES = 3;
const DEFAULT_COMMAND_TIMEOUT_MS = 30 * 60 * 1000;
const PROGRAM_RUNS_ROOT = ".sbs/program-runs";

export type ProgramRunLoopFinalStatus = "blocked" | "complete" | "stopped";

export type ProgramRunLoopStopReason =
	| "max_slices_reached"
	| "no_active_child_plan"
	| "program_complete"
	| "slice_blocked";

export type ProgramRunLoopSliceRunnerInput = {
	maxFixAttempts?: number;
	planPath: string;
	programId: string;
	repoRootDir: string;
	runId: string;
	timeoutMs?: number;
};

export type ProgramRunLoopSliceRunner = (
	input: ProgramRunLoopSliceRunnerInput,
) => Promise<ProgramRunSliceResult>;

export type ProgramRunLoopSliceReceipt = {
	completedAt: string;
	errorMessage?: string;
	planPath: string;
	runDirectory?: string;
	runId: string;
	status: "blocked" | "complete";
};

export type ProgramRunLoopResult = {
	finalStatus: ProgramRunLoopFinalStatus;
	loopRunDirectory: string;
	loopRunId: string;
	maxSlices: number;
	programId: string;
	slices: ProgramRunLoopSliceReceipt[];
	stopReason: ProgramRunLoopStopReason;
};

type ProgramRunLoopState = {
	currentStatus: "running" | ProgramRunLoopFinalStatus;
	errorMessage?: string;
	loopRunId: string;
	maxSlices: number;
	programId: string;
	repoRootDir: string;
	slices: ProgramRunLoopSliceReceipt[];
	startedAt: string;
	stopReason?: ProgramRunLoopStopReason;
	updatedAt: string;
};

type ActiveChildPlan = {
	path: string;
};

export async function runProgramRunLoop(params: {
	maxFixAttempts?: number;
	maxSlices?: number;
	programId: string;
	repoRootDir: string;
	runId?: string;
	sliceRunner?: ProgramRunLoopSliceRunner;
	timeoutMs?: number;
}): Promise<ProgramRunLoopResult> {
	const repoRootDir = path.resolve(params.repoRootDir);
	const programId = normalizeProgramId(params.programId);
	const maxSlices = normalizeMaxSlices(params.maxSlices ?? DEFAULT_MAX_SLICES);
	const timeoutMs = params.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;
	const loopRunId = normalizeProgramRunLoopId(
		params.runId ?? buildProgramRunLoopId(programId),
	);
	const sliceRunner = params.sliceRunner ?? runProgramRunSlice;
	const loopRunDirectoryRelativePath = path.posix.join(
		PROGRAM_RUNS_ROOT,
		programId,
		loopRunId,
	);
	const loopRunDirectory = resolveRepositoryPath(
		repoRootDir,
		loopRunDirectoryRelativePath,
	);
	const startedAt = new Date().toISOString();
	const state: ProgramRunLoopState = {
		currentStatus: "running",
		loopRunId,
		maxSlices,
		programId,
		repoRootDir,
		slices: [],
		startedAt,
		updatedAt: startedAt,
	};
	const completedPlanPaths = new Set<string>();

	await ensureLocalProjectStateDirectory(repoRootDir);
	await ensureRepositoryDirectory(repoRootDir, loopRunDirectoryRelativePath);
	await writeLoopState(repoRootDir, loopRunDirectoryRelativePath, state);

	while (true) {
		const programStatus = await readProgramStatus({ programId, repoRootDir });
		if (programStatus === "complete") {
			return await finishProgramRunLoop({
				finalStatus: "complete",
				loopRunDirectory,
				loopRunDirectoryRelativePath,
				programId,
				state,
				stopReason: "program_complete",
			});
		}

		if (state.slices.length >= maxSlices) {
			return await finishProgramRunLoop({
				finalStatus: "stopped",
				loopRunDirectory,
				loopRunDirectoryRelativePath,
				programId,
				state,
				stopReason: "max_slices_reached",
			});
		}

		const nextPlan = await selectNextActiveChildPlan({
			completedPlanPaths,
			programId,
			repoRootDir,
		});
		if (!nextPlan) {
			return await finishProgramRunLoop({
				finalStatus: "blocked",
				loopRunDirectory,
				loopRunDirectoryRelativePath,
				programId,
				state,
				stopReason: "no_active_child_plan",
			});
		}

		const sliceRunId = buildSliceRunId({
			loopRunId,
			sliceNumber: state.slices.length + 1,
		});
		try {
			const sliceResult = await sliceRunner({
				maxFixAttempts: params.maxFixAttempts,
				planPath: nextPlan.path,
				programId,
				repoRootDir,
				runId: sliceRunId,
				timeoutMs,
			});
			const receipt: ProgramRunLoopSliceReceipt = {
				completedAt: new Date().toISOString(),
				planPath: nextPlan.path,
				runDirectory: sliceResult.runDirectory,
				runId: sliceRunId,
				status: sliceResult.finalStatus,
			};
			state.slices.push(receipt);
			completedPlanPaths.add(nextPlan.path);
			await writeLoopState(repoRootDir, loopRunDirectoryRelativePath, state);
			if (sliceResult.finalStatus !== "complete") {
				return await finishProgramRunLoop({
					finalStatus: "blocked",
					loopRunDirectory,
					loopRunDirectoryRelativePath,
					programId,
					state,
					stopReason: "slice_blocked",
				});
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			state.errorMessage = errorMessage;
			state.slices.push({
				completedAt: new Date().toISOString(),
				errorMessage,
				planPath: nextPlan.path,
				runId: sliceRunId,
				status: "blocked",
			});
			await writeLoopState(repoRootDir, loopRunDirectoryRelativePath, state);
			return await finishProgramRunLoop({
				errorMessage,
				finalStatus: "blocked",
				loopRunDirectory,
				loopRunDirectoryRelativePath,
				programId,
				state,
				stopReason: "slice_blocked",
			});
		}
	}
}

async function finishProgramRunLoop(params: {
	errorMessage?: string;
	finalStatus: ProgramRunLoopFinalStatus;
	loopRunDirectory: string;
	loopRunDirectoryRelativePath: string;
	programId: string;
	state: ProgramRunLoopState;
	stopReason: ProgramRunLoopStopReason;
}): Promise<ProgramRunLoopResult> {
	params.state.currentStatus = params.finalStatus;
	params.state.errorMessage = params.errorMessage ?? params.state.errorMessage;
	params.state.stopReason = params.stopReason;
	params.state.updatedAt = new Date().toISOString();
	await writeLoopState(
		params.state.repoRootDir,
		params.loopRunDirectoryRelativePath,
		params.state,
	);
	return {
		finalStatus: params.finalStatus,
		loopRunDirectory: params.loopRunDirectory,
		loopRunId: params.state.loopRunId,
		maxSlices: params.state.maxSlices,
		programId: params.programId,
		slices: params.state.slices,
		stopReason: params.stopReason,
	};
}

async function selectNextActiveChildPlan(params: {
	completedPlanPaths: Set<string>;
	programId: string;
	repoRootDir: string;
}): Promise<ActiveChildPlan | null> {
	const currentPlanningBrief = await resolveCurrentPlanningBrief({
		programId: params.programId,
		repoRootDir: params.repoRootDir,
	});
	const plans = await listActiveChildPlans({
		planningBriefPath: currentPlanningBrief.planningBriefPath,
		programId: params.programId,
		repoRootDir: params.repoRootDir,
	});
	return (
		plans.find((plan) => !params.completedPlanPaths.has(plan.path)) ?? null
	);
}

async function listActiveChildPlans(params: {
	planningBriefPath: string;
	programId: string;
	repoRootDir: string;
}): Promise<ActiveChildPlan[]> {
	const activePlansRoot = resolveRepositoryPath(
		params.repoRootDir,
		"docs/exec-plans/active",
	);
	if (!existsSync(activePlansRoot)) {
		return [];
	}
	const entries = await readdir(activePlansRoot, { withFileTypes: true });
	const plans: ActiveChildPlan[] = [];
	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith(".md")) {
			continue;
		}
		const planPath = path.posix.join("docs/exec-plans/active", entry.name);
		const planText = await readFile(
			resolveRepositoryPath(params.repoRootDir, planPath),
			"utf8",
		);
		const parsed = parseMarkdownFrontmatter(planText);
		if ("issue" in parsed) {
			continue;
		}
		if (
			parsed.metadata.status !== "active" ||
			parsed.metadata.program_id !== params.programId ||
			parsed.metadata.planning_brief !== params.planningBriefPath
		) {
			continue;
		}
		plans.push({
			path: planPath,
		});
	}
	return plans.sort((left, right) => left.path.localeCompare(right.path));
}

async function readProgramStatus(params: {
	programId: string;
	repoRootDir: string;
}) {
	const currentPlanningBrief = await resolveCurrentPlanningBrief({
		programId: params.programId,
		repoRootDir: params.repoRootDir,
	});
	const programPath = path.posix.join(
		path.posix.dirname(currentPlanningBrief.planningBriefPath),
		"program.md",
	);
	const programText = await readFile(
		resolveRepositoryPath(params.repoRootDir, programPath),
		"utf8",
	);
	const parsed = parseMarkdownFrontmatter(programText);
	if ("issue" in parsed) {
		throw new Error(`Program frontmatter is invalid: ${parsed.issue}`);
	}
	const status = parsed.metadata.status;
	if (status !== "active" && status !== "complete") {
		throw new Error(`Program status must be active or complete: ${status}`);
	}
	return status;
}

async function writeLoopState(
	repoRootDir: string,
	loopRunDirectoryRelativePath: string,
	state: ProgramRunLoopState,
) {
	await writeRepositoryTextFile(
		repoRootDir,
		path.posix.join(loopRunDirectoryRelativePath, "loop-state.json"),
		`${JSON.stringify(state, null, 2)}\n`,
	);
}

function normalizeProgramId(programId: string) {
	if (!isProgramId(programId)) {
		throw new Error(`Invalid Program id: ${programId}`);
	}
	return programId;
}

function normalizeMaxSlices(value: number) {
	if (!Number.isInteger(value) || value < 1) {
		throw new Error("--max-slices must be a positive integer.");
	}
	return value;
}

function normalizeProgramRunLoopId(runId: string) {
	if (!/^[A-Za-z0-9._-]+$/.test(runId) || runId === "." || runId === "..") {
		throw new Error(`Invalid Program run id: ${runId}`);
	}
	return runId;
}

function buildProgramRunLoopId(programId: string) {
	return `program-run-${programId}-${new Date()
		.toISOString()
		.replaceAll(/[:.]/g, "-")}-${randomUUID()}`;
}

function buildSliceRunId(params: { loopRunId: string; sliceNumber: number }) {
	return `${params.loopRunId}-slice-${String(params.sliceNumber).padStart(
		3,
		"0",
	)}`;
}
