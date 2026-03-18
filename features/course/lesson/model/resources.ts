import { courseResourceConfig } from "@/config/product";
import type { LessonResourceContent } from "./contracts";

const CORE_TEMPLATES_PDF_HREF = courseResourceConfig.downloads.coreTemplatesPdf;

export const STUDENT_PACKET_RESOURCE: LessonResourceContent = {
	id: "student-packet",
	label: "Student Packet",
	href: courseResourceConfig.downloads.studentPacketPdf,
	kind: "download",
};

export const CORE_TEMPLATES_RESOURCE: LessonResourceContent = {
	id: "core-templates",
	label: "Core Templates",
	href: CORE_TEMPLATES_PDF_HREF,
	kind: "download",
};

export const START_HERE_RESOURCES: LessonResourceContent[] = [
	STUDENT_PACKET_RESOURCE,
	CORE_TEMPLATES_RESOURCE,
];

export function getBuildStarterTemplateRepoUrl() {
	const value =
		process.env.NEXT_PUBLIC_SHIP_BY_SUNDAY_TEMPLATE_REPO_URL?.trim();
	return value ? value : null;
}
