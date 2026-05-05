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

export const startWorkspaceDoctorPassRunByCredential = mutation({
	args: startWorkspaceDoctorPassRunByCredentialArgs,
	returns: startWorkspaceDoctorPassRunByCredentialReturns,
	handler: startWorkspaceDoctorPassRunByCredentialHandler,
});

export const requestWorkspaceWorkflowRun = mutation({
	args: requestWorkspaceWorkflowRunArgs,
	returns: requestWorkspaceWorkflowRunReturns,
	handler: requestWorkspaceWorkflowRunHandler,
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
	handler: approveWorkspaceSyncPreviewHandler,
});

export const syncApprovedCodebaseFindings = mutation({
	args: syncApprovedCodebaseFindingsArgs,
	returns: syncApprovedCodebaseFindingsReturns,
	handler: syncApprovedCodebaseFindingsHandler,
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
	handler: requestManagedGithubExecutionConsentHandler,
});

export const revokeManagedGithubExecutionConsent = mutation({
	args: revokeManagedGithubExecutionConsentArgs,
	returns: revokeManagedGithubExecutionConsentReturns,
	handler: revokeManagedGithubExecutionConsentHandler,
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
