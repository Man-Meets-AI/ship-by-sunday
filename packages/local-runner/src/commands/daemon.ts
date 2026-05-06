import {
	clearLocalDaemonStop,
	readLocalDaemonStatus,
	readLocalProjectState,
	requestLocalDaemonStop,
	shouldStopLocalDaemon,
	writeLocalDaemonStatus,
} from "../core/local-project-state";
import { readRunnerCredential } from "../core/local-runner-home";
import { resolveRepositoryRoot } from "../core/repository-root";
import {
	createRunnerEvent,
	flushRunnerEvents,
	queueRunnerEvent,
	type SetupCheckStatus,
} from "../core/runner-events";
import { runBrokenAppTriageWorkflow } from "../core/broken-app-triage-workflow";
import { runDocsSpineAdoptionWorkflow } from "../core/docs-spine-adoption-workflow";
import { runDocsSpineApplyWorkflow } from "../core/docs-spine-apply-and-proof-workflow";
import { runMatureRepoAdoptionWorkflow } from "../core/mature-repo-adoption-workflow";
import { runObservabilityDebuggabilityWorkflow } from "../core/observability-debuggability-workflow";
import { runSourceTruthWorkflow } from "../core/source-truth-workflow";
import { claimApprovedWorkflowRun } from "../core/workflow-run-api";
import { collectSetupChecks } from "./setup-check";

type DaemonOptions = {
	repo?: string;
	json?: boolean;
	once?: boolean;
	work?: boolean;
	confirmLocalWrites?: boolean;
	confirmObservabilityAudit?: boolean;
	confirmAdoptionAudit?: boolean;
	confirmDocsSpineAdoption?: boolean;
	confirmDocsSpineApply?: boolean;
	intervalMs: number;
};

export async function runDaemonCommand(argv: string[]) {
	const [action, ...rest] = argv;
	if (action === "start") {
		return await runDaemonStart(rest);
	}
	if (action === "status") {
		return await runDaemonStatus(rest);
	}
	if (action === "stop") {
		return await runDaemonStop(rest);
	}
	throw new Error("Usage: ship-by-sunday daemon <start|status|stop>");
}

async function runDaemonStart(argv: string[]) {
	const options = parseDaemonOptions(argv);
	if (options.work) {
		assertDaemonWorkerConfirmations({
			confirmLocalWrites: options.confirmLocalWrites === true,
			confirmObservabilityAudit: options.confirmObservabilityAudit === true,
			confirmAdoptionAudit: options.confirmAdoptionAudit === true,
			confirmDocsSpineAdoption: options.confirmDocsSpineAdoption === true,
			confirmDocsSpineApply: options.confirmDocsSpineApply === true,
		});
	}
	const { repositoryRoot, isGitRepository } = await resolveRepositoryRoot({
		explicitRoot: options.repo,
	});
	await clearLocalDaemonStop(repositoryRoot);
	await writeLocalDaemonStatus(repositoryRoot, {
		schemaVersion: 1,
		status: "starting",
		pid: process.pid,
		startedAt: Date.now(),
		updatedAt: Date.now(),
	});

	do {
		await sendHeartbeat({ repositoryRoot, isGitRepository });
		if (options.work) {
			await claimAndRunNextWorkflow({
				repositoryRoot,
				confirmLocalWrites: options.confirmLocalWrites === true,
				confirmObservabilityAudit: options.confirmObservabilityAudit === true,
				confirmAdoptionAudit: options.confirmAdoptionAudit === true,
				confirmDocsSpineAdoption: options.confirmDocsSpineAdoption === true,
				confirmDocsSpineApply: options.confirmDocsSpineApply === true,
			});
		}
		if (options.once) {
			break;
		}
		await wait(options.intervalMs);
	} while (!shouldStopLocalDaemon(repositoryRoot));

	await writeLocalDaemonStatus(repositoryRoot, {
		schemaVersion: 1,
		status: "offline",
		pid: process.pid,
		updatedAt: Date.now(),
	});
	return 0;
}

async function runDaemonStatus(argv: string[]) {
	const options = parseDaemonOptions(argv);
	const { repositoryRoot } = await resolveRepositoryRoot({
		explicitRoot: options.repo,
		allowNonGit: true,
	});
	const status = await readLocalDaemonStatus(repositoryRoot);
	if (options.json) {
		console.log(JSON.stringify({ repositoryRoot, status }, null, 2));
	} else if (status) {
		console.log(
			`${status.status} updated at ${new Date(status.updatedAt).toISOString()}`,
		);
	} else {
		console.log("offline");
	}
	return status?.status === "errored" ? 2 : 0;
}

async function runDaemonStop(argv: string[]) {
	const options = parseDaemonOptions(argv);
	const { repositoryRoot } = await resolveRepositoryRoot({
		explicitRoot: options.repo,
		allowNonGit: true,
	});
	await requestLocalDaemonStop(repositoryRoot);
	await writeLocalDaemonStatus(repositoryRoot, {
		schemaVersion: 1,
		status: "stopping",
		updatedAt: Date.now(),
	});
	console.log("Stop requested.");
	return 0;
}

async function sendHeartbeat({
	repositoryRoot,
	isGitRepository,
}: {
	repositoryRoot: string;
	isGitRepository: boolean;
}) {
	const [state, credential] = await Promise.all([
		readLocalProjectState(repositoryRoot),
		readRunnerCredential({ repositoryRoot }),
	]);
	if (!state || !credential) {
		throw new Error("Run setup pair before starting the daemon.");
	}

	const setupChecks = await collectSetupChecks({
		repositoryRoot,
		isGitRepository,
	});
	await queueRunnerEvent(
		repositoryRoot,
		createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			payload: {
				eventType: "runner.heartbeat",
				runnerMode: state.runnerMode,
				status:
					setupChecks.machineStatus === "blocked" ||
					setupChecks.projectStatus === "blocked"
						? "degraded"
						: "online",
				machineHealthStatus: setupChecks.machineStatus as SetupCheckStatus,
				projectHealthStatus: setupChecks.projectStatus as SetupCheckStatus,
			},
		}),
	);
	const flushResult = await flushRunnerEvents({ repositoryRoot, credential });
	await writeLocalDaemonStatus(repositoryRoot, {
		schemaVersion: 1,
		status: flushResult.remaining > 0 ? "errored" : "online",
		pid: process.pid,
		updatedAt: Date.now(),
		lastHeartbeatAt: Date.now(),
		lastError:
			flushResult.remaining > 0
				? "Runner event delivery is queued."
				: undefined,
	});
}

async function claimAndRunNextWorkflow({
	repositoryRoot,
	confirmLocalWrites,
	confirmObservabilityAudit,
	confirmAdoptionAudit,
	confirmDocsSpineAdoption,
	confirmDocsSpineApply,
}: {
	repositoryRoot: string;
	confirmLocalWrites: boolean;
	confirmObservabilityAudit: boolean;
	confirmAdoptionAudit: boolean;
	confirmDocsSpineAdoption: boolean;
	confirmDocsSpineApply: boolean;
}) {
	assertDaemonWorkerConfirmations({
		confirmLocalWrites,
		confirmObservabilityAudit,
		confirmAdoptionAudit,
		confirmDocsSpineAdoption,
		confirmDocsSpineApply,
	});

	const [state, credential] = await Promise.all([
		readLocalProjectState(repositoryRoot),
		readRunnerCredential({ repositoryRoot }),
	]);
	if (!state || !credential) {
		throw new Error("Run setup pair before starting worker mode.");
	}

	const approvedWorkflowRun = await claimApprovedWorkflowRun({
		state,
		credential,
	});
	if (!approvedWorkflowRun) {
		return null;
	}
	if (approvedWorkflowRun.workflowId === "broken-app-triage") {
		return await runBrokenAppTriageWorkflow({
			repositoryRoot,
			state,
			credential,
			approvedWorkflowRun,
			confirmReadOnlyReproduction: true,
		});
	}
	if (approvedWorkflowRun.workflowId === "source-truth-agent-readiness") {
		return await runSourceTruthWorkflow({
			repositoryRoot,
			state,
			credential,
			approvedWorkflowRun,
			confirmLocalWrites,
		});
	}
	if (approvedWorkflowRun.workflowId === "observability-debuggability") {
		return await runObservabilityDebuggabilityWorkflow({
			repositoryRoot,
			state,
			credential,
			approvedWorkflowRun,
			confirmObservabilityAudit,
		});
	}
	if (approvedWorkflowRun.workflowId === "mature-repo-adoption") {
		return await runMatureRepoAdoptionWorkflow({
			repositoryRoot,
			state,
			credential,
			approvedWorkflowRun,
			confirmAdoptionAudit,
		});
	}
	if (approvedWorkflowRun.workflowId === "docs-spine-adoption") {
		return await runDocsSpineAdoptionWorkflow({
			repositoryRoot,
			state,
			credential,
			approvedWorkflowRun,
			confirmDocsSpineAdoption,
		});
	}
	if (approvedWorkflowRun.workflowId === "docs-spine-apply-and-proof") {
		return await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state,
			credential,
			approvedWorkflowRun,
			confirmDocsSpineApply,
		});
	}
	throw new Error(
		`Unsupported approved workflow: ${approvedWorkflowRun.workflowId}`,
	);
}

function assertDaemonWorkerConfirmations({
	confirmLocalWrites,
	confirmObservabilityAudit,
	confirmAdoptionAudit,
	confirmDocsSpineAdoption,
	confirmDocsSpineApply,
}: {
	confirmLocalWrites: boolean;
	confirmObservabilityAudit: boolean;
	confirmAdoptionAudit: boolean;
	confirmDocsSpineAdoption: boolean;
	confirmDocsSpineApply: boolean;
}) {
	if (!confirmLocalWrites) {
		throw new Error(
			"daemon start --work requires --confirm-local-writes for approved queue jobs.",
		);
	}
	if (!confirmObservabilityAudit) {
		throw new Error(
			"daemon start --work requires --confirm-observability-audit because the queue can claim observability audit jobs.",
		);
	}
	if (!confirmAdoptionAudit) {
		throw new Error(
			"daemon start --work requires --confirm-adoption-audit because the queue can claim mature repo adoption jobs.",
		);
	}
	if (!confirmDocsSpineAdoption) {
		throw new Error(
			"daemon start --work requires --confirm-docs-spine-adoption because the queue can claim docs-spine adoption jobs.",
		);
	}
	if (!confirmDocsSpineApply) {
		throw new Error(
			"daemon start --work requires --confirm-docs-spine-apply because the queue can claim docs-spine apply jobs.",
		);
	}
}

function parseDaemonOptions(argv: string[]): DaemonOptions {
	const options: DaemonOptions = { intervalMs: 30_000 };
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--repo") {
			options.repo = requireOptionValue(argv, index, "--repo");
			index += 1;
		} else if (arg === "--json") {
			options.json = true;
		} else if (arg === "--once") {
			options.once = true;
		} else if (arg === "--work") {
			options.work = true;
		} else if (arg === "--confirm-local-writes") {
			options.confirmLocalWrites = true;
		} else if (arg === "--confirm-observability-audit") {
			options.confirmObservabilityAudit = true;
		} else if (arg === "--confirm-adoption-audit") {
			options.confirmAdoptionAudit = true;
		} else if (arg === "--confirm-docs-spine-adoption") {
			options.confirmDocsSpineAdoption = true;
		} else if (arg === "--confirm-docs-spine-apply") {
			options.confirmDocsSpineApply = true;
		} else if (arg === "--interval-ms") {
			options.intervalMs = Number(
				requireOptionValue(argv, index, "--interval-ms"),
			);
			index += 1;
		} else {
			throw new Error(`Unknown daemon option: ${arg}`);
		}
	}
	return options;
}

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireOptionValue(argv: string[], index: number, optionName: string) {
	const value = argv[index + 1];
	if (!value) {
		throw new Error(`${optionName} requires a value.`);
	}
	return value;
}
