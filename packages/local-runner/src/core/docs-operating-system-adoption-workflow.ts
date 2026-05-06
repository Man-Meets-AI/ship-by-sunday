import { existsSync } from "node:fs";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { runBoundedProcess } from "./bounded-process";
import type { RunnerCredential } from "./local-runner-home";
import type { LocalProjectState } from "./local-project-state";
import { createRunnerEvent, type RunnerEvent } from "./runner-events";
import type { ApprovedWorkflowRunPacket } from "./workflow-run-api";
import { parseGitStatusPathsForProof } from "./docs-spine-adoption-workflow";
import {
	DOCS_OPERATING_SYSTEM_ADOPTION_ALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_ADOPTION_DISALLOWED_TOUCH_TARGETS,
	DOCS_OPERATING_SYSTEM_ADOPTION_EXPECTED_OUTPUTS,
	DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
	DOCS_OPERATING_SYSTEM_ADOPTION_LOCAL_ARTIFACT_REFS,
	DOCS_OPERATING_SYSTEM_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_ADOPTION_PERFORMANCE_BUDGETS,
	DOCS_OPERATING_SYSTEM_ADOPTION_PHASES,
	DOCS_OPERATING_SYSTEM_ADOPTION_PROFILE_NAME,
	DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_DELIVERY,
	DOCS_OPERATING_SYSTEM_ADOPTION_PROVIDER_ACCESS_POLICY,
	DOCS_OPERATING_SYSTEM_ADOPTION_REVOCATION_BEHAVIOR,
	DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_ADOPTION_STOP_CONDITIONS,
	DOCS_OPERATING_SYSTEM_ADOPTION_SYNC_POLICY_SUMMARY,
	DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION,
} from "../workflows/docs-operating-system-adoption/manifest";
import { buildDocsOperatingSystemInstallPlan } from "../workflows/docs-operating-system-adoption/install-plan";
import type {
	DocsOperatingSystemManifest,
	DocsOperatingSystemProofCommandResult,
} from "../workflows/docs-operating-system-adoption/schemas";
import { buildDocsSpineScannerBundle } from "../workflows/docs-spine-adoption/scanner";

export type DocsOperatingSystemAdoptionWorkflowResult = {
	workflowRunId: string;
	workflowId: typeof DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID;
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

type RunDocsOperatingSystemAdoptionWorkflowOptions = {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	approvedWorkflowRun: ApprovedWorkflowRunPacket;
	confirmDocsOperatingSystemScan: boolean;
	confirmDocsOperatingSystemToolingPlan: boolean;
	now?: number;
	fetchRunnerEvent?: typeof fetch;
};

type RootPackageManifestFacts = {
	name?: string;
	scripts: Record<string, string>;
};

export async function runDocsOperatingSystemAdoptionWorkflow({
	repositoryRoot,
	state,
	credential,
	approvedWorkflowRun,
	confirmDocsOperatingSystemScan,
	confirmDocsOperatingSystemToolingPlan,
	now = Date.now(),
	fetchRunnerEvent,
}: RunDocsOperatingSystemAdoptionWorkflowOptions): Promise<DocsOperatingSystemAdoptionWorkflowResult> {
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

	if (!confirmDocsOperatingSystemScan) {
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
			blockedReason:
				"docs-operating-system-adoption requires --confirm-docs-operating-system-scan because it writes local .sbs scanner artifacts.",
			fetchRunnerEvent,
		});
	}
	if (!confirmDocsOperatingSystemToolingPlan) {
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
			blockedReason:
				"docs-operating-system-adoption requires --confirm-docs-operating-system-tooling-plan because it writes local .sbs tooling plan artifacts.",
			fetchRunnerEvent,
		});
	}

	if (
		approvedWorkflowRun.workflowId !==
		DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID
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
				"Approved workflow run is not docs-operating-system-adoption.",
			fetchRunnerEvent,
		});
	}

	try {
		assertApprovedDocsOperatingSystemAdoptionPacket(approvedWorkflowRun);
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
				"Approved write lease expired before docs operating system dry-run started.",
			fetchRunnerEvent,
		});
	}

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
				"Worktree must be clean before docs operating system dry-run writes.",
			fetchRunnerEvent,
		});
	}

	await ensureSafeDocsOperatingSystemArtifactDirectory(
		repositoryRoot,
		localRunDirectoryRef,
		workflowRunId,
	);
	await mkdir(localRunDirectory, { recursive: true });

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
				workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
				branchName,
				profileName,
			},
		}),
	});

	try {
		const workflowPacketRef = `${localRunDirectoryRef}/workflow-packet.json`;
		const proofRef = `${localRunDirectoryRef}/proof.json`;
		const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
		const manifestRef =
			DOCS_OPERATING_SYSTEM_ADOPTION_LOCAL_ARTIFACT_REFS.manifest;
		const repoFactsRef =
			DOCS_OPERATING_SYSTEM_ADOPTION_LOCAL_ARTIFACT_REFS.repoFacts;
		const scannerSummaryRef =
			DOCS_OPERATING_SYSTEM_ADOPTION_LOCAL_ARTIFACT_REFS.scannerSummary;
		const installPlanRef =
			DOCS_OPERATING_SYSTEM_ADOPTION_LOCAL_ARTIFACT_REFS.installPlan;
		const scannerBundle = await buildDocsSpineScannerBundle({
			repositoryRoot,
			now,
		});
		const trackedRepoRefs = await listTrackedRepoRefs(repositoryRoot);
		const rootPackageManifest = await readRootPackageManifest(repositoryRoot);
		const installPlan = buildDocsOperatingSystemInstallPlan({
			repoFacts: scannerBundle.repoFacts,
			rootPackageManifest,
			trackedRepoRefs,
			now,
		});
		const scannerSummary = buildScannerSummary({
			scannerArtifactCount: scannerBundle.artifacts.length,
			trackedRepoRefCount: trackedRepoRefs.length,
			now,
		});
		const manifest = buildManifest(now);
		const createdArtifacts = [
			workflowPacketRef,
			manifestRef,
			repoFactsRef,
			scannerSummaryRef,
			installPlanRef,
			proofRef,
			syncPreviewRef,
		];

		await writeJsonArtifact(repositoryRoot, workflowRunId, workflowPacketRef, {
			schemaVersion: "docs-operating-system-adoption-workflow-packet.v1",
			workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
			workflowVersion: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION,
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
			codexInterpretation: "disabled for dry-run tooling manifest workflow",
			codexWritePolicy:
				"disabled outside approved .sbs docs operating system artifacts",
			localArtifacts: createdArtifacts,
			allowedTouchTargets: DOCS_OPERATING_SYSTEM_ADOPTION_ALLOWED_TOUCH_TARGETS,
			disallowedTouchTargets:
				DOCS_OPERATING_SYSTEM_ADOPTION_DISALLOWED_TOUCH_TARGETS,
			providerAccessPolicy:
				DOCS_OPERATING_SYSTEM_ADOPTION_PROVIDER_ACCESS_POLICY,
			proofCommands: DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS,
			syncPolicy: DOCS_OPERATING_SYSTEM_ADOPTION_SYNC_POLICY_SUMMARY,
			stopConditions: DOCS_OPERATING_SYSTEM_ADOPTION_STOP_CONDITIONS,
			approvalRequired: true,
			expectedOutputs: DOCS_OPERATING_SYSTEM_ADOPTION_EXPECTED_OUTPUTS,
			rollbackNotes: DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES,
			proofDelivery: DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_DELIVERY,
			revocationBehavior: DOCS_OPERATING_SYSTEM_ADOPTION_REVOCATION_BEHAVIOR,
			createdAt: now,
		});
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			manifestRef,
			manifest,
		);
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			repoFactsRef,
			scannerBundle.repoFacts,
		);
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			scannerSummaryRef,
			scannerSummary,
		);
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			installPlanRef,
			installPlan,
		);

		const preexistingDirtyFileRefs = preRunDirtyFileRefs.filter(
			(fileRef) => !fileRef.startsWith(".sbs/"),
		);
		const { proofCommandResults, unexpectedTouchedFiles } =
			await runProofCommands(repositoryRoot, workflowRunId);
		const proofStatus = proofCommandResults.every(
			(result) => result.status === "passed",
		)
			? "passed"
			: "failed";
		const proofSummary =
			proofStatus === "passed"
				? "Docs operating system dry-run wrote only approved .sbs artifacts and produced a portable docs tooling install plan."
				: "Docs operating system dry-run wrote local artifacts, but proof commands failed.";
		const blockedProof = installPlan.blockedOperations.map((operation) => ({
			stage: operation.operationId,
			reason: operation.reason,
			nextApprovalRequired: operation.nextApprovalRequired,
		}));

		await writeJsonArtifact(repositoryRoot, workflowRunId, proofRef, {
			schemaVersion: "docs-operating-system-adoption-proof.v1",
			workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
			workflowVersion: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION,
			workflowRunId,
			branchName,
			profileName,
			installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
			manifestRef,
			repoFactsRef,
			scannerSummaryRef,
			installPlanRef,
			moduleStatuses: installPlan.resolvedModules.map((module) => ({
				moduleId: module.moduleId,
				status: module.status,
			})),
			packageScriptOperationStatuses: installPlan.packageScriptOperations.map(
				(operation) => ({
					scriptName: operation.scriptName,
					status: operation.status,
					currentScriptRecognized: operation.currentScriptRecognized,
				}),
			),
			outOfScopeDetections: installPlan.outOfScopeDetections.map(
				(detection) => ({
					kind: detection.kind,
					evidenceRefs: detection.evidenceRefs,
				}),
			),
			diffSummary: await readGitDiffSummary(repositoryRoot),
			preexistingDirtyFileRefs,
			touchedFiles: unexpectedTouchedFiles,
			createdArtifacts,
			proofCommandsRun: proofCommandResults.map((result) => result.commandName),
			proofCommandResults,
			blockedProof,
			rollbackInstructions:
				"Review the local .sbs docs operating system dry-run artifacts. To roll back, delete the .sbs docs-operating-system-adoption artifacts and this workflow run directory.",
			nextRecommendedWorkflow:
				DOCS_OPERATING_SYSTEM_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
			createdAt: now,
		});
		await writeJsonArtifact(repositoryRoot, workflowRunId, syncPreviewRef, {
			schemaVersion: "docs-operating-system-adoption-sync-preview.v1",
			workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
			workflowVersion: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION,
			branchName,
			profileName,
			installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
			touchedFileRefs: unexpectedTouchedFiles,
			createdArtifactRefs: createdArtifacts,
			moduleStatuses: installPlan.resolvedModules.map((module) => ({
				moduleId: module.moduleId,
				status: module.status,
			})),
			packageScriptOperationStatuses: installPlan.packageScriptOperations.map(
				(operation) => ({
					scriptName: operation.scriptName,
					status: operation.status,
				}),
			),
			outOfScopeDetectionKinds: installPlan.outOfScopeDetections.map(
				(detection) => detection.kind,
			),
			proofCommandResults: proofCommandResults.map(
				({ commandName, status }) => ({
					commandName,
					status,
				}),
			),
			blockedProofCount: blockedProof.length,
			nextRecommendedWorkflowId:
				DOCS_OPERATING_SYSTEM_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
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
					workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
					writeLeaseId,
					proofStatus,
					proofSummary,
					touchedFileRefs: unexpectedTouchedFiles,
					createdArtifactRefs: createdArtifacts,
					proofCommandResults: proofCommandResults.map(
						({ commandName, status }) => ({
							commandName,
							status,
						}),
					),
					nextRecommendedWorkflowId:
						DOCS_OPERATING_SYSTEM_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
				},
			}),
		});

		return {
			workflowRunId,
			workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
			status: "proof_completed",
			branchName,
			profileName,
			installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
			proofStatus,
			localRunDirectoryRef,
			touchedFiles: unexpectedTouchedFiles,
			createdArtifacts,
			deliveredEvents: startEventResult.delivered + proofEventResult.delivered,
			remainingEvents: startEventResult.remaining + proofEventResult.remaining,
		};
	} catch {
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
			blockedStage: "artifact-generation",
			blockedReason:
				"Docs operating system dry-run artifact generation failed before proof artifacts could be completed.",
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

function buildManifest(now: number): DocsOperatingSystemManifest {
	return {
		schemaVersion: "docs-operating-system-adoption-manifest.v1",
		workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
		workflowVersion: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		phases: DOCS_OPERATING_SYSTEM_ADOPTION_PHASES,
		allowedTouchTargets: DOCS_OPERATING_SYSTEM_ADOPTION_ALLOWED_TOUCH_TARGETS,
		disallowedTouchTargets:
			DOCS_OPERATING_SYSTEM_ADOPTION_DISALLOWED_TOUCH_TARGETS,
		proofCommands: DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS,
		localArtifactRefs: DOCS_OPERATING_SYSTEM_ADOPTION_LOCAL_ARTIFACT_REFS,
		syncPolicySummary: DOCS_OPERATING_SYSTEM_ADOPTION_SYNC_POLICY_SUMMARY,
		rollbackNotes: DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES,
		performanceBudgets: DOCS_OPERATING_SYSTEM_ADOPTION_PERFORMANCE_BUDGETS,
		createdAt: now,
	};
}

function buildScannerSummary({
	scannerArtifactCount,
	trackedRepoRefCount,
	now,
}: {
	scannerArtifactCount: number;
	trackedRepoRefCount: number;
	now: number;
}) {
	return {
		schemaVersion: "docs-operating-system-scanner-summary.v1",
		workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
		sourceScanner: "docs-spine-adoption",
		scannerArtifactCount,
		trackedRepoRefCount,
		privacyBoundary: {
			rawSourceIncluded: false,
			rawLogsIncluded: false,
			packageScriptBodiesIncluded: false,
			dependencyVersionsIncluded: false,
			localAbsolutePathsIncluded: false,
			codexTranscriptsIncluded: false,
		},
		createdAt: now,
	};
}

async function runProofCommands(repositoryRoot: string, workflowRunId: string) {
	const commands = [
		["git", ["status", "--short"]],
		["git", ["diff", "--name-only"]],
		["git", ["diff", "--check"]],
	] as const;
	const results: DocsOperatingSystemProofCommandResult[] = [];
	const unexpectedTouchedFiles = await listUnexpectedTouchedFiles(
		repositoryRoot,
		workflowRunId,
	);
	for (const [command, args] of commands) {
		const result = await runBoundedProcess({
			command,
			args: [...args],
			cwd: repositoryRoot,
			timeoutMs: 10_000,
		});
		const commandName = [command, ...args].join(" ");
		const hasUnexpectedTouchedFiles =
			commandName === "git status --short" && unexpectedTouchedFiles.length > 0;
		const status =
			result.succeeded && !hasUnexpectedTouchedFiles ? "passed" : "failed";
		results.push({
			commandName,
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

async function listUnexpectedTouchedFiles(
	repositoryRoot: string,
	workflowRunId: string,
) {
	const dirtyFileRefs = await listGitDirtyFileRefs(repositoryRoot);
	return dirtyFileRefs.filter(
		(fileRef) =>
			!isAllowedDocsOperatingSystemArtifactRef(fileRef, workflowRunId),
	);
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
	return dirtyFileRefs.sort();
}

async function listTrackedRepoRefs(repositoryRoot: string) {
	const result = await runGit(repositoryRoot, ["ls-files"]);
	if (!result.succeeded) {
		return [];
	}
	return result.stdout
		.split(/\r?\n/)
		.map((ref) => ref.trim())
		.filter((ref) => ref.length > 0)
		.sort();
}

async function readRootPackageManifest(
	repositoryRoot: string,
): Promise<RootPackageManifestFacts | null> {
	const packageJsonPath = path.join(repositoryRoot, "package.json");
	if (!existsSync(packageJsonPath)) {
		return null;
	}
	const parsed = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
		name?: unknown;
		scripts?: unknown;
	};
	const scripts =
		parsed.scripts &&
		typeof parsed.scripts === "object" &&
		!Array.isArray(parsed.scripts)
			? Object.fromEntries(
					Object.entries(parsed.scripts).filter(
						(entry): entry is [string, string] =>
							typeof entry[0] === "string" && typeof entry[1] === "string",
					),
				)
			: {};
	return {
		name: typeof parsed.name === "string" ? parsed.name : undefined,
		scripts,
	};
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
	await assertApprovedDocsOperatingSystemArtifactRef(
		repoRelativePath,
		workflowRunId,
	);
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	const artifactPath = path.join(repositoryRoot, repoRelativePath);
	await mkdir(path.dirname(artifactPath), { recursive: true });
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	await writeFile(artifactPath, value);
}

async function ensureSafeDocsOperatingSystemArtifactDirectory(
	repositoryRoot: string,
	repoRelativePath: string,
	workflowRunId: string,
) {
	await assertApprovedDocsOperatingSystemArtifactRef(
		`${repoRelativePath}/.directory-placeholder`,
		workflowRunId,
	);
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
}

function assertApprovedDocsOperatingSystemArtifactRef(
	repoRelativePath: string,
	workflowRunId: string,
) {
	const segments = repoRelativePath.split("/");
	if (
		path.isAbsolute(repoRelativePath) ||
		repoRelativePath.includes("\\") ||
		segments.some(
			(segment) => segment === "" || segment === "." || segment === "..",
		)
	) {
		throw new Error(
			"Docs operating system artifact ref must be repo-relative.",
		);
	}
	if (
		isAllowedDocsOperatingSystemArtifactRef(repoRelativePath, workflowRunId)
	) {
		return;
	}
	throw new Error(
		"Docs operating system artifact ref is outside the approved write roots.",
	);
}

function isAllowedDocsOperatingSystemArtifactRef(
	fileRef: string,
	workflowRunId: string,
) {
	return (
		fileRef.startsWith(`.sbs/runs/${workflowRunId}/`) ||
		fileRef.startsWith(".sbs/docs-operating-system-adoption/")
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
			if ((error as { code?: string }).code === "ENOENT") {
				return null;
			}
			throw error;
		});
		if (!stats) {
			return;
		}
		if (stats.isSymbolicLink()) {
			throw new Error(
				"Docs operating system artifact path crosses a symbolic link and is not safe to write.",
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
	fetchRunnerEvent?: typeof fetch;
}): Promise<DocsOperatingSystemAdoptionWorkflowResult> {
	await ensureSafeDocsOperatingSystemArtifactDirectory(
		repositoryRoot,
		localRunDirectoryRef,
		workflowRunId,
	);
	await mkdir(localRunDirectory, { recursive: true });
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const createdArtifacts = [proofRef, syncPreviewRef];
	await writeJsonArtifact(repositoryRoot, workflowRunId, proofRef, {
		schemaVersion: "docs-operating-system-adoption-proof.v1",
		workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
		workflowVersion: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION,
		workflowRunId,
		branchName,
		profileName,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		touchedFiles: [],
		createdArtifacts,
		proofCommandsRun: [],
		proofCommandResults: [],
		blockedProof: [
			{
				stage: blockedStage,
				reason: blockedReason,
				nextApprovalRequired: true,
			},
		],
		rollbackInstructions:
			"No source files were patched. Resolve the block and approve a fresh docs operating system dry-run workflow if needed.",
		nextRecommendedWorkflow:
			DOCS_OPERATING_SYSTEM_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
		createdAt: Date.now(),
	});
	await writeJsonArtifact(repositoryRoot, workflowRunId, syncPreviewRef, {
		schemaVersion: "docs-operating-system-adoption-sync-preview.v1",
		workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
		workflowVersion: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION,
		branchName,
		profileName,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		touchedFileRefs: [],
		createdArtifactRefs: createdArtifacts,
		proofCommandResults: [],
		blockedReason,
		nextRecommendedWorkflowId:
			DOCS_OPERATING_SYSTEM_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
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
				workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
				writeLeaseId,
				blockedStage,
				blockedReason,
			},
		}),
	});
	return {
		workflowRunId,
		workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
		status: "blocked",
		branchName,
		profileName,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		proofStatus: "blocked",
		localRunDirectoryRef,
		touchedFiles: [],
		createdArtifacts,
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
	if (!/^sbs\/docs-operating-system-adoption-\d{8}-\d{4}$/.test(branchName)) {
		throw new Error(
			"Approved branch name is not a docs operating system adoption branch.",
		);
	}
}

function assertApprovedProfile(profileName: string) {
	if (profileName !== DOCS_OPERATING_SYSTEM_ADOPTION_PROFILE_NAME) {
		throw new Error(
			"Docs operating system adoption requires the sbs-workspace-write profile.",
		);
	}
}

function assertApprovedInstallProfile(installProfile: string | undefined) {
	if (installProfile !== DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE) {
		throw new Error(
			"Docs operating system adoption requires installProfile: worker-grade.",
		);
	}
}

function assertApprovedDocsOperatingSystemAdoptionPacket(
	approvedWorkflowRun: ApprovedWorkflowRunPacket,
) {
	if (
		approvedWorkflowRun.workflowVersion !==
		DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION
	) {
		throw new Error(
			"Docs operating system adoption workflow version is not approved.",
		);
	}
	if (approvedWorkflowRun.writeLeaseDurationMinutes !== 30) {
		throw new Error(
			"Docs operating system adoption write lease duration is not approved.",
		);
	}
	if (approvedWorkflowRun.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error(
			"Docs operating system adoption requires a clean-worktree policy.",
		);
	}
	assertExactTextList(
		approvedWorkflowRun.expectedOutputs,
		DOCS_OPERATING_SYSTEM_ADOPTION_EXPECTED_OUTPUTS,
		"expected outputs",
	);
	assertExactTextList(
		approvedWorkflowRun.allowedTouchTargets,
		DOCS_OPERATING_SYSTEM_ADOPTION_ALLOWED_TOUCH_TARGETS,
		"allowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.disallowedTouchTargets,
		DOCS_OPERATING_SYSTEM_ADOPTION_DISALLOWED_TOUCH_TARGETS,
		"disallowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.proofCommands,
		DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS,
		"proof commands",
	);
	if (
		approvedWorkflowRun.syncPolicySummary !==
		DOCS_OPERATING_SYSTEM_ADOPTION_SYNC_POLICY_SUMMARY
	) {
		throw new Error(
			"Docs operating system adoption sync policy is not approved.",
		);
	}
	assertExactTextList(
		approvedWorkflowRun.stopConditions,
		DOCS_OPERATING_SYSTEM_ADOPTION_STOP_CONDITIONS,
		"stop conditions",
	);
	if (
		approvedWorkflowRun.rollbackNotes !==
		DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES
	) {
		throw new Error(
			"Docs operating system adoption rollback notes are not approved.",
		);
	}
	if (
		approvedWorkflowRun.localWorkflowPacketRef !==
		`.sbs/runs/${approvedWorkflowRun.workflowRunId}/workflow-packet.json`
	) {
		throw new Error(
			"Docs operating system adoption workflow packet ref is not approved.",
		);
	}
	if (
		approvedWorkflowRun.localProofRef !==
		`.sbs/runs/${approvedWorkflowRun.workflowRunId}/proof.json`
	) {
		throw new Error(
			"Docs operating system adoption proof ref is not approved.",
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
		throw new Error(errorMessage);
	}
}
