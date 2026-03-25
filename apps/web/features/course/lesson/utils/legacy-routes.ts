import {
	getLessonHref,
	legacyRouteAliases,
	lessonRegistry,
} from "@/features/course/lesson/model/manifest";

export const legacyLessonRedirects = {
	...Object.fromEntries(
		lessonRegistry.map((lesson) => [
			lesson.displayLabel,
			getLessonHref(lesson.lessonKey),
		]),
	),
	...legacyRouteAliases,
} as Record<string, string>;

export function getLegacyLessonRedirect(lessonId: string) {
	return legacyLessonRedirects[lessonId] ?? null;
}
