import type { SkillRailLesson } from "@/features/course/shared/utils/skill-rail-navigation";

export type SkillRailCompletionCue = {
	completedLessonId: string;
	nextLessonId: string | null;
};

export const SKILL_RAIL_LOCKED_REASON =
	"Complete the previous required lesson to unlock.";

export type SkillRailStepState = "done" | "current" | "upcoming" | "locked";

function getRailStepState(
	lesson: SkillRailLesson,
	currentLessonId?: string,
): SkillRailStepState {
	if (lesson.lessonKey === currentLessonId) {
		return "current";
	}

	if (lesson.status === "completed") {
		return "done";
	}

	if (lesson.status === "locked") {
		return "locked";
	}

	return "upcoming";
}

function lessonAriaBody(lesson: SkillRailLesson, state: SkillRailStepState) {
	if (state === "current") {
		return `${lesson.shortTitle}. Current lesson.`;
	}

	if (state === "done") {
		return `${lesson.shortTitle}. Explored lesson.`;
	}

	if (state === "locked") {
		return `${lesson.shortTitle}. Locked.`;
	}

	return `${lesson.shortTitle}. Available lesson.`;
}

export function getSkillRailStepState(
	lesson: SkillRailLesson,
	currentLessonId?: string,
): SkillRailStepState {
	return getRailStepState(lesson, currentLessonId);
}

export function getSkillRailStepAriaLabel(
	lesson: SkillRailLesson,
	state: SkillRailStepState,
) {
	const body = lessonAriaBody(lesson, state);
	return `Lesson ${lesson.displayLabel}. ${body}`;
}
