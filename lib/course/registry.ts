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
import {
	CORE_FLOW_ACTORS_FIELD_ID,
	CORE_FLOW_ENDING_FIELD_ID,
	CORE_FLOW_IMAGE_FIELD_ID,
	CORE_FLOW_MAX_ACTORS,
	CORE_FLOW_MAX_STEPS,
	CORE_FLOW_MIN_STEPS,
	CORE_FLOW_STEPS_FIELD_ID,
	getCoreFlowDraftState,
} from "./core-flow-map";
import { formatTablePreview, getFilledTableRows } from "./table";

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
	const values = normalizeFieldValues(fieldValues);
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

function isStageUnlockBriefAssembler(lesson: LessonConfig) {
	return (
		lesson.workbench === "brief_assembler" &&
		lesson.briefAssembler?.variant === "stage_unlock"
	);
}

function hasOwnArtifactFields(lesson: LessonConfig) {
	return getRequiredFields(lesson).length > 0;
}

function formatArtifactSummaryValue(value: unknown) {
	if (isUploadFieldValue(value)) {
		return value.fileName ?? "Saved upload";
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

function getPinnedArtifactByKey(
	pinnedArtifacts: ArtifactPreview[],
	artifactKey: string,
) {
	return pinnedArtifacts.find((artifact) => artifact.artifactKey === artifactKey);
}

function getFieldString(
	artifact: ArtifactPreview | undefined,
	fieldId: string,
) {
	const value = artifact?.fieldValues[fieldId];
	return typeof value === "string" ? value.trim() : "";
}

function countFilledLines(value: unknown) {
	if (!Array.isArray(value)) {
		return 0;
	}

	return value.filter(
		(entry): entry is string =>
			typeof entry === "string" && entry.trim().length > 0,
	).length;
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

function buildProductBriefPreview(
	lesson: LessonConfig,
	pinnedArtifacts: ArtifactPreview[],
): ArtifactPreview {
	const userArtifact = getPinnedArtifactByKey(pinnedArtifacts, "user_statement");
	const outcomeArtifact = getPinnedArtifactByKey(
		pinnedArtifacts,
		"outcome_statement",
	);
	const researchArtifact = getPinnedArtifactByKey(pinnedArtifacts, "research_notes");
	const flowArtifact = getPinnedArtifactByKey(pinnedArtifacts, "core_flow_image");
	const scopeArtifact = getPinnedArtifactByKey(pinnedArtifacts, "scope_boundary");

	const researchSignalCount = getFilledTableRows(
		researchArtifact?.fieldValues.research_table,
	).length;
	const flowState = getCoreFlowDraftState(flowArtifact?.fieldValues ?? {});
	const keepCount = countFilledLines(scopeArtifact?.fieldValues.in_scope);
	const cutCount = countFilledLines(scopeArtifact?.fieldValues.out_of_scope);
	const flowImageValue = flowArtifact?.fieldValues[CORE_FLOW_IMAGE_FIELD_ID];
	const flowImageUrl =
		isUploadFieldValue(flowImageValue) && typeof flowImageValue.url === "string"
			? flowImageValue.url
			: null;

	const who = [
		getFieldString(userArtifact, "selected_problem_owner"),
		getFieldString(userArtifact, "selected_problem_statement")
			? `Problem: ${getFieldString(
					userArtifact,
					"selected_problem_statement",
				)}`
			: "",
		getFieldString(userArtifact, "pain_moment")
			? `Pain moment: ${getFieldString(userArtifact, "pain_moment")}`
			: "",
	]
		.filter(Boolean)
		.join("\n");
	const outcome = [
		getFieldString(outcomeArtifact, "outcome"),
		getFieldString(outcomeArtifact, "success_looks_like")
			? `Success looks like: ${getFieldString(
					outcomeArtifact,
					"success_looks_like",
				)}`
			: "",
		getFieldString(outcomeArtifact, "difference_for_user")
			? `Difference for the user: ${getFieldString(
					outcomeArtifact,
					"difference_for_user",
				)}`
			: "",
	]
		.filter(Boolean)
		.join("\n");
	const evidence = [
		researchSignalCount > 0
			? `${researchSignalCount} research signal${
					researchSignalCount === 1 ? "" : "s"
				} captured`
			: "",
		getFieldString(researchArtifact, "research_summary")
			? `Key pattern: ${getFieldString(researchArtifact, "research_summary")}`
			: "",
	]
		.filter(Boolean)
		.join("\n");
	const flow = [
		flowState.validActorCount > 0
			? `${flowState.validActorCount} actor${
					flowState.validActorCount === 1 ? "" : "s"
				} across ${flowState.filledStepCount} step${
					flowState.filledStepCount === 1 ? "" : "s"
				}`
			: "",
		flowState.endingDraft
			? `Value moment: ${flowState.endingDraft}`
			: "",
	]
		.filter(Boolean)
		.join("\n");
	const scope = [
		keepCount > 0 || cutCount > 0
			? `${keepCount} keep${keepCount === 1 ? "" : "s"} in v1 • ${cutCount} cut${
					cutCount === 1 ? "" : "s"
				}`
			: "",
		getFieldString(scopeArtifact, "v1_rationale")
			? `Why this version is enough: ${getFieldString(
					scopeArtifact,
					"v1_rationale",
				)}`
			: "",
	]
		.filter(Boolean)
		.join("\n");

	return {
		artifactKey: lesson.artifact.key,
		artifactLabel: lesson.artifact.label,
		contextTitle: lesson.artifact.contextTitle,
		artifactType: lesson.artifact.type as ArtifactType,
		lessonId: lesson.id,
		lessonTitle: lesson.title,
		fieldValues: {
			who,
			outcome,
			evidence,
			flow,
			scope,
			user_locked_count: who ? 1 : 0,
			outcome_defined_count: outcome ? 1 : 0,
			research_signal_count: researchSignalCount,
			flow_step_count: flowState.filledStepCount,
			scope_cut_count: cutCount,
			flow_image_url: flowImageUrl,
		},
		fields: ([
			["Who", who],
			["Outcome", outcome],
			["Evidence", evidence],
			["Flow", flow],
			["Scope", scope],
		] as Array<[string, unknown]>).filter(
			([, value]) => typeof value === "string" && value.trim().length > 0,
		),
	};
}

export function buildResolvedArtifactPreview(
	lesson: LessonConfig,
	fieldValues: PersistedFieldValues,
	pinnedArtifacts: ArtifactPreview[] = [],
): ArtifactPreview {
	if (
		lesson.workbench === "brief_assembler" &&
		!hasOwnArtifactFields(lesson) &&
		pinnedArtifacts.length > 0
	) {
		if (lesson.artifact.key === "product_brief") {
			return buildProductBriefPreview(lesson, pinnedArtifacts);
		}

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
	const resolvedArtifactPreview =
		context.resolvedArtifactPreview ??
		buildResolvedArtifactPreview(
			lesson,
			values,
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

	if (isStageUnlockBriefAssembler(lesson)) {
		const hasWho = isFilled(resolvedArtifactPreview.fieldValues.who as any);
		const hasOutcome = isFilled(resolvedArtifactPreview.fieldValues.outcome as any);
		const hasEvidence = isFilled(
			resolvedArtifactPreview.fieldValues.evidence as any,
		);
		const hasFlow = isFilled(resolvedArtifactPreview.fieldValues.flow as any);
		const hasScope = isFilled(resolvedArtifactPreview.fieldValues.scope as any);
		const hasBrief = [hasWho, hasOutcome, hasEvidence, hasFlow, hasScope].every(
			Boolean,
		);

		return [
			{
				id: "product-brief:who",
				label: "Lock the user and problem",
				status: hasWho ? "complete" : "incomplete",
				source: "field",
				fieldId: "product-brief:who",
				interactive: false,
			},
			{
				id: "product-brief:outcome",
				label: "Lock the outcome",
				status: hasOutcome ? "complete" : "incomplete",
				source: "field",
				fieldId: "product-brief:outcome",
				interactive: false,
			},
			{
				id: "product-brief:evidence",
				label: "Bring in real evidence",
				status: hasEvidence ? "complete" : "incomplete",
				source: "field",
				fieldId: "product-brief:evidence",
				interactive: false,
			},
			{
				id: "product-brief:flow",
				label: "Carry the core flow into Design",
				status: hasFlow ? "complete" : "incomplete",
				source: "field",
				fieldId: "product-brief:flow",
				interactive: false,
			},
			{
				id: "product-brief:scope",
				label: "Keep the v1 brutally small",
				status: hasScope ? "complete" : "incomplete",
				source: "field",
				fieldId: "product-brief:scope",
				interactive: false,
			},
			{
				id: "product-brief:assembled",
				label: "Assemble the product brief",
				status: hasBrief ? "complete" : "incomplete",
				source: "field",
				fieldId: "product-brief:assembled",
				interactive: false,
			},
		];
	}

	if (lesson.workbench === "core_flow_map") {
		const flowState = getCoreFlowDraftState(values);

		return [
			{
				id: CORE_FLOW_ACTORS_FIELD_ID,
				label: "Lock the actors",
				status:
					flowState.validActorCount >= 1 &&
					flowState.validActorCount <= CORE_FLOW_MAX_ACTORS
						? "complete"
						: "incomplete",
				source: "field",
				fieldId: CORE_FLOW_ACTORS_FIELD_ID,
				sectionId: "actors",
				sectionTitle: "Actors",
				interactive: false,
			},
			{
				id: CORE_FLOW_STEPS_FIELD_ID,
				label: "Map 5-7 steps",
				status:
					flowState.filledStepCount >= CORE_FLOW_MIN_STEPS &&
					flowState.filledStepCount <= CORE_FLOW_MAX_STEPS &&
					!flowState.hasPartialStep
						? "complete"
						: "incomplete",
				source: "field",
				fieldId: CORE_FLOW_STEPS_FIELD_ID,
				sectionId: "steps",
				sectionTitle: "Flow",
				interactive: false,
			},
			{
				id: CORE_FLOW_ENDING_FIELD_ID,
				label: "Define the value moment",
				status: flowState.endingDraft ? "complete" : "incomplete",
				source: "field",
				fieldId: CORE_FLOW_ENDING_FIELD_ID,
				sectionId: "ending",
				sectionTitle: "Ending",
				interactive: false,
			},
			{
				id: CORE_FLOW_IMAGE_FIELD_ID,
				label: "Save current map image",
				status: flowState.hasSavedImage ? "complete" : "incomplete",
				source: "field",
				fieldId: CORE_FLOW_IMAGE_FIELD_ID,
				sectionId: "image",
				sectionTitle: "Saved image",
				interactive: false,
			},
		];
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
			label: "Pick problem to carry forward",
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
	context: ObjectiveTaskContext = {},
) {
	const values = normalizeLessonFieldValues(lesson, fieldValues);

	if (lesson.workbench === "core_flow_map") {
		return getObjectiveTasks(lesson, values, context)
			.filter((task) => task.status !== "complete")
			.map((task) => ({
				id: task.fieldId ?? task.id,
				label: task.label,
				kind: "field" as const,
			}));
	}

	const objectiveMode = getObjectiveMode(lesson);

	if (objectiveMode === "generated") {
		return getObjectiveTasks(lesson, values, context)
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
