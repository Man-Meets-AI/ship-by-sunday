import path from "node:path";

import {
	EXEC_PLAN_ACTIVE_DIR,
	EXEC_PLAN_COMPLETED_DIR,
	isCanonicalExecPlanPath,
} from "./paths";

type HelpParseResult = {
	kind: "help";
	usage: string;
};

type RunParseResult<TOptions> = {
	kind: "run";
	options: TOptions;
};

export type LintCommandOptions = {
	planPaths: string[];
};

function resolveFlagValue(
	argv: string[],
	index: number,
	flag: string,
	usage: string,
): string {
	const value = argv[index + 1];
	if (!value || value.startsWith("--")) {
		throw new Error(`Missing value for ${flag}\n\n${usage}`);
	}

	return value;
}

export function validatePlanPath(planPath: string): string {
	if (!isCanonicalExecPlanPath(planPath)) {
		throw new Error(
			`Invalid --plan value: ${planPath}. Expected a repository-relative markdown file under ${EXEC_PLAN_ACTIVE_DIR}/ or ${EXEC_PLAN_COMPLETED_DIR}/.`,
		);
	}

	return planPath;
}

export function resolvePlanFilePath(
	repoRootDir: string,
	planPath: string,
): string {
	const resolvedPath = path.resolve(repoRootDir, validatePlanPath(planPath));
	const resolvedRoot = path.resolve(repoRootDir);
	if (
		resolvedPath !== resolvedRoot &&
		!resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)
	) {
		throw new Error(`Invalid --plan value outside repository: ${planPath}.`);
	}
	return resolvedPath;
}

export function buildLintUsage(): string {
	return [
		`Usage: bun run plans:lint -- (--plan <${EXEC_PLAN_ACTIVE_DIR}/path.md> | --paths <${EXEC_PLAN_ACTIVE_DIR}/path.md> [more paths...])`,
		"",
		"Options:",
		`  --plan <path>   Repository-relative ExecPlan path under ${EXEC_PLAN_ACTIVE_DIR}/ or ${EXEC_PLAN_COMPLETED_DIR}/. May be repeated.`,
		`  --paths <...>   One or more repository-relative ExecPlan paths under ${EXEC_PLAN_ACTIVE_DIR}/ or ${EXEC_PLAN_COMPLETED_DIR}/.`,
		"  --help          Show this usage output",
	].join("\n");
}

export function parseLintCommandArgs(
	argv: string[],
): HelpParseResult | RunParseResult<LintCommandOptions> {
	const usage = buildLintUsage();
	const planPaths: string[] = [];

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];

		if (argument === "--help") {
			return {
				kind: "help",
				usage,
			};
		}

		if (argument === "--plan") {
			planPaths.push(
				validatePlanPath(resolveFlagValue(argv, index, argument, usage)),
			);
			index += 1;
			continue;
		}

		if (argument === "--paths") {
			while (argv[index + 1] && !argv[index + 1].startsWith("--")) {
				planPaths.push(validatePlanPath(argv[index + 1]));
				index += 1;
			}
			continue;
		}

		throw new Error(`Unknown argument: ${argument}\n\n${usage}`);
	}

	if (planPaths.length === 0) {
		throw new Error(`Missing --plan or --paths\n\n${usage}`);
	}

	return {
		kind: "run",
		options: {
			planPaths: [...new Set(planPaths)],
		},
	};
}
