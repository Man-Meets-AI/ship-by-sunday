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
	if (lesson.id === currentLessonId) {
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
		return `${lesson.shortTitle}. Completed lesson.`;
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
	position?: { stepNumber: number; totalSteps: number },
) {
	const body = lessonAriaBody(lesson, state);
	if (!position) {
		return body;
	}
	return `Lesson ${position.stepNumber} of ${position.totalSteps}. ${body}`;
}
