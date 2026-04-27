export const BUILD_SHIP_ROADMAP_FIELD_IDS = {
	buildPhaseChecklist: "build_ship_roadmap_build_phase",
	shipPhaseChecklist: "build_ship_roadmap_ship_phase",
	serviceAccountsChecklist: "build_ship_roadmap_service_accounts",
	scopeChecklist: "build_ship_roadmap_scope",
	marketingBrief: "build_ship_roadmap_marketing_brief",
	preferredDomain: "build_ship_roadmap_preferred_domain",
	supportEmail: "build_ship_roadmap_support_email",
	loggingPlan: "build_ship_roadmap_logging_plan",
	firstTesters: "build_ship_roadmap_first_testers",
} as const;

export type RoadmapTaskBadge = "required" | "later" | "optional";

export const ROADMAP_TASK_BADGE_LABELS: Record<RoadmapTaskBadge, string> = {
	required: "Required",
	later: "Later",
	optional: "Optional",
};

export const ROADMAP_TASK_BADGE_VARIANTS: Record<
	RoadmapTaskBadge,
	"default" | "secondary" | "outline"
> = {
	required: "default",
	later: "secondary",
	optional: "outline",
};

export const BUILD_PHASE_CHECKLIST_OPTIONS = [
	"Marketing site",
	"Protected pages",
	"Stripe",
	"Convex",
	"Clerk",
	"Docs and tools (agent handbook / wiki)",
] as const;

export const BUILD_PHASE_BADGES: Record<string, RoadmapTaskBadge> = {
	"Marketing site": "required",
	"Protected pages": "required",
	Stripe: "required",
	Convex: "required",
	Clerk: "required",
	"Docs and tools (agent handbook / wiki)": "required",
};

export const SHIP_PHASE_CHECKLIST_OPTIONS = [
	"Logo",
	"Open graph image",
	"SEO basics",
	"Deploy to Vercel",
	"Domain",
	"Support email",
	"Logs",
	"Send to friends (first testers)",
	"Instantly / cold email",
] as const;

export const SHIP_PHASE_BADGES: Record<string, RoadmapTaskBadge> = {
	Logo: "required",
	"Open graph image": "required",
	"SEO basics": "required",
	"Deploy to Vercel": "required",
	Domain: "required",
	"Support email": "required",
	Logs: "required",
	"Send to friends (first testers)": "required",
	"Instantly / cold email": "later",
};

export const SERVICE_ACCOUNT_CHECKLIST_OPTIONS = [
	"Stripe",
	"Convex",
	"Clerk",
	"Vercel",
] as const;

export const SCOPE_CHECKLIST_OPTIONS = [
	"Web app only — not a separate multi-client API backend",
	"No iOS app in scope",
	"No complex public API in scope",
] as const;

export const SERVICE_LINKS = [
	{ label: "Convex", href: "https://www.convex.dev" },
	{ label: "Stripe", href: "https://dashboard.stripe.com" },
	{ label: "Clerk", href: "https://clerk.com" },
	{ label: "Vercel", href: "https://vercel.com" },
] as const;

export const CONCEPT_ACCORDION_ITEMS = [
	{
		value: "protected",
		title: "Protected pages",
		body: "Routes that require sign-in (and often a paid state) before the user sees the product. This is how you gate what customers paid for versus marketing pages that stay public.",
	},
	{
		value: "og",
		title: "Open graph",
		body: "The preview image, title, and description social apps show when someone shares your link. One OG image plus clear metadata makes shares look intentional.",
	},
	{
		value: "seo",
		title: "SEO",
		body: "Search-focused titles, descriptions, and structure so Google can understand your marketing pages. Keep it simple on week one: honest copy beats tricks.",
	},
	{
		value: "logs",
		title: "Logs",
		body: "Runtime output and error tblueprint (hosting dashboard, server logs, or a logging product) so you can see what broke after deploy—without guessing.",
	},
] as const;
