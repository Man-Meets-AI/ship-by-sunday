import { createHash } from "node:crypto";

import {
	getMachineDisplayName,
	readLocalProjectState,
	writeLocalProjectState,
} from "../core/local-project-state";
import {
	readRunnerCredential,
	writeRunnerCredential,
} from "../core/local-runner-home";
import {
	getRepositoryDisplayName,
	resolveRepositoryRoot,
} from "../core/repository-root";
import {
	createRunnerEvent,
	flushRunnerEvents,
	queueRunnerEvent,
} from "../core/runner-events";
import { collectSetupChecks, queueSetupCheckEvents } from "./setup-check";

const DEFAULT_API_BASE_URL = "https://www.man-meets-ai.com";
const LOCAL_RUNNER_VERSION = "0.1.0";

type SetupPairOptions = {
	repo?: string;
	apiUrl?: string;
	json?: boolean;
	repair?: boolean;
	runnerMode: "daemon" | "one_shot";
};

type PairResponse = {
	projectId: string;
	runnerId: string;
	runnerToken: string;
	runnerMode: "daemon" | "one_shot";
	eventEndpoint: string;
	pairingStatus: "paired";
};

export async function runSetupPairCommand(argv: string[]) {
	const { pairingToken, options } = parseSetupPairOptions(argv);
	const { repositoryRoot, isGitRepository } = await resolveRepositoryRoot({
		explicitRoot: options.repo,
	});
	const [existingCredential, existingLocalState] = await Promise.all([
		readRunnerCredential({ repositoryRoot }),
		readLocalProjectState(repositoryRoot).catch(() => null),
	]);

	const requestedApiBaseUrl = normalizeApiBaseUrl(
		options.apiUrl ??
			process.env.SBS_RUNNER_API_BASE_URL ??
			DEFAULT_API_BASE_URL,
	);
	const repositoryDisplayName = getRepositoryDisplayName(repositoryRoot);
	const apiBaseUrl = existingCredential?.apiBaseUrl ?? requestedApiBaseUrl;
	const machineDisplayName = getMachineDisplayName();
	const pairingTokenDigest = digestPairingToken(pairingToken);
	const shouldReuseExistingCredential =
		!options.repair &&
		!!existingCredential &&
		!!existingLocalState &&
		existingLocalState.pairingTokenDigest === pairingTokenDigest &&
		existingCredential.apiBaseUrl === apiBaseUrl;

	if (existingCredential && !shouldReuseExistingCredential && !options.repair) {
		throw new Error(
			[
				"This repository is already paired to a Ship by Sunday runner.",
				"Refusing to pair with a different setup token without explicit repair.",
				"Run ship-by-sunday setup pair <token> --repair to replace stale or revoked runner credentials.",
			].join(" "),
		);
	}

	const pairedApiBaseUrl = options.repair ? requestedApiBaseUrl : apiBaseUrl;
	const pairResponse = shouldReuseExistingCredential
		? {
				projectId: existingCredential.projectId,
				runnerId: existingCredential.runnerId,
				runnerMode: existingLocalState.runnerMode,
				eventEndpoint: existingCredential.eventEndpoint,
				runnerToken: existingCredential.runnerToken,
				pairingStatus: "paired" as const,
			}
		: await pairRunner({
				apiBaseUrl: pairedApiBaseUrl,
				pairingToken,
				runnerMode: options.runnerMode,
				machineDisplayName,
			});

	await writeLocalProjectState(repositoryRoot, {
		schemaVersion: 1,
		projectId: pairResponse.projectId,
		runnerId: pairResponse.runnerId,
		runnerMode: pairResponse.runnerMode,
		apiBaseUrl: pairedApiBaseUrl,
		eventEndpoint: pairResponse.eventEndpoint,
		pairingTokenDigest,
		repositoryDisplayName,
		machineDisplayName,
		runnerVersion: LOCAL_RUNNER_VERSION,
		pairedAt: Date.now(),
		updatedAt: Date.now(),
	});
	await writeRunnerCredential({
		repositoryRoot,
		credential: {
			projectId: pairResponse.projectId,
			runnerId: pairResponse.runnerId,
			runnerToken: pairResponse.runnerToken,
			apiBaseUrl: pairedApiBaseUrl,
			eventEndpoint: pairResponse.eventEndpoint,
			updatedAt: Date.now(),
		},
	});

	const credential = await readRunnerCredential({ repositoryRoot });
	if (!credential) {
		throw new Error("Runner credential was not persisted.");
	}

	await queueRunnerEvent(
		repositoryRoot,
		createRunnerEvent({
			projectId: pairResponse.projectId,
			runnerId: pairResponse.runnerId,
			payload: {
				eventType: "runner.paired",
				pairingStatus: "paired",
				runnerMode: pairResponse.runnerMode,
				machineDisplayName,
				runnerVersion: LOCAL_RUNNER_VERSION,
				repositoryDisplayName,
			},
		}),
	);

	const setupChecks = await collectSetupChecks({
		repositoryRoot,
		isGitRepository,
	});
	await queueSetupCheckEvents(repositoryRoot, setupChecks.checks);
	const flushResult = await flushRunnerEvents({ repositoryRoot, credential });

	const result = {
		projectId: pairResponse.projectId,
		runnerId: pairResponse.runnerId,
		repositoryRoot,
		eventDelivery: flushResult,
		setup: setupChecks,
	};

	if (options.json) {
		console.log(JSON.stringify(result, null, 2));
	} else {
		console.log(`Paired local runner ${pairResponse.runnerId}.`);
		console.log(
			`Machine Setup: ${setupChecks.machineStatus}; Project Setup: ${setupChecks.projectStatus}.`,
		);
		console.log(
			`Delivered ${flushResult.delivered} event(s); ${flushResult.remaining} queued.`,
		);
	}

	return setupChecks.checks.some((check) => check.status === "blocked") ? 2 : 0;
}

async function pairRunner({
	apiBaseUrl,
	pairingToken,
	runnerMode,
	machineDisplayName,
}: {
	apiBaseUrl: string;
	pairingToken: string;
	runnerMode: "daemon" | "one_shot";
	machineDisplayName: string;
}) {
	const response = await fetch(
		new URL("/api/workspace/runner/pair", apiBaseUrl),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				pairingToken,
				runnerMode,
				runnerLabel:
					runnerMode === "one_shot" ? "One-shot runner" : "Local daemon",
				machineDisplayName,
				runnerVersion: LOCAL_RUNNER_VERSION,
			}),
		},
	);
	if (!response.ok) {
		const message = await response.text();
		throw new Error(`Pairing failed with HTTP ${response.status}: ${message}`);
	}

	const body = (await response.json()) as PairResponse;
	if (
		!body.projectId ||
		!body.runnerId ||
		!body.runnerToken ||
		!body.eventEndpoint
	) {
		throw new Error("Pairing response was missing required runner fields.");
	}
	return body;
}

function parseSetupPairOptions(argv: string[]) {
	const [pairingToken, ...rest] = argv;
	if (!pairingToken) {
		throw new Error("Usage: ship-by-sunday setup pair <token>");
	}

	const options: SetupPairOptions = { runnerMode: "daemon" };
	for (let index = 0; index < rest.length; index += 1) {
		const arg = rest[index];
		if (arg === "--repo") {
			options.repo = requireOptionValue(rest, index, "--repo");
			index += 1;
		} else if (arg === "--api-url") {
			options.apiUrl = requireOptionValue(rest, index, "--api-url");
			index += 1;
		} else if (arg === "--json") {
			options.json = true;
		} else if (arg === "--repair") {
			options.repair = true;
		} else if (arg === "--runner-mode") {
			const mode = requireOptionValue(rest, index, "--runner-mode");
			if (mode !== "daemon" && mode !== "one_shot") {
				throw new Error("--runner-mode must be daemon or one_shot.");
			}
			options.runnerMode = mode;
			index += 1;
		} else {
			throw new Error(`Unknown setup pair option: ${arg}`);
		}
	}

	return { pairingToken, options };
}

function normalizeApiBaseUrl(apiBaseUrl: string) {
	const url = new URL(apiBaseUrl);
	return url.toString();
}

function digestPairingToken(pairingToken: string) {
	return `sha256:${createHash("sha256").update(pairingToken).digest("hex")}`;
}

function requireOptionValue(argv: string[], index: number, optionName: string) {
	const value = argv[index + 1];
	if (!value) {
		throw new Error(`${optionName} requires a value.`);
	}
	return value;
}
