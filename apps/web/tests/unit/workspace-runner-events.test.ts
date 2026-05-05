import { afterEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

import {
	bindWorkspaceRunner,
	bindWorkspaceRunnerByPairingToken,
	claimWorkspaceWorkflowRunByCredential,
	createOrLoadWorkspaceProject,
	getWorkspaceHeartbeatState,
	getWorkspaceRunHistory,
	getWorkspaceSetupState,
	getWorkspaceSyncPreviewState,
	getWorkspaceWorkflowRunByCredential,
	ingestWorkspaceRunnerEvent,
	ingestWorkspaceRunnerEventByCredential,
	prepareWorkspaceSetupPairing,
	approveWorkspaceSyncPreview,
	requestWorkspaceWorkflowRun,
	pauseWorkspaceWorkflowRun,
	revokeWorkspaceRunner,
	resumeWorkspaceWorkflowRun,
	startWorkspaceDoctorPassRun,
	startWorkspaceDoctorPassRunByCredential,
	syncApprovedCodebaseFindingsByCredential,
	stopWorkspaceWorkflowRun,
} from "@/convex/workspace";

import { createWorkspaceTestCtx } from "./workspace-test-helpers";

function createApprovedFindingsDigest({
	runId,
	doctorPassRunId,
	findings,
}: {
	runId: string;
	doctorPassRunId: string;
	findings: unknown[];
}) {
	return `sha256:${createHash("sha256")
		.update(
			JSON.stringify({
				schemaVersion: "doctor-pass-local.v1",
				runId,
				doctorPassRunId,
				findings,
			}),
		)
		.digest("hex")}`;
}

async function createProjectAndRunner() {
	const testContext = createWorkspaceTestCtx();
	const projectResult = await createOrLoadWorkspaceProject._handler(
		testContext.ctx as never,
		{},
	);
	const runner = await bindWorkspaceRunner._handler(testContext.ctx as never, {
		projectId: projectResult.project._id,
		runnerMode: "daemon",
	});

	return {
		...testContext,
		project: projectResult.project,
		runner,
	};
}

async function createSourceTruthFinding({
	ctx,
	projectId,
	runnerId,
}: {
	ctx: ReturnType<typeof createWorkspaceTestCtx>["ctx"];
	projectId: string;
	runnerId: string;
}) {
	const doctorPassRun = await startWorkspaceDoctorPassRun._handler(
		ctx as never,
		{
			projectId: projectId as never,
			runnerId: runnerId as never,
			runnerMode: "daemon",
		},
	);
	return await ctx.db.insert("codebaseFindings", {
		projectId,
		doctorPassRunId: doctorPassRun._id,
		findingId: "finding-source-truth-readiness",
		rank: 1,
		status: "needs_approval",
		title: "Source truth needs the first workflow",
		category: "source_truth",
		severity: "high",
		confidence: 0.91,
		buyerImpact: "Later agent work needs a clearer command and proof map.",
		blastRadius: "low",
		proofPath: "Review source-truth readiness.",
		proofability: "clear",
		permissionRequired: "docs_write",
		recommendedWorkflowId: "source-truth-agent-readiness",
		whyThisNow: "It improves every later local workflow.",
		evidenceRefs: [],
		syncSensitivity: "low",
		localReportRef:
			".sbs/reports/doctor-pass/run-1/source-truth-agent-readiness.json",
		createdAt: 1,
		updatedAt: 1,
	});
}

async function createMatureRepoAdoptionFinding({
	ctx,
	projectId,
	runnerId,
}: {
	ctx: ReturnType<typeof createWorkspaceTestCtx>["ctx"];
	projectId: string;
	runnerId: string;
}) {
	const doctorPassRun = await startWorkspaceDoctorPassRun._handler(
		ctx as never,
		{
			projectId: projectId as never,
			runnerId: runnerId as never,
			runnerMode: "daemon",
		},
	);
	return await ctx.db.insert("codebaseFindings", {
		projectId,
		doctorPassRunId: doctorPassRun._id,
		findingId: "finding-mature-adoption",
		rank: 3,
		status: "needs_approval",
		title: "Mature repo needs an adoption packet",
		category: "other",
		severity: "medium",
		confidence: 0.82,
		buyerImpact: "Future agent work needs a repo-specific operating layer.",
		blastRadius: "low",
		proofPath: "Review local mature repo adoption proof.",
		proofability: "partial",
		permissionRequired: "workspace_write",
		recommendedWorkflowId: "mature-repo-adoption",
		whyThisNow:
			"The repo has useful conventions that should be preserved before larger changes.",
		evidenceRefs: [],
		syncSensitivity: "low",
		localReportRef: ".sbs/reports/doctor-pass/run-1/mature-repo-adoption.json",
		createdAt: 1,
		updatedAt: 1,
	});
}

function buildMatureRepoAdoptionApprovalArgs({
	projectId,
	findingDocumentId,
	runnerId,
	workflowVersion = "v1",
	writeLeaseDurationMinutes = 30,
}: {
	projectId: string;
	findingDocumentId: string;
	runnerId: string;
	workflowVersion?: string;
	writeLeaseDurationMinutes?: number;
}) {
	return {
		projectId: projectId as never,
		findingDocumentId: findingDocumentId as never,
		runnerId: runnerId as never,
		workflowId: "mature-repo-adoption",
		workflowVersion,
		branchName: "sbs/mature-repo-adoption-20260505-1100",
		profileName: "sbs-workspace-write",
		writeLeaseDurationMinutes,
		expectedOutputs: [
			"mature repo adoption workflow packet",
			"sync-safe repo convention audit",
			"adoption Program packet draft",
			"first child ExecPlan draft",
			"local proof or blocked-proof summary",
		],
		allowedTouchTargets: [
			".sbs/runs/<workflow-run-id>/**",
			".sbs/mature-repo/**",
			"repo convention metadata only",
		],
		disallowedTouchTargets: [
			"runtime app code",
			"environment files",
			"dependency manifests",
			"dependency locks",
			"database migrations",
			"provider configuration",
			"generated folders",
			"package scripts",
			"root agent instructions",
			"CI configuration",
			"CI-affecting commands",
			"branch pushes",
			"pull requests",
			"raw logs",
			"raw source",
			"Codex transcripts",
		],
		proofCommands: [
			"git status --short",
			"git diff --name-only",
			"git diff --check",
		],
		syncPolicySummary:
			"Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Local code, command output, and Codex session history stay on the machine.",
		stopConditions: [
			"worktree is dirty before branch creation",
			"write lease expires before adoption audit starts",
			"requested work needs generated-starter rewrites, provider setup, package installs, migrations, CI, PRs, branch pushes, raw source, raw logs, or Codex transcripts",
			"proof command fails",
		],
		rollbackNotes:
			"Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the mature adoption branch after reviewing local proof.",
	};
}

describe("workspace runner events", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("ingests runner events append-only and idempotently by eventId", async () => {
		const { ctx, tables, project, runner } = await createProjectAndRunner();

		vi.spyOn(Date, "now").mockReturnValue(50_000);

		const event = {
			eventId: "evt-heartbeat-1",
			projectId: project._id,
			runnerId: runner._id,
			eventType: "runner.heartbeat" as const,
			schemaVersion: "workspace.runner-event.v1",
			createdAt: 49_000,
			payload: {
				eventType: "runner.heartbeat" as const,
				runnerMode: "daemon" as const,
				status: "online" as const,
				machineHealthStatus: "ready" as const,
				projectHealthStatus: "warning" as const,
			},
		};

		const firstResult = await ingestWorkspaceRunnerEvent._handler(
			ctx as never,
			event,
		);
		const duplicateResult = await ingestWorkspaceRunnerEvent._handler(
			ctx as never,
			event,
		);
		const heartbeatState = await getWorkspaceHeartbeatState._handler(
			ctx as never,
			{
				projectId: project._id,
			},
		);

		expect(firstResult.inserted).toBe(true);
		expect(duplicateResult).toMatchObject({
			eventId: "evt-heartbeat-1",
			inserted: false,
			eventDocumentId: firstResult.eventDocumentId,
		});
		expect(tables.workspaceRunnerEvents).toHaveLength(1);
		expect(heartbeatState.activeRunner).toMatchObject({
			_id: runner._id,
			lastHeartbeatAt: 49_000,
			machineHealthStatus: "ready",
			projectHealthStatus: "warning",
		});
	});

	it("pairs and ingests runner events with token-backed runner credentials", async () => {
		const testContext = createWorkspaceTestCtx();
		vi.spyOn(Date, "now").mockReturnValue(100_000);
		const projectResult = await createOrLoadWorkspaceProject._handler(
			testContext.ctx as never,
			{},
		);
		const setupState = await prepareWorkspaceSetupPairing._handler(
			testContext.ctx as never,
			{
				projectId: projectResult.project._id,
				runnerMode: "daemon",
			},
		);
		expect(setupState.pairingCommand?.token).toBeTruthy();

		const runnerBinding = await bindWorkspaceRunnerByPairingToken._handler(
			testContext.ctx as never,
			{
				pairingToken: setupState.pairingCommand?.token ?? "",
				runnerCredentialHash: "sha256:runner-credential",
				runnerMode: "daemon",
				machineDisplayName: "Parker MacBook",
				runnerVersion: "0.1.0",
			},
		);
		const eventResult = await ingestWorkspaceRunnerEventByCredential._handler(
			testContext.ctx as never,
			{
				runnerCredentialHash: "sha256:runner-credential",
				eventId: "evt-token-heartbeat",
				projectId: projectResult.project._id,
				runnerId: runnerBinding.runnerId,
				eventType: "runner.heartbeat",
				schemaVersion: "workspace.runner-event.v1",
				createdAt: 101_000,
				payload: {
					eventType: "runner.heartbeat",
					runnerMode: "daemon",
					status: "online",
					machineHealthStatus: "ready",
					projectHealthStatus: "ready",
				},
			},
		);

		expect(runnerBinding).toMatchObject({
			projectId: projectResult.project._id,
			runnerMode: "daemon",
			pairingStatus: "paired",
		});
		expect(eventResult.inserted).toBe(true);
		expect(testContext.tables.workspaceRunnerBindings[0]).toMatchObject({
			runnerCredentialHash: "sha256:runner-credential",
			pairingStatus: "paired",
		});
		expect(testContext.tables.workspaceRunnerBindings[0]?.pairingToken).toBe(
			undefined,
		);

		const loadedSetupState = await getWorkspaceSetupState._handler(
			testContext.ctx as never,
			{
				projectId: projectResult.project._id,
			},
		);
		expect(JSON.stringify(loadedSetupState)).not.toContain(
			"sha256:runner-credential",
		);
		expect(loadedSetupState.activeRunner).not.toHaveProperty(
			"runnerCredentialHash",
		);
	});

	it("creates a repository binding from the paired runner display name", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();

		await ingestWorkspaceRunnerEvent._handler(ctx as never, {
			eventId: "evt-runner-paired-repo",
			projectId: project._id,
			runnerId: runner._id,
			eventType: "runner.paired",
			schemaVersion: "workspace.runner-event.v1",
			createdAt: 60_000,
			payload: {
				eventType: "runner.paired",
				pairingStatus: "paired",
				runnerMode: "daemon",
				machineDisplayName: "Parker MacBook",
				repositoryDisplayName: "ship-by-sunday",
			},
		});
		const setupState = await getWorkspaceSetupState._handler(ctx as never, {
			projectId: project._id,
		});

		expect(setupState.repositoryBinding).toMatchObject({
			projectId: project._id,
			runnerId: runner._id,
			displayName: "ship-by-sunday",
			provider: "unknown",
			status: "active",
		});
	});

	it("consumes setup pairing tokens after the first successful bind", async () => {
		const testContext = createWorkspaceTestCtx();
		vi.spyOn(Date, "now").mockReturnValue(110_000);
		const projectResult = await createOrLoadWorkspaceProject._handler(
			testContext.ctx as never,
			{},
		);
		const setupState = await prepareWorkspaceSetupPairing._handler(
			testContext.ctx as never,
			{
				projectId: projectResult.project._id,
				runnerMode: "daemon",
			},
		);
		const pairingToken = setupState.pairingCommand?.token ?? "";

		await bindWorkspaceRunnerByPairingToken._handler(testContext.ctx as never, {
			pairingToken,
			runnerCredentialHash: "sha256:first-runner",
			runnerMode: "daemon",
		});

		await expect(
			bindWorkspaceRunnerByPairingToken._handler(testContext.ctx as never, {
				pairingToken,
				runnerCredentialHash: "sha256:second-runner",
				runnerMode: "daemon",
			}),
		).rejects.toThrow("Pairing token not found");
		expect(
			testContext.tables.workspaceRunnerBindings[0]?.runnerCredentialHash,
		).toBe("sha256:first-runner");
	});

	it("rejects pairing when the runner mode differs from the setup token", async () => {
		const testContext = createWorkspaceTestCtx();
		const projectResult = await createOrLoadWorkspaceProject._handler(
			testContext.ctx as never,
			{},
		);
		const setupState = await prepareWorkspaceSetupPairing._handler(
			testContext.ctx as never,
			{
				projectId: projectResult.project._id,
				runnerMode: "one_shot",
			},
		);

		await expect(
			bindWorkspaceRunnerByPairingToken._handler(testContext.ctx as never, {
				pairingToken: setupState.pairingCommand?.token ?? "",
				runnerCredentialHash: "sha256:runner-credential",
				runnerMode: "daemon",
			}),
		).rejects.toThrow("runner mode");
		expect(testContext.tables.workspaceRunnerBindings[0]).toMatchObject({
			status: "pairing",
			runnerMode: "one_shot",
		});
	});

	it("derives sync preview state from doctor events", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		const doctorPassRun = await startWorkspaceDoctorPassRun._handler(
			ctx as never,
			{
				projectId: project._id,
				runnerId: runner._id,
				runnerMode: "daemon",
			},
		);

		await ingestWorkspaceRunnerEvent._handler(ctx as never, {
			eventId: "evt-preview-ready",
			projectId: project._id,
			runnerId: runner._id,
			doctorPassRunId: doctorPassRun._id,
			eventType: "doctor.sync_preview.ready",
			schemaVersion: "workspace.runner-event.v1",
			createdAt: 60_000,
			payload: {
				eventType: "doctor.sync_preview.ready",
				previewDigest: "sha256:preview-digest",
				findingsCount: 3,
				excludedArtifactCount: 4,
				localReportRef: ".sbs/reports/doctor-pass/run-1/sync-preview.json",
			},
		});

		const syncPreviewState = await getWorkspaceSyncPreviewState._handler(
			ctx as never,
			{
				projectId: project._id,
			},
		);

		expect(syncPreviewState.doctorPassRun).toMatchObject({
			_id: doctorPassRun._id,
			status: "sync_preview_ready",
			syncPreviewStatus: "ready",
			syncPreviewDigest: "sha256:preview-digest",
			syncPreviewFindingsCount: 3,
			excludedArtifactCount: 4,
		});
	});

	it("keeps sync preview approval on the user-owned approval mutation", async () => {
		const { ctx, tables, project, runner } = await createProjectAndRunner();
		const doctorPassRun = await startWorkspaceDoctorPassRun._handler(
			ctx as never,
			{
				projectId: project._id,
				runnerId: runner._id,
				runnerMode: "daemon",
			},
		);

		await ingestWorkspaceRunnerEvent._handler(ctx as never, {
			eventId: "evt-preview-ready-for-approval",
			projectId: project._id,
			runnerId: runner._id,
			doctorPassRunId: doctorPassRun._id,
			eventType: "doctor.sync_preview.ready",
			schemaVersion: "workspace.runner-event.v1",
			createdAt: 60_000,
			payload: {
				eventType: "doctor.sync_preview.ready",
				previewDigest: "sha256:preview-digest",
				findingsCount: 3,
				excludedArtifactCount: 4,
				localReportRef: ".sbs/reports/doctor-pass/run-1/sync-preview.json",
			},
		});

		await expect(
			ingestWorkspaceRunnerEvent._handler(ctx as never, {
				eventId: "evt-forged-approval",
				projectId: project._id,
				runnerId: runner._id,
				doctorPassRunId: doctorPassRun._id,
				eventType: "doctor.findings.approved",
				schemaVersion: "workspace.runner-event.v1",
				createdAt: 61_000,
				payload: {
					eventType: "doctor.findings.approved",
					previewDigest: "sha256:preview-digest",
					approvedFindingsCount: 3,
				},
			}),
		).rejects.toThrow("approveWorkspaceSyncPreview");
		const syncPreviewState = await getWorkspaceSyncPreviewState._handler(
			ctx as never,
			{
				projectId: project._id,
			},
		);

		expect(syncPreviewState.doctorPassRun).toMatchObject({
			syncPreviewStatus: "ready",
		});
		expect(tables.workspaceRunnerEvents).toHaveLength(1);
	});

	it("lets a credentialed runner start a run and upload only after approval", async () => {
		const testContext = createWorkspaceTestCtx();
		vi.spyOn(Date, "now").mockReturnValue(120_000);
		const projectResult = await createOrLoadWorkspaceProject._handler(
			testContext.ctx as never,
			{},
		);
		const setupState = await prepareWorkspaceSetupPairing._handler(
			testContext.ctx as never,
			{
				projectId: projectResult.project._id,
				runnerMode: "daemon",
			},
		);
		const runnerBinding = await bindWorkspaceRunnerByPairingToken._handler(
			testContext.ctx as never,
			{
				pairingToken: setupState.pairingCommand?.token ?? "",
				runnerCredentialHash: "sha256:runner-credential",
				runnerMode: "daemon",
			},
		);
		const startedRun = await startWorkspaceDoctorPassRunByCredential._handler(
			testContext.ctx as never,
			{
				runnerCredentialHash: "sha256:runner-credential",
				projectId: projectResult.project._id,
				runnerId: runnerBinding.runnerId,
				localRunId: "run-credential",
				runnerMode: "daemon",
			},
		);
		const retriedStartRun =
			await startWorkspaceDoctorPassRunByCredential._handler(
				testContext.ctx as never,
				{
					runnerCredentialHash: "sha256:runner-credential",
					projectId: projectResult.project._id,
					runnerId: runnerBinding.runnerId,
					localRunId: "run-credential",
					runnerMode: "daemon",
				},
			);
		const previewDigest = createApprovedFindingsDigest({
			runId: "run-credential",
			doctorPassRunId: startedRun.doctorPassRunId,
			findings: [],
		});

		expect(retriedStartRun).toEqual(startedRun);
		expect(testContext.tables.doctorPassRuns).toHaveLength(1);
		await ingestWorkspaceRunnerEventByCredential._handler(
			testContext.ctx as never,
			{
				runnerCredentialHash: "sha256:runner-credential",
				eventId: "evt-runner-preview",
				projectId: projectResult.project._id,
				runnerId: runnerBinding.runnerId,
				doctorPassRunId: startedRun.doctorPassRunId,
				eventType: "doctor.sync_preview.ready",
				schemaVersion: "workspace.runner-event.v1",
				createdAt: 121_000,
				payload: {
					eventType: "doctor.sync_preview.ready",
					previewDigest,
					findingsCount: 1,
					excludedArtifactCount: 3,
					localReportRef:
						".sbs/reports/doctor-pass/run-credential/sync-preview.json",
				},
			},
		);
		await expect(
			syncApprovedCodebaseFindingsByCredential._handler(
				testContext.ctx as never,
				{
					runnerCredentialHash: "sha256:runner-credential",
					projectId: projectResult.project._id,
					runnerId: runnerBinding.runnerId,
					doctorPassRunId: startedRun.doctorPassRunId,
					previewDigest,
					findings: [],
				},
			),
		).rejects.toThrow("approved");

		await approveWorkspaceSyncPreview._handler(testContext.ctx as never, {
			projectId: projectResult.project._id,
			doctorPassRunId: startedRun.doctorPassRunId,
			previewDigest,
		});
		await expect(
			syncApprovedCodebaseFindingsByCredential._handler(
				testContext.ctx as never,
				{
					runnerCredentialHash: "sha256:runner-credential",
					projectId: projectResult.project._id,
					runnerId: runnerBinding.runnerId,
					doctorPassRunId: startedRun.doctorPassRunId,
					previewDigest,
					findings: [
						{
							findingId: "finding-mutated",
							rank: 1,
							status: "ready",
							title: "Mutated finding",
							category: "source_truth",
							severity: "high",
							confidence: 0.9,
							buyerImpact: "This was not in the approved preview.",
							blastRadius: "low",
							proofPath: "Review local report.",
							proofability: "clear",
							permissionRequired: "provider_access",
							recommendedWorkflowId: "source-truth-agent-readiness",
							whyThisNow: "It demonstrates digest binding.",
							evidenceRefs: [],
							syncSensitivity: "low",
							localReportRef:
								".sbs/reports/doctor-pass/run-credential/findings.json",
						},
					],
				},
			),
		).rejects.toThrow("approved preview");
		const syncResult = await syncApprovedCodebaseFindingsByCredential._handler(
			testContext.ctx as never,
			{
				runnerCredentialHash: "sha256:runner-credential",
				projectId: projectResult.project._id,
				runnerId: runnerBinding.runnerId,
				doctorPassRunId: startedRun.doctorPassRunId,
				previewDigest,
				findings: [],
			},
		);
		const retrySyncResult =
			await syncApprovedCodebaseFindingsByCredential._handler(
				testContext.ctx as never,
				{
					runnerCredentialHash: "sha256:runner-credential",
					projectId: projectResult.project._id,
					runnerId: runnerBinding.runnerId,
					doctorPassRunId: startedRun.doctorPassRunId,
					previewDigest,
					findings: [],
				},
			);

		expect(syncResult).toMatchObject({
			insertedCount: 0,
			patchedCount: 0,
		});
		expect(retrySyncResult).toMatchObject({
			insertedCount: 0,
			patchedCount: 0,
		});
		expect(testContext.tables.doctorPassRuns[0]).toMatchObject({
			syncPreviewStatus: "uploaded",
			findingsCount: 0,
		});
	});

	it("persists approved source-truth workflow packets idempotently", async () => {
		const { ctx, tables, project, runner } = await createProjectAndRunner();
		vi.spyOn(Date, "now").mockReturnValue(200_000);
		const findingDocumentId = await createSourceTruthFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});

		const approvalArgs = {
			projectId: project._id,
			findingDocumentId,
			runnerId: runner._id,
			workflowId: "source-truth-agent-readiness",
			workflowVersion: "v1",
			branchName: "sbs/source-truth-readiness-20260504-2100",
			profileName: "sbs-workspace-write",
			writeLeaseDurationMinutes: 30,
			dirtyStatePolicy: "require_clean_worktree" as const,
			expectedOutputs: ["source-truth workflow packet"],
			allowedTouchTargets: ["AGENTS.md", ".sbs/runs/<workflow-run-id>"],
			disallowedTouchTargets: ["runtime app code", "environment files"],
			proofCommands: ["git status --short", "git diff --check"],
			syncPolicySummary: "Only structured proof metadata syncs.",
			stopConditions: ["worktree dirty before writes"],
			rollbackNotes: "Delete the local source-truth branch after review.",
		};
		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			approvalArgs,
		);
		const retriedWorkflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			approvalArgs,
		);

		expect(workflowRun._id).toBe(retriedWorkflowRun._id);
		expect(tables.workflowRuns).toHaveLength(1);
		expect(workflowRun).toMatchObject({
			status: "approved",
			proofStatus: "not_started",
			deliveryStatus: "not_started",
			branchName: "sbs/source-truth-readiness-20260504-2100",
			targetBranch: "sbs/source-truth-readiness-20260504-2100",
			profileName: "sbs-workspace-write",
			approvalSchemaVersion: "workspace.workflow-approval.v1",
			approvedByClerkUserId: "user_workspace_123",
			approvalSource: "finding_detail",
			writeLeaseId: `lease_${workflowRun._id}`,
			localWorkflowPacketRef: `.sbs/runs/${workflowRun._id}/workflow-packet.json`,
			localProofRef: `.sbs/runs/${workflowRun._id}/proof.json`,
		});
		expect(workflowRun.writeLeaseExpiresAt).toBe(2_000_000);
	});

	it("returns approved workflow history without approval-requested rows", async () => {
		const { ctx, project } = await createProjectAndRunner();
		await ctx.db.insert("workflowRuns", {
			projectId: project._id,
			workflowId: "source-truth-agent-readiness",
			workflowVersion: "v1",
			status: "approval_requested",
			proofStatus: "not_started",
			deliveryStatus: "not_started",
			createdAt: 100,
			updatedAt: 100,
		});
		const approvedWorkflowRunId = await ctx.db.insert("workflowRuns", {
			projectId: project._id,
			workflowId: "source-truth-agent-readiness",
			workflowVersion: "v1",
			status: "approved",
			proofStatus: "not_started",
			deliveryStatus: "not_started",
			createdAt: 90,
			updatedAt: 90,
		});
		await ctx.db.insert("workflowRuns", {
			projectId: project._id,
			workflowId: "source-truth-agent-readiness",
			workflowVersion: "v1",
			status: "deleted",
			proofStatus: "not_started",
			deliveryStatus: "not_started",
			createdAt: 110,
			updatedAt: 110,
		});

		const history = await getWorkspaceRunHistory._handler(ctx as never, {});

		expect(history.workflowRuns.map((run) => run._id)).toEqual([
			approvedWorkflowRunId,
		]);
	});

	it("keeps workflow approval idempotent after newer project workflow runs", async () => {
		const { ctx, tables, project, runner } = await createProjectAndRunner();
		const findingDocumentId = await createSourceTruthFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});
		const approvalArgs = {
			projectId: project._id,
			findingDocumentId,
			runnerId: runner._id,
			workflowId: "source-truth-agent-readiness",
			workflowVersion: "v1",
			branchName: "sbs/source-truth-readiness-20260504-2100",
			profileName: "sbs-workspace-write",
			expectedOutputs: ["source-truth workflow packet"],
			allowedTouchTargets: ["AGENTS.md"],
			disallowedTouchTargets: ["runtime app code"],
			proofCommands: ["git status --short"],
			syncPolicySummary: "Only structured proof metadata syncs.",
			stopConditions: ["worktree dirty before writes"],
			rollbackNotes: "Delete the local branch after review.",
		};
		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			approvalArgs,
		);
		for (let index = 0; index < 55; index += 1) {
			await ctx.db.insert("workflowRuns", {
				projectId: project._id,
				findingDocumentId: `codebaseFindings_other_${index}`,
				runnerId: runner._id,
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				status: "approved",
				proofStatus: "not_started",
				deliveryStatus: "not_started",
				branchName: `sbs/source-truth-readiness-20260504-${String(2200 + index).padStart(4, "0")}`,
				profileName: "sbs-workspace-write",
				createdAt: 300_000 + index,
				updatedAt: 300_000 + index,
			});
		}

		const retriedWorkflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			approvalArgs,
		);

		expect(retriedWorkflowRun._id).toBe(workflowRun._id);
		expect(
			tables.workflowRuns.filter(
				(run) => run.findingDocumentId === findingDocumentId,
			),
		).toHaveLength(1);
	});

	it("resolves approved workflow packets only for the owning runner credential", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		await ctx.db.patch(runner._id, {
			runnerCredentialHash: "sha256:runner-credential",
		});
		const findingDocumentId = await createSourceTruthFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});
		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
				expectedOutputs: ["source-truth workflow packet"],
				allowedTouchTargets: ["AGENTS.md"],
				disallowedTouchTargets: ["runtime app code"],
				proofCommands: ["git status --short"],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before writes"],
				rollbackNotes: "Delete the local branch after review.",
			},
		);

		const resolvedWorkflowRun =
			await getWorkspaceWorkflowRunByCredential._handler(ctx as never, {
				runnerCredentialHash: "sha256:runner-credential",
				projectId: project._id,
				runnerId: runner._id,
				workflowRunId: workflowRun._id,
			});

		expect(resolvedWorkflowRun).toMatchObject({
			workflowRunId: workflowRun._id,
			branchName: "sbs/source-truth-readiness-20260504-2100",
			profileName: "sbs-workspace-write",
			writeLeaseId: `lease_${workflowRun._id}`,
		});
	});

	it("approves and resolves broken-app triage as a supported read-only workflow", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		await ctx.db.patch(runner._id, {
			runnerCredentialHash: "sha256:runner-credential",
		});
		const doctorPassRun = await startWorkspaceDoctorPassRun._handler(
			ctx as never,
			{
				projectId: project._id,
				runnerId: runner._id,
				runnerMode: "daemon",
			},
		);
		const findingDocumentId = await ctx.db.insert("codebaseFindings", {
			projectId: project._id,
			doctorPassRunId: doctorPassRun._id,
			findingId: "finding-broken-app",
			rank: 1,
			status: "needs_approval",
			title: "Checkout route is failing",
			category: "broken_app",
			severity: "critical",
			confidence: 0.88,
			buyerImpact: "The app cannot complete checkout until this is reproduced.",
			blastRadius: "medium",
			proofPath: "Run the approved failing command locally.",
			proofability: "clear",
			permissionRequired: "workspace_write",
			recommendedWorkflowId: "broken-app-triage",
			whyThisNow: "The customer arrived with a concrete failure.",
			evidenceRefs: [
				{
					kind: "command",
					commandName: "package script: test",
				},
			],
			syncSensitivity: "low",
			localReportRef: ".sbs/reports/doctor-pass/run-1/broken-app-triage.json",
			createdAt: 1,
			updatedAt: 1,
		});

		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "broken-app-triage",
				workflowVersion: "v1",
				branchName: "sbs/broken-app-triage-20260504-2100",
				profileName: "sbs-doctor-readonly",
				expectedOutputs: ["read-only reproduction packet"],
				allowedTouchTargets: [".sbs/runs/<workflow-run-id>"],
				disallowedTouchTargets: ["runtime app code"],
				proofCommands: ["git status --short", "git diff --name-only"],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before reproduction"],
				rollbackNotes: "No source files are patched in this phase.",
			},
		);
		const resolvedWorkflowRun =
			await getWorkspaceWorkflowRunByCredential._handler(ctx as never, {
				runnerCredentialHash: "sha256:runner-credential",
				projectId: project._id,
				runnerId: runner._id,
				workflowRunId: workflowRun._id,
			});

		expect(resolvedWorkflowRun).toMatchObject({
			workflowRunId: workflowRun._id,
			workflowId: "broken-app-triage",
			branchName: "sbs/broken-app-triage-20260504-2100",
			profileName: "sbs-doctor-readonly",
			proofCommands: ["git status --short", "git diff --name-only"],
		});
	});

	it("approves and resolves observability debuggability as a supported local audit workflow", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		await ctx.db.patch(runner._id, {
			runnerCredentialHash: "sha256:runner-credential",
		});
		const doctorPassRun = await startWorkspaceDoctorPassRun._handler(
			ctx as never,
			{
				projectId: project._id,
				runnerId: runner._id,
				runnerMode: "daemon",
			},
		);
		const findingDocumentId = await ctx.db.insert("codebaseFindings", {
			projectId: project._id,
			doctorPassRunId: doctorPassRun._id,
			findingId: "finding-observability",
			rank: 2,
			status: "needs_approval",
			title: "Production errors are opaque",
			category: "observability",
			severity: "high",
			confidence: 0.84,
			buyerImpact: "Production failures need a clearer evidence path.",
			blastRadius: "low",
			proofPath: "Review local observability audit proof.",
			proofability: "partial",
			permissionRequired: "workspace_write",
			recommendedWorkflowId: "observability-debuggability",
			whyThisNow:
				"Source truth is ready and production failures are hard to inspect.",
			evidenceRefs: [],
			syncSensitivity: "low",
			localReportRef:
				".sbs/reports/doctor-pass/run-1/observability-debuggability.json",
			createdAt: 1,
			updatedAt: 1,
		});

		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "observability-debuggability",
				workflowVersion: "v1",
				branchName: "sbs/observability-debuggability-20260505-1000",
				profileName: "sbs-workspace-write",
				expectedOutputs: [
					"observability workflow packet",
					"sync-safe debuggability audit",
					"provider setup and dashboard access blocked-proof notes",
					"local proof or blocked-proof summary",
					"next recommended workflow",
				],
				allowedTouchTargets: [
					".sbs/runs/<workflow-run-id> workflow artifacts",
					".sbs/observability debuggability audit artifacts",
					"repo-relative observability signal metadata only",
				],
				disallowedTouchTargets: [
					"runtime app code",
					"environment files",
					"dependency manifests",
					"dependency locks",
					"database migrations",
					"provider configuration",
					"generated folders",
					"package scripts",
				],
				proofCommands: [
					"git status --short",
					"git diff --name-only",
					"git diff --check",
				],
				syncPolicySummary:
					"Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Local code, command output, and Codex session history stay on the machine.",
				stopConditions: [
					"worktree is dirty before branch creation",
					"write lease expires before local audit starts",
					"requested work needs runtime code, provider setup, dependencies, package scripts, CI, PRs, source maps, dashboards, or deployment proof",
					"proof command fails",
				],
				rollbackNotes:
					"Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the observability branch after reviewing local proof.",
			},
		);
		const resolvedWorkflowRun =
			await getWorkspaceWorkflowRunByCredential._handler(ctx as never, {
				runnerCredentialHash: "sha256:runner-credential",
				projectId: project._id,
				runnerId: runner._id,
				workflowRunId: workflowRun._id,
			});

		expect(resolvedWorkflowRun).toMatchObject({
			workflowRunId: workflowRun._id,
			workflowId: "observability-debuggability",
			branchName: "sbs/observability-debuggability-20260505-1000",
			profileName: "sbs-workspace-write",
			proofCommands: [
				"git status --short",
				"git diff --name-only",
				"git diff --check",
			],
		});
	});

	it("approves and resolves mature repo adoption as a supported local audit workflow", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		await ctx.db.patch(runner._id, {
			runnerCredentialHash: "sha256:runner-credential",
		});
		const doctorPassRun = await startWorkspaceDoctorPassRun._handler(
			ctx as never,
			{
				projectId: project._id,
				runnerId: runner._id,
				runnerMode: "daemon",
			},
		);
		const findingDocumentId = await ctx.db.insert("codebaseFindings", {
			projectId: project._id,
			doctorPassRunId: doctorPassRun._id,
			findingId: "finding-mature-adoption",
			rank: 3,
			status: "needs_approval",
			title: "Mature repo needs an adoption packet",
			category: "other",
			severity: "medium",
			confidence: 0.82,
			buyerImpact: "Future agent work needs a repo-specific operating layer.",
			blastRadius: "low",
			proofPath: "Review local mature repo adoption proof.",
			proofability: "partial",
			permissionRequired: "workspace_write",
			recommendedWorkflowId: "mature-repo-adoption",
			whyThisNow:
				"The repo has useful conventions that should be preserved before larger changes.",
			evidenceRefs: [],
			syncSensitivity: "low",
			localReportRef:
				".sbs/reports/doctor-pass/run-1/mature-repo-adoption.json",
			createdAt: 1,
			updatedAt: 1,
		});

		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "mature-repo-adoption",
				workflowVersion: "v1",
				branchName: "sbs/mature-repo-adoption-20260505-1100",
				profileName: "sbs-workspace-write",
				expectedOutputs: [
					"mature repo adoption workflow packet",
					"sync-safe repo convention audit",
					"adoption Program packet draft",
					"first child ExecPlan draft",
					"local proof or blocked-proof summary",
				],
				allowedTouchTargets: [
					".sbs/runs/<workflow-run-id>/**",
					".sbs/mature-repo/**",
					"repo convention metadata only",
				],
				disallowedTouchTargets: [
					"runtime app code",
					"environment files",
					"dependency manifests",
					"dependency locks",
					"database migrations",
					"provider configuration",
					"generated folders",
					"package scripts",
					"root agent instructions",
					"CI configuration",
					"CI-affecting commands",
					"branch pushes",
					"pull requests",
					"raw logs",
					"raw source",
					"Codex transcripts",
				],
				proofCommands: [
					"git status --short",
					"git diff --name-only",
					"git diff --check",
				],
				syncPolicySummary:
					"Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Local code, command output, and Codex session history stay on the machine.",
				stopConditions: [
					"worktree is dirty before branch creation",
					"write lease expires before adoption audit starts",
					"requested work needs generated-starter rewrites, provider setup, package installs, migrations, CI, PRs, branch pushes, raw source, raw logs, or Codex transcripts",
					"proof command fails",
				],
				rollbackNotes:
					"Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the mature adoption branch after reviewing local proof.",
			},
		);
		const resolvedWorkflowRun =
			await getWorkspaceWorkflowRunByCredential._handler(ctx as never, {
				runnerCredentialHash: "sha256:runner-credential",
				projectId: project._id,
				runnerId: runner._id,
				workflowRunId: workflowRun._id,
			});

		expect(resolvedWorkflowRun).toMatchObject({
			workflowRunId: workflowRun._id,
			workflowId: "mature-repo-adoption",
			branchName: "sbs/mature-repo-adoption-20260505-1100",
			profileName: "sbs-workspace-write",
			localWorkflowPacketRef: `.sbs/runs/${workflowRun._id}/workflow-packet.json`,
			localProofRef: `.sbs/runs/${workflowRun._id}/proof.json`,
		});
	});

	it("rejects mature repo adoption approvals with an unsupported workflow version", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		const findingDocumentId = await createMatureRepoAdoptionFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});

		await expect(
			requestWorkspaceWorkflowRun._handler(
				ctx as never,
				buildMatureRepoAdoptionApprovalArgs({
					projectId: project._id,
					findingDocumentId,
					runnerId: runner._id,
					workflowVersion: "v2",
				}),
			),
		).rejects.toThrow("Mature repo adoption workflow version is not approved");
	});

	it("rejects mature repo adoption approvals with a non-default write lease", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		const findingDocumentId = await createMatureRepoAdoptionFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});

		await expect(
			requestWorkspaceWorkflowRun._handler(
				ctx as never,
				buildMatureRepoAdoptionApprovalArgs({
					projectId: project._id,
					findingDocumentId,
					runnerId: runner._id,
					writeLeaseDurationMinutes: 60,
				}),
			),
		).rejects.toThrow(
			"Mature repo adoption write lease duration is not approved",
		);
	});

	it("rejects observability approvals that drift from the shipped audit packet", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		const doctorPassRun = await startWorkspaceDoctorPassRun._handler(
			ctx as never,
			{
				projectId: project._id,
				runnerId: runner._id,
				runnerMode: "daemon",
			},
		);
		const findingDocumentId = await ctx.db.insert("codebaseFindings", {
			projectId: project._id,
			doctorPassRunId: doctorPassRun._id,
			findingId: "finding-observability",
			rank: 2,
			status: "needs_approval",
			title: "Production errors are opaque",
			category: "observability",
			severity: "high",
			confidence: 0.84,
			buyerImpact: "Production failures need a clearer evidence path.",
			blastRadius: "low",
			proofPath: "Review local observability audit proof.",
			proofability: "partial",
			permissionRequired: "workspace_write",
			recommendedWorkflowId: "observability-debuggability",
			whyThisNow:
				"Source truth is ready and production failures are hard to inspect.",
			evidenceRefs: [],
			syncSensitivity: "low",
			localReportRef:
				".sbs/reports/doctor-pass/run-1/observability-debuggability.json",
			createdAt: 1,
			updatedAt: 1,
		});

		await expect(
			requestWorkspaceWorkflowRun._handler(ctx as never, {
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "observability-debuggability",
				workflowVersion: "v1",
				branchName: "sbs/observability-debuggability-20260505-1000",
				profileName: "sbs-workspace-write; gh pr create",
				expectedOutputs: ["observability workflow packet"],
				allowedTouchTargets: ["runtime app code"],
				disallowedTouchTargets: ["environment files"],
				proofCommands: [
					"git status --short",
					"git diff --name-only",
					"git diff --check",
				],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before observability audit"],
				rollbackNotes: "Delete the local observability branch after review.",
			}),
		).rejects.toThrow("Observability profile name is not approved");
	});

	it("rejects package-script commands in broken-app triage approvals", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		const doctorPassRun = await startWorkspaceDoctorPassRun._handler(
			ctx as never,
			{
				projectId: project._id,
				runnerId: runner._id,
				runnerMode: "daemon",
			},
		);
		const findingDocumentId = await ctx.db.insert("codebaseFindings", {
			projectId: project._id,
			doctorPassRunId: doctorPassRun._id,
			findingId: "finding-broken-app",
			rank: 1,
			status: "needs_approval",
			title: "Checkout route is failing",
			category: "broken_app",
			severity: "critical",
			confidence: 0.88,
			buyerImpact: "The app cannot complete checkout until this is reproduced.",
			blastRadius: "medium",
			proofPath: "Review local diagnostics before patching.",
			proofability: "clear",
			permissionRequired: "workspace_write",
			recommendedWorkflowId: "broken-app-triage",
			whyThisNow: "The customer arrived with a concrete failure.",
			evidenceRefs: [],
			syncSensitivity: "low",
			localReportRef: ".sbs/reports/doctor-pass/run-1/broken-app-triage.json",
			createdAt: 1,
			updatedAt: 1,
		});

		await expect(
			requestWorkspaceWorkflowRun._handler(ctx as never, {
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "broken-app-triage",
				workflowVersion: "v1",
				branchName: "sbs/broken-app-triage-20260504-2100",
				profileName: "sbs-doctor-readonly",
				expectedOutputs: ["read-only diagnostics packet"],
				allowedTouchTargets: [".sbs/runs/<workflow-run-id>"],
				disallowedTouchTargets: ["runtime app code"],
				proofCommands: ["package script: test"],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before diagnostics"],
				rollbackNotes: "No source files are patched in this phase.",
			}),
		).rejects.toThrow("read-only Git diagnostics");
	});

	it("refuses direct runner resolution for paused workflow runs", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		await ctx.db.patch(runner._id, {
			runnerCredentialHash: "sha256:runner-credential",
		});
		const findingDocumentId = await createSourceTruthFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});
		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
				expectedOutputs: ["source-truth workflow packet"],
				allowedTouchTargets: ["AGENTS.md"],
				disallowedTouchTargets: ["runtime app code"],
				proofCommands: ["git status --short"],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before writes"],
				rollbackNotes: "Delete the local branch after review.",
			},
		);
		await pauseWorkspaceWorkflowRun._handler(ctx as never, {
			projectId: project._id,
			workflowRunId: workflowRun._id,
		});

		await expect(
			getWorkspaceWorkflowRunByCredential._handler(ctx as never, {
				runnerCredentialHash: "sha256:runner-credential",
				projectId: project._id,
				runnerId: runner._id,
				workflowRunId: workflowRun._id,
			}),
		).rejects.toThrow("not runnable");
	});

	it("claims the oldest approved workflow for daemon workers and enforces one active project lease", async () => {
		const { ctx, tables, project, runner } = await createProjectAndRunner();
		await ctx.db.patch(runner._id, {
			runnerCredentialHash: "sha256:runner-credential",
		});
		vi.spyOn(Date, "now").mockReturnValue(250_000);
		const findingDocumentId = await createSourceTruthFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});
		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
				expectedOutputs: ["source-truth workflow packet"],
				allowedTouchTargets: ["AGENTS.md"],
				disallowedTouchTargets: ["runtime app code"],
				proofCommands: ["git status --short"],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before writes"],
				rollbackNotes: "Delete the local branch after review.",
			},
		);

		vi.spyOn(Date, "now").mockReturnValue(300_000);
		const claimedWorkflowRun =
			await claimWorkspaceWorkflowRunByCredential._handler(ctx as never, {
				runnerCredentialHash: "sha256:runner-credential",
				projectId: project._id,
				runnerId: runner._id,
			});
		const secondClaim = await claimWorkspaceWorkflowRunByCredential._handler(
			ctx as never,
			{
				runnerCredentialHash: "sha256:runner-credential",
				projectId: project._id,
				runnerId: runner._id,
			},
		);

		expect(claimedWorkflowRun).toMatchObject({
			workflowRunId: workflowRun._id,
			writeLeaseExpiresAt: 2_100_000,
		});
		expect(secondClaim).toBeNull();
		expect(tables.workflowRuns[0]).toMatchObject({
			status: "running",
			startedAt: 300_000,
			writeLeaseExpiresAt: 2_100_000,
		});
		expect(tables.workspaceRunnerEvents).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					eventType: "workflow.claimed",
					workflowRunId: workflowRun._id,
				}),
			]),
		);
	});

	it("rejects terminal workflow events after the approved write lease expires", async () => {
		const { ctx, tables, project, runner } = await createProjectAndRunner();
		const nowSpy = vi.spyOn(Date, "now").mockReturnValue(250_000);
		const findingDocumentId = await createSourceTruthFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});
		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
				writeLeaseDurationMinutes: 30,
				expectedOutputs: ["source-truth workflow packet"],
				allowedTouchTargets: ["AGENTS.md"],
				disallowedTouchTargets: ["runtime app code"],
				proofCommands: ["git status --short"],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before writes"],
				rollbackNotes: "Delete the local branch after review.",
			},
		);
		nowSpy.mockReturnValue((workflowRun.writeLeaseExpiresAt ?? 0) + 1);

		await expect(
			ingestWorkspaceRunnerEvent._handler(ctx as never, {
				eventId: "evt-expired-proof",
				projectId: project._id,
				runnerId: runner._id,
				workflowRunId: workflowRun._id,
				eventType: "workflow.proof.completed",
				schemaVersion: "workspace.runner-event.v1",
				createdAt: 251_000,
				payload: {
					eventType: "workflow.proof.completed",
					workflowId: "source-truth-agent-readiness",
					writeLeaseId: workflowRun.writeLeaseId,
					proofStatus: "passed",
					proofSummary: "Late proof should not mutate hosted state.",
				},
			}),
		).rejects.toThrow("write lease has expired");
		expect(tables.workspaceRunnerEvents).toHaveLength(0);
		expect(tables.workflowRuns[0]).toMatchObject({
			status: "approved",
			proofStatus: "not_started",
		});
		expect(tables.codebaseFindings[0]).toMatchObject({
			status: "needs_approval",
		});
	});

	it("rejects terminal workflow events with a mismatched write lease id", async () => {
		const { ctx, tables, project, runner } = await createProjectAndRunner();
		const findingDocumentId = await createSourceTruthFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});
		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
				expectedOutputs: ["source-truth workflow packet"],
				allowedTouchTargets: ["AGENTS.md"],
				disallowedTouchTargets: ["runtime app code"],
				proofCommands: ["git status --short"],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before writes"],
				rollbackNotes: "Delete the local branch after review.",
			},
		);

		await expect(
			ingestWorkspaceRunnerEvent._handler(ctx as never, {
				eventId: "evt-wrong-lease-proof",
				projectId: project._id,
				runnerId: runner._id,
				workflowRunId: workflowRun._id,
				eventType: "workflow.blocked",
				schemaVersion: "workspace.runner-event.v1",
				createdAt: 251_000,
				payload: {
					eventType: "workflow.blocked",
					workflowId: "source-truth-agent-readiness",
					writeLeaseId: "lease_wrong",
					blockedStage: "proof",
					blockedReason: "Forged blocked event.",
				},
			}),
		).rejects.toThrow("write lease does not match");
		expect(tables.workspaceRunnerEvents).toHaveLength(0);
		expect(tables.workflowRuns[0]).toMatchObject({
			status: "approved",
			proofStatus: "not_started",
		});
	});

	it("claims runner-owned approved work even when other runners have older queue entries", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		const otherRunner = await bindWorkspaceRunner._handler(ctx as never, {
			projectId: project._id,
			runnerMode: "daemon",
		});
		await ctx.db.patch(runner._id, {
			runnerCredentialHash: "sha256:runner-credential",
		});
		for (let index = 0; index < 25; index += 1) {
			await ctx.db.insert("workflowRuns", {
				projectId: project._id,
				runnerId: otherRunner._id,
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				status: "approved",
				proofStatus: "not_started",
				deliveryStatus: "not_started",
				branchName: `sbs/other-${index}`,
				targetBranch: `sbs/other-${index}`,
				profileName: "sbs-workspace-write",
				writeLeaseId: `lease_other_${index}`,
				writeLeaseExpiresAt: 500_000,
				writeLeaseDurationMinutes: 30,
				dirtyStatePolicy: "require_clean_worktree",
				expectedOutputs: ["source-truth workflow packet"],
				allowedTouchTargets: ["AGENTS.md"],
				disallowedTouchTargets: ["runtime app code"],
				proofCommands: ["git status --short"],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before writes"],
				rollbackNotes: "Delete the local branch after review.",
				localWorkflowPacketRef: `.sbs/runs/other-${index}/workflow-packet.json`,
				localProofRef: `.sbs/runs/other-${index}/proof.json`,
				createdAt: index,
				updatedAt: index,
			});
		}
		const runnerWorkflowRunId = await ctx.db.insert("workflowRuns", {
			projectId: project._id,
			runnerId: runner._id,
			workflowId: "source-truth-agent-readiness",
			workflowVersion: "v1",
			status: "approved",
			proofStatus: "not_started",
			deliveryStatus: "not_started",
			branchName: "sbs/source-truth-readiness-20260504-2100",
			targetBranch: "sbs/source-truth-readiness-20260504-2100",
			profileName: "sbs-workspace-write",
			writeLeaseId: "lease_runner",
			writeLeaseExpiresAt: 500_000,
			writeLeaseDurationMinutes: 30,
			dirtyStatePolicy: "require_clean_worktree",
			expectedOutputs: ["source-truth workflow packet"],
			allowedTouchTargets: ["AGENTS.md"],
			disallowedTouchTargets: ["runtime app code"],
			proofCommands: ["git status --short"],
			syncPolicySummary: "Only structured proof metadata syncs.",
			stopConditions: ["worktree dirty before writes"],
			rollbackNotes: "Delete the local branch after review.",
			localWorkflowPacketRef: ".sbs/runs/runner/workflow-packet.json",
			localProofRef: ".sbs/runs/runner/proof.json",
			createdAt: 100,
			updatedAt: 100,
		});

		const claimedWorkflowRun =
			await claimWorkspaceWorkflowRunByCredential._handler(ctx as never, {
				runnerCredentialHash: "sha256:runner-credential",
				projectId: project._id,
				runnerId: runner._id,
			});

		expect(claimedWorkflowRun?.workflowRunId).toBe(runnerWorkflowRunId);
	});

	it("pauses, resumes, and stops approved workflow queue jobs", async () => {
		const { ctx, tables, project, runner } = await createProjectAndRunner();
		const findingDocumentId = await createSourceTruthFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});
		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
				expectedOutputs: ["source-truth workflow packet"],
				allowedTouchTargets: ["AGENTS.md"],
				disallowedTouchTargets: ["runtime app code"],
				proofCommands: ["git status --short"],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before writes"],
				rollbackNotes: "Delete the local branch after review.",
			},
		);

		await pauseWorkspaceWorkflowRun._handler(ctx as never, {
			projectId: project._id,
			workflowRunId: workflowRun._id,
			reason: "Customer paused queue",
		});
		await expect(
			claimWorkspaceWorkflowRunByCredential._handler(ctx as never, {
				runnerCredentialHash: "sha256:missing",
				projectId: project._id,
				runnerId: runner._id,
			}),
		).rejects.toThrow("credential");
		expect(tables.workflowRuns[0]).toMatchObject({
			status: "paused",
			blockedReason: "Customer paused queue",
		});

		await resumeWorkspaceWorkflowRun._handler(ctx as never, {
			projectId: project._id,
			workflowRunId: workflowRun._id,
		});
		expect(tables.workflowRuns[0]).toMatchObject({
			status: "approved",
		});
		expect(tables.workflowRuns[0]?.blockedReason).toBeUndefined();

		await stopWorkspaceWorkflowRun._handler(ctx as never, {
			projectId: project._id,
			workflowRunId: workflowRun._id,
			reason: "Customer stopped queue",
		});
		await ingestWorkspaceRunnerEvent._handler(ctx as never, {
			eventId: "evt-stopped-proof",
			projectId: project._id,
			runnerId: runner._id,
			workflowRunId: workflowRun._id,
			eventType: "workflow.proof.completed",
			schemaVersion: "workspace.runner-event.v1",
			createdAt: 400_000,
			payload: {
				eventType: "workflow.proof.completed",
				workflowId: "source-truth-agent-readiness",
				writeLeaseId: workflowRun.writeLeaseId,
				proofStatus: "passed",
				proofSummary: "Late proof should not revive stopped work.",
			},
		});
		expect(tables.workflowRuns[0]).toMatchObject({
			status: "canceled",
			blockedReason: "Customer stopped queue",
		});
	});

	it("derives workflow and finding status from source-truth proof events", async () => {
		const { ctx, tables, project, runner } = await createProjectAndRunner();
		const findingDocumentId = await createSourceTruthFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});
		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
				expectedOutputs: ["source-truth workflow packet"],
				allowedTouchTargets: ["AGENTS.md"],
				disallowedTouchTargets: ["runtime app code"],
				proofCommands: ["git status --short"],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before writes"],
				rollbackNotes: "Delete the local branch after review.",
			},
		);

		await ingestWorkspaceRunnerEvent._handler(ctx as never, {
			eventId: "evt-workflow-started",
			projectId: project._id,
			runnerId: runner._id,
			workflowRunId: workflowRun._id,
			eventType: "workflow.started",
			schemaVersion: "workspace.runner-event.v1",
			createdAt: 201_000,
			payload: {
				eventType: "workflow.started",
				workflowId: "source-truth-agent-readiness",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
			},
		});
		await ingestWorkspaceRunnerEvent._handler(ctx as never, {
			eventId: "evt-workflow-proof",
			projectId: project._id,
			runnerId: runner._id,
			workflowRunId: workflowRun._id,
			eventType: "workflow.proof.completed",
			schemaVersion: "workspace.runner-event.v1",
			createdAt: 202_000,
			payload: {
				eventType: "workflow.proof.completed",
				workflowId: "source-truth-agent-readiness",
				writeLeaseId: workflowRun.writeLeaseId,
				proofStatus: "passed",
				proofSummary: "Source-truth workflow wrote local proof.",
				touchedFileRefs: ["AGENTS.md"],
				createdArtifactRefs: [
					`.sbs/runs/${workflowRun._id}/workflow-packet.json`,
					`.sbs/runs/${workflowRun._id}/proof.json`,
				],
				proofCommandResults: [
					{ commandName: "git status --short", status: "passed" },
				],
				nextRecommendedWorkflowId: "observability-debuggability",
			},
		});

		expect(tables.workflowRuns[0]).toMatchObject({
			status: "proof_completed",
			proofStatus: "passed",
			deliveryStatus: "local_only",
			proofSummary: "Source-truth workflow wrote local proof.",
			touchedFileRefs: ["AGENTS.md"],
			nextRecommendedWorkflowId: "observability-debuggability",
		});
		expect(tables.codebaseFindings[0]).toMatchObject({
			_id: findingDocumentId,
			status: "done",
		});

		await ingestWorkspaceRunnerEvent._handler(ctx as never, {
			eventId: "evt-workflow-started-late",
			projectId: project._id,
			runnerId: runner._id,
			workflowRunId: workflowRun._id,
			eventType: "workflow.started",
			schemaVersion: "workspace.runner-event.v1",
			createdAt: 203_000,
			payload: {
				eventType: "workflow.started",
				workflowId: "source-truth-agent-readiness",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
			},
		});
		expect(tables.workflowRuns[0]).toMatchObject({
			status: "proof_completed",
			proofStatus: "passed",
		});
		expect(tables.codebaseFindings[0]).toMatchObject({
			status: "done",
		});
	});

	it("rejects workflow events from non-owning runners and mismatched branch payloads", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();
		const otherRunner = await bindWorkspaceRunner._handler(ctx as never, {
			projectId: project._id,
			runnerMode: "daemon",
			runnerLabel: "Other runner",
		});
		const findingDocumentId = await createSourceTruthFinding({
			ctx,
			projectId: project._id,
			runnerId: runner._id,
		});
		const workflowRun = await requestWorkspaceWorkflowRun._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentId,
				runnerId: runner._id,
				workflowId: "source-truth-agent-readiness",
				workflowVersion: "v1",
				branchName: "sbs/source-truth-readiness-20260504-2100",
				profileName: "sbs-workspace-write",
				expectedOutputs: ["source-truth workflow packet"],
				allowedTouchTargets: ["AGENTS.md"],
				disallowedTouchTargets: ["runtime app code"],
				proofCommands: ["git status --short"],
				syncPolicySummary: "Only structured proof metadata syncs.",
				stopConditions: ["worktree dirty before writes"],
				rollbackNotes: "Delete the local branch after review.",
			},
		);

		await expect(
			ingestWorkspaceRunnerEvent._handler(ctx as never, {
				eventId: "evt-wrong-runner-workflow",
				projectId: project._id,
				runnerId: otherRunner._id,
				workflowRunId: workflowRun._id,
				eventType: "workflow.proof.completed",
				schemaVersion: "workspace.runner-event.v1",
				createdAt: 203_000,
				payload: {
					eventType: "workflow.proof.completed",
					workflowId: "source-truth-agent-readiness",
					writeLeaseId: workflowRun.writeLeaseId,
					proofStatus: "passed",
					proofSummary: "Forged proof.",
				},
			}),
		).rejects.toThrow("does not own");

		await expect(
			ingestWorkspaceRunnerEvent._handler(ctx as never, {
				eventId: "evt-wrong-branch-workflow",
				projectId: project._id,
				runnerId: runner._id,
				workflowRunId: workflowRun._id,
				eventType: "workflow.started",
				schemaVersion: "workspace.runner-event.v1",
				createdAt: 204_000,
				payload: {
					eventType: "workflow.started",
					workflowId: "source-truth-agent-readiness",
					branchName: "sbs/source-truth-readiness-20260504-9999",
					profileName: "sbs-workspace-write",
				},
			}),
		).rejects.toThrow("branch and profile");
	});

	it("rejects events from a revoked runner binding", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();

		await revokeWorkspaceRunner._handler(ctx as never, {
			projectId: project._id,
			runnerId: runner._id,
			reason: "Customer disconnected the runner.",
		});

		await expect(
			ingestWorkspaceRunnerEvent._handler(ctx as never, {
				eventId: "evt-revoked-heartbeat",
				projectId: project._id,
				runnerId: runner._id,
				eventType: "runner.heartbeat",
				schemaVersion: "workspace.runner-event.v1",
				createdAt: 70_000,
				payload: {
					eventType: "runner.heartbeat",
					runnerMode: "daemon",
					status: "online",
					machineHealthStatus: "ready",
					projectHealthStatus: "ready",
				},
			}),
		).rejects.toThrow("revoked");
		const heartbeatState = await getWorkspaceHeartbeatState._handler(
			ctx as never,
			{
				projectId: project._id,
			},
		);

		expect(heartbeatState.activeRunner).toBeNull();
	});

	it("rejects mismatched payload discriminators", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();

		await expect(
			ingestWorkspaceRunnerEvent._handler(
				ctx as never,
				{
					eventId: "evt-mismatch",
					projectId: project._id,
					runnerId: runner._id,
					eventType: "runner.heartbeat",
					schemaVersion: "workspace.runner-event.v1",
					createdAt: 1,
					payload: {
						eventType: "runner.paired",
						pairingStatus: "paired",
						runnerMode: "daemon",
					},
				} as never,
			),
		).rejects.toThrow("payload type does not match");
	});

	it("rejects unsafe event payload fields and local absolute paths", async () => {
		const { ctx, project, runner } = await createProjectAndRunner();

		await expect(
			ingestWorkspaceRunnerEvent._handler(
				ctx as never,
				{
					eventId: "evt-raw-log",
					projectId: project._id,
					runnerId: runner._id,
					eventType: "runner.heartbeat",
					schemaVersion: "workspace.runner-event.v1",
					createdAt: 1,
					payload: {
						eventType: "runner.heartbeat",
						runnerMode: "daemon",
						status: "online",
						machineHealthStatus: "ready",
						projectHealthStatus: "ready",
						rawLog: "bun test output",
					},
				} as never,
			),
		).rejects.toThrow("rawLog");

		await expect(
			ingestWorkspaceRunnerEvent._handler(
				ctx as never,
				{
					eventId: "evt-absolute-path",
					projectId: project._id,
					runnerId: runner._id,
					eventType: "doctor.sync_preview.ready",
					schemaVersion: "workspace.runner-event.v1",
					createdAt: 1,
					doctorPassRunId: "doctorPassRuns_1",
					payload: {
						eventType: "doctor.sync_preview.ready",
						previewDigest: "sha256:preview-digest",
						findingsCount: 1,
						excludedArtifactCount: 0,
						localReportRef: "/Users/customer/repo/.sbs/report.json",
					},
				} as never,
			),
		).rejects.toThrow("local absolute path");
	});
});
