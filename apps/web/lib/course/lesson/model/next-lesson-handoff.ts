import { getNextLesson, type LessonConfig } from "./manifest";

export function formatHandoffLabelForLesson(next: LessonConfig): string {
	return `${next.displayLabel}: ${next.title}`;
}

/** `id: title` for footer copy; null when there is no configured next lesson. */
export function getNextLessonHandoffLabel(lesson: LessonConfig): string | null {
	const next = getNextLesson(lesson.lessonKey);
	if (!next) {
		return null;
	}
	return formatHandoffLabelForLesson(next);
}
