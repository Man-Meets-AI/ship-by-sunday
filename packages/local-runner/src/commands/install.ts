import {
	runWorkerFoundationsInstall,
	type WorkerInstallOptions,
} from "../workflows/worker-foundations-install/workflow";

const HELP_TEXT = `
Shipbysunday Worker Foundations installer

Usage:
  shipbysunday install [--repo <path>] [--yes] [--json] [--dry-run] [--no-commit] [--no-kickoff]
  shipbysunday i [--repo <path>] [--yes] [--json] [--dry-run] [--no-commit] [--no-kickoff]
`;

export async function runInstallCommand(
	argv = process.argv.slice(2),
	env = process.env,
) {
	const parseResult = parseInstallArgs(argv);
	if (parseResult === "help") {
		console.log(HELP_TEXT.trim());
		return 0;
	}

	const result = await runWorkerFoundationsInstall({
		options: parseResult,
		env,
	});
	if (parseResult.json) {
		console.log(JSON.stringify(result.report, null, 2));
	} else {
		console.log(result.summary);
		if (result.report?.plan.blockers.length) {
			for (const blocker of result.report.plan.blockers) {
				console.log(`- ${blocker.reason}`);
			}
		}
	}
	return result.exitCode;
}

function parseInstallArgs(argv: string[]): WorkerInstallOptions | "help" {
	const options: WorkerInstallOptions = {
		dryRun: false,
		json: false,
		noCommit: false,
		noKickoff: false,
		yes: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === "--help" || argument === "-h") {
			return "help";
		}
		if (argument === "--repo") {
			const value = argv[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error("Missing value for --repo");
			}
			options.repoPath = value;
			index += 1;
			continue;
		}
		if (argument === "--yes") {
			options.yes = true;
			continue;
		}
		if (argument === "--json") {
			options.json = true;
			continue;
		}
		if (argument === "--dry-run") {
			options.dryRun = true;
			continue;
		}
		if (argument === "--no-commit") {
			options.noCommit = true;
			continue;
		}
		if (argument === "--no-kickoff") {
			options.noKickoff = true;
			continue;
		}
		throw new Error(
			`Unknown install argument: ${argument}\n\n${HELP_TEXT.trim()}`,
		);
	}

	return options;
}
