import { getLesson, type LessonConfig } from "./manifest";

export function formatHandoffLabelForLesson(next: LessonConfig): string {
  return `${next.id}: ${next.title}`;
}

/** `id: title` for footer copy; null when there is no configured next lesson. */
export function getNextLessonHandoffLabel(lesson: LessonConfig): string | null {
  if (!lesson.nextLessonId) {
    return null;
  }
  const next = getLesson(lesson.nextLessonId);
  if (!next) {
    return null;
  }
  return formatHandoffLabelForLesson(next);
}
