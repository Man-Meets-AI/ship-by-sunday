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
export const STORYBOARD_FIGJAM_RESOURCE: LessonResourceContent = {
	id: "storyboard-figjam-template",
	label: "Digital storyboard option (FigJam)",
	href: "https://www.figma.com/board/csR3w46LJaHNU0RKHVOJDB/Ship-by-Sunday-Template?node-id=0-1",
	kind: "external",
};
export const WORKSHEET_02_STORYBOARD_RESOURCES: LessonResourceContent[] = [
	WORKSHEET_02_RESOURCE,
	STORYBOARD_FIGJAM_RESOURCE,
];

export const DESIGN_REFERENCE_RESOURCES: LessonResourceContent[] = [
	WORKSHEET_02_RESOURCE,
	{
		id: "ref-mobbin",
		label: "Mobbin",
		href: "https://mobbin.design",
		kind: "external",
	},
	{
		id: "ref-spotted-in-prod",
		label: "Spotted in Prod",
		href: "https://spottedinprod.com",
		kind: "external",
	},
	{
		id: "ref-curated",
		label: "Curated",
		href: "https://www.curated.design",
		kind: "external",
	},
	{
		id: "ref-landing-love",
		label: "Landing Love",
		href: "https://www.landing.love",
		kind: "external",
	},
	{
		id: "ref-navbar-gallery",
		label: "Navbar Gallery",
		href: "https://www.navbar.gallery",
		kind: "external",
	},
	{
		id: "ref-cta-gallery",
		label: "CTA Gallery",
		href: "https://www.cta.gallery",
		kind: "external",
	},
	{
		id: "ref-app-motion",
		label: "App Motion",
		href: "https://appmotion.design",
		kind: "external",
	},
	{
		id: "ref-rebrand-gallery",
		label: "Rebrand Gallery",
		href: "https://www.rebrand.gallery",
		kind: "external",
	},
	{
		id: "ref-hugeicons",
		label: "Hugeicons",
		href: "https://hugeicons.com",
		kind: "external",
	},
	{
		id: "ref-component-gallery",
		label: "Component Gallery",
		href: "https://www.component.gallery",
		kind: "external",
	},
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

export const WORKSHEET_01_FIGJAM_TEMPLATE_DOWNLOAD: LessonTemplateResource = {
	templateDownloadLabel: "Open FigJam template",
	templateDownloadHref:
		"https://www.figma.com/board/csR3w46LJaHNU0RKHVOJDB/Template-for-Storyboard?node-id=0-1",
};

export const WORKSHEET_02_TEMPLATE_DOWNLOAD: LessonTemplateResource = {
	templateDownloadLabel: "Open Worksheet 02 template",
	templateDownloadHref: "/downloads/ship-by-sunday-worksheets.pdf",
};

export const WORKSHEET_02_STORYBOARD_TEMPLATE_DOWNLOAD: LessonTemplateResource =
	{
		templateDownloadLabel: "Open printable storyboard worksheet",
		templateDownloadHref: "/downloads/ship-by-sunday-storyboard-template.pdf",
	};

export const WORKSHEET_04_DEMO_PROMPT_DOWNLOAD: LessonTemplateResource = {
	templateDownloadLabel: "Open Worksheet 04 demo prompt",
	templateDownloadHref: "/downloads/ship-by-sunday-worksheets.pdf",
};
