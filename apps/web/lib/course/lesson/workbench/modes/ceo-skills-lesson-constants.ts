export const CEO_SKILLS_WORKFLOW_STEPS = [
	"Direction — who it is for and what “done” means for v1",
	"Design — enough UX clarity to build without thrash",
	"Build — a thin slice that works end to end",
] as const;

export const CEO_SKILLS_STAGE_KEYS = ["strategy", "ux", "build"] as const;
export type CeoSkillsStageKey = (typeof CEO_SKILLS_STAGE_KEYS)[number];

export const CEO_SKILLS_STAGE_LABEL: Record<CeoSkillsStageKey, string> = {
	strategy: "Strategy",
	ux: "UX critique",
	build: "Build",
};

export type CeoSkillExample = {
	id: string;
	title: string;
	body: string;
	stage: CeoSkillsStageKey;
	badges: readonly string[];
};

/** Static examples for the Skills tab (not a mirror of Codex’s full list). */
export const CEO_SKILL_EXAMPLES: CeoSkillExample[] = [
	{
		id: "product-strategy",
		title: "Product strategy",
		body: "Clarify who you serve, the problem, and the outcome before screens.",
		stage: "strategy",
		badges: ["Course", "Recommended"],
	},
	{
		id: "ux-design-crit",
		title: "UX design crit",
		body: "Practical critique skill—often the fastest bridge from idea to buildable UI.",
		stage: "ux",
		badges: ["Course", "Recommended", "UX"],
	},
	{
		id: "engineering-build",
		title: "Engineering / build",
		body: "Implementation reps with AI—scope stays small, progress stays real.",
		stage: "build",
		badges: ["Course", "Recommended"],
	},
	{
		id: "convex-official",
		title: "Convex (official example)",
		body: "Shows how vendor-specific skills look in the wild—browse the OpenAI skills repo.",
		stage: "build",
		badges: ["Official"],
	},
];

/** OpenAI Codex app — Commands doc (macOS table); Windows uses Ctrl for the same roles. */
export const CODEX_COMMAND_MENU_COPY =
	"macOS: Command menu ⌘⇧P or ⌘K (search by action name). Open folder ⌘O. Windows: Ctrl+Shift+P or Ctrl+K, open folder Ctrl+O. There is no separate “Add New Project” shortcut in the public table—use the command menu or open folder.";

export const CEO_SKILLS_SKILLS_INSTALL_COPY =
	"Skills are folders with a SKILL.md (and optional scripts). Per OpenAI: user scope lives in ~/.agents/skills; repo scope in .agents/skills at your project or repo root. Restart Codex if new skills do not appear.";
