import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runBoundedProcess } from "./bounded-process";
import type { RunnerCredential } from "./local-runner-home";
import type { LocalProjectState } from "./local-project-state";
import { createRunnerEvent, type RunnerEvent } from "./runner-events";
import type { ApprovedWorkflowRunPacket } from "./workflow-run-api";
import {
	DOCS_SPINE_APPLY_ALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_APPLY_DISALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_APPLY_EXPECTED_OUTPUTS,
	DOCS_SPINE_APPLY_NEXT_RECOMMENDED_WORKFLOW_ID,
	DOCS_SPINE_APPLY_PROFILE_NAME,
	DOCS_SPINE_APPLY_PROOF_COMMANDS,
	DOCS_SPINE_APPLY_ROLLBACK_NOTES,
	DOCS_SPINE_APPLY_STOP_CONDITIONS,
	DOCS_SPINE_APPLY_SYNC_POLICY_SUMMARY,
	DOCS_SPINE_APPLY_WORKFLOW_ID,
	DOCS_SPINE_APPLY_WORKFLOW_VERSION,
} from "../workflows/docs-spine-apply-and-proof/manifest";
import type {
	DocsSpineApplyProofCommandResult,
	DocsSpineApplyReadyFile,
	DocsSpineApplySummary,
} from "../workflows/docs-spine-apply-and-proof/schemas";
import {
	buildDocsSpineApplyQualityReport,
	type DocsSpineMarkdownFile,
	type DocsSpineQualityReport,
	summarizeFailedQualityRules,
} from "../workflows/docs-spine-adoption/quality-eval";
import { DOCS_SPINE_ADOPTION_WORKFLOW_ID } from "../workflows/docs-spine-adoption/manifest";
import { buildDocsSpineScannerBundle } from "../workflows/docs-spine-adoption/scanner";
import type { DocsSpineRepoFacts } from "../workflows/docs-spine-adoption/schemas";

export type DocsSpineApplyWorkflowResult = {
	workflowRunId: string;
	workflowId: typeof DOCS_SPINE_APPLY_WORKFLOW_ID;
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

type RunDocsSpineApplyWorkflowOptions = {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	approvedWorkflowRun: ApprovedWorkflowRunPacket;
	confirmDocsSpineApply: boolean;
	now?: number;
	fetchRunnerEvent?: typeof fetch;
};

type DocsSpineApplyBlockedProof = {
	stage: string;
	reason: string;
	commandName?: string;
	nextApprovalRequired: boolean;
};

export async function runDocsSpineApplyWorkflow({
	repositoryRoot,
	state,
	credential,
	approvedWorkflowRun,
	confirmDocsSpineApply,
	now = Date.now(),
	fetchRunnerEvent,
}: RunDocsSpineApplyWorkflowOptions): Promise<DocsSpineApplyWorkflowResult> {
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

	if (!confirmDocsSpineApply) {
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
				"docs-spine-apply-and-proof requires --confirm-docs-spine-apply because it may write approved docs-spine Markdown files.",
			fetchRunnerEvent,
		});
	}

	if (approvedWorkflowRun.workflowId !== DOCS_SPINE_APPLY_WORKFLOW_ID) {
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
			blockedReason: "Approved workflow run is not docs-spine-apply-and-proof.",
			fetchRunnerEvent,
		});
	}

	try {
		assertApprovedDocsSpineApplyPacket(approvedWorkflowRun);
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
				"Approved write lease expired before docs spine apply started.",
			fetchRunnerEvent,
		});
	}

	const branchResult = await checkoutOrCreateApprovedBranch(
		repositoryRoot,
		branchName,
	);
	if (!branchResult.succeeded) {
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
			blockedStage: "branch-guard",
			blockedReason:
				branchResult.blockedReason ??
				"Unable to create or check out the approved docs spine apply branch.",
			fetchRunnerEvent,
		});
	}
	const preApplyDirtyFileRefs = await listGitDirtyFileRefs(repositoryRoot);

	await ensureSafeApplyArtifactDirectory(
		repositoryRoot,
		localRunDirectoryRef,
		workflowRunId,
	);
	await mkdir(localRunDirectory, { recursive: true });

	const startEventResult = await sendRunnerEventDirect({
		credential,
		fetchRunnerEvent,
		event: createRunnerEvent({
			projectId: state.projectId,
			runnerId: state.runnerId,
			workflowRunId,
			payload: {
				eventType: "workflow.started",
				workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
				branchName,
				profileName,
			},
		}),
	});

	const workflowPacketRef = `${localRunDirectoryRef}/workflow-packet.json`;
	const proofRef = `${localRunDirectoryRef}/proof.json`;
	const syncPreviewRef = `${localRunDirectoryRef}/sync-preview.json`;
	const applySummaryRef = ".sbs/docs-spine-adoption/apply/apply-summary.json";
	const qualityReportRef = ".sbs/docs-spine-adoption/apply/quality-report.json";
	const initialCreatedArtifacts = [workflowPacketRef];

	await writeJsonArtifact(repositoryRoot, workflowRunId, workflowPacketRef, {
		schemaVersion: "docs-spine-apply-workflow-packet.v1",
		workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
		workflowVersion: DOCS_SPINE_APPLY_WORKFLOW_VERSION,
		projectId: state.projectId,
		runnerId: state.runnerId,
		profileName,
		writeLeaseId,
		writeLeaseExpiresAt,
		targetBranch: branchName,
		dirtyStatePolicy: "require_clean_worktree",
		allowedTouchTargets: DOCS_SPINE_APPLY_ALLOWED_TOUCH_TARGETS,
		disallowedTouchTargets: DOCS_SPINE_APPLY_DISALLOWED_TOUCH_TARGETS,
		proofCommands: DOCS_SPINE_APPLY_PROOF_COMMANDS,
		syncPolicy: DOCS_SPINE_APPLY_SYNC_POLICY_SUMMARY,
		stopConditions: DOCS_SPINE_APPLY_STOP_CONDITIONS,
		approvalRequired: true,
		expectedOutputs: DOCS_SPINE_APPLY_EXPECTED_OUTPUTS,
		rollbackNotes: DOCS_SPINE_APPLY_ROLLBACK_NOTES,
		sourceDraftRoot: ".sbs/docs-spine-adoption/drafts",
		createdAt: now,
	});

	try {
		const applyReadyFiles = await readApplyReadyFiles(repositoryRoot);
		const repoFacts = await readDocsSpineRepoFacts(repositoryRoot);
		let qualityReport = buildDocsSpineApplyQualityReport({
			files: applyReadyFiles,
			repoFacts,
			now,
		});
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			qualityReportRef,
			qualityReport,
		);
		const validationBlockers = await validateApplyReadyFiles(
			repositoryRoot,
			applyReadyFiles,
		);
		const qualityBlockers = summarizeFailedQualityRules(qualityReport);
		const blockedValidationReasons = [
			...validationBlockers,
			...qualityBlockers,
		];
		if (applyReadyFiles.length === 0 || blockedValidationReasons.length > 0) {
			const blockedReasons =
				applyReadyFiles.length === 0
					? ["No approved apply-ready docs-spine Markdown drafts were found."]
					: blockedValidationReasons;
			await writeApplySummary({
				repositoryRoot,
				workflowRunId,
				applySummaryRef,
				now,
				status: "blocked",
				appliedFileRefs: [],
				blockedReasons,
				sourceArtifactRefs: applyReadyFiles.map(
					(file) => file.sourceArtifactRef,
				),
			});
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
				blockedStage: "draft-validation",
				blockedReason: blockedReasons[0],
				createdArtifacts: [
					...initialCreatedArtifacts,
					qualityReportRef,
					applySummaryRef,
				],
				qualityReportMetadata: summarizeQualityReportMetadata({
					qualityReportRef,
					qualityReport,
				}),
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

		const approvedApplyTargetRefs = applyReadyFiles.map(
			(file) => file.targetRef,
		);
		const preApplyUserDirtyFileRefs = preApplyDirtyFileRefs.filter(
			(fileRef) => !fileRef.startsWith(".sbs/"),
		);
		const unsafePreApplyDirtyFiles = await listUnsafePreApplyDirtyFiles(
			repositoryRoot,
			preApplyDirtyFileRefs,
			approvedApplyTargetRefs,
			workflowRunId,
		);
		if (unsafePreApplyDirtyFiles.length > 0) {
			await writeApplySummary({
				repositoryRoot,
				workflowRunId,
				applySummaryRef,
				now,
				status: "blocked",
				appliedFileRefs: [],
				blockedReasons: [
					"Worktree has dirty docs-spine targets or unsafe runner artifacts before apply starts.",
					...unsafePreApplyDirtyFiles,
				],
				sourceArtifactRefs: applyReadyFiles.map(
					(file) => file.sourceArtifactRef,
				),
			});
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
				blockedStage: "dirty-state",
				blockedReason:
					"Worktree has dirty docs-spine targets or unsafe runner artifacts before apply starts.",
				createdArtifacts: [
					...initialCreatedArtifacts,
					qualityReportRef,
					applySummaryRef,
				],
				qualityReportMetadata: summarizeQualityReportMetadata({
					qualityReportRef,
					qualityReport,
				}),
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

		const plannedApplyFiles = await buildPlannedApplyMarkdownFiles(
			repositoryRoot,
			applyReadyFiles,
		);
		qualityReport = buildDocsSpineApplyQualityReport({
			files: plannedApplyFiles,
			repoFacts,
			now,
		});
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			qualityReportRef,
			qualityReport,
		);
		const finalQualityBlockers = summarizeFailedQualityRules(qualityReport);
		if (finalQualityBlockers.length > 0) {
			await writeApplySummary({
				repositoryRoot,
				workflowRunId,
				applySummaryRef,
				now,
				status: "blocked",
				appliedFileRefs: [],
				blockedReasons: finalQualityBlockers,
				sourceArtifactRefs: applyReadyFiles.map(
					(file) => file.sourceArtifactRef,
				),
			});
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
				blockedStage: "final-merged-quality",
				blockedReason: finalQualityBlockers[0],
				createdArtifacts: [
					...initialCreatedArtifacts,
					qualityReportRef,
					applySummaryRef,
				],
				qualityReportMetadata: summarizeQualityReportMetadata({
					qualityReportRef,
					qualityReport,
				}),
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

		const appliedFileRefs = plannedApplyFiles.map((file) => file.targetRef);
		const createdArtifacts = [
			...initialCreatedArtifacts,
			qualityReportRef,
			applySummaryRef,
			proofRef,
			syncPreviewRef,
		];

		for (const plannedApplyFile of plannedApplyFiles) {
			await writeMarkdownFile(
				repositoryRoot,
				plannedApplyFile.targetRef,
				plannedApplyFile.markdown,
			);
		}
		const postApplyScannerBundle = await buildDocsSpineScannerBundle({
			repositoryRoot,
			now,
		});
		qualityReport = buildDocsSpineApplyQualityReport({
			files: await readAppliedMarkdownFiles(repositoryRoot, plannedApplyFiles),
			repoFacts: postApplyScannerBundle.repoFacts,
			now,
		});
		await writeJsonArtifact(
			repositoryRoot,
			workflowRunId,
			qualityReportRef,
			qualityReport,
		);
		const postApplyQualityBlockers = summarizeFailedQualityRules(qualityReport);
		if (postApplyQualityBlockers.length > 0) {
			await writeApplySummary({
				repositoryRoot,
				workflowRunId,
				applySummaryRef,
				now,
				status: "blocked",
				appliedFileRefs,
				blockedReasons: postApplyQualityBlockers,
				sourceArtifactRefs: applyReadyFiles.map(
					(file) => file.sourceArtifactRef,
				),
			});
			const blockedReason = postApplyQualityBlockers[0];
			await writeJsonArtifact(repositoryRoot, workflowRunId, proofRef, {
				schemaVersion: "docs-spine-apply-proof.v1",
				workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
				workflowVersion: DOCS_SPINE_APPLY_WORKFLOW_VERSION,
				workflowRunId,
				branchName,
				profileName,
				applySummaryRef,
				qualityReportRef,
				qualityReportStatus: qualityReport.status,
				qualityScore: qualityReport.score,
				touchedFiles: appliedFileRefs,
				appliedFileRefs,
				createdArtifacts,
				proofCommandsRun: [],
				proofCommandResults: [],
				blockedProof: [
					{
						stage: "post-apply-quality",
						reason: blockedReason,
						nextApprovalRequired: true,
					},
				],
				rollbackInstructions: DOCS_SPINE_APPLY_ROLLBACK_NOTES,
				nextRecommendedWorkflow: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
				createdAt: now,
			});
			await writeJsonArtifact(repositoryRoot, workflowRunId, syncPreviewRef, {
				schemaVersion: "docs-spine-apply-sync-preview.v1",
				workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
				workflowVersion: DOCS_SPINE_APPLY_WORKFLOW_VERSION,
				branchName,
				profileName,
				touchedFileRefs: appliedFileRefs,
				createdArtifactRefs: createdArtifacts,
				proofCommandResults: [],
				qualityReportRef,
				qualityReportStatus: qualityReport.status,
				qualityScore: qualityReport.score,
				blockedReason,
				nextRecommendedWorkflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
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
						workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
						writeLeaseId,
						blockedStage: "post-apply-quality",
						blockedReason,
					},
				}),
			});
			return {
				workflowRunId,
				workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
				status: "blocked",
				branchName,
				profileName,
				proofStatus: "blocked",
				localRunDirectoryRef,
				touchedFiles: appliedFileRefs,
				createdArtifacts,
				blockedReason,
				deliveredEvents:
					startEventResult.delivered + blockedEventResult.delivered,
				remainingEvents:
					startEventResult.remaining + blockedEventResult.remaining,
			};
		}

		await writeApplySummary({
			repositoryRoot,
			workflowRunId,
			applySummaryRef,
			now,
			status: "applied",
			appliedFileRefs: plannedApplyFiles.map((file) => file.targetRef),
			blockedReasons: [],
			sourceArtifactRefs: applyReadyFiles.map((file) => file.sourceArtifactRef),
		});

		const { proofCommandResults, unexpectedTouchedFiles, blockedProof } =
			await runProofCommands(
				repositoryRoot,
				appliedFileRefs,
				workflowRunId,
				postApplyScannerBundle.repoFacts,
				preApplyDirtyFileRefs,
			);
		const touchedFileRefs = [
			...appliedFileRefs,
			...unexpectedTouchedFiles.filter(
				(fileRef) => !appliedFileRefs.includes(fileRef),
			),
		];
		const docsSpineProofPassed = proofCommandResults
			.filter((result) => result.status !== "blocked")
			.every((result) => result.status === "passed");
		const proofStatus = docsSpineProofPassed ? "passed" : "failed";
		const proofSummary = buildProofSummary({
			proofStatus,
			blockedProof,
		});

		await writeJsonArtifact(repositoryRoot, workflowRunId, proofRef, {
			schemaVersion: "docs-spine-apply-proof.v1",
			workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
			workflowVersion: DOCS_SPINE_APPLY_WORKFLOW_VERSION,
			workflowRunId,
			branchName,
			profileName,
			applySummaryRef,
			qualityReportRef,
			qualityReportStatus: qualityReport.status,
			qualityScore: qualityReport.score,
			preexistingDirtyFileRefs: preApplyUserDirtyFileRefs,
			touchedFiles: touchedFileRefs,
			appliedFileRefs,
			createdArtifacts,
			proofCommandsRun: proofCommandResults.map((result) => result.commandName),
			proofCommandResults,
			blockedProof,
			rollbackInstructions: DOCS_SPINE_APPLY_ROLLBACK_NOTES,
			nextRecommendedWorkflow: DOCS_SPINE_APPLY_NEXT_RECOMMENDED_WORKFLOW_ID,
			createdAt: now,
		});
		await writeJsonArtifact(repositoryRoot, workflowRunId, syncPreviewRef, {
			schemaVersion: "docs-spine-apply-sync-preview.v1",
			workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
			workflowVersion: DOCS_SPINE_APPLY_WORKFLOW_VERSION,
			branchName,
			profileName,
			touchedFileRefs,
			createdArtifactRefs: createdArtifacts,
			proofCommandResults: proofCommandResults.map(
				({ commandName, status }) => ({
					commandName,
					status,
				}),
			),
			appliedFileRefs,
			qualityReportRef,
			qualityReportStatus: qualityReport.status,
			qualityScore: qualityReport.score,
			preexistingDirtyFileCount: preApplyUserDirtyFileRefs.length,
			blockedProofCount: blockedProof.length,
			proofSummary,
			nextRecommendedWorkflowId: DOCS_SPINE_APPLY_NEXT_RECOMMENDED_WORKFLOW_ID,
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
					workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
					writeLeaseId,
					proofStatus,
					proofSummary,
					touchedFileRefs,
					createdArtifactRefs: createdArtifacts,
					proofCommandResults: proofCommandResults.map(
						({ commandName, status }) => ({
							commandName,
							status,
						}),
					),
					nextRecommendedWorkflowId:
						DOCS_SPINE_APPLY_NEXT_RECOMMENDED_WORKFLOW_ID,
				},
			}),
		});

		return {
			workflowRunId,
			workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
			status: "proof_completed",
			branchName,
			profileName,
			proofStatus,
			localRunDirectoryRef,
			touchedFiles: touchedFileRefs,
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
				"Docs spine apply artifact generation failed before proof artifacts could be completed.",
			createdArtifacts: initialCreatedArtifacts,
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

async function readApplyReadyFiles(
	repositoryRoot: string,
): Promise<DocsSpineApplyReadyFile[]> {
	const draftRootRef = ".sbs/docs-spine-adoption/drafts";
	const draftRootPath = path.join(repositoryRoot, draftRootRef);
	const draftEntries = await readdir(draftRootPath).catch((error) => {
		if ((error as { code?: string }).code === "ENOENT") {
			return [];
		}
		throw error;
	});
	const applyReadyFiles: DocsSpineApplyReadyFile[] = [];
	for (const draftEntry of draftEntries.sort()) {
		if (!draftEntry.endsWith(".json")) {
			continue;
		}
		const sourceArtifactRef = `${draftRootRef}/${draftEntry}`;
		const rawDraft = await readFile(
			path.join(repositoryRoot, sourceArtifactRef),
			"utf8",
		);
		const parsedDraft = JSON.parse(rawDraft) as unknown;
		applyReadyFiles.push(
			...extractApplyReadyFiles(parsedDraft, sourceArtifactRef),
		);
	}
	return applyReadyFiles;
}

export function extractApplyReadyFiles(
	draft: unknown,
	sourceArtifactRef: string,
): DocsSpineApplyReadyFile[] {
	if (!draft || typeof draft !== "object" || Array.isArray(draft)) {
		return [];
	}
	const proposedFiles = (draft as Record<string, unknown>).proposedFiles;
	const draftStatus =
		typeof (draft as Record<string, unknown>).status === "string"
			? String((draft as Record<string, unknown>).status)
			: null;
	const draftBlockedReasons = Array.isArray(
		(draft as Record<string, unknown>).blockedReasons,
	)
		? ((draft as Record<string, unknown>).blockedReasons as unknown[]).filter(
				(reason): reason is string => typeof reason === "string",
			)
		: [];
	if (!Array.isArray(proposedFiles)) {
		return [];
	}
	return proposedFiles
		.map((proposedFile) => {
			if (
				!proposedFile ||
				typeof proposedFile !== "object" ||
				Array.isArray(proposedFile)
			) {
				return null;
			}
			const record = proposedFile as Record<string, unknown>;
			if (
				typeof record.targetRef !== "string" ||
				typeof record.markdown !== "string"
			) {
				return null;
			}
			return {
				targetRef: record.targetRef,
				markdown: record.markdown,
				sourceArtifactRef,
				draftStatus,
				draftBlockedReasons,
			};
		})
		.filter((file): file is DocsSpineApplyReadyFile => file !== null);
}

async function validateApplyReadyFiles(
	repositoryRoot: string,
	applyReadyFiles: DocsSpineApplyReadyFile[],
) {
	const blockedReasons: string[] = [];
	const targetRefs = new Set<string>();
	for (const applyReadyFile of applyReadyFiles) {
		if (
			applyReadyFile.draftStatus?.startsWith("blocked") ||
			applyReadyFile.draftBlockedReasons.length > 0
		) {
			blockedReasons.push(
				`${applyReadyFile.sourceArtifactRef}: blocked draft cannot be applied`,
			);
			continue;
		}
		const pathError = getApprovedApplyTargetError(applyReadyFile.targetRef);
		if (pathError) {
			blockedReasons.push(`${applyReadyFile.targetRef}: ${pathError}`);
			continue;
		}
		if (targetRefs.has(applyReadyFile.targetRef)) {
			blockedReasons.push(
				`${applyReadyFile.targetRef}: duplicate apply target`,
			);
			continue;
		}
		targetRefs.add(applyReadyFile.targetRef);
		if (
			applyReadyFile.markdown.trim() === "" ||
			applyReadyFile.markdown.includes("\0") ||
			applyReadyFile.markdown.length > 100_000
		) {
			blockedReasons.push(
				`${applyReadyFile.targetRef}: markdown is empty or exceeds the apply limit`,
			);
		}
		await assertNoSymlinkInExistingPath(
			repositoryRoot,
			applyReadyFile.targetRef,
		);
	}
	return blockedReasons;
}

async function readDocsSpineRepoFacts(
	repositoryRoot: string,
): Promise<DocsSpineRepoFacts | undefined> {
	const repoFactsPath = path.join(
		repositoryRoot,
		".sbs",
		"docs-spine-adoption",
		"facts",
		"repo-facts.json",
	);
	const rawFacts = await readFile(repoFactsPath, "utf8").catch((error) => {
		if ((error as { code?: string }).code === "ENOENT") {
			return null;
		}
		throw error;
	});
	if (!rawFacts) {
		return undefined;
	}
	return JSON.parse(rawFacts) as DocsSpineRepoFacts;
}

async function buildPlannedApplyMarkdownFiles(
	repositoryRoot: string,
	applyReadyFiles: DocsSpineApplyReadyFile[],
): Promise<DocsSpineMarkdownFile[]> {
	const plannedFiles: DocsSpineMarkdownFile[] = [];
	for (const applyReadyFile of applyReadyFiles) {
		const existingMarkdown = await readExistingMarkdownFile(
			repositoryRoot,
			applyReadyFile.targetRef,
		);
		const markdown =
			existingMarkdown === null ||
			isReplaceablePriorDocsSpineOutput(
				applyReadyFile.targetRef,
				existingMarkdown,
			)
				? normalizeMarkdownForWrite(applyReadyFile.markdown)
				: mergeManagedMarkdownSection(
						existingMarkdown,
						applyReadyFile.targetRef,
						applyReadyFile.markdown,
					);
		plannedFiles.push({
			targetRef: applyReadyFile.targetRef,
			markdown,
			sourceArtifactRef: applyReadyFile.sourceArtifactRef,
		});
	}
	return plannedFiles;
}

async function readAppliedMarkdownFiles(
	repositoryRoot: string,
	plannedApplyFiles: DocsSpineMarkdownFile[],
): Promise<DocsSpineMarkdownFile[]> {
	const appliedFiles: DocsSpineMarkdownFile[] = [];
	for (const plannedApplyFile of plannedApplyFiles) {
		appliedFiles.push({
			targetRef: plannedApplyFile.targetRef,
			markdown: await readFile(
				path.join(repositoryRoot, plannedApplyFile.targetRef),
				"utf8",
			),
			sourceArtifactRef: plannedApplyFile.sourceArtifactRef,
		});
	}
	return appliedFiles;
}

function isReplaceablePriorDocsSpineOutput(
	targetRef: string,
	existingMarkdown: string,
) {
	const replaceableTargetRefs = new Set([
		"docs/index.md",
		"docs/exec-plans/PLANS.md",
		"docs/exec-plans/active/docs-spine-adoption-first-slice.md",
		"docs/exec-plans/index.md",
		"docs/exec-plans/AGENTS.md",
		"docs/exec-plans/active/index.md",
		"docs/exec-plans/completed/index.md",
		"docs/programs/README.md",
		"docs/programs/AGENTS.md",
		"docs/programs/PROGRAMS.md",
		"docs/programs/active/docs-spine-adoption/program.md",
		"docs/programs/active/index.md",
		"docs/programs/completed/index.md",
		"docs/prompts/README.md",
		"docs/prompts/AGENTS.md",
		"docs/prompts/program-create.md",
		"docs/QUALITY_SCORE.md",
		"docs/validation.md",
		"docs/proof.md",
	]);
	const isDatedDocsSpineAdoptionTarget =
		/^docs\/exec-plans\/active\/\d{4}-\d{2}-\d{2}-docs-spine-adoption-first-slice\.md$/.test(
			targetRef,
		) ||
		/^docs\/programs\/active\/\d{4}-\d{2}-\d{2}-docs-spine-adoption\/(?:program|planning-brief-1|track-1-docs-spine-surfaces|normalized-track-1|research-pass-docs-spine-surfaces|normalized-pass-docs-spine-adoption|converged-decision-packet|dependency-graph|plan-split-recommendation|cross-repo-review)\.md$/.test(
			targetRef,
		) ||
		/^docs\/programs\/active\/\d{4}-\d{2}-\d{2}-docs-spine-adoption\/current-planning-brief\.txt$/.test(
			targetRef,
		);
	const isGeneratedPromptTarget =
		/^docs\/prompts\/(?:program-(?:orchestrator|initialize|funnel|research-passes|normalize-pass|converged-decision-packet|dependency-graph|plan-split-recommendation|cross-repo-review|planning-brief|doc-synthesis|loop|docs-sync|planning-refresh|completion-review)|exec-plan-(?:writer|grill|execute|validate))\.md$/.test(
			targetRef,
		);
	if (
		!replaceableTargetRefs.has(targetRef) &&
		!isDatedDocsSpineAdoptionTarget &&
		!isGeneratedPromptTarget
	) {
		return false;
	}
	return (
		/^# Docs\s*$/m.test(existingMarkdown) ||
		/^# Docs Spine Adoption\s*$/m.test(existingMarkdown) ||
		/^# Quality Score\s*$/m.test(existingMarkdown) ||
		/\.agents\/daily-audit|\.ai\/business OS|\.claude\/skills|Quality score evidence is blocked until|## Source Truth|## Operating Spine/.test(
			existingMarkdown,
		) ||
		/Repo convention refs detected by the docs-spine scanner|Detected prompt refs: `none`|Use the repo-native commands below when proving docs-spine adoption work|Record local proof for docs-spine adoption here/.test(
			existingMarkdown,
		) ||
		/This Program is a living initiative document for adopting the docs spine|Install the first docs-spine slice for this repository|This is a living execution plan for the first human-reviewed follow-up|Planning Brief 1: Docs Spine Adoption/.test(
			existingMarkdown,
		) ||
		/Program Funnel|Subtree guidance for Program docs|Subtree guidance for active and completed ExecPlans|Subtree guidance for reusable Program and ExecPlan prompt contracts|Active ExecPlans|Completed ExecPlans|canonical ExecPlan surface|Program Orchestrator|Program Initialize|Program Research Passes|Program Planning Refresh|ExecPlan Writer|ExecPlan Execute|Quality gate before returning/.test(
			existingMarkdown,
		) ||
		/# Research Pass: Docs Spine Surfaces|# Normalized Pass: Docs Spine Adoption|# Converged Decision Packet|# Dependency Graph|# Plan Split Recommendation|# Cross-Repo Review/.test(
			existingMarkdown,
		) ||
		/`docs\/` is the first-hop documentation spine|Prompt assets live here when a repeatable workflow needs a stable instruction packet|<!-- sbs-docs-spine:start docs-prompts-README\.md -->/.test(
			existingMarkdown,
		) ||
		/summary: Index of active Program packets in this repository|summary: Index of completed Program packets in this repository|summary: Agent prompt for creating or updating durable Program packets/.test(
			existingMarkdown,
		) ||
		/^planning-brief-1\.md\s*$/.test(existingMarkdown) ||
		/Existing docs refs:[\s\S]*(?:apps|packages)\/[^`\s]+\/(?:src|test|tests|__tests__|assets|public|static)\//.test(
			existingMarkdown,
		)
	);
}

async function readExistingMarkdownFile(
	repositoryRoot: string,
	repoRelativePath: string,
) {
	return readFile(path.join(repositoryRoot, repoRelativePath), "utf8").catch(
		(error) => {
			if ((error as { code?: string }).code === "ENOENT") {
				return null;
			}
			throw error;
		},
	);
}

async function writeApplySummary({
	repositoryRoot,
	workflowRunId,
	applySummaryRef,
	now,
	status,
	appliedFileRefs,
	blockedReasons,
	sourceArtifactRefs,
}: {
	repositoryRoot: string;
	workflowRunId: string;
	applySummaryRef: string;
	now: number;
	status: "applied" | "blocked";
	appliedFileRefs: string[];
	blockedReasons: string[];
	sourceArtifactRefs: string[];
}) {
	const summary: DocsSpineApplySummary = {
		schemaVersion: "docs-spine-apply-summary.v1",
		workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
		workflowVersion: DOCS_SPINE_APPLY_WORKFLOW_VERSION,
		status,
		appliedFileRefs,
		blockedReasons,
		sourceArtifactRefs,
		createdAt: now,
	};
	await writeJsonArtifact(
		repositoryRoot,
		workflowRunId,
		applySummaryRef,
		summary,
	);
}

async function runProofCommands(
	repositoryRoot: string,
	appliedFileRefs: string[],
	workflowRunId: string,
	repoFacts?: DocsSpineRepoFacts,
	preApplyDirtyFileRefs: string[] = [],
) {
	const commands = [
		["git", ["status", "--short"]],
		["git", ["diff", "--name-only"]],
		["git", ["diff", "--check"]],
	] as const;
	const results: DocsSpineApplyProofCommandResult[] = [];
	const blockedProof: DocsSpineApplyBlockedProof[] = [];
	results.push(await runStructuralDocsCheck(repositoryRoot, appliedFileRefs));
	const nativeGateProof = await runNativeGateProof(repositoryRoot, repoFacts);
	if (nativeGateProof) {
		results.push(nativeGateProof.commandResult);
		if (nativeGateProof.blockedProof) {
			blockedProof.push(nativeGateProof.blockedProof);
		}
	}
	const unexpectedTouchedFiles = await listUnexpectedDirtyFiles(
		repositoryRoot,
		appliedFileRefs,
		workflowRunId,
		preApplyDirtyFileRefs,
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
	return { proofCommandResults: results, unexpectedTouchedFiles, blockedProof };
}

async function runStructuralDocsCheck(
	repositoryRoot: string,
	appliedFileRefs: string[],
): Promise<DocsSpineApplyProofCommandResult> {
	const invalidFileRef = await findFirstInvalidMarkdownFile(
		repositoryRoot,
		appliedFileRefs,
	);
	return {
		commandName: "docs spine structural check",
		status: invalidFileRef ? "failed" : "passed",
		exitCodeSummary: invalidFileRef
			? `failed: ${invalidFileRef} is missing a top-level Markdown heading`
			: "passed",
	};
}

async function findFirstInvalidMarkdownFile(
	repositoryRoot: string,
	appliedFileRefs: string[],
) {
	for (const appliedFileRef of appliedFileRefs) {
		if (!appliedFileRef.endsWith(".md")) {
			continue;
		}
		const markdown = await readFile(
			path.join(repositoryRoot, appliedFileRef),
			"utf8",
		);
		if (!/^#\s+\S+/m.test(markdown)) {
			return appliedFileRef;
		}
	}
	return null;
}

async function listUnexpectedDirtyFiles(
	repositoryRoot: string,
	appliedFileRefs: string[],
	workflowRunId: string,
	preApplyDirtyFileRefs: string[] = [],
) {
	const preApplyDirtySet = new Set(preApplyDirtyFileRefs);
	const dirtyFileRefs = await listGitDirtyFileRefs(repositoryRoot);
	const unexpectedDirtyFileRefs: string[] = [];
	for (const dirtyFileRef of dirtyFileRefs) {
		if (preApplyDirtySet.has(dirtyFileRef)) {
			continue;
		}
		const allowed = await isAllowedApplyDirtyRef(
			repositoryRoot,
			dirtyFileRef,
			appliedFileRefs,
			workflowRunId,
		);
		if (!allowed) {
			unexpectedDirtyFileRefs.push(dirtyFileRef);
		}
	}
	return unexpectedDirtyFileRefs.sort();
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
	const dirtyFileRefs: string[] = [];
	const statusFileRefs = result.stdout
		.split(/\r?\n/)
		.flatMap(parseGitStatusPathsForProof)
		.filter((fileRef): fileRef is string => Boolean(fileRef));
	for (const statusFileRef of statusFileRefs) {
		dirtyFileRefs.push(
			...(await expandGitStatusPathForProof(repositoryRoot, statusFileRef)),
		);
	}
	return Array.from(new Set(dirtyFileRefs)).sort();
}

async function listUnsafePreApplyDirtyFiles(
	repositoryRoot: string,
	dirtyFileRefs: string[],
	appliedFileRefs: string[],
	workflowRunId: string,
) {
	const unsafeDirtyFileRefs: string[] = [];
	for (const dirtyFileRef of dirtyFileRefs) {
		if (dirtyFileRef === "<unable to inspect git status>") {
			unsafeDirtyFileRefs.push(dirtyFileRef);
			continue;
		}
		const dirtyApplyTargetRef = getMatchingApplyTargetRef(
			dirtyFileRef,
			appliedFileRefs,
		);
		if (dirtyApplyTargetRef) {
			const existingMarkdown = await readExistingMarkdownFile(
				repositoryRoot,
				dirtyApplyTargetRef,
			);
			if (
				existingMarkdown !== null &&
				isReplaceablePriorDocsSpineOutput(dirtyApplyTargetRef, existingMarkdown)
			) {
				continue;
			}
			unsafeDirtyFileRefs.push(dirtyFileRef);
			continue;
		}
		const allowed = await isAllowedApplyDirtyRef(
			repositoryRoot,
			dirtyFileRef,
			appliedFileRefs,
			workflowRunId,
		);
		if (allowed) {
			continue;
		}
		if (dirtyFileRef.startsWith(".sbs/")) {
			unsafeDirtyFileRefs.push(dirtyFileRef);
		}
	}
	return unsafeDirtyFileRefs.sort();
}

function getMatchingApplyTargetRef(fileRef: string, appliedFileRefs: string[]) {
	return appliedFileRefs.find(
		(appliedFileRef) =>
			fileRef === appliedFileRef ||
			fileRef.startsWith(`${appliedFileRef}/`) ||
			appliedFileRef.startsWith(`${fileRef}/`),
	);
}

function parseGitStatusPathsForProof(statusLine: string) {
	if (statusLine.trim() === "") {
		return [];
	}
	const rawPath = statusLine.slice(3).trim();
	if (rawPath.includes(" -> ")) {
		return rawPath
			.split(" -> ")
			.map((fileRef) => cleanGitStatusPath(fileRef))
			.filter((fileRef) => fileRef.length > 0);
	}
	return [cleanGitStatusPath(rawPath)];
}

function cleanGitStatusPath(fileRef: string) {
	return fileRef.trim().replace(/^"|"$/g, "");
}

async function expandGitStatusPathForProof(
	repositoryRoot: string,
	fileRef: string,
): Promise<string[]> {
	if (!fileRef.endsWith("/")) {
		return [fileRef];
	}
	const directoryPath = path.join(repositoryRoot, fileRef);
	const stats = await lstat(directoryPath).catch(() => null);
	if (!stats?.isDirectory()) {
		return [fileRef];
	}
	return await listDirectoryFileRefs(repositoryRoot, fileRef);
}

async function listDirectoryFileRefs(
	repositoryRoot: string,
	directoryRef: string,
): Promise<string[]> {
	const directoryPath = path.join(repositoryRoot, directoryRef);
	const entries = await readdir(directoryPath, { withFileTypes: true });
	const fileRefs: string[] = [];
	for (const entry of entries) {
		const entryRef = `${directoryRef}${entry.name}`;
		if (entry.isDirectory()) {
			fileRefs.push(
				...(await listDirectoryFileRefs(repositoryRoot, `${entryRef}/`)),
			);
			continue;
		}
		fileRefs.push(entryRef);
	}
	return fileRefs;
}

async function isAllowedApplyDirtyRef(
	repositoryRoot: string,
	fileRef: string,
	appliedFileRefs: string[],
	workflowRunId: string,
) {
	return (
		fileRef.startsWith(`.sbs/runs/${workflowRunId}/`) ||
		fileRef.startsWith(".sbs/docs-spine-adoption/") ||
		appliedFileRefs.includes(fileRef) ||
		(await isPriorDocsSpineAdoptionRunRef(repositoryRoot, fileRef))
	);
}

async function isPriorDocsSpineAdoptionRunRef(
	repositoryRoot: string,
	fileRef: string,
) {
	const match = /^\.sbs\/runs\/([^/]+)\//.exec(fileRef);
	if (!match) {
		return false;
	}
	const workflowPacketPath = path.join(
		repositoryRoot,
		".sbs",
		"runs",
		match[1],
		"workflow-packet.json",
	);
	const rawWorkflowPacket = await readFile(workflowPacketPath, "utf8").catch(
		() => null,
	);
	if (!rawWorkflowPacket) {
		return false;
	}
	try {
		const workflowPacket = JSON.parse(rawWorkflowPacket) as {
			workflowId?: unknown;
		};
		return workflowPacket.workflowId === DOCS_SPINE_ADOPTION_WORKFLOW_ID;
	} catch {
		return false;
	}
}

function summarizeQualityReportMetadata({
	qualityReportRef,
	qualityReport,
}: {
	qualityReportRef: string;
	qualityReport: DocsSpineQualityReport;
}) {
	return {
		qualityReportRef,
		qualityReportStatus: qualityReport.status,
		qualityScore: qualityReport.score,
		qualityFailedRuleIds: qualityReport.ruleResults
			.filter((rule) => rule.status === "failed")
			.map((rule) => rule.ruleId),
	};
}

function buildProofSummary({
	proofStatus,
	blockedProof,
}: {
	proofStatus: "passed" | "failed";
	blockedProof: DocsSpineApplyBlockedProof[];
}) {
	if (proofStatus === "failed") {
		return "Docs spine apply completed local writes, but one or more docs-spine proof commands failed.";
	}
	if (blockedProof.length > 0) {
		return "Docs spine apply wrote only approved docs and .sbs artifacts. Native gate proof is blocked; see the local proof artifact for blocker details.";
	}
	return "Docs spine apply wrote only approved docs and .sbs artifacts.";
}

async function runNativeGateProof(
	repositoryRoot: string,
	repoFacts?: DocsSpineRepoFacts,
): Promise<{
	commandResult: DocsSpineApplyProofCommandResult;
	blockedProof?: DocsSpineApplyBlockedProof;
} | null> {
	const nativeGateScriptName = selectNativeGateScriptName(
		repoFacts?.repositoryShape.packageScripts ?? [],
	);
	if (!nativeGateScriptName) {
		return null;
	}
	const command = buildNativeGateCommand(
		repoFacts?.repositoryShape.packageManager,
		nativeGateScriptName,
	);
	const result = await runBoundedProcess({
		command: command.command,
		args: command.args,
		cwd: repositoryRoot,
		timeoutMs: 120_000,
	});
	const commandName = command.commandName;
	if (result.succeeded) {
		return {
			commandResult: {
				commandName,
				status: "passed",
				exitCodeSummary: "passed",
			},
		};
	}
	const outputSummary = summarizeCommandOutput(result);
	const blockedBySetup = isNativeGateSetupBlocker(outputSummary);
	const status = blockedBySetup ? "blocked" : "failed";
	const exitCodeSummary = result.timedOut
		? "timed out"
		: `${status}: ${outputSummary}`;
	return {
		commandResult: {
			commandName,
			status,
			exitCodeSummary,
		},
		blockedProof: blockedBySetup
			? {
					stage: "native-gate",
					commandName,
					reason: exitCodeSummary,
					nextApprovalRequired: false,
				}
			: undefined,
	};
}

function selectNativeGateScriptName(scriptNames: string[]) {
	const preferredScriptNames = [
		"gate",
		"check",
		"ci",
		"proof",
		"test",
		"lint",
		"typecheck",
		"build",
	];
	return preferredScriptNames.find((scriptName) =>
		scriptNames.includes(scriptName),
	);
}

function buildNativeGateCommand(
	packageManager: string | undefined,
	scriptName: string,
) {
	if (packageManager === "bun") {
		return {
			command: "bun",
			args: ["run", scriptName],
			commandName: `bun run ${scriptName}`,
		};
	}
	if (packageManager === "pnpm") {
		return {
			command: "pnpm",
			args: ["run", scriptName],
			commandName: `pnpm run ${scriptName}`,
		};
	}
	if (packageManager === "yarn") {
		return {
			command: "yarn",
			args: [scriptName],
			commandName: `yarn ${scriptName}`,
		};
	}
	return {
		command: "npm",
		args: ["run", scriptName],
		commandName: `npm run ${scriptName}`,
	};
}

function summarizeCommandOutput(result: {
	stdout: string;
	stderr: string;
	timedOut: boolean;
	exitCode?: number;
	failureCode?: string;
}) {
	if (result.timedOut) {
		return "command timed out";
	}
	const outputLines = [result.stderr, result.stdout]
		.join("\n")
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	const explicitSetupBlockerLines = outputLines.filter((line) =>
		/(error: cannot find package|cannot find (module|package)|could not resolve|module not found|missing dependency|enoent|spawnsync? .*enoent|failed to run biome|happy-dom)/i.test(
			line,
		),
	);
	const setupBlockerLines = outputLines.filter(
		(line) =>
			/(command not found|not found:)/i.test(line) &&
			!explicitSetupBlockerLines.includes(line) &&
			line.length < 300,
	);
	const genericFailureLines = outputLines.filter(
		(line) =>
			/(error|failed|failure|timed out)/i.test(line) &&
			!explicitSetupBlockerLines.includes(line) &&
			!setupBlockerLines.includes(line),
	);
	const combinedOutput = [
		...explicitSetupBlockerLines.slice(0, 4),
		...setupBlockerLines.slice(0, 2),
		...genericFailureLines.slice(0, 2),
		...outputLines.slice(0, 2),
	]
		.slice(0, 6)
		.join(" | ");
	const exitCodeSummary =
		typeof result.exitCode === "number"
			? `exit ${result.exitCode}`
			: (result.failureCode ?? "failed");
	if (!combinedOutput) {
		return exitCodeSummary;
	}
	return `${exitCodeSummary}: ${combinedOutput}`.slice(0, 700);
}

function isNativeGateSetupBlocker(outputSummary: string) {
	return /(cannot find (module|package)|could not resolve|module not found|missing dependency|enoent|spawn .* enoent|failed to run biome|command not found|not found:)/i.test(
		outputSummary,
	);
}

async function writeMarkdownFile(
	repositoryRoot: string,
	repoRelativePath: string,
	value: string,
) {
	const targetError = getApprovedApplyTargetError(repoRelativePath);
	if (targetError) {
		throw new Error(targetError);
	}
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	const artifactPath = path.join(repositoryRoot, repoRelativePath);
	await mkdir(path.dirname(artifactPath), { recursive: true });
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	await writeFile(artifactPath, normalizeMarkdownForWrite(value));
}

function mergeManagedMarkdownSection(
	existingMarkdown: string,
	repoRelativePath: string,
	nextMarkdown: string,
) {
	const normalizedNextMarkdown = nextMarkdown.endsWith("\n")
		? nextMarkdown
		: `${nextMarkdown}\n`;
	const sectionMarker = toManagedSectionMarker(repoRelativePath);
	const startMarker = `<!-- sbs-docs-spine:start ${sectionMarker} -->`;
	const endMarker = `<!-- sbs-docs-spine:end ${sectionMarker} -->`;
	const managedSection = [
		startMarker,
		"",
		normalizedNextMarkdown.trimEnd(),
		"",
		endMarker,
		"",
	].join("\n");
	const managedSectionPattern = new RegExp(
		`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\n?`,
	);
	if (managedSectionPattern.test(existingMarkdown)) {
		return existingMarkdown.replace(managedSectionPattern, managedSection);
	}
	const separator = existingMarkdown.endsWith("\n") ? "\n" : "\n\n";
	return `${existingMarkdown}${separator}${managedSection}`;
}

function normalizeMarkdownForWrite(value: string) {
	return value.endsWith("\n") ? value : `${value}\n`;
}

function toManagedSectionMarker(repoRelativePath: string) {
	return repoRelativePath.replaceAll(/[^A-Za-z0-9_.-]/g, "-");
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
	assertApprovedApplyArtifactRef(repoRelativePath, workflowRunId);
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	const artifactPath = path.join(repositoryRoot, repoRelativePath);
	await mkdir(path.dirname(artifactPath), { recursive: true });
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
	await writeFile(artifactPath, value);
}

async function ensureSafeApplyArtifactDirectory(
	repositoryRoot: string,
	repoRelativePath: string,
	workflowRunId: string,
) {
	assertApprovedApplyArtifactRef(
		`${repoRelativePath}/.directory-placeholder`,
		workflowRunId,
	);
	await assertNoSymlinkInExistingPath(repositoryRoot, repoRelativePath);
}

function assertApprovedApplyArtifactRef(
	repoRelativePath: string,
	workflowRunId: string,
) {
	const pathError = getRepoRelativePathError(repoRelativePath);
	if (pathError) {
		throw new Error(pathError);
	}
	const runArtifactPrefix = `.sbs/runs/${workflowRunId}/`;
	if (
		repoRelativePath.startsWith(runArtifactPrefix) ||
		repoRelativePath.startsWith(".sbs/docs-spine-adoption/")
	) {
		return;
	}
	throw new Error("Docs spine apply artifact ref is outside approved roots.");
}

function getApprovedApplyTargetError(repoRelativePath: string) {
	const pathError = getRepoRelativePathError(repoRelativePath);
	if (pathError) {
		return pathError;
	}
	if (!isWithinApprovedApplyRoot(repoRelativePath)) {
		return "target is outside approved docs-spine apply roots";
	}
	if (
		!repoRelativePath.endsWith(".md") &&
		!isApprovedCurrentPlanningBriefPointerRef(repoRelativePath)
	) {
		return "target must be an approved Markdown file or current planning brief pointer";
	}
	return null;
}

function isApprovedCurrentPlanningBriefPointerRef(repoRelativePath: string) {
	return /^docs\/programs\/(?:active|completed)\/\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\/current-planning-brief\.txt$/.test(
		repoRelativePath,
	);
}

function isWithinApprovedApplyRoot(repoRelativePath: string) {
	return (
		repoRelativePath === "docs/index.md" ||
		repoRelativePath === "docs/QUALITY_SCORE.md" ||
		repoRelativePath === "docs/proof.md" ||
		repoRelativePath === "docs/validation.md" ||
		repoRelativePath.startsWith("docs/programs/") ||
		repoRelativePath.startsWith("docs/exec-plans/") ||
		repoRelativePath.startsWith("docs/prompts/")
	);
}

function getRepoRelativePathError(repoRelativePath: string) {
	const segments = repoRelativePath.split("/");
	if (
		path.isAbsolute(repoRelativePath) ||
		repoRelativePath.includes("\\") ||
		segments.some(
			(segment) => segment === "" || segment === "." || segment === "..",
		)
	) {
		return "path must be repo-relative";
	}
	return null;
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
				"Docs spine apply path crosses a symbolic link and is not safe to write.",
			);
		}
	}
}

async function checkoutOrCreateApprovedBranch(
	repositoryRoot: string,
	branchName: string,
) {
	const result = await runGit(repositoryRoot, [
		"rev-parse",
		"--abbrev-ref",
		"HEAD",
	]);
	if (!result.succeeded) {
		return {
			succeeded: false,
			blockedReason: "Unable to read current branch.",
		};
	}
	if (result.stdout.trim() === branchName) {
		return { succeeded: true };
	}
	const existingLocalBranch = await runGit(repositoryRoot, [
		"show-ref",
		"--verify",
		`refs/heads/${branchName}`,
	]);
	const checkout = await runGit(
		repositoryRoot,
		existingLocalBranch.succeeded
			? ["checkout", branchName]
			: ["checkout", "-b", branchName],
	);
	if (!checkout.succeeded) {
		return {
			succeeded: false,
			blockedReason: existingLocalBranch.succeeded
				? "Unable to check out the approved docs spine apply branch."
				: "Unable to create the approved docs spine apply branch.",
		};
	}
	return { succeeded: true };
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
	createdArtifacts = [],
	qualityReportMetadata,
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
	createdArtifacts?: string[];
	qualityReportMetadata?: ReturnType<typeof summarizeQualityReportMetadata>;
	fetchRunnerEvent?: typeof fetch;
}): Promise<DocsSpineApplyWorkflowResult> {
	await ensureSafeApplyArtifactDirectory(
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
		schemaVersion: "docs-spine-apply-proof.v1",
		workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
		workflowVersion: DOCS_SPINE_APPLY_WORKFLOW_VERSION,
		workflowRunId,
		branchName,
		profileName,
		touchedFiles: [],
		appliedFileRefs: [],
		...qualityReportMetadata,
		createdArtifacts: allCreatedArtifacts,
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
			"No docs files were patched. Resolve the block and approve a fresh docs-spine apply workflow if needed.",
		nextRecommendedWorkflow: DOCS_SPINE_APPLY_NEXT_RECOMMENDED_WORKFLOW_ID,
		createdAt: Date.now(),
	});
	await writeJsonArtifact(repositoryRoot, workflowRunId, syncPreviewRef, {
		schemaVersion: "docs-spine-apply-sync-preview.v1",
		workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
		workflowVersion: DOCS_SPINE_APPLY_WORKFLOW_VERSION,
		branchName,
		profileName,
		touchedFileRefs: [],
		createdArtifactRefs: allCreatedArtifacts,
		proofCommandResults: [],
		...qualityReportMetadata,
		blockedReason,
		nextRecommendedWorkflowId: DOCS_SPINE_APPLY_NEXT_RECOMMENDED_WORKFLOW_ID,
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
				workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
				writeLeaseId,
				blockedStage,
				blockedReason,
			},
		}),
	});
	return {
		workflowRunId,
		workflowId: DOCS_SPINE_APPLY_WORKFLOW_ID,
		status: "blocked",
		branchName,
		profileName,
		proofStatus: "blocked",
		localRunDirectoryRef,
		touchedFiles: [],
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
		branchName !== "sbs/docs-spine-apply" &&
		!/^sbs\/docs-spine-apply-\d{8}-\d{4}$/.test(branchName)
	) {
		throw new Error("Approved branch name is not a docs spine apply branch.");
	}
}

function assertApprovedProfile(profileName: string) {
	if (profileName !== DOCS_SPINE_APPLY_PROFILE_NAME) {
		throw new Error(
			"Docs spine apply requires the sbs-workspace-write profile.",
		);
	}
}

function assertApprovedDocsSpineApplyPacket(
	approvedWorkflowRun: ApprovedWorkflowRunPacket,
) {
	if (
		approvedWorkflowRun.workflowVersion !== DOCS_SPINE_APPLY_WORKFLOW_VERSION
	) {
		throw new Error("Docs spine apply workflow version is not approved.");
	}
	if (approvedWorkflowRun.writeLeaseDurationMinutes !== 30) {
		throw new Error("Docs spine apply write lease duration is not approved.");
	}
	if (approvedWorkflowRun.dirtyStatePolicy !== "require_clean_worktree") {
		throw new Error("Docs spine apply requires a clean-worktree policy.");
	}
	assertExactTextList(
		approvedWorkflowRun.expectedOutputs,
		DOCS_SPINE_APPLY_EXPECTED_OUTPUTS,
		"expected outputs",
	);
	assertExactTextList(
		approvedWorkflowRun.allowedTouchTargets,
		DOCS_SPINE_APPLY_ALLOWED_TOUCH_TARGETS,
		"allowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.disallowedTouchTargets,
		DOCS_SPINE_APPLY_DISALLOWED_TOUCH_TARGETS,
		"disallowed touch targets",
	);
	assertExactTextList(
		approvedWorkflowRun.proofCommands,
		DOCS_SPINE_APPLY_PROOF_COMMANDS,
		"proof commands",
	);
	if (
		approvedWorkflowRun.syncPolicySummary !==
		DOCS_SPINE_APPLY_SYNC_POLICY_SUMMARY
	) {
		throw new Error("Docs spine apply sync policy is not approved.");
	}
	assertExactTextList(
		approvedWorkflowRun.stopConditions,
		DOCS_SPINE_APPLY_STOP_CONDITIONS,
		"stop conditions",
	);
	if (approvedWorkflowRun.rollbackNotes !== DOCS_SPINE_APPLY_ROLLBACK_NOTES) {
		throw new Error("Docs spine apply rollback notes are not approved.");
	}
	const expectedWorkflowPacketRef = `.sbs/runs/${approvedWorkflowRun.workflowRunId}/workflow-packet.json`;
	if (
		approvedWorkflowRun.localWorkflowPacketRef !== expectedWorkflowPacketRef
	) {
		throw new Error("Docs spine apply workflow packet ref is not approved.");
	}
	const expectedProofRef = `.sbs/runs/${approvedWorkflowRun.workflowRunId}/proof.json`;
	if (approvedWorkflowRun.localProofRef !== expectedProofRef) {
		throw new Error("Docs spine apply proof ref is not approved.");
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
		throw new Error(`Docs spine apply ${fieldName} are not approved.`);
	}
}
