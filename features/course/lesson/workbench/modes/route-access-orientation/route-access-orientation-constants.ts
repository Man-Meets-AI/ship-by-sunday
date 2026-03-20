export const ROUTE_ACCESS_FIELD_IDS = {
	codexPrompt: "route_access_codex_prompt",
	inspectionChecklist: "route_access_inspection_checklist",
	pagesPublic: "route_access_pages_public",
	pagesPaywall: "route_access_pages_paywall",
	routeMap: "route_access_route_map",
	accessStackNote: "route_access_access_stack_note",
	routesToChange: "route_access_routes_to_change",
} as const;

export const ROUTE_ACCESS_CODEX_PROMPT_DEFAULT =
	"I'm exploring this code base for the first time and I don't know how pages get blocked whether or not the user has paid. Could you explain it to me in simple terms? Imagine I'm non-technical.";

export const ROUTE_ACCESS_APP_ROUTE_FOLDERS = [
	"access-required",
	"artifacts",
	"checkout",
	"lesson",
	"mission",
	"settings",
	"sign-in",
	"sign-up",
] as const;

export const ROUTE_ACCESS_PUBLIC_PAGE_LABELS = [
	"home",
	"blog",
	"payments",
	"contact",
] as const;

export const ROUTE_ACCESS_PROTECTED_PAGE_LABELS = [
	"mission",
	"lesson",
	"artifacts",
	"settings",
	"access required",
] as const;

export const ROUTE_ACCESS_INSPECTION_CHECKLIST_OPTIONS = [
	"Open `app/` in your repo",
	"Scan the named route folders on this screen",
	"Identify root `page.tsx` (marketing home)",
	"Paste the Codex prompt and send it",
	"Read where product access / protection is enforced",
	"Rename the thread to `How protected pages work`",
	"Pin the thread in Codex",
] as const;

export const ROUTE_ACCESS_GLOSSARY_ITEMS: {
	term: string;
	body: string;
}[] = [
	{
		term: "Authentication",
		body: "Proving who you are (sign-in). The template uses Clerk for identity.",
	},
	{
		term: "Authorization",
		body: "Deciding what you’re allowed to see after you’re known. Passport = who you are; balcony key = which rooms you may enter—that split is authn vs authz.",
	},
	{
		term: "Paywall",
		body: "A gate that blocks product value until purchase or subscription is recognized.",
	},
	{
		term: "Product access",
		body: "A record that the user has paid (or otherwise earned access). The app checks this before rendering protected routes.",
	},
];
