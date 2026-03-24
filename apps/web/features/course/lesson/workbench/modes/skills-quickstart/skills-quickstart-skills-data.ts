export type SkillTabId = "clerk" | "convex" | "engineering" | "qa";

export type SkillRole = "auth" | "data" | "scope" | "qa" | "eng";

export type SkillEntry = {
	slug: string;
	title: string;
	role: SkillRole;
	description: string;
};

export const SKILL_ROLE_LABEL: Record<SkillRole, string> = {
	auth: "auth",
	data: "data",
	scope: "scope",
	qa: "qa",
	eng: "eng",
};

export const SKILL_TABS: { id: SkillTabId; label: string }[] = [
	{ id: "clerk", label: "Clerk" },
	{ id: "convex", label: "Convex" },
	{ id: "engineering", label: "Engineering" },
	{ id: "qa", label: "QA" },
];

/** Representative skills this course expects you to recognize; your install may differ. */
export const SKILLS_BY_TAB: Record<SkillTabId, SkillEntry[]> = {
	clerk: [
		{
			slug: "clerk",
			title: "Clerk (router)",
			role: "auth",
			description:
				"Pick the right Clerk skill for your surface (Next.js, backend API, etc.).",
		},
		{
			slug: "clerk-orchestrator",
			title: "Orchestrator",
			role: "auth",
			description:
				"Route auth questions when several Clerk skills could apply.",
		},
		{
			slug: "clerk-orgs",
			title: "Organizations",
			role: "auth",
			description: "Teams, roles, org switching, B2B-style access.",
		},
		{
			slug: "clerk-setup",
			title: "Setup",
			role: "auth",
			description: "First-time Clerk wiring, env keys, and baseline flows.",
		},
		{
			slug: "clerk-swift",
			title: "Swift / iOS",
			role: "auth",
			description: "Native iOS auth with ClerkKit patterns.",
		},
		{
			slug: "clerk-testing",
			title: "Testing",
			role: "auth",
			description: "Playwright/Cypress-style checks against Clerk flows.",
		},
	],
	convex: [
		{
			slug: "convex",
			title: "Convex (umbrella)",
			role: "data",
			description:
				"Entry router for Convex questions—functions, schema, realtime.",
		},
		{
			slug: "convex-functions",
			title: "Functions",
			role: "data",
			description: "Queries, mutations, actions, validation, and structure.",
		},
		{
			slug: "convex-schema-validator",
			title: "Schema",
			role: "data",
			description: "Tables, indexes, validators, and safe schema changes.",
		},
		{
			slug: "convex-security-check",
			title: "Security check",
			role: "data",
			description: "Quick pass on authz boundaries and exposed functions.",
		},
	],
	engineering: [
		{
			slug: "avoid-feature-creep",
			title: "Avoid feature creep",
			role: "scope",
			description:
				"Sanity-check new work against the core flow you already committed to.",
		},
		{
			slug: "next-best-practices",
			title: "Next.js practices",
			role: "eng",
			description: "App Router, data boundaries, and shipping-shaped defaults.",
		},
		{
			slug: "vercel-react-best-practices",
			title: "React performance",
			role: "eng",
			description: "Client/server boundaries, bundle, and render hygiene.",
		},
		{
			slug: "eng-refactor-or-simplify",
			title: "Simplify / refactor",
			role: "eng",
			description:
				"Reduce complexity without changing the user-visible outcome.",
		},
	],
	qa: [
		{
			slug: "qa-browser",
			title: "QA Browser",
			role: "qa",
			description: "Drive a real browser against your deployed or local URL.",
		},
	],
};
