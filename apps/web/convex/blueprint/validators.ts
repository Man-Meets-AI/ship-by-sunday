import { v } from "convex/values";

const projectDefinitionFactValueValidator = v.union(
	v.string(),
	v.number(),
	v.array(v.string()),
);

export const blueprintStageIdValidator = v.union(
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
		v.union(
			v.literal("domain"),
			v.literal("contact_email"),
			v.literal("support_email"),
		),
	),
	createdAt: v.number(),
	updatedAt: v.number(),
});

export const blueprintWorkflowStatePublicValidator = v.object({
	clerkUserId: v.string(),
	productKey: v.string(),
	executeShipUnlockedAt: v.optional(v.number()),
	createdAt: v.number(),
	updatedAt: v.number(),
});

const blueprintReadinessValidator = v.object({
	isReady: v.boolean(),
	missingFactKeys: v.array(v.string()),
});

export const blueprintStageStatusValidator = v.object({
	stageId: blueprintStageIdValidator,
	isUnlocked: v.boolean(),
	isComplete: v.boolean(),
	currentStepIndex: v.number(),
	missingFactKeys: v.array(v.string()),
});

export const blueprintWorkspaceStateValidator = v.object({
	projectDefinition: v.union(projectDefinitionPublicValidator, v.null()),
	workflowState: v.union(blueprintWorkflowStatePublicValidator, v.null()),
	firstIncompleteStageId: blueprintStageIdValidator,
	blueprintReadiness: v.object({
		product: blueprintReadinessValidator,
		design: blueprintReadinessValidator,
		marketing: blueprintReadinessValidator,
		build: blueprintReadinessValidator,
		review: blueprintReadinessValidator,
	}),
	stageStatuses: v.array(blueprintStageStatusValidator),
});

export const blueprintResumeDestinationValidator = v.object({
	destination: v.string(),
	kind: v.union(
		v.literal("blueprint_stage"),
		v.literal("review"),
		v.literal("post_review"),
	),
	blueprintStageId: v.union(blueprintStageIdValidator, v.null()),
	postReviewTargets: v.union(
		v.object({
			reviewDestination: v.string(),
			buildLessonsDestination: v.string(),
			launchLessonsDestination: v.string(),
			lessonMapDestination: v.string(),
			latestLessonDestination: v.string(),
		}),
		v.null(),
	),
});
