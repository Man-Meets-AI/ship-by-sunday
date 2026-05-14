import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { Effect } from "effect";

import {
	type BoundedProcessResult,
	type BoundedProcessService,
	NodeBoundedProcessServiceLive,
	runBoundedProcessEffect,
} from "../../core/bounded-process";
import type { JsonObject } from "../../core/json-value";
import { assertSyncSafeValue } from "../../core/redaction";
import {
	normalizeLocalRunnerEffectError,
	runLocalRunnerEffect,
} from "../../effect/runtime";
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

type WorkerPackageScriptResult = BoundedProcessResult & {
	command: string;
};

export async function runDogfoodChildPlan(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	return await runLocalRunnerEffect(
		runDogfoodChildPlanEffect(context, packageManager).pipe(
			Effect.provide(NodeBoundedProcessServiceLive),
		),
	);
}

export function runDogfoodChildPlanEffect(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
): Effect.Effect<WorkerPackageScriptResult, Error, BoundedProcessService> {
	return Effect.flatMap(
		recognizedStarterChildPlanEffect(context),
		(recognized) =>
			recognized
				? Effect.succeed<WorkerPackageScriptResult>({
						succeeded: true,
						stdout: "",
						stderr: "",
						timedOut: false,
						command: `${packageManager} run program:write-child-plan`,
					})
				: runPackageScriptEffect({
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
					}),
	);
}

export async function runProofCommands(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
) {
	return await runLocalRunnerEffect(
		runProofCommandsEffect(context, packageManager).pipe(
			Effect.provide(NodeBoundedProcessServiceLive),
		),
	);
}

export function runProofCommandsEffect(
	context: WorkerInstallContext,
	packageManager: RootPackageManager,
): Effect.Effect<WorkerProofCommandStatus[], never, BoundedProcessService> {
	return Effect.gen(function* () {
		const proof: WorkerProofCommandStatus[] = [];
		for (const scriptName of WORKER_FOUNDATIONS_PROOF_SCRIPTS) {
			const result = yield* runPackageScriptEffect({
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
	});
}

function recognizedStarterChildPlanEffect(
	context: WorkerInstallContext,
): Effect.Effect<boolean, Error> {
	return Effect.suspend(() => {
		const childPlanPath = path.join(
			context.repositoryRoot,
			STARTER_CHILD_PLAN_REF,
		);
		if (!existsSync(childPlanPath)) {
			return Effect.succeed(false);
		}
		return Effect.map(
			Effect.tryPromise({
				try: () => readFile(childPlanPath, "utf8"),
				catch: normalizeLocalRunnerEffectError,
			}),
			isRecognizedStarterChildPlan,
		);
	});
}

function runPackageScriptEffect({
	context,
	packageManager,
	scriptName,
	args,
}: {
	context: WorkerInstallContext;
	packageManager: RootPackageManager;
	scriptName: string;
	args: string[];
}): Effect.Effect<WorkerPackageScriptResult, never, BoundedProcessService> {
	const commandArgs = packageRunArgs({ packageManager, scriptName, args });
	return Effect.map(
		runBoundedProcessEffect({
			command: packageManager,
			args: commandArgs,
			cwd: context.repositoryRoot,
			env: buildWorkerProcessEnv(context),
			timeoutMs: 30_000,
		}),
		(result) => ({
			...result,
			command: `${packageManager} ${commandArgs.join(" ")}`,
		}),
	);
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
