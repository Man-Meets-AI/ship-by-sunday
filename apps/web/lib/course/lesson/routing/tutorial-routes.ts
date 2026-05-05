import { routeConfig } from "@/config/product";
import { getLesson } from "@/lib/course/lesson/model/curriculum";

export function getTutorialsHref() {
	return routeConfig.tutorials;
}

export function getTutorialVideoHref(identifier: string) {
	const lesson = getLesson(identifier);
	const routeSegment = lesson?.routeSegment ?? identifier;

	return `${routeConfig.tutorials}/${routeSegment}`;
}
