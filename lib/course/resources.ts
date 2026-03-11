import type {
	LessonResourceContent,
	LessonTemplateResource,
} from "./contracts";

export const STUDENT_PACKET_RESOURCE: LessonResourceContent = {
	id: "student-packet",
	label: "Student Packet",
	href: "/downloads/ship-by-sunday-student-packet.pdf",
	kind: "download",
};

export const WORKSHEET_PACKET_RESOURCE: LessonResourceContent = {
	id: "worksheet-packet",
	label: "Worksheet Packet",
	href: "/downloads/ship-by-sunday-worksheets.pdf",
	kind: "download",
};

export const START_HERE_RESOURCES: LessonResourceContent[] = [
	STUDENT_PACKET_RESOURCE,
	WORKSHEET_PACKET_RESOURCE,
];

export const WORKSHEET_01_RESOURCE: LessonResourceContent = {
	id: "worksheet-01",
	label: "Worksheet 01 — One-Page Product Brief",
	href: "/downloads/ship-by-sunday-worksheets.pdf",
	kind: "download",
};

export const WORKSHEET_02_RESOURCE: LessonResourceContent = {
	id: "worksheet-02",
	label: "Worksheet 02 — Build-Ready Design Spec",
	href: "/downloads/ship-by-sunday-worksheets.pdf",
	kind: "download",
};

export const WORKSHEET_03_RESOURCE: LessonResourceContent = {
	id: "worksheet-03",
	label: "Worksheet 03 — Build Plan + Agent Brief",
	href: "/downloads/ship-by-sunday-worksheets.pdf",
	kind: "download",
};

export const WORKSHEET_04_RESOURCE: LessonResourceContent = {
	id: "worksheet-04",
	label: "Worksheet 04 — Launch Plan + Feedback Tracker",
	href: "/downloads/ship-by-sunday-worksheets.pdf",
	kind: "download",
};

export const WORKSHEET_01_RESOURCES: LessonResourceContent[] = [
	WORKSHEET_01_RESOURCE,
];
export const WORKSHEET_02_RESOURCES: LessonResourceContent[] = [
	WORKSHEET_02_RESOURCE,
];
export const WORKSHEET_03_RESOURCES: LessonResourceContent[] = [
	WORKSHEET_03_RESOURCE,
];
export const WORKSHEET_04_RESOURCES: LessonResourceContent[] = [
	WORKSHEET_04_RESOURCE,
];

export const WORKSHEET_01_TEMPLATE_DOWNLOAD: LessonTemplateResource = {
	templateDownloadLabel: "Open Worksheet 01 template",
	templateDownloadHref: "/downloads/ship-by-sunday-worksheets.pdf",
};

export const WORKSHEET_02_TEMPLATE_DOWNLOAD: LessonTemplateResource = {
	templateDownloadLabel: "Open Worksheet 02 template",
	templateDownloadHref: "/downloads/ship-by-sunday-worksheets.pdf",
};

export const WORKSHEET_02_STORYBOARD_TEMPLATE_DOWNLOAD: LessonTemplateResource =
	{
		templateDownloadLabel: "Open Worksheet 02 storyboard template",
		templateDownloadHref: "/downloads/ship-by-sunday-worksheets.pdf",
	};

export const WORKSHEET_04_DEMO_PROMPT_DOWNLOAD: LessonTemplateResource = {
	templateDownloadLabel: "Open Worksheet 04 demo prompt",
	templateDownloadHref: "/downloads/ship-by-sunday-worksheets.pdf",
};
