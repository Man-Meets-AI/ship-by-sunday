import { lessonRegistry } from "@/lib/course/lesson/model/manifest";
import {
	getLessonHref,
	legacyRouteAliases,
} from "@/lib/course/lesson/routing/lesson-routes";

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
