export {
	getReferenceGalleryCount,
	getReferenceGalleryItems,
	getReferenceGallerySummary,
	isReferenceGalleryValue,
	toPersistedReferenceGalleryValue,
} from "./reference-gallery";
export {
	buildArtifactPreview,
	buildResolvedArtifactPreview,
} from "./registry/artifacts";
export {
	getCompletionIssues,
	getObjectiveTasks,
	getWorkbenchSectionStates,
	isFilled,
	validateRequiredFields,
} from "./registry/completion";
export {
	isLessonFieldShapeCompatible,
	normalizeLessonFieldValues,
} from "./registry/legacy";
export {
	getBlockById,
	getCandidateProblemOptions,
	getFieldShapeVersion,
	getLessonByArtifactKey,
	getLessonById,
	getObjectiveMode,
	getOrderedBlocks,
	getOrderedLessons,
	getRequiredFields,
	getStudentFacingLessons,
	getUnlockedBlockIds,
	getUnlockedLessonIds,
	getWorkbenchSections,
	isLessonImplemented,
	isStudentFacingLesson,
} from "./registry/progression";
export { prepareFieldValuesForPersistence } from "./registry/persistence";
export {
	COURSE_SLUG,
	FIELD_SHAPE_VERSION_FIELD_ID,
	OBJECTIVE_CHECKLIST_FIELD_ID,
	PRIVATE_FIELD_PREFIX,
	SUPPORTED_FIELD_KINDS,
	isChecklistItemArray,
	isUploadFieldValue,
	isUploadFieldValueArray,
	normalizeFieldValues,
	type ArtifactPreview,
	type CandidateProblemOption,
	type CompletionIssue,
	type ObjectiveTask,
	type PersistedFieldValue,
	type PersistedFieldValues,
	type WorkbenchSectionState,
} from "./registry/shared";
