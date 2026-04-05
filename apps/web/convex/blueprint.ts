import { internalMutation, mutation, query } from "./_generated/server";
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
} from "./blueprint/projectDefinition";
import {
	getBlueprintResumeDestinationArgs,
	getBlueprintResumeDestinationHandler,
	getBlueprintResumeDestinationReturns,
	getBlueprintWorkspaceStateArgs,
	getBlueprintWorkspaceStateHandler,
	getBlueprintWorkspaceStateReturns,
} from "./blueprint/stageReadiness";
import {
	unlockExecuteShipArgs,
	unlockExecuteShipHandler,
	unlockExecuteShipReturns,
} from "./blueprint/workflowState";

export const getProjectDefinition = query({
	args: getProjectDefinitionArgs,
	returns: getProjectDefinitionReturns,
	handler: getProjectDefinitionHandler,
});

export const saveProjectDefinitionFacts = mutation({
	args: saveProjectDefinitionFactsArgs,
	returns: saveProjectDefinitionFactsReturns,
	handler: saveProjectDefinitionFactsHandler,
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
	handler: unlockExecuteShipHandler,
});

export const getBlueprintWorkspaceState = query({
	args: getBlueprintWorkspaceStateArgs,
	returns: getBlueprintWorkspaceStateReturns,
	handler: getBlueprintWorkspaceStateHandler,
});

export const getBlueprintResumeDestination = query({
	args: getBlueprintResumeDestinationArgs,
	returns: getBlueprintResumeDestinationReturns,
	handler: getBlueprintResumeDestinationHandler,
});
