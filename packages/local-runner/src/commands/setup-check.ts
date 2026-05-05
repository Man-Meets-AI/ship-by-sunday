import {
	applySbsCodexConfigPatch,
	previewSbsCodexConfigPatch,
	rollbackSbsCodexConfigPatch,
} from "../core/codex-config-manager";
import { readRunnerCredential } from "../core/local-runner-home";
import { readLocalProjectState } from "../core/local-project-state";
import {
	runMachineSetupChecks,
	type SetupCheckResult,
} from "../core/machine-setup";
import { runProjectSetupChecks } from "../core/project-setup";
import { resolveRepositoryRoot } from "../core/repository-root";
import {
	createRunnerEvent,
	flushRunnerEvents,
	queueRunnerEvent,
	type SetupCheckStatus,
} from "../core/runner-events";

export type SetupCheckCommandResult = {
	repositoryRoot: string;
	checks: SetupCheckResult[];
	machineStatus: SetupCheckStatus;
	projectStatus: SetupCheckStatus;
};

type SetupCheckOptions = {
	repo?: string;
	json?: boolean;
	codexConfigPreview?: boolean;
	applyCodexConfig?: boolean;
	rollbackCodexConfigBackupPath?: string;
	noSync?: boolean;
};

export async function runSetupCheckCommand(argv: string[]) {
	const options = parseSetupCheckOptions(argv);
	const { repositoryRoot, isGitRepository } = await resolveRepositoryRoot({
		explicitRoot: options.repo,
		allowNonGit: true,
	});

	if (options.rollbackCodexConfigBackupPath) {
		const result = await rollbackSbsCodexConfigPatch({
			backupPath: options.rollbackCodexConfigBackupPath,
		});
		if (options.json) {
			console.log(JSON.stringify(result, null, 2));
		} else {
			console.log(`Restored Codex config from ${result.backupPath}.`);
			console.log(`Previous config saved at ${result.rollbackBackupPath}.`);
		}
		return 0;
	}

	if (options.codexConfigPreview || options.applyCodexConfig) {
		const preview = options.applyCodexConfig
			? await applySbsCodexConfigPatch()
			: await previewSbsCodexConfigPatch();
		if (options.json) {
			console.log(JSON.stringify(preview, null, 2));
		} else if (preview.changed) {
			console.log(preview.diff);
			if (!options.applyCodexConfig) {
				console.log(
					"Run ship-by-sunday setup check --apply-codex-config to apply this SBS-owned block.",
				);
			}
		} else {
			console.log("Codex config already contains the SBS managed block.");
		}
		return 0;
	}

	const result = await collectSetupChecks({ repositoryRoot, isGitRepository });
	if (!options.noSync) {
		await queueSetupCheckEvents(repositoryRoot, result.checks);
		await flushSetupCheckEvents(repositoryRoot);
	}

	if (options.json) {
		console.log(JSON.stringify(result, null, 2));
	} else {
		printSetupChecks(result);
	}

	return hasBlockedCheck(result.checks) ? 2 : 0;
}

export async function collectSetupChecks({
	repositoryRoot,
	isGitRepository,
}: {
	repositoryRoot: string;
	isGitRepository: boolean;
}): Promise<SetupCheckCommandResult> {
	const [machineChecks, projectChecks] = await Promise.all([
		runMachineSetupChecks({ repositoryRoot }),
		runProjectSetupChecks({ repositoryRoot, isGitRepository }),
	]);
	const checks = [...machineChecks, ...projectChecks];
	return {
		repositoryRoot,
		checks,
		machineStatus: summarizeScopeStatus(checks, "machine"),
		projectStatus: summarizeScopeStatus(checks, "project"),
	};
}

export async function queueSetupCheckEvents(
	repositoryRoot: string,
	checks: SetupCheckResult[],
) {
	const state = await readLocalProjectState(repositoryRoot);
	if (!state) {
		return;
	}

	for (const check of checks) {
		await queueRunnerEvent(
			repositoryRoot,
			createRunnerEvent({
				projectId: state.projectId,
				runnerId: state.runnerId,
				payload: {
					eventType: "setup.check.started",
					scope: check.scope,
					checkKey: check.checkKey,
					summary: check.summary,
				},
			}),
		);
		await queueRunnerEvent(
			repositoryRoot,
			createRunnerEvent({
				projectId: state.projectId,
				runnerId: state.runnerId,
				payload: {
					eventType: "setup.check.completed",
					scope: check.scope,
					checkKey: check.checkKey,
					status: check.status,
					summary: check.summary,
					remediationAction: check.remediationAction,
				},
			}),
		);
	}
}

export async function flushSetupCheckEvents(repositoryRoot: string) {
	const [state, credential] = await Promise.all([
		readLocalProjectState(repositoryRoot),
		readRunnerCredential({ repositoryRoot }),
	]);
	if (!state || !credential) {
		return null;
	}

	return await flushRunnerEvents({ repositoryRoot, credential });
}

function summarizeScopeStatus(
	checks: SetupCheckResult[],
	scope: "machine" | "project",
): SetupCheckStatus {
	const scopedChecks = checks.filter((check) => check.scope === scope);
	if (scopedChecks.some((check) => check.status === "blocked")) {
		return "blocked";
	}
	if (scopedChecks.some((check) => check.status === "warning")) {
		return "warning";
	}
	if (scopedChecks.length > 0) {
		return "ready";
	}
	return "unknown";
}

function hasBlockedCheck(checks: SetupCheckResult[]) {
	return checks.some((check) => check.status === "blocked");
}

function printSetupChecks(result: SetupCheckCommandResult) {
	console.log(`Repository: ${result.repositoryRoot}`);
	console.log(
		`Machine Setup: ${result.machineStatus}; Project Setup: ${result.projectStatus}`,
	);
	for (const check of result.checks) {
		const remediation = check.remediationAction
			? ` Repair: ${check.remediationAction}`
			: "";
		console.log(
			`[${check.status}] ${check.scope}/${check.checkKey}: ${check.summary}${remediation}`,
		);
	}
}

function parseSetupCheckOptions(argv: string[]): SetupCheckOptions {
	const options: SetupCheckOptions = {};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--repo") {
			options.repo = requireOptionValue(argv, index, "--repo");
			index += 1;
		} else if (arg === "--json") {
			options.json = true;
		} else if (arg === "--codex-config-preview") {
			options.codexConfigPreview = true;
		} else if (arg === "--apply-codex-config") {
			options.applyCodexConfig = true;
		} else if (arg === "--rollback-codex-config") {
			options.rollbackCodexConfigBackupPath = requireOptionValue(
				argv,
				index,
				"--rollback-codex-config",
			);
			index += 1;
		} else if (arg === "--no-sync") {
			options.noSync = true;
		} else {
			throw new Error(`Unknown setup check option: ${arg}`);
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
