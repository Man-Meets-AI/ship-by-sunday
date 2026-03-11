import {
	blocks,
	lessonRegistry,
	type ArtifactType,
	type BlockConfig,
	type BlockId,
	type ChecklistItemValue,
	type LessonConfig,
	type LessonHandoff,
	type ObjectiveMode,
	type ObjectiveTaskDefinition,
	type UploadFieldValue,
	type WorkbenchField,
	type WorkbenchSection,
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
export const FIELD_SHAPE_VERSION_FIELD_ID = `${PRIVATE_FIELD_PREFIX}fieldShapeVersion`;

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

export type WorkbenchSectionState = {
	id: string;
	title: string;
	completionLabel: string;
	totalRequiredFields: number;
	completedRequiredFields: number;
	isComplete: boolean;
	incompleteFieldIds: string[];
};

export type ObjectiveTask = {
	id: string;
	label: string;
	status: "complete" | "incomplete";
	source: "field" | "checklist_option" | "manual" | "handoff";
	fieldId?: string;
	sectionId?: string;
	sectionTitle?: string;
	interactive: boolean;
};

export type CandidateProblemOption = {
	index: number;
	owner: string;
	statement: string;
};

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

export function getFieldShapeVersion(lesson: LessonConfig) {
	return lesson.fieldShapeVersion ?? 1;
}

export function getObjectiveMode(lesson: LessonConfig): ObjectiveMode {
	if (lesson.objectiveMode) {
		return lesson.objectiveMode;
	}

	if (lesson.workbench === "roadmap_overview") {
		return "manual";
	}

	return "generated";
}

export function getWorkbenchSections(lesson: LessonConfig): WorkbenchSection[] {
	if (lesson.workbenchSections && lesson.workbenchSections.length > 0) {
		return lesson.workbenchSections;
	}

	const interactiveFieldIds = (lesson.workbenchFields ?? [])
		.filter((field) => field.kind !== "readonly")
		.map((field) => field.id);

	if (interactiveFieldIds.length === 0) {
		return [];
	}

	return [
		{
			id: "main",
			title: lesson.artifact.label,
			layout: "stack",
			fieldIds: interactiveFieldIds,
			completionLabel: lesson.winCondition,
		},
	];
}

function normalizeTaskLabel(label: string) {
	return label.replace(/[?.:]$/, "").trim();
}

function getFieldTaskLabel(field: WorkbenchField) {
	return field.taskLabel ?? field.artifactPreviewLabel ?? normalizeTaskLabel(field.label);
}

function normalizeLegacyChecklistItems(
	value: unknown,
	definitions: ObjectiveTaskDefinition[],
) {
	if (isChecklistItemArray(value)) {
		return definitions.map((definition) => {
			const existing = value.find((item) => item.label === definition.label);
			return {
				label: definition.label,
				checked: existing?.checked ?? false,
			};
		});
	}

	return definitions.map((definition) => ({
		label: definition.label,
		checked: false,
	}));
}

function getManualObjectiveTaskDefinitions(
	lesson: LessonConfig,
): ObjectiveTaskDefinition[] {
	if (lesson.objectiveTasks && lesson.objectiveTasks.length > 0) {
		return lesson.objectiveTasks;
	}

	return lesson.checklist.map((label) => ({ label }));
}

function getHandoffPersistedFieldIds(handoff: LessonHandoff | undefined) {
	if (!handoff || !handoff.persistToArtifact) {
		return [];
	}

	if (handoff.mode === "select_candidate_problem") {
		return [
			handoff.selectionFieldId,
			"selected_problem_owner",
			"selected_problem_statement",
		];
	}

	return [handoff.selectionFieldId];
}

export function getCandidateProblemOptions(
	fieldValues: PersistedFieldValues | null | undefined,
): CandidateProblemOption[] {
	const values = normalizeFieldValues(fieldValues);
	const indexes = Array.from(
		new Set(
			Object.keys(values)
				.map((fieldId) => {
					const match = fieldId.match(/^problem_(\d+)_(who|pain)$/);
					return match ? Number(match[1]) : null;
				})
				.filter((index): index is number => Number.isFinite(index)),
		),
	).sort((left, right) => left - right);

	return indexes
		.map((index) => {
			const owner = values[`problem_${index}_who`];
			const statement = values[`problem_${index}_pain`];

			if (typeof owner !== "string" || typeof statement !== "string") {
				return null;
			}

			if (!owner.trim() || !statement.trim()) {
				return null;
			}

			return {
				index,
				owner: owner.trim(),
				statement: statement.trim(),
			} satisfies CandidateProblemOption;
		})
		.filter((option): option is CandidateProblemOption => Boolean(option));
}

export function isLessonFieldShapeCompatible(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues | null | undefined,
) {
	const values = normalizeFieldValues(fieldValues);
	const expectedVersion = getFieldShapeVersion(lesson);
	const storedVersion = values[FIELD_SHAPE_VERSION_FIELD_ID];
	const knownFieldIds = new Set(
		[
			...(lesson.workbenchFields ?? []).map((field) => field.id),
			...getHandoffPersistedFieldIds(lesson.handoff),
		],
	);
	const nonPrivateFieldIds = Object.keys(values).filter(
		(fieldId) => !fieldId.startsWith(PRIVATE_FIELD_PREFIX),
	);

	if (expectedVersion === 1) {
		return storedVersion === undefined || storedVersion === expectedVersion;
	}

	if (storedVersion === undefined && lesson.handoff) {
		return false;
	}

	if (
		storedVersion === undefined &&
		nonPrivateFieldIds.every((fieldId) => knownFieldIds.has(fieldId))
	) {
		return true;
	}

	return storedVersion === expectedVersion;
}

export function isFilled(value: PersistedFieldValue | undefined) {
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

export function getObjectiveTasks(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
): ObjectiveTask[] {
	const values = normalizeLessonFieldValues(lesson, fieldValues);
	const objectiveMode = getObjectiveMode(lesson);

	if (objectiveMode === "manual") {
		const definitions = getManualObjectiveTaskDefinitions(lesson);
		const manualItems = normalizeLegacyChecklistItems(
			values[OBJECTIVE_CHECKLIST_FIELD_ID],
			definitions,
		);

		return definitions.map((definition, index) => ({
			id: definition.id ?? definition.label,
			label: definition.label,
			status: manualItems[index]?.checked ? "complete" : "incomplete",
			source: "manual",
			interactive: true,
		} satisfies ObjectiveTask));
	}

	const fieldsById = new Map(
		(lesson.workbenchFields ?? []).map((field) => [field.id, field]),
	);
	const sectionByFieldId = new Map<
		string,
		{ sectionId: string; sectionTitle: string }
	>();

	for (const section of getWorkbenchSections(lesson)) {
		for (const fieldId of section.fieldIds) {
			sectionByFieldId.set(fieldId, {
				sectionId: section.id,
				sectionTitle: section.title,
			});
		}
	}

	const tasks: ObjectiveTask[] = [];

	if (lesson.handoff?.mode === "select_candidate_problem") {
		tasks.push({
			id: lesson.handoff.selectionFieldId,
			label: "Choose candidate problem",
			status: isFilled(values[lesson.handoff.selectionFieldId])
				? "complete"
				: "incomplete",
			source: "handoff",
			fieldId: lesson.handoff.selectionFieldId,
			sectionId: "handoff",
			sectionTitle: "Carry forward",
			interactive: false,
		});
	}

	for (const field of getRequiredFields(lesson)) {
		const section = sectionByFieldId.get(field.id);
		const value = values[field.id];

		if (field.kind === "checklist") {
			const options = field.options ?? [];
			const checkedLabels = new Set(
				isChecklistItemArray(value)
					? value.filter((item) => item.checked).map((item) => item.label)
					: Array.isArray(value)
						? value
								.filter((item): item is string => typeof item === "string")
						: [],
			);

			for (const option of options) {
				tasks.push({
					id: `${field.id}:${option}`,
					label: option,
					status: checkedLabels.has(option) ? "complete" : "incomplete",
					source: "checklist_option",
					fieldId: field.id,
					sectionId: section?.sectionId,
					sectionTitle: section?.sectionTitle,
					interactive: false,
				});
			}

			continue;
		}

		tasks.push({
			id: field.id,
			label: getFieldTaskLabel(field),
			status: isFilled(value) ? "complete" : "incomplete",
			source: "field",
			fieldId: field.id,
			sectionId: section?.sectionId,
			sectionTitle: section?.sectionTitle,
			interactive: false,
		});
	}

	return tasks;
}

export function getCompletionIssues(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
) {
	const values = normalizeLessonFieldValues(lesson, fieldValues);
	const objectiveMode = getObjectiveMode(lesson);

	if (objectiveMode === "generated") {
		return getObjectiveTasks(lesson, values)
			.filter((task) => task.status !== "complete")
			.map((task) => ({
				id: task.fieldId ?? task.id,
				label: task.label,
				kind: "field" as const,
			}));
	}

	const issues: CompletionIssue[] = [];

	for (const field of getRequiredFields(lesson)) {
		const value = values[field.id];

		if (field.kind === "checklist") {
			const checklistIsComplete =
				isChecklistItemArray(value) &&
				value.length > 0 &&
				value.every((item) => item.checked);

			if (!checklistIsComplete) {
				issues.push({
					id: field.id,
					label: getFieldTaskLabel(field),
					kind: "field",
				});
			}
			continue;
		}

		if (!isFilled(value)) {
			issues.push({
				id: field.id,
				label: getFieldTaskLabel(field),
				kind: "field",
			});
		}
	}

	for (const task of getObjectiveTasks(lesson, values).filter(
		(task) => task.source === "manual" && task.status !== "complete",
	)) {
		issues.push({
			id: OBJECTIVE_CHECKLIST_FIELD_ID,
			label: task.label,
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

export function normalizeLessonFieldValues(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues | null | undefined,
) {
	const values = normalizeFieldValues(fieldValues);

	if (!isLessonFieldShapeCompatible(lesson, values)) {
		return {} as PersistedFieldValues;
	}

	return values;
}

export function prepareFieldValuesForPersistence(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
) {
	return {
		...Object.fromEntries(
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
		),
		[FIELD_SHAPE_VERSION_FIELD_ID]: getFieldShapeVersion(lesson),
	} as PersistedFieldValues;
}

export function getWorkbenchSectionStates(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
) {
	const values = normalizeLessonFieldValues(lesson, fieldValues);
	const fieldsById = new Map(
		(lesson.workbenchFields ?? []).map((field) => [field.id, field]),
	);

	return getWorkbenchSections(lesson).map((section) => {
		const requiredFields: WorkbenchField[] = [];

		for (const fieldId of section.fieldIds) {
			const field = fieldsById.get(fieldId);
			if (!field || !field.required || field.kind === "readonly") {
				continue;
			}

			requiredFields.push(field);
		}
		const incompleteFieldIds = requiredFields
			.filter((field) => !isFilled(values[field.id]))
			.map((field) => field.id);
		const totalRequiredFields = requiredFields.length;
		const completedRequiredFields =
			totalRequiredFields - incompleteFieldIds.length;
		const completionLabel = section.completionLabel ?? section.title;

		return {
			id: section.id,
			title: section.title,
			completionLabel,
			totalRequiredFields,
			completedRequiredFields,
			isComplete:
				totalRequiredFields === 0 || completedRequiredFields === totalRequiredFields,
			incompleteFieldIds,
		} satisfies WorkbenchSectionState;
	});
}

export function buildArtifactPreview(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
) {
	const values = normalizeLessonFieldValues(lesson, fieldValues);
	const previewEntries: Array<[string, PersistedFieldValue]> = [];
	const usedFieldIds = new Set<string>();

	if (lesson.handoff?.mode === "select_candidate_problem") {
		const owner = values.selected_problem_owner;
		const statement = values.selected_problem_statement;

		if (typeof owner === "string" && owner.trim()) {
			previewEntries.push(["Chosen problem owner", owner.trim()]);
			usedFieldIds.add("selected_problem_owner");
		}

		if (typeof statement === "string" && statement.trim()) {
			previewEntries.push(["Chosen problem", statement.trim()]);
			usedFieldIds.add("selected_problem_statement");
		}
	}

	for (const field of lesson.workbenchFields ?? []) {
		if (field.id.startsWith(PRIVATE_FIELD_PREFIX) || usedFieldIds.has(field.id)) {
			continue;
		}

		const value = values[field.id];
		if (!isFilled(value)) {
			continue;
		}

		previewEntries.push([
			field.artifactPreviewLabel ?? field.label ?? field.id.replaceAll("_", " "),
			value,
		]);
		usedFieldIds.add(field.id);
	}

	for (const [fieldId, value] of Object.entries(values)) {
		if (
			fieldId.startsWith(PRIVATE_FIELD_PREFIX) ||
			usedFieldIds.has(fieldId) ||
			!isFilled(value)
		) {
			continue;
		}

		previewEntries.push([fieldId.replaceAll("_", " "), value]);
	}

	return {
		artifactKey: lesson.artifact.key,
		artifactLabel: lesson.artifact.label,
		artifactType: lesson.artifact.type as ArtifactType,
		lessonId: lesson.id,
		lessonTitle: lesson.title,
		fieldValues: values,
		fields: previewEntries,
	};
}
