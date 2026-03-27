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
} from "./packet/projectDefinition";
import {
	getPacketResumeDestinationArgs,
	getPacketResumeDestinationHandler,
	getPacketResumeDestinationReturns,
	getPacketWorkspaceStateArgs,
	getPacketWorkspaceStateHandler,
	getPacketWorkspaceStateReturns,
} from "./packet/stageReadiness";
import {
	unlockExecuteShipArgs,
	unlockExecuteShipHandler,
	unlockExecuteShipReturns,
} from "./packet/workflowState";

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

export const getPacketWorkspaceState = query({
	args: getPacketWorkspaceStateArgs,
	returns: getPacketWorkspaceStateReturns,
	handler: getPacketWorkspaceStateHandler,
});

export const getPacketResumeDestination = query({
	args: getPacketResumeDestinationArgs,
	returns: getPacketResumeDestinationReturns,
	handler: getPacketResumeDestinationHandler,
});
