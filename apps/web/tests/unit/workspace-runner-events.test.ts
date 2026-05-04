import { afterEach, describe, expect, it, vi } from "vitest";

import {
	bindWorkspaceRunner,
	bindWorkspaceRunnerByPairingToken,
	createOrLoadWorkspaceProject,
	getWorkspaceHeartbeatState,
	getWorkspaceSetupState,
	getWorkspaceSyncPreviewState,
	ingestWorkspaceRunnerEvent,
	ingestWorkspaceRunnerEventByCredential,
	prepareWorkspaceSetupPairing,
	revokeWorkspaceRunner,
	startWorkspaceDoctorPassRun,
} from "@/convex/workspace";

import { createWorkspaceTestCtx } from "./workspace-test-helpers";

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
