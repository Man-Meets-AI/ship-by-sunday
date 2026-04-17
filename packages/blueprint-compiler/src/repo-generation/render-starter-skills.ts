import { readFileSync } from "node:fs";
import path from "node:path";
import type { RenderedBlueprintFile } from "../blueprints/render-types";
import { resolveRepoRootPath } from "../repo-root";

type StarterWrapperSkill = {
	description: string;
	name: string;
	path: string;
	steps: string[];
};

type ExternalSkillInstall = {
	installCommand: string;
	name: string;
	recommendedTriggers: string[];
	source: string;
};

const STARTER_WRAPPER_SKILLS: StarterWrapperSkill[] = [
	{
		name: "starter-core-setup",
		path: ".agents/skills/starter-core-setup/SKILL.md",
		description:
			"Use when the buyer needs to boot this starter locally and understand the safe setup order before changing auth or billing.",
		steps: [
			"Read `START-HERE.md` first and keep to the prescribed order.",
			"Treat `bun run bootstrap` as the first step. Confirm dependencies, `.env.local`, and the local docs surface before changing product code.",
			"Read `apps/web/content/docs/local-setup.mdx` before suggesting deeper changes.",
			"Before changing Next.js code, explicitly trigger `$starter-nextjs-in-this-repo`.",
			"Keep auth and billing untouched until the starter boots cleanly.",
		],
	},
	{
		name: "starter-auth-setup",
		path: ".agents/skills/starter-auth-setup/SKILL.md",
		description:
			"Use when wiring Clerk and Convex auth for this starter. Follow the repo-local auth contract before touching billing or product code.",
		steps: [
			"Read `START-HERE.md` and the auth step before making changes.",
			"Read `apps/web/content/docs/clerk-convex-auth.mdx` and `apps/web/convex/_generated/ai/guidelines.md`.",
			"Keep the supported order: Clerk first, then Convex, then verification.",
			"If external skills are installed, use `$clerk`, `$clerk-nextjs-patterns`, and `$convex-setup-auth` when they are the best fit.",
			"Do not rewrite billing or checkout while auth setup is still unstable.",
		],
	},
	{
		name: "starter-billing-setup",
		path: ".agents/skills/starter-billing-setup/SKILL.md",
		description:
			"Use when wiring Stripe for this starter after auth is stable. Preserve the shipped checkout and webhook contract until the paid handoff works end to end.",
		steps: [
			"Read `START-HERE.md` and do not start billing work before auth is stable.",
			"Read `apps/web/content/docs/stripe-checkout-webhook.mdx` and `apps/web/content/docs/local-qa.mdx`.",
			"Use the exact local billing contract for checkout, webhook forwarding, and verification.",
			"If external skills are installed, prefer `$stripe-best-practices` for Stripe-specific decisions.",
			"Do not rewrite checkout routes or webhook handlers until the shipped billing handoff passes verification.",
		],
	},
	{
		name: "starter-first-slice",
		path: ".agents/skills/starter-first-slice/SKILL.md",
		description:
			"Use after the starter is stable and the buyer is ready to shape the real product. Start with identity, homepage, and the first real customer-visible slice.",
		steps: [
			"Read `START-HERE.md` and confirm core setup, auth setup, billing setup, and verification are done first.",
			"Start by updating `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts`.",
			"Prefer `$copywriting`, `$frontend-design`, `$docs`, and `$qa-team` as the first follow-on skills.",
			"Keep auth and billing contracts stable until the product already feels like the buyer's product.",
		],
	},
	{
		name: "starter-nextjs-in-this-repo",
		path: ".agents/skills/starter-nextjs-in-this-repo/SKILL.md",
		description:
			"Use when editing Next.js code in this starter. Read the installed Next.js docs in node_modules before changing framework behavior.",
		steps: [
			"Read `AGENTS.md` first.",
			"Read the relevant guide in `apps/web/node_modules/next/dist/docs/` before changing Next.js code.",
			"Treat the installed docs as the source of truth for this starter's Next.js version, not live upstream docs.",
		],
	},
	{
		name: "starter-convex-in-this-repo",
		path: ".agents/skills/starter-convex-in-this-repo/SKILL.md",
		description:
			"Use when editing Convex code in this starter. Read the generated Convex guidelines before changing functions, schema, or HTTP actions.",
		steps: [
			"Read `AGENTS.md` first.",
			"Read `apps/web/convex/_generated/ai/guidelines.md` before changing Convex code.",
			"Treat the generated Convex guidance as version-coupled to this starter's installed Convex setup.",
		],
	},
];

const EXTERNAL_SKILLS: ExternalSkillInstall[] = [
	{
		name: "convex-agent-skills",
		source: "https://github.com/get-convex/agent-skills",
		installCommand: "npx skills add get-convex/agent-skills --all",
		recommendedTriggers: ["$convex-quickstart", "$convex-setup-auth"],
	},
	{
		name: "clerk-skills",
		source: "https://github.com/clerk/skills",
		installCommand: "npx skills add clerk/skills",
		recommendedTriggers: ["$clerk", "$clerk-nextjs-patterns"],
	},
	{
		name: "stripe-best-practices",
		source:
			"https://github.com/stripe/ai/tree/main/skills/stripe-best-practices",
		installCommand:
			"npx skills add https://github.com/stripe/ai --skill stripe-best-practices",
		recommendedTriggers: ["$stripe-best-practices"],
	},
];

const BUNDLED_SHARED_SKILL_PATHS = [
	".agents/skills/shared/exec-plan-execute/SKILL.md",
	".agents/skills/shared/exec-plan-griller/SKILL.md",
	".agents/skills/shared/exec-plan-validate/SKILL.md",
	".agents/skills/shared/exec-plan-writer/SKILL.md",
	".agents/skills/shared/land/SKILL.md",
] as const;

function renderWrapperSkillContent(skill: StarterWrapperSkill) {
	return [
		"---",
		`name: ${skill.name}`,
		`description: ${skill.description}`,
		"---",
		"",
		`# ${skill.name}`,
		"",
		...skill.steps.map((step, index) => `${index + 1}. ${step}`),
	].join("\n");
}

function renderInstallScriptContent() {
	return [
		"#!/usr/bin/env bash",
		"set -euo pipefail",
		"",
		'SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"',
		'REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"',
		'cd "$REPO_ROOT"',
		"",
		'MANIFEST_PATH=".agents/skills/external-skills.json"',
		"",
		"if ! command -v node >/dev/null 2>&1; then",
		'  echo "Skipping external skill install because Node.js is not installed yet."',
		'  echo "Install Node.js, then rerun: bun run codex:skills:install"',
		"  exit 0",
		"fi",
		"",
		"if ! command -v npx >/dev/null 2>&1; then",
		'  echo "Skipping external skill install because npx is unavailable on this machine."',
		'  echo "Install Node.js tooling, then rerun: bun run codex:skills:install"',
		"  exit 0",
		"fi",
		"",
		'if [ ! -f "$MANIFEST_PATH" ]; then',
		'  echo "Missing $MANIFEST_PATH" >&2',
		"  exit 1",
		"fi",
		"",
		'node -e \'const fs = require("node:fs"); const manifest = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); for (const entry of manifest.externalSkills) { console.log(entry.installCommand); }\' "$MANIFEST_PATH" | while IFS= read -r install_command; do',
		'  echo "==> $install_command"',
		'  eval "$install_command"',
		"done",
		"",
		'printf "\\nRestart Codex if the new skills do not appear immediately.\\n"',
	].join("\n");
}

function renderBundledSharedSkillFiles(): RenderedBlueprintFile[] {
	const repoRoot = resolveRepoRootPath();

	return BUNDLED_SHARED_SKILL_PATHS.map((relativePath) => ({
		path: relativePath,
		content: readFileSync(
			path.join(/* turbopackIgnore: true */ repoRoot, relativePath),
			"utf8",
		),
	}));
}

export function renderStarterSkillFiles(): RenderedBlueprintFile[] {
	return [
		...renderBundledSharedSkillFiles(),
		...STARTER_WRAPPER_SKILLS.map((skill) => ({
			path: skill.path,
			content: renderWrapperSkillContent(skill),
		})),
		{
			path: ".agents/skills/external-skills.json",
			content: `${JSON.stringify(
				{
					externalSkills: EXTERNAL_SKILLS,
				},
				null,
				2,
			)}\n`,
		},
		{
			path: "scripts/install-codex-skills.sh",
			content: renderInstallScriptContent(),
		},
	];
}
