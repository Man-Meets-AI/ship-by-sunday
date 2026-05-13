import type { RenderedCodebaseFile } from "../codebases/render-types";

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
			"Use when the buyer needs to boot this Codebase locally and understand the safe setup order before changing auth or billing.",
		steps: [
			"Read `START-HERE.md` first and keep to the prescribed order.",
			"Treat `bun run bootstrap` as the first step. Confirm dependencies, `.env.local`, and the local docs surface before changing product code.",
			"Read `apps/web/content/docs/local-setup.mdx` before suggesting deeper changes.",
			"Before changing Next.js code, explicitly trigger `$starter-nextjs-in-this-repo`.",
			"Keep auth and billing untouched until the Codebase boots cleanly.",
		],
	},
	{
		name: "starter-auth-setup",
		path: ".agents/skills/starter-auth-setup/SKILL.md",
		description:
			"Use when wiring Clerk and Convex auth for this Codebase. Follow the repo-local auth contract before touching billing or product code.",
		steps: [
			"Read `START-HERE.md` and the auth step before making changes.",
			"Read `apps/web/content/docs/clerk-convex-auth.mdx` and `apps/web/convex/_generated/ai/guidelines.md`.",
			"Keep the supported order: Clerk first, then Convex, then verification.",
			"If external skills are installed, use `$clerk`, `$clerk-nextjs-patterns`, and `$convex-setup-auth` when they are the best fit.",
			"Do not rewrite billing or checkout while auth setup is still unstable.",
		],
	},
	{
		name: "starter-linear-workflow",
		path: ".agents/skills/starter-linear-workflow/SKILL.md",
		description:
			"Use when the buyer wants Linear to be the official backlog, status, and handoff surface for this Codebase before implementation begins.",
		steps: [
			"Read `START-HERE.md` and the Linear work tracker step before creating or changing issues.",
			"Create or identify one Linear project for this product. Do not scatter Codebase work across unrelated projects.",
			"Use Linear for backlog state, ownership, acceptance criteria, blockers, and work history. Use GitHub for code, branches, pull requests, and CI.",
			"Create implementation issues with these sections: Problem, Outcome, Acceptance Criteria, Validation, and Source.",
			"Use workflow states deliberately: Backlog, Ready, In Progress, In Review, Done, and Canceled.",
			"Before marking an issue done, link the PR, preview deployment, docs path, or validation evidence that proves the work.",
			"If the requested issue is ambiguous, ask for the missing product decision before creating build work.",
		],
	},
	{
		name: "starter-operating-pack",
		path: ".agents/skills/starter-operating-pack/SKILL.md",
		description:
			"Use when inspecting or updating this Codebase's generated Program and ExecPlan operating pack.",
		steps: [
			"Read `docs/programs/PROGRAMS.md` and `docs/exec-plans/PLANS.md` before changing Program or ExecPlan files.",
			"Run `bun run agentic:check` before product implementation begins and after changing operating-pack files.",
			"Use the Program under `docs/programs/active/` for multi-slice product truth.",
			"Use the active ExecPlan under `docs/exec-plans/active/` for the next bounded implementation slice.",
			"Do not copy private planning archives from another repo into this Codebase.",
		],
	},
	{
		name: "starter-billing-setup",
		path: ".agents/skills/starter-billing-setup/SKILL.md",
		description:
			"Use when wiring Stripe for this Codebase after auth is stable. Preserve the shipped checkout and webhook contract until the paid handoff works end to end.",
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
			"Use after the Codebase is stable and the buyer is ready to shape the real product. Start with identity, homepage, and the first real customer-visible slice.",
		steps: [
			"Read `START-HERE.md` and confirm core setup, auth setup, billing setup, and verification are done first.",
			"Start by updating `apps/web/config/product.ts`.",
			"Prefer `$starter-product-copy`, `$starter-frontend-design`, and `$starter-docs-and-testing` as the first follow-on skills.",
			"Keep auth and billing contracts stable until the product already feels like the buyer's product.",
		],
	},
	{
		name: "starter-product-copy",
		path: ".agents/skills/starter-product-copy/SKILL.md",
		description:
			"Use when replacing generated product identity, homepage copy, CTA language, pricing copy, or positioning in this Codebase.",
		steps: [
			"Read `DESIGN.md`, `docs/facts/project-definition.json`, and `apps/web/config/product.ts` before editing copy.",
			"Keep claims aligned with the generated product facts until the buyer explicitly changes the product promise.",
			"Update visible copy and the nearby source of truth together when the product identity changes.",
			"Avoid changing auth, billing, or protected access behavior while doing copy work.",
		],
	},
	{
		name: "starter-frontend-design",
		path: ".agents/skills/starter-frontend-design/SKILL.md",
		description:
			"Use when changing user-facing UI, layout, styling, theming, or component presentation in this Codebase.",
		steps: [
			"Read root `DESIGN.md` before changing user-facing UI.",
			"Read `docs/facts/design-system.json` and `apps/web/config/generated-design-system.ts` for the machine-readable design snapshot.",
			"Preserve the shipped design tokens and component conventions unless the buyer explicitly asks to redesign them.",
			"Verify the changed UI with the smallest relevant test or browser check before handoff.",
		],
	},
	{
		name: "starter-docs-and-testing",
		path: ".agents/skills/starter-docs-and-testing/SKILL.md",
		description:
			"Use when documenting a change, choosing validation commands, or recording proof in this Codebase.",
		steps: [
			"Read `docs/build/docs/readiness.md`, `docs/build/docs/review.md`, and `docs/testing/README.md` before choosing validation.",
			"Run the narrowest relevant check first, then broaden to `bun run lint`, `bun run typecheck`, or `bun run build` when the changed surface requires it.",
			"Record what changed, validation results, assumptions, and requirement-to-evidence notes in `docs/build/docs/documentation.md` when the build contract changes.",
			"Keep proof notes concise and tied to observable user outcomes.",
		],
	},
	{
		name: "starter-nextjs-in-this-repo",
		path: ".agents/skills/starter-nextjs-in-this-repo/SKILL.md",
		description:
			"Use when editing Next.js code in this Codebase. Read the installed Next.js docs in node_modules before changing framework behavior.",
		steps: [
			"Read `AGENTS.md` first.",
			"Read the relevant guide in `node_modules/next/dist/docs/` before changing Next.js code.",
			"Treat the installed docs as the source of truth for this Codebase's Next.js version, not live upstream docs.",
		],
	},
	{
		name: "starter-convex-in-this-repo",
		path: ".agents/skills/starter-convex-in-this-repo/SKILL.md",
		description:
			"Use when editing Convex code in this Codebase. Read the generated Convex guidelines before changing functions, schema, or HTTP actions.",
		steps: [
			"Read `AGENTS.md` first.",
			"Read `apps/web/convex/_generated/ai/guidelines.md` before changing Convex code.",
			"Treat the generated Convex guidance as version-coupled to this Codebase's installed Convex setup.",
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

export function renderStarterSkillFiles(): RenderedCodebaseFile[] {
	return [
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
