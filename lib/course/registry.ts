import {
	blocks,
	lessonRegistry,
	type ArtifactType,
	type BlockConfig,
	type BlockId,
	type ChecklistItemValue,
	type LessonConfig,
	type UploadFieldValue,
	type WorkbenchField,
} from "./manifest";

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

const LESSONS_BY_ID = new Map(
	lessonRegistry.map((lesson) => [lesson.id, lesson]),
);
const LESSONS_BY_ARTIFACT_KEY = new Map(
	lessonRegistry.map((lesson) => [lesson.artifact.key, lesson]),
);
const BLOCKS_BY_ID = new Map(blocks.map((block) => [block.id, block]));
export const PRIVATE_FIELD_PREFIX = "__";
export const OBJECTIVE_CHECKLIST_FIELD_ID = `${PRIVATE_FIELD_PREFIX}objectiveChecklist`;

export type CompletionIssue = {
	id: string;
	label: string;
	kind: "field" | "objective";
};

export type PersistedFieldValue =
	| boolean
	| number
	| string
	| string[]
	| string[][]
	| ChecklistItemValue[]
	| UploadFieldValue
	| Record<string, unknown>
	| null;

export type PersistedFieldValues = Record<string, PersistedFieldValue>;

export function isUploadFieldValue(value: unknown): value is UploadFieldValue {
	return (
		value !== null &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		"kind" in value &&
		(value as { kind?: string }).kind === "upload"
	);
}

export function isChecklistItemArray(
	value: unknown,
): value is ChecklistItemValue[] {
	return (
		Array.isArray(value) &&
		value.every(
			(item) =>
				Boolean(item) &&
				typeof item === "object" &&
				!Array.isArray(item) &&
				typeof (item as { label?: unknown }).label === "string" &&
				typeof (item as { checked?: unknown }).checked === "boolean",
		)
	);
}

export function getOrderedLessons() {
	return [...lessonRegistry].sort((left, right) => left.order - right.order);
}

export function isStudentFacingLesson(lesson: LessonConfig) {
	return lesson.id !== "0.0";
}

export function getStudentFacingLessons() {
	return getOrderedLessons().filter(isStudentFacingLesson);
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
	const unlocked = new Set<string>(["0.0", "0.1"]);

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
	if (isChecklistItemArray(value)) {
		return value.some((item) => item.checked);
	}

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
	return getCompletionIssues(lesson, fieldValues).length === 0;
}

export function getCompletionIssues(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
) {
	const issues: CompletionIssue[] = [];

	for (const field of getRequiredFields(lesson)) {
		const value = fieldValues[field.id];

		if (field.kind === "checklist") {
			const checklistIsComplete =
				isChecklistItemArray(value) &&
				value.length > 0 &&
				value.every((item) => item.checked);

			if (!checklistIsComplete) {
				issues.push({
					id: field.id,
					label: field.label,
					kind: "field",
				});
			}
			continue;
		}

		if (!isFilled(value)) {
			issues.push({
				id: field.id,
				label: field.label,
				kind: "field",
			});
		}
	}

	const objectiveValue = fieldValues[OBJECTIVE_CHECKLIST_FIELD_ID];
	const objectiveItems = lesson.checklist.map((label) => {
		const existing = isChecklistItemArray(objectiveValue)
			? objectiveValue.find((item) => item.label === label)
			: undefined;

		return {
			label,
			checked: existing?.checked ?? false,
		};
	});

	for (const item of objectiveItems.filter((item) => !item.checked)) {
		issues.push({
			id: OBJECTIVE_CHECKLIST_FIELD_ID,
			label: item.label,
			kind: "objective",
		});
	}

	return issues;
}

export function normalizeFieldValues(
	fieldValues: PersistedFieldValues | null | undefined,
) {
	return fieldValues ?? {};
}

export function prepareFieldValuesForPersistence(
	fieldValues: PersistedFieldValues,
) {
	return Object.fromEntries(
		Object.entries(fieldValues).map(([fieldId, value]) => {
			if (!isUploadFieldValue(value)) {
				return [fieldId, value];
			}

			return [
				fieldId,
				{
					kind: "upload",
					status: value.storageId ? "stored" : value.status,
					fileName: value.fileName,
					mimeType: value.mimeType,
					size: value.size,
					storageId: value.storageId,
				} satisfies UploadFieldValue,
			];
		}),
	) as PersistedFieldValues;
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
		fields: nonEmptyEntries.filter(
			([fieldId]) => !fieldId.startsWith(PRIVATE_FIELD_PREFIX),
		),
	};
}
