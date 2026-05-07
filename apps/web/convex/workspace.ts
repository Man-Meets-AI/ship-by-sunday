import { ConvexError } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";
import {
	appendSupportModeWriteSuccessAuditHandler,
	assertSupportModeWriteAllowedHandler,
	recordBlockedSupportModeActionHandler,
} from "./impersonation/model";
import {
	approveWorkspaceSyncPreviewArgs,
	approveWorkspaceSyncPreviewHandler,
	approveWorkspaceSyncPreviewReturns,
	bindWorkspaceRepositoryArgs,
	bindWorkspaceRepositoryHandler,
	bindWorkspaceRepositoryReturns,
	bindWorkspaceRunnerArgs,
	bindWorkspaceRunnerByPairingTokenArgs,
	bindWorkspaceRunnerByPairingTokenHandler,
	bindWorkspaceRunnerByPairingTokenReturns,
	bindWorkspaceRunnerHandler,
	bindWorkspaceRunnerReturns,
	claimWorkspaceWorkflowRunByCredentialArgs,
	claimWorkspaceWorkflowRunByCredentialHandler,
	claimWorkspaceWorkflowRunByCredentialReturns,
	cancelWorkspaceSetupPairingArgs,
	cancelWorkspaceSetupPairingHandler,
	cancelWorkspaceSetupPairingReturns,
	createOrLoadWorkspaceProjectArgs,
	createOrLoadWorkspaceProjectHandler,
	createOrLoadWorkspaceProjectReturns,
	getWorkspaceHeartbeatStateArgs,
	getWorkspaceHeartbeatStateHandler,
	getWorkspaceHeartbeatStateReturns,
	getManagedGithubExecutionStateArgs,
	getManagedGithubExecutionStateHandler,
	getManagedGithubExecutionStateReturns,
	getWorkspaceProjectStateArgs,
	getWorkspaceProjectStateHandler,
	getWorkspaceProjectStateReturns,
	getWorkspaceRunHistoryArgs,
	getWorkspaceRunHistoryHandler,
	getWorkspaceRunHistoryReturns,
	getWorkspaceSyncPreviewStateArgs,
	getWorkspaceSyncPreviewStateHandler,
	getWorkspaceSyncPreviewStateReturns,
	getWorkspaceWorkerQueueStateArgs,
	getWorkspaceWorkerQueueStateHandler,
	getWorkspaceWorkerQueueStateReturns,
	getWorkspaceWorkflowRunByCredentialArgs,
	getWorkspaceWorkflowRunByCredentialHandler,
	getWorkspaceWorkflowRunByCredentialReturns,
	ingestWorkspaceRunnerEventArgs,
	ingestWorkspaceRunnerEventByCredentialArgs,
	ingestWorkspaceRunnerEventByCredentialHandler,
	ingestWorkspaceRunnerEventByCredentialReturns,
	ingestWorkspaceRunnerEventHandler,
	ingestWorkspaceRunnerEventReturns,
	listWorkspaceFindingsArgs,
	listWorkspaceFindingsHandler,
	listWorkspaceFindingsReturns,
	markWorkspaceFindingsDeletedArgs,
	markWorkspaceFindingsDeletedHandler,
	markWorkspaceFindingsDeletedReturns,
	markWorkspaceProjectDeletedArgs,
	markWorkspaceProjectDeletedHandler,
	markWorkspaceProjectDeletedReturns,
	pauseWorkspaceWorkflowRunArgs,
	pauseWorkspaceWorkflowRunHandler,
	pauseWorkspaceWorkflowRunReturns,
	prepareWorkspaceSetupPairingArgs,
	prepareWorkspaceSetupPairingHandler,
	prepareWorkspaceSetupPairingReturns,
	requestWorkspaceWorkflowRunArgs,
	requestWorkspaceWorkflowRunHandler,
	requestWorkspaceWorkflowRunReturns,
	requestManagedGithubExecutionConsentArgs,
	requestManagedGithubExecutionConsentHandler,
	requestManagedGithubExecutionConsentReturns,
	resumeWorkspaceWorkflowRunArgs,
	resumeWorkspaceWorkflowRunHandler,
	resumeWorkspaceWorkflowRunReturns,
	revokeWorkspaceRunnerArgs,
	revokeWorkspaceRunnerHandler,
	revokeWorkspaceRunnerReturns,
	revokeManagedGithubExecutionConsentArgs,
	revokeManagedGithubExecutionConsentHandler,
	revokeManagedGithubExecutionConsentReturns,
	startWorkspaceDoctorPassRunArgs,
	startWorkspaceDoctorPassRunByCredentialArgs,
	startWorkspaceDoctorPassRunByCredentialHandler,
	startWorkspaceDoctorPassRunByCredentialReturns,
	startWorkspaceDoctorPassRunHandler,
	startWorkspaceDoctorPassRunReturns,
	stopWorkspaceWorkflowRunArgs,
	stopWorkspaceWorkflowRunHandler,
	stopWorkspaceWorkflowRunReturns,
	syncApprovedCodebaseFindingsArgs,
	syncApprovedCodebaseFindingsByCredentialArgs,
	syncApprovedCodebaseFindingsByCredentialHandler,
	syncApprovedCodebaseFindingsByCredentialReturns,
	syncApprovedCodebaseFindingsHandler,
	syncApprovedCodebaseFindingsReturns,
	getWorkspaceSetupStateArgs,
	getWorkspaceSetupStateHandler,
	getWorkspaceSetupStateReturns,
} from "./workspace/model";

async function runAllowedSupportModeWrite<T>(
	ctx: Parameters<typeof appendSupportModeWriteSuccessAuditHandler>[0],
	actionId: string,
	write: () => Promise<T>,
) {
	await assertSupportModeWriteAllowedHandler(ctx, { actionId });
	const result = await write();
	await appendSupportModeWriteSuccessAuditHandler(ctx, { actionId });
	return result;
}

async function blockSupportModeOnly(
	ctx: Parameters<typeof recordBlockedSupportModeActionHandler>[0],
	actionId: string,
	blockReason:
		| "customer_repository_operation_blocked"
		| "destructive_action_blocked",
) {
	const auditResult = await recordBlockedSupportModeActionHandler(ctx, {
		actionId,
		blockReason,
		eventType: "write_attempted",
	});
	if (auditResult.kind === "not_impersonating") {
		return;
	}
	throw new ConvexError("Action unavailable during support mode.");
}

export const getWorkspaceProjectState = query({
	args: getWorkspaceProjectStateArgs,
	returns: getWorkspaceProjectStateReturns,
	handler: getWorkspaceProjectStateHandler,
});

export const getWorkspaceSetupState = query({
	args: getWorkspaceSetupStateArgs,
	returns: getWorkspaceSetupStateReturns,
	handler: getWorkspaceSetupStateHandler,
});

export const createOrLoadWorkspaceProject = mutation({
	args: createOrLoadWorkspaceProjectArgs,
	returns: createOrLoadWorkspaceProjectReturns,
	handler: async (ctx, args) =>
		runAllowedSupportModeWrite(ctx, "workspace.project.createOrLoad", () =>
			createOrLoadWorkspaceProjectHandler(ctx, args),
		),
});

export const prepareWorkspaceSetupPairing = mutation({
	args: prepareWorkspaceSetupPairingArgs,
	returns: prepareWorkspaceSetupPairingReturns,
	handler: async (ctx, args) =>
		runAllowedSupportModeWrite(ctx, "workspace.setup.preparePairing", () =>
			prepareWorkspaceSetupPairingHandler(ctx, args),
		),
});

export const cancelWorkspaceSetupPairing = mutation({
	args: cancelWorkspaceSetupPairingArgs,
	returns: cancelWorkspaceSetupPairingReturns,
	handler: async (ctx, args) =>
		runAllowedSupportModeWrite(ctx, "workspace.setup.cancelPairing", () =>
			cancelWorkspaceSetupPairingHandler(ctx, args),
		),
});

export const bindWorkspaceRunner = mutation({
	args: bindWorkspaceRunnerArgs,
	returns: bindWorkspaceRunnerReturns,
	handler: async (ctx, args) =>
		runAllowedSupportModeWrite(ctx, "workspace.runner.bind", () =>
			bindWorkspaceRunnerHandler(ctx, args),
		),
});

export const bindWorkspaceRunnerByPairingToken = mutation({
	args: bindWorkspaceRunnerByPairingTokenArgs,
	returns: bindWorkspaceRunnerByPairingTokenReturns,
	handler: bindWorkspaceRunnerByPairingTokenHandler,
});

export const bindWorkspaceRepository = mutation({
	args: bindWorkspaceRepositoryArgs,
	returns: bindWorkspaceRepositoryReturns,
	handler: async (ctx, args) =>
		runAllowedSupportModeWrite(ctx, "workspace.repository.bind", () =>
			bindWorkspaceRepositoryHandler(ctx, args),
		),
});

export const startWorkspaceDoctorPassRun = mutation({
	args: startWorkspaceDoctorPassRunArgs,
	returns: startWorkspaceDoctorPassRunReturns,
	handler: async (ctx, args) => {
		await blockSupportModeOnly(
			ctx,
			"workspace.doctorPass.startRun",
			"customer_repository_operation_blocked",
		);
		return startWorkspaceDoctorPassRunHandler(ctx, args);
	},
});

export const startWorkspaceDoctorPassRunByCredential = mutation({
	args: startWorkspaceDoctorPassRunByCredentialArgs,
	returns: startWorkspaceDoctorPassRunByCredentialReturns,
	handler: startWorkspaceDoctorPassRunByCredentialHandler,
});

export const requestWorkspaceWorkflowRun = mutation({
	args: requestWorkspaceWorkflowRunArgs,
	returns: requestWorkspaceWorkflowRunReturns,
	handler: async (ctx, args) => {
		await blockSupportModeOnly(
			ctx,
			"workspace.workflow.requestRun",
			"customer_repository_operation_blocked",
		);
		return requestWorkspaceWorkflowRunHandler(ctx, args);
	},
});

export const getWorkspaceWorkflowRunByCredential = query({
	args: getWorkspaceWorkflowRunByCredentialArgs,
	returns: getWorkspaceWorkflowRunByCredentialReturns,
	handler: getWorkspaceWorkflowRunByCredentialHandler,
});

export const claimWorkspaceWorkflowRunByCredential = mutation({
	args: claimWorkspaceWorkflowRunByCredentialArgs,
	returns: claimWorkspaceWorkflowRunByCredentialReturns,
	handler: claimWorkspaceWorkflowRunByCredentialHandler,
});

export const getWorkspaceWorkerQueueState = query({
	args: getWorkspaceWorkerQueueStateArgs,
	returns: getWorkspaceWorkerQueueStateReturns,
	handler: getWorkspaceWorkerQueueStateHandler,
});

export const pauseWorkspaceWorkflowRun = mutation({
	args: pauseWorkspaceWorkflowRunArgs,
	returns: pauseWorkspaceWorkflowRunReturns,
	handler: pauseWorkspaceWorkflowRunHandler,
});

export const resumeWorkspaceWorkflowRun = mutation({
	args: resumeWorkspaceWorkflowRunArgs,
	returns: resumeWorkspaceWorkflowRunReturns,
	handler: resumeWorkspaceWorkflowRunHandler,
});

export const stopWorkspaceWorkflowRun = mutation({
	args: stopWorkspaceWorkflowRunArgs,
	returns: stopWorkspaceWorkflowRunReturns,
	handler: stopWorkspaceWorkflowRunHandler,
});

export const ingestWorkspaceRunnerEvent = internalMutation({
	args: ingestWorkspaceRunnerEventArgs,
	returns: ingestWorkspaceRunnerEventReturns,
	handler: ingestWorkspaceRunnerEventHandler,
});

export const ingestWorkspaceRunnerEventByCredential = mutation({
	args: ingestWorkspaceRunnerEventByCredentialArgs,
	returns: ingestWorkspaceRunnerEventByCredentialReturns,
	handler: ingestWorkspaceRunnerEventByCredentialHandler,
});

export const approveWorkspaceSyncPreview = mutation({
	args: approveWorkspaceSyncPreviewArgs,
	returns: approveWorkspaceSyncPreviewReturns,
	handler: async (ctx, args) => {
		await blockSupportModeOnly(
			ctx,
			"workspace.syncPreview.approve",
			"customer_repository_operation_blocked",
		);
		return approveWorkspaceSyncPreviewHandler(ctx, args);
	},
});

export const syncApprovedCodebaseFindings = mutation({
	args: syncApprovedCodebaseFindingsArgs,
	returns: syncApprovedCodebaseFindingsReturns,
	handler: async (ctx, args) => {
		await blockSupportModeOnly(
			ctx,
			"workspace.findings.syncApproved",
			"customer_repository_operation_blocked",
		);
		return syncApprovedCodebaseFindingsHandler(ctx, args);
	},
});

export const syncApprovedCodebaseFindingsByCredential = mutation({
	args: syncApprovedCodebaseFindingsByCredentialArgs,
	returns: syncApprovedCodebaseFindingsByCredentialReturns,
	handler: syncApprovedCodebaseFindingsByCredentialHandler,
});

export const listWorkspaceFindings = query({
	args: listWorkspaceFindingsArgs,
	returns: listWorkspaceFindingsReturns,
	handler: listWorkspaceFindingsHandler,
});

export const getWorkspaceRunHistory = query({
	args: getWorkspaceRunHistoryArgs,
	returns: getWorkspaceRunHistoryReturns,
	handler: getWorkspaceRunHistoryHandler,
});

export const getWorkspaceHeartbeatState = query({
	args: getWorkspaceHeartbeatStateArgs,
	returns: getWorkspaceHeartbeatStateReturns,
	handler: getWorkspaceHeartbeatStateHandler,
});

export const getManagedGithubExecutionState = query({
	args: getManagedGithubExecutionStateArgs,
	returns: getManagedGithubExecutionStateReturns,
	handler: getManagedGithubExecutionStateHandler,
});

export const requestManagedGithubExecutionConsent = mutation({
	args: requestManagedGithubExecutionConsentArgs,
	returns: requestManagedGithubExecutionConsentReturns,
	handler: async (ctx, args) => {
		await blockSupportModeOnly(
			ctx,
			"workspace.managedGithub.requestConsent",
			"customer_repository_operation_blocked",
		);
		return requestManagedGithubExecutionConsentHandler(ctx, args);
	},
});

export const revokeManagedGithubExecutionConsent = mutation({
	args: revokeManagedGithubExecutionConsentArgs,
	returns: revokeManagedGithubExecutionConsentReturns,
	handler: async (ctx, args) => {
		await blockSupportModeOnly(
			ctx,
			"workspace.managedGithub.revokeConsent",
			"customer_repository_operation_blocked",
		);
		return revokeManagedGithubExecutionConsentHandler(ctx, args);
	},
});

export const getWorkspaceSyncPreviewState = query({
	args: getWorkspaceSyncPreviewStateArgs,
	returns: getWorkspaceSyncPreviewStateReturns,
	handler: getWorkspaceSyncPreviewStateHandler,
});

export const revokeWorkspaceRunner = mutation({
	args: revokeWorkspaceRunnerArgs,
	returns: revokeWorkspaceRunnerReturns,
	handler: async (ctx, args) => {
		await blockSupportModeOnly(
			ctx,
			"workspace.runner.revoke",
			"destructive_action_blocked",
		);
		return revokeWorkspaceRunnerHandler(ctx, args);
	},
});

export const markWorkspaceFindingsDeleted = mutation({
	args: markWorkspaceFindingsDeletedArgs,
	returns: markWorkspaceFindingsDeletedReturns,
	handler: async (ctx, args) => {
		await blockSupportModeOnly(
			ctx,
			"workspace.findings.markDeleted",
			"destructive_action_blocked",
		);
		return markWorkspaceFindingsDeletedHandler(ctx, args);
	},
});

export const markWorkspaceProjectDeleted = mutation({
	args: markWorkspaceProjectDeletedArgs,
	returns: markWorkspaceProjectDeletedReturns,
	handler: async (ctx, args) => {
		await blockSupportModeOnly(
			ctx,
			"workspace.project.markDeleted",
			"destructive_action_blocked",
		);
		return markWorkspaceProjectDeletedHandler(ctx, args);
	},
});
