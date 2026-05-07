import { existsSync } from "node:fs";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { JsonValue } from "./json-value";
import { runBoundedProcess } from "./bounded-process";
import type { RunnerCredential } from "./local-runner-home";
import type { LocalProjectState } from "./local-project-state";
import { createRunnerEvent, type RunnerEvent } from "./runner-events";
import type { ApprovedWorkflowRunPacket } from "./workflow-run-api";
import { parseGitStatusPathsForProof } from "./docs-spine-adoption-workflow";
import {
	buildDocsOperatingSystemPackagePatch,
	buildPackagePatchSummary,
	type ExistingWrapperFile,
} from "../workflows/docs-operating-system-adoption/package-script-patching";
import {
	DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_CONFIRM_FLAG,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_DISALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_EXPECTED_OUTPUTS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_LOCAL_ARTIFACT_REFS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PHASES,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROFILE_NAME,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_NEXT_RECOMMENDED_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_DELIVERY,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROVIDER_ACCESS_POLICY,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_REVOCATION_BEHAVIOR,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_STOP_CONDITIONS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_SYNC_POLICY_SUMMARY,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
	DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS,
} from "../workflows/docs-operating-system-adoption/manifest";
import type {
	DocsOperatingSystemInstallPlan,
	DocsOperatingSystemPackagePatchBlockedReason,
	DocsOperatingSystemPackageScriptPatchingManifest,
	DocsOperatingSystemProofCommandResult,
} from "../workflows/docs-operating-system-adoption/schemas";

const SOURCE_INSTALL_PLAN_REF =
	".sbs/docs-operating-system-adoption/tooling-plan/install-plan.json";

export type DocsOperatingSystemPackageScriptPatchingWorkflowResult = {
	workflowRunId: string;
	workflowId: typeof DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID;
	status: "proof_completed" | "blocked";
	branchName: string;
	profileName: string;
	installProfile: typeof DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE;
	proofStatus: "passed" | "failed" | "blocked";
	localRunDirectoryRef: string;
	touchedFiles: string[];
	createdArtifacts: string[];
	blockedReason?: string;
	deliveredEvents: number;
	remainingEvents: number;
};

type RunDocsOperatingSystemPackageScriptPatchingWorkflowOptions = {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	approvedWorkflowRun: ApprovedWorkflowRunPacket;
	confirmDocsOperatingSystemToolingApply: boolean;
	now?: number;
	fetchRunnerEvent?: typeof fetch;
};

export async function runDocsOperatingSystemPackageScriptPatchingWorkflow({
	repositoryRoot,
	state,
	credential,
	approvedWorkflowRun,
	confirmDocsOperatingSystemToolingApply,
	now = Date.now(),
	fetchRunnerEvent,
}: RunDocsOperatingSystemPackageScriptPatchingWorkflowOptions): Promise<DocsOperatingSystemPackageScriptPatchingWorkflowResult> {
	const {
		workflowRunId,
		branchName,
		profileName,
		writeLeaseId,
		writeLeaseExpiresAt,
	} = approvedWorkflowRun;
	assertSafeWorkflowRunId(workflowRunId);
	const localRunDirectoryRef = `.sbs/runs/${workflowRunId}`;
	const localRunDirectory = path.join(repositoryRoot, localRunDirectoryRef);

	if (!confirmDocsOperatingSystemToolingApply) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "terminal-confirmation",
			blockedReason: `docs-operating-system-package-script-patching requires ${DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_CONFIRM_FLAG} because it writes package scripts and wrapper files.`,
			createdArtifacts: [],
			fetchRunnerEvent,
		});
	}

	if (
		approvedWorkflowRun.workflowId !==
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID
	) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "approval-packet",
			blockedReason:
				"Approved workflow run is not docs-operating-system-package-script-patching.",
			createdArtifacts: [],
			fetchRunnerEvent,
		});
	}

	try {
		assertApprovedDocsOperatingSystemPackageScriptPatchingPacket(
			approvedWorkflowRun,
		);
		assertSafeBranchName(branchName);
		assertApprovedProfile(profileName);
		assertApprovedInstallProfile(approvedWorkflowRun.installProfile);
	} catch (error) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "approval-packet",
			blockedReason: error instanceof Error ? error.message : String(error),
			createdArtifacts: [],
			fetchRunnerEvent,
		});
	}

	if (now >= writeLeaseExpiresAt) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "write-lease",
			blockedReason:
				"Approved write lease expired before package-script patching started.",
			createdArtifacts: [],
			fetchRunnerEvent,
		});
	}

	await ensureSafePackageScriptPatchingArtifactDirectory(
		repositoryRoot,
		localRunDirectoryRef,
		workflowRunId,
	);
	await mkdir(localRunDirectory, { recursive: true });

	const preRunDirtyFileRefs = await listGitDirtyFileRefs(repositoryRoot);
	const unsafePreRunDirtyFiles =
		listUnsafePreRunDirtyFiles(preRunDirtyFileRefs);
	if (unsafePreRunDirtyFiles.length > 0) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "dirty-state",
			blockedReason:
				"Worktree has dirty package.json, scripts/sbs-docs, or unsafe runner artifacts before package-script patching starts.",
			createdArtifacts: [],
			blockedDetails: unsafePreRunDirtyFiles.map((fileRef) => ({
				stage: "dirty-state",
				targetRef: fileRef,
				reason: "Dirty ref is inside the package-script patching authority.",
			})),
			fetchRunnerEvent,
		});
	}

	const baseBranchResult = await runGit(repositoryRoot, [
		"rev-parse",
		"--abbrev-ref",
		"HEAD",
	]);
	if (!baseBranchResult.succeeded) {
		return await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage: "base-branch",
			blockedReason: "Unable to read the current Git branch.",
			createdArtifacts: [],
			fetchRunnerEvent,
		});
	}
	const baseBranch = baseBranchResult.stdout.trim();

	const startEventResult = await sendRunnerEventDirect({
		credential,
		fetchRunnerEvent,
		event: createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.started",
				workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
				branchName,
				profileName,
			},
		}),
	});

	const workflowPacketRef = `${localRunDirectoryRef}/workflow-packet.json`;
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const manifestRef =
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_LOCAL_ARTIFACT_REFS.manifest;
	const applySummaryRef =
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_LOCAL_ARTIFACT_REFS.applySummary;
	const createdArtifacts = [
		workflowPacketRef,
		manifestRef,
		applySummaryRef,
		proofRef,
		syncPreviewRef,
	];
	let approvedSourceTargetRefs: string[] = [];

	try {
		const installPlan = await readInstallPlan(repositoryRoot);
		const packageJsonText = await readTextIfExists(
			repositoryRoot,
			"package.json",
		);
		const existingWrapperFiles = await readExistingWrapperFiles(repositoryRoot);
		const packagePatch = buildDocsOperatingSystemPackagePatch({
			installPlan,
			packageJsonText,
			existingWrapperFiles,
		});
		const applySummary = buildPackagePatchSummary({
			sourceInstallPlanRef: SOURCE_INSTALL_PLAN_REF,
			patch: packagePatch,
			now,
		});

		await writeJsonArtifact(repositoryRoot, workflowRunId, workflowPacketRef, {
			schemaVersion:
				"docs-operating-system-package-script-patching-workflow-packet.v1",
			workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
			workflowVersion:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
			projectId: state.projectId,
			runnerId: state.runnerId,
			profileName,
			installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
			writeLeaseId,
			writeLeaseExpiresAt,
			baseBranch,
			targetBranch: branchName,
			dirtyStatePolicy: "require_clean_worktree",
			executionSurface: "local_runner",
			sourceInstallPlanRef: SOURCE_INSTALL_PLAN_REF,
			codexInterpretation: "disabled for package-script patching workflow",
			codexWritePolicy:
				"disabled outside approved package.json, scripts/sbs-docs, and .sbs tooling-apply artifacts",
			localArtifacts: createdArtifacts,
			allowedTouchTargets:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ALLOWED_TOUCH_TARGETS,
			disallowedTouchTargets:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_DISALLOWED_TOUCH_TARGETS,
			providerAccessPolicy:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROVIDER_ACCESS_POLICY,
			proofCommands:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_COMMANDS,
			syncPolicy:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_SYNC_POLICY_SUMMARY,
			stopConditions:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_STOP_CONDITIONS,
			approvalRequired: true,
			expectedOutputs:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_EXPECTED_OUTPUTS,
			rollbackNotes:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ROLLBACK_NOTES,
			proofDelivery:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_DELIVERY,
			revocationBehavior:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_REVOCATION_BEHAVIOR,
			createdAt: now,
		});
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			manifestRef,
			buildManifest(now),
		);
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			applySummaryRef,
			applySummary,
		);

		if (packagePatch.status === "blocked") {
			return await blockWorkflow({
				repositoryRoot,
				state,
				credential,
				workflowRunId,
				branchName,
				profileName,
				writeLeaseId,
				localRunDirectoryRef,
				localRunDirectory,
				blockedStage: "install-plan-validation",
				blockedReason:
					"Docs operating system package-script patching blocked before source writes.",
				createdArtifacts: [workflowPacketRef, manifestRef, applySummaryRef],
				blockedDetails: packagePatch.blockedReasons,
				fetchRunnerEvent,
			});
		}
		approvedSourceTargetRefs = packagePatch.touchedFileRefs;

		const writePreflightBlockedReasons =
			await listPackagePatchWritePreflightBlockedReasons({
				repositoryRoot,
				targetRefs: [
					"package.json",
					...packagePatch.wrapperFiles.map((file) => file.targetRef),
				],
			});
		if (writePreflightBlockedReasons.length > 0) {
			return await blockWorkflow({
				repositoryRoot,
				state,
				credential,
				workflowRunId,
				branchName,
				profileName,
				writeLeaseId,
				localRunDirectoryRef,
				localRunDirectory,
				blockedStage: "write-preflight",
				blockedReason:
					"Docs operating system package-script patching blocked before source writes because approved targets are not writable files.",
				createdArtifacts: [workflowPacketRef, manifestRef, applySummaryRef],
				blockedDetails: writePreflightBlockedReasons,
				fetchRunnerEvent,
			});
		}

		for (const wrapperFile of packagePatch.wrapperFiles) {
			await writeTextTarget(
				repositoryRoot,
				wrapperFile.targetRef,
				wrapperFile.content,
			);
		}
		await writeTextTarget(
			repositoryRoot,
			"package.json",
			packagePatch.packageJsonText,
		);

		const { proofCommandResults, unexpectedTouchedFiles } =
			await runProofCommands({
				repositoryRoot,
				workflowRunId,
				preRunDirtyFileRefs,
				appliedFileRefs: packagePatch.touchedFileRefs,
			});
		const proofStatus =
			proofCommandResults.every((result) => result.status === "passed") &&
			unexpectedTouchedFiles.length === 0
				? "passed"
				: "failed";
		const proofSummary =
			proofStatus === "passed"
				? "Docs operating system package-script patching wrote only approved package, wrapper, and .sbs refs."
				: "Docs operating system package-script patching wrote local files, but proof found unexpected refs or command failures.";

		await writeJsonArtifact(repositoryRoot, workflowRunId, proofRef, {
			schemaVersion: "docs-operating-system-package-script-patching-proof.v1",
			workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
			workflowVersion:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
			workflowRunId,
			branchName,
			profileName,
			installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
			sourceInstallPlanRef: SOURCE_INSTALL_PLAN_REF,
			applySummaryRef,
			appliedOperations: packagePatch.appliedOperations,
			diffSummary: await readGitDiffSummary(repositoryRoot),
			preexistingDirtyFileRefs: preRunDirtyFileRefs,
			touchedFiles: packagePatch.touchedFileRefs,
			unexpectedTouchedFiles,
			createdArtifacts,
			proofCommandsRun: proofCommandResults.map((result) => result.commandName),
			proofCommandResults,
			rollbackInstructions:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ROLLBACK_NOTES,
			nextRecommendedWorkflow:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_NEXT_RECOMMENDED_WORKFLOW_ID,
			createdAt: now,
		});
		await writeJsonArtifact(repositoryRoot, workflowRunId, syncPreviewRef, {
			schemaVersion:
				"docs-operating-system-package-script-patching-sync-preview.v1",
			workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
			workflowVersion:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
			branchName,
			profileName,
			installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
			touchedFileRefs: packagePatch.touchedFileRefs,
			createdArtifactRefs: createdArtifacts,
			operationStatuses: packagePatch.appliedOperations.map((operation) => ({
				operationId: operation.operationId,
				surface: operation.surface,
				status: operation.status,
			})),
			proofCommandResults: proofCommandResults.map(
				({ commandName, status }) => ({
					commandName,
					status,
				}),
			),
			nextRecommendedWorkflowId:
				DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_NEXT_RECOMMENDED_WORKFLOW_ID,
		});

		const proofEventResult = await sendRunnerEventDirect({
			credential,
			fetchRunnerEvent,
			event: createRunnerEvent({
				projectId: state.projectId,
				runnerId: state.runnerId,
				workflowRunId,
				payload: {
					eventType: "workflow.proof.completed",
					workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
					writeLeaseId,
					proofStatus,
					proofSummary,
					touchedFileRefs: packagePatch.touchedFileRefs,
					createdArtifactRefs: createdArtifacts,
					proofCommandResults: proofCommandResults.map(
						({ commandName, status }) => ({
							commandName,
							status,
						}),
					),
					nextRecommendedWorkflowId:
						DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_NEXT_RECOMMENDED_WORKFLOW_ID,
				},
			}),
		});

		return {
			workflowRunId,
			workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
			status: "proof_completed",
			branchName,
			profileName,
			installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
			proofStatus,
			localRunDirectoryRef,
			touchedFiles: packagePatch.touchedFileRefs,
			createdArtifacts,
			deliveredEvents: startEventResult.delivered + proofEventResult.delivered,
			remainingEvents: startEventResult.remaining + proofEventResult.remaining,
		};
	} catch {
		const partialSourceTouchedFiles =
			await listPotentialPartialSourceTouchedFiles({
				repositoryRoot,
				preRunDirtyFileRefs,
				approvedSourceTargetRefs,
			}).catch(() => []);
		const blockedResult = await blockWorkflow({
			repositoryRoot,
			state,
			credential,
			workflowRunId,
			branchName,
			profileName,
			writeLeaseId,
			localRunDirectoryRef,
			localRunDirectory,
			blockedStage:
				partialSourceTouchedFiles.length > 0
					? "source-write"
					: "artifact-generation",
			blockedReason:
				partialSourceTouchedFiles.length > 0
					? "Docs operating system package-script patching failed after one or more approved source writes. Review and revert the touched source refs before retrying."
					: "Docs operating system package-script patching failed before proof artifacts could be completed.",
			createdArtifacts,
			touchedFiles: partialSourceTouchedFiles,
			rollbackInstructions:
				partialSourceTouchedFiles.length > 0
					? `Source files may have been patched: ${partialSourceTouchedFiles.join(", ")}. Review and revert those refs plus this run's .sbs artifacts before retrying.`
					: undefined,
			fetchRunnerEvent,
		});
		return {
			...blockedResult,
			deliveredEvents:
				startEventResult.delivered + blockedResult.deliveredEvents,
			remainingEvents:
				startEventResult.remaining + blockedResult.remainingEvents,
		};
	}
}

function buildManifest(
	now: number,
): DocsOperatingSystemPackageScriptPatchingManifest {
	return {
		schemaVersion: "docs-operating-system-package-script-patching-manifest.v1",
		workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
		workflowVersion:
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		phases: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PHASES,
		allowedTouchTargets:
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ALLOWED_TOUCH_TARGETS,
		disallowedTouchTargets:
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_DISALLOWED_TOUCH_TARGETS,
		proofCommands: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_COMMANDS,
		localArtifactRefs:
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_LOCAL_ARTIFACT_REFS,
		syncPolicySummary:
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_SYNC_POLICY_SUMMARY,
		rollbackNotes: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ROLLBACK_NOTES,
		createdAt: now,
	};
}

async function readInstallPlan(
	repositoryRoot: string,
): Promise<DocsOperatingSystemInstallPlan> {
	return JSON.parse(
		await readFile(path.join(repositoryRoot, SOURCE_INSTALL_PLAN_REF), "utf8"),
	) as DocsOperatingSystemInstallPlan;
}

async function readExistingWrapperFiles(
	repositoryRoot: string,
): Promise<ExistingWrapperFile[]> {
	return await Promise.all(
		Object.values(DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS).map(
			async (targetRef) => ({
				targetRef,
				content: await readTextIfExists(repositoryRoot, targetRef),
			}),
		),
	);
}

async function readTextIfExists(
	repositoryRoot: string,
	repoRelativePath: string,
) {
	const targetPath = path.join(repositoryRoot, repoRelativePath);
	const stats = await lstat(targetPath).catch((error) => {
		const code = (error as { code?: string }).code;
		if (code === "ENOENT" || code === "ENOTDIR") {
			return null;
		}
		throw error;
	});
	if (!stats) {
		return null;
	}
	if (!stats.isFile()) {
		return "";
	}
	return await readFile(targetPath, "utf8");
}

async function runProofCommands({
	repositoryRoot,
	workflowRunId,
	preRunDirtyFileRefs,
	appliedFileRefs,
}: {
	repositoryRoot: string;
	workflowRunId: string;
	preRunDirtyFileRefs: string[];
	appliedFileRefs: string[];
}) {
	const commands: Array<{ command: string; args: string[]; name: string }> = [
		{ command: "git", args: ["status", "--short"], name: "git status --short" },
		{
			command: "git",
			args: ["diff", "--name-only"],
			name: "git diff --name-only",
		},
		{ command: "git", args: ["diff", "--check"], name: "git diff --check" },
	];
	for (const wrapperRef of Object.values(
		DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS,
	)) {
		if (existsSync(path.join(repositoryRoot, wrapperRef))) {
			commands.push({
				command: "node",
				args: ["--check", wrapperRef],
				name: `node --check ${wrapperRef}`,
			});
		}
	}

	const results: DocsOperatingSystemProofCommandResult[] = [];
	const unexpectedTouchedFiles = await listUnexpectedTouchedFiles({
		repositoryRoot,
		workflowRunId,
		preRunDirtyFileRefs,
		appliedFileRefs,
	});
	for (const { command, args, name } of commands) {
		const result = await runBoundedProcess({
			command,
			args,
			cwd: repositoryRoot,
			timeoutMs: 10_000,
		});
		const hasUnexpectedTouchedFiles =
			name === "git status --short" && unexpectedTouchedFiles.length > 0;
		const status =
			result.succeeded && !hasUnexpectedTouchedFiles ? "passed" : "failed";
		results.push({
			commandName: name,
			status,
			exitCodeSummary: result.timedOut
				? "timed out"
				: status === "passed"
					? "passed"
					: "failed",
		});
	}
	return { proofCommandResults: results, unexpectedTouchedFiles };
}

async function listUnexpectedTouchedFiles({
	repositoryRoot,
	workflowRunId,
	preRunDirtyFileRefs,
	appliedFileRefs,
}: {
	repositoryRoot: string;
	workflowRunId: string;
	preRunDirtyFileRefs: string[];
	appliedFileRefs: string[];
}) {
	const preRunDirtySet = new Set(preRunDirtyFileRefs);
	const appliedFileRefSet = new Set(appliedFileRefs);
	const dirtyFileRefs = await listGitDirtyFileRefs(repositoryRoot);
	return dirtyFileRefs.filter((fileRef) => {
		if (preRunDirtySet.has(fileRef)) {
			return false;
		}
		if (appliedFileRefSet.has(fileRef)) {
			return false;
		}
		return !isAllowedPackageScriptPatchingArtifactRef(fileRef, workflowRunId);
	});
}

async function listPotentialPartialSourceTouchedFiles({
	repositoryRoot,
	preRunDirtyFileRefs,
	approvedSourceTargetRefs,
}: {
	repositoryRoot: string;
	preRunDirtyFileRefs: string[];
	approvedSourceTargetRefs: string[];
}) {
	const preRunDirtySet = new Set(preRunDirtyFileRefs);
	const approvedSourceTargetSet = new Set(approvedSourceTargetRefs);
	const dirtyFileRefs = await listGitDirtyFileRefs(repositoryRoot);
	return dirtyFileRefs
		.filter(
			(fileRef) =>
				approvedSourceTargetSet.has(fileRef) && !preRunDirtySet.has(fileRef),
		)
		.sort();
}

async function listGitDirtyFileRefs(repositoryRoot: string) {
	const result = await runGit(repositoryRoot, [
		"status",
		"--porcelain",
		"--untracked-files=all",
	]);
	if (!result.succeeded) {
		return ["<unable to inspect git status>"];
	}
	return Array.from(
		new Set(
			result.stdout
				.split(/\r?\n/)
				.flatMap(parseGitStatusPathsForProof)
				.filter((fileRef): fileRef is string => Boolean(fileRef)),
		),
	).sort();
}

function listUnsafePreRunDirtyFiles(dirtyFileRefs: string[]) {
	return dirtyFileRefs.filter((fileRef) => {
		if (fileRef.startsWith(".sbs/docs-operating-system-adoption/")) {
			return false;
		}
		if (fileRef.startsWith(".sbs/runs/")) {
			return false;
		}
		return (
			fileRef === "package.json" ||
			fileRef.startsWith("scripts/sbs-docs/") ||
			fileRef === "<unable to inspect git status>" ||
			fileRef.startsWith(".sbs/")
		);
	});
}

async function readGitDiffSummary(repositoryRoot: string) {
	const result = await runGit(repositoryRoot, ["diff", "--stat"]);
	return result.succeeded && result.stdout.trim()
		? result.stdout.trim()
		: "No tracked source diff.";
}

async function runGit(repositoryRoot: string, args: string[]) {
	const result = await runBoundedProcess({
		command: "git",
		args,
		cwd: repositoryRoot,
		timeoutMs: 10_000,
	});
	return {
		succeeded: result.succeeded,
		stdout: result.stdout,
		stderr: result.stderr,
	};
}

async function writeJsonArtifact(
	repositoryRoot: string,
	workflowRunId: string,
	repoRelativePath: string,
	value: JsonValue,
) {
	await writeTextArtifact(
		repositoryRoot,
		workflowRunId,
		repoRelativePath,
		`${JSON.stringify(value, null, 2)}\n`,
	);
}

async function writeTextArtifact(
	repositoryRoot: string,
	workflowRunId: string,
	repoRelativePath: string,
	value: string,
) {
	await assertApprovedPackageScriptPatchingArtifactRef(
		repoRelativePath,
		workflowRunId,
	);
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	const artifactPath = path.join(repositoryRoot, repoRelativePath);
	await mkdir(path.dirname(artifactPath), { recursive: true });
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	await writeFile(artifactPath, value);
}

async function writeTextTarget(
	repositoryRoot: string,
	repoRelativePath: string,
	value: string,
) {
	assertApprovedPackageScriptPatchingTargetRef(repoRelativePath);
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	const targetPath = path.join(repositoryRoot, repoRelativePath);
	await mkdir(path.dirname(targetPath), { recursive: true });
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	await writeFile(targetPath, value);
}

async function listPackagePatchWritePreflightBlockedReasons({
	repositoryRoot,
	targetRefs,
}: {
	repositoryRoot: string;
	targetRefs: string[];
}): Promise<DocsOperatingSystemPackagePatchBlockedReason[]> {
	const blockedReasons: DocsOperatingSystemPackagePatchBlockedReason[] = [];
	for (const targetRef of targetRefs) {
		try {
			assertApprovedPackageScriptPatchingTargetRef(targetRef);
			await assertNoSymlinkInExistingPath(repositoryRoot, targetRef);
		} catch (error) {
			blockedReasons.push({
				stage: "write-preflight",
				targetRef,
				reason: error instanceof Error ? error.message : String(error),
			});
			continue;
		}

		const parentBlockedReason = await getInvalidParentDirectoryReason(
			repositoryRoot,
			targetRef,
		);
		if (parentBlockedReason) {
			blockedReasons.push({
				stage: "write-preflight",
				targetRef,
				reason: parentBlockedReason,
			});
			continue;
		}

		const targetPath = path.join(repositoryRoot, targetRef);
		const stats = await lstat(targetPath).catch((error) => {
			const code = (error as { code?: string }).code;
			if (code === "ENOENT" || code === "ENOTDIR") {
				return null;
			}
			throw error;
		});
		if (stats && !stats.isFile()) {
			blockedReasons.push({
				stage: "write-preflight",
				targetRef,
				reason: "Approved target already exists and is not a regular file.",
			});
		}
	}
	return blockedReasons;
}

async function getInvalidParentDirectoryReason(
	repositoryRoot: string,
	repoRelativePath: string,
) {
	let currentPath = repositoryRoot;
	for (const segment of repoRelativePath.split("/").slice(0, -1)) {
		currentPath = path.join(currentPath, segment);
		const stats = await lstat(currentPath).catch((error) => {
			const code = (error as { code?: string }).code;
			if (code === "ENOENT" || code === "ENOTDIR") {
				return null;
			}
			throw error;
		});
		if (!stats) {
			return null;
		}
		if (!stats.isDirectory()) {
			return `Parent path ${path.relative(
				repositoryRoot,
				currentPath,
			)} exists and is not a directory.`;
		}
	}
	return null;
}

async function ensureSafePackageScriptPatchingArtifactDirectory(
	repositoryRoot: string,
	repoRelativePath: string,
	workflowRunId: string,
) {
	await assertApprovedPackageScriptPatchingArtifactRef(
		`${repoRelativePath}/.directory-placeholder`,
		workflowRunId,
	);
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
}

function assertApprovedPackageScriptPatchingTargetRef(
	repoRelativePath: string,
) {
	assertSafeRepoRelativePath(repoRelativePath);
	if (
		repoRelativePath === "package.json" ||
		repoRelativePath.startsWith("scripts/sbs-docs/")
	) {
		return;
	}
	throw new Error(
		"Docs operating system package-script patch target is outside the approved write roots.",
	);
}

function assertApprovedPackageScriptPatchingArtifactRef(
	repoRelativePath: string,
	workflowRunId: string,
) {
	assertSafeRepoRelativePath(repoRelativePath);
	if (
		isAllowedPackageScriptPatchingArtifactRef(repoRelativePath, workflowRunId)
	) {
		return;
	}
	throw new Error(
		"Docs operating system package-script patching artifact ref is outside the approved write roots.",
	);
}

function assertSafeRepoRelativePath(repoRelativePath: string) {
	const segments = repoRelativePath.split("/");
	if (
		path.isAbsolute(repoRelativePath) ||
		repoRelativePath.includes("\\") ||
		segments.some(
			(segment) => segment === "" || segment === "." || segment === "..",
		)
	) {
		throw new Error("Artifact or target ref must be repo-relative.");
	}
}

function isAllowedPackageScriptPatchingArtifactRef(
	fileRef: string,
	workflowRunId: string,
) {
	return (
		fileRef.startsWith(`.sbs/runs/${workflowRunId}/`) ||
		fileRef.startsWith(".sbs/docs-operating-system-adoption/tooling-apply/")
	);
}

async function assertNoSymlinkInExistingPath(
	repositoryRoot: string,
	repoRelativePath: string,
) {
	let currentPath = repositoryRoot;
	for (const segment of repoRelativePath.split("/")) {
		currentPath = path.join(currentPath, segment);
		const stats = await lstat(currentPath).catch((error) => {
			const code = (error as { code?: string }).code;
			if (code === "ENOENT" || code === "ENOTDIR") {
				return null;
			}
			throw error;
		});
		if (!stats) {
			return;
		}
		if (stats.isSymbolicLink()) {
			throw new Error(
				"Docs operating system package-script patching path crosses a symbolic link and is not safe to write.",
			);
		}
	}
}

async function sendRunnerEventDirect({
	credential,
	event,
	fetchRunnerEvent = fetch,
}: {
	credential: RunnerCredential;
	event: RunnerEvent;
	fetchRunnerEvent?: typeof fetch;
}) {
	const response = await fetchRunnerEvent(
		new URL(credential.eventEndpoint, credential.apiBaseUrl),
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${credential.runnerToken}`,
			},
			body: JSON.stringify(event),
		},
	).catch(() => null);
	if (response?.ok) {
		return { delivered: 1, remaining: 0 };
	}
	return { delivered: 0, remaining: 1 };
}

async function blockWorkflow({
	repositoryRoot,
	state,
	credential,
	workflowRunId,
	branchName,
	profileName,
	writeLeaseId,
	localRunDirectoryRef,
	localRunDirectory,
	blockedStage,
	blockedReason,
	createdArtifacts,
	blockedDetails = [],
	touchedFiles = [],
	rollbackInstructions,
	fetchRunnerEvent,
}: {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	workflowRunId: string;
	branchName: string;
	profileName: string;
	writeLeaseId: string;
	localRunDirectoryRef: string;
	localRunDirectory: string;
	blockedStage: string;
	blockedReason: string;
	createdArtifacts: string[];
	blockedDetails?: DocsOperatingSystemPackagePatchBlockedReason[];
	touchedFiles?: string[];
	rollbackInstructions?: string;
	fetchRunnerEvent?: typeof fetch;
}): Promise<DocsOperatingSystemPackageScriptPatchingWorkflowResult> {
	await ensureSafePackageScriptPatchingArtifactDirectory(
		repositoryRoot,
		localRunDirectoryRef,
		workflowRunId,
	);
	await mkdir(localRunDirectory, { recursive: true });
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const allCreatedArtifacts = [...createdArtifacts, proofRef, syncPreviewRef];
	await writeJsonArtifact(repositoryRoot, workflowRunId, proofRef, {
		schemaVersion: "docs-operating-system-package-script-patching-proof.v1",
		workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
		workflowVersion:
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
		workflowRunId,
		branchName,
		profileName,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		touchedFiles,
		createdArtifacts: allCreatedArtifacts,
		proofCommandsRun: [],
		proofCommandResults: [],
		blockedProof: [
			{
				stage: blockedStage,
				reason: blockedReason,
				nextApprovalRequired: true,
			},
			...blockedDetails.map((detail) => ({
				...detail,
				nextApprovalRequired: true,
			})),
		],
		rollbackInstructions:
			rollbackInstructions ??
			"No source files were patched. Resolve the block and approve a fresh package-script patching workflow if needed.",
		createdAt: Date.now(),
	});
	await writeJsonArtifact(repositoryRoot, workflowRunId, syncPreviewRef, {
		schemaVersion:
			"docs-operating-system-package-script-patching-sync-preview.v1",
		workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
		workflowVersion:
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
		branchName,
		profileName,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		touchedFileRefs: touchedFiles,
		createdArtifactRefs: allCreatedArtifacts,
		proofCommandResults: [],
		blockedReason,
	});
	const blockedEventResult = await sendRunnerEventDirect({
		credential,
		fetchRunnerEvent,
		event: createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.blocked",
				workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
				writeLeaseId,
				blockedStage,
				blockedReason,
			},
		}),
	});
	return {
		workflowRunId,
		workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
		status: "blocked",
		branchName,
		profileName,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		proofStatus: "blocked",
		localRunDirectoryRef,
		touchedFiles,
		createdArtifacts: allCreatedArtifacts,
		blockedReason,
		deliveredEvents: blockedEventResult.delivered,
		remainingEvents: blockedEventResult.remaining,
	};
}

function assertSafeWorkflowRunId(workflowRunId: string) {
	if (!/^[A-Za-z0-9_-]+$/.test(workflowRunId)) {
		throw new Error("Workflow run id is not safe for local artifact paths.");
	}
}

function assertSafeBranchName(branchName: string) {
	if (
		!/^sbs\/docs-operating-system-package-scripts-\d{8}-\d{4}$/.test(branchName)
	) {
		throw new Error(
			"Approved branch name is not a docs operating system package-script patching branch.",
		);
	}
}

function assertApprovedProfile(profileName: string) {
	if (
		profileName !== DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROFILE_NAME
	) {
		throw new Error(
			"Docs operating system package-script patching requires the sbs-workspace-write profile.",
		);
	}
}

function assertApprovedInstallProfile(installProfile: string | undefined) {
	if (installProfile !== DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE) {
		throw new Error(
			"Docs operating system package-script patching requires installProfile: worker-grade.",
		);
	}
}

function assertApprovedDocsOperatingSystemPackageScriptPatchingPacket(
	approvedWorkflowRun: ApprovedWorkflowRunPacket,
) {
	if (
		approvedWorkflowRun.workflowVersion !==
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION
	) {
		throw new Error(
			"Docs operating system package-script patching workflow version is not approved.",
		);
	}
	if (approvedWorkflowRun.writeLeaseDurationMinutes !== 30) {
		throw new Error(
			"Docs operating system package-script patching write lease duration is not approved.",
		);
	}
	if (approvedWorkflowRun.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error(
			"Docs operating system package-script patching requires a clean-worktree policy.",
		);
	}
	assertExactTextList(
		approvedWorkflowRun.expectedOutputs,
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_EXPECTED_OUTPUTS,
		"expected outputs",
	);
	assertExactTextList(
		approvedWorkflowRun.allowedTouchTargets,
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ALLOWED_TOUCH_TARGETS,
		"allowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.disallowedTouchTargets,
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_DISALLOWED_TOUCH_TARGETS,
		"disallowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.proofCommands,
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_COMMANDS,
		"proof commands",
	);
	if (
		approvedWorkflowRun.syncPolicySummary !==
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_SYNC_POLICY_SUMMARY
	) {
		throw new Error(
			"Docs operating system package-script patching sync policy is not approved.",
		);
	}
	assertExactTextList(
		approvedWorkflowRun.stopConditions,
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_STOP_CONDITIONS,
		"stop conditions",
	);
	if (
		approvedWorkflowRun.rollbackNotes !==
		DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ROLLBACK_NOTES
	) {
		throw new Error(
			"Docs operating system package-script patching rollback notes are not approved.",
		);
	}
	if (
		approvedWorkflowRun.localWorkflowPacketRef !==
		`.sbs/runs/${approvedWorkflowRun.workflowRunId}/workflow-packet.json`
	) {
		throw new Error(
			"Docs operating system package-script patching workflow packet ref is not approved.",
		);
	}
	if (
		approvedWorkflowRun.localProofRef !==
		`.sbs/runs/${approvedWorkflowRun.workflowRunId}/proof.json`
	) {
		throw new Error(
			"Docs operating system package-script patching proof ref is not approved.",
		);
	}
}

function assertExactTextList(
	actual: string[],
	expected: readonly string[],
	errorMessage: string,
) {
	if (
		actual.length !== expected.length ||
		actual.some((value, index) => value !== expected[index])
	) {
		throw new Error(
			`Docs operating system package-script patching ${errorMessage} are not approved.`,
		);
	}
}
