import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { routeConfig } from "@/config/product";
import { getLessonMapHref } from "@/lib/workspace-navigation/lesson-map-href";

export type RepoMapBadge = "required" | "nice" | "advanced";

export type RepoMapEntry = {
	id: string;
	path: string;
	badge: RepoMapBadge;
	summary: string;
};

export const REPO_MAP_ENTRIES: RepoMapEntry[] = [
	{
		id: "app",
		path: "app/",
		badge: "required",
		summary: "Routes and pages (Next.js App Router).",
	},
	{
		id: "components",
		path: "components/",
		badge: "required",
		summary: "Reusable UI blocks shared across pages.",
	},
	{
		id: "convex",
		path: "convex/",
		badge: "required",
		summary: "Backend and database logic (queries, mutations, schema).",
	},
	{
		id: "env",
		path: ".env / .env.local",
		badge: "required",
		summary:
			"Secrets and API keys for local dev—never commit or paste into chat.",
	},
	{
		id: "agents",
		path: "AGENTS.md",
		badge: "nice",
		summary: "Instructions for AI assistants working in this repo.",
	},
	{
		id: "manifest",
		path: "package.json",
		badge: "required",
		summary:
			"Script names and dependencies—your control panel for Bun commands.",
	},
];

export const REPO_ROUTE_EXAMPLES: { path: string; note: string }[] = [
	{
		path: getLessonMapHref(),
		note: "Example post-review Lesson Map reveal route.",
	},
	{
		path: apiRouteConfig.stripeCheckout,
		note: "API route — server-side Stripe Checkout.",
	},
	{ path: routeConfig.checkoutSuccess, note: "Post-checkout thank-you route." },
];

export type CuratedCommandRow =
	| { kind: "command"; label: string; command: string }
	| { kind: "note"; label: string; body: string };

export const REPO_CURATED_COMMANDS: CuratedCommandRow[] = [
	{ kind: "command", label: "Start app", command: "bun run dev" },
	{
		kind: "note",
		label: "Stop app",
		body: "In the terminal running the dev server, press Ctrl+C (macOS / Windows / Linux).",
	},
	{ kind: "command", label: "Build app", command: "bun run build" },
	{
		kind: "command",
		label: "Test payments (dev)",
		command: "bun run stripe:dev:verify",
	},
];
