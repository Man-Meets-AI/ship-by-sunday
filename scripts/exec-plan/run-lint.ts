import process from "node:process";

import { parseLintCommandArgs } from "./cli";
import { formatExecPlanLintReports, lintExecPlans } from "./plan-lint";

export async function runExecPlanLint(params: {
	repoRootDir: string;
	planPaths: string[];
}): Promise<{
	reportText: string;
	failedPlanCount: number;
}> {
	const reports = await lintExecPlans({
		repoRootDir: params.repoRootDir,
		planPaths: params.planPaths,
	});
	const failedPlanCount = reports.filter(
		(report) => report.issues.length > 0,
	).length;

	return {
		reportText: formatExecPlanLintReports(reports).trimEnd(),
		failedPlanCount,
	};
}

async function main(): Promise<void> {
	const parseResult = parseLintCommandArgs(process.argv.slice(2));
	if (parseResult.kind === "help") {
		console.log(parseResult.usage);
		return;
	}

	const result = await runExecPlanLint({
		repoRootDir: process.cwd(),
		planPaths: parseResult.options.planPaths,
	});

	if (result.reportText !== "") {
		console.log(result.reportText);
	}

	if (result.failedPlanCount > 0) {
		process.exitCode = 1;
	}
}

if (import.meta.url === new URL(process.argv[1] ?? "", "file://").href) {
	await main();
}
