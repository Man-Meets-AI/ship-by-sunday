import { describe, expect, it } from "vitest";

import type { WorkspaceFindingDocument } from "@/app/(workspace)/_lib/workspace-findings-read-model";
import {
	buildWorkspaceLoopsModel,
	buildWorkspacePrivacyModel,
	buildWorkspaceRunsModel,
	type WorkspaceDoctorPassRunDocument,
	type WorkspacePrivacySetupState,
	type WorkspaceWorkflowRunDocument,
} from "@/app/(workspace)/_lib/workspace-support-read-model";

const now = Date.UTC(2026, 4, 4, 21, 30);

function createFinding(
	overrides: Partial<WorkspaceFindingDocument> = {},
): WorkspaceFindingDocument {
	return {
		_id: "codebaseFindings_1",
		findingId: "finding-source-truth-readiness",
		rank: 1,
		status: "needs_approval",
		title: "Source truth needs the first workflow",
		category: "source_truth",
		severity: "high",
		confidence: 0.91,
		buyerImpact: "Later agent work needs a clearer command and proof map.",
		blastRadius: "low",
		proofPath: "Review the local source-truth readiness report.",
		proofability: "clear",
		permissionRequired: "docs_write",
		recommendedWorkflowId: "source-truth-agent-readiness",
		whyThisNow: "It improves every later local workflow.",
		evidenceRefs: [
			{
				kind: "file",
				repoRelativePath: "AGENTS.md",
				lineStart: 1,
				lineEnd: 40,
				summary: 'export const runtime = "edge";',
			},
		],
		syncSensitivity: "low",
		localReportRef:
			".sbs/reports/doctor-pass/run-1/source-truth-agent-readiness.json",
		...overrides,
	};
}

function createDoctorPassRun(
	overrides: Partial<WorkspaceDoctorPassRunDocument> = {},
): WorkspaceDoctorPassRunDocument {
	return {
		_id: "doctorPassRuns_1",
		localRunId: "run-1",
		status: "findings_uploaded",
		runnerMode: "daemon",
		currentStage: "findings_ready",
		syncPreviewStatus: "uploaded",
		syncPreviewDigest: "sha256:preview",
		syncPreviewFindingsCount: 2,
		excludedArtifactCount: 3,
		localReportRef: ".sbs/reports/doctor-pass/run-1/sync-preview.json",
		startedAt: Date.UTC(2026, 4, 4, 21, 0),
		completedAt: Date.UTC(2026, 4, 4, 21, 5),
		createdAt: Date.UTC(2026, 4, 4, 21, 0),
		updatedAt: Date.UTC(2026, 4, 4, 21, 5),
		...overrides,
	};
}

function createWorkflowRun(
	overrides: Partial<WorkspaceWorkflowRunDocument> = {},
): WorkspaceWorkflowRunDocument {
	return {
		_id: "workflowRuns_1",
		findingDocumentId: "codebaseFindings_1",
		workflowId: "source-truth-agent-readiness",
		workflowVersion: "v1",
		status: "proof_completed",
		proofStatus: "passed",
		deliveryStatus: "local_only",
		branchName: "sbs/source-truth-readiness-20260504-2100",
		profileName: "sbs-workspace-write",
		writeLeaseExpiresAt: Date.UTC(2026, 4, 4, 21, 45),
		localProofRef: ".sbs/runs/workflowRuns_1/proof.json",
		nextRecommendedWorkflowId: "observability-debuggability",
		createdAt: Date.UTC(2026, 4, 4, 21, 10),
		updatedAt: Date.UTC(2026, 4, 4, 21, 20),
		...overrides,
	};
}

function createSetupState(
	overrides: Partial<WorkspacePrivacySetupState> = {},
): WorkspacePrivacySetupState {
	return {
		project: {
			_id: "workspaceProjects_1",
			displayName: "Customer repo",
			defaultOpenDestination: "cursor",
			syncPolicy: {
				rawSource: "disabled",
				rawTerminalLogs: "disabled",
				codexTranscripts: "disabled",
				screenshots: "disabled",
				structuredFindings: "approval_required",
			},
		},
		activeRunner: {
			_id: "workspaceRunnerBindings_1",
			status: "paired",
			pairingStatus: "paired",
			runnerMode: "daemon",
			runnerLabel: "Local daemon",
			machineDisplayName: "Parker MacBook",
			runnerVersion: "0.1.0",
			machineHealthStatus: "ready",
			projectHealthStatus: "warning",
			lastHeartbeatAt: now - 65_000,
		},
		repositoryBinding: {
			_id: "workspaceRepositoryBindings_1",
			displayName: "customer-app",
			provider: "github",
			remoteHost: "github.com",
			remoteOwner: "customer",
			remoteName: "app",
			defaultBranch: "main",
			packageManager: "bun",
		},
		...overrides,
	};
}

describe("workspace support read model", () => {
	it("builds Crawl and Walk run-history rows without queue or PR language", () => {
		const model = buildWorkspaceRunsModel(
			{
				doctorPassRuns: [
					createDoctorPassRun({
						localReportRef: "/Users/customer/repo/.sbs/report.json",
					}),
				],
				workflowRuns: [
					createWorkflowRun({
						localProofRef: "/Users/customer/repo/.sbs/proof.json",
					}),
					createWorkflowRun({
						_id: "workflowRuns_approval_requested",
						status: "approval_requested",
						proofStatus: "not_started",
						createdAt: Date.UTC(2026, 4, 4, 21, 20),
					}),
					createWorkflowRun({
						_id: "workflowRuns_deleted",
						status: "deleted",
						proofStatus: "not_started",
						createdAt: Date.UTC(2026, 4, 4, 21, 25),
					}),
				],
			},
			now,
		);

		expect(model.hasRuns).toBe(true);
		expect(model.totalRuns).toBe(2);
		expect(model.workflowRows).toHaveLength(1);
		expect(model.doctorPassRows[0]).toMatchObject({
			title: "Doctor pass run-1",
			startedLabel: "2026-05-04 21:00 UTC",
			runnerModeLabel: "Daemon",
			statusLabel: "Findings Uploaded",
			syncStatusLabel: "Uploaded",
			findingsCountLabel: "2",
			localReportRef: "Local ref hidden",
		});
		expect(model.workflowRows[0]).toMatchObject({
			workflowLabel: "Source Truth Agent Readiness",
			branchLabel: "sbs/source-truth-readiness-20260504-2100",
			profileLabel: "sbs-workspace-write",
			leaseStatusLabel: "Lease active 15 min",
			proofStatusLabel: "Passed",
			deliveryStatusLabel: "Local Only",
			nextRecommendationLabel: "Observability Debuggability",
			localProofRef: "Local ref hidden",
		});

		const renderedText = JSON.stringify(model).toLowerCase();
		expect(renderedText).not.toContain("/users/customer");
		expect(renderedText).not.toContain("approval requested");
		expect(renderedText).not.toContain("queue");
		expect(renderedText).not.toContain("open pr");
	});

	it("filters the workflow catalog by uploaded findings and links review actions", () => {
		const model = buildWorkspaceLoopsModel({
			findings: [
				createFinding(),
				createFinding({
					_id: "codebaseFindings_2",
					findingId: "finding-observability",
					rank: 2,
					status: "ready",
					title: "Observability proof is thin",
					category: "observability",
					recommendedWorkflowId: "observability-debuggability",
				}),
			],
			workflowRuns: [createWorkflowRun()],
		});

		expect(model.findingBackedCount).toBe(2);
		expect(model.recommendedWorkflow).toMatchObject({
			id: "source-truth-agent-readiness",
			statusLabel: "recommended",
			actionLabel: "Review finding",
			relatedFindingHref: "/workspace/findings/finding-source-truth-readiness",
			workflowRunStatusLabel: "Workflow Proof Completed",
		});
		expect(
			model.rows.find((row) => row.id === "observability-debuggability"),
		).toMatchObject({
			statusLabel: "available now",
			relatedFindingTitle: "Observability proof is thin",
		});
		expect(
			model.rows.find((row) => row.id === "revenue-path-audit"),
		).toMatchObject({
			statusLabel: "future",
			actionLabel: null,
		});

		const renderedText = JSON.stringify(model).toLowerCase();
		expect(renderedText).not.toContain("run loop");
		expect(renderedText).not.toContain("export const runtime");
	});

	it("builds privacy status and existing deletion/revocation controls", () => {
		const model = buildWorkspacePrivacyModel({
			setupState: createSetupState(),
			syncPreviewState: {
				doctorPassRun: createDoctorPassRun({
					localReportRef: "C:\\Users\\customer\\repo\\.sbs\\report.json",
				}),
			},
			findings: [createFinding()],
			now,
		});

		expect(model).toMatchObject({
			projectId: "workspaceProjects_1",
			projectLabel: "Customer repo",
			repositoryLabel: "customer/app",
			runnerId: "workspaceRunnerBindings_1",
			runnerIdentityLabel: "Parker MacBook",
			runnerModeLabel: "Daemon",
			runnerHealthLabel: "Ready machine, Warning project",
			lastHeartbeatLabel: "1m ago",
			lastSyncPreviewLabel: "Uploaded",
			lastSyncPreviewDigest: "sha256:preview",
			localReportRef: "Local ref hidden",
			structuredFindingsCountLabel: "1",
			canRevokeRunner: true,
			canDeleteSyncedFindings: true,
		});
		expect(model.managedGithub).toMatchObject({
			statusLabel: "Available by concierge request",
			repositoryLabel: "customer/app",
			repositoryBindingId: "workspaceRepositoryBindings_1",
			canRequest: true,
			canRevoke: false,
		});
		expect(model.managedGithub.boundaryRows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ label: "Repo access" }),
				expect.objectContaining({ label: "Installation scope" }),
				expect.objectContaining({ label: "Storage policy" }),
				expect.objectContaining({ label: "PR authority" }),
				expect.objectContaining({ label: "Audit log" }),
				expect.objectContaining({ label: "Revocation" }),
				expect.objectContaining({ label: "Raw-source visibility" }),
				expect.objectContaining({ label: "Proof boundaries" }),
			]),
		);
		expect(model.sharingRows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					label: "Raw source sharing",
					statusLabel: "Disabled",
				}),
				expect.objectContaining({
					label: "Codex transcript sharing",
					statusLabel: "Disabled",
				}),
				expect.objectContaining({
					label: "Structured findings",
					statusLabel: "Approval required",
				}),
			]),
		);
		expect(model.syncedFindingIds).toEqual(["codebaseFindings_1"]);
	});

	it("renders existing managed GitHub consent and audit without execution commands", () => {
		const model = buildWorkspacePrivacyModel({
			setupState: createSetupState(),
			syncPreviewState: {
				doctorPassRun: createDoctorPassRun(),
			},
			managedGithubState: {
				consent: {
					_id: "managedGithubExecutionConsents_1",
					status: "requested",
					repositoryBindingId: "workspaceRepositoryBindings_1",
					repositoryAccess: {
						provider: "github",
						remoteOwner: "customer",
						remoteName: "app",
						defaultBranch: "main",
						accessMode: "selected_repository_only",
					},
					installationScope: {
						repositorySelection: "selected_repository_only",
						permissions: ["metadata:read", "contents:read"],
					},
					storagePolicy: {
						sourceCloneRetention: "ephemeral_until_delivery_or_revocation",
						proofArtifactRetention: "structured_metadata_only",
						secretStorage: "never_store_customer_secrets",
					},
					prAuthority: {
						branchCreation: "customer_approval_required",
						pullRequestCreation: "customer_approval_required",
						mergeAuthority: "never",
						ciRerunAuthority: "customer_approval_required",
					},
					rawSourceVisibility: {
						operatorVisibility: "assigned_concierge_only_after_consent",
						rawSourceSharing: "disabled_until_explicit_share",
						transcriptStorage: "disabled",
					},
					proofBoundary: {
						proofCommands: "customer_approved_only",
						ciCommands: "customer_approved_only",
						syncedArtifacts: "proof_metadata_and_pr_refs_only",
					},
					requestedAt: now,
				},
				auditEvents: [
					{
						_id: "managedGithubAuditEvents_1",
						eventType: "managed_github.requested",
						repositoryLabel: "customer/app",
						summary: "Customer requested concierge review.",
						createdAt: now,
					},
				],
			},
			findings: [],
			now,
		});

		expect(model.managedGithub).toMatchObject({
			statusLabel: "Requested",
			repositoryLabel: "customer/app",
			consentId: "managedGithubExecutionConsents_1",
			canRequest: false,
			canRevoke: true,
		});
		expect(model.managedGithub.auditRows[0]).toMatchObject({
			label: "Managed Github Requested: Customer requested concierge review.",
			timestampLabel: "2026-05-04 21:30 UTC",
		});

		const renderedText = JSON.stringify(model).toLowerCase();
		expect(renderedText).not.toContain("push branch");
		expect(renderedText).not.toContain("open pr");
		expect(renderedText).not.toContain("run ci now");
		expect(renderedText).not.toContain("raw source uploaded");
	});
});
