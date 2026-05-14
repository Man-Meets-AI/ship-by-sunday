import { readFile } from "node:fs/promises";

import { parseMarkdownFrontmatter } from "../../../../scripts/markdown-metadata/frontmatter";
import { resolveRepositoryPath } from "../core/repository-boundary";
import {
	resolveRepositoryRoot,
	type RepositoryRootResolution,
} from "../core/repository-root";
import {
	runProgramRunLoop,
	type ProgramRunLoopResult,
} from "../core/program-run-loop";
import {
	runProgramRunSlice,
	type ProgramRunSliceResult,
} from "../core/program-run-slice";

const HELP_TEXT = `
Ship by Sunday ExecPlan commands

Usage:
  ship-by-sunday execplan build --program-id <id> [--repo <path>] [--max-planning-steps <count>] [--max-slices <count>] [--max-fix-attempts <count>] [--json]
  ship-by-sunday execplan build --plan <path> [--repo <path>] [--max-fix-attempts <count>] [--json]
`;

type ParsedBuildArgs = {
	json: boolean;
	maxFixAttempts?: number;
	maxPlanningSteps?: number;
	maxSlices?: number;
	planPath?: string;
	programId?: string;
	repoRootDir?: string;
};

type ExecPlanCommandDependencies = {
	resolveRepositoryRoot: (params: {
		explicitRoot?: string;
	}) => Promise<RepositoryRootResolution>;
	runProgramRunLoop: typeof runProgramRunLoop;
	runProgramRunSlice: typeof runProgramRunSlice;
};

const defaultExecPlanCommandDependencies: ExecPlanCommandDependencies = {
	resolveRepositoryRoot,
	runProgramRunLoop,
	runProgramRunSlice,
};

export async function runExecPlanCommand(
	argv = process.argv.slice(2),
	dependencies = defaultExecPlanCommandDependencies,
) {
	const [subcommand, ...subcommandArgs] = argv;
	if (!subcommand || subcommand === "--help" || subcommand === "-h") {
		console.log(HELP_TEXT.trim());
		return 0;
	}

	if (subcommand !== "build") {
		throw new Error(`Unknown ExecPlan command: ${subcommand}`);
	}

	const parseResult = parseBuildArgs(subcommandArgs);
	if (parseResult === "help") {
		console.log(HELP_TEXT.trim());
		return 0;
	}

	const { repositoryRoot } = await dependencies.resolveRepositoryRoot({
		explicitRoot: parseResult.repoRootDir,
	});

	if (parseResult.planPath) {
		if (parseResult.maxSlices !== undefined) {
			throw new Error("--max-slices cannot be used with --plan.");
		}
		const programId =
			parseResult.programId ??
			(await readProgramIdFromExecPlan({
				planPath: parseResult.planPath,
				repoRootDir: repositoryRoot,
			}));
		const result: ProgramRunSliceResult = await dependencies.runProgramRunSlice(
			{
				maxFixAttempts: parseResult.maxFixAttempts,
				planPath: parseResult.planPath,
				programId,
				repoRootDir: repositoryRoot,
			},
		);
		if (parseResult.json) {
			console.log(JSON.stringify(result, null, 2));
		} else {
			console.log(`ExecPlan build completed: ${result.runId}`);
			console.log(`Run artifacts: ${result.runDirectory}`);
			console.log(`Proof commands run: ${result.proofResults.length}`);
			console.log(`Review findings: ${result.reviewFindings.length}`);
			console.log(`Fix attempts: ${result.fixAttempts}`);
		}
		return 0;
	}

	if (!parseResult.programId) {
		throw new Error(
			"execplan build requires --program-id <id> or --plan <path>.",
		);
	}

	const result: ProgramRunLoopResult = await dependencies.runProgramRunLoop({
		maxFixAttempts: parseResult.maxFixAttempts,
		maxPlanningSteps: parseResult.maxPlanningSteps,
		maxSlices: parseResult.maxSlices,
		programId: parseResult.programId,
		repoRootDir: repositoryRoot,
	});

	if (parseResult.json) {
		console.log(JSON.stringify(result, null, 2));
	} else {
		console.log(`ExecPlan build ${result.finalStatus}: ${result.loopRunId}`);
		console.log(`Stop reason: ${result.stopReason}`);
		console.log(`Run artifacts: ${result.loopRunDirectory}`);
		console.log(`Planning steps run: ${result.planningSteps.length}`);
		console.log(`Slices run: ${result.slices.length}`);
	}
	return result.finalStatus === "blocked" ? 1 : 0;
}

function parseBuildArgs(argv: string[]): ParsedBuildArgs | "help" {
	let json = false;
	let maxFixAttempts: number | undefined;
	let maxPlanningSteps: number | undefined;
	let maxSlices: number | undefined;
	let planPath: string | undefined;
	let programId: string | undefined;
	let repoRootDir: string | undefined;

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === "--help" || argument === "-h") {
			return "help";
		}
		if (argument === "--json") {
			json = true;
			continue;
		}
		if (argument === "--repo") {
			repoRootDir = requireValue(argv, index, argument);
			index += 1;
			continue;
		}
		if (argument === "--program-id") {
			programId = requireValue(argv, index, argument);
			index += 1;
			continue;
		}
		if (argument === "--plan") {
			planPath = requireValue(argv, index, argument);
			index += 1;
			continue;
		}
		if (argument === "--max-slices") {
			maxSlices = parseNonNegativeIntegerFlag(
				requireValue(argv, index, argument),
				argument,
			);
			if (maxSlices < 1) {
				throw new Error("--max-slices must be a positive integer.");
			}
			index += 1;
			continue;
		}
		if (argument === "--max-planning-steps") {
			maxPlanningSteps = parseNonNegativeIntegerFlag(
				requireValue(argv, index, argument),
				argument,
			);
			index += 1;
			continue;
		}
		if (argument === "--max-fix-attempts") {
			maxFixAttempts = parseNonNegativeIntegerFlag(
				requireValue(argv, index, argument),
				argument,
			);
			index += 1;
			continue;
		}
		throw new Error(`Unknown execplan build argument: ${argument}`);
	}

	return {
		json,
		maxFixAttempts,
		maxPlanningSteps,
		maxSlices,
		planPath,
		programId,
		repoRootDir,
	};
}

async function readProgramIdFromExecPlan(params: {
	planPath: string;
	repoRootDir: string;
}) {
	const planText = await readFile(
		resolveRepositoryPath(params.repoRootDir, params.planPath),
		"utf8",
	);
	const parsed = parseMarkdownFrontmatter(planText);
	if ("issue" in parsed) {
		throw new Error(
			`ExecPlan frontmatter is invalid for ${params.planPath}: ${parsed.issue}`,
		);
	}
	const programId = parsed.metadata.program_id;
	if (typeof programId !== "string" || programId.trim() === "") {
		throw new Error(
			`ExecPlan ${params.planPath} is not linked to a Program. Add program_id/planning_brief or pass --program-id.`,
		);
	}
	return programId;
}

function parseNonNegativeIntegerFlag(value: string, flag: string) {
	const parsedValue = Number(value);
	if (!Number.isInteger(parsedValue) || parsedValue < 0) {
		throw new Error(`${flag} must be a non-negative integer.`);
	}
	return parsedValue;
}

function requireValue(argv: string[], index: number, flag: string) {
	const value = argv[index + 1];
	if (!value || value.startsWith("--")) {
		throw new Error(`Missing value for ${flag}`);
	}
	return value;
}
