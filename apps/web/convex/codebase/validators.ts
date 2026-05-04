import { v } from "convex/values";

const projectDefinitionFactValueValidator = v.union(
	v.string(),
	v.number(),
	v.array(v.string()),
);

export const codebaseStageIdValidator = v.union(
	v.literal("codebase"),
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

export const codebaseWorkflowStatePublicValidator = v.object({
	clerkUserId: v.string(),
	productKey: v.string(),
	executeShipUnlockedAt: v.optional(v.number()),
	createdAt: v.number(),
	updatedAt: v.number(),
});

const codebaseReadinessValidator = v.object({
	isReady: v.boolean(),
	missingFactKeys: v.array(v.string()),
});

export const codebaseStageStatusValidator = v.object({
	stageId: codebaseStageIdValidator,
	isUnlocked: v.boolean(),
	isComplete: v.boolean(),
	currentStepIndex: v.number(),
	missingFactKeys: v.array(v.string()),
});

export const codebaseWorkspaceStateValidator = v.object({
	projectDefinition: v.union(projectDefinitionPublicValidator, v.null()),
	workflowState: v.union(codebaseWorkflowStatePublicValidator, v.null()),
	firstIncompleteStageId: codebaseStageIdValidator,
	codebaseReadiness: v.object({
		codebase: codebaseReadinessValidator,
		review: codebaseReadinessValidator,
	}),
	stageStatuses: v.array(codebaseStageStatusValidator),
});

export const codebaseResumeDestinationValidator = v.object({
	destination: v.string(),
	kind: v.union(
		v.literal("codebase_stage"),
		v.literal("review"),
		v.literal("post_review"),
	),
	codebaseStageId: v.union(codebaseStageIdValidator, v.null()),
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
