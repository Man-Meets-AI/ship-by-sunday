import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

import { runBoundedProcess } from "./bounded-process";
import type { JsonObject, JsonValue } from "./json-value";
import { ensureLocalProjectStateDirectory } from "./local-project-state";
import {
	ensureRepositoryDirectory,
	resolveRepositoryPath,
	writeRepositoryTextFile,
} from "./repository-boundary";
import { runCodexExec } from "./codex-exec-runner";
import {
	isProgramId,
	resolveCurrentPlanningBrief,
} from "../../../../scripts/programs/briefs";
import { parseMarkdownFrontmatter } from "../../../../scripts/markdown-metadata/frontmatter";

const DEFAULT_FIX_ATTEMPTS = 2;
const DEFAULT_COMMAND_TIMEOUT_MS = 30 * 60 * 1000;
const REVIEW_OUTPUT_SCHEMA_FILENAME = "review-output-schema.json";
const PROGRAM_RUNS_ROOT = ".sbs/program-runs";

const KNOWN_COMMAND_STARTERS = new Set([
	"bash",
	"bun",
	"bunx",
	"cd",
	"git",
	"make",
	"node",
	"npm",
	"npx",
	"oxfmt",
	"oxlint",
	"pnpm",
	"python",
	"python3",
	"sh",
	"uv",
	"yarn",
	"zsh",
]);

export type ProgramRunSlicePhase =
	| "hydrate_context"
	| "execute"
	| "proof"
	| "write_review_prompt"
	| "review"
	| "fix_findings"
	| "reproof"
	| "sync_docs"
	| "checkpoint"
	| "complete"
	| "blocked";

export type ProgramRunSliceExecutorPurpose = "execute" | "fix" | "review";

export type ProgramRunSliceExecutorInput = {
	outputSchemaPath?: string;
	profileName: string;
	prompt: string;
	purpose: ProgramRunSliceExecutorPurpose;
	repositoryRoot: string;
	sandboxMode: "read-only" | "workspace-write";
	timeoutMs: number;
};

export type ProgramRunSliceExecutorOutput = {
	finalMessage: string;
	structuredOutput: JsonValue;
	threadId: string | null;
};

export type ProgramRunSliceExecutor = (
	input: ProgramRunSliceExecutorInput,
) => Promise<ProgramRunSliceExecutorOutput>;

export type ProgramRunSliceProofCommand = {
	command: string;
	cwd: string;
	source: string;
};

export type ProgramRunSliceProofCommandResult = {
	command: string;
	cwd: string;
	exitCode: number | null;
	stderrTail: string;
	stdoutTail: string;
	succeeded: boolean;
};

export type ProgramRunSliceReviewFinding = {
	file?: string;
	impact: string;
	line?: number;
	minimalFix: string;
	mustFix: boolean;
	severity: "critical" | "high" | "medium" | "low" | "info";
	title: string;
};

export type ProgramRunSliceReviewResult = {
	findings: ProgramRunSliceReviewFinding[];
	openQuestions: string[];
	validationNotes: string[];
};

export type ProgramRunSliceResult = {
	finalStatus: "complete" | "blocked";
	fixAttempts: number;
	planPath: string;
	programId: string;
	proofResults: ProgramRunSliceProofCommandResult[];
	reviewFindings: ProgramRunSliceReviewFinding[];
	runDirectory: string;
	runId: string;
};

type ProgramRunSliceState = {
	currentPhase: ProgramRunSlicePhase;
	errorMessage?: string;
	fixAttempts: number;
	phases: Array<{
		completedAt: string;
		name: ProgramRunSlicePhase;
		status: "completed" | "failed";
	}>;
	planPath: string;
	programId: string;
	repoRootDir: string;
	runId: string;
	startedAt: string;
	updatedAt: string;
};

type GitSnapshot = {
	diffNameOnly: string;
	diffStat: string;
	diffSummary: string;
	statusShort: string;
};

export async function runProgramRunSlice(params: {
	executor?: ProgramRunSliceExecutor;
	maxFixAttempts?: number;
	planPath: string;
	programId: string;
	repoRootDir: string;
	requireCleanWorktree?: boolean;
	runId?: string;
	timeoutMs?: number;
}): Promise<ProgramRunSliceResult> {
	const repoRootDir = path.resolve(params.repoRootDir);
	const planPath = normalizeRepoRelativePath(params.planPath);
	const programId = normalizeProgramId(params.programId);
	const maxFixAttempts = params.maxFixAttempts ?? DEFAULT_FIX_ATTEMPTS;
	const timeoutMs = params.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;
	const executor = params.executor ?? defaultProgramRunSliceExecutor;
	const startedAt = new Date().toISOString();
	const runId = normalizeProgramRunId(
		params.runId ?? buildProgramRunSliceId(programId),
	);
	const runDirectoryRelativePath = path.posix.join(
		PROGRAM_RUNS_ROOT,
		programId,
		runId,
	);
	const runDirectory = resolveRepositoryPath(
		repoRootDir,
		runDirectoryRelativePath,
	);
	const state: ProgramRunSliceState = {
		currentPhase: "hydrate_context",
		fixAttempts: 0,
		phases: [],
		planPath,
		programId,
		repoRootDir,
		runId,
		startedAt,
		updatedAt: startedAt,
	};

	await ensureLocalProjectStateDirectory(repoRootDir);
	try {
		await ensureRepositoryDirectory(repoRootDir, runDirectoryRelativePath);
		await writeState(repoRootDir, runDirectoryRelativePath, state);
		if (params.requireCleanWorktree ?? true) {
			await assertCleanWorktree(repoRootDir);
		}
		let context = await hydrateProgramRunSliceContext({
			planPath,
			programId,
			repoRootDir,
		});
		await completePhase(
			repoRootDir,
			runDirectoryRelativePath,
			state,
			"hydrate_context",
		);

		await runExecutorOrThrow(executor, {
			prompt: buildExecutePrompt(context),
			purpose: "execute",
			repositoryRoot: repoRootDir,
			profileName: "sbs-workspace-write",
			sandboxMode: "workspace-write",
			timeoutMs,
		});
		await completePhase(
			repoRootDir,
			runDirectoryRelativePath,
			state,
			"execute",
		);

		context = await hydrateProgramRunSliceContext({
			planPath,
			programId,
			repoRootDir,
		});
		let proofCommands = await extractProgramRunSliceProofCommands({
			planPath,
			repoRootDir,
		});
		let proofResults = await runProofCommands({
			commands: proofCommands,
			repoRootDir,
			timeoutMs,
		});
		assertProofSucceeded(proofResults);
		await writeProofSummary({
			proofResults,
			repoRootDir,
			runDirectoryRelativePath,
		});
		await completePhase(repoRootDir, runDirectoryRelativePath, state, "proof");

		let gitSnapshot = await readGitSnapshot(repoRootDir);
		let reviewResult = await runReviewPass({
			context,
			executor,
			gitSnapshot,
			repoRootDir,
			reviewAttempt: 1,
			runDirectoryRelativePath,
			timeoutMs,
		});
		await completePhase(repoRootDir, runDirectoryRelativePath, state, "review");

		let mustFixFindings = getMustFixFindings(reviewResult);
		while (mustFixFindings.length > 0) {
			if (state.fixAttempts >= maxFixAttempts) {
				throw new Error(
					`Review still has ${mustFixFindings.length} must-fix finding(s) after ${state.fixAttempts} fix attempt(s).`,
				);
			}

			state.fixAttempts += 1;
			await writeState(repoRootDir, runDirectoryRelativePath, state);
			await runExecutorOrThrow(executor, {
				prompt: buildFixPrompt({
					context,
					findings: mustFixFindings,
					fixAttempt: state.fixAttempts,
				}),
				purpose: "fix",
				repositoryRoot: repoRootDir,
				profileName: "sbs-workspace-write",
				sandboxMode: "workspace-write",
				timeoutMs,
			});
			await completePhase(
				repoRootDir,
				runDirectoryRelativePath,
				state,
				"fix_findings",
			);

			context = await hydrateProgramRunSliceContext({
				planPath,
				programId,
				repoRootDir,
			});
			proofCommands = await extractProgramRunSliceProofCommands({
				planPath,
				repoRootDir,
			});
			proofResults = await runProofCommands({
				commands: proofCommands,
				repoRootDir,
				timeoutMs,
			});
			assertProofSucceeded(proofResults);
			await writeProofSummary({
				proofResults,
				repoRootDir,
				runDirectoryRelativePath,
			});
			await completePhase(
				repoRootDir,
				runDirectoryRelativePath,
				state,
				"reproof",
			);

			gitSnapshot = await readGitSnapshot(repoRootDir);
			reviewResult = await runReviewPass({
				context,
				executor,
				gitSnapshot,
				repoRootDir,
				reviewAttempt: state.fixAttempts + 1,
				runDirectoryRelativePath,
				timeoutMs,
			});
			mustFixFindings = getMustFixFindings(reviewResult);
			await completePhase(
				repoRootDir,
				runDirectoryRelativePath,
				state,
				"review",
			);
		}

		proofResults = await runProofCommands({
			commands: proofCommands,
			repoRootDir,
			timeoutMs,
		});
		assertProofSucceeded(proofResults);
		await writeProofSummary({
			proofResults,
			repoRootDir,
			runDirectoryRelativePath,
		});
		await completePhase(
			repoRootDir,
			runDirectoryRelativePath,
			state,
			"reproof",
		);

		await syncProgramRunSliceDocs({
			planPath,
			programId,
			proofResults,
			repoRootDir,
			reviewResult,
			runDirectoryRelativePath,
			runId,
		});
		await completePhase(
			repoRootDir,
			runDirectoryRelativePath,
			state,
			"sync_docs",
		);
		await completePhase(
			repoRootDir,
			runDirectoryRelativePath,
			state,
			"checkpoint",
		);
		await completePhase(
			repoRootDir,
			runDirectoryRelativePath,
			state,
			"complete",
		);

		return {
			finalStatus: "complete",
			fixAttempts: state.fixAttempts,
			planPath,
			programId,
			proofResults,
			reviewFindings: reviewResult.findings,
			runDirectory,
			runId,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		state.errorMessage = errorMessage;
		await completePhase(
			repoRootDir,
			runDirectoryRelativePath,
			state,
			"blocked",
			"failed",
		);
		throw error;
	}
}

async function defaultProgramRunSliceExecutor(
	input: ProgramRunSliceExecutorInput,
): Promise<ProgramRunSliceExecutorOutput> {
	const result = await runCodexExec({
		allowNonGitSmoke: false,
		outputSchemaPath: input.outputSchemaPath,
		profileName: input.profileName,
		prompt: input.prompt,
		repositoryRoot: input.repositoryRoot,
		sandboxMode: input.sandboxMode,
		timeoutMs: input.timeoutMs,
	});

	if (result.exitCode !== 0 || result.timedOut) {
		throw new Error(
			[
				`codex exec ${input.purpose} failed with exit code ${result.exitCode}`,
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
		structuredOutput: result.structuredOutput,
		threadId: result.threadId,
	};
}

async function hydrateProgramRunSliceContext(params: {
	planPath: string;
	programId: string;
	repoRootDir: string;
}) {
	const planningBrief = await resolveCurrentPlanningBrief({
		programId: params.programId,
		repoRootDir: params.repoRootDir,
	});
	const programPacketPath = path.dirname(
		path.join(params.repoRootDir, planningBrief.planningBriefPath),
	);
	const programPath = path.join(programPacketPath, "program.md");
	const planAbsolutePath = resolveRepositoryPath(
		params.repoRootDir,
		params.planPath,
	);
	if (!existsSync(planAbsolutePath)) {
		throw new Error(`ExecPlan does not exist: ${params.planPath}`);
	}

	const [programText, planningBriefText, planText, agentsText] =
		await Promise.all([
			readFile(programPath, "utf8"),
			readFile(
				path.join(params.repoRootDir, planningBrief.planningBriefPath),
				"utf8",
			),
			readFile(planAbsolutePath, "utf8"),
			readOptionalRepositoryFile(params.repoRootDir, "AGENTS.md"),
		]);
	assertPlanBelongsToProgram({
		planPath: params.planPath,
		planText,
		planningBriefPath: planningBrief.planningBriefPath,
		programId: params.programId,
	});

	return {
		agentsText,
		planPath: params.planPath,
		planText,
		planningBriefPath: planningBrief.planningBriefPath,
		planningBriefText,
		programId: params.programId,
		programPath: path
			.relative(params.repoRootDir, programPath)
			.replaceAll(path.sep, "/"),
		programText,
	};
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

function assertPlanBelongsToProgram(params: {
	planPath: string;
	planText: string;
	planningBriefPath: string;
	programId: string;
}) {
	const parsed = parseMarkdownFrontmatter(params.planText);
	if ("issue" in parsed) {
		throw new Error(
			`ExecPlan frontmatter is invalid for ${params.planPath}: ${parsed.issue}`,
		);
	}
	const programId = parsed.metadata.program_id;
	if (programId !== params.programId) {
		throw new Error(
			`ExecPlan ${params.planPath} belongs to program_id ${String(
				programId,
			)}, not ${params.programId}.`,
		);
	}
	const planningBriefPath = parsed.metadata.planning_brief;
	if (planningBriefPath !== params.planningBriefPath) {
		throw new Error(
			`ExecPlan ${params.planPath} points to planning_brief ${String(
				planningBriefPath,
			)}, not current Program brief ${params.planningBriefPath}.`,
		);
	}
}

async function runExecutorOrThrow(
	executor: ProgramRunSliceExecutor,
	input: ProgramRunSliceExecutorInput,
) {
	const result = await executor(input);
	if (result.finalMessage.trim() === "" && input.purpose !== "review") {
		throw new Error(`codex ${input.purpose} returned an empty final message.`);
	}
	return result;
}

async function runReviewPass(params: {
	context: Awaited<ReturnType<typeof hydrateProgramRunSliceContext>>;
	executor: ProgramRunSliceExecutor;
	gitSnapshot: GitSnapshot;
	repoRootDir: string;
	reviewAttempt: number;
	runDirectoryRelativePath: string;
	timeoutMs: number;
}) {
	const reviewSchemaPath = path.posix.join(
		params.runDirectoryRelativePath,
		REVIEW_OUTPUT_SCHEMA_FILENAME,
	);
	const reviewPromptPath = path.posix.join(
		params.runDirectoryRelativePath,
		"review-prompt.md",
	);
	const reviewPromptAttemptPath = path.posix.join(
		params.runDirectoryRelativePath,
		`review-prompt-${params.reviewAttempt}.md`,
	);
	const reviewResultPath = path.posix.join(
		params.runDirectoryRelativePath,
		"review-result.json",
	);
	const reviewResultAttemptPath = path.posix.join(
		params.runDirectoryRelativePath,
		`review-result-${params.reviewAttempt}.json`,
	);
	await writeRepositoryTextFile(
		params.repoRootDir,
		reviewSchemaPath,
		`${JSON.stringify(buildReviewOutputSchema(), null, 2)}\n`,
	);
	const reviewPrompt = buildReviewPrompt({
		context: params.context,
		gitSnapshot: params.gitSnapshot,
	});
	await writeRepositoryTextFile(
		params.repoRootDir,
		reviewPromptPath,
		reviewPrompt,
	);
	await writeRepositoryTextFile(
		params.repoRootDir,
		reviewPromptAttemptPath,
		reviewPrompt,
	);
	const result = await params.executor({
		outputSchemaPath: resolveRepositoryPath(
			params.repoRootDir,
			reviewSchemaPath,
		),
		profileName: "sbs-doctor-readonly",
		prompt: await readFile(
			resolveRepositoryPath(params.repoRootDir, reviewPromptPath),
			"utf8",
		),
		purpose: "review",
		repositoryRoot: params.repoRootDir,
		sandboxMode: "read-only",
		timeoutMs: params.timeoutMs,
	});
	const reviewResult = parseReviewResult(result.structuredOutput);
	await writeRepositoryTextFile(
		params.repoRootDir,
		reviewResultPath,
		`${JSON.stringify(reviewResult, null, 2)}\n`,
	);
	await writeRepositoryTextFile(
		params.repoRootDir,
		reviewResultAttemptPath,
		`${JSON.stringify(reviewResult, null, 2)}\n`,
	);
	return reviewResult;
}

export async function extractProgramRunSliceProofCommands(params: {
	planPath: string;
	repoRootDir: string;
}): Promise<ProgramRunSliceProofCommand[]> {
	const planText = await readFile(
		resolveRepositoryPath(params.repoRootDir, params.planPath),
		"utf8",
	);
	const validationSection = extractMarkdownSection(
		planText,
		"Validation and Acceptance",
	);
	const testCommandsSection = validationSection
		? extractMarkdownSubsection(validationSection, "Test Commands")
		: null;
	if (!testCommandsSection) {
		return [];
	}

	const commands: ProgramRunSliceProofCommand[] = [];
	const lines = testCommandsSection.split("\n");
	let inFence = false;
	let blockLines: string[] = [];

	const flush = () => {
		if (blockLines.length === 0) {
			return;
		}
		commands.push(
			...parseProofCommandBlock({
				baseCwd: params.repoRootDir,
				lines: blockLines,
			}),
		);
		blockLines = [];
	};

	for (const rawLine of lines) {
		const trimmed = rawLine.trim();
		if (trimmed.startsWith("```")) {
			if (inFence) {
				flush();
			}
			inFence = !inFence;
			continue;
		}
		if (inFence) {
			blockLines.push(rawLine);
			continue;
		}
		if (/^(?: {4}|\t)/.test(rawLine)) {
			blockLines.push(trimmed);
			continue;
		}
		flush();
		if (/^-\s+/.test(trimmed)) {
			commands.push(
				...parseProofCommandBlock({
					baseCwd: params.repoRootDir,
					lines: [trimmed.slice(2).trim()],
				}),
			);
		}
	}

	flush();
	return commands;
}

async function runProofCommands(params: {
	commands: ProgramRunSliceProofCommand[];
	repoRootDir: string;
	timeoutMs: number;
}): Promise<ProgramRunSliceProofCommandResult[]> {
	const results: ProgramRunSliceProofCommandResult[] = [];
	for (const command of params.commands) {
		await assertProofCommandCwdInsideRepository(
			params.repoRootDir,
			command.cwd,
		);
		const invocation = parseProofCommandInvocation(command.command);
		const result = await runBoundedProcess({
			args: invocation.args,
			command: invocation.command,
			cwd: command.cwd,
			env: buildProofCommandEnvironment(invocation.env),
			timeoutMs: params.timeoutMs,
		});
		results.push({
			command: command.command,
			cwd: command.cwd,
			exitCode: result.exitCode ?? (result.succeeded ? 0 : null),
			stderrTail: trimOutputTail(result.stderr),
			stdoutTail: trimOutputTail(result.stdout),
			succeeded: result.succeeded,
		});
		if (!result.succeeded) {
			break;
		}
	}
	return results;
}

function assertProofSucceeded(results: ProgramRunSliceProofCommandResult[]) {
	if (results.length === 0) {
		throw new Error("ExecPlan has no runnable Test Commands to prove.");
	}
	const failedResult = results.find((result) => !result.succeeded);
	if (!failedResult) {
		return;
	}
	throw new Error(
		[
			"Program run slice proof failed.",
			`Command: ${failedResult.command}`,
			`Exit code: ${failedResult.exitCode}`,
			"STDOUT tail:",
			failedResult.stdoutTail || "(none)",
			"STDERR tail:",
			failedResult.stderrTail || "(none)",
		].join("\n"),
	);
}

function parseProofCommandBlock(params: {
	baseCwd: string;
	lines: string[];
}): ProgramRunSliceProofCommand[] {
	const commands: ProgramRunSliceProofCommand[] = [];
	let currentCwd = params.baseCwd;

	for (const logicalLine of joinProofCommandContinuations(params.lines)) {
		const trimmed = stripLeadingPrompt(logicalLine.command);
		if (trimmed === "") {
			continue;
		}
		if (isCdCommandLine(trimmed)) {
			currentCwd = resolveCommandCwd(params.baseCwd, currentCwd, trimmed);
			continue;
		}
		if (
			!isRunnableCommandLine(trimmed) ||
			isSkippableProofCommandLine(trimmed)
		) {
			continue;
		}
		commands.push({
			command: trimmed,
			cwd: currentCwd,
			source: logicalLine.source,
		});
	}

	return commands;
}

function buildExecutePrompt(
	context: Awaited<ReturnType<typeof hydrateProgramRunSliceContext>>,
) {
	return [
		"Execute this approved Program child ExecPlan to completion.",
		"",
		"Follow AGENTS.md, keep the ExecPlan current while you work, and do not broaden scope.",
		"The autonomous runner will run proof and a fresh review after you finish; do not write a review prompt yourself.",
		"",
		`Program: ${context.programId}`,
		`Program path: ${context.programPath}`,
		`Planning brief path: ${context.planningBriefPath}`,
		`Target ExecPlan path: ${context.planPath}`,
		"",
		"<AGENTS.md>",
		context.agentsText.trim() || "(missing)",
		"</AGENTS.md>",
		"",
		"<PROGRAM>",
		context.programText,
		"</PROGRAM>",
		"",
		"<PLANNING_BRIEF>",
		context.planningBriefText,
		"</PLANNING_BRIEF>",
		"",
		"<EXECPLAN>",
		context.planText,
		"</EXECPLAN>",
	].join("\n");
}

function buildReviewPrompt(params: {
	context: Awaited<ReturnType<typeof hydrateProgramRunSliceContext>>;
	gitSnapshot: GitSnapshot;
}) {
	return [
		"Review this completed ExecPlan slice against the repo's intended base branch.",
		"Focus only on real bugs, regressions, missing tests, security issues, and incorrect assumptions.",
		"Do not report style nits unless they hide a real shipped risk.",
		"",
		"Return structured JSON that matches the provided schema.",
		"",
		`Program: ${params.context.programId}`,
		`Program path: ${params.context.programPath}`,
		`Planning brief path: ${params.context.planningBriefPath}`,
		`Target ExecPlan path: ${params.context.planPath}`,
		"",
		"<GIT_STATUS_SHORT>",
		params.gitSnapshot.statusShort.trim() || "(clean)",
		"</GIT_STATUS_SHORT>",
		"",
		"<GIT_DIFF_STAT>",
		params.gitSnapshot.diffStat.trim() || "(no tracked diff)",
		"</GIT_DIFF_STAT>",
		"",
		"<GIT_DIFF_NAME_ONLY>",
		params.gitSnapshot.diffNameOnly.trim() || "(no tracked files)",
		"</GIT_DIFF_NAME_ONLY>",
		"",
		"<GIT_DIFF_SUMMARY>",
		params.gitSnapshot.diffSummary.trim() || "(no tracked diff)",
		"</GIT_DIFF_SUMMARY>",
		"",
		"<EXECPLAN>",
		params.context.planText,
		"</EXECPLAN>",
	].join("\n");
}

function buildFixPrompt(params: {
	context: Awaited<ReturnType<typeof hydrateProgramRunSliceContext>>;
	findings: ProgramRunSliceReviewFinding[];
	fixAttempt: number;
}) {
	return [
		`Fix the must-fix review findings for ${params.context.planPath}.`,
		`Fix attempt: ${params.fixAttempt}.`,
		"",
		"Stay scoped to the findings. Do not revert unrelated user changes. Keep the ExecPlan current.",
		"The runner will rerun proof and review after this fix pass.",
		"",
		"<MUST_FIX_FINDINGS>",
		JSON.stringify(params.findings, null, 2),
		"</MUST_FIX_FINDINGS>",
		"",
		"<EXECPLAN>",
		params.context.planText,
		"</EXECPLAN>",
	].join("\n");
}

function parseReviewResult(value: JsonValue): ProgramRunSliceReviewResult {
	if (!isJsonObject(value)) {
		throw new Error("Review result must be a JSON object.");
	}
	const findingsValue = value.findings;
	const openQuestionsValue = value.openQuestions;
	const validationNotesValue = value.validationNotes;
	if (!Array.isArray(findingsValue)) {
		throw new Error("Review result findings must be an array.");
	}
	return {
		findings: findingsValue.map(parseReviewFinding),
		openQuestions: parseStringArray(
			openQuestionsValue ?? null,
			"openQuestions",
		),
		validationNotes: parseStringArray(
			validationNotesValue ?? null,
			"validationNotes",
		),
	};
}

function parseReviewFinding(value: JsonValue): ProgramRunSliceReviewFinding {
	if (!isJsonObject(value)) {
		throw new Error("Review finding must be a JSON object.");
	}
	const severity = value.severity;
	if (
		severity !== "critical" &&
		severity !== "high" &&
		severity !== "medium" &&
		severity !== "low" &&
		severity !== "info"
	) {
		throw new Error("Review finding has invalid severity.");
	}
	if (value.file !== undefined && typeof value.file !== "string") {
		throw new Error("Review finding file must be a string when present.");
	}
	const line = value.line;
	if (
		line !== undefined &&
		(typeof line !== "number" || !Number.isInteger(line) || line < 1)
	) {
		throw new Error(
			"Review finding line must be a positive integer when present.",
		);
	}
	if (typeof value.mustFix !== "boolean") {
		throw new Error("Review finding mustFix must be a boolean.");
	}
	return {
		file: typeof value.file === "string" ? value.file : undefined,
		impact: requireString(value.impact ?? null, "impact"),
		line,
		minimalFix: requireString(value.minimalFix ?? null, "minimalFix"),
		mustFix: value.mustFix,
		severity,
		title: requireString(value.title ?? null, "title"),
	};
}

function getMustFixFindings(reviewResult: ProgramRunSliceReviewResult) {
	return reviewResult.findings.filter((finding) => finding.mustFix);
}

async function syncProgramRunSliceDocs(params: {
	planPath: string;
	programId: string;
	proofResults: ProgramRunSliceProofCommandResult[];
	repoRootDir: string;
	reviewResult: ProgramRunSliceReviewResult;
	runDirectoryRelativePath: string;
	runId: string;
}) {
	const completedAt = new Date().toISOString();
	const proofPassed = params.proofResults.filter(
		(result) => result.succeeded,
	).length;
	const mustFixCount = getMustFixFindings(params.reviewResult).length;
	const summary = [
		`Autonomous run \`${params.runId}\` completed at ${completedAt}.`,
		`Proof commands passed: ${proofPassed}.`,
		`Review findings: ${params.reviewResult.findings.length}.`,
		`Must-fix findings remaining: ${mustFixCount}.`,
		`Run artifacts: \`${params.runDirectoryRelativePath}/\`.`,
	].join(" ");
	const planAbsolutePath = resolveRepositoryPath(
		params.repoRootDir,
		params.planPath,
	);
	const planText = await readFile(planAbsolutePath, "utf8");
	await writeFile(
		planAbsolutePath,
		insertIntoMarkdownSection(
			planText,
			"Artifacts and Notes",
			["", `### Autonomous Run ${params.runId}`, "", summary, ""].join("\n"),
		),
	);

	const planningBrief = await resolveCurrentPlanningBrief({
		programId: params.programId,
		repoRootDir: params.repoRootDir,
	});
	const programPath = path.join(
		path.dirname(
			path.join(params.repoRootDir, planningBrief.planningBriefPath),
		),
		"program.md",
	);
	const programText = await readFile(programPath, "utf8");
	await writeFile(
		programPath,
		insertIntoMarkdownSection(
			programText,
			"Progress",
			[
				"",
				`- [x] ${completedAt.slice(0, 10)}: Completed autonomous run \`${params.runId}\` for \`${params.planPath}\`; ${proofPassed} proof command(s) passed and ${params.reviewResult.findings.length} review finding(s) were recorded.`,
				"",
			].join("\n"),
		),
	);
}

async function writeProofSummary(params: {
	proofResults: ProgramRunSliceProofCommandResult[];
	repoRootDir: string;
	runDirectoryRelativePath: string;
}) {
	const lines = [
		"# Proof Summary",
		"",
		...params.proofResults.flatMap((result, index) => [
			`## Command ${index + 1}`,
			"",
			`Status: ${result.succeeded ? "passed" : "failed"}`,
			"",
			`Command: \`${result.command}\``,
			"",
			"STDOUT tail:",
			"",
			"```txt",
			result.stdoutTail || "(none)",
			"```",
			"",
			"STDERR tail:",
			"",
			"```txt",
			result.stderrTail || "(none)",
			"```",
			"",
		]),
	];
	await writeRepositoryTextFile(
		params.repoRootDir,
		path.posix.join(params.runDirectoryRelativePath, "proof-summary.md"),
		`${lines.join("\n")}\n`,
	);
}

async function completePhase(
	repoRootDir: string,
	runDirectoryRelativePath: string,
	state: ProgramRunSliceState,
	phase: ProgramRunSlicePhase,
	status: "completed" | "failed" = "completed",
) {
	const now = new Date().toISOString();
	state.currentPhase = phase;
	state.updatedAt = now;
	state.phases.push({
		completedAt: now,
		name: phase,
		status,
	});
	await writeState(repoRootDir, runDirectoryRelativePath, state);
}

async function writeState(
	repoRootDir: string,
	runDirectoryRelativePath: string,
	state: ProgramRunSliceState,
) {
	await writeRepositoryTextFile(
		repoRootDir,
		path.posix.join(runDirectoryRelativePath, "state.json"),
		`${JSON.stringify(state, null, 2)}\n`,
	);
}

async function assertCleanWorktree(repoRootDir: string) {
	const status = await runGit(["status", "--short", "--untracked-files=all"], {
		repoRootDir,
	});
	const relevantLines = status
		.split(/\r?\n/)
		.map((line) => line.trimEnd())
		.filter((line) => line !== "");
	if (relevantLines.length > 0) {
		throw new Error(
			[
				"Refusing to start program run slice with a dirty worktree.",
				"Commit, stash, or remove unrelated changes before running this command.",
				relevantLines.join("\n"),
			].join("\n"),
		);
	}
}

async function readGitSnapshot(repoRootDir: string): Promise<GitSnapshot> {
	const [statusShort, diffNameOnly, diffStat, diffSummary] = await Promise.all([
		runGit(["status", "--short", "--untracked-files=all"], { repoRootDir }),
		runGit(["diff", "--name-only"], { repoRootDir }),
		runGit(["diff", "--stat"], { repoRootDir }),
		runGit(["diff", "--"], { repoRootDir }),
	]);
	return {
		diffNameOnly: truncateText(diffNameOnly, 12_000),
		diffStat: truncateText(diffStat, 12_000),
		diffSummary: truncateText(diffSummary, 40_000),
		statusShort: truncateText(statusShort, 12_000),
	};
}

async function runGit(args: string[], params: { repoRootDir: string }) {
	const result = await runBoundedProcess({
		args,
		command: "git",
		cwd: params.repoRootDir,
		timeoutMs: 15_000,
	});
	if (!result.succeeded) {
		throw new Error(
			`git ${args.join(" ")} failed: ${result.stderr || result.stdout}`,
		);
	}
	return result.stdout;
}

function extractMarkdownSection(source: string, heading: string) {
	const lines = source.replaceAll("\r\n", "\n").split("\n");
	const startIndex = findMarkdownHeadingLineIndex(lines, 2, heading);
	if (startIndex === -1) {
		return null;
	}
	const endIndex = findMarkdownSectionEndLineIndex(lines, startIndex, 2);
	return trimMarkdownSection(lines.slice(startIndex + 1, endIndex).join("\n"));
}

function extractMarkdownSubsection(source: string, heading: string) {
	const lines = source.split("\n");
	const startIndex = findMarkdownHeadingLineIndex(lines, 3, heading);
	if (startIndex === -1) {
		return null;
	}
	const endIndex = findMarkdownSectionEndLineIndex(lines, startIndex, 3);
	return trimMarkdownSection(lines.slice(startIndex + 1, endIndex).join("\n"));
}

function insertIntoMarkdownSection(
	source: string,
	heading: string,
	insertText: string,
) {
	const normalizedSource = source.replaceAll("\r\n", "\n");
	const lines = normalizedSource.split("\n");
	const headingLineIndex = findMarkdownHeadingLineIndex(lines, 2, heading);
	const headingToken = `## ${heading}`;
	if (headingLineIndex === -1) {
		return `${source.trimEnd()}\n\n${headingToken}\n${insertText.trimEnd()}\n`;
	}
	const insertIndex =
		lines.slice(0, headingLineIndex + 1).join("\n").length + 1;
	return `${normalizedSource.slice(0, insertIndex)}${insertText}${normalizedSource.slice(insertIndex)}`;
}

function findMarkdownHeadingLineIndex(
	lines: string[],
	level: number,
	heading: string,
) {
	let inFence = false;
	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index] ?? "";
		if (line.trimStart().startsWith("```")) {
			inFence = !inFence;
			continue;
		}
		if (inFence) {
			continue;
		}
		const match = getMarkdownHeadingMatch(line);
		if (match?.level === level && match.heading === heading) {
			return index;
		}
	}
	return -1;
}

function findMarkdownSectionEndLineIndex(
	lines: string[],
	startIndex: number,
	maxHeadingLevel: number,
) {
	let inFence = false;
	for (let index = startIndex + 1; index < lines.length; index += 1) {
		const line = lines[index] ?? "";
		if (line.trimStart().startsWith("```")) {
			inFence = !inFence;
			continue;
		}
		if (inFence) {
			continue;
		}
		const match = getMarkdownHeadingMatch(line);
		if (match && match.level <= maxHeadingLevel) {
			return index;
		}
	}
	return lines.length;
}

function getMarkdownHeadingMatch(line: string) {
	const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
	if (!match) {
		return null;
	}
	return {
		heading: match[2] ?? "",
		level: match[1]?.length ?? 0,
	};
}

function trimMarkdownSection(value: string) {
	return value.replace(/^(?:\r?\n)+/, "").replace(/\s+$/, "");
}

function stripLeadingPrompt(text: string) {
	return text.trim().replace(/^\$\s*/, "");
}

function joinProofCommandContinuations(lines: string[]) {
	const commands: Array<{ command: string; source: string }> = [];
	let pendingCommand = "";
	let pendingSource = "";

	for (const line of lines) {
		const trimmed = stripLeadingPrompt(line);
		if (trimmed === "") {
			if (pendingCommand !== "") {
				commands.push({
					command: pendingCommand.trim(),
					source: pendingSource.trim(),
				});
				pendingCommand = "";
				pendingSource = "";
			}
			continue;
		}

		const continues = /\\$/.test(trimmed);
		const commandPart = continues
			? trimmed.replace(/\\$/, "").trimEnd()
			: trimmed;
		pendingCommand = `${pendingCommand}${pendingCommand ? " " : ""}${commandPart}`;
		pendingSource = `${pendingSource}${pendingSource ? "\n" : ""}${line.trimEnd()}`;
		if (!continues) {
			commands.push({
				command: pendingCommand.trim(),
				source: pendingSource.trim(),
			});
			pendingCommand = "";
			pendingSource = "";
		}
	}

	if (pendingCommand !== "") {
		commands.push({
			command: pendingCommand.trim(),
			source: pendingSource.trim(),
		});
	}

	return commands;
}

function isCdCommandLine(line: string) {
	if (!/^cd(?:\s|$)/.test(line)) {
		return false;
	}
	const tokens = tokenizeProofCommandLine(line);
	return tokens[0] === "cd";
}

function isRunnableCommandLine(line: string) {
	const trimmed = stripLeadingPrompt(line);
	if (trimmed === "" || trimmed === "\\") {
		return false;
	}
	let commandToken = "";
	try {
		commandToken = firstExecutableToken(trimmed);
	} catch (error) {
		const roughCommandToken = firstRoughExecutableToken(trimmed);
		if (
			roughCommandToken !== "" &&
			(KNOWN_COMMAND_STARTERS.has(roughCommandToken) ||
				/^(?:\.\.?\/|~\/|\/)/.test(roughCommandToken))
		) {
			throw error;
		}
		return false;
	}
	if (commandToken === "") {
		return false;
	}
	if (/^(?:\.\.?\/|~\/|\/)/.test(commandToken)) {
		return true;
	}
	return KNOWN_COMMAND_STARTERS.has(commandToken);
}

function firstRoughExecutableToken(line: string) {
	const withoutEnvAssignments = line.replace(
		/^(?:[A-Z_][A-Z0-9_]*=(?:"[^"]*"|'[^']*'|\S+)\s+)*/,
		"",
	);
	return withoutEnvAssignments.split(/\s+/)[0] ?? "";
}

function firstExecutableToken(line: string) {
	const tokens = tokenizeProofCommandLine(line);
	let tokenIndex = 0;
	while (isEnvironmentAssignmentToken(tokens[tokenIndex] ?? "")) {
		tokenIndex += 1;
	}
	return tokens[tokenIndex] ?? "";
}

function isSkippableProofCommandLine(line: string) {
	const scriptName = getPackageScriptName(line);
	return (
		scriptName === "dev" ||
		scriptName === "start" ||
		(scriptName?.startsWith("dev:") ?? false)
	);
}

function getPackageScriptName(line: string) {
	const tokens = tokenizeProofCommandLine(line);
	let tokenIndex = 0;
	while (isEnvironmentAssignmentToken(tokens[tokenIndex] ?? "")) {
		tokenIndex += 1;
	}
	const commandToken = tokens[tokenIndex];
	if (!commandToken) {
		return null;
	}

	if (commandToken === "bun") {
		tokenIndex += tokens[tokenIndex + 1] === "run" ? 2 : 1;
		return readScriptNameAfterPackageOptions(tokens, tokenIndex);
	}
	if (
		commandToken === "npm" ||
		commandToken === "pnpm" ||
		commandToken === "yarn"
	) {
		if (tokens[tokenIndex + 1] !== "run") {
			return null;
		}
		return readScriptNameAfterPackageOptions(tokens, tokenIndex + 2);
	}
	return null;
}

function readScriptNameAfterPackageOptions(
	tokens: string[],
	startIndex: number,
) {
	for (let index = startIndex; index < tokens.length; index += 1) {
		const token = tokens[index];
		if (!token) {
			return null;
		}
		if (token === "--") {
			return null;
		}
		if (token === "--cwd" || token === "-C" || token === "--filter") {
			index += 1;
			continue;
		}
		if (token.startsWith("-")) {
			continue;
		}
		return token;
	}
	return null;
}

function resolveCommandCwd(
	repoRootDir: string,
	currentCwd: string,
	cdLine: string,
) {
	const tokens = tokenizeProofCommandLine(cdLine);
	if (tokens.length !== 2 || tokens[0] !== "cd") {
		throw new Error(
			"Proof command cd lines must be shaped as `cd <repo-relative-dir>`.",
		);
	}
	const nextDir = tokens[1] ?? "";
	if (nextDir === "~" || nextDir.startsWith("~/")) {
		throw new Error("Proof command cd lines must stay inside the repository.");
	}
	const resolvedPath = path.isAbsolute(nextDir)
		? path.resolve(nextDir)
		: path.resolve(currentCwd, nextDir);
	assertPathInsideRepository(repoRootDir, resolvedPath, "Proof command cd");
	return resolvedPath;
}

function parseProofCommandInvocation(commandLine: string): {
	args: string[];
	command: string;
	env: NodeJS.ProcessEnv;
} {
	const tokens = tokenizeProofCommandLine(commandLine);
	const env: NodeJS.ProcessEnv = {};
	let tokenIndex = 0;
	while (isEnvironmentAssignmentToken(tokens[tokenIndex] ?? "")) {
		const assignment = tokens[tokenIndex] ?? "";
		const separatorIndex = assignment.indexOf("=");
		env[assignment.slice(0, separatorIndex)] = assignment.slice(
			separatorIndex + 1,
		);
		tokenIndex += 1;
	}

	const command = tokens[tokenIndex] ?? "";
	if (!command) {
		throw new Error(`Proof command is missing an executable: ${commandLine}`);
	}
	if (command === "bash" || command === "sh" || command === "zsh") {
		throw new Error(
			`Proof command uses a shell interpreter instead of a direct executable: ${commandLine}`,
		);
	}
	if (
		path.isAbsolute(command) ||
		command.startsWith("~/") ||
		command.startsWith("../")
	) {
		throw new Error(
			`Proof command executable must be repo-relative or resolved from PATH: ${commandLine}`,
		);
	}

	return {
		args: tokens.slice(tokenIndex + 1),
		command,
		env,
	};
}

function tokenizeProofCommandLine(line: string) {
	const tokens: string[] = [];
	let currentToken = "";
	let tokenStarted = false;
	let quote: "'" | '"' | null = null;
	let escaping = false;

	for (const character of line.trim()) {
		if (escaping) {
			currentToken += character;
			tokenStarted = true;
			escaping = false;
			continue;
		}
		if (character === "\\" && quote !== "'") {
			escaping = true;
			tokenStarted = true;
			continue;
		}
		if (quote) {
			if (character === quote) {
				quote = null;
			} else {
				currentToken += character;
			}
			tokenStarted = true;
			continue;
		}
		if (character === "'" || character === '"') {
			quote = character;
			tokenStarted = true;
			continue;
		}
		if (/\s/.test(character)) {
			if (tokenStarted) {
				tokens.push(currentToken);
				currentToken = "";
				tokenStarted = false;
			}
			continue;
		}
		if (character === "`" || /[;&|<>]/.test(character)) {
			throw new Error(
				`Proof commands must use one direct executable without shell operators: ${line}`,
			);
		}
		currentToken += character;
		tokenStarted = true;
	}

	if (quote) {
		throw new Error(`Proof command has an unterminated quote: ${line}`);
	}
	if (escaping) {
		currentToken += "\\";
	}
	if (tokenStarted) {
		tokens.push(currentToken);
	}
	return tokens;
}

function isEnvironmentAssignmentToken(token: string) {
	return /^[A-Z_][A-Z0-9_]*=/.test(token);
}

function buildProofCommandEnvironment(extraEnv: NodeJS.ProcessEnv) {
	const env: NodeJS.ProcessEnv = {};
	for (const key of [
		"PATH",
		"HOME",
		"LANG",
		"LC_ALL",
		"TERM",
		"TMPDIR",
		"USER",
	] as const) {
		const value = process.env[key];
		if (value) {
			env[key] = value;
		}
	}
	return {
		...env,
		...extraEnv,
	};
}

async function assertProofCommandCwdInsideRepository(
	repoRootDir: string,
	commandCwd: string,
) {
	assertPathInsideRepository(repoRootDir, commandCwd, "Proof command cwd");
	const realRootDir = await realpath(repoRootDir);
	const realCommandCwd = await realpath(commandCwd).catch(() => null);
	if (realCommandCwd) {
		assertPathInsideRepository(
			realRootDir,
			realCommandCwd,
			"Proof command cwd",
		);
	}
}

function assertPathInsideRepository(
	repoRootDir: string,
	targetPath: string,
	label: string,
) {
	const relativePath = path.relative(
		path.resolve(repoRootDir),
		path.resolve(targetPath),
	);
	if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
		throw new Error(`${label} must stay inside the repository: ${targetPath}`);
	}
}

function normalizeRepoRelativePath(repoRelativePath: string) {
	const normalizedPath = repoRelativePath.replaceAll("\\", "/");
	if (
		path.posix.isAbsolute(normalizedPath) ||
		normalizedPath === "" ||
		normalizedPath.split("/").includes("..")
	) {
		throw new Error(`Unsafe repository-relative path: ${repoRelativePath}`);
	}
	return path.posix.normalize(normalizedPath);
}

function normalizeProgramId(programId: string) {
	if (!isProgramId(programId)) {
		throw new Error(`Invalid Program id: ${programId}`);
	}
	return programId;
}

function normalizeProgramRunId(runId: string) {
	if (!/^[A-Za-z0-9._-]+$/.test(runId) || runId === "." || runId === "..") {
		throw new Error(`Invalid Program run id: ${runId}`);
	}
	return runId;
}

function buildProgramRunSliceId(programId: string) {
	return `program-run-slice-${programId}-${new Date()
		.toISOString()
		.replaceAll(/[:.]/g, "-")}-${randomUUID()}`;
}

function buildReviewOutputSchema() {
	return {
		type: "object",
		additionalProperties: false,
		required: ["findings", "openQuestions", "validationNotes"],
		properties: {
			findings: {
				type: "array",
				items: {
					type: "object",
					additionalProperties: false,
					required: ["title", "severity", "impact", "minimalFix", "mustFix"],
					properties: {
						file: { type: "string" },
						impact: { type: "string" },
						line: { type: "number" },
						minimalFix: { type: "string" },
						mustFix: { type: "boolean" },
						severity: {
							type: "string",
							enum: ["critical", "high", "medium", "low", "info"],
						},
						title: { type: "string" },
					},
				},
			},
			openQuestions: {
				type: "array",
				items: { type: "string" },
			},
			validationNotes: {
				type: "array",
				items: { type: "string" },
			},
		},
	};
}

function isJsonObject(value: JsonValue): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStringArray(value: JsonValue, fieldName: string) {
	if (!Array.isArray(value)) {
		throw new Error(`Review result ${fieldName} must be an array.`);
	}
	return value.map((item, index) => {
		if (typeof item !== "string") {
			throw new Error(`Review result ${fieldName}[${index}] must be a string.`);
		}
		return item;
	});
}

function requireString(value: JsonValue, fieldName: string) {
	if (typeof value !== "string" || value.trim() === "") {
		throw new Error(`Review finding ${fieldName} must be a non-empty string.`);
	}
	return value;
}

function trimOutputTail(value: string) {
	return value.trim().split(/\r?\n/).slice(-20).join("\n");
}

function truncateText(value: string, maxLength: number) {
	if (value.length <= maxLength) {
		return value;
	}
	return `${value.slice(0, maxLength)}\n[truncated ${value.length - maxLength} chars]`;
}
