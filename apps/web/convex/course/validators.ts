import { v } from "convex/values";

export const blockIdValidator = v.union(
	v.literal("CEO"),
	v.literal("DESIGN"),
	v.literal("BUILD"),
	v.literal("SHIP"),
);

export const artifactTypeValidator = v.union(
	v.literal("text"),
	v.literal("table"),
	v.literal("board"),
	v.literal("image"),
	v.literal("images"),
	v.literal("video"),
	v.literal("checklist"),
	v.literal("brief"),
	v.literal("link"),
	v.literal("mixed"),
);

const scalarFieldValueValidator = v.union(
	v.boolean(),
	v.number(),
	v.string(),
	v.null(),
);
const checklistItemValueValidator = v.object({
	label: v.string(),
	checked: v.boolean(),
});
const uploadFieldValueValidator = v.object({
	kind: v.literal("upload"),
	status: v.union(
		v.literal("empty"),
		v.literal("selected"),
		v.literal("stored"),
	),
	fileName: v.optional(v.string()),
	mimeType: v.optional(v.string()),
	size: v.optional(v.number()),
	storageId: v.optional(v.id("_storage")),
	url: v.optional(v.string()),
	previewUrl: v.optional(v.string()),
});
const referenceGalleryItemValidator = v.object({
	id: v.string(),
	source: v.union(v.literal("upload"), v.literal("remote_url")),
	url: v.optional(v.string()),
	previewUrl: v.optional(v.string()),
	fileName: v.optional(v.string()),
	mimeType: v.optional(v.string()),
	size: v.optional(v.number()),
	storageId: v.optional(v.id("_storage")),
});
const referenceGalleryValueValidator = v.object({
	kind: v.literal("reference_gallery"),
	items: v.array(referenceGalleryItemValidator),
});
const persistedFieldValueValidator = v.union(
	scalarFieldValueValidator,
	v.array(v.string()),
	v.array(v.array(v.string())),
	v.array(checklistItemValueValidator),
	referenceGalleryValueValidator,
	uploadFieldValueValidator,
	v.array(uploadFieldValueValidator),
);

export const fieldValuesValidator = v.record(
	v.string(),
	persistedFieldValueValidator,
);
export const completionStatusValidator = v.union(
	v.literal("not_started"),
	v.literal("in_progress"),
	v.literal("completed"),
);
export const missionLessonStatusValidator = v.union(
	v.literal("locked"),
	v.literal("available"),
	v.literal("in_progress"),
	v.literal("completed"),
);
export const starterRepoAccessProvisioningStatusValidator = v.union(
	v.literal("requested"),
	v.literal("invited"),
	v.literal("accepted"),
	v.literal("failed"),
);

const artifactPreviewFields = {
	artifactKey: v.string(),
	artifactLabel: v.string(),
	contextTitle: v.optional(v.string()),
	artifactType: artifactTypeValidator,
	lessonKey: v.string(),
	lessonId: v.string(),
	lessonTitle: v.string(),
	fieldValues: fieldValuesValidator,
	fields: v.array(v.array(persistedFieldValueValidator)),
};

export const artifactPreviewValidator = v.object(artifactPreviewFields);
export const completedArtifactPreviewValidator = v.object({
	...artifactPreviewFields,
	completedAt: v.number(),
});

export const resumeDestinationReturnValidator = v.object({
	destination: v.string(),
	lessonKey: v.union(v.string(), v.null()),
});

export const starterRepoAccessPublicValidator = v.object({
	githubUsername: v.string(),
	status: starterRepoAccessProvisioningStatusValidator,
	requestedAt: v.number(),
	updatedAt: v.number(),
	invitedAt: v.optional(v.number()),
	acceptedAt: v.optional(v.number()),
	lastError: v.optional(v.string()),
});

export const starterRepoAccessOperatorItemValidator = v.object({
	clerkUserId: v.string(),
	courseSlug: v.string(),
	githubUsername: v.string(),
	status: starterRepoAccessProvisioningStatusValidator,
	requestedAt: v.number(),
	updatedAt: v.number(),
	invitedAt: v.optional(v.number()),
	acceptedAt: v.optional(v.number()),
	invitationId: v.optional(v.string()),
	lastError: v.optional(v.string()),
});

export const missionLessonValidator = v.object({
	lessonKey: v.string(),
	id: v.string(),
	displayLabel: v.string(),
	title: v.string(),
	shortTitle: v.string(),
	block: blockIdValidator,
	order: v.number(),
	status: missionLessonStatusValidator,
	isImplemented: v.boolean(),
	artifactLabel: v.string(),
});

export const missionBlockValidator = v.object({
	id: blockIdValidator,
	label: v.string(),
	order: v.number(),
	completedCount: v.number(),
	availableCount: v.number(),
	totalLessons: v.number(),
	lessons: v.array(missionLessonValidator),
});

export const missionStateReturnValidator = v.object({
	courseSlug: v.string(),
	progressCount: v.number(),
	totalLessons: v.number(),
	blocks: v.array(missionBlockValidator),
	unlockedLessonKeys: v.array(v.string()),
});

export const unlockedLessonStateValidator = v.object({
	accessStatus: v.literal("unlocked"),
	fieldValues: fieldValuesValidator,
	status: completionStatusValidator,
	pinnedArtifacts: v.array(artifactPreviewValidator),
});

export const lessonStateReturnValidator = v.union(
	v.object({
		accessStatus: v.literal("locked"),
	}),
	unlockedLessonStateValidator,
);
