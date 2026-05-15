import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { parseMarkdownFrontmatter } from "../../../../scripts/markdown-metadata/frontmatter";
import {
	isProgramId,
	resolveProgramPacketPath,
	resolveCurrentPlanningBrief,
} from "../../../../scripts/programs/briefs";
import { runCodexExec } from "./codex-exec-runner";
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
const DEFAULT_MAX_PLANNING_STEPS = 6;
const DEFAULT_COMMAND_TIMEOUT_MS = 30 * 60 * 1000;
const PROGRAM_RUNS_ROOT = ".sbs/program-runs";

export type ProgramRunLoopFinalStatus = "blocked" | "complete" | "stopped";

export type ProgramRunLoopStopReason =
	| "max_slices_reached"
	| "no_active_child_plan"
	| "planning_blocked"
	| "planning_step_limit_reached"
	| "program_complete"
	| "slice_blocked";

export type ProgramRunLoopPlanningStepInput = {
	loopRunDirectory: string;
	loopRunId: string;
	planningStepNumber: number;
	programId: string;
	repoRootDir: string;
	runId: string;
	timeoutMs?: number;
};

export type ProgramRunLoopPlanningStepResult = {
	finalMessage: string;
};

export type ProgramRunLoopPlanningStepRunner = (
	input: ProgramRunLoopPlanningStepInput,
) => Promise<ProgramRunLoopPlanningStepResult>;

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

export type ProgramRunLoopPlanningStepReceipt = {
	completedAt: string;
	errorMessage?: string;
	finalMessage?: string;
	planningStepNumber: number;
	runId: string;
	status: "blocked" | "complete";
};

export type ProgramRunLoopResult = {
	finalStatus: ProgramRunLoopFinalStatus;
	loopRunDirectory: string;
	loopRunId: string;
	maxPlanningSteps: number;
	maxSlices: number;
	planningSteps: ProgramRunLoopPlanningStepReceipt[];
	programId: string;
	slices: ProgramRunLoopSliceReceipt[];
	stopReason: ProgramRunLoopStopReason;
};

type ProgramRunLoopState = {
	currentStatus: "running" | ProgramRunLoopFinalStatus;
	errorMessage?: string;
	loopRunId: string;
	maxPlanningSteps: number;
	maxSlices: number;
	planningSteps: ProgramRunLoopPlanningStepReceipt[];
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
	maxPlanningSteps?: number;
	maxSlices?: number;
	planningStepRunner?: ProgramRunLoopPlanningStepRunner;
	programId: string;
	repoRootDir: string;
	runId?: string;
	sliceRunner?: ProgramRunLoopSliceRunner;
	timeoutMs?: number;
}): Promise<ProgramRunLoopResult> {
	const repoRootDir = path.resolve(params.repoRootDir);
	const programId = normalizeProgramId(params.programId);
	const maxSlices = normalizeMaxSlices(params.maxSlices ?? DEFAULT_MAX_SLICES);
	const maxPlanningSteps = normalizeMaxPlanningSteps(
		params.maxPlanningSteps ?? DEFAULT_MAX_PLANNING_STEPS,
	);
	const timeoutMs = params.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;
	const loopRunId = normalizeProgramRunLoopId(
		params.runId ?? buildProgramRunLoopId(programId),
	);
	const sliceRunner = params.sliceRunner ?? runProgramRunSlice;
	const planningStepRunner =
		params.planningStepRunner ?? runProgramPlanningStep;
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
		maxPlanningSteps,
		maxSlices,
		planningSteps: [],
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
			if (maxPlanningSteps === 0) {
				return await finishProgramRunLoop({
					finalStatus: "blocked",
					loopRunDirectory,
					loopRunDirectoryRelativePath,
					programId,
					state,
					stopReason: "no_active_child_plan",
				});
			}

			if (state.planningSteps.length >= maxPlanningSteps) {
				return await finishProgramRunLoop({
					finalStatus: "blocked",
					loopRunDirectory,
					loopRunDirectoryRelativePath,
					programId,
					state,
					stopReason: "planning_step_limit_reached",
				});
			}

			const planningStepNumber = state.planningSteps.length + 1;
			const planningRunId = buildPlanningStepRunId({
				loopRunId,
				planningStepNumber,
			});
			try {
				const planningResult = await planningStepRunner({
					loopRunDirectory: loopRunDirectoryRelativePath,
					loopRunId,
					planningStepNumber,
					programId,
					repoRootDir,
					runId: planningRunId,
					timeoutMs,
				});
				state.planningSteps.push({
					completedAt: new Date().toISOString(),
					finalMessage: planningResult.finalMessage,
					planningStepNumber,
					runId: planningRunId,
					status: "complete",
				});
				await writeLoopState(repoRootDir, loopRunDirectoryRelativePath, state);
				continue;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				state.errorMessage = errorMessage;
				state.planningSteps.push({
					completedAt: new Date().toISOString(),
					errorMessage,
					planningStepNumber,
					runId: planningRunId,
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
					stopReason: "planning_blocked",
				});
			}
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
		maxPlanningSteps: params.state.maxPlanningSteps,
		maxSlices: params.state.maxSlices,
		planningSteps: params.state.planningSteps,
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
	}).catch(() => null);
	if (!currentPlanningBrief) {
		return null;
	}
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
	const programPacketPath = await resolveProgramPacketPath({
		programId: params.programId,
		repoRootDir: params.repoRootDir,
	});
	const programPath = path.join(programPacketPath, "program.md");
	const programText = await readFile(programPath, "utf8");
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

async function runProgramPlanningStep(
	input: ProgramRunLoopPlanningStepInput,
): Promise<ProgramRunLoopPlanningStepResult> {
	const result = await runCodexExec({
		allowNonGitSmoke: false,
		profileName: "sbs-workspace-write",
		prompt: await buildProgramPlanningStepPrompt(input),
		repositoryRoot: input.repoRootDir,
		sandboxMode: "workspace-write",
		timeoutMs: input.timeoutMs,
	});

	if (result.exitCode !== 0 || result.timedOut) {
		throw new Error(
			[
				`codex planning step failed with exit code ${result.exitCode}`,
				result.timedOut ? "Timed out: true" : "",
				result.stderr.trim() === "" ? "" : `STDERR:\n${result.stderr}`,
				result.finalAgentMessage?.trim()
					? `LAST MESSAGE:\n${result.finalAgentMessage}`
					: "",
			]
				.filter(Boolean)
				.join("\n\n"),
		);
	}

	return {
		finalMessage: result.finalAgentMessage ?? "",
	};
}

async function buildProgramPlanningStepPrompt(
	input: ProgramRunLoopPlanningStepInput,
) {
	const programPacketPath = await resolveProgramPacketPath({
		programId: input.programId,
		repoRootDir: input.repoRootDir,
	});
	const programRoot = path
		.relative(input.repoRootDir, programPacketPath)
		.replaceAll(path.sep, "/");
	const agentsText = await readOptionalRepositoryFile(
		input.repoRootDir,
		"AGENTS.md",
	);

	return [
		"Advance this active Program by exactly one planning/control step so `program run` can continue autonomously.",
		"",
		"Do not implement product code in this planning step. Do not execute a child ExecPlan. Do not broaden the Program scope.",
		"If a real child ExecPlan is missing and the Program packet is ready, write the child ExecPlan now.",
		"If earlier Program packet artifacts are missing or stale, create or repair the earliest missing artifact instead, then stop.",
		"",
		`Program id: ${input.programId}`,
		`Program root: ${programRoot}/`,
		`Program loop id: ${input.loopRunId}`,
		`Program loop artifacts: ${input.loopRunDirectory}/`,
		`Planning step: ${input.planningStepNumber}`,
		`Runner planning id: ${input.runId}`,
		"",
		"<AGENTS.md>",
		agentsText.trim() || "(missing)",
		"</AGENTS.md>",
		"",
		"Required reading:",
		"- repo root `AGENTS.md`",
		"- `docs/programs/PROGRAMS.md`",
		"- `docs/programs/README.md`",
		"- `docs/exec-plans/PLANS.md`",
		"- `docs/prompts/README.md`",
		"- the Program packet under the Program root",
		"",
		"State routing contract:",
		"- Use `docs/prompts/program-orchestrator.md` to classify the Program state from checked-in artifacts.",
		"- If the state is initialize, research, normalize, converge, order, split, review, brief, or program-doc, run the corresponding Program prompt for that one state and stop after writing its artifact(s).",
		"- If the state is write-plan, use `docs/prompts/exec-plan-writer.md` to write one complete, self-contained child ExecPlan under `docs/exec-plans/active/`.",
		"- The child ExecPlan must include matching `program_id` and immutable `planning_brief` frontmatter. The planning brief must be the current versioned `planning-brief-<N>.md`, never `current-planning-brief.txt`.",
		"- Do not leave a skeleton child plan as the final result. The plan must have concrete context, scope, milestones, steps, and runnable test commands before the runner executes it.",
		"- If the Program cannot responsibly advance, record the blocker in the Program and return a concise final message explaining the blocker.",
		"",
		"Validation:",
		"- Run `bun run programs:lint` when Program artifacts are touched.",
		"- Run `bun run plans:lint -- --plan <child-plan>` when an ExecPlan is created or changed.",
		"- Run `bun run markdown:lint -- --paths <changed markdown paths>` when practical.",
		"",
		"Return a concise final message with:",
		"- state classification",
		"- files created or changed",
		"- validation commands and results",
		"- blocker, if any",
	].join("\n");
}

async function readOptionalRepositoryFile(
	repoRootDir: string,
	repoRelativePath: string,
) {
	const filePath = resolveRepositoryPath(repoRootDir, repoRelativePath);
	if (!existsSync(filePath)) {
		return "";
	}
	return await readFile(filePath, "utf8");
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

function normalizeMaxPlanningSteps(value: number) {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error("--max-planning-steps must be a non-negative integer.");
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

function buildPlanningStepRunId(params: {
	loopRunId: string;
	planningStepNumber: number;
}) {
	return `${params.loopRunId}-planning-${String(
		params.planningStepNumber,
	).padStart(3, "0")}`;
}
