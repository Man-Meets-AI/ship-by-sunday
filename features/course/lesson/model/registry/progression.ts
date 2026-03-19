import {
	type BlockConfig,
	type BlockId,
	blocks,
	type LessonConfig,
	type LessonHandoff,
	lessonRegistry,
	type ObjectiveMode,
	type WorkbenchSection,
} from "../manifest";
import {
	type CandidateProblemOption,
	type FieldValuesSource,
	normalizeFieldValues,
	SUPPORTED_FIELD_KINDS,
} from "./shared";

const LESSONS_BY_ID = new Map(
	lessonRegistry.map((lesson) => [lesson.id, lesson]),
);
const LESSONS_BY_ARTIFACT_KEY = new Map(
	lessonRegistry.map((lesson) => [lesson.artifact.key, lesson]),
);
const BLOCKS_BY_ID = new Map(blocks.map((block) => [block.id, block]));

export function getOrderedLessons() {
	return [...lessonRegistry].sort((left, right) => left.order - right.order);
}

export function isStudentFacingLesson(lesson: LessonConfig) {
	return lesson.id !== "1.0";
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
	const unlocked = new Set<string>(["1.0", "1.1"]);

	for (const lessonId of completedLessonIds) {
		const lesson = getLessonById(lessonId);
		if (!lesson) {
			continue;
		}

		for (const unlockedLessonId of lesson.unlocks?.lessons ?? []) {
			unlocked.add(unlockedLessonId);
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

export function getCandidateProblemOptions(
	handoff: LessonHandoff | null | undefined,
	fieldValues: FieldValuesSource,
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

export function getHandoffPersistedFieldIds(
	handoff: LessonHandoff | undefined,
) {
	if (!handoff) {
		return [];
	}

	return [
		handoff.selectionFieldId,
		...(handoff.persistedFields ?? []).map((field) => field.targetFieldId),
	];
}
