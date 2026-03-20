export { toPersistedReferenceGalleryValue } from "./reference-gallery";
export { buildResolvedArtifactPreview } from "./registry/artifacts";
export {
	getCompletionIssues,
	getObjectiveTasks,
	getWorkbenchSectionStates,
	isFilled,
} from "./registry/completion";
export {
	isLessonFieldShapeCompatible,
	normalizeLessonFieldValues,
} from "./registry/legacy";
export { prepareFieldValuesForPersistence } from "./registry/persistence";
export {
	getBlockById,
	getCandidateProblemOptions,
	getLessonByArtifactKey,
	getOrderedBlocks,
	getOrderedLessons,
	getUnlockedLessonKeys,
	getStudentFacingLessons,
	getUnlockedBlockIds,
	getUnlockedLessonIds,
	getWorkbenchSections,
	isLessonImplemented,
} from "./registry/progression";
export {
	type ArtifactPreview,
	type CandidateProblemOption,
	COURSE_SLUG,
	type CompletionIssue,
	isChecklistItemArray,
	isUploadFieldValue,
	isUploadFieldValueArray,
	normalizeFieldValues,
	OBJECTIVE_CHECKLIST_FIELD_ID,
	type ObjectiveTask,
	type PersistedFieldValue,
	type PersistedFieldValues,
	type WorkbenchSectionState,
} from "./registry/shared";
