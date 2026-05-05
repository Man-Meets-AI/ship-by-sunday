import { readRunnerCredential } from "../core/local-runner-home";
import { readLocalProjectState } from "../core/local-project-state";
import { resolveRepositoryRoot } from "../core/repository-root";
import { flushRunnerEvents } from "../core/runner-events";
import { runDoctorPass } from "../core/doctor-pass/doctor-pass-runner";
import { collectSetupChecks, queueSetupCheckEvents } from "./setup-check";

type OneShotOptions = {
	repo?: string;
	json?: boolean;
};

export async function runOneShotCommand(argv: string[]) {
	const options = parseOneShotOptions(argv);
	const { repositoryRoot, isGitRepository } = await resolveRepositoryRoot({
		explicitRoot: options.repo,
	});
	const [state, credential] = await Promise.all([
		readLocalProjectState(repositoryRoot),
		readRunnerCredential({ repositoryRoot }),
	]);
	if (!state || !credential) {
		throw new Error("Run setup pair before one-shot.");
	}

	const setupChecks = await collectSetupChecks({
		repositoryRoot,
		isGitRepository,
	});
	await queueSetupCheckEvents(repositoryRoot, setupChecks.checks);
	const flushResult = await flushRunnerEvents({ repositoryRoot, credential });
	const hasBlockedSetup = setupChecks.checks.some(
		(check) => check.status === "blocked",
	);
	const doctorPass = hasBlockedSetup
		? {
				status: "skipped_due_to_blocked_setup" as const,
			}
		: await runDoctorPass({
				repositoryRoot,
				state,
				credential,
			});
	const result = {
		repositoryRoot,
		setup: setupChecks,
		eventDelivery: flushResult,
		doctorPass,
	};

	if (options.json) {
		console.log(JSON.stringify(result, null, 2));
	} else {
		console.log(
			`One-shot completed setup checks. Machine Setup: ${setupChecks.machineStatus}; Project Setup: ${setupChecks.projectStatus}.`,
		);
		console.log(
			`Delivered ${flushResult.delivered} event(s); ${flushResult.remaining} queued.`,
		);
		if ("runId" in doctorPass) {
			console.log(`Doctor pass wrote ${doctorPass.localReportRefPrefix}.`);
		}
	}

	return hasBlockedSetup ? 2 : 0;
}

function parseOneShotOptions(argv: string[]): OneShotOptions {
	const options: OneShotOptions = {};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--repo") {
			options.repo = requireOptionValue(argv, index, "--repo");
			index += 1;
		} else if (arg === "--json") {
			options.json = true;
		} else {
			throw new Error(`Unknown one-shot option: ${arg}`);
		}
	}
	return options;
}

function requireOptionValue(argv: string[], index: number, optionName: string) {
	const value = argv[index + 1];
	if (!value) {
		throw new Error(`${optionName} requires a value.`);
	}
	return value;
}
