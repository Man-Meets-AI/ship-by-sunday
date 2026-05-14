import { resolveRepositoryRoot } from "../core/repository-root";
import { runProgramRunLoop } from "../core/program-run-loop";
import { runProgramRunSlice } from "../core/program-run-slice";

const HELP_TEXT = `
Ship by Sunday Program commands

Usage:
  ship-by-sunday program run --program-id <id> [--repo <path>] [--max-planning-steps <count>] [--max-slices <count>] [--max-fix-attempts <count>] [--json]
  ship-by-sunday program run-slice --program-id <id> --plan <path> [--repo <path>] [--max-fix-attempts <count>] [--json]
`;

type ParsedRunArgs = {
	json: boolean;
	maxFixAttempts?: number;
	maxPlanningSteps?: number;
	maxSlices?: number;
	programId: string;
	repoRootDir?: string;
};

type ParsedRunSliceArgs = {
	json: boolean;
	maxFixAttempts?: number;
	planPath: string;
	programId: string;
	repoRootDir?: string;
};

export async function runProgramCommand(argv = process.argv.slice(2)) {
	const [subcommand, ...subcommandArgs] = argv;
	if (!subcommand || subcommand === "--help" || subcommand === "-h") {
		console.log(HELP_TEXT.trim());
		return 0;
	}

	if (subcommand === "run") {
		const parseResult = parseRunArgs(subcommandArgs);
		if (parseResult === "help") {
			console.log(HELP_TEXT.trim());
			return 0;
		}

		const { repositoryRoot } = await resolveRepositoryRoot({
			explicitRoot: parseResult.repoRootDir,
		});
		const result = await runProgramRunLoop({
			maxFixAttempts: parseResult.maxFixAttempts,
			maxPlanningSteps: parseResult.maxPlanningSteps,
			maxSlices: parseResult.maxSlices,
			programId: parseResult.programId,
			repoRootDir: repositoryRoot,
		});

		if (parseResult.json) {
			console.log(JSON.stringify(result, null, 2));
		} else {
			console.log(`Program run ${result.finalStatus}: ${result.loopRunId}`);
			console.log(`Stop reason: ${result.stopReason}`);
			console.log(`Run artifacts: ${result.loopRunDirectory}`);
			console.log(`Planning steps run: ${result.planningSteps.length}`);
			console.log(`Slices run: ${result.slices.length}`);
		}
		return result.finalStatus === "blocked" ? 1 : 0;
	}

	if (subcommand === "run-slice") {
		const parseResult = parseRunSliceArgs(subcommandArgs);
		if (parseResult === "help") {
			console.log(HELP_TEXT.trim());
			return 0;
		}

		const { repositoryRoot } = await resolveRepositoryRoot({
			explicitRoot: parseResult.repoRootDir,
		});
		const result = await runProgramRunSlice({
			maxFixAttempts: parseResult.maxFixAttempts,
			planPath: parseResult.planPath,
			programId: parseResult.programId,
			repoRootDir: repositoryRoot,
		});

		if (parseResult.json) {
			console.log(JSON.stringify(result, null, 2));
		} else {
			console.log(`Program run slice completed: ${result.runId}`);
			console.log(`Run artifacts: ${result.runDirectory}`);
			console.log(`Proof commands run: ${result.proofResults.length}`);
			console.log(`Review findings: ${result.reviewFindings.length}`);
			console.log(`Fix attempts: ${result.fixAttempts}`);
		}
		return 0;
	}

	throw new Error(`Unknown Program command: ${subcommand}`);
}

function parseRunArgs(argv: string[]): ParsedRunArgs | "help" {
	let json = false;
	let maxFixAttempts: number | undefined;
	let maxPlanningSteps: number | undefined;
	let maxSlices: number | undefined;
	let programId = "";
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

		throw new Error(`Unknown run argument: ${argument}`);
	}

	if (!programId) {
		throw new Error("program run requires --program-id <id>.");
	}

	return {
		json,
		maxFixAttempts,
		maxPlanningSteps,
		maxSlices,
		programId,
		repoRootDir,
	};
}

function parseRunSliceArgs(argv: string[]): ParsedRunSliceArgs | "help" {
	let json = false;
	let maxFixAttempts: number | undefined;
	let planPath = "";
	let programId = "";
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
		if (argument === "--max-fix-attempts") {
			maxFixAttempts = parseNonNegativeIntegerFlag(
				requireValue(argv, index, argument),
				argument,
			);
			index += 1;
			continue;
		}

		throw new Error(`Unknown run-slice argument: ${argument}`);
	}

	if (!programId) {
		throw new Error("program run-slice requires --program-id <id>.");
	}
	if (!planPath) {
		throw new Error("program run-slice requires --plan <path>.");
	}

	return {
		json,
		maxFixAttempts,
		planPath,
		programId,
		repoRootDir,
	};
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
