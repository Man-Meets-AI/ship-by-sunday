import { internalMutation, mutation, query } from "./_generated/server";
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
	cancelWorkspaceSetupPairingArgs,
	cancelWorkspaceSetupPairingHandler,
	cancelWorkspaceSetupPairingReturns,
	createOrLoadWorkspaceProjectArgs,
	createOrLoadWorkspaceProjectHandler,
	createOrLoadWorkspaceProjectReturns,
	getWorkspaceHeartbeatStateArgs,
	getWorkspaceHeartbeatStateHandler,
	getWorkspaceHeartbeatStateReturns,
	getWorkspaceProjectStateArgs,
	getWorkspaceProjectStateHandler,
	getWorkspaceProjectStateReturns,
	getWorkspaceRunHistoryArgs,
	getWorkspaceRunHistoryHandler,
	getWorkspaceRunHistoryReturns,
	getWorkspaceSyncPreviewStateArgs,
	getWorkspaceSyncPreviewStateHandler,
	getWorkspaceSyncPreviewStateReturns,
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
	prepareWorkspaceSetupPairingArgs,
	prepareWorkspaceSetupPairingHandler,
	prepareWorkspaceSetupPairingReturns,
	requestWorkspaceWorkflowRunArgs,
	requestWorkspaceWorkflowRunHandler,
	requestWorkspaceWorkflowRunReturns,
	revokeWorkspaceRunnerArgs,
	revokeWorkspaceRunnerHandler,
	revokeWorkspaceRunnerReturns,
	startWorkspaceDoctorPassRunArgs,
	startWorkspaceDoctorPassRunHandler,
	startWorkspaceDoctorPassRunReturns,
	syncApprovedCodebaseFindingsArgs,
	syncApprovedCodebaseFindingsHandler,
	syncApprovedCodebaseFindingsReturns,
	getWorkspaceSetupStateArgs,
	getWorkspaceSetupStateHandler,
	getWorkspaceSetupStateReturns,
} from "./workspace/model";

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
	handler: createOrLoadWorkspaceProjectHandler,
});

export const prepareWorkspaceSetupPairing = mutation({
	args: prepareWorkspaceSetupPairingArgs,
	returns: prepareWorkspaceSetupPairingReturns,
	handler: prepareWorkspaceSetupPairingHandler,
});

export const cancelWorkspaceSetupPairing = mutation({
	args: cancelWorkspaceSetupPairingArgs,
	returns: cancelWorkspaceSetupPairingReturns,
	handler: cancelWorkspaceSetupPairingHandler,
});

export const bindWorkspaceRunner = mutation({
	args: bindWorkspaceRunnerArgs,
	returns: bindWorkspaceRunnerReturns,
	handler: bindWorkspaceRunnerHandler,
});

export const bindWorkspaceRunnerByPairingToken = mutation({
	args: bindWorkspaceRunnerByPairingTokenArgs,
	returns: bindWorkspaceRunnerByPairingTokenReturns,
	handler: bindWorkspaceRunnerByPairingTokenHandler,
});

export const bindWorkspaceRepository = mutation({
	args: bindWorkspaceRepositoryArgs,
	returns: bindWorkspaceRepositoryReturns,
	handler: bindWorkspaceRepositoryHandler,
});

export const startWorkspaceDoctorPassRun = mutation({
	args: startWorkspaceDoctorPassRunArgs,
	returns: startWorkspaceDoctorPassRunReturns,
	handler: startWorkspaceDoctorPassRunHandler,
});

export const requestWorkspaceWorkflowRun = mutation({
	args: requestWorkspaceWorkflowRunArgs,
	returns: requestWorkspaceWorkflowRunReturns,
	handler: requestWorkspaceWorkflowRunHandler,
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
	handler: approveWorkspaceSyncPreviewHandler,
});

export const syncApprovedCodebaseFindings = mutation({
	args: syncApprovedCodebaseFindingsArgs,
	returns: syncApprovedCodebaseFindingsReturns,
	handler: syncApprovedCodebaseFindingsHandler,
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

export const getWorkspaceSyncPreviewState = query({
	args: getWorkspaceSyncPreviewStateArgs,
	returns: getWorkspaceSyncPreviewStateReturns,
	handler: getWorkspaceSyncPreviewStateHandler,
});

export const revokeWorkspaceRunner = mutation({
	args: revokeWorkspaceRunnerArgs,
	returns: revokeWorkspaceRunnerReturns,
	handler: revokeWorkspaceRunnerHandler,
});

export const markWorkspaceFindingsDeleted = mutation({
	args: markWorkspaceFindingsDeletedArgs,
	returns: markWorkspaceFindingsDeletedReturns,
	handler: markWorkspaceFindingsDeletedHandler,
});

export const markWorkspaceProjectDeleted = mutation({
	args: markWorkspaceProjectDeletedArgs,
	returns: markWorkspaceProjectDeletedReturns,
	handler: markWorkspaceProjectDeletedHandler,
});
