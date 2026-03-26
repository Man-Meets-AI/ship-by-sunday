import { v } from "convex/values";

const projectDefinitionFactValueValidator = v.union(
	v.string(),
	v.number(),
	v.array(v.string()),
);

export const packetStageIdValidator = v.union(
	v.literal("start"),
	v.literal("product"),
	v.literal("design"),
	v.literal("marketing"),
	v.literal("build-plan"),
	v.literal("review"),
);

export const projectDefinitionFactsValidator = v.record(
	v.string(),
	projectDefinitionFactValueValidator,
);

export const projectDefinitionPublicValidator = v.object({
	clerkUserId: v.string(),
	productKey: v.string(),
	schemaVersion: v.number(),
	facts: projectDefinitionFactsValidator,
	placeholdersInUse: v.array(
		v.union(v.literal("domain"), v.literal("support_email")),
	),
	createdAt: v.number(),
	updatedAt: v.number(),
});

export const packetWorkflowStatePublicValidator = v.object({
	clerkUserId: v.string(),
	productKey: v.string(),
	executeShipUnlockedAt: v.optional(v.number()),
	createdAt: v.number(),
	updatedAt: v.number(),
});

const packetReadinessValidator = v.object({
	isReady: v.boolean(),
	missingFactKeys: v.array(v.string()),
});

export const packetStageStatusValidator = v.object({
	stageId: packetStageIdValidator,
	isUnlocked: v.boolean(),
	isComplete: v.boolean(),
	currentStepIndex: v.number(),
	missingFactKeys: v.array(v.string()),
});

export const packetWorkspaceStateValidator = v.object({
	projectDefinition: v.union(projectDefinitionPublicValidator, v.null()),
	workflowState: v.union(packetWorkflowStatePublicValidator, v.null()),
	firstIncompleteStageId: packetStageIdValidator,
	packetReadiness: v.object({
		product: packetReadinessValidator,
		design: packetReadinessValidator,
		marketing: packetReadinessValidator,
		build: packetReadinessValidator,
		review: packetReadinessValidator,
	}),
	stageStatuses: v.array(packetStageStatusValidator),
});

export const packetResumeDestinationValidator = v.object({
	destination: v.string(),
	stageId: packetStageIdValidator,
});
