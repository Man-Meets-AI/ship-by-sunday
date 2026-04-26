import { lessonRegistry } from "@/features/course/lesson/model/manifest";
import {
	getLessonHref,
	legacyRouteAliases,
} from "@/features/course/lesson/routing/lesson-routes";

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
