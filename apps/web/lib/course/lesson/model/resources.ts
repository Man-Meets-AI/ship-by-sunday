import { courseResourceConfig } from "@/config/product";
import type { LessonResourceContent } from "./contracts";

export const START_HERE_RESOURCES: LessonResourceContent[] = [];

export function getBuildStarterTemplateRepoUrl() {
	return courseResourceConfig.starterRepo.url;
}
