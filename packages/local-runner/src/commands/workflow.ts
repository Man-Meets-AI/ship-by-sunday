import { readRunnerCredential } from "../core/local-runner-home";
import { readLocalProjectState } from "../core/local-project-state";
import { resolveRepositoryRoot } from "../core/repository-root";
import { runBrokenAppTriageWorkflow } from "../core/broken-app-triage-workflow";
import { runMatureRepoAdoptionWorkflow } from "../core/mature-repo-adoption-workflow";
import { runObservabilityDebuggabilityWorkflow } from "../core/observability-debuggability-workflow";
import { runSourceTruthWorkflow } from "../core/source-truth-workflow";
import { resolveApprovedWorkflowRun } from "../core/workflow-run-api";

type WorkflowCommandOptions = {
	repo?: string;
	json?: boolean;
	workflowRunId?: string;
	branchName?: string;
	profileName?: string;
	confirmLocalWrites?: boolean;
	confirmObservabilityAudit?: boolean;
	confirmReadOnlyReproduction?: boolean;
	confirmAdoptionAudit?: boolean;
};

export async function runWorkflowCommand(argv: string[]) {
	const [workflowName, action = "run", ...rest] = argv;
	if (
		(workflowName !== "source-truth-readiness" &&
			workflowName !== "observability-debuggability" &&
			workflowName !== "broken-app-triage" &&
			workflowName !== "mature-repo-adoption") ||
		action !== "run"
	) {
		throw new Error(
			"Usage: ship-by-sunday workflow <source-truth-readiness|observability-debuggability|broken-app-triage|mature-repo-adoption> run --workflow-run-id <id>",
		);
	}

	const options = parseWorkflowCommandOptions(rest);
	if (!options.workflowRunId) {
		throw new Error(
			`workflow ${workflowName} run requires --workflow-run-id.`,
		);
	}
	const { repositoryRoot } = await resolveRepositoryRoot({
		explicitRoot: options.repo,
	});
	const [state, credential] = await Promise.all([
		readLocalProjectState(repositoryRoot),
		readRunnerCredential({ repositoryRoot }),
	]);
	if (!state || !credential) {
		throw new Error(`Run setup pair before workflow ${workflowName} run.`);
	}
	const approvedWorkflowRun = await resolveApprovedWorkflowRun({
		state,
		credential,
		workflowRunId: options.workflowRunId,
	});
	if (
		options.branchName &&
		options.branchName !== approvedWorkflowRun.branchName
	) {
		throw new Error("Command branch does not match the approved workflow run.");
	}
	if (
		options.profileName &&
		options.profileName !== approvedWorkflowRun.profileName
	) {
		throw new Error(
			"Command profile does not match the approved workflow run.",
		);
	}

	const result =
		workflowName === "broken-app-triage"
			? await runBrokenAppTriageWorkflow({
					repositoryRoot,
					state,
					credential,
					approvedWorkflowRun,
					confirmReadOnlyReproduction:
						options.confirmReadOnlyReproduction === true,
				})
			: workflowName === "observability-debuggability"
				? await runObservabilityDebuggabilityWorkflow({
						repositoryRoot,
						state,
						credential,
						approvedWorkflowRun,
						confirmObservabilityAudit:
							options.confirmObservabilityAudit === true,
					})
				: workflowName === "mature-repo-adoption"
					? await runMatureRepoAdoptionWorkflow({
							repositoryRoot,
							state,
							credential,
							approvedWorkflowRun,
							confirmAdoptionAudit: options.confirmAdoptionAudit === true,
						})
			: await runSourceTruthWorkflow({
					repositoryRoot,
					state,
					credential,
					approvedWorkflowRun,
					confirmLocalWrites: options.confirmLocalWrites === true,
				});

	if (options.json) {
		console.log(JSON.stringify(result, null, 2));
	} else if (result.status === "blocked") {
		console.log(`${workflowName} workflow blocked: ${result.blockedReason}.`);
		console.log(`Local proof: ${result.localRunDirectoryRef}/proof.json.`);
	} else if (workflowName === "broken-app-triage") {
		console.log(`Broken-app triage wrote ${result.localRunDirectoryRef}.`);
		console.log(`Proof status: ${result.proofStatus}.`);
	} else if (workflowName === "observability-debuggability") {
		console.log(
			`Observability workflow wrote ${result.localRunDirectoryRef}.`,
		);
		console.log(`Branch: ${result.branchName}.`);
		console.log(`Proof status: ${result.proofStatus}.`);
	} else if (workflowName === "mature-repo-adoption") {
		console.log(
			`Mature repo adoption workflow wrote ${result.localRunDirectoryRef}.`,
		);
		console.log(`Branch: ${result.branchName}.`);
		console.log(`Proof status: ${result.proofStatus}.`);
	} else {
		console.log(`Source-truth workflow wrote ${result.localRunDirectoryRef}.`);
		console.log(`Branch: ${result.branchName}.`);
		console.log(`Proof status: ${result.proofStatus}.`);
	}

	return result.status === "blocked" ? 1 : 0;
}

function parseWorkflowCommandOptions(argv: string[]): WorkflowCommandOptions {
	const options: WorkflowCommandOptions = {};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--repo") {
			options.repo = requireOptionValue(argv, index, "--repo");
			index += 1;
		} else if (arg === "--json") {
			options.json = true;
		} else if (arg === "--workflow-run-id") {
			options.workflowRunId = requireOptionValue(
				argv,
				index,
				"--workflow-run-id",
			);
			index += 1;
		} else if (arg === "--branch-name") {
			options.branchName = requireOptionValue(argv, index, "--branch-name");
			index += 1;
		} else if (arg === "--profile") {
			options.profileName = requireOptionValue(argv, index, "--profile");
			index += 1;
		} else if (arg === "--confirm-local-writes") {
			options.confirmLocalWrites = true;
		} else if (arg === "--confirm-observability-audit") {
			options.confirmObservabilityAudit = true;
		} else if (arg === "--confirm-read-only-reproduction") {
			options.confirmReadOnlyReproduction = true;
		} else if (arg === "--confirm-adoption-audit") {
			options.confirmAdoptionAudit = true;
		} else {
			throw new Error(`Unknown workflow option: ${arg}`);
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
