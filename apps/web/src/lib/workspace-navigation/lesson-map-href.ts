import { routeConfig } from "@/config/product";

export const SHOW_LESSON_MAP_QUERY_PARAM = "showLessonMap";

export function getLessonMapHref() {
	const separator = routeConfig.review.includes("?") ? "&" : "?";
	return `${routeConfig.review}${separator}${SHOW_LESSON_MAP_QUERY_PARAM}=1`;
}
