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
export {
	getBlockById,
	getCandidateProblemOptions,
	getLessonByArtifactKey,
	getLessonById,
	getOrderedBlocks,
	getStudentFacingLessons,
	getUnlockedBlockIds,
	getUnlockedLessonIds,
	getWorkbenchSections,
	isLessonImplemented,
} from "./registry/progression";
export { prepareFieldValuesForPersistence } from "./registry/persistence";
export {
	COURSE_SLUG,
	OBJECTIVE_CHECKLIST_FIELD_ID,
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
