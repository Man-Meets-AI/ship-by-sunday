import { routeConfig } from "@/config/product";
import {
	getLesson,
	legacyRouteAliasSegments,
} from "@/lib/course/lesson/model/curriculum";
import { getLessonMapHref } from "@/lib/workspace-navigation/lesson-map-href";

export const legacyRouteAliases = {
	"1.0": getLessonMapHref(),
	...Object.fromEntries(
		Object.entries(legacyRouteAliasSegments).map(([legacyId, routeSegment]) => [
			legacyId,
			`/lesson/${routeSegment}`,
		]),
	),
} as Record<string, string>;

export function getLessonHref(identifier: string): string {
	if (identifier === "1.0" || identifier === routeConfig.mission) {
		return getLessonMapHref();
	}

	const lesson = getLesson(identifier);
	return lesson ? `/lesson/${lesson.routeSegment}` : `/lesson/${identifier}`;
}
