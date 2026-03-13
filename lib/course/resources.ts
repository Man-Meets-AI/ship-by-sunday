import type {
	LessonResourceContent,
	LessonTemplateResource,
} from "./contracts";

const CORE_TEMPLATES_PDF_HREF = "/downloads/ship-by-sunday-core-templates.pdf";

export const STUDENT_PACKET_RESOURCE: LessonResourceContent = {
	id: "student-packet",
	label: "Student Packet",
	href: "/downloads/ship-by-sunday-student-packet.pdf",
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

export const PRODUCT_BRIEF_TEMPLATE_RESOURCE: LessonResourceContent = {
	id: "product-brief-template",
	label: "Product Brief Template",
	href: CORE_TEMPLATES_PDF_HREF,
	kind: "download",
};

export const DESIGN_SPEC_TEMPLATE_RESOURCE: LessonResourceContent = {
	id: "design-spec-template",
	label: "Design Spec Template",
	href: CORE_TEMPLATES_PDF_HREF,
	kind: "download",
};

export const BUILD_PLAN_TEMPLATE_RESOURCE: LessonResourceContent = {
	id: "build-plan-template",
	label: "Build Plan Template",
	href: CORE_TEMPLATES_PDF_HREF,
	kind: "download",
};

export const LAUNCH_TRACKER_TEMPLATE_RESOURCE: LessonResourceContent = {
	id: "launch-tracker-template",
	label: "Launch Tracker Template",
	href: CORE_TEMPLATES_PDF_HREF,
	kind: "download",
};

export const PRODUCT_BRIEF_TEMPLATE_RESOURCES: LessonResourceContent[] = [
	PRODUCT_BRIEF_TEMPLATE_RESOURCE,
];
export const DESIGN_SPEC_TEMPLATE_RESOURCES: LessonResourceContent[] = [
	DESIGN_SPEC_TEMPLATE_RESOURCE,
];
export const STORYBOARD_FIGJAM_RESOURCE: LessonResourceContent = {
	id: "storyboard-figjam-template",
	label: "Digital storyboard option (FigJam)",
	href: "https://www.figma.com/board/csR3w46LJaHNU0RKHVOJDB/Ship-by-Sunday-Template?node-id=0-1",
	kind: "external",
};
export const STORYBOARD_TEMPLATE_RESOURCES: LessonResourceContent[] = [
	DESIGN_SPEC_TEMPLATE_RESOURCE,
	STORYBOARD_FIGJAM_RESOURCE,
];

export const DESIGN_REFERENCE_RESOURCES: LessonResourceContent[] = [
	DESIGN_SPEC_TEMPLATE_RESOURCE,
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
export const BUILD_PLAN_TEMPLATE_RESOURCES: LessonResourceContent[] = [
	BUILD_PLAN_TEMPLATE_RESOURCE,
];
export const LAUNCH_TRACKER_TEMPLATE_RESOURCES: LessonResourceContent[] = [
	LAUNCH_TRACKER_TEMPLATE_RESOURCE,
];

export function getBuildStarterTemplateRepoUrl() {
	const value = process.env.NEXT_PUBLIC_SHIP_BY_SUNDAY_TEMPLATE_REPO_URL?.trim();
	return value ? value : null;
}

export const PRODUCT_BRIEF_TEMPLATE_DOWNLOAD: LessonTemplateResource = {
	templateDownloadLabel: "Open product brief template",
	templateDownloadHref: CORE_TEMPLATES_PDF_HREF,
};

export const CORE_FLOW_FIGJAM_TEMPLATE_DOWNLOAD: LessonTemplateResource = {
	templateDownloadLabel: "Open FigJam template",
	templateDownloadHref:
		"https://www.figma.com/board/csR3w46LJaHNU0RKHVOJDB/Template-for-Storyboard?node-id=0-1",
};

export const DESIGN_SPEC_TEMPLATE_DOWNLOAD: LessonTemplateResource = {
	templateDownloadLabel: "Open design spec template",
	templateDownloadHref: CORE_TEMPLATES_PDF_HREF,
};

export const STORYBOARD_TEMPLATE_DOWNLOAD: LessonTemplateResource = {
	templateDownloadLabel: "Open printable storyboard template",
	templateDownloadHref: "/downloads/ship-by-sunday-storyboard-template.pdf",
};

export const SHIP_DEMO_PROMPT_DOWNLOAD: LessonTemplateResource = {
	templateDownloadLabel: "Open ship demo prompt",
	templateDownloadHref: CORE_TEMPLATES_PDF_HREF,
};
