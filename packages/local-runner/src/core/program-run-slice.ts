import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { Effect, Layer } from "effect";

import {
	BoundedProcessService,
	NodeBoundedProcessServiceLive,
	runBoundedProcessEffect,
} from "./bounded-process";
import type { JsonObject, JsonValue } from "./json-value";
import {
	ensureLocalProjectStateDirectoryEffect,
	LocalProjectStateService,
	NodeLocalProjectStateServiceLive,
} from "./local-project-state";
import {
	ensureRepositoryDirectoryEffect,
	NodeRepositoryBoundaryServiceLive,
	RepositoryBoundaryService,
	resolveRepositoryPath,
	writeRepositoryTextFileEffect,
} from "./repository-boundary";
import {
	CodexExecService,
	NodeCodexExecServiceLive,
	runCodexExecEffect,
} from "./codex-exec-runner";
import {
	normalizeLocalRunnerEffectError,
	runLocalRunnerEffect,
} from "../effect/runtime";
import {
	isProgramId,
	resolveCurrentPlanningBrief,
} from "../../../../scripts/programs/briefs";
import { parseMarkdownFrontmatter } from "../../../../scripts/markdown-metadata/frontmatter";

const DEFAULT_FIX_ATTEMPTS = 2;
const DEFAULT_COMMAND_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_REVIEW_UNTRACKED_FILE_COUNT = 25;
const MAX_REVIEW_UNTRACKED_FILE_BYTES = 12_000;
const REVIEW_OUTPUT_SCHEMA_FILENAME = "review-output-schema.json";
const PROGRAM_RUNS_ROOT = ".sbs/program-runs";
const REVIEW_FINDING_CATEGORIES = [
	"bug",
	"regression",
	"missing_test",
	"security",
	"incorrect_assumption",
] as const;
const REVIEW_FINDING_DISPOSITIONS = [
	"must_fix",
	"intentional_defer",
	"informational",
] as const;
const REVIEW_FINDING_SEVERITIES = [
	"critical",
	"high",
	"medium",
	"low",
	"info",
] as const;

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

export type ProgramRunSliceReviewFindingCategory =
	(typeof REVIEW_FINDING_CATEGORIES)[number];
export type ProgramRunSliceReviewFindingDisposition =
	(typeof REVIEW_FINDING_DISPOSITIONS)[number];
export type ProgramRunSliceReviewFindingSeverity =
	(typeof REVIEW_FINDING_SEVERITIES)[number];

export type ProgramRunSliceReviewFinding = {
	category: ProgramRunSliceReviewFindingCategory;
	deferRationale?: string;
	disposition: ProgramRunSliceReviewFindingDisposition;
	file?: string;
	followUp?: string;
	impact: string;
	line?: number;
	minimalFix: string;
	mustFix: boolean;
	severity: ProgramRunSliceReviewFindingSeverity;
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

export type ProgramRunSliceParams = {
	executor?: ProgramRunSliceExecutor;
	maxFixAttempts?: number;
	planPath: string;
	programId: string;
	repoRootDir: string;
	runId?: string;
	timeoutMs?: number;
};

type ProgramRunSliceResolvedParams = {
	executor: ProgramRunSliceEffectExecutor;
	maxFixAttempts: number;
	planPath: string;
	programId: string;
	repoRootDir: string;
	runDirectory: string;
	runDirectoryRelativePath: string;
	runId: string;
	timeoutMs: number;
};

type ProgramRunSliceEffectExecutor = (
	input: ProgramRunSliceExecutorInput,
) => Effect.Effect<ProgramRunSliceExecutorOutput, Error, CodexExecService>;

type ProgramRunSliceServices =
	| BoundedProcessService
	| CodexExecService
	| LocalProjectStateService
	| RepositoryBoundaryService;

export const NodeProgramRunSliceServicesLive = Layer.mergeAll(
	NodeBoundedProcessServiceLive,
	NodeCodexExecServiceLive,
	NodeLocalProjectStateServiceLive,
	NodeRepositoryBoundaryServiceLive,
);

export async function runProgramRunSlice(
	params: ProgramRunSliceParams,
): Promise<ProgramRunSliceResult> {
	return await runLocalRunnerEffect(
		runProgramRunSliceEffect(params).pipe(
			Effect.provide(NodeProgramRunSliceServicesLive),
		),
	);
}

export function runProgramRunSliceEffect(
	params: ProgramRunSliceParams,
): Effect.Effect<ProgramRunSliceResult, Error, ProgramRunSliceServices> {
	return Effect.gen(function* () {
		const resolvedParams = yield* captureSyncError(() =>
			resolveProgramRunSliceParams(params),
		);
		const startedAt = new Date().toISOString();
		const state: ProgramRunSliceState = {
			currentPhase: "hydrate_context",
			fixAttempts: 0,
			phases: [],
			planPath: resolvedParams.planPath,
			programId: resolvedParams.programId,
			repoRootDir: resolvedParams.repoRootDir,
			runId: resolvedParams.runId,
			startedAt,
			updatedAt: startedAt,
		};

		yield* ensureLocalProjectStateDirectoryEffect(resolvedParams.repoRootDir);

		const runSlice = Effect.gen(function* () {
			yield* ensureRepositoryDirectoryEffect(
				resolvedParams.repoRootDir,
				resolvedParams.runDirectoryRelativePath,
			);
			yield* writeStateEffect(
				resolvedParams.repoRootDir,
				resolvedParams.runDirectoryRelativePath,
				state,
			);
			let context = yield* capturePromiseError(() =>
				hydrateProgramRunSliceContext({
					planPath: resolvedParams.planPath,
					programId: resolvedParams.programId,
					repoRootDir: resolvedParams.repoRootDir,
				}),
			);
			yield* completePhaseEffect(
				resolvedParams.repoRootDir,
				resolvedParams.runDirectoryRelativePath,
				state,
				"hydrate_context",
			);

			yield* runExecutorOrThrowEffect(resolvedParams.executor, {
				prompt: buildExecutePrompt(context),
				purpose: "execute",
				repositoryRoot: resolvedParams.repoRootDir,
				profileName: "sbs-workspace-write",
				sandboxMode: "workspace-write",
				timeoutMs: resolvedParams.timeoutMs,
			});
			yield* completePhaseEffect(
				resolvedParams.repoRootDir,
				resolvedParams.runDirectoryRelativePath,
				state,
				"execute",
			);

			context = yield* capturePromiseError(() =>
				hydrateProgramRunSliceContext({
					planPath: resolvedParams.planPath,
					programId: resolvedParams.programId,
					repoRootDir: resolvedParams.repoRootDir,
				}),
			);
			let proofCommands = yield* capturePromiseError(() =>
				extractProgramRunSliceProofCommands({
					planPath: resolvedParams.planPath,
					repoRootDir: resolvedParams.repoRootDir,
				}),
			);
			let proofResults = yield* runProgramRunSliceProofCommandsEffect({
				commands: proofCommands,
				repoRootDir: resolvedParams.repoRootDir,
				timeoutMs: resolvedParams.timeoutMs,
			});
			yield* writeProofSummaryEffect({
				proofResults,
				repoRootDir: resolvedParams.repoRootDir,
				runDirectoryRelativePath: resolvedParams.runDirectoryRelativePath,
			});
			yield* captureSyncError(() => assertProofSucceeded(proofResults));
			yield* completePhaseEffect(
				resolvedParams.repoRootDir,
				resolvedParams.runDirectoryRelativePath,
				state,
				"proof",
			);

			let gitSnapshot = yield* readGitSnapshotEffect(
				resolvedParams.repoRootDir,
			);
			let reviewResult = yield* runReviewPassEffect({
				context,
				executor: resolvedParams.executor,
				gitSnapshot,
				repoRootDir: resolvedParams.repoRootDir,
				reviewAttempt: 1,
				runDirectoryRelativePath: resolvedParams.runDirectoryRelativePath,
				timeoutMs: resolvedParams.timeoutMs,
			});
			yield* completePhaseEffect(
				resolvedParams.repoRootDir,
				resolvedParams.runDirectoryRelativePath,
				state,
				"review",
			);

			let mustFixFindings = getMustFixFindings(reviewResult);
			while (mustFixFindings.length > 0) {
				if (state.fixAttempts >= resolvedParams.maxFixAttempts) {
					return yield* Effect.fail(
						new Error(
							`Review still has ${mustFixFindings.length} must-fix finding(s) after ${state.fixAttempts}/${resolvedParams.maxFixAttempts} fix attempt(s).`,
						),
					);
				}

				state.fixAttempts += 1;
				yield* writeStateEffect(
					resolvedParams.repoRootDir,
					resolvedParams.runDirectoryRelativePath,
					state,
				);
				yield* runExecutorOrThrowEffect(resolvedParams.executor, {
					prompt: buildFixPrompt({
						context,
						findings: mustFixFindings,
						fixAttempt: state.fixAttempts,
						maxFixAttempts: resolvedParams.maxFixAttempts,
					}),
					purpose: "fix",
					repositoryRoot: resolvedParams.repoRootDir,
					profileName: "sbs-workspace-write",
					sandboxMode: "workspace-write",
					timeoutMs: resolvedParams.timeoutMs,
				});
				yield* completePhaseEffect(
					resolvedParams.repoRootDir,
					resolvedParams.runDirectoryRelativePath,
					state,
					"fix_findings",
				);

				context = yield* capturePromiseError(() =>
					hydrateProgramRunSliceContext({
						planPath: resolvedParams.planPath,
						programId: resolvedParams.programId,
						repoRootDir: resolvedParams.repoRootDir,
					}),
				);
				proofCommands = yield* capturePromiseError(() =>
					extractProgramRunSliceProofCommands({
						planPath: resolvedParams.planPath,
						repoRootDir: resolvedParams.repoRootDir,
					}),
				);
				proofResults = yield* runProgramRunSliceProofCommandsEffect({
					commands: proofCommands,
					repoRootDir: resolvedParams.repoRootDir,
					timeoutMs: resolvedParams.timeoutMs,
				});
				yield* writeProofSummaryEffect({
					proofResults,
					repoRootDir: resolvedParams.repoRootDir,
					runDirectoryRelativePath: resolvedParams.runDirectoryRelativePath,
				});
				yield* captureSyncError(() => assertProofSucceeded(proofResults));
				yield* completePhaseEffect(
					resolvedParams.repoRootDir,
					resolvedParams.runDirectoryRelativePath,
					state,
					"reproof",
				);

				gitSnapshot = yield* readGitSnapshotEffect(resolvedParams.repoRootDir);
				reviewResult = yield* runReviewPassEffect({
					context,
					executor: resolvedParams.executor,
					gitSnapshot,
					repoRootDir: resolvedParams.repoRootDir,
					reviewAttempt: state.fixAttempts + 1,
					runDirectoryRelativePath: resolvedParams.runDirectoryRelativePath,
					timeoutMs: resolvedParams.timeoutMs,
				});
				mustFixFindings = getMustFixFindings(reviewResult);
				yield* completePhaseEffect(
					resolvedParams.repoRootDir,
					resolvedParams.runDirectoryRelativePath,
					state,
					"review",
				);
			}

			yield* syncProgramRunSliceDocsEffect({
				planPath: resolvedParams.planPath,
				programId: resolvedParams.programId,
				proofResults,
				repoRootDir: resolvedParams.repoRootDir,
				reviewResult,
				runDirectoryRelativePath: resolvedParams.runDirectoryRelativePath,
				runId: resolvedParams.runId,
			});
			yield* completePhaseEffect(
				resolvedParams.repoRootDir,
				resolvedParams.runDirectoryRelativePath,
				state,
				"sync_docs",
			);
			yield* completePhaseEffect(
				resolvedParams.repoRootDir,
				resolvedParams.runDirectoryRelativePath,
				state,
				"checkpoint",
			);
			yield* completePhaseEffect(
				resolvedParams.repoRootDir,
				resolvedParams.runDirectoryRelativePath,
				state,
				"complete",
			);

			return {
				finalStatus: "complete" as const,
				fixAttempts: state.fixAttempts,
				planPath: resolvedParams.planPath,
				programId: resolvedParams.programId,
				proofResults,
				reviewFindings: reviewResult.findings,
				runDirectory: resolvedParams.runDirectory,
				runId: resolvedParams.runId,
			};
		});

		return yield* Effect.catchAll(runSlice, (error) =>
			Effect.gen(function* () {
				state.errorMessage = error.message;
				yield* completePhaseEffect(
					resolvedParams.repoRootDir,
					resolvedParams.runDirectoryRelativePath,
					state,
					"blocked",
					"failed",
				).pipe(Effect.catchAll(() => Effect.void));
				return yield* Effect.fail(error);
			}),
		);
	});
}

function resolveProgramRunSliceParams(
	params: ProgramRunSliceParams,
): ProgramRunSliceResolvedParams {
	const repoRootDir = path.resolve(params.repoRootDir);
	const planPath = normalizeRepoRelativePath(params.planPath);
	const programId = normalizeProgramId(params.programId);
	const maxFixAttempts = normalizeMaxFixAttempts(
		params.maxFixAttempts ?? DEFAULT_FIX_ATTEMPTS,
	);
	const timeoutMs = params.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;
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

	return {
		executor: params.executor
			? wrapPromiseProgramRunSliceExecutor(params.executor)
			: defaultProgramRunSliceExecutorEffect,
		maxFixAttempts,
		planPath,
		programId,
		repoRootDir,
		runDirectory,
		runDirectoryRelativePath,
		runId,
		timeoutMs,
	};
}

function wrapPromiseProgramRunSliceExecutor(
	executor: ProgramRunSliceExecutor,
): ProgramRunSliceEffectExecutor {
	return (input) =>
		capturePromiseError(() => runExecutorOrThrow(executor, input));
}

function captureSyncError<T>(operation: () => T): Effect.Effect<T, Error> {
	return Effect.try({
		try: operation,
		catch: normalizeLocalRunnerEffectError,
	});
}

function capturePromiseError<T>(
	operation: () => Promise<T>,
): Effect.Effect<T, Error> {
	return Effect.tryPromise({
		try: operation,
		catch: normalizeLocalRunnerEffectError,
	});
}

function defaultProgramRunSliceExecutorEffect(
	input: ProgramRunSliceExecutorInput,
): Effect.Effect<ProgramRunSliceExecutorOutput, Error, CodexExecService> {
	return Effect.gen(function* () {
		const result = yield* runCodexExecEffect({
			allowNonGitSmoke: false,
			outputSchemaPath: input.outputSchemaPath,
			profileName: input.profileName,
			prompt: input.prompt,
			repositoryRoot: input.repositoryRoot,
			sandboxMode: input.sandboxMode,
			timeoutMs: input.timeoutMs,
		});

		if (result.exitCode !== 0 || result.timedOut) {
			return yield* Effect.fail(
				new Error(
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
				),
			);
		}

		return {
			finalMessage: result.finalAgentMessage ?? "",
			structuredOutput: result.structuredOutput,
			threadId: result.threadId,
		};
	});
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

function runExecutorOrThrowEffect(
	executor: ProgramRunSliceEffectExecutor,
	input: ProgramRunSliceExecutorInput,
) {
	return Effect.flatMap(executor(input), (result) => {
		if (result.finalMessage.trim() === "" && input.purpose !== "review") {
			return Effect.fail(
				new Error(`codex ${input.purpose} returned an empty final message.`),
			);
		}
		return Effect.succeed(result);
	});
}

function runReviewPassEffect(params: {
	context: Awaited<ReturnType<typeof hydrateProgramRunSliceContext>>;
	executor: ProgramRunSliceEffectExecutor;
	gitSnapshot: GitSnapshot;
	repoRootDir: string;
	reviewAttempt: number;
	runDirectoryRelativePath: string;
	timeoutMs: number;
}): Effect.Effect<
	ProgramRunSliceReviewResult,
	Error,
	CodexExecService | RepositoryBoundaryService
> {
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
	const reviewPolicySummaryPath = path.posix.join(
		params.runDirectoryRelativePath,
		"review-policy-summary.json",
	);
	const reviewPolicySummaryAttemptPath = path.posix.join(
		params.runDirectoryRelativePath,
		`review-policy-summary-${params.reviewAttempt}.json`,
	);
	return Effect.gen(function* () {
		yield* writeRepositoryTextFileEffect(
			params.repoRootDir,
			reviewSchemaPath,
			`${JSON.stringify(buildReviewOutputSchema(), null, 2)}\n`,
		);
		const reviewPrompt = buildReviewPrompt({
			context: params.context,
			gitSnapshot: params.gitSnapshot,
		});
		yield* writeRepositoryTextFileEffect(
			params.repoRootDir,
			reviewPromptPath,
			reviewPrompt,
		);
		yield* writeRepositoryTextFileEffect(
			params.repoRootDir,
			reviewPromptAttemptPath,
			reviewPrompt,
		);
		const prompt = yield* capturePromiseError(() =>
			readFile(
				resolveRepositoryPath(params.repoRootDir, reviewPromptPath),
				"utf8",
			),
		);
		const result = yield* params.executor({
			outputSchemaPath: resolveRepositoryPath(
				params.repoRootDir,
				reviewSchemaPath,
			),
			profileName: "sbs-doctor-readonly",
			prompt,
			purpose: "review",
			repositoryRoot: params.repoRootDir,
			sandboxMode: "read-only",
			timeoutMs: params.timeoutMs,
		});
		const reviewResult = yield* captureSyncError(() =>
			parseReviewResult(result.structuredOutput),
		);
		const reviewPolicySummary = buildReviewPolicySummary(reviewResult);
		yield* writeRepositoryTextFileEffect(
			params.repoRootDir,
			reviewResultPath,
			`${JSON.stringify(reviewResult, null, 2)}\n`,
		);
		yield* writeRepositoryTextFileEffect(
			params.repoRootDir,
			reviewResultAttemptPath,
			`${JSON.stringify(reviewResult, null, 2)}\n`,
		);
		yield* writeRepositoryTextFileEffect(
			params.repoRootDir,
			reviewPolicySummaryPath,
			`${JSON.stringify(reviewPolicySummary, null, 2)}\n`,
		);
		yield* writeRepositoryTextFileEffect(
			params.repoRootDir,
			reviewPolicySummaryAttemptPath,
			`${JSON.stringify(reviewPolicySummary, null, 2)}\n`,
		);
		return reviewResult;
	});
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

export function runProgramRunSliceProofCommandsEffect(params: {
	commands: ProgramRunSliceProofCommand[];
	repoRootDir: string;
	timeoutMs: number;
}): Effect.Effect<
	ProgramRunSliceProofCommandResult[],
	Error,
	BoundedProcessService
> {
	return Effect.gen(function* () {
		const results: ProgramRunSliceProofCommandResult[] = [];
		for (const command of params.commands) {
			yield* capturePromiseError(() =>
				assertProofCommandCwdInsideRepository(params.repoRootDir, command.cwd),
			);
			const invocation = yield* captureSyncError(() =>
				parseProofCommandInvocation(command.command),
			);
			const result = yield* runBoundedProcessEffect({
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
	});
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
		"If the review-swarm roles are available, use this structure: pr_explorer maps the changed files and affected execution paths, reviewer finds real risks, and docs_researcher verifies framework or platform APIs the patch relies on.",
		"Focus only on real bugs, regressions, missing tests, security issues, and incorrect assumptions.",
		"Do not report style nits unless they hide a real shipped risk.",
		"",
		"Return structured JSON that matches the provided schema.",
		"",
		"Review policy:",
		"- category must be one of bug, regression, missing_test, security, or incorrect_assumption.",
		"- disposition must be must_fix, intentional_defer, or informational.",
		"- critical and high severity findings must use disposition must_fix and mustFix true.",
		"- medium bug, regression, security, and incorrect_assumption findings must use disposition must_fix and mustFix true.",
		"- intentional_defer is only allowed for missing_test findings that can safely move to a later slice; include deferRationale and followUp.",
		"- informational is only for low or info severity notes that do not need code changes in this slice.",
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
	maxFixAttempts: number;
}) {
	return [
		`Fix the must-fix review findings for ${params.context.planPath}.`,
		`Fix attempt: ${params.fixAttempt} of ${params.maxFixAttempts}.`,
		"",
		"Stay scoped to findings whose disposition is must_fix. Do not fix intentionally deferred or informational findings unless a must-fix repair requires it.",
		"Do not revert unrelated user changes. Keep the ExecPlan current.",
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
	const category = parseEnumValue(
		value.category ?? null,
		REVIEW_FINDING_CATEGORIES,
		"category",
	);
	const disposition = parseEnumValue(
		value.disposition ?? null,
		REVIEW_FINDING_DISPOSITIONS,
		"disposition",
	);
	const severity = parseEnumValue(
		value.severity ?? null,
		REVIEW_FINDING_SEVERITIES,
		"severity",
	);
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
	const deferRationale = optionalNonEmptyString(
		value.deferRationale,
		"deferRationale",
	);
	const followUp = optionalNonEmptyString(value.followUp, "followUp");
	assertReviewFindingPolicy({
		category,
		deferRationale,
		disposition,
		followUp,
		mustFix: value.mustFix,
		severity,
	});
	const finding: ProgramRunSliceReviewFinding = {
		category,
		disposition,
		file: typeof value.file === "string" ? value.file : undefined,
		impact: requireString(value.impact ?? null, "impact"),
		line,
		minimalFix: requireString(value.minimalFix ?? null, "minimalFix"),
		mustFix: value.mustFix,
		severity,
		title: requireString(value.title ?? null, "title"),
	};
	if (deferRationale !== undefined) {
		finding.deferRationale = deferRationale;
	}
	if (followUp !== undefined) {
		finding.followUp = followUp;
	}
	return finding;
}

function parseEnumValue<const T extends readonly string[]>(
	value: JsonValue,
	allowedValues: T,
	fieldName: string,
): T[number] {
	if (
		typeof value !== "string" ||
		!allowedValues.includes(value as T[number])
	) {
		throw new Error(
			`Review finding has invalid ${fieldName}: ${String(value)}`,
		);
	}
	return value as T[number];
}

function assertReviewFindingPolicy(params: {
	category: ProgramRunSliceReviewFindingCategory;
	deferRationale: string | undefined;
	disposition: ProgramRunSliceReviewFindingDisposition;
	followUp: string | undefined;
	mustFix: boolean;
	severity: ProgramRunSliceReviewFindingSeverity;
}) {
	const expectedMustFix = params.disposition === "must_fix";
	if (params.mustFix !== expectedMustFix) {
		throw new Error("Review finding mustFix must match disposition must_fix.");
	}
	if (
		(params.severity === "critical" || params.severity === "high") &&
		params.disposition !== "must_fix"
	) {
		throw new Error(
			"Critical and high review findings must be marked must_fix.",
		);
	}
	if (params.severity === "medium" && params.disposition === "informational") {
		throw new Error(
			"Medium review findings must be marked must_fix or intentional_defer.",
		);
	}
	if (
		params.disposition === "intentional_defer" &&
		params.category !== "missing_test"
	) {
		throw new Error(
			"Only missing_test review findings can be intentionally deferred.",
		);
	}
	if (
		params.disposition === "intentional_defer" &&
		(!params.deferRationale || !params.followUp)
	) {
		throw new Error(
			"Intentionally deferred review findings require deferRationale and followUp.",
		);
	}
}

function getMustFixFindings(reviewResult: ProgramRunSliceReviewResult) {
	return reviewResult.findings.filter(
		(finding) => finding.disposition === "must_fix",
	);
}

function buildReviewPolicySummary(reviewResult: ProgramRunSliceReviewResult) {
	const severityCounts = Object.fromEntries(
		REVIEW_FINDING_SEVERITIES.map((severity) => [severity, 0]),
	) as Record<ProgramRunSliceReviewFindingSeverity, number>;
	const categoryCounts = Object.fromEntries(
		REVIEW_FINDING_CATEGORIES.map((category) => [category, 0]),
	) as Record<ProgramRunSliceReviewFindingCategory, number>;
	const dispositionCounts = Object.fromEntries(
		REVIEW_FINDING_DISPOSITIONS.map((disposition) => [disposition, 0]),
	) as Record<ProgramRunSliceReviewFindingDisposition, number>;

	for (const finding of reviewResult.findings) {
		severityCounts[finding.severity] += 1;
		categoryCounts[finding.category] += 1;
		dispositionCounts[finding.disposition] += 1;
	}

	return {
		categoryCounts,
		dispositionCounts,
		findings: reviewResult.findings.length,
		informationalFindings: dispositionCounts.informational,
		intentionallyDeferredFindings: dispositionCounts.intentional_defer,
		mustFixFindings: dispositionCounts.must_fix,
		severityCounts,
	};
}

function syncProgramRunSliceDocsEffect(params: {
	planPath: string;
	programId: string;
	proofResults: ProgramRunSliceProofCommandResult[];
	repoRootDir: string;
	reviewResult: ProgramRunSliceReviewResult;
	runDirectoryRelativePath: string;
	runId: string;
}): Effect.Effect<void, Error, RepositoryBoundaryService> {
	const completedAt = new Date().toISOString();
	const proofPassed = params.proofResults.filter(
		(result) => result.succeeded,
	).length;
	const reviewPolicySummary = buildReviewPolicySummary(params.reviewResult);
	const summary = [
		`Autonomous run \`${params.runId}\` completed at ${completedAt}.`,
		`Proof commands passed: ${proofPassed}.`,
		`Review findings: ${reviewPolicySummary.findings}.`,
		`Must-fix findings remaining: ${reviewPolicySummary.mustFixFindings}.`,
		`Intentionally deferred findings: ${reviewPolicySummary.intentionallyDeferredFindings}.`,
		`Informational findings: ${reviewPolicySummary.informationalFindings}.`,
		`Run artifacts: \`${params.runDirectoryRelativePath}/\`.`,
	].join(" ");
	return Effect.gen(function* () {
		const planAbsolutePath = resolveRepositoryPath(
			params.repoRootDir,
			params.planPath,
		);
		const planText = yield* capturePromiseError(() =>
			readFile(planAbsolutePath, "utf8"),
		);
		yield* writeRepositoryTextFileEffect(
			params.repoRootDir,
			params.planPath,
			insertIntoMarkdownSection(
				planText,
				"Artifacts and Notes",
				["", `### Autonomous Run ${params.runId}`, "", summary, ""].join("\n"),
			),
		);

		const planningBrief = yield* capturePromiseError(() =>
			resolveCurrentPlanningBrief({
				programId: params.programId,
				repoRootDir: params.repoRootDir,
			}),
		);
		const programPath = path.posix.join(
			path.posix.dirname(planningBrief.planningBriefPath),
			"program.md",
		);
		const programText = yield* capturePromiseError(() =>
			readFile(resolveRepositoryPath(params.repoRootDir, programPath), "utf8"),
		);
		yield* writeRepositoryTextFileEffect(
			params.repoRootDir,
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
	});
}

function writeProofSummaryEffect(params: {
	proofResults: ProgramRunSliceProofCommandResult[];
	repoRootDir: string;
	runDirectoryRelativePath: string;
}): Effect.Effect<void, Error, RepositoryBoundaryService> {
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
	return writeRepositoryTextFileEffect(
		params.repoRootDir,
		path.posix.join(params.runDirectoryRelativePath, "proof-summary.md"),
		`${lines.join("\n")}\n`,
	);
}

function completePhaseEffect(
	repoRootDir: string,
	runDirectoryRelativePath: string,
	state: ProgramRunSliceState,
	phase: ProgramRunSlicePhase,
	status: "completed" | "failed" = "completed",
): Effect.Effect<void, Error, RepositoryBoundaryService> {
	const now = new Date().toISOString();
	state.currentPhase = phase;
	state.updatedAt = now;
	state.phases.push({
		completedAt: now,
		name: phase,
		status,
	});
	return writeStateEffect(repoRootDir, runDirectoryRelativePath, state);
}

function writeStateEffect(
	repoRootDir: string,
	runDirectoryRelativePath: string,
	state: ProgramRunSliceState,
): Effect.Effect<void, Error, RepositoryBoundaryService> {
	return writeRepositoryTextFileEffect(
		repoRootDir,
		path.posix.join(runDirectoryRelativePath, "state.json"),
		`${JSON.stringify(state, null, 2)}\n`,
	);
}

function readGitSnapshotEffect(
	repoRootDir: string,
): Effect.Effect<GitSnapshot, Error, BoundedProcessService> {
	return Effect.gen(function* () {
		const statusShort = yield* runGitEffect(
			["status", "--short", "--untracked-files=all"],
			{ repoRootDir },
		);
		const trackedDiffNameOnly = yield* runGitEffect(
			["diff", "HEAD", "--name-only", "--"],
			{ repoRootDir },
		);
		const trackedDiffStat = yield* runGitEffect(
			["diff", "HEAD", "--stat", "--"],
			{ repoRootDir },
		);
		const trackedDiffSummary = yield* runGitEffect(["diff", "HEAD", "--"], {
			repoRootDir,
		});
		const untrackedFilePaths = yield* readUntrackedFilePathsEffect(repoRootDir);
		const untrackedFileSnapshots = yield* capturePromiseError(() =>
			buildUntrackedFileSnapshots({
				repoRootDir,
				untrackedFilePaths,
			}),
		);
		return {
			diffNameOnly: truncateText(
				joinNonEmptySections([
					trackedDiffNameOnly,
					untrackedFilePaths.join("\n"),
				]),
				12_000,
			),
			diffStat: truncateText(
				joinNonEmptySections([
					trackedDiffStat,
					formatUntrackedFileStat(untrackedFilePaths),
				]),
				12_000,
			),
			diffSummary: truncateText(
				[
					"<TRACKED_DIFF_AGAINST_HEAD>",
					trackedDiffSummary.trim() || "(no tracked diff)",
					"</TRACKED_DIFF_AGAINST_HEAD>",
					"",
					"<UNTRACKED_FILE_SNAPSHOTS>",
					untrackedFileSnapshots.trim() || "(no untracked files)",
					"</UNTRACKED_FILE_SNAPSHOTS>",
				].join("\n"),
				40_000,
			),
			statusShort: truncateText(statusShort, 12_000),
		};
	});
}

function readUntrackedFilePathsEffect(
	repoRootDir: string,
): Effect.Effect<string[], Error, BoundedProcessService> {
	return Effect.map(
		runGitEffect(["ls-files", "--others", "--exclude-standard", "-z"], {
			repoRootDir,
		}),
		(output) => output.split("\0").filter(Boolean),
	);
}

async function buildUntrackedFileSnapshots(params: {
	repoRootDir: string;
	untrackedFilePaths: string[];
}) {
	const visibleFilePaths = params.untrackedFilePaths.slice(
		0,
		MAX_REVIEW_UNTRACKED_FILE_COUNT,
	);
	const sections = await Promise.all(
		visibleFilePaths.map((filePath) =>
			buildUntrackedFileSnapshot({
				filePath,
				repoRootDir: params.repoRootDir,
			}),
		),
	);
	const omittedFileCount =
		params.untrackedFilePaths.length - visibleFilePaths.length;
	if (omittedFileCount > 0) {
		sections.push(
			`Omitted ${omittedFileCount} additional untracked file(s) from review context.`,
		);
	}
	return sections.join("\n\n");
}

async function buildUntrackedFileSnapshot(params: {
	filePath: string;
	repoRootDir: string;
}) {
	const absolutePath = resolveRepositoryPath(
		params.repoRootDir,
		params.filePath,
	);
	const fileStats = await lstat(absolutePath).catch(() => null);
	if (!fileStats) {
		return [`--- ${params.filePath}`, "(untracked file disappeared)"].join(
			"\n",
		);
	}
	if (fileStats.isSymbolicLink()) {
		return [`--- ${params.filePath}`, "(symlink omitted)"].join("\n");
	}
	if (!fileStats.isFile()) {
		return [`--- ${params.filePath}`, "(non-file path omitted)"].join("\n");
	}
	const [realRootDir, realFilePath] = await Promise.all([
		realpath(params.repoRootDir),
		realpath(absolutePath),
	]);
	assertPathInsideRepository(
		realRootDir,
		realFilePath,
		"Untracked review snapshot",
	);
	const content = await readFile(absolutePath);
	if (content.includes(0)) {
		return [`--- ${params.filePath}`, "(binary file omitted)"].join("\n");
	}
	const truncated = content.byteLength > MAX_REVIEW_UNTRACKED_FILE_BYTES;
	const reviewContent = content
		.subarray(0, MAX_REVIEW_UNTRACKED_FILE_BYTES)
		.toString("utf8");
	return [
		`--- ${params.filePath}`,
		truncated
			? `${reviewContent}\n... truncated at ${MAX_REVIEW_UNTRACKED_FILE_BYTES} bytes ...`
			: reviewContent,
	].join("\n");
}

function formatUntrackedFileStat(untrackedFilePaths: string[]) {
	if (untrackedFilePaths.length === 0) {
		return "";
	}
	return [
		`Untracked files: ${untrackedFilePaths.length}`,
		...untrackedFilePaths.map((filePath) => `  ${filePath}`),
	].join("\n");
}

function joinNonEmptySections(sections: string[]) {
	return sections
		.map((section) => section.trim())
		.filter((section) => section !== "")
		.join("\n");
}

function runGitEffect(
	args: string[],
	params: { repoRootDir: string },
): Effect.Effect<string, Error, BoundedProcessService> {
	return Effect.flatMap(
		runBoundedProcessEffect({
			args,
			command: "git",
			cwd: params.repoRootDir,
			timeoutMs: 15_000,
		}),
		(result) => {
			if (!result.succeeded) {
				return Effect.fail(
					new Error(
						`git ${args.join(" ")} failed: ${result.stderr || result.stdout}`,
					),
				);
			}
			return Effect.succeed(result.stdout);
		},
	);
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
	return {
		...process.env,
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

function normalizeMaxFixAttempts(maxFixAttempts: number) {
	if (
		!Number.isInteger(maxFixAttempts) ||
		maxFixAttempts < 0 ||
		maxFixAttempts > 10
	) {
		throw new Error(
			`maxFixAttempts must be an integer between 0 and 10: ${maxFixAttempts}`,
		);
	}
	return maxFixAttempts;
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
					required: [
						"title",
						"severity",
						"category",
						"impact",
						"minimalFix",
						"mustFix",
						"disposition",
					],
					properties: {
						category: {
							type: "string",
							enum: [...REVIEW_FINDING_CATEGORIES],
						},
						deferRationale: { type: "string" },
						disposition: {
							type: "string",
							enum: [...REVIEW_FINDING_DISPOSITIONS],
						},
						file: { type: "string" },
						followUp: { type: "string" },
						impact: { type: "string" },
						line: { type: "number" },
						minimalFix: { type: "string" },
						mustFix: { type: "boolean" },
						severity: {
							type: "string",
							enum: [...REVIEW_FINDING_SEVERITIES],
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

function optionalNonEmptyString(
	value: JsonValue | undefined,
	fieldName: string,
) {
	if (value === undefined || value === null) {
		return undefined;
	}
	if (typeof value !== "string" || value.trim() === "") {
		throw new Error(
			`Review finding ${fieldName} must be a non-empty string when present.`,
		);
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
