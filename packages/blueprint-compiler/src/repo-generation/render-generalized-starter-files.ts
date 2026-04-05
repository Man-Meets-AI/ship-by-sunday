import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import type { RenderedBlueprintFile } from "../blueprints/render-types";

function renderAssistantGuide(
	title: "AGENTS.md" | "CLAUDE.md" | "GEMINI.md",
	productName: string,
	productSummary: string,
): RenderedBlueprintFile {
	return {
		path: title,
		content: [
			`# ${title}`,
			"",
			`This starter repo for ${productName} ships generated planning material under \`docs/\` plus the runnable app under \`apps/web\`.`,
			"",
			productSummary,
			"",
			"## Start Here",
			"",
			"- Read `README.md`, then open `docs/README.md` and `docs/facts/project-definition.json`.",
			"- Use `bun` for JavaScript work and `uv` for Python utilities.",
			"- Keep diffs scoped, rename vague identifiers, and separate UI rendering from stateful logic.",
			"- Treat `qa/` as the starter home for journey coverage and test notes.",
		].join("\n"),
	};
}

function renderQaPersonas(productName: string) {
	return JSON.stringify(
		[
			{
				id: "founder-operator",
				name: "Founder Operator",
				goal: `Turn ${productName} into a usable starter repo quickly.`,
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
): RenderedBlueprintFile[] {
	const { facts } = projectDefinition;
	const qaPersonas = renderQaPersonas(facts.product_name);

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
				"# Starter Skills\n\nUse this folder for reusable project-safe agent instructions and checklists.\n",
		},
		{
			path: ".github/workflows/examples/README.md",
			content: [
				"# Workflow Examples",
				"",
				"These files are safe starter examples. Copy one into `.github/workflows/` and adapt the secrets, branches, and deploy steps for your own environment before enabling it.",
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
				"      - run: bun install",
				"      - run: bun run lint",
				"      - run: bun run build",
			].join("\n"),
		},
		{
			path: "qa/README.md",
			content: [
				"# QA Starter Kit",
				"",
				"Use this folder to track the journeys, coverage, and test evidence that matter for your starter repo.",
				"",
				"- `journeys.csv` is the high-level user-path inventory.",
				"- `coverage.csv` is the current test and proof map.",
				"- `test-inventory.csv` is the concrete automated and manual test list.",
				"- `templates/run-report.md` is the report format for each QA pass.",
			].join("\n"),
		},
		{
			path: "qa/AGENTS.md",
			content: [
				"# QA AGENTS",
				"",
				"- Start with the journeys that reach the generated docs and the final blueprint.",
				"- Keep findings concrete, reproducible, and tied to an observable user outcome.",
				"- Update `coverage.csv` and `test-inventory.csv` whenever a new lane or gap appears.",
			].join("\n"),
		},
		{
			path: "qa/glossary.md",
			content: [
				"# QA Glossary",
				"",
				"- Journey: a user-facing path such as reaching Review and downloading the blueprint.",
				"- Coverage: the current proof that a journey or feature still works.",
				"- Run report: a dated summary of what was tested, what failed, and what still needs verification.",
			].join("\n"),
		},
		{
			path: "qa/personas.example.json",
			content: qaPersonas,
		},
		{
			path: "qa/personas.json",
			content: qaPersonas,
		},
		{
			path: "qa/templates/run-report.md",
			content: [
				"# QA Run Report",
				"",
				"## Scope",
				"",
				"- What changed",
				"- What user journeys were exercised",
				"",
				"## Evidence",
				"",
				"- Commands run",
				"- Screenshots or logs collected",
				"",
				"## Findings",
				"",
				"- Severity",
				"- Reproduction steps",
				"- Owner or follow-up",
			].join("\n"),
		},
		{
			path: "qa/journeys.csv",
			content: [
				"journey_id,journey_name,persona,goal,entry_point,success_signal",
				`review-download,Review and download blueprint,Founder Operator,Download the ${facts.product_name} blueprint,/review,Blueprint downloads and unzips cleanly`,
				"design-refinement,Review generated design docs,Design Partner,Use the generated design guidance to improve the UI,docs/design/AGENTS.md,Design changes are scoped and validated",
				"build-first-slice,Implement the first build slice,Implementation Partner,Turn docs/build/docs/prompt.md into code,docs/build/docs/prompt.md,The first user-visible outcome works locally",
			].join("\n"),
		},
		{
			path: "qa/coverage.csv",
			content: [
				"area,scenario,status,notes",
				"review-download,Blueprint contents preview,not-started,Verify the final zip structure and generated docs tree",
				"starter-setup,Environment template handoff,not-started,Verify .env.local.example and .env.production.example guidance",
				"first-build-slice,Build doc to implementation handoff,not-started,Validate the first slice from docs/build/docs/prompt.md",
			].join("\n"),
		},
		{
			path: "qa/test-inventory.csv",
			content: [
				"test_id,layer,area,scenario,status",
				"repo-download-zip,integration,review-download,Blueprint route returns a zip,pending",
				"review-page-copy,integration-ui,review-download,Review page explains the snapshot contents,pending",
				"build-doc-handoff,manual,first-build-slice,Engineer follows docs/build/docs/prompt.md,pending",
			].join("\n"),
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
