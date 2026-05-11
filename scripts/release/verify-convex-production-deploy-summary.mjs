import { readFile } from "node:fs/promises";
import process from "node:process";

import { validateConvexProductionDeploySummary } from "./lib/convex-production-deploy-summary.mjs";

function parseArgs(argv) {
	const options = {};
	for (const argument of argv) {
		if (!argument.startsWith("--")) {
			continue;
		}

		const [key, value = ""] = argument.slice(2).split("=");
		options[key] = value;
	}

	return options;
}

export async function runCli({
	args = process.argv.slice(2),
	readFileImpl = readFile,
	writeStdout = (message) => process.stdout.write(message),
	writeStderr = (message) => process.stderr.write(message),
} = {}) {
	const options = parseArgs(args);
	const summaryPath = options.summary?.trim();
	const expectedCommitSha = options.commit?.trim();

	if (!summaryPath || !expectedCommitSha) {
		throw new Error(
			"verify-convex-production-deploy-summary requires --summary=<path> and --commit=<sha>.",
		);
	}

	const summary = JSON.parse(await readFileImpl(summaryPath, "utf8"));
	const result = validateConvexProductionDeploySummary(
		summary,
		expectedCommitSha,
	);

	if (!result.ok) {
		writeStderr(`${result.issues.join("\n")}\n`);
		return 1;
	}

	writeStdout(
		"Convex production deploy summary proves a same-commit deploy.\n",
	);
	return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	runCli()
		.then((status) => {
			process.exitCode = status;
		})
		.catch((error) => {
			process.stderr.write(
				`${error instanceof Error ? error.message : String(error)}\n`,
			);
			process.exitCode = 1;
		});
}
