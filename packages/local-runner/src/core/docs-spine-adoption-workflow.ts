import { lstat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { JsonObject, JsonValue } from "./json-value";
import { runBoundedProcess } from "./bounded-process";
import type { RunnerCredential } from "./local-runner-home";
import type { LocalProjectState } from "./local-project-state";
import { createRunnerEvent, type RunnerEvent } from "./runner-events";
import type { ApprovedWorkflowRunPacket } from "./workflow-run-api";
import {
	DOCS_SPINE_ADOPTION_ALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_ADOPTION_DISALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_ADOPTION_EXPECTED_OUTPUTS,
	DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS,
	DOCS_SPINE_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
	DOCS_SPINE_ADOPTION_PERFORMANCE_BUDGETS,
	DOCS_SPINE_ADOPTION_PHASES,
	DOCS_SPINE_ADOPTION_PROFILE_NAME,
	DOCS_SPINE_ADOPTION_PROOF_COMMANDS,
	DOCS_SPINE_ADOPTION_PROOF_DELIVERY,
	DOCS_SPINE_ADOPTION_PROVIDER_ACCESS_POLICY,
	DOCS_SPINE_ADOPTION_REVOCATION_BEHAVIOR,
	DOCS_SPINE_ADOPTION_ROLLBACK_NOTES,
	DOCS_SPINE_ADOPTION_STOP_CONDITIONS,
	DOCS_SPINE_ADOPTION_SYNC_POLICY_SUMMARY,
	DOCS_SPINE_ADOPTION_WORKFLOW_ID,
	DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
} from "../workflows/docs-spine-adoption/manifest";
import { buildDocsSpineScannerBundle } from "../workflows/docs-spine-adoption/scanner";
import { buildDocsSpineDraftQualityReport } from "../workflows/docs-spine-adoption/quality-eval";
import type {
	DocsSpineAdoptionManifest,
	DocsSpineAdoptionProofCommandResult,
	DocsSpineScannerArtifact,
} from "../workflows/docs-spine-adoption/schemas";
import { buildDocsSpineSynthesisArtifacts } from "../workflows/docs-spine-adoption/synthesis";

export type DocsSpineAdoptionWorkflowResult = {
	workflowRunId: string;
	workflowId: typeof DOCS_SPINE_ADOPTION_WORKFLOW_ID;
	status: "proof_completed" | "blocked";
	branchName: string;
	profileName: string;
	proofStatus: "passed" | "failed" | "blocked";
	localRunDirectoryRef: string;
	touchedFiles: string[];
	createdArtifacts: string[];
	blockedReason?: string;
	deliveredEvents: number;
	remainingEvents: number;
};

type RunDocsSpineAdoptionWorkflowOptions = {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	approvedWorkflowRun: ApprovedWorkflowRunPacket;
	confirmDocsSpineAdoption: boolean;
	now?: number;
	fetchRunnerEvent?: typeof fetch;
};

export async function runDocsSpineAdoptionWorkflow({
	repositoryRoot,
	state,
	credential,
	approvedWorkflowRun,
	confirmDocsSpineAdoption,
	now = Date.now(),
	fetchRunnerEvent,
}: RunDocsSpineAdoptionWorkflowOptions): Promise<DocsSpineAdoptionWorkflowResult> {
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

	if (!confirmDocsSpineAdoption) {
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
				"docs-spine-adoption requires --confirm-docs-spine-adoption because it writes local .sbs docs-spine proof artifacts.",
			fetchRunnerEvent,
		});
	}

	if (approvedWorkflowRun.workflowId !== DOCS_SPINE_ADOPTION_WORKFLOW_ID) {
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
			blockedReason: "Approved workflow run is not docs-spine-adoption.",
			fetchRunnerEvent,
		});
	}

	try {
		assertApprovedDocsSpineAdoptionPacket(approvedWorkflowRun);
		assertSafeBranchName(branchName);
		assertApprovedProfile(profileName);
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
				"Approved write lease expired before docs spine adoption scaffold started.",
			fetchRunnerEvent,
		});
	}

	const preAdoptionDirtyFileRefs = await listGitDirtyFileRefs(repositoryRoot);
	const unsafePreAdoptionDirtyFiles = listUnsafePreAdoptionDirtyFiles(
		preAdoptionDirtyFileRefs,
		workflowRunId,
	);
	if (unsafePreAdoptionDirtyFiles.length > 0) {
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
				"Worktree has unsafe runner artifacts before docs spine adoption scaffold writes.",
			fetchRunnerEvent,
		});
	}

	await ensureSafeDocsSpineArtifactDirectory(
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
				workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
				branchName,
				profileName,
			},
		}),
	});

	try {
		const workflowPacketRef = `${localRunDirectoryRef}/workflow-packet.json`;
		const proofRef = `${localRunDirectoryRef}/proof.json`;
		const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
		const manifestRef = ".sbs/docs-spine-adoption/manifest.json";
		const repoFactsRef = ".sbs/docs-spine-adoption/facts/repo-facts.json";
		const scannerBundle = await buildDocsSpineScannerBundle({
			repositoryRoot,
			now,
		});
		const scannerArtifactRefs = scannerBundle.artifacts.map(
			(scannerArtifact) => scannerArtifact.repoRelativePath,
		);
		const synthesisArtifacts = buildDocsSpineSynthesisArtifacts({
			repoFacts: scannerBundle.repoFacts,
			scannerArtifacts: scannerBundle.artifacts,
			now,
		});
		const qualityReport = buildDocsSpineDraftQualityReport({
			draftArtifacts: synthesisArtifacts,
			repoFacts: scannerBundle.repoFacts,
			now,
		});
		const synthesisArtifactRefs = synthesisArtifacts.map(
			(synthesisArtifact) => synthesisArtifact.repoRelativePath,
		);
		const qualityReportRef =
			DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.qualityReport;
		const parityChecklistRef =
			DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.parityChecklist;
		const parityChecklist = buildParityChecklistArtifact(
			scannerBundle.artifacts,
			now,
		);
		const createdArtifacts = [
			workflowPacketRef,
			manifestRef,
			repoFactsRef,
			...scannerArtifactRefs,
			parityChecklistRef,
			...synthesisArtifactRefs,
			qualityReportRef,
			proofRef,
			syncPreviewRef,
		];

		const repoFacts = scannerBundle.repoFacts;
		const manifest = buildManifest(now);

		await writeJsonArtifact(repositoryRoot, workflowRunId, workflowPacketRef, {
			schemaVersion: "docs-spine-adoption-workflow-packet.v1",
			workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
			workflowVersion: DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
			projectId: state.projectId,
			runnerId: state.runnerId,
			profileName,
			writeLeaseId,
			writeLeaseExpiresAt,
			baseBranch,
			targetBranch: branchName,
			dirtyStatePolicy: "require_clean_worktree",
			inputs: {
				approvedWorkflowRunId: workflowRunId,
				customerBottleneckContext:
					"Create the deterministic docs-spine adoption scaffold before scanner, synthesis, and apply slices.",
			},
			deterministicProbes: [
				"package-manager-detection",
				"package-script-inventory",
				"instruction-surface-inventory",
				"docs-spine-surface-inventory",
				"validation-surface-inventory",
			],
			executionSurface: "local_runner",
			codexInterpretation: "disabled for scaffold workflow",
			codexWritePolicy: "disabled outside approved .sbs docs-spine artifacts",
			localArtifacts: createdArtifacts,
			allowedTouchTargets: DOCS_SPINE_ADOPTION_ALLOWED_TOUCH_TARGETS,
			disallowedTouchTargets: DOCS_SPINE_ADOPTION_DISALLOWED_TOUCH_TARGETS,
			providerAccessPolicy: DOCS_SPINE_ADOPTION_PROVIDER_ACCESS_POLICY,
			proofCommands: DOCS_SPINE_ADOPTION_PROOF_COMMANDS,
			syncPolicy: DOCS_SPINE_ADOPTION_SYNC_POLICY_SUMMARY,
			stopConditions: DOCS_SPINE_ADOPTION_STOP_CONDITIONS,
			approvalRequired: true,
			expectedOutputs: DOCS_SPINE_ADOPTION_EXPECTED_OUTPUTS,
			rollbackNotes: DOCS_SPINE_ADOPTION_ROLLBACK_NOTES,
			proofDelivery: DOCS_SPINE_ADOPTION_PROOF_DELIVERY,
			revocationBehavior: DOCS_SPINE_ADOPTION_REVOCATION_BEHAVIOR,
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
			repoFacts,
		);
		for (const scannerArtifact of scannerBundle.artifacts) {
			await writeJsonArtifact(
				repositoryRoot,
				workflowRunId,
				scannerArtifact.repoRelativePath,
				scannerArtifact.value,
			);
		}
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			parityChecklistRef,
			parityChecklist,
		);
		for (const synthesisArtifact of synthesisArtifacts) {
			await writeJsonArtifact(
				repositoryRoot,
				workflowRunId,
				synthesisArtifact.repoRelativePath,
				synthesisArtifact.value,
			);
		}
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			qualityReportRef,
			qualityReport,
		);

		const preexistingDirtyFileRefs = preAdoptionDirtyFileRefs.filter(
			(fileRef) => !fileRef.startsWith(".sbs/"),
		);
		const { proofCommandResults, unexpectedTouchedFiles } =
			await runProofCommands(
				repositoryRoot,
				workflowRunId,
				preAdoptionDirtyFileRefs,
			);
		const proofStatus =
			proofCommandResults.every((result) => result.status === "passed") &&
			qualityReport.status === "passed"
				? "passed"
				: "failed";
		const proofSummary =
			proofStatus === "passed"
				? "Docs spine adoption scaffold wrote only approved .sbs artifacts and passed docs-spine quality evals."
				: "Docs spine adoption scaffold wrote local artifacts, but proof commands or docs-spine quality evals failed.";

		await writeJsonArtifact(repositoryRoot, workflowRunId, proofRef, {
			schemaVersion: "docs-spine-adoption-proof.v1",
			workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
			workflowVersion: DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
			workflowRunId,
			branchName,
			profileName,
			manifestRef,
			repoFactsRef,
			qualityReportRef,
			qualityReportStatus: qualityReport.status,
			qualityScore: qualityReport.score,
			qualityFailedRuleIds: qualityReport.ruleResults
				.filter((rule) => rule.status === "failed")
				.map((rule) => rule.ruleId),
			diffSummary: await readGitDiffSummary(repositoryRoot),
			preexistingDirtyFileRefs,
			touchedFiles: unexpectedTouchedFiles,
			createdArtifacts,
			proofCommandsRun: proofCommandResults.map((result) => result.commandName),
			proofCommandResults,
			blockedProof: repoFacts.blockedFacts.map((fact) => ({
				stage: fact.factId,
				reason: fact.reason,
				nextApprovalRequired: fact.nextApprovalRequired,
			})),
			rollbackInstructions:
				"Review the local .sbs docs-spine artifacts. To roll back, delete the .sbs docs-spine run artifacts for this workflow run.",
			nextRecommendedWorkflow: DOCS_SPINE_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
			createdAt: now,
		});
		await writeJsonArtifact(repositoryRoot, workflowRunId, syncPreviewRef, {
			schemaVersion: "docs-spine-adoption-sync-preview.v1",
			workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
			workflowVersion: DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
			branchName,
			profileName,
			touchedFileRefs: unexpectedTouchedFiles,
			createdArtifactRefs: createdArtifacts,
			proofCommandResults: proofCommandResults.map(
				({ commandName, status }) => ({
					commandName,
					status,
				}),
			),
			qualityReportRef,
			qualityReportStatus: qualityReport.status,
			qualityScore: qualityReport.score,
			preexistingDirtyFileCount: preexistingDirtyFileRefs.length,
			blockedProofCount: repoFacts.blockedFacts.length,
			nextRecommendedWorkflowId:
				DOCS_SPINE_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
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
					workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
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
						DOCS_SPINE_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
				},
			}),
		});

		return {
			workflowRunId,
			workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
			status: "proof_completed",
			branchName,
			profileName,
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
				"Docs spine adoption artifact generation failed before proof artifacts could be completed.",
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

function buildManifest(now: number): DocsSpineAdoptionManifest {
	return {
		schemaVersion: "docs-spine-adoption-manifest.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		workflowVersion: DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
		phases: DOCS_SPINE_ADOPTION_PHASES,
		allowedTouchTargets: DOCS_SPINE_ADOPTION_ALLOWED_TOUCH_TARGETS,
		disallowedTouchTargets: DOCS_SPINE_ADOPTION_DISALLOWED_TOUCH_TARGETS,
		proofCommands: DOCS_SPINE_ADOPTION_PROOF_COMMANDS,
		localArtifactRefs: DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS,
		syncPolicySummary: DOCS_SPINE_ADOPTION_SYNC_POLICY_SUMMARY,
		rollbackNotes: DOCS_SPINE_ADOPTION_ROLLBACK_NOTES,
		performanceBudgets: DOCS_SPINE_ADOPTION_PERFORMANCE_BUDGETS,
		reservedArtifactRefs: {
			semgrepOutput: ".sbs/docs-spine-adoption/scans/semgrep.json",
			astOutput: ".sbs/docs-spine-adoption/scans/ast-signals.json",
		},
		createdAt: now,
	};
}

function buildParityChecklistArtifact(
	scannerArtifacts: DocsSpineScannerArtifact[],
	now: number,
) {
	const docsGapReport = scannerArtifacts.find(
		(artifact) =>
			artifact.repoRelativePath ===
			DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.docsGapReport,
	);
	const missingSurfaceIds = getStringArrayField(
		docsGapReport?.value,
		"missingSurfaceIds",
	);
	return {
		schemaVersion: "docs-spine-parity-checklist.v1",
		status: missingSurfaceIds.length ? "missing_surfaces" : "complete",
		sourceArtifactRefs: [
			DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.docsGapReport,
			DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS.validationSurfaceMap,
		],
		missingSurfaceIds,
		privacyBoundary: {
			rawSourceIncluded: false,
			rawLogsIncluded: false,
			packageScriptBodiesIncluded: false,
			dependencyVersionsIncluded: false,
			envValuesIncluded: false,
			localAbsolutePathsIncluded: false,
			codexTranscriptsIncluded: false,
		},
		createdAt: now,
	};
}

function getStringArrayField(value: JsonValue | undefined, fieldName: string) {
	if (!value || typeof value !== "object" || !(fieldName in value)) {
		return [];
	}
	const fieldValue = (value as JsonObject)[fieldName];
	if (!Array.isArray(fieldValue)) {
		return [];
	}
	return fieldValue.filter(
		(entry): entry is string => typeof entry === "string",
	);
}

async function runProofCommands(
	repositoryRoot: string,
	workflowRunId: string,
	preAdoptionDirtyFileRefs: string[] = [],
) {
	const commands = [
		["git", ["status", "--short"]],
		["git", ["diff", "--name-only"]],
		["git", ["diff", "--check"]],
	] as const;
	const results: DocsSpineAdoptionProofCommandResult[] = [];
	const unexpectedTouchedFiles = await listUnexpectedTouchedFiles(
		repositoryRoot,
		workflowRunId,
		preAdoptionDirtyFileRefs,
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
	preAdoptionDirtyFileRefs: string[] = [],
) {
	const preAdoptionDirtySet = new Set(preAdoptionDirtyFileRefs);
	const dirtyFileRefs = await listGitDirtyFileRefs(repositoryRoot);
	return dirtyFileRefs
		.filter((fileRef) => !preAdoptionDirtySet.has(fileRef))
		.filter((fileRef) => !isAllowedLocalProofRef(fileRef, workflowRunId));
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

function listUnsafePreAdoptionDirtyFiles(
	dirtyFileRefs: string[],
	workflowRunId: string,
) {
	return dirtyFileRefs
		.filter((fileRef) => {
			if (fileRef === "<unable to inspect git status>") {
				return true;
			}
			return (
				fileRef.startsWith(".sbs/") &&
				!isAllowedLocalProofRef(fileRef, workflowRunId)
			);
		})
		.sort();
}

export function parseGitStatusPathsForProof(statusLine: string) {
	if (statusLine.trim() === "") {
		return [];
	}
	const rawPath = statusLine.slice(3).trim();
	const renameSeparator = " -> ";
	if (rawPath.includes(renameSeparator)) {
		return rawPath
			.split(renameSeparator)
			.map((fileRef) => cleanGitStatusPath(fileRef))
			.filter((fileRef) => fileRef.length > 0);
	}
	return [cleanGitStatusPath(rawPath)];
}

function cleanGitStatusPath(fileRef: string) {
	return fileRef.trim().replace(/^"|"$/g, "");
}

function isAllowedLocalProofRef(fileRef: string, workflowRunId: string) {
	return (
		fileRef.startsWith(`.sbs/runs/${workflowRunId}/`) ||
		fileRef.startsWith(".sbs/docs-spine-adoption/")
	);
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
	await assertApprovedDocsSpineArtifactRef(repoRelativePath, workflowRunId);
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	const artifactPath = path.join(repositoryRoot, repoRelativePath);
	await mkdir(path.dirname(artifactPath), { recursive: true });
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	await writeFile(artifactPath, value);
}

async function ensureSafeDocsSpineArtifactDirectory(
	repositoryRoot: string,
	repoRelativePath: string,
	workflowRunId: string,
) {
	await assertApprovedDocsSpineArtifactRef(
		`${repoRelativePath}/.directory-placeholder`,
		workflowRunId,
	);
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
}

function assertApprovedDocsSpineArtifactRef(
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
		throw new Error("Docs spine artifact ref must be repo-relative.");
	}
	const runArtifactPrefix = `.sbs/runs/${workflowRunId}/`;
	if (
		repoRelativePath.startsWith(runArtifactPrefix) ||
		repoRelativePath.startsWith(".sbs/docs-spine-adoption/")
	) {
		return;
	}
	throw new Error(
		"Docs spine artifact ref is outside the approved write roots.",
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
				"Docs spine artifact path crosses a symbolic link and is not safe to write.",
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
}): Promise<DocsSpineAdoptionWorkflowResult> {
	await ensureSafeDocsSpineArtifactDirectory(
		repositoryRoot,
		localRunDirectoryRef,
		workflowRunId,
	);
	await mkdir(localRunDirectory, { recursive: true });
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const createdArtifacts = [proofRef, syncPreviewRef];
	await writeJsonArtifact(repositoryRoot, workflowRunId, proofRef, {
		schemaVersion: "docs-spine-adoption-proof.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		workflowVersion: DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
		workflowRunId,
		branchName,
		profileName,
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
			"No source files were patched. Resolve the block and approve a fresh docs-spine adoption workflow if needed.",
		nextRecommendedWorkflow: DOCS_SPINE_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
		createdAt: Date.now(),
	});
	await writeJsonArtifact(repositoryRoot, workflowRunId, syncPreviewRef, {
		schemaVersion: "docs-spine-adoption-sync-preview.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		workflowVersion: DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
		branchName,
		profileName,
		touchedFileRefs: [],
		createdArtifactRefs: createdArtifacts,
		proofCommandResults: [],
		blockedReason,
		nextRecommendedWorkflowId: DOCS_SPINE_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID,
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
				workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
				writeLeaseId,
				blockedStage,
				blockedReason,
			},
		}),
	});
	return {
		workflowRunId,
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		status: "blocked",
		branchName,
		profileName,
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
	if (!/^sbs\/docs-spine-adoption-\d{8}-\d{4}$/.test(branchName)) {
		throw new Error(
			"Approved branch name is not a docs spine adoption branch.",
		);
	}
}

function assertApprovedProfile(profileName: string) {
	if (profileName !== DOCS_SPINE_ADOPTION_PROFILE_NAME) {
		throw new Error(
			"Docs spine adoption requires the sbs-workspace-write profile.",
		);
	}
}

function assertApprovedDocsSpineAdoptionPacket(
	approvedWorkflowRun: ApprovedWorkflowRunPacket,
) {
	if (
		approvedWorkflowRun.workflowVersion !== DOCS_SPINE_ADOPTION_WORKFLOW_VERSION
	) {
		throw new Error("Docs spine adoption workflow version is not approved.");
	}
	if (approvedWorkflowRun.writeLeaseDurationMinutes !== 30) {
		throw new Error(
			"Docs spine adoption write lease duration is not approved.",
		);
	}
	if (approvedWorkflowRun.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error("Docs spine adoption requires a clean-worktree policy.");
	}
	assertExactTextList(
		approvedWorkflowRun.expectedOutputs,
		DOCS_SPINE_ADOPTION_EXPECTED_OUTPUTS,
		"expected outputs",
	);
	assertExactTextList(
		approvedWorkflowRun.allowedTouchTargets,
		DOCS_SPINE_ADOPTION_ALLOWED_TOUCH_TARGETS,
		"allowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.disallowedTouchTargets,
		DOCS_SPINE_ADOPTION_DISALLOWED_TOUCH_TARGETS,
		"disallowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.proofCommands,
		DOCS_SPINE_ADOPTION_PROOF_COMMANDS,
		"proof commands",
	);
	if (
		approvedWorkflowRun.syncPolicySummary !==
		DOCS_SPINE_ADOPTION_SYNC_POLICY_SUMMARY
	) {
		throw new Error("Docs spine adoption sync policy is not approved.");
	}
	assertExactTextList(
		approvedWorkflowRun.stopConditions,
		DOCS_SPINE_ADOPTION_STOP_CONDITIONS,
		"stop conditions",
	);
	if (
		approvedWorkflowRun.rollbackNotes !== DOCS_SPINE_ADOPTION_ROLLBACK_NOTES
	) {
		throw new Error("Docs spine adoption rollback notes are not approved.");
	}
	const expectedWorkflowPacketRef = `.sbs/runs/${approvedWorkflowRun.workflowRunId}/workflow-packet.json`;
	if (
		approvedWorkflowRun.localWorkflowPacketRef !== expectedWorkflowPacketRef
	) {
		throw new Error("Docs spine adoption workflow packet ref is not approved.");
	}
	const expectedProofRef = `.sbs/runs/${approvedWorkflowRun.workflowRunId}/proof.json`;
	if (approvedWorkflowRun.localProofRef !== expectedProofRef) {
		throw new Error("Docs spine adoption proof ref is not approved.");
	}
}

function assertExactTextList(
	actual: string[],
	expected: readonly string[],
	fieldName: string,
) {
	if (
		actual.length !== expected.length ||
		actual.some((value, index) => value !== expected[index])
	) {
		throw new Error(`Docs spine adoption ${fieldName} are not approved.`);
	}
}
