import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { runBoundedProcess } from "../../core/bounded-process";
import type { JsonObject } from "../../core/json-value";
import { assertSyncSafeValue } from "../../core/redaction";
import { STARTER_CHILD_PLAN_REF, STARTER_PROGRAM_ID } from "./constants";
import { buildWorkerProcessEnv } from "./env";
import {
	WORKER_FOUNDATIONS_BUNDLE_VERSION,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
	WORKER_FOUNDATIONS_PROOF_SCRIPTS,
} from "./manifest";
import { buildPrivacyBoundary } from "./privacy";
import type {
	RootPackageManager,
	WorkerInstallContext,
	WorkerInstallPlan,
	WorkerProofCommandStatus,
} from "./types";
import { isRecognizedStarterChildPlan, writeRepoFile } from "./utils";

export async function runDogfoodChildPlan(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	const childPlanPath = path.join(
		context.repositoryRoot,
		STARTER_CHILD_PLAN_REF,
	);
	if (existsSync(childPlanPath)) {
		const currentContent = await readFile(childPlanPath, "utf8");
		if (isRecognizedStarterChildPlan(currentContent)) {
			return {
				succeeded: true,
				stdout: "",
				stderr: "",
				timedOut: false,
				command: `${packageManager} run program:write-child-plan`,
			};
		}
	}
	return await runPackageScript({
		context,
		packageManager,
		scriptName: "program:write-child-plan",
		args: [
			"--program-id",
			STARTER_PROGRAM_ID,
			"--plan",
			STARTER_CHILD_PLAN_REF,
			"--title",
			"Continue Worker Foundations Adoption",
			"--summary",
			"Continue from the installed Worker Foundations operating system.",
		],
	});
}

export async function runProofCommands(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	const proof: WorkerProofCommandStatus[] = [];
	for (const scriptName of WORKER_FOUNDATIONS_PROOF_SCRIPTS) {
		const result = await runPackageScript({
			context,
			packageManager,
			scriptName,
			args: [],
		});
		proof.push({
			command: `${packageManager} run ${scriptName}`,
			status: result.succeeded ? "passed" : "failed",
		});
		if (!result.succeeded) {
			break;
		}
	}
	return proof;
}

async function runPackageScript({
	context,
	packageManager,
	scriptName,
	args,
}: {
	context: WorkerInstallContext;
	packageManager: RootPackageManager;
	scriptName: string;
	args: string[];
}) {
	const commandArgs = packageRunArgs({ packageManager, scriptName, args });
	const result = await runBoundedProcess({
		command: packageManager,
		args: commandArgs,
		cwd: context.repositoryRoot,
		env: buildWorkerProcessEnv(context),
		timeoutMs: 30_000,
	});
	return {
		...result,
		command: `${packageManager} ${commandArgs.join(" ")}`,
	};
}

function packageRunArgs({
	packageManager,
	scriptName,
	args,
}: {
	packageManager: RootPackageManager;
	scriptName: string;
	args: string[];
}) {
	if (packageManager === "npm") {
		return args.length > 0
			? ["run", scriptName, "--", ...args]
			: ["run", scriptName];
	}
	return ["run", scriptName, ...args];
}

export async function writeLocalProof({
	context,
	plan,
	proof,
}: {
	context: WorkerInstallContext;
	plan: WorkerInstallPlan;
	proof: WorkerProofCommandStatus[];
}) {
	const proofRef = `.worker/runs/${context.runId}/install-proof.json`;
	const proofValue: JsonObject = {
		schemaVersion: "worker-foundations-install-proof.v1",
		workflowId: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
		workerBundleVersion: WORKER_FOUNDATIONS_BUNDLE_VERSION,
		plan,
		proof,
		privacyBoundary: buildPrivacyBoundary(),
	};
	assertSyncSafeValue(proofValue, "worker install proof");
	await writeRepoFile(
		context,
		proofRef,
		`${JSON.stringify(proofValue, null, 2)}\n`,
	);
	return proofRef;
}
