import type {
	WorkerInstallOperation,
	WorkerInstallOptions,
	WorkerInstallPlan,
} from "./types";

export async function confirmInstall({
	options,
	plan,
}: {
	options: WorkerInstallOptions;
	plan: WorkerInstallPlan;
}) {
	process.stdout.write(renderInteractiveInstallChecklist({ options, plan }));
	process.stdout.write("Continue? [y/N] ");
	const answer = await new Promise<string>((resolve) => {
		process.stdin.once("data", (chunk) => resolve(String(chunk)));
	});
	return answer.trim().toLowerCase() === "y";
}

function renderInteractiveInstallChecklist({
	options,
	plan,
}: {
	options: WorkerInstallOptions;
	plan: WorkerInstallPlan;
}) {
	const packageScriptOperations = plan.operations.filter(
		(operation) => operation.surface === "package-script",
	);
	const managedFileOperations = plan.operations.filter(
		(operation) => operation.surface === "file",
	);
	const runtimeOperation = plan.operations.find(
		(operation) => operation.operationId === "runtime:node",
	);
	const lines = [
		"Shipbysunday Worker Foundations install checklist",
		"",
		"Preflight",
		...renderPreflightChecklist(plan),
		"",
		"Install",
		renderOperationChecklistItem("Worker Node runtime", [runtimeOperation]),
		renderOperationChecklistItem(
			"Root command scripts",
			packageScriptOperations,
		),
		renderOperationChecklistItem("Worker-managed files", managedFileOperations),
		"",
		"Proof",
		...plan.proofCommands.map((command) => `- [ ] ${command}`),
		"",
		"Finish",
		options.noCommit
			? "- [ ] Local commit skipped by --no-commit."
			: "- [ ] Create a local commit on shipbysunday/install after proof passes.",
		options.noKickoff
			? "- [ ] Codex kickoff skipped by --no-kickoff."
			: "- [ ] Start Codex with the Worker-managed project-write profile.",
		"",
		"All listed phases are required for v1; continue or cancel.",
		"",
	];
	return lines.join("\n");
}

function renderPreflightChecklist(plan: WorkerInstallPlan) {
	if (plan.blockers.length === 0) {
		return [
			"- [x] Target repo is clean and ready.",
			"- [x] Worker license is valid outside the repo.",
		];
	}
	return plan.blockers.map((blocker) => {
		const target = blocker.targetRef ? ` (${blocker.targetRef})` : "";
		return `- [!] ${blocker.reason}${target}`;
	});
}

function renderOperationChecklistItem(
	label: string,
	operations: Array<WorkerInstallOperation | undefined>,
) {
	const presentOperations = operations.filter(
		(operation): operation is WorkerInstallOperation => Boolean(operation),
	);
	if (presentOperations.length === 0) {
		return `- [x] ${label}: no changes needed.`;
	}
	const blockedOperation = presentOperations.find(
		(operation) => operation.status === "blocked",
	);
	if (blockedOperation) {
		return `- [!] ${label}: ${blockedOperation.reason}`;
	}
	const counts = countOperationsByStatus(presentOperations);
	const details = [
		counts.add > 0 ? `${counts.add} to add` : null,
		counts["update-managed"] > 0
			? `${counts["update-managed"]} managed updates`
			: null,
		counts.planned > 0 ? `${counts.planned} planned` : null,
		counts.keep > 0 ? `${counts.keep} already ready` : null,
	]
		.filter((detail): detail is string => Boolean(detail))
		.join(", ");
	return `- [ ] ${label}: ${details}.`;
}

function countOperationsByStatus(operations: WorkerInstallOperation[]) {
	const counts: Record<WorkerInstallOperation["status"], number> = {
		add: 0,
		blocked: 0,
		keep: 0,
		planned: 0,
		"update-managed": 0,
	};
	for (const operation of operations) {
		counts[operation.status] += 1;
	}
	return counts;
}
