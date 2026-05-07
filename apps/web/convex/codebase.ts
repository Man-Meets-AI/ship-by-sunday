import { internalMutation, mutation, query } from "./_generated/server";
import {
	appendSupportModeWriteSuccessAuditHandler,
	assertSupportModeWriteAllowedHandler,
} from "./impersonation/model";
import {
	getProjectDefinitionArgs,
	getProjectDefinitionHandler,
	getProjectDefinitionReturns,
	resetProjectDefinitionForQaArgs,
	resetProjectDefinitionForQaHandler,
	resetProjectDefinitionForQaReturns,
	saveProjectDefinitionFactsArgs,
	saveProjectDefinitionFactsHandler,
	saveProjectDefinitionFactsReturns,
	seedCompleteProjectDefinitionForQaArgs,
	seedCompleteProjectDefinitionForQaHandler,
	seedCompleteProjectDefinitionForQaReturns,
} from "./codebase/projectDefinition";
import {
	getCodebaseResumeDestinationArgs,
	getCodebaseResumeDestinationHandler,
	getCodebaseResumeDestinationReturns,
	getCodebaseWorkspaceStateArgs,
	getCodebaseWorkspaceStateHandler,
	getCodebaseWorkspaceStateReturns,
} from "./codebase/stageReadiness";
import {
	unlockExecuteShipArgs,
	unlockExecuteShipHandler,
	unlockExecuteShipReturns,
} from "./codebase/workflowState";

export const getProjectDefinition = query({
	args: getProjectDefinitionArgs,
	returns: getProjectDefinitionReturns,
	handler: getProjectDefinitionHandler,
});

export const saveProjectDefinitionFacts = mutation({
	args: saveProjectDefinitionFactsArgs,
	returns: saveProjectDefinitionFactsReturns,
	handler: async (ctx, args) => {
		const actionId = "codebase.projectDefinition.saveFacts";
		await assertSupportModeWriteAllowedHandler(ctx, { actionId });
		const result = await saveProjectDefinitionFactsHandler(ctx, args);
		await appendSupportModeWriteSuccessAuditHandler(ctx, { actionId });
		return result;
	},
});

export const seedCompleteProjectDefinitionForQa = internalMutation({
	args: seedCompleteProjectDefinitionForQaArgs,
	returns: seedCompleteProjectDefinitionForQaReturns,
	handler: seedCompleteProjectDefinitionForQaHandler,
});

export const resetProjectDefinitionForQa = internalMutation({
	args: resetProjectDefinitionForQaArgs,
	returns: resetProjectDefinitionForQaReturns,
	handler: resetProjectDefinitionForQaHandler,
});

export const unlockExecuteShip = mutation({
	args: unlockExecuteShipArgs,
	returns: unlockExecuteShipReturns,
	handler: async (ctx) => {
		const actionId = "codebase.workflow.unlockExecuteShip";
		await assertSupportModeWriteAllowedHandler(ctx, { actionId });
		const result = await unlockExecuteShipHandler(ctx);
		await appendSupportModeWriteSuccessAuditHandler(ctx, { actionId });
		return result;
	},
});

export const getCodebaseWorkspaceState = query({
	args: getCodebaseWorkspaceStateArgs,
	returns: getCodebaseWorkspaceStateReturns,
	handler: getCodebaseWorkspaceStateHandler,
});

export const getCodebaseResumeDestination = query({
	args: getCodebaseResumeDestinationArgs,
	returns: getCodebaseResumeDestinationReturns,
	handler: getCodebaseResumeDestinationHandler,
});
