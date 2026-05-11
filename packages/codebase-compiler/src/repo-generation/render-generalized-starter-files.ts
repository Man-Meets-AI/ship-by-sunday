import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import type { RenderedCodebaseFile } from "../codebases/render-types";

function renderAssistantGuide(
	title: "AGENTS.md" | "CLAUDE.md" | "GEMINI.md",
	productName: string,
	productSummary: string,
): RenderedCodebaseFile {
	return {
		path: title,
		content: [
			`# ${title}`,
			"",
			`This generated Codebase for ${productName} ships planning material under \`docs/\` plus the runnable app under \`apps/web\`.`,
			"",
			productSummary,
			"",
			"## Start Here",
			"",
			"- Read `README.md`, then open `DESIGN.md`, `docs/index.md`, and `docs/facts/project-definition.json`.",
			"- For product build work, read `docs/build/docs/agent-handoff.md` first, then `docs/build/AGENTS.md`, `docs/build/docs/readiness.md`, `docs/build/docs/prompt.md`, `docs/build/docs/plans.md`, `docs/build/docs/implement.md`, and `docs/build/docs/review.md` before editing code.",
			"- Treat `DESIGN.md` as the visual source of truth before changing layout, styling, theming, motion, or component presentation.",
			"- Treat `docs/facts/project-definition.json` and `docs/build/docs/prompt.md` as the customer build contract; do not build from chat memory alone.",
			"- Treat `docs/programs/` as the multi-slice product memory and `docs/exec-plans/` as the active slice plan. Run `bun run agentic:check` after changing either one.",
			"- When using an AI coding or design tool, explicitly tell it to follow `DESIGN.md` and the generated design snapshot before it proposes UI changes.",
			"- Use `bun` for JavaScript work and `uv` for Python utilities.",
			"- Keep diffs scoped, rename vague identifiers, and separate UI rendering from stateful logic.",
			"- Treat `docs/testing/` as the Codebase home for verification notes.",
			"- Before final handoff, update `docs/build/docs/documentation.md` with what changed, validation results, assumptions, and a requirement-to-evidence checklist.",
		].join("\n"),
	};
}

function renderAppAssistantGuide(
	productName: string,
	productSummary: string,
): RenderedCodebaseFile {
	return {
		path: "apps/web/AGENTS.md",
		content: [
			"# apps/web/AGENTS.md",
			"",
			`This app for ${productName} ships with a generated root \`DESIGN.md\` plus generated planning material under \`docs/\`.`,
			"",
			productSummary,
			"",
			"## Start Here",
			"",
			"- Read root `DESIGN.md` before changing layout, styling, theming, motion, docs chrome, or component presentation.",
			"- Read root `docs/facts/project-definition.json`, `docs/build/docs/readiness.md`, and `docs/build/docs/prompt.md` before changing product behavior.",
			"- Use `docs/facts/design-system.json` and `apps/web/config/generated-design-system.ts` as the machine-readable design snapshot.",
			"- Preserve semantic tokens such as `background`, `foreground`, `primary`, `border`, and `sidebar-*` instead of hard-coding colors.",
			"- Keep the app UI aligned with the generated design system unless the user explicitly changes it.",
			"- When prompting an AI tool, name the screen goal and tell it to follow `DESIGN.md` rather than inventing a fresh visual style.",
			"- Keep UI rendering, route orchestration, domain logic, and provider I/O in separate files when a change touches more than one concern.",
		].join("\n"),
	};
}

function renderVerificationPersonas(productName: string) {
	return JSON.stringify(
		[
			{
				id: "founder-operator",
				name: "Founder Operator",
				goal: `Turn ${productName} into a usable Codebase quickly.`,
			},
			{
				id: "design-partner",
				name: "Design Partner",
				goal: "Review the generated design docs and refine the product surface.",
			},
			{
				id: "implementation-partner",
				name: "Implementation Partner",
				goal: "Take the first build slice from docs/build/docs/prompt.md to production code.",
			},
		],
		null,
		2,
	);
}

export function renderGeneralizedStarterFiles(
	projectDefinition: CanonicalProjectDefinition,
): RenderedCodebaseFile[] {
	const { facts } = projectDefinition;
	const verificationPersonas = renderVerificationPersonas(facts.product_name);

	return [
		renderAssistantGuide(
			"AGENTS.md",
			facts.product_name,
			facts.product_summary,
		),
		renderAssistantGuide(
			"CLAUDE.md",
			facts.product_name,
			facts.product_summary,
		),
		renderAssistantGuide(
			"GEMINI.md",
			facts.product_name,
			facts.product_summary,
		),
		renderAppAssistantGuide(facts.product_name, facts.product_summary),
		{
			path: ".agents/README.md",
			content: [
				"# .agents",
				"",
				"Use this folder for project-safe agent plans, references, and reusable working notes.",
				"",
				"- Keep customer-sensitive or secret material out of this folder.",
				"- Prefer short, task-specific plan files under `.agents/plans/`.",
				"- Put reusable process notes or starter skills under `.agents/skills/`.",
			].join("\n"),
		},
		{
			path: ".agents/plans/README.md",
			content:
				"# Agent Plans\n\nStore short execution plans here when work needs more than a single chat turn.\n",
		},
		{
			path: ".agents/skills/README.md",
			content:
				"# Codebase Skills\n\nUse this folder for reusable project-safe agent instructions and checklists.\n",
		},
		{
			path: ".github/workflows/examples/README.md",
			content: [
				"# Workflow Examples",
				"",
				"These files are safe Codebase examples. Copy one into `.github/workflows/` and adapt the secrets, branches, and deploy steps for your own environment before enabling it.",
			].join("\n"),
		},
		{
			path: ".github/workflows/examples/basic-ci.example.yml",
			content: [
				"name: Basic CI Example",
				"",
				"on:",
				"  pull_request:",
				"  workflow_dispatch:",
				"",
				"jobs:",
				"  checks:",
				"    runs-on: ubuntu-latest",
				"    steps:",
				"      - uses: actions/checkout@v4",
				"      - uses: oven-sh/setup-bun@v2",
				"      - run: bun ci",
				"      - run: bun run codebase:contract",
				"      - run: bun run agentic:check",
			].join("\n"),
		},
		{
			path: "docs/testing/README.md",
			content: [
				"# Testing",
				"",
				"Use this folder for lightweight verification notes that matter for your Codebase.",
				"",
				"- Keep the fastest repeatable checks in `README.md`.",
				"- Keep real test reports short and tied to observable user outcomes.",
				"- Prefer source-level tests and release workflow checks over spreadsheet bookkeeping.",
			].join("\n"),
		},
		{
			path: "docs/testing/run-report.md",
			content: [
				"# Verification Report",
				"",
				"## Scope",
				"",
				"- What changed",
				"- What user outcome was checked",
				"",
				"## Evidence",
				"",
				"- Commands run",
				"- Browser or log evidence collected",
				"",
				"## Findings",
				"",
				"- Pass, fail, or blocked",
				"- Reproduction steps for real failures",
			].join("\n"),
		},
		{
			path: "docs/testing/personas.example.json",
			content: verificationPersonas,
		},
		{
			path: "apps/web/.env.production.example",
			content: [
				"# Canonical production URL for hosted redirects and metadata.",
				"APP_BASE_URL=https://your-domain.example",
				"",
				"# Clerk",
				"NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=",
				"NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in",
				"CLERK_SECRET_KEY=",
				"CLERK_WEBHOOK_SIGNING_SECRET=",
				"CLERK_FRONTEND_API_URL=",
				"CLERK_AUTHORIZED_PARTIES=https://your-domain.example",
				"",
				"# Convex",
				"NEXT_PUBLIC_CONVEX_URL=",
				"NEXT_PUBLIC_CONVEX_SITE_URL=",
				"",
				"# Observability",
				"OBSERVABILITY_INGEST_TOKEN=",
				"OBSERVABILITY_INCIDENT_CONTROL_TOKEN=",
				"OBSERVABILITY_VERCEL_WEBHOOK_SECRET=",
				"TELEGRAM_BOT_TOKEN=",
				"TELEGRAM_CHAT_ID=",
				"",
				"# Stripe",
				"STRIPE_SECRET_KEY=",
				"STRIPE_WEBHOOK_SECRET=",
				"STRIPE_PRICE_ID=",
				"STRIPE_PRODUCT_ID=",
				"",
				"# Media and Codex integrations",
				"AUPHONIC_API_KEY=",
				"AUPHONIC_PRESET_ID=",
				"BUNNY_STREAM_API_KEY=",
				"BUNNY_STREAM_LIBRARY_ID=",
				"CODEX_BINARY=",
				"CODEX_APP_SERVER_ENABLED=false",
				"CODEX_APP_SERVER_HOME_ROOT=",
				"CODEX_APP_SERVER_MODEL=",
				"CODEX_APP_SERVER_TIMEOUT_MS=",
			].join("\n"),
		},
	];
}
