import {
	blocks,
	lessonRegistry,
	type ArtifactType,
	type BlockConfig,
	type BlockId,
	type LessonConfig,
	type UploadFieldValue,
	type WorkbenchField,
} from "../../app/lessonRegistry";

export const COURSE_SLUG = "ship-by-sunday";

export const SUPPORTED_FIELD_KINDS = new Set<WorkbenchField["kind"]>([
	"text",
	"textarea",
	"url",
	"number",
	"toggle",
	"select",
	"image_upload",
	"video_upload",
	"table",
	"board",
	"checklist",
	"readonly",
]);

const LESSONS_BY_ID = new Map(lessonRegistry.map((lesson) => [lesson.id, lesson]));
const LESSONS_BY_ARTIFACT_KEY = new Map(
	lessonRegistry.map((lesson) => [lesson.artifact.key, lesson]),
);
const BLOCKS_BY_ID = new Map(blocks.map((block) => [block.id, block]));

export type PersistedFieldValue =
	| boolean
	| number
	| string
	| string[]
	| string[][]
	| UploadFieldValue
	| Record<string, unknown>
	| null;

export type PersistedFieldValues = Record<string, PersistedFieldValue>;

export function getOrderedLessons() {
	return [...lessonRegistry].sort((left, right) => left.order - right.order);
}

export function getOrderedBlocks() {
	return [...blocks].sort((left, right) => left.order - right.order);
}

export function getLessonById(lessonId: string) {
	return LESSONS_BY_ID.get(lessonId) ?? null;
}

export function getLessonByArtifactKey(artifactKey: string) {
	return LESSONS_BY_ARTIFACT_KEY.get(artifactKey) ?? null;
}

export function getBlockById(blockId: BlockId): BlockConfig | null {
	return BLOCKS_BY_ID.get(blockId) ?? null;
}

export function getUnlockedLessonIds(completedLessonIds: string[]) {
	const unlocked = new Set<string>(["0.0", "1.1"]);

	for (const lessonId of completedLessonIds) {
		const lesson = getLessonById(lessonId);
		if (!lesson) {
			continue;
		}

		for (const token of lesson.unlocks ?? []) {
			if (token.includes(".")) {
				unlocked.add(token);
			}
		}
	}

	return getOrderedLessons()
		.filter((lesson) => unlocked.has(lesson.id))
		.map((lesson) => lesson.id);
}

export function isLessonImplemented(lesson: LessonConfig) {
	return (
		lesson.workbenchFields?.every((field) =>
			SUPPORTED_FIELD_KINDS.has(field.kind),
		) ?? true
	);
}

export function getRequiredFields(lesson: LessonConfig) {
	return (lesson.workbenchFields ?? []).filter(
		(field) => field.required && field.kind !== "readonly",
	);
}

function isFilled(value: PersistedFieldValue | undefined) {
	if (typeof value === "string") {
		return value.trim().length > 0;
	}

	if (typeof value === "number") {
		return Number.isFinite(value);
	}

	if (typeof value === "boolean") {
		return value;
	}

	if (Array.isArray(value)) {
		return value.length > 0;
	}

	if (value && typeof value === "object") {
		return Object.keys(value).length > 0;
	}

	return false;
}

export function validateRequiredFields(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
) {
	return getRequiredFields(lesson).every((field) =>
		isFilled(fieldValues[field.id]),
	);
}

export function normalizeFieldValues(
	fieldValues: PersistedFieldValues | null | undefined,
) {
	return fieldValues ?? {};
}

export function buildArtifactPreview(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
) {
	const values = normalizeFieldValues(fieldValues);
	const nonEmptyEntries = Object.entries(values).filter(([, value]) =>
		isFilled(value),
	);

	return {
		artifactKey: lesson.artifact.key,
		artifactLabel: lesson.artifact.label,
		artifactType: lesson.artifact.type as ArtifactType,
		lessonId: lesson.id,
		lessonTitle: lesson.title,
		fields: nonEmptyEntries,
	};
}
