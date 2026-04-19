import { spawnSync } from "node:child_process";
import process from "node:process";

import {
	buildReleaseBillingDoctorCommand,
	resolveReleaseBillingDoctorConfig,
} from "./lib/release-billing-doctor.mjs";

function parseArgs(argv) {
	let dryRun = false;
	let releaseEnvironment = "preview";

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];

		if (current === "--dry-run") {
			dryRun = true;
			continue;
		}

		if (current?.startsWith("--env=")) {
			releaseEnvironment = current.slice("--env=".length);
			continue;
		}

		if (current === "--env") {
			releaseEnvironment = argv[index + 1] ?? releaseEnvironment;
			index += 1;
		}
	}

	return {
		dryRun,
		releaseEnvironment,
	};
}

function main() {
	const { dryRun, releaseEnvironment } = parseArgs(process.argv.slice(2));
	const config = resolveReleaseBillingDoctorConfig(releaseEnvironment);
	const command = buildReleaseBillingDoctorCommand(config);

	if (dryRun) {
		process.stdout.write(
			`${JSON.stringify(
				{
					command,
					dryRun: true,
					...config,
				},
				null,
				2,
			)}\n`,
		);
		return;
	}

	const result = spawnSync(command[0], command.slice(1), {
		cwd: process.cwd(),
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});

	if (result.status !== 0) {
		if (result.stdout) {
			process.stdout.write(result.stdout);
		}
		if (result.stderr) {
			process.stderr.write(result.stderr);
		}
		process.exit(result.status ?? 1);
	}

	const verification =
		typeof result.stdout === "string" && result.stdout.trim().length > 0
			? JSON.parse(result.stdout)
			: null;

	process.stdout.write(
		`${JSON.stringify(
			{
				command,
				dryRun: false,
				...config,
				verification,
			},
			null,
			2,
		)}\n`,
	);
}

main();
