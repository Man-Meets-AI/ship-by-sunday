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
	type ReferenceGalleryValue,
	type UploadFieldValue,
	type WorkbenchField,
	type WorkbenchSection,
} from "./manifest";
import { CORE_FLOW_IMAGE_FIELD_ID } from "./core-flow";
import {
	getReferenceGalleryCount as getStoredReferenceGalleryCount,
	getReferenceGallerySummary,
	getReferenceGalleryItems,
	isReferenceGalleryValue,
	toPersistedReferenceGalleryValue,
} from "./reference-gallery";
import { buildStageUnlockSummary } from "./stage-unlock";
import { formatTablePreview, getFilledTableRows } from "./table";

export const COURSE_SLUG = "ship-by-sunday";

export {
	getReferenceGalleryCount,
	getReferenceGalleryItems,
	getReferenceGallerySummary,
	isReferenceGalleryValue,
	toPersistedReferenceGalleryValue,
} from "./reference-gallery";

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
	"reference_gallery",
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
	message?: string;
};

export type PersistedFieldValue =
	| boolean
	| number
	| string
	| string[]
	| string[][]
	| ChecklistItemValue[]
	| ReferenceGalleryValue
	| UploadFieldValue
	| UploadFieldValue[]
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

export type ArtifactPreview = {
	artifactKey: string;
	artifactLabel: string;
	contextTitle?: string;
	artifactType: ArtifactType;
	lessonId: string;
	lessonTitle: string;
	fieldValues: PersistedFieldValues;
	fields: Array<[string, unknown]>;
};

type ObjectiveTaskContext = {
	pinnedArtifacts?: ArtifactPreview[];
	resolvedArtifactPreview?: ArtifactPreview | null;
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

export function isUploadFieldValueArray(
	value: unknown,
): value is UploadFieldValue[] {
	return (
		Array.isArray(value) && value.every((item) => isUploadFieldValue(item))
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

function getLegacyStringArray(value: unknown) {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.filter((item): item is string => typeof item === "string")
		.map((item) => item.trim())
		.filter(Boolean);
}

function getLegacyTrimmedString(
	fieldValues: PersistedFieldValues,
	fieldId: string,
) {
	const value = fieldValues[fieldId];
	return typeof value === "string" ? value.trim() : "";
}

function isUrlString(value: string) {
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
}

function omitFields(
	fieldValues: PersistedFieldValues,
	fieldIds: string[],
): PersistedFieldValues {
	const nextValues = { ...fieldValues };

	for (const fieldId of fieldIds) {
		delete nextValues[fieldId];
	}

	return nextValues;
}

function adaptLegacyReferenceBoardFieldValues(
	fieldValues: PersistedFieldValues,
): PersistedFieldValues {
	if (isReferenceGalleryValue(fieldValues.reference_gallery)) {
		return fieldValues;
	}

	const rows = getLegacyStringArray(fieldValues.reference_board);
	if (rows.length === 0) {
		return fieldValues;
	}

	return {
		...omitFields(fieldValues, [
			"reference_input",
			"reference_board",
			"reference_patterns",
		]),
		reference_gallery: {
			kind: "reference_gallery",
			items: rows.map((row, index) =>
				isUrlString(row)
					? {
							id: `legacy-reference-${index + 1}`,
							source: "remote_url",
							url: row,
						}
					: {
							id: `legacy-reference-${index + 1}`,
							source: "remote_url",
							fileName: row,
						},
			),
		} satisfies ReferenceGalleryValue,
		[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
	};
}

function adaptLegacySketchUploadFieldValues(
	fieldValues: PersistedFieldValues,
): PersistedFieldValues {
	if (isUploadFieldValueArray(fieldValues.sketch_upload)) {
		return fieldValues;
	}

	if (!isUploadFieldValue(fieldValues.sketch_upload)) {
		return fieldValues;
	}

	return {
		...fieldValues,
		sketch_upload: [fieldValues.sketch_upload],
	};
}

function buildLegacyVisualGuideMarkdown(rules: string[], avoidRule: string) {
	const sections = ["# Visual Guide"];

	if (rules.length > 0) {
		sections.push(
			"## Direction Rules",
			rules.map((rule) => `- ${rule}`).join("\n"),
		);
	}

	if (avoidRule) {
		sections.push("## Avoid", `- ${avoidRule}`);
	}

	return sections.join("\n\n");
}

function adaptLegacyVisualDirectionFieldValues(
	fieldValues: PersistedFieldValues,
): PersistedFieldValues {
	const hasCurrentNotes = getLegacyTrimmedString(
		fieldValues,
		"visual_direction_notes",
	);
	const hasCurrentGuide = getLegacyTrimmedString(
		fieldValues,
		"visual_guide_markdown",
	);

	if (hasCurrentNotes || hasCurrentGuide) {
		return fieldValues;
	}

	const rules = [
		getLegacyTrimmedString(fieldValues, "style_rule_1"),
		getLegacyTrimmedString(fieldValues, "style_rule_2"),
		getLegacyTrimmedString(fieldValues, "style_rule_3"),
	].filter(Boolean);
	const avoidRule = getLegacyTrimmedString(fieldValues, "avoid_rule");

	if (rules.length === 0 && !avoidRule) {
		return fieldValues;
	}

	const directionLines = [
		...rules.map((rule, index) => `Style rule ${index + 1}: ${rule}`),
		...(avoidRule ? [`Avoid: ${avoidRule}`] : []),
	];

	return {
		...omitFields(fieldValues, [
			"style_rule_1",
			"style_rule_2",
			"style_rule_3",
			"avoid_rule",
		]),
		visual_direction_notes: directionLines.join("\n"),
		visual_guide_markdown: buildLegacyVisualGuideMarkdown(rules, avoidRule),
		[FIELD_SHAPE_VERSION_FIELD_ID]: 2,
	};
}

function adaptLegacyLessonFieldValues(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues | null | undefined,
): PersistedFieldValues {
	const values = normalizeFieldValues(fieldValues);

	switch (lesson.id) {
		case "2.1":
			return adaptLegacyReferenceBoardFieldValues(values);
		case "2.2":
			return adaptLegacySketchUploadFieldValues(values);
		case "2.6":
			return adaptLegacyVisualDirectionFieldValues(values);
		default:
			return values;
	}
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

		for (const lessonId of lesson.unlocks?.lessons ?? []) {
			unlocked.add(lessonId);
		}
	}

	return getOrderedLessons()
		.filter((lesson) => unlocked.has(lesson.id))
		.map((lesson) => lesson.id);
}

export function getUnlockedBlockIds(completedLessonIds: string[]) {
	const unlocked = new Set<BlockId>(
		getOrderedBlocks()
			.filter((block) => !block.startsLocked)
			.map((block) => block.id),
	);

	for (const lessonId of completedLessonIds) {
		const lesson = getLessonById(lessonId);
		if (!lesson) {
			continue;
		}

		for (const blockId of lesson.unlocks?.blocks ?? []) {
			unlocked.add(blockId);
		}
	}

	return getOrderedBlocks()
		.filter((block) => unlocked.has(block.id))
		.map((block) => block.id);
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
	return (
		field.taskLabel ??
		field.artifactPreviewLabel ??
		normalizeTaskLabel(field.label)
	);
}

function isLessonVideoReady(lesson: LessonConfig) {
	const video = lesson.content.coach.video;
	return video?.status === "ready" && Boolean(video.url);
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
	if (!handoff) {
		return [];
	}

	return [
		handoff.selectionFieldId,
		...(handoff.persistedFields ?? []).map((field) => field.targetFieldId),
	];
}

export function getCandidateProblemOptions(
	handoff: LessonHandoff | null | undefined,
	fieldValues: PersistedFieldValues | null | undefined,
): CandidateProblemOption[] {
	if (!handoff || handoff.mode !== "select_candidate_problem") {
		return [];
	}

	const values = normalizeFieldValues(fieldValues);
	return handoff.options
		.map((option) => {
			const owner = values[option.ownerSourceFieldId];
			const statement = values[option.statementSourceFieldId];

			if (typeof owner !== "string" || typeof statement !== "string") {
				return null;
			}

			if (!owner.trim() || !statement.trim()) {
				return null;
			}

			return {
				index: option.index,
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
	const values = adaptLegacyLessonFieldValues(lesson, fieldValues);
	const expectedVersion = getFieldShapeVersion(lesson);
	const storedVersion = values[FIELD_SHAPE_VERSION_FIELD_ID];
	const knownFieldIds = new Set([
		...(lesson.workbenchFields ?? []).map((field) => field.id),
		...getHandoffPersistedFieldIds(lesson.handoff),
	]);
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

function hasOwnArtifactFields(lesson: LessonConfig) {
	return getRequiredFields(lesson).length > 0;
}

function getUploadFieldValueSummary(value: unknown) {
	const count = isUploadFieldValueArray(value)
		? value.filter((item) => Boolean(item.storageId || item.url)).length
		: 0;
	if (count === 0) {
		return "";
	}

	return `${count} image${count === 1 ? "" : "s"} uploaded`;
}

function formatArtifactSummaryValue(value: unknown) {
	if (isUploadFieldValue(value)) {
		return value.fileName ?? "Saved upload";
	}

	if (isUploadFieldValueArray(value)) {
		return getUploadFieldValueSummary(value);
	}

	if (isReferenceGalleryValue(value)) {
		return getReferenceGallerySummary(value);
	}

	if (isChecklistItemArray(value)) {
		return value
			.filter((item) => item.checked)
			.map((item) => item.label)
			.join(", ");
	}

	if (Array.isArray(value)) {
		if (value.some((item) => Array.isArray(item))) {
			return formatTablePreview(value);
		}

		if (value.every((item) => typeof item === "string")) {
			return value
				.map((item) => item.trim())
				.filter(Boolean)
				.join(", ");
		}

		return JSON.stringify(value);
	}

	if (value === null || value === undefined) {
		return "";
	}

	return String(value).trim();
}

function truncatePreviewText(value: string, maxLength = 160) {
	if (value.length <= maxLength) {
		return value;
	}

	return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function getMarkdownDocumentTitle(markdown: string) {
	const match = markdown.match(/^#\s+(.+)$/mu);
	return match?.[1]?.trim() ?? null;
}

function buildVisualDirectionPreview(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
): ArtifactPreview {
	const values = normalizeLessonFieldValues(lesson, fieldValues);
	const directionNote = getTrimmedFieldValue(values, "visual_direction_notes");
	const visualGuideMarkdown = getTrimmedFieldValue(
		values,
		"visual_guide_markdown",
	);
	const visualGuideLabel = visualGuideMarkdown
		? (getMarkdownDocumentTitle(visualGuideMarkdown) ?? "Guide saved")
		: "";

	return {
		artifactKey: lesson.artifact.key,
		artifactLabel: lesson.artifact.label,
		contextTitle: lesson.artifact.contextTitle,
		artifactType: lesson.artifact.type as ArtifactType,
		lessonId: lesson.id,
		lessonTitle: lesson.title,
		fieldValues: values,
		fields: (
			[
				directionNote
					? (["Direction note", truncatePreviewText(directionNote)] as [
							string,
							unknown,
						])
					: null,
				visualGuideLabel
					? (["visualguide.md", visualGuideLabel] as [string, unknown])
					: null,
			] as Array<[string, unknown] | null>
		).filter((entry): entry is [string, unknown] => Boolean(entry)),
	};
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

	if (lesson.id === "1.4") {
		if (fieldId === "research_table") {
			return "Add 2-3 real alternatives or workarounds and note what each one reveals.";
		}
		if (fieldId === "research_summary") {
			return "State the pattern that should change what you build, copy, or avoid in your v1.";
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

function isFieldComplete(field: WorkbenchField, value: PersistedFieldValue) {
	if (field.kind === "reference_gallery") {
		return getStoredReferenceGalleryCount(value) >= getFieldMinimumItems(field);
	}

	return isFilled(value);
}

function getTrimmedFieldValue(
	fieldValues: PersistedFieldValues,
	fieldId: string,
) {
	const value = fieldValues[fieldId];
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function summarizePinnedArtifact(artifact: ArtifactPreview, limit = 2) {
	if (artifact.fields.length === 0) {
		return "Saved and ready.";
	}

	return artifact.fields
		.slice(0, limit)
		.map(([label, value]) => {
			const formattedValue = formatArtifactSummaryValue(value);
			return formattedValue ? `${label}: ${formattedValue}` : label;
		})
		.join(" • ");
}

function buildCompositeBriefPreview(
	lesson: LessonConfig,
	pinnedArtifacts: ArtifactPreview[],
): ArtifactPreview {
	const fields = pinnedArtifacts.map((artifact) => [
		artifact.contextTitle ?? artifact.artifactLabel,
		summarizePinnedArtifact(artifact),
	]) as Array<[string, unknown]>;

	return {
		artifactKey: lesson.artifact.key,
		artifactLabel: lesson.artifact.label,
		contextTitle: lesson.artifact.contextTitle,
		artifactType: lesson.artifact.type as ArtifactType,
		lessonId: lesson.id,
		lessonTitle: lesson.title,
		fieldValues: Object.fromEntries(
			pinnedArtifacts.map((artifact) => [
				artifact.artifactKey,
				summarizePinnedArtifact(artifact, 3),
			]),
		) as PersistedFieldValues,
		fields,
	};
}

export function buildResolvedArtifactPreview(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
	pinnedArtifacts: ArtifactPreview[] = [],
): ArtifactPreview {
	const stageUnlockSummary = buildStageUnlockSummary(lesson, pinnedArtifacts);
	if (stageUnlockSummary) {
		return stageUnlockSummary.preview as ArtifactPreview;
	}

	if (
		lesson.workbench === "brief_assembler" &&
		!hasOwnArtifactFields(lesson) &&
		pinnedArtifacts.length > 0
	) {
		return buildCompositeBriefPreview(lesson, pinnedArtifacts);
	}

	return buildArtifactPreview(lesson, fieldValues);
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

	if (stageUnlockSummary) {
		return stageUnlockSummary.tasks.map(
			(task) =>
				({
					id: task.id,
					label: task.label,
					status: task.status,
					source: "field",
					fieldId: task.id,
					interactive: false,
				}) satisfies ObjectiveTask,
		);
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
	fieldValues: PersistedFieldValues,
	context: ObjectiveTaskContext = {},
): CompletionIssue[] {
	const values = normalizeLessonFieldValues(lesson, fieldValues);

	const objectiveMode = getObjectiveMode(lesson);

	if (objectiveMode === "generated") {
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

export function normalizeFieldValues(
	fieldValues: PersistedFieldValues | null | undefined,
) {
	return fieldValues ?? {};
}

export function normalizeLessonFieldValues(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues | null | undefined,
) {
	const values = adaptLegacyLessonFieldValues(lesson, fieldValues);

	if (!isLessonFieldShapeCompatible(lesson, values)) {
		return {} as PersistedFieldValues;
	}

	return values;
}

export function prepareFieldValuesForPersistence(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
) {
	const fieldsById = new Map(
		(lesson.workbenchFields ?? []).map((field) => [field.id, field]),
	);

	return {
		...Object.fromEntries(
			Object.entries(fieldValues).map(([fieldId, value]) => {
				const field = fieldsById.get(fieldId);
				if (field?.kind === "table") {
					return [fieldId, getFilledTableRows(value, field.columns)];
				}

				if (
					field?.kind === "reference_gallery" &&
					isReferenceGalleryValue(value)
				) {
					return [fieldId, toPersistedReferenceGalleryValue(value)];
				}

				if (field?.kind === "image_uploads" && isUploadFieldValueArray(value)) {
					return [
						fieldId,
						value
							.filter((item) => Boolean(item.storageId))
							.map(
								(item) =>
									({
										kind: "upload",
										status: item.storageId ? "stored" : item.status,
										fileName: item.fileName,
										mimeType: item.mimeType,
										size: item.size,
										storageId: item.storageId,
									}) satisfies UploadFieldValue,
							),
					];
				}

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

export function buildArtifactPreview(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
): ArtifactPreview {
	if (lesson.artifact.key === "visual_direction") {
		return buildVisualDirectionPreview(lesson, fieldValues);
	}

	const values = normalizeLessonFieldValues(lesson, fieldValues);
	const previewEntries: Array<[string, PersistedFieldValue]> = [];
	const usedFieldIds = new Set<string>();

	if (lesson.handoff?.mode === "select_candidate_problem") {
		for (const field of lesson.handoff.persistedFields ?? []) {
			const value = values[field.targetFieldId];
			if (!isFilled(value)) {
				continue;
			}

			previewEntries.push([
				field.previewLabel,
				typeof value === "string" ? value.trim() : value,
			]);
			usedFieldIds.add(field.targetFieldId);
		}
	}

	for (const field of lesson.workbenchFields ?? []) {
		if (
			field.id.startsWith(PRIVATE_FIELD_PREFIX) ||
			usedFieldIds.has(field.id)
		) {
			continue;
		}

		const value = values[field.id];
		if (!isFilled(value)) {
			continue;
		}

		previewEntries.push([
			field.artifactPreviewLabel ??
				field.label ??
				field.id.replaceAll("_", " "),
			field.kind === "table" ? formatTablePreview(value, field.columns) : value,
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
		contextTitle: lesson.artifact.contextTitle,
		artifactType: lesson.artifact.type as ArtifactType,
		lessonId: lesson.id,
		lessonTitle: lesson.title,
		fieldValues: values,
		fields: previewEntries,
	};
}
