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
	storageId: v.optional(v.string()),
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
	storageId: v.optional(v.string()),
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
export const entitlementStatusValidator = v.union(
	v.literal("active"),
	v.literal("pending"),
	v.literal("revoked"),
	v.literal("refunded"),
);
export const entitlementSourceValidator = v.union(
	v.literal("manual"),
	v.literal("stripe_checkout"),
	v.literal("stripe_webhook"),
);
export const entitlementGrantOutcomeValidator = v.union(
	v.literal("inserted"),
	v.literal("patched"),
);

const artifactPreviewFields = {
	artifactKey: v.string(),
	artifactLabel: v.string(),
	contextTitle: v.optional(v.string()),
	artifactType: artifactTypeValidator,
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

export const viewerAccessReturnValidator = v.object({
	clerkUserId: v.union(v.string(), v.null()),
	courseSlug: v.string(),
	hasAccess: v.boolean(),
	status: v.union(
		v.literal("signed_out"),
		v.literal("none"),
		entitlementStatusValidator,
	),
});

export const resumeDestinationReturnValidator = v.object({
	destination: v.string(),
	lessonId: v.union(v.string(), v.null()),
});

export const entitlementGrantResultValidator = v.object({
	courseSlug: v.string(),
	granted: entitlementGrantOutcomeValidator,
});

export const entitlementDocumentValidator = v.object({
	_id: v.id("courseEntitlements"),
	_creationTime: v.number(),
	clerkUserId: v.string(),
	courseSlug: v.string(),
	status: entitlementStatusValidator,
	source: entitlementSourceValidator,
	stripeCustomerId: v.optional(v.string()),
	stripeCheckoutSessionId: v.optional(v.string()),
	stripePaymentIntentId: v.optional(v.string()),
	grantedAt: v.number(),
	updatedAt: v.number(),
	revokedAt: v.optional(v.number()),
});

export const entitlementDebugReturnValidator = v.union(
	entitlementDocumentValidator,
	v.null(),
);

export const missionLessonValidator = v.object({
	id: v.string(),
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
	unlockedLessonIds: v.array(v.string()),
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
