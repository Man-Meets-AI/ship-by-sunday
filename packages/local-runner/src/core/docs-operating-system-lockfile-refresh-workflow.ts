import { existsSync } from "node:fs";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
	runBoundedProcess,
	type BoundedProcessResult,
} from "./bounded-process";
import type { RunnerCredential } from "./local-runner-home";
import type { LocalProjectState } from "./local-project-state";
import { createRunnerEvent, type RunnerEvent } from "./runner-events";
import type { ApprovedWorkflowRunPacket } from "./workflow-run-api";
import { parseGitStatusPathsForProof } from "./docs-spine-adoption-workflow";
import {
	hasPinnedSharedToolingDependency,
	listDocsOperatingSystemLockfileRefs,
	resolveDocsOperatingSystemLockfileRefreshCommand,
} from "../workflows/docs-operating-system-adoption/lockfile-refresh";
import {
	buildDocsOperatingSystemPackagePatch,
	type ExistingWrapperFile,
} from "../workflows/docs-operating-system-adoption/package-script-patching";
import {
	DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_CONFIRM_FLAG,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_DISALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_EXPECTED_OUTPUTS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_LOCAL_ARTIFACT_REFS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PHASES,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROFILE_NAME,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_DELIVERY,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROVIDER_ACCESS_POLICY,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_REVOCATION_BEHAVIOR,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_STOP_CONDITIONS,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_SYNC_POLICY_SUMMARY,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
	DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS,
} from "../workflows/docs-operating-system-adoption/manifest";
import type {
	DocsOperatingSystemInstallPlan,
	DocsOperatingSystemLockfileRefreshBlockedReason,
	DocsOperatingSystemLockfileRefreshCommand,
	DocsOperatingSystemLockfileRefreshManifest,
	DocsOperatingSystemLockfileRefreshSummary,
	DocsOperatingSystemPackagePatchSummary,
	DocsOperatingSystemProofCommandResult,
} from "../workflows/docs-operating-system-adoption/schemas";

const SOURCE_INSTALL_PLAN_REF =
	".sbs/docs-operating-system-adoption/tooling-plan/install-plan.json";
const SOURCE_APPLY_SUMMARY_REF =
	".sbs/docs-operating-system-adoption/tooling-apply/package-script-patching.json";

export type DocsOperatingSystemLockfileRefreshWorkflowResult = {
	workflowRunId: string;
	workflowId: typeof DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID;
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

type RunDocsOperatingSystemLockfileRefreshWorkflowOptions = {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	approvedWorkflowRun: ApprovedWorkflowRunPacket;
	confirmDocsOperatingSystemLockfileRefresh: boolean;
	now?: number;
	fetchRunnerEvent?: typeof fetch;
};

export async function runDocsOperatingSystemLockfileRefreshWorkflow({
	repositoryRoot,
	state,
	credential,
	approvedWorkflowRun,
	confirmDocsOperatingSystemLockfileRefresh,
	now = Date.now(),
	fetchRunnerEvent,
}: RunDocsOperatingSystemLockfileRefreshWorkflowOptions): Promise<DocsOperatingSystemLockfileRefreshWorkflowResult> {
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

	if (!confirmDocsOperatingSystemLockfileRefresh) {
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
			blockedReason: `docs-operating-system-lockfile-refresh requires ${DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_CONFIRM_FLAG} because it runs a package-manager lockfile refresh.`,
			createdArtifacts: [],
			fetchRunnerEvent,
		});
	}

	if (
		approvedWorkflowRun.workflowId !==
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID
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
				"Approved workflow run is not docs-operating-system-lockfile-refresh.",
			createdArtifacts: [],
			fetchRunnerEvent,
		});
	}

	try {
		assertApprovedDocsOperatingSystemLockfileRefreshPacket(approvedWorkflowRun);
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
				"Approved write lease expired before lockfile refresh started.",
			createdArtifacts: [],
			fetchRunnerEvent,
		});
	}

	await ensureSafeLockfileRefreshArtifactDirectory(
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
				"Worktree has dirty lockfiles or unsafe runner artifacts before lockfile refresh starts.",
			createdArtifacts: [],
			blockedDetails: unsafePreRunDirtyFiles.map((fileRef) => ({
				stage: "dirty-state",
				targetRef: fileRef,
				reason: "Dirty ref is inside the lockfile refresh authority.",
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

	let startEventResult = { delivered: 0, remaining: 0 };
	startEventResult = await sendRunnerEventDirect({
		credential,
		fetchRunnerEvent,
		event: createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.started",
				workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
				branchName,
				profileName,
			},
		}),
	});

	const workflowPacketRef = `${localRunDirectoryRef}/workflow-packet.json`;
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const manifestRef =
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_LOCAL_ARTIFACT_REFS.manifest;
	const refreshSummaryRef =
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_LOCAL_ARTIFACT_REFS.refreshSummary;
	const createdArtifacts = [
		workflowPacketRef,
		manifestRef,
		refreshSummaryRef,
		proofRef,
		syncPreviewRef,
	];

	let approvedLockfileRefs: string[] = [];

	try {
		await writeJsonArtifact(repositoryRoot, workflowRunId, workflowPacketRef, {
			schemaVersion:
				"docs-operating-system-lockfile-refresh-workflow-packet.v1",
			workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
			workflowVersion: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION,
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
			sourceApplySummaryRef: SOURCE_APPLY_SUMMARY_REF,
			codexInterpretation: "disabled for lockfile refresh workflow",
			codexWritePolicy:
				"disabled outside approved lockfiles and .sbs lockfile-refresh artifacts",
			localArtifacts: createdArtifacts,
			allowedTouchTargets:
				DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ALLOWED_TOUCH_TARGETS,
			disallowedTouchTargets:
				DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_DISALLOWED_TOUCH_TARGETS,
			providerAccessPolicy:
				DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROVIDER_ACCESS_POLICY,
			proofCommands: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_COMMANDS,
			syncPolicy: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_SYNC_POLICY_SUMMARY,
			stopConditions: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_STOP_CONDITIONS,
			approvalRequired: true,
			expectedOutputs: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_EXPECTED_OUTPUTS,
			rollbackNotes: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ROLLBACK_NOTES,
			proofDelivery: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_DELIVERY,
			revocationBehavior:
				DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_REVOCATION_BEHAVIOR,
			createdAt: now,
		});
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			manifestRef,
			buildManifest(now),
		);

		const validation = await validateLockfileRefreshPrerequisites({
			repositoryRoot,
		});
		if (validation.status === "blocked") {
			await writeJsonArtifact(
				repositoryRoot,
				workflowRunId,
				refreshSummaryRef,
				buildRefreshSummary({
					now,
					status: "blocked",
					packageManager: validation.packageManager,
					commandStatus: "blocked",
					exitCodeSummary: "blocked",
					guardedInputRefs: validation.guardedInputRefs,
					touchedLockfileRefs: [],
					unexpectedTouchedFiles: [],
					blockedReasons: validation.blockedReasons,
					proofCommandResults: [],
				}),
			);
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
				blockedStage: "prior-package-patch-validation",
				blockedReason:
					"Docs operating system lockfile refresh blocked before package-manager execution.",
				createdArtifacts: [workflowPacketRef, manifestRef, refreshSummaryRef],
				blockedDetails: validation.blockedReasons,
				fetchRunnerEvent,
			});
		}

		const guardedSnapshots = await readGuardedInputSnapshots(
			repositoryRoot,
			validation.guardedInputRefs,
		);
		const commandResult = await runBoundedProcess({
			command: validation.command.command,
			args: validation.command.args,
			cwd: repositoryRoot,
			timeoutMs: 120_000,
		});
		const touchedLockfileRefs = await listTouchedLockfileRefs({
			repositoryRoot,
			preRunDirtyFileRefs,
			expectedLockfileRefs: validation.command.expectedLockfileRefs,
		});
		approvedLockfileRefs = touchedLockfileRefs;
		const changedGuardedInputRefs = await listChangedGuardedInputRefs({
			repositoryRoot,
			guardedSnapshots,
		});
		const unexpectedTouchedFiles = await listUnexpectedTouchedFiles({
			repositoryRoot,
			workflowRunId,
			preRunDirtyFileRefs,
			touchedLockfileRefs,
			changedGuardedInputRefs,
		});
		const proofCommandResults = await runProofCommands({
			repositoryRoot,
			commandName: validation.command.commandName,
			commandResult,
			unexpectedTouchedFiles,
		});
		const proofStatus =
			commandResult.succeeded &&
			proofCommandResults.every((result) => result.status === "passed") &&
			unexpectedTouchedFiles.length === 0
				? "passed"
				: "failed";
		const proofSummary =
			proofStatus === "passed"
				? "Docs operating system lockfile refresh wrote only approved lockfile and .sbs refs."
				: "Docs operating system lockfile refresh ran, but proof found a command failure, guarded-input mutation, or unexpected refs.";

		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			refreshSummaryRef,
			buildRefreshSummary({
				now,
				status: proofStatus === "passed" ? "refreshed" : "failed",
				packageManager: validation.installPlan.packageManager,
				commandName: validation.command.commandName,
				commandStatus: commandResult.succeeded ? "passed" : "failed",
				exitCodeSummary: formatExitCodeSummary(commandResult),
				guardedInputRefs: validation.guardedInputRefs,
				touchedLockfileRefs,
				unexpectedTouchedFiles,
				blockedReasons: [],
				proofCommandResults,
			}),
		);
		await writeJsonArtifact(repositoryRoot, workflowRunId, proofRef, {
			schemaVersion: "docs-operating-system-lockfile-refresh-proof.v1",
			workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
			workflowVersion: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION,
			workflowRunId,
			branchName,
			profileName,
			installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
			sourceInstallPlanRef: SOURCE_INSTALL_PLAN_REF,
			sourceApplySummaryRef: SOURCE_APPLY_SUMMARY_REF,
			refreshSummaryRef,
			packageManager: validation.installPlan.packageManager,
			installCommandName: validation.command.commandName,
			diffSummary: await readGitDiffSummary(repositoryRoot),
			preexistingDirtyFileRefs: preRunDirtyFileRefs,
			guardedInputRefs: validation.guardedInputRefs,
			touchedFiles: touchedLockfileRefs,
			unexpectedTouchedFiles,
			createdArtifacts,
			proofCommandsRun: proofCommandResults.map((result) => result.commandName),
			proofCommandResults,
			rollbackInstructions:
				DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ROLLBACK_NOTES,
			createdAt: now,
		});
		await writeJsonArtifact(repositoryRoot, workflowRunId, syncPreviewRef, {
			schemaVersion: "docs-operating-system-lockfile-refresh-sync-preview.v1",
			workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
			workflowVersion: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION,
			branchName,
			profileName,
			installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
			touchedFileRefs: touchedLockfileRefs,
			createdArtifactRefs: createdArtifacts,
			packageManager: validation.installPlan.packageManager,
			installCommandName: validation.command.commandName,
			proofCommandResults: proofCommandResults.map(
				({ commandName, status }) => ({
					commandName,
					status,
				}),
			),
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
					workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
					writeLeaseId,
					proofStatus,
					proofSummary,
					touchedFileRefs: touchedLockfileRefs,
					createdArtifactRefs: createdArtifacts,
					proofCommandResults: proofCommandResults.map(
						({ commandName, status }) => ({
							commandName,
							status,
						}),
					),
				},
			}),
		});

		return {
			workflowRunId,
			workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
			status: "proof_completed",
			branchName,
			profileName,
			installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
			proofStatus,
			localRunDirectoryRef,
			touchedFiles: touchedLockfileRefs,
			createdArtifacts,
			deliveredEvents: startEventResult.delivered + proofEventResult.delivered,
			remainingEvents: startEventResult.remaining + proofEventResult.remaining,
		};
	} catch {
		const partialLockfileTouchedFiles =
			await listPotentialPartialLockfileTouchedFiles({
				repositoryRoot,
				preRunDirtyFileRefs,
				approvedLockfileRefs,
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
				partialLockfileTouchedFiles.length > 0
					? "package-manager-lockfile-refresh"
					: "artifact-generation",
			blockedReason:
				partialLockfileTouchedFiles.length > 0
					? "Docs operating system lockfile refresh failed after one or more approved lockfile writes. Review and revert the touched lockfile refs before retrying."
					: "Docs operating system lockfile refresh failed before proof artifacts could be completed.",
			createdArtifacts,
			touchedFiles: partialLockfileTouchedFiles,
			rollbackInstructions:
				partialLockfileTouchedFiles.length > 0
					? `Lockfiles may have been refreshed: ${partialLockfileTouchedFiles.join(", ")}. Review and revert those refs plus this run's .sbs artifacts before retrying.`
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
): DocsOperatingSystemLockfileRefreshManifest {
	return {
		schemaVersion: "docs-operating-system-lockfile-refresh-manifest.v1",
		workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
		workflowVersion: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		phases: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PHASES,
		allowedTouchTargets:
			DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ALLOWED_TOUCH_TARGETS,
		disallowedTouchTargets:
			DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_DISALLOWED_TOUCH_TARGETS,
		proofCommands: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_COMMANDS,
		localArtifactRefs:
			DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_LOCAL_ARTIFACT_REFS,
		syncPolicySummary:
			DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_SYNC_POLICY_SUMMARY,
		rollbackNotes: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ROLLBACK_NOTES,
		createdAt: now,
	};
}

function buildRefreshSummary({
	now,
	status,
	packageManager,
	commandName,
	commandStatus,
	exitCodeSummary,
	guardedInputRefs,
	touchedLockfileRefs,
	unexpectedTouchedFiles,
	blockedReasons,
	proofCommandResults,
}: {
	now: number;
	status: DocsOperatingSystemLockfileRefreshSummary["status"];
	packageManager: string;
	commandName?: string;
	commandStatus: DocsOperatingSystemLockfileRefreshSummary["commandStatus"];
	exitCodeSummary: string;
	guardedInputRefs: string[];
	touchedLockfileRefs: string[];
	unexpectedTouchedFiles: string[];
	blockedReasons: DocsOperatingSystemLockfileRefreshBlockedReason[];
	proofCommandResults: DocsOperatingSystemProofCommandResult[];
}): DocsOperatingSystemLockfileRefreshSummary {
	return {
		schemaVersion: "docs-operating-system-lockfile-refresh.v1",
		workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
		workflowVersion: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		sourceInstallPlanRef: SOURCE_INSTALL_PLAN_REF,
		sourceApplySummaryRef: SOURCE_APPLY_SUMMARY_REF,
		status,
		packageManager,
		commandName,
		commandStatus,
		exitCodeSummary,
		guardedInputRefs,
		touchedLockfileRefs,
		unexpectedTouchedFiles,
		blockedReasons,
		proofCommandResults,
		privacyBoundary: {
			rawSourceIncluded: false,
			rawLogsIncluded: false,
			rawPackageManagerOutputIncluded: false,
			packageScriptBodiesIncluded: false,
			targetDependencyVersionsIncluded: false,
			localAbsolutePathsIncluded: false,
			codexTranscriptsIncluded: false,
		},
		createdAt: now,
	};
}

async function validateLockfileRefreshPrerequisites({
	repositoryRoot,
}: {
	repositoryRoot: string;
}): Promise<
	| {
			status: "ready";
			installPlan: DocsOperatingSystemInstallPlan;
			command: DocsOperatingSystemLockfileRefreshCommand;
			guardedInputRefs: string[];
	  }
	| {
			status: "blocked";
			packageManager: string;
			guardedInputRefs: string[];
			blockedReasons: DocsOperatingSystemLockfileRefreshBlockedReason[];
	  }
> {
	const blockedReasons: DocsOperatingSystemLockfileRefreshBlockedReason[] = [];
	const installPlan = await readJsonIfExists<DocsOperatingSystemInstallPlan>(
		repositoryRoot,
		SOURCE_INSTALL_PLAN_REF,
	);
	const applySummary =
		await readJsonIfExists<DocsOperatingSystemPackagePatchSummary>(
			repositoryRoot,
			SOURCE_APPLY_SUMMARY_REF,
		);
	const packageJsonText = await readTextIfExists(
		repositoryRoot,
		"package.json",
	);
	const existingWrapperFiles = await readExistingWrapperFiles(repositoryRoot);
	const guardedInputRefs = [
		"package.json",
		...existingWrapperFiles.map((file) => file.targetRef),
	];

	if (!installPlan) {
		blockedReasons.push({
			stage: "install-plan",
			targetRef: SOURCE_INSTALL_PLAN_REF,
			reason: "Docs operating system dry-run install plan is missing.",
		});
	}
	if (!applySummary) {
		blockedReasons.push({
			stage: "package-script-apply",
			targetRef: SOURCE_APPLY_SUMMARY_REF,
			reason: "Docs operating system package-script apply summary is missing.",
		});
	}

	const packageManager = installPlan?.packageManager ?? "unknown";
	const detectedPackageManager =
		detectPackageManagerFromLockfiles(repositoryRoot);
	if (
		installPlan &&
		detectedPackageManager !== "unknown" &&
		detectedPackageManager !== "unknown-node" &&
		detectedPackageManager !== packageManager
	) {
		blockedReasons.push({
			stage: "install-plan",
			targetRef: SOURCE_INSTALL_PLAN_REF,
			reason:
				"Install plan package manager no longer matches the live repository lockfile state.",
		});
	}
	if (applySummary) {
		blockedReasons.push(...validateApplySummary(applySummary));
	}

	if (installPlan && packageJsonText !== null) {
		const packagePatch = buildDocsOperatingSystemPackagePatch({
			installPlan,
			packageJsonText,
			existingWrapperFiles,
		});
		if (packagePatch.status === "blocked") {
			blockedReasons.push(
				...packagePatch.blockedReasons.map((reason) => ({
					stage: reason.stage,
					reason: reason.reason,
					targetRef: reason.targetRef,
				})),
			);
		} else {
			blockedReasons.push(
				...packagePatch.appliedOperations
					.filter((operation) => operation.status !== "kept")
					.map((operation) => ({
						stage: "package-script-apply",
						targetRef: operation.targetRef,
						reason:
							"Live package.json or wrapper files no longer contain the approved package-script patch.",
					})),
			);
		}
	}

	const parsedPackageJson = parsePackageJson(packageJsonText);
	if (!parsedPackageJson) {
		blockedReasons.push({
			stage: "package-json",
			targetRef: "package.json",
			reason: "Root package.json is missing or invalid.",
		});
	} else if (!hasPinnedSharedToolingDependency(parsedPackageJson)) {
		blockedReasons.push({
			stage: "package-json",
			targetRef: "package.json",
			reason:
				"Root package.json is missing the pinned ship-by-sunday dependency metadata from package-script patching.",
		});
	}

	const commandResolution =
		resolveDocsOperatingSystemLockfileRefreshCommand(packageManager);
	if (commandResolution.status === "blocked") {
		blockedReasons.push(commandResolution.blockedReason);
	}

	if (blockedReasons.length > 0 || !installPlan) {
		return {
			status: "blocked",
			packageManager,
			guardedInputRefs,
			blockedReasons,
		};
	}

	if (commandResolution.status === "blocked") {
		return {
			status: "blocked",
			packageManager,
			guardedInputRefs,
			blockedReasons: [commandResolution.blockedReason],
		};
	}

	return {
		status: "ready",
		installPlan,
		command: commandResolution.command,
		guardedInputRefs,
	};
}

function validateApplySummary(
	applySummary: DocsOperatingSystemPackagePatchSummary,
): DocsOperatingSystemLockfileRefreshBlockedReason[] {
	const blockedReasons: DocsOperatingSystemLockfileRefreshBlockedReason[] = [];
	if (
		applySummary.schemaVersion !==
		"docs-operating-system-package-script-patching.v1"
	) {
		blockedReasons.push({
			stage: "package-script-apply",
			targetRef: SOURCE_APPLY_SUMMARY_REF,
			reason: "Package-script apply summary has an invalid schema version.",
		});
	}
	if (
		applySummary.workflowId !==
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID ||
		applySummary.workflowVersion !==
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION
	) {
		blockedReasons.push({
			stage: "package-script-apply",
			targetRef: SOURCE_APPLY_SUMMARY_REF,
			reason:
				"Package-script apply summary is not from the approved package-script patching workflow.",
		});
	}
	if (
		applySummary.installProfile !==
		DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE
	) {
		blockedReasons.push({
			stage: "package-script-apply",
			targetRef: SOURCE_APPLY_SUMMARY_REF,
			reason:
				"Package-script apply summary does not use installProfile: worker-grade.",
		});
	}
	if (applySummary.sourceInstallPlanRef !== SOURCE_INSTALL_PLAN_REF) {
		blockedReasons.push({
			stage: "package-script-apply",
			targetRef: SOURCE_APPLY_SUMMARY_REF,
			reason:
				"Package-script apply summary points at an unexpected install plan.",
		});
	}
	if (applySummary.status !== "applied") {
		blockedReasons.push({
			stage: "package-script-apply",
			targetRef: SOURCE_APPLY_SUMMARY_REF,
			reason: "Package-script apply summary is not applied.",
		});
	}
	if (applySummary.blockedReasons.length > 0) {
		blockedReasons.push({
			stage: "package-script-apply",
			targetRef: SOURCE_APPLY_SUMMARY_REF,
			reason: "Package-script apply summary contains blocked reasons.",
		});
	}
	return blockedReasons;
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

function parsePackageJson(packageJsonText: string | null) {
	if (packageJsonText === null) {
		return null;
	}
	try {
		return JSON.parse(packageJsonText) as unknown;
	} catch {
		return null;
	}
}

async function readJsonIfExists<T>(
	repositoryRoot: string,
	repoRelativePath: string,
) {
	const text = await readTextIfExists(repositoryRoot, repoRelativePath);
	if (text === null) {
		return null;
	}
	try {
		return JSON.parse(text) as T;
	} catch {
		return null;
	}
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

async function readGuardedInputSnapshots(
	repositoryRoot: string,
	guardedInputRefs: string[],
): Promise<Map<string, string | null>> {
	return new Map(
		await Promise.all(
			guardedInputRefs.map(
				async (targetRef): Promise<[string, string | null]> => [
					targetRef,
					await readTextIfExists(repositoryRoot, targetRef),
				],
			),
		),
	);
}

async function listChangedGuardedInputRefs({
	repositoryRoot,
	guardedSnapshots,
}: {
	repositoryRoot: string;
	guardedSnapshots: Map<string, string | null>;
}) {
	const changedRefs: string[] = [];
	for (const [targetRef, before] of guardedSnapshots) {
		const after = await readTextIfExists(repositoryRoot, targetRef);
		if (before !== after) {
			changedRefs.push(targetRef);
		}
	}
	return changedRefs.sort();
}

async function runProofCommands({
	repositoryRoot,
	commandName,
	commandResult,
	unexpectedTouchedFiles,
}: {
	repositoryRoot: string;
	commandName: string;
	commandResult: BoundedProcessResult;
	unexpectedTouchedFiles: string[];
}) {
	const results: DocsOperatingSystemProofCommandResult[] = [
		{
			commandName,
			status: commandResult.succeeded ? "passed" : "failed",
			exitCodeSummary: formatExitCodeSummary(commandResult),
		},
	];
	const commands: Array<{ command: string; args: string[]; name: string }> = [
		{ command: "git", args: ["status", "--short"], name: "git status --short" },
		{
			command: "git",
			args: ["diff", "--name-only"],
			name: "git diff --name-only",
		},
		{ command: "git", args: ["diff", "--check"], name: "git diff --check" },
	];
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
	return results;
}

function formatExitCodeSummary(result: BoundedProcessResult) {
	if (result.timedOut) {
		return "timed out";
	}
	if (result.succeeded) {
		return "passed";
	}
	if (typeof result.exitCode === "number") {
		return `failed with exit code ${result.exitCode}`;
	}
	if (result.failureCode) {
		return `failed with ${result.failureCode}`;
	}
	return "failed";
}

async function listTouchedLockfileRefs({
	repositoryRoot,
	preRunDirtyFileRefs,
	expectedLockfileRefs,
}: {
	repositoryRoot: string;
	preRunDirtyFileRefs: string[];
	expectedLockfileRefs: string[];
}) {
	const preRunDirtySet = new Set(preRunDirtyFileRefs);
	const lockfileRefSet = new Set<string>(expectedLockfileRefs);
	const dirtyFileRefs = await listGitDirtyFileRefs(repositoryRoot);
	return dirtyFileRefs
		.filter((fileRef) => lockfileRefSet.has(fileRef))
		.filter((fileRef) => !preRunDirtySet.has(fileRef))
		.sort();
}

async function listUnexpectedTouchedFiles({
	repositoryRoot,
	workflowRunId,
	preRunDirtyFileRefs,
	touchedLockfileRefs,
	changedGuardedInputRefs,
}: {
	repositoryRoot: string;
	workflowRunId: string;
	preRunDirtyFileRefs: string[];
	touchedLockfileRefs: string[];
	changedGuardedInputRefs: string[];
}) {
	const preRunDirtySet = new Set(preRunDirtyFileRefs);
	const touchedLockfileRefSet = new Set(touchedLockfileRefs);
	const dirtyFileRefs = await listGitDirtyFileRefs(repositoryRoot);
	const unexpectedFileRefs = dirtyFileRefs.filter((fileRef) => {
		if (preRunDirtySet.has(fileRef)) {
			return false;
		}
		if (touchedLockfileRefSet.has(fileRef)) {
			return false;
		}
		return !isAllowedLockfileRefreshArtifactRef(fileRef, workflowRunId);
	});
	return Array.from(
		new Set([...unexpectedFileRefs, ...changedGuardedInputRefs]),
	).sort();
}

async function listPotentialPartialLockfileTouchedFiles({
	repositoryRoot,
	preRunDirtyFileRefs,
	approvedLockfileRefs,
}: {
	repositoryRoot: string;
	preRunDirtyFileRefs: string[];
	approvedLockfileRefs: string[];
}) {
	const preRunDirtySet = new Set(preRunDirtyFileRefs);
	const approvedLockfileRefSet = new Set(approvedLockfileRefs);
	const dirtyFileRefs = await listGitDirtyFileRefs(repositoryRoot);
	return dirtyFileRefs
		.filter(
			(fileRef) =>
				approvedLockfileRefSet.has(fileRef) && !preRunDirtySet.has(fileRef),
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
	const lockfileRefSet = new Set<string>(listDocsOperatingSystemLockfileRefs());
	return dirtyFileRefs.filter((fileRef) => {
		if (fileRef.startsWith(".sbs/runs/")) {
			return false;
		}
		return (
			lockfileRefSet.has(fileRef) ||
			fileRef === "package.json" ||
			fileRef.startsWith("scripts/sbs-docs/") ||
			fileRef.startsWith(".sbs/docs-operating-system-adoption/") ||
			fileRef === "<unable to inspect git status>" ||
			fileRef.startsWith(".sbs/")
		);
	});
}

function detectPackageManagerFromLockfiles(repositoryRoot: string) {
	if (existsSync(path.join(repositoryRoot, "bun.lock"))) {
		return "bun";
	}
	if (existsSync(path.join(repositoryRoot, "bun.lockb"))) {
		return "bun";
	}
	if (existsSync(path.join(repositoryRoot, "pnpm-lock.yaml"))) {
		return "pnpm";
	}
	if (existsSync(path.join(repositoryRoot, "yarn.lock"))) {
		return "yarn";
	}
	if (existsSync(path.join(repositoryRoot, "package-lock.json"))) {
		return "npm";
	}
	if (existsSync(path.join(repositoryRoot, "npm-shrinkwrap.json"))) {
		return "npm";
	}
	if (existsSync(path.join(repositoryRoot, "package.json"))) {
		return "unknown-node";
	}
	return "unknown";
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
	value: unknown,
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
	await assertApprovedLockfileRefreshArtifactRef(
		repoRelativePath,
		workflowRunId,
	);
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	const artifactPath = path.join(repositoryRoot, repoRelativePath);
	await mkdir(path.dirname(artifactPath), { recursive: true });
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	await writeFile(artifactPath, value);
}

async function ensureSafeLockfileRefreshArtifactDirectory(
	repositoryRoot: string,
	repoRelativePath: string,
	workflowRunId: string,
) {
	await assertApprovedLockfileRefreshArtifactRef(
		`${repoRelativePath}/.directory-placeholder`,
		workflowRunId,
	);
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
}

function assertApprovedLockfileRefreshArtifactRef(
	repoRelativePath: string,
	workflowRunId: string,
) {
	assertSafeRepoRelativePath(repoRelativePath);
	if (isAllowedLockfileRefreshArtifactRef(repoRelativePath, workflowRunId)) {
		return;
	}
	throw new Error(
		"Docs operating system lockfile refresh artifact ref is outside the approved write roots.",
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

function isAllowedLockfileRefreshArtifactRef(
	fileRef: string,
	workflowRunId: string,
) {
	return (
		fileRef.startsWith(`.sbs/runs/${workflowRunId}/`) ||
		fileRef.startsWith(".sbs/docs-operating-system-adoption/lockfile-refresh/")
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
				"Docs operating system lockfile refresh path crosses a symbolic link and is not safe to write.",
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
	blockedDetails?: DocsOperatingSystemLockfileRefreshBlockedReason[];
	touchedFiles?: string[];
	rollbackInstructions?: string;
	fetchRunnerEvent?: typeof fetch;
}): Promise<DocsOperatingSystemLockfileRefreshWorkflowResult> {
	await ensureSafeLockfileRefreshArtifactDirectory(
		repositoryRoot,
		localRunDirectoryRef,
		workflowRunId,
	);
	await mkdir(localRunDirectory, { recursive: true });
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const allCreatedArtifacts = Array.from(
		new Set([...createdArtifacts, proofRef, syncPreviewRef]),
	);
	await writeJsonArtifact(repositoryRoot, workflowRunId, proofRef, {
		schemaVersion: "docs-operating-system-lockfile-refresh-proof.v1",
		workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
		workflowVersion: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION,
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
			"No lockfiles were refreshed. Resolve the block and approve a fresh lockfile refresh workflow if needed.",
		createdAt: Date.now(),
	});
	await writeJsonArtifact(repositoryRoot, workflowRunId, syncPreviewRef, {
		schemaVersion: "docs-operating-system-lockfile-refresh-sync-preview.v1",
		workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
		workflowVersion: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION,
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
				workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
				writeLeaseId,
				blockedStage,
				blockedReason,
			},
		}),
	});
	return {
		workflowRunId,
		workflowId: DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID,
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
		!/^sbs\/docs-operating-system-lockfile-refresh-\d{8}-\d{4}$/.test(
			branchName,
		)
	) {
		throw new Error(
			"Approved branch name is not a docs operating system lockfile refresh branch.",
		);
	}
}

function assertApprovedProfile(profileName: string) {
	if (profileName !== DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROFILE_NAME) {
		throw new Error(
			"Docs operating system lockfile refresh requires the sbs-workspace-write profile.",
		);
	}
}

function assertApprovedInstallProfile(installProfile: string | undefined) {
	if (installProfile !== DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE) {
		throw new Error(
			"Docs operating system lockfile refresh requires installProfile: worker-grade.",
		);
	}
}

function assertApprovedDocsOperatingSystemLockfileRefreshPacket(
	approvedWorkflowRun: ApprovedWorkflowRunPacket,
) {
	if (
		approvedWorkflowRun.workflowVersion !==
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION
	) {
		throw new Error(
			"Docs operating system lockfile refresh workflow version is not approved.",
		);
	}
	if (approvedWorkflowRun.writeLeaseDurationMinutes !== 30) {
		throw new Error(
			"Docs operating system lockfile refresh write lease duration is not approved.",
		);
	}
	if (approvedWorkflowRun.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error(
			"Docs operating system lockfile refresh requires a clean-worktree policy.",
		);
	}
	assertExactTextList(
		approvedWorkflowRun.expectedOutputs,
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_EXPECTED_OUTPUTS,
		"expected outputs",
	);
	assertExactTextList(
		approvedWorkflowRun.allowedTouchTargets,
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ALLOWED_TOUCH_TARGETS,
		"allowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.disallowedTouchTargets,
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_DISALLOWED_TOUCH_TARGETS,
		"disallowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.proofCommands,
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_COMMANDS,
		"proof commands",
	);
	if (
		approvedWorkflowRun.syncPolicySummary !==
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_SYNC_POLICY_SUMMARY
	) {
		throw new Error(
			"Docs operating system lockfile refresh sync policy is not approved.",
		);
	}
	assertExactTextList(
		approvedWorkflowRun.stopConditions,
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_STOP_CONDITIONS,
		"stop conditions",
	);
	if (
		approvedWorkflowRun.rollbackNotes !==
		DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ROLLBACK_NOTES
	) {
		throw new Error(
			"Docs operating system lockfile refresh rollback notes are not approved.",
		);
	}
	if (
		approvedWorkflowRun.localWorkflowPacketRef !==
		`.sbs/runs/${approvedWorkflowRun.workflowRunId}/workflow-packet.json`
	) {
		throw new Error(
			"Docs operating system lockfile refresh workflow packet ref is not approved.",
		);
	}
	if (
		approvedWorkflowRun.localProofRef !==
		`.sbs/runs/${approvedWorkflowRun.workflowRunId}/proof.json`
	) {
		throw new Error(
			"Docs operating system lockfile refresh proof ref is not approved.",
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
			`Docs operating system lockfile refresh ${errorMessage} are not approved.`,
		);
	}
}
