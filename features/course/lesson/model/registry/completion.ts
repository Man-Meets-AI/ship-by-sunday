import type {
	LessonConfig,
	ObjectiveTaskDefinition,
	WorkbenchField,
} from "../manifest";
import { isReferenceGalleryValue } from "../reference-gallery";
import { buildStageUnlockSummary } from "../stage-unlock";
import { isLessonVideoReady as isRenderableLessonVideoReady } from "../video";
import { normalizeLessonFieldValues } from "./legacy";
import {
	getObjectiveMode,
	getRequiredFields,
	getWorkbenchSections,
} from "./progression";
import {
	OBJECTIVE_CHECKLIST_FIELD_ID,
	isChecklistItemArray,
	isUploadFieldValueArray,
	type ArtifactPreview,
	type CompletionIssue,
	type FieldValuesSource,
	type ObjectiveTask,
	type WorkbenchSectionState,
} from "./shared";

type ObjectiveTaskContext = {
	pinnedArtifacts?: ArtifactPreview[];
	resolvedArtifactPreview?: ArtifactPreview | null;
};

function normalizeTaskLabel(label: string) {
	return label.replace(/[?.:]$/, "").trim();
}

function getFieldTaskLabel(field: WorkbenchField) {
	return (
		field.taskLabel ??
		field.artifactPreviewLabel ??
		normalizeTaskLabel(field.label)
	);
}

function isLessonVideoReady(lesson: LessonConfig) {
	return isRenderableLessonVideoReady(lesson.content.coach.video);
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

export function isFilled(value: unknown) {
	if (isReferenceGalleryValue(value)) {
		return value.items.length > 0;
	}

	if (isUploadFieldValueArray(value)) {
		return value.some((item) => Boolean(item.storageId || item.url));
	}

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
		if (value.some((item) => Array.isArray(item))) {
			return value.some(
				(item) =>
					Array.isArray(item) &&
					item.some((cell) => String(cell ?? "").trim().length > 0),
			);
		}

		return value.length > 0;
	}

	if (value && typeof value === "object") {
		return Object.keys(value).length > 0;
	}

	return false;
}

function getFieldMinimumItems(field: WorkbenchField) {
	return Math.max(field.minItems ?? 1, 1);
}

function getLessonSpecificCompletionMessage(
	lesson: LessonConfig,
	fieldId: string,
) {
	if (lesson.id === "1.2") {
		if (fieldId === "selected_problem_index") {
			return "Choose the one user-problem pair you can test fastest.";
		}
		if (fieldId === "pain_moment") {
			return "Name the exact moment this becomes painful for them.";
		}
		if (fieldId === "current_solution") {
			return "Describe the workaround they already use today.";
		}
		if (fieldId === "reachability") {
			return "State how you can get this in front of them this week.";
		}
	}

	if (lesson.id === "1.3") {
		if (fieldId === "outcome") {
			return "Rewrite this as what changes for the user, not what the product contains.";
		}
		if (fieldId === "success_looks_like") {
			return "Show what the user can now do or finish when this works.";
		}
		if (fieldId === "difference_for_user") {
			return "Describe what pain disappears or gets easier for them.";
		}
	}

	if (lesson.id !== "1.1") {
		return undefined;
	}

	const match = fieldId.match(/^problem_(\d+)_(who|pain)$/);
	if (!match) {
		return undefined;
	}

	const [, index, type] = match;
	return type === "who"
		? `Candidate ${index}: name a real person or group, not a broad audience.`
		: `Candidate ${index}: describe the recurring pain they keep running into, not the product idea you want to build.`;
}

function isFieldComplete(field: WorkbenchField, value: unknown) {
	if (field.kind === "reference_gallery") {
		return (
			isReferenceGalleryValue(value) &&
			value.items.length >= getFieldMinimumItems(field)
		);
	}

	return isFilled(value);
}

export function getObjectiveTasks(
	lesson: LessonConfig,
	fieldValues: FieldValuesSource,
	context: ObjectiveTaskContext = {},
): ObjectiveTask[] {
	const values = normalizeLessonFieldValues(lesson, fieldValues);
	const objectiveMode = getObjectiveMode(lesson);
	const stageUnlockSummary = buildStageUnlockSummary(
		lesson,
		context.pinnedArtifacts ?? [],
	);

	if (objectiveMode === "manual") {
		const definitions = getManualObjectiveTaskDefinitions(lesson);
		const manualItems = normalizeLegacyChecklistItems(
			values[OBJECTIVE_CHECKLIST_FIELD_ID],
			definitions,
		);

		return definitions.map(
			(definition, index) =>
				({
					id: definition.id ?? definition.label,
					label: definition.label,
					status: manualItems[index]?.checked ? "complete" : "incomplete",
					source: "manual",
					interactive: true,
				}) satisfies ObjectiveTask,
		);
	}

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

	if (stageUnlockSummary) {
		tasks.push(
			...stageUnlockSummary.tasks.map(
				(task) =>
					({
						id: task.id,
						label: task.label,
						status: task.status,
						source: "field",
						fieldId: task.id,
						interactive: false,
					}) satisfies ObjectiveTask,
			),
		);
	}

	if (lesson.requireReadyVideoForCompletion) {
		tasks.push({
			id: "__coach_video_ready",
			label: "Lesson video is attached and ready",
			status: isLessonVideoReady(lesson) ? "complete" : "incomplete",
			source: "field",
			fieldId: "__coach_video_ready",
			sectionId: "watch",
			sectionTitle: "Watch",
			interactive: false,
		});
	}

	if (lesson.handoff?.mode === "select_candidate_problem") {
		tasks.push({
			id: lesson.handoff.selectionFieldId,
			label:
				lesson.id === "1.2"
					? "Commit to the user behind the problem"
					: "Pick problem to carry forward",
			status: isFilled(values[lesson.handoff.selectionFieldId])
				? "complete"
				: "incomplete",
			source: "handoff",
			fieldId: lesson.handoff.selectionFieldId,
			sectionId: "handoff",
			sectionTitle: "Chosen problem",
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
						? value.filter((item): item is string => typeof item === "string")
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
			status: isFieldComplete(field, value) ? "complete" : "incomplete",
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
	fieldValues: FieldValuesSource,
	context: ObjectiveTaskContext = {},
): CompletionIssue[] {
	const values = normalizeLessonFieldValues(lesson, fieldValues);

	if (getObjectiveMode(lesson) === "generated") {
		return getObjectiveTasks(lesson, values, context)
			.filter((task) => task.status !== "complete")
			.map((task) => ({
				id: task.fieldId ?? task.id,
				label: task.label,
				kind: "field" as const,
				message: task.fieldId
					? getLessonSpecificCompletionMessage(lesson, task.fieldId)
					: undefined,
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

		if (!isFieldComplete(field, value)) {
			issues.push({
				id: field.id,
				label: getFieldTaskLabel(field),
				kind: "field",
				message: getLessonSpecificCompletionMessage(lesson, field.id),
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

export function getWorkbenchSectionStates(
	lesson: LessonConfig,
	fieldValues: FieldValuesSource,
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
			.filter((field) => !isFieldComplete(field, values[field.id]))
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
				totalRequiredFields === 0 ||
				completedRequiredFields === totalRequiredFields,
			incompleteFieldIds,
		} satisfies WorkbenchSectionState;
	});
}
