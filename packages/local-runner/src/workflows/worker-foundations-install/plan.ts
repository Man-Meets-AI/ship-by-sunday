import type { JsonObject, JsonValue } from "../../core/json-value";
import {
	WORKER_FOUNDATIONS_BUNDLE_VERSION,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
	WORKER_FOUNDATIONS_PROOF_SCRIPTS,
	WORKER_FOUNDATIONS_ROOT_SCRIPTS,
	type WorkerFoundationsRootScript,
} from "./manifest";
import { buildPrivacyBoundary } from "./privacy";
import {
	recognizeWorkerScriptCommand,
	requiredManagedFileRefs,
} from "./templates";
import type {
	TargetRepoInspection,
	WorkerInstallBlocker,
	WorkerInstallOperation,
	WorkerInstallPlan,
	WorkerNodeRuntimePlan,
} from "./types";

export function buildInstallPlan(
	inspection: TargetRepoInspection,
): WorkerInstallPlan {
	const operations: WorkerInstallOperation[] = [];
	operations.push(buildNodeRuntimeOperation(inspection.nodeRuntime));
	for (const scriptName of WORKER_FOUNDATIONS_ROOT_SCRIPTS) {
		operations.push(
			buildPackageScriptOperation({
				scriptName,
				packageJson: inspection.packageJson,
				packageJsonExists: inspection.packageJsonExists,
			}),
		);
	}
	for (const targetRef of requiredManagedFileRefs(inspection.packageManager)) {
		operations.push({
			operationId: `file:${targetRef}`,
			surface: "file",
			targetRef,
			status: "planned",
			reason: "Worker-managed file will be created or refreshed safely.",
		});
	}
	for (const blocker of inspection.blockers) {
		operations.push({
			operationId: `blocked:${blocker.blockerId}`,
			surface: "preflight",
			targetRef: blocker.targetRef ?? "preflight",
			status: "blocked",
			reason: blocker.reason,
		});
	}

	return {
		schemaVersion: "worker-foundations-install-plan.v1",
		workflowId: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
		workflowVersion: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
		workerBundleVersion: WORKER_FOUNDATIONS_BUNDLE_VERSION,
		packageManager: inspection.packageManager,
		toolchain: inspection.nodeRuntime,
		operations,
		blockers: [
			...inspection.blockers,
			...operations
				.filter((operation) => operation.status === "blocked")
				.filter(
					(operation) =>
						!inspection.blockers.some(
							(blocker) =>
								`blocked:${blocker.blockerId}` === operation.operationId,
						),
				)
				.map((operation) => ({
					blockerId: operation.operationId,
					targetRef: operation.targetRef,
					reason: operation.reason,
				})),
		],
		proofCommands: WORKER_FOUNDATIONS_PROOF_SCRIPTS.map(
			(scriptName) => `${inspection.packageManager} run ${scriptName}`,
		),
		privacyBoundary: buildPrivacyBoundary(),
	};
}

export function addPlanBlocker(
	plan: WorkerInstallPlan,
	blocker: WorkerInstallBlocker,
): WorkerInstallPlan {
	return {
		...plan,
		blockers: [...plan.blockers, blocker],
		operations: [
			...plan.operations,
			{
				operationId: `blocked:${blocker.blockerId}`,
				surface: "preflight",
				targetRef: blocker.targetRef ?? "preflight",
				status: "blocked",
				reason: blocker.reason,
			},
		],
	};
}

function buildNodeRuntimeOperation(
	runtime: WorkerNodeRuntimePlan,
): WorkerInstallOperation {
	if (runtime.status === "available") {
		return {
			operationId: "runtime:node",
			surface: "toolchain",
			targetRef: runtime.targetRef,
			status: "keep",
			reason: "Node is available on PATH.",
		};
	}
	return {
		operationId: "runtime:node",
		surface: "toolchain",
		targetRef: runtime.targetRef,
		status: "blocked",
		reason: "Node is required for Worker commands.",
	};
}

function buildPackageScriptOperation({
	scriptName,
	packageJson,
	packageJsonExists,
}: {
	scriptName: WorkerFoundationsRootScript;
	packageJson: JsonObject;
	packageJsonExists: boolean;
}): WorkerInstallOperation {
	if (!packageJsonExists) {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${scriptName}`,
			status: "add",
			reason:
				"Root package.json will be created with npm defaults and this Worker command script.",
		};
	}
	const scripts = packageJson.scripts;
	if (scripts !== undefined && !isJsonObject(scripts)) {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: "package.json#scripts",
			status: "blocked",
			reason: "Root package.json scripts field must be an object.",
		};
	}
	const currentScript = isJsonObject(scripts) ? scripts[scriptName] : undefined;
	if (currentScript === undefined) {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${scriptName}`,
			status: "add",
			reason: "Missing Worker command script will be added.",
		};
	}
	if (typeof currentScript !== "string") {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${scriptName}`,
			status: "blocked",
			reason: "Existing same-name package script is not a string.",
		};
	}
	const recognition = recognizeWorkerScriptCommand(scriptName, currentScript);
	if (recognition === "keep") {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${scriptName}`,
			status: "keep",
			reason: "Existing Worker command script is recognized.",
		};
	}
	if (recognition === "update-managed") {
		return {
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${scriptName}`,
			status: "update-managed",
			reason: "Existing legacy Worker runtime script will be updated.",
		};
	}
	return {
		operationId: `package-script:${scriptName}`,
		surface: "package-script",
		targetRef: `package.json#scripts.${scriptName}`,
		status: "blocked",
		reason:
			"Existing same-name package script is not recognized as Worker-managed.",
	};
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
